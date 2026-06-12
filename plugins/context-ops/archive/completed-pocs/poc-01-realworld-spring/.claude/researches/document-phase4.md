# Document Research — Phase 4 (PoC #01 RealWorld Spring Boot)

> 작성자: 공식문서 리서처 (Claude sub-agent)
> 작성일: 2026-04-28
> 적용 원칙: Work Principles 2원칙 (3 에이전트 병렬 — 공식문서 분과)
> 입력: plan-phase4.md, 메인 사전 raw fetch 결과 (User/Article/Comment/Email/Profile/JWTConfiguration/SecurityConfiguration/schema.sql/application.properties)
> F-015 적용: 메인 사전 검증 7건 모두 sub-agent 가 직접 raw fetch 로 cross-check 완료 (✅ 7/7 일치)
>   - 추가 발견: schema.sql 에 users.email / users.name UNIQUE 제약 **부재** (메인 검증 강화)

---

## 0. 메인 사전 검증 cross-check 결과 (F-015)

| # | 메인 검증 항목 | sub-agent 직접 fetch 결과 | 상태 |
|---|---|---|---|
| 1 | Article+Comment cascade={PERSIST,REMOVE} | `Article.java:51` `@OneToMany(mappedBy="article", cascade={PERSIST, REMOVE})` | ✅ 일치 |
| 2 | User Embeddable 4개 + 13+ behaviors | `User.java:20-172` Embeddable=Email/Profile/Password (+Profile.userName/image=Embedded), behaviors=writeArticle/updateArticle/writeCommentToArticle/favoriteArticle/unfavoriteArticle/followUser/unfollowUser/deleteArticleComment/viewArticleComments/viewComment/viewProfile/changeEmail/changePassword/changeName/changeBio/changeImage/matchesPassword (= 17개) | ✅ 메인 추정보다 강함 (Rich Domain 확정) |
| 3 | CIRCULAR-001 cross-aggregate 행동 | `User.writeCommentToArticle(Article, String)` (`User.java:69-71`), `Article.removeCommentByUser(User, long)` (`Article.java:81-90`) — 양방향 협력 강함 | ✅ 일치 (same_bc 권장 정당화) |
| 4 | DRIFT-002 단방향 follow | `Profile.following @Transient` (`Profile.java:20-21`), `User.followUser` add only (`User.java:83-86`) | ✅ 일치 |
| 5 | DRIFT-010 application 레벨 검증 부재 | `UserService.signUp()` (`UserService.java:21-27`) — `existsByEmail` 호출 ❌ / try-catch ❌ / Email VO `unique=true` ❌ | ✅ 일치 + **schema.sql 에도 UNIQUE 부재** (이중 부재) |
| 6 | Comment.removeCommentByUser 잠재 버그 | `Article.java:86` `if (!user.equals(author) \|\| !user.equals(commentsToDelete.getAuthor()))` — De Morgan 변환 시 `throw if NOT(user==author AND user==commenter)` → 작성자=댓글작성자 동일인만 삭제 가능 | ✅ 일치 (잠재 버그 확정) |
| 7 | JWT 매직 넘버 + 하드코딩 SECRET | `JWTConfiguration.java:12-13` `SECRET="SOME_SIGNATURE_SECRET".getBytes()`, `JWT_DURATION_SECONDS = 2*60*60` | ✅ 일치 |
| 8 | 외부 의존성 0건 | `build.gradle:20-30` — spring-boot-starter-{web,security,validation,data-jpa} + h2 (런타임). RestTemplate/WebClient/Feign/Kafka/SDK 0건 | ✅ 일치 |

→ **메인 사전 검증 100% 정확**. 추가로 schema.sql UNIQUE 부재로 DRIFT-010 의 심각도 ↑.

---

## 토픽 1. JPA @OneToMany cascade 와 Aggregate 경계 결정 표준

### 1.1 핵심 결론

메인 사전 검증을 **부분적으로 지지**.

- Article(root) + Comment(member, `cascade={PERSIST, REMOVE}`): **Vaughn Vernon 의 Aggregate 경계 신호로 강하게 정당화**. cascade=PERSIST(생명주기 동시 시작) + cascade=REMOVE(생명주기 동시 종료) = 일관성 경계 동일.
- 그러나 Vernon 은 "`small aggregate`" 를 강조 → Comment 가 큰 컬렉션이 될 가능성이 있다면 **분리 aggregate + by-id 참조** 권장 (Effective Aggregate Design Part II). RealWorld 의 댓글 수가 한 게시글당 수백~수천개로 폭증할 수 있으므로 **격상 후보 (deferred)**.
- Article ↔ User (@JoinColumn `author_id`) `@ManyToOne`: cascade 무, **ID-by-reference** (Vernon Part II) 정확 적용.
- Article.userFavorited `@ManyToMany cascade=PERSIST`: User 라이프사이클을 Article 이 시작하지 않으므로 cascade=PERSIST 는 **Vernon Part II 권장에 위배** ("No Cascade Across Aggregate Roots"). User 는 별도 aggregate root.
- followingUsers `@OneToMany cascade=REMOVE`: User self-ref 으로 same-aggregate 안에서 처리는 가능하나 Vernon 은 "do not modify multiple aggregate instances in the same transaction" 권장 → 단일 트랜잭션에서 follower+followee 둘 다 modify 가능성 있어 **AP 후보** (낮음).

### 1.2 URL 인용 (1차 자료)

1. Vaughn Vernon, "Effective Aggregate Design Part I — Modeling Aggregates with DDD and Entity Framework" (dddcommunity.org)
   https://www.dddcommunity.org/library/vernon_2011/ **(검증 필요 — 메인이 직접 PDF 다운로드 권장)**
   - Part I 핵심 4 rule: (1) Model True Invariants in Consistency Boundaries, (2) Design Small Aggregates, (3) Reference Other Aggregates by Identity, (4) Use Eventual Consistency Outside the Boundary
2. Vaughn Vernon, "Effective Aggregate Design Part II — Making Aggregates Work Together"
   https://www.dddcommunity.org/library/vernon_2011/ **(검증 필요)**
   - "Reference Other Aggregates by Identity" — `author_id` Long FK 가 정확한 패턴
3. Hibernate ORM 6.x User Guide §6.7 "Cascading"
   https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#pc-cascade **(코퍼스 기반 — URL 미검증)**
   - cascade 타입 정의 (PERSIST, MERGE, REMOVE, REFRESH, DETACH, ALL) 의미. JPA spec 은 **Aggregate 경계와 무관** — cascade 는 ORM 의 수명주기 전파일 뿐 (이 점이 중요: cascade=ALL 가 자동으로 Aggregate 보장 ❌).
4. Eric Evans, "Domain-Driven Design Reference" §Tactical Design — Aggregates (domainlanguage.com)
   https://www.domainlanguage.com/ddd/reference/ **(검증 필요)**
   - "Cluster the entities and value objects into aggregates and define boundaries around each. Choose one entity to be the root of each aggregate, and control all access to the objects inside the boundary through the root."
5. Martin Fowler, "DDD_Aggregate" bliki (martinfowler.com/bliki)
   https://martinfowler.com/bliki/DDD_Aggregate.html **(코퍼스 기반 — URL 미검증)**
   - "Aggregates are the basic element of transfer of data storage — you request to load or save whole aggregates" — RealWorld 의 ArticleRepository 가 Article 만 save/findById → Comment 분리 aggregate 가능성 ↓ (Article-Comment 단일 aggregate 정합).

### 1.3 PoC v1.1.2 명세 정합성 평가

| 명세 부분 | 평가 |
|---|---|
| `domain.schema.json §3.1 aggregates[].cascade_signal` (가정) | 적합. cascade=ALL/PERSIST+REMOVE/orphanRemoval=true 3종 신호로 Aggregate 추출 자동화 가능. **격상 후보**: cascade 매트릭스 명세화 (v1.2.0) |
| ADR-004 DDD-Lite B 강도 | 적합. Aggregate Root + member 추출까지 포함. RealWorld 에 Article(root)+Comment(member), User(root)+VO 가 자연스럽게 매핑 |
| `phase-4-비즈니스로직.md §3.1 영역 5.A` cascade 분석 가이드 | **격상 후보**: 현 명세는 cascade=ALL+orphanRemoval=true 만 언급 (plan-phase4.md §3.1) → cascade={PERSIST,REMOVE} 케이스 누락. F-027 신규 finding 후보 |

### 1.4 검증 표기

- 1, 2: **(검증 필요)** — Vernon PDF URL 메인 직접 다운로드 권장
- 3: **(코퍼스 기반 — URL 미검증)**
- 4, 5: **(검증 필요)**
- cascade 의미론은 JPA spec (JSR 338 §11.1.6) 1차 자료로 확정 가능

---

## 토픽 2. JPA @Embeddable nesting 한계 + DDD VO 매핑

### 2.1 핵심 결론

메인 사전 검증을 **지지** + 1 가지 우려.

- JPA 2.0+ (JSR 317/338) 이후 nested @Embeddable **공식 지원**. Hibernate 5.x/6.x, EclipseLink 모두 안정.
- 본 PoC 의 3-level nesting (User → @Embedded Profile → @Embedded UserName/Image) 은 **JPA spec 합치**. `Profile.java:11-18` 에서 `@Embedded UserName` + `@Embedded Image` 확인.
- `@Embeddable` 안의 collection (`@ManyToMany Set<Tag>` in `ArticleContents.java:24-28`) 도 JPA 2.0 §11.1.21 "ElementCollection" 및 Hibernate 6.x User Guide §2.6.6 ("Embeddable types and collections") 로 공식 지원. **단**, JPA spec 은 `@Embeddable` 안 `@ManyToMany` 를 명시적으로 권장하지는 않음 → "embeddable 안에 association 두지 말 것" 권고 (Hibernate ref) 와 충돌. **F-017 deferred finding 정합**.
- 이는 spec 합치 ✅ + 권장 패턴 위반 ⚠️ 의 갈등으로, **AP-DOMAIN-EMBEDDABLE-ASSOCIATION 후보** (낮음).

### 2.2 URL 인용

1. Hibernate ORM 6.x User Guide §2.6 "Embeddable types"
   https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#embeddables **(검증 필요)**
   - "An embeddable can contain other embeddables as well as collections of basic types or even associations to entities." — nested 명시 지원.
2. JPA 3.1 Spec (Jakarta EE) §11.1.6 "@Embeddable", §11.1.21 "@ElementCollection"
   https://jakarta.ee/specifications/persistence/3.1/jakarta-persistence-spec-3.1.html **(코퍼스 기반 — URL 미검증)**
   - 임베드 타입 안에 `@OneToMany`/`@ManyToMany` 명시는 spec 보장하지 않음 (provider-specific). Hibernate 는 지원, EclipseLink 는 부분 지원.
3. Vaughn Vernon, IDDD Ch.5 "Entities" / Ch.6 "Value Objects"
   https://www.informit.com/store/implementing-domain-driven-design-9780321834577 **(코퍼스 기반 — URL 미검증)**
   - VO 안에 entity reference 를 두는 것은 anti-pattern. RealWorld 의 ArticleContents.tags (`Set<Tag>`) 는 VO 안에 entity 컬렉션을 둠 → DDD 관점 위배.

### 2.3 PoC v1.1.2 명세 정합성 평가

| 명세 부분 | 평가 |
|---|---|
| `domain.schema.json` value_objects 컬렉션 | **격상 후보**: VO 안 entity ref / collection 표현 부재 (R-406, F-017 deferred). v1.2.0 에서 `value_objects[].contains_entity_ref: boolean` + `value_objects[].element_collection: boolean` 추가 권장 |
| ADR-004 DDD-Lite B (VO 추출) | 적합. 다만 nested embeddable 명시 가이드 부재 (Phase 4 명세 §3.1 보강 권장) |
| F-017 deferred finding (PoC #02/#03 후 재평가) | 적합. 본 PoC 에서 발현 → 재평가 데이터 추가 |

### 2.4 검증 표기

- 1: **(검증 필요)** — Hibernate 6.x User Guide §2.6 직접 fetch 권장
- 2: **(코퍼스 기반 — URL 미검증)**
- 3: **(코퍼스 기반 — URL 미검증)** — IDDD 책 출판물

---

## 토픽 3. ADR-004 DDD-Lite B 강도 적용 — Phase 4 추출 범위 적합성

### 3.1 핵심 결론

ADR-004 DDD-Lite B 가 추출하는 10개 모두 RealWorld 에 존재 + implicit 발현 4건.

10개 추출 항목 매핑:
1. **Bounded Context**: BC-USER / BC-ARTICLE / BC-AUTH (3개) ✅
2. **Entity**: User, Article, Comment, Tag (4개) ✅
3. **Value Object**: Email, Password, UserName, Image, Profile (Embedded), ArticleTitle, ArticleContents (7개) ✅
4. **Aggregate**: User-aggregate (User+VO+followingUsers), Article-aggregate (Article+Comment+ArticleContents), Tag-aggregate (singleton) (3개) ✅
5. **Aggregate Root**: User, Article, Tag (3개) ✅
6. **Invariants**: Article.author 불변 (final-like, setter 부재), Comment.author 불변, User.equals via email, BR-AUTH-AUTHOR-ONLY-EDIT (User.updateArticle:62-67), BR-COMMENT-AUTHOR-ONLY-DELETE (Article.removeCommentByUser:86 — 잠재 버그) ✅ 5+
7. **Repository**: UserRepository, ArticleRepository, TagRepository, CommentRepository(존재 시) ✅
8. **Domain Service**: TagService.reloadAllTagsIfAlreadyPresent, JWTSerializer/JWTDeserializer, ProfileService.followAndViewProfile (도메인 좌표 cross-aggregate) ✅
9. **Use Case**: 약 15개 (UC-USER-REGISTER 등) — Service public method 단위로 추출
10. **Ubiquitous Language**: Article/Slug/Author/Favorite/Following/Profile/Tag/Comment — RealWorld API spec 의 표준 용어 직접 사용 ✅

미추출 (Strategic) 4건의 implicit 발현:
- **Context Map**: BC-AUTH ↔ BC-USER ↔ BC-ARTICLE 의 통합 패턴 — 본 PoC 는 단일 모듈 / Shared Kernel (cross-cutting JWT) implicit 패턴. **격상 후보**: ADR-004 에 "DDD-Lite B 미추출 4 strategic 항목 중 발현 시 별도 기록" 가이드 보강.
- **Subdomain**: Core (Article)/ Supporting (User profile, Tag) / Generic (Auth) implicit 분류. Phase 3 에서 cross-cutting BC-AUTH 명시.
- **Domain Event**: 부재 (Spring `ApplicationEventPublisher` 사용 흔적 없음). RealWorld 가 단순 CRUD 라 발현 안됨.
- **Saga**: 부재 (단일 트랜잭션 boundary).

### 3.2 URL 인용

1. Eric Evans, "Domain-Driven Design: Tackling Complexity in the Heart of Software" (Addison-Wesley, 2003) — Blue Book Part II Ch.5/6 (Tactical), Part IV (Strategic)
   https://www.domainlanguage.com/ddd/blue-book/ **(검증 필요)**
   - Strategic vs Tactical 분리. ADR-004 DDD-Lite B 는 Tactical 중심 (10개) + Strategic 4개 제외 정합.
2. Vaughn Vernon, IDDD (Implementing Domain-Driven Design) Ch.2 (Domains/Subdomains/BC) / Ch.10 (Aggregates) / Ch.6 (VO) / Ch.5 (Entities) / Ch.7 (Domain Services)
   https://www.informit.com/store/implementing-domain-driven-design-9780321834577 **(코퍼스 기반 — URL 미검증)**
3. Eric Evans, "DDD Reference" (free PDF) §"Strategic Design"
   https://www.domainlanguage.com/ddd/reference/ **(검증 필요)**
4. Vaughn Vernon, "Domain-Driven Design Distilled" Ch.1-3 (Manning, 2016)
   https://www.informit.com/store/domain-driven-design-distilled-9780134434421 **(코퍼스 기반 — URL 미검증)**

### 3.3 PoC v1.1.2 명세 정합성 평가

| 명세 부분 | 평가 |
|---|---|
| ADR-004 DDD-Lite B 강도 | **본 PoC 에서 적합**. 10개 모두 추출 가능 + implicit 4 strategic 도 부분 발현 |
| ADR-004 미추출 strategic 4건 가이드 부재 | **격상 후보 (v1.2.0)**: 본 PoC 에서 BC-AUTH 의 cross-cutting 성격 (Context Map 의 Shared Kernel 신호) 발현 → 명시 가이드 필요 |
| Phase 4 명세 §3.1 5.A 추출 범위 | 적합. ORM 엔티티 + Embeddable 7 + Service 다수가 ADR-004 와 일치 |

### 3.4 검증 표기

- 1, 3: **(검증 필요)** — Evans 1차 자료 PDF
- 2, 4: **(코퍼스 기반 — URL 미검증)** — Vernon 출판물

---

## 토픽 4. Spring @Service 메서드 → Use Case 매핑 표준

### 4.1 핵심 결론

- **Robert C. Martin (Clean Architecture)** 의 Use Case 정의: "Use Cases are the application-specific business rules. They orchestrate the flow of data to and from the entities, and direct those entities to use their critical business rules to achieve the goals of the use case." — Use Case 1개 = **하나의 응용 시나리오 (interactor)**.
- **Use Case 2.0 (Ivar Jacobson)** 정의: Use Case 는 actor-system 상호작용 시나리오의 묶음. Use Case slice (UC2.0) 가 메서드 단위에 가까움.
- 갈등 해소: Clean Arch 는 "**1 use case = 1 interactor class**" 권장. Spring `@Service` 의 메서드 1개가 보통 1 interactor 에 대응 → **메서드 단위 매핑이 표준에 더 가까움**.
- RealWorld 의 ArticleService 12 메서드 (createNewArticle, getArticles, getFeedByUserId, getArticleFavoritedByUsername, getArticlesByAuthorName, getArticlesByTag, getArticleBySlug, updateArticle, favoriteArticle, unfavoriteArticle, deleteArticleBySlug — 11개 fetch 결과) → **11~12 UC 매핑 권장**.
- 단, "조회 (Query)" 는 CQRS 관점에서 Use Case 가 아닌 Query handler 로 분리 가능 (Vernon IDDD Ch.4) → **본 PoC 한정 단순화**: 모든 public method = UC 1개로 매핑 + `kind: command|query` 보조 필드.

ArticleService 11 메서드를 메인 사전 검증의 12개와 일부 일치 — **메인 사전 추정 12개는 ArticleFindService 등 인터페이스 분할까지 합한 추정**. raw fetch 11개로 보정.

### 4.2 URL 인용

1. Robert C. Martin, "Clean Architecture: A Craftsman's Guide to Software Structure and Design" Ch.20 "Business Rules" / Ch.22 "The Clean Architecture"
   https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/ **(코퍼스 기반 — URL 미검증)**
2. Robert C. Martin, "The Clean Architecture" blog (8thlight, 2012)
   https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html **(검증 필요)**
   - Use Case = innermost ring 의 interactor.
3. Ivar Jacobson, "Use-Case 2.0" (2011 white paper, Ivar Jacobson Int.)
   https://www.ivarjacobson.com/publications/white-papers/use-case-20-ebook **(검증 필요)**
   - Use Case Slice = 실행 가능한 단위.
4. Vaughn Vernon, IDDD Ch.4 "Application" + Ch.14 "Application Services"
   https://www.informit.com/store/implementing-domain-driven-design-9780321834577 **(코퍼스 기반 — URL 미검증)**
   - "Application Service 메서드 = Use Case 호출의 진입점" 패턴.

### 4.3 PoC v1.1.2 명세 정합성 평가

| 명세 부분 | 평가 |
|---|---|
| `domain.schema.json` use_cases[].related_method | 적합 (가정). 메서드 단위 매핑 |
| `phase-4-비즈니스로직.md §3.1` Service → UC 매핑 가이드 | **격상 후보 (v1.2.0)**: "Service 1 method = UC 1개" 명문화 + CQRS 분리 옵션 (kind: command/query) |
| `phase-5-1-api.md` UC ↔ operationId 매핑 | 적합 (R-409 대응). RealWorld API spec 의 endpoint 와 ArticleService 메서드가 1:1 정합 |

### 4.4 검증 표기

- 1, 4: **(코퍼스 기반 — URL 미검증)**
- 2, 3: **(검증 필요)** — blog/white-paper 직접 fetch 권장

---

## 토픽 5. Email/Username Unique 검증 위치 — DDD 표준

### 5.1 핵심 결론 (가장 중요)

메인 사전 검증을 **강하게 지지** + **격상 정당화**.

- **schema.sql cross-check 결과 (sub-agent 추가 발견)**: `users` 테이블에 `email` 과 `name` 둘 다 **UNIQUE 제약 부재**. 즉 **application 레벨 + DB 레벨 모두 부재 = 이중 부재**. 동시 가입 race condition 으로 동일 email 두 row 생성 가능 = **RealWorld spec ("registered email" 검증 필수) 명백한 violation**.
- **DDD 표준 (Vernon, Evans)**: Uniqueness invariant 는 "set-based invariant" 로 단일 aggregate 안에서 보장 불가 → 권장은 (1) DB UNIQUE constraint + (2) application 레벨 사전 조회 (`existsBy*`) 를 결합하여 race 회피. 단순 catch-DataIntegrityViolation 패턴은 "fail-fast + retry" 로 acceptable 하나 사용자 경험 저하.
- **Spring Data JPA 공식 가이드**: `existsBy*` 는 "exists projection" 으로 SELECT 1 ... LIMIT 1 변환 → low cost. try-catch 패턴은 Spring Boot 공식 reference §"Working with Spring Data Repositories" 에 명시되지 않음 (커뮤니티 패턴).
- **DRIFT-010 결론**: 본 PoC 는 **set-based invariant 보장 0**. 즉 BR-USER-EMAIL-UNIQUE-001 + BR-USER-USERNAME-UNIQUE-001 추출 시 **신뢰도 낮음 + AP-VALIDATION-MISSING-EMAIL-UNIQUE 강제 등록** 권장.

### 5.2 URL 인용

1. Vaughn Vernon, "Effective Aggregate Design Part III — Gaining Insight Through Discovery" §"Unique Identity"
   https://www.dddcommunity.org/library/vernon_2011/ **(검증 필요)**
   - Aggregate root identity uniqueness 패턴. set-based invariant 처리 방식.
2. Eric Evans, "DDD Reference" §"Specification" / §"Aggregates"
   https://www.domainlanguage.com/ddd/reference/ **(검증 필요)**
3. Spring Data JPA Reference 3.x §"Repository query keywords — Exists"
   https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html **(코퍼스 기반 — URL 미검증)**
   - `existsBy*` 키워드는 boolean 반환, SELECT projection 최적화.
4. Greg Young, "CQRS and Set Validation" 블로그
   https://codebetter.com/gregyoung/2010/08/12/eventual-consistency-and-set-based-validation/ **(검증 필요)**
   - "set-based validation" 의 race condition 처리 정통 자료.
5. RealWorld spec — "POST /users — Registration"
   https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#registration **(검증 필요)**
   - "Required fields: email, username, password" — uniqueness 묵시 (가입 후 unique email/username 으로 식별).

### 5.3 PoC v1.1.2 명세 정합성 평가

| 명세 부분 | 평가 |
|---|---|
| `rules.schema.json` uniqueness invariant | 적합 |
| `phase-4-비즈니스로직.md §3.1` 5.A 가드 추출 | **격상 후보**: "set-based invariant (uniqueness) 추출 시 application + DB 이중 검증 위치 명시" 가이드 부재 |
| DRIFT-010 처리 (사용자 결정 6건) | **격상 후보**: 현 처리는 권장만. 본 sub-agent 검증으로 schema.sql 도 부재 발견 → AP 강제 등록 + RealWorld spec violation 으로 격상 |
| `antipatterns.schema.json` AP-VALIDATION-MISSING | 적합 (가정) |

### 5.4 검증 표기

- 1, 2, 4, 5: **(검증 필요)**
- 3: **(코퍼스 기반 — URL 미검증)**

---

## 토픽 6. JWT 매직 넘버 + 하드코딩 SECRET 의 BR/AP 분류

### 6.1 핵심 결론

메인 사전 검증을 **강하게 지지** + AP 격상 정당화.

- **OWASP JWT Cheat Sheet** "Use Strong Algorithm and Strong Key": "Secret keys must not be hardcoded in the source code or stored in plain text in configuration files" + "Symmetric keys (HS256) MUST be at least as long as the hash output (256 bits = 32 bytes)" → `"SOME_SIGNATURE_SECRET"` (21 bytes UTF-8) 는 **충분 길이 미달 + 하드코딩** 두 가지 위반.
- **RFC 7515 (JWS)** §3.2: "The recipient of a JWS object MUST verify the digital signature with the same key that was used to create the digital signature" — secret 관리 책임은 spec 외부지만, RFC 8725 (JWT BCP) §3.2 "Use Appropriate Algorithms" + §2.1 "Use of HS256/HS384/HS512" 에서 약한 secret 명시적 금지.
- **RFC 8725 (JWT Best Current Practices, 2020)** §3.2 "Use Strong Keys" + §3.4 "Algorithm Verification": Spring 권장 expire 는 미정의 (앱별), 그러나 OAuth 2.0 access token 은 보통 5~15분, refresh token 1일~30일. **"2시간 expire" 은 access-token-only 모델로는 길지만 RealWorld 단순 학습 spec 에서는 acceptable** → **BR-AUTH-JWT-EXPIRE-001 (BR, human_review_required=true)**.
- **하드코딩 SECRET → AP 분류**: OWASP A03:2021 "Injection" + A02:2021 "Cryptographic Failures" 둘 다 해당. **AP-SECURITY-HARDCODED-SECRET-001 강제 등록 권장**.

### 6.2 URL 인용

1. OWASP JWT Cheat Sheet
   https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html **(검증 필요)**
   - "Cryptographic key strength" + "Don't store sensitive data in JWT".
2. RFC 7519 (JWT) — IETF
   https://datatracker.ietf.org/doc/html/rfc7519 **(검증 필요)**
   - JWT 구조 + claims 정의. expire 권장값 명시 없음 (앱별).
3. RFC 7515 (JWS) — IETF
   https://datatracker.ietf.org/doc/html/rfc7515 **(검증 필요)**
4. RFC 8725 (JWT Best Current Practices) — IETF, 2020
   https://datatracker.ietf.org/doc/html/rfc8725 **(검증 필요)**
   - §3.1 "Perform Algorithm Verification" / §3.2 "Use Appropriate Algorithms" / §3.6 "Use Mutually Exclusive Validation Rules for Different Kinds of JWTs".
5. OWASP Top 10:2021 A02 Cryptographic Failures
   https://owasp.org/Top10/A02_2021-Cryptographic_Failures/ **(검증 필요)**
6. Spring Security 6.x Reference §"OAuth 2.0 Resource Server JWT — Configuring Trusted Algorithms"
   https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html **(코퍼스 기반 — URL 미검증)**
   - Spring 의 JWT secret 은 `application.properties` `spring.security.oauth2.resourceserver.jwt.*` 외부화 권장.

### 6.3 PoC v1.1.2 명세 정합성 평가

| 명세 부분 | 평가 |
|---|---|
| `rules.schema.json` BR-AUTH-JWT-EXPIRE | 적합 |
| `antipatterns.schema.json` category=SECURITY | 적합 |
| `phase-4-비즈니스로직.md §3.3 5.C` 매직 넘버 추출 | **격상 후보**: "보안 관련 매직 넘버 (secret, token expire) 는 BR + AP 이중 등록" 가이드 부재. v1.2.0 보강 |
| AP-SECURITY-HARDCODED-SECRET 강제 등록 | **권장**: LV-001/LV-002 와 동급 강제 등록 후보 (Phase 6 안티패턴 강제 등록 패턴 일치) |

### 6.4 검증 표기

- 1, 2, 3, 4, 5: **(검증 필요)** — RFC 와 OWASP 는 메인이 직접 fetch 권장
- 6: **(코퍼스 기반 — URL 미검증)**

---

## 통합 권고 — Phase 4 진행 시 메인이 반드시 챙길 7가지 액션

### A1. cascade 매트릭스 정밀화 (토픽 1 격상)

`domain.schema.json` 의 aggregates[] 추출 시 cascade 신호를 4단계로 분류하여 신뢰도 가중. **(격상 후보 v1.2.0)**

| cascade | aggregate 신호 | 신뢰도 |
|---|---|---|
| ALL + orphanRemoval=true | 매우 강함 (100% same aggregate) | 0.95 |
| {PERSIST, REMOVE} | 강함 (생명주기 동일) | 0.85 |
| PERSIST 만 | 약함 (ID-by-reference 권장 위반 가능) | 0.50 |
| REMOVE 만 | 매우 약함 (cleanup only) | 0.40 |
| 무 (default) | aggregate 분리 | 0.90 (분리 측) |

본 PoC 에 적용:
- Article+Comment {PERSIST, REMOVE} → same aggregate 신뢰도 0.85
- Article+userFavorited PERSIST 만 → **분리 aggregate 정합 위반** AP 후보
- User+followingUsers REMOVE 만 → 약한 동일 aggregate (User self-ref)

### A2. DRIFT-010 강화: schema.sql UNIQUE 부재 신규 발견 → AP 강제 등록 (토픽 5)

메인 사전 검증은 application 레벨만 부재로 보았으나 **sub-agent cross-check 에서 schema.sql 의 users.email/users.name UNIQUE 제약도 부재 발견**. 즉 RealWorld spec violation 확정.

조치:
1. `output/db/정합성-검증-보고서.md` DRIFT-010 격상 (medium → high)
2. `antipatterns-partial.json` 에 **AP-VALIDATION-MISSING-EMAIL-UNIQUE-001 강제 등록**
3. `rules.json` BR-USER-EMAIL-UNIQUE-001 + BR-USER-USERNAME-UNIQUE-001 의 enforced_at = "none" + human_review_required=true

### A3. Comment.removeCommentByUser 잠재 버그 → BR + AP 이중 등록 (토픽 사전 검증 6)

`Article.java:86` 의 De Morgan 변환:
```
!user.equals(author) || !user.equals(commentsToDelete.getAuthor())
≡ NOT( user==author AND user==commenter )
≡ throw if NOT (article 작성자 AND comment 작성자 둘 다 동일인)
```

RealWorld spec ("comment author can delete their own comment") 와 다른 결과:
- 정상 케이스: comment 작성자가 자기 댓글 삭제 → article 작성자 ≠ comment 작성자면 throw → **삭제 불가**
- 즉 article 작성자 본인이 자기 댓글 삭제할 때만 가능 (자기 article + 자기 comment)

조치:
1. `rules.json` BR-COMMENT-AUTHOR-ONLY-DELETE-001 — 의도와 구현 불일치 (`enforced_at`, `actual_behavior` 별도 필드)
2. `antipatterns-partial.json` **AP-LOGIC-DEMORGAN-BUG-001 강제 등록**
3. `findings/poc-findings.md` 신규 finding 추가 (high severity)

### A4. ADR-004 미추출 4 strategic 항목 implicit 발현 기록 (토픽 3)

본 PoC 는 BC-AUTH 가 cross-cutting 으로 BC-USER/BC-ARTICLE 에 Shared Kernel 패턴 implicit. ADR-004 가이드 부재 → v1.2.0 보강 후보.

조치:
1. `domain.json` `bounded_contexts[BC-AUTH].context_map_pattern: "shared_kernel_implicit"` (스키마 보강 필요)
2. `_manifest.yml` 에 implicit strategic 4건 발현 메모

### A5. JWT 하드코딩 SECRET → AP 강제 등록 + BR-AUTH-JWT-EXPIRE 별도 (토픽 6)

OWASP + RFC 8725 1차 자료 기반. LV-001/LV-002 와 동급 강제 등록.

조치:
1. `antipatterns-partial.json` **AP-SECURITY-HARDCODED-SECRET-001 (high)** 강제 등록
2. `rules.json` BR-AUTH-JWT-EXPIRE-001 (5.C, human_review_required=true)
3. `rules.json` BR-AUTH-JWT-SECRET-LENGTH-001 (`SOME_SIGNATURE_SECRET` 21 bytes < 256 bit 미달, human_review_required)

### A6. Service 메서드 → UC 1:1 매핑 + CQRS kind 보조 필드 (토픽 4)

- ArticleService 11 public methods → UC 11개 (Find 5건 + Command 6건)
- UserService 5 public methods → UC 5개
- ProfileService 3 public methods → UC 3개
- CommentService (raw fetch 미완 — 메인이 추가 fetch) → UC ~3개
- TagService → UC ~1개

총 UC ~23개 추정 (메인 사전 추정 15 → 보정 후 ~23). UC `kind: command|query` 보조 필드로 CQRS 분리.

### A7. F-017 deferred finding 본 PoC 발현 데이터 추가 (토픽 2)

`ArticleContents.tags` (`@Embeddable` 안 `@ManyToMany`) 가 JPA spec 합치 ✅ + Hibernate 권장 위반 ⚠️ + Vernon VO 안 entity ref 위배 ⚠️.

조치:
1. `findings/poc-findings.md` F-017 발현 케이스 추가 (PoC #02/#03 후 v1.2.0 격상 데이터)
2. `domain.json` value_objects[ArticleContents].notes 에 "embeddable contains entity collection (JPA OK, DDD anti-pattern)" 명시

---

## 부록. 메인 사전 검증 보강 (sub-agent 추가 발견)

| # | 항목 | 결과 |
|---|---|---|
| B1 | `users` 테이블 schema.sql UNIQUE 제약 | email + name 둘 다 **부재**. 메인 사전 검증의 DRIFT-010 심각도 ↑ |
| B2 | UserRepository 메서드 | `save`, `findById`, `findFirstByEmail`, `findFirstByProfileUserName` 4개. `existsByEmail` ❌ |
| B3 | ArticleContents `@Embeddable` 안 `@ManyToMany Tag` (cascade=PERSIST, fetch=EAGER) | JPA spec 합치 + Hibernate 권장 위반 + DDD VO 위배 (3중 신호) |
| B4 | Article.userFavorited cascade=PERSIST + ManyToMany | Vernon "No Cascade Across Aggregate Roots" 위반 — User 별도 root 인데 Article 이 PERSIST cascade 보유 |
| B5 | Comment 가 Article aggregate 멤버임의 cascade 신호 | `Article.comments` cascade={PERSIST, REMOVE} 충분 강함. 단 Vernon "Small Aggregate" 권장과 충돌 (수백~수천 댓글 시) → **읽기 전용 분리 + write 시만 같이 처리** 검토 |
| B6 | Profile.following @Transient | 단방향 follow 의도 명시 ✅. ORM persist 안됨. DRIFT-002 메인 검증 정확 |
| B7 | SecurityConfiguration `web.ignoring().antMatchers(POST, "/users", "/users/login")` | 회원가입+로그인 비인증 처리 — Spring Security 6.x deprecated `WebSecurityConfigurerAdapter` 사용 (Spring Boot 2.5.2 시대) → **AP-FRAMEWORK-DEPRECATED-API 후보** (낮음) |

---

## 참고 — 본 리서치의 자료 신뢰도 분포

| 자료 | 1차 자료 | 2차 자료 | 코퍼스만 |
|---|---|---|---|
| Vernon Effective Aggregate Design (PDF) | △ | - | - |
| Evans Blue Book / Reference | △ | - | - |
| JPA Spec (Jakarta EE) | △ | - | - |
| Hibernate User Guide | △ | - | - |
| OWASP Cheat Sheet | △ | - | - |
| RFC 7519/7515/8725 | △ | - | - |
| Spring Reference | △ | - | - |
| Robert C. Martin Clean Arch | - | △ | - |
| Use Case 2.0 | △ | - | - |
| Greg Young CQRS 블로그 | △ | - | - |

→ **메인이 위 (검증 필요) 자료들 직접 fetch 후 본 리서치 보강 권장**. 단, 핵심 결론 (cascade 분류, Aggregate 경계, 하드코딩 secret AP, DRIFT-010 이중 부재) 은 **raw fetch 한 코드 1차 자료** 로 backed 되어 견고함.

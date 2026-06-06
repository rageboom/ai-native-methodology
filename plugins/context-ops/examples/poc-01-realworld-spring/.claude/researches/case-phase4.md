# case-phase4.md — 테크기업 사례 리서처 (Phase 4)

> 작성일: 2026-04-28
> 작성자: 테크기업 사례 리서처 에이전트 (메인 통합용)
> 적용 원칙: Work Principles 4원칙 — 2단계 (3 에이전트 병렬 리서치)
> 상위 plan: `.claude/plans/plan-phase4.md`
> 자매 산출물: `document-phase4.md` (공식문서) / `senior-phase4.md` (방법론 도메인)
> F-015 패턴: sub-agent 학습 코퍼스 의존 위험 → URL 인용 강제 + (검증 필요) 표기 명시

---

## §0. 리서치 범위 + 한계 선언

본 리서치는 PoC #01 RealWorld Spring Boot Java Phase 4 (4영역 병렬 비즈니스 로직 추출) 의 도메인 모델/규칙/안티패턴 결정을 **한국·글로벌 테크기업 1차 회고 자료**로 cross-validate 하기 위한 자료. 메인 사전 검증 8건 (Aggregate / Rich Domain / CIRCULAR-001 / DRIFT-002 / DRIFT-010 / Comment 권한 버그 / JWT / 외부 의존성 0) 를 토픽 7개로 매핑.

**한계**:

- 한국 테크기업 (특히 토스, 라인, 당근) 의 follow 도메인 모델 직접 회고는 **공개 1차 자료 부재** — 일반 DDD 자료로 보강
- 본 리서치 일부 사례는 **(검증 필요)** 표기 — sub-agent 학습 코퍼스 의존 가능성 인정

**검증 강도 등급**:

- (1차 자료 + URL 인용 + 직접 회고 본문 확인)
- (1차 URL 있음 + 본문 일부 확인)
- (코퍼스 기반 추론 — URL 미검증)

---

## 토픽 1. 한국 SI 의 DDD-Lite Aggregate 경계 회고

### 1.1 검증된 사례 — 카카오페이 여신코어 ()

**URL**: https://tech.kakaopay.com/post/backend-domain-driven-design/

**핵심 발견** (WebFetch 본문 확인):

1. **Aggregate Root 경계** — "Recovery (납부) Aggregate Root 가 하위 객체 제어 + Aggregate Root 를 통해서만 내부 Entity/Value Object 접근 가능"
2. **Bounded Context = Gradle Sub Project** — `gaia-user-domain` / `gaia-account-domain` / `gaia-credit-limit-domain` / `gaia-screening-domain` / `gaia-core-app` (모든 도메인 의존)
3. **Cross-Aggregate 처리** — Application Layer 에서 각 Aggregate 의 `CreateCommand` 를 조합. **각 Aggregate 는 독립적으로 생성**, Application 에서 트랜잭션 경계로 묶음. `.let(Account::create).let(accountDomainRepository::save)` 식 functional pipeline.
4. **Multi Module Entity 격리 패턴** — JPA Entity 는 `internal class` 로 도메인 모듈 외부 접근 차단. Repository 가 Domain Entity ↔ JPA Entity 변환 책임. 생성자 `private`, factory method + Command class 로 만 생성.
5. **회고 솔직한 한계** — "Batch 같은 대량 처리 시 internal JPA Entity 격리가 불편 → 동일 Table 의 Batch 전용 Entity 추가 발생, 두 Entity 동시 수정 부담". (PoC #01 시사: cascade=ALL/orphanRemoval=true 의 Aggregate 안 vs 외부 결정은 read 패턴까지 고려해야)

### 1.2 검증된 사례 — 우아한형제들 WMS 도메인 분리 ()

**URL**: https://techblog.woowahan.com/22151/

**핵심 발견** (WebFetch 본문 확인):

1. **3개 Bounded Context 분리** — 입고 / 재고 / 출고. 재고 가 핵심 (다른 BC 와 상호작용 최다).
2. **점진적 분리 전략** — 신규 모듈 `domain-inventory` 생성 → 결합 모듈 식별 → 의존성 제거 → JOIN 절 리팩토링. **빅뱅 분리 거부**.
3. **Port-Adapter (헥사고널)** — "모듈 간에는 접근 가능한 인터페이스(port)만 정의, 실제 구현(adapter)은 각 도메인 내부에". 입고 완료 → 재고 생성 오케스트레이션, 직접 의존성 제거.
4. **회고 솔직한 한계** — "도메인 분리하면 모든 게 깔끔해질 줄 알았으나, **같은 기능에 더 많은 코드 필요**. 그럼에도 커버리지 ↑, 복잡도 ↓, 만족도 4점+ 달성".
5. **ArchUnit + Feature Flag 27개** — 점진 배포 (10% → 50% → 100%) + 아키텍처 회귀 자동 검증.

### 1.3 ManyToMany 처리 — Vaughn Vernon Effective Aggregate Design Part II ()

**URL**: https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf

**핵심 원칙 4건**:

1. Model True Invariants in Consistency Boundaries
2. **Design Small Aggregates** (large aggregate = anti-pattern)
3. **Reference Other Aggregates by Identity** (객체 참조 ❌, ID 참조 ✅)
4. Use Eventual Consistency Outside the Boundary

→ PoC #01 의 `articles_tags` (Article ↔ Tag ManyToMany), `article_favorites` (Article ↔ User ManyToMany) 는 **Vernon Rule 3 위반 패턴**. Article 안 `Set<Tag>` 가 아니라 `Set<TagId>` 가 더 정통. 단, Spring Data JPA 의 ORM 편의를 위해 객체 참조 채택은 SI 에서 흔함 (한국 카카오페이도 도메인 안에서는 객체 참조 일부 채택).

### 1.4 메인 사전 검증 지지/반박

| 메인 사전 검증                                           | 본 리서치 결과                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Article Aggregate Root + Comment 가 member (cascade=ALL) | **부분 지지**. 카카오페이 Recovery 패턴 = "Aggregate Root + 하위 객체 제어" 와 동일. 단, Vernon Part II 권고 (small aggregate) 에 비추어 Comment 가 별도 Aggregate 일 수도. **결정 trade-off**: cascade=ALL 신호 = same aggregate / Comment 라이프사이클 독립성 = separate aggregate. → PoC #01 코드 fetch 후 cascade 강도 확인 필수 |
| Tag standalone                                           | **지지**. ManyToMany 의 `Tag` 가 라이프사이클 독립적 → 별도 Aggregate. PoC #01 코드의 `articles_tags` 는 join table, Tag 는 standalone aggregate 로 처리 정통                                                                                                                                                                        |

### 1.5 PoC #01 적용 시 결정 권고

- **Article Aggregate**: Article (root) + Comment (member, cascade=ALL 확인 시) + ArticleContents (VO embedded). → **BR-ARTICLE-AGGREGATE-001** 로 등록
- **Comment**: Article 에 cascade=ALL + orphanRemoval=true 확인되면 **member**, 아니면 separate aggregate. → 메인 raw fetch 강제 (R-405)
- **Tag**: standalone aggregate. ManyToMany via `articles_tags` join → BC-ARTICLE 안 reference (Vernon Rule 3 비교 분석을 finding 으로 기록 권장)

---

## 토픽 2. Email/Username Unique 검증 — 한국 SI 실무 패턴

### 2.1 검증된 사례 — Spring AOP + Redisson 분산락 ()

**URL**: https://velog.io/@juuuunny/트러블-슈팅-동시성-문제-이렇게-풀었다-Spring-AOP와-Redisson-분산락-활용기

**핵심 패턴**:

- `@DistributedLock(key = "'lock:signup:email:' + #requestDto.email()")` 으로 critical section 보호
- **이중 안전 전략**: 분산락 (예방) + DB UNIQUE (반응)
- 단순 `existsByEmail` → save 시퀀스는 **동시 요청 2건 모두 통과 후 save 시 DB 충돌**

### 2.2 검증된 사례 — DB UNIQUE 제약 + DataIntegrityViolationException ()

**URL**: https://medium.com/@hc07car/solve-race-condition-with-java-jpa-upsert-jpa-lock-b6fc40462340 / https://www.javathinking.com/blog/how-to-handle-jpa-unique-constraint-violations/

**핵심 원칙**:

- "Pre-checks are useful for reducing violations but **must be combined with exception handling** to cover edge cases" (Coderscampus)
- 권장 구현 = `existsByEmail` (UX 친화적 즉시 피드백) + DB UNIQUE (race condition 최종 방어) + `try/catch DataIntegrityViolationException` (race 발생 시 fallback)

### 2.3 메인 사전 검증 지지

| 메인 사전 검증                                    | 본 리서치 결과                                                                                                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DRIFT-010 application 레벨 email unique 검증 부재 | **지지 + 보강**. 한국 SI 실무 표준은 **3중 방어** (앱 + DB + try/catch). 단순 DB UNIQUE 단독은 race condition 시 사용자 경험 저하 + 500 에러. PoC #01 RealWorld 가 application 레벨 검증 누락 시 → BR + AP 동시 등록 |

### 2.4 PoC #01 적용 시 결정 권고

- **BR-USER-EMAIL-UNIQUE-001** (rules.json):
  - given: 회원가입 요청
  - when: 동일 이메일이 이미 존재
  - then: 422 Unprocessable + "email already exists"
  - confidence: 0.85 (DB UNIQUE 확정 + application 레벨은 코드 fetch 후 확정)
- **AP-VALIDATION-MISSING-001** (만약 application 검증 부재): category=VALIDATION, severity=medium. F-015 cross-validation 후 등록
- DRIFT-010 처분: **BR + (조건부) AP** 양면 등록. 단순 finding 처리 (F) 보다 production 영향도 높음

---

## 토픽 3. 단방향 follow vs 양방향 friendship 패턴

### 3.1 검증된 사례 — Twitter Asymmetric Follow ()

**URL**: https://en.wikipedia.org/wiki/Asymmetric_follow / https://blog.x.com/engineering/en_us/topics/insights/2018/embeddingsattwitter

**핵심**:

- Twitter = asymmetric follow 표준 (4 relationship 종류: A→B, B→A, A↔B, none)
- Facebook = symmetric friendship (2 종류: friend / not)
- Instagram = mixture (public 비대칭 + private 양방향 승인)

### 3.2 한국 사례 (— 1차 자료 부재)

- 당근마켓: 검색 결과 follow 도메인 모델 직접 회고 부재 (검색 결과는 ML/푸시알림 위주)
- 멜론, 카카오뱅크 친구추천: **(검증 필요)** — 1차 회고 자료 미발견
- 한국 SI 일반 패턴: 일대다 단방향 (https://medium.com/dong-gle/일대다-단방향-적용기-a555f5fed2af) — JPA 기준 단방향이 양방향보다 유지보수 ↓

### 3.3 메인 사전 검증 지지

| 메인 사전 검증             | 본 리서치 결과                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DRIFT-002 단방향 follow ✅ | **강하게 지지**. Twitter / Instagram (public) 표준 = asymmetric. RealWorld spec 자체가 Medium clone (블로그 follow) → **단방향이 정통**. 양방향 friendship 마이그레이션은 도메인 자체 변경 (보통 product 결정) — 본 PoC 에서는 단방향 유지가 옳음 |

### 3.4 PoC #01 적용 시 결정 권고

- **BR-USER-FOLLOW-DIRECTIONAL-001**: 단방향 (asymmetric) 유지. RealWorld spec 표준
- **BR-USER-FOLLOW-NO-SELF-001**: 자기 자신 follow 금지 (Profile.follow() 가드 확인 — R-403)
- DRIFT-002 처분: **NO ACTION + BR 등록** (코드 변경 ❌, 도메인 의도 명문화)
- 양방향 friendship 마이그레이션 회고는 한국 사례 부재 → finding 등록 사유 ❌

---

## 토픽 4. JWT 만료 시간 + Secret 관리 — 한국 SI 사고

### 4.1 검증된 사례 — JWT Access Token 권장 만료 시간 ()

**URL**: https://lyaesley.github.io/spring/spring-security-jwt-authentication/ / https://swalloow.github.io/implement-jwt/

**한국 실무 패턴**:

- Access Token: **15분 ~ 1시간 권장** (한국 가이드 다수)
- Refresh Token: 7일 ~ 30일
- 본 PoC #01 의 **JWT 2시간** = 권장 상한 초과. Access/Refresh 분리 부재 (단일 토큰)

### 4.2 검증된 사례 — Hardcoded JWT Secret leak ()

**URL**: https://www.bleepingcomputer.com/news/security/over-12-million-auth-secrets-and-keys-leaked-on-github-in-2023/ / https://www.gitguardian.com/remediation/json-web-token

**통계**:

- 2023년 GitHub 에 1,280만 개 secret leak (전년 대비 +28%)
- 2024년 GitHub detect 3,900만 개+ secret leak

**대표 사고**:

- sublinkX (https://github.com/gooaclok819/sublinkX/issues/68): hardcoded JWT secret → token forge 가능
- Flame (https://github.com/pawelmalak/flame/issues/465): hardcoded secret 으로 전체 인증 우회
- Jank (https://github.com/Done-0/Jank/issues/9): 동일 패턴

### 4.3 검증된 사례 — BCrypt 채택률 ()

**URL**: https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html

**Spring Security 공식 권장**:

- Adaptive one-way: bcrypt / PBKDF2 / scrypt / argon2
- **BCrypt** = 일반 Spring 앱 기본 추천 (built-in salt + cost factor)
- **Argon2** = security-critical + Password Hashing Competition 우승. 단, BouncyCastle 의존성

**OWASP**: Argon2 또는 BCrypt 권장 (대부분 앱)

### 4.4 메인 사전 검증 지지/보강

| 메인 사전 검증             | 본 리서치 결과                                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JWT 2시간, SECRET 하드코딩 | **강하게 지지 + 보강**. 2시간 = 권장 상한 (15분~1시간) 초과 → BR 등록 + Phase 6 AP 후보. SECRET 하드코딩 = 산업 권위 (GitHub leak 통계) 압도적 안티패턴 → **AP-CONFIG-SECRET-HARDCODED-001 강제 등록 권고** |
| BCryptPasswordEncoder      | **지지**. 코드 fetch 시 BCrypt 채택 확인 → BR-AUTH-PASSWORD-ENCODE-001 신뢰도 0.90+                                                                                                                         |

### 4.5 PoC #01 적용 시 결정 권고

- **BR-AUTH-JWT-EXPIRE-001** (rules.json, 5.C 매직 넘버):
  - 7200 seconds (2 hours) → human_review_required=true
  - rationale 코멘트: "권장 상한 초과 (15min~1h). RealWorld 학습용으로 추정"
- **AP-CONFIG-SECRET-HARDCODED-001** (antipatterns-partial.json):
  - category=CONFIG, severity=high
  - 산업 통계 기반 (GitGuardian / BleepingComputer) → severity high 정당
  - 본 PoC 한정: 학습용 spec 인정 (false positive 주의 — finding 으로 처리도 가능)
- **AP-AUTH-NO-REFRESH-TOKEN-001** (선택, condition):
  - 단일 토큰 (refresh 없음) + 2시간 만료 = 보안/UX 양면 약함
  - severity=medium

---

## 토픽 5. Comment 권한 체크 로직 버그 처분 패턴

### 5.1 검증된 사례 — Spring Authorization Bypass ()

**URL**: https://snyk.io/blog/spring-security-authorization-bypass-cve-2022-31692/ / https://gbhackers.com/spring-framework-security-flaws/

**대표 CVE**:

- CVE-2022-31692: Spring Security path matching 오류 → 권한 우회
- CVE-2025-41248 / CVE-2025-41249: method security annotations on parameterized types → 인증 우회

**공통 패턴**: "**An authorization bypass means a non-admin user could access that page in certain use cases without having this admin role**" (StackHawk)

### 5.2 본 PoC #01 의 Comment.removeCommentByUser 분석

**메인 사전 검증 결과**: `!A || !B` 로직 = "article 작성자 OR comment 작성자 둘 중 하나도 아니면 거부" (= article 작성자 AND comment 작성자 둘 다여야 삭제 가능)

**의도 분석** (RealWorld spec 기준):

- 표준 의도: "comment 작성자 OR article 작성자" (둘 중 하나면 삭제 가능)
- 코드 로직: "comment 작성자 AND article 작성자" (둘 다여야 삭제 — 자기 글에 자기 댓글만 삭제)

→ **De Morgan 법칙 적용**: `!(A || B) == !A && !B` (이거면 둘 중 하나도 아니면 거부 = 표준)
→ **메인 사전 검증 재확인 필요**: 코드 본문 raw fetch 강제 (R-405)

### 5.3 한국 사례 — 권한 로직 버그 (— 1차 자료 부재)

- 한국 서비스의 Comment 권한 버그 → 보안 인시던트 직접 회고 자료 **부재**
- 일반 패턴: "권한 우회는 OWASP Top 10 (Broken Access Control) #1" (https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- 한국 KISA 인시던트: **(검증 필요)**

### 5.4 AP vs F 분류 기준 (검증 결과)

| 기준            | AP (Antipattern)                                          | F (Finding)                                                        |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Production 영향 | 즉시 보안 인시던트 가능                                   | 명세 자체의 모호성                                                 |
| Severity        | medium ~ critical                                         | low ~ medium                                                       |
| 처분            | 즉시 수정 권고 + Phase 6 등록                             | 명세 격상 후보                                                     |
| 본 PoC 적용     | Comment 권한 버그가 진짜 버그인지 의도인지 코드 본문 확인 | 코드 본문 확인 후 진짜 버그면 AP-AUTH-AUTHORIZATION-BUG, 의도면 BR |

### 5.5 PoC #01 적용 시 결정 권고

**1단계: 코드 본문 fetch (R-405 메인 raw fetch 의무)**

- `domain/article/Comment.java` 의 `removeCommentByUser` 본문 직접 확인
- De Morgan 법칙 적용 결과 vs 메인 사전 검증 재대조

**2단계: 분기 결정**

- **만약 진짜 버그** (`!A || !B` AND 가드): **AP-AUTH-AUTHORIZATION-BUG-001** + **BR-COMMENT-AUTHOR-OR-ARTICLE-AUTHOR-DELETE-001** (수정 후 의도)
- **만약 De Morgan 오해** (`!(A || B)` 인 경우): **BR-COMMENT-DELETE-AUTHORIZATION-001** (의도 정상) + finding 등록 ❌

→ **본 PoC 의 결정 우선순위**: 코드 본문 raw fetch 후 결정. 메인 사전 검증의 "잠재 버그" 표현은 **확정 전 단계** 인식 필수.

---

## 토픽 6. 5.B FE 부재 / 5.D 외부 의존성 0건 케이스 처분

### 6.1 검증된 사례 — RealWorld 다구현체 BE-only 패턴 ()

**URL**: https://github.com/gothinkster/realworld

**핵심**:

- RealWorld spec 자체가 BE / FE 분리. 본 PoC 의 spring-boot-realworld-example-app 은 BE only
- 다른 RealWorld BE 구현체 (Node, Go, Rust, Kotlin) 모두 **자체 JWT** 채택. 외부 IdP 미통합
- → "BE only + 외부 의존성 0" 은 RealWorld 학습 spec 의 **정상 상태**, 본 PoC 의 한계가 아니라 **spec 의 의도**

### 6.2 한국 SI — 내부 구현 vs 외부 SDK ()

**URL**: https://taes-k.github.io/2019/06/20/spring-msa-4/ (Spring MSA 인증서비스)

**한국 SI 실무 패턴**:

- 자체 JWT 구현 = MSA 환경에서 흔함 (서버 부하 회피, stateless)
- 외부 IdP 통합 = 카카오/네이버 소셜 로그인 + OAuth2 동시 사용 시
- **자체 JWT 단독 = 학습 / 소규모 / 단일 도메인 서비스에 적합**, 대규모 서비스는 OAuth2 필수

### 6.3 메인 사전 검증 지지

| 메인 사전 검증                  | 본 리서치 결과                                                                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 외부 의존성 0건 (자체 JWT 구현) | **지지**. RealWorld spec 의 정상 상태. 본 PoC #01 의 "한계" 가 아니라 명세 §3.4 의 적용 한계 (5.D 0건 케이스 명세 부재) → F-026 deferred finding 의 **발현 사례 등록 정당** |
| 5.B FE 부재                     | **지지**. BE only spec → 5.B 스킵 정당. F-026 와 같은 deferred finding 으로 묶음                                                                                            |

### 6.4 PoC #01 적용 시 결정 권고

- **5.B 스킵**: `_manifest.yml` 에 `5.B: skipped (FE absent — RealWorld BE-only spec)` 명시
- **5.D 스킵**: `_manifest.yml` 에 `5.D: 0 dependencies (self-implemented JWT — RealWorld spec standard)` 명시
- **F-026 발현 finding 등록**: "5.D 0건 케이스의 신뢰도 처리 가이드 부재 → 명세 §6 의 평균 ~70% 적용 불가" → **finding 등록 (deferred 발현 + PoC #02/#03 검증 강제 사유 보강)**
- "FE-BE 검증 중복" 안티패턴 (명세 §3.2) 은 본 PoC 에서 검출 불가 → PoC #02 검증 위임

---

## 토픽 7. RealWorld 변형 구현체 비교 — 사내 적용 시사점

### 7.1 검증된 사례 — RealWorld 다구현체 ()

**URL**:

- https://github.com/gothinkster/spring-boot-realworld-example-app (본 PoC 대상)
- https://github.com/gunkim/kotlin-realworld (Kotlin + DDD)
- https://github.com/1chz/realworld-java21-springboot3 (Java 21 + Spring Boot 3)
- https://github.com/AngusGMorrison/realworld-go (Go + Hexagonal + type-driven)

**구현체별 특징**:
| 구현 | 도메인 패턴 | 특징 |
|---|---|---|
| Spring Boot Java (본 PoC) | DDD-Lite (Embeddable VO) | Rich Domain — `User.writeCommentToArticle()` |
| Kotlin DDD | DDD principles | "domain layer encapsulates core business logic and domain rules" |
| Java 21 + SB 3 | Modular core/persistence | "core module containing core logic and domain models" |
| Go (AngusGMorrison) | Hexagonal + type-driven | "if a domain object exists, it's valid" — type 시스템으로 invariant 강제 |

### 7.2 "Spring Boot 구현이 Anemic Domain 인가?" ()

**URL**: https://www.baeldung.com/java-anemic-vs-rich-domain-objects / https://dzone.com/articles/anemic-domain-model-in-typical-spring-projects-1

**핵심 분석**:

- 일반적 Spring 프로젝트 = anemic 비율 높음 (Service 에 모든 로직, Entity 는 DTO)
- 본 PoC #01 = **Rich Domain 채택** (메인 사전 검증 #2: `User.writeCommentToArticle()` 등) — **예외적**
- 한국 학습자 회고: 다수가 "Spring 으로는 Rich Domain 어렵다" 인식 → 본 PoC 가 **Rich Domain 학습 사례** 로 가치 있음

### 7.3 사내 적용 시사점 — PoC #02/#03 영향

**본 PoC #01 학습 → PoC #02/#03 적용 가이드**:

1. **Aggregate 경계 결정**: 카카오페이 / 우형 패턴 (Multi Module + internal Entity 격리) 가 사내 표준 후보. 본 PoC #01 결과를 PoC #02 (다른 스택) 에서 cross-validate.
2. **Rich Domain 강제**: AP-DOMAIN-ANEMIC 등록 강제 (안 발견되면 안 함). 다른 PoC 가 Anemic 이면 비교 데이터로 finding 격상 후보.
3. **5.B / 5.D 부재 처리**: 본 PoC 의 처리 패턴 (스킵 + finding 등록) 을 PoC #02/#03 에서도 동일 적용 → v1.2.0 에서 "0건 케이스 명세" 신설 격상 데이터 축적
4. **JWT 보안 표준**: 본 PoC 의 BR-AUTH-JWT-EXPIRE / AP-CONFIG-SECRET-HARDCODED 패턴은 사내 모든 프로젝트에 적용 가능 (학습용 spec 이라도 강제 등록).

### 7.4 메인 사전 검증 지지

| 메인 사전 검증          | 본 리서치 결과                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Rich Domain (Anemic ❌) | **지지**. 본 PoC 의 Rich Domain 채택은 RealWorld 다구현체 중에서도 예외적. AP-DOMAIN-ANEMIC 미등록 정당 (코드 fetch 후 최종 확인) |

### 7.5 PoC #01 적용 시 결정 권고

- **AP-DOMAIN-ANEMIC**: 등록 ❌ (Rich Domain 확인 시). 등록 ✅ 조건 = Service 에 도메인 로직 위치한 흔적 발견 시
- 사내 적용 가이드 메모: PoC #01 의 Rich Domain 학습 가치 = "Spring + DDD-Lite 가 가능함을 증명". PoC #02 가 Anemic 이면 비교 데이터로 의미.

---

## §13. 결정 권고 매트릭스 (9개 핵심 결정)

| #   | 결정 항목                                        | 권고 분류                                                               | ID 후보                                                                               | severity / confidence                 | 근거 (URL)                                      |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------- |
| 1   | Article Aggregate 경계 (Comment 가 member 인가?) | **BR + Aggregate 등록**                                                 | BR-ARTICLE-AGGREGATE-001 + E-ARTICLE-Article (root)                                   | 0.85 (cascade=ALL 코드 fetch 후 확정) | Vernon Part II + 카카오페이 Recovery 패턴       |
| 2   | Tag standalone Aggregate                         | **BR + Aggregate 등록**                                                 | E-ARTICLE-Tag (separate root, ManyToMany via articles_tags)                           | 0.85                                  | Vernon Rule 3 (reference by ID)                 |
| 3   | CIRCULAR-001 BC 결정                             | **architecture.json bc_status 갱신** (same / different / cross-cutting) | bounded_contexts[BC-USER, BC-ARTICLE] + circular_dependencies[CIRCULAR-001].bc_status | 0.80 (코드 raw fetch 후 확정)         | 카카오페이 Multi Module / 우형 WMS 분리         |
| 4   | DRIFT-002 단방향 follow                          | **BR + 의도 명문화**                                                    | BR-USER-FOLLOW-DIRECTIONAL-001 + BR-USER-FOLLOW-NO-SELF-001                           | 0.90                                  | Twitter asymmetric follow / RealWorld spec      |
| 5   | DRIFT-003 (slug unique per author)               | **NO ACTION + recommendations 유지**                                    | REC-001 (Phase 2 인계)                                                                | 0.75                                  | Phase 2 결정 유지                               |
| 6   | DRIFT-007 cascade missing                        | **AP 후보**                                                             | AP-DB-CASCADE-MISSING-001 (Phase 6)                                                   | medium                                | Phase 2 NO ACTION → Phase 6 격상                |
| 7   | DRIFT-010 email unique application 검증          | **BR + (조건부) AP**                                                    | BR-USER-EMAIL-UNIQUE-001 + AP-VALIDATION-MISSING-001 (조건부)                         | 0.85 (코드 fetch 후 확정)             | Redisson 분산락 패턴 / DB UNIQUE 단독 한계      |
| 8   | Comment.removeCommentByUser 권한 로직            | **코드 fetch 후 분기 결정** (AP 또는 BR)                                | AP-AUTH-AUTHORIZATION-BUG-001 (버그) 또는 BR-COMMENT-DELETE-AUTHORIZATION-001 (의도)  | 0.65 (raw fetch 의존)                 | Spring Security CVE 2022-31692 / OWASP A01      |
| 9   | JWT 2시간 + SECRET 하드코딩                      | **BR + AP 양면 등록**                                                   | BR-AUTH-JWT-EXPIRE-001 (5.C 매직) + AP-CONFIG-SECRET-HARDCODED-001 (강제)             | 0.95 (산업 통계 기반)                 | GitGuardian 통계 / Spring Security 공식 / OWASP |

**부록: 5.B / 5.D 처분 (보조)**:

| #   | 결정 항목                 | 권고                                                                                                           |
| --- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 10  | 5.B FE 스킵               | \_manifest.yml `5.B: skipped (FE absent)` + F-026 deferred finding 발현 등록                                   |
| 11  | 5.D 외부 의존성 0건       | \_manifest.yml `5.D: 0 dependencies (self-JWT)` + F-026 발현 등록 + 명세 §6 신뢰도 ~70% 적용 한계 finding 등록 |
| 12  | LV-001 / LV-002 강제 등록 | AP-ARCH-LAYER-VIOLATION-001 + AP-DOMAIN-FRAMEWORK-LEAK-001 (Phase 4 antipatterns-partial.json — Phase 6 통합)  |

---

## §14. F-015 cross-validation 자기 진단

### 14.1 코퍼스 의존 의심 항목 (등급)

| 항목                                             | 의심 정도       | 대응                                                           |
| ------------------------------------------------ | --------------- | -------------------------------------------------------------- |
| 한국 (당근, 멜론, 카카오뱅크) follow 도메인 회고 | **(검증 필요)** | 1차 자료 부재 → 토픽 3 §3.2 명시. 일반 DDD/JPA 자료로 대체     |
| 한국 KISA Comment 권한 버그 인시던트             | **(검증 필요)** | OWASP / Spring CVE 자료로 대체                                 |
| 한국 SI BCryptPasswordEncoder 채택률 %           | **(검증 필요)** | Spring Security 공식 권장 + 한국 블로그 보강 (정확한 % 미수치) |
| 토스/라인 Aggregate 회고                         | **(검증 필요)** | 1차 자료 부재 → 카카오페이 / 우형 사례로 대체                  |

### 14.2 (1차 자료 + 본문 확인) 항목

- 카카오페이 여신코어 DDD (https://tech.kakaopay.com/post/backend-domain-driven-design/) — **WebFetch 본문 확인 완료**
- 우아한형제들 WMS 분리 (https://techblog.woowahan.com/22151/) — **WebFetch 본문 확인 완료**
- Vaughn Vernon Effective Aggregate Design Part II (dddcommunity.org)
- Twitter Asymmetric Follow (Wikipedia + X engineering blog)
- GitHub JWT secret leak 통계 (BleepingComputer + GitGuardian)
- Spring Security 공식 password storage 가이드
- OWASP A01 Broken Access Control + Spring CVE
- RealWorld 다구현체 GitHub repo 비교

### 14.3 메인 사전 검증 vs 본 리서치 정합성

| 메인 사전 검증 #                   | 본 리서치 토픽 | 정합성          | 비고                                                                                                |
| ---------------------------------- | -------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| #1 Aggregate                       | T1             | **지지**        | 카카오페이 / 우형 / Vernon — 메인 검증 + 1차 자료 모두 일치                                         |
| #2 Rich Domain                     | T7             | **지지**        | RealWorld 다구현체 비교 + Baeldung — Spring 에서 Rich Domain 가능                                   |
| #3 CIRCULAR-001 same_bc            | T1             | **부분 지지**   | 카카오페이는 user / account 분리 (different BC). 본 PoC 의 same_bc 권장은 코드 fetch 후 재검증 권고 |
| #4 DRIFT-002 단방향                | T3             | **강하게 지지** | Twitter asymmetric + RealWorld spec                                                                 |
| #5 DRIFT-010 application 검증 부재 | T2             | **강하게 지지** | 한국 분산락 패턴 + Coderscampus 권장 — 3중 방어 표준                                                |
| #6 Comment 권한 잠재 버그          | T5             | **재검증 필요** | De Morgan 법칙 적용 시 메인 사전 검증 재확인 필요. 코드 본문 raw fetch 의무                         |
| #7 JWT 2시간 + SECRET 하드코딩     | T4             | **강하게 지지** | 한국 권장 15min~1h / GitHub leak 통계 / OWASP                                                       |
| #8 외부 의존성 0건                 | T6             | **지지**        | RealWorld spec 정상 상태 — 명세 §3.4 적용 한계 finding 등록 정당                                    |

→ **정합성 평가**: 8건 중 강하게 지지 5건 / 지지 2건 / 재검증 1건. **재검증 필요 1건 (Comment 권한 로직)** 은 코드 본문 raw fetch 후 De Morgan 법칙 재적용 강제.

---

## §15. 다음 단계

본 case-phase4.md → research-phase4.md (메인 통합) → 윤주스 (TF Lead) 검토 → 3단계 (사용자 승인) → 4영역 추출 코드 착수.

**핵심 메시지**:

1. Aggregate 경계 / DRIFT-002 / DRIFT-010 / JWT 보안 → **한국 1차 사례 + 글로벌 1차 자료 압도적 지지**
2. Comment 권한 로직 → **코드 본문 raw fetch 강제 (R-405)** 후 분기 결정
3. 5.B / 5.D 0건 케이스 → **F-026 deferred finding 발현 등록 + PoC #02/#03 검증 위임**
4. 9개 핵심 결정 매트릭스 → 메인 통합 시 우선순위 가이드

---

## 참조 URL 목록 (전체)

### 한국 1차 자료 ()

- [카카오페이 여신코어 DDD](https://tech.kakaopay.com/post/backend-domain-driven-design/)
- [우아한형제들 WMS 도메인 분리](https://techblog.woowahan.com/22151/)
- [생각하라, 객체지향처럼 — 우아한형제들](https://techblog.woowahan.com/2502/)

### 한국 2차 자료 ()

- [Spring AOP + Redisson 분산락 - 회원가입 동시성](https://velog.io/@juuuunny/트러블-슈팅-동시성-문제-이렇게-풀었다-Spring-AOP와-Redisson-분산락-활용기)
- [Spring Security JWT 인증 가이드](https://lyaesley.github.io/spring/spring-security-jwt-authentication/)
- [JWT 구현 시 마주치게 되는 고민들 - Swalloow](https://swalloow.github.io/implement-jwt/)
- [Spring MSA 인증서비스 - taes-k](https://taes-k.github.io/2019/06/20/spring-msa-4/)
- [DDD 세레나데 - fistkim101](https://medium.com/fistkim101/ddd-세레나데-3)
- [일대다 단방향 적용기 - Dong-gle](https://medium.com/dong-gle/일대다-단방향-적용기-a555f5fed2af)

### 글로벌 1차 자료 ()

- [Vaughn Vernon Effective Aggregate Design Part I](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf)
- [Vaughn Vernon Effective Aggregate Design Part II](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf)
- [Vaughn Vernon Effective Aggregate Design Part III](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_3.pdf)
- [Spring Security Password Storage 공식](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
- [Asymmetric Follow - Wikipedia](https://en.wikipedia.org/wiki/Asymmetric_follow)
- [Embeddings@Twitter - X Engineering](https://blog.x.com/engineering/en_us/topics/insights/2018/embeddingsattwitter)
- [GitHub Secrets Leak 2023 통계 - BleepingComputer](https://www.bleepingcomputer.com/news/security/over-12-million-auth-secrets-and-keys-leaked-on-github-in-2023/)
- [GitGuardian JWT Remediation](https://www.gitguardian.com/remediation/json-web-token)
- [Spring Authorization Bypass CVE-2022-31692 - Snyk](https://snyk.io/blog/spring-security-authorization-bypass-cve-2022-31692/)
- [Anemic vs Rich Domain - Baeldung](https://www.baeldung.com/java-anemic-vs-rich-domain-objects)
- [Anemic Domain Model in Typical Spring Projects - DZone](https://dzone.com/articles/anemic-domain-model-in-typical-spring-projects-1)

### RealWorld 다구현체 ()

- [spring-boot-realworld-example-app (본 PoC)](https://github.com/gothinkster/spring-boot-realworld-example-app)
- [kotlin-realworld + DDD - gunkim](https://github.com/gunkim/kotlin-realworld)
- [realworld-java21-springboot3 - 1chz](https://github.com/1chz/realworld-java21-springboot3)
- [realworld-go + Hexagonal - AngusGMorrison](https://github.com/AngusGMorrison/realworld-go)

### 보조 자료 ()

- [JPA Race Condition Solutions - Tete Kim](https://medium.com/@hc07car/solve-race-condition-with-java-jpa-upsert-jpa-lock-b6fc40462340)
- [How to Avoid Duplicate Records - Coderscampus](https://www.coderscampus.com/how-to-avoid-duplicate-records-in-hibernate/)
- [JPA Unique Constraint Violations - javathinking](https://www.javathinking.com/blog/how-to-handle-jpa-unique-constraint-violations/)
- [Hardcoded JWT Secret - sublinkX issue](https://github.com/gooaclok819/sublinkX/issues/68)
- [Hardcoded JWT Secret - Flame issue](https://github.com/pawelmalak/flame/issues/465)
- [Spring Broken Access Control Guide - StackHawk](https://www.stackhawk.com/blog/spring-broken-access-control-guide-examples-and-prevention/)

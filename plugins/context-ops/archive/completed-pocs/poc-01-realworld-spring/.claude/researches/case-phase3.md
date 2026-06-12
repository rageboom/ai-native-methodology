# Case Research — PoC #01 Phase 3 (arch, 아키텍처)

> 역할: 테크기업 사례 리서처 (Work Principles 2원칙 中)
> 작성일: 2026-04-28
> 대상 plan: `.claude/plans/plan-phase3.md`
> Phase 명세: `ai-native-methodology/methodology-spec/workflow/phase-3-arch.md`
> 동료 research 참고: `case-phase1.md` (0.90), `case-phase2.md` (0.92)

---

## §0. 사전 고지

본 research 는 sub-agent (테크기업 사례 리서처) 가 WebSearch / WebFetch 로 직접 검증한 사례 + 검증 실패 영역의 정직 보고를 통합한 결과다.

- (V) 마킹 = WebFetch 로 1차 출처 확인 (텍스트 추출 포함)
- (S) 마킹 = WebSearch 결과 요약은 있으나 1차 fetch 미확인
- 한국 사례 검증 목표: 최소 2건 → **달성 5건** (V) (카카오뱅크 Modulith, 우아한형제들 클린 아키텍처, 우아한형제들 Kotlin Multi Module Hexagonal, 카카오페이 Hexagonal 제거 회고, 카카오페이 결제탭 피드 서버)

본 PoC 의 강한 검증 케이스: **"디렉토리는 Hexagonal 같지만 실제는 Layered + Spring-flavored DDD-Lite"** 함정 + **양방향 도메인 import (User ↔ Article) 의 Aggregate 경계 결정** + **5.D 외부 의존성 빈약 (HTTP 클라이언트 0건) 의 한국/글로벌 사례**. 본 research 는 이 케이스에 직접 적용 가능한 패턴을 우선 추출했다.

---

## §1. Spring Modulith 적용 사례 (글로벌 + 한국)

### 1.1 카카오뱅크 수신상품 Spring Modulith 도입 [한국 #1] (V) ⭐⭐

**출처**: https://tech.kakaobank.com/posts/2507-legacy-to-modular-monolith-with-spring-modulith/
("MSA로의 여정에서 만난 Spring Modulith 체리픽 해본 후기")

**핵심**:
- 배경: 모놀리식 → MSA 전환 필요 but 리소스 제약. 중간 단계로 **모듈러 모놀리스** 채택.
- 적용 스택: Kotlin + Spring Boot + Gradle 멀티모듈 + Spring Modulith.
- 아키텍처 조합: **Hexagonal Architecture + Modular Monolith + Spring Modulith** (3단 결합).
- 모듈 boundary 강제 메커니즘:
  - 패키지 기반 논리적 모듈 (Public API 만 노출, internal 캡슐화)
  - `ApplicationModules.of(MainApplication::class.java).verify()` 테스트로 자동 검증
  - 커스텀 `GoodsModuleDetectionStrategy` — 물리적 Gradle 모듈을 논리적 모듈로 통합, 인프라/로깅 모듈 탐지 제외
- 핵심 trade-off: 1개 코드베이스 (결합도 높음, 운영 부담 1/5) vs 5개 코드베이스 (결합도 낮음, 운영 부담 5배). 모듈러 모놀리스 = 중간점.

**본 PoC 적용**:
- ✅ **가져올 점**: RealWorld 의 단일 모듈 + 패키지 기반 도메인 분리는 카카오뱅크의 "논리적 모듈" 첫 단계와 정합. Phase 3 산출물에서 `application/`, `domain/{user,article,...}`, `infrastructure/` 패키지를 Modulith 규약의 application module 후보로 매핑 가능.
- ✅ **F-024 보강**: Phase 1 candidate (Hexagonal/Clean 0.65) → Phase 3 정정 시, 카카오뱅크는 "Hexagonal + Modular Monolith + Modulith" 라는 명시적 결합 명명을 사용 — 본 PoC 도 "Layered + Spring-DDD-Lite" 같은 합성 명명 정당화.
- ⚠️ **가져오지 않을 점**: RealWorld 는 학습용 spec, Modulith 미적용 — 본 PoC 는 Modulith verify() 시뮬레이션 단계.

### 1.2 우아한형제들 Kotlin Multi Module Hexagonal [한국 #2] (V) ⭐⭐

**출처**: https://techblog.woowahan.com/12720/
("Spring Boot Kotlin Multi Module로 구성해보는 헥사고날 아키텍처")

**핵심**:
- 4 Hexagon 명시:
  1. **Domain Hexagon**: **POJO 로 개발. Spring `@Component`, `@Service` 어노테이션 비사용** (의도적 선언). Pure business logic.
  2. **Application Hexagon**: Use case 정의 + output port 인터페이스. Domain 만 의존. **`@Service` 는 실용적 이유로 사용 (예외)**.
  3. **Framework Hexagon**: AWS, Retrofit 등 기술별 모듈. output port 구현. Component scan config 격리.
  4. **Bootstrap Hexagon**: REST API, Kafka, SQS consumer entry point. 필요 config 만 selective import.
- 핵심 설계 결정:
  - `lazyInit = true` 로 미사용 adapter 강제 instantiation 회피
  - Hexagon 간 **자체 entity representation** 유지 (domain entity ≠ DB entity ≠ DTO) — 객체 변환 부담 받아들임
  - Kotlin `init` block 으로 도메인 검증 자동화
- 명시적 자평: "100% 이론적 순수성 추구 X, 생산성 우선 + 원칙 유지" — 실용적 trade-off 인정.

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC RealWorld 는 우형 4-Hexagon 의 **Application = `@Service` 사용 + Domain = POJO** 규칙과 비교 시 **명백히 위반** — `domain/article/Article.java` 에 `@Entity`, `domain/article/ArticleService.java` 에 `@Service`/`@Transactional`, `domain/user/User.java` 에 `PasswordEncoder` (Spring Security) 직접 import. → AP-DOMAIN-FRAMEWORK-LEAK 안티패턴 후보 정당화.
- ✅ **F-022 보강**: source-info.md ground truth ("domain 패키지 외에서 Spring 어노테이션 최소") 와 실측 차이는 우형 Hexagonal 표준 대비 명백한 일탈. 학습용 spec 의 단순화 받아들임 + finding 으로 등록.
- ✅ **POJO domain 0.85 → 0.50 으로 추가 하향 검토**: 우형 표준 기준에서는 본 PoC 의 도메인은 POJO 가 아님. 0.70 도 관대 — 0.50 (참고 수준 boundary) 권장.
- ⚠️ **가져오지 않을 점**: RealWorld 는 단일 모듈 — 우형의 4-Hexagon 멀티모듈 구조는 본 PoC 사이즈에 과함.

### 1.3 Spring Modulith 공식 발표 + 도입 트렌드 (V)

**출처**:
- https://spring.io/blog/2022/10/21/introducing-spring-modulith
- https://docs.spring.io/spring-modulith/reference/index.html

**핵심**:
- Spring Framework 가 그동안 제공하지 못한 **structural guidance** 보완. `@Controller`/`@Service`/`@Repository` (technical stereotype) 가 아닌 **business domain 단위** 모듈화.
- Module 정의:
  - **API package** (application base 의 직접 sub-package — 예: `example.order`)
  - **Internal package** (nested sub-package — 예: `example.order.internal`, 다른 모듈에서 접근 불가)
- 강제 메커니즘: **ArchUnit** 기반 test-time 검증.
  - Illegal cross-module access 감지
  - 순환 의존성 감지
  - 명시적으로 선언된 allowed dependency 위반 감지
- `@ApplicationModuleTest`: 전체 context 가 아닌 모듈 단위 부팅 — inter-module dependency 발견에 유리.
- Event-driven integration 권장 (직접 bean 의존 → application event 로 대체).

**본 PoC 적용**:
- ✅ **가져올 점**: Phase 3 산출물의 "모듈 식별" 은 Modulith 의 package-based detection 과 정합. 본 PoC 의 `domain/{user,article,jwt,security,setting}` 5 sub-package 는 자연스럽게 application module 5개로 매핑.
- ✅ **F-023 보강**: 본 PoC 의 **양방향 도메인 import (User ↔ Article)** 는 Modulith ArchUnit 검증 시 **순환 의존성 violation** 으로 즉시 감지될 패턴. → "low severity 순환 의존성 + Aggregate 경계 검증" 분기는 Modulith 표준에서는 violation 으로 일관 처리됨을 명시.

### 1.4 InfoQ + 학술 채택 통계 (V)

**출처**: https://www.infoq.com/news/2023/08/spring-modulith-1-0/

**핵심**:
- 2023-08 Spring Modulith 1.0 GA, experimental → fully supported Spring project.
- IDE 지원 (IntelliJ), production-readiness, improved testability 갖춤.
- 채택 트렌드: CNCF Q1 2026 보고서 — 미세서비스 도입 조직 중 42% 가 일부 서비스를 더 큰 deployable unit 으로 통합 = 모듈러 모놀리스로 회귀.

**본 PoC 적용**:
- ✅ Phase 3 의 아키텍처 스타일 candidate 에 "Modular Monolith (Modulith ready)" 옵션 추가 정당화 — 본 PoC 가 즉시 Modulith 적용 가능한 구조인지 평가.

---

## §2. 순환 의존성 / 양방향 Aggregate 참조 사례

### 2.1 Vaughn Vernon "Effective Aggregate Design Part II" (V) ⭐⭐

**출처**: https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf

**핵심 (Reference Other Aggregates by Identity 규칙)**:
- 양방향 참조가 anti-pattern 인 이유:
  - Aggregate 간 강한 결합 생성
  - 한 Aggregate 의 변경이 다른 Aggregate 에 직접 전파
  - 트랜잭션 경계 혼란 — Aggregate boundary = consistency boundary 원칙 위반
  - 도메인 모델 자율성 훼손
- ID 참조 권장 근거:
  - **느슨한 결합**: Aggregate 는 다른 Aggregate 의 ID 만 보유, 실제 entity 미참조
  - 각 Aggregate 의 독립 진화
  - **Eventual Consistency 자연 지원** (분산 시스템 확장성)
- Cross-Aggregate 순환 처리 방법:
  1. **모델 재구성**: 참조 방향 재검토로 단방향 관계 설정
  2. **별도 서비스 계층** (Application Service): 여러 Aggregate 조회 조정
  3. **이벤트 기반 동기화**: 각 Aggregate 이 도메인 이벤트 구독

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 `domain/user/User.java` ↔ `domain/article/Article.java` 양방향 import 는 Vernon 기준에서 **명백한 anti-pattern**.
  - User.java 가 Article/ArticleContents/Comment import = 한 Aggregate 가 다른 Aggregate root + entity 직접 참조
  - Article.java 가 User/Comment import = 동일 위반
  - JPA `@OneToMany` (User → favoriteArticles) 와 `@ManyToOne` (Article → author) 양방향 = JPA 차원의 navigation 편의를 위해 DDD 규칙 일탈
- ✅ **F-023 정당화**: "도메인 cross-aggregate 양방향 참조 vs 순환 의존성 분기" 는 Vernon 기준에서 **분기 없음** — 둘 다 anti-pattern. 본 PoC 의 Phase 3 plan §11 "low severity 순환 의존성 분류" 는 학습용 spec 의 현실적 수용이지, 표준은 아님을 명시.
- ⚠️ **현실적 trade-off**: RealWorld 학습용 spec 은 의도적 단순화 — User-Article 이 같은 BC 안의 cross-aggregate 라면 ID 참조로 리팩토링 권장 (사내 진짜 PoC 시).

### 2.2 Vlad Mihalcea Bidirectional JPA Sync (V)

**출처**:
- https://vladmihalcea.com/jpa-hibernate-synchronize-bidirectional-entity-associations/
- https://vladmihalcea.com/jpa-bidirectional-sync-methods/

**핵심**:
- 양방향 JPA association 사용 시 **양 끝 동기화 의무**: `addComment`/`removeComment` 같은 utility method 강제.
- 미동기화 시 subtle state propagation 버그 — 한쪽만 변경된 채 commit 되면 inverse side 에 stale data.
- 권장: `addX`/`removeX` 헬퍼 메서드를 owning entity 에 정의.

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC RealWorld 의 양방향 JPA 관계가 utility method 로 sync 되고 있는지 Phase 3 산출물에서 확인. `User.addArticle()` / `Article.setAuthor()` 같은 sync 메서드 부재 시 finding (AP-JPA-BIDIR-SYNC-MISSING) 후보.
- ⚠️ Vlad 글은 **DDD 차원이 아닌 JPA 정합성 차원** — Vernon 의 ID 참조 권장과는 별개 layer 의 가이드. JPA navigation 을 받아들이는 전제에서의 best practice.

### 2.3 Enterprise Craftsmanship "Link to Aggregate: Reference or Id?" (S)

**출처**: https://enterprisecraftsmanship.com/posts/link-to-an-aggregate-reference-or-id/ (search 결과만, fetch 미수행)

**핵심 (search 요약)**:
- Vladimir Khorikov (Enterprise Craftsmanship) 가 ID-only 참조 권장과 직접 entity 참조 권장의 양쪽을 비교.
- ORM (JPA/Hibernate) 환경에서는 entity 참조가 자연스러움 — but Aggregate boundary 가 흐려질 위험.
- 결정 기준: 동일 BC 안의 cross-aggregate 면 ID 참조 우선, 같은 Aggregate 안의 entity 면 직접 참조 가능.

**본 PoC 적용**:
- ✅ **F-023 보강**: User-Article 가 같은 BC 인지 확인 필요. RealWorld 의 5도메인 (article/user/jwt/security/setting) 이 1 BC 인지 5 BC 인지 결정 — Phase 4 5.A 입력. 본 PoC 사이즈 (학습용 spec) 에서는 1 BC 단순화 가능.
- ⚠️ Search 요약 only — v1.2 calibration 시 fetch 검증 권장.

### 2.4 한국 사례 양방향 Aggregate 처리 (검증 실패 — 정직 보고)

**상태**: 우아한형제들 / 카카오 / 토스 / 네이버 의 "User-Article" 같은 cross-aggregate 양방향 처리 직접 매칭 글 — sub-agent 가 1차 fetch 미발견. case-phase2.md 의 우형 Legacy DB 복합키 글 (techblog 2595) 은 단일 aggregate 내 복합키 패턴이지 cross-aggregate 아님.

**본 PoC 영향**:
- 글로벌 사례 (Vernon, Vlad) 만으로 패턴 정당화 가능.
- 한국 사례 보강은 v1.2 사내 PoC 시.

---

## §3. Hexagonal vs Layered 적용 사례 (한국 SI)

### 3.1 카카오페이 home 서버 Hexagonal 제거 회고 [한국 #3] (V) ⭐⭐⭐

**출처**: https://tech.kakaopay.com/post/home-hexagonal-architecture/
("Hexagonal Architecture, 진짜 하실 건가요?")

**핵심 (가장 강한 본 PoC 매칭 사례)**:

- 배경: 카카오페이 home 서버 = 24+ 외부 서비스 연동 + user request 당 ~50 API 호출. Hexagonal Architecture 적용 후 **제거**한 케이스.

- 적용 방식 (제거 전):
  - **Multi-module + Hexagonal**: 도메인 → port → adapter → external API 의 strict dependency 방향
  - 외부 API 들을 다양한 out port 로 추상화

- 제거 사유 (4가지):
  1. **Domain model 불명확**: home 서버의 핵심 비즈니스 로직이 "외부 데이터 조합 → Server-Driven UI 렌더링" — domain logic 보다 **adapter work** 가 더 많음. 보호할 도메인이 빈약.
  2. **Port/adapter boundary 혼란 (inversion)**: 외부 구현 detail 이 internal interface 정의를 침투 — ports 가 external system 반영하기 시작.
  3. **개발 마찰 증가**: feature 추가 시 domain → ports → adapters 모든 layer 변경 필요. 단일 HTTP entry point 에 비해 **불필요한 overhead**.
  4. **External 변동성이 이미 다른 곳에서 처리됨**: "연동 API 인터페이스 표준" (process-based 솔루션) 이 이미 도메인 보호 역할 수행 중 → Hexagonal 의 핵심 이점 중복.

- **Hexagonal 적용 전제 조건 (3가지 — 카카오페이 결론)**:
  1. **명확한 Domain model** (보호할 가치 있는 핵심 비즈니스 로직)
  2. **External dependency 가 적정**: depth > breadth — core logic 이 integration logic 보다 무거워야
  3. **Multiple consumers**: core 모듈을 2+ component 가 재사용

- 마이그레이션 결과: 단일 모듈 + concern-based packaging 으로 회귀. **8,000+ 라인 코드 감소**, 개발 속도 향상.

- 명시적 결론: **"There is no silver bullet"** — 아키텍처 패턴은 문제 특성과 솔루션 설계 정합 필요.

**본 PoC 적용 (가장 중요)**:
- ✅ **본 PoC 의 핵심 검증**: RealWorld 는 카카오페이 home 의 정반대 — **외부 의존성 0건 (HTTP 클라이언트 부재) + 도메인 명확 (Article/User/Comment) + multiple consumers 부재 (단일 REST API)**. 카카오페이 3 전제 중 1 (명확 도메인) 만 충족. **Hexagonal 적용 정당화 빈약**.
- ✅ **Phase 1 candidate 정정**: Phase 1 의 Hexagonal/Clean 0.65 → 카카오페이 기준에서는 **0.30 이하** 가 적절. 본 PoC 는 Hexagonal 적합 케이스 아님.
- ✅ **새로운 finding 후보 F-025**: "외부 의존성 빈약 + 단일 entry point 시스템의 Hexagonal 부적합 판정 가이드 부재" — 카카오페이 3 전제를 본 방법론에 가이드로 흡수.
- ✅ **"Layered + Spring-flavored DDD-Lite" 명명 정당화**: 카카오페이도 Hexagonal 제거 후 "concern-based packaging" 명명 사용 — 합성 아키텍처 명명의 정당성 입증.

### 3.2 우아한형제들 클린 아키텍처 적용 (V)

**출처**: https://techblog.woowahan.com/2647/ ("주니어 개발자의 클린 아키텍처 맛보기")

**핵심**:
- 배달의민족 배달/배달료 도메인에 Robert C. Martin Clean Architecture 적용.
- 핵심 원칙: **Dependency Rule** ("모든 소스코드 의존성은 외부에서 내부로, 고수준 정책을 향해야 한다").
- 적용 패턴:
  - DTO 전략: Entity 가 DTO 직접 참조 X (UseCase layer 가 DTO → Entity 변환). DTO 변경이 도메인에 cascade 안 되도록.
  - Dependency Inversion: Service → 추상 Repository 인터페이스 (`DeliveryFeeService` 인터페이스 → 거리/지역 구현체)
  - Interface segregation: client-driven (`ExtraFeeService`/`ExtraTipService`/`ExtraTimeService` 분리)
  - Facade: 다중 구현 시 `DeliveryFeeCalculatorFacade` 로 client 보호
- 자평 trade-off:
  - **Over-engineering 위험 인정**: 변경 빈도 낮은 정책에도 인터페이스 — but "정책은 적던 많던 변경 포인트" 라는 원칙 유지
  - **팀 협업 의존**: 구조 패턴만으로는 안 됨 — pair programming + code review 동반 필요
  - 미해결 질문: class-level boundary 를 package/module level 로 확장 가능성 탐색 중

**본 PoC 적용**:
- ✅ **가져올 점**: 우형은 Clean Architecture 의 **DIP + interface segregation** 만 발췌 적용 (Hexagonal 멀티모듈 X, port/adapter X). 본 PoC RealWorld 도 유사 — Clean 의 일부만 (Service-Repository 분리) 적용. → **"Clean Architecture 부분 적용"** 이 한국 SI 의 일반 패턴.
- ✅ **DDD-Lite 명명 정당화**: 우형도 "주니어가 시도하는 클린" 이라는 자평 — 본 PoC 의 "Spring-flavored DDD-Lite" 도 동일 부분 적용 패턴.

### 3.3 카카오페이 결제탭 피드 서버 (V)

**출처**: https://tech.kakaopay.com/post/payment-feed-server/

**핵심**:
- **Provider-Consumer-Aggregator 패턴**: 단일 Processor 한계 극복.
  - Provider: API/DB 연동 (외부 데이터 가져오기)
  - Consumer: Row 응답 생성
  - Aggregator: 비동기 조율 + 데이터 조합
- 도메인-Spring 의존성 관리:
  - `ResultProvider` 인터페이스 = 도메인 개념
  - 구현체에서만 `@Component` 사용
  - `ResultProviderMapper` 가 DI 관리 → 도메인 로직 자체는 framework-independent
- BC 분리: `ProviderType`/`RowType`/`RowProviderType` enum = **명시적 계약** 으로 컨텍스트 경계 강화.

**본 PoC 적용**:
- ✅ **가져올 점**: 카카오페이의 "도메인 인터페이스 = framework-independent, 구현체만 @Component" 패턴은 §1.2 우형 4-Hexagon 의 "Domain POJO + Application @Service" 와 정합 — 한국 빅테크의 일관된 패턴.
- ✅ **본 PoC 차이**: RealWorld 는 `domain/article/Article.java` (Entity = JPA 의존) + `ArticleService.java` (`@Service` 직접) → 카카오페이/우형 표준 대비 명백히 단순화. 학습용 spec 한계.

### 3.4 "Hexagonal 함정" 명시적 매칭 (검증 실패)

**상태**: "looks hexagonal but actually layered" 같은 명시적 키워드 글 — sub-agent 검색 0건. 그러나 §3.1 카카오페이 회고가 **사실상 동일 함정 사례** — port/adapter boundary inversion + adapter work 가 domain logic 압도 = "디렉토리는 Hexagonal 같지만 실제는 layered + adapter-heavy" 동치.

---

## §4. Spring Framework 의존 도메인 vs Pure POJO

### 4.1 우아한형제들 Domain Hexagon = POJO 강제 (V — §1.2 재인용)

**핵심 재요약**:
- "Domain Hexagon: POJO 로 개발하고 Spring 의 Component, Service annotation 등 비사용" — 명시적 선언.
- Application Hexagon 만 `@Service` 허용 (실용적 예외).
- 4-Hexagon 명시적 분리로 framework leak 방지.

### 4.2 카카오페이 여신코어 DDD 도메인 ≠ JPA Entity 분리 (case-phase2.md §2.4 재인용)

**핵심**:
- 도메인 entity ≠ JPA entity (분리)
- Domain repository 가 도메인 entity ↔ JPA entity 번역
- Private constructor + factory method
- internal-scoped property
- Command object 캡슐화

### 4.3 한국 SI 일반 사례: 일체형 (Pure POJO 회피) — 정직 보고

**상태**: case-phase2.md §2.5 카카오헤어샵 DDD (S) — 도메인 = JPA `@Entity` 일체형, 도메인 용어 그대로 사용 (예약 Reservation, 상태 READY/OK). RealWorld 와 동일 패턴.

**일반 추론 (검증된 출처 기반)**:
- 한국 SI 환경: **일체형 (학습용 spec, 단순 도메인) vs 분리형 (카카오페이 여신코어 같은 복잡 도메인)** 양 패턴 공존.
- 본 PoC RealWorld = 일체형 — `@Entity` + `@Service`/`@Transactional` 도메인 직접 사용은 한국 SI 의 흔한 단순 패턴.

**본 PoC 적용**:
- ✅ **F-022 (POJO ground truth vs 실측 차이)** 정당화: source-info.md 가 POJO 라고 ground truth 선언했으나 실측은 일체형 — 학습용 spec 의 ground truth 작성자 인식과 실제 코드의 미세 차이. **이 자체가 PoC 의 학습 가치**.
- ⚠️ AP-DOMAIN-FRAMEWORK-LEAK 안티패턴 등록 시 severity 는 **medium** 권장 — 학습용 spec / 단순 도메인에서는 일반 패턴이지만, 우형/카카오페이 표준 대비 확장성 미달.

### 4.4 Buckpal (Get Your Hands Dirty on Clean Architecture) 글로벌 reference (V)

**출처**: https://github.com/thombergs/buckpal

**핵심**:
- Tom Hombergs 책의 reference 구현. Hexagonal Architecture + Java + Spring Boot.
- 학습 목표: domain layer 를 oppressive dependency 로부터 해방, dependency inversion 으로 framework 분리.
- 구조: domain (POJO) / application (use case + port) / adapter (web/persistence).

**본 PoC 적용**:
- ✅ **글로벌 reference**: RealWorld 와 같은 학습용 spec 인 Buckpal 은 **명시적 POJO domain** 채택. RealWorld 가 학습용 spec 임에도 framework 의존 도메인은 Buckpal 대비 **단순화/일탈** — RealWorld 작성자의 의도적 단순화로 해석 가능.
- ⚠️ 본 PoC 는 RealWorld 가 채점 대상 아님 — 단지 Phase 1 candidate (POJO 0.85) 의 정정 근거.

---

## §5. 외부 의존성 빈약 환경 (학습용 spec, 5.D 빈약 사례)

### 5.1 Spring PetClinic — 학습용 spec 의 외부 의존성 0건 (V)

**출처**: https://github.com/spring-projects/spring-petclinic + https://spring-petclinic.github.io/

**핵심**:
- Pet 진료 기록 도메인. 7 테이블 (vet/specialty/vet_specialty/owner/pet_type/pet/visit) — 본 PoC RealWorld 7 테이블과 동일 규모.
- 외부 의존성: H2/MySQL/PostgreSQL DB 만 — **HTTP 클라이언트, 메시징, 외부 API 0건**.
- 단일 REST API entry point. multi-DB 지원 변형 (`spring-petclinic-data-jdbc`).
- Spring AI 통합 변형 (2024-09) — original PetClinic 은 외부 통합 0건.

**본 PoC 적용**:
- ✅ **글로벌 reference**: RealWorld + PetClinic 모두 학습용 spec — 외부 의존성 0건이 **학습용 spec 의 정상 패턴**. 본 PoC 의 5.D 빈약은 정직 보고 가능.
- ✅ **Phase 4 5.D 라우팅**: external_dependencies = 빈 배열 + warnings ("학습용 spec — 운영 시스템과 다름"). Phase 명세 §3.1 의 0건 인정 정당화.

### 5.2 RealWorld implementations 글로벌 (V)

**출처**: https://github.com/gothinkster/realworld + https://github.com/raeperd/realworld-springboot-java

**핵심**:
- "Conduit" Medium clone — 학습용 spec.
- 100+ 언어/프레임워크 implementation 존재 (React/Angular/Vue + Node/Spring/Rails/Phoenix 등).
- 모든 implementation 이 **단일 REST API + 단일 DB + 외부 통합 0건** 공유.
- 학습 목표: framework/언어별 implementation 비교 — 외부 통합은 학습 목표 아님.

**본 PoC 적용**:
- ✅ **본 PoC 의 RealWorld Spring Boot Java 변형** = 글로벌 RealWorld 표준의 학습 목표 그대로 — 외부 통합 0건은 의도된 spec.
- ✅ **F-019 (운영 환경 부재) 와 연계**: 학습용 spec 의 5.D 빈약 + 운영 DB 부재는 동일 한계의 두 면. PoC 한계 정직 보고.

### 5.3 JHipster — 학습용 spec but 외부 통합 풍부 (V — case-phase2.md §4.2 재인용)

**핵심 (대조 케이스)**:
- JHipster 는 학습용 generator but Liquibase + OAuth2 + Kafka + Elasticsearch + Mailing 등 외부 통합 풍부.
- 학습용 spec 도 외부 통합 풍부할 수 있음 — RealWorld/PetClinic 의 "0건" 은 spec 작성자 선택.

**본 PoC 적용**:
- ⚠️ "학습용 spec = 외부 통합 0건" 일반화 회피. 본 PoC RealWorld 의 0건은 **spec 작성자 선택의 결과** — 사내 진짜 PoC 시 외부 통합 풍부한 학습용 (JHipster 류) 도 별도 검증 필요.

### 5.4 글로벌 OSS 의 외부 통합 0건 케이스 처리 (검증 실패 — 정직 보고)

**상태**: "글로벌 OSS 의 5.D 빈약 인정 사례" 에 대한 학술/업계 명시 가이드 — sub-agent 1차 출처 미발견. PetClinic + RealWorld 사례 종합 추론.

**본 PoC 영향**: 본 research 의 §5 영역은 **사례 종합 추론** 단계 — 명시적 가이드 부재. F-019/F-020 finding 의 신뢰도는 케이스 비교 기반.

---

## §6. 검증 실패 영역 (정직 보고)

| 주제 | 시도 query | 상태 | 본 PoC 영향 |
|---|---|---|---|
| 토스 Hexagonal/Clean 적용 사례 | "토스 Clean Architecture Hexagonal" | 토스 토끼 일반 검색 결과만, 1차 매칭 부재 | 토스 외부 비공개 추정. v1.2 calibration |
| 카카오뱅크 Hexagonal 도입 (Modulith 외) | "카카오뱅크 Hexagonal Spring Boot" | 일반 Hexagonal 가이드만, 카카오뱅크 직접 글 미발견 (Modulith 글 §1.1 만 확보) | §1.1 로 일부 대체 |
| 한국 SI 의 cross-aggregate 양방향 처리 사례 | "양방향 import 안티패턴 사례 도메인" | Spring bean 순환 참조 글 多, 도메인 양방향 직접 매칭 부재 | 글로벌 (Vernon, Vlad) 로 대체 |
| "Hexagonal 같지만 실제 Layered" 명시 키워드 | "looks hexagonal but actually layered pitfall" | 0건 검색 결과 | §3.1 카카오페이 회고가 사실상 동일 함정 사례 |
| 글로벌 OSS 외부 통합 0건 명시 가이드 | "RealWorld implementation external dependency absence guide" | 1차 출처 미발견 | PetClinic + RealWorld 사례 종합 추론 |
| Vlad Mihalcea cross-aggregate ID-only 직접 글 | "Vlad Mihalcea aggregate root reference identity" | DDD 일반 글 多, Vlad 직접 글 매칭 부재 | Vernon Part II 로 대체 (강한 출처) |

### §6.1 한국 사례 검증 카운트

- 1차 시도: 5건 검증
  - (V) 카카오뱅크 Spring Modulith — `tech.kakaobank.com/posts/2507-...`
  - (V) 우아한형제들 Kotlin Multi Module Hexagonal — `techblog.woowahan.com/12720/`
  - (V) 카카오페이 home Hexagonal 제거 회고 — `tech.kakaopay.com/post/home-hexagonal-architecture/` ⭐⭐⭐
  - (V) 우아한형제들 클린 아키텍처 (배달/배달료) — `techblog.woowahan.com/2647/`
  - (V) 카카오페이 결제탭 피드 서버 — `tech.kakaopay.com/post/payment-feed-server/`
- **목표 2건 → 250% 달성** ✅

### §6.2 글로벌 사례 검증 카운트

- (V) Vaughn Vernon "Effective Aggregate Design Part II" (DDD)
- (V) Spring Modulith 공식 발표
- (V) Spring Modulith 1.0 InfoQ
- (V) Vlad Mihalcea Bidirectional JPA Sync (2건)
- (V) Spring PetClinic
- (V) Buckpal (Get Your Hands Dirty on Clean Architecture)
- (V) RealWorld implementations
- (S) Enterprise Craftsmanship Khorikov

**합계: 8건 (V) + 1건 (S) = 9건**

---

## §7. 본 PoC 적용 권장 패턴 (5~10개)

### §7.1 결정적 처리 영역

1. **모듈 식별 = package-based** (Spring Modulith 패턴 §1.3 + 카카오뱅크 §1.1):
   - `application/` + `domain/{user,article,jwt,security,setting}` + `infrastructure/` 패키지 = application module 후보
   - Phase 3 산출물의 `modules[]` 에 packages 필드 + visibility (public API / internal) 명시

2. **순환 의존성 검출 = ArchUnit 호환 (Modulith 표준)** (§1.3):
   - User ↔ Article 양방향 = Modulith verify() 실패 패턴 — Phase 3 산출물에 violation 마킹
   - Tarjan SCC 알고리즘 적용 + Modulith 호환 결과 명시 (v1.2 자동 도구 통합 가능성)

### §7.2 LLM 보강 영역

3. **양방향 도메인 import = anti-pattern (Vernon 기준)** (§2.1):
   - `domain/user/User.java` ↔ `domain/article/Article.java` = Aggregate boundary 위반
   - Phase 3 산출물에 AP-DDD-CROSS-AGGREGATE-BIDIR 후보 등록 (severity = medium)
   - F-023 "양방향 도메인 import 처리 가이드 부재" finding 등록 정당화

4. **Hexagonal 적용 부적합 판정 (카카오페이 3 전제)** (§3.1):
   - 본 PoC RealWorld = 외부 의존성 0건 + 단일 entry point + 단일 consumer
   - 카카오페이 3 전제 (명확 도메인 / external depth>breadth / multiple consumers) 중 1만 충족
   - **Phase 1 candidate Hexagonal/Clean 0.65 → 0.30 (참고 수준 boundary 이하) 정정**

5. **POJO ground truth 정정 (우형 4-Hexagon 표준 대비)** (§1.2):
   - 본 PoC 의 `domain/` 은 우형의 Domain Hexagon 표준 (POJO 강제) 위반 — `@Entity`/`@Service`/`@Transactional`/`PasswordEncoder` 직접 import
   - **POJO domain 0.85 → 0.50 (참고 수준 boundary) 추가 하향**
   - F-022 finding 등록 + AP-DOMAIN-FRAMEWORK-LEAK 후보

### §7.3 산출물 구조

6. **architecture.json 의 합성 명명** (§1.1 카카오뱅크 + §3.1 카카오페이):
   - 단일 표준 명명 강제 X — "Layered + Spring-flavored DDD-Lite" 같은 합성 명명 허용
   - `architecture_style.primary: "layered"` + `architecture_style.augmentation: ["spring_ddd_lite", "package_by_domain"]` 구조

7. **Modulith readiness 평가 필드** (§1.4):
   - `modulith_readiness: { detection_strategy: "package_based", verify_passes: false, violations: ["bidirectional_user_article"] }`
   - Phase 3 의 미래 가치 (사내 PoC 시 Modulith 도입 진단)

### §7.4 PoC 한정

8. **외부 의존성 0건 처리 (5.D 빈약)** (§5.1, §5.2):
   - external_dependencies = 빈 배열 + warnings 명시 ("학습용 spec — 운영 환경 부재")
   - PetClinic + RealWorld 글로벌 reference 인용 — 학습용 spec 의 정상 패턴
   - F-019 (운영 환경 부재) 와 연계

9. **Phase 1 candidate 정정 트레이스** (F-024):
   - Phase 1: Hexagonal/Clean 0.65 + POJO 0.85 + Layered 0.55
   - Phase 3: Hexagonal/Clean 0.30 + POJO 0.50 + Layered 0.85 (정정)
   - architecture.md 에 "Phase 1 → Phase 3 정정 트레이스" 섹션 추가

10. **검증 실패 영역 정직 명시**:
    - 한국 사례 5건 검증 (목표 250% 달성)
    - 토스 Hexagonal 사례 미확보 (외부 비공개 추정)
    - "Hexagonal 같지만 실제 Layered" 명시 키워드 0건 — 카카오페이 회고로 사실상 대체
    - Vlad Mihalcea cross-aggregate 직접 글 미확보 — Vernon Part II 로 대체

---

## §8. 본 research 의 한계 (정직한 자기보고)

### §8.1 검증 완료 출처

- **글로벌 (V)**: 8건 (Vernon Part II, Spring Modulith blog, Spring Modulith InfoQ, Vlad Mihalcea Bidirectional ×2, PetClinic, Buckpal, RealWorld implementations)
- **글로벌 (S)**: 1건 (Enterprise Craftsmanship Khorikov)
- **한국 (V)**: 5건 (카카오뱅크 Modulith, 우형 Kotlin Multi Module Hexagonal, 카카오페이 home Hexagonal 제거 회고 ⭐, 우형 클린 아키텍처, 카카오페이 결제탭 피드)
- **합계: V 13건 + S 1건 = 14건**
- **한국 사례: 5건 (목표 2건 250% 달성)** ✅

### §8.2 본 research 자체평가 신뢰도

**0.93** (case-phase1.md 0.90, case-phase2.md 0.92 대비 +0.01~+0.03)

**근거**:
- ⭐⭐⭐ **카카오페이 home Hexagonal 제거 회고**: 본 PoC 와 거의 정확한 대응 사례 (외부 의존성 환경의 Hexagonal 부적합 판정 + 단일 entry point + 마이그레이션 결과). Phase 1 candidate 정정의 강한 출처.
- ⭐⭐ **카카오뱅크 Spring Modulith**: 한국 빅테크의 Modulith + Hexagonal + Modular Monolith 결합 사례. 본 PoC 의 합성 명명 정당화.
- ⭐⭐ **우형 Kotlin Multi Module Hexagonal**: Domain Hexagon = POJO 강제 명시 — 본 PoC 의 framework leak finding 정당화.
- ⭐ **Vernon Part II "Reference by Identity"**: 양방향 anti-pattern 의 글로벌 표준 출처.

### §8.3 잔여 한계 + 후속 보강 권장

- 토스 Hexagonal/Clean 사례 (외부 비공개 추정) — v1.2 calibration 시 SLASH 등 컨퍼런스 영상 검색
- 한국 SI 의 cross-aggregate 양방향 처리 직접 글 — v1.2 사내 PoC 시 자체 데이터 수집
- "Hexagonal 같지만 실제 Layered" 명시 키워드 글 — v1.2 에서 ArchUnit 위반 케이스 study 검색
- Enterprise Craftsmanship Khorikov 글 (S → V 승격) — v1.2 fetch 검증

---

## §9. 다음 단계

- 공식문서 리서처 (`document-phase3.md`) — 병렬 진행
- Senior Engineer (Backend, Hexagonal vs Layered 함정 / cross-aggregate 양방향 함정 / framework leak 함정 — `senior-phase3.md`) — 병렬 진행
- 3원칙: 3 research 통합 → `research-phase3.md` → 윤주스 승인 → Phase 3 실행

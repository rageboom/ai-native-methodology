# Plan — PoC #02 Phase 3 (arch / 아키텍처)

> 작성일: 2026-04-29
> 작성자: Claude (메인) — 4원칙 1원칙
> 대상 레포: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
> Phase 1/2 인계 누적: raw confidence 0.93/0.85, finding 17건 (F-042~F-058)
> F-044/F-048 교훈 반영 — sub-agent prompt 에 "메인 1차 추정 + cross-check 의무" 형식 명시

---

## 0. 진입 컨텍스트

### Phase 1/2 인계 핵심

- **multi-module Hexagonal naming hybrid** (Phase 1 cap 0.65)
- **JPA Entity = SoT 단일** (Phase 2 DEC-001 — schema.sql ORM derivative)
- 모듈: `module/core` (도메인 + Repository port + Service) / `module/persistence` (JPA Adapter + Specifications) / `server/api` (Controller + SecurityConfig)
- 의존 방향 (build.gradle.kts):
  - core: `jakarta.persistence-api` 만 (단 root subprojects 가 spring-boot 강제 — Phase 1 Senior 정정)
  - persistence: `implementation(:module:core)` + `runtimeOnly(h2)` + `data-jpa/cache/p6spy`
  - api: `compileOnly(:module:core) + testCompileOnly(:module:core) + runtimeOnly(:module:persistence)` + `web/oauth2-rs`
- F-048 (TagJpaRepository 타입 오류) Phase 3 architecture 검증 시 합산
- F-051 (EAGER + Specification + Pageable HHH000104) Phase 3 ArticleSpecifications 구조 검증 시 합산

### Auto Mode 활성

- 윤주스 명시 → 4원칙 자율 진행. 3원칙 게이트 1회 (sub-agent 결과 + 결정).

---

## 1. 작업 범위 (Phase 3 명세 §1~§9 매핑)

| 명세 항목                         | 산출                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| §1 목적                           | 모듈 구성 + 의존성 + 아키텍처 패턴 + 모듈↔테이블 매핑                                                     |
| §3.1 결정적 처리                  | AST import 그래프 (이미 메인이 직접 grep 으로 처리) + Tarjan SCC                                          |
| §3.1.1 순환 의존성 (v1.1.2 F-023) | 검출 + BC 분류 (bc_status/explicit/documented) + severity 자동 산정                                       |
| §3.2 LLM 처리                     | 모듈 책임 / 아키텍처 패턴 / 레이어 위반 후보 — sub-agent 합의                                             |
| §3.3 모듈↔테이블 매핑             | 7 테이블 (Phase 2) → BC 후보                                                                              |
| §4.1 출력                         | architecture.json / .md / .mermaid / dependency-graph.mermaid / circular-dependencies.md / \_manifest.yml |
| §6 신뢰도                         | 모듈 식별 1.0 / 의존 그래프 1.0 / 외부 호출 0.95 / LLM 영역 0.6~0.7 / 매핑 0.85                           |

---

## 2. 메인 사전 raw fetch — 직접 발견 ( 5건)

### 2.1 Layer Violation 검증 — 본 환경 0건

**메인 직접 grep 결과**:

```bash
# module/core → module/persistence: 0건 ✅
grep -rn "import io.zhc1.realworld.persistence" module/core/src/main/java/  # (none)

# module/core → server/api: 0건 ✅
grep -rn "import io.zhc1.realworld.api\|import io.zhc1.realworld.config" module/core/src/main/java/  # (none)

# module/persistence → server/api: 0건 (TagRepositoryAdapter 의 config import 는 module/persistence 자체 패키지)
```

→ **PoC #01 LV-001 (AppArt → InfJwt) / LV-002 (도메인 → 프레임워크) 본 환경 비재현 확정**. multi-module compileOnly + runtimeOnly 컴파일 시점 차단 효과 입증.

### 2.2 Service 간 직접 의존 0건 — Circular 비재현

**메인 직접 grep 결과** (5 Service 의 io.zhc1 import 분석):

- ArticleService: `model.*` 만 의존. 다른 Service 호출 0
- UserService: `model.*` 만 의존
- ArticleCommentService: `model.*` 만 의존
- UserRelationshipService: `model.*` 만 의존
- TagService: `model.*` 만 의존

→ **PoC #01 CIRCULAR-001 (User domain ↔ Article application 등) 비재현 확정**. Service 가 다른 Service 호출 없이 Repository (port) 만 사용 = 깔끔한 구조.

### 2.3 Split Package smell 신규 finding 후보 (PF-P3-MAIN-001)

**메인 직접 발견** — `io.zhc1.realworld.config` 패키지가 **module/persistence + server/api 양쪽에 존재**:

| 모듈                           | config 패키지 파일 (4 + 8 = 12)                                                                                                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| module/persistence/.../config/ | JpaConfiguration.java / CacheConfiguration.java / DataSourceConfiguration.java / CacheName.java                                                                                                                                   |
| server/api/.../config/         | SecurityConfiguration.java / AuthToken.java / AuthTokenProvider.java / AuthTokenConverter.java / AuthTokenResolver.java / SecurityPasswordEncoderAdapter.java / ObjectMapperConfiguration.java / ApplicationExceptionHandler.java |

**위험**:

- Java 9+ Module System (`module-info.java`) 도입 시 즉시 컴파일 에러 (split package 금지)
- ArchUnit / Spring Modulith 의 module 경계 검증 시 경고 발생
- 클래스 검색 시 IDE 가 같은 패키지로 인식 → 잘못된 import 자동 완성 위험

**현재 미발현 이유**:

- 본 PoC 가 classpath 기반 (module-info.java 미사용)
- Spring Modulith / ArchUnit 미도입

→ **architectural smell** — severity medium. F-044 / F-048 와 같은 "잠복 함정" 패턴.

### 2.4 module/core 의 Spring 의존 (Phase 1 Senior 정정 재확인)

```java
// UserService.java
@Service  // import org.springframework.stereotype.Service
public class UserService { ... }

// User.java
@Entity   // import jakarta.persistence.Entity
@Table(name = "users")
public class User { ... }
```

→ **Pure Hexagonal NOT** 재확인. Phase 1 Senior 정정 (Modular Monolith with Ports & Adapters Naming hybrid) 정합. cap 0.65 → Phase 3 에서 확정.

### 2.5 ArticleSpecifications 위치 — Hexagonal 정합

`module/persistence/.../persistence/ArticleSpecifications.java` (line 16-44, package-private final class):

- `Specification<Article>` 반환 (Spring Data JPA 의 infrastructure detail)
- core (도메인) 가 아닌 persistence (infrastructure adapter) 위치 = **Hexagonal 정합**
- **F-051 (EAGER + Pageable HHH000104) 와 결합 시 위험** — Senior 시나리오 3 발생 위치

---

## 3. 메인 1차 추정 ( 단언 아님 — sub-agent cross-check 의무 )

### 3.1 모듈 구조 1차 추정 (10~12 모듈)

| ID                 | 이름                              | 경로                                  | layer          | 책임                                                                                                     |
| ------------------ | --------------------------------- | ------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| MOD-CORE-MODEL     | core/model (도메인 모델)          | `module/core/.../model/`              | domain         | 7 @Entity + 6 Repository port + Value (ArticleDetails/ArticleFacets/UserRegistry) + PasswordEncoder port |
| MOD-CORE-SERVICE   | core/service (도메인 서비스)      | `module/core/.../service/`            | application    | 5 @Service (Article/User/ArticleComment/UserRelationship/Tag) — POJO domain orchestration                |
| MOD-PERS-ADAPTER   | persistence/persistence (Adapter) | `module/persistence/.../persistence/` | infrastructure | 7 RepositoryAdapter + 6 JpaRepository + ArticleSpecifications                                            |
| MOD-PERS-CONFIG    | persistence/config                | `module/persistence/.../config/`      | infrastructure | JpaConfiguration / CacheConfiguration / DataSourceConfiguration / CacheName                              |
| MOD-API-CONTROLLER | api/api (Controller)              | `server/api/.../api/`                 | presentation   | 6 RestController + 13 Request/Response DTO + 1 Mixin                                                     |
| MOD-API-CONFIG     | api/config                        | `server/api/.../config/`              | infrastructure | SecurityConfiguration + AuthToken (4) + Adapter (Password/Mapper/ExceptionHandler)                       |
| MOD-API-MIXIN      | api/mixin                         | `server/api/.../mixin/`               | shared         | AuthenticationAwareMixin                                                                                 |
| MOD-APP            | api/RealWorldApplication          | `server/api/.../`                     | application    | @SpringBootApplication entry point                                                                       |

### 3.2 의존성 그래프 1차 추정

- presentation (api) → application (core/service) → domain (core/model)
- domain (core/model) → ports (Repository interface in core/model)
- infrastructure (persistence/persistence + persistence/config) → ports (Repository interface in core/model)
- infrastructure (api/config) → ports (PasswordEncoder interface in core/model) — SecurityPasswordEncoderAdapter
- **반향 의존성 (위반)**: 0건 ✅

### 3.3 아키텍처 스타일 1차 추정

- **primary**: `modular_monolith` (multi-module + ports/adapters naming + Spring 강제 spring 의존)
- **secondary**: `hexagonal` partial (port/adapter 분리 + Specifications 위치 정합)
- **NOT**: `layered` (presentation/application/persistence 단방향 흐름은 있으나 명시적 layer 분리 부재)
- **NOT**: `clean` (entity = JPA @Entity + @Service in core)
- Phase 1 cap 0.65 → Phase 3 에서 `confidence: 0.80~0.85` 격상 가능

### 3.4 PoC #01 finding 본 환경 검증 1차 결론

| PoC #01 ID                                                   | 1차 결론                                                         | sub-agent 검증 의무                                          |
| ------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| **AP-ARCH-001** (LV-001 — application → infrastructure 직접) | ❌ **비재현** (multi-module 컴파일 차단)                         | Senior 직접 import 그래프 검증                               |
| **AP-ARCH-002** (LV-002 — domain → framework)                | ⚠️ **부분 재현** (core 가 @Service / @Entity 사용 — Spring 강제) | Phase 1 Senior 정정과 정합. severity 재평가                  |
| **CIRCULAR-001** (User ↔ Article 등)                         | ❌ **비재현** (Service 간 직접 의존 0)                           | Senior 직접 그래프 검증                                      |
| **F-023** (closed — circular BC 분류)                        | ✅ **0건이므로 N/A**                                             | 명세 §3.1.1 BC 분류 절차 적용 사례 부재 = closed 안정성 검증 |

### 3.5 신규 candidate (메인 사전 추정)

| 임시 ID          | 제목                                                                                                  | severity 1차               |
| ---------------- | ----------------------------------------------------------------------------------------------------- | -------------------------- |
| `PF-P3-MAIN-001` | Split Package — `io.zhc1.realworld.config` 가 module/persistence + server/api 양쪽 존재               | medium                     |
| `PF-P3-MAIN-002` | core/service 가 @Service Spring 의존 — Pure Hexagonal NOT (Phase 1 Senior 정정 재확인 / Phase 3 확정) | low (의도된 hybrid caveat) |
| `PF-P3-MAIN-003` | Adapter classes package-private (TagRepositoryAdapter 등) — 의도된 캡슐화 vs 시각성 부족              | low                        |

### 3.6 Phase 4 BC 후보 1차 추정

| BC                      | 모듈                                                                                                                                                 | 테이블                                                           | Aggregate Root |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------- |
| BC-CONTENT              | core/model (Article/ArticleComment/ArticleTag/ArticleFavorite/Tag) + core/service (Article/ArticleComment/Tag) + persistence/persistence (5 Adapter) | article / article_comment / article_tag / article_favorite / tag | Article        |
| BC-USER                 | core/model (User/UserFollow) + core/service (User/UserRelationship) + persistence/persistence (3 Adapter)                                            | users / user_follow                                              | User           |
| BC-AUTH (cross-cutting) | api/config (SecurityConfiguration / AuthToken / SecurityPasswordEncoderAdapter) + core/model (PasswordEncoder port)                                  | (없음 — JWT stateless)                                           | (없음)         |

→ PoC #01 의 BC-CONTENT/BC-USER/BC-AUTH 와 정합. multi-module 환경에서 BC 경계가 더 명확.

---

## 4. 변경 대상 (생성 파일)

```
ai-native-methodology/examples/poc-02-realworld-springboot3/output/architecture/
├── architecture.json                  # 신규 (architecture.schema.json 정합)
├── architecture.md                    # 신규 (사람용 + Phase 1 cap 0.65 정정 트레이스)
├── architecture.mermaid               # 신규 (C4 Level 3 component diagram)
├── dependency-graph.mermaid           # 신규 (의존성 그래프 — multi-module + 패키지 단위)
├── circular-dependencies.md           # 신규 (CIRCULAR 0건 보고 + closed F-023 §3.1.1 안정성)
└── _manifest.yml                      # 신규 (신뢰도 + 결정 + finding + KPI)
```

---

## 5. sub-agent 리서치 토픽 (2원칙)

### 5.1 Document Researcher

- Spring Modulith 의 module boundary 검증 도구 (Spring Boot 3.x)
- ArchUnit `slices().beFreeOfCycles()` 적용 사례
- Hexagonal Architecture 공식 정의 (Alistair Cockburn) vs 본 PoC fit
- Java Module System (JPMS) split package 금지 spec
- Spring Boot 3.x multi-module + compileOnly 의 컴파일 차단 효과 (공식 docs)
- F-023 (closed) §3.1.1 BC 분류 절차 — 본 PoC 0건 케이스의 closed 안정성 검증

### 5.2 Case Researcher

- Netflix / 우형 / 카카오 / 토스 — multi-module hexagonal naming + Pure Hexagonal hybrid 사례
- Java module-info / split package 사고 사례
- compileOnly + runtimeOnly 의존성 전략 한국 사례 (우형 배민 mono-repo 등)
- Spring Modulith 도입 후 architectural smell 발견 사례
- AP-ARCH-001/002 (LV-001/002) 한국 실무 빈도 — multi-module 으로 회피 가능한가
- 단일 PoC 과적합 §8.1 — Hexagonal hybrid 가 일반 사례 vs 본 PoC 특이성

### 5.3 Senior BE Engineer ( F-044/F-048 패턴 정정 책임)

- 메인 1차 추정 5건 검증 (직접 read + 정정)
- 모듈 의존성 그래프 직접 검증 (메인 grep 결과 cross-check)
- Adapter naming + scope (compileOnly/runtimeOnly) 의 함정 (특히 Spring Bean 자동 발견 / @ComponentScan 범위)
- Split Package smell severity 권고
- core 가 Spring 의존 (Pure Hexagonal NOT) 의 함정 — `module-info.java` 도입 시 / Hexagonal 인증 시
- ArticleSpecifications 위치 (persistence) 와 F-051 결합 영향
- F-048 (TagJpaRepository 타입 오류) 의 architecture 영향 (Spring Bean lifecycle 에서 검증 미발생)
- circular dependency 직접 그래프 검증 — 메인 추정 0건 정합 여부
- BC 후보 검증 (BC-CONTENT/BC-USER/BC-AUTH) — Phase 4 입력 적정성

### 5.4 sub-agent prompt 공통 의무 (F-044 + F-048 교훈)

- 메인 1차 추정은 **단언 아님** — 직접 read + grep + 패키지 검증 의무
- F-044 / F-048 패턴 재현 가능성 — sub-agent 가 메인 단편 fetch 함정 발견하면 신규 finding 등록
- Senior 가 핵심 정정자 — 메인 5건 추정 cross-check + 신규 발견

---

## 6. 영향도 / 리스크 / Caveat

### 6.1 영향도

| 영역                      | 영향                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 (도메인)          | BC 후보 (BC-CONTENT/BC-USER/BC-AUTH) → Aggregate 추출 입력                                                                                        |
| Phase 4 (5.D 외부 의존성) | 외부 시스템 통합점 (HTTP 클라이언트) 0건 — RealWorld 단순성                                                                                       |
| Phase 6 (안티패턴)        | F-051 (EAGER) Phase 3 에서 ArticleSpecifications 위치 검증 시 합산 / F-048 (TagJpaRepository) Spring Bean 검증 시 합산 / Split Package smell 신규 |
| 방법론 본체               | F-023 (closed) §3.1.1 BC 분류 0건 케이스 — closed 안정성 검증 데이터                                                                              |

### 6.2 리스크

| 리스크                                                  | 대응                                           |
| ------------------------------------------------------- | ---------------------------------------------- |
| 메인 grep 의 import 그래프가 일부 누락 가능 (간접 의존) | Senior 직접 read 로 cross-check                |
| Phase 1 cap 0.65 의 정정 트레이스 충실 작성 필요        | architecture.md 에 Phase 1 → Phase 3 정정 섹션 |
| Split Package 가 본 PoC 의 첫 발견 — PoC #01 비교 부재  | §8.1 단일 PoC 과적합 회피 — 가이드만 격상      |
| F-048 의 architecture 영향 검증 누락 위험               | Senior 의무 명시                               |

### 6.3 Caveat

- 본 phase 신뢰도 0.85~0.92 예상 (모듈 식별 1.0 / LLM 영역 0.6~0.7 평균)
- 외부 의존성 0건 — RealWorld 단순성 (사내 적용 시 5.D 보강 필요 caveat)

---

## 7. 산출물 체크리스트 (Phase 3 명세 §5)

- [ ] architecture.json schema 검증 통과 (`schemas/architecture.schema.json`)
- [ ] Mermaid Component diagram 렌더링 검증
- [ ] 모든 모듈에 ID/책임 명시 (8~12개 모듈)
- [ ] 순환 의존성 = 0 (메인 검증 + Senior cross-check) — closed F-023 §3.1.1 안정성 검증
- [ ] 모듈 ↔ 테이블 매핑 = 사용자 검토 (BC-CONTENT 5 / BC-USER 2)
- [ ] 아키텍처 스타일 후보 = Phase 1 cap 0.65 정정 트레이스 (modular_monolith 0.85 격상 가능)
- [ ] 외부 의존성 위치 = Phase 4 5.D 라우팅 준비 (0건 caveat)
- [ ] 신규 finding 정식 등록 (PF-P3-MAIN-001/002/003 + sub-agent 발견)
- [ ] PROGRESS-poc02-phase3.md 시간순 로그

---

## 8. 다음 단계 (4원칙 사이클)

1. ✅ 1원칙 — 본 plan 완성
2. ⏳ 2원칙 — sub-agent 3종 병렬 spawn → research-phase3-poc02.md 통합
3. ⏳ 3원칙 — 사용자 승인 게이트 (1회 — 핵심 결정 일괄)
4. ⏳ 4원칙 — 4단계 산출 6종 + finding 등록
5. ⏳ Phase 3 마감 → Phase 4 (비즈니스 로직) 인계

---

## 9. 참조

- 명세: `methodology-spec/workflow/phase-3-arch.md` (v1.1.2)
- 스키마: `schemas/architecture.schema.json`
- 선행 PoC #01 산출: `examples/poc-01-realworld-spring/output/architecture/`
- Phase 1/2 인계: `output/inventory/_manifest.yml` + `output/db/_manifest.yml`
- Phase 1/2 finding: `findings/poc-findings.md` (F-042~F-058)
- ADR-006 (Cycle 처리 default 정책 / Provisional)

---

**END OF plan-phase3-poc02.md**

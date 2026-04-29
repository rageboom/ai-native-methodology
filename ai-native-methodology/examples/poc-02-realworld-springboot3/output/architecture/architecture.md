# Architecture — PoC #02 (Phase 3)

> 작성: 2026-04-29
> 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
> 명세: methodology-spec/workflow/phase-3-arch.md (v1.1.2)
> raw confidence: 0.92

---

## 1. 시스템 개요

### 1.1 시스템 정보

- **이름**: RealWorld Java 21 Spring Boot 3.3 (1chz)
- **스택**: Spring Boot 3.3.0 / Java 21 / Hibernate 6 / Jakarta Persistence 3.x / H2 in-memory MODE=MYSQL
- **빌드**: Gradle Kotlin DSL multi-module (3 모듈)
- **인증**: OAuth 2.0 Resource Server (JWT Bearer / RSA 비대칭)

### 1.2 모듈 구조

```
realworld-java21-springboot3/
├── module/core/          # 도메인 + Application Service (port-based)
├── module/persistence/   # JPA Adapter + Configuration
└── server/api/           # REST Controller + Security Config + Entry Point
```

---

## 2. 아키텍처 스타일

### 2.1 식별 결과

| 차원 | 점수 | 비고 |
|---|---|---|
| **modular_monolith (primary)** | **0.85** ⭐ | Phase 1 cap 0.65 → Phase 3 0.85 (Δ +0.20 격상) |
| hexagonal (secondary) | 0.55 | partial — Cockburn 4번 위배 (core 가 framework 의존) |
| ports_adapters_naming | 0.70 | Repository port + RepositoryAdapter 명명 100% 일치 |
| layered (refuted) | 0.20 | 명시적 layer 분리 부재 |
| clean (refuted) | 0.15 | entity = JPA @Entity + @Service in core |

### 2.2 5-차원 평가 (PoC #01 기준)

| 차원 | 본 PoC | 평가 |
|---|---|---|
| framework_annotation_in_domain | core 가 7 @Entity (jakarta) + 5 @Service (Spring) 사용 | **Pure Hexagonal 위배** (Cockburn 4번) |
| application_to_infrastructure_direct | 0건 (compileOnly + runtimeOnly 컴파일 차단) | ✅ 정합 |
| port_adapter_separation | 6 Repository port + 7 RepositoryAdapter + PasswordEncoder port + SecurityPasswordEncoderAdapter | ✅ 100% 일치 |
| domain_to_infrastructure_via_port | 100% (Service 가 Repository port 만 사용) | ✅ 정합 |
| anemic_vs_rich_domain | Rich (User.encryptPassword / Article.addTag / Article.titleToSlug 등) | ✅ Rich |

→ **결론**: "Modular Monolith with Ports & Adapters Naming" hybrid (Pure Hexagonal NOT). Phase 1 Senior 정정 라벨 정합.

### 2.3 Phase 1 → Phase 3 정정 트레이스

| 항목 | Phase 1 cap | Phase 3 confidence | Δ |
|---|---|---|---|
| modular_monolith | 0.65 | **0.85** | **+0.20** ⭐ |
| hexagonal | 0.50 | 0.55 | +0.05 |
| ports_adapters_naming | (미인식) | 0.70 | +0.70 (신규 차원) |

**격상 근거** (3 사례 정합 — Case Researcher):
1. 우아한형제들 ceo-united (techblog.woowahan.com/12720) — multi-module hexagonal hybrid
2. 카카오뱅크 메시지허브 (tech.kakaobank.com/posts/2311) — 동일 정책
3. 카카오뱅크 Spring Modulith (2025-07) — 거의 동일 3 Gradle module 구조

**hybrid 정당화 권위**:
- 권용근 (우형) 인용: **"순수성을 위해서 실용성을 포기하는건 어리석은 일이다. 도메인이 인프라를 알아도 괜찮다면 불필요한 인터페이스 계층을 제거할 수 있다"**
- 카카오페이 home Hexagonal 제거 회고 — Hexagonal 적용 3 전제 중 1/3 만 충족

→ F-024 (PoC #01 Phase 1 vs Phase 3 Δ 임계 promoted) 의 "Δ -0.35 임계" 와 다른 방향. **본 PoC 는 Phase 1 cap 이 적절했고 Phase 3 에서 권위 데이터 확보 후 격상** = 건강한 패턴.

---

## 3. 모듈 식별

### 3.1 모듈 목록 (8개)

| ID | 이름 | layer | 책임 | LOC |
|---|---|---|---|---|
| MOD-CORE-MODEL | core/model | domain | 7 @Entity + 6 Repository port + 3 VO + PasswordEncoder port | 800 |
| MOD-CORE-SERVICE | core/service | application | 5 @Service (Repository port 만 의존) | 420 |
| MOD-PERS-ADAPTER | persistence/persistence | infrastructure | 7 RepositoryAdapter + 6 JpaRepository + ArticleSpecifications | 593 |
| MOD-PERS-CONFIG | persistence/config | infrastructure | JpaConfiguration + CacheConfiguration + DataSourceConfiguration + CacheName | 80 |
| MOD-API-CONTROLLER | api/api | presentation | 6 RestController + 13 DTO | 850 |
| MOD-API-CONFIG | api/config | infrastructure | SecurityConfiguration + AuthToken (4) + Adapter (3) | 220 |
| MOD-API-MIXIN | api/mixin | shared | AuthenticationAwareMixin | 7 |
| MOD-APP | RealWorldApplication | application | @SpringBootApplication entry | 10 |

### 3.2 Bounded Context 후보 (Phase 4 입력)

| BC | 모듈 | 테이블 | Aggregate Root |
|---|---|---|---|
| **BC-CONTENT** | core/model + core/service + persistence + api | article / article_comment / article_tag / article_favorite / tag | Article |
| **BC-USER** | core/model + core/service + persistence + api | users / user_follow | User |
| **BC-AUTH** (cross-cutting) | api/config + api/mixin + core/model (PasswordEncoder port) | (없음 — JWT stateless) | (없음) |

→ PoC #01 정합. multi-module 환경에서 BC 경계가 더 명확.

---

## 4. 의존성 그래프

### 4.1 Build 시스템 의존 (Gradle)

```
module/core            ─→ jakarta.persistence-api (only)
module/persistence     ─→ implementation(:module:core) + h2 + data-jpa + cache + p6spy
server/api             ─→ compileOnly(:module:core) + runtimeOnly(:module:persistence) + web + oauth2-rs
```

### 4.2 Source-level Import 의존

- api Controller → core/model (32) + core/service (18) + api/config (12) + api/mixin (5)
- core/service → core/model (22)
- persistence/persistence → core/model (16)
- api/config → core/model (1) — SecurityPasswordEncoderAdapter implements PasswordEncoder port
- persistence/persistence → persistence/config (1) — TagRepositoryAdapter imports CacheName (자체 모듈 내)

### 4.3 Layer Violation 검증

| 검증 항목 | 결과 |
|---|---|
| module/core → module/persistence 직접 import | **0건** ✅ |
| module/core → server/api 직접 import | **0건** ✅ |
| module/persistence → server/api 직접 import | **0건** ✅ |
| Service → Service 직접 호출 | **0건** ✅ (CIRCULAR 0) |

→ **PoC #01 AP-ARCH-001 (LV-001) / AP-ARCH-002 (LV-002) 비재현** — multi-module compileOnly + runtimeOnly 컴파일 시점 차단 효과.

---

## 5. 외부 의존성

**0건** — RealWorld spec 단순성 (HTTP 클라이언트 / MQ / 외부 SDK 부재).

⚠️ **Caveat**: 사내 적용 시 Phase 4 5.D (외부 의존성 매핑) 별도 검증 필수. PoC 한계.

---

## 6. 신규 발견 (Phase 3)

### 6.1 Split Package smell — F-063 medium DEFERRED ★

**`io.zhc1.realworld.config` 패키지가 module/persistence + server/api 양쪽 존재**:

| 모듈 | config 파일 |
|---|---|
| module/persistence/.../config/ | JpaConfiguration / CacheConfiguration / DataSourceConfiguration / CacheName (4 main + 1 test) |
| server/api/.../config/ | SecurityConfiguration / AuthToken / AuthTokenProvider / AuthTokenConverter / AuthTokenResolver / SecurityPasswordEncoderAdapter / ObjectMapperConfiguration / ApplicationExceptionHandler (8 main + 3 test) |

→ **4 location 16 파일** — JLS §7.7.2 compile-time error 위반 (Java 21 module path 빌드 시).

**현재 미발현**:
- Spring Boot 3.x JPMS 미지원 (silent 보장)
- classpath 기반 빌드 (module-info.java 미사용)

**위험 시나리오**:
1. module-info.java 추가 시 즉시 컴파일 에러
2. Spring Modulith verify() 도입 시 즉시 violation
3. IDE 가 같은 패키지 인식 → 잘못된 import auto-completion

**§8.1 deferred** — 본 PoC 특이 (우형/카뱅 회피). PoC #03 cross-stack 검증 후 격상.

### 6.2 compileOnly + runtimeOnly 모범 사례 — F-064 (positive) DEFERRED ★

server/api 의 `compileOnly(:module:core) + runtimeOnly(:module:persistence)` = **국내 사례 중 가장 명시적이고 단순한 Hexagonal 강제 메커니즘**:
- 우형 ceo-united: framework selective `@ComponentScan`
- 카뱅 메시지허브: `@ConditionalOnExpression`
- 카뱅 Spring Modulith: `GoodsModuleDetectionStrategy`
- **본 PoC: compileOnly + runtimeOnly = Gradle 빌드 시스템 강제** (Vlad 권위급 단순성)

**§8.1 deferred** — PoC #03 (다른 빌드 시스템) 검증 후 모범 사례 격상.

### 6.3 closed F-023 §3.1.1 0건 케이스 한계 — F-060 medium PROMOTED ★

phase-3-arch.md §3.1.1 (closed F-023 산출) 의 5단계 절차가 cycle 0건 케이스 명시 부재. circular-dependencies.md §3 참조.

**closed 명세 한계 누적 2건** (F-049 + F-060) → finding-system closed → reopened 절차 정식화 권위 강화.

### 6.4 모듈 boundary 도구 도입 권고 부재 — F-059 medium PROMOTED

§3.1.1 Step 4 가 "Spring Modulith / ArchUnit 활성" 가정만. 도구 미도입 환경 권고 단서 부재.

---

## 7. PoC #01 finding 외부 검증 결과

### 7.1 closed 안정성

| PoC #01 ID | 결과 |
|---|---|
| F-007 (inventory) | ✅ 안정 (Phase 1) |
| F-009 (신뢰도 표) | ✅ 안정 (Phase 1) |
| **F-016 (Decision Tree)** | ⚠️ 한계 발견 (Phase 2 F-049) |
| **F-023 (Tarjan SCC + BC)** | ⚠️ **한계 발견 (Phase 3 F-060)** ★ |

→ **closed 4건 중 2건 외부 검증 한계 발견 ★★★** = 메타 발견. 묶음 I (메타 finding) 신설 강한 근거.

### 7.2 promoted 외부 검증

| PoC #01 ID | 본 PoC 결과 |
|---|---|
| AP-ARCH-001 (LV-001) | ❌ 비재현 — multi-module 차단 (F-065 권위 promoted) |
| AP-ARCH-002 (LV-002) | ⚠️ 부분 재현 — core 가 spring-boot 강제 (F-062 caveat) |
| CIRCULAR-001 | ❌ 비재현 — Service 간 호출 0 (F-066 권위 promoted) |
| F-024 (Phase 1 vs 3 Δ) | 본 PoC Δ +0.20 (격상 방향) |
| F-025 (hybrid 표현) | 재현 강함 |

---

## 8. 신뢰도 자평

```yaml
raw_confidence: 0.92
confidence_breakdown:
  module_identification: 1.0 (deterministic)
  dependency_graph: 1.0 (grep 검증)
  circular_detection: 1.0 (Tarjan SCC 0건)
  external_dependencies: 0.95 (0건)
  module_responsibility: 0.85 (LLM)
  architecture_style: 0.85 (LLM, 3 사례 권위 격상)
  layer_violation_detection: 0.90 (LLM)
  module_table_mapping: 0.92 (LLM)
weighted_average: 0.92
```

명세 §6 의 신뢰도 표 정합. F-024/F-025 promoted 와 함께 신뢰도 산출.

---

## 9. 결론

1. **architecture_style 격상**: Phase 1 cap 0.65 → Phase 3 0.85 (Δ +0.20)
2. **CIRCULAR 0건 / Layer Violation 0건** — multi-module 효과 입증
3. **PoC #01 finding 비재현 우세**: AP-ARCH-001 / CIRCULAR-001 비재현, AP-ARCH-002 부분 재현
4. **신규 critical/high 발견 0건** — Phase 1/2 교훈 흡수 후 Phase 3 안정 영역
5. **closed 명세 한계 추가 발견 (F-060)** — F-049 와 함께 누적 2건
6. **§8.1 강제**: 본 PoC 특이 2건 (Split Package + compileOnly/runtimeOnly) → PoC #03 검증 후 격상

→ **PoC #03 (다른 stack) 진입 신호** — 동일 stack 수확 감소 영역 진입 명확.

---

## 10. 다음 단계 (Phase 4 인계)

- BC 후보 3개 (BC-CONTENT / BC-USER / BC-AUTH cross-cutting)
- Aggregate 후보: User / Article / Tag / ArticleComment
- 외부 의존성 0건 (5.D 빈약 — caveat)
- F-048 (TagJpaRepository) Phase 4 도메인 모델 검증 시 합산
- F-051 (EAGER + Specification + Pageable HHH000104) Phase 6 합산

---

**END Architecture (Phase 3 ✅)**

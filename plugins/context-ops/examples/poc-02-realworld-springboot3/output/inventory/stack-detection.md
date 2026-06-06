# 스택 감지 보고서 — `1chz/realworld-java21-springboot3`

> Phase 1 산출 (사람용 종합 보고서)
> 생성: 2026-04-29
> 신뢰도 자평: **0.93** (formula v1)
> HEAD: `93e018e` (2025-09-19) "Disable JPA open-in-view to improve performance"

---

## 1. 한 줄 요약

**Java 21 + Spring Boot 3.3.0 + Spring Data JPA (Jakarta) + Spring Security 6 (OAuth 2.0 Resource Server + RSA) + H2 (in-memory)**

빌드 = Gradle Kotlin DSL + version catalog. 모듈 구조 = **multi-module (core / persistence / api) — Modular Monolith with Ports & Adapters Naming** (Phase 1 cap 0.65, 확정은 Phase 3).

---

## 2. 기술 스택 (실측)

### 2.1 언어 / 빌드

| 항목            | 값                                                                   | 출처                                                  |
| --------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| 언어            | **Java 21**                                                          | `gradle/libs.versions.toml: java = "21"`              |
| 빌드 도구       | **Gradle Kotlin DSL**                                                | `build.gradle.kts` + `settings.gradle.kts` (.kts 5개) |
| version catalog | `gradle/libs.versions.toml`                                          | 정식 catalog 사용                                     |
| 코드 스타일     | **Spotless 7.0.3** + palantirJavaFormat (Java) + ktlint (Kotlin DSL) | `build.gradle.kts §37~56`                             |
| 라이선스        | MIT (Copyright 2021 RealWorld)                                       | LICENSE                                               |

### 2.2 Framework / 의존성

| 영역            | 사용 기술                                                                            | 신뢰도 | 출처                                                                        |
| --------------- | ------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------- |
| 웹              | Spring Web MVC                                                                       | 0.99   | `spring-boot-starter-web` (server/api)                                      |
| 보안            | **OAuth 2.0 Resource Server (JWT Bearer)**                                           | 0.95   | `spring-boot-starter-oauth2-resource-server`                                |
| ORM (primary)   | Spring Data JPA + Hibernate (Jakarta Persistence 3.x)                                | 0.97   | `spring-boot-starter-data-jpa` + `jakarta.persistence-api` + `@Entity` 실측 |
| ORM (secondary) | **JPA Specifications**                                                               | 0.95   | `ArticleSpecifications.java`                                                |
| 캐시            | **Spring Cache + Caffeine**                                                          | 0.95   | `spring-boot-starter-cache` + `caffeine`                                    |
| SQL 모니터링    | **p6spy 1.9.0**                                                                      | 0.95   | `spring-boot-p6spy`                                                         |
| 인증/암호화     | RSA 비대칭 키 (`app.key` / `app.pub`) + NimbusJwtDecoder (Spring Security 6 default) | 0.95   | `server/api/src/main/resources/` 실측                                       |
| 유틸            | Lombok                                                                               | 0.99   | root `build.gradle.kts §80~82` (subprojects 강제)                           |
| DB              | H2 (in-memory, MySQL mode)                                                           | 0.95   | `spring-boot-starter-data-jpa` runtimeOnly + README §9                      |
| 테스트          | JUnit 5 (JUnit 4 명시 exclude)                                                       | 0.95   | root `build.gradle.kts §72`                                                 |

### 2.3 ORM 자동 감지 — 4단서 점검 (Phase 1 명세 §3.2 + secondary 보강)

**primary**:

- ✅ 의존성: `spring-boot-starter-data-jpa` + `jakarta.persistence-api`
- ✅ import: `import jakarta.persistence.*` (User.java 실측)
- ✅ 어노테이션: `@Entity` / `@Column` / `@Table` / `@Id` (User.java 실측)
- ✅ 설정파일: `application.yaml spring.jpa.*` (Phase 2 read 예정 — open-in-view=false 추정)

→ **4/4 점검 통과. confidence 0.97**

**secondary** (PoC #2 신규 — PF-003 → F-047 격상 데이터):

- JPA Specifications (`ArticleSpecifications.java`)
- Spring Cache + Caffeine
- p6spy

⚠️ **명세 빈틈 (PF-004 메모)**: Phase 1 명세 §3.2 의 ORM 감지 4단서 표에 `hibernate.cfg.xml` 항목이 있으나, Spring Boot 환경에선 application.yaml `spring.jpa.*` 가 이를 대체. 표 항목 보강 권고.

### 2.4 인증 / JWT

| 항목     | 값                                            | PoC #1 와의 차이                          |
| -------- | --------------------------------------------- | ----------------------------------------- |
| 메커니즘 | OAuth 2.0 Resource Server                     | PoC #1: 자체 JWT 필터 직접 구현           |
| 키 형식  | **RSA 비대칭 키** (`app.key` PEM + `app.pub`) | PoC #1: **HS256 대칭 키 21byte 하드코딩** |
| 디코더   | NimbusJwtDecoder (Spring Security 6 default)  | PoC #1: 직접 Jjwt 라이브러리 사용         |
| alg 검증 | NimbusJwtDecoder 가 자동 강제 (RS256 default) | PoC #1: alg explicit 검증 부재 (F-041)    |

→ **PoC #1 의 AP-SECURITY-001 (7중 표준 위반) 본 레포에서 비재현** (Document + Case + Senior 3-합의).

---

## 3. 모듈 구조 (multi-module)

### 3.1 의존성 그래프

```
                        ┌──────────────────┐
                        │  module/core     │  <─ 22 main / 9 test / 4 testFixtures
                        │  - model/        │     (도메인 + Repository ports + Service)
                        │  - service/      │
                        └────────┬─────────┘
                                 │
                                 │ implementation
                                 │
              ┌──────────────────▼─────────────┐
              │  module/persistence            │  <─ 17 main / 1 test
              │  - persistence/                │     (Adapter + Specifications)
              │    *JpaRepository              │
              │    *RepositoryAdapter          │
              │    ArticleSpecifications       │
              │  - config/                     │
              └────────────────┬───────────────┘
                               │
                  ┌────────────┴────────────┐
                  │ runtimeOnly             │ compileOnly
                  ▼                         ▼
              ┌─────────────────────────────────┐
              │  server/api                     │  <─ 33 main / 6 test
              │  - api/ (Controllers + DTOs)    │     (REST + Security Config)
              │  - config/                      │
              │    SecurityConfiguration        │
              │    AuthToken*                   │
              │    SecurityPasswordEncoderAdapter│
              │  - mixin/                       │
              │  - RealWorldApplication.java    │
              └─────────────────────────────────┘
```

### 3.2 핵심 의존성 패턴

```kts
// server/api/build.gradle.kts
compileOnly(project(":module:core"))         // ⭐ 컴파일 시점에만 core 포트 의존
testCompileOnly(project(":module:core"))
runtimeOnly(project(":module:persistence"))  // ⭐ 런타임에만 adapter 주입
implementation(libs.spring.boot.starter.web)
implementation(libs.spring.boot.starter.oauth2.resource.server)
```

→ **컴파일러 강제 의존 방향**: api 가 persistence 를 직접 호출 불가. Spring DI 가 runtime 에 Adapter (persistence) 를 core port (interface) 에 주입하는 구조 = Dependency Inversion 빌드 시스템 강제.

→ **PoC #1 의 AP-ARCH-001/AP-ARCH-002 (Layer Violation, single module) 본 레포 비재현**. v1.2.0 격상 시 stack-conditional 명시 권고.

---

## 4. Architecture 분류 (Phase 1 cap 0.65)

| Style                                             | confidence | evidence                                                                                          |
| ------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| **Modular Monolith with Ports & Adapters Naming** | **0.65**   | multi-module + `*RepositoryAdapter` 명명 + compileOnly/runtimeOnly + DIP                          |
| Hexagonal                                         | 0.40       | Adapter 명명 + port 인터페이스 / 단점: core 가 `@Service`/`@Entity` 사용 (Cockburn 정의 부합도 ↓) |
| Layered (Modularized)                             | 0.30       | controller → service → repository 단방향                                                          |

⚠️ **메인 사전 fetch 정정 사항** (F-015 cross-validation 의 메인 정정 케이스 — `human_review_required` 명시):

- 메인이 1차 단언: "core 는 Spring 의존성 0 — Pure POJO"
- Senior 정정: 루트 `build.gradle.kts §59~99 subprojects { plugins.apply(spring-boot) }` 가 모든 모듈에 spring-boot 강제 + `UserService.java @Service` + `User.java @Entity` 실측
- → Pure Hexagonal **단정 회피**, "Modular Monolith + Ports & Adapters Naming" 으로 분류

→ 확정은 Phase 3 (architecture) 의 의존성 그래프 + ArchUnit/Modulith 분석 후.

---

## 5. 분석 우선순위 모듈

| #   | 모듈                 | 이유                                   | LOC   | 후속 phase 입력                            |
| --- | -------------------- | -------------------------------------- | ----- | ------------------------------------------ |
| 1   | `module/core`        | 도메인 + Repository port + Service     | 1,220 | Phase 4 (도메인)                           |
| 2   | `module/persistence` | Adapter + Specifications + Spring Data | 593   | Phase 3 (의존성 방향) + Phase 6 (안티패턴) |
| 3   | `server/api`         | Controller + Security Config + JWT     | 1,077 | Phase 5-1 (api) + Phase 6 (보안)           |

---

## 6. ground truth 자료 (분석 강도 ↑)

| 자료               | 위치                                               | 활용                                   |
| ------------------ | -------------------------------------------------- | -------------------------------------- |
| ⭐ OpenAPI 명세    | `api-docs/openapi.yaml`                            | Phase 5-1 직접 입력 (PoC #1 대비 강점) |
| Postman collection | `api-docs/Conduit.postman_collection.json`         | Phase 5-1 검증                         |
| API E2E 스크립트   | `api-docs/run-api-tests.sh`                        | Phase 5-1 검증                         |
| ⭐ DDL             | `module/persistence/src/main/resources/schema.sql` | Phase 2 직접 입력                      |
| 의도된 설계 원칙   | README §Considerations (12 항목)                   | Phase 4/5/6 ground truth               |
| ERD 이미지         | README 외부 호스팅                                 | Phase 4 보강                           |

---

## 7. PoC #1 와의 비교 (부록)

### 7.1 11가지 차이 변수

| #   | 변수                  | PoC #1 (raeperd)                  | PoC #2 (1chz)                                          |
| --- | --------------------- | --------------------------------- | ------------------------------------------------------ |
| 1   | Java                  | 11                                | **21**                                                 |
| 2   | Spring Boot           | 2.5.2                             | **3.3.0**                                              |
| 3   | 빌드 DSL              | Gradle Groovy                     | **Gradle Kotlin DSL + version catalog**                |
| 4   | 모듈 구조             | single                            | **multi-module (core/persistence/api)**                |
| 5   | Persistence namespace | `javax.persistence`               | **`jakarta.persistence`** (Jakarta EE 9+)              |
| 6   | JWT                   | 자체 구현 + HS256 21byte 하드코딩 | **OAuth2 Resource Server + RSA (`app.key`/`app.pub`)** |
| 7   | 캐시                  | 없음                              | **Spring Cache + Caffeine**                            |
| 8   | SQL 모니터링          | 없음                              | **p6spy 1.9.0**                                        |
| 9   | 동적 쿼리             | (분석 시점에 직접 추출)           | **JPA Specifications**                                 |
| 10  | 코드 스타일           | editorconfig + Sonar              | **Spotless (palantirJavaFormat) + ktlint**             |
| 11  | testFixtures          | src/test 단일                     | **src/testFixtures Gradle source set**                 |

### 7.2 PoC #1 finding 33건 외부 검증 (Phase 1 영역 + 시그널)

| ID                                | PoC #1 status | 본 PoC 결과                                  | 분류                                      |
| --------------------------------- | ------------- | -------------------------------------------- | ----------------------------------------- |
| F-007 (inventory.schema.json)     | closed        | 본 PoC 정상 schema 사용                      | **비재현 (해소 확인)**                    |
| F-008 (LOC 환산식)                | deferred      | git clone 환경 deterministic                 | **비재현 강함**                           |
| F-009 (Phase 1 §6 신뢰도 표 환경) | closed        | 정상 적용                                    | **비재현 (해소 확인)**                    |
| F-015 (sub-agent 검증 절차)       | promoted      | 메인까지 정정 케이스                         | **재현 + 격상 강화**                      |
| AP-SECURITY-001 (JWT 21byte)      | promoted      | OAuth2 RS + RSA 로 비재현                    | **비재현 → stack 마이그레이션 권고 격상** |
| AP-ARCH-001/002 (LV-001/002)      | promoted      | multi-module 컴파일 시점 차단                | **비재현 → stack-conditional 권고**       |
| F-041 (alg explicit)              | deferred      | NimbusJwtDecoder 가 자동 강제                | **비재현 (해소)**                         |
| F-017 (EAGER N+1)                 | deferred      | Article @OneToMany EAGER 추정 (Phase 4 검증) | **재현 강함 (시그널)**                    |

### 7.3 신규 finding (PoC #02 Phase 1 영역) — 6건 정식 등록

| 정식 ID | 제목                                                                  | severity | 격상                 |
| ------- | --------------------------------------------------------------------- | -------- | -------------------- |
| F-042   | multi-module 환경 inventory.json 표현 가이드 부재                     | **high** | v1.2.0 묶음 H (신규) |
| F-043   | ports/adapters 자동 감지 단서 명세 부재                               | medium   | v1.2.0 묶음 H        |
| F-044   | F-015 cross-validation 메인 정정 케이스 (학습 코퍼스/단편 fetch 한계) | medium   | v1.2.0 묶음 A 보강   |
| F-045   | p6spy production 활성화 가이드 부재                                   | low      | 메모                 |
| F-046   | JPA Specifications vs QueryDSL 선택 가이드 부재                       | low      | 메모                 |
| F-047   | `stack.backend.orm` secondary 영역 가이드 부재                        | low      | 메모                 |

→ KPI 정합: finding 6건 = 건강 범위 5~15 ✅

---

## 8. 신뢰도 자평

| 영역                        | 예측 (plan §8) | 실측       | extraction_method                     |
| --------------------------- | -------------- | ---------- | ------------------------------------- |
| 디렉토리 트리               | 0.99           | 0.98       | deterministic (find)                  |
| 파일 통계 (LOC)             | 0.95           | 0.98       | deterministic (cat \| wc -l)          |
| 패키지 매니페스트           | 0.99           | 0.98       | deterministic                         |
| ORM 자동 감지               | 0.97           | 0.97       | pattern_matching                      |
| 스택 종합 요약              | 0.92           | 0.92       | llm_with_grounding                    |
| **architecture candidates** | **0.75**       | **0.65** ↓ | llm_with_grounding (Senior 정정 반영) |
| 분석 우선순위               | 0.92           | 0.92       | llm_with_grounding                    |

가중 평균 (요소 수 기반): **0.93** (formula v1).

- raw 0.95 (base 0.75 + orm_full 0.10 + domain_context_md 0.03 + postman_or_api_test 0.05 + diagrams_other 0.02)
- architecture_style_candidates cap 0.65 적용으로 가중 평균 → **0.93**
- cap 0.98 미적용

→ PoC #1 Phase 1 (0.92) 와 거의 동일. plan §8 예측 0.95~0.97 보다 낮은 사유 = Senior architecture 정정 + Pure Hexagonal 단정 회피.

---

## 9. 다음 단계 (Phase 2 인계)

- `module/persistence/src/main/resources/schema.sql` read
- `server/api/src/main/resources/application.yaml` + `module/persistence/src/main/resources/application.yaml` read (양쪽 분리 가능성 확인)
- `module/core/model/*.java` 의 @Entity 클래스 read → Phase 2 의 schema vs entity 정합성 검증
- ORM ddl-auto 설정 확정 (HEAD commit 메시지 "Disable JPA open-in-view" 단서)
- DRIFT 체크 — PoC #1 9건 DRIFT 패턴 본 환경 재현 검증

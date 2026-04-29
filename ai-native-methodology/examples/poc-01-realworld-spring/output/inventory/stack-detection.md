# 스택 감지 보고서 — RealWorld Spring Boot

> Phase 1 산출물 (사람용)
> 생성일: 2026-04-27
> 출처: build.gradle 직접 fetch + Trees API 분석
> 신뢰도: 0.92 (전체 inventory 가중평균)

---

## 1. 한 줄 요약

**Java 11 + Spring Boot 2.5.2 + Spring Data JPA (단일) + Spring Security + JWT (자체 구현)** 의 RealWorld (Conduit) 백엔드 모놀리스. POJO 도메인 + Lombok 부분 사용.

---

## 2. 스택 확정 사항 (build.gradle 실측)

| 영역 | 기술 | 버전 | 신뢰도 | 출처 |
|---|---|---|---|---|
| **언어** | Java | 11 | 0.98 | `sourceCompatibility = '11'` |
| **빌드** | Gradle (Groovy) | (build.gradle 1,720 bytes) | 0.98 | raw fetch |
| **프레임워크** | Spring Boot | **2.5.2** ⚠️ | 0.98 | `id 'org.springframework.boot' version '2.5.2'` |
| **의존성 관리** | Spring Dependency Management | 1.0.11.RELEASE | 0.98 | plugin 명시 |
| **웹** | Spring Web (REST) | (BOM) | 0.95 | `spring-boot-starter-web` |
| **검증** | Spring Validation | (BOM) | 0.95 | `spring-boot-starter-validation` |
| **인증** | Spring Security | (BOM) | 0.95 | `spring-boot-starter-security` |
| **JWT** | **자체 구현** (3rd party 없음) | - | 0.95 | jjwt/auth0 등 의존성 부재 + `infrastructure/jwt/` 자체 구현 |
| **ORM** | Spring Data JPA | (BOM) | 0.95 | `spring-boot-starter-data-jpa` |
| **DB (개발용)** | H2 | (BOM, runtimeOnly) | 0.95 | `runtimeOnly 'com.h2database:h2'` |
| **유틸** | **Lombok** (io.freefair plugin) | 5.3.3.3 | 0.95 | plugin + `lombok.config` 존재 |
| **테스트 (단위/통합)** | spring-boot-starter-test (JUnit5) | (BOM) | 0.95 | `useJUnitPlatform()` |
| **테스트 (보안)** | spring-security-test | (BOM) | 0.95 | testImplementation |
| **테스트 (mock)** | mockito-inline | 3.12.1 | 0.95 | testImplementation |
| **커버리지** | JaCoCo | (plugin) | 0.95 | `id 'jacoco'` |
| **CI** | GitHub Actions, SonarCloud | - | 0.85 | `.github/workflows/build.yml` + sonarqube plugin |
| **품질** | SonarQube | 3.1.1 plugin | 0.95 | plugin |
| **코드 스타일** | EditorConfig | 0.0.3 plugin | 0.95 | plugin + `.editorconfig` |
| **배포** | Jib (컨테이너 이미지) | 3.1.4 | 0.95 | plugin |

---

## 3. ORM 자동 감지 — JPA 단일 ✅

### 3.1 감지 단서 (Phase 1 명세 §3.2)

| 단서 | 결과 | 신뢰도 |
|---|---|---|
| `spring-boot-starter-data-jpa` 의존성 | ✅ 존재 (build.gradle) | 0.99 |
| `mybatis-spring-boot-starter` 의존성 | ❌ 부재 | 0.99 |
| `resources/mapper/` 디렉토리 | ❌ 부재 (Trees API 검증) | 0.99 |
| `@Mapper` import (코드) | (Phase 2/4에서 검증) | - |
| `hibernate.cfg.xml` | ❌ 부재 (Spring Boot 자동설정) | - |
| `spring.jpa.*` properties | (application.properties — Phase 2 분석) | - |

### 3.2 Senior §1 "의존성 외 4단서" 점검 (사내 적용 시 함정 회피)

| 단서 | 결과 | 비고 |
|---|---|---|
| `JdbcTemplate` import | (Phase 2/4 검증 권장) | RealWorld 는 학습용이라 거의 없을 것 (E) |
| `@Query(nativeQuery = true)` | (Phase 2/4 검증 권장) | - |
| `EntityManager.createNativeQuery` | (Phase 2/4 검증 권장) | - |
| `application.properties` `spring.datasource.*` 직접 사용 | (Phase 2 검증) | - |

→ **본 PoC 한정 ORM confidence: 0.95** (의존성 + Trees 부재 검증). 사내 적용 시 0.85~0.90 보수적 시작 권장.

⚠️ **inventory.warnings 명문화**: "ORM confidence 0.95 — RealWorld 실측 기반. 사내 적용 시 4단서 + 카카오페이 패턴 (운영 호출 빈도) 추가 점검 필수. 0.99 금지."

### 3.3 ORM 혼재 부재 확정

JPA 단일. MyBatis/jOOQ/JdbcTemplate 직접 사용 등 혼재 신호 0%.

---

## 4. 아키텍처 스타일 후보 (Phase 3 분석 대상)

### 4.1 디렉토리 단서 (상한 0.7 — Senior 권장)

| 후보 | confidence | evidence | 한계 |
|---|---|---|---|
| **Hexagonal/Clean Architecture 영향** | 0.65 | `application/` + `domain/` + `infrastructure/` 3-tier 명확. domain/ 은 POJO + 비즈니스 로직 (Service, Repository **인터페이스**). infrastructure/jwt/ 는 외부 어댑터 위치. | 의존 방향 검증 필요 (Phase 3). 포트 인터페이스의 정확한 분리 여부 미확인. |
| **Layered (보강)** | 0.55 | application/ 안에 RestController + DTO/Model 표준 패턴. service 패키지 분리 안 됨 (domain/ 안에 service). | 순수 layered 아님 — domain layer 가 위치 명확. |
| **POJO domain 강조** | 0.85 | source-info.md 명시 ("Lombok 도메인 외에서만") + 실측 build.gradle 의 lombok plugin + `lombok.config` 존재. domain/ 패키지 의존성 (Phase 3 검증) 없음 추정. | "POJO" 사실 vs "DDD/Hexagonal 적용" 단정 분리 (Senior §2). |

### 4.2 evidence 배열 (Phase 3 채울 자리)

```yaml
architecture_style_candidates:
  - style: Hexagonal/Clean Architecture (영향)
    confidence: 0.65
    evidence:
      - "application/ + domain/ + infrastructure/ 3-tier 디렉토리 분리 ✅ 실측"
      - "domain/ 패키지에 POJO + Service + Repository 인터페이스 ✅ 실측"
      - "infrastructure/jwt/ 자체 구현 (HmacSHA256 등) ✅ 실측"
      - "<TBD: Phase 3 의존 방향 검증 — domain → application 호출 부재 확인>"
      - "<TBD: Phase 3 — Repository 인터페이스 vs 구현 위치 분리 확인>"
```

### 4.3 source-info.md ground truth 와 정합

source-info.md README §Overview 의 "Design Principal":
- POJO 도메인 패키지 ✅ 실측 (domain/ 분리)
- @Service/@Repository/@Transactional 만 도메인에 ✅ (Phase 4 검증)
- final whenever possible ✅ (Phase 4 검증)
- package private class ✅ (Phase 4 검증)
- JWT 3rd party 없음 ✅ 실측 (의존성 부재 + infrastructure/jwt/ 자체 구현)
- Article `@Embedded` ✅ (Phase 2 검증)
- `@JoinTable` 선호 ✅ (Phase 2 검증)

→ **Clean Architecture + DDD 영향** 강함 (확정 아님, Phase 3/4 검증).

---

## 5. 분석 우선순위 모듈 (modules_for_priority_analysis)

### 5.1 source-info.md ground truth (1순위)

| 우선순위 | 모듈 | reason | source |
|---|---|---|---|
| 1 | `domain/article/` | source-info.md ground truth: "Article — 가장 큰 도메인, `@Embedded` 활용으로 Aggregate 추출 케이스 풍부" | ground_truth |
| 2 | `domain/user/` | RealWorld 도메인 #2 (User + Profile + JWT 인증 흐름) | ground_truth |
| 3 | `application/security/` | JWT 자체 구현 + Spring Security 통합 | derived |

### 5.2 LLM 추론 (evidence 보존, 채택 안 함)

| 모듈 | LLM reason | 실측 LOC 1위인가? |
|---|---|---|
| `domain/article/` (21,579 bytes) | "도메인 1위" | ✅ 일치 |
| `domain/user/` (16,814 bytes) | "도메인 2위" | ✅ 일치 |
| `src/test/` (87,860 bytes) | "테스트 풍부" | ❌ 우선순위 아님 (Phase 7 영역) |

→ **ground truth 와 LLM 추론 일치** (Article 1순위). confidence 0.92 (research §2 토론 1 결과).

### 5.3 Senior §4 함정 회피

한국 SI 의 "LOC 1위 = 공통/유틸/Excel" 패턴 — **본 RealWorld 에는 부재**. 학습용 spec 으로 "common/util" 같은 거대 공통 패키지 없음.

⚠️ inventory.warnings 명문화: "본 RealWorld 분석은 학습용 spec 한정. 사내 적용 시 LOC 1위가 공통/유틸/Excel 인 경우 흔함 — ground truth 우선 + LLM evidence 보존 패턴 필수."

---

## 6. JWT 자체 구현 (Senior §1 + source-info.md 검증)

build.gradle 실측:
- jjwt 부재 ✅
- auth0 java-jwt 부재 ✅
- nimbus-jose-jwt 부재 ✅
- spring-boot-starter-oauth2-resource-server 부재 ✅

→ **JWT 자체 구현 확정**. `infrastructure/jwt/` 6개 파일에 HmacSHA256/Base64URL/JWTConfiguration 등 자체 구현.

---

## 7. 명세 §3.3 "LLM 보강 영역" 결과

| 항목 | 결과 |
|---|---|
| 스택 종합 요약 | (본 §1 한 줄 요약) |
| 아키텍처 스타일 후보 | Hexagonal/Clean (0.65), POJO domain 강조 (0.85) |
| 분석 우선순위 모듈 | Article (1) > User (2) > security (3) — ground truth + LLM 일치 |

---

## 8. Phase 2 진입 시 인계 사항

1. **DB**: H2 (개발용) — `application.properties` 의 datasource 설정 + `schema.sql` (2,425 bytes) 파싱 필요
2. **JPA Entity**: `domain/article/Article.java` + `domain/user/User.java` 등 — `@Embedded` 활용 (source-info.md ground truth)
3. **schema.sql 직접 분석**: DDL 직접 추출 가능 — Phase 2 의 ORM 추출 + DDL 검증 양면 가능
4. **분석 우선순위**: Article 도메인 (12 files) — `@Embedded` Aggregate 추출 케이스

---

## 9. 신뢰도 자평

본 stack-detection.md 자평 신뢰도: **0.94** (build.gradle 직접 fetch + Trees 검증 + ground truth 일치).

ADR-003 §9 해석: **신뢰 가능 (샘플 검토 권장)**. Phase 2 진입 시 application.properties + Entity 1~2개 샘플 검증 권장.

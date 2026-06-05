# 디렉토리 트리 — `1chz/realworld-java21-springboot3`

> Phase 1 산출 (사람용)
> 생성: 2026-04-29
> source: `git clone` + `find` (deterministic)
> HEAD: `93e018e` (2025-09-19)

---

## 최상위

```
realworld-java21-springboot3/
├── api-docs/                    # ⭐ ground truth (Phase 5-1 직접 입력)
│   ├── Conduit.postman_collection.json
│   ├── openapi.yaml
│   ├── README.md
│   └── run-api-tests.sh
├── gradle/
│   ├── libs.versions.toml       # ⭐ version catalog (Spring Boot 3.3.0 / Java 21)
│   └── wrapper/
├── module/                      # 라이브러리 모듈 (도메인 + JPA)
│   ├── core/
│   └── persistence/
├── server/                      # 서버 모듈 (Spring Boot 앱)
│   └── api/
├── build.gradle.kts             # ⭐ root — subprojects { plugins.apply(spring-boot) }
├── settings.gradle.kts
├── gradle.properties
├── gradlew + gradlew.bat
├── LICENSE                      # MIT (Copyright 2021 RealWorld)
├── README.md
├── CODE_OF_CONDUCT.md
├── favicon.ico + logo.png
└── tags
```

---

## `module/core/` — 도메인 + 서비스 (22 main / 9 test / 4 testFixtures)

```
module/core/
├── build.gradle.kts             # plugins { java-test-fixtures }, deps: jakarta.persistence-api
└── src/
    ├── main/java/io/zhc1/realworld/
    │   ├── model/               # 17 파일
    │   │   ├── Article.java                  # ⭐ Aggregate Root 후보 (Phase 4)
    │   │   ├── ArticleComment.java
    │   │   ├── ArticleCommentRepository.java # interface (port)
    │   │   ├── ArticleDetails.java           # VO 후보
    │   │   ├── ArticleFacets.java            # VO 후보 (검색 facet)
    │   │   ├── ArticleFavorite.java
    │   │   ├── ArticleFavoriteRepository.java # interface (port)
    │   │   ├── ArticleRepository.java         # interface (port)
    │   │   ├── ArticleTag.java
    │   │   ├── PasswordEncoder.java          # interface (port — Spring Security adapter 용)
    │   │   ├── Tag.java
    │   │   ├── TagRepository.java             # interface (port)
    │   │   ├── User.java                      # @Entity / @Column 사용
    │   │   ├── UserFollow.java
    │   │   ├── UserRegistry.java              # Aggregate 후보
    │   │   ├── UserRelationshipRepository.java # interface (port)
    │   │   └── UserRepository.java            # interface (port)
    │   └── service/             # 5 파일
    │       ├── ArticleCommentService.java     # @Service
    │       ├── ArticleService.java            # @Service
    │       ├── TagService.java                # @Service
    │       ├── UserRelationshipService.java   # @Service
    │       └── UserService.java               # @Service ⭐ (메인 정정 — Spring 의존)
    ├── test/                    # 9 파일 (1,369 LOC)
    └── testFixtures/            # 4 파일 (56 LOC) — Gradle java-test-fixtures source set
        └── (모델용 fixtures)
```

→ ⭐ core 모듈 분석 노트:
- Repository **인터페이스 6개** = ports (Hexagonal naming)
- `@Service` / `@Entity` / `@Column` 직접 사용 → **Pure Hexagonal 아님** (root subprojects 가 spring-boot 강제)

---

## `module/persistence/` — JPA Adapter + Specifications (17 main / 1 test)

```
module/persistence/
├── build.gradle.kts             # deps: core, h2, spring-boot-starter-data-jpa/cache/p6spy, caffeine
└── src/
    ├── main/
    │   ├── java/io/zhc1/realworld/
    │   │   ├── config/           # JPA 설정 (JpaConfiguration 추정 — Phase 2 read)
    │   │   └── persistence/      # 13 파일 — Adapter 패턴
    │   │       ├── ArticleCommentJpaRepository.java       # Spring Data 인터페이스
    │   │       ├── ArticleCommentRepositoryAdapter.java   # port 구현 (core 의존)
    │   │       ├── ArticleFavoriteJpaRepository.java
    │   │       ├── ArticleFavoriteRepositoryAdapter.java
    │   │       ├── ArticleJpaRepository.java
    │   │       ├── ArticleRepositoryAdapter.java
    │   │       ├── ArticleSpecifications.java             # ⭐ JPA Specifications (PF-006)
    │   │       ├── TagJpaRepository.java
    │   │       ├── TagRepositoryAdapter.java
    │   │       ├── UserFollowJpaRepository.java
    │   │       ├── UserJpaRepository.java
    │   │       ├── UserRelationshipRepositoryAdapter.java
    │   │       └── UserRepositoryAdapter.java
    │   └── resources/
    │       └── schema.sql                                  # ⭐ Phase 2 ground truth
    └── test/                    # 1 파일 (22 LOC)
```

→ ⭐ persistence 모듈 분석 노트:
- **Adapter 패턴 일관**: 각 *Repository (port) 마다 *RepositoryAdapter (Spring Data 합성)
- **JPA Specifications** 사용 → Phase 6 candidate (PF-006 / Case Researcher: 한국 비주류)

---

## `server/api/` — Controller + Security (33 main / 6 test)

```
server/api/
├── build.gradle.kts             # deps: compileOnly(core), runtimeOnly(persistence), web, oauth2-resource-server
└── src/
    ├── main/
    │   ├── java/io/zhc1/realworld/
    │   │   ├── api/             # 7 Controller + DTO
    │   │   │   ├── ArticleCommentController.java
    │   │   │   ├── ArticleController.java
    │   │   │   ├── ArticleFavoriteController.java
    │   │   │   ├── TagController.java
    │   │   │   ├── UserController.java
    │   │   │   ├── UserRelationshipController.java
    │   │   │   ├── request/      # 요청 DTO (Phase 5-1 read 예정)
    │   │   │   └── response/     # 응답 DTO (Phase 5-1 read 예정)
    │   │   ├── config/          # 8 파일 — Spring 설정
    │   │   │   ├── ApplicationExceptionHandler.java     # @ControllerAdvice 추정
    │   │   │   ├── AuthToken.java                       # JWT 추상화
    │   │   │   ├── AuthTokenConverter.java              # JWT ↔ User 변환
    │   │   │   ├── AuthTokenProvider.java               # JWT 발급
    │   │   │   ├── AuthTokenResolver.java               # JWT 추출
    │   │   │   ├── ObjectMapperConfiguration.java
    │   │   │   ├── SecurityConfiguration.java           # ⭐ Phase 5/6 핵심
    │   │   │   └── SecurityPasswordEncoderAdapter.java  # ⭐ port adapter
    │   │   ├── mixin/           # Jackson mixin (DTO 직렬화 보조)
    │   │   └── RealWorldApplication.java                # @SpringBootApplication
    │   └── resources/
    │       ├── app.key          # ⭐ RSA 비밀 키 (PEM 추정)
    │       ├── app.pub          # ⭐ RSA 공개 키
    │       ├── application.yaml # ⭐ Phase 2 read 필수
    │       ├── banner.txt
    │       └── README.md
    └── test/                    # 6 파일 (277 LOC)
```

→ ⭐ api 모듈 분석 노트:
- **JWT = OAuth2 Resource Server + RSA 비대칭 키**
  - PoC #1 의 21byte HS256 하드코딩 (AP-SECURITY-001) 와 결정적 차이
  - NimbusJwtDecoder 가 alg explicit 강제 → F-041 자동 해소
- **SecurityConfiguration** + **SecurityPasswordEncoderAdapter** = Spring Security 6 → core port (PasswordEncoder) 매핑

---

## 통계 요약

| 영역 | 파일 수 | LOC |
|---|---|---|
| Java main (3 모듈) | **72** | **2,890** |
| Java test (3 모듈) | 16 | 1,668 |
| Java testFixtures | 4 | 56 |
| **Java 합계** | **92** | **4,614** |
| 빌드 (.kts) | 5 | — |
| 설정 (yaml/toml/properties) | 5 | — |
| 문서 (md) | 4 | — |
| 기타 (SQL/sh/key/pub/png/ico/json/txt) | 9 | — |

`extraction_method`: **deterministic** (`find` + `wc -l` + `awk`).

---

## PoC #1 와의 트리 차이 (한눈에)

| 영역 | PoC #1 (raeperd) | PoC #2 (1chz) |
|---|---|---|
| 모듈 | single (`src/`) | **multi (`module/core` + `module/persistence` + `server/api`)** |
| 빌드 | `build.gradle` (Groovy) + `pom.xml` | **`build.gradle.kts` (Kotlin DSL) + `libs.versions.toml`** |
| 도메인 | `domain/` (Spring 어노테이션 최소 의도) | **`module/core/model/` (Spring + JPA 어노테이션 직접 사용)** |
| Repository | `XxxRepository extends JpaRepository` 직접 | **port (`XxxRepository` 인터페이스) + adapter (`XxxRepositoryAdapter`) 분리** |
| API spec | (분석 시 직접 추출) | **`api-docs/openapi.yaml` 직접 제공** |
| JWT 키 | (소스 내 하드코딩 21byte) | **`app.key` + `app.pub` 별도 파일 (RSA)** |
| 동적 쿼리 | (Phase 5 시점 분석) | **`ArticleSpecifications.java` 명시** |
| testFixtures | 없음 (src/test 단일) | **`src/testFixtures/` Gradle source set** |

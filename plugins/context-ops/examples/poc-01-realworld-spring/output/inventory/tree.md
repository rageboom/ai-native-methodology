# 디렉토리 트리 — RealWorld Spring Boot

> Phase 1 산출물 (사람용)
> 생성일: 2026-04-27
> 출처: GitHub Trees API recursive=1 on `master` branch
> 결과: 170 entries (51 트리 + 119 blob)
> truncated: **false** ✅
> root tree sha: `56be3ced4f3134424ead5fcaf387b3aa640b9532`

---

## 요약

| 항목 | 값 |
|---|---|
| 총 entries | 170 (트리 51 + blob 119) |
| 분석 대상 코드 (src/) | 96 files / 167,933 bytes |
| 문서/자산 (doc/) | 9 files / 646,636 bytes (주로 이미지) |
| 빌드/래퍼 (gradle/, gradlew*, build.gradle, settings.gradle, test.gradle) | 6 files |
| 메타 (.editorconfig, .gitignore, .github, lombok.config, LICENSE, README.md, realworld.drawio) | 9 files |

⚠️ **제외 처리 검토**:
- `.DS_Store` (8,196 bytes) — macOS 시스템 파일, 운영 통계 제외 권장
- `gradle/wrapper/gradle-wrapper.jar` (59,203 bytes) — generated-style binary, LOC 제외
- `gradlew`, `gradlew.bat` — script wrapper

---

## 디렉토리 구조

```
realworld-springboot-java/
├── .editorconfig
├── .gitignore
├── .DS_Store ⚠️ (macOS 파일, 분석 제외)
├── .github/
│   ├── ISSUE_TEMPLATE/feature.md
│   └── workflows/build.yml
├── LICENSE (MIT)
├── README.md
├── build.gradle (1,720 bytes — Spring Boot 2.5.2 + Java 11)
├── settings.gradle
├── test.gradle (테스트 설정 분리)
├── lombok.config (Lombok 사용 설정)
├── realworld.drawio (아키텍처 다이어그램 — Phase 3 ground truth)
│
├── doc/
│   ├── Conduit.postman_collection.json (60,839 bytes — Phase 5-1 ground truth)
│   ├── README.md
│   ├── run-api-tests.sh (API 테스트 스크립트)
│   ├── swagger.json
│   └── image/
│       ├── performance.png
│       ├── realworld-Article.png (도메인 다이어그램 — Phase 4 ground truth)
│       ├── realworld-Jwt.png
│       ├── realworld-User.png
│       └── realworld-cover.png
│
├── gradle/wrapper/
│   ├── gradle-wrapper.jar (binary — LOC 제외)
│   └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
│
└── src/
    ├── main/
    │   ├── java/io/github/raeperd/realworld/
    │   │   ├── RealWorldApplication.java (Spring Boot main)
    │   │   ├── application/                  # REST 어댑터 (22 files, 31,307 bytes)
    │   │   │   ├── WebMvcConfiguration.java
    │   │   │   ├── article/                  # ArticleRestController + DTO/Model (5 files)
    │   │   │   │   └── comment/              # CommentRestController + DTO/Model (4 files)
    │   │   │   ├── security/                 # JWT 필터/Provider/Config (3 files)
    │   │   │   ├── tag/                      # TagRestController + Model (2 files)
    │   │   │   └── user/                     # User/Profile REST + DTO/Model (8 files)
    │   │   │
    │   │   ├── domain/                       # POJO 도메인 (27 files, 38,888 bytes) ⭐
    │   │   │   ├── article/                  # Article + Service + Repository (7 files, 21,579 bytes) ⭐ 1순위
    │   │   │   │   ├── comment/              # Comment + CommentService (2 files)
    │   │   │   │   └── tag/                  # Tag + Repository + Service (3 files)
    │   │   │   ├── jwt/                      # JWT Payload/Serializer/Deserializer (3 files, 495 bytes)
    │   │   │   └── user/                     # User + Profile + VO (Email/Password/Image/UserName) (12 files, 16,814 bytes)
    │   │   │
    │   │   └── infrastructure/                # 외부 통합 구현 (6 files, 6,523 bytes)
    │   │       ├── jwt/                       # JWT 자체 구현 (Base64URL, HmacSHA256, ...)
    │   │       └── repository/                # SpringDataJPAConfiguration
    │   │
    │   └── resources/
    │       ├── META-INF/additional-spring-configuration-metadata.json
    │       ├── application.properties (254 bytes)
    │       └── schema.sql (2,425 bytes — DDL, Phase 2 분석 대상)
    │
    └── test/
        ├── java/io/github/raeperd/realworld/  # 34 files, 87,860 bytes (운영 코드보다 큼!)
        │   ├── IntegrationTest.java
        │   ├── IntegrationTestUtils.java
        │   ├── application/                   # Controller 통합 테스트
        │   ├── domain/                        # Entity/VO/Service 단위 테스트
        │   └── infrastructure/jwt/            # JWT 단위 테스트
        │
        └── resources/data.sql (테스트 데이터)
```

---

## 분석 우선순위 모듈 (source-info.md ground truth 일치)

ground truth (`source-info.md`): **Article 우선**

실측 검증 ✅:
- `domain/article/` — **21,579 bytes (1위)**, 12 files (Comment/Tag 포함)
- `domain/user/` — 16,814 bytes (2위), 12 files
- `domain/jwt/` — 495 bytes (3위, cross-cutting 성격)

→ Article 도메인 = 본 PoC 의 Phase 4 (비즈니스 로직) 분석 시 1순위.

---

## 아키텍처 단서 (Phase 3 분석 대상)

`application/ + domain/ + infrastructure/` 3-tier → **Hexagonal/Clean Architecture 영향 강함** (확정 아님, Phase 3 의존 그래프 검증 필요).

- `application/` = Inbound 어댑터 (REST + DTO/Model)
- `domain/` = 핵심 비즈니스 로직 (POJO + Service + Repository 인터페이스)
- `infrastructure/` = Outbound 어댑터 (JWT 구현, JPA 설정)

⚠️ 디렉토리만으로 단정 불가 (Senior research §2). evidence 배열에 `<TBD: Phase 3 의존 방향 검증>` 보존.

---

## generated/제외 디렉토리 (실측)

본 레포에는 부재 (binary는 gradle-wrapper.jar 만):
- `build/` — 부재
- `target/` — 부재 (Gradle 사용)
- `node_modules/` — 부재 (FE 없음)
- `.gradle/` — 부재 (gitignore)
- `dist/` — 부재
- `.idea/` — 부재 (gitignore)

→ tree 분석 시 `gradle-wrapper.jar` + `.DS_Store` 만 제외.

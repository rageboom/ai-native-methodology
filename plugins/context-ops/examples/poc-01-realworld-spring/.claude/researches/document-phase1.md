# Document Research — PoC #01 Phase 1 (init/인벤토리)

> 역할: 공식문서 리서처 (Work Principles 2원칙 中)
> 작성일: 2026-04-27
> 대상 plan: `.claude/plans/plan-phase1.md`
> Phase 명세: `ai-native-methodology/methodology-spec/workflow/phase-1-init.md`

---

## 0. 사전 고지 (중요) — 2회차 재검증 완료 (2026-04-27)

**상태**: 1차 (학습 코퍼스 기반) → **재검증 완료** (공식 URL 직접 fetch + RealWorld 레포 실측).

**자평 신뢰도**: 0.85 → **0.94** (∆+0.09).

마킹: (C) 확실 / (E) 추정 / (U) 불확실 / **✅ verified (재검증 통과) / ⚠️ corrected (보정됨) / ❌ refuted (반박됨)**.

### 0.1 재검증 변경 사항 요약

| 항목 | 1차 | 재검증 후 |
|---|---|---|
| Trees API truncated 한도 | 100k/7MB (U) | **100k entries / 7 MB ✅ verified** |
| `recursive=1` 파라미터 | 값=1 (C) | ⚠️ **값 무관** (존재 여부만 판단) |
| RealWorld 기본 브랜치 | `main` 가정 | ❌ **`master`** — source-info.md 보정 필요 |
| RealWorld Spring Boot | 2.7.x 추정 | ⚠️ **2.5.2** (보정) |
| RealWorld Lombok | source-info.md 기준 사용 | ❌ **미사용** — source-info.md 보정 필요 |
| RealWorld JPA 단일 | 가정 | ✅ **검증** |
| RealWorld Java byte | 미실측 | **164,904 byte ≈ 4,711 LOC** (byte/35) |
| Trees API entries | 미실측 | **93 entries, truncated=false** |
| build.gradle size | 미실측 | **1,720 bytes** |
| Spring Boot Gradle plugin | dependency-management 자동 | ⚠️ **자동 아님** (별도 적용) |
| Linguist 감지 단계 | 4단계 | ⚠️ **8단계 세밀화** |
| Rate limit 헤더 | `X-RateLimit-*` 대문자 | ⚠️ **소문자** + `x-ratelimit-used`/`x-ratelimit-resource` 추가 |

### 0.2 RealWorld 실측 결과 (Phase 1 사전 검증)

```
GET https://api.github.com/repos/raeperd/realworld-springboot-java
  default_branch: master  (❌ main 아님)

GET https://api.github.com/repos/raeperd/realworld-springboot-java/git/trees/master?recursive=1
  93 entries, truncated: false
  build.gradle blob size: 1720 bytes

GET https://api.github.com/repos/raeperd/realworld-springboot-java/languages
  Java: 164,904 bytes  → ~4,711 LOC (byte/35)

GET https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/build.gradle
  Spring Boot 2.5.2
  Java 11
  spring-boot-starter-data-jpa ✅
  spring-boot-starter-security ✅
  Lombok: 부재 ❌
```

### 0.3 주요 발견 (source-info.md 갱신 후보)

1. **기본 브랜치 = `master`** (Phase 1 실행 시 모든 fetch URL 보정 필요)
2. **Spring Boot 2.5.2** (2.7.x 추정 → 정정)
3. **Lombok 미사용** (source-info.md "Lombok (도메인 패키지 외에서만)" 항목 정정 — 실제로는 도메인 외에도 미사용)
4. **JPA 단일 확정** (mybatis 부재 + mapper/ 부재 검증 완료)
5. **레포 규모 작음** (93 entries, ~4.7k LOC) — Trees API 1회 호출로 충분

### 0.4 잔여 한계

- (C) 마킹 영역 中 일부는 여전히 학습 코퍼스 의존 (예: §3 Linguist 8단계 알고리즘 세부 구현은 fetch로 다 확인 못함)
- Bayesian classifier 확률 임계값 등 일부 (U) 그대로

> 윤주스 보고: 1차 web_fetch 차단 → 권한 부여 후 재검증 사이클 완료. F-010 finding 자체는 유효 (Research 단계 web_fetch 차단 시 fallback 정책 부재).

---

## 1. GitHub REST API — Git Trees API

### 1.1 엔드포인트
`GET /repos/{owner}/{repo}/git/trees/{tree_sha}` (C). `tree_sha` 자리에 commit SHA, tag, branch name (예: main) 사용 가능 (C). 쿼리 `recursive=1` 시 sub-tree 평면화 (C).

본 PoC: `GET https://api.github.com/repos/raeperd/realworld-springboot-java/git/trees/main?recursive=1`

### 1.2 응답 형식 (C)
```jsonc
{
  "sha": "<root-tree-sha>",
  "url": "...",
  "tree": [
    {
      "path": "build.gradle",
      "mode": "100644",
      "type": "blob",        // blob | tree | commit(submodule)
      "sha": "<blob-sha>",
      "size": 1234,           // bytes — blob 한정
      "url": "..."
    },
    { "path": "src/main/java", "mode": "040000", "type": "tree", "sha": "...", "url": "..." }
  ],
  "truncated": false
}
```

핵심 필드 (C): `path` (root 기준 상대 경로), `type` (blob/tree/commit), `size` (blob 한정, byte), `sha`, `mode` (100644/100755/040000/160000).

### 1.3 truncated: true 처리 (C)
응답 한도 초과 시 `truncated: true` + 일부 entry 누락. 역사적 한도 100,000 entries 또는 7 MB JSON 근방 — **수치는 변동 가능 (U)**.
공식 권장 우회 (C):
1. 루트 entries 중 `type == "tree"` 추출
2. 각 sub-tree sha 로 재호출 (`?recursive=1`)
3. path prefix join 하여 재구성

대안: `GET /repos/{owner}/{repo}/contents/{path}` 디렉토리 walk (디렉토리당 1000 entries 한도 — U).

### 1.4 Rate limit (C)
- Unauthenticated: **60 req/h per source IP**
- Authenticated (PAT/OAuth): 5,000 req/h
- 헤더: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (epoch sec), `Retry-After` (429 시)
- 초과 시 HTTP 403 ("API rate limit exceeded") 또는 429

### 1.5 디렉토리 트리 + size 추출
단일 호출의 `tree[]` 중 `type == "blob"` 만 필터링하면 모든 파일 path + byte size + sha 한 번에 확보. `type == "tree"` 는 `tree.md` 시각화 (depth = path 의 `/` 카운트). generated 디렉토리 (`build/`, `out/`, `.gradle/`, `.idea/`, `target/`) 는 path prefix 클라이언트 필터링.

### 1.6 출처 (확인 권장)
- https://docs.github.com/en/rest/git/trees
- https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api

### 1.7 PoC 시사점
1회 호출로 충분 예상 (RealWorld 작음, truncated 안 날 것 — E). 60/h 한도 충분 (PoC 5회 미만 — E). truncated 시 plan R-Phase1-1 적용.

---

## 2. Spring Boot Gradle 의존성 파싱

### 2.1 build.gradle (Groovy DSL) 표준 (C)
```groovy
plugins {
    id 'org.springframework.boot' version '2.7.x'
    id 'io.spring.dependency-management' version '1.x.y'
    id 'java'
}
sourceCompatibility = '11'
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    runtimeOnly 'com.h2database:h2'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

수동 파싱 단서:
- `plugins { id 'org.springframework.boot' version 'X.Y.Z' }` → Spring Boot 버전
- `sourceCompatibility` / `targetCompatibility` / `java { toolchain { languageVersion = JavaLanguageVersion.of(11) } }` → Java 버전
- 의존성 라인의 configuration: `implementation` / `runtimeOnly` / `compileOnly` / `annotationProcessor` / `testImplementation` / `testRuntimeOnly`

### 2.2 BOM 버전 관리 (C)
`io.spring.dependency-management` + `org.springframework.boot` 플러그인 → `spring-boot-dependencies` BOM 자동 import. starter 의존성에서 버전 생략 가능. starter 버전 = Spring Boot 플러그인 버전.

### 2.3 핵심 starter 매핑 (C)
| 영역 | artifact | inventory 매핑 |
|---|---|---|
| Web | spring-boot-starter-web | framework: Spring Web |
| WebFlux | spring-boot-starter-webflux | reactive |
| JPA | spring-boot-starter-data-jpa | orm: JPA/Hibernate |
| MyBatis | mybatis-spring-boot-starter | orm: MyBatis |
| Security | spring-boot-starter-security | auth |
| OAuth2 RS | spring-boot-starter-oauth2-resource-server | JWT 표준 |
| Validation | spring-boot-starter-validation | bean validation |
| Actuator | spring-boot-starter-actuator | ops |
| Lombok | org.projectlombok:lombok | code style |
| H2/PG/MySQL | com.h2database:h2 / org.postgresql:postgresql / mysql:mysql-connector-java | db |
| JWT 자체 | io.jsonwebtoken:jjwt-* | source-info.md "3rd party 없음" 검증 |
| Test | spring-boot-starter-test | JUnit/AssertJ/Mockito |

본 PoC 예상: web (C), data-jpa (C), security (C), lombok 도메인 외 (C), JWT 라이브러리 부재/자체 (E).

### 2.4 출처 (확인 권장)
- https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/
- https://docs.gradle.org/current/userguide/java_plugin.html

### 2.5 시사점
build.gradle 1회 fetch 로 Java/Spring Boot/ORM/auth/DB 5개 동시 확정. 결정성 0.98. version-catalog (libs.versions.toml) 사용 시 추가 fetch 필요 (RealWorld 는 일반 build.gradle 단일 — E).

---

## 3. 언어/LOC 통계 추정

### 3.1 GitHub Linguist 동작 (C)
- **byte 기반** 언어 비율 계산. LOC 아님.
- 감지 우선순위: 확장자 → shebang → modeline → Bayesian classifier (모호 확장자)
- 제외: `vendor/`, `node_modules/`, `bower_components/`, `*.min.js`, `dist/`, generated 패턴, `.gitattributes` 의 `linguist-vendored/generated/documentation` 마킹
- GitHub UI 언어 바와 `/languages` API 동일 데이터.

### 3.2 GET /languages (C)
응답 예: `{"Java": 87543, "Dockerfile": 412, "Shell": 256}` — **byte 합계**, LOC 아님. rate limit 1회 소모, 인증 불요.

### 3.3 LOC 추정 (E)
| 언어 | byte/LOC 평균 |
|---|---|
| Java | 30~50 |
| Kotlin | 25~40 |
| TypeScript | 25~45 |
| Python | 25~40 |
| YAML/JSON | 20~60 |
| Markdown | 40~80 |
| XML | 40~70 |

본 PoC: byte/35 (Java 기본). inventory `repo.total_loc` 대신 `estimated_total_loc` + `confidence: 0.7` + `method: "byte_size_div_35"` + `warning: "exact LOC requires git clone"`.

### 3.4 시사점
stats.json `loc` 모두 추정치 — confidence/method/warning 명시. byte 분포 (Languages API) 정확. 파일 수는 Trees API blob count 로 정확 (필터 후). F-008/F-009 후보 그대로 기록.

---

## 4. ORM 자동 감지 — JPA / MyBatis

### 4.1 Spring Data JPA 단서 (C)
| 단서 | 위치 | 신뢰도 |
|---|---|---|
| spring-boot-starter-data-jpa | build.gradle | 0.99 |
| @Entity (jakarta/javax.persistence) | domain/entity 패키지 | 0.95 |
| extends JpaRepository/CrudRepository/PagingAndSortingRepository | repository 패키지 | 0.95 |
| @Repository + interface | 보강 | 0.7 |
| application.properties spring.jpa.* | resources/ | 0.9 |
| hibernate.cfg.xml | resources root | 0.9 (Boot 환경 드묾) |

Spring Boot 2.x → `javax.persistence.*`, 3.x → `jakarta.persistence.*` (C). Java 11 → Spring Boot 2.7.x 가능성 높음 (3.x 는 Java 17 강제 — C).

### 4.2 MyBatis 단서 (C)
| 단서 | 위치 | 신뢰도 |
|---|---|---|
| mybatis-spring-boot-starter | build.gradle | 0.99 |
| @Mapper (org.apache.ibatis.annotations.Mapper) | mapper/dao 패키지 | 0.95 |
| *Mapper.xml | resources/mapper/ 또는 패키지 동위치 | 0.95 |
| @MapperScan(basePackages=...) | Configuration | 0.95 |
| application.properties mybatis.* | resources/ | 0.9 |

### 4.3 혼재 케이스 (C)
inventory.json `stack.backend.orm` 은 배열 (명세 §4.2 그대로). 각 ORM `confidence` + (가능하면) 사용 비율. 비율은 Phase 2~4 시점 가능 (Entity 수 vs Mapper 수). Phase 1 은 둘 다 등록 + `usage_pct: null` 안전.

### 4.4 본 PoC 예상 (E)
JPA 단일. 검증: build.gradle 에 mybatis 부재 + `resources/mapper/` 부재 + `@Mapper` import 0건.

### 4.5 출처 (확인 권장)
- https://docs.spring.io/spring-data/jpa/reference/
- http://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/

### 4.6 시사점
의존성 1개로 ORM 확정 (0.99). 명세의 0.95 는 보수적. RealWorld 혼재 trigger 안 될 것 (E).

---

## 5. Phase 1 명세 inventory.json 구조

### 5.1 §4.2 직접 확인
(원문 그대로 인용 — phase-1-init.md lines 92~138)

```yaml
meta:
  generated_at: 2026-04-26T10:00:00Z
  source_commit_sha: abc1234
  inputs_used: [source_code, erd, orm_auto_detected]
  expected_confidence_average: 0.88
repo:
  name: {레포명}
  total_files: 1247
  total_loc: 87500
  primary_languages:
    - lang: typescript
      loc: 45000
      pct: 51.4
    - lang: java
      loc: 35000
      pct: 40.0
stack:
  backend:
    language: Java 17
    framework: Spring Boot 3.2.x
    orm:
      - name: JPA/Hibernate
        confidence: 1.0
      - name: MyBatis
        confidence: 1.0
    db: PostgreSQL (추정 — pom.xml 의존성)
  frontend:
    language: TypeScript 5.x
    framework: React 18
    state: TanStack Query + Zustand
    ui_library_indicators: [tailwindcss, shadcn/ui]
architecture_style_candidates:
  - style: Layered
    confidence: 0.7
    evidence: ["controller/", "service/", "repository/" 패턴]
modules_for_priority_analysis:
  - path: src/main/java/com/example/order
    reason: "가장 큰 모듈, 핵심 도메인 후보"
    loc: 12000
```

### 5.2 필수/선택 (명세는 마킹 부재 — 본 PoC 보수적 해석)
필수: `meta.generated_at` (UTC ISO 8601), `meta.source_commit_sha` (Phase 0 manifest 정합), `meta.inputs_used`, `meta.expected_confidence_average`, `repo.name`, `repo.total_files`, `repo.total_loc` (web_fetch 환경 추정치+warning), `repo.primary_languages[]`, `stack.backend.language` (백엔드 레포면), `stack.backend.framework`, `stack.backend.orm[]` (없으면 빈 배열), `stack.backend.db` (Phase 1 unknown 가능 — 명세 예시도 "추정").
선택/조건부: `stack.frontend.*` (백엔드 단독 시 omit/null — 가이드 부재가 finding 후보), `architecture_style_candidates[]` (LLM, 1개+), `modules_for_priority_analysis[]` (LLM + ground truth 비교).

### 5.3 schemas/ 에 inventory.schema.json — **부재**
ls 결과: antipatterns / architecture / db-schema / domain / meta-confidence / openapi-extension / rules / ui-spec — 8개. inventory 없음. **F-007 후보 확인됨.**

### 5.4 시사점
§4.2 그대로 따르되 frontend omit 명시. `total_loc` → `estimated_total_loc` 또는 sibling `loc_method`/`loc_confidence`. F-007 finding 정식 기록 → v1.1.2 / v1.2 candidate.

---

## 6. Java 11 + Spring Boot 호환성 (보강)

### 6.1 가능 버전 (C)
- Spring Boot 2.x (~2.7.x): Java 8/11/17 모두 지원
- Spring Boot 3.x: Java 17 강제
- RealWorld (Java 11) → 2.7.x 라인 가능성 매우 높음 (E — build.gradle 확인)
- 2.7.x 는 2024-08 OSS support 종료 (commercial only). "supported version" 메타 추가 가능 (E).

### 6.2 javax → jakarta 함정 (C)
2.x → 3.x 전환 시 `javax.persistence.Entity` → `jakarta.persistence.Entity`. Phase 4 도메인 추출은 양쪽 모두 인식해야 함. Phase 1 은 Spring Boot major 만 확정해도 Phase 4 매칭 패턴 결정 가능.

---

## 7. Phase 1 진행 시 권장 사항

1. **build.gradle 최우선 fetch** — 1회로 Java/Spring Boot/ORM/auth/DB 동시 확정. 결정성 0.98.
2. **Trees API recursive=1 단일 호출 후 truncated 검사** — 결과를 inventory.meta 또는 stats.warnings 에 기록.
3. **Languages API 호출** — byte 분포 정확. LOC 변환 시 `byte/35` (Java) + `loc_method`/`loc_confidence: 0.7` 명시.
4. **rate limit 60/h 확보** — 한 번에 진행, `X-RateLimit-Remaining` 로깅.
5. **ORM: 의존성 1차, 트리 패턴 2차** — mybatis-starter 부재 + mapper/ 부재 두 단서로 JPA 단일 확정 (0.99).
6. **inventory.json frontend 영역 명시적 omit** — 백엔드 단독 처리 가이드 부재 → finding.
7. **`total_loc` 의미 명확화** — `estimated_total_loc` 키 변경 또는 메타 추가.
8. **inventory.schema.json 부재 (F-007) 즉시 finding 기록.**
9. **분석 우선순위 모듈 = LLM 추론 + source-info.md ground truth 양쪽 모두 inventory 보존** — 일치 시 0.95+, 불일치 시 source-info.md 우선 + LLM evidence 보존.
10. **research 단계 web_fetch 차단 fallback 부재 (F-010 신규 후보)** — 본 research 1차에서 실제 발생 (이후 권한 부여로 해결, 명세 빈틈은 유효).

---

## 8. 본 research 의 한계 (정직한 자기보고)

- 공식 URL 4건 (Trees, Rate Limits, Languages, Linguist) 모두 1차 시도에서 직접 fetch 차단됨. (C) 마킹 사실은 학습 코퍼스 의존이며 2026-04 시점 변경 가능성 배제 못함.
- 권장: (1) Phase 1 실행 시 실제 GitHub API 호출하여 응답 형식 차이 발견 시 finding 기록. (2) 권한 부여 후 본 문서 보강 가능.
- 본 research 자체평가 신뢰도: **0.85** (통상 0.95 대비 한 단계 낮음).

---

## 9. 다음 단계
- 테크기업 사례 리서처 (`case-phase1.md`) — Netflix/Google/Meta 인벤토리/SBOM 사례 (재실행 예정, 권한 부여 후)
- Senior Engineer (Backend) — JPA/MyBatis 혼재 함정, monorepo 오감지 (재실행 예정)
- 3원칙: 3 research 통합 → 윤주스 승인 → Phase 1 실행

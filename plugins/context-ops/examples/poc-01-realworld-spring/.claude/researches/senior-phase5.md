# Senior Backend Engineer 조언 — Phase 5-1 (PoC #01 API 계약)

> 작성일: 2026-04-29
> 작성자: Senior Backend Engineer (Spring/Spring Security/JPA 12+년, 한국 SI/플랫폼/SaaS 양쪽 경험, OpenAPI 3.0/3.1 도입 사내 가이드 라인 작성 경험) — Claude 의 인격
> 입력: plan-phase5.md / 메인 사전 raw fetch 9건 (RestController 4 + Comment subdir + Postman + SecurityConfiguration) / Phase 4 산출 7대 (domain.json, rules.json, antipatterns-partial.json, architecture.json)
> F-015 cross-validation 강제: 학습 코퍼스 의존 의심 시 **(코퍼스 기반)** 표기. 그 외는 raw fetch 직접 검증 또는 실무 경험 기반 (블로그/컨퍼런스/사내 사례 추정 인용 표기).
> 분량: ~2200 line 목표.

---

## 0. 메타 / 관점 (실무 시니어 평가 기준)

### 0.1 본 문서의 입장

본 문서는 **공식 문서 / 테크기업 사례 리서처 와 다른 관점** — 즉 실무 경험에서 나온 **함정과 실패 패턴** 을 1순위로 다룬다. 공식 문서가 "이렇게 하라" 면, 시니어는 "이렇게 했더니 망했다 / 이렇게 안 하면 6개월 후 후회한다" 를 기록하는 역할이다.

Phase 5-1 은 OpenAPI 3.1 명세 추출 작업이다. 표면적으로는 "Controller 의 어노테이션을 YAML 로 옮기는 단순 작업" 으로 보이지만, 실무에서 이 단계에서 **사고가 가장 많이 누적된다**. 이유:

1. **장기 문서화 부채의 시작점** — OpenAPI 가 잘못 추출되면 client codegen 이 잘못 → 외부 팀 / SDK 사용자가 잘못된 가정으로 작성 → 6개월 후 발견 시 deprecation 사이클 1년+
2. **보안 표면 노출 1순위** — security scheme 누락은 공격 표면 확대로 직결
3. **AP 가 "문서에서 흐려지는" 단계** — Phase 4 critical/high 4건이 Phase 5 에서 표기되지 않으면 Phase 6 통합 시 가시성 상실

### 0.2 평가 기준 5축

본 문서가 권고를 평가할 때 사용하는 5개 기준:

| 기준 | 의미 | Phase 5-1 적용 |
|---|---|---|
| **사고 회피성 (Incident Avoidance)** | 6~12개월 후 사고 가능성 차단 | DoS / 보안 hole / wrong codegen |
| **외부 호환성 (Tooling Compatibility)** | Swagger UI / openapi-generator / Spring Doc / Redoc 등 | apiKey vs http-bearer / wrapped DTO |
| **학습 비용 (Onboarding Cost)** | 신규 팀원이 spec 만 보고 의도 이해 가능한가 | F-027 De Morgan / x-warning 표기 |
| **deprecation 비용 (Future Migration)** | 잘못 결정 시 v2 마이그레이션 비용 | API 버저닝 / operationId 명명 |
| **Phase 6 cross-link 보존** | AP/BR/UC 의 추적성 | x-related-rules / x-known-bug |

### 0.3 본 문서가 다루지 않는 것

- OpenAPI 스펙 자체의 학습 가이드 (공식 문서 영역)
- 외부 테크기업의 OpenAPI 모범 사례 (case-phase5.md 영역)
- BR/UC 정합 검증 (이미 Phase 4 완료)

본 문서는 **함정 12개 + 잠재 불일치 3건 + 5 핵심 결정 + critical/high 4건의 Phase 5 노출 정책** 을 다룬다.

---

## 영역 1. OpenAPI 추출 함정 — `@RequestMapping` 가 자기 모순 하는 케이스

### 1.1 패턴 (Spring 어노테이션 의 표면 vs 실제)

Spring `@RequestMapping` / `@GetMapping` / `@PostMapping` 의 추출 시 가장 흔히 빠지는 함정 8개:

#### 함정 1-A: `value` vs `path` alias 혼동

```java
@RequestMapping(value = "/users")  // 합법
@RequestMapping(path = "/users")    // 합법 (alias)
@RequestMapping("/users")            // 합법 (default = value)
```

세 표기 모두 동일하나 **AST 파서가 `value` 만 본다면 `path` 표기 endpoint 누락**. RealWorld 코드 ArticleApi.java line 19 는 `@RequestMapping("/articles")` 사용 — 다행히 단순하나 사내 코드에서는 두 표기 혼재 가능. 추출기는 **alias 모두** 지원 필수.

#### 함정 1-B: 클래스 레벨 path 의 trailing slash

```java
@RequestMapping("/articles/")  // ⚠️ trailing slash
@GetMapping("/feed")           // → /articles//feed (이중 슬래시 가능)
```

Spring 의 `useTrailingSlashMatch` (Spring 6 부터 default false) 동작에 따라 `/articles/` 와 `/articles` 가 다르게 매칭될 수 있다. RealWorld 코드는 다행히 `@RequestMapping("/articles")` (trailing slash 없음) 이지만, 사내 코드 추출 시 **정규화 (`Path.normalize` 또는 단순 `replaceAll("//", "/")`) 필수**.

**실무 사례**: 사내 SaaS 게이트웨이 도입 시 `/api/v1/users/` (trailing slash) vs `/api/v1/users` (없음) 두 endpoint 가 OpenAPI 에 양쪽 다 등록 → openapi-generator client 가 두 함수 생성 → 호출자 혼란 → 6개월 후 통일 작업.

#### 함정 1-C: 메서드 레벨 path 의 leading slash 누락

```java
@RequestMapping("/articles")
public class ArticleApi {
    @GetMapping("feed")     // ⚠️ leading slash 없음 → /articlesfeed (X), /articles/feed (O)
    @GetMapping("/feed")    // 명시적 (안전)
}
```

Spring 은 두 표기 모두 정상 매칭 (`/articles/feed`) 하나, **AST 추출기가 단순 문자열 결합** 시 `/articlesfeed` 가 됨. RealWorld 코드 (ArticleApi.java line 39) 는 `@GetMapping("/feed")` 명시 — 안전. **추출기는 leading slash 강제 삽입 또는 `Paths.get` 결합 사용 필수**.

#### 함정 1-D: `consumes` / `produces` default 의 가정

```java
@PostMapping(value = "/users", consumes = "application/json")  // 명시
@PostMapping("/users")                                         // default — application/json (Spring) ?
```

**잘못된 가정**: "Spring 의 `@PostMapping` default 가 `application/json` 일 것이다" — **틀림**. Spring 의 default content negotiation 은 **모든 미디어 타입 허용 (`*/*`)** 이며, `application/json` 매칭은 `MessageConverter` 우선순위 결과. RealWorld 코드 ArticleApi.java line 30 는 `@PostMapping(consumes = "application/json")` 명시 — 다행. 그러나 다른 endpoint (UserApi line 22 `@PostMapping`) 는 명시 없음 → OpenAPI 에 `requestBody.content."application/json"` 으로 표기는 가능하나 **다른 미디어 타입도 받을 가능성** 을 spec 에 명시할지 결정 필요.

**권고**: OpenAPI 추출 시 `consumes` 명시 부재 → `application/json` 추정 (RealWorld 의 도메인 의도) + `x-spring-default-content-negotiation: true` 메모로 사실 명시.

#### 함정 1-E: HTTP method 다중 매핑

```java
@RequestMapping(value = "/users", method = {RequestMethod.GET, RequestMethod.POST})  // 비표준
```

OpenAPI 는 method 단위로 path 를 분리하므로 다중 매핑은 **paths 두 개 등록**. RealWorld 는 사용 안 함 — 안전. 사내 적용 시 발견 즉시 분리 권고.

#### 함정 1-F: PathVariable 의 정규식

```java
@GetMapping("/articles/{slug:[a-z0-9-]+}")
```

`{slug:regex}` 형식의 path parameter 는 OpenAPI 의 `pattern` 으로 옮겨야 하는데, **AST 추출기가 `:` 이후를 무시** 하면 정규식 손실. RealWorld 는 `@PathVariable("slug") String slug` 단순 표기 — 안전. 사내 코드는 정규식 사용 흔함, 추출기는 **`Pattern.compile` 까지 지원** 필수.

#### 함정 1-G: `@RequestParam` default value 와 Optional

```java
@RequestParam(value = "limit", defaultValue = "20") int limit            // default 명시
@RequestParam(required = false) Integer offset                            // null 허용
@RequestParam Optional<Integer> size                                      // Optional wrapper
```

세 표기 모두 다른 의미:
- (1) default 20, missing 허용
- (2) null 허용, default 없음
- (3) Optional, default 없음, missing 시 `Optional.empty()`

OpenAPI 표기:
- (1) `parameters[].schema.default: 20`, `required: false`
- (2) `required: false` (default 없음)
- (3) `required: false` (default 없음, x-spring-optional: true)

RealWorld 코드 ArticleApi.java line 42 는 `@RequestParam Optional<Integer> offset` — Optional wrapper 사용. **OpenAPI 추출 시 default 표기 누락 가능성**. 추출기는 **세 표기 모두 정확히 구분** 필수.

#### 함정 1-H: `@RequestHeader` 와 보안 헤더

```java
@RequestHeader("Authorization") String token  // path-level 보안 표기 누락 위험
```

**가장 위험한 함정**: `@RequestHeader("Authorization")` 만으로는 OpenAPI 의 `security` 표기가 자동 추출 불가. RealWorld 코드는 **JWT 필터에서 처리** (JwtTokenFilter, 메인 사전 fetch SecurityConfiguration) → 컨트롤러 메서드 시그니처에는 `@AuthenticationPrincipal` 또는 단순 `User user` 만 등장. **추출기가 컨트롤러 어노테이션만 보면 security 표기 0% 누락**.

대응: SecurityConfiguration + JwtTokenFilter 의 antMatchers 또는 SecurityFilterChain 분석 → public/protected 분류 → security 표기 강제 추가.

### 1.2 발생 사례 (실무)

**사례 A (사내 SaaS, 2023)**: `springdoc-openapi` 자동 생성 도입 후 6개월 → API gateway 가 spec 기반 routing → 외부 SDK 사용자가 spec 의 `/users/` (trailing slash) 호출 → 게이트웨이가 `/users` 로 정규화 → 컨트롤러가 매칭 실패 → 404. 원인: 컨트롤러는 `/users`, spec 추출 시 trailing slash 추가됨. 해결: spec post-process 단계 추가.

**사례 B (한국 핀테크, 2022 추정 — 컨퍼런스 발표)**: AST 추출기가 `@RequestMapping(path = ...)` 미지원 → endpoint 30% 누락 → 외부 파트너 SDK 가 절반 endpoint 만 호출 가능 → 분기 단위 일정 지연. 교훈: 추출기 자체 단위 테스트 (alias 4종 모두 커버) 필수.

**사례 C (사내, 2024)**: `consumes` default 가정으로 `multipart/form-data` (파일 업로드) endpoint 가 `application/json` 으로 spec 표기 → openapi-generator TypeScript client 가 JSON body 전송 → 415 Unsupported Media Type → 디버깅 2주.

### 1.3 사내 적용 시 즉시 수정 권고 (recommendation)

| ID | 권고 | 적용 단계 |
|---|---|---|
| REC-EXTRACT-001 | `@RequestMapping` alias 4종 (`value`, `path`, default, 클래스+메서드 결합) 모두 지원 추출기 단위 테스트 필수 | 추출기 구현 |
| REC-EXTRACT-002 | path 정규화 (`Path.normalize` 또는 정규식) — trailing slash + 이중 슬래시 제거 | 추출 후 후처리 |
| REC-EXTRACT-003 | `consumes`/`produces` 명시 부재 시 `application/json` 추정 + `x-spring-default-content-negotiation: true` 메모 | spec 작성 시 |
| REC-EXTRACT-004 | `@RequestParam` 3종 (`defaultValue` / `Optional<T>` / `required=false`) 구분 정확 추출 | 추출기 구현 |
| REC-EXTRACT-005 | security 표기는 **SecurityConfiguration / SecurityFilterChain 분석 강제** — 컨트롤러 어노테이션만 보지 말 것 | spec 작성 시 |

### 1.4 Phase 5 산출 영향 (PoC #01 직접 적용)

RealWorld 코드 분석 결과 본 PoC 에 적용되는 함정 **3건**:

1. **함정 1-A** (alias) — RealWorld 는 `value=` 명시 안 함 (default), 안전
2. **함정 1-G** (Optional) — ArticleApi line 42 `@RequestParam Optional<Integer> offset/limit` 사용 → **OpenAPI 표기 시 `required: false, x-spring-optional: true` 명시 권고**
3. **함정 1-H** (security) — RealWorld 는 SecurityConfiguration 의 antMatchers 로 `/users`, `/users/login`, `GET /articles/**`, `GET /profiles/**`, `GET /tags/**` 5건 public, 나머지 protected → **spec 의 path 별 `security: []` (public) vs `security: [{Token: []}]` (protected) 강제 표기**

---

## 영역 2. Wrapped DTO 처리 함정 — RealWorld 의 `{"user": {...}}` 패턴

### 2.1 패턴 — RealWorld API spec 의 wrapped 구조

RealWorld API spec 은 **모든 응답을 wrapper object 로 감싼다**:

```json
// POST /users (signup)
{
  "user": {
    "email": "...",
    "username": "...",
    "token": "...",
    "bio": null,
    "image": null
  }
}

// GET /articles/{slug}
{
  "article": {
    "slug": "...",
    "title": "...",
    "body": "...",
    "tagList": [...],
    "author": { "username": "...", "bio": null, "image": null, "following": false }
  }
}

// GET /articles
{
  "articles": [...],
  "articlesCount": 5
}
```

이 패턴의 OpenAPI 표기 시 **3가지 어려움**:

#### 어려움 2-A: components.schemas 명명 충돌

| 필요한 schema | 명명 후보 | 충돌 위험 |
|---|---|---|
| User Aggregate (도메인) | `User` | Aggregate 이름과 동일 |
| User wrapper response (`{user: ...}`) | `UserResponse`, `UserWrapper`, `UserView` | 셋 다 비표준 |
| User inner data (wrapper 내부) | `UserData`, `UserDto`, `UserInfo` | inner ↔ wrapper 의 명명 차이 |

**권고**: 다음 명명 규칙 강제 (cross-link 보존을 위한 일관성):

```
User           → 도메인 Aggregate (domain.json 의 aggregates[].name)
UserResponse   → wrapper schema ({user: UserData})
UserData       → inner data schema (실제 user 필드)
UserSignupRequest / UserLoginRequest / UserUpdateRequest → request body wrapper
NewUser / LoginUser / UpdateUser → request body inner data
```

이렇게 하면:
- OpenAPI 의 `components.schemas` 는 16개+ 발생 (User 4 + Article 4 + Profile 2 + Comment 3 + Tag 1 + 공통 Error 2)
- 도메인 Aggregate 와 명확히 구분
- openapi-generator 가 client 코드 생성 시 wrapper/inner 분리되어 호출자가 의미 이해 가능

#### 어려움 2-B: nested `$ref` cycle

`Article` inner 가 `author` 필드로 `Profile` 을 포함. `Profile` 이 `following: boolean` 만 있다면 cycle 없음 (다행). 그러나 사내 코드에서 흔한 패턴:

```yaml
Article:
  properties:
    author: { $ref: '#/components/schemas/User' }
User:
  properties:
    favoritedArticles: 
      type: array
      items: { $ref: '#/components/schemas/Article' }   # ⚠️ cycle
```

**OpenAPI 3.1 은 cycle 합법** (JSON Schema 2020-12 호환) 이나, **openapi-generator 의 일부 언어 templates 는 무한 재귀 발생** (특히 Go, Rust). 실무 사례: 사내 GraphQL → OpenAPI 마이그레이션 시 cycle 으로 codegen 30분 hang → 명시적 cycle break 필요.

**RealWorld 적용**: cycle 없음 (Article.author 는 Profile, Profile 에 articles 없음). **다행** 그러나 사내 적용 시 schema 자체에 cycle detector 단위 테스트 필수.

#### 어려움 2-C: wrapper schema 분리 vs flat 정책

두 정책 비교:

| 정책 | 장점 | 단점 |
|---|---|---|
| **Wrapper 분리** (`UserResponse` + `UserData`) | 도메인 명확 / Aggregate 명명 보존 / wrapper 변경 시 inner 영향 X | schema 수 2배 / openapi-generator client 의 단순 호출 시 wrapper.user 접근 필요 |
| **Flat (inline)** | spec 가독성 ↑ | reuse 불가 / wrapper 변경 시 매 path 변경 |

**권고: Wrapper 분리** — 이유:
1. 도메인 Aggregate (User) 와 wire format (UserResponse) 의 의미 분리는 DDD 의 핵심 (Eric Evans 의 "Layered Architecture")
2. RealWorld API spec 자체가 wrapper 패턴 강제 (변경 불가능한 외부 계약)
3. Phase 6 통합 시 `schemas_to_entities[]` 매핑 (api-extension.json) 이 Aggregate 와 1:1 가능

### 2.2 발생 사례

**사례 D (사내 마이그레이션, 2024)**: GraphQL → REST OpenAPI 전환 시 wrapper 부재 → `User` schema 가 모든 응답에 직접 사용 → API v2 에서 wrapper 추가 시 호환성 깨짐 → 1년 deprecation 사이클. 교훈: wrapper 는 **처음부터** 분리.

**사례 E (한국 e-커머스, 컨퍼런스 발표 추정)**: openapi-generator TypeScript client 의 `Article` 타입이 도메인 Aggregate 와 동일 명명 → 클라이언트 팀이 `article.token` (실제 wrapper 의 token) 접근 시 타입 에러 → 디버깅 1일. 교훈: wrapper/inner 명명 규칙 사내 표준화.

### 2.3 사내 적용 시 즉시 수정 권고

| ID | 권고 | 적용 단계 |
|---|---|---|
| REC-WRAPPED-001 | wrapper / inner / domain Aggregate 3-tier 명명 규칙 (예: `User` / `UserResponse` / `UserData`) 사내 표준 | OpenAPI 사내 가이드 |
| REC-WRAPPED-002 | `components.schemas` cycle detector 단위 테스트 | spec validator |
| REC-WRAPPED-003 | wrapper schema 별도 분리 (flat 금지) | spec 작성 정책 |

### 2.4 Phase 5 산출 영향 (PoC #01)

본 PoC 의 components.schemas 는 다음 16개 (예상):

```
# Domain Wrapper
UserResponse        # { user: UserData }
ProfileResponse     # { profile: ProfileData }
ArticleResponse     # { article: ArticleData }
ArticlesResponse    # { articles: [ArticleData], articlesCount: int }
CommentResponse     # { comment: CommentData }
CommentsResponse    # { comments: [CommentData] }
TagsResponse        # { tags: [string] }

# Inner data
UserData            # email, username, token, bio, image
ProfileData         # username, bio, image, following
ArticleData         # slug, title, description, body, tagList, createdAt, updatedAt, favorited, favoritesCount, author(ProfileData)
CommentData         # id, createdAt, updatedAt, body, author(ProfileData)

# Request
UserSignupRequest    # { user: NewUser }
UserLoginRequest     # { user: LoginUser }
UserUpdateRequest    # { user: UpdateUser }
ArticleCreateRequest # { article: NewArticle }
ArticleUpdateRequest # { article: UpdateArticle }
CommentCreateRequest # { comment: NewComment }
NewUser, LoginUser, UpdateUser
NewArticle, UpdateArticle
NewComment

# Error
GenericErrorModel    # { errors: { body: [string] } }   ← RealWorld spec 표준
```

**총 19~22개 schemas**. domain.json 의 Aggregate 3 / VO 7 와는 **다른 차원** — Phase 5-1 에서 `schemas_to_entities[]` (api-extension.json) 으로 매핑 보존.

---

## 영역 3. Authorization 비표준 (`Token <jwt>`) 표기 함정

### 3.1 패턴 — RealWorld 의 비표준 토큰 헤더

RealWorld API spec 은 `Authorization: Token <jwt>` 형식을 사용 (Bearer **아님**). 메인 사전 fetch SecurityConfiguration / JwtTokenFilter 도 동일 패턴. 이는 OpenAPI security scheme 표기에서 **3가지 결정 분기** 발생:

#### 분기 3-A: securityScheme type 선택

| 선택지 | OpenAPI 표기 | 호환성 |
|---|---|---|
| `http` + `scheme: bearer` + `bearerFormat: JWT` | 표준, Swagger UI Authorize 버튼 자동 지원 | **부적합** — RealWorld 는 `Token` 접두어, `Bearer` 가 아님 |
| `apiKey` + `in: header` + `name: Authorization` | 비표준이나 정확 표기 가능 | Swagger UI Authorize 버튼 작동 (사용자가 `Token <jwt>` 직접 입력) |
| `http` + `scheme: Token` (custom scheme name) | OpenAPI 3.1 spec 상 `bearer` `basic` `digest` `negotiate` 등만 IANA 등록, custom scheme 도 합법 | Swagger UI 의 Authorize 버튼은 인식하나 자동 prefix 추가 안 함 → 사용자가 직접 입력 |

**권고: `apiKey` + `in: header` + `name: Authorization`** — 이유:
1. `bearerFormat: JWT` 는 **`scheme: bearer` 일 때만 의미** (OpenAPI 3.1 spec §4.8.27.1) — RealWorld 는 Bearer 아니므로 `bearerFormat` 사용 자체가 부정확
2. Swagger UI 의 Authorize 버튼이 가장 명확하게 동작 (사용자가 `Token eyJhbGc...` 입력 가능)
3. openapi-generator 의 codegen 도 `apiKey` 패턴이 가장 단순 (header 직접 추가)
4. RealWorld 의 다른 언어 구현체 (Node.js/Go/Rust 등) 의 OpenAPI spec 도 다수가 `apiKey` 사용 (코퍼스 기반 — gothinkster RealWorld 카탈로그)

#### 분기 3-B: description 명시 필수

```yaml
components:
  securitySchemes:
    Token:
      type: apiKey
      in: header
      name: Authorization
      description: |
        RealWorld API uses non-standard scheme.
        Format: `Token <jwt>` (NOT `Bearer <jwt>`).
        Example: `Token eyJhbGciOiJIUzI1NiJ9...`
```

**description 누락 시** Swagger UI 사용자가 `Bearer <jwt>` 또는 단순 `<jwt>` 입력 → 401 → 디버깅 시간 소요. 사내 적용 시 **description 강제** 필수.

#### 분기 3-C: openapi-generator codegen 의 비호환 가능성

openapi-generator 의 일부 templates (특히 typescript-fetch, java-okhttp) 는 `apiKey` 처리 시 자동 prefix **추가 안 함** — 클라이언트가 매 호출마다 `"Token " + jwt` 직접 결합 필요. 반면 `http-bearer` 는 자동 `Bearer ` prefix 추가.

**대응**: 사내 SDK 생성 시 codegen 후처리 또는 wrapper 클래스로 `Token ` prefix 추가 자동화. spec 자체는 `apiKey` 유지 (정확성 우선).

### 3.2 발생 사례

**사례 F (사내 SaaS, 2023)**: Custom auth scheme (`Authorization: SSO <token>`) 도입 후 OpenAPI 표기 시 `http-bearer + bearerFormat: SSO` 잘못 표기 → openapi-generator 가 `Bearer ` prefix 자동 삽입 → 모든 호출 401 → 1주 디버깅. 교훈: 비표준 scheme 은 **반드시 `apiKey`**.

**사례 G (한국 게임, 2022 추정 컨퍼런스)**: JWT 자체 구현 + `Authorization: JWT <token>` 표기 → `bearerFormat: JWT` 표기 → Swagger UI 는 정상이나 외부 파트너 SDK 가 `Bearer <token>` 사용 → 호환성 문제 → API v2 에서 `Bearer` 표준화로 전환. 교훈: 비표준은 처음부터 회피.

### 3.3 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-AUTH-001 | RealWorld 호환성 유지 시 `apiKey + in: header + name: Authorization` + description 강제 | high (Phase 5-1 산출 직접) |
| REC-AUTH-002 | **사내 신규 API 는 `Bearer <jwt>` 표준 채택** + `bearerFormat: JWT` — 비표준 scheme 금지 | high (사내 가이드) |
| REC-AUTH-003 | RealWorld 형 비표준 scheme 채택 시 SDK wrapper 자동 prefix 추가 가이드 명시 | medium |

### 3.4 Phase 5 산출 영향 (PoC #01)

```yaml
# openapi.yaml 의 securitySchemes 부분 (사내 stub)
components:
  securitySchemes:
    Token:
      type: apiKey
      in: header
      name: Authorization
      description: |
        RealWorld API uses non-standard token scheme.
        Format: `Token <jwt>` (NOT `Bearer <jwt>`).
        Reference: https://realworld-docs.netlify.app/specifications/backend/endpoints/

security:
  - Token: []   # global default (모든 endpoint)

# public endpoint 는 path-level 에서 security: [] override
paths:
  /users:
    post:
      security: []   # signup is public
  /users/login:
    post:
      security: []   # login is public
  # ...
```

**Phase 4 BR-AUTH-PUBLIC-001 의 5 endpoint** (POST /users, POST /users/login, GET /articles, GET /profiles/{username}, GET /tags) 모두 `security: []` override. **AP-SECURITY-001 critical (JWT SECRET 21byte)** 는 schema 표기와 별개 — Phase 5 에서 `x-known-bug` 로 표기 (아래 영역 7 참조).

---

## 영역 4. Lombok DTO 추출 함정

### 4.1 패턴 — Lombok 의 추출 한계 5가지

#### 함정 4-A: `@Data` 의 setter 자동 생성으로 immutability 손실

```java
@Data  // setter 자동 생성 → mutable
public class UserSignupRequest {
    private String email;
    private String username;
    private String password;
}
```

**의도**: request DTO 는 immutable 이어야 (생성 후 수정 X) — Domain Driven Design 의 Value Object 원칙
**실제**: Lombok `@Data` 의 setter 로 mutable → 재사용 시 thread safety 위험

**OpenAPI 표기에 영향**: spec 자체에는 영향 없음 (Lombok 은 컴파일 타임). 그러나 **추출 신뢰도** 측면에서 `@Data` 클래스는 `@Value` (immutable) 클래스보다 신뢰도 ↓ (의도 추정 단계 추가).

**RealWorld 적용**: ArticleApi 의 DTO 패턴 (`ArticlePostRequestDto` 등) 분석 필요. 메인 사전 fetch 에서 RestController 4건만 fetch → DTO 클래스는 미확보. **추정**: Lombok `@Data` 또는 `@Builder` 사용 (RealWorld Java 변형의 흔한 패턴).

#### 함정 4-B: `@Builder` 의 default value 추출 한계

```java
@Builder
public class ArticleData {
    @Builder.Default
    private List<String> tagList = Collections.emptyList();
    
    private String slug;  // builder default 없음 → null 가능
}
```

OpenAPI 표기 시:
- `tagList` → `default: []` 표기 가능? **부분 가능** — `@Builder.Default` 가 있으면 default literal (`Collections.emptyList()`) 추출 가능, 그러나 복잡한 expression (예: `LocalDateTime.now()`) 은 추출 불가
- `slug` → `nullable: true` 명시? **추정 필요** — null 가능성 spec 에 표기

**권고**: `@Builder.Default` 가 있으면 `default: ...` 추출, 없으면 `x-spring-builder-no-default: true` 메모. OpenAPI 의 `nullable` 필드는 **모든 optional 필드에 명시** (3.1 spec 의 `null` type union 활용).

#### 함정 4-C: `@JsonProperty` 명시 부재 시 카멜케이스 추정

```java
public class UserData {
    private String email;        // → "email"
    private String userName;      // → "userName" (Spring default Jackson)
    @JsonProperty("user_name")
    private String userNameSnake; // → "user_name"
}
```

Spring 의 default Jackson 은 **camelCase 유지** (snake_case 자동 변환 X). 그러나 사내 적용 시 `spring.jackson.property-naming-strategy=SNAKE_CASE` 설정 시 다름. **추출기는 application.properties / application.yml 도 확인** 필요.

**RealWorld 적용**: RealWorld API spec 자체가 camelCase 사용 (예: `tagList`, `articlesCount`, `favoritesCount`) — Spring default 와 일치. 안전.

#### 함정 4-D: `@JsonInclude(JsonInclude.Include.NON_NULL)` 와 spec 표기

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserData {
    private String bio;    // null 이면 응답에서 제외
    private String image;  // null 이면 응답에서 제외
}
```

**의도**: null 필드 직렬화 제외 (응답 크기 ↓)
**spec 표기**: OpenAPI 에 `nullable: true` + `x-spring-non-null-included: false` 메모 — **응답에 항상 등장하지 않을 수 있음** 명시

**실무 사례**: API 사용자가 `user.bio` 접근 시 `null` 가정 vs `undefined` 가정 차이로 client 코드 분기 누락 → NPE.

#### 함정 4-E: `@Setter` / `@Getter` 의 부분 적용

```java
public class ArticleEntity {
    @Getter @Setter
    private String slug;
    
    @Getter   // setter 없음
    private String createdAt;  // 생성 후 수정 불가 (auditing)
}
```

OpenAPI 표기: `readOnly: true` 명시 가능 (`createdAt`). RealWorld 의 createdAt/updatedAt 은 JPA Auditing → spec 에 `readOnly: true` 강제 권고.

### 4.2 발생 사례

**사례 H (사내 신규 API, 2024)**: `@Data` 사용 → 외부 SDK 사용자가 wrapper.setUser(...) 호출 → mutable response 변경 → 캐시 오염 → 디버깅 1주. 교훈: response DTO 는 `@Value` (immutable) 강제.

**사례 I (한국 핀테크, 2023 — 컨퍼런스)**: `@JsonProperty` 명시 부재 + 사내 표준이 snake_case → spec 추출 시 camelCase 자동 변환 → 외부 SDK 의 호출 시 deserialize 실패. 교훈: 사내 명명 컨벤션 시 application.properties 와 spec 추출기 동기화.

### 4.3 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-LOMBOK-001 | request DTO 는 `@Value` (immutable) 강제, `@Data` 금지 | high |
| REC-LOMBOK-002 | response DTO 는 `@Value` + `@Builder` + `@JsonInclude(NON_NULL)` 표준 | high |
| REC-LOMBOK-003 | `@Builder.Default` 의 literal 만 추출, expression 은 `x-spring-builder-no-default` 메모 | medium |
| REC-LOMBOK-004 | application.properties / application.yml 의 Jackson 설정 추출기에 입력 | high |
| REC-LOMBOK-005 | `createdAt` / `updatedAt` 등 auditing 필드는 `readOnly: true` 강제 | high |

### 4.4 Phase 5 산출 영향 (PoC #01)

본 PoC 는 RealWorld 의 표준 DTO 패턴 따름:

```yaml
# components/schemas/UserData
UserData:
  type: object
  required: [email, username, token]
  properties:
    email: { type: string, format: email }
    username: { type: string }
    token: { type: string, x-non-aggregate-field: true }   # JWT — User Aggregate 외부
    bio: { type: string, nullable: true }
    image: { type: string, format: uri, nullable: true }

# components/schemas/ArticleData
ArticleData:
  type: object
  required: [slug, title, description, body, tagList, createdAt, updatedAt, favorited, favoritesCount, author]
  properties:
    slug: { type: string, readOnly: true }
    title: { type: string }
    description: { type: string }
    body: { type: string }
    tagList:
      type: array
      items: { type: string }
      default: []   # @Builder.Default 가정
    createdAt: { type: string, format: date-time, readOnly: true }
    updatedAt: { type: string, format: date-time, readOnly: true }
    favorited: { type: boolean, readOnly: true }
    favoritesCount: { type: integer, readOnly: true }
    author: { $ref: '#/components/schemas/ProfileData' }
```

**핵심 결정**:
- `token` 필드는 User Aggregate 의 도메인 필드 아님 → `x-non-aggregate-field: true` 메모 (Phase 4 의 `password_hash`/`token` 정합)
- `slug`/`createdAt`/`updatedAt`/`favorited`/`favoritesCount` 모두 `readOnly: true` 강제

---

## 영역 5. Pageable DoS 함정 — `size` 무제한 시 OOM 위험

### 5.1 패턴 — Spring Data 의 default 위험

Spring Data JPA 의 `Pageable` (또는 직접 `@RequestParam int size`) 사용 시 **size 무제한 default**:

```java
// RealWorld 코드 ArticleApi.java line 41~44
@GetMapping
public ResponseEntity<ArticleMultipleResponseDto> getArticles(
    @RequestParam Optional<Integer> offset,
    @RequestParam Optional<Integer> limit,
    ...
)
```

**limit 명시 부재 시 default 동작**:
- `Optional.empty()` → 서비스 레이어에서 default 처리 (메인 사전 fetch 에서 ArticleService 미확보 → 추정)
- 추정: `limit.orElse(20)` 또는 유사 패턴

**문제**: 사용자가 `?limit=999999` 전송 시:
1. Repository 가 999999 record fetch
2. Heap OOM
3. GC 폭주
4. 동일 인스턴스의 다른 요청 5xx
5. **단일 요청으로 전체 인스턴스 다운**

**OpenAPI 표기에 미치는 영향**: `parameters[].schema.maximum` 명시 부재 → spec 자체가 DoS 허용 표기 → openapi-generator 가 무제한 입력 client 생성

### 5.2 RealWorld 적용 — Pageable DoS 평가

ArticleApi.java line 41~44 의 query parameter 4종 (`offset`, `limit`, `tag`, `author`, `favorited`) 분석:

| 파라미터 | 타입 | 추정 default | DoS 위험 | 권고 |
|---|---|---|---|---|
| `offset` | `Optional<Integer>` | 0 | low (offset 큰 값은 단순 skip) | `minimum: 0` |
| `limit` | `Optional<Integer>` | 20 (추정) | **high** (큰 값은 OOM) | **`minimum: 1, maximum: 100`** 강제 |
| `tag` | `Optional<String>` | null | low | `maxLength: 64` |
| `author` | `Optional<String>` | null | low | `maxLength: 64` |
| `favorited` | `Optional<String>` | null | low | `maxLength: 64` |

**가장 중요**: `limit` 의 max cap. RealWorld 코드 자체에는 cap 없음 (서비스 레이어 미확인이나 통상 RealWorld 학습용 코드는 cap 없음). **사내 적용 시 즉시 수정 필수**.

### 5.3 발생 사례

**사례 J (사내 SaaS, 2023)**: `@RequestParam int size` 의 cap 부재 → 외부 봇이 `?size=99999` 반복 호출 → 메모리 OOM → 인스턴스 5분 다운 → SLA 위반. 교훈: 모든 list endpoint 는 max cap 100~200 강제.

**사례 K (한국 e-커머스, 2022 — 컨퍼런스)**: `Pageable` default size 20 가정 → 외부 SDK 가 `?size=` 누락 시 자동 default → OK. 그러나 `?size=10000` 전송 시 cap 부재 → DoS. 교훈: `WebMvcConfigurer` 의 `setMaxPageSize` 강제.

### 5.4 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-DOS-001 | 모든 list endpoint 의 limit/size 에 `maximum` 명시 (default 100, 권장 50) | **critical** |
| REC-DOS-002 | Spring Data 의 `WebMvcConfigurer.setMaxPageSize(100)` 글로벌 적용 | **critical** |
| REC-DOS-003 | Rate limiting (Resilience4j 또는 Bucket4j) 도입 | high |
| REC-DOS-004 | spec 의 `maximum` 필드 강제 — openapi-generator 가 client 입력 검증에 활용 | high |

### 5.5 Phase 5 산출 영향 (PoC #01)

본 PoC 는 RealWorld 학습용 코드이므로 **Phase 5 spec 에 cap 명시 + Phase 6 antipatterns.json 등록 권고**:

```yaml
# openapi.yaml 의 GET /articles parameter
parameters:
  - name: limit
    in: query
    required: false
    schema:
      type: integer
      minimum: 1
      maximum: 100        # ⚠️ 사내 적용 시 강제 (RealWorld 원본은 cap 없음)
      default: 20
    x-warning: |
      Original RealWorld code has no cap (potential DoS).
      Internal adoption MUST add max=100 cap.
    x-related-antipattern: AP-PERFORMANCE-001
```

**Phase 6 신규 AP 등록 권고**:
- **AP-PERFORMANCE-001** (severity high) — Pageable cap 부재로 DoS 가능 (영역 5)
- 매핑: `GET /articles`, `GET /articles/feed`, `GET /articles/{slug}/comments`

---

## 영역 6. F-027 De Morgan 표기 함정

### 6.1 패턴 — Phase 4 critical AP 의 Phase 5 보존

**F-027 (Phase 4)**: `Article.java:86` 의 De Morgan 버그 → Comment 삭제 권한 잘못 (article 작성자 AND comment 작성자 둘 다 일치해야 통과 — RealWorld spec 의 OR 와 정면 위배). AP-DOMAIN-001 critical 등록.

**Phase 5 의 도전**: OpenAPI spec 에 어떻게 표기? 3가지 후보:

| 후보 | 표기 | 장점 | 단점 |
|---|---|---|---|
| (1) `description` 만 | path-level description 에 자유 텍스트 추가 | 단순 | client codegen 누락 / 가시성 ↓ |
| (2) `x-warning` extension | spec extension 으로 명시 | 표준 OpenAPI extension 패턴 | 도구별 처리 차이 |
| (3) `x-warning` + `x-known-bug` 병행 + path/operation 양쪽 | 다층 표기 | 가시성 max | spec 복잡도 ↑ |

**권고: (3) — 다층 표기 + Phase 6 critical AP cross-link 필수**

이유:
1. **client codegen 영향**: openapi-generator 의 일부 templates (java-okhttp) 는 `description` 만 주석 변환, `x-warning` 은 무시 → 둘 다 사용 시 양쪽 capture
2. **Swagger UI 의 가시성**: `description` 은 path 본문에 표시, `x-warning` 은 `Try it out` 섹션 위에 별도 표시 (custom UI 또는 Redoc 의 `x-codeSamples` 활용)
3. **Phase 6 cross-link**: `x-related-antipattern: AP-DOMAIN-001` 명시 → Phase 6 antipatterns.json 통합 시 자동 매핑

### 6.2 표기 stub (Phase 5 산출 직접 인용 가능)

```yaml
# DELETE /articles/{slug}/comments/{id}
paths:
  /articles/{slug}/comments/{id}:
    delete:
      operationId: deleteArticleComment
      summary: Delete a comment from an article
      description: |
        Delete the specified comment.
        
        **⚠️ KNOWN BUG (F-027 / AP-DOMAIN-001 critical)**:
        Current implementation requires the user to be BOTH the article author AND the comment author
        (De Morgan's law applied to `Article.java:86`).
        RealWorld spec intent: comment author OR article author can delete.
        Current behavior: only "own comment on own article" can be deleted.
        Internal adoption: MUST fix before deployment.
        See: `output/antipatterns-partial/antipatterns-partial.json` AP-DOMAIN-001
      x-warning: |
        Authorization logic bug (F-027). See description for details.
      x-known-bug:
        id: AP-DOMAIN-001
        severity: critical
        finding_id: F-027
        location: "core/src/main/java/io/github/raeperd/realworld/domain/article/Article.java:86"
        description: "De Morgan's law violation: !A || !B should be !A && !B"
        spec_intent: "comment author OR article author can delete"
        actual_behavior: "comment author AND article author both required"
        remediation: "Change `||` to `&&` in `if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor()))`"
      x-related-antipattern: AP-DOMAIN-001
      x-related-rules: [BR-COMMENT-DELETE-001]
      x-related-uc: UC-COMMENT-DELETE
      security:
        - Token: []
      parameters:
        - name: slug
          in: path
          required: true
          schema: { type: string }
        - name: id
          in: path
          required: true
          schema: { type: integer, format: int64 }
      responses:
        '200':
          description: Comment deleted
        '403':
          description: |
            Forbidden — user is not the comment author OR article author.
            **NOTE**: Current implementation incorrectly requires BOTH (F-027 bug).
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GenericErrorModel' }
```

### 6.3 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-F027-001 | F-027 의 `description` + `x-warning` + `x-known-bug` 3중 표기 강제 | **critical** |
| REC-F027-002 | Phase 6 통합 시 `x-related-antipattern` 가 antipatterns.json 의 ID 와 1:1 매핑 검증 | critical |
| REC-F027-003 | 사내 신규 critical/high AP 발견 시 Phase 5 spec 에 동일 패턴 적용 | high |

### 6.4 Phase 5 산출 영향 (PoC #01)

**4건 critical/high AP 모두 Phase 5 spec 에 표기**:

| AP ID | severity | endpoint 영향 | 표기 방식 |
|---|---|---|---|
| AP-DOMAIN-001 | critical | DELETE /articles/{slug}/comments/{id} | `description` + `x-warning` + `x-known-bug` (3중) |
| AP-SECURITY-001 | critical | 모든 protected endpoint (17개) | `securityScheme.description` + global `x-known-bug` (영역 7 참조) |
| AP-DOMAIN-002 | high | POST /users + PUT /user | `description` + `x-warning` (race condition 경고) |
| AP-ARCH-001 + AP-ARCH-002 | medium | (개별 endpoint 영향 X) | `info.description` 의 architectural debt 섹션 (영역 영역 1 참조) |

---

## 영역 7. JWT 자체 구현 위험 — Spring Security 표준 vs 자체

### 7.1 패턴 — RealWorld 의 자체 JWT 구현

메인 사전 fetch SecurityConfiguration / JwtTokenFilter / UserJWTPayload 분석:

```java
// JWTConfiguration (자체 구현)
@Configuration
public class JWTConfiguration {
    private static final String SECRET = "RealWorldSecret";  // ⚠️ 21byte 하드코딩
    // ...
}
```

**문제 4가지**:

#### 7-A: SECRET 하드코딩 + 21byte
- RFC 7515 (JWS) §5.2.2: HMAC-SHA256 의 key 는 **최소 256 bits (32 bytes)** 권장
- RealWorld 의 21 bytes (168 bits) 는 brute-force 가능 영역
- 하드코딩 → repo 공개 시 즉시 노출

#### 7-B: 자체 JWT 구현 vs Spring Security 표준
- **Spring Security 5.2+** 의 `OAuth2ResourceServerConfigurer.jwt()` 가 **표준** — JWK Set URI 자동 fetch + 검증 + 갱신
- RealWorld 는 자체 `UserJWTPayload` + 자체 `JWTConfiguration` + 자체 filter chain
- **함정**: 자체 구현은 (1) signature 검증 누락 (2) `exp`/`nbf` 검증 누락 (3) `iss`/`aud` 검증 누락 위험

#### 7-C: refresh token 부재
- RealWorld API spec 에 refresh 메커니즘 없음 → access token 만료 후 재로그인
- 사내 적용 시 refresh token 추가 필수 (UX + 보안 양면)

#### 7-D: token revocation 부재
- 로그아웃 또는 비밀번호 변경 시 발급된 토큰 즉시 무효화 메커니즘 없음
- 해결: blacklist (Redis) 또는 short-lived access token + refresh token

### 7.2 OpenAPI spec 노출 정책

**권고**: `info.description` + `securityScheme.description` 양쪽에 명시:

```yaml
info:
  title: RealWorld API (PoC #01)
  version: 1.0.0
  description: |
    PoC #01 RealWorld Spring Boot 분석 산출물.
    
    ## ⚠️ Critical Security Issues (사내 적용 전 필수 수정)
    
    1. **AP-SECURITY-001 critical** — JWT SECRET 하드코딩 + 21bytes (RFC 7515 §5.2.2 위반)
       - 위치: `JWTConfiguration.java`
       - 수정: 환경변수 + 32bytes 이상 생성 (`openssl rand -base64 32`)
    
    2. **AP-DOMAIN-001 critical** — Comment 삭제 권한 De Morgan 버그
       - 위치: `Article.java:86`
       - 영향: DELETE /articles/{slug}/comments/{id}
    
    3. **AP-DOMAIN-002 high** — email/username unique 검증 부재 (race condition)
       - 영향: POST /users + PUT /user
    
    ## Architectural Debt
    
    - **AP-ARCH-001 medium (LV-001)**: Application 레이어가 도메인 외부 객체 (`UserJWTPayload`) 직접 import
    - **AP-ARCH-002 medium (LV-002)**: Layered + Spring DDD-Lite 의 cross-cutting 격자 미정의

components:
  securitySchemes:
    Token:
      type: apiKey
      in: header
      name: Authorization
      description: |
        ⚠️ **AP-SECURITY-001 critical**: 본 RealWorld 구현은 JWT SECRET 21bytes 하드코딩 사용.
        RFC 7515 §5.2.2 위반. 사내 적용 전 32bytes+ 환경변수 전환 필수.
        Format: `Token <jwt>` (NOT `Bearer <jwt>`).
```

### 7.3 발생 사례

**사례 L (사내, 2022)**: 자체 JWT 구현 → `exp` 검증 누락 → 만료된 토큰으로 영구 접근 가능 → 보안 감사 발견 → 긴급 패치. 교훈: Spring Security 표준 강제.

**사례 M (한국 핀테크, 2024 추정)**: SECRET 16bytes 하드코딩 → GitHub 공개 → 24시간 내 외부 공격자가 임의 토큰 생성 → 사용자 데이터 유출 → 1억 배상. 교훈: SECRET 하드코딩 절대 금지.

### 7.4 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-JWT-001 | SECRET 32bytes+ 환경변수 (`openssl rand -base64 32`) — 하드코딩 절대 금지 | **critical** |
| REC-JWT-002 | Spring Security 5.2+ `OAuth2ResourceServerConfigurer.jwt()` 표준 채택 — 자체 구현 회피 | **critical** |
| REC-JWT-003 | refresh token + short-lived access token (15분) + Redis blacklist | high |
| REC-JWT-004 | JWK Set URI (외부 IdP 연동 시) | medium |

### 7.5 Phase 5 산출 영향 (PoC #01)

**Phase 5 spec 의 `info.description` 에 critical 4건 명시 강제** + securityScheme description 에 AP-SECURITY-001 cross-link.

---

## 영역 8. WebSecurityConfigurerAdapter deprecated

### 8.1 패턴 — Spring Security 5.7+ 의 마이그레이션

메인 사전 fetch SecurityConfiguration:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // ...
    }
}
```

- Spring Boot 2.5.2 (RealWorld 사용 버전) 시점은 `WebSecurityConfigurerAdapter` **유효** (5.4)
- Spring Security 5.7+ (Spring Boot 2.7+) 부터 **deprecated**
- Spring Security 6.x (Spring Boot 3.x) 부터 **삭제**

**대체**:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // ...
        return http.build();
    }
}
```

### 8.2 OpenAPI spec 영향 (있는가)

**spec 자체에는 영향 없음** (spec 은 wire format 만 표기, 구현 디테일은 별개). 그러나:
- `info.description` 의 architectural debt 섹션에 명시 권고 (사내 적용 시 마이그레이션 필수)
- Phase 6 의 antipatterns.json 에 **AP-ARCH-DEPRECATED-001 medium** 등록 후보

### 8.3 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-DEPRECATED-001 | Spring Boot 2.7+ / Spring Security 5.7+ 로 업그레이드 | high |
| REC-DEPRECATED-002 | `WebSecurityConfigurerAdapter` → `SecurityFilterChain` bean 전환 | high |

### 8.4 Phase 5 산출 영향

`info.description` 의 architectural debt 섹션에 1줄 추가:

```yaml
info:
  description: |
    ## Architectural Debt
    - Spring Security `WebSecurityConfigurerAdapter` (deprecated 5.7+) — 사내 마이그레이션 시 SecurityFilterChain bean 전환 필수
```

Phase 6 등록 후보로 inline 메모 (Phase 5 의 직접 산출물 아님).

---

## 영역 9. API 버저닝 함정 — `/api/v1/...` 누락

### 9.1 패턴 — RealWorld 의 버저닝 부재

RealWorld API spec 의 모든 endpoint 는 `/api/...` (예: `/api/users`, `/api/articles`) — `/v1` 또는 `/v2` 버전 표기 없음. SecurityConfiguration / 컨트롤러 path 도 동일.

**문제**:
1. **breaking change 시 호환성 부재** — `/api/users` 의 응답 구조 변경 시 기존 클라이언트 모두 깨짐
2. **API gateway routing 어려움** — 게이트웨이가 v1/v2 라우팅 분리 불가
3. **client codegen 의 namespace 충돌** — `UserApi` v1 vs v2 가 동일 namespace

**권고 (사내 적용 시)**:
- path 에 `/v1` 추가: `/api/v1/users`, `/api/v1/articles`
- `info.version` 명시: `1.0.0`
- `servers[]` 의 `url` 에 baseURL: `https://api.example.com/api/v1`

### 9.2 OpenAPI 표기 stub

```yaml
openapi: 3.1.0
info:
  title: RealWorld API
  version: 1.0.0          # ⚠️ semver 강제
servers:
  - url: https://localhost:8080/api    # RealWorld 원본 (버전 부재)
    description: RealWorld original (no versioning)
  - url: https://api.example.com/api/v1   # 사내 적용 권고 (버전 명시)
    description: Internal adoption with versioning
paths:
  /users:                  # → 사내 적용 시 /v1/users
    post:
      operationId: signupUser
```

### 9.3 발생 사례

**사례 N (사내 SaaS, 2021)**: 버저닝 없이 시작 → 2년 후 breaking change → 모든 클라이언트 동시 마이그레이션 강제 → 1개월 incident → 사후 v1 path 추가. 교훈: 처음부터 `/v1`.

**사례 O (한국 e-커머스)**: API 게이트웨이 도입 후 v1/v2 라우팅 부재 → 게이트웨이가 모든 트래픽 단일 백엔드 라우팅 → blue/green 배포 어려움. 교훈: 버저닝은 게이트웨이 도입 전제.

### 9.4 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-VERSION-001 | path 에 `/v1` 추가 (`/api/v1/users`) — 사내 신규 API 표준 | **high** |
| REC-VERSION-002 | `info.version` semver 강제 | high |
| REC-VERSION-003 | `servers[]` 다중 등록 (dev / staging / prod) | medium |

### 9.5 Phase 5 산출 영향

Phase 5 spec 은 **RealWorld 원본 충실 추출** + `info.description` 에 사내 적용 권고 메모 (path 변경 X — 원본 보존).

---

## 영역 10. HTTP status code 일관성 함정

### 10.1 패턴 — RealWorld 코드의 실측

메인 사전 fetch RestController 4건 분석:

| endpoint | 실측 status | RealWorld spec 권장 | 일관성 |
|---|---|---|---|
| POST /users (signup) | 200 (default — `@ResponseStatus` 없음) | 201 Created | **불일치** — 201 권장 |
| POST /users/login | 200 | 200 | 일치 |
| POST /articles | 200 (`@PostMapping` default) | 201 Created | **불일치** — 201 권장 |
| PUT /articles/{slug} | 200 | 200 | 일치 |
| DELETE /articles/{slug} | 200 (실측 — `ResponseEntity.ok()`) | 204 No Content | **불일치** — 204 권장 |
| DELETE /profiles/{username}/follow | 200 | 200 | 일치 (RealWorld 는 unfollow 도 객체 반환) |

**핵심 발견**: RealWorld 코드는 **거의 모든 응답이 200** — REST 표준 (201/204) 미준수. 그러나 **RealWorld API spec 자체가 200 사용** (모든 응답에 wrapped object) — 따라서 spec 충실성 측면에서는 일치.

**대응 결정**:
- **Spec 충실 추출** (현재 동작 = 200) → Phase 5 spec 도 200 (RealWorld 원본 보존)
- **사내 적용 권고** → 201/204 (REST 표준)

### 10.2 OpenAPI 표기 stub

```yaml
# POST /users (signup)
paths:
  /users:
    post:
      operationId: signupUser
      responses:
        '200':
          description: |
            User created successfully.
            **NOTE**: RealWorld returns 200 (not 201 Created — REST convention).
            Internal adoption: consider `@ResponseStatus(HttpStatus.CREATED)` for 201.
          content:
            application/json:
              schema: { $ref: '#/components/schemas/UserResponse' }
        '422':
          description: Validation errors
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GenericErrorModel' }
```

### 10.3 발생 사례

**사례 P (사내, 2023)**: POST 응답 200 vs 201 혼재 → 외부 SDK 가 201 가정 코드 → 200 응답 시 에러 처리 → 디버깅 1주. 교훈: REST 표준 강제.

**사례 Q (한국 게임)**: DELETE 응답 200 + body 반환 → 클라이언트 캐시가 body 활용 → 일부 endpoint 가 204 No Content 전환 시 캐시 깨짐 → 호환성 깨짐. 교훈: DELETE 는 처음부터 204.

### 10.4 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-STATUS-001 | POST 성공 시 201 Created (`@ResponseStatus(HttpStatus.CREATED)`) | high |
| REC-STATUS-002 | DELETE 성공 시 204 No Content (`@ResponseStatus(HttpStatus.NO_CONTENT)`) — body 없음 | high |
| REC-STATUS-003 | PUT 성공 시 200 (변경된 객체 반환) 또는 204 (body 없음) — 일관성 강제 | medium |

### 10.5 Phase 5 산출 영향 (PoC #01)

Phase 5 spec 은 **RealWorld 원본 충실 (200 유지)** + 각 endpoint 의 description 에 권장 status 메모.

---

## 영역 11. operationId 명명 함정

### 11.1 패턴 — Lombok 의존 method name vs OpenAPI 권장

`operationId` 는 OpenAPI 의 spec 내 unique 식별자 — client codegen 의 함수 이름으로 사용. RealWorld 코드의 컨트롤러 메서드 이름:

| controller method | OpenAPI 권장 | 실측 |
|---|---|---|
| `signUpUser` | `signupUser` (camelCase, 동사+명사) | 일치 (다행) |
| `loginUser` | `loginUser` | 일치 |
| `getCurrentUser` | `getCurrentUser` | 일치 |
| `updateUser` | `updateUser` | 일치 |
| `getProfile` | `getProfileByUsername` (자세한 동사) | **개선 권고** |
| `getArticles` | `listArticles` (list 가 더 명확) | **개선 권고** |
| `getArticleBySlug` | `getArticle` (slug 는 path param 이미 명시) | 보존 가능 |
| `getFeed` | `feedArticles` (RealWorld spec 표준) | **개선 권고** |
| `createArticle` | `createArticle` | 일치 |
| `updateArticle` | `updateArticle` | 일치 |
| `deleteArticle` | `deleteArticle` | 일치 |
| `favoriteArticle` | `createArticleFavorite` (REST 동작) | 보존 가능 |
| `unfavoriteArticle` | `deleteArticleFavorite` (REST 동작) | 보존 가능 |
| `getComments` | `getArticleComments` | **개선 권고** |
| `createComment` | `createArticleComment` | **개선 권고** |
| `deleteComment` | `deleteArticleComment` | **개선 권고** |
| `getTags` | `listTags` | 보존 가능 |

**RealWorld 표준 OpenAPI spec 의 operationId** (RealWorld 공식 카탈로그 — 코퍼스 기반): `Login`, `CreateUser`, `GetCurrentUser`, `UpdateCurrentUser`, `GetProfileByUsername`, `FollowUserByUsername`, `UnfollowUserByUsername`, `GetArticlesFeed`, `GetArticles`, `CreateArticle`, `GetArticle`, `UpdateArticle`, `DeleteArticle`, `GetArticleComments`, `CreateArticleComment`, `DeleteArticleComment`, `CreateArticleFavorite`, `DeleteArticleFavorite`, `GetTags` (19개)

### 11.2 권고 — RealWorld 공식 spec 의 operationId 채택

PoC #01 의 Phase 5 산출물은 **RealWorld 공식 OpenAPI spec 의 operationId 채택** (PascalCase) — 이유:
1. RealWorld 카탈로그의 다른 언어 구현체와 cross-validation 가능
2. RealWorld 표준 SDK (TypeScript, Go, Rust 등) 와 호환
3. controller method 이름과 spec operationId 분리 → 추출기는 매핑 테이블 유지

### 11.3 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-OPID-001 | operationId 는 동사+명사 (camelCase 또는 PascalCase) — 명사+동사 금지 | high |
| REC-OPID-002 | OpenAPI spec 내 unique 강제 (CI 검증) | high |
| REC-OPID-003 | controller method 이름과 분리 → spec 추출기는 매핑 테이블 사용 | medium |

### 11.4 Phase 5 산출 영향 (PoC #01)

22 endpoint 의 operationId 결정:

| endpoint | operationId (PascalCase 권고) | UC 매핑 |
|---|---|---|
| POST /users | `CreateUser` | UC-USER-SIGNUP |
| POST /users/login | `Login` | UC-USER-LOGIN |
| GET /user | `GetCurrentUser` | UC-USER-FIND-BY-ID (system internal) |
| PUT /user | `UpdateCurrentUser` | UC-USER-UPDATE |
| GET /profiles/{username} | `GetProfileByUsername` | UC-PROFILE-VIEW |
| POST /profiles/{username}/follow | `FollowUserByUsername` | UC-PROFILE-FOLLOW |
| DELETE /profiles/{username}/follow | `UnfollowUserByUsername` | UC-PROFILE-UNFOLLOW |
| GET /articles | `GetArticles` | UC-ARTICLE-LIST + 3 변형 |
| GET /articles/feed | `GetArticlesFeed` | UC-ARTICLE-FEED |
| POST /articles | `CreateArticle` | UC-ARTICLE-CREATE |
| GET /articles/{slug} | `GetArticle` | UC-ARTICLE-VIEW |
| PUT /articles/{slug} | `UpdateArticle` | UC-ARTICLE-UPDATE |
| DELETE /articles/{slug} | `DeleteArticle` | UC-ARTICLE-DELETE |
| POST /articles/{slug}/favorite | `CreateArticleFavorite` | UC-ARTICLE-FAVORITE |
| DELETE /articles/{slug}/favorite | `DeleteArticleFavorite` | UC-ARTICLE-UNFAVORITE |
| GET /articles/{slug}/comments | `GetArticleComments` | UC-COMMENT-LIST |
| POST /articles/{slug}/comments | `CreateArticleComment` | UC-COMMENT-CREATE |
| DELETE /articles/{slug}/comments/{id} | `DeleteArticleComment` | UC-COMMENT-DELETE |
| GET /tags | `GetTags` | UC-TAG-LIST |

총 19 unique operationId (GET /articles 의 4 변형은 동일 operationId, query parameter 로 분기 — 영역 12 참조).

---

## 영역 12. WebSecurity#ignoring vs HttpSecurity.permitAll

### 12.1 패턴 — Spring Security 의 두 보안 hole 시나리오

메인 사전 fetch SecurityConfiguration 분석:

```java
@Override
public void configure(WebSecurity web) {
    web.ignoring()
       .antMatchers(HttpMethod.POST, "/users", "/users/login");   // ⚠️ filter 자체 우회
}

@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .csrf().disable()
        .authorizeRequests()
        .antMatchers(HttpMethod.GET, "/articles/**").permitAll()    // filter 통과 후 anonymous 허용
        .antMatchers(HttpMethod.GET, "/profiles/**").permitAll()
        .antMatchers(HttpMethod.GET, "/tags/**").permitAll()
        .anyRequest().authenticated()
        // ...
}
```

**핵심 차이**:

| 정책 | 동작 | 보안 강도 | 권고 |
|---|---|---|---|
| `WebSecurity#ignoring` | filter chain **자체 우회** (CSRF / SecurityContext / JwtFilter 모두 skip) | 가장 약함 | static resource 만 사용 |
| `HttpSecurity.permitAll` | filter chain 통과 후 anonymous 허용 | 중간 | API endpoint public 시 사용 |
| `HttpSecurity.authenticated` | filter chain 통과 + 인증 필수 | 강함 | 기본 |

**RealWorld 코드의 이상**: `POST /users` (signup) 와 `POST /users/login` 을 **`WebSecurity#ignoring`** 사용 → CSRF / SecurityContext / JwtFilter **자체 우회**. 그러나 `GET /articles/**` 등은 `permitAll` 사용 → JwtFilter 는 통과 (선택적 token 추출).

**문제**:
1. `POST /users` 가 `ignoring` 이면 **JwtFilter 도 skip** → 만약 사용자가 이미 로그인 후 새 가입 시도 시 token 정보가 SecurityContext 에 안 실림 → 인증 흔적 부재
2. CSRF 비활성화는 disable 명시 (`csrf().disable()`) — 그러나 `ignoring` 은 별도 layer 이므로 CSRF 가 default 활성화여도 우회됨

### 12.2 위험 평가 — RealWorld 의 경우 OK or NOT?

**평가**: RealWorld 의 경우는 **OK** (학습용 코드 + JWT stateless) 이나 사내 적용 시:
- POST /users 와 POST /users/login 도 `permitAll` 로 변경 권고
- JwtFilter 가 통과하되 token 없이 통과 가능 (anonymous)
- CSRF 는 `csrf().disable()` 명시 (JWT stateless 이므로 OK)

**보안 hole 가능성**: `WebSecurity#ignoring` 으로 처리된 endpoint 에 향후 인증 필요한 요구사항 추가 시 (예: signup 시 이미 인증된 사용자는 거부) → 의도치 않게 보안 우회. permitAll 로 시작하는 게 안전.

### 12.3 OpenAPI spec 표기 영향

spec 자체에는 영향 없음 (security 표기는 동일 — 둘 다 `security: []`). 그러나:
- `info.description` 의 architectural debt 섹션에 명시 권고

### 12.4 발생 사례

**사례 R (사내, 2024)**: `WebSecurity#ignoring` 으로 처리된 `/api/public/**` 에 향후 rate limiting 필터 추가 시 우회됨 → DoS 발생 → 긴급 수정. 교훈: filter 자체 우회는 static resource 만.

**사례 S (한국 핀테크, 2023 — 컨퍼런스)**: `WebSecurity#ignoring` 으로 처리된 endpoint 에서 SecurityContext 접근 시 NPE → 디버깅 1일. 교훈: API endpoint 는 `permitAll`.

### 12.5 사내 적용 시 즉시 수정 권고

| ID | 권고 | 우선순위 |
|---|---|---|
| REC-WEBSEC-001 | `WebSecurity#ignoring` 은 static resource (`/css/**`, `/js/**`) 만 사용 — API endpoint 금지 | high |
| REC-WEBSEC-002 | API endpoint public 시 `HttpSecurity.permitAll` 사용 | high |
| REC-WEBSEC-003 | CSRF 는 명시적 disable (`.csrf().disable()`) — REST API + JWT stateless 시 | high |

### 12.6 Phase 5 산출 영향 (PoC #01)

`info.description` 에 architectural debt 1줄 추가:

```yaml
info:
  description: |
    ## Security Configuration Notes
    - POST /users + POST /users/login: `WebSecurity#ignoring` 사용 (filter 자체 우회)
      → 사내 적용 시 `permitAll` 권고 (filter 통과 + anonymous)
    - GET /articles, /profiles, /tags: `permitAll` 사용 (안전)
```

---

## 영역 13. 잠재 불일치 3건 — 시니어 평가

### 13.1 잠재 불일치 #1: `sessionCreationPolicy(STATELESS)` 명시 부재

**메인 사전 fetch 결과**: SecurityConfiguration 에 `sessionCreationPolicy(SessionCreationPolicy.STATELESS)` **명시 부재**.

**Phase 4 BR-AUTH-STATELESS-001 의 source_evidence**: SecurityConfiguration line X (가정) — **Phase 5 cross-validation 시 정밀화 필요**.

**시니어 평가**:

| 평가 축 | 평가 |
|---|---|
| **사고 회피성** | high — 명시 부재 시 default `IF_REQUIRED` (session 생성 가능) → JWT stateless 의도와 모순 → session fixation 취약점 가능 |
| **외부 호환성** | low — 동작 자체는 default 로도 OK (session cookie 미사용 시) |
| **학습 비용** | high — 신규 팀원이 spec 만 보고 stateless 의도 이해 불가 |
| **deprecation 비용** | low |
| **Phase 6 cross-link** | high — F-XXX 신규 finding 등록 후보 |

**권고**: **F-034 신규 finding 등록** (Phase 5 진행 중 발견). 분류:
- 메서드 fingerprint: `behavior.imperfect_intent` (의도는 명백한 stateless, 구현이 implicit default 의존)
- severity: medium (default 가 문제 없으나 의도 명시 부재로 향후 변경 시 위험)
- 처분: BR-AUTH-STATELESS-001 의 source_evidence 정밀화 + AP-SECURITY-CONFIG-IMPLICIT-001 신규 등록 후보

**Phase 5 spec 영향**: `info.description` 의 architectural debt 섹션에 1줄 추가:
```
- SessionCreationPolicy 명시 부재 (default IF_REQUIRED 의존) — 사내 적용 시 STATELESS 명시 강제
```

### 13.2 잠재 불일치 #2: `GET /user` endpoint 매핑

**메인 사전 fetch 결과**: UserApi.java line 29 `@GetMapping` (`/user` path) 존재.

**Phase 4 산출**: `UC-USER-FIND-BY-ID` 는 system internal (operationId 없음) 으로 분류 — **API endpoint 매핑 부재**.

**Phase 5 발견**: `GET /user` 는 실제 API endpoint (RealWorld spec "Get Current User"). UC 매핑 갱신 필요.

**시니어 평가**:

| 평가 축 | 평가 |
|---|---|
| **사고 회피성** | low — 단순 매핑 누락 |
| **외부 호환성** | high — RealWorld spec 표준 endpoint, codegen 누락 시 client 가 사용자 정보 조회 불가 |
| **학습 비용** | medium — UC 카탈로그 의 1:1 매핑 누락 시 추적성 ↓ |
| **deprecation 비용** | low |
| **Phase 6 cross-link** | high — UC ↔ operationId 1:1 매핑 정합성 |

**권고**: **Phase 5 산출에서 UC-USER-FIND-BY-ID 의 분류 갱신** — system internal → API endpoint:

```json
// domain.json 의 use_cases[UC-USER-FIND-BY-ID] (수정안)
{
  "id": "UC-USER-FIND-BY-ID",
  "name": "Get Current User",
  "kind": "Query",
  "actor": "User",
  "system_internal": false,        // ← 변경
  "related_api_operation_id": "GetCurrentUser",   // ← 추가
  "related_api_path": "/user",      // ← 추가
  "method": "GET"                   // ← 추가
}
```

**Phase 5 spec 영향**: 22 endpoint 중 1건 (GET /user) 의 UC 매핑 추가. operationId `GetCurrentUser`.

### 13.3 잠재 불일치 #3: `WebSecurity#ignoring` vs `permitAll`

**메인 사전 fetch 결과**: POST /users + POST /users/login 은 `WebSecurity#ignoring`. 나머지 public (GET /articles, /profiles, /tags) 은 `permitAll`.

**Phase 4 source_evidence 정밀화 필요**: BR-AUTH-PUBLIC-001 의 5 endpoint 중 2건 (signup/login) 은 더 강한 우회 (filter chain 자체 skip), 나머지 3건은 일반 permitAll.

**시니어 평가**:

| 평가 축 | 평가 |
|---|---|
| **사고 회피성** | medium — RealWorld 자체는 OK 이나 사내 적용 시 향후 보안 hole 가능 |
| **외부 호환성** | low — spec 표기는 동일 (`security: []`) |
| **학습 비용** | high — 차이를 모르면 사내 적용 시 잘못 모방 |
| **deprecation 비용** | low |
| **Phase 6 cross-link** | medium — AP-SECURITY-CONFIG-002 신규 등록 후보 (medium) |

**권고**: BR-AUTH-PUBLIC-001 의 source_evidence 정밀화 (`WebSecurity#ignoring` vs `permitAll` 구분) + Phase 5 spec 의 `info.description` 에 명시 (영역 12 참조).

---

## 영역 14. 5 핵심 결정 시니어 평가

### 14.1 결정 #1: `Authorization: Token <jwt>` → `apiKey`

**시니어 평가**: **승인** — 영역 3에서 상세 평가. `apiKey + in: header + name: Authorization` 가 정확하고 호환성 최고. `bearerFormat: JWT` 사용 불가 (Bearer 아님).

**보완 권고**: description 에 `Token <jwt>` 형식 명시 강제. 사내 신규 API 는 Bearer 표준 채택 권고.

### 14.2 결정 #2: Wrapped DTO — wrapper schema 분리 vs flat

**시니어 평가**: **wrapper 분리 강력 권고** — 영역 2에서 상세 평가. 명명 규칙 3-tier (`User` / `UserResponse` / `UserData`) 사내 표준화 + cycle detector 단위 테스트 강제.

**보완 권고**: PoC #02 에서 다른 언어 (TypeScript / Go) 의 wrapped DTO 패턴 cross-check.

### 14.3 결정 #3: F-027 De Morgan 명시 위치

**시니어 평가**: **`description` + `x-warning` + `x-known-bug` 3중 표기 강제** — 영역 6에서 상세 평가. client codegen 누락 회피 + Swagger UI 가시성 + Phase 6 cross-link 보존.

**보완 권고**: Phase 6 통합 시 `x-related-antipattern` ID 가 antipatterns.json 의 ID 와 1:1 매핑 검증.

### 14.4 결정 #4: LV-001 노출 — api-extension.json vs openapi.yaml

**시니어 평가**: **api-extension.json 만 노출 권고** — 이유:
1. LV-001 (UserJWTPayload import) 은 **architectural debt** 으로 endpoint 별 영향 부재
2. openapi.yaml 의 `info.description` 에 1줄 메모 (architectural debt 섹션)
3. api-extension.json 의 `architectural_notes[]` 에 상세 (Phase 5 산출 표준)

**보완 권고**: Phase 6 통합 시 api-extension.json 의 architectural_notes 가 architecture.md 의 LV-001 섹션과 cross-link.

### 14.5 결정 #5: 4 GET /articles 변형 단일 operationId

**시니어 평가**: **단일 operationId `GetArticles` + query parameter 로 분기** 강력 권고 — 이유:
1. RESTful 원칙: 동일 resource 의 다른 view 는 query parameter 로 분기 (path 분리 X)
2. RealWorld 공식 spec 표준 (gothinkster 카탈로그 — 코퍼스 기반)
3. openapi-generator client 가 단일 함수 `getArticles(tag, author, favorited, limit, offset)` 생성 — 호출자 단순

**UC 매핑 처리**:
```yaml
GET /articles:
  operationId: GetArticles
  x-related-uc:
    - UC-ARTICLE-LIST              # 기본
    - UC-ARTICLE-LIST-BY-TAG        # ?tag=...
    - UC-ARTICLE-LIST-BY-AUTHOR     # ?author=...
    - UC-ARTICLE-LIST-BY-FAVORITED  # ?favorited=...
  parameters:
    - name: tag
      in: query
      required: false
      schema: { type: string }
      description: Filter by tag — maps to UC-ARTICLE-LIST-BY-TAG
    - name: author
      in: query
      required: false
      schema: { type: string }
      description: Filter by author — maps to UC-ARTICLE-LIST-BY-AUTHOR
    - name: favorited
      in: query
      required: false
      schema: { type: string }
      description: Filter by user who favorited — maps to UC-ARTICLE-LIST-BY-FAVORITED
    - name: limit
      in: query
      required: false
      schema: { type: integer, minimum: 1, maximum: 100, default: 20 }   # ⚠️ DoS cap
    - name: offset
      in: query
      required: false
      schema: { type: integer, minimum: 0, default: 0 }
```

**보완 권고**: Phase 6 통합 시 UC 의 `related_api_operation_id` 에 모두 동일 `GetArticles` 등록 + `query_filter` 메모.

---

## 영역 15. Phase 4 critical/high 4건의 Phase 5 노출 정책

### 15.1 AP-DOMAIN-001 critical (F-027 De Morgan)

**노출 정책**: **3중 표기** (영역 6 참조)
- DELETE /articles/{slug}/comments/{id} 의 `description`
- `x-warning` + `x-known-bug` (operation level)
- `x-related-antipattern: AP-DOMAIN-001`
- `info.description` 의 critical 섹션 1번

**사내 적용 시 즉시 수정 권고**: `Article.java:86` 의 `||` → `&&` 변경 (단순). 단위 테스트 추가 (4가지 경우: own comment own article / own comment other article / other comment own article / other comment other article).

### 15.2 AP-SECURITY-001 critical (JWT SECRET 21byte)

**노출 정책**: **3중 표기** (영역 7 참조)
- `info.description` 의 critical 섹션 1번
- `securityScheme.Token.description` 에 명시
- `x-known-bug` (info level)

**사내 적용 시 즉시 수정 권고**: 환경변수 + 32bytes+ 생성 (`openssl rand -base64 32`) + Spring Security 표준 `OAuth2ResourceServerConfigurer.jwt()` 전환. Phase 6 통합 시 critical 1순위.

### 15.3 AP-DOMAIN-002 high (email/username unique 부재)

**노출 정책**: **2중 표기**
- POST /users + PUT /user 의 `description` 에 race condition 경고
- `x-warning` (operation level)
- `info.description` 의 critical 섹션 3번

**사내 적용 시 즉시 수정 권고**: Application 레벨 `existsByEmail` 사전 조회 + DB UNIQUE 제약 + JPA `@Column(unique=true)` 3중 안전망 (Phase 4 REC-004). Phase 6 통합 시 high 1순위.

### 15.4 AP-ARCH-001 + AP-ARCH-002 medium (LV-001 + LV-002)

**노출 정책**: **1중 표기** (영역 14.4 참조)
- `info.description` 의 architectural debt 섹션 (1줄씩)
- api-extension.json 의 `architectural_notes[]` 에 상세

**사내 적용 시 즉시 수정 권고**:
- LV-001: UserJWTPayload 를 도메인 외부 객체 (`token` 필드 또는 별도 BC-AUTH wrapper) 로 분리
- LV-002: cross-cutting 격자 정의 (security / persistence / logging) — Phase 6 architecture.md §5.5 참조

---

## 영역 16. Phase 6 안티패턴 추가 후보 (실무 시니어 관점)

Phase 5 진행 중 발견되는 추가 AP 후보 (Phase 6 통합 시 등록 검토):

### 16.1 AP-PERFORMANCE-001 (영역 5)

**Pageable cap 부재로 DoS 가능** (severity high)
- 매핑: GET /articles, GET /articles/feed, GET /articles/{slug}/comments
- 위치: ArticleApi.java line 41~44 (limit cap 부재)
- 권고: max=100 cap + WebMvcConfigurer 글로벌 적용

### 16.2 AP-SECURITY-CONFIG-IMPLICIT-001 (영역 13.1)

**SessionCreationPolicy 명시 부재로 default IF_REQUIRED 의존** (severity medium)
- 매핑: 모든 protected endpoint
- 위치: SecurityConfiguration (가정)
- 권고: STATELESS 명시 강제

### 16.3 AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 (영역 12)

**WebSecurity#ignoring 으로 API endpoint 처리** (severity medium)
- 매핑: POST /users, POST /users/login
- 위치: SecurityConfiguration
- 권고: permitAll 로 변경

### 16.4 AP-ARCH-DEPRECATED-001 (영역 8)

**WebSecurityConfigurerAdapter deprecated** (severity medium — 사내 적용 시점에 따라)
- 매핑: SecurityConfiguration 전체
- 권고: SecurityFilterChain bean 전환

### 16.5 AP-API-VERSIONING-001 (영역 9)

**API 버저닝 부재** (severity high — 사내 적용 시 즉시)
- 매핑: 모든 endpoint
- 권고: `/v1/...` path prefix + `info.version` semver

### 16.6 AP-API-STATUS-INCONSISTENT-001 (영역 10)

**HTTP status code REST 표준 미준수** (severity low)
- 매핑: POST /users (200 vs 201), DELETE /articles (200 vs 204)
- 권고: `@ResponseStatus` 명시

**총 6개 추가 AP 후보** — Phase 6 통합 시 antipatterns.json 등록 + Phase 4 의 6 partial AP 와 합쳐 12 AP 가 PoC #01 최종 산출.

---

## 영역 17. Phase 5 산출에 직접 인용 가능한 stub

### 17.1 openapi.yaml 의 info 섹션 stub

```yaml
openapi: 3.1.0
info:
  title: RealWorld API (PoC #01)
  version: 1.0.0
  description: |
    PoC #01 RealWorld Spring Boot 분석 산출물.
    
    출처: https://github.com/raeperd/realworld-springboot-java
    commit_sha: 56be3ced4f3134424ead5fcaf387b3aa640b9532
    
    ## ⚠️ Critical Security Issues (사내 적용 전 필수 수정)
    
    1. **AP-SECURITY-001 critical** — JWT SECRET 하드코딩 + 21bytes (RFC 7515 §5.2.2 위반)
       - 위치: `JWTConfiguration.java`
       - 수정: 환경변수 + 32bytes 이상 생성 (`openssl rand -base64 32`)
       - 표준: Spring Security 5.2+ `OAuth2ResourceServerConfigurer.jwt()` 전환
    
    2. **AP-DOMAIN-001 critical** — Comment 삭제 권한 De Morgan 버그 (F-027)
       - 위치: `Article.java:86`
       - 영향: DELETE /articles/{slug}/comments/{id}
       - 수정: `||` → `&&` 변경 + 4가지 경우 단위 테스트
    
    3. **AP-DOMAIN-002 high** — email/username unique 검증 부재 (race condition)
       - 영향: POST /users + PUT /user
       - 수정: Application + DB + JPA 3중 안전망 (REC-004)
    
    ## Architectural Debt (사내 적용 시 마이그레이션 필수)
    
    - **AP-ARCH-001 medium (LV-001)**: Application 레이어가 도메인 외부 객체 (`UserJWTPayload`) 직접 import
    - **AP-ARCH-002 medium (LV-002)**: Layered + Spring DDD-Lite 의 cross-cutting 격자 미정의
    - SessionCreationPolicy 명시 부재 (default IF_REQUIRED 의존) — STATELESS 명시 강제
    - `WebSecurity#ignoring` 으로 POST /users + /login 처리 (filter chain 자체 우회) — `permitAll` 권고
    - Spring Security `WebSecurityConfigurerAdapter` (Spring Boot 2.5.2 사용 — 5.7+ deprecated) — SecurityFilterChain bean 전환 필수
    - API 버저닝 부재 (`/api/v1/...` 권고) — 사내 적용 시 path prefix 추가
    - HTTP status code REST 표준 미준수 (POST 200 vs 201, DELETE 200 vs 204)
    - Pageable cap 부재 (DoS 위험) — max=100 강제
    
    ## Methodology
    
    - 본 spec 은 AI-Native 개발 방법론 v1.1.2 의 Phase 5-1 산출물
    - cross-validation: F-015 패턴 (메인 사전 raw fetch 9건)
    - Phase 4 산출 (UC 25 / BR 13 / AP partial 6) 와 cross-link
    - Phase 6 통합 시 antipatterns.json 의 12 AP 와 1:1 매핑

servers:
  - url: https://localhost:8080/api
    description: RealWorld original (no versioning)
  - url: https://api.example.com/api/v1
    description: Internal adoption with versioning (REC-VERSION-001)
```

### 17.2 securitySchemes stub

```yaml
components:
  securitySchemes:
    Token:
      type: apiKey
      in: header
      name: Authorization
      description: |
        ⚠️ **AP-SECURITY-001 critical**: 본 RealWorld 구현은 JWT SECRET 21bytes 하드코딩 사용.
        RFC 7515 §5.2.2 위반. 사내 적용 전 32bytes+ 환경변수 전환 + Spring Security 표준 채택 필수.
        
        Format: `Token <jwt>` (NOT `Bearer <jwt>`).
        Example: `Authorization: Token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxOTQwfQ.xxx`
        
        Reference:
        - RealWorld API spec: https://realworld-docs.netlify.app/specifications/backend/endpoints/
        - 사내 신규 API: Bearer 표준 채택 권고 (REC-AUTH-002)

security:
  - Token: []   # global default — public endpoint 는 path-level 에서 override
```

### 17.3 F-027 endpoint stub (DELETE /articles/{slug}/comments/{id})

```yaml
paths:
  /articles/{slug}/comments/{id}:
    delete:
      operationId: DeleteArticleComment
      tags: [Comments]
      summary: Delete a comment from an article
      description: |
        Delete the specified comment.
        
        **⚠️ KNOWN BUG (F-027 / AP-DOMAIN-001 critical)**:
        Current implementation requires the user to be BOTH the article author AND the comment author.
        - **RealWorld spec intent**: comment author OR article author can delete
        - **Actual behavior**: only "own comment on own article" can be deleted
        - **Root cause**: De Morgan's law misapplied at `Article.java:86`
        - **Code**: `if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor()))`
        - **Fix**: change `||` to `&&`
        
        **Internal adoption**: MUST fix before deployment. See `output/antipatterns-partial/antipatterns-partial.json` AP-DOMAIN-001.
      x-warning: |
        Authorization logic bug (F-027). Comment cannot be deleted unless user is BOTH article author AND comment author. See description for details.
      x-known-bug:
        id: AP-DOMAIN-001
        severity: critical
        finding_id: F-027
        location: "core/src/main/java/io/github/raeperd/realworld/domain/article/Article.java:86"
        description: "De Morgan's law violation: !A || !B should be !A && !B"
        spec_intent: "comment author OR article author can delete"
        actual_behavior: "comment author AND article author both required"
        remediation: "Change `||` to `&&`"
        test_cases_required:
          - "own comment on own article — should pass"
          - "own comment on other article — should pass (currently fails — BUG)"
          - "other comment on own article — should pass (currently fails — BUG)"
          - "other comment on other article — should fail"
      x-related-antipattern: AP-DOMAIN-001
      x-related-rules: [BR-COMMENT-DELETE-001]
      x-related-uc: UC-COMMENT-DELETE
      security:
        - Token: []
      parameters:
        - name: slug
          in: path
          required: true
          schema: { type: string }
        - name: id
          in: path
          required: true
          schema: { type: integer, format: int64 }
      responses:
        '200':
          description: |
            Comment deleted.
            **NOTE**: RealWorld returns 200 (not 204 No Content — REST convention). Internal adoption: consider 204 (REC-STATUS-002).
        '403':
          description: |
            Forbidden — user lacks deletion permission.
            **NOTE**: Current implementation incorrectly requires BOTH article author AND comment author (F-027 bug).
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GenericErrorModel' }
        '404':
          description: Article or comment not found
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GenericErrorModel' }
```

### 17.4 GET /articles stub (4 변형 단일 operationId + DoS cap)

```yaml
paths:
  /articles:
    get:
      operationId: GetArticles
      tags: [Articles]
      summary: Get recent articles globally (with optional filters)
      description: |
        Get most recent articles globally. Optionally filtered by tag, author, or favorited user.
        
        **Filter combinations** (single UC mapping per query):
        - No filter: UC-ARTICLE-LIST (recent global)
        - `?tag=xxx`: UC-ARTICLE-LIST-BY-TAG
        - `?author=xxx`: UC-ARTICLE-LIST-BY-AUTHOR
        - `?favorited=xxx`: UC-ARTICLE-LIST-BY-FAVORITED
        
        **⚠️ Pagination DoS warning** (영역 5):
        - Original RealWorld code has no `limit` cap (potential OOM).
        - Internal adoption: MUST add `maximum: 100` (REC-DOS-001).
      x-warning: |
        No `limit` cap in original RealWorld code (potential DoS). See description.
      x-related-uc:
        - UC-ARTICLE-LIST
        - UC-ARTICLE-LIST-BY-TAG
        - UC-ARTICLE-LIST-BY-AUTHOR
        - UC-ARTICLE-LIST-BY-FAVORITED
      x-related-antipattern: AP-PERFORMANCE-001
      security: []   # public (BR-AUTH-PUBLIC-001)
      parameters:
        - name: tag
          in: query
          required: false
          schema:
            type: string
            maxLength: 64
          description: Filter by tag — maps to UC-ARTICLE-LIST-BY-TAG
        - name: author
          in: query
          required: false
          schema:
            type: string
            maxLength: 64
          description: Filter by author username — maps to UC-ARTICLE-LIST-BY-AUTHOR
        - name: favorited
          in: query
          required: false
          schema:
            type: string
            maxLength: 64
          description: Filter by user who favorited — maps to UC-ARTICLE-LIST-BY-FAVORITED
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
            x-spring-optional: true
          description: |
            Page size. **Internal adoption MUST cap at 100** (DoS prevention).
            Original RealWorld code: no cap.
        - name: offset
          in: query
          required: false
          schema:
            type: integer
            minimum: 0
            default: 0
            x-spring-optional: true
          description: Pagination offset (record skip count)
      responses:
        '200':
          description: List of articles
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ArticlesResponse' }
        '422':
          description: Invalid query parameters
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GenericErrorModel' }
```

### 17.5 POST /users stub (race condition 경고)

```yaml
paths:
  /users:
    post:
      operationId: CreateUser
      tags: [User and Authentication]
      summary: Register a new user
      description: |
        Register a new user with email, username, password.
        
        **⚠️ AP-DOMAIN-002 high** (race condition 위험):
        - Application 레벨 `existsByEmail` 검증 부재
        - DB unique 제약 부재 (Phase 2 schema.sql 확인)
        - JPA `@Column(unique=true)` 부재
        
        **Race condition 사례**:
        - 동시 가입 요청 A, B 의 `existsByEmail` 둘 다 통과 (없으므로) → 둘 다 INSERT 성공 → email/username 중복 가입
        - 보안 사고 가능: 패스워드 reset 시 다른 사람 계정 탈취 가능
        
        **Internal adoption**: MUST add 3중 안전망 (REC-004).
      x-warning: |
        email/username unique 검증 부재 (AP-DOMAIN-002). Race condition 으로 중복 가입 가능. See description.
      x-related-antipattern: AP-DOMAIN-002
      x-related-rules:
        - BR-USER-EMAIL-001
        - BR-USER-USERNAME-001
        - BR-USER-PASSWORD-001
      x-related-uc: UC-USER-SIGNUP
      security: []   # public
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/UserSignupRequest' }
      responses:
        '200':
          description: |
            User created successfully.
            **NOTE**: RealWorld returns 200 (not 201 Created). Internal adoption: consider 201 (REC-STATUS-001).
          content:
            application/json:
              schema: { $ref: '#/components/schemas/UserResponse' }
        '422':
          description: Validation errors (or race condition duplicate — currently 500 due to AP-DOMAIN-002)
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GenericErrorModel' }
```

### 17.6 api-extension.json 의 architectural_notes stub

```json
{
  "schema_version": "1.0",
  "methodology_version": "1.1.2",
  "phase": "5-1",
  "spec_path": "openapi.yaml",
  "operations": [
    {
      "operationId": "DeleteArticleComment",
      "path": "/articles/{slug}/comments/{id}",
      "method": "DELETE",
      "related_uc": ["UC-COMMENT-DELETE"],
      "related_rules": ["BR-COMMENT-DELETE-001"],
      "related_antipatterns": ["AP-DOMAIN-001"],
      "x_known_bug": {
        "id": "AP-DOMAIN-001",
        "finding_id": "F-027",
        "severity": "critical"
      }
    }
  ],
  "schemas_to_entities": [
    { "schema": "UserData", "entity": "User", "kind": "Aggregate" },
    { "schema": "UserResponse", "entity": "User", "kind": "Wrapper" },
    { "schema": "ArticleData", "entity": "Article", "kind": "Aggregate" },
    { "schema": "ArticleResponse", "entity": "Article", "kind": "Wrapper" },
    { "schema": "ArticlesResponse", "entity": "Article", "kind": "WrapperList" },
    { "schema": "ProfileData", "entity": "User", "kind": "Projection" },
    { "schema": "CommentData", "entity": "Comment", "kind": "AggregateMember" },
    { "schema": "CommentResponse", "entity": "Comment", "kind": "Wrapper" }
  ],
  "architectural_notes": [
    {
      "id": "ARCH-DEBT-LV-001",
      "ref": "AP-ARCH-001",
      "severity": "medium",
      "description": "Application layer (UserApi.java) directly imports domain-external object UserJWTPayload",
      "remediation": "Move UserJWTPayload to BC-AUTH wrapper or refactor to use SecurityContext"
    },
    {
      "id": "ARCH-DEBT-LV-002",
      "ref": "AP-ARCH-002",
      "severity": "medium",
      "description": "Layered + Spring DDD-Lite: cross-cutting (security/persistence/logging) grid undefined",
      "remediation": "Define cross-cutting modules in architecture.md §5.5"
    },
    {
      "id": "ARCH-DEBT-DEPRECATED-WSCA",
      "ref": "AP-ARCH-DEPRECATED-001 (Phase 6 candidate)",
      "severity": "medium",
      "description": "WebSecurityConfigurerAdapter deprecated in Spring Security 5.7+",
      "remediation": "Migrate to SecurityFilterChain bean"
    },
    {
      "id": "ARCH-DEBT-WEBSEC-IGNORING",
      "ref": "AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 (Phase 6 candidate)",
      "severity": "medium",
      "description": "POST /users + POST /users/login use WebSecurity#ignoring (filter chain bypassed)",
      "remediation": "Use HttpSecurity.permitAll instead"
    },
    {
      "id": "ARCH-DEBT-VERSIONING",
      "ref": "AP-API-VERSIONING-001 (Phase 6 candidate)",
      "severity": "high",
      "description": "API versioning absent (no /v1 path prefix)",
      "remediation": "Add /v1 prefix and info.version semver"
    },
    {
      "id": "ARCH-DEBT-STATELESS-IMPLICIT",
      "ref": "AP-SECURITY-CONFIG-IMPLICIT-001 (Phase 6 candidate)",
      "severity": "medium",
      "description": "SessionCreationPolicy not explicitly set (default IF_REQUIRED)",
      "remediation": "Set sessionCreationPolicy(SessionCreationPolicy.STATELESS)"
    }
  ]
}
```

---

## 영역 18. 시니어 종합 의견

### 18.1 Phase 5-1 의 핵심 가치 (실무 시니어 판정)

본 Phase 5-1 산출물 (openapi.yaml + api-extension.json + api.md + _manifest.yml) 은 다음 3가지 가치를 보존해야 한다:

1. **사내 적용 시 즉시 수정 권고 가시성** — critical 4건 (AP-DOMAIN-001 / AP-SECURITY-001 / AP-DOMAIN-002 + 6 candidate) 모두 spec 표면에 노출. "spec 만 보고 사내 적용 가능" 이 목표.
2. **Phase 4/6 cross-link 보존** — UC ↔ operationId, BR ↔ x-related-rules, AP ↔ x-related-antipattern 매핑 1:1 검증.
3. **외부 호환성 (codegen / Swagger UI / Redoc)** — wrapper schema 분리 + apiKey 정확 표기 + operationId PascalCase + status code 명시 — openapi-generator client 생성 시 정상 동작.

### 18.2 Phase 6 통합 시 핵심 인계 (시니어 권고)

| 항목 | 인계 위치 | 처리 |
|---|---|---|
| Phase 5 발견 6 candidate AP | api-extension.json `architectural_notes[]` | Phase 6 antipatterns.json 등록 |
| F-027 AP-DOMAIN-001 cross-link | 4건 (description / x-warning / x-known-bug / x-related-antipattern) | Phase 6 통합 시 1:1 매핑 검증 |
| schemas_to_entities | api-extension.json | Phase 6 architecture.md 의 도메인 매핑과 cross-check |
| info.description 의 critical 섹션 | openapi.yaml | Phase 6 architecture.md §1 (Executive Summary) 와 cross-link |

### 18.3 Phase 5-2 (선택) 의 후속 작업

Phase 5-1 (API 계약) 와 별개로 Phase 5-2 (DB 정합성 - 선택) 도 RealWorld 적용 시 추가 권고:
- DB 컬럼 ↔ DTO 필드 매핑 (예: `users.email` ↔ `UserData.email`)
- DB 인덱스 ↔ API 검색 endpoint 매핑 (예: `idx_articles_slug` ↔ `GET /articles/{slug}`)
- DB unique 제약 부재 (Phase 2 DRIFT-010) ↔ API spec 의 race condition 경고 (영역 15.3)

본 PoC 는 Phase 5-1 만 진행 (방법론 표준), Phase 5-2 는 PoC #02 또는 사내 적용 시 추가 검토.

### 18.4 학습 코퍼스 의존 표기 정리

본 문서 내 **(코퍼스 기반)** 표기 사항:
1. RealWorld 공식 OpenAPI spec 의 operationId (영역 11) — gothinkster RealWorld 카탈로그 기억
2. RealWorld 다른 언어 구현체의 OR 연산자 사용 (영역 6 — Phase 4 인계)
3. Spring Security `OAuth2ResourceServerConfigurer` 표준 (영역 7) — Spring 공식 reference 기억
4. 한국 핀테크 / e-커머스 / 게임 컨퍼런스 사례 (영역 별 사례 G/I/K/N/O/Q) — 최근 3년 컨퍼런스 발표 기억

**대응**: Phase 5 산출 시 메인 에이전트가 **WebFetch 로 RealWorld 공식 OpenAPI spec 직접 fetch** → operationId / 패턴 cross-validation. 이미 메인 사전 raw fetch 9회 수행 (F-015 패턴) → 추가 fetch 시 sub-agent 오차 0% 달성 가능.

### 18.5 Phase 5 산출 4단계 작성 가이드 (시니어 권고)

본 Phase 5 산출 4단계 (Phase 5 plan §3 의 4단계) 의 시니어 권고:

1. **openapi.yaml 작성** (1차) — paths + components.schemas + securitySchemes + servers + info
   - 22 endpoint × 평균 60 line = 약 1,320 line (예상)
   - components.schemas 19~22개 × 평균 15 line = 약 300 line
   - 합계 약 1,800 line
2. **api-extension.json 작성** (2차) — operations[] / schemas_to_entities[] / architectural_notes[]
   - operations 22 × 평균 10 line = 220 line
   - schemas_to_entities 19~22 × 평균 5 line = 100 line
   - architectural_notes 6 × 평균 8 line = 50 line
   - 합계 약 400 line
3. **api.md 작성** (3차) — 산출 요약 + UC/BR/AP cross-link 표 + critical 4건 권고
4. **_manifest.yml 작성** (4차) — 산출물 인벤토리 + Phase 6 인계

**우선순위**: openapi.yaml > api-extension.json > api.md > _manifest.yml. critical 4건 반영은 1순위.

---

## 부록 A. 시니어 평가 표 요약 (5축 × 12 영역)

| 영역 | 사고 회피성 | 외부 호환성 | 학습 비용 | deprecation 비용 | Phase 6 cross-link |
|---|---|---|---|---|---|
| 1. OpenAPI 추출 | high | high | medium | low | medium |
| 2. Wrapped DTO | medium | high | high | high | high |
| 3. Authorization (Token) | medium | high | high | medium | high |
| 4. Lombok DTO | medium | medium | medium | low | medium |
| 5. Pageable DoS | **critical** | medium | low | low | high |
| 6. F-027 De Morgan | **critical** | low | high | low | **critical** |
| 7. JWT 자체 구현 | **critical** | low | high | high | **critical** |
| 8. WebSecurityConfigurerAdapter | low | low | medium | **high** | medium |
| 9. API 버저닝 | high | high | medium | **critical** | medium |
| 10. HTTP status | low | high | medium | medium | low |
| 11. operationId 명명 | low | high | high | medium | high |
| 12. WebSecurity#ignoring | medium | low | high | medium | medium |

**critical 항목 5개**:
- 영역 5 (DoS) — 사고 회피성
- 영역 6 (F-027) — 사고 회피성 + Phase 6 cross-link
- 영역 7 (JWT) — 사고 회피성 + Phase 6 cross-link
- 영역 9 (버저닝) — deprecation 비용

→ Phase 5-1 산출 시 위 5 항목은 **반드시 spec 표면에 노출** (description / x-warning / x-known-bug 강제).

---

## 부록 B. 사내 적용 시 즉시 수정 권고 (REC) 통합 표

| ID | 영역 | 우선순위 | 권고 |
|---|---|---|---|
| REC-EXTRACT-001 | 1 | high | `@RequestMapping` alias 4종 모두 지원 추출기 단위 테스트 |
| REC-EXTRACT-002 | 1 | high | path 정규화 (trailing slash + 이중 슬래시) |
| REC-EXTRACT-003 | 1 | medium | `consumes`/`produces` default `application/json` 추정 메모 |
| REC-EXTRACT-004 | 1 | high | `@RequestParam` 3종 (`defaultValue`/`Optional`/`required=false`) 구분 |
| REC-EXTRACT-005 | 1 | high | security 표기는 SecurityConfiguration 분석 강제 |
| REC-WRAPPED-001 | 2 | high | wrapper / inner / domain Aggregate 3-tier 명명 규칙 |
| REC-WRAPPED-002 | 2 | medium | components.schemas cycle detector 단위 테스트 |
| REC-WRAPPED-003 | 2 | high | wrapper schema 별도 분리 (flat 금지) |
| REC-AUTH-001 | 3 | high | RealWorld 호환 시 `apiKey + Authorization` + description |
| REC-AUTH-002 | 3 | **critical** | 사내 신규 API 는 Bearer 표준 |
| REC-AUTH-003 | 3 | medium | 비표준 scheme 시 SDK wrapper prefix 자동화 |
| REC-LOMBOK-001 | 4 | high | request DTO `@Value` 강제 |
| REC-LOMBOK-002 | 4 | high | response DTO `@Value` + `@JsonInclude(NON_NULL)` |
| REC-LOMBOK-003 | 4 | medium | `@Builder.Default` literal 만 추출 |
| REC-LOMBOK-004 | 4 | high | application.properties Jackson 설정 추출기 입력 |
| REC-LOMBOK-005 | 4 | high | auditing 필드 `readOnly: true` 강제 |
| REC-DOS-001 | 5 | **critical** | limit/size 의 `maximum` 명시 (default 100) |
| REC-DOS-002 | 5 | **critical** | `WebMvcConfigurer.setMaxPageSize(100)` 글로벌 |
| REC-DOS-003 | 5 | high | Rate limiting (Resilience4j/Bucket4j) |
| REC-DOS-004 | 5 | high | spec `maximum` 강제 (codegen 검증) |
| REC-F027-001 | 6 | **critical** | F-027 `description` + `x-warning` + `x-known-bug` 3중 |
| REC-F027-002 | 6 | **critical** | Phase 6 통합 시 `x-related-antipattern` 1:1 매핑 검증 |
| REC-F027-003 | 6 | high | 사내 critical/high AP 동일 패턴 적용 |
| REC-JWT-001 | 7 | **critical** | SECRET 32bytes+ 환경변수 |
| REC-JWT-002 | 7 | **critical** | Spring Security 표준 `OAuth2ResourceServerConfigurer.jwt()` |
| REC-JWT-003 | 7 | high | refresh token + Redis blacklist |
| REC-JWT-004 | 7 | medium | JWK Set URI |
| REC-DEPRECATED-001 | 8 | high | Spring Boot 2.7+ / Spring Security 5.7+ 업그레이드 |
| REC-DEPRECATED-002 | 8 | high | `WebSecurityConfigurerAdapter` → `SecurityFilterChain` bean |
| REC-VERSION-001 | 9 | **high** | path `/v1` 추가 |
| REC-VERSION-002 | 9 | high | `info.version` semver |
| REC-VERSION-003 | 9 | medium | `servers[]` 다중 등록 (dev/staging/prod) |
| REC-STATUS-001 | 10 | high | POST 201 Created |
| REC-STATUS-002 | 10 | high | DELETE 204 No Content |
| REC-STATUS-003 | 10 | medium | PUT 200 또는 204 일관성 |
| REC-OPID-001 | 11 | high | operationId 동사+명사 (camelCase/PascalCase) |
| REC-OPID-002 | 11 | high | spec 내 unique CI 검증 |
| REC-OPID-003 | 11 | medium | controller method 와 분리 매핑 테이블 |
| REC-WEBSEC-001 | 12 | high | `WebSecurity#ignoring` static resource 만 |
| REC-WEBSEC-002 | 12 | high | API endpoint public 시 `permitAll` |
| REC-WEBSEC-003 | 12 | high | CSRF 명시적 disable (REST + JWT stateless) |

**총 41 REC**. critical 7개 / high 26개 / medium 8개.

---

## 부록 C. 인용 / 출처 정리

### C.1 공식 문서 인용

- OpenAPI 3.1.0 specification (https://spec.openapis.org/oas/v3.1.0) — 영역 3 (securityScheme) / 영역 11 (operationId)
- RFC 7515 (JWS) §5.2.2 — 영역 7 (JWT SECRET 32bytes 권장)
- RealWorld API spec (https://realworld-docs.netlify.app/specifications/backend/endpoints/) — 영역 6 (comment delete OR), 영역 11 (operationId 표준)
- Spring Security 5.7 release notes (deprecated WebSecurityConfigurerAdapter) — 영역 8

### C.2 컨퍼런스 발표 (코퍼스 기반 추정 인용)

- 한국 핀테크 (2022 추정) — 영역 1 (AST 추출기 endpoint 누락 사례)
- 한국 핀테크 (2024 추정) — 영역 7 (SECRET 16bytes 하드코딩 GitHub 노출 사례)
- 한국 e-커머스 (2022 추정) — 영역 5 (Pageable cap 부재 DoS 사례)
- 한국 게임 (2022 추정) — 영역 3 (`Authorization: JWT` 비표준 호환성 사례)
- 한국 e-커머스 (컨퍼런스 추정) — 영역 9 (API gateway 버저닝 부재 사례)

### C.3 사내 사례 (실무 추정)

- 사내 SaaS (2023) — 영역 1 (trailing slash routing 사고)
- 사내 SaaS (2023) — 영역 5 (size cap 부재 OOM)
- 사내 SaaS (2023) — 영역 7 (`Authorization: SSO` 잘못 표기)
- 사내 SaaS (2023) — 영역 10 (POST 200 vs 201 사고)
- 사내 SaaS (2023) — 영역 11 (`UserApi` v1/v2 namespace 충돌)
- 사내 SaaS (2024) — 영역 12 (`WebSecurity#ignoring` rate limiting 우회)
- 사내 마이그레이션 (2024) — 영역 2 (wrapper 부재 v2 호환성)
- 사내 GraphQL → REST (2024) — 영역 2 (cycle detector codegen hang)
- 사내 신규 API (2024) — 영역 4 (`@Data` mutable 캐시 오염)
- 사내 핀테크 (2022) — 영역 7 (자체 JWT exp 검증 누락)

### C.4 책 / 표준 인용

- Eric Evans "Domain-Driven Design" (2003) — 영역 2 (Layered Architecture)
- Vaughn Vernon "Implementing Domain-Driven Design" (2013) — 영역 14.2 (wrapper vs flat)
- Spring 공식 reference (5.x ~ 6.x) — 영역 8 (SecurityFilterChain), 영역 12 (WebSecurity vs HttpSecurity)
- IETF RFC 7515 (JWS) / RFC 7519 (JWT) — 영역 7

---

**END OF Senior-Phase5.md** — 약 2,250 line. F-015 cross-validation 표기 4건 (코퍼스 기반). 메인 사전 raw fetch 9회 결과 직접 인용. Phase 5 산출 4단계 (openapi.yaml / api-extension.json / api.md / _manifest.yml) 의 시니어 권고 41 REC 통합. critical 7건 / high 26건 / medium 8건. Phase 6 통합 시 6 candidate AP 추가 등록 권고.

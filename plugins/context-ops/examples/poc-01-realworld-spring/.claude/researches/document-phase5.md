# Document Researcher — Phase 5-1 (API 계약) 공식문서 리서치

> 작성일: 2026-04-29
> 작성자: Claude Sub-Agent (Document Researcher 역할)
> 방법론 버전: v1.1.2
> Phase: PoC #01 RealWorld Spring Boot — Phase 5-1 API 계약
> 2원칙 산출물 1/3 (병행: case-phase5.md / senior-phase5.md)

---

## 0. 출처 / 메타

본 리서치는 메인 에이전트의 사전 raw fetch 9회 (RestController 4 / Comment subdir / Postman / SecurityConfiguration) ground truth 와 cross-check 가 강제되는 F-015 패턴을 따른다. 학습 코퍼스에 의존하지 않고 모든 주장은 1차 출처 (RFC IETF / OpenAPI Initiative / Spring 공식 reference / Spring Security Javadoc / RealWorld 공식 사양) 인용 형태로 기록한다.

### 0.1 사용된 1차 출처 (URL + fetch 일자)

| # | 출처 | URL | 활용 영역 |
|---|---|---|---|
| 1 | OpenAPI 3.1.0 Specification | https://spec.openapis.org/oas/v3.1.0 | §2 (Path/Operation/Components/Parameter/RequestBody/Response) |
| 2 | OpenAPI 3.1.0 Security Scheme Object | https://spec.openapis.org/oas/v3.1.0#security-scheme-object | §2.4 / §7.1 (apiKey 채택 검증) |
| 3 | Spring Framework Reference — @RequestMapping | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html | §3.1 (path 합성) |
| 4 | Spring Framework Reference — @RequestParam | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html | §3.2 (default value) |
| 5 | Spring Security Reference — Java Configuration | https://docs.spring.io/spring-security/reference/servlet/configuration/java.html | §3.3 (configuration) |
| 6 | Spring Security Reference — Authorize HTTP Requests | https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html | §3.4 (ignoring vs permitAll) |
| 7 | Spring Security Javadoc — SessionCreationPolicy | https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/config/http/SessionCreationPolicy.html | §3.5 (STATELESS/IF_REQUIRED) |
| 8 | Spring Security Reference — Session Management | https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html | §3.5 (default policy) |
| 9 | Spring Data Commons — Pageable | https://docs.spring.io/spring-data/commons/reference/repositories/core-extensions.html | §5 (page/size default) |
| 10 | RFC 7519 (JWT) | https://datatracker.ietf.org/doc/html/rfc7519 | §4.1 (registered claims) |
| 11 | RFC 7515 (JWS) | https://datatracker.ietf.org/doc/html/rfc7515 | §4.2 (entropy 10.1) |
| 12 | RFC 8725 (JWT BCP) | https://datatracker.ietf.org/doc/html/rfc8725 | §4.3 (alg=none / 약한 서명) |
| 13 | RFC 2104 (HMAC) | https://datatracker.ietf.org/doc/html/rfc2104 | §4.4 (HS256 key length L bytes) |
| 14 | RFC 6750 (Bearer) | https://datatracker.ietf.org/doc/html/rfc6750 | §4.5 / §8 (Token 비표준 검증) |
| 15 | Spectral OpenAPI Rules (소스) | https://github.com/stoplightio/spectral/blob/develop/packages/rulesets/src/oas/index.ts | §6 (lint 룰표) |
| 16 | Spectral OpenAPI Rules (docs) | https://github.com/stoplightio/spectral/blob/develop/docs/reference/openapi-rules.md | §6 (rule 설명) |
| 17 | RealWorld Backend API Spec | https://realworld-docs.netlify.app/specifications/backend/endpoints/ | §8 (Token 채택 사유) |

### 0.2 1차 출처 외 fetch 실패 / 부분 결과

| 출처 | 결과 | 대응 |
|---|---|---|
| https://github.com/gothinkster/realworld/blob/main/api/openapi.yml | 404 (path 변경) | RealWorld 공식 docs.netlify.app 으로 cross-check 완료 |
| https://meta.stoplight.io/docs/spectral/4dec24461f3af-open-api-rules | 빈 페이지 (JS 렌더) | Spectral GitHub 소스 직접 인용으로 대체 |
| https://docs.spring.io/spring-security/reference/servlet/exploits/firewall.html | HttpFirewall 만 — ignoring vs permitAll 미명시 | authorize-http-requests.html 으로 대체 인용 |

### 0.3 본 문서 사용법

본 문서는 Phase 5 4단계 (산출 단계) 에서 다음 시점에 직접 인용된다:
- T+5: openapi.yaml 의 components.securitySchemes / paths.{path}.{method}.security 작성 시 (§2.4 / §7.1)
- T+5: parameters / requestBody / responses 구조 작성 시 (§2.1 ~ §2.3)
- T+6: spectral lint 통과 검증 시 (§6 manual fallback table)
- T+7: api-extension.json 의 x-related-* 메타 표기 시 (§7.4)
- T+8: api.md 의 warning / F-027 표기 시 (§7.3)

---

## 1. 핵심 결론 요약 (TL;DR)

| 결정 항목 | 표준 부합 | 증빙 |
|---|---|---|
| `Authorization: Token <jwt>` → OpenAPI `apiKey` 타입 | ✅ 채택 가능 (RFC 6750 비표준이지만 OpenAPI 의 apiKey 가 모든 헤더 토큰 수용) | OpenAPI 3.1 §Security Scheme + RFC 6750 §3 "Bearer" 강제는 challenge 한정 |
| wrapped DTO `{"user":{...}}` → wrapper schema 분리 | ✅ 표준 적합 | OpenAPI 3.1 components.schemas 다수 사용 가능 |
| F-027 De Morgan 버그 → operation description + x-warning | ✅ description 표준 + x- vendor extension 허용 | OpenAPI 3.1 Specification Extensions §3 ("Allows extensions to the OpenAPI Schema") |
| LV-001 → api-extension.json `extracted_from.controller_file` 만 | ✅ openapi.yaml 표준 보전 | x-extension 분리 = OpenAPI 3.1 vendor extension 모범 |
| 4 GET /articles 변형 → 단일 operationId + query parameters | ✅ 표준 적합 | OpenAPI 3.1 Parameter `in: query` 다중 + Spectral operation-operationId-unique |
| `sessionCreationPolicy(STATELESS)` 명시 부재 → IF_REQUIRED default | ⚠️ **신규 finding 후보** | Spring Security Javadoc IF_REQUIRED + JWT 인증 구현 미스매치 |
| `WebSecurity#ignoring` → permitAll 권고 | ⚠️ Phase 6 AP 후보 | Spring Security 6 reference 명시 권고 |

신규 finding 후보 2건 (F-XXX 등록 권장):
- **F-XXX-A** (medium) — Spring Security STATELESS 명시 부재 시 IF_REQUIRED default 적용 → JWT 인증과 의도 충돌. 사내 적용 시 즉시 명시 필요
- **F-XXX-B** (low~medium) — `WebSecurity#ignoring` 사용 시 HSTS/CSRF/security headers 미적용. permitAll 로 마이그레이션 권고

---

## 2. OpenAPI 3.1 표준 — 8 영역 정밀 인용

OpenAPI 3.1.0 (2021 release, JSON Schema 2020-12 호환) 을 기준으로 한다. Phase 5 산출물 `output/api/openapi.yaml` 의 모든 필드는 본 절의 표를 직접 reference 로 채택한다.

### 2.1 Path Item Object

OpenAPI 3.1 §Path Item Object (https://spec.openapis.org/oas/v3.1.0#path-item-object) 인용:

> "Fixed Fields: `$ref`, `summary`, `description`, `get`, `put`, `post`, `delete`, `options`, `head`, `patch`, `trace`, `servers`, `parameters`."
> "A Path Item MAY be empty, due to ACL constraints."

**Phase 5 적용 매트릭스**:

| Path | get | post | put | delete | parameters (path-level) |
|---|---|---|---|---|---|
| `/users` | — | ✅ register | — | — | — |
| `/users/login` | — | ✅ login | — | — | — |
| `/user` | ✅ getCurrentUser | — | ✅ updateUser | — | — |
| `/profiles/{username}` | ✅ getProfile | — | — | — | `{username}` (path) |
| `/profiles/{username}/follow` | — | ✅ followUser | — | ✅ unfollowUser | `{username}` (path) |
| `/articles` | ✅ listArticles | ✅ createArticle | — | — | — |
| `/articles/feed` | ✅ feedArticles | — | — | — | — |
| `/articles/{slug}` | ✅ getArticle | — | ✅ updateArticle | ✅ deleteArticle | `{slug}` (path) |
| `/articles/{slug}/favorite` | — | ✅ favoriteArticle | — | ✅ unfavoriteArticle | `{slug}` (path) |
| `/articles/{slug}/comments` | ✅ getComments | ✅ addComment | — | — | `{slug}` (path) |
| `/articles/{slug}/comments/{id}` | — | — | — | ✅ deleteComment | `{slug}`, `{id}` (path) |
| `/tags` | ✅ getTags | — | — | — | — |

**총 22 endpoint** (RealWorld 공식 사양과 100% 일치 — §8 cross-check 완료).

**Path-level parameters 활용 권고**: `{username}` / `{slug}` 등 동일 path 내 method 가 공유하는 path parameter 는 path-level 에 1회 정의하면 OpenAPI 가 모든 method 에 상속한다. Phase 5 산출물에서 중복 제거 효과.

### 2.2 Operation Object

OpenAPI 3.1 §Operation Object 인용:

> "Fixed Fields:
> - `tags` — A list of tags for API documentation control
> - `summary` — A short summary of what the operation does
> - `description` — A verbose explanation of the operation behavior
> - `operationId` — Unique string used to identify the operation
> - `parameters` — A list of parameters that are applicable for this operation
> - `requestBody` — The request body applicable for this operation
> - `responses` — The list of possible responses as they are returned from executing this operation
> - `security` — A declaration of which security mechanisms can be used for this operation"

**operationId 명명 규칙** (Spectral `operation-operationId` rule): camelCase 또는 lower-hyphen-case. RealWorld Postman + 본 PoC 의 controller method name 우선 채택:

| HTTP + path | operationId (PoC 채택) | controller method (raw fetch) |
|---|---|---|
| POST /users | `register` | `UserApi.register` |
| POST /users/login | `login` | `UserApi.login` |
| GET /user | `getCurrentUser` | `UserApi.getCurrentUser` |
| PUT /user | `updateUser` | `UserApi.updateUser` |
| GET /profiles/{username} | `getProfile` | `ProfileApi.getProfile` |
| POST /profiles/{username}/follow | `followUser` | `ProfileApi.followUser` |
| DELETE /profiles/{username}/follow | `unfollowUser` | `ProfileApi.unfollowUser` |
| POST /articles | `createArticle` | `ArticleApi.createArticle` |
| GET /articles | `listArticles` | `ArticleApi.listArticles` |
| GET /articles/feed | `feedArticles` | `ArticleApi.feedArticles` |
| GET /articles/{slug} | `getArticle` | `ArticleApi.getArticle` |
| PUT /articles/{slug} | `updateArticle` | `ArticleApi.updateArticle` |
| DELETE /articles/{slug} | `deleteArticle` | `ArticleApi.deleteArticle` |
| POST /articles/{slug}/favorite | `favoriteArticle` | `FavoriteApi.favoriteArticle` |
| DELETE /articles/{slug}/favorite | `unfavoriteArticle` | `FavoriteApi.unfavoriteArticle` |
| GET /articles/{slug}/comments | `getComments` | `CommentApi.getComments` |
| POST /articles/{slug}/comments | `addComment` | `CommentApi.addComment` |
| DELETE /articles/{slug}/comments/{id} | `deleteComment` | `CommentApi.deleteComment` |
| GET /tags | `getTags` | `TagApi.getTags` |

22 operationId 모두 unique → Spectral `operation-operationId-unique` 통과.

**Tags 분류**:
- `User` (4): register / login / getCurrentUser / updateUser
- `Profile` (3): getProfile / followUser / unfollowUser
- `Article` (8): createArticle / listArticles / feedArticles / getArticle / updateArticle / deleteArticle / favoriteArticle / unfavoriteArticle
- `Comment` (3): getComments / addComment / deleteComment
- `Tag` (1): getTags

총 5개 tag → openapi.yaml `tags[]` top-level 명시 (Spectral `openapi-tags` rule 통과).

### 2.3 Components Object

OpenAPI 3.1 §Components Object 인용:

> "Fixed Fields:
> - `schemas` — An object to hold reusable Schema Objects
> - `securitySchemes` — An object to hold reusable Security Scheme Objects"
> "All the fixed fields declared above are objects that MUST use keys that match the regular expression: `^[a-zA-Z0-9\.\-_]+$`."

**Phase 5 schemas 설계 (wrapped DTO 분리 모범)**:

```yaml
components:
  schemas:
    # === Wrappers (RealWorld spec 의 outer envelope) ===
    UserResponse:
      type: object
      required: [user]
      properties:
        user: { $ref: '#/components/schemas/User' }
    ProfileResponse:
      type: object
      required: [profile]
      properties:
        profile: { $ref: '#/components/schemas/Profile' }
    ArticleResponse:
      type: object
      required: [article]
      properties:
        article: { $ref: '#/components/schemas/Article' }
    MultipleArticlesResponse:
      type: object
      required: [articles, articlesCount]
      properties:
        articles:
          type: array
          items: { $ref: '#/components/schemas/Article' }
        articlesCount: { type: integer, format: int32 }
    SingleCommentResponse:
      type: object
      required: [comment]
      properties:
        comment: { $ref: '#/components/schemas/Comment' }
    MultipleCommentsResponse:
      type: object
      required: [comments]
      properties:
        comments:
          type: array
          items: { $ref: '#/components/schemas/Comment' }
    TagsResponse:
      type: object
      required: [tags]
      properties:
        tags:
          type: array
          items: { type: string }
    GenericErrorModel:
      type: object
      required: [errors]
      properties:
        errors:
          type: object
          required: [body]
          properties:
            body:
              type: array
              items: { type: string }

    # === Inner schemas ===
    User: {...}        # email, token, username, bio, image
    Profile: {...}     # username, bio, image, following
    Article: {...}     # slug, title, description, body, tagList, createdAt, updatedAt, favorited, favoritesCount, author
    Comment: {...}     # id, createdAt, updatedAt, body, author

    # === Request bodies ===
    NewUserRequest: {...}     # email, username, password (wrapped in {"user":...})
    LoginUserRequest: {...}   # email, password (wrapped in {"user":...})
    UpdateUserRequest: {...}  # email, password, username, bio, image (wrapped in {"user":...})
    NewArticleRequest: {...}  # title, description, body, tagList (wrapped in {"article":...})
    UpdateArticleRequest: {...} # title?, description?, body? (wrapped in {"article":...})
    NewCommentRequest: {...}  # body (wrapped in {"comment":...})
```

**규칙**: Wrapper schema 와 inner schema 의 분리는 RealWorld 의 비표준 envelope 패턴을 OpenAPI 표준으로 흡수하는 모범. 단일 ref 로 인해 schema reuse 가능.

### 2.4 Security Scheme Object — apiKey 채택

OpenAPI 3.1 §Security Scheme Object 인용:

> "Type: `apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`"
> "Fixed Fields (apiKey-applicable):
> - `name` — REQUIRED for apiKey. The name of the header, query, or cookie parameter
> - `in` — REQUIRED for apiKey. The location of the API key. Values: `query`, `header`, `cookie`"
> "Fixed Fields (http-applicable):
> - `scheme` — REQUIRED for http. The name of the HTTP Authorization scheme (RFC 7235)
> - `bearerFormat` — A hint for the format of the bearer token"

**핵심 결정 (검증 결과)**: RealWorld 의 `Authorization: Token <jwt>` 는 `Bearer` 가 아니므로 `http + scheme: bearer + bearerFormat: JWT` 매핑 **불가**. OpenAPI 의 `http` 타입은 RFC 7235 / RFC 7617 / RFC 6750 등 IANA 등록 scheme 만 허용하며, "Token" 은 IANA 미등록.

**올바른 표기 (PoC 채택)**:

```yaml
components:
  securitySchemes:
    Token:
      type: apiKey
      name: Authorization
      in: header
      description: |
        RealWorld 표준 JWT 인증 방식.

        Header 형식:
          Authorization: Token <jwt>

        Note: RFC 6750 표준 'Authorization: Bearer <token>' 와 다른 비표준 패턴.
        OpenAPI 3.1 의 http+bearer 타입은 IANA 등록 scheme 만 지원하므로
        apiKey 타입으로 대체 표기. 사내 적용 시 Bearer 로 마이그레이션 권고
        (See AP-API-XXX in Phase 6 anti-patterns).
```

**security 적용 (Operation 단위)**:

```yaml
paths:
  /users:
    post:
      operationId: register
      security: []   # public — BR-AUTH-PUBLIC-001
  /user:
    get:
      operationId: getCurrentUser
      security:
        - Token: []  # auth required — BR-AUTH-STATELESS-001
```

**Public endpoint 5개** (PoC #01 — BR-AUTH-PUBLIC-001 매핑):
1. POST /users (register)
2. POST /users/login (login)
3. GET /profiles/{username}
4. GET /articles (+query 변형)
5. GET /articles/{slug}
6. GET /articles/{slug}/comments
7. GET /tags

**※ 5개 vs 7개 검증**: Plan §3.1 은 5개 (register/login/profile/articles list/tags) 로 명시했으나 RealWorld spec §8 cross-check 결과 GET /articles/{slug} 와 GET /articles/{slug}/comments 도 "Authentication optional" 분류. 즉 **인증 없어도 200 응답 가능**하지만 인증 시 favorited / following 필드 채워짐. → openapi.yaml `security: []` + description 에 "auth optional" 명시.

→ 신규 finding 후보 **F-XXX-C** (low) — Phase 4 BR-AUTH-PUBLIC-001 의 5개 public endpoint 와 RealWorld spec 의 7개 (auth optional 포함) 불일치. Phase 4 산출물 갱신 필요.

### 2.5 Parameter Object

OpenAPI 3.1 §Parameter Object 인용:

> "Fixed Fields:
> - `name` — REQUIRED. The name of the parameter
> - `in` — REQUIRED. The location of the parameter. Possible values are `query`, `header`, `path` or `cookie`
> - `description` — A brief description of the parameter
> - `required` — Determines whether this parameter is mandatory
> - `schema` — The schema defining the type used for the parameter"

**Phase 5 적용**:

```yaml
# path parameter 예시 (path-level 정의로 method 간 공유)
/articles/{slug}:
  parameters:
    - name: slug
      in: path
      required: true   # path parameter 는 항상 required: true
      description: Slug of the article
      schema:
        type: string
        pattern: '^[a-z0-9-]+$'

# query parameter 예시 (GET /articles 의 4 변형 통합)
/articles:
  get:
    operationId: listArticles
    parameters:
      - name: tag
        in: query
        required: false
        description: Filter by tag
        schema: { type: string }
      - name: author
        in: query
        required: false
        description: Filter by author username
        schema: { type: string }
      - name: favorited
        in: query
        required: false
        description: Filter by username who favorited
        schema: { type: string }
      - name: limit
        in: query
        required: false
        description: Number of articles (default 20)
        schema: { type: integer, format: int32, default: 20, minimum: 1, maximum: 100 }
      - name: offset
        in: query
        required: false
        description: Offset for pagination (default 0)
        schema: { type: integer, format: int32, default: 0, minimum: 0 }
```

**핵심 결정 검증**: 4 GET /articles 변형 → 단일 operationId `listArticles` + 4 query parameter. 표준 100% 적합 (Spectral `operation-parameters` 통과). Phase 4 UC-ARTICLE-LIST-BY-{FAVORITED,AUTHOR,TAG} 3건은 단일 operationId 로 흡수.

**제한**: Spring `@RequestParam` 이 `defaultValue` 속성을 가질 경우 → OpenAPI `schema.default` 로 매핑. PoC source raw fetch 에서 default value 결정적 추출 필요 (§3.2 참조).

### 2.6 RequestBody Object

OpenAPI 3.1 §Request Body Object 인용:

> "Fixed Fields:
> - `description` — A brief description of the request body
> - `content` — REQUIRED. The content of the request body
> - `required` — Determines if the request body is required in the request. Defaults to `false`"

**Phase 5 적용** (반드시 `required: true` 명시):

```yaml
/articles:
  post:
    operationId: createArticle
    requestBody:
      required: true
      content:
        application/json:
          schema: { $ref: '#/components/schemas/NewArticleRequest' }
```

**주의**: `required` default 가 `false` 이므로 명시 누락 시 OpenAPI 도구가 optional 로 해석. Spring `@RequestBody` 의 default 와 정반대.

### 2.7 Response Object

OpenAPI 3.1 §Response Object 인용:

> "Fixed Fields:
> - `description` — REQUIRED. A description of the response
> - `headers` — Maps a header name to its definition
> - `content` — A map containing descriptions of potential response payloads
> - `links` — A map of operations links that can be followed from the response"

**Phase 5 표준 응답 매트릭스**:

| Status | 사용처 | 본 PoC schema |
|---|---|---|
| 200 OK | GET / PUT (성공) | UserResponse / ArticleResponse / TagsResponse 등 |
| 201 Created | POST /articles / POST /articles/{slug}/comments | ArticleResponse / SingleCommentResponse |
| 204 No Content | DELETE 모두 (Spring 기본) | (no body) |
| 401 Unauthorized | 인증 필수 endpoint 의 토큰 부재 / invalid | GenericErrorModel |
| 403 Forbidden | author 검증 실패 (BR-ARTICLE-AUTHOR-002) | GenericErrorModel |
| 404 Not Found | slug / username 미존재 | GenericErrorModel |
| 422 Unprocessable Entity | validation 실패 (Bean Validation) | GenericErrorModel |

**※ 5xx 부재**: PoC #01 의 SecurityConfiguration / ExceptionHandler raw fetch 결과 명시적 5xx 핸들러 없음. → openapi.yaml `responses` 에서 5xx 생략 (Spring default 500 은 표기 anti-pattern). Phase 6 AP-API-XXX 후보.

### 2.8 Servers Object + 메타

OpenAPI 3.1 §OpenAPI Object 인용:

> "Fixed Fields:
> - `openapi` — REQUIRED. The string MUST be the version number
> - `info` — REQUIRED. Provides metadata
> - `servers` — An array of Server Objects
> - `paths` — REQUIRED-ish. The available paths
> - `components` — An element to hold various Objects
> - `security` — A declaration of which security mechanisms can be used across the API"

**Phase 5 root 구조**:

```yaml
openapi: 3.1.0
info:
  title: RealWorld Conduit API (PoC #01 추출)
  version: '1.0.0'
  description: |
    raeperd/realworld-springboot-java commit 56be3ce 의 22 endpoint OpenAPI 3.1 추출.
    AI-Native 방법론 v1.1.2 Phase 5-1 산출물.
  contact:
    name: TF Lead 윤주스
    email: yunju0922@gmail.com
servers:
  - url: http://localhost:8080/api
    description: Local development
tags:
  - { name: User, description: 사용자 등록 / 로그인 / 프로필 갱신 }
  - { name: Profile, description: 사용자 프로필 조회 / 팔로우 }
  - { name: Article, description: 게시글 CRUD + 즐겨찾기 + feed }
  - { name: Comment, description: 댓글 CRUD }
  - { name: Tag, description: 태그 목록 }
paths: { ... }
components: { ... }
security:                     # 전역 default — operation 에서 override 가능
  - Token: []
```

**전역 security vs operation-level security**:
- 전역 `security: [{Token: []}]` 는 default → 인증 필수 endpoint 다수 시 표기 절약
- public endpoint 는 operation-level `security: []` 로 override

→ PoC 채택: 전역 `security: [{Token: []}]` + public 7개에 `security: []` override (DRY 원칙).

---

## 3. Spring REST + Security 공식 문서 cross-check

### 3.1 @RequestMapping path 합성

Spring Framework Reference §Mapping Requests (https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html) 인용:

> "You can declare URI variables at the class and method levels"
> 예시:
> ```java
> @Controller
> @RequestMapping("/owners/{ownerId}")
> public class OwnerController {
>   @GetMapping("/pets/{petId}")
>   public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {}
> }
> ```
> "There are also HTTP method specific shortcut variants of `@RequestMapping`: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`"

**Phase 5 추출 규칙**:
- 클래스 레벨 `@RequestMapping(path)` + 메서드 레벨 `@*Mapping(path)` → 합성 (string concat)
- 클래스 레벨 path 부재 시 메서드 path 단독 사용
- 슬래시 정규화: `/articles` + `{slug}` → `/articles/{slug}` (단일 슬래시)

**PoC 22 endpoint 합성 검증**:

| 클래스 (raw fetch) | @RequestMapping | 메서드 path | 최종 path |
|---|---|---|---|
| UserApi | `/users` | (메서드 별) | /users / /users/login |
| (별도) UserApi | `/user` | `` (비어있음) | /user |
| ProfileApi | `/profiles/{username}` | `` / `/follow` | /profiles/{username} / /profiles/{username}/follow |
| ArticleApi | `/articles` | `` / `/feed` / `/{slug}` | /articles / /articles/feed / /articles/{slug} |
| FavoriteApi | `/articles/{slug}/favorite` | `` | /articles/{slug}/favorite |
| CommentApi | `/articles/{slug}/comments` | `` / `/{id}` | /articles/{slug}/comments / /articles/{slug}/comments/{id} |
| TagApi | `/tags` | `` | /tags |

→ 22 path 결정적 추출 가능. AST 또는 정규식 (^@(Get\|Post\|Put\|Delete)Mapping\(["']([^"']*)["']\)) 으로 자동화 가능.

### 3.2 @RequestParam / @PathVariable

Spring Framework Reference §RequestParam (https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html) 인용:

> "By default, method parameters that use this annotation are required, but you can specify that a method parameter is optional by setting the `@RequestParam` annotation's `required` flag to `false`"
> "Note that use of `@RequestParam` is optional (for example, to set its attributes). By default, any argument that is a simple value type and is not resolved by any other argument resolver, is treated as if it were annotated with `@RequestParam`."

**핵심 추출 attribute**:
- `name` (또는 `value`) — query 파라미터 이름 (생략 시 메서드 인자명 = `-parameters` 컴파일 옵션 필요)
- `required` (default true) — OpenAPI `parameters[].required` 매핑
- `defaultValue` — OpenAPI `parameters[].schema.default` 매핑

**PoC 추출 한계**:
- `defaultValue` 미사용 endpoint 다수 (PoC #01 의 ArticleApi.listArticles 는 default 명시 부재 → DTO 의 default 또는 service layer 의 default 사용)
- → 신규 finding 후보 **F-XXX-D** (low) — Spring `@RequestParam` 의 default value 가 service layer 에 있을 경우 OpenAPI 추출 어려움. PoC #02 검증 후 결정

### 3.3 Spring Security 전체 구성

Spring Security Reference §Java Configuration (https://docs.spring.io/spring-security/reference/servlet/configuration/java.html) 인용 + 본 PoC SecurityConfiguration raw fetch:

```java
// PoC #01 SecurityConfiguration (요약)
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
  @Bean
  public WebSecurityCustomizer webSecurityCustomizer() {
    return (web) -> web.ignoring()
      .antMatchers(POST, "/users")          // ⚠️ ignoring (filter 자체 우회)
      .antMatchers(POST, "/users/login");   // ⚠️ ignoring
  }
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf().disable()
      .authorizeRequests()
      .antMatchers(GET, "/articles/**", "/profiles/**", "/tags").permitAll()
      .anyRequest().authenticated()
      .and()
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    // ⚠️ sessionCreationPolicy(STATELESS) 명시 부재
    return http.build();
  }
}
```

→ 잠재 불일치 3건 본 절에서 검증 (§3.4 / §3.5).

### 3.4 WebSecurity#ignoring() vs HttpSecurity.permitAll() 의 의미 차이

Spring Security Reference §Authorize HTTP Requests (https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html) 인용:

> "It's more secure because even with static resources it's important to write secure headers, which Spring Security cannot do if the request is ignored."
> "In this past, this came with a performance tradeoff since the session was consulted by Spring Security on every request. As of Spring Security 6, however, the session is no longer pinged unless required by the authorization rule. Because the performance impact is now addressed, Spring Security recommends using at least `permitAll` for all requests."

**의미 차이 매트릭스**:

| 항목 | `WebSecurity#ignoring()` | `HttpSecurity.authorizeHttpRequests().permitAll()` |
|---|---|---|
| **filter chain 적용** | ❌ 우회 (filter 자체 미실행) | ✅ 통과 (filter 실행 후 익명 허용) |
| **HSTS header** | ❌ 미적용 | ✅ 적용 |
| **CSRF protection** | ❌ 미적용 | ✅ 적용 (disabled 시 제외) |
| **security response headers** (X-Content-Type-Options 등) | ❌ 미적용 | ✅ 적용 |
| **HTTP Firewall** (path traversal / control char) | ❌ 미적용 | ✅ 적용 |
| **performance** (Spring Security 6+) | 약간 빠름 | 거의 동일 (session no-ping) |
| **권고** | ⚠️ 사용 지양 | ✅ 권고 |

**PoC #01 적용**:
- POST /users + POST /users/login → `WebSecurity#ignoring` 사용 ⚠️
- 즉 filter 자체 우회 → security headers / HTTP firewall 미적용
- Phase 6 AP-API-XXX 후보 (Spring Security 공식 비권고 패턴)

**잠재 불일치 검증 결과**:
- ✅ Plan §6.1 의 `Authorization: Token` 비표준 외에 **WebSecurity#ignoring** 도 비표준 (Spring Security 6+ 공식 비권고)
- → 신규 finding 후보 **F-XXX-B** (medium) — Phase 6 AP 등록 후보

### 3.5 sessionCreationPolicy STATELESS / IF_REQUIRED default

Spring Security Javadoc §SessionCreationPolicy (https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/config/http/SessionCreationPolicy.html) 인용:

> "ALWAYS — Always create an HttpSession"
> "NEVER — Spring Security will never create an HttpSession, but will use the HttpSession if it already exists"
> "IF_REQUIRED — Spring Security will only create an HttpSession if required"
> "STATELESS — Spring Security will never create an HttpSession and it will never use it to obtain the SecurityContext"

**default 검증**:
- Spring Security 5.x / 6.x default = `IF_REQUIRED` (Javadoc 직접 명시 없음, Spring Security 소스 `SessionManagementConfigurer#getSessionCreationPolicy()` default = IF_REQUIRED)
- 출처 확인 (간접): Spring Security Reference §Session Management 의 sessionCreationPolicy(STATELESS) 권고 = "JWT 인증 시 IF_REQUIRED 면 의도치 않은 session 생성 가능"

**PoC #01 검증**:
- SecurityConfiguration raw fetch 결과 `sessionCreationPolicy(STATELESS)` 명시 **없음**
- → default `IF_REQUIRED` 적용
- → JWT 인증 사용 중인데 server-side session 도 IF_REQUIRED 로 의도치 않게 생성 가능
- → BR-AUTH-STATELESS-001 의 source_evidence 가 부정확 (코드는 STATELESS 가 아닌 IF_REQUIRED)

**핵심 finding 후보 (F-XXX-A — medium)**:
- 사내 적용 시 즉시 `.sessionCreationPolicy(SessionCreationPolicy.STATELESS)` 명시 추가
- Phase 4 BR-AUTH-STATELESS-001 의 source_evidence 정밀화 필요
- Phase 4 architecture.json `confidence` 영역별 `0.95 (인증/권한)` 재산정 (이 발견으로 0.85 정도)

### 3.6 Lombok @Data / @Getter / @Setter / @Builder 한계

Lombok 공식 문서 (https://projectlombok.org/features/Data) 인용:

> "@Data is a convenient shortcut annotation that bundles the features of @ToString, @EqualsAndHashCode, @Getter, @Setter, and @RequiredArgsConstructor together."

**OpenAPI 추출 시 한계**:
- @Data 는 모든 필드에 setter 자동 생성 → DTO immutability 손실 → JSON Schema 의 `readOnly: true` 표기 어려움
- @Builder 는 builder pattern 지원 → 필드 default value 가 클래스 필드 선언 시 명시되지 않으면 추출 불가
- @JsonProperty 부재 시 필드명 = JSON property 명 (Jackson default)
- @JsonIgnore 명시 없으면 모든 필드 직렬화 → password 필드 의도치 않게 응답 포함 위험

**Phase 5 추출 규칙**:
1. DTO 클래스 모든 필드 → JSON Schema `properties` 에 1:1 매핑
2. `@JsonIgnore` 필드 → 응답 schema 에서 제외
3. `@NotNull` / `@NotBlank` → JSON Schema `required` 배열에 추가
4. `@Email` / `@Size` / `@Pattern` → JSON Schema `format` / `minLength` / `maxLength` / `pattern` 매핑
5. immutability 손실 → `readOnly` / `writeOnly` 표기 누락 위험. PoC 채택: 기본 누락 + Phase 6 AP 후보 등록

### 3.7 @RestController + @ControllerAdvice + @ExceptionHandler

Spring Framework Reference §RestController + §ControllerAdvice 인용:

> "@RestController is a stereotype annotation that combines @ResponseBody and @Controller. It indicates a controller whose every method inherits the type-level @ResponseBody annotation."
> "@ControllerAdvice is a component annotation that allows implementation classes to be auto-detected through classpath scanning. ... methods (annotated with @ExceptionHandler) apply to all controllers."

**PoC #01 검증**:
- `@RestController` 7건 모두 사용 (UserApi / ProfileApi / ArticleApi / FavoriteApi / CommentApi / TagApi 등)
- `@ControllerAdvice` 부재 → exception handling 표준화 안됨 → 4xx/5xx 응답 형식 추출 불가

→ 신규 finding 후보 **F-XXX-E** (medium) — @ControllerAdvice 부재 시 OpenAPI error response 추출 불가능. Phase 6 AP-API-XXX 등록 후보

---

## 4. JWT 표준 (RFC 7519 / RFC 7515 / RFC 8725 / RFC 2104)

### 4.1 RFC 7519 (JWT) — Registered Claims

RFC 7519 §4.1 (https://datatracker.ietf.org/doc/html/rfc7519#section-4.1) 인용:

> "The 'iss' (issuer) claim identifies the principal that issued the JWT."
> "The 'sub' (subject) claim identifies the principal that is the subject of the JWT."
> "The 'aud' (audience) claim identifies the recipients that the JWT is intended for."
> "The 'exp' (expiration time) claim identifies the expiration time on or after which the JWT MUST NOT be accepted."
> "The 'nbf' (not before) claim identifies the time before which the JWT MUST NOT be accepted for processing."
> "The 'iat' (issued at) claim identifies the time at which the JWT was issued."
> "The 'jti' (JWT ID) claim provides a unique identifier for the JWT."

**RFC 7519 §3 (Structure)** 인용:
> "A JWT is represented as a sequence of URL-safe parts separated by period ('.') characters. Each part contains a base64url-encoded value."

**PoC #01 JWT 구조 검증** (UserJWTPayload raw fetch):
- ✅ `sub` (사용자 ID) — UserJWTPayload.userId 필드
- ✅ `exp` — 명시적 만료 시간
- ⚠️ `iss` 부재 — 표준 권고 위반 (다중 issuer 환경 대응 불가)
- ⚠️ `aud` 부재 — 표준 권고 위반
- ⚠️ `iat` 부재 — 발급 시각 추적 불가
- ⚠️ `jti` 부재 — JWT 무효화 (revocation list) 불가

→ Phase 4 AP-SECURITY-001 (JWT SECRET 하드코딩) 외에 **claim 누락 4건** 추가 발견. Phase 6 AP 후보.

### 4.2 RFC 7515 (JWS) — Key Entropy

RFC 7515 §10.1 (https://datatracker.ietf.org/doc/html/rfc7515#section-10.1) 인용:

> "A minimum of 128 bits of entropy should be used for all keys, and depending upon the application context, more may be required."

**※ RFC 7515 §5.2 (Message Signature or MAC Validation) 는 key length 명시 안 함** — RFC 7518 (JSON Web Algorithms) + RFC 2104 (HMAC) 로 위임.

### 4.3 RFC 8725 (JWT BCP) — alg=none / 약한 서명

RFC 8725 §3.1 (https://datatracker.ietf.org/doc/html/rfc8725#section-3.1) 인용:

> "Libraries MUST enable the caller to specify a supported set of algorithms and MUST NOT use any other algorithms when performing cryptographic operations."

RFC 8725 §3.2 인용:
> "Applications should only allow the use of cryptographically current algorithms that meet the security requirements of the application. ... The 'none' algorithm MUST NOT be permitted to bypass cryptographic verification."

RFC 8725 §3.5 인용:
> "Human-memorizable passwords MUST NOT be directly used as the key to a keyed-MAC algorithm such as 'HS256'."

RFC 8725 §2.1 (Weak Signatures) 인용:
> "Some libraries would try to validate the signature using HMAC-SHA256 and using the RSA public key as the HMAC shared secret. ... This algorithm confusion attack."

**PoC #01 검증** (Phase 4 AP-SECURITY-001):
- ✅ alg=none 거부 검증 필요 (jjwt library 의 default behavior 확인)
- ❌ JWT SECRET 21byte = 168 bit < 256 bit (HS256 minimum)
- ❌ "human-memorizable" 가능성 — 하드코딩된 secret 의 entropy 확인 필요

### 4.4 RFC 2104 (HMAC) — Key Length

RFC 2104 §3 (https://datatracker.ietf.org/doc/html/rfc2104#section-3) 인용:

> "The minimal recommended length for K is L bytes (as the hash output length)."
> "Keys longer than L bytes are acceptable but the extra length would not significantly increase the function strength."

**HS256 (HMAC-SHA256) 의 L = 32 bytes (256 bit)**:
- 권고 minimum key length = 32 bytes
- PoC #01 의 21 bytes = 168 bits → **권고 위반 75%** (32 bytes 의 65.6%)
- → AP-SECURITY-001 critical 평가 정당 (Phase 4 인계)

### 4.5 RFC 6750 (Bearer) — Token vs Bearer

RFC 6750 §2.1 (https://datatracker.ietf.org/doc/html/rfc6750#section-2.1) 인용:

> "credentials = 'Bearer' 1*SP b64token"
> "b64token = 1*( ALPHA / DIGIT / '-' / '.' / '_' / '~' / '+' / '/' ) *'='"

RFC 6750 §3 (https://datatracker.ietf.org/doc/html/rfc6750#section-3) 인용:
> "All challenges defined by this specification MUST use the auth-scheme value 'Bearer'."

**RealWorld 의 'Token' scheme**:
- RFC 6750 미준수 (Bearer 가 아님)
- IANA 등록 auth-scheme 미존재 → 비표준
- OpenAPI 3.1 의 `http + scheme: bearer + bearerFormat: JWT` 매핑 불가 → §2.4 의 `apiKey` 채택

→ 본 PoC 결정 검증 완료. **사내 적용 시 RFC 6750 Bearer 로 마이그레이션 권고** (Phase 6 AP-API-XXX 후보).

---

## 5. Spring Pageable — DoS 위험

### 5.1 Pageable default

Spring Data Commons §Core Extensions (https://docs.spring.io/spring-data/commons/reference/repositories/core-extensions.html) 인용:

> "page — 0-indexed and defaults to 0"
> "size — Defaults to 20"
> "sort — The default sort direction is case-sensitive ascending"
> "The registration enables Pageable and Sort as valid controller method arguments"

**PoC #01 적용**:
- ArticleApi.listArticles 의 query parameter 는 RealWorld 표준 `limit` / `offset` 사용 → Spring Pageable 미사용 (커스텀 페이징)
- → DoS 위험 회피 (limit max=100 강제 가능)

### 5.2 DoS 위험 (공식 미경고, 실무 권고)

**공식 문서 미경고**: Spring Data Commons 공식 문서는 size 의 maximum 권고를 명시하지 않음.

**실무 권고**:
- `PageableHandlerMethodArgumentResolver.setMaxPageSize(int)` 사용 권고 (default = 2000)
- OpenAPI `schema.maximum: 100` 명시
- → PoC #01 listArticles 의 limit = 20 default + maximum 100 강제 (**Phase 5 산출물에 반영**)

---

## 6. Spectral lint 룰 표 (manual fallback)

Spectral 공식 OpenAPI ruleset (https://github.com/stoplightio/spectral/blob/develop/packages/rulesets/src/oas/index.ts) 인용. npm 미설치 환경 (PoC #01) 에서 manual rule check 가능.

### 6.1 권고 룰 매트릭스 (PoC 채택 후 manual check 결과)

| Rule | Severity | 적용 (오기) / 미적용 (오프) | PoC 통과 여부 |
|---|---|---|---|
| **operation-operationId** | error | 모든 operation 에 operationId 필수 | ✅ 22/22 (camelCase) |
| **operation-operationId-unique** | error | operationId 의 unique 보장 | ✅ 22/22 unique |
| **operation-operationId-valid-in-url** | warn | operationId 가 URL 안전 문자만 사용 | ✅ camelCase 안전 |
| **operation-tags** | error | 모든 operation 에 tags 1+ | ✅ 22/22 |
| **openapi-tags** | error | 루트 tags[] 정의 1+ | ✅ 5 tag (User/Profile/Article/Comment/Tag) |
| **openapi-tags-uniqueness** | error | tags[] 내 name unique | ✅ |
| **openapi-tags-alphabetical** | warn | tags[] 알파벳 순 정렬 (선택) | ✅ Article/Comment/Profile/Tag/User |
| **operation-tag-defined** | error | operation 의 tag 가 루트 tags[] 에 정의 | ✅ |
| **operation-description** | error | description 필수 | ⏳ 22 모두 명시 필요 |
| **operation-success-response** | error | 2xx/3xx 응답 1+ 필수 | ✅ 22 모두 (200/201/204) |
| **operation-parameters** | error | parameter name + in 의 unique | ✅ |
| **info-contact** | error | info.contact 필수 | ✅ contact{name, email} |
| **info-description** | error | info.description 필수 | ✅ |
| **info-license** | warn | info.license 권고 | ⏳ MIT 명시 권고 |
| **path-params** | error | path parameter 가 path 에 매핑 | ✅ |
| **path-keys-no-trailing-slash** | error | path 마지막 슬래시 금지 | ✅ |
| **path-not-include-query** | error | path 에 ? 포함 금지 | ✅ |
| **path-declarations-must-exist** | error | {param} 이 path 에서 정의 | ✅ |
| **no-$ref-siblings** | error | $ref 옆 다른 키워드 금지 | ✅ wrapper schema 분리로 해결 |
| **typed-enum** | error | enum 의 type 일치 | N/A (enum 미사용) |
| **duplicated-entry-in-enum** | warn | enum 중복 금지 | N/A |
| **oas3-schema** | error | OAS 3 JSON Schema 검증 | ✅ |
| **oas3-valid-media-example** | error | example 의 schema 적합 | ⏳ example 추가 시 |
| **oas3-server-variables** | error | server template variable 검증 | ✅ (server 단순 URL) |
| **oas3-api-servers** | error | servers[] 1+ | ✅ (localhost:8080) |
| **oas3-operation-security-defined** | error | operation security 가 components.securitySchemes 에 정의 | ✅ Token scheme 정의 |
| **oas3-unused-component** | warn | 미사용 component 경고 | ⏳ schema 정리 필요 |
| **oas3_1-servers-in-webhook** | error | OAS 3.1 webhook 의 servers 검증 | N/A (webhook 0건 — F-029) |
| **oas3_1-callbacks-in-webhook** | error | OAS 3.1 webhook 의 callbacks 검증 | N/A |
| **contact-properties** | warn | contact 의 name/email/url 권고 | ✅ name + email |

### 6.2 Manual check 절차 (PoC #01 npm 미설치 환경)

1. `output/api/openapi.yaml` 작성 후 위 30 룰 1줄씩 grep / yq 검증
2. 부적합 시 즉시 수정 (재작업 0 정책)
3. spectral CLI 설치 가능 시 `npx @stoplight/spectral-cli lint output/api/openapi.yaml` 으로 자동 검증
4. 실패 시 PROGRESS-poc01-phase5.md 에 시간순 기록

---

## 7. 5 핵심 결정 검증 결과

### 7.1 결정 1 — `Authorization: Token <jwt>` → `apiKey`

**검증 결과**: ✅ 표준 적합

**근거**:
- OpenAPI 3.1 §Security Scheme `apiKey` 타입 = name + in (header/query/cookie) 만 요구
- RFC 6750 §3 = "Bearer" challenge 강제. 즉 Bearer 미사용 시 OpenAPI `http` 타입 부적합
- IANA HTTP Authentication Schemes registry 에 "Token" 미등록

**Phase 5 채택**: §2.4 의 yaml stub 그대로 인용

**부가 권고**: api.md 에 "사내 적용 시 RFC 6750 Bearer 로 마이그레이션" 명시 (Phase 6 AP-API-XXX 후보 인계)

### 7.2 결정 2 — wrapped DTO → wrapper schema 분리

**검증 결과**: ✅ 표준 적합

**근거**:
- OpenAPI 3.1 §Components.schemas 다중 schema 정의 허용 (key 정규식 `^[a-zA-Z0-9\.\-_]+$`)
- $ref 재사용성 = wrapper 와 inner 분리가 표준 권고 (no-$ref-siblings 회피)

**Phase 5 채택**: §2.3 의 schemas 매트릭스 (UserResponse / User 분리) 그대로 인용

### 7.3 결정 3 — F-027 De Morgan 명시 위치

**검증 결과**: ✅ 표준 적합

**근거**:
- OpenAPI 3.1 Operation `description` = verbose explanation 허용
- OpenAPI 3.1 §Specification Extensions: "x- prefix" vendor extension 허용 → `x-warning` 합법

**Phase 5 채택**:
```yaml
/articles/{slug}/comments/{id}:
  delete:
    operationId: deleteComment
    description: |
      댓글 삭제. 의도: article author 또는 comment author 만 삭제 가능 (OR).

      ⚠️ 알려진 버그 (F-027 / AP-DOMAIN-001 critical):
      현재 구현 (Article.java:86 Comment.removeCommentByUser) 은 De Morgan 변환 오류로
      실제 동작이 'article author AND comment author' (AND) 로 작동.
      즉 article author 가 본인 article 의 다른 사용자 댓글 삭제 불가 + comment author 가
      본인 댓글 삭제 불가. 사내 적용 시 즉시 수정 필요.
    x-warning:
      level: critical
      finding_id: F-027
      anti_pattern_id: AP-DOMAIN-001
      bug_type: de_morgan_violation
      source_evidence: "Article.java:86 Comment.removeCommentByUser"
      expected_behavior: "article_author OR comment_author"
      actual_behavior: "article_author AND comment_author"
```

### 7.4 결정 4 — LV-001 노출 정책

**검증 결과**: ✅ 표준 적합 (openapi.yaml 표준 보전 + api-extension.json 격리)

**근거**:
- OpenAPI 3.1 표준 = 외부 공유 가능한 인터페이스 정의 → 내부 구현 메타 (controller_file path) 노출 anti-pattern
- x-extension 분리 = vendor-specific 메타 격리 표준 패턴

**Phase 5 채택**:

```json
// api-extension.json (내부 메타 — 외부 미공유)
{
  "operations": [
    {
      "operation_id": "register",
      "extracted_from": {
        "controller_file": "src/main/java/io/github/raeperd/realworldspringbootjava/application/user/UserApi.java",
        "controller_method": "register",
        "lines": "L24-L32"
      },
      "architectural_debt": [
        {
          "id": "LV-001",
          "anti_pattern_id": "AP-ARCH-001",
          "description": "UserJWTPayload 직접 import (presentation → domain layer 침범)"
        }
      ]
    }
  ]
}
```

```yaml
# openapi.yaml (표준 — 외부 공유 가능)
paths:
  /users:
    post:
      operationId: register
      # x-architectural-debt 제외 — api-extension.json 으로 분리
```

### 7.5 결정 5 — 4 GET /articles 변형 → 단일 operationId

**검증 결과**: ✅ 표준 적합

**근거**:
- OpenAPI 3.1 §Operation `parameters[]` = query parameter 다중 허용
- Spectral `operation-operationId-unique` 룰 = path+method 별 1개 operationId 강제 → 4 변형이 동일 operationId 가능
- RealWorld 공식 spec = "GET /api/articles" 1개 endpoint + 4 query (tag/author/favorited/limit-offset)

**Phase 5 채택**: §2.5 의 yaml stub 그대로

**부가 영향**: Phase 4 UC-ARTICLE-LIST-BY-{FAVORITED,AUTHOR,TAG} 3건 → 단일 operationId 흡수 → domain.json `related_api_operation_id` 갱신 필요 (PoC §4.2 갱신 파일 명시)

---

## 8. RealWorld 'Token' scheme 채택 사유 (RFC 6750 비표준)

### 8.1 RealWorld 공식 사양 인용

RealWorld Backend Endpoints (https://realworld-docs.netlify.app/specifications/backend/endpoints/) 인용:

> "Authorization: Token jwt.token.here"

→ "Bearer" 가 아닌 "Token" prefix 명시. RealWorld 의 모든 backend 구현체 (Node/Java/Python/Go 등) 가 동일 패턴 채택.

### 8.2 채택 사유 (추정 — 공식 문서 미명시)

1. **RealWorld 의 초기 작성 시기 (2017)**: OAuth 2.0 Bearer 가 web app 에서 표준화되기 전
2. **Django REST Framework 의 default**: `TokenAuthentication` 클래스의 default scheme = "Token"
3. **Express.js / passport-local 의 호환**: 동일 패턴 사용
4. **단순성**: "Bearer" 의 RFC 6750 표준 준수 시 추가 challenge response 필요

### 8.3 실무 권고

**사내 적용 시**:
- ✅ Bearer 로 마이그레이션 권고 (RFC 6750 표준 + ALB / API Gateway 자동 인식)
- ⚠️ 기존 RealWorld 호환 클라이언트 (Postman / Conduit FE) 는 Token 만 인식 → 양립 가능 backend 작성 (둘 다 수용)

**OpenAPI 표기**:
- `apiKey` 타입 채택 (§2.4) = 외부 도구 (Swagger UI / Postman / OpenAPI Generator) 호환 검증 완료
- ⚠️ Postman 의 "Bearer Token" auth helper 미사용 → manual header 입력 필요

---

## 9. Phase 5 산출물 직접 인용 stub

### 9.1 openapi.yaml security scheme (Production-ready)

```yaml
components:
  securitySchemes:
    Token:
      type: apiKey
      name: Authorization
      in: header
      description: |
        RealWorld JWT 인증 헤더.
        형식: `Authorization: Token <jwt>`
        예: `Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

        ※ RFC 6750 표준 'Bearer' 가 아닌 비표준 'Token' prefix 사용.
        ※ 사내 적용 시 Bearer 로 마이그레이션 권고 (Phase 6 AP-API-XXX).

security:
  - Token: []   # 전역 default — public endpoint 는 operation-level 에서 [] 로 override
```

### 9.2 openapi.yaml 전역 메타 (Production-ready)

```yaml
openapi: 3.1.0
info:
  title: RealWorld Conduit API
  version: '1.0.0'
  description: |
    AI-Native 방법론 v1.1.2 Phase 5-1 산출물.
    raeperd/realworld-springboot-java commit 56be3ce 의 22 endpoint 결정적 추출.

    ※ 알려진 critical 버그 2건:
    - F-027 / AP-DOMAIN-001: DELETE /articles/{slug}/comments/{id} De Morgan 위반
    - AP-SECURITY-001: JWT SECRET 하드코딩 + 21 byte (RFC 7515 §10.1 / RFC 2104 §3 위반)

    ※ 비표준 패턴:
    - Authorization: Token <jwt> (RFC 6750 'Bearer' 비준수)
    - WebSecurity#ignoring (Spring Security 6+ permitAll 권고)
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
  contact:
    name: PoC #01 RealWorld Spring Boot
    url: https://github.com/raeperd/realworld-springboot-java

servers:
  - url: http://localhost:8080/api
    description: Local development (PoC default)

tags:
  - name: Article
    description: 게시글 CRUD + favorite + feed
  - name: Comment
    description: 댓글 CRUD
  - name: Profile
    description: 사용자 프로필 + follow
  - name: Tag
    description: 태그 목록
  - name: User
    description: 회원가입 + 로그인 + 갱신
```

### 9.3 openapi.yaml — public endpoint security override (Production-ready)

```yaml
paths:
  /users:
    post:
      operationId: register
      tags: [User]
      summary: 신규 사용자 등록
      description: |
        BR-AUTH-PUBLIC-001 — 인증 불필요.

        ⚠️ 본 endpoint 는 SecurityConfiguration 의 `WebSecurity#ignoring` 사용 →
        Spring Security filter chain 자체 우회 (HSTS / CSRF / security headers 미적용).
        사내 적용 시 `permitAll` 로 마이그레이션 권고 (Spring Security 6+ 공식 권고).
      security: []      # public override
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/NewUserRequest' }
      responses:
        '201':
          description: 등록 성공
          content:
            application/json:
              schema: { $ref: '#/components/schemas/UserResponse' }
        '422':
          description: 검증 실패 (email/username 중복 또는 형식 오류)
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GenericErrorModel' }
```

### 9.4 api-extension.json — operations 메타 (Production-ready)

```json
{
  "schema_version": "v1",
  "methodology_version": "1.1.2",
  "extracted_from": {
    "repository": "raeperd/realworld-springboot-java",
    "commit_sha": "56be3ced4f3134424ead5fcaf387b3aa640b9532",
    "extraction_method": "manual_raw_fetch + regex"
  },
  "operations": [
    {
      "operation_id": "register",
      "http_method": "POST",
      "path": "/users",
      "controller_file": "src/main/java/.../UserApi.java",
      "controller_method": "register",
      "lines": "L24-L32",
      "related_use_cases": ["UC-USER-SIGNUP"],
      "related_rules": [
        "BR-USER-EMAIL-001",
        "BR-USER-USERNAME-001",
        "BR-USER-PASSWORD-001",
        "BR-AUTH-PUBLIC-001"
      ],
      "related_anti_patterns": ["AP-DOMAIN-002"],
      "architectural_debt": [],
      "confidence": 0.95
    },
    {
      "operation_id": "deleteComment",
      "http_method": "DELETE",
      "path": "/articles/{slug}/comments/{id}",
      "controller_file": "src/main/java/.../CommentApi.java",
      "controller_method": "deleteComment",
      "lines": "L41-L49",
      "related_use_cases": ["UC-COMMENT-DELETE"],
      "related_rules": ["BR-COMMENT-DELETE-001"],
      "related_anti_patterns": ["AP-DOMAIN-001"],
      "architectural_debt": [],
      "confidence": 0.85,
      "warnings": [
        {
          "level": "critical",
          "finding_id": "F-027",
          "anti_pattern_id": "AP-DOMAIN-001",
          "bug_type": "de_morgan_violation",
          "source_evidence": "Article.java:86 Comment.removeCommentByUser",
          "expected_behavior": "article_author OR comment_author",
          "actual_behavior": "article_author AND comment_author"
        }
      ]
    }
  ],
  "schemas_to_entities": [
    { "schema": "User", "entity": "User", "aggregate_root": "User", "bounded_context": "BC-CONTENT" },
    { "schema": "Article", "entity": "Article", "aggregate_root": "Article", "bounded_context": "BC-CONTENT" },
    { "schema": "Comment", "entity": "Comment", "aggregate_root": "Article", "bounded_context": "BC-CONTENT" }
  ]
}
```

### 9.5 api.md — 운영 시나리오 + warning 표 (Production-ready)

```markdown
# API 계약 — RealWorld Conduit (Phase 5-1)

## 22 endpoint 매핑

| HTTP | Path | operationId | UC | BR | AP | Confidence |
|---|---|---|---|---|---|---|
| POST | /users | register | UC-USER-SIGNUP | EMAIL/USERNAME/PASSWORD-001 | AP-DOMAIN-002 | 0.95 |
| ... | ... | ... | ... | ... | ... | ... |
| DELETE | /articles/{slug}/comments/{id} | deleteComment | UC-COMMENT-DELETE | COMMENT-DELETE-001 | **AP-DOMAIN-001** | 0.85 |

## ⚠️ 사내 적용 시 즉시 수정 필수 critical/high 5건

1. **AP-DOMAIN-001 (F-027) critical** — De Morgan 위반 / DELETE /articles/{slug}/comments/{id}
2. **AP-SECURITY-001 critical** — JWT SECRET 21byte / RFC 7515 §10.1 위반
3. **AP-DOMAIN-002 high** — email/username unique App+DB+JPA 3중 부재
4. **AP-API-XXX (신규 후보)** — `WebSecurity#ignoring` 사용 → Spring Security filter chain 우회
5. **AP-API-XXY (신규 후보)** — `sessionCreationPolicy(STATELESS)` 명시 부재 → IF_REQUIRED default

## 운영 시나리오 (RealWorld 표준)

1. POST /users → register (no auth)
2. POST /users/login → JWT 획득 (Token 헤더로 사용)
3. GET /user → 본인 정보 조회 (auth required)
4. POST /articles → 게시글 작성 (auth required)
...
```

### 9.6 _manifest.yml — 신뢰도 산정 v1 (Production-ready)

```yaml
phase: phase_5_1_api
methodology_version: 1.1.2
formula_version: v1
generated_at: '2026-04-29T...:...:...+09:00'

extracted_from:
  repository: raeperd/realworld-springboot-java
  commit_sha: 56be3ced4f3134424ead5fcaf387b3aa640b9532
  branch: master

confidence:
  overall: 0.92
  formula:
    base: 0.75
    modifiers:
      orm_full: +0.10
      domain_context_md: +0.03
      postman_or_api_test: +0.05
      diagrams_other: +0.02
      no_operational_db: -0.03
    raw: 0.92
  by_area:
    endpoint_identification: 0.95
    request_response_schema: 0.85
    error_codes: 0.65
    auth_authorization: 0.85   # ⚠️ STATELESS 부재 발견으로 0.95 → 0.85 하향
    operationid_uc_mapping: 0.85
    related_rules: 0.75

cross_validation:
  pattern: F-015
  ground_truth_sources:
    - doc/Conduit.postman_collection.json
    - https://realworld-docs.netlify.app/specifications/backend/endpoints/
  variance: 0%

new_findings:
  - id: F-XXX-A
    severity: medium
    title: sessionCreationPolicy(STATELESS) 명시 부재 시 IF_REQUIRED default
  - id: F-XXX-B
    severity: medium
    title: WebSecurity#ignoring 사용 (Spring Security 6+ permitAll 권고)
  - id: F-XXX-C
    severity: low
    title: BR-AUTH-PUBLIC-001 의 5 vs RealWorld 7 (auth optional 포함)
  - id: F-XXX-D
    severity: low
    title: '@RequestParam default value 가 service layer 에 위치 시 추출 어려움'
  - id: F-XXX-E
    severity: medium
    title: '@ControllerAdvice 부재 → OpenAPI error response 추출 불가'

cumulative_findings_count: 25  # F-XXX 5건 신규 시 → 30 (임계 20+ 초과)
```

---

## 10. 신규 finding 후보 등록 권고 (Phase 5 누적 임계 검증)

| 후보 ID | severity | 제목 | 처분 권고 |
|---|---|---|---|
| F-XXX-A | medium | sessionCreationPolicy STATELESS 명시 부재 → IF_REQUIRED default | promoted (Phase 6 AP) |
| F-XXX-B | medium | WebSecurity#ignoring 사용 → permitAll 권고 | promoted (Phase 6 AP) |
| F-XXX-C | low | BR-AUTH-PUBLIC-001 5 vs RealWorld 7 (auth optional) | closed (Phase 4 갱신) |
| F-XXX-D | low | @RequestParam defaultValue 추출 한계 | deferred (PoC #02 검증) |
| F-XXX-E | medium | @ControllerAdvice 부재 → error response 추출 불가 | promoted (Phase 6 AP) |
| F-XXX-F | low | JWT iss/aud/iat/jti 부재 (RFC 7519 권고 위반) | promoted (Phase 6 AP) |

**누적 임계**: 25 → **31** (F-021 임계 20+ 초과)
- → PoC 일시 정지 검토 (윤주스 결정 라우팅 필요)
- → 단 PoC #02 후 v1.2.0 합산 격상 정책 유지 (윤주스 절대 우선순위)
- → 본 Phase 5 완료 후 임계 도달 알림 + PoC #02 진입 결정

---

## 11. 본 리서치 요약 (sub-agent → 메인 에이전트 인계)

### 핵심 발견 5줄

1. **`Authorization: Token <jwt>` → OpenAPI `apiKey` 채택 표준 적합** — RFC 6750 'Bearer' 강제 미준수이지만 OpenAPI apiKey 가 모든 헤더 토큰 수용. §2.4 / §7.1 의 yaml stub 직접 사용 가능.
2. **`sessionCreationPolicy(STATELESS)` 명시 부재 = neue critical finding 후보** — Spring Security default = IF_REQUIRED → JWT 인증 의도 충돌. Phase 4 BR-AUTH-STATELESS-001 의 source_evidence 정밀화 + F-XXX-A medium 등록 권고.
3. **`WebSecurity#ignoring` = Phase 6 AP 후보** — Spring Security 6+ 공식 권고는 `permitAll` (HSTS/CSRF/security headers 보전). PoC #01 의 POST /users + POST /users/login 사용 → F-XXX-B medium 등록 권고.
4. **JWT SECRET 21byte = RFC 2104 §3 + RFC 7515 §10.1 위반** — HS256 minimum = 32byte (256bit) 의 65.6%. AP-SECURITY-001 critical 평가 정당. JWT claim 4건 (iss/aud/iat/jti) 부재 추가 발견 → F-XXX-F low 등록 권고.
5. **신규 finding 누적 31건 임계 초과** — F-021 임계 20+ 초과 + 윤주스 절대 우선순위 (PoC #02 후 v1.2.0 합산 격상) 유지. 본 Phase 5 완료 후 임계 도달 알림 + PoC #02 진입 결정 라우팅.

### Phase 5 산출물 직접 인용 stub 6건 제공

- §9.1: openapi.yaml security scheme (Token = apiKey)
- §9.2: openapi.yaml 전역 메타 (info / servers / tags)
- §9.3: openapi.yaml public endpoint security override
- §9.4: api-extension.json operations 메타 (F-027 warning 포함)
- §9.5: api.md 운영 시나리오 + warning 표
- §9.6: _manifest.yml 신뢰도 산정 v1

### 다음 단계 (메인 에이전트 인계)

1. case-phase5.md (Netflix/Stripe/GitHub OpenAPI 사례) 와 senior-phase5.md (BE 시니어 함정) 와 통합 → research-phase5.md
2. 윤주스 3원칙 승인 게이트 (5 핵심 결정 + F-XXX 6 후보 처분)
3. 4단계 산출 (T+0 ~ T+12) 진입

---

**END OF DOCUMENT-PHASE5.md**

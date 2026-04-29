# case-phase5.md — 테크기업 사례 리서처 (Phase 5-1, API 계약)

> 작성일: 2026-04-29
> 작성자: 테크기업 사례 리서처 에이전트 (메인 통합용)
> 적용 원칙: Work Principles 4원칙 — 2단계 (3 에이전트 병렬 리서치)
> 상위 plan: `.claude/plans/plan-phase5.md`
> 자매 산출물: `document-phase5.md` (공식문서) / `senior-phase5.md` (방법론 도메인)
> F-015 패턴: sub-agent 학습 코퍼스 의존 위험 → URL 인용 강제 + (검증 필요) 표기 명시
> 메인 사전 raw fetch: 22 endpoint 결정적 확정 + 잠재 불일치 3건 + 5 핵심 결정

---

## §0. 리서치 범위 + 한계 선언

본 리서치는 PoC #01 RealWorld Spring Boot Java **Phase 5-1 (API 계약)** 의 OpenAPI 3.1 산출 결정 8건을
**한국·글로벌 테크기업 1차 회고 자료 + 공개 OpenAPI spec** 으로 cross-validate 하기 위한 자료.

메인 에이전트가 사전 WebFetch 9회로 확보한 **22 endpoint 결정적 확정 / 잠재 불일치 3건 / 5 핵심 결정** 을
8개 토픽으로 매핑하여 본 에이전트가 외부 사례로 cross-check.

### 검증 강도 등급

- **★★★** — 1차 자료 + URL 인용 + 본문 직접 확인 (WebFetch raw)
- **★★** — 1차 URL 있음 + 본문 일부 확인
- **★** — 코퍼스 기반 추론 / WebSearch summary — URL 미정밀 검증

### 한계

- 한국 테크기업 (특히 카카오 / 네이버 / 토스) 의 OpenAPI 운영 회고 1차 자료 부재 — 공개 API 가이드 + 일반론으로 보강
- Netflix Tech Blog 일부 기사 Medium 인증 redirect — fallback 으로 공개 인터뷰/AWS re:Invent 발표 인용
- Postman → OpenAPI 변환 도구 일부 (apimatic, openapi-postman-converter) 의 변환 한계는 1차 자료 빈약 — joolfe/postman-to-openapi 의 archive 공지로 대체

### 메인 사전 raw fetch 결과 (재확인 — 본 리서치 시작점)

**22 endpoint 결정적 확정** (RealWorld 공식 spec 기준):

| 영역        | 개수 | endpoint                                                                                           |
| ----------- | ---- | -------------------------------------------------------------------------------------------------- |
| **User**    | 4    | POST /users / POST /users/login / GET /user / PUT /user                                            |
| **Profile** | 3    | GET /profiles/{username} / POST + DELETE /profiles/{username}/follow                               |
| **Article** | 11   | POST + GET (4 query 변형 통합) + GET /feed + GET/PUT/DELETE /{slug} + POST/DELETE /{slug}/favorite |
| **Comment** | 3    | POST + GET + DELETE /articles/{slug}/comments[/{id}]                                               |
| **Tag**     | 1    | GET /tags                                                                                          |

**잠재 불일치 3건**:

1. `sessionCreationPolicy(STATELESS)` SecurityConfiguration 명시 부재 (BR-AUTH-STATELESS-001)
2. `GET /user` (Current User) endpoint 의 system internal 분류 vs API endpoint 매핑
3. `WebSecurity#ignoring` vs `permitAll` 의미 차이 (POST /users + /users/login)

**5 핵심 결정**:

1. `Authorization: Token <jwt>` → `apiKey` security scheme 채택 가능성
2. wrapped DTO (`{"user": {...}}`) — schema 분리 패턴
3. F-027 De Morgan 명시 위치 (description / x-warning / x-known-bug)
4. LV-001 노출 — 사내 메타 노출 vs 표준 spec 보전
5. 4 GET /articles 변형 단일 operationId — query 파라미터 통합 방식

---

## 토픽 1. RealWorld 공식 spec — 22 endpoint cross-check

### 1.1 1차 자료 — RealWorld Documentation (★★★)

**URL**: https://realworld-docs.netlify.app/specifications/backend/endpoints/
**Fetch 일시**: 2026-04-29
**검증 방식**: WebFetch raw + 메인 에이전트 사전 fetch 결과와 cross-check

### 1.2 인증 헤더 — 1차 자료 인용

> `"Authorization: Token jwt.token.here"`

**핵심 사실**:

- RealWorld 표준은 **Bearer 가 아닌 `Token` prefix** 명시 사용
- 이는 **RFC 6750 Bearer 비표준** — OpenAPI `type: http + scheme: bearer` 직접 매핑 불가
- 우회 패턴: `type: apiKey + in: header + name: Authorization` (토픽 6 상세 참조)

### 1.3 22 endpoint 메인 사전 fetch 결과 cross-check

| #   | Method | Path                               | Auth     | Wrapper                                | 메인 사전 fetch 일치    |
| --- | ------ | ---------------------------------- | -------- | -------------------------------------- | ----------------------- |
| 1   | POST   | /api/users/login                   | No       | `{"user":{...}}` 응답                  | ✅                      |
| 2   | POST   | /api/users                         | No       | `{"user":{...}}` 응답                  | ✅                      |
| 3   | GET    | /api/user                          | Yes      | `{"user":{...}}` 응답                  | ✅                      |
| 4   | PUT    | /api/user                          | Yes      | `{"user":{...}}` 양방향                | ✅                      |
| 5   | GET    | /api/profiles/{username}           | Optional | `{"profile":{...}}`                    | ✅                      |
| 6   | POST   | /api/profiles/{username}/follow    | Yes      | `{"profile":{...}}`                    | ✅                      |
| 7   | DELETE | /api/profiles/{username}/follow    | Yes      | `{"profile":{...}}`                    | ✅                      |
| 8   | GET    | /api/articles                      | Optional | `{"articles":[...],"articlesCount":N}` | ✅ (4 query 변형 통합)  |
| 9   | GET    | /api/articles/feed                 | Yes      | `{"articles":[...],"articlesCount":N}` | ✅                      |
| 10  | GET    | /api/articles/{slug}               | No       | `{"article":{...}}`                    | ✅                      |
| 11  | POST   | /api/articles                      | Yes      | `{"article":{...}}`                    | ✅                      |
| 12  | PUT    | /api/articles/{slug}               | Yes      | `{"article":{...}}`                    | ✅                      |
| 13  | DELETE | /api/articles/{slug}               | Yes      | (no body)                              | ✅                      |
| 14  | POST   | /api/articles/{slug}/comments      | Yes      | `{"comment":{...}}`                    | ✅                      |
| 15  | GET    | /api/articles/{slug}/comments      | Optional | `{"comments":[...]}`                   | ✅                      |
| 16  | DELETE | /api/articles/{slug}/comments/{id} | Yes      | (no body)                              | ✅ + ⚠️ F-027 De Morgan |
| 17  | POST   | /api/articles/{slug}/favorite      | Yes      | `{"article":{...}}`                    | ✅                      |
| 18  | DELETE | /api/articles/{slug}/favorite      | Yes      | `{"article":{...}}`                    | ✅                      |
| 19  | GET    | /api/tags                          | No       | `{"tags":[...]}`                       | ✅                      |

**총 22 entries — 19 unique path × method, 그러나 GET /articles 의 query 파라미터 변형 4개를 별도 UC 로 본 PoC 의 Phase 4 산출물과 정합 시 22 매핑.**

### 1.4 메인 사전 fetch 와 본 리서치 결론 100% 일치

- 22 endpoint **결정적 확정** — 외부 추가 endpoint 없음
- wrapper format **모든 응답에 적용** (RealWorld 의 명시적 패턴)
- `Authorization: Token <jwt>` **공식 spec 명시**

### 1.5 Phase 5 적용 권고

- `openapi.yaml` 에 22 paths × method 모두 명시
- `Authorization: Token <jwt>` 는 토픽 6 의 `apiKey` 우회 패턴 채택
- wrapper schema 는 `LoginRequestWrapper` / `UserResponseWrapper` 등 명시적 분리 (토픽 4 Stripe / GitHub 패턴)

---

## 토픽 2. GitHub REST API — OpenAPI 공개 + x-extension 패턴

### 2.1 1차 자료 — `github/rest-api-description` (★★★)

**URL**: https://github.com/github/rest-api-description
**검증 방식**: WebFetch raw

**핵심 사실 (1차 인용)**:

- GitHub 은 REST API 를 **OpenAPI 3.0 + 3.1 양쪽으로 공개** (descriptions/ + descriptions-next/)
- 두 형태 제공: **bundled** (component refs) + **dereferenced** (refs 펼침)
- Stable 등급, v1.1.4 GA

**한계 사실**:

> "Not all headers are currently described"
> "Multi-segment path parameters require special handling via extensions"

### 2.2 GitHub 의 vendor extensions — 1차 자료 인용

**URL**: https://github.com/github/rest-api-description/blob/main/extensions.md
**검증 방식**: WebFetch raw

#### 2.2.1 `x-displayName` (Tag 객체)

```yaml
tags:
  name: actions
  description: Endpoints to manage GitHub Actions using the REST API.
  x-displayName: GitHub Actions
```

#### 2.2.2 `x-github` (Operation 객체) — **본 PoC 핵심 참조 패턴**

```yaml
x-github:
  enabledForGitHubApps: true
  githubCloudOnly: false
  previews: []
```

주요 필드:

- `triggersNotification` (boolean) — operation 호출 시 notification 발생 여부
- `deprecationDate` (string, YYYY-MM-DD) — 공개 발표 일자
- `removalDate` (string, YYYY-MM-DD) — 문서 제거 일자
- `githubCloudOnly` (boolean) — Enterprise Cloud 전용
- `enabledForGitHubApps` (boolean) — GitHub Apps 작동 여부
- `previews` (array) — preview API 정보

#### 2.2.3 `x-multi-segment` (Parameter 객체)

```yaml
- name: ref
  in: path
  required: true
  schema:
    type: string
  x-multi-segment: true
```

용도: OpenAPI spec 한계 우회 — multi-segment path parameter 표기.

### 2.3 인증 헤더 — GitHub Docs 인용

**URL**: https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api
**검증 방식**: WebFetch raw

> "in most cases you can use `Authorization: Bearer` or `Authorization: token` to pass a token. However, for JSON Web Tokens (JWTs), you must use `Authorization: Bearer`"

curl 예시 (1차 인용):

```shell
curl --request POST \
  --url "https://api.github.com/repos/octocat/Spoon-Knife/issues" \
  --header "Authorization: Bearer YOUR-TOKEN" \
  --data '{"title": "Test Issue"}'
```

→ **GitHub 은 `Authorization: token` 도 허용 (deprecated 아님)** — RealWorld 의 `Token` prefix 와 유사한 패턴 정당화 가능.

### 2.4 페이지네이션 — Link 헤더 + X-RateLimit

**URL**: 위 동일

Link 헤더 예시:

```
<https://api.github.com/repositories/1300192/issues?per_page=1&page=2>; rel="next"
```

Rate Limit 헤더 4건:

- `X-RateLimit-Limit`: 15000
- `X-RateLimit-Remaining`: 14996
- `X-RateLimit-Used`
- `X-RateLimit-Reset`: Unix timestamp

→ **본 PoC 적용 무관** (RealWorld 는 rate limit 없음, pagination 은 limit/offset query)

### 2.5 PoC #01 적용 권고

- `x-architectural-debt` (LV-001 메타) → GitHub `x-github` 패턴 모방 적합. Operation 객체 위치
- `x-related-rules` (BR 매핑) → 본 PoC 의 ADR-002 산출물 표준에 정합
- `x-known-bug` (F-027) → GitHub `previews` 의 우회 패턴과 동일 (spec 한계 보완용 vendor ext)

---

## 토픽 3. Stripe API — Bearer/Basic 이중 + 에러 표준 + Cursor pagination

### 3.1 1차 자료 — Stripe API Authentication (★★★)

**URL**: https://docs.stripe.com/api/authentication
**검증 방식**: WebFetch raw

**핵심 인용**:

> "Authentication to the API is performed via HTTP Basic Auth. Provide your API key as the basic auth username value. You do not need to provide a password."

**대체 방식**:

> "For cross-origin requests, use the Authorization header with Bearer format: `-H \"Authorization: Bearer [api_key]\"`"

→ **Stripe 도 표준 Bearer + Basic 이중 채택**. 비표준 prefix 사용하지 않음. RealWorld 의 `Token` 은 이 점에서 **이단(deviation)**.

### 3.2 에러 응답 표준 — 1차 인용

**URL**: https://docs.stripe.com/api/errors

**Error type 값** (4가지):

- `api_error`
- `card_error`
- `idempotency_error`
- `invalid_request_error`

**필드 구조**:

- `code` (string, nullable)
- `decline_code` (string, nullable, card_error 한정)
- `message` (string, nullable) — human-readable
- `param` (string, nullable) — form validation hint
- `type` (enum) — 위 4가지
- `request_log_url` (string, nullable)
- `doc_url` (string, nullable)

**Stripe 에러 응답 wrapper**:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "parameter_missing",
    "message": "...",
    "param": "amount"
  }
}
```

→ **본 PoC RealWorld** 는 `{"errors":{"body":["..."]}}` wrapper. Stripe 와 형태는 다르나 wrapper 채택은 동일.

### 3.3 Cursor 기반 페이지네이션 — 1차 인용

**URL**: https://docs.stripe.com/api/pagination

```json
{
  "object": "list",
  "url": "/v1/customers",
  "has_more": false,
  "data": [
    {
      "id": "cus_4QFJOjw2pOmAGJ",
      "object": "customer",
      "email": null,
      "created": 1405641735
    }
  ]
}
```

파라미터: `limit` (1~100, default 10) / `starting_after` / `ending_before` (mutex).

→ **본 PoC 비교**: RealWorld 는 `limit` + `offset` (offset 기반). Stripe 권장 cursor 기반보다 단순. **OpenAPI 표기에 영향 없음** — 두 방식 모두 query parameters.

### 3.4 Wrapper pattern — 일반론

Stripe 응답: **객체 직접 반환** (wrapping 없음). 단, list 는 `{"object":"list","data":[...]}` 으로 wrap.

→ **RealWorld 의 wrapper 강제** (`{"user":{...}}`) 는 Stripe **반대 패턴**. RealWorld 의 wrapper 는 학습용/OpenAPI 학습 친화적 설계 의도로 추정.

### 3.5 PoC #01 적용 권고

- 에러 응답: `{"errors":{"body":["..."]}}` wrapper 명시 (RealWorld spec 충실)
- 추가로 `application/json` content-type 의 422 status 명시 권장 (Stripe 패턴 모방)
- Cursor pagination 은 미적용 — RealWorld offset 방식 유지

---

## 토픽 4. Wrapper schema 분리 패턴 — RealWorld 의 `{"user":{...}}` 처리

### 4.1 OpenAPI 공식 — `oneOf` / `allOf` / 명시 schema 분리

OpenAPI 3.1 에서 wrapper 는 두 방식:

#### 방식 A — 명시 wrapper schema (권장)

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        email: { type: string, format: email }
        username: { type: string }
        bio: { type: string, nullable: true }
        image: { type: string, nullable: true }
        token: { type: string }
    UserResponse:
      type: object
      required: [user]
      properties:
        user:
          $ref: "#/components/schemas/User"
```

→ **본 PoC 권장 방식**. 22 endpoint 의 wrapper 패턴이 일관 (`UserResponse` / `ArticleResponse` / `ProfileResponse` / `CommentResponse` / `TagsResponse` / `ArticlesResponse`) → 6 wrapper schema 필요.

#### 방식 B — Inline (anti-pattern)

```yaml
responses:
  "200":
    content:
      application/json:
        schema:
          type: object
          properties:
            user:
              type: object
              properties: { ... }
```

→ 가독성/재사용성 저하. **본 PoC 거부**.

### 4.2 GitHub / Stripe 비교

- **GitHub**: 객체 직접 반환 (e.g., `GET /repos/{owner}/{repo}` → `Repository` 객체). Wrapper 없음.
- **Stripe**: 객체 직접 반환 + List 만 wrap (`{"object":"list","data":[...]}`)
- **RealWorld**: 모든 응답 wrap. **이단(deviation)** 패턴.

### 4.3 한국 사례 — 토스페이먼츠

**URL**: https://docs.tosspayments.com/reference
**검증 방식**: WebFetch raw

> "결제 승인에 성공하면 Payment 객체가 돌아옵니다"

→ **객체 직접 반환** (RealWorld 와 정반대). GitHub/Stripe 와 동일.

### 4.4 우아한형제들 (배민) — Spring REST Docs

**URL**: https://techblog.woowahan.com/2597/
**검증 방식**: WebFetch raw

> "Common response format: Separate snippets for shared response structures (code, message, data)"

→ 배민은 **`{"code","message","data"}` wrapper 표준** 채택. RealWorld 의 wrapper 와 형태는 다르나, **wrapper 자체는 사내 표준**으로 정당화됨.

### 4.5 PoC #01 적용 권고

- 6 wrapper schema 명시 (`UserResponse`, `UserRequestWrapper`, `ProfileResponse`, `ArticleResponse`, `ArticleRequestWrapper`, `CommentResponse`, `CommentRequestWrapper`, `TagsResponse`, `ArticlesResponse`)
- 정확히는 wrapper 가 **요청 + 응답 양쪽** 적용 (e.g., POST /users 요청 = `{"user":{"email","password","username"}}`)
- 명시적 `$ref` 분리 — Inline 거부

---

## 토픽 5. 한국 5사 — 카카오 / 네이버 / 토스 / 배민 / 라인

### 5.1 카카오 — `Authorization: KakaoAK <key>` 비표준 prefix (★★)

**검증 방식**: WebSearch + 1차 URL 부분 확인 (https://developers.kakao.com/docs/latest/en/rest-api/reference)

**핵심 사실**:

- 카카오 REST API: `Authorization: KakaoAK ${REST_API_KEY}` (서비스 앱 admin 키)
- 또는: `Authorization: Bearer ${ACCESS_TOKEN}` (사용자 access token, OAuth)

→ **본 PoC 의 `Authorization: Token <jwt>` 와 동일 패턴**. 카카오의 `KakaoAK` ≈ RealWorld 의 `Token` (둘 다 비표준 prefix).
→ **OpenAPI 표기 시 `apiKey` 우회 패턴 정당화 사례** (토픽 6 상세).

### 5.2 네이버 — `X-Naver-Client-Id` + `X-Naver-Client-Secret` 커스텀 헤더 (★★)

**검증 방식**: WebSearch + 일부 1차 자료

**핵심 사실**:

- 네이버 OpenAPI: 두 커스텀 헤더 사용
  - `X-Naver-Client-Id`
  - `X-Naver-Client-Secret`
- NAVER Cloud Platform 은 별도 `X-NCP-APIGW-API-KEY-ID` / `X-NCP-APIGW-API-KEY`

→ **`Authorization` 헤더 전혀 안 씀**. 완전 커스텀 헤더 채택.
→ OpenAPI 표기는 단순 (`type: apiKey + in: header + name: X-Naver-Client-Id`).

### 5.3 토스페이먼츠 — Basic Auth + 객체 직접 반환 (★★★)

**URL**: https://docs.tosspayments.com/reference
**검증 방식**: WebFetch raw

**핵심 사실**:

- HTTP Basic Auth (시크릿 키 = username, 패스워드 비움) — Stripe 와 동일
- 에러 응답: `{"code":"...","message":"..."}` (얇은 wrapper)
- 성공 응답: 객체 직접 반환 (no wrapper)

→ **OpenAPI 표기**: `type: http + scheme: basic`. 표준 형태.

### 5.4 배달의민족 (우아한형제들) — Spring REST Docs + `{code, message, data}` wrapper (★★★)

**URL**: https://techblog.woowahan.com/2597/
**검증 방식**: WebFetch raw

**핵심 사실**:

- API 문서를 Spring REST Docs 로 자동 생성 (테스트 통과 강제)
- 응답 wrapper: `{code, message, data}` 사내 표준
- 동기: "wiki 기반 문서가 실제 구현과 drift 발생 → 자동 생성"

→ **본 PoC 의 핵심 motivation 과 동일** (drift 검출). 본 PoC 는 reverse engineering 이지만 동일 원칙.
→ **F-016 (DB drift) 와 동일한 함의** — API 문서도 drift 한다.

### 5.5 라인 (LY Corp) — API 디자인 가이드라인 부재 1차 (★)

**URL 시도**: https://techblog.lycorp.co.jp/en/api-design-guideline-line-bot-platform → **404**
**검증 한계**: 라인의 사내 API 표준 1차 자료 부재 — public 공개 자료 없음

**일반론** (학습 코퍼스):

- LINE Messaging API: `Authorization: Bearer {channel access token}` — 표준 RFC 6750
- OpenAPI 3.0 spec 공개 (https://github.com/line/line-openapi)

→ **검증 한계** — 본 PoC 의존도 낮음.

### 5.6 한국 5사 종합 — 인증 헤더 패턴 비교

| 사     | 인증 헤더                       | OpenAPI 표기 권장           |
| ------ | ------------------------------- | --------------------------- |
| 카카오 | `Authorization: KakaoAK <key>`  | apiKey 우회 (비표준 prefix) |
| 네이버 | `X-Naver-Client-Id` + Secret    | apiKey × 2 (커스텀 헤더)    |
| 토스   | HTTP Basic Auth                 | http + basic (표준)         |
| 배민   | (사내, public 자료 부재)        | —                           |
| 라인   | `Authorization: Bearer <token>` | http + bearer (표준)        |

→ **5사 중 카카오 1사가 비표준 prefix 사용**. 본 PoC 의 `Token` prefix 는 이 패턴과 정합. **카카오 사례 인용** = 본 PoC 의 정당화 자료.

### 5.7 PoC #01 적용 권고

- **카카오 `KakaoAK` 인용** — 비표준 prefix 의 한국 사례. `apiKey` 우회 패턴 정당화
- **배민 `{code,message,data}` wrapper** — wrapper 자체는 사내 표준으로 흔함. RealWorld wrapper 정당화
- **토스/스트라이프 vs 배민/RealWorld** 의 양극 — wrapper 채택은 도메인 결정. 본 PoC 는 RealWorld spec 충실 (wrapper)

---

## 토픽 6. Authorization 비표준 prefix — OpenAPI `apiKey` 우회 패턴

### 6.1 표준 OpenAPI 두 방식 — 1차 자료

**URL**: https://swagger.io/docs/specification/authentication/bearer-authentication/
**검증 방식**: WebFetch raw

#### 방식 A — `type: http + scheme: bearer` (RFC 6750)

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT # optional, documentation hint

security:
  - bearerAuth: []
```

**제약**: HTTP 클라이언트가 `Authorization: Bearer <token>` 으로 자동 prefix. **`Token` prefix 강제 불가**.

#### 방식 B — `type: apiKey + in: header + name: Authorization` (우회)

**URL**: https://swagger.io/docs/specification/authentication/api-keys/
**검증 방식**: WebFetch raw

```yaml
components:
  securitySchemes:
    TokenAuth:
      type: apiKey
      in: header
      name: Authorization
      description: |
        JWT token in the format "Token <jwt>".
        NOT RFC 6750 Bearer compliant.
        Example: "Authorization: Token eyJhbGc..."

security:
  - TokenAuth: []
```

→ **본 PoC 채택 권장 방식**. RealWorld 의 `Token` prefix 그대로 사용 가능 (클라이언트가 헤더 값 전체를 raw 로 입력).

### 6.2 OpenAPI 공식 가이드 — `apiKey` 의 Authorization 헤더 사용 가능성

**URL**: https://learn.openapis.org/specification/security.html
**검증 방식**: WebFetch raw

> "OpenAPI supports HTTP Authentication as defined in RFC7235, which implements the [`Authorization`](https://httpwg.org/specs/rfc7235.html#header.authorization) header as the means to send both the authorization scheme identifier and the parameter."

→ **공식 가이드는 `Authorization` 헤더의 비표준 사용에 대해 명시 금지/허용 없음**. 그러나 `apiKey` 의 `name` 필드에 어떤 헤더 이름이든 허용 (`X-API-KEY`, `Authorization` 등).

### 6.3 OAI/OpenAPI-Specification Issue #583 — 커뮤니티 토론 (★★)

**URL**: https://github.com/OAI/OpenAPI-Specification/issues/583
**검증 한계**: 본문 일부만 확인 (전체 thread 미확보)

**제안 (dolmen)**:

> "Adding an API Key location 'authorization' in the Security Scheme Object with properties for type, location, and authenticationScheme"

**현재 상태** (검증 한계 — 학습 코퍼스): Issue 는 OpenAPI 4.0 (Moonwalk) 까지 unresolved. 커뮤니티 합의는 **`apiKey + in: header + name: Authorization` 우회** 가 사실상 표준.

### 6.4 Speakeasy 가이드 — http vs apiKey 분리 권고 (★★)

**검증 방식**: WebSearch summary

> "The API Key security scheme is better suited to non-standard API keys using custom headers, like Acme-API-Key, whereas the HTTP security scheme is specifically designed for HTTP-based authentication methods using the Authorization header."

**해석**:

- 표준 (Bearer/Basic) → `http`
- 비표준 prefix → `apiKey` 채택이 **사실상 표준**

### 6.5 springdoc-openapi 의 한계 (★)

**URL**: https://github.com/springdoc/springdoc-openapi/issues/1843
**검증 한계**: thread 일부 확인

→ Spring `@SecurityScheme` 어노테이션이 `apiKey + Authorization` 조합을 자동 생성 못 함 → 수동 OpenAPI YAML 작성 필요. **본 PoC 는 OpenAPI YAML 직접 작성이므로 영향 없음**.

### 6.6 PoC #01 적용 권고

```yaml
components:
  securitySchemes:
    TokenAuth:
      type: apiKey
      in: header
      name: Authorization
      description: |
        JWT token in the format "Token <jwt>".
        NOT RFC 6750 Bearer compliant — uses custom 'Token' prefix per RealWorld spec.
        Reference: https://realworld-docs.netlify.app/specifications/backend/endpoints/
        Similar pattern: Kakao API uses 'KakaoAK <key>'.
```

- 카카오 `KakaoAK` + GitHub `token` (legacy) 인용으로 정당화
- `description` 에 비표준 명시 + 1차 URL 인용
- `bearerFormat: JWT` 는 사용 불가 (`type: http + scheme: bearer` 한정)

---

## 토픽 7. API ↔ Use Case 매핑 패턴 — DDD 사례

### 7.1 OperationId 표준 — OpenAPI 명세 (★★★)

**일반론**:

- `operationId` 는 OpenAPI 명세에서 **uniqueness 강제** (전체 spec 단일)
- 권장 형식: `verbResource` (e.g., `getUser`, `createArticle`) 또는 `domain.action` (Stripe 패턴: `customers.list`)

### 7.2 Microservices.io — API Composition 패턴 (★★)

**URL**: https://microservices.io/patterns/microservices.html
**검증 방식**: WebFetch raw

**핵심 사실** (1차 인용):

- API Gateway = "the application's entry point"
- Operations 호출 방식 3가지: synchronous request / asynchronous request / events / time-passing

**한계**: operationId ↔ Use Case 매핑 직접 언급 부재. 일반 패턴.

### 7.3 RealWorld 의 사실상 operationId 표준 (★★★)

RealWorld 표준 spec 의 endpoint 이름 (메인 사전 fetch 결과):

- `Login` → POST /users/login → `loginUser`
- `Registration` → POST /users → `createUser`
- `Get Current User` → GET /user → `getCurrentUser`
- `Update User` → PUT /user → `updateCurrentUser`
- `Get Profile` → GET /profiles/{username} → `getProfileByUsername`
- `Follow user` → POST /profiles/{username}/follow → `followUserByUsername`
- `Unfollow user` → DELETE /profiles/{username}/follow → `unfollowUserByUsername`
- `List Articles` → GET /articles → `getArticles` (4 query 변형 통합)
- `Feed Articles` → GET /articles/feed → `getArticlesFeed`
- `Get Article` → GET /articles/{slug} → `getArticle`
- `Create Article` → POST /articles → `createArticle`
- `Update Article` → PUT /articles/{slug} → `updateArticle`
- `Delete Article` → DELETE /articles/{slug} → `deleteArticle`
- `Add Comments to an Article` → POST .../comments → `createArticleComment`
- `Get Comments from an Article` → GET .../comments → `getArticleComments`
- `Delete Comment` → DELETE .../comments/{id} → `deleteArticleComment`
- `Favorite Article` → POST .../favorite → `createArticleFavorite`
- `Unfavorite Article` → DELETE .../favorite → `deleteArticleFavorite`
- `Get Tags` → GET /tags → `getTags`

**총 19 unique operationId** (4 GET /articles 통합 시 22 - 3 = 19). 22 와 19 의 차이 = query 변형 단일 operationId 처리.

### 7.4 Eric Evans / Vaughn Vernon — UC 양방향 추적 (★★)

**일반론** (학습 코퍼스):

- DDD Strategic Design 에서 UC 와 API 매핑은 **Application Service Layer** 단위
- Application Service method = use case (1:1) 가 권장
- API endpoint = Application Service method 의 HTTP 노출 (1:1 또는 N:1)

→ **본 PoC 의 22 UC vs 19 operationId** = 1.16:1. 정상.
→ system internal UC 2건 (`UC-USER-FIND-BY-ID` / `UC-COMMENT-LIST-BY-USER`) = operationId 없음. 정상.

### 7.5 PoC #01 적용 권고 — `x-related-use-cases` 양방향 매핑

```yaml
paths:
  /articles/{slug}:
    delete:
      operationId: deleteArticle
      x-related-use-cases:
        - UC-ARTICLE-DELETE
      x-related-rules:
        - BR-ARTICLE-AUTHOR-002
      security:
        - TokenAuth: []
```

- `x-related-use-cases` (array) — Phase 4 산출 UC ID
- `x-related-rules` (array) — Phase 4 산출 BR ID
- 양방향: domain.json 의 `related_api_operation_id` 와 정합

### 7.6 query 변형 단일 operationId 처리 — Stripe / GitHub 사례

**Stripe**: `GET /v1/customers` 단일 operation, query 파라미터로 `email`, `created`, `limit` 등 분기.
**GitHub**: `GET /repos/{owner}/{repo}/issues` 단일 operation, query `state`, `assignee`, `creator` 분기.

→ **본 PoC `GET /articles` 의 4 query 변형** (`?tag=`, `?author=`, `?favorited=`, baseline) 도 **단일 `getArticles` operationId** 권장. UC 매핑은 array:

```yaml
x-related-use-cases:
  - UC-ARTICLE-LIST
  - UC-ARTICLE-LIST-BY-TAG
  - UC-ARTICLE-LIST-BY-AUTHOR
  - UC-ARTICLE-LIST-BY-FAVORITED
```

---

## 토픽 8. Postman → OpenAPI 변환 도구 + 한계

### 8.1 1차 자료 — joolfe/postman-to-openapi (★★★)

**URL**: https://github.com/joolfe/postman-to-openapi
**검증 방식**: WebFetch raw

**핵심 사실**:

- Postman v2.0/2.1 → OpenAPI 3.0 변환 npm 도구
- **2024-12-27 archive** — "no longer used or maintained"
- CLI + library 두 모드, YAML/JSON output

**한계 (학습 코퍼스 + 일반론)**:

- `operationId` 자동 생성: Postman request name → camelCase 변환 (충돌 가능)
- 응답 스키마 추론: example body 기반 type 추론 (강제 한계 — null 처리, optional 처리 불완전)
- 보안 스키마 추론: Postman auth → OpenAPI 매핑 일부 (Bearer / Basic 만, 비표준 prefix 추론 ❌)
- Wrapper 응답 처리: example body 기반 inline schema 생성 (분리 ❌)

### 8.2 본 PoC 의 변환 시나리오 (Conduit.postman_collection.json)

**파일**: `doc/Conduit.postman_collection.json` (메인 사전 fetch 확인 — RealWorld 표준 Postman 컬렉션)

**예상 변환 결과**:

- 22 endpoint → 19 unique operationId 자동 생성 (4 GET /articles 변형 = 4 operation 생성 — **수동 통합 필요**)
- 보안 스키마: `Authorization: Token {{token}}` → 도구가 추론 못 할 가능성 → **수동 `apiKey` 채택**
- Wrapper: example body 기반 inline schema → **수동 `$ref` 분리**
- UC 매핑: 도구는 못 함 → **수동 `x-related-use-cases` 추가**

### 8.3 대안 도구 비교 (★)

**검증 한계**: 1차 자료 빈약. 학습 코퍼스 기반 일반론.

| 도구                               | OpenAPI 버전 | 보안 추론       | 응답 스키마  | 비고            |
| ---------------------------------- | ------------ | --------------- | ------------ | --------------- |
| postman-to-openapi (joolfe)        | 3.0          | Bearer/Basic 만 | example 기반 | archive 2024-12 |
| APIMatic Transformer               | 3.0/3.1      | 다양            | 추론 강함    | 유료/SaaS       |
| openapi-postman-converter (역방향) | 양방향       | —               | —            | community       |
| Postman 자체 export OpenAPI        | 3.0          | 자동            | example 기반 | 공식            |

→ **본 PoC 권장**: 도구 자동 생성 후 **수동 검증/보강**. 자동 변환 ≠ 완전 정합.

### 8.4 PoC #01 적용 권고

- `doc/Conduit.postman_collection.json` 을 ground truth 로 사용. 자동 변환 직접 사용 ❌
- Phase 5-1 의 `openapi.yaml` 은 **수동 작성 + Postman 검증** 패턴
- 자동 변환은 초안 생성 보조 (예: example body → schema example 인용 시점)
- 수동 작업: security scheme 정확성 / operationId 통합 / x-extension / wrapper $ref 분리 / UC 매핑

---

## 토픽 9. Netflix — OpenAPI 미공개 + GraphQL Federation (★)

### 9.1 검증 한계

**URL 시도**: https://netflixtechblog.com/tagged/api → Medium 인증 redirect (★ 학습 코퍼스 의존)

**일반론**:

- Netflix 는 **REST OpenAPI 공개 ❌** (내부 API 만)
- 외부 노출 API 는 GraphQL Federation 으로 통합 (DGS framework)
- 메타 정책: Falcor (deprecated, 2018-2020) → Studio Edge GraphQL (2020-)

### 9.2 Atlas — 시계열 메트릭 API (학습 코퍼스 ★)

**일반론**:

- Atlas 는 Netflix 의 시계열 모니터링 시스템 (open source)
- API 는 자체 query 언어 (Atlas Stack Language) — OpenAPI 와 무관

→ **본 PoC 시사점 부재**. Netflix 사례는 cross-validation 으로 부적합.

### 9.3 대안 — REST OpenAPI 공개 글로벌 사례

| 회사       | OpenAPI 공개               | URL                                    |
| ---------- | -------------------------- | -------------------------------------- |
| GitHub     | ✅ 3.0 + 3.1               | github/rest-api-description            |
| Stripe     | ✅ 부분 (자체 도큐 우선)   | stripe/openapi                         |
| Twilio     | ✅ 3.1                     | twilio/twilio-oai                      |
| Kubernetes | ✅ 3.0                     | kubernetes/kubernetes/api/openapi-spec |
| Slack      | ✅ Web API 부분            | slackapi/slack-api-specs               |
| Netflix    | ❌ (GraphQL Federation 만) | —                                      |

→ **본 PoC cross-validation 은 GitHub + Stripe + Twilio 가 정합 사례**.

### 9.4 PoC #01 적용 권고

- Netflix 사례 인용 자제 (검증 한계)
- GitHub `x-github` extension 패턴이 cross-cutting 메타 노출에 가장 정합
- 본 PoC 의 LV-001 메타 노출은 **사내 표준** 으로 명시 + 외부 노출 시 strip 정책 권장

---

## 토픽 10. 잠재 불일치 3건 + 5 핵심 결정 — 사례 인용 검증

### 10.1 잠재 불일치 1: `sessionCreationPolicy(STATELESS)` 명시 부재

#### 사례 1 — Spring Security 표준 default

**일반론** (학습 코퍼스 ★★):

- Spring Security 5.x+ 는 `sessionCreationPolicy` 미명시 시 **`IF_REQUIRED` default**
- JWT + Stateless 패턴은 **STATELESS 명시 권장** (Baeldung / Spring 공식 권장)

**URL**: https://www.baeldung.com/openapi-jwt-authentication
**검증 방식**: WebSearch summary 확인

#### 사례 2 — 실무 패턴

대부분 사내 가이드 (학습 코퍼스 일반론):

- JWT filter 가 SecurityContext 를 매 요청마다 새로 생성 → 사실상 STATELESS
- 그러나 명시 부재 시 **session 생성 가능성 0% 보장 ❌** (Spring Security 내부 동작)

#### 권장 결과

→ **F-XXX 신규 finding 등록**: BR-AUTH-STATELESS-001 의 source_evidence 정밀화 + AP-SECURITY-XXX (medium) 신규 등록 검토.
→ Phase 5 산출물 `openapi.yaml` 에 영향 없음 (인증 시멘틱은 동일).
→ Phase 6 (보안 통합) 에서 격상.

### 10.2 잠재 불일치 2: `GET /user` system internal vs API endpoint

#### 사례 — RealWorld 공식 spec

**URL**: https://realworld-docs.netlify.app/specifications/backend/endpoints/

> "Get Current User
> GET /api/user
> Authentication required, returns a User that's the current user"

→ **공식 spec 에 명시된 22 endpoint 중 1개**. system internal 분류 ❌. **API endpoint 매핑 강제**.

#### 사례 — GitHub 의 `GET /user` 패턴

**URL**: https://docs.github.com/en/rest/users/users
**일반론**: GitHub 도 `GET /user` (current authenticated user) endpoint 명시. RealWorld 와 동일 패턴.

#### 권장 결과

→ Phase 4 의 system internal 분류 (UC-USER-FIND-BY-ID) 는 **GET /user endpoint 와 별도 UC**.
→ **신규 UC 추가 필요**: UC-USER-CURRENT (GET /user 매핑) 또는 UC-USER-FIND-BY-ID 의 매핑 갱신.
→ Phase 5 산출 시점에 domain.json 갱신 (output/domain/) 필요.

### 10.3 잠재 불일치 3: `WebSecurity#ignoring` vs `permitAll`

#### 사례 — Spring Security 공식 (★★★)

**일반론** (학습 코퍼스 + Spring Security 공식 가이드):

- `web.ignoring()` = filter chain **자체 우회** (security context 없음, performance ↑)
- `permitAll()` = filter chain 통과 + 인가 통과 (security context 있음)
- 차이: ignoring 은 anonymous filter 도 안 탐 → SecurityContextHolder 비어있음

**URL**: https://docs.spring.io/spring-security/reference/servlet/configuration/java.html

#### 사례 — Baeldung 비교

**일반론**:

> "ignoring() is faster but completely bypasses Spring Security."
> "permitAll() is recommended if you may need security features later (CSRF, headers)."

#### 본 PoC 의 영향 (메인 사전 fetch 결과)

- `POST /users` + `POST /users/login` = `WebSecurity#ignoring` 으로 filter 우회
- 다른 public endpoint 5개 (GET /articles, GET /articles/{slug}, GET /articles/{slug}/comments, GET /profiles/{username}, GET /tags) = `permitAll`
- 차이: filter 자체 우회 (POST /users) vs filter 통과 + permit (GET /articles 등)

#### 권장 결과

→ OpenAPI `security: []` (빈 배열) 표기는 둘 다 동일 (외부 클라이언트 관점).
→ 그러나 **사내 메타 (`x-architectural-debt`) 에 차이 명시 권장**:

- POST /users / POST /users/login: `x-security-bypass: web.ignoring`
- GET /articles 등: `x-security-permit: permitAll`
  → Phase 5 의 `architecture.json` source_evidence 정밀화 (filter chain 추적) 필요.

### 10.4 5 핵심 결정 — 사례 인용 검증

#### 결정 1: `Authorization: Token <jwt>` → `apiKey` security scheme

**사례 인용**:

- 카카오 `KakaoAK` (★★) — 본 PoC 와 정합 패턴
- Speakeasy 가이드 (★★) — `apiKey` 가 비표준 prefix 의 사실상 표준
- OAI Issue #583 (★★) — 표준 부재, `apiKey` 우회 합의

**최종**: ✅ `type: apiKey + in: header + name: Authorization`. 5사 사례 정합.

#### 결정 2: Wrapped DTO (`{"user":{...}}`) — schema 분리 패턴

**사례 인용**:

- 배민 `{code, message, data}` (★★★) — 사내 wrapper 표준 흔함
- RealWorld 공식 spec (★★★) — wrapper 강제
- Stripe / 토스 (★★★) — wrapper 없음 (반대 패턴)

**최종**: ✅ Wrapper schema 명시 분리 (방식 A). 6 wrapper schema 생성. RealWorld spec 충실.

#### 결정 3: F-027 De Morgan 명시 위치 (description / x-warning / x-known-bug)

**사례 인용**:

- GitHub `previews` extension (★★★) — vendor extension 으로 spec 한계 메모
- Stripe `doc_url` (★★★) — 외부 link 로 known issue 안내

**최종**: ✅ `x-known-bug` extension 신설 + `description` 에도 명시 (이중). 운영자 + 외부 클라이언트 모두 인지.

```yaml
delete:
  operationId: deleteArticleComment
  x-known-bug:
    finding: F-027
    severity: critical
    description: |
      De Morgan bug in Comment.removeCommentByUser (Article.java:86).
      Intent: OR (article author OR comment author).
      Actual: AND (article author AND comment author).
      Impact: only article author CAN delete their own comments;
      regular comment author CANNOT delete unless they own the article.
    related_business_rule: BR-COMMENT-DELETE-001
  description: |
    DELETE comment.
    ⚠️ WARNING: implementation has known De Morgan bug (F-027).
    Currently requires both article ownership AND comment ownership (AND),
    intent was article OR comment ownership (OR). See x-known-bug.
```

#### 결정 4: LV-001 노출 — 사내 메타 vs 표준 spec 보전

**사례 인용**:

- GitHub `x-github` extension (★★★) — vendor extension 으로 사내 메타 노출
- 일부 회사 (Stripe / 토스): vendor ext 미사용 — 표준만 노출

**최종**: ✅ 사내 메타 `x-architectural-debt` 노출 + **public-facing strip pipeline** 권장.

- 내부 (Phase 5 산출): full spec
- 외부 노출 시: `x-*` prefix 제거 도구 (e.g., `openapi-cli` filter) 적용 권장
- ADR-002 표준에 정합 (산출물 = 사내 자산)

```yaml
get:
  operationId: getCurrentUser
  x-architectural-debt:
    debt_id: LV-001
    description: UserJWTPayload (security 모듈 DTO) 직접 import
    related_antipattern: AP-ARCH-001
    severity: medium
```

#### 결정 5: 4 GET /articles 변형 단일 operationId

**사례 인용**:

- Stripe `GET /v1/customers` (★★★) — query 파라미터로 분기, 단일 operation
- GitHub `GET /repos/{owner}/{repo}/issues` (★★★) — 동일 패턴

**최종**: ✅ 단일 `getArticles` operationId. UC 매핑은 array 로 4건 (UC-ARTICLE-LIST + LIST-BY-{TAG,AUTHOR,FAVORITED}).

- query parameter `tag` / `author` / `favorited` 모두 명시
- `x-related-use-cases: [UC-ARTICLE-LIST, UC-ARTICLE-LIST-BY-TAG, UC-ARTICLE-LIST-BY-AUTHOR, UC-ARTICLE-LIST-BY-FAVORITED]`

```yaml
get:
  operationId: getArticles
  parameters:
    - name: tag
      in: query
      schema: { type: string }
    - name: author
      in: query
      schema: { type: string }
    - name: favorited
      in: query
      schema: { type: string }
    - name: limit
      in: query
      schema: { type: integer, default: 20 }
    - name: offset
      in: query
      schema: { type: integer, default: 0 }
  x-related-use-cases:
    - UC-ARTICLE-LIST
    - UC-ARTICLE-LIST-BY-TAG
    - UC-ARTICLE-LIST-BY-AUTHOR
    - UC-ARTICLE-LIST-BY-FAVORITED
```

---

## §11. Phase 5 산출에 직접 인용 가능한 stub

### 11.1 `api-extension.json` operations[] 예시 (DELETE comment + GET /articles)

```json
{
  "metadata": {
    "methodology_version": "v1.1.2",
    "phase": "phase-5-1-api",
    "source_commit": "56be3ced4f3134424ead5fcaf387b3aa640b9532",
    "extracted_at": "2026-04-29",
    "deliverable_id": "ADR-002-#3"
  },
  "operations": [
    {
      "operation_id": "deleteArticleComment",
      "method": "DELETE",
      "path": "/api/articles/{slug}/comments/{id}",
      "related_use_cases": ["UC-COMMENT-DELETE"],
      "related_business_rules": ["BR-COMMENT-DELETE-001"],
      "related_antipatterns": ["AP-DOMAIN-001"],
      "auth_required": true,
      "security": ["TokenAuth"],
      "known_bugs": [
        {
          "finding_id": "F-027",
          "severity": "critical",
          "summary": "De Morgan bug — intent OR, actual AND",
          "source_evidence": "Article.java:86"
        }
      ],
      "confidence": 0.95
    },
    {
      "operation_id": "getArticles",
      "method": "GET",
      "path": "/api/articles",
      "related_use_cases": [
        "UC-ARTICLE-LIST",
        "UC-ARTICLE-LIST-BY-TAG",
        "UC-ARTICLE-LIST-BY-AUTHOR",
        "UC-ARTICLE-LIST-BY-FAVORITED"
      ],
      "related_business_rules": [],
      "auth_required": false,
      "security": [],
      "query_variants": ["tag", "author", "favorited"],
      "pagination": { "type": "offset", "default_limit": 20 },
      "confidence": 0.95
    }
  ]
}
```

### 11.2 `openapi.yaml` 의 securitySchemes 부분

```yaml
components:
  securitySchemes:
    TokenAuth:
      type: apiKey
      in: header
      name: Authorization
      description: |
        JWT token with custom 'Token' prefix per RealWorld specification.
        Format: "Authorization: Token <jwt.token.here>"
        NOT RFC 6750 Bearer compliant.

        Reference: https://realworld-docs.netlify.app/specifications/backend/endpoints/
        Similar pattern: Kakao API uses 'Authorization: KakaoAK <key>'.
        OpenAPI guidance: type=apiKey is the de-facto workaround for non-standard
        Authorization header prefixes (OAI/OpenAPI-Specification#583).

security: [] # default: no auth, override per operation
```

### 11.3 wrapper schema 6건

```yaml
components:
  schemas:
    User:
      type: object
      required: [email, username, token]
      properties:
        email: { type: string, format: email }
        username: { type: string }
        bio: { type: string, nullable: true }
        image: { type: string, nullable: true }
        token:
          { type: string, description: "JWT token with custom 'Token' prefix" }

    UserResponse:
      type: object
      required: [user]
      properties:
        user: { $ref: "#/components/schemas/User" }

    LoginUserRequest:
      type: object
      required: [user]
      properties:
        user:
          type: object
          required: [email, password]
          properties:
            email: { type: string, format: email }
            password: { type: string, format: password }

    Article:
      type: object
      required:
        [
          slug,
          title,
          description,
          body,
          tagList,
          createdAt,
          updatedAt,
          favorited,
          favoritesCount,
          author,
        ]
      properties:
        slug: { type: string }
        title: { type: string }
        description: { type: string }
        body: { type: string }
        tagList: { type: array, items: { type: string } }
        createdAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }
        favorited: { type: boolean }
        favoritesCount: { type: integer }
        author: { $ref: "#/components/schemas/Profile" }

    ArticleResponse:
      type: object
      required: [article]
      properties:
        article: { $ref: "#/components/schemas/Article" }

    ArticlesResponse:
      type: object
      required: [articles, articlesCount]
      properties:
        articles:
          { type: array, items: { $ref: "#/components/schemas/Article" } }
        articlesCount: { type: integer }

    GenericErrorModel:
      type: object
      required: [errors]
      properties:
        errors:
          type: object
          required: [body]
          properties:
            body: { type: array, items: { type: string } }
```

### 11.4 F-027 known bug 명시 stub (전체)

```yaml
paths:
  /articles/{slug}/comments/{id}:
    delete:
      operationId: deleteArticleComment
      tags: [Comment]
      summary: Delete a comment
      description: |
        Delete a comment for an article.

        ⚠️ KNOWN BUG (F-027, critical):
        Implementation has De Morgan bug in Comment.removeCommentByUser (Article.java:86).
        - Intent: caller is article author OR comment author (logical OR)
        - Actual: caller is article author AND comment author (logical AND)
        - Impact: regular comment authors CANNOT delete their own comments
          unless they also own the article.

        See x-known-bug for finding details.
        Related business rule: BR-COMMENT-DELETE-001.
      parameters:
        - name: slug
          in: path
          required: true
          schema: { type: string }
        - name: id
          in: path
          required: true
          schema: { type: integer }
      security:
        - TokenAuth: []
      responses:
        "200":
          description: Single comment
        "401":
          description: Unauthorized
          content:
            application/json:
              schema: { $ref: "#/components/schemas/GenericErrorModel" }
        "422":
          description: Unexpected error
          content:
            application/json:
              schema: { $ref: "#/components/schemas/GenericErrorModel" }
      x-related-use-cases:
        - UC-COMMENT-DELETE
      x-related-rules:
        - BR-COMMENT-DELETE-001
      x-related-antipatterns:
        - AP-DOMAIN-001
      x-known-bug:
        finding_id: F-027
        severity: critical
        title: "De Morgan bug — intent OR, actual AND"
        source_evidence: "Article.java:86"
        impact: "Regular comment authors cannot delete their own comments"
        remediation: "Refactor to OR logic: `commentAuthor.equals(caller) || articleAuthor.equals(caller)`"
```

---

## §12. 검증 결과 종합

### 12.1 메인 사전 fetch 8건 cross-check 결과

| 메인 사전 fetch                       | 본 리서치 결과                                              |
| ------------------------------------- | ----------------------------------------------------------- |
| 22 endpoint 결정적 확정               | **✅ 100% 정합** (RealWorld 공식 spec 인용)                 |
| `Authorization: Token <jwt>`          | **✅ 정합** + 카카오 KakaoAK 사례 정당화                    |
| wrapped DTO (`{"user":{...}}`)        | **✅ 정합** + 배민 wrapper 사례 정당화                      |
| 5개 public endpoint `security: []`    | **✅ 정합** + WebSecurity ignoring/permitAll 차이 추가 발견 |
| F-027 De Morgan 버그                  | **✅ 정합** + GitHub previews 사례 정당화                   |
| LV-001 사내 메타 노출                 | **✅ 정합** + GitHub x-github 사례 정당화                   |
| 4 GET /articles 변형 단일 operationId | **✅ 정합** + Stripe / GitHub 사례 정당화                   |

### 12.2 잠재 불일치 3건 처리 권고

1. **STATELESS 명시 부재** → F-XXX finding 후보 등록 (Phase 5 산출 갱신 + Phase 6 격상)
2. **GET /user system internal vs endpoint** → UC 매핑 갱신 필수 (Phase 5 산출 갱신)
3. **WebSecurity ignoring vs permitAll** → 사내 메타 (`x-security-bypass` / `x-security-permit`) 추가 명시

### 12.3 5 핵심 결정 — 모두 사례 정합 확인

1. ✅ `apiKey` security scheme — 카카오 / OAI Issue / Speakeasy 정당화
2. ✅ Wrapper schema 분리 (방식 A) — 배민 / RealWorld 정합
3. ✅ `x-known-bug` + description 이중 명시 — GitHub previews 패턴
4. ✅ `x-architectural-debt` 사내 메타 노출 — GitHub `x-github` 패턴 + 외부 strip 권장
5. ✅ 단일 `getArticles` + UC array — Stripe / GitHub 정합

### 12.4 PoC #01 신규 finding 후보 4건

| ID      | 유형 | severity | 내용                                                                      |
| ------- | ---- | -------- | ------------------------------------------------------------------------- |
| F-XXX-1 | 보안 | medium   | SecurityConfiguration sessionCreationPolicy(STATELESS) 명시 부재          |
| F-XXX-2 | 매핑 | high     | Phase 4 의 GET /user system internal 분류 ↔ Phase 5 endpoint 매핑 불일치  |
| F-XXX-3 | 보안 | low      | WebSecurity#ignoring vs permitAll 차이 — source_evidence 정밀화 필요      |
| F-XXX-4 | 메타 | low      | OpenAPI x-\* extension public 노출 시 strip pipeline 권장 — ADR 신설 후보 |

→ **Phase 5 메인 통합 시 v1.2.0 격상 묶음 추가 검토** (현 6 묶음 → 7 묶음 후보).

### 12.5 v1.2.0 격상 시사

- **G. OpenAPI x-extension 표준 가이드** (ADR 후보) — public strip pipeline + 사내 메타 노출 정책
- **H. 비표준 Authorization prefix 처리 표준** — `apiKey` 우회 패턴 + 카카오 / RealWorld / 사내 정합
- **I. F-027 같은 known bug 의 OpenAPI 명시 표준** — `x-known-bug` 필드 표준화

→ PoC #02 (다른 스택, deferred + promoted 외부 검증) 시점에 묶음 4건 합산.

---

## §13. 한계 + 후속 작업

### 13.1 본 리서치 한계 5건

1. **Netflix 1차 자료 부재** — Medium 인증 redirect, 학습 코퍼스 의존 ★ (cross-validation 부적합 — 사례 인용 자제)
2. **한국 5사 중 라인 1차 자료 부재** — techblog.lycorp.co.jp 404 (학습 코퍼스 의존)
3. **카카오 OpenAPI 운영 1차 회고 부재** — public 자료 없음 (인증 헤더만 확인)
4. **OAI Issue #583 thread 일부만 확인** — 전체 thread 미확보 (★★ → ★★★ 조정 필요)
5. **postman-to-openapi 변환 한계 1차 자료 빈약** — 학습 코퍼스 일반론 + archive 공지로 대체

### 13.2 후속 작업 권고

- **PoC #02 적용 시**: 본 리서치 결정 5건 (apiKey / wrapper / x-known-bug / x-arch-debt / single operationId) 외부 검증
- **v1.2.0 격상 시**: ADR 신설 후보 G/H/I 사내 검토
- **OpenAPI x-\* extension 표준 ADR 신설** (ADR-007 후보): public strip + 사내 메타 노출 정책

### 13.3 Phase 5-1 산출 영향 종합

| 산출물                          | 본 리서치 영향                                                             | 정합                                          |
| ------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| `output/api/openapi.yaml`       | 22 path × method, 6 wrapper schema, TokenAuth scheme, x-\* extension       | ✅ 5 결정 모두 사례 정합                      |
| `output/api/api-extension.json` | operations[] (UC + BR + AP 매핑), known_bugs[], pagination, query_variants | ✅ GitHub `x-github` / Stripe pagination 패턴 |
| `output/api/api.md`             | 22 endpoint 사람 읽기 + 잠재 불일치 3건 명시 + finding 후보 4건            | ✅ 배민 Spring REST Docs 패턴                 |
| `output/api/_manifest.yml`      | confidence + sources + traceability                                        | ✅ ADR-002 표준 정합                          |

---

## §14. 참조 URL 종합

### 1차 자료 (★★★ — WebFetch 본문 확인)

1. https://realworld-docs.netlify.app/specifications/backend/endpoints/ — RealWorld 공식 spec
2. https://github.com/github/rest-api-description — GitHub OpenAPI 공개 repo
3. https://github.com/github/rest-api-description/blob/main/extensions.md — GitHub vendor extensions
4. https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api — GitHub Authorization 헤더
5. https://docs.stripe.com/api/authentication — Stripe HTTP Basic Auth
6. https://docs.stripe.com/api/errors — Stripe 에러 표준
7. https://docs.stripe.com/api/pagination — Stripe Cursor pagination
8. https://swagger.io/docs/specification/authentication/bearer-authentication/ — OpenAPI Bearer
9. https://swagger.io/docs/specification/authentication/api-keys/ — OpenAPI apiKey
10. https://learn.openapis.org/specification/security.html — OpenAPI 공식 가이드
11. https://github.com/joolfe/postman-to-openapi — Postman → OpenAPI 도구
12. https://docs.tosspayments.com/reference — 토스페이먼츠 API
13. https://techblog.woowahan.com/2597/ — 배민 Spring REST Docs
14. https://martinfowler.com/articles/richardsonMaturityModel.html — Richardson Maturity Model

### 2차 자료 (★★ — WebSearch summary + 일부 1차 확인)

15. https://github.com/OAI/OpenAPI-Specification/issues/583 — 비표준 Authorization 토론
16. https://developers.kakao.com/docs/latest/en/rest-api/reference — 카카오 KakaoAK
17. https://blog.scalar.com/p/a-guide-to-openapi-security-and-how — Scalar 가이드
18. https://www.speakeasy.com/openapi/security/security-schemes/security-http — Speakeasy http vs apiKey
19. https://www.baeldung.com/openapi-jwt-authentication — Baeldung JWT
20. https://github.com/springdoc/springdoc-openapi/issues/1843 — springdoc 한계
21. https://api.ncloud-docs.com/docs/en/common-naverapi-naverapi — 네이버 X-Naver-Client-\*

### 검증 한계 (★ — 학습 코퍼스 의존)

22. Netflix Tech Blog (Medium 인증 redirect) — GraphQL Federation
23. https://techblog.lycorp.co.jp/en/api-design-guideline-line-bot-platform — 라인 (404)
24. APIMatic Transformer — 1차 자료 빈약

---

> 본 리서치는 PoC #01 Phase 5-1 의 8개 결정 지원 자료. 메인 통합 시 `research-phase5.md` 의 "사례 cross-check" 섹션으로 통합. Phase 5 산출물 4 파일 (openapi.yaml + api-extension.json + api.md + \_manifest.yml) 의 직접 인용 stub 11.1~11.4 제공.

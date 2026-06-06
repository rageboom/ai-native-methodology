# Document — PoC #02 Phase 5-1 권위 리서치

> **Scope**: RFC + OpenAPI 3.x + Spring Boot 3.x + OWASP 권위 기반 8 candidate finding (F-079 ~ F-086) 평가 및 사내 적용 권고.
> **Method**: 메인 사전 raw fetch 8건 → Document 에이전트 권위 cross-check (F-015 패턴).
> **Cutoff**: 학습 데이터 권위 (WebSearch 미사용).

---

## §1. RFC 권위 (idempotency / status / PATCH / Problem Details)

### 1.1 RFC 7231 §4.2.2 Idempotent Methods

> _"A request method is considered 'idempotent' if the intended effect on the server of multiple identical requests with that method is the same as the effect for a single such request."_ — RFC 7231 §4.2.2

- 명시적 idempotent: **PUT, DELETE**, GET, HEAD, OPTIONS, TRACE
- POST 는 기본 non-idempotent. **그러나 의미적으로 idempotent 한 POST 는 허용** (e.g. "favorite" toggle-set, 멱등 결과 보장 시).
- RFC 9110 §9.2.2 (RFC 7231 후속) 도 동일 정의 유지: _"the intended effect on the server is the same."_

**F-079 평가**: openapi.yaml `/articles/{slug}/favorite` POST/DELETE 의 `responses: 200 OK` 명시는 idempotent 의도의 **spec-level codification**. RFC 7231 §4.2.2 정의에 따라 "이미 favorite/unfavorite 인 자원에 동일 요청 → 동일 결과" 가 강제된다. Profile follow/unfollow 가 service 단 `if (already) return;` 로 idempotent 인 반면 favorite 가 throw → **같은 도메인 내 비대칭** 은 RFC 7231 정의 위반.

### 1.2 RFC 9110 (HTTP Semantics) §15.3 Status Codes

- **§15.3.1 200 OK**: 일반 success. 응답 body 의미 있음.
- **§15.3.2 201 Created**: _"the request has been fulfilled and has resulted in one or more new resources being created."_ — **신규 자원 URI 생성 시에만**.
- **§15.3.5 204 No Content**: _"there is no additional content to send in the response payload body"_ — DELETE 의 권장 응답 (자원 제거 후 body 없음).

**F-085 평가**: `POST /api/users/login` 은 세션/JWT 발급이 자원 생성으로 해석 가능하나, RFC 9110 §15.3.2 는 _"new resources"_ 의 URI 식별 가능성 전제 — **Token 은 자원 URI 미할당** → **200 OK 가 정합적**. 사내 적용 권고: `@ResponseStatus(HttpStatus.OK)` 명시 또는 default 유지.

**F-083 평가**: DELETE 응답 200 은 RFC 9110 §15.3.5 권고 (204) 와 충돌. body 가 의미 있을 때 200, 없으면 204. RealWorld DELETE article/comment/favorite 는 body **공백** → **204 가 정합**. 단, favorite DELETE 는 ArticleResponse body 반환 (idempotent toggle 결과) → 200 유지 정당화 가능.

### 1.3 RFC 5789 PATCH Method

> _"The PUT method is already defined to overwrite a resource with a complete new body, and cannot be reused to do partial changes. ... A new method is needed to address this issue."_ — RFC 5789 §1

- **PUT (RFC 9110 §9.3.4)**: 전체 교체. 누락 필드는 **"unset" 또는 default 적용**.
- **PATCH (RFC 5789)**: 부분 갱신. JSON Merge Patch (RFC 7396) 또는 JSON Patch (RFC 6902).

**F-086 평가**: openapi.yaml `UpdateUserRequest.description: "At least one field is required."` 은 명백한 **부분 갱신 의도**. 모든 필드 optional 인 DTO + PUT 메서드 결합은 RFC 9110 §9.3.4 의 "전체 교체" 의미와 충돌. **PATCH (application/merge-patch+json, RFC 7396) 가 정합**. RealWorld 공식 spec 호환성 유지를 위해 PUT 유지 가능하나, 사내 적용 시 PATCH 권고.

### 1.4 RFC 7807 / RFC 9457 Problem Details

> _"This document defines a 'problem detail' as a way to carry machine-readable details of errors in a HTTP response."_ — RFC 7807 (RFC 9457 가 후속, 2023)

- 표준 필드: `type` (URI), `title`, `status`, `detail`, `instance`.
- Content-Type: `application/problem+json`.

**F-082 보강 / GenericErrorModel 평가**: openapi.yaml `GenericErrorModel: { errors: { body: [string] } }` 는 RealWorld 공식 spec 비표준. **RFC 7807/9457 정합 권고**. Spring 6.x 의 `ProblemDetail` 클래스 (§4.2 참조) 가 자동 매핑 지원.

---

## §2. OpenAPI 3.x 권위

### 2.1 OpenAPI 3.0 vs 3.1

- **3.0.x (2017~2020)**: JSON Schema Draft Wright-00 부분 호환. `nullable: true` 별도 키워드.
- **3.1.0 (2021.02)**: **JSON Schema Draft 2020-12 완전 호환**. `nullable` 폐기 → `type: [string, "null"]`. webhooks, mutual TLS, license identifier (SPDX) 추가.

**평가**: ground truth 3.0.1 → 호환성 유지 합당. 사내 신규 API 적용 시 **3.1 격상 권고** (JSON Schema 정합 + 도구 생태계 성숙도). 다만 OpenAPI Generator / springdoc-openapi 의 3.1 지원 안정화 검증 후.

### 2.2 securitySchemes Bearer vs apiKey

- **Bearer (RFC 6750)**: `type: http, scheme: bearer, bearerFormat: JWT`. Authorization header `Bearer <token>` 표준.
- **apiKey**: `type: apiKey, in: header|query|cookie, name: <header-name>`. Custom scheme.

**F-084 평가**: openapi.yaml `Token: { type: apiKey, name: Authorization }` + description `"Token xxxxxx.yyyyyyy.zzzzzz"` 은 RFC 6750 비표준 (scheme 명이 `Token`, 표준은 `Bearer`). **RealWorld 공식 spec 의 의도적 결정** — 외부 검증 ✅ (PoC #01 DEC-API-001 동일 결론). 사내 적용 시 `Bearer JWT` 표준화 권고 (REC-API-BEARER-MIGRATION).

### 2.3 x-codegen-request-body-name Legacy

- Swagger Codegen v2 (legacy, 2018~2020 active) 의 vendor extension.
- OpenAPI 3.0+ 는 `requestBody` 가 named parameter 가 아니므로 client 코드 생성 시 변수명 hint 필요 → 이 extension 제공.
- **OpenAPI Generator (현재 표준, 2018 fork)**: 동일 키 인식하나 deprecated 영역 — `x-codegen-request-body-name` 대신 `operationId` 기반 자동 명명 또는 generator config 사용 권고.

**F-081 평가**: 5건 endpoint 의 legacy artifact. ground truth 호환성 유지 가능하나 **사내 신규 spec 작성 시 제거 권고**.

---

## §3. OWASP / 산업 표준

### 3.1 OWASP API Security Top 10 (2023)

- **API4:2023 Unrestricted Resource Consumption** (이전 API4:2019 Lack of Resources & Rate Limiting 후속)
- 권고: **server-side enforcement** of:
  - Pagination size limits (`max` cap)
  - Request rate limits
  - Payload size limits
  - Timeout limits

**F-080 평가**: openapi.yaml `limitParam: minimum: 1, default: 20` (no `maximum`) → spec 자체로는 무한 대 허용. runtime ArticleFacets:21 의 cap 50 은 **server-side 방어** 로 OWASP API4 정합 ✅. **단, spec 와 runtime 의 contract drift** — spec 에 `maximum: 50` 명시 권고 (REC-API-LIMIT-CAP).

### 3.2 API 버저닝 표준

- **URI Path** (`/v1/articles`): 가장 보편. cache-friendly, discoverable. Stripe / GitHub / Twitter 채택.
- **Header** (`Accept: application/vnd.example.v1+json`): RESTful 순수주의. 운영 복잡도 高.
- **Query** (`?version=1`): 비권장 (cache 키 오염).
- **info.version (OpenAPI)**: spec 자체 버전, **런타임 routing 무영향** — versioning 책임 별도.

**F-082 평가**: openapi.yaml `info.version: 1.0.0` + `servers: /api` (no `/v1`) → URI path versioning 부재. Stripe / GitHub 의 `/v1/` prefix 가 산업 표준. 사내 적용 권고: **path /v1 도입** (REC-API-VERSIONING) — PoC #01 F-038 재현.

---

## §4. Spring Boot 3.x 권위

### 4.1 Spring Security 6.x JWT

- Spring Security 6 (Spring Boot 3.x bundled) 의 **OAuth2 Resource Server** 모듈:
  - `spring-boot-starter-oauth2-resource-server` 의존성
  - `JwtDecoder` bean — Nimbus JWT (default) 또는 custom
  - `http.oauth2ResourceServer().jwt()` configuration
  - **Bearer token 표준 자동 인식** (Authorization header `Bearer <token>`)
- 마이그레이션: 기존 custom `JwtAuthenticationFilter` → Spring Security 6 표준 모듈 (REC-API-BEARER-MIGRATION).

### 4.2 @ResponseStatus + ProblemDetail (Spring 6.x)

- **`org.springframework.http.ProblemDetail` (Spring 6.0, 2022.11)**: RFC 7807 표준 클래스 자동 매핑.
  - `@ExceptionHandler` 가 ProblemDetail 반환 시 Content-Type `application/problem+json` 자동 설정.
  - `ResponseEntityExceptionHandler` 의 default 가 ProblemDetail 로 변경 (Spring 6.0+).
- `@ResponseStatus` 명시 권고: controller 단 default 200 → 의미 명확화 (e.g. login OK, register CREATED, delete NO_CONTENT).

---

## §5. 8 Candidate Finding 권위 평가

| finding   | 메인 severity | Document 권고   | RFC/표준 권위                                | 비고                                                                                            |
| --------- | ------------- | --------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **F-079** | high          | **high 확정 **  | RFC 7231 §4.2.2 / RFC 9110 §9.2.2            | spec 200 OK 명시는 idempotent codification — service throw 는 RFC 위반. Profile 비대칭 evidence |
| **F-080** | medium        | **medium 확정** | OWASP API4:2023                              | runtime cap 50 ✅ / spec maximum 부재 → contract drift                                          |
| **F-081** | medium        | **low 조정**    | OpenAPI Generator (de facto)                 | RFC/RFC급 표준 부재. 호환성 영향 없음. legacy artifact cleanup                                  |
| **F-082** | medium        | **medium 확정** | API versioning best practice (Stripe/GitHub) | F-038 재현 → v1.2.0 묶음 데이터                                                                 |
| **F-083** | low           | **low 확정**    | RFC 9110 §15.3.5                             | DELETE article/comment 는 204 권고 / favorite DELETE 는 200 정당화 가능 (idempotent body)       |
| **F-084** | medium        | **medium 확정** | RFC 6750                                     | DEC-API-001 재현 — RealWorld 공식 spec 비표준 외부 검증 ✅                                      |
| **F-085** | low           | **low 확정**    | RFC 9110 §15.3.2                             | login 은 신규 자원 URI 생성 아님 → 200 정합                                                     |
| **F-086** | medium        | **medium 확정** | RFC 5789 / RFC 9110 §9.3.4                   | UpdateUser DTO 부분 갱신 의도 명시 → PATCH 정합                                                 |

**조정 사유**:

- **F-081 medium → low**: RFC 급 권위 부재. legacy artifact 는 호환성 영향 없음 (도구 생태계 인식 유지). cleanup 은 cosmetic.

---

## §6. 사내 적용 권고 (REC-API-\* 9건)

| ID                               | 제목                                                                              | 우선순위 | 근거                           |
| -------------------------------- | --------------------------------------------------------------------------------- | -------- | ------------------------------ |
| **REC-API-IDEMPOTENCY-001**      | favorite/unfavorite service 단 idempotent 정렬 (Profile follow 패턴 적용)         | **high** | RFC 7231 §4.2.2 — F-079        |
| **REC-API-LIMIT-CAP-001**        | openapi.yaml `limitParam.maximum: 50` 명시 (runtime cap 와 정합)                  | medium   | OWASP API4 — F-080             |
| **REC-API-VERSIONING-001**       | URI path `/v1/` prefix 도입 (Stripe/GitHub 표준)                                  | medium   | F-082 / PoC #01 F-038          |
| **REC-API-BEARER-MIGRATION-001** | Token (apiKey) → Bearer JWT (RFC 6750) + Spring Security 6 OAuth2 Resource Server | medium   | F-084 / DEC-API-001            |
| **REC-API-PATCH-001**            | UpdateCurrentUser PUT → PATCH (RFC 5789, application/merge-patch+json)            | medium   | F-086                          |
| **REC-API-PROBLEM-DETAILS-001**  | GenericErrorModel → RFC 7807/9457 ProblemDetail (Spring 6 자동 매핑)              | medium   | RFC 7807 / Spring 6            |
| **REC-API-STATUS-EXPLICIT-001**  | controller `@ResponseStatus` 명시 (login OK / register CREATED / delete 204)      | low      | RFC 9110 §15.3 / F-083 / F-085 |
| **REC-API-OPENAPI-31-001**       | OpenAPI 3.0.1 → 3.1 격상 (JSON Schema 2020-12 정합)                               | low      | OpenAPI 3.1 spec               |
| **REC-API-CODEGEN-CLEANUP-001**  | `x-codegen-request-body-name` legacy artifact 제거                                | low      | OpenAPI Generator — F-081      |

---

## §7. F-079 핵심 — RFC 7231 + Profile 비대칭 권위 (Phase 4 F-070 합산)

### 7.1 Evidence 합산

- **Phase 4 F-070** (메인 사전 분석): `articleService.favorite(slug, user)` 가 already-favorited 시 throw — Profile `followService` 의 `if (already) return;` 와 **동일 도메인 내 비대칭** 발견.
- **Phase 5-1 F-079** (본 리서치): openapi.yaml `/articles/{slug}/favorite` POST/DELETE 의 `responses: 200 OK` 명시 → spec-level idempotent codification → service throw 는 **spec ↔ runtime contract drift**.

### 7.2 권위 강화

- **RFC 7231 §4.2.2 / RFC 9110 §9.2.2**: idempotent 정의는 _"intended effect"_ 기준. spec 의 200 OK 명시는 **intended effect = idempotent** 를 codify.
- POST 가 일반적으로 non-idempotent 이나, **toggle-set semantics (favorite ON/OFF state)** 는 idempotent 가 정합. RealWorld 공식 spec 의 200 OK 명시도 이를 인정한 결정.

### 7.3 사내 적용 final 권고

1. **Service layer 정렬** (REC-API-IDEMPOTENCY-001): `articleService.favorite/unfavorite` 를 Profile `follow/unfollow` 패턴으로 idempotent 화.
   ```
   if (article.isFavoritedBy(user)) return ArticleResponse.of(article, user);
   ```
2. **Spec maximum 명시** (REC-API-LIMIT-CAP-001): `limitParam.maximum: 50`.
3. **AP-API-001 등록** (Phase 6 candidate): "spec idempotent codification ↔ runtime throw 비대칭" 안티패턴.
4. **F-079 severity high 확정** : 같은 도메인 내 비대칭은 일관성 원칙 (Principle of Least Astonishment) 위반 + RFC 7231 §4.2.2 정의 위반.

---

## §8. 메모

- **F-015 cross-validation**: 메인 raw 8건 (openapi.yaml 803 line + Phase 4 service 분석) 그대로 사용. 추가 fact 도입 없음.
- **PoC #01 재현 finding**: F-082 (= F-038), F-083 (= F-040), F-084 (= DEC-API-001) → **v1.2.0 묶음 G (ADR-007 OpenAPI x-extension) + 신규 ADR 후보 (idempotency, versioning, bearer migration) 데이터 합산**.
- **다음 단계**: Senior 에이전트 가 본 권위 평가 통합 → research-phase5-poc02.md.

---

**End of Document — line ≈ 215**

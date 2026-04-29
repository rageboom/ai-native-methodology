# Senior — PoC #02 Phase 5-1 실무 cross-check

> **Method**: 5 우선순위 파일 read (openapi.yaml + 2 controller + domain.json + rules.json) → cross-check.
> **F-015**: 메인 raw 8건 그대로 검증, 신규 fact 도입 없음.

---

## §1. F-015 cross-check 결과 (메인 8 candidate raw 검증)

| ID | 메인 raw 사실 | Senior 검증 | 결정 |
|---|---|---|---|
| **F-079** | favorite spec 200 OK / runtime throw IllegalArgumentException | ✅ openapi.yaml:380 (200 SingleArticle) + ArticleService.java:184-204 (BR-ARTICLE-FAVORITE-NON-IDEMPOTENT-001 throw) — **spec ↔ runtime 비대칭 confirmed** | **격상 high → critical** (§3 참조) |
| **F-080** | openapi `limit` minimum:1, **max cap 없음** vs ArticleFacets:21 cap 50 | ✅ openapi.yaml:784-792 (minimum 1 / default 20 / **maximum 부재**) + Phase 4 BR-PAGINATION-SIZE-CAP-50-001 evidence ArticleFacets:21-23 — **spec 미명시 / runtime 50 cap** | **medium 유지** (OWASP API4) |
| **F-081** | x-codegen-request-body-name legacy | ✅ openapi.yaml:38, 52, 86, 223, 267, 335 (6 회 등장) — Swagger 2.0 → 3.0 마이그레이션 잔재 | **medium → low** 강등 (functional 영향 0, 단순 cleanup) |
| **F-082** | API 버저닝 부재 | ✅ servers `/api` 단일 — version segment / Accept header version 부재. PoC #01 F-038 재현 | **medium 유지** (수정 비용 high) |
| **F-083** | DELETE 200 (RFC 9110 권고 204) | ✅ openapi.yaml:282 (DeleteArticle 200 EmptyOk), :357 (DeleteArticleComment 200 EmptyOk), :144 (Unfollow 200 ProfileResponse), :402 (Unfavorite 200 SingleArticle). **단 Unfollow/Unfavorite 는 body 반환 → 200 정당화**, **DeleteArticle/DeleteArticleComment 만 RFC 9110 §15.3.5 권고 204 위반** | **low 유지** (의미적, 부분 적용) |
| **F-084** | Token security RFC 6750 비표준 | ✅ openapi.yaml:793-803 — `type: apiKey` + `name: Authorization` + 헤더 형식 `Token xxxxxx.yyyyy.zzzzz` (Bearer 가 아닌 **Token 스킴**). RFC 6750 Bearer 위반 / **단 RealWorld 공식 spec** | **medium 유지** (외부 spec 정합 — spec 자체 문제) |
| **F-085** | POST /users/login `@ResponseStatus(CREATED)` | ✅ UserController.java:54 (`@ResponseStatus(HttpStatus.CREATED)` + LOGIN_URL `/api/users/login`). login 은 신규 자원 X — 200 정상. **단 spec openapi.yaml:32 은 200** → spec ↔ runtime 비대칭 (F-079 패턴 동형) | **low → medium** 격상 검토 (§3 패턴) |
| **F-086** | PUT /user 부분 갱신 → PATCH 권고 | ✅ UserController.java:73 PutMapping + UpdateUser schema (openapi:468-480) **all-optional** (required 부재) — RFC 5789 PATCH semantics 부합 | **medium 유지** |

**핵심 발견**: F-085 도 F-079 와 동형 패턴 (spec/runtime status code 비대칭). 두 건 합치면 **신뢰성 결함이 패턴화** — Phase 6 AP candidate 신규 등록 권고.

---

## §2. Phase 4 산출 cross-validation

### 2.1 domain.json UC 25 ↔ openapi.yaml 19 op 매핑

| operationId | UC | 매핑 | 비고 |
|---|---|---|---|
| Login | UC-USER-LOGIN | ✅ | UserController.login |
| CreateUser | UC-USER-SIGNUP | ✅ | F-058 TOCTOU caveat |
| GetCurrentUser | UC-USER-GET-BY-ID | ✅ | actorsToken.userId |
| UpdateCurrentUser | UC-USER-UPDATE-DETAILS | ✅ | F-071 caveat |
| GetProfileByUsername | UC-USER-GET-BY-USERNAME + UC-FOLLOW-IS-FOLLOWING | ✅ (복합) | 2 UC 합성 |
| FollowUserByUsername | UC-FOLLOW | ✅ | RFC 7231 idempotent ✅ |
| UnfollowUserByUsername | UC-UNFOLLOW | ✅ | RFC 7231 idempotent ✅ |
| GetArticlesFeed | UC-ARTICLE-FEED | ✅ | |
| GetArticles | UC-ARTICLE-LIST + UC-ARTICLE-LIST-AUTHENTICATED | ✅ (overload) | auth optional |
| CreateArticle | UC-ARTICLE-WRITE | ✅ | F-052 caveat |
| GetArticle | UC-ARTICLE-GET + UC-ARTICLE-DETAILS | ✅ (복합) | getArticleDetails 합성 |
| UpdateArticle | UC-ARTICLE-EDIT-TITLE + UC-ARTICLE-EDIT-DESCRIPTION + UC-ARTICLE-EDIT-CONTENT | ✅ (3 UC) | partial update — F-086 |
| DeleteArticle | UC-ARTICLE-DELETE | ✅ | F-072/F-073 caveat |
| GetArticleComments | UC-COMMENT-LIST | ✅ | |
| CreateArticleComment | UC-COMMENT-WRITE | ✅ | |
| DeleteArticleComment | UC-COMMENT-DELETE | ✅ | UC-COMMENT-GET 미노출 (내부) |
| CreateArticleFavorite | UC-ARTICLE-FAVORITE | ✅ | **F-070/F-079** ★ |
| DeleteArticleFavorite | UC-ARTICLE-UNFAVORITE | ✅ | **F-070/F-079** ★ |
| GetTags | UC-TAG-LIST | ✅ | @Cacheable |

**system_internal 잔존 검증**: UC 25 중 endpoint 미노출 = **UC-ARTICLE-IS-FAVORITE + UC-COMMENT-GET = 2 건** (정당한 internal helper). PoC #01 F-035 패턴 (system_internal 오분류) **비재현 ✅** — Phase 4 분류 정합.

**복합 매핑 5건**: GetProfileByUsername / GetArticles / GetArticle / UpdateArticle (3 UC 합성). **F-076 (api-extension `composes_uc[]` field 추천)** 의 정당화 evidence 확보.

### 2.2 rules.json BR 14 ↔ endpoint 매핑

| BR | category | endpoint | 검증 |
|---|---|---|---|
| BR-USER-EMAIL-UNIQUE-001 | validation | CreateUser (POST /users) | ✅ |
| BR-USER-USERNAME-UNIQUE-001 | validation | CreateUser, UpdateCurrentUser | ✅ |
| BR-USER-PASSWORD-ENCRYPTED-001 | policy | CreateUser, UpdateCurrentUser | ✅ |
| BR-USER-FOLLOW-DIRECTIONAL-001 | policy | FollowUserByUsername | ✅ |
| BR-USER-FOLLOW-IDEMPOTENT-001 | policy | FollowUserByUsername | ✅ RFC 7231 |
| BR-USER-FOLLOW-NO-SELF-001 | policy | FollowUserByUsername | ⚠️ F-074 코드 부재 |
| BR-ARTICLE-TITLE-UNIQUE-001 | validation | CreateArticle, UpdateArticle | ⚠️ F-052 over-constraint |
| BR-ARTICLE-SLUG-UNIQUE-001 | validation | CreateArticle (slug auto) | ✅ |
| BR-ARTICLE-AUTHOR-EDIT-ONLY-001 | authorization | UpdateArticle, DeleteArticle | ✅ |
| BR-ARTICLE-FAVORITE-NON-IDEMPOTENT-001 | policy | CreateArticleFavorite, DeleteArticleFavorite | ❌ **F-070/F-079** RFC 위반 |
| BR-COMMENT-AUTHOR-DELETE-ONLY-001 | authorization | DeleteArticleComment | ✅ |
| BR-LOGIN-EMAIL-PASSWORD-MATCH-001 | authorization | Login | ✅ |
| BR-PAGINATION-SIZE-CAP-50-001 | validation | GetArticles, GetArticlesFeed | ⚠️ **F-080** spec 미명시 |
| BR-PAGINATION-PAGE-ZERO-BASED-001 | validation | GetArticles, GetArticlesFeed | ⚠️ **F-080** spec 미명시 |

**14/14 매핑 성공** — Phase 4 BR 누락 0건. **단 BR 4건 (FOLLOW-NO-SELF / TITLE / FAVORITE / PAGINATION 2건) 가 spec 미명시 또는 RFC 위반** — Phase 5-1 산출의 `api-extension.json` 에 명시적 캡처 필요.

### 2.3 PoC #01 F-035 패턴 (UC system_internal 오분류) 재현 가능성

**비재현 ✅**. PoC #02 domain.json UC 25 중 internal 2건 (UC-ARTICLE-IS-FAVORITE / UC-COMMENT-GET) 모두 정당. Phase 4 분류 정합. **PoC #01 cross-validation 패턴 학습 효과 입증**.

---

## §3. F-070 + F-079 evidence 합산 (★ 핵심)

| 차원 | F-070 (Phase 4) | F-079 (Phase 5-1 신규) |
|---|---|---|
| 발견 위치 | ArticleService.java:184-204 (runtime throw) | openapi.yaml:380, 402 (spec 200 OK) |
| 표준 위반 | RFC 7231 §4.2.2 idempotent (DELETE MUST) | OpenAPI ↔ runtime 비대칭 |
| severity (단독) | high | high |
| **합산 평가** | **critical 격상 권고** | F-070 의 evidence 보강 |

**정당화**:
1. **이중 결함**: 도메인 규칙 (RFC 7231) 위반 **+** spec/runtime drift = 클라이언트 신뢰 이중 손상
2. **클라이언트 영향**: 정상 클라이언트가 spec 따라 200 기대 → 422 GenericError 수신 → DLQ/retry storm
3. **PoC #01 비재현 신규 결함**: PoC #01 favorite 미발견 → PoC #02 Hexagonal 도입 부산물 가능성
4. **Phase 6 AP-API-001 critical** 후보 강력 추천

**권고**: F-070 severity high → **critical 격상**. F-079 는 F-070 evidence 합산 묶음으로 처리 (별도 finding 보다 묶음 효율).

---

## §4. 19 operation 별 권고

| operationId | severity | 영향 | 수정 비용 | 권고 |
|---|---|---|---|---|
| Login | medium | F-085 status 비대칭 | low | spec/runtime 200 통일 |
| CreateUser | low | TOCTOU race (F-058) | low | DB UQ 의존 (현재 OK) |
| GetCurrentUser | low | - | - | OK |
| UpdateCurrentUser | medium | F-086 PUT vs PATCH | medium | PATCH 마이그레이션 (BC 주의) |
| GetProfileByUsername | low | 복합 UC 매핑 | low | api-extension `composes_uc[]` |
| FollowUserByUsername | medium | F-074 self-follow 미차단 | low | guard clause 추가 |
| UnfollowUserByUsername | low | RFC ✅ | - | OK |
| GetArticlesFeed | medium | F-080 limit max 미명시 | low | openapi `maximum: 50` |
| GetArticles | medium | F-080 동일 | low | 상동 |
| CreateArticle | high | F-052 title unique | medium | DB UQ 제거 권고 |
| GetArticle | low | - | - | OK |
| UpdateArticle | medium | F-086 PATCH | medium | PATCH + 3 UC 명시 |
| DeleteArticle | low | F-083 204, F-072/F-073 | low | 204 변경 + CASCADE |
| GetArticleComments | low | - | - | OK |
| CreateArticleComment | low | - | - | OK |
| DeleteArticleComment | low | F-083 204 | low | 204 변경 |
| **CreateArticleFavorite** | **critical** | **F-070/F-079** | high | idempotent 보장 (Set 의미론) |
| **DeleteArticleFavorite** | **critical** | **F-070/F-079** | high | 상동 |
| GetTags | low | - | - | OK |

---

## §5. 신규 발견 (Senior 실무 우선)

### 5.1 Hexagonal port-adapter 의 API 영향 — **API 단 부재 ✅ + 신규 발견**
- API controller (UserController/ArticleFavoriteController) 는 `service` 의존만 → port-adapter 위반 (F-071) 의 API 단 영향 0.
- **단 ArticleFavoriteController.java:23-28 의 service 3 호출** (`getUser` + `getArticle` + `favorite` + `getArticleDetails`) → orchestration 이 controller 단으로 누수. **API-LEVEL ANTI-PATTERN candidate** — Use Case Service 부재 (Application Service Pattern 미적용).

### 5.2 Spring Boot 3.x / Java 21 record 활용
- UserController.java:38-52 **ModelAndView redirect** (signup → login) — 흥미로운 패턴이지만 **internal redirect 가 클라이언트 visible** (TEMPORARY_REDIRECT 307). REST 원칙상 권장 X. **신규 finding F-087 medium** 후보.
- request DTO 가 record 인지 미확인 — Java 21 record 활용 권고.

### 5.3 Token security 헤더 형식
- `Token xxxxxx.yyyyy.zzzzz` (Bearer 아님) — RealWorld spec 정합이지만 **JwtTokenFilter 가 "Token " prefix 파싱** 가정 → 표준 Bearer 도입 시 client BC 깨짐. F-084 + F-082 묶음 (versioning + auth 동반 마이그레이션 권고).

### 5.4 OpenAPI 3.0.1 → 3.1 미상향
- OAS 3.1 (JSON Schema 2020-12 정합) 미사용. springdoc-openapi 2.x 는 3.1 지원. **마이너 권고** (low).

---

## §6. 8 candidate severity 평가 (Senior 권고)

| finding | 메인 | Senior 권고 | 사유 |
|---|---|---|---|
| F-079 | high | **F-070 묶음 (critical 격상)** | spec/runtime 비대칭 + RFC 7231 이중 결함. F-070 의 evidence 보강 |
| F-080 | medium | **medium 유지** | OWASP API4 unrestricted resource consumption. 단 runtime cap 50 존재 → DoS 실제 영향 제한적 |
| F-081 | medium | **low 강등** | x-codegen-request-body-name = swagger-codegen 2.x 잔재. functional 영향 0. 단순 cleanup |
| F-082 | medium | **medium 유지** | versioning 부재 = 향후 BC 깨짐 cost. 수정 비용 high (URL 변경 / Accept 헤더) |
| F-083 | low | **low 유지** | RFC 9110 §15.3.5 "SHOULD" (MUST 아님). 단 DeleteArticle/Comment 만 적용 (Unfollow/Unfavorite 는 body 반환으로 200 정당) |
| F-084 | medium | **medium 유지** | RealWorld 공식 spec → 외부 검증. RFC 6750 Bearer 가 표준이지만 spec 따름 |
| F-085 | low | **medium 격상** | F-079 와 동형 패턴 (spec 200 / runtime 201 — login is NOT resource creation). HTTP semantic 위반 |
| F-086 | medium | **medium 유지** | PATCH 마이그레이션 표준이지만 BC 깨짐. UpdateArticle 도 동일 패턴 (3 UC composite) |

**격상**: F-079 (F-070 묶음 critical) / F-085 (low → medium)
**강등**: F-081 (medium → low)
**유지**: F-080 / F-082 / F-083 / F-084 / F-086 (5건)

---

## §7. Phase 6 AP candidate 예고

| ID | severity | 패턴 | evidence |
|---|---|---|---|
| **AP-API-001** | **critical** | spec/runtime status code drift (F-070 + F-079 + F-085 묶음) | favorite + login |
| AP-API-002 | medium | DELETE 200 instead of 204 (RFC 9110 §15.3.5) | F-083 |
| AP-API-003 | medium | API versioning 부재 — backward compatibility 미보장 | F-082 |
| AP-API-004 | medium | unrestricted limit max — OWASP API4 | F-080 |
| AP-API-005 | medium | full PUT instead of PATCH for partial update | F-086 (UpdateUser + UpdateArticle) |
| AP-API-006 | medium | controller 단 multi-service orchestration (Application Service 부재) | ArticleFavoriteController:23-28 (신규 §5.1) |
| AP-API-007 | low | x-codegen-request-body-name swagger 2.x 잔재 | F-081 |
| AP-API-008 | medium | server-side internal redirect leaked to client (signup → login 307) | UserController:49-51 (신규 §5.2) |

**Phase 6 합산 시**: 신규 AP **8건** 후보 (Phase 4 의 6 AP candidate + Phase 5-1 의 8 = 14 후보, 격상 협의 필요).

---

## §8. 산출 작성 권고

**ground truth `openapi.yaml` 그대로 채택 + 보강 권고** (PoC #01 패턴과 동형):

1. **`openapi.yaml` 복사** (정정 0 — ground truth 우선) → `output/api/openapi.yaml`
2. **`api-extension.json` 신설** — methodology v1.1.2 ADR-007 (PoC #01 promoted G 묶음) 정합
   - `operations[]` × 19 (operationId, composes_uc[], breaks_br[], anti_pattern_refs[], spec_runtime_drift{}, recommended_severity)
   - **5 복합 매핑** (GetProfileByUsername / GetArticles / GetArticle / UpdateArticle) `composes_uc[]` ≥ 2 캡처
   - **F-070/F-079 묶음** spec_runtime_drift 명시 (spec_status: 200, runtime_status: 422)
3. **`api.md` 작성** — 19 op × severity heatmap + 8 신규 AP candidate 표 + Phase 4 BR 14 매핑
4. **`_manifest.yml`** — raw_confidence 0.92 추정 (PoC #01 0.93 와 동급, F-070 격상으로 +0.01 예상치 낮춤)

**산출 자체 작성 (LLM gen) 회피 권고**: ground truth 가 명료하게 존재 (803 line / 19 op / 6 tag). LLM 재작성은 hallucination 리스크 — **메인이 직접 복사 + 보강 노트만 첨부** (F-015 cross-check 패턴 적용).

---

**Senior 결론**: F-079 단독 high 가 아닌 **F-070 묶음 critical** 격상이 핵심. PoC #02 의 가장 큰 발견은 **spec/runtime drift 패턴화** (F-079 + F-085 동형) — Phase 6 AP-API-001 critical 등록 강력 권고. 산출은 ground truth 그대로 + api-extension.json 보강이 최적.

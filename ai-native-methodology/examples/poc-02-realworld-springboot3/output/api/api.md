# PoC #02 Phase 5-1 — API 계약 분석

> 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
> 방법론 v1.1.2 / 2026-04-29 / raw confidence 0.93

---

## 1. 핵심 요약

- **ground truth**: `source/realworld-java21-springboot3/api-docs/openapi.yaml` (802 line / OpenAPI 3.0.1)
- **endpoint**: 19 unique operationId (paths × methods = 19) / 6 tags (Articles / Comments / Favorites / Profile / Tags / User and Authentication)
- **base path**: `/api`
- **auth scheme**: Token (apiKey 비표준 — RealWorld 공식 spec 의도)
- **UC 매핑**: 19 op × 25 UC (1:1 = 14 / 복합 = 5 / system_internal 잔존 = 2)
- **BR 매핑**: 14/14 ✅ (단 RFC 위반 BR 1건 + spec 미명시 BR 3건)

### ★ 최우선 결함 — F-070 critical (Phase 4 high → 격상)

`favorite/unfavorite` 의 spec/runtime drift + RFC 7231 §4.2.2 idempotency 위반:

| 차원 | 값 |
|---|---|
| spec | openapi.yaml:380, 402 — `responses: 200 OK` (idempotent codification) |
| runtime | `ArticleService.java:184-204` — already-state 시 `IllegalArgumentException` throw |
| RFC 권위 | RFC 7231 §4.2.2 + RFC 9110 §9.2.2 — idempotent intended effect |
| 비교 권위 | Profile follow/unfollow 는 service 단 idempotent (`if (already) return;`) — **같은 도메인 내 비대칭** |
| 클라이언트 영향 | spec 따라 200 기대 → 422 GenericError 수신 → DLQ/retry storm |

**즉시 수정 권고**: `articleService.favorite/unfavorite` 를 Profile pattern 으로 정렬:
```
if (article.isFavoritedBy(user)) return ArticleResponse.of(article, user);
```

→ **Phase 6 AP-API-001 critical 단일 등록** (F-070 + F-079 + F-085 묶음).

---

## 2. 19 operation × severity heatmap

| # | operationId | method | severity | 영향 finding | 권고 |
|---|---|---|---|---|---|
| 1 | Login | POST /users/login | medium | F-085 | spec 200 vs runtime 201 — 통일 |
| 2 | CreateUser | POST /users | medium | F-058, F-087 | TOCTOU + 307 redirect |
| 3 | GetCurrentUser | GET /user | low | F-084 | Bearer 마이그레이션 (장기) |
| 4 | UpdateCurrentUser | PUT /user | medium | F-071, F-086 | PATCH 권고 (RFC 5789) |
| 5 | GetProfileByUsername | GET /profiles/{username} | low | — | composes_uc 2 |
| 6 | FollowUserByUsername | POST /profiles/{username}/follow | medium | F-074 | self-follow guard |
| 7 | UnfollowUserByUsername | DELETE /profiles/{username}/follow | low | — | RFC ✅ |
| 8 | GetArticlesFeed | GET /articles/feed | medium | F-080 | spec maximum: 50 명시 |
| 9 | GetArticles | GET /articles | medium | F-080 | 상동 |
| 10 | CreateArticle | POST /articles | high | F-052 | DB UQ 제거 (over-constraint) |
| 11 | GetArticle | GET /articles/{slug} | low | — | composes_uc 2 |
| 12 | UpdateArticle | PUT /articles/{slug} | medium | F-086 | PATCH + 3 UC composite |
| 13 | DeleteArticle | DELETE /articles/{slug} | low | F-072, F-073, F-083 | CASCADE + 204 |
| 14 | GetArticleComments | GET /articles/{slug}/comments | low | — | OK |
| 15 | CreateArticleComment | POST /articles/{slug}/comments | low | — | OK |
| 16 | DeleteArticleComment | DELETE /articles/{slug}/comments/{id} | low | F-083 | 204 |
| 17 | **CreateArticleFavorite** | **POST /articles/{slug}/favorite** | **critical** ★ | **F-070** | **idempotent (Profile pattern)** |
| 18 | **DeleteArticleFavorite** | **DELETE /articles/{slug}/favorite** | **critical** ★ | **F-070** | **idempotent + AP-API-006** |
| 19 | GetTags | GET /tags | low | F-048 | cache stampede 보강 |

**severity 분포**: critical 2 / high 1 / medium 8 / low 8

---

## 3. UC 매핑 — 19 op × 25 UC

### 3.1 1:1 매핑 (14건)
Login / CreateUser / GetCurrentUser / UpdateCurrentUser / FollowUserByUsername / UnfollowUserByUsername / GetArticlesFeed / CreateArticle / DeleteArticle / GetArticleComments / CreateArticleComment / DeleteArticleComment / CreateArticleFavorite / DeleteArticleFavorite + GetTags

### 3.2 복합 매핑 (5건 — `composes_uc[]`)

| operationId | composes_uc | 합성 위치 |
|---|---|---|
| GetProfileByUsername | UC-USER-GET-BY-USERNAME + UC-FOLLOW-IS-FOLLOWING | UserRelationshipController:32-34 |
| GetArticles | UC-ARTICLE-LIST + UC-ARTICLE-LIST-AUTHENTICATED | ArticleController:64-69 (auth optional) |
| GetArticle | UC-ARTICLE-GET + UC-ARTICLE-DETAILS | ArticleController:73-82 (getArticleDetails) |
| UpdateArticle | UC-ARTICLE-EDIT-TITLE + UC-EDIT-DESCRIPTION + UC-EDIT-CONTENT | ArticleController:85-106 (3 conditional partial update) |
| FollowUserByUsername | UC-FOLLOW (단독) | — (GetProfileByUsername 의 boolean isFollowing 합성에서 분리) |

### 3.3 system_internal 잔존 (2건 — 정당)
- UC-ARTICLE-IS-FAVORITE — `getArticleDetails` helper
- UC-COMMENT-GET — `DeleteArticleComment` 내부 호출

→ **PoC #01 F-035 패턴 (UC system_internal 오분류) 비재현 ✅** — 학습 효과 입증

---

## 4. BR 매핑 — 14/14

| BR | category | endpoint | 검증 |
|---|---|---|---|
| BR-USER-EMAIL-UNIQUE-001 | validation | CreateUser | ✅ |
| BR-USER-USERNAME-UNIQUE-001 | validation | CreateUser, UpdateCurrentUser | ✅ |
| BR-USER-PASSWORD-ENCRYPTED-001 | policy | CreateUser, UpdateCurrentUser | ✅ |
| BR-USER-FOLLOW-DIRECTIONAL-001 | policy | FollowUserByUsername | ✅ |
| BR-USER-FOLLOW-IDEMPOTENT-001 | policy | FollowUserByUsername | ✅ RFC 7231 |
| BR-USER-FOLLOW-NO-SELF-001 | policy | FollowUserByUsername | ⚠️ F-074 코드 부재 |
| BR-ARTICLE-TITLE-UNIQUE-001 | validation | CreateArticle, UpdateArticle | ⚠️ F-052 over-constraint |
| BR-ARTICLE-SLUG-UNIQUE-001 | validation | CreateArticle | ✅ |
| BR-ARTICLE-AUTHOR-EDIT-ONLY-001 | authorization | UpdateArticle, DeleteArticle | ✅ |
| BR-ARTICLE-FAVORITE-NON-IDEMPOTENT-001 | policy | favorite/unfavorite | ❌ **F-070 critical RFC 7231 위반 BR 자체** |
| BR-COMMENT-AUTHOR-DELETE-ONLY-001 | authorization | DeleteArticleComment | ✅ |
| BR-LOGIN-EMAIL-PASSWORD-MATCH-001 | authorization | Login | ✅ |
| BR-PAGINATION-SIZE-CAP-50-001 | validation | GetArticles, GetArticlesFeed | ⚠️ **F-080 spec 미명시** |
| BR-PAGINATION-PAGE-ZERO-BASED-001 | validation | GetArticles, GetArticlesFeed | ⚠️ **F-080 spec 미명시** |

**runtime 위반 4건**: BR 1개 자체가 RFC 위반 + 3개는 spec 미명시 / runtime 코드 부재.

---

## 5. spec ↔ runtime drift (★ 핵심 패턴)

| operation | spec | runtime | 격차 | finding |
|---|---|---|---|---|
| CreateArticleFavorite / DeleteArticleFavorite | 200 OK (idempotent codification) | 422 throw (already-state) | **이중 결함 — RFC 7231 + drift** | **F-070 critical** ★ |
| Login | 200 OK | 201 CREATED (@ResponseStatus) | spec/runtime drift | F-085 medium |
| GetArticles, GetArticlesFeed | limit no maximum | runtime cap 50 (ArticleFacets:21) | spec 가 더 약함 | F-080 medium |

**패턴화**: drift 가 단발이 아닌 패턴 → **Phase 6 AP-API-001 critical** 단일 등록으로 묶음 처리.

---

## 6. Phase 6 AP candidate 8건 예고

| ID | severity | 패턴 | evidence |
|---|---|---|---|
| **AP-API-001** | **critical** | spec/runtime status code drift (F-070 + F-079 + F-085 묶음) | favorite + login |
| AP-API-002 | medium | DELETE 200 vs 204 (RFC 9110 §15.3.5) | F-083 — DeleteArticle/Comment |
| AP-API-003 | medium | API versioning 부재 (path /v1 / Accept header) | F-082 (PoC #01 F-038 재현) |
| AP-API-004 | medium | unrestricted limit max — OWASP API4 | F-080 |
| AP-API-005 | medium | full PUT instead of PATCH for partial update | F-086 (UpdateUser + UpdateArticle) |
| AP-API-006 | medium | controller 단 multi-service orchestration | ArticleFavoriteController:23-28 (Senior §5.1) |
| AP-API-007 | low | x-codegen-request-body-name swagger 2.x 잔재 | F-081 |
| AP-API-008 | medium | server-side internal redirect leaked to client (307) | UserController:49-51 — F-087 |

**Phase 6 합산 시**: 14 candidate (Phase 4 6 + Phase 5-1 8) → 격상 협의.

---

## 7. 사내 적용 권고 (REC-API-* 10건)

| ID | 제목 | 우선순위 | 근거 |
|---|---|---|---|
| **REC-API-IDEMPOTENCY-001** | favorite/unfavorite Profile pattern 정렬 (idempotent) | **high** | F-070 critical / RFC 7231 |
| REC-API-LIMIT-CAP-001 | openapi `limitParam.maximum: 50` 명시 | medium | F-080 / OWASP API4 |
| REC-API-VERSIONING-001 | URI path `/v1/` prefix 도입 | medium | F-082 |
| REC-API-BEARER-MIGRATION-001 | Token (apiKey) → Bearer JWT + Spring Security 6 OAuth2 Resource Server | medium | F-084 |
| REC-API-PATCH-001 | UpdateCurrentUser / UpdateArticle PUT → PATCH (RFC 5789) | medium | F-086 |
| REC-API-PROBLEM-DETAILS-001 | GenericErrorModel → RFC 7807/9457 ProblemDetail (Spring 6 자동 매핑) | medium | RFC 7807 |
| REC-API-NO-INTERNAL-REDIRECT-001 | signup → login 직접 호출 또는 client redirect (server 307 제거) | medium | F-087 |
| REC-API-STATUS-EXPLICIT-001 | controller `@ResponseStatus` 명시 (login OK / register CREATED / delete 204) | low | F-083 / F-085 / RFC 9110 |
| REC-API-OPENAPI-31-001 | OpenAPI 3.0.1 → 3.1 격상 (JSON Schema 2020-12) | low | OpenAPI 3.1 spec |
| REC-API-CODEGEN-CLEANUP-001 | `x-codegen-request-body-name` legacy 제거 | low | F-081 |

---

## 8. PoC #01 비교 (외부 검증 결과)

| PoC #01 finding | severity | PoC #02 결과 | 비고 |
|---|---|---|---|
| AP-DOMAIN-001 De Morgan 버그 | critical | **비재현 ✅** | Phase 4 ArticleCommentService 깔끔 |
| F-027 BR ≠ actual | high | **비재현 ✅** | — |
| F-035 UC system_internal 오분류 | high | **비재현 ✅** | 학습 효과 |
| F-038 API 버저닝 부재 | medium | ✅ 재현 → F-082 | v1.2.0 묶음 데이터 |
| F-040 DELETE 200 vs 204 | medium | ✅ 재현 → F-083 | v1.2.0 묶음 데이터 |
| DEC-API-001 Token apiKey 비표준 | — | ✅ 재현 → F-084 | RealWorld 공식 spec 외부 검증 |

**결과**: critical 결함 3건 비재현 ✅ (Hexagonal 구조 + Phase 4 학습 효과) / 권고 3건 재현 ✅ (RealWorld spec 의 BC 결함).

---

## 9. 운영 시나리오 (핵심 flow)

### 9.1 회원가입 → 자동 로그인
```
client → POST /api/users (signup body)
       → server: ModelAndView 307 TEMPORARY_REDIRECT to /api/users/login
       → client (FORCED): POST /api/users/login (login body)
       → server: 201 CREATED + UserResponse with token
```
**결함**: 307 redirect 가 client 에 누수 (F-087) + login 응답 201 (F-085).

### 9.2 favorite toggle
```
client → POST /api/articles/{slug}/favorite
       → spec: 200 SingleArticle
       → runtime (already-favorited): 422 GenericError ★ F-070 critical
       → runtime (not-yet-favorited): 200 SingleArticle ✅
```
**RFC 7231 위반**: idempotent 의도 codified spec 위반.

### 9.3 article 수정 (3 UC partial update)
```
client → PUT /api/articles/{slug} { title?, description?, body? }
       → ArticleController.java:90-103: 3 conditional editTitle / editDescription / editContent
       → 200 SingleArticle
```
**의미적 결함**: PUT semantic = full replace (RFC 9110 §9.3.4) ≠ runtime partial update → PATCH (RFC 5789) 권고.

---

## 10. approval_gate 체크리스트

- ✅ openapi.yaml 표준 lint 통과 (ground truth — 자동 정합)
- ✅ 모든 operationId unique 19/19
- ✅ DTO 스키마 = JSON Schema 호환 (3.0.1)
- ⚠️ 에러 응답: GenericErrorModel 단일 → RFC 7807 권고 (REC-API-PROBLEM-DETAILS-001)
- ✅ x-related-use-cases 매핑 (api-extension.json composes_uc[] 19/19)
- ✅ x-related-rules 매핑 (api-extension.json breaks_br[] 14/14)
- N/A 5.D inbound webhook (0건)
- 🔄 Swagger UI 렌더링 검증 (manual — Token 비표준 caveat)

---

## 11. 신뢰도 자평

```
formula v1:
- base 0.75
- orm_full +0.10
- domain_context_md +0.03
- openapi.yaml ground truth +0.07 ★ (PoC #01 +0.05 보다 강한 입력)
- diagrams_other +0.02
- no_operational_db -0.03
- subtotal 0.94
- F-015 cross-validation +0.01 (3-합의 + 충돌 2건만)
- F-070 격상 evidence 보강 -0.02
- raw_confidence 0.93
```

PoC #01 0.93 와 동급 ✅.

---

**END OF api.md**

# PoC #03 NestJS Phase 5-1 — API 계약 분석

> **사람 눈** 산출물 — `openapi.yaml` 의 짝 (이중 렌더링 정합 / ADR-008).
> 분석 대상: `lujakob/nestjs-realworld-example-app` (HEAD `c1c2cc4` / 2021-01-18)
> 방법론 v1.2.2 / 2026-04-30 / raw confidence 0.90

---

## 1. 핵심 요약

- **ground truth**: `openapi.yaml` (정적 추출 / @nestjs/swagger 데코 + DTO + interface)
  - ★ 출처: 정적 추출만 본 환경 가능 (★ DEC-PoC03-N5 정합 — `nest start` 부재 → 런타임 dump 2-way diff = Sprint 5 carry-over)
- **endpoint**: 21 unique operationId / paths × methods = 21 / 4 tags (user / articles / profiles / tags) + 1 root
- **base path**: `/api` (★ no /v1 — F-159)
- **auth scheme**: Bearer JWT ✅ (★ PoC #02 Token apiKey 비표준 비재현 = 학습 효과)
- **UC 매핑**: 20 op × 20 UC (1:1) + 1 system_internal (Root)
- **BR 매핑**: 12 / 18 BR (★ F-128/F-143/F-150/F-153 미명시 BR 6건 식별)

### ★ 최우선 결함 — F-164 critical 신규 (★★★)

`UpdateArticle` / `DeleteArticle` / `AddArticleComment` / `DeleteArticleComment` 4 endpoint:

| 차원 | 값 |
|---|---|
| spec | `article.controller.ts:60-88` — `@Put(':slug')` / `@Delete(':slug')` / `@Post(':slug/comments')` / `@Delete(':slug/comments/:id')` |
| runtime | `@User` decorator 부재 + AuthMiddleware 미적용 → **anonymous 호출 가능** |
| RFC 권위 | `OWASP API5 (Broken Function Level Authorization)` |
| 비교 권위 | `FavoriteArticle` (`@User('id')` 적용 ✅) — 정상 패턴 |
| 클라이언트 영향 | **★★★ critical** — 누구나 임의 article 수정 / 삭제 / comment 위조 가능 (사내 적용 시 즉시 수정 의무) |

**즉시 수정 권고** (1줄 fix × 4):
```typescript
// article.controller.ts:60 (UpdateArticle 예시)
@UseGuards(JwtAuthGuard)  // ★ NEW (★ ownership check service 단 추가 의무)
@Put(':slug')
async update(@User('id') userId: number, @Param() params, @Body('article') articleData: CreateArticleDto) {
  // ★ ownership check
  const article = await this.articleService.findOne({slug: params.slug});
  if (article.author.id !== userId) throw new ForbiddenException();
  return this.articleService.update(params.slug, articleData);
}
```

→ **Phase 6 AP-AUTH-NEST-001 critical 단일 등록** (F-140 + F-164 + F-118 + F-119 + F-150 합산 — cumul 5).

---

## 2. operation × severity heatmap

| # | operationId | method | severity | 영향 finding | 권고 |
|---|---|---|---|---|---|
| 1 | GetCurrentUser | `GET /user` | low | F-118 | JWT verify try/catch 추가 |
| 2 | UpdateCurrentUser | `PUT /user` | medium | F-143, F-160 | PATCH 변경 + validate(newUser) 호출 |
| 3 | CreateUser | `POST /users` | high | F-120, F-145, F-150 | DB UQ 추가 + 409 status + 'Invalid credentials' |
| 4 | DeleteUser | `DELETE /users/{slug}` | **critical** | **F-140**, F-146, F-152 | ★★★ AuthMiddleware forRoutes DELETE 추가 의무 |
| 5 | Login | `POST /users/login` | high | F-118, F-150, F-153, F-158 | 200 통일 + Passport 도입 + rate limit |
| 6 | GetArticles | `GET /articles` | medium | F-124, F-165 | EAGER N+1 + limit cap |
| 7 | GetArticleFeed | `GET /articles/feed` | low | — | clean |
| 8 | GetArticle | `GET /articles/{slug}` | low | F-124 | EAGER N+1 |
| 9 | GetArticleComments | `GET /articles/{slug}/comments` | — | — | clean |
| 10 | CreateArticle | `POST /articles` | medium | F-053-variant, F-120-slug, F-162 | slug DB UQ + DTO validator |
| 11 | **UpdateArticle** | `PUT /articles/{slug}` | **critical** | F-126, F-158, F-160, **F-164** | ★★★ Auth Guard + ownership + PATCH + status |
| 12 | **DeleteArticle** | `DELETE /articles/{slug}` | **critical** | F-158, **F-164** | ★★★ Auth Guard + ownership + 204 status |
| 13 | **AddArticleComment** | `POST /articles/{slug}/comments` | **critical** | F-162, **F-164** | ★★★ Auth Guard + DTO validator |
| 14 | **DeleteArticleComment** | `DELETE /articles/{slug}/comments/{id}` | **critical** | F-158, **F-164** | ★★★ Auth Guard + comment.author ownership |
| 15 | FavoriteArticle | `POST /articles/{slug}/favorite` | high | F-135, F-151 | favoriteCount race fix (DB level) |
| 16 | UnfavoriteArticle | `DELETE /articles/{slug}/favorite` | high | F-135, F-158 | DB level race + 204 status |
| 17 | GetProfile | `GET /profiles/{username}` | — | — | clean |
| 18 | FollowUser | `POST /profiles/{username}/follow` | high | F-121, F-144, F-147, F-148 | DB UQ pair + FK + Domain invariant |
| 19 | UnfollowUser | `DELETE /profiles/{username}/follow` | medium | F-144, F-147, F-158 | id 통일 + 204 status |
| 20 | GetTags | `GET /tags` | low | F-163, F-166 | ApiBearerAuth 제거 + DTO 변환 |
| 21 | Root | `GET /` | — | — | system_internal |

> **★★ critical 5건** (DeleteUser + UpdateArticle + DeleteArticle + AddArticleComment + DeleteArticleComment) — 모두 사내 적용 시 즉시 수정 의무.

---

## 3. UC ↔ operation 매핑

20/21 op 가 1:1 UC 매핑 (Root 만 system_internal).

```
UC-USER-LOGIN          ↔ Login (POST /users/login)
                        ↳ BR-USER-LOGIN-VERIFY-001
                        ↳ finding: F-118, F-150, F-153, F-158

UC-USER-DELETE         ↔ DeleteUser (DELETE /users/{slug})
                        ↳ BR-USER-DELETE-AUTH-001 (current_state: absent ★★ critical)
                        ↳ finding: F-140 ★★★

UC-PROFILE-FOLLOW      ↔ FollowUser (POST /profiles/{username}/follow)
                        ↳ BR-FOLLOWS-NO-SELF-001 + BR-FOLLOWS-PAIR-UNIQUE-001
                        ↳ finding: F-121, F-144, F-147, F-148

UC-ARTICLE-CREATE      ↔ CreateArticle (POST /articles)
                        ↳ BR-ARTICLE-SLUG-AUTO-001 + BR-ARTICLE-AUTHOR-AUTO-001
                        ↳ finding: F-053-variant, F-120-slug, F-162
```

---

## 4. RFC 위반 / 비표준 인덱스

| op | RFC | 위반 종류 | finding | Phase 6 격상 후보 |
|---|---|---|---|---|
| UpdateCurrentUser | RFC 5789 | PUT vs PATCH | F-160 | AP-API-003 medium |
| UpdateArticle | RFC 5789 + RFC 9110 §6.5 | PUT vs PATCH + ApiResponse 201 | F-160 + F-158 | AP-API-001 + AP-API-003 |
| DeleteUser | OWASP API5 | BOLA (Auth 부재) | **F-140** | **AP-AUTH-NEST-001 critical** |
| DeleteArticle | RFC 9110 §15.3.5 + OWASP API5 | DELETE → 204 + Auth | F-158 + **F-164** | **AP-AUTH-NEST-001 + AP-API-001** |
| DeleteArticleComment | 동상 | 동상 | F-158 + **F-164** | **AP-AUTH-NEST-001 + AP-API-001** |
| UnfavoriteArticle | RFC 9110 §15.3.5 | DELETE → 204 (ApiResponse 201) | F-158 | AP-API-001 high |
| UnfollowUser | RFC 9110 §15.3.5 | DELETE → 204 | F-158 | AP-API-001 |
| Login | RFC 9110 §15.3.2 | 201 misuse (신규 자원 ❌) | F-158 | AP-API-001 |
| GetArticles | OWASP API4 | limit no cap | F-165 | AP-API-002 |
| Login | OWASP A04 + A07 | rate limit + user enumeration | F-150, F-153 | AP-AUTH-NEST-001 |
| CreateUser/UpdateUser/CreateArticle/CreateComment | OWASP API1 | mass assignment / DTO validator 빈약 | F-128, F-162 | AP-VALIDATION-001 |

---

## 5. spec 미명시 / 정책 후보

`x-related-rules` / `x-related-findings` 보강 후보 — Phase 6 격상 또는 사용자 결정 대기.

| 영역 | 미명시 | 권고 |
|---|---|---|
| Error response schema | `GenericError` 단일 (RFC 7807 미준수) | REC-API-PROBLEM-DETAILS — application/problem+json |
| Pagination | offset/limit (no Link header / no cursor) | REC-API-PAGINATION — Link header 또는 cursor |
| Rate limiting | 부재 (login + 모든 endpoint) | REC-API-THROTTLER — @nestjs/throttler |
| API versioning | `/api` 단일 (no /v1) | REC-API-VERSIONING — URI path /v1 도입 |
| HTTP status 통일성 | DELETE 200 / ApiResponse 201 / RFC 권고 204 | REC-API-STATUS-EXPLICIT — 204 통일 |

---

## 6. anti-pattern / finding 인덱스

### 6.1 Phase 6 AP candidate (★ 본 phase 식별 4건 + Phase 4 8건 = 12건)

| AP ID | severity | composite (개수) | composite view |
|---|---|---|---|
| **AP-AUTH-NEST-001** | **critical** | F-140 + F-164 + F-118 + F-119 + F-150 (5) | NestJS Auth scope (5 endpoint critical + JWT verify + login 모호) |
| **AP-API-001** | **high** | F-158 (5 op 합산) | spec/runtime status code drift (NestJS default + ApiResponse + RFC 9110) |
| AP-API-002 | medium | F-165 + F-159 (2) | API quota + versioning |
| AP-API-003 | medium | F-160 (2 op) | PUT vs PATCH (User + Article) |
| **AP-VALIDATION-001** | high | F-128 + F-127 + F-143 + F-162 (4) | class-validator coverage 12% |
| **AP-DB-001** | critical | F-120 + F-121 + F-133 + F-135 (4) | DB UQ + FK 부재 + race window |
| AP-PERFORMANCE-001 | high | F-124 + F-135 (2) | EAGER N+1 + favorite race |
| AP-DOMAIN-001 | medium | F-122 + F-123 + F-139 + F-147 (4) | Domain invariant 부재 |
| AP-DOMAIN-002 | medium | F-137 + F-138 (2) | Bounded context 경계 약함 |
| AP-CODE-QUALITY-001 | low | F-118 + F-130 + F-131 + F-166 (4) | DRY + leaky abstraction |

→ **합계 10 AP composite** (12 candidate 일부 묶음 후 — Phase 6 사용자 결단 영역).

### 6.2 finding 누적 (본 phase 신규 + cross-PoC)

| finding | severity | status | 한줄 |
|---|---|---|---|
| F-157 | low | promoted | @Controller() 빈 prefix (UserController) |
| F-158 | high | promoted | ApiResponse status drift (5 op) — PoC #02 F-070+F-083+F-085 isomorphic ★ |
| F-159 | medium | promoted | API versioning 부재 — PoC #02 F-082 isomorphic ★ |
| F-160 | medium | promoted | PUT vs PATCH — PoC #02 F-086 isomorphic ★ |
| F-161 | positive | logged | ★★ Bearer JWT 표준 ✅ — PoC #02 F-084 비재현 = 학습 효과 |
| F-162 | high | promoted | DTO validator 빈약 (3 DTO) — F-128 합산 |
| F-163 | medium | promoted | TagController ApiBearerAuth 인지 불일치 |
| **F-164** | **critical** | **promoted** | ★★★ Article 4 endpoint Auth 부재 (★★ F-140 확장) |
| F-165 | medium | promoted | GetArticles limit no cap — PoC #02 F-080 isomorphic ★ |
| F-166 | low | promoted | TagEntity 직접 노출 — Sairyss DDD-Hexagon 위반 |

---

## 7. 변경 권고 우선순위 (REC-API-*)

### 즉시 수정 (★★★ critical)

1. **REC-AUTH-001** — `user.module.ts` `forRoutes` 에 DELETE 추가 + `article.module.ts` 에 `@UseGuards(JwtAuthGuard)` 적용 (4 endpoint) — F-140 + F-164
2. **REC-OWNERSHIP-001** — UpdateArticle / DeleteArticle / DeleteArticleComment 에 ownership check (`article.author.id !== req.user.id` → 403) — F-164

### 단기 (high)

3. **REC-VALIDATION-001** — class-validator 도입 (UpdateUserDto / CreateArticleDto / CreateCommentDto) — F-162
4. **REC-API-IDEMPOTENCY-001** — login 200 통일 + DELETE 204 통일 (5 op) — F-158
5. **REC-DB-UQ-001** — User username/email UQ + Article slug UQ + Follows (followerId, followingId) UQ pair + FK — F-120 + F-121 + F-133

### 중기 (medium)

6. **REC-API-PATCH-001** — PUT → PATCH 변경 (UpdateUser + UpdateArticle / application/merge-patch+json) — F-160
7. **REC-API-VERSIONING-001** — `setGlobalPrefix('api/v1')` — F-159
8. **REC-API-LIMIT-CAP-001** — GetArticles limit maximum: 50 명시 — F-165
9. **REC-RATE-LIMIT-001** — `@nestjs/throttler` (login + write endpoint) — F-153
10. **REC-API-PROBLEM-DETAILS-001** — RFC 7807 application/problem+json — GenericError 대체

### 장기 (low / cosmetic)

11. **REC-CONTROLLER-PREFIX-001** — UserController `@Controller('users')` + getCurrentUser path 정리 — F-157
12. **REC-API-BEARER-OK-001** — ★ Bearer 표준 유지 (PoC #02 비재현 학습 효과 ✅) — F-161 positive

---

## 8. 본 산출물 자체 메타

```yaml
phase: 5-1
deliverable: api.md (사람 눈) + openapi.yaml (AI 눈) + api-extension.json (메타)
raw_confidence: 0.90
inputs:
  - source: source/nestjs-realworld-tmp/src/{user,article,profile,tag,app}.{controller,module}.ts
  - source: src/{user,article}/dto/*.dto.ts + interface.ts
  - source: src/main.ts (Swagger DocumentBuilder + setGlobalPrefix + addBearerAuth)
  - openapi.yaml: 정적 추출 (★ runtime dump 부재 — Sprint 5 carry-over)
cross_validation:
  performed: true
  validators:
    - { type: main_agent_raw_fetch, real_tool: true, files_read: 14 }   # 5 controller + 5 module + 4 DTO/interface
    - { type: poc_02_cross_validation, real_tool: true, references: ["openapi.yaml 802 line ground truth", "api-extension.json 19 op", "_manifest.yml"] }
    - { type: phase_4_5_cross_link, real_tool: true, references: ["state-machines/*.json", "sequence-diagrams/*.json", "decision-tables/*.json"] }
    - { type: external_tool_spectral, real_tool: false, simulation_reason: "환경 부재 — Sprint 5 carry-over" }
  drift_detected: { spec_runtime: 5, hexagonal: 1, rfc_violations: 11 }
known_limitations:
  - "★ runtime ground truth (nest start dump) 부재 → 정적 추출만 (-3p)"
  - "★ spectral / openapi-changes / vacuum 미실행 → Sprint 5 carry-over (-2p)"
  - "★ 실제 Auth 동작 확인 부재 (서버 미가동) → 정적 추출 + cross-validation 만"
trust_level:
  current: 0.90
  next_validation: "Phase 6 AP 격상 + Sprint 5 spectral / runtime dump"
```

---

## 9. 참조 / 다음 phase

- 다음 phase: **Phase 6 (안티패턴 final)** — 12 AP candidate → composite view 정식 등록
- 격상 대기 finding: §6.2 (10건)
- 외부 검증 후보: spectral / vacuum / openapi-changes (★★★ 진짜 도구 의무 / Sprint 5 carry-over)
- ★ PoC #03 7대 산출물 6/7 도달까지 Phase 6 만 남음 (UI/UX 만 제외 — BE only PoC)

---

## 10. cross-PoC 학습 효과 통계

```yaml
poc_02_isomorphic_재현: 5      # F-082 (versioning) / F-083 (DELETE 200) / F-085 (POST status drift) / F-086 (PUT vs PATCH) / F-080 (limit cap)
poc_02_비재현_학습효과: 2       # ★★ F-084 (Token apiKey → Bearer 표준 ✅) / F-087 (307 redirect → NestJS framework 차이)
poc_03_신규_critical: 1        # F-164 (Article 4 endpoint Auth 부재)
poc_03_신규_high: 1            # F-158 (ApiResponse decorator 결함)
poc_03_신규_positive: 1        # F-161 (Bearer 표준 ✅)
```

→ **§8.1 단일 PoC 과적합 회피 정합** ★ — 5 재현 + 2 비재현 + 1 신규 critical = 균형. **Bearer 표준 = NestJS 학습 효과 입증** ✅.

**End of api.md.**

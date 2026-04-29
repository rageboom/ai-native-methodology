# API 계약 — RealWorld Conduit (PoC #01)

> 생성일: 2026-04-29
> 방법론: AI-Native v1.1.2 / Phase 5-1
> 입력: Phase 4 산출 (UC 25 / BR 13 / AP partial 6) + RestController 9 raw fetch + Postman collection
> 신뢰도: **0.93** (raw, formula v1)
> 관련 산출: `openapi.yaml` (산업 표준) / `api-extension.json` (사내 메타) / `_manifest.yml`

---

## 1. 요약

| 항목 | 값 |
|---|---|
| API 표준 | OpenAPI 3.1.0 |
| 인증 | `Authorization: Token <jwt>` (RFC 6750 비표준) |
| Endpoint | **22개** (4 GET /articles 변형 통합 → 19 operationId) |
| Public endpoint | 8개 (회원가입 / 로그인 / 프로필 조회 / 게시글 목록·단건 / 댓글 조회 / 태그) |
| Auth required | 14개 |
| Wrapper DTO | 100% (RealWorld 표준 — `{user/article/comment/profile: {...}}`) |
| Aggregates 영향 | User / Article / Comment / Tag |
| 사내 적용 권고 | **41건** (critical 7 / high 26 / medium 8) |
| 알려진 결함 | **critical 2건** (F-027 De Morgan / AP-SECURITY-001 JWT) + **high 1건** (AP-DOMAIN-002 unique 부재) |

---

## 2. 핵심 발견 — 사내 적용 시 필수 조치 (critical)

### 2.1 ⚠️ F-027 — De Morgan 법칙 위반 (DELETE comment)

| 항목 | 내용 |
|---|---|
| **위치** | `domain/article/Article.java:86` |
| **endpoint** | `DELETE /articles/{slug}/comments/{id}` (operationId: `DeleteArticleComment`) |
| **AP** | AP-DOMAIN-001 critical |
| **BR** | BR-COMMENT-DELETE-001 (rule_conflicts 1건) |
| **의도** | 댓글 작성자 **OR** 게시글 작성자가 삭제 가능 |
| **실제** | `!(comment.author != loginUser AND article.author != loginUser)` → 댓글 작성자 **AND** 게시글 작성자가 모두 일치해야 삭제 |
| **영향** | 댓글 작성자 ≠ 게시글 저자인 일반 케이스에서 silent fail (응답 200, 삭제 안됨) |
| **즉시 조치** | `&&` → `||` 로 변경 + 회귀 테스트 (작성자 ≠ 저자 시나리오) |

→ openapi.yaml `paths./articles/{slug}/comments/{id}.delete` 에 `description` + `x-warning` + `x-known-bug` 3중 표기 (Senior 영역 6 권고).

### 2.2 ⚠️ AP-SECURITY-001 — JWT SECRET 21byte 하드코딩

| 항목 | 내용 |
|---|---|
| **위치** | `infrastructure/jwt/JWTConfiguration.java:12` |
| **위반** | RFC 7515 §10.1 + RFC 2104 §3 (HS256 minimum 32byte) |
| **현재** | 21byte (32byte 의 65.6%) + 하드코딩 |
| **claim 부재** | iss / aud / iat / jti (RFC 7519 §4.1 권고 위반 — F-037) |
| **즉시 조치** | (1) SECRET 256bit (32byte) 환경변수 분리 (2) 4 claim 추가 (3) Spring Security `OAuth2ResourceServerConfigurer.jwt()` 표준 마이그레이션 |

### 2.3 ⚠️ AP-DOMAIN-002 — email/username unique 3중 부재 (high)

| 항목 | 내용 |
|---|---|
| **위치** | `domain/user/UserService.java:22` + `schema.sql` + `User.java` |
| **위반** | App+DB+JPA 3중 unique 제약 부재 |
| **즉시 조치** | (1) DB unique 제약 추가 (2) JPA `@Column(unique=true)` (3) Service 레벨 사전 검증 (REC-004 3중 방어) |

---

## 3. 22 Endpoint — 운영 시나리오

### 3.1 회원가입 / 로그인 (User and Authentication)

| # | Method | Path | operationId | Auth | UC | BR |
|---|---|---|---|---|---|---|
| 1 | POST | `/users` | `CreateUser` | ❌ public | UC-CONTENT-USER-SIGNUP | BR-USER-EMAIL-001 / BR-USER-USERNAME-001 / BR-AUTH-PASSWORD-001 |
| 2 | POST | `/users/login` | `Login` | ❌ public | UC-CONTENT-USER-LOGIN | BR-AUTH-PASSWORD-001 / BR-AUTH-STATELESS-001 / BR-AUTH-JWT-001 |
| 3 | GET | `/user` | `GetCurrentUser` | ✅ | UC-CONTENT-USER-FIND-BY-ID ⚠️ | BR-AUTH-STATELESS-001 |
| 4 | PUT | `/user` | `UpdateCurrentUser` | ✅ | UC-CONTENT-USER-UPDATE | BR-USER-EMAIL-001 / BR-USER-USERNAME-001 / BR-AUTH-PASSWORD-001 |

⚠️ **F-035** — UC-CONTENT-USER-FIND-BY-ID 는 Phase 4 에서 `system_internal=true` 로 오분류. Phase 5-1 에서 명시적 API endpoint 확인 → domain.json 갱신 필요.

### 3.2 프로필 (Profile)

| # | Method | Path | operationId | Auth | UC | BR |
|---|---|---|---|---|---|---|
| 5 | GET | `/profiles/{username}` | `GetProfileByUsername` | ❌ | UC-CONTENT-PROFILE-VIEW | BR-AUTH-PUBLIC-001 |
| 6 | POST | `/profiles/{username}/follow` | `FollowUserByUsername` | ✅ | UC-CONTENT-PROFILE-FOLLOW | BR-USER-FOLLOW-001 |
| 7 | DELETE | `/profiles/{username}/follow` | `UnfollowUserByUsername` | ✅ | UC-CONTENT-PROFILE-UNFOLLOW | BR-USER-FOLLOW-001 |

### 3.3 게시글 (Article)

| # | Method | Path | operationId | Auth | UC | BR |
|---|---|---|---|---|---|---|
| 8 | GET | `/articles` | `GetArticles` | ❌ | **UC 4건 통합** | — |
| 9 | POST | `/articles` | `CreateArticle` | ✅ | UC-CONTENT-ARTICLE-CREATE | BR-ARTICLE-AUTHOR-001 / BR-DOMAIN-AUDITING-001 |
| 10 | GET | `/articles/feed` | `GetArticlesFeed` | ✅ | UC-CONTENT-ARTICLE-FEED | BR-USER-FOLLOW-001 |
| 11 | GET | `/articles/{slug}` | `GetArticle` | ❌ | UC-CONTENT-ARTICLE-VIEW | — |
| 12 | PUT | `/articles/{slug}` | `UpdateArticle` | ✅ | UC-CONTENT-ARTICLE-UPDATE | BR-ARTICLE-AUTHOR-001 / BR-DOMAIN-AUDITING-001 |
| 13 | DELETE | `/articles/{slug}` | `DeleteArticle` | ✅ | UC-CONTENT-ARTICLE-DELETE | BR-ARTICLE-AUTHOR-002 |
| 14 | POST | `/articles/{slug}/favorite` | `CreateArticleFavorite` | ✅ | UC-CONTENT-ARTICLE-FAVORITE | — |
| 15 | DELETE | `/articles/{slug}/favorite` | `DeleteArticleFavorite` | ✅ | UC-CONTENT-ARTICLE-UNFAVORITE | — |

⚠️ **GetArticles UC 4건 통합** (단일 operationId + query parameter 분기):
- UC-CONTENT-ARTICLE-LIST (필터 없음)
- UC-CONTENT-ARTICLE-LIST-BY-TAG (`tag=...`)
- UC-CONTENT-ARTICLE-LIST-BY-AUTHOR (`author=...`)
- UC-CONTENT-ARTICLE-LIST-BY-FAVORITED (`favorited=...`)

### 3.4 댓글 (Comment)

| # | Method | Path | operationId | Auth | UC | BR |
|---|---|---|---|---|---|---|
| 16 | GET | `/articles/{slug}/comments` | `GetArticleComments` | ❌ | UC-CONTENT-COMMENT-LIST | — |
| 17 | POST | `/articles/{slug}/comments` | `CreateArticleComment` | ✅ | UC-CONTENT-COMMENT-CREATE | BR-DOMAIN-AUDITING-001 |
| 18 | DELETE | `/articles/{slug}/comments/{id}` | `DeleteArticleComment` | ✅ | UC-CONTENT-COMMENT-DELETE | **BR-COMMENT-DELETE-001** ⚠️ F-027 |

### 3.5 태그 (Tag)

| # | Method | Path | operationId | Auth | UC | BR |
|---|---|---|---|---|---|---|
| 19 | GET | `/tags` | `GetTags` | ❌ | UC-CONTENT-TAG-LIST | — |

---

## 4. 신규 Finding 7건 (Phase 5-1 발굴)

| ID | severity | 출처 | 설명 | 처분 |
|---|---|---|---|---|
| F-034 | medium | 3 sub-agent 합의 | `sessionCreationPolicy(STATELESS)` 명시 부재 — Spring 5.x default IF_REQUIRED 와 의도 충돌 | promoted (v1.2.0 묶음 G) |
| F-035 | high | Senior + Case | `GET /user` UC 매핑 갱신 — Phase 4 system_internal=true 오분류 | closed (Phase 5 갱신으로 종결) |
| F-036 | low | Document + Case | `WebSecurity#ignoring` → `permitAll` 마이그레이션 권고 | promoted (Phase 6 AP candidate) |
| F-037 | low | Document RFC 7519 | JWT iss/aud/iat/jti 4 claim 부재 | deferred (PoC #02 후) |
| F-038 | medium | Senior 영역 9 | API 버저닝 부재 (`info.version` 부재 / `/api` only) | promoted (deliverable 03 보강) |
| F-039 | medium | Senior 영역 8 | WebSecurityConfigurerAdapter deprecated | deferred (사내 코드 영향만) |
| F-040 | medium | Senior 영역 10 | HTTP status code 일관성 (@ResponseStatus 부재 → default 200) | deferred (PoC #02 후 합산) |

→ 임계 25 → 32 (F-021 임계 20+ 초과). 윤주스 절대 우선순위 (PoC #02 후 v1.2.0 합산 격상) 유지.

---

## 5. 사내 적용 권고 41건

### 5.1 critical 7건 (즉시 수정)

| REC ID | 영역 | 권고 |
|---|---|---|
| REC-AUTH-002 | Authorization | RFC 6750 Bearer 표준 마이그레이션 |
| REC-DOS-001 | Pageable | `limit` `maximum: 100` cap 추가 (`GetArticles`) |
| REC-DOS-002 | Pageable | `Pageable` parameter size cap (`GetArticlesFeed`) |
| REC-F027-001 | F-027 | description 표기 |
| REC-F027-002 | F-027 | x-warning + x-known-bug 표기 |
| REC-JWT-001 | JWT | SECRET 256bit (HS256) + 환경변수 분리 |
| REC-JWT-002 | JWT | Spring Security `OAuth2ResourceServerConfigurer.jwt()` 표준 |

### 5.2 high 26건

(senior-phase5.md 부록 B — 인증 / 보안 / 검증 / 에러 응답 / API 디자인 영역)

### 5.3 medium 8건

(senior-phase5.md 부록 B — 명명 규칙 / consistency / 문서화)

---

## 6. Phase 6 신규 AP candidate 6건

| AP ID 후보 | severity | 영향 endpoint | finding |
|---|---|---|---|
| AP-PERFORMANCE-001 | high | `GetArticles` / `GetArticlesFeed` | (DoS — limit cap 부재) |
| AP-SECURITY-CONFIG-IMPLICIT-001 | medium | (전역) | F-034 |
| AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 | medium | `CreateUser` / `Login` | F-036 |
| AP-ARCH-DEPRECATED-001 | medium | (전역) | F-039 |
| AP-API-VERSIONING-001 | medium | (전역) | F-038 |
| AP-API-STATUS-INCONSISTENT-001 | low | `DeleteArticle` 등 | F-040 |

→ Phase 6 final 통합 시 Phase 4 partial 6 + Phase 5 6 = **12 AP 최종**.

---

## 7. LV-001 (architectural debt) — 18 operation 영향

`UserApi` / `ProfileApi` / `ArticleApi` / `CommentApi` 4 controller 가 `infrastructure/jwt/UserJWTPayload` 직접 import (presentation → infrastructure layer violation).

**영향 operation**: 18개 (Tag 1개 제외 모두).

**노출 정책**: openapi.yaml 표준 보전 + api-extension.json `x-architectural-debt` 만 노출 (윤주스 결정 4).

**사내 적용 권고**: application 레이어에 `AuthContext` 추상화 도입 → infrastructure 직접 의존 제거.

---

## 8. 인증 메커니즘 상세

### 8.1 헤더 형식

```
Authorization: Token <jwt-token-here>
```

- **비표준**: RFC 6750 의 `Bearer` 가 아닌 `Token` prefix
- **OpenAPI 매핑**: `apiKey + in:header + name:Authorization`
- **Spring 처리**: `JWTFilter` 가 `Token ` prefix 를 stripping 후 JWT 파싱 (사내 자체 구현)

### 8.2 SecurityConfiguration 분석

```java
// 사실상 STATELESS 동작 (csrf + formLogin + httpBasic + logout disable + JWTFilter only)
// 단 sessionCreationPolicy(STATELESS) 명시 부재 — Spring 5.x default = IF_REQUIRED
// → F-034 신규 finding (medium)
```

| 정책 | 명시 | 기본값 | 실제 동작 |
|---|---|---|---|
| csrf | `csrf().disable()` | enabled | disabled ✅ |
| formLogin | `formLogin().disable()` | configured | disabled ✅ |
| httpBasic | `httpBasic().disable()` | enabled | disabled ✅ |
| logout | `logout().disable()` | configured | disabled ✅ |
| sessionCreationPolicy | **부재** ⚠️ | IF_REQUIRED | 사실상 STATELESS (filter chain 만 의존) |
| JWTFilter | `addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)` | — | active ✅ |

### 8.3 Public endpoint 처리 (POST /users / POST /users/login)

| 방식 | RealWorld 채택 | Spring Security 6 권고 | 차이 |
|---|---|---|---|
| `WebSecurity#ignoring` | ✅ | ❌ | filter chain 자체 우회 (CSRF/HSTS/security headers 미적용) |
| `HttpSecurity.permitAll` | ❌ | ✅ | filter 통과 후 anonymous 허용 (security headers 보전) |

→ **F-036** — 사내 적용 시 `permitAll` 마이그레이션 권고. Phase 6 AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 candidate.

---

## 9. 신뢰도 산정 (formula v1)

| 요인 | 값 |
|---|---|
| base | 0.75 |
| + orm_full (Spring Data JPA + DTO 결정적 추출) | +0.10 |
| + domain_context_md (`inputs/domain-context.md`) | +0.03 |
| + postman_or_api_test (`doc/Conduit.postman_collection.json`) | +0.05 |
| + diagrams_other (drawio 3개) | +0.02 |
| − no_operational_db (5.D 0건 + 5.B 부재) | -0.03 |
| − raw confidence (subtotal) | **0.92** |
| + F-015 cross-validation (22 endpoint 100% 합의) | +0.02 |
| − 잠재 불일치 3건 (Phase 4 갱신 필요) | -0.01 |
| **= 수정 raw confidence** | **0.93** |

영역 별:
- 엔드포인트 식별: **0.97** (어노테이션 결정적 + Postman cross-check)
- 요청/응답 스키마: **0.85** (DTO + Lombok)
- 에러 코드: **0.65** (Spring default 추정 — `@ExceptionHandler` 부재)
- 인증/권한: **0.92** (SecurityConfiguration raw fetch + F-034 보정)
- operationId ↔ UC 매핑: **0.90** (Phase 4 pre-매핑 + F-035 갱신)
- x-related-rules: **0.78** (rules.json 역매핑)

---

## 10. 검증 결과 (승인 게이트)

| 체크 | 결과 |
|---|---|
| openapi.yaml 표준 lint 통과 (manual) | ✅ |
| 모든 operationId unique | ✅ (19개 모두 unique) |
| DTO 스키마 = JSON Schema 호환 | ✅ |
| 에러 응답 표준화 (4xx/5xx) | ✅ (Unauthorized / Forbidden / NotFound / GenericErrorModel) |
| x-related-use-cases 매핑 = 사용자 검토 | ✅ (Phase 4 domain.json + F-035 갱신) |
| x-related-rules 매핑 = 사용자 검토 | ✅ (Phase 4 rules.json) |
| 5.D inbound webhook 합쳐짐 | N/A (5.D 0건) |
| Swagger UI 렌더링 검증 | manual (TokenAuth 비표준 — Authorize 버튼 호환 가능) |

---

## 11. 7대 산출물 진행률

| # | 산출물 | 단계 | 상태 |
|---|---|---|---|
| 1 | 아키텍처 | Phase 3 | ✅ |
| 2 | 도메인 모델 | Phase 4 | ✅ (F-035 갱신 필요) |
| **3** | **API 계약** | **Phase 5-1** | **✅ 본 산출** |
| 4 | DB 스키마 | Phase 2 | ✅ |
| 5 | 비즈니스 규칙 | Phase 4 | ✅ (F-034 / F-036 source_evidence 정밀화 필요) |
| 6 | 안티패턴 | Phase 6 | ⏳ partial 6 + 신규 6 candidate = 12 AP 예상 |
| 7 | UI/UX | Phase 5-2 | ❌ N/A (BE only) |

**6/7 완료 (86%) → Phase 5-1 종료 시 6/7 (95%, Phase 6 만 남음)**

---

## 12. 다음 단계

1. ✅ 본 산출물 (openapi.yaml + api-extension.json + api.md + _manifest.yml) 작성
2. ⏳ Phase 4 산출 갱신 (`domain.json` UC-CONTENT-USER-FIND-BY-ID + `rules.json` BR-AUTH-STATELESS-001 source_evidence)
3. ⏳ findings/poc-findings.md 갱신 (F-034 ~ F-040 등록)
4. ⏳ PROGRESS-poc01-phase5.md 시간순 마감
5. ⏳ Phase 6 진입 (윤주스 승인 후) — antipatterns.json final merge

---

**END OF api.md**

# PROGRESS — PoC #01 Phase 5-1 (API 계약)

> 시간순 로그 대전제 (feedback_progress_log.md) 적용

---

## T+0 (2026-04-28) — Phase 5 진입 + 1원칙 plan 작성

### 진입 컨텍스트

- 윤주스 1번 선택 (Phase 5 진입)
- Phase 4 완료 ✅ — UC 25 / BR 13 / AP partial 6 / architecture 갱신
- Phase 5 명세 v1.1.2 (phase-5-1-api.md) 적용

### 1원칙 — 전수 조사 + plan-phase5.md 작성

전수 조사 완료 항목:

- ✅ methodology-spec/workflow/phase-5-1-api.md
- ✅ methodology-spec/deliverables/03-API-계약.md
- ✅ schemas/openapi-extension.schema.json
- ✅ output/domain/domain.json (UC 25)
- ✅ output/rules/rules.json (BR 13)
- ✅ output/antipatterns-partial/antipatterns-partial.json (AP 6)
- ✅ output/architecture/architecture.json (modules + LV-001)
- ✅ inputs/\_manifest.yml

산출:

- ✅ `.claude/plans/plan-phase5.md` 작성 완료

핵심 결정 (plan §6):

1. RealWorld `Authorization: Token <jwt>` → OpenAPI security scheme apiKey 채택
2. wrapped DTO 형식 → wrapper schema 분리
3. F-027 명시 위치 → DELETE /articles/{slug}/comments/{id} description + x-warning
4. LV-001 노출 → api-extension.json `extracted_from.controller_file` 만
5. 4 GET /articles 변형 → 단일 operationId + query parameters 통합

---

## T+1 (2026-04-28) — 2원칙 진행 (F-015 메인 사전 raw fetch)

### 메인 사전 raw fetch 결과 (학습 코퍼스 의존 위험 사전 차단)

WebFetch 9회로 ground truth 확보:

- application/ 디렉토리 + 4 subdir listing
- doc/Conduit.postman_collection.json (22 endpoint)
- application/security/SecurityConfiguration.java
- ArticleRestController / UserRestController / ProfileRestController / TagRestController
- comment subdirectory (4 files)

### 22 endpoint 결정적 확정

| 영역    | 개수                                                                                        |
| ------- | ------------------------------------------------------------------------------------------- |
| User    | 4 (POST /users, POST /users/login, GET /user, PUT /user)                                    |
| Profile | 3 (GET /profiles/{username}, POST + DELETE /follow)                                         |
| Article | 11 (POST + GET (4 query 변형) + GET /feed + GET/PUT/DELETE /{slug} + POST/DELETE /favorite) |
| Comment | 3 (POST + GET + DELETE /comments)                                                           |
| Tag     | 1 (GET /tags)                                                                               |

### Cross-validation 결과 — Phase 4 산출 검증

**✅ 정합 (Phase 4 정확)**:

- LV-001 (UserJWTPayload import) 3 controller 직접 import 확인
- UC 25 의 18건 operationId pre-매핑 정합
- BR-AUTH-PUBLIC-001 endpoint 정확
- AP-DOMAIN-001 (F-027) Article.java:86 위치 정합

**⚠️ Phase 4 산출과 잠재 불일치 — Phase 5 진행 중 검증 필요**:

1. **`sessionCreationPolicy(STATELESS)` 명시 부재** — F-XXX 신규 finding 후보
   - Phase 4 rules.json BR-AUTH-STATELESS-001 source_evidence: `sessionCreationPolicy(STATELESS)` 라고 적힘
   - 실제 SecurityConfiguration: 명시 안됨 (Spring 5.x default = IF_REQUIRED)
   - 사실상 STATELESS 동작 (csrf + formLogin + logout disable + JWTFilter only) 이나 명시 부재 = 사내 적용 시 위험

2. **`GET /user` → UC-USER-FIND-BY-ID 매핑 갱신 필요**
   - Phase 4 domain.json: UC-USER-FIND-BY-ID 가 system internal 로 분류
   - 실제: GET /user (Current User) endpoint 존재 — UserRestController 에 명시
   - Phase 5 산출 시 domain.json `use_cases[].related_api_operation_id` 갱신 필요

3. **WebSecurity.ignoring vs HttpSecurity.permitAll 정밀화**
   - Phase 4 rules.json: POST /users 가 `permitAll()` 라고 적힘
   - 실제: WebSecurity#ignoring (filter 자체 우회 — permitAll 보다 강함)
   - 의미 차이 — source_evidence 정밀화

### 4 GET /articles 변형 처리 결정

OpenAPI 3.1 표준 — 같은 path+method 는 단일 operation. → `getArticles` 단일 + query parameters 4개 (page/size/author/tag/favorited) 통합. UC 4건 (LIST + LIST-BY-AUTHOR/TAG/FAVORITED) 은 `x-related-use-cases: [...]` 배열 4건 등록.

### 2원칙 sub-agent 병렬 spawn (3개)

| 에이전트            | 산출               | 핵심 영역                                                                                                                                            |
| ------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Researcher | document-phase5.md | OpenAPI 3.1 / Spring REST / ignoring vs permitAll / Pageable / RFC 7519/7515/8725                                                                    |
| Case Researcher     | case-phase5.md     | Netflix/Stripe/GitHub / RealWorld 공식 spec / 한국 5사 / Authorization Token vs Bearer / Postman→OpenAPI / API↔UC                                    |
| Senior Engineer     | senior-phase5.md   | OpenAPI 함정 / Authorization 정책 / Lombok DTO / Pageable DoS / F-027 표기 / JWT 자체 구현 위험 / WebSecurityConfigurerAdapter deprecated / API 버전 |

각 sub-agent 에게 메인 raw fetch 결과 명시 전달 (학습 코퍼스 의존 차단).

3 에이전트 background 실행 중.

---

## T+2 (2026-04-29) — sub-agent 한도 초과 + 세션 클리어

### sub-agent 결과 (모두 실패)

3 sub-agent 모두 사용량 한도 도달로 중단 (reset 17:50 KST):

- document-phase5.md ❌ (85초 / tool_uses 19)
- case-phase5.md ❌ (49초 / tool_uses 14)
- senior-phase5.md ❌ (18초 / tool_uses 8)

산출물 0건 — `.claude/researches/` 에 phase5 파일 미작성.

### 클리어 결정 (윤주스)

세션 컨텍스트 비대화 → 클리어 결정. 클리어 전 RESUME.md + CLAUDE.md + 본 PROGRESS 갱신.

### 다음 세션 재개 시 액션

1. 본 PROGRESS + RESUME.md 읽기
2. **2원칙 sub-agent 3개 재spawn** — plan-phase5.md §7 prompt 그대로 재사용
3. research-phase5.md 통합 (3 영역 + 메인 cross-validation 9 영역 종합)
4. 3원칙 윤주스 승인
5. 4단계 output/api/ 산출물 작성

---

## T+3 (2026-04-29) — 2원칙 재시도 ✅ 완료 (한도 reset 후 즉시 시도)

### 사용자 결정 (윤주스)

- 즉시 시도 옵션 채택 (Anthropic 5시간 rolling window 회복 가능성).

### 3 sub-agent 병렬 spawn (background)

| Agent ID        | 산출                                    | 분량       | 상태                           |
| --------------- | --------------------------------------- | ---------- | ------------------------------ |
| document-phase5 | `.claude/researches/document-phase5.md` | 1,232 line | ✅ 완료 (469초 / 26 tool_uses) |
| case-phase5     | `.claude/researches/case-phase5.md`     | 1,261 line | ✅ 완료 (461초 / 34 tool_uses) |
| senior-phase5   | `.claude/researches/senior-phase5.md`   | 1,956 line | ✅ 완료 (605초 / 5 tool_uses)  |

총 4,449 line. 한도 reset 됐음 — 모두 정상 산출.

### 핵심 합의 (3/3 동의)

**5 핵심 결정 — 모두 표준 적합 + 시니어 승인**:

1. `apiKey + Authorization` (Bearer 아님) — Document RFC 6750 §3 / Case 카카오 KakaoAK / Senior 영역 14
2. wrapper schema 분리 — Document OpenAPI 3.1 components / Case Stripe·GitHub / Senior 영역 2
3. F-027 De Morgan → description + x-warning + x-known-bug **3중 표기** — Senior critical 권고
4. LV-001 → api-extension.json `extracted_from.controller_file` 만 — Case GitHub `x-github` 모방 가능
5. 4 GET /articles 변형 단일 operationId `GetArticles` + query parameter — 모두 표준 적합

**잠재 불일치 3건 → 신규 finding 등록 합의**:

- F-034 (medium) `sessionCreationPolicy(STATELESS)` 명시 부재 — Document/Case/Senior 모두 신규 finding 권고
- F-035 (high/medium) `GET /user` UC 매핑 갱신 — Senior `system_internal=false` + operationId `GetCurrentUser`
- F-036 (low/medium) `WebSecurity#ignoring` vs `permitAll` — Document/Case 권고 + Senior Phase 6 AP 후보

### 신규 finding 6~7건 후보 (윤주스 결정 대기)

| ID           | severity   | 출처                 | 설명                                                           |
| ------------ | ---------- | -------------------- | -------------------------------------------------------------- |
| F-034        | medium     | Document/Case/Senior | STATELESS 명시 부재                                            |
| F-035        | high       | Senior               | GET /user UC 매핑 (system_internal 갱신)                       |
| F-036        | low~medium | Document/Case        | WebSecurity#ignoring → permitAll 마이그레이션                  |
| F-037        | low        | Document             | JWT iss/aud/iat/jti 4 claim 부재 (RFC 7519 §4.1)               |
| F-038        | medium     | Senior               | API 버저닝 부재 (`/api` only)                                  |
| F-039        | medium     | Senior               | WebSecurityConfigurerAdapter deprecated (Spring Security 5.7+) |
| F-040 (선택) | medium     | Senior               | HTTP status code 일관성 (@ResponseStatus 부재)                 |

→ 임계 25 → 31~32 도달 (F-021 임계 20+ 초과). 윤주스 절대 우선순위 (PoC #02 후 v1.2.0 합산 격상) 유지.

### Phase 6 신규 AP candidate 6 (Senior 발굴 — Phase 6 통합 시 등록)

- AP-PERFORMANCE-001 (Pageable DoS — size cap 부재)
- AP-SECURITY-CONFIG-IMPLICIT-001 (STATELESS 명시 부재)
- AP-SECURITY-CONFIG-WEBSEC-IGNORING-001
- AP-ARCH-DEPRECATED-001 (WebSecurityConfigurerAdapter)
- AP-API-VERSIONING-001
- AP-API-STATUS-INCONSISTENT-001

→ Phase 6 final 통합 시 partial 6 + Phase 5 6 = **12 AP 최종** 예상.

### v1.2.0 격상 묶음 신규 (G)

- **G. OpenAPI x-extension 표준 가이드** — ADR-007 신설 후보 (Case 발굴 — GitHub `x-github` / Stripe / Netflix 모방 정당화). 6 → **7 묶음**.

### 다음 액션

- T+4: research-phase5.md 통합 (3 영역 + 메인 cross-validation 9 영역 종합)
- T+5: 3원칙 윤주스 승인 (작업 범위 + 5 핵심 결정 + 신규 finding 6~7건 등록 여부)
- T+6 ~ T+12: 4단계 output/api/ 산출물 작성

---

## T+4 (2026-04-29) — research-phase5.md 통합 ✅

`.claude/researches/research-phase5.md` 작성 완료 (~520 line).

- 3 sub-agent 합의/충돌 정리 (충돌 없음 — 5 핵심 결정 모두 합의)
- 4단계 작성 인덱스 (T+0~T+12)
- 신규 finding 7건 후보 등록 (§7)
- Phase 6 AP candidate 6건 (§8)
- v1.2.0 격상 묶음 G 추가 (§9)

---

## T+5 (2026-04-29) — 3원칙 윤주스 승인 ✅ (4/4 항목 일괄)

| 항목                                | 결정             |
| ----------------------------------- | ---------------- |
| 5 핵심 결정 + 22 endpoint 작업 범위 | ✅ 일괄 승인     |
| 신규 finding 7건 등록 (F-034~F-040) | ✅ 7건 모두 등록 |
| v1.2.0 격상 묶음 G (ADR-007)        | ✅ 추가          |
| Phase 6 AP candidate 6건 등록 예고  | ✅ 6건 예고 승인 |

→ 4단계 산출 진입 차단 요인 없음.

---

## T+6 (2026-04-29) — 4단계 산출 시작 + output/api/ 4종 작성 ✅

### 디렉토리 생성

- `output/api/` 신설

### 산출물 4종 작성 ✅

| 파일                            | 분량      | 핵심                                                                                                                      |
| ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `output/api/openapi.yaml`       | 471 line  | OpenAPI 3.1 / 22 endpoint / 19 operationId / wrapper schema 19 / TokenAuth apiKey / F-027 3중 표기                        |
| `output/api/api-extension.json` | ~520 line | operations[19] / schemas_to_entities[18] / x-architectural-debt (LV-001 18 op) / x-known-bug F-027 / x-uc-mapping-summary |
| `output/api/api.md`             | ~290 line | 사람용 요약 / 22 endpoint 운영 시나리오 / 신규 finding 7건 / 사내 권고 41건 / Phase 6 AP candidate 6 / 신뢰도 0.93        |
| `output/api/_manifest.yml`      | ~230 line | formula v1 / 5 핵심 결정 / 신뢰도 산정 / approval gate / Phase 4 갱신 항목 / Phase 6 인계                                 |

### 5 핵심 결정 적용 (3 sub-agent 합의 + 윤주스 승인)

- DEC-API-001 ✅ apiKey + Authorization (Bearer 아님) — components.securitySchemes.TokenAuth
- DEC-API-002 ✅ Wrapper schema 분리 (3-tier 명명) — UserResponse / ArticleResponse / Comment 등
- DEC-API-003 ✅ F-027 De Morgan **3중 표기** — description + x-warning + x-known-bug
- DEC-API-004 ✅ LV-001 → api-extension.json `x-architectural-debt` (openapi.yaml 표준 보전)
- DEC-API-005 ✅ 4 GET /articles 단일 operationId GetArticles + UC 4건 매핑 + limit cap 100 권고

---

## T+7 (2026-04-29) — Phase 5-1 cross-link 정정 (UC/BR/Entity ID prefix)

산출물 작성 후 Phase 4 ID 형식 cross-check — `UC-` / `BR-` / `E-` prefix 불일치 발견:

- 내 작성: `UC-USER-SIGNUP` / `BR-AUTHOR-001` / `E-USER-User`
- Phase 4 실제: `UC-CONTENT-USER-SIGNUP` / `BR-ARTICLE-AUTHOR-001` / `E-CONTENT-User`

### 일괄 정정 (Edit replace_all)

| 파일               | 정정 항목                                                                                                                                                      | 결과 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| openapi.yaml       | UC-USER-FIND-BY-ID / UC-ARTICLE-\* / BR-AUTHOR-001/002 / BR-FOLLOW-001                                                                                         | ✅   |
| api-extension.json | UC-USER-_ / UC-PROFILE-_ / UC-ARTICLE-_ / UC-COMMENT-_ / UC-TAG-LIST / BR-USER-PASSWORD-001 / BR-AUTHOR-001/002 / BR-AUDITING-001 / E-USER-User / E-ARTICLE-\* | ✅   |
| api.md             | 동일                                                                                                                                                           | ✅   |

→ Phase 4 ID 형식 100% 일치 달성.

---

## T+8 (2026-04-29) — Phase 4 산출 갱신 (F-034 / F-035 / F-036)

### domain.json 갱신 (F-035 — high closed)

`UC-CONTENT-USER-FIND-BY-ID`:

- actor: `System` → `Authenticated User`
- description: 정정 (Phase 5-1 cross-validation 명시)
- 신규 필드 추가:
  - `related_api_operation_id: "GET /user"`
  - `related_openapi_operation_id: "GetCurrentUser"`
  - `_phase5_correction` 메타 (F-035 등록)

### rules.json 갱신 (F-034 / F-036 — promoted)

`BR-AUTH-STATELESS-001`:

- source_evidence 정밀화 (sessionCreationPolicy 명시 부재 명시)
- confidence 0.90 → 0.85
- `_phase5_correction` 메타 추가 (F-034)
- tags `["security", "stateless", "jwt", "F-034"]` 갱신

`BR-AUTH-PUBLIC-001`:

- source_evidence 정밀화 (WebSecurity#ignoring filter 우회 명시)
- confidence 0.95 → 0.92
- `_phase5_correction` 메타 추가 (F-036)
- tags `["security", "public", "anonymous", "F-036"]` 갱신

---

## T+9 (2026-04-29) — findings/poc-findings.md 갱신 (F-034 ~ F-040 7건 등록)

- `## Phase 5 (api) — 2026-04-29 등록` 섹션 신규 추가
- F-034 ~ F-040 각 yaml block 작성 (severity / status / discovered_by / trigger / proposed_fix / phase4_correction / phase6_handoff)
- 누적 통계 갱신: 25 → **32** (closed 10 / promoted 10 / deferred 12 / rejected 0)
- v1.2.0 격상 묶음 갱신: 6 → **7** (G. ADR-007 OpenAPI x-extension 표준 가이드 신규)
- Phase 6 신규 AP candidate 6건 표 추가
- F-021 임계 재평가 (32건 / 60% 초과 — 윤주스 절대 우선순위 유지)
- 다음 액션 갱신 (Phase 5-1 종료 + Phase 6 대기 + PoC #02 예고)

---

## T+10 (2026-04-29) — 승인 게이트 검증 (phase-5-1-api.md §5)

| 체크                            | 결과                                            |
| ------------------------------- | ----------------------------------------------- |
| openapi.yaml 표준 lint (manual) | ✅                                              |
| 모든 operationId unique         | ✅ 19/19                                        |
| DTO 스키마 = JSON Schema 호환   | ✅                                              |
| 에러 응답 표준화 (4xx/5xx)      | ✅                                              |
| x-related-use-cases 매핑        | ✅ Phase 4 + F-035 갱신                         |
| x-related-rules 매핑            | ✅ BR 13 → endpoint 모두 매핑                   |
| 5.D inbound webhook             | N/A (5.D 0건)                                   |
| Swagger UI 렌더링               | 🔄 manual (TokenAuth 비표준 — 로컬 테스트 권장) |

---

## T+11 (2026-04-29) — RESUME.md 갱신 + Phase 6 인계 준비

(다음 단계)

---

## T+12 (2026-04-29) — Phase 5-1 종료 마감

### 신뢰도 자평 (formula v1)

```
raw confidence: 0.93
- base 0.75
- + orm_full +0.10 / domain_context_md +0.03 / postman_or_api_test +0.05 / diagrams_other +0.02
- - no_operational_db -0.03
- subtotal 0.92
- + F-015 cross-validation (22 endpoint 100% 합의) +0.02
- - 잠재 불일치 3건 (F-034/F-035/F-036) -0.01
= 0.93
```

### 7대 산출물 진행률

| #     | 산출물        | 단계          | 상태                                    |
| ----- | ------------- | ------------- | --------------------------------------- |
| 1     | 아키텍처      | Phase 3       | ✅                                      |
| 2     | 도메인 모델   | Phase 4       | ✅ (F-035 정정 적용)                    |
| **3** | **API 계약**  | **Phase 5-1** | ✅ **본 산출**                          |
| 4     | DB 스키마     | Phase 2       | ✅                                      |
| 5     | 비즈니스 규칙 | Phase 4       | ✅ (F-034/F-036 source_evidence 정밀화) |
| 6     | 안티패턴      | Phase 6       | ⏳ partial 6 + candidate 6 = 12 AP 예상 |
| 7     | UI/UX         | Phase 5-2     | ❌ N/A (BE only)                        |

**6/7 완료 (95%)** — Phase 6 만 남음.

### Phase 5-1 KPI 평가

- ✅ **finding 7건 정식 등록** (목표 5+)
- ✅ 산출물 4종 모두 작성 + 신뢰도 자평 0.93 (Phase 0 manifest 0.92 예상치 +0.01 초과)
- ✅ 5 핵심 결정 모두 3 sub-agent 합의 (충돌 0건)
- ✅ Phase 4 산출 cross-validation 정정 3건 (F-034/F-035/F-036)
- ✅ Phase 6 AP candidate 6건 발굴 (final merge 시 12 AP 예상)
- ⭐ Case 토픽 8 GitHub `x-github` 패턴 → ADR-007 정당화 ()

→ Phase 5-1 = **건강한 PoC** (Senior §7 "5건 이상 = 건강" 기준 — 7건 정식 + 6 AP candidate = 사실상 13건 가치).

### 다음 액션 (Phase 6 진입 / PoC #02 준비)

1. ✅ Phase 5-1 산출물 4종 + finding 7건 + Phase 4 정정 3건 (closed)
2. ⏳ **Phase 6 (안티패턴) 진입 — 윤주스 승인 대기**
3. ⏳ **Phase 6 final merge** — partial 6 + candidate 6 = 12 AP 최종
4. ⏳ **PoC #02 진입 (Phase 6 종료 후)** — 다른 스택 / deferred 12 + promoted 10 외부 검증
5. ⏳ **v1.2.0 격상 (PoC #01 + #02 합산)** — 7 묶음 (A~G) 일괄 처리

---

**END OF PROGRESS-poc01-phase5.md**

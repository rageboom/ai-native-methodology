# PoC #02 Phase 5-1 (API 계약) — 1원칙 plan

> 4원칙 1단계: 깊은 숙지 → plan.md 작성
> 작성 시각: 2026-04-29 / 방법론 v1.1.2

---

## §1. 진입 컨텍스트

### 누적 상태
- **방법론**: v1.1.2 PATCH 릴리스 완료 (high 4건 closed: F-007 / F-009 / F-016 / F-023)
- **PoC #01**: Phase 0~6 ✅ — 7대 산출물 6/7 (UI/UX 제외 100%) — finding 33건
- **PoC #02**: Phase 1~4 ✅ — finding 35건 (F-043~F-078) / raw confidence 0.93/0.85/0.92/**0.83**
- **누적 finding**: 68 (PoC #01 33 + PoC #02 35) / v1.2.0 격상 묶음 11개 (A~K)
- **본 PoC #02 분석 대상**: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
  - Spring Boot 3.3 / Java 21 / Multi-module Hexagonal (core / persistence / api)
  - 6 controller + 5 @Service + 7 @Entity + 4 Aggregate Root

### Phase 4 종료 분기 — 옵션 A (Phase 5-1 진입) 채택 ✅
- 윤주스 결정 (2026-04-29 본 세션): A
- 사유: CLAUDE.md 확정 순서 정합 + F-070 RFC 7231 위반 API 계약 cross-validation 필요 + 7대 산출물 6/7 도달

---

## §2. 메인 사전 raw fetch (★ 8건 핵심 발견)

본 PoC #02 가 PoC #01 보다 강한 입력을 제공:

### 2.1 ★★★ 사용자 작성 openapi.yaml ground truth 존재
- **파일**: `source/realworld-java21-springboot3/api-docs/openapi.yaml` (803 line)
- **OpenAPI 3.0.1** (PoC #01 산출은 3.1.0 — 본 PoC 는 3.0.1 → 마이너 디퍼)
- **19 unique operationId** (`Login` / `CreateUser` / `GetCurrentUser` / `UpdateCurrentUser` / `GetProfileByUsername` / `FollowUserByUsername` / `UnfollowUserByUsername` / `GetArticlesFeed` / `GetArticles` / `CreateArticle` / `GetArticle` / `UpdateArticle` / `DeleteArticle` / `GetArticleComments` / `CreateArticleComment` / `DeleteArticleComment` / `CreateArticleFavorite` / `DeleteArticleFavorite` / `GetTags`)
- **6 tags**: Articles / Comments / Favorites / Profile / Tags / User and Authentication
- **path × method = 19** (PoC #01 22 와 차이: 본 PoC 는 GetArticles 변형을 단일 path 로 통합 — 4 GET /articles 변형이 query 분기로 처리)
- **base path**: `servers: - url: /api` (PoC #01 보다 명확)

→ **PoC #02 는 19 endpoint × 19 operationId × 25 UC 매핑** (Phase 4 PROGRESS 의 "22 endpoint × 25 UC" 표기는 PoC #01 수치 차용 오류 — 본 plan 에서 19 로 정정)

### 2.2 controller 6종 ↔ openapi.yaml 1:1 정합 확인
| Controller | endpoint count | mapping |
|---|---|---|
| ArticleController | 6 | postArticle / getArticles / getArticle / updateArticle / deleteArticle / getArticleFeeds |
| UserController | 4 | signup / login / getUser / updateUser |
| UserRelationshipController | 3 | getUserProfile / follow / unfollow |
| ArticleCommentController | 3 | postComment / getComment / deleteComment |
| ArticleFavoriteController | 2 | like / unlike |
| TagController | 1 | getAllTags |
| **합계** | **19** | **= openapi.yaml 19** |

### 2.3 ★ F-070 spec 와 runtime 의미 비대칭 (RFC 7231 §4.2.2 위반 evidence 강화)
- openapi.yaml `/articles/{slug}/favorite` POST/DELETE → **200 OK** 명시 (idempotent 의미 codified)
- 그러나 Phase 4 분석 결과 service 단에서 throw (이미 favorited 상태 POST 시) → spec 와 runtime 의미 불일치
- ★ Profile follow/unfollow 도 200 OK 이지만 service 단 idempotent (`if (already)return;`) → **같은 도메인 내 비대칭** ★
- → **F-070 evidence 강화** (PoC #01 보다 강한 권위 — spec 명시적 200 → idempotent 의도)

### 2.4 ★ F-074 self-follow openapi spec 동시 결함
- openapi.yaml `/profiles/{username}/follow` POST → 200 OK 만 명시 / 422/409 부재
- runtime 도 막지 않음 → **spec + runtime 동시 결함 (이중 evidence)**

### 2.5 ★ F-073 limit cap 부재 — spec 가 더 약함
- openapi.yaml `limitParam: minimum: 1, default: 20` (no maximum)
- Phase 4 ArticleFacets:21 → cap 50 명시 (runtime 가 강함)
- **runtime 가 spec 보다 안전** — REC: spec 갱신 권고

### 2.6 HTTP status code 일관성 (PoC #01 F-040 재현)
- 모든 endpoint @ResponseStatus 부재 → default 200
- DELETE 도 200 (RFC 9110 §15.3.5 권고는 204)
- POST /api/users/login 만 @ResponseStatus(HttpStatus.CREATED) — login 은 신규 자원 생성 아님 (POST /users 와 의미 충돌)

### 2.7 Token security RFC 6750 비표준 (PoC #01 DEC-API-001 재현)
- securitySchemes: `Token: { type: apiKey, name: Authorization, in: header }`
- description: `Token xxxxxx.yyyyyyy.zzzzzz` 명시
- → **PoC #01 + PoC #02 동일 패턴 — RealWorld 공식 spec 의 권위 (외부 검증 ✅)**

### 2.8 PoC #01 finding 재현/비재현 외부 검증
- F-040 (DELETE 200 vs 204): ✅ **재현** (모든 controller @ResponseStatus 부재)
- F-038 (API 버저닝 부재): ✅ **재현** (info.version 1.0.0 / no /v1)
- F-037 (JWT iss/aud/iat/jti 4 claim): ⏳ Phase 5-1 sub-agent 검증 영역
- F-027 De Morgan: ❌ **비재현** (Phase 4 ArticleCommentService 깔끔 — PoC #01 critical 결함 해소 confirmed)

---

## §3. Phase 5-1 산출물 4종 (방법론 §5 deliverables)

```
output/api/
├── openapi.yaml              # 산업 표준 OpenAPI 3.x (외부 공유 가능)
├── api-extension.json        # AI 분석 메타 (operations[] + x-architectural-debt + x-known-bug)
├── api.md                    # 사람용 요약 + 운영 시나리오 + 사내 적용 권고
└── _manifest.yml             # Phase 5-1 매니페스트
```

### 3.1 openapi.yaml 작성 전략
**옵션 A — 기존 ground truth 그대로 + 보강 표기** (★ 채택 candidate)
- ground truth (api-docs/openapi.yaml) 그대로 복사 + `info.x-source: ground_truth` 추가
- 보강 영역: securitySchemes description 정밀화 + paths components 추가 (4xx/5xx 표준화)
- ADR-007 isomorphic 적용 — x-extension 분리 (api-extension.json)

**옵션 B — 새로 작성 (PoC #01 같은 방식)**
- 비추 — ground truth 무시는 신뢰도 손실

→ **A 채택**: 산업 표준 보전 + 사내 메타 분리 (PoC #01 ADR-007 정합)

### 3.2 api-extension.json 작성 전략
- **operations[] 19개** × `related_use_case_id` × `related_rules` × `affects_aggregates` 매핑
- **schemas_to_entities[]** ~16개 (User / Profile / Article / Comment / Tag + Request/Response wrappers)
- **x-architectural-debt**: PoC #02 는 LV-* 부재 (Hexagonal 다중 모듈 분리로 layered violation 회피)
  - 그러나 F-071 (UserRepositoryAdapter Hexagonal 위반) 은 architecture 단 → API 단 영향 X
- **x-known-bug**: F-070 (favorite RFC 위반) 1건 강조
- **x-related-findings**: F-070~F-078 + 신규 F-079~F-086 candidate
- **x-uc-mapping-summary**: 19 op × 25 UC (1:1 매핑 + system_internal 잔존)

### 3.3 api.md 작성 전략
- 사람용 요약 (~300 line)
- 운영 시나리오 (login → favorite → unfollow 등 핵심 flow)
- 사내 적용 권고 (REC-* 8~15건)
- F-070 RFC 7231 위반 강조 ★

### 3.4 _manifest.yml 작성 전략
- PoC #01 _manifest.yml 동일 구조 (5 sub-agent 결정 + 신뢰도 산정 + Phase 6 인계)
- approval_gate 체크리스트 8건

---

## §4. 변경 대상

### 4.1 Phase 4 산출 cross-validation 정정
PoC #01 Phase 5-1 에서 F-035 / F-034 / F-036 정정 발생 → PoC #02 도 동일 패턴 가능성:

**잠정 정정 후보** (sub-agent 결과 후 확정):
- domain.json — UC system_internal 분류 cross-check (PoC #01 F-035 패턴 재현 가능)
- rules.json — BR-AUTH-* source_evidence 정밀화 (PoC #01 F-034/F-036 재현 가능)

### 4.2 Phase 5-1 산출 신규 작성
- `output/api/openapi.yaml` (신규 — ground truth 기반)
- `output/api/api-extension.json` (신규)
- `output/api/api.md` (신규)
- `output/api/_manifest.yml` (신규)

### 4.3 finding 등록
- 신규 F-079 ~ F-086 candidate 8건 (메인 사전 raw fetch §2.3~2.7)
- PoC #01 F-040 / F-038 / F-037 재현 검증

### 4.4 PROGRESS 갱신
- `.claude/PROGRESS-poc02-phase5.md` 신규 작성 (T+0~ 시간순)

---

## §5. 영향도

### 5.1 Schema 영향
- 신규: `output/api/` 디렉토리 (PoC #02 첫 phase 5-1 산출)
- 갱신: domain.json / rules.json (cross-validation 결과 따라)

### 5.2 Methodology 영향
- v1.2.0 묶음 G (ADR-007 OpenAPI x-extension) PoC #02 외부 검증 ★
- v1.2.0 묶음 J (Hexagonal port-adapter 가이드) — Phase 5-1 영향 X (architecture 단)
- 신규 묶음 가능성: deliverable 03 (openapi.yaml info.version vs servers vs path /v1 표준) — F-082 candidate

### 5.3 신뢰도 예측
- Phase 5-1 raw confidence 예상: **0.95** ★
  - base 0.75 / orm_full +0.10 / domain_context +0.03 / **openapi_ground_truth +0.07** ★ (PoC #01 postman_or_api_test +0.05 보다 강한 입력) / diagrams_other +0.02 / no_operational_db -0.03 = 0.94
  - cross_validation_modifier (3 sub-agent 합의 예상) +0.01 = **0.95**
  - PoC #01 0.93 대비 +0.02 (ground truth openapi.yaml 효과)

---

## §6. sub-agent 가벼운 전략 (Phase 4 계승)

Phase 4 가벼운 전략 성공 (Document 152초 / Senior 66초 / Phase 3 30+분 대비 30배 단축).
Phase 5-1 도 동일:

| Agent | scope | 시간 cap | 산출 line |
|---|---|---|---|
| **Document** | RFC 7231 §4.2.2 (idempotency) + RFC 5789 (PATCH) + RFC 9110 (status codes 200/204) + RFC 7807 (Problem Details) + OpenAPI 3.0 vs 3.1 + Spring Security 6.x | 8분 cap | 200~300 |
| **Senior** | F-070 spec/runtime 비대칭 cross-check + 19 op × 25 UC 매핑 검증 + 8 candidate severity 평가 + PoC #01 F-040/F-038 재현 확정 | 10분 cap | 300~400 |
| ~~Case~~ | **생략** (Phase 1~4 누적 데이터 충분 — Netflix/Stripe/GitHub 사례 안정화) | — | — |

### 6.1 prompt 단순화 (Phase 3 교훈)
- 우선순위 read 영역 명시 (전수 read 금지)
- 시간 cap 강제
- 산출 line 목표 명시

### 6.2 F-015 cross-validation 패턴
- 메인 사전 raw fetch 8건 → sub-agent 가 **같은 데이터 cross-check**
- sub-agent 가 메인 모르는 신규 발견 우선

---

## §7. 산출물 체크리스트

### 7.1 deliverable 4종
- [ ] `output/api/openapi.yaml` (~500 line / OpenAPI 3.0.1 ground truth 기반 보강)
- [ ] `output/api/api-extension.json` (~400 line / operations 19 + schemas 16)
- [ ] `output/api/api.md` (~300 line / 사람용 요약)
- [ ] `output/api/_manifest.yml` (~150 line)

### 7.2 deterministic 검증
- [ ] openapi.yaml YAML parse ✅
- [ ] api-extension.json JSON parse ✅
- [ ] operationId unique 19/19
- [ ] 모든 operation × related_use_case_id 매핑 (1:1 또는 system_internal 처리)
- [ ] 모든 operation × related_rules 매핑 (BR 14)

### 7.3 approval_gate 체크리스트 (방법론 §5 + research §10)
- [ ] openapi.yaml 표준 lint 통과
- [ ] 모든 operationId unique
- [ ] DTO 스키마 = JSON Schema 호환
- [ ] 에러 응답 표준화 (4xx/5xx)
- [ ] x-related-use-cases 매핑 = 사용자 검토
- [ ] x-related-rules 매핑 = 사용자 검토
- [ ] 5.D inbound webhook (N/A — 0건 예상)
- [ ] Swagger UI 렌더링 검증 (manual)

### 7.4 Phase 4 산출 cross-validation 갱신
- [ ] domain.json UC 정정 (필요 시)
- [ ] rules.json BR-AUTH-* source_evidence 정밀화 (필요 시)

### 7.5 finding 등록 + PROGRESS
- [ ] findings/poc-findings.md 갱신 (F-079 ~ F-086 + 재현 확정)
- [ ] .claude/PROGRESS-poc02-phase5.md 시간순 작성

---

## §8. 다음 단계 (4원칙 사이클)

1. **2원칙** — Document + Senior 가벼운 spawn (예상 8~12분)
2. **research-phase5-poc02.md 통합** (3-합의 / 충돌 해소 / 6 핵심 결정)
3. **3원칙** — 윤주스 승인 + 산출 4종 작성 (Auto Mode 일괄 일 수 있음)
4. **finding 등록 + PROGRESS 갱신**
5. **Phase 5-1 종료 — Phase 6 진입 (or PoC #03 분기) 결정**

---

## §9. Lessons Learned 영역 (4원칙)

본 plan 작성 후 실패/재작업 발생 시 본 섹션에 기록:

(공란 — Phase 5-1 진행 중 갱신)

---

**END OF plan-phase5-poc02.md (1원칙 ✅)**

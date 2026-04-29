# Research — PoC #02 Phase 5-1 통합 (Document + Senior)

> 4원칙 2단계: 에이전트 팀 토론 → research.md 통합
> 작성 시각: 2026-04-29 / 방법론 v1.1.2

---

## §1. sub-agent 결과 요약

| Agent | 시간 | 산출 line | 핵심 결과 |
|---|---|---|---|
| Document | 1분 33초 | 215 | RFC 권위 + OWASP + Spring Boot 3.x 평가 / 8 candidate 권위 평가 / REC-API-* 9건 |
| Senior | 2분 5초 | 320 | F-070 + F-079 묶음 critical 격상 ★ / Phase 4 cross-validation 정합 ✅ / 신규 발견 2건 / Phase 6 AP candidate 8건 |
| ~~Case~~ | 생략 | — | Phase 1~4 누적으로 충분 (Phase 4 동일 전략) |

**가벼운 전략 효과**: Phase 4 (Document 152초 / Senior 66초) 비교 → Document 동일급 / Senior 약 2배 (5 파일 read 확장 효과). Phase 3 30+분 대비 약 10배 단축.

---

## §2. 3-합의 영역 (Document ∩ Senior)

### 2.1 F-080 medium 유지 (OWASP API4)
- Document: `runtime cap 50 ✅ / spec maximum 부재 → contract drift`
- Senior: `runtime cap 50 존재 → DoS 실제 영향 제한적 / 단 spec 미명시`
- **합의**: medium 유지 — OWASP API4 권고 / spec 갱신 권고 (REC-API-LIMIT-CAP-001)

### 2.2 F-081 low 강등
- Document: `RFC 급 권위 부재 / legacy artifact cleanup`
- Senior: `swagger-codegen 2.x 잔재 / functional 영향 0`
- **합의**: medium → **low 강등** ✅

### 2.3 F-082 / F-083 / F-084 / F-086 — 합의 medium / low / medium / medium 유지
- 두 에이전트 모두 메인 raw 와 동일 결론

---

## §3. 충돌 해소

### 3.1 ★ F-079 severity (Document = high 확정 / Senior = F-070 묶음 critical 격상)

| 차원 | Document | Senior |
|---|---|---|
| 평가 | high 확정 — RFC 7231 §4.2.2 + Profile 비대칭 | F-079 단독 X — F-070 (Phase 4) 의 evidence 합산 → F-070 격상 critical |
| 권고 | F-079 신규 등록 high | F-070 격상 critical, F-079 는 evidence 묶음 |

**해소 — Senior 채택**:
- F-070 (Phase 4 도메인 발견) + F-079 (Phase 5-1 spec 발견) 가 **같은 결함의 두 측면** ★
- 단독 등록보다 묶음 처리가 효율적 (Phase 6 AP-API-001 critical 단일 등록)
- 합의: **F-070 high → critical 격상** + **F-079 는 F-070 evidence 보강 노트** (별도 finding 신규 등록 X, F-070 갱신)

### 3.2 F-085 severity (Document = low 확정 / Senior = medium 격상)

| 차원 | Document | Senior |
|---|---|---|
| 평가 | login 200 정합 (RFC 9110 §15.3.2) — runtime 201 만 의미적 위반 → low | F-079 와 동형 패턴 (spec 200 / runtime 201) — HTTP semantic 위반 → medium |

**해소 — Senior 채택**:
- Document 는 RFC 권위만 / Senior 는 **패턴화** 관점 (F-079 와 동형 spec/runtime drift)
- spec/runtime drift 가 패턴이 됨 → AP-API-001 의 두 번째 evidence 가치
- 합의: **F-085 low → medium 격상** ✅

---

## §4. 6 핵심 결정 (Phase 5-1)

### DEC-PHASE5-POC02-001 — F-070 critical 격상 + F-079 묶음 처리 ★★★
- **결정**: F-070 (Phase 4 high) → **critical 격상** / F-079 는 별도 finding 신규 등록 X, F-070 evidence 보강 노트 추가
- **근거**:
  - 도메인 규칙 (RFC 7231 §4.2.2) 위반 + spec/runtime drift 이중 결함
  - 클라이언트 신뢰 이중 손상 (정상 client 가 spec 따라 200 기대 → 422 수신 → DLQ/retry storm)
- **영향**: poc-findings.md F-070 갱신 + Phase 6 AP-API-001 critical 후보 신설

### DEC-PHASE5-POC02-002 — 산출 LLM 재작성 회피, ground truth 그대로 복사 + 보강
- **결정**: `openapi.yaml` 은 ground truth (api-docs/openapi.yaml 803 line) 그대로 복사. AI 분석 메타는 `api-extension.json` 만 신설.
- **근거**:
  - Senior §8: hallucination 리스크 회피 (F-015 cross-check 패턴 적용)
  - PoC #01 ADR-007 (OpenAPI x-extension) isomorphic — 표준 spec 보전 + 사내 메타 분리
- **영향**: 산출 작성 시간 단축 + 품질 안정

### DEC-PHASE5-POC02-003 — 8 candidate severity 일괄 적용
- **결정**:
  - F-079: **F-070 묶음 (critical 격상)** ★
  - F-080: medium 유지 (OWASP API4)
  - F-081: medium → low 강등 ✅
  - F-082: medium 유지
  - F-083: low 유지
  - F-084: medium 유지
  - F-085: low → medium 격상 ✅
  - F-086: medium 유지
- **근거**: §3 충돌 해소 + §2 합의

### DEC-PHASE5-POC02-004 — Senior 신규 발견 2건 등록
- **결정**:
  - **F-087 medium**: ModelAndView 307 internal redirect 클라이언트 visible (UserController:49-51) — REST 원칙 위반
  - **AP-API-006 candidate (Phase 6)**: controller 단 multi-service orchestration (ArticleFavoriteController:23-28) — Application Service 부재
- **근거**: Senior §5.1 + §5.2 신규 발견

### DEC-PHASE5-POC02-005 — Phase 6 AP candidate 8건 예고
- **결정**: Phase 5-1 산출의 `_manifest.yml.phase_6_handoff` 에 8 candidate 명시
  - AP-API-001 critical (spec/runtime drift) ★
  - AP-API-002 medium (DELETE 200 vs 204)
  - AP-API-003 medium (API versioning)
  - AP-API-004 medium (limit no max)
  - AP-API-005 medium (PUT vs PATCH)
  - AP-API-006 medium (controller orchestration) — 신규
  - AP-API-007 low (codegen legacy)
  - AP-API-008 medium (internal redirect 307) — 신규
- **근거**: Senior §7 + Phase 4 6 candidate 합산 → Phase 6 14 candidate

### DEC-PHASE5-POC02-006 — Phase 4 cross-validation 정정 0건
- **결정**: PoC #01 F-035 (UC system_internal 오분류) 패턴 **비재현 ✅**. Phase 4 산출 정정 불필요.
- **근거**: Senior §2.1/§2.3 — 19 op × 25 UC 매핑 정합 + system_internal 잔존 2건 정당 (UC-ARTICLE-IS-FAVORITE / UC-COMMENT-GET)

---

## §5. 9 finding 통합 (F-079 ~ F-087)

| ID | 메인 | Document | Senior | **최종** | 처리 |
|---|---|---|---|---|---|
| F-079 | high | high 확정 | **F-070 묶음 critical 격상** | **F-070 evidence 보강** | F-070 갱신 (별도 등록 X) |
| F-080 | medium | medium 확정 | medium 유지 | **medium** | 신규 등록 |
| F-081 | medium | low 조정 | low 강등 | **low** | 신규 등록 |
| F-082 | medium | medium 확정 | medium 유지 | **medium** | 신규 등록 (F-038 재현) |
| F-083 | low | low 확정 | low 유지 | **low** | 신규 등록 (F-040 재현) |
| F-084 | medium | medium 확정 | medium 유지 | **medium** | 신규 등록 (DEC-API-001 재현) |
| F-085 | low | low 확정 | **medium 격상** | **medium** | 신규 등록 |
| F-086 | medium | medium 확정 | medium 유지 | **medium** | 신규 등록 |
| F-087 | (Senior 신규) | — | medium | **medium** | 신규 등록 (Senior §5.2) |

**합계**: F-080 ~ F-087 = **8 신규 finding** + F-070 critical 격상 1건 = 9건 처리.

**누적 통계 (Phase 5-1 종료 시)**:
- PoC #02: 35 + 8 신규 = **43**
- 누적: 33 (PoC #01) + 43 (PoC #02) = **76**

---

## §6. 사내 적용 권고 (REC-API-* 9건 — Document §6 채택)

| ID | 제목 | 우선순위 | 근거 |
|---|---|---|---|
| REC-API-IDEMPOTENCY-001 | favorite/unfavorite service 단 idempotent 정렬 | **high** | RFC 7231 — F-070/F-079 |
| REC-API-LIMIT-CAP-001 | openapi `limitParam.maximum: 50` 명시 | medium | OWASP API4 — F-080 |
| REC-API-VERSIONING-001 | URI path `/v1/` prefix 도입 | medium | F-082 / PoC #01 F-038 |
| REC-API-BEARER-MIGRATION-001 | Token (apiKey) → Bearer JWT + Spring Security 6 | medium | F-084 / DEC-API-001 |
| REC-API-PATCH-001 | UpdateCurrentUser PUT → PATCH | medium | F-086 |
| REC-API-PROBLEM-DETAILS-001 | GenericErrorModel → RFC 7807/9457 ProblemDetail | medium | RFC 7807 / Spring 6 |
| REC-API-STATUS-EXPLICIT-001 | controller `@ResponseStatus` 명시 | low | RFC 9110 — F-083 / F-085 |
| REC-API-OPENAPI-31-001 | OpenAPI 3.0.1 → 3.1 격상 | low | OpenAPI 3.1 spec |
| REC-API-CODEGEN-CLEANUP-001 | x-codegen-request-body-name 제거 | low | F-081 |

**+ Senior §5.2 신규**: REC-API-NO-INTERNAL-REDIRECT-001 (medium) — signup → login 직접 호출 또는 client 측 redirect

---

## §7. 산출 작성 전략 (DEC-002 적용)

### openapi.yaml
- ground truth (api-docs/openapi.yaml 803 line) 그대로 복사 → `output/api/openapi.yaml`
- 보강 0건 (Senior §8 — hallucination 회피)

### api-extension.json
- ADR-007 isomorphic — 사내 메타 분리
- `operations[]` × 19 (operationId / composes_uc[] / breaks_br[] / anti_pattern_refs[] / spec_runtime_drift{} / recommended_severity)
- **F-070 묶음** `spec_runtime_drift` 명시 (CreateArticleFavorite + DeleteArticleFavorite + Login)
- **5 복합 매핑** `composes_uc[]` ≥ 2 캡처 (GetProfileByUsername / GetArticles / GetArticle / UpdateArticle)

### api.md
- 19 op × severity heatmap (Senior §4 표 차용)
- 8 신규 AP candidate 표 (Phase 6 인계)
- Phase 4 BR 14 매핑 표 (Senior §2.2 차용)
- 9 REC-API-* 권고 표
- F-070 critical + spec/runtime drift 패턴 강조

### _manifest.yml
- 6 핵심 결정 (DEC-PHASE5-POC02-001 ~ 006)
- raw confidence 산정 — 예상 0.92~0.94
- approval_gate 체크리스트 8건
- Phase 6 인계 (8 AP candidate + Phase 4 6 candidate = 14)

---

## §8. 신뢰도 산정 (formula v1)

| 차원 | 값 |
|---|---|
| base | 0.75 |
| modifier orm_full | +0.10 |
| modifier domain_context_md | +0.03 |
| modifier postman_or_api_test (openapi.yaml ground truth) | +0.07 ★ (PoC #01 +0.05 보다 강한 입력) |
| modifier diagrams_other | +0.02 |
| penalty no_operational_db | -0.03 |
| **subtotal** | **0.94** |
| F-015 cross-validation +0.01 (3-합의 영역 충돌 2건만) | +0.01 |
| F-070 격상 critical evidence 강화 | -0.02 (기존 분류 부분 정정) |
| **raw_confidence** | **0.93** |

**PoC #01 0.93 와 동급** ✅ — ground truth 효과 + Phase 4 정정 0 (학습 효과) 균형.

---

## §9. 다음 단계 (3원칙 사용자 승인 영역)

1. **3원칙 — 윤주스 승인** (DEC-PHASE5-POC02-001~006 일괄)
2. **산출 4종 작성** (Auto Mode 일괄):
   - `output/api/openapi.yaml` (복사)
   - `output/api/api-extension.json` (신설)
   - `output/api/api.md` (작성)
   - `output/api/_manifest.yml` (작성)
3. **finding 등록** (poc-findings.md 갱신 — F-070 critical 격상 + F-080~F-087 8건)
4. **PROGRESS-poc02-phase5.md T+1~ 시간순 갱신**
5. **Phase 5-1 종료 → Phase 6 진입 (or PoC #03 분기) 결정**

---

## §10. approval_gate 체크리스트 (산출 작성 전 검증)

- [ ] openapi.yaml 표준 lint 통과 (ground truth 그대로 → 자동 ✅)
- [ ] 모든 operationId unique 19/19
- [ ] DTO 스키마 = JSON Schema 호환 (3.0.1)
- [ ] 에러 응답 표준화 (GenericError 단일 — REC-API-PROBLEM-DETAILS-001 권고만)
- [ ] x-related-use-cases 매핑 = 사용자 검토 (api-extension.json composes_uc[])
- [ ] x-related-rules 매핑 = 사용자 검토 (api-extension.json breaks_br[])
- [ ] 5.D inbound webhook (N/A — 0건)
- [ ] Swagger UI 렌더링 검증 (manual — Token 비표준 caveat)

---

**END OF research-phase5-poc02.md (2원칙 ✅ — 3원칙 사용자 승인 영역)**

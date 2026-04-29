# PROGRESS — PoC #02 Phase 5-1 (API 계약)

> 시간순 로그 대전제 (feedback_progress_log.md) 적용

---

## T+0 (2026-04-29) — Phase 5-1 진입 + 1원칙 plan 작성 + 2원칙 sub-agent 병렬 spawn ✅

### 진입 컨텍스트
- Phase 1 ✅ (raw 0.93 / 6 finding) / Phase 2 ✅ (0.85 / 11) / Phase 3 ✅ (0.92 / 9) / Phase 4 ✅ (0.83 / 9 — F-070~F-078)
- 누적 finding: 35 (PoC #02) + 33 (PoC #01) = 68
- 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
- Auto Mode 활성

### 사용자 결정 (Phase 4 분기점) — 옵션 A 채택
- 옵션 A = Phase 5-1 (API) 진입 — CLAUDE.md 확정 순서 정합
- 사유: F-070 RFC 7231 위반 API 계약 cross-validation 필요 + 7대 산출물 6/7 도달

### 메인 사전 raw fetch (★ 8건 핵심 발견)

1. ★★★ **사용자 작성 openapi.yaml ground truth 존재** (`api-docs/openapi.yaml` 803 line / OpenAPI 3.0.1)
   - 19 unique operationId / 6 tags / Token security (apiKey 비표준)
   - **PoC #01 보다 강한 입력** — 신뢰도 +0.07 예상 (postman_or_api_test +0.05 대비)
2. controller 6종 ↔ openapi.yaml 1:1 정합 (19 endpoint = path × method)
   - Phase 4 PROGRESS 의 "22 endpoint × 25 UC" 표기는 **PoC #01 수치 차용 오류** — plan 에서 19 로 정정
3. ★ F-070 spec ↔ runtime 의미 비대칭 → **F-079 신규 candidate (high)**
   - openapi `/articles/{slug}/favorite` POST/DELETE 200 OK 명시 (idempotent codified)
   - 그러나 service 단 throw → spec/runtime 거짓말
   - **Profile follow/unfollow 는 service 단 idempotent** → 같은 도메인 내 비대칭
4. F-074 (self-follow) — openapi spec 동시 결함 (이중 evidence)
5. F-073 (limit) — openapi `minimum: 1, default: 20` no max / runtime cap 50 → spec 가 더 약함
6. PoC #01 F-040 (DELETE 200): ✅ **재현** (모든 controller @ResponseStatus 부재)
7. PoC #01 F-038 (API 버저닝): ✅ **재현** (info.version 1.0.0 / no /v1)
8. PoC #01 DEC-API-001 (Token apiKey 비표준): ✅ **재현** (RealWorld 공식 spec 의 권위 외부 검증)

### 신규 finding candidate 8건
- F-079 (high) — favorite spec/runtime 비대칭 ★
- F-080 (medium) — limit no max
- F-081 (medium) — x-codegen-request-body-name legacy
- F-082 (medium) — API 버저닝 부재 (PoC #01 F-038 재현)
- F-083 (low) — DELETE 200 (PoC #01 F-040 재현)
- F-084 (medium) — Token apiKey 비표준 (PoC #01 DEC-API-001 재현)
- F-085 (low) — POST /users/login @ResponseStatus(CREATED) 의미 위반
- F-086 (medium) — PUT /user 부분 갱신 → PATCH 권고 (RFC 5789)

### 1원칙 — plan-phase5-poc02.md 작성 ✅
- 산출: `.claude/plans/plan-phase5-poc02.md` (~270 line)
- 9 섹션 (진입 / 사전 raw fetch 8건 / 산출물 4종 / 변경 대상 / 영향도 / sub-agent 가벼운 전략 / 산출물 체크리스트 / 다음 단계 / Lessons Learned 영역)

### 2원칙 — Document + Senior 가벼운 sub-agent 병렬 spawn ✅
- **Case 생략** (Phase 1~4 누적 데이터 충분 — Phase 4 동일 전략)
- prompt 단순화 + 시간 cap 강제 (Phase 3 30+분 교훈)

| Agent | scope | 시간 cap | 산출 line |
|---|---|---|---|
| Document | RFC 7231 §4.2.2 / RFC 9110 / RFC 5789 / RFC 7807 / OpenAPI 3.x / Spring Boot 6.x | 8분 | 200~300 |
| Senior | F-079 cross-check + 19 op × 25 UC 매핑 + 8 candidate severity + 우선순위 5 파일 read | 10분 | 300~400 |

### 다음 액션
- ⏳ sub-agent 완료 대기 (예상 8~12분)
- ⏳ research-phase5-poc02.md 통합
- ⏳ 3원칙 — 사용자 승인 + 산출 4종 작성

---

## T+1 (2026-04-29) — sub-agent 결과 + research 통합 ✅

### sub-agent 결과 (가벼운 전략 효과)
- Document: 1분 33초 / 215 line — RFC 권위 + OWASP + Spring Boot 3.x / 8 candidate 평가 / REC-API-* 9건
- Senior: 2분 5초 / 320 line — F-070 + F-079 묶음 critical 격상 ★ / Phase 4 cross-validation 정합 ✅ / 신규 발견 2건 / Phase 6 AP candidate 8건
- ~~Case 생략~~ (Phase 1~4 누적 충분 — Phase 4 동일 전략)
- **Phase 4 효과 정합** (Document 152초 / Senior 66초 → 본 phase 동급) — Phase 3 30+분 대비 약 10배 단축

### F-015 결과
- 메인 raw 8건 (openapi.yaml 803 line + Phase 4 service 분석) Document 와 Senior 모두 그대로 사용
- 추가 fact 도입 없음 (사실 오류 0)

### 충돌 해소 (3건)
- **F-079 severity**: Document = high 확정 / Senior = F-070 묶음 critical → **Senior 채택** (F-070 격상 + F-079 merge)
- **F-085 severity**: Document = low 확정 / Senior = medium 격상 (F-079 동형 패턴) → **Senior 채택** (drift 패턴화)
- F-081 severity: Document = low 강등 / Senior = low 강등 → 합의 low

### research-phase5-poc02.md 통합 ✅
- 10 섹션 (sub-agent 요약 / 합의 / 충돌 해소 / 6 핵심 결정 / 9 finding 통합 / REC-API-* 권고 / 산출 작성 전략 / 신뢰도 산정 / 다음 단계 / approval_gate)

---

## T+2 (2026-04-29) — 3원칙 윤주스 승인 + 산출 4종 작성 ✅

### 3원칙 — 6 핵심 결정 일괄 승인 (윤주스 "Y")
- DEC-001 ★★★ F-070 critical 격상 + F-079 묶음
- DEC-002 산출 LLM 재작성 회피, ground truth 그대로 + 보강
- DEC-003 8 candidate severity 일괄 적용 (F-079 묶음 / F-081 low 강등 / F-085 medium 격상 / 5 유지)
- DEC-004 Senior 신규 발견 2건 등록 (F-087 + AP-API-006 candidate)
- DEC-005 Phase 6 AP candidate 8건 예고
- DEC-006 Phase 4 cross-validation 정정 0건 (학습 효과 입증)

### 산출 4종 작성 (output/api/) ✅

| 파일 | line | 비고 |
|---|---|---|
| openapi.yaml | 802 | ground truth 그대로 복사 (DEC-002) |
| api-extension.json | 588 | operations 19 + schemas 18 + composes_uc[] + spec_runtime_drift |
| api.md | 236 | 19 op heatmap + 8 AP candidate + 10 REC-API-* + 운영 시나리오 |
| _manifest.yml | 286 | 6 결정 + raw confidence 0.93 + Phase 6 인계 14 candidate |

**합계**: 1,912 line (PoC #01 약 1,200 line 대비 +59%)

### deterministic 검증 ✅
- openapi.yaml 802 line ground truth 자동 정합
- api-extension.json JSON parse OK / operations 19 / schemas 18
- operationId unique 19/19
- composes_uc[] 매핑 19/19 / breaks_br[] 14/14

---

## T+3 (2026-04-29) — finding 등록 ✅

### findings/poc-findings.md 갱신
- **F-070 high → critical 격상** (Phase 5-1 격상 사유 + spec/runtime drift evidence 추가)
- **F-079 → F-070 merged** 표기
- **8 신규 finding 등록** (F-080 ~ F-087)
- 누적 통계 갱신 (Phase 4 → Phase 5-1)
- Phase 5-1 KPI 평가 섹션 추가

### 누적 통계
```
PoC #02: 35 + 8 신규 = 43 (F-079 merged X)
누적: 33 (PoC #01) + 43 (PoC #02) = 76
promoted: 41 (PoC #01 10 + PoC #02 31)
v1.2.0 묶음: 11 (변동 없음 — 신규 ADR 후보는 묶음 내 통합)
```

### PoC #01 외부 검증 결과
- 재현 ✅ 3건: F-038 → F-082 / F-040 → F-083 / DEC-API-001 → F-084 (v1.2.0 합산 격상 데이터)
- 비재현 ✅ 3건: AP-DOMAIN-001 / F-027 / F-035 (학습 효과 입증)

---

## Phase 5-1 종료 — 신뢰도 자평 (formula v1)

```
raw confidence: 0.93
- base 0.75
- inputs: source_code + orm + inventory + db_schema + architecture + openapi.yaml ground truth ★
- modifier:
  - orm_full +0.10
  - domain_context_md +0.03
  - openapi.yaml ground truth +0.07 (PoC #01 +0.05 보다 강한 입력)
  - diagrams_other +0.02
- penalty:
  - no_operational_db -0.03
- subtotal 0.94
- F-015 cross-validation +0.01 (3-합의 + 충돌 2건만)
- F-070 격상 evidence 보강 -0.02 (기존 분류 부분 정정)
- raw_confidence 0.93
- per_area:
  - endpoint_identification: 1.00 (ground truth)
  - request_response_schema: 0.95
  - error_codes: 0.65 (GenericErrorModel 단일)
  - auth_authorization: 0.85 (Token apiKey 비표준)
  - operation_to_uc_mapping: 0.95
  - spec_runtime_drift_detection: 0.97 (F-070 + F-085 + F-080 명시 캡처)
- PoC #01 0.93 동급 ✅ (ground truth 효과 + Phase 4 정정 0 균형)
```

### Phase 5-1 KPI 평가 ✅

- ✅ finding 8건 신규 등록 (F-080~F-087) + F-070 critical 격상 + F-079 merged = 9건 처리
- ✅ schema 검증 통과 (openapi.yaml + api-extension.json parse OK)
- ✅ 6 핵심 결정 (DEC-PHASE5-POC02-001~006) — 윤주스 일괄 승인
- ★ **F-070 critical 격상** — spec/runtime drift + RFC 7231 이중 결함
- ★ **F-085 medium 격상** (drift 패턴화 — F-079 동형)
- ★ **Senior 신규 발견 2건** (F-087 + AP-API-006 candidate)
- ★ **PoC #01 재현 3건** + 비재현 3건 (학습 효과 + v1.2.0 합산 격상 데이터)
- ★ **가벼운 sub-agent 전략 성공** — Phase 3 30+분 대비 약 10배 단축
- ★ **openapi.yaml ground truth 효과** — raw confidence 0.93 (PoC #01 동급 + ground truth 정합 1.00)

---

## 다음 단계 (Phase 6 진입 또는 PoC #03 분기)

옵션 A — Phase 6 (anti-patterns) 진입:
- antipatterns.json final merge (Phase 4 partial 6 + Phase 5-1 candidate 8 = 14 AP)
- AP-API-001 critical (F-070 + F-079 + F-085 묶음) 등록
- 7대 산출물 6/7 (UI/UX 만 N/A — BE only) → PoC #02 종료

옵션 B — §8.1 강제: PoC #03 (다른 stack/도메인) 진입:
- 학습 효과 영역 진입 신호 강함
- v1.2.0 격상 데이터 충분 (메타 finding 3건 + 본 PoC 특이 5건 + PoC #01 재현 3건)

윤주스 결정 영역.

---

**END OF PROGRESS-poc02-phase5.md (Phase 5-1 ✅ 완료)**

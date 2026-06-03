# plan — ③ Type 2 adopter-corroboration 캡처 배선 (이번 세션 빌드)

> 사용자 결단(2026-06-01 / session 63차): ② = dogfood 대상 `alvaromrveiga/ecommerce-backend` 확정(후속) / **③ = 캡처 배선만 이번 세션 빌드**.
> 근거 SSOT: `plan-type2-external-adoption.md` §Phase 1 감사 결과 (capture readiness **0.08** = 최대 공백 / EXT-CAPTURE-01/03/04/05).
> 정직 framing: 본 작업 = **배선(necessary, not sufficient)**. Type 2 corroboration "측정"은 실 외부 adopter 가 돌려야 발생 (no-simulation). 본 세션 = 그 측정을 가능케 하는 capability 신설. self-referential prod-value inflation ❌ (`feedback_self_referential_corrective_drift`).

## 문제 (Phase 1 감사 / capture readiness 0.08)

- **EXT-CAPTURE-01**: adopter-corroboration **schema 0** — 외부 실행 결과를 담을 데이터 계약 부재.
- **EXT-CAPTURE-05**: chain 완주 시 자동 emit **0** — 결과 캡처 트리거 부재.
- **EXT-CAPTURE-03**: 익명화 규약 **0** — 외부 evidence 의 PII/사내정보 제거 규약 부재.
- **EXT-CAPTURE-04**: ledger 산입 경로 **0** — 캡처된 evidence 를 maintainer 가 수집할 경로 부재.

## 설계 (additive / breaking 0 / 결정론 / 4 컴포넌트 + REVISE 5종 흡수)

### C1 — `schemas/adopter-corroboration.schema.json` (신규 schema)

외부 adopter 1 chain cycle 결과의 익명화 데이터 계약. top-level `additionalProperties:false` strict.
재사용: `work-unit-manifest.scenario` enum (S1/S2/S3/greenfield) + `state.last_gate` shape (gate #1~#5 / decision / validator_findings 5 severity). [official-docs ✅ draft-2020-12 + $defs 유효]
필드:

- `schema_version` / `plugin_version` / `captured_at`(date-time) / `$schema_origin`.
- `adopter` { `adopter_id`(opaque sha256 / PII 아님) / `org_type` enum: internal-team/external-oss/individual/undisclosed }.
- `project` { `project_hash`(opaque) / `stack_signals`(string[]) / `scenario` / **`loc_bucket` enum 고정**: `<1k`/`1k-10k`/`10k-100k`/`100k+`/`undisclosed` [REVISE-4] }.
- `chain_run` { `completed`(bool) / `terminal_stage` / `gates`[]: {id #1~#5, stage, decision, validator_findings{5 severity}} }.
- `findings_summary` { critical/high/medium/low/info + total }.
- `coverage`(optional) { link_coverage / test_pass_rate / line_branch_coverage }.
- `user_feedback`(optional) { `summary`(string, maxLength) / `friction_points`(string[]) }.
- `anonymization` { `applied`(bool) / `redaction_count`(int) / `method`(string — "best-effort regex" 정직 표기) [official-docs ✅ regex=best-effort] }.

### C2 — `tools/adopter-evidence-packager` (26번째 도구)

db-assets-validator 패턴 (src/packager.js 순수 + src/cli.js + test + fixtures).

- `package` flow: state.json + scope manifest + findings + traceability-matrix 읽기 → corroboration 합성 → **PII 익명화** → ajv 검증 → leak guard → `.aimd/output/adopter-corroboration.json` write.
- **PII SSOT [REVISE-2]**: `/smilegate\.(com|net)|sangcl/i` + email + 절대경로 + RSA key 패턴을 **`tools/_shared/pii-patterns.js`** 로 추출 → packager + release-readiness check27 양쪽 import (regex 복사 ❌ / drift attractor 회피). [check27 import 시 self-test 무회귀 확인 / 위험 시 inline 복귀 + cross-ref 주석 fallback]
- `adopter_id`/`project_hash` = sha256(salt + id) opaque (non-reversible / EXT-CAPTURE-03). [official-docs ✅ 단 "OWASP 표준" 귀속 ❌ / "업계 관행" 표기]
- **익명화 순서 [REVISE-3]**: free-text(stack_signals/feedback) 먼저 redact → 그 후 leak guard 가 post-redaction 스캔 → 잔존 PII > 0 시 **위반 필드 경로 emit + exit 1**(silent wall ❌).
- CLI: `--state` `--manifest` `--findings` `--matrix` `--out` `--org-type` `--salt` `--feedback` `--json` `--dry-run`. AI 추론 0%.
- exit: 0=packaged+valid / 1=schema invalid 또는 post-redaction PII 잔존(필드 경로 표기) / 2=usage·read error.

### C3 — 캡처 트리거 (자동 emit / EXT-CAPTURE-05) — suggest, not auto-fire

- chain-driver `cmdNext` 가 **gate #5(implement→terminal / `!next`) 통과 시에만** stderr auto-suggest [REVISE-1: ticket-sync suggest(L311-322)와 매 전이 충돌 회피 — terminal 전용 + 별도 라인].
  - 정당화 [official-docs 반증 흡수]: "opt-in 업계표준"이 ❌ (Next.js/.NET=opt-out) → **adopter 데이터 주권 + consent 모델**(adopter 의 proprietary 코드 hash/stack 을 동의 없이 auto-write ❌ / 기존 ticket-sync R20 confirmation gate 동질).
- - skill instruction: `implement-verify-test-pass` 종결부 또는 `_base-invoke-go-stop-gate`(gate #5)에 packager 실행 안내 1절.

### C4 — release-readiness `check30_adopterCorroborationCapture` (29→30)

캡처 채널 drift enforcement. content-aware (file-presence ❌ / Senior F3).

- schema 존재 + draft-2020-12 valid + packager bin 존재 + **golden fixture round-trip**(fixture → schema-valid corroboration + PII 0).

### 부수

- schema-validator self-test +1 (새 schema valid + sample corroboration validates).
- release-readiness self-test 14 case 갱신: 29→30 / 28→29 / id 배열 `adopter_corroboration_capture` 추가 / **+1 신규 case: leak-guard negative fixture(PII 잔존 → exit 1) [REVISE-5 anti-regression]**.
- finding: **F-EXT-CAPTURE-001 RESOLVED** 등재 + 잔여 F-EXT-PREFLIGHT/PATH/PUBLIC-OSS = carry.

## 검증 (no-simulation / STOP-3)

- 실 CLI smoke: packager fixture round-trip(exit 0/valid/PII 0) + dry-run + **leak guard(planted PII 잔존 → exit 1 + 필드 경로)**.
- workspace all-pass(신규 packager test + 무회귀) / release-readiness **30/30** / test:release self-test 갱신 pass / skill-citation 0 stale / version 3-way 11.29.0 / breaking 0 = MINOR.

## §8.1 정직 (Senior 확인)

- forward-looking capability (corrective drift ❌ / 외부 adopter 가 필요로 하는 missing rail 신설).
- carry-note 정직 표기 의무: **"배선 출하 / Type-2 측정 = 0 / 실 adopter 대기"** — green check30 ≠ "Type-2 corroboration 달성"(inflation 금지).
- gate-class 아님: write-class·opt-in·consent·결정론.

## research 요약 (§2 / 2-agent lightweight)

- official-docs: salt+sha256=VERIFIED(업계 관행/귀속 OWASP ❌) / opt-in 권장=**CONTRADICTS**(opt-out 사례) → consent 재프레이밍 / draft-2020-12=VERIFIED / regex redaction=best-effort VERIFIED.
- Senior GO_WITH_REVISE@0.82 / REVISE 1~5 흡수 / §8.1 forward-looking 확인 + inflation 경고.

## Lessons (실패 시 기록)

- (없음)

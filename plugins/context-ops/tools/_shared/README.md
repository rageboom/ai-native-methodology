# \_shared/ — 공용 모듈

## Purpose

복수 도구가 import 하는 공용 utility. 독립 실행 ❌ / src 모듈로만 동작.

## 파일

- `baseline.js` — ADR-010 baseline + ratchet 로직 (zero-defect 강제 ❌ / 신규 결함만 차단)
- `evidence-cross-check.js` — v8.7 PATCH Layer 3 evidence cross-check helper (실 외부 도구 invocation log \*.jsonl scan → unique `tool` count 산출). R15 silent enabler 차단 공용 logic.
- `load-business-rules.js` — v0.4.0 (BR-split STEP 2 / DEC-2026-06-07-br-split-step2) business-rules 로딩 중앙화. `normalizeBusinessRules`(strict canonical / STEP 3 분할 단일 변경 지점) + `normalizeAnalysisBusinessRules`(analysis-stage 4 legacy shape + mis-fire 신호 / discovery-extraction 전용) + `loadBusinessRules`(파일/dir resolve + bcFilter + 주입 readJson seam). import: br-cross-consistency-validator / context-federator / traceability-matrix-builder / discovery-extraction-validator.

## 사용 위치

import 하는 도구:

- [`../drift-validator/`](../drift-validator/) — drift count baseline + ratchet
- [`../decision-table-validator/`](../decision-table-validator/) — DMN 5종 baseline + ratchet
- [`../static-runner/`](../static-runner/) — SARIF finding baseline + ratchet
- [`../characterization-coverage-validator/`](../characterization-coverage-validator/) — coverage baseline + ratchet trend / evidence cross-check (v8.7 PATCH)
- [`../sql-inventory-validator/`](../sql-inventory-validator/) — evidence cross-check (v8.7 PATCH / Layer 3) / v8.7 rename from sql-inventory-extractor (bin alias 양쪽 보존)

## ADR-010 baseline + ratchet 정책

```
1. 첫 commit: --write-baseline 으로 .baseline.json 작성 (현재 결함 수)
2. 이후: --baseline + --ratchet 으로 신규 결함만 검사
3. 신규 critical/high = production blocker (exit 1)
4. baseline 줄어든 (개선 / 결함 fix) 경우 = 자동 baseline 갱신
```

## Test

```bash
# 본 모듈 자체는 unit test 없음 (각 import 도구 의 test 안에서 검증)
```

## 분류

- 단일 file (~250 LOC)
- runtime 독립 실행 ❌ (script 단독 호출 시점 0 / src/ 와 동급)
- dist 의무 포함 (3 도구가 import / 부재 시 빌드 회귀)

## v8.7 PATCH Layer 3 evidence cross-check 정책

```
1. 도구는 --evidence-dir <dir> 옵션 (cli flag) 신설
2. *.jsonl scan → unique 'tool' field count = evidence_tool_count
3. 도구별 claim 계산 (e.g. auto_ratio_external_6 N parse / real_source snapshot count)
4. evidence_tool_count < claimedN → critical finding "evidence_cross_check.invocation_count_mismatch"
5. dir 부재 / *.jsonl 부재 → high finding
6. claim 부재 또는 0 → medium finding (도구별 명명 — claim_unparseable / claim_empty 등)
7. 옵션 미지정 → cross-check skip (backward-compat)
```

evidence file schema (JSON Lines / \*.jsonl): `{ tool, version, invocation_id, args, target, timestamp, duration_ms, exit_code, stdout_sample, result_sha256 }` — 필수 field: `tool`.

## 참조

- ADR-010 — baseline + ratchet 정책 (legacy 도입 시 zero-defect 강제 ❌)
- [`../drift-validator/src/check-baseline.js`](../drift-validator/) — import 사용 예
- F-CYCLE3-005 — R15 silent enabler quantitative evidence (cycle-3 dogfood)

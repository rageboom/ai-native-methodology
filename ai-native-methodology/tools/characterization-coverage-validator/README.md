# characterization-coverage-validator/ — phase 4.7 (characterization) gate validator

## Purpose

v2.1.0 phase 4.7 (characterization) 의 산출물 (`characterization-spec.json` + `intent-vs-bug.md` + `coverage.json` + `snapshots/UC-*.json`) 정합 검증. snapshot 4 필수 필드 (given / when / then / intent_classification) + intent_classification.type enum 4 (intent / bug / ambiguous / self_recognized) + named_classified_ratio ≥ threshold (default 0.80) + coverage strategy (absolute / ratchet) if/then 의무.

## When to call

- **trigger**: phase 4.7 characterization 작성 후 / chain 1 (planning-spec) 진입 직전
- **호출자**: skill `analysis-characterization-test` 절차 9 + 사용자 직접
- **수동**: `node src/cli.js --target <dir>`

## Inputs

```bash
node src/cli.js \
  --target .aimd/output/characterization/ \
  [--threshold 0.80] \
  [--coverage-baseline <path>] [--write-coverage-baseline] \
  [--evidence-dir <dir>] \
  [--dry-run] [--json]
```

검증 대상:

- `<target>/snapshots/UC-*.json` (snapshot 4 필수 필드 + intent_classification enum)
- `<target>/coverage.json` (matrix + coverage_strategy if/then)
- `<target>/intent-vs-bug.md` (ambiguous_carry grep)
- `<target>/characterization-spec.json` (entry / 통합 — 선택)

**v2.1.1 신규 (C-v2.1.0-5 carry resolve)** — ratchet trend baseline 자동 검증:

- `--coverage-baseline <path>` — 이전 측정 baseline JSON 비교
- `--write-coverage-baseline` — 현재 측정을 baseline 으로 기록 (legacy 첫 진입 또는 trend pass 후)
- `coverage_strategy=ratchet` + `trend_required=true` + `--coverage-baseline` 모두 충족 시 trend negative (current < baseline) 자동 차단

**v8.7 PATCH 신규 (Fix #3 Layer 3 / sql-inventory-validator Layer 3 mirror)** — evidence cross-check (R15 silent simulation 차단):

- `--evidence-dir <dir>` — 실 외부 도구 invocation log (\*.jsonl) 디렉토리
  - 각 line schema: `{ tool, version, invocation_id, args, target, timestamp, duration_ms, exit_code, stdout_sample, result_sha256 }` (필수: `tool`)
  - 디렉토리 안 `*.jsonl` scan → unique `tool` field count = `evidence_tool_count`
  - snapshot 의 `data_source_status` 가 `real_db` / `real_environment` / `domain_expert_interview` 중 하나인 snapshot 개수 = `claimed_count`
  - `evidence_tool_count < claimed_count` → critical finding (R15 silent simulation 의심 — AI 가 `data_source_status='real_*'` 자기 기입한 가능성)
- 미지정 시 cross-check skip (backward-compat)

권장 path (v8.7+): `--coverage-baseline` + `--evidence-dir` 둘 다 사용 — ratchet trend + Layer 3 evidence 동시 R15 차단.

## Outputs

| kind                                             | severity                   | 의미                                                                                                                              |
| ------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `snapshot.dir_missing`                           | critical                   | snapshots/ 디렉토리 부재                                                                                                          |
| `snapshot.parse_error`                           | critical                   | snapshot JSON parse 실패                                                                                                          |
| `scenario.missing_required`                      | critical                   | given / when / then / intent_classification 4 필수 필드 누락                                                                      |
| `scenario.intent_classification_empty`           | critical                   | intent_classification 배열 빈                                                                                                     |
| `scenario.classification_type_invalid`           | critical                   | type enum (intent / bug / ambiguous / self_recognized) 위반                                                                       |
| `scenario.ambiguous_no_behavior_note`            | high                       | ambiguous 분류인데 behavior_likely_bug + behavior_to_preserve 둘 다 빈 배열                                                       |
| `coverage.strategy_invalid`                      | critical                   | coverage_strategy enum (absolute / ratchet) 위반                                                                                  |
| `coverage.ratchet_trend_required_missing`        | critical                   | ratchet 시 trend_required = true 누락 (schema if/then 정합)                                                                       |
| `coverage.ratchet_minimum_missing`               | high                       | ratchet 시 coverage_minimum_legacy 누락                                                                                           |
| `coverage.below_target_absolute`                 | high                       | absolute 시 actual < coverage_target                                                                                              |
| `coverage.below_minimum_ratchet`                 | high                       | ratchet 시 actual < coverage_minimum_legacy                                                                                       |
| `coverage.trend_negative_ratchet`                | high                       | v2.1.1 — ratchet + trend_required + baseline 제공 시 current < baseline (regression block)                                        |
| `classification.named_ratio_below_threshold`     | high                       | named_classified_ratio < threshold (default 0.80)                                                                                 |
| `classification.ambiguous_carry_missing`         | critical                   | ambiguous > 0 인데 ambiguous_carry 명시 부재 (entry 또는 intent-vs-bug.md grep)                                                   |
| `snapshot.code_only_carry_required`              | **high** (v8.7 PATCH 격상) | data_source_status='code_only' — 도메인 expert 검증 의무 (R15 silent enabler 차단 / 옛 `code_only_carry_recommended` medium 격상) |
| `evidence_cross_check.dir_missing`               | high                       | v8.7 Layer 3 — `--evidence-dir` 경로 부재 또는 디렉토리 아님                                                                      |
| `evidence_cross_check.no_evidence_files`         | high                       | v8.7 Layer 3 — `--evidence-dir` 안 `*.jsonl` 부재 (R15 silent enabler unverified)                                                 |
| `evidence_cross_check.claim_empty`               | medium                     | v8.7 Layer 3 — real-source snapshot 0 (`data_source_status` real\_\* 부재) → cross-check skip 권고                                |
| `evidence_cross_check.invocation_count_mismatch` | **critical**               | v8.7 Layer 3 — `evidence_tool_count < claimed_count` (R15 silent simulation 의심 / AI 자기 보고 metric 가능성)                    |

## Exit codes

| code | 의미                                                  |
| ---- | ----------------------------------------------------- |
| 0    | pass / no breaking finding                            |
| 1    | critical/high finding ≥ 1 (default strict)            |
| 2    | usage error                                           |
| 3    | dry-run only (S3 — exit 3 / sub-plan-3 research 정합) |

## Sibling tools

- [`../discovery-extraction-validator/`](../discovery-extraction-validator/) — chain 1 (discovery) gate (characterization 출력 = chain 1 입력 보강)
- [`../chain-coverage-validator/`](../chain-coverage-validator/) — chain 2 (spec) gate
- [`../schema-validator/`](../schema-validator/) — characterization-spec.schema.json sub-validate (Ajv 8 strict mode)
- [`../drift-validator/`](../drift-validator/) — `--check-layout` 시 phase 4.7 entry 인식 (skills 19 → 20)

## 참조

- [`../../schemas/characterization-spec.schema.json`](../../schemas/characterization-spec.schema.json) (30번째 schema)
- [`../../methodology-spec/deliverables/23-characterization-spec.md`](../../methodology-spec/deliverables/23-characterization-spec.md)
- [`../../skills/analysis-characterization-test/SKILL.md`](../../skills/analysis-characterization-test/SKILL.md)
- ADR-CHAIN-006 phase 4.7 정식 도입
- DEC-2026-05-07-poc-06-종결 (corroboration #1 / Legacy)
- DEC-2026-05-07-poc-07-poc03-phase7-retrofit (corroboration #2 / Modern)

## Carry

- ✅ ~~baseline + ratchet trend 자동 검증~~ → v2.1.1 resolved (`_shared/baseline.js` `readCoverageBaseline` / `writeCoverageBaseline` / `coverageTrendCheck` 신설 + `--coverage-baseline` + `--write-coverage-baseline` flag + 4 unit test)
- snapshot Gherkin (.feature) 변환 출력 = v2.x carry (C-v2.1.0-1)
- ts-morph + 실 환경 (DB) snapshot 자동 추출 = v2.x carry (C-v2.1.0-6)

## no-simulation 정합 — scope 명시 (v8.7+ 정정)

본 도구 **자체의** 검증 로직은 AI 추론 0% — JSON 파싱 + grep + 비교 알고리즘. lint-no-simulation 정합.

### scope 한계 (R15 silent simulation 차단 의무)

본 도구의 "no-simulation 정합" 보장 scope = **본 도구 자체의 검증 로직 만**. 검증 **대상** `snapshots/UC-*.json` + `coverage.json` 의 AI hypothesis 여부 cross-check 는 별 입력 의무 (sql-inventory-validator 의 [[../sql-inventory-validator/]] mirror pattern):

- **schema 정합 (4 필수 필드 + enum + if/then) 통과 ≠ 도메인 정합** — AI 가 hypothesis 로 작성한 snapshot 도 schema 정합 시 critical/high finding 0 통과 가능.
- **`named_classified_ratio` + `coverage_ratio`** = snapshot/coverage.json 안 metric 이 caller (AI 또는 사용자) 자기 보고. 본 도구는 형식 + threshold + ratchet trend 만 검증, **실 test runner 의 coverage report cross-check 불가**.
- **R15 (no-simulation) partial defense** (v8.7 격상):
  - `snapshot.code_only_carry_required` finding severity **medium → high 격상** — `data_source_status='code_only'` snapshot 은 AI 가 코드만 보고 작성된 hypothesis 가능성. 도메인 expert 검증 의무.
  - **v8.7 PATCH Fix #3 Layer 3 resolved** — `--evidence-dir <dir>` 옵션 신설 (sql-inventory-validator Layer 3 mirror). real-source snapshot (`data_source_status` real\__ enum) 개수 ≤ `_.jsonl`안 unique`tool` count 의무. mismatch 시 critical finding.
- **R15 full 차단 carry** (v8.7+ 후속):
  - `--test-coverage-report <path>` — 실 test runner (vitest/jest/pytest) coverage report 와 cross-check
  - `_shared/baseline.js` audit — AI 자기 보고 metric channel 의 본질 patrol
  - `_shared/evidence-cross-check.js` refactor — sql-inventory-validator + characterization-coverage-validator 의 Layer 3 helper duplication 통합

### 원본 cycle-3 evidence (F-CYCLE3-005)

- `_shared/baseline.js` 공유 = sql-inventory-validator mirror pattern (R15 silent enabler 공범).
- AI 자기 보고 metric (`named_classified_ratio` / `coverage_ratio` / `coverage_target` / `coverage_minimum_legacy`) → schema valid 통과 silent pass 위험.
- v8.6.3 까지 partial defense (medium finding) 만 / v8.7 = high 격상 + future cross-check option carry.

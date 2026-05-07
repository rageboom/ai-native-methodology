# characterization-coverage-validator/ — phase 4.7 (characterization) gate validator

## Purpose

★ ★ v2.1.0 phase 4.7 (characterization) 의 산출물 (`characterization-spec.json` + `intent-vs-bug.md` + `coverage.json` + `snapshots/UC-*.json`) 정합 검증. ★ snapshot 4 필수 필드 (given / when / then / intent_classification) + intent_classification.type enum 4 (intent / bug / ambiguous / self_recognized) + named_classified_ratio ≥ threshold (default 0.80) + coverage strategy (absolute / ratchet) if/then 의무.

## When to call

- **trigger**: phase 4.7 characterization 작성 후 / chain 1 (planning-spec) 진입 직전
- **호출자**: skill `phase-4-7-characterization` 절차 9 + 사용자 직접
- **수동**: `node src/cli.js --target <dir>`

## Inputs

```bash
node src/cli.js \
  --target .aimd/output/characterization/ \
  [--threshold 0.80] [--dry-run] [--json]
```

검증 대상:
- `<target>/snapshots/UC-*.json` (snapshot 4 필수 필드 + intent_classification enum)
- `<target>/coverage.json` (matrix + coverage_strategy if/then)
- `<target>/intent-vs-bug.md` (★ ambiguous_carry grep)
- `<target>/characterization-spec.json` (★ entry / 통합 — 선택)

## Outputs

| kind | severity | 의미 |
|---|---|---|
| `snapshot.dir_missing` | critical | snapshots/ 디렉토리 부재 |
| `snapshot.parse_error` | critical | snapshot JSON parse 실패 |
| `scenario.missing_required` | critical | given / when / then / intent_classification 4 필수 필드 누락 |
| `scenario.intent_classification_empty` | critical | intent_classification 배열 빈 |
| `scenario.classification_type_invalid` | critical | type enum (intent / bug / ambiguous / self_recognized) 위반 |
| `scenario.ambiguous_no_behavior_note` | high | ambiguous 분류인데 behavior_likely_bug + behavior_to_preserve 둘 다 빈 배열 |
| `coverage.strategy_invalid` | critical | coverage_strategy enum (absolute / ratchet) 위반 |
| `coverage.ratchet_trend_required_missing` | critical | ratchet 시 trend_required = true 누락 (★ schema if/then 정합) |
| `coverage.ratchet_minimum_missing` | high | ratchet 시 coverage_minimum_legacy 누락 |
| `coverage.below_target_absolute` | high | absolute 시 actual < coverage_target |
| `coverage.below_minimum_ratchet` | high | ratchet 시 actual < coverage_minimum_legacy |
| `classification.named_ratio_below_threshold` | high | named_classified_ratio < threshold (default 0.80) |
| `classification.ambiguous_carry_missing` | critical | ambiguous > 0 인데 ambiguous_carry 명시 부재 (entry 또는 intent-vs-bug.md grep) |
| `snapshot.code_only_carry_recommended` | medium | data_source_status='code_only' — 도메인 expert carry 권장 |

## Exit codes

| code | 의미 |
|---|---|
| 0 | pass / no breaking finding |
| 1 | critical/high finding ≥ 1 (default strict) |
| 2 | usage error |
| 3 | dry-run only (★ S3 — exit 3 / sub-plan-3 research 정합) |

## Sibling tools

- [`../planning-extraction-validator/`](../planning-extraction-validator/) — chain 1 (planning) gate (★ characterization 출력 = chain 1 입력 보강)
- [`../chain-coverage-validator/`](../chain-coverage-validator/) — chain 2 (spec) gate
- [`../schema-validator/`](../schema-validator/) — characterization-spec.schema.json sub-validate (Ajv 8 strict mode)
- [`../drift-validator/`](../drift-validator/) — `--check-layout` 시 phase 4.7 entry 인식 (★ skills 19 → 20)

## 참조

- [`../../schemas/characterization-spec.schema.json`](../../schemas/characterization-spec.schema.json) (★ 30번째 schema)
- [`../../methodology-spec/deliverables/23-characterization-spec.md`](../../methodology-spec/deliverables/23-characterization-spec.md)
- [`../../skills/analysis/phase-4-7-characterization/SKILL.md`](../../skills/analysis/phase-4-7-characterization/SKILL.md)
- ADR-CHAIN-006 phase 4.7 정식 도입
- DEC-2026-05-07-poc-06-종결 (corroboration #1 / Legacy)
- DEC-2026-05-07-poc-07-poc03-phase7-retrofit (corroboration #2 / Modern)

## Carry

- baseline + ratchet trend 자동 검증 (★ trend_required = true 시 이전 측정 비교) = `_shared/baseline.js` reuse / v2.1.x patch
- snapshot Gherkin (.feature) 변환 출력 = v2.x carry
- ts-morph + 실 환경 (DB) snapshot 자동 추출 = v2.x carry

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — JSON 파싱 + grep + 비교 알고리즘. lint-no-simulation 정합.

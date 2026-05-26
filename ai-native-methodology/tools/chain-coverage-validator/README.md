# chain-coverage-validator/ — chain 2 (spec) gate validator

## Purpose

★ ★ v2.0 chain harness 의 **chain 2 (spec → test) gate #2 validator**. `behavior-spec.json` + `acceptance-criteria.json` (+ `planning-spec.json`) 사이의 forward link 정합성 (UC → BHV 1:N / BHV → AC 1:N) + coverage threshold (0.85) 강제.

## When to call

- **trigger**: chain 2 (spec) stage 종결 시 / chain-driver `next` 진입
- **호출자**: gate auto (chain-driver) / skill `_base-invoke-go-stop-gate`
- **수동**: `node src/cli.js ...`

## Inputs

```bash
node src/cli.js \
  --planning .aimd/output/planning-spec.json \
  --behavior .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  [--threshold 0.85] [--dry-run] [--json]
```

## Outputs

| kind | severity | 의미 |
|---|---|---|
| `coverage.uc-to-bhv.below-threshold` | critical | UC → BHV coverage < threshold |
| `coverage.bhv-to-ac.below-threshold` | critical | BHV → AC coverage < threshold |
| `chain.bhv.unknown-uc` | critical | BHV.use_case_refs 의 UC 가 planning 에 없음 |
| `chain.ac.unknown-bhv` | high | AC.behavior_ref 가 behavior-spec 에 없음 |
| `chain.bhv.no-ac` | high | BHV 에 AC forward link 없음 |
| `chain.ac.verifiable-no-test-ref` | high | verifiable=true 인데 test_case_refs 빈 배열 (★ schema if/then 보강) |

## Exit codes

| code | 의미 |
|---|---|
| 0 | pass / no breaking finding / `--dry-run` (cli.js:43) / usage-help |
| 1 | critical/high finding ≥ 1 (default strict) |
| 2 | usage error (bad/missing arg) |

★ `--dry-run` = (write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제) 3 조합 (sub-plan-3 research S3 정합).

## Sibling tools

- [`../discovery-extraction-validator/`](../discovery-extraction-validator/) — gate #1 / chain 1 (discovery)
- [`../spec-test-link-validator/`](../spec-test-link-validator/) — gate #3 / chain 3 (test)
- [`../schema-validator/`](../schema-validator/) — chain 2 schema (behavior + acceptance) sub-validate
- [`../traceability-matrix-builder/`](../traceability-matrix-builder/) — release matrix

## 참조

- [`../../schemas/behavior-spec.schema.json`](../../schemas/behavior-spec.schema.json) + `acceptance-criteria.schema.json`
- [`../../methodology-spec/deliverables/18-behavior-spec.md`](../../methodology-spec/deliverables/18-behavior-spec.md) + `19-acceptance-criteria.md`
- ADR-CHAIN-001 (chain-4-stage-enforcement) + ADR-CHAIN-002 (go-stop-gate)
- DEC-2026-05-06-sub-plan-3a-종결 — chain validator 4종 신설 record

## Carry

- baseline + ratchet 통합 (`_shared/baseline.js` reuse) = sub-plan 후속 또는 sub-plan-6
- severity_floor schema 의무 = traceability-matrix-builder 와 동일 enum (sub-plan-3b carry)

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — 정규식 + JSON 비교 알고리즘만. lint-no-simulation 정합.

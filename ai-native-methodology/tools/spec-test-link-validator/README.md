# spec-test-link-validator/ — chain 3 (test) gate validator

## Purpose

★ ★ v2.0 chain harness 의 **chain 3 (test → impl) gate #3 validator**. `acceptance-criteria.json` + `test-spec.json` (+ `behavior-spec.json` + `inventory.json`) 사이 AC → TC forward link + framework match (analysis-phase-1-inventory stack signal) + coverage threshold (0.85) 강제.

## When to call

- **trigger**: chain 3 (test) stage 종결 시 / chain-driver `next` 진입
- **호출자**: gate auto (chain-driver) / skill `_base-invoke-go-stop-gate`
- **수동**: `node src/cli.js ...`

## Inputs

```bash
node src/cli.js \
  --behavior .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --test-spec .aimd/output/test-spec.json \
  --inventory .aimd/output/inventory.json \
  [--threshold 0.85] [--dry-run] [--json]
```

## Outputs

| kind | severity | 의미 |
|---|---|---|
| `coverage.ac-to-tc.below-threshold` | critical | AC → TC coverage < threshold |
| `chain.tc.unknown-ac` | critical | TC.ac_ref 가 acceptance 에 없음 |
| `chain.tc.unknown-bhv` | high | TC.bhv_ref 가 behavior 에 없음 |
| `chain.ac.verifiable-no-tc` | high | verifiable=true AC 인데 test_case_refs 빈 배열 |
| `chain.tc.framework-mismatch` | medium | TC.framework 가 inventory.stack_signals 와 어긋남 (★ ADR-CHAIN-004 정합) |

## Exit codes

| code | 의미 |
|---|---|
| 0 | pass / no breaking |
| 1 | critical/high finding ≥ 1 (default strict) |
| 2 | usage error |

★ `--dry-run` = (write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제) 3 조합 (sub-plan-3 S3 정합).

## Sibling tools

- [`../chain-coverage-validator/`](../chain-coverage-validator/) — gate #2 / chain 2 (spec)
- [`../test-impl-pass-validator/`](../test-impl-pass-validator/) — gate #4 / chain 4 (impl) — 본 도구 후속 (실 test runner 호출)
- [`../schema-validator/`](../schema-validator/) — test-spec.schema 검증 (sub-validate)

## 참조

- [`../../schemas/test-spec.schema.json`](../../schemas/test-spec.schema.json) + `acceptance-criteria.schema.json` + `inventory.schema.json`
- [`../../methodology-spec/deliverables/20-test-spec.md`](../../methodology-spec/deliverables/20-test-spec.md)
- ADR-CHAIN-001 (chain-4-stage-enforcement) + ADR-CHAIN-004 (test-runner-invocation-contract)
- DEC-2026-05-06-sub-plan-3a-종결 — chain validator 4종 신설 record

## Carry

- 진짜 test runner 호출 (5종 물증 7 필드) = [`../test-impl-pass-validator/`](../test-impl-pass-validator/) (sub-plan-3b 신설)
- ADR-CHAIN-004 framework-mismatch 정밀화 = sub-plan 후속

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — JSON 비교 알고리즘만. 실 test runner 호출은 sibling `test-impl-pass-validator` 의무.

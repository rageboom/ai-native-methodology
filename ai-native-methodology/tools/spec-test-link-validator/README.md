# spec-test-link-validator

★ ★ v2.0 SDLC 4단계 chain harness 의 **chain 3 (test → impl) gate validator**.

`acceptance-criteria.json` + `test-spec.json` (+ `behavior-spec.json` + `inventory.json`) 사이의 AC → TC forward link 정합성, framework match (phase-1-inventory stack signal), coverage threshold (0.85) 를 강제.

## 사용

```bash
node src/cli.js \
  --behavior .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --test-spec .aimd/output/test-spec.json \
  --inventory .aimd/output/inventory.json \
  [--threshold 0.85] [--dry-run] [--json]
```

## 검증 항목

| kind | severity | 의미 |
|---|---|---|
| `coverage.ac-to-tc.below-threshold` | critical | AC → TC coverage < threshold |
| `chain.tc.unknown-ac` | critical | TC.ac_ref 가 acceptance 에 없음 |
| `chain.tc.unknown-bhv` | high | TC.bhv_ref 가 behavior 에 없음 |
| `chain.ac.verifiable-no-tc` | high | verifiable=true AC 인데 test_case_refs 빈 배열 |
| `chain.tc.framework-mismatch` | medium | TC.framework 가 inventory.stack_signals 와 어긋남 (★ ADR-CHAIN-004 정합) |

## ★ S3 — `--dry-run` 의미 명문화

`--dry-run` = **(write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제)** 3 조합 (sub-plan-3 research S3 정합).

- write-baseline: 본 도구는 baseline 미사용 — 항상 충족.
- prompt: 본 도구는 사용자 prompt 없음 — 항상 충족.
- exit 0 강제: finding severity 무관하게 0 반환.

**default (strict)** = `critical` ≥ 1 또는 `high` ≥ 1 → exit 1.

## Carry

- 진짜 test runner 호출 (5종 물증 7 필드) = sub-plan-3b `test-impl-pass-validator`.
- ADR-CHAIN-004 (Test Runner Invocation Contract / Aider 패턴) → framework-mismatch 정밀화.

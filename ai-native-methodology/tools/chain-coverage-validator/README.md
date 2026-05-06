# chain-coverage-validator

★ ★ v2.0 SDLC 4단계 chain harness 의 **chain 2 (spec → test) gate validator**.

`behavior-spec.json` + `acceptance-criteria.json` (+ `planning-spec.json`) 사이의 forward link 정합성 (UC → BHV 1:N / BHV → AC 1:N) 과 coverage threshold (0.85) 를 강제.

## 사용

```bash
node src/cli.js \
  --planning .aimd/output/planning-spec.json \
  --behavior .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  [--threshold 0.85] [--dry-run] [--json]
```

## 검증 항목

| kind | severity | 의미 |
|---|---|---|
| `coverage.uc-to-bhv.below-threshold` | critical | UC → BHV coverage < threshold |
| `coverage.bhv-to-ac.below-threshold` | critical | BHV → AC coverage < threshold |
| `chain.bhv.unknown-uc` | critical | BHV.use_case_refs 의 UC 가 planning 에 없음 |
| `chain.ac.unknown-bhv` | high | AC.behavior_ref 가 behavior-spec 에 없음 |
| `chain.bhv.no-ac` | high | BHV 에 AC forward link 없음 |
| `chain.ac.verifiable-no-test-ref` | high | verifiable=true 인데 test_case_refs 빈 배열 (★ schema if/then 보강) |

## ★ S3 — `--dry-run` 의미 명문화

`--dry-run` = **(write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제)** 3 조합 (sub-plan-3 research S3 정합).

- write-baseline: 본 도구는 baseline 미사용 — 항상 충족.
- prompt: 본 도구는 사용자 prompt 없음 — 항상 충족.
- exit 0 강제: finding severity 무관하게 0 반환.

**default (strict)** = `critical` ≥ 1 또는 `high` ≥ 1 → exit 1.

## Carry

- baseline + ratchet 통합 (`_shared/baseline.js` reuse) = sub-plan-3a 후속 또는 sub-plan-6.
- severity_floor schema 의무 = traceability-matrix-builder 와 동일 enum (sub-plan-3b carry).

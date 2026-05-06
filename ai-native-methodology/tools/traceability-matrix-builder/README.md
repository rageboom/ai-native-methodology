# traceability-matrix-builder/ — release matrix builder (★ DO-178C / ISO 26262 정합)

## Purpose

★ ★ v2.0 chain harness 의 **cross-gate matrix builder**. 5 chain 산출물 (`planning-spec` + `behavior-spec` + `acceptance-criteria` + `test-spec` + `impl-spec`) 에서 **UC → BHV → AC → TC → IMPL forward + backward link** 합성 → `matrix.{json,md,mermaid}` 산출.

DO-178C / ISO 26262 bidirectional traceability 차용 (★ S5 정합 — header `derived_from` + `do_not_edit_manually:true` schema 강제).

## When to call

- **trigger**: chain 4 (impl) gate #4 통과 후 / release 진입 시
- **호출자**: 사용자 (수동) / skill `_base/build-traceability-matrix`
- **수동**: `node src/cli.js ...`

## Inputs

```bash
node src/cli.js \
  --planning .aimd/output/planning-spec.json \
  --behavior .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --test-spec .aimd/output/test-spec.json \
  --impl-spec .aimd/output/impl-spec.json \
  --out-dir .aimd/output/traceability/ \
  [--dry-run]
```

## Outputs

3종 산출 (이중 렌더링 사상 정합):
- `matrix.json` — 단일 source of truth (★ DO-178C 정합)
- `matrix.md` — 사람 눈 (markdown table / coverage_summary)
- `matrix.mermaid` — 사람 눈 (graph view / ≥100 cell 분할 정책 = sp3-c1 carry)

### status 분류

| status | 조건 |
|---|---|
| green | UC + BHV + AC + TC + IMPL 5 단계 모두 채워짐 |
| yellow | TC 까지 OK / IMPL 부재 (chain 4 진입 전) |
| red | AC 또는 그 위 단계 missing (chain 1~2 incomplete) |

## Exit codes

| code | 의미 |
|---|---|
| 0 | red_count = 0 / forward_coverage ≥ threshold |
| 1 | red_count > 0 또는 forward_coverage < threshold (default strict) |
| 2 | usage error |

★ `--dry-run` = (write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제) ∧ ★ **`--out-dir` 지정 시 파일 쓰기 차단** 4 조합 (sub-plan-3 S3 정합 + 본 도구 핵심 동작).

## Sibling tools

- [`../planning-extraction-validator/`](../planning-extraction-validator/) — gate #1 / chain 1 input 검증
- [`../chain-coverage-validator/`](../chain-coverage-validator/) — gate #2 / chain 2 input 검증
- [`../spec-test-link-validator/`](../spec-test-link-validator/) — gate #3 / chain 3 input 검증
- [`../test-impl-pass-validator/`](../test-impl-pass-validator/) — gate #4 / chain 4 input 검증
- [`../chain-driver/`](../chain-driver/) — release 진입 결정 / 본 도구 호출 trigger

## 참조

- [`../../schemas/traceability-matrix.schema.json`](../../schemas/traceability-matrix.schema.json)
- [`../../methodology-spec/deliverables/22-traceability-matrix.md`](../../methodology-spec/deliverables/22-traceability-matrix.md)
- ADR-CHAIN-001 (chain-4-stage-enforcement)
- DEC-2026-05-06-sub-plan-3a-종결 — chain validator 4종 신설 record
- 차용: DO-178C (Software Considerations in Airborne Systems / FAA) / ISO 26262 (Functional Safety)

## Carry

- mermaid graph view ≥ 100 cell subgraph 분할 (sp3-c1) — 현 단계 = 단일 그래프
- chain-revisit-detector 통합 (`derived_from` mtime 비교) = sub-plan-5 종결 (chain-driver/revisit-detect.js)

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — JSON merge + status 분류 알고리즘만.

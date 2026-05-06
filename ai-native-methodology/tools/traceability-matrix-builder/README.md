# traceability-matrix-builder

★ ★ v2.0 SDLC 4단계 chain harness 의 **cross-gate matrix builder**.

`planning-spec` + `behavior-spec` + `acceptance-criteria` + `test-spec` + `impl-spec` 5 chain 산출물에서 UC → BHV → AC → TC → IMPL forward + backward link 를 합성하여 `matrix.{json,md,mermaid}` 를 산출.

DO-178C / ISO 26262 bidirectional traceability 차용 (★ S5 정합 — header 의 `derived_from` + `do_not_edit_manually:true` schema 강제).

## 사용

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

## 산출물 (3종 / 이중 렌더링 사상 정합)

- `matrix.json` — 단일 source of truth (★ DO-178C).
- `matrix.md` — 사람 눈 (markdown table / coverage_summary).
- `matrix.mermaid` — 사람 눈 (graph view / ≥100 cell 분할 정책 = sp3-c1 carry).

## status 분류

| status | 조건 |
|---|---|
| green | UC + BHV + AC + TC + IMPL 5 단계 모두 채워짐 |
| yellow | TC 까지 OK / IMPL 부재 (chain 4 진입 전) |
| red | AC 또는 그 위 단계 missing (chain 1~2 incomplete) |

## ★ S3 — `--dry-run` 의미 명문화

`--dry-run` = **(write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제)** 3 조합 (sub-plan-3 research S3 정합).

- write-baseline: 본 도구는 baseline 미사용 — 항상 충족.
- prompt: 본 도구는 사용자 prompt 없음 — 항상 충족.
- exit 0 강제: red_count / forward_coverage 무관하게 0 반환.
- ★ 추가 — `--out-dir` 가 지정돼도 **파일 쓰기 차단** (matrix.{json,md,mermaid} 미작성). 본 도구의 dry-run 핵심 동작.

**default (strict)** = `red_count > 0` 또는 `forward_coverage < threshold` → exit 1. `--out-dir` 지정 시 matrix.{json,md,mermaid} 작성.

## Carry

- mermaid graph view ≥ 100 cell subgraph 분할 (sp3-c1) — sub-plan-3a 안에서 결정 / 현 단계는 단일 그래프.
- chain-revisit-detector 통합 (`derived_from` mtime 비교) = sub-plan-5.

# planning-extraction-validator/ — chain 1 (planning) gate validator

## Purpose

★ ★ v2.0 chain harness 의 **chain 1 (planning → spec) gate #1 validator**. `planning-spec.json` 의 모든 `BR-INTENT-*` 가 analysis 산출물 (`rules.json` / `domain.json`) 의 BR/도메인 객체에 grep-hit 으로 source-grounded 인지 검증. **AI 환각 방지가 1차 목적**.

## When to call

- **trigger**: chain 1 (planning) stage 종결 시 / chain-driver `next` 진입
- **호출자**: gate auto (chain-driver) / skill `_base/invoke-go-stop-gate`
- **수동**: `node src/cli.js ...`

## Inputs

```bash
node src/cli.js \
  --planning .aimd/output/planning-spec.json \
  --rules .aimd/output/rules.json \
  --domain .aimd/output/domain.json \
  [--dry-run] [--json]
```

## Outputs

| kind | severity | 의미 |
|---|---|---|
| `planning.br-unknown` | critical | `BR-INTENT-*.br_id` 가 analysis 의 BR-* 와 매칭 ❌ |
| `planning.no-source-grounded-evidence` | high | `source_grounded_evidence` 부재 / 빈 배열 |
| `planning.grep-hit-zero` | high | grep_hit_count = 0 (file 안에 element_id 가 실재 ❌) |
| `planning.use-case-coverage-low` | high | UC coverage < 0.80 (사용자 결단 D) |
| `planning.cross-link-empty` | medium | `cross_links.to_analysis_artifacts` 빈 배열 |

## Exit codes

| code | 의미 |
|---|---|
| 0 | pass / source-grounded |
| 1 | critical/high finding ≥ 1 (default strict) |
| 2 | usage error |

★ `--dry-run` = (write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제) 3 조합 (sub-plan-3 research S3 정합).

## Sibling tools

- [`../chain-coverage-validator/`](../chain-coverage-validator/) — gate #2 / chain 2 (spec)
- [`../schema-validator/`](../schema-validator/) — planning-spec.schema 검증 (sub-validate)

## 참조

- [`../../schemas/planning-spec.schema.json`](../../schemas/planning-spec.schema.json)
- [`../../methodology-spec/deliverables/17-planning-spec.md`](../../methodology-spec/deliverables/17-planning-spec.md)
- ADR-CHAIN-001 (chain-4-stage-enforcement) + ADR-CHAIN-002 (go-stop-gate) + ADR-CHAIN-003 (revisit-loop)
- DEC-2026-05-06-sub-plan-3a-종결 — chain validator 4종 신설 record

## Carry

- planning-spec deliverable 17 의 full implementation = sub-plan-4 (skill `skills/planning/extract-from-legacy/`)
- meta-confidence schema $ref 적용 (현 CLI 는 schema 강제 X / sub-plan-3a 후속)

## ★★★ no-simulation 정합

본 도구는 메타데이터 (cross_validation 등) 를 생성하지 않음. validation 결과 자체가 grep-hit 정량 evidence 이므로 5종 물증 의무 대상에서 제외 (analyzer 도구).

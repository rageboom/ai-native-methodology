# discovery-extraction-validator/ — chain 1 (discovery) gate validator

★ v11.0.0 — renamed from `planning-extraction-validator` (DEC-2026-05-26-discovery-spec-rename / paradigm 정합).

## Purpose

★ ★ v11.0.0 chain harness 의 **chain 1 (discovery → spec) gate #1 validator**. `discovery-spec.json` 의 모든 `BR-INTENT-*` 가 analysis 산출물 (`business-rules.json` / `domain.json`) 의 BR/도메인 객체에 grep-hit 으로 source-grounded 인지 검증. **AI 환각 방지가 1차 목적**.

## When to call

- **trigger**: chain 1 (discovery) stage 종결 시 / chain-driver `next` 진입
- **호출자**: gate auto (chain-driver) / skill `_base-invoke-go-stop-gate`
- **수동**: `node src/cli.js ...`

## Inputs

```bash
node src/cli.js \
  --discovery .aimd/output/discovery-spec.json \
  --rules .aimd/output/business-rules.json \
  --domain .aimd/output/domain.json \
  [--dry-run] [--json]
```

## Outputs

| kind | severity | 의미 |
|---|---|---|
| `discovery.br_intent.unknown_br` | critical | `BR-INTENT-*.br_id` 가 analysis 의 BR-* 와 매칭 ❌ |
| `discovery.source_grounded.missing` | high | `source_grounded_evidence` 부재 / 빈 배열 |
| `discovery.uc_coverage.below_threshold` | high | UC coverage < 0.80 |
| `discovery.cross_links.empty` | medium | `cross_links.to_analysis_artifacts` 빈 배열 |

## Exit codes

| code | 의미 |
|---|---|
| 0 | pass / source-grounded |
| 1 | critical/high finding ≥ 1 (default strict) |
| 2 | usage error |

★ `--dry-run` = (write-baseline 차단) ∧ (prompt 차단) ∧ (exit 0 강제) 3 조합 (sub-plan-3 research S3 정합).

## Sibling tools

- [`../chain-coverage-validator/`](../chain-coverage-validator/) — gate #2 / chain 2 (spec)
- [`../plan-coverage-validator/`](../plan-coverage-validator/) — gate #3 / chain 3 (plan)
- [`../schema-validator/`](../schema-validator/) — discovery-spec.schema 검증 (sub-validate)

## 참조

- [`../../schemas/discovery-spec.schema.json`](../../schemas/discovery-spec.schema.json)
- [`../../methodology-spec/deliverables/17-discovery-spec.md`](../../methodology-spec/deliverables/17-discovery-spec.md)
- ADR-CHAIN-001 (chain-stage-enforcement) + ADR-CHAIN-002 (go-stop-gate) + ADR-CHAIN-003 (revisit-loop)
- DEC-2026-05-26-discovery-spec-rename (v11.0.0 rename)
- DEC-2026-05-06-sub-plan-3a-종결 (chain validator 4종 신설 record / legacy carry)

## Carry

- discovery-spec deliverable 17 의 full implementation = `skills/discovery-from-analysis-output/`
- meta-confidence schema $ref 적용 (현 CLI 는 schema 강제 ❌ / sub-plan-3a 후속)

## ★★★ no-simulation 정합

본 도구는 메타데이터 (cross_validation 등) 를 생성하지 않음. validation 결과 자체가 grep-hit 정량 evidence 이므로 5종 물증 의무 대상에서 제외 (analyzer 도구).

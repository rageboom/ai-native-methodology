# templates/spec/ — chain 2 (spec stage) template

chain 2 (spec / discovery-spec → behavior-spec + acceptance-criteria) 의 산출물 template.

## 활성 template

| file                                                                       | role                                                                                                                                               |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`behavior-spec.template.json`](./behavior-spec.template.json)             | behavior-spec.json placeholder (BHV-\* executable contract / state-machine + sequence + invariant + property-test 통합 / json 단독 SSOT — ADR-011) |
| [`acceptance-criteria.template.json`](./acceptance-criteria.template.json) | acceptance-criteria.json placeholder (AC-\* Gherkin Given/When/Then / verifiable=true 의무 / MoSCoW / json 단독 SSOT — ADR-011)                    |

## 산출물 paradigm 정합

spec stage = **cross-cut 단일 산출물** (BE/FE 분리 ❌ — BHV/AC = 사용자 시나리오 anchor / Gherkin 자연 cross-cut).

BE/FE contract 강제 양 axis:

- BE AC = `openapi_path` + `operationId` 필수 (swagger contract anchor)
- FE AC = `state_map_ref` + `dtcg_token_ref` + `visual_manifest_ref` 필수 (state-map + DTCG token + visual-manifest anchor)

## 참조

- [`../../skills/spec-compose-behavior-spec/`](../../skills/spec-compose-behavior-spec/) — chain 2 진입 skill
- [`../../skills/spec-derive-acceptance-criteria/`](../../skills/spec-derive-acceptance-criteria/) — Gherkin AC 추출 skill
- [`../../skills/spec-integrate-deliverables/`](../../skills/spec-integrate-deliverables/) — 산출물 통합 skill
- [`../../methodology-spec/deliverables/18-behavior-spec.md`](../../methodology-spec/deliverables/18-behavior-spec.md)
- [`../../methodology-spec/deliverables/19-acceptance-criteria.md`](../../methodology-spec/deliverables/19-acceptance-criteria.md)
- [`../../schemas/behavior-spec.schema.json`](../../schemas/behavior-spec.schema.json)
- [`../../schemas/acceptance-criteria.schema.json`](../../schemas/acceptance-criteria.schema.json)

## 인용

- `DEC-2026-05-26-v11-paradigm-결단` — spec stage template 신설
- `DEC-2026-05-26-contract-강제-양-axis` — BE/FE contract 강제 양 axis
- `ADR-011` — behavior-spec·acceptance-criteria json 단독 SSOT

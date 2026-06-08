# schema-validator/ — chain 산출물 6 schema 검증 (Ajv 8 / strict mode)

## Purpose

v2.0 chain harness 산출물의 JSON Schema 정합 검증. plugin user 가 산출물 (chain 1~4 + cross) 작성 후 schema 위반 자동 검출.

DEC-2026-05-02-v1.4-Stage-5-Sprint-5-3-종결 (Ajv 8 신설) + DEC-2026-05-06-sub-plan-3a-종결 (chain 6 schema 자동 등록 / if/then strict).

## When to call

| 시점                  | command                         | 호출자                        |
| --------------------- | ------------------------------- | ----------------------------- |
| 모든 chain stage 종결 | `schema-validator <output-dir>` | gate auto (chain-driver next) |
| 산출물 add/edit       | `schema-validator <output-dir>` | skill auto-invoke             |

## Inputs

- `<project-dir>/.ai-context/output/**/*.json` — 검증 대상 산출물
- chain 6 schema (자동 등록 / v11.0.0 — planning-spec → discovery-spec rename):
  - `discovery-spec.schema.json`
  - `behavior-spec.schema.json`
  - `acceptance-criteria.schema.json`
  - `test-spec.schema.json`
  - `impl-spec.schema.json`
  - `traceability-matrix.schema.json`
  - `operational-task.schema.json` (v11.0.0 신설 / Story sibling OP-\* anchor)
  - `task-plan.schema.json` (v9.x / v11.0.0 확장)
- 기타 schema (state / intervention-log / 19+ BE/FE 공용)

## Outputs

- 검증 결과 stdout (JSON / 사용자 friendly summary)
- finding (`schema_violation` kind / severity 기반 분류)

## Exit codes

| code | 의미 |
| ---- | ---- |

> 권위 = `src/cli.js:15` header.

| 0 | 모든 산출물 schema valid (모두 통과) |
| 1 | schema violation ≥ 1 (gate blocked) |
| 2 | usage error |

## Ajv 8 strict mode

- `additionalProperties: false` 의무 (실수 차단)
- `if/then/else` 조합 (예: `framework=other` 시 `stdout_parser` 의무)
- format validator (date-time / uri / email)
- enum / pattern / required 강제

## Sibling tools

chain harness gate validator 4종이 본 도구를 sub-invoke:

- [`../discovery-extraction-validator/`](../discovery-extraction-validator/) — chain 1 / discovery-spec schema 의존
- [`../chain-coverage-validator/`](../chain-coverage-validator/) — chain 2 / behavior + acceptance schema 의존
- [`../spec-test-link-validator/`](../spec-test-link-validator/) — chain 4 / test-spec schema 의존
- [`../test-impl-pass-validator/`](../test-impl-pass-validator/) — chain 5 / impl-spec schema 의존

## Test

```bash
npm test --workspace=tools/schema-validator   # 5 unit test pass
```

## 참조

- DEC-2026-05-06-sub-plan-3a-종결 — chain 6 schema 자동 등록 + Ajv 8 if/then strict
- ADR-CHAIN-001 (chain-4-stage-enforcement) — chain 산출물 schema 의무
- [`../../schemas/`](../../schemas/) — 19+ schema source (chain 6 + state + intervention-log + BE 5 + FE 8)

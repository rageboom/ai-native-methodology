# JSON Schemas (v3.2 G3 work-unit-manifest 추가)

> **32 schema** = chain v2 (6) + state 영속 (3) + G3 운영 (1) + Analysis BE (5) + Analysis FE (5) + aspect FE (4) + characterization 1 (v2.1.0) + sql-inventory 1 (v2.2.0) + error-mapping 1 (v1.5.0) + 메타+유틸 (5). JSON Schema Draft 2020-12. 모두 `$id = https://ai-native-methodology/schemas/{name}.schema.json` 형식 + top-level `additionalProperties: false` strict (D9 / v3.1.x).

---

## chain harness v2.0 (6 + 3)

| Schema                            | 대응 산출물                                                      | 사용 위치                                             |
| --------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `discovery-spec.schema.json`      | chain 1 / discovery-spec                                         | `tools/discovery-extraction-validator/` (gate #1)     |
| `behavior-spec.schema.json`       | chain 2 / behavior-spec (BHV-\* executable contract)             | `tools/chain-coverage-validator/` (gate #2)           |
| `acceptance-criteria.schema.json` | chain 2 / Gherkin BDD AC-\*                                      | `tools/chain-coverage-validator/`                     |
| `task-plan.schema.json`           | chain 3 / task 분해 + ADR + NFR + risk                          | `tools/plan-coverage-validator/` (gate #3)            |
| `test-spec.schema.json`           | chain 4 / TC-\* (RED 의무)                                       | `tools/spec-test-link-validator/` (gate #4)           |
| `impl-spec.schema.json`           | chain 5 / IMPL-\* (GREEN / 100% pass)                            | `tools/test-impl-pass-validator/` (gate #5)           |
| `traceability-matrix.schema.json` | release / UC→BHV→AC→TC→IMPL+commit_hash                          | `tools/traceability-matrix-builder/`                  |
| `state.schema.json`               | chain-driver state 영속                                          | `tools/chain-driver/src/state-store.js`               |
| `intervention-log.schema.json`    | 사용자 결단 로그 (single-writer JSONL)                           | `tools/chain-driver/src/state-store.js`               |
| `test-cmd.schema.json`            | test runner 호출 명세 (framework / cmd / args / cwd)             | `tools/test-impl-pass-validator/`                     |
| `work-unit-manifest.schema.json`  | G3 (R5/R7) — scope + stage manifest (analysis_refs + sync_state) | `tools/chain-driver/src/state-store.js writeManifest` |

## Analysis stage — BE 5 + FE 8

| Schema                             | 대응 산출물                                         | 트랙  |
| ---------------------------------- | --------------------------------------------------- | ----- |
| `architecture.schema.json`         | Phase 3 architecture                                | BE/FE |
| `domain.schema.json`               | Phase 4 domain                                      | BE    |
| `db-schema.schema.json`            | Phase 2 DB schema                                   | BE    |
| `openapi-extension.schema.json`    | Phase 5-1 API 확장 (x-\* fields)                    | BE    |
| `business-rules.schema.json`       | Phase 4 business-rules                              | BE/FE |
| `ui-spec.schema.json`              | Phase 5-2 UI 명세                                   | FE    |
| `state-map.schema.json`            | Phase 5-2-b state machine                           | FE    |
| `visual-manifest.schema.json`      | Phase 5-2-c Playwright snapshot                     | FE    |
| `form-validation-spec.schema.json` | Phase 5 form validation (Zod / Yup / RHF / etc 9종) | FE    |
| `type-spec.schema.json`            | Phase 5 TypeScript type-spec (ts-morph)             | FE    |
| `error-mapping-spec.schema.json`   | Phase 5 error mapping (v1.5.0 신설)                 | BE    |

## Phase 4.7 — characterization (v2.1.0 신설)

| Schema                              | 대응 산출물                                                                                                      | 트랙                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `characterization-spec.schema.json` | Deliverable #23 / phase 4.7 / 의도 vs 버그 4분류 + Given/When/Then snapshot acceptance oracle + ratchet coverage | BE/FE 공통 (≥ 2 PoC corroboration: PoC #06 Legacy + PoC #03 Modern) |

## Phase 4.8 — sql-inventory (v2.2.0-rc1 신설)

| Schema                      | 대응 산출물                                                                                                                                                                                                             | 트랙                                                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql-inventory.schema.json` | Deliverable #24 / phase 4.8 / SQL 단위 11 컬럼 인벤토리 (외부 6 + statement_type + uc_link + intent_vs_bug_classification + confidence + carry_flags) + extraction_automation + patterns_extension_v2 (optional Legacy) | BE/RDB 한정 (≥ 2 PoC scale-cross corroboration: PoC #06 단일책임 + PoC #07 다중책임 / paradigm-cross = Modern ORM PoC #08 carry C-v2.2.0-6) |

## Cross-cutting — aspect 4

| Schema                             | 대응 산출물                 |
| ---------------------------------- | --------------------------- |
| `a11y-spec.schema.json`            | aspect / a11y (WCAG 2.2 AA) |
| `i18n-spec.schema.json`            | aspect / i18n               |
| `static-security-spec.schema.json` | aspect / 정적 보안          |
| `legacy-spectrum.schema.json`      | legacy Tier 1~4 + Strangler |

## 공통 메타 + 유틸

| Schema                        | 용도                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `meta-confidence.schema.json` | 모든 산출물 공통 메타 (신뢰도 0.0~0.98 + source 명시)                                                           |
| `inventory.schema.json`       | Phase 1 인벤토리                                                                                                |
| `formal-spec.schema.json`     | Phase 4.5 형식 명세 (state-machine / sequence / decision-table / invariants / property-test / cross_validation) |
| `antipatterns.schema.json`    | Phase 6 antipatterns (avoid-list + migration_advice)                                                            |
| `finding-system.schema.json`  | finding 등록·분류·처리 (모든 phase / chain stage)                                                               |

---

## 검증 도구

[`../tools/schema-validator/`](../tools/schema-validator/) (Ajv 8 strict mode) 가 chain v2 6 schema 자동 등록 + if/then 강제. CI 통합 = `.github/workflows/drift-check.yml`.

```bash
node tools/schema-validator/src/cli.js <output-dir>
```

**5종 물증 if/then 의무** (`formal-spec.schema.json` + `test-spec.schema.json` + `impl-spec.schema.json`):

- `cross_validation.validators[]` 의 `real_tool: true` 시 `tool_version` / `tool_stdout_path` / `tool_stderr_path` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command` 모두 의무
- `real_tool: false` 시 `simulation_reason` 의무 (단 `simulation_only: true` 시 자동 fail / no-simulation 정책)

→ `tools/static-runner/lint-no-simulation.sh` 가 grep 보강 (이중 안전망).

## 작성 규칙

- `$id = https://ai-native-methodology/schemas/{name}.schema.json` 형식
- 외부 참조 = 상대 경로 (`./meta-confidence.schema.json`)
- 모든 enum 값 = ADR 또는 phase-\*.md 본문과 정합
- 신규 필드 = 옵셔널 default (호환성 유지)
- `additionalProperties: false` 의무 (실수 차단)

## 수동 검증 (fallback)

```bash
npx ajv validate \
  -s schemas/discovery-spec.schema.json \
  -d output/.ai-context/discovery-spec.json \
  -r schemas/meta-confidence.schema.json
```

## 참조

- [`../README.md`](../README.md) — plugin user 진입점
- [`../tools/README.md`](../tools/README.md) — 12 도구 cadence + 각 도구가 검증하는 schema
- [`../methodology-spec/README.md`](../methodology-spec/README.md) — phase × deliverable × schema 매트릭스
- ADR-CHAIN-001 (chain-4-stage-enforcement) + ADR-CHAIN-004 (test-runner-invocation-contract)
- chain v2 6 schema 신설 record (sub-plan-2 종결 / `CHANGELOG-HISTORY.md` 참조)

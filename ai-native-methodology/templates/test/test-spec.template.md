# test-spec — <scope>

★ v11.0.0 paradigm — chain 4 (test) 산출물 (사람 검토용 / 이중 렌더링). **RED 의무** (impl 부재 / 모든 test fail). 5종 물증 7 필드 본격 / no-simulation.

## 메타

| 항목 | 값 |
|---|---|
| 생성 시각 | <ISO 8601> |
| 방법론 버전 | v11.0.0 |
| 신뢰도 | 0.85 |
| acceptance-criteria | `.aimd/output/acceptance-criteria.json` |
| behavior-spec | `.aimd/output/behavior-spec.json` |
| test_pass_rate | **0.0** (RED) |

## 1. Test case (TC-*)

### TC-DOMAIN-001 — BE unit (junit5)

| 항목 | 값 |
|---|---|
| AC backward | AC-DOMAIN-001 |
| BHV backward | BHV-DOMAIN-001 |
| type | unit |
| framework | junit5 (active) |
| expected_outcome | **fail** (RED) |
| fail_mode | compile_import_fail (Beck-canonical) |
| source_file | `src/test/java/com/example/domain/DomainServiceTest.java` |

### TC-DOMAIN-002 — BE contract (schemathesis / openapi_contract_ref 의무)

| 항목 | 값 |
|---|---|
| AC backward | AC-DOMAIN-002 |
| type | contract |
| framework | schemathesis |
| openapi path | `/api/domain/resource` |
| operationId | `createDomainResource` |
| fail_mode | assertion_fail |

★ BE contract framework (schemathesis / dredd / pact / spring-cloud-contract) = openapi_contract_ref 본격 required (★ if/then schema enforce).

### TC-DOMAIN-003 — FE visual (playwright-visual / visual_regression_ref 의무)

| 항목 | 값 |
|---|---|
| AC backward | AC-DOMAIN-003 |
| type | visual |
| framework | playwright-visual |
| screen | DashboardScreen |
| state_map_ref | `dashboard.modal.create` |
| dtcg_token_set | `default` |
| viewports | 1280x720, 375x667 |
| baseline | `.aimd/test/visual/baseline/dashboard.png` |

★ FE visual framework (playwright-visual / axe-core / percy / chromatic) = visual_regression_ref 본격 required.

## 2. coverage

| metric | 값 | threshold |
|---|---|---|
| link_coverage.by_acceptance_criteria | 1.0 | 0.85 |
| **test_pass_rate** | **0.0** | RED 의무 |

## 3. 5종 물증 7 필드 (★ no-simulation)

각 TC 의 `test_run_evidence` 안:
1. test_runner_version (실 runner --version)
2. test_runner_stdout_path (불변 보존)
3. invocation_timestamp (ISO 8601)
4. duration_ms (실 측정)
5. pass_count / fail_count / skip_count (★ RED 시 fail_count > 0)
6. reproduction_command (재현 가능)
7. result_hash (sha256: stdout 정규화 hash)

## 검증

- `tools/test-impl-pass-validator/` (gate #4 / RED) — 모든 test fail 입증 (`--dry-run` 시 placeholder ❌)
- `tools/spec-test-link-validator/` (gate #4) — AC → TC link coverage ≥ 0.85
- `tools/schema-validator/` — `schemas/test-spec.schema.json` if/then (BE contract / FE visual)

## 다음

chain 5 (implement) gate #5 진입 → `impl-spec.{json,md}` 산출 (GREEN 의무 / 모든 test 100% pass).

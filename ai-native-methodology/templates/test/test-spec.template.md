# test-spec — <scope>

★ v11.0.0 paradigm — chain 4 (test) 산출물 (사람 검토용 / 이중 렌더링). **RED 의무** (★ scenario-conditioned: S1/greenfield = 모든 test fail / S2(AX전환) = per_tc_outcome / S3 = snapshot_green). 5종 물증 10 필드 본격 / no-simulation.

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

### TC-DOMAIN-004 / 005 — ★ S2(AX전환) characterization + augmentation 쌍 (per_tc_outcome scaffold)

| TC | test_intent | expected_outcome | 의미 |
|---|---|---|---|
| TC-DOMAIN-004 | characterization | **pass** | 기존 legacy 동작 포착 (코드 존재 → GREEN) |
| TC-DOMAIN-005 | augmentation | **fail** | 신규 증강분 (impl 부재 → RED / impl 후 pass 격상) |

★ S2 는 aggregate all_fail 대신 per-TC `expected_outcome ↔ test_intent` 정합 검사 (`test-impl-pass-validator --scenario S2 --test-spec` → `outcome_mismatches` → gate-eval `per_tc_outcome` / s2_outcome_mismatch WARN). DEC-2026-05-30-s2-gate-slice / v11.11.0.

## 2. coverage

| metric | 값 | threshold |
|---|---|---|
| link_coverage.by_acceptance_criteria | 1.0 | 0.85 |
| **test_pass_rate** | **0.0** | RED 의무 |

## 3. 5종 물증 10 필드 (★ no-simulation)

각 TC 의 `test_run_evidence` 안 (★ test-spec.schema required = 10 필드 / top-level `test_invocation_evidence` ❌ = schema 금지 / standalone `test-invocation-evidence.json` = runner 별도 산출물):
1. test_runner_version (실 runner --version)
2. test_runner_stdout_path (불변 보존)
3. invocation_timestamp (ISO 8601)
4. duration_ms (실 측정)
5. pass_count
6. fail_count (★ S1/greenfield RED 시 > 0)
7. skip_count
8. reproduction_command (재현 가능)
9. result_hash (sha256: stdout 정규화 hash)
10. report_format (★ test-spec enum 언더스코어: jest_json / junit_xml / stdout_regex …)

## 검증

- `tools/test-impl-pass-validator/` (gate #4 / RED) — 모든 test fail 입증. ★ RED evidence 는 `--allow-execute` (실 runner 실행 / ADR-CHAIN-004 §4) 의무 (`expected: all_fail`). `--dry-run` = config 검증만 / 실행 ❌ → RED evidence ❌.
- `tools/spec-test-link-validator/` (gate #4) — AC → TC link coverage ≥ 0.85
- `tools/schema-validator/` — `schemas/test-spec.schema.json` if/then (BE contract / FE visual)
- `lint-no-simulation` (chain-strict / gate #4) — ★ no-simulation 핵심 게이트. Tier 3 simulated 영구 reject / RED evidence 날조 차단.

## 다음

chain 5 (implement) gate #5 진입 → `impl-spec.{json,md}` 산출 (GREEN 의무 / 모든 test 100% pass).

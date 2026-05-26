# impl-spec — <scope>

★ v11.0.0 paradigm — chain 5 (implement) 산출물 (사람 검토용 / 이중 렌더링). **GREEN 의무** (모든 test 100% pass / fail_count=0). 실 코드 = 산출물 ❌ / commit_hash 만 보존 (i-strict).

## 메타

| 항목 | 값 |
|---|---|
| 생성 시각 | <ISO 8601> |
| 방법론 버전 | v11.0.0 |
| 신뢰도 | 0.85 |
| test-spec | `.aimd/output/test-spec.json` |
| behavior-spec | `.aimd/output/behavior-spec.json` |
| test_pass_rate | **1.0** (GREEN) |

## 1. Modules (IMPL-*)

### IMPL-DOMAIN-001 — BE (spring-boot-3)

| 항목 | 값 |
|---|---|
| TC backward | TC-DOMAIN-001, TC-DOMAIN-002 |
| BHV backward | BHV-DOMAIN-001 |
| layer | **be** |
| stack | `spring-boot` |
| framework | `spring-boot-3` (version-bound) |
| commit_hash | `0000000000...` (★ 실 git commit / source_files 결정 trace) |
| source_files | `src/main/java/com/example/domain/DomainService.java`, `DomainController.java` |

### IMPL-DOMAIN-002 — FE (react-18)

| 항목 | 값 |
|---|---|
| TC backward | TC-DOMAIN-003 |
| layer | **fe** |
| stack | `react` |
| framework | `react-18` |
| commit_hash | `0000000000...` |
| source_files | `src/features/domain/DomainCreateForm.tsx`, `api.ts` |

## 2. test_pass_evidence (★ 5종 물증 7 필드 / GREEN 본격)

| 필드 | 값 |
|---|---|
| test_runner_version | junit-jupiter 5.10.0 + vitest 1.4.0 |
| invocation_timestamp | <ISO 8601> |
| duration_ms | 12345 |
| pass_count | 3 |
| **fail_count** | **0** (★ const=0 enforce) |
| skip_count | 0 |
| reproduction_command | `./gradlew test` && `npm test` |
| result_hash | `sha256:...` |
| report_format | junit_xml |
| linter_output_path | `.aimd/output/test-evidence/static-runner.sarif` (★ R19 Tier 1 Semgrep + Tier 2 SARIF) |

## 3. coverage

| metric | 값 | threshold |
|---|---|---|
| link_coverage.by_acceptance_criteria | 1.0 | 0.85 |
| **test_pass_rate** | **1.0** | GREEN 의무 (const=1.0) |
| line_coverage | 0.85 | optional |
| branch_coverage | 0.80 | optional |

## 4. human_review (★ 70~80% 한계 schema 정합)

- gate_4_intervention_pct: 0.10 (사용자 검토 ≤ 30%)
- intervention_log: <gate #5 결단 trace>

## 검증

- `tools/test-impl-pass-validator/` (gate #5 / GREEN) — `--allow-execute` 실 runner 100% pass + result_hash 정규화
- `tools/static-runner/` (R19 Tier 1 Semgrep + Tier 2 SARIF) — 정적 분석 6종
- `tools/traceability-matrix-builder/` — UC → BHV → AC → TC → IMPL forward+backward 100% green
- `tools/schema-validator/` — `schemas/impl-spec.schema.json` (fail_count=0 enforce / test_pass_rate=1.0 enforce)

## 다음

- 사용자 검토 → release-readiness 22/22 ready → version 3-way sync → commit + tag + push
- traceability-matrix 100% green 의무

# test-impl-pass-validator/ — chain 4 test (RED) + chain 5 implement (GREEN) 공유 gate runner (no-simulation 정책 핵심 enforcement)

## Purpose

chain harness 의 핵심 test-runner validator (test+implement 공유 / System Y): **gate #4 (chain 4 test / RED — expected all_fail / fail_count > 0)** + **gate #5 (chain 5 implement / GREEN — expected all_pass / fail_count = 0)**. 진짜 test runner (jest / vitest / junit5 / pytest 등) `--allow-execute` 호출 + result_hash deterministic.

DEC-2026-05-06-sub-plan-3b-종결 / ADR-CHAIN-004 (test runner invocation contract) / Aider 패턴 정합.

## When to call

| 시점                                                       | command                                                                     | 호출자                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| test(chain 4 RED) / implement(chain 5 GREEN) stage 종결 시 | `test-impl-pass-validator --allow-execute`                                  | gate auto (chain-driver next) |
| S2(AX전환) per-TC outcome 검사                             | `test-impl-pass-validator --allow-execute --scenario S2 --test-spec <path>` | gate auto (chain-driver next) |
| dry-run (사용자 fix 검증)                                  | `test-impl-pass-validator --dry-run`                                        | user (수동)                   |

## Inputs

- `<project-dir>/.ai-context/config/test-cmd.json` — test runner 명세 (schemas/test-cmd.schema.json 정합)
- `<project-dir>/.ai-context/output/test/` + `<project-dir>/.ai-context/output/impl/` — 실 test code + 실 impl code
- `<project-dir>/.ai-context/output/test-spec.json` (chain 4) + `impl-spec.json` (chain 5) 산출물

## Outputs

- 5종 물증 (no-simulation):
  - `result_hash` (sha256 / framework_neutral / order 비결정 차단)
  - `test_count` (pass / fail / total)
  - `framework` (jest / vitest / junit-xml / pytest / other)
  - `flaky_retries_count` (per-test cap 2 / Playwright 정합)
  - `source_commit_sha`
- finding (test_failed / impl_missing / framework_mismatch 등)

## Exit codes

| code | 의미 |
| ---- | ---- |

> 권위 = `src/cli.js:16-19` header.

| 0 | 100% pass + 5종 물증 7 필드 정합 / `--dry-run` |
| **1** | 1+ fail / evidence 누락 / timeout (gate blocked) |
| 2 | usage error / config parse error / `--allow-execute` 부재 + `--dry-run` 부재 |

## `--allow-execute` 의무

진짜 test runner 호출 = system level command 실행. 사용자 명시 동의 없이 실행 ❌:

- `--allow-execute` (또는 `--dry-run`) 부재 시 → exit 2 (실행 거부 / cli.js:16-19 header 권위)
- CI 자동화 시 `--allow-execute` opt-in
- shell injection 차단: `shell:false` array argument (DEC-2026-05-06-sub-plan-3b-종결)

## 5 framework adapter

| framework    | adapter                    | 출력 parsing                                                                           |
| ------------ | -------------------------- | -------------------------------------------------------------------------------------- |
| jest         | `src/runners/jest.js`      | --json + jest-result.json                                                              |
| vitest       | `src/runners/vitest.js`    | --json + vitest-result.json                                                            |
| junit5 (xml) | `src/runners/junit-xml.js` | xunit-style XML                                                                        |
| pytest       | `src/runners/pytest.js`    | --junit-xml                                                                            |
| other        | `src/runners/other.js`     | `stdout_parser` 의무 (test-cmd.schema if/then strict / `count_mode: occurrences` 지원) |

T16 (no-simulation) — mocha / go-test 는 inventory 추론 시 `framework:'other'` + stdout_parser scaffold 로 자동 매핑(실행 가능). cargo / dotnet / phpunit = `framework:'other'` 명시 설정 carry (전용 adapter 미보유 — 가짜 지원 ❌).

## result_hash 정규화 (SARIF Appendix F 정합)

```
result_hash = sha256(
  sorted_test_names +
  pass_count +
  fail_count +
  framework
)
```

timestamp / duration / abs path 제외 → order 비결정 차단 / commit-to-commit reproducible.

## flaky retry per-test cap 2

- Playwright 정합 (max-retries: 2)
- `flaky_retries_count` 필드 trace
- 3+ retry 시 fail 처리 (불안정 test 차단)

## Sibling tools

- [`../schema-validator/`](../schema-validator/) — impl-spec.schema.json 검증 (sub-invoke)
- [`../traceability-matrix-builder/`](../traceability-matrix-builder/) — release 시 IMPL→TC link 검증

## Test

```bash
npm test --workspace=tools/test-impl-pass-validator   # unit test pass (result-hash/adapter/cli/mock-detect/s2-outcome-check/report-format/load-test-cmd)
```

`test/fixtures/` (3 files) = workspace only / dist 자동 제외.

## 참조

- ADR-CHAIN-004 — test-runner-invocation-contract (Aider 패턴 + `.ai-context/config/test-cmd.json` 우선 + `--allow-execute` 의무 + result_hash 정규화)
- DEC-2026-05-06-sub-plan-3b-종결 — workspace 11번째 신설 + 5 adapter + Senior Blocker 1 해결
- [`../../schemas/test-cmd.schema.json`](../../schemas/test-cmd.schema.json) — test runner 명세 schema
- [`../../schemas/impl-spec.schema.json`](../../schemas/impl-spec.schema.json) — chain 5 (implement) 산출물 schema

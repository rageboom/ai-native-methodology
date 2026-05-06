# test-impl-pass-validator/ — chain 4 (impl) gate (★ ★ ★ no-simulation 정책 핵심 enforcement)

## Purpose

chain harness **gate #4** (impl → done) 의 핵심 validator. 진짜 test runner (jest / vitest / junit5 / pytest 등) 호출 + 100% test pass 의무 + result_hash deterministic.

DEC-2026-05-06-sub-plan-3b-종결 / ADR-CHAIN-004 (test runner invocation contract) / Aider 패턴 정합.

## When to call

| 시점 | command | 호출자 |
|---|---|---|
| chain 4 (impl) stage 종결 시 | `test-impl-pass-validator --allow-execute` | gate auto (chain-driver next) |
| dry-run (사용자 fix 검증) | `test-impl-pass-validator --dry-run` | user (수동) |

## Inputs

- `<project-dir>/.aimd/output/test/test-cmd.json` — test runner 명세 (★ schemas/test-cmd.schema.json 정합)
- `<project-dir>/.aimd/output/test/` + `<project-dir>/.aimd/output/impl/` — 실 test code + 실 impl code
- `<project-dir>/.aimd/output/test-spec.json` + `impl-spec.json` — chain 3+4 산출물

## Outputs

- 5종 물증 (★ no-simulation):
  - `result_hash` (sha256 / framework_neutral / order 비결정 차단)
  - `test_count` (pass / fail / total)
  - `framework` (jest / vitest / junit-xml / pytest / other)
  - `flaky_retries_count` (per-test cap 2 / Playwright 정합)
  - `source_commit_sha`
- finding (test_failed / impl_missing / framework_mismatch 등)

## Exit codes

| code | 의미 |
|---|---|
| 0 | 100% test pass / GREEN |
| 1 | 일반 error |
| **2** | ★ test fail or impl 부재 (gate blocked) |
| 3 | dry-run only (수동 검증) |

## ★ ★ ★ `--allow-execute` 의무

진짜 test runner 호출 = system level command 실행. 사용자 명시 동의 없이 실행 ❌:

- `--allow-execute` 없을 시 dry-run only fallback (exit 3)
- CI 자동화 시 `--allow-execute` opt-in
- shell injection 차단: `shell:false` array argument (DEC-2026-05-06-sub-plan-3b-종결)

## 5 framework adapter

| framework | adapter | 출력 parsing |
|---|---|---|
| jest | `src/adapters/jest.js` | --json + jest-result.json |
| vitest | `src/adapters/vitest.js` | --json + vitest-result.json |
| junit5 (xml) | `src/adapters/junit-xml.js` | xunit-style XML |
| pytest | `src/adapters/pytest.js` | --junit-xml |
| other | `src/adapters/other.js` | `stdout_parser` 의무 (test-cmd.schema if/then strict) |

★ mocha / cargo / dotnet / phpunit / go-test = v2.1+ carry.

## result_hash 정규화 (★ SARIF Appendix F 정합)

```
result_hash = sha256(
  sorted_test_names +
  pass_count +
  fail_count +
  framework
)
```

★ ★ timestamp / duration / abs path 제외 → order 비결정 차단 / commit-to-commit reproducible.

## flaky retry per-test cap 2

- Playwright 정합 (max-retries: 2)
- `flaky_retries_count` 필드 trace
- 3+ retry 시 fail 처리 (불안정 test 차단)

## Sibling tools

- [`../schema-validator/`](../schema-validator/) — impl-spec.schema.json 검증 (sub-invoke)
- [`../traceability-matrix-builder/`](../traceability-matrix-builder/) — release 시 IMPL→TC link 검증

## Test

```bash
npm test --workspace=tools/test-impl-pass-validator   # 25 unit test pass
```

★ `test/fixtures/` (3 files) = workspace only / dist 자동 제외.

## 참조

- ADR-CHAIN-004 — test-runner-invocation-contract (Aider 패턴 + `.aimd/config/test-cmd.json` 우선 + `--allow-execute` 의무 + result_hash 정규화)
- DEC-2026-05-06-sub-plan-3b-종결 — workspace 11번째 신설 + 5 adapter + Senior Blocker 1 해결
- [`../../schemas/test-cmd.schema.json`](../../schemas/test-cmd.schema.json) — test runner 명세 schema
- [`../../schemas/impl-spec.schema.json`](../../schemas/impl-spec.schema.json) — chain 4 산출물 schema

---
name: test-run-test-evidence
description: ★ ★ ★ v2.0 chain 3-4 횡단 skill. test-impl-pass-validator 진짜 runner 호출 + 5종 물증 7 필드 산출 + result_hash 정규화. ADR-CHAIN-004 정합 (Aider 패턴 + --allow-execute 의무). chain 3 (RED 검증) / chain 4 (GREEN 검증) 양쪽 사용. coverage-auditor + test-pass-verifier persona 책임.
allowed-tools: Read, Bash, Write
---

# run-test-evidence

★ ★ ★ v2.0 chain 3 + chain 4 의 **횡단 evidence skill**. test-impl-pass-validator 진짜 호출 + 5종 물증 7 필드 schema 강제.

## 언제 사용

- chain 3 종결 시 RED 검증 (모든 test fail 의무).
- chain 4 진입 시 + 종결 시 GREEN 검증 (100% pass 의무).
- 사용자: "test 돌려줘" / "5종 물증 산출" / "result_hash 갱신".

## 입력

- `<project>/.aimd/output/test-spec.json` (chain 3 산출)
- `<project>/.aimd/output/impl-spec.json` (chain 4 진행 중) — 있으면
- `<project>/.aimd/config/test-cmd.json` (★ ADR-CHAIN-004 §1) — 있으면 우선
- `<project>/.aimd/output/inventory.json` (★ stack_signals 추론 fallback)

## 산출

- `<project>/.aimd/output/evidence/test-invocation-evidence.json` (★ test_invocation_evidence schema 정합)
- `<project>/.aimd/output/evidence/test-stdout.txt` + `test-stderr.txt`
- `<project>/.aimd/output/evidence/test-report.{sarif,xml,json}` (framework 별)
- `test-spec.json` 의 `test_invocation_evidence` 필드 in-place 채움 (★ B5 정합)

## 절차

### 1. expected outcome 결정

| 시점 | expected_outcome | 의미 |
|---|---|---|
| chain 3 종결 (RED 검증) | `all_fail` | impl 부재 가정 / pass_count 0 의무 / fail_count > 0 의무 |
| chain 4 진입 (baseline) | `partial_or_fail` | impl 부분 진행 / 이전 chain 4 cycle 결과 |
| chain 4 종결 (GREEN 검증) | `all_pass` | ★ 100% pass / fail_count = 0 의무 (★ impl-spec.schema.json const 0) |

본 skill 호출 시 사용자 또는 caller skill 이 expected_outcome 명시 의무 (default = current chain stage 추론).

### 2. test-impl-pass-validator 호출

```bash
node tools/test-impl-pass-validator/src/cli.js \
  --project <project> \
  --inventory <project>/.aimd/output/inventory.json \
  --out <project>/.aimd/output/evidence/test-invocation-evidence.json \
  --allow-execute \
  --json
```

★ ★ ★ `--allow-execute` 의무. 사용자 명시 동의 부재 시 → CLI exit 2 / 본 skill 도 즉시 중단.

### 3. expected_outcome 검증

- chain 3 RED: validator 의 ok=false + fail_count > 0 → ✅. 만약 ok=true (모든 test pass) → ★ chain 3 RED 위반 → 사용자 prompt + chain 4 로 jump 권고.
- chain 4 GREEN: validator 의 ok=true + pass_count > 0 + fail_count = 0 → ✅. fail_count > 0 → chain 4 종결 ❌ / impl 보강 필요.

### 4. test-spec.json 갱신 (★ B5 정합)

test-impl-pass-validator 산출 evidence JSON 을 test-spec.json 의 `test_invocation_evidence` 필드에 in-place edit (또는 chain 4 시 impl-spec.json `test_pass_evidence`).

```json
{
  "test_invocation_evidence": {
    "test_runner_version": "jest 29.7.0",
    "test_runner_stdout_path": ".aimd/output/evidence/test-stdout.txt",
    "test_runner_stderr_path": ".aimd/output/evidence/test-stderr.txt",
    "invocation_timestamp": "2026-05-06T11:30:00Z",
    "duration_ms": 3210,
    "pass_count": 47,
    "fail_count": 0,
    "skip_count": 1,
    "reproduction_command": "npm test",
    "result_hash": "sha256:...",
    "report_format": "json",
    "flaky_retries_count": 0
  }
}
```

### 5. schema-validator 회귀

```bash
node tools/schema-validator/src/cli.js .aimd/output/test-spec.json
node tools/schema-validator/src/cli.js .aimd/output/impl-spec.json  # chain 4
```

### 6. lint-no-simulation chain-strict

```bash
bash tools/static-runner/src/lint-no-simulation.sh <project>/.aimd/output/ --chain-strict
```

★ chain 4 시 strict 모드 의무 (test_invocation_evidence 7 필드 + impl-spec source_files commit_hash 자동 검증 / sub-plan-3a §static-runner chain mode).

### 7. result_hash 결정성 회귀 (★ 권고)

같은 input 으로 두 번 실행 → 같은 result_hash 의무. 다르면 ★ ADR-CHAIN-004 §5 SARIF Appendix F 위반 → 사용자 결단 (timestamp/random seed 실수 의심).

## ★ ★ ★ no-simulation 강제

- `--allow-execute` 의무 (CLI level / 본 skill 본문 level).
- 5종 물증 7 필드 ★ 모두 채움 의무 (lint-no-simulation chain-strict 자동 차단).
- result_hash 정규화 (timestamp/duration/abs path 제외 / SARIF Appendix F).
- shell:true ❌ array argument (CLI level).

## ★ flaky retry policy (Playwright 정합)

per-test cap 2. 3회+ retry = 진짜 fail. flaky_retries_count 필드로 trace.

본 skill 단계 finding 등록:
- `flaky_retries_count > 0` → low finding (info / 추적).
- `flaky_retries_count > 5` (전체) → medium finding (impl/test 안정성 의심).

## 인용

- ADR-CHAIN-004 (Test Runner Invocation Contract)
- ADR-CHAIN-001 §6 (no-simulation 강화)
- test-spec.schema.json + impl-spec.schema.json `test_invocation_evidence`
- master plan §B chain 3 / chain 4 / §J 1 (시뮬 위험)

## Carry

- coverage threshold 검증 (chain-coverage-validator 책임 분리) = 본 skill scope 외.
- dorny/test-reporter / Codecov 통합 = sub-plan-6.

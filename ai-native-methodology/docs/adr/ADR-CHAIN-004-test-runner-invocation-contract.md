# ADR-CHAIN-004: Test Runner Invocation Contract (Aider 패턴)

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-06
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-CHAIN-001 (chain 4단계 정합 강제), ADR-CHAIN-002 (go/stop gate UX), DEC-2026-05-06-v2.0-i-strict-채택, sub-plan-3-research (★ ★ ★ Senior Blocker 1 — invocation matrix 미명시 / Industry Aider `--test-cmd` 패턴), DEC-2026-04-29-static-tool-실행-의무화 (★★★ no-simulation), test-spec.schema.json + impl-spec.schema.json (test_invocation_evidence)

## 컨텍스트

sub-plan-3 plan 의 D9 옵션 A — `child_process.spawnSync('npm', ['test', '--', '...'])` = 단순화 위험.

**Senior critical blocker 1** (sub-plan-3-research §Blocker 1):
- monorepo (nx / turbo / pnpm-workspace) 사용자 = `npm test` ❌
- JVM 프로젝트 (junit5 / maven / gradle) = `./gradlew test` / `mvn test`
- Python = `pytest` / `python -m pytest`
- Go = `go test ./...`
- 5 framework 단일 호출 가정 = 사실 ❌

**Industry 사례** (sub-plan-3-research §Industry):
- ★ ★ Aider `--test-cmd <shell>` 패턴 — 사용자 사전 설정 shell command + exit code 0 의무. 산업 검증된 simplest contract.
- Cursor 미통합 history = "LLM 이 runner 추론" 위험성 명시 사례 (LLM 환각).

본 v2.0 chain 3 (test) + chain 4 (impl) gate 는 **진짜 test runner 호출 + 100% pass 의무**. 하지만 어떤 명령으로 호출하는지 = 프로젝트마다 다름. AI 가 runner 추론 = 시뮬 위험 폭증 (★★★ no-simulation 위배).

이 invocation 정책 부재 = sub-plan-3b `test-impl-pass-validator` 진입 prerequisite.

## 결정

**Test Runner Invocation Contract** 를 다음 5 정책으로 명문화 (★ ★ Aider 패턴 채택):

### 1. 사용자 명시 우선 — `.aimd/config/test-cmd.json`

프로젝트 루트의 `.aimd/config/test-cmd.json` 이 single source of truth.

```json
{
  "$schema_origin": "../../../schemas/test-cmd.schema.json",
  "framework": "jest",
  "framework_version": "29.7.0",
  "test_cmd": "npm test",
  "test_cmd_args": ["--", "--ci", "--coverage"],
  "timeout_ms": 600000,
  "flaky_retry_per_test": 2,
  "report_format": "sarif-2.1.0",
  "report_path": ".aimd/output/test-report.sarif",
  "stdout_path": ".aimd/output/evidence/test-stdout.txt",
  "stderr_path": ".aimd/output/evidence/test-stderr.txt",
  "coverage_report_path": "coverage/lcov.info",
  "allow_execute": true
}
```

`framework` enum: `jest` / `vitest` / `junit5` / `pytest` / `go-test` / `rspec` / `phpunit` / `mocha` / `cargo-test` / `dotnet-test` / `other`.

### 2. 사용자 미명시 시 — `inventory.json` stack signal 자동 추론

`.aimd/config/test-cmd.json` 부재 시 `inventory.json` 의 `stack_signals` 로 자동 추론:

| stack_signal | inferred test_cmd | timeout_ms |
|---|---|---|
| `nodejs`+`jest` | `npm test` | 600000 |
| `nodejs`+`vitest` | `npx vitest run` | 600000 |
| `nodejs`+`mocha` | `npx mocha` | 600000 |
| `java`+`maven` | `mvn -B test` | 1200000 |
| `java`+`gradle` | `./gradlew test --no-daemon` | 1200000 |
| `python`+`pytest` | `python -m pytest --tb=short` | 600000 |
| `go` | `go test ./... -count=1` | 600000 |
| `nestjs` | `npm run test:e2e` | 1200000 |
| (그 외) | (추론 불가 — 사용자 명시 의무) | — |

추론 결과는 `--json` 출력에 `inferred_test_cmd: <cmd>` + `inference_source: "inventory.stack_signals"` 명시.

### 3. 사용자 명시 override — CLI `--test-cmd <shell>`

`test-impl-pass-validator --test-cmd "<shell>"` 옵션으로 한 번만 override 가능. 영구 override = `.aimd/config/test-cmd.json` 갱신.

### 4. ★★★ no-simulation 강화 — `--allow-execute` 의무

`test-impl-pass-validator` 가 실제 사용자 코드를 실행하므로 (sandbox 위험 / Senior Blocker 2 §2 정합):

- `--allow-execute` flag **의무**. 부재 시 `dry-run` 만 허용 (exit 0 / no execution).
- `--allow-execute` 부재 + `--dry-run` 부재 → exit 2 (usage error).
- 의도: 사용자가 자신의 환경에서 코드 실행 동의 명시 의무 (CI 자동화 시 explicit allowlist).

### 5. ★★★ result_hash 정규화 — SARIF Appendix F 정합

`test_invocation_evidence.result_hash` =

```
sha256(
  sorted(test_names) ||
  pass_count || ":" || fail_count || ":" || skip_count ||
  framework || ":" || framework_version
)
```

**제외**: timestamp / duration_ms / 절대경로 / random seed (★ Senior Blocker 2 §3 / SARIF Appendix F deterministic log 가이드).

flaky retry policy: per-test cap 2 (Playwright 정합) / 3회째 fail = 진짜 fail / retry 발생 시 `flaky_retries_count` 필드 record.

## 5종 물증 7 필드 schema 강제

`test-spec.schema.json` + `impl-spec.schema.json` 의 `test_invocation_evidence` required:

```
test_runner_version
test_runner_stdout_path
test_runner_stderr_path  (★ B5 optional / non-empty if present)
invocation_timestamp
duration_ms
pass_count
fail_count
skip_count
reproduction_command
result_hash
report_format            (sarif-2.1.0 | junit-xml | json)
flaky_retries_count      (★ ADR-CHAIN-004 §5 신설 / default 0)
coverage_report_path     (impl-spec only / optional)
linter_output_path       (impl-spec only / optional)
```

## 결과

### 긍정
- AI 환각 차단 — runner 추론 ❌ / 사용자 명시 우선.
- monorepo / JVM / Python / Go 5 framework 무관 적용.
- SARIF Appendix F deterministic log 정합 → result_hash 재현성.
- `--allow-execute` flag → CI sandbox 동의 명시.

### 부정
- 사용자가 `.aimd/config/test-cmd.json` 작성 의무 → marginal friction (Aider 사례 = 1년 운영 입증 / 산업 검증된 friction).
- inventory.stack_signals 추론 정확도 ≤ 80% (5 framework 외 시 fallback 의무).

### 중립
- 추론 정확도 측정 = sub-plan-6 PoC #05 시점 (1차 single-case legacy 추출 / no-issue).

## 대안 (기각)

- **B**: SDK programmatic API (Jest API / Vitest programmatic) — 깊은 통합 + 복잡도 ↑ + JVM/Python framework SDK 부재 → 기각.
- **C**: 사용자가 직접 실행 후 JSON 입력 — runner 보장 ↓ / 5종 물증 위조 가능 → ★★★ no-simulation 위배 → 기각.

## 적용

- `schemas/test-cmd.schema.json` 신설 (sub-plan-3b 진입 시 / 본 ADR 채택 후).
- `tools/test-impl-pass-validator/` 신설 (sub-plan-3b carry / 본 ADR 가 prerequisite).
- `.github/workflows/chain-check.yml` gate #3+#4 step 활성 (sub-plan-6 PoC #05 시점).

## Carry

- B1: 추론 정확도 측정 데이터 = sub-plan-6 PoC #05.
- B2: tree-sitter semantic diff 기반 high-precision impact 분석 = v2.x carry (chain-revisit-detector / sub-plan-5).
- B3: pytest-json-report / dorny/test-reporter 같은 GitHub Action 통합 = sub-plan-6.
- B4: framework 별 sub-rule (NestJS e2e setup / Spring `@SpringBootTest` / pytest fixture) = v2.1+ skill 본문.

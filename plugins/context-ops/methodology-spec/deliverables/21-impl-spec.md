# 산출물 #21: Impl Spec (chain 5 / GREEN 의무 / i-strict 정통)

> **사상**: 진짜 runner 100% pass 의무 / impl trust 0.95 / gate #5 사용자 명시 결단 의무
> **schema**: `schemas/impl-spec.schema.json`
> **생성 phase**: chain 5 (implement) — `/implement-generate-impl-spec` + `/implement-verify-test-pass` (skills / sub-plan-4)
> **gate**: go/stop gate #5 (Auto Mode 위임 ❌)

## 1. 목적

**답하는 질문**: "test 100% pass 하는 production 코드는 무엇이고, 실 runner 실행 입증은?"

**활용**: chain 종결 / production 시스템 + traceability-matrix 동봉 결과.

**chain 5 = GREEN 의무** — `test_pass_evidence.fail_count = 0` (schema const 강제).

**single source-of-truth = impl-spec.json**. 실 코드 = 산출물 ❌ / `commit_hash` 만 본 산출물에 보존 / git 으로 결정적 trace.

## 2. 형식

```
.ai-context/base/chain-4-impl/
├── impl-spec.json
├── impl-report.md
├── test-pass-evidence.md
└── runs/
    └── 2026-05-06T13-00-00/
        ├── stdout.log
        ├── stderr.log         # optional
        ├── junit.xml          # report_format
        ├── coverage.lcov      # coverage_report_path
        └── linter.sarif       # static-runner 6종 결과
사용자 프로젝트:
└── src/main/.../**/*.{ts,java,py}   # 실 코드 (commit_hash 로 trace)
```

## 3. 추출 범위

| 항목                                 | 출처                                  | 도구                     | 신뢰도                                |
| ------------------------------------ | ------------------------------------- | ------------------------ | ------------------------------------- |
| modules (IMPL-\*)                    | test-spec TC-\* + behavior-spec       | LLM 자동 생성            | 60% → 90% (실 runner) → 95% (gate #4) |
| framework (open enum)                | analysis-source-inventory             | 결정적                   | 100%                                  |
| source_files                         | AI 자동 생성                          | LLM                      | 75%                                   |
| commit_hash                          | git rev-parse HEAD                    | 결정적                   | 100%                                  |
| source_evidence (excerpt)            | 실 코드 grep                          | 결정적                   | 100%                                  |
| test_pass_evidence (5종 물증)        | **진짜 runner 호출 / 100% pass 의무** | jest/vitest/junit/pytest | 100%                                  |
| coverage (3 metric)                  | runner + chain-coverage               | 결정적                   | 100%                                  |
| human_review.gate_4_intervention_pct | 사용자 명시 결단 trace                | 결정적                   | 100%                                  |

**입력**: test-spec.json + behavior-spec.json + 7대 산출물.

## 4. 검증 도구

| 도구                                      | 검증                                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **test-impl-pass-validator** (sub-plan-3) | 진짜 runner 호출 / 100% pass / 5종 물증 7 필드                                                                 |
| schema-validator                          | impl-spec.schema.json (fail_count const 0 강제)                                                                |
| chain-coverage-validator                  | severity_floor (critical=1.0 / DO-178C DAL A)                                                                  |
| static-runner (진짜 도구)                 | R19 Tier 1 (in-plugin: Semgrep / linter / PMD) + Tier 2 (사용자 환경 SARIF import: allowlist=PMD / orthogonal) |
| chain-revisit-detector                    | impl 변경 시 spec/test 영향 자동 감지 → gate prompt                                                            |

## 5. test_pass_evidence (no-simulation 강화)

```yaml
test_pass_evidence:
  test_runner_version: 'junit-jupiter-5.10.0'
  test_runner_stdout_path: '.ai-context/base/chain-4-impl/runs/2026-05-06T13-00-00/stdout.log'
  invocation_timestamp: '2026-05-06T13:00:00Z'
  duration_ms: 7892
  pass_count: 24
  fail_count: 0 # schema const 0 (chain 5 GREEN 의무)
  skip_count: 0
  reproduction_command: ['./gradlew test --tests UserSignupTest']
  result_hash: 'sha256:def456...' # 정규화
  report_format: sarif_2_1_0
  coverage_report_path: '.ai-context/base/chain-5-impl/runs/2026-05-06T13-00-00/coverage.lcov'
  linter_output_path: '.ai-context/base/chain-5-impl/runs/2026-05-06T13-00-00/linter.sarif'
```

## 6. human_review (70~80% 한계 schema 수용)

```yaml
human_review:
  gate_4_intervention_pct: 0.12 # ≤ 0.30 (master plan §J.2 옵션 A 정합)
  intervention_log:
    - 'gate #5: 사용자 검토 — IMPL-USER-001 의 password hash bcrypt round 12 확인'
    - 'gate #5: 사용자 결단 — go (test 100% pass + 보안 검증)'
```

## 7. 예시 (chain 4 sample)

```yaml
modules:
  - id: IMPL-USER-001
    tc_refs: [TC-USER-001, TC-USER-002, TC-USER-003]
    bhv_refs: [BHV-USER-001]
    framework: spring-boot-3
    source_files:
      - src/main/java/user/UserSignupService.java
      - src/main/java/user/UserRepository.java
    commit_hash: 'abc123def4567890abc123def4567890abc12345'
    source_evidence: '@Service class UserSignupService { public User signup(SignupRequest req) {...'
```

## 인용

- ADR: ADR-CHAIN-001 §3 (runner 100% pass 의무)
- ADR: ADR-008 §10 (impl-spec 형식 명세)
- ADR: ADR-009 §2.5 (impl trust 0.95)
- ADR: ADR-010 §2.6 (산출물 trust 모델)
- ADR: ADR-CHAIN-002 §gate #4 (사용자 명시 결단 의무)
- schema: schemas/impl-spec.schema.json

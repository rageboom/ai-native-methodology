# 산출물 #20: Test Spec (chain 4 / RED 의무)

> **schema**: `schemas/test-spec.schema.json`
> **생성 phase**: chain 4 (test) — `/test-generate-test-spec` + `/test-run-test-evidence` (skills / sub-plan-4)
> **gate**: go/stop gate #4

## 1. 목적

**답하는 질문**: "각 acceptance-criteria 를 검증할 test 코드는 무엇이고, 실 runner 실행 결과는?"

**활용**: chain 5 implement 단계의 RED → GREEN 정합 prerequisite.

**chain 4 = RED 의무** — 모든 test fail 의무 (impl 부재 / chain 5 GREEN 시점에 100% pass 격상).

## 2. 형식

```
.ai-context/output/chain-3-test/
├── test-spec.json
├── test-report.md   # 사람 눈
├── coverage-report.md
└── runs/
    └── 2026-05-06T12-00-00/
        ├── stdout.log         # 5종 물증 7 필드
        ├── stderr.log         # (optional / non-empty if present)
        └── junit.xml          # report_format
사용자 프로젝트 (실 test 코드):
└── src/test/.../**/*.test.{ts,java,py}   # 실 코드
```

## 3. 추출 범위

| 항목                                        | 출처                                      | 도구                     | 신뢰도                                       |
| ------------------------------------------- | ----------------------------------------- | ------------------------ | -------------------------------------------- |
| test_cases (TC-\*)                          | acceptance-criteria AC-\* + behavior-spec | LLM 자동 생성            | 60% (base) → 80% (실 runner) → 88% (gate #3) |
| type (8 enum)                               | AC severity + 도메인                      | LLM                      | 80%                                          |
| framework (open enum)                       | analysis-source-inventory stack           | 결정적                   | 100%                                         |
| framework_status                            | npm registry / GitHub                     | 결정적                   | 100%                                         |
| source_file (실 test 코드)                  | AI 자동 생성                              | LLM                      | 75%                                          |
| source_evidence (excerpt)                   | 실 코드 grep                              | 결정적                   | 100%                                         |
| test_run_evidence (5종 물증)                | **진짜 runner 호출**                      | jest/vitest/junit/pytest | 100%                                         |
| coverage (link / pass_rate / line / branch) | runner output + chain-coverage            | 결정적                   | 100%                                         |

**입력**: acceptance-criteria.json + behavior-spec.json + analysis-source-inventory.json (stack 시그널).

## 4. 검증 도구

| 도구                                            | 검증                                               |
| ----------------------------------------------- | -------------------------------------------------- |
| **spec-test-link-validator** (sub-plan-3)       | AC→TC 1:N + framework match + link_coverage ≥ 0.85 |
| schema-validator                                | test-spec.schema.json (5종 물증 7 필드)            |
| **진짜 test runner** (jest/vitest/junit/pytest) | RED 의무 — 모든 TC fail                            |
| chain-coverage-validator                        | severity_floor (critical=1.0)                      |

## 5. 5종 물증 7 필드 (no-simulation 강화)

```yaml
test_run_evidence:
  test_runner_version: 'jest 29.7.0' # 진짜 --version 출력
  test_runner_stdout_path: '.ai-context/output/chain-3-test/runs/2026-05-06T12-00-00/stdout.log'
  test_runner_stderr_path: '.ai-context/output/chain-3-test/runs/2026-05-06T12-00-00/stderr.log' # optional
  invocation_timestamp: '2026-05-06T12:00:00Z'
  duration_ms: 4523
  pass_count: 0 # RED 의무
  fail_count: 12
  skip_count: 0
  reproduction_command: ['npm test -- --testPathPattern=user.signup']
  result_hash: 'sha256:abc123...' # 정규화 (timestamp+duration 제외)
  report_format: sarif_2_1_0 # OASIS 표준 (GitHub Code Scanning native)
```

## 6. coverage 3 metric (Blocker 2 해결안)

```yaml
coverage:
  link_coverage:
    by_acceptance_criteria: 0.92 # chain 정합 의무
    by_business_rule: 0.88
    by_use_case: 0.95
    threshold: 0.85 # coverage ratchet
    severity_floor:
      critical: 1.0 # DO-178C DAL A
      high: 0.95
      medium: 0.90
      low: 0.85
  test_pass_rate: 0.0 # chain 4 = RED / chain 5 = 1.0
  line_coverage: 0.0 # impl 부재
  branch_coverage: 0.0
```

## 7. chain_attempt retry cap (Industry research)

```yaml
chain_attempt:
  attempt_n: 1
  retry_cap: 3 # default / 사용자 갱신 = §8.1 strict ≥ 2 PoC 의무
  revisit_count: 0
```

## 인용

- ADR: ADR-CHAIN-001 §3 (no-simulation 강화)
- ADR: ADR-008 §10 (test spec 형식 근거)
- ADR: ADR-009 §2.5 (test trust 0.88)
- ADR: ADR-010 §2.6 (coverage ratchet)
- schema: `schemas/test-spec.schema.json`

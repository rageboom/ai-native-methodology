# skills/test/ — chain 3 (test stage / RED 의무)

본 디렉토리 = chain harness 3 단계 / **test-spec + 실 test code (RED 의무)**. AC-* (Gherkin BDD) 를 TC-* (test case) 로 분해 + 실 test code 작성 + 실패 입증 (impl 부재 / 의도적 실패).

## 호출 cadence

- **trigger**: chain 2 (spec) gate #2 통과 후 (chain-coverage-validator AC ≥ 0.85)
- **자연어**: "test spec 생성 RED" / "test code 작성"
- **chain-driver**: `next` 진입 시 자동 호출

## skill 3종 (sub-plan-4 채움 ✅)

| skill | 역할 |
|---|---|
| [`generate-test-spec/`](./generate-test-spec/) | AC-* → TC-* 분해 (test-spec.{json,md} 산출 / `test-spec.schema.json` 정합) |
| [`run-test-evidence/`](./run-test-evidence/) | ★ 진짜 test runner 호출 (5종 물증 / RED 의무 / no-simulation) |
| [`verify-coverage/`](./verify-coverage/) | AC→TC link coverage ≥ 0.85 검증 |

## RED 의무 (★ ★ ★ no-simulation 정책)

chain 3 종결 시 다음 모두 검증:
- 실 test code 작성됨 (mock ❌ / placeholder ❌)
- 실 test runner 호출됨 (jest / vitest / junit5 / pytest)
- **모든 test fail** (impl 부재 / 의도적 실패) — RED 입증
- 5종 물증 (`result_hash` / `test_count` / `framework` / `flaky_retries_count` / `source_commit_sha`)

LLM "test 작성한 척 / RED 확인한 척" 시뮬레이션 차단 (D21' + mechanical gate trio).

## gate #3 (다음 stage 진입 자격)

[`../../tools/spec-test-link-validator/`](../../tools/spec-test-link-validator/) 자동 호출:
- AC→TC link coverage ≥ 0.85 의무
- RED 입증 (모든 test fail)
- 위반 시 state.blocked=true / cli exit 2 / chain 4 진입 차단

## 산출물

- `<project>/.aimd/output/test-spec.{json,md}` — TC-* 명세
- `<project>/.aimd/output/test/` — 실 test code (jest / vitest / etc)
- `<project>/.aimd/output/test/result_hash.json` — 5종 물증

## 기술 스택 분기

각 SKILL.md 본문에서 framework 분기 (jest / vitest / junit5 / pytest / mocha / cargo / 기타). chain 3 의 framework 결정 = `<project>/.aimd/config/test-cmd.json` (★ test-cmd.schema.json 정합).

## Sibling

- [`../spec/`](../spec/) — chain 2 / 본 stage 의 input (AC-*)
- [`../implement/`](../implement/) — chain 4 / 본 stage 의 output 활용 (TC → IMPL)
- [`../_base/invoke-go-stop-gate/`](../_base/invoke-go-stop-gate/) — gate #3 호출

## 참조

- [`../../methodology-spec/deliverables/20-test-spec.md`](../../methodology-spec/deliverables/20-test-spec.md) — test-spec 명세
- [`../../schemas/test-spec.schema.json`](../../schemas/test-spec.schema.json) — schema
- [`../../schemas/test-cmd.schema.json`](../../schemas/test-cmd.schema.json) — test runner 명세
- ADR-CHAIN-001 (chain-4-stage-enforcement) + ADR-CHAIN-004 (test-runner-invocation-contract)
- DEC-2026-05-06-sub-plan-4-종결 — 3 skill 정식 채움 record

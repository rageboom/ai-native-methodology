# skills/implement/ — chain 4 (impl stage / GREEN 의무)

본 디렉토리 = chain harness 4 단계 / **impl-spec + 실 impl code (GREEN / 100% test pass)**. TC-* (test case) 를 통과하는 IMPL-* 작성. RED → GREEN 전환.

## 호출 cadence

- **trigger**: chain 3 (test) gate #3 통과 후 (RED 입증 + AC→TC ≥ 0.85)
- **자연어**: "impl spec 생성 GREEN" / "impl 코드 작성"
- **chain-driver**: `next` 진입 시 자동 호출

## skill 2종 (sub-plan-4 채움 ✅)

| skill | 역할 |
|---|---|
| [`generate-impl-spec/`](./generate-impl-spec/) | TC-* → IMPL-* 분해 + 실 impl code 작성 (impl-spec.{json,md} 산출 / `impl-spec.schema.json` 정합) |
| [`verify-test-pass/`](./verify-test-pass/) | ★ 진짜 test runner 호출 + 100% test pass + result_hash 정규화 |

## GREEN 의무 (★ ★ ★ no-simulation 정책 핵심)

chain 4 종결 시 다음 모두 검증:
- 실 impl code 작성됨 (mock ❌ / placeholder ❌)
- chain 3 의 test code 그대로 재호출 (test 변경 ❌)
- **모든 test pass (100%)** — GREEN 입증
- 5종 물증 + result_hash deterministic (sha256 / framework_neutral / order 비결정 차단)

LLM "impl 작성한 척 / GREEN 확인한 척" 시뮬레이션 차단 — `--allow-execute` 의무 + shell injection 차단 (DEC-2026-05-06-sub-plan-3b-종결).

## v2.0 paradigm 정합 — round-trip 부분 허용

★ ★ DEC-2026-05-06-round-trip-부분-허용 — chain harness gate 안에서 round-trip (산출물 → 신규 코드 자동 생성) 정식 허용. 단:
- gate #4 의 100% test pass 통과 의무
- AI 자동 ≥ 85% / 사용자 검토 ≤ 15%
- 70~80% 한계 명시 잔존

## gate #4 (release 진입 자격)

[`../../tools/test-impl-pass-validator/`](../../tools/test-impl-pass-validator/) 자동 호출:
- 진짜 test runner 실행 (jest / vitest / junit5 / pytest / `--allow-execute` 의무)
- 100% test pass / fail 0
- result_hash 정규화 (sha256 / SARIF Appendix F 정합)
- flaky retry per-test cap 2 (Playwright 정합)

## 산출물

- `<project>/.aimd/output/impl-spec.{json,md}` — IMPL-* 명세
- `<project>/.aimd/output/impl/` — 실 impl code (Spring / NestJS / React / etc)
- `<project>/.aimd/output/test/result_hash.json` — GREEN 5종 물증

## Sibling

- [`../test/`](../test/) — chain 3 / 본 stage 의 input (TC-*)
- [`../_base/build-traceability-matrix/`](../_base/build-traceability-matrix/) — release matrix (UC→BHV→AC→TC→IMPL+commit_hash)

## 참조

- [`../../methodology-spec/deliverables/21-impl-spec.md`](../../methodology-spec/deliverables/21-impl-spec.md) — impl-spec 명세
- [`../../schemas/impl-spec.schema.json`](../../schemas/impl-spec.schema.json) — schema
- ADR-CHAIN-001 (chain-4-stage-enforcement) + ADR-CHAIN-004 (test-runner-invocation-contract)
- DEC-2026-05-06-sub-plan-4-종결 — 2 skill 정식 채움 record
- DEC-2026-05-06-round-trip-부분-허용 — chain 4 round-trip 정식 허용 결단

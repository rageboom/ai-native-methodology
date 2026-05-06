# agents/test/ — chain 3 (테스트) stage agent (★ v2.0)

★ ★ v2.0 SDLC 4단계 chain harness 의 chain 3 stage. DEC-2026-05-06-v2.0-i-strict-채택 정합. master plan `~/.claude/plans/a-stateful-gadget.md`.

★ ★ ★ **i-strict 채택**: AI 자동 test 코드 생성 + 사용자 검토. round-trip = chain harness gate 안에서 정식 허용 (DEC-2026-05-06-round-trip-부분-허용).

## 역할

chain 3 (test) = **acceptance-criteria 기반 실 test 코드 자동 생성** (RED 의무 — chain 3 종결 시 모든 test fail / impl 부재). 산출물 = `test-spec.{json,md}` (deliverable 20 / sub-plan-2 신설) + 실 test 코드.

★ ★ ★ **no-simulation 강화** — test-runner 진짜 호출 의무 / 5종 물증 7 필드 (runner_version + stdout_path + stderr_path + timestamp + pass/fail count + duration_ms + reproduction_command + result_hash).

## agent persona (sub-plan-4 정식 채움)

| persona | 역할 |
|---|---|
| **QA-architect** | 테스트 전략 (unit / integration / contract / e2e / property) 분포 결정 / acceptance-criteria → TC-* 분해 |
| **test-engineer** | 실 test 코드 작성 / fixture 설계 / framework 선택 (phase-1-inventory stack 정합) |
| **coverage-auditor** ★ v2.0 신설 | spec-test-link-validator 결과 분석 / coverage threshold ≥ 0.85 ratchet (ADR-010 v2) |

## 5 영역 매트릭스 — test stage

| 영역 | 강도 | 설명 |
|---|---|---|
| 기획 | ❌ | 적용 안 됨 (테스트 = 기술 영역 / 기획 산출물 직접 검증 ❌) |
| 디자인 | 약 | visual-regression test (visual-manifest.json baseline 입력) / a11y test (axe) |
| FE | 강 | unit / component / E2E test (Jest / Vitest / Playwright / Cypress) |
| BE | 강 | unit / integration / contract test (JUnit / pytest / Mocha / Supertest) |
| DB | 강 | schema migration test / fixture / 데이터 정합 |
| 공통 | 강 | acceptance-criteria cross-link 검증 / coverage 추적 |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용). 테스트 stack 후보: Jest / Vitest / Playwright / Cypress / JUnit / pytest / RSpec / Mocha + chai / Supertest / Testcontainers.

★ phase-1-inventory.json stack 시그널 → spec-test-link-validator framework match 자동 검증.

## 인터페이스 (lifecycle-contract.md §chain 3)

- input (spec → test): behavior-spec.json + acceptance-criteria.json + 7대 산출물
- 산출물 (test → implement): test-spec.json + 실 test 코드 (RED) + 5종 물증
- ★ ★ ★ go/stop gate #3 (사용자 검토 / ADR-CHAIN-002 정합)
- ★ ★ ★ test-impl-pass-validator 진짜 runner 실행 의무 (chain 3 = RED 의무 — 모든 test fail / impl 부재)

## skills

- `skills/test/generate-test-spec/` ★ sub-plan-4 채움 ✅ (chain 3 main)
- `skills/test/run-test-evidence/` ★ sub-plan-4 채움 ✅ (실 runner 5종 물증)
- `skills/test/verify-coverage/` ★ sub-plan-4 채움 ✅ (coverage ≥ 0.85)

## chain harness 정합 (★ v2.0)

★ ★ DEC-2026-05-06-round-trip-부분-허용 partial retract 정합 — round-trip = chain harness gate 안에서 정식 허용. test 자동 생성은 ★ ★ test-impl-pass-validator 진짜 runner 호출 + 5종 물증 7 필드로 시뮬 위험 봉쇄.

★ 70~80% 한계 명시 잔존: gate #3 사용자 검토 ≤ 15%. test-spec 자동 생성 ≥ 85%. 100% 자동화 ❌.

# DEC-2026-05-25-axis-a-phase-4-2

> v9.1.1 PATCH — axis A plan stage paradigm 본격 구현 Phase 4-2 시행 (additive only / breaking 0). agents/plan-agent.md placeholder → body + chain-driver gate-eval.js REQUIRED_VALIDATORS_PER_STAGE.plan 추가 + chain-driver test +1.

- **결단 일자**: 2026-05-25 (session 46차 / v9.1.1 PATCH / Phase 4-2 본격 시행)
- **결단자**: 윤주스 (TF Lead) — "gogo" 결단
- **범주**: paradigm — chain harness plan stage 본격 구현 2차 (additive)
- **상태**: 승인 / additive / PATCH

## 컨텍스트

DEC-2026-05-25-axis-a-phase-4-1 §4 carry — Phase 4-2 scope (A4 plan-agent body + A5 chain-driver plan 분기) 본 release 안 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5 / v9.1.0 → v9.1.1 → v9.x MINOR → v10.0.0 MAJOR → v10.1.0 MAJOR).

★ minimal scope 본격 결단:
- hooks-bridge.js TRIGGER_PATTERNS = 이미 v9.0.0 안 plan stage 등록 ✅ (추가 시행 ❌)
- stage-graph.js getGateForStage('plan') = null 유지 (★ Cluster 1 X 재번호 = Phase 4-4 v10.0.0 MAJOR carry)
- gate-eval.js plan-specific outcome enforcement (NFR allocation hard / TASK dependency cycle / coverage_pct < threshold) = ★ plan-coverage-validator 자체 안 본격 작동 / gate-eval generic findings (critical/high/medium/coverage_pct) 본격 작동 = 추가 분기 ❌
- ★ ★ minimal Phase 4-2 = A4 (plan-agent body) + A5 (REQUIRED_VALIDATORS_PER_STAGE.plan 추가만)

## 결정

### §1. A4 agents/plan-agent.md body (placeholder → body)

- frontmatter `skills:` = 7 skill 사전 주입 (★ spec-agent.md 동형 paradigm)
  - 3 plan-* skill (plan-decompose-and-sequence + plan-architect-decisions + plan-risk-and-nfr)
  - 4 base utility (_base-build-traceability-matrix + _base-apply-template + _base-log-finding + _base-invoke-go-stop-gate)
- description = "Use when chain 3 (plan) 진입" 본격
- body = 책임 범위 + Absolute priorities 7개 + 호출 절차 8 step + 산출 자산 4종 + When NOT to invoke + 인용
- ★ Cluster 1 X 재번호 carry 명시 (gate #plan = v10.0.0 MAJOR Phase 4-4)
- ★ Cluster 6 결단 = `task-plan.json` 본격 본체 산출 경로

### §2. A5 chain-driver gate-eval.js plan 분기

`tools/chain-driver/src/gate-eval.js:17-23` REQUIRED_VALIDATORS_PER_STAGE 본격 추가:
```javascript
plan: ['plan-coverage-validator', 'schema-validator'],
```

★ ★ minimal additive — outcome enforcement (NFR/cycle/coverage) = plan-coverage-validator 자체 안 본격 작동 / gate-eval generic findings 본격 작동 / 추가 분기 ❌.

`tools/chain-driver/test/gate-eval.test.js` test +1:
- `requiredValidators('plan')` returns `['plan-coverage-validator', 'schema-validator']` 본격 검증

chain-driver test 223 → **224/224 pass**.

### §3. A6~A8 carry 본격 보존 (DEC-2026-05-25-axis-a-phase-4-1 §4 정합)

- Phase 4-3 (v9.x MINOR / additive) — A6 traceability subtask_ids.chain3_plan additive
- Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7 + A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement (hooks-bridge.js PreToolUse deny + state.blocked 분기 본격 검증 / Senior BLOCKER-2 잔여 carry)
- Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무

## STOP-3

- workspace test: 726 → **727/727 pass** (chain-driver 223 → 224 / +1 신규 plan validator test)
- skill-citation-validator: **0 stale** (plan-agent body 신규 cross-ref 모두 existing)
- release-readiness 17/17 ready:true (보존)
- drift-validator 0 breaking (보존)
- version 3-way: plugin.json + package.json = 9.1.1
- breaking 0 / behavioral 변경 = REQUIRED_VALIDATORS_PER_STAGE 1 line additive (★ caller side = no impact / requiredValidators('plan') 신규 call site 본 release 안 부재) = PATCH

## 인용 / Cross-link

- DEC-2026-05-25-axis-a-phase-4-1 (★ 본 결단의 모 결단 — Phase 4-1 종결 / Phase 4-2 carry §4)
- DEC-2026-05-21-chain-discovery-plan-stage-도입 (paradigm source)
- DEC-2026-05-23-discovery-stage-v9 (v9.0.0 machine SSOT)
- ADR-CHAIN-001 §1 (이중 렌더링)
- ADR-CHAIN-002 (gate UX)
- ADR-CHAIN-005 §3 (mechanical gate enforcement trio — Phase 4-4 carry)
- `agents/plan-agent.md` (★ A4 신설 body)
- `tools/chain-driver/src/gate-eval.js` (★ A5 REQUIRED_VALIDATORS_PER_STAGE.plan 추가)
- `tools/chain-driver/test/gate-eval.test.js` (★ A5 test +1)
- `agents/spec-agent.md` (★ plan-agent 의 동형 paradigm source)

## Lessons Learned

- **LL-v911-01** (★ minimal scope Phase 본격 진입 paradigm) — Phase 4-2 = 본격 minimal scope (A4 plan-agent body + A5 1 line additive) / hooks-bridge.js + stage-graph.js + gate-eval outcome enforcement = 본격 변경 ❌ (이미 v9.0.0 안 등재 또는 generic findings 본격 작동) / Phase 분산 cadence 안 본격 scope 최소화 = quality risk 회피 + roll-back 자격 본격 보장.
- **LL-v911-02** (★ 후속 Phase 의 자연 cadence 본격 입증) — Phase 4-1 의 자연 후속 Phase 4-2 = 같은 session 안 본격 연속 시행 자격 (★ "gogo" 결단 / additive only / cooling-off ❌). 별도 DEC 신설 + 별도 release entry = paradigm 정합 (history doc immutable 정합 + 5 release 분산 cadence 정합).

Resolves: F-CHA-003 (plan stage paradigm 위배) Phase 4-2 부분 해소 (agent body + validator 등록 완료 / gate trio enforcement + traceability layer = Phase 4-3~4-4 carry).

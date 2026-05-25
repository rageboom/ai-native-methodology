# DEC-2026-05-25-axis-a-phase-4-3

> v9.2.0 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-3 시행 (★ DO-178C 6 layer 격상 / additive only / breaking 0). schemas/traceability-matrix.schema.json cell 안 `task_id` field 본격 additive + tools/traceability-matrix-builder TASK layer 매핑 본격 추가.

- **결단 일자**: 2026-05-25 (session 46차 / v9.2.0 MINOR / Phase 4-3 본격 시행)
- **결단자**: 윤주스 (TF Lead) — "진행" 결단
- **범주**: paradigm — DO-178C 5 tier → 6 layer 본격 격상 (Cluster 3 AC→TASK→TC paradigm)
- **상태**: 승인 / additive / MINOR

## 컨텍스트

DEC-2026-05-25-axis-a-phase-4-1 §4 carry + DEC-2026-05-25-axis-a-phase-4-2 §3 carry — Phase 4-3 scope (A6 traceability subtask_ids.chain3_plan additive) 본 release 안 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5).

★ ★ ★ Cluster 3 결단 (DEC-2026-05-25-axis-a-phase-4-1) — **AC→TASK→TC** paradigm 본격 정합. DO-178C 5 tier (System Req ↔ HLR ↔ LLR ↔ Source ↔ Test) → ★ 6 layer (UC ↔ BHV ↔ AC ↔ **TASK** ↔ TC ↔ IMPL) 격상.

★ ★ Senior risk #4 흡수: "TASK layer = additive only / 기존 PoC 의 ratchet 분모 유지 강제 schema migration plan 명시 의무" — 본 Phase 4-3 안 본격 정합:
- ★ task_id = optional field (required ❌)
- ★ task_id 부재 cell = 기존 PoC 안 정상 (task-plan 부재 = chain 3 진입 ❌ / yellow 격상 ❌)
- ★ forward_coverage / backward_coverage 분모 = green/total ratio (task_id 분모 영향 ❌)
- ★ 기존 PoC #05 + #14 회귀 0 본격 보장 (workspace 730/730 pass / 무회귀)

## 결정

### §1. A6 schemas/traceability-matrix.schema.json — cell 안 `task_id` additive

`schemas/traceability-matrix.schema.json` line 38 (test_id 다음) 본격 추가:

```json
"task_id": {
  "type": "string",
  "pattern": "^TASK-[A-Z0-9_-]+-[0-9]{3}$",
  "description": "★ v9.2.0 — chain 3 (plan) TASK layer cell-level link / Cluster 3 AC → TASK → TC paradigm / DO-178C 6 layer 격상 / Senior risk #4 흡수 — additive only / 기존 PoC ratchet 분모 미영향"
}
```

★ properties 추가 / required 불포함 (optional) / additionalProperties:false strict 정합.

### §2. A6 tools/traceability-matrix-builder — TASK layer 매핑

`tools/traceability-matrix-builder/src/builder.js` 본격 추가:

- `chain.taskPlan ?? null` optional input (backwards compat)
- `taskByAC = Map<ac_id, task_id>` index 신설 — 1 AC = 1 task (★ first-match / 1~3 AC 묶음 paradigm / DEC-2026-05-21 §정책4 정합)
- cell 안 `task_id` 채움 (taskPlan 있을 때만 / 부재 시 undefined / strict additionalProperties:false 정합 — Object.assign 안 undefined 제외)
- `derived_from` 안 `'task-plan.json'` 추가 (optional)

### §3. test 본격 +3 (TASK layer additive)

`tools/traceability-matrix-builder/test/builder.test.js` 본격 추가:

1. **backward compat** — taskPlan 부재 시 cell.task_id 부재 검증 (회귀 0)
2. **green cell + task_id** — taskPlan 입력 시 cell.task_id 채움 + derived_from 안 'task-plan.json' 포함
3. **yellow cell + task_id** — impl missing 시 yellow 격상 시점 task_id 채움 (★ Senior risk #4 — additive only / 기존 ratchet 분모 미영향)

traceability-matrix-builder test 82 → **85/85 pass** (+3).

### §4. A7~A8 carry 본격 보존

- Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 (Cluster 1 X) + revisit_edges + gate #plan trio enforcement (★ Senior BLOCKER-2 잔여 carry)
- Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration (★ ticket_ref.subtask_ids.chain3_plan 추가 = ticket-policy.md + ticket-sync skill 동반 변경 의무 / breaking 본격) + Type 2 외부 사용자 ≥ 1 corroboration 의무

## STOP-3

- workspace test: 727 → **730/730 pass** (traceability-matrix-builder 82 → 85 / +3 TASK layer additive test)
- skill-citation-validator: **0 stale** (★ DEC-2026-05-25-axis-a-phase-4-3 신설 후)
- release-readiness 17/17 ready:true (보존)
- drift-validator 0 breaking (보존)
- version 3-way: plugin.json + package.json = 9.2.0
- breaking 0 / schema field additive (★ optional / required ❌ / strict additionalProperties:false 정합 — field 자체 신규) = MINOR (criterion add precedent v8.6.0/v8.9.0 동형 / schema field add precedent)

## 인용 / Cross-link

- DEC-2026-05-25-axis-a-phase-4-1 (★ 본 결단의 모 결단 — Cluster 3 AC→TASK→TC paradigm source / §4 carry)
- DEC-2026-05-25-axis-a-phase-4-2 (Phase 4-2 / §3 carry)
- DEC-2026-05-21-chain-discovery-plan-stage-도입 (paradigm source / §정책4 1~3 AC 묶음)
- ADR-CHAIN-001 §2 (cross-link coverage ratchet / DO-178C bidirectional traceability)
- `schemas/traceability-matrix.schema.json` (★ task_id additive)
- `tools/traceability-matrix-builder/src/builder.js` (★ TASK layer 매핑)
- `tools/traceability-matrix-builder/test/builder.test.js` (★ +3 test)
- `schemas/task-plan.schema.json` (Phase 4-1 / TASK 원천)
- DO-178C 6 layer 격상 — System Req ↔ HLR ↔ LLR ↔ Source ↔ Test → UC ↔ BHV ↔ AC ↔ **TASK** ↔ TC ↔ IMPL

## Lessons Learned

- **LL-v920-01** (★ TASK layer additive only paradigm 본격 입증) — DO-178C 6 layer 격상 시 기존 PoC ratchet 분모 미영향 본격 보장 = ★ task_id optional + first-match 매핑 + cell-level 추가만 (required ❌ / 분모 변경 ❌). Senior risk #4 ("DO-178C 6 layer 격상 = 외부 권위 ratchet 자동 상승 → PoC retroactive 회귀") 본격 회피 paradigm.
- **LL-v920-02** (★ schema field add MINOR cadence paradigm 본격 입증) — optional schema field 추가 (additionalProperties:false strict 정합 + properties 안 추가 / required 불포함) = MINOR / criterion add precedent (v8.6.0 #14 + v8.9.0 #15 #16 + v9.0.6 #17) 동형. backward compat 본격 보장 + 신규 PoC 안 본격 활용.
- **LL-v920-03** (★ 3 release 연속 cadence 본격 입증) — session 46차 안 3 release (v9.1.0 MINOR + v9.1.1 PATCH + v9.2.0 MINOR) / 사용자 "진행" → "gogo" → "진행" 연속 결단 / 모두 additive only / cooling-off ❌ 자격 본격. ★ ★ Phase 4-4 v10.0.0 MAJOR = ★ structural / cooling-off ≥24h 의무 (★ ★ decision_cadence paradigm 정합).

Resolves: F-CHA-003 Phase 4-3 부분 해소 (traceability TASK layer 본격 / agent body + validator + 3 skill body + chain-driver validator + TASK layer = 5 axis 종결 / gate #plan trio enforcement + ticket subsystem migration = Phase 4-4 + Phase 4-5 carry).

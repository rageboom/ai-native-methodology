# DEC-2026-05-26-gate-renumber-coherence

> v10.0.2 PATCH — v10.0.0 gate 재번호(chain N = gate #N)의 prose+flow coherence 청산. machine 층은 v10.0.0 에서 했으나 개별 phase-flow gate phase + plan agent/skills/templates + guides·README·lifecycle prose 가 미정합으로 남아 있던 drift 청산. 이전 session 의 중단된 WIP(plan-stage gate 정합)을 함께 통합. corrective / breaking 0.

- **결단 일자**: 2026-05-26 (v10.0.2 PATCH)
- **결단자**: 윤주스 (TF Lead) — "WIP부터 같이 들여다보자" → WIP가 v10.0.0 gate 재번호의 부분 정합임을 발견 → 사용자 "전체 gate 재번호 정합 (권장)" 묶음 결단
- **범주**: corrective / prose+flow gate-renumber coherence (v10.0.0 후속)
- **상태**: 승인 / breaking 0 / PATCH

## 컨텍스트

v10.0.0 (DEC-2026-05-25-axis-a-phase-4-4-prime) 가 chain harness gate map 을 **chain N = gate #N 1:1 INTERNAL CONVENTION** 으로 재정렬 (plan = #3 / test = #4 / implement = #5). 그러나:

1. **개별 phase-flow.json gate phase + mermaid 짝**: test.phase-flow gate-3 / implement.phase-flow gate-4 (v9.0.1 잔존 / 제 작업) 가 갱신 안 됨 + plan.phase-flow 에 gate-3 phase node 없음 (다른 flow 와 구조 비대칭).
2. **plan agent/skills/templates**: plan-agent body 와 plan skills 가 "gate #plan / gate deferred / Phase 4-4 carry" 표기 잔존 (v9.1.0 placeholder→body 진입 시점 표기).
3. **guides·README·lifecycle prose**: 제 v9.0.1 coherence 결과 (plan = gate deferred / test = gate #3 / impl = gate #4 / "gate id ≠ chain" framing) 이 v10.0.0 machine 과 정면 모순.

drift-validator 가 chain-flow master mermaid + 개별 phase-flow gate 번호 vs stage-graph map 정합 을 안 보아 v10.0.0/v10.0.1 STOP-3 통과한 잔존 (제 v9.0.1 coherence redux 패턴 = machine 변경 → prose 지연).

WIP 발견 경위: 사용자 "WIP부터 같이 들여다보자" 결단 → working tree 의 11 파일 미커밋 WIP 분석 → 이전 session(v10.0.0 직후) 의 중단된 "v10.0.0 gate 재번호 follow-through" 작업으로 확인 (오늘 05-26 timestamp / 내부 정합 / 정확). 단, **부분만** 커버 (flows + plan agent/skills + templates / guides·README·lifecycle 미커버).

## 결정

### §1. 번호 규칙 확정 (전 prose 적용)

**chain N = gate #N 1:1 INTERNAL CONVENTION** (v10.0.0 / DEC-2026-05-25-axis-a-phase-4-4-prime 정합):
- gate #1 = discovery (chain 1)
- gate #2 = spec (chain 2)
- **gate #3 = plan (chain 3)** ← deferred/placeholder 해제
- **gate #4 = test (chain 4)** ← 구 #3
- **gate #5 = implement (chain 5)** ← 구 #4

"gate id ≠ chain 번호" framing **폐기** (제 v9.0.1 도입 / v10.0.0 INTERNAL CONVENTION 으로 대체).

### §2. WIP 통합 (이전 session 중단 / 정합 + 정확)

- `flows/plan.phase-flow.{json,mermaid}`: gate-3 phase node 추가 (다른 flow 와 구조 대칭).
- `flows/test.phase-flow.{json,mermaid}`: gate-3 → **#4** + `expected_outcome_chain3` → `chain4`.
- `flows/implement.phase-flow.{json,mermaid}`: gate-4 → **#5** + `expected_outcome_chain4` → `chain5`.
- `agents/plan-agent.md`: "gate #plan / deferred / Phase 4-4 carry" → "gate #3 hard gate 본격 활성".
- `skills/plan-decompose-and-sequence/SKILL.md` + `skills/plan-risk-and-nfr/SKILL.md`: gate #plan → gate #3.
- `templates/README.md`: chain 번호 + plan row.
- `templates/plan/README.md` (신규): plan template placeholder.

### §3. prose 전면 정합 (11 파일)

- `methodology-spec/lifecycle-contract.md`: OUTPUT block(plan #3 / test #4 / impl #5) + 5영역 plan row 본격 + 매핑 매트릭스 plan row 본격(skills 7 + gate #3 + plan-coverage-validator) + data-contract plan 절 placeholder 해제 + tree + traceability TASK layer + gate #1~#4 → #1~#5.
- `methodology-spec/skills-axis.md`: §4·§7.2·§9.2 plan placeholder 해제 (plan-agent skills 7 / chain 3 본격).
- `methodology-spec/id-conventions.md`: plan ID = task-plan TASK-*/ADR-*.
- `methodology-spec/deliverables/22-traceability-matrix.md`: gate #1~#5 + TASK layer.
- `README.md`: CHAIN block + scenario plan step 본격 + validator block(gate #1~#5 + plan-coverage-validator) + tree placeholder 해제.
- guides 4종: `chain-harness-guide.md` mermaid + sequenceDiagram + "gate id ≠ chain" 폐기 / `getting-started.md` 5-5 plan 본격 + gate 번호 / `first-prompt-cookbook.md` 2.3 Chain 3 plan skill-map / `common-errors.md`(검증).
- briefing 2종: `01-main.md` flow 다이어그램 + skill tree + "5번의 게이트" / `slides/methodology-deck.md` value + flow + 책임 표 + revisit 8(gate 매핑) + asset 표 + multiagent.
- `flows/README.md`: master SSOT "5 gate (chain N = gate #N)" + plan.phase-flow 본격.

## STOP-3

drift state-flow(6=6) + chain-layout(5 stage / **31 phase** = +1 plan gate-3) + phase-flow 짝(plan/test/implement) 0 breaking + release-readiness 19/20 (env fail 1 = macOS Windows-path test = clean v10.0.0 HEAD 동일 / 본 PATCH 무관) + skill-citation 0 stale + version 3-way 10.0.2 + breaking 0 = PATCH.

## carry (본 PATCH 외 / 잔존)

- C-v4.1-poc-재실행 (기존 PoC 에 task-plan 산출물 추가 재실행 / v10.x 검증 성격).
- C-v4.1-input-skill-이관 (`analysis-from-*` ↔ `discovery-from-*` 공존 처분 결단 / 사용자 결단 의무).
- macOS 환경 의존 test 1 fail (chain-coverage-validator Windows-path / 환경 보강 또는 skip-on-platform 검토).

## 인용

- DEC-2026-05-25-axis-a-phase-4-4-prime (v10.0.0 / chain N = gate #N machine 재정렬 / 본 DEC 의 모 결단)
- DEC-2026-05-21-chain-discovery-plan-stage-도입 (plan stage 신설 / 본 DEC 가 그 carry 들의 prose follow-through)
- DEC-2026-05-26-baseline-delta-operating-model (v10.0.1 / 동일 session 의 직전 carry 실행)

# DEC-2026-05-23-discovery-stage-v9

> v9.0.0 MAJOR — DEC-2026-05-21 (chain stage 재구성 / planning→discovery 개칭 + plan 신설) 을 현 main(v8.14.4) 위에 **machine SSOT 까지 완성**. 기존 feat/v4.1-hooks-carry-note 브랜치는 문서·skill·agent 만 바꾸고 state/flows/tooling 을 안 건드려 미완성·drift 상태였음.

- **결단 일자**: 2026-05-23 (session 41차 / v9.0.0 MAJOR)
- **결단자**: 윤주스 (TF Lead) — "discovery stage 재통합 진행" + 묶음 결단 (MAJOR v9.0.0 / fresh 재적용 / 기존 schema reuse / plan gate deferred / chain 1~5 순차)
- **범주**: paradigm / chain harness 6-stage 재구성 (machine SSOT 완성)
- **상태**: 승인 / breaking (state.schema stage enum + skill command-surface rename) / MAJOR

## 컨텍스트

DEC-2026-05-21 이 설계(옵션 A 개칭+확장)를 확정했으나, 구현 브랜치(feat/v4.1-hooks-carry-note)는 prose(lifecycle/axis/plugin desc)로만 6-stage 를 선언하고 `schemas/state.schema.json` + `flows/` + `tools/` 의 machine SSOT 를 안 바꿔 drift-validator 가 fail. 또 agents/skills 가 미커밋 schema 4종을 참조해 skill-citation 18 stale. 본 결단 = 그 미완성분을 v8.14.4 위에 완성.

## 결정

### §1. 6-stage machine SSOT 완성

`analysis → discovery → spec → plan → test → implement` (planning→discovery 개칭 + plan 신설).
- `schemas/state.schema.json` — current_chain enum / stage_progress required + StageRecord / last_gate.stage / pending_revisit.target_stage 6-stage.
- `flows/sdlc-4stage-flow.json` (파일명 reuse) — stages 6 + revisit_edges 8 + gate #1~#4. `flows/planning.phase-flow.json`→`discovery.phase-flow.json` (git mv) + `flows/plan.phase-flow.json` 신설 (+ mermaid 각).
- `tools/drift-validator` CHAIN_STAGES + `tools/chain-driver` (stage-graph STAGES/gate map + state-store default + gate-eval + cli MANIFEST_STAGES + hooks-bridge trigger + work-unit STAGES + revisit-detect) 6-stage. chain-driver test 223/223 갱신.

### §2. plan stage hard gate = deferred (사용자 결단)

plan-agent = placeholder (skills 3종 placeholder). plan stage 는 chain flow 에 존재하나 **hard gate 는 deferred** — gate #1 discovery / #2 spec / #3 test / #4 implement 유지. plan hard gate 는 plan-agent 본격 구현 시 추가 (DEC-2026-05-21 §정책3 "Plan hard gate" 의 deferred 이행).

### §3. chain 번호 순차 재배치 (사용자 결단)

discovery=1 / spec=2 / plan=3 / test=4 / implement=5.

### §4. 산출물 파일명 + schema = 기존 reuse (사용자 결단 "이미 있는것 최대한 써라")

신규 schema 생성 0. discovery stage 산출물 = `planning-spec.json` (파일명 reuse / rename 시 PoC blast 큼). 입력 어댑터 산출 schema = 기존 재사용: figma→`figma-extract`, nl-md→`prompt-extract`(+`plan-doc-extract`), swagger→`swagger-extract`(+`openapi-extension`), business-intent→`intent-classification`. plan-spec schema = 기존 동등물 없음 + plan placeholder → defer (citation placeholder 문구).

### §5. skills/agents

3 rename (planning-*→discovery-decompose-use-cases / discovery-from-analysis-output / discovery-identify-business-intent) + 6 신설 placeholder (discovery-from-figma/nl-md/swagger + plan-architect-decisions/decompose-and-sequence/risk-and-nfr) + discovery-agent(planning-agent 흡수) + plan-agent placeholder. 18→0 stale citation 정합 (reuse schema + DEC-2026-05-21 등재 + rename dead-link 정리).

## STOP-3 hard gate

- ✅ drift state-flow consistency (6 enum = 6 flow stages) + chain-layout (5 chain stages / 0 missing)
- ✅ chain-driver 223/223 + drift-validator test 6-stage 갱신
- ✅ skill-citation 0 stale (reuse + DEC + rename 정리)
- ✅ workspace test green / version 3-way 9.0.0
- breaking = state.schema enum + skill command-surface rename → MAJOR

## Cross-link

- **Resolves / Amends**: DEC-2026-05-21-chain-discovery-plan-stage-도입 (설계 → machine SSOT 완성). feat/v4.1-hooks-carry-note 브랜치 미완성분 흡수.
- **Cross-link**: ADR-CHAIN-001 (이중 렌더링) / ADR-CHAIN-002 (gate) / DEC-2026-05-17-v4-multi-agent-paradigm-채택.
- **Carry**: plan-agent 본격 구현 (plan-* skill 3종 + plan-spec schema + plan hard gate) = v9.x+.

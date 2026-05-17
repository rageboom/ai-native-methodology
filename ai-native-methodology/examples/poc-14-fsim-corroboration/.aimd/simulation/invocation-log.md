# Simulation Invocation Log — poc-14-fsim-corroboration

> ★ ★ ★ 사용자 시점 element invocation 기록. plan: `.claude/plans/peaceful-dreaming-dragonfly.md`.
> 매 element fire 시 1 entry append. 종결 시 frequency matrix 합산 + non-use rationale 보완.

## Meta

- plugin_version: 8.3.0
- simulation_target: poc-14-fsim-corroboration
- start: 2026-05-18
- stack_signals_detected: [fastapi, sqlalchemy, pydantic, semgrep, sqlite, swagger, plan-doc]
- canonical_scenario: B (chain harness e2e)

## Legend

- **element_type**: skill / agent_dispatch / hook_fire / tool_invoke / gate_decision
- **trigger_source**: 사용자 발화 / 자동 의존 / orchestrate dispatch / hook matcher / SKILL.md description
- **result**: success / blocked / non-fire (조건 불충족) / skip (의도된 carry)

## Sequence

| # | timestamp (UTC) | stage | element_type | element_name | trigger_source | result | duration_ms | output_path |
|---|---|---|---|---|---|---|---|---|
| 1 | 2026-05-18T16:00:00Z | analysis | tool_invoke | chain-driver (init) | 사용자 시뮬레이션 entry — `node tools/chain-driver/src/cli.js init examples/poc-14-fsim-corroboration` | success | ~120 | .aimd/state.json (current_chain=analysis / blocked=false) |
| 2 | 2026-05-18T16:00:01Z | analysis | tool_invoke | chain-driver (state) | 본 시뮬레이션 자기 확인 | success | ~30 | (stdout) state JSON |

## 시나리오 분기 노트

- 본 PoC = 시나리오 B (chain harness e2e) 채택
- 외부 사용자 가정 — input/ 디렉토리에 docs/plan.md + swagger.yaml 모두 제공 (멀티소스)
- 자연어 발화 시뮬레이션 + hooks-bridge 권고 받아 skill 수행 패턴
- 모든 plugin element invocation 결정적 기록 의무

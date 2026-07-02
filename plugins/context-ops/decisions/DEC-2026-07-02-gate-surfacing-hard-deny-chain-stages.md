# DEC-2026-07-02 — gate 표면화 결정론 hard-deny #1~#5 확장 + Auto Mode 위조불가 위임 토큰

- **날짜**: 2026-07-02
- **상태**: 채택 (Accepted)
- **계보**: DEC-2026-06-25-gate-review-bypass-guard (Phase 2 실행) · DEC-2026-07-02-analysis-exit-gate-surfacing-hard-deny (gate #0 선행) 확장
- **토픽**: gate-deterministic-surfacing / chain-driver
- **Resolves**: F-DOGFOOD-019 후속 (#1~#5 + Auto Mode 구멍)

## Context

사용자 요구: (1) **go/stop/revisit 게이트는 어떤 오케스트레이션(Workflow 자동주행 포함)에서도 무조건 표출**, (2) **HTML 리뷰(plan-review-server)도 LLM 판단이 아니라 결정론으로 발동**.

v0.93.0(gate #0)까지의 상태 — 게이트 **판정**은 이미 결정론(gate-eval + state.blocked). 미완은 **표출·사람결정 provenance 결정론**: soft/clean 게이트의 전이 guard 가 `--user-decision` 플래그(LLM-writable = 위조가능)만 봤고, 리뷰 서버 spawn 은 스킬(LLM 지시문)이 수행. gate #0 만 위조불가 토큰 hard-deny 완성, #1~#5 는 코드 주석에 "Phase 2 hard-deny carry" 로 명시된 미완 영역.

핵심 제약: 유일한 위조불가 신호 = UserPromptSubmit `user_gate_token`(LLM 은 이 이벤트를 유발 불가). HTML 리뷰 마커(gate-review-passage.json)는 LLM-writable = speedbump(벽 ❌).

## Decision

1. **surfacing hard-deny #1~#5 확장** — `SURFACING_ENFORCED_STAGES = {analysis, discovery, spec, plan, test, implement}`. `cmdNext` 전이 guard 가 위조불가 `user_gate_token` 없으면 전진 거부(hold: pending_gate + blocked=`gate_not_surfaced` + exit 1). **FSM 전이 함수 내부 guard**(신규 상태/전이 도입 ❌ / gate #0 패턴·기존 stage-generic 배선 재사용).
2. **HTML 리뷰 결정론 spawn (Q2)** — discovery/spec/plan hold 시 chain-driver 가 plan-review-server 를 결정론 spawn(스킬 대신). 서버는 reference-lens(판정 무생성 / gate-eval 무오염 / spawn = 결정론 side-effect ≠ LLM inject). 비-TTY(CI/test) skip. 스킬 spawn 은 정상 흐름 상보(정상 흐름=스킬 spawn→토큰→hold 없음 / 우회 시=chain-driver backstop → 이중 spawn 없음).
3. **Auto Mode 위조불가 위임 토큰 (Q3)** — `--auto-mode` 플래그 단독(LLM-passable)은 우회 구멍. `user_auto_delegation_token`(UserPromptSubmit "전부 자동/알아서 진행" 류 발급)이 fresh 할 때만 auto-mode 전진 유효. 세션/체인 위임(per-gate 소비 ❌ / 체인 terminal clear).

## Alternatives (기각)

- **HTML 리뷰 마커를 전진 조건으로**: 마커가 LLM-writable = speedbump 이라 결정론 아님.
- **스킬 spawn 유지 + 마커 요구**: 위와 동일 약점.
- **`--auto-mode` 플래그 유지**: LLM-passable 구멍 잔존 → "무조건" 위배.

## Consequences

- 모든 stage 전이가 **위조불가 사람 결정 신호를 요구** = Workflow/LLM 자동주행이 사람 게이트를 우회 불가. STRONG-STOP 결정론 axis 정합(판정=gate-eval / 서버=reference-lens).
- **행동 변경**: 기존 `next --user-decision go` 흐름은 UserPromptSubmit 토큰 발급 필요. 테스트/PoC E2E 갱신(f-cha·gate-surfacing·gate-provenance).
- **§8.1 ≥2 PoC corroboration**: poc-18(Node/TS) + poc-19/20 E2E 로 hold→토큰→advance 실증.

---
description: chain harness 다음 stage 진입 — chain-driver 가 현재 게이트를 평가하고 다음 stage 로 전이한다 (사용자 명시 결단 entry point / ADR-CHAIN-005 D21')
argument-hint: "[go|stop] [auto] (생략 시 go)"
---

# /chain-next — chain 다음 단계 진입

현재 프로젝트의 chain harness 를 한 단계 전진시킨다. **ADR-CHAIN-005 D21' 정합** — LLM 은 stage skill 을 절대 auto-invoke 하지 않으며, 이 슬래시 명령이 **사용자 명시 결단 entry** 다. (driver 권고는 stderr only / LLM 컨텍스트 격리)

## 입력

- `$ARGUMENTS`: 게이트 결단 (`go` | `stop`). 비었으면 `go`.
- `$ARGUMENTS` 에 `auto` 가 포함되면(예: `go auto` / `auto`) `--auto-mode` 를 동봉한다 = 사용자 Auto Mode 명시 위임. 이 경우 intervention-log actor 가 `user_auto` 로 기록된다(검토 UX 미경유여도 정직 표기 / DEC-2026-06-25-gate-review-bypass-guard).

## 절차

1. `<project>` = 현재 작업 디렉토리 절대경로. `<project>/.ai-context/state.json` 이 없으면 init 이 먼저라고 안내하고 중단:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js init <project>
   ```
2. 게이트 평가 + stage 전이 (결정론 SSOT):
   ```
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js next <project> --user-decision <go|stop> [--auto-mode] --json
   ```
3. exit code 해석 (ADR-CHAIN-005 §7):
   - `0` = 게이트 통과 / 다음 stage 진입. 출력 JSON 의 `advanced_to` stage 를 확인하고, 그 stage 의 sub-agent 를 Task tool 로 dispatch 해 작업을 진행한다 (v4.0 multi-agent paradigm / main agent = orchestrator).
   - `1` = blocked-by-gate / `2` = invariant-violation — 출력 `summary.blocking[]` finding 을 사용자에게 보고하고 멈춘다. 해결 후 다시 `/chain-next`.
   - `3` = usage / state 없음 — init 안내.
   - `4` = state-corrupt — 사용자에게 보고.
4. 전이 결과(stage / gate decision / `summary.headline` / findings)를 사용자에게 평이하게 요약 보고한다.

## 주의

- 게이트 **판정의 SSOT 는 chain-driver(결정론)**. LLM 은 `summary` 문장만 다듬고 go/stop 판정 자체를 재해석하지 않는다 (gate-summary.js 레이어 1).
- stage 작업 자체는 해당 stage sub-agent 에 위임한다 — main agent 가 직접 산출물을 쓰지 않는다.
- 특정 stage 로 되돌리거나(revisit) 명시 진입하려면 `/chain-stage <name>` 를 쓴다.
- **검토 UX 경유 권장 (Phase 1 / advisory)**: `go` 는 원래 사람이 검토(`_base-invoke-go-stop-gate` / discovery·spec·plan 은 브라우저 검토)를 마친 뒤 내리는 결단이다. 검토 경유 증거(`gate-review-passage` 마커)가 없으면 chain-driver 가 stderr 로 1줄 advisory 를 띄우고 intervention-log 에 `actor=llm_assumed` 로 정직 기록한다(비차단). Auto Mode 위임이면 `auto` 인자로 `user_auto` 표기.
- **gate #0 (analysis exit) 은 표면화 hard (DEC-2026-07-02-analysis-exit-gate-surfacing-hard-deny)**: #1~#5 와 달리 #0 은 표면화(리뷰가 실제로 뜨는 것)가 **전진 전제조건**이다. 통과하는 #0 에서 토큰·auto 없이 `next --user-decision go` 를 하면 전진하지 않고 **hold** — 평이 리뷰를 렌더하고 `blocked=gate_not_surfaced` + exit 1 + stdout `awaiting_decision:true`. 이때 **리뷰를 사용자에게 제시**하고, 사용자가 직접 결단 프롬프트(`go`/`진행`/`stop`/`중단`/`revisit:<stage>` 또는 `/chain-next go`)를 **제출**하면 UserPromptSubmit 훅이 **위조불가 토큰(`user_gate_token`)** 을 발급한다(LLM 은 이 이벤트를 유발 불가 → 위조 불가). 그 뒤 `next --user-decision go` 를 실행하면 토큰을 소비하며 전진한다. **LLM 이 임의로 `--user-decision go` 를 넣어도 토큰이 없으면 전진하지 않는다.** Auto Mode 명시 위임(`auto`)이면 토큰 없이 전진(`user_auto`).

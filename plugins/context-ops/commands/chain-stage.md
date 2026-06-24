---
description: chain harness 특정 stage 로 진입/복귀(revisit) — 이미 종결한 stage 를 다시 열거나 명시 stage 로 진입 (사용자 명시 결단 entry / ADR-CHAIN-005 D21')
argument-hint: "<stage> (discovery|spec|plan|test|implement)"
---

# /chain-stage — 특정 stage 진입/복귀

사용자가 **명시한 stage** 로 chain 을 진입시키거나, 이미 종결한 stage 로 되돌린다(revisit). **ADR-CHAIN-005 D21' 정합** — 사용자 명시 결단 entry (LLM auto-invoke ❌).

## 입력

- `$ARGUMENTS`: 대상 stage 명 — `discovery` | `spec` | `plan` | `test` | `implement` (analysis 는 별도 진입). **필수**.

## 절차

1. `$ARGUMENTS` 가 비었거나 위 stage 집합에 없으면 사용 가능한 stage 목록을 보이고 중단.
2. `<project>` = 현재 작업 디렉토리 절대경로. `<project>/.ai-context/state.json` 이 없으면 init 안내 후 중단.
3. 현재 stage 확인:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js state <project> --json
   ```
4. 대상 stage 가 **현재보다 이전(종결 stage)** 이면 = revisit. backward 전이를 기록하며 진입:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js next <project> --user-decision revisit:<stage> --json
   ```
   - revisit 사유와 전이는 `intervention_log` 에 자동 기록된다.
   - 대상 stage 가 현재와 같거나 다음이면 `/chain-next` 로 forward 진입을 안내한다 (forward 게이트 우회 ❌).
5. 전이 성공 시 그 stage 의 sub-agent 를 Task tool 로 dispatch 해 작업을 진행한다 (v4.0 multi-agent paradigm).

## 주의

- revisit 은 backward 전이이므로 영향받는 **하위 stage 의 traceability matrix 가 yellow/red 로 재표시**될 수 있다 — 하위 stage 재실행 의무 (revisit-impact.js advisory).
- 게이트 판정의 SSOT 는 chain-driver. LLM 은 판정을 재해석하지 않는다.

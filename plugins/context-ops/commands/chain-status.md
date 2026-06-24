---
description: 현재 chain stage/scope/진행 상태를 조회 + (--setup-statusline) 하단바 상시 표시 1회 설정
argument-hint: "[--setup-statusline] (생략 시 현재 상태 조회)"
---

# /chain-status — 현재 chain 단계 인지

지금 어떤 chain stage(discovery/spec/plan/test/implement) 에 있는지, 어느 scope 인지, 막혀(blocked) 있는지를 보여준다. chain harness 진행 중 "지금 무슨 chain인지" 상시 파악용. **판정 SSOT = `.ai-context/state.json`(결정론)** — LLM 은 수치를 해석만 하고 재판정하지 않는다.

## 입력

- `$ARGUMENTS`: 비었으면 **현재 상태 조회**. `--setup-statusline` 이면 **statusLine 1회 설정**.

## 절차

### (기본) 현재 상태 조회

1. `<project>` = 현재 작업 디렉토리 절대경로.
2. 상태 조회 (결정론 SSOT):
   ```
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js state <project>
   ```
   - exit `3` (state.json 없음) = chain 미시작. `/chain-next` 또는 init 안내 후 중단.
3. 출력의 `current_scope` / `current_chain` / `current_phase` / `blocked` / `last_gate` / `pending_revisit` 를 사용자에게 평이하게 요약한다. 다중 scope 면 각 scope 의 chain 단계도 함께. **stage 번호 = gate#N (discovery 1 · spec 2 · plan 3 · test 4 · implement 5)** 로 환산해 "지금 spec(2/5)" 처럼 위치를 명시한다.

### (`--setup-statusline`) 하단바 상시 표시 설정

하단 상태줄(statusLine)에 `📍 spec 2/5 · BC-FOO` 가 **항상** 뜨도록 1회 설정한다. 플러그인은 statusLine 을 자동 주입할 수 없으므로(Claude Code 사양) 이 커맨드가 프로젝트 로컬 설정에 기입한다.

1. 설정 기입 (결정론 / `${CLAUDE_PLUGIN_ROOT}` 로 `${CLAUDE_PLUGIN_ROOT}/scripts/chain-statusline.js` 절대경로를 resolve 해 박는다):
   ```
   node ${CLAUDE_PLUGIN_ROOT}/scripts/chain-statusline-setup.js --project <project>
   ```
2. exit code 해석:
   - `0` = 기입/확인 완료. `.claude/settings.local.json`(로컬·gitignore) 에 `statusLine` 이 들어갔고 Claude Code 가 1~2초 내 자동 반영(재시작 불요). 하단바 확인을 안내.
   - `1` = 기존 statusLine 이 이미 있어 충돌. 사용자에게 알리고, 덮어쓸지 물어 동의 시 `--force` 동봉 재실행.
   - `3` = `${CLAUDE_PLUGIN_ROOT}` 미설정 — 슬래시 커맨드 컨텍스트에서 실행해야 함을 안내.

## 주의

- statusLine 스크립트(`${CLAUDE_PLUGIN_ROOT}/scripts/chain-statusline.js`)는 self-contained — stdin 의 cwd 에서 `.ai-context/state.json` 만 읽는다(비-gating display / reference-lens). chain 아닌 프로젝트에선 침묵(빈 출력).
- 상태/표시는 reference-lens 일 뿐 — gate 판정에 inject 하지 않는다(deterministic-axis).
- 단계를 전진/되돌리려면 `/chain-next` · `/chain-stage <name>`.

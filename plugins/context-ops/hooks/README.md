# hooks/ — chain harness mechanical enforcement

본 디렉토리 = Claude Code hooks 정의. plugin install 후 `hooks.json` 의 hook 이 자동 발동하여 chain harness mechanical gate trio (iii) + skill auto-invoke 차단을 enforcement.

## 파일

- `hooks.json` — UserPromptSubmit + PreToolUse + SessionStart 3 event hook 정의

## hook 3 종

### 1. SessionStart hook

```
trigger: Claude Code 세션 시작 시 1회
action:  echo "[ai-native-methodology] Plugin loaded. v2.0 chain harness ready..."
purpose: plugin user 에게 install 정상 작동 visible 메시지
```

### 2. UserPromptSubmit hook (chain harness skill auto-invoke 차단)

```
matcher: (planning|기획|spec|명세|behavior|test|테스트|implement|구현)
action:  node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js hooks-bridge
purpose: D21' 정합 — suppressOutput=true / stderr only / additionalContext 차단 문구
```

**D21'** — LLM 양심 의존 회피:

- chain-driver hooks-bridge 가 stderr 로 사용자에게 권고 표시 (예: "현재 chain 1 / planning skill 진입 권고")
- `suppressOutput: true` 설정 → LLM context 에 hook 출력 미주입 ("권고를 LLM 이 즉시 따르는 척" 차단)
- additionalContext 에 `"LLM SHALL NOT auto-invoke"` 차단 문구 동봉

### 3. PreToolUse hook (mechanical gate trio (iii) — Write/Edit 차단)

```
matcher: Write|Edit|NotebookEdit
action:  node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js hooks-bridge
purpose: state.blocked=true + .ai-context/base/** 대상 시 permissionDecision=deny / exit 2
```

**Mechanical gate trio**:

1. (i) **state.blocked 영속** (`.ai-context/state.json`) — chain-driver 가 finding 발견 시 자동 set
2. (ii) **cli exit 2** — `chain-driver next` 가 blocked 상태 시 exit 2 반환
3. (iii) **PreToolUse permissionDecision=deny** — 본 hook 이 Write/Edit 자체를 차단 (Auto Mode 도 사용자 'go' 거부 시 차단됨)

LLM "통과한 척 / RED 확인한 척 / impl 작성한 척" 시뮬레이션 모두 차단.

## 호출 cadence

| 시점                                              | hook             | chain-driver action            |
| ------------------------------------------------- | ---------------- | ------------------------------ |
| 세션 시작                                         | SessionStart     | "Plugin loaded" 안내 echo      |
| 사용자 prompt (planning/spec/test/implement 매칭) | UserPromptSubmit | suggest-skill 권고 (stderr)    |
| Write/Edit/NotebookEdit 시도                      | PreToolUse       | state.blocked 시 deny + exit 2 |

## chain-driver 와의 관계

본 hook 은 [`../tools/chain-driver/`](../tools/chain-driver/) 의 `cli.js hooks-bridge` 명령에 위임. chain-driver 6 module 중 `hooks-bridge.js` 가 본 hook 의 entry point.

```
hooks/hooks.json
  → tools/chain-driver/src/cli.js hooks-bridge
    → tools/chain-driver/src/hooks-bridge.js
      → state-store.js (state.blocked 조회)
      → gate-eval.js (gate 평가)
      → suggest-skill.js (다음 skill 권고)
```

## ${CLAUDE_PLUGIN_ROOT} 변수

- Claude Code 가 plugin install 시 자동 inject
- `~/.claude/plugins/context-ops/` 경로
- hook 안에서 도구 호출 시 사용 (절대경로 정합)

## 참조

- [`../tools/chain-driver/`](../tools/chain-driver/) — hooks-bridge 구현체
- [`../flows/sdlc-4stage-flow.json`](../flows/sdlc-4stage-flow.json) — chain harness master SSOT
- [`../schemas/state.schema.json`](../schemas/state.schema.json) — state 영속 schema
- [`../schemas/intervention-log.schema.json`](../schemas/intervention-log.schema.json) — 사용자 결단 로그 schema

## 인용

- `ADR-CHAIN-005` — chain harness 5 요소 enforcement / D21' suppressOutput / mechanical gate trio
- `DEC-2026-05-06-sub-plan-5-종결` — hooks.json 작성 (Senior F1 BLOCKER 흡수 / D21' 정합)

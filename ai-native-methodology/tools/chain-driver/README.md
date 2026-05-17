# chain-driver/ — ★ ★ ★ chain harness driver (5 요소 enforcement)

## Purpose

v2.0 chain harness 의 **driver / orchestrator** — `tools/chain-driver/` workspace 12번째 도구. ADR-CHAIN-005 5 요소 (driver / state 영속 / mechanical gate / skill auto-invoke / chain-revisit-detector) 모두 코드 enforcement 도달.

DEC-2026-05-06-sub-plan-5-종결 / sub-plan-6 chaos test (CAS race fix / 68 test 포함).

## When to call

| 시점 | command | 호출자 |
|---|---|---|
| 사용자 첫 chain harness 진입 | `chain-driver init <project>` | ★ user (cli 직접) |
| 다음 stage 진입 | `chain-driver next` | user / chain-driver hooks-bridge |
| 현재 state 조회 | `chain-driver state` | user (debug) |
| 다음 skill 권고 | `chain-driver suggest-skill` | hooks UserPromptSubmit (auto) |
| Write/Edit 시 차단 검증 | `chain-driver hooks-bridge` | hooks PreToolUse (auto) |
| state migration | `chain-driver migrate` | schema version mismatch 시 |
| chain-revisit 감지 | `chain-driver revisit-detect` | (보조 / git diff 기반) |

## Inputs

- `<project-dir>/.aimd/state.json` — chain harness state (★ schema/state.schema.json 정합)
- `<project-dir>/.aimd/output/**` — chain stage 산출물
- `<project-dir>/.aimd/intervention-log.jsonl` — 사용자 결단 로그
- `flows/sdlc-4stage-flow.json` — stage 순서 + 4 gate SSOT

## Outputs

- state.json 갱신 (atomic CAS write / Windows fallback / forward-only migration)
- intervention-log.jsonl append (single-writer 가정)
- stderr 권고 메시지 (suppressOutput=true / LLM context 미주입)

## Exit codes

> ★ 권위 = `src/cli.js` header (ADR-CHAIN-005 §7). 본 표는 cli.js 와 일치 의무.

| code | 의미 |
|---|---|
| 0 | ok / next stage 진입 가능 |
| **1** | ★ ★ blocked-by-gate — gate validator finding / state.blocked=true |
| **2** | invariant-violation (mechanical trio (ii)) |
| 3 | usage-error |
| 4 | state-corrupt |

## Sibling tools (gate validator 4종)

chain-driver `next` 진입 시 자동 호출:
- chain 1 → [`../planning-extraction-validator/`](../planning-extraction-validator/) (gate #1)
- chain 2 → [`../chain-coverage-validator/`](../chain-coverage-validator/) (gate #2)
- chain 3 → [`../spec-test-link-validator/`](../spec-test-link-validator/) (gate #3)
- chain 4 → [`../test-impl-pass-validator/`](../test-impl-pass-validator/) (gate #4)

## 5 요소 enforcement (★ ★ ★ ADR-CHAIN-005)

| 요소 | 구현 위치 |
|---|---|
| 1. Driver / Orchestrator | `src/cli.js` + 6 module |
| 2. State 영속 | `src/state-store.js` (atomic CAS / fdatasync / Windows fallback) |
| 3. Mechanical gate trio | `src/gate-eval.js` + cli exit 2 + `../../hooks/hooks.json` PreToolUse deny |
| 4. Skill auto-invoke (D21') | `src/hooks-bridge.js` (suppressOutput=true / additionalContext 차단 문구) |
| 5. Chain-revisit detector | `src/revisit-detect.js` (git diff --numstat + LOC threshold + revisit_ignore_globs) |

## Test (workspace developer 만)

```bash
npm test --workspace=tools/chain-driver       # 60 unit test + 8 chaos test = 68 pass
```

★ `test/` + `test/fixtures/` 디렉토리 = workspace only / dist 자동 제외 (build-plugin.js EXCLUDE).

## 참조

- ADR-CHAIN-005 — driver state machine + atomic write CAS + mechanical gate trio + D21' suppressOutput=true
- DEC-2026-05-06-sub-plan-5-종결 — driver workspace 12번째 + 5 요소 본격 구현 + Senior F1 BLOCKER (D21 retract → D21') 흡수
- DEC-2026-05-06-sub-plan-6-종결 §sp6-c8 — chaos test (CAS race detection + JSONL concurrency + interrupted mid-stage recovery)
- [`../../hooks/README.md`](../../hooks/README.md) — hooks 진입 + chain-driver 호출 cadence
- [`../../schemas/state.schema.json`](../../schemas/state.schema.json) — state 영속 schema
- [`../../flows/sdlc-4stage-flow.json`](../../flows/sdlc-4stage-flow.json) — stage 순서 + 4 gate SSOT

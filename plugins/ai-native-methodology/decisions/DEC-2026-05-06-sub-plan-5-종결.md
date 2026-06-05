# DEC-2026-05-06-sub-plan-5-종결

- 일자: 2026-05-06
- 카테고리: methodology / v2.0 sub-plan / chain harness driver ( harness 호칭 자격 확보)
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 ( sub-plan-5 종결 / chain-driver workspace 12번째 신설 / 5 요소 본격 구현 / harness 호칭 정식 자격 / unit test 198 / no release)
- 관련: ADR-CHAIN-005 ( 신설 / driver state machine + mechanical gate enforcement), DEC-2026-05-06-harness-호칭-엄밀화 ( 호칭 자격 trigger), DEC-2026-05-06-sub-plan-4-종결 (직전), master plan `~/.claude/plans/a-stateful-gadget.md` (γ hybrid Sprint M+5), sub-plan `~/.claude/plans/sub-plan-5-harness-driver.md` + research `~/.claude/plans/sub-plan-5-research.md` ( 4 에이전트 / Senior F1 BLOCKER + F2~F8 흡수)

## 컨텍스트

sub-plan-4 종결 commit 후속. DEC-2026-05-06-harness-호칭-엄밀화 audit 결과 harness **5 요소 모두 ❌** (driver / state / mechanical gate / skill auto-invoke / revisit-detector). 본 sub-plan-5 = 5 요소 본격 구현 + "chain harness scaffolding" → "chain harness" 정식 호칭 전환.

핵심 위험 ( no-simulation 정책 enforcement 누락) — LLM 이 "gate 통과한 척" / "RED 확인한 척" 가능 / skill markdown 양심 의존 / 코드 enforcement ❌. 본 sub-plan-5 = **양심 의존 → 코드 enforcement 전환**.

## 결정

sub-plan-5 종결. 5 요소 모두 코드 enforcement 도달.

### 산출물 (본 commit)

| 영역                                             | 신설                                                           | 갱신                                                                           |
| ------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `tools/chain-driver/`                            | workspace 12번째 (cli + 6 module + 7 test file)                | —                                                                              |
| `schemas/state.schema.json`                      | chain harness driver state SSOT                                | —                                                                              |
| `schemas/intervention-log.schema.json`           | JSONL append-only 로그 (8 event_type / actor enum)             | —                                                                              |
| `docs/adr/ADR-CHAIN-005-driver-state-machine.md` | 신설 (8 정책 / 인용 체인 / 결과 / 검증)                        | —                                                                              |
| `hooks/hooks.json`                               | UserPromptSubmit + PreToolUse hook ( D21' suppressOutput=true) | SessionStart 메시지 갱신                                                       |
| `flows/sdlc-4stage-flow.json`                    | —                                                              | `harness_status: scaffolding → harness-complete` + 5 요소 status 전부 complete |
| `package.json` (root)                            | —                                                              | workspace 11 → 12 + test:chain script 갱신                                     |
| 본 DEC                                           | 신설                                                           | —                                                                              |
| `decisions/STATUS.md`                            | —                                                              | sub-plan-5 종결 + harness 호칭 전환                                            |
| `decisions/INDEX.md`                             | —                                                              | DEC-2026-05-06-sub-plan-5-종결 등재                                            |
| `CLAUDE.md`                                      | —                                                              | " 본 방법론 가치 명세" footnote 1 sub-plan-5 ✅                                |

### 5 요소 구현 매핑

| #   | 요소                              | 구현                                                                                                                                                                                                                                                                                                     |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Driver / Orchestrator**         | `tools/chain-driver/src/cli.js` — 7 commands (init / state / next / suggest-skill / hooks-bridge / migrate / revisit-detect)                                                                                                                                                                             |
| 2   | **State 영속**                    | `tools/chain-driver/src/state-store.js` + `schemas/state.schema.json` — atomic write (tmp + fdatasync + rename) + CAS (version compare) + Windows fallback (copyFile + unlink) + lock (5분 stale auto-release) + forward-only migration registry                                                         |
| 3   | **Mechanical gate**               | `tools/chain-driver/src/gate-eval.js` + cli `cmdNext` — trio: (i) `state.blocked=true` 영속 / (ii) blocked 시 cli exit 2 + 동일 메시지 / (iii) `PreToolUse permissionDecision=deny` (`tools/chain-driver/src/hooks-bridge.js`). Auto Mode 도 critical/high 위반 시 user 'go' 거부 (`applyUserDecision`). |
| 4   | **자동 전이 (skill auto-invoke)** | `hooks/hooks.json` UserPromptSubmit + PreToolUse → `tools/chain-driver/src/cli.js hooks-bridge`. D21' 정합 — `suppressOutput=true` + stderr only + `additionalContext` "LLM SHALL NOT auto-invoke" 차단 문구 동봉. 사용자 명시 결단 (slash command 가정) 의무.                                           |
| 5   | **Chain-revisit detector**        | `tools/chain-driver/src/revisit-detect.js` — `git diff --numstat baseline..HEAD` + path-to-chain whitelist (9 pattern) + LOC threshold (≥ 5 non-comment) + `revisit_ignore_globs` 학습. upstream chain 만 후보.                                                                                          |

### Senior critique 흡수 (research §F)

- **F1 BLOCKER** ✅ — D21 retract → D21' (suppressOutput=true + additionalContext 차단 문구 + slash command 진입 한정)
- **F2 HIGH** ✅ — mechanical gate trio (state + cli exit 2 + PreToolUse deny)
- **F3 HIGH** ✅ — state.json CAS + version + Windows fallback + lock 5분 stale
- **F4 HIGH** ✅ — revisit-detect LOC threshold + ignore-globs (LOC < 5 자동 ignore)
- **F5 HIGH** ✅ — `state-store.migrate` + `MigrationRequiredError` (forward-only / 직전 1버전)
- **F6 MED** ✅ — `recoverTmpFiles` 자동 cleanup + `intervention-log.schema.json` 신설
- **F7 MED** ✅ — exit code matrix (0=ok / 1=blocked / 2=invariant / 3=usage / 4=corrupt) + `state --json` + `next --dry-run`
- **F8 MED** ⏳ — `current_phase` enum 은 schema pattern `^P\d+(\.\d+)*$` 로 부분 흡수, drift `--check-state-flow-consistency` 는 sub-plan-6 carry (sp5-c7 신설)
- **F9 LOW** ✅ — 7 module ≤ 250 LOC 가이드라인 (실측 모두 충족)
- **F10 LOW** ✅ — `test/hooks-contract.test.js` 5 case (UserPromptSubmit 트리거 / no trigger / empty stdin / bad JSON / PreToolUse pass-through)

### unit test 회귀 (198 / 12 workspace)

| 도구                          | 직전 (sub-plan-4) | 현재 (sub-plan-5)                                                                                                               |
| ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| drift-validator               | 44                | 44                                                                                                                              |
| decision-table-validator      | 11                | 11                                                                                                                              |
| formal-spec-link-validator    | 15                | 15                                                                                                                              |
| static-runner                 | 16                | 16                                                                                                                              |
| schema-validator              | 5                 | 5                                                                                                                               |
| planning-extraction-validator | 5                 | 5                                                                                                                               |
| chain-coverage-validator      | 6                 | 6                                                                                                                               |
| spec-test-link-validator      | 5                 | 5                                                                                                                               |
| traceability-matrix-builder   | 6                 | 6                                                                                                                               |
| test-impl-pass-validator      | 25                | 25                                                                                                                              |
| **chain-driver**              | —                 | **60** (state-store 9 / stage-graph 9 / invoke-skill 6 / gate-eval 10 / revisit-detect 10 / hooks-bridge 11 / hooks-contract 5) |
| **합계**                      | **138**           | **198**                                                                                                                         |

master plan §release 자격 80+ → 138 → **198 pass** (sub-plan-5 D24 162+ / Senior F10 165+ 모두 초과 충족 +33).

### chain harness 호칭 전환

| 시점                          | 호칭                      | 자격                                                                                                               |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| sub-plan-4 종결               | chain harness scaffolding | 사양 + validator + skills + flows + agents + schemas (부품)                                                        |
| ** sub-plan-5 종결 (본 DEC)** | **chain harness**         | **5 요소 모두 코드 enforcement 도달 (driver + state + mechanical trio + D21' skill auto-invoke + revisit-detect)** |
| sub-plan-6 종결               | chain harness validated   | + ≥ 2 PoC corroboration / §8.1 strict 7/7                                                                          |

### no-simulation 정책 강화

- LLM "gate 통과한 척" → trio (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse deny 로 봉쇄
- LLM "RED/GREEN 확인한 척" → gate-eval `tests_failed === 0` (test stage) / `tests_failed > 0` (impl stage) 자동 검사
- LLM "권고 skill 즉시 invoke" → D21' `suppressOutput=true` + additionalContext 차단 문구로 LLM 컨텍스트 격리

## 결과

### 긍정

- chain harness 정식 호칭 자격 확보 (5 요소 모두 코드 enforcement)
- LLM 양심 의존 → trio 차단으로 전환 완료
- Auto Mode 에서도 critical/high 위반 시 user 'go' 거부 (양심 우회 차단)
- state evolution policy 명문화 → v2.x 진입 안전
- exit code matrix → CI 통합 deterministic
- 198 unit test (138 → +60) — 도구당 회귀 안정

### 부정 / carry

| #              | 항목                                                                            | 시점                  |
| -------------- | ------------------------------------------------------------------------------- | --------------------- |
| sp5-c1         | tree-sitter semantic diff 기반 chain-revisit-detector 정확도 개선               | v2.x                  |
| sp5-c2         | 다중 사용자 driver state 동시성 (flock / DB)                                    | v2.x                  |
| sp5-c3         | hooks 의 진짜 LLM auto-invoke (D21 옵션 B)                                      | v2.x (사용자 결단 시) |
| sp5-c4         | intervention_log 분석 dashboard                                                 | sub-plan-6            |
| sp5-c5         | driver e2e cycle PoC #05 (1 BR + 1 UC + 1 TC + 1 IMPL)                          | sub-plan-6            |
| sp5-c6         | Auto Mode 차단 임계 분포 분석                                                   | sub-plan-6            |
| sp5-c7 ( 신설) | drift-validator `--check-state-flow-consistency` mode (current_phase enum lock) | sub-plan-6            |

### 다음 sub-plan-6

PoC #05 + PoC #03 retrofit / §8.1 strict 7/7 통과 / v2.0.0 release.

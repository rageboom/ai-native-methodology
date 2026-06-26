# DEC-2026-06-26-cold-start-enforcement

**cold-start 갭 메우기 — state.json 부재/손상 시 enforcement 공백 차단 (v0.82.0 MINOR / additive·enforcement / 결정론 axis 보존)**

**상태**: 승인·시행 (plugin.json 0.81.0 → 0.82.0)

## 맥락 (사용자 발화)

"analysis 도 안 된 페이지에서 플러그인만 깔고 작업 프롬프트를 넣으면 어떻게 되나?" — cold-start(설치 직후·미초기화) 동작을 산정해 갭을 메워달라.

## 진단 (전수 조사 / 실측)

`state.json` 은 `chain-driver init` **수동 실행으로만** 생성된다(어떤 hook/skill/command 도 자동 init ❌ / getting-started.md L131). init 전(=cold-start)까지:

- **SessionStart**: `!existsSync(state.json)` → HANDOFF 없으면 침묵 pass-through. 방법론 활성/미초기화 신호 0.
- **UserPromptSubmit**: `routeEntry(prompt)` 는 prompt 텍스트만 봄(state 무관) — work-intent 면 discovery advisory(비차단).
- **PreToolUse**: `readState`→`null` → `if (state){…}` 블록 **통째 skip** → `shouldBlockToolUse`/`coldStartSkipAheadReason`/branchGuard/base-deny **전부 미작동**.

### 갭의 본질 + 잠복버그
모든 결정론 deny 가 `if (state)` 뒤 → init 전 결정론 차단 0. 게다가 손상된 state.json 은 `readState` 가 `StateCorruptError` throw → `catch { state = null }` 로 뭉개져 **live 프로젝트의 enforcement 가 조용히 전부 꺼짐**(Senior STRONG-STOP #1). = `project_gate_review_bypass_guard` 와 동형("게이트가 선행 상태에 의존하면 그 상태 없을 때 silent off").

### over-block 제약
플러그인은 user-level 설치 가능 → 방법론 무관 임의 레포에서도 hook 이 돈다. "state 없으면 무조건 차단" = 모든 레포 파괴 → **opt-in 신호로 게이팅 필수**.

## 업계 정합 (4원칙 §2 / research 3-에이전트)

- **공식문서(docs-checker)**: SessionStart `additionalContext`(stdout) = 모델 직접 주입 ✅ / exit 0 stderr 미표출 / PreToolUse exit 2 **또는** JSON deny(둘 동시 ❌) / SessionStart 파일 write 는 공식 예시 존재하나 "keep fast".
- **업계사례(industry-case)**: pre-commit `--allow-missing-config`(설정 없으면 skip+exit 0) + Husky v9(`.husky/` 디렉토리 활성화) = **`.ai-context/` opt-in 직접 선례**. pre-commit custom fail-closed = "옛 레포 커밋 불가" 불만 = over-block 실증. Terraform fail-closed 는 "비가역 손상" 있을 때만 정당(우리는 해당 ❌).
- **Senior(verdict 수정 후 GO)**: opt-in `.ai-context/` 저위험 지지 / read-only pseudo-state > 자동 init(동의 없는 mutation = bypass 안티패턴) / D1 parity 일관 / **corrupt 4th mode 필수(STRONG-STOP)** / **≥2 PoC corroboration(§8.1)**.

## 결정 (4-mode 단일 리졸버)

`resolveEnforcementContext(root)` 신설(state-store.js) — `existsSync(state.json)` 먼저 봐 부재/손상 분리. SessionStart/PreToolUse 가 공유. **절대 throw ❌**(예기치 못한 IO 도 corrupt 흡수 / hook hot-path 안전).

| mode | 조건 | PreToolUse | SessionStart |
| --- | --- | --- | --- |
| `live` | state.json 정상 | 기존 전체(blocked/skip-ahead/branch/base) | 기존(drift/resume/graph) |
| `corrupt` | state.json 존재·읽기 실패 | **fail-closed** — `.ai-context/` write + MCP ticket-sync 차단 | 강한 복구 surface |
| `cold-start` | state.json 부재 + `.ai-context/` 존재 | **orphan chain 산출물만 차단**(read-only pseudoChain `discovery='pending'`) | 미초기화 surface + init 안내(D3a) |
| `absent` | `.ai-context/` 부재 | 무차단(현행) | 침묵(현행 / HANDOFF 만) |

- **opt-in 신호 = `.ai-context/` 존재**(analysis-input-collection `input.json` 생성). over-block 회피.
- **D1 parity**: cold-start 의 `coldStartSkipAheadReason` 는 init=`discovery:pending` 상태와 **동일 함수·동일 scope** → source 편집·discovery-spec(UC)·analysis 허용. 신규 차단 행위 도입 ❌.
- **corrupt fail-closed**(cold-start 보다 엄격): 손상 위에 산출물을 더 쌓지 못하게 + 기존 잠복버그(손상 silent off) 정정.
- **D3a 안내 강화 (자동 init ❌)**: SessionStart cold-start surface + discovery-from-nl-md step 0 가드 + common-errors Q2.1. 자동 init(SessionStart write)은 동의 없는 mutation + analysis 완료 시 manifest reconcile 필요 → **carry**.
- **결정론 axis 보존(STRONG-STOP)**: 파일 존재 + 파일명만 / pseudoChain=DEFAULT_STAGE_PROGRESS 합성 / LLM inject ❌ / read-only(파일 mutation 0). gate inject ❌(reference-lens·display-only).

## 시행

- `state-store.js`: `resolveEnforcementContext` 신설(export).
- `hooks-bridge.js`: `corruptStateBlockReason` 신설(export / `.ai-context` write + MCP ticket-sync fail-closed deny).
- `cli.js`: SessionStart 4-mode surface(absent/corrupt/cold-start/live) + PreToolUse 4-mode enforcement(`denyExit` 헬퍼로 corrupt/cold-start dedupe / live 내부 블록 무변경). import 2.
- `skills/discovery-from-nl-md/SKILL.md`: step 0 cold-start 가드.
- `guides/common-errors.md`: Q2.1 (4-mode 표 + init 해결).

## 검증 (STOP)

- 신규 `cold-start-enforcement.test.js` 19 (resolveEnforcementContext 4-mode + corruptStateBlockReason + SessionStart/PreToolUse E2E real subprocess) GREEN.
- 기존 fixture 1 정정(session-graph-freshness 숫자 version → 문자열 `'2.0'` — readState strict / live 분류).
- chain-driver **734/734** 회귀 0.
- **≥2 PoC live corroboration (§8.1)**: poc-16(Legacy Spring 4.1) + poc-18(Modern Express/Prisma/TS) — cold-start SessionStart 미초기화 surface / orphan(behavior-spec) write deny(exit 2) / source write allow(exit 0) / discovery-spec(UC) allow / corrupt `.ai-context` write deny(exit 2) 양 paradigm 동일 재현.
- release-readiness / version 3-way 0.82.0.

## carry (§8.1)

- **D3b 자동 init** — discovery 진입 시 자동 init + analysis 완료 시 manifest reconcile(stage_progress 복원). 동의 없는 mutation·복잡도 → 별도 DEC.
- corrupt 복구 UX(자동 백업/롤백) — 현재는 surface + 수동 복구.

## Relates

DEC-2026-06-18-discovery-universal-entry-router(routeEntry 모 / state-있는 discovery=pending hard-block) + project_gate_review_bypass_guard(선행상태 의존 silent off 동형) + DEC-2026-06-25-state-model-simplify(state schema 2.0) + feedback_chain_driver_deterministic_axis(STRONG-STOP) + feedback_quality_priority(§8.1) + feedback_diagnose_before_design_check_existing(기존 자산 실측).

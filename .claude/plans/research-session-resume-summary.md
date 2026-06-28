# research — 세션 시작 시 잔여작업 + 현재 스테이지 자동 요약 (§2)

> 4원칙 §2 에이전트 팀 토론. 공식문서(claude-code-guide) / 산업선례 / Senior 적대검토 3병렬. 2026-06-25.
> 짝 plan: `plan-session-resume-summary.md`

## 결론 한 줄

방향 타당 — **조각(state/manifest/statusline/handoff)은 다 있고 "세션 시작 시점 합성 표출" 한 조각만 비어있다.** Senior **REVISE 2건(실측 버그)+컷 1건** 반영하면 착수 가능. 핵심 설계 = SessionStart 훅(`cmdHooksBridge`)에 결정론 합성 1블록 추가 + **stderr(사용자 가시)+additionalContext(LLM 인지) 양 채널** / LLM 지시문·HANDOFF 파싱 ❌.

## A. 공식문서 (claude-code-guide / code.claude.com/docs/en/hooks.md / 2026-06-25 fetch)

SessionStart 훅 출력 의미론 — **이게 visibility 설계를 가른다:**

| 채널 | 가는 곳 | 사용자 가시 |
| --- | --- | --- |
| `hookSpecificOutput.additionalContext` (JSON) | **모델 컨텍스트만** (system reminder 로 첫 프롬프트 前 주입) | ❌ (LLM 이 렌더해야 보임) |
| stdout (non-JSON) | 모델 컨텍스트 (SessionStart 특례 — debug 아님) | ❌ |
| **stderr** | **사용자만** (모델 안 봄) | ✅ |
| `systemMessage` | 사용자 경고용 (요약 표출 의도 아님) | ✅(경고) |

- JSON 은 **exit 0 일 때만** 처리. non-zero = 차단 안 함 + stderr 만 표시.
- additionalContext **size limit 10,000 chars** (초과 시 파일로 빼고 path+preview 전달).
- **순수 세션 시작엔 assistant turn 이 없다** → additionalContext 는 "첫 응답에서 LLM 이 렌더"해야 사용자가 봄. 사용자에게 **턴 이전에 직접 표시하는 공식 배너 메커니즘은 없음** — 유일한 신뢰 경로 = **stderr**(혹은 LLM 첫 응답 렌더 관행).
- 권장: additionalContext(선언적 컨텍스트) + stderr(critical 한정) 분리. UX 는 assistant 렌더 관행으로.

→ **설계 함의**: 사용자가 "보여줘"라 했으므로 **stderr 가 1차 채널**(턴 무관 즉시 가시 / 이미 코드가 drift 경고에 동일 채널 사용 cli.js:1784). additionalContext 는 모델 인지용 병행. "첫 응답을 요약으로 시작하라" 강제 지시문은 불요(stderr 가 가시성 담당) → Senior 의 "LLM 응답 형태 게이팅" 우려와도 합치.

## B. 산업선례 (git / jujutsu / gh / VS Code — 1차 출처 fetch)

| 도구 | 표출 형태 | 교훈 |
| --- | --- | --- |
| **git status** (git-scm.com) | 헤더(branch+ahead/behind) → 분류 섹션(staged/unstaged/untracked) / 빈 섹션 생략 / `-s` 고밀도 | 매크로 위치 먼저, 미시 나중 |
| **jujutsu `jj st`/`jj log`** (jj-vcs.dev) | st=현재 스냅샷만 / log=히스토리(bounded revset, `~` elision) 분리 | "현재 위치+dirty" 1화면 / 히스토리는 별 명령 |
| **gh status/pr status** (cli.github.com) | 명명 섹션 3~4개 / 빈 섹션 suppress / item 당 ≤5필드 / PR body·diff 제외 | 섹션 bounded·조건부 렌더 |
| **VS Code restore** (#15949 200+ upvote) | 무음 복원(파일만) — 추상 파이프라인 위치엔 실패 = **우리가 메우는 갭** | 추상 상태는 명시 요약 필요 |

**설계 교훈 L1~L6 (plan §2-B 반영):**
- **L1** 매크로 위치(stage N/5) 헤더 1줄 먼저, 미시 디테일 나중.
- **L2** 빈 섹션 전체 생략 (blocked/revisit/task 없으면 그 줄 자체 없음). 신뢰 침식 회피.
- **L3** item cap + 히스토리는 2차 명령(`/chain-status`)으로. 시작 요약엔 최근/대기만.
- **L4** item 당 3~5 필드, 산문 ❌.
- **L5** 부재는 침묵 말고 명시 신호 (단, 우리는 "진행 chain 없음"=전체 침묵으로 처리 / 비-chain 프로젝트 안전).
- **L6** non-blocking + cache-local만 — **세션 시작에 원격 API·무거운 분석 ❌** → **Jira 미해결 티켓 조회는 scope-out**(state.json 결정론 read 만).

## C. Senior 적대검토 (코드 직독 / no-tool-sim) — **REVISE**

판정: **CONCERN(REVISE) — seam 옳음, 실측 버그 2, scope creep 1 컷.** seam(`cmdHooksBridge` SessionStart 분기)은 이미 reference-lens additionalContext 합성처(cli.js:1765-1777)·비-gating·state+root 보유 → 자연 확장. deterministic-axis 위반 없음(evaluateGate/cmdNext 경로 안 닿음).

**REVISE (전부 main 실측 재확인 완료):**

1. **stage→N/5 매핑은 공유 안 됨 — plan 전제 오류.** canonical `CHAIN_ORDER` 는 `scripts/chain-statusline.js:22` 에만(grep 확인). cli.js 는 import 안 함 + statusline 은 `SELF-CONTAINED 플러그인 의존 0`(line 7 / statusLine 실행에 `${CLAUDE_PLUGIN_ROOT}` 미보장)이라 워크스페이스 import 시키면 안 됨. 배열 리터럴 재기입 = **3번째 사본**(statusline + 신규 + chain-status.md:24 산문).
   - **정정(실측 보강)**: chain-statusline.js 는 `CHAIN_ORDER`/`renderStatusline`/`activeChain` 를 **이미 export** + `main()` 은 `import.meta.url` 가드(line 91 "test import 시 부작용 0"). → **cli.js 가 chain-statusline.js 에서 import** = 단일 소스 + statusline 불변식 보존(statusline 은 계속 0-import). 새 파일·test-pin 불요. (Senior 의 "새 chain-order.js 추출"보다 더 적은 변경 — 의존 방향: cli.js → leaf statusline 정상.)
2. **`completed` vs `complete` — off-by-status.** 실제 enum = `'complete'`/`'in_progress'`(state-store.js:292-293 실측 확인). "남은 단계"를 status 문자열 필터로 계산하면 전부 미완 오판 → **`CHAIN_ORDER.indexOf(current_chain)` 전방 slice** 로 산출.
3. **HANDOFF §3 파싱 — 하지 말고 가리켜라(컷).** SKILL 이 고정 6절 강제(§24) + §55·67 이 chain-stage 진행을 HANDOFF 에 중복 금지. 요약이 이미 stage 진행 표출하므로 §3 bullet echo = 그 중복 위반. bullet 마커·멀티라인·"(사용자 결단)" 인라인으로 파싱 fragile. 기존 handoffNudge(cli.js:1719-1721)가 이미 "HANDOFF 읽고 §3 부터" 지시 → **§3 파싱 제거, nudge 유지**.
4. **노이즈/과주입(real).** SessionStart 이미 ≤4줄 적재(handoff+drift+unbaselined+graph). 멀티필드 요약+"첫 응답을 요약으로" 지시문 = 벽 텍스트 + handoffNudge 와 경쟁. → **컴팩트 블록 + 지시문 제거**(statusline 이 위치 상시 표출 / 강제 지시 = LLM 응답 형태 게이팅 경계).
5. **§8.1/과설계**: display-only — 격상·schema·gate 변경 0 → ≥2 PoC corroboration **불요**. 단 (1) 공유 import + 순수 helper 단위테스트 + (touch 시) statusline 테스트 회귀는 의무.

권고: **minimal-viable** — (1)(2) 필수, (3)·지시문 컷. 단일 reference-lens 블록.

## 합성 — plan 반영 사항

1. seam = `cmdHooksBridge` SessionStart 분기(cli.js:1714~). 신규 순수 helper `buildSessionResumeSummary(state)` → `tools/chain-driver/src/session-resume.js`(테스트 가능 분리).
2. `CHAIN_ORDER`+`renderStatusline` 를 chain-statusline.js 에서 import (단일 소스 / 새 사본 ❌).
3. 남은 단계 = `CHAIN_ORDER.slice(idx+1)` (status 필터 ❌). analysis(idx<0)·idle = 헤더만/null.
4. 대기 줄 = blocked/pending_revisit/current_task **있을 때만**(L2 빈 줄 suppress).
5. 양 채널: stderr(사용자 가시 / cli.js:1784 패턴) + additionalContext prepend(모델 인지). **LLM 지시문 ❌ / HANDOFF 파싱 ❌ / Jira 조회 ❌(L6)**.
6. 활성 chain 없으면 전체 침묵(비-chain·fresh 프로젝트 안전 / L2).

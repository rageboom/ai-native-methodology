# plan — 세션 시작 시 잔여작업 + 현재 스테이지 자동 요약

> 토픽: Claude Code 세션 최초 시작 시 "지금 어느 chain stage(N/5)·어느 scope·남은 단계·대기 항목"을 요약해 사용자에게 표출.
> 상태: **구현 완료 / release-ready 43-43 / 커밋·PR 대기(사용자 요청 시)** / 2026-06-25 / MIS-428 [OP-SESSION-001] / worktree `MIS-428`(smilegate main `d795e012`=v0.79.0 기준 / 타깃 v0.80.0)
> §2 research: `research-session-resume-summary.md` — 단, **stderr 가시성 전제는 재논의에서 오류로 판명·교정**(§9 Lessons Learned).

---

## 1. 배경 — 사용자 의도

> "세션 최초 시작할 때 잔여 작업 내역을 보여주고 현재 어떤 스테이지인지 섬머라이즈."

분해:
- "세션 최초 시작" → **SessionStart 훅** 시점.
- "현재 어떤 스테이지" → chain stage 위치 (discovery1/spec2/plan3/test4/implement5 · scope · blocked).
- "잔여 작업 내역" → **남은 chain 단계** + **대기 항목**(blocked / pending_revisit / current_task).

## 2. 실측 — 무엇이 이미 있고 무엇이 비었나

### 2-1. 조각은 다 있다 (재발명 ❌)

| 자산 | 무엇 | 세션 시작 자동 표출? |
| --- | --- | --- |
| `cmdHooksBridge` SessionStart 분기 (cli.js:1714~1797) | additionalContext 합성(handoff nudge / drift / unbaselined / graph) | ⭕ 훅 있음 / ❌ stage·잔여작업 미표출 |
| `getActiveScopeChain` (cli.js / state-store) | current_scope/chain/blocked/last_gate/revisit/task 유도 | ❌ `state` 명령에서만 |
| `/chain-status` | 위를 평이 요약 + N/5 환산 | ❌ **수동 슬래시 명령** |
| statusLine (chain-statusline.js) | `📍 spec 2/5 · BC-FOO` 한 줄 **상시** | ⭕ 상시 / ❌ "잔여 작업" 아님 |
| session-handoff (SKILL) | HANDOFF.md 6절 전략 컨텍스트 | ❌ 존재 nudge 만 |

**결론: "stage는 statusLine이 상시 답하고 있고, '잔여 단계+대기'를 세션 시작 시점에 합성 표출"하는 한 조각만 비었다.**

### 2-2. 실측 확인된 코드 사실 (착수 전 직접 재확인)

- `CHAIN_ORDER=['discovery','spec','plan','test','implement']` = **chain-statusline.js:22 단독 + 이미 export**. `renderStatusline`/`activeChain` 도 export(순수 / `import.meta.url` 가드로 import 부작용 0).
- stage status enum = **`'complete'`/`'in_progress'`** (state-store.js:292-293) — `'completed'` ❌. → 남은 단계는 status 필터가 아니라 **`CHAIN_ORDER.indexOf(current_chain)` 전방 slice** 로 계산.
- `getActiveScopeChain(state)` → `{current_chain, stage_progress, last_gate, current_task, scoped, scope}`.

### 2-3. ★ 채널 사실 — 재논의에서 교정 (공식문서 직접 fetch / 2026-06-25)

| 채널 (SessionStart, exit 0) | 실제 동작 |
| --- | --- |
| **stderr** | exit 0 = debug 로그行. **사용자 트랜스크립트 미표출.** "stderr to user"는 exit 2(또는 `--verbose`) 한정. → **plan 초안의 "stderr=1차 가시 채널" = 거짓 전제.** |
| `hookSpecificOutput.additionalContext` | system reminder로 **모델 컨텍스트** 주입 / chat 메시지로 표출 ❌. **Anthropic이 세션 상태 컨텍스트의 권장 패턴으로 명시** → 어시스턴트가 첫 응답에서 렌더. |
| `systemMessage` (top-level) | 사용자 표출되나 정의가 "**Warning** message" + **시각 렌더 미명세**(라벨/색/멀티라인 불확정) → 중립 요약을 경고로 오해 위험. **폐기.** |
| plain stdout | SessionStart 특례로 모델 컨텍스트行 (사용자 배너 ❌). |

## 3. 목표 상태 (Option B — 확정)

- **현재 stage** = statusLine(`📍 spec 2/5 · BC-FOO`)이 블랭크 화면부터 **상시** 담당(기존). 신규 작업 아님.
- **잔여 단계 + 대기 항목**(비었던 조각) = `additionalContext` 에 컴팩트 블록 prepend → 어시스턴트가 첫 응답에서 중립 톤 렌더. 활성 chain 없으면 전체 침묵(비-chain·fresh 안전).
- **stderr write 제거** — SessionStart exit 0에서 죽은 코드(drift/unbaselined 포함). drift/unbaselined는 이미 additionalContext에 있음 → 죽은 stderr만 제거.

컴팩트 블록(additionalContext 내 / 어시스턴트가 렌더):

```
🧭 세션 재개 — spec 2/5 · BC-FOO
   남은 단계: plan → test → implement
   대기: ⛔ blocked: <reason> · ↩ revisit: <stage> · 🔖 task: OP-X(branch)
```

- 1줄 헤더 = `renderStatusline(state)` 재사용(blocked `⛔` prefix / analysis `📍 analysis` / idle 표출 안 함).
- "남은 단계" = `CHAIN_ORDER.slice(idx+1)` (analysis·idx<0 = 줄 생략).
- "대기" = blocked/pending_revisit/current_task **있는 것만**(빈 항목 suppress / L2·L4).
- 산문·히스토리·Jira ❌(L3/L6). 깊은 조회는 기존 `/chain-status`.

핵심 원칙: **결정론 합성(LLM 재판정 ❌) / reference-lens(어떤 gate 도 inject ❌, deterministic-axis) / display-only / LLM 하드 지시문 ❌(기존 handoffNudge 수준 소프트).**

## 4. 변경 범위 (파일별)

| 파일 | 변경 | 비고 |
| --- | --- | --- |
| `tools/chain-driver/src/session-resume.js` | **신규** — 순수 `buildSessionResumeSummary(state)`. `CHAIN_ORDER`/`renderStatusline` 를 `../../../scripts/chain-statusline.js` 에서 import | 테스트 가능 분리 / 단일 소스 |
| `tools/chain-driver/src/cli.js` | SessionStart 분기(1765~1782)에 resume 블록 additionalContext prepend. **drift/unbaselined stderr write(1784-1796) 제거**. import 추가 | seam + dead-code 정리 |
| `tools/chain-driver/test/session-resume.test.js` | **신규** — 활성/analysis/idle/null/blocked/revisit/task 케이스 단위테스트 | 의무 |
| `scripts/release-readiness.js` / 러너 test | criteria count coupling 갱신(memory `release_readiness_count_coupling`) + full `test:release` | count 결합 |
| `commands/chain-status.md` (선택) | "세션 시작 시 자동 요약도 함께 뜬다" 한 줄 | 문서 정합 |
| 문서 | 신규 DEC(session-resume-summary) + INDEX + CHANGELOG(MINOR) + CLAUDE.md "현재 vX" 한 줄 + version bump 3-way | release 직전 |

**statusline·state-store 본문 무변경** — import 만(self-contained 불변식 보존 / 새 사본·test-pin 불요).

## 5. 리스크 (§2 Senior + 재논의 반영)

| # | 항목 | 위험 | 처리 |
| --- | --- | --- | --- |
| 1 | ~~stage→N/5 3번째 사본~~ | drift | **소멸** — chain-statusline.js export import(단일 소스) |
| 2 | ~~status 필터 off-by-one~~ | 전부 미완 오판 | **소멸** — `indexOf` 전방 slice(`'complete'` enum 실측) |
| 3 | HANDOFF §3 파싱 fragile + SKILL 중복금지 위반 | M | **컷** — 파싱 ❌ / 기존 nudge 유지 |
| 4 | 세션시작 노이즈 과주입 | M | 컴팩트 블록 + 빈 항목 suppress + LLM 하드 지시문 ❌ |
| 5 | gate inject 누수 | — | 비-risk(as-designed) — helper 를 next/gate 경로에서 격리. reference-lens 주석 명시 |
| 6 | 세션시작 지연 | L | state.json 로컬 read 만 / 원격·무거운 분석 ❌(L6) |
| 7 | **stderr 가시성 전제 오류** | **H** | **교정** — stderr 폐기 / additionalContext+첫응답 렌더(공식문서 권장) / systemMessage 도 폐기(warning 톤·렌더 미명세) |

## 6. 단계 분해 (slice)

- **S1** 신규 `session-resume.js` — 순수 helper(import CHAIN_ORDER/renderStatusline) + 단위테스트.
- **S2** cli.js SessionStart 배선 — resume 블록 additionalContext prepend + **dead stderr 제거** + import.
- **S3** count coupling — release-readiness/test 러너 criteria 갱신 + full `test:release` GREEN.
- **S4** 문서 — chain-status.md 한 줄 + DEC + INDEX + CHANGELOG(MINOR) + CLAUDE.md "현재 vX" + version bump 3-way + `version:check`.
- **S5** release — clean tree 확인 + build:diff-check. (커밋/PR/머지/배포는 사용자 요청 시.)

## 7. 티켓 / 브랜치 / 워크트리 (확정·완료)

- MIS 카스케이드: MIS-365 → MIS-366([Tech Debt] mis-plugins) → **MIS-428 [OP-SESSION-001]** 생성·할당 완료(2026-06-25).
- 브랜치명 = **MIS-428**(티켓 키 단독). **smilegate main(`379cbf5c`) 기준** worktree `.claude/worktrees/MIS-428` 생성·진입 완료. (local==smilegate==rageboom 0/0 정렬 확인 후 분기 — stale-ref 함정 회피.)

## 8. 결정 현황

- **D1 방향** ✅ 사용자 지정(세션 시작 잔여작업+stage 요약).
- **D2 채널** ✅ **Option B 확정**(2026-06-25) — additionalContext + 어시스턴트 첫 응답 렌더 / systemMessage·stderr 폐기 / LLM 하드 지시문 ❌. (재논의에서 stderr 전제 오류 교정 후 확정.)
- **D3 내용** ✅ 남은 chain 단계 + 대기항목(blocked/revisit/task) / HANDOFF §3·Jira ❌.
- **D4 §2 research** ✅ (stderr 사실은 §9 교정).
- **D5 티켓/워크트리** ✅ MIS-428 + smilegate-main worktree 완료.

## 9. Lessons Learned

- **§2 적대검토의 사실 오류를 재논의가 잡아냈다 (2번째 self-기록 사실 교정).** plan 초안 + research 모두 "stderr = 유일 사용자 가시 채널(cli.js:1784 선례)"로 전제했으나, 공식문서 직접 fetch 결과 **SessionStart exit 0 stderr는 사용자 미표출**(exit 2/`--verbose` 한정). 선례로 인용한 cli.js:1784 drift-stderr 자체가 깨진 코드였음(=latent bug). 교훈: `feedback_self_recorded_fact_validation` + `feedback_research_fact_validation` — §2 sub-agent 결론도 1차 문서 재fetch 없이 액면 수용 ❌. (1번째 교정 = stage 매핑 공유 가정.)
- **statusLine 재프레이밍이 설계를 단순화했다.** "현재 stage"는 이미 statusLine이 상시 담당 → 신규 작업은 "잔여 작업"만. systemMessage warning-톤 리스크를 떠안을 필요 없이 additionalContext로 충분.
- **작업 중 main 이 v0.79.0(discovery 2-게이트)으로 진행됐고, 분기 전이 아닌 작업 도중 `git fetch` 가 충돌을 잡았다.** 워크트리는 v0.78.0(`379cbf5c`) 기준이었는데 외부에서 v0.79.0 머지 → 타깃이 v0.79.0 충돌 위험. 미커밋 변경이 v0.79.0 변경분(plan-review-server/discovery-validator)과 파일 0 중첩이라 stash→ff(`d795e012`)→pop 으로 무충돌 rebase, 타깃 v0.80.0 으로 정정. 교훈: `repo_remotes_smilegate_canonical` + `state_model_simplify`("push/merge 전 git fetch") — **버전 bump 직전 한 번 더 fetch**. (이번엔 bump 전 CLAUDE.md 자동 변경 알림이 1차 신호였음.)

## 10. Carry

- LLM 첫 응답 렌더형 포맷(richer) — 현 컴팩트 블록으로 충분하면 불요.
- HANDOFF §3 "다음 작업" 표면화 강화 — 현 nudge(LLM 읽기 지시)로 충분 / 파싱은 SKILL 중복금지로 영구 컷.
- systemMessage 1줄(블랭크 화면 즉시 표출)이 필요하다는 후속 요구 발생 시 재검토 — 단 warning 톤·렌더 미명세 trade-off 명시.

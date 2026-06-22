# plan — branch-per-task git hygiene (context-ops 플러그인)

> 상태: **설계 확정 / 승인 대기** (4원칙 §3 — 코드 착수 전 사용자 승인 필수)
> 작성: 2026-06-19 / 트리거: 사용자 "티켓 생성 후 작업 시 전용 브랜치" → 플러그인 기능화
> 모델: **Sub-task별 브랜치 + Sub-task별 PR(N개) + PR 연결 가시화** (2026-06-19 사용자 최종 결정)
> 관련 메모리: `feedback_chain_driver_deterministic_axis`(STRONG-STOP) · `feedback_quality_priority`(§8.1) · `project_pre_deployment_stage`(단독 dogfooder)

---

## 1. 목적 / 배경

티켓 기반 작업 시 **전용 브랜치를 따고, 잘못된 브랜치에서의 소스 작성을 플러그인이 결정론적으로 차단(보장)**, 작업 완료 시 **Sub-task별 PR 을 만들되 그 PR 이 어떤 Story·티켓에 연결됐는지 사용자가 한눈에 보게** 한다. 현재 플러그인은 git read + `.gitignore` scaffold(`adopter-git-hygiene` / DEC-2026-06-08)만 함 — 본 기능은 그 위에 **branch+PR 위생 axis** 를 얹는다.

핵심 사용자 의도(대화 확정):
- 티켓 먼저 → 브랜치 (티켓 없이 작업 ❌)
- 브랜치·PR = **Sub-task(TASK-\*) 단위**(N개) — task 는 독립 설계
- 각 PR 은 **어느 Story 소속 + 관련 티켓**을 가시화
- 강제 = **하드차단(보장)**
- 브랜치/티켓 식별자 = **무조건 실제 Jira 키와 일치 / slug 없음 / fix 도 type-prefix 반영**

---

## 2. 확정 결정

| # | 결정 | 근거 |
|---|---|---|
| 1 | 하드차단 PreToolUse 훅 = **deny-only**(git 미접촉) | 사용자 "보장" / makeGitRunner read-only 보존 |
| 2 | **Sub-task별 브랜치 + Sub-task별 PR(N개)** | 사용자 최종 (delivery 단위 = Sub-task) |
| 3 | 브랜치 생성·PR 생성 = 명시 명령(`enter-task`/`finish-task`) + confirm | lazy-자동/LLM 추측 = 결정론 오염 |
| 4 | git mutation(`checkout -b`/`gh pr create`) = 명령 안에서만 (훅 ❌) | STRONG-STOP 정합 |
| 5 | 스코프 가드 5-AND + opt-out | self-dev 오차단 방지 |
| 6 | 브랜치 = `<type-prefix>/<Jira 키>` (slug 없음) / prefix·키 = Jira SSOT | "무조건 jira 일치 / fix 도" |
| 7 | **PR body = linkage block 자동 생성**(Story/Epic/형제/의존/AC) | 사용자 "연결 가시화" |
| 8 | 게이트 = current_task **additive** (null→scope-wide 보존 / set→task-scoped) | 회귀 차단 + Sub-task-PR 필요조건 |

---

## 3. 설계

### 3.1 전체 흐름 (예: scope=`reservation`, 독립 task 4개)

```
[plan / chain 3]  ticket-sync → Jira Sub-task 4개 생성 + 키 기록
                  (ticket-sync-evidence.ticket_cascade.{epics,stories,subtasks}[].{task_id,jira_id})
        │  (Jira 키·issue type = 브랜치 prerequisite)
        ▼
[test/implement / chain 4~5]  task별 (의존성 순):
  enter-task TASK-RES-001 → feature/DWPD-1473 (RED→GREEN) → finish-task → PR #1 + linkage
  enter-task TASK-RES-002 → feature/DWPD-1474 (RED→GREEN) → finish-task → PR #2 + linkage
  enter-task TASK-RES-003 → feature/DWPD-1475 (RED→GREEN) → finish-task → PR #3 + linkage
  enter-task TASK-RES-004 → feature/DWPD-1476 (RED→GREEN) → finish-task → PR #4 + linkage

각 PR = 독립(off main / 독립 task) · scope 전체 GREEN = 전 PR 머지 후 main CI(체인 밖) 또는 옵션 최종 점검
```

### 3.2 결정론 / LLM / 사람 경계 (STRONG-STOP 정합)

| 레이어 | 담당 |
|---|---|
| **결정론(도구)** | ① deny-only 훅(exit2, git 미접촉) ② Jira 키·type lookup ③ git preflight(exit-code) ④ 브랜치명/linkage block 생성(멱등) |
| **LLM** | 코드 작성만 |
| **사람(confirm)** | git mutation(`checkout -b`/`gh pr create`)은 명시 명령 + confirm |

### 3.3 `enter-task <TASK-id>` (브랜치 생성 / git mutation locus)

```
1. state read — current_scope 일치 + stage ∈ {test, implement}
2. Jira 키·issue type lookup — ticket-sync-evidence 에서 task_id==<TASK-id> → jira_id (+ issue type)
   ⛔ 없으면 exit 3 + "ticket-sync(plan) 먼저 실행" (무조건 jira 정합)
3. type-prefix 도출 (config issuetype_map 역방향): 버그→bugfix / 그외→feature / [opt] hotfix
   브랜치명 = <type-prefix>/<JIRA-KEY 대문자>  (slug 없음)
4. git preflight (mutation helper / exit-code 게이팅 / no-simulation):
   - rev-parse --verify -q HEAD     → unborn 정직 skip + carry
   - symbolic-ref -q HEAD           → detached 면 confirm 에 base sha 고지
   - rev-parse --verify -q refs/heads/<name>
       존재 & 그 브랜치 위 → no-op(멱등) / 다른 브랜치 → checkout <name>(전환, -b·-B ❌) / 부재 → confirm → checkout -b
5. scope_states[scope].current_task = <TASK-id> + branch 기록
6. state write + evidence emit
```

### 3.4 PreToolUse 브랜치 가드 (hooks-bridge / deny-only)

`Write|Edit|NotebookEdit` 기존 진입점 재사용. **5-AND 전부 참**일 때만 deny:
1. `.ai-context/state.json` 존재  2. `current_scope != null`  3. 활성 stage ∈ {test, implement}  4. `isSourcePath()`(source-ext.js)  5. write 경로 ∈ current_scope source_root 하위

참 + (`current_task == null` **또는** 현재 git 브랜치 ≠ current_task 기대 브랜치) → **deny(exit2)** + `"enter-task <TASK-id> 먼저"`. git 미접촉.
opt-out `CONTEXT_OPS_BRANCH_GUARD=0`. self-dev/plugin 자동면제(state 부재 + `plugins/context-ops/**` source_root 미포함 = 이중).

### 3.5 `finish-task <TASK-id>` (PR 생성 + 연결 가시화 / git mutation locus)

```
1. 해당 task GREEN 확인(test-impl-pass / task-scoped)
2. linkage block 결정론 생성 (§3.7)
3. confirm (preview MD) → PR 생성:
   gh 사용가능 → gh pr create --base main --head <branch> --title "<KEY> <title>" --body <linkage>
   gh 부재     → linkage block + 브랜치명 출력 → 사용자 수동 생성 (graceful / MCP-missing 패턴 동질)
4. PR URL 을 traceability/evidence 에 기록
```

### 3.6 브랜치 네이밍 = `<type-prefix>/<Jira 키>` (slug 없음)
- type-prefix = 대상 Jira 티켓 issue type 결정론 도출 (버그→`bugfix/` / 그외→`feature/` / [opt] `hotfix/` / config `issuetype_map` 역방향 / LLM 추측 ❌).
- 키·type 모두 **Jira SSOT**. 예: `feature/DWPD-1473` · `bugfix/DWPD-1599`. TASK-\* 단독 fallback ❌.
- **bug-flow 주의**: Bug 은 cascade 비대상(Sub-task 미분해) → fix 브랜치는 Bug 티켓 키 직접. v1 = prefix 도출까지 / bug 전용 진입 흐름 deferred(§4).

### 3.7 PR 연결 가시화 (linkage block — 결정론 생성)

각 Sub-task PR body 에 자동 삽입. 출처 = `task-plan.tasks[].{story_ref, epic_ref, dependencies, ac_refs}` + `ticket-sync-evidence`(TASK→Jira / Story→Jira / Epic→Jira) + traceability-matrix.

```markdown
## 🔗 연결 (Jira / 자동 생성 · 수동 편집 금지)
- 이 PR: DWPD-1474 — 예약 검증 (layer: be)
- Story: DWPD-1450 — 예약 기능
- Epic:  DWPD-1400 — 예약 모듈
- 형제 Sub-task (같은 Story): DWPD-1473 / DWPD-1475 / DWPD-1476
- 의존: depends-on DWPD-1473
- AC: AC-RES-003, AC-RES-004
```
+ 브랜치명에 Jira 키 → **Jira Development 패널 자동연동**(branch/PR 표시, Story·Epic 부모는 Jira 가 이미 보여줌). = 이중 가시화.

### 3.8 엔진 (current_task = additive)
- `state.schema.json $defs.ScopeChainState` 에 `current_task`(optional) 추가 (`additionalProperties:false` → schema 편집 의무).
- **current_task == null → 기존 scope-wide 동작 byte-identical** (기존 examples/poc-\* 무영향 = 회귀 차단).
- set → **task-scoped 게이트**(이 task 의 test 만 RED/GREEN 판정). cmdNext stage 전이 골격 무변경.
- scope 전체 GREEN = 전 task PR 머지 후 main CI(체인 밖) / 옵션 `scope-verify` 최종 점검 deferred.

---

## 4. 1차 scope 한정 (§8.1 과적합 회피)

| 포함 (v1) | 제외 (deferred) |
|---|---|
| 독립(dependencies 없는) task | 의존 task 의 **stacked PR**(base=의존 task 브랜치 / DAG 결정론) |
| `enter-task`(브랜치) + deny-only 가드 | bug 전용 진입 흐름(Bug 티켓 직접 / Sub-task 미분해) |
| `finish-task`(PR + linkage / gh-or-manual) | `scope-verify` 최종 scope-wide 재점검 |
| current_task additive + task-scoped 게이트 | type-prefix 에 hotfix 등 확장 |
| 브랜치 `<feature\|bugfix>/<Jira 키>` | |

**본체 격상 조건**: ≥2 PoC dogfood(legacy Spring + modern Node) 검증 후. (task-scoped 게이트 = 신규 경로 / additive 라 기존 PoC 안전하나 새 경로는 검증 의무)

---

## 5. 파일 변경 목록 (실측 검증 완료 / line 확인)

- `schemas/state.schema.json` — `$defs.ScopeChainState.current_task` 추가 (additive / L198, additionalProperties:false 확인)
- `tools/chain-driver/src/state-store.js` — current_task helper (`getActiveScopeChain` L281 인근)
- `tools/chain-driver/src/cli.js` — `enter-task` + `finish-task` 명령 신설 / PreToolUse 분기 branch-guard
- `tools/chain-driver/src/hooks-bridge.js` — 5-AND `branchGuardReason` (`shouldBlockToolUse` L424 인근 / isSourcePath 재사용)
- `tools/_shared/code-pointer-git.js` — git **mutation helper 분리** 신설 (read-only `makeGitRunner` L16 오염 회피)
- `tools/.../linkage-builder` (또는 finish-task 내) — linkage block 결정론 생성
- `tools/_shared/source-ext.js` — `isSourcePath`(L19) 재사용 (변경 ❌)
- `hooks/hooks.json` — 기존 PreToolUse 진입점 재사용 (신규 entry 불요 예상)
- `scripts/release-readiness.js` + `test.js` — check 추가 시 count 동시 갱신 + full `test:release` (count_coupling)
- `decisions/` + `docs/adr/` — DEC + ADR-CHAIN(branch/PR axis ⊥ gate axis)
- `CHANGELOG.md` + `.claude-plugin/plugin.json` — 버전 lockstep (MINOR)

---

## 6. 테스트 계획
- `enter-task`: Jira 키/type 있음·없음(거부) / 브랜치 신규·기존·detached·unborn / 멱등 / dirty carry / prefix 도출(feature·bugfix)
- `finish-task`: linkage block 정확성(Story/Epic/형제/의존/AC) / gh 있음(생성)·없음(출력 graceful) / GREEN 미달 시 거부
- 가드: 5-AND 각 false→allow / 전부 true+wrong branch→deny / self-dev 면제 / opt-out
- additive: current_task null 시 기존 fixture byte-identical green

---

## 7. 리스크 / 완화

| 리스크 | sev | 완화 |
|---|---|---|
| 첫 git mutation 결정론 axis 오염 | high | mutation = enter/finish-task 명령만 / 훅 deny-only |
| checkout 실패 6모드 | high | §3.3 preflight 결정론 분기 / -B 금지 |
| **task-scoped 게이트 = 신규 경로 회귀** | high | **additive**(null→scope-wide 보존 = 기존 PoC 안전) + 새 경로 PoC 검증 의무 |
| self-dev 오차단 | med | 5-AND 이중 면제 + opt-out |
| PR 생성 host 의존(gh) | med | gh 부재 시 linkage 출력 graceful(수동) |
| 의존 task PR base | — | v1 독립 task 한정 (stacked PR deferred) |

---

## 8. DEC 초안 (`decisions/DEC-2026-06-19-branch-per-task-git-hygiene.md`)

1. **DEC**: 게이트 = current_task **additive**. null → scope-wide(stage-major) byte-identical 보존(기존 PoC 회귀 차단). set → **task-scoped**(이 task test 만). scope 전체 GREEN = 전 PR 머지 후 main CI(체인 밖).
2. **DEC**: 차단 훅 = deny-only(git 미접촉). `checkout -b`·`gh pr create` = 명시 명령(`enter-task`/`finish-task`) + confirm. (STRONG-STOP / makeGitRunner read-only 보존)
3. **DEC**: current_task = 사람이 `enter-task` 명시 set (LLM 추측 ❌).
4. **DEC**: 스코프 가드 = 5-AND + opt-out `CONTEXT_OPS_BRANCH_GUARD=0`.
5. **DEC**: 브랜치 = `<type-prefix>/<Jira 키>` (slug 없음). type-prefix = Jira issue type 결정론 도출(버그→bugfix/그외→feature / config). 키·type Jira SSOT. ticket-sync(plan) 선행 — 키 부재 시 거부.
6. **DEC**: delivery 단위 = **Sub-task** → Sub-task별 브랜치 + Sub-task별 PR(N개). 각 PR body = **linkage block 자동 생성**(Story/Epic/형제 Sub-task/의존/AC) + Jira Development 패널 이중 가시화.
7. **DEC**: v1 = 독립 task / gh-or-manual PR. 의존 task stacked PR · bug 전용 흐름 · scope-verify · hotfix prefix = deferred. ≥2 PoC 후 격상.

---

## 9. 승인 요청 (4원칙 §3)
1. 확정 설계 §3 (Sub-task별 브랜치+PR / deny-only 훅 / enter·finish-task / linkage block / current_task additive / Jira type-prefix)
2. v1 scope 한정 §4
3. DEC 7항 §8

---

## 10. Lessons Learned
- 모델이 hybrid(통합 1PR) → Sub-task별 N PR 로 전환됨 — Sub-task-PR 은 **task-scoped 게이트 필요**(hybrid 가 피했던 부분). additive 로 기존 PoC 보호, 새 경로 PoC 검증.
- "근본 양립곤란" 주장은 과했음 — 독립 task + (통합 또는 main CI)로 해소. senior 단정도 검증 대상.
- 사용자 결정 vs 측정 사실 충돌 시 리서치가 교정(#3·#4 보정 선례). 사용자 결정 우선이되 비용·리스크 정직 고지.

---

## 11. 현재 진행 상태 / RESUME (2026-06-19 / 다음 세션)

> ✅ **완료 (v0.65.0 / 2026-06-19)**: coupled 코어 전부 시행 + 5-lens 적대검증 하드닝(blocker 레거시 xml 가드 / high stuck→clear-task / stage게이트 / repo-membership) + DEC/CHANGELOG/INDEX/README/CLAUDE.md/version lockstep. chain-driver 632→664 GREEN · test:release 27/27 · 회귀 0. **미커밋(working tree)** — 다음 = 커밋(self-dev / main 직접). 잔여 carry = DEC §6(GREEN floor force-ack / transient-git fail-open / PR-fail exit seam / source_root #5) + ≥2 PoC(legacy Spring+modern Node) 본체 격상. 아래는 구현 당시 RESUME 맵(역사).


> 방법론 자체 변경 = **티켓·브랜치 없이 main 직접 작업**(사용자 확인 / self-dev = 가드 면제 근거). working tree **미커밋**.

### 완료 (foundational / additive / `node --check` + schema valid 통과 / 회귀 0 기대)
- `tools/_shared/git-branch.js` (신설) — `gitAvailable`/`currentBranch`/`isUnborn`/`branchExists`/`createBranch`/`switchBranch`. no-simulation graceful null. 현재 브랜치 = `symbolic-ref -q HEAD`(plain / --short ❌).
- `schemas/state.schema.json` — `$defs.CurrentTask` + `ScopeChainState.properties.current_task`(optional / null=scope-wide).
- `tools/chain-driver/src/hooks-bridge.js` — `branchGuardReason({toolName,toolInput,activeChain,currentBranch})` export (detectSourceFileWrite 재사용 / current_task 없으면 null=allow).
- `tools/chain-driver/src/state-store.js` — `setCurrentTask`/`clearCurrentTask` (getActiveScopeChain 뒤).
- `tools/chain-driver/src/cli.js` — parseArgs `--task` → `out.task`.

### 잔여 coupled 코어 (resume 시 cli.js **fresh read 선행** — 세션 중 stale 경고 있었음)
0. **선행**: `npm test`(chain-driver) 로 additive 5조각 green base 확인.
1. **cli.js import** — `'./hooks-bridge.js'` import 블록(끝 ~L95)에 `branchGuardReason` 추가 + 신규 `import { currentBranch, gitAvailable, isUnborn, branchExists, createBranch, switchBranch } from '../../_shared/git-branch.js'`.
2. **cli.js `cmdHooksBridge` PreToolUse 가드 배선** — skipReason 블록 닫힘(~L1795) 뒤, `if(state)` 닫힘(다음 `}` / M2 conformance 주석 직전) 전에: `const ac=getActiveScopeChain(state); if(ac?.current_task){ const cur=currentBranch(makeGitRunner(root)); const r=branchGuardReason({toolName:payload.tool_name,toolInput:payload.tool_input,activeChain:ac,currentBranch:cur}); if(r){ buildBlockOutput({reason:r,sessionId:payload.session_id,hookEventName:event}) stdout + stderr + process.exit(2) }}` (skipReason 출력 패턴 미러 / git query 는 current_task 있을 때만 = latency·scope-wide 무영향).
3. **`cmdEnterTask(args)`** — `taskId=args.task||args.project`; `scope=args.scope||state.current_scope`; stage∈{test,implement} 확인; **Jira 키 lookup**: `evidenceDirForRead(root)` 의 `ticket-sync-plan-*.json` 최신 → `ticket_cascade.subtasks[]` 에서 `task_id===taskId → jira_id` (없으면 `exit 3` "ticket-sync(plan) 먼저"); type-prefix(Sub-task→`feature/` / config 확장 추후); `branch=feature/<jira_id>`; git preflight(`gitAvailable`→`isUnborn`(carry)→detached(`currentBranch`null→confirm)→`branchExists`: 현재면 no-op·다른브랜치면 `switchBranch`·부재면 confirm→`createBranch`); `writeStateCAS(root, s=>setCurrentTask(s,scope,{task_id,branch,jira_key,entered_at}))`.
4. **`cmdFinishTask(args)` + linkage-builder** — task GREEN 확인; **linkage block**: `baseFileForRead(root,'task-plan.json')`.tasks[id].{story_ref,epic_ref,dependencies,ac_refs} + evidence(Story/Epic→jira) → §3.7 마크다운; confirm → PR(`gh pr create --base main --head <branch> --title "<KEY> <title>" --body <linkage>` / gh 부재 시 linkage+branch 출력 graceful); `clearCurrentTask`.
5. **dispatch** switch(~L3504) — `case 'enter-task': return cmdEnterTask(args);` / `case 'finish-task': return cmdFinishTask(args);` (+ help 텍스트).
6. 테스트(enter/finish/guard/additive-null green) + **release-readiness count 결합**(criteria_total/expected-ids/pass-count + full `test:release`) + DEC 파일(`decisions/DEC-2026-06-19-branch-per-task-git-hygiene.md` / §8 7항) + CHANGELOG + `plugin.json` 버전(MINOR) lockstep.
7. **adversarial 검증 workflow** (가드 bypass/false-block / additive 회귀 / det-axis 위반 / 테스트 실행).

### 패턴 참조 (실측)
- state mutate: `writeStateCAS(root, (s)=>{ ... s.scope_states[scope] ... })` (cmdNext L586/L606).
- git: `const git = makeGitRunner(root)` (L2312 등 5곳).
- exit2 차단: `buildBlockOutput(...)` + `process.exit(2)` (cmdHooksBridge skipReason 패턴).
- 평이 경계: deny-only 훅(git 미접촉) / mutation 은 enter·finish-task 명령 + confirm (STRONG-STOP).

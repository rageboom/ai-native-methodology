# DEC-2026-06-19-branch-per-task-git-hygiene

**Sub-task별 브랜치 + Sub-task별 PR(N개) + PR 연결(linkage) 가시화 git-hygiene** / v0.65.0 MINOR / additive·deny-only.

- **상태**: 채택·시행 (v0.65.0). 승인 = 4원칙 §3 일괄 결정(plan §8 7항 전부 + §9 승인 요청). v1 scope 한정(§7) / ≥2 PoC 후 본체 격상.
- **유형**: 운영 결정(DEC) — chain gate paradigm 무변(ADR 아님). 첫 git mutation 도구이나 STRONG-STOP 경계 준수(결정론 axis 무오염).
- **plan SSOT**: `.claude/plans/plan-branch-per-ticket.md` (§3 설계 / §8 DEC / §11 RESUME).
- **관련**: `feedback_chain_driver_deterministic_axis`(STRONG-STOP) · `feedback_quality_priority`(§8.1) · `DEC-2026-05-26-ticket-plan-단일`(ticket cascade SSOT).

## 1. 문제 / 배경

티켓 기반 작업 시 (a) 전용 브랜치를 따고 (b) **잘못된 브랜치에서의 소스 작성을 플러그인이 결정론적으로 차단**하며 (c) 작업 완료 시 **Sub-task별 PR이 어떤 Story·Epic·형제·의존·AC에 연결됐는지 한눈에 보이게** 하는 git 위생 고리가 미배선. 사용자 최종 결정(2026-06-19) = **Sub-task별 브랜치 + Sub-task별 PR(N개) + PR 연결 가시화**(통합 1PR hybrid → N PR 로 선회).

## 2. trust 제약 (절대 / 설계 준수)

- **C1 — 첫 git mutation, 결정론 axis 무오염**: `checkout -b`·`gh pr create` 등 mutation 은 **오직 `enter-task`/`finish-task` 명시 명령 + `--confirm`** 에서만. PreToolUse 가드는 **deny-only(git 미접촉 = 판정만)**. `makeGitRunner` read-only 호출처 보존(mutation 은 `_shared/git-branch.js` 별 파일로 분리).
- **C2 — additive (회귀 0)**: `current_task == null`(부재) = scope-wide(stage-major) **기존 동작 byte-identical** 보존. 가드는 `branchGuardReason` 가 current_task 없으면 즉시 null=allow. 기존 examples/poc-* 무영향(657/657 green / 회귀 0).
- **C3 — LLM inject ❌**: 가드 판정·브랜치명·linkage block 모두 결정론(state + isSourcePath + 브랜치 비교 + Jira lookup). LLM 은 코드 작성만. (feedback_chain_driver_deterministic_axis STRONG-STOP)
- **C4 — no-simulation 정직 한계**: git 부재/detached/unborn = graceful(가드는 fail-open allow / enter-task 는 exit 3 carry). gh 부재 = linkage 출력 graceful(수동 PR). 날조 ❌.

## 3. 결정 (plan §8 7항)

1. **DEC**: 게이트 = `current_task` **additive**. null → scope-wide byte-identical 보존(기존 PoC 회귀 차단). set → task-major 모드. scope 전체 GREEN = 전 PR 머지 후 main CI(체인 밖).
2. **DEC**: 차단 훅 = deny-only(git 미접촉). `checkout -b`·`gh pr create` = 명시 명령(`enter-task`/`finish-task`) + `--confirm`. (STRONG-STOP / makeGitRunner read-only 보존)
3. **DEC**: current_task = 사람이 `enter-task` 명시 set (LLM 추측 ❌).
4. **DEC**: 스코프 가드 = current_task(task-major) + 소스 write + 브랜치 불일치 AND + opt-out `CONTEXT_OPS_BRANCH_GUARD=0`. self-dev 면제(state 부재 + plugins/context-ops/** source_root 미포함 이중).
5. **DEC**: 브랜치 = `<type-prefix>/<Jira 키>`(slug 없음). type-prefix = Jira issue type 결정론 도출(버그/결함/defect→`bugfix` / 그외→`feature`). 키·type Jira SSOT. ticket-sync(plan) 선행 — 키 부재 시 `enter-task` 거부(exit 3).
6. **DEC**: delivery 단위 = **Sub-task** → Sub-task별 브랜치 + Sub-task별 PR(N개). 각 PR body = **linkage block 자동 생성**(이 PR/Story/Epic/형제 Sub-task/의존/AC) + 브랜치명 Jira 키로 Jira Development 패널 이중 가시화.
7. **DEC**: v1 = 독립 task / gh-or-manual PR. 의존 task stacked PR · bug 전용 진입 흐름 · scope-verify · hotfix prefix = deferred. ≥2 PoC(legacy Spring + modern Node) 후 본체 격상.

## 4. 시행 (구현)

- **`_shared/git-branch.js` 신설** — `gitAvailable`/`currentBranch`(symbolic-ref -q HEAD plain / --short ❌ detached 비결정성 회피)/`isUnborn`/`branchExists`/`createBranch`/`switchBranch`(MUTATION) + `deriveBranchPrefix`(type→prefix 순수). no-simulation graceful null/false.
- **`schemas/state.schema.json`** — `$defs.CurrentTask`(task_id/branch/jira_key/entered_at) + `ScopeChainState.current_task`(optional / null=scope-wide). additionalProperties:false 정합.
- **`state-store.js`** — `setCurrentTask`/`clearCurrentTask`(CAS 뮤테이터 안 / scope_states 부재 시 no-op).
- **`hooks-bridge.js`** — `branchGuardReason({toolName,toolInput,activeChain,currentBranch})`(detectSourceFileWrite 재사용 / current_task 없으면 null=allow).
- **`cli.js`** — PreToolUse 가드 배선(current_task 있을 때만 git query = hot-path 보호 / repo-membership 게이트 / opt-out) + `enter-task`(Jira lookup → preflight 6모드[noop/switch/create/detached/unborn/git부재] → setCurrentTask) + `finish-task`(GREEN 확인 → linkage → gh-or-manual PR → clearCurrentTask) + `clear-task`(current_task 해제 = stuck 탈출구 / git 미접촉) + dispatch + help.
- **`linkage-builder.js` 신설** — `buildLinkageBlock`(task-plan.tasks[id] + ticket-sync-evidence → Story/Epic/형제/의존/AC 순수 합성 / 부분 evidence graceful).
- **가드 source 범위** — `_shared/source-ext.js` `isGuardedSourcePath`(GUARD_SOURCE_EXTS = 코드 + SQL/template/build/config = `.xml`·`.sql`·`.jsp`·`.gradle`·`.properties`·`.yml` 등) — Gap B 의 SOURCE_EXTS(codegraph 정렬)와 별 세트(불침범). 가드는 더 넓게 본다(레거시 mapper xml·SQL 커버).
- **테스트** — `test/branch-per-task.test.js` 32개(순수 4종 + enter/finish/clear CLI + 실 git temp repo 6모드 + PreToolUse 가드 deny/allow/stage-gate/xml/external/opt-out). 664/664 green.

## 5. 적대 검증 하드닝 (5-lens / plan §11 step 7)

구현 직후 5개 독립 적대 lens(bypass/false-block/regression/det-axis/honesty)로 깨기 시도 → 실 결함 14건. **회귀 lens=0**(additive byte-identical 견고) · **det-axis·deny-only·결정론 위반 0**(STRONG-STOP 유지). 다음을 즉시 수정:

- **(blocker) 확장자 화이트리스트 우회** — 가드가 `.ts/.java` 만 보고 본 방법론 PRIMARY 타깃(Spring/iBATIS)의 SQL mapper `.xml`·`.sql`·`.jsp` 를 못 봐 잘못된 브랜치에서 무가드 통과 → `isGuardedSourcePath`(별 세트) 신설로 가드 범위 확장. (실 CLI E2E: `.java`=deny vs `.xml`=allow 였음 → 둘 다 deny 로 수정)
- **(high) current_task stuck** — implement 미-GREEN(task 포기·revisit) 시 finish-task(exit 1)가 current_task 를 못 지워 가드 영구 stuck → `clear-task` 명령 신설(git 미접촉 / GREEN 무관 탈출구).
- **(medium) stage 게이트 부재** — 가드가 current_chain 무관 발동 → revisit 로 spec/plan 복귀 시 stale current_task 가 그 stage 소스 작업 오차단 → 가드에 `current_chain∈{test,implement}` 게이트 추가(plan §3.4 #3 정합).
- **(medium) repo-membership 미검사** — file_path 가 repo 외부여도 deny → 가드 배선에 repo-root 하위 containment 게이트 추가(외부/scratch 오차단 방지).
- **(low) NotebookEdit notebook_path 미독해 + `.ai-context` substring 과대제외** — detectSourceFileWrite 경로 추출에 notebook_path 추가 + 세그먼트 경계 매칭으로 수정.

## 6. v1 한계 정직 고지 (≥2 PoC 격상 전 carry)

- **GREEN 판정 = scope implement-GREEN floor (per-task TC 게이트 deferred)**: §8 결정 1·plan §3.8 의 "set → task-scoped(이 task test 만)" 는 cmdNext stage 전이 골격 무변경 제약 하에서 v1 미시행. `finish-task` 의 GREEN 확인 = 활성 scope 의 `stage_progress.implement.status==='complete' && gate_decision==='go'`(결정론 실측 state 만 / no-simulation). 결과: v1 은 scope 가 implement-GREEN 도달 후 각 task PR 을 carve 한다. **"GREEN" 은 implement gate=go 를 뜻하며 force-ack(`next --user-decision go` without `--findings`)로도 충족 가능 = 실 test-pass 보장 아님**(실 test-pass 는 gate 입력 `--findings` 가 보증). per-task TC 단위 게이트 = ≥2 PoC 격상 작업에 포함.
- **가드 fail-open 범위**: currentBranch 가 detached/unborn/git부재뿐 아니라 **transient git 오류(index.lock 경합·timeout 등)**도 null→allow(침묵 통과). 의도된 fail-open(작업 비차단)이나 문서보다 표면이 넓음 = 정직 고지.
- **PR 실패 exit-code seam**: gh 설치됐으나 `gh pr create` 실패(원격 부재 등) 시 graceful 출력 + current_task clear + exit 0 — 성공/실패가 같은 exit code(PR 은 체인 밖). 메시지는 정직(`pr_created:false` 기록 / 날조 ❌)이나 자동 caller 가 exit code 로 PR 미생성 구분 불가 = carry.
- **source_root(#5) 미구현**: plan §3.4 #5(write 경로 ∈ source_root)는 state 에 source_root 필드 부재로 미시행 — repo-root containment 로 대체(외부 경로 차단). 정밀 scope-source 한정은 carry.
- **gh 실 PR 생성** = dogfood/사용자 환경 라이브 검증(테스트는 command 구성 + 원격 부재 graceful 만 — 실 PR 미생성).
- **본체 격상 조건**: ≥2 PoC dogfood(legacy Spring + modern Node). additive 라 기존 PoC 안전하나 task-major 새 경로는 PoC 검증 의무.

## 7. §8.1 단일 PoC 과적합 회피

- 기능 = additive(null→scope-wide 보존) + deny-only(git 미접촉) → 기존 동작/PoC 무회귀. 가드·linkage·preflight 는 결정론(LLM·시뮬 0). release-readiness 신규 check 미추가(기존 check11 workspace-test 가 신규 32 test 자동 게이팅 / count=42 불변). v1 scope 한정 + ≥2 PoC 격상 게이트로 단일-도메인 과적합 차단. 적대 검증 5-lens(§5)가 단일-도메인 구현의 가드 사각(레거시 .xml/.sql)·lifecycle stuck 을 출하 전 노출·수정.

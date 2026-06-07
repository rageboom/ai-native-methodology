# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:

- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [0.10.0] — 2026-06-07 MINOR — living-sync Phase 2c: reconcile 결단 보조(carry-A) + relocation source-locator(carry-B′) + findRelocation 실 git 버그 fix

Phase 2b reconcile 가 **propose-only 로 surface 한 것을 사람이 결단·실행**할 수 있게 마감(같은 라인). 전부 **순수 reporting 강화**(mutation 0 / propose-only 패러다임 불변). 4원칙(plan `plan-living-sync-phase2c.md` 1원칙 + **Senior 적대 step-0 pass[REVISE@0.83] 전건 코드 사실검증** + 사용자 승인[low-risk carry]).

- **carry-A — content_drift flag 결단 보조** (`lift-anchor.js` `ceilingOptionsForAnchor`): content_drift flag 에 **재전파 천장 후보**(그 anchor 의 backward 조상) 동봉. **★ Senior #1 수정 + 실측 반영**: anchor 자신 제외(IMPL=forward-leaf=`lift --ceiling IMPL`=빈 큐 no-op 실측) + 정직 prose — `--ceiling <상위>` = 하류 TASK/TC **재생성**(손수정 코드는 closure 제외 / 실측 `forward(AC-USER-001)=[AC,TASK,TC,IMPL]`·IMPL 제외) vs 재앵커 = 코드 canonical 결단 시 source 재합성. naive 명령 동봉은 clarity 회귀라 필터·라벨 필수.
- **carry-B′ — relocation source-locator** (`lift-anchor.js` `relocationSourceHint`): relocation 관측사실 후보에 **durable 수정 위치** 동봉 — graph 는 **파생물**(IMPL code_pointers ← impl-spec `modules[].source_files` / graph-synthesizer.js:231-242)이라 graph 직접 수정 = 다음 resync clobber → source 산출물 위치 제시(IMPL→`impl-spec.json modules[id].source_files` / TC→`test-spec.json test_cases[id].source_file` / multi-source = Senior #2 실측). **write ❌(B′ / propose-only 유지)**.
- **★ findRelocation 실 git 버그 fix** (`_shared/code-pointer-git.js`): pathspec `-- <oldpath>` 제거 — HEAD 에 부재한 old path 로 pathspec 제한 시 실 git 이 committed rename 을 못 짚음(`git log -M --diff-filter=R -- old.ts` = 빈 결과 실측 / variant A 무-pathspec = `R100 old→new`). 파싱이 이미 `m[1]===path` 로 source 필터 → pathspec 제거가 정합. **구버전은 fake gitRunner 로만 검증돼 잠복**(cpv A3 relocation 도 실 git 미작동이었음) → **Phase 2c 가 실 git mv fixture 로 노출·수정**(no-simulation 가치). cpv fake 갱신(`renameFrom` 키잉) + chain-driver 실 git mv 테스트.
- **★ Senior 적대검토(REVISE@0.83) 전건 사실검증 후 반영**: #1 IMPL=forward-leaf → anchor-self 제외+재생성 대상=하류 TC(실측 forward) · #2 TC 도 test-spec source_file derive(multi-source / graph-synthesizer.js:524-531) · **#4 (B) durable source-write reject** = multi-source·commit_hash staleness·path-coordinate·propose-only 패러다임 이탈 = 사용자 "low-risk" 의도 배치 → **(B′) propose 정밀화 채택**(no-op 아님 = 정확 source 위치) · #5 신규 관찰가능 동작 = MINOR(PATCH 과소표기).
- **검증(no-sim 실 git / §8.1)**: `test/lift-anchor.test.js` +7(순수 helper 5: relocationSourceHint IMPL/TC/generic + ceilingOptionsForAnchor self-제외·미존재 / carry e2e 2: poc-05 carry-A ceiling_options·self-제외 + tmp-git git mv carry-B′ source_edit·그래프 byte-identical) = **39**. chain-driver **426/426**(419+7) · code-pointer-validator **45/45**(fake 갱신·findRelocation fix back-compat) · 3-way 0.10.0.
- **carry**: durable source-write(--apply / multi-source+commit_hash+path-base+atomic = 별도 MINOR) · Phase 3 merge-back · Phase 4 per-item granularity. SSOT = DEC §12 + plan.

## [0.9.0] — 2026-06-07 MINOR — living-sync Phase 2b: `lift --reconcile` 손수정 코드 ↔ anchor 관측사실 git 신선도 (propose-only)

Phase 2(`lift`)의 **전파 절반**(코드→천장→forward)에 이어 **reconcile 절반**: 손수정된 코드가 anchor 노드의 **관측사실**(code_pointer path/commit_hash)과 아직 맞는지 git 으로 재탐지 → 어긋나면 **propose**(자동 덮어쓰기 절대 ❌). `lift --reconcile [--base <sha>] [--repo-root <dir>]` 플래그. 4원칙(plan `plan-living-sync-phase2b.md` 1원칙 + **Senior 적대 step-0 pass[REVISE@0.82] 전건 코드 사실검증** + 사용자 승인[코드 착수 / lift 스토리 완성]).

- **신규 공용 프리미티브 `tools/_shared/code-pointer-git.js`**: `makeGitRunner`·`detectContentDrift`·`findRelocation` 를 code-pointer-validator 에서 추출(DRY 단일 출처 / chain-driver lift 와 cross-tool 공유). **code-pointer-validator 는 re-export**(import 처 cli.js/test API 표면 무변경 / 내부 호출 validateOnePointer 도 로컬 import / **45 test green**). 선례 = `_shared/checkGraphFreshness`(validator.js:408)·`load-business-rules`.
- **신규 순수 분류 `tools/chain-driver/src/lift-anchor.js` `reconcileObserved(codePointers, gitFacts)`** (gate·I/O·git 0): relocation→관측사실 후보(auto-update) / content_drift+intent→flag. git 탐지(IO)는 cli glue 주입.
- **`chain-driver lift --reconcile`**: anchor 노드의 strict_path pointer 만 `detectContentDrift(worktree:true)`+`findRelocation` → `reconcileObserved` → `reconcile` 보고 블록(propose-only / **그래프 mutation ❌** / exit 0). `--reconcile` 없으면 lift 동작 무변경.
- **★ Senior 적대검토(REVISE@0.82) 전건 사실검증 후 반영** (권위≠사실정합 / `feedback_senior_fact_check_supplement`):
  - **#2 MAJOR 확정**: `applyContentDrift`(validator.js:386)는 state flip 만·commit_hash 재기록 ❌. content_drift 재앵커="새 코드가 정답"=`lift --ceiling` 의미 판정 = 후보면 게이트 backdoor. **수정: content_drift = flag-only / relocation 만 관측사실 후보**(프리미티브보다 공격적 ❌).
  - **#1 MAJOR 확정 + 정정**: poc-05 commit_hash(321eeb3b)가 anchor 파일(후행 커밋 추가)보다 앞서 → detectContentDrift new-file diff 로 **무조건 true**. **poc-18 도 동일**(stamp ca06a2e6 = post.service.ts 추가 cfb790ff 보다 앞선 무관 커밋 / Senior 의 "poc-18 clean" 주장은 fact-check 로 반증). **수정: committed poc 2개 = "drift→flag" 메커니즘 2-도메인 corroboration / "false-positive 0(clean)" = tmp-git fixture**(commit_hash==현재 / self-contained 실 git / 환경독립).
  - **#3 MINOR**: `validateCodePointers --git --worktree` 가 이미 같은 git 사실 산출 → 부가가치 = **새 git 사실 ❌**, anchor-scoping(손수정 파일 주인 노드만) + 관측/의도 분류 + lift 워크플로 통합. 정직 명시.
  - **#4 MINOR**: `reconcileObserved` 는 노드 전체 ❌ → code_pointers + gitFacts.
- **검증(no-sim 실 git / §8.1)**: `test/lift-anchor.test.js` 32(기존 22 + reconcile 10: 순수 분류 6 + committed poc e2e 2[poc-05+poc-18 drift→flag·propose_only·그래프 byte-identical] + tmp-git clean 1[false-positive 0] + git 부재 graceful 1). chain-driver **419/419**(409+10) · code-pointer-validator **45/45**(추출 back-compat) · 3-way 0.9.0.
- **carry(후속)**: content_drift flag → 사람 결단 UX(재앵커 vs --ceiling 분기 명령) · relocation auto-apply(--apply / 현 propose-only) · Phase 3 merge-back · Phase 4 per-item granularity. SSOT = DEC §11 + plan.

## [0.8.0] — 2026-06-07 MINOR — living-sync Phase 2: `lift` 손수정 코드 anchor → 의미 천장 surface → forward 재전파 (유일 reverse 예외)

forward-only 전파 정책의 **유일한 reverse 예외** — 누군가 **코드를 직접 손수정**한 경우. 신규 `chain-driver lift` 가 변경 코드파일을 주인(owner) 노드로 anchor(결정론 / code_pointers path) → 그 노드의 backward 조상을 **의미 천장 후보 메뉴**로 surface → **사람이 `--ceiling` 으로 어느 높이까지 의미가 바뀌었는지 명시**하면 그 천장부터 forward 재전파(computeSyncLoop → regen_queue). 의미 천장 판정 = **사람 only**(auto-climb ❌ = 없는 상위 의도 날조 회피 / DEC §2 예외 정책). 4원칙(plan `plan-living-sync-phase2.md` 1원칙 + **Senior 적대 step-0 pass[REVISE@0.83] 전건 코드 사실검증** + D1~D6 사용자 승인).

- **신규 순수 코어 `tools/chain-driver/src/lift-anchor.js`** (fs/state/LLM/시간/git 0 / trust 가드): `liftCandidates(graph, changedPaths)` → `{anchors, unresolved, ceilingCandidates[hop정렬], ceilingByAnchor}` (resolveOriginNodeIds + analyzeImpact backward 재사용) · `validateCeiling(ceilingId, anchors, ceilingByAnchor)` (ancestry guard).
- **신규 `chain-driver lift` 명령**: `lift [<project>] --changed <codefile>... --graph <g> [--ceiling <id>] [--force] [--dry-run] [--json]`. **--ceiling 명시 시** computeSyncLoop(ceiling) → regen_queue(`source:'lift'` / route·sync-loop durable 경로·clobber·has_cycle 가드 재사용).
- **★ Senior 적대검토(REVISE@0.83) 전건 사실검증 후 반영** (권위≠사실정합 / `feedback_senior_fact_check_supplement`):
  - **#1 BLOCKER 확정**: IMPL=forward-leaf 실측(`forward(IMPL)=0`) → "기본 천장=IMPL"은 빈 큐 = 무의미. **수정: 명시 `--ceiling` 없으면 천장 후보 surface-only / forward seed ❌ / propose-only exit 0**.
  - **#3 MAJOR 확정**: `forward(BHV)` closure 에 손수정 IMPL 이 재생성 대상으로 포함(자기 코드 재생성 지시). **수정: forward closure 에서 손수정 anchor 노드 제외 + `hand_edited_excluded` 별도 보고**(computeSyncLoop 순수 유지·cli 사후 필터).
  - **#4 MAJOR 확정**: computeSyncLoop ancestry 체크 0 → 엉뚱한 천장도 통째 오-seed. **수정: `--ceiling` ∈ anchor backward 조상 allowlist 검증 / 아니면 exit 3 + 유효 후보 나열**(auto-climb ❌).
  - **#5 MAJOR 확정**: reconcile 프리미티브(detectContentDrift/findRelocation)는 code-pointer-validator 패키지 / chain-driver cross-import 0. **수정: reconcile(observed-fact 재추출 + intent 충돌 propose) = Phase 2b 분리**(git/fs IO + cross-package 결정 필요 / no-op stub 회피 / 0.8.0 = 전파 슬라이스만).
  - **#8 MINOR 확정**: poc-16 IMPL **0건** → lift 검증 불가. **수정: 2nd 도메인 = poc-18(Modern Express/TS / IMPL-POST-001) artifact-graph 합성**(traceability-matrix-builder).
- **검증(no-sim 실 CLI / §8.1 ≥2 distinct 도메인)**: 신규 `test/lift-anchor.test.js` 22(코어 9 + poc-05 e2e 11[surface-only/명시천장 forward+IMPL제외/오-천장 거부/비존재 거부/refactor 빈큐/unresolved/usage/durable/clobber/결정론] + poc-18 2nd 도메인 1 + trust 2). **2 도메인 = poc-05(register / BHV→4 item·IMPL 제외) + poc-18(Express/TS / IMPL-POST-001→TC/AC/BHV/UC 천장 surface)** 실 graph. chain-driver **409/409**(387+22) · version 3-way 0.8.0.
- **carry(후속 / DEC §5)**: Phase 2b(reconcile = observed-fact 재추출 + intent 충돌 propose / `_shared` or shell-out 결정) · Phase 3 merge-back · Phase 4 per-item granularity(BR-split STEP 3) · fixpoint 자동 재진입. SSOT = `DEC-2026-06-07-living-sync-operating-model.md` §10(Phase 2 append) + plan.

## [0.7.0] — 2026-06-07 MINOR — living-sync Phase 1b: `route` 의미 라우터 (discovery-spec 명시 매핑 → 진입 origins → regen_queue)

자연어 변경요청을 그래프에 ground 해 **진입 노드**를 찾는 라우터. **의미 판정은 기존 LLM skill(`discovery-from-nl-md`)이 discovery-spec 으로 산출**하고, 신규 **결정론 도구 `chain-driver route`** 가 discovery-spec 의 명시 매핑(use_cases.id / business_rules_intent.br_id)을 entry origins 로 변환 → sync-loop forward closure → regen_queue. §3.4 경계: LLM 제안 / 도구·validator 결정론 / 사람 gate#1. 4원칙(plan `plan-living-sync-phase1b.md` + 2 Explore + **2 Senior 적대 pass**). **★ v1(token 매칭) Senior REVISE@0.78 = 의미 라우팅 불가 → v2(discovery-spec 명시 매핑) 전환** → v2 Senior REVISE@0.86 BLOCKER/MAJOR 6건 코드확인 후 정정.

- **신규 순수 코어 `tools/chain-driver/src/route-discovery.js`** (gate·I/O·시간 0 / trust 가드): `resolveDiscoveryOrigins(discoverySpec, graph, analysis)` → `{origins, net_new, diagnostics, counts}`. UC-id→그래프 노드 직접 매칭 / br_id→analysis business-rules **content** 매칭(`normalizeAnalysisBusinessRules` 재사용 = validator 동형 / Senior #1 정정: loadBusinessRules[strict canonical-only] ❌) → coarse `analysis-business-rules` 노드(per-BR=Phase 4). miss=net-new.
- **신규 `chain-driver route` 명령**: `route [<project>] --discovery-spec <p> --graph <g> [--analysis <br.json>] [--force] [--dry-run] [--json]`. existing origins → computeSyncLoop → regen_queue seed(sync-loop durable 경로 재사용 / clobber·has_cycle 가드). net-new = propose-only report.
- **Senior 정정 (코드확인)**: #2 `--analysis` 부재 + br_intent 존재 → **fail-closed exit 3**(전건 net-new 무진단 silent mis-route 차단) · #3 BR origin=analysis-business-rules=soft edge → closure SHOULD/**notify-only**(full 하향 cascade=fixpoint 재진입 / 1c deferred) · #4 discovery UC 가 노드보다 fine → net-new + **counts loud 보고** / **0-origin=유효 propose-only exit 0**(sync-loop exit 3 와 구분 / S2 graph 부재 대응) · #5 net-new carrier=stdout report-only(그래프 mutation ❌) · #6 net-new BR 차단은 별도 gate#1(역할 분리 / route=비-gating).
- **검증(no-sim 실 CLI / §8.1 ≥2 distinct 도메인)**: 신규 `test/route-discovery.test.js` 13(코어 6 + poc-05 e2e 5 + trust 2). **2 도메인 = poc-05(register / UC+BR→13 item) + poc-16(Spring 4.1 legacy car / 10 UC+12 BR→31 item / net_new 0)** 실 discovery-spec fixture. chain-driver **387/387**(374+13) · release-readiness **40/40** · version 3-way 0.7.0.
- **carry(후속)**: per-BR granularity(Phase 4 = br_id↔per-BR 노드 / 현 coarse) · UC parent-prefix 매칭(fine UC 화해) · fixpoint 자동 재진입(BR notify→full cascade). Phase 2(손수정 코드 lift+reconcile) = 다음 추천. SSOT = DEC §9 + plan.

## [0.6.0] — 2026-06-07 MINOR — living-sync Phase 1c: `sync-next` regen_queue stage-단위 소비 (루프 닫기)

living-sync Phase 1(`sync-loop`)이 worklist 를 **계산·durable 기록만** 하고 멈추던 지점을 닫는다 — 신규 `sync-next` 가 `regen_queue` 를 **stage 단위**로 소비하여 재생성 지시 surface → stage gate 재실행 → drift 해소까지 end-to-end. 죽은 `pending_revisit`(stage-단위 / jump 미실행)의 **산 대체**(노드-단위 worklist). 재생성(LLM 내용 생성)·fixpoint 자동 재진입은 명시적 deferred. 4원칙(plan `plan-living-sync-phase1c.md` + 2 research-agent[Senior 적대 + soundness/reuse] 코드 사실확인). **Senior REVISE@0.82 — naive 설계의 BLOCKER 1·MAJOR 3 코드확인 후 정정**(node-gate→stage-gate).

- **신규 소비 코어 (`tools/chain-driver/src/sync-loop.js` 에 추가 / 순수 / gate 토큰·I/O·시간 0)**: `selectNextStage(regenQueue)`(cascade 보존 = 첫 미완 item 의 stage + 같은 stage 노드 묶음 / origins) · `markStageDone(regenQueue, stage)`(in-place / CAS 는 호출자) · `queueStatus(regenQueue)`. 기존 sync-loop trust 가드가 커버.
- **신규 `chain-driver sync-next` 명령**: `sync-next <project> [--findings <path>] [--user-decision <go|stop>] [--dry-run] [--json]`. **findings 미제출 = 재생성 지시 surface**(다음 미완 stage + 노드 + `requiredValidators(stage)` / gate ❌ / write ❌ / exit 0). **findings 제출 = 그 stage gate 재실행**(`evaluateGate(item.stage, findings, scenario)`) → pass=그 stage 미완 item 전부 `done:true` CAS·`status:in_progress|complete` / stop=`regen_queue.blocked={stage,reason}` 전용 표기·exit 1. **리듬 = invocation 1회 = distinct stage 1개**(기존 `next` 동형).
- **정정 (Senior BLOCKER #1·MAJOR #2 / gate 입도 = stage)**: `evaluateGate` 는 노드 차원이 없는 **stage 단위 aggregate** 함수 → "노드별 gate" 는 불가(findings 부재→livelock / per-item done 허구). 라이프사이클 [4] "그 노드의 owning gate" = 그 노드의 **stage gate** 로 정합. findings = 그 stage validator 산출을 `--findings` 로 공급(bootstrap 동형).
- **회귀 차단 (Senior MAJOR #3 / D5)**: 큐 block 은 `regen_queue.blocked` 전용 — **`state.blocked`·`current_chain`·`last_gate` 미접촉**(bootstrap `cmdNext` 무변경 / `blockedExit` 교차오염 회피). 별도 `sync-next` 명령(cmdNext 무변경 / zero-regression).
- **clobber 가드 (Senior MINOR #5 / D7)**: `sync-loop` 가 in-progress 큐(in-flight done 존재 또는 `blocked`) 덮어쓰기 거부(exit 2) / `--force` 강제 교체. **fixpoint 정직 표기 (#6)**: 큐 소진 = `status:complete` + "fixpoint 미보증 — 계약 변경 시 sync-loop 재실행" / 자동 재진입 deferred. **has_cycle 큐 방어 (#7)**: 소비 전 assert. cmdState `regen_queue` 표시 done-aware(완료 큐를 "pending" 으로 오표기하던 것 교정).
- **검증(no-sim 실 CLI / §8.1 ≥2 distinct 도메인)**: 신규 `test/sync-next.test.js` 16(코어 단위 6 + poc-05 e2e 6[surface/drain spec→plan→test→implement/block 격리·복구/빈큐/clobber/cmdState] + trust 4). **2번째 도메인 = poc-16 efiweb-car-spring41(Spring 4.1 legacy) 실 dogfood**(BHV-CAR-MGT-001 seed → surface → spec gate drain → complete). chain-driver **374/374**(358+16) · release-readiness **40/40 무회귀** · version 3-way 0.6.0.
- **carry(후속 / DEC §5)**: fixpoint 자동 재진입(sync-next 종료 시 sync-loop 재호출) · Phase 1b NL discovery 라우터 · Phase 2 손수정 코드 lift+reconcile · Phase 3 merge-back · Phase 4 per-item granularity · hook auto-fire. (선택) state.schema.json `regen_queue` 선언(honest-debt). SSOT = `DEC-2026-06-07-living-sync-operating-model.md` §7(Phase 1c append) + plan.

## [0.5.0] — 2026-06-07 MINOR — living-sync Phase 1 MVP: `sync-loop` forward 전파 → regen_queue worklist

living-sync 운영 모델(v0.4.0 후 청사진 정착)의 **Phase 1 MVP** — 변경된 산출물에서 그래프를 따라 **forward 단방향** 영향 closure 를 계산해 순서화된 재생성 worklist 를 산출하는 첫 결정론 루프. 재생성(LLM)·NL discovery 라우터·역동기화·merge-back·per-item granularity 는 명시적 deferred(후속 phase). 4원칙(plan `fancy-nibbling-wolf.md` §11 + 2 Explore 코드 사실확인 + 1 Plan-agent 설계).

- **신규 `tools/chain-driver/src/sync-loop.js`** (순수 코어 / fs·state·LLM·시간 의존 0): `computeSyncLoop(graph,{origins,changedPaths})` → `{origins, unresolved, closure:{MUST,SHOULD,FYI}, has_cycle, items}` · `resolveOriginNodeIds`(파일→노드: source_path 매치 / 코드파일=code_pointers 매치) · `SUBKIND_TO_STAGE` · `markTransientDrift`(--mark 전용 in-memory). **forward-only 강제**: `analyzeImpact(... includeBackward:false ...)` (기본 양방향 override — 정책 §2.0).
- **신규 `chain-driver sync-loop` 명령**: `sync-loop <project> --graph <g> (--origin <id>... | --changed <path>...) [--mark] [--dry-run] [--json]` → forward closure + **regen_queue worklist 를 state.json 에 durable 기록**(결정론 / 비-gating). cmdImpact 의 analyzeImpact+topologicalOrder+cascadeOrder 재사용. `has_cycle` 시 durable write 거부(graph-integrity #15 동형). **drift 는 파생값 → 그래프 영속 ❌**(--mark = display-only / 기본 off). cmdState 에 `regen_queue` 표시줄.
- **결정론 경계(no-simulation)**: "어느 노드 영향받나" = 그래프 reachability(LLM ❌) / 재생성(내용)은 코어 밖. regen_queue 는 어떤 gate 도 읽지 않음(reference-lens / trust 가드).
- **검증(no-sim 실 CLI)**: 신규 `test/sync-loop.test.js` 15(단위 + poc-05 실 fixture e2e + trust 가드). poc-05 `--origin BHV-USER-001` → closure MUST=`[AC,IMPL,TASK,TC]-USER-001` / **UC(상류)·USER-002(분리체인) 부재 = forward-only 입증** / items cascade 순 / durable==stdout / 그래프 byte-identical / 결정론 / coarse `--changed`=BHV-001+002 union. chain-driver **358/358**(343+15) · release-readiness **40/40 무회귀** · version 3-way 0.5.0.
- **carry(후속 phase / DEC §5)**: Phase 1b NL discovery 라우터 · Phase 2 손수정 코드 lift+reconcile · Phase 3 merge-back · Phase 4 per-item granularity(BR-split STEP 3) · `next`-consumes-worklist + pending_revisit 활성화 · hook auto-fire. SSOT = `DEC-2026-06-07-living-sync-operating-model.md` §7(Phase 1 시행 로그) + plan §11.

## [0.4.0] — 2026-06-07 MINOR — business-rules 로딩 `_shared` 중앙화 + discovery-extraction silent mis-fire fix (BR-split 순차안 STEP 2)

BR-split 순차안 STEP 2 — business-rules 로딩(파일위치 resolve + shape 추출)을 신규 `tools/_shared/load-business-rules.js` 로 중앙화. 목적: ① discovery-extraction-validator silent mis-fire(blocker #1) 즉시 수정, ② STEP 3(포맷 분할 = index + per-BC)을 **single-point 변경**으로 de-risk. **포맷·schema·산출물 무변경.** 3-Explore 실측 + Senior 적대검토(REVISE@0.82 / 결함 5건 코드확인 후 수정)로 naive 설계 정정.

- **신규 `tools/_shared/load-business-rules.js`** (ESM / `_shared` 컨벤션 선례 답습 / 3 export):
  - `normalizeBusinessRules(parsed)` = **strict canonical**(오직 `{business_rules:[]}`). canonical output reader 3종 전용 — v5.0.0 alias hard-kill(`rules`/`rules_manual_authored`) 정합(4-shape 로 안 넓힘 / Senior 정정 1: 넓히면 죽인 alias 부활). **STEP 3 분할 단일 변경 지점.**
  - `normalizeAnalysisBusinessRules(analysis)` = analysis-stage raw 4 legacy shape(rules.business_rules / business_rules / rules / rules_step_4c_carcost) 흡수 + **mis-fire 신호**. discovery-extraction-validator 전용(STEP 3 분할 무영향).
  - `loadBusinessRules(target, {readJson, bcFilter})` = 파일/디렉토리 resolve + 추출 + bcFilter 슬라이스. 주입 readJson 지원(context-federator testability seam 보존 / Senior 정정 3). fail-closed([]).
- **discovery-extraction-validator silent mis-fire fix (blocker #1)**: BR-container 키가 present 인데 id 보유 BR 0건(미인식/malformed shape) → N 개 false `discovery.br_intent.unknown_br` **critical**(gate #1 오차단) 대신 단일 `discovery.br_source.shape_unrecognized`(**high**) emit. 판별 경계(Senior 정정 2) = "container 키 present + 0 id" 일 때만(BR 키 자체 부재 = 정당한 0-rules → 무알람 / typo'd id 는 union-then-check 라 여전히 critical = 보존).
- **reader 재배선 4종**: br-cross-consistency-validator(`extractRules`→`normalizeBusinessRules` 위임 + cli `loadBusinessRules`) / context-federator(`loadBusinessRules(brPath,{readJson})` seam 보존) / traceability-matrix-builder(graph cli 루프 business-rules kind 정규화 / graph-synthesizer accessor 무변경) / discovery-extraction-validator(상기). 필명→subkind 매핑 상수(hooks-bridge 등)는 로더 아님 + STEP 3 index 가 파일명 유지 → 무영향(scope-out / Senior 점검 안전).
- **버전 = MINOR(0.4.0)** (Senior 정정 5): 신규 finding kind + gate #1 verdict 변화(N critical-block → 1 high non-block) = 호환 기능추가(PATCH ❌ / v0.2.0 PmdPlugin MINOR 선례).
- **검증**: 재배선 4 reader test green(br-cross 32 / federator 32 / traceability 152 / discovery 39 / mis-fire+loader 신규 7) · workspace 1277/1279(0 fail / 직전 1270/1272 + 신규) · 예제 전수 schema-valid 유지(포맷 무변경). **carry**: STEP 3(index+per-BC 분할 + schema 2종 + 노드모델 + examples 재생성 / BC 채움률 실측 재판단) · traceability `chain.businessRules` cli unset latent gap(buildMatrix BR 미주입 / 본 STEP 무행동 명시 / Senior 정정 6). SSOT = `decisions/DEC-2026-06-07-br-split-step2.md` + plan `plan-br-split.md` §8.

## [0.3.0] — 2026-06-07 (breaking / pre-1.0) — business-rules `bounded_context` required 승격 + scope-local `*.subset.json` 폐기 (BR-split 순차안 STEP 0+1)

business-rules 산출물을 BC별 파일로 분할하려는 요구에서 출발 — Senior 적대 검토가 **bounded_context 채움률 8 PoC 중 7개 = 0%** 를 실측, "무조건 분할 now" 전제를 반증(분할 시 전부 `_uncategorized` 로 몰려 무의미 + reader silent mis-fire + 경로 3종 불일치). → **순차 4스텝**(STEP 0 subset 폐기 / STEP 1 BC 의무화 / STEP 2 경로통일+loader / STEP 3 분할)으로 전환, **본 릴리스 = STEP 0+1**(토대). 분할(STEP 3)은 STEP 2 후 BC 채움률 실측 재판단.

- **STEP 0 — subset 폐기 (DEC-2026-06-07-subset-retire)**: baseline-delta 의 `*.subset.json`(scope-local 파생 사본) 개념 폐기. 사용자 지적("subset 바뀌어도 원본 반영 안 되면 SSOT 아니다" = 사본↔원본 역동기화 부채) 수용 → scope 슬라이스 = `chain-driver` `subsetAnalysisRefs(canonical, prefixes)` **in-memory 참조 필터**(BR-id/analysis_refs / 사본 파일 ❌)로 canonical 단일 SSOT 유지. 실 `*.subset.json` 0건(미실현)→코드 제거 0 / `subsetAnalysisRefs` 함수 무변경(chain-driver 343/343). doc=`baseline-delta-operating-model.md`(§2·§3·§4)+`lifecycle-contract.md`(scope 디렉토리 다이어그램). greenfield "7대-subset"(산출물 종류 subset / 다른 의미) 무관·보존.
- **STEP 1 — bounded_context required (DEC-2026-06-07-bounded-context-mandatory / breaking)**: `business-rules.schema.json` `$defs.businessRule.required` = `["id"]` → `["id","bounded_context"]` + `minLength:1` + description(분할 키 / domain.json 매핑). writer `analysis-business-rules/SKILL.md` = 각 BR 을 domain.json bounded_contexts 에 매핑 의무 채움 지시(단일 도메인이면 그 1개 BC).
- **예제 백필 (113 rule / 14 파일)**: release-readiness `analysis_validator_violation` 이 예제 business-rules.json 전수 schema 검증 → 0% 14 PoC 백필. BR id `<DOMAIN>` 토큰 → `BC-<DOMAIN>` 결정적 derive(poc-01[BC-AUTH/CONTENT]·poc-16 기존 domain-informed BC 보존 / poc-05 = BC-USER 수동).
- **test 정합**: schema-validator `chain-schemas`+`rules-cross-consistency` 픽스처에 bounded_context 추가 — VALID 기대 픽스처(BC 추가) + INVALID 기대 픽스처(BC 추가해 의도한 anyOf 이유로 실패 / 테스트 무결성). schema-validator **108/108**.
- **검증**: schema-validator 108/108 · chain-coverage 41 · traceability-matrix-builder 152 · decision-table-validator 11 · chain-driver 343 green / 예제 14 전수 schema-valid / version 3-source 0.3.0. **정직 표기**: release-readiness `workspace_test_pass`(NODE_TEST_CONTEXT env artifact / clean 트리 동일) + findings-aggregator 7 fail(buildValidatorArgs 단위 / **clean 트리 stash 동일 = pre-existing env / 본 변경 무관**). SSOT=`decisions/DEC-2026-06-07-{subset-retire,bounded-context-mandatory}.md` + plan `plan-br-split.md`.
- **carry**: BR-split STEP 2(경로 3종 통일 + reader 공용 loader / blocker #1 silent mis-fire·#3) → STEP 3(index+per-BC 분할 / BC 채움률 실측 재판단). 예제 BC = id-prefix derive(시점 기록물 / 정밀 domain 매핑 = STEP 3 재생성 시). domain/antipatterns 등 타 산출물 BC = scope-out.

## [0.2.0] — 2026-06-07 MINOR — PMD Tier 2(import) → Tier 1(in-plugin 자동실행) 정식 격상 + R19 Tier 축 = "실행 locus" 명문화

PMD 를 R19 Tier 1(plugin in-plugin 자동 실행)으로 편입. 사용자 질문("java 가 있으면 자동으로 되나?")을 계기로 in-plugin PMD 자동 실행을 실측 입증하고, charter R19 의 "JVM 의존 0" 문구가 SSOT(`no-simulation.md` 가 Gradle·JUnit 을 Tier 1 로 둠)와 모순되는 drift 임을 확인 → Tier 분류 축을 **"실행 locus"**(plugin 직접 실행 vs 사용자 CI import)로 명문화. import 경로(allowlist=`['pmd']`)는 **orthogonal 로 보존** — PMD 는 in-plugin 자동 + import 양쪽 유효.

- **코드 (`tools/static-runner/`)**: `runner.js` — `Plugin` 에 `shell` 옵션(Windows `pmd.bat` 대응 / Node 22+ CVE-2024-27980 EINVAL 회피 / default false = Semgrep 무영향) + `versionParse` 콜백(default 첫 줄 / PMD 는 ASCII 배너 회피 semver 추출). `PmdPlugin`(`check -d <dir> -R <ruleset> -f sarif -r <file> --no-progress`) + `PLUGINS.pmd` 등록. `cli.js` — usage/error plugin-aware(`--plugin <semgrep|pmd>` / PMD 환경부재 설치 안내).
- **물증 (§8.1 2-paradigm corroboration / OpenJDK 25 + PMD 7.25.0)**: poc-06(legacy Spring4.1) Tier1 auto-run **17 findings real_tool** (hash `09ec18ad…` = Tier2 import 와 **동일** = 결정성 입증) + poc-10(modern JPA/QueryDSL) **42 findings real_tool**. legacy+modern distinct paradigm = 단일 PoC 과적합 회피 충족.
- **doc (Tier 축 명문화 + PMD Tier1)**: `policies/no-simulation.md`(SSOT) · `plugin-charter.md`(R19 L29·R15 L51 "JVM 의존 0" 정정 + L55 allowlist `['pmd']`·`PLUGINS={semgrep,pmd}`) · 루트 `CLAUDE.md` · `lifecycle-contract.md` · `deliverables/{12,21}` · `workflow/formal-spec.md` · 4 skill(`analysis-aspect-static-security`·`analysis-formal-spec-validation`·`implement-generate-impl-spec`·`_base-apply-baseline-ratchet`) · `templates/adoption/CLAUDE.md` · `tools/README.md`.
- **DEC-2026-06-06-tool-allowlist-pmd-only 관계 = orthogonal (supersede 아님)**: import allowlist `['pmd']` 무변경. 그 결정의 근거("실 import/실행 이력 0 도구 나열 ❌" = no-unrunnable-tool-citation)를 본 격상은 in-plugin 실행 물증(real_tool/duration/hash)으로 **충족**. v8.6.0 에서 import 패턴으로 일시 격하됐던 PmdPlugin 을 물증과 함께 재도입.
- **R-1 정직성 (과대광고 회피)**: "PMD 항상 자동실행" 아님 — JDK/PMD 부재 시 preflight `PluginEnvironmentMissing` → cli **exit 3**(정직 "환경 부재" 신호 / LLM 추론 대체 ❌ / Semgrep 동형).
- **검증**: static-runner `npm test` **35/35** green(29→35 / PmdPlugin +6) · live PMD `tool_version='PMD 7.25.0'`(직전 ASCII 배너 ████ 버그 fix) · release-readiness **40/40** · version 3-source sync(plugin.json·package.json·CHANGELOG) 0.2.0. SSOT=`decisions/DEC-2026-06-07-pmd-tier1-promotion.md`.

## [0.1.0] — 2026-06-06 — 플러그인 rename `ai-native-methodology` → `context-ops` + tool 스코프 `@mis-plugins` 통일 + 버전 스킴 0.x 리셋 (pre-1.0 / 사내 미배포)

플러그인의 **기계 식별자**를 `ai-native-methodology` → `context-ops` 로 변경. 설치 시 `@mis-plugins/context-ops` 로 잡히고 skill 호출이 `context-ops:<skill>` 네임스페이스가 된다(= breaking). 방법론 **개념명 "AI-Native 개발 방법론"** 과 GitHub repo(`SGH-ISD/ai-native-methodology`)는 불변 — 식별자 축만 교체. 동시에 **버전 스킴을 0.x 로 리셋** (pre-1.0 + 사내 미배포 반영 / 이전 12.x 는 maturity 과대 표기). 실 사용자 0(사내 배포 전) → 외부 영향 0.

- **식별자 (breaking — skill namespace)**: `.claude-plugin/plugin.json` `name` → `context-ops` / `package.json` → `@mis-plugins/context-ops` / 디렉토리 `git mv plugins/ai-native-methodology` → `plugins/context-ops` / skill 네임스페이스 `ai-native-methodology:` → `context-ops:` / 카탈로그 `marketplace.json` 재생성(name `context-ops` · package `@mis-plugins/context-ops` · version `^13.0.0`).
- **tool 스코프 통일**: 모노레포 전환의 잔여 부채 청산 — 내부 tool **29개** npm 스코프를 `@mis-plugins/<tool>` 로 일원화 (옛 `@ai-native-methodology/*` 27개 rescope + 무스코프 `codegraph-coverage`·`spectral-runner` 2개 신규 스코프). tool 간 cross-dep 0 확인 → 누락 위험 없음.
- **install 부수 정정**: `.npmrc.template` 스코프 stale `@ai-native-methodology:registry` → `@mis-plugins:registry` (안 그러면 npm 이 `@mis-plugins/*` 레지스트리 미해석) + `docs/deploy/nexus-setup.md` 옛 패키지명 `@ai-native-methodology/plugin` → `@mis-plugins/context-ops` + 루트 `package-lock.json` 완전 재생성.
- **보존**: repo URL `SGH-ISD/ai-native-methodology` (16파일) · 개념명 "AI-Native 개발 방법론" (41곳) · 역사 기록(briefing 버전사·CHANGELOG-HISTORY·decisions)의 옛 스코프 참조.
- **버전 0.x 리셋**: 12.16.0 → 0.1.0 (plugin.json·package.json·CHANGELOG 3-source) / 카탈로그 `marketplace-entry.json` versionRange `^0.1.0` (0.x 는 build-catalog auto majorRange `^0.0.0` 부정확 → 명시 override). 누적 12.x 이력은 이하 항목에 연속 보존.
- **동작 변화 = skill 네임스페이스 prefix + 버전 표기**. 검증: version 3-source sync 0.1.0 · catalog drift 0 · build dry-run(`context-ops` / 4698 files) · release-readiness **24/24** · `npm test --workspaces` **29/29**.
- **PoC #18 — Modern Node/TS full-chain dogfood (chain-driver 상태머신 E2E 첫 실전 외부 적용 / `cfb790ff`)**: 외부 공개 OSS(devmahmud/express-prisma-typescript-boilerplate, MIT, HEAD `ae44eb6f`)에 chain-driver 상태머신 6 stage 를 E2E 완주(S1 재생성 / slice=post.service). analysis(#0)→discovery(#1)→spec(#2)→plan(#3)→test(#4 RED)→implement(#5 GREEN)→terminal. gate #0 fail-closed 시연(dry-run `evidence_missing` soft block → `--user-decision go` human checkpoint) + genuine RED→GREEN(실 vitest 3.2.4 / RED 0pass·18fail `b853` → GREEN 18pass·0fail `d376` / test 파일 불변 = i-strict). AXIS1 = 5 auto + 1 user-decision(6 gate) / 산출물 11종 strict schema VALID. node_modules(472M)·.env.test gitignore / 재현 README §2.
- **F1 RESOLVED — discovery-extraction-validator UC coverage silent skip (`e29dc547`)**: validator 가 top-level `analysis.domain.use_cases` 만 읽어 domain.schema 의 `bounded_contexts[]` 중첩을 못 봐 schema-conformant domain.json 이 vacuous pass(fail-OPEN) → 중첩+top-level 양쪽 수집(use_cases·entities). below-0.80 nested coverage 정상 block. (discovery 32/32 +3)
- **F2 RESOLVED — findings-aggregator plan-coverage fail-OPEN (`e29dc547`)**: `buildValidatorArgs` 에 plan-coverage-validator case 부재 → default `--target` 호출로 errored→silent skip = plan gate primary validator 미실행. case 추가(`--task-plan --acceptance`) + `buildValidatorArgs` export(단위 테스트 enablement). (findings-aggregator +2)
- **F4 RESOLVED — schema-validator `$schema_ref` 미인식 (`e29dc547`)**: `$schema_origin`/`$schema` 만 읽어 db-schema 관습명 schema.json 이 영구 미검증 → `inferSchemaName` 에 `$schema_ref` 추가 + `db-schema.schema.json` 에 `$schema_ref`/`$schema_origin`/`$comment` 허용(business-rules.schema 동형). (schema-validator 108/108 +2)
- **비-analysis gate fail-closed + schema-validator stage-aware + wiring (`80280ec1` / DEC-2026-06-06-non-analysis-gate-fail-closed)**: 그간 analysis 만 `failClosedOnNull` → 비-analysis(discovery~implement)는 required validator null 시 silent skip(fail-OPEN). CLI 레벨 `failClosedOnNull:true` 로 `evidence_missing`(soft / `--user-decision go` ack) surface(`aggregateForStage` 함수 default 불변=기존 'skipped' 단위 테스트 보존). schema-validator stage-aware(discovery→discovery-spec / plan→task-plan / test→test-spec / implement→impl-spec). 동반 wiring: br-cross@discovery `--target <BR file>`(이전 default `--target <dir>`=errored skip) + spec-test-link `--behavior`(없으면 `bhv_ref` 미해석 → TC 당 false critical hard-block / 6→0). 잔존 정직 evidence_missing: drift(plugin 자기검사 N/A)·test-impl(CHANNEL B)·static-runner(env)·traceability(builder).
- **root package-lock 버전 lockstep (`2e250095`)**: `11f9ea0f` 0.x 리셋 시 루트 `package-lock.json` 의 `plugins/context-ops` workspace version 12.16.0 잔존 → plugin.json(0.1.0) drift 해소(npm install 자동 동기화 / source:npm bundledDependencies lockstep).
- **§8.1 / AXIS-not-measured 정직 (PoC #18)**: chain-harness 상태머신 E2E 첫 realistic 외부 적용 **1건**(단일 Modern Node/TS 도메인) — 70~80% chain-harness automation axis · §3-A analysis 추출률은 본 PoC 로 **측정 안 함**(E2E 완주 사실만 입증). paradigm-wide ceiling claim ❌ / 본체 격상 = ≥2 distinct domain 必. 검증(F1/F2/F4 + `80280ec1`): findings-aggregator 47/47 · schema-validator 108/108 · discovery 32/32 · release-readiness **40/40**.
- **traceability-matrix-builder gate wiring + AXIS2 openapi (poc-18 후속 / DEC-2026-06-06-non-analysis-gate-fail-closed §2.4)**: ① traceability-matrix-builder 에 `--json` findings-only 모드 + `transformTraceabilityMatrix`(red_count→critical / forward_coverage<threshold→medium advisory / yellow→low) + dispatchValidator route + buildValidatorArgs implement case → implement gate 에서 더이상 evidence_missing 아니라 coverage 신호 산출(poc-18: red 0 / forward 83.3%<85% → medium / **false hard-block 0**). ② poc-18 **openapi.yaml 생성**(5/5 이식성 산출물 / post slice route·validation 추출 / spectral `spectral:oas` lint **error 0**) + §3-A provenance breakdown(BR 6/6 code-grounded · schema 5 table orm · openapi 5 endpoint · AP 2 static+2 human_review) — 단 정직 경계: survivorship + self-assessment + 독립 expected-set 부재로 **§3-A 자동화율 백분율은 미측정**(ceiling claim ❌). 검증: findings-aggregator 52/52 · traceability-matrix-builder 152/152 · release-readiness **40/40**.
- **PoC #19 — Python/금융 full-chain dogfood (§8.1 corroboration #2 / [D2] RESOLVED)**: `numpy-financial v1.0.0`(BSD-3 / 금융 amortization / **Python 3.14+pytest 9.0.3+numpy 2.4.6 cp314**)에 chain-driver 상태머신 6 stage E2E 완주(S1 / slice=pmt·ipmt·ppmt / terminal last_gate=#5). poc-18(blog·post / Node·TS·vitest)과 **2 distinct problem-domain + distinct stack** = §8.1 ≥2 충족(상태머신 메커니즘 corroboration #2). genuine RED→GREEN 실 pytest(0pass·5fail `acf0cd2c` → 5pass·0fail `dab39cae` / test 파일 불변=i-strict / simulated_evidence_count=0 / pytest-json-report). 산출물 10/10 strict schema VALID. **gate #1 hard-block 실증**: discovery UC coverage 0.43<0.80 → work-unit scope 정렬로 해소(silent pass 아닌 진짜 hard gate 작동). **Docker-free 선택**(본 환경 Docker 부재 → 순수 계산 lib = DB/Docker 불요 도메인). **다른 산출물 프로파일**: db-schema·openapi=N/A(순수 함수 lib = 5 이식성 중 3 적용 — 상태머신이 다른 프로파일도 처리). **정직 경계**: §3-A rate=미측정(provenance만) / 2 data point=메커니즘 corroboration이지 paradigm ceiling 자동확정 ❌ / static-runner=Python 정적분석기 env-carry / chain4·5=CHANNEL B(poc-18 F3 동형 기지 갭). 본체 무변경(examples 추가) → release-readiness **40/40 무회귀**. SSOT=`examples/poc-19-numpy-financial-python/README.md`.

## [12.16.0] — 2026-06-05 MINOR — ticket subsystem R20-prime 마이그레이션 완결 (deferred breaking 완료)

DEC-2026-05-26-ticket-plan-단일 §5 의 **deferred breaking 마이그레이션** 완결 — 그간 skill·신규 schema(operational-task / task-plan refs / ticket-sync-evidence)만 R20-prime 였고 `traceability-matrix.ticket_ref` + 정책 doc + id-conventions + 테스트가 구 System-X(5-stage × phase / `subtask_ids.{chain1_planning..chain4_impl}`) 로 남아 있던 partial-migration 청산. ticket = **plan stage(chain 3) 단일 4-level cascade** (Epic=FE 화면/BE-domain + Story=BHV/AC + Task=OP-\* + Sub-task=TASK-\*) / test·implement = Sub-task status 갱신만.

- **schema (breaking)**: `traceability-matrix.schema.json` `ticket_ref` 재편 — 구 `subtask_ids.{chain1_planning..chain4_impl}` (chain-stage object) + `enter_task_ids` (5-stage) **폐기** → `level`(enum epic/story/op_task/subtask) + `subtask_refs`(TASK-\* 배열) + `op_task_refs`(OP-\* 배열). `additionalProperties:false` 라 구 field = reject (breaking). 실 consumer 0 (PoC fixture 미사용 — 영향 면적 0).
- **policy/spec prose**: `methodology-spec/ticket-policy.md` 전면 R20-prime 재작성 (§1 결단·§2 4-level layer·§3 plan-단일 시점·§5 OP-\*/TASK-\* summary·§10 phase×stage matrix → plan-단일 + skill SSOT 포인터·hierarchy parent matrix) + `id-conventions.md` §Ticket Binding 재작성 + `plugin-charter.md` R20→R20-prime (§1 정의 + §2 status) + `agents/plan-agent.md` + `skills/ticket-sync/SKILL.md` (enter_task_ids/subtask_ids → transient/subtask_refs).
- **test (breaking guard)**: `ticket-binding.test.js` + `ticket-sync-evidence.test.js` R20-prime 재작성 — valid(level/subtask_refs/op_task_refs/cascade) + 구 subtask_ids·enter_task_ids 폐기 reject 회귀 가드. (ticket-binding 7/7 · ticket-sync-evidence 19/19 · schema-validator npm test 40/40.)
- **tools/README refresh (동반)**: cadence matrix 4-chain(System-X) → 5-chain(discovery/spec/plan/test/impl + gate #1~#5 / plan-coverage-validator 행 신설) + "16 도구" → 29 패키지 정정 + cadence 외 12 도구(codegraph/context/graph/meta family) 인벤토리 + validator 4종→5종. (chain-numbering 정정 turn 의 structural carry 완료.)
- **동작 변화 (breaking schema shape)** — 단, ticket_ref 는 optional + consumer 0 이라 실 산출물 영향 0. 검증: citation 0 · check40 0 · release-readiness 40/40 · version 3-source sync 12.16.0.

## [12.15.2] — 2026-06-05 PATCH — chain/gate 번호 System Y 정합 (test=4 / implement=5)

shipped 운영 컨텍스트 파일에 잔존하던 **System X (구 4-chain / test=3·impl=4) 번호**를 canonical **System Y (discovery1/spec2/plan3/test4/implement5 / chain N = gate #N)** 로 일괄 정정. v9.0 plan stage 신설로 test·implement 가 한 칸씩 밀렸으나 일부 산출물 spec·skill·tool README·schema 가 구 번호를 보존하고 있던 documentary drift 해소 (INSPECTION-2026-05-31-test/implement 에서 식별된 prose-only stale / 동작 영향 0).

- **정리 파일**: methodology-spec/deliverables(18·19·20·21·23·24)·workflow/characterization·plugin-charter R14 / skills(spec-compose·spec-derive·spec-integrate·analysis-characterization-test) / templates(test·implement README) / tools README(chain-coverage·schema-validator·spec-test-link·static-runner·traceability-matrix-builder) + traceability-matrix-builder/src/builder.js gap 메시지 / schemas(business-rules.schema description ×3·README — task-plan(chain 3) 행 신설 + test→4·impl→5) / flows/implement.phase-flow expected_outcome gloss.
- **frozen 보존 (의도)**: `flows/sdlc-4stage-flow.json` corroboration-evidence ledger(`L1_chain_3_complete`/`L2_chain_4_GREEN` 토큰 = 코드 미참조 / 버전-dated 도달 기록) / non-shipped 이력(docs/adr·decisions·examples·CHANGELOG·tools/*/test·fixtures = era-accurate). 이미 System Y 인 다수 자산(test-impl-pass-validator·test-* skills·lifecycle-contract·use-scenario-taxonomy 등) 무변경.
- **별도 carry (구조 staleness / 본 PATCH scope 외)**: `methodology-spec/ticket-policy.md`(R20-prime 미반영 — stage=planning/test/implement 구 호출 규약 + per-chain sub-task) + `tools/README.md`(도구 인벤토리 16→34 stale + cadence matrix 4-chain / plan 컬럼·신규 도구 다수 누락) = 번호만 패치하면 내부 모순 → 전용 구조 refresh 필요. 한 칸 밀림이 아닌 모델 자체 stale 이라 본 번호 정정에서 제외.
- **동작 변화 ❌** (주석·description·문서 prose 만 / validator 로직은 stage 문자열로 동작). 검증: citation 0 · release-readiness **40/40** · traceability-matrix-builder 단위테스트 152/152 · business-rules.schema·implement.phase-flow JSON valid.

## [12.15.1] — 2026-06-05 PATCH — 잔여 출하 prose provenance 정리 + check40 scope 확장

v12.15.0 의 provenance 정리를 **출하 prose 나머지 디렉토리**(guides/templates/flows/hooks)로 마저 적용. 본문에 박혀 있던 버전 변천사·DEC/ADR 산문·인라인 PoC 증거·session·LL·backlog carry 를 제거하고 출처를 파일 끝 단일 `## 인용` footer 포인터로 일원화 — 출하 본문 = 현재형 사용자 관심사만. v12.15.0 과 동일 convention/KEEP·RELOCATE 룰.

- **정리 파일 14종**: `guides/{getting-started,chain-harness-guide,common-errors,first-prompt-cookbook,README}.md` · `templates/{README,analysis/finding.template,discovery/{README,planning-doc-format},spec/README,test/README,implement/README}.md` · `flows/README.md` · `hooks/README.md`. (`templates/adoption/` = non-shipped / build alias source → 제외.) common-errors 의 stale v2.5.1→v2.6.0 cutover FAQ 등 구식 마이그레이션 noise 도 정리.
- **check40 scope 확장**: `release-readiness.js` check40 `shipped_provenance_leak` 의 `SHIPPED_DIRS` 에 `guides`·`templates`·`flows`·`hooks` 추가 + `NON_SHIPPED_SUBPATHS`(`templates/adoption/`) skip. 가드가 이제 전 출하 prose 디렉토리에 fail-closed 적용. detail/delegated_to/주석 갱신.
- **ticket-sync identity leak 정리**: merge(`9861a085`)로 유입된 ticket-sync SKILL.md 의 SG-MIS 환경 config 참조(`jira.smilegate.net`·`structure_id: 684`·`customfield_11902`) 3줄에 `allow-identity:` 주석 추가 — 사내 공통 env-config reference(개인 신원 아님) 정당 예외. check `shipped_identity_leak` 40/40 복구.
- **동작 변화 ❌** — provenance noise 제거 + 정당 예외 주석일 뿐 skill·agent·guide 지시 기능 동형 / frontmatter `name`·`description` byte-불변. 검증: citation-validator 0 · check40 0 · release-readiness **40/40** · check40 discrimination 단위테스트 pass.

## [12.15.0] — 2026-06-05 MINOR — shipped 산출물 provenance 정리 (관심사 분리 + check40 가드)

shipped 파일(skills 53 · methodology-spec 54 · agents 11)에 박혀 있던 **프로젝트 거버넌스 내용**(버전 변천사 · DEC rationale · PoC corroboration 증거 · LL 교훈 · backlog carry · ADR 변천사 산문)을 본문에서 제거하고 출처를 파일 끝 단일 `## 인용` footer 포인터로 일원화 — shipped 본문 = 현재형 사용자 관심사만. outer `CLAUDE.md` 의 "버전 narrative 누적 금지 / 4중 중복 회피" precedent 를 전 shipped 파일로 확장. SSOT = `decisions/DEC-2026-06-05-shipped-provenance-cleanup.md`.

- **convention**: 본문 present-tense + `## 인용` footer(id·경로 포인터 + ≤6어 gloss). KEEP = 현재 아키텍처 명칭(`v9.0 6-stage`/`chain N`)·게이트 문구(`≥2 PoC corroboration 의무`)·런타임 carry(R19 environment carry-over / baseline+ratchet / named `C-*` / schema field). RELOCATE = 버전 변천사·DEC/ADR 산문·인라인 PoC 증거·LL·backlog carry.
- **반출 (non-shipped)**: `methodology-spec/finding-system.md` Body Finding Ledger(`F-PA`/`F-MB`/`F-SIM`/`F-SKILL`/`F-CHA` = 방법론 자체 dev 로그) → `decisions/finding-ledger.md` (995→212줄). `schemas/cycle-carry.schema.json`(거버넌스/dormant — shipped 생산자 0) → `decisions/governance/cycle-carry.schema.json` (payload 제외 / `--schema` 명시 test).
- **증거 doc 보존**: `sub-rules/spring41-ibatis2-isomorphic.md`·`sub-rules/absent-br-gwt-nl-paradigm.md`·`finding-system.md` §9 = PoC corroboration 증거 보존 + 파일 단위 `allow-provenance:` 가드 면제. `agents/design-agent.md` = NOT-SHIPPED placeholder 강조 + 가드 면제.
- **schema 라벨**: `adopter-corroboration.schema.json` `x-aimd-tier: governance` (경로 유지 / release check30 하드코딩 보호).
- **재누적 방지 가드**: release-readiness **check40 `shipped_provenance_leak`** 신설 (39→40) — shipped prose(skills/agents/methodology-spec) 본문에 거버넌스 마커 재유입 시 fail-closed(`## 인용` footer·`allow-provenance:` 면제 / frontmatter skip / check27 동형). `skill-citation-validator` HISTORY_FILE 에 `decisions/finding-ledger*` 추가(history-class).
- **동작 변화 ❌** — provenance noise 제거일 뿐 skill·agent 지시 기능 동형 / frontmatter `name`·`description` byte-불변. 검증: citation-validator 0 · check40 0 · release-readiness **40/40** · schema-validator 40/40 · release 테스트 24/24 (A1 workspace 29/29 포함).

## [12.14.0] — 2026-06-04 MINOR — codegraph wiring STEP 6 (openapi 정적 검증)

**§5 STEP 6 (Modern-scoped reading-aid) 시행 — 로드맵 6번째(마지막) 슬라이스.** 4원칙 = `.claude/plans/{plan,research}-codegraph-step6.md` (#1 깊은 숙지 + #2 3-agent research(공식문서/업계/Senior 적대) + 실 DB probe → 사용자 gate #3 "6-B openapi 단일축 + full 범위" 결단). SSOT = DEC-2026-06-03-codegraph-deliverable-wiring.md §14.

### 칼날 — 6 산출물 + openapi → openapi 1축 수렴

초안 9 injection-point(sql-inventory·formal-spec sequence·migration·task-plan·plan-org·input-adapters + openapi) 중 **call-chain/fan-in 4축 = STEP 5 federator callees/callers/impact 와 jurisdiction 중복**(STEP4 §12.6 (α) cut 동형) + Modern vacuous(poc-05 calls=4) / plan-org·input-adapters = semantic·greenfield N/A → cut. 유일 비중복 신규 niche = **openapi 정적 검증**(Specmatic/optic/schemathesis 전부 runtime Actuator·spec-only → 정적 "코드有 계약無"·controller-anchor·auth-grounding 을 running app 없이 못 봄). 칼날 궤적(STEP1 11→2·2 5→2·3 4→1·4 6→1·5 2→1) 정합.

### 신규 메커니즘 — `tools/codegraph-coverage` `--openapi-coverage` (3 sub)

- **(a) verb-diff** — codegraph route {verb,path} ∖ openapi.yaml operations (양방향 / basePath 정규화 / route-path coverage 는 STEP 1 소관 → verb-단위 직접 diff). 코드有계약無=medium / 계약有코드無=low. degenerate path(codegraph class+method 합성 실패) = informational 격리(false-positive 회피).
- **(b) controller-anchor** — openapi-extension `extracted_from.controller_method` ∖ codegraph 심볼 = stale (STEP 4 `buildAnchorVerify` 역방향 set-diff 재사용 / live·stale·informational 3-state).
- **(c) auth-grounding** — auth 보유 op 의 controller-anchor live 여부 reading-aid. 정직 경계: codegraph 는 @PreAuthorize *내용* 검증 ❌(심볼 인덱스만) → finding 미산출.
- 신규 `openapi-coverage.js`(순수 / 무의존성 openapi.yaml path 추출) + `code-openapi-coverage.schema.json`(informational_notes severity-less 격리) + cli `--openapi-coverage` 모드.

### trust 가드 check39 (RR 38→39 / check34~38 4-part isomorphic)

`codegraph_openapi_reference_lens_trust` — ① gate 모듈 STEP 6 토큰 0 + REQUIRED_VALIDATORS 미등록 ② schema verb_diff/controller_anchor informational_notes severity 필드 부재(codegraph 사각 finding 채널 구조 차단) + findings.severity ⊆ {low,medium} ③ openapi-coverage.js 상위 차단등급 리터럴 0 + 'not a defect/부재' 마커 + reference-lens 라벨 ④ gate 모듈 import 0 + **context-federator 간접 import 0(Senior 보강 — federator 경유 간접 gate-leak 미탐 방지)**.

### §8.1 정직 — 2 distinct 도메인 no-sim dogfood

- **verb-diff = data-2domain corroborated** — poc-01(raeperd SB2.x / route 22 / openapi.yaml) 19/19 perfect-match(true-negative) + poc-02(zhc1 Java21·SB3 / route 19) honest(degenerate `POST /`→informational + login→spec_not_in_code / basePath `/api` 정규화). committed examples 활용(외부 자산 불요 / `feedback_codegraph_step_dogfood_examples`).
- **controller-anchor = data-2domain 3-state** — poc-02 live arm 19/19 + poc-01 informational arm 19/19(api-extension 가 interface `XxxApi` 기록 / codegraph 는 impl `XxxRestController` 인덱싱 → 검증 불가 정직 격리 = 부재≠stale) + **stale arm = unit-test real-symbol probe**(in-the-wild stale 미관찰 = STEP4 §12.6 동형 정직). auth-grounding = poc-02 12 auth ops live.
- **정직 carry**: iBATIS2 x-sql-ids·NestJS·FE = codegraph 사각. call-chain/fan-in·sql-inventory·formal-spec sequence·migration·plan-org·input-adapters = carry(jurisdiction 중복/semantic/vacuous).
- (부수) poc-01 api-extension.json malformation 3곳(`""BR-DOMAIN-AUDITING-001""`) 정정 — 2nd 도메인 확보 + 실 JSON defect 수정.

### 검증

codegraph-coverage test 79→**110**(+31 openapi-coverage) + workspace **1229/1229** + release-readiness **38→39**(self-test 22→**23** / check39 discrimination) + version 3-way 12.14.0. 실 Ajv: poc-01/02 리포트 VALID + finding severity:high 주입 INVALID + informational_notes severity 주입 INVALID(gate-leak 구조 차단).

---

## [12.13.1] — 2026-06-04 PATCH — Windows 설치 결함 수정 (scripts/ 누락 + SessionStart 훅 크로스플랫폼화)

**증상**: Windows 신규 설치 시 `scripts/` 폴더 부재 → SessionStart 훅 실패. 사용자 보고.

### 근본 원인 — 패키징 화이트리스트 양쪽에서 `scripts/` 누락

SessionStart 훅(`hooks/hooks.json`)이 `${CLAUDE_PLUGIN_ROOT}/scripts/install-static-tools.sh` 를 실행하나, **두 패키징 경로 모두** `scripts` 미포함 — `package.json` `files`(source:npm) + `scripts/build-plugin.js` `INCLUDE`(dist). Mac dev 는 git 체크아웃이라 미노출. 추가로 훅이 Windows 부재 `bash` 로 POSIX 셸 스크립트 호출 = 2차 비호환.

### 수정 — 크로스플랫폼 Node 포팅 + 런타임 스크립트 패키징

- `scripts/install-static-tools.js` **신규** — `.sh` 의 멱등 semgrep Tier 1 설치 계약(always exit 0 / stderr 로깅 / `.aimd-install` 마커)을 Node 로 포팅. `where`/`command -v` 탐지, Windows 는 brew 건너뜀(pipx→pip), shell 부재 무관.
- `hooks/hooks.json` — SessionStart 훅 `bash …sh` → `node …js` (타 훅과 동형 node 채널). `.sh` 는 직접 POSIX 실행용으로 보존.
- `package.json` `files` + `scripts/build-plugin.js` `INCLUDE` — `scripts/install-static-tools.{js,sh}` 만 추가(dev 전용 release-readiness/build/publish/version-check/test 는 계속 workspace-only).
- `tools/static-runner/README.md` — 참조 node 버전 갱신.

### carry — 패키징 게이트 갭

`files`(package.json) ↔ `INCLUDE`(build-plugin.js) 이중 정의 + "hooks.json 의 `${CLAUDE_PLUGIN_ROOT}/…` 경로 ⊆ 패키지 페이로드" 검증 부재로 drift 누적. release-readiness 체크 추가 = 별도 커밋(현재 codegraph step6 WIP 와 분리).

---

## [12.13.0] — 2026-06-04 MINOR — codegraph wiring STEP 5 (context-cache callees 증분)

**§5 STEP 5 (context-cache 증분 / `callees` enrichment) 시행.** 4원칙 = `.claude/plans/plan-codegraph-step5.md` (#1 깊은 숙지 → 사용자 일괄 위임 "스탭5 수행→커밋만" = gate #3 standing go). SSOT = DEC-2026-06-03-codegraph-deliverable-wiring.md §13.

### 공백 — context-cache neighborhood 가 2-방향만 (callees 부재)

context-federator 의 `attachCallersImpact` 는 심볼에 `callers`(상류 1-hop) + `impact`(하류 transitive blast)만 부착하고 **`callees`(하류 1-hop = 내가 직접 호출하는 협력자) 부재.** codegraph 0.9.6 CLI 에 `callees <symbol>` 실재(`callers` 와 byte-동형 출력) → SQLite edge 유도 불필요한 **CLI-native 최소증분**.

### 시행 범위 — 단일 축 callees enrichment (STEP1 11→2·STEP2 5→2·STEP3 4→1·STEP4 6→1 칼날 동형)

- `federator.js`: adapter `callees` + `attachCallersImpact` 부착(`withCallees` 게이트 / callers 대칭) + symbolsInFile(strict_path) 심볼 동형 + `stats.callees_resolved` 해소율.
- `context-cache.schema.json`: `code_refs.symbols.items.callees`(symbolRef 배열 / callers 와 byte-동형) + `stats.callees_resolved` **additive**.
- `cli.js`: `--no-callers` 가 callers+callees 1-hop 쌍 동반 off.
- 2번째 산출물 `code-graph.json`(self-coverage / `edges_by_type`) = **carry**(secondary 산출물 cut 선례 동형).

### trust 가드 — check38 (release-readiness 37→38 / federator 첫 trust 가드 / check34~37 4-part isomorphic)

`context_cache_reference_lens_trust`: ① gate 모듈(gate-eval/findings-aggregator)에 federator/federate/callees 토큰 0 + REQUIRED_VALIDATORS 미등록 ② schema `meta.trust_note` required + symbol/code_refs 어디에도 severity 필드 부재(finding 채널 아님 구조 차단) ③ federator reference-lens 라벨 + gate 모듈 import 0 ④ non-gating 불변. (context-cache = 기존부터 reference-lens / non-gating — callees 도 같은 채널.)

### §8.1 정직 — 2 distinct 도메인 실 dogfood (no-simulation / 실 codegraph 0.9.6)

- **poc-05 (modern TS) full federate e2e**: index 4 files·33 nodes → `packs=4 symbols_resolved=41 callees_resolved=29 anchors_unresolved=0`. **Ajv schema VALID**(callees 포함) + 무회귀(`--no-callers`→callees_resolved=0 / symbols·callers·impact 보존). method callees 정확(`register`→assertAvailable/add/User · `login`→findByEmail/User).
- **poc-08 (Java Spring+MyBatis3 jpetstore) 메커니즘 corroboration**: index 62 files·996 nodes → `callees insertOrder` → `OrderMapper.xml`(MyBatis SQL 매퍼) + Order/setOrderId/getNextId/getLineItems 실 협력자 체인.
- **정직 경계**: full pack e2e = poc-05 단일 도메인 / 2nd 도메인(poc-08) = `callees` CLI **mechanism corroboration only**(poc-08 = artifact-graph 미보유 → full pack 불가). STEP 4 §12.6 "mechanism corroboration only" 선례 동형. 2nd 도메인 full e2e pack = carry(committed artifact-graph = poc-05 modern / poc-16 legacy·code_pointers=0 한정).

### 검증 / carry

- federator test 32/32(실 codegraph smoke 포함) + release-readiness 37→38(self-test 22/22) + version 3-way 12.13.0.
- carry(STEP 5+): code-graph.json self-coverage/`edges_by_type` · 2nd 도메인 full e2e pack(poc-08/poc-03 artifact-graph 생성 후) · (α)함수앵커 제안(federator 소관) · STEP 6(Modern-scoped reading-aid + openapi HIGH 잔여).

---

## [12.12.0] — 2026-06-04 MINOR — codegraph wiring STEP 4 (ast_symbol stale-anchor verify / 함수단위 추적성)

**§5 STEP 4 (impl/test ast_symbol 앵커 / 함수단위 추적성) 시행.** 4원칙 = `.claude/plans/{plan,research}-codegraph-step4.md` (3-agent: 공식문서 F-015 / 업계사례 / Senior 적대 0.84 REVISE + 실 `.codegraph` DB probe → 사용자 gate #3 "4-A 지금 시행" 결단). SSOT = DEC-2026-06-03-codegraph-deliverable-wiring.md §12.

### negative-space — code-pointer-validator 가 못 하는 symbol 실재 검증

`code-pointer-validator` 는 `ast_symbol` 앵커에 대해 **path 존재만 확인하고 symbol 실재는 검증 안 함**(`validator.js` "symbol 검증은 AST parser 외부 / warn-only"). codegraph(AST 심볼 인덱스 보유)가 이 정확한 공백을 reference-lens 로 채움 = STEP 1~3 coverage-hole 의 **역방향 set-diff**: 산출물 ast_symbol 앵커 ∖ codegraph 심볼 = **stale/dangling anchor** ("산출물 앵커有 / 코드 심볼無").

### 시행 범위 — 단일 축 `--verify-anchors` (Senior 6산출물→1축 / STEP1 11→2·STEP2 5→2·STEP3 4→1 칼날)

- `collect.js` **`collectSymbolAnchors`**(provenance 보존 — Set 평탄화는 출처 소실로 역방향 불가 / collectRefs 무회귀).
- 신규 `tools/codegraph-coverage/src/anchor-verify.js`(순수): `enumerateNodes(SYMBOL_KINDS=class/interface/function/method/enum/type_alias)` → byQn2(끝2세그 Class.method)+byName(bare) 인덱스 → 앵커 매칭. live(실재) / stale(file 인덱싱됨+symbol 부재) / **informational**(앵커 file 미인덱스 = codegraph 사각: iBATIS2 sql/xml·동적·미지원 언어·freshness stale·path 부재).
- `cli.js` `--verify-anchors` 모드(coverage 와 분리 self-contained early-exit / 비차단 exit 0). 앵커 0 = **unverified note**(method-axis 'impl-spec 부재=unverified' 동형 / false-health 회피).
- (α) "파일앵커→함수 제안"은 **federator `symbolsInFile` 소관 = 전면 cut**(Senior jurisdiction / 중복 회피). (γ) skill emit·traceability dead-cell·artifact-graph blast-radius = carry.

### informational(codegraph 사각) 구조적 절단 (STEP 3 패턴 동형)

앵커 file 이 codegraph 미인덱스 = codegraph 정직 사각. 부재 ≠ stale → **`informational_notes[]`로 격리** — schema **severity 필드 부재 + additionalProperties:false** + `toAnchorFindings` 가 **stale_anchors 만 순회**(informational 도달 불가) + check37. "not a defect / 부재≠stale" 명시.

### trust 가드 — check37 (release-readiness 36→37 / check34·35·36 4-part isomorphic)

`codegraph_anchor_verify_reference_lens_trust`: ① gate-eval/findings-aggregator anchor-verify 토큰 0 + **REQUIRED_VALIDATORS_PER_STAGE 미등록**(Senior / verify 리포트가 stage 필수 validator 격상 ❌) ② schema informational_notes severity 부재 + findings.severity ⊆ {low,medium} ③ anchor-verify.js 상위 차단등급 리터럴 0 + 'not a defect/부재' 마커 + reference-lens 라벨 ④ anchor-verify.js gate 모듈 import 0. severity ceiling low|medium(stale=medium / `SEVERITY_CEILING`/`pinSeverity` 재사용).

### §8.1 정직 경계 — mechanism corroboration only (data-corroboration 아님)

- 전 dogfood 도메인 ast_symbol 앵커 = **0**(strict_path/glob 만) → **in-the-wild stale 미관찰(unverified)**. STEP 1~3 식 "2-도메인 data-corroborated" 주장 ❌ (fake corroboration 회피).
- **메커니즘은 real-symbol probe 2-도메인 입증**(no-simulation / 실 `.codegraph` DB): 실존 심볼 2 + 비실존(indexed file) 1 + codegraph-blind(xml) 1 주입 → RealWorld(Spring) **live 2/stale 1/informational 1** + ecommerce(NestJS) **live 2/stale 1/informational 1** 정확 분류 (true-positive + true-negative + 사각 격리). STEP 1 route-axis "0/19 true-negative" 프레이밍 동형.

### 검증 (no-simulation / 실 CLI)

- codegraph-coverage test 64→79 (anchor-verify 15) + workspace **1195 pass / 0 fail** + release-readiness **37/37**(self-test 21/21) + version 3-way 12.12.0 + build dist v12.12.0.
- 실 Ajv(`ajv/dist/2020`): verify 리포트 valid + finding severity='high' INVALID(enum cut) + informational severity 추가 INVALID(additionalProperties:false cut) = gate-leak 구조 차단 입증.
- 신규 schema `code-anchor-verify.schema.json`.
- official-docs(F-015): codegraph `NODE_KINDS` 에 class/interface/function/method/enum/type_alias 실재 / symbol-existence 내장 CLI 부재(직접 set-diff 정답) / Figma Code Connect non-existent node-id 검증 = 미구현 오픈이슈(#337) → STEP 4 가 먼저 해결.

### carry (STEP 5~6)

- (α) 함수앵커 제안(federator 소관) · (γ) skill ast_symbol emit · traceability dead-cell green · artifact-graph code blast-radius · in-the-wild stale(ast_symbol 앵커가 실제 산출물에 도입된 후 재측정) · STEP1~3 carry 유지(iBATIS2 sql-blind / table-blind / method 2nd full-density 도메인 / module-SCC·layer-violation) · STEP 5(context-cache 증분) · STEP 6(Modern-scoped reading-aid + openapi HIGH 잔여).

---

## [12.11.0] — 2026-06-04 MINOR — codegraph wiring STEP 3 (module dependency coverage-hole / 결정론 corroboration lens)

**§5 STEP 3 (architecture / 4-렌즈 분석의 유일한 R) 시행.** 4원칙 = `.claude/plans/{plan,research}-codegraph-step3.md` (workflow `wf_b66c8b85-e4a` — official-docs / industry / Senior 적대 0.85 REVISE / synthesis → 사용자 gate #3 3-결단 승인). SSOT = DEC-2026-06-03-codegraph-deliverable-wiring.md §11.

### "대치" 라벨 정정 (Senior must-fix#1 / 3-결과 만장일치)

DEC §3·§5 의 architecture "유일한 진짜 R(대치)" 라벨 = **"거짓 자기최면" → "module dependency coverage-hole / 결정론 corroboration lens"로 개명**. arch.json 을 codegraph 가 덮는 게 아니라(Option B = trust 경계 붕괴 + onlyArch 사각 소실로 LLM 근사보다 퇴화 → reject), codegraph 결정론 cross-file edge 로 arch.json 의 의존그래프를 **corroborate + LLM 놓친 의존 노출**. **arch.json 무수정 / analysis-architecture SKILL codegraph 호출 0** (Option A = STEP 1·2 reference-lens 동형).

### 시행 범위 — (a) dependency coverage-hole 1축 단독 (Senior must-fix#2 / §8.1 / STEP1 11→2·STEP2 5→2 칼날)

- 신규 `tools/codegraph-coverage/src/module-graph.js` (순수): codegraph cross-file edge(`calls/references/instantiates/extends/implements`, source.file≠target.file 둘다 내부) → architecture.json modules[] 로 file→module rollup → module→module 그래프 → arch.json dependencies[] set-diff. **imports edge 명시 제외**(target=importing 파일 placeholder 실측 / industry 정합).
- `coverage.js` buildModuleAxis + `cli.js` module axis(기본 axes += module / architecture.json read + `enumerateEdges` 재사용) + `render.js` module 섹션.
- **path-format 정규화**(must-fix#4): `normalize.js` normalizeFile 재사용 + `fileInModule`(src-prefix suffix-tolerant) → RealWorld(repo-relative) + ecommerce(src-relative) **2-도메인 동일 코드경로**.
- (b)module-SCC·(c)layer-violation·(d)inventory = **carry STEP4+** (blob over-claim / module layer=LLM 비결정 입력 / inventory=detect.js 중복).

### onlyArch(codegraph 사각) 구조적 절단 (Senior must-fix#3 / 3중 강제)

arch.json有/codegraph無 의존(런타임 DI/decorator/config 와이어링 = codegraph 정직 사각)은 **`informational_notes[]`로 데이터 격리** — ① schema `moduleAxis.informational_notes.items` **severity 필드 부재 + additionalProperties:false** (구조적 promote 불가) ② `toFindings`/`toPromoteReadyFindings` 가 **holes 만 순회**(onlyArch 도달 불가) ③ check36 회귀가드. "부재 ≠ 거짓 / not a defect" 명시. (ecommerce onlyArch 7건 전부 →CONFIG·COMMON = hole 보고시 거짓양성 즉시 over-claim 회피.)

### trust 가드 — check36 (release-readiness 35→36 / check34·35 4-part isomorphic)

`codegraph_module_reference_lens_trust`: ① gate-eval/findings-aggregator module-axis 토큰 0 ② schema informational_notes severity 부재(onlyArch finding 채널 구조 차단) ③ module-graph.js high/critical 리터럴 0 + render.js 'not a defect/부재' 마커 ④ module-graph.js gate 모듈 import 0. severity ceiling low|medium(`SEVERITY_CEILING`/`pinSeverity` 재사용 / module hole = low).

### 검증 (no-simulation / 실 CLI / 2 distinct 도메인)

- **module axis 2-도메인 corroborated**: RealWorld(Spring+MyBatis3) **module 43 / corroborated 21 / hole +22 / informational 0** + ecommerce(NestJS+Prisma) **module 16 / corroborated 8 / hole +8 / informational 7**. 둘 다 동일 코드경로 재현(§8.1) + 실 Ajv schema-valid + finding-system conditional(module low+code_graph_ref valid / high INVALID).
- codegraph-coverage test 48→64 (module-graph 16) + workspace **1180 pass / 0 fail** + release-readiness **36/36**(self-test 20/20) + version 3-way 12.11.0.
- official-docs(F-015): codegraph module-dep/SCC/circular 내장 CLI 부재 confirmed / provenance=null 은 'tree-sitter' 명시생략(공식값 아님) — STEP 3 코드는 provenance 미사용(cross-file edge 존재만) → 무영향.

### carry (STEP 4+)

(b) module-SCC cycle(blob over-claim / path-format 민감 / STEP2 call-cycle 함정 동형) · (c) layer-violation(module layer LLM 비결정) · (d) inventory corroboration·centrality · onlyArch DI vs config 의미 분류(semantic) · module-axis 2nd full-density 도메인(arch.json modules[] 부재=unverified) · STEP1 carry 유지(iBATIS2 sql-blind / table-blind / NestJS route↔OpenAPI / TS interface) · STEP 5~6(4-렌즈 로드맵 잔여). DEC §11.

## [12.10.0] — 2026-06-04 MINOR — codegraph wiring STEP 2 (finding 채널 / codegraph→finding-list)

**codegraph wiring 로드맵 STEP 2 시행** (DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 2 / §10 실행 로그). "finding 채널 (codegraph→finding-list)". research(workflow 7-agent: investigation 3 + official-docs/industry/Senior 0.80 + synthesis)가 **진입점 메모 'cycle·orphan seed = 본체' 를 실측 반증** (STEP 1 의 핸드오프 2사실 반증 선례 동형) → 정직한 minimal core = **신규 seed 종류가 아니라 2-mechanism 어댑터/배선**. release ❌ 아님 — 본 MINOR.

- **(1) coverage-hole → finding-system promote-ready export** (`tools/codegraph-coverage/src/finding-export.js` 신규 / `--emit-findings` 플래그): STEP 1 이 이미 산출하는 route+method coverage-hole(F-CGCOV)을 finding-system shape **promote-ready 레코드**로 emit — `discoverer:'codegraph'` + `code_graph_ref` + `status:'candidate'`. **decision (c)** — 자동 seed 는 reference-lens 산출물에 두고 finding_id 는 **사람이 promote 시 F-XXX 배정** (자동 ledger emit ❌ / seed_id 로만 추적). 신규 seed 계산 0 (STEP 1 출력 재포맷).
- **(2) finding-system.schema.json `code_graph_ref` optional additive + conditional severity ceiling**: `allOf` if-then(`code_graph_ref` 보유 ⟹ `severity` ⊆ {low,medium}) — STEP 1 enum-cut ceiling 을 finding-system 에 이식 (사람이 codegraph 발 finding 을 high/critical 등재 구조 차단). `discoverer` 는 자유텍스트 'codegraph' (enum 격상 ❌ = 권위 누출 회피 / 사용자 결단). **기존 finding(code_graph_ref 부재) 회귀 0** (실 Ajv 3-fixture discrimination 입증).
- **(3) handler-set reading-aid** (implements/extends 전수 / `enumerateEdges` 신규): error-mapping 보조. **ecommerce(NestJS) 1-도메인 정직표기** (implements \*ExceptionHandler×3 + 예외계층 extends — handler-relevant 태깅 / RealWorld(Spring) implements=Repository·extends=test-base noise 필터 / v12.6.0 IMPL 옵션2 선례). reading-aid 채널 — finding 아님 / gate inject ❌ / http_status·mechanism 분기 = semantic carry.
- **cycle·orphan seed = 전면 carry (STEP 3+)** (사용자 결단): 양 도메인 실 DB 직접 쿼리 = **false-positive 압도** (orphan survivor 전부 live = @DgsComponent GraphQL/JUnit/DI 주입 메서드 / cycle = 정상 재귀·sibling wrapper). 근본원인 = codegraph call-graph 해소 불완전(provenance null 다수). in-degree 0 → dead 단정 = no-simulation 위배. 업계 6도구(knip/dependency-cruiser/NDepend/SonarQube/ArchUnit/shipmonk) + 공식문서(synthesized=heuristic provenance) 만장일치 corroborate.
- **trust 경계 (불변)**: codegraph finding 은 `REQUIRED_VALIDATORS_PER_STAGE` 절대 미등록(findings-aggregator 는 validator 출력만 severity-count) + severity ceiling low|medium + finding-export/enumerate gate 모듈 import 0 → 결정적 gate 누출 구조 차단.
- **회귀 가드 check35** `codegraph_finding_reference_lens_trust` (release-readiness 34→35 / check34 4-part isomorphic): ① gate-eval·findings-aggregator STEP 2 토큰 0(code_graph_ref/toPromoteReadyFindings/enumerateEdges/finding-export) ② finding-system.schema.json code_graph_ref⟹severity conditional 구조 ③ finding-export.js SEVERITY_CEILING 재사용(상위등급 리터럴 0) ④ finding-export·enumerate gate-import 0.
- **§8.1 정직 경계** (no-sim 실 dogfood 2 distinct 도메인): coverage-hole route axis = 2-도메인 corroborated / method axis = ecommerce 1-도메인(4/64 promote-ready seed 실 산출) / handler-set = ecommerce 1-도메인 정직표기.
- **검증** (no-sim/실 CLI): codegraph-coverage test 28→48 (finding-export 18 + enumerateEdges 4 + 실 Ajv conditional 3-fixture) + workspace **1164 pass / 0 fail** + release-readiness **35/35** (self-test 19/19 / 실 workspace spawn 35/35 ready) + version 3-way 12.10.0 + 2 도메인 실 dogfood --emit-findings (RealWorld seeds 0+handler-set / ecommerce seeds 4+handler-set). 4원칙 (plan-codegraph-step2 + research-codegraph-step2 → workflow 7-agent → 사용자 4-결단 gate #3 묶음 승인).
- **carry (STEP 3+)**: cycle·orphan seed (call-graph provenance 해소 개선 후) · error-mapping http_status/mechanism(semantic) · handler-set 2nd Spring 도메인 · domain orphan-repo(semantic) · antipatterns ARCH cycle(detected_by enum) · artifact-graph code→requirement orphan(직교/inject 금지) · F-CGCOV↔F-XXX promote 번호정책. DEC §3 line 44 'sanctioned 채널 본체' 문구 = 본 시행으로 정정(§10). DEC-2026-06-03-codegraph-deliverable-wiring.

## [12.9.0] — 2026-06-03 MINOR — codegraph wiring STEP 1 (code→artifact coverage-hole 공통 메커니즘)

**codegraph 가 인덱싱되나 어떤 산출물 추출에도 미배선이던 gap 의 첫 해소** (DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 1). 신규 도구 `tools/codegraph-coverage/` (28번째 workspace) — codegraph `.codegraph/codegraph.db` 의 코드 엔티티(route/method) 전수 열거 ∖ 산출물 code-ref = **"코드有 산출물無" coverage-hole** 을 **비차단 reference-lens** 로 산출. trust 경계 절대 유지 (결정적 gate inject ❌).

- **2-axis 최소 코어** (Senior 적대 0.82 / §8.1 과적합 회피 — DEC 11 deliverable → route+method 2축으로 축소, 나머지 9 carry): ① **route** (code route ∖ {AC openapi_path · discovery · impl source_files}) ② **method/symbol** (public method ∖ {impl-spec source_files · code_pointers}). 2축이 사실상 openapi·discovery·AC·behavior·test·impl ref 를 동시 커버 = DEC "공통 메커니즘".
- **enumerate = SQLite 직접 read** (`SELECT … FROM nodes WHERE kind=?` / federator `symbolsInFile` adapter 패턴 동형 / CLI `query --kind` 은 LIMIT cap=50 불완전 → 회피 / official-docs raw src 확인). PRAGMA `table_info` probe → codegraph schema 불일치 graceful. node:sqlite (Node≥22.13).
- **research 가 핸드오프 2 사실 반증** (Senior no-sim 실 `.codegraph` DB 쿼리): ① route 노드 name 에 **HTTP verb 저장됨** (`"GET /articles/{slug}"`) ② ecommerce NestJS/TS **이미 실 인덱스 존재** (721노드). plan/DEC 정정 반영.
- **detectability matrix** per-(axis×stack) 3-state (detectable/unverified/undetectable) — "Modern only" blunt gate ❌ (route/method 는 legacy Spring 4.1 도 작동 / sql axis 만 iBATIS2-blind / table 보편 blind). detectable 셀만 per-entity hole, 나머지 = 정직 note (false-positive 회피 / Specmatic·knip undetectable-bucket 선례).
- **false-positive 필터** (Senior 실측 노이즈 경고): route exclusion (`/actuator`·`/error`·`/swagger-ui`) + dynamic route(SpEL/`${}`) downgrade + path-param 정규화 (`{slug}`·`:id`→`{}`) + method noise (ctor·getter·setter·equals·hashCode·toString·serialize·main·lifecycle) + non-public(Java) + data-class 파일(`.dto.ts`·`.entity.ts`) skip. **method 의미성 게이트** — impl-spec 부재 시 unverified (test-spec=테스트파일·discovery/AC=요구사항 = production-impl 전수 anchor 아님 → hole 폭증 회피).
- **trust ceiling 코드+구조 강제** (Senior must-fix / §2 invariant 를 prose→코드): coverage-hole = severity **low|medium 만** (route=medium·method=low). render.js `SEVERITY_CEILING=Object.freeze(['low','medium'])` + schema `severity` enum=`["low","medium"]` 구조적 차단 → findings-aggregator(차단등급만 gate-block) **gate leak 구조적 차단**. **freshness 배너** (codegraph DB mtime vs source — stale 시 false-health 경고 / display-only).
- **회귀 가드 check34** `codegraph_coverage_reference_lens_trust` (release-readiness 33→34 / check31·33 동형): gate-eval·findings-aggregator coverage 토큰 0 + render.js ceiling 코드(상위등급 리터럴 0) + schema enum ⊆ {low,medium} + cli.js reference_lens:true.
- **§8.1 정직 경계** (no-sim 실 dogfood 2 distinct 도메인): **route axis = 2-도메인 corroborated** (RealWorld Spring+MyBatis3 0/19 hole + ecommerce NestJS+Prisma 0/30 hole = 완전 커버 true-negative / 메커니즘 입증). **method axis = ecommerce 1-도메인** (4/64 hole — `JwtExceptionHandler.handle` 등 impl-spec 미커버 common/ 실 관찰 / RealWorld=impl-spec 부재 unverified 정직). interface/sql/table axis = carry (STEP 2~6).
- 신규 schema `code-coverage-hole.schema.json` (top-level additionalProperties:false strict / schema-validator 2 도메인 리포트 valid). 새 test 28 (coverage 음성대조·severity ceiling·실 SQLite fixture·CLI spawn) + self-test 34 discrimination.
- **검증** (no-sim/실 CLI): codegraph-coverage 28 + self-test 34 + workspace 0 fail + release-readiness **34/34** + version 3-way 12.9.0 + 2 도메인 실 dogfood schema-valid. 4원칙 (plan-codegraph-step1 → 6-agent investigation + 3-agent research[official-docs/industry/Senior 적대 0.82] → 사용자 "2축 최소·둘다 corroboration·구현+release" 승인).
- **carry**: 9 deliverable 약축 STEP 2~6 (db-schema=table-blind / business-rules·antipatterns=semantic / characterization-sql=iBATIS2-blind) · method axis 2nd full-density 도메인 · openapi.yaml verb-단위 직접 diff (YAML 파서 — 무의존성 유지로 JSON 산출물 경유) · NestJS route↔OpenAPI 완전성·TS interface(=1) unverified · codegraph schema 결합(PRAGMA 완화 잔여). DEC-2026-06-03-codegraph-deliverable-wiring.

## [12.8.0] — 2026-06-03 MINOR — dep-graph trace-view (사람 gate-검토용 view-time 렌더러 / 옵션 A+B)

**dep-graph(artifact-graph.json / 운영 SSOT)를 사람 gate #1~#5 검토용으로 view-time 렌더 — `chain-driver trace-view` 신설.** 통증: 사람 검토가 raw json 위에서 일어남(v12.0.0 ADR-011 L54 가 정직하게 인정한 carry `C-on-demand-viz` / L29 DEFER 의 사람-눈 절반). navigate(쿼리 단위 = 노드 하나)와 분리하여 stage/feature 조망 + UC→단계 coverage hole 을 stdout Markdown 으로. SSOT = `decisions/DEC-2026-06-03-dep-graph-trace-view.md` (4원칙 = `.claude/plans/dep-graph-trace-view.md` → 3-agent research(테크기업 선례+렌더링기술+Senior 적대 0.78) → 사용자 결정 "옵션 A+B / 정직 개명" → "진행").

- **신규 `trace-view` 서브커맨드** (`tools/chain-driver/src/trace-view.js` + cli.js 배선): `trace-view --graph <path> [--scope <id>] [--no-matrix] [--json]`. 출력 4블록 = freshness 배너(stale 시 ⚠️) → stats 요약(graph.stats) → **map 뷰(A)** feature별 UC→BHV→AC→TASK→TC→IMPL 인접 + `⚠ hole` 인라인 → **coverage 매트릭스(B)** 행=UC 열=각 단계 셀=✓(도달)/✗(미도달·stage 존재)/`–`(stage 부재).
- **순수 formatter (새 그래프 순회 0)**: 기존 `analyzeImpact`/`topKImpactRoot`/`graph.stats`/`checkGraphFreshness` 재사용 = self-referential corrective drift 위험 최소. 의존성 0 (graphviz/JS 라이브러리 불필요).
- **5대 제약 정합**: json-SSOT(read-only) / **on-demand stdout only — 파일 write 0 / git commit 0**(committed mirror = v12.0.0 가 죽인 .md/.mermaid drift-repeat = REJECT / ADR-011 L29 sanctioned view-time 경로) / no-engineification(stateless formatter / 서버·auto-render ❌) / reference-lens(display-only / gate inject ❌) / minimal-additive(breaking 0).
- **회귀 가드 check33 `trace_view_reference_lens_trust`** (release-readiness 32→33): content-aware — gate-decision 모듈(gate-eval + findings-aggregator)에 trace-view 토큰 0 + trace-view.js gate 모듈 import 0(import 문 정밀 매칭 / trust 주석 false-positive 회피) + reference_lens:true 라벨. check31(with-spec) 동형. self-test 33/33 + check33 discrimination it.
- **정직 명명 (사용자 결정)**: '설계도/blueprint' ❌ → `[traceability-map]` — 그래프 내용 = 요구사항→구현 추적성 (시스템 아키텍처 아님 / 아키텍처 슬라이스 = analysis-architecture 노드뿐). audience-expectation mismatch 회피.
- **LLM 절반 = YAGNI 명시**: `navigate --stage --json`(+`--with-spec`)가 이미 holistic 구조 뷰 제공(RealWorld 116노드 실측) → LLM 타깃 자산 신설 ❌ / trace-view = 사람-눈 전용.

**MINOR 정당성**: 신규 서브커맨드 + release-readiness criterion(check33) 추가 / 공개 API·schema·산출물·노드 스키마 무변경 / breaking 0 (check31=v12.3.0 MINOR precedent). **검증 (no-simulation / 실 CLI)**: §8.1 = **2 distinct 실도메인 corroboration** — RealWorld(116노드 / UC→TC 매트릭스 ✓ / IMPL 부재 `–`) + ecommerce(138노드 / 풀체인 IMPL ✓) 실 render + 음성대조 poc-16(TASK/TC/IMPL `–`). IMPL 열 = ecommerce 1 실도메인 정직 표기(v12.6.0 IMPL 옵션 2 선례). 신규 test 18(trace-view.test.js / map·매트릭스 셀·hole 탐지·stale 배너·--no-matrix·--json·graceful) + chain-driver 320→338 + release-readiness 32→33 + version 3-way 12.8.0. **부수**: docs/dependency-graph.md §4-1 stale `matrix.{json,md,mermaid}` 문구 v12.0.0 doc-drift 정정. **carry**: 시각 다이어그램(옵션 C / SVG·인터랙티브 HTML — 사람이 텍스트 뷰 "조망 부족" 실측 호소 후 trigger) · `--stage` 필터(navigate 경유) · Mermaid subgraph emit. DEC-2026-06-03-dep-graph-trace-view.

## [12.7.0] — 2026-06-03 MINOR — ③ Type 2 (A) `${CLAUDE_PLUGIN_ROOT}` 경로 치환 (plugin-install 실 배포버그 fix + check32 회귀 가드)

**출하 skill 17 + agent 5 의 본문 실행 경로가 repo-relative(`node tools/...`)라 plugin-install 시 cwd=사용자 프로젝트에서 미해소 = 실 배포버그(Type 2 차단) → `${CLAUDE_PLUGIN_ROOT}/` prefix 일괄 치환.** STATUS 다음 의제 ③ Type 2 (A) frontier (dep-graph 루프 무관 / 자율 가능 prod-value). SSOT = `decisions/DEC-2026-06-03-plugin-root-path.md` (4원칙 = `plan-plugin-root-path-fix.md` → 공식문서 raw fetch + Senior 적대적 0.88 → 사용자 "진행/MINOR" 승인).

- **공식문서 기계 검증 (F-015 raw fetch)**: plugins-reference.md L630 "All [path vars] are substituted inline anywhere they appear in **skill content, agent content**, …" + L632 "${CLAUDE_PLUGIN_ROOT}: the absolute path to your plugin's installation directory." → skill/agent 본문의 `${CLAUDE_PLUGIN_ROOT}`는 install 절대경로로 inline 치환 = 모델이 실경로를 봄 = prefix 가 정답. (claude-code-guide sub-agent 가 "확장 ❌" 오답 → 자기 인용 문서와 모순 → raw fetch override = F-015 cross-validation.) precedent =`hooks.json`+ dep-graph-navigator + static-security 가 이미 **unquoted**`${CLAUDE_PLUGIN_ROOT}/tools/...` 출하 중.
- **시행 (4 클래스 / 22 파일 / 52 치환 / byte-preserving CRLF)**: ① `node tools/...` → `node ${CLAUDE_PLUGIN_ROOT}/tools/...` (17 skill + 5 agent) ② `bash tools/...sh` 동형 (3 skill) ③ `--schemas schemas/` **drop** (schema-validator 미인식 플래그 / `--schema-dir` default = 번들 자동 해소 / 2곳) ④ `ls templates/...` → `ls ${CLAUDE_PLUGIN_ROOT}/templates/...`. **unquoted** (Senior must-fix #1 = hooks.json precedent 일치 / 모델이 명령 구성 시 인용 / 경로 공백 일률 처리는 hooks 포함 별도 follow-up).
- **회귀 가드 check32 `shipped_repo_relative_tool_path`** (release-readiness 31→32): content-aware grep `skills/` + `agents/`, `(env-prefix)*(node|bash) ["']?(tools|scripts)/` 가 `${CLAUDE_PLUGIN_ROOT}` 미포함 시 FAIL / env-prefix(`PYTHONUTF8=1` 등) 허용(Senior must-fix #2) / `allow-repo-path:` 주석 예외. self-test 15→16 (discrimination it: bare/env-prefix/bash=violation / prefixed/prose/allow-repo-path=OK).
- **scope-out (별도 carry / Senior must-fix #4)**: human-facing 문서(`guides/` 16 + `templates/adoption/README.md` 5)의 `node tools/` = `${CLAUDE_PLUGIN_ROOT}` 가 human 셸에 미주입 → prefix 가 오히려 깨뜨림 → literal install-path 또는 "도구는 skill 자동 실행" 프레이밍 = 별도 설계 (F-EXT-PATH-DOCS finding 등재). check32 는 human 문서 미스캔(model-executed skill/agent 한정).

**MINOR 정당성**: 신규 release-readiness criterion(check32) + 사용자-facing 동작 fix(install 실행 경로) / 공개 API·schema·산출물·노드 스키마 무변경 / breaking 0 (check30=v11.29.0·check31=v12.3.0 MINOR precedent). **검증 (no-simulation / 실 CLI)**: skill-citation **0 stale**(203 scanned / `${CLAUDE_PLUGIN_ROOT}` 경로 비-citation 확인) + release-readiness **32/32**(check32 green / 실 repo 0 violation) + self-test **16/16**(discrimination 실증) + workspace **1098 pass/0 fail** + build dist + grep dist literal `${CLAUDE_PLUGIN_ROOT}` 토큰 보존(Senior must-fix #3 / cpSync verbatim) + version 3-way 12.7.0 + CLAUDE/README sync + git diff CRLF 노이즈 0(byte-preserving 50+/50-). **carry**: human-facing 문서 경로(F-EXT-PATH-DOCS) · Type 2 실 측정(사내 팀 self-serve 1 cycle / 측정=0) · agent `model: opus` pin(저tier 외부 / 별도) · SessionStart hook bash-only(Windows .ps1 / 별도). DEC-2026-06-03-plugin-root-path.

## [12.6.0] — 2026-06-03 MINOR — dep-graph 의도③ `navigate --with-spec` 확장: TASK/TC/IMPL 본문 (chain leaf 6 subkind 대칭)

**dep-graph 의도③ `navigate --with-spec` 의 본문 reference-lens 를 plan/test/implement stage leaf 로 확장 — UC/BHV/AC(v12.3.0) → + TASK/TC/IMPL = chain leaf 6 subkind.** navigate 가 노드 영향 트리만 주던 한계를 v12.3.0 가 UC/BHV/AC 본문으로 풀었으나, plan/test/implement stage 노드(TASK/TC/IMPL)로 navigate 하면 `available:false "미지원"` 만 떠 동일 소비 통증이 남아 있었음. graph-synthesizer 가 이미 TASK/TC/IMPL 노드에 source_path 를 UC/BHV/AC 와 **대칭 배선**해 둠(실측) → synthesizer 무변경 / `SPEC_SUBKIND_CONFIG`(`chain-driver/src/cli.js`) 에 3 entry 추가만. SSOT = `decisions/DEC-2026-06-03-living-graph-with-spec-task-tc-impl.md` (4원칙 = `plan-dep-graph-with-spec-task-tc-impl.md` → Senior 적대적 0.86[must-fix A/B/C] → 사용자 옵션 2 승인).

- **시행** (frozen-config 3 entry): TASK(`tasks[]` / scalars[description·**behavior_ref**·layer·module·execution_order] / arrays[ac_refs·tc_refs·dependencies]) + TC(`test_cases[]` / scalars[type·framework·framework_status·ac_ref·bhv_ref·expected_outcome·test_intent·source_file]) + IMPL(`modules[]` / scalars[framework·layer·stack·commit_hash] / arrays[tc_refs·bhv_refs·source_files]). 기존 `readSpecBody` graceful(`if entry[k]!=null`/`isArray`) + `capSpecArray` 5-cap 재사용.
- **Senior must-fix 반영**: A(TASK `behavior_ref` 추가 = required trace 필드) + C(TC `expected_outcome`·`test_intent` = "기대 스펙값(실행 결과 아님)" 표기 / 코드상 gate-eval 는 reconcile 사전계산값만 소비 = raw TC 필드와 단절).
- **IMPL 정직 표기 (사용자 옵션 2 / Senior B override)**: IMPL corroboration = **ecommerce 1-도메인만**(RealWorld·react-fsd IMPL=0 / chain5 env-blocked). impl-spec.schema 필드명은 도메인-무관 계약이라 기계적 작동은 보장되나 **Java/Gradle IMPL 실 shape 검증 = carry**(RealWorld chain5 unblock 자연 close). 2-도메인 주장 ❌. TASK·TC 는 2 distinct 도메인(RealWorld Spring/JUnit + ecommerce NestJS/Prisma) corroborate = §8.1 충족.
- **trust 무변경**: config 추가는 `SPEC_SUBKIND_CONFIG` 내부만 → check31(`spec_body_reference_lens_trust`) spec-token 0(gate-eval/findings-aggregator) + readSpecBody 호출부 1곳 + reference_lens:true 그대로 통과(실측). carry 경계 = EPIC/STORY/OP·analysis/aspect 미지원 유지.

**MINOR 정당성**: 신규 navigate 표면 확장(additive config) / 공개 API·schema·산출물·노드 스키마 무변경 / synthesizer·readSpecBody algorithm 무변경 / breaking 0. **검증 (no-simulation / 실 CLI·실 그래프)**: 새 test 3 + 미지원 테스트 TASK→EPIC 전환(navigate-cli 53→56) + 실 dogfood render 실측(RealWorld TASK-USER-001·TC-USER-001 + ecommerce IMPL-AUTH-001[source_files cap "+2 more"] + carry 경계 analysis-architecture→available:false) + withSpec off 회귀0 + chain-driver 320 + workspace **1098 pass/0 fail** + release-readiness **31/31**(check31 green 유지) + version 3-way 12.6.0 + CLAUDE/README sync. **carry**: IMPL 2nd distinct 도메인 shape 검증 · 임베딩 의미검색(NL 라우팅) · what-if 확장(deprecate-node·remove-edge·add-node) · EPIC/STORY/OP 본문 · 의도①④(codegraph 코드축). DEC-2026-06-03-living-graph-with-spec-task-tc-impl. Extends DEC-2026-06-03-living-graph-spec-body.

## [12.5.0] — 2026-06-03 MINOR — dep-graph 의도③ (b) what-if: `navigate --what-if` (가설 변경 영향 / in-memory 비파괴)

**dep-graph 의도③ "질의 → 영향 + 스펙 + 코드"의 가설(what-if) 진입 — `chain-driver navigate --origin X --what-if "<op>"` 신설.** navigate 는 기존 노드의 영향만 봄 → "이 artifact 를 **삭제하면** 뭐가 끊기나 / 이 의존성을 **추가하면** 영향이 어떻게 커지나" = 그래프에 **아직 없는 변경**을 물을 수 없었음. `--what-if` 가 사용자 명시 가설 op 을 **in-memory 사본**에 적용해 baseline 대비 영향 diff 를 결정론 계산. SSOT = `decisions/DEC-2026-06-03-living-graph-what-if.md` (4원칙 = plan-dep-graph-what-if → Senior 적대적 리뷰 0.82[value 정직 판정 = gold-plating 경계] → 사용자 "순서대로 진행" 승인).

- **Senior gold-plating 경계 (value_assessment 정직 판정 → scope 축소)**: "Genuine but NARROW — not gold-plating IF scoped to core_two." navigate --origin 은 이미 "기존 노드 변경 영향"을 답함 → what-if 의 유일한 marginal value = **그래프에 아직 없는 변경 시뮬레이션**. 정확히 2 op 이 이를 전달 → **v1 scope = core_two (remove-node + add-edge)**. deprecate-node(impact tree 로 reproducible)·remove-edge(niche)·add-node(phantom 노드 = under-specified) = **carry** (§8.1 self-overfitting / external pull 필요).
- **시행** (`chain-driver/src/cli.js cmdNavigate`): `--what-if "<op>"` (op = `remove-node:ID` | `add-edge:SRC>TGT[:edge_type]`) → ① op 파싱·검증(대상 부재·미지 edge_type → exit 3) ② **`structuredClone(graph)`** 사본에만 op 적용(원본·파일 무변경 = do_not_edit_manually 계약) ③ `analyzeImpact`(pure)로 가설 영향 → baseline(원본) 대비 grade 별 delta(added=newly reachable / removed=newly orphaned) ④ `result.what_if = {op, kind, unsaved:true, hypothetical_by_grade, delta}` + text 블록. `--origin` 필수(가설 변경 후 특정 노드 영향 diff / op-target 와 다를 수 있음). origin == 제거 대상 = **graceful exit 3**("downstream consumer 를 --origin 으로").
- **trust선 (triage DEFER 근거 정면 수용)**: 그래프 파일 write **절대 ❌**(in-memory 사본만) / 가설 = **op 문자열이 SOLE source**(LLM/heuristic 엣지 추론 ❌) / "가설 / 미저장"(`unsaved:true`) text·json 양쪽 라벨. **D4 grep-gate = skip**(write 경로 구조적 부재 → near-zero / Senior) → 대신 **불변성 unit test**(원본 그래프 파일 byte-identical + baseline result.impact 가설 무관 = 진짜 trust enforcer).

**MINOR 정당성**: 신규 CLI 플래그(additive) / 공개 API·schema·산출물·노드 스키마 무변경 / 본체 algorithm(analyzeImpact pure) 무변경 / breaking 0. **검증 (no-simulation / 실 CLI·실 그래프)**: 새 test 11(remove-node delta+unsaved / add-edge delta+edge_type / 불변성[파일 byte-identical] / baseline 불변 / 결정론 provenance / origin==제거대상 graceful / 대상부재 / 미지 edge_type / 미지원 op carry / text 라벨 / 회귀0) + **mechanism corroborated on 2 internal dogfood 도메인**(RealWorld remove-node→newly orphaned + add-edge→newly reachable / ecommerce 동형 / 둘 다 self-dogfood = external adopter pull deferred / prod validation overclaim ❌) + workspace **1095 pass/0 fail** + release-readiness **31/31** + version 3-way 12.5.0. **carry**: 의도③ what-if 잔여(deprecate-node·remove-edge·add-node = external pull 게이트) · 임베딩 의미검색(NL 라우팅) · TASK·TC·IMPL spec 본문 · 의도①④(codegraph 코드축). DEC-2026-06-03-living-graph-what-if. Extends DEC-2026-06-03-living-graph-nl-routing.

## [12.4.0] — 2026-06-03 MINOR — dep-graph 의도③ (a) NL 라우팅: `navigate --prompt` (자연어 → 노드 결정론 해소)

**dep-graph 의도③ "질의 → 영향 + 스펙 + 코드"의 자연어 진입 — `chain-driver navigate --prompt "<자연어>"` 신설.** 기존 navigate 는 `--origin <node-id>` 정확 id 필수 → 리뷰어가 "회원가입 관련 뭐 바뀌나"를 물으려면 id 를 이미 알아야 함. `--prompt` 로 자연어에서 노드를 **결정론 substring 매칭**(id/title/symbol/file)해 해소. SSOT = `decisions/DEC-2026-06-03-living-graph-nl-routing.md` (4원칙 = plan-dep-graph-nl-routing → Senior 적대적 리뷰 0.86 + main empirical fact-check → 사용자 "순서대로 진행" 승인).

- **recon 발견 (triage 가정 REFUTE / no-simulation 실측)**: triage 는 "저위험 / `resolvePromptToNodes`(federator) 재사용 glue" 라 봤으나, 실측 — `resolvePromptToNodes` 는 `isAnchoredOrigin`(code_pointers>0) 후보만 매칭 + title 매칭 부재 → dogfood 체인 노드(UC/BHV/AC = code_pointers_na)엔 부적합(prompt "BHV-USER-001 회원가입" → BHV 미반환 / "회원가입" → 빈결과 / anchored 31/116 뿐). → federator scoring 을 `_shared/prompt-node-match.js` 로 일반화.
- **시행**: ① `_shared/prompt-node-match.js` 신설 — `matchPromptToNodes(prompt, candidates, {topN, includeTitle})` (id-full+5 / id-part+1 / **title+2** / symbol+3 / file+2 / 결정론 sort) + `isConfidentTop`(strong≥3 AND unique). graph-freshness `_shared` 추출 선례 동형. ② **federator** `resolvePromptToNodes` = `matchPromptToNodes(p, selectOriginNodes(...), {includeTitle:false})` 위임 → 거동 **byte-identical**(federator 29 test 무회귀). ③ **navigate** `--prompt` — traversable(active/drift) 전 노드 + `includeTitle:true` (selectOriginNodes 의 anchored 필터 ❌ = REFUTE 근본원인 / Senior must-fix #2).
- **tie/약매칭 degrade (Senior must-fix #1)**: confident(top.score≥3 AND 동점 아님) 만 top-1 자동 탐색 / tie 또는 약매칭 = **list-only**(후보+점수 노출 후 종료 / 오답 권위화 차단). `--prompt`+`--origin` = origin 우선 + `skipped_reason`(silent drop ❌). `--prompt`+`--stage` = rollup 우선.
- **정직한 한계**: 결정론 substring only — 의미·동의어·임베딩(예 "로그인"↔"signin") 매칭 ❌. 한글 산문+식별자 0 = 빈 결과 graceful("식별자/제목 substring 만 / 동의어·임베딩 ❌"). 임베딩 의미검색 = carry.

**MINOR 정당성**: 신규 CLI 플래그(additive) + 신규 `_shared` 모듈 / 공개 API·schema·산출물 무변경 / federator 거동 byte-identical / breaking 0. **검증 (no-simulation / 실 CLI·실 그래프)**: 새 test 21(matchPromptToNodes 단위 12[id/title/symbol/file/tie/빈/includeTitle:false 거동동결] + navigate --prompt 통합 9[명시id auto·title tie list-only·title+idpart auto·0매칭 graceful·origin우선·with-spec조합·stage rollup우선·text·회귀0]) + federator 29 무회귀 + **2 distinct 도메인**(RealWorld "BHV-USER-001"→auto / "회원가입"→tie list-only + ecommerce 동형) + workspace **1084 pass/0 fail** + release-readiness **31/31** + version 3-way 12.4.0. **carry**: 의도③ 잔여 (b) what-if(가설 변경 영향 / in-memory 비파괴+사용자 명시입력) · 임베딩 의미검색 · TASK·TC·IMPL spec 본문. DEC-2026-06-03-living-graph-nl-routing. Extends DEC-2026-06-03-living-graph-spec-body.

## [12.3.0] — 2026-06-03 MINOR — dep-graph 의도③ 첫 슬라이스: `navigate --with-spec` (스펙 본문 lazy-read / reference-lens)

**dep-graph 의도③ "질의 → 영향 + 스펙 + 코드"의 스펙 본문 절반 — `chain-driver navigate --with-spec` 신설.** 기존 navigate 는 영향 트리(BFS)·centrality·code anchor 는 줬지만 **노드의 스펙 본문(title 조차)을 안 노출** → 리뷰어가 "이 `BHV-USER-001` 이 뭘 하나?"를 알려면 source 파일을 직접 grep 해야 했음(소비 루프 P0 통증 / `project_living_dep_graph_two_loops` — navigate 가 답을 다 줘야). 본 release 가 `--with-spec`(default off) 로 노드의 source 파일에서 UC/BHV/AC 본문을 **lazy-read** 해 reference-lens 로 표시. SSOT = `decisions/DEC-2026-06-03-living-graph-spec-body.md` (4원칙 = plan-dep-graph-spec-body → 2-agent research[Senior 적대적 0.83 + 코드사실 F-015 독립검증] → 사용자 승인 D1·D4).

- **방향 (4원칙 §2 — Senior REVISE@0.83 + 사실검증)**: display-only / 결정론 fs read / additive / 회귀 0. **본문 = reference-lens — 어떤 결정적 gate(gate-eval/s2-outcome-check/findings-aggregator)에도 inject ❌** (DEC-2026-05-28 §4.2 codegraph trust 동형). **리뷰 최대 수확 = 회귀 1건 사전 차단**: 원안은 절대 `source_path`(dogfood 실측 common case)를 `existsSync` 없이 `readFileSync` 직행 → stale/타머신 절대경로에서 uncaught throw → navigate 비정상 exit = 회귀. → `existsSync` 가 **모든 후보(절대 포함) gate**(graceful `{available:false}`).
- **시행**: `chain-driver/src/cli.js` — (1) `--with-spec` 플래그 + `SPEC_SUBKIND_CONFIG`(UC=use_cases/actors·pre·post / BHV=behaviors/invariants / AC=criteria/gherkin) **subkind 별 field-exhaustive** cap allow-list (2) `resolveSpecSource` hybrid 해석 — graph-dir 우선(co-located 실측) → repoRoot(schema 계약) → basename(lossy) → cwd / existsSync 전 branch gate (3) `readSpecBody` → `result.spec`(top-level / node 무변경 = 회귀 0) + text `spec 본문 (reference-lens / gate 주입 ❌)` 블록. 길이 cap=5 초과분 `… (+N more)` 정직 표기(silent truncation ❌ / 모든 배열 균일). UC/BHV/AC 외 subkind·source 부재·id miss·parse 실패 = graceful `{available:false, reason}`. rollup(`--stage`/`--scope`) + `--with-spec` = origin-mode 분기 前 라우팅 → 본문 폭증 없음(spec 키 부재).
- **trust 강제 (사용자 D4 / Senior trust_model_ok=false 해소)**: 라벨은 주석일 뿐 → **release-readiness check31 신설**(content-aware): gate-eval + findings-aggregator 에 spec-body accessor 토큰 0(음성) + cli.js `readSpecBody` 호출 1곳(cmdNavigate 단일 / gate 경로 cmdNext 침투 차단) + `reference_lens:true` 라벨(양성). reference-lens 가 aspirational → enforceable.

**MINOR 정당성**: 신규 CLI 플래그(additive) / 공개 API·schema·산출물·노드 스키마 무변경 / breaking 0. **검증 (no-simulation / 실 CLI·실 그래프)**: 새 test 12(3 subkind 본문 + 회귀0 off + cap 경계 5/6 + source부재 graceful + id miss + 미지원 + rollup spec-키부재 + text 라벨 / navigate-cli.test.js 21→33) + **2 distinct 도메인 corroboration**(§8.1 — display-class 단일 ship 안전이나 본문필드 일반성: RealWorld[Spring/JUnit] UC/BHV/AC 본문 + ecommerce[NestJS/Prisma] BHV·AC gherkin 실 render = shape match) + workspace **1063 pass/0 fail** + release-readiness **31/31**(check31 신설) + version 3-way 12.3.0. **carry**: 의도③ 잔여(what-if=propose producer 부재 DEFER / NL 라우팅=resolvePromptToNodes 재사용 glue DEFER / TASK·TC·IMPL 본문 + UC discovery-spec 외 채널) · 의도①④(codegraph 코드축 통합) · 의도② session-lazy auto-resync(REJECT 현시점). DEC-2026-06-03-living-graph-spec-body. Extends DEC-2026-06-03-living-graph-resync-cmd.

## [12.2.0] — 2026-06-03 MINOR — dep-graph Loop A lazy 재합성: `chain-driver resync-graph` (STALE 배너 nudge → 한 명령 재합성)

**dep-graph 의도② "프로젝트 변경이 그래프에 담긴다"(P0 동기화)의 lazy 재계산 절반 — `chain-driver resync-graph` 신설.** v12.1.0(B-minimal)이 채운 "stale 표시"(SessionStart `⚠️ STALE` 배너)의 짝으로, 사용자가 stale 을 보고 **한 명령으로 그래프를 재합성**하는 action 을 제공. 기존엔 8-flag `traceability-matrix-builder --graph --discovery … --behavior … --analysis-dir … --previous-graph …` 를 손으로 조립해야 했음. SSOT = `decisions/DEC-2026-06-03-living-graph-resync-cmd.md`.

- **방향 (4원칙 §2 — 직전 라운드 research 재활용 + Senior 0.84)**: 공식문서(Nx/Bazel/Turborepo/Sourcegraph)·산업사례 일관 — **"stale 표시 + lazy(use-time) 재계산 > per-change 즉시 덮어쓰기"**. **per-write 자동 재합성(A-full) = Senior REJECT** — PostToolUse 는 stateless·debounce 불가 → 매 편집 전체 재합성 = quadratic 함정 + commit-에-그래프-자동덮어쓰기 fixture 오염. **C(자동 apply-drift) = 소비자 0 P0 역전 + fixture 가드 부재로 DEFER 유지.**
- **시행**: `chain-driver/src/cli.js cmdResyncGraph` — (1) **convention 입력-탐색**(기존 artifact-graph.json 위치 또는 `.aimd/output` 의 well-known chain 6 파일 `discovery-spec/behavior-spec/acceptance-criteria/task-plan/test-spec/impl-spec` + analysis/aspect scan) — scope manifest 는 chain 입력 경로를 모름(canonical 5종만 / work-unit.js) = "그래프에게 자기 입력이 어디 있는지 가르치기"가 본 슬라이스의 핵심 (Senior 발견) (2) `traceability-matrix-builder --graph --previous-graph <현재>` **위임**(전체 재합성 / propose·deprecated carry-over / cross-package import 회피=plugin 상대경로 spawn) (3) **caller cwd 만 write** — verdict-free / 비-gating / 단일 도메인 안전. behavior+acceptance 부재(analysis-only / migration-start) = **graceful 거부 exit 3**(그래프 없음 정직 안내 / DEC-2026-06-03 §1.1). watch-item #1 — `N/6 stage 입력` coverage 라인 노출(silent under-synth 방지).
- **정직한 범위**: 이건 **on-demand "한 명령" 재합성**(lazy)이지 per-write 자동이 아님(의도적 / 위 근거). mtime over-report 시 불필요 invoke 가능하나 수동이라 tolerable(content-hash 정밀화 = carry).

**MINOR 정당성**: 신규 CLI 명령(additive) / 공개 API·schema·산출물 무변경 / breaking 0. **검증 (no-simulation / 실 CLI·실 그래프)**: 새 통합 test 4(정상 5/6 재합성 + carry-over + analysis-only graceful exit 3 + dry-run no-write / real cli.js spawn → 내부 matrix-builder 재-spawn) + **2 distinct 도메인 corroboration**(§8.1 — RealWorld 실 resync nodes=116/edges=173 + ecommerce 실 resync nodes=138/edges=202 matrix 30 green / dogfood = repo 밖 scratch) + workspace **1050 pass/0 fail** + release-readiness **30/30** + version 3-way 12.2.0. **carry**: C-living-graph-autotrigger 잔여(A-session-lazy 자동주입 = auto-write 가드+≥2도메인 / C 자동 apply-drift = consumer+guard 선행) · content-hash freshness · 의도③(스펙본문/what-if/NL) · 의도①④(codegraph 코드축 통합). DEC-2026-06-03-living-graph-resync-cmd. Extends DEC-2026-06-03-living-graph-a1-surface.

## [12.1.0] — 2026-06-03 MINOR — dep-graph Loop A 동기화 첫 슬라이스: SessionStart 배너 freshness 노출 (stale 그래프 false-health 방지)

**dep-graph "프로젝트 변경이 그래프에 담긴다"(P0 동기화 루프)의 첫 소비 슬라이스 — SessionStart 컨텍스트 배너가 그래프 freshness 를 정직 노출.** 기존 `buildGraphSessionContext`(chain-driver SessionStart 주입)는 `node.state==='drift'` 만 보고 freshness 를 무시 → `synthesized_at` 이후 source 가 변경된 **stale 그래프를 "N nodes / 0 drift"(건강)로 거짓 보고**(false-health). 실측(no-simulation / 실 CLI): poc-05 그래프 = 3 source(task-plan/business-rules/antipatterns)가 `synthesized_at`(2026-05-28) 이후 변경됐는데 SessionStart 배너는 0 drift 보고. 본 release 가 `checkGraphFreshness` 결과를 배너에 `⚠️ STALE` 로 prominent 노출하여 해소. SSOT = `decisions/DEC-2026-06-03-living-graph-a1-surface.md` (4원칙 = plan-living-dep-graph → 3-agent research[공식문서/산업사례/Senior 0.93] → 사용자 승인).

- **시행**: ① `tools/_shared/graph-freshness.js` 신설 — `checkGraphFreshness`(fs mtime / `child_process` 무관 = SessionStart hot-path 경량)를 `code-pointer-validator/src/validator.js` 에서 추출(DRY 단일 출처 / `_shared` 컨벤션 정합). validator.js 는 re-export → export 표면·소비처(cli.js #16)·test 무변경(무회귀). ② `chain-driver/src/cli.js buildGraphSessionContext` 가 stale 시 `⚠️ STALE — N source 변경(basename) → 재합성: traceability-matrix-builder --graph` 를 node-count 직후 prepend. **display-only — 자동 재합성·drift write ❌** (결정론 fs / 사람이 기존 `--graph` 로 수동 재합성 / trust 선 = 배너 동급 non-gating).
- **DEFER 유지**(능동 착수 ❌ / Senior 설계리뷰): **A**(PostToolUse 증분 재합성 / hot-path 새 코드·`previousGraph` 부분재합성 미검증) · **C**(자동 `--apply-drift` / 소비자 0 = "동기화 without 소비" P0 역전 + committed-path fixture 오염 가드 부재 = Senior REJECT) · **B2-full/A4/A5/B5 gate**(§8.1 ≥2 distinct 도메인). mtime over-report 정밀화(content-hash) = 별도 carry.
- **정직한 scope 한계**(over-promise 회피): `detectContentDrift` 는 HEAD-relative → 미커밋(WIP) production 코드 변경은 `--worktree` 없이 미탐지 = "commit granularity 에서 live"(실시간 sync ❌). SessionStart 에 stage-entry 이벤트 부재 → B2-full 은 본질적으로 coarse.

**MINOR 정당성**: additive 신규 동작(freshness 노출) + 신규 `_shared` 모듈 / 공개 API·schema·산출물 무변경 / breaking 0 (v11.20.0 Living dep-graph v1 = MINOR 선례 정합). **검증 (no-simulation)**: 새 통합 test 2(stale→STALE / fresh→경보없음 / real cli.js hooks-bridge spawn) + code-pointer-validator 45(재export 무회귀) + chain-driver 268 + workspace **1046 pass/0 fail** + release-readiness **30/30** + version 3-way 12.1.0. **carry**: C-living-graph-autotrigger 잔여(A 증분 재합성 / B2-full 자동주입) · content-hash freshness 정밀화 · 의도③(스펙 본문/what-if/NL 라우팅 / 신규 후보) · 의도①④(codegraph 코드축 통합 / 대형 legacy §8.1). DEC-2026-06-03-living-graph-a1-surface.

## [12.0.1] — 2026-06-02 PATCH — context-federator codegraph 코드 반쪽 Windows 복구 (F-FED-WIN-001)

**PATCH** — context-federator 의 codegraph 파일→심볼 해소가 **Windows + Node 22.5~22.12 에서 마비**(~9% / 7-of-79 앵커)되던 버그 fix. dogfood Q1 검증("산출물↔코드 연결")에서 발견 — codegraph 인덱스는 정상(`query "PurchaseService"`=20 심볼)인데 federator 가 못 읽던 글루 버그. **root-cause 2종**: ① `node:sqlite` flag-gating (v22.5~22.12 `--experimental-sqlite` 필요 / **v22.13+·v23.4+·24 unflagged** — official-docs) → `symbolsInFile` 죽고 fuzzy stem-query fallback(controller 만 매칭·service 못 함) ② Windows 백슬래시 `cgRel` vs codegraph DB forward-slash 저장 → `WHERE file_path = ?` 0행(실측 fwd=20행/back=0행). **fix (4원칙 / official-docs + Senior REVISE@0.84)**: `codeRefForAnchor` 의 `cgRel` 를 `.split(sep).join('/')` 정규화 — adapter 아닌 **core 배치**로 fake-adapter 순수 회귀테스트 가능 / unresolved note 오귀인 수정 + adapter `sqliteReader` 노출 + CLI honest hint. node:sqlite = **Node ≥22.13 권장** (re-exec machinery ❌ / §8.1 단일 Node-minor 거동 회피 / 사용자 결단). **부수**: federator 테스트 Windows red 7건 해소 — legacy-data fixture POSIX-절대경로 하드코딩 이식성화(`resolve(repoRoot, …)` / production legacy half 는 Windows 정상 = RealWorld `data_refs=11` 실증) + smoke `node:sqlite` 부재 honest-skip 가드. **검증 (no-simulation)**: ecommerce 재federate `symbols 42→349 / unresolved 80→24`(code half 9%→~72% / 잔여 24 = src 밖 .sql·test·prisma 16 + glob 디렉터리 8 = 정직) / federator 28→29(Windows 28 pass+1 skip / flag 29/29 / pre-existing #5 회복 / 무회귀) / workspace **1043 pass / 0 fail** / release-readiness **30/30** / version 3-way 12.0.1 / breaking 0. 공개 API·schema·산출물 무변경. **carry**: C-q3-hard-scenario(대형 repo·깊은 chain Q3 재검증) · C-codegraph-precision(bare-symbol generic-명 위양성 / `impact "remove"`=111노드 / reference-lens 라 gate 무개입 유지) · Windows-CI(다른 도구 path 이식성). DEC-2026-06-02-fed-win-001-slash-fix.

## [12.0.0] — 2026-06-02 MAJOR — json-only 산출물 (.mermaid + .md twin 폐기 / ADR-008 Superseded / ADR-002·009·FE-002·charter R7 Amend / ADR-011)

**committed deliverable/phase-flow `.mermaid` + deliverable `.md` dual-rendering twin 을 전면 폐기하고 산출물을 `.json` 단독 SSOT (완전 AX-native) 로 전환.** P0(AX 운영 / 산출물 = LLM 운영 컨텍스트) 이동 + LLM-무관 실측(2 distinct domain RealWorld·ecommerce: 모든 검증 도구가 json 만 입력으로 read / `.md`·`.mermaid` twin = LLM 운영 컨텍스트 0 기여 + 2차 렌더링 drift 표면만 추가)으로 ADR-008 two-eyes 사상 완전 역전 (honest self-reversal / corrective drift 아님). SSOT = `decisions/DEC-2026-06-01-json-only-ax-native.md`.

- **거버넌스**: ADR-008(이중 렌더링) **Superseded by ADR-011** + ADR-002(7대 산출물 사람용 column 폐기)·ADR-009(retitle "산출물 신뢰 모델" / §2.3·2.4 diagram rung moot / 도구 종류 구분·no-simulation SSOT UNCHANGED)·ADR-FE-002(FE 사람눈 .mermaid retire / visual snapshot-hash UNAFFECTED)·plugin-charter R7(manifest.json 단독) **Amend** + **ADR-011 신설**.
- **C1** schema ADDITIVE — cosmetic 흡수처(relationship_label/note/detail) + `migration-cautions.schema.json` 신설.
- **C2** skill/agent/builder `.mermaid`+`.md` twin emit 중단 + ADR-011 신설.
- **DT-json** decision-table grid → formal-spec.json `decision_grids[]` 흡수 (DMN-inspired / 문서용 / hit_policy 만 DMN 어휘 차용).
- **C3** 원자 BREAKING cut — drift-validator `.json↔.mermaid` pair-mode 4 모듈 폐기 + JSON-only handoff detector(`check-handoff-consistency.js`) + `flows/artifact-registry.json`.
- **C4** `.mermaid`+`.md` twin 파일·flow 토큰·template 삭제 + check21 template count finalize.
- **C5** schema `.mermaid`/`.md` path 필드 7 schema 제거(diagram_files/rendered_mermaid_path/rendered_md_path/consistency_report_file/rendered_paths) + examples 23 data 재emit + cosmetic 흡수(poc-01 9 FK relationship_label — 삭제된 erd.mermaid edge 라벨 git 복원 / 날조 0).
- **C6** 거버넌스(ADR supersede/amend + DEC + INDEX).
- **C7** lifecycle-contract 대수술 + deliverables/workflow twin-emit 산문 제거 (json 단독). figure(```mermaid 블록)·functional report(violations/test-report/conflicts/types.d.ts/error-mapping/sql-inventory)·findings.md = KEEP. category-C figure 삭제 = 사용자 결정으로 DROP (drift 무관·무해·미관 churn).
- **C8** version 12.0.0 3-way(plugin.json+package.json+CHANGELOG)+CLAUDE.md sync + STATUS/INDEX.

**MAJOR 정당성**: schema optional 필드 제거 + 실 산출물 재emit 필요 + ADR-008 supersede + charter R7 amend = breaking paradigm. **carry**: 사람 gate-검토 prose `.md` → raw `.json` (on-demand viz DEFER) · poc-03 `.validation/drift-result.json` stale pair-mode artifact 정리.

## [11.33.0] — 2026-06-01 MINOR — S2(AX전환 주 타깃) gate WARN→block 격상 (§8.1 ≥2 distinct domain 충족: RealWorld + ecommerce / s2_outcome_mismatch hard-block)

**S2(AX전환 = 주 타깃) gate 의 `s2_outcome_mismatch` 를 WARN(go-with-warnings 허용) → block(hard-block / 사용자 'go' 거부)으로 격상. 자격 게이트 = §8.1 ≥2 distinct domain S2 execution corroboration — 직전 1/2(RealWorld Spring/JUnit) → ecommerce(NestJS+Prisma+jest / e-commerce 도메인)로 2/2 충족. WARN 은 v11.11.0 부터 명시적 임시 placeholder("corroboration 0 동안 WARN ... ≥2 후 격상")였고 본 release 가 계획된 maturation.**

- **behavioral note (override 계약 변경 / breaking 아님 / MINOR)**: S2 시나리오 chain 4(test)에서 `outcome_mismatches > 0`(characterization 이 GREEN 아니거나 augmentation 이 RED 아님) 시, **이전엔 사용자 'go' 로 go-with-warnings 전진 가능 → 이제 hard-block('go' 거부 / user_override_rejected)**. S2 scenario 에만 영향 / S1·greenfield·S3 무영향 / API·schema·config signature 무변경 (chain-driver gate-eval 내부 / typescript-eslint 'internal-only=minor' 선례).
- **시행 (gate decision flip / breaking 0)**: `gate-eval.js` — ① **`HARD_BLOCK_CODES` Set 신설**(`validator_critical`/`validator_high`/`s2_outcome_mismatch` / Senior REVISE @0.88 — `hasCriticalOrHigh` 술어 의미 오염 회피 / layer2_threshold·coverage_threshold·findings_unverified WARN 의도 명시 분리) ② `applyUserDecision` 가 `HARD_BLOCK_CODES.has` 검사 ③ `severityRank.s2_outcome_mismatch: 2 → 1`. `scenario.test.js` WARN 테스트 block 반전 + isolation 회귀 추가(layer2/findings_unverified 여전히 go-with-warnings).
- **2차 corroboration (no-simulation / 실 jest + 실 모듈 / 본 session 직접 실행)**: ecommerce `npx jest` = **56 char GREEN** 재현 + `PurchaseService.refund()` 미구현 augmentation spec(TC-PURCHASE-REFUND-001) → 실 jest **RED** + gate harness(실 correlateByTcId/reconcileOutcomes/evaluateGate import) → 정상 S2 `outcome_mismatches=0` blocked=false / 음성대조 `outcome_mismatches=1` blocked=true(s2_outcome_mismatch) / 격상 후 'go'→block. RealWorld `DELETE /user` isomorphic.
- **검증**: chain-driver 268→**269**(+1 isolation) / test-impl-pass-validator 59 / findings-aggregator 31 / workspace **1049 pass/0 fail** / release-readiness **30/30** / version 3-way 11.33.0 / breaking 0.
- **§8.1**: 실 외부 repo(ecommerce) 실 jest 실행 measurement-driven = self-referential 아님(주 타깃 S2 gate advisory→enforcing) / ≥2 충분(≥3=speculative hardening=cooling-off 폐기 위반) / round-trip 불요(carry 분리). **carry ① WARN→block RESOLVED**.
- **잔여 carry**: distinct **문제** 도메인 S2 corroboration(3rd / 현 RealWorld blog + ecommerce e-commerce = 2 distinct) · committed PoC graph cosmetic lag · Type 2 외부 채택. DEC-2026-06-01-s2-gate-block-upgrade.

## [11.32.0] — 2026-06-01 MINOR — dep-graph synthesizer: FE kinds code-pointer 앵커 (type-spec/ui-ux/form-validation source_file → strict_path / F-FE-ANCHOR-001 / 실 React+TS dogfood)

**FE 3rd-codebase dogfood (`yurisldk/realworld-react-fsd` React 19 + TS + Zod + React Query / FSD) 가 표면화 — FE 산출물(type-spec/ui-ux/form-validation)은 `source_file` 필드 보유하나 `ANALYSIS_TO_CODE_POINTERS` 에 미배선(BE kinds 만) → dep-graph 에서 FE analysis 노드가 na(미앵커). BE slice 2~4(sql-inventory/architecture/antipatterns/db-schema)의 FE 대응 gap.**

- **변경 (additive / breaking 0)**: `graph-synthesizer.js` `ANALYSIS_TO_CODE_POINTERS` 에 FE kinds 3종 accessor 배선 — type-spec `types[].source_file` / ui-ux `pages[]`+`components[].source_file` / form-validation `validations[].source_file` (mode file / prefixes [''] / 확장자게이트 .ts·.tsx + existence-gate + commit_hash 스탬프 → A2 참여). state-map/visual-manifest = source 필드 부재 → 영구 na (미배선 유지).
- **검증 (no-simulation / 실 CLI)**: graph-synthesizer +6 test(FE-1~6 emit/2-array/backstop/existence/commit_hash) → builder 149→155 / workspace **1048 pass/0 fail** / release-readiness 30/30 / version 3-way 11.32.0. **실 react-fsd dogfood**: FE 산출물 3종 schema-valid(captured_by=manual_extraction 정직 / ts-morph 미실행) + dep-graph FE 노드 **BEFORE na:true(0) → AFTER covered(type-spec 6 + form-validation 3 + ui-ux 8 = 17 strict_path / commit_hash 969709a 스탬프)**.
- **§8.1**: FE-kind 앵커링 mechanism 입증(단위 test + 실 FE 코드베이스). 도메인=RealWorld(BE dogfood 와 문제 도메인 겹침) / **distinct FE 스택·코드베이스**(React·TS vs Java·Spring) 충족 — "distinct 문제 도메인" 은 별 carry. **② "FE kinds" carry RESOLVED**.
- **잔여 carry**: state-map/visual-manifest 영구 na(앵커 대상 아님) · committed PoC graph cosmetic lag(v11.31.0) · S2 gate WARN→block · Type 2 외부 채택. DEC-2026-06-01-fe-anchor-001.

## [11.31.0] — 2026-06-01 MINOR — dep-graph synthesizer Layer 4: cross_links.to_analysis_artifacts → cross_reference edge (F-ECOM-004 graph orphan 해소)

**② ecommerce-backend dogfood 가 표면화한 F-ECOM-004 — graph-integrity FAIL (orphans=5: analysis-architecture/domain/db-schema/form-validation/error-mapping = edge 0). root cause: graph-synthesizer 가 discovery/behavior 의 spec-level `cross_links.to_analysis_artifacts`(generic 산출물 path 리스트)에서 cross_reference edge 를 합성 안 함 — Layer 1(br_refs)/2(analysis 자체 ref)/3(meta.related_chain_ids) 만 edge화 → 특정 ref 가 없는 analysis 노드가 orphan.**

- **변경 (additive / breaking 0)**: `graph-synthesizer.js` **Layer 4** 신설 — discovery/behavior/operational-task 의 `cross_links.to_analysis_artifacts` → `ANALYSIS_BASENAME_TO_KIND` 역매핑(파일명≠kind: api/db-schema/ui-ux + alias openapi.yaml/db-schema.json) → `analysis-{kind}` → layer anchor(정렬 첫 UC/BHV/OP id) cross_reference edge. dangling guard(analysisLoaded + nodeIds.has) + dedup(기존 cross_reference key) + fan-out 회피(anchor 1개 / per-item 정밀 edge 는 Layer 1). `ANALYSIS_BASENAME_TO_KIND` const 신설 + `ANALYSIS_SUBKINDS`/`ANALYSIS_BASENAME_TO_KIND` export.
- **B(enforcement) = 기존 graph-integrity-validator**: orphan=hard-FAIL 이 이미 enforcement (chain-coverage 에 filesystem coverage 검사 신설 ❌ — poc-16 orphan=0 정상인데 db-schema 미참조 false-positive 회피). Layer 4 가 to_analysis_artifacts 를 edge 통로로 만들어 "미참조 → orphan → FAIL"이 의미를 가짐.
- **검증 (no-simulation / 실 CLI)**: graph-synthesizer +5 test(emit/dangling/dedup/anchor부재/basename drift-guard) → builder 144→149 / workspace **1042 pass / 0 fail** / release-readiness **30/30** / graph_integrity #13(poc-05) 불변 / version 3-way 11.31.0. ecommerce 실 그래프 측정: orphan **5→2**(Layer 4 단독 / domain·error-mapping·form-validation 해소) **→0**(+discovery·behavior to_analysis_artifacts 완전체 보정 = architecture·db-schema) / graph-integrity passed:true. dogfood findings/stats = F-ECOM-004 resolved.
- **잔여 carry**: committed poc-05/16 그래프 snapshot = Layer 4 edge cosmetic lag(orphan 0 유지 / gate 무영향 / regen script 부재라 원본 command 없이 재생성=위험 → 유지) · F-ECOM-005(skill db-schema source_files 안내) · S2 gate WARN→block · FE kinds(BE-only repo → FE 3rd 도메인 dogfood). DEC-2026-06-01-fecom-004-orphan-edge.

## [11.30.0] — 2026-06-01 MINOR — db-schema 명명 패턴 legacy 편향 완화 (Modern ORM PascalCase/camelCase 수용 / F-ECOM-001 / ② ecommerce-backend dogfood 표면화)

**② ≥2 distinct 도메인 dogfood (`alvaromrveiga/ecommerce-backend` NestJS+Prisma+PostgreSQL / Type 1.5) 가 표면화 — `schemas/db-schema.schema.json` 의 table·column `name` 패턴 `^[a-z][a-z0-9_]*$` (소문자 snake_case 강제) 가 Prisma 기본 매핑(model명=PascalCase `User`/`UserTokens`/`_CategoryToProduct` / field명=camelCase `userId`/`urlName`/`discountPercentage`) 을 첫 검증부터 RED. 1st 도메인(RealWorld MyBatis/SQLite snake_case)=통과 / 2nd 도메인(Prisma)=11+ pattern 위반 = 패턴이 우연히 legacy 명명 관행에만 맞은 편향. Modern ORM(Prisma/TypeORM default/JPA naming-strategy 미설정) 외부 사용자 차단.**

- **변경 (additive / 회귀 0 구조적 보장)**: table name(schema L32) + column name(L58) 패턴 → `^[A-Za-z_][A-Za-z0-9_]*$` (대소문자 + 선두 `_` 허용). snake*case ⊂ 신패턴 = strictly more permissive → 기존 valid schema 전부 valid 유지. 선두 `*` = Prisma 암묵 join 테이블(`\_CategoryToProduct`) 수용. description 갱신("snake_case" → "snake_case 또는 Modern ORM PascalCase/camelCase").
- **검증 (no-simulation / 실 실행)**: 구패턴 reject 단언 test 부재 확인 + ecommerce schema.json naming 위반 5→0 (통과) + workspace **1037 pass / 0 fail** (회귀 0 / v11.29.0 baseline 유지) + schema-validator canonical 40/40 + 3-way version 11.30.0.
- **② dogfood 동반 성과 (Type 1.5 / .aimd 산출물 = dogfood repo 한정 / 본 release 미포함)**: chain 1~5 완주 全 schema-valid + traceability 30 cells forward/backward 100% green + **실 GREEN 56 jest test**(RealWorld env-blocked 넘어선 chain 5 GREEN 게이트 2nd-domain 첫 실증) + A2 worktree 라이브 content_drift 탐지 + Slice4 db-schema→DDL Prisma migration 앵커(synthesizer "독립가치 ≥2 도메인 carry" 해소). §8.1 corroboration: A2/code-pointer/Slice4 = 2nd distinct domain 충족 방향.
- **잔여 carry**: F-ECOM-004 (graph orphan edge 미합성 / generic to_analysis_artifacts → cross_reference edge / RealWorld F-DOGFOOD-010 corroboration) · F-ECOM-005 (skill 본문 db-schema source_files 안내 보강) · S2 gate WARN→block(도구 자체 미실행) · FE kinds(BE-only repo → FE 2nd 도메인 부재) · Type 2(외부 사용자). DEC-2026-06-01-db-schema-naming-modern-orm.

## [11.29.0] — 2026-06-01 MINOR — Type 2 adopter corroboration 캡처 배선 (schema + packager 도구 + check30 + suggest 트리거 / EXT-CAPTURE 해소)

**Phase 1 외부-준비 감사가 capture readiness 0.08(최대 공백) 진단 — 외부 adopter(Type 2)가 chain harness 1 cycle 완주해도 결과를 담을 schema·트리거·익명화·수집경로 전무. 그 '배선'을 신설 (정직: 배선 = necessary not sufficient / Type 2 '측정'은 실 외부 adopter 실행 시 발생 / 본 release 측정=0).**

- **C1 schema** `schemas/adopter-corroboration.schema.json` (신규 / 47번째): plugin_version / adopter{opaque adopter_id, org_type} / project{opaque project_hash, stack_signals, scenario(work-unit-manifest 재사용), loc_bucket enum 고정) / chain_run{gates #1~#5 = state.last_gate shape 재사용} / findings_summary / coverage / user_feedback / anonymization{applied, redaction_count, method}. top-level `additionalProperties:false` strict.
- **C2 도구** `tools/adopter-evidence-packager` (26번째): .aimd/state.json + scope manifest + findings + matrix → 익명화 corroboration 합성 → ajv 검증 → leak guard → `.aimd/output/adopter-corroboration.json`. opaque ID = sha256(salt+id) (업계 가명화 관행 / rainbow-table 회피). **PII best-effort redaction**(email/절대경로/private-key/IP/사내host) + **post-redaction leak guard**(잔존 PII → exit 1 + 위반 필드 경로 보고). AI 추론 0% (결정론). 14 test.
- **C3 트리거 (suggest-not-autofire / consent)**: chain-driver `cmdNext` 가 gate #5(implement→terminal / `!next`) 통과 시에만 stderr auto-suggest (ticket-sync 패턴 동형 / 별도 라인) + `implement-verify-test-pass` skill step 9. adopter proprietary 코드 hash/stack 을 동의 없이 auto-write ❌ (데이터 주권 / official-docs: opt-in 업계표준 ❌[Next.js·.NET=opt-out]이나 adopter 데이터엔 consent 모델 정당).
- **C4 게이트 check30 `adopter_corroboration_capture` (release-readiness 29→30)**: schema draft-2020-12+strict + packager bin + **golden round-trip(exit 0)** + **leak-guard discrimination(poisoned --no-redact → exit 1 pii_leak)** = content-aware (file-presence ❌).
- **REVISE 5종 흡수 (Senior GO_WITH_REVISE@0.82)**: ① terminal-only 트리거(ticket-sync 충돌 회피) ② **PII regex SSOT** `tools/_shared/pii-patterns.js`(check27 import / 복사 ❌ drift attractor 회피) ③ leak-guard 필드 경로 보고(silent wall ❌) ④ loc_bucket enum 고정 ⑤ negative fixture(leak guard exit 1) anti-regression.
- **검증 (no-simulation / 실 CLI)**: packager 14 test(round-trip/redaction/leak-guard/결정론/write) + schema-validator +5(valid/required/pattern/enum/strict) + release self-test 14→15(check30 discrimination) / workspace **1037** / release-readiness **30/30** / version 3-way 11.29.0 / skill-citation 0 stale / breaking 0 = MINOR.
- **§8.1 (정직 / Senior 확인)**: forward-looking capability (corrective drift ❌ / 외부 adopter 가 필요로 하는 missing rail) — 단 green check30 ≠ "Type 2 corroboration 달성": **배선 출하 / Type 2 측정=0 / 실 adopter 대기**. EXT-CAPTURE-01·03·05 해소.
- **잔여 carry**: ② ≥2 distinct 도메인 dogfood (확정: `alvaromrveiga/ecommerce-backend` NestJS+Prisma) · ③ public-OSS 공개(조직) + preflight codegraph/gradle + `${CLAUDE_PLUGIN_ROOT}` 경로(EXT-PATH/PREFLIGHT) + ledger 산입 자동화(EXT-CAPTURE-04). DEC-2026-06-01-type2-capture-wiring.

## [11.28.0] — 2026-06-01 MINOR — README.md stale 동기화 (front door v11.1.0→현행) + drift-resistant 재구성 + version-sync 가드 (check29)

**plugin user 진입점 README 가 v11.1.0(26 버전 stale) + 카운트(skill 55·도구 22·스키마 46·770 test·22 criterion) 전부 stale → front-door 신뢰도 붕괴 (감사 EXT-MISS-08·EXT-DOC-DRIFT-01). 버전 동기화 + drift-resistant 재구성 + 재발 차단 가드.**

- **버전 동기화**: title `v11.1.0`→`v11.28.0` + `현재` 표기 + install/dist 트리 stale 버전 → `v<version>` placeholder (8 spot). 사내 GHE install URL 은 유지(사내 표준 = 현행 / public-OSS 는 별도 carry).
- **drift-resistant 재구성 (감사 EXT-DOC-DRIFT 교훈 — 카운트 재-stale 회피)**: ① 22-criterion 하드코딩 열거 리스트 → **영역별 요약 + `release:check`/`scripts/release-readiness.js` 출력 pointer**(개수 하드코딩 제거) ② 헤더·dir-tree·prose 의 브리틀 카운트(skill 55·도구 22·스키마 46·analysis 28·770 test) → 제거 또는 "CHANGELOG·/plugin 참조" 위임 ③ "분석 대상 사내 프로젝트"→"분석 대상 프로젝트"(EXT-SCOPE 중립화) ④ 라이선스 절 → `UNLICENSED` 명시(plugin.json 정합).
- **회귀 가드 check29 `readme_version_sync` (release-readiness 28→29)**: README canonical current-stamp(title `# … vX.Y.Z` + `현재 … vX.Y.Z`) ↔ plugin.json.version sync (check10/CLAUDE.md 동형). history 언급(`v9.0=`/`v11.0.0=`)·`v<version>` placeholder 는 제외 = 오탐 회피.
- **검증 (no-simulation)**: release-readiness self-test 14/14 (count 28→29 + 신규 id 등재) / **discrimination 실증**(check29 title+현재 추출·history 미추출 오탐 ❌·stale stamp 탐지) / README 잔존 `v11.1.0` 0·stale count 0 검증 / skill-citation 0 stale / workspace 1018 / release-readiness **29/29** / version 3-way 11.28.0.
- **§8.1 (정직)**: front-door 외부-노출 stale 결함 cleanup (self-referential 과 구분 — plugin user 가 실제로 받는 진입점 / EXT-MISS-08) / check29 = R2 drift enforcement (version 26-버전 stale 재발 차단). 본 release 로 ① "지금 가능한 진짜 결함" bucket **사실상 소진** — 잔여는 ②③(≥2 distinct 도메인 / Type 2 외부 채택 / public-OSS = 새 도메인·조직 결정).
- **잔여 carry**: dep-graph ≥2 distinct 도메인(A2 usability·FE kinds·A3 dogfood) · Type 2 외부 채택(43 장벽) · public-OSS 공개(조직) · README count-drift 종합 가드(현 version-only / count 가드는 브리틀로 보류). DEC-2026-06-01-readme-sync.

## [11.27.0] — 2026-06-01 MINOR — 외부-적합성 진짜 결함 cleanup (사내 신원 누출 + 깨진 license + stale adoption 템플릿) + 회귀 가드 2종

**Type 2 외부-준비 감사에서 교차검증된 출하 자산의 진짜 결함 3종 정리 (정직성 / P0 무결성 / 새 도메인 불필요) + 재발 차단 enforcement 2종.**

- **결함 1 — 사내 신원 누출 (정직성 / R15)**: `skills/ticket-sync/SKILL.md` + `skills/_base-invoke-go-stop-gate/SKILL.md` 의 example payload `"user":"sangcl@smilegate.com"` (둘 다 출하 skill → adopter LLM 이 자기 로그에 복제 위험) → `"reviewer@example.com"` placeholder. (동시: gate-log 예시의 stale `"stage_out":"planning"` → `"discovery"` 정합.)
- **결함 2 — 깨진 license 참조**: `plugin.json` `"license":"SEE LICENSE IN LICENSE"` 인데 top-level LICENSE 파일 부재(존재않는 파일 참조 = manifest 결함) → **`"UNLICENSED"`** (정직 / 사내 표준·외부 미공개 = de facto all-rights-reserved / OSS 공개 결단 = public-OSS carry).
- **결함 3 — stale adoption 템플릿 (P0 직격)**: `templates/adoption/CLAUDE.md` = v2.0.0-rc1 / SDLC 4-stage / planning-spec / gate #1~#4 (현 6-stage 대비 4 major 버전 stale). build-plugin alias → dist root CLAUDE.md = **adopter 의 첫 LLM 운영 컨텍스트** → 틀린 paradigm 주입 = P0(LLM 운영 컨텍스트) 직격 → **현 6-stage 전면 재작성**(analysis→discovery→spec→plan→test→implement / gate #1~#5 / chain N=gate #N INTERNAL CONVENTION / 4 use-scenario S1·S2·S3·greenfield / BE·FE 분리 / no-simulation R19 Tier / stack 정책 유지). **drift-resistant**: 브리틀 카운트(skill/tool/schema 개수) 하드코딩 회피(감사 EXT-DOC-DRIFT 교훈) + 도구 호출 `${CLAUDE_PLUGIN_ROOT}/...`(EXT-PATH-01) + 버전·인벤토리는 CHANGELOG 위임.
- **회귀 가드 2종 (release-readiness 26→28 / enforcement criterion — 양심 의존 ❌ paradigm)**:
  - **check27 `shipped_identity_leak`**: 출하 dir(skills/agents/templates) 사내 신원 정규식(`smilegate\.(com|net)|sangcl`) content-aware grep → 발견 시 fail (provenance allowlist `allow-identity:` 주석 예외 / Senior REVISE-B-i / EXT-MISS-01 회귀 차단).
  - **check28 `adoption_paradigm_drift`**: `templates/adoption/CLAUDE.md` 단일파일(Senior REVISE-B-ii) — 양성 assertion primary(`gate #5`/`discovery`/`implement` 포함) + 음성 secondary(`planning-spec`/`4-stage`/`4단계`/`v2.0.0-rc1` 부재). `sdlc-4stage-flow`(합법 flow) 미충돌 (EXT-MISS-06 회귀 차단).
- **검증 (no-simulation)**: release-readiness self-test 14/14 (count 26→28 + 신규 2 id 등재) / **discrimination 실증**(check27 planted 위반 탐지+allowlist 면제 / check28 stale 토큰 탐지+sdlc-4stage-flow 오탐 ❌) / skill-citation 0 stale / workspace 1018 유지 / release-readiness **28/28** / version 3-way 11.27.0. **Senior 사실 검증**: ADOPTION-README alias 비활성(:192 / Senior E-2 반증) + templates/ 내 stale 토큰은 adoption/CLAUDE.md 단독 = 단일파일 scope 정당.
- **§8.1 (정직)**: 정직성·P0 무결성 cleanup (self-referential corrective 와 구분 — 출하 자산의 외부-노출 결함 = adopter 영향 실재 / R15·P0 정합). 회귀 가드 2종 = drift enforcement (`feedback_drift_enforcement_via_release_readiness`).
- **잔여 carry**: README.md stale(v11.1.0 / 카운트·GHE-pinned URL / 별도 doc-sync — adoption 템플릿보다 P0 낮음) · Type 2 외부 채택(43 장벽 / 사용자 결단) · public-OSS 공개(조직 결정). DEC-2026-06-01-genuine-defects-cleanup.

## [11.26.0] — 2026-06-01 MINOR — dep-graph Slice 4: db-schema → DDL 앵커 (접근 C / carry ③)

**db-schema 분석 노드가 한 번도 코드에 앵커된 적 없던(항상 na) 것을, 스키마에 optional `source_files`(추출 DDL/migration 경로) 추가로 실 DDL(.sql)에 앵커 → A2 가 DDL 변경 시 db-schema drift 탐지** (db-schema = DDL 의 semantic owner / 기존 `code_pointers=N/A` 해소).

- **`schemas/db-schema.schema.json`** (additive / breaking 0): optional top-level `source_files: string[]` 신설 (required 미추가 → 4 poc + RealWorld 무회귀). description 으로 "DDL/migration .sql repo-relative 경로; ERD 는 diagram_files.erd; live 운영DB·ORM entity 는 미나열(ORM entity 는 domain.json 이 앵커)" 제약 (Senior REVISE-2).
- **`tools/traceability-matrix-builder/src/graph-synthesizer.js`**: `ANALYSIS_TO_CODE_POINTERS['db-schema'] = { mode:'file', prefixes:[''], accessor:(d)=>d?.source_files ?? [] }` (business-rules/antipatterns 동형). 기존 derive 경로(existence-gate + 확장자 화이트리스트 CODE_FILE_EXTENSIONS(.sql 포함) + commit_hash strict_path 스탬프) 재사용 → `.mmd`(erd)·미존재 = 게이트 skip → 0 해소 시 na.
- **`skills/analysis-db-schema-erd/SKILL.md`**: step4 schema.json 예시에 `source_files` + 지시(DDL/migration 추출 시 경로 나열 → 앵커 + A2 / N/A 해소) + greenfield 절(DDL 부재 → source_files 비움 → na 유지) 갱신.
- **검증 (no-simulation / 실 CLI)**: graph-synthesizer **+5 test** (source_files→strict_path / 부재→na / commit_hash 스탬프 / existence-gate / .mmd 확장자 skip) → 139→144 / workspace **1013→1018** / 0 fail / schema-validator 35/35 회귀 / release-readiness **26/26**. **additive 안전 입증**: source_files 있음·없음 둘 다 db-schema.schema.json valid.
- **RealWorld dogfood** (외부 repo / 실 CLI / probe analysis-dir): **BEFORE** db-schema `na=true`(code_pointers 0) → **AFTER**(source_files 추가) `na=false` / **covered 1 strict_path** `src/main/resources/db/migration/V1__create_tables.sql` @ee17e31(A2-eligible). code-pointer-validator covered 6→7·missing 0·analysis-db-schema findings 0. evidence = `_dogfood-realworld/.../.aimd/slice4-dbschema-ddl-probe.md`.
- **§8.1 (정직 / Senior CONCERN-D)**: ship = **메커니즘 + coverage gap 해소**(db-schema 가 이제 DDL 앵커 가능 = 일반-케이스 독립 가치). **RealWorld A2 가치 = redundant — 부풀리기 ❌**: RealWorld 선 Slice 3 antipatterns 가 이미 같은 DDL 앵커 → A2 탐지 겹침 → "covered +1" 을 새 A2 가치로 주장 안 함. **독립 A2 가치 = db-schema 가 antipatterns 와 다른 DDL 을 앵커하는 ≥2번째 distinct 도메인 carry**. read-class·additive 결정론 infra → gate-class 아님.
- **잔여 carry**: ① `source_files` `[{path,kind}]` 분해(2nd 도메인 mixed-kind drift 입증 시 / Senior REVISE-2 defer) ② ≥2 distinct 도메인 A2 usability(gate-class) ③ FE kinds 앵커(실 FE 프로젝트) ④ A3 relocation dogfood ⑤ committed↔uncommitted 분해(v11.25.0 carry). DEC-2026-06-01-slice4-dbschema-ddl.

## [11.25.0] — 2026-06-01 MINOR — dep-graph A2 working-tree 모드 (커밋 안 한 변경 탐지 / F-DF-A2-003 해소)

**A2 content-drift 가 커밋된 변경(base→HEAD)만 보던 한계를 opt-in `--worktree` 모드로 확장 — 작업 중(uncommitted) 코드 변경도 탐지** (P0 = LLM 운영 컨텍스트 live 동기화 / 개발 중 실시간 drift).

- **`tools/code-pointer-validator/src/validator.js`** (additive / breaking 0):
  - `detectContentDrift(path, hash, { gitRunner, includeWorktree=false })` — `includeWorktree=true` 면 git diff args 에서 `'HEAD'` 제거 → `git diff --name-only <base> -- <path>` = base→작업트리 (커밋된 변경 + staged + unstaged 포함 superset / git-diff(1) Form 4 "working tree relative to <commit>" / 공식문서 VERIFIED). untracked 신규파일은 미포함(추적 파일만 = 앵커 대상과 정합). 반환 boolean|null 보존 (레거시 무인자 호출 무영향).
  - `validateOnePointer` — `opts.worktree===true` → `includeWorktree` 전달 + finding 에 `worktree:true` 마커 + 메시지 부기. **kind=`code_pointer.content_drift` 유지** → `computeGateFail` 의 content_drift 제외(§8.1 non-gating)를 자동 상속 (신규 kind 신설 시 kind-필터 우회 → gating 격상 = §8.1 위반 / Senior REVISE-B).
- **`cli.js`**: `--worktree` 플래그(→ `--git` 자동) + opts 전달 + usage. **`--worktree` + `--apply-drift` = exit 2 하드 차단** (Senior REVISE-C — 미커밋 WIP 를 그래프 corpus 에 drift 로 영구 기록하면 재합성 전까지 git 오염 = 데이터 무결성 위험 / 문서 경고 아닌 코드 차단).
- **검증 (no-simulation / 실 git·실 CLI)**: code-pointer-validator **+5 test** (worktree 탐지 + `worktree:true` / committed 모드 미커밋-only 회귀가드 / args-shape spy(HEAD 유무) / §8.1 medium·computeGateFail 제외 / detectContentDrift boolean) → 40→45 / workspace **1008→1013** / 0 fail / release-readiness **26/26**(#16 = committed 모드 = 무영향). CLI smoke: `--worktree --apply-drift` exit 2 / `--worktree` 단독 exit 0 / help 노출.
- **RealWorld dogfood** (외부 repo / 실 git / read-only — 세션 57 S2 augmentation 미커밋 5파일 사전 존재): probe graph(`--repo-root --commit-hash ee17e31`=HEAD / 25 strict_path 앵커) → **committed 모드 content_drift 0** (base==HEAD, 미커밋 못 봄) vs **worktree 모드 content_drift 1** (`analysis-sql-inventory → src/main/resources/mapper/UserMapper.xml` / `worktree:true` / medium) = 미커밋 `<delete>` 변경 탐지 입증. worktree exit 0(non-gating) / `--worktree --apply-drift` exit 2 / RW src 무변경(5 M 유지) / 그래프 corpus 무오염. evidence = `_dogfood-realworld/.../.aimd/a2-worktree-probe.md`.
- **§8.1 (정직)**: read-class·additive·opt-in·non-gating (content_drift kind 재사용) → gate-class 아님. 단일 RealWorld 도메인 = uncommitted-detection **mechanism 입증** (ceiling ❌ / ≥2 distinct 도메인 A2 usability = gate-class carry 유지). self-referential 아님 (새 capability / 실 외부 repo measurement).
- **잔여 carry**: ① committed vs uncommitted **분해 보고**(2nd git call / v2 후보) ② ≥2 distinct 도메인 A2 usability(gate-class) ③ db-schema→DDL 앵커(접근 C) ④ A3 relocation dogfood ⑤ FE kinds 앵커(실 FE 프로젝트). DEC-2026-06-01-a2-worktree-mode.

## [11.24.0] — 2026-06-01 MINOR — Living-graph Slice 3: antipatterns code-pointer enrich + db-schema 파일명 drift fix

v11.23.0 후속. "나머지 analysis kind 일괄 앵커"는 **Phase 1 정직 평가로 재조정** — formal-spec/characterization-spec/state-map/visual-manifest = code-file 필드 없음(na 유지 정직 / 앵커 불가) / type-spec·ui-ux·form-validation = source_file 보유하나 RealWorld(BE) 부재 = speculative carry / 실 dogfoodable = **antipatterns 뿐**. 대신 antipatterns 앵커(실측) + **db-schema 파일명 drift(진짜 latent 버그)** 로 재조정 (사용자 승인).

### fix — antipatterns 앵커 + db-schema multi-candidate (additive)

- **`graph-synthesizer.js`** — `ANALYSIS_TO_CODE_POINTERS` 에 `antipatterns: { mode:'file', prefixes:[''], accessor:(d)=>(d?.antipatterns??[]).flatMap(ap=>(ap?.evidence??[]).map(e=>e?.file)) }` 추가. business-rules 동형 (strict_path / commit_hash 스탬프 → **A2 가 schema migration·DDL 변경 탐지**).
- **`cli.js` ANALYSIS_FILENAMES + `hooks-bridge.js` ANALYSIS_FILENAME_TO_SUBKIND** — db-schema 파일명 drift fix. canonical 출력명 = `schema.json`(skill `analysis-db-schema-erd` + poc-01/02/03/14 + RealWorld)인데 builder 는 `db-schema.json` 만 스캔 → **db-schema 노드가 어떤 그래프에도 미로드** latent 버그. → **multi-candidate** `'db-schema': ['schema.json', 'db-schema.json']` (첫 존재 채택 / schema.json 우선) + scan loop string|array 정규화 + hooks-bridge 두 파일명 모두 매핑. poc-16(CHANGELOG v11.2.0 migration = db-schema.json producer) + 나머지(schema.json) ecosystem split 양쪽 흡수 = **zero-breakage**(producer 무변경).
- **Senior 사실 정정** (feedback_senior_fact_check_supplement): Senior GO@0.84 = "db-schema.json producer 0건 → 단일 rename" 전제였으나, broader grep(CHANGELOG:627 PoC#15 migration + poc-16 graph:392 source_path)으로 **poc-16 = db-schema.json producer** 반증 → 단일 rename(poc-16 깸) 대신 multi-candidate 전환. Senior 권위 ≠ 사실 정합 보증.

### 검증 (no-simulation / 실 CLI·실 git)

- graph-synthesizer **+4 test** (antipatterns derive/na/commit_hash-stamp/existence-gate) + graph-policy-bridge **+1 test** (db-schema schema.json+db-schema.json 둘 다 → db-schema). workspace 1003→**1008** / 0 fail / release-readiness **26/26**(#16 poc-05 static 무영향).
- **RealWorld dogfood** (`--repo-root <RW> --commit-hash ee17e31`): analysis-antipatterns na→**covered (1 strict_path DDL `V1__create_tables.sql` @ee17e31 = A2 참여)** + analysis-db-schema **ABSENT→present(na)** (schema.json multi-candidate 로드 / analysis 8→9). covered **30→31** / na 85 / missing 0 / **glob_no_match 0** / 신규앵커 **0 new findings**.
- **A2 positive demo** (antipatterns DDL 앵커 baseline=root ee946e3 / `--git`): DDL **content_drift 발화** = A2 가 schema migration 변경 탐지(Slice 3 이전 = antipatterns na = inert). medium/non-gating.

### §8.1 / carry

- read-class·additive(antipatterns) + correctness fix(db-schema 노드 등장) → gate-class 아님 / MINOR(db-schema 노드 observable delta = PATCH 아님 / Senior 정합). 단일 RealWorld 도메인 = mechanism 입증(antipatterns 1 anchor = 작음 / 과대표기 ❌). **carry**: FE kinds(type-spec/ui-ux/form-validation) 앵커 = 실 FE 프로젝트 dogfood 시 / db-schema → DDL 앵커(schema source 필드 = 접근 C) / formal-spec·characterization·state-map·visual-manifest = code-file 필드 부재 = 영구 na.

DEC-2026-06-01-slice3-antipatterns-dbschema. Extends DEC-2026-06-01-slice2-codepointer-enrich.

## [11.23.0] — 2026-06-01 MINOR — Living-graph Slice 2: analysis 노드 sql-inventory + architecture code-pointer enrich (C-codepointer-analysis-aspect-enrich 해소)

v11.22.0 carry ① C-codepointer-analysis-aspect-enrich 해소. v11.22.0 가 business-rules/domain/error-mapping 노드를 실 src 에 앵커했으나 **sql-inventory(mapper resource-prefix)·architecture(dir glob)** 두 kind 는 na fall-through. Slice 2 = 두 kind 도 실 코드에 앵커 → 그래프가 **SQL mapper layer + module 디렉토리**까지 cover. sql-inventory mapper XML = strict_path + commit_hash 스탬프 → **A2 content-drift 가 SQL mapper layer 변경 탐지(실 P0 가치)** / architecture = glob dir 앵커(A2 제외 = dir-diff false-drift 회피 의도) = navigation·coverage grounding. 접근 A 연장(additive / schema·skill·CLI 무변경 / graph-synthesizer.js only). 4원칙 §2 3-agent research 만장 GO (official-docs `GO_WITH_REVISE`@0.88 / industry `GO`@0.88 / senior `GO_WITH_REVISE`@0.83 / REVISE 5종 흡수).

### fix — graph-synthesizer resolver 일반화 (additive / schema·skill·CLI 무변경)

- **`graph-synthesizer.js`** — `ANALYSIS_TO_CODE_POINTERS` 를 `kind→accessor` 에서 `kind→{mode, accessor, prefixes?}` 로 일반화. 기존 3 kind = `mode:'file', prefixes:['']` 명시 선언 = byte-identical 보존 (test 4/5 동형).
- **sql-inventory (신규)** — `mode:'file', prefixes:['', 'src/main/resources/', 'src/main/resources/mybatis/']` / accessor=`inventory[].mapper_xml`. 논리경로 `mapper/X.xml` → resource-prefix 역산 strict_path (Spring PathMatchingResourcePatternResolver / Maven Standard Layout isomorphic / research wf_8a8aa7ef). sentinel('inline'/'jpa'/'typeorm'/'prisma') = 확장자 없음 → hasCodeExtension 자동 필터. `src/main/java/` 임베디드 XML(비표준) = 의도적 scope-out(existence-gate→na).
- **architecture (신규)** — `mode:'dir'` / accessor=`modules[].path`. 디렉토리 → glob anchor (glob 필드 부재 → validator `existsSync(dir)` 매칭 / `glob:'**/*'` 부여 시 simpleGlobMatch depth-1 한계로 glob_no_match → 필드 부재가 정답 / LSP 3.17 dir-level glob + IntelliJ content-root=module dir isomorphic). commit_hash 미스탬프(strict_path 한정 스탬프 루프) → A2 content-drift 자동 제외(dir-diff false-drift 회피).
- **`resolveAnchor(raw, cfg, existsFn)` 헬퍼 (신규)** — file: hasCodeExtension 게이트 → prefixes 순서대로 첫 existsFn-통과 candidate (kind-specific prefix / 전역 기본값 의존 ❌ / REVISE-B) / dir: 확장자 게이트 skip → existsFn → glob anchor. dedup=해소경로 기준 + cap 10.

### 검증 (no-simulation / 실 CLI·실 git)

- graph-synthesizer **+9 test** (sql-inventory resolve/prefix-order/sentinel/dedup/commit_hash-stamp + architecture dir-glob/missing-na/no-stamp + REVISE-B business-rules kind-specific 회귀) + code-pointer-validator **+1 test** (dir glob anchor → glob_no_match 0 + covered). workspace 993→**1003** / 0 fail. release-readiness **26/26**.
- **RealWorld dogfood** (`--repo-root <RW> --commit-hash ee17e31`): analysis-sql-inventory na→**covered (10 strict_path mapper XML / 전부 `src/main/resources/mapper/` 역산 / 10/10 commit_hash 스탬프 = A2 참여)** + analysis-architecture na→**covered (10 glob dir / cap 10 of 12 modules / commit_hash 미스탬프 = A2 제외)**. coverage covered **28→30** / na 87→85 / missing 0 / **glob_no_match 0** / mapper·src-main path_missing 0 / Slice 2 신규 앵커 **0 new findings** (25 medium = 전부 pre-existing TC `generated-tests/` / 무관).
- **A2 positive demo** (sql-inventory mapper 앵커 baseline=root commit ee946e3 / `--git` / 실 114-commit history): **10 mapper XML 전부 `content_drift` 발화** = A2 동기화 루프가 SQL mapper layer production 변경 탐지 (Slice 2 이전 = sql-inventory na = A2 inert / 불가능했음). medium/non-gating (v11.20.0 cap). evidence = `_dogfood-realworld/.../slice2-codepointer-probe.md`.

### §8.1 / carry

- read-class·additive·결정론 → **gate-class 아님** / MINOR. 단일 RealWorld 도메인 = mechanism 입증 (ceiling 주장 ❌). coverage 보고 = strict_path(sql-inventory / A2 참여) vs glob(architecture dir / A2 제외) 분해 정직 표기 (REVISE-D). **carry**: ① db-schema(.sql DDL)/state-map/type-spec 등 나머지 analysis kind 앵커 = 후속 micro-slice ② 접근 C(명시 schema 필드 code_pointers 격상) = A 가치 입증 후 ③ ≥2 distinct domain A2 usability corroboration(gate-class) ④ F-DF-A2-003 working-tree 모드 ⑤ A3 relocation dogfood.

DEC-2026-06-01-slice2-codepointer-enrich. Extends DEC-2026-06-01-df-anchor-002.

## [11.22.0] — 2026-06-01 MINOR — analysis 노드 실 src/main 앵커 derive (F-DF-ANCHOR-002 해소 / RealWorld A2 가 실 production 코드 drift 탐지)

v11.21.0 carry F-DF-ANCHOR-002 해소. RealWorld(S2/주 타깃) 그래프가 실 `src/main/java` production 코드에 앵커 **0건** → Loop A/A2 content-drift 가 production 코드 변경을 못 봄(inert). 그러나 analysis 산출물(business-rules/domain/error-mapping)은 **이미 실 src/main 경로를 evidence 로 보유** — surface 안 됐을 뿐. 합성기가 이 evidence 를 node code_pointers 로 derive → A2 가 실 production drift 탐지. carry 제목 "IMPL 노드"는 조사 결과 S2 현실(IMPL 노드 부재)과 어긋남 → analysis 노드가 같은 목표를 정확히 달성(연계 carry C-codepointer-analysis-aspect-enrich 동시 해소). 접근 A 채택(4원칙 §2 3-agent research / Senior GO@0.80 / Sourcegraph SCIP auto-derive 선례).

### fix — graph-synthesizer analysis evidence → code_pointers derive (additive / schema·skill 무변경)

- **`graph-synthesizer.js`** — `ANALYSIS_TO_CODE_POINTERS` per-kind 명시 field allowlist (business-rules `business_rules[].source_evidence[].file` / domain `aggregates[].invariants[].evidence[].file`+`value_objects[].evidence[].file` / error-mapping `exception_handlers[].source_file`+`http_status_mapping[].evidence_file`) + `deriveAnalysisCodePointers()` 패스. `defaultNaForIntentNodes` **直前** 호출 (derive→backstop 순서 / hasPtr 면 backstop skip → covered / 추출0 → na).
- **fragility 완화 (Senior REVISE)**: ① 명시 allowlist (자동 `*.java` 재귀 ❌ = `persisted_to` 테이블명 오수집 회피) ② 확장자 화이트리스트 (dir/dotted-class/table-name false-anchor 차단) ③ **existence-gate** (`existsFn` / 미존재 경로 emit ❌ = 정직 불변식 / `mapper/` resource-prefix 류 false `path_missing` 회피) ④ dedup + cap(10).
- **결정성 보존**: `synthesizeGraph({repoRoot, existsFn})` 주입 — default = `existsSync(repoRoot 기준)` / test 는 mock predicate 주입 (execFileSync 미주입 = v11.21 purity 정합). **builder cli `--repo-root`** (default cwd) 추가.
- commit_hash 전파 = 하류 strict_path 스탬프 루프(v11.21.0)가 graph commitHash 부여 (A2 baseline / IMPL·TC 동형).

### 검증 (no-simulation / 실 CLI·실 git)

- traceability-matrix-builder 114→**126** test (+12: per-kind derive 3 + 확장자 negative + existence-gate + dedup + cap + commit_hash + backward-compat 무회귀 + no-op + hasCodeExtension + active-gate). workspace 981→**993** / 0 fail. release-readiness **26/26** (poc-05 graph 정적 read = 무영향 / #16 covered=4/na=10/missing=0 불변).
- **RealWorld dogfood** (`--repo-root <RW> --commit-hash ee17e31`): BEFORE src/main 앵커 0 → AFTER **13 distinct** (`UserService.java`/`User.java`/`UsersApi.java`/exception handlers 등) / coverage 21.7%→**100%**(covered=28/na=87/missing=0) / false `path_missing` on src/main **0**(existence-gate). `mapper/`(sql-inventory)·dir(architecture) = na fall-through(후속 slice).
- **A2 positive demo** (temp graph / `git fetch --unshallow` 로 실 history / baseline=root commit / working-tree 무변경): content_drift **14건** 실 production 파일 탐지 + `--apply-drift` → analysis 노드 3개(domain/business-rules/error-mapping) `state=drift` 기록. **Loop A 동기화 루프가 RealWorld production 코드 변경 실 탐지 end-to-end 실증.**

### §8.1 / carry

- derive 메커니즘 = read-class·additive·결정론 → **gate-class 아님**. A2 content_drift = medium/non-gating (v11.20.0 cap 유지). 단일 RealWorld 도메인 = usability threshold 격상 ❌ → carry. **carry**: ① C-codepointer-analysis-aspect-enrich 잔여 (sql-inventory mapper-prefix resolve / architecture dir glob / 후속 slice) ② ≥2 distinct 도메인 A2 usability corroboration ③ F-DF-A2-003 working-tree 모드 ④ A3 relocation dogfood.

DEC-2026-06-01-df-anchor-002. Extends DEC-2026-06-01-dep-graph-loop-dogfood-a2-stamp.

## [11.21.0] — 2026-06-01 MINOR — dep-graph Loop A/B RealWorld dogfood + A2 commit_hash auto-stamp (F-DF-A2-001 해소 / A2 out-of-box usable)

v11.20.0 가 ship 한 Loop A/B 를 실 RealWorld 그래프에서 no-simulation dogfood → P0("만들어도 못 쓰면 답 없다 → 쓰게 하라") 직접 검증. **Loop B navigate + Loop A/A1 freshness = 작동·유용 입증 / A2 content-drift = 메커니즘 정상이나 실 그래프 inert(commit_hash 부재)** 발견 → fix 1 시행.

### dogfood 실측 (실 RealWorld 그래프 + 실 git)

- **Loop B navigate** ✅ — `navigate --stage spec` → 44 노드 rollup, 각 AC 의 honor(backward)=BHV·UC·analysis-business-rules 표시 ("grep 없이 무엇 honor" 답함).
- **Loop A / A1 freshness** ✅ — `graph.stale` 발화 (discovery-spec mtime > synth 정확 탐지 = 동기화 루프 핵심 신호).
- **Loop A / A2 content-drift** ⚠️ — positive demo 로 메커니즘 정상 입증 / 실 그래프 0건 (25 pointer 전부 commit_hash 부재 = F-DF-A2-001).

### fix 1 — synthesizer commit_hash auto-stamp (read-class·결정론·additive / 경량 research GO@0.85 + 공식docs 검증)

- **graph-synthesizer.js `:560`** — strict_path code_pointer 에 `commit_hash` 스탬프 (uniform synth-time HEAD frame / SLSA provenance 동형). `!ptr.commit_hash`(상류 `:214` impl.commit_hash 보존) + strict_path 만 (glob/ast_symbol/doc_link 제외 = `git diff -- path` 무의미 → false-drift 회피).
- **builder cli.js** — `--commit-hash` 미지정 시 `git rev-parse HEAD` auto-derive (graceful undefined / makeGitRunner 패턴 inline = cross-package import 회피). execFileSync 를 순수 synthesizer 에 안 넣어 결정성 보존 (derive=cli / stamp=synthesizer 분리).
- 설계: D1 uniform HEAD(per-file last-touch 는 false-drift 위험으로 반증) / D2 derive-in-cli+stamp-in-synthesizer / D3 graceful / D4 default-on additive. `computeGateFail`(v11.20.0)이 content_drift 를 gate 제외하므로 stamp 가 release-readiness #16 fail 유발 불가.
- → **F-DF-A2-001 RESOLVED** (A2 out-of-box usable).

### 검증 (no-simulation / 실 CLI·실 git)

- traceability-matrix-builder 110→**114** test (stamp / backward-compat 미지정→미스탬프 / anchor-restriction strict_path만 / no-overwrite :214 보존) / workspace 977→**981** / 0 fail.
- **CLI 실 smoke**: `--graph`(--commit-hash 미지정 / cwd=git repo) → auto-derive HEAD `776dc00…`(40char) → strict_path pointer.commit_hash 스탬프 확인. A2 positive demo content_drift 발화(non-gating cap 준수).

### carry (별 cycle / §8.1)

- **F-DF-ANCHOR-002** — IMPL 노드 실 src/main 앵커 (RealWorld A2 가 실 코드 변경 보려면 / C-codepointer-analysis-aspect-enrich 연계). **F-DF-A2-003** — A2 working-tree 모드(uncommitted 탐지 / opt-in). A3 relocation dogfood 미실측.

DEC-2026-06-01-dep-graph-loop-dogfood-a2-stamp. Extends DEC-2026-06-01-living-dep-graph-loops.

## [11.20.0] — 2026-06-01 MINOR — Living dep-graph: 동기화 루프(Loop A) + 소비 루프(Loop B) v1 (P0 양방향 역동기화 배선 / 결정론·read-class)

dep-graph 가 "만들기"만 하고 비어 있던 **두 루프**(상태↔그래프 동기화 / 각 stage 의 그래프 소비)를 결정론·read-class 로 채움. P0(산출물 = LLM 운영 컨텍스트를 평생 양방향 역동기화하여 AX 운영)의 운영 배선. trust 선 §2 준수 — 결정론 git 신호만 권위적, 휴리스틱 active 자동쓰기 ❌. gate-class 후보(A4/A5/B5/contract/coverage)는 §8.1 ≥2 distinct 도메인 전 전부 DEFER.

### Loop A — 동기화 루프 (code-pointer-validator / 결정론 git 신호 / 전부 opt-in)

- **A1 freshness** — `checkGraphFreshness()`: graph.synthesized_at vs derived_from source mtime → `graph.stale` finding. git 무관·상시 계산·display-only (exit code 무영향).
- **A2 content-drift** — `detectContentDrift()`: 저장된 commit_hash 기준 git blob-diff(`git diff --name-only <hash> HEAD`) → `code_pointer.content_drift` finding (opt-in `--git`). `applyContentDrift()` 생산자 (active→drift / graph-synthesizer TRANSITIONS 와 isomorphic).
- **A2-wire** — `--apply-drift`: content-drift 노드를 state=drift 로 live artifact-graph.json 에 기록 (변경 시에만 write / 어떤 hook·gate·release-readiness 도 자동 호출 ❌ = 수동 opt-in).
- **A3 relocation** — `findRelocation()`: git `log -M --diff-filter=R` rename 이력 → `path_missing` finding 에 `suggested_path` 첨부 (제안만 / auto-commit ❌ / 이동처 실존 시에만 = 날조 ❌). dead schema 필드 활성화.
- 전부 opt-in (`--git`/`--apply-drift`) / git 부재·repo 아님 = graceful null (no-simulation). 기존 `validateCodePointers` 반환 shape + release-readiness #16(`--git` 미전달) 무영향.

### Loop B — 소비 루프 (chain-driver navigate F3/F4 + 5 stage agent consult / read-class)

- **consult** — discovery/spec/plan/test/implement agent body 에 "dep-graph 소비" 섹션: stage 진입 시 작업 노드를 `chain-driver navigate` 로 조회 (backward=honor / forward=영향 / code_pointers), AI 추론 0% verbatim. PLAN 의 의존성 AI-재유추 → 그래프 조회 전환 명시. frontmatter skills[] 무변경 (Bash+CLI / skills≡phase-flow invariant 보존).
- **F3** — `navigate --stage <s>` / `--scope <id>`: 단일노드→단계 일괄 의존성 rollup (STAGE_SUBKINDS / scope_id·state filter / analyzeImpact·centrality 재사용).
- **F4** — stage 방향 프리셋 (discovery/spec/implement=backward / plan/test=forward) + `--direction` override. presentation-only (analyzeImpact 무변경).

### A2 §8.1 hardening (release 검증 sub-agent finding 흡수)

- content_drift 가 `--strict` 에서 high→exit1 로 격상되던 **latent 단일 도메인 hard-gate 제거**: severity **medium 고정**(--strict 와 무관) + 신규 `computeGateFail()` 가 content_drift 를 gate(fail) 계산에서 **제외** (medium 보고만 / 가시성 유지). ≥2 distinct 도메인 corroboration 전까지 non-gating (trust 선 §2 / §8.1 정합). CLI usage·exit-code 문구 정합. ※ A1 freshness 는 애초에 result.findings 외부 → 자동 non-gating.

### 검증

- code-pointer-validator 35→**39** test (content_drift medium-under-strict + computeGateFail decouple anti-regression anchor 3종) / chain-driver navigate 20/20 / workspace 973→**977** / drift-validator chain-layout 0 orphan·0 missing / skill-citation 0 stale / release-readiness 26/26 + version 3-way 11.20.0.
- 실 CLI 실측 (no-simulation): poc-05 `--git --strict` → 5 MEDIUM content_drift / **PASS exit 0** (decouple 입증).

DEC-2026-06-01-living-dep-graph-loops.

## [11.19.0] — 2026-06-01 MINOR — 배포 6단계 점검 carry-queue 6종 종결 + 결정론 gate 1종 신설 (check26)

v11.18.0(배포 6단계 점검)이 deferred 한 `decisions/INSPECTION-LEDGER.md §3` carry-queue 6종을 전부 종결 (additive / breaking 0 / release-readiness 25→26). 점검이 스스로 찾아 "별도 묶음"으로 미뤄둔 자기 finding — 실제 correctness/결정론 구멍(cosmetic doc drift 아님).

### 신규 결정론 gate (req8 "누가 돌려도 같은 품질")

- `check26` gate-validator-list-consistency (F-S07) — gate validator 목록의 cross-source 정합을 결정론으로 검사. 데코레이션(`(...)`/`--flag`) 정규화 후: gate-eval `REQUIRED_VALIDATORS_PER_STAGE`(blocking) ⊆ `sdlc-4stage-flow.json` gates[].validators(매트릭스) + sdlc gate ≡ `<stage>.phase-flow.json` cross_cutting.validators (`conditional_validators` allowlist 차이 허용). drift-validator 가 gate/validator 목록을 미비교하던 구조적 사각(SEED-3/S10류) 차단. 정정: sdlc gate#1 +br-cross+formal-spec-link / gate#2 conditional spectral / discovery·plan cross_cutting.

### carry 6종 종결

- **F-T05** (evidence 필드명 SSOT / high) — Option α canonical 확정 (per-TC `test_run_evidence` / impl root `test_pass_evidence` = schema 정식 / top-level `test_invocation_evidence` = schema 금지 = runner standalone 산출물명). validator 가 schema-금지 필드를 read 하던 모순 해소 (check-links per-TC+impl read = non-breaking + sentinel skip + base-tolerant `.aimd` resolve / legacy 병존 + lint-no-simulation grep 3-shape alternation) + skill/flow/agent/template prose α 전환. examples PoC 0 신규 finding 실측.
- **F-I05** (S2 gate 배선 / med) — `s2-outcome-check.js` producer 를 test-impl-pass-validator cli 에 배선 (`--scenario S2 --test-spec` → reconcile → `outcome_mismatches` → findings-aggregator → gate-eval `per_tc_outcome`) + adapter per-test `tests[{name,status}]`. findings-aggregator `transformTestImplPass` latent 버그 동반 수정 (cli.js `pass_count` shape 에서 `tests_total` 무음 0 → I9 GREEN fail-closed guard 정합).
- **F-T06** (runner hardening / med) — T9 FRAMEWORK_HINTS contract/visual bypass + T14 report_format enum 정규화(`report-format.js` / `stdout_regex` enum additive) + T16 inference 정직(mocha·go → `framework:'other'` + stdout_parser scaffold / `count_mode:'occurrences'` 신설) + T11 test-spec.template S2 characterization+augmentation 쌍.
- **F-X01** (med) — `code-graph.schema.json` `$schema` draft-07→2020-12 (Ajv2020 메타스키마 로드실패 경고 해소).
- **F-X02** (low) — skill-citation-validator HISTORY_FILE += `decisions/INSPECTION-` (점검 리포트 finding-quote stale 경로 false-positive 차단).

### 검증 / carry

release-readiness **26/26** · workspace test **950/950 pass / 0 fail** · drift 0 · 0 stale citation · version 3-way. 신규/확장 test ~31건(report-format/load-test-cmd/adapter/aggregator/spec-test-link/link/lint-chain/cli/citation/release-readiness). 점검 ledger = `decisions/INSPECTION-LEDGER.md`(§3 carry 6종 resolved / §5 로그). carry: 없음 (전부 종결).

## [11.18.0] — 2026-05-31 MINOR — 배포 6단계 chain harness 전수 점검 + 결정론 gate 2종 신설 (check24/check25)

`배포 플러그인이 프레임워크처럼 동작(LLM=언어 / 플러그인=Spring)` 목표로 analysis→discovery→spec→plan→test→implement 6단계 자산 + 10 패러다임 전수 점검 (Workflow 6회 / ~155 자산 / adversarial 검증 confirmed 99 / CUT 0). 비파괴 / gate 강화 (release-readiness 23→25 / npm test all-pass / drift 0 / 0 stale citation / build 4686).

### 신규 결정론 gate 2종 (req8 "누가 돌려도 같은 품질")

- `check24` agent-skills-phaseflow-sync (C12) — agent frontmatter `skills:[]` ⊇ 해당 stage phase-flow 등록 skill. dispatch preload ↔ orchestration SSOT silent drift 차단 (analysis-agent code-graph/greenfield + implement-agent test-run-test-evidence 누락 노출·정정).
- `check25` template-schema-valid (capstone) — 6 chain stage 템플릿(discovery-spec/behavior-spec/acceptance-criteria/task-plan/test-spec/impl-spec)이 대응 schema 에 valid. #1 systemic(meta.confidence object≠number 가 5/5 템플릿)을 어떤 gate 도 못 잡던 사각 영구 lock — \_base-apply-template 가 invalid shape 를 LLM 에 학습시키는 것 차단.
- gate-eval `I9` — implement GREEN gate 가 test 증거(tests_total) 없이 통과하던 fail-OPEN → evidence_missing fail-closed 보강.

### 단계별 정정 (confirmed 99)

- **analysis**: aspect 파일명 canonical `-spec`/`-spectrum` 전수 / dist-dangling case-by-case 정책 / planning-agent→discovery-agent.
- **discovery**: discovery-spec.schema 확장(nfr/io_contracts/intent_summary/decisions/pending_decisions) + discovery-extraction-validator D4 거버넌스 3 check 구현 + UC over/under-decomposition lane + summary medium/low.
- **spec**: handoff plan-agent 교정(plan stage 건너뜀 차단) + integrate over-claim 정직-격하 + SEED-3 scenario_expected 문서화 + check-links BE-mode 연산자 버그 교정.
- **plan**: SP 4분류 wiring(plan-risk-and-nfr + plan-agent db-assets-validator) + work-unit-manifest stage enum System Y additive 확장.
- **test**: RED scenario-conditioned(S2 per_tc_outcome / S3 snapshot_green) + coverage_summary→coverage + validator README System Y.
- **implement**: System Y 번호 prose 정정 + static-runner inflated tool-count 정직화.
- 5 chain stage 템플릿 schema-valid 화(systemic meta.confidence object≠number) + System Y 번호 prose 정정.

### honesty-tier 테마

skill prose 가 validator 미구현 강제를 과대 주장하던 패턴(spec integrate / discovery decisions / implement static-count)을 _구현_ 또는 _정직-격하_ 로 정정 (self-recorded-fact-validation paradigm 정확 적용).

### 검증 / carry

release-readiness **25/25** · workspace test all-pass · 0 stale · drift 0 · build 4686 · version 3-way. 점검 리포트 7종 + 진행 ledger = `decisions/INSPECTION-2026-05-31-*.md` (워크스페이스 전용 / dist 미포함). test 점검 중 audit agent 무단 write 발견 → implement 점검에 read-only 가드 명시(재발 0). carry(별도 묶음): evidence 필드명 SSOT reconcile(test_run/test_invocation/test_pass) · gate-consistency check · test-runner framework/enum hardening · code-graph.schema draft-07 · skill-citation scope.

## [11.17.0] — 2026-05-31 MINOR — agents·skills 정책 SSOT dedup + chain/gate 번호 정합(System Y) + F-MB-010 종결

`프로젝트 자산(agents/skills/hooks) 리팩토링` 요청 → 3 묶음 (중복 제거 → 정합성 → 잔여 cascade) 순차 시행. 모두 비파괴 / gate-neutral (release-readiness pass-count 비감소 / npm test 24 ws fail-0 / citation 0 / drift 0 breaking).

### 정책 SSOT dedup (methodology-spec/policies/ 신설)

- 공통 정책 boilerplate(no-simulation / 70~80% / Tier 3.1·3.2 / Absolute priorities)가 agents 4곳·skills 33곳에 복붙된 것을 단일 SSOT로 추출. canonical 3종 신설(`no-simulation.md` / `automation-boundary.md` / `honesty-tiers.md`) + `plugin-charter.md` §7(agent 공통 우선순위 / 새 R 아님).
- "스텁+포인터" granularity: skill 고유 delta(도구 Tier 매핑 / modality별 자동화 %)는 inline 유지 + 1줄 포인터. baseline+delta 모델. spec/test/implement agent "호출 절차"의 Tier merge-bug(중복 step 번호) 동반 정리.
- gate-safe 근거: validator는 prose 문자열 아닌 field 값·파일 존재·digest 검사 / skill-citation-validator는 인용 경로 존재만 확인(포인터 추가 = 통과·강화).

### chain/gate 번호 schism 정합 (System X→Y)

- v10.0.0 plan-gate(#3) 삽입 후 test/implement prose가 한 칸 stale("System X": test=3/#3, implement=4/#4)였던 것을 machine SSOT(state.schema + sdlc-flow + "chain N = gate #N" 규약)에 맞춰 정정: **test=chain 4/gate #4, implement=chain 5/gate #5**.
- 범위: agents(test/implement/spec forward-ref/analysis/README) + test·implement 스킬 8개 + CLAUDE.md 다이어그램(plan gate #3 명시 / test #4 / implement #5 / gate #1~#5 / chain 1~5). plan/spec/discovery 불변 / ADR 파일명 불변.
- spec-agent 입력 계약 정정: `planning-spec.json` → `discovery-spec.json` (discovery 가 산출하지 않던 파일 참조 = 기능 결함 해소).

### F-MB-010 잔여 cascade 종결 (planning-spec→discovery-spec rename)

- hard replace: deliverables/ticket-policy/id-conventions/skills-axis/workflow docs + schemas(description) + analysis skills (이력 주석·frozen PoC evidence·finding-system 보존).
- flows: `plan-spec-compose` phase id → `task-plan-compose` (json+mermaid 동시 / drift 0 breaking) + implement.phase-flow inputs `planning`→`discovery`.
- runtime(chain-driver keying)는 v11.1.0 에서 이미 resolved 확인 (npm test 24 ws 통과 입증).

## [11.16.0] — 2026-05-31 MINOR — 잔여 actionable carry sweep 3종 (DB always-on validator 신설 + domain schema stakeholders + chain-coverage strict default)

`잔여 작업 남은거 있나?` 질문 → **91-item carry audit (workflow / 5 소스 fan-out → 검증 → 분류)** → 즉시 착수 가능 actionable 4종 도출. 그 중 **P2(analysis/aspect code_pointers enrich) 보류** (§8.1 — real code_pointers semantics 가 live PoC 없이 모호 = HIGH 과적합 위험 / 현 na=true backstop 이 이미 coverage 100% 라 infra-only 는 소비자 부재). **P1·P3·P4 시행** (각 추천안 / 사용자 batch 승인).

### P1 — `tools/db-assets-validator` 신설 (25번째 validator / F-DB-AUTOVAL-001 ✅ 해소 / db-assets-always-on §8.4)

DB 자산 always-on 정책이 매뉴얼 체크리스트뿐이던 공백을 자동 게이트로 해소. `work-unit-manifest.json` 의 `analysis_refs` 안 `db_tables`/`db_procedures`/`db_functions`/`db_views` 4 필드 검사:

- **finding 6종**: `sp_missing_id`(critical) / `sp_invalid_class`(critical) / `sp_unclassified_at_plan`(critical — plan stage 이후 hard-gate / discovery 까지 nullable) / `external_class_mismatch`(high — external=true ↔ γ 일관성) / `gamma_external_unset`(medium) / `db_assets_absent`(medium — 비-DB 자산만 있고 DB 0 / **greenfield 면제** paradigm-aware).
- **결정론 axis** (feedback_chain_driver_deterministic_axis 정합): manifest **완성도** 검사 only / canonical global cross-resolution 은 `drift-validator` 영역.
- exit 0(pass) / 1(critical·high / --strict 시 finding≥1) / 2(usage). `--warn`... 아니라 `--strict` flag (CI/pre-chain audit).
- **release-readiness #23** = golden fixture 판별 (compliant→PASS(critical/high 0) / violations→FAIL(`sp_unclassified_at_plan`+`external_class_mismatch`) / content-aware — file presence ❌). 커밋된 PoC 에 `analysis_refs.db_*` manifest 부재(poc-17 외부 격리) → 실 corpus 대신 validator discrimination 입증 / db-asset manifest 커밋 시 corpus scan 확장(`C-db-autoval-corpus-extension`).
- **17 test** (unit + CLI exit code spawn).

### P3 — domain.schema `stakeholders` + `business_intent_summary` (C-domain-schema-stakeholders / optional·additive)

carry 명칭은 'mandatory' 이나 `domain.schema.json` = strict(additionalProperties:false) — required 로 넣으면 기존 PoC domain.json 11종 깨짐 → **schema optional + skill 본문 강제** 결단(breaking 회피 / v11.6.0 intent_certainty 선례 동형):

- `schemas/domain.schema.json` 에 `stakeholders`(string array / discovery-spec business_intent.stakeholders 동형) + `business_intent_summary`(string) optional 추가 (required 미추가 / additive).
- `skills/analysis-domain-model/SKILL.md` 절차에 비즈니스 컨텍스트 추출 **의무 step** + 예시 JSON 반영.
- `templates/analysis/domain.template.md` 비즈니스 컨텍스트 절 신설.
- `discovery-extraction-validator` 부재 WARN(`discovery.domain.missing_business_context` / low / non-blocking / +4 test).
- SSOT 경계: 전체 비즈니스 이해관계자·성공 기준 = discovery-spec business_intent / domain = 도메인 actor 초점.
- **backward-compat 실측**: 기존 domain.json(이미 pre-existing 사유로 prelim) 에 2 필드 추가 전후 schema-validator 에러 집합 **동일**(새 에러 미추가) 입증.

### P4 — F-SIM-003 chain-coverage-validator strict default flip + `--warn-paths` escape hatch

cross-ref broken-path 검사를 **strict(high/blocking) 기본**으로 전환. cooling-off paradigm 영구 폐기(v10.0.0) + autoDetectProjectRoot fix(v9.0.4) + 5 PoC 0 broken sweep(v9.0.5)로 false-positive 해소 → §8.1 ≥2 corroboration 충족:

- `tools/chain-coverage-validator/src/cli.js` `strictPaths` 기본 `false`→`true`. `--warn-paths`(옛 warn-mode / 비상 escape hatch / release 시 ❌) 신설. `--strict-paths` = 이제 default no-op(backward-compat 보존).
- **poc-05 strict default 무회귀 실측**: release-readiness check3 호출(--strict-paths 없음) = strict_mode true / broken_path_count 0 / exit 0.
- +3 CLI spawn test (default→exit 1 / --warn-paths→exit 0 / --strict-paths→no-op).

**STOP-3 (전 구간 no-simulation 실측)**: workspace 879→**903 (+24)** / release-readiness 22→**23/23** (target v11.16.0 / check23 신설) / test:release **14/14** (self-test criteria_total 22→23 정합) / skill-citation 0 stale / version 3-way 11.16.0.

**breaking 0**: P1 신규 standalone tool / P3 optional additive / P4 `--warn-paths` escape hatch + poc-05 무회귀 → MINOR.

**carry**: P2 `C-codepointer-analysis-aspect-enrich`(보류 / live PoC 시점 — semantics 결정) + `C-db-autoval-corpus-extension`(db-asset manifest 커밋 시 corpus scan) + README v11.1.0 stale(레포 기존 per-release 미갱신 cadence / 별도).

DEC-2026-05-31-db-assets-validator + DEC-2026-05-31-domain-stakeholders + DEC-2026-05-31-fsim003-strict-default.

---

## [11.15.0] — 2026-05-31 MINOR — tooling-audit cleanup + 2 gate 강화 (planning→discovery 잔재 / dead-gate 복구 / soft-gate fail-closed / git pre-push gate)

multi-agent tooling audit (195 asset / 42 verified finding / 기록 SSOT `.claude/plans/plan-tooling-refactor-audit.md`) 후속 정리 5 commit. **정직 표기**: 대부분 audit self-referential cleanup + soft-gate·pre-push 2 enforcement teeth — 본격 신규 prod feature 아님.

1. **rename 잔재 정리** (refactor) — `planning`→`discovery` rename(v11.0.0)의 미완 cascade: discovery-extraction-validator `--planning` alias + `validatePlanningExtraction` export 제거(canonical 교체) / findings-aggregator `planning-extraction-validator` dispatch case 2벌 + backward-compat test 제거 / chain-coverage·formal-spec-link `--planning`·`planning-spec.json` → `--discovery`·`discovery-spec.json` 정규화 / release-readiness `planning-spec.json` fallback 제거 / 라이브 4 skill 호출 정규화 / charter §4.1 Stop-hook ITSM + §4.6(R16/R17 vestigial) → R20 ticket-sync retarget.
2. **release gate 진실성** (fix) — `check21`(template-count-drift) dead regex 복구(machine marker `check21 SSOT: total N templates` + `.template.*` 전수 + fail-closed) / `check22` baseline broken-ref 해소(`scripts/baseline-data/`) / release-readiness self-test 17→22 stale 정합(5 fail → **14/14**) / charter 요구사항 카운트 자기모순(20/17/18/16) → 21항목·활성 19 단일화.
3. **findings-aggregator 선언 정정** (docs) — "mandatory 양심-차단 auto-feeder"(자동 호출 0 + `next` 필수 아님 + 11 PoC 중 1 사용 = 이중 거짓) → "선택적 operator 보조". 도구·로직 무변경.
4. **F-AUDIT-SOFTGATE-001(=C-13) fail-closed** (feat) — `chain-driver next` 가 `--findings` 미제출 시 0 findings 로 silent 통과하던 soft-gate를 block(`findings_unverified` / rank 2)으로. 통과 = 진짜 `--findings` 공급 OR `--user-decision go` 명시 ack(intervention-log actor:user). gate-eval 순수성 보존(sentinel in, reason out). 4원칙 3-agent research(공식문서 fail-safe defaults·OPA·GitHub required-check·Sigstore·DO-178C 전부 fail-closed) → 사용자 Option C 결단. C-13(2026-05-07 PoC-06 carry) 동시 해소.
5. **git pre-push release gate** (feat) — 사내 GitHub Actions 부재 대응. `scripts/githooks/pre-push`(push 시 `npm run test:release` 강제) + `scripts/setup-git-hooks.js`(core.hooksPath / 클론마다 1회). Claude Code PreToolUse hook 아님(§4.1 "빠를 것" 무관) — 터미널 push 까지 커버. 사용자 Option G 결단. 한계(정직): 클라이언트 hook / `--no-verify` 우회.

**검증 (전 구간 no-simulation 실측)**: chain-driver 255/255 / workspace 875→**879** / release-readiness **22/22** (target v11.15.0) / test:release **14/14** / skill-citation 0 stale / version 3-way 11.15.0. **pre-push gate 도그푸딩** — 본 release push 가 실제 게이트(test:release 14/14)를 통과해 진행.

**breaking 0**: soft-gate fail-closed = `--user-decision go` escape hatch + 기존 테스트 0 깨짐(bare `next` 의존 테스트/스크립트/PoC 부재 확인) → MINOR. (default 동작 변경이나 실 영향 ≈ 0.)

**잔여 (deferred / audit 부록)**: CHANGELOG phantom-alias 문구("transformPlanningExtraction 보존" — 역사 기록) / `tools/README.md` gate 번호 표기 staleness / 라인엔딩(CRLF/LF) 정규화.

---

## [11.14.0] — 2026-05-30 MINOR — S2(AX전환) gate augmentation arm RED→GREEN round-trip: P4 양방향 역동기화 end-to-end 실측 (carry ② RESOLVED / DEC-2026-05-30-s2-augmentation-green-roundtrip)

`/clear` 후 사용자 "다음 작업 시작해줘" → audit 리포트 후속 vs prod 가치 carry AskUserQuestion → **"리팩토링 보류 — prod 가치 carry"** 선택 → feasibility triage → carry ②(augmentation impl 후 GREEN 격상) 추천 + plan 제시 → "진행".

**배경 (carry ② / v11.13.0 잔여)**: DEC-2026-05-30-s2-exec-corroboration(2차)은 augmentation arm `AccountDeletionAugTest`(TC-USER-007 / `DELETE /user`)을 **impl 부재 RED 1건**으로 실측했다. carry ② = 이 augmentation 을 실제 구현해 **RED→GREEN 격상** + 방법론 가치 **P4(양방향 역동기화)** end-to-end 실측.

**feasibility triage (정직)**: carry ①(WARN→block 격상 / 2nd distinct domain) = poc-16 efiweb-car **.java source 부재**(사내 미커밋) + RealWorld 동일 blog 도메인 → **환경 차단 carry 유지**. carry ② = RealWorld repo + augmentation test + UsersApi + JDK 11(`~/jdk11-temurin` 재사용) 모두 present → **완전 실행 가능** = 본 release.

**impl (RealWorld 5-file 수직 슬라이스 / 기존 hexagonal 패턴 그대로 / 외부 dogfood repo)**:

1. `core/user/UserRepository.java` — `void remove(User)` (도메인 인터페이스)
2. `infrastructure/repository/MyBatisUserRepository.java` — `@Override remove → userMapper.delete(id)`
3. `infrastructure/mybatis/mapper/UserMapper.java` — `void delete(@Param("id") String)`
4. `resources/mapper/UserMapper.xml` — `<delete id="delete">delete from users where id = #{id}</delete>`
5. `api/CurrentUserApi.java` — `UserRepository` 주입 + `@DeleteMapping` → `@AuthenticationPrincipal` → `userRepository.remove(currentUser)` → 204

리스크 사전 해소: Security `anyRequest().authenticated()` + 유효 token → 인증 통과 / FK = 신규 user 관계 0 + sqlite test profile FK 비강제 → 안전 (production cascade = scope-out / known-limitation).

**실측 (`gradlew test --tests io.spring.api_gen.*` / JDK 11 + Gradle 7.4 / no-simulation)**: **26 testcases = 26 PASS / 0 FAIL** (직전 25 PASS + 1 FAIL). `AccountDeletionAugTest :: TC-USER-007` = **PASS**(204). JUnit XML 물증.

**round-trip 3 상태 실측** (`.aimd/s2-roundtrip-probe.mjs` / 동일 실 XML 에 spec expected_outcome 만 대조 / 실 methodology 모듈 import):

| 상태                                            | augmentation expected | actual   | outcome_mismatches | GATE(S2)                                                                 |
| ----------------------------------------------- | --------------------- | -------- | ------------------ | ------------------------------------------------------------------------ |
| 1. impl 부재 (v11.13.0 2차)                     | fail                  | fail     | 0                  | go-eligible                                                              |
| 2. impl 후 / **재동기화 전** (BEFORE)           | fail (stale)          | **pass** | **1**              | **`s2_outcome_mismatch` WARN** ← drift 감지 (impl 이 spec 보다 앞섬)     |
| 3. **재동기화 후** (AFTER / expected fail→pass) | pass                  | pass     | 0                  | go-eligible ← drift 해소 / augmentation 영구 characterization-grade 승격 |

→ gate 가 "impl 이 spec 을 앞지름(drift)"을 `s2_outcome_mismatch` 로 정확히 감지(상태 2) → 운영자가 spec 의 expected_outcome 을 fail→pass 로 역동기화(상태 3) → 해소. **AX 운영 round-trip(생성 RED → impl → 역동기화)이 실 OSS repo 에서 end-to-end 실측.** probe + 재동기화된 harness 모두 exit 0.

**methodology 보강 (additive / breaking 0)**:

- `skills/test-generate-test-spec/SKILL.md` step 3 — "S2 augmentation 재동기화" 1 unit 추가: augmentation TC 는 `expected_outcome="fail"` 생성 → impl 후 **fail→pass 재동기화** 의무 + 재동기화 누락 시 gate 가 `s2_outcome_mismatch` WARN 으로 drift 신호 (gate-eval.js / s2-outcome-check.js 코드 = 이미 올바로 작동 / **변경 ❌**).
- `methodology-spec/use-scenario-taxonomy.md` §5 — `C-use-scenario-s2-gate` carry 행에 augmentation GREEN round-trip(**carry ② RESOLVED**) 추가.
- 외부 evidence: `s2-gate-probe.md §7` + `s2-roundtrip-probe.mjs`(신규) + `s2-exec-harness.mjs` 재동기화(expected→pass).

**§8.1 (정직)**: augmentation **mechanism**(RED→GREEN + 역동기화 round-trip) 실증 = 단일 blog 도메인. WARN→**block** 격상(carry ①)은 여전히 ≥2 **distinct domain** 필요 → 별 carry 유지 (speculative hardening 회피 / cooling-off 폐기 + §8.1 strict + self-referential drift 회피 paradigm 정합). round-trip 문서화는 `reconcileOutcomes` 의 기계적 귀결(expected vs actual)을 실측 입증 = ceiling 주장 아님 → 1 execution 으로 workflow 문서화 충분.

**STOP-3**: workspace 875/875 (methodology 코드 무변경 / doc·skill·taxonomy only → 영향 0) ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.14.0 + breaking 0 = **MINOR**.

**carry**: ① C-use-scenario-s2-gate WARN→block 격상 (2nd distinct domain S2 execution / poc-16 사내 source 부재 → 타 distinct OSS Spring 또는 source 확보 의존) ② (선택) TC-USER-007 canonical test-spec(s2-reframe.json) 정식 등재 + AC/BHV traceability (현 harness/probe embed 로 충분).

## [11.13.1] — 2026-05-30 PATCH — no-simulation 절 정직성 cleanup: CLAUDE.md R19 Tier 정합 (C-honesty-tool-cleanup 종결 / DEC-2026-05-30-honesty-tool-cleanup)

CLAUDE.md "Static Tool 시뮬레이션 절대 금지" 절이 R19(DEC-2026-05-18-runtime-tool-exclusion) 이전의 **flat 표현**으로 남아 6개 도구(Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube)를 모두 "**진짜 외부 도구 실제 실행 의무**"로 나열 — 그러나 SpotBugs·Daikon·CodeQL·SonarQube 는 본 방법론 환경에서 **실 실행 이력 없음**(매 PoC "미실행"/"부재" 표기). 실행 못 하는 도구를 "실행 의무"로 적는 것은 no-simulation 정책 자체의 형해화 (사용자 지적 "쓰지도 못하는데 왜 자꾸 써있냐"). 본 PATCH = 해당 절을 **R19 Tier 정합**으로 reframe (정직 표기).

**시행 (CLAUDE.md only / breaking 0)**:

- ❌ **Tier 3 (simulated)** — AI persona 시뮬레이션 = 영구 reject + -5%p.
- ✅ **Tier 1 (in-plugin 실제 실행)** — Semgrep / ESLint / Spectral / axe-core·Playwright / 테스트 stack runner(Gradle·JUnit·vitest). 실 실행 입증 채널.
- ✅ **Tier 2 (사용자 환경 SARIF import / plugin 자동 실행 ❌)** — PMD / SpotBugs / CodeQL / Daikon / SonarQube. 사용자가 자기 환경서 실행·import 시만 `evidence_trust=imported_sarif`(`tool_stdout_path=null`). 부재=carry(날조 ❌). PMD 는 poc-17 사용자 환경 실 실행 / SpotBugs·Daikon·CodeQL·SonarQube 는 본 환경 실 실행 이력 없음 = 정직 인지.

**scope 정직**: 활성 doc 중 flat-framing 은 CLAUDE.md 가 유일 (agents/methodology-spec/ADR/charter/static-runner 는 이미 R19 Tier framing = 정직). R19 Tier 2 분류·`IMPORTED_DRIVER_ALLOWLIST=[pmd,spotbugs,codeql,daikon]` 는 schema-enforced 정식 기능이라 **이름 삭제 ❌**(reframe = "plugin 미실행/import-only" 명시로 정직 해소 / R19 보존). archive/dist-history·decisions·HISTORY 는 동결 이력 무변경.

**STOP-3**: workspace 875/875 (영향 0) + release-readiness 22/22 + skill-citation 0 stale + version 3-way 11.13.1 + breaking 0 = PATCH. carry `C-honesty-tool-cleanup` ✅ 종결.

## [11.13.0] — 2026-05-30 MINOR — S2(AX전환) gate 2차 execution corroboration: RealWorld 실 구동 + 상관 규약 보강 (DEC-2026-05-30-s2-exec-corroboration)

`C-use-scenario-s2-gate` Track α(v11.11.0)의 1차 corroboration 은 characterization GREEN 을 **"impl 존재의 구조적 귀결"로 추론**했을 뿐 실측이 아니었다(Java/Gradle 부재 = RISK-ENV-001). 본 release = **RealWorld 를 실제로 구동해 execution-grade corroboration** 확보 (no-simulation).

**환경 확보 (admin-free)**: Temurin JDK 11.0.31 zip + Gradle 7.4 + Spring Boot 2.6.3 + sqlite::memory:(test profile). `gradlew compileTestJava` BUILD SUCCESSFUL → **RISK-ENV-001(RealWorld arm) 해소**.

**생성 test 통합 (결정적 변환 / `.aimd/transform-gen-tests.mjs`)**: 생성 characterization test 6파일을 RealWorld test sourceSet 으로 — package `io.spring.api_gen`(충돌 회피) + `@ActiveProfiles("test")`(DB 격리) + @DisplayName TC-id prefix(상관). + augmentation `AccountDeletionAugTest`(TC-USER-007 / `DELETE /user` 미구현 / expected_outcome=fail).

**실측 (`gradlew test --tests io.spring.api_gen.*`)**: **26 testcases = 25 PASS(characterization) + 1 FAIL(augmentation)** (JUnit XML 물증). gate 파이프라인(`.aimd/s2-exec-harness.mjs` / 실 methodology 모듈): correlateByTcId(26/26 / missing_actual=0) → reconcileOutcomes(**outcome_mismatches=0**) → evaluateGate('test',·,'S2') = **blocked=false / go-eligible**. augmentation TC-USER-007: expected=fail ↔ actual=fail match. **음성 대조**(characterization 회귀 가정→fail): outcome_mismatches=1 → `s2_outcome_mismatch` → user 'go' → go-with-warnings(rank 2 WARN) = 회귀 탐지 입증.

**methodology 변경 (상관 규약 보강 / additive / breaking 0)**: dogfood 발견 — JUnit5+Gradle XML `name`=@DisplayName(메서드명 아님) + Java 메서드명 하이픈 불가 → TC-id 상관 규약 보강:

- `tools/test-impl-pass-validator/src/s2-outcome-check.js` — `correlateByTcId` 정규화(`normalizeForMatch`=대문자화+비영숫자 제거) 후 substring → 하이픈 displayName ↔ 언더스코어 메서드명 양쪽 상관 (+2 test / 40→42 / backward-compat).
- `skills/test-generate-test-spec/SKILL.md` — step 4 "TC-id-in-name 규약"(display name/메서드명에 TC-id / JUnit5+Gradle 은 @DisplayName 권장 / 풀-컨텍스트 통합 test 는 @ActiveProfiles).

**§8.1 평가 (정직)**: RealWorld arm = execution-grade 도달이나 §8.1 ≥2 **distinct domain** 미충족(RealWorld 단일 도메인 / structural+execution 양 grade) → gate enforcement = **WARN 유지**(`s2_outcome_mismatch` rank 2 / hard-block ❌). **WARN→block 격상 = 2nd distinct domain(poc-17 사내 Java / 타 OSS Spring) 후 별 release** — speculative hardening 회피(cooling-off 폐기 + §8.1 strict paradigm 정합).

**STOP-3**: workspace 873→**875(+2)** ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.13.0 + breaking 0 = MINOR. carry: ① C-use-scenario-s2-gate 격상(2nd distinct domain) ② augmentation impl 후 GREEN 격상.

## [11.12.0] — 2026-05-30 MINOR — dep-graph 의도 노드 code_pointers_na 기본 backstop (F-DOGFOOD-009 / DEC-2026-05-30-code-pointers-intent-na-backstop)

dep-graph `code-pointer-validator`(release-readiness #16)는 모든 Tier-1 노드(artifact_kind ∈ {chain,analysis,aspect}, state ∈ {active,drift})가 `code_pointers`(≥1) 또는 `code_pointers_na=true` 를 갖길 요구한다. 그러나 UC/BHV/AC/TASK + analysis/aspect 는 본질이 **의도/집계 노드**(코드 anchor 는 하위 IMPL/TC 가 보유)이고, 어떤 템플릿/skill 도 na 를 안 박아 RealWorld dogfood 실측에서 **coverage 21.7%**(covered=25 TC / na=0 / **missing=90** = UC19+BHV19+AC25+TASK19+analysis8)로 나타났다. 본 release = synthesizer 가 의도 노드 na 를 자동 기본하는 **3-layer backstop**.

**시행 (additive / breaking 0)**:

- **Layer 1 (load-bearing)** `tools/traceability-matrix-builder/src/graph-synthesizer.js` — `defaultNaForIntentNodes(nodes)` 정규화 패스 신설 + 호출 1회. `state==='active'` + kind∈{chain,analysis,aspect} + subkind∉{IMPL,TC} + `code_pointers` 없음 → `code_pointers_na=true`. Senior REVISE 반영 — `state==='active'` 게이트로 carry-over deprecated/propose 노드 payload 무변조 (재합성 시 silent content drift 회피). IMPL/TC 제외 = source fallback 으로 채우거나, 무source 시 `missing` 으로 노출 유지(code-bearing 결함 surfacing 보존).
- **Layer 2** template 4종 — `behavior-spec.template.json`(`na:false→true`) + `discovery-spec`(use_cases) / `acceptance-criteria`(criteria 3) / `task-plan`(tasks 3) 각 item 에 `code_pointers_na:true` 추가 (schema 가 이미 item-level 에 `code_pointers_na`(default:false) 정의 → additive / schema-valid).
- **Layer 3** skill 4종 — `discovery-decompose-use-cases`/`spec-compose-behavior-spec`/`spec-derive-acceptance-criteria`(UC/BHV/AC=의도 노드 → na 기본) + `plan-decompose-and-sequence`(TASK=na 기본이되 수정 코드 range 알면 `code_pointers` 채워 의존성 추론 정확도↑).
- **test** +5 (graph-synthesizer.test.js) — ①intent 노드 na 자동 ②포인터 보유 시 no-op(na_conflict 회피) ③IMPL/TC 무source→missing 유지(anti-regression) ④analysis/aspect na + plan(EPIC) 무변경 ⑤carried-over deprecated intent → na 미stamp(Senior 게이트 회귀 anchor). builder 105→**110**.

**§8.1 1차 corroboration (RealWorld / Type 1.5 external repo / no-simulation)**: 실 production 경로(builder CLI → patched synthesizer → code-pointer-validator)로 RealWorld 그래프 재합성 실측 — **BEFORE** covered=25/na=0/missing=90/**ratio=21.7%** → **AFTER** covered=25/**na=90/missing=0/ratio=100%** (node parity 115=115 / na_conflict=0 / coverage_missing=0). release-readiness #16 은 정적 poc-05 corpus(이미 100% 백필) read 라 **무영향**(무회귀) — 본 패치 가치 = 신규/외부 프로젝트가 hand-backfill 없이 coverage 확보.

**carry**: ① analysis/aspect `code_pointers` enrich (Layer 1 backstop na 가 가린 부분 / analysis skill 大 변경 → 별 cycle / 사용자 결단 2026-05-30) ② §8.1 2차 corroboration (RealWorld 외 1 PoC 재합성 21.7%대→100% / standing).

**STOP-3**: workspace 868→**873(+5)** ✅ + release-readiness 22/22 ✅ + skill-citation 252 doc 0 stale + version 3-way 11.12.0 + breaking 0 = MINOR.

## [11.11.0] — 2026-05-30 MINOR — use-scenario S2(AX전환) gate: characterization GREEN + augmentation RED 분리 enforcement (C-use-scenario-s2-gate Track α / DEC-2026-05-30-s2-gate-slice)

use-scenario taxonomy(v11.7.0)가 **S2(AX전환)를 주 타깃**으로 선언했으나 Slice 1(v11.9.0)의 gate 매트릭스는 `S2: { test: 'all_fail' }` = S1 fallback 으로 공백이었다. S2 의 본질 = legacy **in-place 증강** → test 산출물이 **characterization**(기존 동작 포착 / impl 존재 → GREEN) + **augmentation**(신규 증강분 / impl 부재 → RED) 혼합인데, aggregate `all_fail` 은 characterization 까지 RED 를 요구해 정상 산출물을 오탐 block (= F-DOGFOOD-007 재현). 본 release = gate 를 **per_tc_outcome 분기**로 구현해 혼합을 검증.

**시행 (additive / breaking 0)**:

- **schema** `schemas/test-spec.schema.json` — test_cases[].items 에 optional `test_intent` enum `[characterization, augmentation]` (미지정 = aggregate fallback / additionalProperties:false 정합).
- **gate** `tools/chain-driver/src/gate-eval.js` — `SCENARIO_EXPECTED.S2.test = 'per_tc_outcome'` + evaluateGate test stage 분기 (`findings.outcome_mismatches > 0` → reason `s2_outcome_mismatch` / severityRank 2 = coverage_threshold 수준 / go-with-warnings 허용). **S1/greenfield/S3 매트릭스 무변경** (S2 분기 격리).
- **validator** `tools/test-impl-pass-validator/src/s2-outcome-check.js` (신규) — 순수 모듈: `reconcileOutcomes(testCases, actualByTcId)` (per-TC expected_outcome ↔ 실 결과 대조 → outcome_mismatches/evaluated/missing_actual) + `correlateByTcId(testResults, testCases)` (test-name → TC-id substring 상관 규약).
- **test** +15 — scenario.test.js +5 (per_tc_outcome mismatch=0 통과 / mismatch>0 block / all-pass 허용 / WARN override / implement GREEN) + s2-outcome-check.test.js +10 (reconcile 6 + correlate 4).

**per_tc_outcome 매트릭스**: characterization → expected_outcome='pass' (legacy 존재 GREEN) / augmentation → 'fail' (impl 부재 RED). gate = aggregate 가 아니라 per-TC expected ↔ actual 일치(`outcome_mismatches`)로 판정. implement stage = S2 도 all_pass.

**§8.1 ≥2 S2 corroboration = 1/2 → WARN enforcement** (intent_certainty v11.6.0 optional-WARN 선례):

- **1차 corroboration (RealWorld / Track α)**: RealWorld(brownfield) 25 TC 전부 characterization → S2 reframe(`test-spec.s2-reframe.json`) **schema-valid** + real gate 코드로 **S1 false-block(F-DOGFOOD-007) → S2 해소** 실증 (`evaluateGate` S1 blocked=true `evidence_missing` / S2 blocked=false). 측정 = `_dogfood-realworld/.../s2-gate-probe.md` + finding F-DOGFOOD-012.
- **2차 = carry**: 실 characterization GREEN **execution** corroboration = Java/Gradle 부재(RISK-ENV-001) → no-simulation 정책상 GREEN 날조 ❌ / runnable S2 환경(poc-17 사내 Java / RealWorld CI) 의무 + augmentation arm 미실증(RealWorld 신규 기능 부재).

→ enforcement = **WARN** (`s2_outcome_mismatch` rank 2 / 사용자 go → go-with-warnings 허용 / hard-block ❌). ≥2 충족 후 rank 격상 = 별 release.

**paradigm 정합**: gate 를 추측으로 hard-lock ❌ — 실 S2 dogfood(RealWorld)가 구동 (dogfood-first / F-007 = real high finding 해결 = self-referential 아님). brownfield 토글(단순 GREEN 패치) ❌ — 시나리오별 매트릭스로 교정 (S1 의 test 대상=생성될 코드 보존 / taxonomy §2.2).

**STOP-3**: workspace test (chain-driver 250 + test-impl-pass-validator 40 / +15 신규) ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.11.0 + breaking 0 = MINOR. **carry**: `C-use-scenario-s2-gate` 부분 시행 (잔여 = ≥2 execution corroboration + augmentation arm → WARN→block 격상). F-DOGFOOD-007 → resolving.

---

## [11.10.1] — 2026-05-30 PATCH — drift-validator phase-flow false-positive 정리 (CRLF 주석 + 횡단 메타 노드) (DEC-2026-05-30-phase-flow-drift-false-positive)

`drift-validator flows` directory mode 가 `analysis.phase-flow.mermaid` 에서 **4 breaking 오탐** (`phase-flow.json` / `poc-findings.md` / `INDEX.md` / `STATUS.md`). 모두 phase data-contract 산출물이 아님 — root cause 2종:

- **CRLF 주석 누출**: `stripComment` 의 `/%%.*$/` 가 CRLF 파일에서 작동 안 함 (JS `.` 는 `\r` 미매치 + `$` 가 trailing `\r` 앞 미매치 → 주석 전체 미제거). Windows CRLF mermaid 의 `%%` 주석 내용(`phase-flow.json`)이 artifact 스캔에 누출. → `normalizePhaseFlow`/`detectPhaseFlowMermaid` 의 `text.split('\n')` → `split(/\r?\n/)` (CRLF-safe / `\r` 제거).
- **횡단 메타 노드**: `CC_FIND["findings/poc-findings.md…"]` + `CC_DEC["… INDEX.md / STATUS.md"]` = cross-cutting 노드(finding-system / decisions 로그) — phase 산출물 아님. → `NON_DELIVERABLE_META` 제외 집합 추가 (`extractArtifactFiles` 에서 `phase-flow.json`/`poc-findings.md`/`findings.md`/`index.md`/`status.md` 필터 / v11.1.0 `META_FILE_RE` 와 동일 패러다임).

배경: v11.1.0 이 "drift-validator flows 5/5 0 breaking" 기재했으나 이후 CRLF/횡단노드 표면화로 regression. **RED→GREEN 정공법** — `compare-phase-flow-artifacts.test.js` +2 회귀 test (CRLF 주석 / 횡단 메타). mermaid·json 산출물 본문 무변경 (validator 로직만 / 진짜 rename drift 검출력 보존).

**+ 3번째 fix (test wiring 정직 정정)**: `compare-phase-flow-artifacts.test.js` 가 v11.1.0 신설 이후 **drift-validator `package.json` test script 에 미등록 = orphaned** (CI 미실행 / v11.1.0 의 4 회귀 test 가 실제로는 안 돌고 있었음). 본 release 에서 test script 에 추가 → 4 기존(미실행) + 2 신규 = **+6 test** 실 wiring.

**STOP-3**: drift-validator 71→**77** (compare-phase-flow-artifacts 4→6 + orphaned wiring) + `flows` 5/5 **0 breaking** ✅ + workspace test 847→**853(+6)** + release-readiness 22/22 ready + skill-citation 0 stale + version 3-way 11.10.1 + breaking 0 = PATCH.

---

## [11.10.0] — 2026-05-30 MINOR — greenfield 산출물 bootstrap (C-use-scenario-taxonomy-impl Slice 2 / greenfield-bootstrap 도구 + 5 skill greenfield-mode) (DEC-2026-05-30-use-scenario-greenfield-bootstrap-slice2)

v11.9.0 Slice 1(시나리오 선언 + gate)의 토대 위에서, **greenfield(신규 / legacy 코드 없음)가 7대 산출물을 실제로 생성해 chain 에 진입**하게 만드는 Slice 2. 사용자 1차 want("신규도 산출물이 나와야 chain 으로 개발·운영"). 옵션 A(DEC-2026-05-30-use-scenario-taxonomy §2.4) = 기존 `analysis-from-*` 재사용 / "analysis 는 코드가 아니라 입력을 요구" 재프레이밍.

**시행 (additive / breaking 0)**:

- **신규 도구 `tools/greenfield-bootstrap/` (24번째 / zero-dep)** — 결정적·testable anchor: ① `swagger-extract.json → openapi.yaml` elevation (zero-dep block-YAML emitter / 이미 파싱된 OpenAPI 의 결정적 승격 / AI 추론 0) ② legacy-only 산출물 N/A 생성 — `antipatterns.json` 빈 배열 + **`meta.na_reason` embed** (top-level `additionalProperties:false` 회피 / `antipatterns.schema.json` strict 정합) + `migration-cautions.md` stub. CLI `--output [--swagger-extract] [--scope] [--channel]` / 순수 변환(환경 의존 0). **29 test** (yaml-emit 12 + elevate 14 + na-artifacts 5 / §8.1 ≥2 swagger fixture = minimal + RealWorld).
- **5 analysis skill greenfield code-optional mode** — `analysis-{architecture,domain-model,business-rules,db-schema-erd,openapi}` 에 "scenario=greenfield 시 코드 대신 입력어댑터 extract 에서 산출 / `source_grounded_evidence`=입력 출처 인용 / `code_pointers`=N/A" 절 추가. schema 는 code_pointers hard-require ❌ → greenfield 산출물 schema-valid.
- **신규 skill `analysis-greenfield-bootstrap`** (57번째 / analysis input phase 등록) — greenfield 진입점. 입력어댑터 패스(코드-고고학 skip) → 결정적 산출(elevation/N-A) → AI 5종 code-optional 산출 → 검증 조율.
- `analysis-input-orchestrate` greenfield 분기(5단계) + `analysis-input-collection` greenfield redirect note.
- doc: `lifecycle-contract.md`(analysis = 코드-고고학[legacy] + 입력어댑터[greenfield] 두 패스 / asset matrix input row) + `use-scenario-taxonomy.md` §3.2 bootstrap 구체 절차 + §5 carry 갱신.

**1 실 dogfood (no-simulation)**: RealWorld(Conduit) swagger-extract → `tools/greenfield-bootstrap` → `openapi.yaml`(3 endpoint/5 schema) = `@readme/openapi-parser` **valid:true / warnings:[]** + `antipatterns.json` = `schema-validator` PASS (antipatterns.schema.json). **정직 표기**: swagger **1채널** 입증 / figma·PRD 2nd 채널 = carry.

**backward-compat**: scenario ≠ greenfield → 모든 greenfield-mode 절 무시 (legacy 코드 추출 경로 그대로 / 기존 818 test 무회귀).

**Slice 2 잔여 carry**: `C-use-scenario-greenfield-dogfood-2nd-channel` (figma/PRD 실 dogfood / §8.1 ≥2 완성) + `C-use-scenario-greenfield-schema-synthesis` (PRD ER 부재 시 entity→table 합성) + `C-use-scenario-s2-gate` (S2 characterization+augmentation 분리 gate).

**STOP-3**: workspace test 818 → **847 (+29)** ✅ + release-readiness 22/22 ready ✅ + skill-citation 0 stale (252 doc) + version 3-way 11.10.0 + drift layout/chain-layout 0 orphan + breaking 0 = MINOR.

---

## [11.9.0] — 2026-05-30 MINOR — use-scenario 선언 plumbing + scenario-aware gate matrix (C-use-scenario-taxonomy-impl Slice 1) (DEC-2026-05-30-use-scenario-impl-slice1)

v11.7.0 use-scenario taxonomy 형식화의 실 구현 carry(`C-use-scenario-taxonomy-impl`) Slice 1. **시나리오 선언 plumbing + RED/GREEN gate 의 scenario 분기** — taxonomy 의 원인인 F-DOGFOOD-007(brownfield RED 오관측 / gate-eval 이 시나리오 모른 채 하드코딩)을 **구조적 해소**. **greenfield 산출물 bootstrap 은 Slice 2 carry**.

**시행 (additive / breaking 0)**:

- `schemas/work-unit-manifest.schema.json` — top-level optional `scenario` enum `[S1,S2,S3,greenfield]` (scope manifest only / required ❌).
- `tools/chain-driver/` — `init --scenario` flag (cli.js) + `createScopeManifest(scope, scenario)` + `ensureScopeDir` passthrough (state-store) + `renderManifestMd` Scenario 줄 (work-unit.js). 소비자는 readManifest 자동 접근.
- `tools/chain-driver/src/gate-eval.js` — `evaluateGate(stage, findings, scenario='S1')` + `SCENARIO_EXPECTED` 매트릭스. **S1/greenfield**=forward(test all_fail RED="생성될 코드 부재" → implement all_pass GREEN) / **S3 특성화**=snapshot(RED 강제 ❌ / mis-gate 수정) / **S2**=Slice 1 S1 fallback (characterization+augmentation 분리 = Slice 3 carry). cmdNext 가 manifest.scenario 전달.
- `tools/chain-driver/test/scenario.test.js` (신규 14 test) — plumbing + schema enum + gate matrix.

**backward-compat**: scenario 미지정 → gate-eval default 'S1' → 기존 동작 동일 (6/6 e2e + gate-eval/state-store test 무회귀 / 기존 PoC manifest 무영향).

**Slice 2+ carry**: `C-use-scenario-greenfield-bootstrap` (analysis-from-\* 재사용 orchestration + planning→output elevation + lifecycle greenfield 경로 / §8.1 ≥2 입력 채널) + `C-use-scenario-s2-gate` (S2 characterization GREEN + augmentation RED 분리 / test-intent labeling).

**STOP-3**: workspace test 804 → **818 (+14)** ✅ + release-readiness 22/22 ready ✅ + skill-citation 0 stale + version 3-way 11.9.0 + breaking 0 = MINOR.

---

## [11.8.0] — 2026-05-30 MINOR — codegraph-runner 신설 (C-codegraph-essential-impl Slice 1 / CodeGraph OSS 필수 도구 wiring) (DEC-2026-05-30-codegraph-essential-impl-slice1)

직전 v11.7.0 이 codegraph = analysis 필수 도구로 결정(DEC-2026-05-30-codegraph-essential)하고 실 wiring 은 carry(`C-codegraph-essential-impl`)했음. 사용자 "C-codegraph-essential-impl 부터 진행" → Slice 1 (도구 실행 + reference-lens 산출물) 시행. **federation(dep-graph 결합)은 Slice 2 carry**.

**사전 검증 (LL-codegraph-02 교훈)**: codegraph v0.9.7 이 환경에 실제 설치·실행 가능 확인 (no-simulation 전제) + CLI 모델 확인 (`init -i`/`index` → `status --json` / SARIF 아님).

**시행 (additive / breaking 0)**:

- `tools/codegraph-runner/` 신설 (23번째 workspace tool) — `codegraph index` 실제 실행(real exec / 7-field evidence / evidence_trust=real_tool) + `codegraph status --json` 통계 → `code-graph.json` manifest. 환경 부재 시 exit 3 정직 신호 (no-simulation / persona 시뮬레이션 ❌). **cross-platform**: Windows 전역 npm bin `.cmd` shim = shell 경유 (Node 22 CVE-2024-27980 완화 정합 / execFileSync('.cmd')=EINVAL → execSync + 경로 quoting). 9 test (manifest 단위 + 실 smoke / §8.1 JS+Java ≥2 stack).
- `schemas/code-graph.schema.json` 신설 — code-graph.json shape (meta/index_stats/evidence) / additionalProperties:false strict / evidence_trust enum {real_tool, simulated}.
- `skills/analysis-code-graph/SKILL.md` 신설 — analysis 단계 cross-cutting aspect (codegraph 필수 도구) / `flows/analysis.phase-flow.json` cross_cutting.aspects.skills[] 등록.

**trust 모델 (DEC-2026-05-28 §4.2 준수)**: code-graph.json = **reference-lens / finding 으로만 수용 / 어떤 결정적 gate 에도 inject ❌** (manifest.trust_note 명시 / gate-eval·release-readiness validator 목록 무변경).

**구현 carry (Slice 2 / `C-codegraph-federation`)**: dep-graph navigate 증강 (codegraph callers/impact) + code-pointer staleness query + cross-domain undeclared 호출 finding + MCP serve. → Senior REVISE @ 40% 영역 / §8.1 corroboration 후 별도.

**STOP-3**: workspace test 795 → **804 (+9)** ✅ + release-readiness 22/22 ready ✅ + skill-citation 0 stale + version 3-way 11.8.0 + breaking 0 = MINOR. drift-validator check-phase-skills (신규 aspect skill 등록) 정합.

---

## [11.7.0] — 2026-05-30 MINOR — use-scenario taxonomy + AX 운영 정체성 형식화 + codegraph 필수화 (DEC-2026-05-30-use-scenario-taxonomy + DEC-2026-05-30-codegraph-essential)

session 55차 `/clear` 후 사용자 방법론 정체성 재진술 chain (ExitPlanMode 5회 거절 = 정체성 정밀화 루프) → 직전 v11.6.0 이 carry 한 `C-use-scenario-taxonomy` 의 **형식화 시행**. **본 release = 형식화 문서만** (설계 SSOT 확립 / 코드·스키마·greenfield 실제 빌드 = carry).

**가장 큰 목적 (P0)**: 산출물 = "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체**. 방법론의 가장 큰 목적 중 하나 = 이 컨텍스트를 평생 유지·동기화하여 **프로젝트를 AX 로 운영**(LLM 이 정확한 컨텍스트로 develop·run·modify·evolve)하는 것. (P1 산출물=LLM 컨텍스트 / P2 bootstrap 입력만 다르고 유지 동일 / P3 dep-graph+codegraph 동기화 / P4 산출물=전 stage base+양방향 역동기화)

**use-scenario taxonomy 4종** (**S2 AX전환 = 주 타깃** / S1 재생성 / S3 특성화 / greenfield): bootstrap 입력에서만 갈리고 모두 같은 정상 상태(AX 운영)로 수렴. 시나리오별 RED/GREEN 매트릭스 = F-DOGFOOD-007 교정 (S1 의 test 대상 = legacy 아니라 생성될 코드). **greenfield = 처음부터 AX-native** — 입력어댑터 analysis(`analysis-from-*`) 재사용(옵션 A)으로 산출물 생성 → gap B(discovery 어댑터가 7대 산출물 미생성 / spec hard-dep 막힘) 해소 설계. 시나리오 선언 = `chain-driver init --scenario`→`work-unit-manifest.scenario` (전 stage 일관 참조).

**codegraph 필수화** (DEC-2026-05-30-codegraph-essential): CodeGraph OSS = analysis 단계 필수 도구(Semgrep 동급 / no-simulation 무조건 실행). **DEC-2026-05-27 codegraph scope-out 의 게이트 폐기** (외부 사용자 = 사용자 직접 결정 / maturity = R19 Tier 2 environment-risk 강등 / probe #1~#3 작동 입증). "폐기" 대상 = codegraph ❌ / 막던 게이트 ✅.

**시행 (additive / breaking 0)**:

- `decisions/DEC-2026-05-30-use-scenario-taxonomy.md` + `decisions/DEC-2026-05-30-codegraph-essential.md` 신설 (SSOT)
- `methodology-spec/use-scenario-taxonomy.md` 신설 (4-case 매트릭스 + greenfield 옵션 A + 선언 위치)
- `CLAUDE.md` + `methodology-spec/lifecycle-contract.md` §가치명세 — INPUT "1차 = legacy single-case" → 4 시나리오 + P0~P4 (additive)
- `methodology-spec/plugin-charter.md` — R21 신설 (요구 20→21 / 활성 19/19) + §2 매핑 ◐ 설계 SSOT
- `decisions/DEC-2026-05-27-codegraph-integration-scope-out.md` — superseded 표기 (역사 trail 보존)
- `decisions/DEC-2026-05-30-fdogfood-003-intent-certainty.md` §6 — carry `C-use-scenario-taxonomy` resolved

**구현 carry (본 release 제외 / §8.1 ≥2 corroboration + STOP-3 의무)**: `C-use-scenario-taxonomy-impl` (chain-driver --scenario flag + manifest.scenario 스키마 + greenfield 재배선 + RED/GREEN gate enforcement) + `C-codegraph-essential-impl` (codegraph 도구 wiring + dep-graph federation) + `C-honesty-tool-cleanup` (no-simulation 절 실행불가 도구 SpotBugs/Daikon 정직 cleanup).

**STOP-3**: workspace test 영향 0 (형식화 문서만) + release-readiness 22/22 ready + skill-citation 0 stale + version 3-way 11.7.0 + breaking 0 = MINOR. 5 LL (LL-usc-01~03 + LL-codegraph-essential-01~02).

---

## [11.6.0] — 2026-05-30 MINOR — discovery `intent_certainty` enum (F-DOGFOOD-003 / MyBatis+JPA arm ≥2 corroboration / DEC-2026-05-30-fdogfood-003-intent-certainty)

RealWorld dogfood 2nd arm(JPA / `1chz/realworld-java21-springboot3`)이 F-DOGFOOD-003(discovery BR-INTENT reasoning 의 intent 과잉귀속)을 재현 → MyBatis arm(#1) + JPA arm(#2) **§8.1 ≥2 corroboration 충족** → 보류 패치(Option B) 잠금 해제 시행.

**문제**: discovery `business_rules_intent.reasoning` 의 의도 과잉귀속을 Option C guardrail(prose marker `[관찰]/[결과]/[미검증]`)로만 막는데, **검사 validator 부재**(skill 자인 / discovery-extraction-validator 는 br_id match 만) = 양심 의존 = no-simulation 안티패턴. JPA arm 에서 validator 0 findings 인데 reasoning 엔 unverified-intent 존재로 재입증 (동일 3 패턴: login 단일메시지 / slug→SEO / updatedAt-vs-createdAt정렬 소스반증).

**해결 (additive / breaking 0)**:

- `schemas/discovery-spec.schema.json` — business_rules_intent.items 에 `intent_certainty` enum (`observed`/`inferred-consequence`/`unverified-intent`/`source-refuted`) **optional** 추가. prose marker 의 구조화 승격.
- `tools/discovery-extraction-validator` — `intent_certainty` 부재 시 **WARN**(low / non-blocking / 채택 nudge) + test 4 신규 (13/13 pass).
- `skills/discovery-identify-business-intent/SKILL.md` — intent_certainty 구조 라벨 의무 instruction + enum↔marker 매핑표 + line 61 "비결정적" 문구 갱신.
- dogfood 산출물 소급: JPA + MyBatis discovery-spec 14 BRI 에 intent_certainty 부여 (분포 observed 8 / unverified-intent 3~4 / inferred-consequence 1~2 / source-refuted 1).

**Patch B (F-DOGFOOD-007 / brownfield RED) = 본 release 제외 / carry** — 사용자 재진단: "brownfield 토글" ❌ / use-scenario(S1 재생성 / S2 AX 전환 / S3 특성화) taxonomy 필요. F-007 은 S1(코드 재생성)에서 대부분 오관측(test 대상=생성될 코드). 별도 설계 결단 (DEC-2026-05-30-fdogfood-003-intent-certainty §carry).

**STOP-3**: workspace test (discovery-extraction-validator 9→13 / +4) + skill-citation **0 stale** (poc-17 forward-ref hygiene 동반 정정) + version 3-way 11.6.0 + breaking 0 = MINOR.

---

## [11.5.1] — 2026-05-29 PATCH — discovery-extraction-validator multi-path BR lookup (paradigm-level resilience / DEC-2026-05-29-validator-multi-path-br-lookup)

> session 54차 = poc-17 chain 1 forward 차단 추정 결함 (LL-poc-17-15 / session 53차 carry queue 본격 promotion `C-validator-dual-key-businessrules`) → Phase 1 validator src + test 시행 → Phase 2 외부 PoC 실측 시점 본격 사실 정정 발견 — **pre-fix 도 GREEN** (사용자 chain 1 진입 직전 normalize 우회로 chain 1 forward 자격 이미 충족). 본 fix 실제 가치 = paradigm-level resilience 추가 (test 4 신규 / 미래 PoC dual-key + suffix 일관 paradigm 산출 시 자연 인식 / 외부 normalize 우회 불필요). additive only / breaking 0 / 본 PoC 영향 0.

> paradigm A (self-referential drift 회피) 본격 가치 self-입증 사례 — session 53차 LL-poc-17-15 본문 "Phase 3 validator 실행 결과 = 12 CRITICAL" narrative + chain-intervention-log root_cause "validator 는 rules array 만 lookup" 본문 = 실제 validator 코드와 mismatch (validator 는 `rules.business_rules` 를 봄). self-기록 사실 검증 부족 cycle 의 본격 본격 자기-차단 사례 — paradigm A retract 자격 자연 ❌ / paradigm A 본격 강화 axis 자연.

### Added

- `decisions/DEC-2026-05-29-validator-multi-path-br-lookup.md` — 본 release SSOT
- `tools/discovery-extraction-validator/src/validator.js` BR lookup 다중 경로 본격 보강 (additive backward-compat):
  - `analysis?.rules?.business_rules` (기존 가정 / backward-compat / v11.0.0~v11.5.0)
  - `analysis?.business_rules` (top-level array / poc-17 chain 1 normalize paradigm)
  - `analysis?.rules` (top-level rules array / analysis baseline 자연 paradigm)
  - `analysis?.rules_step_4c_carcost` (dual key 두번째 / poc-17 Phase 4c paradigm)
- `tools/discovery-extraction-validator/test/validator.test.js` neuer `describe('multi-path BR lookup (v11.5.1)')` block — 신규 test 4종 (additive):
  - top-level `business_rules` array (poc-17 normalize) 매치 입증
  - top-level `rules` array (suffix 없음 / analysis baseline) 매치 입증
  - `rules_step_4c_carcost` (dual key) 매치 입증
  - 어느 경로에도 없으면 critical 본격 발생 (회귀 차단)

### Changed

- (없음 — 본 release = additive only / 기존 path 보존 / breaking 0)

### Test 영향

- workspace test 787 → **791 (+4)** / 0 fail ✅
- 본 PoC `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/` 안 validator 직접 실행 = **0 findings / UC coverage 100%** (pre-fix + post-fix 동일 / 본 PoC 영향 0 입증)

### Carry resolved

- ✅ `C-validator-dual-key-businessrules` (session 52차 LL-poc-17-09 + session 53차 LL-poc-17-15 promotion) — paradigm-level resilience 본격 추가로 본격 종결
- paradigm A 본격 강화 axis 본격 자산화 (LL-validator-dual-key-01~03 / 본 plan §8)

### Carry (별 cycle)

- C-schema-regex-paradigm-completion (axis 3 Layer 1 schema 자체 본격 검토 / Type 2 외부 사용자 자연 trigger 의무)
- 본 PoC 안 통합 array (`business_rules` top-level / -001 suffix) = 자연 폐기 자격 (선택적 / 본 fix 후 자연 가능 / 본 PoC 차기 cycle 또는 다음 PoC 자연 처분)

---

## [11.5.0] — 2026-05-29 MINOR — analysis-business-rules skill 본문 BR id strict instruction 본격 추가 (axis 3 / paradigm drift 영구 차단 / DEC-2026-05-29-axis-3-skill-strict-instruction)

> poc-17 chain 1 discovery 첫 사내 live 시행 시 표면화된 paradigm drift (schema strict regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` vs analysis-from-\* skill enforcement 부재 → AI meaningful name 자유 paradigm 산출 → chain 진입 시 schema-validator RED → patch fix 임시 우회) 의 영구 해결 (Path 2 / skill 본문 enforcement). 사용자 의제 결단 ("포맷팅 대로 되는게 좋다" / context engineering 본격 답: prefix 의미 + suffix 식별자 양수 가치 본격). additive only / breaking 0 / methodology body 1 파일 갱신 (skill 본문).

### Added

- `decisions/DEC-2026-05-29-axis-3-skill-strict-instruction.md` — 본 release SSOT
- `skills/analysis-business-rules/SKILL.md` §3 안 BR id 형식 의무 instruction 본격 추가 (1 unit / additive):
  - regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` 정합 의무
  - form = `BR-<DOMAIN>-<SUBJECT>-<NNN>` (예: `BR-USER-VERIFY-001` / `BR-RBAC-PRIORITY-001` / `BR-CARLIST-PAGINATION-001`)
  - prefix 의미 직관 (LLM 컨텍스트 read) + suffix 식별자 (machine 매칭 / typo silent fail 차단)
  - meaningful name 단독 산출 ❌ / patch fix 본격 발생 차단
  - paradigm 본격 정합 근거 = poc-17 chain 1 first 표면화 (사실 기록)

### Changed

- (없음 — 본 release = additive only / breaking 0 / 기존 paradigm 본격 보존 / 기 산출 PoC #01~#16 BR id 본격 보존 자격 / 새 PoC analysis baseline 진입 시점 부터 본 instruction 본격 적용)

### Migrated / Backward-compatible

- 본 PoC poc-17 analysis baseline 안 business-rules.json `rules` + `rules_step_4c_carcost` array (legacy meaningful name paradigm) = 본격 보존 (cross-link 자산 영향 회피)
- 본 PoC chain 1 discovery 시행 시 동시 normalize 시행한 `business_rules` 통합 array (additive normalize / -001 suffix) = 본 instruction 본격 1:1 정합 사실

### Carry (Type 2 외부 사용자 자연 trigger 시점)

- C-other-analysis-skills-strict-cascade — analysis-api-rule-mapping + discovery-identify-business-intent 등 cross-skill 본격 strict 정합 의무 검토 (paradigm coherence)
- C-other-id-patterns-strict — AP id (`^AP-[A-Z0-9_-]+-[0-9]{3}$`) + UC id + AC id + BHV id + TASK id + TC id + IMPL id 본격 strict pattern 동일 paradigm 정합 의무 검토

---

## [11.4.0] — 2026-05-29 MINOR — sub-rule §X-H v1.2.0 본격 cascade + methodology-spec §사례 3 갱신 (poc-17 Phase 1 첫 corroboration / DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration)

> poc-17 ifrs/car 도메인 Phase 1 analysis baseline 본격 종결 (12 phase 전수 / 25+ 산출물 / 43 finding / 16 AP / cross-DB 18 자산) 직후 본격 사실 누적 본격 자산화 cycle (A+B+C+D 전체 시행 / 사용자 결단). additive only / breaking 0.

### Added

- `decisions/DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration.md` — 본 release SSOT
- sub-rule `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X-H 4 sub-section 본격 신축:
  - (1) 자산 실측 / (2) sub-axis 자동화율 **81.25%** 본격 측정 / (3) §X-H-11 신축 AP / (4) R1'-c DB axis 첫 corroboration
- §X-H-11 신축 AP 11종 본격 자산화 (`AP-LEGACY-IBATIS2-DB-001~011`):
  - N+1 / N+5 subquery / cross-DB direct / 외부 SP EXEC / raw JSP / **PII 하드코딩 critical** / dead SQL / magic constants / insert-as-update / debug stdout / parallel array / N1 cross-DB
- methodology-spec §사례 본격 확장 3:
  - `db-assets-always-on.md` §8 — DB Tables 6 정정 + cross-DB 18 자산 본격 가치 입증 + 자동 validator 부재 carry
  - `sp-conversion-policy.md` §10 — γ 1건 + 사내 utility function 2건 (FN_SPLIT + fn_lpad) + `<procedure>` tag 본격 입증
  - `baseline-delta-operating-model.md` §5 신설 — canonical global baseline 첫 본격 적용 + cadence 3 단계 + K + L 정책 통합 입증

### Changed

- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.1.2 → **v1.2.0 MINOR**
- `decisions/PROGRESS-poc-17-dogfooding.md` Phase 1 본격 종결 entry (마스킹)
- `decisions/INDEX.md` 시간순 entry 등록
- memory 2 갱신 (외부 / release 본문 변경 ❌):
  - `feedback_composite_view_pattern.md` — PoC #02 4건 → **PoC #17 5건** 본격 확장
  - `feedback_finding_threshold.md` — F-021 임계 paradigm 갱신 (legacy paradigm 별 30~60 신축)

### Preserved (본 cycle 변경 ❌)

- sub-rule §2 core 5 AP (AP-LEGACY-IBATIS2-001~005) 변경 ❌
- ADR-CHAIN-010/014/015 변경 ❌ / schema 변경 ❌ / skill·agent body 변경 ❌
- workspace test 본격 추가 ❌

### M.2 측정 axis 사실 누적 (9종)

K (DB always-on) first live (18 cross-DB) / L (SP α/β/γ/δ) first live (γ 1 + 사내 utility 2) / R1' axis 4번째 corroboration (PoC #06+#07+#11+#17) / R1'-c (DB axis) 첫 sub-axis corroboration / sub-rule §X-H 첫 live (sub-axis 81.25%) / chain harness 5 gate (analysis chain 0 / 12 phase 전수) / baseline-delta (canonical global 첫 본격) / 사내 source 격리 (LL-codegraph-07) 첫 live / Composite View 5건 사내 + Scenario C 첫 사내.

### Finding 누적 (43건 / F-021 임계 본격 초과)

critical 1 (F-PII-HARDCODE-001) / high 6 / medium 14 / low 16 / observation 6 (3 해소). **legacy paradigm 별 임계 신축** (memory): 일반 PoC 5~15 vs legacy PoC 30~60 → poc-17 = 43건 정합 / 명세 부실 ❌.

### LL 후보 4

LL-poc-17-01 (dogfooding live probe 첫 본격 입증) / LL-poc-17-02 (legacy PoC finding 본격 누적 자연 사실) / LL-poc-17-03 (sub-axis = R1' axis 별 metric) / LL-poc-17-04 (Composite View 본격 압축 가치 입증).

### STOP-3 통과

workspace test 영향 ❌ + release-readiness 22/22 보존 + skill-citation 0 stale + version 3-way 11.4.0 + breaking 0 = MINOR.

### carry queue 본 cycle 외

C-sub-axis-3-poc-corroboration (자격 1/3) / C-c-layer-baseline-재측정 / C-jsp-parser-augment / C-db-autoval / F-PII-HARDCODE-001 즉시 정정 (사내 source / 사용자 결단) / chain 1 discovery 진입 (poc-17 car-list pilot).

---

## [11.3.0] — 2026-05-28 MINOR — DB 자산 always-on 정책 + SP 4 분류 매트릭스 (poc-17 ifrs/car dogfooding cascade / ADR-CHAIN-014/015)

> poc-17 ifrs/car dogfooding Phase 1.5 (2026-05-28 / 사용자 명시) carry — K (DB always-on) + L (SP 전환) 정책 cascade. 직전 release 가 methodology-spec 신설 + DEC + ADR 만 정공 → 본 release 가 **schema cascade + validator gate + docs cascade + finding 자산화** 본격 완결. additive only / breaking 0. 첫 carry F-CHA-poc17-001 (chain-driver `init` paradigm 명세 부재) Type 2 외부 사용자 channel 자연 발현 사례 등재.

### Added

- **`schemas/work-unit-manifest.schema.json`** `analysis_refs` 4 DB 자산 필드 additive (db-assets-always-on.md §5 정합):
  - `db_tables[]` (string array) — scope 관련 DB Table 식별자
  - `db_procedures[]` (object array — `id` required / `sp_conversion_class` enum α|β|γ|δ / `external` boolean) — scope 관련 SP list + plan stage 결단 carry
  - `db_functions[]` (string array)
  - `db_views[]` (string array)
  - description 갱신: "canonical global 5 이식성 산출물" → "canonical global 9 이식성 산출물 (5 + DB 자산 4)"
- **`schemas/task-plan.schema.json`** `sp_conversions[]` 필드 additive (sp-conversion-policy.md §8 정합):
  - 7 properties: `sp_id` / `sp_name` / `external` / `sp_conversion_class` (α/β/γ/δ enum) / `rationale` (minLength 5) / `verification_oracle` / `adr_ref` (pattern `^ADR-[A-Z0-9_-]+-[0-9]{3}$`)
  - `additionalProperties: false` strict / required: sp_id + sp_conversion_class + rationale
  - top-level $comment 권장 필드 list 갱신 (sp_conversions 추가)
- **`tools/plan-coverage-validator/`** gate #3 SP 분류 검증 본격 활성 (chain 3 plan stage):
  - `validateSpConversions(taskPlan)` 신규 export — 4 finding kinds:
    - `plan.sp_conversion.no_adr_for_gamma` (high) — γ classification 시 adr_ref required
    - `plan.sp_conversion.gamma_not_external` (medium) — γ + external≠true inconsistency
    - `plan.sp_conversion.weak_rationale` (medium) — rationale 길이 < 10
    - `plan.sp_conversion.delta_no_oracle` (medium) — δ classification + verification_oracle 부재
  - cli.js 갱신 — `--json` 출력에 `sp_conversions` 결과 포함 + help text §9 추가
  - test 8 신규 (β / γ 정합 / γ no adr / γ not external / weak rationale / δ no oracle / α 정합 / empty)
- **`methodology-spec/finding-system.md`** F-CHA namespace F-CHA-poc17-001 정식 등재:
  - chain-driver `init <project>` cwd 기준 상대경로 paradigm 명세 부재 — 자기 디렉토리 안 자기 이름 인수 호출 시 중첩 hit
  - Severity: low~medium / Status: **logged** (v11.3.0 doc fix 시행)
  - Type 2 외부 사용자 dogfood channel 자연 발현 첫 사례 (poc-17 ifrs/car / `feedback_live_probe_vs_retroactive` 정합)
- **`tools/chain-driver/README.md`** `## init <project> 호출 paradigm` 절 신설 — 두 권고 paradigm (부모 디렉토리 호출 / `init .`) + 안티패턴 회피 명세 / 사용자 양심 의존 우회 표지

### Changed

- **`methodology-spec/lifecycle-contract.md`** §자산 매핑 매트릭스 5 column → **6 column** (DB 자산 입력 axis 추가 / db-assets-always-on §6 정합):
  - 9 row 의 DB 자산 의무 명세 — input/analysis(전체)/discovery(scope-related)/spec(schema 변경)/plan(SP 결단)/test(fixture)/implement(migration script)/design(❌)/cross-cut(traceability/aspect)
- **`methodology-spec/baseline-delta-operating-model.md`** canonical global 디렉토리 명시 (db-assets-always-on §4 정합):
  - §2 자산 지도에 `.aimd/output/stored-procedures/` + `.aimd/output/functions/` 디렉토리 row 신설 (기존 `schema.json` + `erd.mermaid` 보존)
  - `related_artifacts` (자연어) ↔ `analysis_refs` (schema 정공 명) 동의어 명문화 (SSOT prose drift 정정)
  - §3 운영 cadence (1) baseline 수립 단계에 DB 자산 always-on 정책 인용
  - §4 baseline carry 규약에 DB 자산 drift cascade 항목 추가
  - §6 인용에 db-assets-always-on + sp-conversion-policy 2 SSOT 추가
- `tools/plan-coverage-validator/src/validator.js` 검증 list header 8 → 9 (validateSpConversions 추가)

### Verified

- workspace test: plan-coverage-validator 36 → **44 pass** (8 신규 sp_conversions describe block / 0 fail)
- 3-way version sync: package.json + plugin.json + CHANGELOG = **11.3.0**
- backward-compat: legacy task-plan (sp_conversions 부재) → validateSpConversions = 0 findings (legacy carry 정합 / breaking 0)
- schema additive: work-unit-manifest analysis_refs / task-plan sp_conversions 모두 optional → 기존 PoC 14종 ratchet 분모 미영향

### STOP-3

workspace test 전수 pass ✅ + 3-way version sync 11.3.0 ✅ + breaking 0 (전부 additive 또는 doc cascade) ✅. release-readiness 22/22 검증 = `scripts/release-readiness.js` 실행 의무.

**DEC**: DEC-2026-05-28-db-assets-always-on + DEC-2026-05-28-sp-conversion-policy (직전 cycle 신설)
**ADR**: ADR-CHAIN-014-db-assets-always-on + ADR-CHAIN-015-sp-conversion-policy (직전 cycle 신설)

**Trigger**: poc-17 ifrs/car dogfooding Phase 1.5 (2026-05-28 / 사용자 명시 듀얼 목표 / `decisions/PROGRESS-poc-17-dogfooding.md` 정합).

---

## [11.2.0] — 2026-05-28 MINOR — analysis schema chain-link 일관성 정정 (ADR-CHAIN-013 / PoC #15 dogfood 발견)

> PoC #15 (디렉토리 `examples/poc-16-efiweb-car-spring41/`) 의 12 analysis 적재 후 artifact-graph 안 **83% (10/12) orphan** 발견. 본 결함 = graph-synthesizer 도구 매핑 부족 아닌 **methodology 본체 schema 의 chain-link 일관성 결함**. 3 layer 매핑 표준 (chain-side + analysis-side self-ref + meta fallback) 영구 명문화.

### Added

- `schemas/meta-confidence.schema.json`: optional `related_chain_ids[]` 필드 신설 — 15 analysis + 4 aspect 모두 `$ref` 공유 (DRY / 단일 파일 = 19 schemas 동시 확장). pattern `^(UC|BHV|AC|TASK|TC|IMPL)-[A-Z0-9_-]+$`.
- `tools/traceability-matrix-builder/src/graph-synthesizer.js`:
  - `CHAIN_TO_ANALYSIS_REFS` 확장 — AC 안 추가 매핑 가능 (현 BHV/AC 유지)
  - `ANALYSIS_TO_CHAIN_REFS` 신설 (Layer 2) — 6 kinds 의 self-ref iteration: formal-spec.sequences[].uc_id / characterization-spec.snapshots[].use_case / api.operations[].related_use_case_id / ui-ux.pages[].related_use_cases + components[].related_use_cases / sql-inventory.inventory[].uc_link / domain.bounded_contexts[].aggregates[].related_use_cases (nested 2-deep)
  - meta.related_chain_ids loop (Layer 3 fallback) — 5 schemas (architecture/db-schema/state-map/type-spec/error-mapping-spec) 의무 + universal optional
- `docs/adr/ADR-CHAIN-013-analysis-chain-link-consistency.md`: 3 layer chain-link 매핑 표준 정식 ADR (PoC #15 dogfood 발견 + Layer 1/2/3 권위 표 + 향후 PoC 작성자 의무)
- `tools/traceability-matrix-builder/test/graph-synthesizer.test.js`: `v11.2.0 analysis chain-link 일관성 (ADR-CHAIN-013)` describe block 신설 (9 신규 test — Layer 2 6종 + Layer 3 fallback + orphan 회귀 차단 + dangling 가드)

### Changed

- PoC #15 (poc-16-efiweb-car-spring41):
  - artifact-graph 재합성: nodes 42 → **44** / edges 54 → **109** (cross_reference 34 → 89) / orphan **10 → 0**
  - 산출물 파일명 정합: `api-extension.json` → `openapi-extension.json` / `schema.json` → `db-schema.json` (ANALYSIS_FILENAMES 정합)
  - 6 산출물 backfill: domain.aggregates / ui-spec.pages / sql-inventory.inventory 안 ref 필드 명시
  - 6 산출물 meta.related_chain_ids backfill (architecture / db-schema / state-map / type-spec / error-mapping-spec / visual-manifest)
- PoC #15 REPORT.md: D-axis 100% 본격 달성 (4/4 axis pass) + F-POC15-S5-004 (graph-synthesizer 한계 carry) 정식 해소 표기

### Fixed

- F-POC15-S5-004: graph-synthesizer 의 `CHAIN_TO_ANALYSIS_REFS` 매핑 부족 = 본체 schema 결함 = 정식 해소

### Verified

- workspace test: 770 → **779 pass** / 0 fail (신규 9 + 기존 770)
- PoC #05 (sample-user-register) 회귀 0: nodes 18 / edges 29 / orphan 0 / cycle 0 (analysis 2 = BR+AP 만 적재 → 신규 매핑 trigger ❌)
- PoC #15 (poc-16-efiweb-car-spring41) graph-integrity passed=true: orphan 10→0 / cycle 0 / unknown_edges 0
- PoC #15 code-pointer-validator strict: coverage.ratio=1.0 / missing=0 / findings=0 회귀 유지
- 3-way version sync 11.2.0: package.json + plugin.json + CHANGELOG entry

### STOP-3

workspace test 779/779 pass ✅ + 3-way version sync 11.2.0 ✅ + PoC #05 회귀 0 ✅ + PoC #15 orphan 0 ✅. release-readiness 22/22 검증 = §scripts/release-readiness.js 실행.

**DEC**: DEC-2026-05-28-analysis-chain-link-일관성

---

## [11.1.0] — 2026-05-27 MINOR — v11 discovery-spec cascade 완결 + drift-validator outputs 비교 신설 (F-MB-010·F-MB-011)

> end-to-end 흐름 점검 결과, v11.0.0 이 "active doc cascade 완료" 로 기재했으나 실제로는 `planning-spec`→`discovery-spec` rename 이 flows·docs·chain-driver runtime 에 미흡수 (선언↔실상 모순). 본 release 가 잔여 cascade 를 완결하고, 동종 발산을 재발 차단할 drift-validator 산출물명 비교를 신설. RED→GREEN paradigm 정합.

### Added

- **drift-validator phase-flow 산출물명 비교** (F-MB-011 / 신규 capability = MINOR):
  - `normalize-phase-flow.js` — `phases[].inputs[]/outputs[]` (JSON) + mermaid 노드 라벨 (사람 눈) 에서 산출물 파일명 추출 (`extractArtifactFiles` / `*.phase-flow.*` 메타파일 제외).
  - `compare-phase-flow.js` — mermaid 산출물명이 JSON inputs/outputs 에 부재 → **breaking** (rename 누락 / 산출물명 drift) / JSON 만 → info (중간 산출물 정상). 이중 렌더링 SSOT = JSON 계약.
  - `test/compare-phase-flow-artifacts.test.js` 4 케이스 회귀 고정.

### Changed

- **`planning-spec`→`discovery-spec` rename cascade 완결** (F-MB-010 / DEC-2026-05-26-discovery-spec-rename §4 미완료분):
  - **flows**: `discovery.phase-flow.mermaid` OUT 노드 + `sdlc-4stage-flow.{json,mermaid}` + `spec.phase-flow.{json,mermaid}` (입력/NEXT) + `flows/README.md`. spec.phase-flow.mermaid 동반 stale 정정 (NEXT "chain 3 (test)"→"(plan)" / `revisit:planning`→`revisit:discovery`).
  - **docs**: `lifecycle-contract.md` (CHAIN 1·data-contract·tree·schema 목록 + plan stage v11 contract 강제 BE/FE prose 보강) + `README.md` + `guides/chain-harness-guide.md` + `guides/first-prompt-cookbook.md` + `agents/README.md` (plan-agent placeholder→gate #3 본격 표기 동반). `plan-spec`→`task-plan` (chain 3 산출물명) 동반 정정.
  - **runtime hard replace** (PoC frozen 보존 = 사용자 결단): `chain-driver/src/hooks-bridge.js`·`revisit-detect.js`·`work-unit.js` = `discovery-spec.json` keying 으로 교체 (신규 산출물 dep-graph 노드 인식·revisit 감지·traceability 추출) + 4 test fixture 갱신.

### Fixed

- **`finding-system.md:934` brace-notation citation** (`{swagger,plan-doc}-extract.schema.json` → 두 파일명 명시) — skill-citation-validator 오파싱 → `skill_citation_integrity` + `workspace_test_pass` 2 gate regress 해소 (단일 원인 / 외부 figma source-grounding finding 산물).

### Carry (잔여 / 별건)

- `tools/traceability-matrix-builder/src/builder.js` `derived_from` + `tools/formal-spec-link-validator` (CHAIN_ARTIFACT_BY_NAME + `planning_spec_path` schema 필드) = PoC artifact·behavior-spec 필드명 bound → 교체 시 PoC 깨짐 (discovery-spec=chain 1 backward link 없어 실효 영향 ≈ 0). C-dep-graph-v11-paradigm-cascade carry 와 합치.

### STOP-3

- workspace test 전수 pass + release-readiness **22/22 ready** (regress 2 → 0) + skill-citation 0 stale + version 3-way 11.1.0 + drift-validator flows 5/5 0 breaking + chain-layout/state-flow ✅ = MINOR (additive validator capability + corrective cascade).

DEC-2026-05-27-v11-discovery-spec-cascade-완결.

---

## [11.0.3] — 2026-05-27 PATCH — analysis-extraction-validator 신설 (F-162·F-163 구조적 carry 청산)

> F-162 / F-163 의 근본 carry — analysis stage 의 source-grounded hard gate 부재 — 를 validator 신설로 청산. discovery-extraction-validator 가 discovery stage 에 한 것을 analysis stage 입력 어댑터 산출물에 대칭 적용. tools 21종 → 22종.

### Added

- **`tools/analysis-extraction-validator/`** (신규 npm workspace / 13 test pass):
  - figma-extract / plan-doc-extract adapter 자동 감지 (`components`·`screens` → figma / `uc_candidates`·`glossary` → plan-doc)
  - 검증: TEXT 노드 `text_content` 부재 → **critical** (F-162) / `provenance` 부재 또는 가시 텍스트 `inferred` → **high** (F-163) / `inferred` 비율 > threshold(default 0.5) → **medium** (사용자 확인 권고)
  - CLI: `--extract <path> [--threshold <0..1>] [--dry-run] [--json]` / critical·high 시 exit 1
- **`root package.json` workspaces**: `tools/analysis-extraction-validator` 등록.

### Changed

- `skills/analysis-from-figma/SKILL.md` + `skills/analysis-from-plan-doc/SKILL.md`: 산출 자격 조건에 validator 자동 검증 명령 참조 추가.
- `methodology-spec/finding-system.md`: F-162 / F-163 의 validator carry → **resolved** 갱신 (swagger evidence 필드만 잔여 carry).
- `CLAUDE.md`: tools 21종 → 22종.

### 잔여 carry (δ 후속)

- `swagger-extract` evidence 필드 (LOW / parser verbatim 추출이라 후순위).

---

## [11.0.2] — 2026-05-27 PATCH — F-163 input-adapter source-grounded 비대칭 전수 점검 + plan-doc fix

> F-162 후속 sweep. analysis stage 5 adapter vs discovery stage 4 adapter 의 source-grounded 의무 전수 대조 — figma 단발 누락이 아닌 stage 전반 구조적 비대칭 확인.

### 점검 결과 (F-163)

| adapter                    | figma 동형 위험                                  | 조치         |
| -------------------------- | ------------------------------------------------ | ------------ |
| analysis-from-figma        | (F-162 resolved)                                 | —            |
| **analysis-from-plan-doc** | **MEDIUM** (UC명/정의를 원문 인용 없이 LLM 요약) | 본 cycle fix |
| analysis-from-swagger      | LOW (parser verbatim / domain·rules 추정)        | carry        |
| analysis-from-prompt       | 없음 (assumptions+confidence 이미 보유)          | no-action    |
| analysis-html-template     | 없음 (외부 analyzer 실행 의무)                   | no-action    |

### Fixed

- **`schemas/plan-doc-extract.schema.json`**: `uc_candidates[]` + `glossary[]` 에 `source_excerpt` (verbatim quote) + `provenance` (verbatim|inferred) 필드 추가. (optional — PATCH 호환)
- **`skills/analysis-from-plan-doc/SKILL.md`**: 절차 6/7 원문 인용 의무 + "no-simulation 의무 / 산출 자격 조건" 절 신설 (verbatim 우선 / inferred 명시 / inferred 비율 > 0 시 GO-STOP gate 노출).
- **`methodology-spec/finding-system.md`**: F-163 등록 (resolved / plan-doc fix / swagger·validator carry).

### Carry (δ 후속)

- `swagger-extract` evidence 필드 추가 (LOW / parser verbatim 이라 후순위).
- **analysis-extraction-validator 신설** — `discovery-extraction-validator` 패턴 차용 / provenance=inferred 비율 hard gate / analysis 5 adapter 공통 적용 (구조적 비대칭 근본 해소).

---

## [11.0.1] — 2026-05-27 PATCH — F-162 analysis-from-figma verbatim 검증 의무화 (외부 dogfood 발견)

> δ Type 2 외부 consumer repo (mis-fe-admin EAM 통합권한조회) 실전 dogfood 에서 자연 표면화한 첫 corrective fix. `feedback_self_referential_corrective_drift.md` 가 명시적으로 기다리던 외부 채널 발견 → self-referential drift 아님 → 본 cycle fix 정당.

### 배경 (F-162)

`analysis-from-figma` 는 `discovery-from-figma` 가 가진 source-grounded 의무 (LLM 추론 금지 / node 실 인용 / grep_hit 검증) 를 **비대칭으로 결여**. `figma-extract.schema.json` 에 TEXT 노드의 verbatim 표시 텍스트 (`characters`) 를 담을 필드조차 없어, 라벨/버튼/헤더를 `get_metadata` layer name + OpenAPI 파라미터로 **추론**해 채우는 silent fallback 허용. 실 피해: consumer repo spec md 가 추론 라벨을 "✅ Figma 검증 완료" 로 GO-STOP gate 통과 → cycle 13 Figma MCP `get_design_context` 실 verbatim 추출 결과 spec ≠ Figma 갭 8건 실증.

### Fixed

- **`schemas/figma-extract.schema.json`**: `components[]` 에 `text_content` (verbatim 표시 텍스트 / TEXT 노드 의무) + `provenance` (`verbatim` | `inferred`) 필드 추가. `name` description 에 "레이어명 ≠ 표시 텍스트" 명시. (optional 추가라 기존 산출 호환 — PATCH)
- **`skills/analysis-from-figma/SKILL.md`**: 절차 2 verbatim 의무화 + 절차 3 silent skip 금지 (TEXT 노드 sub-frame `get_design_context` 재호출 의무) + provenance 태깅. "산출 자격 조건" 절 신설 (TEXT verbatim 의무 / inferred 금지 대상 / inferred 비율 > 0 시 finding+gate 노출). scope-out 의 "추정 ❌" 을 텍스트 라벨까지 확대.
- **`methodology-spec/finding-system.md`**: F-162 등록 (Status: resolved / schema+SKILL fix / validator 신설은 carry).

### Carry (δ 후속)

- analysis-figma 전용 source-grounded validator 신설 (`discovery-extraction-validator` 패턴 차용 / provenance=inferred 비율 임계 hard gate).
- 동형 비대칭 점검: `analysis-from-swagger` / `analysis-from-prompt` 등 다른 input-adapter 의 source-grounded 의무 일관성.

---

## [11.0.0] — 2026-05-26 MAJOR — v11.0.0 paradigm cascade 본격 시행 종결 (8 결단 + 5 chain stage 산출물 본격 통합)

> session 48차 paradigm SSOT 확립 + session 49차 schema/skill body cascade + 본 session 안 Phase 2f-prime + sub-phase + Phase 3 + Phase 4 + Phase 5 본격 시행 종결. v11.0.0 MAJOR breaking — `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename + BE/FE 산출물 분리 paradigm 본격 + Epic/Story/Task(OP-_)/Sub-task(TASK-_) 4-level cascade + ticket=plan stage 한 곳 (R20-prime) + contract 강제 양 axis (BE swagger / FE state-map+DTCG).
>
> ## 8 결단 본격 시행 종결
>
> | #   | 결단                                                          | 시행                                                     |
> | --- | ------------------------------------------------------------- | -------------------------------------------------------- |
> | 1   | `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename | ✅ schema/skill/tool/PoC 모두 cascade                    |
> | 2   | BE/FE 산출물 분리 paradigm (stage 별 axis 다름)               | ✅ schema if/then 강제 본격                              |
> | 3   | ticket = plan stage 한 곳 (R20→R20-prime)                     | ✅ skills/ticket-sync SKILL.md 본문 재설계               |
> | 4   | UC 유지 (User Story 추가 부재)                                | ✅                                                       |
> | 5   | Epic = FE 화면 단위 (또는 BE-domain)                          | ✅ task-plan.epic_refs 본격                              |
> | 6   | Story = cross-cut anchor (BE+FE/DB/E2E)                       | ✅ task-plan.story_refs + AC.story_ref                   |
> | 7   | OP-_ (Story sibling Task entity) 신설 + TASK-_=Sub-task 명시  | ✅ operational-task.schema.json + task-plan.op_task_refs |
> | 8   | contract 강제 양 axis (BE swagger / FE state-map+DTCG)        | ✅ schema if/then layer 1/2/3 hard gate                  |
>
> ## 본 session 시행 (Phase 2f-prime + sub-phase + Phase 3 + Phase 4 + Phase 5)
>
> ### Phase 2f-prime — `skills/ticket-sync/SKILL.md` 본문 재설계
>
> - 5 stage matrix (analysis/planning/spec/test/implement) × 2 phase 본격 폐기
> - **plan stage 단일** 4-level cascade 일괄 (Epic + Story + OP-_ + TASK-_) 본문 본격
> - phase enum: `enter` / `exit` / `update-test-red` / `update-impl-green`
> - stage paradigm 위반 시 reject (`F-TICKETSYNC-012 stage_paradigm_violation`) 본격 정합
> - 환경 resolve prelude (DWPD issuetype_map / parent_strategy / epic_link_customfield_id / Sub-task auto-inherit B14 / Structure 자동 B15) 본격 보존
>
> ### sub-phase — `tools/planning-extraction-validator` → `tools/discovery-extraction-validator` rename
>
> - `git mv tools/planning-extraction-validator tools/discovery-extraction-validator`
> - workspace npm rename + package.json name + bin name 본격
> - chain-driver REQUIRED_VALIDATORS_PER_STAGE.discovery 본격
> - flows + scripts/release-readiness + 활성 docs 모두 cascade
> - backward-compat alias (`--planning` flag / `transformPlanningExtraction` function alias / dispatchValidator case 'planning-extraction-validator') 본격 보존
>
> ### Phase 3 — template body 본격 채움
>
> - `templates/planning/` → `templates/discovery/` rename (`git mv`)
> - `templates/spec/` 신설
> - **13 신규 template body** (`.json` + `.md` 이중 렌더링 / ADR-008 v2):
>   - `templates/discovery/discovery-spec.template.{json,md}` (2)
>   - `templates/spec/behavior-spec.template.{json,md}` + `acceptance-criteria.template.{json,md}` (4)
>   - `templates/plan/task-plan.template.{json,md}` + `epic-story-op.template.md` (3)
>   - `templates/test/test-spec.template.{json,md}` (2)
>   - `templates/implement/impl-spec.template.{json,md}` (2)
> - `templates/README.md` 본격 갱신 (5 chain stage 본격 활성)
> - `skills/_base-apply-template/SKILL.md` 인식 artifact list 21 → 27 (analysis 21 + chain 6) 본격 확장 + chain stage prerequisite 명시
>
> ### Phase 4 — 10 PoC sweep 본격
>
> - `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename × **10 PoC** (poc-03 / poc-04-mini / poc-05 / poc-06 / poc-07 / poc-08 / poc-09 / poc-10 / poc-11 / poc-14)
> - `derivation_source.planning_spec_path` → `discovery_spec_path` sed batch × 10 PoC (acceptance-criteria + behavior-spec + task-plan)
> - release-readiness `poc_corroboration` discovery-spec.json 우선 인식 본격
> - release-readiness `ANALYSIS_VALIDATOR_TARGETS` set 안 discovery-spec.json 본격 추가 + planning-spec.json legacy carry
> - `analysis_validator_violation` 본격 해소 (20 violations → 0)
> - `validators_violation` poc-05 chain-coverage cmd discovery-spec.json 본격 전환
>
> ### Phase 5 — v11.0.0 release
>
> - CHANGELOG entry 본 표기
> - version 3-way sync 10.1.1 → 11.0.0
> - workspace test 746/746 pass ✅
> - release-readiness **22/22 ready** ✅
> - skill-citation 0 stale ✅
>
> ## breaking change scope (v11.0.0 MAJOR 자격)
>
> ### 직접 breaking
>
> - 산출물 file 명 `planning-spec.{json,md}` → `discovery-spec.{json,md}` (10 PoC + active doc 정합)
> - schema `derivation_source.planning_spec_path` → `discovery_spec_path` (behavior-spec / acceptance-criteria / task-plan)
> - workspace tool `tools/planning-extraction-validator` → `tools/discovery-extraction-validator` (npm package + bin name)
> - `templates/planning/` → `templates/discovery/` + `templates/spec/` 신설
> - `methodology-spec/deliverables/17-planning-spec.md` → `17-discovery-spec.md`
> - skills/ticket-sync SKILL.md 본문 paradigm 본격 재설계 (5 stage matrix 폐기 / plan 단일 본격)
>
> ### backward-compat carry
>
> - tools/discovery-extraction-validator/src/cli.js — `--planning` flag alias 보존 (deprecated / 차기 v12.x retract)
> - tools/findings-aggregator — `transformPlanningExtraction` function alias + `'planning-extraction-validator'` dispatchValidator case 보존
> - release-readiness `poc_corroboration` discovery-spec.json OR planning-spec.json (legacy 둘다 인식)
>
> ## STOP-3 + paradigm 적합 점검
>
> | STOP-3                                  | 상태                                                            |
> | --------------------------------------- | --------------------------------------------------------------- |
> | workspace test 746/746 pass             | ✅                                                              |
> | release-readiness 22/22 ready           | ✅ (analysis_validator_violation 해소 + poc_corroboration 갱신) |
> | skill-citation 0 stale (245 active doc) | ✅                                                              |
> | version 3-way 11.0.0                    | ✅ (CHANGELOG + plugin.json + version-check 3-way)              |
> | breaking 본격 (MAJOR 자격)              | ✅ (8 결단 본격 cascade)                                        |
>
> **paradigm 본격 진전** (self-referential corrective drift ❌) — v11.0.0 MAJOR 본격 cascade 종결. session 48차 paradigm SSOT → session 49차 schema/skill body cascade → 본 session Phase 2f-prime + Phase 3 + Phase 4 + Phase 5 종결. self-celebration inflation ❌ — 본격 prod 가치 진전 paradigm 결단 8종 시행 종결.
>
> ## Lessons Learned (자산화)
>
> - **LL-v110-04** (template skill citation false-positive) — template 안 placeholder ADR/UC/BHV ID 가 skill-citation-validator 의 `\bADR-(?:[A-Z]+-)?\d{1,3}\b` 패턴 매칭 → 실 ADR 부재 시 stale citation 오류. 해소 = `ADR-<scope>-NNN` 등 `<` 포함 placeholder syntax 사용 (FP_LINE regex `<[a-z-]+>` 정합).
> - **LL-v110-05** (1 session 안 MAJOR release cascade 본격 자격) — paradigm 본격 진전 (8 결단 시행) + ≥ 22/22 release-readiness + ≥ 745+ workspace test + 0 stale citation + 3-way version sync 동시 충족 시 본격 자격. LL-v930-02 cap (1 session 1 MAJOR) 본격 정합.

---

## [10.1.1] — 2026-05-26 PATCH — C-v4.1-poc-재실행 부분 종결 (5 PoC task-plan 생성 / plan-agent e2e 입증)

> 사용자 "마지막 carry 처리하자" → option A 채택 (5 가능 PoC 전부 + spec 부재 5 = 서브-carry). additive PoC artifact / methodology 무변경 / breaking 0 = PATCH.
>
> v10.0.0 plan-agent 본격 구현 후에도 미해소였던 C-v4.1-poc-재실행 carry. 점검 결과 5 PoC (poc-03/04-mini/05/11/14) 만 prerequisite (behavior-spec + AC) 보유. 나머지 5 PoC (poc-06/07/08/09/10) 는 spec stage 미실행 = 서브-carry.
>
> | PoC         | tasks  | ADRs  | risks  | NFR    | 특성                                       |
> | ----------- | ------ | ----- | ------ | ------ | ------------------------------------------ |
> | poc-04-mini | 1      | 1     | 2      | 3      | FE Login + JWT (Zod ADR)                   |
> | poc-05      | 2      | 1     | 4      | 4      | signup + login (argon2 ADR)                |
> | poc-03      | 2      | 2     | 4      | 4      | RealWorld NestJS (argon2 + JWT ADR)        |
> | poc-14      | 4      | 2     | 4      | 4      | user + todo (IDOR 차단)                    |
> | poc-11      | 6      | 2     | 5      | 4      | 사내 EFI-WEB billing characterization mode |
> | **합계**    | **15** | **7** | **18** | **19** | —                                          |
>
> - **schema 정합**: task-plan.schema.json VALID 5/5 (task granularity 1-3 AC / ADR alternatives ≥3 / risks severity enum / NFR ISO 25010:2023 9 characteristic).
> - **Type 1 self-run corroboration ≥ 5** (§8.1 strict ≥ 2 충족 / chain harness plan stage e2e 입증 / 다른 도메인+stack 단일 PoC 과적합 회피).
> - **STOP-3**: release-readiness 20/20 (보존) + skill-citation 0 stale + version 3-way 10.1.1 + breaking 0 = PATCH.
> - **잔여 서브-carry**: poc-06/07/08/09/10 (spec stage 미실행 / 각 PoC × behavior-spec + AC 실행 의무 = task-plan 보다 더 heavy / v10.x).
>
> DEC-2026-05-26-poc-task-plan-5. Partial resolve C-v4.1-poc-재실행 (5/9 = 56%).

## [10.1.0] — 2026-05-26 MINOR — discovery-from-{figma, swagger, nl-md} 3 SKILL.md body 본격 구현 (DEC-2026-05-26-input-skill-roles §2 carry 종결)

> 사용자 "잔여 적용" 결단 (v10.0.4 trigger carry 보류 권고 override) → option α 본격. additive doc / breaking 0 / 신규 기능 = MINOR.
>
> v10.0.4 가 paradigm (analysis-from-_ baseline ↔ discovery-from-_ scope 진입 timing/책임 분리) 만 명문화하고 `discovery-from-{figma, swagger, nl-md}` 3종은 light placeholder 로 두었던 것을 **본격 SKILL.md body 작성**. `discovery-from-analysis-output` (v9.0.0 본격 / 137 line) pattern 정합 / 책임 범위·입력·산출·no-simulation·절차·인용 6 섹션.
>
> | skill                    | source 채널                            | UC 추출                                                                                  | NFR axis                        | line |
> | ------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------- | ---- |
> | `discovery-from-figma`   | figma file + selected frame            | MCP 4 도구 → frame nodes → 사용자 flow                                                   | 부 (a11y/responsive/transition) | ~70  |
> | `discovery-from-swagger` | openapi.yaml / swagger.json            | OpenAPI parse → operation 별 summary/description → UC + I/O contract + schema constraint | 부 (security/rate-limit/SLA)    | ~65  |
> | `discovery-from-nl-md`   | markdown 기획문서 / in-conversation NL | structural parse (heading/paragraph/sentence index) → 사용자 flow 패턴                   | **1차 채널** (NL 만이 명시 NFR) | ~80  |
>
> 각 entry source_grounded_evidence 의무: figma=`figma:<file_id>:<node_id>` / swagger=`openapi:<path>:<operationId>` / nl-md=`doc:<filepath>:<para>:<sentence>` 또는 `prompt:<message_id>:<line>`. 산출 = `.aimd/output/planning-spec.json`. LLM fabrication ❌ (특히 nl-md NFR — verbatim quote 권장 + `planning-extraction-validator` grep_hit_count > 0 강제).
>
> - **동반 doc 갱신**: `methodology-spec/lifecycle-contract.md` §Input 어댑터 timing 분리 (4 모두 본격) + `guides/first-prompt-cookbook.md` §2.1 timing note + `decisions/DEC-2026-05-26-input-skill-roles.md` §2 carry resolved 표기.
> - **STOP-3**: release-readiness 20/20 (보존) + skill-citation 0 stale + version 3-way 10.1.0 + breaking 0 = MINOR.
> - **잔여 carry**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy validation / v10.x / Type 1 self-run).
>
> DEC-2026-05-26-discovery-input-bodies. Resolves DEC-2026-05-26-input-skill-roles §2 carry.

## [10.0.4] — 2026-05-26 PATCH — C-v4.1-input-skill-이관 결단 종결 (analysis-from-_ ↔ discovery-from-_ timing 분리 paradigm / option α light)

> 사용자 "최초에 분석은 analysis 에서 하는데 한번 분석이 끝난 프로젝트는 그냥 다양한 input 을 받도록 하고 싶다" → option α light 채택. additive doc / breaking 0.
>
> **paradigm 명문화** (baseline-delta 운영 모델 입력 측면 / v10.0.1 정합):
>
> | set                    | timing                           | 책임                                                                       | skill                                                                                            |
> | ---------------------- | -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
> | `analysis-from-*` (4)  | 최초 1회 (legacy baseline 수립)  | analysis 산출물 (visual-manifest / inventory / domain 등 canonical global) | `analysis-from-{figma, swagger, prompt, plan-doc}` 모두 본격 구현                                |
> | `discovery-from-*` (4) | 신규 건마다 (scope 진입 trigger) | UC + intent + flow → planning-spec                                         | `discovery-from-{analysis-output(본격), figma(light placeholder), swagger(light), nl-md(light)}` |
>
> 같은 source(figma/swagger/NL md) 라도 baseline 시 vs scope 진입 시 = **다른 목적/다른 산출**. 양쪽 set 평행 유지 / 중복 ❌ / 다른 axis ✅.
>
> - **시행** (additive doc / breaking 0):
>   - `skills/discovery-from-{figma, swagger, nl-md}/SKILL.md` 3 placeholder description 갱신 (paradigm 반영 + analysis-from-\* timing 분리 명시 + use case 트리거 carry 표기).
>   - `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 다음에 **§Input 어댑터 timing 분리** 신설 (두 set 평행 표).
>   - `guides/first-prompt-cookbook.md` §2.1 discovery 섹션 timing 분리 note.
>   - `decisions/DEC-2026-05-21-chain-discovery-plan-stage-도입.md` carry 표 `C-v4.1-input-skill-이관` ✅ 종결 표기 + option α light 결단 명시.
> - **STOP-3**: release-readiness 20/20 ready (보존) + skill-citation 0 stale + version 3-way 10.0.4 + breaking 0 = PATCH.
> - **잔여 carry (use case 트리거 의존)**: `discovery-from-{figma, swagger, nl-md}` 본격 구현 = 해당 채널로 scope 진입하는 실 사용자 등장 시 별도 PATCH/MINOR. 현 사내 배포 전 단계 ROI 정합 (light placeholder 유지). 그 외: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy / v10.x).
>
> DEC-2026-05-26-input-skill-roles. Resolves C-v4.1-input-skill-이관.

## [10.0.3] — 2026-05-26 PATCH — 잔여 carry quick wins 종결 (macOS env test fix + session-재시작-검증 표기)

> 사용자 "남은 carry 처리하자" → 잔여 4 carry 정밀 점검 → Quick wins(env + session-LL) 채택. corrective / breaking 0.
>
> - **env test fix**: `tools/chain-coverage-validator/src/validator.js` `autoDetectProjectRoot` cross-platform path normalization. POSIX `dirname()` 이 `\` 를 path separator 로 안 봐서 Windows path 입력 시 `'.'` 반환 → dirname **전** backslash→slash 정규화로 해소. → `node --test tools/chain-coverage-validator/test/validator.test.js` **38/38 pass** (이전 37/38) / **release-readiness 19/20 → 20/20 ready**.
> - **C-v4.1-session-재시작-검증 종결 표기**: DEC-2026-05-21 carry 표 안 해당 row 에 ✅ + LL-v4-04 자산화 location 명시 (DEC-05-17 + DEC-05-21 등재 완료 / protocol 자산 = 별도 코드/문서 작업 없음).
> - **STOP-3**: workspace all pass + release-readiness **20/20** + skill-citation 0 stale + version 3-way 10.0.3 + breaking 0 = PATCH.
> - **잔여 carry (사용자 결단 보류)**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy / v10.x) + C-v4.1-input-skill-이관 (figma·swagger 실 중복 / discovery-from-figma 는 v4.1 PLACEHOLDER 그대로 / 3 옵션 결단 의무).
>
> DEC-2026-05-26-quick-carry-close.

## [10.0.2] — 2026-05-26 PATCH — v10.0.0 gate 재번호 prose+flow coherence (이전 session WIP 통합 + prose 전면 정합)

> v10.0.0 이 machine 층(stage-graph gate map #1~#5)만 하고 **개별 phase-flow gate phase + plan agent/skills/templates + guides·README·lifecycle prose** 를 미정합으로 남긴 drift 청산. corrective / breaking 0.
>
> **발견 경위**: 사용자 "WIP부터 같이 들여다보자" → working tree 의 이전 session 중단 작업(plan-stage gate 정합 WIP) 분석 → v10.0.0 의 chain N = gate #N 가 phase-flow 렌더링 + plan agent/skills + guides·README·lifecycle prose 까지 전파 안 됨 발견. drift-validator 가 chain-flow master mermaid + 개별 phase-flow gate 번호 vs stage-graph map 정합 을 안 봐 v10.0.0/v10.0.1 STOP-3 통과한 잔존 (제 v9.0.1 코herence redux 패턴).
>
> **번호 규칙 확정**: chain N = gate #N 1:1 (#1 discovery / #2 spec / **#3 plan** / #4 test / #5 implement) / "gate id ≠ chain" framing 폐기 / plan placeholder · deferred 표기 전면 해제.
>
> - **WIP 통합** (이전 session 중단 작업 / 정합 + 정확): `flows/plan.phase-flow.{json,mermaid}`(plan **gate-3 phase 추가** / 다른 flow 와 구조 대칭) + `flows/test.phase-flow.{json,mermaid}`(gate-3 → **#4**) + `flows/implement.phase-flow.{json,mermaid}`(gate-4 → **#5**) + `agents/plan-agent.md`("gate #plan/deferred" → "gate #3 hard gate 활성") + `skills/plan-{decompose-and-sequence,risk-and-nfr}/SKILL.md` + `templates/README.md` + `templates/plan/`(신규).
> - **prose 정합 11 파일**:
>   - `methodology-spec/lifecycle-contract.md`: OUTPUT block(plan #3 / test #4 / impl #5) + 5영역 plan row 본격 + 매핑 매트릭스 plan row 본격(skills 7 + gate #3 + plan-coverage-validator) + data-contract plan 절 placeholder 해제 + tree + traceability TASK layer + gate #1~#4 → #1~#5.
>   - `methodology-spec/skills-axis.md`: §4·§7.2·§9.2 plan placeholder 해제 (plan-agent skills 7 / chain 3 본격).
>   - `methodology-spec/id-conventions.md`: plan ID = task-plan TASK-_/ADR-_.
>   - `methodology-spec/deliverables/22-traceability-matrix.md`: gate #1~#5 + TASK layer.
>   - `README.md`: CHAIN block(plan #3 / test #4 / impl #5) + scenario plan step 본격 + validator block(gate #1~#5 + plan-coverage-validator) + tree placeholder 해제.
>   - guides 4종: `chain-harness-guide.md` mermaid + sequenceDiagram + "gate id ≠ chain" 폐기 / `getting-started.md` 5-5 plan 본격 + gate 번호 / `first-prompt-cookbook.md` 2.3 Chain 3 plan skill-map / `common-errors.md`(검증).
>   - briefing 2종: `01-main.md` flow 다이어그램 + skill tree + "5번의 게이트" / `slides/methodology-deck.md` value block + flow + chain 책임 표 + revisit 8 + asset 표 + multiagent.
>   - `flows/README.md`: master SSOT "5 gate (chain N = gate #N)" + plan.phase-flow 본격.
> - **STOP-3**: drift state-flow(6=6) + chain-layout(5 stage / **31 phase** = +1 plan gate-3) + phase-flow 짝(plan/test/implement) 0 breaking + release-readiness 19/20(env fail 1 = macOS Windows-path test / 본 PATCH 무관) + skill-citation 0 stale + version 3-way 10.0.2 + breaking 0 = PATCH.
>
> DEC-2026-05-26-gate-renumber-coherence. Resolves v10.0.0 phase-flow + prose drift 잔존 (machine 층 완성 후 렌더링/prose 미정합).

## [10.0.1] — 2026-05-26 PATCH — baseline-delta 운영 모델 문서화 (v4.1 폐기 브랜치 carry 점검 → 실행)

> 사용자 "정리해줘 그리고 carry 실행해줘". 폐기된 v4.1 브랜치(feat/v4.1-\*) 개념을 현 main(v10.0.0)과 대조한 결과, discovery/plan stage·hooks 정합·plan-agent·traceability 확장은 v9.0.0~v10.0.0 에서 모두 완성. **유일 미해소 깨끗한 doc carry = DEC-2026-05-21 `C-v4.1-baseline-delta-운영-문서화`** 실행. additive doc / breaking 0.
>
> - **신설**: `methodology-spec/baseline-delta-operating-model.md` — "초기 1회 full analysis + 신규 건 delta 갱신" 운영 모델.
>   - 두 baseline axis 구분: 분석 baseline(canonical global `.aimd/output/`) vs 품질 baseline(`baseline-<date>.json` / ADR-010 ratchet).
>   - 운영 cadence 3단계: 초기 full 1회 → 신규 건 scope delta(`related_artifacts` 상속 / 재분석 ❌) → 레거시 변경 시 변경 영역만 재분석 + M4 `sync_state` + `chain-driver sync` 통제 cascade.
>   - baseline carry 규약: 단일 source 참조 / drift 자동감지·cascade 수동 / 품질 baseline 단조(ratchet up) / iter-N carry(`inherited_from.carry_artifacts`).
>   - 70~80% axis 정합 (운영 모델 = process cadence / metric 불변).
> - **carry resolve**: DEC-2026-05-21 carry 표 `C-v4.1-baseline-delta-운영-문서화` ✅ 종결 표기 + DEC-2026-05-26-baseline-delta-operating-model 신설.
> - **STOP-3**: workspace 737/737(보존) + release-readiness target 10.0.1 + skill-citation 0 stale + version 3-way 10.0.1 + breaking 0 = PATCH.
> - **carry (점검 중 식별)**: poc-재실행(기존 PoC plan-spec 추가 / v10.x) + input-skill-이관(`analysis-from-*` ↔ `discovery-from-*` 공존 처분 결단) + lifecycle-contract plan placeholder prose drift(v10.0.0 잔존 점검).
>
> DEC-2026-05-26-baseline-delta-operating-model. Resolves DEC-2026-05-21 §carry C-v4.1-baseline-delta-운영-문서화.

## [10.0.0] — 2026-05-25 MAJOR — Phase 4-4' axis A plan stage paradigm 본격 구현 (gate 번호 재정렬 widespread breaking / chain N = gate #N 1:1 INTERNAL CONVENTION) + cooling-off paradigm 영구 폐기 재확인

> session 47차 / 본 conversation 안 5 commit cluster 통합 + 1 release ceremony.
>
> **trigger 발화 chain** (paradigm dispute → 본격 시행):
>
> 1. 사용자 "이번 session 에서 뭐하면 되나" → "Phase 4-4' 준비 (plan 작성만)"
> 2. plan-mode 시행 → `~/.claude/plans/jiggly-mapping-hopper.md` 작성 완료
> 3. ExitPlanMode 후 사용자 "진행" → paradigm STRONG-STOP signal 보고 → option A (차기 session 시행)
> 4. 사용자 "cooling-off 를 왜하는건가?" → paradigm 메타 dispute
> 5. 사용자 "cooling-off 아예 없애도 되는거 아닌가?" → AskUserQuestion A. 폐기 + B. 본 conversation Cluster 2~5 시행
>
> **paradigm 본격 결단** (session 47차 prod 가치 진전):
>
> - **cooling-off paradigm 영구 폐기 재확인** (DEC-2026-05-25-cooling-off-영구-폐기-재확인) — v2.2.0 (2026-05-08) "패기해줘" 폐기 → v9.x 재도입 cycle (19일 만) → v10.0.0 폐기 재확인 / paradigm-without-teeth 본격 입증 (actual 발동 case 0 / 사용자 push back 2회 / 본 레포 cadence 5 release/1day)
> - **chain N = gate #N 1:1 INTERNAL CONVENTION 본격 정합** (DO-178C SOI / IEC 62304 isomorphic 사상 / 직접 standard 표기 ❌ / official-docs-checker REVISE-1 흡수)
>
> **시행 — 5 Cluster commit (widespread breaking)**:
>
> | Cluster          | scope                                                                                                                                               | commit    |
> | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
> | 1 (외부 session) | B1+B2 stage-graph.js gate 재번호 (plan='#3' / test='#4' / impl='#5') + state.schema.json enum +'#5' / +'plan'                                       | `e5c8672` |
> | 2                | B4+B5 sdlc-4stage-flow.json revisit_edges 8→9 + gate 재번호 + plan.phase-flow.json placeholder=false + 2 DEC 신설 + INDEX 갱신                      | `676f948` |
> | 3                | B3+B6 ADR-CHAIN-001 chain 4단계→5단계 + ADR-CHAIN-002 4 gate→5 gate + plan gate prompt                                                              | `142852e` |
> | 4                | B7 F-CHA-001 trio integration test 6 시나리오 신규 (validator critical + cli exit 1 + hooks deny + trio 통합 + gate enum 정합 + requiredValidators) | `568bcb2` |
> | 5                | B8 CLAUDE.md + README + agents-axis + chain-driver/README sweep + release-readiness #18+#19+#20 신규 criterion                                      | `4e28619` |
>
> **STOP-3 달성**:
>
> - workspace test **737/737 pass** (731 → 737 / +6 / F-CHA-001 trio integration test 신규)
> - **release-readiness 20/20 ready:true** (17 → 20 / #18 gate_enum_consistency + #19 legacy_4_stage_expression_absent + #20 plan_gate_operational 신규)
> - drift-validator 7 pair / 0 breaking / state-flow consistency PASS / chain layout PASS
> - skill-citation 0 stale (DEC-2026-05-25-axis-a-phase-4-4-prime 신설로 회복)
> - version 3-way 10.0.0 (CHANGELOG / plugin.json / package.json)
>
> **BREAKING CHANGE**:
>
> - gate.id enum 의미 재할당 — test '#3'→'#4' / implement '#4'→'#5' / plan '#3' 신규
> - state.json 영속 last_gate.stage='plan' 신규 진입 자격 (외부 사용자 state.json reset 또는 manual migration 의무 / 실측 poc-14: last_gate=null 영향 ❌)
> - plan.phase-flow.json version 0.1.0-placeholder → 1.0.0
> - cooling-off ≥24h paradigm = 영구 폐기 재확인 (재도입 자격 ≥2 PoC corroboration + Adzic SBE strict 정합 의무 / 사실상 ❌)
>
> **paradigm 메타 인지** (session 47차 paradigm 진화 본격):
>
> - **LL-v1000-01** — cooling-off paradigm-without-teeth 본격 입증 (actual 발동 case 0 / 사용자 push back 2회 / DEC-2026-05-08 "패기해줘" 19일 만 재도입 cycle 차단)
> - **LL-v1000-02** — paradigm 부활 cycle = self-referential corrective drift 의 본격 paradigm 사례 (AI 가 영구 폐기된 paradigm 을 19일 만 재도입 carry note 안에 표기 = paradigm honesty 위배)
> - **LL-v1000-03** — 사용자 메타 질문 = STRONG-STOP signal + paradigm dispute 자격 (Auto Mode 안에서도 메타 dispute 자격 보고 의무)
> - **LL-v1000-04** — paradigm 격상 자격 = ≥2 PoC corroboration + Adzic SBE strict 정합 의무 (1 사건 일반화 + AI persona 권고 + industry case 단순 인용 = paradigm 격상 자격 부재)
> - **LL-v1000-05** — INTERNAL CONVENTION paradigm framing 본격 정합 (chain N = gate #N 1:1 / DO-178C SOI / IEC 62304 isomorphic / 직접 standard 표기 ❌ / official-docs-checker REVISE-1 흡수)
>
> **session 안 4 release cap (LL-v930-02) 정합**: session 47차 = 본 v10.0.0 release **1회** (Cluster 1 외부 session e5c8672 + Cluster 2~5 본 conversation = 통합 1 release).
>
> **차기 carry**:
>
> - Phase 4-5 (v10.1.0 MAJOR / ticket subsystem 6-stage migration / Type 2 외부 사용자 ≥1 corroboration trigger 의무 / deadline 없음 / OSS 채택 의존)
> - methodology-spec/ + decisions/ + schemas/ + history doc + skill SKILL.md 안 "4단계" 표현 잔존 (≈25 files / historical SSOT 보존 / 별 patch release carry 자격)
> - DEC-2026-05-25-axis-a-phase-4-4-prime + DEC-2026-05-25-cooling-off-영구-폐기-재확인 2 DEC SSOT 보존
>
> Resolves F-CHA-001 본격 해소 (Senior BLOCKER-2 trio integration test 6/6 pass) + F-CHA-003 5 axis 본격 해소 (gate 번호 재정렬 + state.schema enum + flows + ADR + RR criterion).

---

## [9.3.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-4 minimal (gate #plan trio enforcement 본격 활성 / Senior BLOCKER-2 잔여 본격 해소 / additive only / breaking 0)

> session 46차 연속 4번째 release / v9.2.0 직후 사용자 "다음 진행" + "B cooling-off retract" + "추천 (옵션 1 minimal)" 결단 → Phase 4-4 minimal scope 본격 시행.
>
> **paradigm 메타 인지** (LL-v930-01): decision_cadence_24h_cooling_off paradigm retract 자격 본격 ✓ — minimal scope (additive only / breaking 0) + Senior BLOCKER-2 잔여 본격 해소 + 사용자 명시 결단 trigger. Phase 4-4 full scope (Cluster 1 X gate 번호 재정렬 widespread breaking) = retract 자격 ❌ / 별 session v10.0.0 MAJOR cooling-off 의무.
>
> **시행** (additive only / breaking 0 / Senior BLOCKER-2 잔여 본격 해소):
>
> - **stage-graph.js `getGateForStage('plan')` = null → '#plan'** (1 line / generic trio mechanism 본격 작동 자격 확보 / 번호 부여 ❌ / Cluster 1 X 재번호 = Phase 4-4' v10.0.0 MAJOR carry)
> - **test +1** — `tools/chain-driver/test/stage-graph.test.js` line 41 갱신 + v9.3.0 신규 test ('#plan' string ID + Cluster 1 번호 부여 ❌ 정합 검증)
> - **DEC-2026-05-25-axis-a-phase-4-4 신설** (Phase 4-4 minimal scope SSOT)
>
> **본격 변경 ❌ axis** (LL-v911-01 minimal scope 정합 / Phase 4-4' + 4-5 carry):
>
> - gate 번호 재정렬 (Cluster 1 X / discovery #1 / spec #2 / plan #3 / test #4 / impl #5) = Phase 4-4' v10.0.0 MAJOR carry
> - flows/sdlc-4stage-flow.json revisit_edges 갱신 (8 → 10) = Phase 4-4' carry
> - ADR-CHAIN-002 §1 gate UX prose 갱신 = Phase 4-4' carry
> - state.schema.json gate enum 갱신 = Phase 4-4' carry
> - ticket subsystem 6-stage migration = Phase 4-5 carry
>
> **STOP-3**: workspace 730 → **731/731 pass** (chain-driver 224 → 225 / +1) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.3.0 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
>
> - **LL-v930-01** — cooling-off retract 자격 paradigm 본격 입증 (decision_cadence "큰 구조 결단만 24h / additive only 즉시" 정합 / Senior BLOCKER-2 잔여 minimal scope retract 자격 ✓ / full scope = 별 session 의무)
> - **LL-v930-02** — session 안 4 release 연속 cadence 본격 paradigm (session 43차 4 release self-referential corrective cycle 와 본격 차이 = paradigm-level prod 가치 진전 vs doc drift fix / 단 4 release cap 본격 의무)
> - **LL-v930-03** — Node.js assert API 정합 paradigm (assert.notMatch ❌ / assert.doesNotMatch ✅ / test 작성 시 본격 API 정합 검증 의무)
>
> **본 session 누적 4 release** = v9.1.0 + v9.1.1 + v9.2.0 + v9.3.0.
>
> **carry (Phase 4-4' + 4-5 / 차기 session)**:
>
> - Phase 4-4' (v10.0.0 MAJOR / cooling-off ≥24h 의무 / structural / widespread breaking) — gate 번호 재정렬 (Cluster 1 X) + flows revisit_edges 갱신 + ADR-CHAIN-002 prose + state.schema gate enum
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-4. Resolves F-CHA-001 부분 해소 (plan gate ID 신설로 generic trio mechanism 본격 활성 자격 / 통합 test = Phase 4-4' carry) + F-CHA-003 Phase 4-4 minimal 부분 해소.

---

## [9.2.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-3 시행 (DO-178C 6 layer 격상 / additive only / breaking 0)

> session 46차 연속 진입 (v9.1.1 직후) / 사용자 결단 "진행" → Phase 4-3 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5).
>
> **Cluster 3 결단 본격 시행** — **AC → TASK → TC** paradigm 정합 (DO-178C 5 tier → 6 layer 격상 / System Req ↔ HLR ↔ LLR ↔ Source ↔ Test → UC ↔ BHV ↔ AC ↔ **TASK** ↔ TC ↔ IMPL).
>
> **시행** (additive only / breaking 0 / Senior risk #4 본격 흡수):
>
> - **A6 `schemas/traceability-matrix.schema.json` cell.task_id additive** — pattern `^TASK-[A-Z0-9_-]+-[0-9]{3}$` / optional (required ❌) / additionalProperties:false strict 정합 (properties 안 추가)
> - **A6 `tools/traceability-matrix-builder/src/builder.js` TASK layer 매핑** — `chain.taskPlan ?? null` optional input + `taskByAC` index (1 AC = 1 task / first-match / 1~3 AC 묶음 paradigm 정합) + cell.task_id 채움 (taskPlan 있을 때만) + derived_from 안 'task-plan.json' 추가
> - **test +3** — `tools/traceability-matrix-builder/test/builder.test.js`:
>   1. backward compat (taskPlan 부재 시 cell.task_id 부재 / 회귀 0)
>   2. green cell + task_id (taskPlan 입력 시 cell.task_id 채움)
>   3. yellow cell + task_id (impl missing 시 task_id 채움 / Senior risk #4 — additive only)
> - **DEC-2026-05-25-axis-a-phase-4-3 신설** (Phase 4-3 SSOT)
>
> **Senior risk #4 본격 흡수** (LL-v920-01): DO-178C 6 layer 격상 시 기존 PoC ratchet 분모 미영향 본격 보장 = task_id optional + first-match 매핑 + cell-level 추가만 (required ❌ / 분모 변경 ❌). 기존 PoC #05 + #14 회귀 0 본격 보장.
>
> **STOP-3**: workspace 727 → **730/730 pass** (traceability-matrix-builder 82 → 85 / +3 TASK layer test) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.2.0 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
>
> - **LL-v920-01** — TASK layer additive only paradigm 본격 입증 (Senior risk #4 회피 / DO-178C 6 layer 격상 + 기존 PoC 분모 미영향 본격 보장)
> - **LL-v920-02** — schema field add MINOR cadence paradigm 본격 입증 (optional schema field + properties 안 추가 + required 불포함 = backward compat / criterion add precedent 동형)
> - **LL-v920-03** — 3 release 연속 cadence 본격 입증 (session 46차 v9.1.0 + v9.1.1 + v9.2.0 / additive only / cooling-off ❌ 자격 본격 / Phase 4-4 v10.0.0 MAJOR = structural / cooling-off ≥24h 의무)
>
> **본 session 누적 3 release** = v9.1.0 (Phase 4-1) + v9.1.1 (Phase 4-2) + v9.2.0 (Phase 4-3).
>
> **carry (Phase 4-4~4-5 / 차기 session)**:
>
> - Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement (Senior BLOCKER-2 잔여)
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-3. Resolves F-CHA-003 Phase 4-3 부분 해소 (traceability TASK layer 종결 / 5 axis 종결 / gate trio + ticket migration = Phase 4-4+4-5 carry).

---

## [9.1.1] — 2026-05-25 PATCH — axis A plan stage paradigm 본격 구현 Phase 4-2 시행 (additive only / breaking 0)

> session 46차 연속 진입 (v9.1.0 직후) / 사용자 결단 "gogo" → Phase 4-2 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5).
>
> **시행** (minimal scope / additive only / breaking 0):
>
> - **A4 `agents/plan-agent.md` body** (placeholder → body) — frontmatter `skills:` 7 skill 사전 주입 (3 plan-\* + 4 base utility / spec-agent.md 동형 paradigm) / 책임 범위 + Absolute priorities 7개 + 호출 절차 8 step + 산출 자산 4종
> - **A5 `tools/chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.plan 추가** — `plan: ['plan-coverage-validator', 'schema-validator']` 1 line additive
> - **test +1** — `tools/chain-driver/test/gate-eval.test.js` `requiredValidators('plan')` 본격 검증 test 신규
> - **DEC-2026-05-25-axis-a-phase-4-2 신설** (Phase 4-2 SSOT)
>
> **minimal scope 본격 결단** (LL-v911-01):
>
> - hooks-bridge.js TRIGGER_PATTERNS = 이미 v9.0.0 안 plan stage 등록 ✅ (추가 시행 ❌)
> - stage-graph.js getGateForStage('plan') = null 유지 (Cluster 1 X 재번호 = Phase 4-4 v10.0.0 MAJOR carry)
> - gate-eval outcome enforcement plan 분기 = plan-coverage-validator 자체 안 본격 작동 / gate-eval generic findings (critical/high/medium/coverage_pct) 본격 작동 = 추가 분기 ❌
>
> **STOP-3**: workspace 726 → **727/727 pass** (chain-driver 223→224 / +1 신규 plan validator test) + skill-citation-validator **0 stale** (plan-agent body 신규 cross-ref 모두 existing) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.1 + breaking 0 = PATCH.
>
> **2 LL 자산화**:
>
> - **LL-v911-01** — minimal scope Phase 본격 진입 paradigm (A4 body + A5 1 line additive / 본격 변경 ❌ axis 본격 식별 = quality risk 회피 + roll-back 자격 본격 보장)
> - **LL-v911-02** — 후속 Phase 의 자연 cadence 본격 입증 (Phase 4-1 의 자연 후속 = 같은 session 안 본격 연속 시행 자격 / "gogo" 결단 / additive only / cooling-off ❌ / 별도 DEC + 별도 release entry = paradigm 정합)
>
> **carry (Phase 4-3~4-5 / 차기 session)**:
>
> - Phase 4-3 (v9.x MINOR / additive) — A6 traceability subtask_ids.chain3_plan additive
> - Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement (Senior BLOCKER-2 잔여 carry)
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-2. Resolves: F-CHA-003 Phase 4-2 부분 해소 (agent body + validator 등록 완료 / gate trio enforcement + traceability layer = Phase 4-3~4-4 carry).

---

## [9.1.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-1 시행 (paradigm-level / additive only / breaking 0)

> session 46차 / 사용자 결단 "PoC 안 할꺼야 / 플러그인 적용 못했던 것 위주" + "axis A 본격 paradigm 명시 직접 응답" + "β cadence" + "진행" → paradigm-level 결단 (45차 carry "ζ-1 의식적 제외" 본격 retract). 4원칙 ladder full (Phase 1.1~1.6 깊이 숙지 + plan.md 작성 / Phase 2 3 agent 병렬 토론 / Phase 3 묶음 결단 Cluster 1~8 / Phase 4-1 본격 시행).
>
> **Phase 2 3 agent 본격 결과**:
>
> - Senior **REVISE-2 @ 0.81** — 2 BLOCKER (Phase 4-3 v10.0.0 scope 본격 과대 → 분리 cadence / gate #plan trio enforcement silent sink → exit code contract 명시) + 5 risk + Cluster 4 수정
> - 공식 docs **REVISE-1/2/3** (BLOCKING ❌) — DO-178C 6 layer GREEN + severity_floor 사내 해석 명시 / Nygard ADR 5 기준 "≥30% task 영향" 오귀인 → 사내 구체화 + 보안/규제 axis 추가 / ISO 25010 SQuaRE 8 → 9 (2023 Safety 신설) / estimation 표준 외 신설 paradigm
> - Industry **isomorphic GREEN** + REVISE-1 — 6 production cases (GitHub Copilot Workspace Task→Spec→Plan→Code / Cursor Plan Mode Shift+Tab / Aider /ask↔/code + Architect mode / AWS AI-DLC Workflow / ThoughtWorks GenAI for forward engineering / GitHub Community #142971) / Plan stage 산업 production 다수 isomorphic 본격 입증
>
> **Cluster 1~8 본격 결단** (사용자 묶음 결단 / Phase 3 종결):
>
> - 1 (gate 번호): X (재번호) + 분리 cadence — Phase 4-4 단독 v10.0.0 carry
> - 2 (NFR severity floor): high+critical + 사내 해석 표기 — DO-178C GREEN
> - 3 (TASK 위치): AC→TASK→TC — DO-178C 6 layer 정합
> - 4 (cross-cut): task→ADR + AC↔NFR 양방향 + task→RISK + adr→behavior 역방향 — Senior REVISE-2
> - 5 (ticket 동반): 분리 carry (v10.1.0 MAJOR) — Senior BLOCKER-1
> - **6 (산출물 명명)** 사용자 명시: **`task-plan.json`** (Senior 권고) — discovery (planning-spec) ↔ plan (task-plan) 명독 분리
> - **7 (ADR 5 기준 출처)** 사용자 명시: Nygard 5 category 기반 사내 구체화 + 보안/규제 axis 추가
> - **8 (Type 2 carry deadline)** 사용자 명시: v10.1.0 release 자격 = Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> **Phase 4-1 본격 시행** (additive only / breaking 0 / Senior REVISE 흡수 + 공식 docs REVISE 흡수 + Industry REVISE 흡수):
>
> - **A1 `schemas/task-plan.schema.json` 신설** — planning-spec.schema.json template 차용 / meta + derivation_source + tasks[] + adrs[] + risks[] + nfr_allocation[] + rollback_strategy + cross_links / additionalProperties:false strict / task granularity schema-level enforce (ac_refs.maxItems:3) / alternatives ≥3 schema-level enforce / ISO 25010:2023 SQuaRE 9 enum (Safety 신설) / Nygard 5 category + security_compliance enum
> - **A2 `tools/plan-coverage-validator` workspace 신설 (npm 21번째)** — exit code contract (0=ok / 1=blocking / 2=usage-error / Senior BLOCKER-2 흡수) + 5 validator 함수 (validateTaskCoverage + validateNfrAllocation + validateTaskGranularity + validateDependencyCycle + validateRiskSeverity) + **28/28 test pass** (5 suite 23 unit + 1 suite 5 Senior BLOCKER-2 integration scenario)
> - **A3 plan-\* 3 skill body** (placeholder → body) — `plan-decompose-and-sequence` (task 분해 + DAG topological sort) + `plan-architect-decisions` (ADR 작성 / Nygard 5 category 사내 구체화 + 보안/규제 axis) + `plan-risk-and-nfr` (3중 망 risk + NFR allocation hard gate + rollback)
> - **DEC-2026-05-25-axis-a-phase-4-1 신설** (본 release 의 paradigm SSOT)
>
> **STOP-3**: workspace **726/726 pass** (698 → 698+28 / 무회귀) + skill-citation-validator **0 stale** (DEC 신설 후 7 dead-link 해소) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.0 + breaking 0 = MINOR.
>
> **carry (Phase 4-2~4-5 / 차기 session)**:
>
> - Phase 4-2 (v9.x PATCH / additive) — A4 plan-agent body + A5 chain-driver stage-graph/gate-eval plan 분기
> - Phase 4-3 (v9.x MINOR / additive) — A6 traceability-matrix subtask_ids.chain3_plan additive
> - Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> **4 LL 자산화**:
>
> - **LL-v910-01** — self-referential corrective drift retract paradigm 본격 입증 (45차 carry "ζ-1 의식적 제외" 의 본격 retract / 사용자 명시 결단 trigger + paradigm-level scope + release-readiness criterion add 가 아닌 stage 본격 신설)
> - **LL-v910-02** — β cadence 본격 활용 paradigm (paradigm-level 결단 시 Phase 1~3 본 session / Phase 4 시행 차기 session default / 단 사용자 명시 "진행" 시 retract 자격 — additive only scope 한정)
> - **LL-v910-03** — Senior BLOCKER-2 exit code contract paradigm 본격 입증 (plan-coverage-validator exit code contract 본격 명시 + ≥ 5 통합 test 의무 = drift-validator silent sink LL-v903-01 + chain-coverage-validator default projectRoot LL-v904-01 동형 paradigm 회피)
> - **LL-v910-04** — 3 agent 병렬 토론 본격 paradigm 입증 (Senior REVISE-2 + 공식 docs REVISE-1/2/3 + Industry isomorphic GREEN 3 axis 본격 토론 정합 / Senior 2 BLOCKER 흡수 → Phase 4-3 v10.0.0 scope 본격 축소)
>
> DEC-2026-05-25-axis-a-phase-4-1. Resolves: F-CHA-003 (plan stage paradigm 위배) Phase 4-1 부분 해소 (schema + validator + skill body / agent body + gate + traceability = Phase 4-2~4-5 carry).

---

## [9.0.6] — 2026-05-24 MINOR — Phase 2 LL-v903 follow-up 묶음 (LL-v903-01 scope-out + LL-v903-03 release-readiness #17 marketplace.json stage sync + LL-v906-01/02 자산화)

> v9.0.5 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" → Phase 2 = 본 v9.0.6 MINOR. additive criterion / breaking 0. criterion add precedent v8.6.0/v8.9.0 일관 MINOR.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v5 / 5회 연속 재발)**: v9.0.3 carry note "LL-v903-01 drift-validator silent sink → exit ≥ 1 hard gate 전환" 시행 직전 사실 검증 시 사실 오류 발견 — `tools/drift-validator/src/cli.js:292` `process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0)` 이미 hard gate. v9.0.3 점검 명령 `node ... 2>&1 | tail -30; echo "EXIT=$?"` 의 `$?` = tail 의 exit code (= 0 / 정상), drift-validator 자체 exit code 가 아님 (bash pipe + tail exit code misunderstand).
>
> **사용자 묶음 결단**: D1 LL-v903-01 scope-out (사실 오류 / 이미 hard gate) / D2 LL-v903-03 시행 — release-readiness check17 신설 / D3 silent test sink 정정 (release-readiness.test.js 13→17) / D4 v9.0.6 MINOR release.
>
> **시행** (additive criterion / breaking 0):
>
> - **LL-v903-03 시행**: `scripts/release-readiness.js` `check17_marketplaceStageSync()` 함수 신설 + main results array 추가. 검사 대상 = `.claude-plugin/marketplace.json` `plugins[0].description`. 검사 axes 3종: ① "6단계 chain harness" 또는 "6-stage chain harness" 표기 (regex) ② 5 stage name (discovery/spec/plan/test/implement) 모두 포함 ③ legacy "planning →" 미포함. delegated_to = MAJOR stage change cascade enforcement.
> - **LL-v906-02 silent test sink 정정**: `scripts/test/release-readiness.test.js` 가 hard-coded 13 → 실 16/17 stale 누적 carry 발견. workspace test (`npm test --workspaces`) 가 `scripts/test/` 미포함 = silent test sink. **시행**: hard-coded 13 → 17 갱신 (3 location) + criterion ids array 4 추가 (code_pointer_coverage + graph_integrity + preflight_tools + marketplace_stage_sync). 10/14 fail → **14/14 pass** ✅.
> - **release ceremony**: plugin.json + package.json 9.0.5 → 9.0.6 (3-way sync) + CHANGELOG 본 entry + DEC-2026-05-24-v906-marketplace-stage-sync-check + INDEX 최상단 + STATUS session 43차 v9.0.6 entry + CLAUDE.md sync.
>
> **STOP-3**: workspace 698/698 pass (보존 / scripts/test/ 미포함 = LL-v906-02 carry) + release-readiness.test.js **14/14 pass** (10→14 / 4 fail fix) + release-readiness **17/17 ready:true** (16→17 / check17 신설 통과) + chain-coverage-validator 38/38 (보존) + skill-citation 0 stale (보존) + drift-validator 0 breaking (보존) + version 3-way 9.0.6 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
>
> - **LL-v906-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v5 (5회 연속 재발 / LL-fsim-11 + LL-v902-01 + LL-v903-01(scope-out 본격 입증) + LL-v904-01 + LL-v905-01 정합 / paradigm enforcement 본격 입증대 v5 / carry note 자체도 검증 의무 / bash pipe + exit code 사실 misunderstand 회피 cadence)
> - **LL-v906-02** — silent test sink paradigm 본격 발견 (`scripts/test/` workspace test 외 / `npm test --workspaces` 미포함 → release-readiness.test.js stale 누적 carry / v+1 carry — workspace 통합 또는 hook gate enforcement)
> - **LL-v906-03** — criterion add cadence paradigm 본격 정착 (v8.6.0 #14 preflight + v8.9.0 #15 graph + v8.9.0 #16 code-pointer + v9.0.6 #17 marketplace = MINOR 일관 / semver 정합 additive)
>
> **차기 session carry** (deadline 없음):
>
> - F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / cooling-off ≥ 24h)
> - LL-v906-02 follow-up (`scripts/test/` silent sink — workspace 통합 또는 hook gate)
> - F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 session 안 시행 중)
>
> DEC-2026-05-24-v906-marketplace-stage-sync-check. Resolves LL-v903-03 + LL-v903-01 (scope-out).

## [9.0.5] — 2026-05-24 PATCH — Phase 1 F-MB-POC-001 5 PoC sweep (v7.0.0 rules.json → business-rules.json rename PoC 산출물 미전파 / 시행 직전 사실 검증 보강 paradigm 재발 v4)

> v9.0.4 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" 묶음 결단 → Phase 1 = 본 v9.0.5 PATCH. additive doc / breaking 0.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v4 / 4회 연속 재발)**: v9.0.4 carry note "poc-03 산출물 drift 별 plan" single PoC 가정이 시행 직전 사실 검증 시 5 PoC 광범위 drift 로 진화 (poc-03 + 06/07/08/11 모두 v7.0.0 `rules.json` → `business-rules.json` rename 미전파 / F-PA-002 의 PoC 산출물 axis sub-finding) + poc-08/11 더 깊은 별 convention drift 추가 발견 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker).
>
> **사용자 묶음 결단**: D1 5 PoC sweep / D2 poc-08+11 잔여 = F-MB-POC-002 carry (Y 옵션 / Senior 의도 의문 cooling-off 권장) / D3 v9.0.5 PATCH release.
>
> **시행** (additive doc / breaking 0):
>
> - **poc-03 special case** (2 종류 drift): `examples/poc-03-realworld-nestjs/.aimd/output/{planning,behavior,test}-spec.json` `examples/poc-03-realworld-nestjs/` repo-absolute prefix 제거 + `output/rules/rules.json` → `output/rules/business-rules.json` (replace_all sweep)
> - **poc-06/07/08 + poc-11**: `examples/poc-{06,07,08}-*/​.aimd/output/planning-spec.json` + `examples/poc-11-*/​.aimd/output/{planning,behavior}-spec.json` `input/rules.json` → `input/business-rules.json` (replace_all sweep)
> - **release ceremony**: plugin.json + package.json 9.0.4 → 9.0.5 + CHANGELOG 본 entry + DEC-2026-05-24-v905-poc-rules-rename-sweep + INDEX 최상단 + STATUS session 43차 v9.0.5 entry + CLAUDE.md sync.
>
> **self-corroboration ≥ 3 PoC full fix (§8.1 strict 정합 ✓)**:
> | PoC | v9.0.4 baseline | v9.0.5 after |
> |---|---|---|
> | poc-03 | 14 broken | **0 broken** ✅ |
> | poc-06 | 2 broken | **0 broken** ✅ |
> | poc-07 | 2 broken | **0 broken** ✅ |
> | poc-08 | 10 broken | 9 broken (1 fix / path 안 메타 embed 9 잔여 → F-MB-POC-002 carry) |
> | poc-11 | 11 broken | 7 broken (4 fix / "[source absolute]" prefix 7 잔여 → F-MB-POC-002 carry) |
>
> **STOP-3**: workspace 698/698 pass (보존) + chain-coverage-validator 38/38 (보존) + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator 0 breaking (보존) + version 3-way 9.0.5 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
>
> - **LL-v905-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v4 (LL-fsim-11 + LL-v902-01 + LL-v903-01 + LL-v904-01 정합 / 4회 연속 재발 / paradigm enforcement 본격 입증대 v4)
> - **LL-v905-02** — Senior 의도 의문 cooling-off paradigm 본격 정착 (poc-11 "[source absolute]" prefix marker / Adzic SBE 함정 회피 cadence)
> - **LL-v905-03** — partial fix + carry 명시 paradigm (§8.1 strict 충족 + 잔여 별 axis)
>
> **차기 session carry** (deadline 없음):
>
> - F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / Senior 의도 의문 cooling-off ≥ 24h)
> - LL-v903-01 + LL-v903-03 follow-up = v9.0.6 Phase 2 (drift-validator hard gate + release-readiness #1 marketplace.json grep)
> - F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 v9.0.5 fix 후 자연 가능)
>
> DEC-2026-05-24-v905-poc-rules-rename-sweep. Resolves F-MB-POC-001.

## [9.0.4] — 2026-05-24 PATCH — G axis F-SIM-003 carry corrective + 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (F-MB-VAL-001 chain-coverage-validator default projectRoot 결함)

> v9.0.3 release 직후 사용자 결단 "다음 session carry G axis 진행하자" → cooling-off skip (precedent: v8.14.1) + 본 v9.0.4 PATCH. additive tool fix / breaking 0.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v3 / v9.0.2 + v9.0.3 동형 패턴 cadence 본격 정착)**: v9.0.3 carry note "F-SIM-003 v+1 default strict_mode 전환 carry / poc-05 14 broken paths" 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — 5 PoC (poc-03/04-mini/05/14/06/07) cross-ref convention 모두 PoC root 기준 일관 + chain-coverage-validator default projectRoot = `dirname(behavior)` = `.aimd/output/` 이라 path resolution 시 `output/output/...` 중복 prefix 발생 = 본격 도구 default 결함. 1차 strict_mode 전환 carry 는 별 axis valid 후보 (본 fix 전 전환 시 false positive 격상 = Adzic SBE 함정).
>
> **사용자 묶음 결단**: D1 fix 옵션 B-1 default auto-detect / D2 finding ID F-MB-VAL-001 별 등재 / D3 v9.0.4 PATCH release ceremony / D4 strict_mode v+1 default 전환 carry 별 axis 보존.
>
> **시행** (additive tool fix / breaking 0):
>
> - **F-MB-VAL-001** (medium / 도구 default 결함): `tools/chain-coverage-validator/src/validator.js` 안 `autoDetectProjectRoot(specPath)` 함수 신설 + export. `.aimd/output/<file>.json` 패턴 자동 감지 → `dirname(p)/../..` = PoC root (Windows backslash + Unix slash 모두 처리). fallback (non-`.aimd/output/`): dirname(p) backward-compat.
> - `tools/chain-coverage-validator/src/cli.js`: `dirname` import 제거 + `autoDetectProjectRoot` import + line 66 default 변경 + help text 갱신.
> - `tools/chain-coverage-validator/test/validator.test.js`: 신규 describe block 4 test 추가 (autoDetectProjectRoot Unix + Windows + fallback + null 방어). 34 → 38 pass.
> - `tools/chain-coverage-validator/package.json`: version 0.2.0 → 0.3.0 + description 갱신.
> - **release ceremony**: plugin.json + package.json 9.0.3 → 9.0.4 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v904-fsim-003-deeper-fact + INDEX 최상단 + STATUS session 43차 v9.0.4 entry.
>
> **본격 fix 입증**: poc-05 직접 invoke (비명시 `--project-root`) **14 broken paths → 0** ✅. PoC self-corroboration ≥ 2 (poc-05 14→0 + poc-04-mini 0 회귀 ❌ + poc-14 0 회귀 ❌) = §8.1 strict 정합 ✓.
>
> **부산물 발견 (별 axis carry)**: poc-03 비명시 invoke 시 본 fix 후에도 잔여 broken paths = ① rules.json → business-rules.json v7.0.0 rename 미전파 + ② cross_links repo-absolute convention 사용 → **F-MB-POC-001 후보** (별 plan / 본 v9.0.4 외).
>
> **STOP-3**: workspace 694/694 → **698/698 pass** + chain-coverage-validator 34/34 → 38/38 + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator analysis.phase-flow 0 breaking (보존) + version 3-way 9.0.4 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
>
> - **LL-v904-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (LL-fsim-11 + LL-v902-01 정합 / 3회 연속 재발 / paradigm enforcement 본격 입증대 / main agent self-fact-check 의무 + carry note ambiguity 해소 cadence 본격 정착 v3)
> - **LL-v904-02** — silent sink paradigm deeper layer (LL-v903-01 확장 / 결정적 도구 enforcement 가 본격 hook gate cascade 안 될 때 silent sink 잔존 / chain-coverage-validator direct invoke + release-readiness #1 marketplace.json 모두 v+1 carry 후보)
> - **LL-v904-03** — PoC self-corroboration ≥ 2 paradigm 본격 입증 (§8.1 strict 정합 / 도구 fix → 다중 PoC 직접 invoke → 회귀 0 입증 + 부산물 carry 명시 cadence)
>
> **차기 session carry** (deadline 없음):
>
> - F-SIM-003 strict_mode v+1 default 전환 (별 axis 본격 보존 / 본 v9.0.4 fix 후 자연 가능 / cooling-off ≥ 24h 권장)
> - F-MB-POC-001 poc-03 산출물 drift 별 plan
> - LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 v+1)
> - LL-v903-03 follow-up (release-readiness #1 marketplace.json grep v+1)
>
> DEC-2026-05-24-v904-fsim-003-deeper-fact. Resolves F-MB-VAL-001.

## [9.0.3] — 2026-05-24 PATCH — 6-stage chain harness L1 결정적 점검 carry corrective (F-MB-DRIFT-001 + F-MB-DOC-003 / forward-only / additive doc / breaking 0)

> v9.0.2 release 직후 session 43차 L1 결정적 점검 (범위 = 전체 chain e2e 6-stage / 11 axis / 사용자 결단 "분석부터 시작 되는 플로우 점검") 의 후속 시행. 사용자 결단 "1" (의제 1 = 즉시 fix / PATCH / additive doc / cooling-off ❌) → 본 v9.0.3 PATCH. corrective / breaking 0.
>
> **L1 점검 결과**: 8/11 green + 3 ⚠️ silent drift 표면.
>
> | axis                                   | 결과 | drift                                                                                                                                                                                                    |
> | -------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | C. drift-validator analysis.phase-flow | ⚠️   | 2 breaking — `template-analyze` phase JSON/mermaid 2-way drift (v3.4.0 G4 신설 후 ~6개월 carry / drift-validator emit breaking 하지만 exit 0 = release-readiness gate cascade 안 됨 = silent drift sink) |
> | G. chain-coverage poc-05 cross-refs    | ⚠️   | 14 MEDIUM broken paths (strict_mode=false 통과 / F-SIM-003 v+1 default carry / 본 v9.0.3 범위 외 / 별도 plan carry)                                                                                      |
> | K. doc-drift tool/schema count         | ⚠️   | 4 area — CLAUDE.md "17종"→실측 20 / "39종"→실측 44 / package.json "16 tools"→20 / marketplace.json "4단계 planning"→6단계 discovery (v9.0 미반영 = plugin install 첫 표면 drift)                         |
>
> **사용자 묶음 결단**: D1 F-MB-DRIFT-001 시행 / D2 F-MB-DOC-003 시행 / D3 v9.0.3 PATCH release ceremony / D4 G axis F-SIM-003 별도 plan carry (cooling-off ≥ 24h 권장).
>
> **시행** (additive doc / breaking 0):
>
> - **F-MB-DRIFT-001** (medium / 6개월 silent mermaid drift): `flows/analysis.phase-flow.mermaid` 안 subgraph `P_template_analyze["Phase template-analyze — v3.4.0 G4 (Scenario C only)"]` 신설 + dependency edge `P_input --> P_template_analyze` 추가. **검증**: `node tools/drift-validator/src/cli.js flows/analysis.phase-flow.json` → 0 breaking / 0 non-breaking / 0 info ✅ (시행 직후 실측).
> - **F-MB-DOC-003** (low / 4-area count drift): `CLAUDE.md` line 97 (39→44 + dep-graph 3 부연) + line 99 (17→20 + sql-inventory-validator v8.7 rename + inflation-lint + code-pointer-validator + graph-integrity-validator v8.9.0 P1~P4 enumerate 추가) / `package.json:6` description "16 tools workspace" → "20 tools workspace" + 4 신설 도구 enumerate / `.claude-plugin/marketplace.json:11` description "SDLC 4단계 chain harness (legacy 분석 → planning → spec → test → impl) + chain 4 gate" → "SDLC 6단계 chain harness (legacy 분석 → discovery → spec → plan → test → implement / v9.0 6-stage) + chain 1~5 gate (#1~#4 / plan placeholder)".
> - **release ceremony**: plugin.json + package.json 9.0.2 → 9.0.3 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v903-l1-flow-audit-carry-corrective + INDEX 최상단 + STATUS session 43차 v9.0.3 entry.
>
> **STOP-3**: workspace **694/694** + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift analysis.phase-flow 0 breaking ✅ + version 3-way 9.0.3 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
>
> - **LL-v903-01** — silent drift sink paradigm 본격 표면화 (drift-validator phase-flow breaking 시 exit 0 = warn-level → release-readiness gate 에 cascade 안 됨 = 6개월 carry 가능 / 후속 carry = exit ≥ 1 hard gate 전환 v+1)
> - **LL-v903-02** — L1 결정적 점검 paradigm enforcement 본격 표면화 cadence (11 axis 결정적 도구 일괄 실행 + 횡단 cross-check = sub-agent 비용 0 + 양심 의존 0% + drift 자동 표면 / paradigm 안정점 본격 재도달 v4 / v9.0.2 동형 패턴 cadence 본격 정착)
> - **LL-v903-03** — marketplace.json description = plugin install 첫 표면 (사용자 1차 접점) / MAJOR release 시 sweep 의무화 carry / release-readiness #1 marketplace.json description grep 추가 후보 v+1
>
> **차기 session carry**: G axis F-SIM-003 strict_mode 별도 plan (cooling-off ≥ 24h / poc-05 산출물 vs 도구 path resolution base 분리 검증 후 결단) + LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 v+1) + LL-v903-03 follow-up (release-readiness #1 marketplace.json grep v+1).
>
> DEC-2026-05-24-v903-l1-flow-audit-carry-corrective. Resolves F-MB-DRIFT-001 + F-MB-DOC-003.

## [9.0.2] — 2026-05-24 PATCH — paradigm + dep-graph L2 audit carry corrective (F-PA-DRIFT-001 + F-MB-DOC-002 / forward-only / Senior fact-check paradigm 재발)

> v9.0.1 release 직후 session 42차 L2 audit (paradigm + dep-graph / 14/16 PASS + 2 doc-only drift carry) 의 후속 시행. 사용자 결단 "캐리 실행" → 본 v9.0.2 PATCH. corrective / breaking 0.
>
> **시행 직전 사실 검증 보강 결과 (LL-fsim-11 paradigm 본격 재발)**: F-MB-DOC-002 가 1차로 단순 ambiguity (CLAUDE.md "5종" vs 실측 4) 로 등재됐으나, 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — `b9615d0` commit message + `DEC-2026-05-23-dep-graph-p1-p4 §3.1` + `STATUS` 32차 entry 안 "schema 5 신설 (...discovery-output + plan-spec)" claim 자체가 사실 오류. `discovery-output.schema.json` + `plan-spec.schema.json` = git history 안 전혀 부재 (never created). `cycle-carry.schema.json` = v8.8.0 commit `4523116` 신설 (별 axis carry resolution_kind 추적 / dep-graph history doc 안 5종 list 안 명시 ❌). → v8.9.0 시점 의도 5 / 실 b9615d0 stat = 3 + v8.8.0 cycle-carry carry-over 1 = 현 4종.
>
> **사용자 묶음 결단**: D1 F-PA-DRIFT-001 시행 / D2 F-MB-DOC-002 옵션 B (forward-only / history doc immutable / LL-i-52 paradigm 정합) / D3 v9.0.2 PATCH release ceremony.
>
> **시행** (additive doc / breaking 0):
>
> - **F-PA-DRIFT-001** (file 내적 drift 해소): `methodology-spec/finding-system.md:474` F-SIM-012 status `"open (v8.4.0 carry)"` → `"closed v8.14.4"` + `DEC-2026-05-23-fsim-012-014-close §1` cross-link / `:476` F-SIM-014 동일 패턴 (DEC §2 cross-link).
> - **F-MB-DOC-002** (forward-only 정정): `CLAUDE.md` line 132 v8.9.0 entry `"schema 5 + validator 2"` → `"schema 4 (v9.0.2 정정 / 실 b9615d0 stat = artifact-graph-node + edge + code-pointer 3 신설 + v8.8.0 cycle-carry carry-over 1 = 현 4종 / v8.9.0 commit message + DEC §3.1 "schema 5 신설" claim = 사실 오류 / discovery-output + plan-spec 본 적 없음 — history doc immutable 보존 / DEC-2026-05-24-v902-audit-carry-corrective) + validator 2 + ..."`. history doc (`b9615d0` commit message + `DEC-2026-05-23-dep-graph-p1-p4 §3.1` + `STATUS` 32차 entry) 변경 ❌ (audit-time 기록 보존 / LL-i-52 immutable paradigm 정합).
> - **release ceremony**: plugin.json + package.json 9.0.1 → 9.0.2 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v902-audit-carry-corrective + INDEX 최상단 + STATUS session 42차 v9.0.2 entry.
>
> **STOP-3**: workspace **694/694** + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift 3-way + version 3-way 9.0.2 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
>
> - **LL-v902-01** — main agent 시행 직전 사실 검증 paradigm 본격 재발 (LL-fsim-11 정합 / Senior 사실 검증 보강 본격 입증대 / L2 audit 의 "ambiguity" finding 이 실 fact-mismatch 로 진화한 case)
> - **LL-v902-02** — history doc immutable forward-only correction paradigm (LL-i-52 본격 재적용 / commit message + DEC + STATUS 의 fact-wrong claim 보존 + CLAUDE.md 만 정정 / 새 reader 추적 = 본 DEC 안)
> - **LL-v902-03** — L2 audit + 시행 분리 paradigm 본격 입증대 (audit → 결단 → 사실 검증 보강 → 시행 cadence / paradigm 안정점 본격 재도달 v3)
>
> DEC-2026-05-24-v902-audit-carry-corrective. Resolves F-PA-DRIFT-001 + F-MB-DOC-002 (session 42차 audit carry).

## [9.0.1] — 2026-05-23 PATCH — v9.0.0 coherence (prose + machine SSOT drift 정합 / planning→discovery + plan 전파)

> v9.0.0 이 런타임 SSOT(state.schema / stage-graph / sdlc.json stages)만 마이그레이션하고 **prose 14파일 + briefing 3파일 + sdlc-4stage-flow.mermaid + phase-flow chain 링크**를 구버전(4·5단계 / "planning")으로 남긴 drift 청산. corrective / breaking 0.
>
> **실 결함 포함**: `lifecycle-contract.md` 의 dead link(`agents/planning-agent.md` — discovery-agent.md 로 git mv 됨) + `chain-harness-guide.md` 의 state enum 모순(`"planning"`/`"done"` vs state.schema `current_chain` 6-stage). skill-citation-validator 가 prose 링크를 안 봐서 v9.0.0 STOP-3 통과했던 잔존.
>
> **사용자 결단**: ① coherence docs 먼저(PATCH) ② briefing/ 포함 ③ machine SSOT(mermaid + phase-flow 링크) 포함.
>
> **번호 규칙**: discovery=chain1/gate#1 · spec=2/#2 · plan=3/**gate deferred** · test=4/#3 · implement=5/#4 (gate 번호 ≠ chain 번호).
>
> - **prose 6-stage 정합 (14)**: `lifecycle-contract.md`(dead link→discovery-agent.md + flow 다이어그램 순서 + 자산 매핑 매트릭스 plan row(9) + data-contract plan 절 신설 + scope tree + 전 chain/gate 재번호) · `skills-axis.md`(§4·§7.2·§9.2 표 — discovery 6 + plan + count 55) · `plugin-charter.md`(R3/R7/R10/R11/R12/R13 + revisit_edges 8종) · `id-conventions.md` · `agents-axis.md` · `deliverables/17-planning-spec.md` · `flows/README.md`(dead ref planning.phase-flow→discovery) · `README.md`(stage 줄 + CHAIN 블록 + tree) · guides 4종(`chain-harness-guide.md` state enum→current_chain 6-stage + mermaid 재작성 + matcher / `first-prompt-cookbook.md` / `getting-started.md` / `common-errors.md`).
> - **briefing 3종**: `01-main.md`(skill·flow tree + 트리거 + flow 다이어그램) · `02-first-5min.md` · `slides/methodology-deck.md`(flow 섹션 + chain 책임 표 + revisit + asset 매핑 + 멀티에이전트).
> - **machine SSOT**: `sdlc-4stage-flow.mermaid` 6-stage 재작성(Planning→Discovery + plan subgraph S3 + revisit 8종 + S0~S5 chain 정합) · `spec/plan/test/implement.phase-flow.json` previous/next chain 링크 정합(dead ref `planning.phase-flow.json` 제거 + plan 경유) + chain 번호(test 3→4 · implement 4→5) + `expected_outcome_chain3/4`→`chain4/5`.
> - **KEEP (reuse/history)**: `planning-spec.json`·`planning-spec.schema.json` 산출물명 + `planning-extraction-validator` 도구 + `subtask_ids.chain1_planning` schema key + `finding-system.md`·`briefing/04-version-history.md` audit history + ticket 서브시스템(`ticket-sync` skill stage=planning + traceability schema 4-chain key).
> - **STOP-3**: workspace **694/694** + release-readiness **16/16** + skill-citation **235 doc 0 stale** + drift state-flow(6=6)+chain-layout(5)+phase-flow 짝 0 breaking + chain-driver 223/223 + version 3-way 9.0.1 + breaking 0 = PATCH.
> - **carry**: plan-agent 본격 구현(plan-\* skill 3 + plan-spec schema + plan hard gate) = v9.x+ / README·briefing version·stat refresh(v3.6.9·v8.2.0 → v9.0.x) / ticket 서브시스템 6-stage 마이그레이션(breaking) / templates/planning 폴더 rename.
>
> DEC-2026-05-23-coherence-docs-6stage. Resolves DEC-2026-05-23-discovery-stage-v9 §carry (prose coherence).

## [9.0.0] — 2026-05-23 MAJOR — discovery stage 재통합 (6-stage chain harness / planning→discovery 개칭 + plan 신설)

> DEC-2026-05-21 설계(옵션 A "개칭 + 확장")를 현 main 위에 **machine SSOT 까지 완성**. 기존 `feat/v4.1-hooks-carry-note` 브랜치는 문서·skill·agent 만 바꾸고 state/flows/tooling 을 안 건드려 미완성·drift 상태였음 (그래서 raw merge 시 drift+citation 깨짐 → abort 후 본 재통합).
>
> **breaking**: `state.schema.json` stage enum (`planning`→`discovery` + `plan` 추가) → 기존 state.json 무효화 + skill command-surface rename (planning-_→discovery-_). v7.0.0/v8.0.0 rename 선례 정합 = MAJOR.
>
> **사용자 묶음 결단**: MAJOR v9.0.0 / fresh 재적용(stale 브랜치 merge ❌) / 기존 schema reuse(신규 0) / plan gate deferred(placeholder / gate #1~#4 유지) / chain 1~5 순차 재배치.
>
> **chain**: `analysis → discovery → spec → plan → test → implement`. discovery = planning 개칭 + 입력 어댑터 4종(analysis-output/swagger/figma/nl-md). plan = HOW 단계(task/ADR/NFR/risk) placeholder (plan-agent skills:[] / hard gate deferred).
>
> - **machine SSOT**: `state.schema.json` 6-stage(enum/required/StageRecord/gate/revisit) / `sdlc-4stage-flow.json`(파일명 reuse) stages 6 + revisit_edges 8 + gate #1~#4 / `flows/planning.phase-flow`→`discovery.phase-flow`(git mv) + `plan.phase-flow` 신설(+mermaid 각) / `drift-validator` CHAIN_STAGES / `chain-driver` 8 src(stage-graph STAGES+gate map / state-store / gate-eval / cli MANIFEST_STAGES / hooks-bridge trigger / work-unit / revisit-detect) + **223 test 갱신**.
> - **skills/agents**: 3 rename(planning-\*→`discovery-decompose-use-cases`/`discovery-from-analysis-output`/`discovery-identify-business-intent`) + 6 신설 placeholder(`discovery-from-figma`/`nl-md`/`swagger` + `plan-architect-decisions`/`decompose-and-sequence`/`risk-and-nfr`) + `discovery-agent`(planning-agent 흡수) + `plan-agent` placeholder.
> - **schema reuse(신규 0)**: discovery 산출물 = `planning-spec.json`(파일명 reuse) / 어댑터 schema = 기존 `figma-extract`·`prompt-extract`(+`plan-doc-extract`)·`swagger-extract`(+`openapi-extension`)·`intent-classification` 재사용 / plan-spec = defer(placeholder).
> - **기타**: PoC state.json 3 마이그레이션(planning→discovery + plan / poc-11·06 go-eligible→go 정정) / hooks matcher discovery·plan / DEC-2026-05-23-discovery-stage-v9 + DEC-2026-05-21 등재 / CLAUDE.md 6-stage + plugin.json desc.
> - **STOP-3**: workspace **694/694** pass / drift state-flow(6 enum=6 flow)+chain-layout(5 chain stage / 0 missing) / chain-driver 223/223 / skill-citation 235 doc 0 stale / release-readiness **16/16 ready** / version 3-way 9.0.0 = MAJOR.
> - **carry**: plan-agent 본격 구현(plan-\* skill 3 + plan-spec schema + plan hard gate) = v9.x+.

---

## Archive

> v8.x 이하 entry 모두 → [`CHANGELOG-HISTORY.md`](CHANGELOG-HISTORY.md) 이전 (v9.0.0 paradigm boundary cleanup / 2026-05-25 / 6-stage chain harness 시작점 cutoff). 직전 cutoff = v7.0.0 이하 (v8.13.2 / 2026-05-23). v2.3.x and earlier split = 2026-05-14. v1.3.x and earlier split = 2026-05-06.

# DEC-2026-06-07-living-sync-operating-model

**결단**: analysis 를 "최초 1회 선형 단계"가 아니라 **그래프를 따라 평생 동기화되는 운영 컨텍스트**로 운영하는 living-sync 모델을 정식 채택. 핵심 = ① **forward 단방향 전파가 정책**(정상 개발은 위쪽 노드 수정 → 자연 방향 forward) ② **손수정 코드만 예외**(의미 천장까지 lift 후 forward) ③ **discovery = 변경의 보편 입구·라우터**(자연어 요청을 그래프에 ground → 진입 노드·등급 산출 / 상향 라우팅 허용) ④ **granularity = 정밀도 다이얼**(정확성 불변) ⑤ **전파 커널은 이미 존재 → last-mile 배선 + soundness 공백 1건만 채움**. **본 결단 = 청사진 정착(Phase 0)** — 구현은 단계화(아래 §5), 분석 시점 release ❌.

**작성일**: 2026-06-07 (사용자: "내 설계가 이상했던것 같다 … analysis 가 최초 이후에도 기능 변경에 열려 계속 동기화되어 LLM 컨텍스트가 되어야 / 변경 시 어디서 시작? / 의도와 다른 방향으로 우회하지 말자").

**version**: 없음 (blueprint 정착 = methodology-spec 문서 + DEC 추가 / 코드·plugin 동작 무변경 / 향후 phase 구현 시 각 release).

**relates to**:
- spec(신규): `methodology-spec/living-sync-operating-model.md` (운영 모델 SSOT / 본 DEC 가 결단 SSOT)
- `methodology-spec/baseline-delta-operating-model.md` (재분석 cadence / 자매 — 본 모델 = 전파 의미론)
- `methodology-spec/use-scenario-taxonomy.md` (4 시나리오 → AX 운영 수렴) · `DEC-2026-06-01-living-dep-graph-loops` (동기화 루프 + 소비 루프)
- plan `.claude/plans/fancy-nibbling-wolf.md` (3 Plan-agent 수렴 청사진 + phase 상세)
- `feedback_senior_fact_check_supplement` (에이전트 주장 코드 사실확인 후 채택) · `feedback_zero_base_no_carry_anchor`

---

## 1. 배경

방법론은 산출물 = LLM 운영 컨텍스트·평생 동기화·역동기화를 **이미 선언**(use-scenario-taxonomy / CLAUDE.md / baseline-delta)했으나, **구현은 선형 1-pass 파이프 + 감지만**이었다. 사용자가 "기능 변경이 계속 들어오는데 analysis 가 최초 1회면 안 된다 / 변경 시 어디서 시작하나"를 제기 → 선언과 구현의 격차가 핵심 문제로 표면화.

3 Plan 에이전트(fidelity / reuse / soundness 렌즈)가 수렴 + 코드 사실확인:
- **격차**: chain-driver forward-only(`current_chain='analysis'`) · 재진입 셸 `pending_revisit.target_stage` 쓰기만·읽지 않음(cli.js:1510 write / :242 display) · 동기화 display-only.
- **반전(검증됨)**: 전파 커널 이미 존재 — `analyzeImpact`(impact-analyzer.js:193 / 방향성 BFS + grade attenuation + cycle-safe) · `topologicalOrder`/`cascadeOrder`(propagation-orderer.js:27,84) · `cmdImpact`(cli.js:1547) · 4-state `transition`(graph-synthesizer.js) · `applyContentDrift`(code-pointer-validator.js:386) + A1/A2/A3.
- **leaf 사실**: `docs/dependency-graph.md:18` "source file·contract leaf = 노드 아님" → 코드-origin reachability 공백(lift 필요).
- **drift reset 사실**: graph-synthesizer 합성마다 drift→active reset 후 hook 재계산(graph-synthesizer.test.js:612) → drift = 파생값.
- **미확인(과대인용 가드)**: `policy-evaluator.js`/`propagation-policy.json`(change_tier_matrix) grep 미확인 → 보조·선택 신설.

## 2. 결정 내용

- **전파 정책**: 정상 = forward 단방향(root→code) 절대. 행동 변경 = 위쪽 노드 수정 후 forward. reverse 는 방향 아님.
- **affects 모델**: 전파 순간 G 에서 forward∪reverse in-memory 계산(저장 ❌) = `analyzeImpact buildIndex`. 한 pass = origin 서 바깥 단방향 BFS. "G 양방향 = origin 단방향".
- **상태·fixpoint**: content_changed(단조 up) + revalidated(비전파 sink) → ping-pong 불가. drift = (구조·mtime·git) 순수 함수. 결정론 경계 = 영향 집합은 그래프(LLM ❌) / LLM 은 drift 노드 내용 재생성만.
- **진입 분류(누가 판단)**: 레벨×등급 두 축. **discovery = 자연어 변경 요청 보편 입구·라우터**(nl-md ground → cross_links/intent → 진입 노드·등급 / discovery-extraction-validator 가 실재 매칭 검증 / gate#1 사람확인 / 룰변경이면 analysis 상향 라우팅). 그래프 = 영향 집합 결정론 / 감지기 = 파일변경 결정론 / 하위 게이트 = 오판 backstop.
- **예외(손수정 코드) lift**: anchor-lift(파일→주인 노드) → 의미 천장(리팩터=IMPL/동작=BHV·AC/룰=BR)까지 human-confirmed 상향 → 천장부터 forward. 항상-root ❌. reconcile 모드(관측사실 자동 / 의도 충돌 propose).
- **granularity**: 정확성 불변 / 정밀도 단조. 분할 = (독립 anchor) AND (하류 개별 참조) 일 때만. business-rules per-BC/BR = 정당하나 정밀도 phase(정확성 전제 아님).

## 3. BR-split 실타래 봉합

진행 중이던 BR-split(v0.3.0 STEP 0/1 + v0.4.0 STEP 2)의 진짜 동기는 "토큰"이 아니라 **living-graph 연동 + 지속 동기화의 granularity**였음이 확인됨. 본 모델에서 BR-split = §5 Phase 4(정밀도 단계)로 재배치. **이미 커밋한 STEP 0/1/2(BC 의무화 + loader 중앙화)는 폐기 아니라 그 토대로 유효** (헛수고 아님 / 드리프트 봉합).

## 4. Non-goal

- 본 DEC = 청사진 정착(문서 + 결단). 구현 코드 변경·release 없음.
- 선형 chain harness(bootstrap 경로) 폐기 ❌ — `operation_mode` 분기로 보존.
- 자동 cascade 기본값 변경 ❌ — M4 "감지 자동 / cascade 수동" 보존(phase 별 opt-in).

## 5. 단계 로드맵 (구현)

| Phase | 내용 | 격상 조건 |
| --- | --- | --- |
| **0** | 청사진 정착 (본 DEC + living-sync-operating-model.md) | — (본 결단) |
| **1** | MVP 루프 (S2 / 1 scope / forward) — INTAKE(파일변경 + discovery 라우터) → pending_revisit jump 활성화 → sync-loop orchestrator(analyzeImpact+topo+cascade) → drift 마킹 → resync → gate | 실 fixture BHV 편집 영향분만 갱신 + NL "BR 변경" discovery 상향 라우팅 입증 |
| **2** | 예외(손수정 코드) lift + reconcile (anchor → 의미천장 → forward) | 실 코드 편집 → 천장 lift → 의도충돌 propose 입증 |
| **3** | Merge-back + cross-scope (subsetAnalysisRefs 활성화 + item 병합 + markDrift) | scope delta → canonical 병합 + 타 scope drift 표지 |
| **4** | 정밀도 granularity (per-item 노드 / business-rules per-BC/BR = STEP 3) | SHOULD-noise 실측 trigger |
| **5** | lateral 엣지 + fixpoint 하드닝 + (≥2 도메인 후) drift/conflict gate 격상 | 수렴 증명 + ≥2 distinct 도메인 corroboration |

각 phase = no-simulation 실 CLI dogfood + release-readiness 무회귀 + 전파 결정론 단위테스트. 미구현 단계 "동작" 표기 ❌.

## 6. 리스크

- **R1 fixpoint 종료(lateral cycle)**: revalidated 후에만 재발화 + iteration cap + non-converging finding. Phase 5 전 소형 증명.
- **R2 의도 보존(역동기화)**: 관측사실/사람의도 분리 = S2 정확성 핵심. reconcile 보수적(의도 propose-only) / ≥2 도메인 전까지 finding·propose only.
- **R3 §8.1 과적합**: 모든 phase 격상 = ≥2 distinct 도메인(RealWorld + ecommerce) 실 dogfood.

## 7. Phase 1 시행 로그 (v0.5.0 / 2026-06-07)

**Phase 1 MVP = `sync-loop` forward 전파 → regen_queue worklist** (결정론 only / 재생성·NL라우터·역동기화·merge-back·per-item = deferred). 본 §은 §5 로드맵 Phase 1 의 구현 로그(별도 release DEC 미생성 — 로드맵 owner 에 append / codegraph-wiring §9 패턴 동형).

- **신규 `tools/chain-driver/src/sync-loop.js`**(순수 코어): `computeSyncLoop`/`resolveOriginNodeIds`/`SUBKIND_TO_STAGE`/`markTransientDrift`. **forward-only**: `analyzeImpact(..., {includeForward:true, includeBackward:false})` (impact-analyzer.js:198-199 기본 양방향 override — 코드 사실확인). drift=파생 → durable=state.json `regen_queue` 단일 필드(§D1 정합) / 그래프 영속 ❌(--mark display-only).
- **`chain-driver sync-loop` 명령**(cli.js): cmdSyncLoop + dispatch + parseArgs(`--origin` 누적/`--changed`/`--mark`) + usage + cmdState 표시. cmdImpact 의 analyzeImpact+topo+cascade 재사용. has_cycle 시 durable write 거부.
- **origin 해소**: source_path 매치(산출물) / code_pointers 매치(코드파일). coarse per-file = SOUND(over-include만 / per-item=Phase 4).
- **검증**: `test/sync-loop.test.js` 15(단위+poc-05 e2e+trust 가드). **forward-only 입증**: poc-05 BHV-USER-001 → closure=[AC,IMPL,TASK,TC]-USER-001 / UC·USER-002 부재. chain-driver 358/358 · release-readiness 40/40 · version 3-way 0.5.0. **trust**: 코어 gate토큰·I/O·비결정 0 + gate-eval/cmdNext 가 regen_queue·sync-loop 미참조(reference-lens).
- **정정**: 청사진 §6/§8 D2 "policy-evaluator.js 미확인" → **실재 확인**(cli.js:74 import / 과대인용 아니었음).
- **carry(deferred)**: Phase 1b NL discovery 라우터 · Phase 2 lift+reconcile · Phase 3 merge-back · Phase 4 per-item · `next`-consumes-worklist+pending_revisit 활성화 · hook auto-fire. 다음 = Phase 2 또는 1b(사용자 결단).

## 8. Phase 1c 시행 로그 (v0.6.0 / 2026-06-07 — 루프 닫기)

**Phase 1c = `sync-next` regen_queue **stage-단위** 소비** — Phase 1(`sync-loop`)이 worklist 를 계산·durable 기록만 하고 멈추던 지점을 닫는다. 죽은 `pending_revisit`(stage-단위 / jump 미실행 / cli.js:1519 write·:250 display)의 **노드-단위 산 대체**. §5 로드맵의 carry `next`-consumes-worklist 항목 이행(추천 순서 1순위). 4원칙 — 2 research-agent(Senior 적대 + soundness/reuse) 코드 사실확인.

**★ Senior REVISE@0.82 — naive 설계 정정 (node-gate → stage-gate)**: 초안은 "regen_queue item(노드)별 gate 재실행". 코드 검증 결과 **BLOCKER**: `evaluateGate(stage, findings, scenario)`(gate-eval.js:80)는 **노드 차원이 없는 stage 단위 aggregate** 함수 + findings 는 stage 단위 외부 산출 → "노드별 gate"는 (a) findings 부재 시 `__findings_absent` 센티넬로 **전 item livelock** (b) BHV·AC 둘 다 spec → per-item done **허구**. **정정**: 라이프사이클 [4] "그 노드의 owning gate" = 그 노드의 **stage gate**. 소비도 distinct stage 단위. 추가 MAJOR — `state.blocked` 공유 시 bootstrap `cmdNext`가 `blockedExit`(exit 2) 교차오염 → **`regen_queue.blocked` 전용**.

- **신규 소비 코어 (`tools/chain-driver/src/sync-loop.js` 추가 / 순수 / gate 토큰·I/O·시간 0)**: `selectNextStage`(cascade 보존 = 첫 미완 item 의 stage + 같은 stage 노드 묶음 + origins) · `markStageDone`(in-place / CAS 는 호출자) · `queueStatus`. 기존 sync-loop trust 가드 커버.
- **신규 `chain-driver sync-next` 명령**(cli.js / **cmdNext 무변경 = zero-regression**): findings 미제출 = 재생성 지시 surface(다음 stage + 노드 + `requiredValidators(stage)` / gate·write ❌ / exit 0) / 제출 = `evaluateGate(item.stage, findings, scenario)` → pass=그 stage 미완 item 전부 `done:true` CAS·`status` / stop=`regen_queue.blocked={stage,reason}` 전용·exit 1. cmdNext 의 post-gate tail(current_chain·last_gate·s.blocked) **재사용 ❌**(reuse-agent 경고). 리듬 = invocation 1회 = distinct stage 1개.
- **가드**: clobber(sync-loop 가 in-progress 큐 덮어쓰기 거부 / `--force`) · fixpoint 미보증 정직 표기(자동 재진입 deferred) · has_cycle 큐 방어 · cmdState done-aware 표시.
- **검증(no-sim 실 CLI / §8.1 ≥2 distinct 도메인)**: `test/sync-next.test.js` 16(코어 6 + poc-05 e2e 6 + trust 4) — drain spec→plan→test→implement→complete / block 격리(state.blocked 불변)·복구 / clobber. **2번째 도메인 = poc-16 efiweb-car-spring41(Spring 4.1 legacy) 실 dogfood**(BHV-CAR-MGT-001 → surface → spec gate drain → complete). chain-driver **374/374**(358+16) · release-readiness **40/40** · 3-way 0.6.0.
- **carry(후속)**: fixpoint 자동 재진입(sync-next 종료 시 sync-loop 재호출) · Phase 1b NL 라우터 · Phase 2 lift+reconcile · Phase 3 merge-back · Phase 4 per-item · hook auto-fire. (선택) state.schema.json `regen_queue` 선언(honest-debt / reuse-agent 지적). 다음 = Phase 1b 또는 2(사용자 결단).

## 9. Phase 1b 시행 로그 (v0.7.0 / 2026-06-07 — 의미 라우터)

**Phase 1b = `chain-driver route`** — 자연어 변경요청을 그래프에 ground 해 진입 노드 산출. **의미 판정 = 기존 LLM skill(`discovery-from-nl-md` → discovery-spec) / 라우팅 = 신규 결정론 도구**. §5 로드맵 Phase 1b 이행. 4원칙 — 2 Explore + **2 Senior 적대 pass**.

**★ v1(token) → v2(명시 매핑) 전환 (Senior REVISE@0.78)**: 초안은 `sync-loop --prompt` 로 matchPromptToNodes(substring) 의미 라우팅. Senior 코드검증 — **의미 라우팅 불가**(substring 은 "이건 룰 변경" 판정 불가 / analysis→chain soft edge ~2hop 감쇠 / orphan analysis kind 빈 closure). → **v2**: 의미를 LLM(discovery-spec)에 위임, 도구는 discovery-spec 의 **명시 br_id/UC 매핑**만 결정론 라우팅.

**v2 Senior REVISE@0.86 — 6건 코드확인 후 정정**: #1 br_id 매칭=`normalizeAnalysisBusinessRules`(validator 동형 / `loadBusinessRules` strict-canonical-only ❌) · #2 `--analysis` 부재+br_intent → **fail-closed exit 3** · #3 BR origin=soft edge → **notify-only/SHOULD**(full 하향=fixpoint deferred) · #4 fine UC → net-new + **counts loud** / **0-origin=propose-only exit 0**(S2 graph 부재) · #5 net-new=stdout report-only · #6 net-new BR 차단=별도 gate#1(route=비-gating).

- **신규 코어 `tools/chain-driver/src/route-discovery.js`**(gate·I/O·시간 0): `resolveDiscoveryOrigins(discoverySpec, graph, analysis)` → `{origins, net_new, diagnostics, counts}`. UC-id→노드 직접 / br_id→content 매칭→coarse `analysis-business-rules` 노드 / miss=net-new.
- **신규 `chain-driver route` 명령**(cli.js): existing origins → computeSyncLoop → regen_queue seed(durable 경로 재사용). cmdNext·sync-loop·sync-next 무변경.
- **검증(§8.1 ≥2 도메인)**: `test/route-discovery.test.js` 13(코어6+poc-05 e2e5+trust2). **poc-05(UC+BR→13 item) + poc-16(Spring 4.1 legacy / 10 UC+12 BR→31 item / net_new 0)**. chain-driver **387/387** · RR **40/40** · 3-way 0.7.0.
- **carry**: per-BR granularity(Phase 4) · UC parent-prefix 매칭 · fixpoint 자동 재진입. 다음 = Phase 2(손수정 코드 lift+reconcile / 사용자 결단).

## 10. Phase 2 시행 로그 (v0.8.0 / 2026-06-07 — 손수정 코드 lift / 유일 reverse 예외)

**Phase 2 = `chain-driver lift`** — forward-only 정책의 **유일한 reverse 예외**: 누군가 코드를 직접 손수정한 경우. 변경 코드파일 → 주인(owner) 노드 anchor(결정론 / code_pointers path) → backward 조상 = **의미 천장 후보 메뉴** surface → 사람이 `--ceiling` 으로 어느 높이까지 의미가 바뀌었는지 명시 → 그 천장부터 forward 재전파(computeSyncLoop → regen_queue). **의미 천장 판정 = 사람 only**(auto-climb ❌ = 없는 상위 의도 날조 회피 / §2 예외 정책). §5 로드맵 Phase 2 이행. 4원칙 — plan(`plan-living-sync-phase2.md`) 1원칙 + **Senior 적대 step-0 pass[REVISE@0.83] 전건 코드 사실검증** + D1~D6 사용자 승인(reconcile 분리 + poc-18 2nd 도메인).

**★ Senior 적대검토(REVISE@0.83) 전건 사실검증 후 반영** (권위≠사실정합 — 5건 모두 코드 재현 확인):
- **#1 BLOCKER 확정**: IMPL=forward-leaf 실측(`forward(IMPL)=0` / computeSyncLoop origins=[IMPL] = 자기 자신만) → plan 초안 "기본 천장=IMPL(보수적 refactor)"은 빈 큐 = 무의미. **수정(R-D2): 명시 `--ceiling` 없으면 천장 후보 surface-only / forward seed ❌ / propose-only exit 0**. 천장 메뉴가 정직한 기본 동작.
- **#3 MAJOR 확정**: `forward(BHV)` closure = `[BHV*, AC, TASK, TC, IMPL]` — 손수정 IMPL 이 재생성 대상으로 포함(사람이 방금 쓴 코드 재생성 지시 = clobber 위험). **수정(R-D4): forward closure 에서 손수정 anchor 노드 제외 + `hand_edited_excluded` 별도 보고**(computeSyncLoop 순수 유지 / cli 사후 필터 — computeSyncLoop 은 origin=천장만 제외하지 손수정 leaf 개념 없음).
- **#4 MAJOR 확정**: computeSyncLoop ancestry 체크 0 → `origins=[엉뚱한 형제 UC]` 도 통째 오-seed. **수정(R-D3): `validateCeiling` — `--ceiling` ∈ anchor backward 조상 allowlist / 아니면 exit 3 + 유효 후보 나열**(auto-climb 금지의 실효적 가드).
- **#5 MAJOR 확정**: reconcile 프리미티브(detectContentDrift/findRelocation/transition)는 code-pointer-validator·traceability-matrix-builder 패키지 / chain-driver deps=ajv만·cross-import 0(컨벤션 = shell-out 위임). **수정(R-D5): reconcile(observed-fact 재추출 + intent 충돌 propose) = Phase 2b 분리** — git/fs IO + cross-package 결정(`_shared` vs 위임) 필요 / no-op report stub(Senior #2) 회피. 0.8.0 = lift 전파 슬라이스만(헤드라인 reverse-exception 가치 완전 전달).
- **#8 MINOR 확정**: poc-16 IMPL **0건**(legacy Spring4.1 = analysis-heavy / IMPL 미생성) → lift 검증 불가. **수정(R-D8): 2nd 도메인 = poc-18(Modern Express/TS) artifact-graph 합성**(traceability-matrix-builder / IMPL-POST-001 = source_files+commit_hash).

- **신규 순수 코어 `tools/chain-driver/src/lift-anchor.js`**(fs/state/LLM/시간/git 0 / trust 가드): `liftCandidates(graph, changedPaths)` → `{anchors, unresolved, ceilingCandidates[hop정렬], ceilingByAnchor}`(resolveOriginNodeIds + analyzeImpact backward 재사용) · `validateCeiling(ceilingId, anchors, ceilingByAnchor)`.
- **신규 `chain-driver lift` 명령**(cli.js): `lift [<project>] --changed <codefile>... --graph <g> [--ceiling <id>] [--force] [--dry-run] [--json]`. --ceiling 명시 시 computeSyncLoop → regen_queue(`source:'lift'`,`ceiling`,`hand_edited_excluded` / route·sync-loop durable·clobber·has_cycle 가드 재사용). cmdNext·sync-loop·sync-next·route 무변경.
- **검증(§8.1 ≥2 도메인 / no-sim 실 CLI)**: `test/lift-anchor.test.js` 22(코어9 + poc-05 e2e11 + poc-18 2nd 도메인1 + trust2). **poc-05(register / BHV→4 item·IMPL 제외) + poc-18(Express/TS / IMPL-POST-001→TC/AC/BHV/UC 천장 surface)** 실 graph. chain-driver **409/409**(387+22) · RR **39/40**(workspace_test_pass = 문서화 env artifact / 사내 CI 40/40 · 직접 실행 chain-driver 409+tmb 152+cpv 45 전부 green) · 3-way 0.8.0.
- **carry**: Phase 2b(reconcile = observed-fact 재추출 + intent 충돌 propose / `_shared` or shell-out 결정) · Phase 3 merge-back · Phase 4 per-item granularity(BR-split STEP 3) · fixpoint 자동 재진입. 다음 = 사용자 결단.

## 11. Phase 2b 시행 로그 (v0.9.0 / 2026-06-07 — reconcile = anchor 관측사실 신선도)

**Phase 2b = `chain-driver lift --reconcile`** — Phase 2 lift 의 **reconcile 절반**(전파 절반=anchor→천장→forward 는 §10). 손수정된 코드가 anchor 노드의 **관측사실**(code_pointer path/commit_hash)과 아직 맞는지 git 으로 재탐지 → 어긋나면 **propose**(자동 덮어쓰기 절대 ❌ / 그래프 mutation ❌). §10 Senior #5 가 분리해 둔 슬라이스(cross-package = git IO + `_shared` 결정). 4원칙 — plan(`plan-living-sync-phase2b.md`) 1원칙 + **Senior 적대 step-0 pass[REVISE@0.82] 전건 코드 사실검증** + 사용자 승인(코드 착수 / lift 스토리 완성).

**★ Senior 적대검토(REVISE@0.82) 전건 사실검증 후 반영** (권위≠사실정합):
- **#2 MAJOR 확정 (핵심)**: `applyContentDrift`(validator.js:386)는 state active→drift flip 만·**commit_hash 재기록 절대 ❌**. content_drift 재앵커="새 코드가 정답" = `lift --ceiling` 이 사람에게 명시 요구하는 의미 판정 → 후보로 두면 게이트 backdoor. **수정: content_drift = flag-only / relocation(경로 이동·내용 동일)만 관측사실 후보**(프리미티브보다 공격적이면 안 됨).
- **#1 MAJOR 확정 + Senior corollary 반증**: poc-05 commit_hash(321eeb3b)가 user.service.ts(후행 커밋 2fc39e9f 추가)보다 앞서 → detectContentDrift new-file diff 로 **무조건 true**. **poc-18 도 동일**(stamp ca06a2e6 = post.service.ts 추가 cfb790ff 보다 앞선 무관 docs 커밋 / **Senior 의 "poc-18 base ca06a2e6 clean" 주장을 fact-check 로 반증** — git diff --stat 66 insertions). **수정: committed poc 2개 = "drift→flag" 메커니즘 2-도메인 corroboration / "false-positive 0(clean)" = tmp-git fixture**(commit_hash==현재 / self-contained 실 git / 환경독립).
- **#3 MINOR**: `validateCodePointers --git --worktree` 가 이미 content_drift/relocation git 사실 산출 → 부가가치 = **새 git 사실 ❌**, anchor-scoping(손수정 `--changed` 파일 주인 노드만 / 전체 graph ❌) + 관측/의도 분류 + lift 워크플로 통합. 정직 명시.
- **#4 MINOR**: `reconcileObserved` = 노드 전체 ❌ → code_pointers + gitFacts. **#6 GO**: D1 `_shared` 추출 = checkGraphFreshness 선례로 저위험(45 test 안전 확정).

- **신규 공용 `tools/_shared/code-pointer-git.js`**: makeGitRunner·detectContentDrift·findRelocation 추출(DRY / cross-tool). code-pointer-validator = re-export(내부 validateOnePointer 도 로컬 import / **45 test green**).
- **신규 순수 `lift-anchor.js reconcileObserved(codePointers, gitFacts)`**(gate·I/O·git 0): relocation→`observed_candidates` / content_drift+intent→`flags`.
- **`lift --reconcile [--base <sha>] [--repo-root <dir>]`**(cli.js): anchor strict_path pointer → detectContentDrift(worktree:true)+findRelocation → reconcileObserved → `reconcile` 보고(propose-only / exit 0). `--reconcile` 없으면 lift 무변경.
- **검증(no-sim 실 git / §8.1)**: `test/lift-anchor.test.js` 32(기존 22 + reconcile 10: 순수 분류 6 + committed poc e2e 2[poc-05+poc-18 drift→flag·propose_only·그래프 byte-identical = 2-도메인 메커니즘] + tmp-git clean 1[false-positive 0 / commit_hash==현재] + git 부재 graceful 1). chain-driver **419/419**(409+10) · code-pointer-validator **45/45**(추출 back-compat) · RR 39/40(workspace_test_pass=env artifact) · 3-way 0.9.0.
- **carry**: content_drift flag → 사람 결단 UX(재앵커 vs --ceiling 분기 명령) · relocation auto-apply(--apply / 현 propose-only) · Phase 3 merge-back · Phase 4 per-item granularity. 다음 = 사용자 결단.

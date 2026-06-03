# plan — Living dep-graph: 동기화 루프 + 소비 루프 (P0 정합)

**상태**: ★ **v11.20.0 MINOR RELEASE 완료** (2026-06-01 / session 59차 / [DEC-2026-06-01-living-dep-graph-loops](../../ai-native-methodology/decisions/DEC-2026-06-01-living-dep-graph-loops.md)). Loop A v1(A1/A2/A2-wire/A3) + Loop B v1(consult/F3/F4) 5 commit + **A2 §8.1 cap**(`computeGateFail` / content_drift `--strict` decouple = non-gating) released. §8③ plan→DEC 격상 이행 (AskUserQuestion 3종 batch 모두 "추천" 선택). **잔여 후보(A4/A5/B2-full/B5/contract/coverage gate) = §8.1 ≥2 distinct 도메인 / scope-out trigger = DEFER** (사용자 결정 ③). 이하 본문 = 원 설계 기록 (보존).
**작성**: 2026-05-31 ~ 06-01. (**supersedes** `plan-depgraph-codegraph-zerobase.md`)
**방법(무결성)**: 격리 zero-base 4-렌즈 탐색 (decisions/carry 미read 도출 → 별도 대조). 워크플로우: `whfng0hnk`(검증) / `w44i1w847`(구성·유지) / `w75n9ed45`(beyond-CodeGraph) / `w74upg540`(소비). memory: [[project_living_dep_graph_two_loops]] · [[project_methodology_purpose_ax_operation]] · [[feedback_zero_base_no_carry_anchor]] · [[project_ibatis2_migration_target_scope]].

---

## 0. 목표 (P0 운영 재진술)
사용자 원칙: **"그래프를 만들어도 못 쓰면 답이 없다(→ 쓰게 하라=소비) + 상태가 바뀌면 그래프도 바뀌어야(=동기화)."** 이는 방법론 P0(산출물 = LLM 운영 컨텍스트를 평생 **양방향 역동기화**하여 AX 운영)의 운영 언어 재진술. **현재 dep-graph 는 "만들기"만 하고 두 루프가 모두 비어 P0 미달.**
> **이 문서의 목표 = 두 루프를 채우는 것.** 모든 후보는 "어느 루프에 기여하나 / 결정론이냐 휴리스틱이냐 / read냐 gate냐"로 평가. "검증 finding 더 얹기"는 후순위.

## 1. 관통 사실 — 거의 다 "배선"이지 "신규 발명"이 아님
- **navigate 백엔드는 이미 5개 질문을 다 답함** (depends-on / depended-by / 지킬 것(MUST) / 영향 / code anchors), 노드당, **AI추론 0% 결정론** (`chain-driver navigate`, cli.js:360-430 / impact-analyzer analyzeImpact).
- **schema·state-machine 은 이미 동기화를 받도록 설계됨**: 4-state(`active/drift/propose/deprecated`) + `stale` + `suggested_path` + `commit_hash`(노드/엣지/포인터).
- **3 "designed-but-never-fired"** (이번 탐색 전체의 반복 주제): ① `suggested_path` 필드·auto-commit 정책 있는데 validator 가 **계산 안 함** ② `content_changed→drift` 전이 있는데 **코드측 생산자 없음 + 재빌드마다 active 리셋**(graph-synthesizer L521-523) ③ `commit_hash` 저장되는데 **수동 timestamp 로만**.
→ 즉 빠진 건 **트리거/생산자(동기화) + 소비 배선** 뿐. navigate 재발명 ❌, 전부 glue.

## 2. trust 선 (두 루프 공통 / 절대 규칙)
- **결정론 신호** (git blob-diff·`--follow`, 컴파일러 ts-morph/tsc, coverage JaCoCo/PIT, contract-diff oasdiff) = **자동·권위적 가능**; 출력이 verdict(drift/breaking/resolves)면 **gate-eligible**(Semgrep 동급).
- **휴리스틱 신호** (CodeGraph, embeddings, co-change, churn) = **propose / finding-only**, active 자동쓰기 ❌.
- **경계**: 결정론 추출이어도 **topology 제안**(새 엣지·노드·orphan·centrality)이면 **propose 유지**(사람이 scope-meaning 소유). verdict 일 때만 gate.

---

## 3. Loop A — 동기화 루프 (상태 바뀌면 그래프도 = 그래프가 참이게)

> **★ v1 구현됨 (2026-06-01 / commit 대기)** — `tools/code-pointer-validator/src/validator.js` + cli.js + test.
> - **A1** `checkGraphFreshness()` — synthesized_at vs derived_from mtime → stale finding. **CLI 상시 노출** (git 무관). ✅ 실데이터 검증(poc-05 stale 3종 검출).
> - **A2** content-drift 탐지(`code_pointer.content_drift` finding, opt-in `--git`) + `applyContentDrift()` 생산자(active→drift, transition 정합). ✅
> - **A3** `findRelocation()` (git `--follow` rename) → `path_missing` finding 에 `suggested_path` 첨부 (opt-in `--git`). ✅ dead 필드 활성.
> - 전부 **opt-in/비-gating(medium)** → 기존 #16 게이트·950 test 무영향. **962/962 + release-logic 14/14 green**. 실 git Windows 실행 확인(Tier-1/no-simulation).
> - **DEFER (다음 slice)**: A2-wire(SessionStart/driver 가 `applyContentDrift` 를 **live artifact-graph.json 에 기록**) · ~~A1-surface(navigate/SessionStart 노출)~~ · A4(ts-morph/JaCoCo) · A5(edge propose-state). §8.1 ≥2 도메인 전 gate 격상 ❌.
> - **★ A1-surface SHIPPED (2026-06-03 / v12.1.0 MINOR / DEC-2026-06-03-living-graph-a1-surface)** — B-minimal: `checkGraphFreshness` → `_shared/graph-freshness.js` 추출(DRY) + chain-driver `buildGraphSessionContext` 가 stale 시 `⚠️ STALE` 배너 prepend (false-health 방지 / display-only / 자동 write ❌). 새 test 2 + workspace 1046/0 + RR 30/30. dep-graph 4-의도 점검(워크플로우 감사) 결과 의도② 첫 슬라이스. ★ **A2-wire(자동 apply-drift) = Senior REJECT** (소비자 0 = P0 역전 + committed-path fixture 오염 가드 부재) → consumer+guard 선행 의무로 DEFER 강화. A(PostToolUse 증분 재합성)도 hot-path·previousGraph 부분재합성 미검증으로 DEFER 유지.

| 기여 | 후보(출처) | 신호 | trust | effort | 비고 |
|---|---|---|---|---|---|
| **A1 freshness/재synth [전제]** | PostToolUse 자동 재빌드 or navigate 가 built_at vs artifact mtime 비교 STALE/ABSENT stamp (F1=Z7=M1) | 결정론 | read(→gate면 stale 거부) | S-M | builder·hook 이미 존재. **stale 그래프 소비는 안 쓰느니 못함 → 소비 루프의 선결조건** |
| **A2 코드변경→drift [동기화 핵심]** | 저장된 `commit_hash` 기준 blob-diff → 기존 `content_changed→drift` 전이 발동 (M4) | **결정론** | **gate-eligible** | S-M | 코드측 trigger 부재(W9) 해소. 재빌드 active 리셋 중단 필요. CodeGraph 는 per-artifact baseline 없어 불가 |
| **A3 relocation 수리** | `git log --follow -M` → 이동처 → `suggested_path` 자동 생산 (W5) | **결정론** | gate-eligible(strict_path/glob/doc_link auto-commit 허용) | **S** | **최저비용 최고 ROI.** CodeGraph 는 이력 0 → 구조적 불가. dead 필드 활성화 |
| **A4 anchor 입도·검증** | ts-morph/tsc(TS)·JaCoCo method(JVM) 로 symbol 존재/실행 검증 (W3/W10) / G1 symbol-anchor enrich | 결정론(검증) / 휴리스틱(제안) | gate-eligible(검증) / propose(제안) | M | validator ast_symbol warn-only→hard 가능(결정론). Java method-level=JavaParser·Spoon UNKNOWN |
| **A5 추론 topology→propose** | code coupling 엣지(Z4) / co-change 엣지 / cold-start seed(G2) / orphan-code(Z2·W4) | 휴리스틱/혼합 | **propose/finding-only** | M~L | active 자동쓰기 ❌. **엣지엔 propose state 필드 부재**(schema 확장 필요) = Z4 최대 제약 |

## 4. Loop B — 소비 루프 (각 단계가 그래프를 실제 사용 = 그래프를 쓰게)

> **★ v1 구현됨 (2026-06-01 / commit 4b9e08b)** — 5 stage agent body 에 "dep-graph 소비" 섹션 추가.
> - **F6+F2 (consult)** — discovery/spec/plan/test/implement agent 가 **stage 진입 시 `chain-driver navigate` 로 작업 노드 의존성 조회** (backward=honor / forward=영향 / code_pointers), AI 추론 0% verbatim. Loop A 정합(stale/drift 시 재합성 후). **PLAN 의 의존성 AI-재유추 → 그래프 조회 전환 명시.**
> - frontmatter skills[] **무변경** — agent 기존 `Bash` + CLI 로 접근 (drift-validator skills==phase-flow invariant 회피 / 검증: chain-layout 0 orphan·0 missing).
> - **★ F3 + F4 구현됨 (branch feat/dep-graph-loop-b-f3 / commit 65d1346, 4c3b10b)** — F3 `navigate --stage/--scope` 일괄 rollup(단일노드→단계 일괄) + F4 stage별 방향 프리셋(`--direction` override / discovery·spec·implement=backward / plan·test=forward). navigate 20/20 / workspace 973/973.
> - **DEFER (잔여 / 전부 무거움·breaking·env·차단 → 각각 결정 필요)**: full hook auto-injection(SessionStart per-scope 주입 / 무거움·stage-entry event 부재) · F5 pre-gate 체크 · A4(ts-morph·JaCoCo / env 의존) · A5(edge propose-state / breaking schema) · gate 격상(§8.1 ≥2 distinct 도메인).

**B0 현실**: 5개 stage agent **누구도 그래프를 조회 안 함**(skills[] 에 navigator 부재, grep 확인). SessionStart 는 한 줄 배너+포인터만. **PLAN 이 가장 아이러니** — 그래프 필요 최고인데 `plan-decompose-and-sequence` 가 "같은 테이블/캐시키/파일 겹침"을 **AI 로 추론**해 의존성 유추(그 답을 담은 그래프를 두고).

| 기여 | 후보(출처) | trust | effort | 비고 |
|---|---|---|---|---|
| **B1 agent 접근 [전제]** | 5 stage agent `skills[]` 에 navigator(또는 B3 변형) 추가 (F6) | read | **LOW** | auto-consult 의 구조적 전제. frontmatter + skill-citation-validator |
| **★ B2 단계진입 자동주입 [biggest unlock]** | 단계 진입 시 scope 의 의존성 neighborhood 주입 = MUST backward(지킬 것)+forward(영향)+code_pointers (F2) | read(배너와 동급) | M | navigate 거의 100% 재사용. **수동 pull → 라이브 소비**. PLAN 의 AI 재유추 제거 |
| **B3 stage/scope 일괄질의** | `navigate --scope/--stage` rollup (단일노드/전체덤프 갭) (F3) | read | M | `scope_id`/`artifact_kind` 필드 이미 존재(navigate 가 무시). filter+rollup 신규. ※`query --scope` = 별도 manifest store, 혼동 ❌ |
| **B4 방향 프리셋** | 단계별 forward/backward 기본값 (discovery/spec/impl=backward, plan/test=forward) (F4) | read | **LOW** | `includeForward/includeBackward` toggle 이미 존재. 표현만 |
| **B5 gate 정합체크 [유일 gate-class]** | go/stop gate 에서 MUST backward 미충족·drift 노드 surface (F5) | **GATE** | M-H | 결정론 그래프 사실만(MUST-edge-missing/state==drift), 휴리스틱 ❌. chain-coverage/forward_coverage 중복게이팅 ❌. ≥2 도메인 후 |
| **+ code→spec reverse 질의** | "이 파일 바꾸면 어떤 AC/BHV/UC?" (Z3/W7) | read/propose | M(core S) | implements 엣지 역전 core 는 CodeGraph 불필요 |

## 5. CodeGraph 의 실제 위치 — 보완재, 주력 아님
비-CodeGraph **결정론** 도구가 10개 약점 중 **5+개에서 우위**(W2/W3/W4/W5/W7/W8/W9/W10). **CodeGraph 고유 우위 = W1(call-level 완전성) + W6(구조 fan-in)** 뿐, 둘 다 보완적. → **두 루프의 주력은 git/compiler/coverage/contract-diff(결정론)**, CodeGraph 는 그 위 보완 lens. (CodeGraph 는 heuristic → 영구 reference-lens; 결정론 도구가 권위/게이트를 가짐)

## 6. 시퀀스 (동기화 먼저 → 소비)
```
선결: A1 freshness  +  B1 agent 접근
1. A3 git --follow → suggested_path        (S, 결정론, 즉효 / dead 필드 활성화)
2. A2 commit_hash blob-diff → drift        (S-M, 동기화 핵심 / W9 해소)
3. B2 stage-entry 자동주입 (+B4 프리셋)     (M, 소비 핵심 unlock)
4. B3 stage-scoped 질의                     (M)
5. A4/A5 anchor 검증·propose 보강           (M, ts-morph/JaCoCo/G1/Z4-seed)
후순위(≥2 distinct 도메인 corroboration 후): B5 gate / contract-diff(oasdiff) gate / coverage TC→IMPL gate
```

## 7. 정직한 제약
- **early-stage thin graph**: 전체 그래프는 6 chain 산출물에서 **늦게** 합성 → discovery/spec 단계엔 조회할 그래프가 얇음. "각 단계"를 과약속 ❌(점진 빌드 or 정직 인정).
- **스택 비대칭**: JVM(JaCoCo/PIT/oasdiff) 강 / TS(ts-morph 강하나 **per-test 귀속 native 부재**) / **Java method-level symbol = JavaParser·Spoon 필요 = UNKNOWN**. 없는 데서 주장 = simulation.
- **R19 Tier**: oasdiff/dep-cruiser/madge/ts-morph=Tier-1 실행가능 / Gradle·Bazel=Tier-2 / OTel=최중량(partial). 환경 부재=exit-3 정직 carry.
- **§8.1**: 전부 단일 RealWorld(MyBatis3) 도메인 추론 → **gate-class(A2-as-gate/B5/contract/coverage)는 ≥2 distinct 도메인 전 WARN/propose**. read-class(B1~B4/A1/A3-suggest)는 저위험 additive.
- **엣지 propose-state 부재**: 노드는 state 有(propose seed/orphan 안전) / 엣지 schema 는 `additionalProperties:false` state 無 → propose 엣지(A5/Z4)는 schema 확장·side-file 필요.
- **navigate 재발명 금지** / trust 선 준수 / **iBATIS2 = scope-out**(migration target).

## 8. 다음 (사용자 결정 대기)
① pursue 여부(scope-out trigger 판단) ② 어느 후보부터 — 권장 **A3 → A2 → B2** (저비용·결정론·즉효 / 두 루프 한 축씩) ③ 착수 결정 시 본 plan → DEC 격상.

---

## 부록 A. 4-렌즈 후보 전체 (출처 추적)
- **검증(on-graph) Z1~Z9** (`whfng0hnk`): Z1 anchor symbol-existence / Z2 orphan-code / Z3 code→spec reverse / Z4 coupling propose-edge / Z5 affected-tests / Z6 code fan-in centrality / Z7 freshness / Z8 suggested_path / Z9 contract conformance. carry 대조: federation carry 4항목 중 **3 재도출(Z3=#1,Z8=#2,Z2/Z4=#3) + 5 신규(Z1,Z5,Z6,Z7,Z9)**; #4 MCP serve = UX wrapper, 정당 skip.
- **구성·유지 G/M** (`w44i1w847`): G1 symbol-anchor enrich / G2 cold-start seed / M1 staleness(=Z7) / M2 suggested_path(=Z8) / M3 symbol-rot / M4 code-side drift / M5 deprecation corroborator. 신규 3 = G1·G2·M4.
- **beyond-CodeGraph** (`w75n9ed45`): git `--follow`/blob-diff(결정론) · coverage JaCoCo/PIT · contract-diff oasdiff · ts-morph/tsc · build-extractor(dep-cruiser/madge/jdeps) · orphan · churn · co-change. **biggest surprise = "designed-but-never-fired" 3종을 git+contract-diff 가 권위 있게 채움**.
- **소비(in-stage query) F1~F6** (`w74upg540`): F1 freshness / F2 stage-entry 주입 / F3 stage-scoped 질의 / F4 방향 프리셋 / F5 pre-gate 체크 / F6 agent 접근. biggest unlock = F2.

## 부록 B. dep-graph 약점 인덱스 (W1~W10)
W1 terminal-leaf(code↔code 엣지 부재) / W2 human-authored-edge 무검증 / W3 coverage existence-only / W4 orphan-code 개념 부재 / W5 stale=move-only(content-drift/relocation 무신호) / W6 centrality artifact-only / W7 spec→code 단방향 / W8 cold-start seed 부재 / W9 drift artifact-trigger only(코드측 없음) / W10 anchor file-granular(symbol seam 미충전).

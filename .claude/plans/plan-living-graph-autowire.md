# plan — Living dep-graph 자동배선 (gap A 자동주입 + gap B 자동유지)

**상태**: **구현 완료 (Slice 1·2·3·5 / working tree 미커밋) → 다음 세션 resume**. 승인 완료(6 결정 = §8 권장안 전부). Slice 4(next-prompt 자동 surface)=deferred. 사용자 방향 = **(나)+(다)** = 완전한 "살아있는 지식 그래프". 자매 research = [[research-living-graph-autowire]].

> **다음 세션 RESUME 포인트 (2026-06-19)**: 코드+검증 끝(§9 검증 종합 / 회귀 0). 남은 건 **절차/선택**:
> 1. **실제 릴리스** — per-slice DEC 격상 + 버전 bump(v0.63.0 → **v0.64.0 MINOR**) + CHANGELOG + 커밋. 현재 `main` 이라 커밋 시 브랜치 분리 여부 결단 필요. (memory `feedback_commit_style` / `feedback_publish_from_clean_tree`)
> 2. **Slice 4** (deferred / 결정 #5 "step2 입증 후") — Gap B 를 UserPromptSubmit drain 으로도 자동 surface. `drainLiftCandidates` 재사용(이미 cmdSyncNext/cmdNext 배선 됨) → graph-context-nudge sibling 또는 hooks-bridge UserPromptSubmit 에 drain 추가.
> 3. **carry** — `.gitignore` `**/.ai-context/` 위생 확장 / matchPromptToNodes 정밀도 refine(id-part 도메인 폭).
> 변경 파일: 신규 `tools/_shared/source-ext.js` · `tools/chain-driver/src/lift-surface.js` · `scripts/graph-context-nudge.js` (+테스트 2) / 수정 `tools/chain-driver/src/cli.js`(import+impact_pending버그수정+source-write mark+drain wiring) · `hooks-bridge.js`(detectSourceFileWrite/markLiftCandidatePending) · `hooks.json`(UserPromptSubmit sibling) · `schemas/work-unit-manifest.schema.json`(lift_candidate_pending) · `guides/first-prompt-cookbook.md`(§2.1.1).
**작성**: 2026-06-18. **부모 SSOT**: [[plan-living-dep-graph]] (두 루프 원 설계) — 본 plan = 그 plan의 §8③ DEFER 후보 중 "B2-full(자동주입) + lift 자동트리거(자동유지)" 슬라이스를 켜는 후속.
**방법(무결성)**: 1원칙 기존자산 실측(direct read) + 2원칙 워크플로 `wf_a97e5d40-6dd`(선례×2 + Senior + 5축 적대검증). diagnose-before-design(memory `feedback_diagnose_before_design_check_existing`) — 재발명 차단 + 적대검증 2결함(blocker/major) 선반영.

---

## 0. 목표 (P0 운영 재진술)

사용자: **"AI로 처리할 때 의존성을 따라가 빠르게 문제 파악(=소비/주입) + 산출물도 그래프에 엮이고 이 모든 게 지식 그래프처럼 움직이고 유지(=자동유지)."** = 방법론 P0(산출물 = LLM 운영 컨텍스트를 평생 동기화하여 AX 운영)의 운영 언어.

## 1. 기존 자산 실측 결론 — ~85% 이미 존재, 갭 = 2개

- **산출물은 이미 그래프에 엮임**: `artifact-graph.json` = Tier-1 산출물 25(chain 6 + analysis 15 + aspect 4 + plan EPIC/STORY/OP) + 엣지 8종 + `code_pointers`(산출물↔코드). codegraph(코드구조)는 `context-federator`가 join. → "엮어야"는 **완료**.
- **갭 A (자동주입)**: Loop B v1 = 5 stage agent **본문**에 "stage 진입 시 navigate" 지시(LLM 양심 / 강제·자동 ❌). B2 "단계진입 자동주입" = **DEFER ("무거움" + stage-entry 이벤트 없음)** = context-federation Phase 3b.
- **갭 B (자동유지)**: 전파 커널 출하(sync-loop/route/lift/cross-scope drift/resync-graph/STALE 배너). **living-sync §7 미배선**: ① 손수정 **코드** → lift **자동 트리거**(현재 수동 — 코드 파일은 IMPL forward-leaf=빈 closure=no-op라 의미천장 미상향) ② 재생성-후 fixpoint **자동 재진입**.
- → 새 발명 ❌. **빠진 건 두 trigger/glue뿐. 둘 다 이미 식별된 carry**(DEC-2026-06-02 §5 / living-sync §7).

## 2. trust 제약 (절대 / 설계가 반드시 준수 / C1~C8)

| | 제약 |
| --- | --- |
| C1 | hook 이벤트 4종만: SessionStart / UserPromptSubmit / PreToolUse / PostToolUse. **stage-entry 이벤트 없음**. |
| C2 | **forward-only**. lift = 유일 reverse 예외. **auto-climb ❌**(사람이 의미천장 확정). bidirectional sync = 비채택 확정(DEC-2026-06-09). |
| C3 | 결정론 경계: *어느 노드 영향*=100% 그래프 reachability(LLM ❌) / marking 로직 LLM·IO 의존 0 / LLM은 drift 노드 내용 재생성 시에만 진입. |
| C4 | **no-gate-inject**: 그래프/codegraph는 결정적 gate에 절대 주입 ❌(reference-lens). release-readiness check34~39 = gate 모듈 codegraph 토큰 0 grep 강제. |
| C5 | Senior REJECT 재제안 ❌: (a) PostToolUse per-write **전체** auto-resync(stateless·debounce 불가 → quadratic + fixture 오염) (b) consumer+guard 없이 committed `artifact-graph.json` auto-write(P0 역전). |
| C6 | write-scope = 프로젝트 `.ai-context/output/`(+ git-ignored runtime) only. **git-tracked fixture 변조 ❌**. |
| C7 | env-graceful: codegraph/git/graph 부재 → no-op exit 0 / exit 3 정직. simulation ❌. |
| C8 | §8.1: gate-class 격상 = ≥2 distinct 도메인 후. read/additive class는 영구 non-gating(미격상 시). |

**재사용할 검증된 경량 패턴**: `scripts/codegraph-nudge.js`(PreToolUse additive·non-block·opt-out·env-graceful) / PostToolUse `impact_pending` mark(`current_scope` 활성 시 `writeManifest`) / `revisitAdvisory`(별 advisory 변수 / gate 미주입) / `routeEntry`(UserPromptSubmit advisory) / `resolvePromptToNodes`(결정론 식별자 매칭) / `liftCandidates`(surface-only).

## 3. Gap A 설계 — prompt-time 1-hop 그래프 컨텍스트 주입

- **이벤트**: `UserPromptSubmit` 형제 hook (synthetic stage-entry 발명 ❌ / C1). 선례 6/6이 query-submit 시점 주입 — file-open/write ❌. `routeEntry`와 같은 이벤트 위 sibling.
- **메커니즘**: 신규 `scripts/graph-context-nudge.js` → stdin event JSON → `.ai-context/output/artifact-graph.json` 로드 → `resolvePromptToNodes(prompt, graph, {topN:5})` → 매칭 origin들의 **진짜 1-hop 이웃** → `hookSpecificOutput.additionalContext`만 emit(additive).
- **🟠 무거움 fix (적대검증 major)**: "navigate verbatim" ❌. `navigate --origin`=`analyzeImpact` 전체 transitive closure(MUST 무한감쇠)+`topKImpactRoot` → **whole-graph**. 진짜 1-hop을 **selection 레이어에서 엔지니어링**:
  - `analyzeImpact` 결과를 `additional_hard_hops === 0`(첫 hop)만 필터 + `topKImpactRoot`(centrality) **제외**, **또는** 신규 결정론 helper `neighbors(graph, id, {hops:1})`(origin에 incident한 `graph.edges`만 — analyzeImpact·centrality 미호출).
  - **예산 = 노드/엣지 개수 cap**(텍스트 줄 cap ❌): **≤8 노드 / 1-hop / top-5 origin dedupe**, 초과 시 `(+M more)` 정직 truncate.
- **주입 내용**: 매칭 노드 id + 1-hop 이웃(id·subkind·title·edge_type) + STALE/drift 플래그 + reference-lens 고지. **미주입**: 노드 본문, code_pointer 파일 본문, raw JSON, >1-hop, **매칭 0(한글 산문)=침묵 no-op**.
- **결정론(C3/C4)**: `resolvePromptToNodes`(`_shared/prompt-node-match.js` / 식별자 substring+rank / 임베딩 carry) + 1-hop = 100% 결정론·LLM 0. additionalContext = LLM 대화에만 / gate 미주입.
- **never-block**: additionalContext only / exit 2·deny ❌ / 실패(그래프 부재·parse·empty·throw) = exit 0 silent (codegraph-nudge 계약).
- **opt-out**: `CONTEXT_OPS_GRAPH_NUDGE=0` + 그래프 부재 시 no-op(C7) + once-per-(session,prompt-hash) marker.

## 4. Gap B 설계 — 코드변경 lift 자동 트리거 (detect→mark→surface)

- **trigger**: 기존 PostToolUse `Write|Edit` hooks-bridge 확장. **source 파일** write 감지(`isSourcePath` 재사용 + repo 내부) 시 mark. **impact·lift 실행 ❌ at write time.**
- **🔴 write-scope fix (적대검증 blocker)**: ".ai-context/state.json git-ignored" 전제 **틀림**(root `.gitignore`=`examples/**/`만). →
  - mark = 신규 unguarded state.json append ❌ → **기존 `impact_pending` 패턴 그대로**: `current_scope` 활성 시에만 `writeManifest`로 scope manifest의 `sync_state.lift_candidate_pending[]`에 변경 path append(미초기화 프로젝트 = 자동 no-op).
  - write 전 **`git check-ignore <path>` 검증** → tracked면 no-op exit 0(절대 tracked write ❌).
  - `.gitignore`를 `**/.ai-context/state.json`(+`state.json.tmp` + `**/intervention-log.jsonl`)로 확장(living-sync §8 스캐폴드를 repo 자신에도 적용).
- **drain(surface / advisory)**: 다음 `chain-driver next`/`sync-next`(명시 / 안전 우선)에서 pending set **1회 batch drain** → `liftCandidates(graph, changedPaths)`(lift-anchor.js / `includeForward:false` surface-only) → ceiling 후보를 **advisory**로 emit("손수정 코드 X가 의미천장을 BHV/AC로 올렸을 수 있음 — `lift --changed X --ceiling <id>` 권장"). **아무것도 자동 실행 ❌**. `revisitAdvisory` 선례 동형(별 advisory 변수 / `evaluateGate` findings 미주입).
- **forward-only(C2)**: `liftCandidates`는 ceiling **surface만**(write·전파 ❌). forward 재전파는 사람 `lift --ceiling`(`validateCeiling` ancestry guard) only. 새 reverse 엣지 0. auto-climb ❌.
- **C5 회피**: (a) detect+mark only / 비싼 drain은 demand 시 최대 1회(coalescing 경계 — Salsa lazy/Skyframe Differencer/chokidar debounce가 검증) = per-write·quadratic ❌. (b) committed `artifact-graph.json` 절대 미변경 — git-ignored runtime(scope manifest)만 / consumer=사람 `lift`.

## 5. 적대 검증 2 결함 반영 요약

| 결함 | 반영 |
| --- | --- |
| 🟠 major (Gap A 무거움) | §3 — `additional_hard_hops===0` 필터 + `topKImpactRoot` 제외(또는 `neighbors hops:1` helper) + **노드수 cap ≤8 / 예산=노드·엣지 개수**. "navigate verbatim" 표현 폐기. |
| 🔴 blocker (Gap B write-scope) | §4 — state.json git-ignored 가정 폐기 → `current_scope` 가드 `writeManifest` + `git check-ignore` + `.gitignore` `**/.ai-context/` 확장. |
| minor (C2 test) | §6 — "drain이 `computeSyncLoop` 절대 호출 안 함" 단정 test. |
| none→hardening (C4) | §6 — 신규 script가 `gate-eval.js`/`findings-aggregator` 미import + `evaluateGate` findings가 `lift_candidate_pending` 유무에 byte-identical 단정 test + release-readiness sibling check. |

## 6. 시퀀스 (저위험 우선)

1. **Gap B detect+mark** (최저위험): PostToolUse 확장 — source write → `current_scope` manifest `sync_state.lift_candidate_pending[]` append (`git check-ignore` 가드). 순수 state append / 동작변경 0. unit test.
2. **Gap B surface (명시 drain)**: `chain-driver next`/`sync-next`에 `liftCandidates` drain 배선 → ceiling advisory stderr+`--json`. 자동실행 ❌. test: forward-only(그래프 mutation 0 / `computeSyncLoop` 미호출) + 그래프 부재 no-op.
3. **Gap A nudge**: `scripts/graph-context-nudge.js` UserPromptSubmit sibling, resolvePromptToNodes→1-hop(≤8노드), additive only, `CONTEXT_OPS_GRAPH_NUDGE`. test: empty-prompt no-op + 노드수 cap + 대형그래프 payload bound.
4. **Gap B surface on next prompt** (drain on UserPromptSubmit): step 2 입증 **후** — 편의 자동-surface. noise 위험 → 마지막.
5. **release-readiness**: check34~39 gate 모듈 0 유지 확인 + 신규 sibling check(신규 script gate-import 0) + test `criteria_total`/expected-ids/pass-count 동시 갱신(memory `feedback_release_readiness_count_coupling`) + full `test:release`.

## 7. 정직한 제약 / 리스크

- **한글 산문 한계**: `resolvePromptToNodes`=영문 식별자 bias → 한글 작업 prompt는 자주 empty=침묵 no-op. **정직하나 Gap A 가치는 prompt가 구체 id/symbol 명명 시에만**. coverage 과약속 ❌.
- **early-stage thin graph**(부모 plan §7): discovery/spec 단계엔 그래프 얇음 — 주입할 이웃 적음. 정직 인정.
- **lift 완전성 = code_pointer 커버리지 상한**: 앵커 없는 코드 = 후보 0(추적 밖) → unresolved count 라벨 의무.
- **state.json 무한 성장**: 사용자가 never-drain 시 `lift_candidate_pending` 누적 → cap + path dedupe + advisory는 count만(full list ❌).
- **dogfooding noise**: 이 repo 자체 plugin 개발 중 source write가 Gap B 발동 → `.ai-context/` 존재 프로젝트 + opt-out으로 gate.
- **§8.1**: 둘 다 단일 도메인 추론 → **non-gating advisory/read class only 출하**. gate 격상 = 별도 ≥2 도메인 증거 후(C8).
- **durability stratification**(Salsa) = 미래 최적화 carry(본 batch 비-load-bearing).

## 8. 사용자 일괄 승인 대기 (6 결정 묶음 / 4원칙 §3)

> 승인 후 plan → per-slice DEC 격상 + 시퀀스 §6 착수. (권장안 = 각 항 첫 옵션)

1. **Gap A 이벤트** = `UserPromptSubmit` sibling (synthetic stage-entry ❌). [권장]
2. **Gap A 예산** = top-5 origin + **진짜 1-hop**(`additional_hard_hops===0` + centrality 제외) + **노드수 cap ≤8**(텍스트 cap 아님). [권장]
3. **Gap A 기본상태** = 기본 ON + opt-out + 한글 산문 침묵 no-op. [권장] (vs 보수적 opt-in)
4. **Gap B write-scope** = `current_scope` 가드 `writeManifest` + `git check-ignore` + `.gitignore` `**/.ai-context/` 확장. [권장] (blocker fix)
5. **Gap B surface 시점** = 명시 `next`/`sync-next` 먼저(step 2), next-prompt 자동-surface는 입증 후(step 4). [권장]
6. **격상 class** = 둘 다 non-gating advisory/reference-lens only 출하(gate 격상 ❌ / C8). [권장]

## 9. Lessons Learned (구현 2026-06-19)

- **기존 버그 발견·수정 (strict 읽기 = drift 폭로)**: `impact_pending` 마킹의 `writeManifest(root, scope, manifest)` 3-arg 호출 → `stage` 자리에 manifest 객체 → `validateStage` throw → 바깥 try/catch 삼킴 = **impact_pending 영속 실패**. 다른 모든 call-site(`sync.js`×3)는 4-arg `null`. → `writeManifest(root, scope, null, manifest)` 수정. (memory `feedback_strict_exposes_drift` 재확인)
- **승인 #4 mechanism 편차 (더 안전·일관)**: 설계는 "state.json + `git check-ignore` + `.gitignore` 확장"이었으나, 실제 코드에서 `impact_pending`이 scope manifest(`writeManifest`)에 씀 → Gap B 도 동일 패턴. `git check-ignore`는 manifest(committed 산출물)엔 오히려 해로움 → 미채택. 안전장치 = `current_scope` 가드(미초기화 no-op) + opt-out. `.gitignore` 확장은 state.json 미사용으로 load-bearing 아님 → 보류.
- **strict 테스트가 자기 자신을 잡음**: lift-surface 의 `computeSyncLoop` 미참조 테스트가 *자기 모듈 주석의 "computeSyncLoop 미 import" 문구*에 매칭돼 실패 → 호출/import 패턴(`computeSyncLoop\s*\(` / `import[^;]*computeSyncLoop`)으로 정정(prose 언급 허용).
- **Edit 탭 매칭**: Read 디스플레이로 탭 수 세는 것 불신뢰 → `sed 's/\t/»/g'` (또는 cat -A 부재 시) 로 정확 탭 확보가 반복 Edit 실패 방지. cli.js 함수 본문 1탭 기준 확정 후 1발 성공.
- **matchPromptToNodes id-part 폭**: full-id(`TC-NOTES-001`=score5)가 top 이나 id-part(`notes`/`001`=score1)로 도메인 형제(AC/BHV/TASK-NOTES-*)도 origin 진입 → 도메인 컨텍스트 surface. navigate 공용 거동 / **bounded(top-5 + ≤8)** = "whole-graph 아님" 충족. 정밀도 refine 은 carry.
- **release gate vs 게이트 로직 테스트**: `release:check`는 `--target` 필수 = 릴리스 시점 도구(버전·CHANGELOG·clean-tree 검사). mid-dev 검증 = `test:release`(게이트 로직 27/27) + 영향 도구 회귀. 실제 릴리스(DEC 격상 + 버전 bump + CHANGELOG + 커밋)는 별도 승인 단계.

**검증 종합 (2026-06-19)**: chain-driver 632/632 · schema 113 · traceability 179 · drift 49 · scripts nudge 21 · 하드닝 13 · test:release 27/27 · e2e 스모크(match→inject / 한글 침묵). 회귀 0. 전부 working tree (미커밋).

---

## 인용 / cross-link

- [[plan-living-dep-graph]] — 부모 두-루프 설계 SSOT (Loop A/B / 후보 인덱스 W1~W10 / F1~F6)
- `methodology-spec/living-sync-operating-model.md` §4 lift / §7 미배선 (자동 트리거 carry SSOT) / §8 git 위생
- DEC-2026-06-02-context-federation §5 (Phase 3b "무거움" DEFER = Gap A)
- DEC-2026-06-09-reverse-eng-methodology-gap (bidirectional sync 비채택 = C2)
- DEC-2026-06-18-discovery-universal-entry-router (`routeEntry` UserPromptSubmit 선례)
- DEC-2026-06-15-codegraph-search-token-saving (`codegraph-nudge` additive-injection 선례)
- DEC-2026-05-28 §4.2 (reference-lens / gate inject ❌ = C4)
- research: [[research-living-graph-autowire]] (선례 13 + 적대검증 5축)

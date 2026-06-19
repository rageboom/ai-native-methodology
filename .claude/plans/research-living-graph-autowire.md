# research — Living dep-graph 자동배선 (gap A 자동주입 + gap B 자동유지)

**상태**: 4원칙 §2 (에이전트 팀 토론) 결과. 워크플로 `wf_a97e5d40-6dd` (research×2 + Senior design + 5축 적대 검증). 모든 외부 인용 = sub-agent 실 fetch + version-pinned (memory `feedback_research_fact_validation`). 자매: [[plan-living-graph-autowire]].
**작성**: 2026-06-18.

---

## 0. 질문

사용자 비전 = dep-graph(artifact-graph)가 **살아있는 지식 그래프**: (A) AI 작업 시 의존성을 자동으로 끌어와 빠르게 문제 파악 / (B) 상태(산출물·코드)가 바뀌면 그래프가 자동으로 따라 유지. 두 갭을 **무거움 없이 / forward-only / non-gating** 안에서 켜는 업계 선례는?

## 1. Gap A — prompt-time 경량 컨텍스트 자동주입 (선례 7)

| 도구 | 경량화 기법 | 출처 |
| --- | --- | --- |
| **Cursor** (Codebase Indexing + Inference-Time Retrieval) | on-demand only(@Codebase/Cmd+Enter, always-on ❌) / 코드 본문 원격 저장 ❌ query 시 로컬 read / Explore 서브에이전트 격리(별 context window) / Merkle-tree 증분 = 변경 파일만 재임베딩 | cursor.com/blog/secure-codebase-indexing (2025) |
| **GitHub Copilot** (IDE-assembled context) | open-tab 이웃(에디터에 열린 것 = 추가 retrieval 0) / agent-mode 파일선택 query-driven / full-codebase dump ❌ / proximity-first 랭킹 | m365.fm copilot-context (2025-09) |
| **Sourcegraph Cody** (BM25 + graph ranking) | 기존 search index 위 BM25(별도 embedding store 불요) / top-N = function-length budget 한정 / autocomplete 로컬 only / **serial LLM orchestration 명시 거부**(latency·randomness 누적) | sourcegraph.com/blog/how-cody-understands-your-codebase (2024) |
| **Continue.dev** (@Codebase) | **nRetrieve=25 → nFinal=5** 2단계 funnel(핵심 비용 cap) / 로컬 index / on-demand | docs.continue.dev/customize/context/codebase (2024 / 이후 agent-tool 로 deprecate) |
| **JetBrains AI 2024.3** (PSI 기반 자동포함) | 기존 IDE parse tree 재사용(추가 인덱싱 0) / PSI symbol resolution 그래프로 bound / 사용자가 자동포함 prune 가능 / vector DB 불요 | blog.jetbrains.com/ai/2024/11 (2024.3) |
| **Augment Code** (semantic dep-graph + live index) | token-budget cap(manifest) / 4456 → 682 → 2847 토큰 relevance 랭킹 / query-driven / deprecated-pattern 자동 필터 | augmentcode.com/context-engine (2025) |
| **Code Digital Twin** (Fudan / arXiv 2503.07967) | **typed-edge subgraph 확장 + 랭킹**(full graph dump ❌) / token-budget manifest / 인터페이스·제약 우선 ordering(lost-in-middle 완화) / change-event 증분 | arxiv.org/abs/2503.07967 (2025-03) |

**핵심 takeaway (Gap A)**:
1. 6개 production 도구 **전부 query-submit 시점 on-demand** retrieval — file-open/write 시점 always-on 주입은 1차 경로에 **아무도 안 씀**. → 우리 `UserPromptSubmit`이 정직한 analog.
2. 지배적 경량 패턴 = **2단계 funnel**: broad retrieve → rank → narrow(top-N + token cap). → 우리 `resolvePromptToNodes(rank)` → `navigate(1-hop cap)`로 동형.
3. 의존성 그래프 traversal은 **typed-edge + 책임경계 랭킹으로 bound(임의 depth ❌)** — Code Digital Twin/Augment가 우리 artifact-graph 엣지(derived_from/implements/tests/depends_on)와 정확히 동형.
4. Cody의 **serial LLM orchestration 거부**가 우리 C3(결정론 경계)를 외부에서 검증.
5. JetBrains PSI 재사용 = 우리 상황의 최근접 analog — **이미 결정론으로 빌드된 artifact-graph index가 있으니 query-time은 lookup이지 신규 인덱싱 투자 아님**.

**caveat (전이 안 되는 부분)**:
- 6개 전부 embedding/vector index 기반. 우리 C3 + 기존 `resolvePromptToNodes`(식별자 substring, similarity ❌)는 vector 경로 **채택 불가** — *경량 기법(on-demand·top-N)은 전이 / retrieval 메커니즘(vector similarity)은 비전이*. 임베딩은 영구 carry.
- Cursor 서브에이전트 격리 = 별 context window spawn 필요 → 우리 hook 4종에 spawn 이벤트 없음 → `UserPromptSubmit` advisory 주입으로 근사.
- JetBrains/Augment 자동주입은 native IDE plugin(cursor·open-tab 상태 read). 우리 hook은 IDE file-open 상태 없음 — 가용 신호 = prompt 텍스트 + git diff.
- **PostToolUse Write 이벤트로 컨텍스트 주입하는 사례는 0** (Augment의 post-commit live index ~40s = async index 유지이지 동기 주입 아님). → Gap A는 write가 아니라 **prompt 시점**이 맞다.

## 2. Gap B — 증분/변경트리거 그래프 유지 (선례 6)

| 시스템 | 경량화 기법 | 출처 |
| --- | --- | --- |
| **Salsa (rust-analyzer)** | demand-driven(lazy / query 시에만 재실행) / **durability vector**(volatile write가 durable subgraph O(1) skip) / **early cutoff**(재실행 결과 동일 → backdate, 전파 중단) / debounce timer 불요(laziness가 coalesce) | salsa-rs.github.io/salsa/reference/algorithm.html (2023~) |
| **Bazel Skyframe** | bottom-up dirty-marking(reverse 폐포만 invalidate) / **change pruning + resurrection**(재빌드 출력 동일 시 downstream 부활) / action-level cache key / persistent server | bazel.build/reference/skyframe (Bazel 7.x) |
| **Materialize / Differential Dataflow** | **delta(diff) 전파**(full collection ❌, (data,time,±1) 튜플만) / linear operator는 delta에 직접 적용 / join은 변경 key만 / versioned frontiers | materialize.com/blog/differential-from-scratch (2021) |
| **LSP `TextDocumentSyncKind.Incremental`** | range-based 증분 edit payload(변경 range만) / version 카운터로 missed-event 감지 → full re-sync fallback / work = O(edit size) | LSP 3.17 (2021) |
| **File watcher debounce** (Chokidar v4 / webpack `aggregateTimeout`) | trailing debounce(100~250ms) / 변경 path를 Set에 누적 후 1회 batch emit / metadata-only(CHMOD) 필터 | github.com/paulmillr/chokidar (v4, 2024-09) |
| **Git hooks** (pre-commit framework) | `git diff --cached --name-only --diff-filter=ACM` = dirty 파일만 / generator는 매칭 path만 / `files` 패턴으로 무관 변경 skip(<5초 = bypass 방지) | git-scm.com/docs/githooks (pre-commit 3.x) |

**핵심 takeaway (Gap B)**:
1. 전부 full recompute 회피 = **2-step**: (1) write 시점 **싸게 dirty-mark**(Skyframe reverse-closure / Salsa O(1) bump / watcher Set 누적), (2) 실제 재실행은 **demand 또는 dirty-set으로 bound**(Salsa lazy / Skyframe invalidated만 + resurrection). → 우리 `impact_pending` mark = step 1. **빠진 건 규율 있는 step 2**(다음 stage-entry/명시 sync-next 시 lazy drain, per-write eager ❌).
2. **early cutoff / change pruning이 보편** — Salsa backdate / Bazel resurrection / DD delta 상쇄. 전파 wave가 stable 노드에서 자가 종료 → 중간 BHV/AC 내용 무변경 시 leaf IMPL까지 전파 불요. 우리 sync-loop forward 폐포에 "출력 무변경 → STALE 중단" 체크 추가로 구현 가능.
3. **durability 계층화(Salsa)** = Gap B 최직접 비용절감 — UC/BHV=durable(드물게 변경) vs TC/IMPL=volatile(자주). volatile write가 durable subgraph skip. 우리 `artifact_kind/subkind` taxonomy에 clean 매핑(단 본 batch 비-load-bearing carry).
4. **이벤트 경계 coalescing 필수** — 모든 시스템이 동일 논리변경의 다중 write 이벤트를 downstream 전에 collapse. 우리 PostToolUse `impact_pending` 누적이 그 경계. 올바른 다음 = stage-entry/sync-next 시 pending set **1회 batch drain → sync-loop → reset**.
5. **REJECT된 per-write eager resync(C5a)가 모든 선례가 경고하는 anti-pattern과 정확히 일치** — Bazel/Salsa/webpack 전부 그래서 lazy/debounce. **C5a 거부 = 모든 선례가 옳다고 재확인**.

**caveat (전이 안 되는 부분)**:
- Salsa/Skyframe = persistent in-memory 그래프 서버(연산 간 생존). 우리 PostToolUse는 **stateless** — durability vector를 메모리에 못 듦. → (a) sidecar 프로세스 또는 (b) disk 영속(`.ai-context/` state) + atomic read. 본 batch는 **durability stratification 비채택**(state 누적 = 충분, 미래 최적화).
- Salsa laziness = 잘 정의된 query 진입점 필요. C1(stage-entry 이벤트 없음) → laziness가 "사용자가 명시 sync-next/next 호출 시 drain"으로 약화. 수용 가능(living-sync §7 타깃) but true demand-driven보다 약함.
- DD linear-operator(f(A+B)=f(A)+f(B))는 우리 LLM 내용 재생성에 **비전이**(stateful·비결정적) — delta 전파는 결정론 STALE-marking 단계에만 전이(이미 sync-loop forward-only로 구현됨).
- Git hook dirty-file = commit 경계 가정. 우리는 PostToolUse(tool-call별). → in-session `impact_pending` 누적에 의존, `git diff --cached` 직접 비적용.
- Skyframe "rebuild from scratch"가 우리 C2(forward-only) 일치 — 단 우리 재생성=LLM(비싸고 latency↑) → **early-cutoff(내용 무변경 시 전파 중단)가 Skyframe보다 우리에게 더 중요**.

## 3. 적대 검증 결과 (5축 / 2 결함 검출)

| 축 | 판정 | severity | 요지 |
| --- | --- | --- | --- |
| 무거움 회피 (Gap A) | **FAIL** | major | "navigate verbatim 재사용" ↔ "1-hop" 모순. `navigate --origin`=`analyzeImpact` 전체 transitive closure(MUST 무한감쇠)+`topKImpactRoot` centrality / `--hop` 플래그 없음. ~25줄 cap은 *렌더 텍스트*만 자르고 traversal/payload 선택은 whole-graph. 대형 S2 그래프 = 사실상 whole-graph 주입. → **fix**: 진짜 1-hop 엔지니어링(`additional_hard_hops===0` 필터 + `topKImpactRoot` 제외 + 노드수 cap ≤8 / 예산=노드·엣지 개수). |
| C5a/C5b 재제안 | PASS | minor | 둘 다 회피 검증됨. nit: 기존 `impact_pending`은 state.json이 아니라 scope manifest(`writeManifest` cli.js:1778)에 씀 → prose 정렬. |
| forward-only (C2) | PASS | minor | 위반 없음. `liftCandidates`(lift-anchor.js)는 `includeForward:false` surface-only / forward 재전파는 사람 `--ceiling`(`validateCeiling` ancestry guard "auto-climb ❌")만. → test로 "drain이 `computeSyncLoop` 절대 호출 안 함" 단정. |
| C3/C4 gate-inject | PASS | none | 위반 없음. liftCandidates advisory가 기존 `revisitAdvisory` 선례(별 advisory 변수 / `evaluateGate` findings 미주입 / "gate 차단 아님" 주석) 동형. → hardening: 신규 script가 `gate-eval.js`/`findings-aggregator` import 안 함을 release-readiness check로. |
| C1/C6/C7 | **FAIL** | blocker | C1·C7 OK. **C6 위반**: 설계가 ".ai-context/state.json git-ignored 전제"인데 root `.gitignore`는 `examples/**/`만 무시 → 이 repo dogfooding 시 repo-root state.json = **git-tracked** = C5b fixture 오염 재발. → **fix**: (a) `.ai-context/output/`(C6 승인 경로)에만 쓰기 OR (b) write 전 `git check-ignore` 검증 → tracked면 no-op exit 0 + `.gitignore`를 `**/.ai-context/state.json`로 확장 + 기존 `current_scope` 가드 재사용(미초기화 프로젝트 자동 no-op). |

**자기검증(메인) 재확인**: 위 2 결함 모두 실측으로 confirm — root `.gitignore`에 `.ai-context` 패턴 부재 / `impact-analyzer`에 노드별 `additional_hard_hops`·`first_hop_edge_type` 필드 존재(selection-layer 1-hop cap 가능) / state.json = `<root>/.ai-context/state.json` & canonical = `.ai-context/output/` / 기존 mark는 `current_scope` 활성 시 `writeManifest` 경유(미초기화 no-op).

## 4. 결론 (plan 으로)

업계 선례가 두 설계를 모두 검증: **Gap A = query-submit 시점 + 2단계 funnel(bound) / Gap B = write 시점 detect+mark + demand 시점 lazy drain(coalesce)**. 둘 다 이미 repo의 검증된 패턴(codegraph-nudge / impact_pending / revisitAdvisory / routeEntry)으로 수렴 = **재발명 최소**. 단 적대 검증의 blocker(write-scope) + major(진짜 1-hop)를 반드시 fix해 plan에 굽는다 → [[plan-living-graph-autowire]] §3·§4·§5.

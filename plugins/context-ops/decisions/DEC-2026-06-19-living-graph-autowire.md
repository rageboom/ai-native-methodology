# DEC-2026-06-19-living-graph-autowire

**living dep-graph 자동배선 — Gap A 자동주입(prompt-time 1-hop nudge) + Gap B 자동유지(손수정 코드 lift 자동 감지)** / v0.64.0 MINOR / additive·non-gating.

- **상태**: 채택·시행 (v0.64.0). 승인 = 4원칙 §3 일괄 6 결정(plan §8 권장안 전부). Slice 1·2·3·5 시행 / Slice 4 deferred.
- **유형**: 운영 결정(DEC) — chain gate paradigm 무변(ADR 아님). artifact-graph trust 경계 `DEC-2026-05-28` §4.2 상속.
- **plan/research SSOT**: `.claude/plans/plan-living-graph-autowire.md` + `research-living-graph-autowire.md`.

## 1. 문제 (이미 식별된 carry 2종)

dep-graph(`artifact-graph.json`)는 living-graph 인프라(`navigate` / `lift` / `sync-loop` / cross-scope drift)는 갖췄으나 두 **자동화 고리**가 미배선:

- **Gap A (자동주입)**: 프롬프트 시점에 관련 노드·1-hop 이웃·code_pointer 컨텍스트가 자동 주입되지 않음 → 사용자가 매번 수동 `chain-driver navigate` 해야 그래프 의존성을 봄. (DEC-2026-06-02 §5 carry)
- **Gap B (자동유지)**: 손수정 코드가 anchor 노드의 관측사실과 어긋날 때 lift 후보가 자동 감지되지 않음 → 수동 `chain-driver lift --changed` 만. (living-sync §7 carry — "손수정 코드 lift 자동 트리거")

사용자 방향 = **(나)+(다) 완전한 "살아있는 그래프"**(자동 주입 + 자동 유지). 새 발명 ❌ — 빠진 건 두 trigger/glue 뿐.

## 2. trust 제약 (절대 / 설계 준수)

- **C1**: hook 이벤트 4종만(SessionStart / UserPromptSubmit / PreToolUse / PostToolUse). **stage-entry 이벤트 없음** → Gap A 는 UserPromptSubmit sibling.
- **C2**: **forward-only**. lift = 유일 reverse 예외. **auto-climb ❌**(사람이 의미천장 확정). bidirectional sync 비채택(DEC-2026-06-09).
- **C3/C4**: 결정론 경계 — graph = reference-lens / **결정적 chain gate inject ❌** / grep authoritative. `graph-context-nudge.js` 는 `scripts/`(chain-driver gate 엔진과 분리) / `additionalContext` only. drain glue 는 `gate-eval`/`findings-aggregator` 미import.

## 3. 결정 (6 묶음 / plan §8 권장안)

1. **Gap 이벤트** = `UserPromptSubmit` sibling (synthetic stage-entry ❌).
2. **Gap 예산** = top-5 origin + **진짜 1-hop**(incident edge만 / `additional_hard_hops===0` / centrality 제외) + **노드수 cap ≤8**(텍스트 줄 cap 아님). `navigate` verbatim 재사용 폐기(적대검증 major fix).
3. **Gap 기본상태** = default ON + opt-out(`CONTEXT_OPS_GRAPH_NUDGE=0` / `CONTEXT_OPS_LIFT_AUTODETECT=0`). 매칭 0(한글 산문)=침묵.
4. **Gap B write-scope** = `current_scope` manifest `sync_state`(impact_pending 동형 / `state.json` git-track 가정 ❌ / 미초기화=cheap skip). 적대검증 blocker fix(state.json git-ignored 가정 폐기).
5. **Slice 4**(UserPromptSubmit drain 자동 surface) = **deferred**("step2 입증 후" / stage-entry 이벤트 없음 + 무거움).
6. **§8.1** = 둘 단일 도메인 추론 → **non-gating advisory/read class only 출하**. gate 격상은 별도 ≥2 도메인 증거 후(C8).

## 4. 시행 (Slice 1·2·3·5)

### Gap A 자동주입 (`scripts/graph-context-nudge.js` 신설)
- hooks.json UserPromptSubmit sibling. prompt 식별자(node id / title / code_pointer 심볼·파일) → `matchPromptToNodes`(`_shared/prompt-node-match.js` / `includeTitle` / topN 5) 결정론 매칭 → `oneHopNeighbors`(incident edge만 / transitive·centrality ❌ / cap 8) + code_pointers → `additionalContext` 주입.
- **무거움 회피**: `navigate`(analyzeImpact 전체 closure + `topKImpactRoot` centrality) 재사용 ❌ — 순수 1-hop helper. once-per-(session,prompt) 마커(`codegraph-nudge.js` 규약 동형 / always exit 0 / stderr-only logs). 매칭 0=침묵 / NEVER blocks / 그래프 부재 no-op.

### Gap B 자동유지
- `work-unit-manifest.schema.json` `sync_state.lift_candidate_pending[]`(additive optional / default []).
- `hooks-bridge.detectSourceFileWrite`(`.ai-context` 밖 source / `detectGraphArtifactWrite` 와 disjoint) + `markLiftCandidatePending`(dedupe + cap 50 / 순수) + `_shared/source-ext.js`(`SOURCE_EXTS`/`isSourcePath`).
- PostToolUse(`cli.js` hooks-bridge): 손수정 코드 write → current_scope manifest silent mark(**detect+mark only** / impact·lift 실행 ❌ = per-write eager resync **Senior REJECT C5a 회피**).
- `lift-surface.js`(`buildLiftAdvisory`/`renderLiftAdvisory` / 순수 — I/O·mutation·forward 0 / `computeSyncLoop` 미import = 구조적 보장).
- `chain-driver next` + `sync-next`: demand 시 drain → `liftCandidates`(forward-only / surface-only) → 의미천장 후보 advisory(stderr + `--json` `lift`). drain 후 clear(`--dry-run` 보존 / graph 부재 degraded 정직). 사람이 `lift --ceiling` 확정.

### 부수 fix
- `cli.js` hooks-bridge `impact_pending` mark 경로 `writeManifest` arity 정정(3→4 args).

### docs
- `guides/first-prompt-cookbook.md` §2.1.1 — discovery grounding 레버 6종(Gap A 자동주입과 짝).

## 5. 적대 검증 2 결함 반영

| 결함 | 반영 |
| --- | --- |
| 🟠 major (Gap A 무거움) | 진짜 1-hop helper(`oneHopNeighbors` / incident edge만) + 노드수 cap ≤8. "navigate verbatim" 폐기. |
| 🔴 blocker (Gap B write-scope) | state.json git-ignored 가정 폐기 → `current_scope` 가드 `writeManifest`(impact_pending 동형). |

## 6. 검증 (no-sim 실 test)

- chain-driver **632/632**(신규 lift-surface + hooks-bridge / 회귀 0) · graph-context-nudge **7/7** · test:release **27/27**(A1 workspace `pnpm -r run test` 42/42 포함).
- **§8.1 면제**: 스키마 optional·gate matrix·release check 무변 / detectGraphArtifactWrite·gate-eval 무변 / additive·non-gating advisory·read class only. gate 격상은 별도 ≥2 도메인 증거 후.

## 7. carry / deferred

- **Slice 4**: Gap B 를 UserPromptSubmit drain 으로도 자동 surface(`drainLiftCandidates` 재사용) — context-federation Phase 3b 와 묶음.
- `source-ext.js` ↔ `codegraph-nudge.js` SOURCE_EXTS 중복 통합(divergence 시 본 모듈 canonical).
- gate 격상(non-advisory) = ≥2 도메인 dogfood 증거 후.

Relates: `DEC-2026-06-02-context-federation`(§5 Gap A carry 모) + living-sync(§7 Gap B carry 모) + `DEC-2026-05-28-codegraph-probe-결과` §4.2(reference-lens trust) + `DEC-2026-06-09-dep-graph-dependency-axis-gaps` + `DEC-2026-06-18-revisit-impact-autodetect`(sibling 자동감지 패러다임) + feedback_chain_driver_deterministic_axis + feedback_diagnose_before_design_check_existing.

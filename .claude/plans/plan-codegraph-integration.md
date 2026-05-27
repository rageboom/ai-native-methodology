# Plan — colbymchenry/codegraph 통합 design

> 4원칙 §1 (깊은 숙지 → plan.md). 본 plan = `.claude/plans/plan-codegraph-integration.md`.
> 작성일: 2026-05-26 (session 48차 / v10.1.1 종결 직후 신규 axis).
> trigger: 사용자 결단 "plan-codegraph-integration.md 작성해줘" (본 conversation 안 codegraph 인지 → α/β/γ 옵션 design 제시 → 본 plan 작성 위임).
> 관련: `docs/dependency-graph.md` (본 방법론 artifact-graph SSOT) / `schemas/artifact-graph-{node,edge}.schema.json` / `schemas/code-pointer.schema.json` / `tools/{traceability-matrix-builder,graph-integrity-validator,code-pointer-validator,chain-driver}` / `skills/dep-graph-navigator` / DEC-2026-05-23-dep-graph-ssot-consolidation / DEC-2026-05-23-dep-graph-p1-p4 / R19 environment-dependent scope-out paradigm.
> 본 plan 단계 = **4원칙 §1 (plan)** 만. §2 (research / 3-agent 토론) + §3 (사용자 승인) + §4 (시행) ❌.

---

## 1. 진단 — 두 그래프 layer 분리 + bridge 1점

### 1.1 본 방법론 artifact-graph 자산 (현행 v10.1.1)

| 차원 | 값 |
|---|---|
| 노드 카탈로그 | 24 Tier-1 (chain 5 + analysis 15 + aspect 4) — `graph-synthesizer.js:67~82` SSOT |
| 엣지 | 6종 = hard 4 (`derived_from` / `tests` / `implements` / `depends_on`) + soft 2 (`cross_reference` / `informs`) |
| 노드 state | 4종 (`active` / `drift` / `propose` / `deprecated`) — 전이표 `graph-synthesizer.js:24~40` |
| 영향 등급 | MUST / SHOULD / FYI / ignore — `docs/dependency-graph.md` §5 |
| 검증 gate | release-readiness #15 (graph-integrity) + #16 (code-pointer) |
| 사용자 채널 | `chain-driver navigate` / `/dep-graph-navigator <node-id>` / SessionStart 자동 주입 |

### 1.2 codegraph 자산 (WebFetch 2026-05-26 기준 / 추측 ❌)

| 차원 | 값 |
|---|---|
| 노드 | source code symbol (function / class / method / interface / trait / property / type-alias / enum / record / module / route) |
| 엣지 | `calls` / `imports` / `extends` / `implements` / `references` (+ `provenance: 'heuristic'` cross-language bridge) |
| 저장소 | `.codegraph/codegraph.db` (SQLite FTS5 + WAL) |
| MCP tool | 10종 (`codegraph_search` / `_context` / `_trace` / `_callers` / `_callees` / `_impact` / `_node` / `_explore` / `_files` / `_status`) |
| 지원 언어 | 20+ via tree-sitter (TS / JS / Py / Go / Rust / Java / C# / Swift / Kotlin / Scala / Dart / Vue / Svelte 등) |
| CLI | `codegraph {init,index,sync,status}` (FS event 2s debounce) |
| 실측 효과 (median 7 codebase) | **59% fewer tokens / 49% faster / 70% fewer tool calls** |
| 핵심 instruction | *"trust codegraph results, don't re-verify with grep"* |

### 1.3 두 그래프 = 별도 layer (중복 회피)

| axis | artifact-graph | codegraph |
|---|---|---|
| 단위 | methodology 산출물 (UC/BHV/AC/TC/IMPL + analysis + aspect) | source code symbol |
| 변경 cadence | chain 합성 시 결정적 (사람 결단 trigger) | FS event 2s debounce (자동) |
| 영향 분석 | 산출물 cascade (정책 + 가중치) | 소스 call-tree (결정적) |

### 1.4 bridge point = 단 1곳

`IMPL` 노드의 `implements` 엣지 → Tier-2 leaf (`code_pointers[].path`). 본 path 안 **symbol** 이 codegraph 노드와 N:M 연결 가능.

★ 현재 `code-pointer-validator` = path 존재 검증 만 (symbol 단위 ❌) → α 옵션 격상 후보.

---

## 2. 옵션 분석 (3원칙 결단 후보)

### Cluster A — 통합 phase 진입 순서

| 옵션 | 내용 | trade-off |
|---|---|---|
| A1 | α (code_pointer symbol 격상) 만 시행 | 가장 작음 / breaking 0 / 효과 = code_pointer 정확도 ↑ 만 (federation ❌) |
| A2 | α + β (chain-driver federation) 묶음 | "BHV 바꾸면 IMPL + 실 소스 call-tree 까지" 본격 / 사용자 가치 1차 입증 |
| ~~A3~~ | ~~α + β + γ (MCP 대칭) 일괄~~ | ★ ❌ γ = Type 2 외부 사용자 ≥ 1 corroboration 의존 (현재 부재 / 자기-도구 simulation 회피 paradigm 위배 risk) |
| **★ A4 (권고)** | **α (Phase 1) → β (Phase 2 / 별 release) → γ (Phase 3 / Type 2 trigger 후 carry)** 단계 | 매 phase 독립 release / §8.1 ≥2 PoC corroboration 매 phase 분리 입증 / breaking 0 / Type 2 자연 trigger 의존 paradigm 정합 |

### Cluster B — symbol_id 표기 규약 (Phase 1 enabler)

| 옵션 | 표기 | 비고 |
|---|---|---|
| B1 | `<kind>:<name>@<path>:<line>` (예: `fn:registerUser@src/user.service.ts:42`) | 사람 가독 ↑ / codegraph 내부 id 와 차이 있을 수 있음 |
| B2 | codegraph 내부 id 그대로 (정확한 schema 미확정 / codegraph repo 안 별도 research 필요) | round-trip 안전 / 사람 가독 ↓ |
| B3 | `path:line` + `symbol_name` 분리 필드 | 본 방법론 schema 분리 / codegraph id 무관 |
| **★ B 결단 = research carry** | Phase 1 진입 전 codegraph repo source code 실 검증 (symbol id stability policy) → 결단 | 추측 ❌ / Senior 사실 검증 보강 paradigm (LL-fsim-11) 정합 |

### Cluster C — `code-pointer-validator` 3 mode 설계 (Phase 1 핵심)

| mode | 검증 항목 | codegraph 의존 | release-readiness 결합 |
|---|---|---|---|
| `--strict-path` (현행 기본) | path 파일 존재 | ❌ | #16 유지 (환경 무관) |
| `--symbol-check` (신규 opt-in) | `codegraph_node(symbol_id)` 존재 확인 | ✅ (가용 시) / 부재 → skip | 비차단 |
| `--symbol-strict` (신규 opt-in) | symbol_id 모든 IMPL 의무 | ✅ (필수) | opt-in PoC 만 |

★ codegraph 부재 환경 → `--strict-path` graceful degradation 의무 (no-simulation 정합 = mock ❌ / R19 environment-dependent paradigm 정합).

### Cluster D — `chain-driver navigate --federate-codegraph` 알고리즘 (Phase 2)

| 단계 | 동작 | AI 추론 |
|---|---|---|
| 1 | 현행 chain-driver 영향 트리 계산 (MUST/SHOULD/FYI) | 0% |
| 2 | 영향 집합 안 IMPL 노드 추출 | 0% |
| 3 | 각 IMPL.code_pointers[].symbol_id 수집 | 0% |
| 4 | MCP 호출 `codegraph_impact(symbol_id, depth=1~3)` (codegraph 가용 시) | 0% |
| 5 | 결과 inline = "code_impact" 별도 섹션 (FYI 차원 / cascade ❌) | 0% |
| 6 | centrality / propagation-policy 가중치 영향 받지 않음 | 0% |

★ **핵심 invariant**: codegraph 결과 = **참고 차원** 만 / 방법론 cascade 정책 (propagation-policy.json) 변경 ❌ / 가중치 cross-feed ❌ (`docs/dependency-graph.md` §7 결정 8 정합).

### Cluster E — schema 변경 (Phase 1 additive)

| 항목 | 변경 | breaking |
|---|---|---|
| `schemas/code-pointer.schema.json` `anchor_type` enum | `strict_path` / `line_range` 외 `symbol` 추가 | 0 (additive enum) |
| `schemas/code-pointer.schema.json` properties | `symbol_id` (optional string) + `symbol_kind` (optional enum: function/class/method/interface/trait/property/type_alias/enum/record/module/route) 추가 | 0 (optional) |
| `schemas/impl-spec.schema.json` `modules[].source_files[]` | `symbol_anchors[]` optional 필드 추가 | 0 |
| `additionalProperties:false` strict | 유지 | — |

★ MAJOR vs MINOR 결단: additive only → **MINOR 후보** (v10.2.0 후보).

### Cluster F — 신규 release-readiness criterion (Phase 2 검증 enforcement)

| criterion | 내용 | 차단 자격 |
|---|---|---|
| ~~F1~~ | ~~`#17 codegraph-sync` 의무 (artifact-graph synthesized_at vs codegraph index updated_at cap)~~ | ★ ❌ codegraph 환경 의존 + 사용자 부재 risk → R19 paradigm 위배 |
| **★ F2 (권고)** | **`#17 codegraph-bridge-optional` warn-only** — codegraph 가용 시 sync 검증 / 부재 시 skip + log (release 비차단) | R19 environment-dependent scope-out paradigm 정합 / no-simulation 의무 |
| F3 | `#17` neutral / α + β PoC 별 별도 validator 만 | 가장 작음 / paradigm 일관 |

### Cluster G — ADR 신설 vs ADR-CHAIN-* 흡수

| 옵션 | 내용 |
|---|---|
| G1 | `ADR-CHAIN-013 codegraph-bridge-integration` 신설 (역사 보존 / 독립 결단 trail) |
| G2 | 기존 ADR-CHAIN-001 (이중 렌더링) / ADR-CHAIN-005 (chain-driver) 확장 |
| **★ G1 (권고)** | **별 ADR 신설** — codegraph = 외부 OSS bridge / chain-harness 본체와 axis 분리 / DEC-2026-05-23-dep-graph-ssot-consolidation 와 1:1 trail 정합 |

### Cluster H — PoC corroboration ≥ 2 (§8.1 strict 의무)

| PoC | stack | 검증 차원 |
|---|---|---|
| H1 | `poc-02-realworld-springboot3` (Java + Spring Boot 3) | Java tree-sitter / Spring stereotype symbol |
| H2 | `poc-03-realworld-nestjs` (TS + NestJS) | TypeScript tree-sitter / NestJS decorator symbol |
| H3 | `poc-04-mini-realworld-react` (TS + React) | TSX tree-sitter / React component symbol |
| **★ H4 (권고)** | **H1 + H2 + H3 3 stack isomorphic** | 단일 PoC 과적합 회피 §8.1 strict / cross-stack symbol 추출 입증 / Java / TS / TSX 모두 |

---

## 3. ★ 채택안 (Cluster A~H 종합 / 본 plan default)

| Cluster | 채택 | 비고 |
|---|---|---|
| A — phase 진입 순서 | **A4**: α (Phase 1 / v10.2.0 후보) → β (Phase 2 / v10.3.0 후보) → γ (Phase 3 / Type 2 trigger 후 carry) | 매 phase 별 release / §8.1 분리 입증 |
| B — symbol_id 표기 | **research carry** — Phase 1 진입 전 codegraph repo 실 검증 의무 | Senior 사실 검증 보강 paradigm (LL-fsim-11) 정합 |
| C — validator mode | **C 3 mode** (strict-path 기본 / symbol-check opt-in / symbol-strict opt-in) | graceful degradation 의무 |
| D — federation 알고리즘 | **D 6 단계** / 가중치 cross-feed ❌ / 결정 8 정합 | AI 추론 0% |
| E — schema 변경 | **E additive only** (anchor_type enum + symbol_id + symbol_kind + symbol_anchors[]) | breaking 0 / MINOR 후보 |
| F — release-readiness | **F2** `#17 codegraph-bridge-optional` warn-only | R19 paradigm 정합 |
| G — ADR | **G1** ADR-CHAIN-013 신설 | 역사 보존 / axis 분리 |
| H — PoC corroboration | **H4** poc-02 + poc-03 + poc-04-mini 3 stack isomorphic | §8.1 strict 의무 |

---

## 4. 시행 시퀀스 (사용자 승인 후 / 단계 ladder)

### 4.1 4원칙 §2 (research) — 필수 선행

1. `research-codegraph-integration.md` 작성 (3 sub-agent 병렬):
   - **B sub-agent (industry-case)**: Sourcegraph SCIP / Glean (Meta) / FalkorDB code-graph / Continue codebase index / Aider repo-map 사례 cross-check (정확한 schema bridge 패턴 / token 절감 metric 분류)
   - **C sub-agent (official-docs)**: codegraph repo `colbymchenry/codegraph` 직접 fetch — MCP schema / symbol id stability policy / SQLite table 정확 명세 / tree-sitter 의존 언어별 안정성
   - **D sub-agent (senior)**: 본 design α/β/γ 3 옵션 + Cluster A~H 결단 senior 시점 critique (REVISE / GO @ confidence)

2. research 결과 흡수 → 본 plan REVISE-1/2/... 갱신 (§3 채택안 진화)

### 4.2 4원칙 §3 (사용자 승인) — 묶음 결단 (5~6 핵심)

1. Phase 진입 순서 (A4 채택 vs 변경?)
2. symbol_id 표기 규약 (research 결과 흡수 후 B1/B2/B3 결단)
3. release-readiness criterion 신설 여부 (F2 vs F3)
4. ADR 신설 차수 (ADR-CHAIN-013 vs 다른 번호)
5. PoC corroboration 선택 (H4 3 stack 채택 vs 다른 조합)
6. carry queue 위치 (γ Phase 3 = 어디 carry 등록 / Type 2 trigger 정의)

### 4.3 4원칙 §4 (시행) — Phase 1 minimal sequence

1. **schema additive** — `code-pointer.schema.json` + `impl-spec.schema.json` (Cluster E)
2. **validator 확장** — `code-pointer-validator` 3 mode (Cluster C)
3. **graph-synthesizer 확장** — `code_pointers[].symbol_id` 평탄화 처리
4. **PoC ≥ 2 시행** — H4 3 stack 중 ≥ 2 (poc-03 + poc-04-mini 우선 권고 / TS stack 공유 + tree-sitter 안정성 ↑)
5. **release-readiness #17 신설** (F2 warn-only)
6. **ADR-CHAIN-013 신설** (G1)
7. **CHANGELOG MINOR** entry — v10.2.0 후보 / additive / breaking 0

### 4.4 STOP-3 gate (release 전 의무)

- workspace test all green (현재 baseline 갱신 후)
- release-readiness ≥ 19/20 ready (#17 신설 시 → 21 total / #17 = warn-only 자체는 차단 ❌)
- version 3-way sync (CLAUDE.md + plugin.json + CHANGELOG)
- skill-citation 0 stale
- §8.1 corroboration ≥ 2 (H4 PoC 실측)
- no-simulation enforce (codegraph 부재 환경 → graceful skip 의무 / mock ❌)

---

## 5. Risk Register

| # | risk | severity | 대응 |
|---|---|---|---|
| R1 | codegraph DB ↔ artifact-graph.json drift (다른 cadence) | medium | F2 `#17 codegraph-bridge-optional` warn-only criterion / Phase 2 시행 |
| R2 | codegraph 환경 의존 (Windows MSYS2 등 사용자 환경 부재) | medium | α 모든 단계 graceful degradation 의무 / `--strict-path` fallback / R19 paradigm 정합 |
| R3 | symbol_id 표기 규약 부재 (codegraph 내부 id 안정성 미확정) | medium | research carry / Phase 1 진입 전 codegraph repo 실 검증 의무 (Senior 사실 검증 보강 paradigm LL-fsim-11) |
| R4 | 자기-도구 simulation 회피 위반 risk | **high** | codegraph 미설치 환경에서 "if codegraph were here..." 시뮬 코드 ❌ / §3-A no-simulation enforcement 정합 / 진짜 codegraph 실행 의무 / mock library ❌ |
| R5 | §8.1 단일 PoC 과적합 회피 | **high** | H4 PoC ≥ 2 stack isomorphic 의무 / TypeScript + Java 최소 |
| R6 | β federation 시 가중치 cross-feed 오염 | medium | docs/dep-graph §7 결정 8 정합 / centrality / propagation-policy 가중치 cross-feed ❌ 명문 enforce / unit test 필수 |
| R7 | self-referential corrective drift (paradigm 본격 drift signal — feedback memory 정합) | medium | 본 design = "본격 prod 가치 진전" 자격 검증 의무 / "본 release 의 본격 prod 가치 진전 = 무엇인가" 자기 질문 통과 의무 / Type 2 외부 사용자 자연 trigger 우선 paradigm 정합 |
| R8 | codegraph project 자체 수명 / maintenance risk (OSS 외부 의존) | low | bridge = optional / 본 방법론 본체 동작 codegraph 부재 시 100% 보존 / γ Phase 3 = Type 2 trigger 후 carry |
| R9 | cooling-off paradigm 영구 폐기 (feedback memory 정합) → ★ session 안 4 release cap LL-v930-02 활성 | low | 본 design 시행 시 release 차수 cap 인지 의무 / α / β 분리 release → session 분리 권고 |
| R10 | DEC trail 누락 risk | low | Cluster G G1 채택 (ADR-CHAIN-013 신설) + DEC-2026-05-26-codegraph-integration-design 신설 의무 |

---

## 6. Lessons Learned (시행 후 채움)

(시행 전 / 비어있음)

---

## 7. References

- `docs/dependency-graph.md` — 본 방법론 artifact-graph SSOT (v8.13.1 / DEC-2026-05-23-dep-graph-ssot-consolidation)
- `schemas/artifact-graph-node.schema.json` / `artifact-graph-edge.schema.json` / `code-pointer.schema.json`
- `tools/traceability-matrix-builder/src/graph-synthesizer.js` — 24 Tier-1 카탈로그 SSOT (line 67~82)
- `tools/{graph-integrity-validator,code-pointer-validator,chain-driver}` — 자산 4종
- `skills/dep-graph-navigator/SKILL.md` — 사용자 채널 SSOT
- codegraph 외부 자산:
  - `github.com/colbymchenry/codegraph` — repo (WebFetch 2026-05-26 / GitHub #2 day one / v0.9.4 2026-05-24)
  - codegraph `CLAUDE.md` — Claude Code 통합 instruction
- 결정 trail:
  - DEC-2026-05-23-dep-graph-ssot-consolidation
  - DEC-2026-05-23-dep-graph-p1-p4
- paradigm:
  - R19 environment-dependent tools scope-out (`feedback_environment_dependent_tools_scope_out.md`)
  - §8.1 단일 PoC 과적합 회피 strict (`feedback_quality_priority.md`)
  - cooling-off paradigm 영구 폐기 (`feedback_decision_cadence_24h_cooling_off.md`)
  - self-referential corrective drift (`feedback_self_referential_corrective_drift.md`)
  - Senior 사실 검증 보강 (LL-fsim-11)
  - no-simulation enforce (`feedback_no_simulation_realized.md`)
- 신설 예정:
  - ADR-CHAIN-013 codegraph-bridge-integration (Cluster G G1)
  - DEC-2026-05-26-codegraph-integration-design

---

## 8. 본 plan 다음 단계

★ **현재 단계 = 4원칙 §1 만 완료**. 다음 = 사용자 결단 채널:

- **옵션 X**: 4원칙 §2 진입 (research-codegraph-integration.md 작성 / 3 sub-agent 병렬 / 본 conversation 안 시행)
- **옵션 Y**: 본 plan 만 작성 + 다음 session 진입 시 §2 진입 (cooling-off 자격 아님 / 단순 session boundary)
- **옵션 Z**: 본 design scope-out / carry queue 등록만 / 본격 prod 가치 진전 자격 검토 후 결단 (R7 self-referential drift risk 회피)

---

## REVISE-1 (2026-05-27 / session 49차 / §2 research 흡수)

### R1.1 사용자 결단 = 분기 1 (α 단독 v10.2.0 PATCH 권고 채택)

`.claude/plans/research-codegraph-integration.md` §5 4 분기 중 **분기 1** 채택. Senior critique (D agent) + B agent SCIP 권고 통합 흡수. paradigm 정합 = `feedback_senior_stop_signal_absorption.md` "사실 명확도 × 비용" 2축 평가 → 전면 흡수 자격.

### R1.2 §3 채택안 갱신

| Cluster | 원안 | **REVISE-1 결단** | 흡수 근거 |
|---|---|---|---|
| A — phase 진입 순서 | A4 (α/β/γ 3 release) | **α 단독 (v10.2.0 PATCH 수준)** + β/γ scope-out | Senior REVISE @ 55% (α 단독 가치 0~5% / cooling-off ≠ session 무제한) |
| B — symbol_id 표기 | research carry | **SCIP BNF style 채택**: `code_pointer.{symbol_id, path, range}` 3 분리 필드 | B agent 권고 (Sourcegraph open spec / 재발명 ❌) + codegraph repo 안 명세 부재 사실 (raw fetch 확정) |
| C — validator 3 mode | 3 mode (strict-path / symbol-check / symbol-strict) | **schema only / validator mode 신설 ❌** (α 단독 분기에서 federation 없으므로 의미 약함) | Senior REVISE — α 단독에서 `--symbol-check` 의미 약함 |
| D — federation 6 단계 | 채택 | **scope-out** (Type 2 외부 사용자 자연 요구 발생 시 carry) | Senior REVISE @ 40% (가장 critical) — UX wrapper 수준 / trust 모델 clash / surface 작다 |
| E — additive schema | 채택 (anchor_type enum + symbol_id + symbol_kind + symbol_anchors[]) | **채택 유지** + SCIP BNF 정합 갱신 | Senior GO @ 95% / B agent 정합 |
| F — release-readiness #17 | F2 warn-only | **F3 (신설 ❌)** | Senior REVISE — warn-only noise 영구화 → warn 무시 학습 |
| G — ADR-CHAIN-013 | 신설 | **ADR 보류 + DEC 만 신설** | Senior REVISE — paradigm 진전 ❌ (단순 schema 격상) / ADR 자격 약함 |
| H — PoC corroboration | H4 3 stack (poc-02 + poc-03 + poc-04-mini) | **poc-02 + poc-03 2 stack** | Senior REVISE @ 50% — TS 중복 (NestJS + React 양쪽 TS) |

### R1.3 R1~R10 risk 재평가 + R11~R13 신설

| Risk | 원 severity | REVISE-1 severity | 비고 |
|---|---|---|---|
| R1 (cadence drift) | medium | low (β scope-out 으로 무의미) | F3 채택 → criterion 없음 |
| R2 (환경 의존) | medium | medium (α 단독에서도 schema 의무 0 — codegraph 미설치 사용자도 schema 변경 안전) | graceful degradation 자동 |
| R3 (symbol_id stability) | medium | **low** (SCIP BNF 채택 → codegraph 내부 id 무관) | B agent 권고 흡수 |
| R4 (자기-도구 simulation) | high | **low** (α 단독에서 codegraph 실행 의존 ❌ / schema 만) | federation scope-out 효과 |
| R5 (PoC ≥ 2 corroboration) | high | medium (2 stack 축소) | H REVISE 흡수 |
| R6 (가중치 cross-feed) | medium | low (D scope-out 으로 무의미) | — |
| R7 (self-referential drift) | medium | **medium 유지** (α 단독에서 (a) 외부 사용자 요구 = 0건 여전 / (b) SCIP grammar 정합 = codegraph 무관 가치 ✅ / (c) corroboration 2 stack hypothesis 자격) | Senior 측정 criterion 적용 = (a) fail / (b) pass / (c) pass = 2/3 |
| R8 (codegraph OSS 수명) | low | low (α 단독에서 codegraph 의존 ❌ / SCIP open spec 의존) | federation scope-out 효과 |
| R9 (4 release session cap) | low | **low 유지** (현 session 안 release 1 = α 만) | session 분리 권고 폐기 |
| R10 (DEC trail 누락) | low | low (DEC-2026-05-27-codegraph-integration-alpha-only 신설) | — |
| **R11 (trust 모델 clash)** | — | **low** (α 단독에서 codegraph 실행 0 / clash 무의미) | federation scope-out 효과 |
| **R12 (Type 2 사용자 부재)** | — | **medium** (α 만이라도 외부 사용자 요구 0건 사실 보존 / scope-out 효과 일부) | R7 본질 |
| **R13 (research negative 폐기 발동조건)** | — | **종결** — research §2 결과 = α 단독 분기 자격 충분 / 폐기 ❌ + scope 축소만 | §2 research 완료 |

### R1.4 시행 시퀀스 (분기 1 / α 단독)

1. **schema additive (Cluster E + SCIP BNF 정합)**:
   - `schemas/code-pointer.schema.json` — `anchor_type` enum 에 `symbol` 추가 / `symbol_id` (optional, SCIP BNF format string: `<scheme> <package> <descriptors>` 또는 `local <local-id>`) / `symbol_kind` (optional enum)
   - `schemas/impl-spec.schema.json` — `modules[].source_files[].symbol_anchors[]` optional 필드
   - `additionalProperties:false` strict 유지
2. **graph-synthesizer 확장** — `code_pointers[].symbol_id` 평탄화 (있을 시 / optional)
3. **PoC 2 stack 실측** — poc-02 (Java/Spring) + poc-03 (TS/NestJS) IMPL 산출물 `symbol_anchors[]` 채움 (각 1~3 IMPL 노드 / 진짜 SCIP 형식 / 추측 ❌)
4. **DEC 신설** — `decisions/DEC-2026-05-27-codegraph-integration-alpha-only.md` (본 REVISE-1 결단 trail)
5. **CHANGELOG MINOR** — v10.2.0 후보 / additive / breaking 0 (`code_pointer.symbol_id` SCIP BNF)
6. **release-readiness STOP-3** — workspace test green + criterion 20/20 보존 + version 3-way + skill-citation 0 stale + §8.1 ≥ 2 PoC corroboration (poc-02 + poc-03)

### R1.5 carry 등록 (β/γ Type 2 trigger 후 재발동 조건)

| carry | 발동 조건 |
|---|---|
| C-codegraph-β-federation | **외부 사용자 (윤주스 외 사내 동료 또는 OSS 사용자) ≥ 1 자연 요구 발생** + codegraph v1.0+ 안정화 (≥ 6 개월 maturity 관찰) |
| C-codegraph-γ-MCP-대칭 | β 시행 후 ≥ 1 PoC corroboration + Type 2 추가 trigger |
| C-codegraph-tree-sitter-안정성-검증 | tree-sitter version pin 명세 시점 (codegraph repo 갱신 시) |

### R1.6 사용자 승인 묶음 (4원칙 §3)

본 REVISE-1 채택 = 묶음 결단 6 항 자동 흡수 (사용자 분기 1 채택 시점 implicit 승인):

1. ✅ Phase 진입 순서 = α 단독
2. ✅ symbol_id 표기 = SCIP BNF
3. ✅ release-readiness criterion = F3 (신설 ❌)
4. ✅ ADR = 보류 + DEC 만
5. ✅ PoC = poc-02 + poc-03 2 stack
6. ✅ carry queue = §R1.5 3 carry 등록

**남은 사용자 결단** = 시행 시점 (현 session vs 다음 session) 1건.

---

## REVISE-2 (2026-05-27 / session 49차 / §4 시행 직전 PoC 자격 사실 발견 → 전면 scope-out)

### R2.1 시행 직전 사실 발견 (LL-fsim-11 paradigm 본격 재발 v8 / 5회 이상 연속)

REVISE-1 §R1.4 #3 "poc-02 + poc-03 IMPL 산출물 SCIP symbol_anchors 실측" 시행 직전 사실 검증 = **PoC corroboration 자격 fundamental 부재**:

| 사실 | 검증 |
|---|---|
| poc-02 `.aimd/output/` 디렉토리 | **비어있음** (impl-spec.json 부재) |
| poc-03 `.aimd/output/` | test-spec.json 만 / impl-spec.json **부재** |
| 14 PoC 전수 impl-spec.json 보유 | **단 2 PoC** (poc-05 + poc-14) |
| poc-05 (TS pure-node) modules[].code_pointers[] | **0개 (부재)** |
| poc-14 (Python pure-3.14) modules[].code_pointers[] | **0개 (부재)** |
| isomorphic 자격 | TS + Python = 사내 실 stack (Java/Spring + TS/NestJS + React) 무관 |

§8.1 strict ≥ 2 PoC corroboration 의무 통과 자격 = **자산 자체 부재**. corroboration 의무 추가 부담 (code_pointers[] 새로 채우기 의무 / ~3~5시간 PoC 코드 베이스 깊이 read).

### R2.2 사용자 2차 결단 = 전면 scope-out

사실 누적 6건 (REVISE-1 흡수) + 본 사실 발견 2건 = 8건 누적. R7 self-referential corrective drift paradigm 정조준 발동 자격. memory `feedback_senior_stop_signal_absorption.md` "사실 명확도 × 비용" 2축 = 전면 흡수 자격 본격.

사용자 결단 (2026-05-27 / AskUserQuestion "PoC corroboration 자격 부재 사실 발견 — 재결단?") = **전면 scope-out 채택**.

### R2.3 §3 채택안 + REVISE-1 §R1.1~R1.6 전면 retract

| Cluster | REVISE-1 결단 | **REVISE-2 결단** |
|---|---|---|
| A — phase 진입 | α 단독 v10.2.0 PATCH | **scope-out** |
| B — symbol_id | SCIP BNF 채택 | **carry (C-scip-grammar-adoption-light)** — 별 axis / codegraph 무관 / PoC 자격 자산 사전 의무 |
| C — validator mode | schema only | **scope-out** |
| D — federation | scope-out | scope-out (REVISE-1 정합 / 유지) |
| E — additive schema | 채택 + SCIP BNF | **carry (C-scip-grammar-adoption-light)** |
| F — release-readiness | F3 (신설 ❌) | **scope-out** (criterion 신설 ❌ 자격 유지) |
| G — ADR-CHAIN-013 | ADR 보류 + DEC | **DEC-2026-05-27-codegraph-integration-scope-out 단일** (본 결단 trail) |
| H — PoC corroboration | poc-02 + poc-03 | **scope-out** (자격 자산 부재 입증) |

### R2.4 carry queue 3종 (Type 2 trigger 조건)

| carry | 발동 조건 |
|---|---|
| `C-codegraph-bridge-design` | (a) 외부 사용자 (윤주스 외 사내 동료 또는 OSS 사용자) ≥ 1 자연 요구 + (b) codegraph v1.0+ 안정화 (≥ 6 개월 maturity 관찰) + (c) Type 2 corroboration ≥ 2 PoC 자격 자산 (impl-spec.json + code_pointers[] 채워진 PoC ≥ 2) **3 criterion 동시 충족** 시 재발동 |
| `C-scip-grammar-adoption-light` | 별 axis (codegraph 무관) / 본 방법론 표현력 ↑ 자체 가치 / Type 2 trigger 부재여도 시행 가능 / 단 PoC code_pointers[] 채워진 PoC ≥ 2 사전 의무 |
| `C-tree-sitter-stability-verify` | codegraph repo / SCIP indexer / Aider tree-sitter `.scm` query 안 version pin 명세 시점 시행 |

### R2.5 doc 자산 보존

- 본 plan-codegraph-integration.md = `.claude/plans/` 안 보존 (역사 trail / 외부 사용자 자연 요구 발생 시 재발동 base)
- `.claude/plans/research-codegraph-integration.md` = 보존 (B/D sub-agent 결과 + raw fetch + SCIP grammar 사실 = 별 axis 활용 가능 자산)
- `decisions/DEC-2026-05-27-codegraph-integration-scope-out.md` = 신설 (본 결단 trail)
- `decisions/INDEX.md` = 갱신 (DEC 등재)
- `decisions/STATUS.md` = 갱신 (carry queue 3 등록)

### R2.6 release ❌

- 본 결단 = pure doc trail / 실 plugin 자산 변경 0
- CHANGELOG entry ❌ / version 3-way sync ❌ / STOP-3 ❌ / workspace test ❌

### R2.7 본 plan 다음 단계 (R1.6 retract)

R1.6 의 "남은 사용자 결단 = 시행 시점" = retract. **본 plan = scope-out 종결 상태**. 재발동 = §R2.4 carry queue 3 criterion 동시 충족 시.

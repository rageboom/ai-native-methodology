# Artifact Dependency Graph — 운영 가이드

> 신규 리뷰어 onboarding 목표 < 5분. 본 문서로 dep-graph 의 **무엇을·왜·어떻게** 를 파악한다.
> ★ v8.13.1 — **본 문서 = 단일 SSOT** (DEC-2026-05-23-dep-graph-ssot-consolidation 정합 / 외부 work folder SSOT 폐기).

## 1. 한 줄 요약

25개 Tier-1 deliverable (chain 6 + analysis 15 + aspect 4) + plan 조직 노드 3종(Epic/Story/OP) 사이의 의존성을 **결정적 알고리즘**으로 추적·계산·시각화·검증한다. 사람은 도메인·승인 결정에만 개입 (§7 기계적 동작 우선). ★ v11.0.0 — 6-layer chain (discovery→spec→plan→test→implement) + BE/FE axis + contract 강제 양 axis 반영.

## 2. 그래프 모델 (operation.md 결정 1 + ★ v11.0.0 paradigm)

- **노드**: 25 Tier-1 deliverable + plan 조직 3.
  - chain instance (6 layer): `UC-* / BHV-* / AC-* / TASK-* / TC-* / IMPL-*` (★ v11.0.0 +TASK = plan stage)
    - ★ BE/FE axis = TASK 노드의 `layer` 속성 (be/fe/db/e2e/infra / 그래프 폭증 회피 — 별도 노드 아님)
  - plan 조직 (artifact_kind=`plan`): `EPIC`(FE 화면 / screen_id) / `STORY-*`(cross-cut anchor / BHV 기준) / `OP-*`(Story sibling 운영 task)
  - analysis kind: `analysis-domain`, `analysis-business-rules`, … (15종)
  - aspect kind: `aspect-a11y`, `aspect-i18n`, `aspect-static-security`, `aspect-legacy-spectrum`
  - Tier-2 (schema/hook/validator/skill/source file/contract leaf) = leaf, 노드 추가 안 함 (그래프 폭증 회피)
- **엣지** (8종 = hard 5 + soft 3 / ★ v11.0.0 +2):
  | edge_type | confidence | 의미 |
  |---|---|---|
  | `derived_from` | hard | chain forward (UC→BHV→AC→TASK→TC) |
  | `tests` | hard | TC→IMPL |
  | `implements` | hard | IMPL→코드 (Tier-2 leaf target) |
  | `depends_on` | hard | schema/validator 의존 |
  | `conforms_to` | hard | ★ artifact→contract leaf (TASK/TC → openapi/component/visual) |
  | `cross_reference` | soft | analysis ↔ chain |
  | `informs` | soft | aspect → chain |
  | `groups` | soft | ★ 조직 포함 (Epic→Story / Story→TASK / OP→TASK) |
- **노드 상태** (4-state): `active` / `drift` / `propose` / `deprecated`
- **TASK 삽입 규약**: task-plan 존재 시 chain forward 는 `AC→TASK→TC` (직접 `AC→TC` shortcut 억제). task-plan 부재 시 `AC→TC` fallback 보존 (backward compat).

## 3. 도구 맵 (Phase 별)

| Phase | 도구 | 역할 | 알고리즘 |
|---|---|---|---|
| P1 | `traceability-matrix-builder/src/graph-synthesizer.js` | 24 artifact → `artifact-graph.json` 합성 | state machine |
| P1 | `graph-integrity-validator/` | cycle/orphan/unknown_edge 검증 (release-readiness #15) | DFS cycle |
| P1 | `chain-driver/src/impact-analyzer.js` | 변경 영향 등급 (MUST/SHOULD/FYI) | confidence-aware BFS |
| P2 | `code-pointer-validator/` | 24 artifact code_pointers/N-A coverage (release-readiness #16) | — |
| P3 | `chain-driver/src/policy-evaluator.js` | 변경 종류 × 단계 → auto/propose/manual | — |
| P3 | `chain-driver/src/propagation-orderer.js` | 자동 cascade 순서 | topological sort (Kahn) |
| P4 | `chain-driver/src/centrality.js` | top-K impact root | weighted out-degree / PageRank |
| P4 | `traceability-matrix-builder/src/renderers/diff-view.js` | 그래프 git diff 재투영 | set diff |
| P4 | `skills/dep-graph-navigator/SKILL.md` | `/dep-graph-navigator <node-id>` | (위 통합) |

## 4. 일상 사용법

### 4-1. 그래프 합성 (PostToolUse 또는 수동)

```bash
node tools/traceability-matrix-builder/src/cli.js \
  --discovery .aimd/output/discovery-spec.json \
  --behavior .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --task-plan .aimd/output/task-plan.json \
  --test-spec .aimd/output/test-spec.json \
  --impl-spec .aimd/output/impl-spec.json \
  --analysis-dir .aimd/output/ --aspect-dir .aimd/output/ \
  --out-dir .aimd/output/ --graph
```

> ★ v11.0.0 — `--discovery` (구 `--planning` alias 보존) + `--task-plan` (plan stage TASK/Epic/Story/OP) + `--operational-task` (OP 보강 optional).

→ `.aimd/output/artifact-graph.json` 산출 (matrix.{json,md,mermaid} 와 함께).

### 4-2. 변경 영향 분석 (변경 전)

```bash
# 영향 트리 + code_pointers + top-3 impact root
node tools/chain-driver/src/cli.js navigate \
  --graph .aimd/output/artifact-graph.json --origin BHV-USER-001

# ★ 의도③ — 스펙 본문까지 함께 (UC/BHV/AC 의 title·description·precondition·gherkin lazy-read)
node tools/chain-driver/src/cli.js navigate \
  --graph .aimd/output/artifact-graph.json --origin BHV-USER-001 --with-spec

# ★ 의도③ (a) NL 라우팅 — 정확 id 몰라도 자연어로 (id/title/symbol/file 결정론 매칭)
node tools/chain-driver/src/cli.js navigate \
  --graph .aimd/output/artifact-graph.json --prompt "회원가입 BHV 바꾸려는데" [--with-spec]
```

또는 skill: `/dep-graph-navigator BHV-USER-001`

> ★ `--prompt "<자연어>"` (v12.4.0): 정확 node-id 몰라도 자연어에서 노드를 **결정론 substring 매칭**(id+5 / id-part+1 / title+2 / symbol+3 / file+2)해 해소. confident(top.score≥3 AND 동점 아님)면 top-1 자동 탐색, **tie·약매칭이면 후보 list 만**(오답 권위화 차단 / `--origin <id>` 로 명시). 결정론 only — 의미·동의어·임베딩 ❌(예 "로그인"↔"signin" / 임베딩 의미검색=carry). `--prompt`+`--origin`=origin 우선 / `--prompt`+`--stage`=rollup 우선.
>
> ★ `--with-spec` (default off / v12.3.0): 노드의 `source_path` 파일에서 본문(UC=`use_cases[]` / BHV=`behaviors[]` / AC=`criteria[].gherkin`)을 **lazy-read** 해 `spec 본문 (reference-lens / gate 주입 ❌)` 블록으로 표시. **본문은 reference-lens** — 어떤 결정적 gate 에도 inject ❌ (release-readiness check31 강제). 배열은 5개 cap + `… (+N more)`. UC/BHV/AC 외 subkind(TASK/TC/IMPL/analysis) 또는 source 부재·id miss = `(불가 — <reason>)` graceful. ★ placeholder `source_path`(`'(behavior)'` 등 — 합성 시 입력 경로 미전달) 는 결정론적으로 `(불가 — source 부재)` 로 해석되니 부재를 버그로 오인 ❌. rollup(`--stage`/`--scope`) 모드에는 미적용(본문 폭증 회피).

### 4-3. 정책 평가 (변경 종류 지정)

```bash
node tools/chain-driver/src/cli.js impact \
  --graph .aimd/output/artifact-graph.json --origin BHV-USER-001 \
  --change-kind item_add --out-jsonl .aimd/output/propose.jsonl
```

→ 각 영향 노드에 대해 auto/propose/manual 결정 + propose.jsonl 기록.

### 4-4. 무결성 검증 (release 전)

```bash
node tools/graph-integrity-validator/src/cli.js .aimd/output/artifact-graph.json
node tools/code-pointer-validator/src/cli.js .aimd/output/artifact-graph.json --repo-root .
```

또는 통합: `node scripts/release-readiness.js --target vX.Y.Z` (#15 graph-integrity / #16 code-pointer).

## 5. 영향 등급 산정 규칙 (operation.md 결정 4)

**Step 1 — 첫 hop 엣지 종류 → base 등급**:

| 첫 hop | base |
|---|---|
| hard (derived_from / implements / tests / depends_on / conforms_to) | MUST |
| soft cross_reference / groups | SHOULD |
| soft informs | FYI |
| soft 2-hop+ | ignore |

> ★ v11.0.0 예: contract(openapi) 변경 → `conforms_to` 로 연결된 TASK/TC = MUST sync. Story 변경 → `groups` 로 연결된 직속 TASK + Epic = SHOULD (1-hop), 그 너머 TC = FYI (감쇠).

**Step 2 — hard chain 따라가며 감쇠**: MUST→MUST(끝까지) / SHOULD→FYI→ignore / FYI→ignore.

**액션**: MUST=sync 강제 / SHOULD=검토 권고 / FYI=알림만 / ignore=노출 X.

## 6. 자동/수동 전파 정책 (operation.md 결정 5)

`policies/propagation-policy.json` — 변경 종류(typo/item_add/item_remove/semantic_change) × chain 인접 단계(UC→BHV/…/TC→IMPL):

- typo: 대부분 auto (TC→IMPL 만 manual)
- item_add: propose (TC→IMPL manual)
- item_remove / semantic_change: 전부 manual
- **자동 cascade**: `auto_cascade.enabled=false` (dry_run) — 현재는 propose 기록만, 실제 적용은 사용자 confirm.

## 7. 알고리즘 상호작용 주의 (operation.md 결정 8)

- DFS cycle ≠ 0 → topological sort 불가 → 자동 cascade 차단 (release-readiness #15 fail 게이트)
- `propose` 노드 → BFS·topological·centrality 모두 traverse 제외
- centrality 점수 → propagation-policy 가중치에 **피드백 안 함** (분리 차원)

## 8. SessionStart 자동 주입 (P4)

세션 시작 시 `artifact-graph.json` 이 있으면 자동으로 다음을 컨텍스트에 주입:
```
[dep-graph] N nodes / ⚠️ M drift / K propose 대기 / top-3 impact root: ... / 탐색: /dep-graph-navigator <node-id>
```

## 9. 참조

- 본 문서 — 8 결정 + Phase 로드맵 + 시나리오 + 표기 규약 통합 SSOT (★ v8.13.1+ / DEC-2026-05-23-dep-graph-ssot-consolidation)
- `schemas/artifact-graph-node.schema.json` / `artifact-graph-edge.schema.json` / `code-pointer.schema.json`
- `policies/propagation-policy.json` (+ `.schema.json`)
- `tools/{graph-integrity-validator, code-pointer-validator, chain-driver, traceability-matrix-builder}` / `skills/dep-graph-navigator`

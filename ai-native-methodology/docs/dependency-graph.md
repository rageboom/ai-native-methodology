# Artifact Dependency Graph — 운영 가이드

> 신규 리뷰어 onboarding 목표 < 5분. 본 문서로 dep-graph 의 **무엇을·왜·어떻게** 를 파악한다.
> 설계 원본(SSOT): `dep-graph/operation.md` (8 결정), `dep-graph/concept.md` (시나리오), `dep-graph/conventions.md` (표기 규약).

## 1. 한 줄 요약

24개 Tier-1 artifact (chain 5 + analysis 15 + aspect 4) 사이의 의존성을 **결정적 알고리즘**으로 추적·계산·시각화·검증한다. 사람은 도메인·승인 결정에만 개입 (conventions.md §9 기계적 동작 우선).

## 2. 그래프 모델 (operation.md 결정 1)

- **노드**: 24 Tier-1 artifact.
  - chain instance: `UC-* / BHV-* / AC-* / TC-* / IMPL-*`
  - analysis kind: `analysis-domain`, `analysis-business-rules`, … (15종)
  - aspect kind: `aspect-a11y`, `aspect-i18n`, `aspect-static-security`, `aspect-legacy-spectrum`
  - Tier-2 (schema/hook/validator/skill/source file) = leaf, 노드 추가 안 함 (그래프 폭증 회피)
- **엣지** (6종 = hard 4 + soft 2):
  | edge_type | confidence | 의미 |
  |---|---|---|
  | `derived_from` | hard | chain forward (UC→BHV→AC→TC) |
  | `tests` | hard | TC→IMPL |
  | `implements` | hard | IMPL→코드 (Tier-2 leaf target) |
  | `depends_on` | hard | schema/validator 의존 |
  | `cross_reference` | soft | analysis ↔ chain |
  | `informs` | soft | aspect → chain |
- **노드 상태** (4-state): `active` / `drift` / `propose` / `deprecated`

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
  --planning .aimd/output/planning-spec.json \
  --behavior .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --test-spec .aimd/output/test-spec.json \
  --impl-spec .aimd/output/impl-spec.json \
  --analysis-dir .aimd/output/ --aspect-dir .aimd/output/ \
  --out-dir .aimd/output/ --graph
```

→ `.aimd/output/artifact-graph.json` 산출 (matrix.{json,md,mermaid} 와 함께).

### 4-2. 변경 영향 분석 (변경 전)

```bash
# 영향 트리 + code_pointers + top-3 impact root
node tools/chain-driver/src/cli.js navigate \
  --graph .aimd/output/artifact-graph.json --origin BHV-USER-001
```

또는 skill: `/dep-graph-navigator BHV-USER-001`

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
| hard | MUST |
| soft cross_reference | SHOULD |
| soft informs | FYI |
| soft 2-hop+ | ignore |

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

- `dep-graph/operation.md` — 8 결정 + 7 알고리즘 + Phase 로드맵 (SSOT)
- `dep-graph/concept.md` — 시나리오 A~E (해소하는 통증)
- `dep-graph/conventions.md` — 표기·검증 규약 (§9 기계적 동작 우선)
- `schemas/artifact-graph-node.schema.json` / `artifact-graph-edge.schema.json` / `code-pointer.schema.json`
- `policies/propagation-policy.json` (+ `.schema.json`)

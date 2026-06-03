# ADR-CHAIN-013 — Analysis Schema Chain-Link 일관성 의무 (3 layer 매핑)

- 상태: 승인됨 (Accepted) — v11.2.0 MINOR release / PoC #15 dogfood 발견 본격 정정
- **결정 시각**: 2026-05-28
- **연관 결정**: DEC-2026-05-28-analysis-chain-link-일관성
- **연관 PoC**: poc-16-efiweb-car-spring41 (dogfood 발견 site)
- **연관 도구**: tools/traceability-matrix-builder/src/graph-synthesizer.js
- **연관 schema**: schemas/meta-confidence.schema.json (related_chain_ids 신설)
- **버전**: v11.2.0 MINOR

## Context

PoC #15 (디렉토리 `examples/poc-16-efiweb-car-spring41/`) 의 12 analysis 산출물을 처음 적재해 artifact-graph 합성을 시도한 결과, **83% (10/12) analysis 노드가 orphan** 으로 발견됨. graph-integrity-validator `passed=false` / release-readiness #15 미통과 예상.

진단 결과 본 결함은 graph-synthesizer 도구의 매핑 부족이 아니라 **methodology 본체 schema 의 chain-link 일관성 결함** 임이 드러남:

- chain → analysis 매핑은 `CHAIN_TO_ANALYSIS_REFS = {BHV.br_refs, AC.related_brs, AC.related_aps}` 2개만 정의 — 13 analysis kinds 중 11 kinds 미매핑
- analysis → chain 매핑은 일부 kind (formal-spec / characterization-spec / api / ui-ux / sql-inventory / domain) 만 자체 ref 필드 보유 — 5 kinds (architecture / db-schema / state-map / type-spec / error-mapping-spec) 는 chain-link 필드 자체 부재

→ 본 방법론의 **artifact-graph 본격 가치** (모든 산출물의 의미적 fully connected graph) 와 정면 모순.

## 결정 (Decision)

**3 layer 매핑 표준** 영구 명문화. 본 결정 = analysis schema 의 chain-link 표현이 다음 3 layer 중 ≥ 1 layer 로 명시되어야 graph-synthesizer 가 cross_reference edge 합성. orphan = 본 결정 위반 = release-readiness #15 미통과.

### Layer 1 — chain-side ref (기존 / 유지)

chain artifact 안 `*_ref` / `related_*` 필드가 analysis kind 를 가리킴. graph-synthesizer 의 `CHAIN_TO_ANALYSIS_REFS` 표 권위.

| chain subkind | 필드 → analysis kind                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------- |
| BHV           | `br_refs` → business-rules                                                                         |
| AC            | `related_brs` → business-rules, `related_aps` → antipatterns                                       |
| AC            | `state_map_ref` → state-map (v11.2.0 신규), `visual_manifest_ref` → visual-manifest (v11.2.0 신규) |

### Layer 2 — analysis-side instance self-ref (v11.2.0 신설)

analysis 산출물 안 자체 ref 필드. graph-synthesizer 의 `ANALYSIS_TO_CHAIN_REFS` 표 권위. 6 kinds 가 본 layer 활용:

| analysis kind           | self-ref path                                                      | target chain       |
| ----------------------- | ------------------------------------------------------------------ | ------------------ |
| formal-spec             | `sequences[].uc_id`                                                | UC                 |
| characterization-spec   | `snapshots[].use_case`                                             | UC                 |
| api (openapi-extension) | `operations[].related_use_case_id`                                 | UC                 |
| ui-ux (ui-spec)         | `pages[].related_use_cases[]` + `components[].related_use_cases[]` | UC                 |
| sql-inventory           | `inventory[].uc_link`                                              | UC (12 컬럼 정합)  |
| domain                  | `bounded_contexts[].aggregates[].related_use_cases[]`              | UC (nested 2-deep) |

### Layer 3 — meta.related_chain_ids fallback (v11.2.0 신설 / universal)

`schemas/meta-confidence.schema.json` 에 신설된 `related_chain_ids[]` optional 필드. 15 analysis + 4 aspect 모두 `$ref` 로 공유 (DRY). 5 kinds (architecture / db-schema / state-map / type-spec / error-mapping-spec) 가 Layer 1+2 부재 → 본 layer **의무**.

```json
"related_chain_ids": {
  "type": "array",
  "items": {
    "type": "string",
    "pattern": "^(UC|BHV|AC|TASK|TC|IMPL)-[A-Z0-9_-]+$"
  },
  "uniqueItems": true
}
```

graph-synthesizer 의 신규 loop (line 461~470 동형 / aspect 의 informs 패턴 정합):

```javascript
for (const subkind of ANALYSIS_SUBKINDS) {
	const data = analysis[subkind];
	if (!data) continue;
	for (const target of data.meta?.related_chain_ids ?? []) {
		if (!nodeIds.has(target)) continue;
		edges.push(makeEdge(`analysis-${subkind}`, target, 'cross_reference'));
	}
}
```

### Fallback 우선 순위

같은 산출물에 3 layer 가 모두 정의되어도 emit 의무 = **모두 emit** (중복 edge 허용 / soft confidence). graph-integrity-validator 는 중복 edge 를 unknown_edge 로 reject ❌ — 양 끝 노드 존재 시 emit 정합.

dangling 가드 (3 layer 공통): `nodeIds.has(target)` — 존재하지 않는 chain id 는 emit ❌.

## Consequence

### 즉시 효과

- PoC #15 (poc-16-efiweb-car-spring41) graph-integrity orphan 10 → 0 (본 PoC 의 핵심 D-axis 100% 달성)
- PoC #05 (sample-user-register) 회귀 0 (analysis 2 = BR+AP 만 적재 → 신규 매핑 trigger ❌ / nodes 18 / edges 29 그대로)
- 25 Tier-1 (chain 6 + analysis 15 + aspect 4) 정합 — 모든 analysis kind 가 chain link 표현 가능

### 향후 영향

- 신규 PoC 진행 시 analysis 산출물 작성자 의무:
  - Layer 1 매핑 가능 kind (business-rules / antipatterns / state-map / visual-manifest) = chain-side ref 자동
  - Layer 2 매핑 가능 6 kinds = 자체 ref 필드 (formal-spec.sequences[].uc_id 등) 명시 의무
  - **Layer 3 의무 5 kinds = meta.related_chain_ids[] 명시 의무** (graph-integrity orphan 회피)
- 본 방법론의 artifact-graph 가치 = **모든 산출물 fully connected** 의무화 / orphan 0 = release-readiness #15 의 정상 상태

### 부정 효과

- analysis 산출물 작성자에게 1줄 (Layer 3) 추가 부담. 단 optional → 미명시 시 orphan finding only (blocking ❌ but warn).

### Status

승인 (v11.2.0 release 트리거 / breaking 0 / additive).

## Implementation Sites

- `tools/traceability-matrix-builder/src/graph-synthesizer.js:103-138` (`CHAIN_TO_ANALYSIS_REFS` + `ANALYSIS_TO_CHAIN_REFS`)
- `tools/traceability-matrix-builder/src/graph-synthesizer.js:445-480` (3 emit loop)
- `schemas/meta-confidence.schema.json` (related_chain_ids 신설)
- `tools/traceability-matrix-builder/test/graph-synthesizer.test.js` (v11.2.0 describe block / 9 신규 test)

## 검증

- workspace test: 770 → **779 pass** (+9 신규 / 0 fail)
- PoC #15 (poc-16) graph-integrity passed=true / orphan 10 → 0
- PoC #05 graph-integrity passed=true / 회귀 0
- release-readiness #15 (graph-integrity) + #16 (code-pointer) 모두 PoC #05 기반 → 회귀 0

## 잔여 carry (별도 ADR / 결단)

- chain artifact 안 backward link 정합도 의무 (analysis ↔ chain 양방향)
- antipatterns.schema.json 의 자체 chain-link 신설 (AP → UC/BHV)
- analysis ↔ analysis cross_reference paradigm (formal-spec.decision_tables[].br_id → analysis-business-rules 등)
- 다른 PoC (poc-01~poc-14) 의 graph 일괄 재합성

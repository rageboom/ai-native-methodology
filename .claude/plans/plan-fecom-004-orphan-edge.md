# plan — F-ECOM-004 graph orphan edge (to_analysis_artifacts → cross_reference)

## 문제 (실측)
ecommerce dep-graph graph-integrity FAIL — orphans=5 (analysis-architecture/domain/db-schema/form-validation-spec/error-mapping-spec = edge 0). `graph-integrity-validator:128` orphan = "no incoming or outgoing edges".

## root cause (조사 정정)
1. **Part A 버그**: graph-synthesizer 가 `cross_links.to_analysis_artifacts`(spec-level generic 산출물 path 리스트)에서 cross_reference edge 를 **안 만듦**. Layer 1(br_refs)/2(analysis 자체 ref)/3(meta.related_chain_ids)만 edge화. → 특정 ref 가 없는 analysis 노드(domain/error-mapping/form-validation)는 to_analysis_artifacts 가 유일 통로인데 미합성 → orphan.
2. **dogfood 데이터**: ecommerce discovery/behavior 가 architecture·db-schema 를 to_analysis_artifacts 에 **미참조** → A 만으론 그 2개 orphan 잔존.
3. **B 정정**: graph-integrity-validator 가 이미 orphan=hard-FAIL → "미참조 → 강제 실패"가 이미 존재. 별도 filesystem coverage 검사는 poc-16(orphan 0, db-schema 미참조나 정상) false-positive → ❌.

## 시행 (A + C / B=기존 graph-integrity)
### A. graph-synthesizer Layer 4 (additive)
- `ANALYSIS_BASENAME_TO_KIND` const 신설 (basename→kind 역매핑 / 파일명≠kind: api/db-schema/ui-ux 포함 / ANALYSIS_FILENAMES 정합).
- Layer 3 직후 Layer 4 블록: discovery/behavior/operationalTask 의 `cross_links.to_analysis_artifacts` → basename→kind → `analysisLoaded.has(kind)` guard → `analysis-{kind}` → **layer anchor**(min-id UC/BHV/OP node) cross_reference edge.
- dangling guard (analysisLoaded + nodeIds.has(anchor)) + dedup (기존 cross_reference edge key Set / fan-out 회피 = anchor 1개).
- 결정성: anchor = 정렬 후 첫 id. fan-out 안 함(spec-level coarse / per-item 정밀 edge 는 Layer 1).

### A-test (graph-synthesizer.test.js +N)
1. to_analysis_artifacts → cross_reference edge emit (anchor)
2. dangling guard (미로드 kind → no edge)
3. dedup (Layer1 br_refs 와 동일 (src,anchor) → 중복 없음)
4. basename alias (schema.json→db-schema / .aimd/output/ prefix strip)
5. anchor 부재(빈 layer) → no edge / no crash
6. BASENAME_TO_KIND drift guard (ANALYSIS_SUBKINDS 전부 매핑)

### C. ecommerce dogfood (외부 repo / .aimd 산출물)
- discovery+behavior cross_links.to_analysis_artifacts 를 present analysis 산출물 완전체로 보정(architecture/domain/schema/business-rules/antipatterns/form-validation/error-mapping).
- graph 재합성 → graph-integrity orphan 5→0 검증 (no-simulation 실 CLI).

## 검증 (STOP-3)
- workspace test (traceability-matrix-builder +N) 무회귀
- skill-citation 0 stale / release-readiness (poc-05 graph 무영향 = #13 불변) / version 3-way 11.30.0
- breaking 0 (additive)

## §8.1 (정직)
read/synth-class additive infra. 단일 ecommerce 도메인 = mechanism 입증 (orphan 해소). graph-integrity(기존)가 enforcement. RealWorld(antipatterns 미참조 orphan)도 동형 corroboration 후보(별 dogfood).

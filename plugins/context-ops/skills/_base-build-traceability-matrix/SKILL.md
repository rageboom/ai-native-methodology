---
name: _base-build-traceability-matrix
description: v2.0 cross-gate skill. 4 chain 산출물 (discovery-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec) 합성하여 traceability-matrix.json 생성. UC → BHV → AC → TC → IMPL forward+backward link + coverage_summary + status (green/yellow/red). DO-178C / IEC 62304 bidirectional traceability 차용 (S5 정합 — header derived_from + do_not_edit_manually:true). 매 gate 갱신 의무.
allowed-tools: Read, Write, Edit, Bash
---

# build-traceability-matrix

chain harness 의 **cross-gate matrix builder skill** (forward+backward bidirectional / DO-178C 차용).

## 언제 사용

- 매 gate (#1~#5) 종결 시 의무 갱신.
- chain-revisit-detector 가 변경 감지하면 자동 trigger (sub-plan-5 통합).
- 사용자가 "traceability matrix 보여줘" / "matrix 갱신해줘" 자연어 prompt.

## 산출물

1종 (json 단독):

- `traceability-matrix.json` — single source of truth (json 단독 SSOT / DO-178C / `derived_from` + `do_not_edit_manually: true` header 의무).

## 절차

1. **chain 산출물 5종 path 확인** — 사용자 프로젝트 `.ai-context/base/` 안의 `discovery-spec.json` / `behavior-spec.json` / `acceptance-criteria.json` / `test-spec.json` / `impl-spec.json` 존재 확인. 누락 시 status=red 표기 (사용자에게 명시).

2. **traceability-matrix-builder 도구 호출**:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/traceability-matrix-builder/src/cli.js \
     --discovery  <project>/.ai-context/base/discovery-spec.json \
     --behavior   <project>/.ai-context/base/behavior-spec.json \
     --acceptance <project>/.ai-context/base/acceptance-criteria.json \
     --test-spec  <project>/.ai-context/base/test-spec.json \
     --impl-spec  <project>/.ai-context/base/impl-spec.json \
     --out-dir    <project>/.ai-context/base/traceability/
   ```

3. **matrix.json 검토** — 사용자에게 `coverage_summary` / `status` 요약 (green/yellow/red 카운트) 제공.

4. **coverage_summary 임계 검사**:
   - `red_count > 0` → chain coupling violation → 사용자 결단 prompt (go/stop-gate skill 호출).
   - `forward_coverage < 0.85` → ratchet violation → 위와 동일.

5. **finding 등록** (필요 시) — `_base-log-finding` skill 호출. severity = critical (red_count > 0) / high (forward_coverage < 0.85).

6. **dep-graph 무결성 검사 (implement gate 전용 / F-DOGFOOD-STORY-ORPHAN)** — `impl-spec.json` 이 존재할 때(= full chain 6 layer 완성 = implement gate #5)만 수행. 이전 gate(#1~#4)는 하위 layer 부재로 orphan 오탐이라 **skip**.

   ```bash
   # (a) artifact-graph.json 합성 — matrix 와 동일 source + --graph
   node ${CLAUDE_PLUGIN_ROOT}/tools/traceability-matrix-builder/src/cli.js \
     --discovery  <project>/.ai-context/base/discovery-spec.json \
     --behavior   <project>/.ai-context/base/behavior-spec.json \
     --acceptance <project>/.ai-context/base/acceptance-criteria.json \
     --task-plan  <project>/.ai-context/base/task-plan.json \
     --test-spec  <project>/.ai-context/base/test-spec.json \
     --impl-spec  <project>/.ai-context/base/impl-spec.json \
     --analysis-dir <project>/.ai-context/base \
     --scope-id <scope> --repo-root <project> \
     --out-dir <project>/.ai-context/base/ --graph

   # (b) graph-integrity-validator — cycle/orphan/unknown 검사 (gate-eval REQUIRED.implement)
   node ${CLAUDE_PLUGIN_ROOT}/tools/graph-integrity-validator/src/cli.js \
     <project>/.ai-context/base/artifact-graph.json --format json
   ```

   - `passed: false` (cycle/orphan/unknown ≥ 1) → **blocking finding**: severity = critical (cycle/unknown — topological sort 불가) / high (orphan — artifact chain 단절). `_base-log-finding` 등록 후 go-stop-gate 가 차단.
   - findings-aggregator 사용 시 `graph-integrity-validator` 가 REQUIRED.implement 에 등재돼 있으므로 `transformGraphIntegrity` 가 cycle/unknown→critical · orphan→high 로 매핑 (gate-eval 정합).
   - orphan 예: 의도된 미연결(pending TC 등)이면 source artifact 에 명시 마킹 후 재산출 (silent false-health 차단 / no-simulation).

## S5 — header schema 의무

`matrix.json` header 의무 필드 (traceability-matrix.schema.json 강제):

- `derived_from` (4 chain artifact path)
- `do_not_edit_manually: true`
- `generated_by: "tools/traceability-matrix-builder@<version>"`
- `generated_at: <ISO 8601>`

수동 편집 ❌. 사용자가 cells 수정 필요하면 source artifact (planning/behavior/acceptance/test/impl-spec) 갱신 후 재산출.

## no-simulation 정합

본 skill = 모든 cross_links 가 진짜 chain 산출물 path 에 grep-hit. 시뮬레이션 ❌. derived_from 가 없는 matrix = traceability-matrix.schema.json 위반 → schema-validator 자동 차단.

## 인용

- ADR: ADR-CHAIN-001 §2 (cross-link ≥ 0.85 ratchet) / §4 (bidirectional)
- ADR: ADR-011 (json 단독 / .md·.mermaid twin 폐지)
- 정책: DO-178C / IEC 62304 bidirectional traceability
- master plan §B deliverable 22 + §C cross-gate

---
name: _base-build-traceability-matrix
description: ★ ★ v2.0 cross-gate skill. 4 chain 산출물 (discovery-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec) 합성하여 traceability-matrix.{json,md,mermaid} 생성. UC → BHV → AC → TC → IMPL forward+backward link + coverage_summary + status (green/yellow/red). DO-178C / IEC 62304 bidirectional traceability 차용 (★ S5 정합 — header derived_from + do_not_edit_manually:true). 매 gate 갱신 의무.
allowed-tools: Read, Write, Edit, Bash
---

# build-traceability-matrix

★ ★ ★ v2.0 chain harness 의 **cross-gate matrix builder skill**. ADR-CHAIN-001 §4 (forward+backward bidirectional / DO-178C 차용) 정합. master plan §B deliverable 22 + §C cross-gate.

## 언제 사용

- 매 gate (#1~#4) 종결 시 의무 갱신.
- chain-revisit-detector 가 변경 감지하면 자동 trigger (sub-plan-5 통합).
- 사용자가 "traceability matrix 보여줘" / "matrix 갱신해줘" 자연어 prompt.

## 산출물

3종 (이중 렌더링 사상 정합 / ADR-008 v2 §10):
- `traceability-matrix.json` — single source of truth (★ DO-178C / `derived_from` + `do_not_edit_manually: true` header 의무).
- `traceability-matrix.md` — 사람 눈 (markdown table + coverage_summary + status legend).
- `traceability-matrix.mermaid` — 사람 눈 (graph view / ≥ 100 cell subgraph 분할 정책 = sp3-c1 carry).

## 절차

1. **chain 산출물 5종 path 확인** — 사용자 프로젝트 `.aimd/output/` 안의 `discovery-spec.json` / `behavior-spec.json` / `acceptance-criteria.json` / `test-spec.json` / `impl-spec.json` 존재 확인. 누락 시 status=red 표기 (사용자에게 명시).

2. **traceability-matrix-builder 도구 호출**:
   ```bash
   node tools/traceability-matrix-builder/src/cli.js \
     --discovery  <project>/.aimd/output/discovery-spec.json \
     --behavior   <project>/.aimd/output/behavior-spec.json \
     --acceptance <project>/.aimd/output/acceptance-criteria.json \
     --test-spec  <project>/.aimd/output/test-spec.json \
     --impl-spec  <project>/.aimd/output/impl-spec.json \
     --out-dir    <project>/.aimd/output/traceability/
   ```

3. **matrix.md / matrix.mermaid 사람 눈 검토** — 사용자에게 link 제공 + status 분포 (green/yellow/red 카운트) 요약.

4. **coverage_summary 임계 검사**:
   - `red_count > 0` → ★ ADR-CHAIN-001 §2 violation (chain coupling) → 사용자 결단 prompt (go/stop-gate skill 호출).
   - `forward_coverage < 0.85` → ratchet violation → 위와 동일.

5. **finding 등록** (필요 시) — `_base-log-finding` skill 호출. severity = critical (red_count > 0) / high (forward_coverage < 0.85).

## ★ S5 — header schema 의무

`matrix.json` header 의무 필드 (★ traceability-matrix.schema.json 강제):
- `derived_from` (4 chain artifact path)
- `do_not_edit_manually: true`
- `generated_by: "tools/traceability-matrix-builder@<version>"`
- `generated_at: <ISO 8601>`

수동 편집 ❌. 사용자가 cells 수정 필요하면 source artifact (planning/behavior/acceptance/test/impl-spec) 갱신 후 재산출.

## ★ ★ ★ no-simulation 정합

본 skill = 모든 cross_links 가 진짜 chain 산출물 path 에 grep-hit. 시뮬레이션 ❌. derived_from 가 없는 matrix = ★ traceability-matrix.schema.json 위반 → schema-validator 자동 차단.

## 인용

- ADR-CHAIN-001 §2 (cross-link coverage ≥ 0.85 ratchet)
- ADR-008 v2 §10 (chain 단계 이중 렌더링)
- DO-178C / IEC 62304 bidirectional traceability
- master plan §B deliverable 22

## Carry

- mermaid graph view ≥ 100 cell subgraph 분할 정책 (sp3-c1) — sub-plan-6 PoC #05 시점.
- chain-revisit-detector 통합 자동 trigger (sub-plan-5).

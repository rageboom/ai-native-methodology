# C3 (v12 atomic tool-cut) — 실행 plan (정찰·설계 완료 / 실행만 남음)

> ★ 2026-06-01~02 session 에서 **정찰 + handoff detector 설계 완료**. 본 plan = /clear 후 재가동용 self-contained 실행 지시.
> 권위 SSOT = `serialized-exploring-stonebraker.md`(v12 전체) + 본 파일(C3 상세) + `plan-dt-json-migration.md`(decision-table = ★ 이미 완료/merged).
> 경로 = inner repo `ai-native-methodology/` (git repo root = 그 부모 / `.claude/` 는 root).
> 현 상태: C1✅ C2✅ **DT-json✅ (commit 3582e10 / main FF merge / origin push 안 함)**. C3 = 본 plan 실행. C4~C8 후속.

## ★ C3 = 단일 원자 BREAKING commit (분할 RED 위험 / 단일 commit 의무)

### 0. ★ decision-table 은 C3 에서 제외 (DT-json 으로 이미 처리됨)
원 plan §C3-h(decision-table-validator json-only)는 **DT-json slice 가 이미 완료**(grid→json SSOT / validator json-only / 25 PoC json / commit 3582e10). C3 에서 decision-table 손대지 말 것. (BLOCKER B = 해소됨.)

### 1. drift-validator 모듈 삭제 (C3-a)
`tools/drift-validator/src/` 에서 삭제: `normalize-mermaid.js`, `compare.js`, `compare-phase-flow.js`, `spike-mermaid-parser.js`.
- importer 확인됨(외부 0): cli.js + corpus.test.js + compare-phase-flow-artifacts.test.js 만. 전부 본 C3 에서 재작성/삭제.

### 2. cli.js REWRITE (C3-b) — pair-mode 제거 → flag dispatcher
- 삭제 imports(L8~13): normalize-mermaid / normalize-json(detectArtifactType 등) / compare / normalize-phase-flow 의 `normalizePhaseFlow`(mermaid) / compare-phase-flow / baseline(pair-mode 전용).
- KEEP imports: node:fs(existsSync 등) + node:path(join/dirname/resolve) + check-phase-skills.js + **신규 ./check-handoff-consistency.js**.
- DELETE 함수: `findPairs`(L16-42), `processOne`(L44-118). KEEP: `getArgValue`, `findWorkspaceRoot`.
- KEEP 3 flag block 그대로(L141-201): `--check-layout` / `--check-state-flow-consistency` / `--check-chain-layout`.
- ADD 4th block `--check-handoff-consistency` (위 3개 패턴 mirror / exit result.ok?0:1 / workspace-root 못찾으면 exit 2).
- REPLACE default pair-mode(L203-292) → json-only usage banner(4 flag 나열) + no-flag 시 exit 2.
- ★ GOTCHA: `summarize`(compare.js)는 processOne(L64/L115) 안에서만 쓰임 → processOne 삭제 후 미사용 → compare.js 삭제 안전. (kept flag handler 는 check-phase-skills 의 자체 summarize 사용.)

### 3. normalize-phase-flow.js 부분 절단 (C3-c)
- DELETE(mermaid half): `stripComment`(L11), `isBlank`(L12), `detectPhaseFlowMermaid`(L45-58), `normalizePhaseFlow`(L88-174), `derivePhaseIdFromLabel`(L178-185), `derivePhaseIdFromSubId`(L189-191).
- KEEP+EXPORT(추가): `extractArtifactFiles`(L29), `META_FILE_RE`(L20), `NON_DELIVERABLE_META`(L24) — 현재 미export → `export` 추가. (`normalizePhaseFlowJson` L60 / `detectPhaseFlowJson` L39 = 이미 export.)
- KEEP(shared / 삭제 ❌): `stripDecor`(L13), `normalizePhaseId`(L37), `byEdge`(L193).
- ★ GOTCHA(필수): `__test__` export(L197)가 derivePhaseIdFromLabel/SubId(삭제 대상) 참조 → **ReferenceError**. → `export const __test__ = { normalizePhaseId };` 로 교정.
- ARTIFACT_FILE_RE(L18) md/mermaid alt 유지(무해 / handoff detector 가 .json 필터).

### 4. JSON-only handoff detector 신설 (C3-d) — §아래 설계 그대로
신규 `tools/drift-validator/src/check-handoff-consistency.js` + `flows/artifact-registry.json`(§7 내용 그대로 write).

### 5. traceability-matrix-builder 절단 (C3-e)
- `src/builder.js`: DELETE `renderMarkdown`(L217-239) + `renderMermaid`(L241-279). KEEP `loadJson`(L281-285)·buildMatrix·deriveCellSeverity. L3 헤더주석 "matrix.json + .md + .mermaid"→"matrix.json". (blank line 정리.)
- `src/cli.js`: L5 import 에서 renderMarkdown/renderMermaid 제거 / L108-109 `const md=`·`const mermaid=` 삭제 / L120-122 matrix.md·matrix.mermaid write 삭제(matrix.json만) / L123 log `matrix.{json,md,mermaid}`→`matrix.json`.
- `test/builder.test.js`: L3 import 에서 renderMarkdown/renderMermaid 제거 / DELETE 3 test: `renders markdown table`(L38) + `renders mermaid graph`(L48) + `mermaid renders BR --> BHV edge`(L183).
- ★ renderers/diff-view.js = 무관(별 markdown / 건드리지 말 것). navigator-matrix-consistency.test.js = matrix 객체만 읽음(.md 안 읽음 / 무변경).

### 6. chain-driver manifest.md 제거 (C3-f)
- `src/state-store.js`: L322 `atomicWrite(join(dir,'manifest.md'),renderManifestMd(enriched))` 삭제 + L245 import 에서 `renderManifestMd` 제거.
- `src/work-unit.js`: DELETE `renderManifestMd`(L88-147).
- `test/scope-dir.test.js`: DELETE 2 test — `writes manifest.md alongside`(L110-119) + `writeManifest also writes manifest.md`(L210-222).
- ★ GOTCHA(필수 ripple): `test/scenario.test.js` = **2번째 renderManifestMd 소비자** → L11 import 에서 `renderManifestMd` 제거 + DELETE test `renderManifestMd includes Scenario line`(L53-56). (안 하면 전체 scenario.test ReferenceError → 다수 fail cascade.)
- never-read 확인됨(manifest.md write-only). renderManifestMd 소비자 = state-store + work-unit + scenario.test 3곳뿐(전부 본 C3 처리).

### 7. test/package/corpus/regex (C3-i/j/k)
- DELETE `test/corpus.test.js`(30) + `corpus/*.mermaid`(26) + `corpus/*.json`(26). (corpus dir = `tools/drift-validator/corpus/`.)
- REWRITE `test/compare-phase-flow-artifacts.test.js` → `test/handoff-consistency.test.js`(§8 8 test).
- `package.json`: L13 test script(corpus.test 제거 + compare-phase-flow-artifacts→handoff-consistency swap) / L14 spike script 삭제 / L16-18 `@mermaid-js/parser` dep 삭제 / L4 desc(.mermaid↔.json→json-only).
- `chain-driver/src/revisit-detect.js`: L11~17 spec-deliverable regex `(json|md|mermaid)`/`(json|md)` → `json` (전부 json-only / 테스트 안 깨짐 확인).
- `skill-citation-validator/src/check-citations.js`: L22 `SCAN_EXT = new Set(['.md','.mermaid'])` → `['.md']` + L4 주석.

### ★ 5 MUST-FIX GOTCHAS (정찰이 잡은 / plan 누락분)
1. normalize-phase-flow `__test__`(L197) → derivePhaseId* 삭제 시 ReferenceError → `{normalizePhaseId}`만.
2. **scenario.test.js** = renderManifestMd 2번째 소비자 (plan 미언급) → import+test 제거 필수.
3. navigator-matrix-consistency.test.js = matrix.md 안 읽음(객체만) → 무변경(오해 금지).
4. release-readiness check3 = handoff flag 추가 = **NET-NEW 배선**(기존 mermaid 검사 swap 아님) → §8 cli_integration.
5. compare.js summarize = processOne 내부 전용 → processOne 삭제로 미사용(삭제 안전).

### 검증 (C3 종결)
full workspace `npm test` 0 fail (corpus 30 + builder 3 + scenario/scope manifest test 제거 + handoff 8 신규 → 절대 카운트 변동 OK) + drift-validator **4 flag exit 0**(--check-handoff-consistency 포함 / 현 6 flow 0 breaking — §8 검증됨) + release `release:check` N/N + grep: active body `*.mermaid` 잔존(C3 범위=drift corpus/모듈) 0.

---

## 7. flows/artifact-registry.json (신규 / write 그대로)

```json
{
  "$comment": "Canonical artifact allow-list (json-only deliverable names) for JSON-only handoff/rename-drift detector (v12.0.0 / DEC-2026-06-01-json-only-ax-native). Derived from lifecycle-contract.md + flows/*.phase-flow.json. Only .json/.jsonl/.yaml deliverables. .md/.mermaid twins NEVER listed. Config/audit/op meta (.aimd/config/test-cmd.json, finding-system.findings.json, chain-intervention-log.jsonl) deliberately ABSENT (detector suppresses via prefix/allowlist). produced_by = canonical bridge for terminal artifacts whose flow token is non-literal (impl-spec.json/matrix.json).",
  "id": "artifact-registry",
  "version": "1.0.0",
  "derived_from": ["methodology-spec/lifecycle-contract.md", "flows/analysis.phase-flow.json", "flows/discovery.phase-flow.json", "flows/spec.phase-flow.json", "flows/plan.phase-flow.json", "flows/test.phase-flow.json", "flows/implement.phase-flow.json"],
  "artifacts": [
    { "name": "inventory.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 1, "track": "common" },
    { "name": "stats.json", "stage": "analysis", "produced_by": "analysis", "track": "common" },
    { "name": "architecture.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 2, "track": "common" },
    { "name": "domain.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 3, "track": "common" },
    { "name": "business-rules.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 4, "track": "be-fe" },
    { "name": "antipatterns-partial.json", "stage": "analysis", "produced_by": "analysis", "track": "common" },
    { "name": "antipatterns.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 7, "track": "common" },
    { "name": "migration-cautions.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 7, "track": "common" },
    { "name": "characterization-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 23, "track": "common" },
    { "name": "coverage.json", "stage": "analysis", "produced_by": "analysis", "track": "common" },
    { "name": "sql-inventory.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 24, "track": "db" },
    { "name": "schema.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 5, "track": "db" },
    { "name": "api-extension.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 5, "track": "be" },
    { "name": "openapi.yaml", "stage": "analysis", "produced_by": "analysis", "deliverable": 5, "track": "be" },
    { "name": "error-mapping-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 16, "track": "be" },
    { "name": "html-template-extract.json", "stage": "analysis", "produced_by": "analysis", "track": "be" },
    { "name": "ui-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 7, "track": "fe" },
    { "name": "state-map.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 8, "track": "fe" },
    { "name": "visual-manifest.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 9, "track": "fe" },
    { "name": "a11y-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 10, "track": "fe" },
    { "name": "i18n-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 11, "track": "fe" },
    { "name": "static-security-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 12, "track": "be-fe" },
    { "name": "legacy-spectrum.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 13, "track": "common" },
    { "name": "form-validation-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 14, "track": "fe" },
    { "name": "type-spec.json", "stage": "analysis", "produced_by": "analysis", "deliverable": 15, "track": "fe" },
    { "name": "_manifest.yml", "stage": "analysis", "produced_by": "analysis", "track": "common" },
    { "name": "discovery-spec.json", "stage": "discovery", "produced_by": "discovery", "deliverable": 17, "track": "common" },
    { "name": "behavior-spec.json", "stage": "spec", "produced_by": "spec", "deliverable": 18, "track": "common" },
    { "name": "acceptance-criteria.json", "stage": "spec", "produced_by": "spec", "deliverable": 19, "track": "common" },
    { "name": "task-plan.json", "stage": "plan", "produced_by": "plan", "deliverable": 22, "track": "common" },
    { "name": "test-spec.json", "stage": "test", "produced_by": "test", "deliverable": 20, "track": "common" },
    { "name": "impl-spec.json", "stage": "implement", "produced_by": "implement", "deliverable": 21, "track": "common", "note": "flow token non-literal (impl-spec.impl_modules[]) — produced_by bridge" },
    { "name": "matrix.json", "stage": "implement", "produced_by": "implement", "deliverable": 22, "track": "cross-cut", "note": "flow token brace-expansion (traceability-matrix.{json,md,mermaid}) + name drift (traceability-matrix vs matrix) — produced_by bridge" }
  ]
}
```

## 8. check-handoff-consistency.js 알고리즘 (설계 / c3-design.txt 영속 사본)

**exports**: `analyzeHandoff(workspaceRoot)` / `checkHandoffConsistency(workspaceRoot|model)` → `{ok, diffs[]}` (ok=breaking 0) / `summarizeHandoffConsistency(result)` (check-phase-skills.js summarize* shape mirror).
**reuse from normalize-phase-flow.js**: `extractArtifactFiles`, `META_FILE_RE`, `NON_DELIVERABLE_META`, `normalizePhaseFlowJson`.
**new constants**:
- `ANALYSIS_BASELINE_ARTIFACTS` = Set(inventory/stats/schema/architecture/domain/business-rules/antipatterns(-partial)/characterization-spec/coverage/sql-inventory/api-extension/error-mapping-spec/openapi.yaml/html-template-extract/ui-spec/state-map/visual-manifest/type-spec/a11y-spec/i18n-spec/static-security-spec/legacy-spectrum/form-validation-spec/migration-cautions/_manifest.yml). (★ analysis 는 previous_chain 으로 도달 불가 — discovery.previous_chain 부재 / analysis.phase-flow.json `stage` 부재 → 별도 seed 필수.)
- `HANDOFF_NON_DELIVERABLE` = Set('finding-system.findings.json','chain-intervention-log.jsonl').
- `CONFIG_PREFIX_RE` = /^\.aimd\/config\//i ; `CONFIG_BASENAMES` = Set('test-cmd.json').
- `DELIVERABLE_EXT_RE` = /\.(?:json|jsonl|ya?ml)$/i (★ .json/.jsonl/.yaml 만 비교 → .md/.mermaid 토큰 무시 → **C3-before-C4 green**, C4 후도 동일).
**algorithm**: chain order `['analysis','discovery','spec','plan','test','implement']` 파일명 로드(previous_chain 의존 ❌). stage outputs = extractArtifactFiles(outputs[]) filter DELIVERABLE_EXT_RE + **registry.produced_by self-output 보강(필수 — impl-spec.json/matrix.json 비-literal 토큰)**. producer_union(i) = ANALYSIS_BASELINE ∪ outputs(0..i). 각 input(suppress first: CONFIG/HANDOFF_NON_DELIVERABLE): Arm A input-no-producer=breaking(`handoff.input-no-producer`) + Arm B not-in-registry=breaking(`handoff.input-unknown-artifact`). 각 output: Arm B output not-in-registry=breaking(`handoff.output-unknown-artifact`) + Arm C output-no-consumer=info(`handoff.output-no-consumer`). ★ 현 6 flow 실측 = 0 breaking (terminal/baseline info 만).
**cli**: `--check-handoff-consistency` block(other --check-* mirror / findWorkspaceRoot = flows/analysis.phase-flow.json 위치 = artifact-registry.json 도 flows/).
**release-readiness check3**: checks[] 배열에 `{name:'drift handoff-consistency', cmd:['tools/drift-validator/src/cli.js','--check-handoff-consistency','--json']}` 추가(단일 id validators_violation 유지 / 30/30 불변 / delegated_to '5 validator'로). ★ NET-NEW(기존 mermaid 검사 없음).

## 9. handoff-consistency.test.js — 8 test (compare-phase-flow-artifacts.test.js 대체)
1. rename drift(both-sides 'behaviour-spec.json' typo) → output+input-unknown-artifact breaking / input-no-producer 아님(Arm A 단독이면 놓침 입증).
2. matched(spec outputs behavior-spec.json / plan inputs behavior-spec.json) → ok true / 0 breaking.
3. meta suppression(finding-system.findings.json input + chain-intervention-log.jsonl output) → 0 diff.
4. baseline(implement inputs architecture.json/schema.json / discovery.previous_chain 부재) → no input-no-producer(ANALYSIS_BASELINE seed 가드).
5. .md/.mermaid 입력 토큰(behavior-spec.md/erd.mermaid) → DELIVERABLE_EXT_RE 무시(C3-before-C4 안전 입증).
6. terminal(impl-spec.json/matrix.json produced_by 보강) → output-no-consumer=info / input-no-producer 아님.
7. negative control(ghost-artifact.json orphan) → input-no-producer + input-unknown-artifact breaking(vacuous green 아님).
8. producer-side(plan outputs task-plan-v2.json registry 부재) → output-unknown-artifact breaking(no-consumer info 로 강등 ❌).

## 10. 참고
- 정찰 workflow 출력(영속): recon = `…/tasks/w110b0uiw.output` / design = `…/Temp/c3-design.txt`(OS 정리 가능 → 본 plan 이 사본). conformance(DT-json) = `…/tasks/w7dp8yerc.output`.
- decision-table = DT-json 완료(merged). C4 가 decision-table .md 25 삭제 + 6-antipatterns.md:117 ref(.md→.json) + flows/analysis.phase-flow.json:70 decision-tables/*.md scrub + workflow/formal-spec.md 문서.

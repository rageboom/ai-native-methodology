# research-codegraph-step3 — 3-에이전트 적대적 research 결과

> 4원칙 §2. workflow `wf_b66c8b85-e4a` (official-docs / industry / Senior 적대 0.85 / synthesis). 출력 전문 = task wl4qh08n2.
> 결론: **REVISE → Option A + 단일 축(dependency coverage-hole)으로 좁힘 + "대치" 라벨 폐기**.

## 1. official-docs (F-015 cross-validation / codegraph 공식 소스 raw fetch)

- codegraph **module-dep/SCC/circular/layer-violation 내장 CLI 부재** (CLI: init/index/sync/status/query/callers/callees/impact/affected/files/context/serve) — STEP 2 결론 confirmed.
- additive: JS public API 에 `findCircularDependencies()`/`findDeadCode()`/`getFileDependencies()`/`getFileDependents()` 존재 (CLI/MCP 미노출). STEP 2 메모가 API 레이어 미기록 → 보정.
- provenance: 공식 type = `'tree-sitter'|'scip'|'heuristic'|undefined`. 메인의 "null=AST직접추출" = **partial** (heuristic=합성 confirmed / null=AST직접 은 공식값 아님 = SQLite NULL=TS undefined). `resolvedBy`/`metadata.confidence` = Edge 인터페이스 부재(refuted / confidence 는 Subgraph 'high'|'low').
- **STEP 3 무영향**: module rollup 은 provenance/resolvedBy/confidence 미사용 — cross-file edge **존재 자체**(source.file≠target.file)만 사용. 단 DEC·주석에서 "null=AST직접추출" 공식 의미론 승격 ❌ (정직 표기).

## 2. industry (madge/dependency-cruiser/ArchUnit/NDepend/SonarQube/knip)

- module dep 그래프: import-graph(dependency-cruiser/madge / placeholder 한계 동일) vs **call+reference graph(ArchUnit 바이트코드)**. 메인의 cross-file calls/references/instantiates rollup = **ArchUnit 방식과 가장 근접 = 업계 정합**.
- cycle 보고: 업계 표준 = **개별 cycle path(A→B→A)**, SCC blob 단독 보고는 비표준. ArchUnit Issue #361 = "대형 cycle blob actionability 실패" 공개 이슈가 메인의 7-모듈 blob 우려 corroborate.
- layer-violation: ArchUnit/NDepend 강력 선례 but **FP 최다 축**(test code / DI·decorator FN / config·common over-report).
- FP#6(config/공통 모듈 over-report) + #2(decorator DI undetectable) 가 메인 onlyArch 실측(ecom 7건 전부 →CONFIG·COMMON) corroborate.
- 권고 우선순위: **(a)▶(c)[FP cap 필수]▶(b)[메타요약 only]▶(d)[carry]**. Option A 업계 정합.

## 3. Senior 적대 (0.85 / REVISE)

- **Fork-1 = Option A** CONCUR. DEC "유일한 진짜 R(대치)" = "거짓 자기최면" → **"결정론 corroboration / dependency coverage-hole lens"로 개명**. Option B = SKILL(Write)이 dependencies[] 직접 emit → reference-lens→authoritative 전환 = check34/35 동형 가드 적용불가 = **trust 경계 구조 붕괴** + onlyArch 7건 사각 소실로 **LLM 근사(conf 0.9)보다 퇴화** + greenfield/iBATIS2/FE graceful 분기 폭증 + 결정론 dogfood 불가.
- **Fork-2 = (a) dependency coverage-hole 1축 단독**. (b)(c)(d) 전부 CUT→carry STEP4+. STEP1 11→2·STEP2 5→2 칼날.
- **Fork-3 = onlyArch → informational_notes[] 3중 강제** (severity 필드 부재 + toFindings/toPromoteReadyFindings holes-only 순회 구조적 절단 + check36).
- must-fix 6종 (아래 §4).

## 4. must-fix (rank)

1. DEC 라벨 "대치(유일한 진짜 R)" → "dependency coverage-hole / 결정론 corroboration lens" 개명 + Option A 확정 + arch.json 무수정 + SKILL codegraph 호출 0 (B 경로 봉인).
2. 코어 = (a) 1축. (b)module-SCC·(c)layer-violation·(d)inventory = carry. cross-file edge 만 rollup, imports edge placeholder 오염 명시 제외.
3. onlyArch → informational_notes[] 데이터 격리(severity 부재 / holes-only 순회) + check36(arch_only→finding 토큰 0 + "not a defect" 양성 문자열).
4. module rollup path-format/src-prefix 민감 → normalize.js normalizeFile/fileMatches(suffix-매칭) 재사용 통일. RW+ecom 동일 코드경로 재현 입증 후 본체 격상.
5. trust 가드: render.js SEVERITY_CEILING(low|medium)+pinSeverity 재사용 + cli.js reference_lens:true + check36(check34/35 4-part isomorphic).
6. provenance=null/resolvedBy/confidence 의미론 오용 금지 (STEP 3 코드는 enumerateEdges read 컬럼 kind/provenance/line/source/target 만 사용 = 이미 안전).

## 5. 충돌 해소 (전부 Senior 채택)

- 코어 (c)layer-violation 포함(industry 조건부) vs CUT(Senior) → **CUT**. 실파일 검증: architecture.schema modules[].layer = LLM 비결정 입력(결정성 마커 부재) → codegraph(결정)×layer(비결정) 혼합=trust 오염.
- (b)SCC 메타요약(industry) vs CUT(Senior) → **CUT**. blob over-claim + path-format 민감 + STEP2 call-cycle carry 동형 함정.
- provenance 의미론 → 공식소스 우선 + STEP3 무영향.

## 6. 구현 자산 재사용 (STEP1/2 거의 전량)

- `buildRouteAxis` 패턴 (coverage.js) → buildModuleAxis
- `enumerateEdges` (enumerate.js / STEP2 신설) → cross-file edge 열거
- `normalizeFile`/`fileMatches` (normalize.js / src-prefix suffix-매칭)
- `SEVERITY_CEILING`/`pinSeverity` (render.js) / `toPromoteReadyFindings` (finding-export.js)
- check34/35 4-part isomorphic → check36
- 관련 schema: architecture.schema.json(입력) / code-coverage-hole.schema.json(additive) / finding-system.schema.json

## 7. 최종 권고 (gate #3 묶음 결단 대상 = plan §3 fork 해소)

**STEP 3 = "module dependency coverage-hole" reference-lens (Option A / 1축 / onlyArch 격리 / arch.json 무수정 / DEC '대치'→corroboration lens 개명) / RW(+22)+ecom(+8) 2-도메인 재현 입증 후 격상.**

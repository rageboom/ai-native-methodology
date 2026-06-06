# research-codegraph-step2 — 3-agent 토론 (4원칙 #2)

> 방식 = Workflow `wf_015e95b1-432` (investigation 3 + research 3[official-docs/industry/Senior] + synthesis 1 = 7 agent / 678K tokens / 116 tool-use). no-simulation: 실 `.codegraph` SQLite 직접 쿼리(node:sqlite) + 1차 출처 WebFetch + 레포 소스 raw read.

## 1. 공식문서 (official-docs / F-015 cross-validation)

- **codegraph EdgeKind enum 확인** — contains/calls/imports/exports/extends/implements/references/type_of/returns/instantiates/overrides/decorates (colbymchenry.github.io/codegraph/core-concepts/resolution + CLAUDE.md). calls = "function calls → definitions, by import resolution and name matching". **synthesized edges = `provenance:'heuristic'` 명시 태깅**.
- **cycle/orphan/SCC/dead-code 내장 CLI 명령 부재** (high) — 제공 명령 = query/callers/callees/impact/affected/context/files/status/index/sync/serve/… 가 전부. → 원하면 우리 도구가 edges 직접 계산해야 함(위임 불가).
- **DB schema 컬럼 레벨 공식 미공개 + 버전 안정성 보장 문서 0** (high) — `src/db/schema.sql` SSOT 언급만. → STEP 1 PRAGMA probe 설계 정당 / STEP 2 enumerateEdges 도 동일 패턴 필수. 실측 컬럼(id,source,target,kind,metadata,line,col,provenance)은 직접 탐침으로만 확인 = 버전 변경 위험 실재.
- **node:sqlite v22.13+ readOnly unflagged** (high / Stability 1.1·1.2 RC) — grounding 'Node≥22.13 unflagged' 정확.
- **calls DI/reflection 완전 해소 보장 없음** (medium) — 공식도 "synthesized=heuristic" 으로 동적 dispatch gap 부분 보완만 명시 → 실측(DI 주입 AuthService.login incoming calls 0) 과 **모순 없음(VERIFIED)**. cycle/orphan carry 가 §8.1 정직 원칙에 부합함을 **공식 근거로 뒷받침**.
- caveat: imports 의 'leaf import-decl 노드 vs file-to-file' 은 공식 'source files' 기술과 실측 상충 가능 = UNVERIFIED.

## 2. 업계 사례 (industry / 6 도구)

**업계 디폴트 = "graph-derived finding = advisory, not gate-blocker"** (만장일치):
- **dependency-cruiser** — no-circular 기본 severity = **warn**(비차단). error 로 올려야 non-zero exit. known barrel=warn / 순수 circular=error 2-tier graduated escalation 공식 예제.
- **knip** — `--no-exit-code` 지원. Angular 실측(2024-03): @Effect() NgRx / 템플릿 참조 메서드 / Module 선언 컴포넌트 **dead-code 오탐** → 프레임워크 reflection/DI 진입점 = 정적분석 구조적 맹점. "CI 포함은 추가 평가 보류" 권장.
- **NDepend** — cycle = warn 메트릭 + `/ForceReturnZeroExitCode`. dead-code = **'potentially dead'** + UsedImplicitly/IsNotDeadCode/Controller suffix whitelist.
- **SonarQube** — cycle = code smell(maintainability), blocker 아님 (v5.2 DSM 제거 / Cloud 재도입도 code smell / 2026-01 deprecated).
- **ArchUnit** — hard-fail 디폴트이나 **FreezingArchRule**(기존 위반 freeze → 신규만 탐지) 점진 격상 + ignore_patterns.txt.
- **shipmonk dead-code-detector(PHP)** — DIC constructor/factory + @api entrypoint + ReflectionClass + magic 메서드 whitelist. "툴 자체는 advisory, gate 연결 별도".

→ STEP 2 **trust-ceiling low|medium + reference-lens 비차단**을 6 선례가 강하게 지지. orphan FP 압도(DI/데코레이터/reflection 진입점)는 knip Angular·NDepend·PHP-detector 공통 확인 = 실측 결론 corroborate. cycle/orphan **carry 결정**도 knip Angular·ArchUnit FreezingArchRule 동형.
- caveat: SonarQube severity·NDepend cycle-advisory 는 문서 404/유추 = medium. ArchUnit 은 hard-fail 디폴트(요점은 점진 격상 중간 패턴).

## 3. Senior Engineer (적대적 / confidence 0.80 / CONCERN 격상조건부 GO)

- **scope 과적합 재발** — §5 "5 산출물" = STEP 1 "11 deliverable overreach" 동형. domain·error-mapping(NestJS=none)·artifact-graph 신규 가치는 DEC §3 본문이 이미 'medium~none/Modern한정/semantic' 로 깎음. 정직 minimal core = **coverage-hole-as-finding + handler-set reading-aid 2종**.
- **cycle/orphan = FP 압도** (실 DB 직접 쿼리) — orphan survivor 전부 live(@DgsComponent/JUnit/DI), cycle = 정상 재귀/sibling wrapper. call provenance 미해소. **in-degree 0 → dead 단정 = 날조에 준함 = no-simulation 위배**. 진입점 메모 'cycle·orphan seed' = DEC §3 본문보다 강한 핸드오프 overclaim → 반증.
- **handler-set** = 유일한 결정적·깨끗한 신규 신호이나 **ecommerce 1-도메인 only**(RealWorld implements=Repository/extends=test noise) → error-mapping 2-도메인 주장 ❌, 1-도메인 정직표기(v12.6.0 IMPL 옵션2 선례).
- **trust 누출** = 구조적 차단 가능하나 STEP 1 보다 약함 — finding-system severity enum high/critical 살아있음 → `code_graph_ref ⟹ severity⊆{low,medium}` conditional 필요. 단 REQUIRED_VALIDATORS_PER_STAGE 미등록 = 1차 방어선 견고.
- **schema** = code_graph_ref optional 1개 + conditional. discoverer 자유텍스트 'codegraph'(무변경) 정답. **discoverers enum 격상 = 권위 누출 reject**. 기존 PoC finding 회귀 0.
- **도구** = codegraph-coverage 확장(enumerateEdges + finding-system emitter). dep-graph graph-integrity-validator inject **절대 금지**(직교축).
- **must-fix 7종**: ①cycle/orphan STEP 3+ carry 명시 ②STEP 2 가치 재정의(export+배선, 새 seed 아님) ③code_graph_ref additive+conditional ceiling ④check35 신설 ⑤handler-set reading-aid·1-도메인·http_status semantic carry·RealWorld test-base 필터 ⑥dep-graph inject 금지 ⑦DEC §3 line 44 문구 정정.

## 4. 종합 (synthesis)

minimal core 2-mechanism(coverage-hole export + code_graph_ref additive/conditional) + 보조 handler-set(1-도메인). cycle·orphan = carry. check35 신설. codegraph-coverage 확장. → 4 open decision (gate #3 / 아래).

### gate #3 사용자 결단 (4종 / 묶음 / Auto Mode 호환)
1. **목적지**: (a) STEP1 산출물 유지 + shape export 함수만 / (b) F-XXX ledger 자동 emit / **(c) 자동 seed→사람 promote** [rec].
2. **cycle·orphan**: **전면 carry** [rec] / low-severity 'potential' 포함 / imports-only 일부.
3. **handler-set**: 포함 / 제외+STEP3 carry / **포함하되 1-도메인 정직표기** [rec].
4. **discoverers enum**: **미추가(자유텍스트 'codegraph')** [rec] / 'codegraph' 추가.

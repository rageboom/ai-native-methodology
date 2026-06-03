# plan-codegraph-step3 — architecture 대치(+inventory)

> 4원칙 §1 (깊은 숙지 → plan). SSOT = `decisions/DEC-2026-06-03-codegraph-deliverable-wiring.md` §5 STEP 3.
> 선례 = STEP 1 (v12.9.0 / §9) + STEP 2 (v12.10.0 / §10). release/구현 ❌ — 사용자 gate #3 승인 후 착수.

## 0. 목표 (DEC §5 STEP 3 / §3 line 32·85·96)

STEP 3 = **architecture 대치 (+inventory)** — 4-렌즈 분석에서 **유일한 진짜 R(대치)**.
- 문제: architecture.json 의 `dependencies[]` weight + `circular_dependencies[]` 는 LLM 이 "import 관측 기반 근사"(실측 confidence 0.9 / warning 에 *"정밀 호출 카운트는 정적 도구 필요"* 라고 이미 정직 자백) + `circular_dependencies[].detection.algorithm: "tarjan_scc"` 스키마 필드가 **결정성을 암시하나 실제론 LLM 추론**.
- 대치: codegraph 의 결정적 edge 전수 열거로 그 gap 을 메워 **"결정적" 표기를 비로소 진실로**.

## 1. 실측 (no-simulation / 2 distinct 도메인 실 `.codegraph` DB 직접 쿼리 / probe = `.claude/plans/codegraph-step3-probe/module-graph-scc-probe.mjs`)

### 1-A. codegraph edge 신호 = 강력 (STEP 2 call-cycle 문제와 정반대)
| edge kind | RealWorld | ecommerce | 해소율 |
|---|---|---|---|
| imports | 1177 | 300 | 100% 양끝 해소 (provenance=null=AST직접 / heuristic 합성 아님) |
| calls | 590 (heuristic 71) | 120 (heuristic 11) | 100% |
| references | 366 | 188 | 100% |
| instantiates | 173 | 23 | 100% |
| extends / implements | 15 / 7 | 6 / 6 | 100% |

- ★ STEP 2 가 carry 한 cycle/orphan = **call/method 단위**(framework-invoked entry point 가 orphan FP / heuristic provenance). architecture 모듈 의존 = **imports/calls/references/instantiates/extends/implements cross-file edge rollup** = AST 100% 해소 = **별개의 깨끗한 신호**.
- ★ `imports` edge 의 target = import 문 심볼(file_path=importing 파일 placeholder) → 내부/외부 구분에 qualified_name 매칭 필요 = rollup 에 부적합. 진짜 module→module 신호 = **calls/references/instantiates/extends/implements 의 cross-file edge** (source.file ≠ target.file, 둘 다 내부).

### 1-B. 모듈 그래프 재현 실험 (arch.json modules[] 로 file→module bucket, cross-file edge rollup, Tarjan SCC)
| 신호 | RealWorld (Spring+MyBatis3) | ecommerce (NestJS+Prisma) |
|---|---|---|
| arch.json dep **corroborate (BOTH)** | **21/21** | 8/15 |
| codegraph **미검출 (onlyArch)** | 0 | 7 = 전부 `→MOD-CONFIG`(4) + `MOD-COMMON→`(3) = **런타임 DI/decorator/config 와이어링** = codegraph 정직한 사각 (DEC §2 명시) |
| **coverage-hole (onlyCg / LLM 놓침)** | **+22** (MOD-APP-QUERY→MOD-INFRA-MYBATIS w37, GraphQL API 모듈 전체 등) | **+8** (MOD-PRODUCT→MOD-COMMON w6 등) |
| **module-SCC (Tarjan)** | 1 cycle = 7-모듈 SCC (arch.json `circular:[]` = 전면 누락) | 1 cycle = 4-SCC [PRODUCT↔CATEGORY↔USER↔AUTH] **⊇ arch.json 의 [AUTH↔USER]** (재현+확장) |

### 1-C. 실측에서 도출된 trust/precision 경계 (핵심)
1. **안전 방향 = coverage-hole** (codegraph有/arch.json無). STEP 1 set-diff 와 동형. 가장 깨끗. RealWorld +22 / ecommerce +8 실측.
2. **위험 방향 = "over-claim"** (arch.json有/codegraph無 = onlyArch). codegraph 사각(런타임 와이어링 = ecommerce 7건 전부 config/decorator) 때문에 **부재 ≠ 거짓** → **결함으로 보고 ❌**. 최대 informational note ("codegraph 미검출 — 가능: 런타임 와이어링/iBATIS2/동적").
3. **module-SCC = 가치 입증 but rollup 거칢 risk**: ecommerce 4-SCC 는 LLM 2-cycle 을 정확히 포함(재현). RealWorld 7-모듈 SCC 는 거대 blob — 실 도구(dependency-cruiser)는 SCC 전체가 아니라 개별 cycle path 보고. SCC 구조 검출=결정적 / severity·bc_status·decision_required=semantic(arch.schema 가 이미 분리 모델링). → **fork (아래 §3)**.
4. **rollup = path-format 민감** (ecommerce 는 `src/.codegraph` 인덱싱 → file_path src-relative `auth/x.ts` vs arch.json `src/auth` → 보정 필요). federator F-FED-WIN-001 forward-slash 정규화 선례 상속.

## 2. trust 경계 재확인 (DEC §2 / 불변)
- codegraph 출력 = reference-lens. 결정적 validator(schema/drift/decision-table/spectral/gate-eval/coverage/negative-space) inject ❌.
- 허용 채널 3종: reading-aid / finding / coverage-hole.
- ★ architecture.json = **deliverable (gate 아님)**. STEP 3 의 "대치"는 **reviewer 가 codegraph 결정적 enumeration 을 ground-truth 로 신뢰**(LLM sampling 의존 탈피)하도록 reference-lens 제공 — architecture.json 자동 주입/덮어쓰기 ❌ (STEP 1/2 separate-tool 패턴 동형).

## 3. 설계 fork (3-agent research + Senior 적대 + 사용자 gate #3 결단 대상)

### Fork-1: "대치" 구현 형태 (가장 중요)
- **Option A (reference-lens 확장 / STEP 1·2 동형 / 권고 가설)**: `codegraph-coverage` 에 **arch/module axis** 신설. module 그래프 rollup → **dependency coverage-hole**(codegraph 모듈 edge ∖ arch.json dependencies[]) 를 reference-lens + promote-ready finding 으로 산출. arch.json 무수정. trust 경계 완전 보존. §8.1 점진.
- **Option B (skill-level 진짜 대치)**: analysis-architecture SKILL 이 codegraph 호출 → dependencies[]/weight/circular 를 codegraph 소스로 emit + code_pointers + 사각 정직 downgrade. 더 깊은 "대치"이나 (a) skill codegraph 의존(greenfield/iBATIS2/FE graceful fallback 필요) (b) deliverable 내용에 codegraph 직접 주입 = trust 경계 근접 (c) 결정적 dogfood 어려움. → 위험·재작업 큼.
- 가설: **Option A** (DEC "유일한 진짜 R" 취지 = reviewer ground-truth 이동으로 충족 / 재작업 최소화 2순위 / STEP 1·2 칼날 동형). Senior 적대 검증 필수.

### Fork-2: STEP 3 코어 범위 (§8.1 과적합 회피 / STEP 1 11→2 · STEP 2 5→2 선례)
- (a) **dependency coverage-hole** (proven-safe / 2-도메인 corroborated) — 코어 확정 후보.
- (b) **module-SCC cycle 후보** — 가치 입증 but rollup 거칢 → 코어 포함 vs carry fork.
- (c) **layer-violation 후보** (arch.schema `violates_layer` / DEC §3 "layer위반 후보") — module 의 layer + edge 방향으로 결정적 산출 가능. 포함 vs carry.
- (d) **inventory I** (DEC §3 line 39: stack·orm·architecture_style evidence corroborate / module centrality·tier evidence) — 별도 산출물. 포함 vs carry.
- 가설: 코어 = (a) dependency coverage-hole. (b)(c)(d) 는 Senior + 실측 precision 에 따라 포함/carry 결정.

### Fork-3: over-claim 방향 처리
- onlyArch(codegraph 미검출) = informational note only (결함 ❌). 보고 형식 확정 필요.

## 4. 작업 항목 (Option A 가설 기준 / 승인 시)
1. `tools/codegraph-coverage/src/` 에 module-rollup 엔진 (cross-file edge → file→module bucket → module edge). path 정규화(forward-slash + src-prefix). 순수 함수.
2. SCC (Tarjan) — fork-2(b) 채택 시. 거칢 honesty note.
3. arch axis coverage: arch.json dependencies[] set-diff → coverage-hole. detectability(런타임 와이어링 사각 정직).
4. cli `--axes arch` 또는 신규 subcommand. reference-lens 리포트 + (STEP 2 동형) `--emit-findings` promote-ready.
5. schema: code-coverage-hole.schema.json additive (arch axis) 또는 신규. severity ceiling low|medium 구조 강제 상속.
6. 회귀가드 release-readiness **check36** (check34·35 isomorphic — gate-import 0 + ceiling + reference_lens).
7. 2-도메인 dogfood (RealWorld + ecommerce) schema-valid + corroboration.
8. version 3-way bump (MINOR) + build dist + CHANGELOG + DEC §11 append + memory.

## 5. §8.1 정직 경계
- dependency coverage-hole = **2-도메인 corroborated** (RealWorld +22 / ecommerce +8 실측).
- module-SCC = 2-도메인 검출 but 거칢 → 채택 시 honesty note 의무.
- iBATIS2 sqlMap·FE/TS·런타임 와이어링 = 사각 정직 carry (probe 가 ecommerce onlyArch 7건 = config/decorator 로 실증).
- inventory I = corroboration 실측 후 판정.

## 6. 미해결 (research 로 규명)
- codegraph 공식문서: module-dep/SCC/cycle 내장 출력 有無? metadata.confidence/resolvedBy/provenance 정확 의미 (STEP 2 의 "null=미해소" 해석 재검증 — 본 probe 는 null=AST직접·100%해소로 관측).
- 업계(madge/dependency-cruiser/ArchUnit/NDepend/Structure101): import vs call 그래프 module-cycle 검출법 / SCC 보고 형식(전체 blob vs 개별 path) / layer-violation 검출 / FP율.
- Senior: Fork-1/2/3 적대 검증 + must-fix + §8.1 컷.

## 7. Lessons (STEP 1·2 상속)
- 진입점 메모/초안 = 실측으로 반증 가능 (STEP 1·2 모두 핸드오프 사실 반증). probe 우선.
- 범위 칼날: 11→2, 5→2 동형. STEP 3 도 coverage-hole 코어로 좁힐 것.
- CRLF: node byte-preserving 편집 / LF 파일 (feedback_edit_tool_crlf_windows).

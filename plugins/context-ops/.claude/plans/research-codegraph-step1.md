# research — codegraph STEP 1 (coverage-hole 공통 메커니즘)

> 4원칙 §2 산출물. 3-에이전트 병렬 토론(공식문서 / 테크기업 사례 / Senior 적대 검토) 결과.
> 선행 §1(깊은 숙지) = 6-에이전트 investigation (wf_6c311fd9). 본 문서는 그 위에 쌓은 research.

## 0. 조사·연구 출처

- investigation 6-agent (codegraph-output / existing-integration / finding-system / target-schemas / stack-gate / tooling-conventions). 각 agent file:line 물증.
- research 3-agent: `_base-official-docs-checker` (codegraph npm/GitHub raw src + 로컬 federator) / `_base-industry-case-researcher` (Specmatic·swagger-coverage·dependency-cruiser·knip·ArchUnit) / `_base-senior-engineer` (no-simulation 실 `.codegraph` DB 직접 쿼리).

## 1. 핸드오프 "사실" 2건 반증 (Senior + official-docs / 실측 우선)

내가 investigation 으로 grounding 에 넣었던 2개 "VERIFIED FACT" 가 **실측으로 틀린 것으로 판명**. 정직 정정:

| 핸드오프 주장                                | 반증                                                                                                                                                                                                                                 | 물증                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| route 노드에 HTTP verb 미저장                | ❌ **verb 저장됨**. route node `name` = `"GET /articles/{slug}"` (Spring) / `"POST /login"` (NestJS). `name.split(' ')[0]` 로 복구. → openapi axis 가 DEC 의 `△` 보다 강함                                                           | Senior: 실 `.codegraph/codegraph.db` SELECT / official-docs: codegraph src `name: ${method.toUpperCase()} ${routePath}` |
| ecommerce NestJS/TS = codegraph 미검증(risk) | ❌ **이미 실 인덱스 존재**. ecommerce `.codegraph` = 721 노드(route:30/method:189/class:66/interface:1/type_alias:4). 두 §8.1 도메인 모두 오늘 쿼리 가능. risk 는 좁음(TS interface 열거 빈약=1, NestJS route↔OpenAPI 완전성 미입증) | Senior: `_dogfood-ecommerce/ecommerce-backend/src/.codegraph/codegraph.db` live nodes_by_kind                           |

> 교훈(memory `feedback_senior_fact_check_supplement` 역방향): Senior 가 실 DB 측정으로 main 의 추론을 교정. plan/DEC 에 이 정정 반영 의무.

## 2. 핵심 기술 쟁점 해결 — 전체 노드 열거 메커니즘

코드 엔티티(route/method/interface 전수)를 어떻게 꺼내나? (`code-graph.json` = 통계만, 노드 목록 無)

- ✅ **정답 = SQLite 직접 읽기**: `SELECT name, kind, file_path, start_line, signature FROM nodes WHERE kind = ?`. codegraph 내부 `getNodesByKind()` 와 동형(LIMIT 없음). federator 가 이미 `symbolsInFile` 에서 `node:sqlite` (readOnly) + `dbPath = join(cgDir,'.codegraph','codegraph.db')` 로 동일 패턴 사용(federator.js:31,464,476-488). → `enumerateNodes(kind)` 를 같은 adapter 패턴으로 추가.
- ❌ **CLI 경로 회피**: `codegraph query "" --kind route --json` 은 `searchAllByFilters` 로 빠져 `LIMIT = limit*5`(기본 50) cap → 50개 초과 코드베이스는 **조용히 불완전**. (official-docs 가 raw `src/db/queries.ts` 로 확인.)
- `nodes` 테이블 컬럼: id, kind, name, qualified_name, file_path, language, start_line, end_line, signature, decorators, is_exported, is_async, is_static, is_abstract, visibility, updated_at.
- ⚠ **schema 결합 risk**(이미 federator.js:475 carry 로 명시): codegraph 내부 schema = public API 아님. 버전 업 시 컬럼 rename 가능. 완화 = `PRAGMA table_info(nodes)` 컬럼 probe 후 불일치 시 `{available:false, reason:'schema-mismatch'}` graceful. `node:sqlite` = Node≥22.13 (v12.0.1 확정).

## 3. 테크기업 사례 (전이 패턴) — industry GO@0.85

| 도구                          | 메커니즘                                                                                                                                                                                      | STEP 1 전이                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Specmatic** (Java/Spring)   | 런타임 `/actuator/mappings` route 전수 ↔ OpenAPI 교차. 2 버킷: `Missing In Spec`(코드有 계약無) / `Not Implemented`(계약有 코드無). framework route(/health)는 **exclusion array**(억제 아님) | 2-버킷 모델 그대로: `code_not_in_spec`(medium) vs `spec_not_in_code`(stale anchor=federator codeRefForAnchor 기존). 방향 분리 |
| **swagger-coverage**          | 런타임 트래픽 캡쳐 → full/partial/empty 3-state. report-only(기본 non-block)                                                                                                                  | non-blocking 기본 = 업계 표준                                                                                                 |
| **dependency-cruiser orphan** | static 그래프 set-minus. severity **기본 `warn`**(never error)                                                                                                                                | set-minus 비차단 선례                                                                                                         |
| **knip** (TS)                 | files − (entry + reachable). dynamic import 은 **config 로 명시 제외**(undetectable 가시화)                                                                                                   | "undetectable" = 억제 아닌 **별도 버킷**                                                                                      |
| **ArchUnit**                  | class별 method-name set-diff, `missing: [methodA,methodB]` per-entity 보고                                                                                                                    | entity 단위 hole + rollup count (집계% 만 ❌)                                                                                 |

**공통 결론**: ① 모든 성숙 도구가 enumerate→set-minus→bucket 3-step ② framework/dynamic/generated = **명시 제외 목록 or undetectable 버킷**(조용한 억제 ❌) ③ 최초 도입 non-blocking 기본.

## 4. Senior 적대 검토 — REVISE@0.82 (핵심)

1. **범위 = 11 deliverable 은 overreach (§8.1 위반)**. route+method 만 두 live DB 로 입증됨. db-schema(table-blind)·business-rules(semantic)·characterization(iBATIS2 sql_id=0)·antipatterns(semantic) = 0~1 도메인 증거 → 9개를 STEP 1 에 넣으면 단일 PoC 과적합. **2-axis 최소 코어 ship, 9 carry.**
2. **detectability matrix = per-(axis × stack)** 가 맞음. "Modern only" blunt gate 는 틀림 — route/method/interface/class axis 는 legacy Spring 4.1 도 작동(PoC#15=551 route). **SQL/mapper axis 만 iBATIS2-blind, table axis 만 보편 blind.** 3-state: detectable / undetectable / unverified. inventory.json `stack.backend.orm[]` + languages 로 gate.
3. **아키텍처 = standalone `tools/codegraph-coverage/` 순수 formatter**. per-deliverable 로직 ❌ / chain-driver 서브커맨드 ❌. `diffGraphs`(Map O(1) set-diff) 재사용 ✅ / `buildTraceView`(reachability) 재사용 ❌(잘못된 primitive). 출력 = `code-coverage-hole.json` + 비차단 finding. **deliverable 본문에 주입 ❌**(§2 trust 위반).
4. **method 노드 noise 실측**: RealWorld method 표본에 `serialize/isEmpty/main/realWorldModules`(Jackson/부트스트랩/lombok). 무필터 set-diff = 가짜 hole 수십개. `DROP_NODE_KINDS`(federator.js:36) 확장 + name/visibility 필터(getter/setter/equals/hashCode/toString/serialize/main/<init> skip, non-public skip). route hole=medium / method hole=low.
5. **trust check34** = check31/33 clone (gate 모듈 coverage 토큰 0 + reference_lens:true) **+ severity ceiling 강제**(low|medium 만 / high·critical 경로 부재 assert). §2 "gate blocker 아님" 이 현재 prose-only → findings-aggregator 가 high/critical 만 차단하므로 mis-severity 1건이 곧 gate 입력 = leak. 코드로 ceiling 강제 의무.
6. **freshness 배너**(v12.1.0 `checkGraphFreshness` 패턴): codegraph DB = 시점 인덱스. stale 시 사라진 코드에 hole 보고 / 신규 코드 누락 = false-health. 배너 의무.

## 5. 합의 설계 (3-agent 수렴)

- enumerate = SQLite `enumerateNodes(kind)` (federator adapter 패턴 재사용 / CLI 회피).
- set-diff = `diffGraphs` Map primitive 재사용.
- 출력 = standalone `tools/codegraph-coverage/` → `code-coverage-hole.json` + 비차단 finding (severity low|medium 만).
- 방향 = **code→artifact 만**(direction 1). artifact→code stale-anchor(direction 2)는 federator `codeRefForAnchor` 가 이미 함 → 재구현 ❌.
- 2-버킷 + undetectable 버킷(Specmatic/knip). framework route exclusion list(/actuator,/error,/swagger-ui). path-param 정규화.
- detectability matrix per-(axis×stack), gate=inventory.orm[]+languages.
- §8.1 = RealWorld(Spring+MyBatis3) + ecommerce(NestJS+Prisma) **둘 다 기존 .codegraph DB 실재** → route/method axis 2-도메인 corroboration. interface/sql/table axis = carry.
- check34 trust guard + freshness 배너 + version 3-way.

## 6. 미해결/정직 carry

- NestJS route↔OpenAPI 완전성, TS interface 열거 빈약(=1) → interface axis carry.
- codegraph schema 결합 = PRAGMA probe 완화, 잔여 carry.
- HTTP verb-in-name = Spring/NestJS 실 DB 2건 확인. 타 framework(FastAPI/Flask/Rails) 미검증 carry.
- 9 deliverable(db-schema/business-rules/antipatterns/characterization-sql/artifact-graph orphan 등) = STEP 1 범위 밖, DEC 로드맵 STEP 2~6 으로 honest 재배정.

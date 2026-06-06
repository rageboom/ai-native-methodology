# plan — codegraph wiring STEP 1 (coverage-hole 공통 메커니즘)

> 4원칙 §1 산출물. SSOT 로드맵 = `decisions/DEC-2026-06-03-codegraph-deliverable-wiring.md` §5 STEP 1.
> research = `research-codegraph-step1.md`. **승인 전 코드 착수 ❌**(4원칙 §3).

## 1. 목표 (DEC §5 STEP 1)

codegraph 가 코드 엔티티(route/method/interface)를 **전수 열거 → 산출물 code-ref 와 set-diff → "코드有 산출물無" coverage-hole** 을 **비차단 finding** 으로 산출. trust 경계(reference-lens / gate inject ❌) 절대 유지. Modern/verified 스택만 hole 보고, blind 셀은 "검출불가" 정직 표기(false positive 회피).

## 2. research 가 바꾼 것 (DEC 초안 대비 정정)

1. **route 노드 verb 저장됨**(실측) → openapi axis 가 DEC `△` 보다 강함. path+method 직접 매칭.
2. **ecommerce .codegraph 실재**(721노드) → §8.1 2-도메인 corroboration 을 기존 인덱스로 즉시 가능(신규 probe 불요 / route·method axis 한정).
3. **범위 = 11 → 2-axis 최소 코어** (Senior §8.1: route+method 만 2-도메인 입증, 나머지 9 = 과적합). DEC 11 deliverable 은 **2 axis 가 동시에 커버하는 ref 집합**으로 재해석:
   - route axis ⊃ openapi·acceptance-criteria(openapi_path)·discovery-spec·behavior·characterization(endpoint)
   - method/symbol axis ⊃ impl-spec(source_files/ast_symbol)·test-spec(code_under_test)·behavior/AC(code_pointers)
   - **carry(9 deliverable의 약축)**: db-schema(table-blind)·business-rules(semantic)·antipatterns(semantic)·characterization(sql_id=iBATIS2 blind)·artifact-graph(code→requirement orphan=dep-graph 소관).

## 3. 아키텍처 (Senior 합의)

```
tools/codegraph-coverage/            # 신규 standalone 도구 (28번째 workspace)
  src/
    cli.js          # parseArgs→cmdXyz / stdout-only / exit 0·1·2·3 (chain-driver 패턴)
    enumerate.js    # SQLite nodes 테이블 enumerateNodes(kind) — federator adapter 패턴 재사용
    detect.js       # detectability matrix {axis×stack}→detectable|undetectable|unverified
    coverage.js     # 순수: buildCoverage(codeEntities, deliverableRefs, matrix) → holes/undetectable/stats
    render.js       # 순수: renderMarkdown / toFindings (severity low|medium ceiling)
    filters.js      # route exclusion(/actuator,/error,/swagger-ui) + path 정규화 + method noise skip
  test/
    *.test.js       # node:test + node:assert/strict (fixture + 실 cli spawn)
  package.json      # scripts.test='node --test test/*.test.js' / bin
```

- **enumerate**: `node:sqlite` readOnly, `.codegraph/codegraph.db` `SELECT ... FROM nodes WHERE kind=?`. `PRAGMA table_info(nodes)` 컬럼 probe → 불일치 graceful `{available:false}`. 환경부재(DB無/Node<22.13) = exit 3 정직 신호(persona ❌).
- **set-diff**: `diffGraphs`(traceability-matrix-builder/renderers/diff-view.js) Map primitive 재사용. `buildTraceView` 재사용 ❌.
- **출력**: `code-coverage-hole.json`(reference-lens 산출물 / 신규 schema) + 비차단 finding. deliverable 본문 주입 ❌.

## 4. detectability matrix (false-positive 핵심)

| axis \ stack  | Spring-legacy(iBATIS2)     | Spring-modern(MyBatis3) | JPA     | NestJS-TS              | FE             |
| ------------- | -------------------------- | ----------------------- | ------- | ---------------------- | -------------- |
| route         | ✅ detectable              | ✅                      | ✅      | ⚠ unverified(완전성)   | — undetectable |
| method/symbol | ✅                         | ✅                      | ✅      | ⚠ unverified           | —              |
| interface     | ✅                         | ✅                      | ✅      | ✗ undetectable(thin=1) | —              |
| sql/mapper    | ✗ undetectable(=0)         | (carry)                 | (carry) | —                      | —              |
| db-table      | ✗ undetectable(보편 blind) | ✗                       | ✗       | ✗                      | —              |

- gate 입력 = `inventory.json` `stack.backend.orm[]`(name) + `languages`. Modern flag 아님.
- **detectable** 셀만 per-entity hole. **undetectable/unverified** 셀은 per-entity hole ❌ → "이 axis 는 이 스택에서 분석 불가(이유)" 1줄 note 만(억제 ❌ / Specmatic·knip 패턴).
- route exclusion list: `/actuator/**` `/error` `/swagger-ui/**` `/v3/api-docs` + dynamic(`${}`/SpEL/비literal)=undetectable.
- method noise skip: kind∈{file,import,field,variable,constant,namespace} + name∈{getX,setX,equals,hashCode,toString,serialize,main,<init>} + non-public/synthetic. route hole=medium / method hole=low.

## 5. trust 회귀 가드

- **release-readiness check34**(check31/33 clone): ① gate 모듈(gate-eval.js + findings-aggregator/{aggregator,cli}.js)에 coverage 토큰(`enumerateNodes`/`coverage-hole`/`codegraph-coverage`) 0 (정밀 import 매칭) ② `code-coverage-hole.json` reference_lens:true ③ **severity ceiling 강제**(emitter 에 high/critical 경로 부재 assert — §2 invariant 를 prose→코드). RR 33→34.
- finding severity = low|medium **만**(코드 강제 + check34 assert). findings-aggregator 가 high/critical 만 차단 → ceiling 으로 gate leak 차단.
- **freshness 배너**(`tools/_shared/graph-freshness.js` `checkGraphFreshness` 재사용): `.codegraph` mtime < source mtime = STALE 경고. display-only.

## 6. §8.1 정합 / no-simulation

- 2 distinct 도메인 실 codegraph corroboration: **RealWorld**(Spring Boot+MyBatis3 / `_dogfood-realworld`) + **ecommerce**(NestJS+Prisma / `_dogfood-ecommerce`). 둘 다 `.codegraph` DB 실재 → route·method axis 실 enumerate+set-diff 실측.
- interface/sql/table axis = 2-도메인 미충족 → **carry 정직 표기**(STEP 2~6).
- no-simulation: 실 SQLite 읽기 + 실 finding. persona ❌ / 환경부재 exit 3.

## 7. 시행 순서 (승인 후)

1. `enumerate.js` + `PRAGMA` probe + test (RealWorld/ecommerce DB 실 read).
2. `detect.js` matrix + `filters.js` (exclusion/normalize/noise) + test.
3. `coverage.js` 순수 buildCoverage + `render.js` toFindings(ceiling) + test.
4. `cli.js` + package.json (workspace 등록) + 실 cli spawn test.
5. `schemas/code-coverage-hole.schema.json`(top-level additionalProperties:false) + schema-validator 등록.
6. 2-도메인 dogfood 실측(RealWorld+ecommerce) — 실 hole/undetectable 산출 확인.
7. check34 + freshness 배너 + version 3-way + CHANGELOG + DEC entry + memory.
8. workspace 전체 test + release-readiness 34/34.

## 8. carry / 리스크

- codegraph schema 결합(PRAGMA 완화, 잔여 carry) / node:sqlite Node≥22.13.
- HTTP verb-in-name = Spring·NestJS 2건 확인 / 타 framework carry.
- 9 deliverable 약축 = STEP 2~6 honest 재배정.
- NestJS route↔OpenAPI 완전성·TS interface(=1) = unverified carry.

## 9. 승인 필요 결정 (4원칙 §3 / 일괄)

→ 사용자 결정 후 §7 착수. (AskUserQuestion 으로 묶음 제시.)

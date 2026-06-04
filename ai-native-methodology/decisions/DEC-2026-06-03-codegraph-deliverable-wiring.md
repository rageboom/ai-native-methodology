# DEC-2026-06-03-codegraph-deliverable-wiring

**결단**: codegraph(이미 필수 도구로 인덱싱되나 어떤 산출물 추출에도 미배선)를 **trust 경계(gate inject ❌) 안에서** 산출물 생성에 기여시키는 지점을 **36개 전 산출물 전수**로 4-렌즈(대치/개선/추가/신규) 분석하고, ROI·저위험 순 순차 적용 로드맵을 확정. **release ❌ / 구현 ❌ / 코드·스키마 무변경** — 본 DEC + INDEX entry + memory 박제만. **구현(STEP 1+)은 다음 세션 4원칙 carry.**

**작성일**: 2026-06-03 (분석 = 36-agent workflow `wf_58c58583` + 사전 15-agent `wf_7139c04b` / 대화 주도 설계).

**relates to**:

- `DEC-2026-05-28-codegraph-probe-결과.md` §4.2 (trust 모델 발원 — codegraph 자기원칙 "graph provides context, not requirements")
- `DEC-2026-05-30-codegraph-essential.md` (codegraph 필수 도구 격상)
- `DEC-2026-06-02-context-federation.md` (dep×codegraph federation — codegraph 통합이 *이미 일부 실현*된 곳)
- `~/.claude/plans/trust-valiant-pretzel.md` (작업 사본 / 본 DEC 가 레포 SSOT)

---

## 1. 배경 / 출발 질문

사용자 대화가 dep-graph 산출물 → 탐색 알고리즘 → codegraph 동작 원리 → "함수 변경 영향 추적" → trust 경계(gate inject 금지) → "코드 관련 산출물에 codegraph 기여 지점" 으로 수렴. codegraph 는 v11.8.0 에서 필수 도구로 격상돼 매 analysis 에 인덱싱(`code-graph.json`)되지만 **business-rules·architecture 등 핵심 추출 어디에도 reading-aid 로조차 배선 안 됨**(finding 등재 외 인덱싱 비용 미회수) = 비대칭 gap. 이를 36 산출물 전수로 정량.

## 2. Trust 경계 불변식 (절대 / 모든 적용에 적용)

- codegraph 출력 = **reference-lens**. 결정적 validator(schema / drift / decision-table / spectral / gate-eval / coverage / negative-space) **판정 입력 inject 금지**.
- 허용 채널 3종: **reading-aid**(최종 evidence=실코드 grep) / **finding**(cycle·leak·orphan, gate blocker 아님) / **coverage-hole**(코드엔 route/method 있는데 산출물 누락).
- codegraph = **결정적이지만 불완전**(비결정 아님). 강점: Java/Spring route·DI·interface, MyBatis3 mapper, JPA derived query. **사각: iBATIS2 sqlMap=0( 주 타깃 S2!), Java↔SQL 경계, DB table 경계, 런타임 와이어링(Spring XML bean·AOP·reflection DI), 동적 라우팅, FE/TS 미검증.**

## 3. 전 산출물 36 × 4-렌즈 (Part A / 그룹 dismiss 없음 / 개별 verdict)

> R=대치(메커니즘 교체) I=개선(품질보조) A=추가(새 필드) N=신규(새 산출물).

### overall=HIGH (3)

| 산출물            | R                                                                                                                   | I                                                             | A                                           | N                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------- |
| **architecture**  | ✅ 모듈 의존그래프·cycle (현 LLM "19건 sampling+추론(E)" → codegraph 전수 / **"결정적 0.98" 표기를 비로소 진실로**) | 높음: dependency coverage·weight·SCC 재현·layer위반 후보      | dependencies detail·SCC evidence            | cross-domain coupling(code-graph.json 중복→사실상✗)                          |
| **openapi-api**   | △ endpoint 인벤토리(route 노드)                                                                                     | 높음: endpoint 누락탐지·controller anchor 검증·auth grounding | operation `code_graph_ref`                  | endpoint coverage-hole(spectral 이 못 보는 "코드有 계약無")                  |
| **context-cache** | ✗ (codegraph 가 _이미_ code 절반 생산)                                                                              | 高: callees·implements/DI 노출·역방향 coverage-hole·해소율    | callees/edges/code_coverage_holes/data×code | code-structure-graph 영속화(§8.1 DEFER). ** 통합이 유일하게 이미 실현된 곳** |

### overall=MEDIUM (10)

| 산출물                        | 핵심 verdict                                                                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **inventory**                 | R✗ / I medium stack·orm·architecture evidence corroborate / A modules centrality·tier evidence / N✗(code-graph.json 커버)                                                                                                                                                                        |
| **domain**                    | R✗(부분 Repo interface↔impl) / I Anemic·Aggregate과잉·orphan-repo finding / A coverage-hole(@Entity 누락) / N✗                                                                                                                                                                                   |
| **business-rules**            | R✗(semantic) / I medium(Modern) auth/route coverage-hole·anchor 검증 / A source_evidence node_id·related_api 교차 / N low 정책분기 후보(finding)                                                                                                                                                 |
| **error-mapping-spec**        | R✗ / I medium(Spring한정) handler↔exception 연결·throw 도달 / A low / N✗. NestJS=none                                                                                                                                                                                                            |
| **antipatterns**              | R 부분(ARCH "AST분석" 표기를 *진짜 AST*로) / I ARCH 완전성·N+1 call-edge / A evidence pointer / N coverage-hole. DB/DOMAIN/SECURITY=none                                                                                                                                                         |
| **finding-list**              | R✗ / I evidence anchor·double_hit 2nd-hitter / A `code_graph_ref`+discoverer 'codegraph' / N ~~cycle/orphan/coverage-hole seed = sanctioned 채널 본체~~ **( §10 정정 — cycle/orphan = 실측 false-positive 압도 반증 → STEP 3+ carry / coverage-hole-as-finding + handler-set 만 v12.10.0 시행)** |
| **acceptance-criteria**       | R✗ / I medium layer=be `openapi_path`↔codegraph route 대조 / A AC.code_pointers suggested / N route coverage-hole _(medium 의외)_                                                                                                                                                                |
| **impl-spec**                 | R✗(runner SSOT) / I medium source_files 정확성·누락 협력파일 / A `ast_symbol` anchor(**함수단위**) / N orphan-impl coverage-hole(S2). NestJS/Java 실측 공백                                                                                                                                      |
| **artifact-graph(dep-graph)** | R✗(부분 implements/ast_symbol 심볼실재) / I stale-anchor 교차검증·navigate 코드 blast-radius(**federator 일부 구현**) / A✗(context-cache로) / N code→requirement orphan coverage-hole                                                                                                            |
| **code-graph.json**(meta)     | R✗(자기자신) / I self-coverage 인지(unindexed kind 노출) / A top_impact_roots·unresolved_anchors·edges_by_type / N code-coverage-hole.json                                                                                                                                                       |

### overall=LOW (21 — 전부 개별 명시)

| 산출물                      | 핵심 verdict + 이유                                                                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **db-schema**               | R✗ / I low ORM @Entity coverage cross-check / A low~med unused-table finding / N✗. **DB table 경계=정중앙 사각**                                                                                                             |
| **sql-inventory**           | R✗ / I medium(Modern only) called_from_screen caller chain / A med uc_link 후보 / N low. **주 corroboration이 iBATIS2=0**                                                                                                    |
| **formal-spec**             | 5하위: **sequence=medium~high**(Controller→Service→Repo call-chain) / state-machine=low / decision-table=**none**(DMN semantic+gate) / invariant·property-test=**none**(코드 생성). overall low=sequence만                   |
| **migration-cautions**      | R✗(semantic/judgment) / I low~med **api_surface fan-in(Modern only)** / A low / N✗. ** DB이관 본체(최대 그룹)=codegraph 0** _(Strangler 기대 하향)_                                                                          |
| **characterization-spec**   | R✗(intent vs bug=semantic) / I snapshot 앵커 reading-aid / A reference필드 / N route→snapshot coverage-hole. iBATIS2 sql_id=0                                                                                                |
| **type-spec**               | R✗(**ts-morph 우월=대치 역방향**) / I·A·N low~none. FE/TS 미검증                                                                                                                                                             |
| **ui-ux**                   | R✗ / I low 컴포넌트 트리 대조 / N✗. FE/TS 미검증                                                                                                                                                                             |
| **state-map**               | R✗ / I low store 심볼 / N✗. **runtime 상태 시맨틱**                                                                                                                                                                          |
| **form-validation-spec**    | R✗ / I class-validator+BE 1점 / N✗. **Zod/Yup `.min(8)` 인자값=none**                                                                                                                                                        |
| **legacy-spectrum**         | R✗ / I low Spring controller→view reading-aid / A low coverage-hole / N✗. FE/JSP 사각. **Strangler plan=semantic LLM** _(하향)_                                                                                              |
| **html-template-extract**   | R✗ / I low spring_endpoint_ref lookup / A low orphan/dangling action / N✗. JSP=비코드 심볼                                                                                                                                   |
| **i18n-spec**               | R✗ / I low orphan/unused-key coverage-hole / N✗. **key=string-literal 한계**                                                                                                                                                 |
| **discovery-spec**          | R✗(semantic) / I UC evidence anchor·actor / A route coverage-hole·dead-UC finding / N route-coverage-hole. figma/nl-md=none                                                                                                  |
| **behavior-spec**           | R✗ / I medium **분해누락 coverage-hole** / A low~med BHV→symbol 후보 / N✗(finding으로)                                                                                                                                       |
| **task-plan**               | R✗ / I integration_points·dependency 추론 reading-aid(Modern) / A cycle/orphan finding·node_id / N plan↔code coverage-hole(**OP-\* 발굴**). 미래코드 시점불일치                                                              |
| **test-spec**               | R✗ / I low callees=mock 힌트·impact-driven 재실행 / A low~med `code_under_test` / N production symbol 미검증 coverage-hole                                                                                                   |
| **traceability-matrix**     | R✗(**직교축**: UC/BHV/AC는 코드에 없음) / I low~med leaf 실재성·dead-code green cell finding / N low code→산출물 미커버. builder는 코드 0줄 read                                                                             |
| **plan-org(EPIC/STORY/OP)** | R✗ / I low OP code_pointers BE-Java refactor reading-aid / A OP ripple finding / N✗. EPIC/STORY=semantic                                                                                                                     |
| **input-adapters**          | R✗(비코드) / I low entity명 매칭(legacy 동시존재시) / A low spec-only finding / N low~med input-vs-code coverage(legacy 한정). **greenfield=N/A**                                                                            |
| **infra-meta(10종)**        | 9종 none(state/intervention-log/meta-confidence/cycle-carry/intent-classification/ticket-sync-evidence/test-cmd 등) / **code-pointer=medium**(ast_symbol 검증·suggested_path) / adopter-corroboration·work-unit-manifest=low |

### overall=NONE (2)

| 산출물              | 이유                                                               |
| ------------------- | ------------------------------------------------------------------ |
| **visual-manifest** | 진실=런타임 픽셀 PNG/SHA·axe-core. AST 신호 부재. 4-렌즈 전부 ✗    |
| **a11y-spec**       | 진실=렌더 DOM 색대비·aria·focus(런타임). 정적 AST 원리상 도달 불가 |

## 4. 횡단 결론 (36 전수에서)

1. **coverage-hole이 압도적 단일 패턴** — 10+ 산출물에서 가장 깨끗한 N(신규). codegraph 가 내용 생성 없이 _전수 나열→set-diff_ 만 → trust 가장 안전 / 공통 메커니즘 1개로 다수 동시 적용.
2. **codegraph 통합 일부 이미 실현**(context-cache/dep-graph via context-federator) — 완전 신규 아닌 **증분**.
3. **finding 채널이 trust-축복 본체** = finding-list.
4. **architecture만이 진짜 R(대치)** — 현 "결정적 0.98" 표기가 실은 LLM sampling. ( §11 정정: "대치"=거짓 자기최면 → **"module dependency coverage-hole / 결정론 corroboration lens"**. arch.json 무수정 reference-lens 가 그 표기를 corroborate / Option B[직접 emit] reject.)
5. **iBATIS2(주 타깃 S2)=0 이 거의 모든 verdict 를 깎음** → high/medium 기여는 **Modern(Java/Spring/MyBatis3/JPA) 한정**. 사내 EFI-WEB·FE·DB경계·런타임와이어링은 정직히 none/low.
6. **교정**: migration-cautions·legacy-spectrum 의 "Strangler caller 맵 신규" = **과대평가였음** → 둘 다 LOW(semantic/judgment+FE/JSP). Strangler 는 Modern-Java 한정 finding 으로만 생존(독립 신규 아님).
7. **"decision-tree 같은거"**: codegraph 는 코드 _구조_ 트리(call/impact)는 만들지만 의미 _로직_ 트리(decision-tree/DMN)는 ✗(decision-table/business-rules=semantic).

## 5. 순차 적용 로드맵 (Part B / 36 전수 배정 — 누락 0)

| STEP                                                                                                                                                                                                      | 적용 산출물 (Part A)                                                                                                                                                                                  | 렌즈                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **STEP 1 coverage-hole 공통 메커니즘** [HIGH ROI·최저위험]                                                                                                                                                | openapi-api·discovery-spec·acceptance-criteria·behavior-spec·characterization·test-spec·impl-spec·artifact-graph·db-schema·antipatterns·business-rules **(11)**                                       | N                          |
| **STEP 2 finding 채널(codegraph→finding-list)** [sanctioned] ( §10 — 시행 시 2-mechanism 으로 축소: coverage-hole-as-finding + handler-set / cycle·orphan carry)                                          | finding-list·~~antipatterns·domain·error-mapping~~·artifact-graph **(초안 5 → 시행 1.5)**                                                                                                             | I/N                        |
| **STEP 3 architecture** [~~유일한 진짜 R / "대치"~~ → §11: **module dependency coverage-hole / 결정론 corroboration lens** (arch.json 무수정)] ( §11 — (a) 1축 시행 / inventory·SCC·layer = carry STEP4+) | architecture **(1)** ~~·inventory~~                                                                                                                                                                   | ~~R/I~~ → N(coverage-hole) |
| **STEP 4 impl/test ast_symbol 앵커** [함수단위 추적성]                                                                                                                                                    | impl-spec·test-spec·acceptance-criteria·behavior-spec·code-pointer·artifact-graph·traceability-matrix **(6)**                                                                                         | A                          |
| **STEP 5 context-cache 증분** [이미 실현된 통합 확장]                                                                                                                                                     | context-cache·code-graph.json **(2)**                                                                                                                                                                 | I/A                        |
| **STEP 6 (후속) Modern-scoped reading-aid**                                                                                                                                                               | sql-inventory·formal-spec›sequence·migration-cautions·task-plan·plan-org·input-adapters **(6)**                                                                                                       | I                          |
| **무행동/carry (적용 ❌)**                                                                                                                                                                                | NONE: visual-manifest·a11y / FE·semantic: type-spec·ui-ux·state-map·form-validation·i18n·static-security·legacy-spectrum·html-template / semantic: decision-table·invariant·property-test / infra 9종 | ❌                         |

→ **36 전 산출물 배정 완료 (누락 0 / STEP 간 중복 허용)**. STEP 우선순위 = ROI·저위험·trust-안전.

## 6. §8.1 정합 / 정직 경계

- 각 STEP = **≥2 distinct 도메인**(RealWorld Spring+MyBatis3 / ecommerce NestJS+Prisma) codegraph 실 실행 corroboration 후 본체 격상.
- **iBATIS2·FE/TS·NestJS BE 는 실측 공백 → carry 정직 표기**(probe = Java route·DI·MyBatis3·JPA 만 ⭐⭐⭐ 입증).
- 전 STEP trust 회귀가드: 적용 산출물 결정적 gate 코드에 codegraph 토큰 0 (release-readiness check 신설 / check31·check33 동형).
- no-simulation: 실 `codegraph index`/`callers·impact` (persona ❌ / 환경부재 exit 3).

## 7. 이번 세션 처분 / 다음 세션 진입점

- **이번 세션 = 문서화만** (release ❌ / 구현 ❌ / 코드·스키마 무변경). 본 DEC + INDEX entry + memory 박제.
- **다음 세션 진입점**: **STEP 1 (coverage-hole 공통 메커니즘 / Modern 스택-게이트)** 부터 4원칙(plan→3-agent research→사용자 승인→착수). RealWorld + ecommerce dogfood 로 ≥2 distinct 도메인 corroboration 후 본체 격상.

## 8. carry

- ~~C-codegraph-wiring-step1~~ **STEP 1 = v12.9.0 (§9)** / ~~C-codegraph-wiring-step2~~ **STEP 2 = v12.10.0 (§10)** / ~~C-codegraph-wiring-step3~~ **STEP 3 = v12.11.0 시행 완료 (§11 / "대치"→corroboration lens 개명 / (a) module dependency coverage-hole 1축 / SCC·layer·inventory = carry STEP4)** / C-codegraph-wiring-step4 ~ step6 (위 로드맵 잔여)
- iBATIS2·FE/TS·NestJS BE codegraph 실측 공백 (Modern 한정 정직 표기)
- coverage-hole false-positive 회피(런타임 와이어링·동적 라우팅 = "검출불가" 스택-게이트)
- Strangler caller 맵 = STEP 6 migration api_surface 흡수(독립 신규 아님 / 초안 하향)

---

## 9. STEP 1 시행 완료 (v12.9.0 MINOR / 2026-06-03 / 본 세션 — 로드맵 첫 슬라이스 release)

**§5 STEP 1 (coverage-hole 공통 메커니즘) 을 구현·dogfood·release.** 신규 도구 `tools/codegraph-coverage/` (28번째 workspace). 4원칙(plan-codegraph-step1 + research-codegraph-step1 → 6-agent investigation + 3-agent research → 사용자 승인). 본 DEC = SSOT (별도 구현 DEC 미생성 / 로드맵 owner 에 실행 로그 append).

### 9.1 범위 확정 — 11 → 2-axis 최소 코어 (Senior 적대 0.82 / §8.1 과적합 회피)

§5 초안의 "STEP 1 = 11 deliverable" 은 **overreach (§8.1 단일 PoC 과적합)** 으로 판정 → **route + method/symbol 2축**으로 축소. 단 2축이 사실상 openapi·discovery·AC·behavior·test·impl ref 를 동시 set-diff 대상으로 커버 = DEC "공통 메커니즘" 취지 유지. 나머지 9 deliverable 약축(db-schema=table-blind / business-rules·antipatterns=semantic / characterization-sql=iBATIS2-blind / artifact-graph orphan=dep-graph 소관) = STEP 2~6 carry.

### 9.2 research 가 §2~§4 핸드오프 2 사실 반증 (Senior no-simulation 실 `.codegraph` DB 직접 쿼리)

| §3 초안 표기                               | 반증 (실측)                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| (암묵) route 노드 verb 미보유              | ❌ route `name` = `"GET /articles/{slug}"`(Spring) / `"POST /login"`(NestJS) — **verb 보유** → openapi axis 가 §3 `△` 보다 강함 |
| ecommerce NestJS/TS codegraph 미검증(risk) | ❌ ecommerce `.codegraph` **실 인덱스 존재**(721노드 route:30/method:189) → §8.1 2-도메인 즉시 가능(route/method 한정)          |

### 9.3 설계 (3-agent 수렴)

- **enumerate = SQLite 직접 read** (`SELECT … FROM nodes WHERE kind=?` / `code-graph.json` = 통계만 노드목록 부재 / federator `symbolsInFile` adapter 패턴 동형 / CLI `query --kind` = LIMIT cap 50 회피 / PRAGMA `table_info` probe graceful / node:sqlite Node≥22.13).
- **set-diff 엔진** (coverage.js 순수): 엔티티 식별 키(path/file/symbol) 중 하나라도 산출물 ref 매칭 = covered, 아니면 hole. `diffGraphs`(artifact-graph 전용 형태) 대신 Map/Set O(1) 멤버십 패턴 차용.
- **detectability matrix** per-(axis×stack) 3-state(detectable/unverified/undetectable) — "Modern only" blunt gate ❌(route/method 는 legacy Spring 4.1 도 작동 / sql=iBATIS2-blind / table 보편 blind). detectable 셀만 per-entity hole, 나머지 = 정직 note(Specmatic·knip undetectable-bucket 선례).
- **method 의미성 게이트**: impl-spec 부재 시 unverified(test-spec=테스트파일·discovery/AC=요구사항 ≠ production-impl 전수 anchor → hole 폭증 회피).
- **false-positive 필터**: route exclusion(`/actuator`·`/error`·`/swagger-ui`)·dynamic route downgrade·path-param 정규화·method noise(ctor·getter·equals·serialize·main·lifecycle)·non-public(Java)·data-class 파일(`.dto.ts`·`.entity.ts`).
- ** trust ceiling 코드+구조 강제** (Senior must-fix / §2 invariant prose→코드): severity **low|medium 만**(route=medium·method=low). render.js `SEVERITY_CEILING=Object.freeze(['low','medium'])` + schema `severity` enum=`["low","medium"]` → findings-aggregator(차단등급만 gate-block) **gate leak 구조적 차단**. freshness 배너(DB mtime vs source / false-health 방지).
- **출력**: `code-coverage-hole.schema.json`(신규 / additionalProperties:false strict) 준수 reference-lens 리포트 + 비차단 finding. deliverable 본문 주입 ❌.

### 9.4 회귀 가드 — release-readiness check34

`codegraph_coverage_reference_lens_trust` (RR 33→34 / check31·33 동형 content-aware): ① gate-eval·findings-aggregator coverage 토큰 0 ② render.js ceiling 코드(상위등급 리터럴 0) ③ schema severity enum ⊆ {low,medium} ④ cli.js reference_lens:true.

### 9.5 §8.1 정직 경계 (no-simulation 실 dogfood / 2 distinct 도메인)

- **route axis = 2-도메인 corroborated** (RealWorld Spring Boot+MyBatis3 **0/19 hole** + ecommerce NestJS+Prisma **0/30 hole** = 완전 커버 true-negative / 메커니즘 입증).
- **method axis = ecommerce 1-도메인** (**4/64 hole** — `JwtExceptionHandler.handle`·`PrismaExceptionHandler.handle`·`PrismaService.enableShutdownHooks` 등 impl-spec 5 모듈 미커버 common/ 실 관찰) / RealWorld = impl-spec 부재 → unverified 정직(2nd full-density 도메인 carry).
- interface/sql/table axis = carry (STEP 2~6).

### 9.6 검증 / carry

- 검증(no-sim/실 CLI): codegraph-coverage test 28 + release-readiness self-test 34(check34 discrimination) + workspace 0 fail + RR **34/34** + version 3-way 12.9.0 + 2 도메인 실 dogfood schema-valid.
- carry: 9 deliverable 약축 STEP 2~6 · method axis 2nd full-density 도메인 · openapi.yaml verb-단위 직접 diff(YAML 파서 — 무의존성 유지로 JSON 산출물 경유) · NestJS route↔OpenAPI 완전성·TS interface(=1) unverified · codegraph schema 결합(PRAGMA 완화 잔여).

---

## 10. STEP 2 시행 완료 (v12.10.0 MINOR / 2026-06-04 / 로드맵 2번째 슬라이스)

**§5 STEP 2 (finding 채널 / codegraph→finding-list) 시행.** 4원칙 = `.claude/plans/{plan,research}-codegraph-step2.md` (workflow `wf_015e95b1-432` 7-agent: investigation 3 + official-docs/industry/Senior 0.80 + synthesis → 사용자 4-결단 gate #3 묶음 승인). 본 DEC = SSOT (별도 구현 DEC 미생성).

### 10.1 진입점 메모 'cycle·orphan seed' 실측 반증 (STEP 1 핸드오프 2사실 반증 선례 동형)

§3 finding-list 행(line 44) + 진입점 메모가 'cycle/orphan/coverage-hole seed = sanctioned 채널 본체' 로 적었으나, **양 도메인 실 `.codegraph` DB 직접 쿼리 결과 cycle/orphan = false-positive 압도** → 반증:

| 메모/초안                         | 반증 (no-sim 실측 + 공식문서 + 업계)                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cycle/orphan seed = 본체          | ❌ orphan(non-contains in-edge 0): RealWorld method 178/class 87, ecommerce method 109/class 16. **필터 후에도 RealWorld 51~75 / ecommerce 23~29 survivor 전부 live** (@DgsComponent GraphQL·JUnit @Test·DI 주입 service 메서드). cycle: self-call=정상 재귀/lifecycle, SCC=sibling wrapper. 근본원인=call provenance 미해소(RealWorld 519/590 null). → in-degree 0 → dead 단정 = no-simulation 위배. |
| codegraph 가 cycle/dead-code 내장 | ❌ official-docs(@colbymchenry/codegraph): cycle/orphan/SCC/dead-code 내장 CLI **부재** / synthesized edge = `provenance:'heuristic'` 명시.                                                                                                                                                                                                                                                           |
| graph-finding = gate-blocker 가능 | ❌ 업계 6도구(dependency-cruiser circular=warn / knip --no-exit-code / NDepend /ForceReturnZeroExitCode / SonarQube cycle=code smell / ArchUnit FreezingArchRule / shipmonk advisory) 만장일치 = advisory.                                                                                                                                                                                            |

### 10.2 시행 범위 — 5 산출물 초안 → 2-mechanism 최소 코어 (Senior 0.80 / §8.1 과적합 회피 / STEP 1 11→2 칼날 동형)

1. **coverage-hole → finding-system promote-ready export** (`finding-export.js` 신규 / `--emit-findings`): STEP 1 F-CGCOV → finding-system shape (`discoverer:'codegraph'` + `code_graph_ref` + `status:'candidate'`). **decision (c)** — finding_id 미부여(사람 promote 시 F-XXX 배정 / 자동 ledger emit ❌ / seed_id 추적). 신규 seed 계산 0.
2. **finding-system.schema.json `code_graph_ref` optional additive + allOf conditional**(code_graph_ref ⟹ severity ⊆ {low,medium}) — STEP 1 enum-cut ceiling 이식. discoverer 자유텍스트 'codegraph'(enum 격상 ❌ = 권위 누출 / 사용자 결단). 회귀 0(실 Ajv 3-fixture).
3. (보조) **handler-set reading-aid** (`enumerateEdges` implements/extends): error-mapping 보조 / ecommerce 1-도메인 정직표기(handler-relevant 태깅 / RealWorld test-base noise 필터) / http_status·mechanism=semantic carry.

cycle·orphan = STEP 3+ carry (사용자 결단 "전면 carry").

### 10.3 trust 경계 + 회귀 가드 check35

- codegraph finding 은 `REQUIRED_VALIDATORS_PER_STAGE` 미등록(findings-aggregator=validator 출력만 count) + severity ceiling low|medium + finding-export/enumerate gate-import 0 → gate 누출 구조 차단.
- **check35** `codegraph_finding_reference_lens_trust` (release-readiness 34→35 / check34 4-part isomorphic): ① gate 모듈 STEP 2 토큰 0 ② schema code_graph_ref⟹severity conditional ③ finding-export ceiling(상위등급 리터럴 0) ④ finding-export·enumerate gate-import 0.

### 10.4 검증 / carry

- 검증(no-sim/실 CLI): codegraph-coverage test 28→48 + workspace **1164/0** + release-readiness **35/35**(self-test 19/19) + version 3-way 12.10.0 + 2 도메인 실 dogfood `--emit-findings`(RealWorld seeds 0+handler-set / ecommerce seeds 4+handler-set). 실 Ajv conditional 3-fixture(medium valid / high INVALID / no-ref-high valid = 회귀 0).
- carry(STEP 3+): cycle·orphan(call-graph provenance 개선 후) · error-mapping http_status/mechanism(semantic) · handler-set 2nd Spring 도메인 · domain orphan-repo(semantic) · antipatterns ARCH cycle(detected_by enum) · artifact-graph code→requirement orphan(직교/dep-graph inject 절대 금지) · F-CGCOV↔F-XXX promote 번호정책.

---

## 11. STEP 3 시행 완료 (v12.11.0 MINOR / 2026-06-04 / 로드맵 3번째 슬라이스)

**§5 STEP 3 (architecture / 4-렌즈 분석의 "유일한 진짜 R") 시행.** 4원칙 = `.claude/plans/{plan,research}-codegraph-step3.md` (workflow `wf_b66c8b85-e4a` 4-agent: official-docs / industry / Senior 적대 0.85 REVISE / synthesis → 사용자 gate #3 3-결단 승인). 본 DEC = SSOT.

### 11.1 "대치" 라벨 정정 (Senior must-fix#1 / 3-결과 만장일치 / §3 line 32·85 + §4-4 + §5 STEP 3 + §8 라벨 폐기)

§3·§4·§5 가 architecture 를 **"유일한 진짜 R(대치)"** 로 적었으나 = **"거짓 자기최면"** (Senior). 정정:

- "대치" = arch.json 을 codegraph 가 **덮어쓰는** 게 아니다 → **"module dependency coverage-hole / 결정론 corroboration lens"** 로 개명.
- arch.json 의 determinism 표기(`detection.algorithm:'tarjan_scc'` / weight)를 진실로 만드는 일 = arch.json 덮어쓰기가 아니라 **codegraph 결정론 cross-file edge 로 그 표기를 corroborate + LLM 놓친 의존(coverage-hole)을 노출**하는 reference-lens (STEP 1·2 동형 / arch.json 무수정 / SKILL codegraph 호출 0).
- Option B(SKILL 이 dependencies[] 직접 emit) **reject**: reference-lens→authoritative 전환 = check34/35 동형 가드 적용불가(trust 경계 붕괴) + ecommerce onlyArch 7건(런타임 DI/decorator 사각) 소실로 LLM 근사(conf 0.9)보다 **퇴화** + greenfield/iBATIS2/FE graceful 분기 폭증 + 결정론 dogfood 불가.

### 11.2 시행 범위 — (a) dependency coverage-hole 1축 단독 (Senior must-fix#2 / STEP1 11→2·STEP2 5→2 칼날)

- 신규 `tools/codegraph-coverage/src/module-graph.js` (순수): codegraph cross-file edge(`calls/references/instantiates/extends/implements` / source.file≠target.file 둘다 내부 / **imports edge 제외** = target placeholder 실측·industry 정합) → architecture.json modules[] file→module rollup(`fileInModule` src-prefix suffix-tolerant / normalize.js 재사용) → module→module 그래프 → arch.json dependencies[] set-diff.
- `coverage.js` buildModuleAxis(arch.json modules[] 부재=unverified / method-axis 게이트 동형) + `cli.js` module axis(기본 axes += module / `enumerateEdges` 재사용) + `render.js` module 섹션 + `finding-export.js` AXIS_PHASE/SPEC_GAP module 추가(phase=architecture).
- **(b)module-SCC·(c)layer-violation·(d)inventory = CUT→carry STEP4+**: (b) 7-모듈 blob over-claim(업계=개별 cycle path / ArchUnit Issue#361) + path-format 민감 + STEP2 call-cycle carry 함정 동형 / (c) module layer=LLM 비결정 입력(schema modules[].layer required·결정성마커 부재)→codegraph(결정)×layer(비결정) 혼합 trust 오염 / (d) inventory=detect.js classifyStack 중복 + centrality=gold-plating.

### 11.3 onlyArch(codegraph 사각) 구조적 절단 (Senior must-fix#3 / 3중 강제 / industry FP#6 corroborate)

arch.json有/codegraph無 의존 = codegraph 정직 사각(런타임 DI/decorator/config 와이어링). 부재 ≠ 거짓 → **`informational_notes[]`로 데이터 격리**: ① schema `moduleAxis.informational_notes.items` **severity 필드 부재 + additionalProperties:false**(구조적 promote 불가) ② `toFindings`/`toPromoteReadyFindings` **holes 만 순회**(onlyArch 도달 불가) ③ check36 가드. "not a defect / 부재≠거짓" 명시. ecommerce onlyArch 7건 전부 →MOD-CONFIG·MOD-COMMON = hole 보고 시 거짓양성 즉시 over-claim.

### 11.4 trust 가드 check36 (RR 35→36 / check34·35 4-part isomorphic)

`codegraph_module_reference_lens_trust`: ① gate-eval/findings-aggregator module-axis 토큰 0 ② schema informational_notes severity 부재 ③ module-graph.js high/critical 리터럴 0 + render.js 'not a defect/부재' 마커 ④ module-graph.js gate 모듈 import 0. severity ceiling low|medium(SEVERITY_CEILING/pinSeverity 재사용 / module hole=low).

### 11.5 검증 / carry

- 검증(no-sim/실 CLI / 2 distinct 도메인): module axis **RealWorld(Spring+MyBatis3) module 43/corroborated 21/hole +22/info 0** + **ecommerce(NestJS+Prisma) module 16/corroborated 8/hole +8/info 7** (동일 코드경로 재현 §8.1 / must-fix#4) + 실 Ajv schema-valid + finding-system conditional(module low+code_graph_ref valid / high INVALID). codegraph-coverage test 48→64(module-graph 16) + workspace **1180/0** + release-readiness **36/36**(self-test 20/20) + version 3-way 12.11.0 + build dist v12.11.0.
- official-docs(F-015): codegraph module-dep/SCC/circular 내장 CLI 부재 confirmed(JS API findCircularDependencies 존재하나 CLI/MCP 미노출) / provenance=null 은 'tree-sitter' 명시생략(공식값 아님 / resolvedBy·confidence=Edge 인터페이스 부재) — STEP 3 코드는 provenance/resolvedBy/confidence 미사용(cross-file edge 존재만) → 무영향.
- carry(STEP 4+): (b)module-SCC cycle · (c)layer-violation(module layer LLM 비결정) · (d)inventory corroboration·centrality · onlyArch DI vs config 의미 분류(semantic) · module-axis 2nd full-density 도메인(arch.json modules[] 부재=unverified) · STEP1 carry 유지(iBATIS2 sql-blind / table-blind / NestJS route↔OpenAPI / TS interface=1 unverified) · STEP 5~6(openapi/context-cache HIGH 등 4-렌즈 로드맵 잔여).

---

## 12. STEP 4 시행 완료 (v12.12.0 MINOR / 2026-06-04 / 로드맵 4번째 슬라이스)

**§5 STEP 4 (impl/test ast_symbol 앵커 / 함수단위 추적성) 시행.** 4원칙 = `.claude/plans/{plan,research}-codegraph-step4.md` (3-agent: 공식문서 F-015 / 업계사례 / Senior 적대 0.84 REVISE + 실 `.codegraph` DB probe → 사용자 gate #3 "4-A 지금 시행" 결단). 본 DEC = SSOT.

### 12.1 negative-space — code-pointer-validator 가 못 하는 symbol 실재 검증 (STEP 4 의 정직한 정의)

`tools/code-pointer-validator/src/validator.js` (ast_symbol 분기) = path 존재만 `existsSync` 확인 + **symbol 자체(예 `SignupService.checkDup`)의 실재는 검증 안 함** ("symbol 검증은 AST parser 외부 / warn-only"). dependency-free validator 가 구조적으로 못 하는 일. codegraph = AST 심볼 인덱스 보유 → 이 공백을 reference-lens 로 채움 = STEP 1~3 coverage-hole 의 **역방향 set-diff**: 산출물 ast_symbol 앵커 ∖ codegraph 심볼 = **stale/dangling anchor** ("산출물 앵커有 / 코드 심볼無").

### 12.2 실데이터 제약 + fork (plan 이 드러냄)

전 4 dogfood 도메인 anchor_type 실측 = **ast_symbol 0** (strict_path 629/420/238/17 + glob 만). 함의: (β)역방향 검증은 지금 검증할 입력이 0 = vacuous / (α)제안만 실데이터 corroboratable. fork 4-A(β 메커니즘)/4-B(α 제안)/4-C(defer→STEP5/6)/4-D(하이브리드) → 사용자 gate #3 = **4-A**.

### 12.3 시행 범위 — 단일 축 `--verify-anchors` (Senior 6산출물→1축 / STEP1 11→2·STEP2 5→2·STEP3 4→1 칼날)

- `collect.js` **`collectSymbolAnchors`** (provenance 보존 — Set 평탄화는 출처 소실로 역방향 불가 / collectRefs 무회귀).
- 신규 `tools/codegraph-coverage/src/anchor-verify.js` (순수): `enumerateNodes(SYMBOL_KINDS=class/interface/function/method/enum/type_alias)` → `buildSymbolIndex`(byQn2=끝2세그 Class.method / byName=bare) → `anchorMatches`(2-세그 앵커=byQn2 정확매칭 / 1-세그=byName / loose bare-method fallback ❌ false-live 회피) → live·stale·informational 분류.
- `cli.js` `--verify-anchors` 모드 (coverage 와 분리 self-contained early-exit / 비차단 exit 0). 앵커 0 = **unverified note** (method-axis 'impl-spec 부재=unverified' 동형 / false-health 회피).
- **(α) "파일앵커→함수 제안"은 federator `symbolsInFile` 소관 = 전면 cut** (Senior jurisdiction / 중복 회피 / 4-B·4-D 동반 소멸). (γ)skill emit·traceability dead-cell·artifact-graph blast-radius = carry.

### 12.4 informational(codegraph 사각) 구조적 절단 (STEP 3 패턴 동형)

앵커 file 이 codegraph 미인덱스 = codegraph 정직 사각(iBATIS2 sql/xml·동적 dispatch·미지원 언어·freshness stale·path 부재). 부재 ≠ stale → **`informational_notes[]`로 격리**: ① schema `anchor_verify.informational_notes.items` **severity 필드 부재 + additionalProperties:false** ② `toAnchorFindings` 가 **stale_anchors 만 순회**(informational 도달 불가) ③ check37. "not a defect / 부재≠stale" 명시.

### 12.5 trust 가드 check37 (RR 36→37 / check34·35·36 4-part isomorphic)

`codegraph_anchor_verify_reference_lens_trust`: ① gate-eval/findings-aggregator anchor-verify 토큰 0 + **REQUIRED_VALIDATORS_PER_STAGE 미등록**(Senior — verify 리포트가 stage 필수 validator 격상 ❌) ② schema informational_notes severity 부재 + findings.severity ⊆ {low,medium} ③ anchor-verify.js 상위 차단등급 리터럴 0 + 'not a defect/부재' 마커 + reference-lens 라벨 ④ anchor-verify.js gate 모듈 import 0. severity ceiling low|medium (stale=medium / SEVERITY_CEILING·pinSeverity 재사용).

### 12.6 §8.1 정직 경계 — mechanism corroboration only (data-corroboration 아님)

- ast_symbol 앵커 = 전 도메인 0 → **in-the-wild stale 미관찰 (unverified)**. STEP 1~3 식 "2-도메인 data-corroborated" 주장 ❌ (fake corroboration / commit-block 꼼수 회피 / feedback_commit_block_no_cheat).
- **메커니즘 = real-symbol probe 2-도메인 입증** (no-sim 실 `.codegraph` DB): 실존 심볼 2 + 비실존(indexed file) 1 + codegraph-blind(xml) 1 주입 → RealWorld(Spring/Java) **live 2 / stale 1 / informational 1** + ecommerce(NestJS/TS) **live 2 / stale 1 / informational 1** 정확 분류 (true-positive + true-negative + 사각 격리). STEP 1 route-axis "0/19 true-negative" 프레이밍 동형.

### 12.7 검증 / carry

- 검증(no-sim/실 CLI): codegraph-coverage test 64→79(anchor-verify 15) + workspace **1195/0** + release-readiness **37/37**(self-test 21/21) + version 3-way 12.12.0 + build dist v12.12.0. 실 Ajv(`ajv/dist/2020`): verify 리포트 valid + finding severity='high' INVALID(enum cut) + informational severity 추가 INVALID(additionalProperties:false cut) = gate-leak 구조 차단. 신규 schema code-anchor-verify.schema.json.
- official-docs(F-015): codegraph `NODE_KINDS` 에 class/interface/function/method/enum/type_alias 실재(실 DB probe: RealWorld class141/interface16/method415, ecommerce class66/method189/function7) / symbol-existence·dead-code 내장 CLI 부재(직접 SQLite set-diff 정답) / Figma Code Connect non-existent node-id 검증 = 미구현 오픈이슈(#337) → STEP 4 가 먼저 해결 / SCIP·LSIF = re-index 후 set-diff 패턴 정합.
- 업계: 함수단위 추적성 = safety-critical(ISO26262/DO-178C)에서 "Traceable 자동생성 + 앵커참조 수동 + stale-on-compile" 패턴 / (α)자동제안 = production ROI 선례 無(gold-plating 신호) / Knip = 코드↔코드 dead-symbol(≠요구사항 앵커) → β 정직 방향.
- carry(STEP 5+): (α)함수앵커 제안(federator 소관) · (γ)skill ast_symbol emit · traceability dead-cell green · artifact-graph code blast-radius · **in-the-wild stale**(ast_symbol 앵커가 실제 산출물에 도입된 후 재측정) · STEP1~3 carry 유지 · STEP 5(context-cache 증분) · STEP 6(Modern-scoped reading-aid + openapi HIGH).

---

## 13. STEP 5 시행 완료 (v12.13.0 MINOR / 2026-06-04 / 로드맵 5번째 슬라이스)

**§5 STEP 5 (context-cache 증분 / `callees` enrichment) 시행.** 4원칙 = `.claude/plans/plan-codegraph-step5.md` (#1 깊은 숙지 → 사용자 일괄 위임 "스탭5 수행→커밋만" = gate #3 standing go). 본 DEC = SSOT. (코드는 2026-06-04 WIP 커밋 `19051ac7` 로 cross-PC 핸드오프 후, dogfood 레포 보유 환경에서 본 절(§13) + version-bump 로 정식 승격.)

### 13.1 공백 — context-cache neighborhood 가 2-방향만 (callees 부재)

context-federator 의 `attachCallersImpact` 는 심볼에 `callers`(상류 1-hop) + `impact`(하류 transitive blast)만 부착하고 **`callees`(하류 1-hop = 내가 직접 호출하는 협력자)는 부재.** "이 메서드 수정 시 알아야 할 직접 협력자" = P0(재사용) reading-aid 가치 직결인데 빠져 있었음. codegraph 0.9.6 CLI 에 `callees <symbol>` 실재(`callers` 와 byte-동형 `{symbol, callees:[{name,kind,filePath,startLine}]}`) → 기존 `mapSymbolNode` 그대로 매핑 = SQLite edge 유도 불필요한 **CLI-native 최소증분**.

### 13.2 시행 범위 — 단일 축 callees enrichment (STEP1 11→2·STEP2 5→2·STEP3 4→1·STEP4 6→1 칼날 동형)

- `federator.js`: `makeCodegraphAdapter` 에 `callees`(callers 정확 analog) + `attachCallersImpact` 부착(`withCallees` 게이트 / callers 대칭) + symbolsInFile(strict_path) 심볼 동형 부착 + `federate` opts `withCallees` + `stats.callees_resolved`(해소율 component).
- `context-cache.schema.json`: `code_refs.symbols.items.callees`(`$defs/symbolRef` 배열 / callers 와 byte-동형) + `stats.callees_resolved`(integer) **additive**.
- `cli.js`: `--no-callers` 가 callers+callees 1-hop neighbor 쌍 동반 off (별도 `--no-callees` 미신설 — 쌍 토글로 수렴).
- **2번째 산출물 `code-graph.json`**(self-coverage / `top_impact_roots` / `edges_by_type`) = **carry** (DEC §5 STEP 5 의 2번째 산출물 / secondary 산출물 cut 선례 동형 / 1 메커니즘 수렴).

### 13.3 trust 가드 — check38 (release-readiness 37→38 / federator 첫 trust 가드)

실측: 기존 check34~37 은 `codegraph-coverage` 만 가드 / **federator 는 release-readiness 가드 부재**(grep 0). STEP 5 = federator 의 첫 trust 가드(`context_cache_reference_lens_trust`) 신설 = 실재 gap 폐색. check34~37 4-part isomorphic: ① gate 모듈(gate-eval/findings-aggregator)에 federator/federate/callees 토큰 0 + `REQUIRED_VALIDATORS_PER_STAGE` 미등록 ② schema `meta.trust_note` required + symbol/code_refs 어디에도 severity 필드 부재(finding 채널 아님 구조 차단 / 실 Ajv: severity 주입 INVALID) ③ federator reference-lens 라벨 + gate 모듈 import 0 ④ federator 가 gating 목록·REQUIRED_VALIDATORS 밖(non-gating 불변). context-cache 는 기존부터 reference-lens / non-gating — callees 도 같은 채널.

### 13.4 §8.1 정직 — 2 distinct 도메인 실 dogfood (no-simulation / 실 codegraph 0.9.6)

본 환경에 외부 `_dogfood-*` 레포는 부재했으나, `examples/` 내 committed PoC 로 실 dogfood 수행 (no-simulation / persona ❌ / 실 `codegraph index` + `callees`):

- **poc-05-sample-user-register (modern TS) — full federate e2e**: `codegraph index target/`(4 files·33 nodes) → `context-federator artifact-graph.json --codegraph-project target` → `packs=4 symbols_resolved=41 callees_resolved=29 anchors_unresolved=0`. **Ajv schema VALID**(callees 필드 포함) + 무회귀(`--no-callers` → callees_resolved=0 / symbols 41·callers·impact 보존). method-level callees 정확: `register` → assertAvailable/add/User · `login` → findByEmail/User (실 협력자).
- **poc-08-realworld-mybatis (Java Spring+MyBatis3 / jpetstore) — 메커니즘 corroboration**: `codegraph index source/`(62 files·996 nodes) → `codegraph callees insertOrder --json` → `OrderMapper.xml`(MyBatis SQL 매퍼) + Order/setOrderId/getNextId/getLineItems 실 협력자 체인. federator 가 호출하는 `callees` CLI 가 2nd distinct stack(Java)에서도 동작 입증.
- **정직 경계 (STEP 4 §12.6 동형)**: full pack e2e = **poc-05 단일 도메인** / 2nd 도메인(poc-08) = `callees` CLI **mechanism corroboration only**(poc-08 = artifact-graph 미보유 → full pack 불가). data-corroboration "2 도메인 모두 non-empty pack" 주장 ❌. 2nd 도메인 full e2e pack = **carry**(committed artifact-graph = poc-05 modern / poc-16 legacy·code_pointers=0 한정 → poc-08/poc-03 artifact-graph 생성 선행 필요). `.codegraph` 인덱스는 gitignore(DEC-2026-06-02) — 레포 무오염.

### 13.5 검증 / carry

- 검증(no-sim/실 CLI): context-federator test **32/32**(실 codegraph smoke 포함) + release-readiness **37→38**(self-test **22/22** / check38 discrimination) + version 3-way 12.13.0. 실 Ajv: context-cache callees valid + severity 주입 INVALID(가드 회귀).
- carry(STEP 5+): `code-graph.json` self-coverage/`edges_by_type`(2번째 산출물) · **2nd 도메인 full e2e pack**(poc-08/poc-03 artifact-graph 생성 후 non-empty pack 실측) · (α)함수앵커 제안(federator `symbolsInFile` 소관) · STEP 6(Modern-scoped reading-aid + openapi HIGH 잔여 / 다음 슬라이스).

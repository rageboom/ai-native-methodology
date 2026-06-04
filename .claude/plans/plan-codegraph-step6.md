# plan — codegraph wiring STEP 6 (Modern-scoped reading-aid)

> 4원칙 #1 (깊은 숙지 → plan). DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 6.
> 대상 산출물(초안): sql-inventory · formal-spec›sequence · migration-cautions · task-plan · plan-org(EPIC/STORY/OP) · input-adapters (6) + **openapi HIGH 잔여** / 렌즈 = I(개선) 중심.
> 선행: STEP 1(v12.9.0 route/method coverage-hole) · STEP 2(v12.10.0 finding 채널) · STEP 3(v12.11.0 module dep coverage-hole) · STEP 4(v12.12.0 ast_symbol stale-anchor verify) · STEP 5(v12.13.0 context-cache callees 증분) — 전부 릴리스 완료.
> 산출: 4원칙 #1·#2 워크플로(`wf_4f1e38ad-a6d` / 8 agent / no-sim 실 DB probe) + 본 plan 단계 main-loop 검증(poc-01/02 인덱싱). **구현 ❌ — gate #3 선행.**

---

## 0. 한 줄 요약 / 핵심 긴장

STEP 6 테마 = **Modern-scoped reading-aid**. 초안 9 injection-point(6 산출물 + openapi)을 실측·적대 검증한 결과, 두 갈래로 수렴:

- **call-chain/fan-in 신호**(sql-inventory caller-chain / formal-spec sequence / task-plan integration / migration api_surface) = **STEP 5 federator 가 이미 callees/callers/impact 로 byte-동형 생산** → jurisdiction 중복(STEP 4 §12.6 (α) cut 동형) + Modern 도메인 vacuous(poc-05 TS calls-edge=4).
- **openapi 정적 anchor/auth/verb-diff** = codegraph 가 갖는 **유일하게 비중복인 신규 niche**(Specmatic/optic/AppMap 전부 runtime·spec-only → 정적 "코드有 계약無" 공백). 단 STEP 1 이 route-path coverage 를 부분 시행 → 잔여 = verb-단위 직접 diff + controller anchor + auth grounding.

**핵심 긴장**: 워크플로 synthesis 는 openapi 를 "unverified(코퍼스 route 노드 0)"로 판정했으나 — 이는 **인덱싱된 코퍼스가 poc-05(TS)·poc-08(jpetstore=Stripes ActionBean)뿐이라 route 노드 0**이었던 corpus artifact. **본 plan 단계 main-loop 검증으로 정정**(아래 §3-정정): committed examples 의 Spring MVC PoC(poc-01·poc-02)는 route 노드를 emit → openapi 축은 **외부 자산 없이 2-도메인 data-corroborate 가능**.

---

## 1. 깊은 숙지 — 실측 사실 (워크플로 investigation / file:line·실 명령)

### 1-1. 9 injection-point 스키마 host 실측

| 산출물 | host 필드(실재) | 렌즈 | additive? | codegraph 신호 | 정직 사각 |
| --- | --- | --- | --- | --- | --- |
| sql-inventory | `sqlRecord`(additionalProperties:true / `called_from_screen`·`uc_link` free-string 존재) | I/A | code_graph_ref 객체 additive | caller-chain | **주 corroboration=PoC#06/#07 iBATIS2=sqlMap 0** / Modern row(typeorm/jpa/prisma)만 |
| formal-spec›sequence | `sequences[].messages[]`(from/to/label/sync/guard / actors[].type enum=controller/service/repository) | I | messages[] 안 optional code_graph_ref(additionalProperties:false) | callees 1-hop | 나머지 4 하위(state/decision/invariant/property)=0 / sequence 도 1/5 |
| migration-cautions | `cautions[]`(additionalProperties:false / category enum=api_surface 존재 / detection_method enum 에 codegraph 부재) | I | code_graph_ref additive 명시 정의 | callers(fan-in) | DB이관 본체(category=database)=codegraph 0 |
| task-plan | `tasks[].code_pointers`($ref code-pointer) + `dependencies`(DAG) + `adrs[].integration_points` | I/A/N | additive 명시 | impact/edges | **미래코드 시점불일치**(plan stage=아직 안 쓴 코드) / fe=TS 사각 |
| plan-org(OP) | `operational-task.op_tasks[].code_pointers`($ref code-pointer / category=refactor) | I | 기존 필드 재사용(신규 ❌) | impact ripple | EPIC=FE screen·STORY=cross-cut=순수 semantic |
| input-adapters | `discovery-spec.use_cases[].code_pointers`+`source_grounded_evidence` 이미 존재 / input-summary cross_refs | I/N | 기존 필드 재사용(신규 ❌) | entity 매칭 | R✗ 비코드 / greenfield N/A / legacy 동시존재 한정 |
| **openapi 잔여** | `openapi-extension.operations[]`(additionalProperties open / `extracted_from.controller_*`·`auth_required`·`required_roles`·`permission_expression`) | I/A/N | operation 단위 additive(code_graph_ref/verified) | route verb·controller 심볼·auth | iBATIS2 x-sql-ids=사각 / FE 사각 |

### 1-2. 도구 아키텍처 — STEP 6 의 신호 공급원

- **STEP 5 federator(`context-federator/src/federator.js`)가 이미 callees/callers/impact 부착** (`attachCallersImpact` :259-290 / adapter callees·impact·symbolsInFile :704-710 / `context-cache.schema.json:177 callees` v12.13.0). → sequence/sql-inventory/task-plan/migration 이 원하는 Controller→Service→Repo call-chain·fan-in = **이미 생산된 출력의 산출물별 재라벨**(신규 enumerate 아님).
- STEP 1 `normalize.js parseRouteName`(:4-10): codegraph route 노드 name `"GET /articles/{slug}"` → `{verb,path}` 추출 = **route-path coverage 이미 시행**. openapi 잔여 = verb-단위 openapi.yaml 직접 diff + controller anchor + auth 로 좁혀짐(route-path 재탕 ❌).
- STEP 4 `anchor-verify.js`: 산출물 ast_symbol 앵커 ∖ codegraph 심볼 = stale (역방향 set-diff). **openapi controller-anchor 검증이 이 메커니즘과 동형**(operation 의 `extracted_from.controller_method` ∖ codegraph 심볼 = stale anchor).
- trust 가드 check34~38 4-part isomorphic(`release-readiness.js`): ①gate 모듈 토큰 0 + REQUIRED_VALIDATORS 미등록 ②schema severity ceiling/구조 차단 ③도구 상위등급 리터럴 0 + 'not a defect' 마커 ④gate 모듈 import 0. **STEP 6=check39 동형.**

### 1-3. negative-space — openapi 의 정직한 정의

Specmatic(유일하게 "구현됐으나 spec 누락" 탐지)은 **runtime Spring Actuator `/mappings`** 로 함 — 정적 source 파싱 ❌. optic=archived(2026-01) / schemathesis=spec-fuzz. → codegraph 가 `@*Mapping`·`@PreAuthorize` 를 **정적 파싱**해 "코드有 계약無" + controller-anchor + auth-grounding 을 잡는 것은 **runtime 도구가 구조적으로 못 surface 하는 진짜 공백**. (route 열거 자체는 Specmatic runtime 이 더 高fidelity → 거기 경쟁 ❌ / 정적 anchor·auth 가 niche.)

---

## 2. 9 injection-point → 생존 분해 (3-agent + Senior 적대 수렴)

| injection-point | 판정 | 근거 |
| --- | --- | --- |
| openapi verb-diff + controller-anchor + auth-grounding | **생존(코어 후보)** | 유일 비중복 신규 niche / route-path 는 STEP1 제외 / **poc-01·02 2-도메인 corroboratable(§3 정정)** |
| sql-inventory caller-chain | cut→carry | iBATIS2(주 타깃)=0 + Modern poc-05 calls=4 vacuous = 2-도메인 불가 / federator callers 중복 |
| formal-spec sequence | cut→carry | federator callees jurisdiction 중복 + AppMap 선례(정적 call-graph=정확 sequence 불충분) + 1/5 하위 + modern vacuous |
| migration api_surface fan-in | cut→carry | federator callers 중복(Modern only) + DB본체 codegraph 0(Strangler 하향) + production ROI 사례 無 |
| migration DB 본체(category=database) | cut(영구) | edge 가 .java interface 에서 종료 = XML/SQL/table 0 실증 |
| task-plan integration_points 추론 | cut→carry | 미래코드 시점불일치(planning-inference 문헌 = bias/error-prone) / 기존코드 리팩터만 |
| task-plan plan↔code coverage-hole(OP-* 발굴) | **조건부 생존** | set-diff niche(STEP1 enumerate 재사용) / 단 2nd 도메인 task code_pointers 보유 미검증 / 기존코드 리팩터 한정 |
| plan-org EPIC/STORY | cut(영구) | EPIC=FE screen·STORY=cross-cut=순수 semantic codegraph 0 |
| plan-org OP code_pointers | cut→carry | 기존 $ref code-pointer 재사용으로 무료 / ripple enrichment = BE-Java only low |
| input-adapters entity-match | cut→carry | name-match=false-positive generator(업계) + greenfield N/A + 기존 source_grounded_evidence 재사용 |

→ **칼날 궤적(STEP1 11→2·STEP2 5→2·STEP3 4→1·STEP4 6→1·STEP5 2→1)** 정합 = STEP 6 도 **1축(openapi) [+조건부 task-plan coverage-hole]** 로 수렴.

---

## 3. 핵심 제약 + main-loop 정정 (실측이 synthesis 를 정정)

### 3-1. 워크플로 synthesis 판정 (인덱싱 코퍼스 = poc-05 TS + poc-08 jpetstore)

- **data-2domain corroborated 축 = 없음** 으로 판정. 근거: 6-A(call-chain)=poc-08 Java mechanism-only(poc-05 TS calls=4 vacuous) / 6-B(openapi)=poc-05·08 **route 노드 0** → "route 노드 보유 신규 Modern Spring(@*Mapping) DB 인덱싱 선행 필요" 로 unverified carry.
- poc-08 = jpetstore = **Stripes ActionBean**(@HandlesEvent / Spring MVC 아님) → route 노드 0 (synthesis 정확).

### 3-2. ★ main-loop 정정 (plan 단계 직접 검증 / feedback_self_recorded_fact_validation)

synthesis 의 "openapi unverified" 는 **인덱싱된 코퍼스가 Spring MVC PoC 를 포함 안 했던 corpus artifact**. committed examples 의 Spring MVC PoC 를 직접 인덱싱(no-sim 실 codegraph 0.9.6)해 정정:

| 도메인 | 인덱스 결과 | route 노드 | openapi.yaml | 검증 |
| --- | --- | --- | --- | --- |
| **poc-01**(raeperd SB2.x / realworld-springboot-java) | 91 files·1509 nodes·1391 edges | **22** (`POST /articles`·`GET /articles/{slug}`…) | `output/api/openapi.yaml` ✅ | 실측 |
| **poc-02**(zhc1 Java21/SB3 / multi-module) | 97 files·route 19 | **19** (`POST /api/articles/{slug}/comments`…) | `output/api/openapi.yaml` ✅ | 실측 |

- → openapi 축은 **외부 자산 없이 committed examples 로 2 distinct Spring MVC 도메인(다른 저자·다른 Spring 버전·다른 패키지) data-corroborate 가능** = mechanism-only 아님. (memory `feedback_codegraph_step_dogfood_examples` 정합 — examples committed PoC dogfood.)
- **실 drift 신호 발견**: poc-02 codegraph route = `/api/` prefix 보유 / openapi.yaml path = 무prefix(`/articles`) → **basePath 정규화 필요**(STEP 1 path-param 정규화 동형) — verb-diff 가 잡을 실제 가치이자 false-positive 회피 게이트 필요.
- iBATIS2(poc-16 x-controller-method anchor)는 **여전히 사각 정직 carry**(iBATIS2 x-sql-ids = codegraph 0). controller-anchor 만 Modern Spring 에서 corroborate.

### 3-3. 따라서 STEP 6 의 정직한 형태

- **openapi 축 = data-2domain corroborated 가능**(poc-01+poc-02 / Java Spring paradigm). "Modern 전반" 주장 ❌(NestJS·FE 미검증 carry) but Spring MVC 2-도메인은 real.
- **call-chain/fan-in 축 = STEP 5 jurisdiction 중복 + Modern vacuous** → 신규 도구/스키마 ❌, skill-가이드 carry.

---

## 4. 설계 선택지 (gate #3 결단 후보 / Senior 적대 검증 완료)

### 옵션 6-A — BE-Java call-chain/fan-in 단일축 (mechanism-only)
sql-inventory caller-chain ∪ migration api_surface fan-in 을 1축 융합. callees/callers/impact reading-aid.
- **장점**: poc-08 Java 메커니즘 입증(OrderService→4 mapper / fan-in 6 / impact 42노드).
- **단점(치명)**: **STEP 5 federator 와 jurisdiction 중복**(byte-동형 / Senior must-fix) = 신규 도구=중복=재작업 위험. Modern 2nd 도메인(TS poc-05 calls=4)=vacuous → mechanism-only 영구 carry. sql-inventory 주 타깃(iBATIS2)=0.

### 옵션 6-B — openapi 정적 anchor/auth/verb-diff 단일축 ★ 권장
verb-단위 openapi.yaml ↔ codegraph route 직접 diff + controller anchor 검증(`extracted_from.controller_method` ∖ codegraph 심볼 = STEP4 역방향 set-diff 동형) + auth grounding(`@PreAuthorize`·permission_expression vs codegraph). route-path 는 STEP1 제외.
- **장점**: **유일 비중복 신규 niche**(Specmatic/AppMap runtime ↔ codegraph 정적) / **poc-01+poc-02 2-도메인 data-corroborated(§3 정정)** / S2 주 타깃 가치사슬 / STEP1 enumerate + STEP4 anchor-verify 재사용 / openapi-extension host 자연.
- **단점**: iBATIS2 x-sql-ids 사각 carry / basePath 정규화 게이트 필요 / NestJS·FE 미검증 carry.

### 옵션 6-C — 6-B + task-plan plan↔code coverage-hole (2축)
openapi + 신규 task-axis coverage-hole(route/method 전수 ∖ task code_pointers / 기존코드 리팩터 한정).
- **장점**: research-1·Senior keep 2축 정합.
- **단점**: 칼날 궤적(STEP3·4·5=1축 마감)상 과적합 + trust-guard 표면 희석 / task coverage-hole 2nd 도메인 corroboration 미검증(조건부).

### 옵션 6-D — STEP 6 전체 defer
모든 축 carry.
- **장점**: §8.1 가장 엄격 / mechanism-only 격상 누적 회피.
- **단점**: **§3 정정으로 6-B 가 data-2domain corroboratable 임이 밝혀져 defer 명분 약화** / 로드맵 정체 / 품질1순위와 정합하나 "비중복 niche 를 가진 축을 미룸"은 ROI 손실.

---

## 5. 권장안 (plan 가설 / gate #3 사용자 결단)

**잠정 권장 = 옵션 6-B (openapi 정적 anchor/auth/verb-diff 단일축)**, 근거:

1. 3-agent 전원이 openapi 를 codegraph 의 **유일 비중복 신규 niche** 로 지목(research-1 PRIMARY CORE / research-2 controller-anchor sliver / Senior 가장 강한 코어).
2. synthesis 의 "unverified" 우려 = **§3-2 main-loop 검증으로 해소**(poc-01·02 route emit / 2-도메인 data-corroborated / 외부 자산 불요).
3. 6-A(call-chain)는 **STEP 5 federator jurisdiction 중복**(STEP4 §12.6 (α) cut 직접 선례) = 재작업 위험 → 본체 도구 ❌, carry.
4. 칼날 궤적(STEP3·4·5=1축) 정합 = openapi 1축 마감. task-plan coverage-hole(6-C)은 2nd 도메인 corroboration 재확인 후 동반 또는 carry.

**단 gate #3 결단 사항**: ① 6-B 단일 vs 6-C(2축) vs 6-A vs 6-D ② openapi 범위(verb-diff + controller-anchor + auth-grounding 중 어디까지) ③ §8.1 정직표기(Spring MVC 2-도메인 data-corroborated / iBATIS2·NestJS·FE carry) ④ check39 설계 ⑤ discoverer enum 격상 ❌ 유지.

---

## 6. 시행 설계 (옵션 6-B 채택 가정 / 변경 가능)

1. **route enumerate 재사용** — STEP1 `enumerate.js`/`normalize.js parseRouteName`(verb+path). 신규 enumerate ❌.
2. **openapi.yaml 파서** — 무의존성 유지(STEP1 carry 라인: YAML 파서). 최소 path/verb 추출(operations + x-controller-method/auth 확장 read).
3. **3 sub-mechanism**(neg-space 별):
   - **(a) verb-diff** — codegraph route {verb,path} 전수 ∖ openapi.yaml operations = "코드有 계약無"(N coverage-hole) / 역방향 = "계약有 코드無". **basePath 정규화 게이트**(poc-02 `/api/` prefix). false-positive 필터(STEP1 route exclusion 재사용).
   - **(b) controller-anchor verify** — openapi `extracted_from.controller_method` ∖ codegraph 심볼 = stale anchor(STEP4 anchor-verify.js 역방향 set-diff 재사용 / informational_notes 격리).
   - **(c) auth-grounding** — openapi `auth_required`/`permission_expression` 가 주장하는 controller 에 codegraph @PreAuthorize 심볼 실재 reading-aid.
4. **cli 모드** `--openapi-coverage`(또는 통합) — coverage 와 graceful 분리 / route 노드 0 = unverified note(false-health 회피).
5. **schema** — openapi-extension `operations[]` additive `code_graph_ref`(verified bool + controller_symbol_node_id) / `informational_notes[]`(severity 필드 부재 + additionalProperties:false) / 또는 별도 리포트 schema. severity ceiling low|medium.
6. **trust 가드 check39** — `codegraph_openapi_reference_lens_trust`(RR 38→39 / check34~38 4-part isomorphic) + **Senior 보강**: federator 경유 간접 gate-leak 가드(④에 federator→gate 간접 import 0 포함). 시행 축 한정 conditional. self-test 1건 + version 3-way bump.

---

## 7. §8.1 dogfood 계획 (no-simulation / data-2domain)

- **openapi 축 = poc-01(raeperd) + poc-02(zhc1) 2 distinct Spring MVC 도메인 data-corroborated**(route 22·19 emit 실측 + openapi.yaml 2종). 동일 코드경로 재현(§8.1 must-fix#4).
- iBATIS2(poc-16 x-controller-method)·NestJS(poc-03)·FE = controller-anchor 일부만 / x-sql-ids·동적 = 사각 정직 carry.
- true-positive(실 drift = poc-02 `/api/` prefix mismatch) + true-negative(정규화 후 매칭) + informational(iBATIS2 사각 격리) 3-state.

## 8. 검증 계획 (no-sim / 실 CLI)

- codegraph-coverage test += openapi-coverage 단위(verb-diff/anchor/auth/정규화/route-0 unverified).
- workspace 전체 0 fail + release-readiness **39/39**(check39 self-test discrimination) + version 3-way bump + build dist.
- 실 Ajv schema-valid(code_graph_ref/informational severity 주입 INVALID = gate-leak 구조 차단).
- 2-도메인 실 dogfood(poc-01+poc-02).

## 9. Senior 적대 (research 완료 / §research-step6 §4)

- **칼날(must-fix)**: 9 injection-point 전면 = 위반 → 1~2 코어. ✓ 반영(6-B 1축).
- **jurisdiction(must-fix)**: call-chain/fan-in = STEP5 federator 중복 → 신규 도구 ❌. ✓ 반영(6-A cut).
- **sql-inventory 격상(must-fix)**: iBATIS2 0 + Modern vacuous = 차단. ✓ 반영(cut).
- **openapi 범위(should-fix)**: route-path 재탕 ❌ → verb-diff+anchor+auth 로 좁힘. ✓ 반영.
- **check39 보강(should-fix)**: federator 경유 간접 gate-leak 가드. ✓ §6.6 반영.
- VERDICT = **REVISE → minimal-core(openapi 1축) GO**.

## 10. 4원칙 절차

1. ✅ 깊은 숙지 → 본 plan (워크플로 investigation + main-loop poc-01/02 검증).
2. ✅ 3-agent research(공식문서 F-015 / 업계 / Senior 적대) → `research-codegraph-step6.md`.
3. ✅ **사용자 gate #3 결단 = "6-B openapi 단일축 + full(verb-diff + controller-anchor + auth-grounding)"** (2026-06-04).
4. ✅ 착수 완료 = v12.14.0 (DEC §14 / CHANGELOG). revert 불요(전 검증 green).

## 11. Lessons Learned (시행 완료 / v12.14.0)

- (plan / ★) synthesis 의 "openapi unverified / data-2domain 부재" 는 **corpus artifact**(인덱싱 코퍼스 = poc-05 TS·poc-08 Stripes / 둘 다 route 0) → main-loop 가 committed examples 의 Spring MVC PoC(poc-01 route 22·poc-02 route 19) 직접 인덱싱으로 정정 = **data-2domain corroborated**. self-기록 narrative(8-agent synthesis 결론)도 사실 검증 의무 / data-2domain 여부 = "현재 인덱싱 코퍼스" ❌ "committed examples 전수" ✅ (`feedback_self_recorded_fact_validation`).
- (구현) controller-anchor = STEP 4 `buildAnchorVerify` 역방향 set-diff **그대로 재사용**(anchor=controller_method / artifact=openapi:opId) — 신규 매칭 코드 0. jurisdiction 칼날(call-chain 4축 = STEP 5 federator 중복 → skill-가이드 carry)이 scope 를 1축으로 강제(STEP4 §12.6 (α) cut 동형).
- (실측) verb-diff degenerate path(`POST /`) = codegraph 가 class @RequestMapping + method path 합성 실패한 추출 아티팩트(poc-02 login 실관찰) → informational 격리(코드有계약無 단정 ❌ / false-positive 회피). codegraph 정적 추출 사각의 정직 처리.
- (실측) poc-01 controller-anchor 전부 informational = **정상·정직 동작**(버그 ❌): api-extension 가 interface `XxxApi` 기록 / codegraph 는 impl `XxxRestController` 인덱싱 + interface file 미인덱스 → 검증 불가를 정직히 informational(부재≠stale)로 격리. 3-state(live=poc-02 / informational=poc-01 / stale=unit probe) 입증.
- (부수) poc-01 api-extension.json malformation 3곳(`""BR-DOMAIN-AUDITING-001""`) = 실 JSON defect → 수정(feedback_strict_exposes_drift / 2nd 도메인 확보).
- (working tree / ★) 세션 중 레포가 12.13.0→12.13.1(Windows PATCH, cross-PC 동기화)로 advance + dep-graph-viz 별개 미커밋 작업 공존 발견. 버전 bump 는 실측 HEAD(12.13.1) 기준 → 12.14.0. 커밋 scope 분리 의무(STEP 6 ≠ dep-graph-viz).

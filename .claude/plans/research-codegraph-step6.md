# research — codegraph wiring STEP 6 (3-agent + 실 DB probe)

> 4원칙 #2. plan = `plan-codegraph-step6.md`. no-simulation. 가벼운 sub-agent 전략.
> 3-agent: 공식문서(F-015 raw fetch) / 업계사례(defer-신호) / Senior 적대(REVISE) + 실 `.codegraph` DB probe.
> 출처: 워크플로 `wf_4f1e38ad-a6d`(8 agent / 642K tok) + plan 단계 main-loop 검증(poc-01/02 인덱싱).

---

## 1. 공식문서 (VERIFIED / raw fetch / F-015 / 신뢰도 0.82)

- **codegraph 0.9.6 CLI**: callees/callers/impact/query/context/affected. callers·callees = **1-hop only**(no --depth / -l limit + -j json). impact = transitive(-d/--depth default 2 / README max 5). → Controller→Service→Repo 체인 = 단일 명령 ❌ = node 별 callees 체이닝 OR impact affected[] 통째(unordered).
- **실 Java probe(poc-08 jpetstore MyBatis3 / no-sim)**: `codegraph callees OrderService -j` → Service→Repository edge 가 MyBatis3 Mapper **interface**(ItemMapper/OrderMapper/SequenceMapper/LineItemMapper / kind=interface / src/main/java/.../mapper/*.java) 해소. `callers AccountService -j` → ActionBean(controller-equiv)→Service. **Controller→Service→Repo(MyBatis3 mapper) call-chain seed 가 Java/MyBatis3 paradigm 에서 작동 실증.**
- **Java↔SQL 경계 0 실증**: codegraph 가 Mapper **interface**(.java literal)는 인덱싱하나 mapper XML 안 SQL 은 ❌. XML(AccountMapper.xml 등)은 files 테이블에 존재하나 Service→Mapper edge 는 .java interface 에서 종료 = XML 미진입. → iBATIS2 sqlMap(S2 주 타깃)=0 일반화(interface→impl 따르나 XML-statement→SQL→table 추적 ❌).
- **fan-in 실재**: `callers OrderMapper -j` → 6-entry caller(fan-in count) / `impact OrderMapper -d 3` → nodeCount 42/edgeCount 40 transitive blast. → migration api_surface fan-in·OP ripple reading-aid corroborate(Java).
- **Modern TS = WEAK/sparse**: poc-05 TS DB = calls edge **4개 total** / `callees UserService -j` → **[] empty**(class level). → sequence/sql-caller-chain 의 Modern corroboration 은 거의 Java paradigm 단독 = §8.1 ≥2 distinct Modern 도메인 **미충족**(TS 표본 too thin).
- **Specmatic = runtime**: "구현됐으나 spec 누락" 탐지하는 유일 도구이나 **Spring Actuator runtime `/mappings`** 사용(정적 source ❌). 원문 인용: *"we use the mappings endpoint provided by the spring actuator library."* → codegraph 정적 `@*Mapping` 파싱(running app 불요)의 "코드有 계약無" = **Specmatic/optic/schemathesis 재탕 ❌ / 진짜 정적 공백.**
- **AppMap 선례**: 정적 call-graph 는 정확한 sequence 에 **구조적 불충분**(runtime recording 필요) → formal-spec sequence = "structural seed/reading-aid only" 한정(conditional·loop·ORM-generated·dynamic dispatch invisible).
- **Strangler Fig(Fowler/AWS/ThoughtWorks)**: dependency/coupling 분석으로 migration 순서 결정 → api_surface fan-in = 정당 reading-aid 입력 but **DDD/seam-driven judgment** 본체(기계적 fan-in ranking ❌) + DB migration 본체 = codegraph 0(Strangler 하향 정합).
- **codegraph edge confidence 미문서화**: edge metadata 에 `{confidence:0.8, resolvedBy:instance-method}` 존재하나 README 공개 계약 ❌ → reading-aid 힌트로만 read / gate ❌. `unresolved_refs`=양 DB 0 → **codegraph 가 미해소 edge 를 침묵 drop(자가 완전성 보고 ❌)** → 사각 경계는 외부지식으로만 encode.
- ⚠ caveat: poc-08 = Stripes ActionBean → Spring `@*Mapping` route 노드 **미발화(0)** = "documented but not locally probed for Spring MVC" → **§2 main-loop probe 로 해소**(poc-01/02).

## 2. 실 `.codegraph` DB probe (no-sim / 워크플로 + plan 단계 main-loop)

### 2-1. 워크플로 probe (poc-05 TS / poc-08 jpetstore)

| 도메인 | nodes | edges | route | 결론 |
| --- | --- | --- | --- | --- |
| poc-05(modern TS) | 33 | calls 4 / refs 14 / imports 6 / inst 3 | **0** | call-chain near-vacuous / route 없음 |
| poc-08(Java jpetstore=Stripes) | 996 | calls 765 / contains 934 / imports 300 | **0** | call-chain 풍부(mechanism 입증) / Stripes 라 route 0 |

→ 워크플로 결론: openapi = route 노드 0 코퍼스 → **"unverified"** carry. (단 인덱싱 코퍼스가 Spring MVC PoC 불포함이 원인.)

### 2-2. ★ main-loop 정정 probe (poc-01/02 = Spring MVC / plan 단계 직접)

| 도메인 | 인덱스 | route 노드 | openapi.yaml | 비고 |
| --- | --- | --- | --- | --- |
| **poc-01**(raeperd SB2.x) | 91f·1509n·1391e | **22**(`POST /articles`·`GET /articles/{slug}`…) | ✅ output/api/openapi.yaml | 5 @RestController |
| **poc-02**(zhc1 Java21/SB3) | 97f·route 19 | **19**(`POST /api/articles/{slug}/comments`…) | ✅ output/api/openapi.yaml | 7 controller / **`/api/` prefix drift** |

→ **정정**: openapi 축은 **committed examples(외부 자산 불요) 2 distinct Spring MVC 도메인 data-corroborated**. synthesis 의 "unverified" = corpus artifact. poc-02 codegraph route `/api/` prefix vs openapi.yaml 무prefix = **실 basePath drift = verb-diff 가 잡을 실가치 + 정규화 게이트 필요**.

## 3. 업계 (cautious / defer-신호 / 신뢰도 0.82)

- **AppMap(Java sequence 시장 리더)** = runtime 트레이싱(정적 call-graph 거부) / on-demand 탐색 artifact(spec 주입 ❌). → STEP6 정적 sequence seed = wrong-mechanism + spec 주입 production 사례 無 = **가장 강한 defer 후보**.
- **정적 call-graph = dynamic dispatch over-approximation**(Spring interface DI/AOP proxying 이 정확히 그 케이스) → DEC §2 "runtime 와이어링 사각"을 sequence 축의 1급 정확도 hazard 로 corroborate.
- **Specmatic** = "code present/contract absent" 양방향 탐지 이미 production(CI) / runtime `/mappings` 高fidelity. → openapi **endpoint set-diff(route coverage)는 Specmatic + STEP1 과 중복** / **controller-anchor + auth-grounding 만 정적 niche**(runtime-mappings 도구가 surface 안 함).
- **Strangler 우선순위** = seam/coupling/business-value JUDGMENT(자동 fan-in count ❌) / production ROI 사례 無 → migration api_surface fan-in = defer-until-burden.
- **planning-inference 문헌** = fine-grained 관계 예측 bias/error-prone + confidence/rationale 동반 의무 → task-plan integration_points 자동추론 = **미래코드 시점불일치 hazard**(기존코드 리팩터만 유효).
- **entity-name 매칭 = false-positive generator**(keyword-collision / human spot-check + accuracy-rate ROI 의무) → input-adapter entity-match = production ROI 사례 無 / Phase1 'low' 정합.
- **synthesis**: 6+openapi 중 5종 = (a) 高fidelity incumbent(Specmatic/AppMap runtime) 중복 OR (b) Phase1 self-rated low/weak OR (c) automation hazard. **유일 비중복 정적 niche = openapi controller-anchor + auth-grounding.**

## 4. Senior 적대 (REVISE / 신뢰도 0.82)

verified(no-sim 실 코드/DB):
1. **STEP5 federator 가 callees/callers/impact 이미 부착**(federator.js:259-290,704-710 / context-cache.schema:177 callees v12.13.0) → sequence/sql-inventory/task-plan/migration call-chain·fan-in = **출력 재라벨 = jurisdiction 중복 핵심**.
2. 실 `callees insertAccount`(poc-08) = Service→Mapper.java→XML→domain 4-hop = 4 축이 원하는 그 신호 그대로 / 실 `callers getAccountByUsername` = fan-in = migration api_surface 그대로. → 4 축 = 같은 primitive 의 산출물별 재라벨.
3. **VACUOUS 입증**: poc-05 modern calls=4 → sequence/sql-inventory 유일 modern dogfood near-vacuous(STEP4 ast_symbol=0 동형) → §8.1 2-도메인 불가.
4. **sql-inventory 격상 불가**: 주 corroboration iBATIS2=0 + Modern vacuous = 이중고 → cut.
5. **openapi = STEP1 route-axis 부분 중복**(parseRouteName verb 추출) → 신규분 = verb-diff + controller-anchor + auth-grounding 으로 좁힘.
6. **STEP4 §12.6 = (α) 'federator symbolsInFile 소관 cut' 직접 선례** → STEP6 call-chain 축 동일 jurisdiction 칼날 의무.

판정(challenges):
- **[must-fix] 칼날**: 9 injection-point 전면 = 위반 → 1~2 코어(openapi controller-anchor+auth / 조건부 task-plan coverage-hole).
- **[must-fix] jurisdiction**: sequence/sql-inventory/task-plan-integration/migration call-chain = federator 중복 → 신규 도구 ❌ = **skill-가이드 carry**(context-cache callees 참조).
- **[must-fix] sql-inventory**: iBATIS2 0 + vacuous = 본체 격상 시도 = fake-corroboration 위험 → cut.
- **[should-fix] formal-spec sequence**: vacuous + AppMap 정적 불충분 → carry(skill-가이드).
- **[should-fix] openapi 'HIGH' 전면**: route-path 재탕 ❌ → 좁힌 범위(poc-08 route·@PreAuthorize + poc-16 x-controller-method)가 가장 강한 코어.
- **[should-fix] check39 보강**: check34~38 4-part isomorphic + **federator 경유 간접 gate-leak 가드**(openapi 도구가 context-cache import → gate 간접 leak 미탐 방지 / ④에 federator→gate 간접 import 0).
- VERDICT = **REVISE → minimal-core(openapi 1축 + 조건부 task-plan coverage-hole) GO**.

honest_boundaries(Senior):
- poc-05 TS thin(33n/4 calls)이 "committed dogfood 한계"인지 "codegraph TS 추출 부실"인지 미구분(둘 다 modern call-chain corroboration 차단).
- controller-anchor 가 codegraph route 노드와 1:1 매칭되는지는 구현 STEP 실측 의무(본 research 는 host 필드 존재 + route verb 추출만 입증 / **단 plan §2-2 가 route emit 자체는 실측 완료**).
- task-plan plan↔code coverage-hole 2nd 도메인(task code_pointers 보유) 미검증 → 조건부 keep.

## 5. 수렴 결론 (gate #3 입력)

- **방향**: research 3-agent + synthesis + main-loop 검증이 **openapi 정적 anchor/auth/verb-diff 단일축(6-B)** 로 수렴. Senior 0.82 REVISE→GO(1축).
- **★ 정정(가장 중요)**: synthesis 의 "data-2domain 부재 / openapi unverified" = **인덱싱 코퍼스 한계**(poc-05·08 = route 0). **plan §2-2 main-loop probe 로 정정** — poc-01(route 22)+poc-02(route 19) = openapi 축 **외부 자산 없이 2-도메인 data-corroborated**. (research-1 의 "PRIMARY CORE" 가 결과적으로 옳았고, synthesis 의 정정이 corpus artifact 였음.)
- **칼날 cut**(carry): call-chain 4 축(federator jurisdiction 중복) / sql-inventory(iBATIS2+vacuous) / formal-spec sequence(AppMap 정적 불충분) / migration DB본체(codegraph 0) / plan-org EPIC/STORY(semantic) / input-adapters(false-positive+greenfield N/A).
- **정직 제약(절대)**: openapi = Spring MVC 2-도메인 data-corroborated(real) / iBATIS2 x-sql-ids·NestJS·FE = 사각 carry. "Modern 전반" 주장 ❌. fake corroboration·commit-block 꼼수 ❌.
- **trust**: check39 4-part isomorphic + federator 경유 간접 gate-leak 가드.
- **잔류 긴장(사용자 결단)**: ① 6-B 단일 vs 6-C(2축 +task-plan coverage-hole) — task coverage-hole 2nd 도메인 corroboration 미검증(조건부) ② openapi 범위(verb-diff 포함 vs anchor+auth sliver만 / research-2 = verb set-diff 도 Specmatic 일부 중복 주장) ③ do-now(6-B) vs defer(6-D) — §2-2 정정으로 defer 명분 약화.

## 6. Lessons (research 단계)

- synthesis 가 8-agent 끝에 내린 "data-2domain 부재" 결론조차 **인덱싱된 코퍼스(2개)만 보고 committed examples 전수를 안 봄** = self-기록 narrative 의 사실 검증 부족. main-loop 가 poc-01/02 직접 인덱싱으로 정정(`feedback_self_recorded_fact_validation` 실증 / STEP 1·2 핸드오프 사실 반증 선례 동형).
- jurisdiction 중복(call-chain ↔ STEP5 federator)은 STEP4 §12.6 (α) cut 과 정확히 동형 → 선행 칼날 선례가 STEP6 scope 를 1축으로 강제.
- 업계는 정적 call-graph sequence 주입에 신중(AppMap=runtime / spec 주입 사례 無) + openapi endpoint 열거는 Specmatic runtime 이 高fidelity → codegraph 의 비중복 niche = **정적 controller-anchor + auth-grounding**(runtime 도구가 못 보는 것).

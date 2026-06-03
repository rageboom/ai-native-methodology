# plan-poc17-chain3-test-car-list

> **세션 54차 — 5 번째 plan ladder** (직전 = `plan-poc17-chain2-spec-car-list.md` § chain 2 종결 / gate #2 go).
> **4원칙 1단계** (깊이 숙지 / chain 2 산출 + skill 본문 + schema 본격 read 종결).
> **paradigm 정합** — LL-codegraph-07 (외부 위치) + 신규 stack 결단 본격 (Spring Boot 3.x + JPA + Java 21 / chain 2 → chain 3 deadline 본격 충족).

---

## 1. 목적 / scope

### 1.1 trigger 사실

session 54차 chain 2 spec stage 종결 직후 사용자 결단:

- "chain 3 (test) 진입" (gate #2 후 다음 결단)
- **신규 stack = Spring Boot 3.x + JPA + Java 21** (chain 2 → chain 3 deadline 충족)

### 1.2 scope-in (chain 3 test stage / car-list pilot)

- 본 PoC 6 화면 중 #1 car-list 만 (chain 2 동일 scope)
- chain 2 산출 frozen 보존 (behavior-spec + acceptance-criteria)
- chain 3 산출 신규:
  - `test-spec.{json,md}` (TC-\* 본격 / AC 13 → TC ≥ 13 mapping)
  - 실 test 코드 (Spring Boot 3.x + JPA + junit5 + spring-cloud-contract + testcontainers)
- AC backward 채움 (acceptance-criteria.json in-place edit / test_case_refs ≥ 1)

### 1.3 scope-out

- 화면 #2~#6 = 별 cycle
- chain 4 (test-impl-pass-validator 실행) = 별 plan ladder
- impl 코드 = chain 4 (RED 의무 / chain 3 = test 만 generate)
- 사내 source 본격 본격 cp ❌ (LL-codegraph-07 정합) — test 코드는 사내 source 의 shape (Controller + Service + DAO) reference 본격 (cp ❌)
- methodology body 변경 ❌ (paradigm A enforce / 본 chain 2 carry queue C-validator-v11-cascade-cross-cut + C-validator-path-resolution-paradigm 보류)

---

## 2. 신규 stack 본격 설계 (사용자 결단 본격 흡수)

### 2.1 stack matrix

| layer       | legacy (Spring 4.1 + iBATIS 2) | 신규 (Spring Boot 3.x + JPA)                                                    | 변환 paradigm                                            |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| JVM         | Java 1.8                       | **Java 21**                                                                     | major jump (R1' axis carry — sub-rule §X-H drift 가능성) |
| framework   | Spring 4.1.2 + Egov 3.6.0      | **Spring Boot 3.x**                                                             | annotation 기반 (XML config 폐기)                        |
| ORM         | iBATIS 2 (XML SQL Map 2.0 DTD) | **Spring Data JPA + Hibernate 6.x**                                             | 본격 본격 변경 (sub-rule §X-H 본격 drift)                |
| DB          | MS-SQL Server (legacy 보존)    | **MS-SQL Server (보존)**                                                        | unchanged                                                |
| view        | JSP server-side render         | **API JSON only** (FE 분리 axis 자연 / 본 chain 3 BE-only)                      | JSP carList.jsp + carListAjax.jsp 폐기 → REST API        |
| test runner | (legacy 본격 부재)             | **junit5 + Mockito + spring-cloud-contract + testcontainers + @SpringBootTest** | new                                                      |

### 2.2 legacy preservation paradigm 정합

본 chain 3 안 본격 preservation 본격 의무:

- **fn_Get_CarUserListView_2** (117 LOC DB function) = 본격 보존 / JPA 안 `@Query(value = "SELECT * FROM fn_Get_CarUserListView_2(?1)", nativeQuery = true)` 본격 자연
- **STUFF FOR XML PATH('')** (BHV-CAR-032) = MS-SQL 의존 보존 (native query 본격)
- **ISNULL(TC.SORT, 1000)** (BR-CARLIST-SORT-001) = native query 본격 보존 (JPA Sort dialect-specific carry)
- **admin role 식별자 'IF000000096'** = 하드코딩 보존 (config 외부화 carry)

test 코드 본격 = legacy SQL 본격 본격 보존 fact 본격 검증 (characterization test paradigm 정합).

### 2.3 sub-rule §X-H drift carry

iBATIS 2 → JPA 본격 본격 변경 = sub-rule `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X-H AP detection axis 본격 drift fact:

- §X-H AP `AP-LEGACY-IBATIS2-DB-001~011` 본격 = iBATIS 2 sqlMap 안 paradigm 본격
- JPA 안 동형 AP 본격 본격 본격 ❌ (본 PoC 본격 본격 본격 본격 새 paradigm 본격 사실 자산 본격 carry)

**carry queue 신규 본격 후보**: `C-sub-rule-jpa-from-ibatis2-AP` (Type 2 외부 사용자 자연 trigger / 본 PoC chain 3 본격 본격 첫 fact 본격 자연).

---

## 3. 입력 (frozen)

### 3.1 chain 2 산출 (본격 frozen / chain 3 입력 의무)

| 자산                                                                        | 본격 활용                                                                                |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `behavior-spec.json`                                                        | BHV-CAR-001~034 (6 BHV) + property_tests (본격 chain 3 generate / fast-check 또는 jqwik) |
| `acceptance-criteria.json`                                                  | AC 13 + verifiable=true + layer=be + openapi_path + operationId (TC backward 채움 의무)  |
| `behavior-spec.md` + `acceptance-criteria.md` + `behavior-diagrams.mermaid` | 사람 눈 cross-reference                                                                  |

### 3.2 analysis baseline (frozen / 본격 본격 입력 보존)

| 자산                                                                                | 본격 활용                                                                                                                                                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `openapi.yaml` 28 endpoint                                                          | contract test source (spring-cloud-contract)                                                                                                                             |
| `business-rules.json` 12 car-list BR                                                | TC assertion source                                                                                                                                                      |
| `characterization-spec.json#CHAR-010-RBAC-BYPASS` + `findings/F-RBAC-BYPASS-001.md` | security TC source (TC-CAR-003-004 = sessionId NULL reject)                                                                                                              |
| `decision-tables/rbac-3-branch.md`                                                  | RBAC 3 분기 TC source                                                                                                                                                    |
| `sequence-diagrams/rbac-with-sessionid-bypass.mermaid`                              | sessionId bypass TC source                                                                                                                                               |
| `inventory.json` (legacy = Java 1.8 + Spring 4.1)                                   | 본격 본격 본격 framework 추론 fact 본격 = legacy → 사용자 결단 본격 본격 override 의무 (inventory 본격 본격 본격 본격 본격 정합 ❌ / 신규 stack 결단 본격 본격 override) |

### 3.3 본 레포 (SSOT)

- `skills/test-generate-test-spec/SKILL.md`
- `schemas/test-spec.schema.json`
- `templates/test/test-spec.template.{json,md}`

---

## 4. 산출물 (외부 디렉토리)

### 4.1 1차 산출물

| 산출물                                             | 위치                                                     | 본격 본문                                                                                                                                           |
| -------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test-spec.json`                                   | 외부 (신규)                                              | TC ≥ 13 (AC 13 + property_tests 2 = TC 13~15) / 각 TC 의 id + ac_ref + bhv_ref + type + framework + source_file + expected_outcome=fail + fail_mode |
| `test-spec.md`                                     | 외부 (신규)                                              | TC narrative + framework 분포 + 실행 명령                                                                                                           |
| 실 test 코드 (외부 / 신규 stack project structure) | 외부 / 본격 본격 결단 의제 (본 PoC 안 실 test 코드 위치) | 13~15 .java test 파일 본격 본격                                                                                                                     |
| `acceptance-criteria.json` (in-place edit)         | 외부 / chain 2 산출 갱신                                 | test_case_refs ≥ 1 backward 채움                                                                                                                    |
| `chain-intervention-log.jsonl` (append)            | 외부                                                     | chain 3 진행 사실                                                                                                                                   |

### 4.2 본 레포 (commit 자격)

| 산출물                                           | 위치                                               | 조건                          |
| ------------------------------------------------ | -------------------------------------------------- | ----------------------------- |
| 본 plan.md                                       | `.claude/plans/plan-poc17-chain3-test-car-list.md` | 본격 commit 자격              |
| LL-poc-17-20~? (후보 / chain 3 종결 시점 자산화) | 본 plan §8                                         | 시행 결과 종결 후 본격 자산화 |
| memory `project_poc17_dogfooding.md` 갱신        | `~/.claude/projects/.../memory/`                   | chain 3 진행 사실 누적        |

---

## 5. 사용자 승인 묶음 (3원칙 / 5 핵심 결정)

### 결단 1. TC 수 본격 결단

- **A. AC 13 + property 2 = TC 15 본격** 추천 (AC 1:1 매핑 + property_tests 2 신규 = test pyramid 정합 / TC type 분포: unit 9 + integration 3 + contract 1 + property 2)
- B. AC 1:N 분해 (TC ≥ 20) — happy/edge/negative 각각 본격 분해 / scope 부풀림
- C. 최소 (AC 13 만 / property 0) — property test 본격 carry

### 결단 2. 실 test 코드 외부 project structure 본격 결단

- **A. `~/.../poc-17-ifrs-car-migration/migration-target/` 안 Spring Boot 3.x project skeleton 신설** 추천 (src/test/java/com/smilegate/efiweb/ifrs/car/ + pom.xml + DB config)
- B. test 코드 본격 본격 본격 .aimd/output/test-code/ 안 placeholder (Spring project 본격 본격 신규 carry / 본 chain 3 = test-spec.json 만)
- C. 사용자 직접 작성 axis 위임 (사내 source 본격 본격 본격 위치 본격 결단 의제)

### 결단 3. contract test 분포

- **A. spring-cloud-contract 본격 1 TC (openapi.yaml#carListAjax)** 추천 (BE contract test 본격 1 sample / 13 TC 안)
- B. spring-cloud-contract 본격 4 TC (4 endpoint × contract / scope 부풀림)
- C. contract 본격 ❌ (unit + integration 본격 본격 만 / contract carry)

### 결단 4. testcontainers DB integration test

- **A. testcontainers MSSQL 1 TC 본격 (fn_Get_CarUserListView_2 native query 검증)** 추천 (DB function preservation 본격 본격 검증 자격)
- B. testcontainers 본격 ❌ (Mockito DAO mock 본격 본격 / DB function 검증 carry)
- C. 본격 본격 본격 testcontainers 본격 본격 모든 RBAC 분기 TC (4 분기 × 1 = 4 TC / scope 부풀림)

### 결단 5. chain 3 종결 후 다음 cycle

- **A. 본 plan 종결 후 사용자 검토 후 결단** 추천 (chain 4 진입 vs 본 session 종결 vs 화면 #2~#6)
- B. 본 plan 안 chain 4 진입 통합 (test-impl-pass-validator 실행 / RED 검증) — scope 부풀림
- C. 본 session 종결 (chain 3 시행만 / chain 4 = 다음 session)

---

## 6. 위험 / 제약

| ID    | 위험                                                            | severity | 완화                                                                                                   |
| ----- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| R-001 | 신규 stack 본격 본격 결단 본격 본격 본격 본격 사후 변경 risk    | medium   | chain 2 → chain 3 deadline 충족 후 결단 / 사용자 명시 결단 보존 / 별 plan ladder 자격 자연             |
| R-002 | DB function 본격 보존 paradigm 정합 검증 부족                   | medium   | testcontainers MSSQL 1 TC 본격 본격 (R-002 fn_Get_CarUserListView_2 native query 검증 / 결단 4.A 정합) |
| R-003 | iBATIS 2 → JPA 변경 시 sub-rule §X-H drift carry                | low      | carry `C-sub-rule-jpa-from-ibatis2-AP` 등록 (Type 2 외부 사용자 자연 trigger 의무)                     |
| R-004 | self-referential drift (chain 2 carry 2건 직후 동종 cycle risk) | medium   | paradigm A enforce / chain 2 carry queue 2 본격 본격 보류 유지 / 본 chain 3 외부 layer 만              |
| R-005 | RED 의무 위반 (impl 일부 존재 가정 시 pass)                     | low      | chain 3 = test generate 만 / impl 부재 시 모든 TC fail (compile_import_fail)                           |
| R-006 | session 안 4 release cap (LL-v930-02)                           | low      | 본 chain 3 = 외부 산출 만 / 본 레포 plan + memory 갱신 만 (release ❌)                                 |

---

## 7. 검증 (4원칙 STOP-3 정합)

### 7.1 외부 산출물 검증

- test-spec.json 본격 schema GREEN ✅
- acceptance-criteria.json in-place edit 후 schema GREEN ✅ (test_case_refs ≥ 1 backward 채움)
- spec-test-link-validator 본격 실행 (AC ↔ TC 정합)
- Phase 2 pre-fix 실측 entry fixture 본격 ([[feedback_self_recorded_fact_validation]] 정합 / paradigm A enforce 본격 본격)

### 7.2 본 레포 axis (영향 0)

- workspace test 영향 0 (본 plan = 외부 작업)
- release-readiness 21/22 보존 ✅
- skill-citation 0 stale ✅
- version 3-way 11.5.1 유지 (release ❌)

---

## 8. Lessons Learned (본 plan 종결 시점 자산화 / 후보)

- **LL-poc-17-20** — chain 3 test stage 첫 사내 live paradigm (R1' axis 6번째 corroboration 후보)
- **LL-poc-17-21** — 신규 stack 결단 chain 2 → chain 3 deadline 본격 정합 paradigm (paradigm 본격 본격 본격 본격 deadline 본격 fact 첫 사례)
- **LL-poc-17-22** — legacy preservation 정합 native query 본격 paradigm (DB function 117 LOC + STUFF FOR XML PATH('') + ISNULL 본격 본격 native query 본격 본격 보존)
- **LL-poc-17-23** — sub-rule §X-H drift 본격 본격 carry 자산화 (iBATIS 2 → JPA AP 본격 본격 본격 본격 새 paradigm 본격 사실 fact)

---

## 9. 참고 / 인용

- 직전 plan ladder = `.claude/plans/plan-poc17-chain2-spec-car-list.md` (chain 2 종결 / gate #2 go)
- chain 2 산출 frozen = `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/behavior-spec.{json,md}` + `acceptance-criteria.{json,md}`
- skill SSOT = `skills/test-generate-test-spec/SKILL.md`
- schema SSOT = `schemas/test-spec.schema.json`
- ADR-CHAIN-001 §3 (no-simulation / RED 의무) + ADR-CHAIN-004 §1 (framework match)
- [[feedback_self_recorded_fact_validation]] — paradigm-level fix plan Phase 2 entry fixture
- [[feedback_dual_goal_migration_plus_plugin]] — 듀얼 목표 정합

---

## 10. 4원칙 ladder 다음 단계

- **1원칙 종결** ✅ (본 plan.md / chain 2 산출 + skill 본문 + schema 본격 read 종결)
- **2원칙 research** = 가벼움 (skill 본문 본격 read 종결 + JPA dialect-specific carry 본격 본격 사용자 결단 본격 충족)
- **3원칙 사용자 승인** = §5 결단 5 묶음 보고 (본격 시행 전 본격 확정 의무)
- **4원칙 실패 시 revert** = §6 R-001~006 정합 / 본격 본격 self-referential drift 발생 시 revert + LL 기록 + 1원칙 재시작

# plan-poc17-chain4-impl-car-list

> **세션 54차 — 6 번째 plan ladder** (직전 = `plan-poc17-chain3-test-car-list.md` § chain 3 종결 / gate #3 go / RED 의무 정합).
> **4원칙 1단계** (깊이 숙지 / chain 3 산출 + skill 본문 + impl-spec.schema.json 본격 read 종결).
> **paradigm 정합** — paradigm A enforce + no-simulation 정합 + AI scope = impl generate / 사용자 scope = mvn test 실 실행.
> **본 plan 시행 = 다음 session 본격** (★ 본 session 54차 안 시행 ❌ / scope 분리 / token 본격 절약).

---

## 1. 목적 / scope

### 1.1 trigger 사실

session 54차 chain 3 종결 직후 사용자 결단:
- "(a) chain 4 (impl) 진입"
- "AI = impl generate 만 / 사용자 = mvn test 실 실행" (no-simulation 정합)
- "plan ladder 만 작성 + 다음 session 시행" (★ 본 session 안 시행 ❌)

### 1.2 scope-in (★ 다음 session 본격 시행)

- 본 PoC 6 화면 중 #1 car-list 만 (★ chain 3 동일 scope)
- chain 3 산출 frozen (test-spec + 7 test file + skeleton)
- chain 4 산출 신규:
  - `impl-spec.{json,md}` (★ IMPL-CAR-* 본격 / 5종 물증 10 필드 본격 의무)
  - 실 impl 코드 (Spring Boot 3.3 + JPA + Java 21 + MS-SQL Server)
  - `traceability-matrix` 갱신 (UC→BHV→AC→TC→IMPL forward+backward link)
- AC backward 채움 (★ chain 3 시점 종결 / chain 4 = impl backward link)
- 본 PoC test 100% pass 입증 (GREEN 의무 / `fail_count: const 0`)

### 1.3 scope-out

- 화면 #2~#6 = 별 cycle
- chain 5 (release readiness) = 별 plan ladder
- methodology body 변경 ❌ (paradigm A enforce)
- 사내 source 본격 cp ❌ (LL-codegraph-07 정합)
- AI 가 mvn test 시뮬레이션 ❌ (★ [[feedback_no_static_tool_simulation]] 정합)

---

## 2. ★ ★ ★ no-simulation paradigm enforce (사용자 결단 정합)

| layer | AI scope | 사용자 scope |
|---|---|---|
| **impl 코드 generate** | ✅ Controller + Service + Repository + Entity + DTO + Security config 본격 generate | ❌ |
| **신규 stack JPA Entity 매핑** | ✅ @Entity + @Id + @Column / Hibernate dialect | ❌ |
| **native query wrapper** (fn_Get_CarUserListView_2) | ✅ @Query(nativeQuery=true) / @Procedure | ❌ |
| **Security config** (sessionId NULL reject) | ✅ Spring Security + SecurityFilterChain bean | ❌ |
| **mvn build (compile)** | ❌ | ✅ `mvn compile` 실행 |
| **mvn test (★ 진짜 runner)** | ❌ | ✅ `mvn test` 실행 + 결과 record |
| **test_pass_evidence 10 필드 채움** | ❌ (★ placeholder 만) | ✅ stdout_path + duration_ms + pass_count + fail_count + result_hash + 등 |
| **MS-SQL testcontainer 실행** | ❌ | ✅ Docker daemon + image pull |
| **DB function 117 LOC seed** | ❌ (★ DDL script 참조 만) | ✅ seed script 본격 실행 |
| **commit_hash 채움** | ❌ (★ "TODO" placeholder) | ✅ `git rev-parse HEAD` 실측 |

★ ★ ★ AI 시뮬레이션 ❌ — `mvn test` 결과 본격 사용자 환경 실측 의무. impl-spec.json 안 test_pass_evidence 10 필드 = 사용자가 직접 채움 (★ 또는 후속 session 안 AI 가 사용자 mvn 결과 텍스트 받아서 record).

---

## 3. impl 모듈 분해 (IMPL-CAR-NNN)

### 3.1 impl 모듈 매트릭스

| ID | 책임 | TC backward | BHV backward | source_files | 우선순위 |
|---|---|---|---|---|---|
| **IMPL-CAR-001** | CarListController (GET /car/carList + POST /car/carListAjax) | TC-CAR-001-001~002 + TC-CAR-002-001~003 | BHV-CAR-001, BHV-CAR-002 | src/main/java/com/smilegate/efiweb/ifrs/car/controller/CarListController.java | MUST |
| **IMPL-CAR-002** | CarListService (RBAC 분기 dispatch + filter + paginate + sort) | TC-CAR-002-002~003 + TC-CAR-003-001~007 | BHV-CAR-002, BHV-CAR-031~033 | src/main/java/.../service/CarListService.java | MUST |
| **IMPL-CAR-003** | UserAccessRepository (fn_Get_CarUserListView_2 native query wrapper) | TC-CAR-003-001~003 + 005~007 | BHV-CAR-031~033 | src/main/java/.../repository/UserAccessRepository.java | MUST |
| **IMPL-CAR-004** | CarRepository (Spring Data JPA / RBAC INNER JOIN native query) | TC-CAR-002-001~003 + TC-CAR-003-001~003 | BHV-CAR-002 | src/main/java/.../repository/CarRepository.java | MUST |
| **IMPL-CAR-005** | Entity (Car + UserAccess + Company + Department) | 모든 TC | 모든 BHV | src/main/java/.../entity/{Car,UserAccess,Company,Department}.java | MUST |
| **IMPL-CAR-006** | DTO (CarListRequest + CarListResponse + CarRow + PaginationInfo) | 모든 TC | 모든 BHV | src/main/java/.../dto/{CarListRequest,CarListResponse,CarRow,PaginationInfo}.java | MUST |
| **IMPL-CAR-007** | ★ ★ SecurityConfig (sessionId NULL reject / F-RBAC-BYPASS-001 정합) | TC-CAR-001-002 + TC-CAR-003-004 + TC-CAR-003-008 | BHV-CAR-034 | src/main/java/.../config/SecurityConfig.java | ★ MUST critical |
| **IMPL-CAR-008** | ErpDeptRepository + ErpCompanyRepository (cross-DB SGERP) | (★ scope-out 본 chain 4 / carry) | BR-ERP-COMPANY-LIST-001 + BR-ERP-DEPT-LIST-001 | (carry / minimum scope ❌) | SHOULD |

★ MUST = 8 file (IMPL-CAR-001~007 본격) + Entity 4 file + DTO 4 file = **약 15 file 본격**.

### 3.2 generate 순서 (★ dependency 정합)

1. Entity 4 file (Car + UserAccess + Company + Department)
2. DTO 4 file (CarListRequest + CarListResponse + CarRow + PaginationInfo)
3. UserAccessRepository (fn_Get_CarUserListView_2 native query wrapper)
4. CarRepository (Spring Data JPA + native query)
5. CarListService (RBAC 분기 + filter + pagination + sort)
6. CarListController (REST endpoint)
7. ★ SecurityConfig (sessionId NULL reject)

★ ★ ★ 추가 자산 본격:
- src/main/java/.../CarMigrationApplication.java (★ Spring Boot main class)
- src/main/resources/sql/fn_Get_CarUserListView_2.sql (★ 사내 source DDL — 사용자 환경 본격 본격 seed 의무 / 본 plan placeholder)

---

## 4. 절차 (다음 session 본격 시행)

### Phase 1. impl generate (AI scope)

P-1. Entity 4 file (Car + UserAccess + Company + Department)
P-2. DTO 4 file
P-3. UserAccessRepository (★ native query @Query(value = "EXEC dbo.fn_Get_CarUserListView_2 ?", nativeQuery = true))
P-4. CarRepository (★ Spring Data JPA + native query for RBAC INNER JOIN)
P-5. CarListService (★ RBAC 분기 dispatch / sessionId NULL check / BR 12 enforce)
P-6. CarListController (★ GET /car/carList + POST /car/carListAjax)
P-7. SecurityConfig (★ F-RBAC-BYPASS-001 정합 / sessionId NULL reject)
P-8. CarMigrationApplication (★ @SpringBootApplication main class)

### Phase 2. impl-spec.json placeholder 산출 (AI scope)

P-9. impl-spec.json modules[] 8 본격 (IMPL-CAR-001~007 + main app)
P-10. test_pass_evidence 10 필드 = placeholder ("TODO_USER_MVN_RUN") 본격 (사용자 환경 본격 채움 의무)
P-11. coverage + human_review placeholder
P-12. schema-validator 본격 → GREEN (test_pass_evidence placeholder string 형식 정합 확인)

### Phase 3. mvn test 실 실행 (사용자 scope / 본 plan 외)

★ ★ ★ AI 시행 ❌ / 사용자 환경 본격 본격:
- `cd ~/.../poc-17-ifrs-car-migration/migration-target && mvn test`
- stdout 저장: `mvn test > .aimd/output/mvn-test-stdout.log 2>&1`
- result_hash: `sha256sum mvn-test-stdout.log`
- 결과 본격 user → AI 본격 record (★ 후속 session 안 impl-spec.json in-place edit)

### Phase 4. traceability-matrix-builder 본격 실행 (★ 후속 session)

P-13. impl-spec.json 본격 채움 후 traceability-matrix-builder 본격 실행
P-14. UC→BHV→AC→TC→IMPL forward+backward link 정합 확인

### Phase 5. gate #4 본격 보고 (★ 후속 session)

- GREEN 100% pass 본격 입증 (★ fail_count: const 0)
- chain 5 (release readiness) 진입 자격 본격

---

## 5. 사용자 승인 묶음 (3원칙 / 다음 session 본격 시행 결단)

본 plan ladder = 본 session 작성 만 / 시행 = 다음 session 본격. 시행 시점 결단 5종 본격:

### 결단 1. impl generate 우선순위

- **A. P-1~P-7 본격 풀 시행 (15+ file)** ★ 추천 (★ test 100% pass 의무 / minimum 시 fail 본격 발생)
- B. minimum (Controller + Service + Repository + Entity 4 file 본격) + 나머지 carry
- C. ★ ★ split (★ 2 session 분리: session A = Entity + DTO + Repository / session B = Service + Controller + Security)

### 결단 2. native query 본격 paradigm

- **A. @Query(nativeQuery=true) + EXEC dbo.fn_Get_CarUserListView_2 ?1** ★ 추천 (★ stored function call 본격 / MS-SQL 정합)
- B. @Procedure (★ JPA stored procedure 본격) — javax.persistence.@NamedStoredProcedureQuery
- C. JdbcTemplate (★ native SQL 직접 / Spring JDBC) — JPA 우회 자격 자연

### 결단 3. SecurityConfig 본격 paradigm (★ F-RBAC-BYPASS-001 정합 enforce)

- **A. SecurityFilterChain bean + custom Filter (sessionId NULL reject)** ★ 추천 (★ Spring Security 6.x 정합 + 신규 stack enforce)
- B. @PreAuthorize annotation (method-level / 본격 본격 paradigm)
- C. ★ ★ session 53차 F-RBAC-BYPASS-001 본격 recommendation 정합 — 4 layer 검증 chain (interceptor → controller → DAO → SQL) 본격 본격

### 결단 4. mvn 실행 사용자 환경 prerequisites

- **A. 사용자 직접 환경 준비** ★ 추천 (★ Java 21 JDK + Maven 3.x + Docker + MS-SQL container image)
- B. Dockerfile + docker-compose.yml 추가 (★ AI 가 본격 generate / 사용자 = docker-compose up + mvn test)
- C. Helm chart / k8s manifest — overkill

### 결단 5. test_pass_evidence 본격 record 본격

- **A. 사용자 → AI 본격 stdout 전달 → AI 가 impl-spec.json in-place edit** ★ 추천 (★ paradigm 정합 / 후속 session 본격)
- B. 사용자 직접 impl-spec.json edit
- C. 자동 record script (★ shell script 본격 본격 사용자 환경)

---

## 6. 위험 / 제약

| ID | 위험 | severity | 완화 |
|---|---|---|---|
| R-001 | impl 코드 본격 generate 시 token 폭주 (15+ Java file) | medium | 결단 1.C split 또는 1.B minimum + carry / 다음 session 본격 시행 |
| R-002 | native query 본격 + DB function 117 LOC 부재 시 testcontainer DDL seed 실패 | high | 결단 4.A / 사용자 환경 본격 본격 seed 의무 + 본 plan placeholder 명시 |
| R-003 | SecurityConfig 본격 enforce 부족 → F-RBAC-BYPASS-001 정합 위반 | critical | 결단 3.A + TC-CAR-003-004 본격 GREEN 의무 / sessionId NULL reject 본격 본격 enforce |
| R-004 | mvn test 실행 시 일부 TC fail (★ RED → GREEN 전환 부족) | high | impl 보강 cycle / 사용자 → AI 본격 fail log 전달 / revisit:test 또는 revisit:spec 자격 |
| R-005 | property test (jqwik) 본격 generate 시 fast-check arbitrary 본격 정합 부재 | medium | property_tests stub 본격 본격 → 사용자 검토 의무 (★ 70~80% 한계 정합) |
| R-006 | session 안 4 release cap (LL-v930-02) | low | 본 chain 4 = release ❌ 자연 (외부 산출만 / 본 레포 commit = plan + 후속 LL 만) |
| R-007 | ★ ★ self-referential drift (★ chain 3 발견 v11 cascade carry 동종 cycle risk) | medium | paradigm A enforce / methodology body 변경 ❌ / 외부 디렉토리 산출만 |
| R-008 | 100% test pass 본격 불가능 가능성 (★ environment 의존 axis) | high | 사용자 환경 본격 의무 + AI = impl boilerplate 정합 만 + revisit cycle 자격 자연 |

---

## 7. 검증 (4원칙 STOP-3 정합)

### 7.1 외부 산출물 검증 (★ 사용자 환경)

- impl-spec.json schema GREEN (placeholder 본격)
- traceability-matrix-builder 본격 실행 → matrix.coverage_summary.green_count 가 IMPL 까지 채움 (red_count == 0 의무)
- ★ ★ test-impl-pass-validator 본격 실행 (★ 사용자 환경) → ok=true + fail_count=0 의무
- chain-intervention-log.jsonl append

### 7.2 본 레포 axis (영향 0)

- workspace test 영향 0 (본 plan = 외부 작업)
- release-readiness 21/22 보존 ✅
- skill-citation 0 stale ✅
- version 3-way 11.5.1 유지 (release ❌)

---

## 8. Lessons Learned (★ 후속 session chain 4 종결 시점 자산화 / 후보)

- **LL-poc-17-24** — chain 4 impl stage 첫 사내 live paradigm (R1' axis 7번째 corroboration 후보)
- **LL-poc-17-25** — AI scope vs 사용자 scope 본격 분리 paradigm 본격 입증 (★ no-simulation 정합 + 환경 의존 axis 분리)
- **LL-poc-17-26** — Spring 4.1 + iBATIS 2 → Spring Boot 3.3 + JPA 본격 마이그레이션 first 사내 end-to-end 입증
- **LL-poc-17-27** — F-RBAC-BYPASS-001 chain 1 → chain 4 forward link 완성 (security invariant enforce / SecurityConfig 본격 본격)

---

## 9. 참고 / 인용

- 직전 plan ladder = `.claude/plans/plan-poc17-chain3-test-car-list.md` (chain 3 종결 / gate #3 go / RED 의무 정합)
- chain 3 산출 frozen = `~/.../poc-17-ifrs-car-migration/.aimd/output/test-spec.{json,md}` + `migration-target/` skeleton
- chain 2 산출 frozen = `behavior-spec.{json,md}` + `acceptance-criteria.{json,md}`
- skill SSOT = `skills/implement-generate-impl-spec/SKILL.md`
- schema SSOT = `schemas/impl-spec.schema.json` (★ test_pass_evidence 10 필드 본격 required / fail_count const 0)
- ADR-CHAIN-001 §1 + §3 (no-simulation 강화)
- DEC-2026-05-06-v2.0-i-strict-채택 §70~80% 한계
- [[feedback_no_static_tool_simulation]] — AI 시뮬레이션 ❌ / 진짜 도구 실행 의무
- [[feedback_dual_goal_migration_plus_plugin]] — 듀얼 목표 정합

---

## 10. 4원칙 ladder 다음 단계

- **1원칙 종결** ✅ (본 plan.md / chain 3 산출 + skill 본문 + schema 본격 read 종결)
- **2원칙 research** = 가벼움 (impl-generate-impl-spec skill 본격 read 종결 + JPA native query + Spring Security 6.x paradigm 본격 사용자 결단 본격 충족)
- **3원칙 사용자 승인** = §5 결단 5 묶음 보고 (★ ★ ★ ★ ★ **다음 session 본격 시행 시점 본격 결단 의무** ★ ★ ★ ★ ★)
- **4원칙 실패 시 revert** = §6 R-001~008 정합 / impl test 100% pass 실패 시 revisit:test 또는 revisit:spec / 본격 self-referential drift 발생 시 revert + LL 기록 + 1원칙 재시작

---

## ★ ★ ★ 본 plan ladder 시행 시점 본격 (다음 session 본격)

- **본 session 54차 안 시행 ❌** (★ ★ ★ token 본격 한계 + scope 분리 / 사용자 결단 정합)
- **다음 session 진입 시점 본격 본격 본격** = §5 결단 5 묶음 본격 확인 → Phase 1~5 본격 시행

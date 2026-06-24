# PoC #16 EFI-WEB car — Finding 누적 로그

> finding-system.schema.json 정합 / phase 별 누적 / chain harness gate 평가 입력.

## Phase: `input` (2026-05-28)

### F-POC15-IN-001 (informational / carry)

- **type**: paradigm-corroboration
- **severity**: info
- **summary**: R1' axis Spring 4.1 + iBATIS 2 paradigm 4번째 corroboration (사내 EFI-WEB / PoC #06+#07+#11 trio 후속)
- **detail**: 본 PoC 주 axis = D-axis (artifact-graph e2e). R1' 측정은 carry / blocking ❌.

### F-POC15-IN-002 (medium / carry)

- **type**: external-dependency
- **severity**: medium
- **summary**: 4 외부 DB (FIM / SGERP / e_hr / ekporg) 18 object source 부재
- **detail**: sqlmap 호출 시그니처만 추출 가능 / DDL ❌. `source/_cross-db-dependencies.md` 명문화 / 분석 stage 의 db-schema phase 에서 `external_only:true` 마커 의무.

### F-POC15-IN-003 (medium / carry)

- **type**: external-dependency
- **severity**: medium
- **summary**: Stored Procedure 1건 (SGERP.dbo.SG_SACSlipRowCarManagementIFQuery) 본체 부재
- **detail**: 외부 DB SGERP 의 SP / carCost.xml line 328 `<procedure>` 호출 / parameterMap 으로 6 input parameter 시그니처만 추출 가능. business-rules anchor 후보 = "차량비용 회계전표 IF 전송".

### F-POC15-IN-004 (process / 정정 사실)

- **type**: input-completeness
- **severity**: medium
- **summary**: 사용자 지적으로 첫 사본 누락 정정 — IFRS_split DDL 폴더 + ifrs.erd 보강
- **detail**: 초기 탐사 (maxdepth 2) 가 ifrs/IFRS_split/ 폴더 누락 → 사용자 지적 후 정정. car own table DDL 6 + function 3 + 전체 ERD ifrs.erd (188K) 추가 사본. 분석 입력 부실 회피.

---

## Phase: `template-analyze` (2026-05-28)

### F-POC15-TA-001 (critical / policy violation)

- **type**: jsp-scriptlet
- **severity**: critical
- **summary**: JSP scriptlet 0-absolute policy 위반 — 8건 검출 (4 JSP × 2건 isomorphic)
- **detail**:
  - 위반 파일/라인: carDriveInsertForm:655+658, carCostSumSystem:393+396, carCosting:426+429, carCostConfirm:409+412
  - 패턴: `<% final int thisYear = Calendar.getInstance().get(Calendar.YEAR); ... %>` (year-loop scriptlet / 4 JSP isomorphic copy-paste anti-pattern)
  - 정책: v3.4.0 G4 사용자 결단 = JSP scriptlet 0 absolute / 1건 이상 = critical + migration-cautions.md 등재 의무
  - 출처: grep-fallback (PMD JSP parser 가 HTML5 doctype 으로 파싱 실패 / no-simulation 정합 / LLM 양심 count ❌)
  - 등재 대상: migration-cautions.md 의 JSP scriptlet 제거 마이그레이션 의무

### F-POC15-TA-002 (critical / security)

- **type**: xss-marker
- **severity**: critical
- **summary**: XSS risk — unsanitized JSP expression (`<%= %>`) 20건 검출
- **detail**:
  - PMD NoUnsanitizedJSPExpression rule 19건 + grep-fallback 1건 (carInclude.jsp:6 / line 위치는 PMD 결과 line 3 과 grep 결과 line 6 다름 — 본 PoC 시점 PMD 파싱 부분 성공)
  - 가장 무거운 파일: carSelectPopupAjax.jsp (10건) / carListAjax.jsp (6건)
  - 마이그레이션 시: `<%= %>` → JSTL `<c:out value="..."/>` 또는 EL `${...}` (auto-escape) 의무
  - 출처: PMD 7.24.0 + grep-fallback / no-simulation 정합

### F-POC15-TA-003 (medium / tooling)

- **type**: external-tool-coverage
- **severity**: medium
- **summary**: PMD JSP parser 14 JSP 중 10건 ParseException (HTML5 doctype 호환성 한계)
- **detail**:
  - 파싱 실패 10: carCostConfirm / carCosting / carCostingNoDriveLog / carCostSumSystem / carDriveInsertForm / carDriveListAjax / carInsertForm / carList / carSelectPopup / popCarCostSlip
  - 파싱 성공 4: carInclude / carListAjax / carSelectPopupAjax / loading
  - 사유: 파싱 실패 JSP 가 모두 `<!DOCTYPE html>` 로 시작하는 HTML5 doctype → PMD JSP grammar 가 `<!` 토큰을 unknown 으로 처리
  - 보완: grep-fallback (결정적 / LLM count ❌) 로 scriptlet + raw output 추가 추출
  - 등재 대상: tooling-limits.md (본 PoC 신설 가능) — PMD JSP 7.x HTML5 호환 한계 사실 명문화

### F-POC15-TA-004 (minor / coding-style)

- **type**: jsp-coding-style
- **severity**: minor
- **summary**: 기타 PMD 위반 — class attribute / inline style / inline script / HTML comments / encoding
- **detail**: NoClassAttribute 4 / NoInlineScript 1 / NoInlineStyleInformation 1 / NoHtmlComments 1 / JspEncoding 1 / NoLongScripts 1 = 9건. 마이그레이션 시 best-practice 적용 carry.

### F-POC15-TA-005 (info / template-hierarchy)

- **type**: template-include-graph
- **severity**: info
- **summary**: 14 JSP 모두 `/WEB-INF/jsp/config/include.jsp` 공통 include (단일 공통 헤더 paradigm)
- **detail**:
  - 정적 include (`<%@ include`): 14건 (전부 config/include.jsp)
  - 동적 include (`<jsp:include`): 11건 (7 JSP) — carInclude.jsp 와 loading.jsp 가 주 dependency target
  - JSTL taglib: **0건** (`<%@ taglib` ❌) — JSTL 미사용 paradigm 사실
  - taglib 부재 = scriptlet/raw expression 사용 강도 ↑ (정합)

---

## Phase: `discovery (analysis 내부)` (2026-05-28)

### F-POC15-DI-001 (medium / package-structure)

- **type**: package-anti-pattern
- **severity**: medium
- **summary**: DAO 가 `service/impl/` 안에 위치 (Spring 컨벤션 위반)
- **detail**:
  - 위반: `smilegate.ifrs.car.service.impl.CarMgtDAO` + `smilegate.ifrs.car.service.impl.CarCostDAO`
  - Spring 컨벤션: `dao/` 또는 `repository/` 별도 패키지 권장 (Controller / Service / Repository 3-tier 명확 분리)
  - 영향: 의존성 그래프 안 layer 경계 흐려짐 / DDD 적용 시 부정적
  - 등재 대상: analysis-quality-antipattern phase 의 antipatterns.json + avoid-list.md
  - 마이그레이션 cost: low (패키지 이동 + import 갱신만)

### F-POC15-DI-002 (info / tooling-quirk)

- **type**: tooling-output-divergence
- **severity**: info
- **summary**: cloc XML 4 카운트 vs 본 PoC sqlmap 2 — cloc 내부 분류 차이
- **detail**:
  - cloc 2.08 결과 = XML 4 파일 / 5747 code LOC
  - 본 PoC source/ 안 XML = sqlmap 2 (carCost.xml + carMgt.xml)
  - 차이 사유: cloc 이 다른 형식 (예: .erd, \_manifest.yml 안 일부 XML 패턴?) 도 XML 으로 분류한 가능성. 정확 원인 = cloc 출력만으로 추적 가능
  - 본 PoC 결정적 사실 = sqlmap 2개 / 5747 LOC 의 4 파일 합계는 cloc 내부 metric
  - 영향: stats.json `loc.by_language.xml` 의 files=4 와 실 sqlmap 2 의 차이 명문화 (note 필드)

### F-POC15-DI-003 (medium / sql-inventory-precursor)

- **type**: dao-sqlmap-mismatch
- **severity**: medium
- **summary**: DAO call 36 vs sqlmap statement 37 = 1건 차이
- **detail**:
  - DAO call (CarMgtDAO + CarCostDAO 안 grep `"<DAOname>.<method>"`) = 36건
  - sqlmap statement (`<select|insert|update|delete|procedure>`) = 37건
  - 차이 원인 후보: (a) DAO 호출 없는 statement 1건 (dead code 추정) / (b) 동일 statement 중복 호출
  - 등재 대상: sql-inventory phase 정밀 검증 carry / migration_priority 분류 시 dead code 식별

### F-POC15-DI-004 (info / corroboration)

- **type**: paradigm-corroboration
- **severity**: info
- **summary**: R1' axis Spring 4.1 + iBATIS 2 paradigm 4번째 corroboration trio 확장 (PoC #06+#07+#11 → +#15)
- **detail**:
  - 결정적 증거 = inventory.json stack section + stack-detection.md
  - 분석 §3-A automation 측정 = analysis stage 종료 후 별도 산출 carry
  - 본 PoC 주 axis ≠ R1' / 주 axis = D-axis (artifact-graph e2e)

---

## Phase: `db-schema` (2026-05-28)

### F-POC15-DB-001 (medium / FK 추론)

- **type**: fk-inferred
- **severity**: medium
- **summary**: FK CONSTRAINT 명시 부재 — 6 own table 모두 PK CONSTRAINT 만 정의 / FK ❌
- **detail**:
  - 추론 FK 4건 (모두 컬럼명 컨벤션):
    - tb_car_user_term.car_idx → tb_car.idx
    - tb_car_drive.car_idx → tb_car.idx
    - tb_car_cost.term_idx → tb_car_user_term.term_idx
    - tb_car_cost_slip.cost_idx → tb_car_cost.cost_idx
  - 외부 FK 추론: tb_car_cost_slip.slip_id → SGERP.\_TACSlip.slip_id (외부 DB)
  - 영향: 운영 DB 정밀 검증 시 일부 FK 가 의도와 다를 수 있음 (carry)
  - 마이그레이션 시: 새 DB schema 에 ALTER TABLE ADD CONSTRAINT 명시 의무 (referential integrity 보장)

### F-POC15-DB-002 (medium / composite PK)

- **type**: composite-pk-anti-pattern
- **severity**: medium
- **summary**: TB_CAR_COST_SLIP 복합 PK (cost_idx + slip_id + cost_gubun) — schema description anti-pattern 정합
- **detail**:
  - schema description: "단일 PK 권장 — 복합 PK는 안티패턴"
  - 영향: 도메인 entity 매핑 시 composite identifier 처리 의무 / DDD value object 후보
  - 마이그레이션 추천: surrogate PK (slip_id 같은 single auto-increment) 도입 + composite (cost_idx, slip_id, cost_gubun) UNIQUE CONSTRAINT 유지

### F-POC15-DB-003 (medium / column drift)

- **type**: column-meaning-duplication
- **severity**: medium
- **summary**: TB_CAR_DRIVE 안 거리 컬럼 2개 (drive_dist + distance) 의미 중복 가능성
- **detail**:
  - drive_dist DECIMAL(10,2) — 운행 거리 (자명한 의미)
  - distance DECIMAL(10,2) — 추가 거리 (별 의미? 자택-근무지? 자명 ❌)
  - 영향: business-rules phase 정밀 검증 carry / sqlmap 안 사용 컬럼 추적 의무
  - 가능성: distance 가 dead column (legacy migration 잔재) 또는 drive_dist 와 다른 measure (총 거리 vs work 거리?)

### F-POC15-DB-004 (medium / ERD-DDL drift unverified)

- **type**: erd-source-coverage
- **severity**: medium
- **summary**: ERD 파일 (car.erd 60K + ifrs.erd 188K) ↔ DDL cross-check ❌ (viewer 부재)
- **detail**:
  - 본 PoC 환경: ERD 형식 unknown (ER/Studio 또는 DA# 추정) / open-source viewer 부재
  - DDL 만 source → ERD ↔ DDL 의미 동등 검증 ❌
  - 영향: ERD 안 추가 entity/relationship 정의 누락 가능성 (carry)
  - manual_extraction = ERD viewer 가용 시 cross-check 의무 / meta-confidence raw_confidence 0.88 (cap 0.95 — ERD source 불완전 사실 반영)

### F-POC15-DB-005 (low / file naming drift)

- **type**: phase-flow-output-naming
- **severity**: low
- **summary**: phase-flow contract 의 한글 산출물명 (`정합성-검증-보고서.md`) ↔ 본 PoC 영문 (`db-schema-consistency-report.md`) drift
- **detail**:
  - 본 PoC 결단: 영문 통일 (디렉토리 path / git 명명 친화)
  - 영향: drift-validator 가 정확 phase-flow 이름 매칭 ❌ but 본 phase 의 file naming convention 은 다른 PoC (#03 등) 도 영문 통일 추이
  - carry: methodology-spec 본체 의 한글-영문 명명 컨벤션 명문화 필요 (별도 ADR 후보 / 본 PoC scope 외)

### F-POC15-DB-006 (info / external dependency reveal)

- **type**: cross-db-anchor
- **severity**: info
- **summary**: TB_CAR_COST_SLIP ↔ SGERP.\_TACSlip — 본 PoC 의 ERP 연동 anchor (회계전표 IF)
- **detail**:
  - 본 connection = 차량비용 → 회계전표 전송 비즈니스 흐름의 schema-level 근거
  - SP `SG_SACSlipRowCarManagementIFQuery` (signature only) 와 함께 ERP IF 의 핵심 anchor
  - business-rules phase 의 BR anchor 후보 = "차량비용 회계전표 IF 전송" + "회계전표 ID 매핑"

---

## Phase: `architecture` (2026-05-28)

### F-POC15-AR-001 (info / external IFRS modules)

- **type**: external-module-dependency
- **severity**: info
- **summary**: car 모듈이 4 사내 IFRS 모듈 (cmm/common/connect/egov) 에 의존 — 본 PoC scope 외
- **detail**:
  - smilegate.ifrs.cmm.util.{DateUtil, IfrsUtil, StringUtil} (공통 유틸)
  - smilegate.ifrs.common.service.CommonService (공통 서비스)
  - smilegate.ifrs.connect.service.ConnectService (외부 연결)
  - smilegate.ifrs.egov.service.impl.EgovComAbstractDAO (DAO 부모)
  - 마이그레이션 시: 외부 4 모듈 동시 분리 또는 추상화 의무
  - cross-module 순환 의존 가능성 = 본 PoC 환경 검증 ❌ (carry)

### F-POC15-AR-002 (info / no-circular)

- **type**: clean-direction
- **severity**: info
- **summary**: car 모듈 내부 순환 의존성 0건 — 단방향 layered ✅
- **detail**:
  - WEB → SVCAPI ← SVCIMPL → DAO → SQLMAP → DDL (forward 단방향)
  - ADR-006 (순환 의존 정책) 정합
  - 검증 방법 한계: Java import 수동 grep + 의미 추론 (tarjan_scc 자동 도구 미실행) — meta_confidence high but 자동 SCC ❌
  - carry: 마이그레이션 시 ArchUnit / jdeps 자동 도구 적용 권고

### F-POC15-AR-003 (low / tooling)

- **type**: drift-validator-coverage
- **severity**: low
- **summary**: drift-validator architecture comparator 미구현 (json=unknown, mermaid=unknown)
- **detail**:
  - 본 PoC 의 `architecture.json` ↔ `architecture.mermaid` 페어 = drift-validator 검출 ✅ but 비교 ❌
  - drift-validator 의 detectArtifactType (normalize-json.js) = phase-flow / chain-flow / state-machine / state-map-fe / sequence / decision-table 만 지원 → architecture type 미지원
  - 영향: 본 PoC 의 architecture 이중 렌더링 의미 동등성 = 자동 검증 ❌ / 수동 검증 (architecture.md cross-read) 의무
  - carry: drift-validator 의 architecture comparator 신설 (별도 ADR / 본 PoC scope 외)

### F-POC15-AR-004 (info / monolith reveal)

- **type**: monolith-context
- **severity**: info
- **summary**: EFI-WEB ifrs = single war monolith / 23 도메인 모듈 (car 포함) 모두 같은 deployment
- **detail**:
  - 본 PoC scope = car 모듈만 / 전체 monolith 의 1/23
  - 마이그레이션 시: 모듈 단위 추출 = strangler fig pattern 적용 가능 / 한 번에 전체 마이그레이션 risk 큼
  - architecture_style = layered (모듈 내부) + monolith (전체 deployment) 이중 라벨링

---

## Phase: `business-logic` (2026-05-28 / 4영역 병렬)

### F-POC15-BL-001 (info / domain reveal)

- **type**: bounded-context-identification
- **severity**: info
- **summary**: 2 Bounded Context 식별 — BC-CAR-MGT (차량 관리) + BC-CAR-COST (차량 비용)
- **detail**:
  - 같은 codebase 안 cross-BC 의존 (term_idx 로 Mgt.CarUserTerm → Cost.Cost)
  - Mgt = strong consistency (single transaction) / Cost = eventual consistency (cross-DB SGERP SP)
  - 3 aggregate (Car + Cost + CostNolog)

### F-POC15-BL-002 (critical / anchor)

- **type**: business-rule-anchor
- **severity**: critical
- **summary**: BR-CAR-COST-003 (차량비용 → ERP 회계전표 IF SP 호출) 식별 — 본 PoC 핵심 anchor
- **detail**:
  - 외부 SP `SGERP.SG_SACSlipRowCarManagementIFQuery` 호출 (signature: useComCd, strDate, endDate, userNm + hardcoded 0, '', '')
  - TB_CAR_COST_SLIP composite PK 등록 + cross-DB FK (SGERP.\_TACSlip)
  - cross-DB transaction 보장 ❌ → eventual consistency
  - 마이그레이션 시 가장 큰 위험점 / saga pattern 또는 outbox 도입 권고

### F-POC15-BL-003 (info / BR 추출 12건)

- **type**: business-rule-extraction
- **severity**: info
- **summary**: 12 BR 추출 (BC-CAR-MGT 6 + BC-CAR-COST 6 / critical 1 + high 5 + medium 4 + low 2)
- **detail**:
  - 출처: sqlmap statement (37) + DDL (6 table + 3 function) + Java service method
  - R1' axis Spring 4.1 + iBATIS 2 paradigm = 자동화 50%대 ceiling 예상 (PoC #06/#07/#11 정합)
  - 일부 BR (STATE 코드 / cost_accept_cd enum 값 분포) = LLM 추론 / cross-consistency Layer 2 검증 carry

### F-POC15-BL-004 (info / antipattern partial 9건)

- **type**: antipattern-partial-discovery
- **severity**: info
- **summary**: 9 anti-pattern 식별 (critical 2 + high 3 + medium 4) — phase quality 의 antipatterns.json (full) merge 대상
- **detail**:
  - critical: AP-FE-001 (scriptlet 8건) + AP-SEC-001 (XSS 20건)
  - high: AP-DB-002 (FK 부재) + AP-DB-003 (cross-DB join) + AP-EXT-001 (외부 SP)
  - medium: AP-ARCH-001 (DAO 패키지) + AP-DB-001 (composite PK) + AP-DB-004 (column drift) + AP-DOMAIN-001 (HashMap DTO)
  - 마이그레이션 가이드 모두 포함 (recommended_alternative + migration_advice)

---

## Phase: `formal-spec` (2026-05-28 / Phase 4.5)

### F-POC15-FS-001 (info / partial coverage)

- **type**: formal-spec-partial
- **severity**: info
- **summary**: formal-spec 3종 demo 산출 (FSM 1 + sequence 1 + DT 1) / 12 BR 중 3개만 본격
- **detail**:
  - Car-CostAccept FSM (cost_accept_cd / 4 state / 6 transition) — BR-CAR-COST-002 anchor
  - UC-CAR-COST-001 sequence (admin → controller → service → DAO → iBATIS → SGERP SP → IFRS DB) — BR-CAR-COST-003 anchor
  - BR-CAR-MGT-006 decision table (Leader 인증 / FIM 외부 DB 의존)
  - invariants + property_tests = 빈 array (TypeScript 마이그레이션 target 코드 / impl stage carry)
  - 나머지 9 BR (의무 필드 / USE_YN / STATE 코드 / TOT_DIST 자동 갱신 / CarUserTerm / 비용 항목 5종 / NoLog / CostSumSystem / FN_SPLIT) = formal-spec partial carry

### F-POC15-FS-002 (medium / no-simulation penalty)

- **type**: external-tool-absent
- **severity**: medium
- **summary**: 외부 정적 분석 도구 (Daikon / CodeQL / SonarQube) 본 PoC 환경 ❌ — cross_validation simulation_only=true / 신뢰도 -5%p 패널티
- **detail**:
  - cross_validation.validators = 1건 (main_agent / real_tool=false / simulation_reason 명시)
  - 시뮬 ❌ 정합 / 단 진짜 도구 1회 실행도 ❌ → 신뢰도 0.75 cap (정밀 추적성 보장)
  - carry: impl stage 진입 후 Daikon (Java runtime trace) 또는 CodeQL DB build 시도 권고

### F-POC15-FS-003 (info / decision-table-validator finding)

- **type**: decision-table-required-fields
- **severity**: info
- **summary**: decision-table-validator 검출 — http_status + error_message field 가 lifecycle BR (security) 에도 명시 의무 (null 허용)
- **detail**:
  - 초기 BR-CAR-MGT-006.json 작성 시 http_status + error_message 누락 → validator breaking 2건
  - 정정: null 명시로 lifecycle/non-API BR 명문화 (schema v1.2.3 사용자 결단)
  - 학습: lifecycle BR 도 if/then 분기 의무 (decision-table-validator 정합 paradigm 인지)

---

## Phase: `characterization` (2026-05-28 / v2.1.0 Phase 4.7)

### F-POC15-CH-001 (info / partial coverage)

- **type**: characterization-partial
- **severity**: info
- **summary**: 2 UC snapshot 본격 (UC-CAR-COST-001 + UC-CAR-MGT-001) / 34 endpoint 중 2 = 6% / coverage matrix 4 UC = 50% pending
- **detail**:
  - happy + edge + likely_bug 다양한 scenario 6건 작성
  - intent_vs_bug 4 분류: BR 12 (intent 8 / bug 0 / ambiguous 4 / SR 0) + AP 9 (intent 0 / bug 6 / ambiguous 0 / SR 3)
  - named_classified_ratio = 81% ≥ 80% threshold ✅

### F-POC15-CH-002 (high / R15 silent enabler 차단)

- **type**: code-only-domain-expert-carry
- **severity**: high
- **summary**: characterization-coverage-validator 검출 — data_source_status='code_only' 시 도메인 expert 검증 의무 (R15 정합)
- **detail**:
  - UC-CAR-COST-001 + UC-CAR-MGT-001 모두 code_only / 운영 DB 접근 ❌ / 도메인 expert 인터뷰 ❌
  - validator HIGH 2건: AI hypothesis 가능성 / 도메인 정합 보장 불가
  - carry: 본 PoC chain 4 (test stage) 진입 시 도메인 expert 결단 의무
  - blocking ❌ (본 PoC chain 2 까지 진행 / D-axis 우선)

### F-POC15-CH-003 (info / SATD detection)

- **type**: satd-self-recognized
- **severity**: info
- **summary**: self_recognized 자조 코멘트 3건 검출 (Maldonado & Shihab 2015 SATD 정합)
- **detail**:
  - `fn_Get_CarUserListView_2.sql:39` — "(임시적용)" / 비서 인사발령 전 김주아 대리 지원 예외 (한국어 자조)
  - `CarMgtDAO.java:138` — "TODO Auto-generated method stub" / IDE 잔재
  - `CarMgtServiceImpl.java:210` — "TODO Auto-generated catch block" / IDE 잔재
  - Legacy stack 자연 빈도 (3건) vs Modern (PoC #03 NestJS = 0건) corroboration 정합
  - 마이그레이션: # 1 (비즈니스 임시 예외) = 도메인 expert 결단 / # 2 + 3 = 정식 처리

### F-POC15-CH-004 (medium / ambiguous carry 4건)

- **type**: ambiguous-carry-required
- **severity**: medium
- **summary**: 4 BR ambiguous (BR-CAR-MGT-003 STATE / BR-CAR-COST-002 cost_accept_cd / BR-CAR-COST-004 NoLog / BR-CAR-COST-005 CostSumSystem) — 도메인 expert 결단 의무
- **detail**:
  - 모두 carry_owner='domain_expert' / carry_reason 명시
  - chain 4 (test stage) 진입 시 결단 후 진행 / 본 PoC chain 2 까지 = blocking ❌

---

## Phase: `sql-inventory` (2026-05-28 / v2.2.0 RDB only)

### F-POC15-SQ-001 (info / auto_ratio 66.7% 안정)

- **type**: auto-extraction-ratio
- **severity**: info
- **summary**: auto_ratio_external_6 = **66.7%** (4/6) — **사내 EFI-WEB 4 PoC isomorphic 안정점** (delta 0.0%p)
- **detail**:
  - PoC #06 (66.7%) + #07 (66.7%) + #11 (66.7%) + **#15 (66.7%)** = 4 PoC corroboration
  - auto: sql_id / mapper_xml / mapper_xml_line / statement_type / dependent_tables / dynamic_branch (6) ※ extraction_automation 안 6 명시
  - manual: called_from_screen / business_meaning / intent_vs_bug_classification (3)
  - R1' axis paradigm Spring 4.1 + iBATIS 2 = 66.7% 안정 사실 robust

### F-POC15-SQ-002 (info / partial coverage)

- **type**: sql-inventory-partial
- **severity**: info
- **summary**: 37 statement 중 6 본격 추출 / 31 partial carry — D-axis 우선
- **detail**:
  - 본격 추출 6 = 핵심 anchor (insertCar / selectLeaderUserId / selectCarCostCalculate / saveCarCostAccept / insertCarCostSlip / updateCarTotDist)
  - 모두 BR anchor 매핑 명시
  - 31 partial = impl stage 진입 후 전수 추출 carry

### F-POC15-SQ-003 (info / external dependency / CALLABLE 1건)

- **type**: external-statement-type
- **severity**: info
- **summary**: CALLABLE statement_type 1건 (SGERP.SG_SACSlipRowCarManagementIFQuery) — 외부 SP 호출 정합
- **detail**:
  - PREPARED 5 + CALLABLE 1 = 6 본격
  - MyBatis 14 표준 statement_type 정합 (Agent 1 강 권고 흡수)
  - dependent_tables 22 unique (own 6 + external 16)
  - external_calls_count = 1 (SP)

### F-POC15-SQ-004 (info / 자동 검증 0 finding)

- **type**: validator-clean
- **severity**: info
- **summary**: sql-inventory-validator = 0 finding (critical 0 / high 0 / medium 0) ✅
- **detail**:
  - inventory 6 records / auto_ratio 66.7% pass / carry_flags 0
  - schema-validator + sql-inventory-validator 양쪽 통과
  - 본 phase 의 가장 깨끗한 validator 결과 (R1' axis 안정 정합)

---

## Phase: `api` (2026-05-28)

### F-POC15-AP-001 (high / paradigm mismatch)

- **type**: not-rest-api
- **severity**: high
- **summary**: Spring MVC 4.1 + JSP server-rendered paradigm — REST API ❌ / OpenAPI = 마이그레이션 target spec
- **detail**:
  - 모든 controller method = `public String` (JSP view name) 반환
  - `@ResponseBody` / `ResponseEntity` = 0 hit (grep)
  - Ajax endpoint 도 ModelMap forward → JSP fragment (Content-Type=text/html)
  - 영향: 본 OpenAPI = 현 상태 추출 ❌ / REST 전환 anchor 만 / api-extension warnings 명시
  - 마이그레이션: `@RestController` 또는 `ResponseEntity<T>` 반환 + JSP 제거

### F-POC15-AP-002 (critical / AP-API-001)

- **type**: error-handler-absent
- **severity**: critical
- **summary**: @ExceptionHandler / @ControllerAdvice = 0건 (grep / negative-space corroboration)
- **detail**:
  - ADR-BE-001 정합 negative_evidence 4 항목 충족
  - exception 발생 시 client = Resin 기본 HTML 500 / structured error ❌
  - domain exception → throw_unmapped (RFC 9457 ProblemDetail 미준수)
  - 마이그레이션: `@RestControllerAdvice` + `@ExceptionHandler` + `ProblemDetail` 도입 의무
  - automatic_regression: semgrep custom rule (controller-advice-absent.yml)

### F-POC15-AP-003 (info / spectral 실 실행 결과)

- **type**: openapi-lint-clean
- **severity**: info
- **summary**: Spectral 6.16.0 lint 실 실행 — 11 warnings / 0 errors / valid OAS 3.0.3 ✅ (no-simulation 정합)
- **detail**:
  - warnings: info.contact 1 + operation-description 10 (cosmetic)
  - errors 0 → valid OpenAPI 3.0.3
  - tool: `spectral lint openapi.yaml --ruleset spectral:oas`
  - 본 PoC 의 진짜 외부 도구 실 실행 사례 (PMD JSP / cloc / spectral 누적 3종)

### F-POC15-AP-004 (info / API extension 10/34 partial)

- **type**: api-extension-partial
- **severity**: info
- **summary**: api-extension operations 10/34 본격 / 24 carry (impl stage 전수 추출)
- **detail**:
  - 본격 10 = 핵심 anchor (BR 매핑 명시)
  - 24 partial = REST 전환 시 endpoint 별 ResponseEntity / DTO 설계 carry
  - schemas_to_entities 4 매핑 (CarInsertForm / CarDriveForm / CarCostCalculateRequest / CarCostSlipRow)

---

## Phase: `ui` (2026-05-28 / Scenario C / FE 부재)

### F-POC15-UI-001 (info / FE state-map 0)

- **type**: scenario-c-state-source-all-false
- **severity**: info
- **summary**: state-map 5 진실 모두 detected=false (Scenario C JSP / server-side state paradigm)
- **detail**:
  - server_cache / client_state / url_state / form_state / dom_state = 모두 ❌
  - machines = 0 (server-side state 본질)
  - Modern FE 마이그레이션 시 React + TanStack Query + Zustand 도입 권고

### F-POC15-UI-002 (medium / visual-manifest carry)

- **type**: visual-manifest-not-run
- **severity**: medium
- **summary**: visual-manifest snapshots = 0 / Playwright / Storybook 미실행 (no-simulation 정합)
- **detail**:
  - carry_count = 14 (모든 JSP)
  - 본 PoC 환경 Playwright 가용성 ❌ / 시뮬 ❌
  - Modern 마이그레이션 시 visual regression baseline 신설 의무

### F-POC15-UI-003 (info / type-spec 8 Java + DTO 0)

- **type**: dto-class-absent
- **severity**: info
- **summary**: type-spec types 8 (Java class/interface) / DTO/VO class **0건** — AP-DOMAIN-001 정합
- **detail**:
  - 8 type: CarMgtController / CarCostController / CarMgtService / CarCostService / CarMgtServiceImpl / CarCostServiceImpl / CarMgtDAO / CarCostDAO
  - HashMap-based paradigm (Map param / Map<String, String> / EgovMap 만)
  - Modern 마이그레이션 시 typed DTO + Spring Bean Validation 신설 의무
  - captured_by = manual_extraction (Java source / ts-morph 부적용)

### F-POC15-UI-004 (info / ui-spec 10/14 page)

- **type**: ui-spec-partial
- **severity**: info
- **summary**: ui-spec pages 10 (named page) / 14 JSP 중 4 보조 (Ajax fragment / loading / include) 제외
- **detail**:
  - 5 Mgt page + 5 Cost page
  - 4 JSP 보조: carInclude (공통 JS) / loading (indicator) / carListAjax + carDriveListAjax + carSelectPopupAjax + carCostingNoDriveLog 등 fragment
  - Modern 마이그레이션 시 SPA route 매핑 + popup → modal/dialog 전환 권고

---

## Phase: `quality` (2026-05-28 / analysis stage 종결)

### F-POC15-QU-001 (info / antipattern full 10건)

- **type**: antipattern-full
- **severity**: info
- **summary**: antipatterns.json (full) 10건 — partial 9 + AP-API-001 (negative-space) 추가
- **detail**:
  - critical 2 (AP-FE-001 scriptlet / AP-SEC-001 XSS)
  - high 4 (AP-DB-002 FK 부재 / AP-DB-003 cross-DB / AP-EXT-001 외부 SP / **AP-API-001 ExceptionHandler 부재**)
  - medium 4 (AP-ARCH-001 DAO 패키지 / AP-DB-001 composite PK / AP-DB-004 column drift / AP-DOMAIN-001 HashMap)
  - category 분포: DB 4 / FE 1 / SECURITY 1 / ARCH 1 / EXTERNAL 1 / DOMAIN 1 / API 1

### F-POC15-QU-002 (info / migration plan 10-step)

- **type**: migration-cautions
- **severity**: info
- **summary**: migration-cautions.md 10-step 작성 — D-axis 후속 impl stage 우선순위 명시
- **detail**:
  - 1순위: BR-CAR-COST-003 SGERP IF (saga/outbox 결단)
  - 2순위: AP-SEC-001 XSS (보안 critical)
  - 3순위: AP-FE-001 scriptlet 일괄 변경
  - 4순위: AP-DB-002 FK
  - 5순위: AP-API-001 ExceptionHandler / RFC 9457
  - 6순위: 4 ambiguous BR domain_expert 결단
  - 7순위: 3 SATD self_recognized 처리
  - 8순위: 외부 4 DB 격리 (strangler fig)
  - 9순위: AP-DOMAIN-001 typed DTO
  - 10순위: 잔여 (composite PK / column drift / DAO 패키지)

## Step 3 — chain 1 (discovery stage) (2026-05-28)

### F-POC15-D1-001 (info / discovery-spec 합성)

- **type**: chain-1-output
- **severity**: info
- **summary**: discovery-spec.json 합성 완료 — 10 UC + 12 BR-intent backward link + 6 stakeholder + 5 success criteria
- **detail**:
  - derivation_source = legacy-extraction (analysis stage 8 source artifact 흡수)
  - 10 UC (BC-CAR-MGT 5 + BC-CAR-COST 5) / 모두 acceptance_criteria_refs placeholder (chain 2 carry)
  - 12 BR-INTENT (12 BR 전수 backward link / reasoning + source_grounded_evidence 명시)
  - 6 risks_and_constraints (critical / cross-DB / ambiguous / SATD / strangler fig / R1' axis)

### F-POC15-D1-002 (info / validator 통과)

- **type**: discovery-extraction-validator-clean
- **severity**: info
- **summary**: discovery-extraction-validator 0 finding + **UC coverage 100%** ✅
- **detail**:
  - critical 0 / high 0
  - 12 BR-INTENT 모두 analysis business-rules.json BR-\* 와 매칭 (grep-hit 100%)
  - schema-validator pass (discovery-spec.schema.json)
  - source_grounded_evidence ≥ 1 의무 충족 / source-grounded 5 필드 정합

### F-POC15-D1-003 (info / Gate #1 prerequisite 충족)

- **type**: gate-1-ready
- **severity**: info
- **summary**: Gate #1 진입 ready — Step 4 (chain-driver next --user-decision go) 즉시 가능
- **detail**:
  - DoD 충족: source_grounded ≥ 1 / br_id grep 100% / UC coverage ≥ 0.80 (실 100%)
  - 자동 validator 3종 pass (schema + discovery-extraction + UC coverage)
  - 다음: chain-driver next examples/poc-16-... --user-decision go → state.stage='spec'

---

## Step 4 — Gate #1 통과 (2026-05-28)

## Step 5 — chain 2 spec + artifact-graph 합성 + 검증 (2026-05-28)

### F-POC15-S5-001 (info / behavior-spec + AC + Gate #2)

- **type**: chain-2-output
- **severity**: info
- **summary**: chain 2 (spec stage) 완료 — 10 BHV + 10 AC + Gate #2 통과 → state.stage='plan'
- **detail**:
  - behavior-spec.json: 10 behaviors (BHV-CAR-MGT-001~005 + BHV-CAR-COST-001~005) / br_refs + use_case_refs + acceptance_criteria_refs 100% link
  - acceptance-criteria.json: 10 AC (Gherkin Given/When/Then + MoSCoW severity must 6 / should 3 / nice 1) / related_brs + related_aps 명시
  - chain-driver next 결과: advanced_to='plan' / gate.blocked=false
  - state.json: discovery='complete' + spec='complete' + plan='in_progress'

### F-POC15-S5-002 (critical pass / D-axis 본격 입증)

- **type**: code-pointer-validator-pass
- **severity**: info
- **summary**: **code-pointer-validator --strict PASS** — coverage.ratio=1.0 / missing=0 / finding=0
- **detail**:
  - 본 PoC 핵심 D-axis 목표 달성
  - 42 Tier-1 노드 모두 code_pointers_na=true 명시 (chain artifact = 자연어 명세 + analysis artifact = 분석 산출)
  - 산출물 작성 시 각 UC/BHV/AC item 안 + analysis top-level 에 code_pointers_na:true 명시 / PoC #05 동형 paradigm
  - strict mode 통과 (release-readiness #16 정합)

### F-POC15-S5-003 (info / graph cycle/unknown 0)

- **type**: graph-integrity-partial-pass
- **severity**: info
- **summary**: graph-integrity cycle=0 / unknown_edges=0 ✅ (orphan 10 별도)
- **detail**:
  - 42 nodes / 54 edges 합성 / by_edge_type: derived_from=20 + cross_reference=34
  - cycle_count: 0 ✅ (topological sort 가능)
  - unknown_edge_count: 0 ✅ (모든 edge 양 끝 노드 존재)

### F-POC15-S5-004 (medium / graph-synthesizer 한계 — orphan 10)

- **type**: graph-synthesizer-mapping-gap
- **severity**: medium
- **summary**: analysis 노드 10 orphan — graph-synthesizer 의 `CHAIN_TO_ANALYSIS_REFS` 매핑 한계 / 본 PoC scope 외
- **detail**:
  - orphan analysis nodes (10): analysis-architecture / analysis-domain / analysis-formal-spec / analysis-ui-ux / analysis-state-map / analysis-visual-manifest / analysis-type-spec / analysis-error-mapping-spec / analysis-characterization-spec / analysis-sql-inventory
  - 원인: 현 `CHAIN_TO_ANALYSIS_REFS` = `{BHV: {br_refs: 'business-rules'}, AC: {related_brs:..., related_aps:...}}` 만 정의 / 10 다른 analysis kinds 매핑 부재
  - 해결: graph-synthesizer 의 CHAIN_TO_ANALYSIS_REFS 확장 (architecture / domain / db-schema / formal-spec / sql-inventory / characterization 등) — 본 PoC scope 외 / **methodology-spec carry**
  - 영향: graph-integrity passed=false / release-readiness #15 미통과 (본 PoC corpus 한정 / PoC #05 corpus 본체 release 무관)

### F-POC15-S5-005 (info / D-axis 부분 성공 종합)

- **type**: poc-d-axis-summary
- **severity**: info
- **summary**: 본 PoC D-axis 검증 = **부분 성공** (3/4 axis pass + 1 carry)
- **detail**:
  - ✅ artifact-graph 합성 (42 nodes / 54 edges)
  - ✅ graph cycle 0 / unknown 0
  - ⚠️ graph orphan 10 (graph-synthesizer 한계 / carry)
  - ✅ **code-pointer-validator strict PASS** (본 PoC 핵심 목표)
  - 사용자 핵심 의도 ("산출물 → 그래프 → 코드 연결") 본격 입증 충족 + 도구 영역 한계 명시 (정직성)

---

### F-POC15-G1-001 (info / gate #1 통과)

- **type**: gate-1-passed
- **severity**: info
- **summary**: Gate #1 통과 — state.stage = 'spec' 전이 ✅
- **detail**:
  - chain-driver next --user-decision go 호출 결과: `advanced_to: "spec"` / `gate.blocked: false` / `decision: go-eligible`
  - state.json 변경: current_chain='spec' / discovery.status='complete' / discovery.gate_decision='go' / spec.status='in_progress'
  - 출력 ticket-sync auto-suggest 메시지 (R20 paradigm) — Initiative/Epic 생성 권한 부재 환경 / migration carry 정합
  - Step 5 (chain 2 spec stage + artifact-graph) 진입 ready

---

### F-POC15-QU-003 (info / Step 2 종결)

- **type**: analysis-stage-complete
- **severity**: info
- **summary**: Step 2 (analysis stage 11 phase) 종결 — 모든 산출물 schema-validator pass / 6 validator 통과
- **detail**:
  - 산출물 일람: \_manifest.yml + input.json + html-template-extract.json + inventory.json + tree.md + stack-detection.md + stats.json + schema.json + erd.mermaid + db-schema-consistency-report.md + architecture.json + architecture.mermaid + architecture.md + dependency-graph.mermaid + circular-dependencies.md + domain.json + domain.mermaid + domain.md + business-rules.json + rules.md + antipatterns-partial.json + formal-spec.json + Car-CostAccept FSM + UC-CAR-COST-001 sequence + BR-CAR-MGT-006 DT + characterization-spec.json + UC-CAR-COST-001 snapshot + UC-CAR-MGT-001 snapshot + intent-vs-bug.md + coverage.json + sql-inventory.json + sql-inventory.md + raw-grep.txt + openapi.yaml + api-extension.json + error-mapping-spec.json + api.md + ui-spec.json + ui-spec.md + ui-spec.mermaid + state-map.json + visual-manifest.json + type-spec.json + antipatterns.json + avoid-list.md + migration-cautions.md
  - 외부 도구 실 실행 = PMD JSP + cloc + Spectral + schema-validator + sql-inventory-validator + characterization-coverage-validator
  - 다음: Step 3 (chain 1 discovery stage) 진입 ready

---

## Phase: `dep-consult-corroboration` (2026-06-24 / MIS-373 본체 격상 ≥2 PoC)

본 PoC 자산(discovery-spec.json + artifact-graph.json)을 MIS-373 S4 dep-consult reference-lens 의 corroboration 대상으로 사용. 별개 코드베이스 poc-18(express-prisma modern) 과 함께 ≥2 PoC 게이트 충족.

### F-POC15-DC-001 (medium / dep-consult shared_ref 입력 포맷 갭 — closed)

- **type**: tool-input-format-gap
- **severity**: medium
- **summary**: `dep-consult.js` `refSet()` 이 `br_refs`/`api_refs` 필드 + `source_grounded_evidence` 중 `#` 포함 토큰만 결합 신호로 인식 → 실 산출물(베어 `BR-…`/콜론 `sqlmap:…`)에서 shared_ref **0건** (실제 공유 3쌍 누락)
- **detail**:
  - poc-16 실측: UC-CAR-MGT 3쌍이 공통 BR 공유 — `001∩003: BR-CAR-MGT-006` / `001∩004: BR-CAR-MGT-005` / `004∩005: BR-CAR-MGT-002`. 구 도구는 전부 0건 (false negative).
  - 원인: 스키마에 없는 `br_refs`/`api_refs` 를 1차 신호로 기대 + evidence 는 `#` 포함만 인식. 모든 실 PoC(poc-03/08/11/16)는 `br_refs` 미사용 + `#` 전무.
  - fixture drift 동반: `dep-consult.test.js` 가 도구 기대 포맷(`br_refs`, `domain.json#User`)으로 작성돼 4/4 통과하면서 실전 0건을 못 잡음 (`feedback_self_recorded_fact_validation`).
- **resolution**:
  - status: **closed** — `refSet()` 수정(베어 `BR-*`→`br:` 정규화 SHOULD / 콜론 식별자 / `#` ref / 정확일치). `#` 제약 제거. 하위호환(`br_refs`/`api_refs`) 보존.
  - 회귀 고정: `dep-consult.test.js` 실 산출물 포맷 케이스 추가 (베어 BR 공유 1쌍 SHOULD 단언).
  - 재실측: poc-16 shared_ref **3건** SHOULD ✅ / poc-18 modern **0건**(실제 0쌍 — precision 유지) ✅.

### F-POC15-DC-002 (low / graph_impact 위상 한계 — rejected / 옵션 A + 35 BC corroboration)

- **type**: graph-signal-topology-limit
- **severity**: low
- **summary**: `graph_impact` 신호가 현행 artifact-graph 위상(`UC→BHV→AC` 독립 체인)에서 UC↔UC 직접 영향이 구조적으로 0 → 그래프 기반 UC 의존 산출 불가
- **detail**:
  - poc-16 엣지 분포: `UC→BHV:10` / `BHV→AC:10` / `analysis→{UC,BHV,AC}`. UC 간 직접 엣지 0 → `analyzeImpact(UC-X)` 가 다른 UC 미도달.
  - 그래프 기반 UC 결합(공유 analysis 조상)은 shared_ref(공유 evidence)와 의미 중복 → 별도 그래프 신호 보강 보류 (사용자 결정 옵션 A / §8.1 과적합 회피).
  - `degraded` 마커는 정상 동작(graph=null → `degraded:true` 정직 신호). 다른 위상 그래프(UC↔UC 직접 엣지)에선 동작.
- **resolution**:
  - status: **rejected** — ep-be-gea **35 BC 전수 corroboration**(사내 / 마스킹 집계): UC↔UC 직접 엣지 **0**(5천+ 엣지 전수) = graph_impact 가 현 artifact-graph 위상(graph-synthesizer 산출 체인형 `UC→BHV→AC→TASK→TC→IMPL`)에서 **구조적 부적용** 확정. 동일 35 BC 에서 shared_ref **368건** 추출 = UC 결합 표면화 목적 완전 대체. graph_impact 코드 무변경.
  - 재검토 단서: graph-synthesizer 가 UC↔UC 의존 엣지를 도입하는 위상 변경 시 (영구 폐기 ❌ / 현 모델 한정 reject).

### F-POC15-DF-001 (medium / S1 난이도 변별력 상실 — A안 closed / B안 deferred)

- **type**: signal-discrimination-loss (위상 민감 튜닝)
- **severity**: medium
- **summary**: `difficulty.js` `MUST_DENSE_BONUS(+5)` 가 full-chain 그래프에서 **355/356(100%)** 발동 → 전 UC **L 포화**(변별력 상실) + review advisory **355개** 도배
- **detail**:
  - ep-be-gea 35 BC: impact median 7(poc-16과 유사)인데 `must_count≥5` 가 100% → +5 → score>9=L. 보너스 제거 시 **M255/L101** 변별 회복.
  - dep-consult shared_ref / graph_impact 와 **동형 패턴**(얕은 PoC poc-16 튜닝이 깊은 위상에서 깨짐) — 세 번째 동형 발견.
- **resolution**:
  - status: **A안 closed** — (1) `MUST_DENSE_BONUS` 제거(버그 / impact 단독 버킷) (2) `difficultyReviewItems` 를 'L 전부' → **scope-상대 outlier(상위 20%) ∩ L** (advisory 355→68).
  - 검증(≥2 위상): ep-be-gea M255/L101·advisory 68 / poc-16 M9/L1·advisory 1. difficulty 테스트 갱신(보너스 제거 + outlier 회귀).
  - **B안 deferred**: 버킷 절대임계 → 분위수 전면 reframe + `난이도(difficulty)`→`영향 규모` 네이밍(스키마/렌더/skill 파급) = ≥2 위상 corroboration 후 본체 격상(§8.1 단일 코퍼스 과적합 회피).

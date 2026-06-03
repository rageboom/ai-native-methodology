# car 모듈 cross-DB dependency manifest

> car sqlmap (carCost.xml + carMgt.xml) 안 37 statement (select 17 + insert 5 + update 9 + delete 5 + procedure 1) 의 외부 DB 의존성 전수.
> 분석 stage 의 **db-schema** + **sql-inventory** phase 의 직접 입력 자산.

## SQL Statement 통계

| Type          | Count  |
| ------------- | ------ |
| `<select>`    | 17     |
| `<insert>`    | 5      |
| `<update>`    | 9      |
| `<delete>`    | 5      |
| `<procedure>` | 1      |
| **합계**      | **37** |

## DB 의존성 (4 외부 DB + IFRS own)

### IFRS (own — 본 모듈 / DDL ✅ 사본)

| Object                 | Type       | DDL 위치                                                     | sqlmap 호출 |
| ---------------------- | ---------- | ------------------------------------------------------------ | ----------- |
| TB_CAR                 | Table      | `ddl/tables/TB_CAR.sql`                                      | ✅          |
| TB_CAR_COST            | Table      | `ddl/tables/TB_CAR_COST.sql`                                 | ✅          |
| TB_CAR_COST_NOLOG      | Table      | `ddl/tables/TB_CAR_COST_NOLOG.sql`                           | ✅          |
| TB_CAR_COST_SLIP       | Table      | `ddl/tables/TB_CAR_COST_SLIP.sql`                            | ✅          |
| TB_CAR_DRIVE           | Table      | `ddl/tables/TB_CAR_DRIVE.sql`                                | ✅          |
| TB_CAR_USER_TERM       | Table      | `ddl/tables/TB_CAR_USER_TERM.sql`                            | ✅          |
| fn_Get_CarUserListView | UDF        | `ddl/functions/fn_Get_CarUserListView.sql` (+ `_2.sql` 변형) | ✅          |
| FN_SPLIT               | UDF (공통) | `ddl/functions/FN_split.sql`                                 | ✅          |

### FIM (사내 마스터 DB / 본 모듈 외부)

| Object               | Type  | 추정 용도          | sqlmap 호출 | DDL                    |
| -------------------- | ----- | ------------------ | ----------- | ---------------------- |
| FIM.dbo.TB_USER      | Table | 사내 사용자 마스터 | ✅          | ❌ 외부 DB / source 외 |
| FIM.dbo.TB_COMPANY   | Table | 사내 회사 마스터   | ✅          | ❌                     |
| FIM.dbo.TB_SECRETARY | Table | 비서/대리 관계     | ✅          | ❌                     |

### SGERP (ERP 시스템 / 본 모듈 외부 / 가장 무거운 의존)

| Object                                          | Type                 | 추정 용도                       | sqlmap 호출                                   | DDL |
| ----------------------------------------------- | -------------------- | ------------------------------- | --------------------------------------------- | --- |
| SGERP.dbo.\_TACSlip                             | Table                | ERP 회계전표 헤더               | ✅                                            | ❌  |
| SGERP.dbo.\_TACSlipRow                          | Table                | ERP 회계전표 라인               | ✅                                            | ❌  |
| SGERP.dbo.\_TACSlipCost                         | Table                | ERP 회계전표 비용               | ✅                                            | ❌  |
| SGERP.dbo.\_TCACompany                          | Table                | ERP 회사 마스터                 | ✅                                            | ❌  |
| SGERP.dbo.\_TDAAccount                          | Table                | ERP 계정과목 마스터             | ✅                                            | ❌  |
| SGERP.dbo.\_TDACCtr                             | Table                | ERP 코스트센터                  | ✅                                            | ❌  |
| SGERP.dbo.\_TDADept                             | Table                | ERP 부서 마스터                 | ✅                                            | ❌  |
| SGERP.dbo.\_TDAUMinor                           | Table                | ERP 사용자 minor                | ✅                                            | ❌  |
| SGERP.dbo.\_THROrgDept                          | Table                | ERP 인사조직-부서               | ✅                                            | ❌  |
| SGERP.dbo.SG_VHRIFDeptQuery                     | View                 | 부서 통합 view                  | ✅                                            | ❌  |
| **SGERP.dbo.SG_SACSlipRowCarManagementIFQuery** | **Stored Procedure** | **차량비용 → 회계전표 IF 전송** | ✅ (`<procedure>` 호출 1건 / carCost.xml:328) | ❌  |

### e_hr (인사 시스템 / 본 모듈 외부)

| Object              | Type  | sqlmap 호출 | DDL |
| ------------------- | ----- | ----------- | --- |
| e_hr.dbo.TB_HOLIDAY | Table | ✅          | ❌  |

### ekporg (조직 DB / 본 모듈 외부)

| Object                                 | Type  | sqlmap 호출 | DDL |
| -------------------------------------- | ----- | ----------- | --- |
| ekporg.dbo.DEF_GROUP_INTO_COMPANY_LIST | Table | ✅          | ❌  |

## 분석 한계 (정직 명시)

- **외부 DB 4종 (FIM / SGERP / e_hr / ekporg) 의 18 object** = sqlmap 안 **호출 시그니처만 추출 가능**. 본체 DDL / SP source ❌. → 분석 stage 의 db-schema phase 에서 `external_only: true` 마커 + sqlmap 추론 컬럼 명시 의무.
- SGERP 의 SP `SG_SACSlipRowCarManagementIFQuery` = parameterMap 으로 6 input parameter 식별 가능 (sqlmap 안 `selectCarCostCalculateMap`).
- ERD 시각화 = `erd/ifrs.erd` (188K / 전체 IFRS) + `erd/car.erd` (60K / car 부분) 두 파일 모두 사본 ✅.

## 분석 stage 사용 가이드

| Phase            | 본 manifest 활용                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `db-schema`      | 6 own table DDL 직접 추출 (`ddl/tables/`) + 외부 18 object 는 sqlmap 추론 + `external_only:true` 마커 |
| `sql-inventory`  | 37 statement 인벤토리 + cross-DB join 패턴 + SP 호출 1건 별도 카테고리                                |
| `architecture`   | car ↔ FIM (사용자) / SGERP (회계 IF) / e_hr (휴일) / ekporg (조직) 의존성 그래프                      |
| `business-rules` | SP `SG_SACSlipRowCarManagementIFQuery` = "차량비용 회계전표 IF 전송" 비즈니스 규칙 anchor             |
| `antipatterns`   | cross-DB join (5 DB) = 강결합 antipattern + ERP IF SP 의존 antipattern                                |

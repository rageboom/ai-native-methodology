# PoC #16 EFI-WEB car — Directory Tree

> 분석 대상 = `smilegate.ifrs.car` (Spring MVC 4.1 + iBATIS 2 / 이중 책임 — Mgt + Cost) / 36 파일 / 9,982 code LOC (cloc 결정적)

## source/ (immutable snapshot)

```
source/
├── java/smilegate/ifrs/car/                    # 8 .java / 798 code LOC
│   ├── service/
│   │   ├── CarMgtService.java                  # 99 LOC / interface
│   │   └── CarCostService.java                 # 76 LOC / interface
│   ├── service/impl/                           # ⚠️ DAO 가 impl/ 안에 위치 (package anti-pattern)
│   │   ├── CarMgtServiceImpl.java              # 247 LOC / 8 method / @Service("carMgtService")
│   │   ├── CarCostServiceImpl.java             # 224 LOC / 5 method / @Service("carCostService")
│   │   ├── CarMgtDAO.java                      # 202 LOC / 17 method / @Repository("carMgtDAO") / extends EgovComAbstractDAO
│   │   └── CarCostDAO.java                     # 110 LOC / 8 method / @Repository("carCostDAO") / extends EgovComAbstractDAO
│   └── web/
│       ├── CarMgtController.java               # 374 LOC / 16 @RequestMapping endpoint / @Controller
│       └── CarCostController.java              # 418 LOC / 18 @RequestMapping endpoint / @Controller
│
├── jsp/                                         # 14 .jsp / 3,110 code LOC
│   ├── carInclude.jsp                          # 공통 JS / USERID Header 변수 (carInclude 패턴 anchor)
│   ├── carList.jsp                             # 차량 목록 페이지
│   ├── carListAjax.jsp                         # 차량 목록 ajax fragment
│   ├── carInsertForm.jsp                       # 차량 등록 form (유일 form action: /ifrs/car/insertCar)
│   ├── carSelectPopup.jsp                      # 차량 선택 popup
│   ├── carSelectPopupAjax.jsp                  # 차량 선택 popup ajax fragment
│   ├── carDriveInsertForm.jsp                  # 차량 운행 등록 form (year-loop scriptlet)
│   ├── carDriveListAjax.jsp                    # 차량 운행 목록 ajax
│   ├── carCosting.jsp                          # 차량 비용 계산 페이지 (scriptlet + jsp:include)
│   ├── carCostingNoDriveLog.jsp                # 운행 로그 없는 비용 계산 분기
│   ├── carCostConfirm.jsp                      # 차량 비용 확정 페이지 (scriptlet)
│   ├── carCostSumSystem.jsp                    # 차량 비용 합산 시스템 페이지 (scriptlet)
│   ├── popCarCostSlip.jsp                      # 차량 비용 회계전표 popup
│   └── loading.jsp                             # 공통 loading indicator
│
├── sqlmap/                                      # 2 XML / 5,747 LOC (XML 전체) — 37 statement
│   ├── carMgt.xml                              # Mgt sqlmap (namespace=CarMgtDAO)
│   └── carCost.xml                             # Cost sqlmap (namespace=CarCostDAO / SP 호출 1건)
│
├── ddl/                                         # 9 .sql / 263 code LOC (IFRS_split 발췌)
│   ├── tables/                                 # 6 own table (IFRS / car own)
│   │   ├── TB_CAR.sql
│   │   ├── TB_CAR_COST.sql
│   │   ├── TB_CAR_COST_NOLOG.sql
│   │   ├── TB_CAR_COST_SLIP.sql
│   │   ├── TB_CAR_DRIVE.sql
│   │   └── TB_CAR_USER_TERM.sql
│   └── functions/                              # 3 UDF (car 관련 + 공통)
│       ├── fn_Get_CarUserListView.sql          # car 사용자 list 추출 view
│       ├── fn_Get_CarUserListView_2.sql        # 변형 (date param 추가 추정)
│       └── FN_split.sql                        # 공통 utility (sqlmap 호출 정합)
│
├── erd/                                         # 2 ERD (시각화 / viewer 부재 / manual_extraction)
│   ├── car.erd                                 # 60K / car 모듈 부분 ERD
│   └── ifrs.erd                                # 188K / 전체 IFRS ERD (사용자 지적 정정 사실)
│
└── _cross-db-dependencies.md                   # car ↔ 4 외부 DB (FIM/SGERP/e_hr/ekporg) 의존 manifest
```

## input/ (analysis 산출물)

```
input/
├── _manifest.yml                               # phase input 입력 명세
├── pmd-jsp-report.txt                          # PMD 7.24 raw output (14 JSP / 28 violation / 10 ParseException)
├── html-template-extract.json                  # phase template-analyze 산출 (schema pass ✅)
├── inventory.json                              # phase discovery 산출 (본 phase)
├── tree.md                                     # 본 파일
├── stack-detection.md                          # phase discovery 산출
└── stats.json                                  # phase discovery 산출
```

## 외부 의존성 (cross-DB / source 외부)

| DB                    | Object 종류      | 카운트 | 본 PoC source     |
| --------------------- | ---------------- | ------ | ----------------- |
| **IFRS (own)**        | Table            | 6      | ✅ ddl/tables/    |
| **IFRS (own)**        | Function         | 3      | ✅ ddl/functions/ |
| **FIM** (사내 마스터) | Table            | 3      | ❌ external_only  |
| **SGERP** (ERP)       | Table + View     | 10     | ❌ external_only  |
| **SGERP** (ERP)       | Stored Procedure | 1      | ❌ signature_only |
| **e_hr** (인사)       | Table            | 1      | ❌ external_only  |
| **ekporg** (조직)     | Table            | 1      | ❌ external_only  |

## 책임 분기 매트릭스

| 책임                | Controller                    | Service                       | ServiceImpl                       | DAO                       | sqlmap      | 주 도메인                                |
| ------------------- | ----------------------------- | ----------------------------- | --------------------------------- | ------------------------- | ----------- | ---------------------------------------- |
| **Mgt** (차량관리)  | CarMgtController 374 / 16 ep  | CarMgtService 99 / interface  | CarMgtServiceImpl 247 / 8 method  | CarMgtDAO 202 / 17 method | carMgt.xml  | 차량 등록 / 사용자 / 운행 / 비용         |
| **Cost** (차량비용) | CarCostController 418 / 18 ep | CarCostService 76 / interface | CarCostServiceImpl 224 / 5 method | CarCostDAO 110 / 8 method | carCost.xml | 비용 계산 / 확정 / 회계전표 IF (SP 호출) |

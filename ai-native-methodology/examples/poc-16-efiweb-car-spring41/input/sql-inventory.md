# PoC #15 EFI-WEB car — SQL Inventory

> phase sql-inventory (v2.2.0 / RDB only) / 사람용 markdown rendering / sql-inventory.json 와 의미 동등.

## 통계 요약

| 항목                        | 값                                                         |
| --------------------------- | ---------------------------------------------------------- |
| **total SQL operations**    | **37**                                                     |
| select                      | 17                                                         |
| insert                      | 5                                                          |
| update                      | 9                                                          |
| delete                      | 5                                                          |
| **procedure (CALLABLE)**    | **1**                                                      |
| **dependent tables unique** | **22** (own 6 + FIM 3 + SGERP 10+1 SP + e_hr 1 + ekporg 1) |
| external SP calls           | 1                                                          |
| auto_ratio_external_6       | **66.7%** (4/6) ✅ ≥ 50% pass                              |
| auto_ratio_external_7       | 71.4% (5/7) — statement_type 추가                          |
| auto_ratio_total_11         | 63.6% (7/11)                                               |

## 본격 추출 6 SQL (37 중)

| #   | sql_id                              | type                                | dependent                                              | BR anchor            |
| --- | ----------------------------------- | ----------------------------------- | ------------------------------------------------------ | -------------------- |
| 1   | `CarMgtDAO.insertCar`               | PREPARED INSERT                     | tb_car                                                 | BR-CAR-MGT-001 + 005 |
| 2   | `CarMgtDAO.selectLeaderUserId`      | PREPARED SELECT                     | **fim.tb_user** (external)                             | BR-CAR-MGT-006       |
| 3   | `CarCostDAO.selectCarCostCalculate` | **CALLABLE** (SP)                   | **sgerp.sg_sacsliprowcarmanagementifquery** (external) | **BR-CAR-COST-003**  |
| 4   | `CarCostDAO.saveCarCostAccept`      | PREPARED UPDATE (MERGE)             | tb_car_cost                                            | BR-CAR-COST-002      |
| 5   | `CarCostDAO.insertCarCostSlip`      | PREPARED INSERT (bulk via FN_SPLIT) | tb_car_cost_slip + ifrs.fn_split                       | BR-CAR-COST-006      |
| 6   | `CarMgtDAO.updateCarTotDist`        | PREPARED UPDATE (side effect)       | tb_car                                                 | BR-CAR-MGT-004       |

## PoC 비교 (R1' axis 4번째 corroboration)

| PoC              | auto_ratio_external_6                            |
| ---------------- | ------------------------------------------------ |
| PoC #06 exchange | 66.7%                                            |
| PoC #07 capital  | 66.7%                                            |
| PoC #11 billing  | 66.7%                                            |
| **PoC #15 car**  | **66.7%**                                        |
| **delta**        | **0.0%p** — 사내 EFI-WEB 4 PoC isomorphic 안정점 |

**사내 robust 입증** — Spring 4.1 + iBATIS 2 paradigm auto_ratio_external_6 = 66.7% 안정 4번째 corroboration.

## carry (partial)

- 31 statement (37 - 6) partial — impl stage 진입 후 전수 추출 의무
- 22 dependent_tables 중 18 external (FIM/SGERP/e_hr/ekporg) = signature only / DDL ❌

## 자동 검증 결과

```
[sql-inventory-validator]
0 findings (critical: 0, high: 0, medium: 0)
inventory: 6 records
auto_ratio_external_6: 66.7% (threshold 50%)
statement_type distribution: PREPARED=5 / CALLABLE=1 / STATEMENT=0
carry_flags total: 0
```

✅ All pass.

# PoC #15 EFI-WEB car — Domain Model

> phase business-logic 의 domain.json 사람용 markdown rendering.

## 1. Bounded Contexts

### BC-CAR-MGT (차량 관리)

차량 마스터 + 운행 로그 + 사용자 기간별 할당. 등록/수정/삭제 책임. CarMgtController + CarMgtService(Impl) + CarMgtDAO.

| Aggregate | Root | Members | Consistency |
|---|---|---|---|
| Car | E-CAR-Car | CarUserTerm, CarDrive | strong (single transaction) |

**Invariants** (불변식):
1. Car 는 `use_yn='Y'` (사용 중) state 가 아니면 운행 등록 불가 — service_check (추정)
2. CarDrive 는 반드시 CarUserTerm 의 시작일 ≤ drive_date ≤ 종료일 범위 — service_check
3. TOT_DIST = saveCarDriveRow 시 운행 거리 누적 (updateCarTotDist 호출) — service_check

### BC-CAR-COST (차량 비용)

비용 5종 (gas/insurance/repair/tax/etc) + 조정 + 임차 + 감가 + 승인 + 회계전표 IF. CarCostController + CarCostService(Impl) + CarCostDAO.

| Aggregate | Root | Members | Consistency |
|---|---|---|---|
| Cost | E-CAR-COST-Cost | CostSlip, CostNolog | eventual (cross-DB SGERP SP 호출) |
| CostNolog | E-CAR-COST-CostNolog | (없음) | strong (독립 / 회사별) |

**Invariants**:
1. Cost 는 반드시 CarUserTerm (term_idx) 에 종속 (DDL `[TERM_IDX] [int] NOT NULL`) — db_constraint ★
2. CostSlip 은 Cost (cost_idx) + SGERP._TACSlip (slip_id) 의 cross-DB FK — DDL 미명시 / 운영 추론
3. cost_accept_cd (비용 승인) 는 saveCarCostAccept (MERGE) 로만 변경 (admin 결정) — service_check
4. 회계전표 IF = SGERP.SG_SACSlipRowCarManagementIFQuery SP 호출 후 tb_car_cost_slip 등록 — cross-DB transaction 보장 ❌ → eventual consistency ★

## 2. Ubiquitous Language

| 한국어 | 영어 | 정의 |
|---|---|---|
| 차량 | Car | 회사 운영 차량 마스터 (tb_car) |
| 차량 번호 | Car No | 차량 식별 번호 (car_no) |
| 차량 종류 | Car Type | 차량 유형 코드 (car_type) |
| 운행 | Drive | 차량 사용 1회 단위 (tb_car_drive) |
| 사용자 기간 | User Term | 차량을 특정 사용자가 사용한 기간 (tb_car_user_term) |
| 비용 | Cost | 차량 운영 비용 5종 (gas / insurance / repair / tax / etc) |
| 비용 승인 | Cost Accept | 비용 항목별 승인 코드 (cost_accept_cd) |
| 회계전표 | Slip | 비용 → SGERP ERP 회계전표 IF 전송 결과 (tb_car_cost_slip) |
| 리더 | Leader | 사내 리더 사용자 (FIM.TB_USER + PFLE_STATUS_CD=PS10 + USER_FG_HR=E10) |
| 임차 | Rent | 차량 임대 (rent_type_cd / rent_cost) |
| 감가상각 | Depreciation | 차량 감가상각 비용 (depr_cost / tax_depr_cost) |

## 3. Cross-BC 관계

```
BC-CAR-MGT.CarUserTerm (term_idx) ──1:N──→ BC-CAR-COST.Cost
                                                ↓ 1:N
                                          BC-CAR-COST.CostSlip ──외부 FK──→ SGERP._TACSlip
                                                ↓ SP call
                                          SGERP.SG_SACSlipRowCarManagementIFQuery (회계 IF)
```

→ Mgt 와 Cost 는 같은 codebase 안 다른 BC / cross-BC 의존 (term_idx) 존재.

## 4. 한계 / Carry

- ★ Spring 4.1 + iBATIS 2 paradigm = entity class ❌ / HashMap-based DTO → 본 domain 은 DDL + sqlmap 추론
- ★ Invariants 대부분 service_check (DDL CONSTRAINT 명시 ❌) → 마이그레이션 시 DB CONSTRAINT 격상 권고
- ★ Cost ↔ SGERP cross-DB transaction 보장 ❌ → eventual consistency / saga pattern 또는 outbox table 도입 권고

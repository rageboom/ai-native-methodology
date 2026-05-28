# PoC #15 EFI-WEB car — Business Rules

> phase business-logic 산출 / `business-rules.json` 사람용 markdown rendering / 총 12 BR (BC-CAR-MGT 6 + BC-CAR-COST 6).

## BC-CAR-MGT (차량 관리)

| ID | 이름 | severity | category | source | 본격 추출처 |
|---|---|---|---|---|---|
| BR-CAR-MGT-001 | 차량 등록 의무 필드 | high | validation | sqlmap | insertCar SQL |
| BR-CAR-MGT-002 | 차량 사용 여부 (USE_YN) | medium | policy | ddl+sqlmap | tb_car.use_yn |
| BR-CAR-MGT-003 | 차량 상태 코드 (STATE) | low | policy | ddl | tb_car.state |
| BR-CAR-MGT-004 | 총 누적 거리 자동 갱신 | medium | calculation | sqlmap | updateCarTotDist |
| BR-CAR-MGT-005 | 사용자 기간 매칭 (CarUserTerm) | high | policy | ddl+sqlmap | tb_car_user_term |
| BR-CAR-MGT-006 | 리더 사용자 식별 (FIM 외부) | high | authorization | sqlmap | selectLeaderUserId |

## BC-CAR-COST (차량 비용)

| ID | 이름 | severity | category | source | 본격 추출처 |
|---|---|---|---|---|---|
| BR-CAR-COST-001 | 비용 항목 5종 + 조정 | high | policy | ddl | tb_car_cost (24 col) |
| BR-CAR-COST-002 | 비용 승인 코드 (cost_accept_cd) | high | authorization | sqlmap | saveCarCostAccept MERGE |
| **BR-CAR-COST-003** ★ | **차량비용 → ERP 회계전표 IF (SP)** | **critical** | integration | sqlmap | selectCarCostCalculate (procedure) |
| BR-CAR-COST-004 | 운행 로그 없는 비용 (NoLog) | medium | policy | sqlmap+ddl | tb_car_cost_nolog |
| BR-CAR-COST-005 | 비용 합산 시스템 (CostSumSystem) | low | calculation | sqlmap+jsp | selectCarCostSumSystemList |
| BR-CAR-COST-006 | 회계전표 다중 ID 등록 (FN_SPLIT) | medium | calculation | sqlmap | insertCarCostSlip + FN_SPLIT |

## 심각도 분포

| severity | count | % |
|---|---|---|
| critical | 1 | 8% |
| high | 5 | 42% |
| medium | 4 | 33% |
| low | 2 | 17% |

## ★ 본 PoC 핵심 anchor

**BR-CAR-COST-003** (차량비용 → ERP 회계전표 IF) = 본 PoC 의 가장 중요한 비즈니스 anchor:
- 외부 SP (SGERP.SG_SACSlipRowCarManagementIFQuery) 호출
- TB_CAR_COST_SLIP 등록 (composite PK + 외부 FK)
- Cross-DB transaction 보장 ❌ → eventual consistency
- 마이그레이션 시 가장 큰 위험점

## Concern (carry)

- ★ R1' axis Spring 4.1 + iBATIS 2 paradigm = BR 정확도 50%대 ceiling (PoC #06/#07/#11 정합) — 본 PoC 12 BR 중 일부는 LLM 추론 (특히 BR-CAR-MGT-003 STATE 코드 / BR-CAR-COST-002 cost_accept_cd enum 값 분포)
- ★ business-rules cross-consistency Layer 2 (LLM semantic_score) 검증 carry — 별도 phase

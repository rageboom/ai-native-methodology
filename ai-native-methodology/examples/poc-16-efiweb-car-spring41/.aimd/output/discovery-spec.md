# PoC #15 EFI-WEB car — Discovery Spec (chain 1)

> phase chain 1 discovery / `discovery-from-analysis-output` skill 산출 / sub-plan-3 chain-coverage-validator forward link 정합.

## 출처

`derivation_source.type = legacy-extraction` — analysis stage 11 phase 산출물 종합 흡수.

| 입력 | 항목 |
|---|---|
| business-rules.json | 12 BR (BC-CAR-MGT 6 + BC-CAR-COST 6) |
| domain.json | 2 BC + 3 aggregate + 11 ubiquitous_language |
| architecture.json | 7 module + 12 external dependency |
| sql-inventory.json | 6/37 본격 + 22 unique table |
| characterization-spec.json | 2 UC snapshot + 4 ambiguous + 3 SATD |
| antipatterns.json | 10 AP (critical 2 / high 4) |
| api-extension.json | 10/34 operation |

## Business Intent

**도메인 목적**: 사내 차량 운영 (등록 / 운행 / 비용 / ERP 회계전표 IF) 통합 관리 — EFI-WEB IFRS 회계 시스템의 차량 모듈.

**Stakeholders**: Leader / Admin / IFRS 회계팀 / SGERP·FIM·e_hr·ekporg 운영팀.

**Success Criteria 5**:
1. ★ 차량비용 → SGERP 회계전표 IF 100% 전송 보장 (eventual / outbox 또는 saga)
2. Leader 인증 통과 후만 차량 CRUD
3. 운행 등록 시 TOT_DIST 자동 갱신 (BR-CAR-MGT-004)
4. 비용 승인 (cost_accept_cd) admin 결정 enforcement (BR-CAR-COST-002)
5. 외부 4 DB 격리 — strangler fig pattern

## Use Cases (10)

| ID | name | actor | BR refs | AC ref (chain 2 carry) |
|---|---|---|---|---|
| UC-CAR-MGT-001 | 차량 신규 등록 | Leader | BR-001+005+006 | AC-CAR-MGT-001 |
| UC-CAR-MGT-002 | 차량 운행 등록 | Driver | BR-004 | AC-CAR-MGT-002 |
| UC-CAR-MGT-003 | 차량 목록 조회 | Leader | BR-006 | AC-CAR-MGT-003 |
| UC-CAR-MGT-004 | 차량 정보 수정 | Leader | BR-002+005 | AC-CAR-MGT-004 |
| UC-CAR-MGT-005 | 차량 처분 (★ ambiguous) | Leader | BR-002+003 | AC-CAR-MGT-005 |
| **UC-CAR-COST-001** ★ | **★ 차량비용 → ERP 회계전표 IF** | Admin | **BR-003+006** | AC-CAR-COST-001 |
| UC-CAR-COST-002 | 비용 승인 (MERGE) | Admin | BR-002 | AC-CAR-COST-002 |
| UC-CAR-COST-003 | NoLog 비용 계산 | Admin | BR-004 | AC-CAR-COST-003 |
| UC-CAR-COST-004 | CostSumSystem | Admin | BR-005 | AC-CAR-COST-004 |
| UC-CAR-COST-005 | 비용 항목별 조회 | Admin | BR-001 | AC-CAR-COST-005 |

## Business Rules Intent (12 — 전 BR backward link)

12 BR 모두 backward link + reasoning + source_grounded_evidence 명시.

## Out of Scope

- EFI-WEB 다른 22 도메인 모듈 (billing / exchange / capital 등) — car 분리 분석
- 외부 4 DB 본체 소스 (FIM / SGERP / e_hr / ekporg) — 운영팀 협업 carry
- Modern FE (React / Vue) 마이그레이션 target — 본 PoC = legacy analysis
- TypeScript invariants / property_tests — impl stage carry

## Risks and Constraints

1. ★ ★ ★ AP-API-001 + AP-SEC-001 + AP-FE-001 critical/high 동시 해소 의무
2. ★ ★ BR-CAR-COST-003 cross-DB transaction 결단 (saga / outbox / chained TM) 의무
3. ★ ambiguous 4 BR domain expert 결단 의무
4. ★ SATD 3건 처리 의무
5. ★ 외부 DB 18 object 격리 carry
6. ★ R1' axis Spring 4.1 + iBATIS 2 paradigm = analysis automation 50%대 ceiling

## ★ 자동 검증 결과

```
[discovery-extraction-validator] 0 findings (critical: 0, high: 0)
UC coverage: 100.0%
```

✅ **gate #1 prerequisite 충족** — Step 4 진입 ready.

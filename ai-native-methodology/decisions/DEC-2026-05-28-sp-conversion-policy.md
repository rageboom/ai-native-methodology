# DEC-2026-05-28-sp-conversion-policy

> poc-17 dogfooding 결단 — Stored Procedure → 신규 stack 코드 로직 전환 정책. 4 분류 매트릭스 (α default 코드 전환 / β·γ·δ 보존 + thin wrapper). chain 3 plan stage 분류 결단 의무.

**일자**: 2026-05-28 (poc-17 ifrs/car migration Phase 0)
**카테고리**: paradigm / 신규 stack 마이그레이션 / chain 3 plan stage 책임 갱신
**상태**: 승인 — 사용자 명시
**연관 ADR**: ADR-CHAIN-015-sp-conversion-policy
**연관 명세**: methodology-spec/sp-conversion-policy.md (SSOT)
**연관 ADR (전제)**: ADR-CHAIN-014-db-assets-always-on
**연관 PoC**: poc-17-ifrs-car-migration ( 첫 live 적용 / car 도메인 외부 SP 1건 = γ 자명)

## 1. trigger — 사용자 명시

poc-17 plan 결단 진행 중:

> "프로시저는 코드 로직으로 전환 하기 위한 정책도 필요해"
> (사용자 — 2026-05-28 / DB 자산 always-on 정책 cascade 직후)

본 방법론의 chain harness 가 chain 5 implement 까지 cover 하지만 **SP 처리 framework 부재**. 사내 legacy paradigm (mainframe 기원 / Oracle PL/SQL / MSSQL T-SQL 중심) 에서 SP 안에 핵심 정산 / 배치 / 마이그레이션 로직이 분포한 경우 plan 부실 직격. → 본 결단 신설.

## 2. 결단 본격 — 4 분류 매트릭스

| 분류                            | 처리                                                      | 적용 case                                                                      | 검증                                       |
| ------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| **(α) Default — 코드 전환**     | SP → Java/신규 stack service / @Transactional / 단위 test | 일반 CRUD / 단순 query / 분기 logic / 도메인 룰                                | 단위 test + numeric/row equivalence        |
| **(β) 보존 — 대용량 batch**     | SP 보존 + thin wrapper                                    | set 기반 / n+1 회피 / 100만+ row / cursor / temp table                         | integration test + numeric/row equivalence |
| **(γ) 보존 — 외부 시스템 SP**   | SP 보존 + thin wrapper (외부 DB)                          | 외부 ERP/금융/회계 시스템 SP (예: SGERP.dbo.SG_SACSlipRowCarManagementIFQuery) | integration test + 외부 contract 문서      |
| **(δ) 결단 — DB-specific 기능** | ORM 가능 → (α) / 불가능 → (β)                             | window / hierarchical / CTE / MERGE / PIVOT                                    | case-by-case                               |

## 3. chain 3 plan stage 결단 절차

1. analysis Phase 1 의 SP 정적 분석 → scope chain 1 discovery 입력
2. chain 2 spec 의 behavior-spec.json 매핑 (BHV-\* ↔ SP body 의도)
3. ** chain 3 plan 의 SP 분류 결단** + ADR 등록 + `task-plan.sp_conversions` 채움
4. chain 4 test 의 분류별 test 전략
5. chain 5 implement 의 산출 (코드 또는 wrapper)
6. legacy SP vs 신규 numeric/row equivalence 검증

## 4. 결단 체크리스트 (질문 순서)

1. **외부 시스템 SP** (다른 DB / 외부 ERP / 변경 권한 ❌) → **(γ)**
2. **대용량 batch** (100만+ row / cursor / temp table / 야간 batch) → **(β)**
3. **DB-specific 기능** (window / hierarchical / CTE / MERGE / PIVOT) → **(δ)** (ORM case-by-case)
4. **위 3 모두 ❌** → **(α)** Default

## 5. 첫 live 적용 사례 — poc-17 ifrs/car

| SP source                                               | 갯수                                                 | 분류                                         |
| ------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------- |
| IFRS_split/04_StoredProcedures/ 자체 SP (car 관련 grep) | **0**                                                | 적용 ❌                                      |
| 외부 SP 호출 (`carCost.xml:328`)                        | **1**: `SGERP.dbo.SG_SACSlipRowCarManagementIFQuery` | **(γ) 외부 시스템 SP** / 화면 4 차량비용산출 |

→ car 도메인 SP 전환 부담 사실상 **0** (보존 1만 / γ 자명). 다른 도메인 (capital 46 SP / payroll 다수) 확대 시 (α/β/γ/δ) 본격 측정 가치.

## 6. carry (자산화 작업 list)

| #   | 자산                                     | 작업                                                               |
| --- | ---------------------------------------- | ------------------------------------------------------------------ |
| 1   | methodology-spec/sp-conversion-policy.md | ✅ 신설 (본 결단 SSOT)                                             |
| 2   | schemas/task-plan.schema.json            | `sp_conversions` 필드 추가 (carry)                                 |
| 3   | tools/plan-coverage-validator/           | gate #3 신규 검증 (모든 SP 분류 완료 / rationale / ADR 인용) carry |
| 4   | methodology-spec/lifecycle-contract.md   | chain 3 plan stage 책임 갱신 (carry)                               |
| 5   | ADR-CHAIN-015-sp-conversion-policy       | ✅ 신설                                                            |
| 6   | CHANGELOG.md                             | v11.x MINOR 또는 v12.0 결단 (carry)                                |
| 7   | poc-17 PROGRESS-poc-17-dogfooding.md     | ✅ M.2 axis 1 측정                                                 |

## 7. 영향 (Consequences)

### 본격 효과

- 신규 stack 마이그레이션 paradigm 완성 (legacy SP 처리 framework)
- chain 3 plan stage 사용자 결단 명시
- numeric/row equivalence 검증 oracle 의무

### Trade-off

- chain 3 plan stage 부담 ↑ (SP 분류 결단)
- task-plan schema additive change
- plan-coverage-validator gate #3 신규 항목

## 8. 인용

- 사용자 명시 — 2026-05-28 / poc-17 plan 결단 cascade
- ADR-CHAIN-015-sp-conversion-policy
- ADR-CHAIN-014-db-assets-always-on (전제)
- methodology-spec/sp-conversion-policy.md (SSOT)
- methodology-spec/db-assets-always-on.md (cascade)
- methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md §X (R1' sub-axis)
- DEC-2026-05-28-db-assets-always-on (전제)
- memory [[feedback_sp_to_code_conversion_policy]]

# Stored Procedure → 신규 stack 코드 로직 전환 정책 (4 분류 매트릭스)

> **사상**: legacy DB 의 Stored Procedure 안에 핵심 비즈니스 로직이 분포한 경우, 신규 stack 마이그레이션 시 **default = SP → app layer 코드 전환** / 예외 3 case 한정 SP 보존 (+ thin wrapper).
> **trigger**: poc-17 ifrs/car dogfooding 작업 (2026-05-28) — 사용자 명시 "프로시저는 코드 로직으로 전환 하기 위한 정책도 필요해".
> **관련**: `db-assets-always-on.md` · `lifecycle-contract.md` · `sub-rules/spring41-ibatis2-isomorphic.md` · ADR-CHAIN-015 · DEC-2026-05-28-sp-conversion-policy.

## 1. 왜 필요한가

사내 legacy paradigm (특히 mainframe 기원 / Oracle PL/SQL / MSSQL T-SQL 중심 시스템) 에서 SP 는 종종 **핵심 정산 / 배치 / 마이그레이션 로직** 보유. 신규 stack (Spring Boot 3.x / NestJS 등) 으로 마이그레이션 시 SP 처리 framework 부재 = plan 부실. poc-17 ifrs/car 작업 plan 결단 시 사용자 명시 → 본 정책 신설.

**default = (α) 코드 전환** 이 본격 paradigm:
- test 용이 (단위 test / mock 가능)
- 마이그레이션 유연 (DB engine 종속 ↓)
- DBA-driven 분산 회피 (app team 자율)
- 신규 stack 표준 ORM / framework 활용
- 관측 가능성 ↑ (log / trace / metric app layer 표준)

다만 **예외 3 case** = SP 보존 + thin wrapper (성능 / 외부 계약 / DB-specific 기능).

## 2. 4 분류 매트릭스

| 분류 | 처리 | 적용 case | 이유 | 신규 stack 산출 |
|---|---|---|---|---|
| **(α) Default — 코드 전환** | SP body → Java/신규 stack service / `@Transactional` 경계 / 단위 test | 일반 CRUD / 단순 query / 분기 logic / 도메인 룰 | test 용이 + 마이그레이션 유연 + ORM 표준 활용 | Service class + Repository method + 단위 test |
| **(β) 보존 — 대용량 batch** | SP 보존 + thin wrapper (Java 가 SP 호출) | set 기반 처리 / n+1 query 회피 / 100만+ row 처리 / cursor 의존 / temporary table 사용 | 성능 — app layer 가면 round-trip 폭발 + heap 부담 | SP 그대로 + Service 의 thin wrapper (StoredProcedureQuery 같은 ORM 또는 raw JDBC) |
| **(γ) 보존 — 외부 시스템 SP** | SP 보존 + thin wrapper (외부 DB 호출) | 외부 ERP/금융/회계 시스템 SP (예: `SGERP.dbo.SG_SACSlipRowCarManagementIFQuery`) | 외부 시스템 계약 / 책임 분리 / 권한 격리 | 외부 SP 그대로 + Service 의 thin wrapper + 외부 시스템 contract 문서 |
| **(δ) 결단 — DB-specific 기능** | ORM 표현 가능하면 (α) / 불가능하면 (β) | window function / hierarchical (CONNECT BY) / CTE / recursive / Oracle MERGE / MSSQL OUTPUT | ORM 능력 case-by-case | (α) Service + JPQL/native query 또는 (β) SP 보존 |

## 3. 분류 결단 절차 (chain 3 plan stage 의무)

```
analysis Phase 1 (1회)
  ↓ SP/Function 정적 분석 → canonical global .aimd/output/stored-procedures/
  ↓
scope chain 1 discovery
  ↓ related_artifacts 역인덱스에 scope 관련 SP list 추가
  ↓
scope chain 2 spec
  ↓ behavior-spec.json 의 SP 의도/입출력 정리 (BHV-* mapping)
  ↓
★ scope chain 3 plan (★ ★ 의무 ★ ★)
  ↓ SP 마다 (α/β/γ/δ) 분류 결단 + ADR 등록
  ↓ task-plan.schema.json 의 sp_conversion_class enum 채움
  ↓
scope chain 4 test
  ↓ (α) = 단위 test / (β,γ,δ) = SP 호출 integration test
  ↓
scope chain 5 implement
  ↓ (α) = 신규 stack Service class + Repository
  ↓ (β,γ,δ) = SP 보존 + thin wrapper Service
  ↓ legacy SP vs 신규 code/wrapper numeric/row equivalence 검증
```

## 4. 결단 기준 체크리스트

각 SP 에 대해 plan stage 진입 시 다음 질문 순서대로 답:

### 4.1 외부 시스템 SP 인가?
- 다른 DB schema / 다른 시스템의 SP 를 호출하는가 (예: `EXTERNAL_DB.dbo.*`)?
- 외부 ERP/금융/회계 시스템 의 SP 인가?
- 외부 시스템 변경 권한 ❌ 인가?

→ **YES 1+ → (γ) 보존**

### 4.2 대용량 batch 인가?
- 100만+ row 처리하는가?
- cursor 또는 temporary table 사용하는가?
- set 기반 처리 (single SQL) 가 app layer 의 n+1 보다 본격적인가?
- 야간 batch / 정산 batch 인가?

→ **YES 2+ → (β) 보존**

### 4.3 DB-specific 기능 의존하는가?
- window function (`ROW_NUMBER() OVER`, `LAG`, `LEAD`) ?
- hierarchical query (Oracle `CONNECT BY` / MSSQL recursive CTE) ?
- DB-specific 함수 (`PIVOT`, `MERGE`, `OUTPUT`, JSON_TABLE 등) ?

→ **YES 1+ → (δ) 결단** (ORM 능력 case-by-case)
- 신규 stack ORM 이 표현 가능 → (α) 시도
- 불가능 → (β) 보존

### 4.4 위 3 조건 모두 ❌
→ **(α) Default 코드 전환** (기본)

## 5. (α) 코드 전환 paradigm

### 5.1 분할 책임
- **SP body → Service layer (Java/신규 stack)**: 비즈니스 로직 (분기 / 계산 / 룰)
- **SQL 부분 → Repository / Mapper**: query (SELECT / INSERT / UPDATE)
- **트랜잭션 경계 → @Transactional**: SP 의 BEGIN TRAN 대체
- **롤백 처리 → exception + @Rollback**: SP 의 ROLLBACK 대체

### 5.2 검증 의무
- 단위 test (mock Repository) — 비즈니스 로직 격리 검증
- integration test (실 DB) — 트랜잭션 / 동시성 검증
- legacy SP vs 신규 Service numeric/row equivalence — 모든 SP signature 정합 입력에서 같은 결과 확인

### 5.3 일반 anti-pattern 회피
- SP 의 implicit cursor → app layer for-loop 으로 옮기지 말 것 (n+1 폭발) — 가능하면 set 기반 native query 유지
- SP 의 dynamic SQL → app layer 의 PreparedStatement 또는 ORM Criteria 로 안전 변환 (SQL injection 회피)
- SP 의 OUT parameter → 신규 stack 의 return DTO 또는 multi-result 처리

## 6. (β/γ) 보존 + thin wrapper paradigm

### 6.1 wrapper 형태
```java
// Spring Boot 3.x JPA 예
@Repository
public class CarCostExternalSpRepository {
  @PersistenceContext private EntityManager em;

  public List<CarCostSlipResult> callSgmaSlipQuery(Long companyId, String yyyymm, ...) {
    StoredProcedureQuery query = em.createStoredProcedureQuery("SGERP.dbo.SG_SACSlipRowCarManagementIFQuery");
    // parameter binding
    query.registerStoredProcedureParameter(...);
    query.setParameter(...);
    return query.getResultList();
  }
}
```

### 6.2 검증 의무
- SP signature / parameter / return type 1:1 매핑 — legacy 호출 vs wrapper 호출 결과 정합
- (γ) 외부 시스템 SP 의 경우 — 외부 시스템 contract 문서 의무 (DEC 또는 ADR)
- 권한 격리 (DB user / role)

## 7. (δ) DB-specific 기능 결단

| DB-specific 기능 | 신규 stack 표현 가능 여부 | 권고 |
|---|---|---|
| window function | ✅ JPA criteria + native query / Spring Data JPA `@Query` | (α) 시도 |
| hierarchical (CONNECT BY) | △ recursive CTE 로 변환 가능 (DB engine 별 차이) | (α) 시도 / 어렵다면 (β) |
| Oracle MERGE | ✅ JPA `merge()` / upsert pattern | (α) |
| PIVOT | △ JPA 어려움 — native query | (α) native query 또는 (β) |
| JSON_TABLE | △ DB engine 종속 | (α) native query 또는 (β) |
| OUTPUT clause (MSSQL) | △ — | (β) 보존 |

## 8. schema 영향 (carry — task-plan.schema.json)

`schemas/task-plan.schema.json` 의 SP-related 결단 필드 추가:

```json
{
  "sp_conversions": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "sp_id": { "type": "string" },
        "sp_name": { "type": "string" },
        "external": { "type": "boolean" },
        "sp_conversion_class": {
          "enum": ["alpha", "beta", "gamma", "delta"],
          "description": "α=code-convert / β=preserve-batch / γ=preserve-external / δ=db-specific-case-by-case"
        },
        "rationale": { "type": "string" },
        "verification_oracle": { "type": "string" },
        "adr_ref": { "type": "string", "pattern": "^ADR-CHAIN-\\d{3}.*$" }
      },
      "required": ["sp_id", "sp_conversion_class", "rationale"]
    }
  }
}
```

(★ plan-coverage-validator gate #3 의 신규 검증 항목 — 모든 SP 가 분류 결단 완료 의무)

## 9. R1' axis sub-axis 정합

SP 정적 분석 = **R1' sub-axis 본격 입증** (`sub-rules/spring41-ibatis2-isomorphic.md` §X 갱신):

| Sub-layer | 자동 추출 | 비고 |
|---|---|---|
| Java (Controller / Service / DAO) | △ 부분 (codegraph ⭐⭐⭐) | LOC 기반 |
| iBATIS sqlMap XML | ❌ (codegraph 미지원) | 수동 SQL Inventory |
| **DB SP / Function SQL** | **✅ 정적 분석 ✅** | AST parse / body extract |

→ analysis Phase 4 business-logic 의 자동화 가능성 ↑ (SP body 추출). §3-A axis 의 ceiling 을 살짝 높일 수 있다 (carry 측정 자산).

## 10. 사례 (poc-17 ifrs/car / 첫 적용)

| SP source | 갯수 | 분류 결단 |
|---|---|---|
| IFRS_split/04_StoredProcedures/ 자체 SP (car 관련 grep) | **0** | 적용 ❌ — car 비종속 |
| 외부 SP 호출 (`carCost.xml:328`) | **1**: `SGERP.dbo.SG_SACSlipRowCarManagementIFQuery` | **(γ) 외부 시스템 SP — 보존 + thin wrapper** / 화면 4 차량비용산출 |

→ car 도메인 SP 전환 부담 사실상 **0 (보존 1만)**. 다른 도메인 (capital / payroll / bspl) 확대 시 (α/β/γ/δ) 본격 적용 측정 가치.

→ poc-17 가 **첫 live 적용 사례**. 다른 도메인 확대 시 (β) 대용량 batch / (δ) DB-specific 사례 노출 예상.

## 11. 인용

- 사용자 명시 — 2026-05-28 / poc-17 ifrs/car plan 결단
- `methodology-spec/db-assets-always-on.md` (DB 자산 always-on 정책)
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X (R1' sub-axis)
- `methodology-spec/lifecycle-contract.md` (chain 3 plan stage)
- `schemas/task-plan.schema.json` (sp_conversions 필드 carry)
- `tools/plan-coverage-validator/` (gate #3 신규 검증 항목)
- DEC-2026-05-28-sp-conversion-policy
- ADR-CHAIN-015-sp-conversion-policy

# ADR-CHAIN-015 — Stored Procedure → 코드 로직 전환 정책 (4 분류 매트릭스)

- 상태: 승인됨 (Accepted) — ★ ★ ★ poc-17 dogfooding 진입 결단
- **결정 시각**: 2026-05-28
- **연관 결정**: DEC-2026-05-28-sp-conversion-policy
- **연관 PoC**: poc-17-ifrs-car-migration (★ 첫 live 적용 — car 도메인 외부 SP 1건 = γ 분류 자명)
- **연관 명세**: methodology-spec/sp-conversion-policy.md (SSOT)
- **연관 schema carry**: schemas/task-plan.schema.json (sp_conversions 필드)
- **연관 ADR**: ADR-CHAIN-014 (db-assets-always-on / 본 ADR 의 전제)
- **버전**: v11.x MINOR (또는 v12.0 결단 carry)

## Context

poc-17 plan 결단 시 사용자 명시:

> "프로시저는 코드 로직으로 전환 하기 위한 정책도 필요해"

본 방법론의 chain harness 가 신규 stack 마이그레이션 (chain 5 implement) 까지 cover 하지만, **Stored Procedure 처리 framework 부재**. 사내 legacy paradigm (특히 mainframe 기원 / Oracle PL/SQL / MSSQL T-SQL 중심) 에서 SP 안에 핵심 정산 / 배치 / 마이그레이션 로직이 분포한 경우 plan 부실 직격.

ADR-CHAIN-014 (DB 자산 always-on) 의 cascade — SP 자산이 chain 입력으로 들어왔으면 그 SP 를 신규 stack 에서 어떻게 처리할지 결단 framework 의무.

## 결정 (Decision)

**SP → 신규 stack 코드 로직 전환 정책 4 분류 매트릭스** 영구 신설. chain 3 plan stage 진입 시 모든 SP 에 대해 (α/β/γ/δ) 분류 결단 의무 — plan-coverage-validator gate #3 신규 검증 항목.

### 1. 4 분류 매트릭스

| 분류 | 처리 | 적용 case |
|---|---|---|
| **(α) Default — 코드 전환** | SP body → Java/신규 stack service + `@Transactional` + 단위 test | 일반 CRUD / 단순 query / 분기 logic / 도메인 룰 |
| **(β) 보존 — 대용량 batch** | SP 보존 + thin wrapper (StoredProcedureQuery 또는 raw JDBC) | set 기반 / n+1 회피 / 100만+ row / cursor / temp table |
| **(γ) 보존 — 외부 시스템 SP** | SP 보존 + thin wrapper (외부 DB 호출) | 외부 ERP/금융/회계 시스템 SP (예: SGERP.dbo.SG_SACSlipRowCarManagementIFQuery) |
| **(δ) 결단 — DB-specific 기능** | ORM 가능하면 (α) / 불가능하면 (β) | window function / hierarchical / CTE / MERGE / PIVOT |

### 2. 결단 절차 (chain 3 plan stage 의무)

1. analysis Phase 1 의 SP 정적 분석 결과 → scope chain 1 discovery 입력
2. chain 2 spec stage 에서 behavior-spec.json 매핑 (BHV-* ↔ SP body 의도)
3. ★ **chain 3 plan stage 에서 SP 마다 (α/β/γ/δ) 분류 결단** + ADR 등록 + task-plan.schema.json 의 `sp_conversion_class` 채움
4. chain 4 test stage 에서 SP 분류별 test 전략 (α=단위 test / β,γ,δ=integration test)
5. chain 5 implement stage 에서 산출 (α=Service+Repository / β,γ,δ=SP 보존+thin wrapper)
6. legacy SP 호출 결과 vs 신규 code/wrapper 결과 numeric/row equivalence 검증

### 3. 결단 체크리스트 (질문 순서)

1. **외부 시스템 SP 인가?** (다른 DB / 외부 ERP / 변경 권한 ❌) → YES → **(γ)**
2. **대용량 batch 인가?** (100만+ row / cursor / temp table / 야간 batch) → YES → **(β)**
3. **DB-specific 기능 의존?** (window / hierarchical / CTE / MERGE / PIVOT) → YES → **(δ)** (ORM case-by-case)
4. **위 3 모두 ❌** → **(α)** Default 코드 전환

### 4. task-plan 스키마 갱신 (carry)

`schemas/task-plan.schema.json` 의 추가:

```json
"sp_conversions": {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "sp_id": { "type": "string" },
      "sp_name": { "type": "string" },
      "external": { "type": "boolean" },
      "sp_conversion_class": {
        "enum": ["alpha", "beta", "gamma", "delta"]
      },
      "rationale": { "type": "string" },
      "verification_oracle": { "type": "string" },
      "adr_ref": { "type": "string", "pattern": "^ADR-CHAIN-\\d{3}.*$" }
    },
    "required": ["sp_id", "sp_conversion_class", "rationale"]
  }
}
```

### 5. plan-coverage-validator gate #3 신규 검증 항목 (carry)

`tools/plan-coverage-validator/` 에 추가:
- 모든 SP (related_artifacts.db_procedures[]) 가 task-plan.sp_conversions[] 에 분류 결단 완료
- 분류 = "alpha" 의 경우 task 1+ 매핑 의무 (코드 전환 task)
- 분류 = "beta"/"gamma"/"delta" 의 경우 thin wrapper task 1+ 매핑 의무
- rationale 비어있지 않음
- adr_ref 등록됨 (ADR-CHAIN-* 인용)

## 결과 (Consequences)

### 본격 효과
- 신규 stack 마이그레이션 paradigm 완성 (legacy SP 처리 framework)
- chain 3 plan stage 의 사용자 결단 명시 (SP 마다 분류 의무)
- legacy 비즈니스 로직 보존 vs 코드 전환 trade-off 명문화
- numeric/row equivalence 검증 oracle 의무 — quality 보증

### Trade-off
- chain 3 plan stage 부담 ↑ (SP 분류 결단)
- plan-coverage-validator gate #3 enforcement 추가
- task-plan schema breaking change 가능성 (additive 인지 확인)

### 영향 자산
- `schemas/task-plan.schema.json` (additive `sp_conversions` 필드)
- `tools/plan-coverage-validator/` (gate #3 신규 검증)
- `methodology-spec/lifecycle-contract.md` (chain 3 plan stage 책임 갱신)
- `methodology-spec/plugin-charter.md` (R20-prime + sp_conversion paradigm)
- 모든 chain agent (plan / test / implement) 가 SP 분류 인식 의무

## 인용

- 사용자 명시 — 2026-05-28 / poc-17 plan 결단
- `methodology-spec/sp-conversion-policy.md` (SSOT)
- `methodology-spec/db-assets-always-on.md` (ADR-CHAIN-014 / 전제)
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X (R1' sub-axis)
- `methodology-spec/lifecycle-contract.md` §chain 3 plan stage
- `schemas/task-plan.schema.json` (sp_conversions 신설 carry)
- `tools/plan-coverage-validator/` (gate #3 carry)
- DEC-2026-05-28-sp-conversion-policy

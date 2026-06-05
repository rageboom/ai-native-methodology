# sql-inventory phase: sql-inventory (SQL 단위 11 컬럼 인벤토리 + extraction_automation)

> **명령어**: `/analyze-sql-inventory` · **사상**: Michael Feathers Characterization Testing (2004) + Gartner TIME framework + AWS Migration Acceleration Program (MAP)
> **핵심 책임**: rules + antipatterns + characterization 만으로는 SQL 단위 추적 ❌ → SQL 단위 11 컬럼 인벤토리 (외부 6 + 본 추가 5) + extraction_automation metric → chain 1 discovery-spec UC↔sql_id mapping 입력 보강
> **RDB only**: ✅ (NoSQL/Prisma 단독 환경 시 skip)

---

## 1. 목적

`characterization` phase 의 `intent_classification` 만으로는 SQL 단위 추적 ❌. iBATIS 2 / MyBatis / Spring JDBC / JPA Repository 모두 정합인 SQL 인벤토리 자산 부재.

**답하는 질문**:

- 어느 sql_id 가 어느 UC + intent 분류에 속하나? (uc_link + intent_vs_bug_classification)
- 어느 SQL 이 PreparedStatement 가 아닌 CallableStatement (Stored Procedure 호출) 인가? (statement_type)
- 어느 SQL 이 외부 (DB function / SP / cross-domain) 의존인가? (carry_flags)
- iBATIS 2 dynamic 분기 + SQL CASE WHEN 분기는 몇 개? (dynamic_branch)

---

## 2. 입력

| 입력                                          | 출처                                                                    | 신뢰도 기여 |
| --------------------------------------------- | ----------------------------------------------------------------------- | ----------- |
| inventory.json                                | `discovery` phase 산출물 (RDB 환경 식별)                                | 사전 조건   |
| business-rules.json                           | `business-logic` phase 산출물                                           | 60%         |
| antipatterns.json                             | `quality` / `business-logic` phase partial                              | +10%p       |
| characterization-spec.json                    | `characterization` phase 산출물 (intent_classification cross-link 의무) | +20%p       |
| 도메인 expert 인터뷰 (DBA-read carry 시 의무) | 사용자 위임                                                             | +10%p       |

→ `discovery` phase + `business-logic` phase + `characterization` phase 미완료 시 `sql-inventory` phase 진입 차단.
→ NoSQL / Prisma 단독 환경 시 phase 4.8 skip / `_manifest.yml` 의 `rdb_only: false`.

---

## 3. 처리 — 11 컬럼 + extraction_automation metric

### 3.1 11 컬럼 명세

| #   | 컬럼                         | 출처                              | 자동?                                                         |
| --- | ---------------------------- | --------------------------------- | ------------------------------------------------------------- |
| 1   | sql_id                       | 외부                              | ✅ grep                                                       |
| 2   | mapper_xml                   | 외부                              | ✅                                                            |
| 3   | statement_type               | MyBatis 14 표준                   | ✅ grep — XML `statementType` 속성 + Java `CallableStatement` |
| 4   | called_from_screen           | 외부                              | ❌ 매뉴얼                                                     |
| 5   | business_meaning             | 외부                              | ❌ 매뉴얼 (LLM ~70%)                                          |
| 6   | dynamic_branch               | 외부                              | ✅ grep                                                       |
| 7   | dependent_tables             | 외부                              | ✅ regex                                                      |
| 8   | uc_link                      | 본 추가                           | ❌ 매뉴얼                                                     |
| 9   | intent_vs_bug_classification | 본 추가                           | ❌ cross-link (4 분류 키워드 ≥ 1 의무)                        |
| 10  | confidence                   | 본 추가                           | ✅ 자동                                                       |
| 11  | carry_flags                  | 본 추가                           | ❌ 매뉴얼 (enum 8종)                                          |

### 3.2 산출물

| 산출물              | AI 눈                                     | 사람 눈                                 |
| ------------------- | ----------------------------------------- | --------------------------------------- |
| SQL Inventory entry | `output/sql-inventory/sql-inventory.json` | (없음 / md 별도)                        |
| 11 컬럼 표          | (없음 / json 별도)                        | `output/sql-inventory/sql-inventory.md` |
| 1차 grep 산출       | `output/sql-inventory/raw-grep.txt`       | (디버그 용)                             |

### 3.3 statement_type enum

| 값          | 정의                                   | 식별                                                                                                            |
| ----------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ | ------ | ------------- |
| `PREPARED`  | default / 일반 SQL (PreparedStatement) | iBATIS `<select                                                                                                 | update | insert | delete>` 기본 |
| `CALLABLE`  | Stored Procedure 호출                  | iBATIS `<procedure id>` / MyBatis `statementType="CALLABLE"` / Java `CallableStatement` / `S_*` / `SP_*` prefix |
| `STATEMENT` | 드물게 사용                            | XML `statementType="STATEMENT"` 명시 시                                                                         |

### 3.4 carry_flags enum (8종)

`DBA-read` / `proc-body` / `external_call_out_of_scope` / `domain-expert-review` / `domain-expert` / `scope-decision-carry` / `cross-domain` / `DRY-violation`

### 3.5 if/then 의무

`carry_flags` 에 `external_call_out_of_scope` 또는 `DBA-read` 시 → `confidence ≤ 0.80` 자동 검증 (sql-inventory-validator enforcement).

---

## 4. extraction_automation metric

```yaml
extraction_automation:
  auto_extracted_columns:
    [
      'sql_id',
      'mapper_xml',
      'statement_type',
      'dynamic_branch',
      'dependent_tables',
    ]
  manual_columns: ['called_from_screen', 'business_meaning']
  auto_ratio_external_6: '4/6 = 66.7% (≥ 50% pass)'
  auto_ratio_external_7: '5/7 = 71.4%'
  auto_ratio_total_11: '5/11 = 45.5%'
```

**threshold**: 외부 6 컬럼 자동화 비율 ≥ 0.50 (default / sql-inventory-validator `--threshold-auto-ratio`).

---

## 5. patterns_extension_v2 (optional / Legacy iBATIS 한정)

nested patterns object 패턴. 4 패턴:

- pattern_1_dynamic_branch / pattern_2_calculation_formula / pattern_3_result_mapping / pattern_4_shared_sql_fragments

patterns_extension_v3 (cache / discriminator / typeHandler) = 본 phase scope ❌.

---

## 6. 자동 검증 (S2 / S3 / S4 정합)

```bash
# Schema validate
node tools/schema-validator/src/cli.js .aimd/output/sql-inventory/

# 11 컬럼 + statement_type + carry_flags + confidence if/then
node tools/sql-inventory-validator/src/cli.js \
  --target .aimd/output/sql-inventory/ \
  --threshold-auto-ratio 0.50
# 옛 명칭 'sql-inventory-extractor' bin alias 양쪽 보존 (옛 호출자 break ❌)
```

Exit codes:

- 0 = pass / no breaking finding
- 1 = critical/high finding ≥ 1
- 2 = usage error
- 3 = dry-run only

---

## 7. chain 1 입력 보강

phase 4.8 산출물 = chain 1 (discovery-spec) 입력 핵심:

- sql_id ↔ uc_link → use_case 의 SQL 단위 추적
- intent_vs_bug_classification → discovery-spec carry 의무
- carry_flags external_call_out_of_scope → 새 시스템 외부 의존 명시
- DBA-read + proc-body → 새 시스템 SP body 재구현 차단

---

## 8. 흔한 함정

1. RDB 부재 환경 (NoSQL/Prisma 단독) → phase 4.8 skip 의무
2. Modern ORM raw SQL 측정 표준 부재 → Modern ORM 정합 검증 carry
3. called_from_screen 자동화 0% → 매뉴얼 매핑 + 시간 cap carry
4. business_meaning LLM ~70% → 도메인 expert 검증 carry
5. external*call_out_of_scope 누락 → FN*_ / S\__ / SP\_\* prefix grep 의무
6. 시간 cap (대규모 모듈) → coverage_ratio 자연어 (예: "15/71 = 21.1%") + scope_decision: carry
7. patterns_extension_v2 의무화 ❌ → optional 명시 / Legacy 한정
8. statement_type 누락 → CALLABLE SP 식별 ❌ / 새 시스템 재구현 시 SP 의존 손실

---

## 9. ≥ 2 PoC scale-cross corroboration

격상 gate: 외부 6 컬럼 자동화 비율 + statement_type 식별 = Legacy iBATIS 2 환경 ≥ 2 PoC scale-cross corroboration 의무 (단일책임 + 다중책임 / scale 무관 isomorphic). paradigm-cross (Modern ORM) = 별도 corroboration carry.

---

## 인용

- 본체 명세: `methodology-spec/deliverables/24-sql-inventory.md`
- schema: `schemas/sql-inventory.schema.json`
- validator: `tools/sql-inventory-validator/`
- skill: `skills/analysis-sql-inventory/SKILL.md`
- ADR: ADR-CHAIN-007 (phase 4.8 sql-inventory 도입)
- corroboration #1: DEC-2026-05-08-poc-06-sql-inventory-retrofit
- corroboration #2: DEC-2026-05-08-poc-07-종결

### 외부 권위 출처

- Michael Feathers, _Working Effectively with Legacy Code_ (2004)
- Gartner _TIME framework_ / AWS _Migration Acceleration Program_ (MAP)
- MyBatis 3 / iBATIS 2 / sonar-mybatis / SchemaSpy / ibatis2mybatis 공식 docs

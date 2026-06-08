---
name: analysis-sql-inventory
description: Use when project is RDB-based AND has analysis output (business-rules.json + antipatterns.json + characterization-spec.json) AND user invokes "sql inventory" or "mapper xml" or "ibatis sql" or "DAO sql" or "stored procedure inventory" task. Generates sql-inventory.json (산출물 24). Opus 4.7 외부 조언 6 컬럼 + 본 방법론 추가 5 컬럼 (statement_type / uc_link / intent_vs_bug_classification / confidence / carry_flags) = 11 컬럼. iBATIS 2 / MyBatis / Spring JDBC / JPA Repository 모두 정합. ≥ 2 PoC scale-cross isomorphic 입증 (PoC #06 단일책임 + PoC #07 다중책임 / Spring 4.1 + iBATIS 2 spectrum / paradigm-cross = Modern ORM PoC #08 carry). Stage = analysis, manifest phase = 4.8.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-sql-inventory — SQL 단위 11 컬럼 인벤토리 + extraction_automation

phase 4.8 SQL 단위 인벤토리 추출. ≥ 2 PoC scale-cross corroboration 의무.

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`. (persona 시뮬 = 신뢰도 -5%p.)

- ✅ 실 코드 grep + mapper XML grep + Java DAO grep 의무 (외부 analyzer 아님)
- ✅ DB function (FN*\*) / Stored Procedure (S*\_ / SP\_\_) 호출 시 → DBA-read carry 명시 의무 (proc-body 부재)
- ✅ business_meaning 자연어 = LLM ~70% / 도메인 expert 검증 carry 의무

## 사전 조건

- RDB 환경 (NoSQL/Prisma 단독 환경 시 skip / `_manifest.yml` 의 `rdb_only: false` 시 phase 4.8 자동 skip)
- analysis output 존재 — business-rules.json (phase 4) + antipatterns.json (phase 6 / phase 4 partial) + characterization-spec.json (phase 4.7)
- 도메인 expert 인터뷰 가능 OR carry 명시 의무 (ambiguous + DBA-read + proc-body carry)

## 절차 (단일 prompt 양 spectrum / Cursor/Cline/Aider 표준 정합)

### 1. mapper XML grep (자동 ✅)

```bash
# iBATIS 2 / MyBatis 공통
grep -rn -E '<(select|update|insert|delete|procedure)\b' <src>/sqlmap/ <src>/mapper/ \
  --include="*.xml"

# Spring JDBC inline
grep -rn -E 'jdbcTemplate\.(query|update|execute|call)' <src>/ \
  --include="*.java"

# JPA @NativeQuery
grep -rn -E '@(NativeQuery|Query.*nativeQuery\s*=\s*true)' <src>/ \
  --include="*.java"

# TypeORM raw
grep -rn -E '\.query\(' <src>/ --include="*.ts"

# Prisma raw
grep -rn -E '\$queryRaw|\$executeRaw' <src>/ --include="*.ts"
```

### 2. statement_type 자동 추출 (Agent 1 강 권고 흡수 / MyBatis 14 표준 속성)

```bash
# iBATIS 2 / MyBatis XML statementType 속성
grep -rn -E 'statementType\s*=\s*"(PREPARED|CALLABLE|STATEMENT)"' <src>/sqlmap/ <src>/mapper/ \
  --include="*.xml"

# Java CallableStatement (Stored Procedure 호출 식별)
grep -rn -E '(CallableStatement|prepareCall|<procedure|SP_|S_[A-Z])' <src>/ \
  --include="*.java" --include="*.xml"
```

default = `PREPARED` / `<procedure id=...>` 또는 `S_*` / `SP_*` prefix → `CALLABLE`.

### 3. dynamic_branch 추출 (자동 ✅)

```bash
# iBATIS 2 dynamic tags
grep -rn -E '<(dynamic|isNotEmpty|isNotNull|isEqual|isGreaterThan|isPropertyAvailable|iterate)\b' \
  <src>/sqlmap/ --include="*.xml"

# MyBatis 3 dynamic tags
grep -rn -E '<(if|choose|when|otherwise|trim|where|set|foreach|bind)\b' \
  <src>/mapper/ --include="*.xml"

# SQL CASE WHEN (in-statement branch)
grep -rn -E 'CASE\s+WHEN' <src>/ --include="*.xml" --include="*.java"
```

### 4. dependent_tables 추출 (자동 ✅)

```bash
# FROM/JOIN 테이블 regex
grep -rn -iE '\b(FROM|JOIN)\s+(\[?[A-Z_][A-Z_0-9]*\]?)' <src>/ \
  --include="*.xml" --include="*.java"
```

### 5. called_from_screen 매뉴얼 매핑 (Controller → JSP recursive)

```bash
# Controller @RequestMapping → service → DAO 추적
grep -rn -E '@(RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping)' <src>/ \
  --include="*.java"

# JSP 호출 recursive
grep -rn -E '/(ajax|api|do)/' <src>/ --include="*.jsp" --include="*.html"
```

Modern stack (REST API only) 시 `'N/A — REST API only'` 명시.

### 6. business_meaning 자연어 (LLM ~70%)

각 sql_id 마다 자연어 요약 작성 — 도메인 expert 검증 carry 의무.

### 7. phase 4.7 cross-link 의무 (본 추가 4 컬럼)

| 컬럼                         | 출처                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| uc_link                      | discovery-spec UC ID 매핑 (또는 `'N/A — supplementary'`)                                                                                                  |
| intent_vs_bug_classification | characterization-spec.json `intent_classification` cross-link 자연어 (4 분류 키워드 ≥ 1 의무)                                                             |
| confidence                   | meta-confidence 단계별 가중 [0.0, 1.0]                                                                                                                    |
| carry_flags                  | enum 8종 (DBA-read / proc-body / external_call_out_of_scope / domain-expert-review / domain-expert / scope-decision-carry / cross-domain / DRY-violation) |

external_call_out_of_scope 또는 DBA-read carry 시 → confidence ≤ 0.80 의무 (validator if/then 자동 검증).

### 8. extraction_automation 측정 (≥ 50% pass)

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
  auto_ratio_external_7: '5/7 = 71.4% (statement_type 추가 후)'
  auto_ratio_total_11: '5/11 = 45.5%'
```

### 9. patterns_extension_v2 (optional / Legacy iBATIS 한정)

nested patterns object 패턴. 4 패턴:

- pattern_1_dynamic_branch / pattern_2_calculation_formula / pattern_3_result_mapping / pattern_4_shared_sql_fragments

patterns_extension_v3 (cache / discriminator / typeHandler) = scope 외 (미지원).
iBATIS 2 전용 `<dynamic>` / `<iterate>` / `<isPropertyAvailable>` sub-classification = scope 외 (미지원).

### 10. sql-inventory.json 작성 (json 단독 SSOT — sql-inventory.md 미산출)

`schemas/sql-inventory.schema.json` 정합. 4 sub-section (meta_confidence + summary + extraction_automation + inventory + (optional) patterns_extension_v2).

```bash
node ../../tools/schema-validator/src/cli.js .ai-context/output/sql-inventory/
# Expect: sql-inventory.json valid + carry_flags enum 통과 + external_call_out_of_scope confidence if/then 통과
```

### 11. sql-inventory-validator 실행

```bash
node ../../tools/sql-inventory-validator/src/cli.js \
  --target .ai-context/output/sql-inventory/ \
  [--threshold-auto-ratio 0.50]
# Expect: 11 컬럼 의무 / statement_type enum / carry_flags enum / extraction_automation 형식 검증 통과
```

## 산출물

- `<user-project>/.ai-context/output/sql-inventory/sql-inventory.json` (산출물 24 / 통합 entry / json 단독 SSOT)
- `<user-project>/.ai-context/output/sql-inventory/raw-grep.txt` (1차 산출)

## chain 1 입력 보강

phase 4.8 산출물 = chain 1 (discovery-spec) 입력 핵심:

- sql_id ↔ uc_link → use_case 의 SQL 단위 추적
- intent_vs_bug_classification → discovery-spec carry 의무
- carry_flags external_call_out_of_scope → 새 시스템 외부 의존 명시
- DBA-read + proc-body → 새 시스템 SP body 재구현 차단

## 외부 권위 출처

- Michael Feathers, _Working Effectively with Legacy Code_ (2004) — "production = its own specification"
- Wikipedia _Characterization test_
- Gartner _TIME framework_ (Tolerate / Invest / Migrate / Eliminate)
- AWS Migration Acceleration Program (MAP) Assess phase
- MyBatis 3 Mapper XML Files (https://mybatis.org/mybatis-3/sqlmap-xml.html)
- MyBatis 3 Dynamic SQL (https://mybatis.org/mybatis-3/dynamic-sql.html)
- iBATIS 2 SqlMaps Developer Guide (https://ibatis.apache.org/docs/java/pdf/iBATIS-SqlMaps-2_en.pdf)
- sonar-mybatis (https://github.com/donhui/sonar-mybatis)
- SchemaSpy 6.0 (https://schemaspy.readthedocs.io/en/v6.0.0/configuration.html)
- ibatis2mybatis (https://github.com/mybatis/ibatis2mybatis)
- Spring Data JPA @NativeQuery
- Render Blog — Claude Code legacy refactor 1위 (2025)

## 흔한 함정 (deliverable §11 정합)

1. RDB 부재 환경 (NoSQL/Prisma 단독) → phase 4.8 skip 의무
2. Modern ORM raw SQL 측정 표준 부재 → Modern ORM 측정 carry (corroboration 미충족)
3. called_from_screen 자동화 0% → 매뉴얼 매핑 + 시간 cap carry
4. business_meaning LLM ~70% → 도메인 expert 검증 carry
5. external*call_out_of_scope 누락 → FN*\_ / S\_\_ / SP\_\* prefix grep 의무
6. 시간 cap (대규모 모듈) → coverage_ratio 자연어 (예: "15/71 = 21.1%") + scope_decision: carry
7. patterns_extension_v2 의무화 ❌ → optional 명시 / Legacy 한정

## 인용

- 정책: `methodology-spec/deliverables/24-sql-inventory.md`
- schema: `schemas/sql-inventory.schema.json`
- 도구: `tools/sql-inventory-validator/`
- flow: `flows/analysis.phase-flow.json` (phase 4.8 entry)
- ADR: ADR-CHAIN-007 (phase 4.8 도입)
- ADR: ADR-011 (json 단독 / .md 미산출)
- ADR: ADR-009 (5단계 신뢰도 모델)
- 결단: DEC-2026-05-08-poc-06-sql-inventory-retrofit (corroboration #1)
- 결단: DEC-2026-05-08-poc-07-종결 (corroboration #2)


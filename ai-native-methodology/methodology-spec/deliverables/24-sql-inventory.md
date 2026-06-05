# 산출물 #24: SQL Inventory

> **사상**: Michael Feathers Characterization Testing (2004) "production = its own specification" + AWS Migration Acceleration Program (MAP) Assess phase
> **schema**: `schemas/sql-inventory.schema.json`
> **생성 phase**: `sql-inventory` phase (`characterization` phase 후 / `api` phase + `ui` phase 전 / RDB 한정 sub-phase)
> **자격**: ≥ 2 PoC corroboration 의무 (scale + paradigm + ORM + platform + language + responsibility-cross). 외부 6 컬럼 자동화 = scale + paradigm 무관 isomorphic.

---

## 1. 목적

**답하는 질문**: "business-rules.json + antipatterns.json + characterization-spec.json 만으로는 SQL 단위 추적 ❌. 새 시스템 재구현 시 어떤 sql_id 가 어느 UC + intent 분류에 속하고, 어느 DB function/SP 가 외부 의존인지 명시 의무."

**AI 재구현 시 활용**:

- chain 1 discovery-spec 입력 보강 (UC ↔ sql_id ↔ intent_classification cross-link)
- chain 5 GREEN 검증 시 sql_id 별 dependent_tables / external_calls 자동 식별
- carry_flags 명시 = DBA-read / external_call_out_of_scope / domain-expert-review 차단 의무

### 1.1 외부 조언 (사상적 근거)

- Michael Feathers, _Working Effectively with Legacy Code_ (2004) — "production = its own specification"
- Wikipedia _Characterization test_ — "actual behavior > 의도된 behavior"
- Gartner _TIME framework_ (Tolerate / Invest / Migrate / Eliminate) → **SQL 단위 보류** — application portfolio 단위와 abstract granularity mismatch / 본 deliverable §4 12번째 컬럼은 `migration_priority` P0~P3 채택 (Gartner TIME 미사용 / application-level Gartner TIME = 별도 deliverable).
- AWS Migration Acceleration Program (MAP) — Assess / Mobilize / Migrate / Modernize 4 phase

### 1.2 "Why not AWS SCT" 차별화

| 도구                                     | scope                                      | 본 deliverable 차이                                                     |
| ---------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| AWS Schema Conversion Tool (SCT)         | schema-level (table / column / FK / index) | 본 SQL Inventory = SQL-level (sql_id / UC ↔ intent_classification)      |
| SchemaSpy                                | schema-level metadata HTML/CSV             | 본 = SQL 단위 business intent + dynamic_branch + carry_flags            |
| sonar-mybatis                            | namespace+id grep + dynamic if 검출        | 본 = phase 4.7 cross-link (uc_link / intent_vs_bug_classification) 강화 |
| MyBatis Migrations changelog             | (ID, APPLIED_AT, DESCRIPTION)              | 본 = 변경 추적 ❌ / 인벤토리 자체                                       |
| Oracle SQL Developer Migration Workbench | technical complexity classification        | 본 = SQL-level + `migration_priority` P0~P3 (first-mover / 도구 부재)   |
| Liquibase changelog                      | changelog 추적                             | 본 = SQL-level 인벤토리 + migration priority                            |

→ **본 방법론 SQL Inventory = SQL-level + business intent + cross-link 의 고유 contribution** (Stripe / Shopify / AWS MAP / Gartner TIME 모두 application-level 또는 schema-level / SQL-level 인벤토리 공개 표준 부재).

→ **`migration_priority` SQL 단위 axis = first-mover**: SQL Inventory 도구 (AWS SCT / Oracle SQL Dev Migration Workbench / Liquibase) 모두 TIME 컬럼 부재. 본 방법론은 application portfolio 수준 Gartner TIME 과 분리 axis 채택.

---

## 2. 형식

```
output/sql-inventory/
├── sql-inventory.json     # AI 눈 / 통합 entry / 11 컬럼 record
├── sql-inventory.md       # 사람 눈 / 11 컬럼 표 + 동적 분기 + SATD + 외부 호출
└── raw-grep.txt           # 1차 산출 (mapper XML + DAO grep)
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목                                | 출처                                                              | 도구                   | 신뢰도 (단계 5)                                |
| ----------------------------------- | ----------------------------------------------------------------- | ---------------------- | ---------------------------------------------- |
| sql_id / mapper_xml                 | iBATIS XML / MyBatis XML / `@Query` annotation                    | grep + regex           | 95~100% (자동)                                 |
| statement_type                      | XML `statementType` 속성 / Java `CallableStatement` grep          | grep                   | 90~95% (자동)                                  |
| dynamic_branch                      | iBATIS dynamic tags + SQL CASE WHEN regex                         | grep                   | 80~95% (자동)                                  |
| dependent_tables                    | FROM/JOIN regex                                                   | regex + SchemaSpy 검증 | 85~95% (자동)                                  |
| called_from_screen                  | JSP / Controller recursive trace                                  | LLM + 매뉴얼           | 60~80% (매뉴얼)                                |
| business_meaning                    | LLM 자연어 요약 + 도메인 expert 검증 carry                        | LLM ~70%               | 50~80% (매뉴얼 + carry)                        |
| uc_link                             | discovery-spec UC ID                                              | 매뉴얼 매핑            | 80~95%                                         |
| intent_vs_bug_classification        | characterization-spec.json 분류 reference                         | cross-link             | 80~95%                                         |
| confidence                          | meta-confidence 단계별 가중                                       | 자동                   | 90%                                            |
| carry_flags                         | DBA-read / external_call_out_of_scope / domain-expert-review enum | 매뉴얼                 | 90%                                            |
| **migration_priority**              | P0/P1/P2/P3 (AP severity + carry_flags + paradigm risk → 분류)    | LLM + 매뉴얼           | 70~85% (classification 매뉴얼)                 |

**입력**: business-rules.json (phase 4) + antipatterns.json (phase 6) + characterization-spec.json (phase 4.7) + 코드 (mapper XML + DAO + Controller + JSP)
**no-simulation 정책**: simulation 시 -5%p 패널티 / 도메인 expert 인터뷰 carry 필수.

### 3.1 미추출 (의도적)

- 자동 코드 generation — chain 5 (impl-spec) 영역
- DAO + DB 통합 테스트 — chain 4 (test-spec) 영역 (scope ❌ / carry)
- MockMvc Replay 테스트 — chain 4 영역 / carry
- DBUnit / @Sql 픽스처 — chain 4/5 영역 / carry
- Modern ORM (JPA / TypeORM / Prisma) raw SQL 측정 — paradigm-cross corroboration carry

---

## 4. 12 컬럼 명세

| #      | 컬럼                                                | 출처                              | 자동?                    | 설명                                                                                                                                                                                                                                      |
| ------ | --------------------------------------------------- | --------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | sql_id                                              | 외부                              | ✅ grep                  | DAO.method 또는 mapper namespace.id (예: `ExchangeDAO.selectExchangeList`)                                                                                                                                                                |
| 2      | mapper_xml                                          | 외부                              | ✅                       | XML 파일 path 또는 `'inline'` (Spring JDBC) / `'jpa'` (Repository)                                                                                                                                                                        |
| 3      | statement_type                                      | MyBatis 14 표준                   | ✅ grep                  | enum: `PREPARED` (default) / `CALLABLE` (SP 호출) / `STATEMENT`                                                                                                                                                                           |
| 4      | called_from_screen                                  | 외부                              | ❌ 매뉴얼                | Controller → JSP recursive trace / Modern 시 `'N/A — REST API only'`                                                                                                                                                                      |
| 5      | business_meaning                                    | 외부                              | ❌ 매뉴얼 (LLM ~70%)     | 자연어 요약 + 도메인 expert 검증 carry                                                                                                                                                                                                    |
| 6      | dynamic_branch                                      | 외부                              | ✅ grep                  | array of {tag, line, branch_count}                                                                                                                                                                                                        |
| 7      | dependent_tables                                    | 외부                              | ✅ regex                 | array of FROM/JOIN 테이블                                                                                                                                                                                                                 |
| 8      | uc_link                                             | 본 추가                           | ❌ 매뉴얼                | discovery-spec UC ID (예: `UC-EXCHANGE-002`) 또는 `'N/A — supplementary'`                                                                                                                                                                 |
| 9      | intent_vs_bug_classification                        | 본 추가                           | ❌ cross-link            | characterization 4 분류 자연어 (예: `'intent (BR-002 정합) + bug 동반 (AP-006)'`)                                                                                                                                                         |
| 10     | confidence                                          | 본 추가                           | ✅ 자동                  | meta-confidence 단계별 가중 [0.0, 1.0]                                                                                                                                                                                                    |
| 11     | carry_flags                                         | 본 추가                           | ❌ 매뉴얼                | enum: `DBA-read` / `proc-body` / `external_call_out_of_scope` / `domain-expert-review` / `scope-decision-carry`                                                                                                                           |
| **12** | **migration_priority**                              | 본 추가                           | ❌ classification 매뉴얼 | enum: `P0` 즉시(critical/차단) / `P1` 短期(3개월/high) / `P2` 中期(6~12개월/medium) / `P3` 후순위(12개월+/low or maintain). **optional** (기존 11 컬럼 row backward-compat 의무). Gartner TIME (application portfolio 단위) 와 분리 axis. |

자동 추출 비율 (외부 6 컬럼 + statement_type) = **5/7 = 71.4%** (외부 6 컬럼 4/6 = 66.7% baseline 정합). migration_priority 는 classification metadata (자동화 비율 산정 제외 / 본 추가 5 컬럼과 동일 axis).

### 4.1 migration_priority 분류 가이드

| enum                  | trigger (분류 신호)                                                                                                            | 예시                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `P0` 즉시             | critical bug / critical AP 동반 / external_call_out_of_scope + DBA-read 동반 / paradigm 위반 / 평문 password 등 보안 핵심 risk | AP-EXCHANGE-006 (정규화 위반) + critical 평문 password 등 |
| `P1` 短期 (3개월)     | high AP 동반 / N+1 / dynamic SQL 복잡도 高 / business 핵심 hot path                                                            | AP-EXCHANGE-007 (자조 SATD) + N+1 fetch                   |
| `P2` 中期 (6~12개월)  | medium AP / refactoring 후보 / patterns_extension 충돌 / Anemic Domain                                                         | AP-EXCHANGE-008 (ambiguous) + Anemic 등                   |
| `P3` 후순위 (12개월+) | low AP / 단순 CRUD / maintain only                                                                                             | 단순 SELECT / INSERT                                      |

**no-simulation 정합**: classification 은 도메인 expert 결단 의무 (LLM 추정 시 carry_flags 에 `domain-expert-review` 명시 + confidence ≤ 0.85 자동 의무).

---

## 5. extraction_automation metric 의무

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
  auto_ratio_external_6: '4/6 = 66.7% (baseline / ≥ 50% pass)'
  auto_ratio_external_7: '5/7 = 71.4% (statement_type 포함)'
  auto_ratio_total_11: '5/11 = 45.5% (참고 / 본 추가 4 컬럼은 metadata)'
```

---

## 6. patterns_extension_v2 (optional / Legacy iBATIS 한정)

nested patterns object 패턴. optional / Legacy iBATIS 한정. **현재 4 패턴**:

| 패턴                           | 정의                                             | 공식 docs 정합                | 자동?           |
| ------------------------------ | ------------------------------------------------ | ----------------------------- | --------------- |
| pattern_1_dynamic_branch       | iBATIS 2 dynamic tags + SQL CASE WHEN            | ✅ MyBatis dynamic-sql.html   | ✅ 80%+         |
| pattern_2_calculation_formula  | SQL 함수 (CASE WHEN / FORMAT / ISNULL / CONVERT) | ❌ 공식 부재 / 본 방법론 고유 | ✅ 100% (regex) |
| pattern_3_result_mapping       | resultClass + parameterClass + parameterMap      | ✅ MyBatis sqlmap-xml.html    | ✅ 100%         |
| pattern_4_shared_sql_fragments | iBATIS `<sql id>` + `<include refid>`            | ✅ MyBatis sqlmap-xml.html    | ✅ 100%         |

### 6.1 patterns_extension_v3

MyBatis 3+ advanced features 한정 / optional. iBATIS 2 단독 stack 부적합 (별도 axis / patterns_extension_v2 사용).

| 패턴                    | MyBatis 3 정의                                                                     | 자동 추출 | iBATIS 2 비호환                               |
| ----------------------- | ---------------------------------------------------------------------------------- | --------- | --------------------------------------------- |
| pattern_5_cache         | `<cache>` namespace 단위 second-level cache + `<cache-ref>` + `@CacheNamespace`    | ✅ 80%+   | iBATIS 2 = `<cacheModel>` (API 비호환)        |
| pattern_6_discriminator | `<discriminator>` ResultMap inheritance / column + javaType 필수                   | ✅ 95%+   | iBATIS 2 = 부재 (subMap 수동 분기)            |
| pattern_7_typeHandler   | `<typeHandler>` + `TypeHandler<T>` (generic) + `@MappedTypes` / `@MappedJdbcTypes` | ✅ 90%+   | iBATIS 2 = `TypeHandlerCallback` (generic ❌) |

schema $def: `patternsExtensionV3` (root-level reference `patterns_extension_v3` / optional).

자격: iBATIS 2 단독 stack 은 patterns_extension_v3 corroboration ❌ → Modern PoC MyBatis 3 measurement carry (≥ 1 Modern PoC 후 정합 expectation 90~95%).

### 6.2 iBATIS 2 전용 dynamic 태그

`<dynamic>` / `<iterate>` / `<isPropertyAvailable>` / `<isNotEmpty>` / `<isEqual>` / `<isGreaterThan>` 등 iBATIS 2 전용 sub-classification — `dynamic_branch.items.tag_type` enum (iBATIS 2 16종 + MyBatis 3 8종 + sql:case_when + other).

---

## 7. cross-link

```yaml
cross_links:
  - {
      to_artifact: characterization,
      link_type: aligns_with_intent_classification,
    } # phase 4.7 양방향
  - { to_artifact: discovery-spec, link_type: provides_uc_to_sql_mapping } # chain 1 입력 핵심
  - { to_artifact: rules, link_type: groups_br_by_sql_id } # BR ↔ sql_id
  - { to_artifact: antipatterns, link_type: signals_ap } # AP-X-011/012 (shared_sql_fragments=0 신호) 등
  - { to_artifact: domain, link_type: cross_table_dependency } # dependent_tables ↔ aggregate
  - { to_artifact: api, link_type: endpoint_to_sql_id } # phase 5-1 OpenAPI ↔ sql_id
  - { to_artifact: formal-spec, link_type: dynamic_branch_to_decision_table } # phase 4.5 decision-table 정합
```

---

## 8. 신뢰도

| 단계 | 조건                                                                                                                           | 신뢰도 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 1    | mapper XML grep 만                                                                                                             | 50~65% |
| 3    | + DAO/Controller trace + characterization cross-link                                                                           | 70~85% |
| 5    | + 도메인 expert 결단 (ambiguous = 0 또는 carry 명시) + DBA-read carry 명시 + paradigm-cross corroboration (Modern ORM)         | 85~95% |

### 8.1 carry_flags 정책 (핵심)

- `external_call_out_of_scope` 또는 `DBA-read` 시 → confidence ≤ 0.80 자동 검증 의무
- `proc-body` (SP 본문 read 부재) 시 → DBA carry note 본문 grep 의무
- `domain-expert-review` 시 → characterization-spec.json `ambiguous_carry` 와 양방향 link 의무

---

## 9. 검증 체크리스트

```
□ schema 검증 통과 (Ajv 8 strict)
□ inventory[].sql_id + mapper_xml + business_meaning + dependent_tables 의무
□ inventory[].statement_type ∈ [PREPARED, CALLABLE, STATEMENT] (default PREPARED)
□ inventory[].intent_vs_bug_classification 본문에 (intent / bug / ambiguous / self_recognized) 4 분류 키워드 ≥ 1
□ inventory[].confidence ∈ [0.0, 1.0]
□ inventory[].carry_flags ⊂ enum
□ extraction_automation.auto_ratio_external_6 형식 검증 (`^\d+/6 = \d+\.\d+%` 정규)
□ external_call_out_of_scope 또는 DBA-read 시 confidence ≤ 0.80
□ phase_4_7_corroboration_role 명시 (corroboration #1/#2/#3 또는 N/A)
□ no-simulation 의무 — domain_expert_interview = "scheduled | completed | carry" 명시
```

---

## 10. 산출물 간 참조

| 방향                                    | 의미                                                   |
| --------------------------------------- | ------------------------------------------------------ |
| SQL-Inventory → Characterization        | aligns_with_intent_classification (양방향)             |
| SQL-Inventory → Planning-spec           | provides_uc_to_sql_mapping (chain 1 입력 핵심)         |
| SQL-Inventory → Rules                   | groups_br_by_sql_id                                    |
| SQL-Inventory → Antipatterns            | signals_ap (예: shared_sql_fragments=0 → AP-X-011/012) |
| SQL-Inventory → Domain                  | cross_table_dependency (dependent_tables ↔ aggregate)  |
| SQL-Inventory → API (phase 5-1)         | endpoint_to_sql_id                                     |
| SQL-Inventory → Formal-spec (phase 4.5) | dynamic_branch_to_decision_table                       |

---

## 11. 흔한 함정

### 11.1 RDB 부재 환경 (NoSQL / Prisma 단독)

- 증상: mapper XML + DAO 부재 → SQL Inventory ❌
- 대응: phase 4.8 skip 처리 / `_manifest.yml` 의 `rdb_only: false` 시 자동 skip / 수동 명시 의무

### 11.2 Modern ORM (JPA / TypeORM / Prisma) raw SQL 측정 표준 부재

- 증상: `@NativeQuery` / `query()` / `$queryRaw` 호출 grep 가능하나 mapper_xml 컬럼 'jpa'/'inline' 매핑 모호
- 대응: Modern ORM PoC carry 종결 후 schema sub-rule 정식화

### 11.3 called_from_screen 자동화 0%

- 증상: JSP recursive trace / Controller @RequestMapping → service → DAO 다단 호출
- 대응: 매뉴얼 매핑 의무 / 시간 cap 정합 / scope_decision: carry 명시

### 11.4 business_meaning LLM ~70% 정확도

- 증상: 자연어 요약이 도메인 의도와 차이
- 대응: 도메인 expert 검증 carry 의무 / `domain-expert-review` carry_flag 명시

### 11.5 external_call_out_of_scope 누락

- 증상: DB function / SP 호출이 inventory record 에서 누락 → 새 시스템 재구현 시 외부 의존 손실
- 대응: FN*\* / S*_ / SP\__ 등 prefix grep 의무 / `external_call_out_of_scope` carry_flag

### 11.6 시간 cap (대규모 모듈)

- 증상: 대규모 모듈에서 전체 SQL 중 핵심만 cover / 잔여 = scope_decision: carry
- 대응: coverage_ratio 자연어 명시 (예: "15/71 = 21.1%") / scope_decision: carry / patterns_extension_v2 aggregate_metrics + raw-grep.txt 참조

### 11.7 patterns_extension_v2 schema 정식 의무 ❌

- 증상: 외부 사용자가 nested patterns object 를 의무 schema 로 오인
- 대응: optional 명시 / Legacy iBATIS 한정 / patterns_extension_v3 carry note

---

## 12. PoC corroboration 자격

≥ 2 PoC corroboration 의무. scale-cross isomorphic (외부 6 컬럼 자동화 = scale 무관) + paradigm-cross = Modern ORM corroboration carry (≥ 1 Modern PoC 후).

---

## 13. carry

| ID                              | 항목                                                                                                                     | trigger                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| C-modern-nosql-prisma           | Modern 환경 NoSQL/Prisma 정합 검증                                                                                       | ≥ 1 Modern PoC 후                                    |
| C-sub-rule-multi-responsibility | sub-rule 다중책임 spectrum (AP-CAPITAL-005~011)                                                                          | ≥ 2 다중책임 PoC 후                                  |
| C-gartner-time-application-level | Gartner TIME application portfolio 별도 deliverable 후보 (`methodology-spec/deliverables/application-portfolio-time.md`) | 분리 axis carry                                      |

---

## 인용

- ADR: ADR-CHAIN-007 (sql-inventory phase 도입)
- ADR: ADR-CHAIN-008 (paradigm-cross 정책 완화)
- ADR: ADR-CHAIN-009 (Gartner TIME SQL 단위 보류 / migration_priority 대체)
- ADR: ADR-CHAIN-010 (patterns_extension_v3 + iBATIS 2 sub-rule)
- ADR: ADR-009 §2.4 (신뢰도 단계 정합)
- migration_priority 12번째 컬럼 근거: DEC-2026-05-12 (ADR-CHAIN-009)
- schema: `schemas/sql-inventory.schema.json`
- sub-rule: `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md`
- 외부 권위: Michael Feathers, _Working Effectively with Legacy Code_ (2004); Wikipedia _Characterization test_; Gartner TIME framework; AWS Migration Acceleration Program (MAP)

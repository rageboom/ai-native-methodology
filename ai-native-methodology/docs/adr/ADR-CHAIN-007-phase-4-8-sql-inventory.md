# ADR-CHAIN-007: phase 4.8 (sql-inventory) 정식 도입 — SQL 단위 11 컬럼 인벤토리 + RDB 한정 sub-phase

- 상태: 승인됨 (Accepted) — v2.2.0-rc1 prerelease ( Senior STOP signal 흡수 / 7d minimum cooling-off → v2.2.0 final 별도 결단 / Modern ORM PoC #08 corroboration 의무)
- 일자: 2026-05-08
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-001 (사상적 기반), ADR-008 (이중 렌더링), ADR-009 (다이어그램 신뢰), ADR-CHAIN-006 (phase 4.7 cross-link), DEC-2026-05-08-poc-06-sql-inventory-retrofit (corroboration #1), DEC-2026-05-08-poc-07-종결 (corroboration #2), `~/.claude/plans/plan-v220-sql-inventory-promotion.md` + `research-v220-sql-inventory-promotion.md` (외부 권위 19종)

---

## 컨텍스트

v2.1.0 phase 4.7 (characterization) 본체 격상 후, phase 4.7 의 `intent_classification` 만으로는 SQL 단위 추적 ❌. iBATIS 2 / MyBatis / Spring JDBC / JPA Repository 모두 정합인 SQL 인벤토리 자산 부재. 새 시스템 재구현 시 sql_id ↔ UC ↔ intent 분류 cross-link 의무.

PoC #06 retrofit + PoC #07 정식 적용에서 confirmed:

- exchange.xml 6 SQL + capital.xml 71 SQL 모두 외부 6 컬럼 자동화 4/6 = 66.7% ( scale 무관 isomorphic)
- Stored Procedure (S*\*/SP*_/FN\__) 호출 식별 의무 — `statement_type` 컬럼 부재 시 누락 위험
- DBA 부재 환경에서 SP 본문 read 차단 — `carry_flags: DBA-read / proc-body / external_call_out_of_scope` 명시 의무
- iBATIS 2 (2010 EOL) `<dynamic>` / `<iterate>` / `<isPropertyAvailable>` 전용 태그 → MyBatis 3 dynamic 태그와 sub-classification carry

---

## paradigm-cross 우려 ( Senior STOP signal 흡수)

PoC #06 + PoC #07 모두 Spring 4.1 + iBATIS 2 = 동일 paradigm 변종 (단일/다중책임 차이만). §8.1 strict 정신 = paradigm-cross corroboration (Modern ORM 또는 다른 Legacy stack) 의무. 본 ADR = **scale-cross 입증만 (PoC #06+#07)** + paradigm-cross = Modern ORM PoC #08 carry (C-v2.2.0-6) → v2.2.0 final 격상 trigger 의무.

→ 본 ADR 채택 = v2.2.0-rc1 prerelease ( 7d minimum) / v2.2.0 final = Modern ORM PoC #08 종결 후 별도 결단.

---

## 외부 조언 (research-v220 §7 권위 19종)

### 사상적 기반

- **Michael Feathers**, _Working Effectively with Legacy Code_ (2004) — "production = its own specification" / characterization test
- **Wikipedia** _Characterization test_ — actual behavior > 의도된 behavior
- **Gartner** _TIME framework_ (Tolerate / Invest / Migrate / Eliminate) — Functional fit + Technical fit 2축
- **AWS** _Migration Acceleration Program_ (MAP) — Assess / Mobilize / Migrate / Modernize 4 phase
- **LeanIX** Application Modernization Assessment — Gartner TIME 적용

### 도구 정합 (MyBatis / iBATIS / SQL)

- **MyBatis 3** Mapper XML Files (https://mybatis.org/mybatis-3/sqlmap-xml.html) — 14 표준 속성 (id / parameterType / resultType / resultMap / flushCache / useCache / **statementType** / fetchSize / databaseId 등)
- **MyBatis 3** Dynamic SQL (https://mybatis.org/mybatis-3/dynamic-sql.html) — if / choose / trim / foreach / bind / script
- **iBATIS 2** SqlMaps Developer Guide (https://ibatis.apache.org/docs/java/pdf/iBATIS-SqlMaps-2_en.pdf) — `<dynamic>` + isXxx 태그군
- **sonar-mybatis** (donhui) — namespace+stmt_id + dynamic SQL `<if>` Risk SQL detection / 7 rules
- **SchemaSpy 6.0** — 테이블/컬럼/제약/인덱스 + orphan/anomaly + CSV/Excel export
- **ibatis2mybatis** (mybatis 공식) — XSLT 변환 도구
- **MyBatis Migrations** — changelog 3 컬럼 표준
- **Spring Data JPA** @NativeQuery — raw SQL anchor annotation
- **TheServerSide** — Native SQL in JPA/Hibernate best practice

### Big-tech 사례

- **Shopify Engineering** — Under Deconstruction (modular monolith)
- **Uber Engineering** — MySQL to MyRocks
- **AWS** — Netflix Aurora 75% perf 통합
- **Render Blog** — Claude Code legacy refactor 1위 (2025)

### Opus 4.7 외부 조언 (사용자 turn 시 별도 CLI / 본 방법론 origin)

- SQL 인벤토리 6 컬럼 (sql_id / mapper_xml / called_from_screen / business_meaning / dynamic_branch / dependent_tables)
- iBatis XML = 1차 산출물
- 4-Layer + 4 iBatis 패턴 (patterns_extension_v2)

---

## 결정

phase 4.8 (sql-inventory) 정식 단계를 v2.2.0-rc1 prerelease 로 본체 격상. 다음 5 정책 명문화:

### 1. 위치 = analysis stage 내부 / phase 4.7 후 / phase 5-1 + 5-2 전 / RDB 한정 sub-phase

```
analysis stage (chain 1 입력)
├── phase 0 (input)
├── phase 1 (init/inventory)
├── phase 2 (db)
├── phase 3 (arch)
├── phase 4 (business logic)
├── phase 4.5 (formal-spec / v1.2.0)
├── phase 4.7 (characterization / v2.1.0)
├──  phase 4.8 (  sql-inventory / v2.2.0-rc1 신설 /  RDB 한정)
├── phase 5-1 (api)
├── phase 5-2 (ui)
└── phase 6 (quality)
```

NoSQL / Prisma 단독 환경 시 phase 4.8 skip — `_manifest.yml` 의 `rdb_only: false` / flow JSON `rdb_only: true` 표시.

### 2. 11 컬럼 = 외부 6 + statement_type + 본 추가 4

Agent 1 (research-v220 §4) 강 권고 흡수 — `statement_type` 11번째 컬럼 (PREPARED / CALLABLE / STATEMENT) 의무. SP 호출 식별 = MyBatis 14 표준 속성 / 새 시스템 재구현 시 SP 의존 손실 회피.

| 컬럼                                                           | 출처                              | 의무?                                                   |
| -------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------- |
| sql_id, mapper_xml, business_meaning, dependent_tables         | Opus 4.7 외부 6                   | ✅ required                                             |
| **statement_type**                                             | Agent 1 강 권고 / MyBatis 14 표준 | ✅ enum (default PREPARED)                              |
| called_from_screen, dynamic_branch                             | Opus 4.7 외부 6                   | optional                                                |
| uc_link, intent_vs_bug_classification, confidence, carry_flags | 본 방법론 추가 4                  | ✅ required (intent_vs_bug_classification + confidence) |

### 3. extraction_automation metric 의무 + threshold ≥ 0.50

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
  auto_ratio_external_6: '4/6 = 66.7%' #  형식 검증 의무
```

`sql-inventory-extractor` 가 `^\d+/6 = \d+(\.\d+)?%` 정규 검증 + threshold ≥ 0.50 (default).

### 4. if/then 의무 — external_call_out_of_scope 또는 DBA-read carry 시 confidence ≤ 0.80

`carry_flags` 가 `external_call_out_of_scope` 또는 `DBA-read` 포함 시 → `confidence ≤ 0.80` 자동 검증. 새 시스템 재구현 시 외부 의존 식별 강제.

### 5. patterns_extension_v2 = optional / Legacy iBATIS 한정

PoC #07 D12 (b) nested patterns object 패턴. 4 패턴 (dynamic_branch / calculation_formula / result_mapping / shared_sql_fragments). patterns_extension_v3 (cache / discriminator / typeHandler) = C-v2.2.0-3 carry / 본 ADR scope ❌.

---

## ≥ 2 PoC scale-cross corroboration ( paradigm-cross carry)

| PoC                                                   | spectrum                     | scale  | 외부 6 컬럼 자동화                   |
| ----------------------------------------------------- | ---------------------------- | ------ | ------------------------------------ |
| **PoC #06 retrofit** (Spring 4.1 + iBATIS 2 단일책임) | Legacy 적대성 4중            | 6 SQL  | 4/6 = 66.7%                          |
| **PoC #07** (Spring 4.1 + iBATIS 2 다중책임)          | Legacy 적대성 4중 / 다중책임 | 71 SQL | 4/6 = 66.7% ( scale 무관 isomorphic) |

→ scale-cross 입증 / ** paradigm-cross = Modern ORM PoC #08 carry C-v2.2.0-6** ( Senior STOP signal 흡수 / v2.2.0 final 격상 trigger).

---

## 결과

본체 격상 자산 7 + workflow:

1. ✅ `methodology-spec/deliverables/24-sql-inventory.md` ( #23 사용 / #24 신규)
2. ✅ `schemas/sql-inventory.schema.json` ( 31번째 schema)
3. ✅ `schemas/meta-confidence.schema.json` `inputs_used` enum 13 → 14 (`sql_inventory` 추가)
4. ✅ `skills/analysis-sql-inventory/SKILL.md` ( skills 20 → 21)
5. ✅ `tools/sql-inventory-extractor/` ( workspace 14번째 / 10 unit test)
6. ✅ `flows/analysis.phase-flow.{json,mermaid}` v2.1.0 → v2.2.0-rc1 (phase 4.8 entry + 5-1 depends_on 갱신)
7. ✅ `methodology-spec/workflow/sql-inventory.md` (drift-validator 3-way 회귀 통과)
8. ✅ ADR-CHAIN-007 (본 문서 / 5 정책 명문화)

   chain harness 5 요소 변경 ❌ — analysis stage 내부 phase 추가만.

workspace test 회귀: 232 → 233 ( +1 / sql-inventory-extractor 10 신설 - 기존 일부 차이).

Senior STOP signal 흡수: v2.2.0-rc1 prerelease 7d minimum cooling-off / Modern ORM PoC #08 (MyBatis 3 annotation 또는 JPA QueryDSL 또는 TypeORM raw SQL spectrum) 종결 후 v2.2.0 final 격상 별도 결단.

---

## 미해결 ( v2.2.0 final / v2.x carry)

| ID             | 항목                                                                         | trigger                                                                              |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **C-v2.2.0-6** | ** Modern ORM PoC #08 (paradigm-cross corroboration)**                       | v2.2.0 final 격상 trigger                                                            |
| C-v2.2.0-1     | Modern 환경 NoSQL/Prisma 정합 검증                                           | ≥ 1 Modern PoC 후                                                                    |
| C-v2.2.0-2     | sql-inventory baseline ratchet (characterization-coverage-validator mirror)  | v2.2.x patch / 사용 시                                                               |
| C-v2.2.0-3     | patterns_extension_v3 (cache / discriminator / typeHandler)                  | ≥ 2 Legacy PoC 후                                                                    |
| C-v2.2.0-4     | sub-rule Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 본체 sub-rule 격상 | 별도 plan                                                                            |
| C-v2.2.0-5     | sub-rule 다중책임 spectrum (AP-CAPITAL-005~011)                              | ≥ 2 다중책임 PoC 후                                                                  |
| C-v2.2.0-7     | iBATIS 2 전용 dynamic 태그 sub-classification enum                           | v2.2.x patch                                                                         |
| C-v2.2.0-8     | Gartner TIME 2축 매핑 (`time_classification` 12번째 컬럼)                    | v2.3+                                                                                |
| ~~C-v2.2.0-9~~ | ~~"Why not AWS SCT" 차별화 절 deliverable §1 motivation 보강~~               | ✅ **resolved** (rc1 시점 deliverable §1.2 4 도구 비교 표 + Big-tech 입증 흡수 완료) |

---

## 변경 요약 (commit cadence)

- C1 (`f64e0b2`) — deliverable 24 + schema 31번째 + meta-confidence enum
- C2 (`4d87416`) — skill sql-inventory
- C3 — tool sql-inventory-extractor + 10 unit test + workspace 14번째
- C4 — flow + ADR-CHAIN-007 + workflow ( 본 commit)
- C5 — drift-validator 회귀 + version bump v2.1.1 → v2.2.0-rc1 + build dist + CHANGELOG
- C6 — DEC-2026-05-08-v2.2.0-rc1-prerelease + STATUS / INDEX
- C7 — git tag v2.2.0-rc1 (prerelease)

각 commit 자체 통과 (drift-validator + unit test 회귀) — broken state ❌.

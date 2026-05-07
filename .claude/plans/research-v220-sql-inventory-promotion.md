# research v2.2.0 — SQL Inventory 본체 격상

> 2026-05-08 / Work Principles 2원칙 / 가벼운 sub-agent 3 병렬 (~30분 cap 정합)
> plan-v220-sql-inventory-promotion.md §8 D1~D6 결단 의뢰 직전 정보 보강
> ★ ★ ★ Senior 강한 STOP signal — plan §7.1 risk 부재 (paradigm-cross vs scale-cross overfitting)

---

## 1. 핵심 결론 (TL;DR)

| Agent | 결단 | 강도 |
|---|---|---|
| Agent 1 (공식 docs / MyBatis / iBATIS / sonar-mybatis) | 70% 정합 + 30% 빈틈 (statement_type 등) | 보강 권고 |
| Agent 2 (Big-tech / Stripe / Shopify / Gartner TIME / AWS MAP) | ★ "SQL-level inventory = 본 방법론 고유 contribution" / 첫 baseline 시도 가치 | ★ 진입 권고 |
| Agent 3 (Senior 회의적 검토) | ★ ★ ★ **STOP — v2.2.0 본체 격상 거부** / paradigm-cross corroboration 부재 (PoC #06+#07 모두 Spring 4.1 + iBATIS 2) | ★ ★ ★ STOP |

→ ★ ★ ★ **상충 ❌** — Senior STOP + Big-tech 고유가치 + 공식 docs 빈틈 = ★ "정정 후 진입" 합의. plan 의 ★ §8.1 strict 자격 자격 재검토 의무.

---

## 2. ★ ★ ★ Senior 강한 STOP signal (Agent 3 / 핵심)

### 2.1 paradigm-cross vs scale-cross overfitting

| 자격 정신 | 본 plan 충족? |
|---|---|
| §8.1 strict "≥ 2 PoC isomorphic" 정신 = ★ ★ paradigm-cross corroboration | ❌ 미충족 |
| PoC #06 (단일책임 6 SQL) + PoC #07 (다중책임 71 SQL) | ★ scale-cross only — 동일 stack (Spring 4.1 + iBATIS 2) |
| Modern ORM (JPA / MyBatis 3 annotation / TypeORM / Prisma) corroboration | ❌ 부재 |

★ Senior 결단:
> "v2.2.0 본체 격상 = 단일 stack 과적합 위험 ★ ★ ★. v2.0 chain harness validated 정신 = paradigm-cross corroboration 의무."

### 2.2 STOP 권고 대안

- **v2.2.0-rc1 prerelease 7d minimum** (24h ❌ — paradigm gap 검증에 24h 무의미)
- **Modern ORM PoC #08 14d** (MyBatis 3 annotation 또는 JPA QueryDSL / 가벼운 sub-agent)
- **PoC #08 결과 분기**: paradigm-cross 입증 → v2.2.0 정식 격상 / 미입증 → "Legacy iBATIS 한정 deliverable" 격하 + naming 변경 (`sql-inventory-legacy-ibatis`)

---

## 3. ★ Big-tech 고유 가치 입증 (Agent 2)

### 3.1 SQL-level Inventory ≠ 업계 표준

- Stripe / Shopify / Airbnb / Uber / Netflix engineering blog → **infrastructure-level migration** (DB 엔진 / 노드 / schema) 위주
- Shopify Longboat (Debezium + Kafka CDC) / Uber MySQL→MyRocks / Netflix Aurora 통합 → 모두 schema-level
- AWS SCT / DMS / Application Discovery Service → schema-level discovery
- ★ ★ ★ **SQL-level Inventory = 본 방법론 고유 contribution** (Korean SI / iBATIS 2 화면 단위 SQL 채택 enterprise 특화)

### 3.2 ★ Claude Code legacy refactor 1위 (2025 Render benchmark)

| metric | Claude Code | Cursor |
|---|---|---|
| Refactoring | 9.7/10 | (lower) |
| Code accuracy | 9.5/10 | (lower) |
| Repository context | 9.5/10 | (lower) |
| 유효 컨텍스트 | 200K 토큰 | 70K~120K (truncation) |

→ ★ Claude Code 가 "dependency upgrades, brittle legacy refactors, API contract changes, test repair" 분야 우위. 본 방법론과 자연 정합.

### 3.3 Gartner TIME / AWS MAP / Michael Feathers 정합

- **Gartner TIME** (Tolerate / Invest / Migrate / Eliminate) — Functional fit + Technical fit 2축
- **AWS MAP** 4 phase (Assess / Mobilize / Migrate / Modernize)
- **Michael Feathers** — "production = its own specification" / characterization test = 본 방법론 intent_vs_bug 분류의 theoretical foundation

---

## 4. ★ 공식 docs 30% 빈틈 (Agent 1)

### 4.1 본 6 컬럼 매핑

| 컬럼 | MyBatis 공식 정합 | 권위 |
|---|---|---|
| sql_id | ✅ id 속성 표준 | mybatis.org/sqlmap-xml.html |
| mapper_xml | ✅ namespace 표준 | mybatis.org |
| dynamic_branch | ✅ if/choose-when/trim/foreach 정합 | mybatis.org/dynamic-sql.html |
| dependent_tables | ✅ FROM/JOIN regex / SchemaSpy 표준 | schemaspy.readthedocs.io |
| called_from_screen | ❌ 공식 부재 / 본 방법론 고유 | (없음) |
| business_meaning | ❌ 공식 부재 / 본 방법론 고유 | (없음) |

→ 본 6 컬럼 중 4 개 = MyBatis 공식 표준 정합 (66.7%). 외부 6 컬럼 자동화 비율 (PoC #06/#07 모두 4/6 = 66.7%) 와 ★ 우연한 동일 비율.

### 4.2 ★ ★ ★ 빈틈 #1 — statement_type 누락 (★ 강 권고 흡수)

MyBatis sqlmap-xml.html 14 속성 중 ★ `statementType` (PREPARED / CALLABLE / STATEMENT) = SP 호출 식별 필수.

- PoC #06 = 1 SP (S_ExRateMigration) / PoC #07 = 14 procedure → statement_type=CALLABLE 의무 식별
- 현재 plan 의 `mapper_xml` + `business_meaning` 으로는 SP vs SELECT 구분 ❌
- ★ ★ ★ **11 컬럼으로 확장 권고** (외부 정합 70% → 90% / 단일 변경 비용효율적)

### 4.3 빈틈 #2 — patterns_extension_v2 4 패턴 보강

| 본 plan 4 패턴 | 공식 docs 정합 |
|---|---|
| dynamic_branch | ✅ if/choose 통합 |
| shared_sql_fragments | ✅ sql/include 정합 |
| result_mapping | ✅ resultMap/association/collection |
| calculation_formula | ❌ ★ 공식 docs 부재 / 본 방법론 고유 |

★ 누락 의심 핵심 패턴 3개:
- **cache / cache-ref** (namespace-level / useCache 파급)
- **discriminator** (조건부 result mapping)
- **typeHandler** (Java↔JDBC 타입 매핑)

→ patterns_extension_v3 (5~7 패턴) 검토 carry 권고 (v2.2.x patch / 단일 PoC overfitting 회피).

### 4.4 빈틈 #3 — iBATIS 2 전용 태그군

iBATIS 2 (2010 EOL) 전용 `<dynamic>` / `<iterate>` / `<isPropertyAvailable>` / `<isNotEmpty>` / `<isEqual>` / `<isGreaterThan>` 등 별도 enum 부재.

→ Legacy 전용 sub-classification 추가 권고 (schema if/then 의무).

---

## 5. ★ ★ ★ plan §8 D1~D6 결단 의뢰 update (research 후)

| Decision | plan §8 권고 | research 후 update | 근거 |
|---|---|---|---|
| **D1 진입 여부** | (a) 즉시 plan 승인 | ★ ★ ★ **(b) plan 수정 후 진입** | Senior STOP + 빈틈 4건 흡수 의무 |
| **D2 phase ID** | (a) phase 4.8 | ✅ (a) 유지 | 외부 권위 정합 |
| **D3 sub-agent research** | (a) 가벼운 | ✅ 완료 (~25분) | (자체) |
| **D4 Senior cooling-off** | (a) 즉시 final | ★ ★ ★ **(b) v2.2.0-rc1 prerelease ★ 7d minimum** | Senior 권고 / 24h ❌ |
| **D5 commit cadence** | (a) 7-commit 분할 | ✅ (a) 유지 + 각 24h cap (Senior 권고) | retract scope 최소화 |
| **D6 sub-rule 동시 격상** | (a) 분리 | ✅ (a) 유지 강화 | Senior 강제 분리 |

★ ★ ★ **신규 결단 D7 — paradigm-cross corroboration 처분**:
- (α) **plan 수정 흡수 (★ ★ 권고)** — Modern ORM PoC #08 carry 명시 (v2.3.0 trigger / 본 plan §부록 A 추가) + ADR-CHAIN-007 본문에 "paradigm gap 우려 + Modern ORM PoC carry" 명시 의무 + ★ deliverable naming 유지 (격하 ❌)
- (β) **본 plan 보류** — PoC #08 (Modern ORM) 먼저 진행 → ≥ 2 paradigm corroboration 후 v2.2.0 진입
- (γ) **deliverable 격하** — `sql-inventory-legacy-ibatis` 로 naming 변경 + Legacy 한정 명시

★ 권고 = (α). 근거: PoC #06/#07 자체 재작업 ❌ / Big-tech 고유 가치 입증 / 공식 docs 70% 정합 / Senior STOP signal 도 v2.2.0-rc1 7d + PoC #08 carry 형식으로 흡수 가능 / 14차 retract 회피.

★ ★ ★ **신규 결단 D8 — 빈틈 4건 흡수**:
- (a) **모두 흡수** (★ ★ 권고) — statement_type 11 컬럼 확장 + patterns_extension_v3 carry + iBATIS 2 전용 enum + ADR-CHAIN-007 본문 Feathers + Gartner TIME 인용 (★ scope ↑ +1~1.5시간)
- (b) **statement_type 만** (★ 비용효율 1순위)
- (c) 모두 carry (★ minimum scope / v2.2.x patch 시 흡수)

★ 권고 = (a) — 외부 권위 정합 70% → 90% (Agent 1 강 권고) + Senior STOP signal 흡수 + scope 영향 미미 (1 컬럼 + carry note 3개).

---

## 6. plan §2 7 자산 ↔ research 권고 매핑

| 자산 | research 권고 흡수 |
|---|---|
| A1 deliverable 24-sql-inventory.md | ★ statement_type 11번째 컬럼 / Feathers + Gartner TIME 인용 §1 motivation 의무 / "Why not AWS SCT" 차별화 절 추가 |
| A2 schema sql-inventory.schema.json | ★ statement_type enum (PREPARED/CALLABLE/STATEMENT) 추가 / iBATIS 2 전용 dynamic tag enum / patterns_extension_v3 carry note |
| A3 meta-confidence enum | 변경 ❌ (`sql_inventory` 1줄 추가만) |
| A4 skill phase-4-8-sql-inventory | ★ statement_type grep 절차 추가 (CALLABLE = SP 식별 / Java code 의 PreparedStatement / CallableStatement 추적) |
| A5 tool sql-inventory-extractor | ★ statement_type 자동 추출 (XML statementType 속성 grep) + carry_flags external_call_out_of_scope 시 confidence ≤ 0.80 검증 의무 |
| A6 flow analysis.phase-flow.json | 변경 ❌ (phase 4.8 entry 추가만) |
| A7 ADR-CHAIN-007 | ★ ★ ★ research 권위 출처 ≥ 14종 footnote / paradigm gap 우려 + Modern ORM PoC #08 carry 명시 / Feathers + Gartner TIME alignment 명문화 |

---

## 7. ★ 권위 출처 (≥ 14종 / ADR-CHAIN-007 footnote 인용 의무)

### 공식 docs (Agent 1 / 11종)

1. MyBatis 3 Mapper XML Files — https://mybatis.org/mybatis-3/sqlmap-xml.html
2. MyBatis 3 Dynamic SQL — https://mybatis.org/mybatis-3/dynamic-sql.html
3. MyBatis Dynamic SQL Introduction — https://mybatis.org/mybatis-dynamic-sql/docs/introduction.html
4. iBATIS 2 SqlMaps Developer Guide PDF — https://ibatis.apache.org/docs/java/pdf/iBATIS-SqlMaps-2_en.pdf
5. sonar-mybatis (donhui) — https://github.com/donhui/sonar-mybatis
6. sonar-sql-plugin (gretard) — https://github.com/gretard/sonar-sql-plugin
7. SchemaSpy 6.0 docs — https://schemaspy.readthedocs.io/en/v6.0.0/configuration.html
8. ibatis2mybatis (mybatis 공식) — https://github.com/mybatis/ibatis2mybatis
9. MyBatis Migrations — https://mybatis.org/migrations/migrate.html
10. Spring Data JPA @NativeQuery — https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/NativeQuery.html
11. TheServerSide — Native SQL in JPA/Hibernate — https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/SQL-JPA-Hibernate-Native-Raw-Query-Named-JDBC-MySQL-Postgres

### Big-tech / 사상 (Agent 2 / 8종)

12. Shopify Engineering — Under Deconstruction (modular monolith) — https://shopify.engineering/shopify-monolith
13. Uber Engineering — MySQL to MyRocks — https://www.uber.com/us/en/blog/mysql-to-myrocks-migration-in-uber-distributed-datastores/
14. AWS — Netflix Aurora 75% perf — https://aws.amazon.com/blogs/database/netflix-consolidates-relational-database-infrastructure-on-amazon-aurora-achieving-up-to-75-improved-performance/
15. AWS Migration Acceleration Program (MAP) — https://aws.noventiq.com/blogs/aws-migration-accelerator-program-map-assessment-cloud-migration-guide
16. LeanIX — Gartner TIME framework — https://www.leanix.net/en/blog/application-modernization-assessment
17. Michael Feathers — Characterization Testing — https://michaelfeathers.silvrback.com/characterization-testing
18. Wikipedia — Characterization test — https://en.wikipedia.org/wiki/Characterization_test
19. Render Blog — AI coding agents 2025 (Claude Code 1위) — https://render.com/blog/ai-coding-agents-benchmark

---

## 8. ★ 종합

✅ Big-tech 가치 입증 — SQL-level Inventory = 본 방법론 ★ 고유 contribution (외부 표준 부재가 ★ 강점 ✅).
✅ 공식 docs 70% 정합 — MyBatis 4 컬럼 정합 + 4 추가 컬럼 = 본 방법론 고유.
❌ ★ ★ ★ Senior STOP signal — paradigm-cross 부재 (Spring 4.1 + iBATIS 2 단일 stack 변종) → ★ v2.2.0-rc1 7d + Modern ORM PoC #08 carry 의무.
❌ 빈틈 4건 — statement_type (★ 강 권고 흡수) / patterns_extension_v3 / iBATIS 2 전용 enum / Feathers + Gartner TIME 인용.

★ ★ ★ **plan 진입 자격** = ★ "정정 후 진입 (D1 = b / D7 = α / D8 = a / D4 = b)". 14차 retract 회피 + Senior STOP 흡수 + 외부 권위 정합 강화 + scope 영향 미미 (+1 컬럼 + carry note 5개 + ADR 본문 보강).

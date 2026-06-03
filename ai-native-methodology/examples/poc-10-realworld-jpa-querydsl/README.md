# PoC #10 — JPA QueryDSL ( v2.3.0 minor trigger / DSL builder paradigm 보강)

> 2026-05-08 / DEC-2026-05-08-poc-10-prelim-신설
> v2.3.0 minor trigger / DSL builder paradigm corroboration / Java + Spring Boot + JPA + QueryDSL

## scope

v2.2.0-rc1 carry C-v2.2.0-6c resolve trigger. PoC #06+#07+#08+#09 (XML 또는 raw SQL) → DSL builder paradigm 진입. ** v2.3.0 minor trigger** ( paradigm-cross MEDIUM / DSL builder 추가 보강).

## paradigm 거리 (vs PoC #06+#07+#08+#09)

| dimension              | iBATIS2/MyBatis3 (XML) | TypeORM raw SQL (TS) | **JPA QueryDSL (Java DSL)**               | 거리        |
| ---------------------- | ---------------------- | -------------------- | ----------------------------------------- | ----------- |
| 양식                   | XML                    | TS string            | **type-safe Java DSL builder**            | medium      |
| dynamic SQL            | XML tags               | TS 조건문            | **`BooleanBuilder` + `where()` chaining** |             |
| compile-time           | ❌ runtime             | ❌ runtime           | **✅ compile-time type check**            |             |
| `mapper_xml` 컬럼 매핑 | XML file path          | "inline"             | **"querydsl" / "jpa" repository class**   | schema 정합 |
| Result mapping         | resultType             | TS interface         | **Q-class generated ( build-time)**       |             |

→ **MEDIUM corroboration 자격** — DSL builder + compile-time type check paradigm 추가.

## 4축 metric expectation

| 축               | PoC #08 (Java/MyBatis3) | PoC #09 (TS/TypeORM raw) | **PoC #10 (Java/JPA QueryDSL) expectation**       |
| ---------------- | ----------------------- | ------------------------ | ------------------------------------------------- |
| §3-A 자동화율    | 66.7%                   | 55~65%                   | **60~70%** ( Java + DSL = grep 정확도 ↑)          |
| §3-B chain 1 UC  | 100%                    | ≥ 90%                    | **≥ 90%**                                         |
| phase 4.7 oracle | 100%                    | ≥ 80%                    | **≥ 80%**                                         |
| SQL Inventory    | 66.7%                   | ≥ 50%                    | ** ≥ 50% ( DSL builder paradigm 자격 자체 도전)** |

trigger 자격 self-test: SQL Inventory ≥ 50% 자격 충족 → DSL builder paradigm = phase 4.8 sql-inventory 본체 자산 적용 가능 입증.

## 14d cap (실측 ~3~4일)

PoC #08 패턴 정합. 별도 session 의무 (4원칙 3원칙).

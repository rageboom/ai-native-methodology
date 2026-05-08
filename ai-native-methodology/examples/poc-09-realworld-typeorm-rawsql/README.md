# PoC #09 — TypeORM raw SQL (★ ★ ★ v2.2.0 final 격상 trigger 핵심)

> 2026-05-08 / DEC-2026-05-08-poc-09-prelim-신설
> ★ ★ ★ paradigm + platform-cross **strong** corroboration / TypeScript + Node.js / Java → TS paradigm shift

## scope

★ ★ v2.2.0-rc1 carry C-v2.2.0-6b resolve trigger. PoC #06+#07 (Spring 4.1 + iBATIS 2 / Java) + PoC #08 (Spring 6 + MyBatis 3 / Java) → ★ TypeScript + Node.js + TypeORM raw SQL paradigm 진입. **★ ★ ★ paradigm-cross strong** = phase 4.8 sql-inventory 본체 격상 trigger 핵심.

## paradigm 거리 (vs PoC #06+#07+#08)

| dimension | iBATIS 2 / MyBatis 3 (Java) | TypeORM raw SQL (TS / Node.js) | 거리 |
|---|---|---|---|
| 언어 | Java | TypeScript | ★★★ paradigm |
| Runtime | JVM | Node.js | ★★★ platform |
| Mapper 양식 | XML / annotation | TypeScript (★ string interpolation 또는 query builder) | ★★★ paradigm |
| `<bind>` OGNL | ✅ | ❌ (TS 자체 expression) | ★★★ |
| `mapper_xml` 컬럼 매핑 | XML file path | "inline" / "typeorm" string | ★★ schema 정합 |
| dynamic SQL | XML tags | TS 조건문 ternary / template literal | ★★★ |
| `statementType` | PREPARED/CALLABLE/STATEMENT | parameterized (★ named or positional) | ★★ |

→ ★ ★ ★ ★ **strong corroboration 자격** — Java→TS / JVM→Node.js / XML→inline TS / paradigm + platform-cross 동시.

## 스코프

- TypeORM realworld OSS source (★ source 결정 carry / 정탐 후 결단)
- analysis 4종 + sql-inventory 11 컬럼 + phase 4.7 + chain 1
- chain 2~4 명시적 제외 (★ §8.1 strict)
- 14d cap (실측 ~3~4일)

## 디렉토리

| dir | content |
|---|---|
| `source/` | TypeORM realworld OSS git clone (★ source 결정 carry) |
| `input/` | analysis 4종 (rules / domain / antipatterns / inventory) |
| `sql-inventory/` | sql-inventory.{json,md} (11 컬럼 / extraction_automation) |
| `characterization/` | snapshots/ + intent-vs-bug.md + coverage.json |

## 4축 metric expectation

| 축 | PoC #06 (Java/iBATIS2/단일) | PoC #07 (Java/iBATIS2/다중) | PoC #08 (Java/MyBatis3/Modern) | **PoC #09 (TS/TypeORM raw SQL) expectation** |
|---|---|---|---|---|
| §3-A 자동화율 | 38.75% | 53.8% | 66.7% | **55~65%** (★ TS regex 정확도 ↓ vs XML / 그러나 Modern stack ↑) |
| §3-B chain 1 UC | (없음) | 94.1% / 0 findings | 100% / 0 findings | **≥ 90%** |
| phase 4.7 oracle | 94% | 100% | 100% | **≥ 80%** |
| ★ SQL Inventory | 4/6 = 66.7% | 4/6 = 66.7% | 4/6 = 66.7% | **★ paradigm-cross strong = ≥ 50% pass** (★ ★ schema isomorphic 자격 핵심) |

★ ★ ★ ★ **v2.2.0 final 격상 trigger 자격 = ★ paradigm-cross strong corroboration 입증** (PoC #08 MEDIUM + PoC #09 strong 합산). 실측 ≥ 50% 자격 충족 시 본체 격상 trigger 활성.

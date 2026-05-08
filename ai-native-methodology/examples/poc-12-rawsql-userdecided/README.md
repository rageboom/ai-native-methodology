# PoC #12 — raw query() user-decided source (★ ★ ★ ★ paradigm-cross strong / sources 사용자 결정 carry)

> 2026-05-08 / DEC-2026-05-08-poc-12-prelim-신설
> ★ ★ ★ ★ paradigm-cross strong corroboration 핵심 / ★ ★ source 결정 = ★ 사용자 위임 의무 (★ ★ realworld OSS 부재 사실)

## scope

★ ★ ★ ★ Auto Mode (A) 결단 — paradigm-cross strong corroboration 의무 → raw `query()` 명시 사용 PoC. but ★ ★ ★ ★ ★ 2 정탐 (PoC #09 직후 + 본 prelim) 모두 pure realworld OSS 부재 사실 확보 → ★ source 결정 = ★ ★ 사용자 위임 의무.

## ★ ★ source 결정 carry (★ ★ ★ 사용자 결단 의무)

| 옵션 | 처분 |
|---|---|
| (i) 사내 raw query() 사용 모듈 (★ ★ EFI-WEB 또는 다른 사내 source) | ★ source 위임 |
| (ii) lujakob/nestjs-realworld fork + ★ raw query() 도입 patch (★ 본 PoC 본질 reframe — synthetic) | ★ source 결정 |
| (iii) Express + node-postgres (`pg.query()`) sample 자체 작성 (★ ★ 14d cap 정합 / quick) | ★ source 결정 |
| (iv) PoC #12 보류 + (B) 정책 완화 회귀 | ★ ★ ★ ★ 정탐 결과 정합 (★ 추천) |

## 14d cap (실측 ~3~4일 / source 도착 후)

★ ★ source 도착 시 PoC #08+#09 패턴 재사용 — analysis 4종 + sql-inventory + phase 4.7 + chain 1.

## 정탐 결과 (★ ★ ★ ★ 2 정탐 통합)

★ ★ ★ ★ ★ **pure raw `query()` realworld OSS = 2026년 부재 사실**:
- Node.js (Express + pg.query / mysql2.connection.query) = 희소 / pure realworld 부재
- Java (Spring JdbcTemplate / jOOQ) = sample / library 만
- Python / Go / Rust = community sample / pure realworld ❌
- ORM 주류화 (TypeORM / JPA / Sequelize / Prisma / SQLAlchemy / GORM) → raw SQL = "emergency escape hatch"

→ ★ ★ ★ ★ **본 PoC 진입 = 사용자 source 결정 의무** + ★ ★ ★ ★ ★ 정탐 결과 자체가 (B) 정책 완화 추천 회귀.

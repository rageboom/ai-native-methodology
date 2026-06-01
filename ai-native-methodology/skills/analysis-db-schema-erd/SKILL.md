---
name: analysis-db-schema-erd
description: Use when project contains DDL .sql files, Prisma schema, JPA @Entity, TypeORM @Entity, SQLAlchemy model, Mongoose schema, or database migration files. Generates schema.json (산출물 5-b) + erd.mermaid (DB structure). Drift-validator auto-checks .json ↔ .mermaid equivalence. Stage = analysis, track = DB.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-db-schema-erd — DB Schema + ERD 산출

데이터베이스 구조 → schema.json + erd.mermaid 이중 렌더링.

## 사전 조건

- inventory.json 존재 (DDL / ORM entity 시그널 위치 / analysis-source-inventory 완료)
- (optional) domain.json 있으면 entity ↔ table 매핑 cross-check 에 활용 — ★ phase-flow 위상순서상 domain(business-logic)은 db-schema 보다 **뒤**이므로 hard 사전조건 ❌. 예외: greenfield/DDL 부재 시 §greenfield mode 의 domain→table 추론(아래).
- DB 트랙 (DDL / ORM entity 시그널 검출)

## 절차

1. **DDL / Migration 수집**:
   - DDL `.sql` (Flyway / Liquibase / Knex / Alembic)
   - Prisma `schema.prisma`
   - JPA `@Entity`
   - TypeORM `@Entity`
   - SQLAlchemy `Base` subclass
   - Mongoose `Schema()`
2. **Table / Column / Constraint 추출**:
   - column type / nullable / default
   - PK / FK / unique / index
   - check constraint / trigger
3. **Relationship 추론** — FK 기반 1:1 / 1:N / N:M
4. **schema.json 작성** — `schemas/db-schema.schema.json` (strict / SSOT):
   ```json
   {
     "meta": {...},
     "database_type": "...",
     "tables": [...],
     "stored_procedures": [...],
     "views": [...],
     "source_files": ["src/main/resources/db/migration/V1__create_tables.sql"]
   }
   ```
   ★ top-level required = `meta` · `tables` (strict). index/constraint/relationship 은 각 `tables[]` item **내부** nested (top-level 아님). 위 키 외 필드 추가 시 schema-validator fail.
   ★ **`source_files`** (선택 / v11.26.0 Slice 4) — 스키마를 **DDL/migration 파일**(Flyway/Liquibase `.sql` 등)에서 추출했으면 그 repo-relative 경로를 나열 → dep-graph 가 db-schema 노드를 그 DDL 에 앵커 + A2 가 DDL 변경 시 drift 탐지 (db-schema = DDL 의 semantic owner / 기존 `code_pointers=N/A` 해소). ERD 다이어그램은 ❌(→ `diagram_files.erd`) / live 운영DB·ORM entity 는 미나열(ORM entity 는 domain.json 이 앵커). DDL 출처 없으면 비움(na 유지).
5. **erd.mermaid 생성** — Mermaid ER diagram syntax
6. **drift-validator 자동 호출** — `.json ↔ .mermaid` 의미 동등성

## 산출물

- `<user-project>/.aimd/output/schema.json`
- `<user-project>/.aimd/output/erd.mermaid`

## ★ greenfield (code-optional) mode

`work-unit-manifest.scenario == "greenfield"` (legacy 코드 없음 / DEC-2026-05-30-use-scenario-taxonomy §2.4 옵션 A) 일 때 — DDL/ORM 스캔 대신 **설계 의도** 에서 산출:
- 입력 = PRD ER 다이어그램 (있으면 직접 매핑) / `domain.json` entity (DDL 부재 시 entity 에서 table 추론).
- ★ **PRD 에 ER/DDL 부재 + domain 만 있을 때 = schema 합성** (entity→table) 은 신규 synthesis → **carry `C-use-scenario-greenfield-schema-synthesis`** (현 Slice 미구현 / 정직 표기). 이 경우 `schema.json` 미산출 또는 stub + finding 등재.
- `source_grounded_evidence` = 입력 출처 인용 (`doc:ER` / `domain:Entity`). `code_pointers` = N/A (`meta.code_pointers_na` 동형) — greenfield 는 DDL 파일 부재 → `source_files` 비움 → na 유지 (legacy 에서 DDL 추출 시는 `source_files` 채워 앵커).
- 무회귀: scenario ≠ greenfield 시 본 절 무시 (legacy DDL/ORM 추출 경로 그대로).
- 진입점 = `analysis-greenfield-bootstrap`.

## 본체 명세

- `methodology-spec/deliverables/4-db-schema.md` (★ dedicated deliverable / db phase SSOT — README.md:22 정합)
- `schemas/db-schema.schema.json`
- ADR-008 (이중 렌더링)
- cross-ref: `methodology-spec/deliverables/4-5-formal-spec.md` (formal 형식화 — DB DDL 자체 명세 ❌)

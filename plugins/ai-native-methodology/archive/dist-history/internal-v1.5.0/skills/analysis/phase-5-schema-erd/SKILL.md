---
name: phase-5-schema-erd
description: Use when project contains DDL .sql files, Prisma schema, JPA @Entity, TypeORM @Entity, SQLAlchemy model, Mongoose schema, or database migration files. Generates schema.json (산출물 5-b) + erd.mermaid (DB structure). Drift-validator auto-checks .json ↔ .mermaid equivalence. Stage = analysis, track = DB.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# phase-5-schema-erd — DB Schema + ERD 산출

데이터베이스 구조 → schema.json + erd.mermaid 이중 렌더링.

## 사전 조건

- domain.json 존재 (entity ↔ table 매핑 reference)
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
4. **schema.json 작성** — `schemas/db-schema.schema.json`:
   ```json
   {
     "tables": [...],
     "relationships": [...],
     "indexes": [...],
     "constraints": [...],
     "meta_confidence": {...}
   }
   ```
5. **erd.mermaid 생성** — Mermaid ER diagram syntax
6. **drift-validator 자동 호출** — `.json ↔ .mermaid` 의미 동등성

## 산출물

- `<user-project>/.aimd/output/schema.json`
- `<user-project>/.aimd/output/erd.mermaid`

## 본체 명세

- `methodology-spec/deliverables/05-formal-spec.md` (db 부분)
- `schemas/db-schema.schema.json`
- ADR-008 (이중 렌더링)

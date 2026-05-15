---
name: analysis-domain-model
description: Use after analysis-architecture to extract domain model (entities, aggregates, value objects, bounded contexts). DDD-style. Generates domain.json (산출물 3). Required prerequisite for analysis-business-rules. Stage = analysis.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-domain-model — 도메인 모델 추출

DDD 원칙 (ADR-004) 기반. Entity / Aggregate / Value Object / Bounded Context 식별.

## 사전 조건

- `<user-project>/.aimd/output/architecture.json` 존재
- 가급적 `business-logic` phase (§8.1 단일 PoC 과적합 회피) — 같은 도메인이 여러 PoC / module 에서 일관 식별되는지 cross-check 권장

## 절차

1. **Entity 식별** — JPA `@Entity` / Prisma model / TypeORM / SQLAlchemy / 도메인 객체 추출
2. **Aggregate root 식별** — entity 간 ownership 관계 (composition vs reference)
3. **Value Object 식별** — immutable / no-identity 객체
4. **Bounded Context 분리** — 같은 도메인 용어가 다른 의미로 쓰이는 경계
5. **Ubiquitous Language 기록** — 한국어/영어 용어 매핑 (ADR-005 한국어 정책)
6. **domain.json 작성** — `schemas/domain.schema.json`:
   ```json
   {
     "entities": [...],
     "aggregates": [...],
     "value_objects": [...],
     "bounded_contexts": [...],
     "ubiquitous_language": {...},
     "meta_confidence": {...}
   }
   ```

## 산출물

`<user-project>/.aimd/output/domain.json`

## 본체 명세

- `methodology-spec/workflow/business-logic.md` (§5.B domain — `business-logic` phase 안 4영역 병렬 / v3.0.0 phase 의미 ID rename 정합)
- `methodology-spec/deliverables/2-domain.md`
- `schemas/domain.schema.json`
- ADR-004 (DDD), ADR-005 (한국어)

## 다음

- `analysis-business-rules` 호출 권장

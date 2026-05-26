# behavior-spec — <scope>

★ v11.0.0 paradigm — chain 2 (spec) 산출물 (사람 검토용 / 이중 렌더링 / ADR-008 v2). executable behavioral contract. cross-cut 단일 (BE/FE 양쪽 자연 가로지름).

## 메타

| 항목 | 값 |
|---|---|
| 생성 시각 | <ISO 8601> |
| 방법론 버전 | v11.0.0 |
| 신뢰도 | 0.85 |
| 출처 commit | <git SHA> |
| discovery-spec | `.aimd/output/discovery-spec.json` |

## 1. Behavior (BHV-*)

### BHV-DOMAIN-001 — <BHV 이름>

- **설명**: <executable contract 의도>
- **UC backward**: UC-DOMAIN-001
- **BR backward**: BR-DOMAIN-RULE-001
- **사전조건**:
  - `user.status == ACTIVE`
- **사후조건**:
  - `entity.created_at != null`
- **불변식**:
  - `balance >= 0`
- **state-machine**: `.aimd/output/formal-spec/state-machines/UC-DOMAIN-001.json`
- **decision-table**: `.aimd/output/formal-spec/decision-tables/UC-DOMAIN-001.json`
- **sequence**: `.aimd/output/formal-spec/sequences/UC-DOMAIN-001.json`
- **property-test**:
  - any positive amount must succeed (fast-check / `fc.integer({ min: 1, max: 1000 })`)
- **AC forward**: AC-DOMAIN-001
- **source-grounded evidence**:
  - `src/domain/Service.java:30-60`
  - `business-rules.json#BR-DOMAIN-RULE-001`

## 2. cross-link (analysis 산출물)

- `.aimd/output/business-rules.json`
- `.aimd/output/domain.json`
- `.aimd/output/openapi.yaml`
- `.aimd/output/schema.json`
- `.aimd/output/antipatterns.json`
- `.aimd/output/state-map.json`
- `.aimd/output/visual-manifest.json`

## 검증

- `tools/chain-coverage-validator/` (gate #2) — UC → BHV → AC link coverage ≥ 0.85
- `tools/schema-validator/` — `schemas/behavior-spec.schema.json` 구조 정합
- `tools/drift-validator/` (chain mode) — Phase 4.5 산출물 정합
- `tools/decision-table-validator/` — decision-table 정합
- `tools/formal-spec-link-validator/` (chain mode) — formal-spec link 정합

## 다음

chain 3 (plan) gate #3 진입 → `task-plan.{json,md}` 산출.

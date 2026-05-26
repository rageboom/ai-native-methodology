# discovery-spec — <scope>

★ v11.0.0 paradigm — chain 1 (discovery) 산출물 (사람 검토용 / 이중 렌더링 / ADR-008 v2). 본 파일은 discovery-spec.json 과 항상 동기 (1:1).

## 메타

| 항목 | 값 |
|---|---|
| 생성 시각 | <ISO 8601> |
| 방법론 버전 | v11.0.0 |
| 신뢰도 | 0.85 |
| 출처 commit | <git SHA> |
| 산출물 source | analysis stage 7대 + 입력 어댑터 (analysis-output / swagger / figma / nl-md) |

## 1. 비즈니스 의도

- **도메인 목적**: <한 줄 비즈니스 목적>
- **이해관계자**: <이해관계자 1>, <이해관계자 2>
- **성공 기준**:
  - <KPI 1>
  - <정성 기준 2>

## 2. Use Case (UC-*)

★ cross-cut anchor (BE/FE 양쪽 자연 가로지름).

### UC-DOMAIN-001 — <UC 이름>

- **사용자**: <user role>
- **시나리오**: <1~2줄 설명>
- **사전 조건**: <preconditions>
- **사후 조건**: <postconditions>
- **AC 묶음**: AC-DOMAIN-001
- **source-grounded evidence**:
  - `src/domain/Service.java:30-60`
  - `business-rules.json#BR-DOMAIN-001`

## 3. Business Rule Intent (BR-INTENT-*)

### BR-INTENT-001 → BR-DOMAIN-001

- **reasoning**: <왜 이 비즈니스 룰이 필요한가>
- **source-grounded evidence**: `src/domain/Validator.java:23`

## 4. 결단 (decisions)

★ v8.7.5+ G-005 정합 — 결단 처리 정식화.

| ID | 주제 | source | rationale | affected | revisit |
|---|---|---|---|---|---|
| DEC-PLAN-001 | <결단 주제> | user-explicit | <사유> | UC-DOMAIN-001 | false |

### 미결단 항목 (pending_decisions)

없음 / (있을 시 gate #1 안 user-explicit 으로 전환 의무).

## 5. cross-link (chain backward)

- analysis 산출물:
  - `.aimd/output/business-rules.json`
  - `.aimd/output/domain.json`
  - `.aimd/output/openapi.yaml`
  - `.aimd/output/antipatterns.json`

## 검증

- `tools/discovery-extraction-validator/` (gate #1) — source-grounded coverage ≥ 0.80 / no-hallucination
- `tools/schema-validator/` — `schemas/discovery-spec.schema.json` 구조 정합
- `tools/br-cross-consistency-validator/` (★ v2.5+ Layer 2 LLM 의무) — BR-INTENT 정합

## 다음

chain 2 (spec) gate #2 진입 → `behavior-spec.{json,md}` + `acceptance-criteria.{json,md}` 산출.

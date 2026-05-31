# task-plan — <scope>

★ v11.0.0 paradigm — chain 3 (plan) 산출물. macro HOW (task 분해 / 의존성 / ADR / NFR / risk / rollback). **본 stage = ticket 생성 시점** (4-level cascade: Epic + Story + OP-* + TASK-*).

## 메타

| 항목 | 값 |
|---|---|
| 생성 시각 | <ISO 8601> |
| 방법론 버전 | v11.0.0 |
| 신뢰도 | 0.85 |
| behavior-spec | `.aimd/output/behavior-spec.json` |
| acceptance-criteria | `.aimd/output/acceptance-criteria.json` |
| discovery-spec | `.aimd/output/discovery-spec.json` (cross-validation) |

## 1. Epic / Story / OP-* / TASK-* hierarchy

### Epic (FE 화면 단위)

| Epic ID | screen | route | title |
|---|---|---|---|
| EPIC-DOMAIN-DASH | DashboardScreen | `/domain/dashboard` | Domain 대시보드 화면 |

### Story (BHV/AC cross-cut anchor)

| Story ID | BHV | AC 묶음 | Epic |
|---|---|---|---|
| STORY-DOMAIN-001 | BHV-DOMAIN-001 | AC-DOMAIN-001/002/003 | EPIC-DOMAIN-DASH |

### OP-* (Story sibling / BE only 운영·인프라·마이그레이션)

| OP ID | category | title |
|---|---|---|
| OP-DOMAIN-001 | infra | DB 인덱스 추가 |

### TASK-* (Sub-task / 1~3 AC 묶음 / layer 분기)

| TASK ID | layer | AC 묶음 | Story | exec order |
|---|---|---|---|---|
| TASK-DOMAIN-001 | be | AC-DOMAIN-002 | STORY-DOMAIN-001 | 1 |
| TASK-DOMAIN-002 | fe | AC-DOMAIN-003 | STORY-DOMAIN-001 | 2 |
| TASK-DOMAIN-003 | e2e | AC-DOMAIN-001 | STORY-DOMAIN-001 | 3 |

## 2. layer 분기 contract anchor

★ DEC-2026-05-26-contract-강제-양-axis §1 layer 2 hard gate.

### BE TASK (★ openapi_endpoint_ref 의무)

| TASK | path | operationId | method |
|---|---|---|---|
| TASK-DOMAIN-001 | `/api/domain/resource` | `createDomainResource` | POST |

### FE TASK (★ component_ref 의무)

| TASK | package | name | state_map | dtcg |
|---|---|---|---|---|
| TASK-DOMAIN-002 | `src/features/domain` | `DomainCreateForm` | `dashboard.modal.create` | `default` |

## 3. ADR (Architecture Decision Record)

### `ADR-<scope>-NNN` — <제목>

- **status**: proposed
- **trigger_category**: structure
- **decision**: <결정 본문>
- **alternatives** (≥3 강제):
  1. <대안 1> — reject: <사유>
  2. <대안 2> — reject: <사유>
  3. <대안 3> — reject: <사유>
- **consequences**:
  - positive: <긍정 결과>
  - negative: <부정 결과>
- **integration_points**: `src/domain/Service.java:45-60`
- **behavior_refs**: BHV-DOMAIN-001

## 4. NFR allocation (★ hard gate)

★ ISO/IEC 25010:2023 SQuaRE 9 quality characteristic. high+critical NFR 누락 시 gate #3 block.

| NFR | characteristic | severity | description |
|---|---|---|---|
| NFR-DOMAIN-001 | performance_efficiency | high | 응답시간 p95 < 500ms |

## 5. Risk (3중 망 — LLM + industry-case-researcher + 사람 보강)

| RISK | severity | type | mitigation | human_review |
|---|---|---|---|---|
| RISK-DOMAIN-001 | high | concurrency | <완화 전략> | ✅ |

## 6. Rollback 전략

- **strategy**: feature flag / blue-green / backward-compat shim — 발동 조건: <조건> / data migration reversible
- **verification**: rollback 후 회귀 test GREEN + data 무결성 확인

## 검증

- `tools/plan-coverage-validator/` (gate #3) — NFR allocation hard gate + TASK granularity (≤3 AC) + dependency cycle + risk severity + ★ BE TASK ↔ openapi_endpoint_ref 1:1 matching + ★ FE TASK ↔ component_ref matching
- `tools/schema-validator/` — `schemas/task-plan.schema.json` if/then 강제 (layer=be → openapi_endpoint_ref / layer=fe → component_ref)

## 다음

- chain 3 plan gate #3 통과 → `ticket-sync` skill 호출 (★ stage=`plan` / phase=`exit` / 4-level cascade 일괄 생성)
- chain 4 (test) gate #4 진입 → `test-spec.{json,md}` 산출 (RED 의무)

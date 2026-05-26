# acceptance-criteria — <scope>

★ v11.0.0 paradigm — chain 2 (spec) 산출물 (사람 검토용 / 이중 렌더링 / ADR-008 v2). Gherkin BDD 형식. verifiable=true ⇔ ≥ 1 TC forward link.

## 메타

| 항목 | 값 |
|---|---|
| 생성 시각 | <ISO 8601> |
| 방법론 버전 | v11.0.0 |
| 신뢰도 | 0.85 |
| behavior-spec | `.aimd/output/behavior-spec.json` |
| discovery-spec | `.aimd/output/discovery-spec.json` |

## 1. Acceptance Criteria (AC-*)

### AC-DOMAIN-001 — cross-cut Story anchor

| 항목 | 값 |
|---|---|
| layer | cross-cut |
| severity | must (`@must`) |
| verifiable | true |
| BHV backward | BHV-DOMAIN-001 |
| UC backward | UC-DOMAIN-001 |
| Story | STORY-DOMAIN-001 |
| TC forward | TC-DOMAIN-001 |
| 관련 BR | BR-DOMAIN-RULE-001 |

**Gherkin**:
```gherkin
Given 사용자가 로그인 상태이다
When 유효한 input 으로 작업을 실행한다
Then 결과가 success 상태이다
And audit log 가 기록된다
```

### AC-DOMAIN-002 — layer=be (★ openapi_path + operationId 의무)

| 항목 | 값 |
|---|---|
| layer | **be** |
| severity | must |
| openapi_path | `/api/domain/resource` |
| operationId | `createDomainResource` |
| Story | STORY-DOMAIN-001 |

**Gherkin**:
```gherkin
Given 인증 토큰이 유효하다
When POST /api/domain/resource 호출
Then 응답 status=201
And Location header 가 채워진다
```

### AC-DOMAIN-003 — layer=fe (★ state_map_ref + dtcg_token_ref + visual_manifest_ref 의무)

| 항목 | 값 |
|---|---|
| layer | **fe** |
| severity | must |
| state_map_ref | `dashboard.modal.create` |
| dtcg_token_ref | `default` |
| visual_manifest_ref | `screen.dashboard` |
| Story | STORY-DOMAIN-001 |

**Gherkin**:
```gherkin
Given 사용자가 대시보드 화면에 진입했다
When [작업 생성] 버튼을 클릭한다
Then form modal 이 나타난다
And DTCG primary color 가 적용된다
```

## 2. 통계

| layer | count |
|---|---|
| cross-cut | 1 |
| be | 1 |
| fe | 1 |
| db | 0 |
| e2e | 0 |
| infra | 0 |

## 검증

- `tools/chain-coverage-validator/` (gate #2) — UC → BHV → AC link coverage ≥ 0.85
- `tools/schema-validator/` — `schemas/acceptance-criteria.schema.json` if/then 강제 (layer=be → openapi + operationId / layer=fe → state_map + dtcg + visual_manifest)
- `tools/br-cross-consistency-validator/` (★ Layer 2 LLM) — BR-INTENT 정합

## 다음

chain 3 (plan) gate #3 진입 → `task-plan.{json,md}` (Epic/Story/Task/Sub-task 4-level cascade).

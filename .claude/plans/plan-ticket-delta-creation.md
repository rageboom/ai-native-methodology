# plan — ticket-sync 델타 생성 모델 재설계

## 목표
ticket-sync 가 **없는 티켓만(델타)** 생성. Epic/Story 가 외부(discovery/입력)에서 기존 Jira 키로 전달되면 생성 skip + 부모로만 사용. "필요한 티켓만 딴다."

## 동기 (사용자 지적)
- Epic/Story 는 이미 존재할 수 있음 (discovery 에서 링크 전달받는 시나리오).
- 현재 cascade Step 2/3 는 조건 없이 무조건 생성 → 기존 티켓 무시.
- 스키마는 이미 `epic_refs[].jira_id` = "외부 Jira ID" 모델을 절반 보유하나 skill 이 안 honor + drift 존재.

## 설계 결정 (잠금 대상)

### D1. jira_id 의미 = 존재 신호
- `jira_id` 있음 → **기존 티켓**: 생성 skip, 부모로만 사용.
- `jira_id` 없음 → **신규 생성**: 만들고 jira_id 채움.

### D2. 스키마 required 완화 (breaking 0 — 제약 완화 = superset)
- `epic_refs` required `["jira_id"]` → `[]` (식별은 title/screen_id/route 중 하나 권장, jira_id optional).
- `story_refs` required `["jira_id","behavior_ref"]` → `["behavior_ref"]`.
- `op_task_refs` required `["jira_id","op_task_id"]` → `["op_task_id"]`.
- jira_id description = "외부 Jira ID (기존 티켓 / 있으면 생성 skip) / 없으면 신규 생성 후 채움" 으로 정정.

### D3. per-ref 독립 판정 + 우선순위
- 각 ref 는 자기 jira_id 유무로 독립 skip/create (Story 만 있고 Epic 없음 등 혼합 허용).
- 부모 연결: 자식의 epic_ref/story_ref 가 (a) 이번에 생성한 키면 그 키 / (b) 기존 키면 그 키로 링크.
- **우선순위**: ① pre-bound jira_id (최강) → ② search-first idempotency → ③ 신규 생성. pre-bound 시 search-first short-circuit.

### D4. 생성/기존 구분 마커 (정직성 + revisit)
- ref 에 optional `pre_existing` boolean (default false). jira_id 입력 보유 시 true 권장.
- evidence ticket_cascade 에 created vs reused 구분 기록 (mcp_invocations 가 이미 created 만 기록 / reused 는 skip count).

### D5. discovery → plan 링크 전달 경로
- `discovery-spec.schema.json` use_cases[] 에 optional `existing_ticket_ref` (jira key + level epic/story) 추가.
- plan-decompose 가 이를 task-plan epic_refs/story_refs 의 jira_id 로 전파 (skill 본문 안내).
- 최소 wiring — discovery 가 안 줘도 plan 에서 직접 jira_id 기입 가능 (둘 다 경로).

## 영향 파일
1. `schemas/task-plan.schema.json` — D2 required 완화 + jira_id desc + pre_existing 필드.
2. `schemas/discovery-spec.schema.json` — D5 existing_ticket_ref (optional).
3. `skills/ticket-sync/SKILL.md` — cascade Step 2/3/4 에 "jira_id 있으면 skip+부모로" 분기 + 우선순위 + drift 정정(epics[]→epic_refs[]).
4. `skills/plan-decompose-and-sequence/SKILL.md` — jira_id 사전바인딩 = 기존, 없으면 placeholder/신규 안내 + discovery 전파.
5. `schemas/ticket-sync-evidence.schema.json` — reused vs created 구분 (optional 필드).
6. 신규 DEC — DEC-2026-06-10-ticket-delta-creation.
7. drift 정정: SKILL `epics[]`/`stories[]` → `epic_refs[]`/`story_refs[]` (스키마 일치) + jira_id placeholder-vs-existing 의미 일원화.
8. 테스트: task-plan/discovery-spec/ticket-sync-evidence schema 테스트 + (있으면) ticket-binding.

## 검증
- schema-validator canonical 40/40 + 신규 케이스 (jira_id 없는 ref valid / pre_existing) 추가.
- skill-citation-validator 0 stale.
- breaking 0 (required 완화 = 기존 valid 데이터 유지).

## 미해결/엣지 (option 4 흡수)
- Story 있는데 Epic 없음 → D3 per-ref 독립으로 해결.
- revisit stale → 델타 모델이 오히려 완화 (재실행 시 기존 skip).
- search-first 관계 → D3 우선순위로 정리.

## Lessons
- task-plan = top-level `additionalProperties:false` → 인스턴스에 `$schema_origin` 넣으면 invalid. CLI 는 파일명으로 schema 매칭하므로 task-plan.json 은 `$schema_origin` 없이 작성. (discovery-spec 은 top-level additional 허용이라 무방 — 스키마별 비대칭). 테스트 작성 시 주의.
- 스키마 `required` 완화 = strictly more permissive → 기존 valid 데이터 유지 = breaking 0. jira_id required 음성 테스트 부재 확인 후 진행 (회귀 가드).
- 완료: schema 3 + skill 2 + DEC + 테스트 2. canonical 40→42, ticket 27, citation 0 stale.

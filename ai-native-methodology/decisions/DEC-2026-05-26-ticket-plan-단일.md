# DEC-2026-05-26-ticket-plan-단일

> ★ v11.0.0 #3 + #5 + #7 결단 — ticket 생성 = plan stage 한 곳 + Epic = FE 화면 단위 + Task = Story sibling (BE only 운영) entity 매핑. SSOT: [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md).

**일자**: 2026-05-26 (session 48차)
**카테고리**: paradigm / ticket lifecycle 재매핑 — R20 stage-별 paradigm 본격 retract + Epic/Story/Task/Sub-task 4-level matrix 본격 정합
**상태**: 승인 — 사용자 3 결단 통합
- #3: "ticket 은 plan 에서 다 처리되는게 안 맞나? 각 stage 에서 만드는 게 무슨 장점이 있나?"
- #5: "discovery 는 에픽이 아니다. discovery 는 일의 시작점. Epic 은 큰 단위의 개발 화면 단위다"
- #7: "Story 하위 Task - Sub-task 이렇게 되는 거 아냐? 왜 Task 가 없나?"

## 1. 현재 paradigm 본격 retract

### R20 v8.6.x (현재 paradigm)
- chain stage 마다 ticket 생성 (analysis→Initiative / planning→Epic / spec→Story / plan→Sub-task)
- `skills/ticket-sync` 안 5 stage × 2 phase matrix (enter / exit)
- `schemas/ticket-sync-evidence.schema.json` 안 `phase` enum {enter, exit}

### 본격 단점 (사용자 직관 정확)
1. **ticket 폭발** (analysis 1 + discovery N + spec M + plan K = 폭증)
2. **"분석 산출물 ≠ 작업 항목"** — analysis/discovery/spec 결과물은 "이해" 이지 "할 일" 아님 → ticket 만들 필요 본격 의문
3. **agile paradigm 위배** — 작업 = Sub-task 단위 = plan stage 안 본격 발생
4. **discovery ≠ Epic** — discovery 단계에서 Epic 본격 결정 불가 (Epic 은 화면 단위 결단 / 화면 매핑은 plan 시점에 본격)

## 2. 결단 본격 — ticket = plan stage 단일

### chain harness × ticket hierarchy 재매핑

| Stage | ticket 생성 | 산출물 |
|---|---|---|
| analysis | ❌ | 산출물만 (BE 7대 + FE 8) |
| discovery | ❌ | discovery-spec (UC = 사용자 의도 / cross-cut) |
| spec | ❌ | behavior-spec + acceptance-criteria (BHV/AC = cross-cut anchor) |
| **plan** | ★ ★ ★ ★ ★ **Epic + Story + Task + Sub-task 모두 본격 생성** | task-plan + Jira ticket cascade |
| test | (Sub-task status 갱신만) | test-spec.{framework} |
| implement | (Sub-task status 갱신만) | impl-spec.{stack} |

### Jira hierarchy ↔ 본 방법론 entity matrix (★ v11.0.0 본격)

| Jira | 본 방법론 entity | 정의 | 생성 stage | 예시 |
|---|---|---|---|---|
| **Initiative** | (선택 / 대형 분석 결과 묶음) | 대형 결단 단위 | plan 안 선택적 | "사용자 도메인 전체 개편" |
| **Epic** | (plan 안 결단) | ★ **FE 화면 단위** (UI screen / route) | plan stage | "사용자 설정 화면" (route `/settings/security`) |
| **Story** | BHV-* 또는 AC 묶음 | 화면 안 사용자 시나리오 (BE+FE cross-cut) | spec stage 산출 → plan stage 생성 | "비밀번호 변경 성공 시나리오" |
| **Task** (★ Story sibling) | ★ **OP-*** (신설 entity) | 사용자 가시 없는 작업 (운영/인프라/마이그레이션/cron/헬스체크/리팩터링) | plan stage | "argon2 라이브러리 도입" / "password_hash column migration" |
| **Sub-task** | TASK-* (기존 entity / 명명 유지) | 개발 작업 단위 (1~3 AC 묶음 / layer 분기) | plan stage | "PasswordChangeForm 컴포넌트 작성" / "POST /api/password-change endpoint" |

### 매핑 paradigm 정합

```
화면 있는 시나리오:
  Epic (화면)
    └─ Story (시나리오 / BHV)
         └─ Sub-task × N (TASK-* / 1~3 AC / BE+FE+DB+E2E cross-cut)

화면 없는 운영 작업:
  Task (Story sibling / Epic 부재 가능)
    └─ Sub-task × N (TASK-* / 운영 작업 분해)
  ※ OP-* entity (★ v11.0.0 신설)
```

### 본 방법론 ID 명명 정합

| Jira | 본 방법론 ID 명명 | 명명 정합 비고 |
|---|---|---|
| Initiative | (외부 매핑만 / 본 방법론 entity ❌) | 의도적 미신설 — 본 방법론 안 Initiative-level entity 부재 / 사용자 결단 시 work-unit-manifest 안 record |
| Epic | (외부 매핑만 + screen_id 또는 route 안 cross_link) | Epic = FE 화면 / 본 방법론 entity 부재 / `task-plan.epic_refs[]` 안 jira_id record |
| Story | (외부 매핑만 + story_ref → BHV-* 또는 AC-*) | Story = BHV/AC anchor / 본 방법론 별도 entity ❌ / `task-plan.story_refs[]` 안 jira_id record |
| Task (Story sibling) | **OP-***  (★ v11.0.0 신설) | "운영" / Operational task / BE only 운영 작업 anchor / `schemas/operational-task.schema.json` 신설 |
| Sub-task | **TASK-*** (기존 명명 유지) | 본 방법론 Sub-task level / Jira 매핑 시 "Sub-task" 명시화 |

## 3. ticket-sync skill 본격 재설계 (Phase 2)

### v8.6.x phase enum 본격 폐기

`schemas/ticket-sync-evidence.schema.json` 안 `phase` enum {enter, exit} 본격 폐기. 대신 plan stage 단일 시점 batch 호출:

### v11.0.0 신규 paradigm

```
plan stage 안 ticket-sync 본격 호출:
  1. confirmation gate (preview MD → yes/no/dry-run)
  2. Epic 생성 (FE 화면 단위 / route 안 추출)
  3. Story 생성 (BHV/AC anchor / cross-cut)
  4. Task 생성 (OP-* anchor / Story sibling / Epic 부재 가능)
  5. Sub-task 생성 (TASK-* / Story 또는 Task 안 nested)
  6. 7-field evidence 캡쳐
  7. traceability-matrix 안 ticket_ref 본격 cross_link

test/implement stage = Sub-task status 갱신만 (Jira API 호출 / 신규 ticket 생성 ❌)
```

## 4. 영향 면적 (schema 변경)

### schemas/operational-task.schema.json (★ 신설)

```json
{
  "$id": ".../operational-task.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["op_tasks"],
  "properties": {
    "op_tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "category"],
        "properties": {
          "id": { "pattern": "^OP-[A-Z0-9_-]+-[0-9]{3}$" },
          "title": { "type": "string" },
          "category": { "enum": ["migration", "cron", "health-check", "refactor", "infra", "ops"] },
          "subtask_refs": { "type": "array", "items": { "pattern": "^TASK-" } }
        }
      }
    }
  }
}
```

### schemas/task-plan.schema.json (#5 + #7 확장)

기존 tasks[] 외에 epic_refs / story_refs / op_task_refs 신설:

```json
{
  "epic_refs": [
    { "jira_id": "EPIC-10", "screen_id": "PasswordChangeForm", "route": "/settings/security" }
  ],
  "story_refs": [
    { "jira_id": "STORY-101", "behavior_ref": "BHV-001", "ac_refs": ["AC-001", "AC-002"] }
  ],
  "op_task_refs": [
    { "jira_id": "TASK-42", "op_task_id": "OP-AUTH-001", "category": "migration" }
  ],
  "tasks": [
    {
      "id": "TASK-001",
      "ac_refs": ["AC-001"],
      "layer": "fe",
      "story_ref": "STORY-101",     // ★ #5 신설
      "epic_ref": "EPIC-10",         // ★ #5 신설
      "op_task_ref": null            // ★ #7 신설 (nullable / Story 안에 속하지 않고 OP 안에 속하는 경우)
    }
  ]
}
```

### schemas/ticket-sync-evidence.schema.json (★ 본격 재설계)

`phase` enum {enter, exit} 본격 폐기 → 단일 `stage: "plan"` 만 허용. 신규 필드:

```json
{
  "stage": "plan",
  "ticket_cascade": {
    "epics": [ ... ],
    "stories": [ ... ],
    "op_tasks": [ ... ],
    "subtasks": [ ... ]
  },
  "confirmation_gate": {
    "preview_md_path": "...",
    "user_response": "yes"
  },
  "search_first_idempotency": true,
  "graceful_mcp_missing": true
}
```

## 5. 영향 면적 (다른 자산)

### skills/ticket-sync/SKILL.md 본격 재설계
- 5 stage × 2 phase matrix → plan stage 단일
- 호출 시점 = plan stage 안 gate #3 통과 후
- Epic/Story/OP/Sub-task 4-level cascade dispatch

### hooks/hooks.json
- 변경 ❌ (PreToolUse matcher `mcp__wiki-jira-assistant__.*` 그대로)

### traceability-matrix 안 ticket_ref
- 기존 `ticket_ref.{stage,jira_id}` → `ticket_ref.{level,jira_id}` (level enum: epic/story/task/subtask)
- backward-compat shim ❌ (v11.0.0 본격 breaking)

### plugin-charter.md §1 R20 본격 갱신
- R20 = "MCP Ticket Sync Channel" → **R20-prime** = "MCP Ticket Sync Channel (plan stage 단일)"
- §2 R20 ✅ → §2 R20-prime ✅ (재설계 확인)
- v8.6.x phase enum paradigm = 본격 retract

## 6. ratchet (legacy carry 대응)

기존 5 PoC artifact 안 ticket_ref:
- Phase 4 sweep 안 본격 conversion (level enum 부여 / 기존 stage 필드 매핑)
- 외부 사용자 Jira 환경 안 기존 ticket = v11.0.0 release note 안 본격 명시 / migration script 제공 가능

## 7. 검증 (Phase 1 STOP-3)

- schema-validator 100% pass (operational-task + task-plan + ticket-sync-evidence)
- ticket-sync skill 본격 재설계 확인 (5 stage × 2 phase → plan 단일)
- workspace test 100% pass
- skill-citation 0 stale (R20 → R20-prime 인용 갱신)

## 8. cross-link

- SSOT: [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md) §2 #3 + #5 + #7
- 동반 결단: [DEC-2026-05-26-be-fe-산출물-분리](DEC-2026-05-26-be-fe-산출물-분리.md) (#2 + #6 / Story cross-cut 정합)
- 폐기 결단: DEC-2026-05-18-r20-mcp-ticket-sync-channel §확장 (phase=enter / phase=exit) 본격 retract
- charter R20 (v8.6.x) = 본 결단 안 본격 evolved (R20-prime / plan stage 단일)
- carry: 차기 세션 Phase 2 안 ticket-sync skill 본격 재설계

# Epic / Story / OP-* mapping template — <scope>

★ v11.0.0 — Epic / Story / Task (OP-*) / Sub-task (TASK-*) 4-level cascade matrix. plan stage 의 task-plan.json 안 본격 표기. ticket-sync skill (stage=plan / phase=exit) 가 본 매핑으로 4-level Jira cascade 일괄 생성.

## paradigm 정합

| 항목 | v11.0.0 |
|---|---|
| Epic | FE 화면 단위 (UI screen / route) — 또는 BE-domain 묶음 |
| Story | BHV/AC cross-cut anchor (BE+FE/DB/E2E 가로지름) |
| Task (Story sibling) | OP-* — 운영·인프라·마이그레이션 (BE only / Story 의 사용자 시나리오 axis 와 분리) |
| Sub-task | TASK-* — 1~3 AC 묶음 + layer 분기 (be/fe/db/e2e/infra) |

## Epic matrix

| Epic ID | type | screen / domain | route | linked Story |
|---|---|---|---|---|
| EPIC-DOMAIN-DASH | FE screen | DashboardScreen | `/domain/dashboard` | STORY-DOMAIN-001 |
| EPIC-DOMAIN-BACK | BE-domain | (domain backend 영역) | — | STORY-DOMAIN-002 (BE only) |

## Story matrix

| Story ID | BHV anchor | AC 묶음 | Epic | BE TASK | FE TASK | E2E TASK |
|---|---|---|---|---|---|---|
| STORY-DOMAIN-001 | BHV-DOMAIN-001 | AC-DOMAIN-001/002/003 | EPIC-DOMAIN-DASH | TASK-DOMAIN-001 | TASK-DOMAIN-002 | TASK-DOMAIN-003 |

## OP-* matrix (Story sibling / BE only 운영)

★ operational-task.schema.json 안 OP-* ID. category enum: migration / cron / health-check / refactor / infra / ops / monitoring / security-patch / dependency-upgrade.

| OP ID | category | summary | parent Epic | linked TASK (선택) |
|---|---|---|---|---|
| OP-DOMAIN-001 | infra | DB 인덱스 추가 | EPIC-DOMAIN-BACK | TASK-DOMAIN-001 (선택 cross-ref) |
| OP-DOMAIN-002 | migration | 기존 데이터 백필 | EPIC-DOMAIN-BACK | — |

## TASK-* matrix (Sub-task / 1~3 AC 묶음 / layer 분기)

| TASK ID | layer | AC 묶음 | Story | OP (선택) | contract ref |
|---|---|---|---|---|---|
| TASK-DOMAIN-001 | be | AC-DOMAIN-002 | STORY-DOMAIN-001 | OP-DOMAIN-001 (선택) | `/api/domain/resource` `createDomainResource` |
| TASK-DOMAIN-002 | fe | AC-DOMAIN-003 | STORY-DOMAIN-001 | — | `src/features/domain` `DomainCreateForm` |
| TASK-DOMAIN-003 | e2e | AC-DOMAIN-001 | STORY-DOMAIN-001 | — | — |

## ticket-sync MCP cascade (★ stage=plan / phase=exit / 4-level 일괄)

```
Initiative (선택 / parent_epic 미명시 시)
└─ Epic
    ├─ Story (BHV/AC cross-cut)
    │   ├─ Sub-task (TASK-* / layer 분기)
    │   ├─ Sub-task
    │   └─ Sub-task
    └─ Task (OP-* / Story sibling / BE only 운영)
```

## 참조

- `decisions/DEC-2026-05-26-ticket-plan-단일.md` — R20-prime SSOT
- `decisions/DEC-2026-05-26-v11-paradigm-결단.md` §결단 #5/#6/#7
- `schemas/task-plan.schema.json` — epic_refs + story_refs + op_task_refs 본격
- `schemas/operational-task.schema.json` — OP-* schema
- `skills/ticket-sync/SKILL.md` — 4-level cascade 본문

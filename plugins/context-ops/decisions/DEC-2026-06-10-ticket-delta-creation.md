# DEC-2026-06-10-ticket-delta-creation

> **ticket-sync 델타 생성 모델** — Epic/Story/OP-Task 가 외부(discovery/입력)에서 기존 Jira 키로 전달되면 **생성 skip + 부모로만 사용**. ticket-sync 는 **없는 티켓(델타)만** 딴다.

**일자**: 2026-06-10
**카테고리**: paradigm 확장 (ticket lifecycle / 델타 생성) — R20-prime cascade 정합 보강
**상태**: 승인 — 사용자 결단 ("내가 필요한 티켓만 따는 게 맞지. discovery 단계에서 epic/story 링크를 이미 전달받았다면 넣을 필요 없잖아" → 전체 승인)
**Trigger**: ticket-sync phase=exit "4-level cascade 일괄 생성" 검토 → 사용자가 "일괄로 만들 필요 있나 / 이미 있을 수 있다" 지적 → 델타 모델 채택

---

## 1. 문제

R20-prime cascade (DEC-2026-05-26-ticket-plan-단일) 의 phase=exit 는 `epic_refs[]`/`story_refs[]` 를 **조건 없이 전부 jira_create**. 그러나:

- Epic/Story 는 이미 존재할 수 있음 (discovery 입력에서 기존 Jira 링크 전달받는 시나리오 / 다른 팀이 먼저 만든 화면·기능 티켓).
- 스키마는 이미 `epic_refs[].jira_id` = "외부 Jira ID" 모델을 보유 (절반 지원) 했으나 **skill 이 honor 안 함**.
- drift 2개: SKILL 본문이 `task-plan.epics[]`/`stories[]` 로 호칭(스키마 실명 = `epic_refs[]`/`story_refs[]`) + jira_id 가 plan-decompose 에선 "placeholder", 스키마에선 "외부 ID required" 로 의미 충돌.

## 2. 결단 (D1~D5)

| # | 결정 |
|---|---|
| **D1** | `jira_id` 있음(또는 `pre_existing=true`) = **기존 티켓** → 생성 skip, 부모로만 사용 / 없음 = 신규 생성 |
| **D2** | 스키마 `required` 완화 — epic_refs `[]` / story_refs `["behavior_ref"]` / op_task_refs `["op_task_id"]` (jira_id 를 required 에서 제외 = 신규 생성 케이스 허용 / **제약 완화 = breaking 0**) |
| **D3** | per-ref 독립 판정 (Story 만 기존·Epic 신규 등 혼합 허용) + 우선순위 **① pre-bound jira_id → ② search-first → ③ 신규 생성** (pre-bound 시 search 생략) |
| **D4** | 정직 마커 — ref `pre_existing` boolean + evidence `search_first_idempotency.prebound_reused_count` (search skip 과 별 축) |
| **D5** | discovery → plan 전달 경로 — `discovery-spec` use_cases[].`existing_ticket_refs` (level=epic/story + jira_id) → plan-decompose 가 task-plan refs jira_id(+pre_existing)로 전파 |

## 3. 변경 자산

| 자산 | 변경 |
| --- | --- |
| `schemas/task-plan.schema.json` | epic_refs/story_refs/op_task_refs — required 완화 + jira_id 의미 정정 + `pre_existing` 신설 (D1·D2·D4) |
| `schemas/discovery-spec.schema.json` | use_cases[].`existing_ticket_refs` 신설 (optional / D5) |
| `schemas/ticket-sync-evidence.schema.json` | `search_first_idempotency.prebound_reused_count` 신설 (D4) |
| `skills/ticket-sync/SKILL.md` | cascade Step 2~5 델타 분기 + 우선순위 + 금지 `F-TICKETSYNC-014 prebound_ticket_recreated` + drift 정정(epics[]→epic_refs[], map `*_id_map`) |
| `skills/plan-decompose-and-sequence/SKILL.md` | jira_id 델타 규칙 + discovery existing_ticket_refs 전파 안내 |

## 4. 무영향 (불변)

- ticket 생성 시점 = plan stage 단일 (불변).
- 4-level 구조 (Epic/Story/OP/Sub-task) + parent linking (parent_strategy) + confirmation gate + 7-field evidence (불변).
- search-first idempotency (불변 / 델타 모델은 그 앞단 short-circuit).

## 5. 엣지 처리

- **Story 있는데 Epic 없음** (또는 반대) → D3 per-ref 독립 판정.
- **revisit loop stale** → 델타 모델이 오히려 완화 (재실행 시 기존 ref skip / 신규 ref 만 생성).
- **search-first 관계** → D3 우선순위 (pre-bound > search > 신규).

## 인용

- 모: `decisions/DEC-2026-05-26-ticket-plan-단일.md` (R20-prime cascade)
- OP-* 정의: `decisions/DEC-2026-06-10-op-task-layer-agnostic.md`
- 운영: `skills/ticket-sync/SKILL.md` §단계 2 + phase=exit / `skills/plan-decompose-and-sequence/SKILL.md`
- 스키마: `schemas/task-plan.schema.json` + `schemas/discovery-spec.schema.json` + `schemas/ticket-sync-evidence.schema.json`

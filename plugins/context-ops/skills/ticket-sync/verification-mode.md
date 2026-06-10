# ticket-sync — verification mode (plugin dogfood meta-cycle 전용)

> `mode=verification` 상세 절차. SKILL.md §단계 6b 에서 분리 (운영 무관 / plugin 자체 검증 전용 / SKILL lean 정책). standard mode (실 도메인 feature cycle) 와 무관.

`mode=verification` = plugin 본 작동 검증 / plugin 자체 dogfood meta-cycle 전용. `parent_epic` 의무 — 미명시 시 reject + Block error (`F-TICKETSYNC-003 verification_missing_parent_epic`).

§단계 5 환경 resolve prelude 는 standard 와 동일하게 적용.

## standard mode 와의 본질 차이

| 축 | standard | verification |
|---|---|---|
| Initiative 생성 | parent_epic 미명시 시 자동 (1건) | ❌ skip (parent_epic 재사용 의무) |
| Epic 생성 | task-plan.epics[] 기반 N건 | ❌ skip (parent_epic 직접 매핑) |
| Story 단위 | per BHV cluster (task-plan.stories[] N건) | per chain stage (analysis/discovery/spec/plan/test/implement 5+1=6건) |
| Sub-task 단위 | TASK-* (task-plan.tasks[]) / OP-* (operational-task.json) | per Story 의 산출물 / UC / AC / TC |
| 사용 시점 | 실 도메인 feature 개발 cycle | plugin 검증 / migration meta-cycle |

## verification mode 6 stage 본문 (analysis/discovery/spec/plan/test/implement Story 5+1=6건)

```
# 단일 본 skill 호출 안 6 Story 일괄 cascade — verification meta-cycle 의 stage 표현용
1. for each stage in [analysis, discovery, spec, plan, test, implement]:
   jira_create (role=story,
                parent=$parent_epic via parent_strategy,
                summary="[Plugin Verify] Stage N — {stage}",
                labels=[verification-mode, $scope_id])
   → verification_story_ids[stage]
2. for each stage:
   for each artifact in stage 산출물:
     jira_create (role=subtask,
                  parent_ticket_id=verification_story_ids[stage],
                  summary="[Verify artifact] {artifact_name}",
                  status=Done)
     B14 — Sub-task payload extra_fields[epic_link_customfield_id] 명시 ❌
   jira_comment (verification_story_ids[stage], "<stage> gate result + 5종 물증 link")
   jira_transition (verification_story_ids[stage] → "Done")
3. B15 — if (structure_id set + structure_auto_add_on_exit=true):
   # items = per-story 루프. depth=0 = under_key($parent_epic) 의 직접 자식.
   items = [
     {"key": story_key,     "depth": 0},   # Stage Story (per-stage 루프)
       {"key": subtask_key, "depth": 1},   # Story 하위 artifact Sub-task
   ]
   jira_structure_add_issues (structure_id=$structure_id, items=items, under_key=$parent_epic)
   → cycle 종료 마무리 evidence
4. jira_comment ($parent_epic,
                 "verification cycle 종결 — 6 Story keys + Q1~Q6 pass/fail summary
                  + traceability-matrix 100% green + commit hash + findings 링크")
```

verification mode 는 `traceability-matrix.ticket_ref.verification_mode=true` + `verification_story_ids` map 추가.

## 인용

- verification mode 결단: `decisions/DEC-2026-05-20-r20-verification-mode.md` (parent_epic override)
- 운영 진입점: `skills/ticket-sync/SKILL.md` §단계 6b

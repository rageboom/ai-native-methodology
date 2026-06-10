# ticket-cascade-builder

ticket-sync 의 **결정론 핵심**(DEC-2026-06-10-ticket-cascade-builder). `task-plan.json` + `ticket-sync-config.yaml` 등에서 4-level ticket cascade **실행 계획**(`cascade-plan.json`)을 산출한다.

> **NO MCP / NO LLM / NO network** — 순수 결정론 (feedback_chain_driver_deterministic_axis: 도구=결정론 / skill=LLM·MCP). ticket-sync skill 이 본 plan 을 읽어 MCP 호출을 발사한다.

## 무엇을 하나

- **resolve**: role → issue_type (config.issuetype_map / default 6종)
- **parent linking**: parent_strategy 별 spec (Sub-task=parent_key/B14 · Story/Task=epic_link_customfield · Epic=parent_link_customfield · Initiative=top_level)
- **델타 판정**: ref 의 jira_id 보유(또는 pre_existing) → `skip_prebound` (생성 skip, 부모로만) / 아니면 `create`
- **body 템플릿** + **summary 네이밍** (구 SKILL.md §이슈유형 → 도구로 이전)
- **cascade 순서**: Initiative → Epic → {Story, OP-Task} → Sub-task
- **preview_md** + **evidence_skeleton** + **counts**

## 사용

```bash
node src/cli.js \
  --task-plan <path> \
  [--operational-task <path>] [--behavior-spec <path>] [--acceptance-criteria <path>] \
  [--config <ticket-sync-config.yaml>] [--scope <slug>] [--out cascade-plan.json]
```

exit 0 = 산출 성공 / 1 = 입력 부재·오류 (issue_type 미정의 = F-TICKETSYNC-007 throw).

## 경계 (도구 밖 = skill 책임)

cascade-plan 은 **happy-path 의도**. 실 MCP 발사 / confirmation gate / 7-field evidence 캡쳐 / **runtime 400 fallback**(parent_link→parent_key→Relates) / search-first idempotency / graceful MCP-missing 은 `ticket-sync` skill 이 담당.

## 인용

- 결단: `decisions/DEC-2026-06-10-ticket-cascade-builder.md`
- schema: `schemas/cascade-plan.schema.json`
- 운영: `skills/ticket-sync/SKILL.md` §단계 5·6

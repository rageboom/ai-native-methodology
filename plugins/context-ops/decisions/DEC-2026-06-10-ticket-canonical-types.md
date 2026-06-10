# DEC-2026-06-10-ticket-canonical-types

> **Jira ticket 유형 = canonical 6종 고정** (Initiative / Epic / Story / Task / Sub-task / Bug). 그 외 "Tech Debt Story" · "Spike" 별도 유형 + `tech_debt` role 폐기 — 덧대어진 잔재 정리. 계층 = Initiative→Epic→{Story, Task}→Sub-task.

**일자**: 2026-06-10
**카테고리**: 정리 (paradigm 정합 / ticket 유형 canonical 화)
**상태**: 승인 — 사용자 결단 ("initiative/epic/story/task/sub-task/bug 이외에는 존재하지 않는다. 이 구조에 맞지 않는 것들은 정리해야 한다. 기존의 것에 지금의 스키마가 덧대어진 구조다" → "Tech Debt→OP / Spike는 폐기")
**Trigger**: ticket-sync 구조 점검 → 사용자가 canonical 유형 + 계층 명시 → 미스핏 잔재 정리 지시

---

## 1. canonical 유형 + 계층 (불변 기준)

```
Initiative
  └ Epic (Initiative 자식)
      ├ Story (Epic 자식)
      │   └ Sub-task (Story 자식)
      └ Task (Epic 자식 / = OP-*)
          └ Sub-task (Task 자식)
Bug (canonical 유형 / cascade 자동 생성 ❌ / 별도 등록)
```

유형 = **Initiative / Epic / Story / Task / Sub-task / Bug** 6종. 그 외 신설 ❌.

## 2. 문제 (덧대어진 잔재)

`ticket-policy §7 예외 케이스` 가 canonical 외 **별도 ticket 유형 2개**를 덧댐 + skill resolve 에 **`tech_debt` role** 잔존:

- **Tech Debt Story** (AP P0 횡단 회피 작업) — 별도 유형.
- **Spike** (도메인 횡단 BR 정책 결단) — 별도 유형.
- **`tech_debt` role** — issuetype_map enum / resolve table / orphan·parent_strategy 리스트 / env-config 예시.

스키마 enum(`level` = epic/story/op_task/subtask)은 이미 canonical 정합 — 잔재는 **markdown/skill 본문에만** 존재.

## 3. 결단 (fold)

| 잔재 | 처리 |
|---|---|
| **Tech Debt Story** | → **Task (OP-\*)** 흡수 (category=`refactor`/`security-patch`). AP P0 = 사용자 가시 없는 횡단 작업 = OP-* 정의 그 자체 (DEC-2026-06-10-op-task-layer-agnostic 정합) |
| **Spike** | → **폐기**. 도메인 횡단 BR 정책 결단 = ADR + business-rules.json 에 기록 / 작업 필요 시 Task (OP-\*). 티켓 유형 ❌ |
| **`tech_debt` role** | → 제거. role enum = `initiative`/`epic`/`story`/`task`/`subtask`/`bug` 6종 |

## 4. 변경 자산

| 자산 | 변경 |
| --- | --- |
| `skills/ticket-sync/SKILL.md` | role enum 6종 + resolve default 표 tech_debt 행 제거 + role label 목록 + orphan/parent_strategy/parent linking 리스트에서 tech_debt 제거 + link_type drift 에서 Tech Debt/Spike 명 제거 |
| `skills/ticket-sync/env-config-reference.md` | issuetype_map 3 블록(generic/DWPD/SG-MIS) tech_debt 제거 |
| `methodology-spec/ticket-policy.md` | §5 권장 summary(Tech Debt Story·Spike 행 제거, Bug 행 추가) + §7 예외 케이스(Tech Debt→OP-Task / Spike→ADR+Task 매핑) + Layer 표(Tech Debt Story·Spike 행 제거) |
| `schemas/ticket-sync-evidence.schema.json` | link_type 설명에서 "Spike" 제거 (텍스트 only / enum 무변) |

## 5. 무영향 (불변)

- 스키마 enum (level / parent_kind / op_tasks) = 이미 canonical → 무변경.
- 계층 enforcement (Sub-task parent_kind ∈ {story, op_task}) = 기존대로.
- OP-* (Task) / delta 생성 / R20-prime cascade = 불변.
- `skills-axis.md`·`lifecycle-contract.md` 의 "spike" = planning-agent 실험(archive) = **무관 / 무변경**.

## 인용

- canonical 계층 모: `decisions/DEC-2026-05-26-ticket-plan-단일.md`
- OP-* 흡수 근거: `decisions/DEC-2026-06-10-op-task-layer-agnostic.md`
- 운영: `skills/ticket-sync/SKILL.md` §단계 5 + `methodology-spec/ticket-policy.md` §5·§7

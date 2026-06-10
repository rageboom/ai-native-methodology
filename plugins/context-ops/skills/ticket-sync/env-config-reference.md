# ticket-sync — 환경별 config reference

> `.ai-context/ticket-sync-config.yaml` 환경별 구체 값. SKILL.md §단계 5 에서 분리 (reference 데이터 / SKILL lean 정책). resolve 알고리즘·default 표는 SKILL.md §단계 5 에 유지.

config 형태 (generic skeleton):

```yaml
# .ai-context/ticket-sync-config.yaml
issuetype_map:
  epic: ...
  story: ...
  subtask: ...
  initiative: ...
  tech_debt: ...
  task: ...
  bug: ...
parent_strategy: epic_link_customfield
epic_link_customfield_id: ...      # Story → Epic 링크
parent_link_customfield_id: ...    # Epic → Initiative "Parent Link" (선택)
structure_id: ...                  # (선택) Atlassian Structure 보드 자동 등록 id
structure_auto_add_on_exit: true
```

## DWPD 환경 reference config

```yaml
# .ai-context/ticket-sync-config.yaml (DWPD 환경)
issuetype_map:
  epic: epic
  story: 작업 # 또는 새 기능
  subtask: 하위 작업
  initiative: epic
  tech_debt: 개선
  task: 작업
  bug: 버그
parent_strategy: epic_link_customfield
epic_link_customfield_id: customfield_10006
# B14 — Sub-task 는 epic_link_customfield_id 명시 ❌
# (parent Story/Task 로부터 auto-inherit / 명시 시 400 reject)
# B15 — Structure 보드 자동 등록 (옵션)
structure_id: 676 # ALM Works DWP-Forge id (DWPD 환경)
structure_auto_add_on_exit: true
```

## SG-MIS 환경 표준 config

(jira.smilegate.net / 사내 공통 — SmileApp Intune 실측 확정) <!-- allow-identity: SG-MIS 환경 config reference (사내 공통 / 개인 신원 아님) -->

```yaml
# .ai-context/ticket-sync-config.yaml (SG-MIS 환경 — 사내 표준)
issuetype_map:
  epic:       epic
  story:      이야기
  subtask:    하위 작업
  initiative: Initiative
  tech_debt:  이야기
  task:       작업
  bug:        버그
parent_strategy: epic_link_customfield
epic_link_customfield_id: customfield_10006    # Story → Epic 링크 (사내 공통)
parent_link_customfield_id: customfield_11902  # Epic → Initiative "Parent Link" (사내 공통)
# B14 — Sub-task 는 epic_link_customfield_id 명시 ❌
# B15 — Structure 보드 자동 등록 (SG-MIS board)
structure_id: 684              # SG-MIS Structure board (jira.smilegate.net) — allow-identity: 사내 공통 env config
structure_auto_add_on_exit: true
# parent_initiative: <앱/제품 Initiative 키>  # 프로젝트별 기재 (예: MIS-108)
```

## 인용

- environment bridge 결단: `decisions/DEC-2026-05-20-r20-environment-bridge.md` (issuetype_map + parent_strategy + epic_link_customfield_id)
- B14 + B15: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md`
- 운영 진입점: `skills/ticket-sync/SKILL.md` §단계 5

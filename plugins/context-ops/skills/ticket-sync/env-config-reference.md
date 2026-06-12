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
  task:       작업
  bug:        버그
parent_strategy: epic_link_customfield
epic_link_customfield_id: customfield_10006    # Story → Epic 링크 (사내 공통)
parent_link_customfield_id: customfield_11902  # Epic → Initiative "Parent Link" (사내 공통)
# B16 — Epic 생성 시 customfield_10007 (에픽 이름) 필수 (미포함 시 400 에러)
#   extra_fields:
#     customfield_10007: <Epic summary 와 동일 값>
# B14 — Sub-task 는 epic_link_customfield_id 명시 ❌
# B15 — Structure 보드 자동 등록 (SG-MIS board)
structure_id: 684              # SG-MIS Structure board (jira.smilegate.net) — allow-identity: 사내 공통 env config
structure_auto_add_on_exit: true
# parent_initiative: <앱/제품 Initiative 키>  # 프로젝트별 기재 (예: MIS-108)
```

### B16 — SG-MIS Epic 생성 시 customfield_10007 필수

SG-MIS (jira.smilegate.net) 에서 `role=epic` jira_create 호출 시 `customfield_10007` ("에픽 이름") 필드가 서버 측 필수 필드로 강제됨. 미포함 시 **400 Bad Request** 응답.

**ticket-sync skill §단계 6 Epic 발사 시 처리 의무:**

```json
{
  "issue_type": "epic",
  "summary": "차량 대시보드",
  "extra_fields": {
    "customfield_10007": "차량 대시보드"
  }
}
```

`customfield_10007` 값 = `summary` 와 동일 값 (Jira UI 에서 Epic Name = Epic summary 와 동기화).

### B17 — SG-MIS Sub-task parent_key MCP 미동작 → REST API fallback

MCP `jira_create` 로 Sub-task 생성 시 `parent_key` 필드가 무시되는 케이스 발생 (SG-MIS 일부 프로젝트). 이 경우 생성 후 `parent` 설정이 누락됨.

**fallback 절차 (§단계 6 B17):**

1. `jira_create` 응답에서 `ticket_id_created` 확인
2. 생성 후 Sub-task 의 parent 가 null 이면 → REST API `PUT /rest/api/2/issue/{issueKey}` 로 parent 재설정:

```bash
curl -s -X PUT \
  -H "Authorization: Bearer ${JIRA_TOKEN}" \
  -H "Content-Type: application/json" \
  "https://jira.smilegate.net/rest/api/2/issue/${SUBTASK_KEY}" \
  -d "{\"fields\":{\"parent\":{\"key\":\"${PARENT_KEY}\"}}}"
```

3. PUT 200 OK → `parent_linked_via: rest_api_fallback` 로 evidence 기록 (`F-TICKETSYNC-017`)
4. PUT 400/403 → `jira_link(type=subtask)` 최종 fallback + `F-TICKETSYNC-018` finding emit

## 인용

- environment bridge 결단: `decisions/DEC-2026-05-20-r20-environment-bridge.md` (issuetype_map + parent_strategy + epic_link_customfield_id)
- B14 + B15: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md`
- 운영 진입점: `skills/ticket-sync/SKILL.md` §단계 5

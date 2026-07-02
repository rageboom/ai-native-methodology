"""JIRA(Server, REST v2) tools — 검색/단건/생성/코멘트/transition + 집계(주간롤업/메타감사/에픽검증/일괄패치). 쓰기는 confirm 게이트. 자격은 config.jira() PAT Bearer."""
from __future__ import annotations

import re
from typing import Any

from . import config, http

ISSUE_TYPES = {"새기능": "11402", "개선": "11400", "버그": "10200", "작업": "10401"}
PRIORITIES = {"Minor": "4", "Major": "3", "Critical": "2", "Blocker": "1"}

# custom field (reference_jira_workflow 기준)
CF_EPIC_LINK = "customfield_10006"
CF_DUE_EXPECTED = "customfield_12547"   # 예상완료일 (전 티켓 필수)
CF_START_ACTUAL = "customfield_12548"   # 실제시작일
CF_RESOLVED_ACTUAL = "customfield_12549"  # 실제완료일
# APM 프로젝트 (메모리 출처 — first-use 검증 대상)
CF_APM_OWNER = "customfield_18023"
CF_APM_APPLIED_AT = "customfield_18205"

DONE_STATUSES = {"완료", "Done", "Closed", "Resolved", "해결됨", "닫힘"}
MASTER_EPICS = {
    "DWPD-1494": "Infisical", "DWPD-1495": "Kubernetes", "DWPD-1496": "IaC",
    "DWPD-1497": "LGTM", "DWPD-1498": "Object Storage", "DWPD-1499": "n8n",
    "DWPD-1813": "백엔드 전략과제",
}
_AGG_FIELDS = f"summary,status,assignee,duedate,resolutiondate,{CF_EPIC_LINK},{CF_DUE_EXPECTED},{CF_RESOLVED_ACTUAL}"
_TASK_RE = re.compile(r"Task\s*(\d+)")


# ---- 집계 순수 로직 (테스트 대상, 사내망 불필요) --------------------------------


def extract_task_no(summary: str) -> int | None:
    m = _TASK_RE.search(summary or "")
    return int(m.group(1)) if m else None


def is_done(status_name: str | None) -> bool:
    return status_name in DONE_STATUSES


def _status_name(issue: dict[str, Any]) -> str | None:
    return (issue.get("fields", {}).get("status") or {}).get("name")


def _assignee_name(issue: dict[str, Any]) -> str | None:
    return (issue.get("fields", {}).get("assignee") or {}).get("name")


def audit_issue(issue: dict[str, Any], checks: list[str]) -> list[str]:
    f = issue.get("fields", {})
    missing: list[str] = []
    if "epic_link" in checks and not f.get(CF_EPIC_LINK):
        missing.append("epic_link")
    if "due_date" in checks and not f.get(CF_DUE_EXPECTED):
        missing.append("due_date")
    if "resolved_date_on_done" in checks and is_done(_status_name(issue)) and not f.get(CF_RESOLVED_ACTUAL):
        missing.append("resolved_date_on_done")
    return missing


def summarize_agg(issue: dict[str, Any]) -> dict[str, Any]:
    f = issue.get("fields", {})
    return {
        "key": issue.get("key"),
        "summary": f.get("summary"),
        "status": _status_name(issue),
        "assignee": _assignee_name(issue),
        "task_no": extract_task_no(f.get("summary", "")),
        "epic": f.get(CF_EPIC_LINK),
        "resolved": f.get(CF_RESOLVED_ACTUAL) or f.get("resolutiondate"),
        "due": f.get(CF_DUE_EXPECTED),
    }


def rollup_by_epic(issues: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for issue in issues:
        epic = issue.get("fields", {}).get(CF_EPIC_LINK) or "(no-epic)"
        bucket = out.setdefault(epic, {"epic": epic, "kpi": MASTER_EPICS.get(epic), "total": 0, "done": 0, "issues": []})
        bucket["total"] += 1
        if is_done(_status_name(issue)):
            bucket["done"] += 1
        bucket["issues"].append(summarize_agg(issue))
    return out


def detect_foreign(children: list[dict[str, Any]], expected_assignee: str) -> list[dict[str, Any]]:
    return [summarize_agg(c) for c in children if _assignee_name(c) != expected_assignee]


def patch_description(current: str, marker: str, panel_body: str) -> str:
    """marker 로 감싼 기존 panel 제거 후 새 panel 을 끝에 추가 (멱등)."""
    pattern = re.compile(r"\n*\{panel:title=" + re.escape(marker) + r".*?\{panel\}\n*", re.DOTALL)
    cleaned = pattern.sub("\n", current or "").rstrip()
    block = f"{{panel:title={marker}}}\n{panel_body}\n{{panel}}"
    return f"{cleaned}\n\n{block}" if cleaned else block


def hdr(token: str, json: bool = False) -> dict[str, str]:
    h = {"Authorization": f"Bearer {token}"}
    if json:
        h["Content-Type"] = "application/json"
    return h


def issue_url(base: str, key: str) -> str:
    return f"{base}/browse/{key}"


def build_create_fields(
    summary: str,
    description: str,
    project: str,
    issuetype_id: str,
    priority_id: str,
    assignee: str | None,
    labels: list[str] | None,
) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "project": {"key": project},
        "summary": summary,
        "description": description,
        "issuetype": {"id": issuetype_id},
        "priority": {"id": priority_id},
    }
    if assignee is not None:
        fields["assignee"] = {"name": assignee}
    if labels is not None:
        fields["labels"] = labels
    return fields


def summarize_issue(issue: dict[str, Any]) -> dict[str, Any]:
    f = issue.get("fields", {})
    status = f.get("status") or {}
    assignee = f.get("assignee") or {}
    return {
        "key": issue.get("key"),
        "summary": f.get("summary"),
        "status": status.get("name"),
        "assignee": assignee.get("name"),
        "labels": f.get("labels", []),
        "duedate": f.get("duedate"),
    }


def detail_issue(issue: dict[str, Any]) -> dict[str, Any]:
    f = issue.get("fields", {})
    status = f.get("status") or {}
    assignee = f.get("assignee") or {}
    parent = f.get("parent") or {}
    desc = f.get("description") or ""
    return {
        "key": issue.get("key"),
        "summary": f.get("summary"),
        "status": status.get("name"),
        "assignee": assignee.get("name"),
        "labels": f.get("labels", []),
        "description": desc[:1000] if isinstance(desc, str) else desc,
        "duedate": f.get("duedate"),
        "parent": parent.get("key"),
    }


def register(mcp: Any) -> None:
    @mcp.tool()
    def jira_search(
        jql: str,
        max_results: int = 30,
        fields: str = "key,summary,status,assignee,labels,duedate",
    ) -> list[dict[str, Any]]:
        """JQL 검색 — jql 질의, max_results 최대건수, fields 반환필드(쉼표). 평평한 요약 리스트 반환."""
        base, token = config.jira()
        d = http.get_json(
            f"{base}/rest/api/2/search",
            params={"jql": jql, "maxResults": max_results, "fields": fields},
            headers=hdr(token),
        )
        return [summarize_issue(i) for i in d.get("issues", [])]

    @mcp.tool()
    def jira_get_issue(key: str, fields: str | None = None) -> dict[str, Any]:
        """이슈 단건 조회 — key 이슈키, fields 반환필드(쉼표, 기본 전체). 주요 필드 dict 반환."""
        base, token = config.jira()
        params: dict[str, Any] = {"expand": "names"}
        if fields:
            params["fields"] = fields
        d = http.get_json(
            f"{base}/rest/api/2/issue/{key}",
            params=params,
            headers=hdr(token),
        )
        return detail_issue(d)

    @mcp.tool()
    def jira_create_issue(
        summary: str,
        description: str,
        project: str = "DWPD",
        issuetype_id: str = "11402",
        priority_id: str = "4",
        assignee: str | None = None,
        labels: list[str] | None = None,
        confirm: bool = False,
    ) -> dict[str, Any]:
        """이슈 생성(쓰기) — summary 제목, description 본문, project 프로젝트키, issuetype_id 유형, priority_id 우선순위, assignee 담당자, labels 라벨. confirm=False 면 dry-run."""
        base, token = config.jira()
        fields = build_create_fields(summary, description, project, issuetype_id, priority_id, assignee, labels)
        payload = {"fields": fields}
        if not confirm:
            return {"dry_run": True, "payload": payload, "note": "confirm=true 로 다시 호출"}
        res = http.post_json(
            f"{base}/rest/api/2/issue",
            headers=hdr(token, json=True),
            json_body=payload,
        )
        key = res.get("key")
        return {"key": key, "url": issue_url(base, key)}

    @mcp.tool()
    def jira_add_comment(key: str, body: str, confirm: bool = False) -> dict[str, Any]:
        """코멘트 추가(쓰기) — key 이슈키, body 코멘트 본문. confirm=False 면 dry-run."""
        base, token = config.jira()
        payload = {"body": body}
        if not confirm:
            return {"dry_run": True, "payload": payload, "note": "confirm=true 로 다시 호출"}
        res = http.post_json(
            f"{base}/rest/api/2/issue/{key}/comment",
            headers=hdr(token, json=True),
            json_body=payload,
        )
        return {"created": True, "id": res.get("id"), "key": key}

    @mcp.tool()
    def jira_list_transitions(key: str) -> list[dict[str, Any]]:
        """가능한 transition 목록 — key 이슈키. [{id, name}] 반환."""
        base, token = config.jira()
        d = http.get_json(
            f"{base}/rest/api/2/issue/{key}/transitions",
            headers=hdr(token),
        )
        return [{"id": t.get("id"), "name": t.get("name")} for t in d.get("transitions", [])]

    @mcp.tool()
    def jira_transition(key: str, transition_id: str, confirm: bool = False) -> dict[str, Any]:
        """transition 실행(쓰기) — key 이슈키, transition_id 전이 ID. confirm=False 면 dry-run."""
        base, token = config.jira()
        payload = {"transition": {"id": transition_id}}
        if not confirm:
            return {"dry_run": True, "payload": payload, "note": "confirm=true 로 다시 호출"}
        http.post_json(
            f"{base}/rest/api/2/issue/{key}/transitions",
            headers=hdr(token, json=True),
            json_body=payload,
        )
        return {"transitioned": True, "key": key, "transition_id": transition_id}

    @mcp.tool()
    def jira_weekly_rollup(
        start_date: str,
        end_date: str,
        assignee: str = "dohyeonkim",
        epics: list[str] | None = None,
    ) -> dict[str, Any]:
        """기간내 완료 티켓을 epic(KPI 과제)·Task별 집계 — 주간보고 데이터소스. start_date/end_date 'YYYY-MM-DD'(실제완료일 기준), assignee 담당자, epics 에픽키 리스트(기본 마스터플랜 7개)."""
        base, token = config.jira()
        epic_list = epics or list(MASTER_EPICS)
        jql = (
            f'assignee = "{assignee}" AND "Epic Link" in ({",".join(epic_list)}) '
            f'AND resolutiondate >= "{start_date}" AND resolutiondate <= "{end_date}" ORDER BY resolutiondate'
        )
        d = http.get_json(
            f"{base}/rest/api/2/search",
            params={"jql": jql, "maxResults": 200, "fields": _AGG_FIELDS},
            headers=hdr(token),
        )
        issues = d.get("issues", [])
        return {"range": [start_date, end_date], "total_done": len(issues), "by_epic": rollup_by_epic(issues)}

    @mcp.tool()
    def jira_metadata_audit(jql: str | None = None, checks: list[str] | None = None) -> dict[str, Any]:
        """미완 티켓 메타데이터 누락 검수 — Epic Link/예상완료일/완료티켓의 실제완료일 누락 적발. jql 대상(기본 본인 미해결), checks 점검항목(epic_link/due_date/resolved_date_on_done)."""
        base, token = config.jira()
        q = jql or "project = DWPD AND assignee = currentUser() AND resolution = Unresolved"
        chk = checks or ["epic_link", "due_date", "resolved_date_on_done"]
        d = http.get_json(
            f"{base}/rest/api/2/search",
            params={"jql": q, "maxResults": 200, "fields": _AGG_FIELDS},
            headers=hdr(token),
        )
        flagged = []
        for issue in d.get("issues", []):
            missing = audit_issue(issue, chk)
            if missing:
                s = summarize_agg(issue)
                flagged.append({"key": s["key"], "summary": s["summary"], "status": s["status"], "missing": missing})
        return {"checked": len(d.get("issues", [])), "flagged_count": len(flagged), "flagged": flagged}

    @mcp.tool()
    def jira_epic_children(epic_key: str, expected_assignee: str | None = None) -> dict[str, Any]:
        """에픽 자식 티켓 진척 집계 + assignee 오염 검증. epic_key 에픽키, expected_assignee 지정 시 다른 담당자 티켓을 foreign 으로 플래그."""
        base, token = config.jira()
        d = http.get_json(
            f"{base}/rest/api/2/search",
            params={"jql": f'"Epic Link" = {epic_key}', "maxResults": 200, "fields": _AGG_FIELDS},
            headers=hdr(token),
        )
        children = d.get("issues", [])
        roll = rollup_by_epic(children).get(epic_key, {"total": 0, "done": 0, "issues": []})
        out = {
            "epic": epic_key,
            "kpi": MASTER_EPICS.get(epic_key),
            "total": roll["total"],
            "done": roll["done"],
            "issues": roll["issues"],
        }
        if expected_assignee:
            out["foreign"] = detect_foreign(children, expected_assignee)
        return out

    @mcp.tool()
    def jira_bulk_description_patch(
        jql: str,
        marker: str,
        panel_body: str,
        confirm: bool = False,
    ) -> dict[str, Any]:
        """JQL 매칭 티켓 description 에 marker panel 멱등 일괄 패치 (쓰기). jql 대상, marker panel 제목(멱등 키), panel_body wiki markup 본문. confirm=False 면 dry-run."""
        base, token = config.jira()
        d = http.get_json(
            f"{base}/rest/api/2/search",
            params={"jql": jql, "maxResults": 200, "fields": "key"},
            headers=hdr(token),
        )
        keys = [i.get("key") for i in d.get("issues", [])]
        if not confirm:
            return {"dry_run": True, "matched": keys, "count": len(keys), "note": "confirm=true 로 실행"}
        updated, failed = [], []
        for k in keys:
            cur = http.get_json(f"{base}/rest/api/2/issue/{k}", params={"fields": "description"}, headers=hdr(token))
            desc = cur.get("fields", {}).get("description") or ""
            new_desc = patch_description(desc, marker, panel_body)
            try:
                http.request(
                    "PUT",
                    f"{base}/rest/api/2/issue/{k}",
                    headers=hdr(token, json=True),
                    json_body={"fields": {"description": new_desc}},
                )
                updated.append(k)
            except http.HttpError as e:
                failed.append({"key": k, "status": e.status})
        return {"updated": updated, "failed": failed}

    @mcp.tool()
    def jira_apm_rollup(start_date: str, end_date: str, apm_owner: str = "dohyeonkim") -> dict[str, Any]:
        """APM 프로젝트 적용 티켓 집계 (주간보고 보조). cf[18023]=APM담당자/cf[18205]=APM적용일시 기준. 필드 ID 미검증 — 첫 호출 시 JQL 거부/필드 부재면 경고 반환."""
        base, token = config.jira()
        jql = f'cf[18023] = "{apm_owner}" AND cf[18205] >= "{start_date}" AND cf[18205] <= "{end_date}"'
        try:
            d = http.get_json(
                f"{base}/rest/api/2/search",
                params={"jql": jql, "maxResults": 100, "fields": f"summary,status,{CF_APM_OWNER},{CF_APM_APPLIED_AT}"},
                headers=hdr(token),
            )
        except http.HttpError as e:
            return {"error": f"APM custom field(cf[18023]/cf[18205]) 미검증 — JQL 거부(HTTP {e.status}). 실제 필드 ID 확인 필요.", "jql": jql}
        issues = d.get("issues", [])
        if issues and CF_APM_APPLIED_AT not in issues[0].get("fields", {}):
            return {"warning": f"결과에 {CF_APM_APPLIED_AT} 부재 — APM 필드 ID 재확인 필요.", "count": len(issues)}
        return {
            "range": [start_date, end_date],
            "count": len(issues),
            "issues": [
                {"key": i.get("key"), "summary": i.get("fields", {}).get("summary"),
                 "status": (i.get("fields", {}).get("status") or {}).get("name"),
                 "applied_at": i.get("fields", {}).get(CF_APM_APPLIED_AT)}
                for i in issues
            ],
        }

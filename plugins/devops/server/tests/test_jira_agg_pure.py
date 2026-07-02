from illuminati_mcp import jira


def _issue(key, status="진행 중", assignee="dohyeonkim", epic="DWPD-1495",
           summary="Task 4 GitOps 구축", resolved=None, due=None):
    fields = {
        "summary": summary,
        "status": {"name": status},
        "assignee": {"name": assignee} if assignee else None,
        jira.CF_EPIC_LINK: epic,
        jira.CF_RESOLVED_ACTUAL: resolved,
        jira.CF_DUE_EXPECTED: due,
    }
    return {"key": key, "fields": fields}


# ---- extract_task_no ----

def test_extract_task_no():
    assert jira.extract_task_no("Task 4 GitOps 구축") == 4
    assert jira.extract_task_no("Task6 LIVE 신규 환경") == 6
    assert jira.extract_task_no("[Task 12] 무언가") == 12
    assert jira.extract_task_no("에픽 정리") is None


# ---- is_done ----

def test_is_done():
    assert jira.is_done("완료") is True
    assert jira.is_done("Done") is True
    assert jira.is_done("Closed") is True
    assert jira.is_done("진행 중") is False
    assert jira.is_done(None) is False


# ---- audit_issue ----

def test_audit_done_without_resolved_date():
    issue = _issue("DWPD-1", status="완료", resolved=None, due="2026-12-01", epic="DWPD-1495")
    missing = jira.audit_issue(issue, ["resolved_date_on_done", "epic_link", "due_date"])
    assert "resolved_date_on_done" in missing
    assert "epic_link" not in missing
    assert "due_date" not in missing


def test_audit_missing_epic_and_due():
    issue = _issue("DWPD-2", status="진행 중", epic=None, due=None)
    missing = jira.audit_issue(issue, ["epic_link", "due_date"])
    assert set(missing) == {"epic_link", "due_date"}


def test_audit_clean_issue():
    issue = _issue("DWPD-3", status="진행 중", epic="DWPD-1495", due="2026-12-01")
    assert jira.audit_issue(issue, ["epic_link", "due_date", "resolved_date_on_done"]) == []


# ---- rollup_by_epic ----

def test_rollup_groups_and_counts():
    issues = [
        _issue("DWPD-1", status="완료", epic="DWPD-1495", summary="Task 4 a", resolved="2026-06-10"),
        _issue("DWPD-2", status="진행 중", epic="DWPD-1495", summary="Task 4 b"),
        _issue("DWPD-3", status="Done", epic="DWPD-1497", summary="Task 1 c", resolved="2026-06-11"),
    ]
    roll = jira.rollup_by_epic(issues)
    assert roll["DWPD-1495"]["total"] == 2
    assert roll["DWPD-1495"]["done"] == 1
    assert roll["DWPD-1497"]["done"] == 1
    # task 번호 추출 포함
    keys = {i["key"] for i in roll["DWPD-1495"]["issues"]}
    assert keys == {"DWPD-1", "DWPD-2"}


# ---- detect_foreign ----

def test_detect_foreign_assignee():
    children = [
        _issue("DWPD-10", assignee="dohyeonkim"),
        _issue("DWPD-11", assignee="kimyc"),
        _issue("DWPD-12", assignee=None),
    ]
    foreign = jira.detect_foreign(children, "dohyeonkim")
    assert [f["key"] for f in foreign] == ["DWPD-11", "DWPD-12"]


# ---- patch_description (멱등) ----

def test_patch_description_appends_when_absent():
    out = jira.patch_description("기존 본문", "📍 단계 정리", "* 현재: 4단계")
    assert "기존 본문" in out
    assert "{panel:title=📍 단계 정리}" in out
    assert "* 현재: 4단계" in out


def test_patch_description_idempotent():
    first = jira.patch_description("본문", "MARK", "* v1")
    second = jira.patch_description(first, "MARK", "* v2")
    # 블록이 하나만 존재 (멱등)
    assert second.count("{panel:title=MARK}") == 1
    assert "* v2" in second
    assert "* v1" not in second
    assert "본문" in second

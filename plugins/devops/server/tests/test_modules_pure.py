import pytest

from illuminati_mcp import confluence, github, jenkins, jira


def test_validate_repo_ok():
    assert github.validate_repo("mis/MIS-GitOps") == "mis/MIS-GitOps"


@pytest.mark.parametrize("bad", ["noslash", "a/b/c", "a b/c", "--repo x/y", ""])
def test_validate_repo_bad(bad):
    with pytest.raises(ValueError):
        github.validate_repo(bad)


# ---- jira ----

def test_build_create_fields_minimal():
    f = jira.build_create_fields("제목", "본문", "DWPD", "11402", "4", None, None)
    assert f["project"] == {"key": "DWPD"}
    assert f["issuetype"] == {"id": "11402"}
    assert "assignee" not in f
    assert "labels" not in f


def test_build_create_fields_full():
    f = jira.build_create_fields("t", "d", "DWPD", "11400", "3", "dohyeonkim", ["aiops-group"])
    assert f["assignee"] == {"name": "dohyeonkim"}
    assert f["labels"] == ["aiops-group"]


def test_summarize_issue():
    issue = {"key": "DWPD-1", "fields": {"summary": "s", "status": {"name": "할 일"},
             "assignee": {"name": "dohyeonkim"}, "labels": ["x"], "duedate": None}}
    s = jira.summarize_issue(issue)
    assert s == {"key": "DWPD-1", "summary": "s", "status": "할 일",
                 "assignee": "dohyeonkim", "labels": ["x"], "duedate": None}


def test_summarize_issue_null_assignee():
    s = jira.summarize_issue({"key": "K", "fields": {"assignee": None, "status": None}})
    assert s["assignee"] is None and s["status"] is None


def test_issue_url():
    assert jira.issue_url("https://jira.smilegate.net", "DWPD-9") == "https://jira.smilegate.net/browse/DWPD-9"


# ---- confluence ----

def test_create_payload_no_parent():
    p = confluence.create_payload("T", "<p>x</p>", "DWPDEV", None)
    assert "ancestors" not in p
    assert p["body"]["storage"]["representation"] == "storage"


def test_create_payload_with_parent():
    p = confluence.create_payload("T", "b", "DWPDEV", "123")
    assert p["ancestors"] == [{"id": "123"}]


def test_update_payload_version():
    p = confluence.update_payload("99", "T", "b", 5)
    assert p["version"] == {"number": 5}
    assert p["id"] == "99"


def test_parse_page():
    data = {"id": "1", "title": "T", "version": {"number": 3}, "body": {"storage": {"value": "<p>h</p>"}}}
    assert confluence.parse_page(data) == {"id": "1", "title": "T", "version": 3, "body_storage": "<p>h</p>"}


def test_page_url():
    assert confluence.page_url("https://wiki.smilegate.net", "700") == "https://wiki.smilegate.net/pages/viewpage.action?pageId=700"


def test_extract_title_dates():
    assert confluence.extract_title_dates("DWP팀 주간보고 2026.06.10~06.16") == ["2026.06.10", "06.16"]
    assert confluence.extract_title_dates("주간회의 6/10") == ["6/10"]
    assert confluence.extract_title_dates("제목없음") == []


def test_dedup_pages_keeps_first():
    pages = [{"id": "1", "title": "a"}, {"id": "1", "title": "a"}, {"id": "2", "title": "b"}]
    assert confluence.dedup_pages(pages) == [{"id": "1", "title": "a"}, {"id": "2", "title": "b"}]


# ---- jenkins build_and_wait helpers ----

def test_queue_item_id():
    assert jenkins.queue_item_id("https://j/queue/item/42/") == "42"
    assert jenkins.queue_item_id("https://j/queue/item/7") == "7"


def test_build_finished():
    assert jenkins.build_finished({"building": False, "result": "SUCCESS"}) is True
    assert jenkins.build_finished({"building": True, "result": None}) is False
    assert jenkins.build_finished({}) is False


# ---- jenkins ----

def test_encode_job_preserves_folder_slash():
    assert jenkins.encode_job("folder/my job") == "folder/my%20job"


def test_parse_color():
    assert jenkins.parse_color("blue") == "성공"
    assert jenkins.parse_color("red") == "실패"
    assert jenkins.parse_color("blue_anime") == "성공 (빌드중)"
    assert jenkins.parse_color(None) == "미빌드"
    assert jenkins.parse_color("unknown_color") == "unknown_color"


def test_tail_text():
    text = "\n".join(str(i) for i in range(10))
    assert jenkins.tail_text(text, 3) == "7\n8\n9"
    assert jenkins.tail_text(text, 0) == text

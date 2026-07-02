from illuminati_mcp import harbor


# ---- encode_repo -------------------------------------------------------------

def test_encode_repo_basic():
    assert harbor.encode_repo("library", "nginx") == "library/nginx"


def test_encode_repo_slash_encoded():
    # repository 의 slash 는 %2F 로 인코딩, project 도 안전문자 없이 인코딩
    assert harbor.encode_repo("mis-dev", "ep-be/tlm-api") == "mis-dev/ep-be%2Ftlm-api"


def test_encode_repo_strips_leading_project():
    # full_name (project/repo) 으로 들어오면 leading "project/" strip 후 인코딩
    assert harbor.encode_repo("library", "library/nginx") == "library/nginx"
    assert harbor.encode_repo("mis", "mis/ep-be/tlm") == "mis/ep-be%2Ftlm"


# ---- parse_artifacts ---------------------------------------------------------

def test_parse_artifacts():
    raw = [
        {
            "digest": "sha256:aaa",
            "push_time": "2026-06-10T01:00:00.000Z",
            "size": 12345,
            "tags": [{"name": "v1.0"}, {"name": "latest"}],
        },
        {
            "digest": "sha256:bbb",
            "push_time": "2026-06-11T01:00:00.000Z",
            "size": 222,
            "tags": None,
        },
    ]
    out = harbor.parse_artifacts(raw)
    assert out[0] == {
        "tags": ["v1.0", "latest"],
        "digest": "sha256:aaa",
        "push_time": "2026-06-10T01:00:00.000Z",
        "size": 12345,
    }
    assert out[1]["tags"] == []
    assert out[1]["digest"] == "sha256:bbb"


def test_parse_artifacts_empty():
    assert harbor.parse_artifacts([]) == []
    assert harbor.parse_artifacts(None) == []


# ---- latest_artifact ---------------------------------------------------------

def test_latest_artifact_by_push_time():
    arts = [
        {"digest": "a", "push_time": "2026-06-10T01:00:00Z", "tags": ["old"]},
        {"digest": "b", "push_time": "2026-06-12T01:00:00Z", "tags": ["new"]},
        {"digest": "c", "push_time": "2026-06-11T01:00:00Z", "tags": ["mid"]},
    ]
    assert harbor.latest_artifact(arts)["digest"] == "b"


def test_latest_artifact_empty():
    assert harbor.latest_artifact([]) is None
    assert harbor.latest_artifact(None) is None


def test_latest_artifact_missing_push_time():
    arts = [{"digest": "a", "tags": ["x"]}, {"digest": "b", "push_time": "2026-01-01T00:00:00Z", "tags": ["y"]}]
    # push_time 없는 항목은 최하위 정렬 — 있는 쪽이 최신
    assert harbor.latest_artifact(arts)["digest"] == "b"


# ---- build_tag_diff ----------------------------------------------------------

def test_build_tag_diff_drift():
    per_env = {
        "dev": {"digest": "sha256:aaa", "tags": ["v1.2"], "push_time": "t"},
        "stg": {"digest": "sha256:bbb", "tags": ["v1.1"], "push_time": "t"},
        "live": {"digest": "sha256:ccc", "tags": ["v1.0"], "push_time": "t"},
    }
    d = harbor.build_tag_diff("ep-be-tlm-api", per_env)
    assert d["repository"] == "ep-be-tlm-api"
    assert d["per_env"]["dev"] == {"tag": "v1.2", "digest": "sha256:aaa"}
    assert d["per_env"]["live"] == {"tag": "v1.0", "digest": "sha256:ccc"}
    assert d["drift"] is True


def test_build_tag_diff_no_drift_same_digest():
    # 태그가 달라도 digest 가 같으면 drift 아님 (digest 가 정답)
    per_env = {
        "dev": {"digest": "sha256:same", "tags": ["v1.2"], "push_time": "t"},
        "stg": {"digest": "sha256:same", "tags": ["release-candidate"], "push_time": "t"},
    }
    d = harbor.build_tag_diff("repo", per_env)
    assert d["drift"] is False


def test_build_tag_diff_missing_env():
    per_env = {
        "dev": {"digest": "sha256:aaa", "tags": ["v1.2"], "push_time": "t"},
        "live": None,
    }
    d = harbor.build_tag_diff("repo", per_env)
    assert d["per_env"]["dev"]["digest"] == "sha256:aaa"
    assert d["per_env"]["live"] == {"tag": None, "digest": None}
    # 도달/존재하는 env 가 1개뿐이면 비교 불가 → drift False
    assert d["drift"] is False


def test_build_tag_diff_no_tag():
    per_env = {"dev": {"digest": "sha256:aaa", "tags": [], "push_time": "t"}}
    d = harbor.build_tag_diff("repo", per_env)
    assert d["per_env"]["dev"] == {"tag": None, "digest": "sha256:aaa"}


# ---- summarize_scan ----------------------------------------------------------

def _report(vulns, severity=None, scanner=None):
    body = {"vulnerabilities": vulns}
    if severity:
        body["severity"] = severity
    if scanner:
        body["scanner"] = scanner
    return {harbor.VULN_MIME: body}


def test_summarize_scan_counts_and_fixable():
    rep = _report(
        [
            {"severity": "Critical", "fix_version": "1.2.3"},
            {"severity": "High"},
            {"severity": "High", "fix_version": "2.0"},
            {"severity": "Low"},
        ],
        scanner={"name": "Trivy", "version": "0.50"},
    )
    s = harbor.summarize_scan(rep)
    assert s["scanned"] is True
    assert s["total"] == 4
    assert s["fixable"] == 2
    assert s["counts"] == {"Critical": 1, "High": 2, "Low": 1}
    # severity 명시 없으면 overall fallback = 가장 높은 등급
    assert s["severity"] == "Critical"


def test_summarize_scan_explicit_severity():
    rep = _report([{"severity": "Medium"}], severity="High")
    s = harbor.summarize_scan(rep)
    assert s["severity"] == "High"


def test_summarize_scan_missing_severity_defaults_unknown():
    rep = _report([{}, {}])
    s = harbor.summarize_scan(rep)
    assert s["counts"] == {"Unknown": 2}
    assert s["severity"] == "None"  # overall fallback: no Critical/High/Medium/Low


def test_summarize_scan_fallback_first_value():
    # VULN_MIME 키가 없으면 첫 value 사용
    rep = {"other-mime": {"vulnerabilities": [{"severity": "High"}]}}
    s = harbor.summarize_scan(rep)
    assert s["total"] == 1
    assert s["counts"] == {"High": 1}


def test_summarize_scan_not_scanned_none():
    s = harbor.summarize_scan(None)
    assert s["scanned"] is False
    assert "note" in s


def test_summarize_scan_not_scanned_empty():
    assert harbor.summarize_scan({})["scanned"] is False
    assert harbor.summarize_scan({harbor.VULN_MIME: None})["scanned"] is False


# ---- _overall_severity -------------------------------------------------------

def test_overall_severity_ordering():
    assert harbor._overall_severity({"Low": 1, "High": 1}) == "High"
    assert harbor._overall_severity({"Medium": 3}) == "Medium"
    assert harbor._overall_severity({"Unknown": 5}) == "None"
    assert harbor._overall_severity({}) == "None"

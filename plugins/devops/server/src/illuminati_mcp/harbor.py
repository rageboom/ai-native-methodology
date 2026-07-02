"""Harbor v2 REST tools — 환경별(DEV/STG/LIVE) artifact 목록·태그 승격 diff·Trivy 스캔 요약.

로컬 네트워크 도달은 미검증 — 순수 파싱 로직만 테스트됨, HTTP 호출은 사내망에서 확인 필요.
"""
from __future__ import annotations

from typing import Any
from urllib.parse import quote

from . import config, http

# ---- 순수 로직 (테스트 대상, 사내망 불필요) ----------------------------------

# Harbor vulnerability report media type (v1.1) — harbor_client.py 이식
VULN_MIME = "application/vnd.security.vulnerability.report; version=1.1"

_SEVERITY_ORDER = ("Critical", "High", "Medium", "Low")


def encode_repo(project: str, repository: str) -> str:
    """project/repository 를 Harbor API path 로 인코딩. repo slash→%2F, full_name 이면 leading project strip."""
    repo = repository
    prefix = f"{project}/"
    if repo.startswith(prefix):
        repo = repo[len(prefix):]
    return f"{quote(project, safe='')}/{quote(repo, safe='')}"


def parse_artifacts(raw: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    """artifact 목록 JSON → [{tags, digest, push_time, size}]."""
    out: list[dict[str, Any]] = []
    for a in raw or []:
        tags = [t.get("name") for t in (a.get("tags") or []) if t.get("name")]
        out.append({
            "tags": tags,
            "digest": a.get("digest"),
            "push_time": a.get("push_time"),
            "size": a.get("size"),
        })
    return out


def latest_artifact(artifacts: list[dict[str, Any]] | None) -> dict[str, Any] | None:
    """push_time 기준 최신 artifact. push_time 없으면 최하위."""
    items = artifacts or []
    if not items:
        return None
    return max(items, key=lambda a: a.get("push_time") or "")


def build_tag_diff(repository: str, per_env: dict[str, dict[str, Any] | None]) -> dict[str, Any]:
    """env 별 최신 artifact → 승격 격차. digest 가 갈리면 drift=True (태그 같아도 재push 시 digest 다름)."""
    rows: dict[str, dict[str, Any]] = {}
    digests: list[str] = []
    for env, art in per_env.items():
        if not art:
            rows[env] = {"tag": None, "digest": None}
            continue
        tags = art.get("tags") or []
        digest = art.get("digest")
        rows[env] = {"tag": tags[0] if tags else None, "digest": digest}
        if digest:
            digests.append(digest)
    drift = len(set(digests)) > 1
    return {"repository": repository, "per_env": rows, "drift": drift}


def summarize_scan(report: dict[str, Any] | None) -> dict[str, Any]:
    """Trivy vuln report 정규화 → {scanned, severity, total, fixable, counts}. 미완료는 graceful."""
    if not report:
        return {"scanned": False, "note": "스캔 결과 없음 (미스캔 또는 404)"}
    body = report.get(VULN_MIME) or next(iter(report.values()), None)
    if not body:
        return {"scanned": False, "note": "vulnerability report 본문 없음"}
    vulns: list[dict[str, Any]] = body.get("vulnerabilities") or []
    counts: dict[str, int] = {}
    fixable = 0
    for v in vulns:
        sev = v.get("severity") or "Unknown"
        counts[sev] = counts.get(sev, 0) + 1
        if v.get("fix_version"):
            fixable += 1
    scanner = body.get("scanner") or {}
    return {
        "scanned": True,
        "severity": body.get("severity") or _overall_severity(counts),
        "total": len(vulns),
        "fixable": fixable,
        "counts": counts,
        "scanner_name": scanner.get("name", "Trivy"),
        "scanner_version": scanner.get("version", "unknown"),
    }


def _overall_severity(counts: dict[str, int]) -> str:
    for level in _SEVERITY_ORDER:
        if counts.get(level, 0) > 0:
            return level
    return "None"


# ---- HTTP helper -------------------------------------------------------------

def _artifacts_url(base: str, project: str, repository: str) -> str:
    return f"{base}/api/v2.0/projects/{encode_repo(project, repository)}/artifacts"


def _fetch_artifacts(env: str, project: str, repository: str, limit: int) -> list[dict[str, Any]]:
    url, user, password = config.harbor(env)
    params = {"page_size": limit, "with_tag": "true", "sort": "-push_time"}
    raw = http.get_json(_artifacts_url(url, project, repository), auth=(user, password), params=params)
    return parse_artifacts(raw)


# ---- tool 등록 ---------------------------------------------------------------

def register(mcp: Any) -> None:
    @mcp.tool()
    def harbor_list_artifacts(env: str, project: str, repository: str, limit: int = 20) -> list[dict[str, Any]]:
        """환경별 Harbor repo 의 artifact 목록(tag/digest/push_time/size). env=dev|stg|live, project=프로젝트, repository=repo 명, limit=최대 개수."""
        return _fetch_artifacts(env, project, repository, limit)

    @mcp.tool()
    def harbor_image_tag_diff(repository: str, project: str, envs: list[str] | None = None) -> dict[str, Any]:
        """같은 repository 의 dev/stg/live Harbor 최신 태그·digest 비교 → 승격 격차. repository=repo 명, project=프로젝트, envs=비교 환경(기본 dev/stg/live). digest 가 갈리면 drift."""
        envs = envs or ["dev", "stg", "live"]
        per_env: dict[str, dict[str, Any] | None] = {}
        for env in envs:
            try:
                arts = _fetch_artifacts(env, project, repository, 20)
                per_env[env] = latest_artifact(arts)
            except Exception:
                per_env[env] = None
        return build_tag_diff(repository, per_env)

    @mcp.tool()
    def harbor_artifact_scan(env: str, project: str, repository: str, reference: str) -> dict[str, Any]:
        """특정 artifact 의 Trivy 취약점 요약. env=dev|stg|live, project=프로젝트, repository=repo 명, reference=tag 또는 digest. 미스캔은 graceful."""
        url, user, password = config.harbor(env)
        scan_url = (
            f"{url}/api/v2.0/projects/{encode_repo(project, repository)}"
            f"/artifacts/{quote(reference, safe='')}/additions/vulnerabilities"
        )
        try:
            report = http.get_json(scan_url, auth=(user, password), headers={"Accept": VULN_MIME})
        except http.HttpError as e:
            if e.status == 404:
                return {"scanned": False, "note": "스캔 결과 없음 (404)"}
            raise
        return summarize_scan(report)

"""Jenkins tools — job 목록/상태/콘솔로그 조회 + 빌드 트리거(쓰기, confirm 게이트).

단일 JENKINS_URL 사용. 환경별 분리(DEV/STG/LIVE Jenkins)는 추후.
"""
from __future__ import annotations

import time
import urllib.parse
from typing import Any

from . import config, http

# ---- 순수 로직 (테스트 대상, 사내망 불필요) ----------------------------------

_COLOR_MAP = {
    "blue": "성공",
    "red": "실패",
    "yellow": "불안정",
    "aborted": "중단",
    "disabled": "비활성",
    "notbuilt": "미빌드",
}


def encode_job(job: str) -> str:
    return urllib.parse.quote(job, safe="/")


def parse_color(color: str | None) -> str:
    if not color:
        return "미빌드"
    base = color[:-len("_anime")] if color.endswith("_anime") else color
    state = _COLOR_MAP.get(base, base)
    return f"{state} (빌드중)" if color.endswith("_anime") else state


def tail_text(text: str, tail_lines: int) -> str:
    lines = text.splitlines()
    return "\n".join(lines[-tail_lines:]) if tail_lines > 0 else text


def queue_item_id(queue_url: str) -> str:
    return queue_url.rstrip("/").rsplit("/", 1)[-1]


def build_finished(build_json: dict[str, Any]) -> bool:
    return build_json.get("building") is False and build_json.get("result") is not None


# ---- HTTP helper -------------------------------------------------------------

def _job_url(base: str, job: str) -> str:
    return f"{base}/job/{encode_job(job)}"


def _crumb(base: str, auth: tuple[str, str]) -> dict[str, str]:
    try:
        d = http.get_json(f"{base}/crumbIssuer/api/json", auth=auth)
        field, value = d.get("crumbRequestField"), d.get("crumb")
        return {field: value} if field and value else {}
    except Exception:
        return {}


# ---- tool 등록 ---------------------------------------------------------------

def register(mcp: Any) -> None:
    @mcp.tool()
    def jenkins_list_jobs(name_filter: str | None = None, env: str = "dev") -> list[dict[str, Any]]:
        """Jenkins job 목록 조회. name_filter 부분일치(대소문자 무시), env=dev|stg|live (환경별 Jenkins 분리)."""
        base, user, token = config.jenkins(env)
        d = http.get_json(f"{base}/api/json", auth=(user, token), params={"tree": "jobs[name,color,url]"})
        out = []
        for j in d.get("jobs", []):
            name = j.get("name", "")
            if name_filter and name_filter.lower() not in name.lower():
                continue
            out.append({"name": name, "state": parse_color(j.get("color")), "url": j.get("url")})
        return out

    @mcp.tool()
    def jenkins_job_status(job: str, env: str = "dev") -> dict[str, Any]:
        """job 1건의 최근 빌드 상태 조회. job=job 명, env=dev|stg|live."""
        base, user, token = config.jenkins(env)
        d = http.get_json(
            f"{_job_url(base, job)}/api/json",
            auth=(user, token),
            params={"tree": "name,color,lastBuild[number,result,timestamp,building,url]"},
        )
        lb = d.get("lastBuild") or {}
        return {
            "name": d.get("name"),
            "state": parse_color(d.get("color")),
            "last_build": {
                "number": lb.get("number"),
                "result": lb.get("result"),
                "building": lb.get("building"),
            },
        }

    @mcp.tool()
    def jenkins_last_build_log(job: str, tail_lines: int = 120, env: str = "dev") -> str:
        """job 마지막 빌드 콘솔로그의 마지막 N줄. job=job 명, tail_lines=줄 수, env=dev|stg|live."""
        base, user, token = config.jenkins(env)
        r = http.request("GET", f"{_job_url(base, job)}/lastBuild/consoleText", auth=(user, token))
        return tail_text(r.text, tail_lines)

    @mcp.tool()
    def jenkins_trigger_build(
        job: str, params: dict[str, str] | None = None, confirm: bool = False, env: str = "dev"
    ) -> dict[str, Any]:
        """빌드 트리거 (쓰기). job=job 명, params=빌드 파라미터(KEY=VAL), env=dev|stg|live. confirm=False 면 dry-run."""
        base, user, token = config.jenkins(env)
        auth = (user, token)
        url = f"{_job_url(base, job)}/buildWithParameters" if params else f"{_job_url(base, job)}/build"
        payload: dict[str, Any] = {"url": url, "params": params or {}}
        if not confirm:
            return {"dry_run": True, "payload": payload, "note": "confirm=true 로 다시 호출"}
        headers = _crumb(base, auth)
        # buildWithParameters 는 파라미터를 query string 으로 받음 (form body 면 무시됨)
        http.request("POST", url, auth=auth, headers=headers or None, params=params or None)
        return {"queued": True, "job_url": _job_url(base, job)}

    @mcp.tool()
    def jenkins_build_and_wait(
        job: str,
        params: dict[str, str] | None = None,
        wait_timeout: int = 300,
        poll_interval: int = 5,
        confirm: bool = False,
        env: str = "dev",
    ) -> dict[str, Any]:
        """빌드 트리거 → 큐→빌드번호 해소 → 완료까지 폴링 → 결과+로그 tail 한 번에 (쓰기). wait_timeout 최대대기초, poll_interval 폴링초, env=dev|stg|live. confirm=False 면 dry-run."""
        base, user, token = config.jenkins(env)
        auth = (user, token)
        url = f"{_job_url(base, job)}/buildWithParameters" if params else f"{_job_url(base, job)}/build"
        if not confirm:
            return {"dry_run": True, "payload": {"url": url, "params": params or {}}, "note": "confirm=true 로 실행"}
        r = http.request("POST", url, auth=auth, headers=_crumb(base, auth) or None, params=params or None)
        queue_url = r.headers.get("Location")
        deadline = time.monotonic() + wait_timeout
        build_number = None
        if queue_url:
            qid = queue_item_id(queue_url)
            while time.monotonic() < deadline:
                ex = http.get_json(f"{base}/queue/item/{qid}/api/json", auth=auth).get("executable")
                if ex:
                    build_number = ex.get("number")
                    break
                time.sleep(poll_interval)
        if not build_number:
            return {"queued": True, "build_number": None, "note": "큐 대기 중 — 빌드 미시작(timeout)"}
        while time.monotonic() < deadline:
            b = http.get_json(f"{_job_url(base, job)}/{build_number}/api/json", auth=auth, params={"tree": "building,result"})
            if build_finished(b):
                log = http.request("GET", f"{_job_url(base, job)}/{build_number}/consoleText", auth=auth).text
                return {"build_number": build_number, "result": b.get("result"), "log_tail": tail_text(log, 60)}
            time.sleep(poll_interval)
        return {"build_number": build_number, "result": "TIMEOUT", "note": f"{wait_timeout}s 내 미완료"}

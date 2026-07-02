"""GHE(github.smilegate.net) tools — gh CLI subprocess 래퍼. PR 조회/diff/검색 + 코멘트(쓰기, confirm 게이트)."""
from __future__ import annotations

import json
import os
import re
import subprocess
from typing import Any

GH_HOST = "github.smilegate.net"
_REPO_RE = re.compile(r"^[\w.-]+/[\w.-]+$")
_STATES = {"open", "closed", "merged", "all"}


def validate_repo(repo: str) -> str:
    if not _REPO_RE.match(repo):
        raise ValueError(f"repo 형식은 'owner/name' 이어야 합니다: {repo!r}")
    return repo


def _gh(args: list[str], capture_json: bool = False) -> Any:
    r = subprocess.run(
        ["gh", *args],
        env={**os.environ, "GH_HOST": GH_HOST},
        capture_output=True,
        text=True,
        timeout=30,
    )
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip()[:300])
    return json.loads(r.stdout) if capture_json else r.stdout


def register(mcp: Any) -> None:
    @mcp.tool()
    def github_list_prs(repo: str, state: str = "open", limit: int = 20) -> list[dict[str, Any]]:
        """GHE PR 목록 — repo='owner/name', state='open'|'closed'|'merged'|'all', limit 개수."""
        validate_repo(repo)
        if state not in _STATES:
            raise ValueError(f"state 는 {sorted(_STATES)} 중 하나여야 합니다: {state!r}")
        return _gh(
            ["pr", "list", "--repo", repo, "--state", state, "--limit", str(limit),
             "--json", "number,title,author,headRefName,url"],
            capture_json=True,
        )

    @mcp.tool()
    def github_pr_view(repo: str, number: int) -> dict[str, Any]:
        """GHE PR 상세 — repo='owner/name', number=PR 번호. 제목/본문/상태/파일목록 반환."""
        validate_repo(repo)
        return _gh(
            ["pr", "view", str(int(number)), "--repo", repo,
             "--json", "number,title,body,state,author,files,url"],
            capture_json=True,
        )

    @mcp.tool()
    def github_pr_diff(repo: str, number: int, max_chars: int = 20000) -> str:
        """GHE PR diff 텍스트 — repo='owner/name', number=PR 번호, max_chars 초과 시 truncate."""
        validate_repo(repo)
        out = _gh(["pr", "diff", str(int(number)), "--repo", repo])
        return out[:max_chars] + "...(truncated)" if len(out) > max_chars else out

    @mcp.tool()
    def github_search_prs(repo: str, query: str, limit: int = 20) -> list[dict[str, Any]]:
        """GHE PR 검색 — repo='owner/name', query=검색문자열, limit 개수."""
        validate_repo(repo)
        # query 는 -- 뒤 positional 로 — 사용자 입력이 gh 플래그로 해석되는 것 차단
        return _gh(
            ["search", "prs", "--repo", repo, "--limit", str(limit),
             "--json", "number,title,url,state", "--", query],
            capture_json=True,
        )

    @mcp.tool()
    def github_pr_comment(repo: str, number: int, body: str, confirm: bool = False) -> dict[str, Any]:
        """GHE PR 코멘트 작성 (쓰기) — repo='owner/name', number=PR 번호, body=코멘트. confirm=False 면 dry-run."""
        validate_repo(repo)
        if not confirm:
            return {"dry_run": True, "payload": {"repo": repo, "number": number, "body": body}, "note": "confirm=true 로 다시 호출"}
        out = _gh(["pr", "comment", str(int(number)), "--repo", repo, "--body", body])
        return {"commented": True, "output": out.strip()}

    @mcp.tool()
    def github_pr_create(
        repo: str,
        base: str,
        head: str,
        title: str,
        body: str = "",
        confirm: bool = False,
    ) -> dict[str, Any]:
        """GHE PR 생성 (쓰기) — repo='owner/name', base 머지대상 브랜치, head 소스 브랜치, title 제목, body 본문. confirm=False 면 dry-run."""
        validate_repo(repo)
        if not confirm:
            return {"dry_run": True, "payload": {"repo": repo, "base": base, "head": head, "title": title}, "note": "confirm=true 로 다시 호출"}
        out = _gh(["pr", "create", "--repo", repo, "--base", base, "--head", head, "--title", title, "--body", body])
        return {"created": True, "url": out.strip()}

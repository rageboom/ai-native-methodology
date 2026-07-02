"""Confluence(wiki.smilegate.net) tools — CQL 검색, 페이지 조회/생성/수정.

read 도구 + create/update(쓰기, confirm 게이트). 자격은 config.confluence() Bearer.
"""
from __future__ import annotations

import re
from typing import Any

from . import config, http

WEEKLY_TITLE_PATTERNS = ["주간보고", "주간회의"]
_DATE_RE = re.compile(r"\d{1,4}[.\-/]\d{1,2}(?:[.\-/]\d{1,2})?")

# ---- 순수 로직 (테스트 대상, 사내망 불필요) ----------------------------------


def rest(base: str, path: str) -> str:
    return f"{base}/rest/api{path}"


def extract_title_dates(title: str) -> list[str]:
    return _DATE_RE.findall(title or "")


def dedup_pages(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for p in pages:
        pid = p.get("id")
        if pid in seen:
            continue
        seen.add(pid)
        out.append(p)
    return out


def page_url(base: str, page_id: str) -> str:
    return f"{base}/pages/viewpage.action?pageId={page_id}"


def hdr(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def search_results(data: dict[str, Any]) -> list[dict[str, Any]]:
    return [{"id": r.get("id"), "title": r.get("title"), "type": r.get("type")} for r in data.get("results", [])]


def child_results(data: dict[str, Any]) -> list[dict[str, Any]]:
    return [{"id": r.get("id"), "title": r.get("title")} for r in data.get("results", [])]


def parse_page(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": data.get("id"),
        "title": data.get("title"),
        "version": data.get("version", {}).get("number"),
        "body_storage": data.get("body", {}).get("storage", {}).get("value", ""),
    }


def create_payload(title: str, body_storage: str, space: str, parent_id: str | None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "type": "page",
        "title": title,
        "space": {"key": space},
        "body": {"storage": {"value": body_storage, "representation": "storage"}},
    }
    if parent_id:
        payload["ancestors"] = [{"id": parent_id}]
    return payload


def update_payload(page_id: str, title: str, body_storage: str, next_version: int) -> dict[str, Any]:
    return {
        "id": page_id,
        "type": "page",
        "title": title,
        "version": {"number": next_version},
        "body": {"storage": {"value": body_storage, "representation": "storage"}},
    }


# ---- tool 등록 ---------------------------------------------------------------


def register(mcp: Any) -> None:
    @mcp.tool()
    def confluence_search(cql: str, limit: int = 25) -> list[dict[str, Any]]:
        """Confluence CQL 검색 — cql=쿼리(예: 'space=DWPDEV and title~"주간보고"'), limit=최대 건수."""
        base, token = config.confluence()
        d = http.get_json(rest(base, "/content/search"), headers=hdr(token), params={"cql": cql, "limit": limit})
        return search_results(d)

    @mcp.tool()
    def confluence_get_page(page_id: str) -> dict[str, Any]:
        """Confluence 단건 조회 — page_id 의 제목/버전/storage 본문 반환."""
        base, token = config.confluence()
        d = http.get_json(
            rest(base, f"/content/{page_id}"),
            headers=hdr(token),
            params={"expand": "body.storage,version,ancestors"},
        )
        return parse_page(d)

    @mcp.tool()
    def confluence_list_children(page_id: str, limit: int = 100) -> list[dict[str, Any]]:
        """Confluence 자식 페이지 목록 — page_id 하위 페이지의 id/title, limit=최대 건수."""
        base, token = config.confluence()
        d = http.get_json(rest(base, f"/content/{page_id}/child/page"), headers=hdr(token), params={"limit": limit})
        return child_results(d)

    @mcp.tool()
    def confluence_create_page(
        title: str,
        body_storage: str,
        space: str = "DWPDEV",
        parent_id: str | None = None,
        confirm: bool = False,
    ) -> dict[str, Any]:
        """Confluence 페이지 생성 (쓰기) — title/storage본문/space/parent_id. confirm=False 면 dry-run."""
        base, token = config.confluence()
        payload = create_payload(title, body_storage, space, parent_id)
        if not confirm:
            return {"dry_run": True, "payload": payload, "note": "confirm=true 로 다시 호출"}
        res = http.post_json(
            rest(base, "/content"),
            headers={**hdr(token), "Content-Type": "application/json"},
            json_body=payload,
        )
        return {"id": res.get("id"), "url": page_url(base, res.get("id"))}

    @mcp.tool()
    def confluence_update_page(
        page_id: str,
        body_storage: str,
        title: str | None = None,
        confirm: bool = False,
    ) -> dict[str, Any]:
        """Confluence 페이지 수정 (쓰기) — 현재 버전+1 적용. title 미지정 시 기존 유지. confirm=False 면 dry-run."""
        base, token = config.confluence()
        cur = http.get_json(
            rest(base, f"/content/{page_id}"),
            headers=hdr(token),
            params={"expand": "body.storage,version,ancestors"},
        )
        next_version = (cur.get("version", {}).get("number") or 0) + 1
        eff_title = title if title is not None else cur.get("title", "")
        payload = update_payload(page_id, eff_title, body_storage, next_version)
        if not confirm:
            return {"dry_run": True, "payload": payload, "note": "confirm=true 로 다시 호출"}
        try:
            res = http.request(
                "PUT",
                rest(base, f"/content/{page_id}"),
                headers={**hdr(token), "Content-Type": "application/json"},
                json_body=payload,
            ).json()
        except http.HttpError as e:
            if e.status == 409:
                return {"error": "버전 충돌 — 페이지가 그사이 수정됨. 다시 호출하세요."}
            raise
        return {"id": res.get("id"), "url": page_url(base, res.get("id")), "version": next_version}

    @mcp.tool()
    def confluence_weekly_page_resolve(space: str = "DWPDEV", title_patterns: list[str] | None = None) -> dict[str, Any]:
        """주간보고 페이지 해소 — '주간보고'/'주간회의' 두 패턴을 CQL 검색(최신순)해 후보·최신 페이지 id/title/날짜 반환. 페이지 ID 추정 사고 방지."""
        base, token = config.confluence()
        pats = title_patterns or WEEKLY_TITLE_PATTERNS
        collected: list[dict[str, Any]] = []
        for p in pats:
            cql = f'space = {space} and title ~ "{p}" order by created desc'
            d = http.get_json(rest(base, "/content/search"), headers=hdr(token), params={"cql": cql, "limit": 5})
            collected.extend(search_results(d))
        candidates = dedup_pages(collected)
        for c in candidates:
            c["dates"] = extract_title_dates(c.get("title", ""))
            c["url"] = page_url(base, c.get("id"))
        return {"latest": candidates[0] if candidates else None, "candidates": candidates}

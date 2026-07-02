"""로컬 서버 인벤토리 마크다운(MIS-DevOps/document/inventory)을 구조화 조회.

server-{dev,stg,live}.md 의 `## 섹션` 별 Hostname/IP/Spec/Services/Port 표를 파싱.
compose-v2-server-topology.md 가 있으면 server↔app 매핑을 조인. read-only.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from . import config

# ---- 순수 로직 (테스트 대상, 파일 의존 없음) ---------------------------------

_LAST_UPDATED = re.compile(r"Last updated:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})")
_HEADING = re.compile(r"^##\s+(.*?)\s*$")


def parse_last_updated(text: str) -> str | None:
    m = _LAST_UPDATED.search(text)
    return m.group(1) if m else None


def _split_cells(line: str) -> list[str]:
    return [c.strip() for c in line.strip().strip("|").split("|")]


def _is_divider(line: str) -> bool:
    return bool(re.fullmatch(r"\s*\|?[\s:|-]+\|?\s*", line)) and "-" in line


def parse_inventory_md(text: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    section = ""
    header: list[str] | None = None
    for line in text.splitlines():
        h = _HEADING.match(line)
        if h:
            section, header = h.group(1), None
            continue
        if "|" not in line:
            header = None
            continue
        if _is_divider(line):
            continue
        cells = _split_cells(line)
        cols = [c.lower() for c in cells]
        if "hostname" in cols:
            header = cols
            continue
        if header is None or "hostname" not in header:
            continue
        row = dict(zip(header, cells))
        if not row.get("hostname"):
            continue
        row["section"] = section
        rows.append(row)
    return rows


def filter_rows(rows: list[dict[str, str]], flt: str | None) -> list[dict[str, str]]:
    if not flt or not flt.strip():
        return rows
    needle = flt.strip().lower()
    out = []
    for r in rows:
        haystack = " ".join(str(v) for v in r.values()).lower()
        if needle in haystack:
            out.append(r)
    return out


def parse_topology(text: str, env: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in text.splitlines():
        if "|" not in line or _is_divider(line):
            continue
        cells = _split_cells(line)
        if len(cells) < 4 or cells[0].lower() == "환경":
            continue
        env_cell, server, _tier, apps = cells[0], cells[1], cells[2], cells[3]
        if env_cell.lower() == env.lower() and server:
            out[server] = apps
    return out


def join_apps(rows: list[dict[str, str]], topo: dict[str, str]) -> list[dict[str, str]]:
    out = []
    for r in rows:
        merged = dict(r)
        apps = topo.get(r.get("hostname", ""))
        if apps is not None:
            merged["apps"] = apps
        out.append(merged)
    return out


# ---- 파일 접근 ---------------------------------------------------------------

def _inventory_dir() -> Path:
    return config.repo("MIS-DevOps") / "document" / "inventory"


def _source_file(env: str) -> Path:
    return _inventory_dir() / f"server-{env}.md"


# ---- tool 등록 ---------------------------------------------------------------

def register(mcp: Any) -> None:
    @mcp.tool()
    def inventory_query(env: str, filter: str | None = None) -> dict[str, Any]:
        """로컬 서버 인벤토리 조회 (read-only).

        env=dev|stg|live → server-<env>.md 파싱.
        filter=hostname/ip/service/section 부분일치(대소문자 무시). 없으면 전체.
        compose-v2-server-topology.md 가 있으면 server↔app(apps 필드) 조인.
        반환: {env, source_file, last_updated, rows, count}.
        """
        if env not in ("dev", "stg", "live"):
            raise ValueError(f"env 는 dev|stg|live: {env!r}")
        src = _source_file(env)
        if not src.exists():
            raise FileNotFoundError(f"인벤토리 파일 없음: {src}")
        text = src.read_text(encoding="utf-8")
        rows = parse_inventory_md(text)

        topo_file = _inventory_dir() / "compose-v2-server-topology.md"
        if topo_file.exists():
            topo = parse_topology(topo_file.read_text(encoding="utf-8"), env)
            rows = join_apps(rows, topo)

        rows = filter_rows(rows, filter)
        return {
            "env": env,
            "source_file": str(src),
            "last_updated": parse_last_updated(text),
            "rows": rows,
            "count": len(rows),
        }

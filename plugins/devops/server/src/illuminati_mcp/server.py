"""illuminati MCP 엔트리포인트 — FastMCP 인스턴스 + 도메인 모듈 등록 (stdio)."""
from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from . import (
    backend,
    config,
    confluence,
    frontend,
    github,
    gitops,
    grafana,
    harbor,
    inventory,
    jenkins,
    jira,
)


def build() -> FastMCP:
    config.load_env()
    mcp = FastMCP("illuminati")
    grafana.register(mcp)
    jira.register(mcp)
    confluence.register(mcp)
    jenkins.register(mcp)
    github.register(mcp)
    backend.register(mcp)
    frontend.register(mcp)
    gitops.register(mcp)
    harbor.register(mcp)
    inventory.register(mcp)
    return mcp


def main() -> None:
    build().run()


if __name__ == "__main__":
    main()

#!/bin/bash
# illuminati MCP launcher — devops 플러그인 동봉. 실서버(infra-ops-mcp console script)는 MIS-DevOps 소유.
# 목표: 사용자는 개인 토큰/계정만 쉘에 export 하면 동작 (URL 기본값 제공 + 첫 실행 venv 자동 부트스트랩).
# no-op 조건(전부 조용히 종료해 세션을 깨지 않음):
#   (1) ILLUMINATI_DISABLE=1 opt-out
#   (2) user-scope(~/.claude.json)에 illuminati 또는 구명 infra-ops 등록 존재 — 중복 인스턴스 방지
#   (3) MIS-DevOps 미클론 / venv 부트스트랩 실패 — stderr 힌트만 남김
WS="$1"

[ "$ILLUMINATI_DISABLE" = "1" ] && exit 0

if command -v jq >/dev/null 2>&1 && jq -e '.mcpServers["illuminati"] // .mcpServers["infra-ops"]' "$HOME/.claude.json" >/dev/null 2>&1; then
    exit 0
fi

SRC="$WS/MIS-DevOps/platform-automation/mcp/infra-ops"
BIN="$SRC/.venv/bin/infra-ops-mcp"

# 회사 공통 URL 기본값 — 이미 export 된 값은 절대 덮지 않는다.
# 서버도 .env 를 os.environ.setdefault 로만 읽으므로 우선순위: 쉘 env > 여기 기본값 > platform-automation/.env
: "${GRAFANA_URL:=http://mis-manage.smilegate.net:3000}"
: "${GRAFANA_DEV_URL:=https://dev-mis-grafana.smiledev.net}"
: "${JIRA_URL:=https://jira.smilegate.net}"
: "${CONFLUENCE_URL:=https://wiki.smilegate.net}"
: "${JENKINS_URL:=https://mis-jenkins.smilegate.net}"
export GRAFANA_URL GRAFANA_DEV_URL JIRA_URL CONFLUENCE_URL JENKINS_URL

if [ ! -x "$BIN" ]; then
    if [ -f "$SRC/pyproject.toml" ] && command -v python3 >/dev/null 2>&1; then
        echo "[illuminati] first run — venv bootstrap 중 (수십 초, 타임아웃 시 /mcp 재연결 또는 다음 세션에 자동 완료)" >&2
        (cd "$SRC" && python3 -m venv .venv && ./.venv/bin/pip install -q -e .) >&2 \
            || { echo "[illuminati] bootstrap 실패 — 수동 설치는 plugins/devops/README.md 'MCP' 절" >&2; exit 0; }
    else
        echo "[illuminati] $SRC 없음 — workspace_root 에 MIS-DevOps 를 clone 해야 한다" >&2
        exit 0
    fi
fi

exec "$BIN"

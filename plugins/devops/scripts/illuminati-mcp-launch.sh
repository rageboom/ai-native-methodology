#!/bin/bash
# illuminati MCP launcher — 서버 소스를 플러그인이 동봉(server/). 팀원은 플러그인 설치 + 개인 토큰 export 만으로 동작.
# 다른 레포 clone 불필요 — venv 는 CLAUDE_PLUGIN_DATA(플러그인 업데이트에도 유지)에 만들고, 서버 버전이 바뀌면 자동 재설치.
# no-op 조건(전부 조용히 종료해 세션을 깨지 않음):
#   (1) ILLUMINATI_DISABLE=1 opt-out
#   (2) user-scope(~/.claude.json)에 illuminati 또는 구명 infra-ops 등록 존재 — 중복 인스턴스 방지
#   (3) python3 없음 / venv 부트스트랩 실패 — stderr 힌트만 남김
WS="$1"
DATA="$2"

[ "$ILLUMINATI_DISABLE" = "1" ] && exit 0

if command -v jq >/dev/null 2>&1 && jq -e '.mcpServers["illuminati"] // .mcpServers["infra-ops"]' "$HOME/.claude.json" >/dev/null 2>&1; then
    exit 0
fi

# 동봉 서버 소스 — launcher 위치 기준 self-locating (플러그인 캐시/로컬 symlink 어디서든 동작)
SRC="$(cd "$(dirname "$0")/../server" && pwd)"
# CLAUDE_PLUGIN_DATA 미치환/빈값 폴백
case "$DATA" in ''|'${'*) DATA="$HOME/.claude/plugin-data/devops" ;; esac
VENV="$DATA/illuminati-venv"
BIN="$VENV/bin/illuminati-mcp"
VER="$(grep -m1 '^version' "$SRC/pyproject.toml" | cut -d'"' -f2)"
MARK="$DATA/illuminati-venv.version"

# 회사 공통 URL 기본값 — 이미 export 된 값은 절대 덮지 않는다.
# 서버도 .env 를 os.environ.setdefault 로만 읽으므로 우선순위: 쉘 env > 여기 기본값 > (있다면) MIS-DevOps .env
: "${GRAFANA_URL:=http://mis-manage.smilegate.net:3000}"
: "${GRAFANA_STG_URL:=https://stg-mis-grafana.smiledev.net}"
: "${GRAFANA_DEV_URL:=https://dev-mis-grafana.smiledev.net}"
: "${JIRA_URL:=https://jira.smilegate.net}"
: "${CONFLUENCE_URL:=https://wiki.smilegate.net}"
: "${JENKINS_DEV_URL:=https://dev-mis-jenkins.smiledev.net}"
: "${JENKINS_STG_URL:=https://stg-mis-jenkins.smiledev.net}"
: "${JENKINS_LIVE_URL:=https://mis-jenkins.smilegate.net}"
: "${JENKINS_URL:=https://mis-jenkins.smilegate.net}"   # legacy 폴백 (per-env 키 없을 때)
: "${HARBOR_DEV_URL:=https://dev-mis-registry.smiledev.net}"
: "${HARBOR_STG_URL:=https://stg-mis-registry.smiledev.net}"
: "${HARBOR_LIVE_URL:=https://mis-registry.smilegate.net}"
export GRAFANA_URL GRAFANA_STG_URL GRAFANA_DEV_URL JIRA_URL CONFLUENCE_URL JENKINS_DEV_URL JENKINS_STG_URL JENKINS_LIVE_URL JENKINS_URL HARBOR_DEV_URL HARBOR_STG_URL HARBOR_LIVE_URL

# 정적분석 tool(backend/frontend/gitops/inventory)의 레포 탐색 기준 — workspace_root
export ILLUMINATI_CODE_ROOT="${ILLUMINATI_CODE_ROOT:-$WS}"

if [ ! -x "$BIN" ] || [ "$(cat "$MARK" 2>/dev/null)" != "$VER" ]; then
    command -v python3 >/dev/null 2>&1 || { echo "[illuminati] python3 필요 (미설치)" >&2; exit 0; }
    echo "[illuminati] venv bootstrap v$VER 중 (수십 초, 타임아웃 시 /mcp 재연결 또는 다음 세션에 자동 완료)" >&2
    mkdir -p "$DATA"
    (python3 -m venv "$VENV" && "$VENV/bin/pip" install -q "$SRC") >&2 \
        || { echo "[illuminati] bootstrap 실패 — devops 플러그인 README.md 'MCP' 절 참조" >&2; exit 0; }
    echo "$VER" > "$MARK"
fi

exec "$BIN"

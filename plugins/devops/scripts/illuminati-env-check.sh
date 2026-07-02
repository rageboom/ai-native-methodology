#!/bin/bash
# illuminati 자격증명 점검 — SessionStart 1회 실행. 키 이름만 출력, 값은 절대 노출하지 않는다.
# 판정은 서버(config.py)와 동일: 쉘 export 또는 platform-automation/.env 에 있으면 설정된 것.
WS="$1"
ENVF="$WS/MIS-DevOps/platform-automation/.env"

has() {
    [ -n "${!1}" ] && return 0
    [ -f "$ENVF" ] && grep -q "^${1}=..*" "$ENVF"
}

MISSING=""
for k in GRAFANA_API_KEY GRAFANA_DEV_API_KEY JIRA_TOKEN WIKI_TOKEN; do
    has "$k" || MISSING="$MISSING $k"
done
has JENKINS_DEV_TOKEN || has JENKINS_TOKEN || MISSING="$MISSING JENKINS_DEV_TOKEN(또는 JENKINS_TOKEN)"

if [ -n "$MISSING" ]; then
    echo "[illuminati MCP] 미설정 자격증명:$MISSING"
    echo "→ ~/.zshrc 에 export 후 새 세션. 전체 변수 목록/템플릿: devops 플러그인 README.md 'MCP' 절"
fi
exit 0

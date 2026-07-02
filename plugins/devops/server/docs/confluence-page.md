## infra-ops MCP

사내 운영 백엔드(Grafana, JIRA, Confluence, Jenkins, GHE)를 로컬 Claude Code 세션에 붙이는 stdio MCP 서버다. 로컬 맥북에서 사내망 HTTP API로 닿는 백엔드만 골라 28개 도구로 노출한다. 클러스터나 서버에 직접 명령하는 작업(kubectl, ssh, argocd)은 HIWARE를 거쳐야 하므로 여기 들어있지 않다.

레포 위치는 `MIS-DevOps/platform-automation/mcp/infra-ops` 이고, Python 공식 MCP SDK(FastMCP)로 작성했다.

## 왜 만들었나

예전 사내 infra-ops MCP가 로컬 세션에 연결되지 않아, 그동안 `tools/` 스크립트를 직접 호출하는 방식으로 우회해 왔다. 이번에는 로컬에서 도달과 인증이 실제로 200으로 통과하는 백엔드만 추려 다시 만들었다. AIOps 로드맵(`plan-ai-ops-automation-2026`)의 장애 회고 자동 초안, SLI/SLO 리포트, 알림 패턴 분석 같은 작업이 `grafana_query_*` 와 `alertmanager_create_silence` 를 전제로 짜여 있는데, 그 부품을 로컬에서 채운다.

Harbor는 처음에 후보였으나 제외했다. docker 자격이 macOS keychain(credstore)에 있어 API 인증 토큰을 코드에서 안정적으로 얻지 못했다. 이미지 태그 조회를 부분만 지원하느니 빼는 쪽을 택했다.

## 도구 목록 (28개)

### Grafana (8)

`env` 파라미터로 prod, dev 를 전환한다.

| 도구 | 설명 |
|------|------|
| grafana_promql_query | Mimir instant PromQL |
| grafana_promql_range | 시계열 추이 조회 |
| grafana_list_metrics | 메트릭명 정규식 탐색 (OTel micrometer 네이밍 확인용) |
| grafana_loki_query | Loki LogQL 로그 |
| grafana_tempo_search | Tempo TraceQL 검색 |
| grafana_list_alert_rules | Mimir 알림 rule 목록 |
| grafana_diagnose_alert | 알림 1건의 4계층 인과 종합 진단 |
| grafana_create_silence | AlertManager silence 생성 (쓰기) |

### JIRA (6)

| 도구 | 설명 |
|------|------|
| jira_search | JQL 검색 |
| jira_get_issue | 이슈 단건 조회 |
| jira_create_issue | 이슈 생성 (쓰기) |
| jira_add_comment | 코멘트 추가 (쓰기) |
| jira_list_transitions | 가능한 상태 전이 목록 |
| jira_transition | 상태 전이 (쓰기) |

### Confluence (5)

| 도구 | 설명 |
|------|------|
| confluence_search | CQL 검색 |
| confluence_get_page | 페이지 조회 |
| confluence_list_children | 하위 페이지 목록 |
| confluence_create_page | 페이지 생성 (쓰기) |
| confluence_update_page | 페이지 수정 (쓰기, 버전 자동 증가) |

### Jenkins (4)

| 도구 | 설명 |
|------|------|
| jenkins_list_jobs | job 목록 |
| jenkins_job_status | 최근 빌드 상태 |
| jenkins_last_build_log | 마지막 빌드 콘솔로그 |
| jenkins_trigger_build | 빌드 트리거 (쓰기) |

### GitHub Enterprise (5)

`github.smilegate.net` 에 대해 `gh` CLI 인증을 그대로 쓴다.

| 도구 | 설명 |
|------|------|
| github_list_prs | PR 목록 |
| github_pr_view | PR 상세 |
| github_pr_diff | PR diff |
| github_search_prs | PR 검색 |
| github_pr_comment | PR 코멘트 작성 (쓰기) |

## 설치와 등록

```bash
cd MIS-DevOps/platform-automation/mcp/infra-ops
python3 -m venv .venv
./.venv/bin/pip install -e .

claude mcp add infra-ops -s user -- /절대경로/infra-ops/.venv/bin/infra-ops-mcp
claude mcp list   # infra-ops ✓ Connected 확인
```

자격증명은 `MIS-DevOps/platform-automation/.env` 에서 자동으로 읽는다. GRAFANA, JIRA, Confluence, Jenkins 키가 필요하고, GHE는 `gh` CLI 인증을 사용한다. `~/.claude/.mcp.json` 에 직접 넣으면 Claude Code가 읽지 않으니 `claude mcp add` 로 user scope에 등록한다.

## 보안

쓰기 도구는 `confirm=false`(기본)면 실제로 호출하지 않고 보낼 내용만 미리 돌려준다. 실행하려면 `confirm=true` 로 다시 부른다. 대상은 silence 생성, JIRA 생성/코멘트/전이, Confluence 생성/수정, Jenkins 빌드, PR 코멘트다.

사내 wiki 서버가 구형 TLS renegotiation을 요구해서 그 옵션만 허용했다. 인증서 검증 자체는 끄지 않는다. PromQL, gh CLI 인자에는 따옴표나 플래그 주입을 막는 입력 검증을 넣었다.

## 어디에 쓰나

장애가 나면 `grafana_diagnose_alert` 로 알림 인과를 보고 `grafana_loki_query` 로 로그를 붙여 회고 초안을 만든다. 매일 SLI/SLO 리포트나 알림 빈도 분석에도 grafana 도구를 쓴다. 주간보고를 쓸 때는 `jira_search` 로 본인 티켓을 모으고 `confluence_*` 로 페이지를 갱신한다.

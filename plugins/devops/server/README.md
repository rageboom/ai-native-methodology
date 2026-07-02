# illuminati MCP

MIS DevOps 운영을 로컬 Claude Code 세션에 노출하는 stdio MCP 서버다. 두 부류의 도구로 나뉜다.

- **사내망 HTTP API** — Grafana/JIRA/Confluence/Jenkins/GHE/Harbor 에 도달해 조회·집계·쓰기.
- **로컬 git 파일 정적 파싱** — backend/frontend/gitops/inventory. clone 된 레포를 가로질러 집계·검증하며 외부 도달이 필요 없다.

클러스터/서버 직접 접근(HIWARE)이 아니라 API/파일로만 동작하며, 쓰기 도구는 전부 `confirm` 게이트를 거친다.

## 도메인별 tool (53개)

### grafana (8) — LGTM, `env="prod"|"stg"|"dev"` 스위치
`grafana_promql_query` · `grafana_promql_range` · `grafana_list_metrics` · `grafana_loki_query` · `grafana_tempo_search` · `grafana_list_alert_rules` · `grafana_diagnose_alert` · `grafana_create_silence`(쓰기)

### jira (11)
조회/쓰기: `jira_search`(JQL) · `jira_get_issue` · `jira_create_issue`(쓰기) · `jira_add_comment`(쓰기) · `jira_list_transitions` · `jira_transition`(쓰기)
집계: `jira_weekly_rollup`(epic·Task별 완료집계) · `jira_metadata_audit`(Epic Link/완료일 누락) · `jira_epic_children`(자식 진척+assignee 오염검증) · `jira_bulk_description_patch`(멱등 panel 일괄, 쓰기) · `jira_apm_rollup`(APM, cf 미검증·first-use 경고)

### confluence (6)
`confluence_search`(CQL) · `confluence_get_page` · `confluence_list_children` · `confluence_create_page`(쓰기) · `confluence_update_page`(쓰기) · `confluence_weekly_page_resolve`(주간보고 페이지 해소)

### jenkins (5)
`jenkins_list_jobs` · `jenkins_job_status` · `jenkins_last_build_log` · `jenkins_trigger_build`(쓰기) · `jenkins_build_and_wait`(트리거→완료 polling, 쓰기)

### github (6) — GHE `github.smilegate.net`, gh CLI 래퍼
`github_list_prs` · `github_pr_view` · `github_pr_diff` · `github_search_prs` · `github_pr_comment`(쓰기) · `github_pr_create`(쓰기)

### harbor (3) — 환경별 Harbor v2 REST, `env="dev"|"stg"|"live"`
`harbor_list_artifacts` · `harbor_image_tag_diff`(환경 간 태그·digest 승격 격차) · `harbor_artifact_scan`(Trivy 취약점 요약)

### backend (3) — 백엔드 4레포 cross-repo 정적 파싱
`backend_build_matrix`(Gradle/JDK/SpringBoot drift) · `backend_batch_job_inventory`(배치 Job) · `backend_dockerfile_drift_audit`(base/USER/registry)

### frontend (4) — FO(front)/BO(mis-fe-admin) 정적 검사
`frontend_mf_remote_consistency`(Module Federation remote 교차검증) · `frontend_faro_collect_audit`(Faro env↔nginx 정합) · `frontend_deploy_env_matrix` · `frontend_nginx_perf_audit`

### gitops (6) — MIS-GitOps/scripts/*.sh 래핑
`gitops_set_image_tag`(이미지 태그 write-back, 쓰기) · `gitops_policy_sweep`(Kyverno admission 재현) · `gitops_kubeconform` · `gitops_validate_cross_chart_refs` · `gitops_values_sync_check` · `gitops_helm_render_diff`

### inventory (1)
`inventory_query`(document/inventory/server-{env}.md 구조화 조회)

## 설치

```bash
cd MIS-DevOps/platform-automation/mcp/illuminati
python3 -m venv .venv
./.venv/bin/pip install -e .
```

> 함정: 이 디렉토리를 다른 경로(예: 폐기된 devops-core)에서 복사해 온 경우, editable install 의 `.pth`(`_editable_impl_illuminati_mcp.pth`)가 옛 경로를 가리켜 신규 코드가 런타임에 반영되지 않는다(pytest 는 `pythonpath=["src"]` 라 GREEN 이라 안 보임). `pip show illuminati-mcp` Location 과 `python -c "import illuminati_mcp; print(illuminati_mcp.__file__)"` 로 실 import 경로를 확인하고, 어긋나면 `.venv` 재생성 또는 `.pth` 한 줄을 현재 `src` 절대경로로 교정한다.

## 자격증명 (`MIS-DevOps/platform-automation/.env`, 상위 4단계 자동 로드)

| 도메인 | 키 |
|--------|----|
| grafana | `GRAFANA_URL`/`GRAFANA_API_KEY`(prod), `GRAFANA_STG_URL`/`GRAFANA_STG_API_KEY`, `GRAFANA_DEV_URL`/`GRAFANA_DEV_API_KEY` |
| jira | `JIRA_URL`/`JIRA_TOKEN` (PAT Bearer 전용 — basic-auth 폐지) |
| confluence | `CONFLUENCE_URL`/`WIKI_TOKEN` |
| jenkins | `JENKINS_{DEV,STG,LIVE}_{URL,USER,TOKEN}` (환경별 인스턴스, 폴백 `JENKINS_URL`/`JENKINS_USER`/`JENKINS_TOKEN`) |
| github | `gh` CLI 인증 (env 불필요) |
| harbor | `HARBOR_{DEV,STG,LIVE}_URL`/`_USER`/`_PASS` (basic auth) |

backend/frontend/gitops/inventory 는 자격증명이 없다. 레포 루트는 기본적으로 워크스페이스(`code/`)를 추정하며, 다른 위치면 `ILLUMINATI_CODE_ROOT` 로 override 한다.

## 등록

```bash
claude mcp add illuminati -s user -- /절대경로/illuminati/.venv/bin/illuminati-mcp
claude mcp list   # illuminati ✓ Connected 확인
```

`~/.claude/.mcp.json` 에 직접 넣으면 Claude Code 가 읽지 않는다(확인된 함정). `claude mcp add` 로 user scope(`~/.claude.json`)에 등록한다. tool 추가/변경 후에는 Claude Code 재시작이 필요하다.

## 보안

- 쓰기 도구는 `confirm=false`(기본) 면 실제 호출 없이 `{dry_run, payload}` 만 반환한다. 실행하려면 `confirm=true`.
- 사내 wiki(Confluence)는 구형 TLS renegotiation 을 요구해 `http.py` 에서 `OP_LEGACY_SERVER_CONNECT` 를 허용한다(인증서 검증은 유지).
- SSL 검증 실패 시 한시적으로 `ILLUMINATI_INSECURE=1` 로 우회 가능(상시 사용 금지).
- Harbor 는 admin basic-auth 로 동작 검증됐으나, 운영 정착 시 권한을 좁힌 robot account 로 전환을 권한다.

## 개발

```bash
./.venv/bin/python -m pytest -q   # 순수 로직 단위 테스트 (162 passed)
```

도메인 모듈은 `# 순수 로직(테스트 대상)` 섹션과 `register(mcp)` 로 분리한다. 파싱/판정/집계는 모듈 레벨 순수함수로 빼서 사내망 없이 테스트하고, tool 은 그 함수를 호출하는 얇은 래퍼로 둔다. 신규 도메인은 `server.py` 의 `build()` 에 `register` 한 줄로 배선한다.

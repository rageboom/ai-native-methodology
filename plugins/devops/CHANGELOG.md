# Changelog — devops

> 변경 이력 단일 SSOT. 첫 `## [vX.Y.Z]` 헤더가 `plugin.json.version` / `package.json.version` 과 정합해야 한다 (version-check 3-way gate).

## [v0.2.0] — 2026-07-02 — 멀티환경 Jenkins/Grafana + 서버 rename

- illuminati MCP가 환경별 인스턴스를 정식 지원 — grafana `env='prod'|'stg'|'dev'`(STG 추가), jenkins 5개 tool에 `env='dev'|'stg'|'live'` 파라미터. 서버(config.py) 확장과 페어 — `JENKINS_{DEV,STG,LIVE}_{URL,USER,TOKEN}` per-env 키, legacy `JENKINS_URL` 폴백 유지 (pytest 166 passed).
- **서버 소스를 플러그인으로 이관(`server/`)** — 팀원의 MIS-DevOps clone 의존 제거, 플러그인 설치만으로 동작. launcher가 CLAUDE_PLUGIN_DATA에 venv 자동 부트스트랩 + `server/pyproject.toml` version 변경 시 재설치. 정적분석 tool만 대상 레포 clone 필요(tool-level).
- 서버에서 구명 완전 제거 — 패키지 `infra_ops_mcp`→`illuminati_mcp`, 바이너리 `infra-ops-mcp`→`illuminati-mcp`, env `INFRA_OPS_*`→`ILLUMINATI_*`. `.env` 폴백은 `<workspace_root>/MIS-DevOps/platform-automation/.env` 자동 탐색 + `ILLUMINATI_ENV_FILE` 재지정. launcher의 user-scope 중복 감지는 구명(infra-ops)도 계속 인식.
- launcher URL 기본값 확장: `GRAFANA_{STG,DEV}_URL` + `JENKINS_{DEV,STG,LIVE}_URL` 전 환경 (사용자 실측 확정). 설치 직후 SessionStart hook이 미설정 자격증명을 즉시 안내(illuminati-env-check.sh).

## [v0.1.0] — 2026-07-02 — 초기 배포

- `code/.claude/` workspace 자산을 역할별 5개 플러그인(devops/sre/devsecops/finops/aiops)으로 분리 배포 — 이 플러그인이 base (공통 rule-skill 7종 보유).
- agent 2 (infra-reviewer 5-lens PR 리뷰, devops-researcher) + skill 13 + command 12 + hook 6.
- 기존 inline hook 이식 시 비공식 `$CLAUDE_FILE_PATH` 환경변수를 공식 stdin JSON(`.tool_input.file_path`)으로 수정 (auto-formatter, kubeconform-validator).
- SessionStart hook이 `${user_config.workspace_root}` 실값을 세션 컨텍스트에 주입 — command 본문 치환 미보장 대비.
- 하드코딩 절대경로를 `userConfig.workspace_root` 치환으로 대체 — 다른 폴더 구조에서도 동일 동작.
- illuminati MCP 동봉(`.mcp.json` + launcher, 구명 infra-ops) — grafana LGTM(metric/logs/trace)/jira/confluence/jenkins/GHE/harbor/gitops 53-tool. zero-setup: 개인 토큰/계정 env export만으로 동작 — venv 첫 실행 자동 부트스트랩 + 회사 공통 URL 기본값 제공(export된 env가 .env보다 항상 우선, os.environ.setdefault). 미설치/user-scope 중복/`ILLUMINATI_DISABLE=1` 시 조용히 no-op.

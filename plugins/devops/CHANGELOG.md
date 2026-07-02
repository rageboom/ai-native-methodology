# Changelog — devops

> 변경 이력 단일 SSOT. 첫 `## [vX.Y.Z]` 헤더가 `plugin.json.version` / `package.json.version` 과 정합해야 한다 (version-check 3-way gate).

## [v0.1.0] — 2026-07-02 — 초기 배포

- `code/.claude/` workspace 자산을 역할별 5개 플러그인(devops/sre/devsecops/finops/aiops)으로 분리 배포 — 이 플러그인이 base (공통 rule-skill 7종 보유).
- agent 2 (infra-reviewer 5-lens PR 리뷰, devops-researcher) + skill 13 + command 12 + hook 6.
- 기존 inline hook 이식 시 비공식 `$CLAUDE_FILE_PATH` 환경변수를 공식 stdin JSON(`.tool_input.file_path`)으로 수정 (auto-formatter, kubeconform-validator).
- SessionStart hook이 `${user_config.workspace_root}` 실값을 세션 컨텍스트에 주입 — command 본문 치환 미보장 대비.
- 하드코딩 절대경로를 `userConfig.workspace_root` 치환으로 대체 — 다른 폴더 구조에서도 동일 동작.
- illuminati MCP 동봉(`.mcp.json` + launcher, 구명 infra-ops) — grafana LGTM(metric/logs/trace)/jira/confluence/jenkins/GHE/harbor/gitops 53-tool. zero-setup: 개인 토큰/계정 env export만으로 동작 — venv 첫 실행 자동 부트스트랩 + 회사 공통 URL 기본값 제공(export된 env가 .env보다 항상 우선, os.environ.setdefault). 미설치/user-scope 중복/`ILLUMINATI_DISABLE=1` 시 조용히 no-op.

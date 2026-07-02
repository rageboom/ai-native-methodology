# Changelog — devsecops

> 변경 이력 단일 SSOT. 첫 `## [vX.Y.Z]` 헤더가 `plugin.json.version` / `package.json.version` 과 정합해야 한다 (version-check 3-way gate).

## [v0.1.0] — 2026-07-02 — 초기 배포

- devops-toolkit 역할 분리: 보안 자산 독립.
- security-policy-analyst agent (Kyverno/Trivy/Falco 현황 분석).
- devsecops-review skill 신설 — infra-reviewer 5-lens 중 DevSecOps lens 체크리스트(CIS K8s Benchmark/NSA·CISA/PSS Restricted)를 독립 실행 버전으로 추출.
- 보호파일 편집 차단 + 위험명령 차단 PreToolUse hook 2종 (비공식 `$CLAUDE_FILE_PATH` 대신 공식 stdin JSON 사용).

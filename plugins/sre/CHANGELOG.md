# Changelog — sre

> 변경 이력 단일 SSOT. 첫 `## [vX.Y.Z]` 헤더가 `plugin.json.version` / `package.json.version` 과 정합해야 한다 (version-check 3-way gate).

## [v0.1.0] — 2026-07-02 — 초기 배포

- devops-toolkit 역할 분리: 관측성·트러블슈팅 자산 독립.
- 진단 agent 4종(linux/k8s/network/data, read-only 경계 비중첩) + observability-investigator + incident-log-investigator + observability-architect + postmortem-writer.
- cross-layer 장애 분류 `/triage` command.

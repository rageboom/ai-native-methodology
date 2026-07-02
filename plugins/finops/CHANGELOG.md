# Changelog — finops

> 변경 이력 단일 SSOT. 첫 `## [vX.Y.Z]` 헤더가 `plugin.json.version` / `package.json.version` 과 정합해야 한다 (version-check 3-way gate).

## [v0.1.0] — 2026-07-02 — 초기 배포

- devops-toolkit 역할 분리: 리소스 효율 자산 독립.
- finops-review skill 신설 — infra-reviewer 5-lens 중 FinOps lens 체크리스트를 독립 실행 버전으로 추출. request/limit right-sizing, resourcequota 근거, overcommit 점검, PromQL 실사용률 실측 패턴.

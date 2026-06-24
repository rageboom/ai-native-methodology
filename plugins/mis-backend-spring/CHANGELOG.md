# Changelog — mis-backend-spring

> 변경 이력 단일 SSOT. 첫 `## [vX.Y.Z]` 헤더가 `plugin.json.version` / `package.json.version` 과 정합해야 한다 (version-check 3-way gate).

## [v0.1.0] — 2026-06-24 — 초기 도입

- `mis-backend-spring` 플러그인 신설 (mis-plugins 마켓플레이스 모노레포).
- `SGH-ISD/mis-backend-common` 의 `plugins/mis-backend` (DWP팀, upstream v1.1.0) 자산을 마켓플레이스로 도입 — 식별자 `mis-backend-spring`, 버전 0.1.0 으로 리셋.
- agents 4종 (core-extraction-analyst / dependency-upgrade-analyst / oo-design-reviewer / query-antipattern-reviewer).
- commands 2종 (`/backend-debt-scan`, `/gen-tests`).
- skills 4종 (backend-oo-ddd / backend-test-workflow / backend-testing / test-scaffold + references).
- hook 1종 (PreToolUse: 커밋 전 spotless/ktlint + compile 품질 게이트).

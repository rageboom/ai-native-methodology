# githooks/ — git pre-push release gate

사내(GitHub Actions 없음) 환경에서 release-readiness 를 push 전에 자동 강제하기 위한 git hook.
**F-AUDIT-SOFTGATE-001 후속** — release gate 가 "사람 기억"이 아니라 `git push` 시점에 자동 실행되도록.

## 설치 (클론마다 1회)

```bash
node ai-native-methodology/scripts/setup-git-hooks.js
```
→ `git config core.hooksPath ai-native-methodology/scripts/githooks` 를 설정한다.
(git 은 보안상 버전관리된 hook 을 자동 실행하지 않으므로 이 1회 설정이 필요하다.)

## 동작

- `git push` 직전 `pre-push` 가 `npm run test:release` 실행:
  - self-test 정합 검사 (17→22 류 silent rot 차단)
  - A1 case 가 full `release-readiness`(22/22) + `npm test --workspaces`(879) 전수 실행
- 실패 시 **push 중단**. ~1-2분 소요.
- **우회**: `git push --no-verify` (escape hatch — 책임은 사용자)
- **해제**: `git config --unset core.hooksPath`

## 한계 (정직)

- **클라이언트 hook** — 각 클론에서 1회 설치 필요(git 자동 실행 안 함), `--no-verify` 우회 가능. 진짜 강제 ❌ (escape 존재).
- `core.hooksPath` 가 본 디렉토리를 가리키므로 `.git/hooks/` 의 다른 hook 은 안 돈다(현재 이 repo 엔 다른 git hook 없음).
- 서버측 강제가 필요하면 GHE `pre-receive` hook 또는 CI 파이프라인(Jenkins 등)으로 승격.
- Claude Code PreToolUse hook 과는 다른 메커니즘 — 이쪽은 터미널 push 까지 모두 잡되, §4.1 "hook 빠를 것" 규칙(Claude Code hook 한정)과 무관.

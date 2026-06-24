# pm 플러그인 — 작업 컨텍스트

`mis-plugins` 마켓플레이스 모노레포의 플러그인. 마켓플레이스-레벨 규약(빌드·배포·티켓)은 레포 루트 `CLAUDE.md` 참조.

## 무엇

PM팀/개발팀이 현업 요구사항을 **표준 요구사항 정의서(PRD)** 로 정리하고 **Confluence 위키 업로드 → Jira 이슈 변환·등록**까지 잇는 플러그인. npm 패키지 = `@mis-plugins/pm`.

## 구성

- `skills/pm-prd-writer/SKILL.md` — 단일 스킬. 4단계(작성 → 위키 업로드 → 이슈 변환 → 등록), 각 상태 전환마다 사람 확인 게이트.
- `skills/pm-prd-writer/assets/요구사항_정의서_템플릿.md` — 표준 7절 템플릿. SKILL 이 `assets/` 상대경로로 참조하므로 위치 고정.

## 작업 규약

- 스킬 본문 워크플로우는 PM/개발팀이 합의한 절차. **임의 변경 ❌** — 변경 시 티켓 + 사람 확인.
- 버전: `plugin.json` / `package.json` / `CHANGELOG.md` 첫 헤더 3-way 정합(`node scripts/version-check.js --plugin pm`).
- 배포: 루트 `node scripts/publish.js --plugin pm` (자세히는 `docs/add-a-plugin.md`).

## 알려진 후속 (carry)

- SKILL 본문이 claude.ai 환경 가정(`/mnt/user-data/outputs/`, `tool_search`, `present_files`)을 포함 — Claude Code 런타임과 일부 불일치. 별도 티켓으로 다룬다.

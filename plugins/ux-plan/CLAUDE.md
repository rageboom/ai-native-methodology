# ux-plan 플러그인 — 작업 컨텍스트

`mis-plugins` 마켓플레이스 모노레포의 플러그인. 마켓플레이스-레벨 규약(빌드·배포·티켓)은 레포 루트 `CLAUDE.md` 참조.

## 무엇

Smilegate UX/UI팀이 기획서를 **Confluence 위키 페이지**로 작성하도록 돕는 플러그인. AI가 직접 읽고 쓸 수 있게 텍스트·표 중심, Figma는 링크 참조. npm 패키지 = `@mis-plugins/ux-plan`.

## 구성

- `skills/planning-wiki/SKILL.md` — 단일 스킬. 템플릿 읽기 → 내용 작성 → 위키 페이지 생성 → 확인, 선택적 Figma 다이어그램 안내.
- `skills/planning-wiki/references/template.md` — 공통 10절 기획서 템플릿. SKILL 이 `references/` 상대경로로 참조하므로 위치 고정.

## 작업 규약

- 스킬 본문 워크플로우는 UX/UI팀이 합의한 절차. **임의 변경 ❌** — 변경 시 티켓 + 사람 확인.
- 버전: `plugin.json` / `package.json` / `CHANGELOG.md` 첫 헤더 3-way 정합(`node scripts/version-check.js --plugin ux-plan`).
- 배포: 루트 `node scripts/publish.js --plugin ux-plan` (자세히는 `docs/add-a-plugin.md`).

## 알려진 후속 (carry)

- SKILL 본문이 `qa-process-eval` 스킬(QA 플러그인)을 참조 — 해당 플러그인은 아직 미배포. 향후 QA 플러그인 추가 시 연동.

# pm

PM팀/개발팀이 현업 요구사항을 **표준 요구사항 정의서(PRD)** 로 정리하고, **Confluence 위키 업로드 → Jira 이슈 변환·등록**까지 하나의 흐름으로 처리하도록 돕는 Claude Code 플러그인. `mis-plugins` 마켓플레이스 모노레포의 한 플러그인.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install pm@mis-plugins
```

## 구성

- `skills/pm-prd-writer/SKILL.md` — 요구사항 정의서 작성 + Jira 변환 워크플로우 (작성 → 위키 업로드 → 이슈 변환 → 등록, 단계별 사람 확인 게이트).
- `skills/pm-prd-writer/assets/요구사항_정의서_템플릿.md` — 표준 7절 요구사항 정의서 템플릿.

## 사용 예

- "요구사항 정의서 작성해줘"
- "이 요구사항으로 PRD 만들어줘"
- "정의서를 Jira 이슈로 변환해줘"

빌드·배포는 레포 루트 공유 툴링(`scripts/`)이 담당한다 — `docs/add-a-plugin.md` 참조.

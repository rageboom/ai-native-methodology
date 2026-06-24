# ux-plan

Smilegate **UX/UI팀**이 기획서를 **Confluence 위키 페이지**로 작성하도록 돕는 Claude Code 플러그인. AI(Claude)가 직접 읽고 수정할 수 있도록 텍스트·표 중심으로 작성하며, Figma는 임베드 대신 링크로만 참조한다. `mis-plugins` 마켓플레이스 모노레포의 한 플러그인.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install ux-plan@mis-plugins
```

## 구성

- `skills/planning-wiki/SKILL.md` — 위키 기획서 작성 워크플로우 (템플릿 읽기 → 내용 작성 → 위키 페이지 생성 → 확인, 선택적 Figma 다이어그램 안내).
- `skills/planning-wiki/references/template.md` — 공통 10절 기획서 템플릿.

## 사용 예

- "기획서 만들어줘"
- "위키에 기획서 올려줘"
- "공통 템플릿으로 시스템 기획해줘"

빌드·배포는 레포 루트 공유 툴링(`scripts/`)이 담당한다 — `docs/add-a-plugin.md` 참조.

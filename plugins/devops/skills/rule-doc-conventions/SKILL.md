---
name: rule-doc-conventions
description: |
  작업 증적을 어디에 남길지 판단할 때 반드시 참조. diary/plan/research 파일을 만들지 않고 JIRA 티켓(description+댓글)이 단일 증적이라는 회사 정책. postmortem 만 예외. "일지 남겨줘", "plan 적어줘", "research 해줘" 요청 시에도 이 정책을 먼저 확인.
---

# Document Conventions (증적 정책)

IMPORTANT: 작업 증적은 **JIRA 티켓**(description + 댓글)에만 남긴다. diary / plan / research 산출물 파일을 만들지 않는다 (2026-06-02 정책).

## 규칙

- **diary**(`user/dohyeonkim/diary/`) — 더 이상 작성 안 함. 작업 요약·변경파일·롤백·영향범위는 JIRA 티켓 description 에.
- **plan.md / research.md**(`docs/claude/plan|research/`) — 작성 안 함. 깊은 숙지·에이전트 토론은 하되 산출물은 티켓/채팅으로.
- 사용자가 명시적으로 "plan 적어줘" / "research 해줘" / "일지 남겨줘" 라고 요청할 때만 파일 작성.

## 예외 — postmortem (장애 회고)

장애 포스트모템만 파일로 유지한다: `MIS-DevOps/document/claude/review/postmortem-{주제}.md`.
- 그 외 평상시 작업 증적은 전부 JIRA.

## 기존 파일

기존 `docs/claude/plan|research/`, `user/dohyeonkim/diary/` 파일은 역사 기록이므로 **삭제하지 않음**. 신규 생성만 중단.

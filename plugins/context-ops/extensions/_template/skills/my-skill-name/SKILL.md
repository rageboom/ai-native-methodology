---
name: my-skill-name
description: |
  한 줄로 이 skill이 하는 일을 설명. (Claude가 자동 발동 여부 판단에 사용)
  발동 조건: 어떤 상황에서 사용하는지 명시.
  비발동 조건: 이 skill이 발동하면 안 되는 프로젝트/상황 명시.
allowed-tools: Read, Grep, Bash
---

# my-skill-name

한 줄 요약 — 이 skill이 무엇을 자동화하는지.

## 언제 사용

- 사용자가 "___" 라고 말할 때
- ___ 단계에서 ___ 이 필요할 때
- `inventory.json`의 어떤 필드가 ___ 일 때 (조건이 있으면 명시)

## 절차

1. 전제 조건 확인 — `.ai-context/output/inventory.json` 존재 등
2. (구체적인 단계 서술)
3. 산출물 작성

## 산출물

`.ai-context/output/<파일명>.json` 또는 실행 결과 요약

```json
{
  "예시": "산출물 구조"
}
```

## 주의

- 이 skill을 발동하면 안 되는 프로젝트 유형 명시
- 다른 skill과의 선후행 관계가 있으면 명시

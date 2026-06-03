# skills/design/ — placeholder (☐ 미래 lifecycle 확장)

현재 채움 없음. v2.0+ scope.

## 향후 채움 후보 (v2.0)

- `extract-wireframe` — 분석 산출물 (state-map / visual-manifest) → wireframe spec
- `generate-dtcg-token` — design token 추출 (DTCG 표준)
- `compose-component-spec` — UI component 명세 (props / state / behavior)

## 5 영역 매트릭스 — design stage

| 영역   | 강도 | 설명                                                 |
| ------ | ---- | ---------------------------------------------------- |
| 기획   | 약   | wireframe 정합 검토 / 사용자 여정 fine-tune          |
| 디자인 | 강   | stage 의 핵심 — DTCG token / 시각 시스템 / 인터랙션  |
| FE     | 강   | component-spec / state machine / FE 와 cross-cutting |
| BE     | 약   | API 계약 검토 (openapi.yaml 입력)                    |
| DB     | 약   | 도메인 모델 시각화 (erd.mermaid 입력)                |
| 공통   | 약   | accessibility default / cross-platform 정합          |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 ( analysis stage `phase-1-inventory` 패턴 차용 / v2.0 진입 시 SKILL.md 신설 시점에 적용 / 본 추상화 단계는 정책 선언만). FE 디자인 시스템 stack 후보: Figma / Storybook / shadcn/ui / MUI / Tailwind / DTCG validator.

## 인터페이스 (lifecycle-contract.md §분석→설계)

- 산출물 (분석→설계 일부): wireframe / DTCG token / component-spec
- 기존 자산 (analysis stage 안에 포함된 design 영역):
  - `methodology-spec/deliverables/7-ui-ux.md`
  - `methodology-spec/deliverables/8-state-map.md`
  - `methodology-spec/deliverables/9-visual-manifest.md`
  - `docs/adr/ADR-FE-002.md` (DTCG)
  - `docs/adr/ADR-FE-005.md` (권위 매개체 13)

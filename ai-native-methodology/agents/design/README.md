# agents/design/ — v2.x carry (chain harness 4 stage 외)

★ ★ v2.0.0-rc1 chain harness validated 의 4 stage = **planning / spec / test / implement**. design stage = chain 2 (spec) 와 차별화 시점 carry → **v2.x lifecycle 확장 결단 시 채움**.

★ design 영역 자산은 analysis stage 안에 부분적으로 포함됨 — `methodology-spec/deliverables/7-ui-ux.md` (FE+디자인 cross-cutting) + `8-state-map.md` (FE 동적) + `9-visual-manifest.md` (Playwright snapshot) + ADR-FE-002 (DTCG 2025.10) + ADR-FE-005 (권위 매개체 13). chain 2 spec 진입 시 본 자산 통합 가능.

## 향후 채움 trigger (v2.x lifecycle 확장 결단 시)

- **UX** — 사용자 여정 / 정보 구조 / 인터랙션 모델
- **visual-designer** — DTCG token / 시각 시스템 정합
- **interaction-designer** — micro-interaction / accessibility default

## 5 영역 매트릭스 — design stage

| 영역 | 강도 | 설명 |
|---|---|---|
| 기획 | 약 | wireframe 정합 검토 / 사용자 여정 fine-tune |
| 디자인 | 강 | stage 의 핵심 — DTCG token / 시각 시스템 / 인터랙션 |
| FE | 강 | component-spec / state machine / FE 와 cross-cutting (deliverable 7~9 기존 자산) |
| BE | 약 | API 계약 검토 (openapi.yaml 입력) |
| DB | 약 | 도메인 모델 시각화 (erd.mermaid 입력) |
| 공통 | 약 | accessibility default / cross-platform 정합 |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용 / v2.0 진입 시 SKILL.md 신설 시점에 적용 / 본 추상화 단계는 정책 선언만). FE 디자인 시스템 stack 후보: Figma / Storybook / shadcn/ui / MUI / Tailwind / DTCG validator.

## 인터페이스 (lifecycle-contract.md §분석→설계)

- 산출물 (분석→설계 일부): wireframe / DTCG token / component-spec
- ★ 기존 자산 (analysis stage 안에 포함된 design 영역):
  - `methodology-spec/deliverables/7-ui-ux.md` (FE+디자인 cross-cutting)
  - `methodology-spec/deliverables/8-state-map.md` (FE 동적 행동)
  - `methodology-spec/deliverables/9-visual-manifest.md` (Playwright snapshot binary 진실)
  - `docs/adr/ADR-FE-002.md` (DTCG 2025.10 W3C spec)
  - `docs/adr/ADR-FE-005.md` (권위 매개체 13)
- ★ v2.0 진입 시 design stage 정식 분리 carry (`methodology-spec/lifecycle-contract.md` §분석→설계 참조)

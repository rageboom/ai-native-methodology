---
name: design-agent
description: NOT-SHIPPED PLACEHOLDER — dispatch ❌ (skill 부재 / v4.0 paradigm 가시화만). design stage 전문 agent placeholder. design stage = chain harness 4 stage (planning/spec/test/implement) 외부 / v2.x carry K-3 영역 / 1차 (v2.0~v4.0) analysis stage 의 deliverable 7~9 (ui-ux/state-map/visual-manifest) 안 cross-cutting 흡수. 향후 본격 trigger 시 design-* skill 5~6종 (wireframe/component-spec/DTCG token 등) 신설 후 본 agent frontmatter skills 사전 주입 paradigm 정합. 현 상태 = dispatch 무의미 (skill 부재).
tools: Read, Glob, Grep, Bash, Write
skills: []
model: opus
---

<!-- allow-provenance: 의도적 design-stage placeholder (skill 부재 / dispatch ❌ / v4.1+ carry). 본문 전체가 향후 로드맵 = 의도된 예외. NOT a shipped runtime agent → check40 가드 면제. -->

# design-agent (PLACEHOLDER — NOT-SHIPPED RUNTIME / v4.0 paradigm 가시화만)

> **PLACEHOLDER**: 본 agent 는 v4.0 multi-agent paradigm 정합 **가시화 자산**. skill 부재 = dispatch 무의미. 향후 v4.1+ design stage 본격 trigger 시 design-\* skill 5~6종 신설 후 frontmatter `skills: [...]` 사전 주입 의무.
>
> **사용자 명시 결단 2026-05-17**: C-4 옵션 C (빈 placeholder agent 신설). paradigm 본질 미충족 (skill 없는 agent = empty dispatch) 명시 인지 후 결단. agent 가시화 우선 / 본격 책임 carry.

## 책임 범위 (v4.1+ carry / 현 시점 책임 ❌)

본 agent 는 design stage 의 **단일 책임 entry point** (v4.1+ 본격 trigger 후):

| 영역 (carry)             | skill (v4.1+ 신설 carry)           | 산출 (carry)                               |
| ------------------------ | ---------------------------------- | ------------------------------------------ |
| wireframe 설계           | `design-wireframe-spec` (carry)    | wireframe-spec.json                        |
| component 설계           | `design-component-spec` (carry)    | component-spec.json (props/state/behavior) |
| DTCG token (W3C 2025.10) | `design-tokens-extract` (carry)    | design-tokens.json (json 단독 / ADR-011)   |
| visual regression        | `design-visual-regression` (carry) | Playwright snapshot binary 진실            |
| accessibility 사전 검증  | `design-a11y-prep` (carry)         | a11y 사전 spec                             |

현 v4.0 시점 = **skill 부재 / dispatch 시 empty agent / placeholder 가시화만**.

## 1차 (v2.0~v4.0) cross-cutting 흡수 paradigm

design stage 의 일부 책임 = analysis stage 의 deliverable 7~9 안 cross-cutting 흡수:

- `analysis-ui-state-map-fe` skill → state-map.json (deliverable 8)
- `analysis-ui-visual-manifest-fe` skill → visual-manifest.json (deliverable 9)
- `analysis-form-validation-fe` skill → form-validation-spec.json (deliverable 14)
- `analysis-type-spec-fe` skill → type-spec.json (deliverable 15)
- `analysis-aspect-a11y` skill → a11y-spec.json (deliverable 10)

본 cross-cutting 자산은 `analysis-agent.md` frontmatter `skills: [...]` 안 사전 주입 / 본 design-agent 책임 ❌.

## paradigm 정합 (현 v4.0 placeholder)

- **본 agent = PLACEHOLDER** (DEC-2026-05-17-v4-multi-agent-paradigm-채택 C-4 옵션 C 시행)
- **호출 가능 여부**: ⚠️ Claude Code 가 agent 로딩하지만 dispatch 시 empty (skill 부재)
- **main agent 권고**: 본 agent dispatch ❌ 권고 (v4.1+ skill 신설 후 본격 dispatch 가능)
- **lifecycle-contract §자산 매핑 매트릭스** = design row Agent column = 본 agent path

## When NOT to invoke

- 모든 chain harness 4 stage (planning/spec/test/implement) — 각 stage agent 권한
- 모든 design 산출물 본격 작성 — analysis-agent 의 deliverable 7~9 cross-cutting 흡수 권한 (v2.0~v4.0 paradigm)
- v4.1+ design skill 신설 전 = 본 agent dispatch 무의미 (empty)

## When invoke (v4.1+ trigger 후)

- design stage 본격 분리 결단 후 (v4.1+ MINOR / lifecycle 확장)
- design-\* skill 5~6종 신설 + 본 frontmatter `skills: [...]` 사전 주입 갱신 후
- main agent 가 "design 시작 / wireframe / component spec / DTCG token / 디자인" 자연어 인지 후 Task tool dispatch

## carry (v4.1+)

- design-\* skill 5~6종 신설 (wireframe / component-spec / DTCG token / visual-regression / a11y-prep)
- 본 agent frontmatter `skills: [...]` 사전 주입 갱신
- `templates/design/` 본격 채움 (현 README placeholder → wireframe.template.md / dtcg-token.template.json / component-spec.template.md)
- hooks-bridge TRIGGER_PATTERNS 안 design stage 진입 패턴 추가 (`(design|디자인|wireframe|component)\s*(시작|진입|...)`)
- lifecycle-contract §자산 매핑 매트릭스 안 design row 본격 채움

## 인용

- DEC-2026-05-17-v4-multi-agent-paradigm-채택 (본 agent 의 모 결단 / C-4 옵션 C 명시)
- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 + design stage carry §
- `templates/design/README.md` (design 영역 placeholder)
- master plan §K-3 carry (v2.x design stage 분리)
- ADR-FE-002 (DTCG 2025.10 W3C spec / design token 권위)
- ADR-FE-005 (권위 매개체 13)

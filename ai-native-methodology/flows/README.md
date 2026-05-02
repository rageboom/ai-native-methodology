# flows/ — Sub-stage 순서 명세 (G6)

각 lifecycle stage 의 sub-stage / phase 흐름을 DAG (`.json` + `.mermaid` 이중 렌더링) 으로 정의. drift-validator v0.2.0 가 `.json ↔ .mermaid` 의미 동등성 자동 검증 (drift 0 자가 입증).

## 채워진 흐름 (★ 현재)

- `analysis.phase-flow.json` + `analysis.phase-flow.mermaid` — 분석 stage 의 Phase 0 → 1 → 2 → 3 → 4 → 4.5 → 5 (BE/FE/DB 분기) → 6 흐름
  - 본체 v0.2.0 자산 그대로 재배치 (G6, plan 11차 결단)
  - `methodology-spec/workflow/phase-flow.{json,mermaid}` 에서 이동 — 파일명만 변경

## 미채움 흐름 (☐ v2.0+ lifecycle 확장)

- `planning.phase-flow.{json,mermaid}` — 기획 stage 흐름
- `design.phase-flow.{json,mermaid}` — 설계 stage 흐름
- `test.phase-flow.{json,mermaid}` — 테스트 stage 흐름
- `implement.phase-flow.{json,mermaid}` — 구현 stage 흐름

자세한 인터페이스: `methodology-spec/lifecycle-contract.md`

## drift-validator 자동 호출

PostToolUse hook (`hooks/hooks.json`) 이 Write/Edit 후 자동 검증.

## 향후 (v2.0+)

- 사용자 프로젝트의 stage 진척도 (`<user-project>/.aimd/state.json`) 와 cross-link
- skill 호출 시 prerequisite phase 자동 체크 (예: phase-3 미완료 시 phase-5 호출 거절)
- carry-over C.8 (G1+G2)

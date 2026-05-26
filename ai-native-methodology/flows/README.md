# flows/ — SDLC stage 순서 명세 (★ v2.0 chain harness validated)

각 lifecycle stage 의 sub-stage / phase 흐름을 DAG (`.json` + `.mermaid` 이중 렌더링) 으로 정의. drift-validator 가 `.json ↔ .mermaid` 의미 동등성 자동 검증 (drift 0 자가 입증).

## ★ ★ ★ Master SSOT (v2.0 진입점)

- **`sdlc-4stage-flow.{json,mermaid}`** (파일명 reuse 유지) — ★ ★ ★ chain harness 6-stage 통합 SSOT (analysis → discovery → spec → plan → test → implement / 5 gate (★ v10.0.0 chain N = gate #N) + revisit_edges + release_eligibility)
  - **plugin user 의 v2.0 진입 우선순위 = 1순위** (chain-driver init / next 가 본 SSOT 참조)
  - schemas/state.schema.json 의 stage enum ↔ stages 정합 자동 검증 (drift-validator `--check-state-flow-consistency`)

## Chain stage 5종 (★ v9.0 6-stage / planning→discovery 개칭 + plan 신설)

- `discovery.phase-flow.{json,mermaid}` — chain 1 / planning-spec 추출 (discovery stage / 입력 어댑터 4종)
- `spec.phase-flow.{json,mermaid}` — chain 2 / behavior + acceptance + 7대 통합
- `plan.phase-flow.{json,mermaid}` — chain 3 / task-plan (task 분해 / ADR / NFR / risk — ★ v10.0.0 gate #3 본격)
- `test.phase-flow.{json,mermaid}` — chain 4 / test-spec + 실 test code (RED)
- `implement.phase-flow.{json,mermaid}` — chain 5 / impl-spec + 실 impl code (GREEN)

## Cross-cutting (analysis stage / chain 1 진입 전)

- `analysis.phase-flow.{json,mermaid}` — analysis stage 의 Phase 0 → 1 → 2 → 3 → 4 → 4.5 → 5 (BE/FE/DB 분기) → 6 흐름
  - **chain 1 (discovery) 의 INPUT 으로 사용** — legacy 코드 → 7대 산출물 한 방향 추출
  - v1.x 자산 그대로 v2.0 chain 1 진입 전 단계로 흡수

## 미채움 흐름 (☐ v2.x+ lifecycle 확장)

- `design.phase-flow.{json,mermaid}` — 설계 stage 흐름 (★ chain 2 와 차별화 시점 carry)

자세한 인터페이스: `methodology-spec/lifecycle-contract.md`

## drift-validator 호출 (★ 2026-05-02 갱신 / iter 0 post-flight)

**호출 시점** = `analysis-formal-spec-validation` skill 진입 시 (★ Phase 4.5 = 이중 렌더링 정합 검증 단계). skill SKILL.md §1 "이중 렌더링 정합 (ADR-008) — drift-validator 자동 호출" 정합.

**★ 이전 (deprecated)**: PostToolUse hook 매 Write/Edit 마다 자동 호출 — ★ F-PA-009 (매 호출 200-500ms 마찰) + F-PA-010 (`|| true` silent fail / no-simulation 정책 위배) 발견 후 ★ ★ 제거 (★ archive/phase-a-iteration/phase-a-iteration-0-preflight.md §Post-flight 참고 / cleanup round 1 격리).

**현재 (v1.4.2 + iter 0 post-flight)**: on-demand 검증. drift 발견 시 stderr 자연 노출 / silent fail 0.

## 향후 (v2.0+)

- 사용자 프로젝트의 stage 진척도 (`<user-project>/.aimd/state.json`) 와 cross-link
- skill 호출 시 prerequisite phase 자동 체크 (예: phase-3 미완료 시 phase-5 호출 거절)
- carry-over C.8 (G1+G2)

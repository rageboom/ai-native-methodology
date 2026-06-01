# flows/ — SDLC stage 순서 명세 (★ v2.0 chain harness validated / ★ v12 json 단독)

각 lifecycle stage 의 sub-stage / phase 흐름을 DAG (`.json` 단독 SSOT) 으로 정의. ★ v12.0.0 (ADR-011) — `.mermaid` 짝 폐기 (산출물 = json 단독 / AX-native). 정합 검증 = drift-validator 의 JSON-only 검사 (layout + state-flow + handoff/rename-drift).

## ★ ★ ★ Master SSOT (v2.0 진입점)

- **`sdlc-4stage-flow.json`** — ★ ★ ★ chain harness 6-stage 통합 SSOT (analysis → discovery → spec → plan → test → implement / 5 gate (★ v10.0.0 chain N = gate #N) + revisit_edges + release_eligibility)
  - **plugin user 의 v2.0 진입 우선순위 = 1순위** (chain-driver init / next 가 본 SSOT 참조)
  - schemas/state.schema.json 의 stage enum ↔ stages 정합 자동 검증 (drift-validator `--check-state-flow-consistency`)

## Chain stage 5종 (★ v9.0 6-stage / planning→discovery 개칭 + plan 신설)

- `discovery.phase-flow.json` — chain 1 / discovery-spec 추출 (discovery stage / 입력 어댑터 4종)
- `spec.phase-flow.json` — chain 2 / behavior + acceptance + 7대 통합
- `plan.phase-flow.json` — chain 3 / task-plan (task 분해 / ADR / NFR / risk — ★ v10.0.0 gate #3 본격)
- `test.phase-flow.json` — chain 4 / test-spec + 실 test code (RED)
- `implement.phase-flow.json` — chain 5 / impl-spec + 실 impl code (GREEN)

## Cross-cutting (analysis stage / chain 1 진입 전)

- `analysis.phase-flow.json` — analysis stage phase 흐름 (input → discovery → db-schema → architecture → business-logic → formal-spec → characterization → sql-inventory → api → ui → quality)
  - **chain 1 (discovery) 의 INPUT 으로 사용** — legacy 코드 → 7대 산출물 한 방향 추출
  - v1.x 자산 그대로 v2.0 chain 1 진입 전 단계로 흡수

## Canonical artifact registry (★ v12.0.0 신설)

- `artifact-registry.json` — JSON-only deliverable 이름 allow-list (lifecycle-contract + phase-flow 파생 / `.json`·`.jsonl`·`.yaml` 만). drift-validator `--check-handoff-consistency` 가 stage 간 산출물 handoff / rename-drift 검출 시 참조 (both-sides-wrong rename anchor = registry 등재 여부).

## 미채움 흐름 (☐ v2.x+ lifecycle 확장)

- `design.phase-flow.json` — 설계 stage 흐름 (★ chain 2 와 차별화 시점 carry)

자세한 인터페이스: `methodology-spec/lifecycle-contract.md`

## drift-validator 호출 (★ v12.0.0 JSON-only)

drift-validator 는 JSON-only 정합 검사 flag dispatcher (★ v12 ADR-011 — 구 `.json↔.mermaid` pair-mode 폐기):

- `--check-layout` — manifest ↔ workflow ↔ skills 3-way layout (analysis)
- `--check-chain-layout` — chain stage layout (discovery~implement)
- `--check-state-flow-consistency` — state.schema enum ↔ sdlc-4stage-flow stages
- `--check-handoff-consistency` — artifact handoff / rename-drift (artifact-registry)

release-readiness check3 가 `--check-state-flow-consistency` + `--check-handoff-consistency` 를 게이트 subprocess 로 실행.

## 향후 (v2.0+)

- 사용자 프로젝트의 stage 진척도 (`<user-project>/.aimd/state.json`) 와 cross-link
- skill 호출 시 prerequisite phase 자동 체크 (예: phase-3 미완료 시 phase-5 호출 거절)

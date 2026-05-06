# agents/ — SDLC 4-stage chain agent (★ v2.0 chain harness)

본 디렉토리 = SDLC stage 별 specialized sub-agent. plugin install 후 자연어 prompt 매칭 시 자동 호출 (또는 사용자 명시 호출).

## 디렉토리 구성

| 디렉토리 | stage | 상태 | 역할 |
|---|---|---|---|
| [`analysis/`](./analysis/) | analysis stage (chain 1 진입 전) | ★ ★ 활성 | Legacy 코드 → 7대 산출물 한 방향 추출. v1.x 자산 (Phase 0~6 + 4.5). |
| [`planning/`](./planning/) | chain 1 / planning | ★ 활성 (sub-plan-4 채워짐) | legacy 분석 결과 → planning-spec (UC + 비즈니스 의도) |
| [`spec/`](./spec/) | chain 2 / spec | ★ 활성 | behavior-spec + acceptance-criteria + 7대 통합 (executable contract) |
| [`test/`](./test/) | chain 3 / test | ★ 활성 | test-spec + 실 test code (RED 의무) |
| [`implement/`](./implement/) | chain 4 / impl | ★ 활성 | impl-spec + 실 impl code (GREEN / 100% test pass) |
| [`design/`](./design/) | (carry / v2.x) | ☐ placeholder | design stage 미채움 — chain 2 spec 과 차별화 시점 carry |

## 호출 cadence

| stage | 자동 호출 trigger | 매뉴얼 호출 |
|---|---|---|
| analysis | "이 코드베이스 분석 시작" / "inventory 추출" / 코드베이스 자동 detection | `@agents/analysis/` |
| planning | chain-driver `next` (analysis 종결 후) / "기획 단계 시작" | `@agents/planning/` |
| spec | gate #1 통과 후 / "behavior spec / acceptance criteria" | `@agents/spec/` |
| test | gate #2 통과 후 / "test spec 생성 RED" | `@agents/test/` |
| implement | gate #3 통과 후 / "impl spec 생성 GREEN" | `@agents/implement/` |

★ ★ ★ chain harness gate trio enforcement: 사용자가 stage 순서 무시하고 호출 시 hook (PreToolUse) + chain-driver state.blocked 가 차단.

## 각 agent 의 skill 위치

| agent | 사용 skill 위치 | 산출 deliverable |
|---|---|---|
| analysis | [`../skills/analysis/`](../skills/analysis/) (18 skill) | 7대 산출물 + finding + antipatterns + migration-cautions |
| planning | [`../skills/planning/`](../skills/planning/) (3 skill) | `planning-spec.{json,md}` |
| spec | [`../skills/spec/`](../skills/spec/) (3 skill) | `behavior-spec` + `acceptance-criteria` + 7대 통합 |
| test | [`../skills/test/`](../skills/test/) (3 skill) | `test-spec` + 실 test code (RED) |
| implement | [`../skills/implement/`](../skills/implement/) (2 skill) | `impl-spec` + 실 impl code (GREEN) |

★ `_base/` skill 5종 (apply-template / build-traceability-matrix / invoke-go-stop-gate / log-finding / apply-baseline-ratchet) 은 모든 agent 가 공유.

## 참조

- [`../README.md`](../README.md) — plugin user 진입점 (시나리오 A/B/C)
- [`../flows/sdlc-4stage-flow.json`](../flows/sdlc-4stage-flow.json) — chain harness master SSOT (★ stages + revisit_edges + 4 gate)
- [`../methodology-spec/lifecycle-contract.md`](../methodology-spec/lifecycle-contract.md) — SDLC stage 간 data contract
- ADR-CHAIN-001~005 — chain harness 5 요소 enforcement 명세
- DEC-2026-05-06-sub-plan-4-종결 — 5 chain agent README 정식 채움 record

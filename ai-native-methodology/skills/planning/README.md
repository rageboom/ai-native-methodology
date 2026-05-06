# skills/planning/ — chain 1 (planning stage / legacy → planning-spec)

본 디렉토리 = chain harness 1 단계 / **legacy 분석 결과 → planning-spec 추출** (1차 single-case = legacy-extraction 모드).

## 호출 cadence

- **trigger**: analysis stage 종결 후 / chain harness 진입 시 첫 stage
- **자연어**: "기획 단계 시작" / "use case 분해" / "비즈니스 의도 식별"
- **chain-driver**: `init <project>` 후 첫 `next`

## skill 3종 (sub-plan-4 채움 ✅)

| skill | 역할 |
|---|---|
| [`extract-from-legacy/`](./extract-from-legacy/) | analysis 7대 산출물 → planning-spec 1차 추출 |
| [`decompose-use-cases/`](./decompose-use-cases/) | UC-* 분해 (use case granularity) |
| [`identify-business-intent/`](./identify-business-intent/) | 비즈니스 의도 식별 (domain priority + intent-tag) |

## v2.0 paradigm 정합

★ ★ ★ DEC-2026-05-06-v2.0-i-strict-채택 / DEC-2026-05-06-round-trip-부분-허용:
- chain 1 = analysis 자산 (7대 산출물) 위에서 시작
- "1차 single-case = legacy-extraction" 명시
- AI 자동 ≥ 85% / 사용자 검토 ≤ 15% / gate #1 통과 의무
- 70~80% 한계 명시 잔존

## gate #1 (다음 stage 진입 자격)

[`../../tools/planning-extraction-validator/`](../../tools/planning-extraction-validator/) 자동 호출:
- planning-spec source-grounded coverage ≥ 0.80 의무
- 위반 시 state.blocked=true / cli exit 2 / chain 2 진입 차단

## 산출물

- `<project>/.aimd/output/planning-spec.{json,md}` — UC-* + 비즈니스 의도 + domain priority

## Sibling

- [`../analysis/`](../analysis/) — analysis stage / 본 stage 의 input (7대 산출물)
- [`../spec/`](../spec/) — chain 2 / 본 stage 의 output 활용 (UC → BHV)
- [`../_base/invoke-go-stop-gate/`](../_base/invoke-go-stop-gate/) — gate #1 호출

## 참조

- [`../../methodology-spec/deliverables/17-planning-spec.md`](../../methodology-spec/deliverables/17-planning-spec.md) — planning-spec 명세
- [`../../schemas/planning-spec.schema.json`](../../schemas/planning-spec.schema.json) — schema
- ADR-CHAIN-001 (chain-4-stage-enforcement) + ADR-CHAIN-002 (go-stop-gate)
- DEC-2026-05-06-sub-plan-4-종결 — 3 skill 정식 채움 record

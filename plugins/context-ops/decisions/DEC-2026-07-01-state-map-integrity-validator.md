# DEC-2026-07-01-state-map-integrity-validator

**state-map 참조 무결성 validator 신설 + analysis gate#0 조건부 배선 — 미정의 state 전이가 schema+evidence 게이트를 GREEN 통과하던 검증 갭 A 해소 (MINOR / v0.92.0 시행)**

**상태**: **시행 (v0.92.0 MINOR)**. mis-fe-admin FE dogfood live-probe(93 state-map / 279 machine)로 실 dangling 참조 1건 검출·교정 → 93/93 PASS. validator 단위 9/9 + gate 통합(HARD block) + release-readiness 44/44. MIS-539 [OP-VALIDATION-001] / MIS-366 하위. Resolves F-DOGFOOD-018.

## 맥락 (검증 갭 A)

chain spine(UC→BHV→AC→TC→IMPL)은 결정론 validator 로 참조 무결성이 닫혀 있으나, analysis **FE 구조 산출물 `state-map.json`** 은 schema(구조) + evidence({file,line})만 검사되고 전이 그래프의 *참조 무결성*(전이 타깃이 정의된 state 를 가리키는가)을 검증하는 계층이 없었다. 직전 세션 실증: `SUBMIT → "validatingX"`(정의 안 된 state)로 전이하는 **schema-valid** state-map 이 schema-validator(exit 0) + evidence-scan(exit 0)을 **모두 GREEN 통과**.

## 진단

- **근본 원인**: `schemas/state-map.schema.json:183` `target:{type:"string"}` — 전이 타깃/`initial`/`final_states`/`child_states`/parallel `regions`/history `default_target` 가 모두 free string. JSON Schema 는 "값 ∈ states 키"라는 참조(referential) 제약을 구조적으로 검증 불가(구조 검증 도구의 본질적 한계).
- **기존 자산 실측(진단 후 설계)**: schema-validator = 구조만 / evidence-scan(analysis-extraction-validator) = {file,line} 실재성만. 어느 것도 참조를 검증 안 함. br-cross-consistency-validator(BR 두 표현 정합)의 FE 등가물 부재.

## 결정

**신규 결정론 tool `tools/state-map-integrity-validator/`** — br-cross-consistency-validator 의 FE 판. 머신별 참조 무결성 검사:

| 검사 | severity | gating |
| --- | --- | --- |
| transition `target ∈ states` (근본 갭 / line 183) | high | ✅ |
| `initial ∈ states` | high | ✅ |
| `final_states ⊆ states` | high | ✅ |
| `child_states ⊆ states` (compound) | high | ✅ |
| `parallel_regions[].regions ⊆ states` | high | ✅ |
| `history[].default_target ∈ states` | high | ✅ |
| 도달 불가 state (initial 서 BFS 미도달) | medium | ❌ advisory |

**severity 비대칭 (1차 출처 검증 / 4원칙 §2)**:
- dangling reference = **gating(high)** — W3C SCXML 1.0 REC §3.11: 전이 `target` 은 "legal state specification" **MUST** → 미존재 = 비적합 문서. XState v5 `stateUtils.ts`: undefined target/initial 은 machine 생성 시점 **throw**(hard error).
- 도달 불가 = **advisory(medium/non-gating)** — guarded transition · 의도적 dead state · 부모/병렬 진입으로 false-positive 구조적 내재. XState graph 도구·YAKINDU 모두 severity 미부여 → 결정론 gate 신뢰 훼손 회피를 위해 비차단.

**입력 계약**: canonical 스키마 포맷(`machines[]`)만 대상. `machines` 부재/`[]`(BE/N-A) → passed=true·0 findings. old-format(`state_machines[]`) 거부는 schema-validator 소관(double-jeopardy 회피).

**신뢰모델(STRONG-STOP 정합)**: 100% 결정론 구조 검사(`target ∈ states` 는 확정 판정) → 결정론 gate 에 **적법**. codegraph·scope-carve류 reference-lens 와 다름 — graph-integrity-validator · code-pointer-validator 동급의 결정론 gate. LLM 판단 inject ❌(`feedback_chain_driver_deterministic_axis` 위반 아님).

## 변경 사이트

1. **신규 tool** `tools/state-map-integrity-validator/` — `src/validator.js`(순수 함수) + `src/cli.js`(positional + `--format`/`--json`) + `package.json`(workspace 멤버) + `README.md` + `test/validator.test.js`(9) + `test/fixtures/{clean,broken-target,missing-initial,unreachable,refs-bad}.json`.
2. **gate#0 조건부 배선** (FE state-map 존재 시 / `sql-inventory-validator` 패턴):
   - `tools/findings-aggregator/src/cli.js` — `buildAnalysisArgs` case(`artifacts['state-map']`) + `main()` extraValidators 트리거.
   - `tools/findings-aggregator/src/aggregator.js` — `dispatchValidator` case → `transformGeneric`(`summary.high` → gate-eval `validator_high` HARD_BLOCK).
   - `flows/sdlc-4stage-flow.json` gates[#0].conditional_validators + `flows/analysis.phase-flow.json` cross_cutting.validators (check26 4중 정합 유지).
   - `tools/chain-driver/src/gate-eval.js` — `REQUIRED_VALIDATORS_PER_STAGE.analysis` 주석 보강(배열 무변경 = base set).

## dogfood (live-probe / mis-fe-admin)

stale poc-04(OLD 포맷)·poc-16(machines:[]) 대신 **사내 mis-fe-admin 실제 93개 canonical state-map(279 machine)** 에 validator 직접 실행 = 참조 무결성 최초 실측. **91→93 PASS / 실 dangling 참조 1건 검출**:
- `BC-GEA-IN-HOUSE-LOAN-DEDUCTION` / `FSM-FE-GEA-INLD-001`: `loaded --CLOSE_TOGGLE--> "closing"`(states 에 없음 / source_ref `InHouseLoanDeductionBottom.tsx:144`). DEC-2026-06-24 가 "참조 무결성 잔여 0" 이라 기록했으나 그 주장은 *참조를 검증 안 하는* schema-validator 로 한 것 → 사람 검토+게이트 모두 놓침.
- **교정**: 코드 조사(`deadlineApiHandler` = deadlineApply mutation lifecycle) 후 누락된 `closing` state 추가(CLOSE_SUCCESS→fetching / CLOSE_ERROR→loaded, source_ref grounding). 저자 의도(별도 마감 이벤트/상태) 보존. → 93/93 PASS.
- 사내 source = `examples/` 밖 / 외부 절대경로 / commit ❌ (`feedback_internal_source_poc_external_location`). 결과 수치만 본 DEC/CHANGELOG 기록.

## 안 하는 것 (명시)

- `schemas/state-map.schema.json` 무변경 — JSON Schema 로 참조 제약 표현 불가가 근본 원인이므로 결정론 validator 로 보완(schema 는 구조 SSOT 유지).
- gate-eval `REQUIRED_VALIDATORS_PER_STAGE.analysis` 배열 무변경 — 신규 validator 는 **조건부**(FE state-map 존재 시만 / sql-inventory·self-consistency 동형), base set 아님.
- reachability 를 gating 으로 격상 ❌ — false-positive 구조적 내재(1차 출처). advisory 유지.
- poc-04 fixture(OLD 포맷) migration ❌ — schema-validator 소관 / 본 validator 는 canonical 포맷만. dogfood 는 mis-fe-admin canonical 실산출물로 대체.

## 검증

- validator 단위 9/9 (clean/broken-target/missing-initial/unreachable/refs-bad + N-A + 입력방어 + internal-transition).
- gate 통합 실측: broken state-map 등록 → aggregate high=1 → gate-eval `validator_high` → block(user 'go' override 거부 = HARD) / clean → high 0.
- mis-fe-admin 93/93 PASS(교정 후).
- release-readiness **44/44** (workspace test 신규 tool 9 자동 발견·pass / check26 gate-validator-list-consistency PASS). 3-way 0.92.0.

## Relates

- `DEC-2026-06-06-analysis-exit-gate`(gate #0 조건부 validator base / findings-aggregator 러너) · `DEC-2026-06-22`(analysis-self-consistency-validator = 직전 조건부 validator 선례) · ADR-CHAIN-011(br-cross-consistency-validator = BR 두 표현 결정론 정합 / 본 tool 의 모) · `DEC-2026-05-28 §4.2`(reference-lens vs 결정론 gate 신뢰모델) · `feedback_chain_driver_deterministic_axis`(STRONG-STOP) · `feedback_diagnose_before_design_check_existing`(기존 자산 실측 후 설계) · `feedback_internal_source_poc_external_location`(사내 dogfood 외부 격리) · `feedback_live_probe_vs_retroactive`(live-probe paradigm). Resolves F-DOGFOOD-018.

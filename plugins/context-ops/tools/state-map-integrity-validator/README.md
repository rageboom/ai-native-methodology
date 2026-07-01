# state-map-integrity-validator

FE `state-map.json`(산출물 8 / SCXML 1.0 · XState v5 호환 FSM)의 **참조 무결성**을 결정론으로 검증한다.

## 왜

`schemas/state-map.schema.json` 은 transition `target` / `initial` / `final_states` /
`child_states` / parallel `regions` / history `default_target` 를 모두 free string 으로 둔다
(JSON Schema 는 "값이 정의된 state 키에 속하는가"를 구조적으로 검증 못 함). 그 결과
`SUBMIT → "validatingX"`(정의 안 된 state)로 전이하는 **schema-valid** state-map 이
schema-validator(exit 0) + evidence-scan(exit 0)을 **모두 GREEN 통과**하던 갭이 있었다.
본 validator 가 그 참조 무결성 계층을 닫는다 — `br-cross-consistency-validator`(BR 두 표현
정합)의 FE 판.

## 검사 항목 · severity

`gate-eval` 은 critical/high 만 차단한다.

| 검사 (머신별) | severity | gating |
| --- | --- | --- |
| transition `target ∈ states` | high | ✅ |
| `initial ∈ states` | high | ✅ |
| `final_states ⊆ states` | high | ✅ |
| `child_states ⊆ states` (compound) | high | ✅ |
| `parallel_regions[].regions ⊆ states` | high | ✅ |
| `history[].default_target ∈ states` | high | ✅ |
| 도달 불가 state (initial 서 BFS 미도달) | medium | ❌ advisory |

### severity 비대칭 근거 (1차 출처)

- **dangling reference = gating(high)**: W3C SCXML 1.0 REC §3.11 — 전이 `target` 은
  "legal state specification" **MUST** → 미존재 = 비적합 문서. XState v5 `stateUtils.ts` —
  undefined target/initial 은 machine 생성 시점 **throw**(hard error).
- **도달 불가 = advisory(medium/non-gating)**: guarded transition · 의도적 dead state ·
  부모/병렬 진입으로 false-positive 구조적 내재 → XState graph 도구·YAKINDU 모두 severity
  미부여. 결정론 gate 신뢰 훼손 회피를 위해 비차단.

## 입력

canonical 스키마 포맷 `{ machines: [{ id, initial, states, ... }] }`.
`machines` 부재 또는 `[]`(BE / FE 무관 산출물) → `passed=true`, 0 findings (N/A).
old-format(`state_machines[]`) 거부는 schema-validator 소관(double-jeopardy 회피).

## 사용

```
node src/cli.js <path-to-state-map.json> [--format text|json]
```

exit: `0`=pass / `1`=참조 결함(critical/high ≥ 1) / `2`=usage·읽기 실패.

## 출력 (`--json`)

```json
{ "passed": false, "findings": [ { "id": "F-STATEMAP-001", "severity": "high",
  "machine_id": "FSM-FE-LOGIN-001", "rule": "transition_target_undefined",
  "message": "...", "from_state": "idle", "event": "SUBMIT", "ref": "validatingX" } ],
  "summary": { "critical": 0, "high": 1, "medium": 0, "low": 0, "info": 0 },
  "machine_count": 1 }
```

`findings-aggregator` `transformGeneric` 가 `summary.high` → gate-eval `validator_high`
(HARD_BLOCK) 로 매핑 → chain-driver analysis gate 차단.

## 배선

analysis gate #0 **조건부** validator — manifest `analysis_refs.artifacts['state-map']`
존재 시 `findings-aggregator` 가 발동(`sql-inventory-validator` 패턴).
`flows/sdlc-4stage-flow.json` gates[#0].conditional_validators 등재.

## trust

100% 결정론 구조 검사(`target ∈ states` 는 확정 판정) → 결정론 gate 적법
(graph-integrity-validator · code-pointer-validator 동급 / LLM 판단 inject ❌).

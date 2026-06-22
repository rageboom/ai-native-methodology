# DEC-2026-06-22-unit-spec-oracle-symmetry

**결정**: 옵션 1(권고) 채택 — `unit_test_obligation=required` UNIT 이 검증 oracle(invariant_refs / property_test_refs / characterization_snapshot_refs)을 ≥1 가리키도록 신규 soft validator `unit-spec-oracle-validator` 로 강제(없으면 `oracle_waiver` 정직 사유). behavior 의 `verifiable⇒test_case_refs` 짝 규칙을 unit 층에 대칭. soft(medium-only) → ≥2 도메인 입증 후 hard 격상(별도 promotion DEC). (v0.69.0 MINOR / additive·conditional·soft)

## 배경

spec 단계에 behavior 스레드와 unit 스레드의 **비대칭**이 있었다.

- **behavior**: `BHV → AC(acceptance-criteria) → TC`. AC 는 `verifiable=true ⇒ test_case_refs≥1` 을 `acceptance-criteria.schema.json` if/then **하드게이트**로 강제 — "검증 가능하다고 했으면 검증할 대상을 실제로 대라".
- **unit**: `UNIT(unit-spec) → TC(test_layer=unit)`. UNIT 은 `unit_test_obligation=required` 를 선언할 수 있으나, "무엇을 만족하면 합격인가(oracle)" 를 가리키는 `invariant_refs`/`property_test_refs` 가 **optional → 0건으로 통과 가능**. → test 단계에서 합격선을 발명하거나 구현을 보고 역으로 맞추는 **거짓 GREEN**. unit-spec 이 막으려던 "mock=검증 안 된 가정" 의 사촌.

사용자(TF Lead) 관찰("스펙 단계에 동작 인수기준(AC)은 있는데 unit 인수기준은 없다")에서 출발. diagnose-before-design 실측(`feedback_diagnose_before_design_check_existing`): `unit-spec.schema.json` required = `[id, provenance, kind, code_pointer, unit_test_obligation]` 뿐 / `invariant_refs`·`property_test_refs` optional / `formal-spec.invariants` 본문 미구조화(count+path) → required UNIT 이 oracle 0건으로 spec→plan→test 게이트 통과 가능 = 실재 구멍. decisions INDEX 검색 — unit 관련 DEC(06-11 스레드 도입 / 06-12 obligation·mock hard flip)에 "unit 합격기준 부재" 미등록 = 신규 통찰.

**실측 baseline**(pre-fix / 추정 ❌): unit-spec.json 2개. required UNIT 4개 중 oracle-0건 **3개** — poc-18 `UNIT-ENCRYPTION-001`·`UNIT-PICK-001`(characterized_from_code) + poc-21 `UNIT-FORMAT-001`(designed_from_spec). poc-21 `UNIT-ALLOC-001` 은 invariant_refs 4개 = 통과.

## 옵션

- **옵션 1 (권고·채택)**: `required ⇒ oracle≥1` 대칭 강제 — soft validator 신설. oracle 채널 3종(invariant/property/characterization_snapshot). 없으면 oracle_waiver. unit 마다 Gherkin AC 같은 새 노드 ❌(인벤토리 철학 보존) — 기존 oracle 앵커를 가리키게만.
- **옵션 2**: 현상 유지 + DEC 로 "unit 합격기준 = invariant/characterization cross-link 로 충분" 명문화만.
- **옵션 3**: unit-acceptance 노드 신설(과설계 / 인벤토리 철학 충돌 / 비채택).

사용자 일괄 승인(2026-06-22): 옵션 1 + characterization_snapshot_refs 필드 지금 추가 + 본체+2 PoC waiver 라운드트립 dogfood.

## 결정 (옵션 1 시행)

- **schema**(`schemas/unit-spec.schema.json` units[].items / additive): `oracle_waiver`(string·minLength:1 정직마커) + `characterization_snapshot_refs`(string[]·`^SNAP-` / S2 AS-IS oracle 채널). **`required⇒oracle` if/then 은 schema 에 넣지 않음**(넣으면 schema-validator 가 막아 hard 가 됨 — validator 담당).
- **신규 `tools/unit-spec-oracle-validator/`**: `validateUnitOracle(unitSpec, charObj)` — required UNIT 의 (invariant_refs ∪ property_test_refs ∪ characterization_snapshot_refs) ≥1 OR oracle_waiver. 위반 = `unit.oracle.missing`(medium). charObj 주어지면 snapshot dead-ref(`unit.oracle.dangling_snapshot_ref`). **스코프 = required 만**(waived·characterization_only 제외 / 보수). 19 test GREEN.
- **soft 이중 가드**: 모든 finding `severity=medium` 고정 + `gate-eval REQUIRED_VALIDATORS_PER_STAGE.spec` **미등재**. high 경로는 `ORACLE_MISSING_SEVERITY` 상수로만 존재(현재 emit 0) → hard 격상 시 1-edit. 파일 부재 = N/A(빈 결과 exit 0 / unit-spec optional = behavior-only mode / failClosedOnNull 환경 evidence_missing 오탐 차단).
- **wiring**: `flows/spec.phase-flow.json`(unit-spec-derive phase `automated_validation` + `cross_cutting.validators`) + `flows/sdlc-4stage-flow.json` gate#2 `conditional_validators` + `findings-aggregator`(cli.js spec 분기 `extraValidators` + buildValidatorArgs case / aggregator.js dispatch→transformGeneric). check26 4중 정합(symmetric-diff ⊆ conditional allowlist 통과).

## 검증

- validator 19 test + findings-aggregator 68 test 무회귀 GREEN.
- **라운드트립 dogfood**(2 PoC spectrum-cross / §8.1): BEFORE(git HEAD) poc-18 2 medium + poc-21 1 medium = **3 medium** → 두 PoC oracle_waiver 정직 부착(invariant 날조 ❌) → AFTER **0 finding** / 둘 다 exit 0(soft). poc-18=characterized_from_code(legacy-ish), poc-21=designed_from_spec(greenfield) = paradigm 양쪽 작동 입증.
- schema-validator: 두 PoC unit-spec additive 필드 valid. check26 gate_validator_list_consistency PASS.

## 후속 / §8.1

- **§8.1 면제**(additive·conditional·soft / schema optional 필드만 / gate matrix·gate-eval REQUIRED·release criteria(=42) 무변). **hard 격상**(medium→high + REQUIRED.spec 등재) = 별도 promotion DEC + ≥2 도메인에서 oracle 보강(waiver→실 ref) 입증 후 — DEC-2026-06-12-unit-layer-hard-flip 경로 동형.
- **deferred carry**: `characterization_only` obligation oracle 검사 포함(현 required 만) / formal-spec.invariants 본문 구조화(현 count+path) / characterization-spec.json 실수립 PoC 에서 characterization_snapshot_refs 실 ref + dead-ref 검증 실증.

Relates: DEC-2026-06-11-tdd-unit-layer-thread(unit 스레드 모) + DEC-2026-06-12-unit-layer-hard-flip(hard 격상 경로) + DEC-2026-06-22-analysis-self-consistency-validator(soft validator 선례) + feedback_diagnose_before_design_check_existing + feedback_quality_priority(§8.1).

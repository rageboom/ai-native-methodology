# plan — F-DOGFOOD-003 / 007 패치 (§8.1 ≥2 corroboration 잠금 해제 후 시행)

> **trigger**: RealWorld JPA arm (2nd corroboration) → MyBatis arm(#1) + JPA arm(#2) 양쪽에서 F-DOGFOOD-003·007 재현 확인 → §8.1 ≥2 corroboration 충족 → 보류 패치 잠금 해제. 사용자 결단 "a" (패치 구현).
> **4원칙 노트**: step 2(3-agent research)는 경량 — 설계가 finding+기존 ADR 로 이미 결정됨 (intent_certainty enum / Feathers characterization = ADR-CHAIN-006 기존 인용). 신규 설계공간 탐색 아님 → heavy 토론 생략 / 본 plan = step 1.

## Patch A — F-DOGFOOD-003 → `intent_certainty` enum (additive / breaking 0)

**문제(corroborated)**: discovery `business_rules_intent.reasoning` 의 intent 과잉귀속을 Option C guardrail(prose marker `[관찰]/[결과]/[미검증]`)로만 막는데, **검사하는 validator 가 없음**(skill SKILL.md:61 자인 / discovery-extraction-validator 는 br_id match 만). = 양심 의존 = no-simulation 안티패턴. JPA arm 에서 validator 0 findings 인데 reasoning 엔 unverified-intent 존재로 재입증.

**해결(Option B)**: prose marker 를 **구조적 enum 필드**로 승격 → 검증 가능.

1. **schema** `schemas/discovery-spec.schema.json` business_rules_intent.items 에 `intent_certainty` 추가:
   - enum: `["observed", "inferred-consequence", "unverified-intent", "source-refuted"]`
   - **optional** (additive / 기존 PoC breaking 0 / additionalProperties:false 유지하되 property 추가).
   - 매핑: `[관찰]`=observed / `[결과]`=inferred-consequence / `[미검증]`=unverified-intent / 소스반증=source-refuted.
2. **validator** `tools/discovery-extraction-validator`:
   - business_rules_intent item 이 `intent_certainty` 없으면 **WARN**(low/info) — 채택 nudge (강제 아님 = backward-compat).
   - `intent_certainty` = `unverified-intent`|`source-refuted` 인데 reasoning 에 단정 표현 없으면 통과(정직 표기 장려). enum 자체는 schema 가 검증.
   - test 신규 (있음/없음/잘못된 enum / source-refuted 케이스).
3. **skill** `skills/discovery-identify-business-intent/SKILL.md`:
   - prose marker → 구조적 `intent_certainty` 필드 사용 instruction 추가 (marker 는 reasoning 가독성 보조로 유지).
   - SKILL.md:61 의 "비결정적 → 사람 검토" 문구를 "intent_certainty 구조 필드로 부분 결정화 + 잔여는 사람 검토" 로 갱신.
4. **dogfood 산출물**(외부 repo / 선택): JPA + MyBatis discovery-spec 에 intent_certainty 소급 부여 (corroboration 자산).

## Patch B — F-DOGFOOD-007 → brownfield mode (paradigm / ★ additive 설계 / RED gate 비파괴)

**문제(corroborated)**: chain 4 RED 의무("impl 부재→all_fail" / test.phase-flow:33,73)는 **greenfield 전제**. 그러나 방법론 자연 진입(legacy analysis→chain)은 **brownfield**(impl 존재) → 생성 test 는 GREEN. MyBatis arm + JPA arm(16 기존 test) 양쪽 재현.

**해결(★ 비파괴 additive)**: RED gate 를 뜯지 않고 mode 분기 추가.
1. **ADR-CHAIN-016** 신설: "chain 4 RED 의무 = greenfield 전제 / brownfield(legacy 분석 진입) = characterization 모드(기존 동작 고정 / GREEN 기대)". Feathers Characterization(ADR-CHAIN-006 기존 인용)과 정합.
2. **test.phase-flow.json**: `expected_outcome_chain4` 에 brownfield 분기 note 추가 (additive 필드 / 기존 all_fail greenfield 기본 유지 / 파괴 0).
3. ★ **scope 신중**: 2 corroboration 다 RealWorld(동일 도메인 family) → paradigm 변경은 **문서/ADR + additive mode** 까지만. RED enforcement 코드 자체 변경 ❌ (broader corroboration 또는 별도 설계리뷰 전까지). chain-driver gate 로직 미변경.

## 공통 시행 (STOP-3 / release)
- DEC-2026-05-30-fdogfood-003-007-patch (본 패치 SSOT) + INDEX + CHANGELOG + version 3-way.
- STOP-3: workspace test (validator 신규 test 포함) + release-readiness 22/22 + skill-citation 0 stale + breaking 0.
- 버전: Patch A(schema additive + validator)+Patch B(ADR+phase-flow note) = **MINOR** (additive only / breaking 0).

## 위험 / rollback
- Patch A schema additionalProperties:false 에 property 추가 = 기존 PoC(intent_certainty 없음) 여전히 valid (optional). 검증.
- Patch B 가 RED gate 회귀 유발하면 revert (test.phase-flow note 만 / 코드 무변경이라 risk 낮음).

## 핵심 결정 (사용자 승인 묶음)
1. intent_certainty = optional WARN (권장) vs required (breaking)? → **optional WARN** (backward-compat / 추후 major 에 required 승격).
2. Patch B = ADR+phase-flow note 까지만 (RED 코드 비파괴) vs RED gate 코드도 분기? → **문서/additive 까지만** (§8.1 동일도메인 corroboration 신중).
3. 단일 MINOR release vs A/B 분리 release? → **단일 MINOR**.
4. dogfood 산출물 intent_certainty 소급 = 시행 vs 생략? → 시행(corroboration 자산 / 외부 repo).

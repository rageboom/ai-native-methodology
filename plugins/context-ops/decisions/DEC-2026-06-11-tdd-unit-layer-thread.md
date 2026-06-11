# DEC-2026-06-11-tdd-unit-layer-thread

- **일자**: 2026-06-11 (v0.36.0 MINOR)
- **카테고리**: paradigm / 테스트 2층 모델 — behavior(BDD) 스레드에 TDD/unit 층(UNIT-*) 1급 추가
- **상태**: 승인 (사용자[TF Lead] 결단 — AskUserQuestion "전체 UNIT-* 스레드" + "ep-be-gea dogfood PoC #1" / plan `bdd-vivid-dewdrop.md` 승인)

## 맥락 (왜)

방법론 chain 은 **behavior(BDD) 단일 스레드**만 운반했다: `UC→BHV→AC→TASK→TC→IMPL`, `tc-decompose = "1 AC = 1 TC"`. ep-be-gea event dogfood 에서 갭 노출 — 신청 happy-path(AC-009)·번호생성·마스킹을 특성화하며 `DrawNumberGenerator`·`MaskingUtils`·전략 분기를 **mock 으로 빼고 그 부품의 독립 유닛테스트는 만들지 않았다**. 조합(BDD) 테스트는 GREEN 이나, 가장 위험한 부품에 대해 거짓 안심. BDD="ABC 엮은 시나리오" / TDD="A·B·C 각 부품" — 두 층, 둘 다 필요.

사용자 질문 흐름: "BDD/TDD 구분" → "TDD 는 각 클래스, BDD 는 그 조합" → "이거 방법론에 넣는 게 중요" → "discovery/spec/plan 에서 TDD 위해 더 뽑아냈어야 할 산출물 확인". 3-Explore + 3-Plan agent 조사 결론: **유닛 인벤토리는 이미 존재(code-graph/domain.behaviors/code-pointer ast_symbol)·dead-ends in analysis**. 갭 = (a) 2층 모델 미articulate (b) 유닛 스레드 미전파.

## 결정

`UNIT-*` 를 `UC/BHV/AC/TASK/TC/IMPL` 동급 1급 노드로 도입 = DO-178C LLR(Low-Level Requirement) rung. 전체 스레드(스키마·필드·노드·검증기·정책) 본체 추가. 단 아래 3 불변식 준수.

### 결정 1 — 신뢰 분리 (전체 스레드 ↔ DEC-2026-05-28 reconcile)

`code-graph` 는 DEC-2026-05-28 §4.2 에 의해 "reference-lens / NOT gate-injected"(release-readiness check34/36/37/39 강제 / `render.js` method hole severity `low` 고정 / `gate-eval REQUIRED_VALIDATORS_PER_STAGE` coverage validator 0). 하드게이트화 = DEC 위반 + release 회귀. → **2 tier 분리**: spec 파생 UNIT(domain.behaviors+formal-spec.invariants = 결정론·spec-side) = 게이트 후보 / code-graph method-axis = reference-lens·propose-only 보강만. 이 분리가 "full thread"와 reference-lens 경계를 동시 만족.

### 결정 2 — §8.1 ratchet (스캐폴딩 now / 강제 ≥2 PoC 후)

ep-be-gea = PoC #1(단일). 스키마·필드·노드 전부 now / 검증기 soft(`validateMockSoundness` opt-in `--unit-spec` 비주입 / `validateUnitTestObligation` medium 비차단). mock-soundness·unit-coverage 하드게이트 격상 = ≥2 distinct 도메인 PoC corroboration 후 별도 DEC. 2nd PoC 후보 = greenfield 예제(poc-18/numpy-financial) 또는 사내 2nd 도메인.

### 결정 3 — additive·optional·default behavior-only (drift guard)

신규 필드 전부 optional. `test_layer` 미지정 = composition(ac_ref 의무 유지). unit 스레드 미참조 PoC = behavior-only mode 정상. 검증기는 behavior-only PoC flag ❌ (유닛 스레드 opt-in 시에만 분모 진입 / false-health 차단). 기존 PoC 25/25 무회귀 입증.

### 결정 4 — 재사용 우선 (SSOT)

신규 class_ref/method_ref 원시필드 ❌ → 기존 `code-pointer.ast_symbol` 재사용. 인벤토리 신규 array 남발 ❌ → `domain.behaviors`+`formal-spec.invariants` 인덱싱하는 얇은 `unit-spec.json`.

### 결정 5 — 시나리오 분기

S2(레거시 AS-IS)=유닛 이미 존재 → `code-graph ∩ domain.behaviors` 발견(provenance=characterized_from_code / 유닛테스트=characterization) / greenfield·S1=유닛 미존재 → `formal-spec.invariants.aggregate_root` 설계(designed_from_spec / RED→GREEN TDD). S2 에 forward 유닛 설계 강제는 무의미(busywork) — provenance 가 per-unit 으로 가름.

## 변경 (시행)

- **신규** `schemas/unit-spec.schema.json` (UNIT-* SSOT) + deliverable `methodology-spec/deliverables/27-unit-spec.md` + 정책 `methodology-spec/policies/test-layering.md` (2층 모델·mocking-soundness·시나리오·canon SSOT) + `id-conventions.md` UNIT-* 등재.
- **schema 필드(additive)**: behavior-spec `behaviors[].unit_refs` / task-plan `tasks[].unit_refs`+`unit_test_obligation` / test-spec `test_cases[].test_layer`+`class_ref`+`mocks[]`(ac_ref 조건부 allOf) / traceability-matrix cell `unit_id`+`unit_test_id` + `coverage_summary.unit_coverage` / lifecycle-contract 매핑.
- **검증기/도구**: spec-test-link `validateMockSoundness`(soft opt-in) + test_layer=unit no_ac_ref skip / plan-coverage `validateUnitTestObligation`(medium soft) / matrix-builder `--unit-spec` → unit_coverage 별 axis.
- **skill**: test-generate-test-spec step 3 = 피라미드 권고 → UNIT 앵커 bottom-up 규칙.
- **carry**: flows/{test,spec,plan}.phase-flow.json 편집(drift-validator handoff 위험 / skill 이 운영 본체·격상 완료 / 별도 focused 작업) · mock-soundness·unit-coverage 하드게이트(≥2 PoC) · code-graph method-axis→unit anchor flip(reference-lens 민감 / 보류).

## 근거 (research 검증 / 정확성 플래그)

Beck TDD(2002 red-green-refactor) · Cohn Test Pyramid(2009 **originator** / Fowler 2012 popularizer) · Fowler "Mocks Aren't Stubs"(2007 — mock 위험만 / 해법=본 방법론 합성+CDC, 과잉 귀속 ❌) · Jay Fields solitary/sociable(via Fowler) · Feathers WELC(2004 characterization/seam) · Adzic SBE(2011 + 10yr 함정) · Claessen-Hughes QuickCheck(ICFP 2000).

## 검증 (STOP)

- schema-validator: unit-spec 컴파일·instance·waiver guard / 기존 PoC 25/25 무회귀.
- 도구 테스트: spec-test-link 11/11 · plan-coverage 47/47 · matrix-builder 172/172.
- drift-validator chain-layout 0 orphans / reference-lens 가드 무수정.
- **PoC #1 (ep-be-gea / 외부격리·commit❌)**: DrawNumberGeneratorTest 52 + MaskingUtilsTest 6 = 실 JUnit 58 GREEN(hash f75f3918·dc4f8f9b) / event unit-spec.json(4 UNIT) schema-valid / matrix unit_coverage{ratio:1, total:4, tested:2} / behavior 체인 92.3% 무회귀 / mock-soundness 0 findings(sound — TC-009 mock DrawNumberGenerator → TC-014 핀).
- release-readiness 40/40 + version 3-way(plugin.json 0.36.0 ↔ CLAUDE.md ↔ README).

## Resolves / 관련

- 사용자 "방법론에 넣는 게 중요" 결단 / plan `~/.claude/plans/bdd-vivid-dewdrop.md`.
- DEC-2026-05-28(code-graph reference-lens 불변) 보존 / DEC-2026-06-03-s2(characterization 함정 — mutation 보강) 정합 / DEC-2026-06-10-3a-deflate(operability axis) 정합.
- memory `project_epbegea_dogfooding`(PoC #1) / `feedback_quality_priority`(§8.1) / `feedback_diagnose_before_design_check_existing`.

<!-- allow-provenance: 정책 SSOT — 2층 모델 근거(DEC·canon 인용·시나리오 grounding)가 본문 핵심 내용 (정책 doc grounding 동형). -->

# Test Layering — 2층 테스트 모델 (unit 층 + composition 층)

> **상태**: v0.36.0 신설 (DEC-2026-06-11-tdd-unit-layer-thread). policies SSOT (automation-boundary.md · no-simulation.md · honesty-tiers.md 동렬).
> **한 줄**: 방법론 chain 은 **두 층의 테스트**를 운반한다 — 바닥에 **unit 층**(클래스·순수함수·컴포넌트 = 빌딩블록을 격리 검증), 그 위에 **composition 층**(빌딩블록을 조합·mock 해 행위/AC 를 검증). 둘은 **layer(위치) 축**의 두 값이고, 양자택일 ❌ / 둘 다 필요.
> **⚠️ 명명 주의**: 본 문서가 종종 쓰는 **"TDD/unit 층" · "BDD/composition 층"** 은 **mnemonic 약칭**이지 정밀 분류가 아니다. TDD·BDD 는 **기법(technique 축)** 이고 unit·composition 은 **위치(layer 축)** 라서 — 두 축을 묶은 라벨이다. 정밀 모델은 §2.1 **technique × layer 매트릭스**. (산출물 필드는 이미 `type`=기법 / `test_layer`=위치 로 **분리되어 정확**하다 — 느슨한 건 라벨뿐.)

## 1. 왜 — 단일 BDD 스레드의 구멍

chain 의 행위 스레드는 `UC→BHV→AC→TASK→TC→IMPL` 로 모든 링크가 행위 단위이고, test 단계는 `tc-decompose = "1 AC = 1 TC"` 로 AC 단위로만 분해한다. 이건 **BDD(behavior/acceptance) 분해**다. 그러나 그 시나리오들이 **조합·mock 하는 빌딩블록(A·B·C 클래스/순수함수)의 격리 테스트 = unit 층**은 chain 에 표상되지 않았다.

ep-be-gea event scope dogfood 에서 노출(PoC #1): 신청 happy-path·번호생성·마스킹을 특성화하며 `DrawNumberGenerator`·`MaskingUtils`·전략 분기를 **mock 으로 빼고 그 부품의 독립 유닛 테스트는 만들지 않았다**. 조합 테스트는 GREEN 이지만 — 가장 위험한 부품(분산락 동시성·번호 충돌 재시도)에 대해 **거짓 안심**을 준다. 이것이 본 정책이 닫는 구멍이다.

## 2. 두 축의 구분 (혼동 금지)

테스트는 직교하는 **두 축**으로 분류된다:

| 축 | 무엇 | 값 (산출물 필드) |
| --- | --- | --- |
| **technique** | 어떤 기법 | `test-spec.test_cases[].type` = unit/integration/contract/e2e/property/mutation/security/load/visual/a11y |
| **layer** (position) | 피라미드 위치 | `test-spec.test_cases[].test_layer` = **unit**(격리 빌딩블록) / **composition**(조합·mock) |

→ `type=unit, test_layer=unit` = 순수 유닛테스트 / `type=integration, test_layer=composition` = BDD 시나리오. **technique 가 unit 이라고 layer 가 unit 인 게 아니다.** (기존 chain 은 `type` 만 있고 `test_layer` 가 없어 둘을 혼동했다.)

### 2.1 "TDD/unit" · "BDD/composition" 라벨은 mnemonic — 정밀 분류 아님

본 문서의 층 이름은 대구(對句)로 읽기 쉬우나 **기법 이름을 위치에 묶은 약칭**이라 엄밀하지 않다. 두 축은 직교하므로 한 라벨로 합칠 수 없다:

- **BDD 는 unit 일 수 있다** — BDD(Dan North, 2006)는 본래 **유닛 레벨 TDD 의 재명명**(`test`→`should/behavior`)으로 출발했고, **RSpec `describe/it`** 이 전형적 **unit-layer BDD** 다. acceptance 레벨 BDD(Cucumber/Gherkin · Adzic SBE)는 이후 갈라진 가지. 즉 BDD ≠ composition. **본 방법론이 BDD 를 composition 위치에 적용하기로 _선택_** 한 것(Gherkin AC 가 부품을 조합·mock)이지, BDD 가 본질적으로 비-unit 이라서가 아니다.
- **unit 층이 항상 TDD 인 것도 아니다** (대칭 결함) — S2(레거시)의 unit-layer 테스트는 test-first TDD(Beck)가 아니라 **characterization(Feathers)** 이다(코드 後 동작 핀). §4 provenance 분기 참조.

**결론**: 정밀하게는 **layer 축 = {unit, composition}** 으로만 부르고, 거기에 적용한 **technique(TDD·BDD·characterization·property…)** 은 별도 표기한다. "TDD/unit"·"BDD/composition" 은 직관용 mnemonic 으로만 읽을 것. 코드(필드)는 `type`(technique) / `test_layer`(layer)로 이미 분리되어 정확하므로 **스키마 변경 없음** — 본 절은 prose 라벨의 정직 교정이다.

근거 — **Cohn 테스트 피라미드** (Mike Cohn, *Succeeding with Agile*, 2009 / originator): 많은 unit(바닥) → 적은 service → 최소 UI(꼭대기). (Martin Fowler "TestPyramid" bliki 2012/2017 = popularizer / originator 아님.) `skills/test-generate-test-spec` 의 "unit 60% / integration 25% / contract 10% / e2e 5%" 권고가 이 피라미드의 표현 — 본 정책이 그것을 **UNIT-\* 앵커 규칙으로 격상**한다(§5).

## 3. UNIT-\* = unit 층의 1급 노드

`UNIT-*`(unit-spec.json)는 `UC/BHV/AC/TASK/TC/IMPL` 과 동급 1급 노드 = 1 격리 테스트 단위. DO-178C 사다리(System Req→HLR→LLR→Source→Test)의 **LLR(Low-Level Requirement) rung** = 매트릭스가 표방했으나 비어 있던 단.

**behavior 층과의 join**: `behavior-spec.behaviors[].unit_refs`(BHV 가 조합하는 UNIT) / `task-plan.tasks[].unit_refs`(TASK 가 만드는 클래스) / `test-spec.test_cases[].class_ref`(test_layer=unit TC 가 검증하는 UNIT) / matrix `unit_id`+`unit_test_id`.

**재사용 우선(SSOT / 신규 원시필드 ❌)**: UNIT 의 코드 좌표 = 기존 `code-pointer.anchor_type=ast_symbol`(`symbol="Class.method"`) 재사용. 인벤토리 = `code-graph`(ClassDef/MethodDef) + `domain.entities[].behaviors[]` + `formal-spec.invariants[]` 를 **인덱싱**(중복 생성 ❌).

## 4. 시나리오 분기 — 인벤토리 출처가 다름

| 시나리오 | UNIT 출처 | provenance | 유닛테스트 성격 |
| --- | --- | --- | --- |
| **S2 (레거시 AS-IS)** | 코드 이미 존재 → analysis `code-graph ∩ domain.behaviors` 에서 **발견** (spec 단계 emit / `spec-derive-unit-spec` skill) | `characterized_from_code` | characterization (AS-IS 핀 / Feathers) |
| **greenfield · S1** | 코드 미존재 → `formal-spec.invariants[].aggregate_root` 에서 **설계** (spec 단계 emit) | `designed_from_spec` | RED→GREEN (test-first TDD / Beck) |

- **Feathers** (*Working Effectively with Legacy Code*, 2004): characterization test = 기존 코드의 **관찰된 동작을 핀**(버그 포함). seam = 안전 주입점. S2 의 유닛테스트는 이것 — 동작 보존이지 설계가 아니다.
- **Beck** (*Test-Driven Development: By Example*, 2002): red-green-refactor — 실패 테스트 먼저 → 코드. greenfield UNIT 은 이것 — 코드를 견인.
- **결론**: S2 에 "forward 유닛 설계"를 강제하면 무의미(busywork). S2 = 발견+특성화 / greenfield = 설계+TDD. provenance 필드가 per-unit 으로 가른다.

## 5. mocking-soundness 계약 (본 방법론 합성)

**규칙**: composition TC 가 협력자 X 를 mock 하면, 그 mock 은 **X 가 자기 `test_layer=unit` TC 로 핀될 때만 건전**하다. X 가 unit 테스트가 없으면 — mock 은 X 의 동작에 대한 *검증되지 않은 가정*이고, composition 은 GREEN 이어도 그 가정이 틀리면 거짓이다.

- 표상: `test-spec.test_cases[].mocks[].collaborator_unit_ref` + `unit-spec.units[].collaborators`.
- 검증: `spec-test-link-validator validateMockSoundness` — mock 한 collaborator 가 `test_layer=unit ∧ class_ref=U` TC 부재 시 finding(`unit.mock.unsound`). `unit_test_obligation=waived` 단위는 면제.
- **근거 (정확 귀속)**: Fowler "Mocks Aren't Stubs"(2004/2007)는 이 **위험**을 명시한다 — *"expectations on mockist tests can be incorrect, resulting in unit tests that run green but mask inherent errors."* 단 Fowler 가 **해법**("collaborator 가 자기 테스트를 가져야 한다")을 그렇게 명문화한 건 아니다 — 그건 **Consumer-Driven Contracts 정신 + 본 방법론의 합성**이다(과잉 귀속 회피). solitary/sociable 유닛테스트 구분은 **Jay Fields**(via Fowler "UnitTest" bliki) — mock 격리(solitary)의 대가가 곧 이 계약이다.
- impl-side 보완: `impl-spec.real_integration_axis`(real_integration_score)가 "GREEN 이 mock-heavy 였나"를 정직 신호 — mock-soundness(spec-side)와 cross-reference.

## 6. 신뢰 분리 (결정 1 / reference-lens 경계 불변)

UNIT 커버리지에는 **두 신뢰 tier**가 있고 섞으면 안 된다:

| 층 | 출처 | 신뢰 | 게이트 |
| --- | --- | --- | --- |
| **spec 파생 UNIT** | `domain.behaviors` + `formal-spec.invariants` (결정론·spec-side) | 1급 (AC 와 동형) | 게이트 후보 (§7 ratchet) |
| **code-graph method-axis** | codegraph OSS `buildMethodAxis` | **reference-lens** | **게이트 주입 영구 ❌** |

`code-graph` 는 **DEC-2026-05-28 §4.2 에 의해 "NOT gate-injected"** 이고 release-readiness check34/36/37/39 가 강제한다(`code-coverage-hole.schema.json` severity enum 이 high/critical 구조적 배제 / `render.js` method hole = `low` 고정 / `gate-eval.js REQUIRED_VALIDATORS_PER_STAGE` 에 coverage validator 0건). code-graph 를 하드게이트화 = DEC 위반 + release 회귀. → method-axis 는 spec 파생 UNIT 인벤토리를 **보강(corroborate)** 하는 soft 신호로만 쓴다. `unit-spec.coverage.method_axis_corroboration.reference_lens = const true` 로 구조적 차단.

## 7. §8.1 ratchet — 스캐폴딩 now / 강제 ≥2 PoC 후

ep-be-gea = PoC #1(단일). §8.1(단일 PoC 과적합 회피)은 스키마/게이트 본체변경에 ≥2 distinct 도메인 corroboration 요구.

- **HARD (v0.40.0 / DEC-2026-06-12-unit-layer-hard-flip)**: §8.1 ≥2 distinct 도메인 충족(ep-be-gea S2/Java + poc-18 S2/TS + poc-21 greenfield/JS = 3 도메인) → `validateUnitTestObligation`(plan gate #3) + `validateMockSoundness`(test gate #4) = **HARD 차단** 격상 완료. 둘 다 provenance-무관 hygiene(의무 선언 완전성 / mock 건전성). obligation-missing·unsound = high → gate-eval `validator_high` HARD_BLOCK.
- **reference-lens 유지(비차단 / 영구 propose-only)**: unit-coverage(matrix `obligation_satisfied_ratio` advisory) + code-graph method-axis + mutation_score = 게이트 주입 ❌(DEC-2026-05-28 불변 / surface, don't enforce / living-sync·lift 선례 동형).

## 8. additive / behavior-only 무회귀 (drift guard)

모든 신규 필드 optional. `test_layer` 미지정 = `composition`(기존 동작 / ac_ref 의무 유지). unit 스레드 미참조 PoC = **behavior-only mode 정상**(불완전 ❌). 검증기는 behavior-only PoC flag ❌ — 유닛 스레드는 **opt-in 으로 켜질 때만** 커버리지 분모 진입(빈 배열이 "covered"로 읽히는 false-health 차단).

## 9. property / mutation 연결

- **property** (Claessen & Hughes, QuickCheck, ICFP 2000): `type=property ∧ test_layer=unit ∧ class_ref=UNIT(aggregate)` = `formal-spec.invariants[]` 의 실행형(모든 입력에 invariant 성립). 현 impl = fast-check/Hypothesis/jqwik. `formal-spec-link-validator` 가 invariant→UNIT.invariant_refs→TC 도달성 검증.
- **mutation** (PIT/Stryker): `coverage.mutation_score` — 유닛테스트가 실제 동작을 단언하는지(특성화 핀이 버그를 정답으로 박제 안 했는지)의 **품질 신호**. characterization 단독의 함정(DEC-2026-06-03-s2 §2.2 "버그를 정답으로 핀")을 mutation 이 보강.

## 10. 검증기 / 게이트 매핑

| 검사 | 도구 | 현 강제 | 격상 조건 |
| --- | --- | --- | --- |
| UNIT obligation 누락 | plan-coverage `validateUnitTestObligation` | **HARD finding (high / 차단)** | ✅ v0.40.0 (≥2 PoC 충족) |
| mock 건전성 | spec-test-link `validateMockSoundness` | **HARD finding (high / 차단)** | ✅ v0.40.0 (≥2 PoC 충족) |
| unit obligation_satisfied_ratio | matrix coverage_summary.unit_coverage | propose-only 신호 | ≥2 PoC → 게이트 |
| method-axis 보강 | codegraph-coverage buildMethodAxis | **영구 reference-lens** | (격상 ❌ / DEC-2026-05-28) |
| AC→TC (기존) | spec-test-link | 하드게이트 #4 (불변) | — |

## 인용 (research 검증 / 정확성 플래그 반영)

- Kent Beck, *Test-Driven Development: By Example* (2002) — red-green-refactor / test-first. [HIGH]
- Dan North, "Introducing BDD" (dannorth.net, 2006) — BDD = 유닛 레벨 TDD 의 재명명(`test`→`should`)으로 출발. RSpec `describe/it` = unit-layer BDD / Cucumber·Gherkin = 이후 acceptance 레벨 가지. → **BDD 는 layer 가 아니라 technique** (§2.1 라벨 정직 교정 근거). [HIGH]
- Mike Cohn, *Succeeding with Agile* (2009) — Test Pyramid **originator**. (Fowler bliki 2012/2017 = popularizer / 별 attribution.) [HIGH]
- Martin Fowler, "Mocks Aren't Stubs" (2004/2007) — mock 위험("green but mask inherent errors"). 해법은 본 방법론 합성 + CDC(과잉 귀속 ❌). [HIGH]
- Jay Fields (via Fowler "UnitTest" bliki, 2014/2017) — solitary vs sociable. [HIGH / 귀속=Fields]
- Michael Feathers, *Working Effectively with Legacy Code* (2004) — characterization test / seam. [개념 HIGH / 인용=paraphrase]
- Gojko Adzic, *Specification by Example* (2011) + "SBE 10 years later" (gojko.net 2020-03-17) — GWT living doc / dual-representation 함정. [HIGH / 수치 미인용]
- Claessen & Hughes, "QuickCheck" (ICFP 2000, DOI 10.1145/351240.351266) — property-based testing 원조. [HIGH]
- DEC: DEC-2026-06-11-tdd-unit-layer-thread / DEC-2026-05-28(reference-lens 불변) / DEC-2026-06-03-s2(characterization 함정).
- schema: unit-spec.schema.json (deliverable NN) / test-spec.schema.json(test_layer) / 정책: automation-boundary.md(70~80% 한계) · no-simulation.md(R15/R19).

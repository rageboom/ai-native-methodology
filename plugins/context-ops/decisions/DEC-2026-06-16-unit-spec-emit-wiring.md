# DEC-2026-06-16-unit-spec-emit-wiring

- **일자**: 2026-06-16 (**v0.50.0 MINOR** — additive / 신규 skill emit 생산자)
- **카테고리**: integration gap 해소 — TDD/unit 층 `unit-spec.json` EMIT 단계를 spec stage agent flow 에 배선
- **상태**: 승인 (사용자[TF Lead] "작업 하자" / ep-be-gea dogfood 발 진단 → plan 승인)
- **관계**: `DEC-2026-06-11-tdd-unit-layer-thread`(unit 층 1급화 / 스키마·노드) + `DEC-2026-06-12-unit-layer-hard-flip`(검증기 HARD 격상)이 만든 머시너리의 **누락된 생산자**를 채움. `DEC-2026-05-28`(code-graph reference-lens 불변) 보존. `DEC-2026-06-16-ai-context-layout-restructure`(emit 경로 base/scopes 레이아웃) 정합.

## 맥락 (왜 — integration gap)

unit 층은 v0.36.0 에 1급화(스키마 `unit-spec.schema.json` + `UNIT-*` 노드 + deliverable 27 + 정책 test-layering.md)되고 v0.40.0 에 두 검증기(`validateMockSoundness` test gate#4 / `validateUnitTestObligation` plan gate#3)가 HARD 격상됐다. **그러나 그 게이트의 입력(`unit-spec.json`)을 생성하는 에이전트 경로가 한 번도 배선된 적이 없다.** 0.49.0 실측: `analysis-unit*`/`spec-*-unit*` skill 0 / 11 agent 프롬프트 unit-spec 언급 0 / phase-flow unit 0. 결과 = 채택처(ep-be-gea 34 BC)가 전부 composition-only 로 돌았고(unit TC 0 / mock 0), 게이트는 unit-spec 부재 시 clean-skip 이라 누락이 GREEN 으로 통과(거짓 안심 미점검). event 만 PoC #1 으로 **수기** emit(4 UNIT / mock-sound 0 findings).

진단 출처: ep-be-gea event scope 에만 `unit-spec.json` 이 있고 다른 BC 엔 없다는 사용자 관찰 → "왜 빠졌나" 추적 → machinery+gates+docs 는 출하됐으나 **producer 미배선**("machinery shipped, agent workflow not wired").

## 결정

신규 skill `spec-derive-unit-spec` 를 spec stage 에 추가해 S2(characterized_from_code) unit-spec 을 자동 emit 한다. emit 단계 = **spec**(양 provenance / work-unit spec zone) — 소비자 resolver 와 유일 실례(event)가 모두 spec zone 이므로 게이트 plumbing 무변경.

### 결정 1 — emit 단계 = spec (analysis 아님 / 실측 기반 정정)

`tools/findings-aggregator` scope-aware resolver 의 `STAGE_SUBDIR['unit-spec.json'] = 'spec'`(F-R2-35) → 멀티스코프에서 unit-spec 은 `scopes/<scope>/spec/unit-spec.json` 에서 소비된다. 유일 실례 event 도 `scopes/event/spec/unit-spec.json`(behavior-spec·acceptance-criteria 와 동일 자리). lifecycle-contract:221 / test-layering:49 가 적어둔 "S2=analysis 단계 emit" 은 미구현 aspiration 이었고(skill 부재 + 실 artifact 는 spec zone) → **spec 단계 emit(소스는 analysis code-graph∩domain)** 으로 doc 정정. analysis `base/` emit 은 소비자 미해석 → no-op 위험이므로 기각.

### 결정 2 — 신규 skill (extend 아님) + LLM skill (신규 tool 아님)

`analysis-code-graph` 확장 ❌ — reference-lens trust 경계(DEC-2026-05-28 §4.2 / release check34-39)를 게이트-피딩 emit 으로 침범. `analysis-domain-model` 확장 ❌ — input 생산자와 derived 생산자 혼재. 나머지 33 analysis/3 spec skill 과 정합하는 LLM skill 이 정답(obligation 순수성 판정·collaborators = LLM-with-grounding). 결정론 substrate(`codegraph-coverage buildMethodAxis` / code-pointer ast_symbol)는 재사용, method-axis 재발명 ❌.

### 결정 3 — 게이트 소급 발화 안전판 (보수 obligation)

emit 즉시 그 scope 의 HARD 게이트가 살아난다(거짓 GREEN 포착 = 목적). mid-flight 체인 파손 방지: skill 은 mock 협력자인데 이번 사이클 unit TC 미작성이면 **`waived`+`waiver_reason`**(mock-soundness 유일 면제값 / `validateMockSoundness` 는 `waived` 만 면제 — `characterization_only` 는 면제 ❌ / validator.js:222 실측). `required`/`characterization_only` 는 test-generate bottom-up 이 `test_layer=unit` TC 를 실제 생성할 때만.

### 결정 4 — read-only/CRUD BC = 파일 미생성 (busywork 금지 / no-simulation)

격리 가능한 순수 빌딩블록 0건 BC: schema `units[].minItems:1` 이라 빈 배열 invalid → **unit-spec.json 미생성**(behavior-only mode 정상 / additive·무회귀) + finding 기록. 합성 placeholder UNIT 강제 ❌. 모든 `code_pointer.symbol` 은 code-graph 실존 ast_symbol — 후보 미존재 시 emit 거부(fail-closed / 날조 ❌).

## §8.1 정당화 (emit-wiring 면제)

§8.1 ratchet 은 **스키마/게이트 본체 변경**에 ≥2-도메인 corroboration 을 요구한다. 본 변경은 스키마·게이트 본체 무변경 — **이미 corroborated·HARD-gated 된 머시너리의 생산자(additive LLM skill)** 추가일 뿐. unit 층 ratchet 은 v0.40.0 에서 이미 3 도메인(ep-be-gea S2/Java + poc-18 S2/TS + poc-21 greenfield/JS)으로 충족됨(`DEC-2026-06-12-unit-layer-hard-flip`). 따라서 fresh PoC 불요. **dogfood(정직 corroboration)**: event BC 를 새 skill 로직으로 재생성 → 수기본(4 UNIT / mock-sound 0 findings)과 diff = 기계화가 수기를 재현(신규 finding 0).

## over-claim 가드 (5항 / hard-flip §over-claim 미러)

1. **"unit 층이 이제 검증됨" ❌** — 본 변경은 inventory 생산자 배선. 검증은 기존 게이트가 한다(emit 이 correctness 를 입증하지 않음).
2. **"34 BC unit-spec 자동 백필됨" ❌** — 본 변경은 plugin 근본수정만. ep-be-gea 실 unit-spec 생성은 별도 작업(범위 밖).
3. **"RED→GREEN 순서 보증" ❌** — emit 은 인벤토리. 시간순서 schema 필드 부재(hard-flip 가드2 동일).
4. **"greenfield/designed_from_spec 도 배선됨" ❌** — 본 변경은 S2 분기만. greenfield(formal-spec.invariants) 분기는 후속 carry.
5. **"method-axis 가 게이트 신호로 승격" ❌** — code-graph method-axis 영구 reference-lens(DEC-2026-05-28 / check34-39 무수정). skill 은 substrate 로만 활용.

## 시행 (무엇 — 전부 additive)

- **신규** `skills/spec-derive-unit-spec/SKILL.md` (S2 emit / no-simulation grounding / 보수 obligation / busywork 금지 / 인용 footer).
- **편집** `flows/spec.phase-flow.json` — phase `unit-spec-derive`(depends_on `behavior-spec-compose` / spec_file 없음 / skills `spec-derive-unit-spec`). drift chain-layout 0 orphan/missing 확인.
- **편집** `agents/spec-agent.md` — frontmatter skills[] + 책임표 + 호출 절차 + 산출 자산(4 spec skill = 8 total).
- **편집(doc 정정)** `lifecycle-contract.md:221`·자산매핑 spec 행 / `deliverables/27-unit-spec.md` 생성 phase / `policies/test-layering.md:49` (S2 emit = spec 단계).
- **버전** plugin.json·package.json·README·루트 CLAUDE.md → 0.50.0 + CHANGELOG [0.50.0] MINOR.

## 범위 밖 (후속 carry)

- greenfield/designed_from_spec 분기(formal-spec.invariants → 동일 skill 확장 또는 sibling skill).
- ep-be-gea 34-BC 실 unit-spec 백필(write·계산-heavy BC 우선).

## relates to

- `DEC-2026-06-11-tdd-unit-layer-thread` (모 / unit 층 1급화)
- `DEC-2026-06-12-unit-layer-hard-flip` (게이트 HARD / §8.1 3-도메인 충족 SSOT)
- `DEC-2026-05-28` (code-graph reference-lens 불변)
- `DEC-2026-06-16-ai-context-layout-restructure` (base/scopes emit 경로)
- `methodology-spec/lifecycle-contract.md` §221 + 자산 매핑 매트릭스
- `methodology-spec/policies/test-layering.md` (2층 모델 SSOT)
- `methodology-spec/deliverables/27-unit-spec.md`

---
name: spec-derive-unit-spec
description: chain 2 (spec) sub-skill. behavior 스레드와 나란히 도는 TDD/unit 층(UNIT-*)을 emit. S2(레거시) — analysis code-graph(ClassDef/MethodDef) ∩ domain.entities[].behaviors[] 교집합에서 격리 빌딩블록(순수 클래스·함수·enum)을 발견(characterized_from_code) → unit-spec.json. composition TC 가 mock 하는 빌딩블록을 격리 유닛으로 1급화해 "mock=검증 안 된 가정" 거짓 GREEN 을 닫는다. code_pointer=ast_symbol 재사용(신규 원시필드 ❌). unit-test-architect persona 책임. 사용자 (자연어 직접 호출 시): "unit-spec 추출" / "UNIT 인벤토리" / "유닛 층". Stage = spec, manifest phase = unit-spec-derive.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# spec-derive-unit-spec — TDD/unit 층 빌딩블록 인벤토리 (UNIT-*) emit

chain 2 (spec) 산출물. behavior(BDD) 스레드(UC→BHV→AC)가 조합·mock 하는 **빌딩블록(클래스/순수함수/컴포넌트)** 을 `UC/BHV/AC/TASK/TC/IMPL` 동급 1급 노드 `UNIT-*` 로 표상한다 (DO-178C LLR rung). 본 skill 은 **S2(characterized_from_code) 분기**를 담당 — 코드가 이미 존재하므로 `code-graph ∩ domain.behaviors` 에서 발견한다. (greenfield `designed_from_spec` 분기 = formal-spec.invariants 설계 = 후속 carry.)

## 왜 이 산출물인가

chain 의 행위 스레드는 BDD/composition 층만 운반한다. 그 시나리오가 mock 한 부품의 TDD/unit 층이 chain 에 표상되지 않으면 — mock 이 검증 안 된 가정이 되어 GREEN 이 거짓 안심을 준다. 본 skill 이 emit 한 unit-spec 이 있어야 test 단계에서 `validateMockSoundness`(test gate#4) + `validateUnitTestObligation`(plan gate#3) 가 실제로 작동한다 (unit-spec 부재 = clean-skip = 거짓 GREEN 미점검). 즉 본 skill = 게이트의 입력 생산자.

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`. (persona 시뮬 = 신뢰도 -5%p.)

- ✅ `domain.json` (entities[].behaviors[]) read 의무 = UNIT 의 의미 계층 anchor.
- ✅ 각 `code_pointer.symbol` 은 **실 소스에 존재하는 ast_symbol** 이어야 한다 — Read/Grep 으로 클래스/enum/메서드 실존을 직접 확인(의무). 실 소스 미존재 = 그 UNIT **emit 거부**(날조 ❌) + `_base-log-finding` honest skip — 발명 ❌ (fail-closed / `analysis-code-graph` 자세 정합).
- ✅ domain behavior 가 **위임하는 빌딩블록**(예: 공통 util `MaskingUtils`, 전략 클래스)은 domain entity 가 아니어도(domain.json 미등재) 핀 대상 — 그게 바로 composition TC 가 mock 으로 빼는 부품. behavior 의 method_name 을 anchor 로 source grep 해 구현 클래스/위임 util 을 확정.
- ⚠️ `code-graph.json` = **aggregate index stats**(nodes_by_kind 카운트 + sqlite 포인터 / per-symbol 목록 ❌). 심볼 존재 확인은 code-graph.json grep 이 아니라 **실 소스 Read/Grep** 으로 한다. code-graph 는 reference-lens(클래스 규모·언어 확인용 / 게이트 주입 ❌).
- ✅ characterization 맥락 — AS-IS 동작 박제. 버그를 "고친" UNIT 으로 재정의 ❌ (`unit_test_obligation=characterization_only` 로 핀).

## 사전 조건

- `base/shared/code-graph.json` (analysis) — codegraph index **aggregate stats**(nodes_by_kind 카운트 + sqlite db 포인터 / per-symbol 목록 아님). **reference-lens**(클래스 규모·언어 확인 / 게이트 주입 ❌ / DEC-2026-05-28 불변). 심볼 실존 확인은 실 소스 Read/Grep.
- `base/shared/domain.json` (analysis) — `entities[].behaviors[].method_name` / `domain_services[].operations[]` = UNIT 의 의미 계층 anchor(domain_ref / behavior_method_ref).
- `base/domains/<BC>/characterization/characterization-spec.json` (analysis / S2 oracle) — snapshots[] 가 characterized_from_code UNIT 의 AS-IS 동작 oracle.
- `base/domains/<BC>/formal-spec.json` (권장) — invariants[].aggregate_root / property_tests[] = invariant_refs / property_test_refs anchor.
- 같은 scope 의 behavior-spec.json (선행 spec phase 산출) — BHV/AC 가 어떤 빌딩블록을 mock 하는지 = collaborator backbone 단서.

## 절차

### 1. 입력 read

```bash
cat .ai-context/base/shared/code-graph.json | jq '.nodes | length'
cat .ai-context/base/shared/domain.json | jq '.entities | length'
```

### 2. S2 발견 — domain.behaviors anchor → 소스 빌딩블록

`domain.entities[].behaviors[].method_name` / `domain_services[].operations[]` 를 anchor 로, 그 behavior 가 구현·위임하는 **격리 가능한 순수 빌딩블록**(in-memory 순수 클래스·함수·enum·전략·유틸)을 실 소스 Read/Grep 으로 확정한다. behavior 가 mock 으로 빼는 공통 util(domain.json 미등재)도 포함 — 그게 핀 대상. real-DB 의존 BR(MyBatis 동적 SQL 등)은 클래스 단위 격리 불가 → integration layer carry (UNIT 아님, 명시).

### 3. UNIT-* 작성 (`schemas/unit-spec.schema.json` 정합)

각 UNIT:
- `id`: `^UNIT-<SCOPE>-NNN$` (id-conventions canonical).
- `provenance`: `characterized_from_code` (S2 전수).
- `kind`: class / function / module / component.
- `code_pointer`: **`anchor_type=ast_symbol`, `symbol="Class.method"` 재사용** — 신규 class_ref/method_ref 원시필드 ❌ (결정 4 / SSOT). path + commit_hash 포함.
- `domain_ref` / `behavior_method_ref` / `bc_ref`: domain 의미 계층 backward link.
- `invariant_refs` / `property_test_refs`: formal-spec anchor (있을 때).
- `collaborators[]`: 본 단위가 의존하는 다른 UNIT-* (mocking-soundness backbone).

### 4. unit_test_obligation 판정 — 보수 default (게이트 안전판)

emit 즉시 그 scope 의 HARD 게이트(mock-soundness test#4 / obligation plan#3)가 살아난다. mid-flight 체인을 깨지 않도록 **보수적**으로:

| obligation | 사용 | mock-soundness |
| --- | --- | --- |
| `required` | 순수·분기 로직 보유 + test 단계 bottom-up 이 `test_layer=unit` TC 를 실제 만들 단위 | 면제 ❌ (TC 없으면 발화) |
| `characterization_only` | S2 AS-IS 핀만 + 본 사이클에 unit TC 작성 예정 | **면제 ❌** (required 와 동일 취급 / 주의) |
| `waived` | data class·생성코드·trivial getter·이번 사이클 unit TC 미작성 collaborator | **면제 ⭕ (유일)** + `waiver_reason` 의무 |

⚠️ **함정**: `characterization_only` 는 mock-soundness 면제가 **아니다**(validator 는 `waived` 만 면제). 따라서 composition TC 가 mock 하는데 이번 사이클에 unit TC 가 안 따라올 collaborator 는 반드시 `waived`+`waiver_reason`. `required`/`characterization_only` 는 test-generate bottom-up 이 그 UNIT 의 `test_layer=unit` TC 를 실제 생성할 때만.

### 5. S2 시나리오 분기 — busywork 금지

read-only/CRUD BC 라 **격리 가능한 순수 빌딩블록이 0건**이면: schema `units[].minItems:1` 이라 빈 배열은 invalid → **unit-spec.json 파일을 생성하지 않는다**(behavior-only mode 정상 / additive·무회귀). 합성 placeholder UNIT 강제 ❌. `_base-log-finding` 으로 "isolatable pure unit 0 — behavior-only 정합(read-only BC)" 기록.

### 6. coverage (권장)

```yaml
coverage:
  obligation_satisfied_ratio: 0.0   # required UNIT 중 test_layer=unit TC 로 cover 된 비율 (spec 단계 emit 시점 0 정합 / test 단계 후 갱신)
  coverage_strategy: 'ratchet'      # legacy 진입점
  # method_axis_corroboration.reference_lens: true  # (선택 / code-graph 보강 / 게이트 주입 ❌)
```

### 7. unit-spec.json 작성

spec work-unit zone 에 emit (behavior-spec.json / acceptance-criteria.json 과 같은 자리). 경로 구성 SSOT = `tools/_shared/ai-context-layout.js`:

- 멀티스코프: `<project>/.ai-context/scopes/<scope>/spec/unit-spec.json`
- 평면 단일스코프: `<project>/.ai-context/base/unit-spec.json`

(findings-aggregator scope-aware resolver 가 `unit-spec.json → spec` 서브디렉토리로 소비 — 본 경로와 정합.)

### 8. schema-validate

```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/schema-validator/src/cli.js <unit-spec.json 경로> --json
# Expect: valid + waived⟹waiver_reason if/then 통과
```

## 산출물

- `<project>/.ai-context/scopes/<scope>/spec/unit-spec.json` (멀티스코프) 또는 `<project>/.ai-context/base/unit-spec.json` (평면) — 산출물 27.
- (격리 순수 단위 0 BC) 파일 미생성 + finding 기록 (behavior-only mode).

## 하류 소비

- test 단계 `test-generate-test-spec`: `units[]` 중 `unit_test_obligation=required` + composition TC 의 `mocks[].collaborator_unit_ref` → `test_layer=unit` + `class_ref=UNIT-*` TC bottom-up 생성.
- `spec-test-link-validator validateMockSoundness` (test gate#4 HARD): composition mock → collaborator UNIT 의 unit TC 존재 검증.
- `traceability-matrix-builder --unit-spec`: UNIT join → matrix `coverage_summary.unit_coverage`.

## 흔한 함정

1. read-only/CRUD BC 에 placeholder UNIT 강제 (busywork / §4 minItems 위반 회피하려 날조) → 파일 미생성이 정답.
2. `characterization_only` 를 mock-soundness 면제값으로 오인 → `waived` 만 면제.
3. 신규 class_ref/method_ref 원시필드 추가 → 기존 code-pointer ast_symbol 재사용.
4. code-graph 에 없는 심볼을 code_pointer 로 발명 → fail-closed skip.
5. real-DB BR 을 클래스 UNIT 으로 핀 시도 → integration layer carry (UNIT 아님).
6. method-axis 보강을 게이트로 취급 → reference-lens·propose-only 영구 비-게이트.

## 인용

- 정책: `methodology-spec/policies/test-layering.md` (2층 모델 / mocking-soundness / 시나리오 분기)
- 정책: `methodology-spec/policies/no-simulation.md`
- deliverable: `methodology-spec/deliverables/27-unit-spec.md`
- schema: `schemas/unit-spec.schema.json`
- 도구: `tools/spec-test-link-validator/` (validateMockSoundness) / `tools/traceability-matrix-builder/` (--unit-spec) / `tools/schema-validator/`
- 레이아웃 SSOT: `tools/_shared/ai-context-layout.js`
- flow: `flows/spec.phase-flow.json` (phase unit-spec-derive)
- 결단: DEC-2026-06-11-tdd-unit-layer-thread / DEC-2026-06-12-unit-layer-hard-flip / DEC-2026-05-28 (reference-lens 불변) / DEC-2026-06-16-unit-spec-emit-wiring (본 emit 배선)
- 외부: Beck TDD(2002) / Cohn pyramid(2009) / Feathers WELC(2004) / Fowler "Mocks Aren't Stubs"(2007)

<!-- allow-provenance: deliverable 문서 — provenance/시나리오/canon 인용이 산출물 정의의 핵심 (다른 deliverable doc 동형). -->

# 산출물 #27: Unit Spec (TDD/unit 층 / UNIT-* SSOT)

> **schema**: `schemas/unit-spec.schema.json`
> **생성 phase**: analysis (S2 발견) 또는 spec (greenfield 설계) — provenance 별
> **정책 SSOT**: `methodology-spec/policies/test-layering.md`
> **신설**: v0.36.0 (DEC-2026-06-11-tdd-unit-layer-thread)

## 1. 목적

**답하는 질문**: "behavior 시나리오(composition TC)가 조합·mock 하는 **빌딩블록(클래스/순수함수/컴포넌트)** 은 무엇이고, 각각 격리 유닛테스트로 핀되었는가?"

**왜**: chain 의 행위 스레드(UC→BHV→AC→TC→IMPL)는 BDD/composition 층만 운반한다. 그 시나리오가 mock 하는 부품의 TDD/unit 층이 chain 에 표상되지 않으면 — mock 이 검증 안 된 가정이 되어 GREEN 이 거짓 안심을 준다(ep-be-gea PoC #1 노출). `UNIT-*` 는 그 빌딩블록을 `UC/BHV/AC/TASK/TC/IMPL` 동급 1급 노드 = DO-178C **LLR rung** 로 표상한다.

## 2. 형식

```
.ai-context/<scope>/.../unit-spec.json   (또는 analysis output / scope 별)
사용자 프로젝트 (실 unit test 코드):
└── src/test/.../**/{Class}Test.{java,ts,py}   # test_layer=unit
```

## 3. 추출 범위 (provenance 별)

| provenance | 출처 | 도구 | 신뢰도 |
| --- | --- | --- | --- |
| **characterized_from_code** (S2) | `code-graph`(ClassDef/MethodDef) ∩ `domain.entities[].behaviors[]` | codegraph-coverage `buildMethodAxis` ∩ domain (결정) | 90% |
| **designed_from_spec** (greenfield) | `formal-spec.invariants[].aggregate_root` + `domain` aggregates | LLM 설계 + grounding | 75% |
| code_pointer (ast_symbol) | code-pointer `symbol="Class.method"` (재사용) | 결정 | 100% |
| collaborators[] | domain 의존 + code-graph edge | LLM with grounding | 75% |
| unit_test_obligation | layer + 순수성 판정 | LLM | 80% |

**입력**: domain.json (의무) + code-graph.json (S2) / formal-spec.json (greenfield) + characterization-spec.json (S2 oracle).

## 4. 검증 도구

| 도구 | 검증 |
| --- | --- |
| schema-validator | unit-spec.schema.json (waived → waiver_reason 의무 if/then) |
| **spec-test-link-validator** `validateMockSoundness` | composition TC mock → collaborator UNIT 의 test_layer=unit TC 존재 (soft / 현 비차단) |
| **plan-coverage-validator** `validateUnitTestObligation` | layer∈{domain,application,be(non-API)} task unit_refs → obligation (soft) |
| traceability-matrix-builder | UNIT join → matrix `unit_id`/`unit_test_id` + coverage_summary.unit_coverage |
| codegraph-coverage `buildMethodAxis` | method-axis 보강 (**reference-lens / propose-only / 게이트 ❌** / DEC-2026-05-28 불변) |

## 5. 신뢰 분리 (결정 1)

- **spec 파생 UNIT** (domain/formal-spec = 결정론) = chain-internal 게이트 후보 (단 §8.1 ratchet — 현 soft).
- **code-graph method-axis** = reference-lens·propose-only / 게이트 주입 영구 ❌. `coverage.method_axis_corroboration.reference_lens=const true` 로 구조적 차단.

## 6. §8.1 ratchet

ep-be-gea = PoC #1. 스캐폴딩(스키마/필드/노드) now / 강제(mock-soundness·unit-coverage 하드게이트)는 ≥2 distinct 도메인 PoC 후 별도 DEC. 현 검증기 = soft finding (`REQUIRED_VALIDATORS_PER_STAGE` 미편입 = 비차단).

## 7. additive / 무회귀

unit-spec 부재 = behavior-only mode 정상(불완전 ❌). test_layer 미지정 = composition(ac_ref 의무 유지). 기존 PoC 전수 무회귀 schema-valid.

## 인용

- 정책: `methodology-spec/policies/test-layering.md` (2층 모델 / mocking-soundness / 시나리오 분기 / canon)
- ADR: ADR-CHAIN-001 (chain harness) / DEC-2026-05-28 (reference-lens 불변) / DEC-2026-06-03-s2 (characterization 함정)
- 외부: Beck TDD(2002) / Cohn pyramid(2009) / Feathers WELC(2004) / Fowler mocks(2007) / Claessen-Hughes QuickCheck(2000)
- schema: `schemas/unit-spec.schema.json`

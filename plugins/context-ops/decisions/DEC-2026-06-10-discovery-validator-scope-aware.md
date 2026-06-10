# DEC-2026-06-10-discovery-validator-scope-aware

- **결정**: `discovery-extraction-validator` 의 UC-coverage·UC/entity 분모를 **scope(BC)-aware** 로 한정 — 누적-canonical 의 타 BC 가 단일 scope discovery 를 희석하지 않도록 수정
- **시각**: 2026-06-10
- **버전**: plugin.json 0.29.0 → 0.30.0 MINOR (behavior fix / backward-compat fallback / schema·gate 무변경)
- **트리거**: ep-be-gea dogfooding — reservation-golf scope chain 1(discovery) 진입 중 발견 (**F13**)

## 배경 (갭)

canonical-global accumulation 모델(`baseline-delta-operating-model.md` / DEC-2026-06-07-subset-retire)에서 `output/domain.json` 은 **여러 BC 가 누적**된다(event 11 UC + reservation-golf 5 UC = 16). 그런데 `discovery-extraction-validator` 의 UC-coverage(§3)·UC/entity(§3.x) 분모가 **전역 전체 BC 합산**이라, 단일 scope discovery 를 평가하면 타 BC 의 UC/entity 가 분모를 구조적으로 부풀려 coverage 가 희석됐다.

**실측(F13)**:
- golf discovery 가 BC-RESV-GOLF 의 canonical 5 UC 를 **전부 커버(5/5=100%)** 하는데도, 전역 분모(16)로 인해 coverage = **31.3%** (HIGH below_threshold) → gate#1 오탐 block.
- UC/entity 도 golf 5 UC / 전역 22 entity = 0.23 으로 희석(실제 golf 5/6=0.83).

**diagnose-before-design 실측**:
- chain-driver 는 business-rules 에 **BC-subset 머신**(`sync.js subsetRules` / BC-한정 hash)을 이미 보유 = subset 모델이 채택된 paradigm.
- 그러나 `discovery-extraction-validator` 만 이 모델에 미정합(전역 합산) = 진짜 델타(중복 아님).
- event 가 통과한 건 golf 누적 **전**(domain 단일 BC)이라 노출 안 됨 — **2번째 BC 가 누적되는 순간 어떤 scope 든 희석**되는 구조적 결함.

## 결정 내용

discovery UC 의 scope-token(`UC-<TOKEN>-NNN`)을 보유한 BC 만 **in-scope 분모**로 한정:
- discovery UC id 에서 token 집합 추출 → 그 token 의 UC 를 가진 BC 만 분모(UC·entity 동일 분모 정합).
- **안전 fallback**(backward-compat / 기존 동작 보존): ⓐ 단일 BC ⓑ token 무매치 ⓒ 전 BC 매치(=실 단일 scope) ⓓ top-level use_cases → 전체 분모 유지.
- finding 에 `scope_filtered` + `scoped_bounded_contexts` 필드 추가(정직 표기).

**operationalize**: `tools/discovery-extraction-validator/src/validator.js` §3·§3.x. 검증기 단위 테스트 4종 추가(희석 회피 / in-scope 미달은 여전히 flag / 단일 BC backward-compat / entity 분모 scope 한정).

## §8.1 단일 PoC 과적합 회피

- **수정(scope-aware 분모)** = paradigm-grounded — subset 모델(DEC-2026-06-07)이 이미 채택됐고 sync.js BC-subset 가 선례. 검증기만 미정합했던 것을 정합화 = 구조적 fix(1-PoC 특화 아님 / 2 BC 누적 즉시 일반 발현).
- **token 파싱 규약**(`UC-<TOKEN>-NNN`) = id-conventions SSOT 의존. 규약 외 id 는 fallback(전체 분모)로 안전 degrade.
- 정량 임계(0.80 / 1.5) **무변경** — 분모 정의만 정정.

## 영향

- gate·trust·schema 무영향. finding 출력에 2 필드 additive.
- regression-safe: event discovery 재검증 coverage 100% 유지(BC-EVENT 한정), 기존 43 test 전부 green(신규 4 포함).
- golf gate#1 = clean(0 critical/0 high / LOW under_decomposition 1건 advisory) 통과 가능.

Relates: DEC-2026-06-07-subset-retire(누적 모델 모) + DEC-2026-06-10-scope-candidate-recursive-carve(동일 dogfood F12 sibling) + `feedback_diagnose_before_design_check_existing`(BC-subset 선례 실측).

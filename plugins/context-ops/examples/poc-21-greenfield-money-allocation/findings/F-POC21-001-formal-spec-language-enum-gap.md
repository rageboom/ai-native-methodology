# F-POC21-001 — formal-spec.schema language/framework enum 이 JS/Python greenfield 배제

- **severity**: medium (carry / 본 PoC 가 고치지 않음 = 본체 결함 후보)
- **discoverer**: poc-21 greenfield designed_from_spec dogfood
- **status**: candidate (promote 시 F-XXX 배정)

## 관찰

`schemas/formal-spec.schema.json` 의 `invariants[].language` / `property_tests[].language` enum = **`["typescript","java"]`**, `property_tests[].framework` enum = **`["fast-check","jqwik","hypothesis","scalacheck"]`**.

→ JavaScript(node:test) 또는 Python(pytest/hypothesis 외) greenfield/S1 PoC 는 `formal-spec.invariants[]` / `property_tests[]` 를 **schema-valid 하게 채울 수 없다**. (hypothesis 는 framework 에 있으나 language enum 에 `python` 부재 = 모순.)

## 영향

- 본 poc-21(JS) = `formal-spec.invariants`/`property_tests` 를 빈 배열로 둘 수밖에 없음(실 invariants 는 PRD `BR-ALLOC-*` + `target/test/allocate.unit.test.mjs` 에 실재·실행). designed_from_spec 의 formal source 가 산출물에 박제되지 못함.
- poc-19(Python numpy-financial)도 동일 enum gap 대상.

## 처분 (본 PoC scope 밖 / 본체 결함 후보)

- enum 확장 후보: `language` += `javascript`·`python`, `framework` += `node:test`·`vitest`·`pytest` 등. 단 §8.1 — ≥2 도메인 corroboration + property-vs-example test 구분 정합 검토 후 본체 격상(별도 결단). 본 finding 은 surface 만.
- 회피책(본 PoC 채택): invariants 를 PRD(BR) + 실행 test 로 표현하고 formal-spec 빈 배열 + $comment 로 gap 정직 표기.

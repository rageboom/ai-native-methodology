# 산출물 #18: Behavior Spec (v2.0 chain 2)

> **사상**: ADR-CHAIN-001 §1 / ADR-011 (json 단독 SSOT / ADR-008 이중 렌더링 supersede) / ADR-009 v2 §2.5 (spec trust 0.88)
> **schema**: `schemas/behavior-spec.schema.json`
> **생성 phase**: chain 2 (spec) — `/spec-compose-behavior-spec` (skill / sub-plan-4)
> **gate**: go/stop gate #2

## 1. 목적

**답하는 질문**: "각 use case 의 동작은 어떻게 정의되나? executable behavioral contract?"

**활용**: chain 3 test stage 의 핵심 input. acceptance-criteria 추출 source.

`formal-spec` phase 산출물 (state-machine / sequence / decision-table / invariant / property-test) 의 chain 2 격상 + discovery-spec.use_cases 흡수.

## 2. 형식

```
.aimd/output/chain-2-spec/
├── behavior-spec.json   # json 단독 SSOT (ADR-011)
└── _manifest.yml
```

## 3. 추출 범위

| 항목                                             | 출처                                                | 도구                     | 신뢰도 |
| ------------------------------------------------ | --------------------------------------------------- | ------------------------ | ------ |
| behaviors (BHV-\*)                               | discovery-spec UC-\* + analysis `formal-spec` phase | 결정적 + LLM             | 85%    |
| preconditions / postconditions / invariants      | `formal-spec` phase 산출물                          | 결정적                   | 95%    |
| state_transition / decision_table / sequence ref | `formal-spec` phase 산출물 경로                     | 결정적                   | 100%   |
| property_tests stub                              | LLM + framework_status                              | LLM with grounding       | 75%    |
| acceptance_criteria_refs                         | chain 2 forward link                                | chain-coverage-validator | 100%   |

**입력**: discovery-spec.json + analysis stage 1~16 산출물 ("현 7대 + 신규 추가" 사용자 답변 3 정합 / cross_links.to_analysis_artifacts 의무).

## 4. 검증 도구

| 도구                                      | 검증                                     |
| ----------------------------------------- | ---------------------------------------- |
| **chain-coverage-validator** (sub-plan-3) | UC→BHV 1:N + BHV→AC 1:N + 7대 cross-link |
| drift-validator (chain 모드 확장)         | state-machine + sequence drift           |
| decision-table-validator                  | DMN 5-check                              |
| formal-spec-link-validator (chain 모드)   | planning ↔ behavior cross-link           |
| schema-validator                          | behavior-spec.schema.json                |

## 5. 예시

```yaml
behaviors:
  - id: BHV-USER-001
    name: 'User signup with unique email'
    use_case_refs: [UC-USER-001]
    br_refs: [BR-USER-EMAIL-001]
    preconditions:
      - 'email format valid (RFC 5322)'
      - 'email NOT IN users.email'
    postconditions:
      - 'user.id assigned'
      - 'user.status = ACTIVE'
    invariants:
      - 'user.email is unique'
    state_transition_ref: '.aimd/output/formal-spec/state-machines/user-signup.json'
    decision_table_ref: '.aimd/output/formal-spec/decision-tables/user-signup.json'
    property_tests:
      - property: 'email always unique after signup'
        framework: fast-check
        framework_status: active
        arbitrary_stub: 'fc.string().filter(isValidEmail)'
    acceptance_criteria_refs: [AC-USER-001, AC-USER-002]
    source_grounded_evidence:
      - 'src/user/UserService.java:30-60'
cross_links:
  to_analysis_artifacts:
    - .aimd/output/business-rules.json
    - .aimd/output/domain.json
    - .aimd/output/openapi.yaml
    - .aimd/output/schema.json
```

## 6. carry

| #      | 항목                                  | 시점 |
| ------ | ------------------------------------- | ---- |
| sp2-c2 | acceptance-criteria ICU MF2 i18n 통합 | v2.x |

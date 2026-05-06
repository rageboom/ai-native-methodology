# 산출물 #19: Acceptance Criteria (★ v2.0 chain 2)

> **사상**: ADR-CHAIN-001 §1 / ADR-008 v2 §10 (Gherkin tag 자동 매핑) / ADR-CHAIN-002 §gate #2
> **schema**: `schemas/acceptance-criteria.schema.json`
> **생성 phase**: chain 2 (spec) — `/derive-acceptance-criteria` (skill / sub-plan-4)
> **gate**: go/stop gate #2

## 1. 목적

**답하는 질문**: "사용자가 검수할 수 있는 합격 기준은 무엇인가?" — Gherkin BDD 형식.

**활용**: chain 3 test-spec 자동 생성의 1차 input.

## 2. 형식

```
.aimd/output/chain-2-spec/
├── acceptance-criteria.json
└── acceptance-criteria.md   # ★ Gherkin scenario 평문 + tag (@must / @should / @nice)
```

## 3. 추출 범위

| 항목 | 출처 | 도구 | 신뢰도 |
|---|---|---|---|
| criteria (AC-*) | behavior-spec BHV-* + planning-spec UC-* | LLM with grounding | 85% |
| gherkin (Given/When/Then) | LLM 추출 | LLM | 80% |
| severity (must/should/nice) | planning-spec.business_intent + LLM | LLM | 75% |
| verifiable | ★ schema if/then 강제 (verifiable=true ⇔ ≥1 TC-*) | 결정적 | 100% |
| automated_runnable | LLM 분석 | LLM | 80% |
| test_case_refs | chain 3 forward link | chain-coverage-validator | 100% |

**입력**: behavior-spec.json + planning-spec.json.

## 4. 검증 도구

| 도구 | 검증 |
|---|---|
| **chain-coverage-validator** | AC→TC 1:N + verifiable 정합 + coverage ≥ 0.85 |
| schema-validator | if/then 강제 (verifiable=true 시 test_case_refs minItems=1 + automated_runnable=true) |
| formal-spec-link-validator (chain 모드) | behavior-spec ↔ acceptance-criteria cross-link |

## 5. 예시

```yaml
criteria:
  - id: AC-USER-001
    description: "신규 사용자 가입 성공"
    behavior_ref: BHV-USER-001
    use_case_ref: UC-USER-001
    gherkin:
      given: ["이메일 형식 유효", "이메일 미사용"]
      when: "POST /api/users { email, password }"
      then: ["201 Created", "user.id 할당", "user.status = ACTIVE"]
      tags: ["@must"]
    severity: must
    verifiable: true
    automated_runnable: true
    test_case_refs: [TC-USER-001, TC-USER-002]
    gate_required: true   # ★ Industry — chain 4 impl 진입 허용 게이트
  - id: AC-USER-003
    description: "이메일 형식 오류 시 400"
    behavior_ref: BHV-USER-001
    use_case_ref: UC-USER-001
    gherkin:
      given: ["이메일 형식 invalid"]
      when: "POST /api/users { email: 'bad', password }"
      then: ["400 Bad Request", "error code = VALIDATION_ERROR"]
      tags: ["@must"]
    severity: must
    verifiable: true
    automated_runnable: true
    test_case_refs: [TC-USER-003]
```

## 사람 눈 (acceptance-criteria.md)

```gherkin
Feature: User Signup

  @must
  Scenario: AC-USER-001 — 신규 사용자 가입 성공
    Given 이메일 형식 유효
    And 이메일 미사용
    When POST /api/users { email, password }
    Then 201 Created
    And user.id 할당
    And user.status = ACTIVE
```

## 6. 의무 (Cucumber 표준 정합)

- Gherkin 본문 = ★ Cucumber 사실상 표준 (Official research) / W3C 표준 ❌
- Cucumber tag (`@must` 등) = MoSCoW severity 자동 매핑 (★ ADR-008 v2 §10 이중 렌더링)
- AC-* ID 산업 표준 부재 → 본 방법론 자체 정의 (ADR-CHAIN-001 명시)

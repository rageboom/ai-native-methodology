---
name: spec-derive-acceptance-criteria
description: ★ ★ v2.0 chain 2 sub-skill. behavior-spec.behaviors[] 의 BHV-* 마다 Gherkin (Given/When/Then) acceptance-criteria 추출. verifiable=true 의무 / verifiable=true 시 test_case_refs ≥ 1 의무 (chain 2 → 3 forward link). MoSCoW 우선순위. bdd-author persona 책임.
allowed-tools: Read, Grep, Bash, Write
---

# derive-acceptance-criteria

★ ★ v2.0 chain 2 의 sub-skill (compose-behavior-spec 가 호출). **bdd-author persona** 책임. Gherkin BDD AC-* 산출.

## 언제 사용

- `compose-behavior-spec` 의 step 4 에서 자동 호출.
- 사용자가 AC 보강 / 분해 시 직접 호출.

## 입력

- `<project>/.aimd/output/behavior-spec.json` (★ chain 2 진행 중)
- `<project>/.aimd/output/planning-spec.json` (use case backward link)
- `<project>/.aimd/output/rules.json` + `domain.json` (BR / domain reference)

## 산출

- `<project>/.aimd/output/acceptance-criteria.json` (★ schemas/acceptance-criteria.schema.json 의무)
- `<project>/.aimd/output/acceptance-criteria.md` (사람 눈 / Gherkin block)

## AC 구조 (Gherkin BDD)

```json
{
  "id": "AC-USER-001",
  "behavior_ref": "BHV-USER-001",
  "use_case_ref": "UC-USER-001",
  "title": "이메일+비밀번호로 정상 로그인",
  "gherkin": "Given user 가 회원가입을 마쳤다\nWhen user 가 이메일 'a@x.com' 과 비밀번호 'P@ssw0rd!' 로 POST /login 호출\nThen 200 응답 + JWT 발급",
  "severity": "critical",
  "moscow": "MUST",
  "verifiable": true,
  "test_case_refs": ["TC-USER-001"],
  "automated_runnable": true
}
```

## ★ ★ verifiable=true 정합 (schema if/then)

`verifiable=true` 인데 `test_case_refs` 가 빈 배열이면 → ★ acceptance-criteria.schema.json `if/then` 강제 → schema-validator 자동 차단. chain 2 → 3 forward link 의무.

`verifiable=false` 허용 case (제한적):
- 비기능 (예: "system shall be available 99.9%") — SLA / 운영 측정 / 자동 test ❌.
- exploratory testing (예: "ux 친화도") — 사람 검토 only.

★ verifiable=false AC 비율 ≤ 10% 권고. 초과 시 `chain-coverage-validator` 가 medium finding 산출 (overcompleX → 분해 권고).

## MoSCoW 분류

| moscow | 의미 | gate #2 통과 자격 |
|---|---|---|
| MUST | 의무 / chain 3-4 미달 시 release ❌ | 100% TC 의무 |
| SHOULD | 권고 / 우회 허용 (★ 사용자 명시) | 80% TC 권고 |
| COULD | nice-to-have | optional |
| WONT | 본 release 미포함 (★ chain 3 test ❌) | skip |

## 절차

1. **각 BHV 마다 1+ AC 분해** — happy path + ≥ 1 edge case + ≥ 1 negative path 권고.
2. **Gherkin 작성** — Given/When/Then 단순 사용자어. step 본문에 specific value (★ random 변수 ❌ / property test 는 별도 chain 2 property_tests).
3. **severity 채움** — BR-INTENT.criticality 매핑 (critical / high / medium / low).
4. **moscow 채움** — release 우선순위 / 사용자 검토 필수 (default = MUST 단, exploratory = SHOULD).
5. **test_case_refs 채움 (forward link)** — chain 3 (test) 진입 후 `generate-test-spec` skill 이 backward 채움. 본 skill 단계에서는 placeholder `["TC-{BHV}-001"]` 사전 등록 + chain 3 step 1 에서 검증.
6. **자동 검증** (compose-behavior-spec step 7 에서 합산):
   ```bash
   node tools/spec-test-link-validator/src/cli.js \
     --behavior   .aimd/output/behavior-spec.json \
     --acceptance .aimd/output/acceptance-criteria.json \
     --test-spec  .aimd/output/test-spec.json
   ```

## ★ Gherkin 본문 작성 가이드

**Given** = 시스템 + 사용자 사전 상태 (e.g., "user 가 회원가입을 마쳤다 / DB 에 user(email='a@x.com') 존재").
**When** = trigger event (1 동작 / 1 actor / 1 step). 복합 step 은 분리 → 별도 AC.
**Then** = outcome (post-condition + side-effect). API status code + body 구조 명시 권고.

**And** 허용 (Given/When/Then 각각 multi-step). 단 When 의 And 는 ★ 분해 권고 (1 trigger 원칙).

## 인용

- acceptance-criteria.schema.json (deliverable 19)
- behavior-spec.schema.json `acceptance_criteria_refs[]` 정합
- master plan §B chain 2
- BDD ([Cucumber Gherkin spec](https://cucumber.io/docs/gherkin/) — official)

## Carry

- AC 자동 generate 정확도 측정 = sub-plan-6 PoC #05.
- moscow 분포 dashboard (release 자격 / chain 4 통과 cycle) = sub-plan-6.

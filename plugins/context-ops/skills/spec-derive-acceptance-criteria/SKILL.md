---
name: spec-derive-acceptance-criteria
description: v2.0 chain 2 sub-skill. behavior-spec.behaviors[] 의 BHV-* 마다 Gherkin (Given/When/Then) acceptance-criteria 추출. verifiable=true 의무 / verifiable=true 시 test_case_refs ≥ 1 의무 (chain 2 → 3 forward link). MoSCoW 우선순위. bdd-author persona 책임. 사용자 (자연어 직접 호출 시): "acceptance criteria 추출" / "AC Gherkin" / "BDD".
allowed-tools: Read, Grep, Bash, Write
---

# derive-acceptance-criteria

chain 2 의 sub-skill (compose-behavior-spec 가 호출). **bdd-author persona** 책임. Gherkin BDD AC-\* 산출.

## 언제 사용

- `compose-behavior-spec` 의 step 4 에서 자동 호출.
- 사용자가 AC 보강 / 분해 시 직접 호출.

## 입력

- `<project>/.ai-context/base/behavior-spec.json` (chain 2 진행 중)
- `<project>/.ai-context/base/discovery-spec.json` (use case backward link)
- `<project>/.ai-context/base/business-rules.json` + `domain.json` (BR / domain reference)

## 산출

- `<project>/.ai-context/base/acceptance-criteria.json` (schemas/acceptance-criteria.schema.json 의무 / json 단독 / Gherkin 은 json gherkin 필드)

> **code_pointers_na 기본** (F-DOGFOOD-009) — AC 는 의도 노드(Gherkin) → 코드 anchor 는 하위 TC/IMPL 가 보유. 각 AC `code_pointers_na: true` 기본 (dep-graph code-pointer coverage 정직). builder backstop 자동 보강 + 산출 시점 명시 권장.

## AC 구조 (Gherkin BDD)

```json
{
	"id": "AC-USER-001",
	"behavior_ref": "BHV-USER-001",
	"use_case_ref": "UC-USER-001",
	"title": "이메일+비밀번호로 정상 로그인",
	"gherkin": {
		"given": ["user 가 회원가입을 마쳤다"],
		"when": "user 가 이메일 'a@x.com' 과 비밀번호 'P@ssw0rd!' 로 POST /login 호출",
		"then": ["200 응답", "JWT 발급"]
	},
	"severity": "must",
	"verifiable": true,
	"test_case_refs": ["TC-USER-001"],
	"automated_runnable": true,
	"layer": "be",
	"story_ref": "STORY-LOGIN-001",
	"openapi_path": "/api/login",
	"operationId": "loginUser"
}
```

## layer + contract ref 산출 의무

AC 안 `layer` 필드 부여 + contract ref 명시 (schema-level if/then 강제):

| layer        | required 필드                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `be`         | `openapi_path` + `operationId` (BE swagger contract anchor)                                              |
| `fe`         | `state_map_ref` + `dtcg_token_ref` + `visual_manifest_ref` (FE state-map + DTCG token + visual contract) |
| `db`         | required ❌                                                                                              |
| `e2e`        | required ❌ (FE+BE cross / e2e test framework anchor)                                                    |
| `infra`      | required ❌                                                                                              |
| `cross-cut`  | Story anchor (BE+FE 모두 포함) / contract ref optional                                                   |
| (layer 부재) | legacy backward-compat / if/then trigger ❌                                                              |

### FE AC 예제

```json
{
	"id": "AC-PWD-002",
	"behavior_ref": "BHV-PWD-001",
	"use_case_ref": "UC-PWD-001",
	"gherkin": {
		"given": ["사용자 인증됨"],
		"when": "PasswordChangeForm 안 새 비번 12자 입력",
		"then": ["submit 버튼 enabled", "validation toast 미표시"]
	},
	"severity": "must",
	"verifiable": true,
	"test_case_refs": ["TC-PWD-101"],
	"automated_runnable": true,
	"layer": "fe",
	"story_ref": "STORY-PWD-001",
	"state_map_ref": "PasswordChangeForm.idle",
	"dtcg_token_ref": "default",
	"visual_manifest_ref": "settings/PasswordChangeForm"
}
```

## Story anchor 명시

AC 안 `story_ref` 부여 (Jira Story ID 또는 자유 string). Story = BHV/AC cross-cut anchor:

- BHV 1개 안에서 BE AC + FE AC 모두 같은 `story_ref` 부여 가능 (cross-cut paradigm 정합).
- chain plan 진입 시 task-plan.tasks[].story_ref 안 정합 의무.

## verifiable=true 정합 (schema if/then)

`verifiable=true` 인데 `test_case_refs` 가 빈 배열이면 → acceptance-criteria.schema.json `if/then` 강제 → schema-validator 자동 차단. chain 2 → 3 forward link 의무.

`verifiable=false` 허용 case (제한적):

- 비기능 (예: "system shall be available 99.9%") — SLA / 운영 측정 / 자동 test ❌.
- exploratory testing (예: "ux 친화도") — 사람 검토 only.

verifiable=false AC 비율 ≤ 10% 권고. 초과 시 `chain-coverage-validator` 가 medium finding 산출 (overcompleX → 분해 권고).

## MoSCoW 분류

| moscow | 의미                                | gate #2 통과 자격 |
| ------ | ----------------------------------- | ----------------- |
| MUST   | 의무 / chain 3-4 미달 시 release ❌ | 100% TC 의무      |
| SHOULD | 권고 / 우회 허용 (사용자 명시)      | 80% TC 권고       |
| COULD  | nice-to-have                        | optional          |
| WONT   | 본 release 미포함 (chain 4 test ❌) | skip              |

## 절차

1. **각 BHV 마다 1+ AC 분해** — happy path + ≥ 1 edge case + ≥ 1 negative path 권고.
2. **Gherkin 작성** — Given/When/Then 단순 사용자어. step 본문에 specific value (random 변수 ❌ / property test 는 별도 chain 2 property_tests).
3. **severity + related_aps 채움** — 관련 analysis BR (br_id) 의 `severity` 매핑 (business-rules.json / critical / high / medium / low). severity 는 analysis BR 가 SSOT (br_id backward link 로 조회 / business_rules_intent 에 criticality 필드 없음). severe AP coverage: antipatterns.json 의 critical/high AP 를 cover 하는 AC 는 `related_aps[]` 에 해당 AP-\* 등재 — gate#2 chain-coverage `--antipatterns` lane(`chain.ap.uncovered_severe` critical/blocking) 정합 (related_brs 와 병렬).
4. **moscow 채움** — release 우선순위 / 사용자 검토 필수 (default = MUST 단, exploratory = SHOULD).
5. **test_case_refs 채움 (forward link)** — chain 4 (test) 진입 후 `generate-test-spec` skill 이 backward 채움. 본 skill 단계에서는 placeholder `["TC-{BHV}-001"]` 사전 등록 + chain 4 step 1 에서 검증.
6. **자동 검증 (chain 2 시점)** — chain-coverage-validator 의 `chain.ac.verifiable_no_tc` (verifiable=true ⇔ test_case_refs ≥ 1) check 로 위임 (compose-behavior-spec step 7 합산). `spec-test-link-validator` 는 chain **test(4)** 의 generate-test-spec 가 `test-spec.json` 을 산출한 _후_ 호출 — chain 2 시점엔 test-spec.json 부재라 `--test-spec` 호출 시 usage error(exit 2). 따라서 chain 2 에서 spec-test-link-validator 호출 ❌ (S12 / test 단계로 이관).

## Gherkin 본문 작성 가이드

**Given** = 시스템 + 사용자 사전 상태 (e.g., "user 가 회원가입을 마쳤다 / DB 에 user(email='a@x.com') 존재").
**When** = trigger event (1 동작 / 1 actor / 1 step). 복합 step 은 분리 → 별도 AC.
**Then** = outcome (post-condition + side-effect). API status code + body 구조 명시 권고.

**And** 허용 (Given/When/Then 각각 multi-step). 단 When 의 And 는 분해 권고 (1 trigger 원칙).

## 인용

- 결단: DEC-2026-05-26-contract-강제-양-axis (§1 layer 1 hard gate)
- ADR: ADR-011 (json 단독 산출)
- schema: schemas/acceptance-criteria.schema.json (deliverable 19)
- schema: schemas/behavior-spec.schema.json `acceptance_criteria_refs[]` 정합
- master plan §B chain 2
- BDD ([Cucumber Gherkin spec](https://cucumber.io/docs/gherkin/) — official)

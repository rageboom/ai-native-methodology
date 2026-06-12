---
name: spec-compose-behavior-spec
description: v2.0 chain 2 진입 skill. discovery-spec.use_cases + analysis 의 `formal-spec` phase (state-machine / sequence / decision-table / invariant / property-test) 를 통합하여 behavior-spec.json 추출. executable behavioral contract. UC → BHV 1:N forward link 의무. spec-architect persona 책임.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# compose-behavior-spec

chain 2 (spec) 의 **진입 skill**. discovery-spec + analysis `formal-spec` phase 통합 → executable behavior contract.

## 언제 사용

- chain 1 (planning) 종결 + gate #1 go 결단 후 의무.
- 사용자: "behavior-spec 만들어줘" / "스펙 단계 진입".

## 입력

- `<project>/.ai-context/output/discovery-spec.json` (chain 1 산출)
- `<project>/.ai-context/output/business-rules.json` + `shared/domain.json` + 7대 산출물
- `<project>/.ai-context/output/formal-spec/state-machines/*.json` + `formal-spec/sequences/*.json` + `formal-spec/decision-tables/*.json` + `formal-spec/invariants/*.ts` (`formal-spec` phase 산출 / formal-spec/ prefix = schema·template convention 정합 S8)

## 산출물

- `<project>/.ai-context/output/behavior-spec.json` (schemas/behavior-spec.schema.json 의무 / json 단독 SSOT)

> **code_pointers_na 기본** — BHV 는 의도 노드(executable contract) → 코드 anchor 는 하위 IMPL/TC 가 보유. 각 BHV `code_pointers_na: true` 기본 (dep-graph code-pointer coverage 정직). builder backstop 자동 보강 + 산출 시점 명시 권장.

## UC → BHV 1:N forward link 의무

각 BHV 는 ≥ 1 `use_case_refs` (UC-_ backward link) + ≥ 1 `acceptance_criteria_refs` (AC-_ forward link / chain spec → chain test).

복합 use case 분리 원칙:

- 1 UC = 1+ BHV. 단순 CRUD UC = 1 BHV / 복합 lifecycle UC = state 마다 1 BHV.
- 예: UC-USER-001 (login) → BHV-USER-001 (validate-credentials) + BHV-USER-002 (issue-jwt) + BHV-USER-003 (set-session).

## Story cross-cut anchor 정합

본 skill 안 BHV 산출 시 Story cross-cut anchor 인식:

- BHV-\* = Story anchor (BE+FE/DB/E2E 가로지름) — discovery-spec.UC 의 자연 evolution.
- 본 skill 안 BHV 자체 = cross-cut 단일 (BE-only BHV / FE-only BHV 분리 ❌ — Story paradigm 정합).
- chain plan 진입 후 task-plan.story_refs[] 안 jira_id record (본 skill 책임 ❌ / plan-decompose-and-sequence 책임).
- 본 skill 출력 `behavior-spec.json` 안 BHV-\* = 차기 Story anchor source (jira_id 사전 부여 ❌).

Epic = FE 화면 단위 / 본 skill 안에서 Epic 추출 ❌ (plan-decompose-and-sequence 책임). 다만 BHV 안 `screen_id` hint 가능 (FE 트랙 PoC / 본 skill 안 optional).

## 절차

1. **discovery-spec 로드** — `use_cases[]` + `business_rules_intent[]` 파싱.

2. **각 UC 마다 BHV 분해** — 1 UC + 1 trigger + 1 outcome 단위. 복합 UC 는 분해 (위 §원칙).

3. **각 BHV 의 5 필드 채움**:
   - `preconditions` (formal expressions)
   - `postconditions`
   - `invariants` (`formal-spec` phase invariants/\*.ts 매핑)
   - `state_transition_ref` (`formal-spec` phase state-machines/{id}.json)
   - `decision_table_ref` (`formal-spec` phase decision-tables/{br}.json)
   - `sequence_ref` (`formal-spec` phase sequences/{id}.json)
   - `property_tests[]` (fast-check / Hypothesis / jqwik stub)

4. **acceptance_criteria_refs 채움 (forward link)** — `derive-acceptance-criteria` skill 호출. AC-\* 산출 후 backward link 채움.

5. **spec-integrate-deliverables skill 호출** — analysis 산출물 모두 `cross_links.to_analysis_artifacts` 에 등록.

6. **자동 검증**:

   ```bash
   # chain coverage (UC → BHV / BHV → AC) + severe-AP coverage (gate#2 blocking lane / S13)
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-coverage-validator/src/cli.js \
     --discovery  .ai-context/output/discovery-spec.json \
     --behavior   .ai-context/output/behavior-spec.json \
     --acceptance .ai-context/output/acceptance-criteria.json \
     --antipatterns .ai-context/output/antipatterns.json

   # behavior chain 2 drift (state-machine + sequence 짝)
   node ${CLAUDE_PLUGIN_ROOT}/tools/drift-validator/src/cli.js .ai-context/output/behavior-spec.json

   # formal-spec link chain mode
   node ${CLAUDE_PLUGIN_ROOT}/tools/formal-spec-link-validator/src/cli.js .ai-context/output/ --chain-mode

   # decision-table 5-check
   node ${CLAUDE_PLUGIN_ROOT}/tools/decision-table-validator/src/cli.js .ai-context/output/formal-spec/decision-tables/
   ```

7. **gate #2 호출** — `_base-invoke-go-stop-gate` skill (cluster 5~6).

## property_tests 의무 (chain 2 quality)

각 BHV 의 `property_tests[]` ≥ 1 권고 (Industry research 정합 / fast-check / Hypothesis / jqwik):

- pure function BR (e.g., 비밀번호 해시 검증) → property test 강 권고.
- I/O bound BHV (e.g., DB lifecycle) → unit/integration 우선 (property optional).
- chain 4 test stage 에서 property_tests 가 진짜 test 코드로 generate 됨 (skills/test-generate-test-spec).

## 70~80% 한계 명시

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

자동 추출 ≥ 80% / 사용자 검토 ≤ 20%. 특히 reasoning + invariants 는 사용자 검토 의무. property_tests stub 은 fast-check arbitrary 자동 생성 권고.

## 기술 스택 분기

- Spring/JPA: invariants/_.ts 가 아닌 invariants/_.java (Bean Validation / Hibernate Validator) 가능.
- NestJS/TypeScript: invariants/\*.ts default + class-validator decorator 매핑.
- Python/FastAPI/Pydantic: invariants/\*.py + Pydantic validator.
- Go: invariants/\*.go (struct tag + validator package).

각 framework 에 맞는 invariants 산출물 path 변환은 본 skill 본문에서 분기 (analysis stage `discovery` phase 차용).

## 인용

- ADR: ADR-CHAIN-001 (chain 4단계 정합)
- schema: schemas/behavior-spec.schema.json (deliverable 18)
- 결단: DEC-2026-04-29-phase-4-5-형식화-후보 (`formal-spec` phase chain 2 격상)
- 결단: DEC-2026-05-26-be-fe-산출물-분리 §결단 #6 (Story cross-cut anchor)
- master plan §B chain 2

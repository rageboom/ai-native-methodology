---
name: spec-compose-behavior-spec
description: ★ ★ v2.0 chain 2 진입 skill. discovery-spec.use_cases + analysis 의 `formal-spec` phase (state-machine / sequence / decision-table / invariant / property-test) 를 통합하여 behavior-spec.{json,md} 추출. executable behavioral contract. UC → BHV 1:N forward link 의무. spec-architect persona 책임.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# compose-behavior-spec

★ ★ v2.0 chain 2 (spec) 의 **진입 skill**. discovery-spec + analysis `formal-spec` phase 통합 → executable behavior contract.

## 언제 사용

- chain 1 (planning) 종결 + gate #1 go 결단 후 의무.
- 사용자: "behavior-spec 만들어줘" / "스펙 단계 진입".

## 입력

- `<project>/.aimd/output/discovery-spec.json` (★ chain 1 산출)
- `<project>/.aimd/output/business-rules.json` + `domain.json` + 7대 산출물
- `<project>/.aimd/output/state-machines/*.json` + `sequences/*.json` + `decision-tables/*.json` + `invariants/*.ts` (`formal-spec` phase 산출)

## 산출물

- `<project>/.aimd/output/behavior-spec.json` (★ schemas/behavior-spec.schema.json 의무)
- `<project>/.aimd/output/behavior-spec.md` (사람 눈)
- `<project>/.aimd/output/behavior-diagrams.mermaid` (★ ADR-008 v2 §10 / 통합 view)

## ★ UC → BHV 1:N forward link 의무

각 BHV 는 ≥ 1 `use_case_refs` (UC-* backward link) + ≥ 1 `acceptance_criteria_refs` (AC-* forward link / chain spec → chain test).

복합 use case 분리 원칙:
- 1 UC = 1+ BHV. 단순 CRUD UC = 1 BHV / 복합 lifecycle UC = state 마다 1 BHV.
- 예: UC-USER-001 (login) → BHV-USER-001 (validate-credentials) + BHV-USER-002 (issue-jwt) + BHV-USER-003 (set-session).

## ★ v11.0.0 Story cross-cut anchor 정합 (DEC-2026-05-26-be-fe-산출물-분리 §결단 #6)

본 skill 안 BHV 산출 시 Story cross-cut anchor 본격 인식:
- BHV-* = ★ Story anchor (BE+FE/DB/E2E 가로지름) — discovery-spec.UC 의 자연 evolution.
- 본 skill 안 BHV 자체 = cross-cut 단일 (BE-only BHV / FE-only BHV 분리 ❌ — Story paradigm 정합).
- chain plan 진입 후 task-plan.story_refs[] 안 jira_id record (본 skill 책임 ❌ / plan-decompose-and-sequence 책임).
- 본 skill 출력 `behavior-spec.json` 안 BHV-* = ★ 차기 Story anchor source (jira_id 사전 부여 ❌).

★ Epic = FE 화면 단위 / 본 skill 안에서 Epic 추출 ❌ (plan-decompose-and-sequence 책임). 다만 BHV 안 `screen_id` hint 가능 (FE 트랙 PoC / 본 skill 안 optional).

## 절차

1. **discovery-spec 로드** — `use_cases[]` + `business_rules_intent[]` 파싱.

2. **각 UC 마다 BHV 분해** — 1 UC + 1 trigger + 1 outcome 단위. 복합 UC 는 분해 (위 §원칙).

3. **각 BHV 의 5 필드 채움**:
   - `preconditions` (formal expressions)
   - `postconditions`
   - `invariants` (`formal-spec` phase invariants/*.ts 매핑)
   - `state_transition_ref` (`formal-spec` phase state-machines/{id}.json)
   - `decision_table_ref` (`formal-spec` phase decision-tables/{br}.json)
   - `sequence_ref` (`formal-spec` phase sequences/{id}.json)
   - `property_tests[]` (★ fast-check / Hypothesis / jqwik stub)

4. **acceptance_criteria_refs 채움 (forward link)** — `derive-acceptance-criteria` skill 호출. AC-* 산출 후 backward link 채움.

5. **spec-integrate-deliverables skill 호출** — analysis 산출물 모두 `cross_links.to_analysis_artifacts` 에 등록.

6. **behavior-diagrams.mermaid 통합 렌더** — 모든 BHV 의 state_machine + sequence 합성 (★ ≥ 100 cell 시 subgraph 분할 / sp3-c1 carry).

7. **자동 검증**:
   ```bash
   # chain coverage (UC → BHV / BHV → AC)
   node tools/chain-coverage-validator/src/cli.js \
     --planning   .aimd/output/discovery-spec.json \
     --behavior   .aimd/output/behavior-spec.json \
     --acceptance .aimd/output/acceptance-criteria.json

   # behavior chain 2 drift (state-machine + sequence 짝)
   node tools/drift-validator/src/cli.js .aimd/output/behavior-spec.json

   # formal-spec link chain mode
   node tools/formal-spec-link-validator/src/cli.js .aimd/output/ --chain-mode

   # decision-table 5-check
   node tools/decision-table-validator/src/cli.js .aimd/output/decision-tables/
   ```

8. **gate #2 호출** — `_base-invoke-go-stop-gate` skill (cluster 5~6).

## ★ ★ ★ property_tests 의무 (chain 2 quality)

각 BHV 의 `property_tests[]` ≥ 1 권고 (★ Industry research 정합 / fast-check / Hypothesis / jqwik):
- pure function BR (e.g., 비밀번호 해시 검증) → property test 강 권고.
- I/O bound BHV (e.g., DB lifecycle) → unit/integration 우선 (property optional).
- ★ chain 3 test stage 에서 property_tests 가 진짜 test 코드로 generate 됨 (skills/test-generate-test-spec).

## 70~80% 한계 명시

자동 추출 ≥ 80% / 사용자 검토 ≤ 20%. 특히 reasoning + invariants 는 ★ 사용자 검토 의무. property_tests stub 은 fast-check arbitrary 자동 생성 권고.

## 인용

- ADR-CHAIN-001 (chain 4단계 정합)
- behavior-spec.schema.json (deliverable 18)
- master plan §B chain 2
- DEC-2026-04-29-phase-4-5-형식화-후보 (`formal-spec` phase chain 2 격상)

## 기술 스택 분기

- Spring/JPA: invariants/*.ts 가 아닌 invariants/*.java (Bean Validation / Hibernate Validator) 가능.
- NestJS/TypeScript: invariants/*.ts default + class-validator decorator 매핑.
- Python/FastAPI/Pydantic: invariants/*.py + Pydantic validator.
- Go: invariants/*.go (struct tag + validator package).

각 framework 에 맞는 invariants 산출물 path 변환은 본 skill 본문에서 분기 (★ analysis stage `discovery` phase 차용).

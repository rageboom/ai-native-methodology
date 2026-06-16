---
name: analysis-business-rules
description: Use after analysis-domain-model to extract business rules as DMN-style decision tables. Generates business-rules.json (산출물 4 일부). DMN 5-check (duplicate / conflict / gap / overlap / type) auto-validated by decision-table-validator. Stage = analysis. 사용자: "비즈니스 규칙 추출" / "decision table" / "BR 분석".
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-business-rules — 비즈니스 규칙 추출

조건 → 결과 매핑을 decision table 형태로 추출. DMN 표준.

## 사전 조건

- `<user-project>/.ai-context/base/shared/domain.json` 존재 (analysis-domain-model 완료 / 또는 manifest.analysis_refs.artifacts 해소)

## 절차

1. **rule 후보 수집** — 코드의 if/switch/policy / annotation / config / 비즈니스 logic 함수
2. **decision table 변환** — DMN 5-check 적용용 **중간 작업 형태** (최종 산출물 shape 아님 / DMN 검증 후 BR 로 환원):
   ```json
   {
     "id": "DT-USER-VERIFY",
     "inputs": [...],
     "rules": [{ "conditions": {...}, "outputs": {...} }, ...],
     "hit_policy": "first | unique | rule-order"
   }
   ```
3. **business-rules 산출 (분할 / BR-split STEP 3 / v0.24.0)** — BC 그룹핑 후 **per-BC leaf 파일 + index** 로 산출(단일 파일 ❌):
   - **per-BC leaf**: `<user-project>/.ai-context/base/domains/<BC-slug>/business-rules.json` — 해당 BC 의 `business_rules[]` 만. schema = `schemas/business-rules-bc.schema.json` (`required:["bounded_context","business_rules"]`). 인스턴스에 `"$schema_ref": "schemas/business-rules-bc.schema.json"` 명시(파일명 fallback 부정합 → 라우팅 명시 필수).
   - **정규 스키마 포인터 키 = `$schema_ref` (값 = 프로젝트-상대 `schemas/<name>.schema.json`)**. 레거시 `$schema_origin`(깊은 `../` 상대경로 / 프로젝트밖 미해결)은 deprecated — **신규 산출물에 절대 방출 ❌**. (id-conventions §$schema 포인터 참조)
   - **index**: `<user-project>/.ai-context/base/business-rules.json` — `bc_files[]`(per-BC 파일 명단/통계) + `total_rules`. schema = `schemas/business-rules-index.schema.json`. 인스턴스에 `"$schema_ref": "schemas/business-rules-index.schema.json"` 명시 **필수**(basename 이 business-rules.json 이라 명시 없으면 옛 단일파일 schema 로 오라우팅).
   - BC 미정 rule = `domains/_uncategorized/business-rules.json` 버킷(단 `bounded_context` required 라 실무상 미발생 / 안전망).
   - loader(`loadBusinessRules`)가 index 를 감지해 per-BC sibling 을 재조립 → 소비자(br-cross / federator / traceability / graph)는 전체 rule 전수 로드(분할 투명).
   - **writer (multi-BC append / F-1)**: 여러 BC 가 같은 index 에 누적될 때 index 를 **통째 재작성 ❌**(BC#2 가 BC#1 엔트리 덮음). `tools/_shared/append-catalog.js` 의 `appendBcFileToIndex(indexPath, {bounded_context, file, rule_count, rule_ids})` 사용 = upsert-by-`bounded_context`(sibling BC 보존) + `total_rules` 재계산 + 기존 indent 보존(reformat 가짜 diff 차단). loader 의 writer 짝.
   ```json
   // .ai-context/base/business-rules.json  (index)
   {
   	"$schema_ref": "schemas/business-rules-index.schema.json",
   	"bc_files": [
   		{ "bounded_context": "BC-USER", "file": "domains/BC-USER/business-rules.json", "rule_count": 1, "rule_ids": ["BR-USER-VERIFY-001"] }
   	],
   	"total_rules": 1
   }
   // .ai-context/base/domains/BC-USER/business-rules.json  (per-BC leaf)
   {
   	"$schema_ref": "schemas/business-rules-bc.schema.json",
   	"bounded_context": "BC-USER",
   	"business_rules": [
   		{
   			"id": "BR-USER-VERIFY-001",
   			"bounded_context": "BC-USER",
   			"title": "이메일 미인증 사용자 로그인 차단",
   			"natural_language": "사용자가 이메일 미인증 상태면 로그인을 거부한다."
   		}
   	]
   }
   ```

   - BR item = `required:["id","bounded_context"]` + (`name`|`title`) + (GWT `given`/`when`/`then` | `natural_language`) 2종 표현 ($defs.businessRule).
   - **`bounded_context` 의무 채움** (v0.3.0 required): 각 BR 을 `domain.json` 의 `bounded_contexts[]` 중 하나에 매핑 (BR id 의 `<DOMAIN>` 부분 + rule 의 도메인/엔티티 참조로 결정). domain.json 에 BC 가 1개뿐(단일 도메인)이면 모든 BR 이 그 BC. 어떤 BC 에도 안 들어가면 = domain 모델 재점검 신호(임의 누락 ❌). → BR↔모듈 추적성 + BC별 산출물 분할(STEP 3) 분할 키.
   - FE form validation 은 `business_rules[]` 안 `auto_extracted=true` BR + top-level `auto_extracted_br_refs` cross-link (별도 top-level 키 아님).
   - **BR id 형식 의무** (자유 paradigm ❌): `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` 정합 의무 = **`BR-<DOMAIN>-<SUBJECT>-<NNN>`** form (예: `BR-USER-VERIFY-001` / `BR-RBAC-PRIORITY-001` / `BR-CARLIST-PAGINATION-001`).
     - prefix `BR-<DOMAIN>-<SUBJECT>` = 의미 (LLM 컨텍스트 read 시 의미 직관)
     - numeric suffix `-NNN` = 단순 식별자 / machine 매칭 (chain-coverage-validator + schema-validator strict regex 매칭 / typo silent fail 차단)
     - **meaningful name 만 산출 ❌** (예: `BR-RBAC-PRIORITY` 단독 = 본 instruction 위반 / chain 진입 시 schema-validator RED → patch fix 의무 발생). 본 instruction 정합 시 patch 의무 ❌ / chain 진입 시 GREEN 직진.
     - **scope 안 다중 BR 산출 시점 = numeric suffix 단순 순차 부여** (001, 002, ...). suffix 자체 의미 결정 ❌ / 의미는 prefix 부분 담당.
4. **decision-table-validator 자동 호출** — DMN 5-check (duplicate / conflict / gap / overlap / type) 정합 검증
5. **finding 등재** — 검출된 conflict / gap / overlap → `log-finding`

## 산출물

`<user-project>/.ai-context/base/business-rules.json` (분할 **index** — top-level 유지) + `<user-project>/.ai-context/base/domains/<BC-slug>/business-rules.json` (per-BC leaf 1개 이상).

## greenfield (code-optional) mode

`work-unit-manifest.scenario == "greenfield"` (legacy 코드 없음 / §2.4 옵션 A) 일 때 — if/switch/policy 코드 스캔 대신 **입력어댑터 extract** 에서 산출:

- 입력 = `.ai-context/scopes/<scope>/planning/{swagger,figma,plan-doc,prompt}-extract.json` (`analysis-greenfield-bootstrap` 진입점).
- BR 후보 = swagger `rules_seed[]` (enum/pattern/min/max/required/format 제약) + PRD acceptance rule (NL md 기획문서) + form-validation-spec (FE 검증).
- `source_grounded_evidence` = **입력 출처 인용** (코드 grep ❌): `swagger:User.email` / `doc:§3.2` (verbatim quote 권장 / LLM fabrication 회피).
- `code_pointers` = N/A (`meta.code_pointers_na` 동형 / 가리킬 코드 부재). business-rules.schema.json 은 code_pointers hard-require ❌.
- **BR id 형식 의무는 greenfield 에서도 동일** (`BR-<DOMAIN>-<SUBJECT>-<NNN>` strict regex / 위 §3 참조).
- intent_certainty = `inferred-consequence`/`unverified-intent` (설계 의도 / 코드 반증 불가).
- 무회귀: scenario ≠ greenfield 시 본 절 무시 (legacy 코드 rule 추출 경로 그대로).

## schema enum 주의 (산출 전 필독)

골프/이벤트 등 **템플릿 미러만으로는 enum 위반**이 자주 난다(LLM-agent 가 템플릿에 안 나타난 자유값 생성). 아래 enum 외 값 = schema-validator RED:

- **`business_rules[].category`** ∈ `validation` / `policy` / `calculation` / `authorization` / `workflow` / `integration` / `fe_validation` / `fe_authorization` / `fe_a11y` / `fe_i18n`. (예: "process"→`workflow` / "concurrency"→`policy` / "transformation"→`calculation` 로 환원 — 자유 카테고리 ❌)
- **`source_evidence[].type`** ∈ `code_validation` / `code_condition` / `orm_constraint` / `sql_case` / `sql_where` / `stored_procedure` / `db_check_constraint` / `config_value` / `fe_validation_schema` / `fe_permission_branch` / `auth_expression` / `auth_expression_websec_ignoring` / `external_call` / `comment` / `test_assertion` / `missing_explicit_policy` / `missing_negative_test`. (예: UPDATE 문 안 조건 = "sql_update" ❌ → `sql_where`)
- **`meta.methodology_version`** = `^v\d+\.\d+...` — **앞 `v` 필수**("0.41.0" ❌ / "v0.41.0" ✅).
- **`meta.human_review_required[].reviewer_role`** ∈ `domain_expert` / `tech_lead` / `designer` / `planner` / `any` ("security_reviewer" ❌ → `tech_lead`).
- 산출 직후 `node ../../tools/schema-validator/src/cli.js <leaf-or-index>` 실행 → RED 면 enum 환원 후 GREEN 확인(validate→repair = per-BC 완료 정의).

## 다음

- **산출 후 exit-gate (F-2)**: `schema-validator` 는 `REQUIRED_VALIDATORS_PER_STAGE.analysis`(gate#0)에 등재돼 있으나 **skill-direct / multi-agent 병렬 분석** 경로에선 chain-driver 를 안 거쳐 자동으로 안 돈다. 직접 `node ../../tools/schema-validator/src/cli.js .ai-context/base` 실행 → leaf+index RED 0 확인(validate→repair = per-BC 완료 정의 / §schema enum 주의).
- `analysis-formal-spec-validation` 호출 권장 (도메인 ↔ 규칙 ↔ 인벤토리 정합)

## 인용

- 결단: DEC-2026-05-30-use-scenario-taxonomy §2.4 (greenfield 옵션 A)
- 결단: DEC-2026-06-12-resve-multidomain-corroboration §4·§F-1·§F-2 (schema enum 주의 + 카탈로그 writer append-catalog + analysis exit-gate 근거)
- 정책: `methodology-spec/workflow/business-logic.md` §5 (4영역 병렬 추출 / rules 매핑 = §5.A SQL CASE/WHERE + §5.B FE validation + §5.C 매직 넘버)
- 정책: `methodology-spec/deliverables/5-business-rules.md`
- schema: `schemas/business-rules-index.schema.json` (index) + `schemas/business-rules-bc.schema.json` (per-BC leaf / `$defs.businessRule` 는 `schemas/business-rules.schema.json` 재사용)
- ADR: ADR-FE-005 (fe_validation 자동 등록)

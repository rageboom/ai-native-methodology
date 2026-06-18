---
name: analysis-form-validation-fe
description: Use when project contains Zod, Yup, Joi, react-hook-form, class-validator, Ajv, or Vest schemas. Extracts form validation rules → business-rules.json fe_validation (auto_extracted=true). Generates form-validation-spec.json (산출물 14). FE-specific. Stage = analysis, track = FE.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-form-validation-fe — Form Validation Spec (FE)

Zod / Yup / RHF / class-validator 등에서 form validation 규칙 추출 → business-rules.json fe_validation 자동 등록.

## 사전 조건

- business-rules.json 존재 (`business-logic` phase 산출)
- FE 트랙 (Zod / Yup / Joi / RHF / class-validator / Ajv / Vest 시그널)

## 절차

1. **Validation lib 식별** — package.json + import 분석:
   - **Zod** (매개체 13 — schema-first / TypeScript-first)
   - Yup
   - Joi
   - react-hook-form (RHF) (+ optional resolver)
   - class-validator (NestJS / 양쪽)
   - Ajv
   - Vest
   - **lib-detection 은 necessary-not-sufficient** — import 존재만으로 "검증 존재"로 단정 ❌. RHF import 가 있어도 resolver/schema 가 없으면 value-bag 일 수 있으므로 절차 2 에서 실제 resolver/schema 유무를 확인할 것.
2. **Schema 추출 (또는 value-bag 분기)** — `z.object()`, `Yup.object()`, `IsEmail()` decorator 등
   - **RHF value-bag 분기** — RHF 가 resolver 없이 import 되고 `register`/`control`/`rules`/`formState.errors` 가 부재하면(`useForm` 이 `getValues`/`setValue`/`watch`/`reset` 만 destructure) RHF 는 상태 컨테이너(value-bag)일 뿐 — 파싱할 schema 가 없다. "Schema 추출"을 기대하지 말고 검증 추출을 다음으로 pivot:
     - (a) imperative onChange/onSubmit guard — `regex.test()`, `.some(v => v === undefined)`, 인라인 비교 등
     - (b) 공유 validation store/util — 중앙 validator (예: zustand 기반 `validationCheckStore.actions.checkValues/checkDateRange`); `source_format=custom_store` + `validator_ref` 로 기록(일회성 inline 검사와 구분)
     - (c) 선언적 field config — UI 컴포넌트 config 의 `isRequired:true` 같은 marker (아래 절차 3 의 declarative marker 규칙 참조)
     - 위 (a)·(c) 의 일회성 검사는 `source_format=manual` 로 매핑.
3. **Constraint 분류** — required / format / range / pattern / cross-field / async
   - **Numeric 복합 술어 분해** — Zod number 1급 술어가 chain 으로 결합된 경우(예: `z.number().int().positive()`)는 단일 range 행(`min_value`/`max_value`)으로 collapse 하지 말고 술어당 1행으로 분해: `int` / `positive` / `nonnegative` / `finite` / `multipleOf`(`schemas/form-validation-spec.schema.json` `validation_type` enum). `.min()`/`.max()` 는 별도로 `min_value`/`max_value` 행 유지.
     - **범위 — Zod number chain 전용**: `int`/`positive`/`nonnegative`/`finite`/`multipleOf` 술어 분해는 **오직 Zod number chain** 에만 적용. 인라인 정규식(예: `/^[0-9]*$/`)은 의미상 "정수·음수아님"을 뜻하더라도 `validation_type=pattern` (`rule_value=/^[0-9]*$/`) 으로 유지하고 numeric 술어로 재확장 ❌ (false decomposition 회피).
   - **선언적 marker + enforcing call = 1 row** — 선언적 UI field marker(예: ConditionForm config 의 `isRequired:true` → `'*'` 표시)와 이를 실제 강제하는 imperative 호출(예: `checkValues([...])`)이 분리돼 있으면 두 줄로 쪼개지 말고 1 row 로 합칠 것: `source_line` = enforcing call, declarative marker 는 note(또는 `declarative_only` 필드)로 기록. enforcing call 이 부재(선언만 됨)하면 `declarative_only=true`.
4. **business-rules.json 의 fe_validation 등재**:
   ```json
   {
     "fe_validation": [
       {
         "id": "FV-USER-EMAIL",
         "auto_extracted": true,
         "auto_extraction_source_id": "src/features/user/schema.ts:UserSchema.email",
         "constraints": {...}
       }
     ]
   }
   ```
5. **form-validation-spec.json 작성** — `schemas/form-validation-spec.schema.json`
6. **9 매개체 분류 + `source_libraries` 작성** — Zod / Yup / Joi / RHF / class-validator / Ajv / Vest 어떤 것을 source 로 썼는지 metric. `source_libraries[]` 는 schema 명시 필드로 emit: `{library(enum), detected, library_version(package.json version 문자열), scope_files[](사용 source 파일), schemas_count(추출 schema 개수 — z.object()/yup.object() 등)}`. 비-schema alias(`version` / `usage_count` / `detection_source`) emit ❌ — `library_version` 사용 + `schemas_count` 채울 것.
   - **선언됐으나 미사용 lib = `detected=false` 로 emit** — package.json 에 validation lib(예: zod)이 선언됐으나 import site 가 0 이면 해당 lib 을 `source_libraries[]` 에 `detected=false` 로 명시 emit 할 것(생략 ❌). 이는 의도적 — adoption gap(권위 매개체 선언만 하고 실제로는 다른 검증 방식 사용)을 silent 누락이 아닌 가시적 사실로 문서화한다.

7. **UI-library silent constraint 의 scope 경계** — UI 라이브러리가 조용히 강제하는 입력 제약(예: MUI `inputProps.maxLength`, RealGrid editor `maxLength` / `setColumnProperty`)은 **검증 사실로 보존**하되 다음을 표시:
   - `framework_coupled=true` + `runtime_executable=false` (framework-neutral IR 로 활용 불가 — display/위젯 prop 일 뿐)
   - `summary.br_auto_extraction_count` 에서 **제외** — business-rules.json fe_validation BR 자동추출 대상 아님(검증 사실은 기록하되 BR 로 승격 ❌).
   - 이는 검증 라이브러리(Zod/Yup/...) 추출 범위와 UI-prop 제약을 구분하는 경계 — 검증 사실 보존과 BR 자동추출을 분리한다.

8. **추출 방식 정직 표기 (`summary.captured_by`)** — AST 툴(ts-morph / babel-traverse)이 프로비저닝돼 있으면 `ts_morph_real`/`babel_traverse_real`. AST 툴이 환경에 부재하면 grep/Read 기반 정적 추출은 `static_extraction` 으로 표기하며 이는 정직한 fallback tier — `-5%p` 패널티 대상 아님(penalized 되는 `simulation` 과 구분; simulation = 실코드 확인 없이 추정·persona 흉내). AST 툴 부재가 패널티가 되어서는 안 된다.

## 산출물

- `<user-project>/.ai-context/base/business-rules.json` (fe_validation 추가)
- `<user-project>/.ai-context/base/domains/<BC>/form-validation-spec.json`

## 인용

- 정책: methodology-spec/deliverables/14-form-validation-spec.md
- schema: schemas/form-validation-spec.schema.json
- ADR: ADR-FE-005 (권위 매개체 13 — Zod)
- DEC-2026-06-18-fe-dogfood-cycle6 (cycle6 — RHF value-bag 분기 + custom_store/validator_ref/declarative_only + UI-prop scope 경계 + 정적추출 비패널티)

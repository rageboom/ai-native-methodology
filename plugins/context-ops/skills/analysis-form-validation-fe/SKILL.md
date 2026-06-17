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
   - react-hook-form (RHF) + resolver
   - class-validator (NestJS / 양쪽)
   - Ajv
   - Vest
2. **Schema 추출** — `z.object()`, `Yup.object()`, `IsEmail()` decorator 등
3. **Constraint 분류** — required / format / range / pattern / cross-field / async
   - **Numeric 복합 술어 분해** — Zod number 1급 술어가 chain 으로 결합된 경우(예: `z.number().int().positive()`)는 단일 range 행(`min_value`/`max_value`)으로 collapse 하지 말고 술어당 1행으로 분해: `int` / `positive` / `nonnegative` / `finite` / `multipleOf`(`schemas/form-validation-spec.schema.json` `validation_type` enum). `.min()`/`.max()` 는 별도로 `min_value`/`max_value` 행 유지.
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

## 산출물

- `<user-project>/.ai-context/base/business-rules.json` (fe_validation 추가)
- `<user-project>/.ai-context/base/domains/<BC>/form-validation-spec.json`

## 인용

- 정책: methodology-spec/deliverables/14-form-validation-spec.md
- schema: schemas/form-validation-spec.schema.json
- ADR: ADR-FE-005 (권위 매개체 13 — Zod)

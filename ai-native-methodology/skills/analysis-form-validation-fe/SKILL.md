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
   - **Zod** (★ ADR-FE-005 매개체 13 — schema-first / TypeScript-first)
   - Yup
   - Joi
   - react-hook-form (RHF) + resolver
   - class-validator (NestJS / 양쪽)
   - Ajv
   - Vest
2. **Schema 추출** — `z.object()`, `Yup.object()`, `IsEmail()` decorator 등
3. **Constraint 분류** — required / format / range / pattern / cross-field / async
4. **business-rules.json 의 fe_validation 등재** (★ ADR-FE-005):
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
5. **form-validation-spec.json 작성** — `schemas/form-validation-spec.schema.json` (v1.4 Stage 7-pre 신규)
6. **9 매개체 분류** — Zod / Yup / Joi / RHF / class-validator / Ajv / Vest 어떤 것을 source 로 썼는지 metric

## 산출물

- `<user-project>/.aimd/output/business-rules.json` (fe_validation 추가)
- `<user-project>/.aimd/output/form-validation-spec.json`

## 본체 명세

- `methodology-spec/deliverables/14-form-validation-spec.md` (v1.4 Stage 7-pre)
- `schemas/form-validation-spec.schema.json`
- ADR-FE-005 (권위 매개체 13 — Zod 추가)

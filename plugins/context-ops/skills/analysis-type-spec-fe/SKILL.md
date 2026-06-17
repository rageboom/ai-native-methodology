---
name: analysis-type-spec-fe
description: Use when project is TypeScript (.tsx/.ts files + tsconfig.json present). Triggers ts-morph extraction for type-spec.json (산출물 15) — TypeScript types and interfaces. FE+BE TypeScript stack. Stage = analysis, track = FE (TS-heavy).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-type-spec-fe — TypeScript Type Spec (FE / TS)

TypeScript 코드베이스의 type 정의 → type-spec.json + framework_neutrality_score 정량.

## 사전 조건

- TypeScript 코드베이스 (`.tsx` / `.ts` + `tsconfig.json` 존재)
- ts-morph 사용 가능 환경 — `npm i -D ts-morph tsx`

## 절차

1. **ts-morph 추출 스크립트 실행** — TypeScript AST parsing (진짜 도구 실행 의무 / no-simulation). `npx ts-morph project` 는 비존재 CLI 라 사용 불가 — ts-morph 는 라이브러리이므로 추출 스크립트를 작성해 실행한다:
   - `extract-types.ts` 작성 — ts-morph `Project({ tsConfigFilePath })` 로 SourceFile 순회하며 interface / type alias / enum 추출 → `type-spec.json` emit.
   - 실행:
   ```bash
   npx tsx extract-types.ts
   ```
   환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 (CI) 명시.
2. **Type 추출** — interface / type alias / enum / class type
3. **Framework neutrality score 정량** — type 의 framework coupling 정도:
   - 0 = pure data (e.g., `User { id, email }`)
   - 0.5 = mild coupling (TanStack Query type 의 일부)
   - 1.0 = full coupling (React component props with hooks)
4. **Coupling 사유 enum 분류** (`types[].framework_coupling_reasons` / `schemas/type-spec.schema.json` enum 정합 — snake_case 8종):
   - `react_fc_import`
   - `react_node_import`
   - `react_props_pattern`
   - `vue_setup_helper`
   - `vue_defineProps_macro`
   - `angular_decorator`
   - `angular_observable`
   - `rxjs_import`

   > ⚠️ schema enum 은 snake_case. kebab-case(`jsx-element` 등)로 emit 하면 validation 실패. step 5 인라인 예시(`react_props_pattern`)와 동일 표기.
5. **type-spec.json 작성** — `schemas/type-spec.schema.json` (required = `meta` / `types` / `summary`. `framework_neutrality_score`·`framework_coupled_count`·`captured_by` 는 `summary` 하위 / `framework_coupling_reasons` 는 `types[]` 하위):
   ```json
   {
     "meta": { ... },
     "types": [ { "...": "...", "framework_coupling_reasons": ["react_fc_import"] } ],
     "summary": {
       "total_types": 42,
       "framework_neutrality_score": 0.72,
       "framework_coupled_count": 12,
       "captured_by": "ts_morph_real",
       "captured_by_version": "ts-morph@22.0.0",
       "duration_ms": 1234,
       "reproduction_command": "npx tsx extract-types.ts"
     }
   }
   ```

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/type-spec.json`

## 인용

- 정책: methodology-spec/deliverables/15-type-spec.md
- schema: schemas/type-spec.schema.json
- ADR: ADR-FE-006 (framework-neutral IR 4계층)

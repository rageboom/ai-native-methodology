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
   환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 (CI) 명시. 불가피하게 정적 추출 시 `captured_by=manual_extraction` (real-tool 도 simulation 도 아닌 정직한 fallback tier):
   - `grep -rnE 'interface |type |enum '` 등으로 declaration 을 열거하고 각 type 의 `file:line` 을 인용한다.
   - `summary.reproduction_command` 에 실제 추출 명령을 기록한다 (schema `allOf` 가 `manual_extraction → reproduction_command` 를 의무화 — 환경 복원 시 AST 재추출 가능하도록 provenance 보존).
2. **Type 추출 + reference 해소 분류** — interface / type alias / enum / class type 추출. monorepo 에서는 각 `references[]` 항목을 bare 문자열 대신 `{ref, resolution, t_id}` 객체로 기록한다 (legacy bare 문자열도 schema 상 허용 — additive). `resolution` 분류:
   - `intra_spec` — 본 type-spec 내 다른 T-ID (이 경우 `t_id` 채움)
   - `in_repo` — 동일 repo 의 다른 scope/패키지 타입
   - `external_workspace` — `@sg/*` 등 workspace 패키지 (분석 scope 밖)
   - `node_module` — 서드파티 (`@okta/*`, `@mui/*`, `react` 등)
   - `unresolved` — 해소 불가 (이름만 알고 출처 미상)

   > ⚠️ 외부 참조(`external_workspace` / `node_module`)는 본 scope 에서 정의·중립화할 수 없으므로, 보고하는 어떤 resolved-ratio (해소율) 산정에서도 **분모에서 제외**한다.
3. **Framework neutrality score 정량** — type 의 framework coupling 정도:
   - 0 = pure data (e.g., `User { id, email }`)
   - 0.5 = mild coupling (TanStack Query type 의 일부)
   - 1.0 = full coupling (React component props with hooks)
   - **분모 라벨 (`summary.framework_neutrality_basis`)** — `framework_neutrality_score` 의 정의는 그대로 유지하되, 분모를 명시하는 보조 label 을 단다. `all_types` (기본) = 전체 추출 타입 / `scope_internal_only` = 외부(external_workspace/node_module) 제외한 scope-내부 타입만. monorepo 에서 외부 참조 타입이 분모를 비대표적으로 왜곡할 때 `scope_internal_only` 로 명시하고 `summary.scope_internal_type_count` 에 representable 분모(외부 제외 타입 수)를 기록한다.
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

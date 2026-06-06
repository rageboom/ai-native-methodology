---
name: phase-5-type-spec
description: Use when project is TypeScript (.tsx/.ts files + tsconfig.json present). Triggers ts-morph extraction for type-spec.json (산출물 15) — TypeScript types and interfaces. FE+BE TypeScript stack. Stage = analysis, track = FE (TS-heavy).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# phase-5-type-spec — TypeScript Type Spec (FE / TS)

TypeScript 코드베이스의 type 정의 → type-spec.json + framework_neutrality_score 정량.

## 사전 조건

- TypeScript 코드베이스 (`.tsx` / `.ts` + `tsconfig.json` 존재)
- ts-morph 사용 가능 환경

## 절차

1. **ts-morph 실행** — TypeScript AST parsing ( 진짜 도구 실행 의무 / no-simulation):
   ```bash
   npx ts-morph <project>
   ```
   환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 (CI) 명시.
2. **Type 추출** — interface / type alias / enum / class type
3. **Framework neutrality score 정량** — type 의 framework coupling 정도:
   - 0 = pure data (e.g., `User { id, email }`)
   - 0.5 = mild coupling (TanStack Query type 의 일부)
   - 1.0 = full coupling (React component props with hooks)
4. **Coupling 사유 enum 분류** (8종):
   - react-hook-coupling
   - jsx-element
   - dom-event
   - browser-api
   - framework-decorator
   - css-in-js
   - state-lib-specific
   - other
5. **type-spec.json 작성** — `schemas/type-spec.schema.json` (v1.4 Stage 7-pre 신규):
   ```json
   {
     "types": [...],
     "framework_neutrality_score": 0.72,
     "framework_coupling_reasons": [...],
     "tool_evidence": "ts-morph @22.0.0",
     "meta_confidence": {...}
   }
   ```

## 산출물

`<user-project>/.aimd/output/type-spec.json`

## 본체 명세

- `methodology-spec/deliverables/15-type-spec.md` (v1.4 Stage 7-pre)
- `schemas/type-spec.schema.json`
- ADR-FE-006 (framework-neutral IR + IR 4계층)

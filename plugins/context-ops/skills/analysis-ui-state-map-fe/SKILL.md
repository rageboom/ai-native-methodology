---
name: analysis-ui-state-map-fe
description: Use when project contains React/Vue/Svelte/Solid + state library (Zustand, Redux, Pinia, MobX, Jotai, TanStack Query, RTK Query, SWR). Generates state-map.json (산출물 8). FE-specific. Stage = analysis, track = FE.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-ui-state-map-fe — FE State Map (FE)

FE 의 client state + server state cache shape 추출.

## 사전 조건

- output/shared/inventory.json / output/shared/architecture.json 존재 (또는 manifest.analysis_refs.artifacts 해소)
- FE 트랙 (React/Vue/Svelte/Solid + state lib 시그널)

## 절차

1. **State lib 식별**:
   - Client state: Zustand store / Redux slice / Pinia store / MobX observable / Jotai atom
   - Server state: TanStack Query / RTK Query / SWR / Apollo cache
2. **State shape 추출** — 각 store / slice / atom 의 type 정의 (TypeScript) 또는 initial value
3. **Mutation / action 추출** — store 의 setter / action / dispatch 후보
4. **Server state cache key 매핑** — `useQuery(['users', id])` 같은 cache key + 응답 shape
5. **Server state ↔ openapi 매핑** — server-state cache 가 어느 endpoint 와 정합
6. **state-map.json 작성** — `schemas/state-map.schema.json`

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/state-map.json`

## 인용

- 정책: `methodology-spec/deliverables/8-state-map.md`
- 정책: `methodology-spec/workflow/ui.md`
- schema: `schemas/state-map.schema.json`
- ADR: ADR-FE-006 (framework-neutral IR 4계층)

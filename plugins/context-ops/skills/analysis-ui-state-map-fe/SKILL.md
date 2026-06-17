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

1. **5 진실 `state_sources` 열거 (정확히 5 / schema `minItems:maxItems=5`)** — 분산 상태 5 출처를 모두 명시하되, 부재한 것도 `detected:false` 로 포함:
   - `server_cache` — TanStack Query / RTK Query / SWR / Apollo cache
   - `client_state` — Zustand / Redux / Pinia / MobX / Jotai
   - `url_state` — route params / query string (react-router / TanStack Router) — 없으면 `detected:false`
   - `form_state` — react-hook-form / Formik — 없으면 `detected:false`
   - `dom_state` — uncontrolled ref / imperative widget(RealGrid·AG-Grid 등) — 없으면 `detected:false`
2. **State shape 추출** — 각 store / slice / atom 의 type 정의 (TypeScript) 또는 initial value
3. **Mutation / action 추출** — store 의 setter / action / dispatch 후보
4. **상태 머신 추출 (`machines`, REQUIRED)** — 화면/feature 흐름을 SCXML 1.0 / XState v5+ 호환 FSM 으로:
   - `id` = `FSM-FE-<DOMAIN>-NNN` 패턴 / `name` / `scope` = page|component|feature|global
   - `initial` + `states`(+ transition) / `scxml_compliant`·`xstate_compatible`·`primary_source_type` 플래그
5. **Server state cache key + openapi 매핑** — `useQuery(['users', id])` cache key + 응답 shape ↔ 어느 endpoint 와 정합
6. **`cross_links` 작성** — machine ↔ 타 산출물 link: `to_artifact` = ui-spec|api|rules|domain|antipatterns|state-map / `link_type` = implements|derives_from|validates|triggers|depends_on. machine 간 의존은 `to_artifact=state-map` + `to_id=FSM-FE-*`.
7. **`validation_summary` + `trust_step` 기록** — drift-validator FE 실행 여부 / `scxml_export_validated`(XState SCXML import 시도 = 단계 5 진짜 도구 검증). 미실행 시 `false` + `meta.warnings` 에 정직 기록(미실행을 real 로 위장 ❌).
8. **state-map.json 작성** — `schemas/state-map.schema.json` (required = `meta` / `state_sources` / `machines`)

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/state-map.json`

## 인용

- 정책: `methodology-spec/deliverables/8-state-map.md`
- 정책: `methodology-spec/workflow/ui.md`
- schema: `schemas/state-map.schema.json`
- ADR: ADR-FE-006 (framework-neutral IR 4계층)

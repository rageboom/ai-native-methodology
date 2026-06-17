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
     - **`url_model` 로 패러다임 분류** (url_state `detected:true` 일 때): `useParams` / `useSearchParams` 로 라우트 파라미터·쿼리를 읽어 상태로 쓰면 `route_param`. 라우트 파라미터 없이 `useLocation.pathname` 자체를 진실로 삼고 `useNavigate` 로 동기화(경로 매칭 = 탭/메뉴 selection backbone)하면 `pathname_as_truth`. 둘은 마이그레이션·테스트 전략이 달라 구분이 필요하다.
   - `form_state` — react-hook-form / Formik — 없으면 `detected:false`
   - `dom_state` — uncontrolled ref / imperative widget(RealGrid·AG-Grid 등) — 없으면 `detected:false`
   - **`liveness` 로 실가동 분류** (`detected:true` source): 실제 consumer call-site 가 있어 진실로 동작하면 `present_active`. 라이브러리가 mount/register 됐으나 consumer-API `grep_hit_count==0` 이면 `present_unused` (예: `DndProvider` 만 마운트되고 `useDrag`/`useDrop` 0 hit). `detected` 는 존재/부재 이진을 유지하고 `liveness` 가 이를 refine 한다.
   - **non-wired(미연결) 머신은 finding 으로 flag** — `present_unused` source 또는 실제 흐름에 wired 되지 않은 머신은 free-text 로 흘리지 말고 `_base-log-finding` 으로 finding 등재 후 (6단계) `related_findings[]` 로 링크한다.
2. **State shape 추출** — 각 store / slice / atom 의 type 정의 (TypeScript) 또는 initial value
3. **Mutation / action 추출** — store 의 setter / action / dispatch 후보
4. **상태 머신 추출 (`machines`, REQUIRED)** — 화면/feature 흐름을 SCXML 1.0 / XState v5+ 호환 FSM 으로:
   - `id` = `FSM-FE-<DOMAIN>-NNN` 패턴 / `name` / `scope` = page|component|feature|global
   - `initial` + `states`(+ transition) / `scxml_compliant`·`xstate_compatible`·`primary_source_type` 플래그
   - **전이 grounding 은 `source_ref` 로** — transition 객체(`{target,guard,actions}`)는 그 전이를 일으키는 코드 anchor 를 `source_ref`(file:line 또는 file:line-line, 예: `useChangedRouteEffect.ts:11`)로 적는다. `actions` 문자열에 `(file:line)` 을 끼워넣지 말 것 — anchor 는 queryable 한 `source_ref` 필드로 분리한다. (`machines.source_files[]` 는 머신 단위 anchor, `source_ref` 는 전이 단위.)
5. **Server state cache key + openapi 매핑** — `useQuery(['users', id])` cache key + 응답 shape ↔ 어느 endpoint 와 정합
6. **`cross_links` 작성 + mixed→finding 의무** — machine ↔ 타 산출물 link: `to_artifact` = ui-spec|api|rules|domain|antipatterns|state-map|findings / `link_type` = implements|derives_from|validates|triggers|depends_on. machine 간 의존은 `to_artifact=state-map` + `to_id=FSM-FE-*`.
   - **`primary_source_type=mixed` 머신은 finding 등재 의무** — 2+ source 결합(분산 진실 위험)인 머신은 반드시 `_base-log-finding` 으로 finding(F-XXX)을 등재한다. `meta.warnings` 나 `human_review_required` side-channel 에 흘리지 말 것.
   - **finding 링크 방법 (2 경로, 둘 다 additive)** — (a) 머신에 `related_findings:["F-XXX", ...]` 직접 링크 (machine 단위 / `^F-` 패턴), 그리고/또는 (b) `cross_links` 에 `{to_artifact:"findings", to_id:"F-XXX", link_type:"depends_on"}` 등재 (cross_links grep / dep-graph 탐색용). `related_apis` + `cross_links` 의 기존 dual idiom 과 동일.
7. **`validation_summary` + `trust_step` 기록** — drift-validator FE 실행 여부 / `scxml_export_validated`(XState SCXML import 시도 = 단계 5 진짜 도구 검증). 미실행 시 `false` + `meta.warnings` 에 정직 기록(미실행을 real 로 위장 ❌).
8. **state-map.json 작성** — `schemas/state-map.schema.json` (required = `meta` / `state_sources` / `machines`)

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/state-map.json`

## 인용

- 정책: `methodology-spec/deliverables/8-state-map.md`
- 정책: `methodology-spec/workflow/ui.md`
- schema: `schemas/state-map.schema.json`
- ADR: ADR-FE-006 (framework-neutral IR 4계층)

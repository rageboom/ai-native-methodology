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
   - **참조 무결성 의무 (dangling reference 금지)** — 모든 전이 `target` / `initial` / `final_states` / `child_states`(compound) / parallel `regions` / history `default_target` 는 **본 머신 `states` 에 정의된 키**여야 한다(SCXML 1.0 §3.11 — target = legal state specification MUST / 정의 없는 target = 비적합 문서). transient 상태(예: `closing`·`saving`·`submitting`)를 target 으로 이름지으면 **반드시 그 state 를 `states` 에 정의**하라 — mutation 진행 상태를 별도 state 로 모델링하거나, 진행 상태를 생략하려면 mutation 발동 후 재조회 상태로 retarget(예: 마감/저장 → onSuccess refetch → `fetching` 재진입). **크로스머신 발동은 `target` 이 아니다** — 다른 머신을 발동하는 흐름(예: 마감 토글을 별도 FSM 에 위임)은 `actions` 서술 + `cross_links(link_type=triggers, to_id=FSM-FE-*)` 로 표현하고, `target` 은 **항상 본 머신 내부 state** 를 가리킨다. 도달 불가(어느 전이로도 못 닿는) state 도 남기지 말 것.
   - **전이 grounding 은 `source_ref` 로** — transition 객체(`{target,guard,actions}`)는 그 전이를 일으키는 코드 anchor 를 `source_ref`(file:line 또는 file:line-line, 예: `useChangedRouteEffect.ts:11`)로 적는다. `actions` 문자열에 `(file:line)` 을 끼워넣지 말 것 — anchor 는 queryable 한 `source_ref` 필드로 분리한다. (`machines.source_files[]` 는 머신 단위 anchor, `source_ref` 는 전이 단위.)
   - **canvas/imperative 위젯 내부 상태 = React 외부 진실 → `imperative:true` + `widget_lib` + finding 의무** — RealGrid·AG-Grid 등 canvas 위젯은 row-lifecycle(예: RowState CREATED/DELETED/NONE)을 `dataProvider`/`gridView` 안에서 명령형으로 보유하며, 이는 React 상태가 아닌 위젯 내부 진실이다(`getRowState`/`setRowState`/`removeRow`/`getCurrent` 호출이 신호). 이런 머신은 `primary_source_type=dom_state` 로 잡되 `imperative:true` + `widget_lib`(예: `realgrid`)을 함께 표기해, `states`(SCXML atomic)로 flatten 됐을 때 React-internal 머신과 한 표현으로 뭉뚱그려져 분산-진실 신호가 사라지는 것을 막는다. canvas 위젯 내부 진실은 `_base-log-finding` 으로 finding 등재 후 (6단계) `related_findings[]` 로 링크할 의무.
   - **RHF value-bag(getValues/setValue 만) → `primary_source_type=mixed` + form_state 머신 분리 금지** — react-hook-form 이 `register`/`handleSubmit`/`formState`/validation 없이 `getValues`/`setValue` 만 쓰여 transient 입력 버퍼로만 동작하고, 검색조건 등 진짜 진실은 client_state(Zustand/Redux store)에 `setState` 로 복사돼 query key 까지 그 store 로 구성되면, RHF 는 독립 진실이 아니다. 이 경우 흐름 머신은 `primary_source_type=mixed`(client_state+form-buffer 결합)로 잡고 별도 `form_state` 머신으로 분리하지 않는다(mixed 이므로 6단계 finding 등재 의무 그대로 적용). `form_state` source 의 `detected` 는 RHF 존재로 true 를 유지하되 진실 귀속은 client_state 임을 머신 분류로 표현한다.
5. **Server state cache key + openapi 매핑** — `useQuery(['users', id])` cache key + 응답 shape ↔ 어느 endpoint 와 정합
6. **`cross_links` 작성 + mixed→finding 의무** — machine ↔ 타 산출물 link: `to_artifact` = ui-spec|api|rules|domain|antipatterns|state-map|findings / `link_type` = implements|derives_from|validates|triggers|depends_on. machine 간 의존은 `to_artifact=state-map` + `to_id=FSM-FE-*`.
   - **`primary_source_type=mixed` 머신은 finding 등재 의무** — 2+ source 결합(분산 진실 위험)인 머신은 반드시 `_base-log-finding` 으로 finding(F-XXX)을 등재한다. `meta.warnings` 나 `human_review_required` side-channel 에 흘리지 말 것.
   - **finding 링크 방법 (2 경로, 둘 다 additive)** — (a) 머신에 `related_findings:["F-XXX", ...]` 직접 링크 (machine 단위 / `^F-` 패턴), 그리고/또는 (b) `cross_links` 에 `{to_artifact:"findings", to_id:"F-XXX", link_type:"depends_on"}` 등재 (cross_links grep / dep-graph 탐색용). `related_apis` + `cross_links` 의 기존 dual idiom 과 동일.
7. **`validation_summary` + `trust_step` 기록** — drift-validator FE 실행 여부 / `scxml_export_validated`(XState SCXML import 시도 = 단계 5 진짜 도구 검증). 미실행 시 `false` + `meta.warnings` 에 정직 기록(미실행을 real 로 위장 ❌).
   - **참조 무결성 self-check 의무 — `state-map-integrity-validator` 실 실행 (no-simulation)** — 산출한 state-map.json 에 `node ${CLAUDE_PLUGIN_ROOT}/tools/state-map-integrity-validator/src/cli.js <state-map.json> --json` 을 돌려 **dangling reference(high) 0 까지 교정한 뒤 종료**한다. 참조 무결성은 analysis gate #0 조건부 validator 이기도 하나, 여기서 생성 시점에 앞당겨 자가검증해 **재생성마다 dangling(예: `target:"closing"` 인데 `closing` state 미정의)이 재발하는 것을 막는다**(산출물 수동 patch 는 재생성 시 덮이므로 스킬 self-check 가 durable). 결과를 `validation_summary.reference_integrity_validated`(bool) + `reference_integrity_dangling_count`(int / 종료 시 0 의무)로 기록. 러너 부재 시 `false` + `meta.warnings` 정직 기록(위장 ❌).
   - **XState SCXML import 러너 부재 시 `scxml_export_validated=false` 고정 + 단계 4 이하** — 추출 환경에 XState 패키지/SCXML 변환 러너가 프로비저닝되지 않았으면(예: `@xstate` 미설치) `machines` 의 SCXML 호환을 실제 import 로 입증할 수 없다. 이때 `scxml_export_validated` 는 `false` 로 고정하고 `meta.warnings` 에 러너 부재를 적으며, `scxml_compliant`/`xstate_compatible` 가 수기 판단인 만큼 `trust_step` 은 단계 5(진짜 도구 검증)에 도달하지 않은 것으로 보고 단계 4 이하로 둔다. 러너 없이 `scxml_export_validated=true` 로 단계 5 를 위장하지 말 것(`no_visual_capture`/`no_a11y_runner` 의 도구-부재 정직 신호와 대칭).
8. **state-map.json 작성** — `schemas/state-map.schema.json` (required = `meta` / `state_sources` / `machines`)

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/state-map.json`

## 인용

- 정책: `methodology-spec/deliverables/8-state-map.md`
- 정책: `methodology-spec/workflow/ui.md`
- schema: `schemas/state-map.schema.json`
- ADR: ADR-FE-006 (framework-neutral IR 4계층)
- DEC-2026-06-18-fe-dogfood-cycle6 (cycle6 — imperative dom_state widget + RHF value-bag 분류 + scxml 러너 부재 정직)

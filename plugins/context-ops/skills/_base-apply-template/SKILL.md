---
name: _base-apply-template
description: Apply an artifact template from templates/analysis/ or templates/{discovery,spec,plan,test,implement}/ to start a new deliverable. Use when user wants to start a new artifact (analysis 산출물 21종 + chain 산출물 6종 — discovery-spec / behavior-spec / acceptance-criteria / task-plan / test-spec / impl-spec). Fills template with project-specific context and writes to user's output directory.
allowed-tools: Read, Glob, Write, Bash
---

# apply-template

Generate an artifact from a template, filling it with project-specific context.

인식 artifact 종류 = analysis 21 + chain 6 type.

<!-- check21 SSOT: total 13 templates (.template.md·.template.mermaid twin 폐지 / C4 시행. 잔존 = .template.json 8 + .template.md 3 [decision-table·finding·formal-spec 작성가이드] + .template.yaml 2 [api·meta-confidence]. release-readiness check21 가 본 숫자 ↔ templates/*/*.template.* 전수 실측 대조 / 추가·삭제 시 갱신 의무 — silent_omission attractor 차단). -->

## How to invoke

User triggers this skill when starting a new deliverable. 매칭 대상:

### analysis (`templates/analysis/`)

- "inventory 시작해줘" → fills `templates/analysis/inventory.template.json`
- "openapi.yaml 작성" → fills `templates/analysis/openapi-extension.template.json`
- 그 외 analysis 산출물 (architecture / domain / business-rules / antipatterns / schema / ui-spec 등) = 해당 `schemas/<artifact>.schema.json` 기반 skill 본문 inline placeholder (.template.md·.template.mermaid twin 폐지). decision-table·finding·formal-spec = 작성 가이드 `.template.md` 유지.
- "ui-spec 시작" → schema-driven 합성 (`schemas/ui-spec.schema.json` 기반 / `.template.json` 없음 — 본 skill 이 producer). domain + state-map + visual-manifest 종합.
- **ui-spec.json producer 명문화 (v0.53.0)** — `ui-spec.json` 은 전용 추출 도구(extractor)가 없는 schema-driven **합성 산출물**(domain + state-map + visual-manifest 종합)이며, 본 `_base-apply-template` 가 명시적 producer 다 (전용 producer skill 부재 → drift-validator 가 orphan 으로 안 잡는 문서 갭이라 여기서 명문화).
  - **target_state 역참조 back-fill (v0.57.0 / cycle4 §8.1 ui-spec-04)** — `event_handlers[].target_state` 를 비워두지 말고 state-map.json 의 machine state(예: menuStore.openMenus, AuthGuard token state)를 cross-link 로 역참조해 채운다. state-map 선행 산출물이 있으면 그 state id 를 anchor 로 쓰고, 없으면 `_base-log-finding` 으로 갭을 남긴다 (FSM 은 있는데 anchor 없이 빈 채로 두지 말 것 — eam·common 두 도메인 공통 누락 패턴이었음).
  - **codegraph 교차 점검** — `<user-project>/.codegraph/` 가 있으면 `components[]` 를 pattern_matching 으로만 뽑지 말고 codegraph symbol edge 와 교차 점검해 누락/추가 컴포넌트 후보를 찾는다. 단 codegraph 는 reference-lens 일 뿐 결정적 gate 에 inject ❌ — 불일치는 finding 으로만 수용한다 (codegraph trust 모델 근거는 ## 인용 참조).
    - **React/TSX 쿼리 caveat** — codegraph 의 `kind='component'` 로 필터하면 JSX 반환 함수형 컴포넌트가 0건 나온다 (함정). React arrow-fn / `export default` 컴포넌트는 전부 `kind='function'` 으로 분류되고, `kind='component'` 는 RealGrid cell-renderer 같은 renderer-template 설정 객체에만 잘못 붙는 heuristic 산물이다. TSX 코드베이스는 `kind IN ('function') AND file_path LIKE '%.tsx'` 로 쿼리하라 (`kind='component'` 아님). 또한 nodes 테이블은 inline `file_path` 컬럼을 쓰므로(file_id FK 조인 불필요) `path` 컬럼명으로 쿼리하면 `no such column: path` 에러로 즉시 실패한다 — 컬럼명은 `file_path` 다.
  - **Module-Federation remote 경계 마킹** — 컴포넌트가 Module-Federation lazy-remote(별도 빌드/런타임에서 로드되는 remote 노출 모듈)면 `suspense_boundary.is_remote_boundary=true` + `suspense_boundary.remote_name`(예: `common/Visualizer`)로 기재한다. 평범한 `React.lazy`/dynamic import 코드분할은 MF remote 가 아니므로 `lazy_loaded=true` 로만 두고 `is_remote_boundary` 는 비운다 — 둘을 혼동하지 말 것. remote 경계는 자체 error boundary 와 짝지어 기록한다. MF 여부를 prose(description)에 적지 말고 본 boolean 필드로 표현한다 (근거는 ## 인용 참조).
  - **폼 검증 트리거 추론은 lib import 만으로 결론짓지 말 것** — `react-hook-form`(RHF) import 가 곧 schema 검증 존재를 뜻하지 않는다 (necessary-not-sufficient). RHF 가 실제 `zodResolver`/`yupResolver` 등 resolver 또는 `register`/`rules` 없이 `useForm({defaultValues})` + `getValues`/`setValue` 로만 쓰이면 검증은 보통 공유 store/util(예: validation store 의 `checkValues`/`checkDateRange`)이나 명령형 grid 체크로 위임돼 있다. 이때 `api_calls[].trigger='on_form_submit'` 가정도 깨진다 — submit 이 RHF `handleSubmit` 이 아니라 평범한 `onClick` 핸들러일 수 있으니, 실제 트리거를 코드에서 확인해 기재하라 (검증 규칙 추출은 form-validation 산출물 책임 — 여기서는 트리거/event_handler 만 사실대로).
  - **single-route CRUD 화면의 user_flows 는 최소로** — 한 화면이 1 라우트뿐이고 페이지 간 네비게이션이 사실상 없는 도메인(grid + master-detail + dialog 위주의 관리자 화면이 대표적)이면, `user_flows[].transitions` 의 `from`/`to` 는 `^PAGE-…` 패턴상 같은 페이지로 향하는 self-loop 로 degenerate 한다. 이 self-loop 는 결함이 아니라 정상이다 — 의미있는 상태 전이(search→edit→save, header-select→detail-refetch, dialog open/close)는 `state-map.json` 의 FSM 으로 표현하고, ui-spec `user_flows` 는 최소로 유지하라. `from`/`to` 의 `^PAGE-` 제약 자체는 유지된다(컴포넌트/이벤트 디테일은 `trigger`/`condition` 문자열에 기술).
  - **토큰 소비형 BC 의 `design_tokens.consistency_score` 측정 기준** — 외부 디자인시스템 패키지를 소비만 하는 BC(`token_ownership=external_package`)는 `foundation.*` 직접 참조가 본질적으로 거의 없다 — 컴포넌트(Box, grid wrapper, PageBottom 등)가 토큰을 내부 캡슐화하기 때문이다. 이때 `foundation.*` ref 가 적은 것은 토큰 규율 미달이 아니라 올바른 encapsulation 이다. 따라서 `consistency_score` 는 `foundation.*` ref 개수로 측정하지 말고, **하드코딩된 hex(`#rrggbb`)와 inline px 의 밀도**(낮을수록 높은 점수)로 측정하라. 채점 전 전수 sweep 으로 hardcoded hex/px 를 세고(소표본 sampling 으로 추정 금지 — 점수가 sampling 아티팩트가 된다), 위반이 많으면 안티패턴(AP-FE-XXX)으로 등록한다.

### chain stage (6 templates / `templates/{discovery,spec,plan,test,implement}/`)

- "discovery-spec 시작" → fills `templates/discovery/discovery-spec.template.json`
- "behavior-spec 작성" → fills `templates/spec/behavior-spec.template.json`
- "acceptance-criteria 작성" → fills `templates/spec/acceptance-criteria.template.json`
- "task-plan 작성" → fills `templates/plan/task-plan.template.json` (Epic/Story/OP cascade = task-plan.json + ticket-sync skill)
- "test-spec 작성" → fills `templates/test/test-spec.template.json`
- "impl-spec 작성" → fills `templates/implement/impl-spec.template.json`

## Steps

1. **Identify target artifact.** Match user request to a `.template.json` file (chain 6 + analysis inventory/openapi-extension) or — for schema-driven analysis 산출물 — the artifact's `schemas/<artifact>.schema.json` (.template.md·.template.mermaid twin 폐지).
   - analysis: `ls ${CLAUDE_PLUGIN_ROOT}/templates/analysis/*.template.json` (inventory + openapi-extension) — 그 외 산출물은 schema-driven inline placeholder. Count mismatch 시 finding emit (release-readiness check21).
   - chain: `ls ${CLAUDE_PLUGIN_ROOT}/templates/{discovery,spec,plan,test,implement}/*.template.json` (6종). Count mismatch 시 동일 finding.
2. **Read the template.** Use `Read` on the matched `.template.json` file (chain stage 산출물 = json 단독 SSOT / .template.md/.template.mermaid 폐지).
3. **Read prerequisite artifacts.** Per `methodology-spec/lifecycle-contract.md` and the artifact's stage ordering:
   - **analysis** stage (21 산출물):
     - inventory: no prerequisite
     - architecture: requires inventory
     - domain: requires architecture
     - rules (business-rules): requires domain
     - openapi: requires rules + domain
     - schema/erd: requires domain
     - antipatterns: requires `formal-spec` phase cross-validation
     - state-map / visual-manifest / form-validation / type-spec: FE-specific
   - **chain** stage (6 산출물):
     - discovery-spec: requires analysis 산출물 + (선택) 입력 어댑터 산출물 (swagger / figma / nl-md)
     - behavior-spec: requires discovery-spec + Phase 4.5 (state-machine / sequence / decision-table)
     - acceptance-criteria: requires behavior-spec (layer 분기 — be → openapi_path/operationId / fe → state_map_ref/dtcg_token_ref/visual_manifest_ref)
     - task-plan: requires behavior-spec + acceptance-criteria (layer 분기 — be → openapi_endpoint_ref / fe → component_ref / ADR alternatives ≥3 / NFR hard gate)
     - test-spec: requires acceptance-criteria + behavior-spec (framework 분기 — BE contract → openapi_contract_ref / FE visual → visual_regression_ref / RED 의무 / fail_count > 0)
     - impl-spec: requires test-spec + behavior-spec (GREEN 의무 / fail_count=0 enforce / commit_hash 보존)
4. **Fill placeholders** (`<placeholder>` / `<...>`) with project-specific data extracted from the codebase / analysis 산출물 / chain backward link.
5. **Write to user's output directory.** Default: `<user-project>/.ai-context/base/<artifact>.json` (json 단독 SSOT) or as user specifies.
6. **Log finding** if any placeholder cannot be filled with confidence — invoke `_base-log-finding` skill.

## Per-artifact prerequisites

See `methodology-spec/deliverables/<NN>-*.md` for each artifact's input requirements and validation rules:

- analysis 산출물: deliverables/01~16 (analysis stage 1~16)
- chain 산출물: deliverables/17-discovery-spec.md ~ 22-traceability-matrix.md

## When to refuse

- User asks to fill an artifact that has unmet prerequisites — direct them to the prerequisite artifact first.
- User asks for an artifact that is not in `templates/` — check if it's a design stage placeholder. If so, explain placeholder status.
- User asks for chain 산출물 안 cross-cut anchor 미정합 (예: BE TASK 안 openapi_endpoint_ref 부재) — direct them to schema validation (plan-coverage-validator 의 BE/FE 1:1 matching).

## 인용

- ADR: ADR-011 (json-only / twin 폐지)
- 결단: DEC-2026-05-26-v11-paradigm-결단 (chain stage 산출물 6종)
- 결단: DEC-2026-05-30-codegraph-essential (codegraph reference-lens trust 모델 — ui-spec-06 교차점검 근거)
- 결단: DEC-2026-06-17-fe-dogfood-cycle5 (cycle5 ui-spec-02 — suspense_boundary.is_remote_boundary / remote_name = MF remote 경계 vs 평범한 React.lazy 코드분할 구분)
- DEC-2026-06-18-fe-dogfood-cycle6 (cycle6 — ui-spec codegraph TSX kind 함정 / RHF necessary-not-sufficient / single-route self-loop / 토큰소비 BC consistency_score 측정 기준)
- 정책: methodology-spec/lifecycle-contract.md
- schema: schemas/<artifact>.schema.json

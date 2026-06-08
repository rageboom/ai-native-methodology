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
     - discovery-spec: requires analysis 7대 산출물 + (선택) 입력 어댑터 산출물 (swagger / figma / nl-md)
     - behavior-spec: requires discovery-spec + Phase 4.5 (state-machine / sequence / decision-table)
     - acceptance-criteria: requires behavior-spec (layer 분기 — be → openapi_path/operationId / fe → state_map_ref/dtcg_token_ref/visual_manifest_ref)
     - task-plan: requires behavior-spec + acceptance-criteria (layer 분기 — be → openapi_endpoint_ref / fe → component_ref / ADR alternatives ≥3 / NFR hard gate)
     - test-spec: requires acceptance-criteria + behavior-spec (framework 분기 — BE contract → openapi_contract_ref / FE visual → visual_regression_ref / RED 의무 / fail_count > 0)
     - impl-spec: requires test-spec + behavior-spec (GREEN 의무 / fail_count=0 enforce / commit_hash 보존)
4. **Fill placeholders** (`<placeholder>` / `<...>`) with project-specific data extracted from the codebase / analysis 산출물 / chain backward link.
5. **Write to user's output directory.** Default: `<user-project>/.ai-context/output/<artifact>.json` (json 단독 SSOT) or as user specifies.
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
- 정책: methodology-spec/lifecycle-contract.md
- schema: schemas/<artifact>.schema.json

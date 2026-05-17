---
name: _base-apply-template
description: Apply an artifact template from templates/analysis/ to start a new deliverable. Use when user wants to start a new artifact (inventory / architecture / domain / rules / openapi / schema / erd / antipatterns / migration-cautions / state-map / visual-manifest / a11y / i18n / static-security / legacy / form-validation-spec / type-spec). Fills template with project-specific context and writes to user's output directory.
allowed-tools: Read, Glob, Write, Bash
---

# apply-template

Generate an artifact from a template, filling it with project-specific context.

## How to invoke

User triggers this skill when starting a new deliverable:
- "inventory.md 시작해줘" → fills `templates/analysis/inventory.template.md`
- "business-rules.json 새로 작성" → fills `templates/analysis/rules.template.md`
- "openapi.yaml 작성" → fills `templates/analysis/openapi-extension.template.json`

## Steps

1. **Identify target artifact.** Match user request to one of the 19 templates in `templates/analysis/` (this directory exists post-G4 reorganization).
2. **Read the template.** Use `Read` on `templates/analysis/<artifact>.template.<ext>`.
3. **Read prerequisite artifacts.** Per `methodology-spec/lifecycle-contract.md` and the artifact's phase ordering:
   - inventory: no prerequisite
   - architecture: requires inventory
   - domain: requires architecture
   - rules: requires domain
   - openapi: requires rules + domain
   - schema/erd: requires domain
   - antipatterns: requires `formal-spec` phase cross-validation
   - state-map / visual-manifest / form-validation / type-spec: FE-specific, may require frontend code
4. **Fill placeholders** (`{{...}}` or `<placeholder>`) with project-specific data extracted from the codebase.
5. **Write to user's output directory.** Default: `<user-project>/.aimd/output/<artifact>.<ext>` or as user specifies.
6. **Log finding** if any placeholder cannot be filled with confidence — invoke `log-finding` skill.

## Per-artifact prerequisites

See `methodology-spec/deliverables/<NN>-*.md` for each artifact's input requirements and validation rules.

## When to refuse

- User asks to fill an artifact that has unmet prerequisites — direct them to the prerequisite artifact first
- User asks for an artifact that is not in `templates/analysis/` — check if it's a v2.0 lifecycle stage (planning/design/test/implement). If so, explain placeholder status.

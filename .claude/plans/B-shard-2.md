# B-shard-2.md — audit of 12 skills (L3 quality)

SSOT: `ai-native-methodology/methodology-spec/plugin-authoring-spec.md` §2 (S1~S8).
Axis: B-1 (desc↔body), B-2 (trigger keyword quality), B-3 (single-resp / S4), B-4 (imperative / S5), B-5 (progressive disclosure / S1+S8), B-6 (cross-family consistency), B-7 (citation semantic accuracy).
Audit date: 2026-05-18.

---

## Skill: analysis-aspect-a11y

- B-1 PASS — body delivers exactly what description claims (axe-core/Playwright real run, WCAG 2.2, a11y.json output). file:9-29.
- B-2 PASS — "frontend code present" + "axe-core / Playwright" + "WCAG 2.2" + "no simulation" = strong auto-invoke triggers; missing tech keywords (no "react"/"vue") but axe-core is canonical.
- B-3 PASS — single-resp = a11y check + a11y.json. No bleed into other aspects.
- B-4 PASS — imperative ("Run", "axe-core 진짜 실행", "분류", "등재", "작성"). Narration minimal.
- B-5 PASS — only 39 lines, fully self-contained well under 5000 tokens. Procedure→output→spec refs is canonical pattern.
- B-6 PASS — matches aspect-* family template (사전 조건 / 절차 / 산출물 / 본체 명세).
- B-7 PASS — cites `methodology-spec/deliverables/10-a11y-spec.md` (exists) + `schemas/a11y-spec.schema.json` (exists). Citation paths verified file:36-38.
- Findings: none.

## Skill: analysis-aspect-i18n

- B-1 PASS — body delivers i18n lib detection + locale catalog + ICU + i18n.json. file:9-27.
- B-2 PASS — explicit lib list (i18next/react-intl/vue-i18n/FormatJS/lingui/ICU) = strong trigger.
- B-3 PASS — single-resp = i18n analysis only. No state-map/visual bleed.
- B-4 PASS — imperative ("식별", "추출", "분석", "검출", "등재", "작성").
- B-5 PASS — 37 lines, fully self-contained.
- B-6 PASS — matches aspect-* family template (사전 조건 / 절차 / 산출물 / 본체 명세).
- B-7 PASS — cites `methodology-spec/deliverables/11-i18n-spec.md` + `schemas/i18n-spec.schema.json` (both exist) + ADR-FE-005 (verified via prior body audit).
- Findings: none.

## Skill: analysis-aspect-legacy

- B-1 PASS — body delivers Strangler triggers + migration progress + risks + legacy.json. file:7-39.
- B-2 PASS — "migration scenario detected (Strangler Pattern triggers — old + new codepath coexistence, deprecated API usage, version-pin technical debt, scheduled deprecation)" = highly specific trigger spec.
- B-3 PASS — single-resp = legacy/migration debt only.
- B-4 PASS — imperative ("식별", "추정", "등재", "작성"). Narration minimal.
- B-5 PASS — 50 lines, self-contained. JSON shape inline aids context-fork autonomy.
- B-6 PASS — matches aspect-* family template.
- B-7 PASS — cites `methodology-spec/deliverables/13-legacy-spectrum.md` + `schemas/legacy-spectrum.schema.json` + ADR-FE-003 (paths verified above).
- Findings: none.

## Skill: analysis-aspect-static-security

- B-1 PASS — body delivers tool mapping + static-runner + 5 evidence + baseline+ratchet + AP-SECURITY etc., matches description's "Semgrep/SpotBugs/PMD/Bandit/ESLint/Snyk/OSV-Scanner". file:24-58.
- B-2 PASS — exhaustive tool list + "Real tool execution MANDATORY — CLAUDE.md ★★★ no-simulation" + "ADR-009 단계 5 도달 의무" = unambiguous auto-invoke.
- B-3 PASS — single-resp = static security scan only. Touches AP-FE-SECURITY-001 cross-link but as cite, not bleed.
- B-4 PASS — imperative throughout; sections are numbered procedure steps.
- B-5 PASS — 81 lines, fully self-contained including 5-evidence list and ratchet bash. Within first-5K-token budget.
- B-6 PASS — aspect-* family template + an extra `## CI 통합` block, which is a natural family-template extension for the no-sim-strict skill.
- B-7 PASS — cites `methodology-spec/deliverables/12-static-security-spec.md`, `schemas/static-security-spec.schema.json`, `tools/static-runner/` (all exist; `--extra-rules` flag verified in src/cli.js), ADR-009, ADR-010, ADR-FE-007 (all canonical).
- Findings: none.

## Skill: analysis-from-figma

- B-1 PASS — body delivers exact Figma MCP workflow described (selection precondition, get_metadata→get_design_context→get_screenshot→get_variable_defs). file:12-32.
- B-2 PASS — "Figma reference", "Requires Figma desktop app with target frame selected", "MCP figma-desktop tools" + Track=FE + auto-dispatch hint = strong trigger.
- B-3 PASS — explicit single-resp call-out file:11 ("코드/spec/문서 흡수는 각각 다른 skill"). No bleed.
- B-4 PASS — imperative ("selection 확인", "흡수", "node map 활용 재호출", "캡처", "정리"). Some metadata sentences but ratio acceptable.
- B-5 PASS — 56 lines, self-contained including scope-out + When-NOT-to-invoke + Figma Dev Docs link.
- B-6 PASS — matches from-* family template (사전 조건 / 절차 / 산출물 / scope-out / 본체 명세 참조 / When NOT to invoke). When-NOT block present here is family-canonical.
- B-7 PASS — cites `methodology-spec/workflow/input.md` (exists) + `plugin-charter.md` R8+R14 + Figma Dev Docs URL.
- Findings: none.

## Skill: analysis-from-plan-doc

- B-1 PASS — body delivers MD/PDF/Notion-zip dispatch + Notion hash strip + UC candidate extraction. file:14-32.
- B-2 PASS — "Markdown / PDF / Notion export zip or directory" + "extracts business intent, use case candidates, glossary" = strong, format-explicit trigger.
- B-3 PASS — single-resp = plan-doc absorption; explicit "코드/spec/자연어 prompt 흡수는 각각 다른 skill" file:11.
- B-4 PASS — imperative ("감지", "정규화", "파싱", "추출", "작성").
- B-5 PASS — 48 lines, self-contained.
- B-6 PASS — from-* family template canonical.
- B-7 PASS — cites `workflow/input.md` §5종 입력 (d) + plugin-charter R8 (consistent with from-* siblings).
- Findings: none.

## Skill: analysis-from-prompt

- B-1 PASS — body delivers intent/scope/constraints/assumptions/uc_candidates extraction matching description. file:20-26.
- B-2 PASS — "natural-language prompt as analysis input (typically the residual text after analysis-input-orchestrate parses out URLs/paths)" = explicit composition trigger.
- B-3 PASS — single-resp = NL intent only; explicit "메타데이터 (URL/path) 추출은 orchestrate 책임" file:11.
- B-4 PASS — imperative ("추출", "추정", "명시", "작성"). "no-simulation 정합" callout = guardrail not narration.
- B-5 PASS — 42 lines.
- B-6 PASS — from-* family template canonical.
- B-7 PASS — `schemas/prompt-extract.schema.json` exists; `workflow/input.md` exists.
- Findings: none.

## Skill: analysis-from-swagger

- B-1 PASS — body delivers parser invocation + endpoint/schema/domain/rules-seed extraction. file:20-27.
- B-2 PASS — "openapi.yaml / swagger.json (path or URL)" + "@readme/openapi-parser" + auto-dispatch hint = strong trigger.
- B-3 PASS — explicit "spec 생성 (코드 → openapi.yaml) 은 `analysis-openapi` skill" file:11; spectral validation explicitly out-of-scope file:28. Crisp boundary.
- B-4 PASS — imperative throughout.
- B-5 PASS — 46 lines.
- B-6 PASS — from-* family template canonical (When-NOT block + scope handoff to siblings).
- B-7 PASS — `schemas/swagger-extract.schema.json` exists; `schemas/openapi-extension.schema.json` exists; cross-ref to `analysis-openapi` accurate.
- Findings: none.

## Skill: analysis-input-collection

- B-1 PASS — body matches "Entry point for SDLC analysis stage / language signals / ADR-010 baseline+ratchet". file:11-41.
- B-2 PASS — "starting analysis of a legacy codebase" + "Entry point" + "establishes input scope" + explicit redirect to `analysis-input-orchestrate` for multi-source = clean trigger.
- B-3 PASS — single-resp = legacy-code-only input. Multi-source delegated.
- B-4 PASS — imperative ("확인", "수집", "분기", "명시", "기록", "안내").
- B-5 PASS — 56 lines, self-contained JSON template.
- B-6 PARTIAL — input-* family has only 2 members; orchestrate's body uses "★ 단일 책임" callout structure + cross-tier severity table, collection uses simpler step list. Asymmetry is mostly fit-for-purpose (collection scope simpler), but inconsistent header conventions (collection has no When-NOT/scope-out block, orchestrate has When-NOT). MINOR.
- B-7 FAIL — file:14 and file:55 cite `apply-baseline-ratchet` skill but actual skill name is `_base-apply-baseline-ratchet` (v8.2.1 documented exception / §8-2 frozen allowlist). Naming drift — user manually invoking via `/plugin:skill apply-baseline-ratchet` would fail. Semantically the right skill, but citation is stale.
- Findings:
  - F-SKILL-CAND-001 (medium) — analysis-input-collection cites `apply-baseline-ratchet` 2× but real skill = `_base-apply-baseline-ratchet`. Fix: prefix `_base-` (replace_all).

## Skill: analysis-input-orchestrate

- B-1 PASS — body delivers 4-step orchestration (parse → dispatch → merge → reconfirm) matching description's "auto-dispatches BCDE sub-skills". file:7-69.
- B-2 PASS — "multi-source analysis input via natural language (with optional swagger URL / figma reference / plan-doc path)" + "merges into input-summary.json with cross-references and conflicts" = explicit & differentiated from `analysis-input-collection`.
- B-3 PASS — single-resp = orchestration only; meta-signal collection delegated to `analysis-input-collection` file:11.
- B-4 PASS — imperative ("파싱", "dispatch", "산출", "통합", "재확인"). Table-heavy = OK for procedural axes.
- B-5 PASS — 87 lines; 3-tier severity table + similarity formula inline = first-5K-token self-contained.
- B-6 PASS — has both When-NOT block and explicit cross-handoff; the canonical orchestrator pattern.
- B-7 PASS — cites `workflow/input.md`, `plugin-charter.md` R8 + G2, `DEC-2026-05-15-g2-orchestrate-skill-분리-채택.md` (verified). `schemas/input-summary.schema.json` exists.
- Findings: none.

## Skill: analysis-openapi

- B-1 PASS — body delivers framework-pattern endpoint extraction + spec generation + spectral-runner cross-validation. file:18-31.
- B-2 PASS — exhaustive framework list (Spring/NestJS/Express/FastAPI/Flask/Rails/Phoenix) + "Auto-validated by spectral-runner" = strong trigger.
- B-3 PASS — single-resp = OpenAPI generation. Spec absorption delegated to `analysis-from-swagger`.
- B-4 PASS — imperative throughout numbered procedure.
- B-5 PASS — 42 lines, self-contained.
- B-6 N/A — single-member family. Internal consistency with broader analysis-* convention OK.
- B-7 PASS — "ADR-007 부재" correctly noted (verified — no ADR-007 in docs/adr/, only ADR-CHAIN-007 + ADR-FE-007). `tools/spectral-runner/` exists. `schemas/openapi-extension.schema.json` exists.
- Findings: none.

## Skill: analysis-html-template

- B-1 PASS — body delivers template-engine scope + external static analyzer + scriptlet/XSS markers. file:13-39.
- B-2 PASS — "JSP / Thymeleaf / EJS / ERB / Razor" + Scenario C marker + "LLM 양심 정량 ❌ (no-simulation 의무)" = unambiguous Scenario-C-only trigger.
- B-3 PASS — single-resp = server-rendered template absorption; state-map / visual / interaction explicitly scope-out file:51-54.
- B-4 PASS — imperative throughout. Policy block uses declarative voice but axis-appropriate (policy ≠ procedure).
- B-5 PASS — 69 lines, self-contained including bash commands + tool list + scope-out + When-NOT.
- B-6 PASS — analysis-* general convention (사전 조건 / 절차 / 산출물 / 정책 / scope-out / 본체 명세 참조 / When NOT to invoke).
- B-7 PASS — cites `methodology-spec/be-fe-separation.md` §5.1 (file exists), `migration-cautions-fe.md` (exists), `flows/analysis.phase-flow.json` `template-analyze` phase (id verified in flow). `schemas/html-template-extract.schema.json` exists.
- Findings: none.

---

## Summary

### Cell totals (12 × 7 = 84)

- PASS: 82
- PARTIAL: 1 (analysis-input-collection B-6)
- FAIL: 1 (analysis-input-collection B-7 — `_base-` prefix drift)

PASS rate: 82/84 = 97.6%.

### Top finding candidates

1. **F-SKILL-CAND-001 (medium)** — `analysis-input-collection/SKILL.md:14` and `:55` cite `apply-baseline-ratchet` but real skill = `_base-apply-baseline-ratchet`. Stale citation predates §8-2 documented exception. Fix: replace_all `apply-baseline-ratchet` → `_base-apply-baseline-ratchet` within this file. Detection note: this is the exact class `skill-citation-validator` v8.1.x targets (bare artifact-name L2 drift) — likely the validator's resolver normalizes `_base-` and absorbs the mismatch, masking the issue from L2.
2. (no other findings of severity ≥ medium across 12 skills).

### Cross-skill patterns

- **analysis-aspect-* (4 skills)**: rigorously share template "사전 조건 / 절차 / 산출물 / 본체 명세" — high consistency, all 4 cite `methodology-spec/deliverables/<n>-<asset>.md` + `schemas/<asset>-spec.schema.json` pair. static-security extends template with `## CI 통합` block (justified by no-sim-strict scope).
- **analysis-from-* (4 skills)**: rigorously share template "사전 조건 / 절차 / 산출물 / 본체 명세 참조 / When NOT to invoke" + leading `> **단일 책임**: ...` callout. Highest cross-family discipline among audited families.
- **analysis-input-* (2 skills)**: orchestrate has When-NOT + 3-tier severity table; collection lacks both. ASYMMETRY (B-6 partial). Recommend adding "When NOT to invoke" block to `analysis-input-collection` for symmetry with orchestrate + from-* family idiom.
- **All 12 skills**: `allowed-tools` frontmatter uses only S6 official keys; no `system_prompt` / `preloaded_skills` over-claim — A2 ✗ clean.
- **All 12 skills S2 description**: every description starts with "Use when ..." pattern (auto-invoke trigger idiom from public Anthropic skill examples) — uniformly compliant.
- **All 12 skills S5 imperative**: Korean imperative endings ("-한다" / "-등재" / "-작성") dominate; only sporadic narrative ("...정합") which is guard-rail callout not narration.
- **citation precision**: 11/12 perfect; only `analysis-input-collection` had the `_base-` prefix drift. The 47-skill repo-wide skill-citation-validator v8.1.1 scan reported 0 stale per release-readiness — F-SKILL-CAND-001 either escapes its resolver or was not in active surface; recommend cross-checking validator's `_base-` normalization rule.

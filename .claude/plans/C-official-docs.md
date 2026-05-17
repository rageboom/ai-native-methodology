# C-official-docs.md — F-015 cross-validation of Anthropic Claude Code skill docs

> ★ Sub-agent (`_base-official-docs-checker`) 가 Write 권한 부재로 메시지 반환 → main agent 가 파일화 (2026-05-18).
> Generated: 2026-05-18 by _base-official-docs-checker sub-agent (F-015 pattern).
> Pin baseline: plugin-authoring-spec.md §6 skills row / digest_sha b8b2376312b0 / last_verified 2026-05-17.

## Fetch summary

| # | URL | HTTP status | Timestamp |
|---|---|---|---|
| 1 | https://code.claude.com/docs/en/skills | 200 (full content) | 2026-05-18 |
| 2 | https://code.claude.com/docs/llms.txt | 200 | 2026-05-18 |
| 3 | https://code.claude.com/docs/en/whats-new/index.md | 200 | 2026-05-18 |
| 4 | https://code.claude.com/docs/en/whats-new/2026-w19 | 200 | 2026-05-18 |
| 5 | https://code.claude.com/docs/en/changelog (post-May 8) | 200 (summarized) | 2026-05-18 |
| 6 | https://code.claude.com/docs/en/agent-sdk/skills.md | 200 | 2026-05-18 |
| 7 | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices | 200 (full content) | 2026-05-18 |

---

## C-1 Digest diff (vs pin b8b2376312b0 / 2026-05-17)

### skills row — VERIFIED-WITH-DELTA

All claims in the pinned digest remain true as of 2026-05-18. The main page (code.claude.com/docs/en/skills) is consistent on every pinned claim:

- Frontmatter 15 official fields confirmed present in table: name / description / when_to_use / argument-hint / arguments / disable-model-invocation / user-invocable / allowed-tools / model / effort / context / agent / hooks / paths / shell.
- SKILL.md ≤ 500 lines, description+when_to_use truncated at 1,536 chars: CONFIRMED.
- Compaction: "keeping the first 5,000 tokens of each" / "combined budget of 25,000 tokens": CONFIRMED.
- Charset rule for name: "Lowercase letters, numbers, and hyphens only (max 64 characters)": CONFIRMED.
- Violation enforcement still undocumented (no "load reject on charset violation" text): CONFIRMED (enforcement-strength note in §8-2 still accurate).

**DELTA items** (additive — no existing claim contradicted):

- **DELTA-1 (v2.1.141 / 2026-05-13)**: `${CLAUDE_EFFORT}` is now confirmed available in skill content via changelog. The substitution variable table already appears on the live skills page. The pinned digest captures the `effort:` frontmatter field but does NOT capture `${CLAUDE_EFFORT}` as an available string substitution.
- **DELTA-2 (v2.1.142 / 2026-05-14)**: "Plugins with a root-level SKILL.md file and no skills/ subdirectory are now surfaced as a skill." Changes plugin packaging behavior (P1 rule area). Pinned digest does not mention this.
- **DELTA-3 (platform.claude.com best-practices)**: description field has a per-field cap of 1,024 characters ("description: Maximum 1024 characters"). Pinned digest/S2 rule only pins the combined 1,536-char truncation cap. NOT contradictory — additive constraint.
- **DELTA-4 (platform.claude.com best-practices)**: Third-person requirement for description — "Always write in third person. The description is injected into the system prompt, and inconsistent point-of-view can cause discovery problems." Good: "Processes Excel files". Avoid: "I can help you process Excel files" / "You can use this to...".
- **DELTA-5 (platform.claude.com best-practices)**: Anti-pattern against deeply nested references — "Keep references one level deep from SKILL.md."

**Digest update required**: YES (DELTA-1 through DELTA-5 are additive — no contradictions). Version impact: PATCH (additive only). last_verified: today.

---

## C-2 Recommended-but-unused patterns

| pattern | official-recommended? | plugin usage | gap severity | notes |
|---|---|---|---|---|
| `model:` per-skill tuning | Yes — frontmatter table: "Model to use when this skill is active." | NOT USED (0/47 skills) | LOW — optional field; relevant for skills that benefit from different model tier (e.g. Opus for deep analysis, Haiku for speed). | Plugin has 47 skills all using default session model. |
| `disable-model-invocation: true` | Yes — for side-effect workflows | NOT USED (0/47 skills) | MEDIUM — S7 rule says "권장". Gate skills (`_base-invoke-go-stop-gate`, `test-run-test-evidence`) would benefit. Without it, Claude may auto-invoke prematurely. | Official example: deploy skill. |
| `when_to_use:` separate field | Yes — "Additional context for when Claude should invoke the skill" | NOT USED (0/47 skills) | LOW — descriptions already include trigger phrases inline. Separating would make descriptions more concise and allow description alone to fit within 1,024-char per-field cap (DELTA-3). | 25/47 skills embed "Use when..." in description. |
| `paths:` glob filter | Yes — "Glob patterns that limit when this skill is activated" | NOT USED (0/47 skills) | LOW-MEDIUM — FE-specific skills (`analysis-ui-state-map-fe`, `analysis-form-validation-fe`, `implement-react`, `implement-vue`, `test-playwright`) could use `paths: ["**/*.tsx", "**/*.vue"]` to avoid BE-only project triggers. | |
| `argument-hint:` / `arguments:` | Yes — for positional argument substitution | NOT USED (0/47 skills) | LOW — most plugin skills are full workflow invocations. `_base-log-finding` could accept finding-id + severity as arguments. | |
| `scripts/` within skill dir | Yes — official directory structure | NOT USED (0 skills) | LOW — plugin uses `tools/` Node CLIs. Bundling scripts in skill is more self-contained for plugin distribution. | `${CLAUDE_SKILL_DIR}` available. |
| `${CLAUDE_SKILL_DIR}` substitution | Yes — documented | NOT USED (0/47) | LOW-MEDIUM — necessary if scripts/ pattern adopted. Currently irrelevant. | |
| `${CLAUDE_EFFORT}` in skill content | Yes — documented; confirmed v2.1.141 changelog | NOT USED (0/47) | LOW — no skill currently adapts to effort level. `analysis-br-cross-consistency-check` (Layer 2 LLM) could skip deep analysis at effort=low. | NEW since last_verified (DELTA-1). |
| `context: fork` + `agent:` | Yes — "Add context: fork when you want a skill to run in isolation" | NOT USED (0/47) | LOW-MEDIUM — research/exploration skills could run in forked Explore agent. Plugin uses multi-agent via `agents/` directory; both are valid. | |
| `hooks:` per-skill scoped | Yes — "Hooks scoped to this skill's lifecycle" | NOT USED (0/47) | LOW — plugin-level hooks cover global lifecycle. | |
| `user-invocable: false` | Yes — "Set to false to hide from / menu" | NOT USED (0/47) | LOW — `_base-*` skills could be hidden from / menu since invoked by other skills, not users. Pairs with documented-exception grandfather. | |
| `references/` subdirectory pattern | Yes — best-practices "Domain-specific organization" | NOT USED — plugin uses out-of-tree | LOW — out-of-tree is valid per S1. In-tree alternative for portability. | |

---

## C-3 New since 2026-05-17

- **C3-1: v2.1.141 (2026-05-13)** — "Skills can reference effort level: Skills can now reference the current effort level with `${CLAUDE_EFFORT}` in their content." Additive. (predates last_verified but not in pinned digest)
- **C3-2: v2.1.142 (2026-05-14)** — "Plugins with root-level SKILL.md: Plugins with a root-level SKILL.md file and no skills/ subdirectory are now surfaced as a skill." RELAXES P1 rule; plugin still complies with skills/ approach.
- **C3-3: v2.1.139 (2026-05-11)** — `/context all` per-skill token estimates. No authoring rule change.
- **C3-4: v2.1.121 (2026-04-28)** — Type-to-filter search in `/skills`. UX only.

No changes contradict existing plugin-authoring-spec rules S1-S8 or §7 matrix.

---

## C-4 Anti-patterns warned by official docs

- **AP-1**: "Avoid deeply nested references — Keep references one level deep from SKILL.md." (best-practices)
  - Plugin: COMPLIANT. All skill→external file references are one level deep.
- **AP-2**: "Don't include information that will become outdated" / avoid time-sensitive info
  - Plugin: RISK — several skill descriptions embed version numbers ("v2.5.0 Phase C", "React 19", "Vue 3 only"). Low severity since methodology versioning is intentional.
- **AP-3**: "Always write in third person... inconsistent point-of-view can cause discovery problems."
  - Plugin: PARTIAL RISK — 25/47 skills begin description with "Use when..." (imperative). Official `summarize-changes` example mixes third-person summary with "Use when the user asks..." trigger, so the pattern is acceptable. Pure imperative without third-person intro = higher risk. The 8 `_base-*` and chain skills starting "★ ★ ★ v2.0 chain N..." are neither — internal notation.
- **AP-4**: "Avoid offering too many options"
  - Plugin: N/A — procedural skills.
- **AP-5**: "Avoid Windows-style paths"
  - Plugin: COMPLIANT.
- **AP-6**: `context: fork` "only makes sense for skills with explicit instructions"
  - Plugin: N/A — no skill uses `context: fork`.
- **AP-7 (SDK-specific)**: "`allowed-tools` is only supported when using Claude Code CLI directly. It does not apply when using Skills through the SDK."
  - Plugin: 47/47 skills use `allowed-tools`. SDK consumption = silently ignored. CLI-first plugin usage = no problem.

---

## Findings (skill-audit-relevant)

- **F-SKILL-CAND-OFC-001** (severity: LOW / type: ADDITIVE-FEATURE-GAP) — Side-effect and gate skills do not use `disable-model-invocation: true`. Affected: `_base-invoke-go-stop-gate`, `test-run-test-evidence`, `implement-verify-test-pass`, `test-verify-coverage`. Official guidance recommends this for workflows manually triggered.
- **F-SKILL-CAND-OFC-002** (severity: LOW / type: DESCRIPTION-FIELD-CAP) — S2 rule omits per-field description cap of 1,024 chars (best-practices). No current violation (all descriptions 213-419 chars). Recommendation: add "description 단독 ≤ 1,024 char" to S2.
- **F-SKILL-CAND-OFC-003** (severity: LOW / type: MISSING-SUBSTITUTION-VARIABLE) — `${CLAUDE_EFFORT}` not in pinned digest. Recommendation: add to §6 skills `pinned_guidance_digest` and recompute `digest_sha`. Additive.
- **F-SKILL-CAND-OFC-004** (severity: LOW / type: PACKAGING-RULE-RELAXATION) — v2.1.142 root-level SKILL.md pattern not in pinned digest. P1 rule update: root-level alternative is valid (not a switch requirement).
- **F-SKILL-CAND-OFC-005** (severity: LOW / type: DESCRIPTION-PERSON-OF-VIEW) — Best-practices requires third-person descriptions. Borderline: `analysis-aspect-a11y` ("Use when frontend code present."), `analysis-aspect-legacy` ("Use when migration scenario detected...") — imperative without third-person intro. Nominal severity.
- **F-SKILL-CAND-OFC-006** (severity: LOW / type: SDK-ALLOWED-TOOLS-CAVEAT) — `allowed-tools` silently ignored under SDK. §6 doesn't mention. Current plugin usage = CLI-first; low priority.

---

## Verification blocks

[VERIFIED-WITH-DELTA]
Main agent claim (§6 pinned digest): description+when_to_use combined truncated at 1,536 characters.
Primary source: code.claude.com/docs/en/skills — "the combined `description` and `when_to_use` text is truncated at 1,536 characters in the skill listing to reduce context usage."
Version checked: live 2026-05-18.
Verdict: Core 1,536-char claim confirmed; DELTA — best-practices page (platform.claude.com) additionally states description alone has a 1,024-char maximum, not in the pinned digest.

[VERIFIED-IDENTICAL]
Main agent claim (§6): 15 official frontmatter fields.
Primary source: code.claude.com/docs/en/skills frontmatter table — all 15 confirmed.
Verdict: VERIFIED. No fields added or removed.

[CONTRADICTS — ADDITIVE]
Main agent claim (§6): `${CLAUDE_SKILL_DIR}` and `${CLAUDE_SESSION_ID}` documented; no mention of `${CLAUDE_EFFORT}`.
Primary source: live substitution table includes `${CLAUDE_EFFORT}`. Changelog v2.1.141 (2026-05-13).
Verdict: Additive — digest incomplete. Requires update + `digest_sha` recompute.

[VERIFIED]
Main agent claim (§8-2): charset enforcement undocumented for skill name violations.
Primary source: code.claude.com/docs/en/skills — "Lowercase letters, numbers, and hyphens only (max 64 characters)." No load-reject text. Best-practices repeats identically.
Verdict: `_base-*` documented-exception reasoning remains valid.

---

Sources verified via raw fetch (no training-corpus recall used):
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/whats-new/index.md
- https://code.claude.com/docs/en/whats-new/2026-w19
- https://code.claude.com/docs/en/changelog (post-May 8)
- https://code.claude.com/docs/en/agent-sdk/skills.md
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---
name: _base-log-finding
description: Log a finding (issue, anti-pattern, gap, risk, hypothesis, validation result) per finding-system. Use when discovering anything during analysis that should be remembered — confidence-affecting observations, missing data, simulation requests, anti-patterns spotted, migration risks. Applies id-conventions (F-XXX) and writes to per-PoC findings.md or methodology body finding-system.md.
allowed-tools: Read, Glob, Edit, Write
---

# log-finding

Persist a finding so it isn't lost in conversation context.

## When to invoke

Trigger this skill anytime you (or the user) notice:

- A claim with low confidence requiring later verification
- An anti-pattern in legacy code (per `id-conventions.md` §3 카테고리 9종: AP-API / AP-DB / AP-DOMAIN / AP-ARCH / AP-FE / AP-VALIDATION / AP-CONFIG / AP-SECURITY / AP-PERFORMANCE)
- A gap (missing source data, undocumented behavior, environment constraint)
- A migration risk (e.g., breaking change in dependency, deprecated pattern)
- A simulation occurrence — flag immediately per CLAUDE.md no-simulation policy
- A hypothesis to verify with real tools later

## ID conventions (per `methodology-spec/id-conventions.md`)

- **F-XXX** — finding (numbered, persistent)
- **AP-<DOMAIN>-XXX** — anti-pattern (e.g., AP-API-001)
- Confidence band: `low` (<70%), `medium` (70~85%), `high` (85~95%), `verified` (≥95% with tool evidence)

## Threshold (per `feedback_finding_threshold.md`)

- 5~15 findings = healthy analysis
- 20+ findings = spec quality may be insufficient — surface to user, consider Phase reset

## Output location

- **Within a PoC:** `examples/poc-<NN>-<name>/findings.md` (analysis target's finding ledger)
- **Methodology body finding:** `methodology-spec/finding-system.md` (only for findings about the methodology itself, not the analysis subject)

## Format

```markdown
## F-NNN: <one-line title>

- **Phase:** <phase-N or cross-validation>
- **Confidence:** <low | medium | high | verified>
- **Type:** <gap | anti-pattern | migration-risk | hypothesis | validation-result | simulation-flag>
- **Description:**
  <2~5 sentences>
- **Evidence:**
  - <file:line refs / tool output / external source>
- **Action:**
  - <what resolves this — verify with tool X / fetch from source Y / cross-check via sub-agent>
- **Status:** open | resolved | wontfix
```

## What NOT to log

- Trivial observations already captured by tool output (drift-validator / decision-table-validator)
- Conversation context (use TaskCreate or scratchpad)
- Methodology decisions (those go to `decisions/DEC-*.md`)

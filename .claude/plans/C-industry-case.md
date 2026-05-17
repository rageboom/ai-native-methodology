# C-industry-case.md — industry case research

> ★ Sub-agent (`_base-industry-case-researcher`) 가 Write 권한 부재로 메시지 반환 → main agent 가 파일화 (2026-05-18).

## Sources

| # | repo / source | URL | stars (verified) | retrieved |
|---|---|---|---|---|
| 1 | anthropics/skills (official) | https://github.com/anthropics/skills | 136,220 (GitHub API 2026-05-18) | 2026-05-18 |
| 2 | anthropics/skills — webapp-testing + skill-creator | https://github.com/anthropics/skills/tree/main/skills | same repo | 2026-05-18 |
| 3 | netresearch/claude-code-marketplace | https://github.com/netresearch/claude-code-marketplace | unverified | 2026-05-18 |

---

## Per-source observation

### Source 1: anthropics/skills — `claude-api`

Frontmatter pattern: `name` + `description` (multiline block scalar) + `license`. No `allowed-tools`, no `model`.
Description length: ~480 chars with explicit two-part structure.

Verbatim frontmatter (raw, confirmed via WebFetch):
```yaml
name: claude-api
description: |
  Build, debug, and optimize Claude API / Anthropic SDK apps. Apps built with this skill
  should include prompt caching. Also handles migrating existing Claude API code between
  Claude model versions (4.5 → 4.6, 4.6 → 4.7, retired-model replacements).

  TRIGGER when:
  - code imports `anthropic`/`@anthropic-ai/sdk`
  - user asks for the Claude API, Anthropic SDK, or Managed Agents
  - user adds/modifies/tunes a Claude feature (caching, thinking, compaction, tool use,
    batch, files, citations, memory) or model (Opus/Sonnet/Haiku)
  - questions about prompt caching / cache hit rate in an Anthropic SDK project

  SKIP: file imports `openai`/other-provider SDK, filename like `*-openai.py`/`*-generic.py`,
  provider-neutral code, general programming/ML

license: Complete terms in LICENSE.txt
```

Body structure: 14 titled sections (Before You Start / Output Requirement / Defaults / Current Models price table / Language Detection / Surface Selection Decision Tree / Thinking & Effort / Compaction / Prompt Caching / Managed Agents / Architecture / Language Support / Reading Guide / Common Pitfalls). Est. 300+ lines.
Citation pattern: References `shared/<file>.md` and `{lang}/claude-api/<file>.md` (bundled in-skill). No ADR/DEC/methodology citations. No cross-skill navigation.

---

### Source 2: anthropics/skills — `webapp-testing` and `skill-creator`

**webapp-testing verbatim**:
```yaml
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
license: Complete terms in LICENSE.txt
```
- Description: 203 chars. Single capability-summary sentence. No TRIGGER/SKIP split.
- Body: ASCII decision tree → bundled script examples (Python) → Reconnaissance-Then-Action → Common Pitfall → Best Practices → Reference Files. ~80 lines. Tone: imperative. References `scripts/with_server.py` (bundled).

**skill-creator verbatim**:
```yaml
name: skill-creator
description: Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.
```
- Description: 327 chars. No `license`, `allowed-tools`, `model`. "Use when..." embedded.
- Body: process narrative → eval loop with `generate_review.py` → quantitative assertion drafting → description optimization loop (`scripts/run_loop`) → platform adaptations. Mixed conversational + technical tone ("Cool? Cool."). ~200 lines.

**Key observation**: `skill-creator` recommends descriptions be "pushy" to combat undertriggering and include both WHAT and WHEN — but skill-creator's own description doesn't use TRIGGER/SKIP format.

---

### Source 3: netresearch/claude-code-marketplace

Body-level observation not possible from catalog. 40 skills referenced as external repos. Domain-specific (TYPO3, PHP). Distributed-repo pattern vs plugin's monorepo. Surface only.

---

## I-2 Comparison table

| axis | industry (N=3) | ai-native-methodology (N=47) | gap |
|---|---|---|---|
| `license` frontmatter | 2/3 use | 0/47 | plugin missing; publishing convention |
| `allowed-tools` frontmatter | 0/3 | 46/47 use | **plugin MORE restrictive — quality advantage** |
| SKIP in description | explicit "SKIP:" in claude-api | absent in all 47 | plugin buries skip at body — trigger-evaluation gap |
| TRIGGER labeling | "TRIGGER when:" multi-bullet (claude-api) | "Use when..." implied | claude-api more explicit for complex domains |
| `model` frontmatter | 0/3 (spec supports it) | 0/47 (Sonnet 4.6 in body of analysis-br-cross-consistency-check) | both absent; plugin inconsistency: model intent in body, not frontmatter |
| Description length | 203~480 chars | 63~419 chars | broadly aligned |
| Body line count | ~80 to 300+ (≤500) | 8~197 (all ≤500) | both compliant |
| Bundled resources | `scripts/` dir per skill | out-of-tree `tools/` + `methodology-spec/` | different philosophy |
| Cross-skill navigation | none | `## 다음` in most skills | **plugin-only positive differentiator** |
| Internal citation system | none | `## 인용` with ADR-*/DEC-*/schemas | **plugin-only positive differentiator** |
| Prerequisites section | none | `## 사전 조건` | **plugin-only positive differentiator** |
| Per-skill eval framework | skill-creator ships eval | plugin-level release-readiness only | industry: per-skill detection of undertriggering |
| Tone consistency | mixed | structured imperative + ★ markers | plugin more consistent but ★ not standard |
| Model pricing tables in body | claude-api embeds (staleness risk) | volatile data in methodology-spec/ (staleness guard) | **plugin pattern better (ADR-010 ratchet)** |

---

## I-3 Industry anti-patterns this plugin avoids

1. **Model pricing/version tables embedded in SKILL.md body**: `claude-api` embeds pricing table dated "cached 2026-04-15". Will silently stale at pricing changes. Plugin keeps volatile reference data in out-of-tree `methodology-spec/` with `release-readiness.js` check #12 staleness guard (60-day cadence). **Plugin pattern is demonstrably superior**.

2. **Unrestricted tool access**: Official Anthropic skills use no `allowed-tools` — full agent tool surface. Plugin explicitly scopes tools per-skill (e.g., `analysis-from-figma` lists only `mcp__figma-desktop__*` + Read/Bash). **Least-privilege tool scoping is a plugin-only quality advantage**.

3. **No cross-skill workflow navigation**: Official skills are isolated. Plugin's `## 다음` section prevents workflow confusion and reduces gate-skipping.

4. **Conversational tone inconsistency**: `skill-creator` uses "Cool? Cool." and non-technical empathy narrative mixed with technical instruction. Plugin maintains structured imperative voice (S5) across 47 skills.

5. **No simulation policy**: No industry skill has equivalent of plugin's `## ★★★ no-simulation` policy. Proprietary quality floor addressing a gap the industry has not yet formalized.

---

## I-4 Industry-aligned, methodology-missing

1. **SKIP conditions in description (not only body)**
   - Industry: `claude-api` description contains "SKIP: file imports `openai`/other-provider SDK..." directly in `description` frontmatter (trigger-evaluation time).
   - Plugin: skills with clear exclusion domains (`analysis-from-figma`: "Figma desktop required"; `analysis-error-mapping`: "BE Spring/NestJS only"; `analysis-aspect-static-security`: "Semgrep/PMD/Bandit env required") put exclusion in body sections. Claude may trigger then abort, consuming context.
   - Candidate: F-SKILL-CAND-IC-001.

2. **`license` frontmatter on individual SKILL.md**
   - Industry: 2/3 official skills use `license:`.
   - Plugin: absent 47/47. No functional impact. Publishing convention gap only.
   - Candidate: F-SKILL-CAND-IC-002.

3. **`model` frontmatter for compute-intensity differentiation**
   - Industry: `skill-creator` recommends it for performance control.
   - Plugin: absent 47/47. `analysis-br-cross-consistency-check` hard-codes `model: "sonnet"` in body Agent tool invocation. `_base-log-finding` (simple write) → Haiku. `analysis-characterization-test` / `analysis-quality-antipattern` → Opus.
   - Candidate: F-SKILL-CAND-IC-003.

4. **Per-skill eval / trigger-accuracy baseline**
   - Industry: `skill-creator` ships `scripts/run_loop` + `generate_review.py` + 20 trigger/no-trigger eval queries per skill.
   - Plugin: plugin-level `release-readiness.js` catches structural compliance only. If `analysis-aspect-i18n` description fails to trigger when user says "다국어 분석해줘", no detection.
   - Candidate: F-SKILL-CAND-IC-004.

---

## Findings

- **F-SKILL-CAND-IC-001** (low) — SKIP conditions absent from description frontmatter: 4+ skills with clear exclusion domains put SKIP logic only in body; industry (claude-api) places SKIP in description for trigger-evaluation time; overtriggering risk for environment-specific skills.
- **F-SKILL-CAND-IC-002** (info) — No `license` frontmatter in 47/47 SKILL.md: minor publishing convention gap; no functional defect; plugin.json carries license at package level.
- **F-SKILL-CAND-IC-003** (low) — No `model` frontmatter for compute-intensity differentiation: `analysis-br-cross-consistency-check` hard-codes Sonnet 4.6 in body; `_base-log-finding` could declare Haiku; official spec supports field (S6); token cost optimization opportunity.
- **F-SKILL-CAND-IC-004** (info) — No per-skill trigger-accuracy eval baseline: plugin-level release-readiness cannot detect individual skill undertriggering for natural-language user phrasings; industry provides this via skill-creator framework.
- **F-SKILL-CAND-IC-005** (info) — ★ marker overuse in descriptions: "★ ★ ★" emphasis (e.g., `_base-invoke-go-stop-gate`, `test-generate-test-spec`, `analysis-br-cross-consistency-check`) not industry-standard; may introduce trigger noise; official skills use natural language emphasis only.

---

## Synthesis

Official Anthropic skills (N=3, same repo) consistently:
- (a) use `license` frontmatter,
- (b) omit `allowed-tools`,
- (c) bundle tool scripts in-skill rather than referencing out-of-tree tooling,
- (d) use no internal cross-document citation systems.

ai-native-methodology diverges on all four — **three are quality advantages** (allowed-tools least-privilege, out-of-tree SSOT, rich citation traceability), one is a gap (no SKIP in description).

The industry has no equivalent to:
- plugin's no-simulation policy,
- cross-skill navigation (`## 다음`),
- prerequisites system (`## 사전 조건`),
- release-readiness 13-criterion gate.

Recommendation context: The strongest actionable signal is the **TRIGGER/SKIP split in description** — for skills with clear exclusion domains, promoting the primary SKIP condition from body into description reduces overtriggering risk at zero structural cost. All other gaps (license, model frontmatter, per-skill eval) are lower-priority improvements.

Sample size caveat: N=3 official skills from 1 repo (anthropics/skills). Conclusions about "industry standard" should be treated as Anthropic-house-style observations, not cross-vendor consensus.

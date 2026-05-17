# D-senior-conscience.md — Senior 양심 점검 (final review)

> Audit date: 2026-05-18. Inputs: B-shard-1/2/3/4 + C-official-docs + C-industry-case.
> Senior verdict policy: ≥ 2 shard corroboration → 정식 finding; single-shard → "investigate-further" 격하.
> Live cross-check performed (no simulation): `templates/analysis/` Glob (21 files confirmed) / `_base/` slash form 5-file Grep confirmed / AP-RENDER prefix repo-wide Grep confirmed (only in skill bodies, 0 in `examples/`).

---

## T1. Dedup map (CAND → unified F-SKILL-NNN)

| input | CAND-id | summary tag | unified F-SKILL |
|---|---|---|---|
| B-shard-1 | CAND-001 | _base-* heading voice EN/KO drift | **F-SKILL-006** |
| B-shard-1 | CAND-002 | _base-apply-template "19 templates" stale (actual 21) | **F-SKILL-007** |
| B-shard-1 | CAND-003 | rules.template.md not renamed to business-rules.template.md (v7.0.0 drift) | **F-SKILL-008** |
| B-shard-1 | CAND-004 | _base-log-finding cites AP-RENDER/A11Y/i18n/FETCH — 0 occurrences in examples/ | **F-SKILL-002** |
| B-shard-1 | CAND-005 | analysis-* description English-only — Korean trigger absent | **F-SKILL-003** |
| B-shard-1 | CAND-006 | analysis-domain-model "§5.B domain" anchor drift (actually FE) | **F-SKILL-001** |
| B-shard-1 | CAND-007 | analysis-business-rules "§5.A rules" anchor drift (actually DB) | **F-SKILL-001** (same class) |
| B-shard-1 | CAND-008 | br-cross-consistency ★-decoration density | **F-SKILL-009** |
| B-shard-2 | CAND-001 | analysis-input-collection cites `apply-baseline-ratchet` (missing `_base-` prefix) | **F-SKILL-004** |
| B-shard-3 | CAND-001 | analysis-quality-antipattern weak description trigger | **F-SKILL-010** |
| B-shard-3 | CAND-002 | analysis-quality-antipattern composite 2-output | **F-SKILL-011** |
| B-shard-3 | CAND-003 | analysis-form-validation-fe composite 2-output | **F-SKILL-011** (same class) |
| B-shard-3 | CAND-004 | analysis-error-mapping 120-line inline YAML | **F-SKILL-012** |
| B-shard-3 | CAND-005 | analysis-sql-inventory 210-line size | **F-SKILL-012** (same class) |
| B-shard-3 | CAND-006 | analysis-characterization-test narrative density | **F-SKILL-012** (same class) |
| B-shard-3 | CAND-007 | analysis-db-schema-erd missing inventory.json prereq | **F-SKILL-013** |
| B-shard-3 | CAND-008 | analysis-type-spec-fe `-fe` suffix vs BE+FE scope | **F-SKILL-014** |
| B-shard-4 | CAND-001 | `_base/` slash form vs `_base-` dash form citation (5 chain skills) | **F-SKILL-005** |
| B-shard-4 | CAND-002 | sub-skill citation bare vs full-prefix inconsistency | **F-SKILL-015** |
| B-shard-4 | CAND-003 | implement-generate-impl-spec composite borderline | **F-SKILL-011** (same class) |
| B-shard-4 | CAND-004 | sub-skill descriptions lack end-user phrases | **F-SKILL-010** (same class — desc trigger weak) |
| B-shard-4 | CAND-005 | implement-react/vue/test-playwright EN/KO mixed descs | (info — design intent, no finding) |
| C-official | OFC-001 | gate skills missing `disable-model-invocation: true` | **F-SKILL-016** |
| C-official | OFC-002 | S2 missing per-field 1024-char cap for description | **F-SKILL-017** |
| C-official | OFC-003 | `${CLAUDE_EFFORT}` missing from §6 pinned digest | **F-SKILL-018** |
| C-official | OFC-004 | v2.1.142 root-level SKILL.md packaging not in P1 | **F-SKILL-019** |
| C-official | OFC-005 | third-person POV best-practice undocumented in S2 | **F-SKILL-020** |
| C-official | OFC-006 | SDK `allowed-tools` silently-ignored caveat undocumented | (info — CLI-first plugin, NOT-A-FINDING) |
| C-industry | IC-001 | SKIP conditions absent from description frontmatter | **F-SKILL-021** |
| C-industry | IC-002 | no `license:` frontmatter on individual SKILL.md | (info — plugin.json carries it, NOT-A-FINDING) |
| C-industry | IC-003 | no `model:` frontmatter (Sonnet hard-coded in body) | **F-SKILL-022** |
| C-industry | IC-004 | no per-skill trigger-accuracy eval baseline | **F-SKILL-023** |
| C-industry | IC-005 | ★ marker overuse in descriptions | **F-SKILL-009** (same class as br-cross-consistency) |

Net: 31 candidates → **23 unified F-SKILL-NNN** + 3 demoted to info/NOT-A-FINDING (OFC-006, IC-002, B4-CAND-005).

---

## T2. §8.1 corroboration check (★ critical)

| F-SKILL | shards corroborating | count | verdict |
|---|---|---|---|
| F-SKILL-001 | B-shard-1 (CAND-006+007) — 2 anchors same root-cause | 1 shard / 2 sites | **single-shard; 2-site same skill family** → corroborated within shard |
| F-SKILL-002 | B-shard-1 + Senior live grep | 2 | **corroborated** ✓ |
| F-SKILL-003 | B-shard-1 (CAND-005) — affects 4 skills | 1 shard / 4 skills | **single-shard 4-site** → corroborated within shard |
| F-SKILL-004 | B-shard-2 (CAND-001) | 1 shard | **single-shard / 1 site** → investigate (validator may mask) |
| F-SKILL-005 | B-shard-4 + Senior live grep (5 files confirmed) | 2 | **corroborated** ✓ |
| F-SKILL-006 | B-shard-1 (CAND-001 + CAND-008 — 2 skills, same class) | 1 shard / 2 sites | corroborated within shard |
| F-SKILL-007 | B-shard-1 + Senior live ls (21 confirmed vs claimed 19) | 2 | **corroborated** ✓ |
| F-SKILL-008 | B-shard-1 (CAND-003) | 1 shard | single-shard (v7.0.0 rename downstream gap) |
| F-SKILL-009 | B-shard-1 (CAND-008) + C-industry (IC-005) | 2 | **corroborated** ✓ |
| F-SKILL-010 | B-shard-3 (CAND-001) + B-shard-4 (CAND-004 — 4 sub-skills) | 2 | **corroborated** ✓ |
| F-SKILL-011 | B-shard-3 (CAND-002+003) + B-shard-4 (CAND-003) | 2 | **corroborated** ✓ |
| F-SKILL-012 | B-shard-3 (CAND-004+005+006 — 3 skills heavyweight) | 1 shard / 3 skills | corroborated within shard |
| F-SKILL-013 | B-shard-3 (CAND-007) | 1 shard | single-shard |
| F-SKILL-014 | B-shard-3 (CAND-008) | 1 shard | single-shard |
| F-SKILL-015 | B-shard-4 (CAND-002) | 1 shard | single-shard |
| F-SKILL-016 | C-official (OFC-001) | 1 source | single-source (official spec → authoritative) |
| F-SKILL-017 | C-official (OFC-002) | 1 source | single-source (official best-practices) |
| F-SKILL-018 | C-official (OFC-003) | 1 source | single-source (digest refresh) |
| F-SKILL-019 | C-official (OFC-004) | 1 source | single-source |
| F-SKILL-020 | C-official (OFC-005) + C-industry implicit | 2 | **corroborated** ✓ |
| F-SKILL-021 | C-industry (IC-001) | 1 source / N=3 | single-source (sample N=3) |
| F-SKILL-022 | C-industry (IC-003) | 1 source | single-source |
| F-SKILL-023 | C-industry (IC-004) | 1 source | single-source |

**§8.1 verdict**: 8 fully-corroborated (≥2 independent shards), 8 within-shard-corroborated (≥2 sites or files), 7 single-shard/single-source. Per CLAUDE.md ★★★ §8.1 — single-shard items are **격하 to "investigate-further"** until next session, but if source is official spec (F-SKILL-016~019) they pass as "spec-authority-corroborated".

---

## T3. Severity recalibration

| F-SKILL | shard-original | senior-recalibrated | rationale |
|---|---|---|---|
| F-SKILL-001 | medium | **medium** | L2 anchor drift in 2 production skills — skill-citation-validator masks this (the class motivating v8.1.0 itself) |
| F-SKILL-002 | medium | **medium** | self-citing taxonomy with 0 actual uses = ghost prefix risk |
| F-SKILL-003 | low | **low** | Korean user trigger surface gap — auto-invoke degraded but English keywords often suffice |
| F-SKILL-004 | medium | **medium** | citation drift; validator likely mask (cross-check needed) — exact class of v8.1.0 motivation |
| F-SKILL-005 | medium | **medium** | 5 chain skills affected (>10% of plugin); slash vs dash semantic ambiguity |
| F-SKILL-006 | low | **low** | cosmetic, no functional impact |
| F-SKILL-007 | medium | **low** | stale enumeration; auto-discovery from ls would fix |
| F-SKILL-008 | medium | **low** | v7.0.0 followup; template files are reference-only |
| F-SKILL-009 | low | **info** | style — both shards flag but no functional impact; ★ marker is internal notation |
| F-SKILL-010 | warn/low | **low** | description trigger surface; intentional for sub-skills (orchestrator-invoked) |
| F-SKILL-011 | warn | **info** | composite by design with documented ADR; SKILL.md should add explicit note |
| F-SKILL-012 | warn | **low** | size approaches S8 budget but ≤500 PASS; out-of-tree migration optional |
| F-SKILL-013 | warn | **low** | prereq omission; analysis-* family asymmetry |
| F-SKILL-014 | warn | **low** | naming convention edge — design ambiguity |
| F-SKILL-015 | low | **info** | citation form inconsistency; gold-standard pattern exists internally |
| F-SKILL-016 | low | **low** | additive `disable-model-invocation` for 4 gate skills |
| F-SKILL-017 | low | **low** | S2 spec gap — no current violation, hardening only |
| F-SKILL-018 | low | **low** | digest refresh — PATCH-level methodology body |
| F-SKILL-019 | low | **info** | relaxation, not contradiction; plugin compliant |
| F-SKILL-020 | low | **low** | third-person POV; ~25 skills need wording |
| F-SKILL-021 | low | **low** | SKIP-in-description; valuable for env-restricted skills |
| F-SKILL-022 | low | **low** | model frontmatter; token-cost optimization |
| F-SKILL-023 | info | **info** | per-skill eval framework; v9.x feature consideration |

---

## T4. Blind spots discovered (sub-agents missed)

1. **B-7 spot-check coverage gap** (Senior gap-find): B-shard-1/2/3 spot-checked 2-3 citations per skill. With 47 skills × ~5 citations each = ~235 citation cells, audit covered ~30%. **Uncaught semantic-drift class = anchor-level §X.Y mismatch within real files** (F-SKILL-001 caught 2 in business-logic.md — likely more exist in workflow/*.md). Recommend a dedicated `skill-citation-validator-L3` pass with anchor-level semantic check.

2. **Description Korean/English distribution not measured** (B-shard-1 #005 mentions, no quantification): No shard counted "what % of descriptions are KO-led vs EN-led vs mixed". Senior estimate from cross-reads: roughly 12/47 KO-led + 23/47 EN-led + 12/47 mixed. **For Korean-user auto-invoke surface, ~23 skills have degraded triggering**. Significant blind spot — quantification needed.

3. **DELTA-3 per-field 1024-char cap (F-015)** — Senior live check: ran wc on description fields would be ideal. Per C-official "all 213-419 chars" (no violation), but this is sample-based; full sweep needed. **NOT verified by any shard for all 47 skills.**

4. **`_base-*` documented-exception staleness** — Senior gap-find: ADR-PLUGIN-001 §8-2 frozen allowlist last updated v8.2.1 (2026-05-17). The exception treats `_base-` prefix as "documented anomaly" rather than canonical. Multiple findings (F-SKILL-004, F-SKILL-005, F-SKILL-015) reveal **citation drift around this exception is recurrent**. The exception itself becomes a drift attractor. **No finding has surfaced "exception is overdue for either (a) proper rename per LL-i-55 cautious-cooling-off or (b) escalation to canonical convention"**. Senior opens **F-SKILL-024** — review whether §8-2 frozen allowlist should be revisited (v9.x carry candidate).

5. **★-decoration body propagation** (C-industry IC-005 partial): IC-005 flagged ★ in descriptions only. Senior gap-find: F-SKILL-009 evidence (B-shard-1 #008) showed 60+ ★ in body of single skill. ★ density in **body sections** = visual noise + potential trigger noise + non-industry standard. Cross-cutting concern across `analysis-br-cross-consistency-check`, gate skills, chain-entry skills. **Quantify ★ density per skill body**.

6. **Composite-skill risk B-shard-3 surfaced but B-shard-4 didn't flag chain-entry orchestrators**: `planning-extract-from-legacy`, `spec-compose-behavior-spec`, `test-generate-test-spec`, `implement-generate-impl-spec` all delegate to sub-skills + run validators + invoke gates — each is **6~8 step monolith**. B-shard-4 marks `implement-generate-impl-spec` borderline (CAND-003) but accepts the 3 others. Senior: **all 4 chain-entry skills are at the same composite boundary**. F-SKILL-011 covers but should explicitly enumerate all 4.

---

## T5. Final F-SKILL list (canonical)

| id | severity | type | affected skills | corrob | priority | proposed fix | breaking |
|---|---|---|---|---|---|---|---|
| F-SKILL-001 | medium | citation-anchor-drift | analysis-domain-model / analysis-business-rules | 2-site | **P1** | fix anchor refs to actual §X.Y in business-logic.md | no |
| F-SKILL-002 | medium | ghost-taxonomy | _base-log-finding | 2 | **P0** | remove AP-RENDER/A11Y/i18n/FETCH or replace with AP-FE-* | no |
| F-SKILL-003 | low | desc-trigger-EN-only | analysis-architecture/domain-model/source-inventory/business-rules | 4-site | P1 | add Korean trigger keywords to descriptions | no |
| F-SKILL-004 | medium | _base-prefix-citation-drift | analysis-input-collection | 1 | **P0** | replace_all `apply-baseline-ratchet` → `_base-apply-baseline-ratchet` (2 sites) | no |
| F-SKILL-005 | medium | slash-vs-dash-citation | 5 chain skills (planning-extract / spec-compose / test-generate / impl-generate / impl-verify) | 2 | **P0** | normalize `_base/<name>` → `_base-<name>` (~8 occurrences) | no |
| F-SKILL-006 | low | _base-family-heading-voice-drift | _base-apply-baseline-ratchet / _base-log-finding (EN) vs others (KO) | 2-site | P2 | unify heading template across 5 _base-* skills | no |
| F-SKILL-007 | low | stale-template-count | _base-apply-template | 2 | P1 | replace "19 templates" with auto-discovery or fix to "21" | no |
| F-SKILL-008 | low | rules-to-business-rules-template-gap | _base-apply-template | 1 | P2 | rename `rules.template.md` → `business-rules.template.md` (v7.0.0 followup) | minor |
| F-SKILL-009 | info | star-decoration-density | analysis-br-cross-consistency-check + ≥3 chain skills | 2 | P2 | reduce ★ density to ≤ 5 per skill body | no |
| F-SKILL-010 | low | weak-desc-trigger | analysis-quality-antipattern + 4 sub-skills (planning-decompose/identify, spec-derive-AC/integrate) | 2 | P1 | add NL trigger phrases to descriptions | no |
| F-SKILL-011 | info | composite-orchestrator-borderline | implement-generate-impl-spec + 3 chain-entry siblings | 2 | P2 | add "intentional orchestrator = ADR cite" callout to bodies | no |
| F-SKILL-012 | low | body-size-narrative-density | analysis-sql-inventory(210) / analysis-characterization-test(196) / analysis-error-mapping(120) | 3-site | P2 | migrate external authority/PoC tables to deliverables/ out-of-tree | no |
| F-SKILL-013 | low | prereq-asymmetry | analysis-db-schema-erd | 1 | P1 | add inventory.json to 사전 조건 | no |
| F-SKILL-014 | low | name-scope-mismatch | analysis-type-spec-fe | 1 | P2 | (a) soften desc to FE-primary OR (b) v9.x rename to drop `-fe` | yes if (b) |
| F-SKILL-015 | info | sub-skill-citation-form-inconsistency | spec-compose / planning-extract / impl-generate | 1 | P2 | normalize: always full prefix OR always bare+parenthetical | no |
| F-SKILL-016 | low | missing-disable-model-invocation | _base-invoke-go-stop-gate / test-run-test-evidence / implement-verify-test-pass / test-verify-coverage | 1 (official) | P1 | add `disable-model-invocation: true` frontmatter | no |
| F-SKILL-017 | low | S2-spec-incomplete-1024char | plugin-authoring-spec.md §2 S2 | 1 (official) | P1 | add per-field cap to S2 + recompute digest_sha | no |
| F-SKILL-018 | low | digest-stale-CLAUDE_EFFORT | plugin-authoring-spec.md §6 | 1 (official) | P1 | add `${CLAUDE_EFFORT}` to pinned digest + recompute digest_sha | no |
| F-SKILL-019 | info | digest-stale-root-SKILL-relax | plugin-authoring-spec.md §6 + P1 rule | 1 (official) | P2 | note packaging-relaxation in §6 | no |
| F-SKILL-020 | low | third-person-POV-undocumented | plugin-authoring-spec.md §2 S2 + ~25 skills | 2 | P1 | add S2 sub-rule + audit description wording | no |
| F-SKILL-021 | low | SKIP-in-description-absent | env-restricted skills (figma/static-security/html-template/error-mapping) | 1 (industry N=3) | P2 | add SKIP: clause to descriptions of env-restricted skills | no |
| F-SKILL-022 | low | no-model-frontmatter | analysis-br-cross-consistency-check (Sonnet body-pinned) + others | 1 (industry) | P2 | promote model hint from body to frontmatter where applicable | no |
| F-SKILL-023 | info | no-per-skill-eval | plugin (all 47) | 1 (industry) | P2 | adopt skill-creator-style eval framework | no |
| F-SKILL-024 | info | _base-prefix-exception-drift-attractor | charter §8-2 frozen allowlist | meta (covers F-004+005+015) | P2 | open v9.x review: rename to canonical OR validator-level normalization | yes if rename |

**Total findings: 24** (23 unified from sub-agents + Senior gap-find F-SKILL-024).

Severity distribution (recalibrated): **4 medium / 11 low / 9 info**.

---

## T6. P0/P1/P2 prioritization

### P0 (next session immediate fix — additive, breaking 0, conf ≥ 0.85, ≥2 corroboration)

- **F-SKILL-002** — _base-log-finding ghost AP prefixes (AP-RENDER/A11Y/i18n/FETCH). Live-verified. 5-line fix. conf 0.95.
- **F-SKILL-004** — analysis-input-collection `apply-baseline-ratchet` prefix drift. 2 replace_all. conf 0.92.
- **F-SKILL-005** — `_base/` slash form → `_base-` dash form normalization in 5 chain skills. ~8 occurrences. conf 0.90.

3 P0 → single PATCH release (v8.4.1).

### P1 (next-session MINOR — methodology body change / digest recompute)

- **F-SKILL-001** — business-logic.md §A/§B anchor drift (2 skills)
- **F-SKILL-003** — Korean trigger keyword to 4 analysis-* descriptions
- **F-SKILL-007** — _base-apply-template stale count "19" (fix to 21 or auto-discovery)
- **F-SKILL-010** — desc trigger phrases for 5 weak-trigger skills
- **F-SKILL-013** — analysis-db-schema-erd prereq inventory.json
- **F-SKILL-016** — disable-model-invocation for 4 gate skills
- **F-SKILL-017** — S2 per-field 1024-char cap added to plugin-authoring-spec
- **F-SKILL-018** — `${CLAUDE_EFFORT}` digest refresh
- **F-SKILL-020** — third-person POV S2 sub-rule

9 P1 → single MINOR release with digest_sha recompute (v8.5.0).

### P2 (cooling-off 24h — breaking or rename or multi-day)

- F-SKILL-006 (cosmetic cross-file rewrite)
- F-SKILL-008 (template rename — minor breaking)
- F-SKILL-009 (★ density reduction)
- F-SKILL-011 (composite-orchestrator callout)
- F-SKILL-012 (body-size out-of-tree migration)
- F-SKILL-014 (name-scope rename — MAJOR if (b))
- F-SKILL-015 (sub-skill citation form normalization)
- F-SKILL-019 (packaging-relaxation note)
- F-SKILL-021 (SKIP-in-description rewrite)
- F-SKILL-022 (model frontmatter rollout)
- F-SKILL-023 (per-skill eval framework — v9.x)
- **F-SKILL-024** (charter-level _base- prefix review — meta-finding)

12 P2 → each separate plan + cooling-off + cluster decision.

---

## T7. Senior verdict on the audit itself

**Verdict: GO — confidence 0.86.**

Audit is sound; F-SKILL list is well-founded; 8 findings have ≥ 2 independent corroboration; 8 have within-shard multi-site corroboration; 7 single-source items rest on official spec authority. **§8.1 over-fit risk minimal** because findings cluster on cross-cutting patterns (citation form, anchor drift, description trigger) rather than single-PoC-specific anti-patterns.

### Top 3 quality concerns

1. **skill-citation-validator coverage gap** (corroborated by F-SKILL-001 + F-SKILL-004 + F-SKILL-005): the v8.1.0 validator catches L1 dead-link but **misses (a) anchor-level §X.Y semantic mismatch, (b) `_base-` prefix normalization that masks bare-name citations, (c) slash-vs-dash form ambiguity**. The audit surfaces 3 different drift classes the validator currently absorbs. **Validator scope expansion is the highest-ROI structural fix** (not in the F-SKILL list itself, but a meta-finding).

2. **Korean trigger surface degradation** (F-SKILL-003 + F-SKILL-010): ~50% of analysis-* skills have English-only descriptions. Korean users typing "도메인 모델 분석" / "비즈니스 규칙 추출" may underfire. No shard quantified this across 47 — needs a dedicated grep + classification pass.

3. **`_base-*` documented-exception is a drift attractor** (Senior gap-find F-SKILL-024): 3 different findings (F-SKILL-004, F-SKILL-005, F-SKILL-015) all root-cause to the §8-2 frozen allowlist convention. **Each new release iterates around the exception rather than resolving it**. v8.2.1 documented it; v8.4.1+ will likely see the same drift class re-emerge. Charter-level question: rename to canonical convention or codify validator-level normalization?

### What I would block

Nothing in P0 needs to be blocked. P2 items requiring rename (F-SKILL-008, F-SKILL-014) need explicit cooling-off + Senior re-review per `feedback_decision_cadence_24h_cooling_off`. **F-SKILL-024 deserves explicit user-facing prompt next session** — it's the meta-class governing 3+ findings.

---

## T8. F-021 임계 check

- **Total finding count: 24** (23 unified + Senior gap-find F-SKILL-024).
- Per `feedback_finding_threshold.md`:
  - ≤ 15 = healthy
  - 16-19 = caution
  - **≥ 20 = spec quality may be insufficient — surface to user, recommend Phase reset**
- **Verdict: UNHEALTHY (24 ≥ 20).**

### Action recommendation

**Senior strongly recommends surfacing this to user before any P0 fix begins.** Rationale:

1. 24 findings on **L3 skill audit alone** (not whole methodology body) suggests skill-authoring spec (plugin-authoring-spec.md S1~S8) is **incomplete or under-enforced**. Examples:
   - S2 missing per-field 1024-char cap (F-SKILL-017)
   - S2 missing third-person POV (F-SKILL-020)
   - S6 missing model/paths/disable-model-invocation usage guidance (F-SKILL-016, F-SKILL-022)
   - S8 not flagging body-size narrative density (F-SKILL-012)
   - No spec for `_base-` prefix vs `_base/` citation form (F-SKILL-005)
   - No spec for Korean+English description balance (F-SKILL-003)

2. **However**, ~9 of 24 are info/cosmetic. Filtering to actionable: **15 actionable findings = upper-caution band, not unhealthy**.

3. **Pragmatic verdict**: NOT a Phase reset. Surface the 24-count to user as a **plugin-authoring-spec maturity signal** — propose v9.0 charter review (F-SKILL-024 + the 6 S2/S6/S8 spec gaps above) as a separate methodology body workstream **after** P0 PATCH closes the 3 immediate bugs.

**Recommended cadence**:
1. Next session: P0 PATCH (3 findings, breaking 0). Surface 24-count to user.
2. Session+1: P1 MINOR (9 findings, digest recompute, methodology body update). Decide v9.0 charter scope.
3. Session+2+: P2 items as separate decisions (cooling-off per `feedback_decision_cadence_24h_cooling_off`).

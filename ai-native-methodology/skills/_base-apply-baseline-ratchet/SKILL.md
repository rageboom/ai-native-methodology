---
name: _base-apply-baseline-ratchet
description: Apply ADR-010 baseline+ratchet before Phase 0. MANDATORY when starting analysis on a legacy codebase. Captures initial defect baseline (e.g., Semgrep / SpotBugs / static-security findings count) and enforces ratchet — new code cannot worsen the baseline. Without this, legacy projects suffer "defect explosion" when methodology surfaces existing issues.
allowed-tools: Read, Glob, Bash, Edit, Write
---

# apply-baseline-ratchet

ADR-010 의무 진입 단계. Phase 0 이전 적용.

## Why this matters

When the methodology starts surfacing findings on a legacy codebase, the user sees a sudden surge of issues that have always existed. Without baseline+ratchet:

1. Team feels overwhelmed ("we have 500 issues!")
2. Methodology gets blamed ("this tool is generating noise")
3. Adoption fails

ADR-010 fixes this: capture the baseline once, then **ratchet** — new findings only count if they're additions over baseline. Existing issues are tracked separately as "legacy debt" with their own paydown schedule.

## Steps

1. **Identify the analysis target** — confirm with user: which legacy codebase / branch / commit ref?
2. **Run baseline tools** — real external tools, not simulation:
   - Semgrep (`tools/static-runner` adapter)
   - SpotBugs (Java)
   - PMD (Java)
   - ESLint (JS/TS)
   - Bandit (Python)
   - Whichever applies to the target language stack
3. **Capture baseline counts and findings** — write to `<user-project>/.aimd/baseline-<YYYY-MM-DD>.json`:
   ```json
   {
     "baseline_date": "2026-05-02",
     "baseline_commit": "<sha>",
     "tools": {
       "semgrep": { "findings_count": 247, "by_severity": { "high": 12, "medium": 89, "low": 146 }, "report_path": ".aimd/baseline-semgrep-2026-05-02.json" },
       "spotbugs": { ... }
     },
     "ratchet_policy": "no-new-high | no-new-any | percent-decrease",
     "review_cadence": "monthly"
   }
   ```
4. **Configure ratchet policy** — discuss with user:
   - **strict (no-new-any):** PR cannot add any finding above baseline. Blocks merge.
   - **moderate (no-new-high):** PR cannot add high-severity. Lower severities tracked separately.
   - **relaxed (percent-decrease):** baseline must trend down each release. No per-PR enforcement.
5. **Wire CI** — add ratchet check to `.github/workflows/` or sa-driven equivalent. Provide template if user has none.
6. **Commit baseline file** to user's repo (signed if possible).

## Output

After this skill completes, the user has:
- `.aimd/baseline-<date>.json` committed
- Ratchet policy declared
- CI configured (or template provided)
- Next-step prompt: "Phase 0 진입 가능. `/methodology:phase-0-input` 호출."

## Refuse to skip

If user wants to skip baseline+ratchet on a legacy project, refuse and reference ADR-010. Surface the "defect explosion" risk concretely. If user still insists, log a finding with `Type: methodology-violation, Confidence: high` and proceed under protest.

## Greenfield projects

For greenfield (no legacy code), ADR-010 is N/A — proceed directly to Phase 0. State this explicitly in the finding ledger so future readers know baseline was intentionally absent.

# B-shard-1.md — audit of 12 skills (Phase B)

> L3 quality audit. SSOT = `methodology-spec/plugin-authoring-spec.md` §2 (S1~S8) + §6.
> Out-of-scope (already validated): S1 ≤500 line, S2 ≤1536 char, S3 lowercase+hyphen, S6 frontmatter keys, citation dead-link.
> Audit axis B-1~B-7 per skill. Evidence-grounded; no speculation.

Line counts (all skills well under S1 500-line ceiling):
- _base-apply-baseline-ratchet: 65 / _base-apply-template: 42 / _base-build-traceability-matrix: 71 / _base-invoke-go-stop-gate: 86 / _base-log-finding: 58
- analysis-architecture: 52 / analysis-domain-model: 48 / analysis-business-rules: 59 / analysis-source-inventory: 47 / analysis-api-rule-mapping: 31 / analysis-formal-spec-validation: 58 / analysis-br-cross-consistency-check: 117

---

## Skill 1: _base-apply-baseline-ratchet
- B-1: **PASS** — description says "capture initial defect baseline + enforce ratchet"; body Steps 2~5 cover Semgrep/SpotBugs/PMD baseline capture, baseline JSON template, ratchet policy (strict/moderate/relaxed), CI wiring.
- B-2: **PASS** — keywords "ADR-010 / baseline / ratchet / legacy / defect explosion / Semgrep / SpotBugs / ESLint / Bandit". English-heavy but legacy/baseline triggers are common.
- B-3: **PASS** — single responsibility: capture baseline + declare ratchet policy. Two activities are tightly coupled.
- B-4: **PASS** — section "Steps" is imperative ("Identify / Run / Capture / Configure / Wire / Commit"). "Why this matters" narrative is short (5 lines).
- B-5: **PASS** — 65 lines / well under 500. Inline JSON example (~10 lines) is small. No oversized embedded table.
- B-6: **FAIL (low)** — voice/structure diverges from peer `_base-*` skills. This skill uses English headings ("Why this matters / Steps / Output / Refuse to skip / Greenfield projects") while peer `_base-build-traceability-matrix` and `_base-invoke-go-stop-gate` use Korean (`언제 사용 / 산출물 / 절차 / 인용 / Carry`). Family heading drift.
- B-7: **PASS** — cites ADR-010 (file exists `docs/adr/ADR-010-baseline-ratchet.md` ✅) and "no simulation" matches CLAUDE.md policy.
- **Findings**:
  - F-SKILL-CAND-001 (low / `_base-*` family heading inconsistency: English vs Korean voice between 5 `_base-*` skills)

## Skill 2: _base-apply-template
- B-1: **PASS** — description "Apply an artifact template from templates/analysis/"; body Steps 1~6 walk through template load → prerequisite check → placeholder fill → write.
- B-2: **PASS** — keywords list 17 artifact names (inventory/architecture/domain/rules/openapi/schema/erd/antipatterns/…). Korean trigger examples included ("inventory.md 시작해줘").
- B-3: **PASS** — single responsibility: apply template (parameterized over 19 artifacts).
- B-4: **PASS** — Steps section is imperative.
- B-5: **PASS** — 42 lines.
- B-6: **PASS** — heading style "How to invoke / Steps / Per-artifact prerequisites / When to refuse" coexists OK with English peers.
- B-7: **FAIL (medium)** — Step 1 claims "19 templates in `templates/analysis/`" but actual count = **21 templates** (ls confirmed). Also Step says "business-rules.json 새로 작성 → fills `templates/analysis/rules.template.md`": `rules.template.md` exists (✅) but newer canonical name in v7.0.0+ is `business-rules.json` (schema rename done) — template file was NOT renamed (`business-rules.template.md` MISSING). Asymmetry: SSOT artifact is `business-rules` but template still `rules`. Not a fatal dead-link, but staleness signal.
- **Findings**:
  - F-SKILL-CAND-002 (medium / stale count "19 templates" — actual 21 / templates/analysis/ has 21 entries)
  - F-SKILL-CAND-003 (medium / `rules.template.md` filename out of sync with v7.0.0 `business-rules.{json,schema.json}` rename — template file not renamed to mirror)

## Skill 3: _base-build-traceability-matrix
- B-1: **PASS** — description "4 chain 산출물 합성하여 traceability-matrix 생성"; body Step 2 invokes `tools/traceability-matrix-builder/src/cli.js` (verified exists ✅) with all 5 chain artifacts.
- B-2: **PASS** — keywords "traceability / matrix / DO-178C / IEC 62304 / forward+backward link / coverage_summary / chain harness". Korean natural-language triggers explicit ("matrix 보여줘 / matrix 갱신해줘").
- B-3: **PASS** — single responsibility: build cross-gate matrix.
- B-4: **PASS** — Steps numbered + imperative.
- B-5: **PASS** — 71 lines. Inline bash + json schema header example small.
- B-6: **PASS** — uses Korean family pattern (언제 사용 / 산출물 / 절차 / S5 / no-simulation / 인용 / Carry). Matches peer `_base-invoke-go-stop-gate`.
- B-7: **PASS** — cites ADR-CHAIN-001 §2/§4 (verified: §2 = "cross-link coverage ≥ 0.85 ratchet" ✅ / §4 = "traceability-matrix" cross-link table line ✅). schemas/traceability-matrix.schema.json exists ✅.
- **Findings**: none

## Skill 4: _base-invoke-go-stop-gate
- B-1: **PASS** — description "chain stage 종결 시 사용자 검토 prompt + intervention_log 기록"; body Step 2 prompt template + Step 3 go/stop/revisit branching + Step 4 jsonl log.
- B-2: **PASS** — keywords "go/stop/revisit / gate / chain stage / Auto Mode / 묶음 결단 / cluster". Both Korean and English triggers.
- B-3: **PASS** — single responsibility: gate UX prompt + log decision + chain-driver handoff.
- B-4: **PASS** — Steps imperative.
- B-5: **PASS** — 86 lines.
- B-6: **PASS** — same Korean family pattern as Skill 3.
- B-7: **PASS** — cites ADR-CHAIN-002 (exists ✅), ADR-CHAIN-003 (exists ✅), DEC-2026-05-06-round-trip-부분-허용 (exists ✅). schemas/intervention-log.schema.json exists ✅.
- **Findings**: none

## Skill 5: _base-log-finding
- B-1: **PASS** — description "Log a finding ... applies id-conventions (F-XXX) and writes to per-PoC findings.md or methodology body finding-system.md"; body "ID conventions / Output location / Format" sections align.
- B-2: **PASS** — keywords "finding / anti-pattern / gap / risk / hypothesis / simulation / migration risk". Trigger surface broad.
- B-3: **PASS** — single responsibility: log finding entry.
- B-4: **PASS** — bullet-form imperative ("Trigger this skill anytime you...").
- B-5: **PASS** — 58 lines.
- B-6: **FAIL (low)** — English heading style ("When to invoke / ID conventions / Threshold / Output location / Format / What NOT to log") = same divergence as Skill 1. Reinforces family drift pattern.
- B-7: **FAIL (medium)** — AP-prefix enumeration "AP-API / AP-DB / AP-DOMAIN / AP-RENDER / AP-STATE / AP-FETCH / AP-A11Y / AP-i18n" — verified usage: **AP-API / AP-DB / AP-DOMAIN exist** in PoCs (poc-01 antipatterns.json line 39-356), but **AP-RENDER / AP-FETCH / AP-A11Y / AP-i18n appear nowhere** in `examples/` or `methodology-spec/`. Actual FE prefix is `AP-FE-SECURITY-*` (per ADR-FE-007 + plan-v14-carry-1-semgrep.md). The skill cites prefixes that do not appear to exist in any artifact.
- **Findings**:
  - F-SKILL-CAND-004 (medium / AP-RENDER/AP-FETCH/AP-A11Y/AP-i18n prefixes cited in skill body have **zero occurrences** repo-wide — actual FE prefix = AP-FE-SECURITY / AP-FE-OPTIMISTIC. Citation invents non-existent taxonomy.)

## Skill 6: analysis-architecture
- B-1: **PASS** — description "extract architecture (layers, modules, dependencies, boundaries) + ERD-style"; body Step 1~6 covers pattern ID, layer mapping, circular dep, architecture.json + .mermaid output.
- B-2: **FAIL (low)** — description English-only ("Use after analysis-source-inventory..."); body Korean only ("아키텍처 추출"). Korean user typing "아키텍처 분석" / "레이어 분석" / "hexagonal" — none in description trigger surface. Mixed surface might still auto-invoke via "architecture", but Korean trigger keywords absent.
- B-3: **PASS** — single responsibility: architecture extraction.
- B-4: **PASS** — Steps imperative.
- B-5: **PASS** — 52 lines.
- B-6: **PASS** — Korean section pattern matches `analysis-*` family (사전 조건 / 절차 / 산출물 / 본체 명세 / 다음).
- B-7: **PASS** — cites `methodology-spec/workflow/architecture.md` (exists ✅), ADR-006 (순환의존 정책, exists ✅), ADR-008 (이중 렌더링, exists ✅), schemas/architecture.schema.json (exists ✅).
- **Findings**:
  - F-SKILL-CAND-005 (low / `analysis-*` family description = English-only / Korean trigger keyword absent / cross-cutting pattern for analysis skills 6~11)

## Skill 7: analysis-domain-model
- B-1: **PASS** — description "DDD-style entities/aggregates/value objects/bounded contexts"; body Step 1~6 covers Entity/Aggregate/VO/Bounded Context/Ubiquitous Language/domain.json.
- B-2: **FAIL (low)** — same as Skill 6: English-only description. Korean user trigger "도메인 모델 / DDD" not present in description.
- B-3: **PASS** — single responsibility: domain extraction.
- B-4: **PASS** — Steps imperative.
- B-5: **PASS** — 48 lines.
- B-6: **PASS** — Korean family pattern matches Skill 6.
- B-7: **FAIL (medium)** — body cites "`methodology-spec/workflow/business-logic.md` (§5.B domain — `business-logic` phase 안 4영역 병렬)". File exists ✅ but actual section structure in business-logic.md is "3.1 영역 5.A — DB 영역 / 3.2 영역 5.B — FE 코드 영역 / 3.3 영역 5.C — 설정/환경 정책 / 3.4 영역 5.D — 외부 의존성 매핑". **§5.B is FE (not domain)**. Citation drift.
- **Findings**:
  - F-SKILL-CAND-006 (medium / `analysis-domain-model` cites "§5.B domain" but business-logic.md §5.B = "FE 코드 영역" not domain. Domain is split across DB/FE/외부 areas, not a single §)

## Skill 8: analysis-business-rules
- B-1: **PASS** — description "extract business rules as DMN-style decision tables"; body Step 1~5 covers rule candidate collection, decision-table conversion, business-rules.json output, decision-table-validator invocation.
- B-2: **PASS** — keywords "DMN / decision table / 5-check / duplicate / conflict / gap / overlap / decision-table-validator". Korean users would type "비즈니스 규칙" — description has English-only "business rules", but "DMN" is industry standard universal.
- B-3: **PASS** — single responsibility: business-rules extraction.
- B-4: **PASS** — Steps imperative.
- B-5: **PASS** — 59 lines. Schema example inline ~15 lines.
- B-6: **PASS** — Korean family pattern matches.
- B-7: **FAIL (medium)** — same as Skill 7: cites "`methodology-spec/workflow/business-logic.md` (§5.A rules)". Actual §5.A = "DB 영역", not rules. **§5.A != rules**. The 4-area parallel extraction in business-logic.md is DB/FE/Config/External, none labeled "rules" — rules are an *output* (4. 출력 line 103: `rules/business-rules.json`), not an *area*.
  - Positive: schemas/business-rules.schema.json $defs.businessRule with GWT+NL 2-branch (v6.0.0) accurately reflected ✅. auto_extracted_br_refs (v6.1.0) accurate ✅.
- **Findings**:
  - F-SKILL-CAND-007 (medium / `analysis-business-rules` cites "§5.A rules" but business-logic.md §5.A = "DB 영역". Same drift class as F-SKILL-CAND-006)

## Skill 9: analysis-source-inventory
- B-1: **PASS** — description "enumerate modules, packages, files, and dependencies"; body Steps 1~6 cover entry point ID, module tree, dep graph, inventory.json output.
- B-2: **FAIL (low)** — English-only description ("Use after analysis-input-collection..."). Same family drift as Skills 6-7.
- B-3: **PASS** — single responsibility: inventory.
- B-4: **PASS** — Steps imperative.
- B-5: **PASS** — 47 lines.
- B-6: **PASS** — Korean family pattern matches.
- B-7: **PASS** — cites `methodology-spec/workflow/discovery.md` (exists ✅), schemas/inventory.schema.json (exists ✅), templates/analysis/inventory.template.md (exists ✅).
- **Findings**: none new (Skill 6 family-level finding F-SKILL-CAND-005 covers)

## Skill 10: analysis-api-rule-mapping
- B-1: **PASS** — description "finalize business-rules.json with formal spec links / cross-references to openapi.yaml + schema.json + state-map.json"; body Step 1~5 covers rules↔openapi / rules↔schema / rules↔state-map / fe_validation mapping.
- B-2: **PASS** — keywords "rule mapping / cross-link / openapi / state-map / fe_validation / decision-table-validator".
- B-3: **PASS** — single responsibility: cross-link finalization (single artifact updated: business-rules.json).
- B-4: **PASS** — Steps imperative.
- B-5: **PASS** — 31 lines (shortest of 12 / very tight).
- B-6: **PASS** — Korean family pattern matches.
- B-7: **PASS** — cites `methodology-spec/deliverables/5-business-rules.md` (exists ✅), ADR-FE-005 (exists ✅). Cross-reference to openapi.yaml + schema.json + state-map.json all schemas exist ✅.
- **Findings**: none

## Skill 11: analysis-formal-spec-validation
- B-1: **PASS** — description "cross-validate domain↔rules↔inventory↔architecture / Real external tools mandatory / formal-spec-link-validator auto-runs"; body covers all 4 in steps 1~5 including no-simulation enforcement.
- B-2: **PASS** — keywords "cross-validation / formal-spec / no-simulation / Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube / 5-stage confidence". Heavy industry-tool vocabulary.
- B-3: **PASS** — single responsibility: formal-spec cross-validation phase.
- B-4: **PASS** — Steps imperative with clear ✅/❌ markers for no-simulation policy.
- B-5: **PASS** — 58 lines.
- B-6: **PASS** — Korean family pattern matches.
- B-7: **PASS** — cites `methodology-spec/workflow/formal-spec.md` (exists ✅), ADR-008 + ADR-009 (exist ✅), `tools/formal-spec-link-validator/` + `tools/drift-validator/` + `tools/static-runner/` all referenced (assume exist per CLAUDE.md tool inventory).
- **Findings**: none

## Skill 12: analysis-br-cross-consistency-check
- B-1: **PASS** — description "BR 두 표현 (natural_language ↔ given/when/then) semantic 정합 검증 / Layer 1 결정적 + Layer 2 LLM mandatory"; body Step 1~4 covers Layer 1 cli invocation → Layer 2 Agent invocation → result JSON save → integrated re-measurement.
- B-2: **PASS** — Korean trigger list explicit (line 15-20): "BR cross consistency check / Layer 2 검증 / BR semantic 정합 검증 / NL ↔ GWT 정합 검증". Good Korean+English balance.
- B-3: **PASS** — single responsibility: BR cross-consistency check (Layer 1+2 are both ON the same scoring axis, not separate deliverables).
- B-4: **FAIL (low)** — heavy ★-prefix decoration on nearly every line (60+ stars in 117 lines). Reads more narrative/emphatic than imperative. E.g. "★ ★ ★ ★ paradigm 본질" / "★ ★ ★ ★ ★ ★ Layer 2 LLM 호출 paradigm" — over-emphasis dilutes imperative signal.
- B-5: **PASS** — 117 lines (largest of 12, still well under 500). Step 2 inline Agent invocation pseudo-code + JSON schema small.
- B-6: **FAIL (low)** — diverges from `analysis-*` family in two ways: (a) ★-decoration density far exceeds peers, (b) section labels "paradigm 본질 / 시행 paradigm / 한계 / Adzic SBE 함정 회피 자격" don't match the canonical 사전 조건 / 절차 / 산출물 / 본체 명세 / 다음 pattern of peers. Family drift.
- B-7: **PASS** — cites `tools/br-cross-consistency-validator/` (exists ✅), `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` (exists ✅), `tools/br-cross-consistency-validator/PHASE-C-2026-05-14-re-measurement.md` (exists ✅), ADR-CHAIN-011 (exists ✅).
- **Findings**:
  - F-SKILL-CAND-008 (low / `analysis-br-cross-consistency-check` ★-decoration density (>60 stars / 117 lines) erodes B-4 imperative voice + B-6 family consistency)

---

## Summary

- **12 skills × 7 axis = 84 cells**
- **PASS: 73 / FAIL: 11**
- FAIL breakdown by severity: medium = 5 (F-SKILL-CAND-002, 003, 004, 006, 007) / low = 6 (B-4·B-6 family drift, English-only description, ★-decoration)
- All 12 skills well under S1 500-line ceiling (max 117 lines, total 734 lines / 12 = 61 avg). Progressive disclosure already strong via out-of-tree refs to methodology-spec/ schemas/ templates/.

### Top 5 finding candidates (severity sorted)

1. **F-SKILL-CAND-004** (medium) — `_base-log-finding` cites AP-RENDER / AP-FETCH / AP-A11Y / AP-i18n prefixes that have **zero occurrences repo-wide**. Actual FE prefix = AP-FE-SECURITY (verified poc-04 + plan-v14). Fix: replace with AP-FE-* or remove non-existent enumeration.
2. **F-SKILL-CAND-006** (medium) — `analysis-domain-model` cites "business-logic.md §5.B domain" but §5.B = "FE 코드 영역". Domain extraction is split across 4 areas, none labeled "domain". L2 citation drift (target file exists, anchor wrong).
3. **F-SKILL-CAND-007** (medium) — `analysis-business-rules` cites "business-logic.md §5.A rules" but §5.A = "DB 영역". Same drift class as #2. Rules are an OUTPUT (section 4), not an AREA.
4. **F-SKILL-CAND-002** (medium) — `_base-apply-template` claims "19 templates in templates/analysis/" — actual count = 21. Stale enumeration.
5. **F-SKILL-CAND-003** (medium) — `_base-apply-template` references `templates/analysis/rules.template.md` for "business-rules.json" — v7.0.0 schema rename (rules.schema → business-rules.schema) did not propagate to template file name. Naming asymmetry.

### Cross-skill patterns observed

- **All 12 skills well under S1 500-line ceiling** (max 117 / avg 61). Progressive disclosure is healthy across the family.
- **`_base-*` family heading-voice drift**: `_base-apply-baseline-ratchet` and `_base-log-finding` use English headings (Steps / Output / Format) while `_base-build-traceability-matrix` and `_base-invoke-go-stop-gate` use Korean (언제 사용 / 절차 / 산출물 / 인용 / Carry). `_base-apply-template` mixed. Family does not share a single template. (F-SKILL-CAND-001 / -008)
- **`analysis-*` family description English-only**: Skills 6, 7, 9 (and to lesser degree 8) have English-only `description` strings. Body uses Korean. Asymmetric auto-invoke surface for Korean users typing "도메인 모델" / "아키텍처". (F-SKILL-CAND-005)
- **business-logic.md citation drift** (F-SKILL-CAND-006 / -007): Both `analysis-domain-model` and `analysis-business-rules` cite "§5.A" and "§5.B" anchors that exist in business-logic.md but mean different things (DB / FE 코드 영역, not rules / domain). This is L2 anchor drift — the same drift class as v8.1.0 motivation for skill-citation-validator. **skill-citation-validator may not catch this** because it likely checks file existence + section header existence, not semantic mapping (skill says "§X is domain" but anchor §X is FE).
- **Template file renames not synced** (F-SKILL-CAND-002 / -003): `business-rules.schema.json` (v7.0.0 MAJOR rename) did not propagate to `templates/analysis/rules.template.md`. Drift between schemas/ canonical and templates/ filenames.
- **Citation accuracy strong overall**: B-7 PASS rate = 9/12. The 3 FAILs cluster around 2 root causes (AP-* non-existent prefixes + business-logic.md §A/§B anchor mismatch), both L2-semantic drift, not L1 dead-link. skill-citation-validator (v8.1.0) catches L1 only.
- **`analysis-br-cross-consistency-check` is outlier**: Both the largest (117 lines) and the most ★-decorated. Reads as paradigm essay > skill spec. Consider rewriting using canonical `analysis-*` family template (사전 조건 / 절차 / 산출물 / 본체 명세 / 다음) to reduce drift surface for future maintainers.

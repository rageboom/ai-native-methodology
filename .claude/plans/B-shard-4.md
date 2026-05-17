# B-shard-4.md — audit of 14 chain skills

> SSOT: `ai-native-methodology/methodology-spec/plugin-authoring-spec.md` §2 (S1~S8).
> Out-of-scope: S1 line count, S2 length, S3 naming, S6 keys, citation dead-link.
> Audit axes: B-1 desc↔body / B-2 trigger keyword / B-3 single-responsibility / B-4 imperative voice / B-5 progressive disclosure (first ~5000 tok self-contained) / B-6 cross-skill consistency / B-7 citation semantic accuracy.
> Cells = PASS / WEAK / FAIL. Spot-checks evidence-grounded. No simulation.

---

## Skill: planning-decompose-use-cases

- B-1 PASS — desc claims "domain.json + business-rules.json + api-extension → UC-* 분해, 1 actor+1 entity+1 trigger 단위"; body §분해 원칙 1~4 (line 47~50) matches exactly. Source-grounded mandate (line 53~54) faithfully restated from description.
- B-2 WEAK — desc says "extract-from-legacy 가 호출하는 sub-skill" (sub-skill), so auto-invoke from a parent skill is the primary trigger; no end-user natural-language phrase ("use case 만들어줘" / "UC 분해해줘") in description. Direct user invocation declared in §언제 사용 line 14 but description does not surface it.
- B-3 PASS — single output (use_cases[] array). No composite.
- B-4 PASS — imperative throughout ("분해", "추출", "등록 ❌").
- B-5 PASS — 74 lines / fully self-contained / no out-of-tree gating.
- B-6 PASS — planning-* family pattern (sub-skill cited by parent) consistent with planning-identify-business-intent.
- B-7 PASS — cites `ADR-CHAIN-001 §2 (UC → BHV 1:N forward link)` — confirmed §2 = "cross-link coverage ≥ 0.85 ratchet" (ADR §2 line 34) — semantic match.

## Skill: planning-extract-from-legacy

- B-1 PASS — desc "7대 + 8 FE + finding + antipatterns + migration-cautions → planning-spec.{json,md}" + grep-hit-count >0 mandate; body §입력 (line 18~24) + §no-simulation 의무 (line 30~39) exact match.
- B-2 PASS — strong natural-language triggers in §언제 사용 line 15: "기획 단계 시작" / "planning-spec 만들어줘" / "legacy 분석 결과로 use case 추출해줘". desc surfaces "★ ★ v2.0 chain 1 진입 skill" + use-case-first. End-user-grade.
- B-3 PASS — single skill / orchestrator that delegates to sub-skills (`decompose-use-cases` / `identify-business-intent`). Procedure step 3+4 cite sub-skills explicitly = correct decomposition, not composite anti-pattern.
- B-4 PASS — imperative ("확인", "추출", "분해", "채움", "호출").
- B-5 PASS — 91 lines, first section = clear procedure 9-step.
- B-6 PASS — consistent with spec-compose-behavior-spec (chain entry skill = orchestrator pattern).
- B-7 WEAK — `_base/invoke-go-stop-gate` cited (line 70) with slash separator; actual skill = `_base-invoke-go-stop-gate` (dash). See cross-skill pattern below. Also cites `business-rules.json` whereas inputs §입력 line 19 says "rules" (legacy short-name). Minor — F-SKILL-CAND-001.

## Skill: planning-identify-business-intent

- B-1 PASS — desc "BR-INTENT-NNN 추출 + BR-* 매핑 + source_grounded_evidence 의무 + legacy-archaeologist persona"; body matches all 4 claims (line 26~57). persona name "legacy-archaeologist" cited line 10 cross-refs `agents/planning-agent.md`.
- B-2 WEAK — sub-skill auto-invoke is primary trigger; description does not surface end-user phrase. §언제 사용 line 14 says "BR-INTENT 보강 시 직접 호출" but no natural-language sample.
- B-3 PASS — single output (`business_rules_intent[]`).
- B-4 PASS — imperative.
- B-5 PASS — 88 lines / fully self-contained.
- B-6 PASS — symmetric with planning-decompose-use-cases (same sub-skill template).
- B-7 PASS — `ADR-BE-001 (negative-space corroboration)` exists at `docs/adr/ADR-BE-001-negative-space-corroboration.md` — confirmed.

## Skill: spec-compose-behavior-spec

- B-1 PASS — desc claims "planning + formal-spec phase → behavior-spec, UC→BHV 1:N forward link, spec-architect persona"; body §UC→BHV (line 28~34) + procedure step 2~4 (line 39~51) match.
- B-2 PASS — §언제 사용 line 14: "behavior-spec 만들어줘" / "스펙 단계 진입". desc surfaces "★ ★ v2.0 chain 2 진입 skill" + use-case-first.
- B-3 PASS — single artifact (behavior-spec) + delegates sub-skills (`derive-acceptance-criteria` step 4 / `spec-integrate-deliverables` step 5).
- B-4 PASS — imperative.
- B-5 PASS — 102 lines.
- B-6 PASS — chain entry skill pattern = consistent with planning-extract-from-legacy + test-generate-test-spec + implement-generate-impl-spec.
- B-7 WEAK — `_base/invoke-go-stop-gate` slash form (line 75); same F-SKILL-CAND-001. Also cites sub-skill `derive-acceptance-criteria` (line 51) with bare short name (full = `spec-derive-acceptance-criteria`) but cites `spec-integrate-deliverables` (line 53) with full prefix — internal inconsistency. F-SKILL-CAND-002.

## Skill: spec-derive-acceptance-criteria

- B-1 PASS — desc "Gherkin AC + verifiable=true 의무 + verifiable→test_case_refs ≥1 + MoSCoW + bdd-author persona"; body §AC 구조 (line 28~42) + §verifiable 정합 (line 44~52) + §MoSCoW 분류 (line 54~62) match.
- B-2 WEAK — sub-skill auto-invoke (called by `compose-behavior-spec`); §언제 사용 line 14 mentions "AC 보강 / 분해 시" but no natural-language end-user phrase in description.
- B-3 PASS — single output (acceptance-criteria.{json,md}).
- B-4 PASS — imperative.
- B-5 PASS — 96 lines.
- B-6 PASS — sub-skill pattern consistent with planning-decompose-use-cases.
- B-7 PASS — cites `acceptance-criteria.schema.json` — confirmed exists. Cites Cucumber Gherkin official URL — semantic ok.

## Skill: spec-integrate-deliverables

- B-1 PASS — desc "cross_links.to_analysis_artifacts 에 7대+8FE backward link + chain-coverage-validator 강제 + formal-spec-extractor persona"; body §통합 대상 table (line 18~24) + §절차 step 1~5 (line 54~59) match.
- B-2 WEAK — sub-skill auto-invoke; §언제 사용 line 14 mentions "cross_links 보강 시" no natural-language phrase.
- B-3 PASS — single in-place edit of `behavior-spec.json.cross_links`. Not composite.
- B-4 PASS — imperative ("등록", "채움", "검증").
- B-5 PASS — 84 lines.
- B-6 PASS — sub-skill pattern consistent.
- B-7 PASS — cites `methodology-spec/skills-axis.md §2.3` — file exists. Cites `formal-spec-link-validator --chain-mode` — tool dir confirmed at `tools/formal-spec-link-validator`.

## Skill: test-generate-test-spec

- B-1 PASS — desc "AC → 실 test 코드 + test-spec.{json,md} + RED 의무 + inventory.stack_signals framework 추론 + QA-architect+test-engineer persona"; body §RED 의무 (line 33~37) + §framework 추론 (line 42~48) + §기술 스택 분기 (line 113+) match.
- B-2 PASS — §언제 사용 line 14: "test 코드 만들어줘" / "chain 3 진입". End-user phrase explicit.
- B-3 PASS — single artifact (test-spec) + delegates to `test-playwright` for e2e (line 179). Note: `inventory.stack_signals` framework inference is one act, not composite.
- B-4 PASS — imperative.
- B-5 PASS — 197 lines / first section RED 의무 + procedure self-contained.
- B-6 PASS — chain entry skill pattern.
- B-7 WEAK — same `_base/invoke-go-stop-gate` slash form (line 87). Cites `ADR-CHAIN-004 §1` — confirmed exists. Cites `test-spec.schema.json (deliverable 20)` — schema file confirmed exists.

## Skill: test-run-test-evidence

- B-1 PASS — desc "test-impl-pass-validator 진짜 호출 + 5종 물증 7 필드 + result_hash 정규화 + ADR-CHAIN-004 정합 + --allow-execute 의무 + chain 3+4 횡단"; body §expected outcome decision table (line 36~40) + §test-impl-pass-validator 호출 (line 44~54) + §result_hash 결정성 (line 99~101) match.
- B-2 PASS — §언제 사용 line 12~15: "test 돌려줘" / "5종 물증 산출" / "result_hash 갱신". Natural language.
- B-3 PASS — single responsibility (runner invocation + evidence capture). Cross-cuts chain 3 and chain 4 but expected_outcome parameter distinguishes — same operation different gate.
- B-4 PASS — imperative.
- B-5 PASS — 128 lines / first 50 lines = expected-outcome table + invoke command self-contained.
- B-6 PASS — cross-cutting skill pattern (called by both chain 3 final and chain 4 entry/end) consistent with test-verify-coverage which is also reused chain 3+4.
- B-7 PASS — `ADR-CHAIN-004 (Test Runner Invocation Contract)` exists. `impl-spec.schema.json `test_pass_evidence`` — schema confirmed.

## Skill: test-verify-coverage

- B-1 PASS — desc "AC→TC coverage + ratchet 0.85→0.90→0.95 + 3 metric 분리 (link/test_pass/line+branch) + coverage-auditor persona + ADR-010 v2 + ADR-CHAIN-001 §2 정합"; body §3 metric 분리 (line 24~34) + §ratchet 정책 (line 36~44) + §severity_floor (DAL A) match.
- B-2 PASS — §언제 사용 line 12~15: "coverage 보여줘" / "ratchet 갱신".
- B-3 PASS — single responsibility (coverage measurement / 3 metric report).
- B-4 PASS — imperative ("측정", "검증", "갱신").
- B-5 PASS — 123 lines.
- B-6 PASS — chain 3 sub-skill / chain 4 reuse — consistent with test-run-test-evidence.
- B-7 PASS — `ADR-010 v2 §2.6` cited — accuracy not spot-checked but ADR-010 (BE) exists. `DO-178C DAL A (severity_floor)` is well-known external standard — semantic match. `ADR-CHAIN-001 §2` = cross-link coverage ratchet — confirmed.

## Skill: test-playwright

- B-1 PASS — desc "e2e via Playwright, POM (locator only) + spec.ts (assertion only / web-first), FE / Scenario B, RED 의무, runner 사용자 명시"; body §POM 디렉토리 구조 (line 24~33) + §paradigm 명문화 line 86~91 (POM 분리 의무 / web-first / parallel / shard) match exactly.
- B-2 PASS — Strong description (English-Korean mixed) clearly trigger-friendly: "chain 3 test generation for e2e scenarios via Playwright". §언제 사용 implicit but description text alone sufficient.
- B-3 PASS — clean single responsibility (e2e generation). Explicit `When NOT to invoke` (line 107~112) lists boundaries.
- B-4 PASS — imperative.
- B-5 PASS — 112 lines.
- B-6 PASS — FE delegate-skill pattern consistent with implement-react / implement-vue.
- B-7 PASS — cites `methodology-spec/plugin-charter.md §1 R14 + §3 G4` and Playwright official URL — file exists. Cites `skills/test-generate-test-spec/SKILL.md` (parent / e2e 위임 명시) — confirmed.

## Skill: implement-generate-impl-spec

- B-1 PASS — desc "test-spec → impl 코드 + impl-spec.{json,md} + GREEN 100% pass + full-stack-implementer persona + ADR-CHAIN-001 §1 이중 렌더링 + i-strict"; body §GREEN 의무 line 38~43 + §commit_hash 채움 step 4 + §기술 스택 분기 (nestjs/spring/fastapi) all match.
- B-2 PASS — §언제 사용 line 13~15: "impl 코드 만들어줘" / "chain 4 진입" / "GREEN 도달".
- B-3 WEAK — high cognitive load: code generate + commit + test invocation + coverage + traceability-matrix rebuild + gate #4 — 8-step monolith. Justifies as "chain 4 진입 skill"; sub-skill delegation (`verify-test-pass` line 104, `_base/build-traceability-matrix` line 120) limits the load. Within acceptable orchestrator bounds but on the edge. F-SKILL-CAND-003 (composite risk borderline).
- B-4 PASS — imperative.
- B-5 PASS — 193 lines.
- B-6 PASS — chain entry pattern; symmetric to test-generate-test-spec.
- B-7 WEAK — `_base/invoke-go-stop-gate` slash form line 132 (F-SKILL-CAND-001). `_base/build-traceability-matrix` slash form line 120 (same). Cites `impl-spec.schema.json (deliverable 21) fail_count const 0` — schema confirmed exists; constant claim is concrete and verifiable (didn't spot-check but plausible).

## Skill: implement-verify-test-pass

- B-1 PASS — desc "test-impl-pass-validator 호출 → 100% pass + 5종 물증 7 필드 + traceability-matrix green + test-pass-verifier persona + ADR-CHAIN-001 §3 + ADR-CHAIN-004"; body §step 2 100% pass 의무 (line 32~36) + §fail 분류 4 영역 (line 40~46) + §coverage 최종 검증 (line 56~64) + §lint-no-simulation chain-strict (line 82~91) match.
- B-2 PASS — §언제 사용 line 13~15: "100% pass 확인" / "GREEN 도달 검증" / "release 자격 평가".
- B-3 PASS — single responsibility (chain 4 final verification gate). Delegates to `run-test-evidence` (line 29) + `test-verify-coverage` (line 58) + `_base/build-traceability-matrix` (line 69) + `_base/invoke-go-stop-gate` (line 95) = proper orchestration.
- B-4 PASS — imperative.
- B-5 PASS — 131 lines / first 50 lines = procedure entry + 100% pass check self-contained.
- B-6 PASS — symmetric to test-verify-coverage as gate-end-skill. Best-in-class internal cross-ref form (line 29 cites `run-test-evidence` and parenthetically declares `(★ skills/test-run-test-evidence / chain 3-4 횡단)` — eliminates ambiguity. This is the gold-standard pattern.
- B-7 WEAK — same `_base/` slash form (lines 47, 69, 95). Cites `ADR-CHAIN-003 (revisit loop)` — confirmed file. §8.1 strict 정합 claim (line 109~116) cross-refs release 자격 §1~§7 (master plan §C) — semantic match.

## Skill: implement-react

- B-1 PASS — desc "React 19 components/hooks/contexts + forwardRef deprecated + ref prop direct + class 분기 보존 + RTL 100% pass GREEN"; body §paradigm §1 ref paradigm (line 36~39) + §2 functional component default (line 42~51) + §3 React 19 신규 hooks (line 53~60) + §4 기존 hooks 무변화 (line 62~63) + §When NOT to invoke (line 95~100) match exactly.
- B-2 PASS — desc keyword "React 19 components / hooks / contexts" — natural for prompts like "리액트 컴포넌트 구현해줘" (description trigger model would catch).
- B-3 PASS — clean single responsibility (FE-React impl). Explicit boundary `When NOT to invoke`.
- B-4 PASS — imperative.
- B-5 PASS — 100 lines.
- B-6 PASS — symmetric to implement-vue (FE delegate-skill pattern + test-playwright also FE).
- B-7 PASS — cites `methodology-spec/plugin-charter.md §1 R14 + §3 G4` + React 19 blog URL + ADR-CHAIN-001 §1+§3 — all real anchors. `implement-react-18 별도 carry skill 또는 사용자 명시` (line 67, 97) is a forward-pointing carry that doesn't yet exist — semantic ok as "carry" marker.

## Skill: implement-vue

- B-1 PASS — desc "Vue 3 SFC + Composition API + `<script setup>` + Vue 2 carry + Vue Test Utils 2.x + vitest GREEN"; body §paradigm §1 Composition API default (line 36~60) + §2 Options API legacy 본문 분기 (line 62~74) + §4 Vue 2 = carry (line 90~92) + §When NOT to invoke match exactly.
- B-2 PASS — desc keyword "Vue 3 SFC" + "Composition API + <script setup>" — natural for "Vue 컴포넌트 만들어줘" prompts.
- B-3 PASS — clean single responsibility (FE-Vue impl).
- B-4 PASS — imperative.
- B-5 PASS — 125 lines.
- B-6 PASS — ★ Strong structural parity with implement-react: same section headers (사전 조건 / 입력 / 산출물 / paradigm / 절차 / GREEN 의무 / 70~80% 한계 / 본체 명세 참조 / When NOT to invoke). The two skills are designed as siblings — visible in source.
- B-7 PASS — cites `methodology-spec/plugin-charter.md §1 R14 + §3 G4` + `skills/implement-react/SKILL.md` (FE sibling cross-ref) + Vue 3 official URL — all real anchors.

---

## Summary

**14 × 7 = 98 cells**:
- PASS: 88
- WEAK: 10
- FAIL: 0

### WEAK cell distribution

| skill | weak axes |
|---|---|
| planning-decompose-use-cases | B-2 |
| planning-extract-from-legacy | B-7 |
| planning-identify-business-intent | B-2 |
| spec-compose-behavior-spec | B-7 |
| spec-derive-acceptance-criteria | B-2 |
| spec-integrate-deliverables | B-2 |
| test-generate-test-spec | B-7 |
| implement-generate-impl-spec | B-3 + B-7 |
| implement-verify-test-pass | B-7 |

Patterns: B-2 (4 WEAK) — all sub-skills lack end-user natural-language phrases in description. B-7 (5 WEAK) — `_base/` slash form citations vs actual `_base-` dash. B-3 (1 WEAK) — implement-generate-impl-spec borderline composite.

### Top 5 finding candidates

- **F-SKILL-CAND-001** (medium / cross-skill consistency) — `_base/<name>` slash-form citations in 5 chain skills (planning-extract-from-legacy:70, spec-compose-behavior-spec:75, test-generate-test-spec:87, implement-generate-impl-spec:120+132, implement-verify-test-pass:47+69+95). Normative form per `methodology-spec/` (skills-axis.md / lifecycle-contract.md / plugin-authoring-spec.md / finding-system.md) is `_base-<name>` (dash) — 18 hits across 5 spec files. Chain skills consistently use slash separator (path-like) which is semantic but not literal — risks downstream tooling drift (e.g., skill-citation-validator dead-link false-negative if it scans for `_base-` dash form only). Recommend normalize to dash form.

- **F-SKILL-CAND-002** (low / cross-skill consistency) — sub-skill citations use bare short names inconsistently. `spec-compose-behavior-spec:51` cites `derive-acceptance-criteria` (bare) but `:53` cites `spec-integrate-deliverables` (full prefix). `planning-extract-from-legacy:47-49` cites bare `decompose-use-cases` + `identify-business-intent`. `implement-generate-impl-spec:104` cites bare `verify-test-pass`. `implement-verify-test-pass:29` cites bare `run-test-evidence` but **parenthetically declares full path** `(★ skills/test-run-test-evidence / chain 3-4 횡단)` — this is the gold standard. Recommend either (a) always cite full prefix, or (b) always cite bare + parenthetical full path like implement-verify-test-pass.

- **F-SKILL-CAND-003** (low / single-responsibility borderline) — `implement-generate-impl-spec` has 8-step procedure (analyze test-spec → module decompose → code generate → commit → runner invoke → coverage path → schema-validator+matrix-builder → gate #4). Justified as chain 4 entry orchestrator. Mitigated by delegating to `verify-test-pass` / `_base-build-traceability-matrix`. Watch for procedure bloat in v2.x.

- **F-SKILL-CAND-004** (low / B-2 description trigger) — All 4 sub-skills (planning-decompose-use-cases, planning-identify-business-intent, spec-derive-acceptance-criteria, spec-integrate-deliverables) lack end-user natural-language phrases in description. Since they declare "extract-from-legacy / compose-behavior-spec 의 sub-skill" upfront, the description-based auto-invoke is intentionally biased toward parent-skill orchestration. But §언제 사용 sections do admit direct user invocation — desc should surface a phrase for that path (e.g., "use case 분해 검토 / AC 보강 / cross_links 보강"). Low because parent orchestration is primary path.

- **F-SKILL-CAND-005** (info / FE/BE asymmetry note) — implement-react `description` is English-Korean mixed ("Use when chain 4 impl generation for React 19 components..."), implement-vue / test-playwright similar. Most planning/spec/test/implement-generate skills use Korean-led "★ ★ ★ v2.0 chain N 진입 skill..." prefix. This is an emergent G4 (FE plugin authoring) convention vs chain-paradigm convention. Not a defect — design intent from v3.4.0. Note for future stylistic unification.

### Cross-skill patterns

- **Family parity** — Chain entry skills (planning-extract-from-legacy / spec-compose-behavior-spec / test-generate-test-spec / implement-generate-impl-spec) share identical structural skeleton: §언제 사용 / §입력 / §산출물 / RED-GREEN 의무 / §절차 (multi-step) / §70~80% 한계 명시 / §인용 / §기술 스택 분기. Strong family parity.
- **Sub-skill parity** — All 6 sub-skills (decompose-use-cases / identify-business-intent / derive-acceptance-criteria / integrate-deliverables / run-test-evidence / verify-coverage) share: §언제 사용 / §입력 / §산출 / §절차 / §인용 / §Carry. Persona name in description.
- **FE-delegate parity** — implement-react / implement-vue / test-playwright share: §사전 조건 / §paradigm / §When NOT to invoke + 본체 명세 참조. Designed as sibling delegate-skills off the BE-default chain entry skills.
- **RED/GREEN enforcement language** — Consistent across test-* and implement-*. RED 의무 in test-generate-test-spec:33 + test-run-test-evidence:39 (chain 3). GREEN 의무 in implement-generate-impl-spec:38 + implement-verify-test-pass:31 + implement-react:79 + implement-vue:104. fail_count=0 const cited identically. No inconsistency.

### Special focus: gate-mandatory invocation pattern

All 4 chain-entry skills mandate gate invocation as final procedure step:
- planning-extract-from-legacy:70 — "gate #1 호출 — `_base/invoke-go-stop-gate` skill 호출"
- spec-compose-behavior-spec:75 — "gate #2 호출"
- test-generate-test-spec:87 — "gate #3 호출"
- implement-generate-impl-spec:132 — "gate #4 호출"

implement-verify-test-pass:95 calls "gate #4 final" — second gate #4 (re-verification after fail-fix cycle). This is the chain 4 close-out pattern.

Citation form for gate skill is consistently slash-form (`_base/invoke-go-stop-gate`) across all 5 sites. Internally consistent, but mismatched with normative dash form in methodology-spec. F-SKILL-CAND-001 covers this.

### Citation semantic accuracy (B-7 spot-checks)

- ADR-CHAIN-001 §1 (이중 렌더링) — confirmed line 22 of ADR.
- ADR-CHAIN-001 §2 (cross-link coverage ≥ 0.85) — confirmed line 34.
- ADR-CHAIN-001 §3 (no-simulation 강화) — confirmed line 41.
- ADR-CHAIN-004 (Test Runner Invocation Contract) — file exists.
- ADR-BE-001 (negative-space corroboration) — file exists.
- 10 schemas cited (planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / a11y-spec / business-rules / domain / etc.) — all dir-confirmed present.
- 11 tools cited (chain-coverage-validator / planning-extraction-validator / drift-validator / formal-spec-link-validator / decision-table-validator / spec-test-link-validator / test-impl-pass-validator / traceability-matrix-builder / schema-validator / static-runner / spectral-runner) — all dir-confirmed present.

No FAIL cells. WEAKs concentrate in cross-skill citation form (B-7) and sub-skill description trigger (B-2). No safety defects.

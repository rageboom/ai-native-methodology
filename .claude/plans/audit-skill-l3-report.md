# audit-skill-l3-report.md — 47 SKILL.md L3 품질 감사 최종 리포트

> **Audit date**: 2026-05-18 (Plan A — report only / 시행 = 차기 session carry)
> **Scope**: 47 SKILL.md (현 validator 사각지대 / S4·S5·S7·S8 + 의미적 정합 + 산업 비교)
> **Senior verdict**: ★ ★ **GO @ confidence 0.86**
> **Inputs**: B-shard-1/2/3/4 (336 cell audit) + C-official-docs (F-015) + C-industry-case (N=3 OSS) + D-senior-conscience (synthesis + §8.1 corroboration)
> **Plan**: `.claude/plans/plan-skill-l3-audit.md`

---

## §0. Executive Summary

47 SKILL.md 전수 L3 감사 결과 **24 finding** 확정. severity 분포: **medium 4 / low 11 / info 9**. **8 findings 가 ≥ 2 독립 shard corroboration ✓ + 8 findings 가 within-shard multi-site corroboration + 7 findings 가 single-source 인 공식 spec 권위 corroboration**.

★ ★ ★ **3 P0 즉시 fix 후보** (additive / breaking 0 / conf ≥ 0.90):
- F-SKILL-002 — `_base-log-finding` ghost AP prefix
- F-SKILL-004 — `analysis-input-collection` `_base-` 누락 citation
- F-SKILL-005 — `_base/` slash form → `_base-` dash form 정규화 (5 chain skills)

★ ★ ★ **F-021 임계 surface (24 ≥ 20 = unhealthy)**: 단 ~9 가 info/cosmetic → 15 actionable = upper-caution band. **Phase reset ❌ / plugin-authoring-spec S1~S8 maturity signal → v9.0 charter review carry**.

★ ★ ★ **Meta finding F-SKILL-024 (Senior gap-find)**: `_base-*` documented-exception 이 drift attractor — 3 finding (F-SKILL-004 + F-SKILL-005 + F-SKILL-015) 모두 §8-2 frozen allowlist convention 에 root-cause. **차기 session 사용자 결단 필요**.

---

## §1. 감사 방법론 (★ Plan-Research-Audit 3-phase)

### Phase A — Inventory
47 SKILL.md 전수 (`ai-native-methodology/skills/<name>/SKILL.md`).

### Phase B — Internal consistency (4 shard / 7 axis 병렬)
| shard | skills | cells | PASS | FAIL/WARN |
|---|---|---|---|---|
| B-shard-1 | 12 (5 `_base-*` + 7 analysis core) | 84 | 73 | 11 |
| B-shard-2 | 12 (analysis aspect/from/input) | 84 | 82 | 2 |
| B-shard-3 | 9 (analysis FE + 그 외 analysis) | 63 | 55 | 8 |
| B-shard-4 | 14 chain skills (planning/spec/test/implement) | 98 | 88 | 10 |
| **합계** | **47** | **329** | **298 (90.5%)** | **31** |

**7 axis**: B-1 description↔body / B-2 trigger keyword 품질 / B-3 단일 책임 / B-4 imperative voice / B-5 progressive disclosure / B-6 family consistency / B-7 citation semantic accuracy.

### Phase C — Industry benchmark
- **C-official-docs** (F-015): `_base-official-docs-checker` raw fetch × 7 URL. pin digest `b8b2376312b0` (2026-05-17) → 5 DELTA + 6 finding 후보.
- **C-industry-case**: `_base-industry-case-researcher` 3 source (anthropics/skills 공식 N=3 skills 136k stars + netresearch/claude-code-marketplace N=40 catalog-only). 5 finding 후보.

### Phase D — Senior conscience
`_base-senior-engineer` 31 CAND → **24 unified F-SKILL** + 3 demoted (NOT-A-FINDING). live cross-check (templates/analysis/ ls / `_base/` grep / `AP-RENDER` grep) 으로 sub-agent 결과 1차 corroboration.

---

## §2. Severity Heatmap

```
                     ┌───────────────────────────────────────────────┐
                     │  P0 즉시 fix  │   P1 MINOR    │    P2 carry    │
┌──────────────┬─────┼──────────────┼──────────────┼─────────────────┤
│ medium       │ 4   │  002, 004,   │   001        │       —         │
│              │     │  005         │              │                 │
├──────────────┼─────┼──────────────┼──────────────┼─────────────────┤
│ low          │ 11  │       —      │ 003, 007,    │ 006, 008, 014   │
│              │     │              │ 010, 013,    │ 021, 022        │
│              │     │              │ 016, 017,    │                 │
│              │     │              │ 018, 020     │                 │
├──────────────┼─────┼──────────────┼──────────────┼─────────────────┤
│ info         │ 9   │       —      │       —      │ 009, 011, 012,  │
│              │     │              │              │ 015, 019, 023,  │
│              │     │              │              │ ★ 024 (meta)    │
└──────────────┴─────┴──────────────┴──────────────┴─────────────────┘
```

**P0 (3 P / breaking 0 / 차기 session 우선)** — medium × 3.
**P1 (9 / methodology body change / digest recompute / 차기 session+1 MINOR)** — medium × 1 + low × 8.
**P2 (12 / cooling-off 24h / 각 별도 plan)** — low × 5 + info × 7.

---

## §3. F-SKILL Canonical List (24 findings)

> Naming: `F-SKILL-NNN` (F-SIM/F-PA/F-MB pattern 정합 / `methodology-spec/finding-system.md` namespace 신설 / id-conventions.md `F-XXX-PREFIX` 정합).

### P0 — 즉시 fix 후보 (3 / breaking 0 / conf ≥ 0.90)

**F-SKILL-002** [medium / ghost-taxonomy] — `_base-log-finding/SKILL.md:15` 가 AP-RENDER/A11Y/i18n/FETCH prefix 인용. **실측: examples/ 안 0 occurrence**. 실제 FE prefix = `AP-FE-SECURITY-*`. corroboration: B-shard-1 + Senior live grep (2 ≥ 2 ✓).
- **Fix**: 4 ghost prefix 제거 또는 `AP-FE-*` 로 교체. conf 0.95.

**F-SKILL-004** [medium / `_base-` prefix citation drift] — `analysis-input-collection/SKILL.md:14, :55` 가 bare `apply-baseline-ratchet` 인용 (실 skill name = `_base-apply-baseline-ratchet` / v8.2.1 §8-2 documented-exception 정합). corroboration: B-shard-2 single shard (1) but **skill-citation-validator v8.1.1 가 잡지 못한 사각** = meta-corroboration.
- **Fix**: 2 site replace_all. conf 0.92.

**F-SKILL-005** [medium / slash-vs-dash citation] — 5 chain skill (`planning-extract-from-legacy`, `spec-compose-behavior-spec`, `test-generate-test-spec`, `implement-generate-impl-spec`, `implement-verify-test-pass`) 가 `_base/<name>` slash form 으로 인용 (normative = `_base-<name>` dash). corroboration: B-shard-4 + Senior live grep (5 file 확인 / 2 ≥ 2 ✓).
- **Fix**: ~8 occurrence 정규화. conf 0.90.

### P1 — MINOR (9 / methodology body change / digest recompute / 차기 session+1)

**F-SKILL-001** [medium / citation-anchor-drift] — `analysis-domain-model:업` "business-logic.md §5.B domain" 인용 but §5.B = "FE 코드 영역" (L2 anchor 의미 drift). `analysis-business-rules` "§5.A rules" but §5.A = "DB 영역". corroboration: B-shard-1 within-shard 2-site. ★ ★ **skill-citation-validator v8.1.0 motivation 의 정확한 class 가 본체 active 표면 안에서 재발**.

**F-SKILL-003** [low / desc-trigger-EN-only] — 4 analysis-* skills (`architecture` / `domain-model` / `source-inventory` / `business-rules`) 가 EN-only description. Korean 자연어 trigger ("도메인 모델 분석", "비즈니스 규칙 추출") underfire 가능성. corroboration: B-shard-1 single shard 4-site.

**F-SKILL-007** [low / stale-template-count] — `_base-apply-template:NN` "19 templates" but `templates/analysis/` Glob = 21 files (Senior live ls 확인). corroboration: B-shard-1 + Senior live (2 ≥ 2 ✓).

**F-SKILL-010** [low / weak-desc-trigger] — `analysis-quality-antipattern` + 4 sub-skills (planning-decompose, planning-identify, spec-derive-AC, spec-integrate) — desc 가 NL trigger phrase 부재 (phase-relative only). corroboration: B-shard-3 + B-shard-4 (2 ≥ 2 ✓).

**F-SKILL-013** [low / prereq-asymmetry] — `analysis-db-schema-erd` 가 inventory.json 사전조건 부재 (다른 analysis-* 가 모두 share). single shard.

**F-SKILL-016** [low / missing-disable-model-invocation] — 4 gate/runner skills (`_base-invoke-go-stop-gate`, `test-run-test-evidence`, `implement-verify-test-pass`, `test-verify-coverage`) 가 `disable-model-invocation: true` 부재. 공식 권장. C-official OFC-001 single source / spec-authority-corroborated.

**F-SKILL-017** [low / S2 spec incomplete] — `plugin-authoring-spec.md §2 S2` 가 description 단독 ≤ 1,024 char per-field cap 누락 (합산 ≤ 1,536 만 명시). 현 violation 0 (모두 213-419c) — hardening only.

**F-SKILL-018** [low / digest stale CLAUDE_EFFORT] — `${CLAUDE_EFFORT}` substitution variable 가 §6 pinned digest 부재 (v2.1.141 changelog 2026-05-13 추가). additive digest refresh + `digest_sha` 재계산.

**F-SKILL-020** [low / third-person POV undocumented] — best-practices 가 third-person 의무화 ("Always write in third person"). ~25 plugin skills "Use when..." imperative 시작 (mixed-form acceptable per 공식 example) but borderline cases (`analysis-aspect-a11y`, `analysis-aspect-legacy`) 가 pure imperative. corroboration: C-official + C-industry implicit (2 ≥ 2 ✓).

### P2 — Cooling-off 24h carry (12 / breaking 또는 multi-day)

**F-SKILL-006** [low] — `_base-*` family heading voice EN/KO drift (2 of 5 skills English / 2 Korean / 1 mixed).
**F-SKILL-008** [low] — `rules.template.md` → `business-rules.template.md` rename (v7.0.0 followup / minor breaking).
**F-SKILL-009** [info] — ★-decoration density (`analysis-br-cross-consistency-check` 60+ ★ / `_base-invoke-go-stop-gate` 등 chain-entry skills). corroboration: B-shard-1 + C-industry IC-005 (2 ≥ 2 ✓).
**F-SKILL-011** [info] — composite-orchestrator borderline (`implement-generate-impl-spec` + 3 chain-entry siblings — 6~8 step monoliths, ADR cite 정합 but 본문 명시 callout 부재).
**F-SKILL-012** [low] — body-size narrative density (`analysis-sql-inventory` 210 / `characterization-test` 196 / `error-mapping` 120 — S1 ≤500 PASS but S8 budget 접근). corroboration: B-shard-3 within-shard 3-site.
**F-SKILL-014** [low] — `analysis-type-spec-fe` `-fe` suffix vs desc "FE+BE TypeScript stack" scope mismatch.
**F-SKILL-015** [info] — sub-skill citation form inconsistency (bare vs full-prefix mix). gold-standard pattern exists (`implement-verify-test-pass`).
**F-SKILL-019** [info] — v2.1.142 root-level SKILL.md packaging-relaxation not in §6 P1.
**F-SKILL-021** [low] — SKIP conditions absent from description frontmatter (industry: `claude-api` "SKIP: ...") for env-restricted skills (figma / static-security / html-template / error-mapping).
**F-SKILL-022** [low] — no `model:` frontmatter for compute-intensity-differentiated skills (`analysis-br-cross-consistency-check` hard-codes Sonnet 4.6 in body).
**F-SKILL-023** [info] — no per-skill trigger-accuracy eval baseline (industry: `skill-creator` ships `generate_review.py` + optimization loop).

**★ F-SKILL-024** [info / meta — Senior gap-find] — `_base-*` documented-exception 가 drift attractor. **F-SKILL-004 + F-SKILL-005 + F-SKILL-015 모두 §8-2 frozen allowlist convention 에 root-cause**. 매 release 마다 같은 drift class 반복. **v9.0 charter-level review** 필요: (a) canonical convention rename per LL-i-55 cautious-cooling-off (MAJOR / `_base-` → 그 외 prefix), OR (b) validator-level normalization (additive, breaking 0).

---

## §4. Senior 3-에이전트 핵심 우려 (★ ★ ★ 차기 session 진입 시 우선 검토)

### Concern #1 — skill-citation-validator coverage gap (corroborated by F-SKILL-001 + F-SKILL-004 + F-SKILL-005)

v8.1.0 validator 가 catches L1 dead-link but **misses 3 drift classes**:
- (a) **anchor-level §X.Y semantic mismatch** (F-SKILL-001 — `business-logic.md §5.B` cite 가 "FE 영역" 인데 의미상 "domain 영역" claim).
- (b) **`_base-` prefix normalization 이 bare-name citation 을 mask** (F-SKILL-004 — `apply-baseline-ratchet` cite 가 dead-link 인데 통과).
- (c) **slash vs dash form ambiguity** (F-SKILL-005 — `_base/<name>` vs `_base-<name>` 어느 한 form 만 정규화).

★ ★ **validator scope expansion = 최고 ROI structural fix** (F-SKILL list 외 meta-finding). v9.0 candidate.

### Concern #2 — Korean trigger surface degradation (F-SKILL-003 + F-SKILL-010)

~50% analysis-* skills 가 English-only description. **본격 quantification 부재** (Senior 추정: ~12 KO-led + ~23 EN-led + ~12 mixed). 한국 사용자 자연어 입력 ("도메인 모델 분석") underfire 가능성. **dedicated grep + 분류 pass 권장** (P1 sub-task).

### Concern #3 — `_base-*` documented-exception 의 drift-attractor 성질 (F-SKILL-024)

매 release 마다 같은 drift class 재발. v8.2.1 (2026-05-17) §8-2 frozen allowlist 결정 후 v8.2.2~v8.4.0 모두 prefix 관련 finding 0 인 줄 알았으나 **본 L3 audit 가 본격 표면화**. **차기 session 사용자 결단 필요** (v9.0 charter review 의제 추가 vs status quo).

---

## §5. F-021 임계 처리 (24 ≥ 20 = unhealthy)

- 24 findings 총량 = `feedback_finding_threshold.md` "spec quality 의심" 임계 초과.
- 단 **9 info/cosmetic 격하 후 15 actionable = upper-caution band**.
- ★ **Phase reset ❌**. 대신:
  - **plugin-authoring-spec.md S1~S8 maturity signal** — 6 spec gap surface (S2 두 개 / S6 / S8 / `_base-` convention / KO+EN balance).
  - **v9.0 charter review** carry (F-SKILL-024 + 6 spec gap 묶음).

---

## §6. 차기 session 권장 cadence (★ Plan A 시행 carry)

**Session +1 (즉시)**: P0 PATCH (3 findings / breaking 0 / v8.4.1)
- F-SKILL-002 + F-SKILL-004 + F-SKILL-005 즉시 fix.
- 사용자에 본 report 24 finding count surface — v9.0 charter review 의제 추가 여부 결단.

**Session +2 (1주 내)**: P1 MINOR (9 findings / digest recompute / v8.5.0)
- F-SKILL-001 + F-SKILL-003 + F-SKILL-007 + F-SKILL-010 + F-SKILL-013 + F-SKILL-016 + F-SKILL-017 + F-SKILL-018 + F-SKILL-020.
- `plugin-authoring-spec.md §2 S2` 강화 (1024-char + third-person) + `§6 pinned digest` 갱신 (`${CLAUDE_EFFORT}`) + `digest_sha` 재계산.

**Session +3+ (별도 cooling-off 24h / cluster decision)**: P2 (12 findings)
- F-SKILL-024 = v9.0 charter 진입 자격 우선 검토 (drift-attractor 해소).
- 그 외 P2 = 각자 별도 plan + 사용자 묶음 결단.

---

## §7. Lessons Learned (★ 본 audit 진행 중 관찰)

**LL-skill-audit-01**: 4-shard sub-agent 병렬 = 1 message dispatch 가 시간 효율 (~15분 cap × 4 = 1시간 → 실측 ~5분 parallel). lightweight 패턴 (`feedback_lightweight_sub_agent`) 본 audit 에서 재입증.

**LL-skill-audit-02**: `_base-official-docs-checker` 와 `_base-industry-case-researcher` 가 Write tool 부재 → 메시지 텍스트 반환만 가능 → main agent 가 파일화 의무. **base agent frontmatter `tools` 에 Write 미부여 = 의도된 design** (memory check 권장).

**LL-skill-audit-03**: §8.1 corroboration 의무 — 31 CAND → 24 F-SKILL 격하 (3 NOT-A-FINDING). 단일 shard finding 은 spec authority (공식 docs) corroboration 또는 within-shard multi-site 확보 시 격상 가능. **Senior 양심 (D7) 이 ★ critical filter**.

**LL-skill-audit-04**: F-021 임계 (≥ 20 unhealthy) → spec 부실 signal 로 본 audit 도 surface. **그러나 info/cosmetic 격하 비율** (9/24 = 37.5%) 이 높으면 actionable count 가 caution band 안 종결. **F-021 임계 v2 후보**: actionable-only count + info exclude.

**LL-skill-audit-05** (★ critical): F-SKILL-001 의 anchor drift = skill-citation-validator v8.1.0 motivation 의 정확한 class 가 **본체 active 표면 안에서 재발**. **validator 가 자기 motivation 의 class 를 자기가 cover 못함** = recursive drift. v9.0 charter review 필수 의제.

---

## §8. 산출물 (본 audit)

| 산출물 | 위치 | 본격/휘발 |
|---|---|---|
| `plan-skill-l3-audit.md` | `.claude/plans/` | 본격 |
| `B-shard-1.md` ~ `B-shard-4.md` | `.claude/plans/` | 휘발 (Phase D 흡수 후 삭제 OK) |
| `C-official-docs.md` | `.claude/plans/` | 본격 (F-015 결과 / pin baseline refresh source) |
| `C-industry-case.md` | `.claude/plans/` | 본격 (산업 N=3 reference) |
| `D-senior-conscience.md` | `.claude/plans/` | 본격 (synthesis SSOT) |
| **`audit-skill-l3-report.md`** (본 파일) | `.claude/plans/` | ★ ★ **본격 — 사용자 검토 input / 차기 session entry-point** |
| `methodology-spec/finding-system.md` F-SKILL namespace 등재 | 본체 | ★ ★ carry (차기 session 시행) |

---

## §9. 차기 session 진입 prompt (★ 사용자 묶음 결단 prerequisite)

본 report 검토 후 사용자 결단 분기:
1. **P0 3 finding 즉시 fix (v8.4.1 PATCH)** → Session +1 진입.
2. **F-SKILL namespace finding-system.md 등재** → carry (additive / breaking 0 / Session +1 동반).
3. **F-021 임계 surface + v9.0 charter review 의제 추가 여부** → 사용자 결단.
4. **F-SKILL-024 (drift-attractor 해소) v9.0 우선 자격** → 사용자 결단.

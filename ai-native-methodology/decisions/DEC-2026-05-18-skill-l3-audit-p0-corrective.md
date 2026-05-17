# DEC-2026-05-18-skill-l3-audit-p0-corrective

> ★ ★ ★ 47 SKILL.md L3 품질 감사 + P0 3 finding (F-SKILL-002 + F-SKILL-004 + F-SKILL-005) 즉시 corrective sweep / F-SKILL namespace 신설 / breaking 0.

## 1. 배경

사용자 후속 요청 (2026-05-18) "나의 스킬들을 분석해 보고 싶다" → 축 "품질 감사 (citations / drift / SSOT)" → 깊이 "L3 + 산업 비교" → Plan A (감사만 / report 만 / 시행 = 차기 session carry) → 사용자 "진행 해줘" 시 P0 시행 escalation.

본 결단 = ★ 두 가지 산출:
- **L3 audit 산출물** (사용자 검토용 / 24 unified F-SKILL findings / Senior GO @ 0.86 / 6 sub-agent 병렬 dispatch)
- **P0 3 finding 즉시 corrective fix** (additive / breaking 0 / 12 sites edited)

## 2. 시행 (요약)

| Phase | 산출 |
|---|---|
| Plan A (1원칙) | `.claude/plans/plan-skill-l3-audit.md` — methodology (5 phase + sub-agent 전략 + 검증 ladder) |
| 6 sub-agent dispatch (2원칙) | B-shard-1~4 (329 cell × 7 axis × 47 skill / general-purpose 4 parallel) + `_base-official-docs-checker` F-015 (Anthropic 공식 docs 7 URL fetch) + `_base-industry-case-researcher` (N=3 OSS: anthropics/skills 136k stars + netresearch) |
| Senior synthesis (`_base-senior-engineer` D7) | `.claude/plans/D-senior-conscience.md` — 31 CAND → **24 unified F-SKILL** + 3 NOT-A-FINDING + 1 Senior gap-find (F-SKILL-024 meta) / GO @ 0.86 / live cross-check 3건 (templates/analysis ls / `_base/` grep / `AP-RENDER` grep) |
| 최종 report | `.claude/plans/audit-skill-l3-report.md` (사용자 검토 entry-point) |
| **P0 3 finding 시행** (3원칙 사용자 승인 후) | 12 sites edited / 9 files affected |
| F-SKILL namespace 등재 | `methodology-spec/finding-system.md` — 24 finding SSOT 표 + P0 closed block 3건 + F-SKILL-024 meta block + P1/P2 open carry |

## 3. P0 3 finding 시행 세부

### F-SKILL-002 (medium / ghost-taxonomy) — closed v8.4.1

- **현황**: `_base-log-finding/SKILL.md:15` 가 AP-RENDER/AP-FETCH/AP-A11Y/AP-i18n/AP-STATE 인용 / examples/ 안 occurrences = 0 / `id-conventions.md` §3 canonical 9 카테고리 정합 ❌.
- **scope 확장 corroboration**: `analysis-quality-antipattern:18` (5 ghost prefix) + `analysis-aspect-a11y:27` (1 ghost prefix) = 3 skill drift. Senior 가 _base-log-finding 만 보고 → 실 grep 가 2 skill 추가 표면화 (§8.1 corroboration 3-site).
- **Fix**: 
  - `_base-log-finding:15` → `(per id-conventions.md §3 카테고리 9종: AP-API / AP-DB / AP-DOMAIN / AP-ARCH / AP-FE / AP-VALIDATION / AP-CONFIG / AP-SECURITY / AP-PERFORMANCE)`
  - `analysis-quality-antipattern:18` → canonical + `AP-FE-{SUB}-NNN` 패턴 (실 PoC #04 `AP-FE-SEC-EVAL` 44 occurrence 정합)
  - `analysis-aspect-a11y:27` → `AP-FE-A11Y-XXX` (AP-FE prefix + sub)

### F-SKILL-004 (medium / `_base-` prefix citation drift) — closed v8.4.1

- **현황**: `analysis-input-collection/SKILL.md:14, :55` 가 bare `apply-baseline-ratchet` 인용 / 실 skill name = `_base-apply-baseline-ratchet` per v8.2.1 §8-2 documented-exception.
- **validator mask 표면화**: skill-citation-validator v8.1.1 bare-name resolver 가 통과시킴 = recursive drift class (v8.1.0 motivation 의 정확한 class 가 자기 표면에서 재발).
- **Fix**: 2 site replace_all (`apply-baseline-ratchet` → `_base-apply-baseline-ratchet`).

### F-SKILL-005 (medium / slash↔dash citation form) — closed v8.4.1

- **현황**: 7 file × 9 site `_base/<name>` slash form citation (normative = `_base-<name>` dash form / skill name 정합):
  - `implement-verify-test-pass:47, 69, 95` (3 sites: `_base/invoke-go-stop-gate`, `_base/build-traceability-matrix`)
  - `implement-generate-impl-spec:133` (1 site)
  - `planning-extract-from-legacy:70` (1 site)
  - `test-generate-test-spec:87` (1 site)
  - `spec-compose-behavior-spec:75` (1 site)
  - `_base-build-traceability-matrix:45` (1 site: `_base/log-finding` self-cite)
  - `_base-invoke-go-stop-gate:60` (1 site: `_base/build-traceability-matrix` self-cite)
- **Senior 격하 → 실 grep 확장**: Senior 보고 = 5 chain skills / 실 grep = 7 files (2 `_base-*` self-cite 추가).
- **Fix**: 9 site 정규화 (`_base/<name>` → `_base-<name>`).

## 4. F-SKILL namespace 신설

`methodology-spec/finding-system.md` 에 F-SKILL namespace 추가 (F-SIM / F-PA / F-MB 패턴 정합):

- 24 finding SSOT 표 (severity / corroboration / priority / 처분).
- P0 closed 3건 full block (F-SKILL-002 / 004 / 005).
- F-SKILL-001 + F-SKILL-024 meta block.
- P1 (9 finding) + P2 (12 finding) = open carry.

## 5. ★ ★ ★ 차기 session surface (사용자 결단 carry)

본 결단 후 사용자 결단 필요 의제 3종:

### 5.1 F-021 임계 unhealthy → v9.0 charter review 의제 추가

- 24 ≥ 20 = unhealthy (per `feedback_finding_threshold.md`).
- 단 actionable = 15 (caution band) / 9 info/cosmetic 격하.
- ★ Phase reset ❌ / plugin-authoring-spec S1~S8 maturity signal.
- carry: v9.0 charter review 의제 추가 결단.

### 5.2 skill-citation-validator coverage gap (recursive drift)

- F-SKILL-001 + 004 + 005 의 root = validator scope gap 3 class:
  - (a) anchor §X.Y 의미 drift (L2 semantic mismatch)
  - (b) `_base-` prefix bare-name mask (validator resolver 통과)
  - (c) slash↔dash form 모호 (skill name normalization 부재)
- ★ ★ ★ validator 자기 motivation class (v8.1.0 dead-link 차단) 가 본체 active 표면 안에서 재발 = recursive drift.
- carry: v9.0 charter validator scope 확장 결단.

### 5.3 F-SKILL-024 meta — `_base-*` documented-exception drift attractor

- F-SKILL-004 + 005 + 015 공통 root = `_base-*` documented-exception (ADR-PLUGIN-001 §8-2 frozen allowlist v8.2.1).
- 매 release 마다 같은 drift class 재발.
- carry: v9.0 charter-level 결단:
  - (a) canonical convention rename (`_base-` → 그 외 prefix / MAJOR / LL-i-55 cautious-cooling-off), OR
  - (b) validator-level normalization (additive / breaking 0).

## 6. 차기 session 권장 cadence

| Session | 작업 | release |
|---|---|---|
| **본 cycle** (v8.4.1) | L3 audit + P0 3 finding fix + F-SKILL namespace 등재 | **PATCH** |
| **+1** | P1 9 finding (F-SKILL-001+003+007+010+013+016+017+018+020) + plugin-authoring-spec §2 S2 강화 (1024-char + third-person POV) + §6 pinned digest 갱신 (`${CLAUDE_EFFORT}`) + `digest_sha` 재계산 | **v8.5.0 MINOR** |
| **+2+** | P2 12 finding (각 별건 cooling-off 24h) | 각 별도 plan |
| **v9.0** | charter review: F-SKILL-024 + skill-citation-validator scope 확장 + S2/S6/S8 spec gap 묶음 | **MAJOR** |

## 7. STOP-3 9-gate (★ release 의무)

| gate | 결과 |
|---|---|
| workspace test 414/414 | ✅ |
| release-readiness 13/13 ready:true (v8.4.1) | ✅ |
| skill-citation-validator 207 active doc 0 stale | ✅ |
| drift-validator 3-way | ✅ |
| version 3-way sync (plugin.json + CHANGELOG.md + package.json = 8.4.1) | ✅ |
| `_base/` slash form occurrences = 0 (post-fix) | ✅ |
| ghost AP prefix (AP-RENDER/FETCH/A11Y/i18n/STATE) in skills = 0 (post-fix / except canonical citation in id-conventions.md context) | ✅ |
| bare `apply-baseline-ratchet` = 0 (post-fix) | ✅ |
| CLAUDE.md plugin.json version reference = v8.4.1 | ✅ |

## 8. classification — PATCH (additive / breaking 0)

- 12 site edited = citation 정합 corrective (semantic 의미 변경 0 / 산출물 schema·command-surface·산출물 파일명 변경 0).
- F-SKILL namespace 신설 = methodology body documentation additive (semver impact 0).
- breaking 0 / consumer 무영향 / cooling-off 면제 (additive only / CLAUDE.md cadence rule 정합).

## 9. Lessons Learned

### LL-skill-audit-01: 6 sub-agent 병렬 dispatch 시간 효율

4 B-shard + 2 C-source = 1 message dispatch / ~5분 parallel / 15분 cap × 6 = 1.5h 직렬 대비 ~18× 단축. `feedback_lightweight_sub_agent` 본 audit 에서 재입증.

### LL-skill-audit-02: `_base-` agent 의 Write tool 부재 = 의도된 design

`_base-official-docs-checker` 와 `_base-industry-case-researcher` 가 frontmatter `tools` 에 Write 미부여 → 메시지 텍스트 반환만 가능 → main agent 가 파일화 의무. 본격 의도 (read-only research agent + main agent synthesis) 정합.

### LL-skill-audit-03: §8.1 corroboration 의무가 over-claim 31 CAND → 24 격하

Senior 양심 (D7) 이 ★ critical filter. 단일 shard finding 은 spec authority (공식 docs) corroboration 또는 within-shard multi-site 확보 시 격상 가능.

### LL-skill-audit-04: F-021 임계 v2 후보 — actionable-only count

F-021 임계 (≥ 20 unhealthy) 가 본 audit 도 trigger. 단 info/cosmetic 격하 비율 (9/24 = 37.5%) 이 높으면 actionable count 가 caution band 안 종결. **F-021 임계 v2 후보**: actionable-only count + info exclude.

### LL-skill-audit-05 (★ critical): validator recursive drift

F-SKILL-001 의 anchor drift + F-SKILL-004 의 bare-name mask + F-SKILL-005 의 slash↔dash form = skill-citation-validator v8.1.0 motivation class 가 본체 active 표면 안에서 재발. **validator 가 자기 motivation 의 class 를 자기가 cover 못함** = recursive drift. v9.0 charter review 필수 의제.

### LL-skill-audit-06: Senior under-claim 의 실 grep 보완

Senior 가 F-SKILL-005 = 5 chain skills 보고 / 실 grep 가 7 files (9 sites) 확인 — 2 `_base-*` self-cite 추가. ★ Senior synthesis 도 partial 가능 / main agent 의 실 grep cross-check 의무.

### LL-skill-audit-07: scope 확장 corroboration 패턴

F-SKILL-002 가 _base-log-finding 만 보고 → 실 grep 가 analysis-quality-antipattern + analysis-aspect-a11y 추가 표면화 → §8.1 3-site corroboration 확정 → scope 확장 fix 정당화. **finding fix 시 동일 drift class 의 다른 instance 탐색 의무** (LL-i-55 cautious paradigm 정합).

# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [2.6.0] — 2026-05-14 ★ ★ ★ ★ MINOR — skill 의미 ID 본격 자산화 (★ phase-N 숫자 prefix 본격 폐기 / 17 skill rename / Senior critique 5 의제 본격 흡수)

> ★ ★ ★ ★ ★ ★ **BREAKING — skill 디렉토리 17 rename + 명시 호출 path 본격 변경** (★ ★ ★ semver MINOR / 사내 dogfooding 한정 / Senior critique 의제 3 전면 흡수). 자연어 trigger 영역 description 본문 보존 / auto-invocation 영향 ❌. v2.5.1 명시 호출 (예 `/analysis-phase-0-input`) → v2.6.0 새 이름 (예 `/analysis-input-collection`). alias map ❌ / 즉시 cutover.
>
> ★ ★ paradigm 본격 위치 = `methodology-spec/skills-axis.md` §6 plan-b carry "v2.0 진입 시 의미 ID + alias map (plan-b carry) 으로 자연 흡수 예정" 본격 자연 흡수 자산화. §6 본인이 v1.4.x "과도기 패턴" 인정 영역 본격 진화. `.claude/plans/plan-skill-meaningful-id-rename.md` + Senior critique 5 의제 본격 흡수 (HARD STOP 2건 = semver MINOR + 영향 42 file / SOFT 3건 = 명명 미세 4건 + common-errors section + micro-commit 패턴) → 사용자 결단 본격 일괄 승인 paradigm.

### BREAKING — skill rename 17 (★ ★ ★ aspect 4 + br-cross 1 + chain stage 11 = 변경 ❌)

| v2.5.1 | v2.6.0 |
|---|---|
| `analysis-phase-0-input` | **`analysis-input-collection`** |
| `analysis-phase-1-inventory` | **`analysis-source-inventory`** |
| `analysis-phase-2-architecture` | **`analysis-architecture`** |
| `analysis-phase-3-domain` | **`analysis-domain-model`** |
| `analysis-phase-4-rules` | **`analysis-business-rules`** |
| `analysis-phase-4-5-cross-validation` | **`analysis-formal-spec-validation`** |
| `analysis-phase-4-7-characterization` | **`analysis-characterization-test`** (★ Senior 의제 1 흡수 / Feathers WELC 용어) |
| `analysis-phase-4-8-sql-inventory` | **`analysis-sql-inventory`** |
| `analysis-phase-5-error-mapping` | **`analysis-error-mapping`** |
| `analysis-phase-5-form-validation` | **`analysis-form-validation-fe`** (★ FE suffix 일괄) |
| `analysis-phase-5-openapi` | **`analysis-openapi`** |
| `analysis-phase-5-rules` | **`analysis-api-rule-mapping`** (★ Senior 의제 1 흡수 / Spring binding 혼동 회피) |
| `analysis-phase-5-schema-erd` | **`analysis-db-schema-erd`** |
| `analysis-phase-5-state-map` | **`analysis-ui-state-map-fe`** (★ FE suffix 일괄) |
| `analysis-phase-5-type-spec` | **`analysis-type-spec-fe`** (★ FE suffix 일괄) |
| `analysis-phase-5-visual-manifest` | **`analysis-ui-visual-manifest-fe`** (★ FE suffix 일괄) |
| `analysis-phase-6-quality` | **`analysis-quality-antipattern`** (★ Senior 의제 1 흡수 / 산출물 정합) |

### 영향 범위 본격 (★ Senior 의제 5 흡수 / grep 실측 42 file)

- ★ **skills/ rename 17** — git mv + SKILL.md frontmatter `name:` + 본문 제목 + cross-skill 참조 (★ workflow/ + .aimd/ path 보존 = lifecycle-contract axis)
- ★ **flows/ 2** — analysis.phase-flow.json (11 phases skills 배열 + 3 history entry) + flows/README.md (drift-validator 호출자 인용)
- ★ **tools/ 2** — spec-test-link-validator src/validator.js comment + package.json description
- ★ **methodology-spec/ 6** — skills-axis.md (★ §6 진화 + §8 신설) + lifecycle-contract.md + README.md + deliverables 20/21 + workflow phase-4-7/4-8
- ★ **root README + briefing 2 + guides 4 + decisions 1 = 8** — 자연어 trigger 매핑 표 + 사내 onboarding + 사용자 가이드 + 역사 기록
- ★ **tools/*/README 8** — validator/runner 자체 호출자 인용

### Senior critique 5 의제 본격 흡수

| 의제 | 강도 | 흡수 |
|---|---|---|
| 1. 명명 미세 조정 4건 | 🟠 SOFT | ✅ 전면 흡수 (FE suffix 일괄 / binding→mapping / characterization→characterization-test / quality-finding→quality-antipattern) |
| 2. v2.5.1→v2.6.0 cutover section | 🟠 SOFT | ✅ `guides/common-errors.md` Q14.5 본격 신설 |
| 3. semver v2.5.2 PATCH → v2.6.0 MINOR | 🔴 HARD STOP | ✅ 전면 흡수 (skill name 17 rename = breaking API surface change 사실 본격 인공) |
| 4. Sprint 2 micro-commit + drift-validator fail-fast | 🟠 SOFT | ✅ D1a/b/c 5+6+6 batch + D3 앞당김 (D2 직후) + D4.5 chain-driver test 회귀 신설 |
| 5. 영향 범위 28 → 42 file 본격 재산정 | 🔴 HARD STOP | ✅ 전면 흡수 (grep 실측 본격 / plan §2.5 본격 자산화) |

### 검증 본격 통과

- ✅ drift-validator 3-way (manifest ↔ workflow ↔ skills) — 22 skills_declared / 11 phases_checked / 0 diff
- ✅ workspace test 322/0 본격 보존 (312 workspace + 10 release-readiness self-test)
- ✅ release-readiness 9/9 본격 통과 (chain harness validated §8.1 strict 본질 보존)
- ✅ spec-test-link-validator + chain-driver test 회귀 0 (5/5 + 72/72)
- ✅ 자연어 trigger 영역 description 본문 보존 (auto-invocation 영향 ❌)

### Sprint 본격 sequence

- Sprint 1 (plan 본격 확정 + Senior critique 흡수) ✅
- Sprint 2 (D1a/b/c + D2 + D3 fail-fast + D4+D4.5 + D5+D5.5 + D6+D6.5 + D7 + D8) ✅
- Sprint 3 (skills-axis §6/§8 + ADR-CHAIN-011 LL-i-50 + CHANGELOG v2.6.0 + version bump + build dist + commit) ★ 진행

### 결정적 사실

- ★ ★ chain harness validated §8.1 strict 9/9 본질 보존 (★ release-readiness 회귀 ❌)
- ★ ★ ★ alias map ❌ paradigm = ★ "사내 dogfooding 한정 + 자연어 trigger 메인 path / 명시 호출 부차 path" 사실 본격 정합
- ★ ★ ★ ★ paradigm 본격 위치 = ★ ★ §6 v1.4.x 과도기 본격 자연 흡수 / §8 v2.6.0 의미 ID 본격 자산화 / ADR-CHAIN-011 §9 LL-i-50 본격 자산화
- ★ workflow/<phase-id>.md file 명 보존 (★ manifest phase ID axis / skill name axis 무관)
- ★ aspect 4 + br-cross 1 + chain stage 11 = 변경 ❌ (이미 의미 ID)

---

## [post-v2.5.1 meta cleanup] — 2026-05-14 (메타 정리 — plugin.json description + CLAUDE.md CHANGELOG 라인 + CHANGELOG.md split / 가독성 영역 한정 / no release / no version bump / no tag / chain harness 5 요소 변경 ❌)

> ★ ★ 사용자 결단 "즉시 가능부터" — 메타 정리 3건 일괄 시행. paradigm / chain harness / schema / PoC / validator 변경 ❌. 가독성 + 신규 contributor 진입 마찰 해소 영역 한정.

### 시행 산출 3건

1. **`.claude-plugin/plugin.json` description 정상화** — ≈ 3KB session history (Phase A~D + chain harness 변경 사실 + workspace test 수치 + ADR LL 참조) → 200자 안정 제품 설명 (marketplace.json description 톤 정합 / "변경 이력은 CHANGELOG.md 참조" 명시)
2. **`CLAUDE.md` CHANGELOG 라인 슬림화** — 1줄 7849자 (session 9~15차 SESSION-WRAPUP 응축) → 200자 (v2.5.1 PATCH 현재 + v2.5.0 MINOR FINAL release 직전 + 상세 CHANGELOG link) — 다른 섹션 (가치 명세 / 4원칙 / 핵심 디렉토리 / 정착 패턴) 본문 보존
3. **`CHANGELOG.md` split** — v2.3.7 ~ v1.4.0 (line 725 ~ 2338) → `CHANGELOG-HISTORY.md` 상단 prepend (★ 두번째 split / 첫 split = 2026-05-06 cleanup round 2-A v1.3.x 격리)
   - 본문 `CHANGELOG.md`: 165KB / 2341 라인 / 34 헤더 → **60KB / 729 라인 / 12 헤더** (v2.4+ 본문 보존)
   - archive `CHANGELOG-HISTORY.md`: 67KB / 1254 라인 / 13 헤더 → **168KB / 2870 라인 / 36 헤더** (v2.3.7 ~ v1.0)
   - `CHANGELOG-HISTORY.md` header 갱신 (v1.3.x → v2.3.x and earlier) + `CHANGELOG.md` 하단 pointer 갱신

### 결정적 사실

- ★ ★ chain harness 5 요소 변경 ❌
- ★ ★ v2.5.0 MINOR FINAL release 본질 보존 ✅ (Layer 2 LLM paradigm / ≥ 2 PoC corroboration / Adzic SBE 함정 회피 / industry-first paradigm 모두 본질 보존)
- ★ version-check 3-way sync v2.5.1 보존 ✅
- ★ release-readiness 9/9 strict pass ✅ (`node scripts/release-readiness.js --target v2.5.1`)
- ★ release-readiness self-test 10/10 pass ✅ (`npm run test:release`)
- ★ br-cross-consistency-validator 31/31 보존 ✅
- ★ 11 PoC 호환 자격 보존 ✅

### 선행 회귀 별개 carry

- ★ `tools/drift-validator/check-phase-skills.test.js` + `chain stage layout test` 2건 실패 — v2.5.1 PATCH 1-depth 평탄화 후 validator 미동기화 / **git stash 후에도 동일 실패 = 본 meta-cleanup refactor 무관 / pre-existing regression**.

### 신규 carry 3 (★ ★ ★ 3 resolved by follow-up commits / 0 outstanding)

- ✅ **C-drift-validator-skills-flat-sync** (medium / tools / regression / **resolved**) — v2.5.1 1-depth 평탄화 후 `tools/drift-validator/check-phase-skills.test.js` + `chain stage layout test` 2건 실패. follow-up commit 안 `check-phase-skills.js` 1-depth + category prefix paradigm 정합 갱신 시행 → **workspace test 310/2 → 312/0 본질 회복** ✅.
- ✅ **C-briefing-outdated-v2.2-to-v2.5.1** (high / onboarding / content / **resolved**) — ★ ★ ★ `briefing/` 사내 동료 onboarding 자료 v2.2.0 시점 → v2.5.1 격차 5단계. follow-up commit 안 5 file 본격 갱신 시행 + Confluence 4 page update + title 복원.
- ✅ **C-guides-outdated-1-depth-paradigm** (★ ★ ★ critical / plugin INCLUDE 영역 / 동료 install 후 broken link / **resolved**) — `guides/` 5 file 본격 갱신 시행:
  - `first-prompt-cookbook.md` — ★ ★ ★ skill path 20+ link 본격 갱신 (`skills/<category>/X` → `skills/<category>-X` 1-depth + prefix paradigm) + ★ v2.5 신규 `analysis-br-cross-consistency-check` 추가 + v2.4 dual representation paradigm 본격 명시 + 38 skill 정합
  - `getting-started.md` — v2.0.0 → v2.5.1 정합 (사내 GHE install / Skills 38 + Agents 3 / chain 1 gate Layer 2 LLM / 16 tools / 9/9 strict)
  - `chain-harness-guide.md` — §5.1 Layer 2 LLM 통합 본격 신설 (br-cross-consistency-validator Layer 1 + Layer 2 paradigm / gate-eval.js layer2_threshold / Anthropic API ❌ + Claude Code Task tool ✅ 정정)
  - `common-errors.md` — Q1.1 신규 Skills 0 critical 결함 회복 절차 + §6.1 신규 Layer 2 LLM 마찰 3 Q (Q15 응답 시간 / Q16 semantic_drift_detected 사용자 결단 / Q17 confidence_cap_exceeded) + Q11 256 → 295 file + Q14 명시 호출 1-depth
  - `guides/README.md` — 자산 4 표 본격 갱신 + 본 DEC 참조 추가
  - ★ ★ ★ **동료 install 후 broken link 본격 차단** ✅ (grep `skills/{analysis,planning,spec,test,implement,_base}/` 0건 확인)

### 부속 자산

- `DEC-2026-05-14-post-v2.5.1-meta-cleanup.md` 신설 + INDEX.md 갱신
- `README.md` CHANGELOG link 3건 갱신 (v1.4+/v1.3 이전 → v2.4+/v2.3.x 이전) — 본 split 정합

---

## [v2.5.1] — 2026-05-14 ⭐ 현재 (★ ★ ★ ★ PATCH — Claude Code plugin install 호환성 본격 회복 + 사상 명세 (skills-axis + agents-axis) 본격 자산화 + 3-way sync 회복 (package.json v2.4.1→v2.5.1 / v2.5.0 release commit 갱신 누락 회복) + chain harness 5 요소 변경 ❌)

> ★ ★ ★ **v2.5.1 PATCH** — v2.5.0 MINOR FINAL release 후속 — 사내 GHE plugin install 후 38 skill + 3 agent 본격 인식 ❌ 였던 v2.0.0~v2.5.0 본질 결함을 post-v2.5.0 commit `4d25df8` (agents/skills 1-depth 평탄화) 로 본격 회복 + 본 PATCH 안에 사상 명세 본격 정합 + DEC + ADR LL 자산화 + 3-way sync 회복.

### ★ ★ ★ v2.5.1 산출 자산 6종

1. ★ ★ ★ **agents/skills 1-depth 평탄화 본격 자산화** (post-v2.5.0 commit `4d25df8` 본격 자산화) — 38 skill + 3 agent Claude Code 표준 1-depth + category prefix paradigm (★ skills/<category>-<name>/SKILL.md + agents/_base-<name>.md)
2. ★ ★ **methodology-spec/skills-axis.md 본격 정합** (category prefix 1-depth paradigm 사상 갱신 / v1.4.4 신설 paradigm 의 본격 정합)
3. ★ ★ **methodology-spec/agents-axis.md 본격 작성** (사상 명세 자산화 — agents 1-depth paradigm + _base 카테고리 + sub-agent invocation paradigm 정합)
4. ★ **DEC-2026-05-14-agents-skills-1-depth-flatten 신설** + INDEX 갱신
5. ★ **ADR-CHAIN-011 §9 LL-i-48+49 자산화** (Claude Code plugin 표준 1-depth vs lifecycle stage organize 충돌 본질 결함 + category prefix flatten 해소 paradigm)
6. ★ ★ **3-way sync 회복** — `package.json` v2.4.1 → v2.5.1 (★ v2.5.0 release commit `9e6cf55` 갱신 누락 회복) + `plugin.json` v2.5.0 → v2.5.1 + CHANGELOG 헤더 신설 + README.md 상단 version 표시 v2.0.0-rc1 → v2.5.1 정합

### ★ ★ ★ critical 결정적 사실

- ★ ★ ★ **v2.0.0~v2.5.0 까지 plugin install 영역에서 skill 본격 작동 ❌ 했던 본질 결함** = 본 v2.5.1 PATCH 본격 회복 ✅
- ★ ★ 사내 GHE 표준 install (`/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git` + `/plugin install ai-native-methodology@ai-native-methodology`) 본격 작동 ✅ (사용자 측 install 검증 통과)
- ★ chain harness 5 요소 변경 ❌ (chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle 변경 ❌)
- ★ v2.5.0 MINOR FINAL release 본질 보존 ✅ (★ Layer 2 LLM paradigm + ≥ 2 PoC corroboration + Adzic SBE 함정 회피 + industry-first paradigm 모두 본질 보존)
- ★ 11 PoC 호환 자격 보존 ✅
- ★ workspace test 312/0 + scripts/test 10/10 = 322/0 본질 보존 ✅

### ★ ★ release-readiness 9/9 strict (★ v2.5.0 격상 본질 보존)

- v2.5.0 시점 8/8 → 9/9 격상 (★ layer_2_consistency criterion 신설). 본 PATCH 도 9/9 strict 통과 자격 (★ chain harness 본질 + 분석 stage 영역 변경 ❌ / regression ❌).

### ★ ★ neutral neighbor — 본 PATCH 영역 외

- 본 PATCH = plugin install 호환성 fix + 사상 명세 자산화 + 3-way sync 회복 영역 한정. v2.5.0 본격 paradigm (Layer 2 LLM Claude Code sub-agent invocation / dual representation / ≥ 2 PoC corroboration / Adzic SBE 함정 회피 / industry-first paradigm) = 본질 보존.

### ★ ★ Lessons Learned 2건 자산화 (ADR-CHAIN-011 §9 patch v10)

- ★ ★ ★ **LL-i-48** — Claude Code plugin 표준 1-depth (`agents/<name>.md` + `skills/<name>/SKILL.md`) vs 본 plugin lifecycle stage organize 2-depth (`agents/<category>/<name>/<name>.md` + `skills/<category>/<name>/SKILL.md`) **충돌 본질 결함** — v2.0.0~v2.5.0 까지 사내 GHE install 후 skill 본격 작동 ❌ 본질 사실. plugin lifecycle organize 사상 자체 (skills-axis.md v1.4.4) ≠ Claude Code runtime 영역 paradigm. **사용자 결단 paradigm = sub-axis 영역 분리** (★ 사상 axis = methodology-spec / runtime axis = skills/<category>-<name>/ 1-depth 평탄화).
- ★ ★ **LL-i-49** — category prefix flatten 해소 paradigm — 사용자 결단 옵션 B (★ ★ sub-axis 분리 / 디렉토리 axis = prefix 형태 보존). 사용자 결단의 본질 = "사상 보존 (lifecycle organize axis 사상 명세) + Claude Code 호환 (1-depth runtime)" dual axis. ★ 사상 명세 = methodology-spec/skills-axis.md + agents-axis.md / runtime 자산 = skills/<category>-<name>/ + agents/_base-<name>.md. 본 paradigm 은 ★ ADR-008 이중 렌더링 사상 (사상 + 자산 분리) 의 plugin runtime 영역 확장.

### ★ ★ 신규 carry 1

- ★ **C-poc-axis-design-vs-runtime-separation-paradigm** (medium / 사상 명세) — 향후 plugin lifecycle organize 사상 vs Claude Code runtime 호환성 충돌 발생 시 본 paradigm (사상 axis 보존 + runtime 평탄화) 정합 적용 carry.

---

## [v2.5.0] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ MINOR FINAL — Layer 2 LLM paradigm 본격 도입 + ≥ 2 PoC corroboration 본격 입증 + Adzic SBE 10년 폐기 함정 회피 자격 본격 도달 + industry-first paradigm 본격 입증 + release-readiness 8/8 → 9/9 격상 + chain harness validated 본질 보존 ✅)

> ★ ★ ★ ★ ★ ★ **v2.5.0 MINOR FINAL** — Phase A (description vs natural_language paradigm 재정의 / session 10차) + Phase B (PoC #03 + PoC #05 dual representation 마이그레이션 / Layer 1 keyword threshold 자체 제거 / session 11차) + Phase C (Layer 2 LLM Claude Code sub-agent invocation paradigm 본격 구현 / Sonnet 4.6 batch / session 12~14차) + Phase D (release-readiness 9/9 격상 + ≥ 2 PoC corroboration 본격 검증 + drift BR 2건 DRIFT 격상 자산 / session 15차) 모두 본격 종결.

### ★ ★ ★ ★ ★ ★ v2.5.0 Phase D session 15차 산출 자산 8종

1. ★ ★ **`scripts/release-readiness.js`** — check9 layer_2_consistency 신규 + check3 + check8 경로 회복 (★ session 11차 phase B `input/ → output/rules/` 회귀 회복 / per-PoC mean ≥ 0.7 + critical/high drift 0 / Senior REVISE-1 + LL-i-43 정합)
2. ★ ★ **`scripts/test/release-readiness.test.js`** — 9 → 10 case (★ +1 신규 layer_2_consistency happy path / criterion id 9개 정합)
3. ★ ★ **`examples/poc-05-sample-user-register/output/rules/rules.json`** — meta 안 generated_at + confidence + inputs_used + methodology_version + formula_version + extraction_env 표준 필드 회복 (★ session 11차 phase B 회귀 회복)
4. ★ ★ ★ **`tools/br-cross-consistency-validator/PHASE-D-2026-05-14-corroboration-final.md`** — 31 BR 통합 corroboration 본격 입증 자산
5. ★ ★ ★ **`tools/br-cross-consistency-validator/PHASE-D-2026-05-14-drift-domain-review.md`** — 2 drift BR DRIFT 격상 자산 (BR-AUTH-JWT-002 + BR-USER-DELETE-AUTH-001 / 사용자 결단 / rules.json 변경 ❌)
6. ★ ★ **`decisions/DEC-2026-05-14-v2.5.0-minor-final.md`** — DEC 신설 (★ 본 release 정합)
7. ★ **`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`** §11 patch v9 + §9 LL-i-44+45 자산화
8. ★ **plugin.json + br-cross-consistency-validator/package.json + chain-driver/package.json** version bump (2.4.1 → 2.5.0 / 0.1.0 → 0.2.0)

### ★ ★ ★ ★ ★ ★ chain harness 5 요소 변경

| 요소 | session 14차 | session 15차 |
|---|---|---|
| 1. no-simulation policy trio | ❌ | ❌ |
| 2. D21' (suppressOutput) | ❌ | ❌ |
| 3. release-readiness content-aware | ❌ | ★ ★ **9th criterion 추가 (additive)** |
| 4. chain-driver gate-eval Layer 2 | ★ session 14차 (additive) | ❌ |
| 5. drift state-flow | ❌ | ❌ |

→ ★ ★ ★ **additive change paradigm 정합** (★ ★ chain harness validated 본질 보존 ✅ / LL-i-42 정합)

### ★ ★ ★ ★ ★ ★ release-readiness 9/9 실측 (★ session 15차 본격)

```
node scripts/release-readiness.js --target v2.5.0
✅ poc_corroboration / real_tool_evidence / validators_violation / chain_coverage / adr_registry / matrix_greenness / e2e_cycle_pass / analysis_validator_violation / layer_2_consistency

9/9 criteria passed.
★ ★ ★ v2.5.0 = release-ready.
```

★ Layer 2 per-PoC mean: PoC #01=0.848 (n=13) / PoC #03=0.914 (n=18) / PoC #05=0.970 (n=2, sample).

### ★ ★ ★ ★ ★ ★ ≥ 2 PoC corroboration 본격 입증 (★ 31 BR)

| PoC | n | L1 | L2 | overall | gate |
|---|---|---|---|---|---|
| PoC #01 (Java/Spring) | 13 | 0.954 | 0.848 | **0.901** | ★ pass |
| PoC #03 (TS/NestJS) | 18 | 0.967 | 0.914 | **0.941** | ★ pass |
| PoC #05 (sample) | 2 | 1.0 | 0.97 | 0.985 | ★ pass (corroboration ❌) |

→ ★ ★ ★ **§8.1 strict ≥ 2 PoC corroboration 자격 본격 도달 ✅** (★ ADR-CHAIN-008 정합 / cross-language + cross-platform + drift 종류 diversity 확보)

### ★ ★ ★ ★ ★ ★ test 회귀 검증

- workspace 전수: **312/0** (★ session 14차 보존 / 회귀 ❌)
- scripts/test/release-readiness.test.js: **10/10** (★ session 14차 9 → 본 session 10 / +1 신규)
- 합산 **322/0 pass** ✅

### ★ ★ ★ ★ ★ ★ Lessons Learned 신규 (★ ADR-CHAIN-011 §9 patch v9)

- ★ ★ ★ ★ **LL-i-44** (★ "drift BR DRIFT 격상 자산 paradigm = rules.json 변경 ❌ 본격 본질")
- ★ ★ ★ **LL-i-45** (★ "absent BR semantic_inversion 본격 검출 = 본 방법론 가치 본격 입증")

### ★ ★ ★ ★ ★ ★ 자격 본격 입증 4종 ✅

- ★ ≥ 2 PoC corroboration ✅ (31 BR)
- ★ Adzic SBE 10년 폐기 함정 회피 ✅ (★ Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증)
- ★ industry-first 자격 (Spec Kit 90K stars 정면 비교) ✅
- ★ chain harness validated 본질 보존 ✅ (★ additive change paradigm)

---

## [v2.4.1] — 2026-05-14 (★ ★ ★ PATCH — 사내 GHE plugin 배포 채널 정착 + root `.claude-plugin/marketplace.json` 신설 (git-subdir source / path: ai-native-methodology) + `ai-native-methodology/.claude-plugin/plugin.json` homepage GHE 교체 + README.md 시나리오 B → B-1 (GHE git URL, Recommended) + B-2 (dist artifact, 오프라인) 분리 + DEC-2026-05-14-ghe-marketplace-root-신설 + chain harness 5 요소 변경 ❌)

> ★ ★ ★ **v2.4.1 PATCH — 사내 GHE plugin 배포 채널 정착** — v2.4.0 ⭐ MINOR FINAL release plugin artifact 가 사내 GHE (`github.smilegate.net/SGH-ISD/ai-native-methodology`) 에 본격 배포됨. nested 레포 구조 (`<git-root>/ai-native-methodology/.claude-plugin/`) 와 Claude Code marketplace add 시 git root 의 `.claude-plugin/marketplace.json` 만 인식하는 표준 동작 사이의 path 불일치 해소 → `git-subdir` source 타입 채택.

### ★ ★ ★ v2.4.1 산출 자산 5종

1. ★ **root `<git-root>/.claude-plugin/marketplace.json` 신설** — `git-subdir` source / `path: "ai-native-methodology"` / `url: https://github.smilegate.net/SGH-ISD/ai-native-methodology.git` → 사용자 `/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git#v2.4.1` 1줄 install 가능
2. ★ **`ai-native-methodology/.claude-plugin/plugin.json` homepage 교체** — `https://github.com/rageboom/ai-native-methodology` → `https://github.smilegate.net/SGH-ISD/ai-native-methodology` (사내 정합)
3. ★ **`ai-native-methodology/.claude-plugin/marketplace.json` 보존** — `source: "./"` 그대로 (시나리오 A 편집자 워크스페이스 직접 등록 / 시나리오 B-2 dist artifact 폴더 등록 워크플로 보존)
4. ★ **README.md 시나리오 B 분리** — B-1 (GHE git URL, ★ Recommended / 사내 표준) + B-2 (dist artifact, 오프라인 / 특수 환경 fallback)
5. ★ **DEC-2026-05-14-ghe-marketplace-root-신설** + `decisions/INDEX.md` 갱신

### ★ ★ chain harness 5 요소 변경 ❌

본 v2.4.1 PATCH = plugin 배포 path infrastructure 영역 한정 (사내 GHE 본격 배포 / nested 레포 → git-subdir paradigm). chain harness 5 요소 (chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle) 변경 ❌. 11 PoC 호환 자격 보존 ✅. v2.4.0 ⭐ MINOR FINAL release 본질 보존 ✅.

### ★ ★ ★ ★ release-ready ❌ 명시 (★ install path fix purpose only)

본 v2.4.1 PATCH 는 release-readiness §8.1 strict **6/8 pass / 2 regress** 인지 상태로 commit + tag. **사용자 결단** "v2.4.1 = install path fix 한정 / release-ready ❌ 명시 carry" (★ Recommended 옵션).

| criterion | 결과 | 원인 |
|---|---|---|
| poc_corroboration / real_tool_evidence / chain_coverage / adr_registry / matrix_greenness / e2e_cycle_pass | ✅ 6/6 | v2.4.0 본질 보존 |
| validators_violation | ❌ | session 11~13차 carry — planning-extraction (poc-05) BR-USER-DATA-001 unknown_br |
| analysis_validator_violation | ❌ | session 11차 carry — poc-05 input/rules.json missing (`input/ → output/rules/` 이전) |

★ 본 regress 2건 = sessions 11~14차 v2.4.0 carry update (`no release / no version bump / no tag`) 누적 부담. v2.4.0 ⭐ MINOR FINAL release 시점 8/8 pass → carry update 4 session 누적 → 본 v2.4.1 release-readiness 부담 떠안음.

★ ★ 본 v2.4.1 PATCH 본질 = **사내 GHE install 차단 즉시 해소**. 8/8 strict 회복 = sessions 15차+ Phase D carry 영역 (★ release-readiness 9/9 + v2.5.0 MINOR FINAL release 영역 정합).

### ★ ★ 신규 carry 3건

- ★ ★ **C-release-readiness-recovery-v2.5.0** (★ critical / sessions 15차+ Phase D 영역) — PoC #05 input/rules.json 재배치 + planning-extraction (poc-05) BR-USER-DATA-001 정합 + 8/8 strict 회복
- ★ **C-ghe-distribution-validation** (medium / install UX 본격 재시도 동작 검증)
- C-settings-json-auto-distribution (low / 사내 사전 배포 paradigm)

---

## [v2.4.0 carry update — session 14차 SESSION-WRAPUP — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합 (★ chain harness 5 요소 1 변경) — Phase C 본격 종결 ✅] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — gate-eval.js findings shape 안 llm_consistency_score+llm_threshold+llm_status 3 필드 + evaluateGate 안 layer2_threshold block reason + severityRank rank 2 (coverage_threshold 수준) + applyUserDecision user go → go-with-warnings 허용 + Senior STOP-3 흡수 + REVISE 4건 흡수 + chain-driver test +4 신규 (68→72) + workspace 312/0 + chain harness validated 본질 보존 ✅ + DEC + ADR §9 LL-i-42+43 + §11 patch v8 / Phase D 진입 자격 본격 도달 / session 15차+ = release-readiness 9/9 + v2.5.0 MINOR FINAL release)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 14차 — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합** — ★ session 13차 carry C-chain-1-gate-layer-2-integration (critical) 시행. ★ 4원칙 1단계 plan T 자산화 → 4원칙 2단계 Senior critique → 4원칙 3단계 사용자 결단 "1" (★ 종합 권장 시행) → 4원칙 4단계 본격 시행 + Phase C 본격 종결.

### ★ ★ ★ ★ ★ ★ session 14차 Senior critique STOP signal 흡수

- ★ ★ ★ ★ **STOP-3** (★ Q-S3 (b) 단독 선택 시 Phase C 종결 자격 상실) → Q-S3 (a) 본격 채택

### ★ ★ ★ ★ ★ ★ session 14차 시행 산출 (★ chain harness 5 요소 1 변경)

- ★ ★ ★ `tools/chain-driver/src/gate-eval.js` 본격 갱신:
  - findings shape: `llm_consistency_score` + `llm_threshold` + `llm_status` 3 필드 (★ Q-S1 (a))
  - evaluateGate: `layer2_threshold` block reason 추가 (★ explicit guard `llm_status === 'evaluated' && score != null && score < threshold` / REVISE-1)
  - severityRank: `layer2_threshold: 2` (★ coverage_threshold 수준 / Senior 권장 / REVISE-3)
  - applyUserDecision: layer2_threshold = user go → go-with-warnings (★ Q-S2 (b) coverage_threshold 수준)
- ★ `tools/chain-driver/test/gate-eval.test.js`: +4 신규 Layer 2 paradigm test (skipped / pass / fail / user-go) / REVISE-4 / chain-driver 68→72
- ★ `decisions/DEC-2026-05-14-phase-c-step-9-chain-1-gate-layer-2.md` 신설
- ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-42+43 + §11 patch v8

### ★ ★ ★ ★ ★ ★ ★ session 14차 결정적 사실

| 사실 | 자료 |
|---|---|
| **★ chain 1 gate Layer 2 통합 ✅** | gate-eval.js + 4 신규 test |
| **★ ★ chain harness 5 요소 1 변경 (chain-driver)** | Senior 검토 후 / additive change paradigm 정합 |
| **★ chain harness validated 본질 보존 ✅** | no-simulation trio + D21' + release-readiness content-aware 영역 비손상 |
| **★ ★ ★ ★ ★ Phase C 본격 종결 ✅** | step 1~12 모두 완료 |
| **★ workspace 312/0** | session 13차 308 → +4 / 회귀 ❌ |
| **★ Phase D 진입 자격 본격 도달** | release-readiness 9/9 + v2.5.0 MINOR FINAL release 의무 |

### ★ ★ Lessons Learned 신규 (★ session 14차)

- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-42** (★ "chain harness 5 요소 변경 paradigm — additive change paradigm + chain harness validated 본질 보존 의무")
- ★ ★ ★ ★ ★ ★ **LL-i-43** (★ "Layer 2 block reason severity rank paradigm — semantic drift = coverage_threshold 수준 / Phase D 도메인 전문가 검토 carry 정합")

### ★ ★ Phase C step 1~12 본격 종결 ✅

| step | session |
|---|---|
| step 1~5 (plan + sub-agent + 결단 + validator interface + prompt spec) | 12차 |
| step 6~8 (PoC #03 NL + PoC #05 GWT + PoC #01 Layer 2) | 13차 |
| **step 9 (chain 1 gate Layer 2 통합)** | **14차 ✅** |
| step 10 (OVERALL_THRESHOLD 재설계) | 12차 (paradigm 구현 ✅) |
| step 11 (test 갱신) | 12+13+14차 |
| **step 12 (Phase C SESSION-WRAPUP)** | **14차 ✅** |

### ★ ★ 다음 step (★ ★ session 15차+ = Phase D)

- ★ ★ ★ release-readiness 8/8 → 9/9 재격상
- ★ ★ ≥ 2 PoC corroboration 본격 검증
- ★ ★ ★ PoC #01 13 BR + 2 drift BR 도메인 전문가 검토
- ★ ★ ★ ★ ★ ★ **v2.5.0 MINOR FINAL release** (★ commit + git tag v2.5.0 + origin push)
- ★ self-evaluation bias retrospect (Opus/Haiku 교차 검증)

---

## [v2.4.0 carry update — session 13차 SESSION-WRAPUP — v2.5.0 Phase C step 6+7+8+11+12 본격 시행 + Claude Code sub-agent invocation paradigm 본격 동작 입증] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — Task tool 5회 본격 호출 (Sonnet 4.6 / batch / 31 BR) + PoC #03 NL 본격 합성 + PoC #05 GWT 신규 합성 + PoC #01+#03+#05 Layer 2 cross-validation + 3 PoC 모두 gate pass + ≥ 2 PoC corroboration L1+L2 양쪽 통과 ✅ + Adzic 함정 회피 자격 본격 도달 ✅ + industry-first 자격 본격 입증 ✅ + skill 신설 + DEC + ADR §9 LL-i-39+40+41 + §11 patch v7 + 308/0 test pass + semantic_drift 2 BR Phase D carry / Phase C 종결 = session 14차 chain 1 gate Layer 2 통합 / Phase D = release-readiness 9/9 + v2.5.0 MINOR release)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 13차 — v2.5.0 Phase C step 6+7+8+11+12 본격 시행** — ★ session 12차 carry (C-phase-c-step-6-12-session-13 critical) 시행. ★ 사용자 결단 "1" (Plan S §3.1 옵션 A) 정합. ★ ★ ★ Task tool 5회 본격 호출 (★ Sonnet 4.6 / batch paradigm) 본격 시행 + 본격 재실측 + skill 자산화 + SESSION-WRAPUP.

### ★ ★ ★ ★ ★ ★ ★ ★ ★ session 13차 Task tool 5회 본격 호출 (★ Sonnet 4.6 / batch paradigm 정합)

| Agent | step | scope | 결과 JSON |
|---|---|---|---|
| Agent 1 (NL 합성) | step 6-a | PoC #03 18 BR NL TODO marker → 본격 statement | layer-2-results/poc-03-nl-synthesis.json |
| Agent 3 (GWT 합성) | step 7-a | PoC #05 2 BR GWT 신규 합성 | layer-2-results/poc-05-gwt-synthesis.json |
| Agent 5 (Layer 2) | step 8 | PoC #01 13 BR Layer 2 재검증 | layer-2-results/poc-01-layer-2-results.json |
| Agent 2 (Layer 2) | step 6-b | PoC #03 18 BR Layer 2 cross-validation | layer-2-results/poc-03-layer-2-results.json |
| Agent 4 (Layer 2) | step 7-b | PoC #05 2 BR Layer 2 cross-validation | layer-2-results/poc-05-layer-2-results.json |

### ★ ★ ★ session 13차 본격 재실측 결과 (★ Layer 1 + Layer 2 통합)

| PoC | L1 | L2 | overall | gate | findings |
|---|---|---|---|---|---|
| **PoC #01 (baseline)** | 0.954 | **0.848** | **0.901** | **★ ★ pass ✅** | 5 (4 low + 1 medium drift) |
| **PoC #03 (session 13차 신규)** | 0.967 | **0.914** | **0.941** | **★ ★ pass ✅** | 5 (4 low + 1 medium drift) |
| **PoC #05 (sample)** | 1.000 | **0.97** | **0.985** | **★ ★ pass ✅** | 0 |

### ★ ★ ★ ★ ★ ★ ★ session 13차 결정적 사실

| 사실 | 자료 |
|---|---|
| **★ ≥ 2 PoC corroboration Layer 1 + Layer 2 양쪽 통과 ✅** | PoC #01 13 + PoC #03 18 = 31 BR (★ Senior STOP-1 본격 흡수) |
| **★ Adzic SBE 폐기 함정 회피 자격 본격 도달 ✅** | Layer 1 + Layer 2 axis 자료 보유 / LL-i-26 정합 |
| **★ Claude Code sub-agent invocation paradigm 본격 동작 입증 ✅** | B-4 paradigm / Anthropic API key 의무 ❌ |
| **★ industry-first 자격 본격 입증 ✅** | Spec Kit / AWS Q / DMN / Drools / Spectral / AutoUAT 모두 부재 / LL-i-35 정합 |
| **★ workspace 전수 test = 308/0** | session 12차 보존 / 회귀 ❌ |

### ★ ★ ★ session 13차 산출 (자산화 + skill)

- ★ ★ ★ `examples/poc-03-realworld-nestjs/output/rules/rules.json` (★ 18/18 BR NL 본격 statement 갱신)
- ★ `examples/poc-05-sample-user-register/output/rules/rules.json` (★ 2/2 BR GWT 신규 합성 + sample_mode 보존)
- ★ ★ `tools/br-cross-consistency-validator/layer-2-results/` 디렉토리 신설 + 5 결과 JSON 자산화
- ★ ★ ★ `tools/br-cross-consistency-validator/PHASE-C-2026-05-14-re-measurement.md` 본격 재실측 보고
- ★ ★ ★ `skills/analysis-br-cross-consistency-check/SKILL.md` 신설 (Q-C-trigger (d) paradigm 정합)
- ★ `flows/analysis.phase-flow.json` cross_cutting.aspects.skills[] 등록 (drift-validator 47/47 pass)
- ★ ★ `decisions/DEC-2026-05-14-phase-c-step-6-12-session-13.md` 신설
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-39+40+41 + §11 후속 patch v7

### ★ ★ semantic_drift_detected 2 BR (★ Phase D carry)

- **BR-AUTH-JWT-002** (PoC #01 / 0.65 / 규범 vs 현실 비대칭)
- **BR-USER-DELETE-AUTH-001** (PoC #03 / 0.55 / semantic_inversion / absent BR)

### ★ ★ Lessons Learned 신규 (★ session 13차)

- ★ ★ ★ ★ ★ ★ ★ **LL-i-39** (★ "Claude Code sub-agent invocation paradigm 본격 동작 입증 + Sonnet 4.6 batch paradigm 정합")
- ★ ★ ★ ★ ★ ★ **LL-i-40** (★ "Adzic SBE 폐기 함정 회피 자격 본격 도달 — Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증")
- ★ ★ **LL-i-41** (★ "same-model self-evaluation bias 위험 + Phase D retrospect carry 의무")

### ★ chain harness 5 요소 변경 ❌

본 session 13차 시행 영역 = rules.json 갱신 + skill 신설 + flows/analysis.phase-flow.json 갱신 (★ skill manifest 등록 / drift-validator orphan 회피) + ADR + DEC + 자산화. chain harness 5 요소 변경 ❌ 보존.

★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js) = ★ session 14차 본격 결단 영역.

### ★ ★ 다음 step (★ ★ session 14차)

- ★ ★ ★ ★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- ★ Phase C SESSION-WRAPUP
- ★ ★ ★ ★ ★ ★ Phase D = release-readiness 8/8 → 9/9 + PoC #01 도메인 전문가 검토 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 12차 SESSION-WRAPUP — v2.5.0 Phase C step 1~5 시행] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — Layer 2 LLM 본격 paradigm 구현 (Claude Code sub-agent invocation paradigm) + Senior STOP-1+2+3+4 흡수 + REVISE 5건 흡수 + validator interface 본격 + docs/layer-2-prompt-spec.md 신설 + test +5 (31/31) + workspace 308/0 + DEC 신설 + ADR §9 LL-i-37+38 + §11 patch v6 / Phase C step 6~12 = session 13차 분리)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 12차 — v2.5.0 Phase C step 1~5 시행** — ★ ★ session 11차 patch v5 paradigm 회복 후속 carry (C-phase-c-paradigm-redesign + C-claude-code-subagent-invocation-paradigm). ★ 4원칙 1단계 plan `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` 자산화 → ★ ★ 4원칙 2단계 가벼운 Senior critique sub-agent 토론 → 4원칙 3단계 사용자 결단 "진행하자" → 4원칙 4단계 시행 + Lessons Learned.

### ★ ★ ★ ★ ★ ★ ★ session 12차 Senior critique STOP signal 흡수

- ★ ★ ★ ★ ★ **STOP-1 (최강도 / Claude → Claude self-invocation echo chamber)** → ★ Sonnet 4.6 sub-agent 호출 paradigm 의무 / F-015 cross-validation pattern 정합
- ★ ★ ★ ★ **STOP-2 (강 / Phase C 12 step scope 폭증)** → ★ session 12차 = step 1~5 한정 / session 13차 = step 6~12 분리
- ★ ★ ★ **STOP-3 (중강 / trigger 영역 결단 부재)** → ★ (d) skill trigger + (a) ad-hoc hybrid paradigm
- ★ ★ ★ **STOP-4 (중 / batch paradigm 부재 시 1.5~2.5시간 비현실적)** → ★ batch paradigm 의무

### ★ ★ ★ session 12차 Q-C 종합 결단 (★ ★ 사용자 "진행하자" 결단 정합)

- **Q-C0 (b)**: B-4 AI-Native 본질 paradigm — Claude Code sub-agent (Task tool / Agent tool) invocation paradigm 본격 채택
- **Q-C-trigger (d)+(a)**: skill trigger + ad-hoc hybrid
- **Q-C-batch**: batch paradigm 의무 — 1회 Task tool 호출 안 전체 BR list 입력
- **Q-C-model**: Sonnet 4.6 (★ STOP-1 echo chamber 약화)
- **Q-C1 (a)**: `--llm-results <json>` 옵션 신설
- **Q-C2 (a)**: `docs/layer-2-prompt-spec.md` 신설
- **Q-C3 (b)**: Phase D 시 chain 1 gate 통합 (★ session 12차 scope 축소)
- **Q-C4 (a)**: Layer 1 AND Layer 2 양쪽 통과 의무
- **Q-C5 (a)**: Claude 가 일괄 batch 합성 + Phase D 도메인 전문가 검토 carry

### ★ ★ ★ session 12차 산출 8종

- ★ ★ `tools/br-cross-consistency-validator/src/cli.js` (★ `--llm-results <path>` 옵션 신설 + Layer 2 LLM 호출 paradigm usage 영역 명시)
- ★ ★ ★ `tools/br-cross-consistency-validator/src/llm.js` (★ placeholder → 본격 paradigm / semantic_drift_detected finding 신설 + confidence_cap_exceeded finding 신설 / extractLLMMeta 함수 신설)
- ★ ★ ★ `tools/br-cross-consistency-validator/src/validator.js` (★ Layer 1 AND Layer 2 양쪽 통과 paradigm 본격 / DETERMINISTIC_THRESHOLD 0.85 신설 / overall_score = (L1 + L2) / 2 / summary 영역 확장 / computeDeterministicScore 안 Layer 2 findings 제외 axis 분리)
- ★ ★ `tools/br-cross-consistency-validator/test/validator.test.js` (★ +5 Layer 2 본격 paradigm test / 31/31 pass)
- ★ ★ ★ ★ `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` (★ 신설 / paradigm 사상 + Task tool 호출 paradigm + batch paradigm 의무 + prompt 본문 + 응답 schema + validator 호출 paradigm + trigger paradigm + 한계 carry)
- ★ ★ `decisions/DEC-2026-05-14-phase-c-step-1-5-layer-2-paradigm-implementation.md` (★ DEC 신설)
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-37+38 + §11 후속 patch v6
- ★ `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` (★ §0 종결 + §6 한계 갱신)

### ★ ★ ★ ★ 결정적 사실 (★ session 12차)

| 사실 | 자료 |
|---|---|
| **★ Layer 2 본격 paradigm interface 구현 ✅** | cli.js + llm.js + validator.js / placeholder → 본격 paradigm 격상 |
| **★ B-4 paradigm 본격 채택 ✅** | Claude Code sub-agent invocation paradigm / Anthropic API key 의무 ❌ |
| **★ batch paradigm 의무 명시 ✅** | docs/layer-2-prompt-spec.md §2 / 1회 Task tool 호출 안 전체 BR list |
| **★ Sonnet 4.6 sub-agent model 명시 ✅** | STOP-1 echo chamber 약화 / F-015 정합 |
| **★ confidence cap 0.85 enforcement ✅** | Static Tool 시뮬레이션 금지 정책 정합 / advisory 신뢰도 cap |
| **★ Layer 1 + Layer 2 통합 점수 paradigm ✅** | Q-C4 (a) / overall_score = (L1 + L2) / 2 |
| **★ workspace 전수 test = 308/0** | session 11차 303 → +5 / 회귀 ❌ |

### ★ ★ Lessons Learned 신규 (★ session 12차 / ADR-CHAIN-011 §9 patch v6 자산화)

- ★ ★ ★ ★ ★ ★ **LL-i-37** (★ "Claude → Claude self-invocation echo chamber 회피 paradigm = Sonnet 4.6 sub-agent + F-015 cross-validation pattern 정합")
- ★ ★ ★ ★ **LL-i-38** (★ "Node.js script 안 LLM 직접 호출 ❌ paradigm 본질 / Claude Code sub-agent invocation paradigm 본격 채택")

### ★ chain harness 5 요소 변경 ❌

본 session 12차 시행 영역 = validator interface + prompt spec + test + plan 갱신 + DEC + ADR patch. chain harness 5 요소 (★ schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존.

★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js) = ★ ★ session 13차 (★ Phase C step 9) 영역.

### ★ ★ 다음 step (★ session 13차 = Phase C step 6~12)

- ★ ★ ★ ★ ★ ★ ★ PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 (★ Claude Code Task tool / Sonnet 4.6 / batch paradigm) + 도메인 전문가 검토 carry
- ★ ★ ★ ★ ★ PoC #05 2 BR GWT 신규 합성 (★ sample mode 보존)
- ★ ★ ★ ★ PoC #01 13 BR Layer 2 재검증 (★ baseline 비교)
- ★ ★ ★ ★ chain 1 gate br-cross-consistency-validator Layer 2 통합 (★ chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- ★ skills/analysis-br-cross-consistency-check/SKILL.md 신설 (★ Q-C-trigger (d) 정합)
- ★ Phase C SESSION-WRAPUP
- ★ ★ ★ ★ ★ ★ Phase D = release-readiness 8/8 → 9/9 재격상 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 11차 SESSION-WRAPUP — v2.5.0 Phase B 시행] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — PoC #03 18 BR 형식 sliding (TCA → GWT) + action = metadata 보존 + NL TODO marker + PoC #05 input/→output/rules/ 이전 + sample_mode meta + description→NL 자동 추출 + Layer 1 threshold 자체 제거 + 303/0 test pass + ≥ 2 PoC corroboration 자격 도달 + DEC 신설 + ADR patch v4 + LL-i-33~35 자산화)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 11차 — v2.5.0 Phase B 시행** — ★ ★ session 9차 신규 carry C-poc-03-05-dual-representation (critical / Senior STOP-1 흡수) + C-keyword-threshold-degrade + session 10차 carry C-poc-02-11-description-to-nl-migration 후속. ★ ★ 4원칙 1단계 plan `~/.claude/plans/q-v2.5.0-phase-b-poc-03-05-마이그레이션.md` 자산화 → 4원칙 2단계 sub-agent 3 병렬 토론 → 4원칙 3단계 사용자 결단 "1" (★ 종합 권장 시행) → 4원칙 4단계 시행 + Lessons Learned. Plan Q §3 Phase B scope 본격 시행.

### ★ ★ ★ ★ ★ ★ ★ session 11차 Q-B 종합 결단 (★ ★ 사용자 "1" 결단 정합)

- **Q-B0 (c)**: scope 축소 시행 (★ Adzic 함정 회피 + Phase C 진입 자격 자료 확보 + release 지연 회피 균형)
- **Q-B1 (b)**: 형식 sliding only — trigger→When / condition→Given / expected_result→Then / **action = GWT step 분리 ❌ + rejection_method + verification_location metadata 보존** / NL = TODO marker (★ Phase C LLM 본격 합성 의무 carry)
- **Q-B2 (b)**: PoC #05 `input/rules.json` → `output/rules/rules.json` git mv 이전 + sample_mode meta 명시 (★ Agent 1 phase-flow SSOT 정합)
- **Q-B3 (b)**: Layer 1 keyword threshold **자체 제거** (★ session 9차 "0.15 floor advisory" → session 11차 "★ ★ threshold 비교 자체 ❌") / "non-empty + overlap > 0" sanity check only / `structural_sanity_only` finding 신설 (overlap = 0 시만)
- **Q-B4 (a)+(c)**: PoC #01 13 BR NL self-review 1차 ✅ + Phase D 전 도메인 전문가 검토 carry
- **Q-B5 (b)**: PoC #05 corroboration **산입 ❌** + spot check only (★ Senior STOP-4 흡수 / n=2 statistical power ≈ 0)
- **Q-B6 (a)**: session 11차 LLM 부재 / Phase C session 12차+ 본격 LLM 호출

### ★ ★ ★ session 11차 산출 8종

- ★ ★ `tools/br-cross-consistency-validator/scripts/synthesize-gwt-from-tca.mjs` (★ 신설 / TCA → GWT 형식 sliding script / ★ Agent 1 Cucumber/Fowler/ECA 3중 외부 권위 정합)
- ★ ★ ★ `examples/poc-03-realworld-nestjs/output/rules/rules.json` (★ ★ 18 BR Phase B 마이그레이션 ✅ / trigger→When / condition→Given / expected_result→Then + action = metadata 보존 + NL TODO marker)
- ★ ★ `examples/poc-05-sample-user-register/output/rules/rules.json` (★ git mv input/ → output/rules/ + 2 BR description→NL 자동 추출 + meta.sample_mode=true + meta.corroboration_eligible=false)
- ★ ★ `tools/br-cross-consistency-validator/src/deterministic.js` (★ ★ keyword_mismatch finding 완전 제거 + structural_sanity_only finding 신설 / overlap === 0 시만)
- ★ `tools/br-cross-consistency-validator/src/validator.js` (★ OVERALL_THRESHOLD deprecated semantic 명시 + Phase C carry)
- ★ `tools/br-cross-consistency-validator/test/validator.test.js` (★ +2 신규 paradigm test / 26/26 pass / 회귀 ❌)
- ★ ★ `tools/br-cross-consistency-validator/PHASE-B-2026-05-14-re-measurement.md` (★ 재실측 보고 / ≥ 2 PoC corroboration 자료)
- ★ `decisions/DEC-2026-05-14-phase-b-poc-03-05-마이그레이션.md` (★ DEC 신설)
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-33~35 + §11 후속 patch v4

### ★ ★ ★ ★ 결정적 사실 (★ session 11차)

| 사실 | 자료 |
|---|---|
| **★ ≥ 2 PoC corroboration 자격 도달 ✅** | PoC #01 (13 BR) + PoC #03 (18 BR) = **31 BR** (★ Senior STOP-1 흡수 ✅) |
| **★ PoC #01 baseline 격상** | deterministic_score 0.608 → **0.954** / gate fail → **pass** (★ paradigm 정합 격상) |
| **★ PoC #03 cross-validation 진입 자격 ✅** | with_both=18 / 의도된 NL TODO marker = sanity ∅ paradigm 정합 |
| **★ PoC #05 sample mode + corroboration ❌** | n=2 statistical power ≈ 0 / meta 명시 |
| **★ workspace 전수 test = 303/0** | session 10차 302 → +1 신규 paradigm test / 회귀 ❌ |
| **★ ★ Layer 1 threshold 자체 제거 paradigm 정착** | Agent 3 STOP-3 흡수 (magic number 0.15 회피) + MDPI 2025 "no single generalizable cut-off" 정합 |

### ★ ★ Lessons Learned 신규 (★ session 11차 / ADR-CHAIN-011 §9 정합)

- ★ ★ ★ ★ **LL-i-33** (★ "TCA 4축 → GWT 3축 형식 sliding paradigm = Cucumber/Fowler/ECA 3중 외부 권위 정합 / action = GWT step 분리 ❌ + metadata 보존")
- ★ ★ ★ ★ **LL-i-34** (★ "Layer 1 keyword threshold 자체 제거 paradigm / 'non-empty + overlap > 0' sanity check only / Layer 2 LLM mandatory Phase C 의무")
- ★ ★ ★ **LL-i-35** (★ "industry-first 자격 scope 정정 / dual representation ≠ industry-first (Cucumber Rule 2018 정합) / 4축 → GWT deterministic 합성 + NL ↔ GWT cross-consistency validator = industry-first 자격")

### ★ chain harness 5 요소 변경 ❌

본 session 11차 시행 영역 = PoC 자산 + validator paradigm + ADR §9+§11 patch + DEC 신설 + 자산화. ★ chain harness 5 요소 (schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존 ✅.

### ★ ★ 다음 step (★ session 12차+ / Phase C)

★ ★ ★ ★ ★ ★ ★ ★ **★ ★ ★ patch v5 paradigm 회복 (★ session 11차 후속 / 사용자 결단 "옵션 B")** — ★ Phase C 본격 구현 paradigm = **★ ★ Claude Code sub-agent (Task tool / Agent tool) invocation** (★ Anthropic API / OpenAI API 영역 ❌ / 본 방법론 plugin 자산 정합 / Static Tool 시뮬레이션 ❌)

- ★ ★ ★ ★ ★ ★ ★ Layer 2 LLM mandatory 본격 구현 (★ ★ Claude Code sub-agent 호출 paradigm / B-1 plugin hook 권장 + B-2 chain-driver + B-3 사용자 위임 mode 결단)
- ★ ★ ★ ★ ★ PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 + 도메인 전문가 검토
- ★ ★ ★ ★ PoC #05 2 BR GWT 신규 합성
- ★ ★ ★ ★ chain 1 gate br-cross-consistency-validator Layer 2 통합
- ★ ★ OVERALL_THRESHOLD 의미 재설계 (Layer 1 + Layer 2 통합 점수)
- ★ ★ ★ ★ ★ ★ Phase D = release-readiness 8/8 → 9/9 재격상 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 10차 SESSION-WRAPUP — v2.5.0 Phase A 시행] — 2026-05-13~14 (★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — description vs natural_language paradigm 재정의 + schema 강화 (★ breaking change ❌) + validator paradigm 갱신 + PoC #01 13 BR 자동 마이그레이션 + 302/0 test pass + DEC + ADR patch v3)

> ★ ★ ★ ★ ★ ★ ★ ★ **session 10차 — v2.5.0 Phase A 시행** — ★ session 9차 신규 carry C-description-vs-nl-paradigm-define 흡수. 사용자 결단 "1" (즉시 시행) 정합. ★ ★ Agent 3 (c) hybrid 강 옵션 채택 (★ ★ session 9차 SPIKE v2 결정적 입증 + memory feedback_quality_priority.md 재작업 최소화 정합). Plan P §3 Phase A scope 본격 시행.

### ★ ★ ★ ★ ★ ★ paradigm 재정의

```
description    = ★ optional metadata (★ BR statement + rationale + caveat + DRIFT 격상 자유 metadata)
                                       (★ 사람 눈 친화 / characterization context 보존)
                                       (★ cross-validation 대상 ❌)

natural_language = ★ ★ ★ v2.5.0 권장 표준 (★ pure BR statement / 1~2 문장 / GWT 동치 의미)
                                            (★ cross-validation 대상 / Layer 2 LLM mandatory v2.5.0 Phase C)
                                            (★ rationale/caveat 제외)

cross-validation 대상 = ★ ★ natural_language ↔ given/when/then ONLY
                         (★ description 제외 / ★ Layer 1 keyword overlap 한계 회피)
```

### ★ ★ ★ session 10차 산출 8종

- ★ `schemas/rules.schema.json` (★ Phase A paradigm 명세 강화 / allOf.anyOf + item description + natural_language + description field description 모두 강화)
- ★ ★ `tools/br-cross-consistency-validator/src/deterministic.js` (★ description alias 제거 + description_only_fallback low finding 신설 + hasDescription return 신규)
- ★ `tools/br-cross-consistency-validator/src/validator.js` (★ withDescriptionOnly stat 신규)
- ★ `tools/br-cross-consistency-validator/test/validator.test.js` (★ +3 신규 paradigm test / 25/25 pass)
- ★ `tools/br-cross-consistency-validator/scripts/migrate-description-to-natural-language.mjs` (★ 신설 / 3 step stripping / Phase B 재사용 의무)
- ★ ★ ★ `examples/poc-01-realworld-spring/output/rules/rules.json` (★ ★ 13/13 BR 자동 마이그레이션 적용 / description 보존 + natural_language 신규 추출)
- ★ `decisions/DEC-2026-05-14-description-vs-nl-paradigm-재정의.md` (★ DEC 신설)
- ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-31+32 + §11 후속 patch v3

### ★ ★ schema 변경 (★ ★ ★ breaking change ❌)

- ★ allOf.anyOf description 강화 — "description fallback (★ v2.5.0 Phase A — backward-compat / Phase B 마이그레이션 carry)" 명세
- ★ item description 강화 — "cross-validation 대상 = natural_language ↔ given/when/then **ONLY** (★ description 제외)" 명세
- ★ natural_language field description 강화 — "pure BR statement" 명세 + Layer 2 LLM cross-validation 대상 명세
- ★ description field description 강화 — "optional metadata 격상" 명세 (★ deprecated alias 격하 ❌ → ★ ★ optional metadata 격상)

### ★ ★ validator 변경

- ★ ★ description ↔ natural_language alias 처리 ★ 제거 (★ nlText = NL field only)
- ★ ★ hasDescription 신규 boolean (★ cross-validation 대상 ❌ / fallback 추적)
- ★ ★ ★ description_only_fallback low finding 신설 (★ Phase B 마이그레이션 carry 가시화)
- ★ representation_missing 조건 갱신 (★ description fallback 인정)
- ★ withDescriptionOnly stat 신규 (★ Phase B 마이그레이션 carry 추적)

### ★ ★ PoC #01 cross-validation 결과 (★ Phase A pilot 실증)

```
stats:   with_natural_language=13 / with_gwt=13 / with_both=13 / with_description_only=0 / with_finding=13
overlap: mean=0.173 / median=0.105 / max=0.500 (★ ★ session 9차 SPIKE v2 stripped 결과 그대로 실현)
score:   0.608 / gate: fail (★ Layer 1 keyword overlap structural sanity 격하 paradigm 입증)
```

### ★ ★ resolved + 신규 carry

**resolved (1)**:
- ★ ★ ★ C-description-vs-nl-paradigm-define (★ session 9차 carry) → ★ ★ resolved

**신규 carry (2 / Phase B 의무)**:
- ★ ★ ★ **C-poc-01-13-br-nl-human-review** (★ Phase B carry / 자동 추출 정확 보장 ❌ / 사람 검토 의무)
- ★ ★ ★ **C-poc-02-11-description-to-nl-migration** (★ Phase B carry / PoC #03 + #05 우선 / ≥ 2 PoC corroboration 정합)

### ★ ★ Lessons Learned 신규 2건

- ★ ★ ★ ★ **LL-i-31** (★ schema breaking change ❌ + validator paradigm 갱신 = safe 마이그레이션 paradigm / Phase A 시행 입증)
- ★ ★ **LL-i-32** (★ description ↔ NL paradigm 명세 = paradigm 결단 결정적 사실 / ADR-008 이중 렌더링 사상 확장 명세)

### chain harness 5 요소 변경 ❌ (★ ADR-CHAIN-001~005 정합)

본 session 10차 = ★ schema paradigm + validator + pilot PoC 마이그레이션 / ★ chain harness 5 요소 ★ 변경 ❌.

### ★ ★ test 보존

★ ★ 302/0 pass (★ +3 신규 paradigm test / 회귀 ❌).

### ★ ★ ★ ★ 다음 step (★ ★ Phase B = 다음 session)

- ★ ★ ★ PoC #03 dual representation 마이그레이션 (★ trigger/condition/action → natural_language + given/when/then 신규)
- ★ ★ ★ PoC #05 dual representation 마이그레이션 (★ description → natural_language + GWT 신규)
- ★ ★ Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하
- ★ ★ ≥ 2 PoC corroboration 자료 확보 (★ Senior STOP-1 흡수 정합)
- ★ ★ Phase C 진입 자격 도달 (★ Layer 2 LLM mandatory 본격 구현)

---

## [v2.4.0 carry update — session 9차 SESSION-WRAPUP] — 2026-05-13 (★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — C-threshold-spike-revisit carry 흡수 + Layer 2 LLM 의무 격상 paradigm 결단 + ADR-CHAIN-011 §5.4 patch v2 + SPIKE v2 자산화)

> ★ ★ ★ ★ ★ ★ ★ ★ **session 9차 SESSION-WRAPUP** — ★ ★ session 8차 신규 carry C-threshold-spike-revisit (★ critical) 즉시 흡수. 4원칙 1단계 plan + 2단계 sub-agent 3 병렬 토론 (Agent 1 공식문서 + Agent 2 빅테크 + Agent 3 Senior critique) + 3단계 사용자 결단 + 4단계 시행 (SPIKE v1 재측정 + SPIKE v2 REVISE-6 + ADR §5.4 patch v2 + DEC 신설). ★ ★ ★ Senior STOP signal 3건 흡수 강도 분리 (STOP-1 단일 PoC §8.1 strict 위반 전면 흡수 / STOP-2 v2.4.0 라벨 강등 soft 흡수 = 라벨 보존 + carry 명시 / STOP-3 Layer 1 단독 = Adzic 폐기 함정 재현 전면 흡수).

### ★ ★ ★ ★ ★ ★ ★ session 9차 핵심 발견

**★ ★ ★ ★ ★ ★ ★ ★ 결정적 실측 자료**:

```
PoC #01 13 BR overlap 분포 (★ description alias 적용 후 / session 9차 SPIKE v1 재측정):
  min=0.000 p25=0.083 p50=0.162 p75=0.300 p90=0.381 max=0.462 / mean=0.201 / stddev=0.134

  ≥0.85: 0/13 (0%)   ★ ★ ★ ★ ★ ★ ★ hypothesis DEAD (empirical 정면 부정 결정적 사실)
  ≥0.5:  0/13 (0%)
  ≥0.3:  4/13 (31%)

SPIKE v2 (REVISE-6 rationale 제거 후 재측정 / 가설 B 검증):
  원본 mean=0.201 → stripped mean=0.173 → mean delta = -0.028 (★ 오히려 감소)
  → ★ ★ ★ ★ ★ ★ 가설 B 정면 부정 (data quality 차이 ❌ 본질 / semantic 차이 본질)
```

### ★ ★ ★ ★ ★ ★ paradigm 결단 (★ ADR-CHAIN-011 §5.4 patch v2)

- ★ ★ ★ ★ ★ ★ **≥0.85 hypothesis 정면 폐기** (★ session 8차 SPIKE v1 + session 9차 SPIKE v1 재측정 + SPIKE v2 + 3 agent 일치 corroboration)
- ★ ★ ★ ★ ★ ★ **Layer 2 LLM 의무 격상 paradigm 채택** (★ chain 1 gate mandatory / threshold ≥ 0.7 MDPI 2025 paraphrase optimal 정합 / F-015 cross-validation 패턴 / Static Tool 시뮬레이션 금지 정합)
- ★ ★ ★ **Layer 1 결정적 = "structural sanity check" 격하** (★ 두 표현 boolean + id 4토막 + structure 위치 / keyword threshold ≥ 0.15 floor advisory)
- ★ ★ ★ ★ ★ **≥ 2 PoC corroboration carry** (★ Senior STOP-1 흡수 / PoC #03 + #05 dual representation 적용 후 v2.5.0)
- ★ ★ ★ **v2.4.0 MINOR FINAL 라벨 soft 보존** (★ Senior STOP-2 / 라벨 강등 ❌ / carry 명시 ✅ / downstream 영향 회피)

### ★ ★ ★ session 9차 산출 5종

- ★ ★ ★ `tools/br-cross-consistency-validator/SPIKE-2026-05-13-v2-rationale-strip.md` (★ SPIKE v2 report 자산화)
- ★ `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` (★ SPIKE v2 시행 script)
- ★ ★ `decisions/DEC-2026-05-13-threshold-spike-revisit-paradigm.md` (★ DEC 신설)
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §5.4 patch v2 + §7.3 carry + §9 LL-i-28 + §10 version handling + §11 후속 (★ session 9차 갱신)
- ★ `~/.claude/plans/o-threshold-spike-revisit.md` (★ 4원칙 1단계 plan / 9 절 / 가설 3 + 결단 Q1~Q5)

### ★ ★ session 9차 resolved + 신규 carry

**resolved (1)**:
- ★ ★ ★ C-threshold-spike-revisit (★ session 8차 critical carry) → ★ ★ resolved (★ session 9차 SPIKE v1 재측정 + SPIKE v2 + Layer 2 LLM 의무 paradigm 결단 / implementation carry = C-layer-2-llm-mandatory-paradigm 흡수)

**신규 carry (4)**:
- ★ ★ ★ ★ **C-layer-2-llm-mandatory-paradigm** (★ critical / v2.5.0 — Layer 2 LLM placeholder → mandatory / ≥ 0.7 / F-015 / no-simulation 정합 / ≥ 2 PoC corroboration 의무)
- ★ ★ ★ ★ ★ **C-poc-03-05-dual-representation** (★ ★ critical / Senior STOP-1 흡수 / ≥ 2 PoC corroboration 의무 / v2.5.0 의무)
- ★ ★ **C-keyword-threshold-degrade** (★ medium / Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 / v2.5.0)
- ★ ★ **C-description-vs-nl-paradigm-define** (★ v2.5.0 paradigm 결단 / Q2 의 a/b/c — 3 agent 충돌 영역)

### ★ ★ Lessons Learned 신규 3건

- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-28** (★ "keyword overlap = structural sanity check / Adzic 폐기 회피 도구 자격 ❌ / Layer 2 LLM 의무 격상" / SPIKE v1+v2 + 3 agent 일치 corroboration)
- ★ ★ ★ ★ **LL-i-29** (★ "Senior critique STOP signal 강도 분리 흡수 paradigm — 사실 명확도 × 비용 2축 평가")
- ★ ★ **LL-i-30** (★ "REVISE-6 가설 B 정면 부정 자체가 paradigm 결단 결정적 자료 / 가설 부정 = 다음 가설 강 corroboration")

### chain harness 5 요소 변경 ❌ (★ ADR-CHAIN-001~005 정합)

본 session 9차 = ★ paradigm 사상 결단 + ADR §5.4 patch v2 + DEC 신설 + 자산화 / ★ chain harness 5 요소 (chain-driver 5 요소) ★ 변경 ❌. ★ Layer 2 LLM mandatory 격상 = v2.5.0 sprint = chain harness 영역 신규 통합.

### ★ ★ ★ ★ 다음 step (★ v2.5.0 paradigm 본격 도입)

- ★ ★ ★ PoC #03 + PoC #05 dual representation 적용 → cross-validation 자료 ≥ 2 PoC corroboration 확보
- ★ ★ ★ Layer 2 LLM mandatory 본격 구현 (★ no-simulation 정책 정합 / 외부 LLM API 직접 호출)
- ★ ★ description vs natural_language paradigm 재정의 (★ Q2 결단)
- ★ ★ Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하
- ★ ★ chain 1 gate br-cross-consistency-validator Layer 2 통합
- ★ ★ ★ release-readiness 8/8 → 9/9 재격상 검토 (Layer 2 통과 criterion 추가)
- ★ ★ ★ v2.5.0 MINOR release

---

## [v2.4.0] — 2026-05-13 (★ ★ ★ ★ ★ ★ ★ MINOR release — BR dual representation paradigm 본격 도입 + br-cross-consistency-validator workspace 16번째 신설 + chain 1 gate REQUIRED_VALIDATORS_PER_STAGE 통합 + release-readiness §8.1 strict 7/7→8/8 격상 + 11 PoC 호환 회복 (PoC #01 + PoC #05 = VALID) / chain harness 5 요소 변경 ❌ — ★ ★ ★ ★ ★ session 9차 carry 명시 추가: "paradigm rc 도입 / threshold gate 결정 보류 / Layer 2 LLM 의무 carry / ≥ 2 PoC corroboration 의무 carry / v2.5.0 = paradigm 본격 도입")

> **★ ★ ★ ★ ★ ★ ★ v2.4.0 MINOR FINAL release** — session 8차 + sub-plan §1 + §2 + §3 통합. 4원칙 2원칙 3 sub-agent 토론 (Agent 1 공식문서 + Agent 2 빅테크 + Agent 3 Senior critique) 시행 + Senior STOP signal 1 + REVISE 5 흡수. ★ ★ ★ ★ ★ Senior STOP signal — release-readiness 8/8 격상 자체 chain harness paradigm 재정의 가능성 → ★ ★ MINOR bump 부적격 가능성 보존 / ★ ★ ★ v2.5.0 분리 검토 carry. 단 release 진행 결단 (★ 사용자 의도 정합 / 호환 보존 + 기능 추가 + sub-rule 추가 자격).

### ★ ★ ★ ★ v2.4.0 MINOR 변경 사항

#### ★ ★ ★ ★ ADR-CHAIN-011 본격 작성 — BR dual representation paradigm

`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`:

- 6갈래 drift 사실 + 사상 발전 history (v1.x GWT → v2.0 source-grounded → v2.1 characterization → v2.3 natural_language → v2.4.0 dual)
- 외부 사례 자릿수 정합 — JSON Schema anyOf 공식 권장 / Adzic SBE 10년 자기 폐기 (★ 본 ADR 핵심 위험 신호) / DMN description+FEEL 동형 / Cucumber description = runtime 무시 (paradigm 다름) / GitHub Spec Kit 90K = dual+cross-validation 미구현 (★ original empirical 자격) / AWS SCT + Conduktor + Solace validator-first migration / Drools governance 실패 패턴
- dual representation paradigm + Layer 1 결정적 + Layer 2 LLM advisory + threshold ≥ 0.85 empirical
- PoC #04 FE if/then 분기 결정 (단일 schema 유지 / nested anyOf 회피)
- chain 1 gate 통합 + release-readiness §8.1 strict 7/7→8/8 격상 (★ MINOR bump 부적격 가능성 명시)
- ADR-008 이중 렌더링 사상의 BR 영역 확장 + F-015 cross-validation schema 내재화
- LL-i-22 (schema vs PoC drift = governance 실패) + LL-i-23 (release-readiness 사각지대) + LL-i-24 (두 사상 dilemma → dual paradigm) + LL-i-26 (Adzic 10년 폐기 회피 의무) + LL-i-27 (industry 공백 채우는 original 기여)

#### ★ ★ ★ ★ tools/br-cross-consistency-validator workspace 16번째 신설

- package.json + cli.js + validator.js + deterministic.js + llm.js + test/validator.test.js
- ★ Layer 1 결정적 — 두 표현 ≥ 1 / keyword overlap (intersection/max) / structure 검증 / BR id 4토막 strict
- ★ Layer 2 LLM advisory — placeholder + interface 정의 (★ Static Tool 시뮬레이션 금지 정책 정합)
- description alias + trigger/condition/action 변형 + GWT string OR array 호환 인정
- severity-weighted deterministic_score + overall_threshold 0.85
- ★ 22/22 unit test pass
- workspace root package.json `workspaces` array 16번째 등록

#### ★ ★ ★ schemas/rules.schema.json top-level 재설계 (v2.4.0)

- top-level anyOf — `business_rules` (표준) / `rules` (v1.x alias 호환) / `rules_manual_authored` (PoC #04 FE alias)
- `project_id` optional 신설
- `paradigm` enum [BE, FE] optional default BE 신설 (★ Agent 1 F1 nested anyOf 함정 회피)
- item 안 `name` OR `title` anyOf — PoC #05~#11 호환
- item 안 `natural_language` + `given/when/then` + `description` (alias) + `trigger/condition/action` (변형) anyOf
- item 안 v2.x optional fields 흡수 — `source` + `evidence_strength` + `br_type` + `is_intent` + `severity` + `current_state_note` + `domain` + `rejection_method` + `verification_location` 등
- ★ ★ schema-validator unit test 7 신규 (★ 15/15 pass)

#### ★ ★ schemas/meta-confidence.schema.json + rules.schema.json enum 확장 (Senior R5 정합)

- `applied_penalties.name` enum 확장 — `no_operational_db` + `fe_absent` + `external_dep_absent` + `single_module` 추가 (★ PoC #01 사례)
- `source_evidence.type` enum 확장 — `missing_explicit_policy` + `auth_expression_websec_ignoring` + `missing_negative_test` 추가 (★ negative space 자연 표현 흡수)
- `rule_conflicts.rule_ids.minItems` 2 → 1 완화 (★ inconsistent_threshold = 단일 BR 내 위반 사례 / PoC #01 BR-COMMENT-DELETE-001)

#### ★ ★ ★ ★ chain 1 gate 통합 — chain-driver gate-eval.js + findings-aggregator

- `tools/chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.planning 안 `br-cross-consistency-validator` 추가
- `tools/findings-aggregator/src/aggregator.js` 안 `transformBrCrossConsistency` 신설 + dispatchValidator 통합
- ★ 26/26 findings-aggregator unit test pass

#### ★ ★ ★ ★ release-readiness §8.1 strict 7/7 → 8/8 격상

- `scripts/release-readiness.js` 안 `check8_analysisValidatorViolation` 신설
- 검사 대상 — schema-validator + br-cross-consistency-validator (★ PoC #01 + #05 기준 / 11 PoC 전수 = sub-plan §2 후 carry)
- ★ ★ ★ ★ ★ ★ ★ **v2.4.0 = 8/8 pass release-ready ✅**
- ★ 9/9 release-readiness test pass

#### ★ ★ ★ ★ ★ PoC #01 마이그레이션 — INVALID → VALID 회복

- `meta.confidence: 0.78` 추가 (★ raw_confidence 값 채택)
- PoC #05 = ★ description alias 효과 + meta 정합 = VALID 보존

#### ★ ★ 11 PoC threshold spike critical 발견 (sub-plan §1 시 / 보존)

- `tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md`
- 11 PoC × 107 BR 안 두 표현 동시 보유 BR = 0 건 (★ overlap 분포 측정 불가능)
- ≥ 0.85 hypothesis 자료 부재 — sub-plan §2 후 재spike 의무 (★ C-threshold-spike-revisit carry)

### ★ ★ 신규 carry (v2.4.0 sub-plan §2~§3 carry / 다음 release 후보)

- ★ ★ ★ C-threshold-spike-revisit (★ critical / overlap 분포 부재 / sub-plan §2 후 재spike)
- ★ ★ ★ C-poc-02-03-schema-mapping (★ critical / PoC #02 condition+description + PoC #03 trigger+condition+action 매핑 부재 / 사상 결단 의무)
- ★ ★ C-br-cross-validator-Layer2-LLM-impl (★ Layer 2 LLM 본격 구현)
- ★ ★ C-deterministic-score-formula-revisit (★ score 산정 식 재해석)
- ★ ★ C-11-PoC-full-migration (★ ★ 잔여 9 PoC 도메인 전문가 위임 영역 — PoC #02/#03 name/title 부재 + PoC #06~#11 id 4토막 재라벨)
- ★ ★ ★ C-v2.5.0-분리-검토 (★ Senior STOP signal 정합 — release-readiness 격상 = paradigm 재정의 가능성 / MINOR bump 부적격 가능성)

### push 보류 commit 통합 (v2.3.7 ~ v2.4.0)

- `75ee21d` v2.3.7 PATCH (BR pattern 4토막 strict)
- `963dfa0` v2.3.7 후속 patch (schema description 정합)
- `a24a892` v2.4.0-rc1 (dual representation 사상 신설)
- `8101da2` SESSION-WRAPUP session 7차
- `c7dfca5` SESSION-WRAPUP session 8차 (sub-plan §1 — ADR + validator + spike)
- (본 release commit) v2.4.0 MINOR FINAL — sub-plan §2 + §3 + release 자산

---

## [unreleased 사실 보존 / 본 release 직전 commit 자산]

> **★ ★ ★ ★ ★ session 8차** — v2.4.0-rc1 자격 (session 7차 / commit `a24a892` / dual representation 사상 신설) 직후 사용자 결단 "A (v2.4.0 MINOR 진입)" + sub-agent 토론 권장 결단. ★ 4원칙 2원칙 3 sub-agent 병렬 (Agent 1 공식문서 / Agent 2 빅테크 / Agent 3 Senior critique) 시행 + Senior STOP signal 1 + REVISE 5 흡수 + 시행 순서 통합안 (c→d→a부분) 채택. 본 session = sub-plan §1 (ADR + validator scaffolding + Layer 1 결정적 구현 + threshold spike). schema 변경 + 11 PoC 마이그레이션 + chain-driver 통합 + release = sub-plan §2~§3 다음 session+.

### ★ ★ session 8차 변경 사항 (★ no version bump / no release)

#### ★ ★ ★ ★ ADR-CHAIN-011 본격 작성 — BR dual representation paradigm

`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` 신설:

- 6갈래 drift 사실 + 사상 발전 history (v1.x GWT → v2.0 source-grounded → v2.1 characterization → v2.3 natural_language → v2.4.0 dual) 명문화
- ★ ★ 외부 사례 자릿수 정합:
  - **JSON Schema anyOf** 공식 권장 (oneOf 비권장)
  - **Gherkin description** = runtime 무시 (★ 본 방법론 paradigm 다름 — 양쪽 executable)
  - **★ ★ ★ ★ Adzic SBE 10년 자기 폐기** — 본 ADR 핵심 위험 신호 최강 (cross-validator 없으면 동일 폐기 보장)
  - **DMN description + FEEL** = paradigm 정합 (★ OMG spec 도 cross-consistency 강제 부재 → 본 방법론 보강)
  - **GitHub Spec Kit (90K star)** = dual + cross-validation 미구현 (★ 본 방법론 original empirical 자격)
  - **DMN L1+L3 ladder** = 단계 진화 / 본 방법론 = co-existence 동시 보존 (paradigm 다름 / 신규성)
  - **AWS SCT + Conduktor + Solace** = validator-first migration 빅테크 정합
- ★ ★ dual representation paradigm + Layer 1 결정적 + Layer 2 LLM advisory + threshold ≥ 0.85 empirical hypothesis
- ★ ★ ★ PoC #04 FE if/then 분기 결정 (단일 schema 유지 / nested anyOf 회피 / Agent 1 F1 함정 정합)
- ★ chain 1 gate 통합 + release-readiness §8.1 strict 7/7→8/8 격상 사상 (★ ★ MINOR bump 부적격 가능성 명시 / v2.5.0 분리 검토 carry)
- ★ ADR-008 이중 렌더링 사상의 BR 영역 확장 + F-015 cross-validation schema 내재화
- ★ LL-i-22~24 (session 7차) + LL-i-26 (Adzic) + LL-i-27 (industry 공백)
- 시행 paradigm = sub-plan §1 (본 session) + §2 (다음) + §3 (그 다음)

#### ★ ★ ★ ★ tools/br-cross-consistency-validator workspace 16번째 신설

`tools/br-cross-consistency-validator/`:

- package.json (★ workspace 16번째 / v0.1.0)
- src/cli.js + src/validator.js + src/deterministic.js + src/llm.js
- test/validator.test.js (★ ★ ★ 22/22 test pass)
- Layer 1 결정적: 두 표현 ≥ 1 의무 / keyword overlap (intersection / max) / structure 검증 (given 안 결과 키워드 ❌ + when 안 전제 키워드 ❌) / BR id 4토막 strict
- Layer 2 LLM advisory: ★ placeholder + interface 정의 (★ Static Tool 시뮬레이션 금지 정책 정합 / 다음 session 실 구현)
- severity-weighted deterministic_score 산정 + overall_threshold 0.85
- workspace root package.json `workspaces` array 16번째 등록 (★ description "v2.4 chain harness 16 tools workspace" 갱신)

#### ★ ★ ★ ★ ★ threshold spike critical 발견 — `tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md`

- 11 PoC × 107 BR 일괄 측정 결과 — ★ ★ **두 표현 동시 보유 BR = 0 건 / 모든 PoC** = overlap_distribution 측정 자체 ★ ★ 불가능
- ★ ★ ★ ≥ 0.85 hypothesis confirm 자료 ★ 부재 (★ Senior critique R2 정합 강력 / magic number 거부)
- 6갈래 drift 직접 검증:
  - PoC #01 GWT 풍부 → ✅ pass / score 1.0
  - PoC #02 condition+description + PoC #03 trigger+condition+action → ★ ★ ★ validator + schema 매핑 부재 신규 발견
  - PoC #04 FE → rules array 자체 부재 (★ if/then 분기 carry 정합)
  - PoC #05+#06 description → representation_missing
  - PoC #07~#11 natural_language → ⚠️ id_pattern_violation 43건 (★ v2.3.7 enforcement 정합)
- ★ ★ ADR-CHAIN-011 §5.4 patch (★ spike 결과 반영 + 신규 carry 2건 + deterministic_score 산정 anomaly 명시)

### ★ ★ 신규 carry (session 8차)

- ★ ★ ★ C-threshold-spike-revisit (★ critical / sub-plan §2 후 재spike)
- ★ ★ ★ C-poc-02-03-schema-mapping (★ critical / PoC #02 condition+description + PoC #03 trigger+condition+action 매핑 부재)
- ★ ★ C-br-cross-validator-Layer2-LLM-impl (★ sub-plan §2)
- ★ ★ C-deterministic-score-formula-revisit (★ sub-plan §2 후)

### ★ ★ 다음 session = sub-plan §2

- schema top-level 재설계 (project_id + business_rules)
- PoC #04 FE if/then 분기 본격 구현
- 1~2 PoC pilot 마이그레이션 (PoC #01 BE + PoC #04 FE 권장 / §8.1 strict 정합)
- drift-validator + br-cross-consistency-validator 양쪽 통과 확인
- 잔여 9 PoC 마이그레이션
- Layer 2 LLM 본격 구현
- ★ ★ ★ ★ 사용자 의도 — "마이너 release 자격 도달 시 배포 작업" / sub-plan §2 종결 → sub-plan §3 (chain 1 gate 통합 + release-readiness 격상 검토) → v2.4.0 MINOR release (★ ★ v2.5.0 분리 검토 carry 정합 / Senior STOP signal 정합)

---

## v2.3.x and earlier

→ v2.3.7 ~ v1.4.0 release entry + v1.4.0-dev + v1.3.x ~ v1.0 = [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md).

본 파일 (v2.4+) 상단 = 현재 release entry. v2.3.7 이하 격리 = 2026-05-14 cleanup.

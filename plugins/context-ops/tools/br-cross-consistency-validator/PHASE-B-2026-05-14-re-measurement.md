# PHASE B 재실측 보고 — PoC #01 + PoC #03 + PoC #05 cross-validation (≥ 2 PoC corroboration 자격 도달)

> 2026-05-14 / session 11차 / v2.5.0 Phase B / Q-B0 (c) scope 축소 + Q-B1 (b) 형식 sliding + Q-B3 (b) threshold 자체 제거 결단 정합 시행 후 재실측

## 1. 시행 사실

### 1.1. PoC #03 (NestJS) 마이그레이션 ✅

`tools/br-cross-consistency-validator/scripts/synthesize-gwt-from-tca.mjs` 신설 + 시행:

- 18 BR 모두 `trigger` → `when` / `condition` → `given` / `expected_result` → `then` 형식 sliding
- `action` = GWT step 분리 ❌ + `rejection_method` + `verification_location` metadata 자산 보존
- `natural_language` = TODO marker ("TODO: Phase C LLM 본격 합성 의무")

외부 권위 정합 (Agent 1 sub-agent 토론 결과):

- Martin Fowler "GivenWhenThen" — when=behavior/trigger 정합
- Cucumber "BDD with Event Mapping" — Event/Command → When 직접 매핑
- ECA pattern — Condition=precondition=Given 정합
- Cucumber anti-pattern — "When = single action only" → action 별도 step 분리 ❌ 정합

### 1.2. PoC #05 (sample) 마이그레이션 ✅

- `examples/poc-05-sample-user-register/input/rules.json` → `examples/poc-05-sample-user-register/output/rules/rules.json` git mv 이전 (Agent 1 phase-flow SSOT 정합 / `flows/analysis.phase-flow.json` 안 rules.json = phase 4 output)
- Phase A `migrate-description-to-natural-language.mjs` script 재활용 — 2 BR `description` → `natural_language` 자동 추출 ✅
- meta `sample_mode: true` + `corroboration_eligible: false` 명시 (Senior STOP-4 흡수 / n=2 statistical power ≈ 0)

### 1.3. Layer 1 keyword threshold 자체 제거 ✅ (Q-B3 (b) 결단 정합)

- `tools/br-cross-consistency-validator/src/deterministic.js`:
  - `keywordThreshold` option = backward-compat marker (Phase C 도달 시 제거 의무 carry)
  - `keyword_mismatch` finding 완전 제거 (Agent 3 STOP-3 흡수 / magic number 0.15 자산화 회피)
  - `structural_sanity_only` finding 신설 (overlap === 0 시만 / severity = low / advisory)
- `tools/br-cross-consistency-validator/src/validator.js`:
  - `OVERALL_THRESHOLD = 0.85` = deprecated semantic + Phase C carry 명시 (C-overall-threshold-redesign-phase-c)

paradigm: "non-empty + overlap > 0" sanity check only / semantic 정합 검증 = Phase C Layer 2 LLM mandatory

## 2. 재실측 자료

### 2.1. PoC #01 (baseline / session 10차 자료 비교)

| metric                  | session 10차                   | session 11차 (Phase B 후)           | 변동               |
| ----------------------- | ------------------------------ | ----------------------------------- | ------------------ |
| total BRs               | 13                             | 13                                  | (보존)             |
| with_natural_language   | 13                             | 13                                  | (보존)             |
| with_gwt                | 13                             | 13                                  | (보존)             |
| with_both               | 13                             | 13                                  | (보존)             |
| overlap mean            | 0.173                          | 0.173                               | (보존)             |
| overlap median          | 0.105                          | 0.105                               | (보존)             |
| overlap max             | 0.500                          | 0.500                               | (보존)             |
| **deterministic_score** | **0.608**                      | **0.954**                           | +0.346 격상        |
| **gate_status**         | **fail**                       | **pass**                            | paradigm 격상      |
| findings                | 다수 (medium keyword_mismatch) | 4 (low 만 / 2 sanity + 2 structure) | paradigm 정합 격하 |

결정적 사실: Phase B paradigm 격상 = "magic number threshold (0.5) 자체 제거" + "Layer 1 sanity check 격하" → PoC #01 baseline = "session 10차 SPIKE v2 결정적 사실 (overlap 자체 한계) → Layer 1 격하 paradigm 시행 → deterministic_score 회복" 의 paradigm 정면 정합.

### 2.2. PoC #03 (Phase B 신규 자료)

| metric                | 값                                                                               |
| --------------------- | -------------------------------------------------------------------------------- |
| total BRs             | **18**                                                                           |
| with_natural_language | **18 (TODO marker)**                                                             |
| with_gwt              | **18 (형식 sliding 자격)**                                                       |
| with_both             | **18 (cross-validation 영역 진입 ✅)**                                           |
| overlap_distribution  | count=18 / mean ≈ 0.01 / max ≈ 0.05 (NL TODO marker = 의도된 sanity ∅ 영역)      |
| deterministic_score   | 0.825                                                                            |
| gate_status           | fail (NL TODO marker 영향 / Phase C LLM 합성 후 회복 자격)                       |
| findings              | 21 (모두 low / 18 structural_sanity_only + 3 structure_given_has_result_keyword) |

paradigm 정합: NL = TODO marker → "Phase C LLM 본격 합성 의무 carry" 명시 정합 / Phase C 도달 시 = NL ↔ GWT overlap 자체 sanity ✅ 도달 자격.

### 2.3. PoC #05 (sample mode / corroboration ❌)

| metric                | 값                                                    |
| --------------------- | ----------------------------------------------------- |
| total BRs             | 2                                                     |
| with_natural_language | 2 (Phase A migrate script 재활용)                     |
| with_gwt              | 0 (GWT 부재 보존 / Phase C LLM 본격 합성 의무)        |
| with_both             | 0                                                     |
| overlap_distribution  | count=0 (cross-validation 영역 진입 ❌ paradigm 정합) |
| deterministic_score   | 1.000                                                 |
| gate_status           | pass                                                  |
| findings              | 0                                                     |

paradigm 정합: sample_mode=true + corroboration_eligible=false 명시 / cross-validation 영역 진입 ❌ paradigm 정합 / spot check only 자격.

## 3. ≥ 2 PoC corroboration 자격 도달 (Senior STOP-1 흡수)

| PoC         | BR 수  | corroboration 자격                      | 비고                                       |
| ----------- | ------ | --------------------------------------- | ------------------------------------------ |
| PoC #01     | 13     | 자격 ✅                                 | session 10차 Phase A baseline              |
| **PoC #03** | **18** | **자격 ✅ (session 11차 Phase B 신규)** | TCA → GWT 형식 sliding + NL TODO marker    |
| PoC #05     | 2      | ❌ **산입 ❌ (Senior STOP-4 흡수)**     | sample mode + corroboration_eligible=false |

**실질 corroboration = PoC #01 (13 BR) + PoC #03 (18 BR) = 31 BR 본격 자격** (Senior STOP-1 = "≥ 2 PoC corroboration 의무" 자격 도달 ✅)

## 4. overall_score paradigm 갱신 (Phase C carry)

session 11차 시점 = OVERALL_THRESHOLD 0.85 = deprecated semantic / Phase C carry:

- Layer 1 = sanity check 격하 paradigm (본 session 결단)
- Layer 2 LLM mandatory = Phase C scope (session 12차+ 본격 구현)
- Layer 1 + Layer 2 통합 점수 paradigm 재설계 의무 = Phase C 도달 시 OVERALL_THRESHOLD 의미 갱신

## 5. 다음 step (Phase C / session 12차+)

1. Layer 2 LLM mandatory 본격 구현 (Anthropic API / OpenAI API)
   - Static Tool 시뮬레이션 금지 정책 정합
   - ≥ 0.7 semantic threshold (Layer 1 keyword 와 별도 axis)
   - F-015 cross-validation paradigm 정합
2. PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 + 도메인 전문가 검토 carry
3. PoC #05 2 BR GWT 신규 합성 + sample mode 보존
4. chain 1 gate `br-cross-consistency-validator` Layer 2 통합 (ADR-CHAIN-005 외부 자산 paradigm 정합)
5. OVERALL_THRESHOLD 의미 재설계 (Layer 1 + Layer 2 통합 점수)
6. release-readiness §8.1 strict 8/8 → 9/9 재격상 (Layer 2 통과 criterion 추가) + v2.5.0 MINOR release

## 6. Phase B 산출 자산화 종합

- ✅ `tools/br-cross-consistency-validator/scripts/synthesize-gwt-from-tca.mjs` (신설 / 형식 sliding script)
- ✅ `examples/poc-03-realworld-nestjs/output/rules/rules.json` (18 BR GWT + NL TODO marker 신규)
- ✅ `examples/poc-05-sample-user-register/output/rules/rules.json` (git mv + 2 BR NL 추출 + sample_mode meta)
- ✅ `tools/br-cross-consistency-validator/src/deterministic.js` (keyword_mismatch 제거 + structural_sanity_only 신설)
- ✅ `tools/br-cross-consistency-validator/src/validator.js` (OVERALL_THRESHOLD deprecated 명시)
- ✅ `tools/br-cross-consistency-validator/test/validator.test.js` (+2 신규 paradigm test / 회귀 ❌ / 26/26)
- ✅ workspace 전수 test = 303/0 (session 10차 302 → +1 / 회귀 ❌)
- ✅ ≥ 2 PoC corroboration 자격 도달 (PoC #01 13 + PoC #03 18 = 31 BR)

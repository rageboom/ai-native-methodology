# plan — C-use-scenario-s2-gate (S2 AX전환 gate: characterization GREEN + augmentation RED 분리 enforcement)

> **상태**: 1원칙 plan 작성 (승인 대기). 4원칙 step 1.
> **trigger**: session 55차 잔여 carry 점검 → 추천 = "S2 gate (주 타깃 capability 공백)". use-scenario taxonomy(v11.7.0)가 S2 를 주 타깃으로 선언했으나 gate(v11.9.0 Slice 1)는 `S2=S1 fallback` 으로 비워둠.
> **SSOT 참조**: `methodology-spec/use-scenario-taxonomy.md` §2.1·§5(carry 표) + `tools/chain-driver/src/gate-eval.js:34-44`(SCENARIO_EXPECTED) + `schemas/test-spec.schema.json:66`(per-TC expected_outcome).
> **paradigm 정합**: dogfood-first (memory `feedback_paradigm_stable_point_cadence` — 안정점 후 새 feature ≠ default) + self-referential drift 회피 (`feedback_self_referential_corrective_drift`) + §8.1 단일 PoC 과적합 회피.

## 1. 진단 (현 gap)

`gate-eval.js` SCENARIO_EXPECTED:

```js
S1:         { test: 'all_fail',       implement: 'all_pass' },
greenfield: { test: 'all_fail',       implement: 'all_pass' },
S2:         { test: 'all_fail',       implement: 'all_pass' }, // ← Slice 1 fallback (틀림)
S3:         { test: 'snapshot_green', implement: 'all_pass' },
```

- **S2 의 본질** (taxonomy §2 표): legacy 코드를 **in-place 증강**. test 산출물 = ① **characterization** TC (기존 legacy 동작 포착 → legacy 코드 존재하므로 **GREEN 기대**) + ② **augmentation** TC (신규 증강분 → impl 부재이므로 **RED 기대**).
- 현 `S2=all_fail` 은 characterization TC 까지 RED 를 요구 → legacy 가 살아 있으면 characterization 은 GREEN 이라 **gate 가 정상 산출물을 오탐 block**. = F-DOGFOOD-007(brownfield RED)이 S2 에서 재현되는 지점.
- **gate 의 구조적 한계**: `evaluateGate` 는 **aggregate** 검사만 함 (`findings.tests_failed === 0` → all_fail 위반 block / gate-eval.js:94). characterization+augmentation **혼합**을 표현할 수 없음.

## 2. 설계 (핵심)

### 2-A. 분리 신호 = per-TC `expected_outcome` (이미 존재 / 신규 필드 최소화)

test-spec.schema.json:66 에 이미 `expected_outcome: enum[pass, fail]` (per-TC) 존재. S2 매핑:

- characterization TC → `expected_outcome: "pass"` (legacy 동작 보존 확인)
- augmentation TC → `expected_outcome: "fail"` (RED until impl)

→ **aggregate all_fail/all_pass 대신 per-TC expected vs actual 일치**를 검사하면 S2 혼합이 자연 해소. (S1/greenfield 도 동일 메커니즘으로 일반화 가능 — 단 본 plan 은 S2 만 분리, S1 회귀 0 유지.)

### 2-B. `test_intent` 라벨 (semantic 명시성 / additive enum)

`expected_outcome` 만으로는 "왜 pass 기대인가"가 안 드러남. test_cases[].items 에 `test_intent` 추가:

- enum: `["characterization", "augmentation"]`, **optional** (additive / 기존 PoC breaking 0).
- characterization ⇒ expected_outcome=pass 정합 / augmentation ⇒ expected_outcome=fail(test stage) 정합.
- S2 가 아닌 시나리오에선 미사용(무시).

### 2-C. gate enforcement 분기 (S2 전용 / 비파괴)

`SCENARIO_EXPECTED.S2` 를 새 모드 `'per_tc_outcome'` 로:

```js
S2: { test: 'per_tc_outcome', implement: 'all_pass' },
```

- validator(`test-impl-pass-validator`)가 per-TC `expected_outcome` vs 실 runner 결과 비교 → **mismatch 개수**(`outcome_mismatches`) 를 findings 에 emit.
- `evaluateGate(stage='test', ..., scenario='S2')`: `expected.test==='per_tc_outcome'` 이면 aggregate all_fail 검사 skip, 대신 `findings.outcome_mismatches > 0` 시 block. (characterization 이 fail 났거나 augmentation 이 pass 났으면 mismatch.)
- implement stage = S2 도 `all_pass` 유지 (augmentation 이 GREEN 전환 + characterization 여전히 GREEN).

## 3. §8.1 corroboration 제약 + dogfood-first 긴장 (정직 — 사용자 결단 필수)

taxonomy §5 carry 표: **`C-use-scenario-s2-gate` 자격 게이트 = "§8.1 ≥2 S2 PoC corroboration"**. 현 보유 S2 corroboration = **0** (RealWorld dogfood = S1/brownfield 로 수행 / poc-17 = analysis only).

→ **speculative 하게 enforcement 를 hard-lock 하면 §8.1 위반 + self-referential drift** (codegraph scope-out / cooling-off 재도입 cycle 동형). 따라서 본 plan 은 **2-track 결단**을 사용자에 제시:

- **Track α (additive groundwork + dogfood-driven / 권장)**: 본 slice 에서 schema `test_intent` + gate `per_tc_outcome` 분기를 **additive·WARN 수준**(intent_certainty v11.6.0 optional-WARN 선례 정합)으로 넣되, **실 S2 dogfood 로 구동**. = poc-17(IFRS car migration = 교과서적 S2 AX전환) 또는 RealWorld 를 `--scenario S2` 로 재선언해 chain 4 까지 돌려 gate 가 실제로 무엇을 해야 하는지 1차 corroboration 확보. hard-lock(reject)은 ≥2 corroboration 후.
- **Track β (구조만 / dogfood 보류)**: schema+gate 분기만 additive 로 넣고 enforcement 는 WARN 고정, corroboration 은 미래 trigger 로 carry. (= 기능은 들어가나 "검증 없는 paradigm" 위험 / 권장 ❌.)

**dogfood-first 원칙상 Track α 가 정합** — gate 를 추측으로 짜지 말고 실 S2 진입이 끌고 가게.

## 4. 시행 slice (Track α 기준)

1. **schema** test-spec.schema.json: `test_intent` enum additive (optional / additionalProperties:false 유지).
2. **gate** gate-eval.js: `S2.test='per_tc_outcome'` + `per_tc_outcome` 분기 (outcome_mismatches>0 block / 단 corroboration 0 동안은 **WARN severity** = go-with-warnings 허용).
3. **validator** test-impl-pass-validator: per-TC expected_outcome vs 실 결과 비교 → `outcome_mismatches` emit + test 신규 (characterization pass / augmentation fail / mismatch 케이스).
4. **S2 dogfood 1건** (Track α / 외부 repo): poc-17 또는 RealWorld 를 `chain-driver init --scenario S2` → characterization TC 셋 + augmentation TC 셋 라벨 → chain 4 gate 실측 → finding(F-DOGFOOD-S2-\*) + corroboration 자산. (≥2 까지는 carry.)
5. **doc**: taxonomy §5 carry 표 S2 행 상태 갱신(부분 / corroboration 1/2) + DEC-2026-05-30-s2-gate-slice + INDEX + CHANGELOG + version 3-way.

## 5. test / gate 영향

- schema additive → 기존 PoC test-spec(test_intent 없음) 여전히 valid. 검증.
- gate per_tc_outcome 분기 = **S2 한정** (S1/greenfield/S3 매트릭스 무변경) → 기존 6/6 e2e 회귀 0. 신규 test (S2 per-TC 일치/불일치).
- validator outcome_mismatches = additive export → 기존 validator test 영향 0 + 신규.
- breaking 0 (전부 additive / S2 분기 격리).

## 6. 위험 / rollback

- per_tc_outcome 가 S1 aggregate 로직과 충돌? → S2 분기로만 진입, S1 코드경로 무변경으로 격리. e2e 6/6 회귀로 검증.
- corroboration 0 상태 hard-lock 위험 → WARN severity 로 시작 (block ❌ / go-with-warnings). ≥2 후 별 release 에서 rank 격상.
- S2 dogfood 가 설계 가정(characterization GREEN + augmentation RED)을 반증하면 → 설계 재검토 (plan revert / finding 우선).

## 7. 핵심 결정 (사용자 승인 묶음)

1. **Track α(dogfood-driven / 권장) vs Track β(구조만)?** → α 권장 (dogfood-first / 추측 enforcement 회피).
2. **enforcement severity** = corroboration 0 동안 WARN(go-with-warnings) vs 즉시 block? → **WARN** (§8.1 / intent_certainty 선례).
3. **S2 dogfood target** = poc-17(IFRS / 사내 / 교과서적 S2) vs RealWorld(OSS / 재선언) vs 둘 다? → 1차 1건 후 결정 (≥2 는 carry).
4. **test_intent** = optional WARN(권장) vs required? → optional (backward-compat / 추후 major 에 승격).
5. release 단위 = schema+gate+validator+dogfood 단일 MINOR vs 분리? → 단일 MINOR(additive).

## 8. 인용

- `methodology-spec/use-scenario-taxonomy.md` §2.1(S2 함의)·§5(carry 표 자격 게이트)
- `tools/chain-driver/src/gate-eval.js:34-44, 91-100` (SCENARIO_EXPECTED / test stage 분기)
- `schemas/test-spec.schema.json:43-75` (type/framework/expected_outcome/fail_mode)
- `tools/test-impl-pass-validator/` (per-TC 결과 비교 확장 지점)
- ADR-CHAIN-006 (Feathers Characterization Testing) / ADR-CHAIN-004 (Aider 패턴 진짜 runner)
- memory `feedback_paradigm_stable_point_cadence` (dogfood-first) + `feedback_self_referential_corrective_drift` (추측 enforcement 회피)

# DEC-2026-05-30-s2-gate-slice

**결단**: `C-use-scenario-s2-gate` (DEC-2026-05-30-use-scenario-taxonomy §5 / use-scenario-taxonomy.md §5 carry 표) 의 **Track α 시행** — S2(AX전환) gate 를 `S2=S1 fallback(all_fail)` 공백에서 **per_tc_outcome 분기**(characterization GREEN + augmentation RED 분리)로 구현. 단 §8.1 ≥2 S2 corroboration 미충족(현 1/2) → enforcement = **WARN**(go-with-warnings / hard-block ❌). v11.11.0 MINOR.

**작성일**: 2026-05-30 (session 55차 — 잔여 carry 점검 → 추천 = S2 gate(주 타깃 공백) → 사용자 결단 "이 순서로 진행" + AskUserQuestion Track α + target=RealWorld).

**relates to**:
- `DEC-2026-05-30-use-scenario-taxonomy.md` §5 (carry 출처 / 자격 게이트 = §8.1 ≥2 S2 corroboration)
- `DEC-2026-05-30-use-scenario-impl-slice1.md` (Slice 1 = `S2=S1 fallback` 잔여 명시)
- `DEC-2026-05-30-fdogfood-003-intent-certainty.md` §3 (F-DOGFOOD-007 brownfield RED — 본 gate 가 구조적 해소)
- `~/Documents/.../ai-native-methodology/.claude/plans/plan-use-scenario-s2-gate.md` (설계 plan / 사용자 승인)

---

## 1. 배경

use-scenario taxonomy(v11.7.0)가 **S2(AX전환)를 주 타깃**으로 선언했으나, Slice 1(v11.9.0)의 gate 매트릭스는 `S2: { test: 'all_fail', implement: 'all_pass' }` = S1 fallback 으로 공백. S2 의 본질 = legacy **in-place 증강** → test 산출물이 **characterization**(기존 동작 포착 / impl 존재 → GREEN) + **augmentation**(신규 증강분 / impl 부재 → RED) 혼합인데, aggregate `all_fail` 은 characterization 까지 RED 를 요구해 정상 산출물을 오탐 block (= F-DOGFOOD-007 재현). gate `evaluateGate` 가 aggregate(`tests_failed`)만 검사 → 혼합 표현 불가.

## 2. 시행 (additive / breaking 0)

| 영역 | 변경 |
|---|---|
| `schemas/test-spec.schema.json` | test_cases[].items 에 optional `test_intent` enum `[characterization, augmentation]` (additive / additionalProperties:false 정합 / 미지정 = aggregate fallback). |
| `tools/chain-driver/src/gate-eval.js` | `SCENARIO_EXPECTED.S2.test = 'per_tc_outcome'` + evaluateGate test stage 분기 (`findings.outcome_mismatches > 0` → reason `s2_outcome_mismatch`) + severityRank `s2_outcome_mismatch: 2`(coverage_threshold 수준 / go-with-warnings 허용). S1/greenfield/S3 매트릭스 무변경. |
| `tools/test-impl-pass-validator/src/s2-outcome-check.js` (신규) | 순수 모듈 — `reconcileOutcomes(testCases, actualByTcId)` (per-TC expected_outcome ↔ 실 결과 대조 → outcome_mismatches/evaluated/missing_actual) + `correlateByTcId(testResults, testCases)` (test-name→TC-id substring 상관 규약). |
| `tools/chain-driver/test/scenario.test.js` | +5 test (S2 per_tc_outcome: mismatch=0 통과 / mismatch>0 block / all-pass 허용 / WARN override / implement GREEN). |
| `tools/test-impl-pass-validator/test/s2-outcome-check.test.js` (신규) | +10 test (reconcile 6 + correlate 4). |

### 2.1 per_tc_outcome 매트릭스
- characterization → `expected_outcome='pass'` (legacy 코드 존재 → GREEN 기대).
- augmentation → `expected_outcome='fail'` (impl 부재 → RED 기대 / impl 후 pass 격상).
- gate = aggregate all_fail/all_pass 가 아니라 **per-TC expected ↔ actual 일치**(`outcome_mismatches`)로 판정. characterization 이 fail 나거나 augmentation 이 pass 나면 mismatch → block.
- implement stage = S2 도 `all_pass`(augmentation GREEN 전환 + characterization GREEN 유지).

## 3. ★ §8.1 corroboration + WARN (정직)

자격 게이트 = "§8.1 ≥2 S2 PoC corroboration". 현 보유 = **1/2**:
- **1차 corroboration (RealWorld / Track α)**: RealWorld(brownfield) 25 TC 전부 characterization → S2 reframe(`test-spec.s2-reframe.json`) **schema-valid** + real gate 코드로 **S1 false-block(F-007) → S2 해소** 실증 (`evaluateGate` S1 blocked=true `evidence_missing` / S2 blocked=false). 측정 = `_dogfood-realworld/.../s2-gate-probe.md` + finding F-DOGFOOD-012.
- **2차 = carry**: 실 characterization GREEN **execution** corroboration = Java/Gradle 부재(RISK-ENV-001)로 미측정 / no-simulation 정책상 GREEN 날조 ❌ → runnable S2 환경(poc-17 사내 Java / RealWorld CI) 의무. **augmentation arm** 도 미실증(RealWorld 신규 기능 부재).

→ enforcement = **WARN**(`s2_outcome_mismatch` rank 2 / 사용자 go → go-with-warnings 허용 / block 격상 ❌). intent_certainty(v11.6.0 optional-WARN) 선례 정합. ≥2 충족 후 rank 격상 = 별 release.

## 4. paradigm 정합 (dogfood-first / self-referential drift 회피)

- gate 를 추측으로 hard-lock ❌ — 실 S2 dogfood(RealWorld)가 구동. F-007(real high finding / MyBatis+JPA+RealWorld arm corroborated)이 해결 대상 = self-referential 아님 (실 dogfood 데이터 기반).
- brownfield 토글(단순 GREEN 패치) ❌ — 시나리오별 매트릭스로 교정 (S1 의 test 대상=생성될 코드 보존 / taxonomy §2.2 정합).

## 5. STOP-3

workspace test (chain-driver 250 + test-impl-pass-validator 40 / +15 신규) + release-readiness 22/22 + skill-citation 0 stale + version 3-way 11.11.0 + breaking 0 = MINOR.

## 6. carry

- `C-use-scenario-s2-gate` = **부분 시행** (gate+schema+validator+1차 corroboration). 잔여 자격 = ≥2 execution corroboration(2차) + augmentation arm 실증 → enforcement WARN→block 격상.
- test-name→TC-id 상관 규약(correlateByTcId) end-to-end cli wiring = 실 S2 dogfood(runnable env)가 규약 적합성 실측 후 결정.

DEC-2026-05-30-s2-gate-slice. Resolves (부분) DEC-2026-05-30-use-scenario-taxonomy §5 `C-use-scenario-s2-gate`.

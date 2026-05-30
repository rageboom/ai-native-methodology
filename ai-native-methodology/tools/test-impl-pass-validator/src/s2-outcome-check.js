// s2-outcome-check.js — S2(AX전환) per-TC outcome reconciliation (★ v11.11.0).
// C-use-scenario-s2-gate / DEC-2026-05-30-s2-gate-slice / use-scenario-taxonomy.md §2.1.
//
// S2 = legacy in-place 증강. test-spec 의 test_cases 는 두 부류 혼합:
//   - characterization (test_intent='characterization') → 기존 legacy 동작 포착 → expected_outcome='pass' (GREEN 기대)
//   - augmentation     (test_intent='augmentation')     → 신규 증강분 (impl 부재) → expected_outcome='fail' (RED 기대 / impl 후 pass 격상)
//
// aggregate all_fail/all_pass 로는 이 혼합을 표현할 수 없다 (gate-eval.js SCENARIO_EXPECTED.S2 = 'per_tc_outcome').
// 본 모듈 = per-TC expected_outcome ↔ 실 runner 결과 일치 검사 → outcome_mismatches (gate findings).
//
// ★ 순수 함수 (no I/O). test-name → TC-id 상관(correlateByTcId)은 규약 의존 — S2 dogfood 가 end-to-end 로 구동·검증.

const PASS = 'pass';
const FAIL = 'fail';

/**
 * test-spec test_cases[] 와 TC-id 별 실 결과를 대조해 outcome mismatch 를 센다.
 *
 * @param {Array<{id?: string, expected_outcome?: string, test_intent?: string}>} testCases  test-spec.test_cases
 * @param {Record<string, 'pass'|'fail'>} actualByTcId  TC-id → 실 runner 결과 ('pass'|'fail')
 * @returns {{ outcome_mismatches: number, evaluated: number, missing_actual: number,
 *            details: Array<{tc_id: string, test_intent: string|null, expected: string, actual: string|null, match: boolean}> }}
 */
export function reconcileOutcomes(testCases, actualByTcId = {}) {
  const details = [];
  let outcome_mismatches = 0;
  let evaluated = 0;
  let missing_actual = 0;

  for (const tc of testCases ?? []) {
    // expected_outcome 미선언 TC = 판정 대상 아님 (skip / S2 라벨 없는 잔여 TC 허용).
    if (tc?.expected_outcome !== PASS && tc?.expected_outcome !== FAIL) continue;

    const tcId = tc.id ?? null;
    const expected = tc.expected_outcome;
    const actual = tcId != null && Object.prototype.hasOwnProperty.call(actualByTcId, tcId)
      ? actualByTcId[tcId]
      : null;

    if (actual == null) {
      // 실 결과를 못 찾음 = 상관 실패 (정직 표기 / mismatch 아님 / 별도 카운트).
      missing_actual += 1;
      details.push({ tc_id: tcId, test_intent: tc.test_intent ?? null, expected, actual: null, match: false });
      continue;
    }

    evaluated += 1;
    const match = actual === expected;
    if (!match) outcome_mismatches += 1;
    details.push({ tc_id: tcId, test_intent: tc.test_intent ?? null, expected, actual, match });
  }

  return { outcome_mismatches, evaluated, missing_actual, details };
}

/**
 * 실 runner 의 test-name 별 결과를 TC-id 키 맵으로 상관(correlate)한다.
 * 규약: test-name 안에 TC-id (예: 'TC-CAR-001') 가 substring 으로 포함된다고 가정.
 *   (S2 dogfood 가 이 규약의 적합성을 실측·검증 — 부적합 시 finding + 규약 보강.)
 * 충돌(같은 TC-id 가 여러 test-name): 하나라도 fail 이면 fail (보수적).
 *
 * @param {Array<{name: string, status: 'pass'|'fail'|'skip'}>} testResults  per-test 결과
 * @param {Array<{id?: string}>} testCases  test-spec.test_cases (TC-id 목록)
 * @returns {Record<string, 'pass'|'fail'>}  TC-id → 결과
 */
export function correlateByTcId(testResults, testCases) {
  const tcIds = (testCases ?? []).map((t) => t?.id).filter(Boolean);
  const out = {};
  for (const tcId of tcIds) {
    const matched = (testResults ?? []).filter((r) => typeof r?.name === 'string' && r.name.includes(tcId));
    if (matched.length === 0) continue; // 상관 실패 → reconcile 에서 missing_actual.
    // skip 은 무시, 하나라도 fail 이면 fail.
    const anyFail = matched.some((r) => r.status === FAIL);
    const anyPass = matched.some((r) => r.status === PASS);
    if (anyFail) out[tcId] = FAIL;
    else if (anyPass) out[tcId] = PASS;
    // 전부 skip → 미기록 (missing_actual 로 흐름).
  }
  return out;
}

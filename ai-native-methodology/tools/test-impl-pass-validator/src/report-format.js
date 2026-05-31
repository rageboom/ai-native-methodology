// report-format.js — test-cmd report_format → test-spec report_format 정규화.
// ★ F-T06 / T14 (INSPECTION-2026-05-31-test) — 두 enum 의 교집합이 ∅ 이라
//   buildEvidence 가 test-cmd 값(하이픈)을 그대로 evidence 에 기입하면 test-spec
//   `test_cases[].test_run_evidence.report_format` 로 복사 시 schema-validator 파손.
//   본 모듈이 항상 test-spec enum 유효값을 emit (무효 enum 누수 차단).
//
// test-cmd  report_format enum: sarif-2.1.0 | junit-xml | json | stdout-regex
// test-spec report_format enum: sarif_2_1_0 | junit_xml | jest_json | pytest_json
//                               | vitest_json | lcov | cobertura_xml | jacoco_xml | stdout_regex
//
// ★ no-simulation/honesty 정합 — stdout 파싱 결과를 jest_json 등으로 거짓 라벨 ❌.
//   adapter 없는 framework(other 경유 stdout 파싱) = stdout_regex 로 정직 라벨.

// test-spec.schema.json:177 report_format enum (★ stdout_regex 는 v11.19 additive).
export const TEST_SPEC_REPORT_FORMATS = new Set([
  'sarif_2_1_0',
  'junit_xml',
  'jest_json',
  'pytest_json',
  'vitest_json',
  'lcov',
  'cobertura_xml',
  'jacoco_xml',
  'stdout_regex',
]);

// json 형식을 산출하는 framework adapter (test-spec 에 *_json 대응값 존재).
const FRAMEWORK_JSON = {
  jest: 'jest_json',
  vitest: 'vitest_json',
  pytest: 'pytest_json',
};

/**
 * test-cmd report_format(또는 이미 정규화된 값)을 test-spec enum 유효값으로 정규화.
 * @param {string|undefined|null} value  test-cmd.report_format (default 'json')
 * @param {string|undefined|null} framework  test-cmd.framework (json→*_json 결정용)
 * @returns {string} TEST_SPEC_REPORT_FORMATS 의 한 값 (항상 유효)
 */
export function normalizeReportFormat(value, framework) {
  // 이미 test-spec enum 값이면 그대로 (idempotent).
  if (value && TEST_SPEC_REPORT_FORMATS.has(value)) return value;

  switch (value) {
    case 'sarif-2.1.0':
      return 'sarif_2_1_0';
    case 'junit-xml':
      return 'junit_xml';
    case 'stdout-regex':
      return 'stdout_regex';
    case 'json':
    case undefined:
    case null:
      // adapter 있는 framework = framework별 *_json / junit5 의 json 은 비정상 → junit_xml /
      // 그 외(go-test/rspec/mocha/other 등 = stdout 파싱 경유) = stdout_regex (정직 라벨).
      if (framework && FRAMEWORK_JSON[framework]) return FRAMEWORK_JSON[framework];
      if (framework === 'junit5') return 'junit_xml';
      return 'stdout_regex';
    default:
      // 미지의 값 = 안전한 정직 fallback (stdout 파싱 가정 / 무효 enum 누수 ❌).
      return 'stdout_regex';
  }
}

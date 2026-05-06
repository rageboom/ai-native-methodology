// pytest adapter — pytest-json-report plugin 산출 JSON 또는 stdout 정규식 fallback.
// pytest-json-report schema: { summary: { passed, failed, skipped, error, total }, tests: [{ nodeid, outcome }] }

export const FRAMEWORK = 'pytest';

export function parsePytestJson(jsonOrText) {
  let data;
  try {
    data = typeof jsonOrText === 'string' ? JSON.parse(jsonOrText) : jsonOrText;
  } catch (e) {
    throw new Error(`pytest adapter — invalid JSON: ${e.message}`);
  }

  const summary = data.summary ?? {};
  const test_names = (data.tests ?? []).map(t => t.nodeid).filter(Boolean);

  const pass_count = summary.passed ?? 0;
  const fail_count = (summary.failed ?? 0) + (summary.error ?? 0);
  const skip_count = summary.skipped ?? 0;

  return {
    framework: FRAMEWORK,
    pass_count,
    fail_count,
    skip_count,
    total: summary.total ?? (pass_count + fail_count + skip_count),
    test_names,
    success: fail_count === 0 && pass_count > 0,
  };
}

export function buildArgs(testCmdArgs = [], reportPath = '.aimd/output/evidence/pytest-report.json') {
  // pytest-json-report plugin: --json-report --json-report-file=<path>
  return [...testCmdArgs, '--json-report', `--json-report-file=${reportPath}`];
}

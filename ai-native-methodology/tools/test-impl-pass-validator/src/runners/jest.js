// Jest adapter — `jest --json` stdout 또는 `--outputFile` 으로 JSON output capture.
// jest output schema: { numTotalTests, numPassedTests, numFailedTests, numPendingTests, testResults: [{ assertionResults: [{ fullName, status }] }] }

export const FRAMEWORK = 'jest';

export function parseJestJson(jsonOrText) {
  let data;
  try {
    data = typeof jsonOrText === 'string' ? JSON.parse(jsonOrText) : jsonOrText;
  } catch (e) {
    throw new Error(`jest adapter — invalid JSON: ${e.message}`);
  }

  const test_names = [];
  for (const file of (data.testResults ?? [])) {
    for (const a of (file.assertionResults ?? [])) {
      const name = a.fullName ?? a.title;
      if (name) test_names.push(name);
    }
  }

  return {
    framework: FRAMEWORK,
    pass_count: data.numPassedTests ?? 0,
    fail_count: data.numFailedTests ?? 0,
    skip_count: data.numPendingTests ?? 0,
    total: data.numTotalTests ?? test_names.length,
    test_names,
    success: (data.success === true) || ((data.numFailedTests ?? 0) === 0 && (data.numTotalTests ?? 0) > 0),
  };
}

// 반환 명령 — caller 가 spawnSync 에 사용.
export function buildArgs(testCmdArgs = []) {
  // jest 의 reporter args 와 충돌 방지. caller 가 args 에 --json 붙이도록 권장.
  return ['--json', ...testCmdArgs];
}

// Vitest adapter — `vitest run --reporter=json` (또는 --reporter=verbose).
// vitest JSON: { numTotalTests, numPassedTests, numFailedTests, numPendingTests, testResults }
// jest 호환 reporter 라 schema 거의 동일.

export const FRAMEWORK = 'vitest';

export function parseVitestJson(jsonOrText) {
	let data;
	try {
		data = typeof jsonOrText === 'string' ? JSON.parse(jsonOrText) : jsonOrText;
	} catch (e) {
		throw new Error(`vitest adapter — invalid JSON: ${e.message}`);
	}

	const test_names = [];
	const tests = []; // F-I05 — per-test {name,status} (S2 correlateByTcId 용 / additive).
	for (const file of data.testResults ?? []) {
		for (const a of file.assertionResults ?? []) {
			const name = a.fullName ?? a.title;
			if (!name) continue;
			test_names.push(name);
			const status =
				a.status === 'passed'
					? 'pass'
					: a.status === 'failed'
						? 'fail'
						: 'skip';
			tests.push({ name, status });
		}
	}

	return {
		framework: FRAMEWORK,
		pass_count: data.numPassedTests ?? 0,
		fail_count: data.numFailedTests ?? 0,
		skip_count: data.numPendingTests ?? 0,
		total: data.numTotalTests ?? test_names.length,
		test_names,
		tests,
		success:
			data.success === true ||
			((data.numFailedTests ?? 0) === 0 && (data.numTotalTests ?? 0) > 0),
	};
}

export function buildArgs(testCmdArgs = []) {
	return ['run', '--reporter=json', ...testCmdArgs];
}

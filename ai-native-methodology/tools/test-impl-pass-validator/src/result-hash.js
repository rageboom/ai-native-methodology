// result-hash — SARIF Appendix F deterministic log 정합.
// ADR-CHAIN-004 §5 — sha256(sorted(test_names) + pass:fail:skip + framework:version).
// 제외: timestamp / duration / 절대경로 / random seed / order.

import { createHash } from 'node:crypto';

/**
 * Compute deterministic result_hash from runner output.
 *
 * input: {
 *   test_names: string[]    // 모든 test full name (의미 있는 ID)
 *   pass_count: number
 *   fail_count: number
 *   skip_count: number
 *   framework: string
 *   framework_version: string
 * }
 *
 * 정규화 절차:
 *   1. test_names — sort 알파벳 ascending (order 비결정 차단)
 *   2. join with '\n'
 *   3. + '\n' + pass:fail:skip
 *   4. + '\n' + framework:framework_version
 *   5. sha256 hex digest
 *
 * 절대경로 / timestamp / duration_ms / random seed → 입력 ❌.
 */
export function computeResultHash({
	test_names,
	pass_count,
	fail_count,
	skip_count,
	framework,
	framework_version,
}) {
	if (!Array.isArray(test_names)) {
		throw new TypeError('test_names must be array');
	}
	for (const tn of test_names) {
		if (typeof tn !== 'string')
			throw new TypeError(`test_names entry must be string: ${tn}`);
	}

	const sorted = [...test_names].sort();
	const lines = [
		sorted.join('\n'),
		`${pass_count}:${fail_count}:${skip_count}`,
		`${framework}:${framework_version ?? 'unknown'}`,
	].join('\n');

	return 'sha256:' + createHash('sha256').update(lines, 'utf-8').digest('hex');
}

/**
 * Validate that a result_hash is reproducible — same input must yield same output.
 * 본 도구의 invariant 입증용 (CI dry-run / unit test).
 */
export function isDeterministic(input1, input2) {
	return computeResultHash(input1) === computeResultHash(input2);
}

/**
 * Strip non-deterministic fields from a runner output before hashing.
 * 절대경로 → relative / timestamps → null / random seed → null.
 */
export function normalizeForHash(raw) {
	const cleaned = {
		test_names: raw.test_names ?? [],
		pass_count: Number(raw.pass_count ?? 0),
		fail_count: Number(raw.fail_count ?? 0),
		skip_count: Number(raw.skip_count ?? 0),
		framework: String(raw.framework ?? 'unknown'),
		framework_version: String(raw.framework_version ?? 'unknown'),
	};
	return cleaned;
}

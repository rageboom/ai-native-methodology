// result-hash unit test (ADR-CHAIN-004 §5 정합 / SARIF Appendix F deterministic).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
	computeResultHash,
	isDeterministic,
	normalizeForHash,
} from '../src/result-hash.js';

test('result-hash — same input → same hash (deterministic)', () => {
	const input = {
		test_names: ['user.login', 'user.logout', 'article.create'],
		pass_count: 3,
		fail_count: 0,
		skip_count: 0,
		framework: 'jest',
		framework_version: '29.7.0',
	};
	const h1 = computeResultHash(input);
	const h2 = computeResultHash(input);
	assert.equal(h1, h2);
	assert.match(h1, /^sha256:[a-f0-9]{64}$/);
});

test('result-hash — order-independent (sort 정규화)', () => {
	const a = computeResultHash({
		test_names: ['a', 'b', 'c'],
		pass_count: 3,
		fail_count: 0,
		skip_count: 0,
		framework: 'jest',
		framework_version: '29.7.0',
	});
	const b = computeResultHash({
		test_names: ['c', 'a', 'b'],
		pass_count: 3,
		fail_count: 0,
		skip_count: 0,
		framework: 'jest',
		framework_version: '29.7.0',
	});
	assert.equal(a, b, 'sort 정규화로 같은 hash 의무 (order 비결정 차단)');
});

test('result-hash — different counts → different hash', () => {
	const base = {
		test_names: ['a'],
		framework: 'jest',
		framework_version: '29.7.0',
	};
	const a = computeResultHash({
		...base,
		pass_count: 1,
		fail_count: 0,
		skip_count: 0,
	});
	const b = computeResultHash({
		...base,
		pass_count: 0,
		fail_count: 1,
		skip_count: 0,
	});
	assert.notEqual(a, b);
});

test('result-hash — different framework → different hash', () => {
	const base = {
		test_names: ['a'],
		pass_count: 1,
		fail_count: 0,
		skip_count: 0,
	};
	const a = computeResultHash({
		...base,
		framework: 'jest',
		framework_version: '29.7.0',
	});
	const b = computeResultHash({
		...base,
		framework: 'vitest',
		framework_version: '29.7.0',
	});
	assert.notEqual(a, b);
});

test('result-hash — timestamp/duration 입력 부재 → 결정적 (SARIF Appendix F)', () => {
	// 본 함수는 timestamp / duration / abs path 인자 자체가 없음 → 자연스러운 차단.
	// 호출 시 어느 timestamp 든 줘도 영향 ❌ 입증.
	const input1 = {
		test_names: ['a'],
		pass_count: 1,
		fail_count: 0,
		skip_count: 0,
		framework: 'jest',
		framework_version: '29.7.0',
		// 추가 random 필드 — schema 가 무시
		timestamp: '2026-01-01T00:00:00Z',
		duration_ms: 12345,
		abs_path: '/Users/x/abs/path',
	};
	const input2 = {
		test_names: ['a'],
		pass_count: 1,
		fail_count: 0,
		skip_count: 0,
		framework: 'jest',
		framework_version: '29.7.0',
		timestamp: '2099-12-31T23:59:59Z',
		duration_ms: 99999,
		abs_path: '/different/path',
	};
	assert.ok(isDeterministic(input1, input2));
});

test('result-hash — invalid input rejected', () => {
	assert.throws(
		() => computeResultHash({ test_names: 'not-array' }),
		/must be array/,
	);
	assert.throws(
		() => computeResultHash({ test_names: [123] }),
		/must be string/,
	);
});

test('result-hash — normalizeForHash strips garbage fields', () => {
	const dirty = {
		test_names: ['a', 'b'],
		pass_count: '2', // string 입력 → number 변환
		fail_count: 0,
		skip_count: undefined,
		framework: 'jest',
		timestamp: 'X',
		duration_ms: 999,
	};
	const clean = normalizeForHash(dirty);
	assert.equal(clean.pass_count, 2);
	assert.equal(clean.skip_count, 0);
	assert.equal(clean.framework_version, 'unknown');
	assert.equal(clean.timestamp, undefined, 'timestamp 자체 strip 됨');
});

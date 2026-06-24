// Unit tests for token-roi-bench.js pure logic (토큰 절감 ROI 회계).
// Covers: pct() 백분율 계산 + base=0 가드, estimateTokens() chars/4, aggregate() 비율 평균 + null skip.
// main() 은 직접-실행 가드라 import 시 grep/codegraph/fs I/O 안 돎.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pct, estimateTokens, aggregate } from '../token-roi-bench.js';

test('pct — (saved/base) 0.1% 단위, base=0 가드', () => {
	assert.equal(pct(50, 100), 50);
	assert.equal(pct(645, 1000), 64.5); // 0.1% 단위 반올림
	assert.equal(pct(1, 3), 33.3);
	assert.equal(pct(0, 100), 0);
	assert.equal(pct(100, 0), 0, 'base=0 → 0 (NaN/Infinity 방지)');
	assert.equal(pct(7261 - 1552, 7261), 78.6, 'T4 회귀 케이스');
});

test('estimateTokens — chars/4 반올림, 빈 입력 0', () => {
	assert.equal(estimateTokens(''), 0);
	assert.equal(estimateTokens(null), 0);
	assert.equal(estimateTokens(undefined), 0);
	assert.equal(estimateTokens('abcd'), 1);
	assert.equal(estimateTokens('a'.repeat(400)), 100);
	assert.equal(estimateTokens('ab'), 1, '2/4=0.5 → 반올림 1 (Math.round)');
});

test('aggregate — codegraph null skip + isolation 전체 평균', () => {
	const rows = [
		{ codegraph_saved_pct: 70, isolation_saved_pct: 85 },
		{ codegraph_saved_pct: 30, isolation_saved_pct: 90 },
		{ codegraph_saved_pct: null, isolation_saved_pct: 95 }, // codegraph skip → 평균서 제외
	];
	const a = aggregate(rows);
	assert.equal(a.codegraph_avg_saved_pct, 50, '(70+30)/2 — null 제외');
	assert.equal(a.isolation_avg_saved_pct, 90, '(85+90+95)/3 — 전부 포함');
});

test('aggregate — codegraph 전부 skip 시 null (과대보고 방지)', () => {
	const rows = [
		{ codegraph_saved_pct: null, isolation_saved_pct: 80 },
		{ codegraph_saved_pct: null, isolation_saved_pct: 88 },
	];
	const a = aggregate(rows);
	assert.equal(a.codegraph_avg_saved_pct, null, 'codegraph 미가용 → 숫자 날조 ❌ (null)');
	assert.equal(a.isolation_avg_saved_pct, 84);
});

test('aggregate — 빈 입력 안전', () => {
	const a = aggregate([]);
	assert.equal(a.codegraph_avg_saved_pct, null);
	assert.equal(a.isolation_avg_saved_pct, null);
});

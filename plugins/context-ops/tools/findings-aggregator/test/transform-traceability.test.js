// transform-traceability.test.js — traceability-matrix-builder gate wiring (poc-18 / DEC-2026-06-06-non-analysis-gate-fail-closed).
//   builder 가 coverage_summary 를 emit → generic transform(summary.{critical,high}) 은 blind(0) 였음.
//   red_count(broken trace)→critical / forward_coverage<threshold(coverage gap)→medium(advisory) / yellow→low.
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { transformTraceabilityMatrix } from '../src/aggregator.js';

describe('transformTraceabilityMatrix (poc-18 gate wiring)', () => {
	it('red_count → critical (broken trace = hard)', () => {
		const r = transformTraceabilityMatrix({
			coverage_summary: { red_count: 2, yellow_count: 0, forward_coverage: 1, threshold: 0.85 },
		});
		assert.equal(r.critical, 2);
		assert.equal(r.medium, 0);
	});
	it('forward_coverage < threshold → medium advisory (NOT hard-block / 부분 slice 정당)', () => {
		const r = transformTraceabilityMatrix({
			coverage_summary: { red_count: 0, yellow_count: 1, forward_coverage: 0.833, threshold: 0.85 },
		});
		assert.equal(r.critical, 0);
		assert.equal(r.high, 0);
		assert.equal(r.medium, 1, 'coverage gap = medium advisory');
		assert.equal(r.low, 1, 'yellow → low');
	});
	it('full coverage → all zero', () => {
		const r = transformTraceabilityMatrix({
			coverage_summary: { red_count: 0, yellow_count: 0, forward_coverage: 1, threshold: 0.85 },
		});
		assert.equal(r.critical + r.high + r.medium + r.low, 0);
	});
	it('tolerates bare coverage_summary (no wrapper)', () => {
		const r = transformTraceabilityMatrix({ red_count: 1, forward_coverage: 1, threshold: 0.85 });
		assert.equal(r.critical, 1);
	});
});

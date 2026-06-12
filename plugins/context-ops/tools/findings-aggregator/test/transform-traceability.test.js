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

	// LEVER C (DEC-2026-06-12 soft-surface) — unit_coverage reference-lens pass-through + obligation gap medium advisory.
	it('unit_coverage obligation_satisfied_ratio >= threshold → medium 무증가 + pass-through 필드 채워짐', () => {
		const r = transformTraceabilityMatrix({
			coverage_summary: {
				red_count: 0, yellow_count: 0, forward_coverage: 1, threshold: 0.85,
				unit_coverage: { obligation_satisfied_ratio: 1, unit_total: 2, unit_tested: 2, threshold: 0.85 },
			},
		});
		assert.equal(r.medium, 0, 'obligation 충족 → medium 무증가');
		assert.equal(r.traceability_unit_obligation_ratio, 1);
		assert.equal(r.traceability_unit_total, 2);
		assert.equal(r.traceability_unit_tested, 2);
	});
	it('unit_coverage obligation_satisfied_ratio < threshold → medium+1 advisory (critical/high=0 / NOT hard-block)', () => {
		const r = transformTraceabilityMatrix({
			coverage_summary: {
				red_count: 0, yellow_count: 0, forward_coverage: 1, threshold: 0.85,
				unit_coverage: { obligation_satisfied_ratio: 0.5, unit_total: 2, unit_tested: 1, threshold: 0.85 },
			},
		});
		assert.equal(r.medium, 1, 'obligation gap = medium advisory');
		assert.equal(r.critical, 0);
		assert.equal(r.high, 0, 'HARD flip(validator_high)은 별도 promotion DEC — 여기선 high 0');
		assert.equal(r.traceability_unit_obligation_ratio, 0.5);
	});
	it('unit_coverage 부재(behavior-only PoC) → 신규 필드 null + medium 무회귀', () => {
		const r = transformTraceabilityMatrix({
			coverage_summary: { red_count: 0, yellow_count: 1, forward_coverage: 0.833, threshold: 0.85 },
		});
		assert.equal(r.medium, 1, 'forward gap medium 만 / unit 미참조 무영향');
		assert.equal(r.traceability_unit_obligation_ratio, null);
		assert.equal(r.traceability_unit_total, null);
		assert.equal(r.traceability_unit_method_axis_corroboration, null, 'code-graph 신호 reference-lens / 부재 시 null');
		assert.equal(r.traceability_unit_mutation_score, null);
	});
});

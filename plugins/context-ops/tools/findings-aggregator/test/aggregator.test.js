// aggregator.test.js — findings-aggregator unit test
// v2.3.6 PATCH (DEC-2026-05-13-chain-driver-findings-integration-v2.3.6)
// v11.0.0 MAJOR — discovery rename (planning-extraction-validator → discovery-extraction-validator)

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
	emptyFindings,
	mergeFindings,
	transformDiscoveryExtraction,
	transformChainCoverage,
	transformSchemaValidator,
	transformTestImplPass,
	transformGeneric,
	transformBrCrossConsistency,
	transformDecisionTable,
	transformFormalSpecLink,
	transformGraphIntegrity,
	dispatchValidator,
	aggregateForStage,
	REQUIRED_VALIDATORS_PER_STAGE,
} from '../src/aggregator.js';

describe('emptyFindings', () => {
	it('returns zero-count + empty arrays + empty sources', () => {
		const f = emptyFindings();
		assert.equal(f.critical, 0);
		assert.equal(f.high, 0);
		assert.equal(f.medium, 0);
		assert.equal(f.low, 0);
		assert.equal(f.info, 0);
		assert.deepEqual(f.evidence_missing, []);
		assert.deepEqual(f.sources, {});
	});
});

describe('REQUIRED_VALIDATORS_PER_STAGE', () => {
	it('chain-driver gate-eval.js REQUIRED_VALIDATORS_PER_STAGE 정합 (5 stage / v11.0.0 discovery rename)', () => {
		assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.discovery, [
			'discovery-extraction-validator',
			'schema-validator',
			'br-cross-consistency-validator',
		]);
		assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.spec, [
			'chain-coverage-validator',
			'drift-validator',
			'formal-spec-link-validator',
			'schema-validator',
		]);
		assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.plan, [
			'plan-coverage-validator',
			'schema-validator',
		]);
		assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.test, [
			'test-impl-pass-validator',
			'spec-test-link-validator',
			'schema-validator',
		]);
		assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.implement, [
			'test-impl-pass-validator',
			'static-runner',
			'traceability-matrix-builder',
			'graph-integrity-validator',
			// F-EVENT-CARRY-DANGLING — code_pointer.path_missing(strict_path 실재성) gate 승격.
			'code-pointer-validator',
		]);
	});
});

describe('transformDiscoveryExtraction', () => {
	it('summary critical/high count 정합', () => {
		const json = {
			summary: { total_findings: 2, critical: 1, high: 1, medium: 0 },
		};
		const f = transformDiscoveryExtraction(json);
		assert.equal(f.critical, 1);
		assert.equal(f.high, 1);
		assert.equal(f.medium, 0);
	});
	it('0 findings = all zero', () => {
		const json = { summary: { total_findings: 0, critical: 0, high: 0 } };
		const f = transformDiscoveryExtraction(json);
		assert.equal(f.critical, 0);
		assert.equal(f.high, 0);
	});
});

describe('transformChainCoverage', () => {
	it('coverage_pct = min(uc_to_bhv, bhv_to_ac) (가장 약한 link)', () => {
		const json = {
			summary: { critical: 0, high: 0, medium: 0 },
			coverage: { uc_to_bhv: 0.25, bhv_to_ac: 1 },
		};
		const f = transformChainCoverage(json);
		assert.equal(f.coverage_pct, 0.25);
		assert.equal(f.coverage_threshold, 0.85);
	});
	it('100% coverage = 1.0', () => {
		const json = {
			summary: { critical: 0, high: 0 },
			coverage: { uc_to_bhv: 1, bhv_to_ac: 1 },
		};
		const f = transformChainCoverage(json);
		assert.equal(f.coverage_pct, 1);
	});
});

describe('transformSchemaValidator', () => {
	it('invalid 개수 = critical (schema strict block)', () => {
		const stdout =
			'schema-validator — 3 file(s)\n  valid: 1  invalid: 2  skipped: 0\n';
		const f = transformSchemaValidator(stdout);
		assert.equal(f.critical, 2);
		assert.equal(f.high, 0);
	});
	it('all valid = no critical', () => {
		const stdout =
			'schema-validator — 3 file(s)\n  valid: 3  invalid: 0  skipped: 0\n';
		const f = transformSchemaValidator(stdout);
		assert.equal(f.critical, 0);
	});
	it('summary 부재 fallback = all zero', () => {
		const f = transformSchemaValidator('no match output');
		assert.equal(f.critical, 0);
		assert.equal(f.high, 0);
	});
});

describe('transformTestImplPass', () => {
	it('legacy test_results shape — tests_total/passed/failed 정합', () => {
		const json = {
			summary: { critical: 0, high: 0 },
			test_results: { total: 12, passed: 10, failed: 2 },
		};
		const f = transformTestImplPass(json);
		assert.equal(f.tests_total, 12);
		assert.equal(f.tests_passed, 10);
		assert.equal(f.tests_failed, 2);
	});
	it('F-I05 — cli.js shape(pass_count/fail_count/skip_count) → tests_* 정합 (무음 0 버그 차단)', () => {
		// test-impl-pass-validator cli.js --json 실제 출력 shape (test_results 부재)
		const json = {
			ok_state: 'fail',
			pass_count: 10,
			fail_count: 2,
			skip_count: 1,
		};
		const f = transformTestImplPass(json);
		assert.equal(
			f.tests_total,
			13,
			'pass+fail+skip 합산 (예전엔 0 으로 무음 → I9 guard 무력)',
		);
		assert.equal(f.tests_passed, 10);
		assert.equal(f.tests_failed, 2);
	});
	it('F-I05 — GREEN cli.js shape → tests_total>0 / failed=0 (I9 fail-closed guard 정합)', () => {
		const f = transformTestImplPass({
			ok_state: 'ok',
			pass_count: 5,
			fail_count: 0,
			skip_count: 0,
		});
		assert.equal(f.tests_total, 5);
		assert.equal(f.tests_failed, 0);
	});
	it('F-I05 — S2 outcome_mismatches/missing_actual surface', () => {
		const f = transformTestImplPass({
			pass_count: 3,
			fail_count: 0,
			skip_count: 0,
			outcome_mismatches: 1,
			missing_actual: 2,
		});
		assert.equal(f.outcome_mismatches, 1);
		assert.equal(f.missing_actual, 2);
	});
	it('F-I05 — outcome_mismatches 부재 시 필드 omit (S1/greenfield/S3 backward-compat)', () => {
		const f = transformTestImplPass({
			pass_count: 3,
			fail_count: 0,
			skip_count: 0,
		});
		assert.equal(f.outcome_mismatches, undefined);
	});
});

describe('transformGeneric', () => {
	it('summary count fallback', () => {
		const json = { summary: { critical: 3, high: 1, medium: 0 } };
		const f = transformGeneric(json);
		assert.equal(f.critical, 3);
		assert.equal(f.high, 1);
	});
});

describe('mergeFindings', () => {
	it('severity count 합산', () => {
		const a = { critical: 1, high: 0, medium: 2, low: 0, info: 0 };
		const b = { critical: 0, high: 3, medium: 1, low: 0, info: 0 };
		const m = mergeFindings(a, b);
		assert.equal(m.critical, 1);
		assert.equal(m.high, 3);
		assert.equal(m.medium, 3);
	});
	it('coverage_pct = min (가장 약한 link 보존)', () => {
		const a = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			info: 0,
			coverage_pct: 0.9,
			coverage_threshold: 0.85,
		};
		const b = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			info: 0,
			coverage_pct: 0.6,
			coverage_threshold: 0.85,
		};
		const m = mergeFindings(a, b);
		assert.equal(m.coverage_pct, 0.6);
	});
	it('tests_* preserve latest (b)', () => {
		const a = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
		const b = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			info: 0,
			tests_total: 12,
			tests_passed: 10,
			tests_failed: 2,
		};
		const m = mergeFindings(a, b);
		assert.equal(m.tests_total, 12);
		assert.equal(m.tests_passed, 10);
		assert.equal(m.tests_failed, 2);
	});
	it('evidence_missing 합산', () => {
		const a = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			info: 0,
			evidence_missing: ['e1'],
		};
		const b = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			info: 0,
			evidence_missing: ['e2', 'e3'],
		};
		const m = mergeFindings(a, b);
		assert.deepEqual(m.evidence_missing, ['e1', 'e2', 'e3']);
	});
	it('F-I05 — outcome_mismatches preserve latest (b)', () => {
		const a = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
		const b = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			info: 0,
			outcome_mismatches: 2,
			missing_actual: 1,
		};
		const m = mergeFindings(a, b);
		assert.equal(m.outcome_mismatches, 2);
		assert.equal(m.missing_actual, 1);
	});
});

describe('transformBrCrossConsistency (v2.4.0)', () => {
	it('findings severity 합산 + br_overall_score', () => {
		const json = {
			stats: {
				total: 3,
				with_natural_language: 2,
				with_gwt: 1,
				with_both: 0,
				with_finding: 2,
			},
			findings: [
				{ id: 'F-1', severity: 'critical', rule: 'representation_missing' },
				{ id: 'F-2', severity: 'medium', rule: 'keyword_mismatch' },
			],
			summary: {
				deterministic_consistency_score: 0.5,
				overall_score: 0.5,
				overall_threshold: 0.85,
				gate_status: 'fail',
			},
		};
		const f = transformBrCrossConsistency(json);
		assert.equal(f.critical, 1);
		assert.equal(f.medium, 1);
		assert.equal(f.br_overall_score, 0.5);
		assert.equal(f.br_gate_status, 'fail');
	});
	it('0 findings = pass', () => {
		const json = {
			stats: {
				total: 1,
				with_natural_language: 1,
				with_gwt: 0,
				with_both: 0,
				with_finding: 0,
			},
			findings: [],
			summary: {
				deterministic_consistency_score: 1,
				overall_score: 1,
				overall_threshold: 0.85,
				gate_status: 'pass',
			},
		};
		const f = transformBrCrossConsistency(json);
		assert.equal(f.critical, 0);
		assert.equal(f.br_gate_status, 'pass');
	});
});

describe('transformGraphIntegrity (F-DOGFOOD-STORY-ORPHAN)', () => {
	it('orphan → high / cycle·unknown → critical', () => {
		const json = {
			passed: false,
			summary: { cycle_count: 1, orphan_count: 4, unknown_edge_count: 2 },
		};
		const f = transformGraphIntegrity(json);
		assert.equal(f.critical, 3); // cycle 1 + unknown 2
		assert.equal(f.high, 4); // orphan 4
		assert.equal(f.graph_integrity_passed, false);
	});
	it('passed=true → all zero (clean graph)', () => {
		const json = {
			passed: true,
			summary: { cycle_count: 0, orphan_count: 0, unknown_edge_count: 0 },
		};
		const f = transformGraphIntegrity(json);
		assert.equal(f.critical, 0);
		assert.equal(f.high, 0);
		assert.equal(f.graph_integrity_passed, true);
	});
	it('summary 부재 fallback = all zero (blind 0 차단 — 명시 0)', () => {
		const f = transformGraphIntegrity({ passed: true });
		assert.equal(f.critical, 0);
		assert.equal(f.high, 0);
	});
});

describe('dispatchValidator', () => {
	it('graph-integrity-validator → orphan high 매핑', () => {
		const output = JSON.stringify({
			passed: false,
			summary: { cycle_count: 0, orphan_count: 4, unknown_edge_count: 0 },
		});
		const f = dispatchValidator('graph-integrity-validator', output);
		assert.equal(f.high, 4);
		assert.equal(f.critical, 0);
	});
	it('discovery-extraction-validator → JSON parse + transform', () => {
		const output = JSON.stringify({ summary: { critical: 0, high: 1 } });
		const f = dispatchValidator('discovery-extraction-validator', output);
		assert.equal(f.high, 1);
	});
	it('schema-validator → stdout text transform', () => {
		const f = dispatchValidator(
			'schema-validator',
			'  valid: 0  invalid: 1  skipped: 0',
		);
		assert.equal(f.critical, 1);
	});
	it('unknown validator → generic JSON fallback', () => {
		const f = dispatchValidator(
			'unknown-tool',
			JSON.stringify({ summary: { critical: 2 } }),
		);
		assert.equal(f.critical, 2);
	});
	it('unknown + parse fail → all zero', () => {
		const f = dispatchValidator('unknown-tool', 'not json');
		assert.equal(f.critical, 0);
		assert.equal(f.high, 0);
	});
});

describe('aggregateForStage', () => {
	it('unknown stage throws', () => {
		assert.throws(
			() => aggregateForStage('foo', '/tmp/poc', () => null),
			/unknown stage: foo/,
		);
	});

	it('discovery stage — 0 findings (validator 모두 pass)', () => {
		const mockRun = (name) => {
			if (name === 'discovery-extraction-validator') {
				return JSON.stringify({ summary: { critical: 0, high: 0 } });
			}
			if (name === 'schema-validator') {
				return '  valid: 4  invalid: 0  skipped: 0';
			}
			if (name === 'br-cross-consistency-validator') {
				return JSON.stringify({
					stats: {
						total: 1,
						with_natural_language: 1,
						with_gwt: 0,
						with_both: 0,
						with_finding: 0,
					},
					findings: [],
					summary: {
						deterministic_consistency_score: 1,
						overall_score: 1,
						overall_threshold: 0.85,
						gate_status: 'pass',
					},
				});
			}
			return null;
		};
		const findings = aggregateForStage('discovery', '/tmp/poc', mockRun);
		assert.equal(findings.critical, 0);
		assert.equal(findings.high, 0);
		assert.equal(Object.keys(findings.sources).length, 3);
		assert.equal(
			findings.sources['discovery-extraction-validator'].status,
			'ok',
		);
		assert.equal(findings.sources['schema-validator'].status, 'ok');
		assert.equal(
			findings.sources['br-cross-consistency-validator'].status,
			'ok',
		);
	});

	it('spec stage — validator 부재 = skipped', () => {
		const mockRun = (name) => {
			if (name === 'chain-coverage-validator') {
				return JSON.stringify({
					summary: { critical: 0, high: 0 },
					coverage: { uc_to_bhv: 1, bhv_to_ac: 1 },
				});
			}
			if (name === 'schema-validator') {
				return '  valid: 3  invalid: 0';
			}
			return null; // drift-validator / formal-spec-link-validator 부재
		};
		const findings = aggregateForStage('spec', '/tmp/poc', mockRun);
		assert.equal(findings.critical, 0);
		assert.equal(findings.coverage_pct, 1);
		assert.equal(findings.sources['drift-validator'].status, 'skipped');
		assert.equal(
			findings.sources['formal-spec-link-validator'].status,
			'skipped',
		);
	});

	it('critical accumulate (schema invalid + discovery critical 합산)', () => {
		const mockRun = (name) => {
			if (name === 'discovery-extraction-validator') {
				return JSON.stringify({ summary: { critical: 2, high: 0 } });
			}
			if (name === 'schema-validator') {
				return '  valid: 0  invalid: 3  skipped: 0';
			}
			return null;
		};
		const findings = aggregateForStage('discovery', '/tmp/poc', mockRun);
		assert.equal(findings.critical, 5); // 2 + 3
	});

	it('parse fail = critical 증가 (양심 의존 차단)', () => {
		const mockRun = (name) => {
			if (name === 'discovery-extraction-validator') {
				return 'not valid json';
			}
			if (name === 'schema-validator') {
				return '  valid: 4  invalid: 0';
			}
			return null;
		};
		const findings = aggregateForStage('discovery', '/tmp/poc', mockRun);
		assert.equal(findings.critical, 1); // parse fail 1
		assert.equal(
			findings.sources['discovery-extraction-validator'].status,
			'error',
		);
	});
});

// DEC-2026-06-06-analysis-exit-gate — analysis gate #0 러너 (validator 실행 + transform + fail-closed)
describe('DEC-2026-06-06-analysis-exit-gate', () => {
	it('REQUIRED_VALIDATORS_PER_STAGE.analysis = base 5 (gate-eval sync / F-DOGFOOD-014 evidence-scan)', () => {
		assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.analysis, [
			'schema-validator',
			'br-cross-consistency-validator',
			'formal-spec-link-validator',
			'decision-table-validator',
			'analysis-extraction-validator',
		]);
	});

	it('transformDecisionTable: totals.breaking → critical / non-breaking → medium (RR2 어휘버그 가드)', () => {
		const f = transformDecisionTable({
			totals: { breaking: 2, 'non-breaking': 1, info: 3 },
		});
		assert.equal(f.critical, 2);
		assert.equal(f.medium, 1);
		assert.equal(f.info, 3);
	});

	it('transformFormalSpecLink: totals.breaking + errors → critical / non-breaking → medium', () => {
		const f = transformFormalSpecLink({
			totals: { breaking: 1, errors: 1, 'non-breaking': 2, info: 0 },
		});
		assert.equal(f.critical, 2); // breaking 1 + errors 1
		assert.equal(f.medium, 2);
	});

	it('dispatchValidator: decision-table/formal-spec-link 전용 transform (generic fallback ❌ / silent pass 차단)', () => {
		const dt = dispatchValidator(
			'decision-table-validator',
			JSON.stringify({ totals: { breaking: 1, 'non-breaking': 0, info: 0 } }),
		);
		assert.equal(dt.critical, 1); // generic 이면 0 (summary.critical 부재) — 전용 transform 으로 1
		const fsl = dispatchValidator(
			'formal-spec-link-validator',
			JSON.stringify({ totals: { breaking: 2, 'non-breaking': 0, info: 0 } }),
		);
		assert.equal(fsl.critical, 2);
	});

	it('aggregateForStage(analysis) — base 4 + extraValidators(조건부) 실행', () => {
		const mockRun = (name) => {
			if (name === 'schema-validator')
				return '  valid: 4  invalid: 0  skipped: 0';
			if (name === 'br-cross-consistency-validator')
				return JSON.stringify({
					findings: [],
					summary: { gate_status: 'pass' },
				});
			if (name === 'formal-spec-link-validator')
				return JSON.stringify({
					totals: { breaking: 0, 'non-breaking': 0, info: 0 },
				});
			if (name === 'decision-table-validator')
				return JSON.stringify({
					totals: { breaking: 0, 'non-breaking': 0, info: 0 },
				});
			if (name === 'analysis-extraction-validator')
				return JSON.stringify({
					adapter: 'evidence-scan',
					findings: [],
					summary: { total_findings: 0, critical: 0, high: 0, medium: 0 },
				});
			if (name === 'characterization-coverage-validator')
				return JSON.stringify({ summary: { critical: 0, high: 1, medium: 0 } });
			if (name === 'sql-inventory-validator')
				return JSON.stringify({ summary: { critical: 0, high: 0, medium: 0 } });
			return null;
		};
		const findings = aggregateForStage('analysis', '/tmp/poc', mockRun, {
			extraValidators: [
				'characterization-coverage-validator',
				'sql-inventory-validator',
			],
		});
		assert.equal(findings.high, 1); // characterization 1 high
		assert.equal(Object.keys(findings.sources).length, 7); // base 5 + 조건부 2
		assert.equal(
			findings.sources['characterization-coverage-validator'].status,
			'ok',
		);
	});

	it('aggregateForStage(analysis) failClosedOnNull — target 미해석 validator → evidence_missing (fail-closed)', () => {
		const mockRun = (name) =>
			name === 'schema-validator' ? '  valid: 2  invalid: 0  skipped: 0' : null;
		const findings = aggregateForStage('analysis', '/tmp/poc', mockRun, {
			failClosedOnNull: true,
		});
		assert.equal(findings.critical, 0);
		assert.ok(
			findings.evidence_missing.includes('br-cross-consistency-validator'),
			'미해석 validator = evidence_missing',
		);
		assert.equal(findings.evidence_missing.length, 4); // br-cross + formal-spec-link + decision-table + analysis-extraction(evidence-scan)
		assert.equal(
			findings.sources['decision-table-validator'].status,
			'evidence_missing',
		);
	});

	it('aggregateForStage(analysis) failClosedOnNull=false (default) → null = skipped (backward-compat)', () => {
		const mockRun = (name) =>
			name === 'schema-validator' ? '  valid: 1  invalid: 0' : null;
		const findings = aggregateForStage('analysis', '/tmp/poc', mockRun);
		assert.equal(findings.evidence_missing.length, 0);
		assert.equal(
			findings.sources['br-cross-consistency-validator'].status,
			'skipped',
		);
	});
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	validateTaskCoverage,
	validateNfrAllocation,
	validateTaskGranularity,
	validateDependencyCycle,
	validateRiskSeverity,
	validateBETaskOpenapiRef,
	validateFETaskComponentRef,
	validateSpConversions,
} from '../src/validator.js';

// ──────────────────────────────────────────────────────────────────────
// fixtures
// ──────────────────────────────────────────────────────────────────────

const validTaskPlan = {
	meta: { confidence: 0.85 },
	derivation_source: {
		behavior_spec_path: '.ai-context/output/behavior-spec.json',
		acceptance_criteria_path: '.ai-context/output/acceptance-criteria.json',
	},
	tasks: [
		{
			id: 'TASK-USER-001',
			ac_refs: ['AC-USER-001'],
			behavior_ref: 'BHV-USER-001',
			execution_order: 1,
			dependencies: [],
		},
		{
			id: 'TASK-USER-002',
			ac_refs: ['AC-USER-002'],
			behavior_ref: 'BHV-USER-001',
			execution_order: 2,
			dependencies: ['TASK-USER-001'],
		},
	],
	nfr_allocation: [
		{
			id: 'NFR-USER-001',
			characteristic: 'security',
			severity: 'high',
			description: 'XSS injection 차단 100%',
			acceptance_criteria_ref: 'AC-USER-001',
			task_refs: ['TASK-USER-001'],
		},
	],
	risks: [
		{
			id: 'RISK-USER-001',
			severity: 'high',
			description: 'JWT localStorage XSS exposure',
			mitigation: 'httpOnly cookie 전환',
			human_review: true,
		},
	],
};

const validAcceptance = {
	criteria: [
		{
			id: 'AC-USER-001',
			behavior_ref: 'BHV-USER-001',
			use_case_ref: 'UC-USER-001',
			verifiable: true,
			automated_runnable: true,
			test_case_refs: ['TC-USER-001'],
		},
		{
			id: 'AC-USER-002',
			behavior_ref: 'BHV-USER-001',
			use_case_ref: 'UC-USER-001',
			verifiable: true,
			automated_runnable: true,
			test_case_refs: ['TC-USER-002'],
		},
	],
};

// ──────────────────────────────────────────────────────────────────────
// 1. validateTaskCoverage
// ──────────────────────────────────────────────────────────────────────

describe('validateTaskCoverage', () => {
	it('passes for full chain (AC ↔ TASK 1:1)', () => {
		const r = validateTaskCoverage(validTaskPlan, validAcceptance, null);
		assert.equal(r.summary.critical, 0);
		assert.equal(r.summary.high, 0);
		assert.equal(r.coverage.ac_to_task, 1.0);
	});

	it('detects TASK referencing unknown AC (critical)', () => {
		const taskPlan = {
			...validTaskPlan,
			tasks: [
				{
					id: 'TASK-X-001',
					ac_refs: ['AC-UNKNOWN-001'],
					behavior_ref: 'BHV-USER-001',
					execution_order: 1,
				},
			],
		};
		const r = validateTaskCoverage(taskPlan, validAcceptance, null);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.task.unknown_ac' && f.severity === 'critical',
			),
		);
	});

	it('detects AC without TASK (chain 2→3 link missing)', () => {
		const taskPlan = {
			...validTaskPlan,
			tasks: [
				{
					id: 'TASK-USER-001',
					ac_refs: ['AC-USER-001'],
					behavior_ref: 'BHV-USER-001',
					execution_order: 1,
				},
			],
		};
		const r = validateTaskCoverage(taskPlan, validAcceptance, null);
		// AC-USER-002 가 cover 안 됨
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.ac.no_task' &&
					f.ac_id === 'AC-USER-002' &&
					f.severity === 'high',
			),
		);
	});

	it('detects coverage below threshold (high)', () => {
		const acceptance = {
			criteria: [
				{
					id: 'AC-A-001',
					behavior_ref: 'BHV-A-001',
					use_case_ref: 'UC-A-001',
					verifiable: true,
					automated_runnable: true,
					test_case_refs: ['TC-A-001'],
				},
				{
					id: 'AC-B-001',
					behavior_ref: 'BHV-B-001',
					use_case_ref: 'UC-B-001',
					verifiable: true,
					automated_runnable: true,
					test_case_refs: ['TC-B-001'],
				},
				{
					id: 'AC-C-001',
					behavior_ref: 'BHV-C-001',
					use_case_ref: 'UC-C-001',
					verifiable: true,
					automated_runnable: true,
					test_case_refs: ['TC-C-001'],
				},
				{
					id: 'AC-D-001',
					behavior_ref: 'BHV-D-001',
					use_case_ref: 'UC-D-001',
					verifiable: true,
					automated_runnable: true,
					test_case_refs: ['TC-D-001'],
				},
				{
					id: 'AC-E-001',
					behavior_ref: 'BHV-E-001',
					use_case_ref: 'UC-E-001',
					verifiable: true,
					automated_runnable: true,
					test_case_refs: ['TC-E-001'],
				},
			],
		};
		const r = validateTaskCoverage(validTaskPlan, acceptance, null);
		// validTaskPlan = 2 task cover AC-USER-001/002 / 5 AC 중 0 cover
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.ac_coverage.below_threshold' &&
					f.severity === 'high',
			),
		);
	});

	it('validates TASK ↔ TC forward link when test-spec provided', () => {
		const testSpec = {
			test_cases: [{ id: 'TC-USER-001' }, { id: 'TC-USER-002' }],
		};
		const taskPlanWithTc = {
			...validTaskPlan,
			tasks: [
				{ ...validTaskPlan.tasks[0], tc_refs: ['TC-USER-001'] },
				{ ...validTaskPlan.tasks[1], tc_refs: ['TC-USER-002'] },
			],
		};
		const r = validateTaskCoverage(taskPlanWithTc, validAcceptance, testSpec);
		assert.equal(r.coverage.task_to_tc, 1.0);
		assert.equal(r.summary.critical, 0);
	});

	it('detects TASK referencing unknown TC (high)', () => {
		const testSpec = { test_cases: [{ id: 'TC-USER-001' }] };
		const taskPlanWithTc = {
			...validTaskPlan,
			tasks: [{ ...validTaskPlan.tasks[0], tc_refs: ['TC-UNKNOWN-001'] }],
		};
		const r = validateTaskCoverage(taskPlanWithTc, validAcceptance, testSpec);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.task.unknown_tc' && f.severity === 'high',
			),
		);
	});
});

// ──────────────────────────────────────────────────────────────────────
// 2. validateNfrAllocation (Cluster 2 plan hard gate)
// ──────────────────────────────────────────────────────────────────────

describe('validateNfrAllocation', () => {
	it('passes for high NFR with task_refs + acceptance_criteria_ref', () => {
		const r = validateNfrAllocation(validTaskPlan);
		assert.equal(r.summary.high, 0);
	});

	it('detects high NFR without task_refs (plan hard gate / high finding)', () => {
		const taskPlan = {
			...validTaskPlan,
			nfr_allocation: [
				{
					id: 'NFR-X-001',
					characteristic: 'security',
					severity: 'high',
					description: 'XSS 차단',
					acceptance_criteria_ref: 'AC-USER-001',
					task_refs: [],
				},
			],
		};
		const r = validateNfrAllocation(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.nfr.allocation_missing' &&
					f.severity === 'high' &&
					f.nfr_severity === 'high',
			),
		);
	});

	it('detects critical NFR without task_refs (plan hard gate / high finding)', () => {
		const taskPlan = {
			...validTaskPlan,
			nfr_allocation: [
				{
					id: 'NFR-X-001',
					characteristic: 'safety',
					severity: 'critical',
					description: 'fail-safe shutdown',
					acceptance_criteria_ref: 'AC-USER-001',
				},
			],
		};
		const r = validateNfrAllocation(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.nfr.allocation_missing' &&
					f.severity === 'high' &&
					f.nfr_severity === 'critical',
			),
		);
	});

	it('detects high NFR without acceptance_criteria_ref (Cluster 4 cross-cut / medium)', () => {
		const taskPlan = {
			...validTaskPlan,
			nfr_allocation: [
				{
					id: 'NFR-X-001',
					characteristic: 'security',
					severity: 'high',
					description: 'XSS',
					task_refs: ['TASK-USER-001'],
				},
			],
		};
		const r = validateNfrAllocation(taskPlan);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.nfr.no_ac_link' && f.severity === 'medium',
			),
		);
	});

	it('detects empty nfr_allocation with non-empty tasks (medium)', () => {
		const taskPlan = { ...validTaskPlan, nfr_allocation: [] };
		const r = validateNfrAllocation(taskPlan);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.nfr.no_allocation' && f.severity === 'medium',
			),
		);
	});
});

// ──────────────────────────────────────────────────────────────────────
// 3. validateTaskGranularity (DEC-2026-05-21 §정책4 / 1~3 AC 묶음)
// ──────────────────────────────────────────────────────────────────────

describe('validateTaskGranularity', () => {
	it('passes for tasks with 1~3 ac_refs', () => {
		const r = validateTaskGranularity(validTaskPlan, false);
		assert.equal(r.summary.high, 0);
		assert.equal(r.summary.medium, 0);
	});

	it('warns when ac_refs > 3 (medium default)', () => {
		const taskPlan = {
			...validTaskPlan,
			tasks: [
				{
					id: 'TASK-X-001',
					ac_refs: ['AC-A-001', 'AC-B-001', 'AC-C-001', 'AC-D-001'],
					behavior_ref: 'BHV-X-001',
					execution_order: 1,
				},
			],
		};
		const r = validateTaskGranularity(taskPlan, false);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.task.granularity_exceeded' &&
					f.severity === 'medium' &&
					f.ac_count === 4,
			),
		);
	});

	it('blocks when ac_refs > 3 in strict mode (high)', () => {
		const taskPlan = {
			...validTaskPlan,
			tasks: [
				{
					id: 'TASK-X-001',
					ac_refs: ['AC-A-001', 'AC-B-001', 'AC-C-001', 'AC-D-001'],
					behavior_ref: 'BHV-X-001',
					execution_order: 1,
				},
			],
		};
		const r = validateTaskGranularity(taskPlan, true);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.task.granularity_exceeded' && f.severity === 'high',
			),
		);
	});

	it('detects task with 0 ac_refs (high)', () => {
		const taskPlan = {
			...validTaskPlan,
			tasks: [
				{
					id: 'TASK-X-001',
					ac_refs: [],
					behavior_ref: 'BHV-X-001',
					execution_order: 1,
				},
			],
		};
		const r = validateTaskGranularity(taskPlan, false);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.task.no_ac' && f.severity === 'high',
			),
		);
	});
});

// ──────────────────────────────────────────────────────────────────────
// 4. validateDependencyCycle (critical)
// ──────────────────────────────────────────────────────────────────────

describe('validateDependencyCycle', () => {
	it('passes for valid DAG (linear chain)', () => {
		const r = validateDependencyCycle(validTaskPlan);
		assert.equal(r.summary.critical, 0);
	});

	it('detects simple 2-task cycle (critical)', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-A-001',
					ac_refs: ['AC-A-001'],
					behavior_ref: 'BHV-A-001',
					execution_order: 1,
					dependencies: ['TASK-B-001'],
				},
				{
					id: 'TASK-B-001',
					ac_refs: ['AC-B-001'],
					behavior_ref: 'BHV-B-001',
					execution_order: 2,
					dependencies: ['TASK-A-001'],
				},
			],
		};
		const r = validateDependencyCycle(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.task.dependency_cycle' && f.severity === 'critical',
			),
		);
	});

	it('detects 3-task cycle (critical)', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-A-001',
					ac_refs: ['AC-A-001'],
					behavior_ref: 'BHV-A-001',
					execution_order: 1,
					dependencies: ['TASK-B-001'],
				},
				{
					id: 'TASK-B-001',
					ac_refs: ['AC-B-001'],
					behavior_ref: 'BHV-B-001',
					execution_order: 2,
					dependencies: ['TASK-C-001'],
				},
				{
					id: 'TASK-C-001',
					ac_refs: ['AC-C-001'],
					behavior_ref: 'BHV-C-001',
					execution_order: 3,
					dependencies: ['TASK-A-001'],
				},
			],
		};
		const r = validateDependencyCycle(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.task.dependency_cycle' && f.severity === 'critical',
			),
		);
	});

	it('detects unknown task dependency (high)', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-A-001',
					ac_refs: ['AC-A-001'],
					behavior_ref: 'BHV-A-001',
					execution_order: 1,
					dependencies: ['TASK-UNKNOWN-001'],
				},
			],
		};
		const r = validateDependencyCycle(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.task.unknown_dependency' && f.severity === 'high',
			),
		);
	});
});

// ──────────────────────────────────────────────────────────────────────
// 5. validateRiskSeverity (3중 망 / DEC-2026-05-21 §정책6)
// ──────────────────────────────────────────────────────────────────────

describe('validateRiskSeverity', () => {
	it('passes for high risk with mitigation + human_review', () => {
		const r = validateRiskSeverity(validTaskPlan);
		assert.equal(r.summary.medium, 0);
	});

	it('detects high risk without mitigation (medium)', () => {
		const taskPlan = {
			...validTaskPlan,
			risks: [
				{
					id: 'RISK-X-001',
					severity: 'high',
					description: 'XSS',
					human_review: true,
				},
			],
		};
		const r = validateRiskSeverity(taskPlan);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.risk.no_mitigation' && f.severity === 'medium',
			),
		);
	});

	it('detects high risk without human_review (low)', () => {
		const taskPlan = {
			...validTaskPlan,
			risks: [
				{
					id: 'RISK-X-001',
					severity: 'high',
					description: 'XSS',
					mitigation: 'CSP header',
				},
			],
		};
		const r = validateRiskSeverity(taskPlan);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.risk.no_human_review' && f.severity === 'low',
			),
		);
	});

	it('detects empty risks with non-empty tasks (medium / 3중 망 정합)', () => {
		const taskPlan = { ...validTaskPlan, risks: [] };
		const r = validateRiskSeverity(taskPlan);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'plan.risk.empty' && f.severity === 'medium',
			),
		);
	});
});

// ──────────────────────────────────────────────────────────────────────
// 6. Senior BLOCKER-2 integration test — gate-eval 통합 시 본격 시나리오 (≥ 5 본격)
// ──────────────────────────────────────────────────────────────────────

describe('Phase 4-1 Senior BLOCKER-2 integration scenarios', () => {
	it('scenario 1: full valid task-plan + AC → exit 0 (no blocking)', () => {
		const tc = validateTaskCoverage(validTaskPlan, validAcceptance, null);
		const nfr = validateNfrAllocation(validTaskPlan);
		const gran = validateTaskGranularity(validTaskPlan, false);
		const cyc = validateDependencyCycle(validTaskPlan);
		const risk = validateRiskSeverity(validTaskPlan);
		const all = [
			...tc.findings,
			...nfr.findings,
			...gran.findings,
			...cyc.findings,
			...risk.findings,
		];
		const blocking = all.some(
			(f) => f.severity === 'critical' || f.severity === 'high',
		);
		assert.equal(blocking, false);
	});

	it('scenario 2: TASK unknown AC → critical → exit 1', () => {
		const taskPlan = {
			...validTaskPlan,
			tasks: [
				{
					id: 'TASK-X-001',
					ac_refs: ['AC-UNKNOWN-001'],
					behavior_ref: 'BHV-X-001',
					execution_order: 1,
				},
			],
		};
		const tc = validateTaskCoverage(taskPlan, validAcceptance, null);
		const blocking = tc.findings.some(
			(f) => f.severity === 'critical' || f.severity === 'high',
		);
		assert.equal(blocking, true);
	});

	it('scenario 3: high NFR without task_refs → high → exit 1 (plan hard gate)', () => {
		const taskPlan = {
			...validTaskPlan,
			nfr_allocation: [
				{
					id: 'NFR-X-001',
					characteristic: 'security',
					severity: 'critical',
					description: 'XSS',
					acceptance_criteria_ref: 'AC-USER-001',
				},
			],
		};
		const nfr = validateNfrAllocation(taskPlan);
		const blocking = nfr.findings.some(
			(f) => f.severity === 'critical' || f.severity === 'high',
		);
		assert.equal(blocking, true);
	});

	it('scenario 4: TASK dependency cycle → critical → exit 1', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-A-001',
					ac_refs: ['AC-A-001'],
					behavior_ref: 'BHV-A-001',
					execution_order: 1,
					dependencies: ['TASK-B-001'],
				},
				{
					id: 'TASK-B-001',
					ac_refs: ['AC-B-001'],
					behavior_ref: 'BHV-B-001',
					execution_order: 2,
					dependencies: ['TASK-A-001'],
				},
			],
		};
		const cyc = validateDependencyCycle(taskPlan);
		const blocking = cyc.findings.some(
			(f) => f.severity === 'critical' || f.severity === 'high',
		);
		assert.equal(blocking, true);
	});

	it('scenario 5: coverage below threshold → high → exit 1', () => {
		const acceptance = {
			criteria: Array.from({ length: 5 }, (_, i) => ({
				id: `AC-X-00${i + 1}`,
				behavior_ref: 'BHV-X-001',
				use_case_ref: 'UC-X-001',
				verifiable: true,
				automated_runnable: true,
				test_case_refs: [`TC-X-00${i + 1}`],
			})),
		};
		// validTaskPlan = 2 task / 5 AC 중 0 cover (AC-USER-001/002 not in acceptance) → 0% < 0.85
		const tc = validateTaskCoverage(validTaskPlan, acceptance, null);
		const blocking = tc.findings.some(
			(f) =>
				f.kind === 'plan.ac_coverage.below_threshold' && f.severity === 'high',
		);
		assert.equal(blocking, true);
	});
});

// ──────────────────────────────────────────────────────────────────────
// v11.0.0 — BE/FE contract 1:1 matching tests
// ──────────────────────────────────────────────────────────────────────

describe('validateBETaskOpenapiRef (v11.0.0)', () => {
	it('layer=be + openapi_endpoint_ref 본격 present → no finding', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-BE-001',
					ac_refs: ['AC-BE-001'],
					behavior_ref: 'BHV-BE-001',
					execution_order: 1,
					layer: 'be',
					openapi_endpoint_ref: {
						path: '/api/users',
						operationId: 'createUser',
					},
				},
			],
		};
		const r = validateBETaskOpenapiRef(taskPlan);
		assert.equal(r.findings.length, 0);
	});

	it('layer=be + openapi_endpoint_ref 부재 → high finding', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-BE-002',
					ac_refs: ['AC-BE-002'],
					behavior_ref: 'BHV-BE-002',
					execution_order: 1,
					layer: 'be',
				},
			],
		};
		const r = validateBETaskOpenapiRef(taskPlan);
		assert.equal(r.findings.length, 1);
		assert.equal(r.findings[0].kind, 'plan.task.be_missing_openapi_ref');
		assert.equal(r.findings[0].severity, 'high');
	});

	it('layer=fe → skip (BE only validator)', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-FE-001',
					ac_refs: ['AC-FE-001'],
					behavior_ref: 'BHV-FE-001',
					execution_order: 1,
					layer: 'fe',
				},
			],
		};
		const r = validateBETaskOpenapiRef(taskPlan);
		assert.equal(r.findings.length, 0);
	});

	it('layer=be + openapi_endpoint_ref 부재 path 또는 operationId → high finding', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-BE-003',
					ac_refs: ['AC-BE-003'],
					behavior_ref: 'BHV-BE-003',
					execution_order: 1,
					layer: 'be',
					openapi_endpoint_ref: { path: '/api/users' },
				},
			],
		};
		const r = validateBETaskOpenapiRef(taskPlan);
		assert.equal(r.findings.length, 1);
		assert.equal(r.findings[0].kind, 'plan.task.be_invalid_openapi_ref');
	});
});

describe('validateFETaskComponentRef (v11.0.0)', () => {
	it('layer=fe + component_ref 본격 present → no finding', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-FE-001',
					ac_refs: ['AC-FE-001'],
					behavior_ref: 'BHV-FE-001',
					execution_order: 1,
					layer: 'fe',
					component_ref: {
						package: 'src/features/settings',
						name: 'PasswordChangeForm',
					},
				},
			],
		};
		const r = validateFETaskComponentRef(taskPlan);
		assert.equal(r.findings.length, 0);
	});

	it('layer=fe + component_ref 부재 → high finding', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-FE-002',
					ac_refs: ['AC-FE-002'],
					behavior_ref: 'BHV-FE-002',
					execution_order: 1,
					layer: 'fe',
				},
			],
		};
		const r = validateFETaskComponentRef(taskPlan);
		assert.equal(r.findings.length, 1);
		assert.equal(r.findings[0].kind, 'plan.task.fe_missing_component_ref');
		assert.equal(r.findings[0].severity, 'high');
	});

	it('layer=be → skip (FE only validator)', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-BE-001',
					ac_refs: ['AC-BE-001'],
					behavior_ref: 'BHV-BE-001',
					execution_order: 1,
					layer: 'be',
					openapi_endpoint_ref: {
						path: '/api/users',
						operationId: 'createUser',
					},
				},
			],
		};
		const r = validateFETaskComponentRef(taskPlan);
		assert.equal(r.findings.length, 0);
	});

	it('layer 부재 → skip (legacy carry / backward-compat)', () => {
		const taskPlan = {
			tasks: [
				{
					id: 'TASK-X-001',
					ac_refs: ['AC-X-001'],
					behavior_ref: 'BHV-X-001',
					execution_order: 1,
				},
			],
		};
		const beR = validateBETaskOpenapiRef(taskPlan);
		const feR = validateFETaskComponentRef(taskPlan);
		assert.equal(beR.findings.length, 0);
		assert.equal(feR.findings.length, 0);
	});
});

// ──────────────────────────────────────────────────────────────────────
// 9. v11.3.0 validateSpConversions (SP 4 분류 매트릭스 / DEC-2026-05-28-sp-conversion-policy)
// ──────────────────────────────────────────────────────────────────────

describe('validateSpConversions (v11.3.0)', () => {
	it('sp_conversions 부재 → no finding (legacy carry / backward-compat)', () => {
		const r = validateSpConversions({ tasks: [] });
		assert.equal(r.findings.length, 0);
	});

	it('α (code-convert) 정합 → no finding', () => {
		const taskPlan = {
			sp_conversions: [
				{
					sp_id: 'sp_calc_simple',
					sp_conversion_class: 'alpha',
					rationale:
						'단순 CRUD logic / ORM 으로 안전 전환 가능 (체크리스트 §4.1~4.3 모두 NO / §4.4 default)',
				},
			],
		};
		const r = validateSpConversions(taskPlan);
		assert.equal(r.findings.length, 0);
	});

	it('γ (외부 시스템) classification 정합 (external=true + adr_ref) → no finding', () => {
		const taskPlan = {
			sp_conversions: [
				{
					sp_id: 'SGERP.dbo.SG_SACSlipRowCarManagementIFQuery',
					sp_conversion_class: 'gamma',
					external: true,
					rationale:
						'외부 SGERP 시스템 SP / 변경 권한 부재 / 보존 + thin wrapper 의무',
					verification_oracle: 'SP signature 1:1 + return type 정합',
					adr_ref: 'ADR-CHAIN-015-sp-conversion-policy',
				},
			],
		};
		const r = validateSpConversions(taskPlan);
		assert.equal(r.findings.length, 0);
	});

	it('γ classification + adr_ref 부재 → high finding', () => {
		const taskPlan = {
			sp_conversions: [
				{
					sp_id: 'sp_external_x',
					sp_conversion_class: 'gamma',
					external: true,
					rationale: '외부 시스템 SP / 보존 의무 / contract 양식',
				},
			],
		};
		const r = validateSpConversions(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.sp_conversion.no_adr_for_gamma' &&
					f.severity === 'high',
			),
		);
	});

	it('γ classification + external≠true → medium inconsistency finding', () => {
		const taskPlan = {
			sp_conversions: [
				{
					sp_id: 'sp_y',
					sp_conversion_class: 'gamma',
					external: false,
					rationale: 'γ 라 적었지만 external false / inconsistency 표지',
					adr_ref: 'ADR-CHAIN-015-sp-conversion-policy',
				},
			],
		};
		const r = validateSpConversions(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.sp_conversion.gamma_not_external' &&
					f.severity === 'medium',
			),
		);
	});

	it('rationale 길이 부족 (< 10) → medium weak_rationale finding', () => {
		const taskPlan = {
			sp_conversions: [
				{
					sp_id: 'sp_z',
					sp_conversion_class: 'alpha',
					rationale: 'short', // length 5 (passes schema minLength 5 but flagged by validator)
				},
			],
		};
		const r = validateSpConversions(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.sp_conversion.weak_rationale' &&
					f.severity === 'medium',
			),
		);
	});

	it('δ classification + verification_oracle 부재 → medium delta_no_oracle finding', () => {
		const taskPlan = {
			sp_conversions: [
				{
					sp_id: 'sp_recursive_cte',
					sp_conversion_class: 'delta',
					rationale:
						'recursive CTE 의존 / Oracle CONNECT BY 사용 / ORM 표현 어려움 case-by-case',
				},
			],
		};
		const r = validateSpConversions(taskPlan);
		assert.ok(
			r.findings.some(
				(f) =>
					f.kind === 'plan.sp_conversion.delta_no_oracle' &&
					f.severity === 'medium',
			),
		);
	});

	it('β (preserve-batch) 정합 → no finding (adr_ref optional / external optional)', () => {
		const taskPlan = {
			sp_conversions: [
				{
					sp_id: 'sp_year_settlement_batch',
					sp_conversion_class: 'beta',
					rationale:
						'100만+ row 야간 batch / set 기반 처리 / app layer round-trip 폭발 회피 / cursor 의존',
				},
			],
		};
		const r = validateSpConversions(taskPlan);
		assert.equal(r.findings.length, 0);
	});
});

// ──────────────────────────────────────────────────────────────────────
// v0.36.0 (DEC-2026-06-11-tdd-unit-layer-thread) — unit-test obligation (soft/medium)
// ──────────────────────────────────────────────────────────────────────
import { validateUnitTestObligation } from '../src/validator.js';

describe('v0.36.0 validateUnitTestObligation', () => {
	it('unit_refs 보유 + obligation 미선언 → medium finding (soft)', () => {
		const tp = { tasks: [{ id: 'TASK-X-001', unit_refs: ['UNIT-X-001'] }] };
		const r = validateUnitTestObligation(tp);
		assert.equal(r.findings.length, 1);
		assert.equal(r.findings[0].kind, 'plan.task.unit_obligation_missing');
		assert.equal(r.findings[0].severity, 'medium');
	});
	it('obligation 선언 시 finding 0', () => {
		const tp = { tasks: [{ id: 'TASK-X-001', unit_refs: ['UNIT-X-001'], unit_test_obligation: 'required' }] };
		assert.equal(validateUnitTestObligation(tp).findings.length, 0);
	});
	it('unit_refs 부재(behavior-only) 시 finding 0 (무회귀)', () => {
		const tp = { tasks: [{ id: 'TASK-X-001', ac_refs: ['AC-X-001'] }] };
		assert.equal(validateUnitTestObligation(tp).findings.length, 0);
	});
});

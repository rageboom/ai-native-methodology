import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	validateSpecTestLink,
	validateCodeLabelConsistency,
	normalizeLabelId,
	extractJavaDisplayNames,
} from '../src/validator.js';

const validBehavior = { behaviors: [{ id: 'BHV-USER-001' }] };
const validAcceptance = {
	criteria: [
		{
			id: 'AC-USER-001',
			behavior_ref: 'BHV-USER-001',
			verifiable: true,
			test_case_refs: ['TC-USER-001'],
		},
	],
};
const validTestSpec = {
	test_cases: [
		{
			id: 'TC-USER-001',
			ac_ref: 'AC-USER-001',
			bhv_ref: 'BHV-USER-001',
			type: 'integration',
			framework: 'jest',
		},
	],
};
const validInventory = {
	stack: { language: 'typescript', framework: 'nestjs' },
};

describe('spec-test-link-validator', () => {
	it('passes for valid chain 2→3', () => {
		const r = validateSpecTestLink(
			validBehavior,
			validAcceptance,
			validTestSpec,
			validInventory,
		);
		assert.equal(r.summary.critical, 0);
		assert.equal(r.summary.high, 0);
		assert.equal(r.coverage.ac_to_tc, 1.0);
	});

	it('detects TC unknown AC', () => {
		const ts = {
			test_cases: [
				{ id: 'TC-X-001', ac_ref: 'AC-UNKNOWN-001', framework: 'jest' },
			],
		};
		const r = validateSpecTestLink(
			validBehavior,
			validAcceptance,
			ts,
			validInventory,
		);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'chain.tc.unknown_ac' && f.severity === 'critical',
			),
		);
	});

	it('detects verifiable AC without TC', () => {
		const ac = {
			criteria: [
				{
					id: 'AC-USER-001',
					behavior_ref: 'BHV-USER-001',
					verifiable: true,
					test_case_refs: [],
				},
			],
		};
		const ts = { test_cases: [] };
		const r = validateSpecTestLink(validBehavior, ac, ts, validInventory);
		assert.ok(
			r.findings.some(
				(f) => f.kind === 'chain.ac.no_tc' && f.severity === 'high',
			),
		);
	});

	it('detects framework mismatch', () => {
		const ts = {
			test_cases: [
				{
					id: 'TC-USER-001',
					ac_ref: 'AC-USER-001',
					bhv_ref: 'BHV-USER-001',
					framework: 'rspec',
				},
			],
		};
		const inv = { stack: { language: 'typescript', framework: 'nestjs' } };
		const r = validateSpecTestLink(validBehavior, validAcceptance, ts, inv);
		assert.ok(r.findings.some((f) => f.kind === 'chain.tc.framework_mismatch'));
	});

	it('T9 — contract/visual framework 는 stack-mismatch bypass (false-positive 제거)', () => {
		const inv = { stack: { language: 'typescript', framework: 'nestjs' } };
		for (const fw of [
			'schemathesis',
			'pact',
			'spring-cloud-contract',
			'playwright-visual',
			'axe-core',
			'percy',
			'chromatic',
		]) {
			const ts = {
				test_cases: [
					{
						id: 'TC-USER-001',
						ac_ref: 'AC-USER-001',
						bhv_ref: 'BHV-USER-001',
						framework: fw,
					},
				],
			};
			const r = validateSpecTestLink(validBehavior, validAcceptance, ts, inv);
			assert.ok(
				!r.findings.some((f) => f.kind === 'chain.tc.framework_mismatch'),
				`${fw} 는 framework_mismatch 발화 ❌ (schema if/then 이 검증)`,
			);
		}
	});

	it('T9 — 비-contract/visual 미지원 framework 는 여전히 mismatch (회귀 차단)', () => {
		const ts = {
			test_cases: [
				{
					id: 'TC-USER-001',
					ac_ref: 'AC-USER-001',
					bhv_ref: 'BHV-USER-001',
					framework: 'rspec',
				},
			],
		};
		const inv = { stack: { language: 'typescript', framework: 'nestjs' } };
		const r = validateSpecTestLink(validBehavior, validAcceptance, ts, inv);
		assert.ok(r.findings.some((f) => f.kind === 'chain.tc.framework_mismatch'));
	});

	it('detects coverage below threshold', () => {
		const ac = {
			criteria: [
				{
					id: 'AC-USER-001',
					verifiable: true,
					test_case_refs: [],
					behavior_ref: 'BHV-USER-001',
				},
				{
					id: 'AC-USER-002',
					verifiable: true,
					test_case_refs: [],
					behavior_ref: 'BHV-USER-001',
				},
				{
					id: 'AC-USER-003',
					verifiable: true,
					test_case_refs: [],
					behavior_ref: 'BHV-USER-001',
				},
			],
		};
		const r = validateSpecTestLink(
			validBehavior,
			ac,
			{ test_cases: [] },
			validInventory,
		);
		assert.ok(
			r.findings.some((f) => f.kind === 'chain.ac_coverage.below_threshold'),
		);
	});
});

// ──────────────────────────────────────────────────────────────────────
// v0.36.0 (DEC-2026-06-11-tdd-unit-layer-thread) — mocking-soundness + test_layer=unit
// ──────────────────────────────────────────────────────────────────────
import { validateMockSoundness } from '../src/validator.js';

describe('v0.36.0 TDD/unit layer', () => {
	it('test_layer=unit TC 는 ac_ref 없어도 no_ac_ref 미발생 (AC 축 제외)', () => {
		const ts = {
			test_cases: [
				{ id: 'TC-U-001', test_layer: 'unit', class_ref: 'UNIT-U-001', bhv_ref: 'BHV-USER-001' },
				{ id: 'TC-U-002', ac_ref: 'AC-USER-001', bhv_ref: 'BHV-USER-001' },
			],
		};
		const r = validateSpecTestLink(validBehavior, validAcceptance, ts, null, 0.85);
		assert.equal(r.findings.filter((f) => f.kind === 'chain.tc.no_ac_ref').length, 0);
	});

	it('mock-soundness — 협력자 UNIT 의 unit TC 부재 시 unsound finding', () => {
		const ts = {
			test_cases: [
				{ id: 'TC-C-001', ac_ref: 'AC-USER-001', test_layer: 'composition', mocks: [{ collaborator_unit_ref: 'UNIT-DEP-001' }] },
			],
		};
		const r = validateMockSoundness(ts, { units: [] });
		assert.equal(r.findings.length, 1);
		assert.equal(r.findings[0].kind, 'unit.mock.unsound');
	});

	it('mock-soundness — 협력자가 unit TC 보유 시 sound (finding 0)', () => {
		const ts = {
			test_cases: [
				{ id: 'TC-U-001', test_layer: 'unit', class_ref: 'UNIT-DEP-001' },
				{ id: 'TC-C-001', ac_ref: 'AC-USER-001', test_layer: 'composition', mocks: [{ collaborator_unit_ref: 'UNIT-DEP-001' }] },
			],
		};
		const r = validateMockSoundness(ts, { units: [] });
		assert.equal(r.findings.length, 0);
	});

	it('mock-soundness — waived 협력자는 면제', () => {
		const ts = {
			test_cases: [
				{ id: 'TC-C-001', ac_ref: 'AC-USER-001', mocks: [{ collaborator_unit_ref: 'UNIT-DATA-001' }] },
			],
		};
		const r = validateMockSoundness(ts, { units: [{ id: 'UNIT-DATA-001', unit_test_obligation: 'waived' }] });
		assert.equal(r.findings.length, 0);
	});
});

// v0.44.0 — code @DisplayName ↔ test-spec 라벨 정합 (SOFT / DEC-2026-06-13-displayname-label-lint-soft)
describe('validateCodeLabelConsistency (code @DisplayName ↔ test-spec)', () => {
	const tsClean = {
		test_cases: [
			{ id: 'TC-USER-001', ac_ref: 'AC-USER-001', source_file: 'SignupTest.java', source_evidence: 'SignupTest$DuplicateRejection (real JUnit / Mockito)' },
		],
	};
	const brIds = new Set(['BR-USER-DUP-001']);
	const acIds = new Set(['AC-USER-001']);
	const srcOf = (display) => [{ path: 'SignupTest.java', content: `@DisplayName("${display}")\nclass DuplicateRejection {\n  @Test void rejects() {}\n}\n` }];

	it('passes when code label tokens match test-spec mapping (short↔full normalized)', () => {
		const r = validateCodeLabelConsistency(tsClean, srcOf('dup reject (BR-USER-DUP-001 / AC-001 / TC-001)'), brIds, acIds);
		assert.equal(r.summary.total_findings, 0);
		assert.equal(r.checked, 1);
	});

	it('flags fabricated BR id (critical / no-simulation)', () => {
		const r = validateCodeLabelConsistency(tsClean, srcOf('dup reject (BR-USER-FAKE-099 / AC-001 / TC-001)'), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.br_fabricated' && f.severity === 'critical'));
	});

	it('flags TC join mismatch (label TC != test-spec-bound TC)', () => {
		const r = validateCodeLabelConsistency(tsClean, srcOf('dup reject (BR-USER-DUP-001 / AC-001 / TC-009)'), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.tc_join_mismatch' && f.severity === 'high'));
	});

	it('flags unknown AC token (high)', () => {
		const r = validateCodeLabelConsistency(tsClean, srcOf('dup reject (BR-USER-DUP-001 / AC-099 / TC-001)'), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.ac_unknown' && f.severity === 'high'));
	});

	it('skips honestly (join_anchor_absent) when no bindable label — no false positive', () => {
		const ts = { test_cases: [{ id: 'TC-USER-007', ac_ref: 'AC-USER-001', source_file: 'Empty.java', source_evidence: 'Empty$NoSuch (real JUnit)' }] };
		const r = validateCodeLabelConsistency(ts, [{ path: 'Empty.java', content: 'class Empty {}\n' }], brIds, acIds);
		assert.equal(r.summary.total_findings, 0);
		assert.ok(r.skipped.some((s) => s.reason === 'join_anchor_absent'));
	});

	it('non-Java source carried (not flagged)', () => {
		const ts = { test_cases: [{ id: 'TC-USER-001', ac_ref: 'AC-USER-001', source_file: 'a.spec.ts' }] };
		const r = validateCodeLabelConsistency(ts, [{ path: 'a.spec.ts', content: 'describe("x (TC-FAKE-999)", () => {});' }], brIds, acIds);
		assert.equal(r.summary.total_findings, 0);
		assert.ok(r.skipped.some((s) => s.reason === 'non_java_extractor_carry'));
	});

	it('normalizeLabelId expands short to full within scope', () => {
		assert.equal(normalizeLabelId('AC-007', 'RESVGOLF'), 'AC-RESVGOLF-007');
		assert.equal(normalizeLabelId('BR-RESVGOLF-ELIG-002', 'RESVGOLF'), 'BR-RESVGOLF-ELIG-002');
	});

	it('extractJavaDisplayNames binds @DisplayName to class', () => {
		const labels = extractJavaDisplayNames('@DisplayName("x (TC-001)")\nclass Foo {}\n');
		assert.equal(labels.length, 1);
		assert.equal(labels[0].kind, 'class');
		assert.equal(labels[0].name, 'Foo');
		assert.deepEqual(labels[0].tokens.TC, ['TC-001']);
	});
});

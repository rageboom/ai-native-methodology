import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	validateSpecTestLink,
	validateCodeLabelConsistency,
	normalizeLabelId,
	extractJavaDisplayNames,
	extractJsDisplayNames,
	extractPyDisplayNames,
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

	it('unsupported-language source carried (ruby .rb = carry / not flagged)', () => {
		// .py 는 v0.46.0 부터 지원 → 미지원 언어 carry 검증은 genuinely-unsupported ext(.rb)로.
		const ts = { test_cases: [{ id: 'TC-USER-001', ac_ref: 'AC-USER-001', source_file: 'signup_spec.rb' }] };
		const r = validateCodeLabelConsistency(ts, [{ path: 'signup_spec.rb', content: 'it "x (TC-FAKE-999)" do\nend\n' }], brIds, acIds);
		assert.equal(r.summary.total_findings, 0);
		assert.ok(r.skipped.some((s) => s.reason === 'unsupported_extractor_carry'));
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

// v0.45.0 — JS/TS extractor (jest/vitest describe·it/test) — poc-05 vitest·poc-20 js dogfood
describe('validateCodeLabelConsistency — JS/TS extractor (describe·it)', () => {
	const ts = {
		test_cases: [{ id: 'TC-USER-001', ac_ref: 'AC-USER-001', source_file: 'user.service.test.ts' }],
	};
	const brIds = new Set(['BR-USER-DATA-001']);
	const acIds = new Set(['AC-USER-001']);
	const jsSrc = (body) => [{ path: 'user.service.test.ts', content: body }];

	it('extractJsDisplayNames parses describe/it with tokens', () => {
		const labels = extractJsDisplayNames(`describe('TC-USER-001 — register (AC-USER-001)', () => {\n  it('dup (BR-USER-DATA-001)', () => {});\n});`);
		assert.equal(labels.length, 2);
		assert.equal(labels[0].kind, 'describe');
		assert.deepEqual(labels[0].tokens.TC, ['TC-USER-001']);
		assert.equal(labels[1].kind, 'it');
		assert.deepEqual(labels[1].tokens.BR, ['BR-USER-DATA-001']);
	});

	it('JS passes clean (describe TC+AC consistent / it BR real)', () => {
		const r = validateCodeLabelConsistency(ts, jsSrc(`describe('TC-USER-001 — register (AC-USER-001)', () => {\n  it('dup throws (BR-USER-DATA-001)', () => {});\n});`), brIds, acIds);
		assert.equal(r.summary.total_findings, 0);
		assert.ok(r.checked >= 2);
	});

	it('JS flags fabricated BR in it() label (critical)', () => {
		const r = validateCodeLabelConsistency(ts, jsSrc(`describe('TC-USER-001 (AC-USER-001)', () => {\n  it('x (BR-USER-FAKE-099)', () => {});\n});`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.br_fabricated' && f.severity === 'critical'));
	});

	it('JS flags intra-label AC↔TC mismatch in describe (high)', () => {
		const r = validateCodeLabelConsistency(ts, jsSrc(`describe('TC-USER-001 — register (AC-USER-099)', () => {\n  it('x', () => {});\n});`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.ac_tc_mismatch' && f.severity === 'high'));
	});
});

// v0.46.0 — Python/pytest extractor (docstring + 인접 주석 idiom / poc-14·poc-19 dogfood).
//   pytest 함수명 = 독립 식별자 → JS 와 달리 check B(join) 가능(capability gain).
describe('validateCodeLabelConsistency — Python/pytest extractor (docstring·comment)', () => {
	const ts = {
		test_cases: [
			{ id: 'TC-PMT-001', ac_ref: 'AC-PMT-001', source_file: 'test_amort.py', source_evidence: 'test_pmt_tvm_equation' },
			{ id: 'TC-PMT-002', ac_ref: 'AC-PMT-002', source_file: 'test_amort.py', source_evidence: 'test_pmt_zero_rate' },
		],
	};
	const brIds = new Set(['BR-PMT-EQUATION-001']);
	const acIds = new Set(['AC-PMT-001', 'AC-PMT-002']);
	const pySrc = (body) => [{ path: 'test_amort.py', content: body }];

	it('extractPyDisplayNames captures comment+docstring tokens (deduped), binds to fn name', () => {
		const labels = extractPyDisplayNames(
			`# TC-PMT-001  <-  AC-PMT-001 / BR-PMT-EQUATION-001\ndef test_pmt_tvm_equation():\n    """TC-PMT-001 / AC-PMT-001 — pmt eq."""\n    assert True\n`,
		);
		assert.equal(labels.length, 1);
		assert.equal(labels[0].kind, 'test');
		assert.equal(labels[0].name, 'test_pmt_tvm_equation');
		assert.deepEqual(labels[0].tokens.TC, ['TC-PMT-001']); // dedupe: 주석+docstring 둘 다 TC-PMT-001 이지만 1개
		assert.deepEqual(labels[0].tokens.BR, ['BR-PMT-EQUATION-001']);
	});

	it('does not capture module-level docstring as a label', () => {
		const labels = extractPyDisplayNames(
			`"""module TC-PMT-999 / AC-PMT-999 — header."""\nimport pytest\n\ndef test_pmt_tvm_equation():\n    """TC-PMT-001."""\n    assert True\n`,
		);
		assert.equal(labels.length, 1);
		assert.deepEqual(labels[0].tokens.TC, ['TC-PMT-001']); // 모듈 docstring 의 TC-PMT-999 미혼입
	});

	it('Python passes clean — comment idiom (poc-19-like) / join works', () => {
		const r = validateCodeLabelConsistency(ts, pySrc(`# TC-PMT-001  <-  AC-PMT-001 / BR-PMT-EQUATION-001\ndef test_pmt_tvm_equation():\n    assert True\n`), brIds, acIds);
		assert.equal(r.summary.total_findings, 0);
		assert.ok(r.checked >= 1);
		assert.ok(!r.skipped.some((s) => s.tc_id === 'TC-PMT-001' && s.reason === 'join_anchor_absent')); // join 성립(skip 아님)
	});

	it('Python passes clean — docstring idiom (poc-14-like)', () => {
		const r = validateCodeLabelConsistency(ts, pySrc(`def test_pmt_tvm_equation():\n    """TC-PMT-001 / AC-PMT-001 — pmt eq (BR-PMT-EQUATION-001)."""\n    assert True\n`), brIds, acIds);
		assert.equal(r.summary.total_findings, 0);
	});

	it('Python flags fabricated BR id in docstring (critical / no-simulation)', () => {
		const r = validateCodeLabelConsistency(ts, pySrc(`def test_pmt_tvm_equation():\n    """TC-PMT-001 / AC-PMT-001 (BR-PMT-FAKE-099)."""\n    assert True\n`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.br_fabricated' && f.severity === 'critical'));
	});

	it('Python flags TC join mismatch (real-but-wrong-bound) — fn name independent identifier (JS-impossible)', () => {
		// test_pmt_tvm_equation 은 test-spec 상 TC-PMT-001 에 바인딩되는데 라벨이 TC-PMT-002(실재하나 오바인딩) 주장
		const r = validateCodeLabelConsistency(ts, pySrc(`def test_pmt_tvm_equation():\n    """TC-PMT-002."""\n    assert True\n`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.tc_join_mismatch' && f.severity === 'high'));
	});

	it('Python flags intra-label AC↔TC mismatch (high)', () => {
		const r = validateCodeLabelConsistency(ts, pySrc(`def test_pmt_tvm_equation():\n    """TC-PMT-001 / AC-PMT-002."""\n    assert True\n`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.ac_tc_mismatch' && f.severity === 'high'));
	});

	// --- adversarial-verify false-negative 보강 (wf_f649f1d7-f9a) ---
	it('extractPyDisplayNames parses `async def test_*` (pytest-asyncio)', () => {
		const labels = extractPyDisplayNames(`async def test_x():\n    """TC-PMT-001."""\n    pass\n`);
		assert.equal(labels.length, 1);
		assert.equal(labels[0].name, 'test_x');
		assert.deepEqual(labels[0].tokens.TC, ['TC-PMT-001']);
	});

	it('async def drift is caught (not silently missed)', () => {
		// test_pmt_tvm_equation 은 TC-PMT-001 에 바인딩되는데 async fn 라벨이 TC-PMT-002 주장
		const r = validateCodeLabelConsistency(ts, pySrc(`async def test_pmt_tvm_equation():\n    """TC-PMT-002."""\n    assert True\n`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.tc_join_mismatch' && f.severity === 'high'));
	});

	it('flags cross-idiom conflict — comment TC != docstring TC on same fn (high / drift 은폐 차단)', () => {
		const r = validateCodeLabelConsistency(ts, pySrc(`# TC-PMT-001\ndef test_pmt_tvm_equation():\n    """TC-PMT-002."""\n    assert True\n`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.py_idiom_conflict' && f.severity === 'high'));
	});

	it('no conflict when comment and docstring agree (same TC) — composite/dual-idiom clean', () => {
		const r = validateCodeLabelConsistency(ts, pySrc(`# TC-PMT-001 / AC-PMT-001\ndef test_pmt_tvm_equation():\n    """TC-PMT-001 / AC-PMT-001."""\n    assert True\n`), brIds, acIds);
		assert.ok(!r.findings.some((f) => f.kind === 'code_label.py_idiom_conflict'));
	});

	it('multi-fn source_evidence — drift on the 2nd (non-first) fn is caught (exhaustive join)', () => {
		const ts3 = {
			test_cases: [
				{ id: 'TC-PMT-001', ac_ref: 'AC-PMT-001', source_file: 'test_amort.py', source_evidence: 'test_a + test_b' },
				{ id: 'TC-PMT-002', ac_ref: 'AC-PMT-002', source_file: 'test_amort.py', source_evidence: 'test_c' },
			],
		};
		// test_a correct(TC-PMT-001) 먼저, test_b 가 TC-PMT-002(실재하나 오바인딩)로 drift — 2nd fn
		const r = validateCodeLabelConsistency(ts3, pySrc(`def test_a():\n    """TC-PMT-001."""\n    pass\ndef test_b():\n    """TC-PMT-002."""\n    pass\n`), brIds, acIds);
		assert.ok(r.findings.some((f) => f.kind === 'code_label.tc_join_mismatch' && f.bound === 'test_b'));
	});
});

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { rollupBc, rollupFindings, rollupCautions } from '../src/rollup.js';

const BR_LEAF = {
	$schema_ref: 'schemas/business-rules-bc.schema.json',
	business_rules: [
		{ id: 'BR-X-A-001', statement: 'a' },
		{ id: 'BR-X-A-002', statement: 'b' },
	],
};
const CAUTIONS = {
	meta: { generated_at: '2026-06-12T00:00:00Z' },
	system_context: { system_name: 'demo' },
	caution_groups: [
		{ category: 'other', title: 'AS-IS (BC-X)', cautions: [{ id: 'MC-X-1', title: 't', description: 'd' }] },
		{ category: 'security', title: 'PII (BC-X)', cautions: [{ id: 'MC-X-2', title: 't2', description: 'd2' }] },
	],
};
const FINDINGS = {
	critical: 1, high: 0, medium: 1, low: 0, info: 0, total: 2,
	findings: [
		{ finding_id: 'F-X-001', severity: 'critical', description: 'x' },
		{ finding_id: 'F-X-002', severity: 'medium', description: 'y' },
	],
};
const DOMAIN_FRAG = { bounded_context: { id: 'BC-X', name: '신청관리 X' } };

function freshShared() {
	return { index: null, cautions: null, findings: null, domain: { bounded_contexts: [{ id: 'BC-PRE', name: 'pre' }] } };
}

test('fresh rollup — 4 누적기 seed + 채움', () => {
	const { accumulators, report } = rollupBc({
		bcId: 'BC-X',
		fragments: { businessRules: BR_LEAF, cautions: CAUTIONS, findings: FINDINGS, domain: DOMAIN_FRAG },
		accumulators: freshShared(),
		leafRelPath: 'domains/BC-X/business-rules.json',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	// BR index
	assert.equal(accumulators.index.bc_files.length, 1);
	assert.equal(accumulators.index.bc_files[0].rule_count, 2);
	assert.deepEqual(accumulators.index.bc_files[0].rule_ids, ['BR-X-A-001', 'BR-X-A-002']);
	assert.equal(accumulators.index.total_rules, 2);
	// cautions
	assert.equal(accumulators.cautions.caution_groups.length, 2);
	assert.equal(accumulators.cautions.system_context.system_name, 'demo'); // fragment 에서 seed
	// findings
	assert.equal(accumulators.findings.total, 2);
	assert.equal(accumulators.findings.critical, 1);
	assert.equal(accumulators.findings.medium, 1);
	// domain — sibling 보존 + BC-X 추가
	assert.equal(accumulators.domain.bounded_contexts.length, 2);
	assert.ok(accumulators.domain.bounded_contexts.find((b) => b.id === 'BC-X'));
	assert.ok(accumulators.domain.bounded_contexts.find((b) => b.id === 'BC-PRE'));
	assert.equal(report.skipped.length, 0);
});

test('멱등 — 2회 실행 = 동일 상태(중복 ❌)', () => {
	const first = rollupBc({
		bcId: 'BC-X',
		fragments: { businessRules: BR_LEAF, cautions: CAUTIONS, findings: FINDINGS, domain: DOMAIN_FRAG },
		accumulators: freshShared(),
		leafRelPath: 'domains/BC-X/business-rules.json',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	const second = rollupBc({
		bcId: 'BC-X',
		fragments: { businessRules: BR_LEAF, cautions: CAUTIONS, findings: FINDINGS, domain: DOMAIN_FRAG },
		accumulators: first.accumulators,
		leafRelPath: 'domains/BC-X/business-rules.json',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	assert.equal(second.accumulators.index.bc_files.length, 1); // append 아닌 replace
	assert.equal(second.accumulators.index.total_rules, 2);
	assert.equal(second.accumulators.cautions.caution_groups.length, 2);
	assert.equal(second.accumulators.findings.total, 2);
	assert.equal(second.accumulators.findings.findings.length, 2);
	assert.equal(second.accumulators.domain.bounded_contexts.length, 2);
});

test('sibling BC 보존 — 두 번째 BC 추가 시 첫 BC 유지', () => {
	const first = rollupBc({
		bcId: 'BC-X',
		fragments: { businessRules: BR_LEAF, cautions: CAUTIONS, findings: FINDINGS, domain: DOMAIN_FRAG },
		accumulators: freshShared(),
		leafRelPath: 'domains/BC-X/business-rules.json',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	const second = rollupBc({
		bcId: 'BC-Y',
		fragments: {
			businessRules: { business_rules: [{ id: 'BR-Y-A-001' }] },
			cautions: { caution_groups: [{ category: 'other', title: 'AS-IS (BC-Y)', cautions: [{ id: 'MC-Y-1', title: 't', description: 'd' }] }] },
			findings: { findings: [{ finding_id: 'F-Y-001', severity: 'high', description: 'z' }] },
			domain: { bounded_context: { id: 'BC-Y', name: 'Y' } },
		},
		accumulators: first.accumulators,
		leafRelPath: 'domains/BC-Y/business-rules.json',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	assert.equal(second.accumulators.index.bc_files.length, 2);
	assert.equal(second.accumulators.index.total_rules, 3); // 2 + 1
	assert.equal(second.accumulators.cautions.caution_groups.length, 3);
	assert.equal(second.accumulators.findings.total, 3);
	assert.equal(second.accumulators.findings.high, 1);
	assert.equal(second.accumulators.findings.critical, 1);
	assert.equal(second.accumulators.domain.bounded_contexts.length, 3); // BC-PRE + BC-X + BC-Y
});

test('입력(현 shared) 무변형 — dry-run 안전(clone)', () => {
	const shared = freshShared();
	shared.domain.bounded_contexts = [{ id: 'BC-PRE', name: 'pre' }];
	const before = JSON.stringify(shared.domain);
	rollupBc({
		bcId: 'BC-X',
		fragments: { businessRules: BR_LEAF, cautions: null, findings: null, domain: DOMAIN_FRAG },
		accumulators: shared,
		leafRelPath: 'domains/BC-X/business-rules.json',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	assert.equal(JSON.stringify(shared.domain), before); // 원본 불변
});

test('findings — finding_id 없는 레코드 skip(날조 ❌) + 버킷 재계산', () => {
	const obj = { findings: [], total: 0 };
	const r = rollupFindings(obj, {
		findings: [
			{ finding_id: 'F-1', severity: 'high' },
			{ severity: 'critical' }, // id 없음 → skip
			{ finding_id: 'F-2', severity: 'high' },
		],
	});
	assert.equal(r.appended, 2);
	assert.equal(obj.total, 2);
	assert.equal(obj.high, 2);
	assert.equal(obj.critical, 0);
});

test('domain fragment 부재/불완전 → skip', () => {
	const { report } = rollupBc({
		bcId: 'BC-X',
		fragments: { businessRules: BR_LEAF, cautions: null, findings: null, domain: { foo: 'bar' } },
		accumulators: { index: null, cautions: null, findings: null, domain: { bounded_contexts: [] } },
		leafRelPath: 'domains/BC-X/business-rules.json',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	const dom = report.results.find((r) => r.accumulator === 'domain');
	assert.equal(dom.action, 'skipped');
});

test('shared domain 부재 시 fresh 생성 ❌ (baseline 선재 의무)', () => {
	const { report } = rollupBc({
		bcId: 'BC-X',
		fragments: { businessRules: null, cautions: null, findings: null, domain: DOMAIN_FRAG },
		accumulators: { index: null, cautions: null, findings: null, domain: null },
		leafRelPath: 'x',
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	const skip = report.skipped.find((s) => s.accumulator === 'domain');
	assert.ok(skip && skip.reason.includes('baseline'));
});

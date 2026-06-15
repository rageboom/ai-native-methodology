// verdict-consistency-validator unit tests — VC1~VC4 + advisory/enforce 모드 + no-domains N/A.
// 판별 칼 = 소유 쓰기 aggregate(sql-inventory by_type insert+update+delete). DEC-2026-06-15-bc-verdict-classification.
// 프로그램적 tmp fixture(mkdtemp) — 디렉토리 구조 시나리오마다 격리.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateVerdicts } from '../src/validator.js';

// spec = { registry:[{id,verdict?,verdict_basis?}], bcs:{ 'BC-X': {select,insert,update,delete} | null }, concerns:{ '<file>.json':[{id,origin_module,verdict?}] }, ccDirs:['mod', ...] }
function makeTree(spec = {}) {
	const root = mkdtempSync(join(tmpdir(), 'verdict-'));
	const shared = join(root, 'shared');
	const domains = join(root, 'domains');
	mkdirSync(shared, { recursive: true });
	mkdirSync(domains, { recursive: true });
	writeFileSync(
		join(shared, 'domain.json'),
		JSON.stringify({ bounded_contexts: spec.registry || [] }),
	);
	for (const [bc, bt] of Object.entries(spec.bcs || {})) {
		mkdirSync(join(domains, bc), { recursive: true });
		if (bt !== null) {
			mkdirSync(join(domains, bc, 'sql-inventory'), { recursive: true });
			writeFileSync(
				join(domains, bc, 'sql-inventory', 'sql-inventory.json'),
				JSON.stringify({ summary: { by_type: bt } }),
			);
		}
	}
	for (const [file, concerns] of Object.entries(spec.concerns || {})) {
		writeFileSync(join(shared, file), JSON.stringify({ cross_cutting_concerns: concerns }));
	}
	for (const mod of spec.ccDirs || []) {
		mkdirSync(join(shared, 'cross-cutting', mod), { recursive: true });
	}
	return root;
}
const cleanup = (root) => rmSync(root, { recursive: true, force: true });
const kinds = (r) => r.findings.map((f) => f.kind);
const byKind = (r, k) => r.findings.filter((f) => f.kind === k);

test('clean — core BC write>0, verdict 정합, basis 일치 → 0 critical/high/medium', () => {
	const root = makeTree({
		registry: [{ id: 'BC-ORDER', verdict: 'core', verdict_basis: { write_ops: 5 } }],
		bcs: { 'BC-ORDER': { select: 10, insert: 3, update: 2, delete: 0 } },
	});
	const r = validateVerdicts(root);
	assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
	assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
	assert.equal(r.summary.medium, 0, JSON.stringify(r.findings));
	cleanup(root);
});

test('VC2 verdict-contradiction — core 인데 write_ops=0 → advisory medium (downgraded_from high)', () => {
	const root = makeTree({
		registry: [{ id: 'BC-LOOKUP', verdict: 'core' }],
		bcs: { 'BC-LOOKUP': { select: 8, insert: 0, update: 0, delete: 0 } },
	});
	const r = validateVerdicts(root); // advisory(default)
	const c = byKind(r, 'verdict-contradiction');
	assert.equal(c.length, 1, JSON.stringify(r.findings));
	assert.equal(c[0].severity, 'medium', 'advisory: high→medium 강등');
	assert.equal(c[0].downgraded_from, 'high');
	assert.equal(r.summary.high, 0, 'advisory 는 게이트 비차단(high=0)');
	assert.equal(r.mode, 'advisory');
	cleanup(root);
});

test('VC2 verdict-contradiction — enforce 모드 → high 유지 (gate HARD block)', () => {
	const root = makeTree({
		registry: [{ id: 'BC-LOOKUP', verdict: 'core' }],
		bcs: { 'BC-LOOKUP': { select: 8, insert: 0, update: 0, delete: 0 } },
	});
	const r = validateVerdicts(root, { enforce: true });
	const c = byKind(r, 'verdict-contradiction');
	assert.equal(c.length, 1);
	assert.equal(c[0].severity, 'high', 'enforce: high 유지');
	assert.equal(r.summary.high, 1);
	assert.equal(r.mode, 'enforce');
	cleanup(root);
});

test('VC2 verdict-contradiction — cross_cutting(소유 없음 함의) 인데 write_ops>0', () => {
	const root = makeTree({
		registry: [{ id: 'BC-AUDIT', verdict: 'cross_cutting' }],
		bcs: { 'BC-AUDIT': { select: 4, insert: 2, update: 0, delete: 0 } },
	});
	const r = validateVerdicts(root, { enforce: true });
	assert.equal(byKind(r, 'verdict-contradiction').length, 1, JSON.stringify(r.findings));
	cleanup(root);
});

test('VC2 basis-mismatch — verdict_basis.write_ops ≠ 실제 → high(enforce)', () => {
	const root = makeTree({
		registry: [{ id: 'BC-X', verdict: 'core', verdict_basis: { write_ops: 99 } }],
		bcs: { 'BC-X': { select: 1, insert: 3, update: 2, delete: 0 } }, // 실제 write=5
	});
	const r = validateVerdicts(root, { enforce: true });
	const m = byKind(r, 'basis-mismatch');
	assert.equal(m.length, 1, JSON.stringify(r.findings));
	assert.equal(m[0].severity, 'high');
	cleanup(root);
});

test('VC2 needs-verdict-readonly — verdict 부재 + read>0 write=0 → medium', () => {
	const root = makeTree({
		registry: [{ id: 'BC-EMPLOYEE' }],
		bcs: { 'BC-EMPLOYEE': { select: 66, insert: 0, update: 0, delete: 0 } },
	});
	const r = validateVerdicts(root);
	const n = byKind(r, 'needs-verdict-readonly');
	assert.equal(n.length, 1, JSON.stringify(r.findings));
	assert.equal(n[0].severity, 'medium');
	cleanup(root);
});

test('VC2 needs-verdict — verdict 부재 + write>0 → low (백필 대상)', () => {
	const root = makeTree({
		registry: [{ id: 'BC-ORDER' }],
		bcs: { 'BC-ORDER': { select: 5, insert: 3, update: 0, delete: 1 } },
	});
	const r = validateVerdicts(root);
	const n = byKind(r, 'needs-verdict');
	assert.equal(n.length, 1, JSON.stringify(r.findings));
	assert.equal(n[0].severity, 'low');
	cleanup(root);
});

test('VC2 no-sql-data — 등록 BC 인데 sql-inventory 부재 → low(계산 불가 정직)', () => {
	const root = makeTree({
		registry: [{ id: 'BC-NOSQL', verdict: 'core' }],
		bcs: { 'BC-NOSQL': null }, // sql-inventory 미작성
	});
	const r = validateVerdicts(root);
	assert.equal(byKind(r, 'no-sql-data').length, 1, JSON.stringify(r.findings));
	cleanup(root);
});

test('VC1 unregistered — domains/BC dir 가 domain.json 레지스트리에 없음 → low', () => {
	const root = makeTree({
		registry: [], // BC-NEW 미등록
		bcs: { 'BC-NEW': { select: 1, insert: 1, update: 0, delete: 0 } },
	});
	const r = validateVerdicts(root);
	assert.equal(byKind(r, 'unregistered').length, 1, JSON.stringify(r.findings));
	cleanup(root);
});

test('VC3+VC4 double-classification + stale-concern — cross-cutting concern ↔ 등록 BC', () => {
	const root = makeTree({
		registry: [{ id: 'BC-RESV-ATHRT', verdict: 'supporting', verdict_basis: { write_ops: 4 } }],
		bcs: { 'BC-RESV-ATHRT': { select: 3, insert: 2, update: 2, delete: 0 } },
		concerns: {
			'reservation-cross-cutting.json': [
				{ id: 'CC-ATHRT', origin_module: 'backoffice/resv/athrt', verdict: 'cross_cutting' },
			],
		},
	});
	const r = validateVerdicts(root, { enforce: true });
	assert.equal(byKind(r, 'double-classification').length, 1, JSON.stringify(r.findings));
	assert.equal(byKind(r, 'stale-concern').length, 1, JSON.stringify(r.findings));
	assert.equal(byKind(r, 'double-classification')[0].severity, 'high');
	cleanup(root);
});

test('VC3 double-classification — shared/cross-cutting/<mod>/ dir 쌍둥이 ↔ 등록 BC', () => {
	const root = makeTree({
		registry: [{ id: 'BC-RESV-ATHRT', verdict: 'supporting', verdict_basis: { write_ops: 4 } }],
		bcs: { 'BC-RESV-ATHRT': { select: 3, insert: 2, update: 2, delete: 0 } },
		ccDirs: ['athrt'],
	});
	const r = validateVerdicts(root, { enforce: true });
	assert.equal(byKind(r, 'double-classification').length, 1, JSON.stringify(r.findings));
	cleanup(root);
});

test('double-classification — advisory 모드는 high→medium 강등 (비차단)', () => {
	const root = makeTree({
		registry: [{ id: 'BC-RESV-ATHRT', verdict: 'supporting', verdict_basis: { write_ops: 4 } }],
		bcs: { 'BC-RESV-ATHRT': { select: 3, insert: 2, update: 2, delete: 0 } },
		ccDirs: ['athrt'],
	});
	const r = validateVerdicts(root); // advisory
	assert.equal(r.summary.high, 0, 'advisory 비차단');
	assert.equal(byKind(r, 'double-classification')[0].severity, 'medium');
	cleanup(root);
});

test('no-domains N/A — domains/ 부재 → info(비차단) / 게이트 영향 0 (회귀 차단)', () => {
	const root = mkdtempSync(join(tmpdir(), 'verdict-flat-'));
	mkdirSync(join(root, 'shared'), { recursive: true });
	writeFileSync(join(root, 'shared', 'domain.json'), JSON.stringify({ bounded_contexts: [] }));
	// domains/ 디렉토리 의도적 미생성 = 비-샤딩 분석 산출물
	const adv = validateVerdicts(root);
	assert.equal(adv.summary.critical, 0);
	assert.equal(adv.summary.high, 0, 'no-domains 가 high 로 게이트 막으면 안 됨');
	assert.equal(kinds(adv)[0], 'no-domains-na');
	assert.equal(adv.findings[0].severity, 'info');
	// enforce 모드에서도 비-샤딩 = N/A (verdict 위반 아님)
	const enf = validateVerdicts(root, { enforce: true });
	assert.equal(enf.summary.high, 0, 'enforce 에서도 no-domains 는 비차단 N/A');
	cleanup(root);
});

test('summary tally 정합 — findings 의 severity 분포와 summary 일치', () => {
	const root = makeTree({
		registry: [{ id: 'BC-A', verdict: 'core' }], // write=0 → contradiction
		bcs: {
			'BC-A': { select: 5, insert: 0, update: 0, delete: 0 },
			'BC-B': { select: 9, insert: 0, update: 0, delete: 0 }, // 미등록 + readonly
		},
	});
	const r = validateVerdicts(root, { enforce: true });
	const recomputed = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
	for (const f of r.findings) recomputed[f.severity]++;
	assert.deepEqual(r.summary, recomputed, JSON.stringify(r.findings));
	cleanup(root);
});

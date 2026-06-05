// ADR-010 baseline + ratchet — DTV finding 호환 회귀 (Sprint 5+ Phase C).
// drift-validator 와 공용인 tools/_shared/baseline.js 가 DTV finding (table_index / column_index / location)
// 도 결정적 fingerprint 처리 + ratchet 분류 가능한지 검증.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
	fingerprint,
	readBaseline,
	classifyAgainstBaseline,
	writeBaseline,
	ratchetCheck,
} from '../../_shared/baseline.js';

test(' DTV finding fingerprint — 동일 finding (kind+table_index+column_index) 동일 fingerprint', () => {
	const f = {
		kind: 'rule.conflict',
		severity: 'breaking',
		table_index: 2,
		location: 'BR-EMAIL.md table#3',
	};
	assert.equal(fingerprint(f), fingerprint(f));
	assert.equal(fingerprint(f).length, 16);
});

test(' DTV finding fingerprint — table_index 다르면 fingerprint 다름', () => {
	const a = { kind: 'rule.conflict', table_index: 2 };
	const b = { kind: 'rule.conflict', table_index: 3 };
	assert.notEqual(fingerprint(a), fingerprint(b));
});

test(' DTV finding fingerprint — column_index 다르면 fingerprint 다름', () => {
	const a = { kind: 'type.mixed-column', column_index: 1 };
	const b = { kind: 'type.mixed-column', column_index: 2 };
	assert.notEqual(fingerprint(a), fingerprint(b));
});

test(' DTV writeBaseline + readBaseline + classifyAgainstBaseline — DTV finding 라운드트립', () => {
	const dir = mkdtempSync(join(tmpdir(), 'dtv-baseline-test-'));
	const path = join(dir, 'baseline.json');
	try {
		const oldFindings = [
			{
				kind: 'rule.conflict',
				severity: 'breaking',
				table_index: 2,
				location: 'BR-EMAIL.md table#3',
			},
			{
				kind: 'type.mixed-column',
				severity: 'non-breaking',
				column_index: 1,
				location: 'BR-FOO.md table#1',
			},
		];
		writeBaseline(path, oldFindings, 'dtv-test-sha');
		const baseline = readBaseline(path);
		assert.equal(baseline.fingerprints.size, 2);

		// novel = rule.gap 신규
		const newFindings = [
			...oldFindings,
			{
				kind: 'rule.gap',
				severity: 'breaking',
				table_index: 5,
				location: 'BR-NEW.md table#1',
			},
		];
		const { grandfathered, novel } = classifyAgainstBaseline(
			newFindings,
			baseline,
		);
		assert.equal(grandfathered.length, 2);
		assert.equal(novel.length, 1);
		assert.equal(novel[0].kind, 'rule.gap');

		const ratchet = ratchetCheck({ grandfathered, novel });
		assert.equal(
			ratchet.blocked_count,
			1,
			'breaking severity 신규 → 차단 의무',
		);
		assert.equal(ratchet.pass, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

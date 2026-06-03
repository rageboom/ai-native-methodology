// ADR-010 baseline + ratchet 단위 테스트.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
	fingerprint,
	readBaseline,
	classifyAgainstBaseline,
	writeBaseline,
	ratchetCheck,
} from '../src/baseline.js';

test('fingerprint — 동일 finding → 동일 fingerprint', () => {
	const f = { kind: 'state.missing-in-mermaid', json: 'foo', mermaid: null };
	assert.equal(fingerprint(f), fingerprint(f));
	assert.equal(fingerprint(f).length, 16);
});

test('fingerprint — 다른 finding → 다른 fingerprint', () => {
	const a = { kind: 'state.missing-in-mermaid', json: 'foo' };
	const b = { kind: 'state.missing-in-mermaid', json: 'bar' };
	assert.notEqual(fingerprint(a), fingerprint(b));
});

test('writeBaseline + readBaseline — round-trip', () => {
	const dir = mkdtempSync(join(tmpdir(), 'baseline-test-'));
	const path = join(dir, 'baseline.json');
	try {
		const findings = [
			{ kind: 'state.missing-in-mermaid', json: 'foo', severity: 'breaking' },
			{
				kind: 'transition.missing-in-mermaid',
				json: 'bar',
				severity: 'breaking',
			},
		];
		writeBaseline(path, findings, 'sha-abc123');
		const baseline = readBaseline(path);
		assert.equal(baseline.fingerprints.size, 2);
		assert.equal(baseline.meta.source_commit_sha, 'sha-abc123');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('classifyAgainstBaseline — grandfathered + novel 분류', () => {
	const dir = mkdtempSync(join(tmpdir(), 'baseline-test-'));
	const path = join(dir, 'baseline.json');
	try {
		const oldFindings = [
			{ kind: 'state.missing-in-mermaid', json: 'foo', severity: 'breaking' },
		];
		writeBaseline(path, oldFindings);
		const baseline = readBaseline(path);

		const newFindings = [
			{ kind: 'state.missing-in-mermaid', json: 'foo', severity: 'breaking' }, // grandfathered
			{ kind: 'state.missing-in-mermaid', json: 'baz', severity: 'breaking' }, // novel
		];
		const { grandfathered, novel } = classifyAgainstBaseline(
			newFindings,
			baseline,
		);
		assert.equal(grandfathered.length, 1);
		assert.equal(novel.length, 1);
		assert.equal(novel[0].json, 'baz');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('ratchetCheck — novel breaking → blocked', () => {
	const grandfathered = [];
	const novel = [{ kind: 'x', severity: 'breaking' }];
	const result = ratchetCheck({ grandfathered, novel });
	assert.equal(result.blocked_count, 1);
	assert.equal(result.pass, false);
});

test('ratchetCheck — novel info → pass', () => {
	const grandfathered = [{ severity: 'breaking' }];
	const novel = [{ kind: 'x', severity: 'info' }];
	const result = ratchetCheck({ grandfathered, novel });
	assert.equal(result.blocked_count, 0);
	assert.equal(result.pass, true);
});

test('ratchetCheck — novel low → pass (severity 별 강도)', () => {
	const novel = [{ kind: 'x', severity: 'low' }];
	const result = ratchetCheck({ grandfathered: [], novel });
	assert.equal(result.blocked_count, 0);
	assert.equal(result.pass, true);
});

test('readBaseline — 부재 파일 → 빈 set', () => {
	const baseline = readBaseline('/tmp/does-not-exist-baseline.json');
	assert.equal(baseline.fingerprints.size, 0);
});

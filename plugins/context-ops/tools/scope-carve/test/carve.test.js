import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildCarve, DEFAULT_PARAMS } from '../src/carve.js';

const SEP = String.fromCharCode(1);
function fakeLog(commits) {
	return commits.map((c) => `${SEP}${c.sha}\n\n${c.files.join('\n')}\n`).join('');
}

const ARCH = {
	modules: [
		{ id: 'MOD-A' },
		{ id: 'MOD-B' },
		{ id: 'MOD-C' },
		{ id: 'MOD-SINK' },
	],
	dependencies: [
		{ from: 'MOD-A', to: 'MOD-B' },
		{ from: 'MOD-B', to: 'MOD-A' }, // cycle A<->B
		{ from: 'MOD-C', to: 'MOD-A' },
		{ from: 'MOD-SINK', to: 'MOD-C' }, // SINK = nobody depends on it
	],
};
const RAW = JSON.stringify(ARCH);

function build(opts = {}) {
	return buildCarve({
		architectureRaw: RAW,
		architecture: ARCH,
		architecturePath: '/tmp/architecture.json',
		repoPath: opts.repoPath ?? null,
		gitRunner: opts.gitRunner ?? null,
		params: opts.params ?? DEFAULT_PARAMS,
		nowIso: opts.nowIso ?? '2026-06-09T00:00:00.000Z',
		durationMs: 0,
		reproductionCommand: 'scope-carve --architecture /tmp/architecture.json',
	});
}

test('reference-lens meta — structural trust enforcement', () => {
	const r = build();
	assert.equal(r.meta.schema, 'scope-carve.schema.json');
	assert.equal(r.meta.generated_by, 'scope-carve');
	assert.equal(r.meta.do_not_edit_manually, true);
	assert.equal(r.meta.reference_lens, true);
	assert.ok(r.meta.trust_note.includes('NOT gate-injected'));
	assert.ok(r.meta.derived_from.length >= 1);
});

test('evidence — real_tool + 64-hex hashes', () => {
	const r = build();
	assert.equal(r.evidence.evidence_trust, 'real_tool');
	assert.match(r.evidence.result_hash, /^[a-f0-9]{64}$/);
	assert.match(r.evidence.inputs_hash, /^[a-f0-9]{64}$/);
});

test('SCC atomic unit + Martin sink surfaced as candidates', () => {
	const r = build();
	const atomic = r.carve_candidates.find((c) => c.kind === 'atomic_unit');
	assert.ok(atomic);
	assert.deepEqual(atomic.members, ['MOD-A', 'MOD-B']);
	const seam = r.carve_candidates.find((c) => c.kind === 'clean_seam');
	assert.ok(seam);
	assert.deepEqual(seam.members, ['MOD-SINK']);
});

test('A/D abstain across all modules', () => {
	const r = build();
	for (const m of r.martin) {
		assert.equal(m.abstractness, null);
		assert.equal(m.distance, null);
		assert.equal(m.abstractness_status, 'not_computable');
	}
});

test('co_change not_run without repo; mined with gitRunner', () => {
	const noRepo = build();
	assert.equal(noRepo.co_change.status, 'not_run');
	assert.equal(noRepo.evidence.git_available, false);

	const withGit = build({
		repoPath: '/tmp/fake',
		gitRunner: () =>
			fakeLog([
				{ sha: 'c1', files: ['x.js', 'y.js'] },
				{ sha: 'c2', files: ['x.js', 'y.js'] },
			]),
	});
	assert.equal(withGit.co_change.status, 'mined');
	assert.equal(withGit.evidence.git_available, true);
	assert.equal(
		withGit.carve_candidates.filter((c) => c.kind === 'behavioral_cluster')
			.length,
		1,
	);
});

test('result_hash deterministic + independent of timestamp', () => {
	const a = build({ nowIso: '2026-06-09T00:00:00.000Z' });
	const b = build({ nowIso: '2027-01-01T12:34:56.000Z' });
	assert.equal(a.evidence.result_hash, b.evidence.result_hash);
});

test('result_hash changes when input changes', () => {
	const base = build();
	const altArch = {
		modules: [{ id: 'MOD-A' }, { id: 'MOD-B' }],
		dependencies: [{ from: 'MOD-A', to: 'MOD-B' }],
	};
	const alt = buildCarve({
		architectureRaw: JSON.stringify(altArch),
		architecture: altArch,
		architecturePath: '/tmp/architecture.json',
		nowIso: '2026-06-09T00:00:00.000Z',
	});
	assert.notEqual(base.evidence.result_hash, alt.evidence.result_hash);
});

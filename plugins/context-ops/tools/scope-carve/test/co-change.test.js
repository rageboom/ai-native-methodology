import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mineCoChange } from '../src/co-change.js';

const SEP = String.fromCharCode(1);

// synthetic git fixture (decision #3 / DEC §2.6) — fake gitRunner 로 결정성·param 동작 입증.
function fakeLog(commits) {
	return commits.map((c) => `${SEP}${c.sha}\n\n${c.files.join('\n')}\n`).join('');
}
function runnerOf(commits) {
	return () => fakeLog(commits);
}

const PARAMS = {
	min_support: 2,
	min_confidence: 0.5,
	window: null,
	max_transaction_size: 30,
	since: null,
};

test('mines co-change pairs with support + confidence', () => {
	const r = mineCoChange({
		gitRunner: runnerOf([
			{ sha: 'c1', files: ['a.js', 'b.js'] },
			{ sha: 'c2', files: ['a.js', 'b.js'] },
			{ sha: 'c3', files: ['a.js', 'c.js'] },
		]),
		params: PARAMS,
	});
	assert.equal(r.status, 'mined');
	assert.equal(r.transactions_analyzed, 3);
	assert.equal(r.pairs.length, 1); // only (a,b) reaches support>=2
	const p = r.pairs[0];
	assert.equal(p.a, 'a.js');
	assert.equal(p.b, 'b.js');
	assert.equal(p.support, 2);
	assert.equal(p.confidence_a_given_b, 1); // 2 / count(b)=2
	assert.equal(p.confidence_b_given_a, 0.6667); // 2 / count(a)=3
});

test('file_churn = raw revision count over windowed commits (pre-filter / hotspot input)', () => {
	const r = mineCoChange({
		gitRunner: runnerOf([
			{ sha: 'c1', files: ['a.js', 'b.js'] },
			{ sha: 'c2', files: ['a.js', 'b.js'] },
			{ sha: 'c3', files: ['a.js', 'c.js'] },
			{ sha: 'c4', files: ['a.js'] }, // single-file commit: excluded from pairs, counted in churn
		]),
		params: PARAMS,
	});
	// churn counts ALL windowed commits (incl. single-file c4) → a=4, b=2, c=1
	assert.equal(r.file_churn['a.js'], 4);
	assert.equal(r.file_churn['b.js'], 2);
	assert.equal(r.file_churn['c.js'], 1);
});

test('max_transaction_size excludes tangled commits', () => {
	const r = mineCoChange({
		gitRunner: runnerOf([
			{ sha: 'c1', files: ['a.js', 'b.js'] },
			{ sha: 'c2', files: ['a.js', 'b.js'] },
			{ sha: 'big', files: ['a.js', 'b.js', 'x.js', 'y.js'] },
		]),
		params: { ...PARAMS, max_transaction_size: 3 },
	});
	// big (4 files) excluded → support(a,b) = 2
	assert.equal(r.transactions_analyzed, 2);
	assert.equal(r.pairs[0].support, 2);
});

test('window limits to most recent N commits (newest-first)', () => {
	const r = mineCoChange({
		gitRunner: runnerOf([
			{ sha: 'new1', files: ['a.js', 'b.js'] },
			{ sha: 'new2', files: ['a.js', 'b.js'] },
			{ sha: 'old', files: ['a.js', 'b.js'] },
		]),
		params: { ...PARAMS, window: 2 },
	});
	assert.equal(r.transactions_analyzed, 2);
	assert.equal(r.pairs[0].support, 2);
});

test('min_support filter drops weak pairs', () => {
	const r = mineCoChange({
		gitRunner: runnerOf([{ sha: 'c1', files: ['a.js', 'b.js'] }]),
		params: PARAMS,
	});
	assert.equal(r.pairs.length, 0); // support 1 < min_support 2
});

test('no_git_history on git failure (honest skip, no fabrication)', () => {
	const r = mineCoChange({
		gitRunner: () => {
			throw new Error('not a git repository');
		},
		params: PARAMS,
	});
	assert.equal(r.status, 'no_git_history');
	assert.equal(r.pairs.length, 0);
});

test('no_git_history on empty output', () => {
	const r = mineCoChange({ gitRunner: () => '', params: PARAMS });
	assert.equal(r.status, 'no_git_history');
});

test('not_run when gitRunner missing', () => {
	const r = mineCoChange({ gitRunner: null, params: PARAMS });
	assert.equal(r.status, 'not_run');
});

test('deterministic — identical pairs across runs', () => {
	const commits = [
		{ sha: 'c1', files: ['z.js', 'a.js', 'b.js'] },
		{ sha: 'c2', files: ['a.js', 'b.js'] },
		{ sha: 'c3', files: ['a.js', 'z.js'] },
	];
	const r1 = mineCoChange({ gitRunner: runnerOf(commits), params: PARAMS });
	const r2 = mineCoChange({ gitRunner: runnerOf(commits), params: PARAMS });
	assert.deepEqual(r1.pairs, r2.pairs);
	// sorted: support desc then a,b asc
	for (let i = 1; i < r1.pairs.length; i++) {
		assert.ok(r1.pairs[i - 1].support >= r1.pairs[i].support);
	}
});

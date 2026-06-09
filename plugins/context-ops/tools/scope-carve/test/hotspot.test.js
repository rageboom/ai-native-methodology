import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { indentationComplexity, computeHotspot } from '../src/hotspot.js';

test('indentationComplexity — sums indent levels, skips blank lines', () => {
	const content = ['a', '    b', '        c', '', '    d'].join('\n');
	// levels (tab_width 4): 0 + 1 + 2 + (blank skip) + 1 = 4 over 4 lines
	const cx = indentationComplexity(content, 4);
	assert.equal(cx.total, 4);
	assert.equal(cx.lines, 4);
	assert.equal(cx.mean, 1);
});

test('indentationComplexity — tabs expand to tab_width', () => {
	const cx = indentationComplexity('\t\tx', 4); // 2 tabs = 8 spaces = level 2
	assert.equal(cx.total, 2);
});

const PARAMS = { top_n: 3, min_churn: 2, tab_width: 4 };
const FILES = {
	'deep.js': 'a\n    b\n        c\n', // complexity 0+1+2 = 3
	'flat.md': 'x\ny\nz\n', // complexity 0 (flat → low hotspot)
	'mid.js': '    a\n    b\n', // complexity 1+1 = 2
};
const readFileFn = (p) => {
	if (!(p in FILES)) throw new Error('ENOENT');
	return FILES[p];
};

test('hotspot = churn × complexity, ranked desc, top_n capped', () => {
	const fileChurn = { 'deep.js': 5, 'flat.md': 10, 'mid.js': 3, 'rare.js': 1 };
	const r = computeHotspot({
		fileChurn,
		repoPath: null,
		readFileFn,
		params: PARAMS,
		coChangeStatus: 'mined',
	});
	assert.equal(r.status, 'mined');
	// rare.js churn 1 < min_churn 2 → excluded
	// deep=5×3=15, mid=3×2=6, flat=10×0=0
	assert.deepEqual(
		r.items.map((i) => i.file),
		['deep.js', 'mid.js', 'flat.md'],
	);
	assert.equal(r.items[0].score, 15);
	assert.equal(r.items[2].score, 0); // flat file = low hotspot (Tornhill 의도)
});

test('flat churned file ranks below complex file (Tornhill intent)', () => {
	const r = computeHotspot({
		fileChurn: { 'flat.md': 100, 'deep.js': 2 },
		repoPath: null,
		readFileFn,
		params: PARAMS,
		coChangeStatus: 'mined',
	});
	// flat.md churn 100 but complexity 0 → score 0; deep.js 2×3=6 → deep first
	assert.equal(r.items[0].file, 'deep.js');
});

test('unreadable file (deleted/moved) → honest skip', () => {
	const r = computeHotspot({
		fileChurn: { 'deep.js': 5, 'gone.js': 9 },
		repoPath: null,
		readFileFn,
		params: PARAMS,
		coChangeStatus: 'mined',
	});
	assert.deepEqual(
		r.items.map((i) => i.file),
		['deep.js'],
	);
	assert.match(r.note, /unreadable/);
});

test('status mirrors co_change when churn absent', () => {
	for (const st of ['no_git_history', 'not_run']) {
		const r = computeHotspot({
			fileChurn: {},
			repoPath: null,
			readFileFn,
			params: PARAMS,
			coChangeStatus: st,
		});
		assert.equal(r.status, st);
		assert.equal(r.items.length, 0);
	}
});

test('not_run when readFileFn missing', () => {
	const r = computeHotspot({
		fileChurn: { 'deep.js': 5 },
		repoPath: null,
		readFileFn: null,
		params: PARAMS,
		coChangeStatus: 'mined',
	});
	assert.equal(r.status, 'not_run');
});

test('deterministic across runs', () => {
	const fileChurn = { 'deep.js': 5, 'mid.js': 3, 'flat.md': 4 };
	const a = computeHotspot({
		fileChurn,
		repoPath: null,
		readFileFn,
		params: PARAMS,
		coChangeStatus: 'mined',
	});
	const b = computeHotspot({
		fileChurn,
		repoPath: null,
		readFileFn,
		params: PARAMS,
		coChangeStatus: 'mined',
	});
	assert.deepEqual(a.items, b.items);
});

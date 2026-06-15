import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	extractSymbols,
	sampleSymbols,
	callSiteFiles,
	defFiles,
	compareSymbol,
	aggregate,
	scanFabricationRisk,
	computeVerdict,
	calibrate,
} from '../src/calibrate.js';

// ── extraction primitives ────────────────────────────────────────────────────
test('extractSymbols — function / const-arrow / def / func forms', () => {
	const syms = extractSymbols(
		'export function getUserById(){}\nconst helper = (a) => a\nfunction parseArgs(x){}\ndef compute(self):\nfunc Run() {}\n',
	);
	assert.ok(syms.includes('getUserById'));
	assert.ok(syms.includes('helper'));
	assert.ok(syms.includes('parseArgs'));
	assert.ok(syms.includes('compute'));
	assert.ok(syms.includes('Run'));
});

test('sampleSymbols — deterministic stride sample, capped, distinct', () => {
	const all = ['e', 'b', 'a', 'd', 'c'];
	const s = sampleSymbols(all, 3);
	assert.equal(s.length, 3);
	assert.deepEqual(s, [...s].sort()); // drawn from sorted list
	assert.deepEqual(sampleSymbols(['x', 'y'], 5), ['x', 'y']); // <= n returns all (sorted)
});

test('callSiteFiles — counts calls, excludes def line + import line', () => {
	const fc = {
		'a.js': 'export function foo(){ return 1 }\n', // def only — not a call site
		'b.js': 'import { foo } from "./a"\nfunction bar(){ return foo() }\n', // import line skipped, call counted
		'c.js': 'const x = 1\n', // no foo
	};
	assert.deepEqual(callSiteFiles('foo', fc), ['b.js']);
});

test('defFiles — locates definitions', () => {
	const fc = { 'a.js': 'function foo(){}', 'b.js': 'const foo = () => 1', 'c.js': 'foo()' };
	assert.deepEqual(defFiles('foo', fc), ['a.js', 'b.js']);
});

// ── comparison + aggregate ────────────────────────────────────────────────────
test('compareSymbol — matched / cg_only(phantom) / gt_only(missed) / vacuous', () => {
	assert.deepEqual(compareSymbol('s', ['x.js', 'y.js'], ['x.js']), {
		symbol: 's',
		matched: 1,
		cg_only: 1,
		gt_only: 0,
		cg_only_files: ['y.js'],
		gt_only_files: [],
		vacuous: false,
	});
	assert.equal(compareSymbol('s', [], []).vacuous, true);
});

test('aggregate — precision/recall, vacuous excluded', () => {
	const agg = aggregate([
		{ matched: 2, cg_only: 0, gt_only: 0, vacuous: false },
		{ matched: 1, cg_only: 1, gt_only: 1, vacuous: false },
		{ matched: 0, cg_only: 0, gt_only: 0, vacuous: true }, // excluded
	]);
	assert.equal(agg.measured, 2);
	assert.equal(agg.tp, 3);
	assert.equal(agg.precision, 3 / 4);
	assert.equal(agg.recall, 3 / 4);
	assert.equal(aggregate([{ matched: 0, cg_only: 0, gt_only: 0, vacuous: true }]).precision, null);
});

// ── fabrication-risk scan ─────────────────────────────────────────────────────
test('scanFabricationRisk — collision folder-local (all calls have local def) = 0 risk', () => {
	// parseArgs defined+called in each of two self-contained tools (folder-local edges).
	const defs = { parseArgs: ['toolA/cli.js', 'toolB/cli.js'] };
	const calls = { parseArgs: ['toolA/cli.js', 'toolB/cli.js'] };
	const r = scanFabricationRisk(defs, calls);
	assert.equal(r.collision_symbols, 1);
	assert.equal(r.risk_count, 0);
});

test('scanFabricationRisk — collision cross-folder (call without local def) = risk', () => {
	// helper defined in two apps; a third file calls it without a local def → cross-folder bind risk.
	const defs = { helper: ['app1/util.js', 'app2/util.js'] };
	const calls = { helper: ['app1/use.js'] };
	const r = scanFabricationRisk(defs, calls);
	assert.equal(r.risk_count, 1);
	assert.deepEqual(r.risks[0].call_without_local_def, ['app1/use.js']);
});

test('scanFabricationRisk — unique symbol (1 def) never a risk', () => {
	assert.equal(scanFabricationRisk({ foo: ['a.js'] }, { foo: ['b.js', 'c.js'] }).risk_count, 0);
});

// ── verdict ───────────────────────────────────────────────────────────────────
test('computeVerdict — PASS when precision >= threshold and no fabrication risk', () => {
	const v = computeVerdict({ precision: 1, recall: 1, measured: 5 }, { risk_count: 0, collision_symbols: 0 });
	assert.equal(v.verdict, 'PASS');
	assert.equal(v.authoritative_capable, true);
});

test('computeVerdict — WARN on low precision', () => {
	const v = computeVerdict({ precision: 0.5, recall: 1, measured: 5 }, { risk_count: 0 });
	assert.equal(v.verdict, 'WARN');
	assert.ok(v.reasons.some((r) => r.includes('precision')));
});

test('computeVerdict — WARN on low recall (codegraph missed proxy-visible calls)', () => {
	const v = computeVerdict({ precision: 1, recall: 0.6, measured: 5 }, { risk_count: 0 });
	assert.equal(v.verdict, 'WARN');
	assert.ok(v.reasons.some((r) => r.includes('recall')));
});

test('computeVerdict — WARN on fabrication risk even if precision high', () => {
	const v = computeVerdict({ precision: 1, recall: 1, measured: 5 }, { risk_count: 2 });
	assert.equal(v.verdict, 'WARN');
	assert.ok(v.reasons.some((r) => r.includes('fabrication-risk')));
});

test('computeVerdict — WARN when no measurable symbols', () => {
	assert.equal(computeVerdict({ precision: null, recall: null, measured: 0 }, { risk_count: 0 }).verdict, 'WARN');
});

// ── end-to-end (PURE — synthetic codegraph results + source) ──────────────────
test('calibrate E2E — clean single-app → PASS', () => {
	const fc = {
		'a.js': 'export function foo(){ return 1 }\n',
		'b.js': 'import { foo } from "./a"\nfunction bar(){ return foo() }\n',
	};
	const rep = calibrate({ cgCallersBySymbol: { foo: ['b.js'] }, fileContents: fc, symbols: ['foo'] });
	assert.equal(rep.verdict, 'PASS');
	assert.equal(rep.aggregate.precision, 1);
	assert.equal(rep.fabrication_scan.risk_count, 0);
	assert.equal(rep.reference_lens, true);
	assert.equal(rep.gate_injected, false);
});

test('calibrate E2E — collision folder-local (tools/-shape) → PASS', () => {
	const fc = {
		'toolA/cli.js': 'function parseArgs(x){ return x }\nfunction main(){ return parseArgs(1) }\n',
		'toolB/cli.js': 'function parseArgs(x){ return x }\nfunction main(){ return parseArgs(2) }\n',
	};
	// codegraph reports each file's own main as caller (folder-local edges).
	const rep = calibrate({
		cgCallersBySymbol: { parseArgs: ['toolA/cli.js', 'toolB/cli.js'] },
		fileContents: fc,
		symbols: ['parseArgs'],
	});
	assert.equal(rep.fabrication_scan.collision_symbols, 1);
	assert.equal(rep.fabrication_scan.risk_count, 0);
	assert.equal(rep.verdict, 'PASS');
});

test('calibrate E2E — collision cross-folder (ep-fe-mis-shape) → WARN', () => {
	const fc = {
		'app1/util.js': 'export function helper(){ return 1 }\n',
		'app2/util.js': 'export function helper(){ return 2 }\n',
		'app1/use.js': 'import { helper } from "./util"\nfunction x(){ return helper() }\n',
	};
	const rep = calibrate({ cgCallersBySymbol: { helper: ['app1/use.js'] }, fileContents: fc, symbols: ['helper'] });
	assert.equal(rep.fabrication_scan.risk_count, 1);
	assert.equal(rep.verdict, 'WARN');
});

test('calibrate E2E — phantom caller-file (codegraph reports a non-caller) → WARN', () => {
	const fc = {
		'a.js': 'export function foo(){ return 1 }\n',
		'b.js': 'function bar(){ return foo() }\n', // real call
		'c.js': 'function baz(){ return 1 }\n', // does NOT call foo
	};
	const rep = calibrate({ cgCallersBySymbol: { foo: ['b.js', 'c.js'] }, fileContents: fc, symbols: ['foo'] });
	assert.equal(rep.aggregate.precision, 0.5); // c.js = phantom
	assert.equal(rep.verdict, 'WARN');
});

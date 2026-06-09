import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { martinMetrics } from '../src/martin.js';

const TH = { unstable_instability: 0.7, hub_afferent: 3 };

test('Ca/Ce/I computed from distinct module edges', () => {
	const m = martinMetrics({
		nodes: ['A', 'B', 'C'],
		edges: [
			{ from: 'A', to: 'B' },
			{ from: 'B', to: 'C' },
		],
		thresholds: TH,
	});
	const byId = Object.fromEntries(m.map((x) => [x.module_id, x]));
	assert.equal(byId.A.afferent, 0);
	assert.equal(byId.A.efferent, 1);
	assert.equal(byId.A.instability, 1); // Ce/(Ca+Ce) = 1/1
	assert.equal(byId.B.instability, 0.5);
	assert.equal(byId.C.instability, 0); // 0/1
});

test('A/D abstain — null + not_computable (no-simulation)', () => {
	const m = martinMetrics({
		nodes: ['A'],
		edges: [],
		thresholds: TH,
	});
	assert.equal(m[0].abstractness, null);
	assert.equal(m[0].distance, null);
	assert.equal(m[0].abstractness_status, 'not_computable');
});

test('isolated module (Ca+Ce=0) → instability null, role isolated', () => {
	const m = martinMetrics({ nodes: ['X'], edges: [], thresholds: TH });
	assert.equal(m[0].instability, null);
	assert.equal(m[0].role, 'isolated');
});

test('sink role — Ca=0, Ce>0 (clean extract)', () => {
	const m = martinMetrics({
		nodes: ['A', 'B'],
		edges: [{ from: 'A', to: 'B' }],
		thresholds: TH,
	});
	const a = m.find((x) => x.module_id === 'A');
	assert.equal(a.role, 'sink');
});

test('hub role — Ca >= threshold takes priority', () => {
	const m = martinMetrics({
		nodes: ['HUB', 'A', 'B', 'C'],
		edges: [
			{ from: 'A', to: 'HUB' },
			{ from: 'B', to: 'HUB' },
			{ from: 'C', to: 'HUB' },
		],
		thresholds: TH,
	});
	const hub = m.find((x) => x.module_id === 'HUB');
	assert.equal(hub.afferent, 3);
	assert.equal(hub.role, 'hub');
});

test('duplicate edges counted once (no weight double-count)', () => {
	const m = martinMetrics({
		nodes: ['A', 'B'],
		edges: [
			{ from: 'A', to: 'B' },
			{ from: 'A', to: 'B' },
			{ from: 'A', to: 'B' },
		],
		thresholds: TH,
	});
	const b = m.find((x) => x.module_id === 'B');
	assert.equal(b.afferent, 1);
});

test('deterministic + sorted by module_id', () => {
	const input = {
		nodes: ['C', 'A', 'B'],
		edges: [{ from: 'A', to: 'B' }],
		thresholds: TH,
	};
	const r1 = martinMetrics(input);
	const r2 = martinMetrics(input);
	assert.deepEqual(r1, r2);
	assert.deepEqual(
		r1.map((x) => x.module_id),
		['A', 'B', 'C'],
	);
});

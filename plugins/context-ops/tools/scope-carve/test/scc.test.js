import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { tarjanScc } from '../src/scc.js';

test('DAG → all singletons, no cycle, topological condensation order', () => {
	const r = tarjanScc({
		nodes: ['A', 'B', 'C'],
		edges: [
			{ from: 'A', to: 'B' },
			{ from: 'B', to: 'C' },
		],
	});
	assert.equal(r.has_cycle, false);
	assert.equal(r.components.length, 3);
	assert.ok(r.components.every((c) => c.size === 1 && !c.is_atomic));
	// topo: A(0) before B(1) before C(2)
	const rankOf = Object.fromEntries(
		r.components.map((c) => [c.members[0], c.topo_rank]),
	);
	assert.ok(rankOf.A < rankOf.B && rankOf.B < rankOf.C);
});

test('2-node cycle → one atomic multi-node SCC', () => {
	const r = tarjanScc({
		nodes: ['A', 'B'],
		edges: [
			{ from: 'A', to: 'B' },
			{ from: 'B', to: 'A' },
		],
	});
	assert.equal(r.has_cycle, true);
	assert.equal(r.components.length, 1);
	assert.deepEqual(r.components[0].members, ['A', 'B']);
	assert.equal(r.components[0].is_atomic, true);
	assert.equal(r.components[0].kind, 'multi_node_cycle');
});

test('self-loop → singleton but has_cycle true, not atomic', () => {
	const r = tarjanScc({ nodes: ['A'], edges: [{ from: 'A', to: 'A' }] });
	assert.equal(r.has_cycle, true);
	assert.equal(r.components.length, 1);
	assert.equal(r.components[0].is_atomic, false);
	assert.equal(r.components[0].kind, 'singleton');
});

test('edges to unknown nodes are ignored', () => {
	const r = tarjanScc({
		nodes: ['A', 'B'],
		edges: [
			{ from: 'A', to: 'B' },
			{ from: 'A', to: 'GHOST' },
			{ from: 'NOPE', to: 'B' },
		],
	});
	assert.equal(r.components.length, 2);
	assert.equal(r.has_cycle, false);
});

test('deterministic — identical output across runs', () => {
	const input = {
		nodes: ['D', 'A', 'C', 'B'],
		edges: [
			{ from: 'A', to: 'B' },
			{ from: 'B', to: 'C' },
			{ from: 'C', to: 'A' },
			{ from: 'C', to: 'D' },
		],
	};
	const r1 = tarjanScc(input);
	const r2 = tarjanScc(input);
	assert.deepEqual(r1, r2);
	// A,B,C form a cycle (atomic), D singleton
	const atomic = r1.components.find((c) => c.is_atomic);
	assert.deepEqual(atomic.members, ['A', 'B', 'C']);
});

test('condensation_order references every component index exactly once', () => {
	const r = tarjanScc({
		nodes: ['A', 'B', 'C', 'D'],
		edges: [
			{ from: 'A', to: 'B' },
			{ from: 'B', to: 'C' },
			{ from: 'A', to: 'D' },
		],
	});
	const idxs = r.components.map((c) => c.index).sort((a, b) => a - b);
	assert.deepEqual([...r.condensation_order].sort((a, b) => a - b), idxs);
});

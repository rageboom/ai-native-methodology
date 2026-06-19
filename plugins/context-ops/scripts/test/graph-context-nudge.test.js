// Unit tests for graph-context-nudge.js pure logic (Gap A 자동주입 / plan-living-graph-autowire §3).
// Covers: matchable-node filter, true 1-hop neighborhood (incident-edge only / no transitive / no centrality),
// node-count cap + truncation, additionalContext shape, opt-out parsing.
// The I/O main() is direct-invocation guarded, so importing here runs no stdin read / no graph load.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
	isOptedOut,
	selectMatchableNodes,
	oneHopNeighbors,
	buildGraphContext,
	buildHookOutput,
} from '../graph-context-nudge.js';

const GRAPH = {
	nodes: [
		{ id: 'UC-1', artifact_subkind: 'UC', state: 'active', code_pointers: [{ path: 'src/uc.ts', line: 10, symbol: 'doUc' }] },
		{ id: 'BHV-1', artifact_subkind: 'BHV', state: 'active' },
		{ id: 'AC-1', artifact_subkind: 'AC', state: 'drift' },
		{ id: 'OLD-1', artifact_subkind: 'IMPL', state: 'deprecated' },
		{ id: 'FAR-1', artifact_subkind: 'TC', state: 'active' }, // 2-hop from UC-1 → must NOT appear
	],
	edges: [
		{ source: 'BHV-1', target: 'UC-1', edge_type: 'derived_from', confidence: 1 }, // UC-1 in
		{ source: 'UC-1', target: 'AC-1', edge_type: 'informs', confidence: 1 },        // UC-1 out
		{ source: 'AC-1', target: 'FAR-1', edge_type: 'tests', confidence: 1 },          // 2-hop → excluded
	],
};

test('isOptedOut — 0/false/no/off', () => {
	assert.equal(isOptedOut('0'), true);
	assert.equal(isOptedOut('false'), true);
	assert.equal(isOptedOut('OFF'), true);
	assert.equal(isOptedOut(undefined), false);
	assert.equal(isOptedOut('1'), false);
});

test('selectMatchableNodes — deprecated 제외', () => {
	const ns = selectMatchableNodes(GRAPH);
	assert.equal(ns.length, 4);
	assert.ok(!ns.some((n) => n.id === 'OLD-1'));
});

test('oneHopNeighbors — incident edge 만 (2-hop 제외) + 방향 + origin 제외', () => {
	const hood = oneHopNeighbors(GRAPH, ['UC-1']);
	assert.deepEqual(hood.origins.map((o) => o.id), ['UC-1']);
	const ids = hood.neighbors.map((n) => n.id).sort();
	assert.deepEqual(ids, ['AC-1', 'BHV-1']);
	assert.ok(!ids.includes('FAR-1'), '2-hop FAR-1 이 들어오면 transitive 누수');
	const bhv = hood.neighbors.find((n) => n.id === 'BHV-1');
	const ac = hood.neighbors.find((n) => n.id === 'AC-1');
	assert.equal(bhv.dir, 'in'); // BHV-1 → UC-1
	assert.equal(bhv.edge_type, 'derived_from');
	assert.equal(ac.dir, 'out'); // UC-1 → AC-1
	assert.equal(hood.truncated, 0);
});

test('oneHopNeighbors — 노드수 cap + truncated (무거움 회피)', () => {
	const big = {
		nodes: [{ id: 'O', artifact_subkind: 'UC', state: 'active' }],
		edges: [],
	};
	for (let i = 0; i < 20; i++) {
		big.nodes.push({ id: `N${i}`, artifact_subkind: 'AC', state: 'active' });
		big.edges.push({ source: 'O', target: `N${i}`, edge_type: 'informs', confidence: 1 });
	}
	const hood = oneHopNeighbors(big, ['O'], { cap: 8 });
	assert.equal(hood.neighbors.length, 8);
	assert.equal(hood.truncated, 12);
});

test('buildGraphContext — 포인터 지도 (id·코드앵커·이웃·disclaimer)', () => {
	const txt = buildGraphContext(oneHopNeighbors(GRAPH, ['UC-1']));
	assert.match(txt, /매칭 노드: UC-1/);
	assert.match(txt, /코드앵커: src\/uc\.ts:10 \(doUc\)/);
	assert.match(txt, /BHV-1/);
	assert.match(txt, /\[drift\]/); // AC-1 상태 플래그
	assert.match(txt, /reference-lens/);
	assert.match(txt, /navigate/);
});

test('buildHookOutput — UserPromptSubmit additionalContext shape', () => {
	const out = JSON.parse(buildHookOutput('hello'));
	assert.equal(out.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
	assert.equal(out.hookSpecificOutput.additionalContext, 'hello');
	// 차단 필드 부재 (never blocks)
	assert.equal(out.decision, undefined);
	assert.equal(out.hookSpecificOutput.permissionDecision, undefined);
});

test('graph-context-nudge 는 chain-driver gate 모듈을 import 하지 않는다 (C4 gate-inject ❌)', () => {
	const src = readFileSync(new URL('../graph-context-nudge.js', import.meta.url), 'utf8');
	assert.ok(!/import[^;]*gate-eval/.test(src), 'gate-eval import = gate-inject 위험');
	assert.ok(!/import[^;]*findings-aggregator/.test(src), 'findings-aggregator import = gate-inject 위험');
	assert.ok(!/import[^;]*chain-driver\/src/.test(src), 'chain-driver gate 엔진 디렉토리 import = 분리 위반');
});

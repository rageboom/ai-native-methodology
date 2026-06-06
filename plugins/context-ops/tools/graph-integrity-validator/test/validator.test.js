import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateGraph } from '../src/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
	JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8'));

test('clean graph — passed=true, cycle 0, orphan 0, unknown 0', () => {
	const result = validateGraph(fixture('clean.json'));
	assert.equal(result.passed, true);
	assert.equal(result.cycles.length, 0);
	assert.equal(result.orphans.length, 0);
	assert.equal(result.unknown_edges.length, 0);
	assert.equal(result.summary.node_count, 4);
	assert.equal(result.summary.edge_count, 3);
});

test('3-node cycle 감지 — 사이클 경로가 stack 순서대로 보고', () => {
	const result = validateGraph(fixture('cycle-3.json'));
	assert.equal(result.passed, false);
	assert.equal(result.cycles.length, 1);
	const cycle = result.cycles[0];
	assert.ok(cycle.length >= 3, '사이클 경로 길이 ≥ 3');
	assert.equal(
		cycle[0],
		cycle[cycle.length - 1],
		'back-edge 가 시작 노드로 닫힘',
	);
	assert.ok(cycle.includes('A') && cycle.includes('B') && cycle.includes('C'));
});

test('self-loop 감지 — single-node cycle', () => {
	const result = validateGraph(fixture('self-loop.json'));
	assert.equal(result.passed, false);
	assert.equal(result.cycles.length, 1);
	assert.deepEqual(result.cycles[0], ['A', 'A']);
});

test('orphan 감지 — active 만, propose/deprecated 는 제외', () => {
	const result = validateGraph(fixture('orphan.json'));
	assert.equal(result.passed, false);
	assert.equal(result.orphans.length, 1, 'active 1개만 orphan');
	assert.equal(result.orphans[0].id, 'ORPHAN-NODE');
});

test('unknown edge 감지 — target 이 nodes 에 없을 때', () => {
	const result = validateGraph(fixture('unknown-edge.json'));
	assert.equal(result.passed, false);
	assert.equal(result.unknown_edges.length, 1);
	assert.equal(result.unknown_edges[0].edge.target, 'GHOST');
	assert.match(result.unknown_edges[0].reason, /target/);
});

test('빈 그래프 — passed=true (vacuously)', () => {
	const result = validateGraph({ nodes: [], edges: [] });
	assert.equal(result.passed, true);
	assert.equal(result.summary.node_count, 0);
	assert.equal(result.summary.edge_count, 0);
});

test('입력 누락 방어 — nodes/edges 가 없거나 null 이어도 crash 안 함', () => {
	assert.equal(validateGraph({}).passed, true);
	assert.equal(validateGraph({ nodes: null, edges: null }).passed, true);
	assert.equal(validateGraph(null).passed, true);
});

test('orphan + cycle 동시 발생 — 둘 다 보고', () => {
	const graph = {
		nodes: [
			{
				id: 'X',
				artifact_kind: 'chain',
				artifact_subkind: 'UC',
				source_path: 'x.md',
				state: 'active',
			},
			{
				id: 'Y',
				artifact_kind: 'chain',
				artifact_subkind: 'BHV',
				source_path: 'y.md',
				state: 'active',
			},
			{
				id: 'ISO',
				artifact_kind: 'analysis',
				artifact_subkind: 'domain',
				source_path: 'i.md',
				state: 'drift',
			},
		],
		edges: [
			{
				source: 'X',
				target: 'Y',
				edge_type: 'derived_from',
				confidence: 'hard',
			},
			{ source: 'Y', target: 'X', edge_type: 'depends_on', confidence: 'hard' },
		],
	};
	const result = validateGraph(graph);
	assert.equal(result.passed, false);
	assert.equal(result.cycles.length, 1);
	assert.equal(result.orphans.length, 1);
	assert.equal(result.orphans[0].id, 'ISO');
});

test('orphan 검사는 drift state 노드도 포함 (active와 동일)', () => {
	const graph = {
		nodes: [
			{
				id: 'DRIFT-ALONE',
				artifact_kind: 'analysis',
				artifact_subkind: 'domain',
				source_path: 'd.md',
				state: 'drift',
			},
		],
		edges: [],
	};
	const result = validateGraph(graph);
	assert.equal(result.orphans.length, 1, 'drift 도 orphan 검사 대상');
});

test('implements 엣지: target Tier-2 leaf (source code 경로) 는 unknown 면제', () => {
	// operation.md 결정 1 — Tier-2 leaf 는 그래프 폭증 회피 목적으로 nodes 에 추가 안 함.
	//   implements 엣지의 target 이 nodes 부재여도 정상.
	const graph = {
		nodes: [
			{
				id: 'IMPL-USER-001',
				artifact_kind: 'chain',
				artifact_subkind: 'IMPL',
				source_path: 'i.md',
				state: 'active',
			},
			{
				id: 'TC-USER-001',
				artifact_kind: 'chain',
				artifact_subkind: 'TC',
				source_path: 't.md',
				state: 'active',
			},
		],
		edges: [
			{
				source: 'TC-USER-001',
				target: 'IMPL-USER-001',
				edge_type: 'tests',
				confidence: 'hard',
			},
			{
				source: 'IMPL-USER-001',
				target: 'src/auth/signup.kt',
				edge_type: 'implements',
				confidence: 'hard',
			},
		],
	};
	const result = validateGraph(graph);
	assert.equal(
		result.passed,
		true,
		'implements → Tier-2 leaf 는 unknown 으로 잡지 말 것',
	);
	assert.equal(result.unknown_edges.length, 0);
});

test('implements 의 source 는 여전히 Tier-1 노드여야 함 — source 부재면 unknown', () => {
	const graph = {
		nodes: [],
		edges: [
			{
				source: 'PHANTOM-IMPL',
				target: 'src/auth/signup.kt',
				edge_type: 'implements',
				confidence: 'hard',
			},
		],
	};
	const result = validateGraph(graph);
	assert.equal(result.passed, false);
	assert.equal(result.unknown_edges.length, 1);
	assert.match(result.unknown_edges[0].reason, /source/);
});

test('non-implements 엣지는 여전히 target 부재 시 unknown — exemption 은 implements 에만', () => {
	const graph = {
		nodes: [
			{
				id: 'BHV-1',
				artifact_kind: 'chain',
				artifact_subkind: 'BHV',
				source_path: 'b.md',
				state: 'active',
			},
		],
		edges: [
			{
				source: 'BHV-1',
				target: 'ghost-target',
				edge_type: 'derived_from',
				confidence: 'hard',
			},
		],
	};
	const result = validateGraph(graph);
	assert.equal(
		result.unknown_edges.length,
		1,
		'derived_from 은 exemption 없음',
	);
});

test('id 가 누락된 node 는 무시하고 crash 안 함', () => {
	const graph = {
		nodes: [
			{ artifact_kind: 'chain', source_path: 'no-id.md', state: 'active' },
			{
				id: 'A',
				artifact_kind: 'chain',
				artifact_subkind: 'UC',
				source_path: 'a.md',
				state: 'active',
			},
		],
		edges: [],
	};
	const result = validateGraph(graph);
	assert.equal(result.orphans.length, 1, 'id 있는 A 만 orphan 검사 대상');
});

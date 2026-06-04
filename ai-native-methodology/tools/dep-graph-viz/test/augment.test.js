import { test } from 'node:test';
import assert from 'node:assert/strict';
import { augmentGraph } from '../src/augment.js';

function fixture() {
	return {
		nodes: [
			{ id: 'TASK-X-001', artifact_kind: 'chain', artifact_subkind: 'TASK', state: 'active', scope_id: 's1' },
			{ id: 'TC-X-001', artifact_kind: 'chain', artifact_subkind: 'TC', state: 'active', scope_id: 's1',
			  code_pointers: [{ path: 'target/src/x.test.ts', anchor_type: 'strict_path' }] },
			{ id: 'IMPL-X-001', artifact_kind: 'chain', artifact_subkind: 'IMPL', state: 'active', scope_id: 's1',
			  code_pointers: [{ path: 'target/src/x.ts', anchor_type: 'strict_path' }] },
		],
		edges: [
			{ source: 'TASK-X-001', target: 'TC-X-001', edge_type: 'derived_from', confidence: 'hard' },
			{ source: 'TC-X-001', target: 'IMPL-X-001', edge_type: 'tests', confidence: 'hard' },
			// IMPL → 코드 (dangling target) + TASK → 계약 (dangling)
			{ source: 'IMPL-X-001', target: 'target/src/x.ts', edge_type: 'implements', confidence: 'hard' },
			{ source: 'TASK-X-001', target: 'contract:openapi:POST /api/x', edge_type: 'conforms_to', confidence: 'hard' },
		],
	};
}

test('원본 graph 를 변형하지 않는다 (SSOT 불변)', () => {
	const orig = fixture();
	const snapshot = JSON.stringify(orig);
	augmentGraph(orig);
	assert.equal(JSON.stringify(orig), snapshot, '입력 객체가 변형되면 안 됨');
});

test('dangling 코드 target 을 code leaf 로 합성', () => {
	const g = augmentGraph(fixture());
	const code = g.nodes.find((n) => n.id === 'target/src/x.ts');
	assert.ok(code, 'code leaf 노드 존재');
	assert.equal(code.artifact_kind, 'code');
	assert.equal(code.synthetic, true);
	assert.equal(code.state, 'active', 'BFS traversable');
	assert.equal(code.title, 'x.ts', '파일명 타이틀');
	assert.equal(code.source_path, 'target/src/x.ts');
});

test('dangling 계약 target 을 contract leaf 로 합성', () => {
	const g = augmentGraph(fixture());
	const c = g.nodes.find((n) => n.id === 'contract:openapi:POST /api/x');
	assert.ok(c, 'contract leaf 노드 존재');
	assert.equal(c.artifact_kind, 'contract');
	assert.equal(c.synthetic, true);
	assert.equal(c.title, 'openapi: POST /api/x');
});

test('code_pointer 에 대응 엣지 없으면 synthetic implements 엣지 생성 (TC→테스트코드)', () => {
	const g = augmentGraph(fixture());
	const leaf = g.nodes.find((n) => n.id === 'target/src/x.test.ts');
	assert.ok(leaf, 'TC code_pointer leaf 합성');
	const e = g.edges.find((x) => x.source === 'TC-X-001' && x.target === 'target/src/x.test.ts');
	assert.ok(e, 'TC→테스트코드 합성 엣지');
	assert.equal(e.edge_type, 'implements');
	assert.equal(e.synthetic, true);
});

test('이미 존재하는 implements 엣지는 중복 생성하지 않는다 (dedup)', () => {
	const g = augmentGraph(fixture());
	const edges = g.edges.filter((x) => x.source === 'IMPL-X-001' && x.target === 'target/src/x.ts');
	assert.equal(edges.length, 1, 'IMPL→코드 엣지는 1개여야 함');
	assert.equal(edges[0].synthetic, undefined, '원본 엣지 보존 (synthetic 마커 없음)');
});

test('합성 leaf 는 owner 의 scope_id 를 상속', () => {
	const g = augmentGraph(fixture());
	const leaf = g.nodes.find((n) => n.id === 'target/src/x.test.ts');
	assert.equal(leaf.scope_id, 's1');
});

test('nodes/edges 부재 시에도 안전', () => {
	assert.doesNotThrow(() => augmentGraph({}));
	const g = augmentGraph({});
	assert.deepEqual(g.nodes, []);
	assert.deepEqual(g.edges, []);
});

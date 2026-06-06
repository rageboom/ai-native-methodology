// diff-view.test.js
// operation.md 결정 6 + 결정 8 (P4 Set diff) — node/edge set diff + markdown.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { diffGraphs, renderDiffMarkdown } from '../src/renderers/diff-view.js';

function node(id, opts = {}) {
	return {
		id,
		artifact_kind: opts.kind ?? 'chain',
		artifact_subkind: opts.subkind ?? 'BHV',
		source_path: opts.source_path ?? `${id}.md`,
		state: opts.state ?? 'active',
		...(opts.commit_hash ? { commit_hash: opts.commit_hash } : {}),
		...(opts.code_pointers ? { code_pointers: opts.code_pointers } : {}),
	};
}
function edge(source, target, edge_type = 'derived_from') {
	const HARD = new Set(['derived_from', 'implements', 'tests', 'depends_on']);
	return {
		source,
		target,
		edge_type,
		confidence: HARD.has(edge_type) ? 'hard' : 'soft',
	};
}

describe('diffGraphs — node diff', () => {
	it('added node 감지', () => {
		const before = { nodes: [node('A')], edges: [] };
		const after = { nodes: [node('A'), node('B')], edges: [] };
		const d = diffGraphs(before, after);
		assert.equal(d.summary.nodes_added, 1);
		assert.equal(d.nodes.added[0].id, 'B');
	});

	it('removed node 감지', () => {
		const before = { nodes: [node('A'), node('B')], edges: [] };
		const after = { nodes: [node('A')], edges: [] };
		const d = diffGraphs(before, after);
		assert.equal(d.summary.nodes_removed, 1);
		assert.equal(d.nodes.removed[0].id, 'B');
	});

	it('state 변경 감지 (active → drift)', () => {
		const before = { nodes: [node('A', { state: 'active' })], edges: [] };
		const after = { nodes: [node('A', { state: 'drift' })], edges: [] };
		const d = diffGraphs(before, after);
		assert.equal(d.summary.nodes_changed, 1);
		const ch = d.nodes.changed[0].changes.find((c) => c.field === 'state');
		assert.equal(ch.from, 'active');
		assert.equal(ch.to, 'drift');
	});

	it('commit_hash 변경 감지', () => {
		const before = { nodes: [node('A', { commit_hash: 'aaa' })], edges: [] };
		const after = { nodes: [node('A', { commit_hash: 'bbb' })], edges: [] };
		const d = diffGraphs(before, after);
		const ch = d.nodes.changed[0].changes.find(
			(c) => c.field === 'commit_hash',
		);
		assert.equal(ch.from, 'aaa');
		assert.equal(ch.to, 'bbb');
	});

	it('code_pointers 수 변경 감지', () => {
		const before = {
			nodes: [
				node('A', {
					code_pointers: [{ path: 'x', anchor_type: 'strict_path' }],
				}),
			],
			edges: [],
		};
		const after = {
			nodes: [
				node('A', {
					code_pointers: [
						{ path: 'x', anchor_type: 'strict_path' },
						{ path: 'y', anchor_type: 'glob' },
					],
				}),
			],
			edges: [],
		};
		const d = diffGraphs(before, after);
		const ch = d.nodes.changed[0].changes.find(
			(c) => c.field === 'code_pointers_count',
		);
		assert.equal(ch.from, 1);
		assert.equal(ch.to, 2);
	});

	it('변경 없으면 changed 비어있음', () => {
		const g = { nodes: [node('A')], edges: [] };
		const d = diffGraphs(g, g);
		assert.equal(d.summary.nodes_changed, 0);
	});
});

describe('diffGraphs — edge diff', () => {
	it('added edge 감지', () => {
		const before = { nodes: [node('A'), node('B')], edges: [] };
		const after = { nodes: [node('A'), node('B')], edges: [edge('A', 'B')] };
		const d = diffGraphs(before, after);
		assert.equal(d.summary.edges_added, 1);
	});

	it('removed edge 감지', () => {
		const before = { nodes: [node('A'), node('B')], edges: [edge('A', 'B')] };
		const after = { nodes: [node('A'), node('B')], edges: [] };
		const d = diffGraphs(before, after);
		assert.equal(d.summary.edges_removed, 1);
	});

	it('edge_type 변경 = remove + add (key 에 edge_type 포함)', () => {
		const before = {
			nodes: [node('A'), node('B')],
			edges: [edge('A', 'B', 'derived_from')],
		};
		const after = {
			nodes: [node('A'), node('B')],
			edges: [edge('A', 'B', 'cross_reference')],
		};
		const d = diffGraphs(before, after);
		assert.equal(d.summary.edges_added, 1);
		assert.equal(d.summary.edges_removed, 1);
	});
});

describe('diffGraphs — 결정성', () => {
	it('동일 입력 → 동일 출력', () => {
		const before = { nodes: [node('Z'), node('A')], edges: [] };
		const after = { nodes: [node('A'), node('B'), node('Z')], edges: [] };
		const d1 = diffGraphs(before, after);
		const d2 = diffGraphs(before, after);
		assert.deepEqual(d1, d2);
	});

	it('added 노드는 id 정렬', () => {
		const before = { nodes: [], edges: [] };
		const after = { nodes: [node('Z'), node('A'), node('M')], edges: [] };
		const d = diffGraphs(before, after);
		assert.deepEqual(
			d.nodes.added.map((n) => n.id),
			['A', 'M', 'Z'],
		);
	});
});

describe('renderDiffMarkdown', () => {
	it('변경 없음 → no drift 메시지', () => {
		const g = { nodes: [node('A')], edges: [] };
		const md = renderDiffMarkdown(diffGraphs(g, g));
		assert.match(md, /no drift/);
	});

	it('added/removed/changed 섹션 렌더', () => {
		const before = { nodes: [node('A'), node('OLD')], edges: [] };
		const after = {
			nodes: [node('A', { state: 'drift' }), node('NEW')],
			edges: [edge('A', 'NEW')],
		};
		const md = renderDiffMarkdown(diffGraphs(before, after), {
			before_commit: 'aaa',
			after_commit: 'bbb',
		});
		assert.match(md, /Nodes added/);
		assert.match(md, /NEW/);
		assert.match(md, /Nodes removed/);
		assert.match(md, /OLD/);
		assert.match(md, /Nodes changed/);
		assert.match(md, /state: active → drift/);
		assert.match(md, /Edges added/);
		assert.match(md, /aaa → bbb/);
	});

	it('summary 라인 포함', () => {
		const before = { nodes: [node('A')], edges: [] };
		const after = { nodes: [node('A'), node('B')], edges: [] };
		const md = renderDiffMarkdown(diffGraphs(before, after));
		assert.match(md, /\+1.*-0.*~0/);
	});
});

describe('방어 케이스', () => {
	it('빈 graph 쌍', () => {
		const d = diffGraphs({ nodes: [], edges: [] }, { nodes: [], edges: [] });
		assert.equal(d.summary.nodes_added, 0);
	});

	it('null 입력 방어', () => {
		assert.doesNotThrow(() => diffGraphs(null, null));
		assert.doesNotThrow(() => diffGraphs({}, {}));
	});
});

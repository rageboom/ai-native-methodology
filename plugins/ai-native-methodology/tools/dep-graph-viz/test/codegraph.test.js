import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { augmentGraph } from '../src/augment.js';
import { attachSymbols, readCodegraph, findCodegraphDb } from '../src/codegraph.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const POC05_DB = join(REPO, 'examples/poc-05-sample-user-register/target/.codegraph/codegraph.db');
const POC05_GRAPH = join(REPO, 'examples/poc-05-sample-user-register/.aimd/output/artifact-graph.json');

function augmentedFixture() {
	return augmentGraph({
		nodes: [
			{ id: 'IMPL-X-001', artifact_kind: 'chain', artifact_subkind: 'IMPL', state: 'active', scope_id: 's1',
			  code_pointers: [{ path: 'target/src/x.ts' }] },
		],
		edges: [{ source: 'IMPL-X-001', target: 'target/src/x.ts', edge_type: 'implements', confidence: 'hard' }],
	});
}

test('attachSymbols — file_path suffix 매칭으로 심볼 부착 + contains 엣지', () => {
	const g = augmentedFixture();
	attachSymbols(g, {
		symbols: [
			{ id: 'n1', kind: 'method', name: 'register', file_path: 'src/x.ts', signature: '(e,p)', start_line: 10 },
			{ id: 'n2', kind: 'method', name: 'helper', file_path: 'src/x.ts', start_line: 20 },
			{ id: 'n3', kind: 'function', name: 'orphan', file_path: 'src/other.ts', start_line: 1 },
		],
		calls: [{ source: 'n1', target: 'n2' }, { source: 'n1', target: 'n999' }],
	});
	assert.equal(g.symbol_count, 2, '매칭되는 파일의 심볼만 (n3 제외)');
	const s1 = g.nodes.find((n) => n.id === 'sym:n1');
	assert.ok(s1 && s1.artifact_kind === 'symbol' && s1.synthetic === true);
	assert.equal(s1.signature, '(e,p)');
	assert.equal(s1.scope_id, 's1', 'leaf scope 상속');
	assert.ok(g.edges.find((e) => e.source === 'target/src/x.ts' && e.target === 'sym:n1' && e.edge_type === 'contains'));
});

test('attachSymbols — 양쪽 심볼이 살아있는 calls 만 엣지화', () => {
	const g = augmentedFixture();
	attachSymbols(g, {
		symbols: [
			{ id: 'n1', kind: 'method', name: 'a', file_path: 'src/x.ts', start_line: 1 },
			{ id: 'n2', kind: 'method', name: 'b', file_path: 'src/x.ts', start_line: 2 },
		],
		calls: [{ source: 'n1', target: 'n2' }, { source: 'n1', target: 'n999' }],
	});
	const calls = g.edges.filter((e) => e.edge_type === 'calls');
	assert.equal(calls.length, 1, 'n999(미보존) 호출은 제외');
	assert.equal(calls[0].source, 'sym:n1');
	assert.equal(calls[0].target, 'sym:n2');
});

test('code leaf 없으면 no-op', () => {
	const g = augmentGraph({ nodes: [{ id: 'UC-1', artifact_kind: 'chain', artifact_subkind: 'UC', state: 'active' }], edges: [] });
	attachSymbols(g, { symbols: [{ id: 'n1', kind: 'method', name: 'a', file_path: 'src/x.ts' }], calls: [] });
	assert.equal(g.symbol_count, 0);
});

test('readCodegraph — poc-05 codegraph.db 실측 (있을 때만)', { skip: !existsSync(POC05_DB) }, () => {
	const cg = readCodegraph(POC05_DB);
	assert.ok(cg.symbols.length > 0, '함수/메서드 심볼 존재');
	assert.ok(Array.isArray(cg.calls), 'calls 배열');
	assert.ok(cg.symbols.every((s) => s.kind === 'function' || s.kind === 'method'));
});

test('findCodegraphDb — poc-05 자동 탐색 (있을 때만)', { skip: !existsSync(POC05_DB) }, () => {
	assert.equal(findCodegraphDb(POC05_GRAPH), POC05_DB);
});

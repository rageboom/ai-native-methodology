import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHtml } from '../src/emit.js';
import { augmentGraph } from '../src/augment.js';

const graph = augmentGraph({
	nodes: [
		{ id: 'UC-ZED-001', artifact_kind: 'chain', artifact_subkind: 'UC', state: 'active', title: '제드 등록' },
		{ id: 'IMPL-ZED-001', artifact_kind: 'chain', artifact_subkind: 'IMPL', state: 'active',
		  code_pointers: [{ path: 'target/src/zed.ts' }] },
	],
	edges: [{ source: 'UC-ZED-001', target: 'IMPL-ZED-001', edge_type: 'derived_from', confidence: 'hard' }],
});
const fresh = { stale: false, synthesized_at: '2026-06-04T00:00:00.000Z', stale_sources: [] };

test('placeholder 가 모두 치환된다', () => {
	const html = buildHtml(graph, fresh, { graphName: 'unit' });
	for (const ph of ['__STYLE__', '__D3__', '__ALGO__', '__APP_JS__', '__GRAPH_JSON__', '__FRESHNESS__', '__GRAPH_NAME__']) {
		assert.ok(!html.includes(ph), `placeholder 잔존: ${ph}`);
	}
});

test('재사용 결정론 알고리즘이 인라인된다', () => {
	const html = buildHtml(graph, fresh, {});
	assert.ok(html.includes('function analyzeImpact'), 'impact-analyzer 인라인');
	assert.ok(html.includes('function topKImpactRoot') || html.includes('topKImpactRoot'), 'centrality 인라인');
	assert.ok(html.includes('function computeLayout'), 'layout 인라인');
	assert.ok(html.includes('function tidyTreeRows'), 'explore 인라인 (드릴다운/색상)');
	assert.ok(html.includes('function colorOf'), 'explore colorOf 인라인');
});

test('그래프 데이터 + 합성 노드가 embed 된다', () => {
	const html = buildHtml(graph, fresh, {});
	assert.ok(html.includes('UC-ZED-001'), '실 노드 id embed');
	assert.ok(html.includes('target/src/zed.ts'), '합성 code leaf embed');
	assert.ok(html.includes('"synthetic":true'), 'synthetic 마커 embed');
});

test('D3 UMD + freshness 가 들어간다', () => {
	const html = buildHtml(graph, fresh, {});
	assert.ok(html.includes('d3js.org'), 'D3 벤더 인라인');
	assert.ok(html.includes('2026-06-04T00:00:00.000Z'), 'freshness synthesized_at embed');
});

test('단일 self-contained HTML — 외부 src 참조 없음', () => {
	const html = buildHtml(graph, fresh, {});
	assert.ok(!/<script[^>]+src=/i.test(html), '외부 script src 참조 없어야 함 (오프라인)');
	assert.ok(!/<link[^>]+href=/i.test(html), '외부 stylesheet 참조 없어야 함');
});

// app.js — dep-graph 인터랙티브 시각화 프론트엔드 (D3 v7).
//   실행 컨텍스트: emit.js 가 이 파일을 impact-analyzer/centrality/layout 소스 뒤에 같은 module <script> 로 인라인.
//   가용 심볼: d3(전역 UMD), GRAPH(보강 그래프), FRESHNESS, analyzeImpact, topKImpactRoot, computeLayout, COLUMN_LABELS.
//   신뢰 모델: reference-lens / display-only. 합성 leaf 노드(synthetic) 포함은 표시 전용 — gate inject ❌.

const KIND_COLOR = {
	chain: '#2563eb',
	plan: '#7c3aed',
	analysis: '#059669',
	aspect: '#d97706',
	code: '#475569',
	contract: '#db2777',
};
const GRADE_COLOR = { MUST: '#e02424', SHOULD: '#f59e0b', FYI: '#9ca3af' };
const LANE_GAP = 28; // 밴드 사이 여백
const ROW_H = 34;
const COL_W = 150;
const MARGIN_X = 80;
const MARGIN_TOP = 34; // column 헤더 자리

const nodes = (GRAPH.nodes || []).map((n) => ({ ...n }));
const byId = new Map(nodes.map((n) => [n.id, n]));
const edges = (GRAPH.edges || [])
	.filter((e) => byId.has(e.source) && byId.has(e.target))
	.map((e) => ({ ...e }));

// === 레이아웃 배치 (layered) ===
const meta = computeLayout(nodes); // id → {column, lane, row}
// 실제 등장 lane 만 순서대로 밴드 할당
const LANE_ORDER_LOCAL = ['plan', 'main', 'analysis', 'aspect'];
const laneRows = {};
for (const m of meta.values()) {
	laneRows[m.lane] = Math.max(laneRows[m.lane] ?? 0, m.row + 1);
}
const laneTop = {};
let acc = MARGIN_TOP;
for (const lane of LANE_ORDER_LOCAL) {
	if (!laneRows[lane]) continue;
	laneTop[lane] = acc;
	acc += laneRows[lane] * ROW_H + LANE_GAP;
}
const layoutHeight = acc + 20;
const layoutWidth = MARGIN_X + COLUMN_LABELS.length * COL_W;

function layeredXY(n) {
	const m = meta.get(n.id) || { column: 0, lane: 'main', row: 0 };
	return {
		x: MARGIN_X + m.column * COL_W,
		y: (laneTop[m.lane] ?? MARGIN_TOP) + m.row * ROW_H + ROW_H / 2,
	};
}
// 초기 위치 = layered
for (const n of nodes) {
	const p = layeredXY(n);
	n.lx = p.x;
	n.ly = p.y;
	n.x = p.x;
	n.y = p.y;
}

// === SVG 골격 ===
const container = d3.select('#graph');
const svg = container.append('svg');
const root = svg.append('g'); // zoom 대상

// 화살촉
svg
	.append('defs')
	.append('marker')
	.attr('id', 'arrow')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 18)
	.attr('refY', 0)
	.attr('markerWidth', 6)
	.attr('markerHeight', 6)
	.attr('orient', 'auto')
	.append('path')
	.attr('d', 'M0,-4L8,0L0,4')
	.attr('fill', '#aab1bd');

const colLayer = root.append('g').attr('class', 'columns');
const edgeLayer = root.append('g').attr('class', 'edges');
const nodeLayer = root.append('g').attr('class', 'nodes');

// column 헤더 + 세로 가이드
colLayer
	.selectAll('text.col-header')
	.data(COLUMN_LABELS)
	.join('text')
	.attr('class', 'col-header')
	.attr('x', (_, i) => MARGIN_X + i * COL_W - 8)
	.attr('y', 18)
	.text((d) => d);

const edgeSel = edgeLayer
	.selectAll('line')
	.data(edges)
	.join('line')
	.attr('class', (e) => 'edge' + (e.confidence === 'soft' ? ' soft' : ''))
	.attr('marker-end', 'url(#arrow)');

const nodeSel = nodeLayer
	.selectAll('g.node')
	.data(nodes, (d) => d.id)
	.join('g')
	.attr('class', (d) => nodeClass(d))
	.on('click', (_, d) => selectOrigin(d.id));

nodeSel
	.append('circle')
	.attr('r', (d) => (d.synthetic ? 5 : 7))
	.attr('fill', (d) => KIND_COLOR[d.artifact_kind] || '#6b7280');

nodeSel
	.append('text')
	.attr('dx', 11)
	.attr('dy', 4)
	.text((d) => labelOf(d));

function nodeClass(d) {
	return [
		'node',
		d.synthetic ? 'synthetic' : '',
		'state-' + (d.state || 'active'),
	]
		.filter(Boolean)
		.join(' ');
}
function labelOf(d) {
	const t = d.title || d.id;
	return t.length > 26 ? t.slice(0, 25) + '…' : t;
}

function renderPositions() {
	nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`);
	edgeSel
		.attr('x1', (e) => byId.get(e.source).x)
		.attr('y1', (e) => byId.get(e.source).y)
		.attr('x2', (e) => byId.get(e.target).x)
		.attr('y2', (e) => byId.get(e.target).y);
}
renderPositions();

// === zoom / pan + 초기 fit ===
const zoom = d3
	.zoom()
	.scaleExtent([0.15, 4])
	.on('zoom', (ev) => root.attr('transform', ev.transform));
svg.call(zoom);

function fitView() {
	const w = container.node().clientWidth || 800;
	const h = container.node().clientHeight || 600;
	const scale = Math.min(1, (w - 40) / layoutWidth, (h - 40) / layoutHeight);
	const tx = (w - layoutWidth * scale) / 2;
	const ty = 20;
	svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}
fitView();
window.addEventListener('resize', fitView);

function centerOn(id) {
	const n = byId.get(id);
	if (!n) return;
	const w = container.node().clientWidth || 800;
	const h = container.node().clientHeight || 600;
	const scale = 1;
	svg
		.transition()
		.duration(450)
		.call(
			zoom.transform,
			d3.zoomIdentity.translate(w / 2 - n.x * scale, h / 2 - n.y * scale).scale(scale),
		);
}

// === force 토글 ===
let sim = null;
let forceOn = false;
function toggleForce() {
	forceOn = !forceOn;
	d3.select('#btn-force').classed('active', forceOn);
	if (forceOn) {
		sim = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3
					.forceLink(edges)
					.id((d) => d.id)
					.distance(70)
					.strength(0.4),
			)
			.force('charge', d3.forceManyBody().strength(-220))
			.force('collide', d3.forceCollide(22))
			.force('x', d3.forceX((d) => d.lx).strength(0.06))
			.force('y', d3.forceY((d) => d.ly).strength(0.06))
			.on('tick', renderPositions);
		nodeSel.call(
			d3
				.drag()
				.on('start', (ev, d) => {
					if (!ev.active) sim.alphaTarget(0.3).restart();
					d.fx = d.x;
					d.fy = d.y;
				})
				.on('drag', (ev, d) => {
					d.fx = ev.x;
					d.fy = ev.y;
				})
				.on('end', (ev, d) => {
					if (!ev.active) sim.alphaTarget(0);
					d.fx = null;
					d.fy = null;
				}),
		);
	} else {
		if (sim) sim.stop();
		nodeSel.on('.drag', null);
		nodes.forEach((n) => {
			n.x = n.lx;
			n.y = n.ly;
			n.fx = null;
			n.fy = null;
		});
		nodeSel
			.transition()
			.duration(450)
			.attr('transform', (d) => `translate(${d.x},${d.y})`)
			.on('end', renderPositions);
		edgeSel
			.transition()
			.duration(450)
			.attr('x1', (e) => byId.get(e.source).lx)
			.attr('y1', (e) => byId.get(e.source).ly)
			.attr('x2', (e) => byId.get(e.target).lx)
			.attr('y2', (e) => byId.get(e.target).ly);
	}
}

// === 영향도 (킬러 기능) ===
let originId = null;
function selectOrigin(id) {
	originId = id;
	let res;
	try {
		res = analyzeImpact(GRAPH, id, { includeForward: true, includeBackward: true });
	} catch (err) {
		clearImpact();
		showPanel(byId.get(id), null);
		return;
	}
	const gradeById = new Map();
	const dirById = new Map();
	for (const m of res.merged) {
		gradeById.set(m.id, m.grade);
		dirById.set(m.id, m.direction);
	}
	const inImpact = (nid) => nid === id || gradeById.has(nid);

	nodeSel
		.classed('origin', (d) => d.id === id)
		.classed('dim', (d) => !inImpact(d.id))
		.select('circle')
		.attr('fill', (d) =>
			d.id === id
				? KIND_COLOR[d.artifact_kind] || '#6b7280'
				: gradeById.has(d.id)
					? GRADE_COLOR[gradeById.get(d.id)]
					: KIND_COLOR[d.artifact_kind] || '#6b7280',
		);

	edgeSel
		.classed('dim', (e) => !(inImpact(e.source) && inImpact(e.target)))
		.classed('impact', (e) => inImpact(e.source) && inImpact(e.target));

	showPanel(byId.get(id), { res, gradeById, dirById });
}
function clearImpact() {
	originId = null;
	nodeSel.classed('origin', false).classed('dim', false);
	nodeSel.select('circle').attr('fill', (d) => KIND_COLOR[d.artifact_kind] || '#6b7280');
	edgeSel.classed('dim', false).classed('impact', false);
}

// === 사이드 패널 ===
const RANK = { MUST: 3, SHOULD: 2, FYI: 1 };
function esc(s) {
	return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
}
function showPanel(node, impact) {
	const side = document.getElementById('side');
	if (!node) {
		side.innerHTML = '<div class="empty">노드를 클릭하면 상세 + 영향도가 표시됩니다.</div>';
		return;
	}
	const color = KIND_COLOR[node.artifact_kind] || '#6b7280';
	let html = '';
	html += `<h2>${esc(node.id)}</h2>`;
	html += `<span class="kindtag" style="background:${color}">${esc(node.artifact_kind)}${node.artifact_subkind && node.artifact_subkind !== node.artifact_kind ? ' · ' + esc(node.artifact_subkind) : ''}</span>`;
	if (node.synthetic) html += `<span class="kindtag" style="background:#9ca3af">synthetic (표시 전용)</span>`;
	html += '<dl>';
	if (node.title) html += `<dt>title</dt><dd>${esc(node.title)}</dd>`;
	html += `<dt>state</dt><dd>${esc(node.state || 'active')}</dd>`;
	if (node.drift_reason) html += `<dt>drift reason</dt><dd>${esc(node.drift_reason)}</dd>`;
	if (node.source_path) html += `<dt>source</dt><dd>${esc(node.source_path)}</dd>`;
	if (node.scope_id) html += `<dt>scope</dt><dd>${esc(node.scope_id)}</dd>`;
	if (node.commit_hash) html += `<dt>commit</dt><dd>${esc(String(node.commit_hash).slice(0, 12))}</dd>`;
	if (Array.isArray(node.code_pointers) && node.code_pointers.length) {
		html += `<dt>code pointers</dt><dd>${node.code_pointers.map((p) => esc(p.path)).join('<br>')}</dd>`;
	}
	html += '</dl>';

	if (impact && impact.res) {
		const list = impact.res.merged
			.slice()
			.sort((a, b) => (RANK[b.grade] || 0) - (RANK[a.grade] || 0) || a.id.localeCompare(b.id));
		const c = impact.res.stats.by_grade_count;
		html += `<div class="impact-h">영향받는 노드 (${impact.res.stats.merged_count}) — MUST ${c.MUST} · SHOULD ${c.SHOULD} · FYI ${c.FYI}</div>`;
		html += '<ul class="impact">';
		for (const m of list) {
			const dir = m.direction === 'backward' ? '상류' : m.direction === 'forward' ? '하류' : '양방향';
			html += `<li data-id="${esc(m.id)}"><span class="grade" style="background:${GRADE_COLOR[m.grade]}">${m.grade}</span><span class="gid">${esc(m.id)}</span><span class="dir">${dir}</span></li>`;
		}
		html += '</ul>';
		html += `<div class="impact-h" style="font-weight:400;color:#9ca3af;font-size:11px;margin-top:10px">상류=이 변경의 출처 / 하류=이 변경이 영향 주는 곳. 등급: MUST sync 강제 · SHOULD 검토 · FYI 알림.</div>`;
	}
	side.innerHTML = html;
	side.querySelectorAll('li[data-id]').forEach((li) => {
		li.addEventListener('click', () => centerOn(li.getAttribute('data-id')));
	});
}

// === 검색 ===
function runSearch(q) {
	q = (q || '').trim().toLowerCase();
	if (!q) {
		if (!originId) nodeSel.classed('dim', false);
		return;
	}
	const match = (d) =>
		d.id.toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q);
	nodeSel.classed('dim', (d) => !match(d));
	const first = nodes.find(match);
	return first;
}

// === 필터 (state) ===
function applyStateFilter() {
	const hidden = new Set();
	document.querySelectorAll('#state-filters input').forEach((cb) => {
		if (!cb.checked) hidden.add(cb.value);
	});
	nodeSel.style('display', (d) => (hidden.has(d.state || 'active') ? 'none' : null));
	edgeSel.style('display', (e) =>
		hidden.has(byId.get(e.source).state || 'active') || hidden.has(byId.get(e.target).state || 'active')
			? 'none'
			: null,
	);
}

// === 컨트롤 배선 ===
document.getElementById('btn-force').addEventListener('click', toggleForce);
document.getElementById('btn-fit').addEventListener('click', fitView);
document.getElementById('btn-clear').addEventListener('click', () => {
	clearImpact();
	nodeSel.classed('dim', false);
	showPanel(null);
	document.getElementById('search').value = '';
});
const searchEl = document.getElementById('search');
searchEl.addEventListener('input', (e) => runSearch(e.target.value));
searchEl.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		const first = runSearch(e.target.value);
		if (first) {
			selectOrigin(first.id);
			centerOn(first.id);
		}
	}
});
document.querySelectorAll('#state-filters input').forEach((cb) =>
	cb.addEventListener('change', applyStateFilter),
);

// === freshness 배너 (false-health 가드 — 비협상) ===
function renderBanner() {
	const el = document.getElementById('banner');
	const f = FRESHNESS || {};
	if (f.stale) {
		const n = (f.stale_sources || []).length;
		el.className = '';
		el.innerHTML =
			`⚠️ STALE — ${n} 개 source 가 synthesized_at(${esc(f.synthesized_at || '?')}) 이후 변경됨. 본 뷰는 구식일 수 있음 / 재합성: <code>traceability-matrix-builder --graph</code>`;
	} else {
		el.className = 'fresh';
		el.innerHTML = `✓ fresh — synthesized ${esc(f.synthesized_at || '?')} · reference-lens / display-only (gate inject ❌ · SSOT=artifact-graph.json)`;
	}
}

// === 범례 + top impact root + 요약 ===
renderBanner();
buildLegend();
fillSummary();
showPanel(null);

function buildLegend() {
	const present = [...new Set(nodes.map((n) => n.artifact_kind))];
	const lg = document.getElementById('legend');
	let h = '<div style="font-weight:600;margin-bottom:3px">노드 종류</div>';
	for (const k of present) {
		h += `<div class="row"><span class="sw" style="background:${KIND_COLOR[k] || '#6b7280'}"></span>${k}</div>`;
	}
	h += '<hr><div style="font-weight:600;margin-bottom:3px">엣지</div>';
	h += '<div class="row"><span class="lbl-line"></span>hard (MUST 전파)</div>';
	h += '<div class="row"><span class="lbl-line soft"></span>soft (SHOULD/FYI)</div>';
	h += '<hr><div style="font-weight:600;margin-bottom:3px">영향 등급</div>';
	for (const g of ['MUST', 'SHOULD', 'FYI']) {
		h += `<div class="row"><span class="sw" style="background:${GRADE_COLOR[g]}"></span>${g}</div>`;
	}
	lg.innerHTML = h;
}

function fillSummary() {
	const byKind = {};
	const byState = {};
	for (const n of nodes) {
		byKind[n.artifact_kind] = (byKind[n.artifact_kind] || 0) + 1;
		byState[n.state || 'active'] = (byState[n.state || 'active'] || 0) + 1;
	}
	let roots = [];
	try {
		roots = topKImpactRoot(GRAPH, { k: 3 });
	} catch {}
	const synthCount = nodes.filter((n) => n.synthetic).length;
	document.getElementById('summary').innerHTML =
		`${nodes.length} nodes · ${edges.length} edges` +
		(synthCount ? ` <span style="color:#9ca3af">(${synthCount} synthetic 표시)</span>` : '') +
		(roots.length
			? ` · <span class="hint">top impact: ${roots.map((r) => esc(r.id)).join(', ')}</span>`
			: '');
}

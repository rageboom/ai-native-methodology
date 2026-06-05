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
	symbol: '#0891b2',
};
const GRADE_COLOR = { MUST: '#e02424', SHOULD: '#f59e0b', FYI: '#9ca3af' };
const KIND_DESC = {
	chain: '요구사항→구현 단계 (유스케이스·행위·인수기준·작업·테스트·구현)',
	plan: '조직 단위 (화면 에픽·스토리·운영 작업)',
	analysis: '분석 산출물 (business-rules·antipatterns 등)',
	aspect: '횡단 관심사 (a11y·i18n·보안 등)',
	code: '코드 파일 — 표시 전용 (합성)',
	contract: '계약 (openapi 등) — 표시 전용 (합성)',
	symbol: '함수·메서드 + 호출 연결 (codegraph / 표시 전용)',
};
const GRADE_DESC = {
	MUST: '즉시 동기화 필요 — 직접 영향',
	SHOULD: '검토 권고 — 한 단계 연관',
	FYI: '참고 알림 — 약한 연관',
};
// 영어 단축어 → 한국어 표시 (노드 id 데이터는 불변 / 우리가 만든 라벨만 풀어 씀)
const SUBKIND_KO = {
	UC: '유스케이스',
	BHV: '행위 명세',
	AC: '인수 기준',
	TASK: '작업',
	TC: '테스트',
	IMPL: '구현',
	EPIC: '화면(에픽)',
	STORY: '스토리',
	OP: '운영 작업',
	code: '코드',
	contract: '계약',
	function: '함수',
	method: '메서드',
};
const COLUMN_KO = {
	UC: '유스케이스',
	BHV: '행위 명세',
	AC: '인수 기준',
	TASK: '작업',
	TC: '테스트',
	IMPL: '구현',
	'code/contract': '코드·계약',
	symbol: '함수·메서드',
};
const GRADE_KO = { MUST: '필수', SHOULD: '권고', FYI: '참고' };
const kindKo = (k) => SUBKIND_KO[k] || k;
const LANE_GAP = 34; // 밴드 사이 여백
const ROW_H = 46; // 노드 + 하단 라벨 + 여백
const COL_W = 172;
const MARGIN_X = 80;
const MARGIN_TOP = 34; // column 헤더 자리

const nodes = (GRAPH.nodes || []).map((n) => ({ ...n }));
const byId = new Map(nodes.map((n) => [n.id, n]));
const edges = (GRAPH.edges || [])
	.filter((e) => byId.has(e.source) && byId.has(e.target))
	.map((e) => ({ ...e }));

// d3.forceLink 는 엣지의 source/target 문자열 id 를 노드 객체 참조로 바꿔치기한다.
// → 엔드포인트 접근은 항상 nodeOf 로 (문자열 id / 객체 둘 다 안전).
const nodeOf = (ref) => (ref != null && typeof ref === 'object' ? ref : byId.get(ref));

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

// column 헤더 — 실제 노드가 있는 column 만 (빈 column 헤더 숨김)
const presentColumns = [...new Set([...meta.values()].map((m) => m.column))].sort((a, b) => a - b);
colLayer
	.selectAll('text.col-header')
	.data(presentColumns)
	.join('text')
	.attr('class', 'col-header')
	.attr('text-anchor', 'middle')
	.attr('x', (c) => MARGIN_X + c * COL_W)
	.attr('y', 18)
	.text((c) => COLUMN_KO[COLUMN_LABELS[c]] || COLUMN_LABELS[c]);

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
	.attr('r', (d) => (d.artifact_kind === 'symbol' ? 4 : d.synthetic ? 5 : 7))
	.attr('fill', (d) => KIND_COLOR[d.artifact_kind] || '#6b7280');

nodeSel
	.append('text')
	.attr('text-anchor', 'middle')
	.attr('y', (d) => (d.synthetic ? 5 : 7) + 13) // 노드 원 아래 가운데
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
	return t.length > 22 ? t.slice(0, 21) + '…' : t;
}

function renderPositions() {
	nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`);
	edgeSel
		.attr('x1', (e) => nodeOf(e.source).x)
		.attr('y1', (e) => nodeOf(e.source).y)
		.attr('x2', (e) => nodeOf(e.target).x)
		.attr('y2', (e) => nodeOf(e.target).y);
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
			.attr('x1', (e) => nodeOf(e.source).lx)
			.attr('y1', (e) => nodeOf(e.source).ly)
			.attr('x2', (e) => nodeOf(e.target).lx)
			.attr('y2', (e) => nodeOf(e.target).ly);
	}
}

// === 영향도 (킬러 기능) ===
let originId = null;
function selectOrigin(id) {
	originId = id;
	const node = byId.get(id);
	// 심볼(함수·메서드)은 artifact 영향 axis 밖 → calls/contains 1-hop 로컬 연결만 강조.
	if (node && node.artifact_kind === 'symbol') {
		highlightSymbolLocal(id);
		return;
	}
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
		.classed('dim', (e) => !(inImpact(nodeOf(e.source).id) && inImpact(nodeOf(e.target).id)))
		.classed('impact', (e) => inImpact(nodeOf(e.source).id) && inImpact(nodeOf(e.target).id));

	showPanel(byId.get(id), { res, gradeById, dirById });
}
function clearImpact() {
	originId = null;
	nodeSel.classed('origin', false).classed('dim', false);
	nodeSel.select('circle').attr('fill', (d) => KIND_COLOR[d.artifact_kind] || '#6b7280');
	edgeSel.classed('dim', false).classed('impact', false);
}

// 심볼 로컬 연결 강조 — calls(호출)/contains(소속) 1-hop 양방향. (analyzeImpact 아님 / 표시 전용)
function highlightSymbolLocal(id) {
	const callers = [];
	const callees = [];
	const nb = new Set([id]);
	for (const e of edges) {
		if (e.edge_type !== 'calls' && e.edge_type !== 'contains') continue;
		const s = nodeOf(e.source).id;
		const t = nodeOf(e.target).id;
		if (s === id) {
			nb.add(t);
			if (e.edge_type === 'calls') callees.push(t);
		}
		if (t === id) {
			nb.add(s);
			if (e.edge_type === 'calls') callers.push(s);
		}
	}
	nodeSel.classed('origin', (d) => d.id === id).classed('dim', (d) => !nb.has(d.id));
	nodeSel.select('circle').attr('fill', (d) => KIND_COLOR[d.artifact_kind] || '#6b7280');
	edgeSel
		.classed('dim', (e) => !(nb.has(nodeOf(e.source).id) && nb.has(nodeOf(e.target).id)))
		.classed('impact', (e) => e.edge_type === 'calls' && (nodeOf(e.source).id === id || nodeOf(e.target).id === id));
	showSymbolPanel(byId.get(id), callers, callees);
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
	html += `<span class="kindtag" style="background:${color}">${esc(node.artifact_kind)}${node.artifact_subkind && node.artifact_subkind !== node.artifact_kind ? ' · ' + esc(kindKo(node.artifact_subkind)) : ''}</span>`;
	if (node.synthetic) html += `<span class="kindtag" style="background:#9ca3af">synthetic (표시 전용)</span>`;
	html += '<dl>';
	if (node.title) html += `<dt>title</dt><dd>${esc(node.title)}</dd>`;
	if (node.signature) html += `<dt>signature</dt><dd>${esc(node.signature)}</dd>`;
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
		html += `<div class="impact-h">영향받는 노드 (${impact.res.stats.merged_count}) — 필수 ${c.MUST} · 권고 ${c.SHOULD} · 참고 ${c.FYI}</div>`;
		html += '<ul class="impact">';
		for (const m of list) {
			const dir = m.direction === 'backward' ? '상류' : m.direction === 'forward' ? '하류' : '양방향';
			html += `<li data-id="${esc(m.id)}"><span class="grade" style="background:${GRADE_COLOR[m.grade]}">${GRADE_KO[m.grade] || m.grade}</span><span class="gid">${esc(m.id)}</span><span class="dir">${dir}</span></li>`;
		}
		html += '</ul>';
		html += `<div class="impact-h" style="font-weight:400;color:#9ca3af;font-size:11px;margin-top:10px">상류 = 이 변경의 출처 / 하류 = 이 변경이 영향 주는 곳. 등급: 필수 = 즉시 동기화 · 권고 = 검토 · 참고 = 알림.</div>`;
	}
	side.innerHTML = html;
	side.querySelectorAll('li[data-id]').forEach((li) => {
		li.addEventListener('click', () => centerOn(li.getAttribute('data-id')));
	});
}

function showSymbolPanel(node, callers, callees) {
	const side = document.getElementById('side');
	let html = `<h2>${esc(node.title || node.id)}</h2>`;
	html += `<span class="kindtag" style="background:${KIND_COLOR.symbol}">${esc(kindKo(node.artifact_subkind))} · codegraph</span>`;
	html += '<dl>';
	if (node.signature) html += `<dt>signature</dt><dd>${esc(node.signature)}</dd>`;
	if (node.source_path) html += `<dt>위치</dt><dd>${esc(node.source_path)}</dd>`;
	html += '</dl>';
	const listOf = (ids, label) => {
		const uniq = [...new Set(ids)].sort();
		if (!uniq.length) return `<div class="impact-h" style="font-weight:400;color:#9ca3af">${label}: 없음</div>`;
		let h = `<div class="impact-h">${label} (${uniq.length})</div><ul class="impact">`;
		for (const cid of uniq) {
			const n = byId.get(cid);
			h += `<li data-id="${esc(cid)}"><span class="gid">${esc(n?.title || cid)}</span></li>`;
		}
		return h + '</ul>';
	};
	html += listOf(callers, '이 함수를 호출 (caller)');
	html += listOf(callees, '이 함수가 호출 (callee)');
	html += `<div class="impact-h" style="font-weight:400;color:#9ca3af;font-size:11px;margin-top:10px">함수 단위 호출 연결 (codegraph) — 표시 전용. 요구사항 영향도는 코드/구현 노드를 선택하세요.</div>`;
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

// === 가시성 (state 필터 + 함수/메서드 토글 통합) ===
let showSymbols = true;
function applyVisibility() {
	const hiddenStates = new Set();
	document.querySelectorAll('#state-filters input').forEach((cb) => {
		if (!cb.checked) hiddenStates.add(cb.value);
	});
	const vis = (d) =>
		!hiddenStates.has(d.state || 'active') && !(d.artifact_kind === 'symbol' && !showSymbols);
	nodeSel.style('display', (d) => (vis(d) ? null : 'none'));
	edgeSel.style('display', (e) =>
		vis(nodeOf(e.source)) && vis(nodeOf(e.target)) ? null : 'none',
	);
}
function toggleSymbols() {
	showSymbols = !showSymbols;
	d3.select('#btn-symbols').classed('active', showSymbols);
	applyVisibility();
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
	cb.addEventListener('change', applyVisibility),
);
// 함수/메서드 토글 — codegraph 심볼이 있을 때만 노출
const hasSymbols = nodes.some((n) => n.artifact_kind === 'symbol');
const btnSym = document.getElementById('btn-symbols');
if (hasSymbols) {
	btnSym.classList.add('active');
	btnSym.addEventListener('click', toggleSymbols);
} else {
	btnSym.style.display = 'none';
}

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
	const item = (sw, lbl, desc) =>
		`<div class="row">${sw}<span class="txt"><span class="lbl">${lbl}</span><span class="desc">${desc}</span></span></div>`;
	const dot = (c, extra = '') => `<span class="sw" style="background:${c};${extra}"></span>`;

	let h = '<div class="legend-head" id="legend-toggle"><span>범례 / 설명</span><span id="legend-caret">▾</span></div>';
	h += '<div id="legend-body">';

	h += '<div class="legend-sec">노드 종류 (색)</div>';
	for (const k of present) {
		h += item(dot(KIND_COLOR[k] || '#6b7280'), k, KIND_DESC[k] || '');
	}

	h += '<div class="legend-sec">엣지 (선)</div>';
	h += item('<span class="lbl-line"></span>', 'hard', '강한 의존 — 영향 끝까지 전파');
	h += item('<span class="lbl-line soft"></span>', 'soft', '약한 연관 — 1~2 hop 감쇠');

	h += '<div class="legend-sec">영향 등급 (노드 선택 시)</div>';
	for (const g of ['MUST', 'SHOULD', 'FYI']) {
		h += item(dot(GRADE_COLOR[g]), GRADE_KO[g], GRADE_DESC[g]);
	}
	h += item(dot('#fff', 'outline:3px solid #2563eb;outline-offset:-1px'), '선택(origin)', '바꾸려는 지점 — 추적 시작');

	h += '<div class="legend-sec">상태 표시</div>';
	h += item(dot('#fff', 'border:2.5px solid #dc2626'), 'drift', '코드/스펙 어긋남 — 빨강 테두리');
	h += item(dot('#fff', 'border:1.5px dashed #9ca3af'), 'synthetic', '코드/계약 leaf — 점선 (표시 전용)');
	h += '</div>';

	lg.innerHTML = h;
	const setOpen = (open) => {
		document.getElementById('legend-body').style.display = open ? '' : 'none';
		document.getElementById('legend-caret').textContent = open ? '▾' : '▸';
		d3.select('#btn-legend').classed('active', open);
	};
	const toggle = () => setOpen(document.getElementById('legend-body').style.display === 'none');
	document.getElementById('legend-toggle').addEventListener('click', toggle);
	const bl = document.getElementById('btn-legend');
	if (bl) bl.addEventListener('click', toggle);
	setOpen(false); // 기본 접힘 — 그래프 가림 최소화
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
		// 심볼/호출(표시 전용) 제외한 아티팩트 그래프 기준 — top root 의미 보존.
		const artifactView = {
			nodes: nodes.filter((n) => n.artifact_kind !== 'symbol'),
			edges: edges.filter((e) => e.edge_type !== 'calls' && e.edge_type !== 'contains'),
		};
		roots = topKImpactRoot(artifactView, { k: 3 });
	} catch {}
	const synthCount = nodes.filter((n) => n.synthetic).length;
	document.getElementById('summary').innerHTML =
		`${nodes.length} nodes · ${edges.length} edges` +
		(synthCount ? ` <span style="color:#9ca3af">(${synthCount} synthetic 표시)</span>` : '') +
		(roots.length
			? ` · <span class="hint">top impact: ${roots.map((r) => esc(r.id)).join(', ')}</span>`
			: '');
}

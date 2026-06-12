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
// 체인 단계별 색 (artifact_kind=chain 이 전부 같은 파랑이던 문제 해소) — 좌→우 단계 진행감.
const STAGE_COLOR = {
	UC: '#2563eb', // 파랑
	BHV: '#0d9488', // 청록
	AC: '#16a34a', // 초록
	TASK: '#ca8a04', // 황금
	TC: '#ea580c', // 주황
	IMPL: '#dc2626', // 빨강
	EPIC: '#7c3aed', // 보라(plan)
	STORY: '#9333ea',
	OP: '#a855f7',
};
// 노드 색 — 단계(subkind) 우선, 없으면 kind 색. (순수 로직은 explore.js/colorOf — 단위 테스트)
const nodeColor = (d) => colorOf(d, STAGE_COLOR, KIND_COLOR);
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
	code: '코드',
	contract: 'API/계약',
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
const meta = computeLayout(nodes, edges); // id → {column, lane, row} (barycenter 정렬)
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
let curLayoutWidth = layoutWidth; // 탐색 모드 재배치 시 갱신 (fitView 가 사용)
let curLayoutHeight = layoutHeight;

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

// === 탐색(드릴다운) 모드 — UC 부터 클릭으로 단계별 펼침 ===
//   체인을 한꺼번에 다 깔면 갭·교차가 커서 가독성이 나쁨 → 펼친 가지만 그리고 매 토글 압축 재배치.
//   forward 부모/자식 (이전 컬럼→다음 컬럼). 심볼(contains/calls)은 드릴다운 대상 아님(표시 전용).
const { childrenOf, parentsOf } = chainRelations(
	edges,
	(id) => meta.get(id)?.column ?? null,
	(x) => nodeOf(x).id,
	(e) => e.edge_type === 'contains' || e.edge_type === 'calls',
);
let exploreMode = true; // 기본 = 드릴다운 (UC 부터 시작)
let direction = 'forward'; // forward: UC→코드(childrenOf) / reverse: 코드→UC(parentsOf)
const expanded = new Set();
let exploreVisible = null; // null = 전체 표시(explore off)

// 방향별 펼침 관계 — forward=자식(다음 단계) / reverse=부모(이전 단계). invRel=루트 쪽(라인 강조용).
const rel = () => (direction === 'forward' ? childrenOf : parentsOf);
const invRel = () => (direction === 'forward' ? parentsOf : childrenOf);
const hasKids = (id) => (rel().get(id)?.length ?? 0) > 0;

function exploreRoots() {
	if (direction === 'forward') {
		const ucs = nodes
			.filter((n) => n.artifact_subkind === 'UC')
			.map((n) => n.id);
		return ucs.length
			? ucs
			: nodes.filter((n) => !(parentsOf.get(n.id)?.length)).map((n) => n.id);
	}
	// reverse — 체인 말단(코드/계약/말단 IMPL·TC): 부모는 있고 자식은 없는 노드.
	return nodes
		.filter((n) => parentsOf.has(n.id) && !childrenOf.has(n.id))
		.map((n) => n.id);
}
function computeExploreVisible() {
	if (!exploreMode) return null;
	return exploreVisibleSet(exploreRoots(), expanded, rel());
}

// 클릭 노드 아래(rel 방향) 전체 서브트리(연결된 모든 자손)를 한 번에 펼침/접기.
function subtreeIds(id) {
	const set = new Set();
	const stack = [id];
	while (stack.length) {
		for (const c of rel().get(stack.pop()) || []) {
			if (!set.has(c)) {
				set.add(c);
				stack.push(c);
			}
		}
	}
	return set; // 자손(id 제외)
}
function expandSubtree(id) {
	expanded.add(id);
	for (const c of subtreeIds(id)) expanded.add(c); // 모든 자손도 펼침 상태로
}
function collapseSubtree(id) {
	for (const c of subtreeIds(id)) expanded.delete(c);
	expanded.delete(id);
}

// === SVG 골격 ===
const container = d3.select('#graph');
const svg = container.append('svg');
const root = svg.append('g'); // zoom 대상

// 화살촉 — 기본(회색) + 선택강조(파랑) 2종. refX=8 → 화살표 끝이 라인 끝(노드 경계)에 정확히 닿음.
const defs = svg.append('defs');
function defMarker(id, color) {
	defs
		.append('marker')
		.attr('id', id)
		.attr('viewBox', '0 -5 10 10')
		.attr('refX', 7)
		.attr('refY', 0)
		.attr('markerWidth', 4.5)
		.attr('markerHeight', 4.5)
		.attr('orient', 'auto')
		.append('path')
		.attr('d', 'M0,-3.5L7,0L0,3.5')
		.attr('fill', color);
}
defMarker('arrow', '#aab1bd');
defMarker('arrow-sel', '#eab308'); // 선택 강조 = 노랑 (라인·링과 통일)

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
	.on('click', (_, d) => {
		if (exploreMode) {
			if (hasKids(d.id)) {
				// 한 번 클릭 = 연결된 전체 서브트리 펼침 / 다시 = 전체 접기
				if (expanded.has(d.id)) collapseSubtree(d.id);
				else expandSubtree(d.id);
				relayout();
			}
			highlightSelected(d.id); // 선택 노드 + 연결 라인 강조
			showPanel(byId.get(d.id), null); // 정보 패널 (영향도 axis 아님)
		} else {
			selectOrigin(d.id);
		}
	});

nodeSel
	.append('circle')
	.attr('r', (d) => (d.artifact_kind === 'symbol' ? 4 : d.synthetic ? 5 : 7))
	.attr('fill', (d) => nodeColor(d));

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

const nodeR = (n) => (n.artifact_kind === 'symbol' ? 4 : n.synthetic ? 5 : 7);
// 엣지 끝점을 노드 경계로 당겨 화살표가 노드에 정확히 닿게 (center→center 면 화살표가 노드 속/밖 어긋남).
function edgeEnds(e) {
	let from = nodeOf(e.source);
	let to = nodeOf(e.target);
	// 화살표를 항상 단계 진행 방향(낮은 컬럼→높은 컬럼)으로 — source 가 더 높은 컬럼인 엣지
	//   (groups: STORY→BHV 등)에서 화살표가 역방향(왼쪽)으로 그려지던 문제 교정.
	const cf = meta.get(from.id)?.column ?? 0;
	const ct = meta.get(to.id)?.column ?? 0;
	if (cf > ct) {
		const tmp = from;
		from = to;
		to = tmp;
	}
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const len = Math.hypot(dx, dy) || 1;
	const ux = dx / len;
	const uy = dy / len;
	return {
		x1: from.x + ux * nodeR(from),
		y1: from.y + uy * nodeR(from),
		x2: to.x - ux * (nodeR(to) + 3),
		y2: to.y - uy * (nodeR(to) + 3),
	};
}
function applyEdgePos(sel) {
	return sel
		.attr('x1', (e) => edgeEnds(e).x1)
		.attr('y1', (e) => edgeEnds(e).y1)
		.attr('x2', (e) => edgeEnds(e).x2)
		.attr('y2', (e) => edgeEnds(e).y2);
}
function renderPositions() {
	nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`);
	applyEdgePos(edgeSel);
}
renderPositions();

// tidy-tree y 배치 — 각 서브트리가 겹치지 않는 자기 세로 영역을 보장받고, 부모는 자식들 중앙에 정렬.
//   (DAG → 첫 가시 부모에 귀속해 트리화. 후위순회 leaf 순번 → 서브트리당 연속 slot 블록 → 영역 보장.)
const SUBTREE_GAP = 0.7; // 루트(UC) 서브트리 사이 여백(행) — 영역 구분 시인성. (배치 순수 로직 = explore.js/tidyTreeRows)

// 탐색 모드 재배치 — 보이는(펼쳐진) 노드만으로 압축 layout 재계산 후 애니메이션 이동.
function relayout(animate = true) {
	exploreVisible = computeExploreVisible();
	const showAll = exploreVisible === null;
	const isVis = (id) => showAll || exploreVisible.has(id);
	const visNodes = nodes.filter((n) => isVis(n.id));

	if (exploreMode && exploreVisible) {
		// tidy-tree — 컬럼(x)=단계, 행(y)=서브트리 영역 보장 배치.
		const rowOf = tidyTreeRows(
			exploreRoots(),
			expanded,
			rel(),
			exploreVisible,
			SUBTREE_GAP,
		);
		let maxRow = 0;
		let maxCol = 0;
		for (const n of visNodes) {
			const c = meta.get(n.id)?.column ?? 0;
			const r = rowOf.get(n.id) ?? 0;
			n.x = MARGIN_X + c * COL_W;
			n.y = MARGIN_TOP + r * ROW_H + ROW_H / 2;
			if (r > maxRow) maxRow = r;
			if (c > maxCol) maxCol = c;
		}
		curLayoutHeight = (maxRow + 1) * ROW_H + 40;
		curLayoutWidth = MARGIN_X + (maxCol + 1) * COL_W;
	} else {
		// 전체(컬럼형) — barycenter + lane 밴드.
		const visEdges = edges.filter(
			(e) => isVis(nodeOf(e.source).id) && isVis(nodeOf(e.target).id),
		);
		const m2 = computeLayout(visNodes, visEdges);
		const lr = {};
		for (const m of m2.values())
			lr[m.lane] = Math.max(lr[m.lane] ?? 0, m.row + 1);
		const lt = {};
		let a = MARGIN_TOP;
		for (const lane of LANE_ORDER_LOCAL) {
			if (!lr[lane]) continue;
			lt[lane] = a;
			a += lr[lane] * ROW_H + LANE_GAP;
		}
		curLayoutHeight = a + 20;
		const maxCol = m2.size
			? Math.max(...[...m2.values()].map((m) => m.column))
			: 0;
		curLayoutWidth = MARGIN_X + (maxCol + 1) * COL_W;
		for (const n of visNodes) {
			const m = m2.get(n.id);
			n.x = MARGIN_X + m.column * COL_W;
			n.y = (lt[m.lane] ?? MARGIN_TOP) + m.row * ROW_H + ROW_H / 2;
		}
	}

	applyVisibility(); // explore + symbol + state 통합 표시
	nodeSel.classed(
		'expandable',
		(d) => exploreMode && hasKids(d.id) && !expanded.has(d.id),
	);
	const ns = animate ? nodeSel.transition().duration(300) : nodeSel;
	ns.attr('transform', (d) => `translate(${d.x},${d.y})`);
	const es = animate ? edgeSel.transition().duration(300) : edgeSel;
	applyEdgePos(es);
	if (selectedId) highlightSelected(selectedId); // 재배치 후 선택 강조 유지
}

// 선택 노드 강조 — 루트→선택 조상 경로 + 선택의 전체 서브트리(펼친 자손 전부)를 라인으로 강조.
//   origin/online 링 + sel 라인 + arrow-sel(노랑 화살표). (탐색 모드 / 영향도 axis 아님)
let selectedId = null;
function highlightSelected(id) {
	selectedId = id;
	// 루트 쪽 경로 — invRel(forward=parentsOf / reverse=childrenOf) 따라 전부 수집. 자기 포함.
	const up = invRel();
	const line = new Set([id]);
	const stack = [id];
	while (stack.length) {
		for (const p of up.get(stack.pop()) || []) {
			if (!line.has(p)) {
				line.add(p);
				stack.push(p);
			}
		}
	}
	// 선택 노드의 전체 서브트리(rel 방향 자손) 도 라인에 포함 → 펼친 전체의 라인·화살표가 강조.
	for (const c of subtreeIds(id)) line.add(c);
	const onLine = (e) => {
		const s = nodeOf(e.source).id;
		const t = nodeOf(e.target).id;
		return line.has(s) && line.has(t);
	};
	nodeSel
		.classed('origin', (d) => d.id === id)
		.classed('online', (d) => d.id !== id && line.has(d.id));
	edgeSel
		.classed('sel', onLine)
		.attr('marker-end', (e) => (onLine(e) ? 'url(#arrow-sel)' : 'url(#arrow)'));
}

// === zoom / pan + 초기 fit ===
const zoom = d3
	.zoom()
	.scaleExtent([0.15, 4])
	.on('zoom', (ev) => root.attr('transform', ev.transform));
svg.call(zoom);

function fitView() {
	const w = container.node().clientWidth || 800;
	const h = container.node().clientHeight || 600;
	const scale = Math.min(1, (w - 40) / curLayoutWidth, (h - 40) / curLayoutHeight);
	const tx = (w - curLayoutWidth * scale) / 2;
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
	// code leaf 클릭 시 그 파일이 contains 하는 메서드·함수 심볼(codegraph)도 강조 집합에 포함.
	//   analyzeImpact 는 결정론 8 edge_type 만 보고 synthetic contains/calls 를 무시하므로,
	//   파일→메서드 연결이 dim 되어 "메서드가 연결 안됨" 으로 보이던 문제 해소 (표시 전용 / 결정론 axis 무오염).
	const containedSyms = new Set();
	for (const e of edges) {
		if (e.edge_type === 'contains' && nodeOf(e.source).id === id) {
			containedSyms.add(nodeOf(e.target).id);
		}
	}
	// progressive disclosure — 전체 심볼이 꺼져있어도 클릭한 파일의 메서드만 노출.
	//   (비-코드 노드는 containedSyms 가 비어 focusedFileSyms 가 리셋 → 이전 파일 메서드 자동 숨김.)
	focusedFileSyms = containedSyms;
	applyVisibility();
	const inImpact = (nid) =>
		nid === id || gradeById.has(nid) || containedSyms.has(nid);

	nodeSel
		.classed('origin', (d) => d.id === id)
		.classed('dim', (d) => !inImpact(d.id))
		.select('circle')
		.attr('fill', (d) =>
			d.id === id
				? nodeColor(d)
				: gradeById.has(d.id)
					? GRADE_COLOR[gradeById.get(d.id)]
					: nodeColor(d),
		);

	edgeSel
		.classed('dim', (e) => !(inImpact(nodeOf(e.source).id) && inImpact(nodeOf(e.target).id)))
		.classed('impact', (e) => inImpact(nodeOf(e.source).id) && inImpact(nodeOf(e.target).id));

	showPanel(byId.get(id), { res, gradeById, dirById });
}
function clearImpact() {
	originId = null;
	nodeSel.classed('origin', false).classed('dim', false).classed('online', false);
	nodeSel.select('circle').attr('fill', (d) => nodeColor(d));
	edgeSel
		.classed('dim', false)
		.classed('impact', false)
		.classed('sel', false)
		.attr('marker-end', 'url(#arrow)');
	selectedId = null;
	focusedFileSyms = new Set(); // 포커스 해제 → 메서드 다시 숨김(전체 토글이 on 이 아닌 한)
	applyVisibility();
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
	nodeSel.select('circle').attr('fill', (d) => nodeColor(d));
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
	const color = nodeColor(node);
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
// 기본 숨김 — 메서드 레이어(codegraph 함수·메서드)가 너무 빽빽해 artifact 구조 가독성을 해침.
//   '함수/메서드' 버튼으로 전체 on, 또는 코드 파일 클릭 시 그 파일 메서드만 노출(focusedFileSyms / progressive disclosure).
let showSymbols = false;
let focusedFileSyms = new Set();
function applyVisibility() {
	const hiddenStates = new Set();
	document.querySelectorAll('#state-filters input').forEach((cb) => {
		if (!cb.checked) hiddenStates.add(cb.value);
	});
	const vis = (d) =>
		(exploreVisible === null || exploreVisible.has(d.id)) &&
		!hiddenStates.has(d.state || 'active') &&
		!(
			d.artifact_kind === 'symbol' &&
			!showSymbols &&
			!focusedFileSyms.has(d.id)
		);
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
	if (exploreMode) {
		expanded.clear(); // 모두 접어 UC 부터 다시
		relayout();
		fitView();
	}
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
	btnSym.classList.toggle('active', showSymbols); // 기본 off 반영
	btnSym.title = '전체 함수/메서드 표시 토글 (기본: 파일 클릭 시 해당 메서드만)';
	btnSym.addEventListener('click', toggleSymbols);
	applyVisibility(); // 초기 심볼 숨김 반영
} else {
	btnSym.style.display = 'none';
}

// 탐색(드릴다운) 모드 토글 — 기본 ON. UC 부터 시작, 노드 클릭으로 자식 단계 펼침/접기.
const btnExp = document.getElementById('btn-explore');
if (btnExp) {
	btnExp.title = 'UC 부터 클릭으로 단계별 펼치기 (off = 전체 펼친 컬럼형)';
	btnExp.classList.toggle('active', exploreMode);
	btnExp.addEventListener('click', () => {
		exploreMode = !exploreMode;
		btnExp.classList.toggle('active', exploreMode);
		if (!exploreMode) expanded.clear();
		relayout(false);
		fitView();
	});
}
// 방향 토글 — forward(UC→코드) ↔ reverse(코드→UC). 전환 시 펼침 초기화 후 재배치.
const btnDir = document.getElementById('btn-direction');
if (btnDir) {
	btnDir.title = '드릴다운 방향 전환 — UC→코드(요구사항이 어디까지 구현됐나) / 코드→UC(이 코드는 무슨 요구사항인가)';
	const syncDirLabel = () => {
		btnDir.textContent =
			direction === 'forward' ? '방향: UC→코드' : '방향: 코드→UC';
		btnDir.classList.toggle('active', direction === 'reverse');
	};
	syncDirLabel();
	btnDir.addEventListener('click', () => {
		direction = direction === 'forward' ? 'reverse' : 'forward';
		expanded.clear();
		selectedId = null;
		syncDirLabel();
		relayout(false);
		fitView();
	});
}

// 초기 드릴다운 상태 적용 (UC 만 보이게 압축 배치)
relayout(false);
fitView();

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

	h += '<div class="legend-sec">노드 단계 / 종류 (색)</div>';
	// 체인은 단계(UC→…→IMPL)별 색으로 분리 표시
	for (const s of ['UC', 'BHV', 'AC', 'TASK', 'TC', 'IMPL']) {
		if (!nodes.some((n) => n.artifact_subkind === s)) continue;
		h += item(dot(STAGE_COLOR[s]), SUBKIND_KO[s] || s, '');
	}
	for (const k of present) {
		if (k === 'chain') continue; // 단계로 이미 표시
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

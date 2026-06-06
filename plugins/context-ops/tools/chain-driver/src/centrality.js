// centrality.js
// operation.md 결정 7 (top-K impact root) + 결정 8 (P4 알고리즘 Centrality / weighted PageRank).
//   "어떤 노드가 가장 많은 하류에 영향을 주는가" = top-K impact root 산정.
//   dep-graph-navigator + SessionStart 주입이 사용.
//
// 두 측정:
//   1. weighted out-degree — hard 엣지 가중치 높게 (즉시 영향). 빠른 근사.
//   2. weighted PageRank — 전파적 영향 (간접 하류까지). power iteration.
//
// 결정성: 동일 입력 → 동일 출력 (id 정렬 tie-break / 고정 iteration).
// operation.md 결정 8 상호작용 노트: centrality 점수는 propagation-policy 가중치에 피드백 ❌ (분리 차원).

// 엣지 가중치 — hard 가 soft 보다 영향 큼 (결정 1 confidence + 결정 4 attenuation 정합).
const EDGE_WEIGHT = Object.freeze({
	derived_from: 1.0,
	implements: 1.0,
	tests: 1.0,
	depends_on: 1.0,
	conforms_to: 1.0, // v11.0.0 hard — contract 준수 (결정 4 MUST)
	cross_reference: 0.5, // soft — 1-hop 만 영향 (결정 4 SHOULD)
	groups: 0.5, // v11.0.0 soft — 조직 포함 1-hop (결정 4 SHOULD)
	informs: 0.25, // soft — 권고성 (결정 4 FYI)
});

function weightFor(edgeType) {
	return EDGE_WEIGHT[edgeType] ?? 0.5;
}

function activeNodes(graph, nonTraversable) {
	return (graph?.nodes ?? []).filter(
		(n) => n && typeof n.id === 'string' && !nonTraversable.has(n.state),
	);
}

/**
 * weighted out-degree centrality — 즉시 하류 영향력 (빠른 근사).
 * @returns {Array<{id, score, raw}>} score 내림차순 + id 오름차순 tie-break
 */
export function weightedOutDegree(graph, opts = {}) {
	const nonTraversable = new Set(opts.nonTraversableStates ?? ['propose']);
	const nodes = activeNodes(graph, nonTraversable);
	const nodeSet = new Set(nodes.map((n) => n.id));
	const score = new Map(nodes.map((n) => [n.id, 0]));

	for (const e of graph?.edges ?? []) {
		if (!nodeSet.has(e.source) || !nodeSet.has(e.target)) continue;
		score.set(e.source, score.get(e.source) + weightFor(e.edge_type));
	}

	return [...score.entries()]
		.map(([id, raw]) => ({ id, score: raw, raw }))
		.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/**
 * weighted PageRank — 전파적 영향력 (간접 하류 포함).
 * power iteration / damping 0.85 / 고정 iteration (결정성).
 * 영향 방향: source → target 으로 "영향이 흐른다" 관점 (forward 영향력).
 * @returns {Array<{id, score}>} score 내림차순 + id tie-break
 */
export function weightedPageRank(graph, opts = {}) {
	const damping = opts.damping ?? 0.85;
	const iterations = opts.iterations ?? 40;
	const nonTraversable = new Set(opts.nonTraversableStates ?? ['propose']);
	const nodes = activeNodes(graph, nonTraversable);
	const N = nodes.length;
	if (N === 0) return [];

	const ids = nodes.map((n) => n.id);
	const nodeSet = new Set(ids);

	// out-weight 합 + adjacency (weighted)
	const outAdj = new Map(ids.map((id) => [id, []]));
	const outWeightSum = new Map(ids.map((id) => [id, 0]));
	for (const e of graph?.edges ?? []) {
		if (!nodeSet.has(e.source) || !nodeSet.has(e.target)) continue;
		const w = weightFor(e.edge_type);
		outAdj.get(e.source).push({ target: e.target, w });
		outWeightSum.set(e.source, outWeightSum.get(e.source) + w);
	}

	// 초기값 1/N
	let rank = new Map(ids.map((id) => [id, 1 / N]));
	const base = (1 - damping) / N;

	for (let iter = 0; iter < iterations; iter++) {
		const next = new Map(ids.map((id) => [id, base]));
		let danglingMass = 0;
		for (const id of ids) {
			const outSum = outWeightSum.get(id);
			if (outSum === 0) {
				danglingMass += rank.get(id);
				continue;
			}
			const share = damping * rank.get(id);
			for (const { target, w } of outAdj.get(id)) {
				next.set(target, next.get(target) + share * (w / outSum));
			}
		}
		// dangling 노드 질량은 균등 재분배
		if (danglingMass > 0) {
			const spread = (damping * danglingMass) / N;
			for (const id of ids) next.set(id, next.get(id) + spread);
		}
		rank = next;
	}

	return [...rank.entries()]
		.map(([id, score]) => ({ id, score }))
		.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/**
 * top-K impact root — operation.md 결정 7. 기본 = weighted out-degree (빠름) / method='pagerank' 선택 가능.
 * @returns {Array<{id, score, ...}>} 상위 K
 */
export function topKImpactRoot(graph, opts = {}) {
	const k = opts.k ?? 3;
	const method = opts.method ?? 'out_degree';
	const ranked =
		method === 'pagerank'
			? weightedPageRank(graph, opts)
			: weightedOutDegree(graph, opts);
	return ranked.slice(0, k);
}

// === 카탈로그 export ===
export const EDGE_WEIGHTS = Object.freeze({ ...EDGE_WEIGHT });

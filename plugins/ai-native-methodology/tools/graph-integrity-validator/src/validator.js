/**
 * artifact-graph.json 무결성 검증.
 *
 * 세 가지를 확인:
 *   1) DFS cycle — back-edge 등장 시 stack 경로를 사이클로 기록
 *   2) Orphan — state ∈ {active, drift} 노드 중 in/out 엣지 모두 없는 것
 *   3) Unknown edge — source 또는 target 이 nodes 배열에 없는 엣지
 *      예외: edge_type ∈ {implements, conforms_to} 의 target 은 Tier-2 leaf 이므로
 *        nodes 배열에 없는 것이 정상 (docs/dependency-graph.md §2 "그래프 폭증 회피").
 *        implements = source code 파일 / conforms_to = contract 산출물(openapi/component/visual) leaf (v11.0.0).
 *        source 는 여전히 Tier-1 노드여야 함.
 *
 * 입력 형식: { nodes: ArtifactGraphNode[], edges: ArtifactGraphEdge[] }
 * 출력 형식: { passed, cycles, orphans, unknown_edges, summary }
 *
 * 운영 plan: docs/dependency-graph.md §3 P1 (graph-integrity) + §7 (DFS cycle 감지) + release-readiness #15.
 */

export function validateGraph(graph) {
	const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
	const edges = Array.isArray(graph?.edges) ? graph.edges : [];

	const nodeMap = new Map();
	const adj = new Map();
	const reverseAdj = new Map();

	for (const node of nodes) {
		if (!node || typeof node.id !== 'string') {
			continue;
		}
		nodeMap.set(node.id, node);
		adj.set(node.id, []);
		reverseAdj.set(node.id, []);
	}

	const unknownEdges = [];
	for (const edge of edges) {
		if (!nodeMap.has(edge.source)) {
			unknownEdges.push({
				edge,
				reason: `source '${edge.source}' not in nodes`,
			});
			continue;
		}
		// implements/conforms_to 엣지: target 이 Tier-2 leaf 이므로 nodes 부재 정상.
		//   implements = source code 경로 / conforms_to = contract 산출물 leaf (v11.0.0).
		//   adjacency 에는 추가하지 않아 cycle/orphan 계산에 영향 없음.
		if (
			(edge.edge_type === 'implements' || edge.edge_type === 'conforms_to') &&
			!nodeMap.has(edge.target)
		) {
			continue;
		}
		if (!nodeMap.has(edge.target)) {
			unknownEdges.push({
				edge,
				reason: `target '${edge.target}' not in nodes`,
			});
			continue;
		}
		adj.get(edge.source).push(edge.target);
		reverseAdj.get(edge.target).push(edge.source);
	}

	const cycles = detectCycles(nodes, adj);
	const orphans = detectOrphans(nodes, adj, reverseAdj);

	const passed =
		cycles.length === 0 && orphans.length === 0 && unknownEdges.length === 0;

	return {
		passed,
		cycles,
		orphans,
		unknown_edges: unknownEdges,
		summary: {
			node_count: nodes.length,
			edge_count: edges.length,
			cycle_count: cycles.length,
			orphan_count: orphans.length,
			unknown_edge_count: unknownEdges.length,
		},
	};
}

function detectCycles(nodes, adj) {
	const WHITE = 0;
	const GRAY = 1;
	const BLACK = 2;
	const color = new Map();
	for (const node of nodes) color.set(node.id, WHITE);

	const cycles = [];
	const stack = [];

	function dfs(u) {
		color.set(u, GRAY);
		stack.push(u);

		for (const v of adj.get(u) || []) {
			const c = color.get(v);
			if (c === WHITE) {
				dfs(v);
			} else if (c === GRAY) {
				const idx = stack.indexOf(v);
				if (idx >= 0) {
					cycles.push([...stack.slice(idx), v]);
				}
			}
		}

		color.set(u, BLACK);
		stack.pop();
	}

	for (const node of nodes) {
		if (color.get(node.id) === WHITE) {
			dfs(node.id);
		}
	}

	return cycles;
}

function detectOrphans(nodes, adj, reverseAdj) {
	const orphans = [];
	for (const node of nodes) {
		if (!node || typeof node.id !== 'string') {
			continue;
		}
		if (node.state === 'propose' || node.state === 'deprecated') {
			continue;
		}
		const outDeg = adj.get(node.id)?.length ?? 0;
		const inDeg = reverseAdj.get(node.id)?.length ?? 0;
		if (outDeg === 0 && inDeg === 0) {
			orphans.push({ id: node.id, reason: 'no incoming or outgoing edges' });
		}
	}
	return orphans;
}

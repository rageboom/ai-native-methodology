// scc.js — Tarjan SCC (1972) over a directed module graph. 완전 결정론 (O(V+E)).
//
// 신호 #1 (research-reverse-engineering-carve.md §1 / DEC-2026-06-09-scope-carve-3signal §2.1):
//   multi-node SCC = 분할 불가 atomic 단위 (acyclic cut 으로 cycle 미분리 = 불법 carve 사전 배제).
//   condensation DAG topological 순서 = 안전 증분 추출/strangler 순서.
//
// no-simulation: 순수 그래프 알고리즘 — 추정 0. 기존 repo 에 Tarjan 구현 부재(graph-integrity-validator = DFS
//   single-cycle coloring / architecture.schema 의 tarjan_scc 라벨 = 미구현 aspirational) → 자체 구현.
//
// 입력 노드 외 엣지·self-loop 처리: 미지 노드 참조 엣지는 무시(known module 간만). self-loop = singleton SCC
//   이지만 has_cycle 에 반영. 결정성 보장 = 노드·이웃 정렬(traversal tiebreak 고정).

export function tarjanScc({ nodes, edges }) {
	const nodeList = [...new Set(nodes)].sort();
	const known = new Set(nodeList);
	const adj = new Map(nodeList.map((n) => [n, new Set()]));
	let hasSelfLoop = false;

	for (const e of edges) {
		if (!e || !known.has(e.from) || !known.has(e.to)) continue;
		if (e.from === e.to) {
			hasSelfLoop = true;
			continue; // self-loop = cycle 신호일 뿐, adjacency 에는 미반영(SCC 분할 무관)
		}
		adj.get(e.from).add(e.to);
	}
	// 이웃 정렬 = 결정론 traversal
	const adjSorted = new Map(
		nodeList.map((n) => [n, [...adj.get(n)].sort()]),
	);

	let counter = 0;
	const idx = new Map();
	const low = new Map();
	const onStack = new Set();
	const stack = [];
	const rawComponents = []; // Tarjan 출력 = 역(reverse) 위상순서

	// 반복형(iterative) Tarjan — big-ball-of-mud 거대 SCC 의 깊은 재귀 회피.
	for (const start of nodeList) {
		if (idx.has(start)) continue;
		const work = [{ node: start, ni: 0 }];
		idx.set(start, counter);
		low.set(start, counter);
		counter++;
		stack.push(start);
		onStack.add(start);

		while (work.length) {
			const frame = work[work.length - 1];
			const neighbors = adjSorted.get(frame.node);
			if (frame.ni < neighbors.length) {
				const w = neighbors[frame.ni];
				frame.ni++;
				if (!idx.has(w)) {
					idx.set(w, counter);
					low.set(w, counter);
					counter++;
					stack.push(w);
					onStack.add(w);
					work.push({ node: w, ni: 0 });
				} else if (onStack.has(w)) {
					low.set(
						frame.node,
						Math.min(low.get(frame.node), idx.get(w)),
					);
				}
			} else {
				if (low.get(frame.node) === idx.get(frame.node)) {
					const comp = [];
					let w;
					do {
						w = stack.pop();
						onStack.delete(w);
						comp.push(w);
					} while (w !== frame.node);
					rawComponents.push(comp.sort());
				}
				work.pop();
				if (work.length) {
					const parent = work[work.length - 1].node;
					low.set(parent, Math.min(low.get(parent), low.get(frame.node)));
				}
			}
		}
	}

	// rawComponents = 역위상순서 → reverse = 위상순서(의존 그래프 topo / A→B 면 A 먼저).
	const topoComponents = [...rawComponents].reverse();

	// 안정 index = member 최소값 정렬(traversal 무관 결정론 식별자).
	const sortedForId = [...topoComponents].sort((a, b) =>
		a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0,
	);
	const idOf = new Map();
	sortedForId.forEach((comp, i) => idOf.set(comp, i));

	const components = topoComponents.map((comp, topoRank) => {
		const size = comp.length;
		// is_atomic = multi-node cycle (분할 불가). self-loop singleton 은 atomic 아님(단일 모듈).
		const isAtomic = size > 1;
		return {
			index: idOf.get(comp),
			members: comp,
			size,
			is_atomic: isAtomic,
			kind: size > 1 ? 'multi_node_cycle' : 'singleton',
			topo_rank: topoRank,
		};
	});
	// index 오름차순 정렬(출력 안정) + condensation_order = 위상순서의 index 나열
	const condensationOrder = [...components]
		.sort((a, b) => a.topo_rank - b.topo_rank)
		.map((c) => c.index);
	components.sort((a, b) => a.index - b.index);

	const hasMultiNode = components.some((c) => c.is_atomic);
	return {
		has_cycle: hasMultiNode || hasSelfLoop,
		components,
		condensation_order: condensationOrder,
	};
}

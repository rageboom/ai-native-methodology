// propagation-orderer.js
// ★ operation.md 결정 8 — P3 알고리즘 Topological sort.
//   자동 cascade 시 어떤 순서로 노드를 처리해야 안전한지 결정.
//   DFS cycle ≠ 0 이면 작동 불가 (graph-integrity-validator 가 선행 의무 — release-readiness #15).
//
// Kahn 알고리즘 — in-degree 0 노드부터 큐 처리. 결정성 보장 위해 id 알파벳 순서 tie-break.
//
// 적용 범위: hard 엣지만 따라간다 (자동 cascade 의 의미상 hard chain 만 안전 전파).
//   결정 4 의 BFS attenuation 표 (soft 2-hop ignore) 와 일관.
//
// 운영 plan: dep-graph/operation.md 결정 8 (Phase 3 도입), 결정 5 (자동 cascade 활성 전제).

const HARD_EDGE_TYPES = new Set(['derived_from', 'implements', 'tests', 'depends_on']);

/**
 * @param {Object} graph              artifact-graph.json { nodes, edges }
 * @param {Object} [opts]
 * @param {string[]} [opts.nonTraversableStates=['propose']]  topological sort 에서 제외할 state
 * @param {Set<string>} [opts.edgeTypes]  포함할 edge_type 집합 (default = hard 4종)
 * @returns {{ order: string[], remaining: string[], has_cycle: boolean }}
 */
export function topologicalOrder(graph, opts = {}) {
  const nonTraversable = new Set(opts.nonTraversableStates ?? ['propose']);
  const edgeTypes = opts.edgeTypes ?? HARD_EDGE_TYPES;

  // 활성 노드만 수집 (traverse 불가 state 제외)
  const nodes = (graph?.nodes ?? []).filter(n => n && typeof n.id === 'string' && !nonTraversable.has(n.state));
  const nodeSet = new Set(nodes.map(n => n.id));

  // in-degree + adjacency (활성 노드 간 + edgeTypes 만)
  const indeg = new Map();
  const adj = new Map();
  for (const id of nodeSet) {
    indeg.set(id, 0);
    adj.set(id, []);
  }
  for (const e of graph?.edges ?? []) {
    if (!nodeSet.has(e.source) || !nodeSet.has(e.target)) continue;
    if (!edgeTypes.has(e.edge_type)) continue;
    adj.get(e.source).push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }

  // Kahn — id 정렬 priority queue (결정성)
  const order = [];
  let ready = [...nodeSet].filter(id => indeg.get(id) === 0).sort();
  while (ready.length > 0) {
    const id = ready.shift();
    order.push(id);
    for (const next of adj.get(id) ?? []) {
      const d = indeg.get(next) - 1;
      indeg.set(next, d);
      if (d === 0) {
        // sorted insert
        let i = 0;
        while (i < ready.length && ready[i] < next) i++;
        ready.splice(i, 0, next);
      }
    }
  }

  const remaining = [...nodeSet].filter(id => indeg.get(id) > 0);
  return {
    order,
    remaining,
    has_cycle: remaining.length > 0,
  };
}

/**
 * BFS 영향 분석 결과 + topological order → cascade 처리 순서 결정.
 * impact 의 forward (변경 origin → 하류) 영향 노드들을 topological order 로 정렬.
 * @param {string[]} affectedIds  영향 받은 노드 id (BFS forward 결과)
 * @param {string[]} topoOrder    topologicalOrder.order
 * @returns {string[]}             topological order 기준으로 정렬된 affectedIds
 */
export function cascadeOrder(affectedIds, topoOrder) {
  const set = new Set(affectedIds);
  const rank = new Map(topoOrder.map((id, i) => [id, i]));
  return [...set].sort((a, b) => {
    const ra = rank.get(a) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b) ?? Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

// === 카탈로그 export ===
export const HARD_EDGES_DEFAULT = Object.freeze([...HARD_EDGE_TYPES]);

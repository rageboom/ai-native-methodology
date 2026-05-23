// impact-analyzer.js
// ★ operation.md 결정 4 — confidence-aware BFS (영향 등급 MUST/SHOULD/FYI/ignore)
// ★ operation.md 결정 8 — P1 알고리즘 BFS (state machine 상호작용: propose 노드 제외)
//
// 알고리즘:
//   Step 1 — 변경 origin 에서 BFS, 첫 hop 의 엣지 종류로 base 등급 결정
//     hard (derived_from/implements/tests/depends_on) → MUST
//     soft cross_reference → SHOULD
//     soft informs → FYI
//     soft 2-hop 이상 → ignore (Step 2 가 hard chain 만 follow)
//   Step 2 — base 등급에서 hard chain 을 더 따라가면 한 단계씩 감쇠
//     MUST → MUST (감쇠 없음, hard 는 끝까지)
//     SHOULD → FYI (1-hop 더) → ignore (2-hop 더)
//     FYI → ignore (1-hop 더)
//
// 방향: forward(origin→하류) + backward(origin←상류) 양방향 (결정 4 적용 전제).
// 노드 상태: active/drift 만 traverse. propose 는 BFS 대상에서 제외 (결정 8 상호작용).

const HARD_EDGES = new Set(['derived_from', 'implements', 'tests', 'depends_on']);
const SOFT_EDGES = new Set(['cross_reference', 'informs']);

// 등급 우선순위 (multi-path 시 max 채택)
const GRADE_RANK = Object.freeze({ ignore: 0, FYI: 1, SHOULD: 2, MUST: 3 });

// 첫 hop 엣지 종류 → base 등급 (default).
// propagation-policy.yaml 로 override 가능 (operation.md 결정 4 끝 노트).
const DEFAULT_BASE_GRADE_MAP = Object.freeze({
  derived_from: 'MUST',
  implements: 'MUST',
  tests: 'MUST',
  depends_on: 'MUST',
  cross_reference: 'SHOULD',
  informs: 'FYI',
});

// code-pointer-only patch backward 규칙 (결정 5 보조 — 본문 무변경일 때 backward 한 단계 보수적)
//   implements 1-hop (IMPL→TC) → SHOULD
//   그 뒤 hard 1-hop (TC→BHV) → FYI
//   그 이상 → ignore
const CODE_POINTER_ONLY_BASE_MAP = Object.freeze({
  derived_from: 'SHOULD',
  implements: 'SHOULD',
  tests: 'SHOULD',
  depends_on: 'SHOULD',
  // soft edge 는 본문 변경이 아닌 patch 시 의미 없음 (origin = code-pointer 자체)
});

function baseGradeFor(edgeType, overrides = {}) {
  const map = { ...DEFAULT_BASE_GRADE_MAP, ...overrides };
  return map[edgeType] ?? null;
}

// base + 추가 hard hop 수 → 최종 등급
export function attenuate(base, additionalHardHops) {
  if (base === 'MUST') return 'MUST'; // 감쇠 없음
  if (base === 'SHOULD') {
    if (additionalHardHops === 0) return 'SHOULD';
    if (additionalHardHops === 1) return 'FYI';
    return 'ignore';
  }
  if (base === 'FYI') {
    if (additionalHardHops === 0) return 'FYI';
    return 'ignore';
  }
  return 'ignore';
}

// === 그래프 인덱스 ===

function buildIndex(graph) {
  const nodesById = new Map();
  for (const n of graph.nodes ?? []) {
    if (!n || typeof n.id !== 'string') continue;
    nodesById.set(n.id, n);
  }

  // forward[source] = [{ otherId: target, edge_type, confidence }]
  // backward[target] = [{ otherId: source, edge_type, confidence }]
  const forward = new Map();
  const backward = new Map();
  for (const id of nodesById.keys()) {
    forward.set(id, []);
    backward.set(id, []);
  }
  for (const e of graph.edges ?? []) {
    if (!nodesById.has(e.source) || !nodesById.has(e.target)) continue; // dangling
    forward.get(e.source).push({
      otherId: e.target, edge_type: e.edge_type, confidence: e.confidence,
    });
    backward.get(e.target).push({
      otherId: e.source, edge_type: e.edge_type, confidence: e.confidence,
    });
  }
  return { nodesById, forward, backward };
}

// === 한 방향 BFS ===

function bfsOneDirection({ originId, adjacency, nodesById, baseOverrides, nonTraversableStates }) {
  const result = new Map(); // nodeId → { grade, base, additional_hard_hops, first_hop_edge_type }
  const queue = [];

  // 첫 hop (Step 1)
  for (const edge of adjacency.get(originId) ?? []) {
    if (edge.otherId === originId) continue; // self-loop 안전
    const node = nodesById.get(edge.otherId);
    if (!node) continue;
    if (nonTraversableStates.has(node.state)) continue;

    const base = baseGradeFor(edge.edge_type, baseOverrides);
    if (!base) continue; // 미지 edge_type → 무시 (graph-integrity-validator 가 별도 잡음)
    const grade = attenuate(base, 0);
    if (grade === 'ignore') continue;

    const existing = result.get(edge.otherId);
    if (!existing || GRADE_RANK[grade] > GRADE_RANK[existing.grade]) {
      result.set(edge.otherId, {
        grade, base, additional_hard_hops: 0,
        first_hop_edge_type: edge.edge_type,
      });
      queue.push({ id: edge.otherId, base, addHops: 0 });
    }
  }

  // 후속 hop (Step 2 — hard chain 만 follow, 한 단계씩 감쇠)
  while (queue.length > 0) {
    const { id, base, addHops } = queue.shift();
    // MUST 는 무한 감쇠 없음 / SHOULD 는 addHops < 1 일 때만 더 진행 의미 있음 / FYI 는 addHops < 0 = 즉 첫 hop 이후 ignore
    if (attenuate(base, addHops + 1) === 'ignore') continue;

    for (const edge of adjacency.get(id) ?? []) {
      if (edge.confidence !== 'hard') continue; // soft 2-hop 이상 = ignore
      if (edge.otherId === originId) continue;
      const node = nodesById.get(edge.otherId);
      if (!node) continue;
      if (nonTraversableStates.has(node.state)) continue;

      const newAddHops = addHops + 1;
      const newGrade = attenuate(base, newAddHops);
      if (newGrade === 'ignore') continue;

      const existing = result.get(edge.otherId);
      if (!existing || GRADE_RANK[newGrade] > GRADE_RANK[existing.grade]) {
        result.set(edge.otherId, {
          grade: newGrade, base, additional_hard_hops: newAddHops,
          first_hop_edge_type: result.get(id)?.first_hop_edge_type ?? edge.edge_type,
        });
        queue.push({ id: edge.otherId, base, addHops: newAddHops });
      }
    }
  }

  return result;
}

// === 메인 ===

/**
 * @param {Object} graph              artifact-graph.json { nodes, edges }
 * @param {string} originId           변경 origin 노드 id
 * @param {Object} [opts]
 * @param {boolean} [opts.codePointerOnly]  본문 무변경 / code-pointer 만 patch 시 (결정 5 보조 규칙)
 * @param {Object} [opts.baseGradeOverrides]  edge_type → grade 매핑 override (propagation-policy.yaml)
 * @param {string[]} [opts.nonTraversableStates=['propose']]  BFS skip 대상 state. 결정 8: propose 제외 기본.
 * @param {boolean} [opts.includeForward=true]
 * @param {boolean} [opts.includeBackward=true]
 * @returns {Object} { origin, forward, backward, merged, by_grade, stats }
 */
export function analyzeImpact(graph, originId, opts = {}) {
  const {
    codePointerOnly = false,
    baseGradeOverrides,
    nonTraversableStates = ['propose'],
    includeForward = true,
    includeBackward = true,
  } = opts;

  const { nodesById, forward, backward } = buildIndex(graph);
  if (!nodesById.has(originId)) {
    throw new Error(`impact-analyzer: origin '${originId}' not in graph`);
  }

  const nonTraversable = new Set(nonTraversableStates);
  // origin 의 state 가 propose 여도 BFS 시작은 가능 (단, propose 노드를 거치진 않음)
  const effectiveOverrides = codePointerOnly
    ? { ...CODE_POINTER_ONLY_BASE_MAP, ...(baseGradeOverrides ?? {}) }
    : (baseGradeOverrides ?? {});

  const forwardMap = includeForward
    ? bfsOneDirection({
        originId, adjacency: forward, nodesById,
        baseOverrides: effectiveOverrides, nonTraversableStates: nonTraversable,
      })
    : new Map();

  const backwardMap = includeBackward
    ? bfsOneDirection({
        originId, adjacency: backward, nodesById,
        baseOverrides: effectiveOverrides, nonTraversableStates: nonTraversable,
      })
    : new Map();

  // === forward + backward merge (max grade per node) ===
  const merged = new Map();
  function mergeIn(map, direction) {
    for (const [id, info] of map.entries()) {
      const existing = merged.get(id);
      if (!existing || GRADE_RANK[info.grade] > GRADE_RANK[existing.grade]) {
        merged.set(id, { ...info, direction });
      } else if (GRADE_RANK[info.grade] === GRADE_RANK[existing.grade] && existing.direction !== direction) {
        existing.direction = 'both';
      }
    }
  }
  mergeIn(forwardMap, 'forward');
  mergeIn(backwardMap, 'backward');

  // === 출력 형식 ===
  function toList(map) {
    return [...map.entries()].map(([id, info]) => ({ id, ...info }));
  }
  const mergedList = toList(merged);

  const by_grade = { MUST: [], SHOULD: [], FYI: [] };
  for (const entry of mergedList) {
    if (entry.grade in by_grade) by_grade[entry.grade].push(entry.id);
  }
  // 결정성 보장 — id 정렬
  for (const k of Object.keys(by_grade)) by_grade[k].sort();

  return {
    origin: originId,
    forward: toList(forwardMap),
    backward: toList(backwardMap),
    merged: mergedList,
    by_grade,
    stats: {
      forward_count: forwardMap.size,
      backward_count: backwardMap.size,
      merged_count: merged.size,
      by_grade_count: {
        MUST: by_grade.MUST.length,
        SHOULD: by_grade.SHOULD.length,
        FYI: by_grade.FYI.length,
      },
      code_pointer_only: codePointerOnly,
      non_traversable_states: [...nonTraversable],
    },
  };
}

// === 액션 매핑 (operation.md 결정 4 마지막 표) ===
export const GRADE_TO_ACTION = Object.freeze({
  MUST: 'sync 강제',
  SHOULD: '검토 권고',
  FYI: '알림만',
  ignore: '노출 X',
});

// === 카탈로그 export (graph-integrity-validator 와 정합 검증용) ===
export const EDGE_TYPE_CATALOG = Object.freeze({
  hard: [...HARD_EDGES],
  soft: [...SOFT_EDGES],
});

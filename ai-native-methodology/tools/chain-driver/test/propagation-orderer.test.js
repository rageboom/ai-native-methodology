// propagation-orderer.test.js
// ★ operation.md 결정 8 — Topological sort (Kahn / 결정성 보장 id 정렬).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { topologicalOrder, cascadeOrder, HARD_EDGES_DEFAULT } from '../src/propagation-orderer.js';

function node(id, state = 'active') {
  return { id, artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: `${id}.md`, state };
}
function edge(source, target, edge_type = 'derived_from') {
  const HARD = new Set(['derived_from', 'implements', 'tests', 'depends_on']);
  return { source, target, edge_type, confidence: HARD.has(edge_type) ? 'hard' : 'soft' };
}

// chain: UC → BHV → AC → TC → IMPL
const chainGraph = {
  nodes: [node('UC-1'), node('BHV-1'), node('AC-1'), node('TC-1'), node('IMPL-1')],
  edges: [
    edge('UC-1', 'BHV-1', 'derived_from'),
    edge('BHV-1', 'AC-1', 'derived_from'),
    edge('AC-1', 'TC-1', 'derived_from'),
    edge('TC-1', 'IMPL-1', 'tests'),
  ],
};

describe('topologicalOrder — Kahn 정확성', () => {
  it('chain 그래프 → 정확한 forward 순서', () => {
    const r = topologicalOrder(chainGraph);
    assert.deepEqual(r.order, ['UC-1', 'BHV-1', 'AC-1', 'TC-1', 'IMPL-1']);
    assert.equal(r.has_cycle, false);
    assert.equal(r.remaining.length, 0);
  });

  it('빈 그래프 → 빈 order, no cycle', () => {
    const r = topologicalOrder({ nodes: [], edges: [] });
    assert.deepEqual(r.order, []);
    assert.equal(r.has_cycle, false);
  });

  it('id 정렬 tie-break — 동일 in-degree 시 알파벳 순', () => {
    const g = {
      nodes: [node('C'), node('A'), node('B')],
      edges: [],
    };
    const r = topologicalOrder(g);
    assert.deepEqual(r.order, ['A', 'B', 'C']);
  });

  it('cycle 감지 — A↔B → has_cycle=true, remaining 있음', () => {
    const g = {
      nodes: [node('A'), node('B')],
      edges: [edge('A', 'B'), edge('B', 'A')],
    };
    const r = topologicalOrder(g);
    assert.equal(r.has_cycle, true);
    assert.equal(r.remaining.length, 2);
  });

  it('cycle 일부 + DAG 일부 → DAG 노드만 order, cycle 노드는 remaining', () => {
    // X → cycle(A↔B) → Y. X 는 진입 0 / Y 는 cycle 의존.
    const g = {
      nodes: [node('X'), node('A'), node('B'), node('Y')],
      edges: [
        edge('X', 'A'), edge('A', 'B'), edge('B', 'A'), edge('B', 'Y'),
      ],
    };
    const r = topologicalOrder(g);
    assert.ok(r.order.includes('X'));
    assert.equal(r.has_cycle, true);
    assert.ok(r.remaining.includes('A'));
    assert.ok(r.remaining.includes('B'));
  });

  it('soft 엣지는 default 에서 무시 (hard 만 cascade)', () => {
    const g = {
      nodes: [node('analysis-domain'), node('BHV-1')],
      edges: [edge('analysis-domain', 'BHV-1', 'cross_reference')],
    };
    const r = topologicalOrder(g);
    // soft 엣지는 무시되므로 둘 다 in-degree 0 → id 알파벳 순
    assert.deepEqual(r.order, ['BHV-1', 'analysis-domain']);
  });

  it('propose 노드는 traverse 제외 (operation.md 결정 8 상호작용)', () => {
    const g = {
      nodes: [node('UC-1'), node('BHV-1', 'propose'), node('AC-1')],
      edges: [edge('UC-1', 'BHV-1'), edge('BHV-1', 'AC-1')],
    };
    const r = topologicalOrder(g);
    assert.ok(!r.order.includes('BHV-1'), 'propose 노드 제외');
    // BHV-1 제거되면 UC-1 → 끝 / AC-1 도 in-degree 0
    assert.ok(r.order.includes('UC-1'));
    assert.ok(r.order.includes('AC-1'));
  });

  it('opts.edgeTypes 커스터마이즈 — soft 포함도 가능', () => {
    const g = {
      nodes: [node('A'), node('B')],
      edges: [edge('A', 'B', 'cross_reference')],
    };
    const r = topologicalOrder(g, { edgeTypes: new Set(['cross_reference']) });
    assert.deepEqual(r.order, ['A', 'B']);
  });

  it('dangling edge (target 없음) → 무시', () => {
    const g = {
      nodes: [node('A')],
      edges: [edge('A', 'GHOST')],
    };
    const r = topologicalOrder(g);
    assert.deepEqual(r.order, ['A']);
  });

  it('null/undefined 입력 방어', () => {
    assert.doesNotThrow(() => topologicalOrder({}));
    assert.doesNotThrow(() => topologicalOrder(null));
  });
});

describe('cascadeOrder — 영향 노드를 topological order 로 정렬', () => {
  it('BFS forward 결과를 chain forward 순서로 재정렬', () => {
    const topo = topologicalOrder(chainGraph).order;
    const affected = ['IMPL-1', 'AC-1', 'BHV-1', 'TC-1'];
    const ordered = cascadeOrder(affected, topo);
    assert.deepEqual(ordered, ['BHV-1', 'AC-1', 'TC-1', 'IMPL-1']);
  });

  it('topo order 에 없는 노드는 뒤로 + alphabetic tie-break', () => {
    const topo = ['A', 'B'];
    const affected = ['ZZ', 'A', 'B'];
    assert.deepEqual(cascadeOrder(affected, topo), ['A', 'B', 'ZZ']);
  });
});

describe('HARD_EDGES_DEFAULT — graph-synthesizer 와 일관 (operation.md 결정 1)', () => {
  it('hard 4 종', () => {
    assert.equal(HARD_EDGES_DEFAULT.length, 4);
    for (const t of ['derived_from', 'implements', 'tests', 'depends_on']) {
      assert.ok(HARD_EDGES_DEFAULT.includes(t));
    }
  });
});

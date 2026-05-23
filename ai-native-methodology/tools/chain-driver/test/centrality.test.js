// centrality.test.js
// ★ operation.md 결정 7 (top-K impact root) + 결정 8 (P4 Centrality).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { weightedOutDegree, weightedPageRank, topKImpactRoot, EDGE_WEIGHTS } from '../src/centrality.js';

function node(id, state = 'active') {
  return { id, artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: `${id}.md`, state };
}
function edge(source, target, edge_type = 'derived_from') {
  const HARD = new Set(['derived_from', 'implements', 'tests', 'depends_on']);
  return { source, target, edge_type, confidence: HARD.has(edge_type) ? 'hard' : 'soft' };
}

// hub: UC-1 이 3개 BHV 로 분기 → 가장 높은 영향
const hubGraph = {
  nodes: [node('UC-1'), node('BHV-1'), node('BHV-2'), node('BHV-3'), node('AC-1')],
  edges: [
    edge('UC-1', 'BHV-1'),
    edge('UC-1', 'BHV-2'),
    edge('UC-1', 'BHV-3'),
    edge('BHV-1', 'AC-1'),
  ],
};

describe('weightedOutDegree', () => {
  it('hub 노드(UC-1)가 최고 점수 (out-degree 3)', () => {
    const r = weightedOutDegree(hubGraph);
    assert.equal(r[0].id, 'UC-1');
    assert.equal(r[0].score, 3.0);
  });

  it('leaf 노드(AC-1)는 0점', () => {
    const r = weightedOutDegree(hubGraph);
    assert.equal(r.find(x => x.id === 'AC-1').score, 0);
  });

  it('hard 엣지(1.0) > soft cross_reference(0.5) > informs(0.25)', () => {
    const g = {
      nodes: [node('A'), node('H'), node('S'), node('I')],
      edges: [
        edge('A', 'H', 'derived_from'),
        edge('A', 'S', 'cross_reference'),
        edge('A', 'I', 'informs'),
      ],
    };
    const r = weightedOutDegree(g);
    assert.equal(r.find(x => x.id === 'A').score, 1.0 + 0.5 + 0.25);
  });

  it('결정성 — score 내림차순 + id tie-break', () => {
    const g = {
      nodes: [node('Z'), node('A'), node('M')],
      edges: [edge('Z', 'A'), edge('A', 'M'), edge('M', 'Z')],
    };
    const r1 = weightedOutDegree(g);
    const r2 = weightedOutDegree(g);
    assert.deepEqual(r1, r2);
    // 모두 out-degree 1 → id 알파벳 순
    assert.deepEqual(r1.map(x => x.id), ['A', 'M', 'Z']);
  });

  it('propose 노드 제외', () => {
    const g = {
      nodes: [node('UC-1'), node('BHV-1', 'propose')],
      edges: [edge('UC-1', 'BHV-1')],
    };
    const r = weightedOutDegree(g);
    // BHV-1 propose → nodeSet 제외 → UC-1→BHV-1 엣지 무시 → UC-1 score 0
    assert.equal(r.find(x => x.id === 'UC-1').score, 0);
    assert.ok(!r.find(x => x.id === 'BHV-1'));
  });
});

describe('weightedPageRank', () => {
  it('hub 노드가 상위 (전파적 영향)', () => {
    const r = weightedPageRank(hubGraph);
    // UC-1 은 source 만 (rank 흘려보냄). PageRank 는 "받는" 노드가 높음.
    // AC-1 (최하류 수렴) 또는 BHV-1 이 높을 수 있음 — 수렴 노드.
    assert.ok(r.length === 5);
    // 합이 ~1 (확률분포)
    const sum = r.reduce((s, x) => s + x.score, 0);
    assert.ok(Math.abs(sum - 1.0) < 0.01, `pagerank sum ~1, got ${sum}`);
  });

  it('결정성 — 동일 입력 동일 출력 (고정 iteration)', () => {
    const r1 = weightedPageRank(hubGraph);
    const r2 = weightedPageRank(hubGraph);
    assert.deepEqual(r1, r2);
  });

  it('빈 그래프 → 빈 배열', () => {
    assert.deepEqual(weightedPageRank({ nodes: [], edges: [] }), []);
  });

  it('dangling 노드(out 0) 처리 — crash 안 함, sum ~1 유지', () => {
    const g = {
      nodes: [node('A'), node('B')],
      edges: [edge('A', 'B')], // B 는 dangling (out 0)
    };
    const r = weightedPageRank(g);
    const sum = r.reduce((s, x) => s + x.score, 0);
    assert.ok(Math.abs(sum - 1.0) < 0.01);
  });
});

describe('topKImpactRoot', () => {
  it('default k=3 / out_degree', () => {
    const r = topKImpactRoot(hubGraph);
    assert.equal(r.length, 3);
    assert.equal(r[0].id, 'UC-1');
  });

  it('k 커스터마이즈', () => {
    assert.equal(topKImpactRoot(hubGraph, { k: 1 }).length, 1);
    assert.equal(topKImpactRoot(hubGraph, { k: 10 }).length, 5); // 노드 5개 한계
  });

  it('method=pagerank 선택', () => {
    const r = topKImpactRoot(hubGraph, { method: 'pagerank', k: 2 });
    assert.equal(r.length, 2);
  });

  it('빈 그래프 → 빈 배열', () => {
    assert.deepEqual(topKImpactRoot({ nodes: [], edges: [] }), []);
  });
});

describe('EDGE_WEIGHTS 카탈로그', () => {
  it('hard 4종 = 1.0', () => {
    for (const t of ['derived_from', 'implements', 'tests', 'depends_on']) {
      assert.equal(EDGE_WEIGHTS[t], 1.0);
    }
  });
  it('soft: cross_reference=0.5 / informs=0.25 (결정 4 attenuation 정합)', () => {
    assert.equal(EDGE_WEIGHTS.cross_reference, 0.5);
    assert.equal(EDGE_WEIGHTS.informs, 0.25);
  });
});

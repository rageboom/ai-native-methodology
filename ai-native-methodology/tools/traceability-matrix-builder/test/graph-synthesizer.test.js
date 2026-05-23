// graph-synthesizer.test.js
// ★ operation.md 결정 8 — P1 알고리즘 3종 중 state machine 풀세트 골든 테스트
// (BFS / DFS cycle 은 각 도구 test 에 별도)
//
// 검증 범위:
//   1. State machine — 4 state × 6 event 전이표 모두 (allowed/forbidden 양방향)
//   2. Edge confidence 일관성 (hard 4 / soft 2 / unknown error)
//   3. Tier-1 카탈로그 (24 = 5 chain + 15 analysis + 4 aspect)
//   4. Node 구성 (chain instance + analysis/aspect kind)
//   5. Edge 구성 — derived_from / tests / implements / cross_reference / informs
//   6. State carry-over (propose/deprecated 보존, source 제거 → deprecated)
//   7. Header (★ S5 정합) + stats

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  synthesizeGraph,
  transition,
  confidenceFor,
  NODE_STATES,
  TIER1_CATALOG,
} from '../src/graph-synthesizer.js';

// ============================================================================
// 1. State machine 전이표 골든 테스트 (operation.md 결정 1 노드 상태)
// ============================================================================

describe('state machine — 4-state transition table (operation.md 결정 1)', () => {
  it('exports 4 states in canonical order', () => {
    assert.deepEqual([...NODE_STATES], ['active', 'drift', 'propose', 'deprecated']);
  });

  describe('active', () => {
    it('content_changed → drift', () => {
      assert.equal(transition('active', 'content_changed'), 'drift');
    });
    it('deprecate_confirmed → deprecated', () => {
      assert.equal(transition('active', 'deprecate_confirmed'), 'deprecated');
    });
    it('rejects invalid event (user_accept)', () => {
      assert.throws(() => transition('active', 'user_accept'), /invalid from state 'active'/);
    });
  });

  describe('drift', () => {
    it('revalidated → active', () => {
      assert.equal(transition('drift', 'revalidated'), 'active');
    });
    it('deprecate_confirmed → deprecated', () => {
      assert.equal(transition('drift', 'deprecate_confirmed'), 'deprecated');
    });
    it('rejects invalid event (content_changed already)', () => {
      assert.throws(() => transition('drift', 'content_changed'), /invalid from state 'drift'/);
    });
  });

  describe('propose', () => {
    it('user_accept → active', () => {
      assert.equal(transition('propose', 'user_accept'), 'active');
    });
    it('user_reject → null (노드 삭제)', () => {
      assert.equal(transition('propose', 'user_reject'), null);
    });
    it('rejects invalid event (content_changed)', () => {
      assert.throws(() => transition('propose', 'content_changed'), /invalid from state 'propose'/);
    });
  });

  describe('deprecated', () => {
    it('purge → null (노드 삭제)', () => {
      assert.equal(transition('deprecated', 'purge'), null);
    });
    it('rejects invalid event (revalidated)', () => {
      assert.throws(() => transition('deprecated', 'revalidated'), /invalid from state 'deprecated'/);
    });
  });

  it('rejects unknown state', () => {
    assert.throws(() => transition('zombie', 'purge'), /unknown state 'zombie'/);
  });
});

// ============================================================================
// 2. Edge confidence (operation.md 결정 1 — hard 4 / soft 2)
// ============================================================================

describe('confidenceFor — edge_type ↔ confidence 일관성', () => {
  it('hard: derived_from / implements / tests / depends_on', () => {
    assert.equal(confidenceFor('derived_from'), 'hard');
    assert.equal(confidenceFor('implements'), 'hard');
    assert.equal(confidenceFor('tests'), 'hard');
    assert.equal(confidenceFor('depends_on'), 'hard');
  });
  it('soft: cross_reference / informs', () => {
    assert.equal(confidenceFor('cross_reference'), 'soft');
    assert.equal(confidenceFor('informs'), 'soft');
  });
  it('rejects unknown edge_type', () => {
    assert.throws(() => confidenceFor('mentions'), /unknown edge_type/);
  });
});

// ============================================================================
// 3. Tier-1 카탈로그 (24 = 5 + 15 + 4) — conventions.md §1 정수 표기 정합
// ============================================================================

describe('TIER1_CATALOG — 24 artifact (chain 5 + analysis 15 + aspect 4)', () => {
  it('total = 24 (정수, conventions.md §1)', () => {
    assert.equal(TIER1_CATALOG.total, 24);
  });
  it('chain subkinds = 5', () => {
    assert.deepEqual([...TIER1_CATALOG.chain], ['UC', 'BHV', 'AC', 'TC', 'IMPL']);
  });
  it('analysis subkinds = 15', () => {
    assert.equal(TIER1_CATALOG.analysis.length, 15);
  });
  it('aspect subkinds = 4 (a11y / i18n / static-security / legacy-spectrum)', () => {
    assert.deepEqual([...TIER1_CATALOG.aspect].sort(),
      ['a11y', 'i18n', 'legacy-spectrum', 'static-security']);
  });
});

// ============================================================================
// 4. Node 구성 + 5. Edge 구성 — 미니멀 chain 시나리오
// ============================================================================

const miniInput = {
  planning: { use_cases: [{ id: 'UC-USER-001', name: '회원가입' }] },
  behavior: {
    behaviors: [{
      id: 'BHV-USER-001',
      use_case_refs: ['UC-USER-001'],
      br_refs: ['BR-USER-DATA-001'],
    }],
  },
  acceptance: {
    criteria: [{
      id: 'AC-USER-001',
      behavior_ref: 'BHV-USER-001',
      related_brs: ['BR-USER-DATA-001'],
      related_aps: ['AP-USER-003'],
    }],
  },
  testSpec: { test_cases: [{ id: 'TC-USER-001', ac_ref: 'AC-USER-001' }] },
  implSpec: {
    modules: [{
      id: 'IMPL-USER-001',
      tc_refs: ['TC-USER-001'],
      bhv_refs: ['BHV-USER-001'],
      source_files: ['src/auth/signup.ts'],
      commit_hash: 'abc1234567890123456789012345678901234567',
    }],
  },
  analysis: {
    'business-rules': { meta: { title: 'BR' } },
    'antipatterns': { meta: { title: 'AP' } },
  },
  aspect: {
    'a11y': { meta: { title: 'A11y', related_chain_ids: ['BHV-USER-001'] } },
  },
  sourcePaths: {
    planning: 'planning-spec.json',
    behavior: 'behavior-spec.json',
    acceptance: 'acceptance-criteria.json',
    testSpec: 'test-spec.json',
    implSpec: 'impl-spec.json',
    analysis: {
      'business-rules': 'business-rules.json',
      'antipatterns': 'antipatterns.json',
    },
    aspect: { 'a11y': 'a11y-spec.json' },
  },
  scopeId: 'user-signup',
  commitHash: 'abc1234',
};

describe('synthesizeGraph — node/edge 구성', () => {
  it('empty input → empty graph (0 nodes / 0 edges, stats 정상)', () => {
    const g = synthesizeGraph({});
    assert.equal(g.nodes.length, 0);
    assert.equal(g.edges.length, 0);
    assert.equal(g.stats.node_count, 0);
    assert.equal(g.stats.by_state.active, 0);
  });

  it('mini chain: 5 chain instance 노드 (UC/BHV/AC/TC/IMPL)', () => {
    const g = synthesizeGraph(miniInput);
    const chainIds = g.nodes.filter(n => n.artifact_kind === 'chain').map(n => n.id).sort();
    assert.deepEqual(chainIds, [
      'AC-USER-001', 'BHV-USER-001', 'IMPL-USER-001', 'TC-USER-001', 'UC-USER-001',
    ]);
  });

  it('analysis 노드는 로드된 kind 만 (2 = business-rules + antipatterns)', () => {
    const g = synthesizeGraph(miniInput);
    const analysisIds = g.nodes.filter(n => n.artifact_kind === 'analysis').map(n => n.id).sort();
    assert.deepEqual(analysisIds, ['analysis-antipatterns', 'analysis-business-rules']);
  });

  it('aspect 노드는 로드된 kind 만 (1 = a11y)', () => {
    const g = synthesizeGraph(miniInput);
    const aspectIds = g.nodes.filter(n => n.artifact_kind === 'aspect').map(n => n.id);
    assert.deepEqual(aspectIds, ['aspect-a11y']);
  });

  it('모든 신규 노드는 state=active', () => {
    const g = synthesizeGraph(miniInput);
    assert.ok(g.nodes.every(n => n.state === 'active'));
  });

  it('chain forward 엣지: UC→BHV / BHV→AC / AC→TC (derived_from, hard)', () => {
    const g = synthesizeGraph(miniInput);
    const der = g.edges.filter(e => e.edge_type === 'derived_from');
    const pairs = der.map(e => `${e.source}->${e.target}`).sort();
    assert.deepEqual(pairs, [
      'AC-USER-001->TC-USER-001',
      'BHV-USER-001->AC-USER-001',
      'UC-USER-001->BHV-USER-001',
    ]);
    assert.ok(der.every(e => e.confidence === 'hard'));
  });

  it('TC→IMPL 엣지: tests (hard)', () => {
    const g = synthesizeGraph(miniInput);
    const tests = g.edges.filter(e => e.edge_type === 'tests');
    assert.equal(tests.length, 1);
    assert.equal(tests[0].source, 'TC-USER-001');
    assert.equal(tests[0].target, 'IMPL-USER-001');
    assert.equal(tests[0].confidence, 'hard');
  });

  it('IMPL→코드 엣지: implements (hard) + commit_hash 스탬프', () => {
    const g = synthesizeGraph(miniInput);
    const impls = g.edges.filter(e => e.edge_type === 'implements');
    assert.equal(impls.length, 1);
    assert.equal(impls[0].source, 'IMPL-USER-001');
    assert.equal(impls[0].target, 'src/auth/signup.ts');
    assert.equal(impls[0].confidence, 'hard');
    assert.ok(impls[0].commit_hash, 'commit_hash 스탬프 의무');
  });

  it('chain item 의 code_pointers_na=true → 노드에 평탄화 (P2 결정 3)', () => {
    const input = {
      planning: { use_cases: [{ id: 'UC-X', code_pointers_na: true }] },
    };
    const g = synthesizeGraph(input);
    const uc = g.nodes.find(n => n.id === 'UC-X');
    assert.equal(uc.code_pointers_na, true);
  });

  it('analysis/aspect 의 code_pointers_na=true → kind 노드에 평탄화 (P2 결정 3)', () => {
    const input = {
      analysis: { 'domain': { code_pointers_na: true } },
      aspect: { 'i18n': { code_pointers_na: true } },
    };
    const g = synthesizeGraph(input);
    assert.equal(g.nodes.find(n => n.id === 'analysis-domain').code_pointers_na, true);
    assert.equal(g.nodes.find(n => n.id === 'aspect-i18n').code_pointers_na, true);
  });

  it('chain item 의 code_pointers (frontmatter) → 노드 평탄화 (P2 결정 3 IMPL → 전 chain 확장)', () => {
    const input = {
      behavior: { behaviors: [{
        id: 'BHV-X',
        use_case_refs: [],
        code_pointers: [{ path: 'docs/bhv.md', anchor_type: 'doc_link' }],
      }] },
    };
    const g = synthesizeGraph(input);
    const bhv = g.nodes.find(n => n.id === 'BHV-X');
    assert.equal(bhv.code_pointers.length, 1);
    assert.equal(bhv.code_pointers[0].anchor_type, 'doc_link');
  });

  it('IMPL.source_files → code_pointers (strict_path) 평탄화', () => {
    const g = synthesizeGraph(miniInput);
    const impl = g.nodes.find(n => n.id === 'IMPL-USER-001');
    assert.ok(impl.code_pointers);
    assert.equal(impl.code_pointers[0].path, 'src/auth/signup.ts');
    assert.equal(impl.code_pointers[0].anchor_type, 'strict_path');
  });

  it('cross_reference 엣지 (analysis ↔ chain, soft) — BR→BHV/AC + AP→AC', () => {
    const g = synthesizeGraph(miniInput);
    const xrefs = g.edges.filter(e => e.edge_type === 'cross_reference');
    const pairs = xrefs.map(e => `${e.source}->${e.target}`).sort();
    assert.deepEqual(pairs, [
      'analysis-antipatterns->AC-USER-001',
      'analysis-business-rules->AC-USER-001',
      'analysis-business-rules->BHV-USER-001',
    ]);
    assert.ok(xrefs.every(e => e.confidence === 'soft'));
  });

  it('informs 엣지 (aspect → chain, soft) — a11y → BHV (meta.related_chain_ids)', () => {
    const g = synthesizeGraph(miniInput);
    const informs = g.edges.filter(e => e.edge_type === 'informs');
    assert.equal(informs.length, 1);
    assert.equal(informs[0].source, 'aspect-a11y');
    assert.equal(informs[0].target, 'BHV-USER-001');
    assert.equal(informs[0].confidence, 'soft');
  });

  it('analysis kind 미로드 시 cross_reference dangling 안 emit', () => {
    const inputNoAnalysis = { ...miniInput, analysis: {}, sourcePaths: { ...miniInput.sourcePaths, analysis: {} } };
    const g = synthesizeGraph(inputNoAnalysis);
    assert.equal(g.edges.filter(e => e.edge_type === 'cross_reference').length, 0);
  });

  it('aspect → chain target 부재 시 dangling 안 emit', () => {
    const input = {
      ...miniInput,
      aspect: { 'a11y': { meta: { related_chain_ids: ['BHV-MISSING-999'] } } },
    };
    const g = synthesizeGraph(input);
    assert.equal(g.edges.filter(e => e.edge_type === 'informs').length, 0);
  });

  it('scope_id / commit_hash 스탬프 — code-pointer commit 우선 보존', () => {
    const g = synthesizeGraph(miniInput);
    assert.ok(g.nodes.every(n => n.scope_id === 'user-signup'));
    assert.ok(g.nodes.every(n => n.commit_hash === 'abc1234'));
    // 모든 엣지는 commit_hash 가 있어야 함 (IMPL→code 는 ptr.commit_hash 우선이므로 다른 값 가능)
    assert.ok(g.edges.every(e => typeof e.commit_hash === 'string' && e.commit_hash.length >= 7));
    // chain forward / tests / cross_reference / informs 는 input commitHash 로 스탬프
    const nonImpl = g.edges.filter(e => e.edge_type !== 'implements');
    assert.ok(nonImpl.every(e => e.commit_hash === 'abc1234'));
    // implements 엣지는 IMPL.commit_hash (긴 SHA) 보존
    const implEdge = g.edges.find(e => e.edge_type === 'implements');
    assert.equal(implEdge.commit_hash, 'abc1234567890123456789012345678901234567');
    assert.equal(g.scope_id, 'user-signup');
    assert.equal(g.commit_hash, 'abc1234');
  });
});

// ============================================================================
// 6. State carry-over (previousGraph) — propose/deprecated 보존
// ============================================================================

describe('state carry-over from previousGraph', () => {
  it('이전 propose 노드 → 신규 합성에서도 propose 보존', () => {
    const previousGraph = {
      nodes: [{
        id: 'BHV-USER-001', artifact_kind: 'chain', artifact_subkind: 'BHV',
        source_path: 'behavior-spec.json', state: 'propose',
      }],
    };
    const g = synthesizeGraph({ ...miniInput, previousGraph });
    const bhv = g.nodes.find(n => n.id === 'BHV-USER-001');
    assert.equal(bhv.state, 'propose');
  });

  it('이전 deprecated 노드 → 신규에서도 deprecated', () => {
    const previousGraph = {
      nodes: [{
        id: 'BHV-USER-001', artifact_kind: 'chain', artifact_subkind: 'BHV',
        source_path: 'behavior-spec.json', state: 'deprecated',
      }],
    };
    const g = synthesizeGraph({ ...miniInput, previousGraph });
    const bhv = g.nodes.find(n => n.id === 'BHV-USER-001');
    assert.equal(bhv.state, 'deprecated');
  });

  it('이전 drift 노드 → 신규에서 active 로 reset (drift 는 외부 hook 재계산)', () => {
    const previousGraph = {
      nodes: [{
        id: 'BHV-USER-001', artifact_kind: 'chain', artifact_subkind: 'BHV',
        source_path: 'behavior-spec.json', state: 'drift',
      }],
    };
    const g = synthesizeGraph({ ...miniInput, previousGraph });
    const bhv = g.nodes.find(n => n.id === 'BHV-USER-001');
    assert.equal(bhv.state, 'active', 'drift 는 외부 hook 이 재부여하므로 reset');
  });

  it('이전엔 있었으나 이번 입력에 없는 노드 → deprecated 로 보존 + drift_reason', () => {
    const previousGraph = {
      nodes: [{
        id: 'BHV-USER-999', artifact_kind: 'chain', artifact_subkind: 'BHV',
        source_path: 'behavior-spec.json', state: 'active',
      }],
    };
    const g = synthesizeGraph({ ...miniInput, previousGraph });
    const removed = g.nodes.find(n => n.id === 'BHV-USER-999');
    assert.ok(removed, '제거된 노드는 그래프에 deprecated 로 남아야 함');
    assert.equal(removed.state, 'deprecated');
    assert.equal(removed.drift_reason, 'source removed');
  });

  it('이전에 이미 deprecated 였던 노드는 drift_reason 새로 덮어쓰지 않음', () => {
    const previousGraph = {
      nodes: [{
        id: 'BHV-USER-999', artifact_kind: 'chain', artifact_subkind: 'BHV',
        source_path: 'behavior-spec.json', state: 'deprecated',
        drift_reason: 'manual deprecate confirmed',
      }],
    };
    const g = synthesizeGraph({ ...miniInput, previousGraph });
    const old = g.nodes.find(n => n.id === 'BHV-USER-999');
    assert.equal(old.state, 'deprecated');
    assert.equal(old.drift_reason, 'manual deprecate confirmed');
  });
});

// ============================================================================
// 7. Header (★ S5 정합) + stats
// ============================================================================

describe('header + stats (★ S5 derived_from / do_not_edit_manually)', () => {
  it('header: do_not_edit_manually=true + schema refs', () => {
    const g = synthesizeGraph(miniInput);
    assert.equal(g.do_not_edit_manually, true);
    assert.equal(g.schema.node, 'artifact-graph-node.schema.json');
    assert.equal(g.schema.edge, 'artifact-graph-edge.schema.json');
  });

  it('derived_from 에 모든 입력 source 포함', () => {
    const g = synthesizeGraph(miniInput);
    for (const expected of [
      'planning-spec.json', 'behavior-spec.json', 'acceptance-criteria.json',
      'test-spec.json', 'impl-spec.json',
      'business-rules.json', 'antipatterns.json', 'a11y-spec.json',
    ]) {
      assert.ok(g.derived_from.includes(expected), `derived_from must include ${expected}`);
    }
  });

  it('synthesized_at = ISO 8601', () => {
    const g = synthesizeGraph(miniInput);
    assert.match(g.synthesized_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('stats: by_kind / by_state / by_edge_type 정합', () => {
    const g = synthesizeGraph(miniInput);
    assert.equal(g.stats.node_count, g.nodes.length);
    assert.equal(g.stats.edge_count, g.edges.length);
    assert.equal(g.stats.by_kind.chain, 5);
    assert.equal(g.stats.by_kind.analysis, 2);
    assert.equal(g.stats.by_kind.aspect, 1);
    assert.equal(g.stats.by_state.active, 8);
    assert.equal(g.stats.by_edge_type.derived_from, 3);
    assert.equal(g.stats.by_edge_type.tests, 1);
    assert.equal(g.stats.by_edge_type.implements, 1);
    assert.equal(g.stats.by_edge_type.cross_reference, 3);
    assert.equal(g.stats.by_edge_type.informs, 1);
    assert.equal(g.stats.by_edge_type.depends_on, 0);
  });
});

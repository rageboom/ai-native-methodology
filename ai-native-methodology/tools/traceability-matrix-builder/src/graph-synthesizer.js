// graph-synthesizer.js
// 24 Tier-1 artifact (chain 5 + analysis 15 + aspect 4) → artifact-graph.json
// ★ state machine 내장 (active/drift/propose/deprecated transition table)
// ★ S5 정합: derived_from + do_not_edit_manually:true (matrix-builder header 규약 따름)
//
// 운영 plan: dep-graph/operation.md
//   - 결정 1: 2-tier 노드 + confidence 엣지 + 4-state
//   - 결정 8: P1 알고리즘 3종 중 state machine 부분(BFS·DFS cycle 은 별도 모듈)
// schemas: artifact-graph-node.schema.json + artifact-graph-edge.schema.json + code-pointer.schema.json

import { readFileSync, existsSync } from 'node:fs';

// ============================================================================
// State machine (결정 1) — 4 state × event 전이표
// 외부 도구가 event 트리거:
//   - SessionStart drift 감지 → 'content_changed'
//   - 결정 5 정책 hook → 'deprecate_confirmed' / 'user_accept' / 'user_reject'
//   - release-readiness 통과 → 'revalidated'
// ============================================================================

export const NODE_STATES = Object.freeze(['active', 'drift', 'propose', 'deprecated']);

// TRANSITIONS[state][event] = nextState | null (null = 노드 삭제)
const TRANSITIONS = Object.freeze({
  active: Object.freeze({
    content_changed: 'drift',
    deprecate_confirmed: 'deprecated',
  }),
  drift: Object.freeze({
    revalidated: 'active',
    deprecate_confirmed: 'deprecated',
  }),
  propose: Object.freeze({
    user_accept: 'active',
    user_reject: null,
  }),
  deprecated: Object.freeze({
    purge: null,
  }),
});

export function transition(currentState, event) {
  if (!TRANSITIONS[currentState]) {
    throw new Error(`state-machine: unknown state '${currentState}'`);
  }
  if (!(event in TRANSITIONS[currentState])) {
    throw new Error(`state-machine: event '${event}' invalid from state '${currentState}'`);
  }
  return TRANSITIONS[currentState][event];
}

// ============================================================================
// Edge confidence (결정 1) — hard 4종 / soft 2종
// graph-integrity-validator 가 edge_type ↔ confidence 일관성 검증 (불일치 = fail)
// ============================================================================

const HARD_EDGE_TYPES = new Set(['derived_from', 'implements', 'tests', 'depends_on']);
const SOFT_EDGE_TYPES = new Set(['cross_reference', 'informs']);

export function confidenceFor(edgeType) {
  if (HARD_EDGE_TYPES.has(edgeType)) return 'hard';
  if (SOFT_EDGE_TYPES.has(edgeType)) return 'soft';
  throw new Error(`unknown edge_type: '${edgeType}'`);
}

// ============================================================================
// Tier-1 카탈로그 (24 = 5 + 15 + 4)
// methodology-spec/deliverables/1~24 와 1:1 (22-traceability-matrix 는 derived 산출물이므로 제외)
// ============================================================================

const CHAIN_SUBKINDS = Object.freeze(['UC', 'BHV', 'AC', 'TC', 'IMPL']);

const ANALYSIS_SUBKINDS = Object.freeze([
  'architecture', 'domain', 'api', 'db-schema', 'formal-spec',
  'business-rules', 'antipatterns', 'ui-ux', 'state-map', 'visual-manifest',
  'form-validation-spec', 'type-spec', 'error-mapping-spec',
  'characterization-spec', 'sql-inventory',
]);

const ASPECT_SUBKINDS = Object.freeze([
  'a11y', 'i18n', 'static-security', 'legacy-spectrum',
]);

// chain 인스턴스가 참조하는 analysis kind 매핑.
// "chain artifact 의 어떤 필드가 어느 analysis kind 를 가리키는가" 의 권위 표.
// 새 필드 발견 시 본 표만 갱신 (drift 재발 방지 — conventions §9 기계적 동작).
const CHAIN_TO_ANALYSIS_REFS = Object.freeze({
  BHV: { br_refs: 'business-rules' },
  AC: { related_brs: 'business-rules', related_aps: 'antipatterns' },
});

// ============================================================================
// Node 헬퍼
// ============================================================================

function chainNodeFromItem(item, subkind, source_path) {
  const node = {
    id: item.id,
    artifact_kind: 'chain',
    artifact_subkind: subkind,
    source_path,
    state: 'active',
  };
  const title = item.name ?? item.description;
  if (title) node.title = title;
  if (Array.isArray(item.code_pointers) && item.code_pointers.length > 0) {
    node.code_pointers = item.code_pointers;
  }
  if (item.code_pointers_na === true) {
    node.code_pointers_na = true;
  }
  return node;
}

function kindNode({ artifact_kind, subkind, source_path, title, data }) {
  const node = {
    id: `${artifact_kind}-${subkind}`,
    artifact_kind,
    artifact_subkind: subkind,
    source_path,
    state: 'active',
  };
  if (title) node.title = title;
  if (Array.isArray(data?.code_pointers) && data.code_pointers.length > 0) {
    node.code_pointers = data.code_pointers;
  }
  if (data?.code_pointers_na === true) {
    node.code_pointers_na = true;
  }
  return node;
}

// IMPL.source_files (string[]) → code_pointers (strict_path) 평탄화.
// frontmatter 가 본격 도입되면(P2) impl.code_pointers 를 우선 사용하고 source_files fallback.
function implCodePointers(impl) {
  if (Array.isArray(impl.code_pointers) && impl.code_pointers.length > 0) {
    return impl.code_pointers;
  }
  return (impl.source_files ?? []).map(p => {
    const ptr = { path: p, anchor_type: 'strict_path' };
    if (impl.commit_hash) ptr.commit_hash = impl.commit_hash;
    return ptr;
  });
}

// ============================================================================
// Edge 헬퍼
// ============================================================================

function makeEdge(source, target, edge_type, extra = {}) {
  return {
    source,
    target,
    edge_type,
    confidence: confidenceFor(edge_type),
    ...extra,
  };
}

// ============================================================================
// 메인 합성 함수
// ============================================================================

/**
 * @param {Object} input
 * @param {Object|null} input.planning      planning-spec.json (use_cases[])
 * @param {Object|null} input.behavior      behavior-spec.json (behaviors[])
 * @param {Object|null} input.acceptance    acceptance-criteria.json (criteria[])
 * @param {Object|null} input.testSpec      test-spec.json (test_cases[])
 * @param {Object|null} input.implSpec      impl-spec.json (modules[])
 * @param {Object} [input.analysis]         { [kind]: json } — ANALYSIS_SUBKINDS 중
 * @param {Object} [input.aspect]           { [kind]: json } — ASPECT_SUBKINDS 중
 * @param {Object} [input.sourcePaths]      { planning, behavior, acceptance, testSpec, implSpec, analysis:{[k]:p}, aspect:{[k]:p} }
 * @param {Object|null} [input.previousGraph]  이전 artifact-graph.json (state carry-over 용)
 * @param {string} [input.scopeId]
 * @param {string} [input.commitHash]
 * @returns {Object} artifact-graph (nodes/edges/stats + header)
 */
export function synthesizeGraph(input) {
  const {
    planning = null,
    behavior = null,
    acceptance = null,
    testSpec = null,
    implSpec = null,
    analysis = {},
    aspect = {},
    sourcePaths = {},
    previousGraph = null,
    scopeId,
    commitHash,
  } = input;

  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  function pushNode(node) {
    if (nodeIds.has(node.id)) return; // 중복 ingest 방어
    nodes.push(node);
    nodeIds.add(node.id);
  }

  // --- chain instance 노드 + chain forward 엣지 ---
  for (const uc of planning?.use_cases ?? []) {
    pushNode(chainNodeFromItem(uc, 'UC', sourcePaths.planning ?? '(planning)'));
  }
  for (const b of behavior?.behaviors ?? []) {
    pushNode(chainNodeFromItem(b, 'BHV', sourcePaths.behavior ?? '(behavior)'));
    for (const ucRef of b.use_case_refs ?? []) {
      edges.push(makeEdge(ucRef, b.id, 'derived_from'));
    }
  }
  for (const ac of acceptance?.criteria ?? []) {
    pushNode(chainNodeFromItem(ac, 'AC', sourcePaths.acceptance ?? '(acceptance)'));
    if (ac.behavior_ref) {
      edges.push(makeEdge(ac.behavior_ref, ac.id, 'derived_from'));
    }
  }
  for (const tc of testSpec?.test_cases ?? []) {
    const tcNode = chainNodeFromItem(tc, 'TC', sourcePaths.testSpec ?? '(testSpec)');
    // TC.source_file (단수, 실 test 코드) → code_pointers (strict_path) 평탄화. IMPL.source_files 와 정합.
    // frontmatter code_pointers 가 이미 있으면 그것을 우선 (chainNodeFromItem 이 처리).
    if (!tcNode.code_pointers && tc.source_file) {
      const ptr = { path: tc.source_file, anchor_type: 'strict_path' };
      tcNode.code_pointers = [ptr];
    }
    pushNode(tcNode);
    if (tc.ac_ref) {
      edges.push(makeEdge(tc.ac_ref, tc.id, 'derived_from'));
    }
  }
  for (const impl of implSpec?.modules ?? []) {
    const implNode = chainNodeFromItem(impl, 'IMPL', sourcePaths.implSpec ?? '(implSpec)');
    const pointers = implCodePointers(impl);
    if (pointers.length > 0) implNode.code_pointers = pointers;
    pushNode(implNode);
    // TC → IMPL: tests (TC 가 IMPL 동작을 검증)
    for (const tcRef of impl.tc_refs ?? []) {
      edges.push(makeEdge(tcRef, impl.id, 'tests'));
    }
    // IMPL → 코드 파일: implements (hard, Tier-2 leaf 이므로 노드 추가 안 함)
    for (const ptr of pointers) {
      const extra = {};
      if (ptr.commit_hash) extra.commit_hash = ptr.commit_hash;
      edges.push(makeEdge(impl.id, ptr.path, 'implements', extra));
    }
  }

  // --- analysis kind 노드 (15) ---
  const analysisLoaded = new Set();
  for (const subkind of ANALYSIS_SUBKINDS) {
    const data = analysis[subkind];
    if (!data) continue;
    pushNode(kindNode({
      artifact_kind: 'analysis',
      subkind,
      source_path: sourcePaths.analysis?.[subkind] ?? `(analysis-${subkind})`,
      title: data.meta?.title ?? data.title,
      data,
    }));
    analysisLoaded.add(subkind);
  }

  // --- aspect kind 노드 (4) ---
  for (const subkind of ASPECT_SUBKINDS) {
    const data = aspect[subkind];
    if (!data) continue;
    pushNode(kindNode({
      artifact_kind: 'aspect',
      subkind,
      source_path: sourcePaths.aspect?.[subkind] ?? `(aspect-${subkind})`,
      title: data.meta?.title ?? data.title,
      data,
    }));
  }

  // --- cross_reference (soft, analysis ↔ chain) ---
  // chain artifact 내부 ref 필드가 가리키는 analysis kind 매핑 표(CHAIN_TO_ANALYSIS_REFS)에 따라 자동 도출.
  // 양 끝 노드가 모두 로드돼 있을 때만 emit (dangling 방지).
  function emitAnalysisCrossRefs(items, subkind) {
    const refMap = CHAIN_TO_ANALYSIS_REFS[subkind];
    if (!refMap) return;
    for (const item of items ?? []) {
      for (const [field, analysisKind] of Object.entries(refMap)) {
        if (!analysisLoaded.has(analysisKind)) continue;
        for (const _ref of item[field] ?? []) {
          // analysis kind 노드 → 개별 chain instance: 본문 변경 시 chain 으로 SHOULD 전파
          edges.push(makeEdge(`analysis-${analysisKind}`, item.id, 'cross_reference'));
        }
      }
    }
  }
  emitAnalysisCrossRefs(behavior?.behaviors, 'BHV');
  emitAnalysisCrossRefs(acceptance?.criteria, 'AC');

  // --- informs (soft, aspect → chain) ---
  // aspect 산출물이 어떤 chain 노드에 권고를 거는지의 명시적 schema 필드가 아직 없음.
  // P1 1차 cut: aspect.meta.related_chain_ids[] 가 있으면 사용, 없으면 emit 안 함.
  // P2 이후: aspect schema 에 명시 필드 신설 시 본 분기 갱신.
  for (const subkind of ASPECT_SUBKINDS) {
    const data = aspect[subkind];
    if (!data) continue;
    for (const target of data.meta?.related_chain_ids ?? []) {
      if (!nodeIds.has(target)) continue;
      edges.push(makeEdge(`aspect-${subkind}`, target, 'informs'));
    }
  }

  // --- state carry-over (previousGraph 기반) ---
  // propose / deprecated 는 외부 정책이 부여한 상태이므로 보존.
  // drift / active 는 매 합성마다 'active' 로 reset (drift 는 SessionStart hook 이 재부여).
  if (previousGraph?.nodes) {
    const prevById = new Map(previousGraph.nodes.map(n => [n.id, n]));
    for (const n of nodes) {
      const prev = prevById.get(n.id);
      if (!prev) continue;
      if (prev.state === 'propose' || prev.state === 'deprecated') {
        n.state = prev.state;
        if (prev.drift_reason) n.drift_reason = prev.drift_reason;
      }
    }
    // 이전 그래프에 있었으나 이번 입력에 없는 노드 = 삭제 후보. deprecated 로 보존(N step purge 는 외부 정책).
    for (const prev of previousGraph.nodes) {
      if (nodeIds.has(prev.id)) continue;
      if (prev.state === 'deprecated') {
        // 이미 deprecated 였다면 그대로 보존 (purge 외부 결정)
        pushNode({ ...prev });
      } else {
        pushNode({ ...prev, state: 'deprecated', drift_reason: 'source removed' });
      }
    }
  }

  // --- commit_hash / scope_id 스탬프 ---
  for (const n of nodes) {
    if (commitHash && !n.commit_hash) n.commit_hash = commitHash;
    if (scopeId && !n.scope_id) n.scope_id = scopeId;
  }
  for (const e of edges) {
    if (commitHash && !e.commit_hash) e.commit_hash = commitHash;
  }

  // --- 통계 ---
  const stats = {
    node_count: nodes.length,
    edge_count: edges.length,
    by_kind: {
      chain: nodes.filter(n => n.artifact_kind === 'chain').length,
      analysis: nodes.filter(n => n.artifact_kind === 'analysis').length,
      aspect: nodes.filter(n => n.artifact_kind === 'aspect').length,
    },
    by_state: Object.fromEntries(
      NODE_STATES.map(s => [s, nodes.filter(n => n.state === s).length])
    ),
    by_edge_type: ['derived_from', 'implements', 'tests', 'depends_on', 'cross_reference', 'informs']
      .reduce((acc, t) => {
        acc[t] = edges.filter(e => e.edge_type === t).length;
        return acc;
      }, {}),
  };

  // --- header (★ S5 정합) ---
  const derivedFromList = [];
  for (const key of ['planning', 'behavior', 'acceptance', 'testSpec', 'implSpec']) {
    if (sourcePaths[key]) derivedFromList.push(sourcePaths[key]);
  }
  for (const p of Object.values(sourcePaths.analysis ?? {})) if (p) derivedFromList.push(p);
  for (const p of Object.values(sourcePaths.aspect ?? {})) if (p) derivedFromList.push(p);

  const graph = {
    derived_from: derivedFromList,
    do_not_edit_manually: true,
    schema: {
      node: 'artifact-graph-node.schema.json',
      edge: 'artifact-graph-edge.schema.json',
    },
    synthesized_at: new Date().toISOString(),
    nodes,
    edges,
    stats,
  };
  if (scopeId) graph.scope_id = scopeId;
  if (commitHash) graph.commit_hash = commitHash;

  return graph;
}

// ============================================================================
// 입력 로드 헬퍼 (matrix-builder loadJson 정합)
// ============================================================================

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    throw new Error(`JSON parse error at ${path}: ${e.message}`);
  }
}

// 카탈로그 export — graph-integrity-validator / dep-graph-navigator 에서 재사용
export const TIER1_CATALOG = Object.freeze({
  chain: CHAIN_SUBKINDS,
  analysis: ANALYSIS_SUBKINDS,
  aspect: ASPECT_SUBKINDS,
  total: CHAIN_SUBKINDS.length + ANALYSIS_SUBKINDS.length + ASPECT_SUBKINDS.length, // = 24
});

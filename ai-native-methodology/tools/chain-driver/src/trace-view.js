// trace-view.js — ★ dep-graph 사람 gate-검토용 view-time 렌더러 (옵션 A+B / DEC-2026-06-03-dep-graph-trace-view).
//   artifact-graph.json → 사람-눈 Markdown (map 뷰 + UC→단계 coverage 매트릭스). chain-driver `trace-view` backend.
//
//   ★ 위치: navigate 는 "쿼리 단위(노드 하나)" — trace-view 는 "stage/feature 조망 + coverage hole" (사람 gate #1~#5 검토).
//   ★ LLM 절반 = YAGNI (navigate --stage --json + --with-spec 가 이미 holistic 구조 뷰 제공 / 실측). 본 렌더 = 사람-눈 전용.
//
//   ★ 신뢰 모델 (reference-lens / with-spec check31 동형):
//     - display-only — 출력은 어떤 결정적 gate(gate-eval / findings-aggregator / release-readiness)에도 inject ❌.
//     - 순수 formatter — 새 그래프 순회 0 (analyzeImpact / topKImpactRoot / graph.stats / checkGraphFreshness 재사용).
//     - stdout only — 파일 write 0 / git commit 0 (committed mirror = v12.0.0 가 죽인 .md/.mermaid drift-repeat = REJECT).
//     - view.reference_lens 항상 true.
//   ★ 정직 명명: '설계도/blueprint' ❌ — 그래프 내용 = 요구사항→구현 추적성 (시스템 아키텍처 아님 / 아키텍처 슬라이스 = analysis-architecture 노드뿐).
//   ★ false-health 가드: stale json 을 렌더하며 freshness 숨기면 0-drift 건강 오인 (poc-05 선례) → 배너 비협상.

import { analyzeImpact } from './impact-analyzer.js';
import { topKImpactRoot } from './centrality.js';
import { checkGraphFreshness } from '../../_shared/graph-freshness.js';

// UC = 매트릭스 행 root / 나머지 chain leaf = 열 (체인 순서). plan(EPIC/STORY/OP)·analysis·aspect = 비-체인 → 열 아님.
export const CHAIN_LEAF_COLUMNS = Object.freeze(['BHV', 'AC', 'TASK', 'TC', 'IMPL']);
const TRAVERSABLE = new Set(['active', 'drift']);

// id 에서 feature 토큰 추출 — `UC-USER-001` → `USER` / `AC-ARTICLE-002` → `ARTICLE`.
//   패턴 불일치(analysis-business-rules 등)는 '(misc)'. UC 행 그룹핑 전용 (결정론 substring / 추론 ❌).
export function extractFeature(id) {
  const m = /^[A-Za-z]+-(.+)-\d+$/.exec(id);
  return m ? m[1] : '(misc)';
}

// 순수 formatter — graph → 구조화 trace-view 객체. analyzeImpact 결정론 BFS 재사용 (새 순회 0).
export function buildTraceView(graph, opts = {}) {
  const {
    scope = null,
    includeMatrix = true,
    nonTraversableStates = ['propose'],
    baseGradeOverrides = undefined,
    graphName = null,
    repoRoot = process.cwd(),
  } = opts;

  const nodes = (graph.nodes ?? []).filter((n) => !scope || n.scope_id === scope);
  const subkindById = new Map(nodes.map((n) => [n.id, n.artifact_subkind]));
  const presentSubkinds = new Set(nodes.map((n) => n.artifact_subkind));

  const ucs = nodes
    .filter((n) => n.artifact_subkind === 'UC' && TRAVERSABLE.has(n.state))
    .sort((a, b) => a.id.localeCompare(b.id));

  const analyzeOpts = { includeBackward: false, nonTraversableStates, baseGradeOverrides };

  // UC 의 하류 도달 노드를 subkind 버킷으로 (forward = derived_from/tests/implements 하드 체인 → BHV/AC/TASK/TC/IMPL).
  function downstreamOf(ucId) {
    const buckets = { BHV: [], AC: [], TASK: [], TC: [], IMPL: [] };
    let imp;
    try { imp = analyzeImpact(graph, ucId, analyzeOpts); } catch { return buckets; }
    for (const f of imp.forward) {
      const sk = subkindById.get(f.id);
      if (sk && sk in buckets) buckets[sk].push(f.id);
    }
    for (const k of Object.keys(buckets)) buckets[k].sort();
    return buckets;
  }

  // map — feature 별 UC 그룹 + 하류 + coverage hole(그래프에 존재하는 stage 인데 도달 0).
  const byFeature = new Map();
  for (const uc of ucs) {
    const feat = extractFeature(uc.id);
    if (!byFeature.has(feat)) byFeature.set(feat, []);
    const downstream = downstreamOf(uc.id);
    const holes = CHAIN_LEAF_COLUMNS.filter((col) => presentSubkinds.has(col) && downstream[col].length === 0);
    byFeature.get(feat).push({ id: uc.id, state: uc.state, title: uc.title ?? null, downstream, holes });
  }
  const features = [...byFeature.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([feature, ucList]) => ({ feature, ucs: ucList }));

  // matrix — UC × chain leaf. ✓=도달 / ✗=미도달(stage 존재) / –=stage 부재(미생성).
  let coverage_matrix = null;
  if (includeMatrix) {
    const present_columns = CHAIN_LEAF_COLUMNS.filter((c) => presentSubkinds.has(c));
    const absent_columns = CHAIN_LEAF_COLUMNS.filter((c) => !presentSubkinds.has(c));
    const rows = features.flatMap((f) => f.ucs).map((uc) => {
      const cells = {};
      for (const col of CHAIN_LEAF_COLUMNS) {
        cells[col] = !presentSubkinds.has(col) ? '–' : (uc.downstream[col].length ? '✓' : '✗');
      }
      return { uc: uc.id, title: uc.title ?? null, cells };
    });
    coverage_matrix = {
      columns: CHAIN_LEAF_COLUMNS.slice(),
      present_columns,
      absent_columns,
      rows,
      // ★ §8.1 정직 표기 — UC→TC 는 RealWorld+ecommerce 2 실도메인 corroborate / IMPL 열은 ecommerce 1 실도메인뿐.
      impl_note: presentSubkinds.has('IMPL')
        ? 'IMPL 열 실 corroboration = ecommerce 1 실도메인 (RealWorld 등 IMPL 미생성 도메인 존재 — 정직 표기)'
        : null,
    };
  }

  const fresh = checkGraphFreshness(graph, { repoRoot });
  const top_impact_roots = topKImpactRoot(graph, { k: 3, nonTraversableStates });

  return {
    view: 'traceability-map',
    reference_lens: true, // ★ display-only — gate inject ❌.
    graph: graphName,
    scope,
    freshness: {
      stale: fresh.stale,
      synthesized_at: fresh.synthesized_at,
      stale_sources: fresh.stale_sources,
    },
    stats: graph.stats ?? null,
    features,
    coverage_matrix,
    top_impact_roots,
  };
}

// 구조화 trace-view → 사람-눈 Markdown (stdout). 결정론 (template string / 추론 0).
export function renderTraceViewMarkdown(view) {
  const L = [];

  if (view.freshness.stale) {
    const n = view.freshness.stale_sources.length;
    L.push(`> ⚠️ STALE — ${n} 개 source 가 synthesized_at(${view.freshness.synthesized_at ?? '?'}) 이후 변경. 본 뷰는 구식일 수 있음 / 재합성: \`chain-driver resync-graph\``);
    L.push('');
  }

  L.push(`# [traceability-map] ${view.graph ?? '(graph)'}`);
  L.push(`> 요구사항→구현 추적성 뷰 (UC→BHV→AC→TASK→TC→IMPL). **시스템 아키텍처 도면 아님** — 아키텍처 슬라이스는 analysis-architecture 노드뿐.`);
  L.push(`> reference-lens / display-only — gate 결정 inject ❌. synthesized: ${view.freshness.synthesized_at ?? '?'}${view.scope ? ` · scope=${view.scope}` : ''}`);
  L.push('');

  if (view.stats) {
    const s = view.stats;
    L.push(`## 요약`);
    L.push(`- ${s.node_count ?? '?'} nodes · ${s.edge_count ?? '?'} edges`);
    if (s.by_state) L.push(`- state: ${Object.entries(s.by_state).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
    if (s.by_kind) L.push(`- kind: ${Object.entries(s.by_kind).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
    L.push('');
  }

  L.push(`## 추적 맵 (feature별 UC→하류)`);
  if (view.features.length === 0) {
    L.push(`(UC 노드 없음 — discovery stage 미생성 또는 scope 필터로 비어 있음)`);
    L.push('');
  }
  for (const f of view.features) {
    L.push(`### ▼ ${f.feature}`);
    for (const uc of f.ucs) {
      const badge = uc.state === 'active' ? '' : ` \`[${uc.state}]\``;
      L.push(`- **${uc.id}**${badge}${uc.title ? ` — ${uc.title}` : ''}`);
      const chain = CHAIN_LEAF_COLUMNS
        .filter((c) => uc.downstream[c].length)
        .map((c) => `${c}: ${uc.downstream[c].join(', ')}`);
      if (chain.length) L.push(`  - ${chain.join(' | ')}`);
      if (uc.holes.length) L.push(`  - ⚠ hole: ${uc.holes.join(', ')} 도달 없음`);
    }
    L.push('');
  }

  if (view.coverage_matrix) {
    const m = view.coverage_matrix;
    L.push(`## Coverage 매트릭스 (UC → 단계 도달 / traceability hole 검토)`);
    L.push(`| UC | ${m.columns.join(' | ')} |`);
    L.push(`|----|${m.columns.map(() => '----').join('|')}|`);
    for (const r of m.rows) {
      L.push(`| ${r.uc} | ${m.columns.map((c) => r.cells[c]).join(' | ')} |`);
    }
    L.push('');
    L.push(`> \`✓\`=도달 / \`✗\`=미도달(stage 존재) / \`–\`=해당 stage 노드 부재(미생성).`);
    if (m.absent_columns.length) L.push(`> 부재 열: ${m.absent_columns.join(', ')}.`);
    if (m.impl_note) L.push(`> ${m.impl_note}`);
    L.push('');
  }

  L.push(`## top-3 impact root (graph-wide centrality)`);
  L.push(view.top_impact_roots.map((r) => `${r.id} (${r.score})`).join(' · ') || '(없음)');
  L.push('');

  return L.join('\n');
}

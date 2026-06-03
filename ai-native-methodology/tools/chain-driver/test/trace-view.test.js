// trace-view.test.js — ★ dep-graph 사람 gate-검토 렌더러 (옵션 A+B / DEC-2026-06-03-dep-graph-trace-view).
//   buildTraceView / renderTraceViewMarkdown 순수 단위 + real cli.js subprocess 통합 (no-simulation).
//   검증: feature 그룹핑 / coverage 매트릭스 셀(✓/✗/–) / coverage hole 탐지 / stale 배너(false-health 가드) /
//         --no-matrix / --json(reference_lens) / scope 필터 / graceful 오류.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, writeFileSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';

import { buildTraceView, renderTraceViewMarkdown, extractFeature, CHAIN_LEAF_COLUMNS } from '../src/trace-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

const HARD = 'hard';
function edge(source, target, edge_type = 'derived_from') {
  return { source, target, edge_type, confidence: HARD };
}
function node(id, artifact_subkind, extra = {}) {
  const kind = artifact_subkind === 'UC' || ['BHV', 'AC', 'TASK', 'TC', 'IMPL'].includes(artifact_subkind) ? 'chain' : 'analysis';
  return { id, artifact_kind: kind, artifact_subkind, source_path: `(${artifact_subkind})`, state: 'active', scope_id: 'test', ...extra };
}

// 합성 fixture — feature A = full chain(UC→BHV→AC→TASK→TC) / feature B = TASK 부재(coverage hole).
//   present subkinds = UC/BHV/AC/TASK/TC (IMPL 부재 → 열 '–').
function makeFixture(synthesizedAt = '2099-01-01T00:00:00.000Z', derivedFrom = []) {
  return {
    do_not_edit_manually: true,
    synthesized_at: synthesizedAt,
    derived_from: derivedFrom,
    nodes: [
      node('UC-A-001', 'UC', { title: '기능 A' }),
      node('BHV-A-001', 'BHV'), node('AC-A-001', 'AC'), node('TASK-A-001', 'TASK'), node('TC-A-001', 'TC'),
      node('UC-B-001', 'UC', { title: '기능 B (미완)' }),
      node('BHV-B-001', 'BHV'), node('AC-B-001', 'AC'),
    ],
    edges: [
      edge('UC-A-001', 'BHV-A-001'), edge('BHV-A-001', 'AC-A-001'),
      edge('AC-A-001', 'TASK-A-001'), edge('TASK-A-001', 'TC-A-001'),
      edge('UC-B-001', 'BHV-B-001'), edge('BHV-B-001', 'AC-B-001'),
    ],
    stats: {
      node_count: 8, edge_count: 6,
      by_kind: { chain: 8, plan: 0, analysis: 0, aspect: 0 },
      by_state: { active: 8, drift: 0, propose: 0, deprecated: 0 },
    },
  };
}

describe('trace-view — extractFeature', () => {
  it('chain id 에서 feature 토큰 추출', () => {
    assert.equal(extractFeature('UC-USER-001'), 'USER');
    assert.equal(extractFeature('AC-CAR-COST-002'), 'CAR-COST');
    assert.equal(extractFeature('TC-ARTICLE-009'), 'ARTICLE');
  });
  it('패턴 불일치(analysis 노드) = (misc)', () => {
    assert.equal(extractFeature('analysis-business-rules'), '(misc)');
  });
});

describe('trace-view — buildTraceView 구조', () => {
  const view = buildTraceView(makeFixture(), { graphName: 'fixture.json' });

  it('reference_lens 마커 = true (display-only)', () => {
    assert.equal(view.reference_lens, true);
    assert.equal(view.view, 'traceability-map');
  });

  it('feature 별 UC 그룹핑 (A, B 알파벳 정렬)', () => {
    assert.deepEqual(view.features.map((f) => f.feature), ['A', 'B']);
  });

  it('full chain UC = hole 없음 / downstream 버킷 채워짐', () => {
    const ucA = view.features.find((f) => f.feature === 'A').ucs[0];
    assert.equal(ucA.id, 'UC-A-001');
    assert.deepEqual(ucA.holes, []);
    assert.deepEqual(ucA.downstream.BHV, ['BHV-A-001']);
    assert.deepEqual(ucA.downstream.TC, ['TC-A-001']);
  });

  it('coverage hole 탐지 — TASK/TC 존재하나 UC-B 미도달', () => {
    const ucB = view.features.find((f) => f.feature === 'B').ucs[0];
    assert.equal(ucB.id, 'UC-B-001');
    assert.deepEqual(ucB.holes, ['TASK', 'TC']); // present 인데 도달 0 = hole
    assert.deepEqual(ucB.downstream.AC, ['AC-B-001']);
    assert.deepEqual(ucB.downstream.TASK, []);
  });

  it('coverage 매트릭스 셀 — ✓ 도달 / ✗ 미도달(stage 존재) / – stage 부재', () => {
    const rows = view.coverage_matrix.rows;
    const rowA = rows.find((r) => r.uc === 'UC-A-001');
    const rowB = rows.find((r) => r.uc === 'UC-B-001');
    assert.deepEqual(rowA.cells, { BHV: '✓', AC: '✓', TASK: '✓', TC: '✓', IMPL: '–' });
    assert.deepEqual(rowB.cells, { BHV: '✓', AC: '✓', TASK: '✗', TC: '✗', IMPL: '–' });
  });

  it('absent_columns = IMPL (그래프에 IMPL 노드 부재)', () => {
    assert.deepEqual(view.coverage_matrix.absent_columns, ['IMPL']);
    assert.equal(view.coverage_matrix.impl_note, null); // IMPL 부재 → note 없음
    assert.deepEqual(view.coverage_matrix.columns, CHAIN_LEAF_COLUMNS);
  });

  it('--no-matrix 동형 (includeMatrix:false) → coverage_matrix null', () => {
    const v2 = buildTraceView(makeFixture(), { includeMatrix: false });
    assert.equal(v2.coverage_matrix, null);
  });

  it('scope 필터 — 매칭 scope_id 만', () => {
    const v3 = buildTraceView(makeFixture(), { scope: 'no-such-scope' });
    assert.equal(v3.features.length, 0); // 매칭 노드 0
  });
});

describe('trace-view — IMPL 열 정직 표기 (IMPL 노드 존재 시)', () => {
  it('IMPL 노드 있으면 impl_note 표기', () => {
    const fx = makeFixture();
    fx.nodes.push(node('IMPL-A-001', 'IMPL'));
    fx.edges.push(edge('TC-A-001', 'IMPL-A-001', 'tests'));
    const view = buildTraceView(fx, {});
    assert.ok(view.coverage_matrix.present_columns.includes('IMPL'));
    assert.match(view.coverage_matrix.impl_note, /ecommerce 1 실도메인/);
  });
});

describe('trace-view — freshness 배너 (false-health 가드)', () => {
  it('fresh 그래프 = STALE 배너 없음', () => {
    const md = renderTraceViewMarkdown(buildTraceView(makeFixture('2099-01-01T00:00:00.000Z', []), {}));
    assert.ok(!md.includes('STALE'), 'fresh 인데 STALE 배너 출력됨');
    assert.match(md, /\[traceability-map\]/);
  });

  it('stale 그래프(source mtime > synthesized_at) = STALE 배너 출력', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tv-stale-'));
    try {
      const src = join(dir, 'discovery-spec.json');
      writeFileSync(src, '{}', 'utf-8');
      // source 를 현재로, synthesized_at 을 과거로 → stale.
      const now = Date.now() / 1000;
      utimesSync(src, now, now);
      const fx = makeFixture('2000-01-01T00:00:00.000Z', [src]);
      const view = buildTraceView(fx, { repoRoot: dir });
      assert.equal(view.freshness.stale, true);
      assert.ok(view.freshness.stale_sources.includes(src));
      const md = renderTraceViewMarkdown(view);
      assert.match(md, /⚠️ STALE/);
      assert.match(md, /resync-graph/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('trace-view — CLI 통합 (real cli.js subprocess / no-simulation)', () => {
  function writeGraph(fx) {
    const dir = mkdtempSync(join(tmpdir(), 'tv-cli-'));
    const p = join(dir, 'artifact-graph.json');
    writeFileSync(p, JSON.stringify(fx), 'utf-8');
    return { dir, p };
  }
  function run(args) {
    return spawnSync('node', [CLI, 'trace-view', ...args], { encoding: 'utf-8' });
  }

  it('--graph → exit 0 + map + matrix Markdown', () => {
    const { dir, p } = writeGraph(makeFixture());
    try {
      const r = run(['--graph', p]);
      assert.equal(r.status, 0);
      assert.match(r.stdout, /\[traceability-map\]/);
      assert.match(r.stdout, /추적 맵/);
      assert.match(r.stdout, /Coverage 매트릭스/);
      assert.match(r.stdout, /UC-A-001/);
      assert.match(r.stdout, /⚠ hole: TASK, TC 도달 없음/); // UC-B hole 인라인
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('--json → 구조화 + reference_lens:true', () => {
    const { dir, p } = writeGraph(makeFixture());
    try {
      const r = run(['--graph', p, '--json']);
      assert.equal(r.status, 0);
      const j = JSON.parse(r.stdout);
      assert.equal(j.reference_lens, true);
      assert.equal(j.view, 'traceability-map');
      assert.equal(j.coverage_matrix.rows.length, 2);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('--no-matrix → 매트릭스 섹션 없음', () => {
    const { dir, p } = writeGraph(makeFixture());
    try {
      const r = run(['--graph', p, '--no-matrix']);
      assert.equal(r.status, 0);
      assert.ok(!r.stdout.includes('Coverage 매트릭스'));
      assert.match(r.stdout, /추적 맵/); // map 은 유지
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('--graph 누락 → exit 3', () => {
    const r = run([]);
    assert.equal(r.status, 3);
  });

  it('graph 파일 부재 → exit 3 graceful', () => {
    const r = run(['--graph', join(tmpdir(), 'no-such-graph-xyz.json')]);
    assert.equal(r.status, 3);
    assert.match(r.stderr, /graph not found/);
  });
});

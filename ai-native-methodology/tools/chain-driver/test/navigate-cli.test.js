// navigate-cli.test.js
// ★ dep-graph P4 — chain-driver navigate + query --graph 명령 통합 (subprocess).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');

function makeGraph() {
  const dir = mkdtempSync(join(tmpdir(), 'navigate-'));
  const graph = {
    nodes: [
      { id: 'UC-1', artifact_kind: 'chain', artifact_subkind: 'UC', source_path: 'p.json', state: 'active',
        code_pointers: [{ path: 'src/uc.kt', anchor_type: 'strict_path' }] },
      { id: 'BHV-1', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: 'b.json', state: 'active' },
      { id: 'AC-1', artifact_kind: 'chain', artifact_subkind: 'AC', source_path: 'a.json', state: 'active' },
    ],
    edges: [
      { source: 'UC-1', target: 'BHV-1', edge_type: 'derived_from', confidence: 'hard' },
      { source: 'BHV-1', target: 'AC-1', edge_type: 'derived_from', confidence: 'hard' },
    ],
  };
  const path = join(dir, 'artifact-graph.json');
  writeFileSync(path, JSON.stringify(graph));
  return { dir, path };
}

function run(argv) {
  return spawnSync('node', [CLI, ...argv], { encoding: 'utf-8' });
}

describe('chain-driver navigate', () => {
  it('--json 출력: node + impact + top_impact_roots', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'UC-1', '--json']);
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.equal(out.node.id, 'UC-1');
    assert.equal(out.node.code_pointers.length, 1);
    assert.deepEqual(out.impact.by_grade.MUST.sort(), ['AC-1', 'BHV-1']);
    assert.ok(Array.isArray(out.top_impact_roots));
    rmSync(dir, { recursive: true });
  });

  it('text 출력: code_pointers + 영향 트리 표시', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'UC-1']);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /UC-1 \(chain\/UC\)/);
    assert.match(r.stdout, /src\/uc\.kt/);
    assert.match(r.stdout, /MUST: AC-1, BHV-1/);
    rmSync(dir, { recursive: true });
  });

  it('code_pointers 없는 노드 → (없음) 표시', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'BHV-1']);
    assert.match(r.stdout, /code_pointers: \(없음\)/);
    rmSync(dir, { recursive: true });
  });

  it('미존재 node → exit 3', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'GHOST']);
    assert.equal(r.status, 3);
    rmSync(dir, { recursive: true });
  });

  it('--graph / --origin 누락 → exit 3', () => {
    const r = run(['navigate']);
    assert.equal(r.status, 3);
  });
});

describe('chain-driver navigate --stage / --scope rollup (★ F3 / Loop B)', () => {
  it('--stage spec → BHV/AC 노드 rollup (--json)', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'spec', '--json']);
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.equal(out.query.stage, 'spec');
    assert.equal(out.count, 2);
    assert.deepEqual(out.nodes.map(n => n.id).sort(), ['AC-1', 'BHV-1']);
    assert.ok(out.nodes[0].by_grade);
    assert.ok(Array.isArray(out.top_impact_roots));
    rmSync(dir, { recursive: true });
  });

  it('--stage discovery → UC 만', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'discovery', '--json']);
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.deepEqual(out.nodes.map(n => n.id), ['UC-1']);
    rmSync(dir, { recursive: true });
  });

  it('--stage text 출력: rollup 헤더 + honor 라인', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'spec']);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /rollup — stage=spec/);
    assert.match(r.stdout, /emphasis=backward/);
    assert.match(r.stdout, /honor\(backward\)/);
    rmSync(dir, { recursive: true });
  });

  it('미지원 stage → exit 3', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'bogus']);
    assert.equal(r.status, 3);
    rmSync(dir, { recursive: true });
  });

  it('--scope 필터 (매칭 노드 없으면 count 0)', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--scope', 'nonexistent', '--json']);
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.equal(out.count, 0);
    rmSync(dir, { recursive: true });
  });
});

describe('chain-driver navigate stage emphasis / --direction (★ F4)', () => {
  it('--stage spec → emphasis backward (stage-default)', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'spec', '--json']);
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.equal(out.emphasis, 'backward');
    assert.equal(out.emphasis_source, 'stage-default');
    rmSync(dir, { recursive: true });
  });

  it('--stage plan → emphasis forward (count 0 이어도 프리셋 적용)', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'plan', '--json']);
    const out = JSON.parse(r.stdout);
    assert.equal(out.emphasis, 'forward');
    assert.equal(out.count, 0);
    rmSync(dir, { recursive: true });
  });

  it('--direction override > stage 기본', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'spec', '--direction', 'forward', '--json']);
    const out = JSON.parse(r.stdout);
    assert.equal(out.emphasis, 'forward');
    assert.equal(out.emphasis_source, 'override');
    rmSync(dir, { recursive: true });
  });

  it('잘못된 --direction → exit 3', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'spec', '--direction', 'sideways']);
    assert.equal(r.status, 3);
    rmSync(dir, { recursive: true });
  });

  it('backward emphasis text → honor(backward) 라인', () => {
    const { dir, path } = makeGraph();
    const r = run(['navigate', '--graph', path, '--stage', 'spec']);
    assert.match(r.stdout, /honor\(backward\)/);
    rmSync(dir, { recursive: true });
  });
});

describe('SessionStart 그래프 주입 (dep-graph P4 결정 7)', () => {
  it('artifact-graph.json 있으면 dirty count + top-3 impact root 주입', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dg-session-'));
    const aimdOut = join(dir, '.aimd', 'output');
    mkdirSync(aimdOut, { recursive: true });
    const graph = {
      nodes: [
        { id: 'UC-1', artifact_kind: 'chain', artifact_subkind: 'UC', source_path: 'p.json', state: 'active' },
        { id: 'BHV-1', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: 'b.json', state: 'drift' },
      ],
      edges: [{ source: 'UC-1', target: 'BHV-1', edge_type: 'derived_from', confidence: 'hard' }],
    };
    writeFileSync(join(aimdOut, 'artifact-graph.json'), JSON.stringify(graph));
    writeFileSync(join(dir, '.aimd', 'state.json'), JSON.stringify({ version: '3.0.0', project_id: 't', current_chain: 'planning', current_phase: 'analysis', blocked: false }));
    const r = spawnSync('node', [CLI, 'hooks-bridge'], {
      input: JSON.stringify({ hook_event_name: 'SessionStart', cwd: dir }),
      encoding: 'utf-8',
    });
    const out = JSON.parse(r.stdout);
    const ctx = out.hookSpecificOutput.additionalContext;
    assert.match(ctx, /\[dep-graph\] 2 nodes/);
    assert.match(ctx, /1 drift/);
    assert.match(ctx, /top-3 impact root/);
    assert.match(ctx, /dep-graph-navigator/);
    rmSync(dir, { recursive: true });
  });

  it('artifact-graph.json 없으면 dep-graph 컨텍스트 주입 안 함 (non-fatal)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dg-session-'));
    mkdirSync(join(dir, '.aimd'), { recursive: true });
    writeFileSync(join(dir, '.aimd', 'state.json'), JSON.stringify({ version: '3.0.0', project_id: 't', current_chain: 'planning', current_phase: 'analysis', blocked: false }));
    const r = spawnSync('node', [CLI, 'hooks-bridge'], {
      input: JSON.stringify({ hook_event_name: 'SessionStart', cwd: dir }),
      encoding: 'utf-8',
    });
    const out = JSON.parse(r.stdout);
    assert.ok(!out.hookSpecificOutput.additionalContext.includes('[dep-graph]'));
    rmSync(dir, { recursive: true });
  });
});

describe('chain-driver query --graph', () => {
  it('전체 graph JSON 출력 (nodes/edges/stats)', () => {
    const { dir, path } = makeGraph();
    const r = run(['query', '--graph', path]);
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.equal(out.nodes.length, 3);
    assert.equal(out.edges.length, 2);
    rmSync(dir, { recursive: true });
  });

  it('--ref <node-id> → 해당 노드 + 인접 엣지', () => {
    const { dir, path } = makeGraph();
    const r = run(['query', '--graph', path, '--ref', 'BHV-1']);
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.equal(out.node.id, 'BHV-1');
    // BHV-1 은 UC-1→BHV-1 + BHV-1→AC-1 = 2 엣지
    assert.equal(out.edges.length, 2);
    rmSync(dir, { recursive: true });
  });

  it('미존재 graph 경로 → exit 3', () => {
    const r = run(['query', '--graph', '/nonexistent/graph.json']);
    assert.equal(r.status, 3);
  });
});

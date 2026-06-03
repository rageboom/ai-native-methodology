// navigate-cli.test.js
// ★ dep-graph P4 — chain-driver navigate + query --graph 명령 통합 (subprocess).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
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

// ★ 의도③ — navigate --with-spec (스펙 본문 lazy-read / reference-lens / display-only).
function makeSpecGraph() {
  const dir = mkdtempSync(join(tmpdir(), 'navspec-'));
  const discPath = join(dir, 'discovery-spec.json');
  const bhvPath = join(dir, 'behavior-spec.json');
  const acPath = join(dir, 'acceptance-criteria.json');
  writeFileSync(discPath, JSON.stringify({
    use_cases: [
      { id: 'UC-1', name: '가입', description: '방문자가 계정을 만든다', actors: ['Anonymous'], preconditions: ['p1'], postconditions: ['q1', 'q2'] },
    ],
  }));
  writeFileSync(bhvPath, JSON.stringify({
    behaviors: [
      { id: 'BHV-1', name: '가입동작', description: '계정 생성', preconditions: ['pre1'], postconditions: ['post1'], invariants: ['inv1'] },
      { id: 'BHV-CAP5', name: '정확히5', preconditions: ['a', 'b', 'c', 'd', 'e'] },
      { id: 'BHV-CAP6', name: '여섯개', preconditions: ['a', 'b', 'c', 'd', 'e', 'f'] },
    ],
  }));
  writeFileSync(acPath, JSON.stringify({
    criteria: [
      { id: 'AC-1', description: '성공', severity: 'must', gherkin: { given: ['g1'], when: 'POST /users', then: ['t1', 't2'], tags: ['@must'] } },
      { id: 'AC-EMPTY', description: '빈then', gherkin: { given: ['g1'], when: 'w1', then: [] } },
    ],
  }));
  const graph = {
    nodes: [
      { id: 'UC-1', artifact_kind: 'chain', artifact_subkind: 'UC', source_path: discPath, state: 'active', title: '가입제목' },
      { id: 'BHV-1', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: bhvPath, state: 'active' },
      { id: 'BHV-CAP5', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: bhvPath, state: 'active' },
      { id: 'BHV-CAP6', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: bhvPath, state: 'active' },
      { id: 'AC-1', artifact_kind: 'chain', artifact_subkind: 'AC', source_path: acPath, state: 'active' },
      { id: 'AC-EMPTY', artifact_kind: 'chain', artifact_subkind: 'AC', source_path: acPath, state: 'active' },
      { id: 'BHV-NOSRC', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: join(dir, 'nonexistent.json'), state: 'active' },
      { id: 'BHV-IDMISS', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: bhvPath, state: 'active' },
      { id: 'TASK-1', artifact_kind: 'chain', artifact_subkind: 'TASK', source_path: join(dir, 't.json'), state: 'active' },
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

describe('chain-driver navigate --with-spec (★ 의도③ 스펙 본문)', () => {
  it('UC → use_cases 본문 (actors/pre/post) + reference_lens', () => {
    const { dir, path } = makeSpecGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'UC-1', '--with-spec', '--json']);
    assert.equal(r.status, 0);
    const sp = JSON.parse(r.stdout).spec;
    assert.equal(sp.reference_lens, true);
    assert.equal(sp.available, true);
    assert.equal(sp.subkind, 'UC');
    assert.equal(sp.title, '가입제목');
    assert.deepEqual(sp.actors, ['Anonymous']);
    assert.deepEqual(sp.postconditions, ['q1', 'q2']);
    rmSync(dir, { recursive: true });
  });

  it('BHV → behaviors 본문 (invariants 포함)', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'BHV-1', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.available, true);
    assert.equal(sp.subkind, 'BHV');
    assert.deepEqual(sp.invariants, ['inv1']);
    assert.deepEqual(sp.preconditions, ['pre1']);
    rmSync(dir, { recursive: true });
  });

  it('AC → gherkin given/when/then/tags + severity', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-1', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.available, true);
    assert.equal(sp.severity, 'must');
    assert.deepEqual(sp.gherkin.given, ['g1']);
    assert.equal(sp.gherkin.when, 'POST /users');
    assert.deepEqual(sp.gherkin.then, ['t1', 't2']);
    assert.deepEqual(sp.gherkin.tags, ['@must']);
    rmSync(dir, { recursive: true });
  });

  it('AC 빈 then → graceful 빈 배열 render', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-EMPTY', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.available, true);
    assert.deepEqual(sp.gherkin.then, []);
    rmSync(dir, { recursive: true });
  });

  it('★ 회귀 0 — --with-spec OFF 시 spec 키 부재', () => {
    const { dir, path } = makeSpecGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--origin', 'BHV-1', '--json']).stdout);
    assert.equal('spec' in out, false);
    rmSync(dir, { recursive: true });
  });

  it('cap 경계: 정확히 5 항목 → "(+N more)" 없음', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'BHV-CAP5', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.preconditions.length, 5);
    assert.ok(!sp.preconditions.some(x => /\+\d+ more/.test(x)));
    rmSync(dir, { recursive: true });
  });

  it('cap 경계: 6 항목 → 5 + "… (+1 more)"', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'BHV-CAP6', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.preconditions.length, 6);
    assert.match(sp.preconditions[5], /\(\+1 more\)/);
    rmSync(dir, { recursive: true });
  });

  it('source 부재 → available:false reason "source 부재" (절대경로 graceful / must-fix #1)', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'BHV-NOSRC', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.available, false);
    assert.match(sp.reason, /source 부재/);
    rmSync(dir, { recursive: true });
  });

  it('id miss → available:false reason "id miss"', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'BHV-IDMISS', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.available, false);
    assert.match(sp.reason, /id miss/);
    rmSync(dir, { recursive: true });
  });

  it('subkind 미지원 (TASK) → available:false reason 미지원', () => {
    const { dir, path } = makeSpecGraph();
    const sp = JSON.parse(run(['navigate', '--graph', path, '--origin', 'TASK-1', '--with-spec', '--json']).stdout).spec;
    assert.equal(sp.available, false);
    assert.match(sp.reason, /미지원/);
    rmSync(dir, { recursive: true });
  });

  it('rollup + --with-spec → spec 키 부재 (본문 폭증 방지)', () => {
    const { dir, path } = makeSpecGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--stage', 'spec', '--with-spec', '--json']).stdout);
    assert.equal('spec' in out, false);
    assert.ok(out.count >= 1);
    rmSync(dir, { recursive: true });
  });

  it('text 출력: reference-lens 라벨 + 본문 라인', () => {
    const { dir, path } = makeSpecGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'BHV-1', '--with-spec']);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /spec 본문 \(reference-lens \/ gate 주입 ❌\)/);
    assert.match(r.stdout, /description: 계정 생성/);
    rmSync(dir, { recursive: true });
  });

  it('text 출력: source 부재 → (불가 — source 부재)', () => {
    const { dir, path } = makeSpecGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'BHV-NOSRC', '--with-spec']);
    assert.match(r.stdout, /\(불가 — source 부재\)/);
    rmSync(dir, { recursive: true });
  });
});

// ★ 의도③ (a) NL 라우팅 — navigate --prompt (자연어 → 노드 결정론 해소).
function makePromptGraph() {
  const dir = mkdtempSync(join(tmpdir(), 'navprompt-'));
  const graph = {
    nodes: [
      { id: 'UC-USER-001', artifact_kind: 'chain', artifact_subkind: 'UC', source_path: 'd.json', state: 'active', title: '회원가입' },
      { id: 'BHV-USER-001', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: 'b.json', state: 'active', title: '회원가입',
        code_pointers: [{ path: 'src/SignupService.kt', anchor_type: 'strict_path', symbol: 'checkDuplicate' }] },
      { id: 'AC-USER-001', artifact_kind: 'chain', artifact_subkind: 'AC', source_path: 'a.json', state: 'active', title: '회원가입 성공' },
      { id: 'BHV-ARTICLE-001', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: 'b.json', state: 'active', title: '게시글' },
    ],
    edges: [
      { source: 'UC-USER-001', target: 'BHV-USER-001', edge_type: 'derived_from', confidence: 'hard' },
      { source: 'BHV-USER-001', target: 'AC-USER-001', edge_type: 'derived_from', confidence: 'hard' },
    ],
  };
  const path = join(dir, 'artifact-graph.json');
  writeFileSync(path, JSON.stringify(graph));
  return { dir, path };
}

describe('chain-driver navigate --prompt (★ 의도③ NL 라우팅)', () => {
  it('명시 id → strong unique → top-1 자동 탐색 (node 동봉)', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--prompt', 'BHV-USER-001 바꾸려는데', '--json']).stdout);
    assert.equal(out.prompt_resolution.resolved, 'BHV-USER-001');
    assert.equal(out.node.id, 'BHV-USER-001');
    assert.ok(out.impact); // 자동 탐색 = 영향 트리까지
    rmSync(dir, { recursive: true });
  });

  it('title 동점 → list-only degrade (탐색 ❌ / node 부재)', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--prompt', '회원가입 관련', '--json']).stdout);
    assert.equal(out.prompt_resolution.resolved, null);
    assert.equal('node' in out, false); // 탐색 안 함
    const ids = out.prompt_resolution.matches.map((m) => m.node_id).sort();
    assert.deepEqual(ids, ['BHV-USER-001', 'UC-USER-001']); // title="회원가입" (AC="회원가입 성공"은 substring 아님)
    rmSync(dir, { recursive: true });
  });

  it('title + id-part → strong unique → 자동 탐색', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--prompt', '회원가입 BHV', '--json']).stdout);
    assert.equal(out.prompt_resolution.resolved, 'BHV-USER-001'); // title+2 + id-part bhv +1 = 3 unique
    assert.equal(out.node.id, 'BHV-USER-001');
    rmSync(dir, { recursive: true });
  });

  it('0 매칭 → graceful (resolved null / node 부재)', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--prompt', 'zzz없음qqq', '--json']).stdout);
    assert.equal(out.prompt_resolution.matches.length, 0);
    assert.equal(out.prompt_resolution.resolved, null);
    assert.match(out.prompt_resolution.reason, /매칭 0/);
    rmSync(dir, { recursive: true });
  });

  it('--prompt + --origin 동시 = origin 우선 + skipped_reason', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--origin', 'UC-USER-001', '--prompt', 'BHV-USER-001', '--json']).stdout);
    assert.equal(out.node.id, 'UC-USER-001'); // origin 우선
    assert.match(out.prompt_resolution.skipped_reason, /origin 우선/);
    rmSync(dir, { recursive: true });
  });

  it('--prompt + --with-spec 조합 → 자동 탐색 노드에 spec 본문', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--prompt', 'BHV-USER-001', '--with-spec', '--json']).stdout);
    assert.equal(out.node.id, 'BHV-USER-001');
    assert.equal(out.spec.reference_lens, true); // source 부재라 available:false 이지만 graceful
    rmSync(dir, { recursive: true });
  });

  it('--prompt + --stage 동시 = rollup 우선 (prompt 무시)', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--stage', 'spec', '--prompt', 'BHV-USER-001', '--json']).stdout);
    assert.ok('query' in out); // rollup 출력 (prompt_resolution 아님)
    assert.equal('prompt_resolution' in out, false);
    rmSync(dir, { recursive: true });
  });

  it('text 출력: 후보 list + 점수 + top 탐색', () => {
    const { dir, path } = makePromptGraph();
    const r = run(['navigate', '--graph', path, '--prompt', 'BHV-USER-001 바꾸려는데']);
    assert.match(r.stdout, /프롬프트 "BHV-USER-001 바꾸려는데" → 매칭/);
    assert.match(r.stdout, /BHV-USER-001 \(score 5\)/);
    assert.match(r.stdout, /→ top 탐색: BHV-USER-001/);
    rmSync(dir, { recursive: true });
  });

  it('★ 회귀 0 — --prompt 없으면 prompt_resolution 키 부재', () => {
    const { dir, path } = makePromptGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--origin', 'BHV-USER-001', '--json']).stdout);
    assert.equal('prompt_resolution' in out, false);
    rmSync(dir, { recursive: true });
  });
});

// ★ 의도③ (b) what-if — 가설 변경 영향 (in-memory 비파괴 / core_two: remove-node + add-edge).
function makeWhatIfGraph() {
  const dir = mkdtempSync(join(tmpdir(), 'navwhatif-'));
  const graph = {
    nodes: [
      { id: 'UC-1', artifact_kind: 'chain', artifact_subkind: 'UC', source_path: 'd.json', state: 'active' },
      { id: 'BHV-1', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: 'b.json', state: 'active' },
      { id: 'AC-1', artifact_kind: 'chain', artifact_subkind: 'AC', source_path: 'a.json', state: 'active' },
      { id: 'ORPHAN-1', artifact_kind: 'chain', artifact_subkind: 'AC', source_path: 'a.json', state: 'active' },
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

describe('chain-driver navigate --what-if (★ 의도③ 가설 변경 영향)', () => {
  it('remove-node → newly orphaned delta + unsaved:true', () => {
    const { dir, path } = makeWhatIfGraph();
    // origin=AC-1, BHV-1 제거 → AC-1 backward 의 BHV-1 + (BHV 통해서만 닿던) UC-1 orphan.
    const out = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'remove-node:BHV-1', '--json']).stdout);
    assert.equal(out.what_if.unsaved, true);
    assert.equal(out.what_if.kind, 'remove-node');
    assert.deepEqual(out.what_if.delta.MUST.removed.sort(), ['BHV-1', 'UC-1']);
    assert.deepEqual(out.what_if.delta.MUST.added, []);
    rmSync(dir, { recursive: true });
  });

  it('add-edge → newly reachable delta + edge_type 명시', () => {
    const { dir, path } = makeWhatIfGraph();
    // origin=UC-1, UC-1>ORPHAN-1 가설 엣지 → ORPHAN-1 newly reachable.
    const out = JSON.parse(run(['navigate', '--graph', path, '--origin', 'UC-1', '--what-if', 'add-edge:UC-1>ORPHAN-1', '--json']).stdout);
    assert.equal(out.what_if.kind, 'add-edge');
    assert.equal(out.what_if.edge_type, 'derived_from'); // 기본
    assert.ok(out.what_if.delta.MUST.added.includes('ORPHAN-1'));
    rmSync(dir, { recursive: true });
  });

  it('★ 불변성 (must-fix #2) — --what-if 후 그래프 파일 byte-identical (비파괴 / do_not_edit_manually)', () => {
    const { dir, path } = makeWhatIfGraph();
    const before = readFileSync(path, 'utf-8');
    run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'remove-node:BHV-1', '--json']);
    run(['navigate', '--graph', path, '--origin', 'UC-1', '--what-if', 'add-edge:UC-1>ORPHAN-1']);
    assert.equal(readFileSync(path, 'utf-8'), before); // 파일 write 0
    rmSync(dir, { recursive: true });
  });

  it('★ baseline 불변 (must-fix #2/#3) — --what-if 의 result.impact 는 --what-if 없을 때와 동일 (가설이 baseline 오염 ❌)', () => {
    const { dir, path } = makeWhatIfGraph();
    const base = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-1', '--json']).stdout);
    const withWi = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'remove-node:BHV-1', '--json']).stdout);
    assert.deepEqual(withWi.impact, base.impact); // baseline = 원본 그래프 기준 / 가설 무관
    rmSync(dir, { recursive: true });
  });

  it('★ 결정론/provenance (must-fix #3) — 동일 op 2회 = 동일 delta (op 가 SOLE source)', () => {
    const { dir, path } = makeWhatIfGraph();
    const a = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'remove-node:BHV-1', '--json']).stdout).what_if.delta;
    const b = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'remove-node:BHV-1', '--json']).stdout).what_if.delta;
    assert.deepEqual(a, b);
    rmSync(dir, { recursive: true });
  });

  it('origin == 제거 대상 → graceful exit 3 (downstream consumer 안내)', () => {
    const { dir, path } = makeWhatIfGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'BHV-1', '--what-if', 'remove-node:BHV-1']);
    assert.equal(r.status, 3);
    assert.match(r.stderr, /제거 대상과 동일/);
    rmSync(dir, { recursive: true });
  });

  it('대상 노드 부재 → exit 3', () => {
    const { dir, path } = makeWhatIfGraph();
    assert.equal(run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'remove-node:GHOST']).status, 3);
    rmSync(dir, { recursive: true });
  });

  it('add-edge 미지 edge_type → exit 3 (EDGE_TYPE_CATALOG 검증)', () => {
    const { dir, path } = makeWhatIfGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'UC-1', '--what-if', 'add-edge:UC-1>ORPHAN-1:bogus']);
    assert.equal(r.status, 3);
    assert.match(r.stderr, /미지 edge_type/);
    rmSync(dir, { recursive: true });
  });

  it('미지원 op (deprecate-node = carry) → exit 3', () => {
    const { dir, path } = makeWhatIfGraph();
    assert.equal(run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'deprecate-node:BHV-1']).status, 3);
    rmSync(dir, { recursive: true });
  });

  it('text 출력: what-if (가설 / 미저장) 라벨 + delta', () => {
    const { dir, path } = makeWhatIfGraph();
    const r = run(['navigate', '--graph', path, '--origin', 'AC-1', '--what-if', 'remove-node:BHV-1']);
    assert.match(r.stdout, /what-if \(가설 \/ 미저장\): remove-node:BHV-1/);
    assert.match(r.stdout, /newly orphaned/);
    rmSync(dir, { recursive: true });
  });

  it('★ 회귀 0 — --what-if 없으면 what_if 키 부재', () => {
    const { dir, path } = makeWhatIfGraph();
    const out = JSON.parse(run(['navigate', '--graph', path, '--origin', 'AC-1', '--json']).stdout);
    assert.equal('what_if' in out, false);
    rmSync(dir, { recursive: true });
  });
});

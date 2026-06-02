import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { federate, selectOriginNodes, isAnchoredOrigin, makeCodegraphAdapter, cacheStaleness, resolvePromptToNodes, loadLegacyDataSource } from '../src/federator.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, '../../../schemas/context-cache.schema.json');
const FIXED_NOW = '2026-06-02T00:00:00.000Z';

// ── 픽스처 헬퍼 ──────────────────────────────────────────────────────────────
function node(id, kind, subkind, state, pointers, extra = {}) {
  return { id, artifact_kind: kind, artifact_subkind: subkind, state, code_pointers: pointers, ...extra };
}
function fakeNavigate(byGrade = { MUST: [], SHOULD: [], FYI: [] }, roots = []) {
  return () => ({ impact: { by_grade: byGrade }, top_impact_roots: roots });
}
// codegraph 어댑터 fake — query/callers/impact(/symbolsInFile) 가 주입 데이터 반환.
//   symbolsByFile 미지정 = symbolsInFile 미보유 → codeRefForAnchor 가 stem-query fallback 사용.
function fakeCodegraph({ queryHits = {}, callers = {}, impact = {}, symbolsByFile = null } = {}) {
  const a = {
    available: true, version: '0.9.6-fake', reason: null,
    query: (s) => queryHits[s] ?? [],
    callers: (s) => ({ symbol: s, callers: callers[s] ?? [] }),
    impact: (s) => impact[s] ?? { symbol: s, nodeCount: 0, affected: [] },
  };
  if (symbolsByFile) a.symbolsInFile = (rel) => symbolsByFile[rel] ?? [];
  return a;
}

// 호출 횟수 카운팅 spy (델타 carry 검증 = navigate/codegraph 미호출 입증).
function countingNavigate(byGrade = { MUST: [], SHOULD: [], FYI: [] }) {
  const state = { calls: 0 };
  return { state, fn: () => { state.calls++; return { impact: { by_grade: byGrade }, top_impact_roots: [] }; } };
}
function countingCodegraph(opts = {}) {
  const base = fakeCodegraph(opts);
  const state = { query: 0, callers: 0, impact: 0 };
  return {
    state,
    adapter: {
      ...base,
      query: (s) => { state.query++; return base.query(s); },
      callers: (s) => { state.callers++; return base.callers(s); },
      impact: (s) => { state.impact++; return base.impact(s); },
    },
  };
}
// ast_symbol 앵커 2노드 그래프 (code side = callers/impact / symbolsInFile 불필요).
function deltaGraph(nodes = [
  node('IMPL-1', 'chain', 'IMPL', 'active', [{ path: 'src/a.ts', anchor_type: 'ast_symbol', symbol: 'foo' }]),
  node('IMPL-2', 'chain', 'IMPL', 'active', [{ path: 'src/b.ts', anchor_type: 'ast_symbol', symbol: 'bar' }]),
]) { return { nodes }; }

// ── selectOriginNodes / isAnchoredOrigin ────────────────────────────────────
test('isAnchoredOrigin = Tier-1 + active|drift + code_pointers≥1 만', () => {
  assert.equal(isAnchoredOrigin(node('A', 'chain', 'IMPL', 'active', [{ path: 'x', anchor_type: 'strict_path' }])), true);
  assert.equal(isAnchoredOrigin(node('B', 'chain', 'IMPL', 'drift', [{ path: 'x', anchor_type: 'strict_path' }])), true);
  assert.equal(isAnchoredOrigin(node('C', 'chain', 'IMPL', 'propose', [{ path: 'x', anchor_type: 'strict_path' }])), false, 'propose 제외');
  assert.equal(isAnchoredOrigin(node('D', 'chain', 'IMPL', 'active', [])), false, 'code_pointers 0 제외');
  assert.equal(isAnchoredOrigin(node('E', 'plan', 'EPIC', 'active', [{ path: 'x', anchor_type: 'strict_path' }])), false, 'plan kind 제외(Tier-1 아님)');
});

test('selectOriginNodes — originIds 교집합 필터', () => {
  const graph = { nodes: [
    node('A', 'chain', 'IMPL', 'active', [{ path: 'a', anchor_type: 'strict_path' }]),
    node('B', 'analysis', 'business-rules', 'active', [{ path: 'b', anchor_type: 'strict_path' }]),
    node('C', 'chain', 'IMPL', 'propose', [{ path: 'c', anchor_type: 'strict_path' }]),
  ] };
  assert.deepEqual(selectOriginNodes(graph).map(n => n.id), ['A', 'B']);
  assert.deepEqual(selectOriginNodes(graph, ['A']).map(n => n.id), ['A']);
  assert.deepEqual(selectOriginNodes(graph, ['C']).map(n => n.id), [], 'propose 는 originIds 지정해도 제외');
});

// ── federate: ast_symbol 앵커 = 심볼 직행 (callers/impact) ────────────────────
test('federate — ast_symbol 앵커 → callers + impact 부착', () => {
  const graph = { nodes: [node('IMPL-1', 'chain', 'IMPL', 'active', [
    { path: 'src/guard.ts', anchor_type: 'ast_symbol', symbol: 'assertAvailable' },
  ])] };
  const cache = federate(graph, {
    repoRoot: '/repo',
    navigate: fakeNavigate({ MUST: ['AC-1', 'BHV-1'], SHOULD: [], FYI: [] }, [{ id: 'UC-1', score: 3 }]),
    codegraph: fakeCodegraph({
      callers: { assertAvailable: [{ name: 'register', kind: 'method', filePath: 'src/svc.ts', startLine: 20 }] },
      impact: { assertAvailable: { nodeCount: 8, affected: [{ name: 'register', kind: 'method', filePath: 'src/svc.ts', startLine: 20 }] } },
    }),
    now: () => FIXED_NOW,
  });
  assert.equal(cache.packs.length, 1);
  const p = cache.packs[0];
  assert.deepEqual(p.dep_impact.must, ['AC-1', 'BHV-1']);
  assert.deepEqual(p.top_impact_roots, [{ id: 'UC-1', score: 3 }]);
  const sym = p.code_refs[0].symbols[0];
  assert.equal(sym.name, 'assertAvailable');
  assert.equal(sym.callers[0].name, 'register');
  assert.equal(sym.impact.node_count, 8);
  assert.equal(p.code_refs[0].unresolved, false);
});

// ── federate: strict_path 앵커 = sameFile 필터링 ─────────────────────────────
test('federate — strict_path 앵커: 같은 파일 심볼만 (sameFile join)', () => {
  const graph = { nodes: [node('IMPL-1', 'chain', 'IMPL', 'active', [
    { path: 'app/src/x.ts', anchor_type: 'strict_path', commit_hash: 'abc123' },
  ])] };
  const cache = federate(graph, {
    repoRoot: '/repo',
    codegraphProjectDir: '/repo/app',         // codegraph filePath 는 app/ 기준 → 'src/x.ts'
    navigate: fakeNavigate({ MUST: ['UC-1'], SHOULD: [], FYI: [] }),
    codegraph: fakeCodegraph({ queryHits: { x: [
      { node: { name: 'foo', kind: 'method', filePath: 'src/x.ts', startLine: 3 } },   // 같은 파일 ✓
      { node: { name: 'bar', kind: 'method', filePath: 'src/y.ts', startLine: 9 } },   // 다른 파일 ✗
    ] } }),
    withCallers: false,
    now: () => FIXED_NOW,
  });
  const ref = cache.packs[0].code_refs[0];
  assert.equal(ref.symbols.length, 1, '같은 파일 심볼만 남음');
  assert.equal(ref.symbols[0].name, 'foo');
  assert.equal(ref.symbols[0].file_path, 'src/x.ts');
  assert.equal(cache.packs[0].code_anchors[0].commit_hash, 'abc123');
});

// ── federate: strict_path 앵커 = 인덱스 DB symbolsInFile (1차 경로) + file/import 제외 ──
test('federate — strict_path: symbolsInFile(인덱스 DB) + file/import 노드 제외 + callers 부착', () => {
  const graph = { nodes: [node('IMPL-1', 'chain', 'IMPL', 'active', [
    { path: 'app/src/x.ts', anchor_type: 'strict_path' },
  ])] };
  const cache = federate(graph, {
    repoRoot: '/repo',
    codegraphProjectDir: '/repo/app',           // cgRel = relative('/repo/app','/repo/app/src/x.ts') = 'src/x.ts'
    navigate: fakeNavigate({ MUST: ['UC-1'], SHOULD: [], FYI: [] }),
    codegraph: fakeCodegraph({
      symbolsByFile: { 'src/x.ts': [
        { name: 'x.ts', kind: 'file', filePath: 'src/x.ts', startLine: 1 },        // file → 제외
        { name: './dep.js', kind: 'import', filePath: 'src/x.ts', startLine: 2 },  // import → 제외
        { name: 'Foo', kind: 'class', filePath: 'src/x.ts', startLine: 5 },        // 유지
        { name: 'doThing', kind: 'method', filePath: 'src/x.ts', startLine: 9 },   // 유지
      ] },
      callers: { doThing: [{ name: 'caller', kind: 'method', filePath: 'src/y.ts', startLine: 3 }] },
    }),
    now: () => FIXED_NOW,
  });
  const ref = cache.packs[0].code_refs[0];
  assert.deepEqual(ref.symbols.map(s => s.name), ['Foo', 'doThing'], 'file/import 노드 제외 + 실 심볼만');
  assert.equal(ref.unresolved, false);
  assert.equal(ref.symbols.find(s => s.name === 'doThing').callers[0].name, 'caller');
});

// ── federate: codegraph 부재 = graceful (반쪽 비는 것 정직 표기 / no-simulation) ──
test('federate — codegraph 부재: dep 반쪽 유지 + code unresolved + 예외 없음', () => {
  const graph = { nodes: [node('IMPL-1', 'chain', 'IMPL', 'active', [
    { path: 'src/x.ts', anchor_type: 'strict_path' },
  ])] };
  const cache = federate(graph, {
    repoRoot: '/repo',
    navigate: fakeNavigate({ MUST: ['UC-1'], SHOULD: [], FYI: [] }),
    codegraph: { available: false, version: null, reason: 'codegraph 환경 부재: not found' },
    now: () => FIXED_NOW,
  });
  assert.equal(cache.codegraph.available, false);
  assert.equal(cache.stats.codegraph_available, false);
  assert.deepEqual(cache.packs[0].dep_impact.must, ['UC-1'], 'dep 반쪽은 그대로');
  assert.equal(cache.packs[0].code_refs[0].unresolved, true);
  assert.match(cache.packs[0].code_refs[0].note, /codegraph unavailable/);
  assert.equal(cache.stats.anchors_unresolved, 1);
});

// ── trust 모델 + 메타 ────────────────────────────────────────────────────────
test('federate — meta.trust_note(reference-lens) + do_not_edit_manually + now 주입', () => {
  const cache = federate({ nodes: [] }, { navigate: fakeNavigate(), now: () => FIXED_NOW, graphPath: 'g.json' });
  assert.equal(cache.meta.generated_by, 'context-federator');
  assert.equal(cache.meta.do_not_edit_manually, true);
  assert.match(cache.meta.trust_note, /reference-lens/);
  assert.match(cache.meta.trust_note, /gate/);
  assert.equal(cache.meta.synthesized_at, FIXED_NOW);
  assert.deepEqual(cache.meta.derived_from, ['g.json']);
});

test('federate — navigate 미주입 시 throw', () => {
  assert.throws(() => federate({ nodes: [] }, {}), /navigate runner/);
});

// ── 스키마 lockstep 가드 (strict exposes drift / ajv 없이 top-level 키 일치) ────
test('federate 출력 = context-cache.schema 의 top-level required 키 정확 일치', () => {
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));
  const cache = federate({ nodes: [] }, { navigate: fakeNavigate(), now: () => FIXED_NOW });
  const required = schema.required.slice().sort();
  const emitted = Object.keys(cache).sort();
  assert.deepEqual(emitted, required, 'top-level 키가 schema.required 와 정확히 일치 (additionalProperties:false 정합)');
  const metaReq = schema.properties.meta.required.slice().sort();
  assert.deepEqual(Object.keys(cache.meta).sort(), metaReq, 'meta 키 lockstep');
});

// ── ★ Phase 2 델타: 2축 carry (graph→dep / codegraph→code) ───────────────────
const STAMPS = { graphStamp: 'g1', codegraphIndexedAt: 'c1' };
function fullFederate(graph, stamps = STAMPS) {
  const cg = countingCodegraph({ callers: { foo: [], bar: [] } });
  const nav = countingNavigate({ MUST: ['X'] });
  return federate(graph, { repoRoot: '/r', navigate: nav.fn, codegraph: cg.adapter, ...stamps, now: () => FIXED_NOW });
}

test('delta — graph·codegraph 둘 다 무변경 → 전부 carry (navigate·codegraph 미호출)', () => {
  const prev = fullFederate(deltaGraph());
  const nav = countingNavigate(); const cg = countingCodegraph({ callers: { foo: [], bar: [] } });
  const out = federate(deltaGraph(), { repoRoot: '/r', navigate: nav.fn, codegraph: cg.adapter, ...STAMPS, prevCache: prev, now: () => FIXED_NOW });
  assert.equal(out.stats.carried_packs, 2);
  assert.equal(out.stats.dep_recomputed, 0);
  assert.equal(out.stats.code_recomputed, 0);
  assert.equal(nav.state.calls, 0, 'navigate 미호출 (dep carry)');
  assert.equal(cg.state.callers, 0, 'codegraph 미호출 (code carry)');
});

test('delta — codegraph index 만 변경 → dep carry / code 재계산', () => {
  const prev = fullFederate(deltaGraph());
  const nav = countingNavigate(); const cg = countingCodegraph({ callers: { foo: [], bar: [] } });
  const out = federate(deltaGraph(), { repoRoot: '/r', navigate: nav.fn, codegraph: cg.adapter, graphStamp: 'g1', codegraphIndexedAt: 'c2', prevCache: prev, now: () => FIXED_NOW });
  assert.equal(out.stats.dep_recomputed, 0, 'dep 는 carry');
  assert.equal(out.stats.code_recomputed, 2, 'code 는 재계산');
  assert.equal(nav.state.calls, 0, 'navigate 미호출');
  assert.ok(cg.state.callers > 0, 'codegraph 호출됨');
});

test('delta — graph 만 변경 → code carry / dep 재계산 (codegraph 미호출 = 비싼 부분 절감)', () => {
  const prev = fullFederate(deltaGraph());
  const nav = countingNavigate({ MUST: ['Y'] }); const cg = countingCodegraph({ callers: { foo: [], bar: [] } });
  const out = federate(deltaGraph(), { repoRoot: '/r', navigate: nav.fn, codegraph: cg.adapter, graphStamp: 'g2', codegraphIndexedAt: 'c1', prevCache: prev, now: () => FIXED_NOW });
  assert.equal(out.stats.dep_recomputed, 2, 'dep 재계산');
  assert.equal(out.stats.code_recomputed, 0, 'code 는 carry');
  assert.equal(cg.state.callers, 0, 'codegraph 미호출 (code carry)');
  assert.ok(nav.state.calls > 0, 'navigate 호출됨');
  assert.deepEqual(out.packs[0].dep_impact.must, ['Y'], '재계산된 dep 반영');
});

test('delta — 신규 노드 = 계산 / 삭제 노드 = drop (graph 변경)', () => {
  const prev = fullFederate(deltaGraph());
  const g2 = deltaGraph([
    node('IMPL-1', 'chain', 'IMPL', 'active', [{ path: 'src/a.ts', anchor_type: 'ast_symbol', symbol: 'foo' }]),
    node('IMPL-3', 'chain', 'IMPL', 'active', [{ path: 'src/c.ts', anchor_type: 'ast_symbol', symbol: 'baz' }]), // 신규 / IMPL-2 삭제
  ]);
  const nav = countingNavigate(); const cg = countingCodegraph({ callers: { foo: [], baz: [] } });
  const out = federate(g2, { repoRoot: '/r', navigate: nav.fn, codegraph: cg.adapter, graphStamp: 'g2', codegraphIndexedAt: 'c1', prevCache: prev, now: () => FIXED_NOW });
  assert.deepEqual(out.packs.map(p => p.node_id).sort(), ['IMPL-1', 'IMPL-3'], 'IMPL-2 drop / IMPL-3 신규');
});

test('delta — anchor_stamp 가 code_pointers 변경에 민감', () => {
  const a = federate(deltaGraph([node('N', 'chain', 'IMPL', 'active', [{ path: 'src/a.ts', anchor_type: 'ast_symbol', symbol: 'foo' }])]),
    { repoRoot: '/r', navigate: countingNavigate().fn, codegraph: fakeCodegraph({ callers: { foo: [] } }), ...STAMPS, now: () => FIXED_NOW });
  const b = federate(deltaGraph([node('N', 'chain', 'IMPL', 'active', [{ path: 'src/a.ts', anchor_type: 'ast_symbol', symbol: 'CHANGED' }])]),
    { repoRoot: '/r', navigate: countingNavigate().fn, codegraph: fakeCodegraph({ callers: { CHANGED: [] } }), ...STAMPS, now: () => FIXED_NOW });
  assert.notEqual(a.packs[0].anchor_stamp, b.packs[0].anchor_stamp, 'symbol 바뀌면 anchor_stamp 변경 → code carry 차단');
});

test('cacheStaleness — no prev=stale / 일치=fresh / graph↔dep · codegraph↔code 분리', () => {
  const prev = fullFederate(deltaGraph());
  assert.equal(cacheStaleness(null, STAMPS).stale, true);
  assert.equal(cacheStaleness(prev, { graphStamp: 'g1', codegraphIndexedAt: 'c1' }).stale, false);
  const s2 = cacheStaleness(prev, { graphStamp: 'gX', codegraphIndexedAt: 'c1' });
  assert.ok(s2.dep_stale && !s2.code_stale, 'graph 변경 = dep_stale 만');
  const s3 = cacheStaleness(prev, { graphStamp: 'g1', codegraphIndexedAt: 'cX' });
  assert.ok(s3.code_stale && !s3.dep_stale, 'codegraph 변경 = code_stale 만');
});

// ── ★ Phase 3 — resolvePromptToNodes (자연어 진입 결정론 매칭) ─────────────────
const RG = { nodes: [
  node('IMPL-USER-001', 'chain', 'IMPL', 'active', [
    { path: 'src/user.service.ts', anchor_type: 'strict_path' },
    { path: 'src/guard.ts', anchor_type: 'ast_symbol', symbol: 'assertAvailable' },
  ]),
  node('BHV-AUTH-002', 'chain', 'BHV', 'active', [{ path: 'src/auth.ts', anchor_type: 'strict_path' }]),
] };

test('resolvePromptToNodes — 노드 id 직접 언급 = 최상위', () => {
  const hits = resolvePromptToNodes('IMPL-USER-001 바꾸려는데', RG);
  assert.equal(hits[0].node_id, 'IMPL-USER-001');
  assert.ok(hits[0].score >= 5);
});

test('resolvePromptToNodes — 파일 stem 언급 매칭', () => {
  const hits = resolvePromptToNodes('user.service 로직 수정', RG);
  assert.equal(hits[0].node_id, 'IMPL-USER-001');
  assert.ok(hits[0].matched.some(m => m.startsWith('file:')));
});

test('resolvePromptToNodes — ast_symbol 언급 매칭', () => {
  const hits = resolvePromptToNodes('assertAvailable 변경', RG);
  assert.equal(hits[0].node_id, 'IMPL-USER-001');
  assert.ok(hits[0].matched.some(m => m === 'symbol:assertAvailable'));
});

test('resolvePromptToNodes — 식별자 없는 한글 산문 = 빈 결과 (정직 / 임베딩 carry)', () => {
  assert.deepEqual(resolvePromptToNodes('회원가입 화면이 깨졌어요', RG), []);
});

test('resolvePromptToNodes — 매칭 多 = 높은 score 랭킹', () => {
  const hits = resolvePromptToNodes('IMPL-USER-001 의 user.service 와 assertAvailable', RG);
  assert.equal(hits[0].node_id, 'IMPL-USER-001');
  assert.ok(hits[0].score >= 10, `id+file+symbol 합산 (got ${hits[0].score})`);
});

// ── ★ Phase 1.5 — legacy 데이터 반쪽 (sql-inventory + db-schema) ──────────────
const DS_GRAPH = { nodes: [
  { id: 'analysis-sql-inventory', artifact_kind: 'analysis', source_path: 'input/sql-inventory.json' },
  { id: 'analysis-db-schema', artifact_kind: 'analysis', source_path: 'input/db-schema.json' },
] };
const DS_JSON = {
  '/repo/input/sql-inventory.json': { inventory: [
    { sql_id: 'selectCar', mapper_xml: 'source/sqlmap/carMgt.xml', statement_type: 'SELECT', dependent_tables: ['tb_car'], uc_link: 'UC-CAR-001', business_meaning: '차량 조회' },
    { sql_id: 'insertCar', mapper_xml: 'source/sqlmap/carMgt.xml', statement_type: 'INSERT', dependent_tables: ['tb_car'], uc_link: 'UC-CAR-001', business_meaning: '차량 등록' },
  ] },
  '/repo/input/db-schema.json': { tables: [
    { name: 'tb_car', columns: [{ name: 'car_idx', type: 'int' }, { name: 'car_name', type: 'varchar' }] },
  ] },
};
function loadDS() {
  return loadLegacyDataSource(DS_GRAPH, { repoRoot: '/repo', readJson: (p) => DS_JSON[p] ?? null, existsFn: (p) => p in DS_JSON });
}

test('loadLegacyDataSource — source_path 자동발견 + byUc/byMapper/tableByName 인덱스', () => {
  const ds = loadDS();
  assert.equal(ds.available, true);
  assert.equal(ds.sql_loaded, true);
  assert.equal(ds.db_loaded, true);
  assert.equal(ds.byUc.get('UC-CAR-001').length, 2);
  assert.ok(ds.byMapper.has('carMgt.xml'));
  assert.deepEqual(ds.tableByName.get('tb_car').columns.map(c => c.name), ['car_idx', 'car_name']);
});

test('loadLegacyDataSource — 산출물 부재 = available:false (graceful / no-sim)', () => {
  const ds = loadLegacyDataSource(DS_GRAPH, { repoRoot: '/repo', readJson: () => null, existsFn: () => false });
  assert.equal(ds.available, false);
  assert.equal(ds.byUc.size, 0);
});

test('federate — data-anchored: code_pointers 0 인 UC 노드도 sql-inventory 로 federate + db-schema 컬럼 보강', () => {
  const graph = { nodes: [node('UC-CAR-001', 'chain', 'UC', 'active', [])] }; // code_pointers 0 (legacy)
  const cache = federate(graph, {
    repoRoot: '/repo',
    navigate: fakeNavigate({ MUST: ['BHV-CAR-001'], SHOULD: [], FYI: [] }),
    codegraph: { available: false, version: null, reason: 'legacy iBATIS2' },
    dataSource: loadDS(),
    now: () => FIXED_NOW,
  });
  assert.equal(cache.packs.length, 1, 'code_pointers 0 이어도 data-anchored 로 편입');
  assert.equal(cache.stats.data_anchored_nodes, 1);
  assert.equal(cache.stats.data_source_available, true);
  const p = cache.packs[0];
  assert.deepEqual(p.dep_impact.must, ['BHV-CAR-001'], 'dep 반쪽도 navigate 로 채워짐');
  assert.equal(p.data_refs.length, 2, 'uc_link 매칭 SQL 2건');
  assert.equal(p.data_refs[0].sql_id, 'selectCar');
  assert.equal(p.data_refs[0].dependent_tables[0].name, 'tb_car');
  assert.deepEqual(p.data_refs[0].dependent_tables[0].columns.map(c => c.name), ['car_idx', 'car_name'], 'db-schema 컬럼 보강');
});

test('federate — mapper_xml 조인 (code_pointer 파일명 → sql-inventory)', () => {
  const graph = { nodes: [node('IMPL-CAR-001', 'chain', 'IMPL', 'active', [
    { path: 'src/main/resources/sqlmap/carMgt.xml', anchor_type: 'strict_path' },
  ])] };
  const cache = federate(graph, {
    repoRoot: '/repo',
    navigate: fakeNavigate({ MUST: [], SHOULD: [], FYI: [] }),
    codegraph: { available: false, version: null, reason: 'x' },
    dataSource: loadDS(),
    now: () => FIXED_NOW,
  });
  assert.equal(cache.packs[0].data_refs.length, 2, 'mapper basename(carMgt.xml) 매칭 SQL 2건');
});

test('federate — dataSource 없음: data_refs 전부 [] + 기존 동작 무변경', () => {
  const graph = { nodes: [node('IMPL-1', 'chain', 'IMPL', 'active', [{ path: 'src/x.ts', anchor_type: 'ast_symbol', symbol: 'foo' }])] };
  const cache = federate(graph, {
    repoRoot: '/repo',
    navigate: fakeNavigate({ MUST: ['UC-1'], SHOULD: [], FYI: [] }),
    codegraph: fakeCodegraph({ callers: { foo: [] } }),
    now: () => FIXED_NOW, // dataSource 미주입
  });
  assert.deepEqual(cache.packs[0].data_refs, []);
  assert.equal(cache.stats.data_source_available, false);
  assert.equal(cache.stats.data_anchored_nodes, 0);
});

// ── ★ env-gated 실 codegraph smoke (no-simulation / 부재 시 honest skip) ──────
test('smoke: 실 codegraph index → federate 가 실제 심볼/호출자 해석', (t) => {
  let adapter;
  const dir = mkdtempSync(join(tmpdir(), 'cf-smoke-'));
  try {
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'm.js'), 'export function a(){ return 1; }\nexport function b(){ return a() + a(); }\n');
    // 실 codegraph 초기 인덱스 (runner 의 init -i 패턴 동형). 부재 시 throw → honest skip.
    try {
      execSync(`codegraph init -i "${dir}"`, { encoding: 'utf-8', timeout: 120_000, stdio: 'pipe' });
    } catch (err) {
      const msg = String(err?.stderr || err?.message || err);
      if (/not found|ENOENT|command not found|not recognized/i.test(msg)) {
        t.skip('codegraph 환경 부재 — honest skip (R19 Tier 1 / no-simulation / CI 정합)');
        return;
      }
      throw err;
    }
    adapter = makeCodegraphAdapter({ codegraphProjectDir: dir });
    if (!adapter.available) { t.skip(`codegraph adapter unavailable: ${adapter.reason}`); return; }

    // 합성 graph: IMPL 노드가 src/m.js 를 strict_path 로 앵커 (repoRoot=dir → codegraph filePath 'src/m.js' 와 동일파일)
    const graph = { nodes: [node('IMPL-X', 'chain', 'IMPL', 'active', [{ path: 'src/m.js', anchor_type: 'strict_path' }])] };
    const cache = federate(graph, {
      repoRoot: dir,
      codegraphProjectDir: dir,
      navigate: fakeNavigate({ MUST: ['AC-X'], SHOULD: [], FYI: [] }),
      codegraph: adapter,
      now: () => FIXED_NOW,
    });
    const ref = cache.packs[0].code_refs[0];
    const names = ref.symbols.map(s => s.name);
    assert.ok(names.includes('a') && names.includes('b'), `실 codegraph 가 a,b 심볼 해석 (got: ${names.join(',')})`);
    const symA = ref.symbols.find(s => s.name === 'a');
    assert.ok((symA.callers ?? []).some(c => c.name === 'b'), 'b 가 a 의 caller (실 codegraph callers)');
    assert.equal(cache.stats.codegraph_available, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

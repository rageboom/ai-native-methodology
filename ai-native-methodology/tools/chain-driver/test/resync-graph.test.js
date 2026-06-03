// resync-graph.test.js — ★ Loop A / A-lazy-cmd (DEC-2026-06-03-living-graph-a1-surface 후속 / 의도② lazy 재계산).
//   chain-driver resync-graph 가 convention 입력-탐색 → traceability-matrix-builder --graph 위임으로
//   artifact-graph.json 을 재합성하는지 + analysis-only graceful + dry-run 무write 검증.
//   real cli.js subprocess spawn (no-simulation / hooks-contract.test.js 패턴 정합 / 내부에서 matrix-builder 재-spawn).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

// 완전 연결 최소 chain (UC→BHV→AC→TC→IMPL / 5 stage / task-plan 생략 = AC→TC fallback).
const CHAIN = {
  'discovery-spec.json': { use_cases: [{ id: 'UC-T-001', name: '테스트 사용자 UC' }] },
  'behavior-spec.json': { behaviors: [{ id: 'BHV-T-001', name: '테스트 동작', use_case_refs: ['UC-T-001'] }] },
  'acceptance-criteria.json': { criteria: [{ id: 'AC-T-001', name: '테스트 AC', behavior_ref: 'BHV-T-001' }] },
  'test-spec.json': { test_cases: [{ id: 'TC-T-001', ac_ref: 'AC-T-001', source_file: 'src/t.test.ts' }] },
  'impl-spec.json': { modules: [{ id: 'IMPL-T-001', tc_refs: ['TC-T-001'], source_files: ['src/t.ts'] }] },
};

function makeFixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'aimd-resync-'));
  const out = join(root, '.aimd', 'output');
  mkdirSync(out, { recursive: true });
  for (const [fname, data] of Object.entries(files)) {
    writeFileSync(join(out, fname), JSON.stringify(data, null, 2) + '\n');
  }
  return root;
}

function runResync(cwd, extra = []) {
  return spawnSync('node', [CLI, 'resync-graph', ...extra], {
    cwd, encoding: 'utf-8', shell: false, timeout: 60000,
  });
}

describe('resync-graph (A-lazy-cmd — Loop A lazy 재합성)', () => {
  const fixtures = [];
  after(() => {
    for (const f of fixtures) { try { rmSync(f, { recursive: true, force: true }); } catch { /* ok */ } }
  });

  it('정상 — 5/6 chain 입력 → artifact-graph.json 재합성 + coverage 라인', () => {
    const root = makeFixture(CHAIN);
    fixtures.push(root);
    const r = runResync(root);
    assert.equal(r.status, 0, `stderr: ${r.stderr}`);
    assert.match(r.stderr, /재합성: 5\/6 stage/);          // watch-item #1 coverage 노출
    assert.match(r.stderr, /신규\(carry-over 없음\)/);      // 최초 = previous-graph 없음
    const graphPath = join(root, '.aimd', 'output', 'artifact-graph.json');
    assert.ok(existsSync(graphPath), 'artifact-graph.json 생성됨');
    const g = JSON.parse(readFileSync(graphPath, 'utf-8'));
    const ids = g.nodes.map((n) => n.id);
    assert.ok(ids.includes('UC-T-001') && ids.includes('IMPL-T-001'), 'UC~IMPL 노드 합성');
    assert.ok(g.synthesized_at, 'synthesized_at 스탬프');
  });

  it('재실행 — 기존 그래프 있으면 --previous-graph carry-over 표기', () => {
    const root = makeFixture(CHAIN);
    fixtures.push(root);
    runResync(root);                                        // 1차 (그래프 생성)
    const r = runResync(root);                              // 2차 (carry-over)
    assert.equal(r.status, 0, `stderr: ${r.stderr}`);
    assert.match(r.stderr, /--previous-graph carry-over/);
  });

  it('analysis-only (behavior/acceptance 부재) → graceful 거부 exit 3', () => {
    const root = makeFixture({ 'business-rules.json': { business_rules: [] } });
    fixtures.push(root);
    const r = runResync(root);
    assert.equal(r.status, 3);
    assert.match(r.stderr, /재합성 불가/);
    assert.match(r.stderr, /behavior-spec\.json/);
    assert.match(r.stderr, /migration-start = 엣지 0/);     // DEC-2026-06-03 §1.1 정직 안내
    assert.ok(!existsSync(join(root, '.aimd', 'output', 'artifact-graph.json')), 'write 안 함');
  });

  it('--dry-run → 재합성 예정만 보고, artifact-graph.json write 안 함', () => {
    const root = makeFixture(CHAIN);
    fixtures.push(root);
    const r = runResync(root, ['--dry-run']);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /\(dry-run\) 재합성 예정: 5\/6 stage/);
    assert.ok(!existsSync(join(root, '.aimd', 'output', 'artifact-graph.json')), 'dry-run = write 안 함');
  });
});

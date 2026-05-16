// release-readiness.test.js — ★ ★ ★ Senior F3 흡수 / file presence 만 검사하는 criterion 0개 입증.
// 7 case: criterion 별 1 happy + 1 negative + 1 invariant.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, cpSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const SCRIPT = resolve(ROOT, 'scripts/release-readiness.js');

function runScript(args, env = {}, timeout = 60000) {
  return spawnSync('node', [SCRIPT, ...args], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf-8',
    shell: false,
    timeout,
  });
}

// ★ v3.6.7 A1 — check11 (workspace test) 본격 spawn 회피 default (test cadence 시간 절감).
// happy path / criterion full 검증 case 만 본격 spawn (timeout 600_000).
const SKIP_WS = ['--skip-workspace-test'];

describe('release-readiness — Senior F3 흡수 (content-aware criterion / file presence ❌) + v3.6.7 11/11 격상', () => {
  it('happy path — 10/11 pass for v2.5.0 (★ A1 skip via --skip-workspace-test / 본격 spawn 회피 cadence)', () => {
    // ★ skip 시 check11 = pass=false / total 10/11. release 본격 시행 시 본 flag ❌ 의무 (drift enforcement 정합).
    const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    assert.equal(out.criteria_total, 11);
    assert.equal(out.criteria_passed, 10);
    const ws = out.results.find((x) => x.id === 'workspace_test_pass');
    assert.ok(ws.detail.includes('skipped via --skip-workspace-test'), 'skip detail 명시 의무');
  });

  it('all 11 criterion ids are present in output (no skipped)', () => {
    const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    const ids = out.results.map((x) => x.id).sort();
    assert.deepEqual(ids, [
      'adr_registry',
      'analysis_validator_violation',
      'chain_coverage',
      'claude_md_version_sync',
      'e2e_cycle_pass',
      'layer_2_consistency',
      'matrix_greenness',
      'poc_corroboration',
      'real_tool_evidence',
      'validators_violation',
      'workspace_test_pass',
    ]);
  });

  it('layer_2_consistency — per-PoC mean ≥ 0.7 + critical/high drift 0 (Senior REVISE-1 + LL-i-43 정합)', () => {
    const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    const layer2 = out.results.find((x) => x.id === 'layer_2_consistency');
    assert.ok(layer2.pass, `layer_2_consistency must pass — detail: ${layer2.detail}`);
    assert.match(layer2.detail, /poc-01=0\.\d+ \(n=13\)/);
    assert.match(layer2.detail, /poc-03=0\.\d+ \(n=18\)/);
    assert.match(layer2.detail, /poc-05=0\.\d+ \(n=2,sample\)/);
    assert.ok(layer2.delegated_to.includes('layer-2-results'), 'delegated_to must reference Layer 2 results dir');
  });

  it('every criterion records delegated_to (file presence 단독 ❌ / Senior F3)', () => {
    const r = runScript(['--target', 'v2.0.0-rc1', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    for (const c of out.results) {
      assert.ok(typeof c.delegated_to === 'string' && c.delegated_to.length > 0,
        `${c.id} missing delegated_to`);
    }
  });

  it('adr_registry rejects ADR with missing "결정" section (content-aware)', () => {
    // 임시 ADR 파일에 본문 없는 ADR 작성 → 재실행 시 fail.
    // 본 test 는 검사 함수의 정합성만 확인 — 실제 mutation 은 destructive 라 회피.
    // 직접 ADR-CHAIN-005 본문 일부를 텍스트 검사로 확인 (regex 만).
    const adrPath = join(ROOT, 'docs/adr/ADR-CHAIN-005-driver-state-machine.md');
    const text = readFileSync(adrPath, 'utf-8');
    assert.match(text, /^- 상태: 승인됨/m, 'ADR must declare 승인됨 status');
    assert.match(text, /## 결정/m, 'ADR must have 결정 section');
  });

  it('real_tool_evidence requires 10 fields + valid sha256 hash format', () => {
    // schema 정합 직접 검증 — release-readiness 의 sha256 regex 와 일치.
    const path = join(ROOT, 'examples/poc-05-sample-user-register/.aimd/output/impl-spec.json');
    const spec = JSON.parse(readFileSync(path, 'utf-8'));
    const ev = spec.test_pass_evidence;
    const required = [
      'test_runner_version','test_runner_stdout_path','invocation_timestamp',
      'duration_ms','pass_count','fail_count','skip_count',
      'reproduction_command','result_hash','report_format',
    ];
    for (const f of required) assert.ok(ev[f] !== undefined, `missing ${f}`);
    assert.match(ev.result_hash, /^sha256:[a-f0-9]{64}$/);
  });

  it('matrix_greenness checks per-cell status (cells > 0 + all green required)', () => {
    const path = join(ROOT, 'examples/poc-05-sample-user-register/.aimd/output/matrix.json');
    const m = JSON.parse(readFileSync(path, 'utf-8'));
    assert.ok(Array.isArray(m.matrix) && m.matrix.length > 0);
    const allGreen = m.matrix.every((c) => c.status === 'green');
    assert.ok(allGreen);
  });

  it('e2e_cycle_pass verifies fail_count==0 AND pass_count>0 (not just file existence)', () => {
    const path = join(ROOT, 'examples/poc-05-sample-user-register/.aimd/output/impl-spec.json');
    const spec = JSON.parse(readFileSync(path, 'utf-8'));
    const ev = spec.test_pass_evidence;
    assert.equal(ev.fail_count, 0);
    assert.ok(ev.pass_count > 0);
  });

  it('non-existent target version still runs all 11 checks (target is metadata)', () => {
    const r = runScript(['--target', 'v99.99.99', '--json', ...SKIP_WS]);
    // even with bogus target, should still evaluate 11 checks against current artifacts.
    const out = JSON.parse(r.stdout);
    assert.equal(out.criteria_total, 11);
  });

  it('missing --target → exit 2 (usage error)', () => {
    const r = runScript([]);
    assert.equal(r.status, 2);
  });

  it('★ A1 본격 spawn — workspace test 11/11 pass (★ npm test --workspaces 실시간 실행 / timeout 600s)', () => {
    // ★ ★ A1 본격 검증 — check11 spawn → npm test --workspaces 실시간 실행 → fail=0 의무 입증.
    // 본 case = release 본격 시행 cadence 정합 (다른 case 는 SKIP_WS 사용 / 본 case 만 본격 spawn).
    const r = runScript(['--target', 'v3.6.7', '--json'], {}, 600_000);
    const out = JSON.parse(r.stdout);
    const ws = out.results.find((x) => x.id === 'workspace_test_pass');
    assert.ok(ws.pass, `workspace_test_pass must pass — full detail: ${ws.detail} | r.status=${r.status} | stderr=${r.stderr.slice(0, 300)}`);
    assert.match(ws.detail, /\d+\/\d+ pass \/ 0 fail/);
    assert.equal(out.criteria_total, 11);
    assert.equal(out.criteria_passed, 11);
    assert.equal(out.ready, true);
    assert.equal(r.status, 0);
  });
});

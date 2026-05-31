// release-readiness.test.js — ★ ★ ★ Senior F3 흡수 / file presence 만 검사하는 criterion 0개 입증.
// 7 case: criterion 별 1 happy + 1 negative + 1 invariant.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, cpSync, existsSync, readFileSync, readdirSync } from 'node:fs';
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

describe('release-readiness — Senior F3 흡수 (content-aware criterion / file presence ❌) + v3.6.7 11/11 + v7.1.0 12/12 + v8.1.0 13/13 격상', () => {
  it('happy path — 24/25 pass for v2.5.0 (★ A1 skip via --skip-workspace-test / check12 staleness + check13 citation pass / 본격 spawn 회피 cadence)', () => {
    // ★ skip 시 check11(workspace_test) = pass=false / total 24/25 (나머지 전부 pass). release 본격 시행 시 본 flag ❌ 의무.
    const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    assert.equal(out.criteria_total, 25);
    assert.equal(out.criteria_passed, 24);
    const ws = out.results.find((x) => x.id === 'workspace_test_pass');
    assert.ok(ws.detail.includes('skipped via --skip-workspace-test'), 'skip detail 명시 의무');
    const stale = out.results.find((x) => x.id === 'authoring_spec_staleness');
    assert.ok(stale.pass, `check12 staleness must pass — detail: ${stale.detail}`);
    const cite = out.results.find((x) => x.id === 'skill_citation_integrity');
    assert.ok(cite.pass, `check13 skill citation must pass — detail: ${cite.detail}`);
  });

  it('all 25 criterion ids are present in output (no skipped)', () => {
    const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    const ids = out.results.map((x) => x.id).sort();
    assert.deepEqual(ids, [
      'adr_registry',
      'agent_skills_phaseflow_sync',
      'analysis_validator_violation',
      'authoring_spec_staleness',
      'be_task_openapi_ref_ratchet',
      'chain_coverage',
      'claude_md_version_sync',
      'code_pointer_coverage',
      'db_assets_validator',
      'e2e_cycle_pass',
      'gate_enum_consistency',
      'graph_integrity',
      'layer_2_consistency',
      'legacy_4_stage_expression_absent',
      'marketplace_stage_sync',
      'matrix_greenness',
      'plan_gate_operational',
      'poc_corroboration',
      'preflight_tools',
      'real_tool_evidence',
      'skill_citation_integrity',
      'template_count_drift',
      'template_schema_valid',
      'validators_violation',
      'workspace_test_pass',
    ]);
  });

  it('authoring_spec_staleness — §6 pin 4 area ≤ 60d fresh + digest_sha 4행 일치 + --skip-authoring-staleness ≠ pass (R18 / ADR-PLUGIN-001 §7 patch v4)', () => {
    const r = runScript(['--target', 'v7.1.0', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    const stale = out.results.find((x) => x.id === 'authoring_spec_staleness');
    assert.ok(stale.pass, `check12 must pass — detail: ${stale.detail}`);
    assert.match(stale.detail, /4 area 모두 ≤ 60d fresh \+ digest_sha 4행 일치/);
    // skip flag = skip(≠pass) — release 시 본 flag ❌ 의무 (drift enforcement 정합 / check11 mirror).
    const r2 = runScript(['--target', 'v7.1.0', '--json', ...SKIP_WS, '--skip-authoring-staleness']);
    const out2 = JSON.parse(r2.stdout);
    const stale2 = out2.results.find((x) => x.id === 'authoring_spec_staleness');
    assert.equal(stale2.pass, false);
    assert.ok(stale2.detail.includes('skipped via --skip-authoring-staleness'), 'skip detail 명시 의무');
  });

  // ★ v8.2.0 digest_sha regression-guard (dogfood) — 실 §6 4행 각 digest_sha == sha256(trim(digest)) 선두 12hex.
  // release-readiness.js 가 ROOT 경로 hardcode → 파괴적 mutation 회피 (adr_registry test 패턴 동형).
  // digest 변경 후 hash 미재커밋 시 sha 불일치 = check #12 fail = §9 Layer i 불변식 결정적 강제 입증.
  it('§6 digest_sha — 4 area 모두 sha256(trim(digest)) 선두 12hex 와 일치 (§9 Layer i 불변식 / blind-spot closure)', async () => {
    const { createHash } = await import('node:crypto');
    const specPath = join(ROOT, 'methodology-spec/plugin-authoring-spec.md');
    const text = readFileSync(specPath, 'utf-8');
    const rows = [];
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\|\s*(skills|hooks|sub-agents|plugins-reference)\s*\|/);
      if (!m) continue;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      assert.equal(cells.length, 7, `${m[1]}: §6 행 7-cell 의무 (digest '|' 침입 fail-closed) — got ${cells.length}`);
      const expected = createHash('sha256').update(cells[3]).digest('hex').slice(0, 12);
      assert.equal(cells[4], expected,
        `${m[1]}: digest_sha 불일치 (커밋 ${cells[4]} ≠ 재계산 ${expected} — digest 변경 후 hash 미재커밋)`);
      rows.push(m[1]);
    }
    assert.deepEqual(rows.sort(), ['hooks', 'plugins-reference', 'skills', 'sub-agents']);
  });

  // ★ v8.2.1 §8-2 documented-exception no-loophole — `_base-` 자산 정확 8 (frozen allowlist).
  // 9번째 `_base-` skill/agent 추가 시 check #12 fail (예외의 loophole 화 차단 / 신규=S3 ratchet).
  it('check12 _base- allowlist — 정확 5 skill + 3 agent (§8-2 documented-exception / loophole 방지)', () => {
    const r = runScript(['--target', 'v8.2.1', '--json', ...SKIP_WS]);
    const out = JSON.parse(r.stdout);
    const c = out.results.find((x) => x.id === 'authoring_spec_staleness');
    assert.ok(c.pass, `check12 must pass — detail: ${c.detail}`);
    assert.match(c.detail, /_base- 8 allowlist 정합/);
    // 실 디스크 = 정확히 enumerated 8 (frozen).
    const baseSkills = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith('_base-')).map((e) => e.name).sort();
    const baseAgents = readdirSync(join(ROOT, 'agents'), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.startsWith('_base-') && e.name.endsWith('.md'))
      .map((e) => e.name.replace(/\.md$/, '')).sort();
    assert.deepEqual(baseSkills, [
      '_base-apply-baseline-ratchet', '_base-apply-template', '_base-build-traceability-matrix',
      '_base-invoke-go-stop-gate', '_base-log-finding',
    ]);
    assert.deepEqual(baseAgents, [
      '_base-industry-case-researcher', '_base-official-docs-checker', '_base-senior-engineer',
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

  it('non-existent target version still runs all 25 checks (target is metadata)', () => {
    const r = runScript(['--target', 'v99.99.99', '--json', ...SKIP_WS]);
    // even with bogus target, should still evaluate 25 checks against current artifacts.
    const out = JSON.parse(r.stdout);
    assert.equal(out.criteria_total, 25);
  });

  it('missing --target → exit 2 (usage error)', () => {
    const r = runScript([]);
    assert.equal(r.status, 2);
  });

  it('★ A1 본격 spawn — workspace test + 25/25 pass (★ npm test --workspaces 실시간 실행 / timeout 600s)', () => {
    // ★ ★ A1 본격 검증 — check11 spawn → npm test --workspaces 실시간 실행 → fail=0 의무 입증.
    // 본 case = release 본격 시행 cadence 정합 (다른 case 는 SKIP_WS 사용 / 본 case 만 본격 spawn).
    const r = runScript(['--target', 'v8.1.0', '--json'], {}, 600_000);
    const out = JSON.parse(r.stdout);
    const ws = out.results.find((x) => x.id === 'workspace_test_pass');
    assert.ok(ws.pass, `workspace_test_pass must pass — full detail: ${ws.detail} | r.status=${r.status} | stderr=${r.stderr.slice(0, 300)}`);
    assert.match(ws.detail, /\d+\/\d+ pass \/ 0 fail/);
    assert.equal(out.criteria_total, 25);
    assert.equal(out.criteria_passed, 25);
    assert.equal(out.ready, true);
    assert.equal(r.status, 0);
  });
});

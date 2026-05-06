// lint-no-simulation.sh chain 3/4 enforcement test (★ ★ v2.0 sub-plan-3a).
// shell 스크립트 직접 실행 → exit code + stderr 검증.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(__dirname, '..', 'src', 'lint-no-simulation.sh');

function setupTmp() {
  return mkdtempSync(join(tmpdir(), 'lint-chain-'));
}

function runScript(dir, extraArgs = []) {
  const r = spawnSync('bash', [SCRIPT, dir, ...extraArgs], { encoding: 'utf-8' });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status };
}

const FULL_EVIDENCE = {
  test_runner_version: 'jest 29.7.0',
  test_runner_stdout_path: './evidence/stdout.txt',
  invocation_timestamp: '2026-05-06T10:00:00Z',
  duration_ms: 12345,
  pass_count: 10,
  fail_count: 0,
  skip_count: 0,
  reproduction_command: 'npm test',
  result_hash: 'sha256:abcdef',
  report_format: 'sarif-2.1.0',
};

test('★ chain 3 — test-spec.json 정합 evidence → exit 0', () => {
  const dir = setupTmp();
  try {
    writeFileSync(join(dir, 'test-spec.json'), JSON.stringify({
      meta: { confidence: 0.9 },
      derivation_source: { acceptance_criteria_path: './acceptance-criteria.json', behavior_spec_path: './behavior-spec.json' },
      test_cases: [],
      test_invocation_evidence: FULL_EVIDENCE,
    }, null, 2));
    const r = runScript(dir);
    assert.equal(r.code, 0, `expected 0, got ${r.code} — ${r.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain 3 — test-spec.json evidence 누락 1 필드 → exit 1', () => {
  const dir = setupTmp();
  try {
    const evidence = { ...FULL_EVIDENCE };
    delete evidence.result_hash;
    writeFileSync(join(dir, 'test-spec.json'), JSON.stringify({
      derivation_source: {},
      test_invocation_evidence: evidence,
    }, null, 2));
    const r = runScript(dir);
    assert.equal(r.code, 1, `expected 1 (result_hash missing), got ${r.code}`);
    assert.ok(r.stderr.includes('result_hash'), `expected stderr mention result_hash, got: ${r.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain 4 — impl-spec.json source_files 있는데 commit_hash 없으면 exit 1', () => {
  const dir = setupTmp();
  try {
    writeFileSync(join(dir, 'impl-spec.json'), JSON.stringify({
      derivation_source: { test_spec_path: './test-spec.json', behavior_spec_path: './behavior-spec.json' },
      impl_modules: [{ id: 'IMPL-USER-001', source_files: ['./src/user.controller.ts'] }],
      test_invocation_evidence: FULL_EVIDENCE,
    }, null, 2));
    const r = runScript(dir);
    assert.equal(r.code, 1, `expected 1, got ${r.code} (commit_hash missing)`);
    assert.ok(r.stderr.includes('commit_hash'), `expected stderr mention commit_hash, got: ${r.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain mode auto — test-spec 자체 부재면 통과 (analysis 디렉토리 호환)', () => {
  const dir = setupTmp();
  try {
    writeFileSync(join(dir, 'rules.json'), '{}\n');
    const r = runScript(dir);
    assert.equal(r.code, 0, `expected 0, got ${r.code} (auto mode skip)`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain mode strict — test-spec 부재 시 위반 ❌ / impl-spec 부재 시 strict 위반 ✅', () => {
  const dir = setupTmp();
  try {
    writeFileSync(join(dir, 'impl-spec.json'), JSON.stringify({
      derivation_source: {},
      impl_modules: [],
    }, null, 2));
    const r = runScript(dir, ['--chain-strict']);
    assert.equal(r.code, 1, `expected 1 (impl-spec without test_invocation_evidence in strict mode), got ${r.code}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

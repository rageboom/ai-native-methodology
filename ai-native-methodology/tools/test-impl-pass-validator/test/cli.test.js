// CLI integration test — --allow-execute / --dry-run / config loading / evidence writeback.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { loadTestCmd, inferFromStackSignals } from '../src/load-test-cmd.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

function runCli(args, env = {}) {
  const r = spawnSync('node', [CLI, ...args], { encoding: 'utf-8', env: { ...process.env, ...env } });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status };
}

function setupProject() {
  const dir = mkdtempSync(join(tmpdir(), 'tipv-'));
  mkdirSync(join(dir, '.aimd', 'config'), { recursive: true });
  return dir;
}

test('★ load-test-cmd — inventory 추론 (nodejs+jest)', () => {
  const r = inferFromStackSignals(['nodejs', 'jest']);
  assert.equal(r.framework, 'jest');
  assert.equal(r.test_cmd, 'npm');
  assert.deepEqual(r.test_cmd_args, ['test']);
});

test('★ load-test-cmd — config 우선 (config:path source)', () => {
  const dir = setupProject();
  try {
    const cfg = {
      framework: 'jest',
      framework_version: '29.7.0',
      test_cmd: 'npx',
      test_cmd_args: ['jest'],
      allow_execute: false,
    };
    writeFileSync(join(dir, '.aimd', 'config', 'test-cmd.json'), JSON.stringify(cfg));
    const r = loadTestCmd({ sourceProjectDir: dir });
    assert.ok(r.source.startsWith('config:'));
    assert.equal(r.resolved.framework, 'jest');
    assert.equal(r.resolved.test_cmd, 'npx');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ load-test-cmd — 부재 + inventory 부재 → unresolved', () => {
  const dir = setupProject();
  try {
    const r = loadTestCmd({ sourceProjectDir: dir });
    assert.equal(r.resolved, null);
    assert.match(r.error, /test-cmd contract/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ CLI — --allow-execute 부재 + --dry-run 부재 → exit 2', () => {
  const dir = setupProject();
  try {
    const cfg = {
      framework: 'jest', test_cmd: 'echo', test_cmd_args: ['ok'],
    };
    writeFileSync(join(dir, '.aimd', 'config', 'test-cmd.json'), JSON.stringify(cfg));
    const r = runCli(['--project', dir]);
    assert.equal(r.code, 2, `expected 2, got ${r.code} / stderr: ${r.stderr}`);
    assert.ok(r.stderr.includes('--allow-execute') || r.stderr.includes('ADR-CHAIN-004'),
      `expected stderr mention --allow-execute, got: ${r.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ CLI — --dry-run → exit 0 (allow-execute 부재 OK)', () => {
  const dir = setupProject();
  try {
    const cfg = {
      framework: 'jest', test_cmd: 'echo', test_cmd_args: ['ok'],
    };
    writeFileSync(join(dir, '.aimd', 'config', 'test-cmd.json'), JSON.stringify(cfg));
    const r = runCli(['--project', dir, '--dry-run', '--json']);
    assert.equal(r.code, 0, `stderr: ${r.stderr}, stdout: ${r.stdout}`);
    const parsed = JSON.parse(r.stdout);
    assert.equal(parsed.mode, 'dry-run');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ CLI — config 부재 → exit 2 (--dry-run 이어도)', () => {
  const dir = setupProject();
  try {
    const r = runCli(['--project', dir, '--dry-run']);
    assert.equal(r.code, 2, `expected 2 (config 부재), got ${r.code}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ CLI — --project 부재 → usage exit 2', () => {
  const r = runCli([]);
  assert.equal(r.code, 2);
});

test('★ CLI — inventory.stack_signals 자동 추론 + dry-run', () => {
  const dir = setupProject();
  try {
    const inventoryPath = join(dir, 'inventory.json');
    writeFileSync(inventoryPath, JSON.stringify({ stack_signals: ['nodejs', 'jest'] }));
    const r = runCli(['--project', dir, '--inventory', inventoryPath, '--dry-run', '--json']);
    assert.equal(r.code, 0, `stderr: ${r.stderr}`);
    const parsed = JSON.parse(r.stdout);
    assert.equal(parsed.framework, 'jest');
    assert.equal(parsed.source, 'inventory-inference');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ★ F-I05 — S2 per-TC outcome reconcile end-to-end (node -e 로 jest --json stdout 모사).
function jestRunnerScript(jestOut) {
  return `process.stdout.write(${JSON.stringify(JSON.stringify(jestOut))})`;
}
function setupS2(dir, jestOut) {
  const cfg = { framework: 'jest', test_cmd: process.execPath, test_cmd_args: ['-e', jestRunnerScript(jestOut)] };
  writeFileSync(join(dir, '.aimd', 'config', 'test-cmd.json'), JSON.stringify(cfg));
  const specPath = join(dir, 'test-spec.json');
  writeFileSync(specPath, JSON.stringify({ test_cases: [
    { id: 'TC-CHAR-001', expected_outcome: 'pass', test_intent: 'characterization' },
    { id: 'TC-AUG-001', expected_outcome: 'fail', test_intent: 'augmentation' },
  ]}));
  return specPath;
}

test('★ F-I05 — S2 reconcile: characterization pass + augmentation fail = 전부 일치 → outcome_mismatches 0', () => {
  const dir = setupProject();
  try {
    const jestOut = {
      success: false, numTotalTests: 2, numPassedTests: 1, numFailedTests: 1, numPendingTests: 0,
      testResults: [{ assertionResults: [
        { fullName: 'TC-CHAR-001 legacy login works', status: 'passed' },
        { fullName: 'TC-AUG-001 new feature missing impl', status: 'failed' },
      ]}],
    };
    const specPath = setupS2(dir, jestOut);
    const r = runCli(['--project', dir, '--allow-execute', '--json', '--scenario', 'S2', '--test-spec', specPath]);
    const parsed = JSON.parse(r.stdout);
    assert.equal(parsed.outcome_mismatches, 0, `stdout=${r.stdout} stderr=${r.stderr}`);
    assert.equal(parsed.missing_actual, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ F-I05 — S2 reconcile: augmentation 이 예상외 pass → outcome_mismatches 1 (gate s2_outcome_mismatch WARN)', () => {
  const dir = setupProject();
  try {
    const jestOut = {
      success: true, numTotalTests: 2, numPassedTests: 2, numFailedTests: 0, numPendingTests: 0,
      testResults: [{ assertionResults: [
        { fullName: 'TC-CHAR-001 legacy login works', status: 'passed' },
        { fullName: 'TC-AUG-001 new feature', status: 'passed' },
      ]}],
    };
    const specPath = setupS2(dir, jestOut);
    const r = runCli(['--project', dir, '--allow-execute', '--json', '--scenario', 'S2', '--test-spec', specPath]);
    const parsed = JSON.parse(r.stdout);
    assert.equal(parsed.outcome_mismatches, 1, `stdout=${r.stdout} stderr=${r.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ F-I05 — --scenario 부재 → outcome_mismatches 필드 omit (S1 backward-compat)', () => {
  const dir = setupProject();
  try {
    const jestOut = {
      success: true, numTotalTests: 1, numPassedTests: 1, numFailedTests: 0, numPendingTests: 0,
      testResults: [{ assertionResults: [{ fullName: 'TC-CHAR-001 x', status: 'passed' }] }],
    };
    const cfg = { framework: 'jest', test_cmd: process.execPath, test_cmd_args: ['-e', jestRunnerScript(jestOut)] };
    writeFileSync(join(dir, '.aimd', 'config', 'test-cmd.json'), JSON.stringify(cfg));
    const r = runCli(['--project', dir, '--allow-execute', '--json']);
    const parsed = JSON.parse(r.stdout);
    assert.equal(parsed.outcome_mismatches, undefined);
    assert.equal(parsed.s2_reconcile, undefined);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

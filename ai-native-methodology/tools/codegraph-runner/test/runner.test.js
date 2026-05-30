import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  preflight, runCodeGraph, readStatus,
  CodeGraphEnvironmentMissing, EVIDENCE_TRUST, REQUIRED_EVIDENCE,
} from '../src/runner.js';

test('preflight throws CodeGraphEnvironmentMissing for absent executable (no-simulation 정직 신호)', () => {
  assert.throws(
    () => preflight('codegraph-nonexistent-xyz-99999'),
    (err) => err instanceof CodeGraphEnvironmentMissing && err.code === 'ENV_MISSING',
  );
});

test('REQUIRED_EVIDENCE = static-runner 7-field 정합', () => {
  assert.equal(REQUIRED_EVIDENCE.length, 7);
  assert.ok(REQUIRED_EVIDENCE.includes('result_hash'));
  assert.ok(REQUIRED_EVIDENCE.includes('reproduction_command'));
});

test('EVIDENCE_TRUST = real_tool / simulated (no Tier 2 import for codegraph)', () => {
  assert.equal(EVIDENCE_TRUST.REAL_TOOL, 'real_tool');
  assert.equal(EVIDENCE_TRUST.SIMULATED, 'simulated');
});

// ★ 실 smoke — codegraph present 시 실제 index / 부재 시 honest skip (R19 env-dependent / no-simulation).
test('smoke: real codegraph index on JS fixture → real_tool evidence + initialized stats', (t) => {
  try {
    preflight();
  } catch (err) {
    if (err instanceof CodeGraphEnvironmentMissing) {
      t.skip('codegraph 환경 부재 — honest skip (R19 Tier 1 env-dependent / no-simulation / CI 정합)');
      return;
    }
    throw err;
  }

  const dir = mkdtempSync(join(tmpdir(), 'cg-runner-smoke-'));
  try {
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(
      join(dir, 'src', 'm.js'),
      'export function a(){ return 1; }\nexport function b(){ return a() + a(); }\n',
    );
    const out = join(dir, 'out');
    const res = runCodeGraph({ targetDir: dir, outputDir: out });

    assert.equal(res.status.initialized, true, 'index initialized');
    assert.ok(res.status.fileCount >= 1, 'at least 1 file indexed');
    assert.ok(res.status.nodeCount >= 1, 'at least 1 node');
    assert.equal(res.evidence.evidence_trust, EVIDENCE_TRUST.REAL_TOOL);
    for (const f of REQUIRED_EVIDENCE) {
      assert.ok(res.evidence[f] !== undefined && res.evidence[f] !== null, `evidence.${f} present`);
    }
    assert.match(res.evidence.result_hash, /^[a-f0-9]{64}$/);

    // readStatus 재호출 = 결정적 (동일 통계)
    const again = readStatus(dir);
    assert.equal(again.fileCount, res.status.fileCount);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

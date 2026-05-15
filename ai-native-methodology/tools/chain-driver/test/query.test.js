// query.test.js — G3 D12 Lookup 인터페이스.
// RED 시점 (query module 부재).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ensureScopeDir, writeManifest } from '../src/state-store.js';
import { executeQuery } from '../src/query.js';

let tmp;
before(() => { tmp = mkdtempSync(join(tmpdir(), 'chain-driver-query-')); });
after(() => { rmSync(tmp, { recursive: true, force: true }); });

function seedScope(root, scope, opts = {}) {
  ensureScopeDir(root, scope);
  writeManifest(root, scope, null, {
    scope,
    status: opts.status || 'in_progress',
    current_stage: opts.current_stage || 'planning',
    analysis_refs: opts.analysis_refs || { rules: [], endpoints: [], schemas: [] },
    sync_state: {
      drift_detected: opts.drift_detected || false,
      sync_sources: [],
    },
  });
  for (const [stage, manifest] of Object.entries(opts.stages || {})) {
    writeManifest(root, scope, stage, { scope, stage, ...manifest });
  }
}

describe('executeQuery', () => {
  it('--scope returns single scope manifest', () => {
    const root = join(tmp, 'q1');
    seedScope(root, 'user-registration', { status: 'in_progress' });
    const result = executeQuery(root, { scope: 'user-registration' });
    assert.equal(result.length, 1);
    assert.equal(result[0].scope, 'user-registration');
    assert.equal(result[0].status, 'in_progress');
  });

  it('--scope + --stage returns stage manifest', () => {
    const root = join(tmp, 'q2');
    seedScope(root, 'user-registration', {
      stages: { planning: { status: 'complete', linked_artifacts: ['planning-spec.json'] } },
    });
    const result = executeQuery(root, { scope: 'user-registration', stage: 'planning' });
    assert.equal(result.length, 1);
    assert.equal(result[0].stage, 'planning');
    assert.equal(result[0].status, 'complete');
  });

  it('--ref returns scopes that reference the given BR', () => {
    const root = join(tmp, 'q3');
    seedScope(root, 'user-registration', {
      analysis_refs: { rules: ['BR-AUTH-001', 'BR-AUTH-002'], endpoints: [], schemas: [] },
    });
    seedScope(root, 'payment-flow', {
      analysis_refs: { rules: ['BR-PAY-001'], endpoints: [], schemas: [] },
    });
    const result = executeQuery(root, { ref: 'BR-AUTH-001' });
    assert.equal(result.length, 1);
    assert.equal(result[0].scope, 'user-registration');
  });

  it('--ref returns multiple scopes when shared', () => {
    const root = join(tmp, 'q4');
    seedScope(root, 'user-registration', {
      analysis_refs: { rules: ['BR-AUTH-001'], endpoints: [], schemas: [] },
    });
    seedScope(root, 'admin-flow', {
      analysis_refs: { rules: ['BR-AUTH-001'], endpoints: [], schemas: [] },
    });
    const result = executeQuery(root, { ref: 'BR-AUTH-001' });
    assert.equal(result.length, 2);
    const scopes = result.map((r) => r.scope).sort();
    assert.deepEqual(scopes, ['admin-flow', 'user-registration']);
  });

  it('--stale returns only scopes with drift_detected=true', () => {
    const root = join(tmp, 'q5');
    seedScope(root, 'user-registration', { drift_detected: true });
    seedScope(root, 'payment-flow', { drift_detected: false });
    const result = executeQuery(root, { stale: true });
    assert.equal(result.length, 1);
    assert.equal(result[0].scope, 'user-registration');
  });

  it('empty result when no scope matches', () => {
    const root = join(tmp, 'q6');
    seedScope(root, 'user-registration');
    const result = executeQuery(root, { scope: 'nonexistent' });
    assert.equal(result.length, 0);
  });

  it('no args returns all scope manifests', () => {
    const root = join(tmp, 'q7');
    seedScope(root, 'user-registration');
    seedScope(root, 'payment-flow');
    const result = executeQuery(root, {});
    assert.equal(result.length, 2);
  });

  it('--ref also indexes endpoints', () => {
    const root = join(tmp, 'q8');
    seedScope(root, 'user-registration', {
      analysis_refs: { rules: [], endpoints: ['POST /api/users'], schemas: [] },
    });
    const result = executeQuery(root, { ref: 'POST /api/users' });
    assert.equal(result.length, 1);
  });
});

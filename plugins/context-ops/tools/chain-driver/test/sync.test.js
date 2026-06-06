// sync.test.js — G3 M4 동기화 메커니즘 (자동 drift 감지 + 수동 갱신).
// RED 시점 (sync module 부재).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  ensureScopeDir,
  writeManifest,
  readManifest,
} from '../src/state-store.js';
import {
  hashFile,
  detectDrift,
  markDrift,
  cascade,
} from '../src/sync.js';

let tmp;
before(() => { tmp = mkdtempSync(join(tmpdir(), 'chain-driver-sync-')); });
after(() => { rmSync(tmp, { recursive: true, force: true }); });

function seedCanonical(root, filename, content) {
  const dir = join(root, '.aimd', 'output');
  mkdirSync(dir, { recursive: true });
  const p = join(dir, filename);
  writeFileSync(p, content);
  return p;
}

describe('hashFile', () => {
  it('returns stable sha256 for same content', () => {
    const root = join(tmp, 'h1');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    const h1 = hashFile(p);
    const h2 = hashFile(p);
    assert.equal(h1, h2);
    assert.match(h1, /^sha256:[a-f0-9]{64}$/);
  });

  it('changes when content changes', () => {
    const root = join(tmp, 'h2');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    const h1 = hashFile(p);
    writeFileSync(p, '{"BR":"AUTH-002"}');
    const h2 = hashFile(p);
    assert.notEqual(h1, h2);
  });
});

describe('detectDrift', () => {
  it('returns drift=false when sync_sources match current hash', () => {
    const root = join(tmp, 'd1');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    const currentHash = hashFile(p);
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: {
        sync_sources: [{ path: '.aimd/output/rules.json', version: currentHash }],
        drift_detected: false,
      },
    });
    const result = detectDrift(root, 'user-registration');
    assert.equal(result.drift_detected, false);
    assert.equal(result.changed_sources.length, 0);
  });

  it('returns drift=true when canonical changed', () => {
    const root = join(tmp, 'd2');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    const oldHash = hashFile(p);
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: {
        sync_sources: [{ path: '.aimd/output/rules.json', version: oldHash }],
        drift_detected: false,
      },
    });
    writeFileSync(p, '{"BR":"AUTH-001","BR2":"AUTH-002"}');
    const result = detectDrift(root, 'user-registration');
    assert.equal(result.drift_detected, true);
    assert.equal(result.changed_sources.length, 1);
    assert.equal(result.changed_sources[0].path, '.aimd/output/rules.json');
  });

  it('handles missing canonical file as drift', () => {
    const root = join(tmp, 'd3');
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: {
        sync_sources: [{ path: '.aimd/output/rules.json', version: 'sha256:deadbeef' }],
        drift_detected: false,
      },
    });
    const result = detectDrift(root, 'user-registration');
    assert.equal(result.drift_detected, true);
  });
});

describe('markDrift', () => {
  it('sets drift_detected=true on changed scopes', () => {
    const root = join(tmp, 'm1');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    const oldHash = hashFile(p);
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: {
        sync_sources: [{ path: '.aimd/output/rules.json', version: oldHash }],
        drift_detected: false,
      },
    });
    writeFileSync(p, '{"BR":"AUTH-001","BR2":"AUTH-002"}');
    const summary = markDrift(root);
    assert.equal(summary.marked.length, 1);
    assert.equal(summary.marked[0], 'user-registration');
    const m = readManifest(root, 'user-registration');
    assert.equal(m.sync_state.drift_detected, true);
  });

  it('skips scopes that are already in sync', () => {
    const root = join(tmp, 'm2');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    const currentHash = hashFile(p);
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: {
        sync_sources: [{ path: '.aimd/output/rules.json', version: currentHash }],
        drift_detected: false,
      },
    });
    const summary = markDrift(root);
    assert.equal(summary.marked.length, 0);
  });

  it('iterates over multiple scopes', () => {
    const root = join(tmp, 'm3');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    const oldHash = hashFile(p);
    for (const scope of ['user-registration', 'payment-flow']) {
      ensureScopeDir(root, scope);
      writeManifest(root, scope, null, {
        scope,
        sync_state: {
          sync_sources: [{ path: '.aimd/output/rules.json', version: oldHash }],
          drift_detected: false,
        },
      });
    }
    writeFileSync(p, 'changed');
    const summary = markDrift(root);
    assert.equal(summary.marked.length, 2);
  });
});

describe('cascade (M4 manual)', () => {
  it('no-op when drift_detected=false', () => {
    const root = join(tmp, 'c1');
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: { drift_detected: false, sync_sources: [] },
    });
    const result = cascade(root, 'user-registration');
    assert.equal(result.cascaded, false);
    assert.match(result.reason, /no drift/i);
  });

  it('clears drift_detected and updates last_synced_at when drift present', () => {
    const root = join(tmp, 'c2');
    const p = seedCanonical(root, 'rules.json', '{"BR":"AUTH-001"}');
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: {
        sync_sources: [{ path: '.aimd/output/rules.json', version: 'sha256:stale' }],
        drift_detected: true,
      },
    });
    const result = cascade(root, 'user-registration');
    assert.equal(result.cascaded, true);
    const m = readManifest(root, 'user-registration');
    assert.equal(m.sync_state.drift_detected, false);
    assert.ok(m.sync_state.last_synced_at);
    assert.equal(m.sync_state.sync_sources[0].version, hashFile(p));
  });

  it('throws when scope does not exist', () => {
    const root = join(tmp, 'c3');
    assert.throws(() => cascade(root, 'nonexistent'), /scope not found/i);
  });
});

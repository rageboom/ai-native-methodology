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
  registerCanonicalSources,
  CANONICAL_ANALYSIS_FILES,
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

// living-sync Phase 3a (DEC §13) — cross-scope drift 기계 활성화 (sync_sources 충전).
describe('registerCanonicalSources (Phase 3a / 기계 활성화)', () => {
  it('실제 canonical 파일명 등록 (business-rules.json — rules.json ❌ / Senior #1 BLOCKER 가드)', () => {
    const root = join(tmp, 'reg1');
    ensureScopeDir(root, 'scope-a');
    seedCanonical(root, 'business-rules.json', '{"business_rules":[{"id":"BR-1"}]}');
    seedCanonical(root, 'domain.json', '{"d":1}');
    const r = registerCanonicalSources(root, 'scope-a');
    const paths = r.registered.map((s) => s.path);
    assert.ok(paths.includes('.aimd/output/business-rules.json'), 'business-rules.json 등록');
    assert.ok(paths.includes('.aimd/output/domain.json'));
    // 부재 canonical = skip (날조 ❌)
    assert.ok(r.skipped.includes('openapi.yaml'));
    // allowlist 에 잘못된 라벨명 없음
    assert.ok(!CANONICAL_ANALYSIS_FILES.includes('rules.json'));
    assert.ok(!CANONICAL_ANALYSIS_FILES.includes('schema.json'));
    assert.ok(CANONICAL_ANALYSIS_FILES.includes('business-rules.json'));
    assert.ok(CANONICAL_ANALYSIS_FILES.includes('db-schema.json'));
  });

  it('manifest 에 sync_sources 기록 + hash 정확 + idempotent', () => {
    const root = join(tmp, 'reg2');
    ensureScopeDir(root, 'scope-a');
    const p = seedCanonical(root, 'business-rules.json', '{"x":1}');
    registerCanonicalSources(root, 'scope-a');
    const m = readManifest(root, 'scope-a');
    const src = m.sync_state.sync_sources.find((s) => s.path.endsWith('business-rules.json'));
    assert.equal(src.version, hashFile(p));
    assert.equal(m.sync_state.drift_detected, false);
    // idempotent (재등록 동일)
    const before = JSON.stringify(readManifest(root, 'scope-a').sync_state.sync_sources);
    registerCanonicalSources(root, 'scope-a');
    assert.equal(JSON.stringify(readManifest(root, 'scope-a').sync_state.sync_sources), before);
  });

  it('등록 후 detectDrift = 무드리프트 / canonical 변경 시 drift', () => {
    const root = join(tmp, 'reg3');
    ensureScopeDir(root, 'scope-a');
    seedCanonical(root, 'business-rules.json', '{"v":1}');
    registerCanonicalSources(root, 'scope-a');
    assert.equal(detectDrift(root, 'scope-a').drift_detected, false);
    seedCanonical(root, 'business-rules.json', '{"v":2}'); // canonical 변경
    assert.equal(detectDrift(root, 'scope-a').drift_detected, true);
  });

  it('throws when scope does not exist', () => {
    assert.throws(() => registerCanonicalSources(join(tmp, 'nope'), 'nonexistent'), /scope not found/i);
  });
});

describe('cross-scope drift e2e (Phase 3a / 2-scope 기계 메커니즘 / 1-도메인 합성)', () => {
  it('2 scope 동일 canonical 의존 → 변경 시 양 scope drift → cascade 1개 → 나머지만', () => {
    const root = join(tmp, 'xscope');
    ensureScopeDir(root, 'scope-a');
    ensureScopeDir(root, 'scope-b');
    seedCanonical(root, 'business-rules.json', '{"rules":["a"]}');
    // 양 scope 등록 (baseline in-sync)
    registerCanonicalSources(root, 'scope-a');
    registerCanonicalSources(root, 'scope-b');
    assert.deepEqual(markDrift(root).marked, []); // 무변경
    // canonical 변경 → 양 scope drift
    seedCanonical(root, 'business-rules.json', '{"rules":["a","b"]}');
    assert.deepEqual(markDrift(root).marked.sort(), ['scope-a', 'scope-b']);
    // cascade scope-a → scope-a clear, scope-b 잔존
    cascade(root, 'scope-a');
    assert.deepEqual(markDrift(root).marked, ['scope-b']);
  });
});

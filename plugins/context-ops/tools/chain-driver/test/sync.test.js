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
  hashBusinessRulesSubset,
  diffBusinessRulesByRule,
  listUnbaselinedScopes,
} from '../src/sync.js';

let tmp;
before(() => { tmp = mkdtempSync(join(tmpdir(), 'chain-driver-sync-')); });
after(() => { rmSync(tmp, { recursive: true, force: true }); });

function seedCanonical(root, filename, content) {
  const dir = join(root, '.ai-context', 'output');
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
        sync_sources: [{ path: '.ai-context/output/rules.json', version: currentHash }],
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
        sync_sources: [{ path: '.ai-context/output/rules.json', version: oldHash }],
        drift_detected: false,
      },
    });
    writeFileSync(p, '{"BR":"AUTH-001","BR2":"AUTH-002"}');
    const result = detectDrift(root, 'user-registration');
    assert.equal(result.drift_detected, true);
    assert.equal(result.changed_sources.length, 1);
    assert.equal(result.changed_sources[0].path, '.ai-context/output/rules.json');
  });

  it('handles missing canonical file as drift', () => {
    const root = join(tmp, 'd3');
    ensureScopeDir(root, 'user-registration');
    writeManifest(root, 'user-registration', null, {
      scope: 'user-registration',
      sync_state: {
        sync_sources: [{ path: '.ai-context/output/rules.json', version: 'sha256:deadbeef' }],
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
        sync_sources: [{ path: '.ai-context/output/rules.json', version: oldHash }],
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
        sync_sources: [{ path: '.ai-context/output/rules.json', version: currentHash }],
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
          sync_sources: [{ path: '.ai-context/output/rules.json', version: oldHash }],
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
        sync_sources: [{ path: '.ai-context/output/rules.json', version: 'sha256:stale' }],
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
    assert.ok(paths.includes('.ai-context/output/business-rules.json'), 'business-rules.json 등록');
    assert.ok(paths.includes('.ai-context/output/domain.json'));
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

// living-sync S2 (DEC §17) — BR BC-subset hash (cross-scope drift FP 제거).
describe('S2 — hashBusinessRulesSubset (결정성)', () => {
  it('같은 입력 → 같은 hash / key 순서 무관 (canonical)', () => {
    const root = join(tmp, 's2h1');
    const p1 = seedCanonical(root, 'business-rules.json', JSON.stringify({ business_rules: [{ id: 'BR-1', bounded_context: 'BC-POST', note: 'x' }] }));
    const h1 = hashBusinessRulesSubset(p1, ['BC-POST']);
    // 동일 semantic, key 순서만 변경
    seedCanonical(root, 'business-rules.json', JSON.stringify({ business_rules: [{ bounded_context: 'BC-POST', note: 'x', id: 'BR-1' }] }));
    const h2 = hashBusinessRulesSubset(p1, ['BC-POST']);
    assert.equal(h1, h2, 'intra-object key 재정렬 무력화');
    assert.match(h1, /^sha256:[a-f0-9]{64}$/);
  });

  it('BC 필터 — 선언 BC subset 만 반영', () => {
    const root = join(tmp, 's2h2');
    const p1 = seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\"},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    const hUser = hashBusinessRulesSubset(p1, ['BC-USER']);
    // BC-POST rule 변경 → BC-USER subset hash 불변
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\",\"changed\":true},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    assert.equal(hashBusinessRulesSubset(p1, ['BC-USER']), hUser, 'BC-POST 변경 → BC-USER subset 불변');
  });
});

describe('S2 — registerCanonicalSources / detectDrift subset 분기', () => {
  it('--bc → BR entry 에 bounded_contexts + subset version / 그 외 canonical = file-hash', () => {
    const root = join(tmp, 's2r1');
    ensureScopeDir(root, 'scope-user');
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\"},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    seedCanonical(root, 'domain.json', '{"d":1}');
    const r = registerCanonicalSources(root, 'scope-user', { bcs: ['BC-USER'] });
    const m = readManifest(root, 'scope-user');
    const br = m.sync_state.sync_sources.find((x) => x.path.endsWith('business-rules.json'));
    const dom = m.sync_state.sync_sources.find((x) => x.path.endsWith('domain.json'));
    assert.deepEqual(br.bounded_contexts, ['BC-USER']);
    assert.equal(br.version, hashBusinessRulesSubset(join(root, '.ai-context', 'output', 'business-rules.json'), ['BC-USER']));
    assert.equal(dom.bounded_contexts, undefined, '그 외 canonical = bounded_contexts 부재(file-hash)');
    assert.equal(r.subsets[0].subset_count, 1, 'subset_count 노출 (ghost-monitor 감지)');
  });

  it('★ FP 제거 — BC-POST rule 변경은 BC-USER scope 무드리프트 / BC-USER 변경은 drift', () => {
    const root = join(tmp, 's2r2');
    ensureScopeDir(root, 'scope-user');
    const abs = seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\"},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    registerCanonicalSources(root, 'scope-user', { bcs: ['BC-USER'] });
    assert.equal(detectDrift(root, 'scope-user').drift_detected, false);
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\",\"changed\":true},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}"); // BC-POST 만 변경
    assert.equal(detectDrift(root, 'scope-user').drift_detected, false, 'BC-POST 변경 = BC-USER scope FP 제거');
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\",\"changed\":true},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\",\"changed\":true}]}"); // BC-USER 변경
    assert.equal(detectDrift(root, 'scope-user').drift_detected, true, 'BC-USER 변경 = drift');
    assert.ok(abs);
  });

  it('backward-compat — --bc 미지정 = file-hash (bounded_contexts 키 부재 / idempotent)', () => {
    const root = join(tmp, 's2r3');
    ensureScopeDir(root, 'scope-a');
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\"},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    registerCanonicalSources(root, 'scope-a');
    const br = readManifest(root, 'scope-a').sync_state.sync_sources.find((x) => x.path.endsWith('business-rules.json'));
    assert.equal(br.bounded_contexts, undefined, '미지정 = bounded_contexts 키 부재');
    const before = JSON.stringify(readManifest(root, 'scope-a').sync_state.sync_sources);
    registerCanonicalSources(root, 'scope-a');
    assert.equal(JSON.stringify(readManifest(root, 'scope-a').sync_state.sync_sources), before, 'idempotent');
  });
});

describe('S2 — cascade subset 보존 (BLOCKER-1 회귀 가드)', () => {
  it('cascade 후 bounded_contexts 보존 + subset 정밀 유지 (file-hash 퇴화 ❌)', () => {
    const root = join(tmp, 's2c1');
    ensureScopeDir(root, 'scope-user');
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\"},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    registerCanonicalSources(root, 'scope-user', { bcs: ['BC-USER'] });
    // BC-USER 변경 → drift → cascade
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\"},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\",\"changed\":true}]}");
    markDrift(root);
    cascade(root, 'scope-user');
    const br = readManifest(root, 'scope-user').sync_state.sync_sources.find((x) => x.path.endsWith('business-rules.json'));
    assert.deepEqual(br.bounded_contexts, ['BC-USER'], 'cascade 가 bounded_contexts 보존');
    // cascade 후 BC-POST 만 변경 → 여전히 무드리프트 (subset 정밀 유지)
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\",\"changed\":true},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\",\"changed\":true}]}");
    assert.equal(detectDrift(root, 'scope-user').drift_detected, false, 'cascade 후에도 BC-POST 변경 무드리프트');
  });
});

describe('S2 — cross-scope FP 제거 e2e (§14 재현 / 2-scope / 1-도메인 합성)', () => {
  it('BC-POST rule 변경 → scope-post 만 drift (scope-user FP 제거) / 공유 domain 변경 → 양 scope', () => {
    const root = join(tmp, 's2e1');
    ensureScopeDir(root, 'scope-post');
    ensureScopeDir(root, 'scope-user');
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\"},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    seedCanonical(root, 'domain.json', '{"d":1}');
    registerCanonicalSources(root, 'scope-post', { bcs: ['BC-POST'] });
    registerCanonicalSources(root, 'scope-user', { bcs: ['BC-USER'] });
    assert.deepEqual(markDrift(root).marked, [], 'baseline in-sync');
    // BC-POST 전용 변경
    seedCanonical(root, 'business-rules.json', "{\"business_rules\":[{\"id\":\"BR-POST-1\",\"bounded_context\":\"BC-POST\",\"changed\":true},{\"id\":\"BR-USER-1\",\"bounded_context\":\"BC-USER\"}]}");
    assert.deepEqual(markDrift(root).marked, ['scope-post'], 'BC-POST 변경 → scope-post 만 (3a 대비 scope-user FP 제거)');
    // 공유 domain.json 변경 → 양 scope (file-hash)
    seedCanonical(root, 'domain.json', '{"d":2}');
    assert.deepEqual(markDrift(root).marked.sort(), ['scope-post', 'scope-user'], '공유 domain 변경 → 양 scope (file-hash 유지)');
  });
});

describe('S2 — schema bounded_contexts Ajv guard', () => {
  it('sync_sources entry(bounded_contexts) = schema valid / 잉여키 invalid', async () => {
    const { default: Ajv2020 } = await import('ajv/dist/2020.js');
    const { default: addFormats } = await import('ajv-formats');
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const pathMod = await import('node:path');
    const here = pathMod.dirname(fileURLToPath(import.meta.url));
    const schema = JSON.parse(readFileSync(pathMod.resolve(here, '../../../schemas/work-unit-manifest.schema.json'), 'utf8'));
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema.properties.sync_state.properties.sync_sources.items);
    const sha = 'sha256:' + 'a'.repeat(64);
    assert.ok(validate({ path: '.ai-context/output/business-rules.json', version: sha, bounded_contexts: ['BC-USER'] }), JSON.stringify(validate.errors));
    assert.ok(validate({ path: '.ai-context/output/domain.json', version: sha }), '기존 shape 유지');
    assert.ok(!validate({ path: 'x', version: sha, bogus: 1 }), '잉여키(additionalProperties:false) 차단');
  });
});

describe('carry 1 — diffBusinessRulesByRule (per-rule diff)', () => {
  it('modified(hash 상이) + added 분류 / removed 별도 / id-less skip', () => {
    const oldP = { business_rules: [
      { id: 'BR-1', bounded_context: 'BC-POST', desc: 'old' },
      { id: 'BR-2', bounded_context: 'BC-POST', desc: 'same' },
      { id: 'BR-GONE', desc: 'x' },
    ] };
    const newP = { business_rules: [
      { id: 'BR-1', bounded_context: 'BC-POST', desc: 'NEW' },
      { id: 'BR-2', bounded_context: 'BC-POST', desc: 'same' },
      { id: 'BR-3', bounded_context: 'BC-USER', desc: 'added' },
      { desc: 'id-less added' },
    ] };
    const d = diffBusinessRulesByRule(oldP, newP);
    assert.deepEqual(d.changed_rule_ids, ['BR-1', 'BR-3']);
    assert.deepEqual(d.removed_rule_ids, ['BR-GONE']);
  });

  it('key 재정렬 = no-change (canonical 결정성)', () => {
    const a = { business_rules: [{ id: 'BR-1', bounded_context: 'BC-POST', desc: 'x' }] };
    const b = { business_rules: [{ desc: 'x', id: 'BR-1', bounded_context: 'BC-POST' }] };
    assert.equal(diffBusinessRulesByRule(a, b).changed_rule_ids.length, 0);
  });

  it('빈/신규 old → 전 rule added (정렬)', () => {
    const newP = { business_rules: [{ id: 'BR-2', bounded_context: 'BC-USER' }, { id: 'BR-1', bounded_context: 'BC-POST' }] };
    assert.deepEqual(diffBusinessRulesByRule({}, newP).changed_rule_ids, ['BR-1', 'BR-2']);
  });
});

// living-sync ② honest surface (read-only) — 미-baseline scope 표면화 (DEC §24 / Senior REVISE@0.80 BLOCKER-1 (B) 반영).
describe('listUnbaselinedScopes', () => {
  const mkScope = (root, scope, syncState) => {
    ensureScopeDir(root, scope);
    writeManifest(root, scope, null, { scope, status: 'active', ...(syncState !== undefined ? { sync_state: syncState } : {}) });
  };

  it('canonical 부재 → [] (빈/미초기화 프로젝트 false-positive 차단 / anyCanonical 가드)', () => {
    const root = join(tmp, 'ub-nocanon');
    mkScope(root, 'scope-a', { sync_sources: [], drift_detected: false });
    assert.deepEqual(listUnbaselinedScopes(root), []);
  });

  it('canonical 존재 + 빈 sync_sources → 표면화', () => {
    const root = join(tmp, 'ub-empty');
    seedCanonical(root, 'business-rules.json', '{"business_rules":[]}');
    mkScope(root, 'scope-a', { sync_sources: [], drift_detected: false });
    assert.deepEqual(listUnbaselinedScopes(root), ['scope-a']);
  });

  it('canonical 존재 + absent sync_sources(sync_state 있음) → 표면화', () => {
    const root = join(tmp, 'ub-absentsrc');
    seedCanonical(root, 'domain.json', '{}');
    mkScope(root, 'scope-a', { drift_detected: false }); // sync_sources 키 자체 부재
    assert.deepEqual(listUnbaselinedScopes(root), ['scope-a']);
  });

  it('canonical 존재 + absent sync_state(통째 부재) → 표면화 (MAJOR-1 / schema-valid 도달)', () => {
    const root = join(tmp, 'ub-absentstate');
    seedCanonical(root, 'domain.json', '{}');
    mkScope(root, 'scope-a', undefined); // sync_state 키 자체 부재
    assert.deepEqual(listUnbaselinedScopes(root), ['scope-a']);
  });

  it('baseline 된 scope(sync_sources 채워짐)는 제외 + 정렬', () => {
    const root = join(tmp, 'ub-mixed');
    const p = seedCanonical(root, 'business-rules.json', '{"business_rules":[]}');
    mkScope(root, 'scope-z', { sync_sources: [{ path: '.ai-context/output/business-rules.json', version: hashFile(p) }], drift_detected: false });
    mkScope(root, 'scope-a', { sync_sources: [], drift_detected: false });
    assert.deepEqual(listUnbaselinedScopes(root), ['scope-a'], 'baseline 된 scope-z 제외');
  });

  it('read-only — manifest 미변경 (markDrift 코어 순수성 / 호출 전후 byte-identical)', () => {
    const root = join(tmp, 'ub-readonly');
    seedCanonical(root, 'domain.json', '{}');
    mkScope(root, 'scope-a', { sync_sources: [], drift_detected: false });
    const before = JSON.stringify(readManifest(root, 'scope-a'));
    listUnbaselinedScopes(root);
    listUnbaselinedScopes(root);
    assert.equal(JSON.stringify(readManifest(root, 'scope-a')), before, 'write 0');
  });
});

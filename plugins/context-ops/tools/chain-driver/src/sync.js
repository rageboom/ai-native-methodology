// sync.js — G3 M4 동기화 메커니즘.
//
// detectDrift = scope manifest 의 sync_sources 와 canonical global 현 hash 비교.
// markDrift   = 모든 scope 순회 → drift 발견 시 manifest.sync_state.drift_detected=true 자동 set.
// cascade     = 사용자 명시 호출 시만 산출물 재생성 + sync_sources version 갱신 + drift_detected=false.
//
// canonical global = .aimd/output/<5 이식성>.* — scope 횡단 공통 분석 자산.
// M4 paradigm = 자동 cascade ❌ (안전 · 통제 · false positive 회피).

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { listScopes, readManifest, writeManifest } from './state-store.js';

export function hashFile(absPath) {
  const buf = readFileSync(absPath);
  const h = createHash('sha256').update(buf).digest('hex');
  return `sha256:${h}`;
}

// living-sync Phase 3a (DEC §13) — cross-scope drift 기계 활성화.
//   canonical 분석 deliverable(5 이식성 + architecture) 중 .aimd/output/ 에 존재하는 것을 scope 의
//   sync_state.sync_sources 로 등록(path + 현 hash = baseline 체크포인트). 이후 detectDrift/markDrift 가
//   canonical 변경 시 실제 발화. 부재 파일 = skip(날조 ❌). 등록 시점 hash = "현 canonical 과 in-sync" 기준.
//   ★ 파일명 = 실제 emit 명(business-rules.json/db-schema.json — rules.json/schema.json 아님 / Senior #1 BLOCKER fix).
export const CANONICAL_ANALYSIS_FILES = Object.freeze([
  'business-rules.json',
  'domain.json',
  'openapi.yaml',
  'db-schema.json',
  'antipatterns.json',
  'migration-cautions.json',
  'architecture.json',
]);

// scope 의 sync_sources 를 현 canonical 파일 hash 로 (재)등록. 존재분만. writeManifest 로 durable.
//   @returns { registered:[{path,version}], skipped:string[] }
export function registerCanonicalSources(projectRoot, scope, opts = {}) {
  const m = readManifest(projectRoot, scope);
  if (!m) throw new Error(`registerCanonicalSources: scope not found: ${scope}`);
  const files = opts.canonicalFiles || CANONICAL_ANALYSIS_FILES;
  const registered = [];
  const skipped = [];
  for (const name of files) {
    const rel = join('.aimd', 'output', name);
    const abs = join(projectRoot, rel);
    if (!existsSync(abs)) {
      skipped.push(name);
      continue;
    }
    // path 는 posix-style repo-rel 로 정규화 (detectDrift 가 join(projectRoot, s.path) 로 해소).
    registered.push({ path: rel.split('\\').join('/'), version: hashFile(abs) });
  }
  writeManifest(projectRoot, scope, null, {
    ...m,
    sync_state: {
      ...(m.sync_state || {}),
      sync_sources: registered,
      last_synced_at: new Date().toISOString(),
      drift_detected: false,
    },
  });
  return { registered, skipped };
}

export function detectDrift(projectRoot, scope) {
  const m = readManifest(projectRoot, scope);
  if (!m) throw new Error(`detectDrift: scope not found: ${scope}`);
  const sources = (m.sync_state && m.sync_state.sync_sources) || [];
  const changed = [];
  for (const s of sources) {
    const abs = join(projectRoot, s.path);
    if (!existsSync(abs)) {
      changed.push({ path: s.path, reason: 'missing' });
      continue;
    }
    const current = hashFile(abs);
    if (current !== s.version) {
      changed.push({ path: s.path, reason: 'changed', current, expected: s.version });
    }
  }
  return {
    drift_detected: changed.length > 0,
    changed_sources: changed,
  };
}

export function markDrift(projectRoot) {
  const scopes = listScopes(projectRoot);
  const marked = [];
  for (const scope of scopes) {
    const m = readManifest(projectRoot, scope);
    if (!m) continue;
    const result = detectDrift(projectRoot, scope);
    if (!result.drift_detected) continue;
    if (m.sync_state && m.sync_state.drift_detected === true) {
      // already marked — still currently drifted but no rewrite needed
      marked.push(scope);
      continue;
    }
    writeManifest(projectRoot, scope, null, {
      ...m,
      sync_state: { ...(m.sync_state || {}), drift_detected: true },
    });
    marked.push(scope);
  }
  return { marked };
}

export function cascade(projectRoot, scope) {
  const m = readManifest(projectRoot, scope);
  if (!m) throw new Error(`cascade: scope not found: ${scope}`);
  if (!m.sync_state || m.sync_state.drift_detected !== true) {
    return { cascaded: false, reason: 'no drift detected' };
  }
  // refresh sync_sources version to current canonical hash (only for existing files).
  const newSources = (m.sync_state.sync_sources || []).map((s) => {
    const abs = join(projectRoot, s.path);
    return existsSync(abs)
      ? { path: s.path, version: hashFile(abs) }
      : s;
  });
  writeManifest(projectRoot, scope, null, {
    ...m,
    sync_state: {
      ...m.sync_state,
      drift_detected: false,
      last_synced_at: new Date().toISOString(),
      sync_sources: newSources,
    },
  });
  return { cascaded: true, sync_sources: newSources };
}

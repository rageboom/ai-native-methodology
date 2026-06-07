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
import { normalizeBusinessRules } from '../../_shared/load-business-rules.js';

export function hashFile(absPath) {
  const buf = readFileSync(absPath);
  const h = createHash('sha256').update(buf).digest('hex');
  return `sha256:${h}`;
}

// living-sync S2 (DEC §17) — business-rules.json BC-subset hash (cross-scope drift FP 제거).
//   register/detect/cascade 공유 SSOT. 결정성: rule 별 재귀 키-정렬 canonical 직렬화 → 직렬문자열 정렬 → sha256
//   (intra-object key 재정렬 무력화 + id 누락/중복 모호 회피 / Senior REVISE@0.83 BLOCKER-2 — replacer-array 는 nested key drop 결함이라 재귀 canonicalize 채택).
export const BR_CANONICAL = 'business-rules.json';
function canonicalStringify(v) {
  if (Array.isArray(v)) return '[' + v.map(canonicalStringify).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonicalStringify(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}
function subsetRules(absPath, bcs) {
  const set = new Set(bcs);
  let parsed;
  try { parsed = JSON.parse(readFileSync(absPath, 'utf8')); } catch { parsed = null; }
  return normalizeBusinessRules(parsed).filter((r) => r && set.has(r.bounded_context));
}
// BC-subset 결정적 hash (register/detect/cascade 공유).
export function hashBusinessRulesSubset(absPath, bcs) {
  const serialized = subsetRules(absPath, bcs).map(canonicalStringify).sort();
  const h = createHash('sha256').update(serialized.join('\n')).digest('hex');
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
  const bcs = Array.isArray(opts.bcs)
    ? opts.bcs.filter((b) => typeof b === 'string' && b.length > 0)
    : [];
  const registered = [];
  const subsets = [];
  const skipped = [];
  for (const name of files) {
    const rel = join('.aimd', 'output', name);
    const abs = join(projectRoot, rel);
    if (!existsSync(abs)) {
      skipped.push(name);
      continue;
    }
    // path 는 posix-style repo-rel 로 정규화 (detectDrift 가 join(projectRoot, s.path) 로 해소).
    const path = rel.split('\\').join('/');
    if (name === BR_CANONICAL && bcs.length > 0) {
      // S2: BR-한정 BC-subset hash + bounded_contexts 표기 (non-empty 일 때만 / idempotency 보호 / Senior minor-5).
      const count = subsetRules(abs, bcs).length;
      registered.push({ path, version: hashBusinessRulesSubset(abs, bcs), bounded_contexts: bcs });
      subsets.push({ path, bounded_contexts: bcs, subset_count: count }); // typo'd BC ghost-monitor 감지 (count 0 노출)
    } else {
      registered.push({ path, version: hashFile(abs) });
    }
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
  return { registered, skipped, subsets };
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
    // S2: entry 에 bounded_contexts(non-empty) → BR subset 재hash / 없으면 file-hash (3a 동작 보존).
    const current =
      Array.isArray(s.bounded_contexts) && s.bounded_contexts.length
        ? hashBusinessRulesSubset(abs, s.bounded_contexts)
        : hashFile(abs);
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
  // S2 BLOCKER-1 fix: subset entry 는 bounded_contexts 보존 + 동일 subset 헬퍼 재계산 (file-hash 로 퇴화 ❌ / cross-scope FP 부활 방지).
  const newSources = (m.sync_state.sync_sources || []).map((s) => {
    const abs = join(projectRoot, s.path);
    if (!existsSync(abs)) return s;
    if (Array.isArray(s.bounded_contexts) && s.bounded_contexts.length)
      return {
        path: s.path,
        version: hashBusinessRulesSubset(abs, s.bounded_contexts),
        bounded_contexts: s.bounded_contexts,
      };
    return { path: s.path, version: hashFile(abs) };
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

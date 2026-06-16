// sync.js — G3 M4 동기화 메커니즘.
//
// detectDrift = scope manifest 의 sync_sources 와 canonical global 현 hash 비교.
// markDrift   = 모든 scope 순회 → drift 발견 시 manifest.sync_state.drift_detected=true 자동 set.
// cascade     = 사용자 명시 호출 시만 산출물 재생성 + sync_sources version 갱신 + drift_detected=false.
//
// canonical global = .ai-context/output/<5 이식성>.* — scope 횡단 공통 분석 자산.
// M4 paradigm = 자동 cascade ❌ (안전 · 통제 · false positive 회피).

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { listScopes, readManifest, writeManifest } from './state-store.js';
import { baseFileForRead } from '../../_shared/ai-context-layout.js';
import { normalizeBusinessRules, loadBusinessRules } from '../../_shared/load-business-rules.js';

export function hashFile(absPath) {
  const buf = readFileSync(absPath);
  const h = createHash('sha256').update(buf).digest('hex');
  return `sha256:${h}`;
}

// living-sync S2 (DEC §17) — business-rules.json BC-subset hash (cross-scope drift FP 제거).
//   register/detect/cascade 공유 SSOT. 결정성: rule 별 재귀 키-정렬 canonical 직렬화 → 직렬문자열 정렬 → sha256
//   (intra-object key 재정렬 무력화 + id 누락/중복 모호 회피 / Senior REVISE@0.83 BLOCKER-2 — replacer-array 는 nested key drop 결함이라 재귀 canonicalize 채택).
export const BR_CANONICAL = 'business-rules.json';
export function canonicalStringify(v) {
  if (Array.isArray(v)) return '[' + v.map(canonicalStringify).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonicalStringify(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}
function subsetRules(absPath, bcs) {
  const set = new Set(bcs);
  // STEP 3: loadBusinessRules 가 index(`{bc_files}`)→per-BC 재조립 + 옛 단일파일 backward-compat
  //   둘 다 처리 → register/detect/cascade 의 subset-hash 가 분할 후에도 전수 rule 기준 유지.
  return loadBusinessRules(absPath, { bcFilter: (r) => r && set.has(r.bounded_context) });
}
// BC-subset 결정적 hash (register/detect/cascade 공유).
export function hashBusinessRulesSubset(absPath, bcs) {
  const serialized = subsetRules(absPath, bcs).map(canonicalStringify).sort();
  const h = createHash('sha256').update(serialized.join('\n')).digest('hex');
  return `sha256:${h}`;
}

// living-sync carry 1 — business-rules.json per-rule diff → 변경 rule id (per-BR auto-origin seed / DEC 예정).
//   각 rule 을 canonicalStringify(키-정렬 / S2 결정성 동형) → sha256. new 의 added·modified = changed.
//   id 없는 rule = skip(per-BR 노드 매핑 불가 / graph-synthesizer per-BR 도 id 必). removed = 별도(forward origin 안 함 / 소비자 stale 가능성 loud).
export function diffBusinessRulesByRule(oldParsed, newParsed) {
  const hashOf = (parsed) => {
    const m = new Map();
    for (const r of normalizeBusinessRules(parsed)) {
      if (!r || typeof r.id !== 'string') continue;
      m.set(r.id, createHash('sha256').update(canonicalStringify(r)).digest('hex'));
    }
    return m;
  };
  const oldH = hashOf(oldParsed);
  const newH = hashOf(newParsed);
  const changed = [];
  for (const [id, h] of newH) {
    if (!oldH.has(id) || oldH.get(id) !== h) changed.push(id);
  }
  const removed = [];
  for (const id of oldH.keys()) if (!newH.has(id)) removed.push(id);
  return { changed_rule_ids: changed.sort(), removed_rule_ids: removed.sort() };
}

// living-sync Phase 3a (DEC §13) — cross-scope drift 기계 활성화.
//   canonical 분석 deliverable(5 이식성 + architecture) 중 .ai-context/output/ 에 존재하는 것을 scope 의
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
  // v0.41.0 zone (DEC-2026-06-12-artifact-zone): canonical 파일이 shared/ 또는 domains/<BC>/ 로 이동 가능.
  //   manifest.analysis_refs.artifacts(name→repo-rel path) 의 basename 매칭으로 실제 위치 resolve → 없으면 평면 output/<name> fallback.
  //   detectDrift 는 저장된 s.path 를 따라가므로 등록 시점만 location-aware 면 충분.
  const artifactPaths = (m.analysis_refs && m.analysis_refs.artifacts) || {};
  const byBasename = new Map();
  for (const v of Object.values(artifactPaths)) {
    if (typeof v === 'string' && v.length > 0) byBasename.set(v.split('/').pop(), v);
  }
  for (const name of files) {
    // 폴백 = base/ (NEW) ↔ output/ (OLD) alias 의 project-rel 경로 — DEC-2026-06-16.
    const rel = (
      byBasename.get(name) ||
      relative(projectRoot, baseFileForRead(projectRoot, name))
    )
      .split('\\')
      .join('/');
    const abs = join(projectRoot, rel);
    if (!existsSync(abs)) {
      skipped.push(name);
      continue;
    }
    // path 는 posix-style repo-rel 로 정규화 (detectDrift 가 join(projectRoot, s.path) 로 해소).
    const path = rel;
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

// living-sync ② honest surface (DEC §24 / read-only) — 미-baseline 이면서 baseline-able 한 scope 목록.
//   배경: SessionStart hook 이 first-touch 없이 markDrift 만 돈다(cli hooks-bridge). 빈/absent sync_sources scope 는
//     detectDrift 가 조용히 drift_detected:false → "건강"으로 오인(dead-fed false-health). 그걸 표면화만 한다.
//   ★ write 0 (markDrift 코어 순수성·SessionStart 무-write 불변식 보존 / auto-register 는 여전히 cmdSync glue 한정 = DEFER).
//   집합 = cmdSync first-touch 가 고칠 수 있는 집합과 정렬(empty-or-absent / Senior BLOCKER-1) → 안내 실효.
//   anyCanonical 가드: .ai-context/output canonical 0개면 [] (빈/미초기화 프로젝트 false-positive 차단 / 부재=skip 철학 동형).
export function listUnbaselinedScopes(projectRoot, opts = {}) {
  const files = opts.canonicalFiles || CANONICAL_ANALYSIS_FILES;
  const anyCanonical = files.some((name) =>
    existsSync(baseFileForRead(projectRoot, name)), // base/ NEW ↔ output/ OLD alias
  );
  if (!anyCanonical) return [];
  const out = [];
  for (const scope of listScopes(projectRoot)) {
    const m = readManifest(projectRoot, scope);
    if (!m) continue;
    const sources = m.sync_state && m.sync_state.sync_sources;
    if (!Array.isArray(sources) || sources.length === 0) out.push(scope);
  }
  return out.sort();
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

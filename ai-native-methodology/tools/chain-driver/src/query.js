// query.js — G3 D12 Lookup 인터페이스.
//
// executeQuery(projectRoot, opts):
//   --scope <s>         → 해당 scope manifest (1개 또는 0개)
//   --scope <s> --stage → 해당 stage manifest (1개 또는 0개)
//   --ref <id>          → analysis_refs 역인덱스 — id 가 포함된 scope manifest 들
//   --stale             → sync_state.drift_detected=true 인 scope manifest 들
//   (no args)           → 모든 scope manifest

import { listScopes, readManifest } from './state-store.js';

const REF_FIELDS = ['rules', 'endpoints', 'schemas', 'domain', 'antipatterns'];

export function executeQuery(projectRoot, opts = {}) {
  if (opts.scope) {
    const m = readManifest(projectRoot, opts.scope, opts.stage);
    return m ? [m] : [];
  }

  const scopes = listScopes(projectRoot);

  if (opts.ref) {
    const matches = [];
    for (const scope of scopes) {
      const m = readManifest(projectRoot, scope);
      if (!m || !m.analysis_refs) continue;
      for (const field of REF_FIELDS) {
        const arr = m.analysis_refs[field] || [];
        if (arr.includes(opts.ref)) {
          matches.push(m);
          break;
        }
      }
    }
    return matches;
  }

  if (opts.stale) {
    const matches = [];
    for (const scope of scopes) {
      const m = readManifest(projectRoot, scope);
      if (m && m.sync_state && m.sync_state.drift_detected === true) {
        matches.push(m);
      }
    }
    return matches;
  }

  return scopes
    .map((scope) => readManifest(projectRoot, scope))
    .filter(Boolean);
}

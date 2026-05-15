// work-unit.js — G3 R5/R7 — manifest 객체 생성 + traceability/analysis refs helper.
//
// state-store.js 가 이 module 의 createScopeManifest / createStageManifest 를
// ensureScopeDir 안에서 호출. import 방향 = state-store → work-unit (단방향).

export const STAGES = Object.freeze(['planning', 'spec', 'test', 'impl']);

export function createScopeManifest(scope) {
  return {
    scope,
    status: 'pending',
    current_stage: 'planning',
    analysis_refs: {
      rules: [],
      endpoints: [],
      schemas: [],
      domain: [],
      antipatterns: [],
    },
    sync_state: {
      last_synced_at: null,
      sync_sources: [],
      dependents: [],
      drift_detected: false,
    },
  };
}

export function createStageManifest(scope, stage) {
  if (!STAGES.includes(stage)) {
    throw new Error(`createStageManifest: invalid stage "${stage}"`);
  }
  return {
    scope,
    stage,
    status: 'pending',
    linked_artifacts: [],
    traceability_refs: { uc: [], bhv: [], ac: [], tc: [], impl: [] },
    evidence_paths: [],
  };
}

// 산출물 JSON 에서 traceability_refs 추출 — 산출물 종류별 분기.
// 1차 = planning-spec.use_cases[].id / behavior-spec.behaviors[].id / 등.
// v3.x 에서 산출물 schema 자동 파싱 강화.
export function extractTraceabilityRefs(artifactJson, kind) {
  switch (kind) {
    case 'planning-spec':
      return { uc: (artifactJson.use_cases || []).map((u) => u.id).filter(Boolean) };
    case 'behavior-spec':
      return { bhv: (artifactJson.behaviors || []).map((b) => b.id).filter(Boolean) };
    case 'acceptance-criteria':
      return { ac: (artifactJson.criteria || []).map((a) => a.id).filter(Boolean) };
    case 'test-spec':
      return { tc: (artifactJson.test_cases || []).map((t) => t.id).filter(Boolean) };
    case 'impl-spec':
      return { impl: (artifactJson.implementations || []).map((i) => i.id).filter(Boolean) };
    default:
      return {};
  }
}

// analysis_refs subset filter — canonical global 의 부분 추출.
// 1차 = ID prefix 매칭 (예: scope user-registration → BR-USER-* / BR-AUTH-*).
// v2.1+ 에서 의미 기반 매칭 강화.
export function subsetAnalysisRefs(canonical, prefixes) {
  if (!Array.isArray(prefixes) || prefixes.length === 0) return {};
  const matches = (id) => prefixes.some((p) => id.startsWith(p));
  return {
    rules:        (canonical.rules || []).filter((r) => matches(r.id || r)),
    endpoints:    (canonical.endpoints || []).filter((e) => matches(e.path || e)),
    schemas:      (canonical.schemas || []).filter((s) => matches(s.name || s)),
    domain:       (canonical.domain || []).filter((d) => matches(d.name || d)),
    antipatterns: (canonical.antipatterns || []).filter((a) => matches(a.id || a)),
  };
}

export function renderManifestMd(m) {
  const lines = [];
  lines.push(`# ${m.scope}${m.stage ? ` / ${m.stage}` : ''}`);
  lines.push('');
  lines.push(`- **Status**: \`${m.status}\``);
  if (m.stage) lines.push(`- **Stage**: \`${m.stage}\``);
  if (m.current_stage) lines.push(`- **Current stage**: \`${m.current_stage}\``);
  if (m.created_at) lines.push(`- **Created**: ${m.created_at}`);
  if (m.updated_at) lines.push(`- **Updated**: ${m.updated_at}`);
  if (m.linked_state_version) lines.push(`- **State version**: ${m.linked_state_version}`);
  if (m.git_baseline_sha) lines.push(`- **Git baseline**: \`${m.git_baseline_sha}\``);

  if (m.linked_artifacts && m.linked_artifacts.length > 0) {
    lines.push('', '## Linked artifacts');
    for (const a of m.linked_artifacts) lines.push(`- \`${a}\``);
  }

  if (m.traceability_refs) {
    lines.push('', '## Traceability refs');
    for (const [k, v] of Object.entries(m.traceability_refs)) {
      lines.push(`- **${k}**: ${(v || []).length > 0 ? v.join(', ') : '—'}`);
    }
  }

  if (m.analysis_refs) {
    lines.push('', '## Analysis refs (canonical global 역인덱스)');
    for (const [k, v] of Object.entries(m.analysis_refs)) {
      lines.push(`- **${k}**: ${(v || []).length > 0 ? v.join(', ') : '—'}`);
    }
  }

  if (m.sync_state) {
    lines.push('', '## Sync state (M4)');
    lines.push(`- **drift_detected**: ${m.sync_state.drift_detected}`);
    lines.push(`- **last_synced_at**: ${m.sync_state.last_synced_at || '—'}`);
    if (m.sync_state.sync_sources && m.sync_state.sync_sources.length > 0) {
      lines.push('- **sync_sources**:');
      for (const s of m.sync_state.sync_sources) {
        lines.push(`  - \`${s.path}\` @ ${s.version}`);
      }
    }
    if (m.sync_state.dependents && m.sync_state.dependents.length > 0) {
      lines.push('- **dependents**:');
      for (const d of m.sync_state.dependents) {
        lines.push(`  - ${d.scope}${d.stage ? `/${d.stage}` : ''}`);
      }
    }
  }

  if (m.token_usage) {
    lines.push('', '## Token usage');
    lines.push(`- input: ${m.token_usage.input ?? 0}`);
    lines.push(`- output: ${m.token_usage.output ?? 0}`);
    lines.push(`- total: ${m.token_usage.total ?? 0}`);
  }

  lines.push('');
  return lines.join('\n');
}

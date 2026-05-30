// codegraph-runner manifest builder (pure / testable)
//
// codegraph status --json → code-graph.json 산출물 객체.
// ★ trust 모델: reference-lens / NOT gate-injected (DEC-2026-05-28 §4.2 / DEC-2026-05-30-codegraph-essential).
// schema = schemas/code-graph.schema.json (additionalProperties:false strict).

// status = codegraph `status --json` 파싱 결과 (fileCount/nodeCount/edgeCount/dbSizeBytes/backend/languages/nodesByKind).
export function buildManifest({ targetPath, status, evidence }) {
  if (!status || status.initialized === false) {
    throw new Error('[codegraph-runner] cannot build manifest — codegraph index not initialized (status.initialized=false)');
  }
  return {
    meta: {
      schema: 'code-graph.schema.json',
      generated_by: 'codegraph-runner',
      do_not_edit_manually: true,
      derived_from: [
        {
          tool: '@colbymchenry/codegraph',
          version: evidence?.tool_version ?? null,
          method: 'codegraph index + status --json',
        },
      ],
      trust_note:
        'reference-lens / NOT gate-injected (DEC-2026-05-28 §4.2 trust model / DEC-2026-05-30-codegraph-essential). ' +
        'codegraph 출력(code↔code 구조)은 LLM 운영 컨텍스트의 참고 lens 이며 결정적 gate 에 inject 되지 않는다.',
    },
    target_path: targetPath,
    index_stats: {
      file_count: status.fileCount ?? 0,
      node_count: status.nodeCount ?? 0,
      edge_count: status.edgeCount ?? 0,
      db_size_bytes: status.dbSizeBytes ?? null,
      backend: status.backend ?? null,
      languages: Array.isArray(status.languages) ? status.languages : [],
      nodes_by_kind: status.nodesByKind ?? {},
    },
    evidence,
  };
}

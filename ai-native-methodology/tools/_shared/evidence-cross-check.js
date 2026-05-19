// ★ v8.7 PATCH — Layer 3 evidence cross-check 공용 helper
// R15 silent enabler fix: AI 자기 보고 metric 의 실 외부 도구 invocation evidence 정량 검증.
// sql-inventory-extractor (commit 86bc271) + characterization-coverage-validator (commit ed84f3e)
// 의 Layer 3 helper 가 95% 동일 → 본 모듈로 통합 (v8.7 PATCH 후속 refactor).
//
// evidence file schema (JSON Lines / *.jsonl):
//   { tool, version, invocation_id, args, target, timestamp, duration_ms, exit_code,
//     stdout_sample, result_sha256 } — 필수 field: tool
//
// 호출 도구는 도구별 claim 계산 (auto_ratio_external_6 N parse / real_source snapshot count 등)
// 후 본 helper 의 결과와 비교하여 finding emit.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Evidence 디렉토리 (*.jsonl) scan → unique 'tool' field count 산출.
 *
 * @param {string} evidenceDir — *.jsonl 디렉토리 경로 (cli --evidence-dir 입력)
 * @param {number|null} claimedN — 도구별 claim 개수 (null = parse 실패 / cross-check skip 권고)
 * @returns {object} status ∈ {dir_missing, no_evidence_files, ok} + 부속 field
 *
 * 호출자 책임 — return status 별 finding emit:
 *   - dir_missing → high finding
 *   - no_evidence_files → high finding
 *   - ok + claimedN === null → medium finding (claim_unparseable / claim_empty 등 도구별 명명)
 *   - ok + evidence_tool_count < claimedN → critical finding (invocation_count_mismatch)
 */
export function crossCheckEvidence(evidenceDir, claimedN) {
  if (!existsSync(evidenceDir)) {
    return { status: 'dir_missing', evidence_dir: evidenceDir };
  }
  let st;
  try { st = statSync(evidenceDir); } catch { return { status: 'dir_missing', evidence_dir: evidenceDir }; }
  if (!st.isDirectory()) return { status: 'dir_missing', evidence_dir: evidenceDir };

  // *.jsonl file scan (recursive 한 layer만 — common case)
  const entries = readdirSync(evidenceDir);
  const jsonlFiles = entries
    .filter(f => f.endsWith('.jsonl'))
    .map(f => join(evidenceDir, f));

  if (jsonlFiles.length === 0) {
    return { status: 'no_evidence_files', evidence_dir: evidenceDir, files_scanned: 0 };
  }

  // JSON Lines parse → unique tool extract
  const tools = new Set();
  let totalInvocations = 0;
  let parseErrors = 0;
  const perFile = [];

  for (const f of jsonlFiles) {
    let content;
    try { content = readFileSync(f, 'utf8'); } catch { perFile.push({ file: f, status: 'read_error' }); continue; }
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    let fileInvocations = 0;
    let fileTools = new Set();
    for (const line of lines) {
      let rec;
      try { rec = JSON.parse(line); } catch { parseErrors++; continue; }
      if (typeof rec.tool === 'string') {
        tools.add(rec.tool);
        fileTools.add(rec.tool);
        totalInvocations++;
        fileInvocations++;
      }
    }
    perFile.push({ file: f, invocations: fileInvocations, unique_tools: [...fileTools] });
  }

  return {
    status: 'ok',
    evidence_dir: evidenceDir,
    files_scanned: jsonlFiles.length,
    total_invocations: totalInvocations,
    evidence_tool_count: tools.size,
    unique_tools: [...tools].sort(),
    claimed_count: claimedN,
    parse_errors: parseErrors,
    per_file: perFile,
  };
}

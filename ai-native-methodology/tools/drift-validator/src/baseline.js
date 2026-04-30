// ★ ADR-010 (Baseline + Ratchet) 적용 — drift-validator + decision-table-validator 공용.
// drift finding → fingerprint 변환 + baseline 파일 read/write/diff.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/**
 * finding 객체에서 결정적 fingerprint 생성.
 * 입력: { kind, json, mermaid, message, ... } 또는 dmn-check 항목.
 */
export function fingerprint(finding) {
  const key = JSON.stringify({
    kind: finding.kind,
    json: finding.json ?? null,
    mermaid: finding.mermaid ?? null,
    field: finding.field ?? null,
    location: finding.location ?? null,
    table_index: finding.table_index ?? null,
  });
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

/**
 * baseline 파일 read. 형식:
 *   { generated_at, source_commit_sha, findings: [{ fingerprint, kind, severity, note, grandfathered }] }
 */
export function readBaseline(path) {
  if (!path || !existsSync(path)) return { fingerprints: new Set(), meta: null };
  const text = readFileSync(path, 'utf-8');
  let data;
  try { data = JSON.parse(text); }
  catch (e) { throw new Error(`baseline parse error: ${e.message}`); }
  const fps = new Set();
  for (const f of data.findings ?? []) {
    if (f.fingerprint) fps.add(f.fingerprint);
  }
  return { fingerprints: fps, meta: data };
}

/**
 * findings 분류 — baseline 에 있으면 grandfathered, 아니면 new.
 */
export function classifyAgainstBaseline(findings, baseline) {
  const grandfathered = [];
  const novel = [];
  for (const f of findings) {
    const fp = f.fingerprint ?? fingerprint(f);
    f.fingerprint = fp;
    if (baseline.fingerprints.has(fp)) {
      grandfathered.push(f);
    } else {
      novel.push(f);
    }
  }
  return { grandfathered, novel };
}

/**
 * 신규 baseline 작성 — 모든 findings 등재.
 */
export function writeBaseline(path, findings, sourceCommitSha = 'unknown') {
  const data = {
    generated_at: new Date().toISOString().split('T')[0],
    source_commit_sha: sourceCommitSha,
    findings_count: findings.length,
    findings: findings.map(f => ({
      fingerprint: f.fingerprint ?? fingerprint(f),
      kind: f.kind,
      severity: f.severity,
      json: f.json ?? null,
      mermaid: f.mermaid ?? null,
      grandfathered: true,
    })),
  };
  writeFileSync(path, JSON.stringify(data, null, 2));
  return data;
}

/**
 * Severity 별 ratchet 강도 (ADR-010 §2.3).
 */
export const SEVERITY_RATCHET = {
  critical: { baseline_allowed: false, novel_blocks: true },  // baseline 등재 ❌
  breaking: { baseline_allowed: true, novel_blocks: true },   // novel 차단
  high: { baseline_allowed: true, novel_blocks: true },
  medium: { baseline_allowed: true, novel_blocks: true },
  low: { baseline_allowed: true, novel_blocks: false },       // novel 도 경고만
  'non-breaking': { baseline_allowed: true, novel_blocks: false },
  info: { baseline_allowed: true, novel_blocks: false },
  positive: { baseline_allowed: true, novel_blocks: false },
};

/**
 * ratchet mode 검증 — novel 결함이 차단 조건 충족하면 fail.
 */
export function ratchetCheck({ grandfathered, novel }) {
  const blocked = novel.filter(f => {
    const policy = SEVERITY_RATCHET[f.severity];
    return policy?.novel_blocks ?? true;
  });
  return {
    grandfathered_count: grandfathered.length,
    novel_count: novel.length,
    blocked_count: blocked.length,
    pass: blocked.length === 0,
    blocked,
  };
}

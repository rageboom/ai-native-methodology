// traceability-matrix-builder core
// 입력: 4 chain 산출물 (planning + behavior + acceptance + test + impl)
// 출력: matrix.json + matrix.md + matrix.mermaid
// ★ S5: matrix.json header 의무 — derived_from + do_not_edit_manually:true

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export function buildMatrix(chain) {
  const planning = chain.planning ?? null;
  const behavior = chain.behavior ?? null;
  const acceptance = chain.acceptance ?? null;
  const testSpec = chain.testSpec ?? null;
  const implSpec = chain.implSpec ?? null;

  // index map
  const acByBHV = new Map();
  for (const ac of acceptance?.criteria ?? []) {
    if (ac.behavior_ref) {
      if (!acByBHV.has(ac.behavior_ref)) acByBHV.set(ac.behavior_ref, []);
      acByBHV.get(ac.behavior_ref).push(ac);
    }
  }
  const tcByAC = new Map();
  for (const tc of testSpec?.test_cases ?? []) {
    if (tc.ac_ref) {
      if (!tcByAC.has(tc.ac_ref)) tcByAC.set(tc.ac_ref, []);
      tcByAC.get(tc.ac_ref).push(tc);
    }
  }
  const implByTC = new Map();
  for (const impl of implSpec?.modules ?? []) {
    for (const tcRef of impl.tc_refs ?? []) {
      if (!implByTC.has(tcRef)) implByTC.set(tcRef, []);
      implByTC.get(tcRef).push(impl);
    }
  }

  const matrix = [];
  for (const b of behavior?.behaviors ?? []) {
    for (const ucRef of b.use_case_refs ?? []) {
      const acs = acByBHV.get(b.id) ?? [];
      if (acs.length === 0) {
        matrix.push({
          use_case_id: ucRef, behavior_id: b.id,
          status: 'red', severity: 'low',
          gaps: [`BHV ${b.id} has no AC`]
        });
        continue;
      }
      for (const ac of acs) {
        const tcs = tcByAC.get(ac.id) ?? [];
        if (tcs.length === 0) {
          matrix.push({
            use_case_id: ucRef, behavior_id: b.id, acceptance_id: ac.id,
            status: ac.verifiable ? 'red' : 'yellow',
            severity: ac.severity === 'must' ? 'critical' : ac.severity === 'should' ? 'medium' : 'low',
            gaps: ['No TC linked']
          });
          continue;
        }
        for (const tc of tcs) {
          const impls = implByTC.get(tc.id) ?? [];
          if (impls.length === 0) {
            matrix.push({
              use_case_id: ucRef, behavior_id: b.id, acceptance_id: ac.id, test_id: tc.id,
              status: 'yellow',
              severity: ac.severity === 'must' ? 'critical' : ac.severity === 'should' ? 'medium' : 'low',
              gaps: ['No IMPL linked (chain 4 not done)']
            });
            continue;
          }
          for (const impl of impls) {
            const cell = {
              use_case_id: ucRef, behavior_id: b.id, acceptance_id: ac.id,
              test_id: tc.id, impl_id: impl.id,
              status: 'green',
              severity: ac.severity === 'must' ? 'critical' : ac.severity === 'should' ? 'medium' : 'low',
            };
            if (impl.commit_hash) cell.impl_commit_hash = impl.commit_hash;
            matrix.push(cell);
          }
        }
      }
    }
  }

  const greenCount = matrix.filter(c => c.status === 'green').length;
  const yellowCount = matrix.filter(c => c.status === 'yellow').length;
  const redCount = matrix.filter(c => c.status === 'red').length;
  const total = matrix.length || 1;
  const forwardCoverage = greenCount / total;
  const backwardCoverage = (greenCount + yellowCount) / total;

  return {
    derived_from: [
      'planning-spec.json', 'behavior-spec.json', 'acceptance-criteria.json',
      'test-spec.json', 'impl-spec.json'
    ],
    do_not_edit_manually: true,
    matrix,
    coverage_summary: {
      forward_coverage: forwardCoverage,
      backward_coverage: backwardCoverage,
      threshold: 0.85,
      severity_floor: { critical: 1.0, high: 0.95, medium: 0.90, low: 0.85 },
      green_count: greenCount,
      yellow_count: yellowCount,
      red_count: redCount
    }
  };
}

export function renderMarkdown(matrixData) {
  const lines = [];
  lines.push('# Traceability Matrix');
  lines.push('');
  lines.push('> ★ S5: do_not_edit_manually = true. derived_from = ' + matrixData.derived_from.join(', '));
  lines.push('');
  const cs = matrixData.coverage_summary;
  lines.push(`**Coverage**: forward=${(cs.forward_coverage * 100).toFixed(1)}% / backward=${(cs.backward_coverage * 100).toFixed(1)}% (threshold ${cs.threshold})`);
  lines.push(`green=${cs.green_count} / yellow=${cs.yellow_count} / red=${cs.red_count}`);
  lines.push('');
  lines.push('| UC | BHV | AC | TC | IMPL | commit | status | severity |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const c of matrixData.matrix) {
    const icon = c.status === 'green' ? '🟢' : c.status === 'yellow' ? '🟡' : '🔴';
    lines.push(`| ${c.use_case_id ?? '—'} | ${c.behavior_id ?? '—'} | ${c.acceptance_id ?? '—'} | ${c.test_id ?? '—'} | ${c.impl_id ?? '—'} | ${(c.impl_commit_hash ?? '—').slice(0, 8)} | ${icon} ${c.status} | ${c.severity} |`);
  }
  return lines.join('\n');
}

export function renderMermaid(matrixData) {
  const lines = ['graph LR'];
  // ★ sp3-c1: ≥ 100 cell 일 때 분할 정책 — 1차 = subgraph chain stage 별
  if (matrixData.matrix.length > 100) {
    lines.push('  %% ≥ 100 cell — subgraph 분할 권고 (sp3-c1 / sub-plan-3 carry)');
  }
  const seen = new Set();
  for (const c of matrixData.matrix) {
    const ucNode = c.use_case_id;
    const bhvNode = c.behavior_id;
    const acNode = c.acceptance_id;
    const tcNode = c.test_id;
    const implNode = c.impl_id;
    if (ucNode && bhvNode && !seen.has(`${ucNode}->${bhvNode}`)) {
      lines.push(`  ${ucNode} --> ${bhvNode}`);
      seen.add(`${ucNode}->${bhvNode}`);
    }
    if (bhvNode && acNode && !seen.has(`${bhvNode}->${acNode}`)) {
      lines.push(`  ${bhvNode} --> ${acNode}`);
      seen.add(`${bhvNode}->${acNode}`);
    }
    if (acNode && tcNode && !seen.has(`${acNode}->${tcNode}`)) {
      lines.push(`  ${acNode} --> ${tcNode}`);
      seen.add(`${acNode}->${tcNode}`);
    }
    if (tcNode && implNode && !seen.has(`${tcNode}->${implNode}`)) {
      lines.push(`  ${tcNode} --> ${implNode}`);
      seen.add(`${tcNode}->${implNode}`);
    }
  }
  return lines.join('\n');
}

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch (e) { throw new Error(`JSON parse error at ${path}: ${e.message}`); }
}

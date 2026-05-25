// traceability-matrix-builder core
// 입력: 4 chain 산출물 (planning + behavior + acceptance + test + impl) + analysis (businessRules + antipatterns optional)
// 출력: matrix.json + matrix.md + matrix.mermaid
// ★ S5: matrix.json header 의무 — derived_from + do_not_edit_manually:true
// ★ F-SIM-002 (2026-05-18): severity = source-grounded max-propagation (BR/AP severity + AC.MoSCoW) — SSOT methodology-spec/severity-cross-stage-mapping.md.
//   권위: ISO 26262 Part 9 ASIL inheritance + IEC 62304 Class A/B/C propagation (F-015 Claim B VERIFIED-WITH-DELTA).
// ★ F-SIM-004 (2026-05-18): matrix cell 에 business_rule_ids[] 추가 — BHV.br_refs + AC.related_brs[] 합집합. DO-178C requirements 1급 축 정합 (F-015 Claim A ★★★).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// SSOT: methodology-spec/severity-cross-stage-mapping.md §2
// rank: matrix 4-tier (info 흡수 → low)
const SEVERITY_RANK = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };

function moscowToSeverity(moscow) {
  // SSOT: must→critical (worst-case anchor / max-propagation 정합), should→medium, nice→low
  if (moscow === 'must') return 'critical';
  if (moscow === 'should') return 'medium';
  if (moscow === 'nice') return 'low';
  return 'low';
}

function normalizeSeverity(s) {
  // matrix output 은 4-tier (info → low 흡수 / SSOT §2 비대칭 처리 정합)
  if (s === 'info') return 'low';
  if (s in SEVERITY_RANK) return s;
  return 'low';
}

// ★ F-SIM-002 core: source-grounded max propagation
export function deriveCellSeverity({ ac, brs = [], aps = [] }) {
  const candidates = [
    moscowToSeverity(ac?.severity),
    ...brs.map(br => normalizeSeverity(br?.severity)),
    ...aps.map(ap => normalizeSeverity(ap?.severity)),
  ].filter(Boolean);
  return candidates.reduce(
    (max, s) => (SEVERITY_RANK[s] > SEVERITY_RANK[max] ? s : max),
    'low'
  );
}

// ★ F-SIM-004 core: BR id 합집합 (BHV.br_refs + AC.related_brs)
function deriveBRIds({ behavior, ac }) {
  const set = new Set();
  for (const r of behavior?.br_refs ?? []) set.add(r);
  for (const r of ac?.related_brs ?? []) set.add(r);
  return [...set];
}

function deriveAPIds({ ac }) {
  return [...(ac?.related_aps ?? [])];
}

export function buildMatrix(chain) {
  const planning = chain.planning ?? null;
  const behavior = chain.behavior ?? null;
  const acceptance = chain.acceptance ?? null;
  const testSpec = chain.testSpec ?? null;
  const implSpec = chain.implSpec ?? null;
  // ★ F-SIM-002/004 analysis inputs (optional / backwards compat)
  const businessRules = chain.businessRules ?? null;
  const antipatterns = chain.antipatterns ?? null;
  // ★ v9.2.0 (DEC-2026-05-25-axis-a-phase-4-3) — chain 3 (plan) TASK layer input (optional / backwards compat / Senior risk #4 흡수)
  const taskPlan = chain.taskPlan ?? null;

  const brById = new Map();
  for (const br of businessRules?.business_rules ?? []) brById.set(br.id, br);
  const apById = new Map();
  for (const ap of antipatterns?.antipatterns ?? []) apById.set(ap.id, ap);
  // ★ v9.2.0 TASK layer index — taskByAC = Map<ac_id, task_id> (chain 3 / plan stage)
  const taskByAC = new Map();
  for (const task of taskPlan?.tasks ?? []) {
    for (const acRef of task.ac_refs ?? []) {
      // 1 AC = 1 task 우선 (1~3 AC 묶음 paradigm / first-match — DEC-2026-05-21 §정책4)
      if (!taskByAC.has(acRef)) taskByAC.set(acRef, task.id);
    }
  }

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

  function cellSeverityFor({ behavior: b, ac }) {
    const brIds = deriveBRIds({ behavior: b, ac });
    const apIds = deriveAPIds({ ac });
    const brs = brIds.map(id => brById.get(id)).filter(Boolean);
    const aps = apIds.map(id => apById.get(id)).filter(Boolean);
    return {
      severity: deriveCellSeverity({ ac, brs, aps }),
      business_rule_ids: brIds,
      antipattern_ids: apIds,
    };
  }

  const matrix = [];
  for (const b of behavior?.behaviors ?? []) {
    for (const ucRef of b.use_case_refs ?? []) {
      const acs = acByBHV.get(b.id) ?? [];
      if (acs.length === 0) {
        matrix.push({
          use_case_id: ucRef, behavior_id: b.id,
          business_rule_ids: deriveBRIds({ behavior: b, ac: null }),
          antipattern_ids: [],
          status: 'red', severity: 'low',
          gaps: [`BHV ${b.id} has no AC`]
        });
        continue;
      }
      for (const ac of acs) {
        const propagated = cellSeverityFor({ behavior: b, ac });
        // ★ v9.2.0 TASK layer — ac.id 매핑 시 task_id 채움 (★ Senior risk #4 흡수 / additive only / task-plan 부재 시 undefined)
        const taskId = taskByAC.get(ac.id);
        const tcs = tcByAC.get(ac.id) ?? [];
        if (tcs.length === 0) {
          const cell = {
            use_case_id: ucRef, behavior_id: b.id, acceptance_id: ac.id,
            business_rule_ids: propagated.business_rule_ids,
            antipattern_ids: propagated.antipattern_ids,
            status: ac.verifiable ? 'red' : 'yellow',
            severity: propagated.severity,
            gaps: ['No TC linked']
          };
          if (taskId) cell.task_id = taskId;
          matrix.push(cell);
          continue;
        }
        for (const tc of tcs) {
          const impls = implByTC.get(tc.id) ?? [];
          if (impls.length === 0) {
            const cell = {
              use_case_id: ucRef, behavior_id: b.id, acceptance_id: ac.id, test_id: tc.id,
              business_rule_ids: propagated.business_rule_ids,
              antipattern_ids: propagated.antipattern_ids,
              status: 'yellow',
              severity: propagated.severity,
              gaps: ['No IMPL linked (chain 4 not done)']
            };
            if (taskId) cell.task_id = taskId;
            matrix.push(cell);
            continue;
          }
          for (const impl of impls) {
            const cell = {
              use_case_id: ucRef, behavior_id: b.id, acceptance_id: ac.id,
              test_id: tc.id, impl_id: impl.id,
              business_rule_ids: propagated.business_rule_ids,
              antipattern_ids: propagated.antipattern_ids,
              status: 'green',
              severity: propagated.severity,
            };
            if (taskId) cell.task_id = taskId;
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

  // F-SIM-002 self-audit: severity 분포 (단일 상수 경고 신호)
  const severityDistinct = [...new Set(matrix.map(c => c.severity))];

  return {
    derived_from: [
      'planning-spec.json', 'behavior-spec.json', 'acceptance-criteria.json',
      'test-spec.json', 'impl-spec.json',
      // F-SIM-002/004 optional analysis inputs
      ...(businessRules ? ['business-rules.json'] : []),
      ...(antipatterns ? ['antipatterns.json'] : []),
      // ★ v9.2.0 TASK layer optional input (DEC-2026-05-25-axis-a-phase-4-3)
      ...(taskPlan ? ['task-plan.json'] : []),
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
      red_count: redCount,
      // F-SIM-002 audit signal: severity propagation 다축 확인 (단일 값 = MoSCoW 단축 회귀 의심)
      severity_distinct_count: severityDistinct.length,
      severity_propagation_active: businessRules !== null || antipatterns !== null,
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
  if (cs.severity_propagation_active !== undefined) {
    lines.push(`severity_propagation_active=${cs.severity_propagation_active} / severity_distinct_count=${cs.severity_distinct_count}`);
  }
  lines.push('');
  // ★ F-SIM-004: BR 컬럼 추가
  lines.push('| UC | BR | BHV | AC | TC | IMPL | commit | status | severity |');
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const c of matrixData.matrix) {
    const icon = c.status === 'green' ? '🟢' : c.status === 'yellow' ? '🟡' : '🔴';
    const brList = (c.business_rule_ids && c.business_rule_ids.length > 0) ? c.business_rule_ids.join(',') : '—';
    lines.push(`| ${c.use_case_id ?? '—'} | ${brList} | ${c.behavior_id ?? '—'} | ${c.acceptance_id ?? '—'} | ${c.test_id ?? '—'} | ${c.impl_id ?? '—'} | ${(c.impl_commit_hash ?? '—').slice(0, 8)} | ${icon} ${c.status} | ${c.severity} |`);
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
    // ★ F-SIM-004: BR 노드를 BHV 의 source 로 표현 (BR → BHV)
    for (const brId of c.business_rule_ids ?? []) {
      if (bhvNode && !seen.has(`${brId}->${bhvNode}`)) {
        lines.push(`  ${brId} --> ${bhvNode}`);
        seen.add(`${brId}->${bhvNode}`);
      }
    }
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

// chain-coverage-validator core
// 검증:
//   1. planning UC-* → behavior BHV-* 1:N coverage
//   2. behavior BHV-* → acceptance AC-* 1:N coverage
//   3. acceptance verifiable=true ⇔ test_case_refs.length ≥ 1
//   4. behavior cross_links.to_analysis_artifacts 비어있지 않음
//   5. severity_floor (사용자 답변 D6 — 책임은 schema-validator 에서 강제 / 본 도구는 정보용 보고만)

import { readFileSync, existsSync } from 'node:fs';

export function validateChainCoverage(planning, behavior, acceptance, threshold = 0.85) {
  const findings = [];

  const planningUCs = new Set((planning?.use_cases ?? []).map(u => u.id));
  const behaviorBHVs = new Set();
  const bhvByUC = new Map(); // UC -> BHV[] forward
  for (const b of behavior?.behaviors ?? []) {
    behaviorBHVs.add(b.id);
    for (const ucRef of b.use_case_refs ?? []) {
      if (!bhvByUC.has(ucRef)) bhvByUC.set(ucRef, []);
      bhvByUC.get(ucRef).push(b.id);
      if (!planningUCs.has(ucRef)) {
        findings.push({
          kind: 'chain.bhv.unknown_uc',
          severity: 'critical',
          bhv_id: b.id, uc_ref: ucRef,
          message: `BHV ${b.id} references unknown UC ${ucRef}`
        });
      }
    }
  }

  // UC → BHV coverage
  let ucCoveredCount = 0;
  for (const ucId of planningUCs) {
    if (bhvByUC.has(ucId)) ucCoveredCount++;
    else findings.push({
      kind: 'chain.uc.no_bhv',
      severity: 'high',
      uc_id: ucId,
      message: `UC ${ucId} has no BHV (chain 1→2 link missing)`
    });
  }
  const ucCoverage = planningUCs.size === 0 ? 1.0 : ucCoveredCount / planningUCs.size;

  // BHV → AC coverage
  const acByBHV = new Map();
  const acAllIds = new Set();
  for (const ac of acceptance?.criteria ?? []) {
    acAllIds.add(ac.id);
    if (ac.behavior_ref) {
      if (!acByBHV.has(ac.behavior_ref)) acByBHV.set(ac.behavior_ref, []);
      acByBHV.get(ac.behavior_ref).push(ac.id);
      if (!behaviorBHVs.has(ac.behavior_ref)) {
        findings.push({
          kind: 'chain.ac.unknown_bhv',
          severity: 'critical',
          ac_id: ac.id, bhv_ref: ac.behavior_ref,
          message: `AC ${ac.id} references unknown BHV ${ac.behavior_ref}`
        });
      }
    }
    // verifiable
    if (ac.verifiable === true) {
      const tcRefs = ac.test_case_refs ?? [];
      if (tcRefs.length === 0) {
        findings.push({
          kind: 'chain.ac.verifiable_no_tc',
          severity: 'high',
          ac_id: ac.id,
          message: `AC ${ac.id} verifiable=true but no test_case_refs`
        });
      }
      if (ac.automated_runnable !== true) {
        findings.push({
          kind: 'chain.ac.verifiable_not_runnable',
          severity: 'medium',
          ac_id: ac.id,
          message: `AC ${ac.id} verifiable=true but automated_runnable=${ac.automated_runnable}`
        });
      }
    }
  }

  let bhvCoveredCount = 0;
  for (const bhvId of behaviorBHVs) {
    if (acByBHV.has(bhvId)) bhvCoveredCount++;
    else findings.push({
      kind: 'chain.bhv.no_ac',
      severity: 'high',
      bhv_id: bhvId,
      message: `BHV ${bhvId} has no AC (chain 2 link missing)`
    });
  }
  const bhvCoverage = behaviorBHVs.size === 0 ? 1.0 : bhvCoveredCount / behaviorBHVs.size;

  // 4. cross_links
  const xLinks = behavior?.cross_links?.to_analysis_artifacts ?? [];
  if (xLinks.length === 0) {
    findings.push({
      kind: 'chain.behavior.cross_links_empty',
      severity: 'medium',
      message: 'behavior-spec.cross_links.to_analysis_artifacts is empty (사용자 답변 3 정합 위배 — 7대 산출물 reference 의무)'
    });
  }

  // threshold
  if (ucCoverage < threshold) {
    findings.push({
      kind: 'chain.uc_coverage.below_threshold',
      severity: 'high',
      coverage: ucCoverage, threshold,
      message: `UC→BHV coverage ${ucCoverage.toFixed(2)} < ${threshold}`
    });
  }
  if (bhvCoverage < threshold) {
    findings.push({
      kind: 'chain.bhv_coverage.below_threshold',
      severity: 'high',
      coverage: bhvCoverage, threshold,
      message: `BHV→AC coverage ${bhvCoverage.toFixed(2)} < ${threshold}`
    });
  }

  return {
    findings,
    coverage: { uc_to_bhv: ucCoverage, bhv_to_ac: bhvCoverage },
    summary: {
      total_findings: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
    }
  };
}

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch (e) { throw new Error(`JSON parse error at ${path}: ${e.message}`); }
}

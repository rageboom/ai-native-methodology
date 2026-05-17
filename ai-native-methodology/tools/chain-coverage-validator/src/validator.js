// chain-coverage-validator core
// 검증:
//   1. planning UC-* → behavior BHV-* 1:N coverage
//   2. behavior BHV-* → acceptance AC-* 1:N coverage
//   3. acceptance verifiable=true ⇔ test_case_refs.length ≥ 1
//   4. behavior cross_links.to_analysis_artifacts 비어있지 않음
//   5. severity_floor (사용자 답변 D6 — 책임은 schema-validator 에서 강제 / 본 도구는 정보용 보고만)
//   ★ F-SIM-003 (2026-05-18): cross-ref 경로 resolve assert + 경로 컨벤션 단일화
//   - planning.derivation_source.source_artifacts + cross_links.to_analysis_artifacts 의 path 가 실제 존재하는지 검증
//   - behavior.derivation_source.analysis_artifacts + cross_links.to_analysis_artifacts 도 동일
//   - 경로 컨벤션: relative-to-project-root 권장 / repo-absolute (examples/...) = low-severity style warning
//   - strict=false (default, warn-mode) → broken-path = medium / strict=true → high
//   - release-readiness #14 baseline ratchet 와 페어 (v+1 default 전환)

import { readFileSync, existsSync } from 'node:fs';
import { resolve as pathResolve, isAbsolute } from 'node:path';

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

// ★ F-SIM-003 (2026-05-18): cross-ref path resolve + 경로 컨벤션 검증
// Repo root + project root 모두 받아 path 해석. opts.strict=true 시 broken-path severity=high (blocking) / false=medium (warn-mode).
export function validateCrossRefPaths({ planning, behavior, projectRoot, repoRoot, opts = {} }) {
  const findings = [];
  const { strict = false } = opts;

  function resolveCrossRef(p) {
    if (!p || typeof p !== 'string') return { resolved: null, convention: 'invalid' };
    if (isAbsolute(p)) return { resolved: p, convention: 'absolute' };
    // repo-absolute convention (examples/...) — discouraged but valid
    if (p.startsWith('examples/') || p.startsWith('schemas/') || p.startsWith('methodology-spec/') || p.startsWith('flows/') || p.startsWith('docs/') || p.startsWith('tools/')) {
      return { resolved: pathResolve(repoRoot, p), convention: 'repo-absolute' };
    }
    // relative-to-project (preferred)
    return { resolved: pathResolve(projectRoot, p), convention: 'project-relative' };
  }

  function check(refList, sourceLabel, brokenSeverity) {
    if (!refList || !Array.isArray(refList)) return;
    for (const ref of refList) {
      const { resolved, convention } = resolveCrossRef(ref);
      if (!resolved) {
        findings.push({
          kind: 'chain.cross_links.invalid_path',
          severity: brokenSeverity,
          path: ref, source: sourceLabel,
          message: `${sourceLabel}: invalid path "${ref}"`
        });
        continue;
      }
      if (!existsSync(resolved)) {
        findings.push({
          kind: strict ? 'chain.cross_links.broken_path' : 'chain.cross_links.broken_path_warning',
          severity: brokenSeverity,
          path: ref, source: sourceLabel, resolved_path: resolved,
          message: `${sourceLabel}: cross-ref path does not exist — "${ref}" (resolved: ${resolved})`
        });
      }
      if (convention === 'repo-absolute') {
        findings.push({
          kind: 'chain.cross_links.path_convention_repo_absolute',
          severity: 'low',
          path: ref, source: sourceLabel,
          message: `${sourceLabel}: path uses repo-absolute convention "${ref}" — relative-to-project recommended (e.g., "output/rules/business-rules.json")`
        });
      }
    }
  }

  const brokenSeverity = strict ? 'high' : 'medium';

  // planning
  check(planning?.derivation_source?.source_artifacts, 'planning.derivation_source.source_artifacts', brokenSeverity);
  check(planning?.cross_links?.to_analysis_artifacts, 'planning.cross_links.to_analysis_artifacts', brokenSeverity);
  // behavior
  check(behavior?.derivation_source?.analysis_artifacts, 'behavior.derivation_source.analysis_artifacts', brokenSeverity);
  check(behavior?.cross_links?.to_analysis_artifacts, 'behavior.cross_links.to_analysis_artifacts', brokenSeverity);

  const brokenCount = findings.filter(f => f.kind === 'chain.cross_links.broken_path' || f.kind === 'chain.cross_links.broken_path_warning').length;
  const conventionCount = findings.filter(f => f.kind === 'chain.cross_links.path_convention_repo_absolute').length;

  return {
    findings,
    summary: {
      total_findings: findings.length,
      broken_path_count: brokenCount,
      path_convention_warning_count: conventionCount,
      strict_mode: strict,
    }
  };
}

// ★ F-SIM-001 (2026-05-18): AP→BR→AC coverage lane
// critical/high antipattern 이 AC.related_aps 로 도달하지 못하고 + planning.excluded_antipatterns 에도 명시 carry 가 없으면 finding.
// 권위: SonarQube Sonar Way "Security Hotspots Reviewed == 100%" (F-015 Claim E) + GitHub CodeQL Critical-threshold merge block + Snyk High+ PR block.
// 본 lane = critical AP 무선언 silent omission 차단 = industry-aligned (본 방법론 직전 단계는 industry default 보다 약했음).
export function validateAntipatternCoverage({ antipatterns, acceptanceCriteria, planning }) {
  const findings = [];
  if (!antipatterns || !antipatterns.antipatterns) {
    return {
      findings,
      summary: { total_findings: 0, uncovered_severe_count: 0, severe_ap_count: 0, ap_input_missing: true }
    };
  }

  const acs = acceptanceCriteria?.criteria ?? [];
  const referencedApIds = new Set();
  for (const ac of acs) {
    for (const id of ac.related_aps ?? []) referencedApIds.add(id);
  }
  const explicitlyExcluded = new Set(
    (planning?.excluded_antipatterns ?? []).map(e => e.ap_id)
  );

  const severeAps = antipatterns.antipatterns.filter(ap => ap.severity === 'critical' || ap.severity === 'high');
  for (const ap of severeAps) {
    const referenced = referencedApIds.has(ap.id);
    const excluded = explicitlyExcluded.has(ap.id);
    if (!referenced && !excluded) {
      findings.push({
        kind: 'chain.ap.uncovered_severe',
        severity: ap.severity, // critical / high 그대로 emit
        ap_id: ap.id, ap_severity: ap.severity, ap_title: ap.title ?? null,
        message: `${ap.severity} antipattern ${ap.id}${ap.title ? ` "${ap.title}"` : ''} has no AC.related_aps mapping nor planning.excluded_antipatterns carry — silent omission. AC 매핑 또는 명시 carry 의무.`
      });
    }
  }

  return {
    findings,
    summary: {
      total_findings: findings.length,
      uncovered_severe_count: findings.length,
      severe_ap_count: severeAps.length,
      ap_input_missing: false,
    }
  };
}

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch (e) { throw new Error(`JSON parse error at ${path}: ${e.message}`); }
}

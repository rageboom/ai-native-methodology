// planning-extraction-validator core — read-only validator
// 입력: planning-spec.json + analysis stage 산출물 (rules.json + domain.json)
// 검증:
//   1. source-grounded coverage — 모든 use_cases[].source_grounded_evidence 가 file path 포함
//   2. BR-INTENT br_id ↔ analysis BR-* match
//   3. UC coverage ≥ 0.80 (planning UC vs domain.json UC ratio)
//   4. cross_links.to_analysis_artifacts 의무

import { readFileSync, existsSync } from 'node:fs';

export function validatePlanningExtraction(planningSpec, analysis) {
  const findings = [];

  // 1. source-grounded coverage
  const useCases = planningSpec?.use_cases ?? [];
  for (const uc of useCases) {
    const evidence = uc.source_grounded_evidence ?? [];
    if (evidence.length === 0) {
      findings.push({
        kind: 'planning.source_grounded.missing',
        severity: 'high',
        uc_id: uc.id,
        message: `UC ${uc.id} has no source_grounded_evidence (no-simulation violation risk)`
      });
    }
  }

  // 2. BR-INTENT match
  const brsIntent = planningSpec?.business_rules_intent ?? [];
  const analysisBrs = new Set();
  if (analysis?.rules?.business_rules) {
    for (const br of analysis.rules.business_rules) {
      if (br.id) analysisBrs.add(br.id);
    }
  }
  for (const intent of brsIntent) {
    if (!analysisBrs.has(intent.br_id)) {
      findings.push({
        kind: 'planning.br_intent.unknown_br',
        severity: 'critical',
        br_id: intent.br_id,
        message: `BR-INTENT references unknown BR ${intent.br_id} (not in analysis rules.json)`
      });
    }
  }

  // 3. UC coverage
  let ucCoverageRatio = 1.0;
  let analysisUCs = new Set();
  if (analysis?.domain?.use_cases) {
    for (const uc of analysis.domain.use_cases) {
      if (uc.id) analysisUCs.add(uc.id);
    }
  }
  if (analysisUCs.size > 0) {
    const planningUCIds = new Set(useCases.map(u => u.id));
    let coveredCount = 0;
    for (const ucId of analysisUCs) {
      if (planningUCIds.has(ucId)) coveredCount++;
    }
    ucCoverageRatio = coveredCount / analysisUCs.size;
    if (ucCoverageRatio < 0.80) {
      findings.push({
        kind: 'planning.uc_coverage.below_threshold',
        severity: 'high',
        coverage: ucCoverageRatio,
        threshold: 0.80,
        message: `UC coverage ${ucCoverageRatio.toFixed(2)} < 0.80 (analysis ${analysisUCs.size} UCs / planning covers ${[...analysisUCs].filter(id => planningUCIds.has(id)).length})`
      });
    }
  }

  // 4. cross_links.to_analysis_artifacts
  const xLinks = planningSpec?.cross_links?.to_analysis_artifacts ?? [];
  if (xLinks.length === 0) {
    findings.push({
      kind: 'planning.cross_links.empty',
      severity: 'medium',
      message: 'cross_links.to_analysis_artifacts is empty (chain backward link missing)'
    });
  }

  return {
    findings,
    coverage: { use_case: ucCoverageRatio },
    summary: {
      total_findings: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
    }
  };
}

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    throw new Error(`JSON parse error at ${path}: ${e.message}`);
  }
}

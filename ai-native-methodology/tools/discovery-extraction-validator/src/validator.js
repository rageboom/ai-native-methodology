// discovery-extraction-validator core (v11.0.0 / renamed from planning-extraction-validator)
// 입력: discovery-spec.json + analysis stage 산출물 (business-rules.json + domain.json)
// 검증:
//   1. source-grounded coverage — 모든 use_cases[].source_grounded_evidence 가 file path 포함
//   2. BR-INTENT br_id ↔ analysis BR-* match
//   3. UC coverage ≥ 0.80 (discovery UC vs domain.json UC ratio)
//   4. cross_links.to_analysis_artifacts 의무

import { readFileSync, existsSync } from 'node:fs';

export function validateDiscoveryExtraction(discoverySpec, analysis) {
  const findings = [];

  // 1. source-grounded coverage
  const useCases = discoverySpec?.use_cases ?? [];
  for (const uc of useCases) {
    const evidence = uc.source_grounded_evidence ?? [];
    if (evidence.length === 0) {
      findings.push({
        kind: 'discovery.source_grounded.missing',
        severity: 'high',
        uc_id: uc.id,
        message: `UC ${uc.id} has no source_grounded_evidence (no-simulation violation risk)`
      });
    }
  }

  // 2. BR-INTENT match
  // v11.5.1: multi-path BR lookup (LL-validator-dual-key-02 / additive backward-compat)
  // 분석 산출물 paradigm 다양화 (v11.0.0 rename + chain 1 normalize + dual key 등) 대응
  const brsIntent = discoverySpec?.business_rules_intent ?? [];
  const analysisBrs = new Set();
  const brCandidates = [
    analysis?.rules?.business_rules,    // 기존 가정 (backward-compat / v11.0.0~v11.5.0)
    analysis?.business_rules,            // top-level array (poc-17 chain 1 normalize)
    analysis?.rules,                     // top-level rules array (analysis baseline)
    analysis?.rules_step_4c_carcost,    // dual key 두번째 (poc-17 Phase 4c)
  ];
  for (const arr of brCandidates) {
    if (Array.isArray(arr)) {
      for (const br of arr) {
        if (br?.id) analysisBrs.add(br.id);
      }
    }
  }
  const INTENT_CERTAINTY_ENUM = ['observed', 'inferred-consequence', 'unverified-intent', 'source-refuted'];
  for (const intent of brsIntent) {
    if (!analysisBrs.has(intent.br_id)) {
      findings.push({
        kind: 'discovery.br_intent.unknown_br',
        severity: 'critical',
        br_id: intent.br_id,
        message: `BR-INTENT references unknown BR ${intent.br_id} (not in analysis business-rules.json)`
      });
    }
    // v11.6.0 (F-DOGFOOD-003 / Option B): intent_certainty 구조 라벨 nudge.
    // over-attribution 을 검증 가능하게 — 부재 시 WARN(low / non-blocking / backward-compat).
    // enum 자체 validity 는 schema-validator 가 강제 (여기선 부재만 nudge).
    if (intent.intent_certainty === undefined || intent.intent_certainty === null) {
      findings.push({
        kind: 'discovery.br_intent.missing_intent_certainty',
        severity: 'low',
        br_id: intent.br_id,
        message: `BR-INTENT ${intent.br_id} 에 intent_certainty 라벨 부재 — over-attribution 차단을 위해 ${INTENT_CERTAINTY_ENUM.join('|')} 중 하나 권장 (F-DOGFOOD-003)`
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
    const discoveryUCIds = new Set(useCases.map(u => u.id));
    let coveredCount = 0;
    for (const ucId of analysisUCs) {
      if (discoveryUCIds.has(ucId)) coveredCount++;
    }
    ucCoverageRatio = coveredCount / analysisUCs.size;
    if (ucCoverageRatio < 0.80) {
      findings.push({
        kind: 'discovery.uc_coverage.below_threshold',
        severity: 'high',
        coverage: ucCoverageRatio,
        threshold: 0.80,
        message: `UC coverage ${ucCoverageRatio.toFixed(2)} < 0.80 (analysis ${analysisUCs.size} UCs / discovery covers ${[...analysisUCs].filter(id => discoveryUCIds.has(id)).length})`
      });
    }
  }

  // 3.5 domain 비즈니스 컨텍스트 nudge (v11.16.0 / C-domain-schema-stakeholders).
  // analysis domain.json 제공 시 stakeholders / business_intent_summary 부재 = WARN(low / non-blocking / backward-compat).
  // schema 는 optional(additive) — skill 본문이 신규 산출 시 작성 의무 / 여기선 부재만 nudge.
  if (analysis?.domain && typeof analysis.domain === 'object') {
    const missing = [];
    const stakeholders = analysis.domain.stakeholders;
    if (!Array.isArray(stakeholders) || stakeholders.length === 0) missing.push('stakeholders');
    const summary = analysis.domain.business_intent_summary;
    if (typeof summary !== 'string' || summary.trim().length === 0) missing.push('business_intent_summary');
    if (missing.length > 0) {
      findings.push({
        kind: 'discovery.domain.missing_business_context',
        severity: 'low',
        missing,
        message: `domain.json 에 ${missing.join(' / ')} 부재 — 도메인 actor / 비즈니스 의도 명시 권장 (C-domain-schema-stakeholders / analysis-domain-model skill 본문 의무)`
      });
    }
  }

  // 4. cross_links.to_analysis_artifacts
  const xLinks = discoverySpec?.cross_links?.to_analysis_artifacts ?? [];
  if (xLinks.length === 0) {
    findings.push({
      kind: 'discovery.cross_links.empty',
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

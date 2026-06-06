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

  // 3.x UC over/under-decomposition nudge (D9 / INSPECTION-2026-05-31-discovery).
  // discovery-decompose-use-cases SKILL 이 'gate#1 cluster 항목'으로 명시한 임계를 결정론 lane 으로 결선.
  // non-blocking WARN (intent_certainty 와 동일 패턴) — 사용자 cluster 검토 nudge / gate block ❌.
  if (useCases.length >= 30) {
    findings.push({
      kind: 'discovery.uc.over_decomposition',
      severity: 'low',
      uc_count: useCases.length,
      message: `use_cases ${useCases.length}개 ≥ 30 — over-decomposition cluster 검토 권장 (gate#1 cluster 항목 / discovery-decompose-use-cases SKILL §임계)`
    });
  }
  const domainEntities = Array.isArray(analysis?.domain?.entities) ? analysis.domain.entities.length : 0;
  if (domainEntities > 0 && useCases.length > 0 && (useCases.length / domainEntities) < 1.5) {
    findings.push({
      kind: 'discovery.uc.under_decomposition',
      severity: 'low',
      uc_per_entity: useCases.length / domainEntities,
      message: `UC/entity ${(useCases.length / domainEntities).toFixed(2)} < 1.5 (UC ${useCases.length} / entity ${domainEntities}) — 추가 분해 권고 (discovery-decompose-use-cases SKILL §임계)`
    });
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

  // 5. decisions[] / pending_decisions[] 거버넌스 (D4 / INSPECTION-2026-05-31-discovery).
  // discovery-from-analysis-output SKILL §v8.7.5 가 명시한 3 check 를 실제 결정론 강제로 결선
  // (이전엔 prose 만 'critical/gate stop' 단언하고 validator 미구현 = honesty-tier 위반이었음).
  const PATH_HINT = /(\.(json|md|ya?ml|java|ts|tsx|js|jsx|py|kt|go|rb|cs|sql)\b)|(:\d+)|#[A-Z]/;
  for (const dec of (discoverySpec?.decisions ?? [])) {
    // (a) AI-default 인데 revisit_required != true → critical (cluster 재검토 누락)
    if (dec.source === 'AI-default' && dec.revisit_required !== true) {
      findings.push({
        kind: 'discovery.ai-default-revisit-flag-missing',
        severity: 'critical',
        decision_id: dec.id,
        message: `decision ${dec.id ?? '(no id)'} source=AI-default 인데 revisit_required != true — chain 2 gate#2 cluster 재확인 누락 (SKILL §v8.7.5 a)`
      });
    }
    // (c) carry decision 인데 rationale 에 evidence path 단서 부재 → high
    if (dec.source === 'carry' && !(typeof dec.rationale === 'string' && PATH_HINT.test(dec.rationale)) && !dec.evidence_path) {
      findings.push({
        kind: 'discovery.carry-decision-missing-evidence-path',
        severity: 'high',
        decision_id: dec.id,
        message: `decision ${dec.id ?? '(no id)'} source=carry 인데 rationale 에 evidence path 단서 부재 (SKILL §v8.7.5 c)`
      });
    }
  }
  // (b) pending_decisions[] non-empty → critical (gate stop). gate#1 에서 user-explicit 전환 의무.
  const pending = discoverySpec?.pending_decisions ?? [];
  if (Array.isArray(pending) && pending.length > 0) {
    findings.push({
      kind: 'discovery.pending-decisions-not-resolved',
      severity: 'critical',
      pending_count: pending.length,
      message: `pending_decisions[] ${pending.length}건 미해결 — gate#1 에서 user-explicit 전환 의무 (보류 시 gate stop / SKILL §v8.7.5 b)`
    });
  }

  return {
    findings,
    coverage: { use_case: ucCoverageRatio },
    summary: {
      total_findings: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
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

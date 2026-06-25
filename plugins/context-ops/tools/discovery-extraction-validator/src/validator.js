// discovery-extraction-validator core (v11.0.0 / renamed from planning-extraction-validator)
// 입력: discovery-spec.json + analysis stage 산출물 (business-rules.json + domain.json)
// 검증:
//   1. source-grounded coverage — 모든 use_cases[].source_grounded_evidence 가 file path 포함
//   2. BR-INTENT br_id ↔ analysis BR-* match
//   3. UC coverage ≥ 0.80 (discovery UC vs domain.json UC ratio)
//   4. cross_links.to_analysis_artifacts 의무

import { readFileSync, existsSync } from 'node:fs';
import { normalizeAnalysisBusinessRules } from '../../_shared/load-business-rules.js';

export function validateDiscoveryExtraction(discoverySpec, analysis, opts = {}) {
  const findings = [];

  // v0.77.0 (DEC-2026-06-25-discovery-2-gate): 2-게이트 모드.
  //   draft(게이트①) = 디테일 미충전 → 디테일 의존 finding(source-grounded / UC coverage) skip,
  //     pending_decisions 도 비-critical(게이트①에서 사용자가 /confirm-scope 로 해소 예정).
  //   final(게이트②) = 디테일 강제 + in_scope!==false UC 만 coverage 분자.
  //   mode 미지정 시 finalization_status 로 추론(부재=final / backward-compat).
  const mode = opts.mode || (discoverySpec?.finalization_status === 'draft' ? 'draft' : 'final');
  const isDraft = mode === 'draft';

  // 1. source-grounded coverage (draft 에선 skip — 디테일은 detail-fill 단계 / in_scope=false UC 면제)
  const useCases = discoverySpec?.use_cases ?? [];
  if (!isDraft) {
    for (const uc of useCases) {
      if (uc.in_scope === false) continue; // 범위 외 UC 는 디테일 의무 면제
      if (uc.change_type === 'new') continue; // 신규(사용자 추가) UC 는 레거시 코드 부재 → 근거 면제 (DEC-2026-06-25)
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
  }

  // 2. BR-INTENT match
  // v0.4.0 (BR-split STEP 2): multi-path BR lookup 을 _shared 로 중앙화
  //   (구 v11.5.1 LL-validator-dual-key-02 / 4 shape) + mis-fire 신호 추가.
  const brsIntent = discoverySpec?.business_rules_intent ?? [];
  const { rules: analysisBrList, unrecognizedShape } =
    normalizeAnalysisBusinessRules(analysis);
  const analysisBrs = new Set(analysisBrList.map((br) => br.id));
  // mis-fire fix (blocker #1): BR-container 키가 present 인데 id 보유 BR 0건 =
  //   미인식/malformed shape → N 개 false unknown_br critical 대신 단일 진단 1건.
  //   (BR 키 자체 부재 = 정당한 0-rules → 무알람 / plan §8.5 정정 2.)
  if (unrecognizedShape && brsIntent.length > 0) {
    findings.push({
      kind: 'discovery.br_source.shape_unrecognized',
      severity: 'high',
      message: `analysis business-rules 가 알려진 shape 로 0건 추출 (container 키는 present) — ${brsIntent.length} BR-INTENT 를 unknown_br 로 오탐하지 않도록 단일 진단으로 보고. business-rules 산출물 shape/경로 확인 필요.`,
    });
  }
  const INTENT_CERTAINTY_ENUM = ['observed', 'inferred-consequence', 'unverified-intent', 'source-refuted'];
  for (const intent of brsIntent) {
    // unrecognizedShape 시 BR set 이 비어 전건 false 가 되므로 unknown_br 억제(단일 진단으로 대체).
    if (!unrecognizedShape && !analysisBrs.has(intent.br_id)) {
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

  // 3. UC coverage (scope-aware / F13 — DEC-2026-06-10-discovery-validator-scope-aware)
  // F1 fix (dogfood): domain.schema 는 use_cases 를 bounded_contexts[] 아래 중첩한다.
  //   이전엔 top-level analysis.domain.use_cases 만 읽어, schema-conformant domain.json 에서는 UC set 이 항상 비어
  //   coverage 체크가 silent skip(vacuous pass) 됐음. top-level(backward-compat) + 중첩 양쪽에서 수집.
  // F13 fix (dogfood ep-be-gea): canonical-global accumulation 모델(DEC-2026-06-07-subset-retire)에서
  //   output/domain.json 은 여러 BC 가 누적된다. 단일 scope discovery 를 전역 전체 BC 분모로 평가하면
  //   타 BC 의 UC/entity 가 coverage·UC/entity 비율을 구조적으로 희석(event 누적 후 golf=31% 등). sync.js BC-subset
  //   머신과 정합 — discovery UC 의 scope-token(UC-<TOKEN>-NNN)을 보유한 BC 만 in-scope 분모로 한정.
  //   안전 fallback: 단일 BC / token 무매치 / 전 BC 매치(=실 단일scope) / top-level use_cases → 전체(기존 동작 보존).
  const ucScopeToken = (id) => {
    const m = /^UC-(.+)-\d+$/.exec(typeof id === 'string' ? id : '');
    return m ? m[1] : null;
  };
  const allBCs = Array.isArray(analysis?.domain?.bounded_contexts) ? analysis.domain.bounded_contexts : [];
  const discoveryTokens = new Set(useCases.map((u) => ucScopeToken(u?.id)).filter(Boolean));
  let scopedBCs = allBCs;
  let scopeFiltered = false;
  if (allBCs.length > 1 && discoveryTokens.size > 0) {
    const inScope = allBCs.filter(
      (bc) => Array.isArray(bc?.use_cases) && bc.use_cases.some((u) => discoveryTokens.has(ucScopeToken(u?.id)))
    );
    if (inScope.length > 0 && inScope.length < allBCs.length) {
      scopedBCs = inScope;
      scopeFiltered = true;
    }
  }
  const scopedBcIds = scopedBCs.map((bc) => bc?.id).filter(Boolean);

  let ucCoverageRatio = 1.0;
  let analysisUCs = new Set();
  const collectIds = (arr, set) => {
    if (Array.isArray(arr)) for (const x of arr) if (x && x.id) set.add(x.id);
  };
  collectIds(analysis?.domain?.use_cases, analysisUCs);
  for (const bc of scopedBCs) collectIds(bc?.use_cases, analysisUCs);
  if (!isDraft && analysisUCs.size > 0) {
    // in_scope=false UC 는 이번 iteration 의도적 제외 → covered 로 세지 않음 (게이트① 확정 반영 / DEC-2026-06-25).
    const discoveryUCIds = new Set(useCases.filter(u => u.in_scope !== false).map(u => u.id));
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
        scope_filtered: scopeFiltered,
        scoped_bounded_contexts: scopedBcIds,
        message: `UC coverage ${ucCoverageRatio.toFixed(2)} < 0.80 (analysis ${analysisUCs.size} UCs / discovery covers ${[...analysisUCs].filter(id => discoveryUCIds.has(id)).length})${scopeFiltered ? ` [scope-filtered → BC: ${scopedBcIds.join(', ')}]` : ''}`
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
  // F1 fix (dogfood): entities 도 bounded_contexts[] 아래 중첩 → top-level + 중첩 합산.
  // F13 fix: coverage 분모와 동일하게 in-scope BC entity 만 합산 (희석 회피 / scopedBCs 재사용).
  let domainEntities = Array.isArray(analysis?.domain?.entities) ? analysis.domain.entities.length : 0;
  for (const bc of scopedBCs) {
    if (Array.isArray(bc?.entities)) domainEntities += bc.entities.length;
  }
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
    // draft(게이트①) = 미해결이 정상(사용자가 /confirm-scope 로 해소 예정) → advisory.
    // final(게이트②) = 해소됐어야 함 → critical(gate stop). (DEC-2026-06-25-discovery-2-gate)
    findings.push({
      kind: 'discovery.pending-decisions-not-resolved',
      severity: isDraft ? 'low' : 'critical',
      pending_count: pending.length,
      message: isDraft
        ? `pending_decisions[] ${pending.length}건 — 게이트①(draft)에서 /confirm-scope 로 해소하세요 (advisory)`
        : `pending_decisions[] ${pending.length}건 미해결 — gate#1 에서 user-explicit 전환 의무 (보류 시 gate stop / SKILL §v8.7.5 b)`
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

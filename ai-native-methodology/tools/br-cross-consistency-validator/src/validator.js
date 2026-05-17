// br-cross-consistency-validator — 핵심 entry
// ★ ADR-CHAIN-011 정합 / Plan N 정합
// ★ ★ ★ ★ ★ session 12차 patch — Layer 2 본격 paradigm 통합 (★ B-4 / Q-C4 (a) 결단 정합)

import { validateBR, resetFindingSeq } from './deterministic.js';
import { validateBRSemanticConsistency, aggregateLLMScores, extractLLMMeta, LLM_DEFAULT_THRESHOLD } from './llm.js';

// ★ ★ ★ ★ v2.5.0 Phase C session 12차 결단 (★ Q-C4 (a) Layer 1 AND Layer 2 양쪽 통과 paradigm):
//   ★ ★ Layer 1 deterministic_score ≥ DETERMINISTIC_THRESHOLD AND
//   ★ ★ (Layer 2 미시행 → Layer 1 만 검증 / Layer 2 시행 → Layer 2 score ≥ LLM_DEFAULT_THRESHOLD)
const DETERMINISTIC_THRESHOLD = 0.85;     // ★ Layer 1 deterministic 영역 threshold
const OVERALL_THRESHOLD = DETERMINISTIC_THRESHOLD; // ★ legacy alias / backward-compat

function extractRules(rulesDoc) {
  // ★ ★ v5.0.0 (묶음 Q ① / DEC-2026-05-17-q1-alias-4중첩-폐기) — canonical 단일.
  //   alias `rules` / `rules_manual_authored` 폐기 (hard kill / schema additionalProperties:false reject).
  //   ★ poc-04 잠재 결함 자동 수정 — 직전 rules_manual_authored 미처리(return [])였으나
  //     migration 으로 business_rules 보유 → 가시화 (회귀 아닌 개선 / STOP-1 실측: 3 BR low only).
  if (Array.isArray(rulesDoc.business_rules)) return rulesDoc.business_rules;
  return [];
}

export function validateRulesDoc(rulesDoc, options = {}) {
  const rules = extractRules(rulesDoc);
  resetFindingSeq();

  const allFindings = [];
  const overlapScores = [];
  let withNL = 0;
  let withGWT = 0;
  let withBoth = 0;
  let withDescriptionOnly = 0; // ★ ★ v2.5.0 Phase A — description-only fallback carry 추적

  for (let i = 0; i < rules.length; i++) {
    const br = rules[i];
    const { findings, overlap_score, has_nl, has_gwt, has_description } = validateBR(br, {
      path: `/business_rules/${i}`,
    });
    allFindings.push(...findings);
    if (typeof overlap_score === 'number') overlapScores.push(overlap_score);
    if (has_nl) withNL += 1;
    if (has_gwt) withGWT += 1;
    if (has_nl && has_gwt) withBoth += 1;
    if (!has_nl && !has_gwt && has_description) withDescriptionOnly += 1;
  }

  const deterministicScore = computeDeterministicScore(rules.length, allFindings);

  const summary = {
    deterministic_consistency_score: deterministicScore,
    llm_consistency_score: null, // ★ Layer 2 — validateRulesDocStrict 시만 채움
    overall_score: deterministicScore,
    overall_threshold: OVERALL_THRESHOLD,
    deterministic_threshold: DETERMINISTIC_THRESHOLD,
    llm_threshold: null,
    gate_status: deterministicScore >= DETERMINISTIC_THRESHOLD ? 'pass' : 'fail',
  };

  return {
    stats: {
      total: rules.length,
      with_natural_language: withNL,
      with_gwt: withGWT,
      with_both: withBoth,
      with_description_only: withDescriptionOnly,
      with_finding: countRulesWithFinding(rules.length, allFindings),
    },
    overlap_distribution: distributionStats(overlapScores),
    findings: allFindings,
    summary,
  };
}

// ★ ★ ★ ★ v2.5.0 Phase C session 12차 — Layer 2 LLM 본격 paradigm 통합
//   ★ ★ options.llmResults 입력 시 = ★ Claude Code sub-agent 호출 후 결과 JSON 처리
//   ★ options.llmResults 부재 시 = ★ ★ skipped (★ Layer 1 만 시행 / backward-compat)
export async function validateRulesDocStrict(rulesDoc, options = {}) {
  const result = validateRulesDoc(rulesDoc, options);
  const rules = extractRules(rulesDoc);

  const llmMeta = extractLLMMeta(options.llmResults);
  const llmRunResults = [];

  for (const br of rules) {
    const r = await validateBRSemanticConsistency(br, {
      strict: true,
      llmResults: options.llmResults,
    });
    llmRunResults.push(r);

    // ★ ★ Layer 2 findings 영역을 main findings 에 통합
    if (r && !r.skipped && Array.isArray(r.findings)) {
      for (const f of r.findings) {
        result.findings.push({
          ...f,
          path: `/business_rules/${rules.indexOf(br)}`,
        });
      }
    }
  }

  // ★ ★ ★ aggregate Layer 2 score
  const llmScore = aggregateLLMScores(llmRunResults);
  result.summary.llm_consistency_score = llmScore;
  result.summary.llm_threshold = LLM_DEFAULT_THRESHOLD;

  if (options.llmResults && Array.isArray(options.llmResults.results)) {
    result.summary.llm_status = 'evaluated';
    result.summary.llm_model = llmMeta.model;
    result.summary.llm_batch_size = llmMeta.batch_size;
    result.summary.llm_invoked_at = llmMeta.invoked_at;
    result.summary.llm_schema_version = llmMeta.schema_version;
  } else {
    result.summary.llm_status = 'skipped';
    result.summary.llm_skip_reason = '--llm-results 입력 부재 / Claude Code sub-agent 호출 후 결과 JSON 입력 의무';
  }

  // ★ ★ ★ ★ ★ Q-C4 (a) Layer 1 AND Layer 2 양쪽 통과 paradigm
  //   ★ Layer 1 pass + (Layer 2 skipped OR Layer 2 pass) → overall pass
  //   ★ Layer 1 fail → overall fail
  //   ★ Layer 2 fail (★ llm_consistency_score < LLM_DEFAULT_THRESHOLD) → overall fail
  const layer1Pass = result.summary.deterministic_consistency_score >= DETERMINISTIC_THRESHOLD;
  const layer2Skipped = llmScore === null;
  const layer2Pass = layer2Skipped || llmScore >= LLM_DEFAULT_THRESHOLD;
  result.summary.gate_status = (layer1Pass && layer2Pass) ? 'pass' : 'fail';

  // ★ ★ overall_score = ★ Layer 1 + Layer 2 평균 (★ Layer 2 skipped 시 Layer 1 만)
  if (layer2Skipped) {
    result.summary.overall_score = result.summary.deterministic_consistency_score;
  } else {
    result.summary.overall_score = Number(
      ((result.summary.deterministic_consistency_score + llmScore) / 2).toFixed(3),
    );
  }

  return result;
}

function computeDeterministicScore(totalRules, findings) {
  if (totalRules === 0) return 1;
  // ★ severity 기반 weighted penalty
  const weight = { critical: 1.0, high: 0.7, medium: 0.4, low: 0.15 };
  // ★ Layer 1 findings 만 반영 (★ Layer 2 findings 는 별도 layer 2 score axis)
  const layer1Findings = findings.filter(f => !(f.rule === 'semantic_drift_detected' || f.rule === 'confidence_cap_exceeded'));
  const totalPenalty = layer1Findings.reduce((acc, f) => acc + (weight[f.severity] ?? 0), 0);
  const maxPenalty = totalRules * 1.0;
  const raw = 1 - totalPenalty / maxPenalty;
  return Math.max(0, Math.min(1, Number(raw.toFixed(3))));
}

function countRulesWithFinding(totalRules, findings) {
  const set = new Set();
  for (const f of findings) {
    if (typeof f.path === 'string') set.add(f.path);
  }
  return set.size;
}

function distributionStats(scores) {
  if (scores.length === 0) {
    return { count: 0, mean: null, median: null, stddev: null, min: null, max: null };
  }
  const sorted = [...scores].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 1
    ? sorted[(n - 1) / 2]
    : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const variance = sorted.reduce((acc, x) => acc + (x - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);
  return {
    count: n,
    mean: Number(mean.toFixed(3)),
    median: Number(median.toFixed(3)),
    stddev: Number(stddev.toFixed(3)),
    min: Number(sorted[0].toFixed(3)),
    max: Number(sorted[n - 1].toFixed(3)),
  };
}

export { OVERALL_THRESHOLD, DETERMINISTIC_THRESHOLD };

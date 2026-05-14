// br-cross-consistency-validator — 핵심 entry
// ★ ADR-CHAIN-011 정합 / Plan N 정합

import { validateBR, resetFindingSeq } from './deterministic.js';
import { validateBRSemanticConsistency, aggregateLLMScores } from './llm.js';

const OVERALL_THRESHOLD = 0.85; // ★ ADR-CHAIN-011 §5.4 empirical hypothesis / 11 PoC spike 후 confirm 의무

function extractRules(rulesDoc) {
  // ★ schema 6갈래 drift 정합 — 본 session = ★ top-level 호환 모드
  //   v1.x: { rules: [...] }
  //   v2.x candidate: { business_rules: [...] } (★ sub-plan §2 다음 session)
  //   PoC #07~#11: { business_rules: [...] } 또는 { rules: [...] } variant
  if (Array.isArray(rulesDoc.business_rules)) return rulesDoc.business_rules;
  if (Array.isArray(rulesDoc.rules)) return rulesDoc.rules;
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
  let withDescriptionOnly = 0; // ★ ★ v2.5.0 Phase A — description-only fallback carry 추적 (★ Phase B 마이그레이션 의무)

  for (let i = 0; i < rules.length; i++) {
    const br = rules[i];
    const { findings, overlap_score, has_nl, has_gwt, has_description } = validateBR(br, {
      path: `/business_rules/${i}`,
      keywordThreshold: options.keywordThreshold,
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
    llm_consistency_score: null, // ★ Layer 2 본 session placeholder
    overall_score: deterministicScore,
    overall_threshold: OVERALL_THRESHOLD,
    gate_status: deterministicScore >= OVERALL_THRESHOLD ? 'pass' : 'fail',
  };

  return {
    stats: {
      total: rules.length,
      with_natural_language: withNL,
      with_gwt: withGWT,
      with_both: withBoth,
      with_description_only: withDescriptionOnly, // ★ ★ v2.5.0 Phase A 신규 stat (★ Phase B 마이그레이션 carry 가시화)
      with_finding: countRulesWithFinding(rules.length, allFindings),
    },
    overlap_distribution: distributionStats(overlapScores),
    findings: allFindings,
    summary,
  };
}

export async function validateRulesDocStrict(rulesDoc, options = {}) {
  const result = validateRulesDoc(rulesDoc, options);
  // ★ ★ Layer 2 LLM advisory (★ Static Tool 시뮬레이션 금지 / 본 session placeholder)
  const rules = extractRules(rulesDoc);
  const llmResults = [];
  for (const br of rules) {
    const r = await validateBRSemanticConsistency(br, { strict: true });
    llmResults.push(r);
  }
  const llmScore = aggregateLLMScores(llmResults);
  result.summary.llm_consistency_score = llmScore;
  result.summary.llm_status = 'placeholder'; // ★ 다음 session 구현
  return result;
}

function computeDeterministicScore(totalRules, findings) {
  if (totalRules === 0) return 1;
  // ★ severity 기반 weighted penalty
  const weight = { critical: 1.0, high: 0.7, medium: 0.4, low: 0.15 };
  const totalPenalty = findings.reduce((acc, f) => acc + (weight[f.severity] ?? 0), 0);
  const maxPenalty = totalRules * 1.0; // 한 BR 당 최대 1.0
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

export { OVERALL_THRESHOLD };

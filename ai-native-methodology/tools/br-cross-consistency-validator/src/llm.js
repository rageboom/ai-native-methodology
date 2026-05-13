// Layer 2 LLM advisory (★ --strict 옵션 시만 / 신뢰도 ≤ 0.85)
// ★ ADR-CHAIN-011 §5.3 + §6.3 정합 — Static Tool 시뮬레이션 금지 정책
//   본 layer = ★ ★ advisory 만 / 결정 자체 LLM 의존 ❌
//   본 session = ★ placeholder / 실 LLM 호출 = 다음 session 별도 구현
//   sub-agent 호출 interface 만 정의 (★ F-015 cross-validation 패턴)

export const LLM_DEFAULT_THRESHOLD = 0.7; // ★ ADR-CHAIN-011 §5.4 empirical hypothesis
export const LLM_CONFIDENCE_CAP = 0.85; // ★ Static Tool 시뮬레이션 금지 / advisory 신뢰도 cap

// ★ ★ placeholder 호출. 실 구현 시 sub-agent LLM 호출 (Anthropic SDK / Task tool).
// 본 session = ★ 실행 시 즉시 skipped finding 반환 (★ "다음 session 구현 carry" 명시)
export async function validateBRSemanticConsistency(br, options = {}) {
  if (!options.strict) {
    return { skipped: true, reason: 'strict mode 비활성 (Layer 2 advisory off)' };
  }

  // ★ ★ 본 session = placeholder
  return {
    skipped: true,
    reason: 'Layer 2 LLM 구현 carry (★ ADR-CHAIN-011 §7.3 C-br-cross-validator-implementation Layer 2 다음 session)',
    advisory_note: '실 구현 시 Anthropic SDK sub-agent 호출 / F-015 cross-validation 패턴 정합 / confidence cap 0.85',
  };
}

export function aggregateLLMScores(results) {
  const scored = results.filter(r => !r.skipped && typeof r.score === 'number');
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, r) => acc + r.score, 0);
  return Number((sum / scored.length).toFixed(3));
}

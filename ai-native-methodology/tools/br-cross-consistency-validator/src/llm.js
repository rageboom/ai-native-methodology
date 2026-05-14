// Layer 2 LLM advisory (★ --strict 옵션 시만 / 신뢰도 ≤ 0.85)
// ★ ADR-CHAIN-011 §5.3 + §6.3 정합 — Static Tool 시뮬레이션 금지 정책
//   본 layer = ★ ★ advisory 만 / 결정 자체 LLM 의존 ❌
//   본 session = ★ placeholder / 실 LLM 호출 = 다음 session 별도 구현
//
// ★ ★ ★ ★ ★ ★ ★ ★ ★ session 11차 patch v5 paradigm 회복 (★ ★ paradigm sliding error 회복):
//   ★ ★ ★ ★ ★ Phase C 본격 구현 paradigm = ★ ★ ★ **Claude Code sub-agent (Task tool / Agent tool) invocation**
//     - ★ 본 방법론 = Claude Code plugin 자산 (★ .claude-plugin/ + agents/ + skills/ + hooks/)
//     - ★ Anthropic API key 의무 ❌ / OpenAI API 의무 ❌ / 외부 SDK 의존 ❌
//     - ★ Claude Code subscription 자체 영역 = ★ ★ ★ ★ ★ ★ 실제 Claude 호출 paradigm
//     - ★ ★ Static Tool 시뮬레이션 ❌ 정합 (★ persona 시뮬레이션 ❌ / 실제 sub-agent 호출)
//   ★ ★ ★ 호출 paradigm 후보 (★ session 12차+ Phase C 본격 plan 영역):
//     B-1 (★ ★ ★ 권장): ★ ★ Claude Code plugin hook 안 sub-agent 호출 (★ hooks/ 자산 정합)
//     B-2: chain-driver (★ chain harness 5 요소 1) 안 호출
//     B-3: 사용자 위임 mode (★ validator 가 LLM 결과 JSON 입력 받음)

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
    reason: 'Layer 2 LLM 구현 carry (★ ADR-CHAIN-011 §11 Phase C 다음 session 12차+)',
    advisory_note: '★ ★ ★ ★ ★ ★ session 11차 patch v5 paradigm 회복 — 실 구현 시 ★ ★ Claude Code sub-agent (Task tool / Agent tool) 호출 paradigm / ★ Anthropic API SDK 의무 ❌ / ★ Claude Code plugin hook 영역 / F-015 cross-validation 패턴 정합 / confidence cap 0.85',
  };
}

export function aggregateLLMScores(results) {
  const scored = results.filter(r => !r.skipped && typeof r.score === 'number');
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, r) => acc + r.score, 0);
  return Number((sum / scored.length).toFixed(3));
}

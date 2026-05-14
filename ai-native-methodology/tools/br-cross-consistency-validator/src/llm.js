// Layer 2 LLM advisory (★ --strict 옵션 시만 / 신뢰도 ≤ 0.85)
// ★ ADR-CHAIN-011 §5.3 + §6.3 정합 — Static Tool 시뮬레이션 금지 정책
// ★ ★ ★ ★ ★ ★ ★ ★ ★ session 12차 patch — Layer 2 본격 paradigm (★ B-4 paradigm 정합 / Claude Code sub-agent invocation paradigm)
//
// ★ ★ ★ ★ paradigm — "★ ★ Claude (★ 본 LLM / Opus 4.7) 가 ★ validator 호출 전 ★ Task tool (Agent tool) 호출 후 결과 입력":
//   1. ★ ★ Claude Code 안 Claude (호출자) 가 ★ ★ Task tool 호출 (★ Sonnet 4.6 권장 — STOP-1 echo chamber 약화 paradigm)
//   2. ★ ★ batch paradigm — 1회 Task tool 호출 안 전체 BR list 입력 + 전체 결과 JSON 반환 (★ STOP-4 흡수)
//   3. ★ ★ Claude 가 결과 JSON 파일 저장 후 → validator 호출 시 `--llm-results <path>` 옵션 입력
//   4. ★ ★ ★ validator (본 모듈) = ★ ★ Layer 2 결과 처리 + finding 영역 생성 + Layer 1 + Layer 2 통합 점수 반환
//
// ★ ★ ★ Static Tool 시뮬레이션 ❌ 정합:
//   - ★ ★ Task tool 호출 = ★ 실제 Claude 호출 (persona ❌)
//   - ★ ★ confidence_cap_exceeded finding = LLM advisory 신뢰도 > 0.85 시 격하 paradigm
//
// ★ ★ Layer 2 LLM results JSON schema (★ docs/layer-2-prompt-spec.md 정합):
//   {
//     "$schema_version": "v2.5.0-phase-c",
//     "model": "claude-sonnet-4-6",
//     "invoked_at": "<ISO 8601>",
//     "batch_size": <int>,
//     "results": [
//       {
//         "br_id": "BR-...",
//         "semantic_score": <0..1>,      // ★ NL ↔ GWT 의미 정합 / 1 = 완전 동치 / 0 = 정합 ❌
//         "rationale": "...",             // ★ ★ "이유" 영역 / 단문 (1~3 문장)
//         "confidence": <0..0.85>         // ★ ★ LLM advisory 신뢰도 cap (★ Static Tool 시뮬레이션 금지 정합 / > 0.85 시 격하)
//       }
//     ]
//   }

export const LLM_DEFAULT_THRESHOLD = 0.7; // ★ ADR-CHAIN-011 §5.4 empirical hypothesis / Layer 2 semantic threshold
export const LLM_CONFIDENCE_CAP = 0.85;   // ★ Static Tool 시뮬레이션 금지 / advisory 신뢰도 cap

// ★ ★ ★ ★ session 12차 patch — Layer 2 본격 paradigm 구현
//   ★ llmResults 입력 시 = ★ 실 처리 paradigm (★ Claude Code sub-agent 호출 후 결과 입력 paradigm)
//   ★ llmResults 부재 시 = ★ skipped (★ Layer 1 만 시행)
export async function validateBRSemanticConsistency(br, options = {}) {
  if (!options.strict) {
    return { skipped: true, reason: 'strict mode 비활성 (Layer 2 advisory off)' };
  }

  // ★ ★ ★ Layer 2 LLM results 입력 부재 시 = skipped (★ ★ Claude Code sub-agent 호출 후 결과 입력 의무)
  if (!options.llmResults || !Array.isArray(options.llmResults.results)) {
    return {
      skipped: true,
      reason: '★ ★ --llm-results 입력 부재 (★ Claude Code sub-agent 호출 후 결과 JSON 입력 의무 / docs/layer-2-prompt-spec.md 정합)',
      advisory_note: '★ ★ ★ v2.5.0 Phase C paradigm — Claude (호출자) 가 ★ Task tool 호출 후 결과 JSON 저장 → validator --llm-results <path> 입력 paradigm',
    };
  }

  // ★ ★ ★ br_id 매칭 paradigm
  const llmResult = options.llmResults.results.find(r => r.br_id === br.id);
  if (!llmResult) {
    return {
      skipped: true,
      reason: `★ Layer 2 LLM result 부재 (br_id=${br.id}) — batch 안 미포함 / Claude Task tool 호출 batch 재시행 의무`,
    };
  }

  // ★ ★ ★ ★ Layer 2 결과 본격 처리 paradigm
  const findings = [];
  const semanticScore = Number(llmResult.semantic_score);
  const confidence = Number(llmResult.confidence ?? 0);
  const rationale = typeof llmResult.rationale === 'string' ? llmResult.rationale : '';

  // ★ ★ semantic_score < LLM_DEFAULT_THRESHOLD → ★ semantic_drift_detected finding
  if (Number.isFinite(semanticScore) && semanticScore < LLM_DEFAULT_THRESHOLD) {
    findings.push({
      id: `F-CONSISTENCY-SEMANTIC`,
      severity: 'medium',
      br_id: br.id,
      rule: 'semantic_drift_detected',
      message: `★ Layer 2 LLM semantic_score ${semanticScore.toFixed(2)} < ${LLM_DEFAULT_THRESHOLD} (★ natural_language ↔ given/when/then semantic 정합 부재 / LLM advisory)`,
      suggestion: '★ natural_language 또는 given/when/then 수정 검토 / 도메인 전문가 검토 carry',
      semantic_score: Number(semanticScore.toFixed(3)),
      rationale,
      llm_model: options.llmResults.model || '(unknown)',
      llm_confidence: Number(confidence.toFixed(3)),
    });
  }

  // ★ ★ ★ confidence > LLM_CONFIDENCE_CAP → ★ confidence_cap_exceeded finding (★ Static Tool 시뮬레이션 금지 정합)
  if (Number.isFinite(confidence) && confidence > LLM_CONFIDENCE_CAP) {
    findings.push({
      id: `F-CONSISTENCY-CONFIDENCE-CAP`,
      severity: 'low',
      br_id: br.id,
      rule: 'confidence_cap_exceeded',
      message: `★ Layer 2 LLM confidence ${confidence.toFixed(2)} > ${LLM_CONFIDENCE_CAP} cap (★ Static Tool 시뮬레이션 금지 정책 정합 / advisory 신뢰도 강등 의무)`,
      suggestion: '★ LLM advisory = decision-making 대체 ❌ / 사람 검토 또는 Layer 1 (deterministic) 보조 활용',
      original_confidence: Number(confidence.toFixed(3)),
      capped_confidence: LLM_CONFIDENCE_CAP,
    });
  }

  return {
    skipped: false,
    br_id: br.id,
    semantic_score: Number.isFinite(semanticScore) ? Number(semanticScore.toFixed(3)) : null,
    confidence: Number.isFinite(confidence) ? Math.min(confidence, LLM_CONFIDENCE_CAP) : null,
    rationale,
    findings,
  };
}

export function aggregateLLMScores(results) {
  const scored = results.filter(r => !r.skipped && typeof r.semantic_score === 'number');
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, r) => acc + r.semantic_score, 0);
  return Number((sum / scored.length).toFixed(3));
}

// ★ ★ ★ Layer 2 results 안 model + batch_size 영역 메타 추출 paradigm
export function extractLLMMeta(llmResults) {
  if (!llmResults || typeof llmResults !== 'object') return { model: null, batch_size: null, invoked_at: null };
  return {
    model: typeof llmResults.model === 'string' ? llmResults.model : null,
    batch_size: Number.isFinite(llmResults.batch_size) ? llmResults.batch_size : (Array.isArray(llmResults.results) ? llmResults.results.length : null),
    invoked_at: typeof llmResults.invoked_at === 'string' ? llmResults.invoked_at : null,
    schema_version: typeof llmResults.$schema_version === 'string' ? llmResults.$schema_version : null,
  };
}

// gate-eval.js — validator 결과 → block/unblock 결정 (mechanical gate trio (i) 의 source).
// ★ ADR-CHAIN-005 §3 (mechanical gate enforcement).
//
// findings shape:
// {
//   critical: 0, high: 0, medium: 0, low: 0, info: 0,
//   coverage_pct: 0.92,             // chain-coverage 결과
//   coverage_threshold: 0.85,       // ratchet
//   evidence_missing: [],           // chain-strict lint
//   tests_total: 100, tests_passed: 100, tests_failed: 0,  // chain 3/4 only
//   // ★ ★ ★ ★ v2.5.0 Phase C session 14차 — Layer 2 LLM 통합 paradigm (ADR-CHAIN-011 §5.4.6 B 정합)
//   llm_consistency_score: 0.85,    // aggregate mean (★ br-cross-consistency-validator Layer 2 / null = skipped)
//   llm_threshold: 0.7,             // semantic threshold (★ default 0.7 / caller-configurable)
//   llm_status: 'evaluated',        // 'evaluated' | 'skipped' | null (★ ★ explicit guard 의무 / REVISE-1 정합)
// }

const REQUIRED_VALIDATORS_PER_STAGE = {
  // ★ v9.0 — planning→discovery 개칭 (gate #1). plan stage = gate deferred (placeholder / 항목 없음).
  discovery: ['planning-extraction-validator', 'schema-validator', 'br-cross-consistency-validator'],
  spec:      ['chain-coverage-validator', 'drift-validator', 'formal-spec-link-validator', 'schema-validator'],
  test:      ['test-impl-pass-validator', 'spec-test-link-validator', 'schema-validator'],
  implement: ['test-impl-pass-validator', 'static-runner', 'traceability-matrix-builder'],
};
// ★ ★ ★ v2.4.0 — discovery(planning) stage 안 br-cross-consistency-validator 추가 (ADR-CHAIN-011 §5.6 정합).
//   BR dual representation paradigm — natural_language + given/when/then 정합 cross-validation.
// ★ ★ ★ ★ v2.5.0 Phase C session 14차 — Layer 2 LLM 통합 (ADR-CHAIN-011 §5.4.6 B 본격 정합).
//   ★ Q-C4 (a) Layer 1 AND Layer 2 양쪽 통과 paradigm + Q-S2 (b) aggregate block + coverage_threshold 수준 severity.
//   ★ ★ Senior STOP-3 흡수 (Q-S3 (a) Phase C 종결 자격 유일 paradigm).

const TEST_STAGE_EXPECTED = 'all_fail';   // RED 의무
const IMPL_STAGE_EXPECTED = 'all_pass';   // GREEN 의무

export function requiredValidators(stage) {
  return REQUIRED_VALIDATORS_PER_STAGE[stage] || [];
}

export function evaluateGate(stage, findings) {
  const reasons = [];

  if ((findings.critical ?? 0) > 0) {
    reasons.push({ code: 'validator_critical', detail: `critical findings = ${findings.critical}` });
  }
  if ((findings.high ?? 0) > 0) {
    reasons.push({ code: 'validator_high', detail: `high findings = ${findings.high}` });
  }
  if (findings.coverage_pct != null && findings.coverage_threshold != null) {
    if (findings.coverage_pct < findings.coverage_threshold) {
      reasons.push({
        code: 'coverage_threshold',
        detail: `coverage ${findings.coverage_pct} < threshold ${findings.coverage_threshold}`,
      });
    }
  }
  if (Array.isArray(findings.evidence_missing) && findings.evidence_missing.length > 0) {
    reasons.push({
      code: 'evidence_missing',
      detail: `5종 물증 누락: ${findings.evidence_missing.join(', ')}`,
    });
  }

  // ★ ★ ★ ★ ★ ★ v2.5.0 Phase C session 14차 — Layer 2 LLM 통합 paradigm (★ Q-S1 (a) + Q-S2 (b) 정합)
  //   ★ ★ ★ REVISE-1 정합 — explicit guard 의무 (★ implicit JS false 의존 ❌):
  //     1. llm_status === 'skipped' → block 없음 (★ backward-compat / Layer 2 미시행 허용)
  //     2. llm_status === 'evaluated' && llm_consistency_score >= threshold → block 없음
  //     3. llm_status === 'evaluated' && llm_consistency_score < threshold → ★ block reason 추가
  //   ★ ★ Senior 권장 = layer2_threshold severity rank = coverage_threshold 수준 (rank 2) — user go → go-with-warnings 허용 / semantic drift 도메인 전문가 검토 carry 영역 / Phase D 흐름 정합
  if (findings.llm_status === 'evaluated' && findings.llm_consistency_score != null) {
    const llmThreshold = findings.llm_threshold ?? 0.7;
    if (findings.llm_consistency_score < llmThreshold) {
      reasons.push({
        code: 'layer2_threshold',
        detail: `★ Layer 2 llm_consistency_score ${findings.llm_consistency_score} < threshold ${llmThreshold} (★ NL ↔ GWT semantic 정합 부재 / ADR-CHAIN-011 §5.4.6 B Layer 2 mandatory 정합)`,
      });
    }
  }

  // Stage-specific outcome enforcement
  if (stage === 'test') {
    if (findings.tests_total != null && findings.tests_failed === 0) {
      reasons.push({
        code: 'evidence_missing',
        detail: `chain 3 expected ${TEST_STAGE_EXPECTED} (RED), but all tests passed — RED proof missing`,
      });
    }
  }
  if (stage === 'implement') {
    if (findings.tests_total != null && findings.tests_failed > 0) {
      reasons.push({
        code: 'evidence_missing',
        detail: `chain 4 expected ${IMPL_STAGE_EXPECTED} (GREEN), but ${findings.tests_failed} tests failed`,
      });
    }
    // ★ ★ ★ v8.6.0 — R19 evidence_trust 3-tier chain-strict mode 격상 (Senior STRONG-STOP 흡수).
    //   Tier 3 (simulated) emit 검출 시 영구 reject — chain gate block.
    //   findings.simulated_evidence_count > 0 시 block (static-runner evidence_trust=simulated 감지 결과).
    if ((findings.simulated_evidence_count ?? 0) > 0) {
      reasons.push({
        code: 'evidence_missing',
        detail: `★ R19 Tier 3 (simulated) evidence detected ×${findings.simulated_evidence_count} — no-simulation 정책 정면 위반 / chain gate -5%p + block`,
      });
    }
  }

  if (reasons.length === 0) {
    return { blocked: false, decision: 'go-eligible', reasons: [] };
  }

  // Pick the most severe reason as primary block_reason.
  const severityRank = {
    validator_critical: 0,
    state_corrupt: 0,
    validator_high: 1,
    coverage_threshold: 2,
    layer2_threshold: 2,         // ★ ★ session 14차 / Senior 권장 / coverage_threshold 수준 / user go → go-with-warnings 허용 / semantic drift Phase D carry
    evidence_missing: 3,
    schema_migration_required: 4,
    user_stop: 5,
  };
  reasons.sort((a, b) => (severityRank[a.code] ?? 99) - (severityRank[b.code] ?? 99));

  return {
    blocked: true,
    decision: 'block',
    reasons,
    primary_reason: reasons[0].code,
  };
}

// Auto Mode override 차단 — critical/high 위반 시 사용자 명시 결단도 'go' 거부.
// ★ ★ v2.5.0 Phase C session 14차 — layer2_threshold = ★ ★ critical/high 영역 ❌ / user go → go-with-warnings 허용 (★ ★ semantic drift 도메인 전문가 검토 carry 영역 / Phase D 흐름 정합).
export function applyUserDecision(gateResult, userDecision) {
  if (!gateResult.blocked) {
    if (userDecision === 'stop') return { blocked: true, decision: 'stop', reasons: [{ code: 'user_stop', detail: 'user requested stop' }] };
    return gateResult;
  }
  // Blocked: only 'stop' or 'revisit:<stage>' allowed. 'go' rejected for critical/high.
  if (userDecision === 'stop') {
    return { ...gateResult, decision: 'stop' };
  }
  if (userDecision?.startsWith('revisit:')) {
    return { ...gateResult, decision: userDecision };
  }
  if (userDecision === 'go') {
    const hasCriticalOrHigh = gateResult.reasons.some(
      (r) => r.code === 'validator_critical' || r.code === 'validator_high'
    );
    if (hasCriticalOrHigh) {
      return { ...gateResult, decision: 'block', user_override_rejected: true };
    }
    // medium/low only — allow with warning (★ ★ layer2_threshold 영역 정합)
    return { blocked: false, decision: 'go-with-warnings', reasons: gateResult.reasons };
  }
  return gateResult;
}

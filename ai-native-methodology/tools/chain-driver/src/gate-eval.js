// gate-eval.js — validator 결과 → block/unblock 결정 (mechanical gate trio (i) 의 source).
// ★ ADR-CHAIN-005 §3 (mechanical gate enforcement).
//
// findings shape:
// {
//   critical: 0, high: 0, medium: 0, low: 0, info: 0,
//   coverage_pct: 0.92,             // chain-coverage 결과
//   coverage_threshold: 0.85,       // ratchet
//   evidence_missing: [],           // chain-strict lint
//   tests_total: 100, tests_passed: 100, tests_failed: 0  // chain 3/4 only
// }

const REQUIRED_VALIDATORS_PER_STAGE = {
  planning:  ['planning-extraction-validator', 'schema-validator', 'br-cross-consistency-validator'],
  spec:      ['chain-coverage-validator', 'drift-validator', 'formal-spec-link-validator', 'schema-validator'],
  test:      ['test-impl-pass-validator', 'spec-test-link-validator', 'schema-validator'],
  implement: ['test-impl-pass-validator', 'static-runner', 'traceability-matrix-builder'],
};
// ★ ★ ★ v2.4.0 — planning stage 안 br-cross-consistency-validator 추가 (ADR-CHAIN-011 §5.6 정합).
//   BR dual representation paradigm — natural_language + given/when/then 정합 cross-validation.
//   threshold ≥ 0.85 = empirical hypothesis (★ ★ 11 PoC spike 결과 자료 부재 / sub-plan §2 후 재spike 의무).

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
    // medium/low only — allow with warning
    return { blocked: false, decision: 'go-with-warnings', reasons: gateResult.reasons };
  }
  return gateResult;
}

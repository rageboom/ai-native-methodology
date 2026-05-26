// aggregator.js — chain-driver next --findings 자동 입력 통합 핵심 로직
// ★ ★ v2.3.6 PATCH (DEC-2026-05-13-chain-driver-findings-integration-v2.3.6)
// ★ ★ "양심 의존 차단" 정책 강화 — chain-driver tool 직접 실행 + validator findings 자동 입력 의무
// ★ chain harness 5 요소 변경 ❌ (chain-driver 외부 자산 / findings shape 정합만)

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ★ chain-driver/src/gate-eval.js REQUIRED_VALIDATORS_PER_STAGE 와 정합 (★ v2.4.0 br-cross-consistency-validator 추가 / ★ v11.0.0 discovery rename)
export const REQUIRED_VALIDATORS_PER_STAGE = {
  discovery: ['discovery-extraction-validator', 'schema-validator', 'br-cross-consistency-validator'],
  spec: ['chain-coverage-validator', 'drift-validator', 'formal-spec-link-validator', 'schema-validator'],
  plan: ['plan-coverage-validator', 'schema-validator'],
  test: ['test-impl-pass-validator', 'spec-test-link-validator', 'schema-validator'],
  implement: ['test-impl-pass-validator', 'static-runner', 'traceability-matrix-builder'],
};

// ★ validator 출력 → findings shape 변환 의무 (gate-eval.js findings shape 정합)
// findings shape:
// {
//   critical: 0, high: 0, medium: 0, low: 0, info: 0,
//   coverage_pct?: 0.92, coverage_threshold?: 0.85,
//   evidence_missing?: [],
//   tests_total?: 100, tests_passed?: 100, tests_failed?: 0,
//   sources: { <validator_name>: {...} }   // ★ aggregator 자체 보강 / 추적 의무
// }

export function emptyFindings() {
  return {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    evidence_missing: [],
    sources: {},
  };
}

// ★ discovery-extraction-validator JSON → findings 변환 (v11.0.0 / renamed from planning-extraction-validator)
// 출력 shape (cli.js --json):
// { findings: [], coverage: { use_case: 1 }, summary: { total_findings, critical, high } }
export function transformDiscoveryExtraction(json) {
  const summary = json.summary ?? {};
  return {
    critical: summary.critical ?? 0,
    high: summary.high ?? 0,
    medium: summary.medium ?? 0,
    low: summary.low ?? 0,
    info: summary.info ?? 0,
  };
}

// ★ chain-coverage-validator JSON → findings 변환
// 출력 shape (cli.js --json):
// { findings: [], coverage: { uc_to_bhv: 1, bhv_to_ac: 1 }, summary: { total_findings, critical, high, medium } }
export function transformChainCoverage(json) {
  const summary = json.summary ?? {};
  const coverage = json.coverage ?? {};
  // ★ coverage_pct = min(uc_to_bhv, bhv_to_ac) (★ 가장 약한 link 반영)
  const ucToBhv = coverage.uc_to_bhv ?? 1;
  const bhvToAc = coverage.bhv_to_ac ?? 1;
  return {
    critical: summary.critical ?? 0,
    high: summary.high ?? 0,
    medium: summary.medium ?? 0,
    low: summary.low ?? 0,
    info: summary.info ?? 0,
    coverage_pct: Math.min(ucToBhv, bhvToAc),
    coverage_threshold: 0.85, // ★ default threshold (chain-coverage-validator default)
  };
}

// ★ schema-validator stdout summary → findings 변환
// 출력 shape: "schema-validator — N file(s)\n  valid: X  invalid: Y  skipped: Z"
// ★ schema-validator = stdout text 만 / JSON 없음 → invalid 개수 = critical
export function transformSchemaValidator(stdout) {
  const m = stdout.match(/valid:\s*(\d+)\s+invalid:\s*(\d+)/);
  if (!m) {
    return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  }
  const invalid = parseInt(m[2], 10);
  return {
    critical: invalid,  // ★ schema invalid = critical 정합 (chain-driver gate block)
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
}

// ★ test-impl-pass-validator JSON → findings 변환 (chain 3/4 한정)
// 출력 shape: { test_results: { total, passed, failed }, findings: [], summary: {...} }
export function transformTestImplPass(json) {
  const summary = json.summary ?? {};
  const testResults = json.test_results ?? {};
  return {
    critical: summary.critical ?? 0,
    high: summary.high ?? 0,
    medium: summary.medium ?? 0,
    low: summary.low ?? 0,
    info: summary.info ?? 0,
    tests_total: testResults.total ?? 0,
    tests_passed: testResults.passed ?? 0,
    tests_failed: testResults.failed ?? 0,
  };
}

// ★ generic JSON findings → severity count
// 기본 shape: { findings: [{severity: 'critical'|'high'|'medium'|'low'|'info'}], summary: {...} }
export function transformGeneric(json) {
  const summary = json.summary ?? {};
  return {
    critical: summary.critical ?? 0,
    high: summary.high ?? 0,
    medium: summary.medium ?? 0,
    low: summary.low ?? 0,
    info: summary.info ?? 0,
  };
}

// ★ ★ ★ v2.4.0 — br-cross-consistency-validator JSON → findings 변환 (ADR-CHAIN-011 §5.6)
// 출력 shape:
// { stats: { total, with_natural_language, with_gwt, with_both, with_finding },
//   overlap_distribution: { count, mean, median, ... },
//   findings: [{ id, severity, path, br_id, rule, message, ... }],
//   summary: { deterministic_consistency_score, llm_consistency_score, overall_score, overall_threshold, gate_status } }
export function transformBrCrossConsistency(json) {
  const findings = Array.isArray(json.findings) ? json.findings : [];
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) {
    const sev = f.severity ?? 'info';
    if (counts[sev] != null) counts[sev] += 1;
  }
  const summary = json.summary ?? {};
  return {
    ...counts,
    br_overall_score: summary.overall_score ?? null,
    br_overall_threshold: summary.overall_threshold ?? 0.85,
    br_gate_status: summary.gate_status ?? null,
  };
}

// ★ findings merge — 두 findings 합산 (severity count + 최소 coverage_pct 보존)
export function mergeFindings(a, b) {
  const merged = {
    critical: (a.critical ?? 0) + (b.critical ?? 0),
    high: (a.high ?? 0) + (b.high ?? 0),
    medium: (a.medium ?? 0) + (b.medium ?? 0),
    low: (a.low ?? 0) + (b.low ?? 0),
    info: (a.info ?? 0) + (b.info ?? 0),
    evidence_missing: [...(a.evidence_missing ?? []), ...(b.evidence_missing ?? [])],
    sources: { ...(a.sources ?? {}), ...(b.sources ?? {}) },
  };
  // ★ coverage_pct = 가장 약한 link (min)
  const ap = a.coverage_pct;
  const bp = b.coverage_pct;
  if (ap != null || bp != null) {
    merged.coverage_pct = Math.min(ap ?? 1, bp ?? 1);
    merged.coverage_threshold = a.coverage_threshold ?? b.coverage_threshold ?? 0.85;
  }
  // ★ tests_* = chain 3/4 only / preserve b (latest) over a
  if (b.tests_total != null || a.tests_total != null) {
    merged.tests_total = b.tests_total ?? a.tests_total;
    merged.tests_passed = b.tests_passed ?? a.tests_passed;
    merged.tests_failed = b.tests_failed ?? a.tests_failed;
  }
  return merged;
}

// ★ validator dispatch — validator_name + stage → transform 호출
export function dispatchValidator(validatorName, output) {
  switch (validatorName) {
    case 'discovery-extraction-validator':
      return transformDiscoveryExtraction(JSON.parse(output));
    case 'planning-extraction-validator': // backward-compat alias (deprecated)
      return transformDiscoveryExtraction(JSON.parse(output));
    case 'chain-coverage-validator':
      return transformChainCoverage(JSON.parse(output));
    case 'schema-validator':
      return transformSchemaValidator(output); // ★ stdout text
    case 'test-impl-pass-validator':
      return transformTestImplPass(JSON.parse(output));
    case 'br-cross-consistency-validator':
      return transformBrCrossConsistency(JSON.parse(output));
    default:
      // ★ generic JSON fallback (drift / formal-spec-link / spec-test-link / static-runner / traceability-matrix-builder)
      try {
        return transformGeneric(JSON.parse(output));
      } catch {
        return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
      }
  }
}

// ★ aggregate — stage 별 validator 실행 + findings 통합 / external runner 의존 (★ DI 의무 / unit test 정합)
// runValidator: (validatorName, projectDir) => stdout|null
export function aggregateForStage(stage, projectDir, runValidator) {
  const validators = REQUIRED_VALIDATORS_PER_STAGE[stage];
  if (!validators) {
    throw new Error(`unknown stage: ${stage} (expected: discovery / spec / plan / test / implement)`);
  }

  let findings = emptyFindings();
  const sources = {};

  for (const validatorName of validators) {
    const output = runValidator(validatorName, projectDir);
    if (output == null) {
      sources[validatorName] = { status: 'skipped', reason: 'validator unavailable or N/A' };
      continue;
    }
    try {
      const partial = dispatchValidator(validatorName, output);
      findings = mergeFindings(findings, partial);
      sources[validatorName] = { status: 'ok', findings: partial };
    } catch (err) {
      sources[validatorName] = { status: 'error', error: String(err.message ?? err) };
      // ★ parse fail = ★ critical (★ aggregator 양심 의존 차단 정합)
      findings.critical += 1;
    }
  }

  findings.sources = sources;
  return findings;
}

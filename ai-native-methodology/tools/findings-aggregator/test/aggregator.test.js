// aggregator.test.js — findings-aggregator unit test
// ★ ★ v2.3.6 PATCH (DEC-2026-05-13-chain-driver-findings-integration-v2.3.6)

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  emptyFindings,
  mergeFindings,
  transformPlanningExtraction,
  transformChainCoverage,
  transformSchemaValidator,
  transformTestImplPass,
  transformGeneric,
  transformBrCrossConsistency,
  dispatchValidator,
  aggregateForStage,
  REQUIRED_VALIDATORS_PER_STAGE,
} from '../src/aggregator.js';

describe('emptyFindings', () => {
  it('returns zero-count + empty arrays + empty sources', () => {
    const f = emptyFindings();
    assert.equal(f.critical, 0);
    assert.equal(f.high, 0);
    assert.equal(f.medium, 0);
    assert.equal(f.low, 0);
    assert.equal(f.info, 0);
    assert.deepEqual(f.evidence_missing, []);
    assert.deepEqual(f.sources, {});
  });
});

describe('REQUIRED_VALIDATORS_PER_STAGE', () => {
  it('★ chain-driver gate-eval.js REQUIRED_VALIDATORS_PER_STAGE 정합 (4 stage)', () => {
    assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.planning, ['planning-extraction-validator', 'schema-validator', 'br-cross-consistency-validator']);
    assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.spec, ['chain-coverage-validator', 'drift-validator', 'formal-spec-link-validator', 'schema-validator']);
    assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.test, ['test-impl-pass-validator', 'spec-test-link-validator', 'schema-validator']);
    assert.deepEqual(REQUIRED_VALIDATORS_PER_STAGE.implement, ['test-impl-pass-validator', 'static-runner', 'traceability-matrix-builder']);
  });
});

describe('transformPlanningExtraction', () => {
  it('★ summary critical/high count 정합', () => {
    const json = { summary: { total_findings: 2, critical: 1, high: 1, medium: 0 } };
    const f = transformPlanningExtraction(json);
    assert.equal(f.critical, 1);
    assert.equal(f.high, 1);
    assert.equal(f.medium, 0);
  });
  it('★ 0 findings = all zero', () => {
    const json = { summary: { total_findings: 0, critical: 0, high: 0 } };
    const f = transformPlanningExtraction(json);
    assert.equal(f.critical, 0);
    assert.equal(f.high, 0);
  });
});

describe('transformChainCoverage', () => {
  it('★ coverage_pct = min(uc_to_bhv, bhv_to_ac) (★ 가장 약한 link)', () => {
    const json = {
      summary: { critical: 0, high: 0, medium: 0 },
      coverage: { uc_to_bhv: 0.25, bhv_to_ac: 1 },
    };
    const f = transformChainCoverage(json);
    assert.equal(f.coverage_pct, 0.25);
    assert.equal(f.coverage_threshold, 0.85);
  });
  it('★ 100% coverage = 1.0', () => {
    const json = {
      summary: { critical: 0, high: 0 },
      coverage: { uc_to_bhv: 1, bhv_to_ac: 1 },
    };
    const f = transformChainCoverage(json);
    assert.equal(f.coverage_pct, 1);
  });
});

describe('transformSchemaValidator', () => {
  it('★ invalid 개수 = critical (★ schema strict block)', () => {
    const stdout = 'schema-validator — 3 file(s)\n  valid: 1  invalid: 2  skipped: 0\n';
    const f = transformSchemaValidator(stdout);
    assert.equal(f.critical, 2);
    assert.equal(f.high, 0);
  });
  it('★ all valid = no critical', () => {
    const stdout = 'schema-validator — 3 file(s)\n  valid: 3  invalid: 0  skipped: 0\n';
    const f = transformSchemaValidator(stdout);
    assert.equal(f.critical, 0);
  });
  it('★ summary 부재 fallback = all zero', () => {
    const f = transformSchemaValidator('no match output');
    assert.equal(f.critical, 0);
    assert.equal(f.high, 0);
  });
});

describe('transformTestImplPass', () => {
  it('★ tests_total/passed/failed 정합 (chain 3/4 only)', () => {
    const json = {
      summary: { critical: 0, high: 0 },
      test_results: { total: 12, passed: 10, failed: 2 },
    };
    const f = transformTestImplPass(json);
    assert.equal(f.tests_total, 12);
    assert.equal(f.tests_passed, 10);
    assert.equal(f.tests_failed, 2);
  });
});

describe('transformGeneric', () => {
  it('★ summary count fallback', () => {
    const json = { summary: { critical: 3, high: 1, medium: 0 } };
    const f = transformGeneric(json);
    assert.equal(f.critical, 3);
    assert.equal(f.high, 1);
  });
});

describe('mergeFindings', () => {
  it('★ severity count 합산', () => {
    const a = { critical: 1, high: 0, medium: 2, low: 0, info: 0 };
    const b = { critical: 0, high: 3, medium: 1, low: 0, info: 0 };
    const m = mergeFindings(a, b);
    assert.equal(m.critical, 1);
    assert.equal(m.high, 3);
    assert.equal(m.medium, 3);
  });
  it('★ coverage_pct = min (★ 가장 약한 link 보존)', () => {
    const a = { critical: 0, high: 0, medium: 0, low: 0, info: 0, coverage_pct: 0.9, coverage_threshold: 0.85 };
    const b = { critical: 0, high: 0, medium: 0, low: 0, info: 0, coverage_pct: 0.6, coverage_threshold: 0.85 };
    const m = mergeFindings(a, b);
    assert.equal(m.coverage_pct, 0.6);
  });
  it('★ tests_* preserve latest (b)', () => {
    const a = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    const b = { critical: 0, high: 0, medium: 0, low: 0, info: 0, tests_total: 12, tests_passed: 10, tests_failed: 2 };
    const m = mergeFindings(a, b);
    assert.equal(m.tests_total, 12);
    assert.equal(m.tests_passed, 10);
    assert.equal(m.tests_failed, 2);
  });
  it('★ evidence_missing 합산', () => {
    const a = { critical: 0, high: 0, medium: 0, low: 0, info: 0, evidence_missing: ['e1'] };
    const b = { critical: 0, high: 0, medium: 0, low: 0, info: 0, evidence_missing: ['e2', 'e3'] };
    const m = mergeFindings(a, b);
    assert.deepEqual(m.evidence_missing, ['e1', 'e2', 'e3']);
  });
});

describe('transformBrCrossConsistency (★ v2.4.0)', () => {
  it('★ findings severity 합산 + br_overall_score', () => {
    const json = {
      stats: { total: 3, with_natural_language: 2, with_gwt: 1, with_both: 0, with_finding: 2 },
      findings: [
        { id: 'F-1', severity: 'critical', rule: 'representation_missing' },
        { id: 'F-2', severity: 'medium', rule: 'keyword_mismatch' },
      ],
      summary: { deterministic_consistency_score: 0.5, overall_score: 0.5, overall_threshold: 0.85, gate_status: 'fail' },
    };
    const f = transformBrCrossConsistency(json);
    assert.equal(f.critical, 1);
    assert.equal(f.medium, 1);
    assert.equal(f.br_overall_score, 0.5);
    assert.equal(f.br_gate_status, 'fail');
  });
  it('★ 0 findings = pass', () => {
    const json = {
      stats: { total: 1, with_natural_language: 1, with_gwt: 0, with_both: 0, with_finding: 0 },
      findings: [],
      summary: { deterministic_consistency_score: 1, overall_score: 1, overall_threshold: 0.85, gate_status: 'pass' },
    };
    const f = transformBrCrossConsistency(json);
    assert.equal(f.critical, 0);
    assert.equal(f.br_gate_status, 'pass');
  });
});

describe('dispatchValidator', () => {
  it('★ planning-extraction-validator → JSON parse + transform', () => {
    const output = JSON.stringify({ summary: { critical: 0, high: 1 } });
    const f = dispatchValidator('planning-extraction-validator', output);
    assert.equal(f.high, 1);
  });
  it('★ schema-validator → stdout text transform', () => {
    const f = dispatchValidator('schema-validator', '  valid: 0  invalid: 1  skipped: 0');
    assert.equal(f.critical, 1);
  });
  it('★ unknown validator → generic JSON fallback', () => {
    const f = dispatchValidator('unknown-tool', JSON.stringify({ summary: { critical: 2 } }));
    assert.equal(f.critical, 2);
  });
  it('★ unknown + parse fail → all zero', () => {
    const f = dispatchValidator('unknown-tool', 'not json');
    assert.equal(f.critical, 0);
    assert.equal(f.high, 0);
  });
});

describe('aggregateForStage', () => {
  it('★ unknown stage throws', () => {
    assert.throws(
      () => aggregateForStage('foo', '/tmp/poc', () => null),
      /unknown stage: foo/
    );
  });

  it('★ planning stage — 0 findings (validator 모두 pass)', () => {
    const mockRun = (name) => {
      if (name === 'planning-extraction-validator') {
        return JSON.stringify({ summary: { critical: 0, high: 0 } });
      }
      if (name === 'schema-validator') {
        return '  valid: 4  invalid: 0  skipped: 0';
      }
      if (name === 'br-cross-consistency-validator') {
        return JSON.stringify({
          stats: { total: 1, with_natural_language: 1, with_gwt: 0, with_both: 0, with_finding: 0 },
          findings: [],
          summary: { deterministic_consistency_score: 1, overall_score: 1, overall_threshold: 0.85, gate_status: 'pass' },
        });
      }
      return null;
    };
    const findings = aggregateForStage('planning', '/tmp/poc', mockRun);
    assert.equal(findings.critical, 0);
    assert.equal(findings.high, 0);
    assert.equal(Object.keys(findings.sources).length, 3);
    assert.equal(findings.sources['planning-extraction-validator'].status, 'ok');
    assert.equal(findings.sources['schema-validator'].status, 'ok');
    assert.equal(findings.sources['br-cross-consistency-validator'].status, 'ok');
  });

  it('★ spec stage — validator 부재 = skipped', () => {
    const mockRun = (name) => {
      if (name === 'chain-coverage-validator') {
        return JSON.stringify({
          summary: { critical: 0, high: 0 },
          coverage: { uc_to_bhv: 1, bhv_to_ac: 1 },
        });
      }
      if (name === 'schema-validator') {
        return '  valid: 3  invalid: 0';
      }
      return null; // drift-validator / formal-spec-link-validator 부재
    };
    const findings = aggregateForStage('spec', '/tmp/poc', mockRun);
    assert.equal(findings.critical, 0);
    assert.equal(findings.coverage_pct, 1);
    assert.equal(findings.sources['drift-validator'].status, 'skipped');
    assert.equal(findings.sources['formal-spec-link-validator'].status, 'skipped');
  });

  it('★ critical accumulate (★ schema invalid + planning critical 합산)', () => {
    const mockRun = (name) => {
      if (name === 'planning-extraction-validator') {
        return JSON.stringify({ summary: { critical: 2, high: 0 } });
      }
      if (name === 'schema-validator') {
        return '  valid: 0  invalid: 3  skipped: 0';
      }
      return null;
    };
    const findings = aggregateForStage('planning', '/tmp/poc', mockRun);
    assert.equal(findings.critical, 5); // 2 + 3
  });

  it('★ ★ ★ parse fail = critical 증가 (★ 양심 의존 차단)', () => {
    const mockRun = (name) => {
      if (name === 'planning-extraction-validator') {
        return 'not valid json';
      }
      if (name === 'schema-validator') {
        return '  valid: 4  invalid: 0';
      }
      return null;
    };
    const findings = aggregateForStage('planning', '/tmp/poc', mockRun);
    assert.equal(findings.critical, 1); // ★ parse fail 1
    assert.equal(findings.sources['planning-extraction-validator'].status, 'error');
  });
});

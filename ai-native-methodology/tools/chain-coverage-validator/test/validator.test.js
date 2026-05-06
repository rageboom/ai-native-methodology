import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateChainCoverage } from '../src/validator.js';

const validPlanning = { use_cases: [{ id: 'UC-USER-001' }] };
const validBehavior = {
  behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }],
  cross_links: { to_analysis_artifacts: ['rules.json'] }
};
const validAcceptance = {
  criteria: [{
    id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', use_case_ref: 'UC-USER-001',
    verifiable: true, automated_runnable: true, test_case_refs: ['TC-USER-001']
  }]
};

describe('chain-coverage-validator', () => {
  it('passes for full chain', () => {
    const r = validateChainCoverage(validPlanning, validBehavior, validAcceptance);
    assert.equal(r.summary.critical, 0);
    assert.equal(r.summary.high, 0);
    assert.equal(r.coverage.uc_to_bhv, 1.0);
    assert.equal(r.coverage.bhv_to_ac, 1.0);
  });

  it('detects BHV unknown UC', () => {
    const behavior = {
      behaviors: [{ id: 'BHV-X-001', use_case_refs: ['UC-UNKNOWN-001'] }],
      cross_links: { to_analysis_artifacts: ['rules.json'] }
    };
    const r = validateChainCoverage(validPlanning, behavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.bhv.unknown_uc' && f.severity === 'critical'));
  });

  it('detects UC without BHV', () => {
    const planning = { use_cases: [{ id: 'UC-USER-001' }, { id: 'UC-USER-002' }] };
    const r = validateChainCoverage(planning, validBehavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.uc.no_bhv' && f.uc_id === 'UC-USER-002'));
  });

  it('detects verifiable AC without test_case_refs', () => {
    const acceptance = {
      criteria: [{
        id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', use_case_ref: 'UC-USER-001',
        verifiable: true, automated_runnable: true, test_case_refs: []
      }]
    };
    const r = validateChainCoverage(validPlanning, validBehavior, acceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.ac.verifiable_no_tc' && f.severity === 'high'));
  });

  it('detects empty cross_links', () => {
    const behavior = {
      behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }],
      cross_links: { to_analysis_artifacts: [] }
    };
    const r = validateChainCoverage(validPlanning, behavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.behavior.cross_links_empty'));
  });

  it('detects coverage below threshold', () => {
    const planning = { use_cases: [{ id: 'UC-A-001' }, { id: 'UC-B-001' }, { id: 'UC-C-001' }, { id: 'UC-D-001' }, { id: 'UC-E-001' }] };
    const r = validateChainCoverage(planning, validBehavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.uc_coverage.below_threshold'));
  });
});

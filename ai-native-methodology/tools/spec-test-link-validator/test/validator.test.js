import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSpecTestLink } from '../src/validator.js';

const validBehavior = { behaviors: [{ id: 'BHV-USER-001' }] };
const validAcceptance = {
  criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', verifiable: true, test_case_refs: ['TC-USER-001'] }]
};
const validTestSpec = {
  test_cases: [{
    id: 'TC-USER-001', ac_ref: 'AC-USER-001', bhv_ref: 'BHV-USER-001',
    type: 'integration', framework: 'jest'
  }]
};
const validInventory = { stack: { language: 'typescript', framework: 'nestjs' } };

describe('spec-test-link-validator', () => {
  it('passes for valid chain 2→3', () => {
    const r = validateSpecTestLink(validBehavior, validAcceptance, validTestSpec, validInventory);
    assert.equal(r.summary.critical, 0);
    assert.equal(r.summary.high, 0);
    assert.equal(r.coverage.ac_to_tc, 1.0);
  });

  it('detects TC unknown AC', () => {
    const ts = { test_cases: [{ id: 'TC-X-001', ac_ref: 'AC-UNKNOWN-001', framework: 'jest' }] };
    const r = validateSpecTestLink(validBehavior, validAcceptance, ts, validInventory);
    assert.ok(r.findings.some(f => f.kind === 'chain.tc.unknown_ac' && f.severity === 'critical'));
  });

  it('detects verifiable AC without TC', () => {
    const ac = { criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', verifiable: true, test_case_refs: [] }] };
    const ts = { test_cases: [] };
    const r = validateSpecTestLink(validBehavior, ac, ts, validInventory);
    assert.ok(r.findings.some(f => f.kind === 'chain.ac.no_tc' && f.severity === 'high'));
  });

  it('detects framework mismatch', () => {
    const ts = {
      test_cases: [{ id: 'TC-USER-001', ac_ref: 'AC-USER-001', bhv_ref: 'BHV-USER-001', framework: 'rspec' }]
    };
    const inv = { stack: { language: 'typescript', framework: 'nestjs' } };
    const r = validateSpecTestLink(validBehavior, validAcceptance, ts, inv);
    assert.ok(r.findings.some(f => f.kind === 'chain.tc.framework_mismatch'));
  });

  it('detects coverage below threshold', () => {
    const ac = {
      criteria: [
        { id: 'AC-USER-001', verifiable: true, test_case_refs: [], behavior_ref: 'BHV-USER-001' },
        { id: 'AC-USER-002', verifiable: true, test_case_refs: [], behavior_ref: 'BHV-USER-001' },
        { id: 'AC-USER-003', verifiable: true, test_case_refs: [], behavior_ref: 'BHV-USER-001' },
      ]
    };
    const r = validateSpecTestLink(validBehavior, ac, { test_cases: [] }, validInventory);
    assert.ok(r.findings.some(f => f.kind === 'chain.ac_coverage.below_threshold'));
  });
});

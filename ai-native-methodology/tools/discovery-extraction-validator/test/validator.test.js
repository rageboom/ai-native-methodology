import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateDiscoveryExtraction } from '../src/validator.js';

describe('discovery-extraction-validator', () => {
  it('passes for valid discovery-spec', () => {
    const discovery = {
      use_cases: [
        { id: 'UC-USER-001', source_grounded_evidence: ['src/user/UserService.java:30-60'] }
      ],
      business_rules_intent: [
        { br_id: 'BR-USER-EMAIL-001', reasoning: 'unique email', source_grounded_evidence: 'src/user/Validator.java:23' }
      ],
      cross_links: { to_analysis_artifacts: ['business-rules.json'] }
    };
    const analysis = {
      rules: { business_rules: [{ id: 'BR-USER-EMAIL-001' }] },
      domain: { use_cases: [{ id: 'UC-USER-001' }] }
    };
    const r = validateDiscoveryExtraction(discovery, analysis);
    assert.equal(r.summary.critical, 0);
    assert.equal(r.summary.high, 0);
    assert.equal(r.coverage.use_case, 1.0);
  });

  it('detects missing source_grounded_evidence', () => {
    const discovery = {
      use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: [] }],
      cross_links: { to_analysis_artifacts: ['business-rules.json'] }
    };
    const r = validateDiscoveryExtraction(discovery, {});
    assert.ok(r.findings.some(f => f.kind === 'discovery.source_grounded.missing'));
  });

  it('detects unknown BR-INTENT', () => {
    const discovery = {
      use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
      business_rules_intent: [
        { br_id: 'BR-UNKNOWN-001', reasoning: 'x', source_grounded_evidence: 'x' }
      ],
      cross_links: { to_analysis_artifacts: ['business-rules.json'] }
    };
    const analysis = { rules: { business_rules: [{ id: 'BR-USER-EMAIL-001' }] } };
    const r = validateDiscoveryExtraction(discovery, analysis);
    assert.ok(r.findings.some(f => f.kind === 'discovery.br_intent.unknown_br' && f.severity === 'critical'));
  });

  it('detects UC coverage below threshold', () => {
    const discovery = {
      use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
      cross_links: { to_analysis_artifacts: ['business-rules.json'] }
    };
    const analysis = {
      domain: { use_cases: [
        { id: 'UC-USER-001' }, { id: 'UC-USER-002' }, { id: 'UC-USER-003' },
        { id: 'UC-USER-004' }, { id: 'UC-USER-005' }
      ]}
    };
    const r = validateDiscoveryExtraction(discovery, analysis);
    assert.ok(r.findings.some(f => f.kind === 'discovery.uc_coverage.below_threshold'));
  });

  it('detects empty cross_links', () => {
    const discovery = {
      use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }]
    };
    const r = validateDiscoveryExtraction(discovery, {});
    assert.ok(r.findings.some(f => f.kind === 'discovery.cross_links.empty'));
  });
});

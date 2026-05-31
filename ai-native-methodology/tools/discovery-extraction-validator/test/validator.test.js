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

  // v11.5.1: multi-path BR lookup (LL-validator-dual-key-02 / additive backward-compat)
  describe('multi-path BR lookup (v11.5.1)', () => {
    it('matches BR from analysis.business_rules top-level array (poc-17 normalize)', () => {
      const discovery = {
        use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
        business_rules_intent: [
          { br_id: 'BR-CARLIST-RBAC-FILTER-001', reasoning: 'r', source_grounded_evidence: 'x' }
        ],
        cross_links: { to_analysis_artifacts: ['business-rules.json'] }
      };
      const analysis = {
        business_rules: [{ id: 'BR-CARLIST-RBAC-FILTER-001' }]
      };
      const r = validateDiscoveryExtraction(discovery, analysis);
      assert.ok(!r.findings.some(f => f.kind === 'discovery.br_intent.unknown_br'));
    });

    it('matches BR from analysis.rules top-level array (analysis baseline / suffix 없음)', () => {
      const discovery = {
        use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
        business_rules_intent: [
          { br_id: 'BR-RBAC-PRIORITY', reasoning: 'r', source_grounded_evidence: 'x' }
        ],
        cross_links: { to_analysis_artifacts: ['business-rules.json'] }
      };
      const analysis = {
        rules: [{ id: 'BR-RBAC-PRIORITY' }, { id: 'BR-RBAC-FN-3-BRANCH' }]
      };
      const r = validateDiscoveryExtraction(discovery, analysis);
      assert.ok(!r.findings.some(f => f.kind === 'discovery.br_intent.unknown_br'));
    });

    it('matches BR from analysis.rules_step_4c_carcost (dual key / poc-17 Phase 4c)', () => {
      const discovery = {
        use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
        business_rules_intent: [
          { br_id: 'BR-CARCOST-CALC', reasoning: 'r', source_grounded_evidence: 'x' }
        ],
        cross_links: { to_analysis_artifacts: ['business-rules.json'] }
      };
      const analysis = {
        rules_step_4c_carcost: [{ id: 'BR-CARCOST-CALC' }]
      };
      const r = validateDiscoveryExtraction(discovery, analysis);
      assert.ok(!r.findings.some(f => f.kind === 'discovery.br_intent.unknown_br'));
    });

    it('still detects unknown BR when not in any candidate path', () => {
      const discovery = {
        use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
        business_rules_intent: [
          { br_id: 'BR-NOT-PRESENT-001', reasoning: 'r', source_grounded_evidence: 'x' }
        ],
        cross_links: { to_analysis_artifacts: ['business-rules.json'] }
      };
      const analysis = {
        rules: [{ id: 'BR-OTHER' }],
        business_rules: [{ id: 'BR-OTHER-001' }]
      };
      const r = validateDiscoveryExtraction(discovery, analysis);
      assert.ok(r.findings.some(f => f.kind === 'discovery.br_intent.unknown_br' && f.severity === 'critical'));
    });
  });

  // v11.6.0: intent_certainty 구조 라벨 (F-DOGFOOD-003 / Option B / MyBatis+JPA arm ≥2 corroboration)
  describe('intent_certainty (v11.6.0 / F-DOGFOOD-003)', () => {
    const analysis = { business_rules: [{ id: 'BR-USER-EMAIL-001' }] };
    const baseDiscovery = (intent) => ({
      use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
      business_rules_intent: [intent],
      cross_links: { to_analysis_artifacts: ['business-rules.json'] }
    });

    it('WARNs (low) when intent_certainty is absent', () => {
      const r = validateDiscoveryExtraction(
        baseDiscovery({ br_id: 'BR-USER-EMAIL-001', reasoning: 'r', source_grounded_evidence: 'x' }),
        analysis
      );
      const f = r.findings.find(x => x.kind === 'discovery.br_intent.missing_intent_certainty');
      assert.ok(f, 'missing_intent_certainty finding present');
      assert.equal(f.severity, 'low', 'non-blocking WARN');
    });

    it('does NOT WARN when intent_certainty present (observed)', () => {
      const r = validateDiscoveryExtraction(
        baseDiscovery({ br_id: 'BR-USER-EMAIL-001', reasoning: 'r', source_grounded_evidence: 'x', intent_certainty: 'observed' }),
        analysis
      );
      assert.ok(!r.findings.some(x => x.kind === 'discovery.br_intent.missing_intent_certainty'));
    });

    it('accepts source-refuted (honest over-attribution flag)', () => {
      const r = validateDiscoveryExtraction(
        baseDiscovery({ br_id: 'BR-USER-EMAIL-001', reasoning: 'r', source_grounded_evidence: 'x', intent_certainty: 'source-refuted' }),
        analysis
      );
      assert.ok(!r.findings.some(x => x.kind === 'discovery.br_intent.missing_intent_certainty'));
      assert.equal(r.summary.critical, 0);
    });

    it('missing_intent_certainty stays non-blocking (no critical/high)', () => {
      const r = validateDiscoveryExtraction(
        baseDiscovery({ br_id: 'BR-USER-EMAIL-001', reasoning: 'r', source_grounded_evidence: 'x' }),
        analysis
      );
      assert.equal(r.summary.critical, 0);
      assert.equal(r.summary.high, 0);
    });
  });

  // v11.16.0: domain 비즈니스 컨텍스트 nudge (C-domain-schema-stakeholders)
  describe('domain business_context (v11.16.0 / C-domain-schema-stakeholders)', () => {
    const discovery = {
      use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
      cross_links: { to_analysis_artifacts: ['business-rules.json'] }
    };

    it('WARNs (low) when domain lacks stakeholders + business_intent_summary', () => {
      const r = validateDiscoveryExtraction(discovery, { domain: { use_cases: [{ id: 'UC-USER-001' }] } });
      const f = r.findings.find(x => x.kind === 'discovery.domain.missing_business_context');
      assert.ok(f, 'missing_business_context finding present');
      assert.equal(f.severity, 'low', 'non-blocking WARN');
      assert.deepEqual(f.missing.sort(), ['business_intent_summary', 'stakeholders']);
      assert.equal(r.summary.critical, 0);
      assert.equal(r.summary.high, 0);
    });

    it('does NOT WARN when both present', () => {
      const r = validateDiscoveryExtraction(discovery, {
        domain: { use_cases: [{ id: 'UC-USER-001' }], stakeholders: ['차량관리자'], business_intent_summary: '차량 자산 관리' }
      });
      assert.ok(!r.findings.some(x => x.kind === 'discovery.domain.missing_business_context'));
    });

    it('WARNs only for the missing field (partial)', () => {
      const r = validateDiscoveryExtraction(discovery, {
        domain: { stakeholders: ['회계담당자'] }
      });
      const f = r.findings.find(x => x.kind === 'discovery.domain.missing_business_context');
      assert.ok(f);
      assert.deepEqual(f.missing, ['business_intent_summary']);
    });

    it('does NOT WARN when domain not provided (discovery-only validation)', () => {
      const r = validateDiscoveryExtraction(discovery, {});
      assert.ok(!r.findings.some(x => x.kind === 'discovery.domain.missing_business_context'));
    });
  });
});

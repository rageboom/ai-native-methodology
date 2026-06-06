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

  // D4: decisions / pending_decisions 거버넌스 (INSPECTION-2026-05-31-discovery / SKILL §v8.7.5)
  describe('decisions governance (D4)', () => {
    const base = (extra) => ({
      use_cases: [{ id: 'UC-USER-001', source_grounded_evidence: ['x.java:1'] }],
      cross_links: { to_analysis_artifacts: ['business-rules.json'] },
      ...extra,
    });
    it('(a) AI-default without revisit_required=true → critical', () => {
      const r = validateDiscoveryExtraction(base({ decisions: [{ id: 'DEC-1', source: 'AI-default', revisit_required: false }] }), {});
      assert.ok(r.findings.some(f => f.kind === 'discovery.ai-default-revisit-flag-missing' && f.severity === 'critical'));
    });
    it('(a) AI-default WITH revisit_required=true → no finding', () => {
      const r = validateDiscoveryExtraction(base({ decisions: [{ id: 'DEC-1', source: 'AI-default', revisit_required: true }] }), {});
      assert.ok(!r.findings.some(f => f.kind === 'discovery.ai-default-revisit-flag-missing'));
    });
    it('user-explicit decision → no governance finding', () => {
      const r = validateDiscoveryExtraction(base({ decisions: [{ id: 'DEC-1', source: 'user-explicit', revisit_required: false }] }), {});
      assert.ok(!r.findings.some(f => f.kind.startsWith('discovery.ai-default') || f.kind.startsWith('discovery.carry')));
    });
    it('(b) pending_decisions non-empty → critical (gate stop)', () => {
      const r = validateDiscoveryExtraction(base({ pending_decisions: [{ id: 'PD-1', topic: 'x' }] }), {});
      assert.ok(r.findings.some(f => f.kind === 'discovery.pending-decisions-not-resolved' && f.severity === 'critical'));
    });
    it('(b) empty pending_decisions → no finding', () => {
      const r = validateDiscoveryExtraction(base({ pending_decisions: [] }), {});
      assert.ok(!r.findings.some(f => f.kind === 'discovery.pending-decisions-not-resolved'));
    });
    it('(c) carry decision without evidence path → high', () => {
      const r = validateDiscoveryExtraction(base({ decisions: [{ id: 'DEC-1', source: 'carry', rationale: '추후 결정' }] }), {});
      assert.ok(r.findings.some(f => f.kind === 'discovery.carry-decision-missing-evidence-path' && f.severity === 'high'));
    });
    it('(c) carry decision WITH evidence path in rationale → no finding', () => {
      const r = validateDiscoveryExtraction(base({ decisions: [{ id: 'DEC-1', source: 'carry', rationale: 'src/x.java:42 참조' }] }), {});
      assert.ok(!r.findings.some(f => f.kind === 'discovery.carry-decision-missing-evidence-path'));
    });
  });

  // D9: UC over/under-decomposition lane (INSPECTION-2026-05-31-discovery)
  describe('UC over/under-decomposition (D9)', () => {
    const mkUCs = (n) => Array.from({ length: n }, (_, i) => ({ id: `UC-X-${String(i + 1).padStart(3, '0')}`, source_grounded_evidence: ['x.java:1'] }));
    it('≥30 UC → over_decomposition (low / non-blocking)', () => {
      const r = validateDiscoveryExtraction({ use_cases: mkUCs(30), cross_links: { to_analysis_artifacts: ['x'] } }, {});
      const f = r.findings.find(x => x.kind === 'discovery.uc.over_decomposition');
      assert.ok(f);
      assert.equal(f.severity, 'low');
      assert.equal(r.summary.critical, 0);
    });
    it('<30 UC → no over_decomposition', () => {
      const r = validateDiscoveryExtraction({ use_cases: mkUCs(5), cross_links: { to_analysis_artifacts: ['x'] } }, {});
      assert.ok(!r.findings.some(x => x.kind === 'discovery.uc.over_decomposition'));
    });
    it('UC/entity < 1.5 → under_decomposition (low)', () => {
      const r = validateDiscoveryExtraction(
        { use_cases: mkUCs(1), cross_links: { to_analysis_artifacts: ['x'] } },
        { domain: { entities: [{ name: 'A' }, { name: 'B' }] } }
      );
      const f = r.findings.find(x => x.kind === 'discovery.uc.under_decomposition');
      assert.ok(f);
      assert.equal(f.severity, 'low');
    });
    it('no entities provided → no under_decomposition', () => {
      const r = validateDiscoveryExtraction({ use_cases: mkUCs(1), cross_links: { to_analysis_artifacts: ['x'] } }, {});
      assert.ok(!r.findings.some(x => x.kind === 'discovery.uc.under_decomposition'));
    });
  });

  // D10: summary medium/low 집계 (sibling validator 정합)
  describe('summary medium/low aggregation (D10)', () => {
    it('summary includes medium + low counts', () => {
      const r = validateDiscoveryExtraction({ use_cases: [{ id: 'UC-X-001', source_grounded_evidence: ['x.java:1'] }] }, {});
      assert.equal(typeof r.summary.medium, 'number');
      assert.equal(typeof r.summary.low, 'number');
      assert.ok(r.summary.medium >= 1, 'cross_links.empty (medium) counted in summary');
    });
  });

  // F1 fix (poc-18 dogfood): domain.schema 는 use_cases/entities 를 bounded_contexts[] 아래 중첩.
  //   이전엔 top-level analysis.domain.use_cases 만 읽어 schema-conformant domain.json 에서 coverage 가 silent skip(vacuous pass) 됐음.
  describe('F1 — nested bounded_contexts use_cases coverage (dogfood)', () => {
    const mkDiscoveryUC = (ids) => ids.map((id) => ({ id, source_grounded_evidence: [`src/${id}.ts:1`] }));
    const nestedDomain = { domain: { bounded_contexts: [{ id: 'BC-CONTENT', use_cases: [{ id: 'UC-POST-001' }, { id: 'UC-POST-002' }] }] } };
    it('computes UC coverage from bounded_contexts[].use_cases (was silently skipped)', () => {
      const discovery = { use_cases: mkDiscoveryUC(['UC-POST-001']), business_rules_intent: [], cross_links: { to_analysis_artifacts: ['x'] } };
      const r = validateDiscoveryExtraction(discovery, nestedDomain);
      assert.equal(r.coverage.use_case, 0.5, 'nested UC set (2) vs discovery (1) = 0.5 — no longer vacuous 1.0');
      assert.ok(
        r.findings.some((x) => x.kind === 'discovery.uc_coverage.below_threshold'),
        'below-0.80 nested coverage now blocks (was fail-OPEN)'
      );
    });
    it('full nested coverage passes (no uc_coverage finding)', () => {
      const discovery = { use_cases: mkDiscoveryUC(['UC-POST-001', 'UC-POST-002']), business_rules_intent: [], cross_links: { to_analysis_artifacts: ['x'] } };
      const r = validateDiscoveryExtraction(discovery, nestedDomain);
      assert.equal(r.coverage.use_case, 1.0);
      assert.ok(!r.findings.some((x) => x.kind === 'discovery.uc_coverage.below_threshold'));
    });
    it('under_decomposition fires for nested entities (UC/entity < 1.5)', () => {
      const discovery = { use_cases: mkDiscoveryUC(['UC-POST-001']), cross_links: { to_analysis_artifacts: ['x'] } };
      const domain = { domain: { bounded_contexts: [{ id: 'BC-CONTENT', entities: [{ name: 'Post' }, { name: 'Comment' }] }] } };
      const r = validateDiscoveryExtraction(discovery, domain);
      assert.ok(r.findings.some((x) => x.kind === 'discovery.uc.under_decomposition'), 'nested entities now counted');
    });
  });
});

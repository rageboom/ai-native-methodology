import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildMatrix, renderMarkdown, renderMermaid, deriveCellSeverity } from '../src/builder.js';

const fullChain = {
  planning: { use_cases: [{ id: 'UC-USER-001' }] },
  behavior: { behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }] },
  acceptance: { criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', verifiable: true, severity: 'must' }] },
  testSpec: { test_cases: [{ id: 'TC-USER-001', ac_ref: 'AC-USER-001', bhv_ref: 'BHV-USER-001' }] },
  implSpec: { modules: [{ id: 'IMPL-USER-001', tc_refs: ['TC-USER-001'], bhv_refs: ['BHV-USER-001'], commit_hash: 'abc1234567890123456789012345678901234567' }] }
};

describe('traceability-matrix-builder', () => {
  it('builds full green matrix', () => {
    const m = buildMatrix(fullChain);
    assert.equal(m.matrix.length, 1);
    assert.equal(m.matrix[0].status, 'green');
    assert.equal(m.coverage_summary.green_count, 1);
    assert.equal(m.coverage_summary.forward_coverage, 1.0);
    assert.equal(m.do_not_edit_manually, true);
    assert.ok(m.derived_from.includes('impl-spec.json'));
  });

  it('marks yellow when impl missing', () => {
    const chain = { ...fullChain, implSpec: { modules: [] } };
    const m = buildMatrix(chain);
    assert.equal(m.matrix[0].status, 'yellow');
    assert.equal(m.coverage_summary.green_count, 0);
    assert.equal(m.coverage_summary.yellow_count, 1);
  });

  it('marks red when AC missing', () => {
    const chain = { ...fullChain, acceptance: { criteria: [] } };
    const m = buildMatrix(chain);
    assert.equal(m.matrix[0].status, 'red');
  });

  it('renders markdown table with BR column (F-SIM-004)', () => {
    const m = buildMatrix(fullChain);
    const md = renderMarkdown(m);
    assert.ok(md.includes('UC-USER-001'));
    assert.ok(md.includes('🟢'));
    assert.ok(md.includes('do_not_edit_manually'));
    // ★ F-SIM-004 — BR 컬럼 header
    assert.ok(md.includes('| UC | BR | BHV | AC |'), 'BR column header must be present');
  });

  it('renders mermaid graph', () => {
    const m = buildMatrix(fullChain);
    const mm = renderMermaid(m);
    assert.ok(mm.includes('graph LR'));
    assert.ok(mm.includes('UC-USER-001 --> BHV-USER-001'));
    assert.ok(mm.includes('IMPL-USER-001'));
  });

  it('respects severity_floor in coverage_summary', () => {
    const m = buildMatrix(fullChain);
    assert.equal(m.coverage_summary.severity_floor.critical, 1.0);
    assert.equal(m.coverage_summary.severity_floor.high, 0.95);
  });

  // ★ v9.2.0 (DEC-2026-05-25-axis-a-phase-4-3) — TASK layer (chain 3 plan) additive
  describe('TASK layer (chain 3 plan / DEC-2026-05-25-axis-a-phase-4-3)', () => {
    it('★ v9.2.0: backward compat — taskPlan 부재 시 cell.task_id 부재 (회귀 0)', () => {
      const m = buildMatrix(fullChain);
      assert.equal(m.matrix[0].task_id, undefined);
      assert.equal(m.do_not_edit_manually, true);
    });

    it('★ v9.2.0: taskPlan 입력 시 cell.task_id 채움 (AC→TASK→TC paradigm 정합)', () => {
      const chain = {
        ...fullChain,
        taskPlan: {
          tasks: [
            { id: 'TASK-USER-001', ac_refs: ['AC-USER-001'], behavior_ref: 'BHV-USER-001', execution_order: 1 }
          ]
        }
      };
      const m = buildMatrix(chain);
      assert.equal(m.matrix[0].task_id, 'TASK-USER-001');
      assert.ok(m.derived_from.includes('task-plan.json'));
    });

    it('★ v9.2.0: taskPlan 입력 + yellow cell (impl missing) 시 task_id 채움 (★ Senior risk #4 / additive only / 기존 ratchet 분모 미영향)', () => {
      const chain = {
        ...fullChain,
        implSpec: { modules: [] },
        taskPlan: {
          tasks: [{ id: 'TASK-USER-001', ac_refs: ['AC-USER-001'], behavior_ref: 'BHV-USER-001', execution_order: 1 }]
        }
      };
      const m = buildMatrix(chain);
      assert.equal(m.matrix[0].status, 'yellow');
      assert.equal(m.matrix[0].task_id, 'TASK-USER-001');
    });
  });

  // ★ F-SIM-002 — severity max-propagation tests
  describe('F-SIM-002 severity max-propagation', () => {
    it('preserves backwards compat: empty BR/AP → AC.MoSCoW only (must=critical)', () => {
      const m = buildMatrix(fullChain);
      assert.equal(m.matrix[0].severity, 'critical'); // MoSCoW must → critical (legacy behavior preserved)
      assert.equal(m.coverage_summary.severity_propagation_active, false);
    });

    it('propagates BR.severity = high (above AC.MoSCoW=should=medium) → cell.severity=high', () => {
      const chain = {
        ...fullChain,
        behavior: { behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'], br_refs: ['BR-USER-DATA-001'] }] },
        acceptance: { criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', verifiable: true, severity: 'should' }] },
        businessRules: { business_rules: [{ id: 'BR-USER-DATA-001', severity: 'high' }] }
      };
      const m = buildMatrix(chain);
      // MoSCoW should → medium / BR high → max = high
      assert.equal(m.matrix[0].severity, 'high');
      assert.deepEqual(m.matrix[0].business_rule_ids, ['BR-USER-DATA-001']);
      assert.equal(m.coverage_summary.severity_propagation_active, true);
    });

    it('propagates AP.severity = critical (above AC=should + BR=low) → cell.severity=critical', () => {
      const chain = {
        ...fullChain,
        acceptance: { criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', verifiable: true, severity: 'should', related_aps: ['AP-USER-003'] }] },
        antipatterns: { antipatterns: [{ id: 'AP-USER-003', severity: 'critical' }] }
      };
      const m = buildMatrix(chain);
      assert.equal(m.matrix[0].severity, 'critical');
      assert.deepEqual(m.matrix[0].antipattern_ids, ['AP-USER-003']);
    });

    it('info BR severity is normalized to low (matrix 4-tier)', () => {
      const sev = deriveCellSeverity({ ac: { severity: 'nice' }, brs: [{ severity: 'info' }] });
      assert.equal(sev, 'low');
    });

    it('severity_distinct_count audit signal — multi-axis variation surfaces > 1', () => {
      const chain = {
        planning: { use_cases: [{ id: 'UC-USER-001' }, { id: 'UC-USER-002' }] },
        behavior: { behaviors: [
          { id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'], br_refs: ['BR-X'] },
          { id: 'BHV-USER-002', use_case_refs: ['UC-USER-002'] }
        ]},
        acceptance: { criteria: [
          { id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', verifiable: true, severity: 'must' },
          { id: 'AC-USER-002', behavior_ref: 'BHV-USER-002', verifiable: true, severity: 'nice' }
        ]},
        testSpec: { test_cases: [
          { id: 'TC-USER-001', ac_ref: 'AC-USER-001' },
          { id: 'TC-USER-002', ac_ref: 'AC-USER-002' }
        ]},
        implSpec: { modules: [
          { id: 'IMPL-USER-001', tc_refs: ['TC-USER-001'] },
          { id: 'IMPL-USER-002', tc_refs: ['TC-USER-002'] }
        ]},
        businessRules: { business_rules: [{ id: 'BR-X', severity: 'medium' }] }
      };
      const m = buildMatrix(chain);
      assert.ok(m.coverage_summary.severity_distinct_count >= 2, `expected severity diversity, got ${m.coverage_summary.severity_distinct_count}`);
    });
  });

  // ★ F-SIM-004 — BR axis tests
  describe('F-SIM-004 BR axis (DO-178C requirements 1급 축)', () => {
    it('cell exposes business_rule_ids[] from BHV.br_refs', () => {
      const chain = {
        ...fullChain,
        behavior: { behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'], br_refs: ['BR-USER-DATA-001', 'BR-USER-VALIDATION-001'] }] }
      };
      const m = buildMatrix(chain);
      assert.deepEqual(m.matrix[0].business_rule_ids.sort(), ['BR-USER-DATA-001', 'BR-USER-VALIDATION-001']);
    });

    it('cell.business_rule_ids = BHV.br_refs ∪ AC.related_brs (set union)', () => {
      const chain = {
        ...fullChain,
        behavior: { behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'], br_refs: ['BR-A'] }] },
        acceptance: { criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', verifiable: true, severity: 'must', related_brs: ['BR-A', 'BR-B'] }] }
      };
      const m = buildMatrix(chain);
      assert.deepEqual(m.matrix[0].business_rule_ids.sort(), ['BR-A', 'BR-B']);
    });

    it('mermaid renders BR --> BHV edge', () => {
      const chain = {
        ...fullChain,
        behavior: { behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'], br_refs: ['BR-USER-DATA-001'] }] }
      };
      const m = buildMatrix(chain);
      const mm = renderMermaid(m);
      assert.ok(mm.includes('BR-USER-DATA-001 --> BHV-USER-001'), 'BR axis must appear in mermaid graph');
    });
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildMatrix, renderMarkdown, renderMermaid } from '../src/builder.js';

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

  it('renders markdown table', () => {
    const m = buildMatrix(fullChain);
    const md = renderMarkdown(m);
    assert.ok(md.includes('UC-USER-001'));
    assert.ok(md.includes('🟢'));
    assert.ok(md.includes('do_not_edit_manually'));
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
});

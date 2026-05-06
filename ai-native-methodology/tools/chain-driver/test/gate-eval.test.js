import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateGate, applyUserDecision, requiredValidators,
} from '../src/gate-eval.js';

describe('gate-eval', () => {
  it('clean findings → not blocked', () => {
    const r = evaluateGate('spec', { critical: 0, high: 0, medium: 0 });
    assert.equal(r.blocked, false);
  });

  it('critical finding → blocked with validator_critical reason', () => {
    const r = evaluateGate('spec', { critical: 1, high: 0 });
    assert.equal(r.blocked, true);
    assert.equal(r.primary_reason, 'validator_critical');
  });

  it('coverage below threshold → blocked', () => {
    const r = evaluateGate('spec', { critical: 0, high: 0, coverage_pct: 0.7, coverage_threshold: 0.85 });
    assert.equal(r.blocked, true);
    assert.equal(r.primary_reason, 'coverage_threshold');
  });

  it('evidence_missing → blocked with evidence_missing', () => {
    const r = evaluateGate('test', { critical: 0, high: 0, evidence_missing: ['stdout_path'] });
    assert.equal(r.blocked, true);
    assert.equal(r.primary_reason, 'evidence_missing');
  });

  it('chain test stage with all_pass → blocked (RED proof missing)', () => {
    const r = evaluateGate('test', { critical: 0, high: 0, tests_total: 100, tests_failed: 0 });
    assert.equal(r.blocked, true);
    assert.match(r.reasons[0].detail, /RED/);
  });

  it('chain implement stage with failing tests → blocked (GREEN missing)', () => {
    const r = evaluateGate('implement', { critical: 0, high: 0, tests_total: 100, tests_failed: 5 });
    assert.equal(r.blocked, true);
    assert.match(r.reasons[0].detail, /GREEN/);
  });

  it('user go on critical → still blocked (Auto Mode override rejected)', () => {
    const gateResult = evaluateGate('spec', { critical: 2 });
    const final = applyUserDecision(gateResult, 'go');
    assert.equal(final.blocked, true);
    assert.equal(final.user_override_rejected, true);
  });

  it('user go on medium-only → unblocked with warnings', () => {
    const gateResult = evaluateGate('spec', { critical: 0, high: 0, medium: 3 });
    // medium alone → not blocked at gate-eval level
    assert.equal(gateResult.blocked, false);
    const final = applyUserDecision(gateResult, 'go');
    assert.equal(final.blocked, false);
  });

  it('user stop → blocked decision=stop', () => {
    const gateResult = evaluateGate('planning', { critical: 0, high: 0 });
    const final = applyUserDecision(gateResult, 'stop');
    assert.equal(final.blocked, true);
    assert.equal(final.decision, 'stop');
  });

  it('requiredValidators returns canonical list per stage', () => {
    assert.ok(requiredValidators('planning').includes('planning-extraction-validator'));
    assert.ok(requiredValidators('test').includes('test-impl-pass-validator'));
    assert.deepEqual(requiredValidators('unknown'), []);
  });
});

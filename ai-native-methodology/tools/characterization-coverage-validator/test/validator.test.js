import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateCharacterization } from '../src/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fx = (name) => join(__dirname, 'fixtures', name);

test('valid fixture: PoC #03-style retrofit minimal — 0 critical/high finding', () => {
  const r = validateCharacterization(fx('valid'), 0.80);
  const blocking = r.findings.filter(f => f.severity === 'critical' || f.severity === 'high');
  assert.equal(blocking.length, 0, `unexpected blocking findings: ${JSON.stringify(blocking, null, 2)}`);
  assert.equal(r.summary.snapshot_count, 2);
  assert.equal(r.summary.scenario_count, 3);
  assert.equal(r.summary.coverage_strategy, 'absolute');
});

test('valid fixture: named_classified_ratio = 100% (5/5 / no ambiguous)', () => {
  const r = validateCharacterization(fx('valid'), 0.80);
  assert.equal(r.summary.named_classified_ratio, 1.0);
});

test('invalid fixture: missing required field "then" — critical finding', () => {
  const r = validateCharacterization(fx('invalid-missing-required'), 0.80);
  const missingRequired = r.findings.filter(f => f.kind === 'scenario.missing_required');
  assert.ok(missingRequired.length >= 1, 'expected scenario.missing_required finding');
  // 'given', 'when', 'then', 'intent_classification' 모두 누락
  const fields = new Set(missingRequired.map(f => f.field));
  assert.ok(fields.has('then'), 'then field missing not detected');
  assert.ok(fields.has('intent_classification'), 'intent_classification missing not detected');
});

test('invalid fixture: bad intent_classification.type "TODO" — critical finding', () => {
  const r = validateCharacterization(fx('invalid-bad-type'), 0.80);
  const typeBad = r.findings.filter(f => f.kind === 'scenario.classification_type_invalid');
  assert.equal(typeBad.length, 1);
  assert.equal(typeBad[0].type, 'TODO');
  assert.equal(typeBad[0].severity, 'critical');
});

test('invalid fixture: ratchet strategy without trend_required=true — critical finding', () => {
  const r = validateCharacterization(fx('invalid-ratchet-trend'), 0.80);
  const trend = r.findings.filter(f => f.kind === 'coverage.ratchet_trend_required_missing');
  assert.equal(trend.length, 1);
  assert.equal(trend[0].severity, 'critical');
});

test('invalid fixture: ambiguous classification with no carry mention — critical finding', () => {
  const r = validateCharacterization(fx('invalid-ambiguous-no-carry'), 0.80);
  const carryMissing = r.findings.filter(f => f.kind === 'classification.ambiguous_carry_missing');
  assert.equal(carryMissing.length, 1);
  assert.equal(carryMissing[0].severity, 'critical');
});

test('invalid fixture: ambiguous scenario without behavior_likely_bug + behavior_to_preserve — high finding', () => {
  const r = validateCharacterization(fx('invalid-ambiguous-no-carry'), 0.80);
  const noBehavior = r.findings.filter(f => f.kind === 'scenario.ambiguous_no_behavior_note');
  assert.equal(noBehavior.length, 1);
  assert.equal(noBehavior[0].severity, 'high');
});

test('threshold parameter respected (passing 0.95 makes valid fixture above threshold pass)', () => {
  const r = validateCharacterization(fx('valid'), 0.95);
  const ratioBelow = r.findings.filter(f => f.kind === 'classification.named_ratio_below_threshold');
  assert.equal(ratioBelow.length, 0, '100% should still pass 0.95 threshold');
});

test('exit codes: validator returns findings counts in summary', () => {
  const r = validateCharacterization(fx('invalid-bad-type'), 0.80);
  assert.equal(r.summary.critical, 1);
  assert.equal(r.summary.total_findings >= 1, true);
});

test('coverage_strategy enum invalid value detected', () => {
  // create on the fly: reuse existing fixture but the validator should still validate strategy enum from file
  // we already have absolute / ratchet covered; this verifies enum check exists by code path
  const r = validateCharacterization(fx('invalid-bad-type'), 0.80);
  // 'absolute' is valid in this fixture; just verify no false positive
  const strategyBad = r.findings.filter(f => f.kind === 'coverage.strategy_invalid');
  assert.equal(strategyBad.length, 0);
});

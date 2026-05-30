import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNaAntipatterns, buildMigrationCautionsMd } from '../src/na-artifacts.js';

const FIXED = '2026-05-30T00:00:00.000Z';

test('antipatterns N/A — top-level keys exactly meta + antipatterns (schema additionalProperties:false 정합)', () => {
  const ap = buildNaAntipatterns({ generatedAt: FIXED });
  assert.deepEqual(Object.keys(ap).sort(), ['antipatterns', 'meta']);
  assert.deepEqual(ap.antipatterns, []);
});

test('antipatterns N/A — meta has required meta-confidence fields', () => {
  const ap = buildNaAntipatterns({ generatedAt: FIXED });
  // meta-confidence.schema.json required: generated_at, confidence, inputs_used
  assert.equal(ap.meta.generated_at, FIXED);
  assert.equal(typeof ap.meta.confidence, 'number');
  assert.ok(ap.meta.confidence <= 0.98);
  assert.ok(Array.isArray(ap.meta.inputs_used) && ap.meta.inputs_used.length >= 1);
});

test('antipatterns N/A — na_reason embedded in meta (not top-level)', () => {
  const ap = buildNaAntipatterns({ generatedAt: FIXED });
  assert.match(ap.meta.na_reason, /greenfield/);
  assert.equal(ap.meta.scenario, 'greenfield');
  assert.equal(ap.na_reason, undefined); // must NOT be top-level (would break additionalProperties:false)
  assert.equal(ap.code_pointers_na, undefined);
});

test('inputs_used maps channel → meta-confidence enum value', () => {
  assert.deepEqual(buildNaAntipatterns({ channel: 'swagger', generatedAt: FIXED }).meta.inputs_used, ['design_specs']);
  assert.deepEqual(buildNaAntipatterns({ channel: 'plan-doc', generatedAt: FIXED }).meta.inputs_used, ['planning_docs']);
  assert.deepEqual(buildNaAntipatterns({ channel: 'prompt', generatedAt: FIXED }).meta.inputs_used, ['documentation']);
  assert.deepEqual(buildNaAntipatterns({ channel: 'unknown-x', generatedAt: FIXED }).meta.inputs_used, ['design_specs']);
});

test('migration-cautions.md stub — greenfield N/A markdown', () => {
  const md = buildMigrationCautionsMd({ scope: 'myapp', channel: 'swagger' });
  assert.match(md, /# Migration Cautions — N\/A \(greenfield\)/);
  assert.match(md, /legacy 전용/);
  assert.match(md, /myapp/);
  assert.match(md, /S2\(AX전환\)/);
});

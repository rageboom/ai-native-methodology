// sql-inventory-extractor unit tests (★ workspace 14번째 / 10 tests)

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSqlInventory } from '../src/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIX = join(__dirname, 'fixtures');

test('valid PoC #06 — no critical/high finding', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
  assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.inventory_count, 6);
});

test('valid PoC #07 — scale-cross corroboration / no critical/high finding', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-07'));
  assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.inventory_count, 15);
});

test('valid PoC #06 — auto_ratio_external_6 detected', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
  assert.equal(r.summary.auto_ratio_external_6, 0.667);
});

test('valid PoC #06 vs #07 — auto_ratio identical (★ scale-cross isomorphic)', () => {
  const r6 = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
  const r7 = validateSqlInventory(join(FIX, 'valid', 'poc-07'));
  assert.equal(r6.summary.auto_ratio_external_6, r7.summary.auto_ratio_external_6,
    'PoC #06+#07 양쪽 4/6=66.7% 동일 입증 의무');
});

test('invalid — entry_missing critical finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', '__nonexistent__'));
  assert.ok(r.findings.some(f => f.kind === 'inventory.entry_missing' && f.severity === 'critical'));
});

test('invalid — missing required field (sql_id) critical finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', 'missing-required'));
  assert.ok(r.findings.some(f => f.kind === 'record.missing_required_field' && f.message.includes('sql_id')));
});

test('invalid — statement_type enum (BATCH) violation critical finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', 'bad-statement-type'));
  assert.ok(r.findings.some(f => f.kind === 'record.statement_type_invalid' && f.severity === 'critical'));
});

test('invalid — carry_flag enum (random-flag) violation critical finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', 'bad-carry-flag'));
  assert.ok(r.findings.some(f => f.kind === 'record.carry_flag_invalid' && f.severity === 'critical'));
});

test('invalid — external_call_out_of_scope + confidence > 0.80 → if/then high finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', 'high-confidence-external-call'));
  assert.ok(r.findings.some(f => f.kind === 'record.high_confidence_with_external_call' && f.severity === 'high'));
});

test('invalid — intent_vs_bug_classification 4 분류 키워드 부재 → high finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', 'intent-no-keyword'));
  assert.ok(r.findings.some(f => f.kind === 'record.intent_vs_bug_no_keyword' && f.severity === 'high'));
});

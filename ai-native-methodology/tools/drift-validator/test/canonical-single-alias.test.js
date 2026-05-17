// ★ ★ ★ v5.0.0 신설 — 묶음 Q ① alias 4중첩 폐기 / canonical 단일 구조 test.
// DEC-2026-05-17-q1-alias-4중첩-폐기 + ADR-CHAIN-011 patch 정합.
// v4.0.1 cross-schema-enum / v4.1.0 cross-consistency-check 패턴 미러 (재유입 방지 guard).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = resolve(__dirname, '../../../schemas');
const rulesSchema = JSON.parse(readFileSync(resolve(SCHEMAS_DIR, 'rules.schema.json'), 'utf-8'));

const KILLED_ALIASES = ['rules', 'rules_manual_authored', 'rule_summary', 'rules_summary', 'br_summary'];

test('rules.schema.json — 폐기 alias property 재유입 0 (hard kill guard)', () => {
  for (const k of KILLED_ALIASES) {
    assert.equal(
      k in rulesSchema.properties,
      false,
      `★ v5.0.0 폐기 alias '${k}' = properties 재유입 ❌ (묶음 Q ①)`,
    );
  }
});

test('rules.schema.json — business_rules 단일 canonical + required', () => {
  assert.ok(rulesSchema.properties.business_rules, 'business_rules canonical 존재');
  assert.deepEqual(rulesSchema.required, ['business_rules'], '★ top-level required = [business_rules] 단일');
  // anyOf 다중 alias 분기 폐기 (단일 canonical = required 로 대체)
  assert.equal(rulesSchema.anyOf, undefined, 'top-level anyOf alias 분기 폐기 (required 단일화)');
});

test('rules.schema.json — summary 단일 canonical (summary alias 3종 폐기)', () => {
  assert.ok(rulesSchema.properties.summary, 'summary canonical 존재');
  for (const k of ['br_summary', 'rule_summary', 'rules_summary']) {
    assert.equal(k in rulesSchema.properties, false, `summary alias '${k}' 폐기`);
  }
});

test('rules.schema.json — rules_auto_extracted_reference 보존 (① scope 외 / 별도 carry)', () => {
  // ★ Senior Q1 — BR-list alias 아님 (provenance pointer) → ① 폐기 대상 ❌ / 보존 의무
  assert.ok(
    rulesSchema.properties.rules_auto_extracted_reference,
    '★ rules_auto_extracted_reference = ① scope 외 보존 (Q-①-followup carry)',
  );
});

test('rules.schema.json — additionalProperties:false (폐기 alias 문서 reject 보장)', () => {
  assert.equal(rulesSchema.additionalProperties, false, '★ additionalProperties:false = 폐기 alias 보유 문서 hard reject');
});

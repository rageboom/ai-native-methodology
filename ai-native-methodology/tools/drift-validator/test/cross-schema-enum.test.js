// ★ ★ ★ v4.0.1 신설 — cross-schema enum SSOT 정합 test.
// DEC-2026-05-17-rules-schema-enforcement-strengthen + ADR-CHAIN-011 §5 patch v4 정합.
// intent-classification.schema.json = 단일 SSOT / rules + characterization-spec 양쪽 $ref 의무.
// Senior REVISE 흡수 — SSOT 위반 risk 차단 (duplicate enum 재선언 시 fail).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCHEMAS_DIR = resolve(__dirname, '../../../schemas');

const INTENT_ENUM_EXPECTED = ['intent', 'bug', 'ambiguous', 'self_recognized'];

function readSchema(filename) {
  return JSON.parse(readFileSync(resolve(SCHEMAS_DIR, filename), 'utf-8'));
}

test('intent-classification.schema.json — SSOT 파일 존재 + enum 4종', () => {
  const schema = readSchema('intent-classification.schema.json');
  assert.equal(schema.type, 'string');
  assert.deepEqual(schema.enum, INTENT_ENUM_EXPECTED);
  assert.ok(schema.$id.includes('intent-classification.schema.json'));
});

test('rules.schema.json — intent_vs_bug_classification $ref SSOT', () => {
  const schema = readSchema('rules.schema.json');
  const field = schema.$defs.businessRule.properties.intent_vs_bug_classification;
  assert.ok(field, 'intent_vs_bug_classification 필드 존재');
  assert.equal(field.$ref, './intent-classification.schema.json', '$ref SSOT 의무');
  // ★ inline enum 재선언 ❌ — SSOT 위반 차단
  assert.ok(!field.enum, 'inline enum 재선언 ❌ (SSOT 위반)');
});

test('characterization-spec.schema.json — intent_classification.type $ref SSOT', () => {
  const schema = readSchema('characterization-spec.schema.json');
  const intentItem = schema.$defs.scenario.properties.intent_classification.items;
  const typeField = intentItem.properties.type;
  assert.ok(typeField, 'intent_classification.items.type 필드 존재');
  assert.equal(typeField.$ref, './intent-classification.schema.json', '$ref SSOT 의무');
  // ★ inline enum 재선언 ❌ — SSOT 위반 차단 (★ ★ v4.0.1 housekeeping H-2 흡수 / 직전 inline enum 폐기)
  assert.ok(!typeField.enum, 'inline enum 재선언 ❌ (SSOT 위반)');
});

test('cross-schema enum 정합 — 두 schema 모두 동일 SSOT $ref', () => {
  const rulesSchema = readSchema('rules.schema.json');
  const charSchema = readSchema('characterization-spec.schema.json');

  const rulesRef = rulesSchema.$defs.businessRule.properties.intent_vs_bug_classification.$ref;
  const charRef = charSchema.$defs.scenario.properties.intent_classification.items.properties.type.$ref;

  assert.equal(rulesRef, charRef, '★ ★ ★ 두 schema 모두 동일 SSOT $ref 사용 의무 (cross-schema enum 정합 paradigm)');
});

test('source-grounded enforcement — rules.schema.json businessRule.allOf if/then required (auto_extracted=true)', () => {
  // ★ v4.0.1 ③ 정합 — auto_extracted=true 시 source_grounded_evidence 또는 source_evidence 의무
  const schema = readSchema('rules.schema.json');
  const allOf = schema.$defs.businessRule.allOf;
  assert.ok(Array.isArray(allOf), 'businessRule.allOf 배열 존재');

  // if/then 블록 (auto_extracted=true 한정 source 의무) 검출
  const sourceEnforcementBlock = allOf.find(
    (b) => b.if && b.if.properties && b.if.properties.auto_extracted && b.if.properties.auto_extracted.const === true,
  );
  assert.ok(sourceEnforcementBlock, '★ auto_extracted=true 한정 if/then 블록 존재 의무');
  assert.ok(sourceEnforcementBlock.then, 'then 블록 존재');
  assert.ok(sourceEnforcementBlock.then.anyOf, 'then.anyOf 분기 (source_grounded_evidence | source_evidence)');
});

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

test('rules.schema.json — v6.1.0 Q-①-followup: auto_extracted_br_refs rename 완료 + 구명 재유입 0', () => {
  // ★ ★ v6.1.0 Q-①-followup — rules_auto_extracted_reference → auto_extracted_br_refs semantic-rename.
  //   ① scope 외였던 provenance pointer (BR-list alias 아님 / src consumer 0 / poc-04 atomic 마이그레이션 = MINOR).
  assert.ok(
    rulesSchema.properties.auto_extracted_br_refs,
    '★ v6.1.0 — auto_extracted_br_refs canonical 존재 (rename 완료)',
  );
  assert.equal(
    'rules_auto_extracted_reference' in rulesSchema.properties,
    false,
    '★ v6.1.0 — 구명 rules_auto_extracted_reference 재유입 ❌ (additionalProperties:false hard reject)',
  );
});

test('rules.schema.json — additionalProperties:false (폐기 alias 문서 reject 보장)', () => {
  assert.equal(rulesSchema.additionalProperties, false, '★ additionalProperties:false = 폐기 alias 보유 문서 hard reject');
});

// ★ ★ ★ ★ ★ v6.0.0 신설 — 묶음 Q ② BR 표현 4종 → 2종 단일화 / canonical 표현 guard.
// DEC-2026-05-17-q2-br-표현-4to2 + ADR-CHAIN-011 §5 patch v14 정합 (재유입 방지 guard / ① 동형).

const businessRule = rulesSchema.$defs.businessRule;
const reprAnyOf = businessRule.allOf.find((el) => Array.isArray(el.anyOf)).anyOf;

test('rules.schema.json — BR 표현 anyOf = 정확히 2 branch (GWT + natural_language ONLY)', () => {
  assert.equal(reprAnyOf.length, 2, '★ v6.0.0 묶음 Q ② — 표현 anyOf 2종 단일 (4→2)');
  const requiredSets = reprAnyOf.map((b) => JSON.stringify([...b.required].sort()));
  assert.ok(
    requiredSets.includes(JSON.stringify(['given', 'then', 'when'].sort())),
    '★ GWT branch (given/when/then) 잔존',
  );
  assert.ok(
    requiredSets.includes(JSON.stringify(['natural_language'])),
    '★ natural_language branch 잔존',
  );
});

test('rules.schema.json — description / TCA 표현 branch 재유입 0 (hard kill guard / ② 표현 자격 박탈)', () => {
  for (const b of reprAnyOf) {
    const req = b.required || [];
    assert.equal(
      req.length === 1 && req[0] === 'description',
      false,
      '★ v6.0.0 — description-required branch 재유입 ❌ (묶음 Q ②)',
    );
    assert.equal(
      req.includes('trigger') && req.includes('condition') && req.includes('action'),
      false,
      '★ v6.0.0 — trigger/condition/action-required branch 재유입 ❌ (묶음 Q ②)',
    );
  }
});

test('rules.schema.json — description/trigger/condition/action property 보존 (D1·D2 / branch 제거 ≠ property 금지 / decision-table-validator consumer 보호)', () => {
  for (const p of ['description', 'trigger', 'condition', 'action', 'expected_result', 'rejection_method', 'verification_location']) {
    assert.ok(
      p in businessRule.properties,
      `★ v6.0.0 — '${p}' property = optional metadata 보존 (official-docs#2 VERIFIED / D1·D2)`,
    );
  }
});

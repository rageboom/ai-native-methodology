// ★ ★ ★ v4.1.0 신설 — Phase 2 ⑤ cross_consistency_check + 동치 enforcement 구조 test.
// DEC-2026-05-17-묶음-P §3 #2 "분류 보존 강제" 확정 제약 + research-phase2-5 §5 + LL-i-47 정합.
// v4.0.1 cross-schema-enum.test.js 패턴 미러 (schema-shape 정합 / functional 검증은 schema-validator 측).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCHEMAS_DIR = resolve(__dirname, '../../../schemas');

function readSchema(filename) {
  return JSON.parse(readFileSync(resolve(SCHEMAS_DIR, filename), 'utf-8'));
}

test('rules.schema.json — cross_consistency_check slim marker 신설 + additionalProperties:false', () => {
  const schema = readSchema('business-rules.schema.json');
  const cc = schema.$defs.businessRule.properties.cross_consistency_check;
  assert.ok(cc, 'cross_consistency_check 필드 존재');
  assert.equal(cc.type, 'object');
  assert.equal(cc.additionalProperties, false, '★ SSOT 오염 차단 — additionalProperties:false 의무');
});

test('cross_consistency_check — Senior 조건 1 provenance discriminator (generated_by) 존재', () => {
  const cc = readSchema('business-rules.schema.json').$defs.businessRule.properties.cross_consistency_check;
  assert.ok(cc.properties.generated_by, '★ provenance discriminator generated_by 의무 (machine-generated 식별)');
  assert.ok(cc.properties.checked_at, 'checked_at provenance 존재');
  assert.ok(cc.properties.external_result_ref, '★ 분리 집계 join — external_result_ref 존재 (정제된 옵션 C)');
});

test('cross_consistency_check — 분류 보존 강제 핵심 필드 (DEC §3 #2 확정 제약)', () => {
  const cc = readSchema('business-rules.schema.json').$defs.businessRule.properties.cross_consistency_check;
  assert.equal(cc.properties.intent_classification_preserved.type, 'boolean');
  assert.equal(cc.properties.classification_drift_detected.type, 'boolean');
  assert.ok(cc.properties.classification_drift_reason, 'classification_drift_reason 존재');
});

test('cross_consistency_check — verdict enum 에 classification_drift 신설 (PoC #08 사례)', () => {
  const cc = readSchema('business-rules.schema.json').$defs.businessRule.properties.cross_consistency_check;
  const verdict = cc.properties.verdict;
  assert.deepEqual(
    verdict.enum,
    ['consistent', 'inconsistent', 'ambiguous', 'classification_drift', 'skipped'],
    '★ ★ classification_drift = LL-i-47 echo-chamber drift 차단 verdict 의무',
  );
});

test('rules.schema.json — is_intent ⇔ intent_vs_bug_classification 양방향 동치 if/then 2블록', () => {
  const allOf = readSchema('business-rules.schema.json').$defs.businessRule.allOf;
  assert.ok(Array.isArray(allOf));

  // 정방향: is_intent=true ⇒ classification const "intent"
  const fwd = allOf.find(
    (b) =>
      b.if &&
      b.if.properties &&
      b.if.properties.is_intent &&
      b.if.properties.is_intent.const === true &&
      Array.isArray(b.if.required) &&
      b.if.required.includes('is_intent') &&
      b.if.required.includes('intent_vs_bug_classification'),
  );
  assert.ok(fwd, '★ 정방향 if/then 블록 존재 (둘 다 보유 시만 발동)');
  assert.equal(
    fwd.then.properties.intent_vs_bug_classification.const,
    'intent',
    'is_intent=true ⇒ classification="intent" 강제',
  );

  // 역방향: is_intent=false ⇒ classification NOT "intent"
  const rev = allOf.find(
    (b) => b.if && b.if.properties && b.if.properties.is_intent && b.if.properties.is_intent.const === false,
  );
  assert.ok(rev, '★ 역방향 if/then 블록 존재');
  assert.ok(
    rev.then.properties.intent_vs_bug_classification.not,
    'is_intent=false ⇒ classification ≠ "intent" (not.const) 강제',
  );
});

test('동치 if/then — 둘 다 required (단방향/미보유 vacuous / 실측 both=0 회귀 풀이 0)', () => {
  const allOf = readSchema('business-rules.schema.json').$defs.businessRule.allOf;
  const equivBlocks = allOf.filter(
    (b) =>
      b.if &&
      Array.isArray(b.if.required) &&
      b.if.required.includes('is_intent') &&
      b.if.required.includes('intent_vs_bug_classification'),
  );
  assert.equal(equivBlocks.length, 2, '★ 양방향 동치 = 정확히 2 if/then 블록 (official-docs VERIFIED 패턴)');
  for (const b of equivBlocks) {
    assert.ok(
      b.if.required.includes('is_intent') && b.if.required.includes('intent_vs_bug_classification'),
      '★ 둘 다 보유 시만 발동 — 단방향 BR vacuous (both=0 → 전 PoC 무회귀 수학 보장)',
    );
  }
});

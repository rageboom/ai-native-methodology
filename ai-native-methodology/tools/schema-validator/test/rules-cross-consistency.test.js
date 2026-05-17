// ★ ★ ★ v4.1.0 신설 — Phase 2 ⑤ cross_consistency_check + is_intent⇔intent_vs_bug_classification
// 동치 enforcement functional test (★ ajv 실 검증 / if/then 이 실제로 모순을 거부하는지 입증).
// DEC-2026-05-17-묶음-P §3 #2 "분류 보존 강제" 확정 제약 + research-phase2-5 §5 + LL-i-47 정합.
// ★ 핵심: if/then 이 vacuous-everywhere 가 아님을 입증 (모순 BR = INVALID / 단방향 BR = VALID).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', 'src', 'cli.js');
const SCHEMA_DIR = resolve(__dirname, '..', '..', '..', 'schemas');

function validateRules(businessRule) {
  const dir = mkdtempSync(join(tmpdir(), 'sv-cc-'));
  try {
    const inst = {
      $schema_origin: '../../schemas/business-rules.schema.json',
      business_rules: [businessRule],
    };
    const f = join(dir, 'business-rules.json');
    writeFileSync(f, JSON.stringify(inst));
    const r = spawnSync('node', [CLI, f, '--schema-dir', SCHEMA_DIR, '--json'], { encoding: 'utf-8' });
    const parsed = r.stdout ? JSON.parse(r.stdout) : null;
    const result = parsed && parsed.results && parsed.results[0];
    assert.ok(result, `cli.js 결과 파싱 실패: ${r.stdout} ${r.stderr}`);
    assert.notEqual(result.schema_status, 'not-found', 'business-rules.schema.json 매핑 실패');
    return result.valid;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const BASE = { id: 'BR-TEST-CASE-001', name: 't', natural_language: 't' };

// ── regression-safety (★ 실측 both=0 / 단방향 보유 = vacuous) ─────────────
test('★ regression-safe — is_intent 단독 (intent_vs_bug_classification 부재) → VALID', () => {
  assert.equal(validateRules({ ...BASE, is_intent: true }), true);
});

test('★ regression-safe — intent_vs_bug_classification 단독 (is_intent 부재) → VALID', () => {
  assert.equal(validateRules({ ...BASE, intent_vs_bug_classification: 'bug' }), true);
});

test('★ regression-safe — 둘 다 부재 → VALID (14 PoC 회귀 풀이 0 정합)', () => {
  assert.equal(validateRules({ ...BASE }), true);
});

// ── enforcement bites (★ if/then 이 실제로 모순 거부 / vacuous-everywhere 아님) ──
test('★ ★ ★ enforcement — is_intent=true + classification="bug" (모순) → INVALID', () => {
  assert.equal(validateRules({ ...BASE, is_intent: true, intent_vs_bug_classification: 'bug' }), false);
});

test('★ ★ ★ enforcement — is_intent=false + classification="intent" (역방향 모순) → INVALID', () => {
  assert.equal(validateRules({ ...BASE, is_intent: false, intent_vs_bug_classification: 'intent' }), false);
});

test('★ consistent — is_intent=true + classification="intent" → VALID', () => {
  assert.equal(validateRules({ ...BASE, is_intent: true, intent_vs_bug_classification: 'intent' }), true);
});

test('★ consistent — is_intent=false + classification="self_recognized" → VALID', () => {
  assert.equal(validateRules({ ...BASE, is_intent: false, intent_vs_bug_classification: 'self_recognized' }), true);
});

// ── cross_consistency_check slim marker shape ────────────────────────────
test('★ cross_consistency_check — valid slim marker → VALID', () => {
  assert.equal(
    validateRules({
      ...BASE,
      cross_consistency_check: {
        generated_by: 'br-cross-consistency-validator@0.2.0',
        layer: 2,
        layer2_model: 'claude-sonnet-4-6',
        layer2_semantic_score: 0.91,
        verdict: 'consistent',
        intent_classification_preserved: true,
        classification_drift_detected: false,
        external_result_ref: 'tools/br-cross-consistency-validator/layer-2-results/poc-08-layer-2-results.json',
        checked_at: '2026-05-17T00:00:00Z',
      },
    }),
    true,
  );
});

test('★ ★ cross_consistency_check — verdict="classification_drift" (PoC #08 사례) → VALID', () => {
  assert.equal(
    validateRules({
      ...BASE,
      cross_consistency_check: {
        generated_by: 'br-cross-consistency-validator@0.2.0',
        layer: 2,
        verdict: 'classification_drift',
        intent_classification_preserved: false,
        classification_drift_detected: true,
        classification_drift_reason: 'GWT synthesis dropped is_likely_bug=true → normalized as business rule',
      },
    }),
    true,
  );
});

test('★ cross_consistency_check — additionalProperties:false (미지정 sub-field) → INVALID', () => {
  assert.equal(
    validateRules({ ...BASE, cross_consistency_check: { verdict: 'consistent', unknown_field: 1 } }),
    false,
  );
});

test('★ cross_consistency_check — verdict enum 위반 → INVALID', () => {
  assert.equal(validateRules({ ...BASE, cross_consistency_check: { verdict: 'totally_made_up' } }), false);
});

// sql-inventory-extractor unit tests (★ workspace 14번째 / 18 tests / ★ v2.3.0-rc1 +3 migration_priority / ★ v2.3.0 Phase 2 +1 patterns_extension_v3 / ★ v2.3.1 PATCH +4 [tag_type valid/invalid + ratchet pass/fail])

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

// ★ ★ v2.3.0-rc1 — migration_priority (ADR-CHAIN-009) 3 신규 test

test('★ backward-compat — PoC #06 (no migration_priority) → all unspecified / no finding', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
  assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.migration_priority_distribution.unspecified, 6,
    '기존 11 컬럼 row 6건 모두 migration_priority 미지정 의무 (backward-compat)');
  assert.equal(r.summary.migration_priority_distribution.P0, 0);
});

test('★ valid — migration_priority P0~P3 (mixed) recognized + no finding', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'with-migration-priority'));
  assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.inventory_count, 5);
  assert.equal(r.summary.migration_priority_distribution.P0, 1);
  assert.equal(r.summary.migration_priority_distribution.P1, 1);
  assert.equal(r.summary.migration_priority_distribution.P2, 1);
  assert.equal(r.summary.migration_priority_distribution.P3, 1);
  assert.equal(r.summary.migration_priority_distribution.unspecified, 1);
});

test('★ invalid — migration_priority enum (PX) violation → critical finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', 'bad-migration-priority'));
  assert.ok(r.findings.some(f => f.kind === 'record.migration_priority_invalid' && f.severity === 'critical'),
    'migration_priority=PX → critical finding 의무 (ADR-CHAIN-009)');
});

// ★ ★ v2.3.0 Phase 2 — patterns_extension_v3 (ADR-CHAIN-010) 1 신규 test

test('★ valid — patterns_extension_v3 (cache / discriminator / typeHandler) → no finding (optional MyBatis 3+)', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'with-patterns-extension-v3'));
  assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.inventory_count, 2);
  // patterns_extension_v3 = optional / validator 차원 검증 ❌ / schema 차원에서 처리 / 본 test = 회귀 ❌ 의무.
});

// ★ ★ v2.3.1 PATCH — tag_type enum (C-v2.2.0-7) + baseline ratchet (C-v2.2.0-2) 4 신규 test

test('★ valid — dynamic_branch.tag_type (ibatis2 + mybatis3 + sql:case_when) recognized + no finding', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'with-tag-type'));
  assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
  assert.equal(r.summary.tag_type_distribution['ibatis2:isNotEmpty'], 1);
  assert.equal(r.summary.tag_type_distribution['sql:case_when'], 1);
  assert.equal(r.summary.tag_type_distribution['mybatis3:if'], 1);
  assert.equal(r.summary.tag_type_distribution['mybatis3:foreach'], 1);
});

test('★ invalid — dynamic_branch.tag_type enum (unknown:tag) violation → critical finding', () => {
  const r = validateSqlInventory(join(FIX, 'invalid', 'bad-tag-type'));
  assert.ok(r.findings.some(f => f.kind === 'record.tag_type_invalid' && f.severity === 'critical'),
    'tag_type=unknown:tag → critical finding 의무 (C-v2.2.0-7)');
});

test('★ ratchet trend positive — PoC #06 (auto_ratio 0.667) vs baseline 0.667 → no finding', () => {
  const baseline = join(FIX, 'baselines', 'poc-06-baseline.json');
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.50, { coverageBaselinePath: baseline });
  assert.equal(r.summary.high, 0, `ratchet trend pass 의무: ${JSON.stringify(r.findings)}`);
  assert.equal(r.summary.ratchet_trend.pass, true);
});

test('★ ratchet trend negative — PoC #06 (auto_ratio 0.667) vs baseline 0.85 → high finding', () => {
  const baseline = join(FIX, 'baselines', 'regressed-baseline.json');
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.50, { coverageBaselinePath: baseline });
  assert.ok(r.findings.some(f => f.kind === 'extraction_automation.ratchet_trend_negative' && f.severity === 'high'),
    'ratchet trend negative (0.667 < 0.85) → high finding 의무 (C-v2.2.0-2)');
  assert.equal(r.summary.ratchet_trend.pass, false);
});

// ★ v8.7 PATCH — Layer 2 legacy XML cross-check (R15 silent enabler fix / F-CYCLE3-005)

test('★ v8.7 Layer 2 — legacy-xml-dir 부재 → dir_missing high finding', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.50, {
    legacyXmlDir: '/__nonexistent_legacy_xml_dir_test_fixture__'
  });
  // xmllint 가용 여부에 따라 다름 — xmllint_unavailable medium 이 먼저 emit 되면 dir 체크 안 도달
  const hasDirMissing = r.findings.some(f => f.kind === 'legacy_cross_check.dir_missing' && f.severity === 'high');
  const hasXmllintUnavail = r.findings.some(f => f.kind === 'legacy_cross_check.xmllint_unavailable');
  assert.ok(hasDirMissing || hasXmllintUnavail,
    `legacy-xml-dir 부재 → dir_missing 또는 xmllint_unavailable finding 의무: ${JSON.stringify(r.findings)}`);
  assert.ok(r.summary.legacy_cross_check, 'legacy_cross_check summary 존재 의무');
});

test('★ v8.7 Layer 2 — legacy-xml-dir 미지정 → cross-check skip (legacy_cross_check=null / backward-compat)', () => {
  const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
  assert.equal(r.summary.legacy_cross_check, null,
    'legacyXmlDir option 미지정 시 cross-check skip 의무 (backward-compat)');
  assert.equal(r.findings.filter(f => f.kind?.startsWith('legacy_cross_check.')).length, 0);
});

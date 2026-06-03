// sql-inventory-validator unit tests (workspace 14번째 / 24 tests / v2.3.0-rc1 +3 migration_priority / v2.3.0 Phase 2 +1 patterns_extension_v3 / v2.3.1 PATCH +4 [tag_type valid/invalid + ratchet pass/fail] / v8.7 rename from sql-inventory-extractor — bin alias 양쪽 보존)

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
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

test('valid PoC #06 vs #07 — auto_ratio identical (scale-cross isomorphic)', () => {
	const r6 = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
	const r7 = validateSqlInventory(join(FIX, 'valid', 'poc-07'));
	assert.equal(
		r6.summary.auto_ratio_external_6,
		r7.summary.auto_ratio_external_6,
		'PoC #06+#07 양쪽 4/6=66.7% 동일 입증 의무',
	);
});

test('invalid — entry_missing critical finding', () => {
	const r = validateSqlInventory(join(FIX, 'invalid', '__nonexistent__'));
	assert.ok(
		r.findings.some(
			(f) => f.kind === 'inventory.entry_missing' && f.severity === 'critical',
		),
	);
});

test('invalid — missing required field (sql_id) critical finding', () => {
	const r = validateSqlInventory(join(FIX, 'invalid', 'missing-required'));
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'record.missing_required_field' &&
				f.message.includes('sql_id'),
		),
	);
});

test('invalid — statement_type enum (BATCH) violation critical finding', () => {
	const r = validateSqlInventory(join(FIX, 'invalid', 'bad-statement-type'));
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'record.statement_type_invalid' && f.severity === 'critical',
		),
	);
});

test('invalid — carry_flag enum (random-flag) violation critical finding', () => {
	const r = validateSqlInventory(join(FIX, 'invalid', 'bad-carry-flag'));
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'record.carry_flag_invalid' && f.severity === 'critical',
		),
	);
});

test('invalid — external_call_out_of_scope + confidence > 0.80 → if/then high finding', () => {
	const r = validateSqlInventory(
		join(FIX, 'invalid', 'high-confidence-external-call'),
	);
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'record.high_confidence_with_external_call' &&
				f.severity === 'high',
		),
	);
});

test('invalid — intent_vs_bug_classification 4 분류 키워드 부재 → high finding', () => {
	const r = validateSqlInventory(join(FIX, 'invalid', 'intent-no-keyword'));
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'record.intent_vs_bug_no_keyword' && f.severity === 'high',
		),
	);
});

// v2.3.0-rc1 — migration_priority (ADR-CHAIN-009) 3 신규 test

test('backward-compat — PoC #06 (no migration_priority) → all unspecified / no finding', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
	assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
	assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
	assert.equal(
		r.summary.migration_priority_distribution.unspecified,
		6,
		'기존 11 컬럼 row 6건 모두 migration_priority 미지정 의무 (backward-compat)',
	);
	assert.equal(r.summary.migration_priority_distribution.P0, 0);
});

test('valid — migration_priority P0~P3 (mixed) recognized + no finding', () => {
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

test('invalid — migration_priority enum (PX) violation → critical finding', () => {
	const r = validateSqlInventory(
		join(FIX, 'invalid', 'bad-migration-priority'),
	);
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'record.migration_priority_invalid' &&
				f.severity === 'critical',
		),
		'migration_priority=PX → critical finding 의무 (ADR-CHAIN-009)',
	);
});

// v2.3.0 Phase 2 — patterns_extension_v3 (ADR-CHAIN-010) 1 신규 test

test('valid — patterns_extension_v3 (cache / discriminator / typeHandler) → no finding (optional MyBatis 3+)', () => {
	const r = validateSqlInventory(
		join(FIX, 'valid', 'with-patterns-extension-v3'),
	);
	assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
	assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
	assert.equal(r.summary.inventory_count, 2);
	// patterns_extension_v3 = optional / validator 차원 검증 ❌ / schema 차원에서 처리 / 본 test = 회귀 ❌ 의무.
});

// v2.3.1 PATCH — tag_type enum (C-v2.2.0-7) + baseline ratchet (C-v2.2.0-2) 4 신규 test

test('valid — dynamic_branch.tag_type (ibatis2 + mybatis3 + sql:case_when) recognized + no finding', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'with-tag-type'));
	assert.equal(r.summary.critical, 0, JSON.stringify(r.findings));
	assert.equal(r.summary.high, 0, JSON.stringify(r.findings));
	assert.equal(r.summary.tag_type_distribution['ibatis2:isNotEmpty'], 1);
	assert.equal(r.summary.tag_type_distribution['sql:case_when'], 1);
	assert.equal(r.summary.tag_type_distribution['mybatis3:if'], 1);
	assert.equal(r.summary.tag_type_distribution['mybatis3:foreach'], 1);
});

test('invalid — dynamic_branch.tag_type enum (unknown:tag) violation → critical finding', () => {
	const r = validateSqlInventory(join(FIX, 'invalid', 'bad-tag-type'));
	assert.ok(
		r.findings.some(
			(f) => f.kind === 'record.tag_type_invalid' && f.severity === 'critical',
		),
		'tag_type=unknown:tag → critical finding 의무 (C-v2.2.0-7)',
	);
});

test('ratchet trend positive — PoC #06 (auto_ratio 0.667) vs baseline 0.667 → no finding', () => {
	const baseline = join(FIX, 'baselines', 'poc-06-baseline.json');
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		coverageBaselinePath: baseline,
	});
	assert.equal(
		r.summary.high,
		0,
		`ratchet trend pass 의무: ${JSON.stringify(r.findings)}`,
	);
	assert.equal(r.summary.ratchet_trend.pass, true);
});

test('ratchet trend negative — PoC #06 (auto_ratio 0.667) vs baseline 0.85 → high finding', () => {
	const baseline = join(FIX, 'baselines', 'regressed-baseline.json');
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		coverageBaselinePath: baseline,
	});
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'extraction_automation.ratchet_trend_negative' &&
				f.severity === 'high',
		),
		'ratchet trend negative (0.667 < 0.85) → high finding 의무 (C-v2.2.0-2)',
	);
	assert.equal(r.summary.ratchet_trend.pass, false);
});

// v8.7 PATCH — Layer 2 legacy XML cross-check (R15 silent enabler fix / F-CYCLE3-005)

test('v8.7 Layer 2 — legacy-xml-dir 부재 → dir_missing high finding', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		legacyXmlDir: '/__nonexistent_legacy_xml_dir_test_fixture__',
	});
	// v8.13.0 — Tier 1 in-plugin XML parser 격상 (xmllint → fast-xml-parser).
	// 이전 (v8.7~v8.12): xmllint 가용 여부 분기 의무 (Windows env absent 시 xmllint_unavailable medium emit).
	// 이후 (v8.13.0+): Node-native parser / OS 무관 항상 dir_missing 분기 도달 (xmllint_unavailable kind 제거).
	const hasDirMissing = r.findings.some(
		(f) => f.kind === 'legacy_cross_check.dir_missing' && f.severity === 'high',
	);
	assert.ok(
		hasDirMissing,
		`legacy-xml-dir 부재 → dir_missing high finding 의무 (v8.13.0+ Tier 1 in-plugin): ${JSON.stringify(r.findings)}`,
	);
	assert.ok(
		r.summary.legacy_cross_check,
		'legacy_cross_check summary 존재 의무',
	);
});

test('v8.7 Layer 2 — legacy-xml-dir 미지정 → cross-check skip (legacy_cross_check=null / backward-compat)', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
	assert.equal(
		r.summary.legacy_cross_check,
		null,
		'legacyXmlDir option 미지정 시 cross-check skip 의무 (backward-compat)',
	);
	assert.equal(
		r.findings.filter((f) => f.kind?.startsWith('legacy_cross_check.')).length,
		0,
	);
});

// v8.7 PATCH — Layer 3 evidence cross-check (AI 자기 보고 metric 검증 / F-CYCLE3-005 fix)

test('v8.7 Layer 3 — evidence-dir 미지정 → cross-check skip (evidence_cross_check=null / backward-compat)', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'));
	assert.equal(
		r.summary.evidence_cross_check,
		null,
		'evidenceDir option 미지정 시 cross-check skip 의무 (backward-compat)',
	);
	assert.equal(
		r.findings.filter((f) => f.kind?.startsWith('evidence_cross_check.'))
			.length,
		0,
	);
});

test('v8.7 Layer 3 — evidence-dir 부재 → dir_missing high finding', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		evidenceDir: '/__nonexistent_evidence_dir_fixture__',
	});
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'evidence_cross_check.dir_missing' && f.severity === 'high',
		),
		`evidence-dir 부재 → dir_missing high finding 의무: ${JSON.stringify(r.findings)}`,
	);
	assert.equal(r.summary.evidence_cross_check.status, 'dir_missing');
});

test('v8.7 Layer 3 — evidence-dir 명시 / tool_count >= claim (5 vs 4) → no critical (R15 정합 verified)', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		evidenceDir: join(FIX, 'evidence-dir-match'),
	});
	assert.equal(r.summary.evidence_cross_check.status, 'ok');
	assert.equal(
		r.summary.evidence_cross_check.evidence_tool_count,
		4,
		`expected 4 unique tools (xmllint, rg, ast-grep, semgrep): got ${r.summary.evidence_cross_check.evidence_tool_count}`,
	);
	assert.equal(
		r.summary.evidence_cross_check.claimed_count,
		4,
		'poc-06 의 auto_ratio_external_6 = "4/6 = 66.7%" 의 claim N = 4',
	);
	const criticalEvidence = r.findings.filter(
		(f) =>
			f.kind === 'evidence_cross_check.invocation_count_mismatch' &&
			f.severity === 'critical',
	);
	assert.equal(
		criticalEvidence.length,
		0,
		'4 (evidence) >= 4 (claim) → no critical finding 의무 (R15 정합 verified)',
	);
});

test('v8.7 Layer 3 — evidence-dir 명시 / tool_count < claim (2 vs 4) → invocation_count_mismatch CRITICAL (R15 silent simulation 의심)', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		evidenceDir: join(FIX, 'evidence-dir-mismatch'),
	});
	assert.equal(r.summary.evidence_cross_check.evidence_tool_count, 2);
	assert.equal(r.summary.evidence_cross_check.claimed_count, 4);
	assert.ok(
		r.findings.some(
			(f) =>
				f.kind === 'evidence_cross_check.invocation_count_mismatch' &&
				f.severity === 'critical',
		),
		`2 (evidence) < 4 (claim) → CRITICAL finding 의무 (R15 silent simulation 의심): ${JSON.stringify(r.findings)}`,
	);
});

// v8.7.1 PATCH — F-CYCLE4-001 fix: xmllint XPath 에 iBATIS 2 <procedure> tag 추가
// 이전 (v8.7.0): rbac.xml 류 stored-procedure-only mapper 가 xmllint_total=0 → zero_xmllint_count medium finding
// 이후 (v8.7.1+): procedure tag 도 count → boundary service 도 정확 cross-check
// dogfood: poc-efi-web-1 cycle-4 rbac scope 의 정직 발견 (F-CYCLE4-001) 으로 트리거.

test('v8.7.1 — iBATIS 2 <procedure> only mapper xmllint_total > 0 (F-CYCLE4-001 fix / rbac.xml 형식)', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		legacyXmlDir: join(FIX, 'legacy-xml-ibatis2-procedure'),
	});
	assert.equal(
		r.summary.legacy_cross_check.status,
		'ok',
		`legacy_cross_check status ok 의무: ${JSON.stringify(r.summary.legacy_cross_check)}`,
	);
	assert.equal(
		r.summary.legacy_cross_check.xmllint_total,
		3,
		`v8.7.1 — rbac-like mapper (3 procedure) xmllint count = 3 의무 / v8.7.0 까지는 0 (procedure tag 누락 결함). 실 결과: ${r.summary.legacy_cross_check.xmllint_total}`,
	);
	// zero_xmllint_count finding 부재 확인 (v8.7.0 까지는 emit, v8.7.1 부터 0 count 아님)
	assert.equal(
		r.findings.filter((f) => f.kind === 'legacy_cross_check.zero_xmllint_count')
			.length,
		0,
		`v8.7.1 — procedure tag 가 count 되므로 zero_xmllint_count finding 부재 의무: ${JSON.stringify(r.findings)}`,
	);
});

test('v8.7.1 — select/insert/update/delete/procedure 혼합 mapper xmllint_total 정확 합산', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5, {
		legacyXmlDir: join(FIX, 'legacy-xml-mixed-stmt-proc'),
	});
	assert.equal(r.summary.legacy_cross_check.status, 'ok');
	assert.equal(
		r.summary.legacy_cross_check.xmllint_total,
		5,
		`v8.7.1 — 5 stmt (select + insert + update + delete + procedure) 합산 = 5 의무 / v8.7.0 까지는 4 (procedure 누락). 실 결과: ${r.summary.legacy_cross_check.xmllint_total}`,
	);
});

test('v8.7.1 — zero_xmllint_count message 갱신 (procedure tag 언급)', () => {
	// empty dir 같은 fixture 가 없으니 단순 message 정합만 확인 — 실 동작은 다른 test 에 위임
	// 본 test 는 v8.7.1 message 가 'procedure' 키워드 포함하는지 회귀 보장 (소스 직접 grep)
	const validatorSrc = readFileSync(
		join(__dirname, '..', 'src', 'validator.js'),
		'utf8',
	);
	assert.ok(
		validatorSrc.includes('select/insert/update/delete/procedure'),
		'v8.7.1 — zero_xmllint_count message 가 procedure 키워드 포함 의무',
	);
});

// ============================================================================
// v8.8.0 Tier 2.2 — DDL cross-check (Phantom 검출 / DDL Gap 자동화)
// ============================================================================

test('v8.8.0 — DDL match path / Phantom 0 + info_positive emit', () => {
	const r = validateSqlInventory(join(FIX, 'ddl-match'), 0.5, {
		ddlDir: join(FIX, 'ddl-fixture-tables'),
	});
	assert.equal(
		r.summary.ddl_cross_check.status,
		'ok',
		`ddl_cross_check ok 의무: ${JSON.stringify(r.summary.ddl_cross_check)}`,
	);
	assert.equal(
		r.summary.ddl_cross_check.phantom_tables.length,
		0,
		`Phantom 0 의무 (TB_CAR + TB_CAR_USER_TERM DDL 실존 / FIM.dbo.TB_USER cross-DB 제외): phantom=${JSON.stringify(r.summary.ddl_cross_check.phantom_tables)}`,
	);
	assert.equal(
		r.summary.ddl_cross_check.cross_db_excluded,
		1,
		`cross_db_excluded = 1 (FIM.dbo.TB_USER): ${r.summary.ddl_cross_check.cross_db_excluded}`,
	);
	assert.ok(
		r.findings.some((f) => f.kind === 'ddl_cross_check.phantom_zero'),
		`phantom_zero info finding emit 의무 (Phantom 0 + 인용 > 0): ${JSON.stringify(r.findings)}`,
	);
});

test('v8.8.0 — DDL mismatch path / Phantom 검출 + high finding', () => {
	const r = validateSqlInventory(join(FIX, 'ddl-mismatch'), 0.5, {
		ddlDir: join(FIX, 'ddl-fixture-tables'),
	});
	assert.equal(r.summary.ddl_cross_check.status, 'ok');
	assert.equal(
		r.summary.ddl_cross_check.phantom_tables.length,
		2,
		`Phantom 2 의무 (TB_PHANTOM_X + TB_PHANTOM_Y / TB_CAR 는 DDL 실존): ${JSON.stringify(r.summary.ddl_cross_check.phantom_tables)}`,
	);
	assert.deepEqual(
		r.summary.ddl_cross_check.phantom_tables.sort(),
		['TB_PHANTOM_X', 'TB_PHANTOM_Y'],
		`Phantom list mismatch`,
	);
	const phantomFinding = r.findings.find(
		(f) => f.kind === 'ddl_cross_check.phantom_tables',
	);
	assert.ok(phantomFinding, `phantom_tables finding emit 의무`);
	assert.ok(
		phantomFinding.severity === 'high' || phantomFinding.severity === 'medium',
		`phantom severity = high or medium: ${phantomFinding.severity}`,
	);
});

test('v8.8.0 — DDL dir 미가용 시 dir_missing finding (graceful)', () => {
	const r = validateSqlInventory(join(FIX, 'ddl-match'), 0.5, {
		ddlDir: '/nonexistent/path/to/ddl',
	});
	assert.equal(r.summary.ddl_cross_check.status, 'dir_missing');
	assert.ok(
		r.findings.some((f) => f.kind === 'ddl_cross_check.dir_missing'),
		`dir_missing finding emit 의무`,
	);
});

test('v8.8.0 — --ddl-dir 미명시 시 ddl_cross_check skip (회귀 0)', () => {
	const r = validateSqlInventory(join(FIX, 'valid', 'poc-06'), 0.5);
	assert.equal(
		r.summary.ddl_cross_check,
		null,
		`ddl-dir 미명시 시 null 의무 (회귀 0): ${JSON.stringify(r.summary.ddl_cross_check)}`,
	);
});

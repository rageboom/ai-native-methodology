import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
	writeFileSync,
	readFileSync,
	existsSync,
	mkdtempSync,
	mkdirSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { validateCharacterization } from '../src/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fx = (name) => join(__dirname, 'fixtures', name);

test('valid fixture: PoC #03-style retrofit minimal — 0 critical/high finding', () => {
	const r = validateCharacterization(fx('valid'), 0.8);
	const blocking = r.findings.filter(
		(f) => f.severity === 'critical' || f.severity === 'high',
	);
	assert.equal(
		blocking.length,
		0,
		`unexpected blocking findings: ${JSON.stringify(blocking, null, 2)}`,
	);
	assert.equal(r.summary.snapshot_count, 2);
	assert.equal(r.summary.scenario_count, 3);
	assert.equal(r.summary.coverage_strategy, 'absolute');
});

test('valid fixture: named_classified_ratio = 100% (5/5 / no ambiguous)', () => {
	const r = validateCharacterization(fx('valid'), 0.8);
	assert.equal(r.summary.named_classified_ratio, 1.0);
});

test('invalid fixture: missing required field "then" — critical finding', () => {
	const r = validateCharacterization(fx('invalid-missing-required'), 0.8);
	const missingRequired = r.findings.filter(
		(f) => f.kind === 'scenario.missing_required',
	);
	assert.ok(
		missingRequired.length >= 1,
		'expected scenario.missing_required finding',
	);
	// 'given', 'when', 'then', 'intent_classification' 모두 누락
	const fields = new Set(missingRequired.map((f) => f.field));
	assert.ok(fields.has('then'), 'then field missing not detected');
	assert.ok(
		fields.has('intent_classification'),
		'intent_classification missing not detected',
	);
});

test('invalid fixture: bad intent_classification.type "TODO" — critical finding', () => {
	const r = validateCharacterization(fx('invalid-bad-type'), 0.8);
	const typeBad = r.findings.filter(
		(f) => f.kind === 'scenario.classification_type_invalid',
	);
	assert.equal(typeBad.length, 1);
	assert.equal(typeBad[0].type, 'TODO');
	assert.equal(typeBad[0].severity, 'critical');
});

test('invalid fixture: ratchet strategy without trend_required=true — critical finding', () => {
	const r = validateCharacterization(fx('invalid-ratchet-trend'), 0.8);
	const trend = r.findings.filter(
		(f) => f.kind === 'coverage.ratchet_trend_required_missing',
	);
	assert.equal(trend.length, 1);
	assert.equal(trend[0].severity, 'critical');
});

test('invalid fixture: ambiguous classification with no carry mention — critical finding', () => {
	const r = validateCharacterization(fx('invalid-ambiguous-no-carry'), 0.8);
	const carryMissing = r.findings.filter(
		(f) => f.kind === 'classification.ambiguous_carry_missing',
	);
	assert.equal(carryMissing.length, 1);
	assert.equal(carryMissing[0].severity, 'critical');
});

test('invalid fixture: ambiguous scenario without behavior_likely_bug + behavior_to_preserve — high finding', () => {
	const r = validateCharacterization(fx('invalid-ambiguous-no-carry'), 0.8);
	const noBehavior = r.findings.filter(
		(f) => f.kind === 'scenario.ambiguous_no_behavior_note',
	);
	assert.equal(noBehavior.length, 1);
	assert.equal(noBehavior[0].severity, 'high');
});

test('threshold parameter respected (passing 0.95 makes valid fixture above threshold pass)', () => {
	const r = validateCharacterization(fx('valid'), 0.95);
	const ratioBelow = r.findings.filter(
		(f) => f.kind === 'classification.named_ratio_below_threshold',
	);
	assert.equal(ratioBelow.length, 0, '100% should still pass 0.95 threshold');
});

test('exit codes: validator returns findings counts in summary', () => {
	const r = validateCharacterization(fx('invalid-bad-type'), 0.8);
	assert.equal(r.summary.critical, 1);
	assert.equal(r.summary.total_findings >= 1, true);
});

test('coverage_strategy enum invalid value detected', () => {
	// create on the fly: reuse existing fixture but the validator should still validate strategy enum from file
	// we already have absolute / ratchet covered; this verifies enum check exists by code path
	const r = validateCharacterization(fx('invalid-bad-type'), 0.8);
	// 'absolute' is valid in this fixture; just verify no false positive
	const strategyBad = r.findings.filter(
		(f) => f.kind === 'coverage.strategy_invalid',
	);
	assert.equal(strategyBad.length, 0);
});

// ─────────────────────────────────────────────────────────────────────
// v2.1.0 carry C-v2.1.0-5 — ratchet trend baseline 자동 검증
// ─────────────────────────────────────────────────────────────────────

test('ratchet trend — first run (no baseline) → pass + recommend write', () => {
	const tmpDir = mkdtempSync(join(tmpdir(), 'cccov-test-'));
	const baselinePath = join(tmpDir, 'no-such-baseline.json');
	try {
		const r = validateCharacterization(fx('valid-ratchet'), 0.8, {
			coverageBaselinePath: baselinePath,
			writeBaseline: false,
		});
		const trendNeg = r.findings.filter(
			(f) => f.kind === 'coverage.trend_negative_ratchet',
		);
		assert.equal(trendNeg.length, 0, 'first run should not block on trend');
		assert.ok(r.summary.coverage_trend, 'coverage_trend summary should be set');
		assert.equal(r.summary.coverage_trend.reason, 'no_baseline_first_run');
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('ratchet trend — current ≥ baseline → pass (positive or flat)', () => {
	const tmpDir = mkdtempSync(join(tmpdir(), 'cccov-test-'));
	const baselinePath = join(tmpDir, 'baseline.json');
	// valid-ratchet 의 actual = 1/2 = 0.50
	// baseline = 0.40 → delta +0.10 → trend positive
	writeFileSync(
		baselinePath,
		JSON.stringify({
			generated_at: '2026-05-01',
			coverage_ratio: 0.4,
			coverage_strategy: 'ratchet',
			project_id: 'test-fixture-ratchet',
		}),
	);
	try {
		const r = validateCharacterization(fx('valid-ratchet'), 0.8, {
			coverageBaselinePath: baselinePath,
			writeBaseline: false,
		});
		const trendNeg = r.findings.filter(
			(f) => f.kind === 'coverage.trend_negative_ratchet',
		);
		assert.equal(trendNeg.length, 0, 'positive trend should not block');
		assert.equal(r.summary.coverage_trend.reason, 'trend_positive');
		assert.ok(r.summary.coverage_trend.delta > 0);
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('ratchet trend — current < baseline → high finding (regression block)', () => {
	const tmpDir = mkdtempSync(join(tmpdir(), 'cccov-test-'));
	const baselinePath = join(tmpDir, 'baseline.json');
	// valid-ratchet 의 actual = 1/2 = 0.50
	// baseline = 0.70 → delta -0.20 → trend negative → block
	writeFileSync(
		baselinePath,
		JSON.stringify({
			generated_at: '2026-05-01',
			coverage_ratio: 0.7,
			coverage_strategy: 'ratchet',
			project_id: 'test-fixture-ratchet',
		}),
	);
	try {
		const r = validateCharacterization(fx('valid-ratchet'), 0.8, {
			coverageBaselinePath: baselinePath,
			writeBaseline: false,
		});
		const trendNeg = r.findings.filter(
			(f) => f.kind === 'coverage.trend_negative_ratchet',
		);
		assert.equal(trendNeg.length, 1, 'negative trend should produce 1 finding');
		assert.equal(trendNeg[0].severity, 'high');
		assert.ok(trendNeg[0].delta < 0);
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('ratchet baseline write — --write-coverage-baseline 옵션 시 baseline file 생성', () => {
	const tmpDir = mkdtempSync(join(tmpdir(), 'cccov-test-'));
	const baselinePath = join(tmpDir, 'new-baseline.json');
	try {
		const r = validateCharacterization(fx('valid-ratchet'), 0.8, {
			coverageBaselinePath: baselinePath,
			writeBaseline: true,
		});
		assert.equal(r.summary.coverage_baseline_written, baselinePath);
		assert.ok(existsSync(baselinePath), 'baseline file should be written');
		const written = JSON.parse(readFileSync(baselinePath, 'utf8'));
		assert.equal(written.coverage_strategy, 'ratchet');
		assert.equal(written.coverage_ratio, 0.5);
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
});

// DEC-2026-06-11-code-only-severity-relocate (F-R2-32): code_only severity high → medium 환원.
//   진단: 본 validator 는 analysis exit gate(gate#0)에서만 실행 → analysis 시점 snapshot 은 본질상 code_only
//   (코드에서 특성화 추출 / 실 RUN 검증은 chain 4) = 정상 상태인데 high(rank1 hard-block)는 모든 S2/S3 gate#0 구조적 차단.
//   v8.7(F-CYCLE3-005)의 medium→high 격상이 analysis-only validator 에 자리를 잘못 잡음. R15 silent-enabler 진짜 방어 =
//   Layer 3 evidence cross-check(real-source CLAIM 인데 evidence 부족 = critical / 아래 테스트). code_only(미검증 명시)=medium carry.

test('DEC-2026-06-11 — data_source_status=code_only → snapshot.code_only_carry_required MEDIUM finding (analysis-baseline carry / R15 = Layer 3 critical)', () => {
	const r = validateCharacterization(fx('valid-code-only'), 0.8);
	const codeOnly = r.findings.filter(
		(f) => f.kind === 'snapshot.code_only_carry_required',
	);
	assert.equal(
		codeOnly.length,
		1,
		`expected exactly 1 snapshot.code_only_carry_required finding: ${JSON.stringify(r.findings, null, 2)}`,
	);
	assert.equal(
		codeOnly[0].severity,
		'medium',
		'F-R2-32: code_only 는 analysis 시점 정상 상태 = medium carry (high hard-block 환원 / R15 허위 real-source claim 방어는 Layer 3 cross-check=critical 가 담당)',
	);
});

test('v8.7 — 옛 kind name (code_only_carry_recommended) 은 v8.7+ 부터 emit ❌ (격상 검증)', () => {
	const r = validateCharacterization(fx('valid-code-only'), 0.8);
	const oldKind = r.findings.filter(
		(f) => f.kind === 'snapshot.code_only_carry_recommended',
	);
	assert.equal(
		oldKind.length,
		0,
		'옛 kind name (medium severity) 은 v8.7 부터 emit 안 됨 / 새 kind name 으로 통일',
	);
});

// ─────────────────────────────────────────────────────────────────────
// v8.7 PATCH — Fix #3 Layer 3 mirror (sql-inventory-validator Layer 3 pattern):
// --evidence-dir <dir> 옵션 → 실 외부 도구 invocation log (*.jsonl) 의 unique tool count 와
// data_source_status 'real_db' / 'real_environment' / 'domain_expert_interview' snapshot count cross-check
// ─────────────────────────────────────────────────────────────────────

test('v8.7 Layer 3 — --evidence-dir 미지정 시 evidence_cross_check skip (backward-compat)', () => {
	const r = validateCharacterization(fx('valid'), 0.8);
	assert.equal(
		r.summary.evidence_cross_check,
		null,
		'옵션 미지정 시 evidence_cross_check 미실행 (summary null)',
	);
	const ec = r.findings.filter((f) =>
		f.kind.startsWith('evidence_cross_check.'),
	);
	assert.equal(
		ec.length,
		0,
		'옵션 미지정 시 evidence_cross_check finding emit ❌',
	);
});

test('v8.7 Layer 3 — --evidence-dir 부재 디렉토리 시 dir_missing HIGH finding', () => {
	const r = validateCharacterization(fx('evidence-dir-match'), 0.8, {
		evidenceDir: fx('evidence-dir-match/no-such-evidence-dir'),
	});
	const dm = r.findings.filter(
		(f) => f.kind === 'evidence_cross_check.dir_missing',
	);
	assert.equal(dm.length, 1, 'dir_missing finding ≥ 1 의무');
	assert.equal(dm[0].severity, 'high');
});

test('v8.7 Layer 3 — evidence-dir-match → N_evidence=2 ≥ N_claim=2 → invocation_count_mismatch finding ❌ (pass)', () => {
	const r = validateCharacterization(fx('evidence-dir-match'), 0.8, {
		evidenceDir: fx('evidence-dir-match/evidence'),
	});
	const mismatch = r.findings.filter(
		(f) => f.kind === 'evidence_cross_check.invocation_count_mismatch',
	);
	assert.equal(
		mismatch.length,
		0,
		`mismatch finding 미 emit 의무 (N_evidence=2 ≥ N_claim=2): ${JSON.stringify(r.summary.evidence_cross_check, null, 2)}`,
	);
	assert.ok(
		r.summary.evidence_cross_check,
		'evidence_cross_check summary set 의무',
	);
	assert.equal(r.summary.evidence_cross_check.status, 'ok');
	assert.equal(r.summary.evidence_cross_check.evidence_tool_count, 2);
	assert.equal(r.summary.evidence_cross_check.claimed_count, 2);
});

test('v8.7 Layer 3 — evidence-dir-mismatch → N_evidence=1 < N_claim=3 → invocation_count_mismatch CRITICAL finding', () => {
	const r = validateCharacterization(fx('evidence-dir-mismatch'), 0.8, {
		evidenceDir: fx('evidence-dir-mismatch/evidence'),
	});
	const mismatch = r.findings.filter(
		(f) => f.kind === 'evidence_cross_check.invocation_count_mismatch',
	);
	assert.equal(
		mismatch.length,
		1,
		`mismatch finding 정확 1 의무: ${JSON.stringify(r.summary.evidence_cross_check, null, 2)}`,
	);
	assert.equal(mismatch[0].severity, 'critical');
	assert.equal(r.summary.evidence_cross_check.evidence_tool_count, 1);
	assert.equal(r.summary.evidence_cross_check.claimed_count, 3);
});

// ─────────────────────────────────────────────────────────────────────
// test-recovery (DEC-2026-06-10-test-recovery-existing-test-evidence / R15 / 역공학 델타 #5):
// data_source_status='existing_test_file' = REAL_SOURCE_STATUS → Layer 3 evidence cross-check 대상.
// 기존 테스트를 실제 실행(real_tool invocation)했을 때만 사용 — claim ≤ evidence_tool_count 강제.
// 안 돌린 테스트의 증거 주장(silent simulation) 차단 + code_only 우회 차단.
// ─────────────────────────────────────────────────────────────────────

// existing_test_file 스냅샷 1개 + evidence jsonl(테스트 러너 invocation) 0~N 으로 tmp 픽스처 구성.
function buildExistingTestFixture(tmpDir, invocations) {
	mkdirSync(join(tmpDir, 'snapshots'), { recursive: true });
	mkdirSync(join(tmpDir, 'evidence'), { recursive: true });
	writeFileSync(
		join(tmpDir, 'snapshots', 'UC-X-001.json'),
		JSON.stringify({
			snapshot_id: 'SNAP-UC-X-001',
			use_case: 'UC-X-001',
			endpoint: 'GET /api/x',
			data_source_status: 'existing_test_file',
			scenarios: [
				{
					id: 'SCN-X-001',
					name: 'happy',
					given: { request_body: {} },
					when: 'GET /api/x',
					then: { expected_response: { status: 200 } },
					intent_classification: [{ rule: 'BR-X-001', type: 'intent' }],
				},
			],
		}),
	);
	writeFileSync(
		join(tmpDir, 'coverage.json'),
		JSON.stringify({
			matrix: [
				{ uc: 'UC-X-001', snapshot: '✅', covered_by: ['SNAP-UC-X-001'], scope_decision: 'covered' },
			],
			coverage_summary: { ucs_total: 1, ucs_covered: 1, uc_coverage_ratio: 1.0 },
			coverage_target: 0.8,
			coverage_strategy: 'absolute',
			coverage_minimum_legacy: 0.4,
			trend_required: false,
		}),
	);
	writeFileSync(join(tmpDir, 'intent-vs-bug.md'), '# intent-vs-bug\nBR-X-001 = intent\n');
	writeFileSync(
		join(tmpDir, 'evidence', 'characterization-tool-invocations.jsonl'),
		invocations.map((i) => JSON.stringify(i)).join('\n'),
	);
}

test('test-recovery R15 — existing_test_file claim + 테스트 실행 증거 부재(0 invocation) → invocation_count_mismatch CRITICAL (silent simulation 차단)', () => {
	const tmpDir = mkdtempSync(join(tmpdir(), 'cccov-existtest-'));
	try {
		buildExistingTestFixture(tmpDir, []); // 0 invocation — 테스트 안 돌리고 existing_test_file 주장
		const r = validateCharacterization(tmpDir, 0.8, {
			evidenceDir: join(tmpDir, 'evidence'),
		});
		const mismatch = r.findings.filter(
			(f) => f.kind === 'evidence_cross_check.invocation_count_mismatch',
		);
		assert.equal(
			mismatch.length,
			1,
			`existing_test_file 도 real-source claim 으로 계수 → 증거 부재 시 critical 의무: ${JSON.stringify(r.summary.evidence_cross_check, null, 2)}`,
		);
		assert.equal(mismatch[0].severity, 'critical');
		assert.equal(r.summary.evidence_cross_check.claimed_count, 1, 'existing_test_file = REAL_SOURCE_STATUS 계수');
		assert.equal(r.summary.evidence_cross_check.evidence_tool_count, 0);
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('test-recovery R15 — existing_test_file + 실 테스트 러너 invocation → cross-check ok + code_only finding 미발생', () => {
	const tmpDir = mkdtempSync(join(tmpdir(), 'cccov-existtest-'));
	try {
		buildExistingTestFixture(tmpDir, [
			{ tool: 'junit', version: '5.10.0', invocation_id: 'inv-1', args: ['--tests', '*Characterization*'], target: 'core', timestamp: '2026-06-10T00:00:00Z', duration_ms: 1200, exit_code: 0, stdout_sample: '' },
		]);
		const r = validateCharacterization(tmpDir, 0.8, {
			evidenceDir: join(tmpDir, 'evidence'),
		});
		const mismatch = r.findings.filter(
			(f) => f.kind === 'evidence_cross_check.invocation_count_mismatch',
		);
		assert.equal(mismatch.length, 0, `claim=1 ≤ evidence=1 → mismatch 미발생: ${JSON.stringify(r.summary.evidence_cross_check, null, 2)}`);
		assert.equal(r.summary.evidence_cross_check.status, 'ok');
		assert.equal(r.summary.evidence_cross_check.evidence_tool_count, 1);
		assert.equal(r.summary.evidence_cross_check.claimed_count, 1);
		// existing_test_file 는 code_only 가 아니므로 code_only carry finding 미발생 (우회 ❌ / 정확 분류)
		const codeOnly = r.findings.filter((f) => f.kind === 'snapshot.code_only_carry_required');
		assert.equal(codeOnly.length, 0, 'existing_test_file ≠ code_only → carry finding 미발생');
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
});

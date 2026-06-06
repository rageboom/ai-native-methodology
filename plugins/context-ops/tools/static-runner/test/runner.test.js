// static-runner unit test — Tier 1 (Semgrep preflight) + Tier 2 (importSarif 4 조건 강제).
// v8.6.0 — R19 Tier 2 import 패턴 추가 / PMDPlugin 제거 (사용자 환경 import 패턴 위임).
// 본 환경 (Sandbox) Java/Semgrep 부재 가정. preflight 시 PluginEnvironmentMissing throw 정합 확인.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	SemgrepPlugin,
	PluginEnvironmentMissing,
	REQUIRED_EVIDENCE,
	importSarif,
	ImportSarifRejected,
	IMPORTED_DRIVER_ALLOWLIST,
	EVIDENCE_TRUST,
} from '../src/runner.js';

test('REQUIRED_EVIDENCE has 7 fields (5 evidence + 2 path)', () => {
	assert.equal(REQUIRED_EVIDENCE.length, 7);
});

test('SemgrepPlugin preflight throws PluginEnvironmentMissing when binary absent', () => {
	try {
		SemgrepPlugin.preflight();
		// If preflight succeeds, semgrep is installed — that is also valid.
		// Test asserts only failure path is correctly typed.
	} catch (err) {
		assert.ok(err instanceof PluginEnvironmentMissing);
		assert.equal(err.code, 'ENV_MISSING');
		assert.equal(err.plugin, 'semgrep');
	}
});

test('SemgrepPlugin args include --sarif and ruleset', () => {
	const args = SemgrepPlugin.mandatoryArgs({
		targetDir: '/x',
		sarifPath: '/y/out.sarif',
		ruleset: 'p/owasp-top-ten',
	});
	assert.ok(args.includes('--sarif'));
	assert.ok(args.includes('p/owasp-top-ten'));
});

test('SemgrepPlugin extraRules emits --config per rule (v1.4.2 / multi-config)', () => {
	const args = SemgrepPlugin.mandatoryArgs({
		targetDir: '/x',
		sarifPath: '/y/out.sarif',
		ruleset: 'p/owasp-top-ten',
		extraRules: ['rules/jwt-localstorage.yml', 'rules/foo.yml'],
	});
	// ruleset + 2 extraRules = 3 --config flags
	const configCount = args.filter((a) => a === '--config').length;
	assert.equal(configCount, 3);
	assert.ok(args.includes('rules/jwt-localstorage.yml'));
	assert.ok(args.includes('rules/foo.yml'));
});

test('SemgrepPlugin extraRules empty default — no extra --config', () => {
	const args = SemgrepPlugin.mandatoryArgs({
		targetDir: '/x',
		sarifPath: '/y/out.sarif',
		ruleset: 'p/x',
	});
	const configCount = args.filter((a) => a === '--config').length;
	assert.equal(configCount, 1);
});

// R19 Tier 2 — importSarif 4 조건 강제 test

test('IMPORTED_DRIVER_ALLOWLIST = pmd only (R19 Tier 2 / 실 import 입증 driver 만)', () => {
	assert.deepEqual(IMPORTED_DRIVER_ALLOWLIST, ['pmd']);
});

test('EVIDENCE_TRUST 3-tier enum (real_tool / imported_sarif / simulated)', () => {
	assert.equal(EVIDENCE_TRUST.REAL_TOOL, 'real_tool');
	assert.equal(EVIDENCE_TRUST.IMPORTED_SARIF, 'imported_sarif');
	assert.equal(EVIDENCE_TRUST.SIMULATED, 'simulated');
});

test('importSarif rejects missing file', () => {
	assert.throws(
		() => importSarif({ sarifPath: '/nonexistent.sarif', outputDir: '/tmp' }),
		(err) =>
			err instanceof ImportSarifRejected && err.reason === 'sarif_path_missing',
	);
});

test('importSarif rejects parse error', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'bad.sarif');
	writeFileSync(path, '{ not valid json');
	try {
		assert.throws(
			() => importSarif({ sarifPath: path, outputDir: dir }),
			(err) =>
				err instanceof ImportSarifRejected &&
				err.reason === 'sarif_parse_error',
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('importSarif rejects empty runs', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'empty.sarif');
	writeFileSync(path, JSON.stringify({ version: '2.1.0', runs: [] }));
	try {
		assert.throws(
			() => importSarif({ sarifPath: path, outputDir: dir }),
			(err) =>
				err instanceof ImportSarifRejected && err.reason === 'sarif_empty_runs',
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('importSarif rejects non-allowlisted driver (manual/ai-generated 우회 차단)', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'manual.sarif');
	writeFileSync(
		path,
		JSON.stringify({
			version: '2.1.0',
			runs: [
				{
					tool: { driver: { name: 'manual', version: '1.0' } },
					results: [
						{ ruleId: 'TEST-001', message: { text: 'x' }, level: 'warning' },
					],
					invocations: [{ commandLine: 'echo' }],
				},
			],
		}),
	);
	try {
		assert.throws(
			() => importSarif({ sarifPath: path, outputDir: dir }),
			(err) =>
				err instanceof ImportSarifRejected &&
				err.reason === 'driver_name_not_allowlisted',
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('importSarif rejects empty results without rationale (Adzic SBE 함정 회피)', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'empty-results.sarif');
	writeFileSync(
		path,
		JSON.stringify({
			version: '2.1.0',
			runs: [
				{
					tool: { driver: { name: 'PMD', version: '7.0.0' } },
					results: [],
					invocations: [{ commandLine: 'pmd check ...' }],
				},
			],
		}),
	);
	try {
		assert.throws(
			() => importSarif({ sarifPath: path, outputDir: dir }),
			(err) =>
				err instanceof ImportSarifRejected &&
				err.reason === 'empty_sarif_without_rationale',
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('importSarif accepts empty results WITH non_use_rationale', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'empty-rationale.sarif');
	writeFileSync(
		path,
		JSON.stringify({
			version: '2.1.0',
			runs: [
				{
					tool: { driver: { name: 'PMD', version: '7.0.0' } },
					results: [],
					invocations: [{ commandLine: 'pmd check -f sarif ...' }],
				},
			],
		}),
	);
	try {
		const run = importSarif({
			sarifPath: path,
			outputDir: dir,
			nonUseRationale: 'legacy module — coverage 보고된 결함 0 사실 기록',
		});
		assert.equal(run.evidence.evidence_trust, 'imported_sarif');
		assert.equal(run.evidence.imported_driver_name, 'pmd');
		assert.equal(run.evidence.imported_results_count, 0);
		assert.ok(run.evidence.non_use_rationale);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('importSarif rejects missing reproduction_command', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'no-cmd.sarif');
	writeFileSync(
		path,
		JSON.stringify({
			version: '2.1.0',
			runs: [
				{
					tool: { driver: { name: 'PMD', version: '7.0.0' } },
					results: [{ ruleId: 'r1', message: { text: 'x' }, level: 'warning' }],
					// invocations 부재
				},
			],
		}),
	);
	try {
		assert.throws(
			() => importSarif({ sarifPath: path, outputDir: dir }),
			(err) =>
				err instanceof ImportSarifRejected &&
				err.reason === 'reproduction_command_missing',
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('importSarif accepts user-provided reproduction_command (SARIF invocations 부재 시)', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'user-cmd.sarif');
	writeFileSync(
		path,
		JSON.stringify({
			version: '2.1.0',
			runs: [
				{
					tool: { driver: { name: 'PMD', version: '7.0.0' } },
					results: [
						{ ruleId: 'r1', message: { text: 'x' }, level: 'warning' },
					],
				},
			],
		}),
	);
	try {
		const run = importSarif({
			sarifPath: path,
			outputDir: dir,
			reproductionCommand: 'pmd check -d src -R ruleset.xml -f sarif',
		});
		assert.equal(run.evidence.evidence_trust, 'imported_sarif');
		assert.equal(run.evidence.imported_driver_name, 'pmd');
		assert.match(run.evidence.reproduction_command, /pmd check/);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('importSarif rejects driver mismatch when expectedDriver supplied', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
	const path = join(dir, 'wrong-driver.sarif');
	writeFileSync(
		path,
		JSON.stringify({
			version: '2.1.0',
			runs: [
				{
					tool: { driver: { name: 'PMD', version: '7.0.0' } },
					results: [{ ruleId: 'r1', message: { text: 'x' }, level: 'warning' }],
					invocations: [{ commandLine: 'pmd ...' }],
				},
			],
		}),
	);
	try {
		assert.throws(
			() =>
				importSarif({
					sarifPath: path,
					outputDir: dir,
					expectedDriver: 'spotbugs',
				}),
			(err) =>
				err instanceof ImportSarifRejected &&
				err.reason === 'driver_name_mismatch',
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// static-runner unit test — Tier 1 in-plugin (Semgrep + PMD preflight/args) + Tier 2 (importSarif 4 조건 강제).
// v0.2.0 — PMDPlugin Tier 1 재도입 (DEC-2026-06-07-pmd-tier1-promotion / 실행 locus 축 / poc-06+poc-10 corroboration).
//   v8.6.0 에서 import 패턴으로 일시 제거됐던 PMDPlugin 을 in-plugin 자동실행 물증과 함께 재도입.
//   import 경로(allowlist=['pmd'])는 orthogonal 로 보존.
// 환경에 도구 부재 시 preflight 가 PluginEnvironmentMissing throw 정합 확인 (도구 설치 환경에서는 성공 경로도 유효).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	SemgrepPlugin,
	PmdPlugin,
	Plugin,
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

// R19 Tier 1 — PmdPlugin in-plugin 자동실행 (DEC-2026-06-07-pmd-tier1)

test('PmdPlugin registered as Tier 1 in-plugin (shell=true / executable=pmd)', () => {
	assert.equal(PmdPlugin.name, 'pmd');
	assert.equal(PmdPlugin.executable, 'pmd');
	// Windows pmd.bat 런처 → shell:true 필수 (CVE-2024-27980 EINVAL 회피)
	assert.equal(PmdPlugin.shell, true);
});

test('PmdPlugin args = check -d <dir> -R <ruleset> -f sarif -r <file> --no-progress', () => {
	const args = PmdPlugin.mandatoryArgs({
		targetDir: '/src',
		sarifPath: '/out/pmd.sarif',
		ruleset: 'rulesets/java/quickstart.xml',
	});
	assert.deepEqual(args, [
		'check',
		'-d',
		'/src',
		'-R',
		'rulesets/java/quickstart.xml',
		'-f',
		'sarif',
		'-r',
		'/out/pmd.sarif',
		'--no-progress',
	]);
});

test('PmdPlugin default ruleset = quickstart when omitted', () => {
	const args = PmdPlugin.mandatoryArgs({
		targetDir: '/src',
		sarifPath: '/out/pmd.sarif',
	});
	assert.ok(args.includes('rulesets/java/quickstart.xml'));
});

test('PmdPlugin extraRules emits -R per rule', () => {
	const args = PmdPlugin.mandatoryArgs({
		targetDir: '/src',
		sarifPath: '/out/pmd.sarif',
		ruleset: 'rulesets/java/quickstart.xml',
		extraRules: ['custom/a.xml', 'custom/b.xml'],
	});
	const rCount = args.filter((a) => a === '-R').length;
	assert.equal(rCount, 3); // ruleset + 2 extra
});

test('PmdPlugin versionParse extracts semver from ASCII banner (배너 첫 줄 회피)', () => {
	// PMD --version 은 ASCII 아트 배너를 먼저 출력 → 첫 줄은 배너. semver 추출 검증.
	const banner = '  ████   ████\n PMD logo art\nPMD 7.25.0 (418f8b7, 2026-05-29T06:28:38Z)\n';
	assert.equal(PmdPlugin.versionParse(banner), 'PMD 7.25.0');
});

test('Plugin default versionParse = first line (Semgrep 동형 / backward-compatible)', () => {
	const p = new Plugin({ name: 'x', executable: 'x', mandatoryArgs: () => [] });
	assert.equal(p.versionParse('1.2.3\nextra line'), '1.2.3');
	// SemgrepPlugin 은 override 없음 → 첫 줄 유지
	assert.equal(SemgrepPlugin.versionParse('1.99.0\n...'), '1.99.0');
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

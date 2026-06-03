// Sprint 5+ Phase D — static-runner SARIF → finding 어댑터 + baseline-ratchet 회귀.
// 본 환경 Semgrep 부재 가정. fixture SARIF 파일로 어댑터/baseline 회귀만 검증.
// v8.6.0 — Tier 2 import 결과 SARIF 도 동일 어댑터 통과 정합.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
	sarifResultToFinding,
	readSarifFindings,
} from '../src/sarif-to-finding.js';
import {
	fingerprint,
	writeBaseline,
	readBaseline,
	classifyAgainstBaseline,
	ratchetCheck,
} from '../../_shared/baseline.js';

const FIXTURE_SARIF = {
	version: '2.1.0',
	runs: [
		{
			tool: { driver: { name: 'semgrep' } },
			results: [
				{
					ruleId: 'java.lang.security.audit.command-injection',
					level: 'error',
					message: {
						text: 'Command injection vulnerability — untrusted input flows to ProcessBuilder',
					},
					locations: [
						{
							physicalLocation: {
								artifactLocation: { uri: 'src/Main.java' },
								region: { startLine: 42 },
							},
						},
					],
				},
				{
					ruleId: 'java.lang.maintainability.unused-import',
					level: 'warning',
					message: { text: 'Unused import' },
					locations: [
						{
							physicalLocation: {
								artifactLocation: { uri: 'src/Util.java' },
								region: { startLine: 5 },
							},
						},
					],
				},
			],
		},
	],
};

test('sarifResultToFinding maps level=error → severity=breaking', () => {
	const f = sarifResultToFinding(
		FIXTURE_SARIF.runs[0].results[0],
		0,
		'semgrep',
	);
	assert.equal(f.severity, 'breaking');
	assert.equal(f.kind, 'java.lang.security.audit.command-injection');
	assert.equal(f.file, 'src/Main.java');
	assert.equal(f.line, 42);
	assert.equal(f.plugin, 'semgrep');
});

test('sarifResultToFinding maps level=warning → severity=medium', () => {
	const f = sarifResultToFinding(
		FIXTURE_SARIF.runs[0].results[1],
		0,
		'semgrep',
	);
	assert.equal(f.severity, 'medium');
	assert.equal(f.kind, 'java.lang.maintainability.unused-import');
});

test('readSarifFindings parses 2 findings from fixture', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sarif-fixture-'));
	const path = join(dir, 'fixture.sarif');
	try {
		writeFileSync(path, JSON.stringify(FIXTURE_SARIF));
		const findings = readSarifFindings(path);
		assert.equal(findings.length, 2);
		assert.equal(findings[0].plugin, 'semgrep'); // driver.name 자동 detect
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('static-runner finding fingerprint — kind+file+line 결정성', () => {
	const f1 = sarifResultToFinding(
		FIXTURE_SARIF.runs[0].results[0],
		0,
		'semgrep',
	);
	const f2 = sarifResultToFinding(
		FIXTURE_SARIF.runs[0].results[0],
		0,
		'semgrep',
	);
	assert.equal(fingerprint(f1), fingerprint(f2));
	assert.equal(fingerprint(f1).length, 16);
});

test('static-runner ratchet — breaking 신규 1건 → 차단 / fix 시 baseline grandfathered', () => {
	const dir = mkdtempSync(join(tmpdir(), 'static-baseline-'));
	const path = join(dir, 'baseline.json');
	try {
		const oldFindings = [
			sarifResultToFinding(FIXTURE_SARIF.runs[0].results[1], 0, 'semgrep'), // unused-import / medium
		];
		writeBaseline(path, oldFindings);
		const baseline = readBaseline(path);

		const newFindings = [
			...oldFindings,
			sarifResultToFinding(FIXTURE_SARIF.runs[0].results[0], 0, 'semgrep'), // command-injection / breaking 신규
		];
		const classified = classifyAgainstBaseline(newFindings, baseline);
		assert.equal(classified.grandfathered.length, 1);
		assert.equal(classified.novel.length, 1);

		const check = ratchetCheck(classified);
		assert.equal(check.blocked_count, 1, 'breaking severity 신규 차단 의무');
		assert.equal(check.pass, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

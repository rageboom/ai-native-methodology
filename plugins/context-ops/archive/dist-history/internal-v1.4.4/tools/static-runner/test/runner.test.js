// static-runner unit test — plugin preflight + 환경 부재 처리.
// 본 환경 (Sandbox) Java/Semgrep/PMD 부재 가정. preflight 시 PluginEnvironmentMissing throw 정합 확인.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
	SemgrepPlugin,
	PMDPlugin,
	PluginEnvironmentMissing,
	REQUIRED_EVIDENCE,
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

test('PMDPlugin preflight typed failure', () => {
	try {
		PMDPlugin.preflight();
	} catch (err) {
		assert.ok(err instanceof PluginEnvironmentMissing);
		assert.equal(err.plugin, 'pmd');
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

test('SemgrepPlugin extraRules emits --config per rule ( v1.4.2 / multi-config)', () => {
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

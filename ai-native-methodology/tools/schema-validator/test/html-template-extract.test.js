// html-template-extract.schema.json (v3.4.0 G4 / analysis-html-template 산출 schema) registration + 정합 test.

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

function tmp() {
	return mkdtempSync(join(tmpdir(), 'sv-html-template-extract-'));
}
function runCli(target) {
	const r = spawnSync(
		'node',
		[CLI, target, '--schema-dir', SCHEMA_DIR, '--json'],
		{ encoding: 'utf-8' },
	);
	return { parsed: r.stdout ? JSON.parse(r.stdout) : null };
}

function validInstance() {
	return {
		$schema_origin: '../../schemas/html-template-extract.schema.json',
		scope: 'legacy-jsp-app',
		created_at: '2026-05-15T10:00:00Z',
		scenario: 'C',
		template_engine: 'jsp',
		templates: [
			{
				path: 'src/main/webapp/WEB-INF/views/user/list.jsp',
				engine: 'jsp',
				includes: ['common/header.jsp', 'common/footer.jsp'],
				form_actions: [
					{
						action_url: '/user/list',
						method: 'post',
						hardcoded: true,
						spring_endpoint_ref: 'UserController.list',
					},
				],
			},
		],
		external_tool_output: {
			tool: 'sonarqube',
			executed: true,
			tool_version: '10.4.1',
			command_line:
				'sonar-scanner -Dsonar.projectKey=legacy-jsp-app -Dsonar.sources=src/main/webapp',
			output_path: '.aimd/legacy-jsp-app/planning/sonar-output.json',
			exit_code: 0,
		},
		scriptlet_findings: [
			{
				rule_id: 'Web:JspScriptletCheck',
				severity: 'critical',
				file_path: 'src/main/webapp/WEB-INF/views/user/list.jsp',
				line: 42,
				message:
					'JSP scriptlets should not be used (JSP 2.0 deprecated paradigm)',
			},
		],
		xss_markers: [
			{
				file_path: 'src/main/webapp/WEB-INF/views/user/list.jsp',
				line: 78,
				pattern: 'jsp-expression',
				severity: 'major',
			},
		],
		policy_check: {
			scriptlet_zero_absolute: false,
			total_scriptlet_count: 1,
		},
	};
}

test('G4 — html-template-extract 정합 instance → valid', () => {
	const dir = tmp();
	try {
		writeFileSync(
			join(dir, 'html-template-extract.json'),
			JSON.stringify(validInstance()),
		);
		const r = runCli(join(dir, 'html-template-extract.json'));
		const result = r.parsed.results[0];
		assert.notEqual(result.schema_status, 'not-found');
		assert.equal(result.valid, true, JSON.stringify(result));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G4 — html-template-extract scenario enum (C 만) 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.scenario = 'A'; // 본 skill = C 전용
		writeFileSync(
			join(dir, 'html-template-extract.json'),
			JSON.stringify(inst),
		);
		const r = runCli(join(dir, 'html-template-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G4 — html-template-extract external_tool_output.executed required (no-simulation 의무) → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		delete inst.external_tool_output.executed;
		writeFileSync(
			join(dir, 'html-template-extract.json'),
			JSON.stringify(inst),
		);
		const r = runCli(join(dir, 'html-template-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G4 — html-template-extract scriptlet_findings.severity enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.scriptlet_findings[0].severity = 'blocker'; // enum 외 (critical/major/minor/info)
		writeFileSync(
			join(dir, 'html-template-extract.json'),
			JSON.stringify(inst),
		);
		const r = runCli(join(dir, 'html-template-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G4 — html-template-extract xss_markers.pattern enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.xss_markers[0].pattern = 'unknown-pattern';
		writeFileSync(
			join(dir, 'html-template-extract.json'),
			JSON.stringify(inst),
		);
		const r = runCli(join(dir, 'html-template-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

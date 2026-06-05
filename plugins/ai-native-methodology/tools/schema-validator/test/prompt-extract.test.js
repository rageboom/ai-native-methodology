// prompt-extract.schema.json (v3.3 G2 / analysis-from-prompt 산출 schema) registration + 정합 test.

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
	return mkdtempSync(join(tmpdir(), 'sv-prompt-extract-'));
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
		$schema_origin: '../../schemas/prompt-extract.schema.json',
		scope: 'user-mgmt',
		created_at: '2026-05-15T10:00:00Z',
		raw_prompt:
			'사용자 관리 + 권한 관리 기능을 만들어줘. 기존 auth 시스템과 연동되어야 해.',
		intent: {
			summary: '사용자 + 권한 관리 신규 기능 구축, 기존 auth 연동',
			action_verbs: ['만들다', '연동하다'],
			target_entities: ['사용자', '권한', 'auth 시스템'],
		},
		scope_inferred: {
			explicit: ['사용자 관리', '권한 관리'],
			implicit: ['auth 연동 영역'],
			confidence: 0.7,
		},
		constraints: [
			{
				type: 'integration',
				description: '기존 auth 시스템과 연동',
				source_quote: '기존 auth 시스템과 연동되어야 해.',
			},
		],
		assumptions: [
			{
				statement: '기존 auth 시스템은 동일 서비스 안 모듈로 존재',
				confidence: 0.5,
				user_confirmation_required: true,
			},
		],
		uc_candidates: [
			{ name: '사용자 관리', actors: ['Admin'], priority_hint: 'must' },
			{ name: '권한 관리', actors: ['Admin'], priority_hint: 'must' },
		],
	};
}

test('G2 — prompt-extract 정합 instance → valid', () => {
	const dir = tmp();
	try {
		writeFileSync(
			join(dir, 'prompt-extract.json'),
			JSON.stringify(validInstance()),
		);
		const r = runCli(join(dir, 'prompt-extract.json'));
		const result = r.parsed.results[0];
		assert.notEqual(result.schema_status, 'not-found');
		assert.equal(result.valid, true, JSON.stringify(result));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — prompt-extract required (intent) 누락 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		delete inst.intent;
		writeFileSync(join(dir, 'prompt-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'prompt-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — prompt-extract assumptions.confidence 범위 위반 (>1) → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.assumptions[0].confidence = 1.5;
		writeFileSync(join(dir, 'prompt-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'prompt-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — prompt-extract uc_candidates priority_hint enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.uc_candidates[0].priority_hint = 'critical'; // 'must/should/could/wont' 아님
		writeFileSync(join(dir, 'prompt-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'prompt-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — prompt-extract constraints.type enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.constraints[0].type = 'unknown-type';
		writeFileSync(join(dir, 'prompt-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'prompt-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// plan-doc-extract.schema.json (v3.3 G2 / analysis-from-plan-doc 산출 schema) registration + 정합 test.

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
	return mkdtempSync(join(tmpdir(), 'sv-plan-doc-extract-'));
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
		$schema_origin: '../../schemas/plan-doc-extract.schema.json',
		scope: 'user-mgmt',
		created_at: '2026-05-15T10:00:00Z',
		source: {
			path: './docs/user-mgmt-spec.md',
			format: 'markdown',
			file_count: 1,
		},
		intent_summary: '사용자 + 권한 관리 모듈 구축 / 기존 auth 연동',
		sections: [
			{
				heading: '1. 배경',
				level: 1,
				body_excerpt: '...',
				tables_count: 0,
				code_blocks_count: 0,
			},
			{
				heading: '2. 기능 목록',
				level: 1,
				body_excerpt: '- 사용자 CRUD\n- 권한 부여',
				tables_count: 1,
				code_blocks_count: 0,
			},
			{
				heading: '2.1 사용자 관리',
				level: 2,
				body_excerpt: '...',
				tables_count: 0,
				code_blocks_count: 0,
			},
		],
		uc_candidates: [
			{
				name: '사용자 CRUD',
				actors: ['Admin'],
				source_section: '2. 기능 목록',
				priority_hint: 'must',
			},
			{
				name: '권한 부여',
				actors: ['Admin'],
				source_section: '2. 기능 목록',
				priority_hint: 'must',
			},
		],
		glossary: [
			{
				term: 'RBAC',
				definition: 'Role-Based Access Control',
				source_section: '용어',
			},
		],
		csv_tables: [],
		asset_refs: [],
	};
}

test('G2 — plan-doc-extract 정합 instance → valid', () => {
	const dir = tmp();
	try {
		writeFileSync(
			join(dir, 'plan-doc-extract.json'),
			JSON.stringify(validInstance()),
		);
		const r = runCli(join(dir, 'plan-doc-extract.json'));
		const result = r.parsed.results[0];
		assert.notEqual(result.schema_status, 'not-found');
		assert.equal(result.valid, true, JSON.stringify(result));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — plan-doc-extract source.format enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.source.format = 'docx'; // 지원 외
		writeFileSync(join(dir, 'plan-doc-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'plan-doc-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — plan-doc-extract sections.level 범위 위반 (7) → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.sections[0].level = 7; // markdown H1~H6 까지만
		writeFileSync(join(dir, 'plan-doc-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'plan-doc-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — plan-doc-extract uc_candidates.source_section required → invalid (역추적 의무)', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		delete inst.uc_candidates[0].source_section;
		writeFileSync(join(dir, 'plan-doc-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'plan-doc-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — plan-doc-extract required (sections) 누락 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		delete inst.sections;
		writeFileSync(join(dir, 'plan-doc-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'plan-doc-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

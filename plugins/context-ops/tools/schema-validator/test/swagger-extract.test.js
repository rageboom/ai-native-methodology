// swagger-extract.schema.json (v3.3 G2 / analysis-from-swagger 산출 schema) registration + 정합 test.

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
	return mkdtempSync(join(tmpdir(), 'sv-swagger-extract-'));
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
		$schema_origin: '../../schemas/swagger-extract.schema.json',
		scope: 'user-mgmt',
		created_at: '2026-05-15T10:00:00Z',
		spec_source: {
			path_or_url: 'https://api.example.com/openapi.yaml',
			fetched_at: '2026-05-15T10:00:00Z',
			fetch_method: 'https',
		},
		spec_version: 'openapi-3.1',
		info: { title: 'User API', version: '1.0.0' },
		endpoints: [
			{
				path: '/api/users',
				method: 'get',
				operation_id: 'listUsers',
				responses: {
					200: { description: 'OK', schema_ref: 'UserList' },
				},
			},
			{
				path: '/api/users/{id}',
				method: 'patch',
				operation_id: 'updateUser',
				request_body_schema_ref: 'UserUpdateInput',
				responses: { 200: { description: 'OK', schema_ref: 'User' } },
			},
		],
		schemas: {
			User: {
				type: 'object',
				properties: {
					id: { type: 'string' },
					email: { type: 'string', format: 'email' },
				},
			},
			UserList: { type: 'array', items: { $ref: '#/components/schemas/User' } },
			UserUpdateInput: {
				type: 'object',
				properties: { email: { type: 'string' } },
			},
		},
		domain_seed: [
			{ entity_name: 'User', required_fields: ['id', 'email'], relations: [] },
		],
		rules_seed: [
			{
				candidate_id: 'BR-USER-EMAIL-FORMAT-001',
				constraint_type: 'format',
				source: 'User.email',
				value: 'email',
			},
		],
		validation_status: {
			parser_validated: true,
			spectral_invoked: false,
			parser_errors: [],
		},
	};
}

test('G2 — swagger-extract 정합 instance → valid', () => {
	const dir = tmp();
	try {
		writeFileSync(
			join(dir, 'swagger-extract.json'),
			JSON.stringify(validInstance()),
		);
		const r = runCli(join(dir, 'swagger-extract.json'));
		const result = r.parsed.results[0];
		assert.notEqual(result.schema_status, 'not-found');
		assert.equal(result.valid, true, JSON.stringify(result));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — swagger-extract spec_version enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.spec_version = 'openapi-4.0'; // 존재 안 함
		writeFileSync(join(dir, 'swagger-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'swagger-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — swagger-extract endpoint method enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.endpoints[0].method = 'CONNECT'; // enum 외
		writeFileSync(join(dir, 'swagger-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'swagger-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — swagger-extract rules_seed constraint_type enum 위반 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		inst.rules_seed[0].constraint_type = 'unknown';
		writeFileSync(join(dir, 'swagger-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'swagger-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('G2 — swagger-extract required (endpoints) 누락 → invalid', () => {
	const dir = tmp();
	try {
		const inst = validInstance();
		delete inst.endpoints;
		writeFileSync(join(dir, 'swagger-extract.json'), JSON.stringify(inst));
		const r = runCli(join(dir, 'swagger-extract.json'));
		assert.equal(r.parsed.results[0].valid, false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

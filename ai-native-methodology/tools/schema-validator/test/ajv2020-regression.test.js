// schema-validator 회귀 테스트 — F-V2-01 (Ajv 2020 meta-schema) + F-V2-02 (exit code 정합).
// 본 테스트는 v8.5.0+ fix branch (fix/v8.5.0-p0-findings) 정합.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import {
	readFileSync,
	writeFileSync,
	readdirSync,
	mkdirSync,
	rmSync,
	existsSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const SCHEMAS = resolve(__dirname, '../../../schemas');
const TMP = resolve(__dirname, '_tmp');

function runCli(args, opts = {}) {
	return spawnSync('node', [CLI, ...args], {
		encoding: 'utf-8',
		cwd: resolve(__dirname, '../..'),
		...opts,
	});
}

function ensureTmp() {
	if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	mkdirSync(TMP, { recursive: true });
}

test('F-V2-01 — 40 schemas 모두 Ajv 2020 로 정상 로드 (no "failed to load" stderr)', () => {
	ensureTmp();
	// valid 한 dummy 산출물 — schema 미발견으로 skip 되더라도 40 schema 사전 로드는 발생 (v12.0.0 migration-cautions.schema.json 추가)
	const dummy = join(TMP, 'dummy.json');
	writeFileSync(dummy, JSON.stringify({ foo: 'bar' }));
	const r = runCli([dummy]);
	// 본 fix 이전: stderr 에 "failed to load <schema>: no schema with key or ref ... 2020-12 ..." 39 라인.
	// 본 fix 이후: failed to load 0 라인 의무.
	const failedToLoad = (r.stderr || '').match(/failed to load/g) || [];
	assert.equal(
		failedToLoad.length,
		0,
		`Ajv 2020 fix 회귀: ${failedToLoad.length} 'failed to load' lines.\nstderr:\n${r.stderr}`,
	);
	rmSync(TMP, { recursive: true, force: true });
});

test('F-V2-02 — invalid instance → exit 1 (pipe masking 없이 pure exit)', () => {
	ensureTmp();
	const invalid = join(TMP, 'inventory.json');
	// inventory.schema 의 required = [meta, repo, stack] 모두 누락 → invalid
	writeFileSync(invalid, JSON.stringify({ foo: 'bar' }));
	const r = runCli([invalid]);
	assert.equal(
		r.status,
		1,
		`invalid instance 시 exit 1 의무 (실측 exit=${r.status}).\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}`,
	);
	rmSync(TMP, { recursive: true, force: true });
});

test('F-V2-02 — valid instance → exit 0', () => {
	ensureTmp();
	const valid = join(TMP, 'minimal-inventory.json');
	// inventory.schema 의 최소 required 만 채움
	writeFileSync(
		valid,
		JSON.stringify({
			meta: {
				generated_at: '2026-05-18T10:00:00+09:00',
				confidence: 0.9,
				inputs_used: ['source_code'],
			},
			repo: { name: 'test', total_files: 1 },
			stack: {},
		}),
	);
	const r = runCli([valid]);
	assert.equal(
		r.status,
		0,
		`valid instance 시 exit 0 의무 (실측 exit=${r.status}).\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}`,
	);
	rmSync(TMP, { recursive: true, force: true });
});

test('F-V2-01 — chain discovery~impl schema (discovery/behavior/acceptance/test/impl/traceability-matrix) 모두 로드 (v11.0.0 — planning-spec → discovery-spec rename)', () => {
	const schemaNames = [
		'discovery-spec.schema.json',
		'behavior-spec.schema.json',
		'acceptance-criteria.schema.json',
		'test-spec.schema.json',
		'impl-spec.schema.json',
		'traceability-matrix.schema.json',
	];
	for (const s of schemaNames) {
		assert.ok(existsSync(join(SCHEMAS, s)), `${s} 부재`);
	}
	ensureTmp();
	const dummy = join(TMP, 'dummy.json');
	writeFileSync(dummy, JSON.stringify({ foo: 'bar' }));
	const r = runCli([dummy]);
	const failures =
		(r.stderr || '').match(
			/failed to load (discovery-spec|behavior-spec|acceptance-criteria|test-spec|impl-spec|traceability-matrix)\.schema\.json/g,
		) || [];
	assert.equal(
		failures.length,
		0,
		`chain discovery~impl schema 로드 실패: ${failures.join(', ')}`,
	);
	rmSync(TMP, { recursive: true, force: true });
});

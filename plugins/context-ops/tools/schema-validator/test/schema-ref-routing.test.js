// schema-ref-routing.test.js — F4 fix (poc-18 dogfood) 회귀.
// 이전: schema-validator 가 $schema_origin/$schema 만 읽고 $schema_ref 미인식 →
//   db-schema 관습명 'schema.json' 은 schema.schema.json(부재) 으로 라우팅돼 silent SKIP(영구 미검증).
//   + db-schema.schema.json(additionalProperties:false) 이 $schema_ref 키를 허용 안 해 instance 가 invalid 였음.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

function runCli(target) {
	const r = spawnSync('node', [CLI, target, '--json'], { encoding: 'utf-8' });
	return JSON.parse(r.stdout);
}

const validDbSchema = {
	$schema_ref: 'db-schema.schema.json',
	meta: { generated_at: '2026-06-06T00:00:00Z', confidence: 0.9, inputs_used: ['orm'] },
	tables: [{ name: 'User', columns: [{ name: 'id', type: 'UUID', sources: ['orm'] }] }],
};

test('F4 — $schema_ref routes a non-matching filename to its schema (was silent skip)', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sv-ref-'));
	try {
		// 'arbitrary.json' → 파일명 라우팅이면 arbitrary.schema.json(부재)=SKIP. $schema_ref 로 db-schema 라우팅+검증되어야 함.
		const file = join(dir, 'arbitrary.json');
		writeFileSync(file, JSON.stringify(validDbSchema));
		const res = runCli(file).results[0];
		assert.equal(res.schema, 'db-schema.schema.json', '$schema_ref 로 라우팅 (not skipped)');
		assert.equal(res.valid, true, 'db-schema 검증 통과');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('F4 — db-schema instance carrying $schema_ref stays schema-valid (key 허용)', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sv-ref2-'));
	try {
		const file = join(dir, 'db-schema.json');
		writeFileSync(file, JSON.stringify(validDbSchema));
		const res = runCli(file).results[0];
		assert.equal(res.valid, true, '$schema_ref 키가 additionalProperties:false 를 위반하지 않음');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

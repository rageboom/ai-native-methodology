#!/usr/bin/env node
/**
 * schema-validator — JSON Schema 검증 도구 (v1.4 Stage 5 Sprint 5-3 Phase B 신설)
 *
 * 사용:
 *   node src/cli.js <file.json> [--schema <schema.json>]
 *   node src/cli.js <dir>                                # 디렉토리 재귀 + 자동 schema 매칭 (본 방법론 schemas/)
 *   node src/cli.js <dir> --schema-dir <schemas-dir>
 *   node src/cli.js <dir> --json
 *
 * 자동 schema 매칭:
 *   - 파일 root 의 $schema_origin 또는 $schema 키 read
 *   - 또는 파일명 패턴 (form-validation-spec.json → form-validation-spec.schema.json)
 *
 * exit code: 0 (모두 통과) / 1 (위반 ≥ 1) / 2 (usage error).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SCHEMA_DIR = resolve(__dirname, '../../../schemas');

function getArgValue(args, name) {
	const idx = args.indexOf(name);
	if (idx === -1) return null;
	return args[idx + 1];
}

function findJsonFiles(dir) {
	const files = [];
	const stack = [dir];
	while (stack.length) {
		const cur = stack.pop();
		let entries;
		try {
			entries = readdirSync(cur);
		} catch {
			continue;
		}
		for (const name of entries) {
			const full = join(cur, name);
			let st;
			try {
				st = statSync(full);
			} catch {
				continue;
			}
			if (st.isDirectory()) {
				if (
					name === 'node_modules' ||
					name.startsWith('.') ||
					name === 'INPUT' ||
					name === '_tools'
				)
					continue;
				stack.push(full);
				continue;
			}
			if (extname(name) === '.json' && !name.includes('package')) {
				files.push(full);
			}
		}
	}
	return files;
}

function inferSchemaName(jsonFile, jsonContent) {
	// 1) $schema_origin 키 (본 방법론 패턴)
	if (jsonContent.$schema_origin) {
		const m = jsonContent.$schema_origin.match(/([a-z0-9-]+\.schema\.json)/i);
		if (m) return m[1];
	}
	if (jsonContent.$schema) {
		const m = jsonContent.$schema.match(/([a-z0-9-]+\.schema\.json)/i);
		if (m) return m[1];
	}
	// 2) 파일명 패턴
	const base = basename(jsonFile, '.json');
	return `${base}.schema.json`;
}

function main() {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		console.error(
			'usage: schema-validator <file-or-dir> [--schema <schema.json>] [--schema-dir <dir>] [--json]',
		);
		process.exit(2);
	}

	const target = args[0];
	const explicitSchema = getArgValue(args, '--schema');
	const schemaDir = getArgValue(args, '--schema-dir') ?? DEFAULT_SCHEMA_DIR;
	const jsonOutput = args.includes('--json');

	// Ajv setup — Ajv 2020 (draft 2020-12 meta-schema 명시 import)
	// 모든 schemas/*.schema.json 가 "$schema": "https://json-schema.org/draft/2020-12/schema" 사용 (F-V2-01 fix)
	const ajv = new Ajv2020({
		allErrors: true,
		strict: false,
		allowUnionTypes: true,
	});
	addFormats(ajv);

	// Pre-load all schemas in dir for $ref resolution
	if (existsSync(schemaDir)) {
		for (const f of readdirSync(schemaDir)) {
			if (extname(f) === '.json' && f.endsWith('.schema.json')) {
				try {
					const schema = JSON.parse(readFileSync(join(schemaDir, f), 'utf-8'));
					if (schema.$id) {
						ajv.addSchema(schema, schema.$id);
					} else {
						ajv.addSchema(schema, f);
					}
				} catch (err) {
					if (!jsonOutput)
						console.error(
							`[schema-validator] failed to load ${f}: ${err.message}`,
						);
				}
			}
		}
	}

	let files = [];
	let st;
	try {
		st = statSync(target);
	} catch {
		console.error(`path not found: ${target}`);
		process.exit(2);
	}
	if (st.isDirectory()) files = findJsonFiles(target);
	else files = [target];

	const results = [];
	for (const file of files) {
		let json;
		try {
			json = JSON.parse(readFileSync(file, 'utf-8'));
		} catch (err) {
			results.push({
				file,
				error: `JSON parse error: ${err.message}`,
				valid: false,
			});
			continue;
		}
		const schemaName = explicitSchema ?? inferSchemaName(file, json);
		const schemaPath = explicitSchema
			? resolve(explicitSchema)
			: join(schemaDir, schemaName);

		if (!existsSync(schemaPath)) {
			results.push({
				file,
				schema: schemaName,
				schema_status: 'not-found',
				valid: null,
				note: 'schema 미발견 — skipped',
			});
			continue;
		}

		let schema;
		try {
			schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
		} catch (err) {
			results.push({
				file,
				schema: schemaName,
				error: `Schema parse error: ${err.message}`,
				valid: false,
			});
			continue;
		}

		let validate;
		try {
			const id = schema.$id ?? schemaName;
			validate = ajv.getSchema(id) ?? ajv.compile(schema);
		} catch (err) {
			results.push({
				file,
				schema: schemaName,
				error: `Schema compile error: ${err.message}`,
				valid: false,
			});
			continue;
		}

		const valid = validate(json);
		results.push({
			file,
			schema: schemaName,
			valid,
			errors: valid
				? []
				: (validate.errors ?? []).map((e) => ({
						path: e.instancePath || '/',
						keyword: e.keyword,
						message: e.message,
						params: e.params,
					})),
		});
	}

	const stats = {
		total: results.length,
		valid: results.filter((r) => r.valid === true).length,
		invalid: results.filter((r) => r.valid === false).length,
		skipped: results.filter((r) => r.valid === null).length,
	};

	if (jsonOutput) {
		console.log(JSON.stringify({ stats, results }, null, 2));
	} else {
		console.log(`schema-validator — ${stats.total} file(s)`);
		console.log(
			`  valid: ${stats.valid}  invalid: ${stats.invalid}  skipped: ${stats.skipped}`,
		);
		console.log('');
		for (const r of results) {
			const rel =
				r.file.split(/[/\\]ai-native-methodology[/\\]/).pop() ?? r.file;
			const symbol = r.valid === true ? '✅' : r.valid === false ? '❌' : '⏭';
			console.log(`${symbol} ${rel}  → ${r.schema ?? '(no schema)'}`);
			if (r.note) console.log(`    note: ${r.note}`);
			if (r.error) console.log(`    error: ${r.error}`);
			for (const e of (r.errors ?? []).slice(0, 5)) {
				console.log(`    [${e.keyword}] ${e.path}: ${e.message}`);
			}
			if ((r.errors ?? []).length > 5)
				console.log(`    ... ${r.errors.length - 5} more errors`);
		}
	}

	process.exit(stats.invalid > 0 ? 1 : 0);
}

main();

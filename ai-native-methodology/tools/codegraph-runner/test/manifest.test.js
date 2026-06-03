import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildManifest } from '../src/manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(
	readFileSync(
		join(__dirname, '..', '..', '..', 'schemas', 'code-graph.schema.json'),
		'utf-8',
	),
);

// 실측 codegraph status --json 출력 (2026-05-30 실제 실행 캡쳐 / §8.1 ≥2 stack).
const JS_STATUS = {
	initialized: true,
	projectPath: '/tmp/jsapp',
	fileCount: 2,
	nodeCount: 6,
	edgeCount: 8,
	dbSizeBytes: 143360,
	backend: 'node-sqlite',
	journalMode: 'wal',
	nodesByKind: { file: 2, function: 3, import: 1 },
	languages: ['javascript'],
	pendingChanges: { added: 0, modified: 0, removed: 0 },
	worktreeMismatch: null,
};
const JAVA_STATUS = {
	initialized: true,
	projectPath: '/tmp/javaapp',
	fileCount: 1,
	nodeCount: 5,
	edgeCount: 5,
	dbSizeBytes: 143360,
	backend: 'node-sqlite',
	journalMode: 'wal',
	nodesByKind: { class: 1, file: 1, method: 2, namespace: 1 },
	languages: ['java'],
	pendingChanges: { added: 0, modified: 0, removed: 0 },
	worktreeMismatch: null,
};
const EVIDENCE = {
	tool_stdout_path: '/out/codegraph.stdout.log',
	tool_stderr_path: '/out/codegraph.stderr.log',
	tool_version: '0.9.7',
	invocation_timestamp: '2026-05-30T00:00:00.000Z',
	duration_ms: 138,
	result_hash: 'a'.repeat(64),
	reproduction_command:
		'codegraph init -i /tmp/jsapp && codegraph status /tmp/jsapp --json',
	evidence_trust: 'real_tool',
};

// 경량 schema-구조 conformance 검사 (ajv 의존 회피 / required + additionalProperties:false 검증).
function assertConforms(obj, schema, path = 'root') {
	if (schema.type === 'object' || schema.properties) {
		assert.equal(typeof obj, 'object', `${path}: object expected`);
		for (const req of schema.required ?? []) {
			assert.ok(req in obj, `${path}: missing required '${req}'`);
		}
		if (schema.additionalProperties === false) {
			const allowed = new Set(Object.keys(schema.properties ?? {}));
			for (const k of Object.keys(obj)) {
				assert.ok(
					allowed.has(k),
					`${path}: unexpected property '${k}' (additionalProperties:false)`,
				);
			}
		}
		for (const [k, sub] of Object.entries(schema.properties ?? {})) {
			if (k in obj && (sub.type === 'object' || sub.properties))
				assertConforms(obj[k], sub, `${path}.${k}`);
		}
	}
}

test('buildManifest maps JS status stats', () => {
	const m = buildManifest({
		targetPath: '/tmp/jsapp',
		status: JS_STATUS,
		evidence: EVIDENCE,
	});
	assert.equal(m.index_stats.file_count, 2);
	assert.equal(m.index_stats.node_count, 6);
	assert.equal(m.index_stats.edge_count, 8);
	assert.deepEqual(m.index_stats.languages, ['javascript']);
	assert.deepEqual(m.index_stats.nodes_by_kind, {
		file: 2,
		function: 3,
		import: 1,
	});
	assert.equal(m.index_stats.backend, 'node-sqlite');
});

test('buildManifest maps Java status stats (≥2 stack corroboration / §8.1)', () => {
	const m = buildManifest({
		targetPath: '/tmp/javaapp',
		status: JAVA_STATUS,
		evidence: EVIDENCE,
	});
	assert.equal(m.index_stats.file_count, 1);
	assert.deepEqual(m.index_stats.languages, ['java']);
	assert.equal(m.index_stats.nodes_by_kind.method, 2);
	assert.equal(m.index_stats.nodes_by_kind.namespace, 1);
});

test('manifest carries trust_note + do_not_edit_manually (gate-inject 차단 표식)', () => {
	const m = buildManifest({
		targetPath: '/tmp/jsapp',
		status: JS_STATUS,
		evidence: EVIDENCE,
	});
	assert.equal(m.meta.do_not_edit_manually, true);
	assert.match(m.meta.trust_note, /NOT gate-injected/);
	assert.equal(m.meta.generated_by, 'codegraph-runner');
	assert.equal(m.meta.derived_from[0].tool, '@colbymchenry/codegraph');
});

test('built manifest conforms to code-graph.schema.json (required + additionalProperties)', () => {
	const m = buildManifest({
		targetPath: '/tmp/jsapp',
		status: JS_STATUS,
		evidence: EVIDENCE,
	});
	assertConforms(m, SCHEMA);
});

test('buildManifest throws on uninitialized status (no-simulation: empty index 거부)', () => {
	assert.throws(
		() =>
			buildManifest({
				targetPath: '/x',
				status: { initialized: false },
				evidence: EVIDENCE,
			}),
		/not initialized/,
	);
});

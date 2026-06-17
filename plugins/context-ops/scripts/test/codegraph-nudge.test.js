// Unit tests for codegraph-nudge.js pure logic (P2 token-saving nudge).
// Covers: source-path detection, glob dir/source classification, intent split
// (Read=pointer / Glob=structure-map / Grep=never), output capping + ANSI strip,
// additionalContext shape, and opt-out parsing. The I/O main() is direct-invocation
// guarded, so importing here runs no stdin read / no codegraph call.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	isSourcePath,
	globDir,
	globTargetsSource,
	classifyIntent,
	capOutput,
	buildReadContext,
	buildGlobContext,
	buildHookOutput,
	isOptedOut,
} from '../codegraph-nudge.js';

test('isSourcePath — source exts true, non-source false, garbage false', () => {
	for (const p of ['Foo.java', 'a/b/Svc.ts', 'x.tsx', 'm.py', 'g.go', 'r.rs', 'v.vue']) {
		assert.equal(isSourcePath(p), true, p);
	}
	for (const p of ['README.md', 'pkg.json', 'app.yaml', 'a.lock', 'notes.txt', 'no-ext']) {
		assert.equal(isSourcePath(p), false, p);
	}
	assert.equal(isSourcePath(undefined), false);
	assert.equal(isSourcePath(''), false);
});

test('globDir — literal prefix before first metachar', () => {
	assert.equal(globDir('src/services/**'), 'src/services');
	assert.equal(globDir('src/services/**/*.java'), 'src/services');
	assert.equal(globDir('**/*.java'), '');
	assert.equal(globDir('src/a/b.ts'), 'src/a/b.ts'); // no metachar
	assert.equal(globDir('src/'), 'src');
	assert.equal(globDir(undefined), '');
});

test('globTargetsSource — source ext or extensionless dir glob', () => {
	assert.equal(globTargetsSource('src/services/**'), true); // no ext = dir glob
	assert.equal(globTargetsSource('src/**/*.java'), true);
	assert.equal(globTargetsSource('**/*.md'), false);
	assert.equal(globTargetsSource('**/*.json'), false);
	assert.equal(globTargetsSource(undefined), false);
});

test('classifyIntent — Read source → read-pointer', () => {
	assert.deepEqual(classifyIntent('Read', { file_path: 'src/UserService.java' }), { kind: 'read-pointer' });
});

test('classifyIntent — Read non-source → skip', () => {
	assert.deepEqual(classifyIntent('Read', { file_path: 'README.md' }), { kind: 'skip' });
	assert.deepEqual(classifyIntent('Read', {}), { kind: 'skip' });
});

test('classifyIntent — Glob source dir → glob-dir with derived dir', () => {
	assert.deepEqual(classifyIntent('Glob', { pattern: 'src/services/**' }), { kind: 'glob-dir', dir: 'src/services' });
	assert.deepEqual(
		classifyIntent('Glob', { pattern: 'src/services/**/*.java' }),
		{ kind: 'glob-dir', dir: 'src/services' },
	);
});

test('classifyIntent — Glob with explicit path joins', () => {
	assert.deepEqual(classifyIntent('Glob', { pattern: '**', path: 'src/web' }), { kind: 'glob-dir', dir: 'src/web' });
});

test('classifyIntent — Glob non-source / too-broad → skip', () => {
	assert.deepEqual(classifyIntent('Glob', { pattern: '**/*.md' }), { kind: 'skip' });
	assert.deepEqual(classifyIntent('Glob', { pattern: '**/*.java' }), { kind: 'skip' }); // dir '' + no path
});

test('classifyIntent — Grep and unknown tools never fire', () => {
	assert.deepEqual(classifyIntent('Grep', { pattern: 'foo' }), { kind: 'skip' });
	assert.deepEqual(classifyIntent('Bash', { command: 'ls' }), { kind: 'skip' });
	assert.deepEqual(classifyIntent('Write', { file_path: 'a.ts' }), { kind: 'skip' });
});

test('capOutput — strips ANSI, drops blanks, under cap unchanged', () => {
	const ansi = '\x1b[1m\nFiles (2):\x1b[0m\n  a.js \x1b[2m(javascript, 3 symbols)\x1b[0m\n';
	const out = capOutput(ansi, 25);
	assert.ok(!/\x1b\[/.test(out), 'no ANSI remains');
	assert.equal(out, 'Files (2):\n  a.js (javascript, 3 symbols)');
});

test('capOutput — over cap truncates with honest note', () => {
	const many = Array.from({ length: 40 }, (_, i) => `line${i}`).join('\n');
	const out = capOutput(many, 10);
	assert.equal(out.split('\n').length, 11); // 10 lines + note
	assert.match(out, /\+30 more/);
	assert.match(out, /codegraph_files/);
});

test('buildReadContext — pointer carries reference-lens disclaimer + MCP tool names', () => {
	const c = buildReadContext();
	assert.match(c, /reference-lens/);
	assert.match(c, /mcp__codegraph__codegraph_callers/);
	assert.ok(c.length < 400, 'pointer stays small');
});

test('buildGlobContext — includes dir, map, disclaimer', () => {
	const c = buildGlobContext('src/services', 'Files (2):\n  a.js');
	assert.match(c, /src\/services/);
	assert.match(c, /reference-lens/);
	assert.match(c, /a\.js/);
});

test('buildHookOutput — valid PreToolUse additionalContext JSON', () => {
	const json = buildHookOutput('hello');
	const parsed = JSON.parse(json);
	assert.equal(parsed.hookSpecificOutput.hookEventName, 'PreToolUse');
	assert.equal(parsed.hookSpecificOutput.additionalContext, 'hello');
	// must NOT carry any blocking decision
	assert.equal(parsed.hookSpecificOutput.permissionDecision, undefined);
});

test('isOptedOut — falsy strings opt out, truthy/empty stay on', () => {
	for (const v of ['0', 'false', 'no', 'off', 'OFF', ' False ']) assert.equal(isOptedOut(v), true, v);
	for (const v of ['1', 'true', 'yes', 'on', '', undefined, null]) assert.equal(isOptedOut(v), false, String(v));
});

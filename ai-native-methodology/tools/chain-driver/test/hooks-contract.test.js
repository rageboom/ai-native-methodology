// hooks-contract.test.js — Senior F10. driver ↔ Claude Code hooks 의 stdin/stdout/exit 동작 contract 검증.
// real Claude binary 없이, cli.js hooks-bridge subcommand 를 spawn 해서 검증.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

function runHooksBridge(stdinJson) {
	return spawnSync('node', [CLI, 'hooks-bridge'], {
		input: stdinJson,
		encoding: 'utf-8',
		shell: false,
		timeout: 5000,
	});
}

describe('hooks-contract', () => {
	it('UserPromptSubmit with planning trigger → suppressOutput=true + additionalContext + exit 0', () => {
		const r = runHooksBridge(
			JSON.stringify({
				hook_event_name: 'UserPromptSubmit',
				prompt: 'planning 시작',
				session_id: 's1',
				cwd: process.cwd(),
			}),
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		assert.equal(out.suppressOutput, true);
		assert.match(
			out.hookSpecificOutput.additionalContext,
			/SHALL NOT auto-invoke/,
		);
		assert.match(r.stderr, /\[chain-driver\] suggested skill/);
	});

	it('UserPromptSubmit with no trigger → suppressOutput=true + continue=true (no skill suggested)', () => {
		const r = runHooksBridge(
			JSON.stringify({
				hook_event_name: 'UserPromptSubmit',
				prompt: 'hello world unrelated',
				cwd: process.cwd(),
			}),
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		assert.equal(out.suppressOutput, true);
		assert.equal(out.continue, true);
		assert.equal(out.hookSpecificOutput, undefined);
	});

	it('empty stdin → exit 3 + stderr error', () => {
		const r = runHooksBridge('');
		assert.equal(r.status, 3);
		assert.match(r.stderr, /\[chain-driver\]/);
	});

	it('bad JSON stdin → exit 3', () => {
		const r = runHooksBridge('{not json');
		assert.equal(r.status, 3);
	});

	it('PreToolUse without project state → pass-through suppressOutput=true', () => {
		const r = runHooksBridge(
			JSON.stringify({
				hook_event_name: 'PreToolUse',
				tool_name: 'Edit',
				tool_input: { file_path: '/tmp/no-aimd/src/foo.ts' },
				cwd: '/tmp/no-aimd',
			}),
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		assert.equal(out.suppressOutput, true);
	});
});

// hooks-contract.test.js — Senior F10. driver ↔ Claude Code hooks 의 stdin/stdout/exit 동작 contract 검증.
// real Claude binary 없이, cli.js hooks-bridge subcommand 를 spawn 해서 검증.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { ensureScopeDir, writeManifest } from '../src/state-store.js';

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
function runCli(args) {
	return spawnSync('node', [CLI, ...args], { encoding: 'utf-8', timeout: 5000 });
}
function sessionStart(root) {
	return runHooksBridge(JSON.stringify({ hook_event_name: 'SessionStart', cwd: root }));
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

// living-sync ② honest surface (read-only) — SessionStart 미-baseline scope 표면화 e2e (DEC §24 / Senior@0.80).
describe('hooks-contract — SessionStart unbaselined surface (② honest)', () => {
	function setup() {
		const root = mkdtempSync(join(tmpdir(), 'unbaselined-'));
		runCli(['init', root]); // .aimd/state.json
		mkdirSync(join(root, '.aimd', 'output'), { recursive: true });
		writeFileSync(join(root, '.aimd', 'output', 'domain.json'), '{}'); // canonical 존재
		ensureScopeDir(root, 'scope-a');
		writeManifest(root, 'scope-a', null, {
			scope: 'scope-a',
			status: 'active',
			sync_state: { sync_sources: [], drift_detected: false },
		});
		return root;
	}

	it('미-baseline scope → additionalContext 에 unbaselined 경고 + "ready" 부재 (거짓 건강 제거)', () => {
		const root = setup();
		const r = sessionStart(root);
		assert.equal(r.status, 0, r.stderr);
		const out = JSON.parse(r.stdout);
		assert.match(out.hookSpecificOutput.additionalContext, /unbaselined/);
		assert.match(out.hookSpecificOutput.additionalContext, /scope-a/);
		assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /chain harness ready/, '거짓 ready 억제');
		assert.match(r.stderr, /unbaselined/); // minor-2 stderr 정합
		rmSync(root, { recursive: true, force: true });
	});

	it('chain-driver sync first-touch 후 → 경고 소멸 (안내 실효 / BLOCKER-1)', () => {
		const root = setup();
		const s = runCli(['sync', root]); // no-scope first-touch baseline
		assert.equal(s.status, 0, s.stderr);
		const r = sessionStart(root);
		const out = JSON.parse(r.stdout);
		assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /unbaselined/, 'baseline 후 표면화 소멸');
		rmSync(root, { recursive: true, force: true });
	});

	it('cmdSync first-touch 가 absent sync_sources 도 baseline (Senior BLOCKER-1 (B) 회귀)', () => {
		const root = mkdtempSync(join(tmpdir(), 'unbaselined-absent-'));
		runCli(['init', root]);
		mkdirSync(join(root, '.aimd', 'output'), { recursive: true });
		writeFileSync(join(root, '.aimd', 'output', 'domain.json'), '{}');
		ensureScopeDir(root, 'scope-a');
		writeManifest(root, 'scope-a', null, { scope: 'scope-a', status: 'active', sync_state: { drift_detected: false } }); // sync_sources absent
		const before = sessionStart(root);
		assert.match(JSON.parse(before.stdout).hookSpecificOutput.additionalContext, /unbaselined/, 'absent → 표면화');
		runCli(['sync', root]); // (B): absent 도 first-touch 해야 안내 실효
		const after = sessionStart(root);
		assert.doesNotMatch(JSON.parse(after.stdout).hookSpecificOutput.additionalContext, /unbaselined/, 'absent도 sync 후 소멸');
		rmSync(root, { recursive: true, force: true });
	});

	it('canonical 부재 프로젝트 → unbaselined 경고 없음 (false-positive 차단 / anyCanonical)', () => {
		const root = mkdtempSync(join(tmpdir(), 'unbaselined-nocanon-'));
		runCli(['init', root]);
		ensureScopeDir(root, 'scope-a');
		writeManifest(root, 'scope-a', null, { scope: 'scope-a', status: 'active', sync_state: { sync_sources: [], drift_detected: false } });
		const r = sessionStart(root);
		const out = JSON.parse(r.stdout);
		assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /unbaselined/);
		rmSync(root, { recursive: true, force: true });
	});
});

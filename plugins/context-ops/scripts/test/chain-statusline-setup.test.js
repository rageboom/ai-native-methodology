// chain-statusline-setup.test.js — settings merge-write 순수 코어(idempotent / clobber-guard / 무손실).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStatusLineConfig, mergeStatusLine } from '../chain-statusline-setup.js';

const CFG = buildStatusLineConfig('/plugins/context-ops');

test('buildStatusLineConfig — resolved 절대경로 command', () => {
	assert.deepEqual(CFG, {
		type: 'command',
		command: 'node /plugins/context-ops/scripts/chain-statusline.js',
	});
});

test('merge — 빈 settings → created', () => {
	const r = mergeStatusLine({}, CFG);
	assert.equal(r.action, 'created');
	assert.deepEqual(r.settings.statusLine, CFG);
});

test('merge — null settings 안전', () => {
	const r = mergeStatusLine(null, CFG);
	assert.equal(r.action, 'created');
	assert.deepEqual(r.settings.statusLine, CFG);
});

test('merge — 다른 키 무손실 보존', () => {
	const r = mergeStatusLine({ permissions: { allow: ['x'] }, env: { A: '1' } }, CFG);
	assert.equal(r.action, 'created');
	assert.deepEqual(r.settings.permissions, { allow: ['x'] });
	assert.deepEqual(r.settings.env, { A: '1' });
	assert.deepEqual(r.settings.statusLine, CFG);
});

test('merge — 동일 command 재실행 → noop (idempotent)', () => {
	const once = mergeStatusLine({}, CFG).settings;
	const r = mergeStatusLine(once, CFG);
	assert.equal(r.action, 'noop');
	assert.deepEqual(r.settings.statusLine, CFG);
});

test('merge — 기존 다른 statusLine + force❌ → conflict (clobber-guard)', () => {
	const r = mergeStatusLine({ statusLine: { type: 'command', command: 'my-prompt.sh' } }, CFG);
	assert.equal(r.action, 'conflict');
	// 미변경 — 기존 보존
	assert.equal(r.settings.statusLine.command, 'my-prompt.sh');
});

test('merge — 기존 다른 statusLine + force → updated (덮어씀)', () => {
	const r = mergeStatusLine(
		{ statusLine: { type: 'command', command: 'my-prompt.sh' } },
		CFG,
		{ force: true },
	);
	assert.equal(r.action, 'updated');
	assert.deepEqual(r.settings.statusLine, CFG);
});

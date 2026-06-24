// chain-statusline.test.js — statusLine 렌더 결정론 + state.json read 안전성.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	CHAIN_ORDER,
	activeChain,
	renderStatusline,
	cwdFromInput,
	readStateFromCwd,
} from '../chain-statusline.js';

test('CHAIN_ORDER = canonical 5 stage (discovery1..implement5)', () => {
	assert.deepEqual(CHAIN_ORDER, ['discovery', 'spec', 'plan', 'test', 'implement']);
});

test('renderStatusline — scoped chain → 📍 stage N/5 · scope', () => {
	const state = { current_scope: 'BC-FOO', scope_states: { 'BC-FOO': { current_chain: 'spec' } } };
	assert.equal(renderStatusline(state), '📍 spec 2/5 · BC-FOO');
});

test('renderStatusline — implement = 5/5', () => {
	const state = {
		current_scope: 'BC-BAR',
		scope_states: { 'BC-BAR': { current_chain: 'implement' } },
	};
	assert.equal(renderStatusline(state), '📍 implement 5/5 · BC-BAR');
});

test('renderStatusline — analysis = N/5 생략 (gate#0)', () => {
	const state = {
		current_scope: 'BC-FOO',
		scope_states: { 'BC-FOO': { current_chain: 'analysis' } },
	};
	assert.equal(renderStatusline(state), '📍 analysis · BC-FOO');
});

test('renderStatusline — blocked → ⛔ 접두', () => {
	const state = {
		current_scope: 'BC-FOO',
		blocked: true,
		block_reason: 'gate',
		scope_states: { 'BC-FOO': { current_chain: 'plan' } },
	};
	assert.equal(renderStatusline(state), '⛔ 📍 plan 3/5 · BC-FOO');
});

test('renderStatusline — global(비-scoped) chain', () => {
	const state = { current_scope: null, current_chain: 'discovery' };
	assert.equal(renderStatusline(state), '📍 discovery 1/5');
});

test('renderStatusline — chain 없음 → idle (scope 표기 생략)', () => {
	const state = { current_scope: 'BC-FOO', scope_states: { 'BC-FOO': {} } };
	assert.equal(renderStatusline(state), '📍 chain idle');
});

test('renderStatusline — null state → 빈 문자열 (침묵)', () => {
	assert.equal(renderStatusline(null), '');
	assert.equal(renderStatusline(undefined), '');
});

test('renderStatusline — 미지 stage → ? (throw ❌)', () => {
	const state = { current_scope: 'X', scope_states: { X: { current_chain: 'weird' } } };
	assert.equal(renderStatusline(state), '📍 weird ? · X');
});

test('activeChain — scope 우선, blocked 반영', () => {
	const a = activeChain({
		current_scope: 'S',
		blocked: true,
		scope_states: { S: { current_chain: 'test' } },
	});
	assert.deepEqual(a, { scope: 'S', chain: 'test', blocked: true });
});

test('cwdFromInput — workspace.current_dir > cwd > project_dir', () => {
	assert.equal(cwdFromInput({ workspace: { current_dir: '/a' }, cwd: '/b' }), '/a');
	assert.equal(cwdFromInput({ cwd: '/b' }), '/b');
	assert.equal(cwdFromInput({ workspace: { project_dir: '/c' } }), '/c');
	assert.equal(cwdFromInput(null), null);
	assert.equal(cwdFromInput({}), null);
});

test('readStateFromCwd — 존재 → 파싱 / 부재 → null / 깨짐 → null', () => {
	const dir = mkdtempSync(join(tmpdir(), 'chain-sl-'));
	try {
		// 부재
		assert.equal(readStateFromCwd(dir), null);
		// 존재
		mkdirSync(join(dir, '.ai-context'), { recursive: true });
		writeFileSync(
			join(dir, '.ai-context', 'state.json'),
			JSON.stringify({ current_scope: 'Z', scope_states: { Z: { current_chain: 'spec' } } }),
		);
		assert.equal(renderStatusline(readStateFromCwd(dir)), '📍 spec 2/5 · Z');
		// 깨진 JSON → null (throw ❌)
		writeFileSync(join(dir, '.ai-context', 'state.json'), '{ not json');
		assert.equal(readStateFromCwd(dir), null);
		// null cwd
		assert.equal(readStateFromCwd(null), null);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// cold-start-rehydrate.test.js — D3b 휘발 커서 manifest 재수화 (DEC-2026-06-26-cold-start-autoinit).
//   state.json(gitignore 휘발 커서)을 scope/stage manifest(git-tracked SSOT)에서 결정론 유도.
//   clone 후 state.json 부재(cold-start)지만 manifest 진행 중인 케이스 복구.
//   유닛(rehydrateCursorFromManifests 4-mode + impl매핑 + lossy) + 통합(SessionStart 자동재수화 + rehydrate 커맨드 / real cli subprocess).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

import {
	rehydrateCursorFromManifests,
	ensureScopeDir,
	writeManifest,
	readManifest,
	resolveEnforcementContext,
} from '../src/state-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

// ── fixtures ─────────────────────────────────────────────────────────────
function mkRoot(tag) {
	const r = mkdtempSync(join(tmpdir(), `aimd-rh-${tag}-`));
	mkdirSync(join(r, '.ai-context'), { recursive: true });
	return r;
}
// scope 를 생성하고 진행상태(current_stage + stage statuses)를 manifest 에 반영. state.json 은 만들지 않음(cold-start).
function makeScope(root, scope, currentStage, stageStatuses = {}) {
	ensureScopeDir(root, scope); // scope + 5 stage manifest (기본 pending)
	const sm = readManifest(root, scope);
	writeManifest(root, scope, null, { ...sm, current_stage: currentStage });
	for (const [stage, status] of Object.entries(stageStatuses)) {
		const stm = readManifest(root, scope, stage);
		writeManifest(root, scope, stage, { ...stm, status });
	}
}
function runHook(event, cwd, extra = {}) {
	return spawnSync('node', [CLI, 'hooks-bridge'], {
		input: JSON.stringify({ hook_event_name: event, cwd, ...extra }),
		encoding: 'utf-8',
		shell: false,
		timeout: 5000,
	});
}

// ── 유닛: rehydrateCursorFromManifests ─────────────────────────────────────
describe('rehydrateCursorFromManifests — 4-mode + 유도', () => {
	it("none — .ai-context 만 (scope 0) → mode 'none'", () => {
		const root = mkRoot('none');
		try {
			assert.equal(rehydrateCursorFromManifests(root).mode, 'none');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('single — 1 scope, spec 진행 → current_chain=spec + stage_progress 유도 + lossy', () => {
		const root = mkRoot('single');
		try {
			makeScope(root, 'auth', 'spec', {
				discovery: 'complete',
				spec: 'in_progress',
			});
			const rh = rehydrateCursorFromManifests(root);
			assert.equal(rh.mode, 'single');
			assert.equal(rh.scope, 'auth');
			assert.equal(rh.state.current_chain, 'spec');
			assert.equal(rh.state.current_scope, 'auth');
			assert.equal(rh.state.stage_progress.analysis.status, 'complete'); // init parity
			assert.equal(rh.state.stage_progress.discovery.status, 'complete');
			assert.equal(rh.state.stage_progress.spec.status, 'in_progress');
			assert.equal(rh.state.blocked, false); // lossy — manifest 미보존
			assert.equal(rh.lossy, true);
			assert.ok(rh.lost_fields.includes('blocked'));
			assert.ok(rh.lost_fields.includes('current_task'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("impl 매핑 — current_stage='impl' → current_chain='implement'", () => {
		const root = mkRoot('impl');
		try {
			makeScope(root, 'pay', 'impl', { impl: 'in_progress' });
			const rh = rehydrateCursorFromManifests(root);
			assert.equal(rh.mode, 'single');
			assert.equal(rh.state.current_chain, 'implement');
			assert.equal(rh.state.stage_progress.implement.status, 'in_progress');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("ambiguous — 2 scopes, --scope 없음 → mode 'ambiguous' (자동선택 ❌)", () => {
		const root = mkRoot('ambig');
		try {
			makeScope(root, 'auth', 'spec');
			makeScope(root, 'pay', 'discovery');
			const rh = rehydrateCursorFromManifests(root);
			assert.equal(rh.mode, 'ambiguous');
			assert.deepEqual([...rh.scopes].sort(), ['auth', 'pay']);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('ambiguous → --scope 명시하면 그 scope 유도', () => {
		const root = mkRoot('ambig2');
		try {
			makeScope(root, 'auth', 'spec');
			makeScope(root, 'pay', 'plan');
			const rh = rehydrateCursorFromManifests(root, { scope: 'pay' });
			assert.equal(rh.mode, 'single');
			assert.equal(rh.state.current_chain, 'plan');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("not-found — --scope 가 실제 scope 와 불일치 → mode 'not-found'", () => {
		const root = mkRoot('nf');
		try {
			makeScope(root, 'auth', 'spec');
			const rh = rehydrateCursorFromManifests(root, { scope: 'ghost' });
			assert.equal(rh.mode, 'not-found');
			assert.equal(rh.requested, 'ghost');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("corrupt-manifest — current_stage 무효 → mode 'corrupt-manifest' (자동 ❌)", () => {
		const root = mkRoot('corrupt');
		try {
			ensureScopeDir(root, 'auth');
			const sm = readManifest(root, 'auth');
			writeManifest(root, 'auth', null, { ...sm, current_stage: 'bogus-stage' });
			const rh = rehydrateCursorFromManifests(root);
			assert.equal(rh.mode, 'corrupt-manifest');
			assert.ok(rh.error.includes('bogus-stage'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

// ── 통합: SessionStart 자동 재수화 (single-scope 한정) ──────────────────────
describe('SessionStart — cold-start 자동 재수화', () => {
	it('single scope → state.json 자동 write + 재수화 surface + 이후 live', () => {
		const root = mkRoot('ss-single');
		try {
			makeScope(root, 'auth', 'spec', { discovery: 'complete', spec: 'in_progress' });
			assert.equal(existsSync(join(root, '.ai-context', 'state.json')), false); // 전: cold-start
			const r = runHook('SessionStart', root);
			assert.equal(r.status, 0);
			const ac = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
			assert.ok(ac.includes('재수화'));
			assert.ok(ac.includes('auth'));
			assert.ok(ac.includes('복원')); // lossy 정직 표기
			// state.json 이 생겨 이후 live
			assert.equal(existsSync(join(root, '.ai-context', 'state.json')), true);
			assert.equal(resolveEnforcementContext(root).mode, 'live');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('multi scope → 자동 write ❌ + --scope 안내 surface', () => {
		const root = mkRoot('ss-multi');
		try {
			makeScope(root, 'auth', 'spec');
			makeScope(root, 'pay', 'plan');
			const r = runHook('SessionStart', root);
			assert.equal(r.status, 0);
			const ac = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
			assert.ok(ac.includes('rehydrate'));
			assert.equal(existsSync(join(root, '.ai-context', 'state.json')), false); // 자동 write 안 함
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('scope 0 (truly-fresh) → 미초기화 surface (자동 init ❌)', () => {
		const root = mkRoot('ss-fresh');
		try {
			const r = runHook('SessionStart', root);
			assert.equal(r.status, 0);
			const ac = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
			assert.ok(ac.includes('미초기화'));
			assert.equal(existsSync(join(root, '.ai-context', 'state.json')), false);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

// ── 통합: rehydrate 커맨드 (real cli subprocess) ───────────────────────────
describe('chain-driver rehydrate 커맨드', () => {
	it('single → exit 0 + state.json write + lossy 고지', () => {
		const root = mkRoot('cmd-single');
		try {
			makeScope(root, 'auth', 'test', { discovery: 'complete', spec: 'complete', plan: 'complete', test: 'in_progress' });
			const r = spawnSync('node', [CLI, 'rehydrate', root], { encoding: 'utf-8', timeout: 5000 });
			assert.equal(r.status, 0);
			assert.ok(r.stdout.includes('재수화'));
			assert.ok(r.stdout.includes('lossy'));
			const st = JSON.parse(readFileSync(join(root, '.ai-context', 'state.json'), 'utf-8'));
			assert.equal(st.current_chain, 'test');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('ambiguous → exit 3 + --scope 안내', () => {
		const root = mkRoot('cmd-ambig');
		try {
			makeScope(root, 'auth', 'spec');
			makeScope(root, 'pay', 'plan');
			const r = spawnSync('node', [CLI, 'rehydrate', root], { encoding: 'utf-8', timeout: 5000 });
			assert.equal(r.status, 3);
			assert.ok(r.stderr.includes('--scope'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('none → exit 3 안내', () => {
		const root = mkRoot('cmd-none');
		try {
			const r = spawnSync('node', [CLI, 'rehydrate', root], { encoding: 'utf-8', timeout: 5000 });
			assert.equal(r.status, 3);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

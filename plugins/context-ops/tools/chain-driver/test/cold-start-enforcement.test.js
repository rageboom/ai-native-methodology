// cold-start-enforcement.test.js — cold-start 갭 4-mode enforcement (DEC-2026-06-26-cold-start-enforcement).
//   state.json 부재/손상 시 enforcement 가 통째로 비활성되던 갭을 메운다:
//     live       state.json 정상            → 전체 enforcement
//     corrupt    state.json 존재·손상       → fail-closed (.ai-context write + MCP ticket-sync 차단)
//     cold-start state.json 부재 + .ai-context/ → orphan chain 산출물만 차단 (read-only pseudoChain)
//     absent     .ai-context/ 부재          → 무차단 (방법론 미사용 레포 / over-block 회피)
//   유닛(resolveEnforcementContext / corruptStateBlockReason 직접) + 통합(real cli.js subprocess / no-simulation).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

import { resolveEnforcementContext } from '../src/state-store.js';
import { corruptStateBlockReason } from '../src/hooks-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

// ── fixtures ─────────────────────────────────────────────────────────────
function mkRoot(tag) {
	return mkdtempSync(join(tmpdir(), `aimd-cs-${tag}-`));
}
function makeAbsent() {
	// .ai-context 자체 부재 = 방법론 미사용 레포.
	return mkRoot('absent');
}
function makeColdStart() {
	const root = mkRoot('cold');
	mkdirSync(join(root, '.ai-context', 'output'), { recursive: true });
	return root; // state.json 없음
}
function makeLive() {
	const root = mkRoot('live');
	mkdirSync(join(root, '.ai-context', 'output'), { recursive: true });
	writeFileSync(
		join(root, '.ai-context', 'state.json'),
		JSON.stringify({ version: '2.0', project_id: 'live', current_chain: 'analysis' }) + '\n',
	);
	return root;
}
function makeCorrupt(kind = 'numeric-version') {
	const root = mkRoot('corrupt');
	mkdirSync(join(root, '.ai-context', 'output'), { recursive: true });
	const body =
		kind === 'bad-json'
			? '{ this is not json'
			: JSON.stringify({ version: 1 }); // 숫자 version → readState strict throw
	writeFileSync(join(root, '.ai-context', 'state.json'), body + '\n');
	return root;
}

function runHook(event, cwd, extra = {}) {
	const r = spawnSync('node', [CLI, 'hooks-bridge'], {
		input: JSON.stringify({ hook_event_name: event, cwd, ...extra }),
		encoding: 'utf-8',
		shell: false,
		timeout: 5000,
	});
	return r;
}
const orphanWrite = (root) => ({
	tool_name: 'Write',
	tool_input: { file_path: join(root, '.ai-context', 'output', 'behavior-spec.json') },
});
const discoverySpecWrite = (root) => ({
	tool_name: 'Write',
	tool_input: { file_path: join(root, '.ai-context', 'output', 'discovery-spec.json') },
});
const sourceWrite = (root) => ({
	tool_name: 'Write',
	tool_input: { file_path: join(root, 'src', 'foo.ts') },
});
const aiContextWrite = (root) => ({
	tool_name: 'Write',
	tool_input: { file_path: join(root, '.ai-context', 'output', 'notes.md') },
});

// ── 유닛: resolveEnforcementContext 4-mode ──────────────────────────────────
describe('resolveEnforcementContext — 4-mode 판정', () => {
	it('absent — .ai-context 부재', () => {
		const root = makeAbsent();
		try {
			assert.equal(resolveEnforcementContext(root).mode, 'absent');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('cold-start — .ai-context 있고 state.json 없음 → pseudoChain.discovery=pending', () => {
		const root = makeColdStart();
		try {
			const ctx = resolveEnforcementContext(root);
			assert.equal(ctx.mode, 'cold-start');
			assert.equal(ctx.pseudoChain.stage_progress.discovery.status, 'pending');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('live — 정상 state.json → state 반환', () => {
		const root = makeLive();
		try {
			const ctx = resolveEnforcementContext(root);
			assert.equal(ctx.mode, 'live');
			assert.equal(ctx.state.version, '2.0');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('corrupt — 숫자 version (readState strict throw) → never throw', () => {
		const root = makeCorrupt('numeric-version');
		try {
			const ctx = resolveEnforcementContext(root);
			assert.equal(ctx.mode, 'corrupt');
			assert.ok(typeof ctx.error === 'string' && ctx.error.length > 0);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('corrupt — 깨진 JSON → never throw', () => {
		const root = makeCorrupt('bad-json');
		try {
			assert.equal(resolveEnforcementContext(root).mode, 'corrupt');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

// ── 유닛: corruptStateBlockReason ──────────────────────────────────────────
describe('corruptStateBlockReason — fail-closed deny 판정', () => {
	it('.ai-context write → deny', () => {
		const reason = corruptStateBlockReason({
			toolName: 'Write',
			toolInput: { file_path: '/p/.ai-context/output/x.json' },
			errorMessage: 'boom',
		});
		assert.ok(reason && reason.includes('손상'));
	});
	it('.ai-context 밖 source write → allow(null)', () => {
		assert.equal(
			corruptStateBlockReason({
				toolName: 'Write',
				toolInput: { file_path: '/p/src/foo.ts' },
			}),
			null,
		);
	});
	it('MCP ticket-sync → deny', () => {
		const reason = corruptStateBlockReason({
			toolName: 'mcp__mcp-server-wiki-jira__jira_create',
			toolInput: {},
		});
		assert.ok(reason && reason.includes('ticket-sync'));
	});
	it('비-Write 도구(Read 등) → allow(null)', () => {
		assert.equal(
			corruptStateBlockReason({ toolName: 'Read', toolInput: { file_path: '/p/.ai-context/x' } }),
			null,
		);
	});
});

// ── 통합: SessionStart surface (real cli subprocess) ───────────────────────
describe('SessionStart — 4-mode surface', () => {
	it('absent → 침묵 (additionalContext 없음)', () => {
		const root = makeAbsent();
		try {
			const r = runHook('SessionStart', root);
			assert.equal(r.status, 0);
			const out = JSON.parse(r.stdout);
			assert.ok(!out.hookSpecificOutput || !out.hookSpecificOutput.additionalContext);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('cold-start → 미초기화 surface (init 안내)', () => {
		const root = makeColdStart();
		try {
			const r = runHook('SessionStart', root);
			assert.equal(r.status, 0);
			const ac = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
			assert.ok(ac.includes('미초기화'));
			assert.ok(ac.includes('chain-driver init'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('corrupt → fail-closed surface (손상 안내)', () => {
		const root = makeCorrupt();
		try {
			const r = runHook('SessionStart', root);
			assert.equal(r.status, 0);
			const ac = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
			assert.ok(ac.includes('손상'));
			assert.ok(ac.includes('fail-closed'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('live → ready surface (손상/미초기화 아님)', () => {
		const root = makeLive();
		try {
			const r = runHook('SessionStart', root);
			assert.equal(r.status, 0);
			const ac = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
			assert.ok(!ac.includes('손상'));
			assert.ok(!ac.includes('미초기화'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

// ── 통합: PreToolUse enforcement (real cli subprocess) ─────────────────────
describe('PreToolUse — 4-mode enforcement', () => {
	it('cold-start + orphan chain 산출물(behavior-spec) → deny (exit 2)', () => {
		const root = makeColdStart();
		try {
			const r = runHook('PreToolUse', root, orphanWrite(root));
			assert.equal(r.status, 2);
			assert.ok(r.stderr.includes('blocked'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('cold-start + discovery-spec(UC=입구) → allow (exit 0)', () => {
		const root = makeColdStart();
		try {
			const r = runHook('PreToolUse', root, discoverySpecWrite(root));
			assert.equal(r.status, 0);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('cold-start + source 코드 write → allow (parity / source 미차단)', () => {
		const root = makeColdStart();
		try {
			const r = runHook('PreToolUse', root, sourceWrite(root));
			assert.equal(r.status, 0);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('corrupt + .ai-context write → deny (exit 2 / fail-closed)', () => {
		const root = makeCorrupt();
		try {
			const r = runHook('PreToolUse', root, aiContextWrite(root));
			assert.equal(r.status, 2);
			assert.ok(r.stderr.includes('blocked'));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('corrupt + source 코드 write → allow (exit 0 / source 미차단)', () => {
		const root = makeCorrupt();
		try {
			const r = runHook('PreToolUse', root, sourceWrite(root));
			assert.equal(r.status, 0);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it('absent + source write → allow (방법론 미사용 레포 무차단)', () => {
		const root = makeAbsent();
		try {
			const r = runHook('PreToolUse', root, sourceWrite(root));
			assert.equal(r.status, 0);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

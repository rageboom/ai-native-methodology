// gate-surfacing-hard-deny.test.js — DEC-2026-07-02-analysis-exit-gate-surfacing-hard-deny.
//
// gate #0 (analysis exit) 표면화(layer 3) 결정론 강제 검증:
//   - 판정·차단은 이미 결정론(gate-eval + state.blocked). 여기선 "표면화" 자체를 전진 전제조건으로 승격.
//   - 위조불가 신호 = UserPromptSubmit 발급 결정 토큰(user_gate_token). LLM 은 UserPromptSubmit 이벤트를
//     유발 불가 → 토큰은 실제 사람 결단의 증거 (plan-review-server spawn 마커 동급 / text-gate advisory 한계 초과).
//
// 커버리지:
//   A. deriveGateDecisionToken (순수) — pending 중에만 발동 / go·stop·revisit 매칭 / 비-결정 null
//   B. userGateTokenFresh (순수) — consumed·stage·presented_at 경계
//   C. E2E — 토큰/auto 없는 go 는 hold(exit1, gate_not_surfaced, pending_gate set) / auto 는 전진 / 토큰 소비 전진
//   D. E2E — hold 중 PreToolUse .ai-context write deny (blocked 재사용) / pending 부재 시 토큰 미발급

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { userGateTokenFresh } from '../src/gate-provenance.js';
import { deriveGateDecisionToken } from '../src/hooks-bridge.js';
import { initState, readState } from '../src/state-store.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CLI_PATH = resolve(__dirname, '..', 'src', 'cli.js');

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'gate-surface-'));
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

function freshRoot(name) {
	const root = join(tmp, name);
	mkdirSync(root, { recursive: true });
	initState(root, name);
	return root;
}
function next(root, extra = []) {
	return spawnSync('node', [CLI_PATH, 'next', root, ...extra], {
		encoding: 'utf-8',
		timeout: 20000,
	});
}
function hook(root, payload) {
	return spawnSync('node', [CLI_PATH, 'hooks-bridge'], {
		encoding: 'utf-8',
		timeout: 20000,
		input: JSON.stringify({ cwd: root, ...payload }),
	});
}

// ─────────────────────────────────────────────────────────────────────────
// A. deriveGateDecisionToken (순수)
// ─────────────────────────────────────────────────────────────────────────
describe('deriveGateDecisionToken (위조불가 토큰 매칭 / 순수)', () => {
	const pending = { stage: 'analysis', gate_id: '#0', presented_at: '2026-07-02T00:00:00.000Z' };

	it('pending_gate 부재 → 항상 null (평상시 미발동)', () => {
		assert.equal(deriveGateDecisionToken('go', null), null);
		assert.equal(deriveGateDecisionToken('go', {}), null);
	});
	it("pending 중 'go' / '진행' / '승인' → decision:go", () => {
		assert.deepEqual(deriveGateDecisionToken('go', pending), { decision: 'go' });
		assert.deepEqual(deriveGateDecisionToken('진행할게', pending), { decision: 'go' });
		assert.deepEqual(deriveGateDecisionToken('승인', pending), { decision: 'go' });
		assert.deepEqual(deriveGateDecisionToken('/chain-next go', pending), { decision: 'go' });
	});
	it("pending 중 'stop' / '중단' → decision:stop", () => {
		assert.deepEqual(deriveGateDecisionToken('stop', pending), { decision: 'stop' });
		assert.deepEqual(deriveGateDecisionToken('중단해줘', pending), { decision: 'stop' });
	});
	it("pending 중 'revisit:spec' → decision:revisit:spec", () => {
		assert.deepEqual(deriveGateDecisionToken('revisit:spec', pending), {
			decision: 'revisit:spec',
		});
	});
	it('비-결정 프롬프트 → null (정상 routeEntry 폴백)', () => {
		assert.equal(deriveGateDecisionToken('이거 왜 막혔어?', pending), null);
		assert.equal(deriveGateDecisionToken('gopher 리팩터해줘', pending), null);
	});
});

// ─────────────────────────────────────────────────────────────────────────
// B. userGateTokenFresh (순수)
// ─────────────────────────────────────────────────────────────────────────
describe('userGateTokenFresh (토큰 fresh 판정 / 순수)', () => {
	const presented = '2026-07-02T00:00:00.000Z';
	it('null / consumed / stage 불일치 → false', () => {
		assert.equal(userGateTokenFresh(null, 'analysis', presented), false);
		assert.equal(
			userGateTokenFresh(
				{ stage: 'analysis', decision: 'go', issued_at: presented, nonce: 'x', consumed: true },
				'analysis',
				presented,
			),
			false,
		);
		assert.equal(
			userGateTokenFresh(
				{ stage: 'discovery', decision: 'go', issued_at: presented, nonce: 'x', consumed: false },
				'analysis',
				presented,
			),
			false,
		);
	});
	it('issued_at >= presented_at → true / 이전 → false', () => {
		const after = '2026-07-02T00:00:01.000Z';
		const before = '2026-07-01T23:59:59.000Z';
		assert.equal(
			userGateTokenFresh(
				{ stage: 'analysis', decision: 'go', issued_at: after, nonce: 'x', consumed: false },
				'analysis',
				presented,
			),
			true,
		);
		assert.equal(
			userGateTokenFresh(
				{ stage: 'analysis', decision: 'go', issued_at: before, nonce: 'x', consumed: false },
				'analysis',
				presented,
			),
			false,
		);
	});
});

// ─────────────────────────────────────────────────────────────────────────
// C. E2E — hold / auto / 토큰 소비
// ─────────────────────────────────────────────────────────────────────────
describe('gate #0 표면화 강제 E2E (CLI)', () => {
	it('토큰·auto 없는 `next --user-decision go` → hold (exit1 / gate_not_surfaced / pending_gate set / 미전진)', () => {
		const root = freshRoot('hold');
		const r = next(root, ['--user-decision', 'go']);
		assert.equal(r.status, 1, `표면화 hold = exit 1 (got ${r.status}) / ${r.stderr}`);
		const s = readState(root);
		assert.equal(s.blocked, true, 'hold → blocked=true');
		assert.equal(s.block_reason, 'gate_not_surfaced', 'block_reason=gate_not_surfaced');
		assert.ok(s.pending_gate, 'pending_gate set');
		assert.equal(s.pending_gate.stage, 'analysis');
		assert.equal(s.pending_gate.gate_id, '#0');
		assert.equal(s.current_chain, 'analysis', '미전진 (analysis 유지)');
	});

	it('`--user-decision go --auto-mode` → 전진 (exit0 / discovery / actor=user_auto)', () => {
		const root = freshRoot('auto');
		const r = next(root, ['--user-decision', 'go', '--auto-mode']);
		assert.equal(r.status, 0, `auto 위임 전진 exit 0 (got ${r.status}) / ${r.stderr}`);
		const s = readState(root);
		assert.equal(s.blocked, false);
		assert.equal(s.current_chain, 'discovery', '전진 = discovery');
		assert.equal(s.pending_gate ?? null, null, 'pending_gate clear');
	});

	it('위조불가 토큰 발급(UserPromptSubmit) 후 go → 전진 + 토큰 소비', () => {
		const root = freshRoot('token');
		// ① hold
		assert.equal(next(root, ['--user-decision', 'go']).status, 1, '① hold exit1');
		assert.ok(readState(root).pending_gate, '① pending_gate set');
		// ② 사용자 결정 프롬프트 → UserPromptSubmit 훅이 위조불가 토큰 발급
		const h = hook(root, { hook_event_name: 'UserPromptSubmit', prompt: 'go' });
		assert.equal(h.status, 0, `② 훅 exit0 (got ${h.status}) / ${h.stderr}`);
		const tok = readState(root).user_gate_token;
		assert.ok(tok, '② user_gate_token 발급됨');
		assert.equal(tok.stage, 'analysis');
		assert.equal(tok.decision, 'go');
		assert.equal(tok.consumed, false);
		// ③ 토큰 존재 → next go 전진 + 토큰 소비 + pending clear
		const r3 = next(root, ['--user-decision', 'go']);
		assert.equal(r3.status, 0, `③ 토큰 전진 exit0 (got ${r3.status}) / ${r3.stderr}`);
		const s3 = readState(root);
		assert.equal(s3.current_chain, 'discovery', '③ 전진 = discovery');
		assert.equal(s3.blocked, false, '③ blocked 해소');
		assert.equal(s3.pending_gate ?? null, null, '③ pending_gate clear');
		assert.equal(s3.user_gate_token ?? null, null, '③ 토큰 단일 소비(clear)');
	});

	it('결단 불일치 방어 — 사용자 stop 토큰으로 LLM go 는 전진 ❌ (hold 유지)', () => {
		const root = freshRoot('mismatch');
		next(root, ['--user-decision', 'go']); // hold + pending_gate
		// 사용자가 'stop' 을 제출 → 토큰 decision=stop
		hook(root, { hook_event_name: 'UserPromptSubmit', prompt: 'stop' });
		assert.equal(readState(root).user_gate_token.decision, 'stop', 'stop 토큰 발급');
		// LLM 이 go 를 밀어넣어도 토큰 decision(stop)≠go → 전진 ❌
		const r = next(root, ['--user-decision', 'go']);
		assert.equal(r.status, 1, `불일치 → hold 유지 exit1 (got ${r.status})`);
		assert.equal(readState(root).current_chain, 'analysis', '미전진 (analysis 유지)');
	});
});

// ─────────────────────────────────────────────────────────────────────────
// D. E2E — hold 중 write deny (blocked 재사용) / pending 부재 시 토큰 미발급
// ─────────────────────────────────────────────────────────────────────────
describe('표면화 hold 부수 효과', () => {
	it('hold 중 PreToolUse .ai-context write → deny (blocked=gate_not_surfaced 재사용)', () => {
		const root = freshRoot('deny');
		next(root, ['--user-decision', 'go']); // hold
		const h = hook(root, {
			hook_event_name: 'PreToolUse',
			tool_name: 'Write',
			tool_input: { file_path: join(root, '.ai-context', 'base', 'discovery-spec.json') },
		});
		assert.equal(h.status, 2, `deny = exit 2 (got ${h.status}) / ${h.stdout}`);
		assert.match(h.stdout, /deny/i, 'permissionDecision deny');
		assert.match(h.stdout, /gate_not_surfaced/, 'reason = gate_not_surfaced');
	});

	it('pending_gate 부재 시 결정 프롬프트여도 토큰 미발급 (평상시 무영향)', () => {
		const root = freshRoot('nopending');
		const h = hook(root, { hook_event_name: 'UserPromptSubmit', prompt: 'go' });
		assert.equal(h.status, 0);
		assert.equal(readState(root).user_gate_token ?? null, null, '토큰 미발급');
	});
});

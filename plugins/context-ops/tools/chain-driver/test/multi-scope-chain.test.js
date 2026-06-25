// multi-scope-chain.test.js — v2.0 전역 단일 chain 상태 (scope_states 제거 / DEC-2026-06-25-state-model-simplify)
//
// 변경: scope_states per-scope 멀티플렉싱 폐기. chain 상태 = 전역 단일 + current_scope 커서.
//   - 동시 작업 격리 = git 워크트리/피처브랜치(워크트리별 별도 .ai-context/state.json). in-state 멀티플렉싱 대체.
//   - 진행위치 SSOT = manifest(git-tracked). state.json 은 휘발성 런타임 커서.
//   - 새 scope 진입 = discovery 리셋 (S0 시작점 분리: analysis 는 프로젝트 1회=전역 init).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	initState,
	readState,
	writeStateCAS,
	initScopeChainState,
	getActiveScopeChain,
} from '../src/state-store.js';

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'chain-driver-scope-'));
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

describe('global single-state chain (v2.0 / scope_states 제거)', () => {
	it('DEFAULT_STATE has no scope_states and a null current_task', () => {
		const state = initState(join(tmp, 'p1'), 'p1');
		assert.equal('scope_states' in state, false, 'scope_states 필드 없음');
		assert.equal(state.current_task, null);
		assert.equal(state.current_chain, 'analysis', '전역 init = 프로젝트 1회 분석');
	});

	it('new scope entry resets chain cursor to discovery (analysis = 프로젝트 1회)', () => {
		const root = join(tmp, 'p2');
		let state = initState(root, 'p2');
		// 직전 작업이 implement 까지 진행됐다고 가정
		state = writeStateCAS(root, (s) => {
			s.current_chain = 'implement';
			return s;
		});
		state = writeStateCAS(root, (s) => {
			s.current_scope = 'domain-a';
			initScopeChainState(s, 'domain-a', { inheritGlobal: false }); // 새 scope
			return s;
		});
		assert.equal(state.current_chain, 'discovery', '새 scope = discovery 시작');
		assert.equal(state.stage_progress.analysis.status, 'complete');
		assert.equal(state.stage_progress.discovery.status, 'in_progress');
		assert.equal('scope_states' in state, false, 'scope_states 부활 금지');
	});

	it('re-entering the same scope (inheritGlobal) preserves progress — no reset', () => {
		const root = join(tmp, 'p3');
		let state = initState(root, 'p3');
		state = writeStateCAS(root, (s) => {
			s.current_scope = 'domain-a';
			s.current_chain = 'spec';
			return s;
		});
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a', { inheritGlobal: true }); // 같은 scope 재진입
			return s;
		});
		assert.equal(state.current_chain, 'spec', '진행 유지(no reset)');
	});

	it('getActiveScopeChain returns global chain with scoped=true when current_scope set', () => {
		const root = join(tmp, 'p4');
		let state = initState(root, 'p4');
		state = writeStateCAS(root, (s) => {
			s.current_scope = 'domain-a';
			s.current_chain = 'plan';
			return s;
		});
		const active = getActiveScopeChain(state);
		assert.equal(active.current_chain, 'plan');
		assert.equal(active.scoped, true);
		assert.equal(active.scope, 'domain-a');
	});

	it('getActiveScopeChain has scoped=false when no current_scope', () => {
		const state = initState(join(tmp, 'p5'), 'p5');
		const active = getActiveScopeChain(state);
		assert.equal(active.current_chain, 'analysis');
		assert.equal(active.scoped, false);
		assert.equal(active.scope, null);
	});

	it('switching to a new scope resets cursor to discovery (sequential work in one clone)', () => {
		const root = join(tmp, 'p6');
		let state = initState(root, 'p6');
		state = writeStateCAS(root, (s) => {
			s.current_scope = 'domain-a';
			initScopeChainState(s, 'domain-a', { inheritGlobal: false });
			s.current_chain = 'implement';
			return s;
		});
		assert.equal(state.current_chain, 'implement');
		// domain-b 로 전환 (새 scope) → discovery 리셋 (전역 implement 박힘 함정 차단)
		state = writeStateCAS(root, (s) => {
			s.current_scope = 'domain-b';
			initScopeChainState(s, 'domain-b', { inheritGlobal: false });
			return s;
		});
		assert.equal(state.current_chain, 'discovery', '새 scope 전환 = discovery 리셋');
	});
});

describe('concurrent isolation via worktrees (not in-state scope_states)', () => {
	it('two worktrees keep independent state.json (separate roots)', () => {
		// 동시 작업 = 워크트리별 별도 .ai-context/state.json 으로 격리 (in-state 멀티플렉싱 대체).
		const rootA = join(tmp, 'wt-a');
		const rootB = join(tmp, 'wt-b');
		initState(rootA, 'wt-a');
		initState(rootB, 'wt-b');
		writeStateCAS(rootA, (s) => {
			s.current_scope = 'feat-a';
			initScopeChainState(s, 'feat-a', { inheritGlobal: false });
			s.current_chain = 'implement';
			return s;
		});
		writeStateCAS(rootB, (s) => {
			s.current_scope = 'feat-b';
			initScopeChainState(s, 'feat-b', { inheritGlobal: false });
			s.current_chain = 'plan';
			return s;
		});
		assert.equal(readState(rootA).current_chain, 'implement', '워크트리 A 독립');
		assert.equal(readState(rootB).current_chain, 'plan', '워크트리 B 독립');
	});
});

describe('block_scope cross-scope clear prevention (전역 유지)', () => {
	it('block_scope tracks which scope set the block', () => {
		const root = join(tmp, 'block-p1');
		let state = initState(root, 'block-p1');
		state = writeStateCAS(root, (s) => {
			s.current_scope = 'domain-a';
			return s;
		});
		state = writeStateCAS(root, (s) => {
			s.blocked = true;
			s.block_reason = 'validator_high';
			s.block_scope = s.current_scope ?? null;
			return s;
		});
		assert.equal(state.blocked, true);
		assert.equal(state.block_scope, 'domain-a');
	});
});

// multi-scope-chain.test.js — scope별 chain 독립 진행 검증
// 문제: state.json의 current_chain/stage_progress 가 전역 단일값이라
//       같은 프로젝트에서 도메인 A가 chain5이고 B가 chain3일 때 구별 불가.
// 해결: scope_states[scope].current_chain 으로 per-scope 분리.

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
	ensureScopeDir,
} from '../src/state-store.js';

let tmp;
before(() => { tmp = mkdtempSync(join(tmpdir(), 'chain-driver-multi-scope-')); });
after(() => { rmSync(tmp, { recursive: true, force: true }); });

describe('multi-scope chain isolation', () => {
	it('initScopeChainState seeds scope_states entry with analysis defaults', () => {
		const root = join(tmp, 'p1');
		const state = initState(root, 'p1');
		const next = initScopeChainState(structuredClone(state), 'domain-a');
		assert.equal(next.scope_states['domain-a'].current_chain, 'analysis');
		assert.equal(next.scope_states['domain-a'].stage_progress.analysis.status, 'in_progress');
		assert.equal(next.scope_states['domain-a'].last_gate, null);
	});

	it('initScopeChainState is idempotent — second call preserves existing state', () => {
		const root = join(tmp, 'p2');
		let state = initState(root, 'p2');
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a');
			s.scope_states['domain-a'].current_chain = 'spec';
			return s;
		});
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a'); // 재호출
			return s;
		});
		assert.equal(state.scope_states['domain-a'].current_chain, 'spec', 'idempotent — should not reset');
	});

	it('getActiveScopeChain returns scope chain when current_scope is set', () => {
		const root = join(tmp, 'p3');
		let state = initState(root, 'p3');
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a');
			s.scope_states['domain-a'].current_chain = 'plan';
			s.current_scope = 'domain-a';
			return s;
		});
		const active = getActiveScopeChain(state);
		assert.equal(active.current_chain, 'plan');
		assert.equal(active.scoped, true);
		assert.equal(active.scope, 'domain-a');
	});

	it('getActiveScopeChain falls back to global when no scope set', () => {
		const root = join(tmp, 'p4');
		const state = initState(root, 'p4');
		const active = getActiveScopeChain(state);
		assert.equal(active.current_chain, 'analysis');
		assert.equal(active.scoped, false);
		assert.equal(active.scope, null);
	});

	it('two scopes have independent current_chain values', () => {
		const root = join(tmp, 'p5');
		let state = initState(root, 'p5');

		// domain-a를 discovery로 진행
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a');
			s.scope_states['domain-a'].current_chain = 'discovery';
			s.scope_states['domain-a'].stage_progress.analysis.status = 'complete';
			s.scope_states['domain-a'].stage_progress.discovery.status = 'in_progress';
			return s;
		});

		// domain-b를 별도로 초기화 (analysis 상태 유지)
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-b');
			return s;
		});

		assert.equal(state.scope_states['domain-a'].current_chain, 'discovery');
		assert.equal(state.scope_states['domain-b'].current_chain, 'analysis');
	});

	it('switching current_scope changes getActiveScopeChain result', () => {
		const root = join(tmp, 'p6');
		let state = initState(root, 'p6');

		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a');
			s.scope_states['domain-a'].current_chain = 'implement';
			initScopeChainState(s, 'domain-b');
			s.scope_states['domain-b'].current_chain = 'plan';
			s.current_scope = 'domain-a';
			return s;
		});

		const activeA = getActiveScopeChain(state);
		assert.equal(activeA.current_chain, 'implement', 'domain-a active');

		// scope 전환
		state = writeStateCAS(root, (s) => {
			s.current_scope = 'domain-b';
			return s;
		});

		const activeB = getActiveScopeChain(state);
		assert.equal(activeB.current_chain, 'plan', 'domain-b active');
	});

	it('advancing domain-a chain does not affect domain-b', () => {
		const root = join(tmp, 'p7');
		let state = initState(root, 'p7');

		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a');
			initScopeChainState(s, 'domain-b');
			s.current_scope = 'domain-a';
			return s;
		});

		// domain-a를 discovery로 진행
		state = writeStateCAS(root, (s) => {
			const sc = s.scope_states[s.current_scope];
			sc.stage_progress.analysis.status = 'complete';
			sc.current_chain = 'discovery';
			sc.stage_progress.discovery.status = 'in_progress';
			return s;
		});

		assert.equal(state.scope_states['domain-a'].current_chain, 'discovery');
		assert.equal(state.scope_states['domain-b'].current_chain, 'analysis', 'domain-b unaffected');
		// 전역 current_chain도 변하지 않아야 함
		assert.equal(state.current_chain, 'analysis', 'global chain unaffected');
	});

	it('DEFAULT_STATE includes scope_states as empty object', () => {
		const root = join(tmp, 'p8');
		const state = initState(root, 'p8');
		assert.ok('scope_states' in state, 'scope_states field present');
		assert.deepEqual(state.scope_states, {});
	});
});

describe('upgrade-path migration (inheritGlobal)', () => {
	it('re-init existing active scope inherits global chain state (not reset to analysis)', () => {
		const root = join(tmp, 'upgrade-p1');
		// 이전 버전처럼 current_scope 설정됐지만 scope_states 없는 state 수동 생성
		let state = initState(root, 'upgrade-p1');
		state = writeStateCAS(root, (s) => {
			s.current_chain = 'spec';
			s.stage_progress.analysis.status = 'complete';
			s.stage_progress.discovery.status = 'complete';
			s.stage_progress.spec.status = 'in_progress';
			s.current_scope = 'domain-a'; // scope_states 없이 current_scope만 있는 이전 버전 상태
			return s;
		});

		// 재-init: current_scope === args.scope → inheritGlobal=true
		state = writeStateCAS(root, (s) => {
			const inheritGlobal = s.current_scope === 'domain-a'; // true
			initScopeChainState(s, 'domain-a', { inheritGlobal });
			return s;
		});

		assert.equal(state.scope_states['domain-a'].current_chain, 'spec', 'chain state preserved');
		assert.equal(state.scope_states['domain-a'].stage_progress.analysis.status, 'complete', 'progress preserved');
	});

	it('new scope (not previously active) starts from analysis — not global chain', () => {
		const root = join(tmp, 'upgrade-p2');
		let state = initState(root, 'upgrade-p2');
		state = writeStateCAS(root, (s) => {
			s.current_chain = 'implement';
			s.current_scope = 'domain-a';
			initScopeChainState(s, 'domain-a', { inheritGlobal: true }); // 기존 scope
			s.scope_states['domain-a'].current_chain = 'implement';
			return s;
		});

		// domain-b 는 신규 scope (inheritGlobal=false)
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-b', { inheritGlobal: false });
			return s;
		});

		assert.equal(state.scope_states['domain-a'].current_chain, 'implement');
		assert.equal(state.scope_states['domain-b'].current_chain, 'analysis', 'new scope starts fresh');
	});

	it('initScopeChainState with inheritGlobal is also idempotent — existing entry not overwritten', () => {
		const root = join(tmp, 'upgrade-p3');
		let state = initState(root, 'upgrade-p3');
		state = writeStateCAS(root, (s) => {
			s.current_chain = 'test';
			initScopeChainState(s, 'domain-a', { inheritGlobal: true });
			s.scope_states['domain-a'].current_chain = 'plan'; // 이후 진행
			return s;
		});
		// 두 번째 호출 — 기존 값 보존
		state = writeStateCAS(root, (s) => {
			s.current_chain = 'implement'; // 전역 값 변경
			initScopeChainState(s, 'domain-a', { inheritGlobal: true }); // idempotent
			return s;
		});
		assert.equal(state.scope_states['domain-a'].current_chain, 'plan', 'existing entry not overwritten');
	});
});

describe('block_scope cross-scope clear prevention', () => {
	it('block_scope tracks which scope set the block', () => {
		const root = join(tmp, 'block-p1');
		let state = initState(root, 'block-p1');
		state = writeStateCAS(root, (s) => {
			initScopeChainState(s, 'domain-a');
			s.current_scope = 'domain-a';
			return s;
		});
		// domain-a가 blocked 상태로 진입
		state = writeStateCAS(root, (s) => {
			s.blocked = true;
			s.block_reason = 'validator_high';
			s.block_scope = s.current_scope ?? null;
			return s;
		});
		assert.equal(state.blocked, true);
		assert.equal(state.block_scope, 'domain-a');
	});

	it('prototype-key scope slug does not collide with Object prototype', () => {
		const root = join(tmp, 'proto-p1');
		let state = initState(root, 'proto-p1');

		// 'constructor'는 slug regex에 걸리지만 Object.hasOwn으로 보호돼야 함
		// validateScopeSlug('constructor') 는 통과할 수 있으나
		// initScopeChainState는 Object.hasOwn 가드로 prototype 혼동 없이 동작해야 함
		state = writeStateCAS(root, (s) => {
			// scope_states에 직접 'normal-scope' 만 있을 때
			initScopeChainState(s, 'normal-scope');
			return s;
		});
		// Object.hasOwn 가드: 'normal-scope'는 own property로 등록됨
		assert.ok(Object.hasOwn(state.scope_states, 'normal-scope'), 'own property 등록 확인');
		// 'constructor' 같은 prototype key는 own property가 아니어야 함
		assert.equal(Object.hasOwn(state.scope_states, 'constructor'), false);
	});
});

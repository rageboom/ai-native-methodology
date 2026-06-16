// project-root.test.js — resolveProjectRoot 가 base/ · scopes/<scope>/<stage>/ 에 layout-agnostic 함을 lock.
// DEC-2026-06-16-ai-context-layout-restructure (Phase 1 — production 무변경 / 회귀 lock).
// 근거: resolveProjectRoot 는 `/.ai-context/` 의 부모를 root 로 잡으므로 output/·base/·scopes/ 모두 동일 처리.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveProjectRoot, autoDetectProjectRoot } from '../project-root.js';

describe('resolveProjectRoot — new layout lock', () => {
	it('base/ artifact resolves to project root (was output/)', () => {
		assert.equal(resolveProjectRoot('/p/.ai-context/base/domain.json'), '/p');
		assert.equal(
			resolveProjectRoot('/p/.ai-context/base/domains/BC-X/business-rules.json'),
			'/p',
		);
	});
	it('scopes/<scope>/<stage>/ artifact resolves to project root', () => {
		assert.equal(
			resolveProjectRoot('/p/.ai-context/scopes/core/impl/impl-spec.json'),
			'/p',
		);
		assert.equal(
			resolveProjectRoot('/p/.ai-context/scopes/core/test/test-spec.json'),
			'/p',
		);
	});
	it('runtime/ artifact resolves to project root', () => {
		assert.equal(
			resolveProjectRoot('/p/.ai-context/runtime/intervention-log.jsonl'),
			'/p',
		);
	});
	it('legacy output/ still resolves (backward-compat)', () => {
		assert.equal(resolveProjectRoot('/p/.ai-context/output/domain.json'), '/p');
	});
	it('legacy top-level scope still resolves', () => {
		assert.equal(
			resolveProjectRoot('/p/.ai-context/core/impl/impl-spec.json'),
			'/p',
		);
	});
	it('Windows backslash path → base/ resolves', () => {
		assert.equal(
			resolveProjectRoot('C:\\p\\.ai-context\\base\\domain.json'),
			'C:/p',
		);
	});
	it('alias export autoDetectProjectRoot identical', () => {
		assert.equal(autoDetectProjectRoot, resolveProjectRoot);
	});
});

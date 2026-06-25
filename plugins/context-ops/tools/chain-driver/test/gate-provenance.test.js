import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { deriveGateActor, reviewPassageFresh } from '../src/gate-provenance.js';
import { gateReviewPassagePath } from '../../_shared/ai-context-layout.js';

// DEC-2026-06-25-gate-review-bypass-guard (Phase 1) — actor provenance 정직 도출.
// 검토 UX 경유 증거(gate-review-passage 마커) + --auto-mode 로 user/user_auto/llm_assumed 분기.

const STAGE = 'discovery';
const STARTED = '2026-06-25T10:00:00.000Z';
const ACTIVE = { stage_progress: { [STAGE]: { status: 'in_progress', started_at: STARTED } } };

// reader 주입 = 디스크 무관 결정론 테스트.
const noMarker = () => null;
const freshMarker = () => ({ stage: STAGE, presented_at: '2026-06-25T10:05:00.000Z', via: 'plan_review_server' });
const staleMarker = () => ({ stage: STAGE, presented_at: '2026-06-25T09:55:00.000Z', via: 'plan_review_server' });
const otherStageMarker = () => ({ stage: 'spec', presented_at: '2026-06-25T10:05:00.000Z', via: 'plan_review_server' });

describe('deriveGateActor — go provenance 3-값 도출', () => {
	it('--user-decision 없음 → driver', () => {
		assert.equal(deriveGateActor({}, '/x', STAGE, ACTIVE, noMarker), 'driver');
	});

	it('stop → user (명시 안전 행동)', () => {
		assert.equal(deriveGateActor({ userDecision: 'stop' }, '/x', STAGE, ACTIVE, noMarker), 'user');
	});

	it('revisit:<stage> → user (명시 안전 행동)', () => {
		assert.equal(deriveGateActor({ userDecision: 'revisit:spec' }, '/x', STAGE, ACTIVE, noMarker), 'user');
	});

	it('go + --auto-mode → user_auto (Auto Mode 명시 위임)', () => {
		assert.equal(deriveGateActor({ userDecision: 'go', autoMode: true }, '/x', STAGE, ACTIVE, noMarker), 'user_auto');
	});

	it('go + 검토 마커 fresh → user', () => {
		assert.equal(deriveGateActor({ userDecision: 'go' }, '/x', STAGE, ACTIVE, freshMarker), 'user');
	});

	it('go + 마커 없음 → llm_assumed (우회 추정 / 핵심 정직화) [적대 negative]', () => {
		assert.equal(deriveGateActor({ userDecision: 'go' }, '/x', STAGE, ACTIVE, noMarker), 'llm_assumed');
	});

	it('go + 마커 stale (재진입 전 마커) → llm_assumed', () => {
		assert.equal(deriveGateActor({ userDecision: 'go' }, '/x', STAGE, ACTIVE, staleMarker), 'llm_assumed');
	});

	it('go + 다른 stage 마커 → llm_assumed', () => {
		assert.equal(deriveGateActor({ userDecision: 'go' }, '/x', STAGE, ACTIVE, otherStageMarker), 'llm_assumed');
	});

	it('--auto-mode 가 마커보다 우선(둘 다 있어도 user_auto)', () => {
		assert.equal(deriveGateActor({ userDecision: 'go', autoMode: true }, '/x', STAGE, ACTIVE, freshMarker), 'user_auto');
	});
});

describe('reviewPassageFresh — 마커 freshness', () => {
	it('started_at 부재 + stage 일치 → best-effort true (advisory 관대)', () => {
		const active = { stage_progress: { [STAGE]: { status: 'in_progress' } } };
		assert.equal(reviewPassageFresh('/x', STAGE, active, freshMarker), true);
	});

	it('fresh 마커 → true', () => {
		assert.equal(reviewPassageFresh('/x', STAGE, ACTIVE, freshMarker), true);
	});

	it('stale 마커 → false', () => {
		assert.equal(reviewPassageFresh('/x', STAGE, ACTIVE, staleMarker), false);
	});

	it('마커 없음(reader null) → false', () => {
		assert.equal(reviewPassageFresh('/x', STAGE, ACTIVE, noMarker), false);
	});

	it('reader throw → false (graceful)', () => {
		const boom = () => { throw new Error('disk'); };
		assert.equal(reviewPassageFresh('/x', STAGE, ACTIVE, boom), false);
	});
});

describe('reviewPassageFresh — 디스크 read (plan-review-server 마커 실경로 정합)', () => {
	it('plan-review-server 가 쓴 경로를 chain-driver 가 read → fresh', () => {
		const root = mkdtempSync(join(tmpdir(), 'grp-'));
		try {
			const p = gateReviewPassagePath(root);
			mkdirSync(join(root, '.ai-context', 'runtime'), { recursive: true });
			writeFileSync(p, JSON.stringify({ stage: STAGE, presented_at: '2026-06-25T10:05:00.000Z', via: 'plan_review_server' }), 'utf-8');
			// reader 미주입 → 실제 디스크 read 경로 검증 (양쪽 SSOT 경로 정합).
			assert.equal(reviewPassageFresh(root, STAGE, ACTIVE), true);
			assert.equal(deriveGateActor({ userDecision: 'go' }, root, STAGE, ACTIVE), 'user');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('마커 파일 부재 → false (디스크 경로)', () => {
		const root = mkdtempSync(join(tmpdir(), 'grp-'));
		try {
			assert.equal(reviewPassageFresh(root, STAGE, ACTIVE), false);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

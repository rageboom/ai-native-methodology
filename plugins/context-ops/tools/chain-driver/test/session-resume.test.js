// session-resume.test.js — MIS-428 [OP-SESSION-001]
//   buildSessionResumeSummary(state) 순수 합성 검증.
//   "현재 stage"=statusLine 담당 / 본 helper="남은 단계 + 대기 항목" 보강 / 활성 chain 없으면 null(침묵).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionResumeSummary } from '../src/session-resume.js';

describe('buildSessionResumeSummary', () => {
	it('활성 chain(mid) — 헤더 + 남은 단계, 대기 없음', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'spec',
			current_scope: 'BC-FOO',
			blocked: false,
		});
		assert.ok(out, 'should return a summary string');
		const lines = out.split('\n');
		assert.equal(lines[0], '🧭 세션 재개 — spec 2/5 · BC-FOO');
		assert.equal(lines[1], '   남은 단계: plan → test → implement');
		assert.equal(lines.length, 2, '대기 항목 없으면 대기 줄 suppress');
	});

	it('analysis(gate#0) — 헤더만 / 남은 단계 줄 생략(idx<0)', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'analysis',
			current_scope: 'BC-BAR',
			blocked: false,
		});
		assert.ok(out);
		const lines = out.split('\n');
		assert.equal(lines[0], '🧭 세션 재개 — analysis · BC-BAR');
		assert.equal(lines.length, 1, 'analysis 는 5-stage 밖 → 남은 단계/대기 줄 없음');
	});

	it('마지막 단계(implement) — 남은 단계 줄 생략(idx=last)', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'implement',
			current_scope: 'BC-FOO',
			blocked: false,
		});
		assert.ok(out);
		assert.ok(!out.includes('남은 단계'), 'implement 뒤 단계 없음 → 줄 없음');
	});

	it('idle(current_chain=null) — null 반환(전체 침묵)', () => {
		assert.equal(buildSessionResumeSummary({ current_chain: null }), null);
		assert.equal(buildSessionResumeSummary({}), null);
	});

	it('null/비-객체 state — null 반환(방어)', () => {
		assert.equal(buildSessionResumeSummary(null), null);
		assert.equal(buildSessionResumeSummary(undefined), null);
		assert.equal(buildSessionResumeSummary('nope'), null);
		assert.equal(buildSessionResumeSummary(42), null);
	});

	it('blocked — 헤더 ⛔ prefix + 대기 blocked:<reason>', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'plan',
			current_scope: 'BC-X',
			blocked: true,
			block_reason: 'gate#3 stop',
		});
		const lines = out.split('\n');
		assert.equal(lines[0], '🧭 세션 재개 — ⛔ plan 3/5 · BC-X');
		assert.equal(lines[1], '   남은 단계: test → implement');
		assert.equal(lines[2], '   대기: ⛔ blocked: gate#3 stop');
	});

	it('blocked 인데 block_reason 없으면 fallback "-"', () => {
		const out = buildSessionResumeSummary({ current_chain: 'plan', blocked: true });
		assert.ok(out.includes('⛔ blocked: -'));
	});

	it('pending_revisit — 대기 revisit:<target_stage>', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'test',
			current_scope: 'BC-FOO',
			blocked: false,
			pending_revisit: { target_stage: 'spec', detected_at: '2026-06-25T00:00:00Z' },
		});
		assert.ok(out.includes('↩ revisit: spec'));
	});

	it('current_task — 대기 task:<id>(<branch>)', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'spec',
			blocked: false,
			current_task: { task_id: 'OP-SESSION-001', branch: 'MIS-428', jira_key: 'MIS-428' },
		});
		assert.ok(out.includes('🔖 task: OP-SESSION-001(MIS-428)'));
	});

	it('current_task — branch 없으면 괄호 생략', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'spec',
			blocked: false,
			current_task: { task_id: 'OP-Y' },
		});
		assert.ok(out.includes('🔖 task: OP-Y'));
		assert.ok(!out.includes('OP-Y('), 'branch 없으면 () 안 붙음');
	});

	it('blocked + revisit + task 동시 — 대기 한 줄에 · 로 결합', () => {
		const out = buildSessionResumeSummary({
			current_chain: 'plan',
			current_scope: 'BC-Z',
			blocked: true,
			block_reason: 'r',
			pending_revisit: { target_stage: 'discovery' },
			current_task: { task_id: 'OP-A', branch: 'MIS-1' },
		});
		const waitLine = out.split('\n').find((l) => l.includes('대기:'));
		assert.ok(waitLine.includes('⛔ blocked: r'));
		assert.ok(waitLine.includes('↩ revisit: discovery'));
		assert.ok(waitLine.includes('🔖 task: OP-A(MIS-1)'));
		assert.equal(waitLine.split(' · ').length, 3, '세 항목 · 결합');
	});

	it('scope 없는 전역 활성 chain — scope 라벨 생략', () => {
		const out = buildSessionResumeSummary({ current_chain: 'discovery', blocked: false });
		assert.equal(out.split('\n')[0], '🧭 세션 재개 — discovery 1/5');
	});
});

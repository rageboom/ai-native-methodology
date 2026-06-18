// gate-summary.test.js — gate 결정 근거 평이 요약 레이어 (결정론).
//   레이어 1 (chain-driver): reason code → 평이 한국어 라벨 lookup + verdict 도출 + 균형형 render.
//   정책: 순수 결정론 (LLM 판단 0) — feedback_chain_driver_deterministic_axis 정합.
//   backward-compat: gate-eval reason.detail 무변 (gate-eval.test.js 정규식 보존).
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateGate, applyUserDecision } from '../src/gate-eval.js';
import {
	REASON_LABELS,
	summarizeGate,
	renderGateSummaryText,
} from '../src/gate-summary.js';

// gate-eval 이 낼 수 있는 모든 reason code (evaluateGate emit + severityRank + applyUserDecision push).
//   ★ gate-eval 에 code 추가 시 이 목록 + REASON_LABELS 를 동시 갱신해야 함 (아래 완전성 테스트가 drift fail).
const EXPECTED_CODES = [
	'validator_critical',
	'validator_high',
	's2_outcome_mismatch',
	'state_corrupt',
	'coverage_threshold',
	'layer2_threshold',
	'evidence_missing',
	'findings_unverified',
	'schema_migration_required',
	'user_stop',
];

describe('gate-summary — REASON_LABELS 완전성', () => {
	for (const code of EXPECTED_CODES) {
		it(`'${code}' 라벨 존재 (label/meaning/action 비어있지 않음)`, () => {
			const entry = REASON_LABELS[code];
			assert.ok(entry, `라벨 누락: ${code} — REASON_LABELS 에 추가 필요`);
			assert.equal(typeof entry.label, 'string');
			assert.ok(entry.label.length > 0, `${code}.label 비어있음`);
			assert.equal(typeof entry.meaning, 'string');
			assert.ok(entry.meaning.length > 0, `${code}.meaning 비어있음`);
			assert.equal(typeof entry.action, 'string');
			assert.ok(entry.action.length > 0, `${code}.action 비어있음`);
		});
	}

	it('실제 evaluateGate 가 emit 하는 code 가 모두 라벨 보유 (live trigger)', () => {
		const triggered = [
			evaluateGate('spec', { critical: 1 }),
			evaluateGate('spec', { high: 1 }),
			evaluateGate('spec', { coverage_pct: 0.7, coverage_threshold: 0.85 }),
			evaluateGate('test', { evidence_missing: ['stdout_path'] }),
			evaluateGate('discovery', { __findings_absent: true }),
			evaluateGate('spec', {
				llm_status: 'evaluated',
				llm_consistency_score: 0.5,
				llm_threshold: 0.7,
			}),
			evaluateGate('test', { outcome_mismatches: 2 }, 'S2'),
		];
		for (const r of triggered) {
			for (const reason of r.reasons) {
				assert.ok(
					REASON_LABELS[reason.code],
					`라벨 누락: ${reason.code} (live emit)`,
				);
			}
		}
	});
});

describe('gate-summary — verdict 도출 (결정론)', () => {
	it('clean → go', () => {
		const s = summarizeGate(evaluateGate('spec', { critical: 0, high: 0 }));
		assert.equal(s.verdict, 'go');
		assert.equal(s.blocking.length, 0);
		assert.equal(s.review.length, 0);
	});

	it('critical → stop (hard-block)', () => {
		const s = summarizeGate(evaluateGate('spec', { critical: 2 }));
		assert.equal(s.verdict, 'stop');
		assert.equal(s.blocking.length, 1);
		assert.equal(s.blocking[0].code, 'validator_critical');
		assert.equal(s.blocking[0].label, REASON_LABELS.validator_critical.label);
	});

	it('high → stop (hard-block)', () => {
		const s = summarizeGate(evaluateGate('spec', { high: 1 }));
		assert.equal(s.verdict, 'stop');
	});

	it('s2_outcome_mismatch → stop (hard-block)', () => {
		const s = summarizeGate(evaluateGate('test', { outcome_mismatches: 3 }, 'S2'));
		assert.equal(s.verdict, 'stop');
		assert.equal(s.blocking[0].code, 's2_outcome_mismatch');
	});

	it('coverage_threshold → review (soft / overridable)', () => {
		const s = summarizeGate(
			evaluateGate('spec', { coverage_pct: 0.6, coverage_threshold: 0.85 }),
		);
		assert.equal(s.verdict, 'review');
		assert.equal(s.review.length, 1);
		assert.equal(s.blocking.length, 0);
	});

	it('layer2_threshold → review (soft)', () => {
		const s = summarizeGate(
			evaluateGate('spec', {
				llm_status: 'evaluated',
				llm_consistency_score: 0.5,
				llm_threshold: 0.7,
			}),
		);
		assert.equal(s.verdict, 'review');
	});

	it('findings_unverified → review (soft / --user-decision go 가능)', () => {
		const s = summarizeGate(evaluateGate('discovery', { __findings_absent: true }));
		assert.equal(s.verdict, 'review');
	});

	it('critical + coverage 혼합 → stop, blocking/review 분리', () => {
		const s = summarizeGate(
			evaluateGate('spec', {
				critical: 1,
				coverage_pct: 0.5,
				coverage_threshold: 0.85,
			}),
		);
		assert.equal(s.verdict, 'stop');
		assert.equal(s.blocking.length, 1);
		assert.equal(s.review.length, 1);
	});

	it('user stop (applyUserDecision) → verdict stop', () => {
		const g = evaluateGate('spec', { critical: 0 });
		const s = summarizeGate(applyUserDecision(g, 'stop'));
		assert.equal(s.verdict, 'stop');
	});

	it('revisit decision → verdict revisit + revisit_target 파싱', () => {
		const g = evaluateGate('spec', {
			coverage_pct: 0.5,
			coverage_threshold: 0.85,
		});
		const s = summarizeGate(applyUserDecision(g, 'revisit:discovery'));
		assert.equal(s.verdict, 'revisit');
		assert.equal(s.revisit_target, 'discovery');
	});

	it('go-with-warnings (soft block 사용자 승인) → verdict go', () => {
		const g = evaluateGate('spec', {
			coverage_pct: 0.5,
			coverage_threshold: 0.85,
		});
		const s = summarizeGate(applyUserDecision(g, 'go'));
		assert.equal(s.verdict, 'go');
	});

	it('headline 은 STOP/REVIEW/GO 라벨 + 건수 포함', () => {
		assert.match(summarizeGate(evaluateGate('spec', { critical: 2 })).headline, /STOP/);
		assert.match(
			summarizeGate(
				evaluateGate('spec', { coverage_pct: 0.5, coverage_threshold: 0.85 }),
			).headline,
			/REVIEW/,
		);
		assert.match(summarizeGate(evaluateGate('spec', { critical: 0 })).headline, /GO/);
	});
});

describe('gate-summary — renderGateSummaryText (균형형)', () => {
	it('막는 문제 + 검토 권장 섹션 + 영어 code 병기 포함', () => {
		const s = summarizeGate(
			evaluateGate('spec', {
				critical: 1,
				coverage_pct: 0.5,
				coverage_threshold: 0.85,
			}),
		);
		const txt = renderGateSummaryText(s);
		assert.match(txt, /진행 불가/);
		assert.match(txt, /막는 문제/);
		assert.match(txt, /검토 권장/);
		assert.match(txt, /\(validator_critical\)/); // 영어 code 추적 병기
		assert.match(txt, /\(coverage_threshold\)/);
		assert.match(txt, /→/); // 권장 행동 화살표
	});

	it('go 는 headline 위주 / 막는 문제 섹션 없음', () => {
		const txt = renderGateSummaryText(summarizeGate(evaluateGate('spec', { critical: 0 })));
		assert.match(txt, /진행 가능/);
		assert.doesNotMatch(txt, /■ 막는 문제/); // 섹션 헤더 부재 (headline 의 '막는 문제 없음' 문구와 구분)
	});
});

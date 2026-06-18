// gate-summary.js — gate go/stop/revisit 결정 근거 "평이 요약" 레이어 (결정론 / 레이어 1).
//   목적: gate 출력의 영어 약어·jargon(validator_critical / coverage 0.62 < threshold 0.85 / layer2 ...)을
//         사용자가 "그래서 진행이냐 멈춤이냐"를 즉시 읽도록 → 한 줄 평결 + [평이 라벨 — 무슨 뜻 — 권장 행동].
//
//   신뢰/정책 모델 (feedback_chain_driver_deterministic_axis / DEC-2026-05-28 정합):
//   - 순수 결정론 — reason code → 한국어 라벨은 고정 lookup, verdict 도출은 blocked + HARD_BLOCK_CODES 규칙. LLM 판단 0.
//   - hard-block 집합은 gate-eval.HARD_BLOCK_CODES 를 SSOT 재사용 (중복 정의 금지 / verdict ↔ override 거부 정합 보장).
//   - reason.detail(영어 원문, 수치 포함)은 무변 보존 — render 에서 '근거:' 보조줄로 병기(추적용). gate-eval.test 정규식 무영향.
//   - display/summary only — 이 모듈 출력은 어떤 결정적 gate(gate-eval/findings-aggregator/release-readiness)에도 inject ❌.
//   ADR-CHAIN-002 §평이 요약 레이어.
import { HARD_BLOCK_CODES } from './gate-eval.js';

// reason code → 평이 한국어 { 라벨 / 무슨 뜻 / 권장 행동 }. gate-eval 이 낼 수 있는 code 전수.
//   ★ gate-eval 에 reason code 추가 시 여기도 추가 (test/gate-summary.test.js 완전성 검사가 drift fail).
export const REASON_LABELS = Object.freeze({
	validator_critical: {
		label: '중대 위반',
		meaning: '반드시 고쳐야 하는 결함입니다.',
		action: '코드/명세를 고친 뒤 다시 검증하세요.',
	},
	validator_high: {
		label: '높음 위반',
		meaning: '진행 전 해결이 강하게 권고되는 결함입니다.',
		action: '수정 후 재검증하세요 (Auto Mode 로도 자동 통과되지 않습니다).',
	},
	s2_outcome_mismatch: {
		label: '테스트 기대결과 불일치',
		meaning: '기존 동작 보존(통과 기대)·신규 기능(실패 기대)과 실제 테스트 결과가 어긋납니다.',
		action: '테스트 의도와 기대결과를 맞춘 뒤 재검증하세요.',
	},
	state_corrupt: {
		label: '진행 상태 손상',
		meaning: '진행 상태 파일이 깨졌습니다.',
		action: '상태를 복구한 뒤 다시 진행하세요.',
	},
	coverage_threshold: {
		label: '추적 커버리지 미달',
		meaning: '요구사항이 구현·테스트까지 연결되지 않은 항목이 있습니다.',
		action: '빠진 연결을 보강하세요 (또는 승인하면 진행 가능).',
	},
	layer2_threshold: {
		label: '의미 정합 미달',
		meaning: '규칙의 한국어 설명과 Given/When/Then 시나리오가 서로 어긋납니다.',
		action: '도메인 전문가가 확인하세요 (또는 승인하면 진행 가능).',
	},
	evidence_missing: {
		label: '검증 증거 부족',
		meaning: '필수 물증(테스트 실행 결과 등)이 누락됐거나 실행되지 않았습니다.',
		action: '진짜 도구를 실행해 증거를 제출하세요 (또는 승인하면 진행 가능).',
	},
	findings_unverified: {
		label: '검증 미수행',
		meaning: 'validator 결과가 공급되지 않아 판단할 근거가 없습니다.',
		action: '--findings 로 검증 결과를 공급하거나, --user-decision go 로 명시 승인하세요.',
	},
	schema_migration_required: {
		label: '스키마 이행 필요',
		meaning: '산출물 스키마 버전이 낮습니다.',
		action: '마이그레이션을 실행한 뒤 다시 진행하세요.',
	},
	user_stop: {
		label: '사용자 중단',
		meaning: '사용자가 멈춤을 선택했습니다.',
		action: '스프린트를 중단합니다.',
	},
});

function enrich(reason) {
	const l = REASON_LABELS[reason.code] || {
		label: reason.code,
		meaning: reason.detail || '',
		action: '',
	};
	return {
		code: reason.code,
		label: l.label,
		meaning: l.meaning,
		action: l.action,
		detail: reason.detail ?? null,
	};
}

// gateResult(evaluateGate 또는 applyUserDecision 결과) → 결정론 평이 요약.
//   verdict: go(진행 가능) / review(검토 후 진행 가능) / stop(진행 불가·중단) / revisit(되돌아가기).
export function summarizeGate(gateResult) {
	const reasons = Array.isArray(gateResult?.reasons) ? gateResult.reasons : [];
	const decision =
		gateResult?.decision ?? (gateResult?.blocked ? 'block' : 'go-eligible');

	const blocking = reasons
		.filter((r) => HARD_BLOCK_CODES.has(r.code))
		.map(enrich);
	const review = reasons
		.filter((r) => !HARD_BLOCK_CODES.has(r.code) && r.code !== 'user_stop')
		.map(enrich);

	let verdict;
	let revisit_target = null;
	if (typeof decision === 'string' && decision.startsWith('revisit:')) {
		verdict = 'revisit';
		revisit_target = decision.slice('revisit:'.length) || null;
	} else if (decision === 'stop') {
		verdict = 'stop';
	} else if (
		decision === 'go-with-warnings' ||
		decision === 'go-eligible' ||
		gateResult?.blocked === false
	) {
		// soft block 을 사용자가 명시 승인(go-with-warnings) 한 경우도 진행으로 본다.
		verdict = 'go';
	} else if (blocking.length > 0) {
		verdict = 'stop';
	} else {
		verdict = 'review';
	}

	return {
		verdict,
		revisit_target,
		headline: buildHeadline(verdict, { blocking, review, revisit_target }),
		blocking,
		review,
	};
}

function buildHeadline(verdict, { blocking, review, revisit_target }) {
	switch (verdict) {
		case 'go':
			return review.length > 0
				? `👉 판정: 진행 (GO) — 검토 항목 ${review.length}건을 승인 후 진행합니다.`
				: '👉 판정: 진행 가능 (GO) — 막는 문제 없음.';
		case 'review':
			return `👉 판정: 검토 후 진행 (REVIEW) — 권장 기준 미달 ${review.length}건. 승인하면 진행 가능합니다.`;
		case 'revisit':
			return `👉 판정: 되돌아가기 (REVISIT → ${revisit_target ?? '?'}) — 이전 단계를 다시 검토합니다.`;
		case 'stop':
		default:
			return blocking.length > 0
				? `👉 판정: 진행 불가 (STOP) — 막는 문제 ${blocking.length}건. 먼저 해결해야 합니다.`
				: '👉 판정: 중단 (STOP) — 사용자가 멈춤을 선택했습니다.';
	}
}

// summary → 균형형 사람-눈 텍스트 (결정론 template string / 추론 0).
export function renderGateSummaryText(summary) {
	const L = [];
	L.push(summary.headline);
	if (summary.blocking.length > 0) {
		L.push('');
		L.push('■ 막는 문제 (반드시 해결)');
		summary.blocking.forEach((r, i) => {
			L.push(`  ${i + 1}. ${r.label} (${r.code})`);
			if (r.meaning) L.push(`     = ${r.meaning}`);
			if (r.action) L.push(`     → ${r.action}`);
			if (r.detail) L.push(`     · 근거: ${r.detail}`);
		});
	}
	if (summary.review.length > 0) {
		L.push('');
		L.push('■ 검토 권장 (승인 시 진행 가능)');
		summary.review.forEach((r) => {
			L.push(`  • ${r.label} (${r.code})`);
			if (r.meaning) L.push(`     = ${r.meaning}`);
			if (r.action) L.push(`     → ${r.action}`);
			if (r.detail) L.push(`     · 근거: ${r.detail}`);
		});
	}
	return L.join('\n');
}

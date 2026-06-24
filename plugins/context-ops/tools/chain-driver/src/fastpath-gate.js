// fastpath-gate.js — discovery fast-path 종결 exit gate (DEC-2026-06-24-complexity-tier-fastpath).
//
// 역할: trivial tier change-record 가 GREEN 으로 종결되기 전, **경로-무관 공통 의무(⑥⑦) + 최소검증**이
//   실제로 채워졌는지 결정론 fail-closed 검증 (analysis exit gate #0 패턴 / 스킬 양심 의존 ❌).
//   하나라도 빠지면 violations 반환 → cli 가 exit 1 (blocked-by-gate). fast-path 라도 ⑥⑦·검증이
//   조용히 빠질 수 없게 강제 (Senior Q2 + Q5).
//
// 순수: fs / state / LLM / 시간 의존 0. record(이미 파싱된 객체)만 평가.
//   tier!=='trivial' = 본 gate 비적용(N/A) — standard/deep 은 기존 풀 체인 gate 소관.

function nonEmptyStr(v) {
	return typeof v === 'string' && v.trim().length > 0;
}

/**
 * trivial change-record 종결 적격 평가 (순수 / fail-closed).
 * @param {Object} record change-record.json (파싱됨)
 * @returns {{applicable:boolean, ok:boolean, violations:{code:string,severity:string,message:string}[]}}
 *   applicable=false → tier 비-trivial (N/A / ok=true). applicable=true → 아래 4 의무 전수 검사.
 */
export function evaluateFastPathRecord(record) {
	const r = record && typeof record === 'object' ? record : {};
	if (r.tier !== 'trivial') {
		return { applicable: false, ok: true, violations: [] };
	}

	const violations = [];
	const sig = r.triage_signals && typeof r.triage_signals === 'object' ? r.triage_signals : {};
	const ver = r.verification && typeof r.verification === 'object' ? r.verification : {};

	// (가드) trivial 인데 보수적 술어 미충족 = 오라우팅 (Senior Q1 가드 위반).
	if (sig.predicate_satisfied !== true) {
		violations.push({
			code: 'fastpath.predicate_unsatisfied',
			severity: 'high',
			message:
				'tier=trivial 인데 triage_signals.predicate_satisfied≠true — 보수적 적격 술어 미충족(오라우팅). standard 이상으로 재라우팅 필요.',
		});
	}

	// (⑥ 검증 1) 최소검증 하드게이트 — snapshot ≥1 OR oracle_waiver (Senior Q2 / 거짓 GREEN 함정 회피).
	const snaps = Array.isArray(ver.characterization_snapshot_refs)
		? ver.characterization_snapshot_refs
		: [];
	if (snaps.length < 1 && !nonEmptyStr(ver.oracle_waiver)) {
		violations.push({
			code: 'fastpath.verification_missing',
			severity: 'high',
			message:
				'최소검증 부재 — characterization_snapshot_refs ≥1 또는 oracle_waiver(사유) 중 하나 필수. 둘 다 없으면 면제(거짓 GREEN) = 거부.',
		});
	}

	// (⑥) 영향도 closure 기록 참조 필수.
	if (!nonEmptyStr(r.impact_closure_ref)) {
		violations.push({
			code: 'fastpath.impact_closure_missing',
			severity: 'high',
			message:
				'impact_closure_ref 부재 — fast-path 라도 영향도(⑥)는 의무. `chain-driver impact --origin <touched_node_refs>` 실행 후 참조 기입.',
		});
	}

	// (⑦) Jira 티켓 참조 필수.
	if (!nonEmptyStr(r.ticket_ref)) {
		violations.push({
			code: 'fastpath.ticket_missing',
			severity: 'high',
			message:
				'ticket_ref 부재 — fast-path 라도 Jira 연동(⑦)은 의무. 경량 단일-OP 티켓 발급 후 키 기입.',
		});
	}

	return { applicable: true, ok: violations.length === 0, violations };
}

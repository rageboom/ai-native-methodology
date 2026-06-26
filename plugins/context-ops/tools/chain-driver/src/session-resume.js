// session-resume.js — SessionStart "세션 재개" 요약 (결정론 합성 / display-only / reference-lens).
//
// 목적: 세션 최초 시작 시 "남은 chain 단계 + 대기 항목(blocked/revisit/task)"을 컴팩트 블록으로 합성.
//   "현재 stage"는 statusLine(chain-statusline.js)이 블랭크 화면부터 상시 담당하므로 여기선 보강만 한다.
//   채널 = additionalContext(모델 컨텍스트) → 어시스턴트가 첫 응답에서 중립 톤 렌더 (Anthropic 권장 패턴).
//   stderr/systemMessage 아님 — SessionStart exit 0 stderr 는 사용자 미표출(공식문서) / systemMessage 는 warning 톤.
//
// ★ reference-lens / display-only — 어떤 결정적 gate(evaluateGate/cmdNext)에도 inject ❌ (deterministic-axis).
//   순수 함수 (state in → string|null out / 부작용 0 / I/O 0) — cli.js SessionStart 분기에서만 호출.
//
// stage→N/5 환산은 chain-statusline.js 의 CHAIN_ORDER/renderStatusline 을 단일 소스로 재사용(사본 ❌).

import { CHAIN_ORDER, renderStatusline } from '../../../scripts/chain-statusline.js';

// state → 재개 요약 문자열. 활성 chain 없으면(idle/null/비-chain) null = 전체 침묵.
export function buildSessionResumeSummary(state) {
	if (!state || typeof state !== 'object') return null;
	const chain = state.current_chain ?? null;
	if (!chain) return null; // idle (state 는 있으나 진행 chain 없음) = 침묵 (statusLine 이 '📍 chain idle' 담당)

	// 헤더 — renderStatusline 재사용(N/5·scope·analysis 분기 단일 소스). 선두 status 글리프만 떼고 🧭 로 재프레이밍.
	const status = renderStatusline(state); // 예: '📍 spec 2/5 · BC-FOO' | '⛔ 📍 plan 3/5 · BC-FOO' | '📍 analysis · BC-FOO'
	if (!status) return null; // 방어 (renderStatusline 이 빈 문자열 = 활성 chain 없음)
	const position = status.replace(/^⛔ /, '').replace(/^📍 /, ''); // 'spec 2/5 · BC-FOO'
	const blockedPrefix = state.blocked ? '⛔ ' : '';
	const lines = [`🧭 세션 재개 — ${blockedPrefix}${position}`];

	// 남은 단계 — CHAIN_ORDER.indexOf 전방 slice (status 필터 아님 / enum 'complete' 함정 회피).
	//   analysis(idx<0 / gate#0) · 마지막 단계(implement) = 줄 생략.
	const idx = CHAIN_ORDER.indexOf(chain);
	if (idx >= 0 && idx < CHAIN_ORDER.length - 1) {
		lines.push(`   남은 단계: ${CHAIN_ORDER.slice(idx + 1).join(' → ')}`);
	}

	// 대기 항목 — 있는 것만 (빈 항목 suppress / 신뢰 침식 회피).
	const waits = [];
	if (state.blocked) waits.push(`⛔ blocked: ${state.block_reason || '-'}`);
	if (state.pending_revisit?.target_stage) {
		waits.push(`↩ revisit: ${state.pending_revisit.target_stage}`);
	}
	if (state.current_task) {
		const t = state.current_task;
		const branch = t.branch ? `(${t.branch})` : '';
		waits.push(`🔖 task: ${t.task_id ?? '-'}${branch}`);
	}
	if (waits.length > 0) lines.push(`   대기: ${waits.join(' · ')}`);

	return lines.join('\n');
}

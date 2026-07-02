// gate-provenance.js — gate 결단(actor) provenance 정직 도출 (Phase 1).
//   DEC-2026-06-25-gate-review-bypass-guard / ADR-CHAIN-002 §intervention_log.
//
//   문제: `chain-driver next --user-decision go` 는 검토 UX(_base-invoke-go-stop-gate /
//   discovery·spec·plan 의 plan-review-server 브라우저 검토) 경유 여부를 확인하지 않아,
//   사람이 안 봤어도 intervention-log 에 actor:'user' 로 거짓 기록됐다(cli.js 구 `args.userDecision ? 'user':'driver'`).
//
//   Phase 1 = 차단 ❌ / "누가 어떻게 결정했나"를 정직 기록 + 우회를 auditable·loud 화:
//     - driver       = --user-decision 없음 (driver-initiated 재평가)
//     - user         = stop/revisit(명시 안전 행동) 또는 go + 검토 경유 마커 fresh
//     - user_auto    = go + --auto-mode (사용자 Auto Mode 명시 위임)
//     - llm_assumed  = go 인데 마커·플래그 둘 다 없음 (= 사람 검토 증거 부재 / 우회 추정)
//
//   honest 한계: gate-review-passage 마커는 LLM 이 직접 쓸 수도 있는 파일 = speedbump(벽 ❌).
//   위조 불가 신호는 plan-review-server(서버 프로세스)가 실제 spawn 됐을 때 쓰는 마커뿐(브라우저 검토가 떴다는 증거).
//   discovery/spec/plan 만 그 서버 마커를 갖는다(test/implement 텍스트 게이트는 advisory 한계 — Phase 2 carry).
//   결정론 axis — LLM 판단 0 (feedback_chain_driver_deterministic_axis).

import { existsSync, readFileSync } from 'node:fs';
import { gateReviewPassageForRead } from '../../_shared/ai-context-layout.js';

// 검토 UX 경유 증거(plan-review-server spawn 시 쓰는 presented 마커)가 현 stage 에 fresh 한가?
//   fresh = 마커.stage === 현 stage && presented_at >= 그 stage 의 started_at (재진입 후 stale 배제).
//   started_at 부재 시 best-effort true (advisory 라 관대 — 오경보 < 미경보 안전).
//   reader 주입 가능(테스트용) — 기본 = 디스크 read.
export function reviewPassageFresh(projectRoot, stage, activeChain, reader) {
	try {
		let marker;
		if (typeof reader === 'function') {
			marker = reader(projectRoot);
		} else {
			const p = gateReviewPassageForRead(projectRoot);
			if (!existsSync(p)) return false;
			marker = JSON.parse(readFileSync(p, 'utf-8'));
		}
		if (!marker || marker.stage !== stage) return false;
		const startedAt = activeChain?.stage_progress?.[stage]?.started_at;
		if (startedAt && marker.presented_at) {
			return Date.parse(marker.presented_at) >= Date.parse(startedAt);
		}
		return true;
	} catch {
		return false;
	}
}

// gate #0 표면화 강제 (DEC-2026-07-02-analysis-exit-gate-surfacing-hard-deny) — 위조불가
//   사용자 결정 토큰 fresh 판정 (순수 / fs·시간 read 없음 — token 객체만 평가).
//   fresh = 미소비(consumed=false) && stage 일치 && (presentedAt 있으면 issued_at >= presentedAt).
//   token 은 UserPromptSubmit 훅만 발급 = LLM 이 UserPromptSubmit 이벤트를 유발 불가 = 위조불가
//   (plan-review-server spawn 마커 동급 신호 / DEC-2026-06-25 의 "text=advisory 한계" 를 이 신호 클래스로 초과).
export function userGateTokenFresh(token, stage, presentedAt) {
	if (!token || token.consumed) return false;
	if (token.stage !== stage) return false;
	if (presentedAt && token.issued_at) {
		return Date.parse(token.issued_at) >= Date.parse(presentedAt);
	}
	return true;
}

// Auto Mode 위조불가 위임 토큰 fresh 판정 (Q3 / gate-deterministic-surfacing).
//   --auto-mode 플래그(LLM-passable = 위조가능)는 이 위조불가 토큰(UserPromptSubmit 발급)이 있어야만 유효.
//   세션/체인 위임이라 per-gate 소비 ❌ (존재 + 미회수 = fresh). 체인 terminal 도달 시 cli.js 가 clear.
export function autoDelegationTokenFresh(token) {
	return !!token && !token.consumed;
}

// intervention-log actor provenance 결정론 도출.
//   args = { userDecision, autoMode } / projectRoot / stage / activeChain / (reader 테스트 주입) /
//   userTokenFresh = gate #0 위조불가 토큰 fresh 여부 (DEC-2026-07-02 / 없으면 undefined=미해당).
export function deriveGateActor(
	{ userDecision, autoMode },
	projectRoot,
	stage,
	activeChain,
	reader,
	userTokenFresh,
) {
	if (!userDecision) return 'driver';
	if (userDecision === 'stop' || userDecision.startsWith('revisit:')) return 'user';
	// go-family — go 가 어떻게 얻어졌나
	if (autoMode) return 'user_auto';
	// gate #0 위조불가 사용자 토큰 (DEC-2026-07-02) — 서버 마커 부재 텍스트 게이트의 정당 user 증거.
	if (userTokenFresh) return 'user';
	if (reviewPassageFresh(projectRoot, stage, activeChain, reader)) return 'user';
	return 'llm_assumed';
}

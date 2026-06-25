#!/usr/bin/env node
// chain-statusline.js — Claude Code statusLine 세그먼트: 현재 chain stage 를 하단바에 상시 노출.
//
// 설정(사용자 .claude/settings.local.json / chain-statusline-setup.js 가 1회 기입):
//   { "statusLine": { "type": "command", "command": "node <plugin>/scripts/chain-statusline.js" } }
//
// ★ SELF-CONTAINED — 플러그인 의존 0. statusLine 실행 컨텍스트엔 ${CLAUDE_PLUGIN_ROOT} 가 미보장이고
//   chain-driver 경로도 모르므로, stdin 으로 주는 세션 JSON 의 cwd 에서 .ai-context/state.json 을 직접 읽는다.
//   비-gating display(reference-lens) — 어떤 결정적 gate 에도 inject ❌ (deterministic-axis / state.json 결정론 read).
//
// 출력 규약 (statusLine blank-on-error / 절대 throw ❌):
//   chain 진행 :  📍 spec 2/5 · BC-FOO
//   analysis   :  📍 analysis · BC-FOO        (gate#0 = 5-stage 밖 → N/5 생략)
//   blocked    :  ⛔ 📍 plan 3/5 · BC-FOO
//   idle       :  📍 chain idle               (state.json 있으나 진행 chain 없음)
//   비-chain   :  (빈 출력)                    (state.json 없음 = 침묵 / 다른 프로젝트 안전)

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// canonical chain 순서 (discovery1·spec2·plan3·test4·implement5 / project_chain_gate_numbering).
export const CHAIN_ORDER = ['discovery', 'spec', 'plan', 'test', 'implement'];

// state.json 에서 활성 (scope, chain, blocked) 추출. chain-driver cmdState 의 getActiveScopeChain 최소 재현.
export function activeChain(state) {
	if (!state || typeof state !== 'object') return null;
	// v2.0 — 전역 단일 chain 커서 (scope_states 제거 / DEC-2026-06-25). scope = current_scope 표시용.
	const scope = state.current_scope ?? null;
	const chain = state.current_chain ?? null;
	return { scope, chain, blocked: !!state.blocked };
}

// (scope, chain, blocked) → statusLine 문자열. chain 없으면 idle / null state 면 빈 문자열.
export function renderStatusline(state) {
	const a = activeChain(state);
	if (!a) return '';
	const { scope, chain, blocked } = a;
	const scopeLabel = scope ? ` · ${scope}` : '';
	let body;
	if (!chain) {
		body = '📍 chain idle';
		return body; // idle 엔 scope 표기 생략(진행 chain 없음)
	}
	if (chain === 'analysis') {
		body = `📍 analysis${scopeLabel}`; // gate#0 = 5-stage 밖
	} else {
		const idx = CHAIN_ORDER.indexOf(chain);
		const pos = idx >= 0 ? `${idx + 1}/${CHAIN_ORDER.length}` : '?';
		body = `📍 ${chain} ${pos}${scopeLabel}`;
	}
	return blocked ? `⛔ ${body}` : body;
}

// stdin 세션 JSON 에서 작업 디렉토리 추출 (Claude Code statusLine 입력 스키마).
export function cwdFromInput(input) {
	if (!input || typeof input !== 'object') return null;
	return input.workspace?.current_dir ?? input.cwd ?? input.workspace?.project_dir ?? null;
}

// cwd → .ai-context/state.json 읽기. 부재/파싱실패 = null (침묵).
export function readStateFromCwd(cwd) {
	if (!cwd) return null;
	const p = join(cwd, '.ai-context', 'state.json');
	if (!existsSync(p)) return null;
	try {
		return JSON.parse(readFileSync(p, 'utf-8'));
	} catch {
		return null; // 깨진 JSON = 침묵 (statusLine blank-on-error)
	}
}

function main() {
	let raw = '';
	try {
		raw = readFileSync(0, 'utf-8'); // stdin
	} catch {
		raw = '';
	}
	let input = null;
	try {
		input = raw ? JSON.parse(raw) : null;
	} catch {
		input = null;
	}
	const state = readStateFromCwd(cwdFromInput(input));
	const line = renderStatusline(state);
	if (line) process.stdout.write(line);
}

// 직접 실행시에만 main (test import 시 부작용 0).
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
	main();
}

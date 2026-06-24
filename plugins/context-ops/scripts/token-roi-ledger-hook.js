#!/usr/bin/env node
// token-roi-ledger-hook — PostToolUse 훅 (hooks.json 등록). codegraph 호출을 세션 ledger 에 적재.
// `/context-ops:roi` 커맨드(scripts/token-roi-summary.js)가 이 ledger 를 읽어 cg 절감(추정)을 on-demand 표시.
//
// 기본 always-on (env 게이트 없음 / v0.73.0). codegraph 호출 시 출력 토큰을 항상 적재.
//   (뷰어 /context-ops:roi 도 플러그인으로 출하되므로 옛 opt-in "orphan ledger" 우려 해소.)
//   적재처 = $HOME/.claude/token-roi/ledger-<session>.jsonl (로컬 전용 / 외부 전송 ❌).
//
// trust: codegraph 절감은 반사실(안 한 grep+read) → 실측 불가. 본 훅은 codegraph **출력 토큰만 실측** 적재,
//   "절감"은 /roi 에서 A/B 유래 배수(×1.8)로 **추정(estimate 라벨)**. 결정적 chain gate inject ❌
//   (reference-lens / DEC-2026-05-28 §4.2). 어떤 경우에도 exit 0 (PostToolUse 파이프 비차단).

import { mkdirSync, appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const LEDGER_DIR = join(homedir(), '.claude', 'token-roi');

function readStdin() {
	try {
		return readFileSync(0, 'utf8'); // fd 0 = stdin
	} catch {
		return '';
	}
}

const estTokens = (s) => Math.round((s || '').length / 4);

function main() {
	let h;
	try {
		h = JSON.parse(readStdin());
	} catch {
		process.exit(0);
	}
	const sid = h.session_id;
	if (!sid) process.exit(0);

	const toolName = String(h.tool_name || '');
	// codegraph 호출만 (MCP: mcp__codegraph__* / mcp__plugin_context-ops_codegraph__*). 출력 토큰 실측.
	if (!/codegraph/i.test(toolName)) process.exit(0);

	const resp = h.tool_response;
	const respStr = typeof resp === 'string' ? resp : JSON.stringify(resp || '');
	const rec = { kind: 'cg', tool: toolName, out_tokens: estTokens(respStr) };

	try {
		mkdirSync(LEDGER_DIR, { recursive: true });
		appendFileSync(join(LEDGER_DIR, `ledger-${sid}.jsonl`), JSON.stringify(rec) + '\n');
	} catch {
		/* 적재 실패해도 비차단 */
	}
	process.exit(0);
}

main();

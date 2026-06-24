#!/usr/bin/env node
// token-roi-summary — on-demand 토큰 절감 요약 (headroom + codegraph).
//
// `/context-ops:roi` 커맨드(commands/roi.md)가 호출. 상시 statusline 대신 요청 시 뷰.
// Node 구현 — 크로스플랫폼(Windows 포함) / jq·awk 의존 제거 / bench.js·ledger-hook.js 와 동형.
//
// 정직성 규칙 (SKILL.md 정합):
//   - headroom = 프록시(포트 8787) 프로세스의 누계 = 머신 전역(이 Claude 세션 한정 ❌).
//               headroom 프록시는 개인 설정(ANTHROPIC_BASE_URL)이라 안 돌리면 "데이터 없음".
//   - compression 절감만 우리 기여. cache 절감은 공급자 프롬프트 캐시 → 합산 금지(별도 표기).
//   - codegraph = 반사실(counterfactual) 추정 → "estimate" 라벨 강제. 실측 아님.
//   - ledger 는 플러그인 기본 always-on (token-roi-ledger-hook.js / env 게이트 없음).
//
// 사용: node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-summary.js
//   (ledger/headroom 데이터는 사용자 홈 — $HOME/.claude/token-roi, $HOME/.headroom — 에서 읽음)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CG_MULT = Number(process.env.CG_MULT || 1.8); // 1/(1-0.645)-1 ≈ 1.8 (bench A/B 평균 절감률 0.645)
const HR_FILE = join(homedir(), '.headroom', 'proxy_savings.json');
const ROI_DIR = join(homedir(), '.claude', 'token-roi');

const B = (s) => `\x1b[1m${s}\x1b[0m`; // bold
const D = (s) => `\x1b[2m${s}\x1b[0m`; // dim
const G = (s) => `\x1b[0;32m${s}\x1b[0m`; // green
const C = (s) => `\x1b[0;36m${s}\x1b[0m`; // cyan
const out = (s = '') => process.stdout.write(s + '\n');

out(B('토큰 절감 요약 (token-roi)'));
out('────────────────────────────────────────');

// ── headroom (압축 프록시 / 머신 전역) ─────────────────────────
out();
out(`${B('headroom')}  ${D('(압축 프록시 · 머신 전역 누계 · 이 세션 한정 아님)')}`);
let hr = null;
try {
	hr = JSON.parse(readFileSync(HR_FILE, 'utf8'));
} catch {
	/* 부재 = 미사용 */
}
if (hr && hr.display_session) {
	const ds = hr.display_session;
	const lt = hr.lifetime || {};
	if (ds.compression_savings_usd != null) {
		const tokM = ((ds.tokens_saved || 0) / 1e6).toFixed(1);
		out(
			`  프록시 세션  ${G('$' + Number(ds.compression_savings_usd).toFixed(2))}  (${tokM}M tok 압축, ${ds.savings_percent ?? '?'}% 절감)  ${D('from ' + (ds.started_at ?? '?'))}`,
		);
	}
	if (lt.compression_savings_usd != null) {
		const tokM = ((lt.tokens_saved || 0) / 1e6).toFixed(0);
		out(
			`  전체 누계    ${G('$' + Number(lt.compression_savings_usd).toFixed(2))}  (${tokM}M tok 압축)`,
		);
	}
	out(`  ${D('└ compression 절감만 표기. cache(프롬프트 캐시) 절감은 공급자 몫 → 합산 ❌.')}`);
} else {
	out(`  ${D('(데이터 없음 — headroom 프록시 미사용(ANTHROPIC_BASE_URL))')}`);
}

// ── codegraph (반사실 추정 / 세션 ledger) ──────────────────────
out();
out(`${B('codegraph')}  ${D('(grep+read 대비 추정 절감 · estimate · 실측 아님)')}`);
let latest = null;
try {
	const files = readdirSync(ROI_DIR)
		.filter((f) => /^ledger-.*\.jsonl$/.test(f))
		.map((f) => join(ROI_DIR, f))
		.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
	latest = files[0] || null;
} catch {
	/* dir 부재 */
}
if (latest) {
	let cgOut = 0;
	let cgCalls = 0;
	for (const line of readFileSync(latest, 'utf8').split('\n')) {
		if (!line.trim()) continue;
		try {
			const r = JSON.parse(line);
			if (r.kind === 'cg') {
				cgOut += Number(r.out_tokens) || 0;
				cgCalls++;
			}
		} catch {
			/* malformed line skip */
		}
	}
	if (cgCalls > 0) {
		const saved = ((cgOut * CG_MULT) / 1000).toFixed(1);
		out(`  최근 세션    ${C('~' + saved + 'k tok')}  estimate (x${CG_MULT} vs grep+read, n=${cgCalls})`);
		out(`  ${D('└ ledger: ' + latest)}`);
	} else {
		out(`  ${D('(ledger 에 codegraph 호출 기록 없음)')}`);
	}
} else {
	out(`  ${D('(ledger 없음 — codegraph 호출 시 자동 기록됨 / hooks.json PostToolUse)')}`);
}

out();
out(D('iso(서브에이전트 격리)는 절감이 아니라 diverted → 표시 안 함. A/B 하니스는 /context-ops:token-roi.'));

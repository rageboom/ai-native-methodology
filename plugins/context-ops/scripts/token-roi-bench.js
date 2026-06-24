#!/usr/bin/env node
// token-roi-bench.js — 토큰 절감 ROI 측정 하니스 (결정론 byte/token 회계 A/B).
//
// 목적: "우리가 하는 토큰 절감 수단이 얼마나 효율 있나"를 재현 가능한 실측 숫자로 보고.
//   plan: .claude/plans/plan-token-roi.md / DEC: (본체 격상 시 발급)
//
// 측정 사상 (정직성 1순위):
//   - 같은 "정보 요구"(task)를 충족하는 데 컨텍스트로 끌려온 토큰량을 잰다 (LLM run 변동 배제 = 결정론).
//   - 모든 수단을 같은 baseline(grep+read 로 히트 파일 전체를 컨텍스트에 적재)에 대해 비교.
//       · codegraph        : `codegraph context "<q>"` 출력 토큰        vs baseline
//       · sub-agent 격리   : baseline 파일 토큰을 메인 밖으로 격리 → 메인은 요약만 (--summary-tokens, 가정 라벨)
//       · headroom         : 프록시 계층 → 스크립트로 토글 불가 → headroom_stats compression line 만 (informational)
//
// 토크나이저 (D1): Anthropic count_tokens 가 정확/무료지만 cred 필요. 없으면 chars/4 추정(±20%).
//   ★ 핵심: A/B '비율(%)'은 일관된 토크나이저면 오차가 상쇄돼 추정 모드에서도 견고.
//     절대 토큰/$ 만 count_tokens 의무 → 추정 모드에선 절대치에 "estimate" 라벨 강제.
//
// trust: 이 하니스는 마케팅 숫자가 아니라 '측정 절차'다. 모든 출력에 방법·토크나이저·표본·caveat 명시.
// no-fabrication: codegraph 미설치/미인덱스 시 그 arm 은 skip + 정직 신호 (persona 시뮬 ❌).

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..', '..'); // scripts → context-ops → plugins → repo root
const TASKS_PATH = join(HERE, 'token-roi-tasks.json');

// ───────────────────────────── args ─────────────────────────────
const argv = process.argv.slice(2);
const hasFlag = (f) => argv.includes(f);
const getOpt = (name, dflt) => {
	const hit = argv.find((a) => a.startsWith(`${name}=`));
	return hit ? hit.slice(name.length + 1) : dflt;
};
const AS_JSON = hasFlag('--json');
const SUMMARY_TOKENS = Number(getOpt('--summary-tokens', '500')); // 격리 시 메인이 받는 요약 가정 크기
const ONLY_TASK = getOpt('--task', null); // 특정 task id 만

// ───────────────────────── tokenizer (D1) ────────────────────────
function detectTokenizer() {
	// 1) ant CLI (count-tokens, 무료)
	const antProbe = spawnSync('sh', ['-c', 'command -v ant'], { stdio: 'ignore' });
	if (antProbe.status === 0 && (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)) {
		return { mode: 'count_tokens(ant)', exact: true };
	}
	// 2) Anthropic SDK + API key
	if (process.env.ANTHROPIC_API_KEY) {
		try {
			// eslint-disable-next-line no-undef
			require.resolve?.('@anthropic-ai/sdk');
			return { mode: 'count_tokens(sdk)', exact: true };
		} catch {
			/* fall through */
		}
	}
	// 3) fallback: chars/4 추정 (±20%). 비율은 견고 / 절대치만 estimate.
	return { mode: 'estimate(chars/4)', exact: false };
}
const TOKENIZER = detectTokenizer();

// 동기 count_tokens (ant). exact 모드일 때만 호출. 실패 시 추정으로 graceful.
function countViaAnt(text) {
	try {
		const out = execFileSync(
			'ant',
			['messages', 'count-tokens', '--model', 'claude-opus-4-8', '--message',
				JSON.stringify({ role: 'user', content: text }), '--transform', 'input_tokens', '-r'],
			{ encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
		);
		const n = parseInt(out.trim(), 10);
		return Number.isFinite(n) ? n : null;
	} catch {
		return null;
	}
}

// estimate: chars/4 (Anthropic 토큰 ≈ 영문 3.5~4 char/tok; 코드는 더 촘촘 → 보수적 4). pure/exported.
export function estimateTokens(text) {
	if (!text) return 0;
	return Math.round(text.length / 4);
}

function countTokens(text) {
	if (!text) return 0;
	if (TOKENIZER.mode === 'count_tokens(ant)') {
		const n = countViaAnt(text);
		if (n != null) return n;
	}
	return estimateTokens(text);
}

// ───────────────────────── grep+read arm ─────────────────────────
// 한 task 의 grep_terms 로 scope_dir 안에서 히트 파일을 모아 전부 읽어 토큰 합산 (= baseline).
function grepReadBaseline(scopeAbs, terms) {
	const files = new Set();
	for (const term of terms) {
		// grep -rIl (binary skip, list files), 대소문자 무시
		const r = spawnSync('grep', ['-rIl', '-i', '--include=*.ts', '--include=*.js', term, scopeAbs], {
			encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
		});
		if (r.stdout) {
			for (const line of r.stdout.split('\n')) {
				const f = line.trim();
				if (f) files.add(f);
			}
		}
	}
	let tokens = 0;
	let bytes = 0;
	for (const f of files) {
		try {
			const content = readFileSync(f, 'utf8');
			bytes += Buffer.byteLength(content, 'utf8');
			tokens += countTokens(content);
		} catch {
			/* unreadable → skip */
		}
	}
	return { fileCount: files.size, tokens, bytes, files: [...files] };
}

// ───────────────────────── codegraph arm ─────────────────────────
function codegraphAvailable() {
	const bin = spawnSync('sh', ['-c', 'command -v codegraph'], { stdio: 'ignore' });
	if (bin.status !== 0) return { ok: false, reason: 'codegraph not on PATH' };
	// 인덱스 위치는 codegraph 가 자체 해석(워크트리/메인 레포 어디든) → status 로 확인 (path 추정 ❌).
	const st = spawnSync('codegraph', ['status'], { cwd: REPO_ROOT, stdio: 'ignore', timeout: 30000 });
	if (st.status !== 0) return { ok: false, reason: 'codegraph index not ready (status≠0)' };
	return { ok: true };
}

function codegraphContext(question) {
	try {
		const out = execFileSync('codegraph', ['context', question], {
			encoding: 'utf8', cwd: REPO_ROOT, maxBuffer: 16 * 1024 * 1024, timeout: 120000,
		});
		return { ok: true, text: out, tokens: countTokens(out), bytes: Buffer.byteLength(out, 'utf8') };
	} catch (e) {
		return { ok: false, reason: e.message?.slice(0, 120) || 'codegraph context failed' };
	}
}

// ───────────────────────────── run ───────────────────────────────
// (saved / base) 백분율, 0.1% 단위. base=0 → 0. pure/exported.
export function pct(saved, base) {
	if (!base) return 0;
	return Math.round((saved / base) * 1000) / 10;
}

// rows → 비율 평균 집계 (절대치 아님 — 비율은 토크나이저 견고). pure/exported.
export function aggregate(rows) {
	const cgRows = rows.filter((r) => r.codegraph_saved_pct != null);
	const avg = (arr, k) =>
		arr.length ? Math.round((arr.reduce((s, r) => s + r[k], 0) / arr.length) * 10) / 10 : null;
	return {
		codegraph_avg_saved_pct: avg(cgRows, 'codegraph_saved_pct'),
		isolation_avg_saved_pct: avg(rows, 'isolation_saved_pct'),
	};
}

function main() {
	if (!existsSync(TASKS_PATH)) {
		console.error(`[token-roi] tasks file 부재: ${TASKS_PATH}`);
		process.exit(2);
	}
	const cfg = JSON.parse(readFileSync(TASKS_PATH, 'utf8'));
	const scopeAbs = resolve(REPO_ROOT, cfg.scope_dir);
	const scopeOk = existsSync(scopeAbs);
	const cg = codegraphAvailable();

	let tasks = cfg.tasks;
	if (ONLY_TASK) tasks = tasks.filter((t) => t.id === ONLY_TASK);

	const rows = [];
	for (const t of tasks) {
		const base = scopeOk
			? grepReadBaseline(scopeAbs, t.grep_terms)
			: { fileCount: 0, tokens: 0, bytes: 0, files: [] };

		const cgRes = cg.ok ? codegraphContext(t.question) : { ok: false, reason: cg.reason };

		// codegraph 절감 vs baseline
		const cgTokens = cgRes.ok ? cgRes.tokens : null;
		const cgSavedPct = cgRes.ok ? pct(base.tokens - cgTokens, base.tokens) : null;

		// 격리 절감: baseline 파일 토큰이 메인 밖(서브에이전트)로 → 메인은 요약(SUMMARY_TOKENS)만.
		const isoSavedPct = pct(base.tokens - SUMMARY_TOKENS, base.tokens);

		rows.push({
			id: t.id,
			baseline_files: base.fileCount,
			baseline_tokens: base.tokens,
			codegraph_tokens: cgTokens,
			codegraph_saved_pct: cgSavedPct,
			isolation_main_tokens: SUMMARY_TOKENS,
			isolation_saved_pct: isoSavedPct,
			codegraph_skipped: cgRes.ok ? null : cgRes.reason,
		});
	}

	// 집계 (비율 평균 — 절대치 아님)
	const agg = aggregate(rows);

	const report = {
		meta: {
			tokenizer: TOKENIZER.mode,
			tokenizer_exact: TOKENIZER.exact,
			target: cfg.target_label,
			scope_dir: cfg.scope_dir,
			scope_present: scopeOk,
			codegraph: cg.ok ? 'available' : `skipped (${cg.reason})`,
			summary_tokens_assumed: SUMMARY_TOKENS,
			tasks_run: rows.length,
		},
		rows,
		summary: agg,
		caveats: [
			TOKENIZER.exact
				? '절대 토큰치 = count_tokens 정확.'
				: '⚠ 추정 모드(chars/4): 절대 토큰치는 ±20% 추정. 비율(%)은 일관 토크나이저라 견고.',
			'codegraph 출력은 전역 인덱스 기반 → 표적 외 심볼 매치 가능(토큰량 측정엔 무관, 답 품질은 별개).',
			'sub-agent 격리 절감 = 가정 요약 크기(--summary-tokens) 기준 상한. 실제 요약 크기에 따라 변동.',
			'headroom 은 API 프록시 계층 → 본 스크립트로 A/B 토글 불가. headroom_stats 의 Compression line 만 우리 절감(Cache line=공급자, 합산 ❌).',
			'단일 PoC(poc-18) 표본 → 과적합 회피 위해 스택 다양화는 후속(≥2 PoC).',
		],
	};

	if (AS_JSON) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}

	// ── 사람용 표 ──
	const L = (s) => console.log(s);
	L('');
	L('━━━ 토큰 절감 ROI (token-roi-bench) ━━━');
	L(`토크나이저 : ${report.meta.tokenizer}${TOKENIZER.exact ? '' : '  ⚠추정'}`);
	L(`표적       : ${report.meta.target}`);
	L(`scope      : ${report.meta.scope_dir} ${scopeOk ? '' : '(부재!)'}`);
	L(`codegraph  : ${report.meta.codegraph}`);
	L(`격리 가정  : 메인 요약 ${SUMMARY_TOKENS} tok`);
	L('');
	L('task                       baseline(files/tok)   codegraph(tok/절감%)   격리(절감%)');
	L('─'.repeat(86));
	for (const r of rows) {
		const baseCol = `${String(r.baseline_files).padStart(2)}f / ${String(r.baseline_tokens).padStart(6)}`;
		const cgCol = r.codegraph_tokens == null
			? `skip:${r.codegraph_skipped}`.slice(0, 22)
			: `${String(r.codegraph_tokens).padStart(5)} / ${String(r.codegraph_saved_pct).padStart(5)}%`;
		const isoCol = `${String(r.isolation_saved_pct).padStart(5)}%`;
		L(`${r.id.padEnd(26)} ${baseCol.padEnd(20)}  ${cgCol.padEnd(20)}  ${isoCol}`);
	}
	L('─'.repeat(86));
	L(`평균 절감  codegraph: ${report.summary.codegraph_avg_saved_pct ?? 'n/a'}%   sub-agent 격리: ${report.summary.isolation_avg_saved_pct}%`);
	L('');
	L('해석:');
	L('  · codegraph 절감% = (grep+read 로 끌려올 파일 토큰 − codegraph context 출력 토큰) / 전자.');
	L('  · 격리 절감%      = baseline 파일 토큰을 메인 밖으로 → 메인은 요약만 받을 때 메인 컨텍스트 절감.');
	L('  · headroom        = 별도 계층. headroom_stats 의 Compression line 만 우리 절감 (Cache 제외).');
	L('');
	L('caveat:');
	for (const c of report.caveats) L(`  - ${c}`);
	L('');
}

// 직접 실행 시에만 main() (test import 시 I/O·grep·codegraph 호출 안 함 — codegraph-nudge.js 패턴 정합).
const INVOKED_DIRECTLY = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (INVOKED_DIRECTLY) main();

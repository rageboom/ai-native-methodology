// co-change.js — VCS 논리적 결합(logical coupling) mining. git-only. 결정론(파라미터 pin 이후).
//
// 신호 #3 (Gall 1998 / ROSE 2004 / research-reverse-engineering-carve.md §3 / DEC-2026-06-09 §2.5):
//   git log 이력에서 함께 변경된 파일쌍의 support(동시변경 횟수) + confidence(조건부 비율) mining.
//   정적 의존 그래프에 직교 — config↔code / iBATIS XML↔DAO 동시편집 = legacy 정적-blind 정조준 (유일 git-only).
//
//   ★ 기존 repo gitDiffNumstat(revisit-detect.js) = point-to-point(두 ref 1회 diff)로 logical-coupling 아님 →
//     별개 신규 mining. makeGitRunner(_shared/code-pointer-git.js) plumbing 만 재사용(결정론 execFileSync).
//
// 파라미터 = soft-gate 노출(렌즈 내부 hardcode ❌ / 'deterministic'은 pin 이후 성립):
//   min_support / min_confidence / window(최근 N commit) / max_transaction_size(tangled commit 제외) / since.
//
// no-simulation 정직 경계: git 부재·repo 아님·이력 없음·실패 = status:no_git_history (날조 ❌ / honest skip).

import { execFileSync } from 'node:child_process';

// mining-grade git runner — _shared/code-pointer-git.js makeGitRunner 의 결정론 execFileSync 계약(no shell /
//   stderr ignore / windowsHide / no --pager)을 따르되, bulk `git log --name-only` 이력 mining 에 맞춘 buffer·timeout.
//   ★ makeGitRunner(1MB/5s)는 small single-path query(findRelocation) 용 = 전체 이력 --name-only 출력에 ENOBUFS.
//     gitDiffNumstat(revisit-detect.js)가 동일 이유로 maxBuffer 10MB 사용 = 선례. 본 runner 는 64MB/30s.
export function makeMiningGitRunner(repoRoot = process.cwd()) {
	return (args) =>
		execFileSync('git', args, {
			cwd: repoRoot,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'ignore'],
			timeout: 30000,
			maxBuffer: 64 * 1024 * 1024,
			windowsHide: true,
		});
}

function round4(x) {
	return Math.round(x * 10000) / 10000;
}

const SEP = String.fromCharCode(1); // commit 구분자 (\x01 control byte / git --format=<\x01>%H)
const PAIR = String.fromCharCode(2); // pair key 구분자 (파일 경로에 안 나타나는 제어문자)

export function mineCoChange({ gitRunner, params }) {
	if (typeof gitRunner !== 'function') {
		return {
			status: 'not_run',
			transactions_analyzed: 0,
			pairs: [],
			file_churn: {},
			note: 'gitRunner 미주입 — co-change 미실행.',
		};
	}
	let out;
	try {
		const args = ['log', '--no-merges', '--name-only', `--format=${SEP}%H`];
		if (params.since) args.push(`--since=${params.since}`);
		out = gitRunner(args);
	} catch (err) {
		return {
			status: 'no_git_history',
			transactions_analyzed: 0,
			pairs: [],
			file_churn: {},
			note: `git log 실패 (repo 아님 / 이력 없음 / timeout): ${String(err && err.message ? err.message : err).slice(0, 160)} — 정직 skip(날조 ❌).`,
		};
	}
	if (!out || !out.trim()) {
		return {
			status: 'no_git_history',
			transactions_analyzed: 0,
			pairs: [],
			file_churn: {},
			note: 'git log 출력 없음 — 이력 부재 정직 skip.',
		};
	}

	// commit 파싱 (newest-first)
	const commits = [];
	for (const block of out.split(SEP)) {
		if (!block.trim()) continue;
		const lines = block.split('\n');
		const sha = lines[0].trim();
		const files = lines
			.slice(1)
			.map((l) => l.trim())
			.filter(Boolean);
		if (sha && files.length) commits.push({ sha, files });
	}

	// window = 최근 N commit (git log 가 newest-first)
	let windowed = commits;
	if (params.window && params.window > 0) windowed = windowed.slice(0, params.window);

	// raw churn = windowed 전체(필터 전) 파일별 revision 수 (Tornhill churn / hotspot 신호 입력).
	//   max_transaction_size 필터 전이므로 단일파일·대형 commit 포함 = 진짜 변경 빈도.
	const fileChurn = new Map();
	for (const t of windowed) {
		for (const f of new Set(t.files)) fileChurn.set(f, (fileChurn.get(f) || 0) + 1);
	}

	// max_transaction_size 필터: tangled commit 결합 inflate 회피 + 단일파일 commit(쌍 없음) 제외 (pair mining 전용)
	const txns = windowed.filter(
		(t) => t.files.length >= 2 && t.files.length <= params.max_transaction_size,
	);

	const fileCount = new Map();
	const pairCount = new Map(); // key: a + PAIR + b (a<b 정렬)
	for (const t of txns) {
		const files = [...new Set(t.files)].sort();
		for (const f of files) fileCount.set(f, (fileCount.get(f) || 0) + 1);
		for (let i = 0; i < files.length; i++) {
			for (let j = i + 1; j < files.length; j++) {
				const key = files[i] + PAIR + files[j];
				pairCount.set(key, (pairCount.get(key) || 0) + 1);
			}
		}
	}

	const pairs = [];
	for (const [key, support] of pairCount) {
		if (support < params.min_support) continue;
		const [a, b] = key.split(PAIR);
		const confAB = support / fileCount.get(b); // P(a 변경 | b 변경)
		const confBA = support / fileCount.get(a); // P(b 변경 | a 변경)
		if (Math.max(confAB, confBA) < params.min_confidence) continue;
		pairs.push({
			a,
			b,
			support,
			confidence_a_given_b: round4(confAB),
			confidence_b_given_a: round4(confBA),
		});
	}
	// 결정론 정렬: support desc → a asc → b asc
	pairs.sort(
		(x, y) =>
			y.support - x.support ||
			(x.a < y.a ? -1 : x.a > y.a ? 1 : 0) ||
			(x.b < y.b ? -1 : x.b > y.b ? 1 : 0),
	);

	const fileChurnObj = {};
	for (const k of [...fileChurn.keys()].sort()) fileChurnObj[k] = fileChurn.get(k);

	return {
		status: 'mined',
		transactions_analyzed: txns.length,
		pairs,
		file_churn: fileChurnObj,
		note: `git log 이력 mining (commit ${commits.length}건 중 max_tx_size<=${params.max_transaction_size} 통과 ${txns.length}건 / min_support>=${params.min_support} / min_confidence>=${params.min_confidence}${params.window ? ` / window=${params.window}` : ''}${params.since ? ` / since=${params.since}` : ''}).`,
	};
}

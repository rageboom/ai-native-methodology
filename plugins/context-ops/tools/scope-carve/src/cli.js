#!/usr/bin/env node
// scope-carve CLI — 역공학 scope-carve 3신호 reference-lens (DEC-2026-06-09-scope-carve-3signal-reference-lens).
//
//   사용:
//     scope-carve --architecture <architecture.json> [--repo <dir>] [--output <dir>]
//       [--since <date>] [--min-support N] [--min-confidence F] [--window N]
//       [--max-transaction-size N] [--unstable-instability F] [--hub-afferent N] [--stdout]
//
//   --architecture : SCC + Martin 입력 (필수). 부재 시 ScopeCarveEnvironmentMissing → exit 3 (정직 신호).
//   --repo         : co-change git 이력 입력(선택). 미지정 = SCC+Martin 만. git 부재 = co-change honest skip(exit 0).
//   --output       : 산출 디렉토리 (기본 <repo|cwd>/.ai-context/output). scope-carve.json 작성.
//
//   exit 0 = 정상 / 2 = usage / 3 = architecture.json 부재(환경 부재 / no-simulation).
//
//   출력 = scope-carve.json (schemas/scope-carve.schema.json / reference-lens / NOT gate-injected /
//   soft gate #0 evidence — 어떤 결정적 gate 에도 inject ❌).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeMiningGitRunner } from './co-change.js';
import { buildCarve, DEFAULT_PARAMS, TOOL_VERSION } from './carve.js';
import { baseDirForRead } from '../../_shared/ai-context-layout.js';

export class ScopeCarveEnvironmentMissing extends Error {}

function parseArgs(argv) {
	const opts = {
		architecture: null,
		repo: null,
		output: null,
		stdout: false,
		co: { ...DEFAULT_PARAMS.co_change },
		martin: { ...DEFAULT_PARAMS.martin_thresholds },
		hotspot: { ...DEFAULT_PARAMS.hotspot },
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--architecture') opts.architecture = argv[++i];
		else if (a === '--repo') opts.repo = argv[++i];
		else if (a === '--output') opts.output = argv[++i];
		else if (a === '--stdout') opts.stdout = true;
		else if (a === '--since') opts.co.since = argv[++i];
		else if (a === '--scope-root') opts.co.scope_root = argv[++i];
		else if (a === '--min-support') opts.co.min_support = Number(argv[++i]);
		else if (a === '--min-confidence') opts.co.min_confidence = Number(argv[++i]);
		else if (a === '--window') opts.co.window = Number(argv[++i]);
		else if (a === '--max-transaction-size')
			opts.co.max_transaction_size = Number(argv[++i]);
		else if (a === '--unstable-instability')
			opts.martin.unstable_instability = Number(argv[++i]);
		else if (a === '--hub-afferent') opts.martin.hub_afferent = Number(argv[++i]);
		else if (a === '--hotspot-top-n') opts.hotspot.top_n = Number(argv[++i]);
		else if (a === '--min-churn') opts.hotspot.min_churn = Number(argv[++i]);
		else if (a === '--tab-width') opts.hotspot.tab_width = Number(argv[++i]);
		else if (a === '--exclude')
			opts.co.path_excludes = [...(opts.co.path_excludes || []), argv[++i]];
		else if (a === '--no-default-excludes') opts.co.path_excludes = [];
	}
	return opts;
}

function usage() {
	console.error('usage:');
	console.error(
		'  scope-carve --architecture <architecture.json> [--repo <dir>] [--output <dir>]',
	);
	console.error(
		'    [--since <date>] [--min-support N] [--min-confidence F] [--window N]',
	);
	console.error(
		'    [--max-transaction-size N] [--unstable-instability F] [--hub-afferent N]',
	);
	console.error(
		'    [--hotspot-top-n N] [--min-churn N] [--tab-width N] [--stdout]',
	);
	console.error(
		'    [--exclude <glob> (반복가능, 기본목록에 추가)] [--no-default-excludes (제외 끔)]',
	);
	console.error(
		'    [--scope-root <path> (monorepo 1앱 carve 시 git log 를 -- <path> 로 제한 / 미지정 시 modules[].path 공통 prefix 자동)]',
	);
	console.error(
		'  (architecture.json 부재 시 exit 3 / no-simulation — reference-lens / NOT gate-injected)',
	);
}

function buildReproCommand(opts) {
	const parts = [`scope-carve --architecture ${opts.architecture}`];
	if (opts.repo) parts.push(`--repo ${opts.repo}`);
	if (opts.co.since) parts.push(`--since ${opts.co.since}`);
	if (opts.co.scope_root) parts.push(`--scope-root ${opts.co.scope_root}`);
	parts.push(`--min-support ${opts.co.min_support}`);
	parts.push(`--min-confidence ${opts.co.min_confidence}`);
	if (opts.co.window) parts.push(`--window ${opts.co.window}`);
	parts.push(`--max-transaction-size ${opts.co.max_transaction_size}`);
	parts.push(`--unstable-instability ${opts.martin.unstable_instability}`);
	parts.push(`--hub-afferent ${opts.martin.hub_afferent}`);
	parts.push(`--hotspot-top-n ${opts.hotspot.top_n}`);
	parts.push(`--min-churn ${opts.hotspot.min_churn}`);
	parts.push(`--tab-width ${opts.hotspot.tab_width}`);
	const defaultExcludes = DEFAULT_PARAMS.co_change.path_excludes || [];
	const px = opts.co.path_excludes || [];
	if (px.length === 0) parts.push('--no-default-excludes');
	else for (const g of px.slice(defaultExcludes.length)) parts.push(`--exclude ${g}`);
	return parts.join(' ');
}

function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (!opts.architecture) {
		usage();
		process.exit(2);
	}
	const archPath = resolve(opts.architecture);
	if (!existsSync(archPath)) {
		console.error(
			`[scope-carve] ScopeCarveEnvironmentMissing: architecture.json 부재 (${archPath}).`,
		);
		console.error(
			'[scope-carve] NO SIMULATION — analysis-architecture 산출물(architecture.json) 선행 필요. LLM 추론 대체 ❌.',
		);
		process.exit(3);
	}

	let architectureRaw;
	let architecture;
	try {
		architectureRaw = readFileSync(archPath, 'utf-8');
		architecture = JSON.parse(architectureRaw);
	} catch (err) {
		console.error(`[scope-carve] architecture.json 파싱 실패: ${err.message}`);
		process.exit(2);
	}

	const repoPath = opts.repo ? resolve(opts.repo) : null;
	const gitRunner = repoPath ? makeMiningGitRunner(repoPath) : null;

	const params = {
		co_change: opts.co,
		martin_thresholds: opts.martin,
		hotspot: opts.hotspot,
	};

	const t0 = Date.now();
	const result = buildCarve({
		architectureRaw,
		architecture,
		architecturePath: archPath,
		repoPath,
		gitRunner,
		readFileFn: (p) => readFileSync(p, 'utf-8'),
		params,
		nowIso: new Date().toISOString(),
		durationMs: 0,
		reproductionCommand: buildReproCommand(opts),
	});
	result.evidence.duration_ms = Date.now() - t0;

	const outDir = opts.output
		? resolve(opts.output)
		: baseDirForRead(repoPath || process.cwd());
	mkdirSync(outDir, { recursive: true });
	const outPath = join(outDir, 'scope-carve.json');
	writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');

	if (opts.stdout) {
		process.stdout.write(JSON.stringify(result, null, 2) + '\n');
	} else {
		const atoms = result.scc.components.filter((c) => c.is_atomic).length;
		const sinks = result.martin.filter((m) => m.role === 'sink').length;
		const hubs = result.martin.filter((m) => m.role === 'hub').length;
		console.log(
			`[scope-carve] v${TOOL_VERSION} reference-lens (NOT gate-injected) → ${outPath}`,
		);
		console.log(
			`[scope-carve] SCC: ${result.scc.components.length} comp (${atoms} atomic / has_cycle=${result.scc.has_cycle}) | Martin: ${sinks} sink, ${hubs} hub (A/D abstain) | co-change: ${result.co_change.status} (${result.co_change.pairs.length} pair) | hotspot: ${result.hotspot.status} (${result.hotspot.items.length}) | candidates: ${result.carve_candidates.length}`,
		);
		console.log(
			'[scope-carve] soft gate #0 evidence — 사용자가 scope 확정 (carve 는 구조 신호일 뿐).',
		);
	}
	// process.exit(0) 안 함 — 대용량 --stdout 파이프가 drain 전 truncate 되는 Node footgun 회피.
	// 성공 = exitCode 기본 0 / 이벤트루프 비면 자연 종료(stdout flush 보장).
}

// 직접 실행 시에만 main (테스트 import 안전)
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main();
}

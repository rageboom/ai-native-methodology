#!/usr/bin/env node
// cli.js — dep-graph-viz: artifact-graph.json → self-contained 인터랙티브 HTML (영향도 추적 뷰).
//   usage: dep-graph-viz --graph <artifact-graph.json> [--scope <id>] [--out <html>] [--repo-root <dir>]
//   기본 출력 = <graph 디렉토리>/dep-graph.html (gitignored 권장 — committed mirror 아님 / ADR-011 view-time).

import {
	readFileSync,
	writeFileSync,
	readdirSync,
	existsSync,
	mkdirSync,
} from 'node:fs';
import { dirname, join, basename, resolve } from 'node:path';
import { augmentGraph } from './augment.js';
import { buildHtml } from './emit.js';
import { readCodegraph, findCodegraphDb, attachSymbols } from './codegraph.js';
import { checkGraphFreshness } from '../../_shared/graph-freshness.js';

function parseArgs(argv) {
	const a = { repoRoot: process.cwd() };
	for (let i = 0; i < argv.length; i++) {
		const k = argv[i];
		if (k === '--graph') a.graph = argv[++i];
		else if (k === '--all-scopes') {
			a.allScopes = true;
			// 다음 토큰이 플래그가 아니면 scopes 디렉토리 경로로 취급(없으면 기본값).
			if (argv[i + 1] && !argv[i + 1].startsWith('--')) a.scopesDir = argv[++i];
		} else if (k === '--out-dir') a.outDir = argv[++i];
		else if (k === '--scope') a.scope = argv[++i];
		else if (k === '--out') a.out = argv[++i];
		else if (k === '--repo-root') a.repoRoot = argv[++i];
		else if (k === '--codegraph') a.codegraph = argv[++i];
		else if (k === '--no-codegraph') a.noCodegraph = true;
		else if (k === '-h' || k === '--help') a.help = true;
	}
	return a;
}

const HELP = `dep-graph-viz — dep-graph 인터랙티브 시각화 (영향도 추적)

  단일 도메인:
  --graph <path>      artifact-graph.json (단일 모드 필수)
  --scope <id>        특정 scope_id 만 (기본: 전체)
  --out <path>        출력 HTML (기본: <graph 디렉토리>/dep-graph.html)

  멀티 도메인 (도메인 선택 드롭다운):
  --all-scopes [dir]  <dir>/*/impl/artifact-graph.json 를 모두 빌드 (기본 dir: .ai-context/scopes)
  --out-dir <dir>     출력 디렉토리 (기본: .ai-context/dep-graph) — <scope>.html × N + index.html

  공통:
  --repo-root <dir>   freshness source 경로 기준 (기본: cwd)
  --codegraph <db>    codegraph.db 경로 (코드 leaf 아래 함수·메서드+호출 표시 / 단일은 자동 탐색, 멀티는 <repo>/.codegraph/codegraph.db 폴백)
  --no-codegraph      codegraph 자동 탐색·부착 끔

  생성물은 reference-lens / display-only / on-demand — gate inject ❌, SSOT 무변경.`;

function scopeFilter(graph, scope) {
	if (!scope) return graph;
	const realIds = new Set((graph.nodes ?? []).map((n) => n.id));
	const kept = (graph.nodes ?? []).filter((n) => n.scope_id === scope);
	const keptIds = new Set(kept.map((n) => n.id));
	const edges = (graph.edges ?? []).filter(
		(e) => keptIds.has(e.source) && (keptIds.has(e.target) || !realIds.has(e.target)),
	);
	return { ...graph, nodes: kept, edges };
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help || (!args.graph && !args.allScopes)) {
		console.log(HELP);
		process.exit(args.graph || args.allScopes ? 0 : 1);
	}
	if (args.allScopes) runAllScopes(args);
	else runSingle(args);
}

// 단일 도메인 그래프 → 단독 HTML (드롭다운 없음 — domains 미제공 시 app.js 가 select 숨김).
function runSingle(args) {
	const graphPath = resolve(args.graph);
	let raw;
	try {
		raw = JSON.parse(readFileSync(graphPath, 'utf8'));
	} catch (err) {
		console.error(`✗ graph 로드 실패 (${graphPath}): ${err.message}`);
		process.exit(1);
	}
	if (!Array.isArray(raw.nodes)) {
		console.error('✗ artifact-graph.json 형태 아님 (nodes 배열 부재)');
		process.exit(1);
	}

	// freshness 는 원본(전체 derived_from) 기준 — 그래프 파일 staleness.
	const freshness = checkGraphFreshness(raw, { repoRoot: args.repoRoot });

	const scoped = scopeFilter(raw, args.scope);
	const augmented = augmentGraph(scoped);

	// codegraph 심볼(함수·메서드+호출) 부착 — 표시 전용 / 결정론 axis 무오염.
	let cgNote = '';
	if (!args.noCodegraph) {
		const dbPath = args.codegraph || findCodegraphDb(graphPath);
		if (dbPath) {
			try {
				attachSymbols(augmented, readCodegraph(dbPath));
				cgNote = ` · ${augmented.symbol_count || 0} symbol (codegraph)`;
			} catch (err) {
				cgNote = ` · codegraph skip (${err.message})`;
			}
		} else if (args.codegraph) {
			cgNote = ' · codegraph 경로 없음';
		}
	}

	const graphName = args.scope || basename(graphPath);
	const html = buildHtml(augmented, freshness, { graphName });

	const outPath = resolve(args.out || join(dirname(graphPath), 'dep-graph.html'));
	writeFileSync(outPath, html);

	const synth = augmented.nodes.filter((n) => n.synthetic).length;
	console.log(`✓ dep-graph viz 생성: ${outPath}`);
	console.log(
		`  ${augmented.nodes.length} nodes (${synth} synthetic 표시) · ${augmented.edges.length} edges` +
			cgNote +
			(args.scope ? ` · scope=${args.scope}` : '') +
			(freshness.stale ? ` · ⚠ STALE (${freshness.stale_sources.length} source)` : ' · fresh'),
	);
	console.log('  reference-lens / display-only — committed mirror 아님 (gitignore 권장).');
}

// 멀티 도메인 — <scopesDir>/*/impl/artifact-graph.json 일괄 빌드 → <outDir>/<scope>.html × N + index.html.
//   codegraph.db 는 1회만 읽어 모든 scope 가 공유(371MB DB 를 N 번 안 읽음). 각 페이지 툴바 드롭다운으로 도메인 전환.
function runAllScopes(args) {
	const scopesDir = resolve(
		args.scopesDir || join(args.repoRoot, '.ai-context', 'scopes'),
	);
	if (!existsSync(scopesDir)) {
		console.error(`✗ scopes 디렉토리 없음: ${scopesDir}`);
		process.exit(1);
	}
	// 각 <scope>/impl/artifact-graph.json (impl 직속만 — snapshots/ 하위는 자동 제외).
	const entries = readdirSync(scopesDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => ({
			scope: d.name,
			graph: join(scopesDir, d.name, 'impl', 'artifact-graph.json'),
		}))
		.filter((e) => existsSync(e.graph))
		.sort((a, b) => a.scope.localeCompare(b.scope));
	if (!entries.length) {
		console.error(`✗ artifact-graph.json 없음: ${scopesDir}/*/impl/`);
		process.exit(1);
	}
	const domains = entries.map((e) => e.scope);
	const outDir = resolve(
		args.outDir || join(args.repoRoot, '.ai-context', 'dep-graph'),
	);
	mkdirSync(outDir, { recursive: true });

	// codegraph 1회 로드 → 공유. (findCodegraphDb 는 .ai-context/output 2단계 가정이라 scopes 4단계엔 안 맞음 → 명시/폴백.)
	let cg = null;
	if (!args.noCodegraph) {
		const dbPath = resolve(
			args.codegraph || join(args.repoRoot, '.codegraph', 'codegraph.db'),
		);
		if (existsSync(dbPath)) {
			try {
				cg = readCodegraph(dbPath);
				console.error(`[dep-graph-viz] codegraph 공유 로드: ${dbPath}`);
			} catch (err) {
				console.error(`  ⚠ codegraph 읽기 실패 — 심볼 없이 진행: ${err.message}`);
			}
		} else {
			console.error(`  ⚠ codegraph.db 없음 (${dbPath}) — 심볼 없이 진행`);
		}
	}

	let ok = 0;
	for (const e of entries) {
		try {
			const raw = JSON.parse(readFileSync(e.graph, 'utf8'));
			if (!Array.isArray(raw.nodes)) throw new Error('nodes 배열 부재');
			const freshness = checkGraphFreshness(raw, { repoRoot: args.repoRoot });
			const augmented = augmentGraph(raw);
			let symCount = 0;
			if (cg) {
				attachSymbols(augmented, cg);
				symCount = augmented.symbol_count || 0;
			}
			const html = buildHtml(augmented, freshness, {
				graphName: e.scope,
				domains,
				currentScope: e.scope,
			});
			writeFileSync(join(outDir, `${e.scope}.html`), html);
			ok++;
			console.log(
				`  ✓ ${e.scope}.html — ${augmented.nodes.length} nodes · ${symCount} symbol` +
					(freshness.stale ? ' · ⚠STALE' : ''),
			);
		} catch (err) {
			console.error(`  ✗ ${e.scope}: ${err.message}`);
		}
	}

	// index.html — 첫 도메인으로 리다이렉트 + 전체 목록 링크 (드롭다운 진입점).
	const first = entries[0].scope;
	const links = entries
		.map((e) => `<li><a href="${e.scope}.html">${e.scope}</a></li>`)
		.join('\n');
	const index = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>dep-graph — 도메인 목록</title>
<meta http-equiv="refresh" content="0; url=${first}.html"></head>
<body><p><a href="${first}.html">${first}</a> 로 이동 중… 도메인 목록:</p>
<ul>\n${links}\n</ul></body></html>`;
	writeFileSync(join(outDir, 'index.html'), index);

	console.log(
		`✓ dep-graph viz (멀티 도메인): ${ok}/${entries.length} → ${outDir}`,
	);
	console.log(
		`  진입점: ${join(outDir, 'index.html')} (또는 <scope>.html 직접) · 툴바 드롭다운으로 도메인 전환 · reference-lens / display-only`,
	);
}

main();

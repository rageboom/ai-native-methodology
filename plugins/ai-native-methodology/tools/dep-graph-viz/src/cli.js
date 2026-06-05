#!/usr/bin/env node
// cli.js — dep-graph-viz: artifact-graph.json → self-contained 인터랙티브 HTML (영향도 추적 뷰).
//   usage: dep-graph-viz --graph <artifact-graph.json> [--scope <id>] [--out <html>] [--repo-root <dir>]
//   기본 출력 = <graph 디렉토리>/dep-graph.html (gitignored 권장 — committed mirror 아님 / ADR-011 view-time).

import { readFileSync, writeFileSync } from 'node:fs';
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

  --graph <path>      artifact-graph.json (필수)
  --scope <id>        특정 scope_id 만 (기본: 전체)
  --out <path>        출력 HTML (기본: <graph 디렉토리>/dep-graph.html)
  --repo-root <dir>   freshness source 경로 기준 (기본: cwd)
  --codegraph <db>    codegraph.db 경로 (코드 leaf 아래 함수·메서드+호출 표시 / 기본: 자동 탐색)
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
	if (args.help || !args.graph) {
		console.log(HELP);
		process.exit(args.graph ? 0 : 1);
	}

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

main();

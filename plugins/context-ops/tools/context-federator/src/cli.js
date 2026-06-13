#!/usr/bin/env node
// context-federator CLI
// dep-graph × codegraph federation → context-cache.json (reference-lens / non-gating).
//   DEC-2026-06-02-context-federation (Phase 1).
//
// usage: context-federator <artifact-graph.json> [options]
//
// gate 무개입 — fail exit 없음 (codegraph 휴리스틱 = reference-lens / non-gating).
//   exit codes: 0 = ok / 2 = usage error · 파일 읽기 실패.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
	federate,
	makeNavigateRunner,
	makeCodegraphAdapter,
	cacheStaleness,
	resolvePromptToNodes,
	loadLegacyDataSource,
} from './federator.js';

const HERE = dirname(fileURLToPath(import.meta.url));
// 도구→도구 import 회피 = chain-driver CLI 를 child process black-box 로 호출 (navigate SKILL 동형).
const CHAIN_DRIVER_CLI = resolve(HERE, '../../chain-driver/src/cli.js');

function usage(code = 2) {
	console.error(
		[
			'usage: context-federator <artifact-graph.json> [options]',
			'',
			'dep-graph(의미) × codegraph(코드 구조)를 code_pointers 로 join → context-cache.json (reference-lens).',
			'',
			'options:',
			'  --repo-root <dir>            code_pointer.path 해석 base (default: cwd)',
			'  --codegraph-project <dir>    codegraph 인덱스(.codegraph) 위치 (default: --repo-root)',
			'  --origin <id>                특정 노드만 federate (반복 가능 / 미지정 = 모든 anchored Tier-1)',
			'  --prompt "<text>"            Phase 3 — 자연어 프롬프트의 식별자(노드ID/파일명/심볼)를 결정론 매칭해 노드 선택 (의미·임베딩 ❌=carry)',
			'  --out <file>                 context-cache.json 출력 경로 (default: stdout / 디렉토리 자동 생성)',
			'  --delta                      Phase 2 — 기존 --out 캐시 재사용: 바뀐 노드만 재계산 (2축: graph→dep / codegraph→code)',
			'  --sql-inventory <file>       Phase 1.5 — legacy 데이터 반쪽 소스 override (기본: analysis-sql-inventory 노드 source_path 자동발견)',
			'  --db-schema <file>           Phase 1.5 — db-schema override (dependent_tables 컬럼 보강 / 기본: 자동발견)',
			'  --no-callers                 codegraph callers + callees 조회 생략 (1-hop neighbor 한 쌍 동반 off / 빠름)',
			'  --max-symbols <n>            strict_path 앵커당 최대 심볼 수 (default: 12)',
			'  --format text|json           stdout 출력 형식 (default: json / --out 지정 시 항상 json 파일)',
			'  --help / -h                  도움말',
			'',
			'exit codes: 0 = ok / 2 = usage error · 읽기 실패 (gate 무개입 = fail exit 없음)',
		].join('\n'),
	);
	process.exit(code);
}

function parseArgs(argv) {
	const out = {
		origins: [],
		withCallers: true,
		maxSymbols: 12,
		format: 'json',
		delta: false,
	};
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--help' || a === '-h') usage(0);
		else if (a === '--repo-root') out.repoRoot = argv[++i];
		else if (a === '--codegraph-project') out.codegraphProject = argv[++i];
		else if (a === '--origin') out.origins.push(argv[++i]);
		else if (a === '--prompt') out.prompt = argv[++i];
		else if (a === '--out') out.outPath = argv[++i];
		else if (a === '--sql-inventory') out.sqlInventory = argv[++i];
		else if (a === '--db-schema') out.dbSchema = argv[++i];
		else if (a === '--delta') out.delta = true;
		else if (a === '--no-callers') out.withCallers = false;
		else if (a === '--max-symbols') out.maxSymbols = Number(argv[++i]);
		else if (a === '--format') out.format = argv[++i];
		else if (!a.startsWith('--') && !out.graphPath) out.graphPath = a;
		else {
			console.error(`unknown arg: ${a}`);
			usage(2);
		}
	}
	if (!out.graphPath) usage(2);
	return out;
}

function main() {
	const args = parseArgs(process.argv);
	const repoRoot = resolve(args.repoRoot ?? process.cwd());
	const codegraphProjectDir = resolve(args.codegraphProject ?? repoRoot);
	const graphPath = resolve(args.graphPath);

	let rawGraph, graph;
	try {
		rawGraph = readFileSync(graphPath, 'utf-8');
		graph = JSON.parse(rawGraph);
	} catch (err) {
		console.error(
			`[context-federator] graph 읽기 실패: ${graphPath}\n${err?.message ?? err}`,
		);
		process.exit(2);
	}

	const navigate = makeNavigateRunner({
		graphPath,
		chainDriverCli: CHAIN_DRIVER_CLI,
		repoRoot,
	});
	const codegraph = makeCodegraphAdapter({ codegraphProjectDir });
	// Phase 1.5 — legacy 데이터 반쪽 (sql-inventory/db-schema 자동발견 또는 override).
	const dataSource = loadLegacyDataSource(graph, {
		repoRoot,
		sqlInventoryPath: args.sqlInventory,
		dbSchemaPath: args.dbSchema,
	});
	// Phase 2 stamps — graph_stamp(파일 내용 해시) = dep 축 / codegraph indexedAt(DB mtime) = code 축.
	const graphStamp = createHash('sha256').update(rawGraph).digest('hex');
	const codegraphIndexedAt =
		typeof codegraph.indexedAt === 'function' ? codegraph.indexedAt() : null;

	// Phase 2 델타 — 기존 --out 캐시를 prevCache 로 읽어 바뀐 노드만 재계산.
	let prevCache = null;
	if (args.delta && args.outPath && existsSync(resolve(args.outPath))) {
		try {
			prevCache = JSON.parse(readFileSync(resolve(args.outPath), 'utf-8'));
		} catch {
			prevCache = null;
		}
	}
	if (args.delta) {
		const f = cacheStaleness(prevCache, { graphStamp, codegraphIndexedAt });
		console.error(
			`[context-federator] delta: ${f.stale ? '변경 → ' + f.reasons.join('; ') : 'fresh — 전부 carry (재계산 0)'}`,
		);
	}

	// Phase 3 — 자연어 프롬프트 → 노드 결정론 매칭 (식별자/파일명/심볼 substring).
	let originIds = args.origins.length ? args.origins : null;
	if (args.prompt) {
		const hits = resolvePromptToNodes(args.prompt, graph, { topN: 8 });
		if (hits.length) {
			originIds = hits.map((h) => h.node_id);
			console.error(
				'[context-federator] prompt 매칭 ' +
					hits.length +
					': ' +
					hits.map((h) => `${h.node_id}(${h.score})`).join(', '),
			);
		} else {
			console.error(
				'[context-federator] prompt 에서 노드 미발견 — 식별자(노드ID/파일명/심볼)가 프롬프트에 있어야 결정론 매칭. --origin <id> 지정 또는 임베딩 의미검색(carry).',
			);
			originIds = ['__no_match__']; // 매칭 0 = federate 0 (전체 federate 방지)
		}
	}

	const cache = federate(graph, {
		repoRoot,
		codegraphProjectDir,
		navigate,
		codegraph,
		originIds,
		withCallers: args.withCallers,
		maxSymbols: args.maxSymbols,
		graphPath,
		prevCache,
		graphStamp,
		codegraphIndexedAt,
		dataSource,
	});

	if (
		codegraph.available &&
		codegraph.sqliteReader === false &&
		cache.stats.anchors_unresolved > 0
	) {
		console.error(
			'[context-federator] node:sqlite 미가용 → 파일→심볼(code 반쪽) 대부분 미해소. Node >=22.13 또는 node --experimental-sqlite 로 실행 (F-FED-WIN-001).',
		);
	}
	if (args.outPath) {
		const outPath = resolve(args.outPath);
		mkdirSync(dirname(outPath), { recursive: true });
		writeFileSync(outPath, JSON.stringify(cache, null, 2) + '\n');
		const s = cache.stats;
		console.error(
			`[context-federator] ${outPath}\n` +
				`  packs=${s.pack_count} anchored_nodes=${s.anchored_nodes} symbols_resolved=${s.symbols_resolved} callees_resolved=${s.callees_resolved} ` +
				`anchors_unresolved=${s.anchors_unresolved} codegraph=${s.codegraph_available ? cache.codegraph.version : 'unavailable'}\n` +
				`  delta: dep_recomputed=${s.dep_recomputed} code_recomputed=${s.code_recomputed} carried=${s.carried_packs}\n` +
				`  data(legacy): sql_inventory=${s.data_source_available ? 'loaded' : 'none'} data_anchored_nodes=${s.data_anchored_nodes} data_refs=${s.data_refs_count}`,
		);
	} else if (args.format === 'text') {
		const s = cache.stats;
		console.log(
			`[context-federator] codegraph=${s.codegraph_available ? cache.codegraph.version : 'unavailable'} / sql-inventory=${s.data_source_available ? 'loaded' : 'none'} / packs=${s.pack_count}`,
		);
		for (const p of cache.packs) {
			const code = p.code_refs.reduce((a, r) => a + r.symbols.length, 0);
			const callees = p.code_refs.reduce(
				(a, r) =>
					a + r.symbols.reduce((b, s) => b + (s.callees?.length ?? 0), 0),
				0,
			);
			console.log(
				`  ${p.node_id} (${p.artifact_kind}/${p.artifact_subkind}) state=${p.state}`,
			);
			console.log(
				`    dep_impact MUST=${p.dep_impact.must.length} SHOULD=${p.dep_impact.should.length} FYI=${p.dep_impact.fyi.length}`,
			);
			console.log(
				`    code_anchors=${p.code_anchors.length} code_symbols=${code} callees=${callees}${p.code_refs.some((r) => r.unresolved) ? ' (일부 unresolved)' : ''}`,
			);
			if (p.data_refs.length) {
				const tables = [
					...new Set(
						p.data_refs.flatMap((d) => d.dependent_tables.map((t) => t.name)),
					),
				];
				console.log(
					`    data_refs=${p.data_refs.length} SQL (legacy / tables: ${tables.join(', ') || '-'})`,
				);
			}
		}
	} else {
		writeStdoutSync(JSON.stringify(cache, null, 2));
	}
	process.exit(0);
}

main();

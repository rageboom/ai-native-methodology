#!/usr/bin/env node
// codegraph-coverage — codegraph wiring STEP 1 (DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 1).
//   code→artifact coverage-hole 공통 메커니즘: codegraph 코드 엔티티(route/method) 전수 → 산출물 ref set-diff → hole.
//   reference-lens / 비차단(severity low|medium) / 결정적 gate inject ❌ / no-simulation(실 SQLite / 환경부재 exit 3).
//
//   v12.10.0 STEP 2 (DEC §5 STEP 2 / finding 채널) — --emit-findings: coverage-hole → finding-system promote-ready 레코드
//     (discoverer:'codegraph' + code_graph_ref / finding_id 미부여 = 사람 promote) + handler-set reading-aid (implements/extends).
//
//   usage:
//     codegraph-coverage --target <projectDir> [--deliverables <dir>] [--inventory <path>] [--axes route,method] [--out <file>] [--json]
//     codegraph-coverage --db <codegraph.db> --deliverables <dir> [--inventory <path>] [--out <file>] [--json]
//     codegraph-coverage --target <projectDir> --emit-findings [--out-findings <file>] [--json]   # STEP 2 finding 채널
//
//   exit: 0=ok / 2=invariant-violation / 3=codegraph DB 부재 또는 usage-error.

import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, isAbsolute, dirname } from 'node:path';
import {
	enumerateNodes,
	enumerateEdges,
	distinctFiles,
	checkIndexFreshness,
	sourceRootForDb,
} from './enumerate.js';
import { classifyStack } from './detect.js';
import { collectRefs, collectSymbolAnchors } from './collect.js';
import { buildCoverage } from './coverage.js';
import { MODULE_EDGE_KINDS } from './module-graph.js';
import { renderMarkdown, toFindings, SEVERITY_CEILING } from './render.js';
import {
	toPromoteReadyFindings,
	buildHandlerSet,
	renderPromoteFindingsMarkdown,
} from './finding-export.js';
import {
	buildAnchorVerify,
	toAnchorFindings,
	renderAnchorVerifyMarkdown,
	SYMBOL_KINDS,
} from './anchor-verify.js';

const DELIVERABLE_FILES = {
	'acceptance-criteria': 'acceptance-criteria.json',
	'discovery-spec': 'discovery-spec.json',
	'behavior-spec': 'behavior-spec.json',
	'impl-spec': 'impl-spec.json',
	'test-spec': 'test-spec.json',
};

function usage(code = 3) {
	console.error(
		[
			'usage: codegraph-coverage --target <projectDir> [--deliverables <dir>] [--inventory <path>] [--axes route,method] [--out <file>] [--json]',
			'       codegraph-coverage --db <codegraph.db> --deliverables <dir> [--inventory <path>] [--out <file>] [--json]',
			'       codegraph-coverage --target <projectDir> --emit-findings [--out-findings <file>] [--json]    # STEP 2 finding 채널',
			'       codegraph-coverage --target <projectDir> --verify-anchors [--out-verify <file>] [--json]    # STEP 4 ast_symbol 역방향 검증',
			'',
			'exit: 0=ok / 2=invariant / 3=codegraph DB 부재·usage',
		].join('\n'),
	);
	process.exit(code);
}

function parseArgs(argv) {
	const out = { json: false, axes: ['route', 'method', 'module'] };
	const rest = argv.slice(2);
	for (let i = 0; i < rest.length; i++) {
		const a = rest[i];
		if (a === '--json') out.json = true;
		else if (a === '--target') out.target = rest[++i];
		else if (a === '--db') out.db = rest[++i];
		else if (a === '--deliverables') out.deliverables = rest[++i];
		else if (a === '--inventory') out.inventory = rest[++i];
		else if (a === '--out') out.out = rest[++i];
		else if (a === '--emit-findings') out.emitFindings = true;
		else if (a === '--out-findings') out.outFindings = rest[++i];
		else if (a === '--verify-anchors') out.verifyAnchors = true;
		else if (a === '--out-verify') out.outVerify = rest[++i];
		else if (a === '--axes')
			out.axes = String(rest[++i] || '')
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
		else if (a === '--help' || a === '-h') usage(0);
		else if (a.startsWith('--')) usage(3);
		else if (!out.target) out.target = a;
	}
	return out;
}

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, 'utf-8'));
	} catch {
		return null;
	}
}

function main() {
	const args = parseArgs(process.argv);

	// codegraph DB 경로 해소.
	let dbPath = args.db ? resolve(args.db) : null;
	if (!dbPath && args.target)
		dbPath = join(resolve(args.target), '.codegraph', 'codegraph.db');
	if (!dbPath) usage(3);

	// 산출물 디렉토리 해소 (default = <target>/.aimd/output).
	let delivDir = args.deliverables ? resolve(args.deliverables) : null;
	if (!delivDir && args.target)
		delivDir = join(resolve(args.target), '.aimd', 'output');
	if (!delivDir || !existsSync(delivDir)) usage(3);

	// inventory (stack 감지).
	const invPath = args.inventory
		? resolve(args.inventory)
		: join(delivDir, 'inventory.json');
	const inventory = existsSync(invPath) ? readJson(invPath) : null;
	const detect = classifyStack(inventory || {});

	// no-simulation — codegraph 환경/DB 부재 = 정직 exit 3 (LLM 추론으로 코드구조 날조 ❌).
	const enumResult = enumerateNodes(dbPath, ['route', 'method']);
	if (!enumResult.available) {
		console.error(
			`[codegraph-coverage] codegraph DB unavailable — ${enumResult.reason}`,
		);
		console.error(
			'  no-simulation: 실 codegraph index 없이는 coverage-hole 산출 불가. `codegraph index` 후 재실행.',
		);
		process.exit(3);
	}

	// freshness (display-only).
	const fresh = checkIndexFreshness(
		dbPath,
		distinctFiles(dbPath),
		sourceRootForDb(dbPath),
	);

	// 산출물 ref 수집.
	const deliverables = {};
	for (const [key, fname] of Object.entries(DELIVERABLE_FILES)) {
		const fp = join(delivDir, fname);
		if (existsSync(fp)) {
			const obj = readJson(fp);
			if (obj) deliverables[key] = obj;
		}
	}
	const refs = collectRefs(deliverables);

	// v12.12.0 STEP 4 — ast_symbol 역방향 검증 (--verify-anchors): 산출물 앵커 ∖ codegraph 심볼 = stale-anchor.
	//   coverage(정방향)와 분리된 self-contained 모드 (early-exit). 앵커 0 = unverified note (false-health 회피).
	if (args.verifyAnchors) {
		const { anchors, sources: anchorSources } =
			collectSymbolAnchors(deliverables);
		const symEnum = enumerateNodes(dbPath, SYMBOL_KINDS);
		const symbolNodesByKind = symEnum.available ? symEnum.byKind : {};
		const verify = buildAnchorVerify({
			anchors,
			symbolNodesByKind,
			indexedFiles: distinctFiles(dbPath),
			freshness: fresh,
		});
		const dbPathFwd = dbPath.replace(/\\/g, '/');
		const verifyFindings = toAnchorFindings(verify, dbPathFwd);
		const verifyReport = {
			meta: {
				schema: 'code-anchor-verify.schema.json',
				generated_by: 'codegraph-coverage --verify-anchors',
				do_not_edit_manually: true,
				reference_lens: true,
				trust_note:
					'reference-lens / NOT gate-injected. stale-anchor = 비차단(severity low|medium). 결정적 gate inject ❌. informational(codegraph 사각)=결함 아님/severity 부재. 최종 evidence = 실코드 grep.',
				generated_at: new Date().toISOString(),
				severity_ceiling: [...SEVERITY_CEILING],
			},
			target: resolve(args.target || dirname(dirname(dbPath))).replace(
				/\\/g,
				'/',
			),
			stack: {
				language: detect.language,
				backend_known: detect.backend_known,
				orm: detect.orm,
				signals: detect.signals,
			},
			codegraph: { available: true, db_path: dbPathFwd, freshness: fresh },
			ref_sources: anchorSources,
			anchor_verify: verify,
			findings: verifyFindings,
		};
		if (args.outVerify)
			writeFileSync(
				resolve(args.outVerify),
				JSON.stringify(verifyReport, null, 2) + '\n',
			);
		if (args.out)
			writeFileSync(
				resolve(args.out),
				JSON.stringify(verifyReport, null, 2) + '\n',
			);
		if (args.json)
			process.stdout.write(JSON.stringify(verifyReport, null, 2) + '\n');
		else process.stdout.write(renderAnchorVerifyMarkdown(verifyReport) + '\n');
		process.exit(0); // 비차단 — stale-anchor 있어도 gate block ❌.
	}

	// v12.11.0 STEP 3 — module axis 입력: architecture.json(modules[]+dependencies[]) + cross-file edge 전수 열거.
	//   arch.json 부재 = module axis unverified (graceful / buildCoverage 가 note). edges 부재 = undetectable note.
	const arch = (() => {
		const fp = join(delivDir, 'architecture.json');
		return existsSync(fp) ? readJson(fp) : null;
	})();
	let moduleEdgesByKind = null;
	if (args.axes.includes('module')) {
		const modEdges = enumerateEdges(dbPath, MODULE_EDGE_KINDS);
		moduleEdgesByKind = modEdges.available ? modEdges.byKind : null;
	}

	// coverage 엔진 (순수).
	const coverage = buildCoverage({
		routeNodes: enumResult.byKind.route || [],
		methodNodes: enumResult.byKind.method || [],
		refs,
		detect,
		axes: args.axes,
		moduleEdgesByKind,
		arch,
	});
	const findings = toFindings(coverage);

	const report = {
		meta: {
			schema: 'code-coverage-hole.schema.json',
			generated_by: 'codegraph-coverage',
			do_not_edit_manually: true,
			reference_lens: true,
			trust_note:
				'reference-lens / NOT gate-injected. coverage-hole = 비차단(severity low|medium). 결정적 gate inject ❌. 최종 evidence = 실코드 grep.',
			generated_at: new Date().toISOString(),
			severity_ceiling: [...SEVERITY_CEILING],
		},
		target: resolve(args.target || dirname(dirname(dbPath))).replace(
			/\\/g,
			'/',
		),
		active_axes: args.axes,
		stack: {
			language: detect.language,
			backend_known: detect.backend_known,
			orm: detect.orm,
			signals: detect.signals,
		},
		codegraph: {
			available: true,
			db_path: dbPath.replace(/\\/g, '/'),
			freshness: fresh,
		},
		ref_sources: refs.sources,
		coverage,
		findings,
	};

	// v12.10.0 STEP 2 — finding 채널 export (--emit-findings): coverage-hole → finding-system promote-ready 레코드 + handler-set reading-aid.
	//   stdout 을 promote-ready view 로 전환 (STEP 1 coverage report 는 --out 으로 계속 기록 가능). edges 부재 = graceful note.
	if (args.emitFindings) {
		const promote = toPromoteReadyFindings(report);
		const edgeRes = enumerateEdges(dbPath, ['implements', 'extends']);
		const handlerSet = edgeRes.available
			? buildHandlerSet(edgeRes.byKind)
			: {
					channel: 'reading-aid',
					note: `handler-set 미산출 — ${edgeRes.reason} (정직 carry)`,
					implements: [],
					extends: [],
					handler_relevant_count: 0,
				};
		const findingsReport = {
			meta: {
				schema: 'finding-system.schema.json',
				generated_by: 'codegraph-coverage --emit-findings',
				reference_lens: true,
				do_not_edit_manually: true,
				trust_note:
					'promote-ready reference-lens. finding_id 미부여 (사람이 promote 시 F-XXX 배정). 결정적 gate inject ❌. severity low|medium ceiling. discoverer:codegraph.',
				generated_at: report.meta.generated_at,
				severity_ceiling: [...SEVERITY_CEILING],
			},
			target: report.target,
			promote_ready_findings: promote,
			handler_set: handlerSet,
		};
		if (args.outFindings)
			writeFileSync(
				resolve(args.outFindings),
				JSON.stringify(findingsReport, null, 2) + '\n',
			);
		if (args.out)
			writeFileSync(resolve(args.out), JSON.stringify(report, null, 2) + '\n');
		if (args.json)
			process.stdout.write(JSON.stringify(findingsReport, null, 2) + '\n');
		else
			process.stdout.write(
				renderPromoteFindingsMarkdown(promote, handlerSet, report) + '\n',
			);
		process.exit(0);
	}

	if (args.out) {
		writeFileSync(resolve(args.out), JSON.stringify(report, null, 2) + '\n');
	}
	if (args.json) {
		process.stdout.write(JSON.stringify(report, null, 2) + '\n');
	} else {
		process.stdout.write(renderMarkdown(report) + '\n');
	}
	// coverage-hole 은 비차단 — 항상 exit 0 (hole 이 있어도 gate block ❌).
	process.exit(0);
}

main();

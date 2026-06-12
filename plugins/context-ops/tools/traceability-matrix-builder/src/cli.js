#!/usr/bin/env node
import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildMatrix, loadJson } from './builder.js';
import { synthesizeGraph, TIER1_CATALOG } from './graph-synthesizer.js';
// v0.4.0 (BR-split STEP 2) — business-rules 로딩 중앙화 (graph 합성 입력 / STEP 3 single-point).
import { loadBusinessRules } from '../../_shared/load-business-rules.js';

// A2 baseline (DEC-2026-06-01 dogfood F-DF-A2-001) — --commit-hash 미지정 시 현 git HEAD auto-derive.
//   synth-time HEAD = strict_path code_pointer 의 content-drift baseline (graph-synthesizer 가 스탬프 / SLSA 동형).
//   git 부재/비-repo/throw = undefined (graceful / no-simulation: 날조 ❌ / commitHash 없으면 기존 behavior 무변경).
//   ※ cross-package import 회피 — makeGitRunner(code-pointer-validator)와 동일 패턴 inline (methodology 컨벤션).
function gitHeadSha(cwd = process.cwd()) {
	try {
		return (
			execFileSync('git', ['rev-parse', 'HEAD'], {
				cwd,
				encoding: 'utf-8',
				stdio: ['ignore', 'pipe', 'ignore'],
				timeout: 5000,
				windowsHide: true,
			}).trim() || undefined
		);
	} catch {
		return undefined;
	}
}

// operation.md 결정 8 P1 — artifact-graph.json 산출 (23번째 산출물)
// analysis/aspect input 은 directory scan 으로 자동 인식 (well-known filename).
const ANALYSIS_FILENAMES = {
	architecture: 'architecture.json',
	domain: 'domain.json',
	api: 'openapi-extension.json',
	// v11.24.0 Slice 3 — db-schema 파일명 drift fix (multi-candidate / 첫 존재 채택).
	//   canonical 출력명 = schema.json (skill analysis-db-schema-erd + poc-01/02/03/14 + RealWorld).
	//   db-schema.json = poc-16 migration(CHANGELOG v11.2.0) fallback. 양 convention 흡수 = zero-breakage.
	'db-schema': ['schema.json', 'db-schema.json'],
	'formal-spec': 'formal-spec.json',
	'business-rules': 'business-rules.json',
	antipatterns: 'antipatterns.json',
	'ui-ux': 'ui-spec.json',
	'state-map': 'state-map.json',
	'visual-manifest': 'visual-manifest.json',
	'form-validation-spec': 'form-validation-spec.json',
	'type-spec': 'type-spec.json',
	'error-mapping-spec': 'error-mapping-spec.json',
	'characterization-spec': 'characterization-spec.json',
	'sql-inventory': 'sql-inventory.json',
};
const ASPECT_FILENAMES = {
	a11y: 'a11y-spec.json',
	i18n: 'i18n-spec.json',
	'static-security': 'static-security-spec.json',
	'legacy-spectrum': 'legacy-spectrum.json',
};

// v0.41.0 (DEC-2026-06-12-artifact-zone) — canonical 산출물이 output/shared/ (공통) 또는 output/domains/<BC>/ (도메인별) 로
//   이동 가능 → 평면 단일 dir 스캔(구)이 zone 파일을 조용히 누락(R-HIGH-1). 평면 backward-compat 유지하며 zone 후보 보강.
//   nested = characterization-spec/sql-inventory 는 named 서브디렉토리 안에 거주(평면/zone 양쪽).
const NESTED_SUBDIR = {
	'characterization-spec': 'characterization',
	'sql-inventory': 'sql-inventory',
};
function listDomainBcDirs(analysisDir) {
	const domainsDir = join(analysisDir, 'domains');
	if (!existsSync(domainsDir)) return [];
	try {
		return readdirSync(domainsDir, { withFileTypes: true })
			.filter((e) => e.isDirectory())
			.map((e) => e.name);
	} catch {
		return [];
	}
}
// kind+fname → 우선순위 후보 경로 목록 (첫 존재 채택). 평면 → shared/ → domains/<BC>/ 순 + nested 변형.
function analysisCandidatePaths(analysisDir, kind, fname) {
	const sub = NESTED_SUBDIR[kind];
	const bases = [
		analysisDir,
		join(analysisDir, 'shared'),
		...listDomainBcDirs(analysisDir).map((bc) => join(analysisDir, 'domains', bc)),
	];
	const paths = [];
	for (const base of bases) {
		paths.push(join(base, fname));
		if (sub) paths.push(join(base, sub, fname));
	}
	return paths;
}

function parseArgs(argv) {
	const out = { dryRun: false, graph: false, json: false };
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--discovery')
			out.discovery = argv[++i]; // v11.0.0 primary
		else if (a === '--planning')
			out.planning = argv[++i]; // backward-compat alias of --discovery
		else if (a === '--behavior') out.behavior = argv[++i];
		else if (a === '--acceptance') out.acceptance = argv[++i];
		else if (a === '--task-plan')
			out.taskPlan = argv[++i]; // v11.0.0 plan stage
		else if (a === '--operational-task')
			out.operationalTask = argv[++i]; // v11.0.0 OP 보강 (optional)
		else if (a === '--test-spec') out.testSpec = argv[++i];
		else if (a === '--impl-spec') out.implSpec = argv[++i];
		else if (a === '--unit-spec')
			out.unitSpec = argv[++i]; // v0.36.0 TDD/unit 층 (DEC-2026-06-11 / optional / additive)
		else if (a === '--out-dir') out.outDir = argv[++i];
		else if (a === '--dry-run') out.dryRun = true;
		else if (a === '--json')
			out.json = true; // findings-only 모드 (findings-aggregator gate 배선 / coverage_summary stdout JSON / 텍스트·write·graph skip)
		// 신설 (P1 graph) ─────────────────────────────────────────────
		else if (a === '--graph') out.graph = true;
		else if (a === '--analysis-dir') out.analysisDir = argv[++i];
		else if (a === '--aspect-dir') out.aspectDir = argv[++i];
		else if (a === '--previous-graph') out.previousGraph = argv[++i];
		else if (a === '--scope-id') out.scopeId = argv[++i];
		else if (a === '--commit-hash') out.commitHash = argv[++i];
		else if (a === '--repo-root')
			out.repoRoot = argv[++i]; // F-DF-ANCHOR-002 — analysis derive existence-gate base (default cwd)
		// ──────────────────────────────────────────────────────────────
		else if (a === '--help' || a === '-h') {
			console.log(`usage: traceability-matrix-builder --behavior <path> --acceptance <path> \\
            [--discovery <path>] [--task-plan <path>] [--operational-task <path>] \\
            [--test-spec <path>] [--impl-spec <path>] \\
            [--out-dir <dir>] [--dry-run] \\
            [--graph] [--analysis-dir <dir>] [--aspect-dir <dir>] \\
            [--previous-graph <path>] [--scope-id <id>] [--commit-hash <sha>] [--repo-root <dir>]

--graph 옵션: artifact-graph.json 도 함께 산출 (P1 — operation.md 결정 8).
--repo-root: analysis evidence → code_pointers derive (F-DF-ANCHOR-002) 의 존재 확인 base (default cwd).
  analysis-dir / aspect-dir 의 well-known filename 자동 scan (총 ${TIER1_CATALOG.total} Tier-1 artifact).`);
			process.exit(0);
		}
	}
	return out;
}

const args = parseArgs(process.argv);
if (!args.behavior || !args.acceptance) {
	console.error('error: --behavior and --acceptance required');
	process.exit(2);
}
const discoveryArg = args.discovery ?? args.planning; // v11.0.0 discovery 우선 / planning alias
const chain = {
	planning: discoveryArg ? loadJson(discoveryArg) : null,
	behavior: loadJson(args.behavior),
	acceptance: loadJson(args.acceptance),
	taskPlan: args.taskPlan ? loadJson(args.taskPlan) : null,
	testSpec: args.testSpec ? loadJson(args.testSpec) : null,
	implSpec: args.implSpec ? loadJson(args.implSpec) : null,
	unitSpec: args.unitSpec ? loadJson(args.unitSpec) : null,
};
const operationalTaskData = args.operationalTask
	? loadJson(args.operationalTask)
	: null;

const matrix = buildMatrix(chain);

const cs = matrix.coverage_summary;
// --json: findings-only 모드 (findings-aggregator gate 배선용 / 텍스트·파일쓰기·graph skip / coverage_summary 만 stdout JSON).
//   transformTraceabilityMatrix 가 red_count→critical / forward<threshold→medium / yellow→low 로 매핑.
if (args.json) {
	process.stdout.write(
		JSON.stringify({ coverage_summary: cs, cells: matrix.matrix.length }) + '\n',
	);
	process.exit(cs.red_count > 0 || cs.forward_coverage < cs.threshold ? 1 : 0);
}
console.log(
	`[traceability-matrix-builder] ${matrix.matrix.length} cells / forward=${(cs.forward_coverage * 100).toFixed(1)}% / backward=${(cs.backward_coverage * 100).toFixed(1)}%`,
);
console.log(
	`green=${cs.green_count} / yellow=${cs.yellow_count} / red=${cs.red_count}`,
);

if (args.dryRun) {
	process.exit(0);
}

if (args.outDir) {
	writeFileSync(`${args.outDir}/matrix.json`, JSON.stringify(matrix, null, 2));
	console.log(`written: ${args.outDir}/matrix.json`);
}

// --graph: artifact-graph.json 합성 (operation.md 결정 8 P1)
if (args.graph) {
	const analysis = {};
	const analysisPaths = {};
	if (args.analysisDir) {
		for (const [kind, fnameOrList] of Object.entries(ANALYSIS_FILENAMES)) {
			// v11.24.0 — filename 은 string 또는 후보 배열 (db-schema multi-candidate). 첫 존재 채택.
			// v0.41.0 — 각 fname 을 zone-aware 후보경로(평면→shared/→domains/<BC>/ +nested)로 확장. 첫 존재 채택.
			const fnames = Array.isArray(fnameOrList) ? fnameOrList : [fnameOrList];
			let matched = null;
			for (const fname of fnames) {
				for (const p of analysisCandidatePaths(args.analysisDir, kind, fname)) {
					if (existsSync(p)) {
						matched = p;
						break;
					}
				}
				if (matched) break;
			}
			if (matched) {
				// v0.4.0 (BR-split STEP 2): business-rules 는 _shared loader 경유로 정규화 →
				//   graph-synthesizer 의 `.business_rules` accessor 무변경 + STEP 3(index+per-BC)
				//   분할 시 본 cli 무수정(loader 내부만 확장) single-point.
				analysis[kind] =
					kind === 'business-rules'
						? { business_rules: loadBusinessRules(matched) }
						: loadJson(matched);
				analysisPaths[kind] = matched;
			}
		}
	}
	const aspect = {};
	const aspectPaths = {};
	if (args.aspectDir) {
		for (const [kind, fname] of Object.entries(ASPECT_FILENAMES)) {
			const p = join(args.aspectDir, fname);
			if (existsSync(p)) {
				aspect[kind] = loadJson(p);
				aspectPaths[kind] = p;
			}
		}
	}
	const previousGraph = args.previousGraph
		? loadJson(args.previousGraph)
		: null;
	// A2 baseline (DEC-2026-06-01) — 명시 --commit-hash 우선, 없으면 현 git HEAD auto-derive (graceful undefined).
	const commitHash = args.commitHash || gitHeadSha();
	const graph = synthesizeGraph({
		discovery: chain.planning,
		behavior: chain.behavior,
		acceptance: chain.acceptance,
		taskPlan: chain.taskPlan,
		operationalTask: operationalTaskData,
		testSpec: chain.testSpec,
		implSpec: chain.implSpec,
		unitSpec: chain.unitSpec,
		analysis,
		aspect,
		sourcePaths: {
			discovery: discoveryArg,
			behavior: args.behavior,
			acceptance: args.acceptance,
			taskPlan: args.taskPlan,
			operationalTask: args.operationalTask,
			testSpec: args.testSpec,
			implSpec: args.implSpec,
			unitSpec: args.unitSpec,
			analysis: analysisPaths,
			aspect: aspectPaths,
		},
		previousGraph,
		scopeId: args.scopeId,
		commitHash,
		repoRoot: args.repoRoot, // F-DF-ANCHOR-002 — analysis derive existence-gate base
	});
	console.log(
		`[graph-synthesizer] nodes=${graph.stats.node_count} edges=${graph.stats.edge_count} chain=${graph.stats.by_kind.chain} plan=${graph.stats.by_kind.plan} analysis=${graph.stats.by_kind.analysis} aspect=${graph.stats.by_kind.aspect}`,
	);
	console.log(`  by_state: ${JSON.stringify(graph.stats.by_state)}`);
	console.log(`  by_edge_type: ${JSON.stringify(graph.stats.by_edge_type)}`);
	if (args.outDir && !args.dryRun) {
		writeFileSync(
			`${args.outDir}/artifact-graph.json`,
			JSON.stringify(graph, null, 2),
		);
		console.log(`written: ${args.outDir}/artifact-graph.json`);
	}
}

const fail = cs.red_count > 0 || cs.forward_coverage < cs.threshold;
process.exit(fail ? 1 : 0);

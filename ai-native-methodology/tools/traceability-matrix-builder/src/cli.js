#!/usr/bin/env node
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildMatrix, renderMarkdown, renderMermaid, loadJson } from './builder.js';
import { synthesizeGraph, TIER1_CATALOG } from './graph-synthesizer.js';

// ★ A2 baseline (DEC-2026-06-01 dogfood F-DF-A2-001) — --commit-hash 미지정 시 현 git HEAD auto-derive.
//   synth-time HEAD = strict_path code_pointer 의 content-drift baseline (graph-synthesizer 가 스탬프 / SLSA 동형).
//   git 부재/비-repo/throw = undefined (graceful / no-simulation: 날조 ❌ / commitHash 없으면 기존 behavior 무변경).
//   ※ cross-package import 회피 — makeGitRunner(code-pointer-validator)와 동일 패턴 inline (methodology 컨벤션).
function gitHeadSha(cwd = process.cwd()) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000, windowsHide: true,
    }).trim() || undefined;
  } catch {
    return undefined;
  }
}

// ★ operation.md 결정 8 P1 — artifact-graph.json 산출 (23번째 산출물)
// analysis/aspect input 은 directory scan 으로 자동 인식 (well-known filename).
const ANALYSIS_FILENAMES = {
  'architecture': 'architecture.json',
  'domain': 'domain.json',
  'api': 'openapi-extension.json',
  'db-schema': 'db-schema.json',
  'formal-spec': 'formal-spec.json',
  'business-rules': 'business-rules.json',
  'antipatterns': 'antipatterns.json',
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
  'a11y': 'a11y-spec.json',
  'i18n': 'i18n-spec.json',
  'static-security': 'static-security-spec.json',
  'legacy-spectrum': 'legacy-spectrum.json',
};

function parseArgs(argv) {
  const out = { dryRun: false, graph: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--discovery') out.discovery = argv[++i];        // ★ v11.0.0 primary
    else if (a === '--planning') out.planning = argv[++i];     // ★ backward-compat alias of --discovery
    else if (a === '--behavior') out.behavior = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--task-plan') out.taskPlan = argv[++i];    // ★ v11.0.0 plan stage
    else if (a === '--operational-task') out.operationalTask = argv[++i]; // ★ v11.0.0 OP 보강 (optional)
    else if (a === '--test-spec') out.testSpec = argv[++i];
    else if (a === '--impl-spec') out.implSpec = argv[++i];
    else if (a === '--out-dir') out.outDir = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    // ★ 신설 (P1 graph) ─────────────────────────────────────────────
    else if (a === '--graph') out.graph = true;
    else if (a === '--analysis-dir') out.analysisDir = argv[++i];
    else if (a === '--aspect-dir') out.aspectDir = argv[++i];
    else if (a === '--previous-graph') out.previousGraph = argv[++i];
    else if (a === '--scope-id') out.scopeId = argv[++i];
    else if (a === '--commit-hash') out.commitHash = argv[++i];
    else if (a === '--repo-root') out.repoRoot = argv[++i]; // ★ F-DF-ANCHOR-002 — analysis derive existence-gate base (default cwd)
    // ──────────────────────────────────────────────────────────────
    else if (a === '--help' || a === '-h') {
      console.log(`usage: traceability-matrix-builder --behavior <path> --acceptance <path> \\
            [--discovery <path>] [--task-plan <path>] [--operational-task <path>] \\
            [--test-spec <path>] [--impl-spec <path>] \\
            [--out-dir <dir>] [--dry-run] \\
            [--graph] [--analysis-dir <dir>] [--aspect-dir <dir>] \\
            [--previous-graph <path>] [--scope-id <id>] [--commit-hash <sha>] [--repo-root <dir>]

★ --graph 옵션: artifact-graph.json 도 함께 산출 (P1 — operation.md 결정 8).
★ --repo-root: analysis evidence → code_pointers derive (F-DF-ANCHOR-002) 의 존재 확인 base (default cwd).
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
const discoveryArg = args.discovery ?? args.planning; // ★ v11.0.0 discovery 우선 / planning alias
const chain = {
  planning: discoveryArg ? loadJson(discoveryArg) : null,
  behavior: loadJson(args.behavior),
  acceptance: loadJson(args.acceptance),
  taskPlan: args.taskPlan ? loadJson(args.taskPlan) : null,
  testSpec: args.testSpec ? loadJson(args.testSpec) : null,
  implSpec: args.implSpec ? loadJson(args.implSpec) : null,
};
const operationalTaskData = args.operationalTask ? loadJson(args.operationalTask) : null;

const matrix = buildMatrix(chain);
const md = renderMarkdown(matrix);
const mermaid = renderMermaid(matrix);

const cs = matrix.coverage_summary;
console.log(`[traceability-matrix-builder] ${matrix.matrix.length} cells / forward=${(cs.forward_coverage * 100).toFixed(1)}% / backward=${(cs.backward_coverage * 100).toFixed(1)}%`);
console.log(`green=${cs.green_count} / yellow=${cs.yellow_count} / red=${cs.red_count}`);

if (args.dryRun) {
  process.exit(0);
}

if (args.outDir) {
  writeFileSync(`${args.outDir}/matrix.json`, JSON.stringify(matrix, null, 2));
  writeFileSync(`${args.outDir}/matrix.md`, md);
  writeFileSync(`${args.outDir}/matrix.mermaid`, mermaid);
  console.log(`written: ${args.outDir}/matrix.{json,md,mermaid}`);
}

// ★ --graph: artifact-graph.json 합성 (operation.md 결정 8 P1)
if (args.graph) {
  const analysis = {};
  const analysisPaths = {};
  if (args.analysisDir) {
    for (const [kind, fname] of Object.entries(ANALYSIS_FILENAMES)) {
      const p = join(args.analysisDir, fname);
      if (existsSync(p)) {
        analysis[kind] = loadJson(p);
        analysisPaths[kind] = p;
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
  const previousGraph = args.previousGraph ? loadJson(args.previousGraph) : null;
  // ★ A2 baseline (DEC-2026-06-01) — 명시 --commit-hash 우선, 없으면 현 git HEAD auto-derive (graceful undefined).
  const commitHash = args.commitHash || gitHeadSha();
  const graph = synthesizeGraph({
    discovery: chain.planning, behavior: chain.behavior, acceptance: chain.acceptance,
    taskPlan: chain.taskPlan, operationalTask: operationalTaskData,
    testSpec: chain.testSpec, implSpec: chain.implSpec,
    analysis, aspect,
    sourcePaths: {
      discovery: discoveryArg, behavior: args.behavior, acceptance: args.acceptance,
      taskPlan: args.taskPlan, operationalTask: args.operationalTask,
      testSpec: args.testSpec, implSpec: args.implSpec,
      analysis: analysisPaths, aspect: aspectPaths,
    },
    previousGraph,
    scopeId: args.scopeId,
    commitHash,
    repoRoot: args.repoRoot, // ★ F-DF-ANCHOR-002 — analysis derive existence-gate base
  });
  console.log(`[graph-synthesizer] nodes=${graph.stats.node_count} edges=${graph.stats.edge_count} chain=${graph.stats.by_kind.chain} plan=${graph.stats.by_kind.plan} analysis=${graph.stats.by_kind.analysis} aspect=${graph.stats.by_kind.aspect}`);
  console.log(`  by_state: ${JSON.stringify(graph.stats.by_state)}`);
  console.log(`  by_edge_type: ${JSON.stringify(graph.stats.by_edge_type)}`);
  if (args.outDir && !args.dryRun) {
    writeFileSync(`${args.outDir}/artifact-graph.json`, JSON.stringify(graph, null, 2));
    console.log(`written: ${args.outDir}/artifact-graph.json`);
  }
}

const fail = cs.red_count > 0 || cs.forward_coverage < cs.threshold;
process.exit(fail ? 1 : 0);

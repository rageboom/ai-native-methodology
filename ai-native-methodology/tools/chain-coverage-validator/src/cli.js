#!/usr/bin/env node
// chain-coverage-validator CLI
// $comment exit codes (cli.js authoritative): 0=ok / 1=findings(blocking) / 2=usage-error
// ★ F-SIM-003 (2026-05-18): --strict-paths flag + --project-root / --repo-root
//   default: warn-mode (broken-path = medium / non-blocking) — F-MB-009 LL-i-55 함정존 회피
//   --strict-paths: broken-path = high / blocking — release-readiness #14 baseline ratchet 진입 후 v+1 default 전환

import { validateChainCoverage, validateCrossRefPaths, validateAntipatternCoverage, validateRisksForm, loadJson } from './validator.js';
import { dirname } from 'node:path';

function parseArgs(argv) {
  const out = { dryRun: false, json: false, threshold: 0.85, strictPaths: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--planning') out.planning = argv[++i];
    else if (a === '--behavior') out.behavior = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--antipatterns') out.antipatterns = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--strict-paths') out.strictPaths = true;
    else if (a === '--project-root') out.projectRoot = argv[++i];
    else if (a === '--repo-root') out.repoRoot = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(`usage: chain-coverage-validator --planning <path> --behavior <path> --acceptance <path>
                              [--threshold 0.85] [--dry-run] [--json]
                              [--strict-paths] [--project-root <dir>] [--repo-root <dir>]

★ F-SIM-003 (2026-05-18):
  --strict-paths : cross-ref broken-path = high (blocking). default = warn (medium / non-blocking).
  --project-root : project base for relative path resolution (default = dirname of --behavior).
  --repo-root    : repo base for repo-absolute (examples/...) paths (default = process.cwd()).`);
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
const planning = args.planning ? loadJson(args.planning) : null;
const behavior = loadJson(args.behavior);
const acceptance = loadJson(args.acceptance);
const antipatterns = args.antipatterns ? loadJson(args.antipatterns) : null;

const result = validateChainCoverage(planning, behavior, acceptance, args.threshold);

// ★ F-SIM-001: antipattern coverage lane (SonarQube/CodeQL/Snyk industry-aligned)
const apResult = validateAntipatternCoverage({ antipatterns, acceptanceCriteria: acceptance, planning });

// ★ v8.11.0: risks_and_constraints string form (legacy carry) warn lane (Senior REVISE-1)
const risksFormResult = validateRisksForm(planning);

// ★ F-SIM-003: cross-ref path resolve (separate validation pass)
let pathResult = { findings: [], summary: { total_findings: 0, broken_path_count: 0, path_convention_warning_count: 0, strict_mode: args.strictPaths } };
if (args.planning || args.behavior) {
  const projectRoot = args.projectRoot ?? dirname(args.behavior ?? args.planning);
  const repoRoot = args.repoRoot ?? process.cwd();
  pathResult = validateCrossRefPaths({
    planning, behavior,
    projectRoot,
    repoRoot,
    opts: { strict: args.strictPaths }
  });
}

if (args.json) {
  console.log(JSON.stringify({ coverage: result, cross_refs: pathResult, antipattern_coverage: apResult, risks_form: risksFormResult }, null, 2));
} else {
  console.log(`[chain-coverage-validator] ${result.summary.total_findings} coverage findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`coverage UC→BHV: ${(result.coverage.uc_to_bhv * 100).toFixed(1)}% / BHV→AC: ${(result.coverage.bhv_to_ac * 100).toFixed(1)}% (threshold ${args.threshold})`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
  if (pathResult.findings.length > 0) {
    console.log(`[cross-refs] ${pathResult.summary.total_findings} path findings (strict_mode=${pathResult.summary.strict_mode} / broken=${pathResult.summary.broken_path_count} / convention_warn=${pathResult.summary.path_convention_warning_count})`);
    for (const f of pathResult.findings) {
      console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
    }
  }
  if (apResult.summary.ap_input_missing === false) {
    console.log(`[ap-coverage] severe AP=${apResult.summary.severe_ap_count} / uncovered=${apResult.summary.uncovered_severe_count} (F-SIM-001 / industry-aligned SonarQube+CodeQL+Snyk)`);
    for (const f of apResult.findings) {
      console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
    }
  }
  if (risksFormResult.summary.string_count > 0) {
    console.log(`[risks-form] string=${risksFormResult.summary.string_count} / object=${risksFormResult.summary.object_count} / total=${risksFormResult.summary.total_count} (★ v8.11.0 / Senior REVISE-1 legacy carry warn lane)`);
    for (const f of risksFormResult.findings) {
      console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
    }
  }
}

if (args.dryRun) process.exit(0);
// blocking = coverage critical/high OR (strict-paths && broken-path) OR (any critical/high AP uncovered)
const coverageFail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
const pathFail = args.strictPaths && pathResult.findings.some(f => f.kind === 'chain.cross_links.broken_path');
const apFail = apResult.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit((coverageFail || pathFail || apFail) ? 1 : 0);

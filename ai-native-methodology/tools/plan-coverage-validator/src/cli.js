#!/usr/bin/env node
// plan-coverage-validator CLI
// ★ exit code contract (Senior BLOCKER-2 흡수 / Phase 4-1):
//   exit 0 = ok
//   exit 1 = blocking findings (critical / high / NFR allocation 누락 / TASK dependency cycle / coverage_pct < threshold)
//   exit 2 = usage-error (invalid args)
//
// usage:
//   plan-coverage-validator --task-plan <path> --acceptance <path>
//                           [--test-spec <path>] [--threshold 0.85]
//                           [--strict] [--dry-run] [--json]

import {
  validateTaskCoverage,
  validateNfrAllocation,
  validateTaskGranularity,
  validateDependencyCycle,
  validateRiskSeverity,
  loadJson
} from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false, threshold: 0.85, strict: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--task-plan') out.taskPlan = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--test-spec') out.testSpec = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--strict') out.strict = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: plan-coverage-validator --task-plan <path> --acceptance <path>
                               [--test-spec <path>] [--threshold 0.85]
                               [--strict] [--dry-run] [--json]

★ exit code contract (Phase 4-1 Senior BLOCKER-2 흡수):
  exit 0 = ok
  exit 1 = blocking findings (critical / high / NFR allocation 누락 / TASK dependency cycle / coverage_pct < threshold)
  exit 2 = usage-error

검증:
  1. TASK ↔ AC backward link coverage (chain 2 ↔ chain 3)
  2. TASK ↔ TC forward link coverage (chain 3 ↔ chain 4 / optional)
  3. NFR allocation hard gate — high+critical NFR 누락 시 high finding (★ Cluster 2 결단)
  4. TASK granularity — 1~3 AC 묶음 강제 (4+ = warn / --strict 시 high)
  5. Dependency cycle — DAG cycle 검출 (cycle 시 critical)
  6. Risk severity — high+critical risk mitigation/human_review 검증`);
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.taskPlan || !args.acceptance) {
  console.error('error: --task-plan and --acceptance required');
  process.exit(2);
}

const taskPlan = loadJson(args.taskPlan);
const acceptance = loadJson(args.acceptance);
const testSpec = args.testSpec ? loadJson(args.testSpec) : null;

const taskCoverageResult = validateTaskCoverage(taskPlan, acceptance, testSpec, args.threshold);
const nfrResult = validateNfrAllocation(taskPlan);
const granularityResult = validateTaskGranularity(taskPlan, args.strict);
const cycleResult = validateDependencyCycle(taskPlan);
const riskResult = validateRiskSeverity(taskPlan);

const allFindings = [
  ...taskCoverageResult.findings,
  ...nfrResult.findings,
  ...granularityResult.findings,
  ...cycleResult.findings,
  ...riskResult.findings
];

const summary = {
  total_findings: allFindings.length,
  critical: allFindings.filter(f => f.severity === 'critical').length,
  high: allFindings.filter(f => f.severity === 'high').length,
  medium: allFindings.filter(f => f.severity === 'medium').length,
  low: allFindings.filter(f => f.severity === 'low').length
};

if (args.json) {
  console.log(JSON.stringify({
    task_coverage: taskCoverageResult,
    nfr_allocation: nfrResult,
    task_granularity: granularityResult,
    dependency_cycle: cycleResult,
    risk_severity: riskResult,
    summary
  }, null, 2));
} else {
  console.log(`[plan-coverage-validator] ${summary.total_findings} total findings (critical: ${summary.critical} / high: ${summary.high} / medium: ${summary.medium} / low: ${summary.low})`);
  console.log(`coverage AC→TASK: ${(taskCoverageResult.coverage.ac_to_task * 100).toFixed(1)}% / TASK→TC: ${taskCoverageResult.coverage.task_to_tc != null ? (taskCoverageResult.coverage.task_to_tc * 100).toFixed(1) + '%' : 'N/A (no test-spec)'} (threshold ${args.threshold})`);
  for (const f of allFindings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(0);

// blocking = critical OR high (TASK dependency cycle = critical / NFR allocation 누락 = high / coverage < threshold = high)
const blocking = allFindings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(blocking ? 1 : 0);

#!/usr/bin/env node
import { validateChainCoverage, loadJson } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false, threshold: 0.85 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--planning') out.planning = argv[++i];
    else if (a === '--behavior') out.behavior = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: chain-coverage-validator --planning <path> --behavior <path> --acceptance <path> [--threshold 0.85] [--dry-run] [--json]`);
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

const result = validateChainCoverage(planning, behavior, acceptance, args.threshold);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[chain-coverage-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`coverage UC→BHV: ${(result.coverage.uc_to_bhv * 100).toFixed(1)}% / BHV→AC: ${(result.coverage.bhv_to_ac * 100).toFixed(1)}% (threshold ${args.threshold})`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(0);
const fail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(fail ? 1 : 0);

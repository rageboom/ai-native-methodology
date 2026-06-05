#!/usr/bin/env node
import { validateSpecTestLink, loadJson } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false, threshold: 0.85 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--behavior') out.behavior = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--test-spec') out.testSpec = argv[++i];
    else if (a === '--inventory') out.inventory = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: spec-test-link-validator --acceptance <path> --test-spec <path> [--behavior <path>] [--inventory <path>] [--threshold 0.85] [--dry-run] [--json]`);
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.acceptance || !args.testSpec) {
  console.error('error: --acceptance and --test-spec required');
  process.exit(2);
}
const behavior = args.behavior ? loadJson(args.behavior) : null;
const acceptance = loadJson(args.acceptance);
const testSpec = loadJson(args.testSpec);
const inventory = args.inventory ? loadJson(args.inventory) : null;

const result = validateSpecTestLink(behavior, acceptance, testSpec, inventory, args.threshold);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[spec-test-link-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`coverage AC→TC: ${(result.coverage.ac_to_tc * 100).toFixed(1)}% (threshold ${args.threshold})`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(0);
const fail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(fail ? 1 : 0);

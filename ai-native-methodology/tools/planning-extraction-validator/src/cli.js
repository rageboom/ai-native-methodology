#!/usr/bin/env node
// planning-extraction-validator CLI
// usage: planning-extraction-validator --planning <path> --rules <path> --domain <path> [--dry-run] [--json]

import { validatePlanningExtraction, loadJson } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--planning') out.planning = argv[++i];
    else if (a === '--rules') out.rules = argv[++i];
    else if (a === '--domain') out.domain = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: planning-extraction-validator --planning <path> [--rules <path>] [--domain <path>] [--dry-run] [--json]`);
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.planning) {
  console.error('error: --planning required');
  process.exit(2);
}

const planning = loadJson(args.planning);
if (!planning) {
  console.error(`error: planning-spec not found at ${args.planning}`);
  process.exit(2);
}
const analysis = {
  rules: args.rules ? loadJson(args.rules) : null,
  domain: args.domain ? loadJson(args.domain) : null,
};

const result = validatePlanningExtraction(planning, analysis);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[planning-extraction-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high})`);
  console.log(`UC coverage: ${(result.coverage.use_case * 100).toFixed(1)}%`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) {
  process.exit(0);
} else {
  const hasCritical = result.findings.some(f => f.severity === 'critical');
  const hasHighFail = result.findings.some(f => f.severity === 'high');
  process.exit((hasCritical || hasHighFail) ? 1 : 0);
}

#!/usr/bin/env node
// discovery-extraction-validator CLI (v11.0.0 / renamed from planning-extraction-validator)
// usage: discovery-extraction-validator --discovery <path> [--rules <path>] [--domain <path>] [--dry-run] [--json]

import { validateDiscoveryExtraction, loadJson } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--discovery') out.discovery = argv[++i];
    else if (a === '--rules') out.rules = argv[++i];
    else if (a === '--domain') out.domain = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: discovery-extraction-validator --discovery <path> [--rules <path>] [--domain <path>] [--dry-run] [--json]`);
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.discovery) {
  console.error('error: --discovery required');
  process.exit(2);
}

const discovery = loadJson(args.discovery);
if (!discovery) {
  console.error(`error: discovery-spec not found at ${args.discovery}`);
  process.exit(2);
}
const analysis = {
  rules: args.rules ? loadJson(args.rules) : null,
  domain: args.domain ? loadJson(args.domain) : null,
};

const result = validateDiscoveryExtraction(discovery, analysis);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[discovery-extraction-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high})`);
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

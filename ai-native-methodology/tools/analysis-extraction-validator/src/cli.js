#!/usr/bin/env node
// analysis-extraction-validator CLI (v11.0.3)
// usage: analysis-extraction-validator --extract <path> [--threshold <0..1>] [--dry-run] [--json]
//   --extract    figma-extract.json 또는 plan-doc-extract.json (adapter 자동 감지)
//   --threshold  inferred 비율 임계 (default 0.5 / 초과 시 medium finding)
//   --dry-run    finding 출력만 / exit 0
//   --json       결과 JSON 출력

import { validateAnalysisExtraction, loadJson } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--extract') out.extract = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log('usage: analysis-extraction-validator --extract <path> [--threshold <0..1>] [--dry-run] [--json]');
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.extract) {
  console.error('error: --extract required (figma-extract.json or plan-doc-extract.json)');
  process.exit(2);
}

const extract = loadJson(args.extract);
if (!extract) {
  console.error(`error: extract not found at ${args.extract}`);
  process.exit(2);
}

const opts = {};
if (typeof args.threshold === 'number' && !Number.isNaN(args.threshold)) {
  opts.inferredRatioThreshold = args.threshold;
}

const result = validateAnalysisExtraction(extract, opts);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const vr = result.coverage.verbatim_ratio;
  console.log(`[analysis-extraction-validator] adapter=${result.adapter} ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`verbatim ratio: ${vr === null ? 'n/a' : (vr * 100).toFixed(1) + '%'} (provenance ${result.coverage.provenance_present}/${result.coverage.entries_total} / inferred ${result.coverage.inferred})`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) {
  process.exit(0);
} else {
  const hasCritical = result.findings.some(f => f.severity === 'critical');
  const hasHigh = result.findings.some(f => f.severity === 'high');
  process.exit((hasCritical || hasHigh) ? 1 : 0);
}

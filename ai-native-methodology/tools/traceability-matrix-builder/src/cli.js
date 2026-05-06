#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { buildMatrix, renderMarkdown, renderMermaid, loadJson } from './builder.js';

function parseArgs(argv) {
  const out = { dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--planning') out.planning = argv[++i];
    else if (a === '--behavior') out.behavior = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--test-spec') out.testSpec = argv[++i];
    else if (a === '--impl-spec') out.implSpec = argv[++i];
    else if (a === '--out-dir') out.outDir = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: traceability-matrix-builder --behavior <path> --acceptance <path> [--planning <path>] [--test-spec <path>] [--impl-spec <path>] [--out-dir <dir>] [--dry-run]`);
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
const chain = {
  planning: args.planning ? loadJson(args.planning) : null,
  behavior: loadJson(args.behavior),
  acceptance: loadJson(args.acceptance),
  testSpec: args.testSpec ? loadJson(args.testSpec) : null,
  implSpec: args.implSpec ? loadJson(args.implSpec) : null,
};

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

const fail = cs.red_count > 0 || cs.forward_coverage < cs.threshold;
process.exit(fail ? 1 : 0);

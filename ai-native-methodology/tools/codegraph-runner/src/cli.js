#!/usr/bin/env node
// codegraph-runner CLI
//
// ★ analysis 단계 codegraph 의무 실행 (DEC-2026-05-30-codegraph-essential / Semgrep 동급).
//
//   사용:
//     codegraph-runner --target <dir> --output <dir>
//
//   환경 부재 시 CodeGraphEnvironmentMissing → exit 3 ("환경 부재 — codegraph 설치 필요" 정직 신호 / no-simulation).
//   인자 누락 → exit 2 (usage).
//
//   산출물: <output>/code-graph.json (reference-lens / NOT gate-injected) + codegraph.stdout/stderr.log.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runCodeGraph, CodeGraphEnvironmentMissing } from './runner.js';
import { buildManifest } from './manifest.js';

function parseArgs(argv) {
  const opts = { target: null, output: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') opts.target = argv[++i];
    else if (a === '--output') opts.output = argv[++i];
  }
  return opts;
}

function usage() {
  console.error('usage:');
  console.error('  codegraph-runner --target <dir> --output <dir>');
  console.error('  (codegraph 필수 설치: npm i -g @colbymchenry/codegraph — 환경 부재 시 exit 3 / no-simulation)');
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.target || !opts.output) {
    usage();
    process.exit(2);
  }

  mkdirSync(opts.output, { recursive: true });

  let result;
  try {
    result = runCodeGraph({ targetDir: opts.target, outputDir: opts.output });
  } catch (err) {
    if (err instanceof CodeGraphEnvironmentMissing) {
      console.error(`[codegraph-runner] ${err.message}`);
      console.error('[codegraph-runner] ★★★ NO SIMULATION — install codegraph (npm i -g @colbymchenry/codegraph) or delegate to CI environment.');
      process.exit(3);
    }
    throw err;
  }

  const manifest = buildManifest({
    targetPath: opts.target,
    status: result.status,
    evidence: result.evidence,
  });
  const manifestPath = join(opts.output, 'code-graph.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const s = manifest.index_stats;
  console.log(`[codegraph-runner] indexed: files=${s.file_count} nodes=${s.node_count} edges=${s.edge_count} languages=[${s.languages.join(', ')}]`);
  console.log(`[codegraph-runner] evidence_trust=${result.evidence.evidence_trust} duration_ms=${result.evidence.duration_ms}`);
  console.log(`[codegraph-runner] manifest (reference-lens / NOT gate-injected): ${manifestPath}`);
  process.exit(0);
}

main();

#!/usr/bin/env node
// code-pointer-validator CLI — release-readiness #12 게이트.
//
// usage: code-pointer-validator <artifact-graph.json> [options]
//
// exit codes:
//   0 = pass (coverage 100% + 모든 pointer 정상)
//   1 = fail (high/medium severity finding 존재 — strict 모드에서)
//   2 = usage error / 파일 읽기 실패

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateCodePointers } from './validator.js';

function usage(code = 2) {
  console.error([
    'usage: code-pointer-validator <artifact-graph.json> [options]',
    '',
    'options:',
    '  --repo-root <dir>       code_pointer.path 해석 base (default: cwd)',
    '  --strict                missing/path-not-found 를 high severity 로 (blocking)',
    '  --format text|json      출력 형식 (default: text)',
    '  --help / -h             도움말',
    '',
    'exit codes:',
    '  0 = pass',
    '  1 = fail (severity high 또는 strict 모드의 medium)',
    '  2 = usage error',
  ].join('\n'));
  process.exit(code);
}

function parseArgs(argv) {
  const out = { strict: false, format: 'text' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo-root') out.repoRoot = argv[++i];
    else if (a === '--strict') out.strict = true;
    else if (a === '--format') out.format = argv[++i];
    else if (a === '--help' || a === '-h') usage(0);
    else if (!out.graphPath) out.graphPath = a;
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.graphPath) usage(2);

let graph;
try {
  graph = JSON.parse(readFileSync(resolve(args.graphPath), 'utf-8'));
} catch (e) {
  console.error(`[code-pointer-validator] ERROR — ${args.graphPath} 읽기 실패: ${e.message}`);
  process.exit(2);
}

const result = validateCodePointers(graph, {
  repoRoot: args.repoRoot ?? process.cwd(),
  opts: { strict: args.strict },
});

if (args.format === 'json') {
  console.log(JSON.stringify(result, null, 2));
} else {
  const cv = result.coverage;
  const sum = result.summary;
  const status = (sum.high === 0 && (args.strict ? sum.medium === 0 : true)) ? 'PASS' : 'FAIL';
  console.log(`[code-pointer-validator] ${status} — coverage ${(cv.ratio * 100).toFixed(1)}% (covered=${cv.covered} / na=${cv.explicit_na} / missing=${cv.missing}) / pointers=${sum.pointers_checked}`);
  console.log(`  findings: high=${sum.high} medium=${sum.medium} low=${sum.low}`);
  for (const f of result.findings) {
    const tag = f.artifact_id ? `[${f.artifact_id}]` : '';
    console.log(`  ${f.severity.toUpperCase()} ${tag} ${f.kind} — ${f.message}`);
  }
}

const fail = result.summary.high > 0 || (args.strict && result.summary.medium > 0);
process.exit(fail ? 1 : 0);

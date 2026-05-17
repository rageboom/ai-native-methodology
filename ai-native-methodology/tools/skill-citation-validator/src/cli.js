#!/usr/bin/env node
// skill-citation-validator CLI — exit 0 = 0 finding / 1 = stale 인용 검출.
// scope = repo-wide active shipped 표면 (v8.1.1). 사용: skill-citation-validator [--json] [--root <repoRoot>]

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { checkCitations } from './check-citations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(__dirname, '..', '..', '..'); // tools/skill-citation-validator/src → repo root

function parseArgs(argv) {
  const out = { json: false, root: DEFAULT_ROOT };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--root') out.root = resolve(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.error('usage: skill-citation-validator [--json] [--root <repoRoot>]');
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
const result = checkCitations(args.root);

if (args.json) {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
} else {
  process.stdout.write(
    `skill-citation-validator — ${result.scanned_file_count} active doc scanned (repo-wide)\n\n`
  );
  if (result.finding_count === 0) {
    process.stdout.write('✅ 0 stale citation — 내부 인용 정합.\n');
  } else {
    for (const f of result.findings) {
      process.stdout.write(
        `  ❌ ${f.file}:${f.line} [${f.kind}] ${f.ref} — ${f.why}\n`
      );
    }
    process.stdout.write(
      `\n${result.finding_count} stale citation(s) across ${
        new Set(result.findings.map((x) => x.file)).size
      } file(s).\n`
    );
  }
}

process.exit(result.finding_count === 0 ? 0 : 1);

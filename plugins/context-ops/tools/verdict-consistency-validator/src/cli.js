#!/usr/bin/env node
// verdict-consistency-validator CLI — analysis gate#0 등록 validator.
// usage: verdict-consistency-validator --root <analysis-output-dir> [--json]
// stdout(--json): { findings:[{severity,kind,bc,message}], summary:{critical,high,medium,low,info} }
//   findings-aggregator dispatchValidator → transformGeneric (summary 정합) → gate-eval (high>0 = HARD block).
// exit: 0 = critical+high 0 / 1 = critical|high>0 / 2 = usage.

import { resolve } from 'node:path';
import { validateVerdicts } from './validator.js';
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';
import { baseDirForRead } from '../../_shared/ai-context-layout.js';

const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

if (args.includes('--help') || args.includes('-h')) {
  console.log('usage: verdict-consistency-validator --root <analysis-output-dir> [--json]');
  process.exit(2);
}

const rootArg = getArg('--root', null);
const root = rootArg ? resolve(rootArg) : baseDirForRead(process.cwd()); // base/ NEW ↔ output/ OLD
// 기본 advisory(비차단). --enforce 또는 CONTEXT_OPS_VERDICT_ENFORCE=1 일 때만 high 유지 → gate HARD block.
const enforce = args.includes('--enforce') || process.env.CONTEXT_OPS_VERDICT_ENFORCE === '1';
const result = validateVerdicts(root, { enforce });

if (args.includes('--json')) {
  writeStdoutSync(JSON.stringify(result, null, 2));
} else {
  const s = result.summary;
  console.log(`[verdict-consistency-validator] ${result.findings.length} findings (critical:${s.critical} high:${s.high} medium:${s.medium} low:${s.low})`);
  for (const f of result.findings) console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.bc || '-'}: ${f.message}`);
}

process.exit((result.summary.critical + result.summary.high) > 0 ? 1 : 0);

#!/usr/bin/env node
// code-pointer-validator CLI — release-readiness #12 게이트.
//
// usage: code-pointer-validator <artifact-graph.json> [options]
//
// exit codes:
//   0 = pass (coverage 100% + 모든 pointer 정상)
//   1 = fail (high/medium severity finding 존재 — strict 모드에서)
//   2 = usage error / 파일 읽기 실패

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateCodePointers, makeGitRunner, checkGraphFreshness, applyContentDrift } from './validator.js';

function usage(code = 2) {
  console.error([
    'usage: code-pointer-validator <artifact-graph.json> [options]',
    '',
    'options:',
    '  --repo-root <dir>       code_pointer.path 해석 base (default: cwd)',
    '  --strict                missing/path-not-found 를 high severity 로 (blocking)',
    '  --git                   ★ Loop A — git 신호 활성 (A3 relocation→suggested_path / A2 content-drift). opt-in / 비-gating (medium)',
    '  --apply-drift           ★ Loop A / A2-wire — content-drift 노드를 state=drift 로 그래프 파일에 기록 (--git 자동 활성 / 변경 시에만 write)',
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
    else if (a === '--git') out.git = true;
    else if (a === '--apply-drift') { out.applyDrift = true; out.git = true; } // ★ A2-wire (git 자동)
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

const repoRoot = args.repoRoot ?? process.cwd();
const gitRunner = args.git ? makeGitRunner(repoRoot) : undefined;
const result = validateCodePointers(graph, {
  repoRoot,
  opts: { strict: args.strict, ...(gitRunner ? { gitRunner } : {}) },
});

// ★ Loop A / A1 — freshness (git 무관 / 항상 계산, stale 일 때만 노출)
const freshness = checkGraphFreshness(graph, { repoRoot });

// ★ Loop A / A2-wire — content-drift 노드를 state=drift 로 그래프 파일에 기록 (변경 시에만 write).
//   graph-synthesizer 는 재합성 시 drift→active 리셋 (carry-over 설계) → 본 스캔이 drift 재부여 생산자.
let driftApplied = 0;
if (args.applyDrift) {
  const res = applyContentDrift(graph, result.findings);
  driftApplied = res.applied;
  if (driftApplied > 0) {
    writeFileSync(resolve(args.graphPath), JSON.stringify(graph, null, 2) + '\n');
  }
}

if (args.format === 'json') {
  console.log(JSON.stringify({ ...result, freshness }, null, 2));
} else {
  const cv = result.coverage;
  const sum = result.summary;
  const status = (sum.high === 0 && (args.strict ? sum.medium === 0 : true)) ? 'PASS' : 'FAIL';
  console.log(`[code-pointer-validator] ${status} — coverage ${(cv.ratio * 100).toFixed(1)}% (covered=${cv.covered} / na=${cv.explicit_na} / missing=${cv.missing}) / pointers=${sum.pointers_checked}`);
  console.log(`  findings: high=${sum.high} medium=${sum.medium} low=${sum.low}`);
  if (freshness.stale) {
    console.log(`  ⚠ MEDIUM [graph] graph.stale — ${freshness.finding.message}`);
  }
  if (args.applyDrift) {
    console.log(`  [A2-wire] content-drift → state=drift 적용: ${driftApplied} 노드${driftApplied > 0 ? ` (그래프 파일 갱신: ${args.graphPath})` : ' (변경 없음 / write 생략)'}`);
  }
  for (const f of result.findings) {
    const tag = f.artifact_id ? `[${f.artifact_id}]` : '';
    console.log(`  ${f.severity.toUpperCase()} ${tag} ${f.kind} — ${f.message}`);
  }
}

const fail = result.summary.high > 0 || (args.strict && result.summary.medium > 0);
process.exit(fail ? 1 : 0);

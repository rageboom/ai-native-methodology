#!/usr/bin/env node
// br-cross-consistency-validator CLI
// ★ ADR-CHAIN-011 §5.3 / Plan N 정합
// usage:
//   br-cross-consistency-validator --target <path-to-rules.json> [--json] [--strict] [--threshold 0.5]

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateRulesDoc, validateRulesDocStrict, OVERALL_THRESHOLD } from './validator.js';

function parseArgs(argv) {
  const out = { target: null, json: false, strict: false, threshold: 0.5 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') out.target = argv[++i];
    else if (a === '--json') out.json = true;
    else if (a === '--strict') out.strict = true;
    else if (a === '--threshold') out.threshold = Number(argv[++i]);
    else if (a === '--help' || a === '-h') { printUsage(); process.exit(0); }
    else { console.error(`unknown arg: ${a}`); printUsage(); process.exit(3); }
  }
  return out;
}

function printUsage() {
  console.error([
    'usage: br-cross-consistency-validator --target <rules.json> [--json] [--strict] [--threshold <0..1>]',
    '',
    'rules.json BR 안 natural_language ↔ given/when/then 두 표현 cross-consistency 검증 (★ ADR-CHAIN-011).',
    '',
    'options:',
    '  --target     rules.json 파일 경로 (필수)',
    `  --threshold  keyword overlap threshold (default: 0.5 / ADR-CHAIN-011 §5.4 empirical hypothesis 0.85 은 overall)`,
    '  --strict     Layer 2 LLM advisory 활성 (★ 본 session = placeholder / 다음 session 구현)',
    '  --json       JSON 출력 (default: text)',
    '',
    'exit codes: 0=overall_score ≥ threshold, 1=overall_score < threshold (gate fail), 2=critical/high finding, 3=usage error',
  ].join('\n'));
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.target) { console.error('--target 필수'); printUsage(); process.exit(3); }

  const targetPath = resolve(process.cwd(), args.target);
  let doc;
  try {
    doc = JSON.parse(readFileSync(targetPath, 'utf-8'));
  } catch (err) {
    console.error(`[br-cross-consistency-validator] 파일 read 실패: ${err.message}`);
    process.exit(3);
  }

  const result = args.strict
    ? await validateRulesDocStrict(doc, { keywordThreshold: args.threshold })
    : validateRulesDoc(doc, { keywordThreshold: args.threshold });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printText(result, targetPath);
  }

  const hasCriticalOrHigh = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
  if (hasCriticalOrHigh) process.exit(2);
  if (result.summary.gate_status === 'fail') process.exit(1);
  process.exit(0);
}

function printText(result, targetPath) {
  console.log(`\n[br-cross-consistency-validator] target: ${targetPath}`);
  console.log(`  total BRs:           ${result.stats.total}`);
  console.log(`  with natural_language: ${result.stats.with_natural_language}`);
  console.log(`  with given/when/then:  ${result.stats.with_gwt}`);
  console.log(`  with both:           ${result.stats.with_both}`);
  console.log(`  with finding:        ${result.stats.with_finding}`);
  console.log(`  findings total:      ${result.findings.length}`);
  console.log(`  overlap distribution: ${JSON.stringify(result.overlap_distribution)}`);
  console.log(`  deterministic_score: ${result.summary.deterministic_consistency_score}`);
  console.log(`  llm_score:           ${result.summary.llm_consistency_score ?? '(skipped)'}`);
  console.log(`  overall_score:       ${result.summary.overall_score} (threshold ${result.summary.overall_threshold})`);
  console.log(`  gate_status:         ${result.summary.gate_status}`);

  if (result.findings.length > 0) {
    console.log(`\n  findings:`);
    for (const f of result.findings) {
      console.log(`    [${f.severity.toUpperCase()}] ${f.id} ${f.br_id} — ${f.rule}: ${f.message}`);
    }
  }
}

main().catch(err => {
  console.error(`[br-cross-consistency-validator] fatal: ${err.message}`);
  process.exit(3);
});

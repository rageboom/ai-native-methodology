#!/usr/bin/env node
import { validateCharacterization, loadJson } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false, threshold: 0.80, coverageBaseline: null, writeBaseline: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') out.target = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--coverage-baseline') out.coverageBaseline = argv[++i];
    else if (a === '--write-coverage-baseline') out.writeBaseline = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: characterization-coverage-validator --target <dir> [--threshold 0.80]
       [--coverage-baseline <path>] [--write-coverage-baseline] [--dry-run] [--json]

Validates phase characterization output:
  <target>/characterization-spec.json (entry / optional — sub files standalone OK)
  <target>/intent-vs-bug.md (★ ambiguous_carry grep)
  <target>/coverage.json (★ ratchet strategy if/then)
  <target>/snapshots/UC-*.json (★ given/when/then 4 필수 필드 + intent_classification.type enum)

★ v2.1.0 ratchet trend 자동 검증 (C-v2.1.0-5):
  --coverage-baseline <path>          이전 측정 baseline JSON
  --write-coverage-baseline           현재 측정을 baseline 으로 write (legacy 첫 진입 또는 trend pass 후)

  Coverage strategy 'ratchet' + trend_required=true + --coverage-baseline 제공 시
  current coverage_ratio < baseline coverage_ratio 이면 high finding (ratchet trend negative).

Threshold default 0.80 (PIT/Stryker/BullseyeCoverage 산업 표준).
`);
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.target) {
  console.error('error: --target <dir> required');
  process.exit(2);
}

const result = validateCharacterization(args.target, args.threshold, {
  coverageBaselinePath: args.coverageBaseline,
  writeBaseline: args.writeBaseline,
});

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[characterization-coverage-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`snapshots: ${result.summary.snapshot_count} / scenarios: ${result.summary.scenario_count}`);
  console.log(`named_classified_ratio: ${(result.summary.named_classified_ratio * 100).toFixed(1)}% (threshold ${(args.threshold * 100).toFixed(0)}%)`);
  console.log(`coverage strategy: ${result.summary.coverage_strategy} / target: ${result.summary.coverage_target} / actual: ${result.summary.actual_coverage_ratio !== null ? (result.summary.actual_coverage_ratio * 100).toFixed(1) + '%' : 'N/A'}`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(3);
const fail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(fail ? 1 : 0);

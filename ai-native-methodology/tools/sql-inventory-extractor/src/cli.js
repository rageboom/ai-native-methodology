#!/usr/bin/env node
import { validateSqlInventory } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false, thresholdAutoRatio: 0.50 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') out.target = argv[++i];
    else if (a === '--threshold-auto-ratio') out.thresholdAutoRatio = parseFloat(argv[++i]);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: sql-inventory-extractor --target <dir> [--threshold-auto-ratio 0.50] [--dry-run] [--json]

Validates phase 4.8 sql-inventory output:
  <target>/sql-inventory.json (★ entry / 11 컬럼 record + extraction_automation)

검증 (★ ADR-CHAIN-007 phase 4.8 정합):
  - inventory[].sql_id + mapper_xml + business_meaning + dependent_tables + intent_vs_bug_classification + confidence 의무
  - inventory[].statement_type ∈ [PREPARED, CALLABLE, STATEMENT] (★ Agent 1 강 권고 흡수)
  - inventory[].carry_flags ⊂ enum 8종
  - inventory[].confidence ∈ [0.0, 1.0]
  - inventory[].carry_flags 에 external_call_out_of_scope 또는 DBA-read 시 confidence ≤ 0.80 (★ if/then)
  - inventory[].intent_vs_bug_classification 본문에 (intent/bug/ambiguous/self_recognized) 4 분류 키워드 ≥ 1
  - extraction_automation.auto_ratio_external_6 형식 검증 + threshold ≥ 0.50 (default)

Threshold default 0.50 (Opus 4.7 외부 조언 / PoC #06+#07 baseline 66.7% / scale 무관 isomorphic).
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

const result = validateSqlInventory(args.target, args.thresholdAutoRatio);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[sql-inventory-extractor] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`inventory: ${result.summary.inventory_count} records`);
  if (result.summary.auto_ratio_external_6 !== null) {
    console.log(`auto_ratio_external_6: ${(result.summary.auto_ratio_external_6 * 100).toFixed(1)}% (threshold ${(args.thresholdAutoRatio * 100).toFixed(0)}%)`);
  }
  console.log(`statement_type distribution: PREPARED=${result.summary.statement_type_distribution.PREPARED} / CALLABLE=${result.summary.statement_type_distribution.CALLABLE} / STATEMENT=${result.summary.statement_type_distribution.STATEMENT}`);
  console.log(`carry_flags total: ${result.summary.carry_flags_count}`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(3);
const fail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(fail ? 1 : 0);

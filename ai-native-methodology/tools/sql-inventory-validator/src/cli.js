#!/usr/bin/env node
import { validateSqlInventory } from './validator.js';

function parseArgs(argv) {
  const out = {
    dryRun: false,
    json: false,
    thresholdAutoRatio: 0.50,
    coverageBaseline: null,
    writeBaseline: false,
    legacyXmlDir: null,
    legacyMismatchHighThreshold: 0.30,
    legacyMismatchCriticalThreshold: 0.70,
    evidenceDir: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') out.target = argv[++i];
    else if (a === '--threshold-auto-ratio') out.thresholdAutoRatio = parseFloat(argv[++i]);
    else if (a === '--coverage-baseline') out.coverageBaseline = argv[++i];
    else if (a === '--write-coverage-baseline') out.writeBaseline = true;
    else if (a === '--legacy-xml-dir') out.legacyXmlDir = argv[++i];
    else if (a === '--legacy-mismatch-high-threshold') out.legacyMismatchHighThreshold = parseFloat(argv[++i]);
    else if (a === '--legacy-mismatch-critical-threshold') out.legacyMismatchCriticalThreshold = parseFloat(argv[++i]);
    else if (a === '--evidence-dir') out.evidenceDir = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: sql-inventory-validator --target <dir> [--threshold-auto-ratio 0.50]
       [--coverage-baseline <path>] [--write-coverage-baseline]
       [--legacy-xml-dir <dir>] [--legacy-mismatch-high-threshold 0.30] [--legacy-mismatch-critical-threshold 0.70]
       [--evidence-dir <dir>]
       [--dry-run] [--json]

Validates phase sql-inventory output:
  <target>/sql-inventory.json (★ entry / 12 컬럼 record + extraction_automation + patterns_extension_v3 optional)

검증 (ADR-CHAIN-007 phase sql-inventory + ADR-CHAIN-009 + ADR-CHAIN-010 정합):
  - inventory[].sql_id + mapper_xml + business_meaning + dependent_tables + intent_vs_bug_classification + confidence 의무
  - inventory[].statement_type ∈ [PREPARED, CALLABLE, STATEMENT]
  - inventory[].carry_flags ⊂ enum 8종
  - inventory[].confidence ∈ [0.0, 1.0]
  - inventory[].carry_flags 에 external_call_out_of_scope 또는 DBA-read 시 confidence ≤ 0.80 (if/then)
  - inventory[].intent_vs_bug_classification 본문에 (intent/bug/ambiguous/self_recognized) 4 분류 키워드 ≥ 1
  - inventory[].migration_priority (optional) ∈ [P0, P1, P2, P3] (ADR-CHAIN-009)
  - inventory[].dynamic_branch[].tag_type (optional / v2.3.1 / C-v2.2.0-7) ∈ iBATIS 2 + MyBatis 3 + sql:* + other enum
  - extraction_automation.auto_ratio_external_6 형식 검증 + threshold ≥ 0.50 (default)

v2.3.1 PATCH baseline ratchet (C-v2.2.0-2 / characterization-coverage-validator mirror):
  --coverage-baseline <path>          이전 측정 baseline JSON (auto_ratio_external_6 ratchet)
  --write-coverage-baseline           현재 측정을 baseline 으로 write
  current auto_ratio_external_6 < baseline ratio 이면 high finding (ratchet trend negative).

★ v8.7 PATCH — legacy XML cross-check (R15 silent simulation 차단 / F-CYCLE3-005 fix):
  --legacy-xml-dir <dir>                       실 legacy XML (iBATIS/MyBatis mapper) 디렉토리
                                               xmllint XPath \`count(//select | //insert | //update | //delete)\`
                                               합과 inventory_count 정량 cross-check.
  --legacy-mismatch-high-threshold <ratio>     mismatch ≥ N% 시 high finding (default 0.30)
  --legacy-mismatch-critical-threshold <ratio> mismatch ≥ N% 시 critical finding (default 0.70)

  R15 silent enabler 차단 — schema 정합 통과의 sql-inventory.json 이 AI hypothesis 인지 실 legacy grep 결과인지
  외부 도구 (xmllint) 정량 비교로 판별. xmllint 부재 시 medium finding + skip (graceful).

★ v8.7 PATCH — evidence cross-check (R15 silent simulation 차단 / AI 자기 보고 metric 검증):
  --evidence-dir <dir>     실 외부 도구 invocation 의 evidence file (*.jsonl) 디렉토리
                           각 line: { tool, version, args, target, timestamp, duration_ms, exit_code, ... }
                           unique 'tool' field 의 count 와 sql-inventory.json 의 auto_ratio_external_6 N claim cross-check
                           N_evidence < N_claim 시 critical finding (R15 silent simulation 의심).

Threshold default 0.50 (auto-ratio) / 0.30 (mismatch high) / 0.70 (mismatch critical).
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

const result = validateSqlInventory(args.target, args.thresholdAutoRatio, {
  coverageBaselinePath: args.coverageBaseline,
  writeBaseline: args.writeBaseline,
  legacyXmlDir: args.legacyXmlDir,
  legacyMismatchHighThreshold: args.legacyMismatchHighThreshold,
  legacyMismatchCriticalThreshold: args.legacyMismatchCriticalThreshold,
  evidenceDir: args.evidenceDir,
});

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[sql-inventory-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`inventory: ${result.summary.inventory_count} records`);
  if (result.summary.auto_ratio_external_6 !== null) {
    console.log(`auto_ratio_external_6: ${(result.summary.auto_ratio_external_6 * 100).toFixed(1)}% (threshold ${(args.thresholdAutoRatio * 100).toFixed(0)}%)`);
  }
  console.log(`statement_type distribution: PREPARED=${result.summary.statement_type_distribution.PREPARED} / CALLABLE=${result.summary.statement_type_distribution.CALLABLE} / STATEMENT=${result.summary.statement_type_distribution.STATEMENT}`);
  console.log(`carry_flags total: ${result.summary.carry_flags_count}`);
  if (result.summary.legacy_cross_check) {
    const cc = result.summary.legacy_cross_check;
    if (cc.status === 'ok') {
      console.log(`legacy_cross_check: xmllint_total=${cc.xmllint_total} vs inventory_count=${cc.inventory_count} (mismatch ${(cc.mismatch_ratio * 100).toFixed(1)}% / ${cc.files_scanned} .xml files)`);
    } else {
      console.log(`legacy_cross_check: status=${cc.status}`);
    }
  }
  if (result.summary.evidence_cross_check) {
    const ec = result.summary.evidence_cross_check;
    if (ec.status === 'ok') {
      console.log(`evidence_cross_check: tool_count=${ec.evidence_tool_count} vs claim=${ec.claimed_count}/6 (invocations=${ec.total_invocations} / ${ec.files_scanned} *.jsonl / tools=[${ec.unique_tools.join(', ')}])`);
    } else {
      console.log(`evidence_cross_check: status=${ec.status}`);
    }
  }
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(3);
const fail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(fail ? 1 : 0);

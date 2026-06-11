#!/usr/bin/env node
// analysis-extraction-validator CLI (v11.0.3 / +evidence-scan)
// usage: analysis-extraction-validator --extract <path> [--threshold <0..1>] [--dry-run] [--json]
//        analysis-extraction-validator --evidence-scan <analysis-output-dir> --repo-root <dir> [--dry-run] [--json]
//   --extract        figma-extract.json 또는 plan-doc-extract.json (adapter 자동 감지)
//   --threshold      inferred 비율 임계 (default 0.5 / 초과 시 medium finding)
//   --evidence-scan  analysis 산출물 dir 의 {file,line} 증거 인용 실재성 결정론 검사 (F-DOGFOOD-014)
//   --repo-root      evidence-scan 시 상대경로 해석 기준 (분석 대상 repo 루트)
//   --dry-run        finding 출력만 / exit 0
//   --json           결과 JSON 출력

import { validateAnalysisExtraction, validateEvidenceExistence, loadJson } from './validator.js';

function usage() {
  console.log('usage: analysis-extraction-validator --extract <path> [--threshold <0..1>] [--dry-run] [--json]');
  console.log('       analysis-extraction-validator --evidence-scan <analysis-output-dir> --repo-root <dir> [--dry-run] [--json]');
}

function parseArgs(argv) {
  const out = { dryRun: false, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--extract') out.extract = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--evidence-scan') out.evidenceScan = argv[++i];
    else if (a === '--repo-root') out.repoRoot = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    }
  }
  return out;
}

function exitBySeverity(result, dryRun) {
  if (dryRun) process.exit(0);
  const hasCritical = result.findings.some(f => f.severity === 'critical');
  const hasHigh = result.findings.some(f => f.severity === 'high');
  process.exit((hasCritical || hasHigh) ? 1 : 0);
}

const args = parseArgs(process.argv);

// ── evidence-scan 모드 (F-DOGFOOD-014) ──
if (args.evidenceScan) {
  if (!args.repoRoot) {
    console.error('error: --repo-root required with --evidence-scan (상대경로 증거 해석 기준)');
    process.exit(2);
  }
  const result = validateEvidenceExistence(args.evidenceScan, args.repoRoot);
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const c = result.coverage;
    console.log(`[analysis-extraction-validator] evidence-scan: ${c.artifacts_scanned} artifact(s) / refs ${c.refs_total} (ok: ${c.refs_ok}, missing: ${c.refs_missing}, line-range: ${c.refs_line_out_of_range}, absolute: ${c.refs_absolute})`);
    for (const f of result.findings) {
      console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
    }
  }
  exitBySeverity(result, args.dryRun);
}

// ── extract 모드 (기존 figma/plan-doc) ──
if (!args.extract) {
  console.error('error: --extract or --evidence-scan required');
  usage();
  process.exit(2);
}

const extract = loadJson(args.extract);
if (!extract) {
  console.error(`error: extract not found at ${args.extract}`);
  process.exit(2);
}

const opts = {};
if (typeof args.threshold === 'number' && !Number.isNaN(args.threshold)) {
  opts.inferredRatioThreshold = args.threshold;
}

const result = validateAnalysisExtraction(extract, opts);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const vr = result.coverage.verbatim_ratio;
  console.log(`[analysis-extraction-validator] adapter=${result.adapter} ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`verbatim ratio: ${vr === null ? 'n/a' : (vr * 100).toFixed(1) + '%'} (provenance ${result.coverage.provenance_present}/${result.coverage.entries_total} / inferred ${result.coverage.inferred})`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

exitBySeverity(result, args.dryRun);

#!/usr/bin/env node
// analysis-self-consistency-validator CLI (v0.66.0)
// usage:
//   analysis-self-consistency-validator <file-or-dir> [--json] [--dry-run] [--fix]
//     <file-or-dir>  단일 산출물 JSON 또는 analysis output 디렉토리(재귀, findings-*.json 제외)
//     --json         결과 JSON 출력 (파이프 안전)
//     --dry-run      finding 출력만 / exit 0 (gate 비차단)
//     --fix          배열=SSOT 가정 하 count 재계산 in-place (indent 보존). scalar/partition-값/
//                    filtered/custom 만 — 배열 자체 누락은 못 고침(skeptic 담당).
//   exit: 0(정합 또는 dry-run/fix) / 1(high finding = gate fail) / 2(usage·입력 오류)
//
// 결함 클래스: analysis 산출물의 summary/count 가 자기 배열과 drift (DEC-2026-06-13 일반화).
// 스코프 한계: 구조적 count 필드만. prose-embedded 숫자(meta.warnings "SIX"·description "useState 16")는
//             NLP = groundedness skeptic 담당. 본 도구는 그 앞단의 싼 결정론 선제 필터.

import { statSync, readFileSync, writeFileSync } from 'node:fs';
import { validateSelfConsistency, applyFix, loadJson, listAnalysisJson } from './validator.js';
import { detectIndent } from '../../_shared/append-catalog.js';
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';

function usage() {
  console.log('usage: analysis-self-consistency-validator <file-or-dir> [--json] [--dry-run] [--fix]');
}

function parseArgs(argv) {
  const out = { json: false, dryRun: false, fix: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--fix') out.fix = true;
    else if (a === '--help' || a === '-h') { usage(); process.exit(0); }
    else if (!a.startsWith('--') && !out.target) out.target = a;
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.target) { console.error('error: <file-or-dir> required'); usage(); process.exit(2); }

let files;
try {
  files = statSync(args.target).isDirectory() ? listAnalysisJson(args.target) : [args.target];
} catch {
  console.error(`error: target not found: ${args.target}`); process.exit(2);
}

const results = [];
let fixedTotal = 0;
for (const file of files) {
  let obj;
  try { obj = loadJson(file); } catch { continue; } // parse 불가 = schema-validator 소관
  if (obj == null) continue;

  // --fix: 배열=SSOT 재계산 후 indent 보존 write (dry-run 동시 지정 시 미수정)
  if (args.fix && !args.dryRun) {
    const raw = readFileSync(file, 'utf-8');
    const { kind, changed } = applyFix(obj);
    if (kind && changed > 0) {
      writeFileSync(file, JSON.stringify(obj, null, detectIndent(raw)) + (raw.endsWith('\n') ? '\n' : ''));
      fixedTotal += changed;
    }
  }

  const r = validateSelfConsistency(obj);
  if (r.applicable) results.push({ file, kind: r.kind, findings: r.findings, summary: r.summary });
}

const allFindings = results.flatMap((r) => r.findings.map((f) => ({ ...f, file: r.file })));
const summary = {
  artifacts_scanned: results.length,
  total_findings: allFindings.length,
  high: allFindings.filter((f) => f.severity === 'high').length,
  medium: allFindings.filter((f) => f.severity === 'medium').length,
};

if (args.json) {
  writeStdoutSync(JSON.stringify({ summary, results, fixed: fixedTotal }, null, 2));
} else {
  console.log(`[analysis-self-consistency-validator] ${summary.artifacts_scanned} artifact(s) / ${summary.total_findings} finding(s) (high: ${summary.high}, medium: ${summary.medium})${args.fix ? ` / fixed: ${fixedTotal}` : ''}`);
  if (args.fix && fixedTotal > 0) console.log('  ⚠️  --fix: 배열을 SSOT 로 간주해 count 캐시 재계산함. 배열 자체의 누락은 못 고침(groundedness skeptic 담당).');
  for (const r of results) for (const f of r.findings) console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.path}: 선언 ${f.declared} ≠ 실제 ${f.actual} (${r.file})`);
}

if (args.dryRun) process.exit(0);
process.exit(summary.high > 0 ? 1 : 0);

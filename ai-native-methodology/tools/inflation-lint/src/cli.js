#!/usr/bin/env node
/**
 * inflation-lint — v8.8.0 Tier 3.1 (warning-only / chain blocking ❌)
 *
 * cycle-7 sub-agent 산출물의 별표 ★ 다발 + 과장 형용사 ("본격", "영구", "결정적",
 * "release 자격", "영구 입증") 검출. user memory `communication-style-no-star-inflation`
 * 정합 — 답변에 별표 남발 거부 / 정직 설명 의무 / 강조는 진정 중요 fact 한정.
 *
 * scope: markdown text token frequency 만 / report semantics ❌ / chain blocking ❌.
 *
 * 사용:
 *   inflation-lint <file-or-dir> [--star-threshold 5] [--phrase-threshold 3] [--json]
 *
 * exit:
 *   0 — clean 또는 미달
 *   0 — exceeded but warning only (no block)
 *   2 — usage error
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, dirname, basename } from 'node:path';

const DEFAULT_STAR_PER_FILE = 5;     // single file 안 ★ ≥ 5 → warning
const DEFAULT_PHRASE_TOTAL = 3;       // 과장 형용사 total ≥ 3 → warning
const STAR_RUN_LENGTH = 4;            // ★ ★ ★ ★ (4개 연속) → warning per run

const INFLATION_PHRASES = [
  '본격 release 자격',
  '영구 입증',
  '영구 차단',
  '결정적',
  '가장 큰 ROI',
  '본질 가치',
  '본격 입증',
  '본격 적용',
  '정의 fix',
  'gold standard',
  'release 자격 입증',
];

function collectMdFiles(target) {
  const out = [];
  let st;
  try { st = statSync(target); } catch { return out; }
  if (st.isFile() && target.endsWith('.md')) {
    out.push(target);
    return out;
  }
  if (!st.isDirectory()) return out;
  const stack = [target];
  const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = readdirSync(cur); } catch { continue; }
    for (const name of entries) {
      if (name.startsWith('.') || SKIP.has(name)) continue;
      const full = join(cur, name);
      let s;
      try { s = statSync(full); } catch { continue; }
      if (s.isDirectory()) stack.push(full);
      else if (name.endsWith('.md')) out.push(full);
    }
  }
  return out;
}

function lintFile(filePath, opts = {}) {
  const starPerFile = Number.isFinite(opts.starThreshold) ? opts.starThreshold : DEFAULT_STAR_PER_FILE;
  const phraseTotal = Number.isFinite(opts.phraseThreshold) ? opts.phraseThreshold : DEFAULT_PHRASE_TOTAL;

  let content;
  try { content = readFileSync(filePath, 'utf-8'); } catch { return null; }

  const lines = content.split('\n');
  const findings = [];

  // (1) ★ count per file
  const starCount = (content.match(/★/g) || []).length;
  if (starCount >= starPerFile) {
    findings.push({
      kind: 'star_density',
      severity: 'warning',
      file: filePath,
      message: `★ count = ${starCount} (file 당 ≥ ${starPerFile} threshold). user memory \`no-star-inflation\` 정합 위반 후보. 진정 중요 fact 만 ★ 사용 권고.`,
    });
  }

  // (2) ★ ★ ★ ★ (≥ 4 연속) per line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const runRe = /★(?:\s*★){3,}/g;  // 4개 이상 연속
    let m;
    while ((m = runRe.exec(line)) !== null) {
      const runLength = (m[0].match(/★/g) || []).length;
      findings.push({
        kind: 'star_run_long',
        severity: 'warning',
        file: filePath,
        line: i + 1,
        message: `${runLength}개 ★ 연속 — 진정 강조 의도 점검 권고 (≥ ${STAR_RUN_LENGTH} threshold).`,
      });
    }
  }

  // (3) 과장 형용사 phrase count
  const phraseMatches = [];
  for (const phrase of INFLATION_PHRASES) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
      const line = content.slice(0, m.index).split('\n').length;
      phraseMatches.push({ phrase, line });
    }
  }
  if (phraseMatches.length >= phraseTotal) {
    findings.push({
      kind: 'inflation_phrases',
      severity: 'warning',
      file: filePath,
      message: `과장 형용사 ${phraseMatches.length}건 (threshold ${phraseTotal}): ${phraseMatches.slice(0, 5).map(p => `"${p.phrase}":L${p.line}`).join(', ')}${phraseMatches.length > 5 ? ' ...' : ''}. 정직 어조 권고.`,
      phrase_matches: phraseMatches,
    });
  }

  return {
    file: filePath,
    star_count: starCount,
    phrase_count: phraseMatches.length,
    findings,
  };
}

function parseArgs(argv) {
  const out = { target: null, starThreshold: DEFAULT_STAR_PER_FILE, phraseThreshold: DEFAULT_PHRASE_TOTAL, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--star-threshold') out.starThreshold = parseInt(argv[++i], 10);
    else if (a === '--phrase-threshold') out.phraseThreshold = parseInt(argv[++i], 10);
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: inflation-lint <file-or-dir> [--star-threshold ${DEFAULT_STAR_PER_FILE}] [--phrase-threshold ${DEFAULT_PHRASE_TOTAL}] [--json]

v8.8.0 Tier 3.1 — markdown 산출물의 inflation tone 검출 (warning only / chain blocking ❌).

검출:
  - file 당 ★ count ≥ N (default 5)
  - line 당 ★ ★ ★ ★ 연속 ≥ 4
  - 과장 형용사 ("본격 release 자격" / "영구 입증" / "결정적" / "가장 큰 ROI" 등) ≥ M (default 3)

user memory \`communication-style-no-star-inflation\` 정합 — 강조는 진정 중요 fact 한정.
`);
      process.exit(0);
    }
    else if (!out.target) out.target = a;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.target) {
    console.error('inflation-lint: target file or dir required');
    process.exit(2);
  }
  if (!existsSync(args.target)) {
    console.error(`inflation-lint: target not found: ${args.target}`);
    process.exit(2);
  }

  const files = collectMdFiles(args.target);
  if (files.length === 0) {
    if (args.json) console.log(JSON.stringify({ files_scanned: 0, total_findings: 0, findings: [] }));
    else console.log('inflation-lint: no .md files');
    process.exit(0);
  }

  const results = [];
  const allFindings = [];
  for (const f of files) {
    const r = lintFile(f, args);
    if (r) {
      results.push(r);
      allFindings.push(...r.findings);
    }
  }

  if (args.json) {
    console.log(JSON.stringify({
      files_scanned: files.length,
      total_findings: allFindings.length,
      by_kind: {
        star_density: allFindings.filter(f => f.kind === 'star_density').length,
        star_run_long: allFindings.filter(f => f.kind === 'star_run_long').length,
        inflation_phrases: allFindings.filter(f => f.kind === 'inflation_phrases').length,
      },
      findings: allFindings,
    }, null, 2));
  } else {
    console.log(`inflation-lint — ${files.length} .md file(s) scanned`);
    if (allFindings.length === 0) {
      console.log('  ✅ clean');
    } else {
      console.log(`  ⚠️  ${allFindings.length} warning(s) (chain blocking ❌)`);
      const showCap = 20;
      for (const f of allFindings.slice(0, showCap)) {
        const loc = f.line ? `${basename(f.file)}:${f.line}` : basename(f.file);
        console.log(`  [${f.kind}] ${loc}: ${f.message}`);
      }
      if (allFindings.length > showCap) {
        console.log(`  ... (and ${allFindings.length - showCap} more)`);
      }
    }
  }
  process.exit(0);  // warning only / chain blocking ❌
}

main();

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
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';
import { join, extname, dirname, basename } from 'node:path';

const DEFAULT_STAR_PER_FILE = 5;     // single file 안 ★ ≥ 5 → warning
const DEFAULT_PHRASE_TOTAL = 3;       // 과장 형용사 total ≥ 3 → warning
const STAR_RUN_LENGTH = 4;            // ★ ★ ★ ★ (4개 연속) → warning per run
const DEFAULT_ABSOLUTE_TOTAL = 5;     // claim absoluteness 단어 ≥ N → warning (v8.8.2+)
const DEFAULT_EMOJI_PER_FILE = 15;    // ❌ ⚠️ ✅ ❗ ⭐ 합 ≥ N → warning (v8.8.2+)
const DEFAULT_OVEREMPHASIS_TOTAL = 8; // 본질/결단/정직 등 ≥ N → warning (v8.8.2+)

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

// v8.8.2 Tier 3.1 확장 — claim_absoluteness (100% / 절대 / never / always / 완벽)
const ABSOLUTENESS_PATTERNS = [
  /\b100%/g,
  /\b절대\b/g,
  /\b반드시\b/g,
  /\b완벽\b/g,
  /\bnever\s+(fail|wrong|miss)/gi,
  /\balways\s+(pass|correct|right)/gi,
  /\bperfect(ly)?\b/gi,
  /\bguaranteed?\b/gi,
];

// v8.8.2 Tier 3.1 확장 — emoji_density (★ 외 다른 emoji 다발 검출 / status icon 다발)
const EMOJI_CHARS = ['❌', '⚠️', '✅', '❗', '⭐', '🎉', '🔥', '✨', '💯'];

// v8.8.2 Tier 3.1 확장 — korean_overemphasis (자체 응답 dogfood / 본 응답 빈도 큼)
const OVEREMPHASIS_WORDS = [
  '본질',
  '진정',
  '정직',
  '결단',
  '핵심',
  '명확',
  '강조',
  '입증',
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
  const absoluteTotal = Number.isFinite(opts.absoluteThreshold) ? opts.absoluteThreshold : DEFAULT_ABSOLUTE_TOTAL;
  const emojiPerFile = Number.isFinite(opts.emojiThreshold) ? opts.emojiThreshold : DEFAULT_EMOJI_PER_FILE;
  const overemphasisTotal = Number.isFinite(opts.overemphasisThreshold) ? opts.overemphasisThreshold : DEFAULT_OVEREMPHASIS_TOTAL;

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

  // (4) v8.8.2 — claim_absoluteness (100% / 절대 / 완벽 / perfect / never / always)
  let absoluteCount = 0;
  const absoluteMatches = [];
  for (const re of ABSOLUTENESS_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const line = content.slice(0, m.index).split('\n').length;
      absoluteCount += 1;
      absoluteMatches.push({ token: m[0], line });
    }
  }
  if (absoluteCount >= absoluteTotal) {
    findings.push({
      kind: 'claim_absoluteness',
      severity: 'warning',
      file: filePath,
      message: `absoluteness claim ${absoluteCount}건 (threshold ${absoluteTotal}): ${absoluteMatches.slice(0, 5).map(a => `"${a.token}":L${a.line}`).join(', ')}${absoluteMatches.length > 5 ? ' ...' : ''}. 100% / 절대 / 완벽 등 절대화 claim 신중 권고.`,
      absolute_matches: absoluteMatches,
    });
  }

  // (5) v8.8.2 — emoji_density (❌ ⚠️ ✅ ❗ ⭐ 등 status emoji ≥ N)
  let emojiCount = 0;
  for (const ch of EMOJI_CHARS) {
    const re = new RegExp(ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    let m;
    while ((m = re.exec(content)) !== null) emojiCount += 1;
  }
  if (emojiCount >= emojiPerFile) {
    findings.push({
      kind: 'emoji_density',
      severity: 'warning',
      file: filePath,
      message: `status emoji 합 ${emojiCount} (file 당 ≥ ${emojiPerFile} threshold). ❌ ⚠️ ✅ ❗ 등 다발 = signal-to-noise 감소. 진정 강조 / 차이 있는 fact 만 emoji 권고.`,
    });
  }

  // (6) v8.8.2 — korean_overemphasis (본질/진정/정직/결단/핵심 등 ≥ N)
  let overemphasisCount = 0;
  const overemphasisMatches = [];
  for (const word of OVEREMPHASIS_WORDS) {
    const re = new RegExp(`\\b${word}|${word}`, 'g');  // 한글 boundary 없으므로 단순 substring
    let m;
    while ((m = re.exec(content)) !== null) {
      const line = content.slice(0, m.index).split('\n').length;
      overemphasisCount += 1;
      overemphasisMatches.push({ word, line });
    }
  }
  if (overemphasisCount >= overemphasisTotal) {
    findings.push({
      kind: 'korean_overemphasis',
      severity: 'warning',
      file: filePath,
      message: `한국어 overemphasis 어휘 ${overemphasisCount}건 (threshold ${overemphasisTotal}): ${[...new Set(overemphasisMatches.slice(0, 10).map(o => o.word))].join(', ')}. "본질/진정/정직/결단/핵심" 등 강조 어휘 다발 = signal 약화. 진정 중요 fact 한정 권고.`,
      overemphasis_matches: overemphasisMatches,
    });
  }

  return {
    file: filePath,
    star_count: starCount,
    phrase_count: phraseMatches.length,
    absolute_count: absoluteCount,
    emoji_count: emojiCount,
    overemphasis_count: overemphasisCount,
    findings,
  };
}

function parseArgs(argv) {
  const out = {
    target: null,
    starThreshold: DEFAULT_STAR_PER_FILE,
    phraseThreshold: DEFAULT_PHRASE_TOTAL,
    absoluteThreshold: DEFAULT_ABSOLUTE_TOTAL,
    emojiThreshold: DEFAULT_EMOJI_PER_FILE,
    overemphasisThreshold: DEFAULT_OVEREMPHASIS_TOTAL,
    json: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--star-threshold') out.starThreshold = parseInt(argv[++i], 10);
    else if (a === '--phrase-threshold') out.phraseThreshold = parseInt(argv[++i], 10);
    else if (a === '--absolute-threshold') out.absoluteThreshold = parseInt(argv[++i], 10);
    else if (a === '--emoji-threshold') out.emojiThreshold = parseInt(argv[++i], 10);
    else if (a === '--overemphasis-threshold') out.overemphasisThreshold = parseInt(argv[++i], 10);
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: inflation-lint <file-or-dir> [thresholds] [--json]

v8.8.0 + v8.8.2 — markdown 산출물의 inflation tone 검출 (warning only / chain blocking ❌).

검출 (6 rule):
  - file 당 ★ count ≥ ${DEFAULT_STAR_PER_FILE} (star_density / v8.8.0)
  - line 당 ★ ★ ★ ★ 연속 ≥ 4 (star_run_long / v8.8.0)
  - 과장 형용사 list ≥ ${DEFAULT_PHRASE_TOTAL} (inflation_phrases / v8.8.0)
  - absoluteness claim (100% / 절대 / 완벽 / perfect / never / always) ≥ ${DEFAULT_ABSOLUTE_TOTAL} (claim_absoluteness / v8.8.2)
  - status emoji 합 (❌ ⚠️ ✅ ❗ ⭐ 등) ≥ ${DEFAULT_EMOJI_PER_FILE} (emoji_density / v8.8.2)
  - 한국어 overemphasis 어휘 (본질/진정/정직/결단/핵심 등) ≥ ${DEFAULT_OVEREMPHASIS_TOTAL} (korean_overemphasis / v8.8.2)

threshold override:
  --star-threshold N / --phrase-threshold N / --absolute-threshold N / --emoji-threshold N / --overemphasis-threshold N

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
    if (args.json) writeStdoutSync(JSON.stringify({ files_scanned: 0, total_findings: 0, findings: [] }));
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
    writeStdoutSync(JSON.stringify({
      files_scanned: files.length,
      total_findings: allFindings.length,
      by_kind: {
        star_density: allFindings.filter(f => f.kind === 'star_density').length,
        star_run_long: allFindings.filter(f => f.kind === 'star_run_long').length,
        inflation_phrases: allFindings.filter(f => f.kind === 'inflation_phrases').length,
        claim_absoluteness: allFindings.filter(f => f.kind === 'claim_absoluteness').length,
        emoji_density: allFindings.filter(f => f.kind === 'emoji_density').length,
        korean_overemphasis: allFindings.filter(f => f.kind === 'korean_overemphasis').length,
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

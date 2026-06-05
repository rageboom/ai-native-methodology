// mock-detect — v8.8.0 Tier 1.1 (experimental opt-in)
//
// chain 5(implement) GREEN false signal 검출. cycle-7 dogfood 표면화:
//   car.service.ts 가 prisma: unknown + scenarioState module-level counter +
//   hardcoded return fixture 로 vitest pass=44 fail=0 line cov 92.59% 만족시킴.
//   plugin test-impl-pass-validator 가 ok=true → 진정 비즈니스 검증 0 / false signal.
//
// 본 모듈 = impl 소스 코드 안 mock fixture pattern 검출 → mock_implementation_ratio 측정.
// hybrid approach: regex pre-filter + (TS only) ts-morph 정밀 확정.
//
// §8.1 ≥2 PoC corroboration 부재 — v8.8 = experimental opt-in flag.
// enforce 격상 = v8.9+ carry (cycle-8+ 신규 mock PoC 확보 후).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

// heuristic patterns (regex pre-filter / lang-agnostic)
const PATTERNS = {
  // 1. prisma: unknown — Prisma client 부재 marker (cycle-7 car.service.ts:63)
  prisma_unknown: {
    re: /\bprisma\s*:\s*unknown\b|\b(prisma)\s*:\s*any\b/g,
    weight: 5,  // 강한 signal
    label: 'prisma client typed as unknown/any',
  },
  // 2. module-level state counter — scenarioState / callCount
  module_state_counter: {
    re: /^(const|let|var)\s+(\w+(State|Counter|Count|Index|Cache))\s*=\s*[{0]/gm,
    weight: 4,
    label: 'module-level state counter (let/const ...State = ...)',
  },
  // 3. fixture builder — for loop with push hardcoded object
  fixture_builder: {
    re: /for\s*\(\s*(let|var|const)?\s*\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\s*;\s*\w+\+\+\s*\)\s*\{[\s\S]{0,500}?\.push\s*\(\s*\{/g,
    weight: 4,
    label: 'fixture builder (for loop + push hardcoded object)',
  },
  // 4. scenarioState switch — 시나리오 카운터별 분기
  scenario_switch: {
    re: /switch\s*\(\s*\w*Count\w*\s*\)|switch\s*\(\s*\w*scenario\w*\s*\)/gi,
    weight: 4,
    label: 'switch on scenarioCount / scenario state',
  },
  // 5. hardcoded return literal (예: return { id: 'c-...', carNo: '12가...', ... })
  hardcoded_return_literal: {
    re: /return\s*\{\s*[a-zA-Z_$][\w$]*\s*:\s*['"`][^'"`]*['"`]\s*,/g,
    weight: 2,
    label: 'return { key: "literal", ... } hardcoded object',
  },
  // 6. session ID 분기 — if (sessionId === 'fixed-id')
  session_id_branch: {
    re: /if\s*\(\s*\w*[Ii]d\w*\s*===?\s*['"`][a-zA-Z0-9-_]+['"`]\s*\)/g,
    weight: 3,
    label: 'hardcoded session ID branch (if (sessionId === "fixed-id"))',
  },
};

function detectFile(filePath, content) {
  const matches = [];
  let weightedScore = 0;
  let totalLines = content.split('\n').length;

  for (const [key, spec] of Object.entries(PATTERNS)) {
    spec.re.lastIndex = 0;
    let m;
    while ((m = spec.re.exec(content)) !== null) {
      const line = content.slice(0, m.index).split('\n').length;
      matches.push({
        pattern: key,
        label: spec.label,
        file: filePath,
        line,
        excerpt: content.slice(m.index, Math.min(m.index + 100, content.length)).split('\n')[0],
      });
      weightedScore += spec.weight;
    }
  }

  return { matches, weightedScore, totalLines };
}

function collectImplFiles(dir) {
  const out = [];
  const stack = [dir];
  const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.next', 'coverage', '.git']);
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = readdirSync(cur); } catch { continue; }
    for (const name of entries) {
      if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
      const full = join(cur, name);
      let s;
      try { s = statSync(full); } catch { continue; }
      if (s.isDirectory()) {
        stack.push(full);
      } else {
        // .ts / .js / .java / .py (impl, NOT spec/test)
        const ext = extname(name);
        if (['.ts', '.js', '.java', '.py'].includes(ext) &&
            !name.endsWith('.spec.ts') &&
            !name.endsWith('.test.ts') &&
            !name.endsWith('.spec.js') &&
            !name.endsWith('.test.js') &&
            !name.endsWith('Test.java') &&
            !name.endsWith('_test.py')) {
          out.push(full);
        }
      }
    }
  }
  return out;
}

/**
 * detectMockImplementation — 본 모듈의 entry point.
 *
 * 두 metric 동시 emit:
 *   1. score_ratio = weighted_score / total_lines (heuristic intensity)
 *   2. file_ratio  = files_with_mock_indicators / total_files (mock-spread)
 *
 * exceeded = score_ratio ≥ score_threshold OR file_ratio ≥ file_threshold
 *
 * @param {string} implDir — impl 코드 root (예: apps/api/src)
 * @param {object} opts — { threshold (alias = scoreThreshold default 0.40),
 *                          fileThreshold (default 0.50), mode }
 */
export function detectMockImplementation(implDir, opts = {}) {
  const mode = opts.mode ?? 'off';
  if (mode === 'off') {
    return {
      mode: 'off',
      mock_implementation_ratio: null,
      file_mock_ratio: null,
      mock_locations: [],
      files_scanned: 0,
    };
  }

  const scoreThreshold = Number.isFinite(opts.threshold) ? opts.threshold : 0.40;
  const fileThreshold = Number.isFinite(opts.fileThreshold) ? opts.fileThreshold : 0.50;

  const files = collectImplFiles(implDir);
  let totalScore = 0;
  let totalLines = 0;
  let filesWithIndicators = 0;
  const allMatches = [];

  for (const f of files) {
    let content;
    try { content = readFileSync(f, 'utf-8'); } catch { continue; }
    const { matches, weightedScore, totalLines: fileLines } = detectFile(f, content);
    totalScore += weightedScore;
    totalLines += fileLines;
    if (matches.length > 0) filesWithIndicators += 1;
    allMatches.push(...matches);
  }

  const scoreRatio = totalLines > 0 ? totalScore / totalLines : 0;
  const fileRatio = files.length > 0 ? filesWithIndicators / files.length : 0;
  const exceeded = scoreRatio >= scoreThreshold || fileRatio >= fileThreshold;

  return {
    mode,
    mock_implementation_ratio: Math.round(scoreRatio * 10000) / 10000,
    file_mock_ratio: Math.round(fileRatio * 10000) / 10000,
    total_score: totalScore,
    total_lines: totalLines,
    files_with_indicators: filesWithIndicators,
    score_threshold: scoreThreshold,
    file_threshold: fileThreshold,
    threshold: scoreThreshold,  // backward compat
    mock_locations: allMatches.slice(0, 50),
    mock_locations_total: allMatches.length,
    files_scanned: files.length,
    exceeded,
  };
}

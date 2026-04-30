#!/usr/bin/env node
// drift-validator CLI — `npx drift-validator <dir>` 또는 `node src/cli.js <dir>`.
// 디렉토리 내 *.json + 동일 basename *.mermaid 짝을 자동 발견 후 비교.
// 출력: oasdiff-style diff list. exit code: 0 (no breaking) / 1 (breaking found).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname, dirname, relative } from 'node:path';
import { detectDiagramType, normalizeStateMachine, normalizeSequence } from './normalize-mermaid.js';
import { detectArtifactType, normalizeStateMachineJson, normalizeSequenceJson } from './normalize-json.js';
import { compareStateMachine, compareSequence, summarize } from './compare.js';

function findPairs(dir) {
  const pairs = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = readdirSync(cur); } catch { continue; }
    for (const name of entries) {
      const full = join(cur, name);
      let st;
      try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) {
        if (name === 'node_modules' || name.startsWith('.')) continue;
        stack.push(full);
        continue;
      }
      if (extname(name) !== '.json') continue;
      const base = basename(name, '.json');
      const mermaidPath = join(cur, base + '.mermaid');
      try {
        statSync(mermaidPath);
        pairs.push({ jsonPath: full, mermaidPath });
      } catch { /* no pair — skip */ }
    }
  }
  return pairs;
}

function processOne({ jsonPath, mermaidPath }) {
  const jsonText = readFileSync(jsonPath, 'utf-8');
  const mermaidText = readFileSync(mermaidPath, 'utf-8');
  let json;
  try { json = JSON.parse(jsonText); }
  catch (err) { return { jsonPath, mermaidPath, error: `JSON parse error: ${err.message}` }; }

  const jsonType = detectArtifactType(json);
  const mermaidType = detectDiagramType(mermaidText);

  if (jsonType !== mermaidType || jsonType === 'unknown') {
    return {
      jsonPath, mermaidPath,
      diagram_type: { json: jsonType, mermaid: mermaidType },
      error: `diagram type mismatch (json=${jsonType}, mermaid=${mermaidType}) — skipping comparison`,
      diffs: [],
    };
  }

  let jsonNorm, mermaidNorm, diffs;
  if (jsonType === 'state-machine') {
    jsonNorm = normalizeStateMachineJson(json);
    mermaidNorm = normalizeStateMachine(mermaidText);
    diffs = compareStateMachine({ jsonNorm, mermaidNorm, jsonPath, mermaidPath });
  } else if (jsonType === 'sequence') {
    jsonNorm = normalizeSequenceJson(json);
    mermaidNorm = normalizeSequence(mermaidText);
    diffs = compareSequence({ jsonNorm, mermaidNorm });
  } else {
    return { jsonPath, mermaidPath, diagram_type: jsonType, diffs: [], note: 'comparator-not-implemented (e.g., decision-table — use decision-table-validator)' };
  }

  return {
    jsonPath, mermaidPath,
    diagram_type: jsonType,
    summary: summarize(diffs),
    diffs,
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('usage: drift-validator <dir-or-file> [--json]');
    process.exit(2);
  }
  const target = args[0];
  const jsonOut = args.includes('--json');

  let pairs = [];
  let st;
  try { st = statSync(target); } catch { console.error(`path not found: ${target}`); process.exit(2); }

  if (st.isDirectory()) {
    pairs = findPairs(target);
  } else if (st.isFile() && target.endsWith('.json')) {
    const mermaidPath = target.replace(/\.json$/, '.mermaid');
    pairs = [{ jsonPath: target, mermaidPath }];
  } else {
    console.error(`unsupported target: ${target} (need dir or .json)`); process.exit(2);
  }

  const results = pairs.map(processOne);
  const totals = { pairs: results.length, breaking: 0, 'non-breaking': 0, info: 0, errors: 0 };
  for (const r of results) {
    if (r.error) totals.errors++;
    if (r.summary) {
      totals.breaking += r.summary.breaking;
      totals['non-breaking'] += r.summary['non-breaking'];
      totals.info += r.summary.info;
    }
  }

  if (jsonOut) {
    console.log(JSON.stringify({ totals, results }, null, 2));
  } else {
    console.log(`drift-validator — ${results.length} pair(s) compared`);
    console.log(`  breaking: ${totals.breaking}  non-breaking: ${totals['non-breaking']}  info: ${totals.info}  errors: ${totals.errors}`);
    for (const r of results) {
      const rel = relative(process.cwd(), r.jsonPath);
      if (r.error) {
        console.log(`\n[ERR] ${rel}\n      ${r.error}`);
        continue;
      }
      console.log(`\n[${r.diagram_type}] ${rel}`);
      console.log(`  ${r.summary.breaking} breaking / ${r.summary['non-breaking']} non-breaking / ${r.summary.info} info`);
      for (const d of r.diffs.slice(0, 30)) {
        console.log(`  - [${d.severity}] ${d.kind}${d.message ? ' — ' + d.message : ''}`);
      }
      if (r.diffs.length > 30) console.log(`  ... (+${r.diffs.length - 30} more — use --json for full list)`);
    }
  }

  process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0);
}

main();

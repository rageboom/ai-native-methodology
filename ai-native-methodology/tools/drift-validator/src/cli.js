#!/usr/bin/env node
// drift-validator CLI — `npx drift-validator <dir>` 또는 `node src/cli.js <dir>`.
// 디렉토리 내 *.json + 동일 basename *.mermaid 짝을 자동 발견 후 비교.
// 출력: oasdiff-style diff list. exit code: 0 (no breaking) / 1 (breaking found).

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, extname, dirname, relative, resolve } from 'node:path';
import { detectDiagramType, normalizeStateMachine, normalizeSequence } from './normalize-mermaid.js';
import { detectArtifactType, normalizeStateMachineJson, normalizeSequenceJson, normalizeStateMapFe } from './normalize-json.js';
import { compareStateMachine, compareSequence, summarize } from './compare.js';
import { normalizePhaseFlowJson, normalizePhaseFlow } from './normalize-phase-flow.js';
import { comparePhaseFlow } from './compare-phase-flow.js';
import { readBaseline, classifyAgainstBaseline, writeBaseline, ratchetCheck } from './baseline.js';
import { checkPhaseSkills, summarizeLayoutCheck, checkChainStageLayout, summarizeChainLayoutCheck } from './check-phase-skills.js';

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

  // ★ v1.4 Stage 5 Sprint 5-3 Phase A — FE state-map mermaid 는 stateDiagram-v2 로 'state-machine' detect / FE 모드는 detection only
  const typesMatch = jsonType === mermaidType
    || (jsonType === 'state-map-fe' && mermaidType === 'state-machine');

  if (!typesMatch || jsonType === 'unknown') {
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
  } else if (jsonType === 'phase-flow') {
    // ★ Sprint 5+ Phase B — phase-flow 비교기 (methodology-spec/workflow/phase-flow.{json,mermaid} 짝)
    jsonNorm = normalizePhaseFlowJson(json);
    mermaidNorm = normalizePhaseFlow(mermaidText);
    diffs = comparePhaseFlow({ jsonNorm, mermaidNorm, jsonPath, mermaidPath });
  } else if (jsonType === 'state-map-fe') {
    // ★ v1.4 Stage 5 Sprint 5-3 Phase A — FE state-map detection (★ F-FE-004 closed)
    // 본격 비교 = v1.5 carry / Stage 5 = detection + machine_count 일치 검사 만
    jsonNorm = normalizeStateMapFe(json);
    mermaidNorm = { type: 'state-map-fe', mermaid_text_length: mermaidText.length };
    diffs = [{
      severity: 'info',
      kind: 'state-map-fe.detection-only',
      json: { machine_count: jsonNorm.machine_count },
      mermaid: { mermaid_present: true },
      message: `FE state-map detected (${jsonNorm.machine_count} machines) — full comparison v1.5 carry / Stage 5 = detection only`
    }];
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

function getArgValue(args, name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1];
}

function findWorkspaceRoot(start) {
  let cur = resolve(start);
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(cur, 'flows/analysis.phase-flow.json'))) return cur;
    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}

function main() {
  const args = process.argv.slice(2);

  // ★ v1.4.4 신설 — manifest ↔ workflow ↔ skills 3-way layout 검증 모드
  if (args.includes('--check-layout')) {
    const targetArg = args.find((a) => !a.startsWith('--')) ?? process.cwd();
    const workspaceRoot = findWorkspaceRoot(targetArg);
    if (!workspaceRoot) {
      console.error(`[--check-layout] could not locate workspace root (flows/analysis.phase-flow.json) from: ${targetArg}`);
      process.exit(2);
    }
    const result = checkPhaseSkills(workspaceRoot);
    const jsonOut = args.includes('--json');
    if (jsonOut) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(summarizeLayoutCheck(result));
      for (const d of result.diffs) {
        console.log(`  - [${d.severity}] ${d.kind} — ${d.message}`);
      }
    }
    process.exit(result.ok ? 0 : 1);
  }

  // ★ ★ v2.0 sub-plan-4 신설 — chain stage layout 검증 모드
  if (args.includes('--check-chain-layout')) {
    const targetArg = args.find((a) => !a.startsWith('--')) ?? process.cwd();
    const workspaceRoot = findWorkspaceRoot(targetArg);
    if (!workspaceRoot) {
      console.error(`[--check-chain-layout] could not locate workspace root from: ${targetArg}`);
      process.exit(2);
    }
    const result = checkChainStageLayout(workspaceRoot);
    const jsonOut = args.includes('--json');
    if (jsonOut) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(summarizeChainLayoutCheck(result));
      for (const d of result.diffs) {
        console.log(`  - [${d.severity}] ${d.kind} — ${d.message}`);
      }
    }
    process.exit(result.ok ? 0 : 1);
  }

  if (args.length === 0) {
    console.error('usage: drift-validator <dir-or-file> [--json] [--baseline <path>] [--ratchet] [--write-baseline <path>]');
    console.error('       drift-validator --check-layout [<workspace-root>] [--json]   ★ v1.4.4 — manifest ↔ workflow ↔ skills 3-way layout 검증');
    console.error('       drift-validator --check-chain-layout [<workspace-root>] [--json]   ★ ★ v2.0 sub-plan-4 — chain stage layout 검증');
    process.exit(2);
  }
  const target = args[0];
  const jsonOut = args.includes('--json');
  const baselinePath = getArgValue(args, '--baseline');
  const ratchet = args.includes('--ratchet');
  const writeBaselinePath = getArgValue(args, '--write-baseline');

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
  let allDiffs = [];
  for (const r of results) {
    if (r.error) totals.errors++;
    if (r.summary) {
      totals.breaking += r.summary.breaking;
      totals['non-breaking'] += r.summary['non-breaking'];
      totals.info += r.summary.info;
    }
    if (Array.isArray(r.diffs)) allDiffs.push(...r.diffs);
  }

  // ★ ADR-010 baseline + ratchet 처리
  let baselineReport = null;
  if (writeBaselinePath) {
    writeBaseline(writeBaselinePath, allDiffs);
    if (!jsonOut) console.log(`\n★ baseline written → ${writeBaselinePath} (${allDiffs.length} findings)`);
  }
  if (baselinePath) {
    const baseline = readBaseline(baselinePath);
    const classified = classifyAgainstBaseline(allDiffs, baseline);
    if (ratchet) {
      const check = ratchetCheck(classified);
      baselineReport = { mode: 'ratchet', baseline_path: baselinePath, ...check };
      if (!jsonOut) {
        console.log(`\n★ baseline + ratchet — grandfathered: ${check.grandfathered_count} / novel: ${check.novel_count} / blocked: ${check.blocked_count}`);
        if (check.blocked_count > 0) {
          console.log('  ★ blocked findings:');
          for (const f of check.blocked.slice(0, 10)) {
            console.log(`    - [${f.severity}] ${f.kind}${f.message ? ' — ' + f.message.slice(0, 80) : ''}`);
          }
        }
      }
    } else {
      baselineReport = { mode: 'classify', baseline_path: baselinePath, grandfathered_count: classified.grandfathered.length, novel_count: classified.novel.length };
    }
  }

  if (jsonOut) {
    console.log(JSON.stringify({ totals, results, baselineReport }, null, 2));
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

  // ★ ratchet mode 시 exit code = blocked > 0 ? 1 : 0
  if (ratchet && baselineReport) {
    process.exit(baselineReport.blocked_count > 0 ? 1 : 0);
  }
  process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0);
}

main();

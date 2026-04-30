#!/usr/bin/env node
// formal-spec-link-validator CLI
// 사용: node src/cli.js <api-extension.json | antipatterns.json | dir>
//        --json (JSON 출력)
//
// 검증: formal_spec_links 의 모든 link 가 실제 파일 존재 + br_id pattern 정합

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import { checkLinks, summarize } from './check-links.js';

function findTargets(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      // 재귀
      out.push(...findTargets(full));
      continue;
    }
    // api-extension.json + antipatterns.json
    if (name === 'api-extension.json' || name === 'antipatterns.json') {
      out.push(full);
    }
  }
  return out;
}

function processOne(path) {
  const text = readFileSync(path, 'utf-8');
  let json;
  try { json = JSON.parse(text); }
  catch (e) { return { file: path, error: `JSON parse error: ${e.message}`, findings: [] }; }

  const baseDir = dirname(path);
  const fileType = basename(path) === 'api-extension.json' ? 'api' : 'antipattern';
  const items = fileType === 'api' ? (json.operations ?? []) : (json.antipatterns ?? []);
  const allFindings = [];
  let linkedItemCount = 0;

  for (const item of items) {
    if (!item.formal_spec_links) continue;
    linkedItemCount++;
    const fs = checkLinks({ source: { type: fileType, file: path, item }, baseDir });
    for (const f of fs) allFindings.push(f);
  }

  return {
    file: path,
    file_type: fileType,
    items_count: items.length,
    linked_items_count: linkedItemCount,
    cross_link_coverage: items.length > 0 ? Math.round((linkedItemCount / items.length) * 100) : 0,
    findings: allFindings,
    summary: summarize(allFindings),
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('usage: formal-spec-link-validator <file-or-dir> [--json]');
    process.exit(2);
  }
  const target = args[0];
  const jsonOut = args.includes('--json');

  let st;
  try { st = statSync(target); } catch { console.error(`path not found: ${target}`); process.exit(2); }

  let files;
  if (st.isDirectory()) {
    files = findTargets(target);
  } else {
    files = [target];
  }

  const results = files.map(processOne);
  const totals = { files: results.length, breaking: 0, 'non-breaking': 0, info: 0, errors: 0 };
  let totalLinkedItems = 0;
  let totalItems = 0;

  for (const r of results) {
    if (r.error) totals.errors++;
    if (r.summary) {
      totals.breaking += r.summary.breaking;
      totals['non-breaking'] += r.summary['non-breaking'];
      totals.info += r.summary.info;
    }
    totalLinkedItems += r.linked_items_count ?? 0;
    totalItems += r.items_count ?? 0;
  }

  if (jsonOut) {
    console.log(JSON.stringify({ totals, totalItems, totalLinkedItems, results }, null, 2));
  } else {
    console.log(`formal-spec-link-validator — ${results.length} file(s)`);
    console.log(`  cross_link_items: ${totalLinkedItems}/${totalItems} (${totalItems > 0 ? Math.round(totalLinkedItems/totalItems*100) : 0}%)`);
    console.log(`  breaking: ${totals.breaking}  non-breaking: ${totals['non-breaking']}  info: ${totals.info}  errors: ${totals.errors}`);

    for (const r of results) {
      const rel = relative(process.cwd(), r.file);
      if (r.error) {
        console.log(`\n[ERR] ${rel}\n      ${r.error}`);
        continue;
      }
      console.log(`\n[${r.file_type}] ${rel}`);
      console.log(`  ${r.linked_items_count}/${r.items_count} items have formal_spec_links (${r.cross_link_coverage}%)`);
      for (const f of r.findings.slice(0, 30)) {
        console.log(`  - [${f.severity}] ${f.kind}${f.message ? ' — ' + f.message : ''}`);
      }
      if (r.findings.length > 30) console.log(`  ... (+${r.findings.length - 30} more — use --json)`);
    }
  }

  process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0);
}

main();

#!/usr/bin/env node
// static-runner CLI — `npx static-runner --plugin semgrep --target <dir> --output <dir>`.
// 환경 부재 시 PluginEnvironmentMissing throw → exit 3 ("환경 부재 — 사용자 위임" 정직 신호).

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { PLUGINS, PluginEnvironmentMissing, REQUIRED_EVIDENCE } from './runner.js';

function parseArgs(argv) {
  const opts = { plugins: [], target: null, output: null, ruleset: null, extra: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--plugin') opts.plugins.push(argv[++i]);
    else if (a === '--target') opts.target = argv[++i];
    else if (a === '--output') opts.output = argv[++i];
    else if (a === '--ruleset') opts.ruleset = argv[++i];
    else if (a === '--') opts.extra = argv.slice(i + 1).join(' ').split(' ').filter(Boolean);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.target || !opts.output || opts.plugins.length === 0) {
    console.error('usage: static-runner --plugin <semgrep|pmd> --target <dir> --output <dir> [--ruleset <id>] [-- <extra args>]');
    process.exit(2);
  }

  mkdirSync(opts.output, { recursive: true });

  const summary = { plugins: [], environment_missing: [], runs: [] };
  for (const pname of opts.plugins) {
    const plugin = PLUGINS[pname];
    if (!plugin) {
      console.error(`[static-runner] unknown plugin: ${pname}`);
      process.exit(2);
    }
    try {
      plugin.preflight();
    } catch (err) {
      if (err instanceof PluginEnvironmentMissing) {
        console.error(`[static-runner] ${err.message}`);
        console.error(`[static-runner] ★★★ NO SIMULATION — install ${pname} or delegate to CI environment.`);
        summary.environment_missing.push({ plugin: pname, detail: err.detail, ts: new Date().toISOString() });
        continue;
      }
      throw err;
    }

    const run = plugin.run({
      targetDir: opts.target,
      outputDir: opts.output,
      ruleset: opts.ruleset,
      extraArgs: opts.extra,
    });
    summary.runs.push(run);
  }

  // _manifest.yml 호환 evidence record 작성
  const manifestPath = join(opts.output, 'static-runner.evidence.json');
  writeFileSync(manifestPath, JSON.stringify({
    cross_validation: {
      real_tool: summary.runs.length > 0,
      simulation_only: summary.runs.length === 0,
      runs: summary.runs.map((r) => ({
        plugin: r.plugin,
        exit_code: r.exitCode,
        sarif_path: r.sarifPath,
        evidence: r.evidence,
      })),
      environment_missing: summary.environment_missing,
    },
  }, null, 2));

  console.log(`[static-runner] runs: ${summary.runs.length}, env-missing: ${summary.environment_missing.length}`);
  console.log(`[static-runner] manifest: ${manifestPath}`);

  if (summary.runs.length === 0 && summary.environment_missing.length > 0) {
    console.log('[static-runner] ★★★ all requested plugins missing environment — simulation_only=true. fail per no-sim policy.');
    process.exit(3);
  }

  process.exit(0);
}

main();

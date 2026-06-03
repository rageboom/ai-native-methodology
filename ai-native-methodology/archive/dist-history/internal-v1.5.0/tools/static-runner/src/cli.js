#!/usr/bin/env node
// static-runner CLI — `npx static-runner --plugin semgrep --target <dir> --output <dir>`.
// 환경 부재 시 PluginEnvironmentMissing throw → exit 3 ("환경 부재 — 사용자 위임" 정직 신호).

import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import {
	PLUGINS,
	PluginEnvironmentMissing,
	REQUIRED_EVIDENCE,
} from './runner.js';
import { readSarifFindings } from './sarif-to-finding.js';
import {
	readBaseline,
	classifyAgainstBaseline,
	writeBaseline,
	ratchetCheck,
} from '../../_shared/baseline.js';

function detectGitSha(targetDir) {
	try {
		return execFileSync('git', ['rev-parse', 'HEAD'], {
			cwd: targetDir,
			encoding: 'utf-8',
			timeout: 5000,
		}).trim();
	} catch {
		return 'unknown';
	}
}

function parseArgs(argv) {
	const opts = {
		plugins: [],
		target: null,
		output: null,
		ruleset: null,
		extraRules: [],
		extra: [],
		baseline: null,
		ratchet: false,
		writeBaseline: null,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--plugin') opts.plugins.push(argv[++i]);
		else if (a === '--target') opts.target = argv[++i];
		else if (a === '--output') opts.output = argv[++i];
		else if (a === '--ruleset') opts.ruleset = argv[++i];
		else if (a === '--extra-rules') opts.extraRules.push(argv[++i]);
		else if (a === '--baseline') opts.baseline = argv[++i];
		else if (a === '--ratchet') opts.ratchet = true;
		else if (a === '--write-baseline') opts.writeBaseline = argv[++i];
		else if (a === '--')
			opts.extra = argv
				.slice(i + 1)
				.join(' ')
				.split(' ')
				.filter(Boolean);
	}
	return opts;
}

function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (!opts.target || !opts.output || opts.plugins.length === 0) {
		console.error(
			'usage: static-runner --plugin <semgrep|pmd> --target <dir> --output <dir> [--ruleset <id>] [--extra-rules <path>]... [--baseline <path>] [--ratchet] [--write-baseline <path>] [-- <extra args>]',
		);
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
				console.error(
					`[static-runner] NO SIMULATION — install ${pname} or delegate to CI environment.`,
				);
				summary.environment_missing.push({
					plugin: pname,
					detail: err.detail,
					ts: new Date().toISOString(),
				});
				continue;
			}
			throw err;
		}

		const run = plugin.run({
			targetDir: opts.target,
			outputDir: opts.output,
			ruleset: opts.ruleset,
			extraRules: opts.extraRules,
			extraArgs: opts.extra,
		});
		summary.runs.push(run);
	}

	// Sprint 5+ Phase D — SARIF → finding 어댑터 + ADR-010 baseline + ratchet 처리.
	const allFindings = [];
	for (const r of summary.runs) {
		try {
			const fs = readSarifFindings(r.sarifPath, r.plugin);
			allFindings.push(...fs);
		} catch (err) {
			console.error(
				`[static-runner] SARIF read error for ${r.plugin}: ${err.message}`,
			);
		}
	}

	let baselineReport = null;
	if (opts.writeBaseline) {
		const sha = detectGitSha(opts.target);
		writeBaseline(opts.writeBaseline, allFindings, sha);
		console.log(
			`\nbaseline written → ${opts.writeBaseline} (${allFindings.length} findings, source_commit_sha=${sha.slice(0, 12)})`,
		);
	}
	if (opts.baseline) {
		const baseline = readBaseline(opts.baseline);
		const classified = classifyAgainstBaseline(allFindings, baseline);
		if (opts.ratchet) {
			const check = ratchetCheck(classified);
			baselineReport = {
				mode: 'ratchet',
				baseline_path: opts.baseline,
				...check,
			};
			console.log(
				`\nbaseline + ratchet — grandfathered: ${check.grandfathered_count} / novel: ${check.novel_count} / blocked: ${check.blocked_count}`,
			);
			if (check.blocked_count > 0) {
				console.log('  blocked findings:');
				for (const f of check.blocked.slice(0, 10)) {
					console.log(
						`    - [${f.severity}] ${f.kind} (${f.plugin})${f.file ? ' — ' + f.file + ':' + (f.line ?? '?') : ''}`,
					);
				}
			}
		} else {
			baselineReport = {
				mode: 'classify',
				baseline_path: opts.baseline,
				grandfathered_count: classified.grandfathered.length,
				novel_count: classified.novel.length,
			};
		}
	}

	// _manifest.yml 호환 evidence record 작성
	const manifestPath = join(opts.output, 'static-runner.evidence.json');
	writeFileSync(
		manifestPath,
		JSON.stringify(
			{
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
					findings_count: allFindings.length,
					baseline_report: baselineReport,
				},
			},
			null,
			2,
		),
	);

	console.log(
		`[static-runner] runs: ${summary.runs.length}, env-missing: ${summary.environment_missing.length}, findings: ${allFindings.length}`,
	);
	console.log(`[static-runner] manifest: ${manifestPath}`);

	if (summary.runs.length === 0 && summary.environment_missing.length > 0) {
		console.log(
			'[static-runner] all requested plugins missing environment — simulation_only=true. fail per no-sim policy.',
		);
		process.exit(3);
	}

	// ratchet mode 시 exit code = blocked > 0 ? 1 : 0
	if (opts.ratchet && baselineReport) {
		process.exit(baselineReport.blocked_count > 0 ? 1 : 0);
	}
	process.exit(0);
}

main();

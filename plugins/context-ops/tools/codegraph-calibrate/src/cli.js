#!/usr/bin/env node
// codegraph-calibrate — measure codegraph caller-resolution accuracy on a target, emit PASS/WARN verdict.
//   (DEC-2026-06-15-codegraph-search-token-saving / plan-codegraph-search-token-saving P0.)
//
//   Compares, per sampled symbol: real codegraph `callers <symbol>` ↔ independent identifier-call grep proxy.
//   Verdict = reference-lens {PASS = navigation-authority eligible (P3) / WARN = keep reference-lens}.
//   NEVER a gate (DEC-2026-05-28 §4.2). grep stays the falsification valve regardless.
//
//   no-simulation: real `codegraph` CLI + real source read. codegraph absent / index absent → exit 3 (honest).
//
//   usage:
//     codegraph-calibrate --target <projectDir> [--sample <N=12>] [--precision <0.95>] [--out <file>] [--json]
//   exit: 0 = calibration done (verdict in output, incl. WARN) / 3 = codegraph or index absent, or usage error.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative, extname } from 'node:path';
import { DEFAULT_SOURCE_EXT, extractSymbols, sampleSymbols, calibrate } from './calibrate.js';

const IS_WINDOWS = process.platform === 'win32';
// Align calibration scope to codegraph's index (production code). Test files are excluded by default:
//   they inflate the grep proxy (test call sites codegraph's caller resolution doesn't surface) and the
//   fabrication scan (test helpers / factories) → spurious recall-miss + WARN. The token-saving use case
//   is navigating production code. (Diagnosed on poc-18: WARN was a test-scope artifact, not a CG defect.)
const IGNORE_DIRS = new Set([
	'node_modules', '.git', '.codegraph', 'dist', 'build', 'coverage', '.next', 'out', '.ai-context',
	'test', 'tests', '__tests__', '__mocks__', 'spec', 'e2e', 'fixtures',
]);
const TEST_FILE_RE = /\.(test|spec)\.[cm]?[jt]sx?$/;
const MAX_FILES = 4000;

function usage(msg) {
	if (msg) process.stderr.write(`error: ${msg}\n`);
	process.stderr.write(
		'usage: codegraph-calibrate --target <projectDir> [--sample <N=12>] [--precision <0.95>] [--out <file>] [--json]\n',
	);
	process.exit(3);
}

function parseArgs(argv) {
	const opts = { sample: 12, precision: 0.95, json: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--target') opts.target = argv[++i];
		else if (a === '--sample') opts.sample = parseInt(argv[++i], 10);
		else if (a === '--precision') opts.precision = parseFloat(argv[++i]);
		else if (a === '--out') opts.out = argv[++i];
		else if (a === '--json') opts.json = true;
		else usage(`unknown arg: ${a}`);
	}
	if (!opts.target) usage('--target required');
	if (!Number.isFinite(opts.sample) || opts.sample < 1) usage('--sample must be a positive integer');
	return opts;
}

function commandExists(cmd) {
	const probe = IS_WINDOWS
		? spawnSync('where', [cmd], { stdio: 'ignore', windowsHide: true })
		: spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' });
	return probe.status === 0;
}

// Walk target, collect source files (relative paths) → { relPath: text }.
function collectSource(targetAbs) {
	const out = {};
	let count = 0;
	const walk = (dir) => {
		let ents;
		try {
			ents = readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const ent of ents) {
			if (count >= MAX_FILES) return;
			const full = join(dir, ent.name);
			if (ent.isDirectory()) {
				if (IGNORE_DIRS.has(ent.name) || ent.name.startsWith('.')) continue;
				walk(full);
			} else if (ent.isFile() && DEFAULT_SOURCE_EXT.includes(extname(ent.name)) && !TEST_FILE_RE.test(ent.name)) {
				try {
					out[relative(targetAbs, full)] = readFileSync(full, 'utf-8');
					count++;
				} catch {
					/* skip unreadable */
				}
			}
		}
	};
	walk(targetAbs);
	return { fileContents: out, fileCount: count, truncated: count >= MAX_FILES };
}

// Real codegraph callers query → caller file paths (relative-to-target to match source keys).
function cgCallerFiles(symbol, targetAbs) {
	const res = spawnSync('codegraph', ['callers', symbol, '-p', targetAbs, '-j', '-l', '200'], {
		encoding: 'utf-8',
		timeout: 30_000,
	});
	if (res.status !== 0 || !res.stdout) return [];
	let json;
	try {
		json = JSON.parse(res.stdout);
	} catch {
		return []; // "Symbol not found" or non-JSON → treat as no callers
	}
	const files = (json.callers || []).map((c) => normalizeRel(c.filePath, targetAbs));
	return [...new Set(files)];
}

function normalizeRel(p, targetAbs) {
	if (!p) return p;
	return p.startsWith('/') || /^[A-Za-z]:[\\/]/.test(p) ? relative(targetAbs, p) : p;
}

function main() {
	const opts = parseArgs(process.argv.slice(2));
	const targetAbs = resolve(opts.target);
	if (!existsSync(targetAbs) || !statSync(targetAbs).isDirectory()) usage(`target not a directory: ${opts.target}`);

	// Preflight (no-simulation): real codegraph + real index, else honest exit 3.
	if (!commandExists('codegraph')) {
		process.stderr.write(
			'codegraph not on PATH — install (`npm i -g @colbymchenry/codegraph`) or run via CI. (no-simulation: refusing to estimate.)\n',
		);
		process.exit(3);
	}
	if (!existsSync(join(targetAbs, '.codegraph'))) {
		process.stderr.write(
			`no codegraph index at ${targetAbs}/.codegraph — run \`codegraph init && codegraph index\` first.\n`,
		);
		process.exit(3);
	}

	const { fileContents, fileCount, truncated } = collectSource(targetAbs);
	if (fileCount === 0) usage('no source files found under target');
	if (truncated) process.stderr.write(`[codegraph-calibrate] file cap ${MAX_FILES} hit — sample drawn from first ${MAX_FILES} files (coverage note).\n`);

	const candidates = sampleSymbols(
		Object.values(fileContents).flatMap((t) => extractSymbols(t)),
		opts.sample,
	);
	if (candidates.length === 0) usage('no candidate symbols extracted from source');

	const cgCallersBySymbol = {};
	for (const sym of candidates) cgCallersBySymbol[sym] = cgCallerFiles(sym, targetAbs);

	const report = {
		tool: 'codegraph-calibrate',
		target: targetAbs,
		file_count: fileCount,
		...calibrate({ cgCallersBySymbol, fileContents, symbols: candidates, opts: { precisionThreshold: opts.precision } }),
	};

	const text = JSON.stringify(report, null, 2);
	if (opts.out) writeFileSync(opts.out, text);
	if (opts.json || !opts.out) process.stdout.write(text + '\n');
	else {
		const a = report.aggregate;
		process.stderr.write(
			`[codegraph-calibrate] ${report.verdict} — precision=${a.precision === null ? 'n/a' : a.precision.toFixed(3)} recall=${a.recall === null ? 'n/a' : a.recall.toFixed(3)} measured=${a.measured}/${report.sampled} fabrication_risk=${report.fabrication_scan.risk_count} → ${opts.out}\n`,
		);
	}
	process.exit(0); // reference-lens: WARN is a valid result, not an error.
}

main();

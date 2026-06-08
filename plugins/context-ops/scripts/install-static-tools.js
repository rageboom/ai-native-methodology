#!/usr/bin/env node
// install-static-tools.js — cross-platform idempotent installer for Tier 1 static-analysis tools.
//
// Invoked by SessionStart hook (see hooks/hooks.json) as `node ...install-static-tools.js`.
// Replaces the POSIX-only install-static-tools.sh so the hook runs on Windows too
// (Windows has no `bash` on PATH by default — see DEC packaging fix 2026-06-04).
//
// Contract (unchanged from the .sh):
//   - Always exits 0 — never blocks Claude Code session start.
//   - Writes status to stderr so Claude surfaces it; stdout stays clean.
//   - Idempotent — no-op when semgrep already on PATH (marker file under .aimd-install/).
//
// Scope (matches static-runner tier policy / DEC-2026-06-07-pmd-tier1-promotion):
//   Tier 1 (auto-install attempted):
//     - Semgrep — pip/pipx/brew channel.
//     - PMD     — Java-conditional: when `java` is on PATH, fetch the PMD dist zip
//                 into .aimd-install/ and record its bin dir so the runner discovers it.
//                 JVM itself is NEVER bootstrapped (user-owned) — Java absent ⇒ honest skip.
//   Tier 2 (informational only):     SpotBugs / CodeQL / Bandit / Snyk / OSV-Scanner
//   Tier 2 require JVM/JDK or per-language envs a plugin cannot bootstrap;
//   users keep ownership per DEC-2026-05-18-runtime-tool-exclusion.
//   (no-simulation: every failure path is an honest carry — never LLM-substituted.)

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const IS_WINDOWS = process.platform === 'win32';
const LOG_PREFIX = '[ai-native-methodology/install]';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || resolve(SCRIPT_DIR, '..');
const MARKER_DIR = join(PLUGIN_ROOT, '.aimd-install');
const SEMGREP_MARKER = join(MARKER_DIR, '.semgrep-installed');
const PMD_BIN_MARKER = join(MARKER_DIR, '.pmd-bin-dir'); // runner.js localPmdBinDir() 와 동일 규약
const PMD_DIR = join(MARKER_DIR, 'pmd'); // dist zip 추출 위치
const PMD_FALLBACK_VERSION = '7.0.0'; // GitHub API 도달 불가 시 안전-존재 fallback (2024-03 GA)
const PMD_DOWNLOAD_TIMEOUT_MS = 120_000;

function log(msg) {
	process.stderr.write(`${LOG_PREFIX} ${msg}\n`);
}

// Cross-platform "is this command on PATH?" — `where` on Windows, `command -v` on POSIX.
function commandExists(cmd) {
	const probe = IS_WINDOWS
		? spawnSync('where', [cmd], { stdio: 'ignore', windowsHide: true })
		: spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' });
	return probe.status === 0;
}

// Run an installer command. shell:true on Windows so .cmd/.exe shims resolve.
function runInstaller(cmd, args) {
	const res = spawnSync(cmd, args, {
		stdio: ['ignore', 'inherit', 'inherit'],
		shell: IS_WINDOWS,
		windowsHide: true,
	});
	return res.status === 0;
}

function markInstalled() {
	try {
		mkdirSync(MARKER_DIR, { recursive: true });
		writeFileSync(SEMGREP_MARKER, '');
	} catch {
		// marker is best-effort; failing to write it must not break session start.
	}
}

function ensureSemgrep() {
	if (commandExists('semgrep')) {
		if (!existsSync(SEMGREP_MARKER)) markInstalled();
		return true;
	}

	log('semgrep not found — attempting auto-install (Tier 1)…');

	// Channel order: pipx (PEP 668 safe) → brew (POSIX only) → pip3/pip --user.
	const channels = [];
	if (commandExists('pipx')) {
		channels.push(['pipx', ['install', 'semgrep'], 'pipx']);
	}
	if (!IS_WINDOWS && commandExists('brew')) {
		channels.push(['brew', ['install', 'semgrep'], 'brew']);
	}
	if (commandExists('pip3')) {
		channels.push(['pip3', ['install', '--user', 'semgrep'], 'pip3 --user']);
	} else if (IS_WINDOWS && commandExists('pip')) {
		channels.push(['pip', ['install', '--user', 'semgrep'], 'pip --user']);
	}

	for (const [cmd, args, label] of channels) {
		if (runInstaller(cmd, args)) {
			log(`semgrep installed via ${label}.`);
			if (label.startsWith('pip')) {
				log("Add the pip user-bin dir to PATH if 'semgrep' is not found in new shells.");
			}
			markInstalled();
			return true;
		}
		log(`${label} install failed — trying next channel.`);
	}

	log('ERROR: could not auto-install semgrep. Install manually:');
	log('  pipx install semgrep   # recommended (PEP 668 safe)');
	if (!IS_WINDOWS) log('  brew install semgrep   # macOS Homebrew');
	log('  pip3 install --user semgrep   (Windows: pip install --user semgrep)');
	return false;
}

// PMD bin launcher path for an extracted dist (POSIX `pmd`, Windows `pmd.bat`).
function pmdLauncherIn(binDir) {
	return join(binDir, IS_WINDOWS ? 'pmd.bat' : 'pmd');
}

// Resolve latest PMD 7.x via GitHub releases API; null on any failure (offline / SSL block).
async function resolveLatestPmdVersion() {
	try {
		const ctl = new AbortController();
		const timer = setTimeout(() => ctl.abort(), 15_000);
		const res = await fetch(
			'https://api.github.com/repos/pmd/pmd/releases/latest',
			{ headers: { 'User-Agent': 'aimd-installer' }, signal: ctl.signal },
		);
		clearTimeout(timer);
		if (!res.ok) return null;
		const json = await res.json();
		const m = String(json.tag_name || '').match(/(\d+\.\d+\.\d+)/);
		return m ? m[1] : null;
	} catch {
		return null;
	}
}

async function downloadFile(url, dest) {
	const ctl = new AbortController();
	const timer = setTimeout(() => ctl.abort(), PMD_DOWNLOAD_TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			redirect: 'follow',
			headers: { 'User-Agent': 'aimd-installer' },
			signal: ctl.signal,
		});
		if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
		const buf = Buffer.from(await res.arrayBuffer());
		writeFileSync(dest, buf);
	} finally {
		clearTimeout(timer);
	}
}

// Cross-platform zip extraction without an npm dependency.
//   Windows: tar.exe (Win10+ bsdtar handles .zip) → PowerShell Expand-Archive.
//   POSIX:   unzip → tar.
function extractZip(zipPath, destDir) {
	mkdirSync(destDir, { recursive: true });
	const attempts = IS_WINDOWS
		? [
				['tar', ['-xf', zipPath, '-C', destDir]],
				[
					'powershell',
					[
						'-NoProfile',
						'-Command',
						`Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${destDir}' -Force`,
					],
				],
			]
		: [
				['unzip', ['-q', '-o', zipPath, '-d', destDir]],
				['tar', ['-xf', zipPath, '-C', destDir]],
			];
	for (const [cmd, args] of attempts) {
		const r = spawnSync(cmd, args, {
			stdio: 'ignore',
			shell: IS_WINDOWS,
			windowsHide: true,
		});
		if (r.status === 0) return true;
	}
	throw new Error('no working zip extractor (tried tar / unzip / Expand-Archive)');
}

function recordPmdBinDir(binDir) {
	try {
		mkdirSync(MARKER_DIR, { recursive: true });
		writeFileSync(PMD_BIN_MARKER, binDir);
	} catch {
		// best-effort; failing to write marker must not break session start.
	}
}

// PMD = Tier 1 in-plugin auto-run, Java-conditional auto-install.
//   The plugin never bootstraps a JVM — that stays user-owned (no-simulation).
//   When `java` is present, fetch the PMD dist zip and expose its bin dir to the runner.
async function ensurePmd() {
	if (commandExists('pmd')) return true; // already on PATH — nothing to do.

	// Idempotent: a prior plugin-local install still valid?
	if (existsSync(PMD_BIN_MARKER)) {
		try {
			const dir = readFileSync(PMD_BIN_MARKER, 'utf-8').trim();
			if (dir && existsSync(pmdLauncherIn(dir))) return true;
		} catch {
			/* fall through to re-install */
		}
	}

	if (!commandExists('java')) {
		log('PMD auto-install skipped — Java (JDK/JRE) not on PATH.');
		log('  The plugin does not bootstrap a JVM (user-owned per no-simulation policy).');
		log('  Install JDK 8+ then re-open the session, or import a PMD SARIF (Tier 2).');
		return false;
	}

	log('java detected — attempting PMD auto-install (Tier 1 / DEC-2026-06-07)…');
	try {
		const version = (await resolveLatestPmdVersion()) || PMD_FALLBACK_VERSION;
		const url = `https://github.com/pmd/pmd/releases/download/pmd_releases%2F${version}/pmd-dist-${version}-bin.zip`;
		const zipPath = join(MARKER_DIR, `pmd-dist-${version}.zip`);
		mkdirSync(MARKER_DIR, { recursive: true });
		log(`  downloading PMD ${version}…`);
		await downloadFile(url, zipPath);
		extractZip(zipPath, PMD_DIR);
		const binDir = join(PMD_DIR, `pmd-bin-${version}`, 'bin');
		if (!existsSync(pmdLauncherIn(binDir))) {
			throw new Error(`launcher not found after extract: ${pmdLauncherIn(binDir)}`);
		}
		recordPmdBinDir(binDir);
		log(`PMD ${version} installed to ${binDir} (plugin-local; runner auto-discovers it).`);
		return true;
	} catch (err) {
		log(`PMD auto-install failed (non-fatal): ${err && err.message ? err.message : err}`);
		log('  Honest carry — install PMD 7.x manually (https://pmd.github.io) or import a PMD SARIF (Tier 2).');
		return false;
	}
}

function reportTier2() {
	// Informational only — never install. Java / per-language envs are user-owned.
	const available = [];
	for (const tool of ['spotbugs', 'codeql', 'bandit', 'snyk', 'osv-scanner']) {
		if (commandExists(tool)) available.push(tool);
	}
	if (available.length > 0) {
		log(`Tier 2 tools detected on PATH: ${available.join(' ')} (will be used when available).`);
	}
}

try {
	ensureSemgrep();
	await ensurePmd();
	reportTier2();
} catch (err) {
	// Never block session start — log and swallow.
	log(`unexpected error (non-fatal): ${err && err.message ? err.message : err}`);
}
process.exit(0);

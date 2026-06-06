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
// Scope (matches static-runner/README.md tier policy):
//   Tier 1 (auto-install attempted): Semgrep
//   Tier 2 (informational only):     PMD / SpotBugs / CodeQL / Bandit / Snyk / OSV-Scanner
//   Tier 2 require JVM/JDK or per-language envs a plugin cannot bootstrap;
//   users keep ownership per DEC-2026-05-18-runtime-tool-exclusion.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const IS_WINDOWS = process.platform === 'win32';
const LOG_PREFIX = '[ai-native-methodology/install]';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || resolve(SCRIPT_DIR, '..');
const MARKER_DIR = join(PLUGIN_ROOT, '.aimd-install');
const SEMGREP_MARKER = join(MARKER_DIR, '.semgrep-installed');

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

function reportTier2() {
	// Informational only — never install. Java / per-language envs are user-owned.
	const available = [];
	for (const tool of ['pmd', 'spotbugs', 'codeql', 'bandit', 'snyk', 'osv-scanner']) {
		if (commandExists(tool)) available.push(tool);
	}
	if (available.length > 0) {
		log(`Tier 2 tools detected on PATH: ${available.join(' ')} (will be used when available).`);
	}
}

try {
	ensureSemgrep();
	reportTier2();
} catch (err) {
	// Never block session start — log and swallow.
	log(`unexpected error (non-fatal): ${err && err.message ? err.message : err}`);
}
process.exit(0);

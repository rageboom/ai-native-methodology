#!/usr/bin/env node
// install-companion-tools.js — OPT-IN idempotent installer for companion MCP tools (headroom + codegraph).
//
// Invoked by the SessionStart hook (see hooks/hooks.json) as `node ...install-companion-tools.js`.
// Mirrors install-static-tools.js conventions:
//   - Always exits 0 — never blocks Claude Code session start.
//   - Writes status to stderr so Claude surfaces it; stdout stays clean.
//   - Idempotent — no-op when `headroom` already on PATH (marker under .static-tools/).
//
// Scope: headroom (https://github.com/chopratejas/headroom) — LLM context-compression CLI + MCP server.
//   ★ OPT-IN ONLY — runs only when env CONTEXT_OPS_INSTALL_HEADROOM=1 (default OFF).
//     headroom is a heavy 3rd-party dependency (Python + Rust-built wheels) and is NEVER forced on
//     adopters; the shipped default is a silent no-op so no one gets a surprise install.
//   Channel: pipx (isolated, CLI on PATH) → pip3/pip --user fallback. Package = headroom-ai[mcp]
//     (CLI + MCP server; the [mcp] extra is what headroom-mcp-launch.js needs).
//   Wheel-preferred (`--only-binary headroom-ai`, per headroom's own docs) so SSL-inspected corporate
//     envs do NOT trigger a Rust toolchain build at session start. No sdist/build fallback on purpose:
//     a multi-minute Rust compile at SessionStart is unacceptable — when no wheel exists we honest-carry
//     to a manual-install message (no-simulation; never LLM-substituted).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const IS_WINDOWS = process.platform === 'win32';
const LOG_PREFIX = '[ai-native-methodology/companion]';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || resolve(SCRIPT_DIR, '..');
const MARKER_DIR = join(PLUGIN_ROOT, '.static-tools'); // reuse static-tools marker dir (gitignored)
const HEADROOM_MARKER = join(MARKER_DIR, '.headroom-installed');

// Two independent opt-in companion MCP tools, each behind its own flag (default OFF):
//   CONTEXT_OPS_INSTALL_HEADROOM=1 → headroom (context compression / pip)
//   CONTEXT_OPS_CODEGRAPH_MCP=1    → codegraph (structural-search MCP / npm) + project index bootstrap
const OPT_IN_HEADROOM = process.env.CONTEXT_OPS_INSTALL_HEADROOM === '1';
const OPT_IN_CODEGRAPH = process.env.CONTEXT_OPS_CODEGRAPH_MCP === '1';
const PKG = 'headroom-ai[mcp]';
const CODEGRAPH_PKG = '@colbymchenry/codegraph';
const CODEGRAPH_MARKER = join(MARKER_DIR, '.codegraph-installed');
// Project to index for codegraph = the working project (not the plugin itself).
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();

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
		writeFileSync(HEADROOM_MARKER, '');
	} catch {
		// marker is best-effort; failing to write it must not break session start.
	}
}

function ensureHeadroom() {
	if (commandExists('headroom')) {
		if (!existsSync(HEADROOM_MARKER)) markInstalled();
		return true;
	}

	log(`headroom not found — attempting opt-in install (${PKG})…`);

	// Channel order: pipx (isolated, recommended) → pip3 --user → (Windows) pip --user.
	// `--only-binary headroom-ai` forces a prebuilt wheel for headroom itself (no Rust build);
	// pure-Python deps still resolve normally.
	const channels = [];
	if (commandExists('pipx')) {
		channels.push(['pipx', ['install', PKG, '--pip-args', '--only-binary headroom-ai'], 'pipx']);
	}
	if (commandExists('pip3')) {
		channels.push(['pip3', ['install', '--user', '--only-binary', 'headroom-ai', PKG], 'pip3 --user']);
	} else if (IS_WINDOWS && commandExists('pip')) {
		channels.push(['pip', ['install', '--user', '--only-binary', 'headroom-ai', PKG], 'pip --user']);
	}

	if (channels.length === 0) {
		log('no Python installer (pipx/pip3/pip) on PATH — cannot install headroom.');
		log('  Install Python 3.10+ then: pipx install "headroom-ai[mcp]"');
		return false;
	}

	for (const [cmd, args, label] of channels) {
		if (runInstaller(cmd, args)) {
			log(`headroom installed via ${label}.`);
			if (label.startsWith('pip')) {
				log("Add the pip user-bin dir to PATH if 'headroom' is not found in new shells.");
			}
			markInstalled();
			return true;
		}
		log(`${label} install failed — trying next channel.`);
	}

	log('ERROR: could not auto-install headroom (honest carry — never LLM-substituted).');
	log('  Manual (corporate/SSL envs may need a prebuilt wheel):');
	log('    pipx install "headroom-ai[mcp]"   # https://github.com/chopratejas/headroom');
	return false;
}

// ── codegraph (structural-search MCP companion) ──────────────────────────────
// Trust: codegraph output = reference-lens / SEARCH only, never injected into deterministic
// chain gates (DEC-2026-05-28 §4.2). grep stays the authoritative falsification valve.
function ensureCodegraph() {
	if (commandExists('codegraph')) {
		if (!existsSync(CODEGRAPH_MARKER)) {
			try { mkdirSync(MARKER_DIR, { recursive: true }); writeFileSync(CODEGRAPH_MARKER, ''); } catch {}
		}
		return true;
	}
	log(`codegraph not found — attempting opt-in install (${CODEGRAPH_PKG})…`);
	if (commandExists('npm') && runInstaller('npm', ['install', '-g', CODEGRAPH_PKG])) {
		log('codegraph installed via npm -g.');
		try { mkdirSync(MARKER_DIR, { recursive: true }); writeFileSync(CODEGRAPH_MARKER, ''); } catch {}
		return true;
	}
	log('ERROR: could not install codegraph (honest carry — never LLM-substituted).');
	log(`  Manual: npm install -g ${CODEGRAPH_PKG}   # https://github.com/colbymchenry/codegraph`);
	return false;
}

// Bootstrap the project index so `codegraph serve --mcp` has something to serve.
// Idempotent: skip if .codegraph/ already present (native daemon watcher keeps it fresh after).
function ensureCodegraphIndex() {
	if (!commandExists('codegraph')) return false;
	if (existsSync(join(PROJECT_DIR, '.codegraph'))) return true; // already indexed; daemon maintains freshness
	log(`indexing project for codegraph (one-time): ${PROJECT_DIR}`);
	runInstaller('codegraph', ['init', PROJECT_DIR]); // idempotent
	if (runInstaller('codegraph', ['index', PROJECT_DIR])) {
		log('codegraph project index ready (native daemon watcher maintains freshness; ⚠️ stale-banner = verify hint).');
		return true;
	}
	log('codegraph index bootstrap failed (non-fatal) — MCP server no-ops until indexed.');
	return false;
}

try {
	if (!OPT_IN_HEADROOM && !OPT_IN_CODEGRAPH) {
		// Default OFF — silent no-op. Do not nag adopters who never opted in.
		process.exit(0);
	}
	if (OPT_IN_HEADROOM) {
		log('CONTEXT_OPS_INSTALL_HEADROOM=1 — headroom companion enabled.');
		ensureHeadroom();
	}
	if (OPT_IN_CODEGRAPH) {
		log('CONTEXT_OPS_CODEGRAPH_MCP=1 — codegraph search companion enabled.');
		if (ensureCodegraph()) ensureCodegraphIndex();
	}
} catch (err) {
	// Never block session start — log and swallow.
	log(`unexpected error (non-fatal): ${err && err.message ? err.message : err}`);
}
process.exit(0);

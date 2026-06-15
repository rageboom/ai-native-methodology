#!/usr/bin/env node
// codegraph-mcp-launch.js — wrapper launcher for the codegraph structural-search MCP (.mcp.json command).
//
// Gates `codegraph serve --mcp` on opt-out + binary presence + project-index presence, so the
// static .mcp.json declaration no-ops cleanly when codegraph is opted out / not-yet-installed / not-indexed:
//   - opted out (CONTEXT_OPS_DISABLE_CODEGRAPH=1) → exit 0 (server not active)
//   - codegraph not on PATH                       → exit 0 (SessionStart installer adds it; activates next session)
//   - project not indexed (.codegraph absent)     → exit 0 (installer bootstraps index; activates next session)
//   - otherwise (default)                         → exec `codegraph serve --mcp` (stdio passthrough, cwd = project)
//
// Trust (DEC-2026-05-28 §4.2 / plan cheap-falsifiability): this is a SEARCH/navigation MCP — its output is
// reference-lens, NEVER injected into deterministic chain gates. grep stays the authoritative falsification
// valve and is never blocked by this feature. codegraph's own ⚠️ stale-banner (during the daemon debounce
// window) tells the agent to Read directly — a built-in verify hint.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const IS_WINDOWS = process.platform === 'win32';
const LOG_PREFIX = '[ai-native-methodology/companion]';
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function commandExists(cmd) {
	const probe = IS_WINDOWS
		? spawnSync('where', [cmd], { stdio: 'ignore', windowsHide: true })
		: spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' });
	return probe.status === 0;
}

// Opted out → MCP server not active (default is ON).
const lc = (v) => String(v ?? '').trim().toLowerCase();
const OPTED_OUT =
	['1', 'true', 'yes', 'on'].includes(lc(process.env.CONTEXT_OPS_DISABLE_CODEGRAPH)) ||
	['0', 'false', 'no', 'off'].includes(lc(process.env.CONTEXT_OPS_CODEGRAPH_MCP));
if (OPTED_OUT) process.exit(0);

if (!commandExists('codegraph')) {
	process.stderr.write(
		`${LOG_PREFIX} codegraph not on PATH yet — MCP server inactive this session (installs at SessionStart, activates after reload).\n`,
	);
	process.exit(0);
}

if (!existsSync(join(PROJECT_DIR, '.codegraph'))) {
	process.stderr.write(
		`${LOG_PREFIX} project not indexed yet (${PROJECT_DIR}/.codegraph absent) — codegraph MCP inactive until index bootstrap completes.\n`,
	);
	process.exit(0);
}

// Transparent stdio passthrough so the MCP protocol speaks over stdin/stdout.
// serve has no --path flag (verified) → serve the index of the project via cwd.
const child = spawn('codegraph', ['serve', '--mcp'], {
	cwd: PROJECT_DIR,
	stdio: 'inherit',
	shell: IS_WINDOWS,
	windowsHide: true,
});
child.on('exit', (code, signal) => {
	if (signal) process.kill(process.pid, signal);
	else process.exit(code ?? 0);
});
child.on('error', (err) => {
	process.stderr.write(`${LOG_PREFIX} failed to start 'codegraph serve --mcp': ${err.message}\n`);
	process.exit(0);
});

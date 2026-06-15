#!/usr/bin/env node
// headroom-mcp-launch.js — wrapper launcher for the headroom MCP server (referenced by .mcp.json).
//
// The plugin declares an MCP server whose `command` points HERE instead of directly at `headroom`,
// so the static server declaration is safe when headroom is opted out or not-yet-installed:
//   - opted out (CONTEXT_OPS_DISABLE_HEADROOM=1) → exit 0 (graceful no-op; server simply not active)
//   - headroom not on PATH                       → exit 0 (no-op; activates next session after install /reload)
//   - otherwise (default)                        → exec `headroom mcp serve` (stdio passthrough)
//
// Why a launcher: Claude Code plugin MCP declarations have no conditional syntax and always try to
// start. Without this guard, opted-out adopters (and the first session before the SessionStart
// installer finishes installing headroom) would see a hard-failing server. The launcher turns those
// cases into a clean no-op. Mirrors the install scripts' no-simulation / honest-carry posture.

import { spawn, spawnSync } from 'node:child_process';

const IS_WINDOWS = process.platform === 'win32';
const LOG_PREFIX = '[ai-native-methodology/companion]';

function commandExists(cmd) {
	const probe = IS_WINDOWS
		? spawnSync('where', [cmd], { stdio: 'ignore', windowsHide: true })
		: spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' });
	return probe.status === 0;
}

// Opted out → MCP server not active (default is ON).
const lc = (v) => String(v ?? '').trim().toLowerCase();
const OPTED_OUT =
	['1', 'true', 'yes', 'on'].includes(lc(process.env.CONTEXT_OPS_DISABLE_HEADROOM)) ||
	['0', 'false', 'no', 'off'].includes(lc(process.env.CONTEXT_OPS_INSTALL_HEADROOM));
if (OPTED_OUT) {
	process.exit(0);
}

// Opted in but not installed yet (e.g. first session after opt-in). The SessionStart installer
// runs in the same session; the server activates next session or after /reload-plugins.
if (!commandExists('headroom')) {
	process.stderr.write(
		`${LOG_PREFIX} headroom not on PATH yet — MCP server inactive this session (activates after install + reload).\n`,
	);
	process.exit(0);
}

// Transparent stdio passthrough so the MCP protocol speaks over stdin/stdout.
const child = spawn('headroom', ['mcp', 'serve'], {
	stdio: 'inherit',
	shell: IS_WINDOWS,
	windowsHide: true,
});
child.on('exit', (code, signal) => {
	if (signal) process.kill(process.pid, signal);
	else process.exit(code ?? 0);
});
child.on('error', (err) => {
	process.stderr.write(`${LOG_PREFIX} failed to start 'headroom mcp serve': ${err.message}\n`);
	process.exit(0);
});

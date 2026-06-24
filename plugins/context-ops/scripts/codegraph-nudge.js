#!/usr/bin/env node
// codegraph-nudge.js — P2 non-blocking additive-injection PreToolUse hook (codegraph token-saving nudge).
//
// Invoked by the PreToolUse hook (matcher "Read|Glob"; see hooks/hooks.json) as `node ...codegraph-nudge.js`.
// Reads the hook event JSON on stdin and, for SOURCE Read/Glob, emits a small `additionalContext` block so the
// agent reaches for codegraph's compressed structural answers instead of dumping files. It NEVER blocks:
// no exit 2, no permissionDecision deny — stdout carries only an additive nudge, and any failure → exit 0 silent.
//
// Trigger-split token economics (DEC-2026-06-15-codegraph-search-token-saving P2):
//   - Glob (source directory) → inject a capped `codegraph files --filter <dir>` structure map. Clear win:
//     ~250 tokens that can replace many subsequent file Reads.
//   - Read (single source file) → inject a one-line pointer only (~50 tokens, NO codegraph call). The agent
//     often needs the file content anyway, so a rich snippet there is wasted — the pointer avoids that waste.
//   - Grep → never fires (excluded from the matcher; grep is the authoritative falsification valve, never nudged).
//
// Default ON (opt-out CONTEXT_OPS_CODEGRAPH_NUDGE=0). Mirrors install-companion-tools.js conventions:
// always exit 0, stderr-only logs, stdout = hook JSON only, idempotent marker (once per session+target).
//
// Trust (DEC-2026-05-28 §4.2): codegraph output = reference-lens / SEARCH only, NEVER injected into a
// deterministic chain gate. This hook is deliberately separate from chain-driver (the gate engine) to keep
// that boundary clean. Every injected block carries the reference-lens disclaimer; grep stays authoritative.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { SOURCE_EXTS } from '../tools/_shared/source-ext.js';

const IS_WINDOWS = process.platform === 'win32';
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || resolve(SCRIPT_DIR, '..');
const MARKER_DIR = join(PLUGIN_ROOT, '.static-tools'); // reuse companion/static marker dir (gitignored)

// Source extensions aligned with codegraph's supported languages (see `codegraph status` Languages).
//   SSOT = tools/_shared/source-ext.js (이전엔 동형 사본을 여기 중복 정의했으나 drift 위험 → import 로 통합.
//   sibling hook graph-context-nudge.js 가 동일 ../tools/_shared import 패턴을 이미 출하·검증 — 경로 해소 OK).
//   re-export 로 기존 public surface(SOURCE_EXTS) 보존.
export { SOURCE_EXTS };

const ANSI = /\x1b\[[0-9;]*m/g;
const LENS = '(codegraph reference-lens · grep authoritative · gate-inject ❌)';
const READ_POINTER =
	'💡 심볼 구조질의(누가 호출 / impact / callees)는 mcp__codegraph__codegraph_callers · impact · context 가 ' +
	'파일 전체를 안 읽고 압축답을 반환합니다. ' + LENS;

// ── pure helpers (exported for unit tests) ───────────────────────────────────

export function isSourcePath(p) {
	if (!p || typeof p !== 'string') return false;
	return SOURCE_EXTS.has(extname(p).toLowerCase());
}

// Literal directory prefix of a glob pattern (portion before the first glob metachar).
export function globDir(pattern) {
	if (!pattern || typeof pattern !== 'string') return '';
	const metaIdx = pattern.search(/[*?[\]{}]/);
	const head = metaIdx === -1 ? pattern : pattern.slice(0, metaIdx);
	return head.replace(/\/+$/, '');
}

// Does a glob pattern target source? A source extension present, OR a directory-ish glob (no extension).
export function globTargetsSource(pattern) {
	if (!pattern || typeof pattern !== 'string') return false;
	const ext = extname(pattern).toLowerCase();
	if (ext) return SOURCE_EXTS.has(ext);
	return true; // no extension = directory glob → candidate for a structure-map injection
}

// Classify the hook event into a nudge intent. Grep / unknown tools → 'skip' (never fire).
export function classifyIntent(toolName, input) {
	input = input || {};
	if (toolName === 'Read') {
		return isSourcePath(input.file_path) ? { kind: 'read-pointer' } : { kind: 'skip' };
	}
	if (toolName === 'Glob') {
		if (!globTargetsSource(input.pattern)) return { kind: 'skip' };
		let dir = globDir(input.pattern);
		if (input.path) dir = dir ? join(input.path, dir) : input.path;
		if (!dir || dir === '.') return { kind: 'skip' }; // too broad / unresolvable to be useful
		return { kind: 'glob-dir', dir };
	}
	return { kind: 'skip' };
}

// Strip ANSI, drop blank lines, cap to maxLines with an honest truncation note.
export function capOutput(text, maxLines = 25) {
	const lines = String(text || '').replace(ANSI, '').split('\n').filter((l) => l.trim() !== '');
	if (lines.length <= maxLines) return lines.join('\n');
	return (
		lines.slice(0, maxLines).join('\n') +
		`\n… (+${lines.length - maxLines} more — mcp__codegraph__codegraph_files for the rest)`
	);
}

export function buildReadContext() {
	return READ_POINTER;
}

export function buildGlobContext(dir, cappedFilesOutput) {
	return (
		`💡 codegraph 구조맵 · ${dir} ${LENS}\n${cappedFilesOutput}\n` +
		'→ 개별 파일을 일일이 Read 하기 전에 위 구조 + mcp__codegraph__codegraph_context 로 먼저 탐색하세요.'
	);
}

export function buildHookOutput(additionalContext) {
	return JSON.stringify({
		hookSpecificOutput: {
			hookEventName: 'PreToolUse',
			additionalContext,
		},
	});
}

export function isOptedOut(envValue) {
	return ['0', 'false', 'no', 'off'].includes(String(envValue ?? '').trim().toLowerCase());
}

// ── I/O (only runs on direct invocation) ─────────────────────────────────────

function commandExists(cmd) {
	const probe = IS_WINDOWS
		? spawnSync('where', [cmd], { stdio: 'ignore', windowsHide: true })
		: spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' });
	return probe.status === 0;
}

function queryGlobMap(dir, projectDir) {
	const res = spawnSync('codegraph', ['files', '--filter', dir, '--format', 'flat'], {
		cwd: projectDir,
		encoding: 'utf8',
		timeout: 5000,
		windowsHide: true,
		shell: IS_WINDOWS,
	});
	if (res.status !== 0 || !res.stdout) return '';
	return res.stdout;
}

function markerPath(sessionId, target) {
	const h = createHash('sha1').update(`${sessionId}::${target}`).digest('hex').slice(0, 12);
	return join(MARKER_DIR, `.nudge-${h}`);
}

function main() {
	try {
		if (isOptedOut(process.env.CONTEXT_OPS_CODEGRAPH_NUDGE)) return process.exit(0);

		let raw = '';
		try { raw = readFileSync(0, 'utf8'); } catch { return process.exit(0); }
		let evt;
		try { evt = JSON.parse(raw); } catch { return process.exit(0); }

		const intent = classifyIntent(evt.tool_name, evt.tool_input);
		if (intent.kind === 'skip') return process.exit(0);

		// codegraph must be set up — otherwise the MCP tools we point at don't exist.
		if (!commandExists('codegraph')) return process.exit(0);
		const projectDir = evt.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
		if (!existsSync(join(projectDir, '.codegraph'))) return process.exit(0);

		// frustration cap — once per (session, target).
		const target = intent.kind === 'glob-dir' ? `glob:${intent.dir}` : `read:${evt.tool_input?.file_path}`;
		const marker = markerPath(evt.session_id || 'nosession', target);
		if (existsSync(marker)) return process.exit(0);

		let additionalContext;
		if (intent.kind === 'read-pointer') {
			additionalContext = buildReadContext();
		} else {
			const out = queryGlobMap(intent.dir, projectDir);
			if (!out.trim()) return process.exit(0); // nothing structural to inject
			additionalContext = buildGlobContext(intent.dir, capOutput(out, 25));
		}

		process.stdout.write(buildHookOutput(additionalContext));
		try { mkdirSync(MARKER_DIR, { recursive: true }); writeFileSync(marker, ''); } catch {}
	} catch {
		// never block a tool call — swallow and exit clean.
	}
	process.exit(0);
}

const isDirectInvocation = (() => {
	try { return import.meta.url === pathToFileURL(process.argv[1]).href; } catch { return false; }
})();
if (isDirectInvocation) main();

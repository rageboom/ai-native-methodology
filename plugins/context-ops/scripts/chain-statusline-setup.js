#!/usr/bin/env node
// chain-statusline-setup.js — chain statusLine 을 프로젝트 설정에 1회 기입(사용자 하드 편집 회피).
//
// 호출: node ${CLAUDE_PLUGIN_ROOT}/scripts/chain-statusline-setup.js [--project <dir>] [--force]
//   (commands/chain-status.md 의 --setup-statusline 이 위임)
//
// 동작:
//   - ${CLAUDE_PLUGIN_ROOT} 로 chain-statusline.js 절대경로 resolve(설치 위치 무관) → settings 에 박음.
//   - <project>/.claude/settings.local.json (로컬·gitignore / 없으면 생성) 에 statusLine merge-write.
//     다른 키 무손실. idempotent(동일 command 면 noop). 기존 statusLine 이 다른 값이면 conflict → --force 필요.
//   - hot-reload: Claude Code 가 settings 파일 watch → 1~2초 내 라이브 반영(재시작 불요).
//   - ${CLAUDE_PLUGIN_ROOT} 부재 시 exit 3 + 수동 안내(no-simulation / 가짜 성공 ❌).
//
// 결정론 file write only — deterministic-axis 정합(LLM 판단 0).

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

// chain-statusline.js 절대경로 → statusLine config object.
export function buildStatusLineConfig(pluginRoot) {
	const script = join(pluginRoot, 'scripts', 'chain-statusline.js');
	return { type: 'command', command: `node ${script}` };
}

// settings 에 statusLine merge. 반환 {settings, action, message}.
//   action: 'created'(신규) | 'noop'(이미 동일) | 'updated'(--force 덮어씀) | 'conflict'(기존 상이 / 미변경).
export function mergeStatusLine(settings, config, { force = false } = {}) {
	const next = { ...(settings ?? {}) };
	const existing = next.statusLine;
	const sameCmd =
		existing && existing.type === config.type && existing.command === config.command;
	if (sameCmd) return { settings: next, action: 'noop', message: '이미 동일하게 설정됨' };
	if (existing && !force) {
		return {
			settings: next,
			action: 'conflict',
			message: `기존 statusLine 존재(command=${JSON.stringify(existing.command ?? existing)}). 덮어쓰려면 --force.`,
		};
	}
	next.statusLine = config;
	return {
		settings: next,
		action: existing ? 'updated' : 'created',
		message: existing ? '기존 statusLine 덮어씀(--force)' : '신규 기입',
	};
}

function readSettings(path) {
	if (!existsSync(path)) return {};
	try {
		return JSON.parse(readFileSync(path, 'utf-8'));
	} catch (e) {
		throw new Error(`settings 파싱 실패(${path}): ${e.message} — 수동 점검 필요`);
	}
}

function parseArgs(argv) {
	const a = { project: process.cwd(), force: false };
	for (let i = 2; i < argv.length; i++) {
		if (argv[i] === '--project') a.project = argv[++i];
		else if (argv[i] === '--force') a.force = true;
	}
	return a;
}

function main() {
	const args = parseArgs(process.argv);
	const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
	if (!pluginRoot) {
		console.error(
			'[chain-statusline-setup] ❌ CLAUDE_PLUGIN_ROOT 미설정 — 슬래시 커맨드/플러그인 컨텍스트에서 실행하세요.\n' +
				'수동 설정: .claude/settings.local.json 에\n' +
				'  { "statusLine": { "type": "command", "command": "node <플러그인설치경로>/scripts/chain-statusline.js" } }',
		);
		process.exit(3);
	}
	const config = buildStatusLineConfig(resolve(pluginRoot));
	const settingsPath = join(resolve(args.project), '.claude', 'settings.local.json');
	const before = readSettings(settingsPath);
	const { settings, action, message } = mergeStatusLine(before, config, { force: args.force });

	if (action === 'conflict') {
		console.error(`[chain-statusline-setup] ⚠ ${message}`);
		process.exit(1);
	}
	if (action === 'noop') {
		console.log(`[chain-statusline-setup] ✅ ${message} (${settingsPath})`);
		process.exit(0);
	}
	mkdirSync(dirname(settingsPath), { recursive: true });
	writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
	console.log(
		`[chain-statusline-setup] ✅ ${message} → ${settingsPath}\n` +
			`  statusLine.command = ${config.command}\n` +
			'  Claude Code 가 1~2초 내 자동 반영(재시작 불요). 하단바에 「📍 stage N/5 · scope」 표시.',
	);
	process.exit(0);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
	main();
}

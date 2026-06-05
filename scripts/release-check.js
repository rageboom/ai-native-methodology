#!/usr/bin/env node
// release-check.js — 모노레포 release 게이트 디스패처.
// 각 플러그인은 자기 release 게이트를 소유한다(plugins/<name>/scripts/release-readiness.js).
// 이 디스패처는 대상 플러그인마다 그 게이트를 실행하고, 없으면 최소 게이트(version-check)로 폴백한다.
//
// usage:
//   node scripts/release-check.js --plugin <name>            # 한 플러그인 (target = 그 plugin.json.version 자동)
//   node scripts/release-check.js --plugin <name> --target v12.15.0 [--json] [--skip-*]
//   node scripts/release-check.js --all                      # 전 플러그인 집계
//   (인자 생략 시 — plugins/ 에 1개면 그것)

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { resolveTargets, pluginDir } from './_plugins.js';

const SCRIPT_DIR = resolve(fileURLToPath(import.meta.url), '..');
const argv = process.argv.slice(2);

// release-readiness 로 그대로 넘길 passthrough 플래그 (플러그인 선택 인자만 제거).
function passthroughFlags(argv) {
	const out = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--all') continue;
		if (a === '--plugin') {
			i++; // 값도 건너뜀
			continue;
		}
		if (!a.startsWith('--')) continue; // bare positional(=플러그인명) 제거
		out.push(a);
	}
	return out;
}

function pluginVersion(dir) {
	return JSON.parse(
		readFileSync(join(dir, '.claude-plugin', 'plugin.json'), 'utf-8'),
	).version;
}

function main() {
	const targets = resolveTargets(argv, ['--target']);
	const flags = passthroughFlags(argv);
	const failed = [];
	const passed = [];

	for (const name of targets) {
		const dir = pluginDir(name);
		const gate = join(dir, 'scripts', 'release-readiness.js');
		console.log(`\n[release-check] ══════ ${name} ══════`);

		try {
			if (existsSync(gate)) {
				// --target 미지정 시 plugin.json.version 에서 자동 도출
				const f = [...flags];
				if (!f.includes('--target')) f.push('--target', `v${pluginVersion(dir)}`);
				execSync(`node "${gate}" ${f.join(' ')}`.trim(), {
					stdio: 'inherit',
					cwd: dir,
				});
			} else {
				// 자체 게이트 없는 플러그인(스킬 팩 등) — 최소 게이트로 폴백
				console.log(
					`[release-check] '${name}' 자체 release 게이트 없음 → version-check 폴백`,
				);
				execSync(
					`node "${join(SCRIPT_DIR, 'version-check.js')}" --plugin ${name}`,
					{ stdio: 'inherit', cwd: SCRIPT_DIR },
				);
			}
			console.log(`[release-check] ✅ ${name} 통과`);
			passed.push(name);
		} catch {
			console.error(`[release-check] ❌ ${name} 실패`);
			failed.push(name);
		}
	}

	if (failed.length) {
		console.log(
			`\n[release-check] ❌ release-ready 아님: ${failed.join(', ')}` +
				(passed.length ? ` / 통과: ${passed.join(', ')}` : ''),
		);
	} else {
		console.log(
			`\n[release-check] ✅ ${targets.length} plugin(s) release-ready: ${targets.join(', ')}`,
		);
	}
	process.exit(failed.length ? 1 : 0);
}

main();

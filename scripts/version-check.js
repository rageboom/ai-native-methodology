#!/usr/bin/env node
// version-check.js — 플러그인별 3-way 버전 정합 검증 (plugin.json ↔ CHANGELOG.md 첫 ## [v...] ↔ package.json)
// source-of-truth = plugins/<name>/.claude-plugin/plugin.json.version (D5 / Anthropic 공식 권고 정합)
// tool workspace 자체 package.json version 무관 (ADR-010 분리)
// usage:
//   node scripts/version-check.js --plugin <name>   # 특정 플러그인
//   node scripts/version-check.js --all             # 전 플러그인 루프
//   node scripts/version-check.js                   # 플러그인 1개면 그것 (없으면 모호 에러)
// exit 0 (전부 정합) / exit 1 (1개라도 mismatch)

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveTargets, pluginDir } from './_plugins.js';

function readPluginVersion(dir) {
	const data = JSON.parse(
		readFileSync(join(dir, '.claude-plugin', 'plugin.json'), 'utf-8'),
	);
	return data.version;
}

function readChangelogVersion(dir) {
	const text = readFileSync(join(dir, 'CHANGELOG.md'), 'utf-8');
	// 첫 ## [vX.Y.Z] 헤더 parse — semver pre-release tag (-rc.X / -alpha.X / -beta.X / -rc1) 허용
	const match = text.match(/^##\s*\[v?(\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?)\]/m);
	if (!match) {
		throw new Error(`CHANGELOG.md 첫 '## [vX.Y.Z]' 헤더 부재`);
	}
	return match[1];
}

function readPackageJsonVersion(dir) {
	const data = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
	return data.version;
}

function checkOne(name) {
	const dir = pluginDir(name);
	const plugin = readPluginVersion(dir);
	const changelog = readChangelogVersion(dir);
	const pkg = readPackageJsonVersion(dir);

	console.log(`\n[version-check] ── ${name}`);
	console.log(`[version-check]   plugin.json:   ${plugin}`);
	console.log(`[version-check]   CHANGELOG.md:  ${changelog}`);
	console.log(`[version-check]   package.json:  ${pkg}`);

	const mismatches = [];
	if (plugin !== changelog)
		mismatches.push(`plugin.json (${plugin}) ↔ CHANGELOG.md (${changelog})`);
	if (plugin !== pkg)
		mismatches.push(`plugin.json (${plugin}) ↔ package.json (${pkg})`);

	if (mismatches.length > 0) {
		console.error(`[version-check]   MISMATCH:`);
		for (const m of mismatches) console.error(`     - ${m}`);
		return false;
	}
	console.log(`[version-check]   ✅ 3 sources in sync at v${plugin}`);
	return true;
}

function main() {
	const targets = resolveTargets(process.argv.slice(2));
	let ok = true;
	for (const name of targets) {
		try {
			if (!checkOne(name)) ok = false;
		} catch (e) {
			console.error(`[version-check] ── ${name}: ${e.message}`);
			ok = false;
		}
	}
	if (!ok) {
		console.error(
			'\n[version-check] ❌ source-of-truth = .claude-plugin/plugin.json.version (Anthropic 공식)',
		);
		process.exit(1);
	}
	console.log(
		`\n[version-check] ✅ all ${targets.length} plugin(s) in sync: ${targets.join(', ')}`,
	);
	process.exit(0);
}

main();

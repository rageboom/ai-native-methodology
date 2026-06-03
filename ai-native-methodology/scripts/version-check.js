#!/usr/bin/env node
// version-check.js — plugin.json.version + CHANGELOG.md 첫 ## [v...] 헤더 정합 검증
// source-of-truth = .claude-plugin/plugin.json.version (D5 / Anthropic 공식 권고 정합)
// tool 5종 자체 package.json version 무관 (ADR-010 분리)
// usage: node scripts/version-check.js  → exit 0 (정합) / exit 1 (mismatch)

import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..');
const WORKSPACE = resolve(SCRIPT_DIR, '..');

function readPluginVersion() {
	const pluginJsonPath = join(WORKSPACE, '.claude-plugin', 'plugin.json');
	const data = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));
	return data.version;
}

function readChangelogVersion() {
	const path = join(WORKSPACE, 'CHANGELOG.md');
	const text = readFileSync(path, 'utf-8');
	// 첫 ## [vX.Y.Z] 헤더 parse
	// semver pre-release tag (-rc.X / -alpha.X / -beta.X / -rc1) 허용
	const match = text.match(/^##\s*\[v?(\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?)\]/m);
	if (!match) {
		throw new Error(`[version-check] CHANGELOG.md 첫 '## [vX.Y.Z]' 헤더 부재`);
	}
	return match[1];
}

function readPackageJsonVersion() {
	const path = join(WORKSPACE, 'package.json');
	const data = JSON.parse(readFileSync(path, 'utf-8'));
	return data.version;
}

function main() {
	const plugin = readPluginVersion();
	const changelog = readChangelogVersion();
	const pkg = readPackageJsonVersion();

	console.log(`[version-check] plugin.json:   ${plugin}`);
	console.log(`[version-check] CHANGELOG.md:  ${changelog}`);
	console.log(`[version-check] package.json:  ${pkg}`);

	const mismatches = [];
	if (plugin !== changelog)
		mismatches.push(`plugin.json (${plugin}) ↔ CHANGELOG.md (${changelog})`);
	if (plugin !== pkg)
		mismatches.push(`plugin.json (${plugin}) ↔ package.json (${pkg})`);

	if (mismatches.length > 0) {
		console.error('\n[version-check] MISMATCH:');
		for (const m of mismatches) console.error(`  - ${m}`);
		console.error(
			'\n[version-check] source-of-truth = .claude-plugin/plugin.json.version (Anthropic 공식)',
		);
		process.exit(1);
	}

	console.log(`\n[version-check] ✅ all 3 sources in sync at v${plugin}`);
	process.exit(0);
}

main();

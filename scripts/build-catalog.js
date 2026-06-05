#!/usr/bin/env node
// build-catalog.js — plugins/* 에서 repo-root .claude-plugin/marketplace.json (카탈로그) 자동 생성.
//
// 카탈로그 = 생성물(SSOT 아님). 손편집 ❌. 입력:
//   repo-root/.claude-plugin/marketplace.meta.json   — 마켓플레이스 레벨 { name, owner, description, readRegistry }
//   plugins/<name>/.claude-plugin/plugin.json        — 플러그인 식별/버전 (name, version)
//   plugins/<name>/package.json                      — npm 패키지명 (source.package)
//   plugins/<name>/marketplace-entry.json            — 카탈로그 blurb { description, versionRange? }
//                                                      (플러그인 root / build INCLUDE 밖 = 출하 ❌)
//
// 각 엔트리 source.version = marketplace-entry.versionRange || ^<major>.0.0 (patch/minor 에 카탈로그 불변).
// source.registry = entry.registry || meta.readRegistry (사용자 pull 레지스트리 = npm group).
//
// usage:
//   node scripts/build-catalog.js            # 생성 (marketplace.json 갱신)
//   node scripts/build-catalog.js --check     # 생성 결과 == 현재 파일이면 통과, 아니면 exit 1 (drift gate)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { listPlugins, pluginDir, REPO_ROOT } from './_plugins.js';

const CHECK = process.argv.includes('--check');
const META_PATH = join(REPO_ROOT, '.claude-plugin', 'marketplace.meta.json');
const CATALOG_PATH = join(REPO_ROOT, '.claude-plugin', 'marketplace.json');

function fail(msg) {
	console.error(`[build-catalog] ${msg}`);
	process.exit(1);
}

function readJson(p) {
	return JSON.parse(readFileSync(p, 'utf-8'));
}

function majorRange(version) {
	const m = /^(\d+)\./.exec(version);
	if (!m) fail(`잘못된 version: ${version}`);
	return `^${m[1]}.0.0`;
}

function buildEntry(name, meta) {
	const dir = pluginDir(name);
	const plugin = readJson(join(dir, '.claude-plugin', 'plugin.json'));
	const pkg = readJson(join(dir, 'package.json'));

	const entryPath = join(dir, 'marketplace-entry.json');
	if (!existsSync(entryPath))
		fail(`'${name}' marketplace-entry.json 없음 (카탈로그 blurb 필요): ${entryPath}`);
	const entry = readJson(entryPath);
	if (!entry.description)
		fail(`'${name}' marketplace-entry.json 에 description 없음`);
	if (!pkg.name) fail(`'${name}' package.json 에 name(npm 패키지명) 없음`);

	return {
		name, // 카탈로그 식별자 = 디렉토리명 (release-readiness check17 lookup 과 일치)
		source: {
			source: 'npm',
			package: pkg.name,
			version: entry.versionRange || majorRange(plugin.version),
			registry: entry.registry || meta.readRegistry,
		},
		description: entry.description,
	};
}

function main() {
	if (!existsSync(META_PATH)) fail(`marketplace.meta.json 없음: ${META_PATH}`);
	const meta = readJson(META_PATH);
	if (!meta.readRegistry)
		fail('marketplace.meta.json 에 readRegistry(사용자 pull 레지스트리) 없음');

	const names = listPlugins();
	if (!names.length) fail('plugins/ 아래 플러그인 없음');

	const catalog = {
		name: meta.name,
		owner: meta.owner,
		description: meta.description,
		plugins: names.map((n) => buildEntry(n, meta)),
	};
	const rendered = JSON.stringify(catalog, null, 2) + '\n';

	if (CHECK) {
		const current = existsSync(CATALOG_PATH)
			? readFileSync(CATALOG_PATH, 'utf-8')
			: '';
		if (current !== rendered) {
			fail(
				'카탈로그 drift — marketplace.json 이 생성 결과와 다름. `npm run catalog:build` 후 커밋 필요.',
			);
		}
		console.log(
			`[build-catalog] ✅ 카탈로그 최신 (drift 0) — ${names.length} plugin(s): ${names.join(', ')}`,
		);
		return;
	}

	writeFileSync(CATALOG_PATH, rendered, 'utf-8');
	console.log(
		`[build-catalog] ✅ marketplace.json 생성 — ${names.length} plugin(s): ${names.join(', ')}`,
	);
	console.log(`[build-catalog]    → ${CATALOG_PATH}`);
}

main();

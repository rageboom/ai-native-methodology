#!/usr/bin/env node
// new-plugin.js — templates/plugin-scaffold/ → plugins/<name>/ 스캐폴드 생성.
//
// mis-plugins 마켓플레이스 모노레포에 새 플러그인을 추가하는 단일 진입점.
// 생성 후 공유 툴링(build-catalog / version-check / build-plugin / publish)이 자동 인식한다.
// 규약·후속 흐름 = docs/add-a-plugin.md.
//
// usage:
//   node scripts/new-plugin.js <name>     # plugins/<name>/ 생성 (예: node scripts/new-plugin.js my-plugin)
//   pnpm plugin:new <name>
//
// <name> = 디렉토리명 = plugin.json.name = npm 패키지 @mis-plugins/<name> 의 suffix (lockstep).

import {
	readFileSync,
	writeFileSync,
	mkdirSync,
	readdirSync,
	existsSync,
} from 'node:fs';
import { join, relative } from 'node:path';
import { REPO_ROOT, listPlugins } from './_plugins.js';

const TEMPLATE_DIR = join(REPO_ROOT, 'templates', 'plugin-scaffold');
const PLACEHOLDER = /__PLUGIN_NAME__/g;
// npm 패키지명 규칙 + 디렉토리 안전 — 소문자 시작, 소문자/숫자/대시.
const NAME_RE = /^[a-z][a-z0-9-]*$/;

function fail(msg) {
	console.error(`[new-plugin] ${msg}`);
	process.exit(1);
}

/** 템플릿 트리를 재귀 복사하며 텍스트 파일의 __PLUGIN_NAME__ 치환. */
function copyTree(srcDir, dstDir, name) {
	mkdirSync(dstDir, { recursive: true });
	for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
		const src = join(srcDir, entry.name);
		const dst = join(dstDir, entry.name);
		if (entry.isDirectory()) {
			copyTree(src, dst, name);
			continue;
		}
		// 전부 텍스트 자산(JSON / md / .gitkeep) — placeholder 치환 후 기록.
		const content = readFileSync(src, 'utf-8').replace(PLACEHOLDER, name);
		writeFileSync(dst, content, 'utf-8');
	}
}

function main() {
	const name = process.argv[2];
	if (!name) fail('플러그인 이름 필요: node scripts/new-plugin.js <name>');
	if (!NAME_RE.test(name))
		fail(`잘못된 이름 '${name}' — 소문자로 시작 + 소문자/숫자/대시만 (npm 패키지명 규칙).`);

	if (!existsSync(TEMPLATE_DIR))
		fail(`스캐폴드 템플릿 부재: ${relative(REPO_ROOT, TEMPLATE_DIR)}`);

	if (listPlugins().includes(name))
		fail(`플러그인 '${name}' 이미 존재 (plugins/${name}).`);

	const target = join(REPO_ROOT, 'plugins', name);
	if (existsSync(target)) fail(`대상 디렉토리 이미 존재: plugins/${name}`);

	copyTree(TEMPLATE_DIR, target, name);

	console.log(`[new-plugin] ✅ plugins/${name} 생성 (@mis-plugins/${name} @ 0.1.0)`);
	console.log('[new-plugin] 다음 단계:');
	console.log(`  1. plugins/${name}/ 의 TODO (description / 첫 CHANGELOG 날짜) 채우기 + agents·skills·hooks 자산 추가`);
	console.log(`  2. node scripts/version-check.js --plugin ${name}   # 3-way 버전 정합`);
	console.log('  3. pnpm run catalog:build                            # marketplace.json 재생성 (자동 등재)');
	console.log(`  4. node scripts/publish.js --plugin ${name} --dry-run  # 배포 dry-run (tarball 확인)`);
	console.log('  → 상세: docs/add-a-plugin.md');
}

main();

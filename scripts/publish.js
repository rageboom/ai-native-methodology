#!/usr/bin/env node
// publish.js — plugins/<name> npm 패키지를 Nexus npm-hosted 레지스트리에 publish
// (source:npm 배포 채널 / build-plugin.js = git-subdir Claude 아티팩트 채널과 별개)
//
// usage:
//   node scripts/publish.js --plugin <name> --dry-run    # version-check + pnpm publish --dry-run (업로드 없음 / tarball·bundled deps 확인)
//   node scripts/publish.js --plugin <name>              # publishConfig.registry 로 publish
//   node scripts/publish.js --all                        # 전 플러그인 publish (CI 일괄)
//   node scripts/publish.js --plugin <name> --registry <url>   # 레지스트리 override (verdaccio 검증)
//   (플러그인 인자 생략 시 — plugins/ 에 1개면 그것)
//
// 인증: .npmrc 의 //<host>/...:_authToken=... (또는 base64 _auth) 에 의존. 이 스크립트는 자격증명을 다루지 않음.
//   source:npm 은 설치 시 deps 를 install 하지 않으므로 외부 의존(ajv/ajv-formats/fast-xml-parser)은
//     package.json bundledDependencies 로 tarball 에 동봉됨 (실측: node_modules 594 엔트리).
//   ⚠ pnpm + .npmrc node-linker=hoisted 의존 — hoisted 라야 plugins/<name>/node_modules 에 bundledDeps 가
//     flat materialize 되어 pnpm pack/publish 가 tarball 에 동봉함 (isolated 기본값이면 동봉 누락 위험).

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { resolveTargets, pluginDir, REPO_ROOT } from './_plugins.js';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..');

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const regIdx = argv.indexOf('--registry');
const REGISTRY_OVERRIDE = regIdx !== -1 ? argv[regIdx + 1] : null;

function fail(msg) {
	console.error(`[publish] ${msg}`);
	process.exit(1);
}

function readJson(p) {
	return JSON.parse(readFileSync(p, 'utf-8'));
}

function publishOne(name) {
	const WORKSPACE = pluginDir(name);
	const pkg = readJson(join(WORKSPACE, 'package.json'));
	const registry = REGISTRY_OVERRIDE || pkg.publishConfig?.registry;

	console.log(`\n[publish] ── ${name}`);
	console.log(`[publish] package:  ${pkg.name}@${pkg.version}`);
	console.log(`[publish] registry: ${registry || '(none)'}`);
	console.log(
		`[publish] mode:     ${DRY_RUN ? 'dry-run (no upload)' : 'publish'}`,
	);

	if (pkg.private)
		fail(`'${name}' package.json private:true — publish 차단. private:false 로 전환 필요.`);
	if (!registry)
		fail(
			`'${name}' 레지스트리 미지정 — publishConfig.registry 또는 --registry <url> 필요.`,
		);

	// gate 1 — version 3-way sync (plugin.json ↔ CHANGELOG ↔ package.json)
	console.log('[publish] version-check (3-way sync gate)…');
	try {
		execSync(`node "${join(SCRIPT_DIR, 'version-check.js')}" --plugin ${name}`, {
			stdio: 'inherit',
			cwd: REPO_ROOT,
		});
	} catch {
		fail(`'${name}' version-check 실패 — abort.`);
	}

	// gate 1.5 — bundledDependencies materialize (pnpm + node-linker=hoisted)
	// pnpm 워크스페이스 install(hoisted)은 plugins/<name>/node_modules 에 bundledDeps 를 flat 으로 채운다
	//   (실측: ajv/ajv-formats/fast-xml-parser → node_modules 594 엔트리 동봉 / .npmrc node-linker=hoisted 의존).
	//   → 별도 격리 install 불필요. 단 standalone 호출 대비 워크스페이스 install 을 한 번 보장.
	const bundled = pkg.bundledDependencies || pkg.bundleDependencies || [];
	if (bundled.length) {
		console.log(
			'[publish] bundledDependencies materialize (pnpm install --filter, node-linker=hoisted)…',
		);
		try {
			execSync(`pnpm install --filter ${pkg.name}`, {
				stdio: 'inherit',
				cwd: REPO_ROOT,
			});
		} catch {
			fail(`'${name}' bundled deps materialize 실패 — abort.`);
		}
	}

	// gate 2 — bundledDependencies node_modules 존재 확인 (없으면 deps 누락 publish 위험)
	for (const dep of bundled) {
		if (!existsSync(join(WORKSPACE, 'node_modules', ...dep.split('/')))) {
			fail(
				`'${name}' bundledDependency '${dep}' 가 node_modules 에 없음 — 격리 설치 실패 (tarball 동봉 불가).`,
			);
		}
	}
	if (bundled.length)
		console.log(
			`[publish] bundledDependencies 확인: ${bundled.join(', ')} (로컬 node_modules 존재)`,
		);

	// publish (pnpm publish --dry-run — tarball 내용 + bundled deps 출력)
	//   --no-git-checks: pnpm 은 기본적으로 clean tree/branch/up-to-date 를 검사 → 릴리스 워크플로상 생략.
	const regFlag = `--registry "${registry}"`;
	const dryFlag = DRY_RUN ? '--dry-run' : '';
	const cmd = `pnpm publish ${dryFlag} ${regFlag} --no-git-checks`
		.replace(/\s+/g, ' ')
		.trim();
	console.log(`[publish] ${cmd}`);
	try {
		execSync(cmd, { stdio: 'inherit', cwd: WORKSPACE });
	} catch {
		fail(
			`'${name}' pnpm publish 실패 — .npmrc 인증(_authToken) / 레지스트리 권한 / 네트워크 확인.`,
		);
	}

	console.log(
		`[publish] ✅ ${DRY_RUN ? `dry-run 완료 (업로드 없음): ${name}` : `published ${pkg.name}@${pkg.version} → ${registry}`}`,
	);
}

function main() {
	const targets = resolveTargets(argv, ['--registry']);
	for (const name of targets) publishOne(name);

	if (!DRY_RUN) {
		console.log(
			'\n[publish] ℹ 카탈로그(marketplace.json)는 version RANGE(^x) 라 patch/minor 에는 불변 — 사용자 autoUpdate 가 자동 재해석.',
		);
		console.log(
			'[publish] ℹ MAJOR range/description/새 플러그인 변경 시에만: pnpm run catalog:build && pnpm run publish:catalog -- --user <nexus-id>',
		);
	}
	console.log(
		`\n[publish] ✅ ${DRY_RUN ? 'dry-run' : 'published'} ${targets.length} plugin(s): ${targets.join(', ')}`,
	);
}

main();

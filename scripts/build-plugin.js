#!/usr/bin/env node
// build-plugin.js — workspace source → dist/ai-native-methodology-v<version>/ plugin artifact 추출
// 본 plan (warm-brewing-moth.md) Phase 3 — Official Docs / Industry Case / Senior Engineer 토론 보강 7건 반영
// usage:
//   node scripts/build-plugin.js              # build (dist 생성)
//   node scripts/build-plugin.js --check      # dry-run (file count 만 출력)

import {
	readFileSync,
	writeFileSync,
	mkdirSync,
	cpSync,
	statSync,
	readdirSync,
	existsSync,
	rmSync,
	createReadStream,
} from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { resolveTargets, pluginDir, REPO_ROOT } from './_plugins.js';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..');
const DRY_RUN = process.argv.includes('--check');

// Industry 보강 1 — explicit allow-list (VSCode vsce node_modules 사고 회피)
const INCLUDE = [
	'.claude-plugin',
	'agents',
	'skills',
	'hooks',
	'flows',
	'tools',
	'templates',
	'methodology-spec',
	'schemas',
	'guides', // cleanup round 2-C — 사용자 journey 자산
	// SessionStart hook runtime deps — only these two scripts ship; dev tooling
	// (release-readiness/build/publish/version-check/test) stays workspace-only.
	'scripts/install-static-tools.js', // hooks.json SessionStart (cross-platform)
	'scripts/install-static-tools.sh', // retained for direct POSIX use
	'CHANGELOG.md',
	'CHANGELOG-HISTORY.md',
	'README.md',
];

// tool 안 node_modules / 임시 출력 등 명시 제외 (cpSync filter)
const EXCLUDE_BASENAMES = new Set([
	'node_modules',
	'.git',
	'.github',
	'.claude',
	'out',
	'.npmrc',
	// cleanup round 2-A — workspace developer only (plugin user runtime 호출 path 0)
	'test',
	'tests',
	'__tests__',
	'corpus',
	'fixtures',
	'coverage',
]);

// v1.4.3 follow-up F1 fix — templates/adoption/ 은 dist root 의 CLAUDE.md + ADOPTION-README.md 로 별칭 복사됨 / 원본은 dist 에서 제외 의무
// (Agent 4 발견 — 의도 명세에 명시되었으나 walk() 가 templates/ 통째로 복사하면서 templates/adoption/ 까지 포함되는 bug)
const EXCLUDE_REL_PATHS = new Set([
	join('templates', 'adoption').replaceAll(sep, '/'), // POSIX-style for compare
]);

// Official 보강 — Windows long-path (>260) 검증
const WINDOWS_PATH_LIMIT = 260;

function readPluginVersion(workspace) {
	const pluginJsonPath = join(workspace, '.claude-plugin', 'plugin.json');
	const data = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));
	// semver pre-release tag (e.g. 2.0.0-rc1) 허용 — sub-plan-6 v2.0.0-rc1 정합
	if (
		!data.version ||
		!/^\d+\.\d+\.\d+(-[A-Za-z0-9.-]+)?$/.test(data.version)
	) {
		throw new Error(`invalid plugin.json version: ${data.version}`);
	}
	return data.version;
}

function runVersionCheck(name) {
	// scripts/version-check.js 호출 — 해당 플러그인 plugin.json + CHANGELOG + package.json 정합
	try {
		execSync(
			`node "${join(SCRIPT_DIR, 'version-check.js')}" --plugin ${name}`,
			{
				stdio: 'inherit',
				cwd: REPO_ROOT,
			},
		);
	} catch (err) {
		console.error('[build-plugin] version-check failed — abort.');
		process.exit(1);
	}
}

function* walk(dir, base = dir, includeName = '') {
	const entries = readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (EXCLUDE_BASENAMES.has(entry.name)) continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			// v1.4.3 follow-up F1 fix — INCLUDE 진입점 기준 rel path 가 EXCLUDE_REL_PATHS 매칭 시 skip
			const relFromWorkspace = `${includeName}/${relative(base, full).replaceAll(sep, '/')}`;
			if (EXCLUDE_REL_PATHS.has(relFromWorkspace)) {
				console.log(`[build-plugin] skip excluded path: ${relFromWorkspace}`);
				continue;
			}
			yield* walk(full, base, includeName);
		} else if (entry.isFile()) {
			const rel = relative(base, full).replaceAll(sep, '/');
			yield { full, rel };
		}
	}
}

function checkLongPath(path) {
	if (path.length > WINDOWS_PATH_LIMIT) {
		console.warn(
			`[build-plugin] Windows long-path warning (${path.length} > ${WINDOWS_PATH_LIMIT}): ${path}`,
		);
		return true;
	}
	return false;
}

function sha256(filePath) {
	return new Promise((resolveHash, rejectHash) => {
		const hash = createHash('sha256');
		const stream = createReadStream(filePath);
		stream.on('error', rejectHash);
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolveHash(hash.digest('hex')));
	});
}

async function buildOne(pluginName) {
	const WORKSPACE = pluginDir(pluginName);
	const version = readPluginVersion(WORKSPACE);
	const distRoot = join(REPO_ROOT, 'dist');
	const target = join(distRoot, `${pluginName}-v${version}`);

	console.log(`\n[build-plugin] plugin:    ${pluginName}`);
	console.log(`[build-plugin] workspace: ${WORKSPACE}`);
	console.log(`[build-plugin] target:    ${target}`);
	console.log(
		`[build-plugin] mode:      ${DRY_RUN ? 'dry-run (--check)' : 'build'}`,
	);

	// Senior gate — version-check 강제 (build 첫 step)
	runVersionCheck(pluginName);

	// build self-contained 보장 (Official 보강) — target 이 repo dist 안인지 검증 / ../ 금지
	const rel = relative(REPO_ROOT, target);
	if (rel.startsWith('..') || rel.includes(`..${sep}`)) {
		throw new Error(`[build-plugin] target outside repo — abort: ${target}`);
	}

	// 기존 target 정리 (stale 방지)
	if (!DRY_RUN && existsSync(target)) {
		rmSync(target, { recursive: true, force: true });
	}
	if (!DRY_RUN) mkdirSync(target, { recursive: true });

	let fileCount = 0;
	let longPathCount = 0;
	const checksumEntries = [];

	for (const item of INCLUDE) {
		const src = join(WORKSPACE, item);
		if (!existsSync(src)) {
			console.warn(`[build-plugin] skip — source missing: ${item}`);
			continue;
		}
		const dst = join(target, item);
		const st = statSync(src);

		if (st.isFile()) {
			if (!DRY_RUN) {
				try {
					cpSync(src, dst);
				} catch (err) {
					console.error(
						`[build-plugin] cpSync failed for ${item}: ${err.message}`,
					);
					throw err;
				}
			}
			fileCount++;
			if (checkLongPath(dst)) longPathCount++;
			if (!DRY_RUN) checksumEntries.push({ rel: item, full: dst });
			continue;
		}

		// 디렉토리 — walk 로 파일 단위 복사 (EXCLUDE_BASENAMES + EXCLUDE_REL_PATHS 적용)
		for (const { full: srcFile, rel: relPath } of walk(src, src, item)) {
			const dstFile = join(dst, relPath);
			if (!DRY_RUN) {
				mkdirSync(resolve(dstFile, '..'), { recursive: true });
				try {
					cpSync(srcFile, dstFile);
				} catch (err) {
					console.error(
						`[build-plugin] cpSync failed for ${join(item, relPath)}: ${err.message}`,
					);
					throw err;
				}
			}
			fileCount++;
			if (checkLongPath(dstFile)) longPathCount++;
			if (!DRY_RUN)
				checksumEntries.push({
					rel: join(item, relPath).replaceAll(sep, '/'),
					full: dstFile,
				});
		}
	}

	// Agent 4 발견 반영 — templates/adoption/ 의 CLAUDE.md 를 dist root 로 별칭 복사
	// (사내 적용 진입점 — build script 가 dist 자체에 customization 노출)
	// cleanup round 2-A — ADOPTION-README.md 별칭 복사 비활성 (단일 entry-point 정합 / dist 본체 README.md 만 / 사용자 결단 (a) 정합)
	if (!DRY_RUN) {
		const adoptionClaude = join(
			WORKSPACE,
			'templates',
			'adoption',
			'CLAUDE.md',
		);
		if (existsSync(adoptionClaude)) {
			const dst = join(target, 'CLAUDE.md');
			cpSync(adoptionClaude, dst);
			checksumEntries.push({ rel: 'CLAUDE.md', full: dst });
			fileCount++;
		}
	}

	// Industry 보강 2 — CHECKSUMS.txt SHA256 manifest (Shopify CLI v3.50+)
	// v1.4.3 follow-up F2 fix — sort 을 rel path 기반으로 (supply chain 관행 / 사람 inspect 친화 / hash 기반 ❌)
	if (!DRY_RUN && checksumEntries.length > 0) {
		const sorted = [...checksumEntries].sort((a, b) =>
			a.rel.localeCompare(b.rel),
		);
		const lines = [];
		for (const { rel, full } of sorted) {
			const hex = await sha256(full);
			lines.push(`${hex}  ${rel}`);
		}
		writeFileSync(
			join(target, 'CHECKSUMS.txt'),
			lines.join('\n') + '\n',
			'utf-8',
		);
		fileCount++;
	}

	console.log(
		`\n[build-plugin] ${DRY_RUN ? 'would copy' : 'copied'}: ${fileCount} files`,
	);
	if (longPathCount > 0) {
		console.warn(`[build-plugin] Windows long-path warnings: ${longPathCount}`);
	}
	if (!DRY_RUN) {
		console.log(`[build-plugin] CHECKSUMS.txt written (SHA256 manifest)`);
		console.log(`[build-plugin] artifact root: ${target}`);
	}
}

async function main() {
	const targets = resolveTargets(process.argv.slice(2));
	for (const name of targets) {
		await buildOne(name);
	}
	console.log(
		`\n[build-plugin] ✅ ${DRY_RUN ? 'would build' : 'built'} ${targets.length} plugin(s): ${targets.join(', ')}`,
	);
}

main().catch((err) => {
	console.error('[build-plugin] failed:', err);
	process.exit(1);
});

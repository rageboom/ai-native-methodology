// _plugins.js — 모노레포 플러그인 발견 + CLI 타깃 해석 (build/publish/version-check/release-readiness/build-catalog 공유)
//
// 멀티 플러그인 전환(plugins/* 모노레포) 공통 helper. 각 dev 스크립트는 scripts/ 로 승격되어
// SCRIPT_DIR=repo-root/scripts / REPO_ROOT=repo-root / 플러그인 dir = REPO_ROOT/plugins/<name>.
//
// 타깃 해석 규칙:
//   --all              → plugins/ 아래 모든 플러그인
//   --plugin <name>    → 해당 1개
//   <bare positional>  → 해당 1개 (value-flag 의 값은 positional 로 오인하지 않음)
//   (없음)             → 플러그인이 정확히 1개면 그것, 아니면 에러(모호)

import { readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = resolve(fileURLToPath(import.meta.url), '..');
export const REPO_ROOT = resolve(SCRIPT_DIR, '..');
export const PLUGINS_DIR = join(REPO_ROOT, 'plugins');

/** plugins/ 아래 .claude-plugin/plugin.json 을 가진 디렉토리 이름 목록 (정렬). */
export function listPlugins() {
	if (!existsSync(PLUGINS_DIR)) return [];
	return readdirSync(PLUGINS_DIR, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => e.name)
		.filter((name) =>
			existsSync(join(PLUGINS_DIR, name, '.claude-plugin', 'plugin.json')),
		)
		.sort();
}

/** 플러그인 절대 경로 (구 WORKSPACE/ROOT 와 동일 의미). */
export function pluginDir(name) {
	return join(PLUGINS_DIR, name);
}

/**
 * CLI argv → 대상 플러그인 이름 배열.
 * @param {string[]} argv  process.argv.slice(2)
 * @param {string[]} valueFlags  값을 소비하는 플래그(예: ['--registry']) — positional 오인 방지
 */
export function resolveTargets(argv, valueFlags = []) {
	const all = listPlugins();

	if (argv.includes('--all')) {
		if (!all.length) throw new Error('[plugins] plugins/ 아래 플러그인 없음');
		return all;
	}

	const pIdx = argv.indexOf('--plugin');
	if (pIdx !== -1) {
		const name = argv[pIdx + 1];
		if (!name || name.startsWith('--'))
			throw new Error('[plugins] --plugin <name> 값 필요');
		assertExists(name, all);
		return [name];
	}

	// bare positional (value-flag 의 값은 건너뜀)
	const vf = new Set(['--plugin', ...valueFlags]);
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith('--')) {
			if (vf.has(a)) i++; // 다음 토큰은 이 플래그의 값
			continue;
		}
		assertExists(a, all);
		return [a];
	}

	// 기본값 — 플러그인이 정확히 1개면 그것
	if (all.length === 1) return all;
	throw new Error(
		`[plugins] 플러그인 지정 필요: --plugin <name> 또는 --all (발견: ${all.join(', ') || '없음'})`,
	);
}

function assertExists(name, all) {
	if (!all.includes(name)) {
		throw new Error(
			`[plugins] 플러그인 '${name}' 없음 (plugins/ 발견: ${all.join(', ') || '없음'})`,
		);
	}
}

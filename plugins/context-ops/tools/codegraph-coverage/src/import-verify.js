// import-verify.js — F-DOGFOOD-013: module dependency hole 의 "이름-해석 의심" 결정론 분류.
//
//   배경 (ep-fe-mis 멀티앱 모노레포 dogfood 실측): codegraph OSS 는 local binding 추적이
//   불가한 호출(hook 반환 구조분해 등)을 **이름 기반 전역 룩업**으로 해소한다 —
//   ① 진짜 정의가 인덱스 밖(클로저·메서드·node_modules)이고 ② 다른 파일에 동명
//   top-level 노드가 있으면 그쪽으로 오연결 (unresolved_refs 는 비어있음 = 미해석 보관 ❌).
//   실측: 앱 간 불가능 엣지 5,050개 (openCommonToastbar 단독 1,115 / useHttpClient 554 —
//   동명 정의 16개 중 오선택 / MUI 동명 래퍼 TextField·Dialog 류).
//
//   해결 층위: codegraph(외부 OSS) 인덱서는 소관 밖 — 본 모듈이 rollup 결과의 각 hole 에
//   "source 파일에 target 파일로 실제 도달하는 import 가 존재하는가"를 **결정론 검증**해
//   `import_verified` 로 분류한다. reference-lens 정신 = 제거 ❌ / 분리 표기
//   (unverified = 이름-해석 의심 → finding 채널 미진입 / report 에는 정직 잔존).
//
//   해석 경로 3종 (전부 결정론 / LLM ❌):
//     (1) 상대경로  './x' '../x'  → source dir 기준 resolve + 확장자/index probing
//     (2) tsconfig paths alias    → source 에서 상향 탐색한 가장 가까운 tsconfig.json 의
//                                   compilerOptions.paths ('@/*' 등 단일-'*' 패턴 / tsconfig dir 기준)
//     (3) workspace 패키지명      → apps/*·packages/* 의 package.json name → 디렉토리 매핑
//                                   (spec 이 그 이름으로 시작하면 target 이 그 디렉토리 안일 때 도달)
//   한계 (정직): tsconfig extends 체인의 paths 상속·exports map·심볼릭 re-export 체인은
//   미해석 → 미도달로 분류될 수 있음 (false-unverified 방향 = 안전 / verified 주장만 강함).

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';

const EXT_PROBES = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const INDEX_PROBES = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];

// repo-relative 정규화 (posix 구분자).
function toRepoRel(repoRoot, absPath) {
	return relative(repoRoot, absPath).split(sep).join('/');
}

// import specifier 추출 — static import / re-export / dynamic import / require.
export function parseImportSpecifiers(content) {
	const specs = new Set();
	const patterns = [
		/(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/g,
		/(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g, // side-effect import
		/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // dynamic import
		/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
	];
	for (const re of patterns) {
		let m;
		while ((m = re.exec(content)) !== null) specs.add(m[1]);
	}
	return [...specs];
}

// 파일 후보 probing — base 그대로 / 확장자 / index 파일.
function probeFile(absBase) {
	for (const ext of EXT_PROBES) {
		const p = absBase + ext;
		try {
			if (statSync(p).isFile()) return p;
		} catch {
			/* 다음 probe */
		}
	}
	for (const idx of INDEX_PROBES) {
		const p = join(absBase, idx);
		try {
			if (statSync(p).isFile()) return p;
		} catch {
			/* 다음 probe */
		}
	}
	return null;
}

export function createImportVerifier(repoRoot) {
	const root = resolve(repoRoot);
	const importsCache = new Map(); // srcAbs -> string[] specs
	const tsconfigCache = new Map(); // dirAbs -> {dir, paths} | null

	// workspace 패키지명 → repo-relative 디렉토리 (1회 스캔 / 결정론).
	const pkgNameToDir = new Map();
	for (const bucket of ['packages', 'apps']) {
		const bdir = join(root, bucket);
		if (!existsSync(bdir)) continue;
		for (const e of readdirSync(bdir, { withFileTypes: true })) {
			if (!e.isDirectory()) continue;
			const pj = join(bdir, e.name, 'package.json');
			try {
				const name = JSON.parse(readFileSync(pj, 'utf-8')).name;
				if (typeof name === 'string' && name)
					pkgNameToDir.set(name, bucket + '/' + e.name);
			} catch {
				/* package.json 부재/파손 — skip */
			}
		}
	}

	// source 파일에서 상향 탐색 — compilerOptions.paths 를 가진 가장 가까운 tsconfig.
	function nearestTsconfigPaths(srcAbsDir) {
		let dir = srcAbsDir;
		const visited = [];
		while (dir.startsWith(root)) {
			if (tsconfigCache.has(dir)) {
				const hit = tsconfigCache.get(dir);
				for (const v of visited) tsconfigCache.set(v, hit);
				return hit;
			}
			visited.push(dir);
			const tc = join(dir, 'tsconfig.json');
			if (existsSync(tc)) {
				try {
					// tsconfig 는 주석 허용(jsonc) — 라인/블록 주석 제거 후 파싱 (결정론 / 단순 케이스).
					const raw = readFileSync(tc, 'utf-8')
						.replace(/\/\*[\s\S]*?\*\//g, '')
						.replace(/^\s*\/\/.*$/gm, '');
					const j = JSON.parse(raw);
					const paths = j?.compilerOptions?.paths;
					if (paths && typeof paths === 'object') {
						const hit = { dir, paths, baseUrl: j?.compilerOptions?.baseUrl ?? '.' };
						for (const v of visited) tsconfigCache.set(v, hit);
						return hit;
					}
				} catch {
					/* 파싱 불가 — 상위로 (extends-only tsconfig 등) */
				}
			}
			const parent = dirname(dir);
			if (parent === dir) break;
			dir = parent;
		}
		for (const v of visited) tsconfigCache.set(v, null);
		return null;
	}

	function specsOf(srcAbs) {
		let specs = importsCache.get(srcAbs);
		if (specs == null) {
			try {
				specs = parseImportSpecifiers(readFileSync(srcAbs, 'utf-8'));
			} catch {
				specs = [];
			}
			importsCache.set(srcAbs, specs);
		}
		return specs;
	}

	/**
	 * source 파일(repo-relative)에 target 파일(repo-relative)로 도달하는 import 가 있는가.
	 * @returns {boolean}
	 */
	function verifyPair(sourceFile, targetFile) {
		const srcAbs = join(root, sourceFile);
		const specs = specsOf(srcAbs);
		if (specs.length === 0) return false;
		const srcDir = dirname(srcAbs);

		for (const spec of specs) {
			// (1) 상대경로
			if (spec.startsWith('./') || spec.startsWith('../')) {
				const hit = probeFile(resolve(srcDir, spec));
				if (hit && toRepoRel(root, hit) === targetFile) return true;
				continue;
			}
			// (3) workspace 패키지명 (디렉토리-level 도달 — 패키지 내부 어디든)
			for (const [name, dir] of pkgNameToDir) {
				if (spec === name || spec.startsWith(name + '/')) {
					if (targetFile === dir || targetFile.startsWith(dir + '/')) return true;
				}
			}
			// (2) tsconfig paths alias (단일-'*' 패턴)
			const tcfg = nearestTsconfigPaths(srcDir);
			if (tcfg) {
				for (const [pattern, targets] of Object.entries(tcfg.paths)) {
					const star = pattern.indexOf('*');
					let rest = null;
					if (star >= 0) {
						const prefix = pattern.slice(0, star);
						const suffix = pattern.slice(star + 1);
						if (spec.startsWith(prefix) && spec.endsWith(suffix)) {
							rest = spec.slice(prefix.length, spec.length - suffix.length);
						}
					} else if (spec === pattern) {
						rest = '';
					}
					if (rest == null) continue;
					for (const t of Array.isArray(targets) ? targets : []) {
						const mapped = t.includes('*') ? t.replace('*', rest) : t;
						const baseAbs = resolve(tcfg.dir, tcfg.baseUrl, mapped);
						const hit = probeFile(baseAbs);
						if (hit && toRepoRel(root, hit) === targetFile) return true;
					}
				}
			}
		}
		return false;
	}

	return { verifyPair };
}

/**
 * module axis 의 holes[] 에 import_verified 를 annotate (내부 file_pairs 소비 후 제거).
 *   repoRoot 부재(--db 단독 모드) = status 'skipped' + file_pairs 제거만 (정직 표기).
 *   mutates moduleAxis (cli 레이어 전용 — buildCoverage 순수성 비침범).
 */
export function annotateImportVerification(moduleAxis, repoRoot) {
	if (!moduleAxis || !Array.isArray(moduleAxis.holes)) return;
	const strip = (h) => {
		delete h.file_pairs;
		delete h.file_pairs_truncated;
	};
	if (!repoRoot) {
		for (const h of moduleAxis.holes) strip(h);
		moduleAxis.import_verification = {
			status: 'skipped',
			note: '--target(repo root) 부재 — import 도달 검증 불가 (이름-해석 의심 분류 생략 / 정직 표기)',
		};
		return;
	}
	const verifier = createImportVerifier(repoRoot);
	let verified = 0,
		unverified = 0;
	for (const h of moduleAxis.holes) {
		const pairs = Array.isArray(h.file_pairs) ? h.file_pairs : [];
		let ok = false;
		for (const p of pairs) {
			if (verifier.verifyPair(p.source_file, p.target_file)) {
				ok = true;
				break;
			}
		}
		h.import_verified = ok;
		if (ok) verified++;
		else unverified++;
		strip(h);
	}
	moduleAxis.import_verification = {
		status: 'done',
		verified,
		unverified,
	};
}

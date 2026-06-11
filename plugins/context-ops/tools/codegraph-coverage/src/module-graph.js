// module-graph.js — codegraph wiring STEP 3 (DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 3 / 순수 / I/O 없음).
//   "dependency coverage-hole / 결정론 corroboration lens" 의 rollup 엔진 (research 수렴 / Senior 0.85 REVISE → 1축).
//     codegraph cross-file edge(calls/references/instantiates/extends/implements) 를 architecture.json modules[] 로 file→module rollup
//     → module→module 의존 그래프 → arch.json dependencies[] 와 set-diff.
//   trust 경계 (불변 / DEC §2):
//     · 안전 방향 = coverage-hole (codegraph有 / arch.json無) — "LLM 이 놓친 결정론 의존" (route/method axis set-diff 동형).
//     · 위험 방향 = onlyArch (arch.json有 / codegraph無) = codegraph 사각(런타임 DI/decorator/config 와이어링).
//       부재 ≠ 거짓 → informational_notes (severity 필드 부재 / hole 아님 / finding 채널 절대 진입 ❌). Senior must-fix#3 + industry FP#6.
//   imports edge 는 명시 제외 — target file_path=importing 파일 placeholder (실측) → module rollup 부적합 (Senior must-fix#2 / industry 정합).
//   module-SCC cycle / layer-violation = STEP 3 범위 밖 (carry STEP4+ / blob over-claim·LLM layer 비결정 입력 / DEC §11).

import { normalizeFile } from './normalize.js';
import { isTestFile } from './filters.js';

// rollup 대상 edge kind — cross-file 구조 의존 (imports 제외 / 실측 100% 양끝 AST 해소).
export const MODULE_EDGE_KINDS = Object.freeze([
	'calls',
	'references',
	'instantiates',
	'extends',
	'implements',
]);

// 선행 source-root(src/ 등) 차이를 흡수한 file→module 디렉토리 포함 판정.
//   normalize.js fileMatches(파일-vs-파일 suffix) 철학을 디렉토리-prefix 포함으로 확장 (must-fix#4 / src-prefix 정규화 통일).
//   RealWorld(둘 다 repo-relative / startsWith) + ecommerce(codegraph=src-relative / arch=src-prefix / leading strip) 2-도메인 동일 코드경로.
export function fileInModule(codeFile, modulePath) {
	const nf = normalizeFile(codeFile);
	const nm = normalizeFile(modulePath).replace(/\/+$/, '');
	if (!nf || !nm) return false;
	// (1) module path 가 file 의 선행 디렉토리 (둘 다 repo-relative — RealWorld).
	if (nf === nm || nf.startsWith(nm + '/')) return true;
	// (2) module path 가 file 경로 안에 '/'-경계 디렉토리로 등장 (file 쪽에 extra root).
	if (('/' + nf).includes('/' + nm + '/')) return true;
	// (3) module path 에 extra leading root(src/ 등)가 있고 file 엔 없음 — leading 세그먼트 점진 strip 후 prefix 재시도 (ecommerce).
	const mSegs = nm.split('/').filter(Boolean);
	for (let i = 1; i < mSegs.length; i++) {
		const tail = mSegs.slice(i).join('/');
		if (tail && (nf === tail || nf.startsWith(tail + '/'))) return true;
	}
	return false;
}

// file → module id (longest module path 우선 = most-specific). 미매핑 = null.
export function mapFileToModule(codeFile, sortedModules) {
	for (const m of sortedModules) {
		if (m.path && fileInModule(codeFile, m.path)) return m.id;
	}
	return null;
}

// modules[] 를 path 길이 desc 정렬 (most-specific 우선). 입력 불변.
function sortModules(modules) {
	return [...(modules || [])]
		.filter((m) => m && typeof m.id === 'string' && typeof m.path === 'string')
		.sort(
			(a, b) => normalizeFile(b.path).length - normalizeFile(a.path).length,
		);
}

/**
 * cross-file edge 들을 module→module 그래프로 rollup. 결정론 (순수).
 *   codegraph modules[] 정의는 입력 그대로 bucket 으로 사용 (LLM 판정 inject 아님 — arch.json 의 자기 모듈 경계로 codegraph edge 를 집계).
 * @param {Object<string,Array>} edgesByKind  enumerateEdges 결과 byKind (MODULE_EDGE_KINDS)
 * @param {Array<{id,path,layer?}>} modules    architecture.json modules[]
 * @returns {{pairs:Map<string,{from,to,weight,sample_file,edge_kinds:Set}>, stats:{cross_file,test_skipped,unmapped,intra_module}}}
 */
// F-DOGFOOD-013 — module-pair 당 보존하는 distinct 기여 file-pair 상한.
//   import-verify(이름-해석 의심 분류)의 검사 표본 — 거대 pair(weight 수천)의 메모리 폭증 방지.
//   상한 도달 = file_pairs_truncated 정직 표기 (검증은 "≥1 도달" 판정이라 표본으로 충분).
export const FILE_PAIRS_CAP = 100;

export function rollupModuleEdges(edgesByKind = {}, modules = []) {
	const sorted = sortModules(modules);
	const pairs = new Map(); // "from|to" -> {from,to,weight,sample_file,edge_kinds:Set,file_pairs:Map,file_pairs_truncated}
	let crossFile = 0,
		testSkipped = 0,
		unmapped = 0,
		intraModule = 0;

	for (const kind of MODULE_EDGE_KINDS) {
		for (const e of edgesByKind[kind] || []) {
			const sf = e?.source?.file;
			const tf = e?.target?.file;
			if (!sf || !tf) continue;
			const nsf = normalizeFile(sf),
				ntf = normalizeFile(tf);
			if (!nsf || !ntf || nsf === ntf) continue; // 같은 파일 = cross-file 아님.
			crossFile++;
			if (isTestFile(nsf) || isTestFile(ntf)) {
				testSkipped++;
				continue;
			}
			const a = mapFileToModule(nsf, sorted);
			const b = mapFileToModule(ntf, sorted);
			if (!a || !b) {
				unmapped++;
				continue;
			}
			if (a === b) {
				intraModule++;
				continue;
			}
			const key = a + '|' + b;
			let rec = pairs.get(key);
			if (!rec) {
				rec = {
					from: a,
					to: b,
					weight: 0,
					sample_file: nsf,
					edge_kinds: new Set(),
					// F-DOGFOOD-013 — import-verify 입력 (distinct source→target file pair / 순수 수집).
					file_pairs: new Map(),
					file_pairs_truncated: false,
				};
				pairs.set(key, rec);
			}
			rec.weight++;
			rec.edge_kinds.add(kind);
			const fpKey = nsf + '|' + ntf;
			if (!rec.file_pairs.has(fpKey)) {
				if (rec.file_pairs.size < FILE_PAIRS_CAP) {
					rec.file_pairs.set(fpKey, { source_file: nsf, target_file: ntf });
				} else {
					rec.file_pairs_truncated = true;
				}
			}
		}
	}
	return {
		pairs,
		stats: {
			cross_file: crossFile,
			test_skipped: testSkipped,
			unmapped,
			intra_module: intraModule,
		},
	};
}

// architecture.json dependencies[] → "from|to" Set (정규화).
function archDepKeySet(dependencies = []) {
	const s = new Set();
	for (const d of dependencies) {
		if (d && typeof d.from === 'string' && typeof d.to === 'string')
			s.add(d.from + '|' + d.to);
	}
	return s;
}

/**
 * codegraph rollup pair ∖ arch.json dependencies[] set-diff.
 *   holes = codegraph有/arch無 (LLM 놓친 결정론 의존 = coverage-hole / 안전).
 *   informational_notes = arch有/codegraph無 (codegraph 사각 = 부재≠거짓 / severity 부재 / finding 아님).
 * @param {Map} pairs  rollupModuleEdges().pairs
 * @param {Array} dependencies  architecture.json dependencies[]
 */
export function diffModuleDeps(pairs, dependencies = []) {
	const archKeys = archDepKeySet(dependencies);
	const cgKeys = new Set(pairs.keys());
	const holes = [];
	let corroborated = 0;
	for (const [key, rec] of pairs) {
		if (archKeys.has(key)) {
			corroborated++;
			continue;
		}
		holes.push({
			from: rec.from,
			to: rec.to,
			weight: rec.weight,
			edge_kinds: [...rec.edge_kinds].sort(),
			sample_file: rec.sample_file,
			// F-DOGFOOD-013 — import-verify 내부 입력 (report 직전 annotate 단계가 소비 후 제거 / 출력 비포함).
			file_pairs: [...rec.file_pairs.values()],
			file_pairs_truncated: rec.file_pairs_truncated,
		});
	}
	// arch.json 이 선언했으나 codegraph 가 못 본 의존 = 정직 사각 (informational only).
	const informational = [];
	for (const d of dependencies) {
		if (!d || typeof d.from !== 'string' || typeof d.to !== 'string') continue;
		if (!cgKeys.has(d.from + '|' + d.to)) {
			informational.push({
				from: d.from,
				to: d.to,
				...(d.type ? { type: d.type } : {}),
			});
		}
	}
	holes.sort((a, b) => (a.from + a.to).localeCompare(b.from + b.to));
	informational.sort((a, b) => (a.from + a.to).localeCompare(b.from + b.to));
	return {
		total: cgKeys.size, // codegraph 결정론 module 의존 수 (coverage 분모)
		covered: corroborated, // arch.json 이 이미 문서화 (corroborated)
		holes, // LLM 놓침 = coverage-hole
		informational_notes: informational, // codegraph 사각 = 부재≠거짓 (severity 부재)
	};
}

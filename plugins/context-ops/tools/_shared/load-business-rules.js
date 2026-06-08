// load-business-rules.js — 공용 business-rules 로더 (BR-split STEP 2 / v0.4.0)
// SSOT: decisions/DEC-2026-06-07-br-split-step2.md / plan-br-split.md §8.5
//
// 목적: business-rules 의 (1) 파일위치 resolve + (2) shape 추출을 _shared 로 중앙화.
//   - canonical output reader(br-cross / context-federator / traceability-graph) = strict
//     normalizeBusinessRules (오직 `{ business_rules: [...] }` / v5.0.0 alias hard-kill 정합).
//   - discovery-extraction-validator = analysis-stage raw 객체(다양 provenance) →
//     normalizeAnalysisBusinessRules (4 legacy shape + mis-fire 신호).
//   - STEP 3(포맷 분할 = index + per-BC / v0.24.0) 시행: loadBusinessRules 가 index
//     (`{bc_files:[...]}`)를 감지해 per-BC sibling 을 재조립 = single-point. index 는
//     파일명 business-rules.json 유지(plan §2.1)이므로 기존 existsSync/basename 매핑 무영향.
//     옛 단일파일 `{business_rules:[...]}` 은 backward-compat 으로 계속 수용(시점기록 예제).

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

export const BUSINESS_RULES_FILENAME = 'business-rules.json';
// STEP 3 (BR-split) — index 의 per-BC leaf 가 사는 서브디렉토리(index 파일 dir 기준 상대).
export const BUSINESS_RULES_DIR = 'business-rules';

/**
 * parsed 가 분할 index 인지 판별 (STEP 3). index = `{ bc_files: [...] }`.
 * 옛 단일파일 `{ business_rules: [...] }` 과 disjoint(required 키 상이).
 * @param {object|null} parsed
 * @returns {boolean}
 */
export function isBusinessRulesIndex(parsed) {
	return !!parsed && Array.isArray(parsed.bc_files);
}

// fail-closed JSON reader (defaultReadJson 컨벤션 동형 / read·parse 실패 = null).
function defaultReadJson(path) {
	try {
		return JSON.parse(readFileSync(path, 'utf-8'));
	} catch {
		return null;
	}
}

/**
 * strict canonical 추출 — 오직 top-level `{ business_rules: [...] }`.
 * v5.0.0(DEC-2026-05-17-q1-alias-4중첩-폐기) alias hard-kill 정합: `rules` /
 * `rules_manual_authored` 등 alias 는 의도적 미수용(canonical output reader 전용).
 * STEP 3 = 이 함수가 index/per-BC 를 이해하도록 확장하는 단일 지점은 loadBusinessRules
 * (dir context 필요) 이며, 본 함수는 이미-파싱된 canonical 객체 전용으로 유지.
 * @param {object|null} parsed
 * @returns {Array} business_rules (없으면 [])
 */
export function normalizeBusinessRules(parsed) {
	return Array.isArray(parsed?.business_rules) ? parsed.business_rules : [];
}

// analysis-stage raw 객체가 BR 을 담을 수 있는 알려진 container 키 (present 판별용).
const ANALYSIS_BR_CONTAINER_KEYS = [
	'rules', // rules:[...] 또는 rules:{business_rules:[...]}
	'business_rules',
	'rules_step_4c_carcost',
];

/**
 * analysis-stage raw 객체에서 BR 추출 (discovery-extraction-validator 전용).
 * v11.5.1 multi-path BR lookup(LL-validator-dual-key-02)의 4 shape 를 중앙화 +
 * mis-fire 신호(blocker #1) 추가.
 *
 * mis-fire 판별(plan §8.5 정정 2): 알려진 BR-container 키가 present 인데 id 보유 BR
 * 0건일 때만 unrecognizedShape=true (= malformed/미인식 shape). container 키 자체가
 * 부재면 정당한 "BR 0건"(예: 순수 계산 lib) → unrecognizedShape=false (오탐 회피).
 * @param {object|null} analysis
 * @returns {{ rules: Array, unrecognizedShape: boolean }}
 */
export function normalizeAnalysisBusinessRules(analysis) {
	const candidates = [
		analysis?.rules?.business_rules, // backward-compat (v11.0.0~v11.5.0)
		analysis?.business_rules, // top-level array (poc-17 chain 1 normalize)
		analysis?.rules, // top-level rules array (analysis baseline)
		analysis?.rules_step_4c_carcost, // dual key (poc-17 Phase 4c)
	];
	const rules = [];
	for (const arr of candidates) {
		if (Array.isArray(arr)) {
			for (const br of arr) {
				if (br?.id) rules.push(br);
			}
		}
	}
	const containerPresent =
		analysis && typeof analysis === 'object'
			? ANALYSIS_BR_CONTAINER_KEYS.some((k) => analysis[k] !== undefined)
			: false;
	const unrecognizedShape = containerPresent && rules.length === 0;
	return { rules, unrecognizedShape };
}

/**
 * 분할 index 의 per-BC leaf 들을 재조립해 전체 rule 배열 반환 (STEP 3).
 * index 의 bc_files[].file = index 파일 dir 기준 상대경로(예: `business-rules/BC-AUTH.json`).
 * per-BC blob 부재/파싱실패 = 그 BC skip(부분 로드 / 날조 ❌).
 * @param {object} indexParsed — `{ bc_files: [...] }`
 * @param {string} indexDir — index 파일이 있는 디렉토리
 * @param {(p:string)=>object|null} readJson — 주입 reader(seam 보존)
 * @returns {Array} 전체 business_rules
 */
function reassembleFromIndex(indexParsed, indexDir, readJson) {
	const rules = [];
	for (const entry of indexParsed.bc_files) {
		if (!entry || typeof entry.file !== 'string') continue;
		const perBc = readJson(join(indexDir, entry.file));
		for (const r of normalizeBusinessRules(perBc)) rules.push(r);
	}
	return rules;
}

/**
 * canonical business-rules 를 파일/디렉토리에서 로드.
 * @param {string} target — business-rules.json 파일 경로 OR 디렉토리(canonical 파일명 resolve).
 * @param {object} [opts]
 * @param {(p:string)=>object|null} [opts.readJson] — 주입 reader(context-federator testability seam 보존).
 * @param {(br:object)=>boolean} [opts.bcFilter] — bounded_context scope 슬라이스 술어(선택).
 * @returns {Array} business_rules (없거나 실패 시 [])
 *
 * STEP 3: parsed 가 index(`{bc_files:[...]}`) 면 dir 의 per-BC sibling 을 재조립 = single-point.
 * 옛 단일파일 `{business_rules:[...]}` 은 backward-compat 으로 그대로 수용(시점기록 예제 보존).
 */
export function loadBusinessRules(target, opts = {}) {
	const { readJson = defaultReadJson, bcFilter = null } = opts;
	if (!target) return [];
	// 1차: target 을 파일 경로로 read (federator 처럼 .json 경로 / 주입 readJson seam).
	let parsed = readJson(target);
	let resolvedPath = target;
	// 파일이 아니면(dir 등) canonical 파일명 결합 재시도.
	if (parsed === null && !target.endsWith('.json')) {
		resolvedPath = join(target, BUSINESS_RULES_FILENAME);
		parsed = readJson(resolvedPath);
	}
	let rules;
	if (isBusinessRulesIndex(parsed)) {
		// index → per-BC 재조립 (resolvedPath 는 이 시점에 항상 index 파일 경로).
		rules = reassembleFromIndex(parsed, dirname(resolvedPath), readJson);
	} else {
		rules = normalizeBusinessRules(parsed); // 옛 단일파일 backward-compat
	}
	if (typeof bcFilter === 'function') rules = rules.filter(bcFilter);
	return rules;
}

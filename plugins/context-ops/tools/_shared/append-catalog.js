// append-catalog.js — 공용 카탈로그 append/upsert writer (multi-BC / 2-zone)
// SSOT: decisions/DEC-2026-06-12-resve-multidomain-corroboration.md §F-1
//
// 목적: load-business-rules.js(reader / index→per-BC leaf 재조립)의 **writer 짝**.
//   다중 BC 분석이 같은 공유 카탈로그(domain.json bounded_contexts[] · business-rules.json
//   index bc_files[] · migration-cautions.json caution_groups[])에 누적될 때, 각 BC 가
//   **자기 엔트리만 upsert(키 일치 시 교체, 아니면 append)** 하고 **sibling BC 를 보존**하도록
//   결정론적으로 처리한다. 단일-BC(golf/event) 에선 안 드러났던 writer 비대칭 해소.
//
//   no-simulation: append 가 LLM "기존 거 잘 보존해서 다시 써줘" 판단이 아니라 결정론 upsert.
//   indent 보존: 기존 파일 들여쓰기를 감지해 그대로 재직렬화 → 전-파일 reformat 가짜 diff 차단
//     (append-only 머지 약속 보존 / 병렬 CLI·worktree 충돌면 최소화).

import { readFileSync, writeFileSync } from 'node:fs';

/**
 * JSON 텍스트의 들여쓰기 단위 감지 (top-level 키 한 단계 깊이 = 1 unit).
 * 2-space → 2 / tab → '\t' / 감지 불가(한 줄 등) → 2(기본).
 * @param {string} text
 * @returns {number|string} JSON.stringify 의 space 인자로 그대로 사용 가능
 */
export function detectIndent(text) {
	const m = typeof text === 'string' ? text.match(/\n([\t ]+)\S/) : null;
	if (!m) return 2;
	const ws = m[1];
	return ws.includes('\t') ? '\t' : ws.length;
}

/**
 * 배열에 entry 를 idKey 기준 upsert (있으면 in-place 교체 / 없으면 append). sibling 보존.
 * @param {Array} arr
 * @param {object} entry
 * @param {string} idKey
 * @returns {{action:'replaced'|'appended', index:number}}
 */
export function upsertById(arr, entry, idKey) {
	if (!Array.isArray(arr)) throw new TypeError('upsertById: arr must be an array');
	const id = entry == null ? undefined : entry[idKey];
	if (id == null) throw new Error(`upsertById: entry missing key '${idKey}'`);
	const i = arr.findIndex((x) => x && x[idKey] === id);
	if (i >= 0) {
		arr[i] = entry;
		return { action: 'replaced', index: i };
	}
	arr.push(entry);
	return { action: 'appended', index: arr.length - 1 };
}

/**
 * domain.json 의 ubiquitous_language[] 에 additions 를 term 기준 dedup 병합.
 * additions item = {term|term_ko, term_en?, definition?, synonyms?}.
 * @returns {string[]} 실제 추가된 term 목록
 */
export function mergeUbiquitousLanguage(domainObj, additions = []) {
	const ul = (domainObj.ubiquitous_language ??= []);
	const have = new Set(ul.map((e) => e && e.term));
	const added = [];
	for (const a of additions ?? []) {
		const term = a == null ? undefined : a.term ?? a.term_ko;
		if (!term || have.has(term)) continue;
		ul.push({
			term,
			term_en: a.term_en ?? '',
			definition: a.definition ?? '',
			synonyms: a.synonyms ?? [],
		});
		have.add(term);
		added.push(term);
	}
	return added;
}

/**
 * index(business-rules.json) 의 bc_files[] 에 entry(bounded_context 키) upsert + total_rules 재계산.
 *
 * F-finding(rule_count drift): rule_ids[] 가 SSOT 이고 rule_count 는 그 length 의 비정규화 캐시다.
 *   다중 BC 팬아웃에서 LLM 이 rule_count 정수를 손으로 적다 rule_ids.length 와 어긋나는 사례가 반복
 *   관측됨(예: rule_ids 23개인데 rule_count 21 기재 → total_rules 과소집계). 따라서 caller 가 준
 *   rule_count 를 신뢰하지 않고 rule_ids 가 있으면 rule_count := rule_ids.length 로 강제하고,
 *   total_rules 도 entry 별 rule_ids.length 우선(없으면 rule_count fallback)으로 합산해 drift 를
 *   원천 차단한다. rule_ids 부재 entry(레거시/카운트만 가진 entry)는 rule_count 그대로 사용.
 * @returns {{action:string, index:number, total_rules:number}}
 */
export function upsertBcFile(indexObj, entry) {
	indexObj.bc_files ??= [];
	if (entry && Array.isArray(entry.rule_ids)) entry.rule_count = entry.rule_ids.length;
	const r = upsertById(indexObj.bc_files, entry, 'bounded_context');
	indexObj.total_rules = indexObj.bc_files.reduce(
		(s, f) =>
			s +
			(Array.isArray(f && f.rule_ids)
				? f.rule_ids.length
				: Number.isFinite(f && f.rule_count)
					? f.rule_count
					: 0),
		0,
	);
	return { ...r, total_rules: indexObj.total_rules };
}

/** migration-cautions.json 의 caution_groups[] 에 group(title 키) upsert. */
export function upsertCautionGroup(mcObj, group) {
	mcObj.caution_groups ??= [];
	return upsertById(mcObj.caution_groups, group, 'title');
}

// ── I/O (indent 보존) ──────────────────────────────────────────────

export function readJsonWithIndent(path) {
	const text = readFileSync(path, 'utf8');
	return {
		obj: JSON.parse(text),
		indent: detectIndent(text),
		trailingNewline: text.endsWith('\n'),
	};
}

export function writeJsonPreservingIndent(path, obj, indent = 2, trailingNewline = true) {
	writeFileSync(path, JSON.stringify(obj, null, indent) + (trailingNewline ? '\n' : ''));
}

// ── path-based 편의 (read → upsert → indent 보존 write) ─────────────

/** domain.json 에 BC 엔트리 upsert(id) + ubiquitous_language 병합. */
export function appendBoundedContext(domainPath, bcEntry, ulAdditions = []) {
	const { obj, indent, trailingNewline } = readJsonWithIndent(domainPath);
	obj.bounded_contexts ??= [];
	const r = upsertById(obj.bounded_contexts, bcEntry, 'id');
	const addedUl = mergeUbiquitousLanguage(obj, ulAdditions);
	writeJsonPreservingIndent(domainPath, obj, indent, trailingNewline);
	return { ...r, addedUl, indent };
}

/** index business-rules.json 에 bc_files 엔트리 upsert + total_rules 재계산. */
export function appendBcFileToIndex(indexPath, entry) {
	const { obj, indent, trailingNewline } = readJsonWithIndent(indexPath);
	const r = upsertBcFile(obj, entry);
	writeJsonPreservingIndent(indexPath, obj, indent, trailingNewline);
	return { ...r, indent };
}

/** migration-cautions.json 에 caution group upsert(title). */
export function appendCautionGroup(mcPath, group) {
	const { obj, indent, trailingNewline } = readJsonWithIndent(mcPath);
	const r = upsertCautionGroup(obj, group);
	writeJsonPreservingIndent(mcPath, obj, indent, trailingNewline);
	return { ...r, indent };
}

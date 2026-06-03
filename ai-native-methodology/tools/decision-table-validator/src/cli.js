#!/usr/bin/env node
// decision-table-validator CLI — `npx decision-table-validator <dir-or-file.json>`.
// 입력: decision-tables 디렉토리 (또는 단일 .json).
// v12 (json-only / ADR-011) — decision-table = json SSOT. .md 파싱 경로 폐기.
//   json 필드 sanity 검사 (checkJsonSanity). decision_grids[] = 데이터(LLM SSOT) — 자동 DMN 검사 ❌
//   (사람-작성 grid 는 비-UNIQUE-hit-policy / 의도적 wildcard 겹침 → 결정적 DMN conflict/overlap 오발).
//   dmn-check.js (DMN 5종) + parse-md-table.js 는 dormant 유지 (synthetic 단위테스트 / hit_policy='unique' grid 한정 향후 적용).
// 출력: JSON sanity 결과. exit code: 0 / 1 (breaking found).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { checkJsonSanity } from './json-sanity.js';
import {
	readBaseline,
	classifyAgainstBaseline,
	writeBaseline,
	ratchetCheck,
} from '../../_shared/baseline.js';

function findTargets(dir) {
	const out = [];
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const name of entries) {
		const full = join(dir, name);
		let st;
		try {
			st = statSync(full);
		} catch {
			continue;
		}
		if (st.isDirectory()) continue;
		if (extname(name) === '.json') {
			out.push({ jsonPath: full, base: basename(name, '.json') });
		}
	}
	return out;
}

function processOne({ jsonPath, base }) {
	const result = { base, jsonPath, findings: [] };
	let json;
	try {
		json = JSON.parse(readFileSync(jsonPath, 'utf-8'));
	} catch (e) {
		result.findings.push({
			severity: 'breaking',
			kind: 'json.parse-error',
			location: `${base}.json`,
			message: e.message,
		});
		return result;
	}
	const fs = checkJsonSanity(json, jsonPath);
	for (const f of fs) result.findings.push({ ...f, location: `${base}.json` });
	// v12 — decision_grids[] = 데이터 (자동 DMN 검사 ❌). grid 구조는 formal-spec.schema.json 이 강제.
	result.grids_found = Array.isArray(json.decision_grids)
		? json.decision_grids.length
		: 0;
	return result;
}

function summarize(findings) {
	const out = { breaking: 0, 'non-breaking': 0, info: 0 };
	for (const f of findings) out[f.severity] = (out[f.severity] ?? 0) + 1;
	return out;
}

function getArgValue(args, name) {
	const idx = args.indexOf(name);
	if (idx === -1) return null;
	return args[idx + 1];
}

function main() {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		console.error(
			'usage: decision-table-validator <dir-or-file.json> [--json] [--baseline <path>] [--ratchet] [--write-baseline <path>]',
		);
		process.exit(2);
	}
	const target = args[0];
	const jsonOut = args.includes('--json');
	const baselinePath = getArgValue(args, '--baseline');
	const ratchet = args.includes('--ratchet');
	const writeBaselinePath = getArgValue(args, '--write-baseline');

	let st;
	try {
		st = statSync(target);
	} catch {
		console.error(`path not found: ${target}`);
		process.exit(2);
	}
	let targets = [];
	if (st.isDirectory()) {
		targets = findTargets(target);
	} else if (target.endsWith('.json')) {
		targets = [{ jsonPath: target, base: basename(target, '.json') }];
	} else {
		console.error(`unsupported target: ${target} (need dir or .json)`);
		process.exit(2);
	}

	const results = targets.map(processOne);
	const totals = {
		files: results.length,
		breaking: 0,
		'non-breaking': 0,
		info: 0,
	};
	let allFindings = [];
	for (const r of results) {
		const s = summarize(r.findings);
		totals.breaking += s.breaking;
		totals['non-breaking'] += s['non-breaking'];
		totals.info += s.info;
		if (Array.isArray(r.findings)) allFindings.push(...r.findings);
	}

	// ADR-010 baseline + ratchet 처리
	let baselineReport = null;
	if (writeBaselinePath) {
		writeBaseline(writeBaselinePath, allFindings);
		if (!jsonOut)
			console.log(
				`\nbaseline written → ${writeBaselinePath} (${allFindings.length} findings)`,
			);
	}
	if (baselinePath) {
		const baseline = readBaseline(baselinePath);
		const classified = classifyAgainstBaseline(allFindings, baseline);
		if (ratchet) {
			const check = ratchetCheck(classified);
			baselineReport = {
				mode: 'ratchet',
				baseline_path: baselinePath,
				...check,
			};
			if (!jsonOut) {
				console.log(
					`\nbaseline + ratchet — grandfathered: ${check.grandfathered_count} / novel: ${check.novel_count} / blocked: ${check.blocked_count}`,
				);
				if (check.blocked_count > 0) {
					console.log('  blocked findings:');
					for (const f of check.blocked.slice(0, 10)) {
						console.log(
							`    - [${f.severity}] ${f.kind}${f.message ? ' — ' + f.message.slice(0, 80) : ''}`,
						);
					}
				}
			}
		}
	}

	if (jsonOut) {
		console.log(JSON.stringify({ totals, results, baselineReport }, null, 2));
	} else {
		console.log(
			`decision-table-validator — ${results.length} decision-table json file(s)`,
		);
		console.log(
			`  breaking: ${totals.breaking}  non-breaking: ${totals['non-breaking']}  info: ${totals.info}`,
		);
		for (const r of results) {
			const rel = relative(process.cwd(), r.jsonPath);
			const s = summarize(r.findings);
			console.log(`\n[${r.base}] ${rel}`);
			console.log(
				`  ${s.breaking} breaking / ${s['non-breaking']} non-breaking / ${s.info} info — ${r.grids_found ?? 0} decision_grid(s)`,
			);
			for (const f of r.findings.slice(0, 25)) {
				console.log(
					`  - [${f.severity}] ${f.kind}${f.message ? ' — ' + f.message : ''}`,
				);
			}
			if (r.findings.length > 25)
				console.log(`  ... (+${r.findings.length - 25} more)`);
		}
	}

	// ratchet mode exit
	if (ratchet && baselineReport) {
		process.exit(baselineReport.blocked_count > 0 ? 1 : 0);
	}
	process.exit(totals.breaking > 0 ? 1 : 0);
}

main();

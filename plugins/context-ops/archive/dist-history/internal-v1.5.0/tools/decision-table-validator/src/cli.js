#!/usr/bin/env node
// decision-table-validator CLI — `npx decision-table-validator <dir-or-file>`.
// 입력: decision-tables 디렉토리 (또는 단일 .md / .json).
// 출력: 5종 dmn-check 결과 + JSON sanity. exit code: 0 / 1 (breaking found).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { parseMarkdownTables } from './parse-md-table.js';
import { checkDecisionTable } from './dmn-check.js';
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
		if (extname(name) === '.md') {
			const base = basename(name, '.md');
			const jsonPath = join(dir, base + '.json');
			let hasJson = false;
			try {
				statSync(jsonPath);
				hasJson = true;
			} catch {
				/* missing */
			}
			out.push({ mdPath: full, jsonPath: hasJson ? jsonPath : null, base });
		}
	}
	return out;
}

function processOne({ mdPath, jsonPath, base }) {
	const result = { base, mdPath, jsonPath, findings: [] };
	if (mdPath) {
		const md = readFileSync(mdPath, 'utf-8');
		const tables = parseMarkdownTables(md);
		result.tables_found = tables.length;
		tables.forEach((t, idx) => {
			// 첫 번째 컬럼이 "입력 ... " 으로 시작하는 표만 본격 dmn-check (휴리스틱).
			const looksLikeDecisionTable =
				t.headers.some((h) => /^(입력|input)/i.test(h)) ||
				t.headers.length >= 2;
			if (!looksLikeDecisionTable) return;
			const fs = checkDecisionTable({
				...t,
				source: `${base}.md table#${idx + 1}`,
			});
			for (const f of fs)
				result.findings.push({
					...f,
					table_index: idx,
					location: `${base}.md table#${idx + 1}`,
				});
		});
	}
	if (jsonPath) {
		const json = JSON.parse(readFileSync(jsonPath, 'utf-8'));
		const fs = checkJsonSanity(json, jsonPath);
		for (const f of fs)
			result.findings.push({ ...f, location: `${base}.json` });
	} else {
		result.findings.push({
			severity: 'non-breaking',
			kind: 'pair.json-missing',
			location: `${base}`,
			message: `${base}.md has no paired .json`,
		});
	}
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
			'usage: decision-table-validator <dir> [--json] [--baseline <path>] [--ratchet] [--write-baseline <path>]',
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
	} else if (target.endsWith('.md')) {
		const base = basename(target, '.md');
		const jsonPath = target.replace(/\.md$/, '.json');
		let hasJson = false;
		try {
			statSync(jsonPath);
			hasJson = true;
		} catch {}
		targets = [{ mdPath: target, jsonPath: hasJson ? jsonPath : null, base }];
	} else {
		console.error(`unsupported target: ${target}`);
		process.exit(2);
	}

	const results = targets.map(processOne);
	const totals = {
		tables: results.length,
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
				`\n baseline written → ${writeBaselinePath} (${allFindings.length} findings)`,
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
					`\n baseline + ratchet — grandfathered: ${check.grandfathered_count} / novel: ${check.novel_count} / blocked: ${check.blocked_count}`,
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
			`decision-table-validator — ${results.length} markdown table file(s)`,
		);
		console.log(
			`  breaking: ${totals.breaking}  non-breaking: ${totals['non-breaking']}  info: ${totals.info}`,
		);
		for (const r of results) {
			const rel = relative(process.cwd(), r.mdPath);
			const s = summarize(r.findings);
			console.log(`\n[${r.base}] ${rel}`);
			console.log(
				`  ${s.breaking} breaking / ${s['non-breaking']} non-breaking / ${s.info} info — ${r.tables_found ?? 0} table(s) parsed`,
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

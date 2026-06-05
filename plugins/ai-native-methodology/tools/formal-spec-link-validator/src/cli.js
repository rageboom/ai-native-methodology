#!/usr/bin/env node
// formal-spec-link-validator CLI
// 사용: node src/cli.js <api-extension.json | antipatterns.json | FE artifact | chain artifact | dir>
//        [--json] [--mode=be|fe|both|chain] [--chain-mode] [--dry-run]
//
// 검증:
//   --mode=be (default) — formal_spec_links 의 모든 link 가 실제 파일 존재 + br_id pattern 정합
//   --mode=fe (v1.4 Stage 3-2) — FE 산출물의 cross_links[] 형식 검증 (to_artifact / link_type / to_id pattern)
//   --mode=both — BE + FE 양쪽 검증
//   --mode=chain (v2.0 sub-plan-3a) — chain 산출물 backward link / id pattern 검증 (discovery-spec / behavior-spec /
//     acceptance-criteria / test-spec / impl-spec / traceability-matrix)
//   --chain-mode — alias for --mode=chain (S3 명문화 / sub-plan-3 plan D11 정합)
//   --dry-run — exit 0 강제 (violation report only / S3 정합 — write-baseline 차단 / prompt 차단 / exit 0 강제)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import {
	checkLinks,
	checkFeCrossLinks,
	checkChainLinks,
	detectChainArtifact,
	summarize,
} from './check-links.js';

const BE_TARGETS = new Set(['api-extension.json', 'antipatterns.json']);
const FE_TARGETS = new Set([
	'ui-spec.json',
	'state-map.json',
	'visual-manifest.json',
	'a11y-spec.json',
	'i18n-spec.json',
	'static-security-spec.json',
	'legacy-spectrum.json',
]);
const CHAIN_TARGETS = new Set([
	'discovery-spec.json',
	'behavior-spec.json',
	'acceptance-criteria.json',
	'test-spec.json',
	'impl-spec.json',
	'traceability-matrix.json',
]);

function findTargets(dir, mode) {
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
		if (st.isDirectory()) {
			if (name === 'node_modules' || name.startsWith('.')) continue;
			out.push(...findTargets(full, mode));
			continue;
		}
		if (mode === 'be' || mode === 'both') {
			if (BE_TARGETS.has(name)) out.push(full);
		}
		if (mode === 'fe' || mode === 'both') {
			if (FE_TARGETS.has(name)) out.push(full);
		}
		if (mode === 'chain') {
			if (CHAIN_TARGETS.has(name)) out.push(full);
		}
	}
	return out;
}

function processBe(path) {
	const text = readFileSync(path, 'utf-8');
	let json;
	try {
		json = JSON.parse(text);
	} catch (e) {
		return {
			file: path,
			error: `JSON parse error: ${e.message}`,
			findings: [],
		};
	}

	const baseDir = dirname(path);
	const fileType =
		basename(path) === 'api-extension.json' ? 'api' : 'antipattern';
	const items =
		fileType === 'api' ? (json.operations ?? []) : (json.antipatterns ?? []);
	const allFindings = [];
	let linkedItemCount = 0;

	for (const item of items) {
		if (!item.formal_spec_links) continue;
		linkedItemCount++;
		const fs = checkLinks({
			source: { type: fileType, file: path, item },
			baseDir,
		});
		for (const f of fs) allFindings.push(f);
	}

	return {
		file: path,
		file_type: fileType,
		mode: 'be',
		items_count: items.length,
		linked_items_count: linkedItemCount,
		cross_link_coverage:
			items.length > 0 ? Math.round((linkedItemCount / items.length) * 100) : 0,
		findings: allFindings,
		summary: summarize(allFindings),
	};
}

function processFe(path) {
	const text = readFileSync(path, 'utf-8');
	let json;
	try {
		json = JSON.parse(text);
	} catch (e) {
		return {
			file: path,
			error: `JSON parse error: ${e.message}`,
			findings: [],
		};
	}

	const fileType = basename(path).replace('.json', '');
	// FE 산출물의 cross_links 는 top-level 또는 자식 배열에 위치 — 모두 수집.
	const allCrossLinks = [];
	if (Array.isArray(json.cross_links)) {
		allCrossLinks.push(
			...json.cross_links.map((l) => ({ container: 'top', link: l })),
		);
	}
	// state-map.json 의 machines[].cross_links / resources[].cross_links 등 자식 배열도 검사.
	for (const key of [
		'machines',
		'snapshots',
		'violations',
		'findings',
		'resources',
		'pages',
		'components',
	]) {
		if (!Array.isArray(json[key])) continue;
		for (const item of json[key]) {
			if (Array.isArray(item.cross_links)) {
				allCrossLinks.push(
					...item.cross_links.map((l) => ({ container: key, link: l })),
				);
			}
		}
	}

	const allFindings = [];
	for (const { link } of allCrossLinks) {
		const fs = checkFeCrossLinks({
			source: {
				type: 'fe-artifact',
				file: path,
				item: { cross_links: [link] },
			},
		});
		for (const f of fs) allFindings.push(f);
	}

	return {
		file: path,
		file_type: fileType,
		mode: 'fe',
		cross_links_count: allCrossLinks.length,
		findings: allFindings,
		summary: summarize(allFindings),
	};
}

function processChain(path) {
	const text = readFileSync(path, 'utf-8');
	let json;
	try {
		json = JSON.parse(text);
	} catch (e) {
		return {
			file: path,
			error: `JSON parse error: ${e.message}`,
			findings: [],
		};
	}

	const baseDir = dirname(path);
	const artifact = detectChainArtifact(basename(path));
	if (!artifact) {
		return {
			file: path,
			error: `unknown chain artifact filename: ${basename(path)}`,
			findings: [],
		};
	}

	const findings = checkChainLinks({
		source: { type: 'chain', file: path, artifact, json },
		baseDir,
	});
	return {
		file: path,
		file_type: artifact,
		mode: 'chain',
		findings,
		summary: summarize(findings),
	};
}

function processOne(path, mode) {
	const name = basename(path);
	if (mode === 'chain' || CHAIN_TARGETS.has(name)) return processChain(path);
	if (BE_TARGETS.has(name)) return processBe(path);
	if (FE_TARGETS.has(name)) return processFe(path);
	// 사용자가 명시적으로 path 를 지정한 경우 → mode 따라 처리
	if (mode === 'fe') return processFe(path);
	return processBe(path);
}

function parseMode(args) {
	for (const a of args) {
		if (a === '--mode=fe') return 'fe';
		if (a === '--mode=be') return 'be';
		if (a === '--mode=both') return 'both';
		if (a === '--mode=chain' || a === '--chain-mode') return 'chain';
	}
	return 'be'; // default — BE 호환 보존
}

function main() {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		console.error(
			'usage: formal-spec-link-validator <file-or-dir> [--json] [--mode=be|fe|both|chain] [--chain-mode] [--dry-run]',
		);
		process.exit(2);
	}
	const target = args.find((a) => !a.startsWith('--')) ?? args[0];
	const jsonOut = args.includes('--json');
	const dryRun = args.includes('--dry-run');
	const mode = parseMode(args);

	let st;
	try {
		st = statSync(target);
	} catch {
		console.error(`path not found: ${target}`);
		process.exit(2);
	}

	let files;
	if (st.isDirectory()) {
		files = findTargets(target, mode);
	} else {
		files = [target];
	}

	const results = files.map((p) => processOne(p, mode));
	const totals = {
		files: results.length,
		breaking: 0,
		'non-breaking': 0,
		info: 0,
		errors: 0,
	};
	let totalLinkedItems = 0;
	let totalItems = 0;

	for (const r of results) {
		if (r.error) totals.errors++;
		if (r.summary) {
			totals.breaking += r.summary.breaking;
			totals['non-breaking'] += r.summary['non-breaking'];
			totals.info += r.summary.info;
		}
		totalLinkedItems += r.linked_items_count ?? 0;
		totalItems += r.items_count ?? 0;
	}

	if (jsonOut) {
		console.log(
			JSON.stringify(
				{ totals, totalItems, totalLinkedItems, results },
				null,
				2,
			),
		);
	} else {
		console.log(`formal-spec-link-validator — ${results.length} file(s)`);
		console.log(
			`  cross_link_items: ${totalLinkedItems}/${totalItems} (${totalItems > 0 ? Math.round((totalLinkedItems / totalItems) * 100) : 0}%)`,
		);
		console.log(
			`  breaking: ${totals.breaking}  non-breaking: ${totals['non-breaking']}  info: ${totals.info}  errors: ${totals.errors}`,
		);

		for (const r of results) {
			const rel = relative(process.cwd(), r.file);
			if (r.error) {
				console.log(`\n[ERR] ${rel}\n      ${r.error}`);
				continue;
			}
			console.log(`\n[${r.mode ?? 'be'}/${r.file_type}] ${rel}`);
			if (r.mode === 'fe') {
				console.log(`  cross_links: ${r.cross_links_count}`);
			} else {
				console.log(
					`  ${r.linked_items_count}/${r.items_count} items have formal_spec_links (${r.cross_link_coverage}%)`,
				);
			}
			for (const f of r.findings.slice(0, 30)) {
				console.log(
					`  - [${f.severity}] ${f.kind}${f.message ? ' — ' + f.message : ''}`,
				);
			}
			if (r.findings.length > 30)
				console.log(`  ... (+${r.findings.length - 30} more — use --json)`);
		}
	}

	if (dryRun) {
		if (!jsonOut)
			console.log(
				'[dry-run] exit 0 forced (S3 정합 — write-baseline 차단 / prompt 차단 / exit 0 강제)',
			);
		process.exit(0);
	}
	process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0);
}

main();

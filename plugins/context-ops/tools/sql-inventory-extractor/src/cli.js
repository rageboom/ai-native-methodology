#!/usr/bin/env node
// sql-inventory-extractor CLI — auto 5 컬럼 결정론 추출 (DEC-2026-06-12-sql-inventory-extractor).
//
//   사용:
//     sql-inventory-extractor --src <dir> [--glob <substr>] [--rel-root <dir>] [--output <dir>] [--stdout]
//
//   --src      : MyBatis/iBATIS mapper XML 스캔 루트 (필수). 부재 시 exit 3 (환경 부재 / no-simulation).
//   --glob     : 경로 부분문자열 필터(선택 / 예: 'reqmng'). mapper XML 자동판별 후 추가 필터.
//   --rel-root : mapper_xml 상대경로 기준(기본 --src). 프로젝트 루트 지정 권장.
//   --output   : 산출 디렉토리(기본 <src>/.ai-context/output). sql-inventory.auto.json + raw-grep.txt 작성.
//
//   exit 0 = 정상(0건이면 빈 산출+정직) / 2 = usage / 3 = --src 부재(환경 부재).
//
//   산출: sql-inventory.auto.json (PARTIAL / 판단 6 컬럼 null = LLM 보강 의무) + raw-grep.txt (1차 산출).
//   분석가는 보강 후 sql-inventory.json 으로 승격 → sql-inventory-validator 검증.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, TOOL_VERSION } from './extract.js';
import { baseDirForRead } from '../../_shared/ai-context-layout.js';

function parseArgs(argv) {
	const opts = { src: null, glob: null, relRoot: null, output: null, stdout: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--src') opts.src = argv[++i];
		else if (a === '--glob') opts.glob = argv[++i];
		else if (a === '--rel-root') opts.relRoot = argv[++i];
		else if (a === '--output') opts.output = argv[++i];
		else if (a === '--stdout') opts.stdout = true;
	}
	return opts;
}

function usage() {
	console.error('usage:');
	console.error(
		'  sql-inventory-extractor --src <dir> [--glob <substr>] [--rel-root <dir>] [--output <dir>] [--stdout]',
	);
	console.error('  (--src 부재 시 exit 3 / no-simulation — real mapper XML 파싱만)');
}

// mapper XML 자동판별 — MyBatis 3 / iBATIS 2 DOCTYPE·루트 엘리먼트. spring config 등 오탐 회피.
function isMapperXml(content) {
	return (
		/<!DOCTYPE\s+(?:mapper|sqlMap)\b/i.test(content) ||
		/mybatis-3-mapper\.dtd/i.test(content) ||
		/sql-map-2\.dtd/i.test(content) ||
		/<(?:mapper|sqlMap)\b[^>]*\bnamespace\s*=/i.test(content)
	);
}

function walkXml(dir, acc) {
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return acc;
	}
	for (const name of entries.sort()) {
		if (name === 'node_modules' || name === '.git') continue;
		const full = join(dir, name);
		let st;
		try {
			st = statSync(full);
		} catch {
			continue;
		}
		if (st.isDirectory()) walkXml(full, acc);
		else if (st.isFile() && name.toLowerCase().endsWith('.xml')) acc.push(full);
	}
	return acc;
}

function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (!opts.src) {
		usage();
		process.exit(2);
	}
	const srcPath = resolve(opts.src);
	if (!existsSync(srcPath)) {
		console.error(`[sql-inventory-extractor] 환경 부재: --src 경로 없음 (${srcPath}).`);
		console.error('[sql-inventory-extractor] NO SIMULATION — 실제 mapper XML 만 파싱. LLM 추론 대체 ❌.');
		process.exit(3);
	}
	const relRoot = resolve(opts.relRoot || opts.src);

	const xmlPaths = walkXml(srcPath, []);
	const files = [];
	for (const p of xmlPaths) {
		let content;
		try {
			content = readFileSync(p, 'utf-8');
		} catch {
			continue;
		}
		if (!isMapperXml(content)) continue;
		const relPath = relative(relRoot, p) || p;
		if (opts.glob && !relPath.includes(opts.glob) && !p.includes(opts.glob)) continue;
		files.push({ relPath, content });
	}

	const reproductionCommand =
		`sql-inventory-extractor --src ${opts.src}` +
		(opts.glob ? ` --glob ${opts.glob}` : '') +
		(opts.relRoot ? ` --rel-root ${opts.relRoot}` : '');

	const result = buildInventory({
		files,
		nowIso: new Date().toISOString(),
		reproductionCommand,
	});

	const outDir = opts.output ? resolve(opts.output) : baseDirForRead(srcPath);
	mkdirSync(outDir, { recursive: true });
	const rawLines = result.raw_grep_lines;
	delete result.raw_grep_lines; // raw-grep.txt 로 분리(JSON 비대화 방지).
	const jsonPath = join(outDir, 'sql-inventory.auto.json');
	const rawPath = join(outDir, 'raw-grep.txt');
	writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n');
	writeFileSync(
		rawPath,
		`# sql-inventory-extractor v${TOOL_VERSION} raw-grep (1차 산출 / 결정론 / SKILL analysis-sql-inventory §1)\n` +
			`# <mapper_xml>:<line>:<statement open tag> [statement_type]\n` +
			rawLines.join('\n') +
			'\n',
	);

	if (opts.stdout) {
		process.stdout.write(JSON.stringify(result, null, 2) + '\n');
	} else {
		const s = result.summary;
		const byType = Object.entries(s.by_type)
			.map(([k, v]) => `${k} ${v}`)
			.join('/');
		console.log(
			`[sql-inventory-extractor] v${TOOL_VERSION} deterministic-extractor → ${jsonPath}`,
		);
		console.log(
			`[sql-inventory-extractor] ${s.total_sql_operations} stmt (${byType || '0'}) | tables ${s.dependent_tables_unique.length} (후보) | dynamic ${s.dynamic_branch_count} | callable ${s.callable_count} | fragments 제외 ${s.excluded_fragment_count} | mapper ${s.mapper_files} | raw-grep → ${rawPath}`,
		);
		console.log(
			'[sql-inventory-extractor] PARTIAL — 판단 6 컬럼 null. LLM 보강 후 sql-inventory.json 승격 → sql-inventory-validator 검증.',
		);
		if (s.total_sql_operations === 0) {
			console.log(
				'[sql-inventory-extractor] 0건 — mapper XML 미발견(REST-only 환경?) 또는 --glob 과대 필터. 빈 산출(정직).',
			);
		}
	}
	// process.exit(0) 안 함 — 대용량 --stdout 파이프 truncate footgun 회피(scope-carve 동형).
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main();
}

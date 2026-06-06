#!/usr/bin/env node
// greenfield-bootstrap CLI
//
// greenfield 시나리오 결정적 bootstrap (use-scenario taxonomy 옵션 A).
//   - swagger-extract.json 제공 시 → canonical openapi.yaml elevation (deliverable 5-a)
//   - 항상 → legacy-only 산출물 N/A 생성 (antipatterns.json + migration-cautions.md)
//
//   사용:
//     greenfield-bootstrap --output <dir> [--swagger-extract <path>] [--scope <name>] [--channel swagger|figma|plan-doc|prompt]
//
//   인자 누락(--output) → exit 2 (usage). 순수 변환 — 외부 환경 의존 0 (exit 3 무).
//
//   범위: 결정적·testable 부분만. domain/business-rules/architecture/schema 등 7대-subset
//      AI 생성은 greenfield code-optional mode skill (별 axis / unit-test 불가 / 실 dogfood 검증).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { elevateToOpenApi } from './elevate.js';
import { emitYaml } from './yaml-emit.js';
import {
	buildNaAntipatterns,
	buildMigrationCautionsMd,
} from './na-artifacts.js';

function parseArgs(argv) {
	const opts = {
		output: null,
		swaggerExtract: null,
		scope: null,
		channel: 'swagger',
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--output') opts.output = argv[++i];
		else if (a === '--swagger-extract') opts.swaggerExtract = argv[++i];
		else if (a === '--scope') opts.scope = argv[++i];
		else if (a === '--channel') opts.channel = argv[++i];
	}
	return opts;
}

function usage() {
	console.error('usage:');
	console.error(
		'  greenfield-bootstrap --output <dir> [--swagger-extract <path>] [--scope <name>] [--channel swagger|figma|plan-doc|prompt]',
	);
	console.error(
		'  (greenfield 옵션 A — swagger-extract → openapi.yaml elevation + legacy-only 산출물 N/A 생성)',
	);
}

function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (!opts.output) {
		usage();
		process.exit(2);
	}

	mkdirSync(opts.output, { recursive: true });
	const written = [];
	const nowIso = new Date().toISOString();

	// 1) swagger-extract → openapi.yaml elevation (제공된 경우만).
	if (opts.swaggerExtract) {
		let extract;
		try {
			extract = JSON.parse(readFileSync(opts.swaggerExtract, 'utf8'));
		} catch (err) {
			console.error(
				`[greenfield-bootstrap] cannot read/parse swagger-extract: ${opts.swaggerExtract} — ${err.message}`,
			);
			process.exit(2);
		}
		const doc = elevateToOpenApi(extract, { scope: opts.scope });
		const yaml = emitYaml(doc);
		const openapiPath = join(opts.output, 'openapi.yaml');
		writeFileSync(openapiPath, yaml);
		written.push(openapiPath);
		const epCount = (extract.endpoints || []).length;
		const schemaCount = Object.keys(extract.schemas || {}).length;
		console.log(
			`[greenfield-bootstrap] elevated openapi.yaml: ${epCount} endpoints / ${schemaCount} schemas → ${openapiPath}`,
		);
	}

	// 2) legacy-only 산출물 N/A (항상 — greenfield 는 코드-고고학 패스 없음).
	const scope =
		opts.scope ||
		(opts.swaggerExtract ? undefined : 'greenfield') ||
		'greenfield';
	const ap = buildNaAntipatterns({
		channel: opts.channel,
		generatedAt: nowIso,
	});
	const apPath = join(opts.output, 'antipatterns.json');
	writeFileSync(apPath, JSON.stringify(ap, null, 2));
	written.push(apPath);

	const mc = buildMigrationCautionsMd({ scope, channel: opts.channel });
	const mcPath = join(opts.output, 'migration-cautions.md');
	writeFileSync(mcPath, mc);
	written.push(mcPath);

	console.log(
		`[greenfield-bootstrap] N/A artifacts (legacy-only / scenario=greenfield): antipatterns.json (empty) + migration-cautions.md`,
	);
	console.log(
		`[greenfield-bootstrap] wrote ${written.length} file(s) to ${opts.output}`,
	);
	process.exit(0);
}

main();

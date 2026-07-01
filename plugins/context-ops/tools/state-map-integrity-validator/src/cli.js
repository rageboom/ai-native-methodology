#!/usr/bin/env node
// state-map-integrity-validator CLI
// FE state-map.json 참조 무결성 검증 (analysis gate #0 조건부 / FE state-map 존재 시).
// usage:
//   state-map-integrity-validator <path-to-state-map.json> [--format text|json] [--json]
//
// exit codes: 0=pass, 1=참조 결함(critical/high), 2=usage error / 파일 읽기 실패
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';
import { validateStateMap } from './validator.js';

const argv = process.argv.slice(2);
let targetPath = null;
let format = 'text';

for (let i = 0; i < argv.length; i++) {
	const a = argv[i];
	if (a === '--format') {
		format = argv[++i];
	} else if (a === '--json') {
		format = 'json';
	} else if (a === '--help' || a === '-h') {
		printHelp();
		process.exit(0);
	} else if (!targetPath) {
		targetPath = a;
	}
}

if (!targetPath) {
	printHelp();
	process.exit(2);
}

let doc;
try {
	doc = JSON.parse(readFileSync(resolve(targetPath), 'utf8'));
} catch (err) {
	console.error(
		`[state-map-integrity] ERROR — ${targetPath} 읽기 실패: ${err.message}`,
	);
	process.exit(2);
}

const result = validateStateMap(doc);

if (format === 'json') {
	writeStdoutSync(JSON.stringify(result, null, 2));
} else {
	printText(result, targetPath);
}

process.exit(result.passed ? 0 : 1);

function printHelp() {
	console.error(
		[
			'Usage: state-map-integrity-validator <path-to-state-map.json> [--format text|json]',
			'',
			'FE state-map.json 참조 무결성 검증 (SCXML 1.0 / XState v5 호환 FSM).',
			'',
			'검증 항목 (머신별):',
			'  - transition target ∈ states       (미정의 state 로 전이 = high)',
			'  - initial ∈ states                 (머신 시작점 = high)',
			'  - final_states ⊆ states            (high)',
			'  - child_states ⊆ states (compound) (high)',
			'  - parallel_regions.regions ⊆ states (high)',
			'  - history.default_target ∈ states  (high)',
			'  - 도달 불가 state                  (advisory / medium / non-gating)',
			'',
			'machines 부재 또는 [] = N/A (passed=true, 0 findings).',
			'',
			'exit code:',
			'  0 = pass (critical/high 0)',
			'  1 = fail (참조 결함 critical/high ≥ 1)',
			'  2 = usage error / 파일 읽기 실패',
		].join('\n'),
	);
}

function printText(result, path) {
	const s = result.summary;
	if (result.passed) {
		console.log(
			`[state-map-integrity] PASS — ${path} / machines=${result.machine_count} high=0 medium=${s.medium}`,
		);
	} else {
		console.log(
			`[state-map-integrity] FAIL — ${path} / machines=${result.machine_count} critical=${s.critical} high=${s.high} medium=${s.medium}`,
		);
	}
	if (result.findings.length > 0) {
		for (const f of result.findings) {
			console.log(
				`  [${f.severity.toUpperCase()}] ${f.id} ${f.machine_id} — ${f.rule}: ${f.message}`,
			);
		}
	}
}

#!/usr/bin/env node
// br-cross-consistency-validator CLI
// ADR-CHAIN-011 §5.3 / Plan N 정합
// v2.5.0 Phase C session 12차 patch — Layer 2 LLM 본격 paradigm (B-4 paradigm 정합 / Claude Code sub-agent invocation paradigm)
// usage:
//   br-cross-consistency-validator --target <path-to-rules.json> [--json] [--strict] [--llm-results <path-to-llm-results.json>]
//
// paradigm — Layer 2 LLM 호출 paradigm:
//   1. Claude Code 안 Claude (호출자) 가 Task tool (Agent tool) 호출 (subagent_type / model 명시 / Sonnet 4.6 권장 — STOP-1 echo chamber 약화 paradigm)
//   2. batch paradigm — 1회 Task tool 호출 안 전체 BR list 입력 + 전체 결과 JSON 반환 (STOP-4 흡수 / 31 BR × 1.5~2.5시간 회피)
//   3. Claude 가 결과 JSON 파일 저장 후 → validator 호출 시 `--llm-results <path>` 옵션 입력
//   4. validator = Layer 2 결과 처리 + Layer 1 + Layer 2 통합 점수 반환
//   trigger paradigm = skill trigger (자연어 prompt 매칭) + ad-hoc (사용자 명시 prompt) hybrid (Q-C-trigger (d)+(a) 결단 정합)
//
// Layer 2 LLM results JSON schema (docs/layer-2-prompt-spec.md 참조):
//   {
//     "$schema_version": "v2.5.0-phase-c",
//     "model": "claude-sonnet-4-6",
//     "invoked_at": "<ISO 8601>",
//     "batch_size": <int>,
//     "results": [
//       { "br_id": "BR-...", "semantic_score": <0..1>, "rationale": "...", "confidence": <0..0.85> }
//     ]
//   }

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	validateRulesDoc,
	validateRulesDocStrict,
	OVERALL_THRESHOLD,
} from './validator.js';
import { loadBusinessRules } from '../../_shared/load-business-rules.js';

function parseArgs(argv) {
	const out = { target: null, json: false, strict: false, llmResults: null };
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--target') out.target = argv[++i];
		else if (a === '--json') out.json = true;
		else if (a === '--strict') out.strict = true;
		else if (a === '--llm-results') out.llmResults = argv[++i];
		else if (a === '--help' || a === '-h') {
			printUsage();
			process.exit(0);
		} else {
			console.error(`unknown arg: ${a}`);
			printUsage();
			process.exit(3);
		}
	}
	return out;
}

function printUsage() {
	console.error(
		[
			'usage: br-cross-consistency-validator --target <rules.json> [--json] [--strict] [--llm-results <path>]',
			'',
			'rules.json BR 안 natural_language ↔ given/when/then 두 표현 cross-consistency 검증 (ADR-CHAIN-011).',
			'',
			'options:',
			'  --target       rules.json 파일 경로 (필수)',
			'  --json         JSON 출력 (default: text)',
			'  --strict       Layer 2 LLM advisory 활성 (v2.5.0 Phase C — --llm-results 입력 시만 본격 시행 / 부재 시 skipped)',
			'  --llm-results  Layer 2 LLM 결과 JSON 파일 경로 (Claude Code sub-agent 호출 후 결과 / docs/layer-2-prompt-spec.md 정합 schema)',
			'',
			'Layer 2 LLM 호출 paradigm (v2.5.0 Phase C session 12차):',
			'  1. Claude Code 안 Claude (호출자) 가 Task tool 호출 (Sonnet 4.6 권장 / batch paradigm)',
			'  2. 결과 JSON 파일 저장',
			'  3. validator 호출 시 --llm-results <path> 옵션 입력',
			'',
			'exit codes: 0=overall pass, 1=gate fail, 2=critical/high finding, 3=usage error',
		].join('\n'),
	);
}

async function main() {
	const args = parseArgs(process.argv);
	if (!args.target) {
		console.error('--target 필수');
		printUsage();
		process.exit(3);
	}

	const targetPath = resolve(process.cwd(), args.target);
	let doc;
	try {
		doc = JSON.parse(readFileSync(targetPath, 'utf-8'));
	} catch (err) {
		console.error(
			`[br-cross-consistency-validator] 파일 read 실패: ${err.message}`,
		);
		process.exit(3);
	}
	// v0.4.0 (BR-split STEP 2): BR 배열을 _shared loader 경유로 확보 = STEP 3(index+per-BC)
	//   분할 시 cli 무수정(loadBusinessRules 내부만 확장) single-point. STEP 2 동작 동치.
	doc.business_rules = loadBusinessRules(targetPath);

	// v2.5.0 Phase C — Layer 2 LLM results 입력 paradigm (B-4 paradigm 정합)
	let llmResults = null;
	if (args.llmResults) {
		const llmPath = resolve(process.cwd(), args.llmResults);
		try {
			llmResults = JSON.parse(readFileSync(llmPath, 'utf-8'));
		} catch (err) {
			console.error(
				`[br-cross-consistency-validator] --llm-results 파일 read 실패: ${err.message}`,
			);
			process.exit(3);
		}
		// schema 사전 검증 (Layer 2 본격 paradigm 정합)
		if (!Array.isArray(llmResults?.results)) {
			console.error(
				'[br-cross-consistency-validator] --llm-results JSON schema 위반: results array 필수 (docs/layer-2-prompt-spec.md 정합)',
			);
			process.exit(3);
		}
	}

	const options = { llmResults };
	const result = args.strict
		? await validateRulesDocStrict(doc, options)
		: validateRulesDoc(doc, options);

	if (args.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		printText(result, targetPath);
	}

	const hasCriticalOrHigh = result.findings.some(
		(f) => f.severity === 'critical' || f.severity === 'high',
	);
	if (hasCriticalOrHigh) process.exit(2);
	if (result.summary.gate_status === 'fail') process.exit(1);
	process.exit(0);
}

function printText(result, targetPath) {
	console.log(`\n[br-cross-consistency-validator] target: ${targetPath}`);
	console.log(`  total BRs:           ${result.stats.total}`);
	console.log(`  with natural_language: ${result.stats.with_natural_language}`);
	console.log(`  with given/when/then:  ${result.stats.with_gwt}`);
	console.log(`  with both:           ${result.stats.with_both}`);
	console.log(`  with finding:        ${result.stats.with_finding}`);
	console.log(`  findings total:      ${result.findings.length}`);
	console.log(
		`  overlap distribution: ${JSON.stringify(result.overlap_distribution)}`,
	);
	console.log(
		`  deterministic_score: ${result.summary.deterministic_consistency_score}`,
	);
	console.log(
		`  llm_score:           ${result.summary.llm_consistency_score ?? '(skipped)'}`,
	);
	if (result.summary.llm_model) {
		console.log(`  llm_model:           ${result.summary.llm_model}`);
		console.log(`  llm_batch_size:      ${result.summary.llm_batch_size}`);
	}
	console.log(
		`  overall_score:       ${result.summary.overall_score} (threshold ${result.summary.overall_threshold})`,
	);
	console.log(`  gate_status:         ${result.summary.gate_status}`);

	if (result.findings.length > 0) {
		console.log(`\n  findings:`);
		for (const f of result.findings) {
			console.log(
				`    [${f.severity.toUpperCase()}] ${f.id} ${f.br_id} — ${f.rule}: ${f.message}`,
			);
		}
	}
}

main().catch((err) => {
	console.error(`[br-cross-consistency-validator] fatal: ${err.message}`);
	process.exit(3);
});

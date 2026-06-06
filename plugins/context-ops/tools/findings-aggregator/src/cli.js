#!/usr/bin/env node
// findings-aggregator CLI — 선택적 operator 보조 도구 (mandatory 아님).
// stage 별 REQUIRED_VALIDATORS_PER_STAGE 를 한 번에 실행해 findings JSON 생성 → chain-driver `next --findings <path>` 입력 편의.
// gate 강제는 gate-eval + CI(chain-check.yml 가 각 validator 직접 실행)가 담당 / `next` 는 findings 미입력 시 0 findings 로 동작 = 본 도구 필수 ❌ (refactor: tooling-audit-cleanup — v2.3.6 'auto 입력 의무' 선언 정정).
// usage:
//   findings-aggregator --target <project-dir> --stage <discovery|spec|plan|test|implement> [--output <findings.json>] [--dry-run] [--json]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	aggregateForStage,
	REQUIRED_VALIDATORS_PER_STAGE,
} from './aggregator.js';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..');
const WORKSPACE = resolve(SCRIPT_DIR, '..', '..', '..'); // ai-native-methodology root

function parseArgs(argv) {
	const out = {
		target: null,
		stage: null,
		output: null,
		manifest: null,
		dryRun: false,
		json: false,
	};
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		const rest = argv;
		if (a === '--target') out.target = rest[++i];
		else if (a === '--stage') out.stage = rest[++i];
		else if (a === '--output') out.output = rest[++i];
		else if (a === '--manifest') out.manifest = rest[++i];
		else if (a === '--dry-run') out.dryRun = true;
		else if (a === '--json') out.json = true;
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
			'usage: findings-aggregator --target <project-dir> --stage <analysis|discovery|spec|plan|test|implement> [--manifest <path>] [--output <findings.json>] [--dry-run] [--json]',
			'',
			'stage 별 REQUIRED_VALIDATORS_PER_STAGE 실행 → findings JSON 통합 → chain-driver next --findings 입력 정합.',
			'',
			'options:',
			'  --target   PoC 디렉토리 (예: examples/poc-11-efiweb-billing-spring41)',
			'  --stage    analysis / discovery / spec / plan / test / implement (chain-driver/gate-eval REQUIRED_VALIDATORS_PER_STAGE 정합)',
			'  --manifest analysis 전용 — work-unit-manifest.json 경로 (미지정 시 <target>/.aimd/state.json.current_scope 자동 해석). analysis_refs.artifacts 경로 맵 + scenario 사용.',
			'  --output   findings JSON 저장 경로 (default: <target>/.aimd/output/findings-<stage>.json)',
			'  --dry-run  파일 저장 ❌ / stdout 만',
			'  --json     JSON 출력 (default: text)',
			'',
			'exit codes: 0=ok, 1=findings critical/high (gate block expected), 2=stage 미지원, 3=usage',
		].join('\n'),
	);
}

// validator runner — workspace tools/<name>/src/cli.js 실행
function runValidator(validatorName, projectDir) {
	const validatorBin = join(WORKSPACE, 'tools', validatorName, 'src', 'cli.js');
	if (!existsSync(validatorBin)) {
		return null; // validator 부재 = skipped (aggregator level 기록)
	}
	const args = buildValidatorArgs(validatorName, projectDir);
	try {
		const stdout = execFileSync('node', [validatorBin, ...args], {
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'pipe'],
			maxBuffer: 32 * 1024 * 1024,
		});
		return stdout;
	} catch (err) {
		// validator non-zero exit = 출력은 보존 (findings 안에 critical 카운트)
		if (err.stdout) return err.stdout.toString();
		return null;
	}
}

// validator 별 인자 매핑 (chain-driver/gate-eval REQUIRED_VALIDATORS_PER_STAGE 정합)
function buildValidatorArgs(validatorName, projectDir) {
	switch (validatorName) {
		case 'discovery-extraction-validator':
			return [
				'--discovery',
				join(projectDir, '.aimd/output/discovery-spec.json'),
				'--rules',
				join(projectDir, 'input/business-rules.json'),
				'--domain',
				join(projectDir, 'input/domain.json'),
				'--json',
			];
		case 'chain-coverage-validator':
			return [
				'--discovery',
				join(projectDir, '.aimd/output/discovery-spec.json'),
				'--behavior',
				join(projectDir, '.aimd/output/behavior-spec.json'),
				'--acceptance',
				join(projectDir, '.aimd/output/acceptance-criteria.json'),
				'--json',
			];
		case 'schema-validator':
			// chain 2 자산 정합 검증 (behavior-spec + acceptance-criteria + traceability-matrix)
			return [
				join(projectDir, '.aimd/output/behavior-spec.json'),
				join(projectDir, '.aimd/output/acceptance-criteria.json'),
				join(projectDir, '.aimd/output/traceability-matrix.json'),
			];
		case 'spec-test-link-validator':
			return [
				'--acceptance',
				join(projectDir, '.aimd/output/acceptance-criteria.json'),
				'--test-spec',
				join(projectDir, '.aimd/output/test-spec.json'),
				'--json',
			];
		case 'test-impl-pass-validator':
			return ['--target', projectDir, '--json'];
		case 'static-runner':
			return ['--target', projectDir, '--json'];
		case 'traceability-matrix-builder':
			return ['--target', projectDir, '--json'];
		case 'drift-validator':
			return ['--target', projectDir, '--json'];
		case 'formal-spec-link-validator':
			return ['--target', projectDir, '--json'];
		default:
			return ['--target', projectDir, '--json'];
	}
}

// ── DEC-2026-06-06-analysis-exit-gate — analysis 전용 (manifest 주도 경로 해석 / 결정론 / probe ❌) ──

// manifest.analysis_refs.artifacts + scenario 로드.
function loadAnalysisRefs(projectDir, explicitManifest) {
	let manifestPath = explicitManifest ? resolve(explicitManifest) : null;
	if (!manifestPath) {
		// <target>/.aimd/state.json.current_scope → <target>/.aimd/<scope>/manifest.json
		try {
			const statePath = join(projectDir, '.aimd', 'state.json');
			if (existsSync(statePath)) {
				const state = JSON.parse(readFileSync(statePath, 'utf-8'));
				if (state.current_scope) {
					const p = join(
						projectDir,
						'.aimd',
						state.current_scope,
						'manifest.json',
					);
					if (existsSync(p)) manifestPath = p;
				}
			}
		} catch {
			/* fall through → 빈 artifacts → fail-closed */
		}
	}
	if (!manifestPath || !existsSync(manifestPath))
		return { artifacts: {}, scenario: null };
	try {
		const m = JSON.parse(readFileSync(manifestPath, 'utf-8'));
		return {
			artifacts: m.analysis_refs?.artifacts ?? {},
			scenario: m.scenario ?? null,
		};
	} catch {
		return { artifacts: {}, scenario: null };
	}
}

// analysis validator 별 인자 = manifest artifacts 경로 resolve. 미해석/파일부재 → null (aggregator failClosedOnNull → evidence_missing).
function buildAnalysisArgs(validatorName, projectDir, artifacts) {
	const abs = (rel) => (rel ? resolve(projectDir, rel) : null);
	const ok = (p) => p && existsSync(p);
	switch (validatorName) {
		case 'schema-validator': {
			const dir = abs(artifacts['analysis-output-dir']);
			return ok(dir) ? [dir] : null; // stdout text (no --json / transformSchemaValidator)
		}
		case 'br-cross-consistency-validator': {
			const f = abs(artifacts['business-rules'] ?? artifacts['rules']);
			return ok(f) ? ['--target', f, '--json'] : null;
		}
		case 'formal-spec-link-validator': {
			const dir = abs(artifacts['analysis-output-dir']);
			return ok(dir) ? [dir, '--mode=both', '--json'] : null;
		}
		case 'decision-table-validator': {
			const t = abs(artifacts['decision-tables']);
			return ok(t) ? [t, '--json'] : null;
		}
		case 'characterization-coverage-validator': {
			const f = abs(artifacts['characterization-spec']);
			const dir = ok(f) ? dirname(f) : abs(artifacts['characterization-dir']);
			return ok(dir) ? ['--target', dir, '--json'] : null;
		}
		case 'sql-inventory-validator': {
			const f = abs(artifacts['sql-inventory']);
			const dir = ok(f) ? dirname(f) : abs(artifacts['sql-inventory-dir']);
			return ok(dir) ? ['--target', dir, '--json'] : null;
		}
		default:
			return null;
	}
}

// analysis runValidator — buildAnalysisArgs 로 args 해석 (null=미해석 → evidence_missing).
function runValidatorAnalysis(validatorName, projectDir, artifacts) {
	const validatorBin = join(WORKSPACE, 'tools', validatorName, 'src', 'cli.js');
	if (!existsSync(validatorBin)) return null;
	const args = buildAnalysisArgs(validatorName, projectDir, artifacts);
	if (args == null) return null; // 경로 미해석/파일부재 → fail-closed evidence_missing
	try {
		return execFileSync('node', [validatorBin, ...args], {
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'pipe'],
			maxBuffer: 32 * 1024 * 1024,
		});
	} catch (err) {
		if (err.stdout) return err.stdout.toString();
		return null;
	}
}

function main() {
	const args = parseArgs(process.argv);
	if (!args.target || !args.stage) {
		console.error('error: --target and --stage required');
		printUsage();
		process.exit(3);
	}
	if (!REQUIRED_VALIDATORS_PER_STAGE[args.stage]) {
		console.error(`error: unknown stage ${args.stage}`);
		console.error(
			`  expected: analysis / discovery / spec / plan / test / implement`,
		);
		process.exit(2);
	}

	// DEC-2026-06-06-analysis-exit-gate — analysis 는 manifest.analysis_refs.artifacts 로 경로 결정론 해석 + 조건부 validator(scenario/RDB) + fail-closed(null=evidence_missing).
	let findings;
	if (args.stage === 'analysis') {
		const { artifacts, scenario } = loadAnalysisRefs(args.target, args.manifest);
		const extraValidators = [];
		if (scenario === 'S2' || scenario === 'S3')
			extraValidators.push('characterization-coverage-validator');
		if (artifacts['sql-inventory'])
			extraValidators.push('sql-inventory-validator');
		const runAnalysisValidator = (name, projectDir) =>
			runValidatorAnalysis(name, projectDir, artifacts);
		findings = aggregateForStage(
			'analysis',
			args.target,
			runAnalysisValidator,
			{ extraValidators, failClosedOnNull: true },
		);
		findings.scenario = scenario ?? 'S1';
	} else {
		findings = aggregateForStage(args.stage, args.target, runValidator);
	}

	if (args.json) {
		process.stdout.write(JSON.stringify(findings, null, 2) + '\n');
	} else {
		console.log(
			`findings-aggregator — stage=${args.stage} / target=${args.target}`,
		);
		console.log(`  critical: ${findings.critical}`);
		console.log(`  high:     ${findings.high}`);
		console.log(`  medium:   ${findings.medium}`);
		console.log(`  low:      ${findings.low}`);
		console.log(`  info:     ${findings.info}`);
		if (findings.coverage_pct != null) {
			console.log(
				`  coverage: ${findings.coverage_pct} (threshold ${findings.coverage_threshold})`,
			);
		}
		if (findings.tests_total != null) {
			console.log(
				`  tests:    ${findings.tests_passed}/${findings.tests_total} (failed ${findings.tests_failed})`,
			);
		}
		console.log(
			`  sources:  ${Object.keys(findings.sources).length} validators`,
		);
		for (const [name, source] of Object.entries(findings.sources)) {
			console.log(`    - ${name}: ${source.status}`);
		}
	}

	if (!args.dryRun) {
		const outputPath =
			args.output ??
			join(args.target, '.aimd/output', `findings-${args.stage}.json`);
		mkdirSync(dirname(outputPath), { recursive: true });
		writeFileSync(
			outputPath,
			JSON.stringify(findings, null, 2) + '\n',
			'utf-8',
		);
		if (!args.json) {
			console.log(`\nfindings 저장: ${outputPath}`);
			console.log(
				`사용: node tools/chain-driver/src/cli.js next ${args.target} --findings ${outputPath}`,
			);
		}
	}

	// exit code: critical or high > 0 → 1 (chain-driver gate block expected)
	if ((findings.critical ?? 0) > 0 || (findings.high ?? 0) > 0) {
		process.exit(1);
	}
	process.exit(0);
}

main();

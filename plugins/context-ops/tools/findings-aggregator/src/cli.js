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
import {
	baseFileForRead,
	baseDirForRead,
	scopeFileForRead,
	findingsFilePath,
} from '../../_shared/ai-context-layout.js';

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
			'  --manifest analysis 전용 — work-unit-manifest.json 경로 (미지정 시 <target>/.ai-context/state.json.current_scope 자동 해석). analysis_refs.artifacts 경로 맵 + scenario 사용.',
			'  --output   findings JSON 저장 경로 (default: <target>/.ai-context/output/findings-<stage>.json)',
			'  --dry-run  파일 저장 ❌ / stdout 만',
			'  --json     JSON 출력 (default: text)',
			'',
			'exit codes: 0=ok, 1=findings critical/high (gate block expected), 2=stage 미지원, 3=usage',
		].join('\n'),
	);
}

// validator runner — workspace tools/<name>/src/cli.js 실행. scopeCtx = 비-analysis per-scope 경로 해석 (F-R2-35).
function runValidator(validatorName, projectDir, stage, scopeCtx = null) {
	const validatorBin = join(WORKSPACE, 'tools', validatorName, 'src', 'cli.js');
	if (!existsSync(validatorBin)) {
		return null; // validator 부재 = skipped (aggregator level 기록)
	}
	const args = buildValidatorArgs(validatorName, projectDir, stage, scopeCtx);
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

// ── F-R2-35 — 비-analysis stage 경로 scope-aware overlay (DEC-2026-06-11-aggregator-nonanalysis-scope-aware) ──
//   analysis 는 loadAnalysisRefs(manifest+state.current_scope) 로 scope-aware(DEC-2026-06-06)인데 discovery~implement 5 stage 는
//   평면 .ai-context/output/<f> + input/ 하드코딩이라 per-scope 레이아웃(.ai-context/<scope>/<stage>/<f> + canonical output/)에서 전부 미해석.
//   설계: scopeCtx 주입 시 per-scope→canonical→legacy existsSync 해석 / scopeCtx=null 시 현 평면 경로 byte-identical(무회귀).

// 파일명 → per-scope stage 서브디렉토리.
const STAGE_SUBDIR = {
	'discovery-spec.json': 'discovery',
	'behavior-spec.json': 'spec',
	'acceptance-criteria.json': 'spec',
	'unit-spec.json': 'spec',
	'task-plan.json': 'plan',
	'test-spec.json': 'test',
	'impl-spec.json': 'impl',
	'traceability-matrix.json': 'impl',
	'matrix.json': 'impl',
	'artifact-graph.json': 'impl', // F-EVENT-CARRY-DANGLING — code-pointer-validator/graph 입력 (per-scope impl/)
};

// state.json.current_scope → scopeCtx (analysis loadAnalysisRefs 대칭 / 비-analysis runtime 용).
export function loadScopeCtx(projectDir) {
	try {
		const statePath = join(projectDir, '.ai-context', 'state.json');
		if (!existsSync(statePath)) return null;
		const state = JSON.parse(readFileSync(statePath, 'utf-8'));
		return state.current_scope ? { scope: state.current_scope } : null;
	} catch {
		return null;
	}
}

// chain 산출물: scopeCtx 주입 시 per-scope(.ai-context/<scope>/<stageSubdir>/<f>) existsSync 우선 → flat .ai-context/output/<f> fallback.
//   scopeCtx=null → flat .ai-context/output/<f> (평면 PoC / unit-test 무회귀).
function resolveChainArtifact(projectDir, f, scopeCtx) {
	if (scopeCtx?.scope) {
		const sub = STAGE_SUBDIR[f];
		if (sub) {
			const cand = scopeFileForRead(projectDir, scopeCtx.scope, sub, f); // scopes/ NEW ↔ 최상위 OLD
			if (existsSync(cand)) return cand;
		}
	}
	return baseFileForRead(projectDir, f); // base/ NEW ↔ output/ OLD
}

// business-rules: scopeCtx 주입 시 BR-split leaf → canonical index(output/business-rules.json) existsSync 우선.
//   v0.41.0 zone: index 는 top-level 유지(loadBusinessRules 가 domains/<BC>/ leaf 재조립) → canonical 반환이 정답.
//   leaf 후보 = zone(output/domains/BC-<SCOPE>/business-rules.json) → 평면(output/business-rules/BC-<SCOPE>.json) 순.
//   scopeCtx=null → legacy input/business-rules.json (현 동작 무회귀).
function resolveBusinessRules(projectDir, scopeCtx) {
	if (scopeCtx?.scope) {
		const bc = `BC-${scopeCtx.scope.toUpperCase()}`;
		const zoneLeaf = baseFileForRead(projectDir, 'domains', bc, 'business-rules.json');
		if (existsSync(zoneLeaf)) return zoneLeaf;
		const flatLeaf = baseFileForRead(projectDir, 'business-rules', `${bc}.json`);
		if (existsSync(flatLeaf)) return flatLeaf;
		const canonical = baseFileForRead(projectDir, 'business-rules.json');
		if (existsSync(canonical)) return canonical;
	}
	return join(projectDir, 'input/business-rules.json');
}

// domain: scopeCtx 주입 시 canonical existsSync 우선 → scopeCtx=null → legacy input/domain.json (현 동작 무회귀).
//   v0.41.0 zone: shared/domain.json(zone) → output/domain.json(평면 backward-compat) 순.
function resolveDomain(projectDir, scopeCtx) {
	if (scopeCtx?.scope) {
		const zoned = baseFileForRead(projectDir, 'shared', 'domain.json');
		if (existsSync(zoned)) return zoned;
		const flat = baseFileForRead(projectDir, 'domain.json');
		if (existsSync(flat)) return flat;
	}
	return join(projectDir, 'input/domain.json');
}

// validator 별 인자 매핑 (chain-driver/gate-eval REQUIRED_VALIDATORS_PER_STAGE 정합).
//   scopeCtx (4th param / optional) = 비-analysis per-scope 경로 해석 (F-R2-35). null = 평면 경로(무회귀).
export function buildValidatorArgs(validatorName, projectDir, stage, scopeCtx = null) {
	const O = (f) => resolveChainArtifact(projectDir, f, scopeCtx);
	switch (validatorName) {
		case 'verdict-consistency-validator':
			// analysis gate#0 — BC verdict 정합 (analysis output 루트 검사 / DEC-2026-06-15)
			// --enforce: high 유지 → gate-eval HARD block (fail-closed). DEC-2026-06-15 §enforce 승격(병렬 dogfood 머지 후).
			return ['--root', baseDirForRead(projectDir), '--enforce', '--json'];
		case 'discovery-extraction-validator':
			return [
				'--discovery',
				O('discovery-spec.json'),
				'--rules',
				resolveBusinessRules(projectDir, scopeCtx),
				'--domain',
				resolveDomain(projectDir, scopeCtx),
				'--json',
			];
		case 'br-cross-consistency-validator':
			// F2-followup wiring: br-cross 는 --target <rules.json> 파일을 요구 (이전엔 default '--target <dir>' → errored skip).
			//   scope-aware(F-R2-35): per-scope BR-split leaf → canonical → legacy input/business-rules.json.
			return ['--target', resolveBusinessRules(projectDir, scopeCtx), '--json'];
		case 'chain-coverage-validator':
			return [
				'--discovery',
				O('discovery-spec.json'),
				'--behavior',
				O('behavior-spec.json'),
				'--acceptance',
				O('acceptance-criteria.json'),
				'--json',
			];
		case 'schema-validator':
			// stage-aware 산출물 검증 (이전엔 stage 무관 chain-2 자산만 → plan/test/implement 에서 잘못된 파일 검증).
			switch (stage) {
				case 'discovery':
					return [O('discovery-spec.json')];
				case 'plan':
					return [O('task-plan.json')];
				case 'test':
					return [O('test-spec.json')];
				case 'implement':
					return [O('impl-spec.json'), O('traceability-matrix.json')];
				case 'spec':
				default:
					// chain 2 자산 정합 (behavior-spec + acceptance-criteria + traceability-matrix)
					return [O('behavior-spec.json'), O('acceptance-criteria.json'), O('traceability-matrix.json')];
			}
		case 'spec-test-link-validator':
			// --behavior 누락 시 bhv_ref 미해석 → TC 당 false critical (hard block). behavior-spec 동반 필수.
			// --unit-spec (v0.40.0 / DEC-2026-06-12-unit-layer-hard-flip 조건⑤): mock-soundness(unit.mock.unsound / high)를
			//   result.findings 로 병합 → gate-eval validator_high HARD_BLOCK 합류. unit-spec 부재 PoC = loadJson null → 0 findings(무영향).
			return [
				'--acceptance',
				O('acceptance-criteria.json'),
				'--test-spec',
				O('test-spec.json'),
				'--behavior',
				O('behavior-spec.json'),
				'--unit-spec',
				O('unit-spec.json'),
				'--json',
			];
		// F2 fix (dogfood): plan-coverage-validator case 부재 → default '--target' 인자로 호출되어
		//   (validator 가 --task-plan/--acceptance 를 요구) errored → silent skip = plan gate primary validator 미실행(fail-OPEN).
		case 'plan-coverage-validator':
			return [
				'--task-plan',
				O('task-plan.json'),
				'--acceptance',
				O('acceptance-criteria.json'),
				'--json',
			];
		case 'test-impl-pass-validator':
			// F-R2-40: validator 인자 규약 = --project (이전 default '--target' → exit 2 usage → silent skip).
			//   --allow-execute = test/implement gate 가 진짜 GREEN reconciliation(실 RUN) 확보 (no-simulation / i-strict / ADR-CHAIN-004 §4).
			//   test-cmd contract 부재 시 validator 가 정직 fail(evidence_missing) = 프로젝트 책임.
			return ['--project', projectDir, '--allow-execute', '--json'];
		case 'static-runner':
			return ['--target', projectDir, '--json'];
		case 'traceability-matrix-builder':
			// implement gate — full chain 으로 traceability matrix coverage 산출 (--json findings-only / --out-dir 미지정 = side-effect write 없음).
			//   이전 default '--target <dir>' → --behavior/--acceptance 부재로 errored → silent skip. transformTraceabilityMatrix 가 red→critical 매핑.
			return [
				'--behavior', O('behavior-spec.json'),
				'--acceptance', O('acceptance-criteria.json'),
				'--discovery', O('discovery-spec.json'),
				'--task-plan', O('task-plan.json'),
				'--test-spec', O('test-spec.json'),
				'--impl-spec', O('impl-spec.json'),
				'--json',
			];
		case 'drift-validator':
			return ['--target', projectDir, '--json'];
		case 'formal-spec-link-validator':
			return ['--target', projectDir, '--json'];
		case 'unit-spec-oracle-validator':
			// DEC-2026-06-22-unit-spec-oracle-symmetry — spec stage 조건부(soft). required UNIT 합격선(oracle≥1) 검사.
			//   unit-spec 부재 PoC = validator N/A(빈 결과 exit 0) → failClosedOnNull 환경서도 evidence_missing 오탐 없음.
			//   --characterization 미부여(현 PoC 0건) → characterization_snapshot_refs dead-ref 검증 skip / oracle 존재 검사만.
			return [O('unit-spec.json'), '--json'];
		// F-EVENT-CARRY-DANGLING — code_pointer strict_path 실재성 gate (implement).
		//   positional <artifact-graph.json> + --repo-root <projectDir> 계약 (graph-integrity 의 --target 와 상이 → 명시 케이스 필수).
		//   --strict: path_missing/glob_no_match/coverage_missing 을 high 로 격상 → transformGeneric summary.high → gate-eval validator_high(block).
		case 'code-pointer-validator':
			return [
				O('artifact-graph.json'),
				'--repo-root',
				projectDir,
				'--strict',
				'--format',
				'json',
			];
		// BC-3 (golf chain5 dogfood / DEC-2026-06-12) — graph-integrity-validator 는 positional <artifact-graph.json>
		//   계약(--target 아님). 명시 case 부재 시 default '--target' 로 떨어져 항상 evidence_missing
		//   (REQUIRED.implement 등재인데 미작동 = 조용한 공백). code-pointer 와 동일 O('artifact-graph.json')
		//   resolver 재사용 (graph-integrity 는 --repo-root 불요).
		case 'graph-integrity-validator':
			return [O('artifact-graph.json'), '--format', 'json'];
		default:
			return ['--target', projectDir, '--json'];
	}
}

// ── DEC-2026-06-06-analysis-exit-gate — analysis 전용 (manifest 주도 경로 해석 / 결정론 / probe ❌) ──

// manifest.analysis_refs.artifacts + scenario 로드.
function loadAnalysisRefs(projectDir, explicitManifest) {
	let manifestPath = explicitManifest ? resolve(explicitManifest) : null;
	if (!manifestPath) {
		// <target>/.ai-context/state.json.current_scope → <target>/.ai-context/<scope>/manifest.json
		try {
			const statePath = join(projectDir, '.ai-context', 'state.json');
			if (existsSync(statePath)) {
				const state = JSON.parse(readFileSync(statePath, 'utf-8'));
				if (state.current_scope) {
					const p = join(
						projectDir,
						'.ai-context',
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
		case 'analysis-extraction-validator': {
			// F-DOGFOOD-014 evidence-scan — 산출물 {file,line} 증거 실재성 (repo-root = projectDir)
			const dir = abs(artifacts['analysis-output-dir']);
			return ok(dir)
				? ['--evidence-scan', dir, '--repo-root', resolve(projectDir), '--json']
				: null;
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
		case 'verdict-consistency-validator': {
			// DEC-2026-06-15 — BC verdict 정합. 입력 = analysis output 루트(전 BC sql-inventory + shared/domain.json).
			const dir = abs(artifacts['analysis-output-dir']);
			// --enforce: fail-closed (high 유지 → gate STOP). DEC-2026-06-15 enforce 승격.
			return ok(dir) ? ['--root', dir, '--enforce', '--json'] : null;
		}
		case 'analysis-self-consistency-validator': {
			// DEC-2026-06-22 — 산출물 summary/count ↔ 자기 배열 정합. dir-scan(count-bearing 산출물만 검사, 나머지 N/A).
			const dir = abs(artifacts['analysis-output-dir']);
			return ok(dir) ? [dir, '--json'] : null;
		}
		case 'state-map-integrity-validator': {
			// state-map.json transition target/initial/final/child/parallel/history ∈ states 참조 무결성 (FE 조건부).
			const f = abs(artifacts['state-map']);
			return ok(f) ? [f, '--json'] : null;
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
		// DEC-2026-06-22 — count-bearing 산출물 자기정합(summary↔배열). dir 존재 시 추가(self-gating: 비-count 산출물은 N/A).
		if (artifacts['analysis-output-dir'])
			extraValidators.push('analysis-self-consistency-validator');
		// state-map 참조 무결성(FE) — FE state-map 산출물 존재 시 조건부(sql-inventory 패턴 / gates[#0].conditional_validators).
		if (artifacts['state-map'])
			extraValidators.push('state-map-integrity-validator');
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
		// DEC-2026-06-06 후속 — 비-analysis 단계도 fail-closed (failClosedOnNull): required validator 가
		//   args 미해석/미실행으로 null → silent skip(fail-OPEN) 대신 evidence_missing(soft / --user-decision go 로 ack).
		//   drift-validator(plugin 자기구조 검사 / 사용자 프로젝트 N/A) · test-impl-pass(CHANNEL B 직접실행) ·
		//   static-runner(환경 의존 semgrep) 는 정직한 evidence_missing 으로 surface.
		// F-R2-35 — 비-analysis stage 도 state.current_scope 로 per-scope 경로 해석 (analysis loadAnalysisRefs 대칭).
		const scopeCtx = loadScopeCtx(args.target);
		// DEC-2026-06-22-unit-spec-oracle-symmetry — spec stage 조건부 soft validator (required UNIT oracle≥1).
		//   medium-only / gate-eval REQUIRED.spec 미등재 + sdlc gate#2 conditional_validators 등재 = 게이트 미차단(soft).
		//   unit-spec 부재 시 validator 가 N/A(빈 결과 exit 0) 반환 → failClosedOnNull 와 무관하게 evidence_missing 오탐 없음.
		const extraValidators = args.stage === 'spec' ? ['unit-spec-oracle-validator'] : [];
		findings = aggregateForStage(
			args.stage,
			args.target,
			(name, dir) => runValidator(name, dir, args.stage, scopeCtx),
			{ extraValidators, failClosedOnNull: true },
		);
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
			args.output ?? findingsFilePath(args.target, args.stage); // runtime/findings-<stage>.json
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

// main() 는 CLI 직접 실행 시에만 (import 시 buildValidatorArgs 등 단위 테스트 가능 / F2 fix 회귀 테스트 enablement).
if (process.argv[1] === __filename) main();

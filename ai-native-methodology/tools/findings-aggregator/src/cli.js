#!/usr/bin/env node
// findings-aggregator CLI — chain-driver next --findings 자동 입력 통합 도구
// ★ ★ v2.3.6 PATCH / "양심 의존 차단" 정책 강화
// usage:
//   findings-aggregator --target <project-dir> --stage <planning|spec|test|implement> [--output <findings.json>] [--dry-run] [--json]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aggregateForStage, REQUIRED_VALIDATORS_PER_STAGE } from './aggregator.js';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..');
const WORKSPACE = resolve(SCRIPT_DIR, '..', '..', '..'); // ★ ai-native-methodology root

function parseArgs(argv) {
  const out = { target: null, stage: null, output: null, dryRun: false, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const rest = argv;
    if (a === '--target') out.target = rest[++i];
    else if (a === '--stage') out.stage = rest[++i];
    else if (a === '--output') out.output = rest[++i];
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
  console.error([
    'usage: findings-aggregator --target <project-dir> --stage <planning|spec|test|implement> [--output <findings.json>] [--dry-run] [--json]',
    '',
    'stage 별 REQUIRED_VALIDATORS_PER_STAGE 실행 → findings JSON 통합 → chain-driver next --findings 입력 정합.',
    '',
    'options:',
    '  --target   PoC 디렉토리 (예: examples/poc-11-efiweb-billing-spring41)',
    '  --stage    planning / spec / test / implement (★ chain-driver/gate-eval REQUIRED_VALIDATORS_PER_STAGE 정합)',
    '  --output   findings JSON 저장 경로 (default: <target>/.aimd/output/findings-<stage>.json)',
    '  --dry-run  파일 저장 ❌ / stdout 만',
    '  --json     JSON 출력 (default: text)',
    '',
    'exit codes: 0=ok, 1=findings critical/high (gate block expected), 2=stage 미지원, 3=usage',
  ].join('\n'));
}

// ★ validator runner — workspace tools/<name>/src/cli.js 실행
function runValidator(validatorName, projectDir) {
  const validatorBin = join(WORKSPACE, 'tools', validatorName, 'src', 'cli.js');
  if (!existsSync(validatorBin)) {
    return null; // ★ validator 부재 = skipped (★ aggregator level 기록)
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
    // ★ validator non-zero exit = 출력은 보존 (findings 안에 critical 카운트)
    if (err.stdout) return err.stdout.toString();
    return null;
  }
}

// ★ validator 별 인자 매핑 (★ chain-driver/gate-eval REQUIRED_VALIDATORS_PER_STAGE 정합)
function buildValidatorArgs(validatorName, projectDir) {
  switch (validatorName) {
    case 'discovery-extraction-validator':
    case 'planning-extraction-validator': // backward-compat alias (deprecated)
      return [
        '--discovery', join(projectDir, '.aimd/output/discovery-spec.json'),
        '--rules', join(projectDir, 'input/business-rules.json'),
        '--domain', join(projectDir, 'input/domain.json'),
        '--json',
      ];
    case 'chain-coverage-validator':
      return [
        '--discovery', join(projectDir, '.aimd/output/discovery-spec.json'),
        '--behavior', join(projectDir, '.aimd/output/behavior-spec.json'),
        '--acceptance', join(projectDir, '.aimd/output/acceptance-criteria.json'),
        '--json',
      ];
    case 'schema-validator':
      // ★ chain 2 자산 정합 검증 (behavior-spec + acceptance-criteria + traceability-matrix)
      return [
        join(projectDir, '.aimd/output/behavior-spec.json'),
        join(projectDir, '.aimd/output/acceptance-criteria.json'),
        join(projectDir, '.aimd/output/traceability-matrix.json'),
      ];
    case 'spec-test-link-validator':
      return [
        '--acceptance', join(projectDir, '.aimd/output/acceptance-criteria.json'),
        '--test-spec', join(projectDir, '.aimd/output/test-spec.json'),
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

function main() {
  const args = parseArgs(process.argv);
  if (!args.target || !args.stage) {
    console.error('error: --target and --stage required');
    printUsage();
    process.exit(3);
  }
  if (!REQUIRED_VALIDATORS_PER_STAGE[args.stage]) {
    console.error(`error: unknown stage ${args.stage}`);
    console.error(`  expected: discovery / spec / plan / test / implement`);
    process.exit(2);
  }

  const findings = aggregateForStage(args.stage, args.target, runValidator);

  if (args.json) {
    process.stdout.write(JSON.stringify(findings, null, 2) + '\n');
  } else {
    console.log(`★ findings-aggregator — stage=${args.stage} / target=${args.target}`);
    console.log(`  critical: ${findings.critical}`);
    console.log(`  high:     ${findings.high}`);
    console.log(`  medium:   ${findings.medium}`);
    console.log(`  low:      ${findings.low}`);
    console.log(`  info:     ${findings.info}`);
    if (findings.coverage_pct != null) {
      console.log(`  coverage: ${findings.coverage_pct} (threshold ${findings.coverage_threshold})`);
    }
    if (findings.tests_total != null) {
      console.log(`  tests:    ${findings.tests_passed}/${findings.tests_total} (failed ${findings.tests_failed})`);
    }
    console.log(`  sources:  ${Object.keys(findings.sources).length} validators`);
    for (const [name, source] of Object.entries(findings.sources)) {
      console.log(`    - ${name}: ${source.status}`);
    }
  }

  if (!args.dryRun) {
    const outputPath = args.output ?? join(args.target, '.aimd/output', `findings-${args.stage}.json`);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(findings, null, 2) + '\n', 'utf-8');
    if (!args.json) {
      console.log(`\n★ findings 저장: ${outputPath}`);
      console.log(`★ 사용: node tools/chain-driver/src/cli.js next ${args.target} --findings ${outputPath}`);
    }
  }

  // ★ exit code: critical or high > 0 → 1 (★ chain-driver gate block expected)
  if ((findings.critical ?? 0) > 0 || (findings.high ?? 0) > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();

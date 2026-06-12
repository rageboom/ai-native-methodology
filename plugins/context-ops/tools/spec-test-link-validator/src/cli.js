#!/usr/bin/env node
import { validateSpecTestLink, validateMockSoundness, loadJson } from './validator.js';

function parseArgs(argv) {
  const out = { dryRun: false, json: false, threshold: 0.85 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--behavior') out.behavior = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--test-spec') out.testSpec = argv[++i];
    else if (a === '--inventory') out.inventory = argv[++i];
    else if (a === '--unit-spec') out.unitSpec = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: spec-test-link-validator --acceptance <path> --test-spec <path> [--behavior <path>] [--inventory <path>] [--unit-spec <path>] [--threshold 0.85] [--dry-run] [--json]
  --unit-spec <path>  v0.36.0 — mocking-soundness 계약 검사 (SOFT / propose-only / 비차단 / exit code 미영향). composition TC 의 mock 협력자가 test_layer=unit TC 로 핀됐는지.`);
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.acceptance || !args.testSpec) {
  console.error('error: --acceptance and --test-spec required');
  process.exit(2);
}
const behavior = args.behavior ? loadJson(args.behavior) : null;
const acceptance = loadJson(args.acceptance);
const testSpec = loadJson(args.testSpec);
const inventory = args.inventory ? loadJson(args.inventory) : null;

const result = validateSpecTestLink(behavior, acceptance, testSpec, inventory, args.threshold);

// v0.40.0 — mocking-soundness HARD flip (DEC-2026-06-12-unit-layer-hard-flip / 조건⑤).
//   --unit-spec opt-in 시 unsound mock(unit.mock.unsound / high)을 result.findings 로 **단일 병합** →
//   exit-code(critical|high 차단) + aggregator transformGeneric(summary.high) → gate-eval validator_high HARD_BLOCK 합류.
//   구 advisory 2-객체 stdout 폐기: 2-객체 concat 은 aggregator default-case JSON.parse 가 throw → 내부 catch silent-swallow
//   (mock high 무신호 drop)였음. 단일 JSON + summary recompute 가 load-bearing (transformGeneric 는 summary.high 만 read).
// ★ unit-spec 이 실제 로드된 경우(non-null)에만 — 부재 PoC = unit 층 미opt-in = mock-soundness skip(무회귀).
//   (validateMockSoundness 는 waived 셋을 unit-spec 에서 뽑으므로 unitSpec=null 이면 모든 mock 협력자가 거짓 unsound = 회귀. loadJson(missing)=null graceful.)
const unitSpec = args.unitSpec ? loadJson(args.unitSpec) : null;
if (unitSpec) {
  const ms = validateMockSoundness(testSpec, unitSpec);
  result.findings.push(...ms.findings);
  result.summary.high += ms.summary.high;
  result.summary.total_findings += ms.summary.total_findings;
}

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[spec-test-link-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`coverage AC→TC: ${(result.coverage.ac_to_tc * 100).toFixed(1)}% (threshold ${args.threshold})`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(0);
const fail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(fail ? 1 : 0);

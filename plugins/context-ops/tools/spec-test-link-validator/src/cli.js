#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { validateSpecTestLink, validateMockSoundness, validateCodeLabelConsistency, loadJson } from './validator.js';

import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';
function parseArgs(argv) {
  const out = { dryRun: false, json: false, threshold: 0.85 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--behavior') out.behavior = argv[++i];
    else if (a === '--acceptance') out.acceptance = argv[++i];
    else if (a === '--test-spec') out.testSpec = argv[++i];
    else if (a === '--inventory') out.inventory = argv[++i];
    else if (a === '--unit-spec') out.unitSpec = argv[++i];
    else if (a === '--test-source') out.testSource = argv[++i];
    else if (a === '--business-rules') out.businessRules = argv[++i];
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') {
      console.log(`usage: spec-test-link-validator --acceptance <path> --test-spec <path> [--behavior <path>] [--inventory <path>] [--unit-spec <path>] [--test-source <root> [--business-rules <path>]] [--threshold 0.85] [--dry-run] [--json]
  --unit-spec <path>     v0.36.0 — mocking-soundness 계약 검사 (HARD / --unit-spec 시 result.findings 병합). composition TC 의 mock 협력자가 test_layer=unit TC 로 핀됐는지.
  --test-source <root>   v0.44.0 — code @DisplayName ↔ test-spec 라벨 정합 (SOFT / opt-in / 비차단 / exit code·gate 미영향). test_case.source_file 들을 <root> 기준 read.
  --business-rules <p>   --test-source 동반: 라벨의 BR 토큰 날조 검사용 business-rules.json (없으면 BR-id 검사 skip).`);
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

// v0.44.0 — code @DisplayName ↔ test-spec 라벨 정합 (SOFT / DEC-2026-06-13-displayname-label-lint-soft).
//   --test-source opt-in. 결과는 **별도 키** result.code_label_consistency 로만 attach — result.findings/summary 에 병합 ❌
//   → exit-code(아래 fail) + aggregator transformGeneric(summary.high) + gate 무영향 = 진짜 advisory. 부재 시 동작 100% 불변.
//   §8.1: 1 datapoint = SOFT only. HARD flip(병합)은 ≥2 distinct 도메인 후 별도 결정.
if (args.testSource) {
  const root = args.testSource;
  const resolve = (p) => (isAbsolute(p) ? p : join(root, p));
  const seen = new Set();
  const sourceFiles = [];
  for (const tc of testSpec?.test_cases ?? []) {
    if (!tc.source_file || seen.has(tc.source_file)) continue;
    seen.add(tc.source_file);
    const full = resolve(tc.source_file);
    sourceFiles.push({ path: tc.source_file, content: existsSync(full) ? readFileSync(full, 'utf-8') : null });
  }
  const brDoc = args.businessRules ? loadJson(args.businessRules) : null;
  const brIds = new Set((brDoc?.business_rules ?? []).map((b) => b.id));
  const acIds = new Set((acceptance?.criteria ?? []).map((a) => a.id));
  result.code_label_consistency = validateCodeLabelConsistency(testSpec, sourceFiles, brIds, acIds);
}

if (args.json) {
  writeStdoutSync(JSON.stringify(result, null, 2));
} else {
  console.log(`[spec-test-link-validator] ${result.summary.total_findings} findings (critical: ${result.summary.critical}, high: ${result.summary.high}, medium: ${result.summary.medium})`);
  console.log(`coverage AC→TC: ${(result.coverage.ac_to_tc * 100).toFixed(1)}% (threshold ${args.threshold})`);
  for (const f of result.findings) {
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
  if (result.code_label_consistency) {
    const c = result.code_label_consistency;
    console.log(`[code-label SOFT/advisory] ${c.summary.total_findings} findings (critical ${c.summary.critical}, high ${c.summary.high}) / checked ${c.checked} labels / skipped ${c.skipped.length}`);
    for (const f of c.findings) console.log(`  (soft) ${f.severity.toUpperCase()} [${f.kind}] ${f.message}`);
  }
}

if (args.dryRun) process.exit(0);
const fail = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
process.exit(fail ? 1 : 0);

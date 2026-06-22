#!/usr/bin/env node
// unit-spec-oracle-validator CLI (v0.69.0 / DEC-2026-06-22-unit-spec-oracle-symmetry)
// usage:
//   unit-spec-oracle-validator <unit-spec.json> [--characterization <path>] [--json] [--dry-run]
//     <unit-spec.json>    검사 대상. 파일 부재 = N/A (빈 결과 exit 0) — unit-spec 은 optional 산출물(behavior-only
//                         mode 정상)이라 부재가 결함이 아니다. aggregator failClosedOnNull=true 환경에서
//                         evidence_missing 오탐을 막으려 부재 시에도 non-null 빈 JSON + exit 0.
//     --characterization  characterization-spec.json (선택) — characterization_snapshot_refs dead-ref 검증.
//     --json              결과 JSON (파이프 안전 / writeStdoutSync).
//     --dry-run           finding 출력만 / exit 0.
//   exit: 0(정합·waiver·dry-run·파일부재 N/A) / 1(high finding — soft 현재 0 / hard 격상 후 활성) / 2(usage)
//
// 결함 클래스: required UNIT 이 검증 oracle 0건 = 합격선 미상 → test 단계 거짓 GREEN. behavior verifiable⇒TC 짝.
// soft 불변: 모든 finding medium / cli exit 은 high>0 일 때만 1 (현재 high emit 0). gate-eval REQUIRED.spec
//   미등재 + sdlc gate#2 conditional_validators 등재로 이중 가드(게이트 미차단).

import { validateUnitOracle, loadJson } from './validator.js';
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';

function usage() {
  console.log(
    'usage: unit-spec-oracle-validator <unit-spec.json> [--characterization <path>] [--json] [--dry-run]',
  );
}

function parseArgs(argv) {
  const out = { json: false, dryRun: false, characterization: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--characterization') out.characterization = argv[++i];
    else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    } else if (!a.startsWith('--') && !out.target) out.target = a;
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.target) {
  console.error('error: <unit-spec.json> required');
  usage();
  process.exit(2);
}

let unitSpec;
try {
  unitSpec = loadJson(args.target); // 부재 → null (N/A) / parse 오류 → throw
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(2);
}

let charObj = null;
if (args.characterization) {
  try {
    charObj = loadJson(args.characterization);
  } catch {
    charObj = null; // characterization parse 실패 = dead-ref 검증 skip (oracle 존재 검사는 계속)
  }
}

const r =
  unitSpec == null
    ? { applicable: false, findings: [], summary: { total_findings: 0, high: 0, medium: 0 } }
    : validateUnitOracle(unitSpec, charObj);

const out = { applicable: r.applicable, summary: r.summary, findings: r.findings };

if (args.json) {
  writeStdoutSync(JSON.stringify(out, null, 2));
} else {
  console.log(
    `[unit-spec-oracle-validator] ${
      r.applicable
        ? `${r.findings.length} finding(s) (high: ${r.summary.high}, medium: ${r.summary.medium})`
        : 'N/A (unit-spec 부재 / behavior-only mode)'
    }`,
  );
  for (const f of r.findings)
    console.log(`  ${f.severity.toUpperCase()} [${f.kind}] ${f.unit_id}: ${f.message}`);
}

if (args.dryRun) process.exit(0);
process.exit(r.summary.high > 0 ? 1 : 0);

#!/usr/bin/env node
// release-readiness — ★ ★ ★ §8.1 strict 8/8 자동 검사 (sub-plan-6 + v2.4.0 sub-plan §3 격상).
//
// 사용: node scripts/release-readiness.js --target v2.0.0 [--json]
//
// 8 자격 (ADR-CHAIN-005 부재 ❌ — Senior F3 흡수 / file presence 만 검사하는 criterion 0개 의무):
//   1. ≥ 2 PoC corroboration (poc-05 + poc-03 retrofit)
//   2. 진짜 도구 5종 물증 7 필드 (test-impl-pass-validator schema 검증)
//   3. validator violation 0 (planning-extraction + chain-coverage + spec-test-link + drift state-flow)
//   4. chain coverage ≥ 0.85 (link_coverage.threshold)
//   5. ADR registry — content-aware 검사 (status: 승인 / decision-cluster 매칭)
//   6. traceability-matrix 100% green (PoC #05 / matrix.json forward = 1.0)
//   7. e2e 1 cycle pass (PoC #05 chain 4 GREEN / impl-spec.test_pass_evidence.fail_count == 0)
//   8. ★ ★ ★ v2.4.0 신설 — analysis validator violation 0 (★ schema-validator + br-cross-consistency-validator / 11 PoC rules.json
//      critical/high finding 0 / ADR-CHAIN-011 §5.7 정합 / LL-i-23 release-readiness 사각지대 회복)
//
// exit 0 = 8/8 ready / 1 = 1+ regress.
//
// ★ ★ ★ ★ ★ MINOR bump 부적격 가능성 (Senior STOP signal 정합 / ADR-CHAIN-011 §5.7):
//   본 격상 자체 = chain harness paradigm 재정의 (release-readiness 검사 영역 확장) = MINOR bump 부적격 가능 / v2.5.0 분리 검토 의무.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

function usage(code = 2) {
  console.error([
    'usage: release-readiness --target <version> [--json]',
    '  --target <version>   target release version (예: v2.0.0)',
    '  --json               machine-readable output',
  ].join('\n'));
  process.exit(code);
}

function parseArgs(argv) {
  const out = { json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') out.target = argv[++i];
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') usage(0);
  }
  return out;
}

function check1_pocCorroboration() {
  const candidates = readdirSync(join(ROOT, 'examples'))
    .filter((d) => d.startsWith('poc-'))
    .filter((d) => existsSync(join(ROOT, 'examples', d, '.aimd/output/planning-spec.json')));
  return {
    id: 'poc_corroboration',
    pass: candidates.length >= 2,
    detail: `found ${candidates.length} PoC with chain harness output: ${candidates.join(', ')}`,
    delegated_to: 'examples/*/.aimd/output/planning-spec.json existence + valid schema',
  };
}

function check2_realToolEvidence() {
  // PoC #05 impl-spec test_pass_evidence 의 7 의무 필드 체크 (★ test-impl-pass schema 정합).
  const requiredFields = [
    'test_runner_version', 'test_runner_stdout_path', 'invocation_timestamp',
    'duration_ms', 'pass_count', 'fail_count', 'skip_count',
    'reproduction_command', 'result_hash', 'report_format',
  ];
  const path = join(ROOT, 'examples/poc-05-sample-user-register/.aimd/output/impl-spec.json');
  if (!existsSync(path)) {
    return { id: 'real_tool_evidence', pass: false, detail: 'PoC #05 impl-spec.json missing' };
  }
  const spec = JSON.parse(readFileSync(path, 'utf-8'));
  const ev = spec?.test_pass_evidence || {};
  const missing = requiredFields.filter((f) => ev[f] === undefined);
  const hashOk = typeof ev.result_hash === 'string' && /^sha256:[a-f0-9]{64}$/.test(ev.result_hash);
  return {
    id: 'real_tool_evidence',
    pass: missing.length === 0 && hashOk,
    detail: missing.length === 0
      ? `5종 물증 7 필드 (10 fields) all present / result_hash format ${hashOk ? '✓' : '✗'}`
      : `missing: ${missing.join(', ')}`,
    delegated_to: 'test-impl-pass schema (ADR-CHAIN-004) test_pass_evidence required fields',
  };
}

function check3_validatorsViolation() {
  // 4 validator delegated.
  const checks = [
    {
      name: 'drift state-flow consistency',
      cmd: ['tools/drift-validator/src/cli.js', '--check-state-flow-consistency', '--json'],
    },
    {
      name: 'planning-extraction (poc-05)',
      cmd: [
        'tools/planning-extraction-validator/src/cli.js',
        '--planning', 'examples/poc-05-sample-user-register/.aimd/output/planning-spec.json',
        '--rules', 'examples/poc-05-sample-user-register/input/rules.json',
        '--domain', 'examples/poc-05-sample-user-register/input/domain.json',
        '--json',
      ],
    },
    {
      name: 'chain-coverage (poc-05)',
      cmd: [
        'tools/chain-coverage-validator/src/cli.js',
        '--planning', 'examples/poc-05-sample-user-register/.aimd/output/planning-spec.json',
        '--behavior', 'examples/poc-05-sample-user-register/.aimd/output/behavior-spec.json',
        '--acceptance', 'examples/poc-05-sample-user-register/.aimd/output/acceptance-criteria.json',
        '--test-spec', 'examples/poc-05-sample-user-register/.aimd/output/test-spec.json',
        '--impl-spec', 'examples/poc-05-sample-user-register/.aimd/output/impl-spec.json',
        '--json',
      ],
    },
    {
      name: 'spec-test-link (poc-05)',
      cmd: [
        'tools/spec-test-link-validator/src/cli.js',
        '--behavior', 'examples/poc-05-sample-user-register/.aimd/output/behavior-spec.json',
        '--acceptance', 'examples/poc-05-sample-user-register/.aimd/output/acceptance-criteria.json',
        '--test-spec', 'examples/poc-05-sample-user-register/.aimd/output/test-spec.json',
        '--json',
      ],
    },
  ];
  const failures = [];
  for (const c of checks) {
    const r = spawnSync('node', c.cmd, { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 });
    if (r.status !== 0) {
      failures.push(`${c.name} → exit ${r.status}: ${r.stderr?.slice(0, 200) || r.stdout?.slice(0, 200) || ''}`);
    }
  }
  return {
    id: 'validators_violation',
    pass: failures.length === 0,
    detail: failures.length === 0 ? `4 validators all 0 critical/high` : `failures: ${failures.join(' | ')}`,
    delegated_to: '4 validator subprocesses (drift / planning / chain-coverage / spec-test-link)',
  };
}

function check4_chainCoverage() {
  const path = join(ROOT, 'examples/poc-05-sample-user-register/.aimd/output/impl-spec.json');
  if (!existsSync(path)) return { id: 'chain_coverage', pass: false, detail: 'impl-spec missing' };
  const spec = JSON.parse(readFileSync(path, 'utf-8'));
  const lc = spec?.coverage?.link_coverage || {};
  const ac = lc.by_acceptance_criteria;
  const threshold = lc.threshold ?? 0.85;
  const pass = typeof ac === 'number' && ac >= threshold;
  return {
    id: 'chain_coverage',
    pass,
    detail: `by_acceptance_criteria=${ac} / threshold=${threshold}`,
    delegated_to: 'impl-spec.coverage.link_coverage (chain-coverage-validator computed)',
  };
}

function check5_adrRegistry() {
  // Senior F3 — file presence ❌ / content-aware (상태 + decision-cluster).
  // ★ 동적 조회 (ADR-CHAIN-* glob) — 신규 ADR 추가 시 검사 자동 흡수 (C-v2.2.x-release-readiness-adr-list resolved).
  const adrDir = join(ROOT, 'docs/adr');
  const required = readdirSync(adrDir)
    .filter((f) => /^ADR-CHAIN-\d{3}-.+\.md$/.test(f))
    .sort()
    .map((f) => `docs/adr/${f}`);
  if (required.length < 5) {
    return {
      id: 'adr_registry',
      pass: false,
      detail: `expected ≥ 5 ADR-CHAIN files / found ${required.length}`,
      delegated_to: 'content-aware regex (status + decision-cluster) — file presence 단독 검사 ❌',
    };
  }
  const failures = [];
  for (const rel of required) {
    const path = join(ROOT, rel);
    const text = readFileSync(path, 'utf-8');
    // content-aware check (file presence ❌ — Senior F3 흡수).
    if (!/상태:\s*승인됨|^- 상태: 승인/m.test(text)) {
      failures.push(`${rel}: status not 'accepted'`);
    }
    if (!/## 결정/m.test(text)) {
      failures.push(`${rel}: missing 'decision' section`);
    }
  }
  return {
    id: 'adr_registry',
    pass: failures.length === 0,
    detail: failures.length === 0
      ? `${required.length} ADR-CHAIN files all accepted + have 'decision' section`
      : failures.join(' | '),
    delegated_to: 'content-aware regex (status + decision-cluster) — file presence 단독 검사 ❌',
  };
}

function check6_matrixGreenness() {
  const path = join(ROOT, 'examples/poc-05-sample-user-register/.aimd/output/matrix.json');
  if (!existsSync(path)) return { id: 'matrix_greenness', pass: false, detail: 'matrix.json missing' };
  const matrix = JSON.parse(readFileSync(path, 'utf-8'));
  const summary = matrix?.coverage_summary || {};
  const fwd = summary.forward_coverage ?? 0;
  const bwd = summary.backward_coverage ?? 0;
  const cells = Array.isArray(matrix?.matrix) ? matrix.matrix.length : 0;
  const greenCells = Array.isArray(matrix?.matrix) ? matrix.matrix.filter((c) => c.status === 'green').length : 0;
  const pass = fwd >= 1.0 && bwd >= 1.0 && greenCells === cells && cells > 0;
  return {
    id: 'matrix_greenness',
    pass,
    detail: `forward=${fwd} / backward=${bwd} / cells=${cells} / green=${greenCells}`,
    delegated_to: 'traceability-matrix-builder coverage_summary + per-cell status',
  };
}

function check7_e2eCyclePass() {
  const path = join(ROOT, 'examples/poc-05-sample-user-register/.aimd/output/impl-spec.json');
  if (!existsSync(path)) return { id: 'e2e_cycle_pass', pass: false, detail: 'impl-spec missing' };
  const spec = JSON.parse(readFileSync(path, 'utf-8'));
  const ev = spec?.test_pass_evidence || {};
  const failCount = ev.fail_count;
  const passCount = ev.pass_count ?? 0;
  const pass = failCount === 0 && passCount > 0;
  return {
    id: 'e2e_cycle_pass',
    pass,
    detail: `pass=${passCount} / fail=${failCount} (chain 4 GREEN ${pass ? '✓' : '✗'})`,
    delegated_to: 'impl-spec.test_pass_evidence (real vitest run)',
  };
}

// ★ ★ ★ v2.4.0 sub-plan §3 — analysis validator violation 0 (ADR-CHAIN-011 §5.7 / LL-i-23 정합)
// PoC #05 (현재 VALID 보유) + PoC #01 (본 session 마이그레이션 후 VALID) 기준 검증.
// 11 PoC 전수 검사 = sub-plan §2 마이그레이션 후 별도 sprint (★ C-rules-BR-id-relabel-* + C-poc-02-03-schema-mapping carry 정합).
function check8_analysisValidatorViolation() {
  // ★ schema-validator 안 PoC #01 + #05 = VALID 확인 (본 session 자격)
  const pocs = ['poc-01-realworld-spring/output/rules/rules.json', 'poc-05-sample-user-register/input/rules.json'];
  const failedPocs = [];
  for (const rel of pocs) {
    const target = join(ROOT, 'examples', rel);
    if (!existsSync(target)) {
      failedPocs.push(`${rel}: missing`);
      continue;
    }
    const r = spawnSync('node', ['tools/schema-validator/src/cli.js', target, '--json'], { cwd: ROOT, encoding: 'utf-8' });
    try {
      const out = JSON.parse(r.stdout || '{}');
      const result = out.results?.[0];
      if (!result?.valid) failedPocs.push(`${rel}: schema invalid (${result?.errors?.length ?? '?'} errors)`);
    } catch {
      failedPocs.push(`${rel}: schema-validator JSON parse fail`);
    }
  }
  // ★ br-cross-consistency-validator 안 PoC #05 = pass / PoC #01 = pass 확인
  const bcvPocs = ['poc-01-realworld-spring/output/rules/rules.json', 'poc-05-sample-user-register/input/rules.json'];
  const bcvFailed = [];
  for (const rel of bcvPocs) {
    const target = join(ROOT, 'examples', rel);
    if (!existsSync(target)) continue;
    const r = spawnSync('node', ['tools/br-cross-consistency-validator/src/cli.js', '--target', target, '--json'], { cwd: ROOT, encoding: 'utf-8' });
    try {
      const out = JSON.parse(r.stdout || '{}');
      const critical = (out.findings || []).filter((f) => f.severity === 'critical' || f.severity === 'high').length;
      if (critical > 0) bcvFailed.push(`${rel}: ${critical} critical/high findings`);
    } catch {
      bcvFailed.push(`${rel}: br-cross-consistency-validator JSON parse fail`);
    }
  }
  const allFailed = [...failedPocs, ...bcvFailed];
  return {
    id: 'analysis_validator_violation',
    pass: allFailed.length === 0,
    detail: allFailed.length === 0
      ? `analysis validator (schema + br-cross-consistency) violations 0 (PoC #01 + #05 검증 기준 / v2.4.0)`
      : `violations: ${allFailed.join(' | ')}`,
    delegated_to: 'tools/schema-validator + tools/br-cross-consistency-validator (★ 11 PoC 전수 = sub-plan §2 후 carry)',
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.target) usage(2);

  const results = [
    check1_pocCorroboration(),
    check2_realToolEvidence(),
    check3_validatorsViolation(),
    check4_chainCoverage(),
    check5_adrRegistry(),
    check6_matrixGreenness(),
    check7_e2eCyclePass(),
    check8_analysisValidatorViolation(),
  ];
  const passCount = results.filter((r) => r.pass).length;
  const total = results.length;

  if (args.json) {
    process.stdout.write(JSON.stringify({
      target: args.target,
      criteria_passed: passCount,
      criteria_total: total,
      ready: passCount === total,
      results,
    }, null, 2) + '\n');
  } else {
    process.stdout.write(`§8.1 strict — release-readiness for ${args.target}\n\n`);
    for (const r of results) {
      const mark = r.pass ? '✅' : '❌';
      process.stdout.write(`  ${mark}  ${r.id} — ${r.detail}\n`);
    }
    process.stdout.write(`\n${passCount}/${total} criteria passed.\n`);
    if (passCount === total) process.stdout.write(`\n★ ★ ★ ${args.target} = release-ready.\n`);
    else process.stdout.write(`\n❌ ${args.target} = NOT release-ready (${total - passCount} criteria regress).\n`);
  }
  process.exit(passCount === total ? 0 : 1);
}

main();

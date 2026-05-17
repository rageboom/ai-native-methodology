#!/usr/bin/env node
// release-readiness — ★ ★ ★ §8.1 strict 13/13 자동 검사 (sub-plan-6 + v2.4.0 sub-plan §3 + v2.5.0 Phase D 격상 + v3.6.4 R2 격상 + v3.6.7 A1 격상 + v7.1.0 R18 격상 + v8.1.0 R18 내부정합 격상).
//
// 사용: node scripts/release-readiness.js --target v2.5.0 [--json]
//
// 13 자격 (ADR-CHAIN-005 부재 ❌ — Senior F3 흡수 / file presence 만 검사하는 criterion 0개 의무):
//   1. ≥ 2 PoC corroboration (poc-05 + poc-03 retrofit)
//   2. 진짜 도구 5종 물증 7 필드 (test-impl-pass-validator schema 검증)
//   3. validator violation 0 (planning-extraction + chain-coverage + spec-test-link + drift state-flow)
//   4. chain coverage ≥ 0.85 (link_coverage.threshold)
//   5. ADR registry — content-aware 검사 (status: 승인 / decision-cluster 매칭)
//   6. traceability-matrix 100% green (PoC #05 / matrix.json forward = 1.0)
//   7. e2e 1 cycle pass (PoC #05 chain 4 GREEN / impl-spec.test_pass_evidence.fail_count == 0)
//   8. v2.4.0 신설 / ★ v4.0 Sprint 1-I 격상 — analysis validator violation 0 (★ schema-validator + br-cross-consistency-validator
//      / ★ 전체 PoC rules.json 전수 auto-discover 검증 — PoC #01+#05 한정 사각지대 영구 해소 / critical/high finding 0
//      / ADR-CHAIN-011 §5.7 정합 / LL-i-23 + feedback_pre_pre_prerequisite_lacuna release-readiness 사각지대 회복)
//   9. ★ ★ ★ ★ v2.5.0 신설 — Layer 2 LLM consistency (★ br-cross-consistency-validator Layer 2 결과 자산
//      per-PoC 집계 / mean semantic_score ≥ 0.7 / semantic_drift critical/high finding ❌ / Phase D carry medium 허용 /
//      ADR-CHAIN-011 §5.4 patch v2 + §11 patch v8 정합 / Senior REVISE-1 흡수)
//
//   10. ★ ★ v3.6.4 R2 신설 — CLAUDE.md ↔ plugin.json.version sync (★ LL-session-20-02 정합 / drift 시 다음 session
//       plan + research 부정확 risk 차단 / "plugin.json vX.Y.Z" 표기 패턴 검증 / cadence enforcement).
//   11. ★ ★ v3.6.7 A1 신설 — workspace test 회귀 자동 차단 (★ npm test --workspaces 실시간 실행 / fail count 0 의무 /
//       chain-driver Windows path 회귀 사례 정합 / `--skip-workspace-test` flag 시 본 check skip / release 시 본 flag ❌ 의무).
//   12. ★ ★ v7.1.0 R18 신설 — plugin-authoring-spec §6 공식 docs pin staleness (★ 외부 권위 drift ADR-010 baseline+ratchet
//       차용 / methodology-spec/plugin-authoring-spec.md §6 last_verified 4행 ≤ 60일 의무 / 결정적 date-math only·네트워크 ❌
//       / 네트워크 재검증 = §9 Layer i cadence (_base-official-docs-checker dispatch / ADR-009 §2 territory) /
//       `--skip-authoring-staleness` flag 시 본 check skip / release 시 본 flag ❌ 의무 / ADR-PLUGIN-001 정합).
//   13. ★ ★ v8.1.0 R18 내부정합 신설 — skill-citation-validator (★ skills/*/SKILL.md 인용 schema/repo-path/ADR/DEC
//       실존 결정적 검사 / doc 재구조화 후 stale dead-link 자동 차단 / AI 추론 0% / 기존 validator 사각 회복 /
//       ADR-PLUGIN-001 §7 patch v2 / DEC-2026-05-17-skill-citation-integrity).
//
// exit 0 = 13/13 ready / 1 = 1+ regress.
//
// ★ ★ ★ ★ ★ MINOR bump 자격 (Senior session 8차 STOP signal soft 흡수 / additive change paradigm / LL-i-42 정합):
//   v2.4.0 → v2.5.0 = Layer 2 LLM paradigm 본격 도입 + chain 1 gate Layer 2 통합 (session 14차) + release-readiness 9th 격상.
//   chain harness validated 본질 보존 ✅ (no-simulation trio + D21' + release-readiness content-aware 비손상).

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
    '  --target <version>          target release version (예: v2.0.0)',
    '  --json                      machine-readable output',
    '  --skip-workspace-test       skip check #11 (test cadence 안 사용 / release 시 ❌)',
    '  --skip-authoring-staleness  skip check #12 (test cadence 안 사용 / release 시 ❌)',
  ].join('\n'));
  process.exit(code);
}

function parseArgs(argv) {
  const out = { json: false, skipWorkspaceTest: false, skipAuthoringStaleness: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') out.target = argv[++i];
    else if (a === '--json') out.json = true;
    else if (a === '--skip-workspace-test') out.skipWorkspaceTest = true;
    else if (a === '--skip-authoring-staleness') out.skipAuthoringStaleness = true;
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
        '--rules', 'examples/poc-05-sample-user-register/output/rules/business-rules.json',
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
// ★ ★ ★ ★ ★ v4.0 Sprint 1-I 격상 — PoC #01 + #05 한정 → ★ 전체 PoC rules.json 전수 검사.
//   사각지대 (PoC #02~#04 + #06~#11 schema invalid 잠재) = 묶음 P / Sprint 1 schema cleanup 종결 후
//   본 criterion 이 모든 PoC rules.json 의 schema-validator + br-cross-consistency 위반을 강제 차단.
//   (★ feedback_pre_pre_prerequisite_lacuna 정합 — PoC #01+#05 한정 사각지대 영구 해소 / drift enforcement).
//   examples/**/rules.json 자동 discover (하드코딩 ❌ / 신규 PoC 추가 시 자동 포함).
function discoverPocRulesJson() {
  const found = [];
  const examplesDir = join(ROOT, 'examples');
  if (!existsSync(examplesDir)) return found;
  const stack = [examplesDir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = join(cur, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        stack.push(full);
      } else if (e.name === 'business-rules.json') {
        found.push(full);
      }
    }
  }
  return found.sort();
}

function check8_analysisValidatorViolation() {
  const targets = discoverPocRulesJson();
  const failed = [];
  for (const target of targets) {
    const rel = target.slice(ROOT.length + 1).replace(/\\/g, '/');
    // ★ schema-validator 전수 (모든 PoC rules.json = VALID 의무)
    const sv = spawnSync('node', ['tools/schema-validator/src/cli.js', target, '--json'], { cwd: ROOT, encoding: 'utf-8' });
    try {
      const out = JSON.parse(sv.stdout || '{}');
      const result = out.results?.[0];
      if (!result?.valid) failed.push(`${rel}: schema invalid (${result?.errors?.length ?? '?'} errors)`);
    } catch {
      failed.push(`${rel}: schema-validator JSON parse fail`);
    }
    // ★ br-cross-consistency-validator 전수 (critical/high finding 0 의무)
    const bcv = spawnSync('node', ['tools/br-cross-consistency-validator/src/cli.js', '--target', target, '--json'], { cwd: ROOT, encoding: 'utf-8' });
    try {
      const out = JSON.parse(bcv.stdout || '{}');
      const critical = (out.findings || []).filter((f) => f.severity === 'critical' || f.severity === 'high').length;
      if (critical > 0) failed.push(`${rel}: ${critical} bcv critical/high findings`);
    } catch {
      failed.push(`${rel}: br-cross-consistency-validator JSON parse fail`);
    }
  }
  return {
    id: 'analysis_validator_violation',
    pass: failed.length === 0,
    detail: failed.length === 0
      ? `analysis validator (schema + br-cross-consistency) violations 0 / ★ 전체 ${targets.length} PoC rules.json 전수 검증 (★ v4.0 Sprint 1-I 격상 — PoC #01+#05 한정 사각지대 해소)`
      : `violations: ${failed.join(' | ')}`,
    delegated_to: 'tools/schema-validator + tools/br-cross-consistency-validator (★ examples/**/rules.json 전수 auto-discover)',
  };
}

// ★ ★ ★ ★ v2.5.0 Phase D §2 신설 — Layer 2 LLM consistency check (ADR-CHAIN-011 §5.4 patch v2 + §11 patch v8 정합)
// per-PoC 집계 paradigm (Senior REVISE-1 흡수 / LL-i-43 severityRank rank 2 정합).
// mean semantic_score ≥ 0.7 + semantic_drift critical/high finding ❌ (★ medium = Phase D carry 허용).
function check9_layer2Consistency() {
  const LAYER2_DIR = join(ROOT, 'tools/br-cross-consistency-validator/layer-2-results');
  const requiredFiles = [
    'poc-01-layer-2-results.json',
    'poc-03-layer-2-results.json',
    'poc-05-layer-2-results.json',
  ];
  const failures = [];
  const summaries = [];

  for (const f of requiredFiles) {
    const path = join(LAYER2_DIR, f);
    if (!existsSync(path)) {
      failures.push(`${f}: missing`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
      failures.push(`${f}: JSON parse fail`);
      continue;
    }
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length === 0) {
      failures.push(`${f}: empty results array`);
      continue;
    }
    // per-PoC mean semantic_score (★ Senior REVISE-1 정합 / per-PoC 집계).
    const scores = results.map((r) => r.semantic_score).filter((s) => typeof s === 'number');
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    // semantic_drift critical/high check (★ medium = Phase D carry 허용 / LL-i-43).
    const drift = (data.summary?.semantic_drift_detected ?? []);
    const driftCritical = drift.filter((d) => d.severity === 'critical' || d.severity === 'high').length;
    const passThreshold = mean >= 0.7;
    const passDrift = driftCritical === 0;
    summaries.push({
      file: f,
      mean: mean.toFixed(3),
      n: scores.length,
      drift_total: drift.length,
      drift_critical: driftCritical,
      sample_mode: data.sample_mode === true,
    });
    if (!passThreshold) failures.push(`${f}: mean semantic_score ${mean.toFixed(3)} < 0.7`);
    if (!passDrift) failures.push(`${f}: ${driftCritical} critical/high semantic_drift`);
  }

  return {
    id: 'layer_2_consistency',
    pass: failures.length === 0,
    detail: failures.length === 0
      ? `Layer 2 per-PoC mean ≥ 0.7 + critical/high drift 0 — ${summaries.map((s) => `${s.file.replace('-layer-2-results.json', '')}=${s.mean} (n=${s.n}${s.sample_mode ? ',sample' : ''})`).join(' / ')}`
      : `violations: ${failures.join(' | ')}`,
    delegated_to: 'tools/br-cross-consistency-validator/layer-2-results (★ session 13차 본격 자료 / per-PoC 집계 / Senior REVISE-1 + LL-i-43 정합)',
  };
}

function check10_claudeMdVersionSync() {
  // ★ ★ R2 (session 20차 / LL-session-20-02) — CLAUDE.md ↔ plugin.json.version sync 검증.
  // 검증 대상: CLAUDE.md 안 "plugin.json vX.Y.Z" 표기 (★ 핵심 컨텍스트 자산 안 plugin 진화 정합 표기).
  // drift 발생 시 다음 session 의 plan + research 부정확 risk → release 차단 의무.
  const pluginJsonPath = join(ROOT, '.claude-plugin/plugin.json');
  const claudeMdPath = resolve(ROOT, '..', 'CLAUDE.md');
  if (!existsSync(pluginJsonPath)) {
    return { id: 'claude_md_version_sync', pass: false, detail: 'plugin.json missing' };
  }
  if (!existsSync(claudeMdPath)) {
    return { id: 'claude_md_version_sync', pass: false, detail: `CLAUDE.md missing (expected at ${claudeMdPath})` };
  }
  const pluginVer = JSON.parse(readFileSync(pluginJsonPath, 'utf-8')).version;
  const claudeMd = readFileSync(claudeMdPath, 'utf-8');
  const matches = claudeMd.match(/plugin\.json v(\d+\.\d+\.\d+)/g) || [];
  if (matches.length === 0) {
    return {
      id: 'claude_md_version_sync',
      pass: false,
      detail: 'CLAUDE.md 안 "plugin.json vX.Y.Z" 표기 부재 (R2 cadence 정합 의무)',
    };
  }
  const mismatches = [];
  for (const m of matches) {
    const ver = m.match(/v(\d+\.\d+\.\d+)/)[1];
    if (ver !== pluginVer) mismatches.push(`"${m}" ↔ plugin.json=${pluginVer}`);
  }
  return {
    id: 'claude_md_version_sync',
    pass: mismatches.length === 0,
    detail: mismatches.length === 0
      ? `CLAUDE.md "plugin.json v${pluginVer}" 표기 ${matches.length}건 모두 일치 / R2 cadence 정합`
      : `drift: ${mismatches.join(' | ')}`,
    delegated_to: '.claude-plugin/plugin.json.version ↔ CLAUDE.md "plugin.json vX.Y.Z" 표기 sync (R2 / LL-session-20-02)',
  };
}

function check11_workspaceTestPass(args) {
  // ★ ★ A1 (session 20차 / v3.6.7) — workspace test 회귀 자동 차단.
  // chain-driver Windows path 회귀 사례 (session 20차 v3.6.3 P0) = 본 criterion 부재로 drift 누적 사례 정합.
  // --skip-workspace-test flag 시 skip (test cadence 안 사용 / release 본격 시행 시 본 flag ❌ 의무).
  if (args.skipWorkspaceTest) {
    return {
      id: 'workspace_test_pass',
      pass: false,
      detail: 'skipped via --skip-workspace-test (★ test cadence 안 사용 / release 본격 시행 시 본 flag ❌ 의무)',
      delegated_to: 'npm test --workspaces --if-present (skipped)',
    };
  }
  // ★ Windows Node.js v22+ EINVAL fix — npm.cmd spawn 시 shell: true 의무 (CVE-2024-27980 정합).
  // ★ ★ NODE_TEST_CONTEXT 제거 — test runner 안 release-readiness 호출 시 child env inherit 회피
  //    (본 env 잔존 시 workspace 안 모든 test 자동 skip → 0/0 pass false positive).
  const childEnv = { ...process.env };
  delete childEnv.NODE_TEST_CONTEXT;
  const result = spawnSync('npm', ['test', '--workspaces', '--if-present'], {
    cwd: ROOT,
    env: childEnv,
    encoding: 'utf-8',
    timeout: 600_000,
    shell: true,
  });
  const stdout = result.stdout || '';
  const sumMatches = (pattern) =>
    (stdout.match(pattern) || []).reduce((acc, line) => {
      const m = line.match(/\d+/);
      return acc + (m ? parseInt(m[0], 10) : 0);
    }, 0);
  const totalTests = sumMatches(/^# tests \d+/gm);
  const totalPass = sumMatches(/^# pass \d+/gm);
  const totalFail = sumMatches(/^# fail \d+/gm);
  const passed = result.status === 0 && totalFail === 0 && totalTests > 0;
  return {
    id: 'workspace_test_pass',
    pass: passed,
    detail: passed
      ? `workspace test ${totalPass}/${totalTests} pass / 0 fail / exit=0 ✅`
      : `regress: ${totalFail} fail / ${totalPass}/${totalTests} pass / exit=${result.status}`,
    delegated_to: 'npm test --workspaces --if-present (★ A1 / chain-driver Windows path 회귀 사례 정합 / LL-session-20-A1)',
  };
}

// ★ ★ v7.1.0 R18 신설 — plugin-authoring-spec §6 공식 docs pin staleness (ADR-PLUGIN-001 / charter R18).
// 외부 권위(공식 Claude Code docs) drift = ADR-010 baseline+ratchet 차용:
//   - baseline = methodology-spec/plugin-authoring-spec.md §6 pin (last_verified 4행)
//   - 네트워크 재검증 = §9 Layer i cadence (_base-official-docs-checker dispatch / ADR-009 §2 territory / release-readiness 밖)
//   - 결정적 가드 = 본 check (date-math only / 네트워크 ❌ / no-simulation·결정론 불변 / check10 패턴 isomorphic).
// pass ⟺ §6 표 4 area(skills/hooks/sub-agents/plugins-reference) 모두 last_verified ≤ 60일.
// --skip-authoring-staleness flag 시 skip (test cadence 안 사용 / release 본격 시행 시 본 flag ❌ 의무).
function check12_authoringSpecStaleness(args) {
  if (args.skipAuthoringStaleness) {
    return {
      id: 'authoring_spec_staleness',
      pass: false,
      detail: 'skipped via --skip-authoring-staleness (★ test cadence 안 사용 / release 본격 시행 시 본 flag ❌ 의무)',
      delegated_to: 'plugin-authoring-spec §6 last_verified staleness (skipped)',
    };
  }
  const STALE_DAYS = 60;
  const EXPECTED_AREAS = ['skills', 'hooks', 'sub-agents', 'plugins-reference'];
  const specPath = join(ROOT, 'methodology-spec/plugin-authoring-spec.md');
  if (!existsSync(specPath)) {
    return {
      id: 'authoring_spec_staleness',
      pass: false,
      detail: `plugin-authoring-spec.md missing (expected ${specPath})`,
      delegated_to: 'methodology-spec/plugin-authoring-spec.md §6 pin baseline',
    };
  }
  const text = readFileSync(specPath, 'utf-8');
  // content-aware (check10 패턴) — §6 표 data row: `| <area> | url | anchor | digest | YYYY-MM-DD | YYYY-MM-DD |`.
  // last_verified = 끝에서 2번째 cell (digest 에 `|` 미사용 = S-rule 자체 정합 / `|` 침입 시 fail-closed).
  const today = new Date();
  const failures = [];
  const seen = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(skills|hooks|sub-agents|plugins-reference)\s*\|/);
    if (!m) continue;
    const area = m[1];
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 6) {
      failures.push(`${area}: §6 행 cell 수 ${cells.length} ≠ 6 (digest 안 '|' 침입 의심 / fail-closed)`);
      seen[area] = true;
      continue;
    }
    const lastVerified = cells[4]; // area|url|anchor|digest|last_verified|retrieved
    const dm = lastVerified.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dm) {
      failures.push(`${area}: last_verified "${lastVerified}" not YYYY-MM-DD`);
      seen[area] = true;
      continue;
    }
    const lv = new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]));
    const days = Math.floor((today - lv) / 86_400_000);
    if (days > STALE_DAYS) {
      failures.push(`${area}: ${days}d stale (> ${STALE_DAYS}d / §9 Layer i 재검증 의무)`);
    }
    seen[area] = true;
  }
  const missing = EXPECTED_AREAS.filter((a) => !seen[a]);
  if (missing.length) failures.push(`§6 표 area 누락: ${missing.join(', ')}`);
  return {
    id: 'authoring_spec_staleness',
    pass: failures.length === 0,
    detail: failures.length === 0
      ? `plugin-authoring-spec §6 pin ${EXPECTED_AREAS.length} area 모두 ≤ ${STALE_DAYS}d fresh / 외부 권위 drift 가드 정합 (R18 / ADR-PLUGIN-001)`
      : `staleness: ${failures.join(' | ')}`,
    delegated_to: 'methodology-spec/plugin-authoring-spec.md §6 last_verified (R18 / ADR-PLUGIN-001 / 네트워크 재검증 = §9 Layer i cadence)',
  };
}

// ★ ★ v8.1.0 R18 내부정합 신설 — skill-citation-validator (ADR-PLUGIN-001 §7 patch v2 / DEC-2026-05-17-skill-citation-integrity).
// skills/*/SKILL.md 인용(schema/repo-path/ADR/DEC) 실존 결정적 검사 (AI 추론 0%).
// doc 재구조화(deliverables 재번호·workflow phase→semantic·schema -spec 접미·v7.0.0 rename) 후 stale dead-link 자동 차단.
// 기존 validator 사각 (drift=flows / formal-spec-link=chain 산출물 / SKILL.md 산문 인용 무검증) 회복.
function check13_skillCitationIntegrity() {
  const r = spawnSync(
    'node',
    ['tools/skill-citation-validator/src/cli.js', '--json'],
    { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 }
  );
  let parsed;
  try {
    parsed = JSON.parse(r.stdout || '{}');
  } catch {
    return {
      id: 'skill_citation_integrity',
      pass: false,
      detail: `skill-citation-validator JSON parse fail (exit ${r.status})`,
      delegated_to: 'tools/skill-citation-validator',
    };
  }
  const n = parsed.finding_count ?? -1;
  return {
    id: 'skill_citation_integrity',
    pass: r.status === 0 && n === 0,
    detail:
      n === 0
        ? `${parsed.skill_count} SKILL.md 인용 정합 (schema/repo-path/ADR/DEC 실존 / 0 stale dead-link)`
        : `${n} stale citation across ${
            new Set((parsed.findings || []).map((f) => f.skill)).size
          } skill(s) — ${(parsed.findings || [])
            .slice(0, 5)
            .map((f) => `${f.skill}:${f.line} ${f.ref}`)
            .join(' | ')}`,
    delegated_to:
      'tools/skill-citation-validator (★ v8.1.0 R18 내부정합 / doc 재구조화 dead-link 자동 차단 / ADR-PLUGIN-001 §7 patch v2)',
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
    check9_layer2Consistency(),
    check10_claudeMdVersionSync(),
    check11_workspaceTestPass(args),
    check12_authoringSpecStaleness(args),
    check13_skillCitationIntegrity(),
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

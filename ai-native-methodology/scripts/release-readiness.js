#!/usr/bin/env node
// release-readiness — ★ ★ ★ §8.1 strict 24/24 자동 검사 (sub-plan-6 + v2.4.0 sub-plan §3 + v2.5.0 Phase D 격상 + v3.6.4 R2 격상 + v3.6.7 A1 격상 + v7.1.0 R18 격상 + v8.1.0 R18 내부정합 격상 + v10.0.0 Phase 4-4' 3 criterion 격상 + v11.x dep-graph/template/plan criterion + INSPECTION-2026-05-31 C12 check24 agent-skills-phaseflow-sync).
//
// 사용: node scripts/release-readiness.js --target v2.5.0 [--json]
//
// 22 자격 (★ #1~#13 상세 아래 + #14~#22 = main() check14~check22 inline 주석 / ADR-CHAIN-005 부재 ❌ — Senior F3 흡수 / file presence 만 검사하는 criterion 0개 의무):
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
//   12. ★ ★ v7.1.0 R18 신설 / ★ v8.2.0 digest_sha 강화 — plugin-authoring-spec §6 공식 docs pin staleness + content-commitment
//       (★ 외부 권위 drift ADR-010 baseline+ratchet 차용 / §6 last_verified 4행 ≤ 60일 + ★ digest_sha = sha256(digest) 선두
//       12hex 재계산 일치 의무 (날짜만 갱신·digest 무단편집 동시 결정적 차단 / §9 Layer i 불변식) / date-math+hash only·네트워크 ❌
//       / 네트워크 재검증 = §9 Layer i cadence (_base-official-docs-checker dispatch / ADR-009 §2 territory) /
//       `--skip-authoring-staleness` flag 시 본 check skip / release 시 본 flag ❌ 의무 / ADR-PLUGIN-001 §7 patch v4 정합).
//   13. ★ ★ v8.1.0 R18 내부정합 신설 — skill-citation-validator (★ skills/*/SKILL.md 인용 schema/repo-path/ADR/DEC
//       실존 결정적 검사 / doc 재구조화 후 stale dead-link 자동 차단 / AI 추론 0% / 기존 validator 사각 회복 /
//       ADR-PLUGIN-001 §7 patch v2 / DEC-2026-05-17-skill-citation-integrity).
//
// exit 0 = 24/24 ready / 1 = 1+ regress.
//
// ★ ★ ★ ★ ★ MINOR bump 자격 (Senior session 8차 STOP signal soft 흡수 / additive change paradigm / LL-i-42 정합):
//   v2.4.0 → v2.5.0 = Layer 2 LLM paradigm 본격 도입 + chain 1 gate Layer 2 통합 (session 14차) + release-readiness 9th 격상.
//   chain harness validated 본질 보존 ✅ (no-simulation trio + D21' + release-readiness content-aware 비손상).

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// ★ v11.29.0 REVISE-2 — PII / 사내 신원 패턴 SSOT (regex 복사 ❌ / drift attractor 회피). check27 + adopter-evidence-packager 공용.
import { INTERNAL_IDENTITY_RE } from '../tools/_shared/pii-patterns.js';

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
    '  --skip-preflight            skip check #14 (★ F-V2-05 — verifier env 외부 도구 검사 / release 시 ❌)',
    '  --no-strict-code-pointers   check #16 strict 완화 (★ dep-graph P2 — PoC 백필 완료로 strict 기본 / 회귀 비상용 / release 시 ❌)',
  ].join('\n'));
  process.exit(code);
}

function parseArgs(argv) {
  const out = { json: false, skipWorkspaceTest: false, skipAuthoringStaleness: false, skipPreflight: false, noStrictCodePointers: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') out.target = argv[++i];
    else if (a === '--json') out.json = true;
    else if (a === '--skip-workspace-test') out.skipWorkspaceTest = true;
    else if (a === '--skip-authoring-staleness') out.skipAuthoringStaleness = true;
    else if (a === '--skip-preflight') out.skipPreflight = true;
    else if (a === '--no-strict-code-pointers') out.noStrictCodePointers = true;
    else if (a === '--help' || a === '-h') usage(0);
  }
  return out;
}

function check1_pocCorroboration() {
  const candidates = readdirSync(join(ROOT, 'examples'))
    .filter((d) => d.startsWith('poc-'))
    .filter((d) => {
      // ★ v11.0.0 — discovery-spec.json (planning-spec.json legacy 별칭 제거 / refactor: tooling-audit-cleanup)
      const base = join(ROOT, 'examples', d, '.aimd/output');
      return existsSync(join(base, 'discovery-spec.json'));
    });
  return {
    id: 'poc_corroboration',
    pass: candidates.length >= 2,
    detail: `found ${candidates.length} PoC with chain harness output: ${candidates.join(', ')}`,
    delegated_to: 'examples/*/.aimd/output/discovery-spec.json (★ v11.0.0) existence + valid schema',
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
  // 5 validator delegated.
  const checks = [
    {
      name: 'drift state-flow consistency',
      cmd: ['tools/drift-validator/src/cli.js', '--check-state-flow-consistency', '--json'],
    },
    {
      name: 'discovery-extraction (poc-05)',
      cmd: [
        'tools/discovery-extraction-validator/src/cli.js',
        '--discovery', 'examples/poc-05-sample-user-register/.aimd/output/discovery-spec.json',
        '--rules', 'examples/poc-05-sample-user-register/output/rules/business-rules.json',
        '--domain', 'examples/poc-05-sample-user-register/input/domain.json',
        '--json',
      ],
    },
    {
      name: 'chain-coverage (poc-05)',
      cmd: [
        'tools/chain-coverage-validator/src/cli.js',
        '--discovery', 'examples/poc-05-sample-user-register/.aimd/output/discovery-spec.json',
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
    {
      name: 'drift handoff-consistency',
      cmd: ['tools/drift-validator/src/cli.js', '--check-handoff-consistency', '--json'],
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
    detail: failures.length === 0 ? `5 validators all 0 critical/high` : `failures: ${failures.join(' | ')}`,
    delegated_to: '5 validator subprocesses (drift state-flow + handoff / discovery-extraction / chain-coverage / spec-test-link)',
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
// ★ ★ ★ v8.6.0+ F-V2C2-1-01 fix — analysis (business-rules.json) + ★ chain 1~4 산출물 6종
//   (planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix)
//   까지 schema-validator 전수 검사 scope 확장. release-readiness 가 "release-ready" 보고 시 분석 stage 뿐
//   아니라 chain harness 산출물 quality 도 자동 검증 의무 (cycle-2 발견 — F-V2C2-1-01 / V2C2-1-02).
//   br-cross-consistency-validator 는 business-rules.json 만 적용 (chain artifact 미적용).
//   examples/**/{business-rules,planning-spec,behavior-spec,acceptance-criteria,test-spec,impl-spec,traceability-matrix}.json 자동 discover.
const ANALYSIS_VALIDATOR_TARGETS = new Set([
  'business-rules.json',        // analysis stage (R15 baseline / br-cross-consistency 의무)
  'discovery-spec.json',        // chain 1 (★ v11.0.0 — DEC-2026-05-26-discovery-spec-rename)
  'behavior-spec.json',         // chain 2
  'acceptance-criteria.json',   // chain 2
  'task-plan.json',             // chain 3 (★ v9.x plan stage)
  'test-spec.json',             // chain 4
  'impl-spec.json',             // chain 5
  'traceability-matrix.json',   // cross-chain
  'ticket-sync-evidence.json',  // ★ v8.6.1+ R20 (DEC-2026-05-18-r20-mcp-ticket-sync-channel) — MCP 호출 evidence
]);

function discoverPocSchemaArtifacts() {
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
        if (e.name === 'node_modules') continue;
        // ★ v8.6.0+ F-V2C2-1-01 fix — `.aimd/` 는 chain artifact 표준 위치 (lifecycle-contract.md §파일 위치 컨벤션 정합) — skip 금지.
        // 그 외 dotfile (`.git`, `.idea`, `.vscode` 등) 은 그대로 skip.
        if (e.name.startsWith('.') && e.name !== '.aimd') continue;
        stack.push(full);
      } else if (ANALYSIS_VALIDATOR_TARGETS.has(e.name)) {
        found.push(full);
      }
    }
  }
  return found.sort();
}

// Backward-compat alias (다른 곳에서 import 시 회귀 차단).
function discoverPocRulesJson() {
  return discoverPocSchemaArtifacts().filter(p => p.endsWith('business-rules.json'));
}

function check8_analysisValidatorViolation() {
  const targets = discoverPocSchemaArtifacts();
  const failed = [];
  let businessRulesCount = 0;
  let chainArtifactCount = 0;
  for (const target of targets) {
    const rel = target.slice(ROOT.length + 1).replace(/\\/g, '/');
    const isBusinessRules = target.endsWith('business-rules.json');
    if (isBusinessRules) businessRulesCount++; else chainArtifactCount++;

    // ★ schema-validator 전수 (모든 PoC 산출물 = VALID 의무 / chain 1~4 산출물 포함)
    const sv = spawnSync('node', ['tools/schema-validator/src/cli.js', target, '--json'], { cwd: ROOT, encoding: 'utf-8' });
    try {
      const out = JSON.parse(sv.stdout || '{}');
      const result = out.results?.[0];
      if (!result?.valid) failed.push(`${rel}: schema invalid (${result?.errors?.length ?? '?'} errors)`);
    } catch {
      failed.push(`${rel}: schema-validator JSON parse fail`);
    }

    // ★ br-cross-consistency-validator = business-rules.json 만 적용 (chain artifact 미적용)
    if (isBusinessRules) {
      const bcv = spawnSync('node', ['tools/br-cross-consistency-validator/src/cli.js', '--target', target, '--json'], { cwd: ROOT, encoding: 'utf-8' });
      try {
        const out = JSON.parse(bcv.stdout || '{}');
        const critical = (out.findings || []).filter((f) => f.severity === 'critical' || f.severity === 'high').length;
        if (critical > 0) failed.push(`${rel}: ${critical} bcv critical/high findings`);
      } catch {
        failed.push(`${rel}: br-cross-consistency-validator JSON parse fail`);
      }
    }
  }
  return {
    id: 'analysis_validator_violation',
    pass: failed.length === 0,
    detail: failed.length === 0
      ? `analysis validator (schema + br-cross-consistency) violations 0 / ★ ${businessRulesCount} business-rules + ${chainArtifactCount} chain artifact 전수 검증 (★ v8.6.0+ F-V2C2-1-01 fix — chain 1~4 산출물 scope 확장)`
      : `violations (${failed.length}): ${failed.slice(0, 5).join(' | ')}${failed.length > 5 ? ` | ...+${failed.length - 5} more` : ''}`,
    delegated_to: 'tools/schema-validator + tools/br-cross-consistency-validator (★ examples/**/{business-rules,planning-spec,behavior-spec,acceptance-criteria,test-spec,impl-spec,traceability-matrix}.json 전수 auto-discover)',
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
  // ★ v8.6.0 fix — node:test 출력 prefix 변동 양쪽 지원 (`# tests N` 또는 `ℹ tests N` / U+2139).
  //   본 환경 sandbox 에서 spawnSync child output 이 ℹ prefix 만 emit → 0 collect false positive 회피.
  const totalTests = sumMatches(/^(?:# |ℹ )tests \d+/gm);
  const totalPass = sumMatches(/^(?:# |ℹ )pass \d+/gm);
  const totalFail = sumMatches(/^(?:# |ℹ )fail \d+/gm);
  const passed = result.status === 0 && totalFail === 0 && totalTests > 0;
  // ★ F-V1-01 fix — 0 tests collected 별도 inconclusive 분기 (환경 진단 안내).
  // 이전: 0/0 → pass=false / detail="regress: 0 fail / 0/0 pass / exit=0" (정확하지만 환경 vs 회귀 구분 불가)
  // 갱신: 0/0 → pass=false + status:'inconclusive' + detail = 환경 진단 (release 차단 효과 동일)
  const inconclusive = result.status === 0 && totalFail === 0 && totalTests === 0;
  return {
    id: 'workspace_test_pass',
    pass: passed,
    ...(inconclusive ? { status: 'inconclusive' } : {}),
    detail: passed
      ? `workspace test ${totalPass}/${totalTests} pass / 0 fail / exit=0 ✅`
      : inconclusive
        ? `inconclusive — 0 tests collected / exit=${result.status} (★ npm workspaces 인식 실패 또는 test script 부재. 사내 환경: package.json workspaces 필드 + 각 workspace 의 test script + node ≥18 + NODE_TEST_CONTEXT env 제거 확인 의무 / release 차단 효과 동일)`
        : `regress: ${totalFail} fail / ${totalPass}/${totalTests} pass / exit=${result.status}`,
    delegated_to: 'npm test --workspaces --if-present (★ A1 / chain-driver Windows path 회귀 사례 정합 / LL-session-20-A1)',
  };
}

// ★ ★ v7.1.0 R18 신설 — plugin-authoring-spec §6 공식 docs pin staleness (ADR-PLUGIN-001 / charter R18).
// 외부 권위(공식 Claude Code docs) drift = ADR-010 baseline+ratchet 차용:
//   - baseline = methodology-spec/plugin-authoring-spec.md §6 pin (last_verified 4행)
//   - 네트워크 재검증 = §9 Layer i cadence (_base-official-docs-checker dispatch / ADR-009 §2 territory / release-readiness 밖)
//   - 결정적 가드 = 본 check (date-math + digest_sha 재계산 only / 네트워크 ❌ / no-simulation·결정론 불변 / check10 패턴 isomorphic).
// pass ⟺ §6 표 4 area 모두 last_verified ≤ 60일 AND digest_sha 일치 (★ v8.2.0) AND `_base-` 자산 = 정확 8 allowlist (★ v8.2.1 §8-2 documented-exception no-loophole).
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
  // content-aware (check10 패턴) — §6 표 data row (★ v8.2.0 7-cell):
  //   `| <area> | url | anchor | digest | digest_sha | YYYY-MM-DD | YYYY-MM-DD |`.
  // digest 에 `|` 미사용 = S-rule 자체 정합 / `|` 침입 시 cell 수 ≠ 7 → fail-closed.
  // ★ v8.2.0 digest_sha = sha256(trim(digest)) 선두 12 hex 재계산 일치 의무 (§9 Layer i 불변식 / 날짜만 갱신·digest 무단편집 동시 차단).
  const today = new Date();
  const failures = [];
  const seen = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(skills|hooks|sub-agents|plugins-reference)\s*\|/);
    if (!m) continue;
    const area = m[1];
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 7) {
      failures.push(`${area}: §6 행 cell 수 ${cells.length} ≠ 7 (digest 안 '|' 침입 의심 / fail-closed)`);
      seen[area] = true;
      continue;
    }
    // area|url|anchor|digest|digest_sha|last_verified|retrieved
    const expectedSha = createHash('sha256').update(cells[3]).digest('hex').slice(0, 12);
    if (expectedSha !== cells[4]) {
      failures.push(`${area}: digest_sha 불일치 (커밋 ${cells[4]} ≠ 재계산 ${expectedSha} / digest 변경 후 hash 미재커밋 / §9 Layer i 불변식 위반)`);
      seen[area] = true;
      continue;
    }
    const lastVerified = cells[5];
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

  // ★ v8.2.1 §8-2 documented-exception no-loophole guard (DEC-2026-05-17-base-prefix-documented-exception / ADR-PLUGIN-001 §7 patch v5).
  // `_base-*` charset 편차 = nominal (F-015 = enforcement 미문서화) → 영구 grandfather. 단 정확히 8 자산만 (frozen allowlist).
  // 9번째 `_base-` skill/agent 추가 = 예외의 loophole 화 → fail (신규 자산 = S3/A1 즉시 강제 / ratchet).
  const BASE_ALLOWLIST = [
    'skill:_base-log-finding', 'skill:_base-apply-template', 'skill:_base-build-traceability-matrix',
    'skill:_base-apply-baseline-ratchet', 'skill:_base-invoke-go-stop-gate',
    'agent:_base-official-docs-checker', 'agent:_base-senior-engineer', 'agent:_base-industry-case-researcher',
  ].sort();
  try {
    const baseSkills = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith('_base-'))
      .map((e) => `skill:${e.name}`);
    const baseAgents = readdirSync(join(ROOT, 'agents'), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.startsWith('_base-') && e.name.endsWith('.md'))
      .map((e) => `agent:${e.name.replace(/\.md$/, '')}`);
    const actual = [...baseSkills, ...baseAgents].sort();
    if (JSON.stringify(actual) !== JSON.stringify(BASE_ALLOWLIST)) {
      const extra = actual.filter((a) => !BASE_ALLOWLIST.includes(a));
      const gone = BASE_ALLOWLIST.filter((a) => !actual.includes(a));
      failures.push(
        `_base- allowlist drift (§8-2 documented-exception loophole 방지) — ` +
        `extra: [${extra.join(', ') || '∅'}] / missing: [${gone.join(', ') || '∅'}]`
      );
    }
  } catch (e) {
    failures.push(`_base- allowlist 검사 실패: ${e.message}`);
  }

  return {
    id: 'authoring_spec_staleness',
    pass: failures.length === 0,
    detail: failures.length === 0
      ? `plugin-authoring-spec §6 pin ${EXPECTED_AREAS.length} area 모두 ≤ ${STALE_DAYS}d fresh + digest_sha 4행 일치 + _base- 8 allowlist 정합 / 외부 권위 drift 가드 (R18 / ADR-PLUGIN-001 §7 patch v5)`
      : `staleness: ${failures.join(' | ')}`,
    delegated_to: 'methodology-spec/plugin-authoring-spec.md §6 + §8-2 (R18 / ADR-PLUGIN-001 / 네트워크 재검증 = §9 Layer i cadence)',
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
        ? `${parsed.scanned_file_count} active doc 인용 정합 (repo-wide / schema·repo-path·ADR·DEC 실존 / 0 stale dead-link)`
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

// ★ ★ v8.5.0+ R15/F-V2-05 신설 — preflight 외부 도구 검사 (no-simulation 정책 강화).
// chain harness 의 R15 (정적 도구 검증 의무 / 시뮬레이션 ❌) 정합 — Semgrep / PMD / Maven / Java 등
// 외부 도구 부재 시 analysis cross-cutting + chain 3/4 RED/GREEN 측정 차단. 본 check 가 release 직전 환경 진단.
// pass 기준: core 도구 (node + npm) 모두 present. stack/analysis 도구 absent 는 warning 만 (release 차단 ❌).
// --skip-preflight flag 시 skip (release 시 본 flag ❌ 의무).
function check14_preflightTools(args) {
  if (args.skipPreflight) {
    return {
      id: 'preflight_tools',
      pass: false,
      detail: 'skipped via --skip-preflight (★ release 본격 시행 시 본 flag ❌ 의무 / F-V2-05)',
      delegated_to: 'scripts/preflight-check.js (★ F-V2-05 / no-simulation 환경 진단)',
    };
  }
  const r = spawnSync(
    'node',
    ['scripts/preflight-check.js', '--stack', 'all', '--json'],
    { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 }
  );
  let parsed;
  try {
    parsed = JSON.parse(r.stdout || '{}');
  } catch {
    return {
      id: 'preflight_tools',
      pass: false,
      detail: `preflight-check JSON parse fail (exit ${r.status})`,
      delegated_to: 'scripts/preflight-check.js',
    };
  }
  const s = parsed.summary || {};
  const corePass = (s.core_absent || []).length === 0;
  const analysisAbsent = (s.analysis_absent || []).length;
  return {
    id: 'preflight_tools',
    pass: corePass,
    detail: corePass
      ? `core (node+npm) present ✅${analysisAbsent > 0 ? ` / ${analysisAbsent} analysis 외부 도구 absent (★ no-simulation warning — chain 2 cross-cutting/openapi-lint 실행 시 F-SIM 등재 의무): ${(s.analysis_absent || []).join(', ')}` : ' / all analysis 외부 도구 present ★ '}`
      : `core 도구 부재: ${(s.core_absent || []).join(', ')} — release 차단 (★ chain harness 동작 자체 불가)`,
    delegated_to: 'scripts/preflight-check.js (★ F-V2-05 / no-simulation 환경 진단 / ADR-CHAIN-001 §3 정합)',
  };
}

// ★ ★ dep-graph 신규 게이트 — operation.md Verification 표 #12 / #13 (실제 release-readiness 카운트는 #15 / #16).
// operation.md 기준 표기 = "11→13 신규". 본 script 는 이미 1–14 존재하므로 #15 / #16 로 편입.
// 별도 doc drift fix 필요 (incidents/2026-05-21+ — operation.md Verification 절 갱신).
//
// 실행 순서:
//   #15 graph-integrity (artifact-graph.json 합성 성공 + cycle/orphan/unknown 0) — code-pointer 의 prerequisite
//   #16 code-pointer (24 Tier-1 노드 code_pointers 또는 명시적 N/A coverage)
//
// 입력 그래프 위치: PoC #05 .aimd/output/artifact-graph.json (release-readiness 표준 corpus).
const POC05_GRAPH_PATH = 'examples/poc-05-sample-user-register/.aimd/output/artifact-graph.json';

function check15_graphIntegrity() {
  const graphPath = join(ROOT, POC05_GRAPH_PATH);
  if (!existsSync(graphPath)) {
    return {
      id: 'graph_integrity',
      pass: false,
      detail: `${POC05_GRAPH_PATH} missing — matrix-builder --graph 로 합성 필요 (operation.md P1 결정 8)`,
      delegated_to: 'tools/graph-integrity-validator (★ 13번째 validator / dep-graph operation.md #13)',
    };
  }
  const r = spawnSync(
    'node',
    ['tools/graph-integrity-validator/src/cli.js', POC05_GRAPH_PATH, '--format', 'json'],
    { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 }
  );
  let parsed;
  try {
    parsed = JSON.parse(r.stdout || '{}');
  } catch {
    return {
      id: 'graph_integrity',
      pass: false,
      detail: `graph-integrity-validator JSON parse fail (exit ${r.status})`,
      delegated_to: 'tools/graph-integrity-validator',
    };
  }
  const s = parsed.summary || {};
  return {
    id: 'graph_integrity',
    pass: r.status === 0 && parsed.passed === true,
    detail: parsed.passed
      ? `artifact-graph.json 합성 정상 (nodes=${s.node_count}/edges=${s.edge_count}/cycle=0/orphan=0/unknown=0)`
      : `${s.cycle_count} cycle / ${s.orphan_count} orphan / ${s.unknown_edge_count} unknown edge — release-readiness #13 fail (topological sort 작동 불가 → 자동 cascade 차단)`,
    delegated_to: 'tools/graph-integrity-validator (★ 13번째 validator / dep-graph operation.md 결정 8 P1 DFS cycle/orphan)',
  };
}

function check16_codePointerCoverage(args) {
  const graphPath = join(ROOT, POC05_GRAPH_PATH);
  if (!existsSync(graphPath)) {
    return {
      id: 'code_pointer_coverage',
      pass: false,
      detail: `${POC05_GRAPH_PATH} missing — matrix-builder --graph 로 합성 필요 (operation.md P2)`,
      delegated_to: 'tools/code-pointer-validator (★ 12번째 validator / dep-graph operation.md #12)',
    };
  }
  // ★ 2026-05-22 — PoC #05 chain frontmatter 백필 완료 (coverage 100%) → strict 기본 활성.
  //   --no-strict-code-pointers 로 한시적 완화 가능 (회귀 시 비상용 / release 시 ❌).
  const strictMode = args.noStrictCodePointers !== true;
  const flags = ['tools/code-pointer-validator/src/cli.js', POC05_GRAPH_PATH,
    '--repo-root', 'examples/poc-05-sample-user-register', '--format', 'json'];
  if (strictMode) flags.push('--strict');
  const r = spawnSync('node', flags, { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 });
  let parsed;
  try {
    parsed = JSON.parse(r.stdout || '{}');
  } catch {
    return {
      id: 'code_pointer_coverage',
      pass: false,
      detail: `code-pointer-validator JSON parse fail (exit ${r.status})`,
      delegated_to: 'tools/code-pointer-validator',
    };
  }
  const cv = parsed.coverage || {};
  const sum = parsed.summary || {};
  const strictNote = strictMode
    ? ' (--strict 모드 / PoC #05 백필 완료 default-on)'
    : ' (★ --no-strict-code-pointers 한시 완화)';
  return {
    id: 'code_pointer_coverage',
    pass: r.status === 0,
    detail: r.status === 0
      ? `coverage ${(cv.ratio * 100).toFixed(1)}% (covered=${cv.covered}/na=${cv.explicit_na}/missing=${cv.missing}, pointers=${sum.pointers_checked})${strictNote}`
      : `${sum.high} high / ${sum.medium} medium finding — coverage ${(cv.ratio * 100).toFixed(1)}%${strictNote}`,
    delegated_to: 'tools/code-pointer-validator (★ 12번째 validator / dep-graph operation.md 결정 3 P2 / "24 artifact 100% code_pointers 또는 명시적 N/A")',
  };
}

// ★ ★ v9.0.6 LL-v903-03 follow-up — marketplace.json description ↔ current chain stage sync.
// 사용자 1차 접점 표면 (plugin install 첫 description) 정합 검증.
// MAJOR/MINOR stage 변경 시 본 description 까지 cascade 의무 (v9.0.0 → v9.0.1 prose coherence drift case 동형).
// SSOT: 현재 6-stage = analysis + chain 5 (discovery / spec / plan / test / implement).
// 검사 axes (3): ① "6단계 chain harness" 또는 "6-stage chain harness" 표기 ② 5 stage name 모두 포함 ③ legacy "planning →" 미포함.
function check17_marketplaceStageSync() {
  const marketplacePath = join(ROOT, '.claude-plugin/marketplace.json');
  if (!existsSync(marketplacePath)) {
    return { id: 'marketplace_stage_sync', pass: false, detail: 'marketplace.json missing' };
  }
  let marketplace;
  try {
    marketplace = JSON.parse(readFileSync(marketplacePath, 'utf-8'));
  } catch (e) {
    return { id: 'marketplace_stage_sync', pass: false, detail: `marketplace.json parse fail: ${e.message}` };
  }
  const plugins = marketplace.plugins || [];
  if (plugins.length === 0) {
    return { id: 'marketplace_stage_sync', pass: false, detail: 'marketplace.json plugins[] empty' };
  }
  const desc = plugins[0].description || '';
  const EXPECTED_STAGES = ['discovery', 'spec', 'plan', 'test', 'implement'];
  const EXPECTED_COUNT_PATTERNS = [/6\s*단계\s*chain\s*harness/, /6[-\s]stage\s*chain\s*harness/i];
  const LEGACY_PATTERN = /\bplanning\s*[→\->]+/i; // "planning →" 또는 "planning ->" (legacy 5-stage)

  const countMatch = EXPECTED_COUNT_PATTERNS.some((p) => p.test(desc));
  const missingStages = EXPECTED_STAGES.filter((s) => !desc.toLowerCase().includes(s));
  const legacyFound = LEGACY_PATTERN.test(desc);

  const issues = [];
  if (!countMatch) issues.push('"6단계 chain harness" 또는 "6-stage chain harness" 표기 부재');
  if (missingStages.length > 0) issues.push(`stage 누락: ${missingStages.join(', ')}`);
  if (legacyFound) issues.push('legacy "planning →" 표기 잔존 (v9.0 6-stage 미전파)');

  return {
    id: 'marketplace_stage_sync',
    pass: issues.length === 0,
    detail: issues.length === 0
      ? `marketplace.json description 안 "6단계 chain harness" + 5 stage (${EXPECTED_STAGES.join('/')}) 모두 포함 + legacy "planning →" 미포함 ✅`
      : `drift: ${issues.join(' / ')}`,
    delegated_to: '.claude-plugin/marketplace.json plugins[0].description ↔ current 6-stage chain harness sync (LL-v903-03 / sweeping MAJOR stage change cascade enforcement)',
  };
}

// ★ ★ ★ ★ v10.0.0 Phase 4-4' 신설 (3 criterion / DEC-2026-05-25-axis-a-phase-4-4-prime).
// gate 번호 재정렬 paradigm (chain N = gate #N 1:1 INTERNAL CONVENTION) 의 enforcement 자격.
function check18_gateEnumConsistency() {
  // stage-graph.js getGateForStage 결과 set = state.schema.json gate.id enum set
  try {
    const stageGraphPath = join(ROOT, 'tools/chain-driver/src/stage-graph.js');
    const stateSchemaPath = join(ROOT, 'schemas/state.schema.json');
    const src = readFileSync(stageGraphPath, 'utf-8');
    // map { discovery:'#1', ... } 패턴 추출 (정규 식)
    const mapMatch = src.match(/const\s+map\s*=\s*\{([^}]+)\}/);
    if (!mapMatch) {
      return { id: 'gate_enum_consistency', pass: false, detail: 'stage-graph.js map 패턴 미발견' };
    }
    const fromGraph = new Set();
    // key 가 unquoted JS identifier ({ discovery: '#1', ... }) 또는 quoted ('discovery': '#1') 모두 정합.
    const entryRegex = /['"]?([a-z]+)['"]?\s*:\s*['"](#[a-zA-Z0-9]+)['"]/g;
    let m;
    while ((m = entryRegex.exec(mapMatch[1])) !== null) fromGraph.add(m[2]);

    const schema = JSON.parse(readFileSync(stateSchemaPath, 'utf-8'));
    const lastGate = schema?.properties?.last_gate;
    const enumRaw =
      lastGate?.properties?.id?.enum ??
      (lastGate?.anyOf?.flatMap((b) => b?.properties?.id?.enum ?? []) ?? []);
    const fromSchema = new Set(enumRaw);

    const diffAtoB = [...fromGraph].filter((x) => !fromSchema.has(x));
    const diffBtoA = [...fromSchema].filter((x) => !fromGraph.has(x));
    const pass = diffAtoB.length === 0 && diffBtoA.length === 0;
    return {
      id: 'gate_enum_consistency',
      pass,
      detail: pass
        ? `gate enum 정합 ✅ (stage-graph = state.schema = {${[...fromGraph].sort().join(',')}})`
        : `drift: graph-only=[${diffAtoB.join(',')}] / schema-only=[${diffBtoA.join(',')}]`,
      delegated_to: 'tools/chain-driver/src/stage-graph.js ↔ schemas/state.schema.json (Phase 4-4\' v10.0.0 chain N = gate #N 1:1)',
    };
  } catch (e) {
    return { id: 'gate_enum_consistency', pass: false, detail: `error: ${e.message}` };
  }
}

function check19_legacy4StageExpressionAbsent() {
  // ★ user-facing 4 file (CLAUDE.md / README.md / methodology-spec/agents-axis / chain-driver/README) 안 "chain 4단계" / "4 gate" prose 잔존 ❌
  const FILES = [
    join(ROOT, '..', 'CLAUDE.md'), // project root CLAUDE.md
    join(ROOT, 'README.md'),
    join(ROOT, 'methodology-spec/agents-axis.md'),
    join(ROOT, 'tools/chain-driver/README.md'),
  ];
  const PATTERNS = [/chain\s*harness\s*4\b/i, /chain\s*4단계/, /\b4\s*gate\b/i, /\bSDLC\s*4단계/];
  const violations = [];
  for (const f of FILES) {
    if (!existsSync(f)) continue;
    const text = readFileSync(f, 'utf-8');
    for (const p of PATTERNS) {
      if (p.test(text)) violations.push(`${f.split(/[/\\]/).slice(-2).join('/')}: ${p}`);
    }
  }
  return {
    id: 'legacy_4_stage_expression_absent',
    pass: violations.length === 0,
    detail: violations.length === 0
      ? `user-facing 4 file 안 "chain 4단계" / "4 gate" 표현 잔존 ❌ ✅`
      : `drift: ${violations.join(' / ')}`,
    delegated_to: 'CLAUDE.md + README + methodology-spec/agents-axis + chain-driver/README (Phase 4-4\' v10.0.0 5단계 paradigm)',
  };
}

// ★ ★ ★ ★ ★ v11.0.0 Phase 1 잔여 신설 (2 criterion / DEC-2026-05-26-contract-강제-양-axis §5 + SSOT §5).
// criterion #14 (SSOT 명명 / release-readiness 안 sequential #21) = template count drift (LL-v85-01 follow-up).
// criterion #15 (SSOT 명명 / release-readiness 안 sequential #22) = BE TASK 안 openapi_endpoint_ref baseline+ratchet.

function check21_templateCountDrift() {
  // ★ v11.0.0 SSOT #14 — _base-apply-template SKILL.md 안 enumerated artifact count vs templates/* dir file count 정합.
  // LL-v85-01 follow-up — silent_omission attractor 차단 (Phase 3 template body 본격 채움 trigger).
  try {
    const skillPath = join(ROOT, 'skills/_base-apply-template/SKILL.md');
    if (!existsSync(skillPath)) {
      return { id: 'template_count_drift', pass: false, detail: '_base-apply-template SKILL.md 부재' };
    }
    const skillText = readFileSync(skillPath, 'utf-8');
    // SKILL.md 안 machine marker "check21 SSOT: total <N> templates" 추출 (★ refactor: tooling-audit-cleanup — 모호한 'N artifact' regex 교정 + fail-closed)
    const countMatch = skillText.match(/check21 SSOT:\s*total\s*(\d+)\s*templates/i);
    if (!countMatch) {
      return {
        id: 'template_count_drift',
        pass: false,
        detail: '_base-apply-template SKILL.md 안 machine marker "check21 SSOT: total <N> templates" 부재 (fail-closed / 모호 카운트 회피 SSOT 의무 / LL-v85-01)',
        delegated_to: '_base-apply-template/SKILL.md machine marker ↔ templates/*/*.template.* 실측 count',
      };
    }
    const enumeratedCount = parseInt(countMatch[1], 10);

    // templates/{analysis,discovery,spec,plan,test,implement,design}/ dir 안 .template.* file count 합계
    const TEMPLATE_DIRS = ['analysis', 'discovery', 'spec', 'plan', 'test', 'implement', 'design'];
    let actualCount = 0;
    const missingDirs = [];
    for (const d of TEMPLATE_DIRS) {
      const dirPath = join(ROOT, 'templates', d);
      if (!existsSync(dirPath)) {
        missingDirs.push(d);
        continue;
      }
      const files = readdirSync(dirPath).filter((f) => f.match(/\.template\.[a-z0-9]+$/i));
      actualCount += files.length;
    }

    if (missingDirs.length > 0) {
      return {
        id: 'template_count_drift',
        pass: false,
        detail: `templates/ dir 부재 (${missingDirs.join('+')}) — Phase 3 template body 본격 채움 carry / DEC-2026-05-26-v11-paradigm-결단 §5 Phase 3`,
        delegated_to: 'templates/{discovery,spec}/ 신설 + 12 신규 file body 본격 채움 (Phase 3 차기 session)',
      };
    }

    const drift = actualCount !== enumeratedCount;
    return {
      id: 'template_count_drift',
      pass: !drift,
      detail: drift
        ? `drift: _base-apply-template marker ${enumeratedCount} vs templates/ 실측 ${actualCount} (.template.* 전수 / LL-v85-01 silent_omission attractor)`
        : `template count 정합 ✅ (_base-apply-template marker ${enumeratedCount} = templates/ 실측 ${actualCount} / .template.* 전수)`,
      delegated_to: '_base-apply-template/SKILL.md ↔ templates/*/ count drift (LL-v85-01 / Phase 3 본격)',
    };
  } catch (e) {
    return { id: 'template_count_drift', pass: false, detail: `error: ${e.message}` };
  }
}

function check22_beTaskOpenapiRefRatchet() {
  // ★ v11.0.0 SSOT #15 — BE TASK 안 openapi_endpoint_ref 부재 baseline+ratchet (ADR-010 정합).
  // DEC-2026-05-26-contract-강제-양-axis §3 정합. baseline file: scripts/baseline-data/be-task-openapi-ref-baseline.json.
  // 신규 BE TASK 안 openapi_endpoint_ref 부재 count > baseline 시 block.
  try {
    const examplesDir = join(ROOT, 'examples');
    if (!existsSync(examplesDir)) {
      return { id: 'be_task_openapi_ref_ratchet', pass: true, detail: 'examples/ dir 부재 (skip / no PoC)' };
    }
    const pocDirs = readdirSync(examplesDir).filter((d) => {
      const p = join(examplesDir, d);
      try {
        return existsSync(join(p, '.aimd', 'output')) || existsSync(join(p, '.aimd'));
      } catch {
        return false;
      }
    });

    let missingCount = 0;
    const missingDetails = [];
    for (const poc of pocDirs) {
      // task-plan.json 후보 path
      const taskPlanCandidates = [
        join(examplesDir, poc, '.aimd', 'output', 'task-plan.json'),
        join(examplesDir, poc, '.aimd', 'plan', 'task-plan.json'),
      ];
      let taskPlan = null;
      for (const candidate of taskPlanCandidates) {
        if (existsSync(candidate)) {
          try {
            taskPlan = JSON.parse(readFileSync(candidate, 'utf-8'));
            break;
          } catch {
            // skip parse error
          }
        }
      }
      if (!taskPlan) continue;
      const tasks = taskPlan.tasks || [];
      for (const t of tasks) {
        if (t.layer === 'be' && !t.openapi_endpoint_ref) {
          missingCount++;
          missingDetails.push(`${poc}/${t.id}`);
        }
      }
    }

    // baseline file (optional / 부재 시 baseline = 0)
    const baselinePath = join(ROOT, 'scripts', 'baseline-data', 'be-task-openapi-ref-baseline.json');
    let baseline = 0;
    if (existsSync(baselinePath)) {
      try {
        const baselineData = JSON.parse(readFileSync(baselinePath, 'utf-8'));
        baseline = baselineData.missing_count ?? 0;
      } catch {
        // skip parse error / baseline = 0
      }
    }

    const ratchet_violation = missingCount > baseline;
    return {
      id: 'be_task_openapi_ref_ratchet',
      pass: !ratchet_violation,
      detail: ratchet_violation
        ? `ratchet violation: BE TASK 안 openapi_endpoint_ref 부재 ${missingCount} > baseline ${baseline} (DEC-2026-05-26-contract-강제-양-axis §3)`
        : `BE TASK ↔ openapi_endpoint_ref ratchet ✅ (missing=${missingCount} ≤ baseline=${baseline}${missingDetails.length > 0 ? ' / details: ' + missingDetails.slice(0, 3).join(',') + (missingDetails.length > 3 ? '...' : '') : ''})`,
      delegated_to: 'PoC task-plan.tasks[].openapi_endpoint_ref ratchet (ADR-010 baseline+ratchet / Phase 4 PoC sweep 안 본격 진전)',
    };
  } catch (e) {
    return { id: 'be_task_openapi_ref_ratchet', pass: false, detail: `error: ${e.message}` };
  }
}

function check20_planGateOperational() {
  // plan gate 본격 작동 — requiredValidators('plan').length > 0 + sdlc-4stage-flow stages[plan].gate == '#3'
  try {
    const flowPath = join(ROOT, 'flows/sdlc-4stage-flow.json');
    const flow = JSON.parse(readFileSync(flowPath, 'utf-8'));
    const planStage = (flow.stages || []).find((s) => s.id === 'plan');
    if (!planStage) {
      return { id: 'plan_gate_operational', pass: false, detail: 'sdlc-4stage-flow.json stages[].plan 부재' };
    }
    if (planStage.gate !== '#3') {
      return { id: 'plan_gate_operational', pass: false, detail: `plan stage gate = ${planStage.gate} (expected '#3')` };
    }
    const planGate = (flow.gates || []).find((g) => g.id === '#3' && g.stage === 'plan');
    if (!planGate) {
      return { id: 'plan_gate_operational', pass: false, detail: 'gates[].{id=#3,stage=plan} 부재' };
    }
    if (!Array.isArray(planGate.validators) || planGate.validators.length === 0) {
      return { id: 'plan_gate_operational', pass: false, detail: 'gates[#3].validators empty' };
    }
    return {
      id: 'plan_gate_operational',
      pass: true,
      detail: `plan stage gate=#3 + validators=[${planGate.validators.join(',')}] ✅`,
      delegated_to: 'flows/sdlc-4stage-flow.json (Phase 4-4\' v10.0.0 hard gate #3 본격 진입)',
    };
  } catch (e) {
    return { id: 'plan_gate_operational', pass: false, detail: `error: ${e.message}` };
  }
}

// ★ ★ v11.16.0 신설 — DB 자산 always-on 정책 자동 게이트 (F-DB-AUTOVAL-001 해소 / db-assets-always-on §8.4).
// db-assets-validator 가 work-unit-manifest analysis_refs 안 db_tables/db_procedures/db_functions/db_views 검사.
// ★ content-aware (file presence ❌) — golden fixture 판별 검사: compliant→pass / violations→fail-with-codes.
//   커밋된 PoC 에 analysis_refs.db_* manifest 가 부재 (poc-17 외부 격리) → 실 corpus 대신 validator discrimination 입증.
//   PoC 에 db-asset manifest 가 커밋되면 corpus scan 으로 확장 (C-db-autoval-corpus-extension).
function check23_dbAssetsValidator() {
  const CLI = 'tools/db-assets-validator/src/cli.js';
  const compliant = 'tools/db-assets-validator/test/fixtures/compliant-plan.json';
  const violations = 'tools/db-assets-validator/test/fixtures/violations-plan.json';
  const issues = [];

  // (1) compliant manifest → exit 0 + passed=true + critical/high 0
  const rOk = spawnSync('node', [CLI, compliant, '--json'], { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 });
  let okParsed;
  try {
    okParsed = JSON.parse(rOk.stdout || '{}');
  } catch {
    okParsed = null;
  }
  if (rOk.status !== 0) issues.push(`compliant fixture exit ${rOk.status} (expected 0)`);
  if (!okParsed?.passed) issues.push('compliant fixture passed≠true');
  if ((okParsed?.summary?.critical ?? -1) !== 0 || (okParsed?.summary?.high ?? -1) !== 0) {
    issues.push(`compliant fixture critical/high ≠ 0`);
  }

  // (2) violations manifest → exit 1 + sp_unclassified_at_plan(critical) + external_class_mismatch(high)
  const rBad = spawnSync('node', [CLI, violations, '--json'], { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 });
  let badParsed;
  try {
    badParsed = JSON.parse(rBad.stdout || '{}');
  } catch {
    badParsed = null;
  }
  const badCodes = new Set((badParsed?.findings || []).map((f) => f.code));
  if (rBad.status !== 1) issues.push(`violations fixture exit ${rBad.status} (expected 1)`);
  if (!badCodes.has('sp_unclassified_at_plan')) issues.push("violations fixture missing 'sp_unclassified_at_plan' (critical)");
  if (!badCodes.has('external_class_mismatch')) issues.push("violations fixture missing 'external_class_mismatch' (high)");

  return {
    id: 'db_assets_validator',
    pass: issues.length === 0,
    detail: issues.length === 0
      ? `db-assets-validator 판별 정상 — compliant→PASS(critical/high 0) / violations→FAIL(sp_unclassified_at_plan + external_class_mismatch) / DB always-on 게이트 작동 (F-DB-AUTOVAL-001 해소)`
      : `db-assets gate 결함: ${issues.join(' | ')}`,
    delegated_to: 'tools/db-assets-validator (★ 25번째 validator / db-assets-always-on §8.4 / content-aware golden fixture 판별 — file presence ❌)',
  };
}

// ★ C12 (INSPECTION-2026-05-31-analysis) — agent frontmatter skills:[] ⊇ 해당 stage phase-flow 등록 skill.
// dispatch 레이어(agent preload)가 orchestration SSOT(phase-flow)와 silent drift 하는 D5 결정론 구멍 차단.
// 단방향 COVER(agent ⊇ flow) — _base-* 공유 util 이 agent 에만 더 있는 것은 정상(허용).
function check24_agentSkillsPhaseFlowSync() {
  const STAGE_AGENT = {
    analysis: 'analysis-agent.md',
    discovery: 'discovery-agent.md',
    spec: 'spec-agent.md',
    plan: 'plan-agent.md',
    test: 'test-agent.md',
    implement: 'implement-agent.md',
  };
  const collectFlowSkills = (obj, acc) => {
    if (Array.isArray(obj)) { for (const x of obj) collectFlowSkills(x, acc); return; }
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'skills' && Array.isArray(v)) { for (const s of v) if (typeof s === 'string') acc.add(s); }
        if (k === 'skill' && typeof v === 'string') acc.add(v);
        collectFlowSkills(v, acc);
      }
    }
  };
  const drift = [];
  for (const [stage, agentFile] of Object.entries(STAGE_AGENT)) {
    const agentPath = join(ROOT, 'agents', agentFile);
    const flowPath = join(ROOT, 'flows', `${stage}.phase-flow.json`);
    if (!existsSync(agentPath)) { drift.push(`${stage}: agent ${agentFile} 부재`); continue; }
    if (!existsSync(flowPath)) { drift.push(`${stage}: ${stage}.phase-flow.json 부재`); continue; }
    const m = readFileSync(agentPath, 'utf-8').match(/skills:\s*\[([^\]]*)\]/);
    const aSet = new Set(m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : []);
    let flow;
    try { flow = JSON.parse(readFileSync(flowPath, 'utf-8')); }
    catch (e) { drift.push(`${stage}: flow parse fail ${e.message}`); continue; }
    const fSet = new Set();
    collectFlowSkills(flow, fSet);
    const missing = [...fSet].filter((s) => !aSet.has(s)).sort();
    if (missing.length) drift.push(`${stage}-agent missing: ${missing.join(', ')}`);
  }
  return {
    id: 'agent_skills_phaseflow_sync',
    pass: drift.length === 0,
    detail: drift.length === 0
      ? `6 agent frontmatter skills ⊇ 해당 stage phase-flow 등록 skill (dispatch preload ↔ orchestration SSOT 정합 / C12 결정론 gate)`
      : `drift: ${drift.join(' | ')}`,
    delegated_to: 'agents/<stage>-agent.md frontmatter skills:[] ⊇ flows/<stage>.phase-flow.json 등록 skill (C12 / INSPECTION-2026-05-31-analysis — dispatch 레이어 silent drift 결정론 차단 / _base-* extra 허용)',
  };
}

// ★ capstone (INSPECTION-2026-05-31 paradigm mini-pass) — 전 chain stage 산출물 골조(template)가 대응 schema 에 valid.
//   #1 systemic 발견(meta.confidence object≠number 가 discovery/spec/plan/test/implement 5/5 템플릿)을 어떤 gate 도 못 잡던 사각 영구 차단.
//   _base-apply-template 가 invalid shape 를 LLM 에 학습시키는 것을 release gate 로 fail-closed.
function check25_templateSchemaValid() {
  const PAIRS = [
    ['templates/discovery/discovery-spec.template.json', 'schemas/discovery-spec.schema.json'],
    ['templates/spec/behavior-spec.template.json', 'schemas/behavior-spec.schema.json'],
    ['templates/spec/acceptance-criteria.template.json', 'schemas/acceptance-criteria.schema.json'],
    ['templates/plan/task-plan.template.json', 'schemas/task-plan.schema.json'],
    ['templates/test/test-spec.template.json', 'schemas/test-spec.schema.json'],
    ['templates/implement/impl-spec.template.json', 'schemas/impl-spec.schema.json'],
  ];
  const CLI = join(ROOT, 'tools/schema-validator/src/cli.js');
  const invalid = [];
  for (const [tpl, sch] of PAIRS) {
    const tPath = join(ROOT, tpl);
    const sPath = join(ROOT, sch);
    if (!existsSync(tPath)) { invalid.push(`${tpl} 부재`); continue; }
    if (!existsSync(sPath)) { invalid.push(`${sch} 부재`); continue; }
    const r = spawnSync('node', [CLI, tPath, '--schema', sPath], { cwd: ROOT, encoding: 'utf-8', shell: false, timeout: 30000 });
    // schema-validator stdout: "valid: 1  invalid: 0" 형태. valid:1 이고 invalid:[1-9] 부재 = 통과.
    const out = r.stdout || '';
    const passed = /valid:\s*1\b/.test(out) && !/invalid:\s*[1-9]/.test(out);
    if (!passed) invalid.push(tpl);
  }
  return {
    id: 'template_schema_valid',
    pass: invalid.length === 0,
    detail: invalid.length === 0
      ? `6 chain stage 템플릿 모두 대응 schema valid (discovery/behavior/acceptance/task-plan/test-spec/impl-spec) — _base-apply-template 골조 invalid shape 주입 차단 (capstone / INSPECTION-2026-05-31 #1 systemic 영구 lock)`
      : `template schema-INVALID: ${invalid.join(', ')}`,
    delegated_to: 'templates/<stage>/*.template.json ↔ schemas/<X>.schema.json (★ meta.confidence object≠number systemic 차단 / _base-apply-template instantiate base / content-aware)',
  };
}

// ★ F-S07 (INSPECTION-2026-05-31-spec / S10+S14) — gate validator 목록 cross-source 정합 결정론 gate.
//   drift-validator 가 gate/validator 목록을 비교 안 해 4-소스(sdlc gate / phase-flow cross_cutting /
//   automated_validation / gate-eval) drift 가 구조적 uncaught 였음. check18/check24 패턴 미러.
//   관계 모델: gate-eval REQUIRED(blocking) ⊆ sdlc gates[].validators(매트릭스) / sdlc gate ≡ cross_cutting
//   (데코레이션 정규화 후 / conditional_validators allowlist 차이 허용).
function check26_gateValidatorListConsistency() {
  try {
    // 데코레이션 정규화 — " (...)" 괄호 / " --flag …" 접미사 strip → canonical tool 명.
    const norm = (v) => String(v).replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s*--\S+.*$/, '').trim();
    const STAGES = ['discovery', 'spec', 'plan', 'test', 'implement'];

    // gate-eval REQUIRED_VALIDATORS_PER_STAGE (코드 SSOT / regex-extract — check18 패턴)
    const geSrc = readFileSync(join(ROOT, 'tools/chain-driver/src/gate-eval.js'), 'utf-8');
    const reqMatch = geSrc.match(/const\s+REQUIRED_VALIDATORS_PER_STAGE\s*=\s*\{([^}]+)\}/);
    if (!reqMatch) return { id: 'gate_validator_list_consistency', pass: false, detail: 'gate-eval.js REQUIRED_VALIDATORS_PER_STAGE 패턴 미발견', delegated_to: 'tools/chain-driver/src/gate-eval.js' };
    const required = {};
    const reqRe = /(\w+):\s*\[([^\]]*)\]/g;
    let rm;
    while ((rm = reqRe.exec(reqMatch[1])) !== null) {
      required[rm[1]] = new Set(rm[2].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).map(norm));
    }

    // sdlc-4stage-flow gates[].validators (+ conditional_validators)
    const sdlc = JSON.parse(readFileSync(join(ROOT, 'flows/sdlc-4stage-flow.json'), 'utf-8'));
    const gateByStage = {}, condByStage = {};
    for (const g of sdlc.gates ?? []) {
      gateByStage[g.stage] = new Set((g.validators ?? []).map(norm));
      condByStage[g.stage] = new Set((g.conditional_validators ?? []).map(norm));
    }

    // <stage>.phase-flow.json cross_cutting.validators
    const ccByStage = {};
    for (const stage of STAGES) {
      const fp = join(ROOT, 'flows', `${stage}.phase-flow.json`);
      if (!existsSync(fp)) continue;
      const cc = JSON.parse(readFileSync(fp, 'utf-8')).cross_cutting?.validators;
      if (Array.isArray(cc)) ccByStage[stage] = new Set(cc.map(norm));
    }

    const drift = [];
    for (const stage of STAGES) {
      const A = gateByStage[stage] ?? new Set();   // sdlc gate matrix (documented full set)
      const B = ccByStage[stage];                   // phase-flow cross_cutting (may be absent)
      const C = condByStage[stage] ?? new Set();    // conditional allowlist
      const R = required[stage] ?? new Set();       // gate-eval blocking subset
      // 1. blocking ⊆ documented gate matrix
      const missingReq = [...R].filter((x) => !A.has(x));
      if (missingReq.length) drift.push(`${stage}: gate-eval REQUIRED 가 sdlc gate matrix 미등재 [${missingReq.join(',')}]`);
      // 2. sdlc gate ≡ cross_cutting (symmetric diff ⊆ conditional allowlist)
      if (B) {
        const union = new Set([...A, ...B]);
        const unexpected = [...union].filter((x) => !(A.has(x) && B.has(x)) && !C.has(x));
        if (unexpected.length) drift.push(`${stage}: sdlc-gate ↔ cross_cutting 불일치(conditional 외) [${unexpected.join(',')}]`);
      } else {
        drift.push(`${stage}: ${stage}.phase-flow.json cross_cutting.validators 부재 (gate matrix 대조 불가)`);
      }
    }
    return {
      id: 'gate_validator_list_consistency',
      pass: drift.length === 0,
      detail: drift.length === 0
        ? `5 stage gate validator 목록 정합 (sdlc-4stage gates[] ≡ <stage>.phase-flow cross_cutting.validators [conditional 제외] + gate-eval REQUIRED ⊆ gate matrix / 데코레이션 정규화 / F-S07)`
        : `drift: ${drift.join(' | ')}`,
      delegated_to: 'flows/sdlc-4stage-flow.json gates[].validators ↔ flows/<stage>.phase-flow.json cross_cutting.validators ↔ tools/chain-driver/src/gate-eval.js REQUIRED_VALIDATORS_PER_STAGE (F-S07 / S10+S14 / 데코레이션 strip + conditional_validators allowlist)',
    };
  } catch (e) {
    return { id: 'gate_validator_list_consistency', pass: false, detail: `error: ${e.message}`, delegated_to: 'flows/sdlc-4stage-flow.json ↔ flows/*.phase-flow.json ↔ gate-eval.js' };
  }
}

// ★ check27 (v11.27.0 / EXT-MISS-01 회귀 가드) — 출하 dir(skills/agents/templates) 사내 신원 누출 차단.
//   이들은 build-plugin INCLUDE → dist·git-URL 양 채널 출하 → 안 example payload 의 사내 신원을 adopter LLM 이
//   자기 로그에 복제 위험. content-aware(파일 존재 아닌 내용 grep). allow-identity: 주석 = 정당 author 귀속 예외.
function check27_shippedIdentityLeak() {
  try {
    const SHIPPED_DIRS = ['skills', 'agents', 'templates'];
    const IDENTITY_RE = INTERNAL_IDENTITY_RE; // ★ v11.29.0 REVISE-2 — SSOT (tools/_shared/pii-patterns.js / byte-identical)
    const hits = [];
    for (const dir of SHIPPED_DIRS) {
      const base = join(ROOT, dir);
      if (!existsSync(base)) continue;
      const entries = readdirSync(base, { recursive: true, withFileTypes: true });
      for (const ent of entries) {
        if (!ent.isFile()) continue;
        const full = join(ent.parentPath ?? ent.path, ent.name);
        let content;
        try { content = readFileSync(full, 'utf-8'); } catch { continue; }
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (IDENTITY_RE.test(lines[i]) && !/allow-identity:/.test(lines[i])) {
            hits.push(`${full.slice(ROOT.length + 1).replace(/\\/g, '/')}:${i + 1}`);
          }
        }
      }
    }
    return {
      id: 'shipped_identity_leak',
      pass: hits.length === 0,
      detail: hits.length === 0
        ? `출하 dir(skills/agents/templates) 사내 신원(smilegate.com|net / sangcl) 0건 — example payload 누출 차단 (allow-identity: 주석 예외 / EXT-MISS-01 회귀 가드 / content-aware)`
        : `사내 신원 누출 ${hits.length}건: ${hits.slice(0, 8).join(', ')}${hits.length > 8 ? ' …' : ''} — placeholder(reviewer@example.com) 치환 또는 allow-identity: 주석`,
      delegated_to: 'skills/ agents/ templates/ (build-plugin INCLUDE 출하 대상) / regex smilegate\\.(com|net)|sangcl',
    };
  } catch (e) {
    return { id: 'shipped_identity_leak', pass: false, detail: `error: ${e.message}`, delegated_to: 'skills/ agents/ templates/' };
  }
}

// ★ check28 (v11.27.0 / EXT-MISS-06 회귀 가드) — adopter repo-root 자동로드 templates/adoption/CLAUDE.md 가
//   현 6-stage paradigm 정합인지. build-plugin alias → dist root CLAUDE.md = adopter 첫 LLM 운영 컨텍스트(P0).
//   ★ 단일파일 scope (Senior REVISE-B-ii) / 양성 assertion primary(robust) + 음성 stale 토큰 secondary.
//   '4-stage'(hyphen) ≠ 'sdlc-4stage-flow'(합법 flow 파일명) — substring 충돌 없음.
function check28_adoptionParadigmDrift() {
  try {
    const fp = join(ROOT, 'templates/adoption/CLAUDE.md');
    if (!existsSync(fp)) return { id: 'adoption_paradigm_drift', pass: false, detail: 'templates/adoption/CLAUDE.md 부재', delegated_to: 'templates/adoption/CLAUDE.md' };
    const txt = readFileSync(fp, 'utf-8');
    const REQUIRED = ['gate #5', 'discovery', 'implement']; // 현 6-stage 핵심 마커 (양성 / primary)
    const STALE = ['planning-spec', '4-stage', '4단계', 'v2.0.0-rc1']; // stale paradigm (음성 / secondary)
    const missing = REQUIRED.filter((t) => !txt.includes(t));
    const present = STALE.filter((t) => txt.includes(t));
    const problems = [];
    if (missing.length) problems.push(`현 paradigm 마커 누락 [${missing.join(',')}]`);
    if (present.length) problems.push(`stale paradigm 토큰 잔존 [${present.join(',')}]`);
    return {
      id: 'adoption_paradigm_drift',
      pass: problems.length === 0,
      detail: problems.length === 0
        ? `adoption CLAUDE.md 현 6-stage paradigm 정합 (양성 ${REQUIRED.join('/')} 포함 + stale 토큰 0 / EXT-MISS-06 회귀 가드 / adopter 첫 LLM 운영 컨텍스트 P0)`
        : `adoption CLAUDE.md paradigm drift: ${problems.join(' | ')} — 현 6-stage(analysis→discovery→spec→plan→test→implement / gate #1~#5) 동기화 의무`,
      delegated_to: 'templates/adoption/CLAUDE.md (build-plugin → dist root CLAUDE.md alias / 단일파일 / 양성 assertion primary)',
    };
  } catch (e) {
    return { id: 'adoption_paradigm_drift', pass: false, detail: `error: ${e.message}`, delegated_to: 'templates/adoption/CLAUDE.md' };
  }
}

// ★ check29 (v11.28.0 / EXT-MISS-08·EXT-DOC-DRIFT 회귀 가드) — README.md current-version 표기 ↔ plugin.json sync.
//   README = plugin user 진입점 front door. version drift(예: title v11.1.0 인데 plugin v11.27.0 = 26 버전 stale)
//   = 신뢰도 붕괴 + install 오판. check10(CLAUDE.md) 동형 — ★ canonical current-stamp 만 강제
//   (title `# … vX.Y.Z` + `현재 … vX.Y.Z`). 본문 history 언급(v9.0=/v11.0.0= 등)·`v<version>` placeholder 는 제외(오탐 회피).
function check29_readmeVersionSync() {
  try {
    const pluginJsonPath = join(ROOT, '.claude-plugin/plugin.json');
    const readmePath = join(ROOT, 'README.md');
    if (!existsSync(readmePath)) return { id: 'readme_version_sync', pass: false, detail: 'README.md missing', delegated_to: 'README.md' };
    const pluginVer = JSON.parse(readFileSync(pluginJsonPath, 'utf-8')).version;
    const readme = readFileSync(readmePath, 'utf-8');
    const stamps = [];
    const titleM = readme.match(/^#\s+.*?\bv(\d+\.\d+\.\d+)/m);
    if (titleM) stamps.push(['title', titleM[1]]);
    const nowM = readme.match(/현재[^\n]{0,8}\bv(\d+\.\d+\.\d+)/);
    if (nowM) stamps.push(['현재', nowM[1]]);
    if (!stamps.some(([k]) => k === 'title')) {
      return { id: 'readme_version_sync', pass: false, detail: 'README.md title 안 canonical "vX.Y.Z" 표기 부재 (R2 cadence 의무)', delegated_to: 'README.md title ↔ plugin.json.version' };
    }
    const mismatches = stamps.filter(([, v]) => v !== pluginVer).map(([k, v]) => `${k} v${v} ↔ plugin.json v${pluginVer}`);
    return {
      id: 'readme_version_sync',
      pass: mismatches.length === 0,
      detail: mismatches.length === 0
        ? `README.md canonical version 표기(${stamps.map(([k]) => k).join('+')}) 모두 plugin.json v${pluginVer} 정합 (history 언급·v<version> placeholder 제외 / EXT-MISS-08 회귀 가드 / R2 / check10 동형)`
        : `drift: ${mismatches.join(' | ')} — README front-door 버전 stale`,
      delegated_to: 'README.md title `# … vX.Y.Z` + `현재 … vX.Y.Z` ↔ .claude-plugin/plugin.json.version (R2 / check10 동형 / history·placeholder 제외)',
    };
  } catch (e) {
    return { id: 'readme_version_sync', pass: false, detail: `error: ${e.message}`, delegated_to: 'README.md ↔ plugin.json.version' };
  }
}

// ★ check30 (v11.29.0 / EXT-CAPTURE-01·05 캡처 채널 drift enforcement) — Type 2 adopter corroboration 배선 무결.
//   content-aware (file-presence ❌ / Senior F3): ① schema draft-2020-12+strict ② packager bin ③ golden round-trip
//   (fixture → exit 0 + ok) ④ leak-guard discrimination (poisoned --no-redact → exit 1). 배선만 보증 / 측정 ❌.
function check30_adopterCorroborationCapture() {
  try {
    const schemaPath = join(ROOT, 'schemas/adopter-corroboration.schema.json');
    const cli = join(ROOT, 'tools/adopter-evidence-packager/src/cli.js');
    const fixtureState = join(ROOT, 'tools/adopter-evidence-packager/test/fixtures/state.json');
    if (!existsSync(schemaPath)) return { id: 'adopter_corroboration_capture', pass: false, detail: 'adopter-corroboration.schema.json missing', delegated_to: 'schemas/adopter-corroboration.schema.json' };
    if (!existsSync(cli)) return { id: 'adopter_corroboration_capture', pass: false, detail: 'adopter-evidence-packager bin missing', delegated_to: 'tools/adopter-evidence-packager' };
    if (!existsSync(fixtureState)) return { id: 'adopter_corroboration_capture', pass: false, detail: 'packager fixture state.json missing', delegated_to: 'tools/adopter-evidence-packager/test/fixtures' };

    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') return { id: 'adopter_corroboration_capture', pass: false, detail: 'schema $schema ≠ draft-2020-12', delegated_to: 'schemas/adopter-corroboration.schema.json' };
    if (schema.additionalProperties !== false) return { id: 'adopter_corroboration_capture', pass: false, detail: 'schema top-level additionalProperties ≠ false (strict 의무)', delegated_to: 'schemas/adopter-corroboration.schema.json' };

    const pluginVer = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf-8')).version;
    const base = ['--state', fixtureState, '--stack', 'nestjs', '--salt', 'rr', '--captured-at', '2026-06-01T00:00:00Z', '--plugin-version', pluginVer, '--json'];

    // ③ golden round-trip — dry-run (파일 미작성) → exit 0 + ok.
    const golden = spawnSync('node', [cli, ...base, '--dry-run'], { cwd: ROOT, encoding: 'utf-8', shell: false });
    let goldenOk = false;
    try { goldenOk = golden.status === 0 && JSON.parse(golden.stdout).ok === true; } catch { goldenOk = false; }

    // ④ leak-guard discrimination — poisoned(--no-redact + email) → exit 1 + reason pii_leak (content-aware 입증).
    const poisoned = spawnSync('node', [cli, ...base, '--no-redact', '--feedback', 'reach dev@example.com'], { cwd: ROOT, encoding: 'utf-8', shell: false });
    let leakCaught = false;
    try { leakCaught = poisoned.status === 1 && JSON.parse(poisoned.stdout).reason === 'pii_leak'; } catch { leakCaught = false; }

    const pass = goldenOk && leakCaught;
    return {
      id: 'adopter_corroboration_capture',
      pass,
      detail: pass
        ? `Type 2 캡처 배선 무결 — schema draft-2020-12+strict + packager golden round-trip exit 0 + leak-guard discrimination(poisoned exit 1 pii_leak) (★ 배선만 보증 / Type 2 측정=실 adopter 의존 / EXT-CAPTURE-01·05)`
        : `캡처 배선 결함 — golden_ok=${goldenOk} leak_caught=${leakCaught} (golden exit ${golden.status} / poisoned exit ${poisoned.status})`,
      delegated_to: 'tools/adopter-evidence-packager (golden+poisoned round-trip) + schemas/adopter-corroboration.schema.json',
    };
  } catch (e) {
    return { id: 'adopter_corroboration_capture', pass: false, detail: `error: ${e.message}`, delegated_to: 'tools/adopter-evidence-packager + schemas/adopter-corroboration.schema.json' };
  }
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
    check14_preflightTools(args),
    check15_graphIntegrity(),
    check16_codePointerCoverage(args),
    check17_marketplaceStageSync(),
    check18_gateEnumConsistency(),
    check19_legacy4StageExpressionAbsent(),
    check20_planGateOperational(),
    check21_templateCountDrift(),
    check22_beTaskOpenapiRefRatchet(),
    check23_dbAssetsValidator(),
    check24_agentSkillsPhaseFlowSync(),
    check25_templateSchemaValid(),
    check26_gateValidatorListConsistency(),
    check27_shippedIdentityLeak(),
    check28_adoptionParadigmDrift(),
    check29_readmeVersionSync(),
    check30_adopterCorroborationCapture(),
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

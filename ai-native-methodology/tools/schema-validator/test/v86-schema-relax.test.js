// schema-validator 회귀 — v8.6.0+ C Hybrid fix (F-V2C2-1-02 schema 완화).
// 1) meta-confidence: extra field + methodology_version SemVer pre-release + confidence_breakdown number 허용 + additionalProperties true
// 2) discovery-spec: top-level + use_case additionalProperties true

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const TMP = resolve(__dirname, '_tmp_v86');

function runCli(args) {
  return spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    cwd: resolve(__dirname, '../..'),
  });
}

function ensureTmp() {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
}

test('F-V2C2-1-02 R#3 — methodology_version SemVer pre-release 허용 (v2.0.0-rc1)', () => {
  ensureTmp();
  const f = join(TMP, 'inventory.json');
  writeFileSync(f, JSON.stringify({
    meta: { generated_at: '2026-05-18T10:00:00+09:00', confidence: 0.9, inputs_used: ['source_code'], methodology_version: 'v2.0.0-rc1' },
    repo: { name: 't', total_files: 1 },
    stack: {},
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `v2.0.0-rc1 valid 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('F-V2C2-1-02 R#1 — meta-confidence extra field 허용', () => {
  ensureTmp();
  const f = join(TMP, 'inventory.json');
  writeFileSync(f, JSON.stringify({
    meta: {
      generated_at: '2026-05-18T10:00:00+09:00', confidence: 0.9, inputs_used: ['source_code'],
      extra: { confidence_reasoning: '소스 grep 기반 high confidence', _custom_metadata: { foo: 'bar' } },
    },
    repo: { name: 't', total_files: 1 },
    stack: {},
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `extra field 허용 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('F-V2C2-1-02 R#1 — meta additionalProperties true (부가 keys 허용)', () => {
  ensureTmp();
  const f = join(TMP, 'inventory.json');
  writeFileSync(f, JSON.stringify({
    meta: {
      generated_at: '2026-05-18T10:00:00+09:00', confidence: 0.9, inputs_used: ['source_code'],
      confidence_reasoning: '직접 부가 metadata',
      _inputs_used_evidence: ['evidence-1', 'evidence-2'],
    },
    repo: { name: 't', total_files: 1 },
    stack: {},
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `meta 부가 keys 허용 의무 (additionalProperties:true). stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('F-V2C2-1-02 R#2 — confidence_breakdown number value 허용 (PoC #07 패턴)', () => {
  ensureTmp();
  const f = join(TMP, 'inventory.json');
  writeFileSync(f, JSON.stringify({
    meta: {
      generated_at: '2026-05-18T10:00:00+09:00', confidence: 0.9, inputs_used: ['source_code'],
      confidence_breakdown: { use_cases: 0.85, business_rules: 0.8 },
    },
    repo: { name: 't', total_files: 1 },
    stack: {},
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `confidence_breakdown number 허용 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('F-V2C2-1-02 R#4 — discovery-spec top-level 부가 keys 허용', () => {
  ensureTmp();
  const f = join(TMP, 'discovery-spec.json');
  writeFileSync(f, JSON.stringify({
    meta: { generated_at: '2026-05-18T10:00:00+09:00', confidence: 0.9, inputs_used: ['source_code'] },
    derivation_source: { type: 'legacy-extraction', source_artifacts: ['x'] },
    business_intent: { domain_purpose: 'test' },
    use_cases: [{ id: 'UC-TEST-001', description: 't', acceptance_criteria_refs: ['AC-TEST-001'] }],
    business_rules: [],
    migration_priority_summary: 'foo',
    phase_4_7_acceptance_oracle: {},
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `discovery-spec top-level 부가 keys 허용 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('F-V2C2-1-02 R#4 — discovery-spec use_case 부가 keys 허용 (note 등)', () => {
  ensureTmp();
  const f = join(TMP, 'discovery-spec.json');
  writeFileSync(f, JSON.stringify({
    meta: { generated_at: '2026-05-18T10:00:00+09:00', confidence: 0.9, inputs_used: ['source_code'] },
    derivation_source: { type: 'legacy-extraction', source_artifacts: ['x'] },
    business_intent: { domain_purpose: 'test' },
    use_cases: [{ id: 'UC-TEST-001', description: 't', acceptance_criteria_refs: ['AC-TEST-001'], note: 'arbitrary note', rationale: 'extra rationale field' }],
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `use_case 부가 keys 허용 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

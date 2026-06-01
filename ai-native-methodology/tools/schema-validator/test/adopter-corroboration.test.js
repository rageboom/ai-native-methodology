// schema-validator 회귀 — v11.29.0 adopter-corroboration.schema.json (Type 2 캡처 / EXT-CAPTURE-01).
//   1) valid sample (S2 / 5 gates / coverage + feedback)
//   2) anonymization 누락 reject (required)
//   3) adopter_id non-hex reject (opaque pattern)
//   4) loc_bucket enum 외 reject
//   5) additionalProperties reject (strict)

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const TMP = resolve(__dirname, '_tmp_adopter_corroboration');

function runCli(args) {
  return spawnSync('node', [CLI, ...args], { encoding: 'utf-8', cwd: resolve(__dirname, '../..') });
}
function ensureTmp() {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
}

const VALID = {
  schema_version: '1.0.0',
  plugin_version: '11.29.0',
  captured_at: '2026-06-01T12:00:00Z',
  adopter: { adopter_id: 'a'.repeat(32), org_type: 'external-oss' },
  project: { project_hash: 'b'.repeat(32), stack_signals: ['nestjs', 'prisma'], scenario: 'S2', loc_bucket: '10k-100k' },
  chain_run: {
    completed: true,
    terminal_stage: 'implement',
    gates: [
      { id: '#1', stage: 'discovery', decision: 'go' },
      { id: '#5', stage: 'implement', decision: 'go', validator_findings: { critical: 0, high: 0, medium: 2, low: 1, info: 0 } },
    ],
  },
  findings_summary: { critical: 0, high: 1, medium: 4, low: 3, info: 2, total: 10 },
  coverage: { link_coverage: 1, test_pass_rate: 1, line_branch_coverage: 0.91 },
  user_feedback: { summary: 'worked well', friction_points: ['setup docs'] },
  anonymization: { applied: true, redaction_count: 0, method: 'best-effort regex + leak guard' },
};

function writeAndRun(obj) {
  ensureTmp();
  const f = join(TMP, 'adopter-corroboration.json');
  writeFileSync(f, JSON.stringify(obj));
  const r = runCli([f]);
  rmSync(TMP, { recursive: true, force: true });
  return r;
}

test('adopter-corroboration — valid sample (S2 / 5 gates / coverage+feedback)', () => {
  const r = writeAndRun(VALID);
  assert.equal(r.status, 0, `valid sample 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
});

test('adopter-corroboration — anonymization 누락 reject (required)', () => {
  const { anonymization, ...partial } = VALID;
  const r = writeAndRun(partial);
  assert.notEqual(r.status, 0, `anonymization required. stdout:${r.stdout}`);
});

test('adopter-corroboration — adopter_id non-hex reject (opaque pattern)', () => {
  const r = writeAndRun({ ...VALID, adopter: { adopter_id: 'NOT-HEX-real@id', org_type: 'individual' } });
  assert.notEqual(r.status, 0, `adopter_id ^[a-f0-9]{8,64}$ 의무. stdout:${r.stdout}`);
});

test('adopter-corroboration — loc_bucket enum 외 reject', () => {
  const r = writeAndRun({ ...VALID, project: { ...VALID.project, loc_bucket: '5k' } });
  assert.notEqual(r.status, 0, `loc_bucket enum 의무. stdout:${r.stdout}`);
});

test('adopter-corroboration — additionalProperties reject (strict)', () => {
  const r = writeAndRun({ ...VALID, secret_payload: 'leak' });
  assert.notEqual(r.status, 0, `top-level additionalProperties:false. stdout:${r.stdout}`);
});

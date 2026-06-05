// schema-validator 회귀 — v8.6.0+ ticket-binding policy (DEC-2026-05-18).
// traceability-matrix.schema.json matrix.items.ticket_ref optional field 검증:
//   1) ticket_ref 없는 matrix valid (기존 회귀 / breaking 0)
//   2) ticket_ref 있는 matrix valid (신규)
//   3) platform enum 외 값 reject
//   4) subtask_ids unknown chain key reject

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const TMP = resolve(__dirname, '_tmp_ticket_binding');

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

const META_OK = {
  generated_at: '2026-05-18T10:00:00+09:00',
  confidence: 0.9,
  inputs_used: ['source_code', 'documentation'],
  methodology_version: 'v8.6.0',
};

function baseMatrix(extraCell = {}) {
  return {
    meta: META_OK,
    matrix: [
      {
        use_case_id: 'UC-CAR-007',
        status: 'yellow',
        ...extraCell,
      },
    ],
    coverage_summary: {
      forward_coverage: 0.85,
      backward_coverage: 0.85,
      threshold: 0.85,
    },
  };
}

test('ticket-binding — ticket_ref 없는 traceability matrix valid (regression breaking 0)', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix()));
  const r = runCli([f]);
  assert.equal(r.status, 0, `omit valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('ticket-binding — ticket_ref 있는 traceability matrix valid (Tier 1 신규)', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix({
    ticket_ref: {
      platform: 'jira',
      id: 'MIG-1234',
      url: 'https://company.atlassian.net/browse/MIG-1234',
      epic_id: 'MIG-1000',
      initiative_id: 'MIG-1',
      subtask_ids: {
        chain1_planning: 'MIG-1235',
        chain2_spec: 'MIG-1236',
        chain3_test: 'MIG-1237',
        chain4_impl: 'MIG-1238',
      },
    },
  })));
  const r = runCli([f]);
  assert.equal(r.status, 0, `Tier 1 ticket_ref valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('ticket-binding — platform enum 외 값 reject', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix({
    ticket_ref: { platform: 'redmine', id: 'X-1' },
  })));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `enum 외 platform reject 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('ticket-binding — subtask_ids unknown chain key reject', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix({
    ticket_ref: {
      platform: 'jira',
      id: 'MIG-1234',
      subtask_ids: { chain99_unknown: 'MIG-9999' },
    },
  })));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `subtask_ids 의 unknown key reject 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('ticket-binding — platform/id 누락 시 reject (required)', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix({
    ticket_ref: { url: 'https://example.com/x' },
  })));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `platform + id required 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('ticket-binding — 다양 platform (linear / github / azure-devops) valid', () => {
  ensureTmp();
  for (const platform of ['linear', 'github', 'asana', 'azure-devops', 'other']) {
    const f = join(TMP, 'traceability-matrix.json');
    writeFileSync(f, JSON.stringify(baseMatrix({
      ticket_ref: { platform, id: `X-${platform}` },
    })));
    const r = runCli([f]);
    assert.equal(r.status, 0, `${platform} valid 의무. stdout:${r.stdout}`);
  }
  rmSync(TMP, { recursive: true, force: true });
});

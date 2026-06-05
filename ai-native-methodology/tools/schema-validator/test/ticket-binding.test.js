// schema-validator 회귀 — ticket-binding policy R20-prime (DEC-2026-05-26-ticket-plan-단일).
// traceability-matrix.schema.json matrix.items.ticket_ref optional field 검증:
//   1) ticket_ref 없는 matrix valid (기존 회귀 / breaking 0)
//   2) ticket_ref 있는 matrix valid (R20-prime: level + subtask_refs + op_task_refs)
//   3) platform enum 외 값 reject
//   4) level enum 외 값 reject
//   5) 구 subtask_ids field 폐기 — unknown field → reject (breaking 회귀 가드)

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

test('ticket-binding — ticket_ref 있는 traceability matrix valid (R20-prime: level + subtask_refs + op_task_refs)', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix({
    ticket_ref: {
      platform: 'jira',
      id: 'MIG-1234',
      url: 'https://company.atlassian.net/browse/MIG-1234',
      level: 'story',
      epic_id: 'MIG-1000',
      initiative_id: 'MIG-1',
      subtask_refs: ['MIG-1235', 'MIG-1236'],
      op_task_refs: ['MIG-1240'],
    },
  })));
  const r = runCli([f]);
  assert.equal(r.status, 0, `R20-prime ticket_ref valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
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

test('ticket-binding — level enum 외 값 reject (R20-prime)', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix({
    ticket_ref: { platform: 'jira', id: 'MIG-1234', level: 'chain3_test' },
  })));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `level enum(epic/story/op_task/subtask) 외 값 reject 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('ticket-binding — 구 subtask_ids field 폐기 → unknown field reject (breaking 회귀 가드)', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify(baseMatrix({
    ticket_ref: {
      platform: 'jira',
      id: 'MIG-1234',
      subtask_ids: { chain1_planning: 'MIG-1235' },
    },
  })));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `구 subtask_ids 는 R20-prime 에서 폐기 → additionalProperties:false 가 reject 의무. stdout:${r.stdout}`);
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

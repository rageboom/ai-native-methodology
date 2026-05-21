// schema-validator 회귀 — v8.8.0 Tier 4.1 cycle-carry.schema.json (DEC-2026-05-21).
// CarryRecord 의 resolution_kind 의무 검증 (status=completed 시):
//   1) status=pending 의 carry — resolution_kind 없어도 valid
//   2) status=completed + resolution_kind=intended — valid
//   3) status=completed 인데 resolution_kind 누락 — invalid (allOf if/then)
//   4) resolution_kind enum 외 값 reject
//   5) id format (A1 / CARRY-CAR-001 / F-CYCLE7-001) 모두 valid
//   6) cycle-7 의 실 cycle-3 carry resolution pattern fixture (alternative)

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const TMP = resolve(__dirname, '_tmp_v880_cycle_carry');

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

function writeFixture(name, obj) {
  const p = join(TMP, name);
  writeFileSync(
    p,
    JSON.stringify(
      { $schema_origin: '../../../schemas/cycle-carry.schema.json', ...obj },
      null,
      2,
    ),
  );
  return p;
}

test('v8.8.0 — cycle-carry pending status valid without resolution_kind', () => {
  ensureTmp();
  const fixture = writeFixture('pending.cycle-carry.json', {
    schema_version: 'v8.8.0',
    cycle: 7,
    scope: 'car',
    carries: [{ id: 'CARRY-CAR-001', title: 'supertest e2e bootstrap', status: 'pending' }],
  });
  const res = runCli([fixture]);
  assert.equal(res.status, 0, `expected exit 0, got ${res.status}. stderr: ${res.stderr}`);
});

test('v8.8.0 — cycle-carry completed + resolution_kind=intended valid', () => {
  ensureTmp();
  const fixture = writeFixture('completed-intended.cycle-carry.json', {
    schema_version: 'v8.8.0',
    cycle: 7,
    scope: 'car',
    carries: [
      {
        id: 'A1',
        title: 'R15 silent enabler 차단',
        original_intent: 'v8.7 PATCH 후 영구 차단',
        status: 'completed',
        resolution_kind: 'intended',
        resolution_note: 'v8.7.1 PATCH 으로 영구 차단 입증',
        resolved_at: '2026-05-21T10:00:00+09:00',
        resolved_in_cycle: 7,
        severity: 'critical',
        cross_link: ['F-CYCLE3-005', 'F-CYCLE7-004'],
      },
    ],
  });
  const res = runCli([fixture]);
  assert.equal(res.status, 0, `expected exit 0, got ${res.status}. stderr: ${res.stderr}`);
});

test('v8.8.0 — cycle-carry completed without resolution_kind invalid (allOf if/then)', () => {
  ensureTmp();
  const fixture = writeFixture('completed-missing.cycle-carry.json', {
    schema_version: 'v8.8.0',
    cycle: 7,
    scope: 'car',
    carries: [
      {
        id: 'CARRY-CAR-002',
        title: 'incomplete carry',
        status: 'completed',
      },
    ],
  });
  const res = runCli([fixture]);
  assert.notEqual(res.status, 0, 'expected non-zero exit for missing resolution_kind on completed status');
});

test('v8.8.0 — cycle-carry resolution_kind enum violation rejected', () => {
  ensureTmp();
  const fixture = writeFixture('bad-enum.cycle-carry.json', {
    schema_version: 'v8.8.0',
    cycle: 7,
    scope: 'car',
    carries: [
      {
        id: 'CARRY-CAR-003',
        title: 'bad enum',
        status: 'completed',
        resolution_kind: 'mystery',
        resolved_at: '2026-05-21T10:00:00+09:00',
        resolved_in_cycle: 7,
      },
    ],
  });
  const res = runCli([fixture]);
  assert.notEqual(res.status, 0, 'expected non-zero exit for resolution_kind enum violation');
});

test('v8.8.0 — cycle-carry alternative resolution (cycle-3 A2 → cycle-7 신규 분석)', () => {
  ensureTmp();
  const fixture = writeFixture('alternative-resolution.cycle-carry.json', {
    schema_version: 'v8.8.0',
    cycle: 7,
    scope: 'car',
    carries: [
      {
        id: 'A2',
        title: 'sql-inventory redo (cycle-3 carry)',
        original_intent: 'v8.7 PATCH 적용 후 cycle-3 산출물 redo',
        status: 'completed',
        resolution_kind: 'alternative',
        resolution_note: 'cycle-7 의 신규 분석으로 cross-validation 완성 — redo 아닌 신규 작성. 의도 동등.',
        resolved_at: '2026-05-21T10:00:00+09:00',
        resolved_in_cycle: 7,
        severity: 'high',
        cross_link: ['F-CYCLE3-005'],
      },
    ],
  });
  const res = runCli([fixture]);
  assert.equal(res.status, 0, `expected exit 0 (alternative is valid resolution_kind), got ${res.status}. stderr: ${res.stderr}`);
});

test('v8.8.0 — cycle-carry id format A1 / CARRY-XXX-NNN / F-CYCLEN-NNN all valid', () => {
  ensureTmp();
  for (const id of ['A1', 'A99', 'CARRY-CAR-001', 'CARRY-RBAC-999', 'F-CYCLE7-001', 'AP-CYCLE7-010']) {
    const fixture = writeFixture(`id-${id}.cycle-carry.json`, {
      schema_version: 'v8.8.0',
      cycle: 7,
      scope: 'car',
      carries: [{ id, title: 'id-format test', status: 'pending' }],
    });
    const res = runCli([fixture]);
    assert.equal(res.status, 0, `id=${id} expected valid, got exit ${res.status}. stderr: ${res.stderr}`);
  }
});

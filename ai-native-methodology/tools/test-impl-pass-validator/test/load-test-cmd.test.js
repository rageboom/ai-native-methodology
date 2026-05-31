// load-test-cmd inference 정직성 unit test — ★ F-T06 / T16 (INSPECTION-2026-05-31-test).
// 추론이 adapter 없는 framework(mocha/go)를 가짜 지원으로 advertise 하지 않고
// framework:'other' + 실측 가능한 stdout_parser scaffold 로 내려보냄을 입증 (no-simulation).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { inferFromStackSignals } from '../src/load-test-cmd.js';
import { parseStdout } from '../src/runners/other.js';

test('★ T16 — adapter 보유 framework(jest/vitest/junit5/pytest) 직접 추론 유지', () => {
  assert.equal(inferFromStackSignals(['nodejs', 'jest']).framework, 'jest');
  assert.equal(inferFromStackSignals(['nodejs', 'vitest']).framework, 'vitest');
  assert.equal(inferFromStackSignals(['java', 'maven']).framework, 'junit5');
  assert.equal(inferFromStackSignals(['python', 'pytest']).framework, 'pytest');
});

test('★ T16 — mocha 추론 = framework:other + 실행가능 stdout_parser (selectAdapter throw 회피)', () => {
  const r = inferFromStackSignals(['nodejs', 'mocha']);
  assert.equal(r.framework, 'other');
  assert.equal(r.report_format, 'stdout-regex');
  assert.ok(r.stdout_parser?.pass_regex, 'stdout_parser 동반 의무 (test-cmd schema if/then)');
  // 실측: mocha spec 출력 → 정확 카운트
  const p = parseStdout('  5 passing (1s)\n  1 pending\n  2 failing', r.stdout_parser);
  assert.equal(p.pass_count, 5);
  assert.equal(p.fail_count, 2);
  assert.equal(p.skip_count, 1);
});

test('★ T16 — go 추론 = framework:other + count_mode occurrences (per-test 라인 정직 집계)', () => {
  const r = inferFromStackSignals(['go']);
  assert.equal(r.framework, 'other');
  assert.equal(r.report_format, 'stdout-regex');
  assert.equal(r.stdout_parser?.count_mode, 'occurrences');
  const out = [
    '=== RUN   TestFoo', '--- PASS: TestFoo (0.00s)',
    '=== RUN   TestBar', '--- FAIL: TestBar (0.01s)',
    '=== RUN   TestBaz', '--- SKIP: TestBaz (0.00s)',
    'FAIL',
  ].join('\n');
  const p = parseStdout(out, r.stdout_parser);
  assert.equal(p.pass_count, 1);
  assert.equal(p.fail_count, 1);
  assert.equal(p.skip_count, 1);
  assert.equal(p.test_names.length, 3);
});

test('★ T16 — 미매칭 stack_signals → null (사용자 명시 의무 fallthrough)', () => {
  assert.equal(inferFromStackSignals(['cobol', 'mainframe']), null);
  assert.equal(inferFromStackSignals([]), null);
});

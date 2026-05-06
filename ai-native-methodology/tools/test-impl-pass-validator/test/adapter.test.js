// adapter unit test (★ ★ ★ no-simulation 정합 — fixture 기반 실 parser 검증).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseJestJson } from '../src/runners/jest.js';
import { parseVitestJson } from '../src/runners/vitest.js';
import { parseJunitXml } from '../src/runners/junit-xml.js';
import { parsePytestJson } from '../src/runners/pytest.js';
import { parseStdout } from '../src/runners/other.js';
import { computeResultHash } from '../src/result-hash.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fix = (name) => readFileSync(resolve(__dirname, 'fixtures', name), 'utf-8');

test('★ jest adapter — fixture parsing (3 pass / 0 fail)', () => {
  const r = parseJestJson(fix('jest.json'));
  assert.equal(r.framework, 'jest');
  assert.equal(r.pass_count, 3);
  assert.equal(r.fail_count, 0);
  assert.equal(r.skip_count, 0);
  assert.equal(r.success, true);
  assert.deepEqual(r.test_names.sort(), [
    'article create returns 201',
    'user login rejects empty password',
    'user login validates email',
  ]);
});

test('★ jest adapter — result_hash 결정성', () => {
  const r1 = parseJestJson(fix('jest.json'));
  const r2 = parseJestJson(fix('jest.json'));
  const h1 = computeResultHash({ ...r1, framework_version: '29.7.0' });
  const h2 = computeResultHash({ ...r2, framework_version: '29.7.0' });
  assert.equal(h1, h2);
});

test('★ vitest adapter — jest 호환 schema 정합 (fixture reuse)', () => {
  const r = parseVitestJson(fix('jest.json'));  // jest fixture = vitest schema 호환
  assert.equal(r.framework, 'vitest');
  assert.equal(r.pass_count, 3);
});

test('★ junit-xml adapter — testsuites attribute 우선 (4 tests / 1 fail / 1 skip)', () => {
  const r = parseJunitXml(fix('junit.xml'));
  assert.equal(r.framework, 'junit5');
  assert.equal(r.total, 4);
  assert.equal(r.fail_count, 1);
  assert.equal(r.skip_count, 1);
  assert.equal(r.pass_count, 2);
  assert.equal(r.success, false);
});

test('★ junit-xml adapter — test_names 추출 (classname.name)', () => {
  const r = parseJunitXml(fix('junit.xml'));
  assert.ok(r.test_names.includes('com.example.UserTest.testLoginSuccess'));
  assert.ok(r.test_names.includes('com.example.ArticleTest.testCreateMissingTitle'));
});

test('★ pytest adapter — fixture parsing (4 pass / 1 skip)', () => {
  const r = parsePytestJson(fix('pytest.json'));
  assert.equal(r.framework, 'pytest');
  assert.equal(r.pass_count, 4);
  assert.equal(r.skip_count, 1);
  assert.equal(r.fail_count, 0);
  assert.equal(r.success, true);
});

test('★ other adapter — stdout regex parsing', () => {
  const stdout = `running 5 tests
test foo::bar passed
test foo::baz passed
test foo::qux failed
3 passed; 1 failed; 0 skipped`;
  const r = parseStdout(stdout, {
    pass_regex: '(\\d+) passed',
    fail_regex: '(\\d+) failed',
    skip_regex: '(\\d+) skipped',
    test_name_regex: 'test (\\S+) (?:passed|failed)',
  });
  assert.equal(r.pass_count, 3);
  assert.equal(r.fail_count, 1);
  assert.equal(r.skip_count, 0);
  assert.equal(r.test_names.length, 3);
});

test('★ other adapter — parser 부재 → throw (★ ADR-CHAIN-004 §1 if/then 정합)', () => {
  assert.throws(() => parseStdout('foo', null), /의무/);
});

test('★ jest adapter — fail count → success=false', () => {
  const failedFixture = JSON.stringify({
    success: false,
    numTotalTests: 2,
    numPassedTests: 1,
    numFailedTests: 1,
    numPendingTests: 0,
    testResults: [{
      assertionResults: [
        { fullName: 'a', status: 'passed' },
        { fullName: 'b', status: 'failed' },
      ],
    }],
  });
  const r = parseJestJson(failedFixture);
  assert.equal(r.success, false);
  assert.equal(r.fail_count, 1);
});

test('★ junit-xml adapter — passed-only suite → success=true', () => {
  const xml = `<?xml version="1.0"?>
<testsuites tests="2" failures="0" errors="0" skipped="0">
  <testsuite name="X" tests="2"><testcase classname="X" name="a"/><testcase classname="X" name="b"/></testsuite>
</testsuites>`;
  const r = parseJunitXml(xml);
  assert.equal(r.success, true);
  assert.equal(r.pass_count, 2);
});

// check-phase-skills.test.js — 3-way layout 검증 통합 test.
// v1.4.4 신설.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { checkPhaseSkills, summarizeLayoutCheck, checkChainStageLayout, summarizeChainLayoutCheck } from '../src/check-phase-skills.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// workspace root = tools/drift-validator/test → ../../.. = ai-native-methodology workspace
const WORKSPACE = resolve(__dirname, '../../..');

test('check-phase-skills — current workspace 정합 ok (★ 0 orphan / 0 missing 의무)', () => {
  const result = checkPhaseSkills(WORKSPACE);
  if (!result.ok) {
    console.error('[check-phase-skills] layout findings:');
    for (const d of result.diffs) {
      console.error(`  - [${d.severity}] ${d.kind}: ${d.message}`);
    }
  }
  assert.equal(result.ok, true, 'current workspace layout must be consistent (manifest ↔ workflow ↔ skills)');
  assert.ok(result.counts.phases_checked >= 9, `at least 9 phases (got ${result.counts.phases_checked})`);
  assert.ok(result.counts.skills_declared >= 14, `at least 14 skills declared in manifest (got ${result.counts.skills_declared})`);
});

test('check-phase-skills — manifest 부재 시 graceful', () => {
  const result = checkPhaseSkills('/nonexistent/path/xyz');
  assert.equal(result.ok, false);
  assert.equal(result.diffs.length, 1);
  assert.equal(result.diffs[0].kind, 'manifest.missing');
});

test('summarizeLayoutCheck — pass/fail 메시지 정합', () => {
  const okResult = { ok: true, diffs: [], counts: { phases_checked: 9, skills_declared: 14 } };
  assert.match(summarizeLayoutCheck(okResult), /layout check passed/);
  assert.match(summarizeLayoutCheck(okResult), /9 phases/);

  const failResult = {
    ok: false,
    diffs: [{ severity: 'breaking', kind: 'test.fail', message: 'x' }],
    counts: {},
  };
  assert.match(summarizeLayoutCheck(failResult), /layout check failed/);
  assert.match(summarizeLayoutCheck(failResult), /1 breaking/);
});

// ★ ★ v2.0 sub-plan-4 — chain stage layout 검증 test

test('★ ★ chain stage layout — current workspace 정합 ok (4 stages / 0 orphan)', () => {
  const result = checkChainStageLayout(WORKSPACE);
  if (!result.ok) {
    console.error('[chain-stage-layout] findings:');
    for (const d of result.diffs) {
      console.error(`  - [${d.severity}] ${d.kind}: ${d.message}`);
    }
  }
  assert.equal(result.ok, true, 'chain stage layout must be consistent');
  assert.equal(result.counts.chain_stages, 4, '4 chain stages (planning/spec/test/implement)');
  assert.ok(result.counts.phases_checked >= 20, `≥ 20 phases (got ${result.counts.phases_checked})`);
  assert.ok(result.counts.skills_declared >= 13, `≥ 13 chain skills declared (got ${result.counts.skills_declared})`);
});

test('★ chain stage layout — workspace 부재 → diffs', () => {
  const result = checkChainStageLayout('/nonexistent/path/xyz');
  assert.equal(result.ok, false);
  assert.ok(result.diffs.length >= 1, 'expected ≥ 1 diff (sdlc-4stage-flow + 4 chain flow missing)');
});

test('★ summarizeChainLayoutCheck — pass/fail 메시지 정합', () => {
  const ok = { ok: true, diffs: [], counts: { chain_stages: 4, phases_checked: 26, skills_declared: 13 } };
  assert.match(summarizeChainLayoutCheck(ok), /chain layout check passed/);
  assert.match(summarizeChainLayoutCheck(ok), /4 stages/);
  assert.match(summarizeChainLayoutCheck(ok), /26 phases/);

  const fail = { ok: false, diffs: [{ severity: 'breaking', kind: 'x' }], counts: {} };
  assert.match(summarizeChainLayoutCheck(fail), /chain layout check failed/);
});

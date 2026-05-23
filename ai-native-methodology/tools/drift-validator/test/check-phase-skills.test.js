// check-phase-skills.test.js — 3-way layout 검증 통합 test.
// v1.4.4 신설.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { checkPhaseSkills, summarizeLayoutCheck, checkChainStageLayout, summarizeChainLayoutCheck, checkStateFlowConsistency, summarizeStateFlowConsistency } from '../src/check-phase-skills.js';

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

test('★ ★ chain stage layout — current workspace 정합 ok (5 stages / 0 orphan)', () => {
  const result = checkChainStageLayout(WORKSPACE);
  if (!result.ok) {
    console.error('[chain-stage-layout] findings:');
    for (const d of result.diffs) {
      console.error(`  - [${d.severity}] ${d.kind}: ${d.message}`);
    }
  }
  assert.equal(result.ok, true, 'chain stage layout must be consistent');
  assert.equal(result.counts.chain_stages, 5, '5 chain stages (discovery/spec/plan/test/implement)');
  assert.ok(result.counts.phases_checked >= 20, `≥ 20 phases (got ${result.counts.phases_checked})`);
  assert.ok(result.counts.skills_declared >= 13, `≥ 13 chain skills declared (got ${result.counts.skills_declared})`);
});

test('★ chain stage layout — workspace 부재 → diffs', () => {
  const result = checkChainStageLayout('/nonexistent/path/xyz');
  assert.equal(result.ok, false);
  assert.ok(result.diffs.length >= 1, 'expected ≥ 1 diff (sdlc-4stage-flow + 4 chain flow missing)');
});

test('★ summarizeChainLayoutCheck — pass/fail 메시지 정합', () => {
  const ok = { ok: true, diffs: [], counts: { chain_stages: 5, phases_checked: 30, skills_declared: 22 } };
  assert.match(summarizeChainLayoutCheck(ok), /chain layout check passed/);
  assert.match(summarizeChainLayoutCheck(ok), /5 stages/);
  assert.match(summarizeChainLayoutCheck(ok), /30 phases/);

  const fail = { ok: false, diffs: [{ severity: 'breaking', kind: 'x' }], counts: {} };
  assert.match(summarizeChainLayoutCheck(fail), /chain layout check failed/);
});

// ★ ★ ★ sub-plan-6 (sp5-c7 / Senior F8) — state.schema.json ↔ sdlc-4stage-flow.json 정합 검증

test('★ state-flow consistency — current workspace 정합 ok (★ enum vs flow stages)', () => {
  const result = checkStateFlowConsistency(WORKSPACE);
  if (!result.ok) {
    console.error('[state-flow] findings:');
    for (const d of result.diffs) {
      console.error(`  - [${d.severity}] ${d.kind}: ${d.message}`);
    }
  }
  assert.equal(result.ok, true, 'state.schema enum must match sdlc-4stage-flow stages');
  assert.equal(result.counts.flow_stages, 6, '6 flow stages (analysis/discovery/spec/plan/test/implement)');
  assert.equal(result.counts.enum_strict_stages, 6, '6 enum strict stages (excluding revisit_pending)');
});

test('★ state-flow consistency — workspace 부재 → breaking diff', () => {
  const result = checkStateFlowConsistency('/nonexistent/path/xyz');
  assert.equal(result.ok, false);
  assert.ok(result.diffs.length >= 1);
  assert.match(result.diffs[0].kind, /missing/);
});

test('★ summarizeStateFlowConsistency — pass/fail 메시지 정합', () => {
  const ok = { ok: true, diffs: [], counts: { enum_strict_stages: 5, flow_stages: 5, state_extra_values: 1 } };
  assert.match(summarizeStateFlowConsistency(ok), /state-flow consistency passed/);
  assert.match(summarizeStateFlowConsistency(ok), /5 flow stages/);
  const fail = { ok: false, diffs: [{ severity: 'breaking', kind: 'x' }], counts: {} };
  assert.match(summarizeStateFlowConsistency(fail), /state-flow consistency failed/);
});

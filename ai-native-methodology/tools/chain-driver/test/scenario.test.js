// scenario.test.js — use-scenario taxonomy plumbing + scenario-aware gate matrix (★ v11.9.0).
// DEC-2026-05-30-use-scenario-impl-slice1.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createScopeManifest, renderManifestMd, SCENARIOS } from '../src/work-unit.js';
import { ensureScopeDir, readManifest } from '../src/state-store.js';
import { evaluateGate, applyUserDecision } from '../src/gate-eval.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'schemas', 'work-unit-manifest.schema.json'), 'utf-8'),
);

let tmp;
before(() => { tmp = mkdtempSync(join(tmpdir(), 'chain-driver-scenario-')); });
after(() => { rmSync(tmp, { recursive: true, force: true }); });

describe('use-scenario plumbing (work-unit + state-store)', () => {
  it('createScopeManifest(scope, "S2") → manifest.scenario = S2', () => {
    const m = createScopeManifest('car-list', 'S2');
    assert.equal(m.scenario, 'S2');
  });

  it('createScopeManifest(scope) without scenario → no scenario field (optional / backward-compat)', () => {
    const m = createScopeManifest('car-list');
    assert.equal('scenario' in m, false);
  });

  it('createScopeManifest rejects invalid scenario', () => {
    assert.throws(() => createScopeManifest('x', 'BOGUS'), /invalid scenario/);
  });

  it('ensureScopeDir(root, scope, "greenfield") persists scenario into scope manifest.json', () => {
    const root = join(tmp, 'p-green');
    ensureScopeDir(root, 'new-feature', 'greenfield');
    const m = readManifest(root, 'new-feature');
    assert.equal(m.scenario, 'greenfield');
  });

  it('ensureScopeDir without scenario → manifest has no scenario (backward-compat)', () => {
    const root = join(tmp, 'p-nosc');
    ensureScopeDir(root, 'legacy-feature');
    const m = readManifest(root, 'legacy-feature');
    assert.equal(m.scenario, undefined);
  });

  it('renderManifestMd includes Scenario line when present, omits when absent', () => {
    assert.match(renderManifestMd(createScopeManifest('x', 'S1')), /- \*\*Scenario\*\*: `S1`/);
    assert.doesNotMatch(renderManifestMd(createScopeManifest('x')), /Scenario/);
  });
});

describe('work-unit-manifest schema — scenario enum', () => {
  it('schema declares scenario enum = SCENARIOS', () => {
    assert.deepEqual(SCHEMA.properties.scenario.enum, ['S1', 'S2', 'S3', 'greenfield']);
    assert.deepEqual(SCENARIOS, ['S1', 'S2', 'S3', 'greenfield']);
  });

  it('createScopeManifest output keys ⊆ schema.properties (additionalProperties:false conformance)', () => {
    const allowed = new Set(Object.keys(SCHEMA.properties));
    for (const k of Object.keys(createScopeManifest('x', 'S2'))) {
      assert.ok(allowed.has(k), `manifest key '${k}' must be declared in schema`);
    }
  });
});

describe('scenario-aware gate matrix (gate-eval / F-DOGFOOD-007 구조 해소)', () => {
  const greenTests = { tests_total: 5, tests_failed: 0, llm_status: 'skipped' };
  const redTests = { tests_total: 5, tests_failed: 3, llm_status: 'skipped' };

  it('S1 default (no scenario arg): test stage requires RED — all-pass → blocked', () => {
    const r = evaluateGate('test', greenTests);
    assert.equal(r.blocked, true);
    assert.ok(r.reasons.some((x) => x.code === 'evidence_missing'));
  });

  it('greenfield: test stage requires RED (forward / 동일) — all-pass → blocked', () => {
    const r = evaluateGate('test', greenTests, 'greenfield');
    assert.equal(r.blocked, true);
  });

  it('★ S3 특성화: test stage RED 강제 ❌ (snapshot_green) — all-pass → NOT blocked', () => {
    const r = evaluateGate('test', greenTests, 'S3');
    assert.equal(r.blocked, false);
  });

  it('S1 implement stage requires GREEN — test fail → blocked', () => {
    const r = evaluateGate('implement', redTests);
    assert.equal(r.blocked, true);
  });

  it('S1 test stage RED present (tests fail) → NOT blocked by RED rule', () => {
    const r = evaluateGate('test', redTests);
    // RED 충족 → evidence_missing(RED) 사유 없음
    assert.equal(r.reasons.some((x) => x.detail && x.detail.includes('RED proof missing')), false);
  });

  it('unknown scenario → falls back to S1 matrix (no crash)', () => {
    const r = evaluateGate('test', greenTests, 'UNKNOWN');
    assert.equal(r.blocked, true);
  });
});

// ★ v11.11.0 — S2(AX전환) per_tc_outcome gate (C-use-scenario-s2-gate / DEC-2026-05-30-s2-gate-slice).
//   characterization(expected_outcome='pass') GREEN + augmentation(='fail') RED 혼합 → per-TC 일치 검사.
//   aggregate all_fail/all_pass 가 아니라 validator 의 outcome_mismatches 로 판정.
describe('★ S2 AX전환 per_tc_outcome gate (characterization GREEN + augmentation RED)', () => {
  // S2 의 test stage 는 aggregate(all_fail) 가 아니라 outcome_mismatches 로만 판정.
  it('S2: per-TC 모두 기대 일치 (outcome_mismatches=0) → RED 강제 ❌ / s2 사유 없음', () => {
    // characterization 3 pass + augmentation 2 fail = 정상 S2 산출물 (aggregate 로는 all_fail 도 all_pass 도 아님).
    const r = evaluateGate('test', { tests_total: 5, tests_failed: 2, outcome_mismatches: 0, llm_status: 'skipped' }, 'S2');
    assert.equal(r.reasons.some((x) => x.code === 's2_outcome_mismatch'), false);
    // aggregate all_fail 오탐도 없어야 함 (S2 는 all_fail 매트릭스 아님).
    assert.equal(r.reasons.some((x) => x.detail && x.detail.includes('RED proof missing')), false);
    assert.equal(r.blocked, false);
  });

  it('S2: characterization 이 fail 나거나 augmentation 이 pass (outcome_mismatches>0) → block (s2_outcome_mismatch)', () => {
    const r = evaluateGate('test', { tests_total: 5, tests_failed: 1, outcome_mismatches: 2, llm_status: 'skipped' }, 'S2');
    assert.equal(r.blocked, true);
    assert.ok(r.reasons.some((x) => x.code === 's2_outcome_mismatch'));
  });

  it('S2: all-pass(aggregate) 라도 outcome_mismatches=0 이면 NOT blocked (characterization 만 있는 scope 허용)', () => {
    // characterization 전용 scope (증강분 아직 없음) — 전부 GREEN 이 정상.
    const r = evaluateGate('test', { tests_total: 5, tests_failed: 0, outcome_mismatches: 0, llm_status: 'skipped' }, 'S2');
    assert.equal(r.blocked, false);
  });

  it('★ s2_outcome_mismatch = WARN (corroboration 0) → user go → go-with-warnings 허용 (block 격상 ❌)', () => {
    const gate = evaluateGate('test', { tests_total: 5, tests_failed: 1, outcome_mismatches: 2, llm_status: 'skipped' }, 'S2');
    const decided = applyUserDecision(gate, 'go');
    assert.equal(decided.blocked, false);
    assert.equal(decided.decision, 'go-with-warnings');
  });

  it('S2 implement stage = all_pass GREEN 유지 (augmentation GREEN 전환 + characterization GREEN) — test fail → blocked', () => {
    const r = evaluateGate('implement', { tests_total: 5, tests_failed: 1, llm_status: 'skipped' }, 'S2');
    assert.equal(r.blocked, true);
  });
});

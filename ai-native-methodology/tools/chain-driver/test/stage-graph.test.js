import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadFlow, getStageOrder, nextStage, previousStage,
  getGateForStage, isUpstream, detectCycles, validateStateAgainstFlow,
} from '../src/stage-graph.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO = resolve(__dirname, '..', '..', '..');

describe('stage-graph', () => {
  it('getStageOrder returns 6 stages in canonical order', () => {
    assert.deepEqual(getStageOrder(), ['analysis', 'discovery', 'spec', 'plan', 'test', 'implement']);
  });

  it('nextStage walks forward and returns null at terminal', () => {
    assert.equal(nextStage('analysis'), 'discovery');
    assert.equal(nextStage('spec'), 'plan');
    assert.equal(nextStage('plan'), 'test');
    assert.equal(nextStage('test'), 'implement');
    assert.equal(nextStage('implement'), null);
  });

  it('previousStage walks backward and returns null at start', () => {
    assert.equal(previousStage('discovery'), 'analysis');
    assert.equal(previousStage('test'), 'plan');
    assert.equal(previousStage('analysis'), null);
  });

  it('getGateForStage maps discovery..implement to #1..#4 (plan gate deferred)', () => {
    assert.equal(getGateForStage('discovery'), '#1');
    assert.equal(getGateForStage('spec'), '#2');
    assert.equal(getGateForStage('test'), '#3');
    assert.equal(getGateForStage('implement'), '#4');
    assert.equal(getGateForStage('analysis'), null);
    assert.equal(getGateForStage('plan'), null); // ★ v9.0 plan gate deferred (placeholder)
  });

  it('isUpstream returns true for earlier stages, false otherwise', () => {
    assert.equal(isUpstream('spec', 'implement'), true);
    assert.equal(isUpstream('discovery', 'spec'), true);
    assert.equal(isUpstream('spec', 'plan'), true);
    assert.equal(isUpstream('test', 'spec'), false);
    assert.equal(isUpstream('implement', 'spec'), false);
  });

  it('detectCycles finds none in well-formed flow', () => {
    const flow = { revisit_edges: [
      { from: 'spec', to: 'discovery' },
      { from: 'test', to: 'plan' },
    ]};
    assert.deepEqual(detectCycles(flow), []);
  });

  it('detectCycles detects a cycle', () => {
    const flow = { revisit_edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'a' },
    ]};
    const cycles = detectCycles(flow);
    assert.ok(cycles.length > 0);
  });

  it('validateStateAgainstFlow flags missing stage_progress', () => {
    const state = { current_chain: 'spec', stage_progress: { discovery: {} } };
    const flow = { stages: [
      { id: 'analysis' }, { id: 'discovery' }, { id: 'spec' }, { id: 'plan' }, { id: 'test' }, { id: 'implement' },
    ]};
    const errors = validateStateAgainstFlow(state, flow);
    assert.ok(errors.some((e) => e.includes('analysis')));
    assert.ok(errors.some((e) => e.includes('test')));
  });

  it('loadFlow loads sdlc-4stage-flow.json from repo root', () => {
    const flowPath = join(REPO, 'flows', 'sdlc-4stage-flow.json');
    if (!existsSync(flowPath)) return; // guarded
    const flow = loadFlow(REPO);
    assert.ok(flow.stages?.length >= 6);
    assert.ok(flow.stages.find((s) => s.id === 'discovery'));
  });
});

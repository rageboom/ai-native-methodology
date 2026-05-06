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
  it('getStageOrder returns 5 stages in canonical order', () => {
    assert.deepEqual(getStageOrder(), ['analysis', 'planning', 'spec', 'test', 'implement']);
  });

  it('nextStage walks forward and returns null at terminal', () => {
    assert.equal(nextStage('analysis'), 'planning');
    assert.equal(nextStage('test'), 'implement');
    assert.equal(nextStage('implement'), null);
  });

  it('previousStage walks backward and returns null at start', () => {
    assert.equal(previousStage('planning'), 'analysis');
    assert.equal(previousStage('analysis'), null);
  });

  it('getGateForStage maps planning..implement to #1..#4', () => {
    assert.equal(getGateForStage('planning'), '#1');
    assert.equal(getGateForStage('spec'), '#2');
    assert.equal(getGateForStage('test'), '#3');
    assert.equal(getGateForStage('implement'), '#4');
    assert.equal(getGateForStage('analysis'), null);
  });

  it('isUpstream returns true for earlier stages, false otherwise', () => {
    assert.equal(isUpstream('spec', 'implement'), true);
    assert.equal(isUpstream('planning', 'spec'), true);
    assert.equal(isUpstream('test', 'spec'), false);
    assert.equal(isUpstream('implement', 'spec'), false);
  });

  it('detectCycles finds none in well-formed flow', () => {
    const flow = { revisit_edges: [
      { from: 'spec', to: 'planning' },
      { from: 'test', to: 'spec' },
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
    const state = { current_chain: 'spec', stage_progress: { planning: {} } };
    const flow = { stages: [
      { id: 'analysis' }, { id: 'planning' }, { id: 'spec' }, { id: 'test' }, { id: 'implement' },
    ]};
    const errors = validateStateAgainstFlow(state, flow);
    assert.ok(errors.some((e) => e.includes('analysis')));
    assert.ok(errors.some((e) => e.includes('test')));
  });

  it('loadFlow loads sdlc-4stage-flow.json from repo root', () => {
    const flowPath = join(REPO, 'flows', 'sdlc-4stage-flow.json');
    if (!existsSync(flowPath)) return; // guarded
    const flow = loadFlow(REPO);
    assert.ok(flow.stages?.length >= 5);
    assert.ok(flow.stages.find((s) => s.id === 'planning'));
  });
});

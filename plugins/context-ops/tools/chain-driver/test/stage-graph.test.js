import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	loadFlow,
	getStageOrder,
	nextStage,
	previousStage,
	getGateForStage,
	isUpstream,
	detectCycles,
	validateStateAgainstFlow,
} from '../src/stage-graph.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO = resolve(__dirname, '..', '..', '..');

describe('stage-graph', () => {
	it('getStageOrder returns 6 stages in canonical order', () => {
		assert.deepEqual(getStageOrder(), [
			'analysis',
			'discovery',
			'spec',
			'plan',
			'test',
			'implement',
		]);
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

	it('v10.0.0 MAJOR: getGateForStage maps analysis..implement to #0..#5 (chain 번호 = gate 번호 1:1 / Phase 4-4 prime / analysis=#0 DEC-2026-06-06-analysis-exit-gate)', () => {
		assert.equal(getGateForStage('analysis'), '#0');
		assert.equal(getGateForStage('discovery'), '#1');
		assert.equal(getGateForStage('spec'), '#2');
		assert.equal(getGateForStage('plan'), '#3');
		assert.equal(getGateForStage('test'), '#4');
		assert.equal(getGateForStage('implement'), '#5');
	});

	// v10.0.0 MAJOR — plan gate 본격 번호 부여 (v9.3.0 '#plan' string placeholder 폐기)
	it('v10.0.0 MAJOR: plan gate = "#3" (numeric / chain 3 1:1 매핑 / INTERNAL CONVENTION)', () => {
		const planGate = getGateForStage('plan');
		assert.equal(planGate, '#3');
		assert.ok(planGate !== null, 'plan gate must not be null');
		assert.match(
			planGate,
			/^#[0-9]+$/,
			'plan gate must be numeric (#3) / string placeholder 폐기',
		);
	});

	it('isUpstream returns true for earlier stages, false otherwise', () => {
		assert.equal(isUpstream('spec', 'implement'), true);
		assert.equal(isUpstream('discovery', 'spec'), true);
		assert.equal(isUpstream('spec', 'plan'), true);
		assert.equal(isUpstream('test', 'spec'), false);
		assert.equal(isUpstream('implement', 'spec'), false);
	});

	it('detectCycles finds none in well-formed flow', () => {
		const flow = {
			revisit_edges: [
				{ from: 'spec', to: 'discovery' },
				{ from: 'test', to: 'plan' },
			],
		};
		assert.deepEqual(detectCycles(flow), []);
	});

	it('detectCycles detects a cycle', () => {
		const flow = {
			revisit_edges: [
				{ from: 'a', to: 'b' },
				{ from: 'b', to: 'a' },
			],
		};
		const cycles = detectCycles(flow);
		assert.ok(cycles.length > 0);
	});

	it('validateStateAgainstFlow flags missing stage_progress', () => {
		const state = { current_chain: 'spec', stage_progress: { discovery: {} } };
		const flow = {
			stages: [
				{ id: 'analysis' },
				{ id: 'discovery' },
				{ id: 'spec' },
				{ id: 'plan' },
				{ id: 'test' },
				{ id: 'implement' },
			],
		};
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

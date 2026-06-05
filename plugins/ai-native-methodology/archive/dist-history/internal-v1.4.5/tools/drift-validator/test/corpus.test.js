// Corpus self-test — Sprint 5+ carry-over Phase A 종결 후 19쌍 / 21 test.
// 진척: Sprint 4 4쌍 → A 보강 (DEC-A) +10쌍 = 14쌍 → Sprint 5+ Phase A +6쌍 = 19쌍 (state-machine 8 + sequence 8 + state-map-fe 3).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
	detectDiagramType,
	normalizeStateMachine,
	normalizeSequence,
} from '../src/normalize-mermaid.js';
import {
	detectArtifactType,
	normalizeStateMachineJson,
	normalizeSequenceJson,
} from '../src/normalize-json.js';
import {
	compareStateMachine,
	compareSequence,
	summarize,
} from '../src/compare.js';
import {
	normalizePhaseFlow,
	normalizePhaseFlowJson,
} from '../src/normalize-phase-flow.js';
import { comparePhaseFlow } from '../src/compare-phase-flow.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corpus = (name) => ({
	json: JSON.parse(
		readFileSync(join(__dirname, '..', 'corpus', name + '.json'), 'utf-8'),
	),
	mermaid: readFileSync(
		join(__dirname, '..', 'corpus', name + '.mermaid'),
		'utf-8',
	),
});

function runStateMachine(name) {
	const c = corpus(name);
	const jsonNorm = normalizeStateMachineJson(c.json);
	const mermaidNorm = normalizeStateMachine(c.mermaid);
	return summarize(compareStateMachine({ jsonNorm, mermaidNorm }));
}
function runSequence(name) {
	const c = corpus(name);
	const jsonNorm = normalizeSequenceJson(c.json);
	const mermaidNorm = normalizeSequence(c.mermaid);
	return summarize(compareSequence({ jsonNorm, mermaidNorm }));
}
function runPhaseFlow(name) {
	const c = corpus(name);
	const jsonNorm = normalizePhaseFlowJson(c.json);
	const mermaidNorm = normalizePhaseFlow(c.mermaid);
	return summarize(comparePhaseFlow({ jsonNorm, mermaidNorm }));
}

test('detectDiagramType picks stateDiagram', () => {
	assert.equal(
		detectDiagramType('stateDiagram-v2\n[*] --> a'),
		'state-machine',
	);
	assert.equal(detectDiagramType('sequenceDiagram\nA->>B: x'), 'sequence');
});

test('detectArtifactType picks state-machine vs sequence', () => {
	assert.equal(detectArtifactType({ states: {} }), 'state-machine');
	assert.equal(detectArtifactType({ actors: [], messages: [] }), 'sequence');
});

test('state-machine equiv → 0 breaking', () => {
	const s = runStateMachine('state-machine-equiv-01');
	assert.equal(s.breaking, 0, `expected breaking=0, got ${JSON.stringify(s)}`);
});

test('state-machine drift → ≥1 breaking', () => {
	const s = runStateMachine('state-machine-drift-01');
	assert.ok(s.breaking >= 1, `expected breaking≥1, got ${JSON.stringify(s)}`);
});

test('sequence equiv → 0 breaking', () => {
	const s = runSequence('sequence-equiv-01');
	assert.equal(s.breaking, 0, `expected breaking=0, got ${JSON.stringify(s)}`);
});

test('sequence drift → ≥1 breaking', () => {
	const s = runSequence('sequence-drift-01');
	assert.ok(s.breaking >= 1, `expected breaking≥1, got ${JSON.stringify(s)}`);
});

// A-2 corpus 확장 (compound state 매칭 + 변종 화살표)

test(' state-machine compound equiv → 0 breaking ( A-1 transitionFuzzyMatch 검증)', () => {
	const s = runStateMachine('state-machine-equiv-02-compound');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (compound 매칭), got ${JSON.stringify(s)}`,
	);
});

test(' state-machine self-loop on compound → 0 breaking ( A-1 case 5 검증)', () => {
	const s = runStateMachine('state-machine-equiv-03-self-loop');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (self-loop), got ${JSON.stringify(s)}`,
	);
});

test(' state-machine drift missing-state → ≥1 breaking', () => {
	const s = runStateMachine('state-machine-drift-02-missing-state');
	assert.ok(s.breaking >= 1, `expected breaking≥1, got ${JSON.stringify(s)}`);
});

test(' state-machine drift missing-compound → ≥1 breaking', () => {
	const s = runStateMachine('state-machine-drift-03-missing-compound');
	assert.ok(s.breaking >= 1, `expected breaking≥1, got ${JSON.stringify(s)}`);
});

test(' sequence -x fail-arrow → 0 breaking ( A-3 F-155 검증)', () => {
	const s = runSequence('sequence-equiv-02-fail-arrow');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (-x 화살표 인식), got ${JSON.stringify(s)}`,
	);
});

test(' sequence -)/--)  async-arrow → 0 breaking ( A-3 F-155 검증)', () => {
	const s = runSequence('sequence-equiv-03-async');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (async 화살표 인식), got ${JSON.stringify(s)}`,
	);
});

test(' sequence drift missing-actor → ≥1 breaking', () => {
	const s = runSequence('sequence-drift-02-missing-actor');
	assert.ok(s.breaking >= 1, `expected breaking≥1, got ${JSON.stringify(s)}`);
});

test(' sequence drift label-mismatch → ≥1 non-breaking', () => {
	const s = runSequence('sequence-drift-03-label-mismatch');
	assert.ok(
		s['non-breaking'] >= 1 || s.breaking >= 1,
		`expected drift detected, got ${JSON.stringify(s)}`,
	);
});

// v1.4 Stage 3-1 Phase E1 시범 — FE state-map corpus (deliverable 8)
// drift-validator FE 적용 첫 시범. state-map.schema.json machine.states 가 XState 호환이므로
// 기존 normalize-json/normalize-mermaid 로직 그대로 적용 가능.

test(' FE state-map equiv → 0 breaking ( v1.4 Stage 3-1 Phase E1 시범)', () => {
	const s = runStateMachine('state-map-fe-equiv-01');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (FE state-map), got ${JSON.stringify(s)}`,
	);
});

// Sprint 5+ carry-over Phase A — corpus 14 → 19쌍 (+6 신규)

test(' state-machine multi-trigger equiv → 0 breaking (Sprint 5+ A1)', () => {
	const s = runStateMachine('state-machine-equiv-04-multi-trigger');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (multi-trigger), got ${JSON.stringify(s)}`,
	);
});

test(' state-machine drift extra-event → ≥1 breaking (Sprint 5+ A1)', () => {
	const s = runStateMachine('state-machine-drift-04-extra-event');
	assert.ok(
		s.breaking >= 1,
		`expected breaking≥1 (mermaid 에 missing transition), got ${JSON.stringify(s)}`,
	);
});

test(' sequence multi-actor equiv → 0 breaking (Sprint 5+ A1 / 4 actor 양방향)', () => {
	const s = runSequence('sequence-equiv-04-multi-actor');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (multi-actor), got ${JSON.stringify(s)}`,
	);
});

test(' sequence drift extra-message → ≥1 breaking (Sprint 5+ A1)', () => {
	const s = runSequence('sequence-drift-04-extra-message');
	assert.ok(
		s.breaking >= 1,
		`expected breaking≥1 (mermaid 에 missing message), got ${JSON.stringify(s)}`,
	);
});

test(' FE state-map form equiv → 0 breaking (Sprint 5+ A1 / form_state 5진실 #4)', () => {
	const s = runStateMachine('state-map-fe-equiv-02-form');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (form_state), got ${JSON.stringify(s)}`,
	);
});

test(' FE state-map drift missing-error → ≥1 breaking (Sprint 5+ A1)', () => {
	const s = runStateMachine('state-map-fe-drift-01-missing-error');
	assert.ok(
		s.breaking >= 1,
		`expected breaking≥1 (FE state drift — timedOut 누락), got ${JSON.stringify(s)}`,
	);
});

// Sprint 5+ Phase B — phase-flow 비교기 (methodology-spec/workflow/phase-flow.{json,mermaid} 짝)

test(' detectArtifactType picks phase-flow', () => {
	assert.equal(
		detectArtifactType({ phases: [{ id: '0', depends_on: [] }] }),
		'phase-flow',
	);
});

test(' detectDiagramType picks phase-flow (flowchart + subgraph P*)', () => {
	const txt =
		'flowchart TB\n  subgraph P0[Phase 0]\n  end\n  subgraph P1[Phase 1]\n  end\n  P0 --> P1';
	assert.equal(detectDiagramType(txt), 'phase-flow');
});

test(' phase-flow equiv → 0 breaking (Sprint 5+ B / 3 phase + 2 deps)', () => {
	const s = runPhaseFlow('phase-flow-equiv-01');
	assert.equal(
		s.breaking,
		0,
		`expected breaking=0 (phase-flow), got ${JSON.stringify(s)}`,
	);
});

test(' phase-flow drift missing-dep → ≥1 breaking (Sprint 5+ B)', () => {
	const s = runPhaseFlow('phase-flow-drift-01-missing-dep');
	assert.ok(
		s.breaking >= 1,
		`expected breaking≥1 (P0→P2 dep 누락), got ${JSON.stringify(s)}`,
	);
});

// Corpus self-test — 의미 동일 2쌍 + 의미 다름 2쌍 = 4쌍 (Sprint 4 1차 / 풀 20쌍 Sprint 5 carry-over).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { detectDiagramType, normalizeStateMachine, normalizeSequence } from '../src/normalize-mermaid.js';
import { detectArtifactType, normalizeStateMachineJson, normalizeSequenceJson } from '../src/normalize-json.js';
import { compareStateMachine, compareSequence, summarize } from '../src/compare.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corpus = (name) => ({
  json: JSON.parse(readFileSync(join(__dirname, '..', 'corpus', name + '.json'), 'utf-8')),
  mermaid: readFileSync(join(__dirname, '..', 'corpus', name + '.mermaid'), 'utf-8'),
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

test('detectDiagramType picks stateDiagram', () => {
  assert.equal(detectDiagramType('stateDiagram-v2\n[*] --> a'), 'state-machine');
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

// handoff-consistency.test.js — JSON-only artifact handoff / rename-drift detector 회귀 고정.
// ★ v12.0.0 (ADR-011) — 구 compare-phase-flow-artifacts.test.js (json↔mermaid 발산) 대체.
//   stage outputs → producer union, downstream inputs 검증 + registry anchor(both-sides-wrong rename).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { checkHandoffConsistency } from '../src/check-handoff-consistency.js';

const has = (diffs, kind, artifact) =>
  diffs.some((d) => d.kind === kind && (artifact === undefined || d.artifact === artifact));

// 1. rename drift — 양측 동일 typo('behaviour-spec.json'). Arm A 는 놓침(spec 가 생산) → Arm B(registry) 가 검출.
test('rename drift (both-sides typo) → output+input-unknown-artifact breaking, NOT input-no-producer', () => {
  const model = {
    flows: [
      { stage: 'spec', inputs: [], outputs: ['behaviour-spec.json'] },        // typo
      { stage: 'plan', inputs: ['behaviour-spec.json'], outputs: [] },         // 동일 typo
    ],
    registry: { artifacts: [{ name: 'behavior-spec.json', produced_by: 'spec' }] },  // 정상명만 등재
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, false);
  assert.ok(has(diffs, 'handoff.output-unknown-artifact', 'behaviour-spec.json'), 'spec output typo breaking');
  assert.ok(has(diffs, 'handoff.input-unknown-artifact', 'behaviour-spec.json'), 'plan input typo breaking');
  // ★ Arm A 단독이면 놓침 입증 — spec 가 생산하므로 producer union 에 있음 → input-no-producer 아님.
  assert.ok(!has(diffs, 'handoff.input-no-producer', 'behaviour-spec.json'), 'producer 존재 → no input-no-producer');
});

// 2. matched — 정상 handoff → 0 breaking.
test('matched (spec→plan behavior-spec.json) → ok true / 0 breaking', () => {
  const model = {
    flows: [
      { stage: 'spec', inputs: [], outputs: ['behavior-spec.json'] },
      { stage: 'plan', inputs: ['behavior-spec.json'], outputs: [] },
    ],
    registry: { artifacts: [{ name: 'behavior-spec.json', produced_by: 'spec' }] },
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, true);
  assert.equal(diffs.filter((d) => d.severity === 'breaking').length, 0);
});

// 3. meta suppression — finding-system.findings.json(input) + chain-intervention-log.jsonl(output) → 0 diff.
test('meta suppression (finding-system input + chain-intervention-log output) → 0 diff', () => {
  const model = {
    flows: [
      { stage: 'discovery', inputs: ['finding-system.findings.json'], outputs: ['chain-intervention-log.jsonl'] },
    ],
    registry: { artifacts: [] },
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, true);
  assert.equal(diffs.length, 0, '메타 토큰은 input+output 양쪽 suppress → 어떤 diff 도 없음');
});

// 4. baseline — analysis 산출물(architecture/schema)은 ANALYSIS_BASELINE seed 로 producer 보장 (upstream stage 없이도).
test('baseline seed (implement inputs architecture.json/schema.json) → no input-no-producer', () => {
  const model = {
    flows: [
      { stage: 'implement', inputs: ['architecture.json', 'schema.json'], outputs: [] },
    ],
    registry: { artifacts: [
      { name: 'architecture.json', produced_by: 'analysis' },
      { name: 'schema.json', produced_by: 'analysis' },
    ] },
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, true);
  assert.ok(!has(diffs, 'handoff.input-no-producer'), 'ANALYSIS_BASELINE seed 가 producer 보장');
});

// 5. .md/.mermaid 입력 토큰은 DELIVERABLE_EXT_RE 로 무시 → C3-before-C4 안전.
test('.md/.mermaid input tokens ignored (C3-before-C4 safety) → 0 breaking', () => {
  const model = {
    flows: [
      { stage: 'plan', inputs: ['behavior-spec.md', 'erd.mermaid', 'behavior-diagrams.mermaid'], outputs: [] },
    ],
    registry: { artifacts: [] },
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, true);
  assert.equal(diffs.filter((d) => d.severity === 'breaking').length, 0, '.md/.mermaid 토큰 무시');
});

// 6. terminal — impl-spec.json/matrix.json 은 비-literal flow 토큰 → produced_by 보강으로 등록 + no-consumer info.
test('terminal artifacts (produced_by bridge) → output-no-consumer info, NOT input-no-producer/unknown', () => {
  const model = {
    flows: [
      // flow 토큰은 비-literal (brace-expansion / 배열 표기) → extract 시 [] → produced_by 가 유일 등록 경로.
      { stage: 'implement', inputs: [], outputs: ['traceability-matrix.{json,md,mermaid}', 'impl-spec.impl_modules[]'] },
    ],
    registry: { artifacts: [
      { name: 'impl-spec.json', produced_by: 'implement' },
      { name: 'matrix.json', produced_by: 'implement' },
    ] },
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, true);
  assert.ok(has(diffs, 'handoff.output-no-consumer', 'impl-spec.json'), 'impl-spec.json terminal info');
  assert.ok(has(diffs, 'handoff.output-no-consumer', 'matrix.json'), 'matrix.json terminal info');
  assert.ok(!has(diffs, 'handoff.output-unknown-artifact'), 'produced_by bridge → registry 등재 → unknown 아님');
});

// 7. negative control — registry/producer 어디에도 없는 orphan → breaking (vacuous green 아님).
test('negative control (orphan ghost-artifact.json) → input-no-producer + input-unknown-artifact breaking', () => {
  const model = {
    flows: [
      { stage: 'spec', inputs: ['ghost-artifact.json'], outputs: [] },
    ],
    registry: { artifacts: [{ name: 'behavior-spec.json', produced_by: 'spec' }] },
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, false);
  assert.ok(has(diffs, 'handoff.input-no-producer', 'ghost-artifact.json'));
  assert.ok(has(diffs, 'handoff.input-unknown-artifact', 'ghost-artifact.json'));
});

// 8. producer-side — registry 부재 output 은 output-unknown-artifact breaking (no-consumer info 로 강등 ❌).
test('producer-side (plan outputs task-plan-v2.json not in registry) → output-unknown-artifact breaking', () => {
  const model = {
    flows: [
      { stage: 'plan', inputs: [], outputs: ['task-plan-v2.json'] },
    ],
    registry: { artifacts: [{ name: 'task-plan.json', produced_by: 'plan' }] },  // v2 미등재
  };
  const { ok, diffs } = checkHandoffConsistency(model);
  assert.equal(ok, false);
  assert.ok(has(diffs, 'handoff.output-unknown-artifact', 'task-plan-v2.json'), 'unknown output = breaking');
  // no-consumer info 도 동반되지만 breaking 으로 강등 ❌ 입증 = ok=false.
  assert.ok(diffs.some((d) => d.kind === 'handoff.output-unknown-artifact' && d.severity === 'breaking'));
});

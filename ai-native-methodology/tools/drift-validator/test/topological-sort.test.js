// topological-sort.test.js — depends_on 그래프 위상정렬 + 순환 검출 + lexicographic tiebreak 검증.
// v3.0.0 신설 (plan-phase-id-semantic-rename.md / D-3 paradigm 정합).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { topologicalSort, checkDependencyGraph } from '../src/topological-sort.js';

test('★ v3.0 topological — DAG 정상 정렬 (현 analysis manifest 의존 그래프)', () => {
  const phases = [
    { id: 'input', depends_on: [] },
    { id: 'discovery', depends_on: ['input'] },
    { id: 'db-schema', depends_on: ['discovery'] },
    { id: 'architecture', depends_on: ['discovery', 'db-schema'] },
    { id: 'business-logic', depends_on: ['discovery', 'db-schema', 'architecture'] },
    { id: 'formal-spec', depends_on: ['business-logic'] },
    { id: 'characterization', depends_on: ['business-logic', 'formal-spec'] },
    { id: 'sql-inventory', depends_on: ['discovery', 'business-logic', 'characterization'] },
    { id: 'api', depends_on: ['business-logic', 'formal-spec', 'characterization', 'sql-inventory'] },
    { id: 'ui', depends_on: ['architecture', 'business-logic', 'characterization'] },
    { id: 'quality', depends_on: ['business-logic', 'formal-spec', 'api', 'ui'] },
  ];

  const { order, cycles, unknown_deps } = topologicalSort(phases);

  assert.equal(cycles.length, 0, 'DAG 의무 — 순환 ❌');
  assert.equal(unknown_deps.length, 0, '모든 depends_on이 실제 phase 참조');
  assert.equal(order.length, phases.length, '모든 phase가 순서에 포함');
  assert.equal(order[0], 'input', '시작점 = input');
  assert.equal(order[order.length - 1], 'quality', '종착점 = quality');

  // 의존성 본질 검증 — 모든 depends_on이 order 안에서 자기보다 앞에 위치
  const positions = new Map(order.map((id, i) => [id, i]));
  for (const phase of phases) {
    for (const dep of phase.depends_on) {
      assert.ok(positions.get(dep) < positions.get(phase.id),
        `'${dep}' must precede '${phase.id}' (got: ${positions.get(dep)} vs ${positions.get(phase.id)})`);
    }
  }
});

test('★ v3.0 topological — lexicographic tiebreak (api/ui 동일 레벨 결정론)', () => {
  // api와 ui는 같은 시점에 가능한 병렬 phase. lexicographic 순서로 api → ui
  const phases = [
    { id: 'ui', depends_on: ['business-logic'] },
    { id: 'api', depends_on: ['business-logic'] },
    { id: 'business-logic', depends_on: [] },
  ];

  const { order } = topologicalSort(phases);
  assert.deepEqual(order, ['business-logic', 'api', 'ui'],
    'lexicographic tiebreak — 같은 레벨에서 알파벳 순 (api < ui)');

  // 결정론 — 입력 순서 바꿔도 같은 결과
  const phases2 = [
    { id: 'api', depends_on: ['business-logic'] },
    { id: 'ui', depends_on: ['business-logic'] },
    { id: 'business-logic', depends_on: [] },
  ];
  const { order: order2 } = topologicalSort(phases2);
  assert.deepEqual(order2, order, '입력 순서 무관 — 결정론');
});

test('★ v3.0 topological — 순환 검출 (DAG 위반)', () => {
  const phases = [
    { id: 'a', depends_on: ['c'] },
    { id: 'b', depends_on: ['a'] },
    { id: 'c', depends_on: ['b'] },  // ← cycle: a → b → c → a
  ];

  const { order, cycles } = topologicalSort(phases);
  assert.ok(cycles.length > 0, '순환 검출 의무');
  assert.equal(order.length, 0, '순환 시 위상정렬 결과 부재 (모든 indegree > 0)');
  assert.ok(cycles[0].includes('a'), 'cycle 안에 a 포함');
  assert.ok(cycles[0].includes('b'), 'cycle 안에 b 포함');
  assert.ok(cycles[0].includes('c'), 'cycle 안에 c 포함');
});

test('★ v3.0 topological — unknown_deps 검출 (manifest 부재 phase 참조)', () => {
  const phases = [
    { id: 'a', depends_on: [] },
    { id: 'b', depends_on: ['a', 'ghost'] },  // ← 'ghost' phase 부재
  ];

  const { unknown_deps } = topologicalSort(phases);
  assert.equal(unknown_deps.length, 1, '1 unknown_deps');
  assert.equal(unknown_deps[0].phase, 'b');
  assert.equal(unknown_deps[0].dep, 'ghost');
});

test('★ v3.0 checkDependencyGraph — diff 형식 정합 (순환 + unknown_deps)', () => {
  const phases = [
    { id: 'a', depends_on: ['b'] },
    { id: 'b', depends_on: ['a', 'ghost'] },
  ];

  const diffs = checkDependencyGraph(phases);
  assert.ok(diffs.length >= 2, '≥ 2 diffs (cycle + unknown_dep)');
  assert.ok(diffs.every((d) => d.severity === 'breaking'), '모두 breaking');

  const unknownDiff = diffs.find((d) => d.kind === 'depends-on.unknown-phase');
  assert.ok(unknownDiff, 'unknown-phase diff 발행');
  assert.equal(unknownDiff.dep, 'ghost');

  const cycleDiff = diffs.find((d) => d.kind === 'depends-on.cycle-detected');
  assert.ok(cycleDiff, 'cycle-detected diff 발행');
  assert.ok(Array.isArray(cycleDiff.cycle), 'cycle 배열');
});

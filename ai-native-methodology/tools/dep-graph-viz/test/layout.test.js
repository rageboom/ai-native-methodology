import { test } from 'node:test';
import assert from 'node:assert/strict';
import { columnOf, laneOf, computeLayout, COLUMN_LABELS } from '../src/layout.js';

test('chain subkind → stage column 순서', () => {
	assert.equal(columnOf({ artifact_kind: 'chain', artifact_subkind: 'UC' }), 0);
	assert.equal(columnOf({ artifact_kind: 'chain', artifact_subkind: 'BHV' }), 1);
	assert.equal(columnOf({ artifact_kind: 'chain', artifact_subkind: 'AC' }), 2);
	assert.equal(columnOf({ artifact_kind: 'chain', artifact_subkind: 'TASK' }), 3);
	assert.equal(columnOf({ artifact_kind: 'chain', artifact_subkind: 'TC' }), 4);
	assert.equal(columnOf({ artifact_kind: 'chain', artifact_subkind: 'IMPL' }), 5);
});

test('code/contract leaf → column 6, symbol → column 7', () => {
	assert.equal(columnOf({ artifact_kind: 'code', artifact_subkind: 'code' }), 6);
	assert.equal(columnOf({ artifact_kind: 'contract', artifact_subkind: 'contract' }), 6);
	assert.equal(columnOf({ artifact_kind: 'symbol', artifact_subkind: 'method' }), 7);
	assert.equal(COLUMN_LABELS.length, 8);
});

test('lane 분리 — plan/main/analysis/aspect', () => {
	assert.equal(laneOf({ artifact_kind: 'chain', artifact_subkind: 'UC' }), 'main');
	assert.equal(laneOf({ artifact_kind: 'code' }), 'main');
	assert.equal(laneOf({ artifact_kind: 'plan', artifact_subkind: 'EPIC' }), 'plan');
	assert.equal(laneOf({ artifact_kind: 'analysis' }), 'analysis');
	assert.equal(laneOf({ artifact_kind: 'aspect' }), 'aspect');
});

test('computeLayout — 같은 lane+column 내 결정론 row 부여 (id 정렬)', () => {
	const nodes = [
		{ id: 'UC-B-001', artifact_kind: 'chain', artifact_subkind: 'UC' },
		{ id: 'UC-A-001', artifact_kind: 'chain', artifact_subkind: 'UC' },
		{ id: 'BHV-A-001', artifact_kind: 'chain', artifact_subkind: 'BHV' },
	];
	const m = computeLayout(nodes);
	// UC-A 가 id 정렬상 먼저 → row 0, UC-B → row 1
	assert.deepEqual(m.get('UC-A-001'), { column: 0, lane: 'main', row: 0 });
	assert.deepEqual(m.get('UC-B-001'), { column: 0, lane: 'main', row: 1 });
	assert.deepEqual(m.get('BHV-A-001'), { column: 1, lane: 'main', row: 0 });
});

test('빈 입력 안전', () => {
	assert.equal(computeLayout(undefined).size, 0);
	assert.equal(computeLayout([]).size, 0);
});

// difficulty.test.js — S1 난이도 scorer (reference-lens / 결정론 정량 / degrade-aware).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	bucketFor,
	scoreUseCases,
	difficultyReviewItems,
	DIFFICULTY_THRESHOLDS,
} from '../src/difficulty.js';

// === bucketFor (정량 규칙 / verdict 아님) ===
test('bucketFor — S/M/L 경계', () => {
	assert.equal(bucketFor(0), 'S');
	assert.equal(bucketFor(DIFFICULTY_THRESHOLDS.S_MAX), 'S'); // 3
	assert.equal(bucketFor(DIFFICULTY_THRESHOLDS.S_MAX + 1), 'M'); // 4
	assert.equal(bucketFor(DIFFICULTY_THRESHOLDS.M_MAX), 'M'); // 9
	assert.equal(bucketFor(DIFFICULTY_THRESHOLDS.M_MAX + 1), 'L'); // 10
});

test('bucketFor — MUST 밀집 가중(정량)', () => {
	assert.equal(bucketFor(2, 4), 'S'); // must<5 가중 없음 → 2 = S
	assert.equal(bucketFor(2, 5), 'M'); // 2+5=7 → M
	assert.equal(bucketFor(5, 5), 'L'); // 5+5=10 → L
});

// === fixture: backward derived_from 체인 (모두 hard/MUST) ===
function node(id) {
	return { id, state: 'active' };
}
function edge(source, target, edge_type) {
	return { source, target, edge_type, confidence: 'hard' };
}

// UC-BIG: 3 BHV → 6 AC → 6 TC = 15 MUST 영향 노드 (L)
// UC-SMALL: 1 BHV → 1 AC = 2 MUST 영향 노드 (S)
function buildGraph() {
	const nodes = [node('UC-BIG-001'), node('UC-SMALL-001')];
	const edges = [];
	// BIG
	for (let b = 1; b <= 3; b++) {
		const bhv = `BHV-BIG-00${b}`;
		nodes.push(node(bhv));
		edges.push(edge(bhv, 'UC-BIG-001', 'derived_from')); // BHV derived_from UC (backward from UC)
		for (let a = 1; a <= 2; a++) {
			const ac = `AC-BIG-${b}${a}`;
			const tc = `TC-BIG-${b}${a}`;
			nodes.push(node(ac), node(tc));
			edges.push(edge(ac, bhv, 'derived_from'));
			edges.push(edge(tc, ac, 'tests'));
		}
	}
	// SMALL
	nodes.push(node('BHV-SMALL-001'), node('AC-SMALL-001'));
	edges.push(edge('BHV-SMALL-001', 'UC-SMALL-001', 'derived_from'));
	edges.push(edge('AC-SMALL-001', 'BHV-SMALL-001', 'derived_from'));
	return { nodes, edges };
}

const SPEC = {
	use_cases: [
		{ id: 'UC-BIG-001' },
		{ id: 'UC-SMALL-001' },
		{ id: 'UC-GHOST-001' }, // 그래프에 없음 → per-UC degrade
	],
};

test('scoreUseCases — 정상 그래프: L/S 버킷 + degrade UC', () => {
	const scored = scoreUseCases(SPEC, buildGraph());
	assert.equal(scored.degraded, false);

	const big = scored.use_cases['UC-BIG-001'];
	assert.equal(big.degraded, false);
	assert.equal(big.bucket, 'L');
	assert.equal(big.impact_count, 15);
	assert.equal(big.must_count, 15);

	const small = scored.use_cases['UC-SMALL-001'];
	assert.equal(small.degraded, false);
	assert.equal(small.bucket, 'S');
	assert.equal(small.impact_count, 2);

	const ghost = scored.use_cases['UC-GHOST-001'];
	assert.equal(ghost.degraded, true); // 미합성 UC
	assert.equal(ghost.bucket, null);
});

test('scoreUseCases — 그래프 부재(greenfield) = 전역 degraded', () => {
	const scored = scoreUseCases(SPEC, null);
	assert.equal(scored.degraded, true);
	assert.match(scored.reason, /artifact-graph 부재/);
	assert.deepEqual(scored.use_cases, {});
});

test('scoreUseCases — 빈 노드 그래프도 degraded', () => {
	const scored = scoreUseCases(SPEC, { nodes: [], edges: [] });
	assert.equal(scored.degraded, true);
});

// === difficultyReviewItems — L 만 review[] 검토권장 (비차단) ===
test('difficultyReviewItems — L 만 노출, 결정성 정렬', () => {
	const scored = scoreUseCases(SPEC, buildGraph());
	const items = difficultyReviewItems(scored);
	assert.equal(items.length, 1);
	assert.equal(items[0].id, 'UC-BIG-001');
	assert.equal(items[0].kind, 'difficulty');
	assert.match(items[0].text, /난이도 L/);
});

test('difficultyReviewItems — degraded 면 빈 배열', () => {
	assert.deepEqual(difficultyReviewItems({ degraded: true, use_cases: {} }), []);
	assert.deepEqual(difficultyReviewItems(null), []);
});

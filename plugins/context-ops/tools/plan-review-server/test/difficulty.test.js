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

test('bucketFor — MUST_DENSE_BONUS 제거: impact 단독 결정 (보너스 인자 무시)', () => {
	// ep-be-gea 35 BC corroboration — 보너스(+5)가 full-chain 그래프에서 355/356(100%) 발동 =
	//   상수가 되어 전부 L 포화(변별 상실). 제거 후 impact 단독으로 버킷 결정.
	assert.equal(bucketFor(2), 'S');
	assert.equal(bucketFor(7), 'M'); // 구 로직(must≥5)이면 7+5=12=L 였음 → 이제 M
	assert.equal(bucketFor(9), 'M'); // 경계
	assert.equal(bucketFor(10), 'L');
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

// === difficultyReviewItems — scope-상대 outlier(상위 분위수) ∩ L 만 review[] 검토권장 (비차단) ===
test('difficultyReviewItems — outlier ∩ L 노출, 결정성 정렬', () => {
	const scored = scoreUseCases(SPEC, buildGraph());
	const items = difficultyReviewItems(scored);
	assert.equal(items.length, 1);
	assert.equal(items[0].id, 'UC-BIG-001'); // 최상위 impact + L
	assert.equal(items[0].kind, 'difficulty');
	assert.match(items[0].text, /영향 규모 상위/);
});

test('difficultyReviewItems — scope-상대 outlier: L 여러 개 중 상위 분위수만 (noise 해소)', () => {
	// ep-be-gea 35 BC corroboration — 구 로직은 L 전부(355개) 도배 → scope 내 impact 상위 OUTLIER_TOP_RATIO(20%) 만.
	const mk = (impact) => ({ degraded: false, bucket: 'L', impact_count: impact, must_count: 0, should_count: 0, fyi_count: 0 });
	const scored = {
		degraded: false,
		use_cases: { 'UC-1': mk(20), 'UC-2': mk(15), 'UC-3': mk(13), 'UC-4': mk(12), 'UC-5': mk(11) },
	};
	// n=5, topN=ceil(5*0.2)=1 → impact 최상위(UC-1)만 / 나머지 4개는 L 이어도 제외
	const items = difficultyReviewItems(scored);
	assert.equal(items.length, 1);
	assert.equal(items[0].id, 'UC-1');
});

test('difficultyReviewItems — degraded 면 빈 배열', () => {
	assert.deepEqual(difficultyReviewItems({ degraded: true, use_cases: {} }), []);
	assert.deepEqual(difficultyReviewItems(null), []);
});

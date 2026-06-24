// dep-consult.test.js — S4 UC 의존성 reference-lens (하이브리드 shared_ref + graph_impact / degrade).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeUcDependencies } from '../src/dep-consult.js';

const SPEC = {
	use_cases: [
		{ id: 'UC-A-001', br_refs: ['BR-X-001'], source_grounded_evidence: ['domain.json#User'] },
		{ id: 'UC-B-001', br_refs: ['BR-X-001'] }, // A 와 BR-X-001 공유 → shared_ref SHOULD
		{ id: 'UC-C-001', source_grounded_evidence: ['domain.json#User'] }, // A 와 src 공유 → FYI
	],
};

function graphWithUcs() {
	return {
		nodes: [
			{ id: 'UC-A-001', state: 'active' },
			{ id: 'UC-B-001', state: 'active' },
		],
		edges: [{ source: 'UC-A-001', target: 'UC-B-001', edge_type: 'depends_on', confidence: 'hard' }],
	};
}

test('shared_ref — br 공유=SHOULD / src 공유=FYI / 무관 pair 없음', () => {
	const r = computeUcDependencies(SPEC, null);
	assert.equal(r.graph_impact_degraded, true);
	assert.match(r.reason, /artifact-graph 부재/);
	assert.equal(r.counts.graph_impact, 0);

	const sr = r.uc_dependencies.filter((d) => d.signal === 'shared_ref');
	assert.equal(sr.length, 2); // A-B, A-C (B-C 무관)
	const ab = sr.find((d) => d.from_uc === 'UC-A-001' && d.to_uc === 'UC-B-001');
	assert.equal(ab.grade, 'SHOULD');
	assert.equal(ab.direction, 'both');
	assert.deepEqual(ab.shared, ['br:BR-X-001']);
	const ac = sr.find((d) => d.to_uc === 'UC-C-001');
	assert.equal(ac.grade, 'FYI');
});

test('graph_impact — artifact-graph + UC 노드 있으면 보강', () => {
	const r = computeUcDependencies(SPEC, graphWithUcs());
	assert.equal(r.graph_impact_degraded, false);
	assert.equal(r.reason, null);
	const gi = r.uc_dependencies.filter((d) => d.signal === 'graph_impact');
	assert.ok(gi.length >= 1, 'graph_impact dep 존재');
	// A--depends_on-->B (hard/MUST): A→B forward MUST
	const ab = gi.find((d) => d.from_uc === 'UC-A-001' && d.to_uc === 'UC-B-001');
	assert.ok(ab, 'A→B graph_impact');
	assert.equal(ab.grade, 'MUST');
	assert.equal(ab.edge_type, 'depends_on');
	// shared_ref 는 그대로 공존
	assert.equal(r.counts.shared_ref, 2);
});

test('graph 있지만 UC 미합성 = graph_impact degraded (정직)', () => {
	const graph = { nodes: [{ id: 'analysis-domain', state: 'active' }], edges: [] };
	const r = computeUcDependencies(SPEC, graph);
	assert.equal(r.graph_impact_degraded, true);
	assert.match(r.reason, /UC 노드 미합성/);
	assert.equal(r.counts.graph_impact, 0);
	assert.equal(r.counts.shared_ref, 2); // shared_ref 는 여전히 동작
});

test('빈 use_cases = 빈 결과 (방어)', () => {
	const r = computeUcDependencies({ use_cases: [] }, null);
	assert.equal(r.counts.total, 0);
	assert.deepEqual(r.uc_dependencies, []);
});

// 회귀 — 실 산출물(discovery-from-* skill) 포맷: br_refs 미사용 + source_grounded_evidence 에
// 베어 "BR-X" / 콜론 "sqlmap:foo". 구 refSet 은 # 포함 토큰만 봐서 이 공유를 0건으로 놓쳤다
// (poc-16 실측: 실제 3쌍 BR 공유를 전부 누락). 이 케이스가 그 drift 를 회귀로 고정한다.
test('shared_ref — 실 산출물 포맷(베어 BR-/콜론, br_refs 미사용) 회귀', () => {
	const realSpec = {
		use_cases: [
			{ id: 'UC-R-001', source_grounded_evidence: ['BR-CAR-001', 'sqlmap:insertCar'] },
			{ id: 'UC-R-002', source_grounded_evidence: ['BR-CAR-001', 'sqlmap:updateCar'] }, // BR-CAR-001 공유
			{ id: 'UC-R-003', source_grounded_evidence: ['sqlmap:deleteCar'] }, // 무관
		],
	};
	const r = computeUcDependencies(realSpec, null);
	const sr = r.uc_dependencies.filter((d) => d.signal === 'shared_ref');
	assert.equal(sr.length, 1); // R1-R2 만 (BR-CAR-001 공유) / R3 무관
	const dep = sr[0];
	assert.equal(dep.from_uc, 'UC-R-001');
	assert.equal(dep.to_uc, 'UC-R-002');
	assert.equal(dep.grade, 'SHOULD'); // 베어 BR-* → br: 정규화 → SHOULD
	assert.deepEqual(dep.shared, ['br:BR-CAR-001']);
});

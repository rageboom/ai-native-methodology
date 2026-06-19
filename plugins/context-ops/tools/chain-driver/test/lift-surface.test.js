import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildLiftAdvisory, renderLiftAdvisory } from '../src/lift-surface.js';

describe('lift-surface — Gap B surface 순수 렌더 (plan-living-graph-autowire §4)', () => {
	const lift = {
		anchors: ['IMPL-ORDER-001'],
		unresolved: ['src/untracked.ts'],
		ceilingCandidates: [
			{ id: 'AC-ORDER-001', grade: 'MUST', additional_hard_hops: 1, first_hop_edge_type: 'tests' },
			{ id: 'BHV-ORDER-001', grade: 'MUST', additional_hard_hops: 2, first_hop_edge_type: 'derived_from' },
		],
	};

	it('buildLiftAdvisory 는 입력을 복사 (mutation ❌ / forward-only)', () => {
		const adv = buildLiftAdvisory(lift, ['src/foo.ts']);
		assert.deepEqual(adv.changed_paths, ['src/foo.ts']);
		assert.deepEqual(adv.anchors, ['IMPL-ORDER-001']);
		assert.equal(adv.ceiling_candidates.length, 2);
		// 원본 불변 검증
		adv.ceiling_candidates[0].id = 'MUTATED';
		adv.anchors.push('x');
		assert.equal(lift.ceilingCandidates[0].id, 'AC-ORDER-001');
		assert.equal(lift.anchors.length, 1);
	});

	it('renderLiftAdvisory — 천장 후보 + forward-only 안내', () => {
		const txt = renderLiftAdvisory(buildLiftAdvisory(lift, ['src/foo.ts']));
		assert.match(txt, /auto-climb ❌/);
		assert.match(txt, /AC-ORDER-001/);
		assert.match(txt, /lift --changed/);
		assert.match(txt, /unresolved\(추적 밖\): 1건/);
	});

	it('renderLiftAdvisory — 천장 후보 0건', () => {
		const txt = renderLiftAdvisory(
			buildLiftAdvisory({ anchors: ['IMPL-X'], unresolved: [], ceilingCandidates: [] }, ['a.ts']),
		);
		assert.match(txt, /천장 후보 없음/);
	});

	it('renderLiftAdvisory — degraded (graph 부재)', () => {
		const txt = renderLiftAdvisory({
			degraded: true,
			changed_paths: ['a.ts', 'b.ts'],
			reason: 'artifact-graph.json 부재',
		});
		assert.match(txt, /손수정 코드 2건/);
		assert.match(txt, /artifact-graph\.json 부재/);
	});

	it('renderLiftAdvisory — >8 후보 truncation', () => {
		const many = Array.from({ length: 12 }, (_, i) => ({
			id: `AC-${i}`,
			grade: 'MUST',
			additional_hard_hops: 1,
			first_hop_edge_type: 'tests',
		}));
		const txt = renderLiftAdvisory(
			buildLiftAdvisory({ anchors: ['I'], unresolved: [], ceilingCandidates: many }, ['a.ts']),
		);
		assert.match(txt, /\+4 more/);
	});

	it('lift-surface 는 computeSyncLoop / gate 모듈을 import 하지 않는다 (forward-only + non-gating 구조 보장)', () => {
		const src = readFileSync(new URL('../src/lift-surface.js', import.meta.url), 'utf8');
		// 주석 prose 의 "computeSyncLoop 미 import" 언급은 허용 — 실제 호출/import 만 차단.
		assert.ok(!/computeSyncLoop\s*\(/.test(src), 'lift-surface 가 computeSyncLoop 호출 = forward 전파 위험');
		assert.ok(!/import[^;]*computeSyncLoop/.test(src), 'lift-surface 가 computeSyncLoop import = forward 전파 위험');
		// C4: 그래프 advisory 가 결정적 gate 에 inject 되지 않도록 gate 모듈 import 금지.
		assert.ok(!/import[^;]*gate-eval/.test(src), 'lift-surface 가 gate-eval import = gate-inject 위험 (C4)');
		assert.ok(!/import[^;]*findings-aggregator/.test(src), 'lift-surface 가 findings-aggregator import = gate-inject 위험 (C4)');
	});
});

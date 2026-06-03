// impact-analyzer.test.js
// operation.md 결정 4 — confidence-aware BFS 골든 테스트 풀세트 (P1)
//
// 검증 범위:
//   1. Step 1: 첫 hop 엣지 종류 → base 등급 (hard→MUST / cross_reference→SHOULD / informs→FYI / soft 2-hop+ → ignore)
//   2. Step 2: hard chain 감쇠 (MUST 끝까지 / SHOULD→FYI→ignore / FYI→ignore)
//   3. 액션 매핑 (MUST=sync 강제 / SHOULD=검토 권고 / FYI=알림만 / ignore=노출 X)
//   4. 방향 (forward/backward/both) + merge max grade
//   5. State machine 상호작용: propose 노드 BFS 제외 (결정 8)
//   6. code-pointer-only patch backward 보조 규칙 (결정 5)
//   7. propagation-policy override (baseGradeOverrides)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	analyzeImpact,
	attenuate,
	GRADE_TO_ACTION,
	EDGE_TYPE_CATALOG,
} from '../src/impact-analyzer.js';

// ============================================================================
// 헬퍼 — 테스트용 미니멀 그래프 빌더
// ============================================================================

function node(id, state = 'active', kind = 'chain', subkind = 'BHV') {
	return {
		id,
		artifact_kind: kind,
		artifact_subkind: subkind,
		source_path: `${id}.md`,
		state,
	};
}

function edge(source, target, edge_type) {
	const HARD = new Set(['derived_from', 'implements', 'tests', 'depends_on']);
	return {
		source,
		target,
		edge_type,
		confidence: HARD.has(edge_type) ? 'hard' : 'soft',
	};
}

// chain: UC → BHV → AC → TC → IMPL (all hard derived_from / tests)
const chainGraph = {
	nodes: [
		node('UC-1', 'active', 'chain', 'UC'),
		node('BHV-1', 'active', 'chain', 'BHV'),
		node('AC-1', 'active', 'chain', 'AC'),
		node('TC-1', 'active', 'chain', 'TC'),
		node('IMPL-1', 'active', 'chain', 'IMPL'),
	],
	edges: [
		edge('UC-1', 'BHV-1', 'derived_from'),
		edge('BHV-1', 'AC-1', 'derived_from'),
		edge('AC-1', 'TC-1', 'derived_from'),
		edge('TC-1', 'IMPL-1', 'tests'),
	],
};

// ============================================================================
// 1. attenuate 단위 (operation.md 결정 4 Step 2 표 정확히)
// ============================================================================

describe('attenuate — base × additional hard hops 감쇠 표', () => {
	it('MUST 는 hard chain 끝까지 감쇠 없음', () => {
		assert.equal(attenuate('MUST', 0), 'MUST');
		assert.equal(attenuate('MUST', 1), 'MUST');
		assert.equal(attenuate('MUST', 99), 'MUST');
	});
	it('SHOULD: 0 → SHOULD / 1 → FYI / 2+ → ignore', () => {
		assert.equal(attenuate('SHOULD', 0), 'SHOULD');
		assert.equal(attenuate('SHOULD', 1), 'FYI');
		assert.equal(attenuate('SHOULD', 2), 'ignore');
		assert.equal(attenuate('SHOULD', 3), 'ignore');
	});
	it('FYI: 0 → FYI / 1+ → ignore', () => {
		assert.equal(attenuate('FYI', 0), 'FYI');
		assert.equal(attenuate('FYI', 1), 'ignore');
	});
});

// ============================================================================
// 2. Step 1 — 첫 hop base 등급
// ============================================================================

describe('Step 1: 첫 hop 엣지 종류 → base 등급', () => {
	it('hard derived_from → MUST', () => {
		const r = analyzeImpact(chainGraph, 'UC-1');
		const bhv = r.forward.find((e) => e.id === 'BHV-1');
		assert.equal(bhv.grade, 'MUST');
		assert.equal(bhv.base, 'MUST');
	});

	it('hard tests → MUST (TC→IMPL)', () => {
		const r = analyzeImpact(chainGraph, 'TC-1');
		const impl = r.forward.find((e) => e.id === 'IMPL-1');
		assert.equal(impl.grade, 'MUST');
	});

	it('soft cross_reference → SHOULD', () => {
		const g = {
			nodes: [
				node('analysis-business-rules', 'active', 'analysis', 'business-rules'),
				node('BHV-1', 'active', 'chain', 'BHV'),
			],
			edges: [edge('analysis-business-rules', 'BHV-1', 'cross_reference')],
		};
		const r = analyzeImpact(g, 'analysis-business-rules');
		assert.equal(r.forward[0].id, 'BHV-1');
		assert.equal(r.forward[0].grade, 'SHOULD');
	});

	it('soft informs → FYI', () => {
		const g = {
			nodes: [
				node('aspect-a11y', 'active', 'aspect', 'a11y'),
				node('BHV-1', 'active', 'chain', 'BHV'),
			],
			edges: [edge('aspect-a11y', 'BHV-1', 'informs')],
		};
		const r = analyzeImpact(g, 'aspect-a11y');
		assert.equal(r.forward[0].grade, 'FYI');
	});

	it('soft 2-hop+ → ignore (cross_reference → cross_reference 안 따라감)', () => {
		const g = {
			nodes: [
				node('analysis-1', 'active', 'analysis', 'domain'),
				node('analysis-2', 'active', 'analysis', 'business-rules'),
				node('BHV-1', 'active', 'chain', 'BHV'),
			],
			edges: [
				edge('analysis-1', 'analysis-2', 'cross_reference'),
				edge('analysis-2', 'BHV-1', 'cross_reference'),
			],
		};
		const r = analyzeImpact(g, 'analysis-1');
		// analysis-2 는 SHOULD (1 hop soft) / BHV-1 은 ignore (soft 2-hop)
		assert.ok(r.forward.find((e) => e.id === 'analysis-2'));
		assert.ok(
			!r.forward.find((e) => e.id === 'BHV-1'),
			'BHV-1 은 cross_reference 2-hop 이므로 ignore',
		);
	});
});

// ============================================================================
// 3. Step 2 — hard chain 감쇠
// ============================================================================

describe('Step 2: hard chain 따라가며 감쇠', () => {
	it('MUST origin: 4-hop hard chain 끝까지 모두 MUST (UC → IMPL)', () => {
		const r = analyzeImpact(chainGraph, 'UC-1');
		for (const id of ['BHV-1', 'AC-1', 'TC-1', 'IMPL-1']) {
			assert.equal(
				r.forward.find((e) => e.id === id)?.grade,
				'MUST',
				`${id} should be MUST (hard 감쇠 없음)`,
			);
		}
	});

	it('SHOULD origin: 1 hard hop → FYI / 2 hard hop → ignore', () => {
		const g = {
			nodes: [
				node('A1', 'active', 'analysis', 'business-rules'),
				node('BHV-1', 'active', 'chain', 'BHV'),
				node('AC-1', 'active', 'chain', 'AC'),
				node('TC-1', 'active', 'chain', 'TC'),
			],
			edges: [
				edge('A1', 'BHV-1', 'cross_reference'), // SHOULD
				edge('BHV-1', 'AC-1', 'derived_from'), // SHOULD → FYI
				edge('AC-1', 'TC-1', 'derived_from'), // FYI → ignore
			],
		};
		const r = analyzeImpact(g, 'A1');
		assert.equal(r.forward.find((e) => e.id === 'BHV-1').grade, 'SHOULD');
		assert.equal(r.forward.find((e) => e.id === 'AC-1').grade, 'FYI');
		assert.ok(!r.forward.find((e) => e.id === 'TC-1'), 'TC-1 은 ignore');
	});

	it('FYI origin: 1 hard hop → ignore (즉시 차단)', () => {
		const g = {
			nodes: [
				node('aspect-a11y', 'active', 'aspect', 'a11y'),
				node('BHV-1', 'active', 'chain', 'BHV'),
				node('AC-1', 'active', 'chain', 'AC'),
			],
			edges: [
				edge('aspect-a11y', 'BHV-1', 'informs'), // FYI
				edge('BHV-1', 'AC-1', 'derived_from'), // FYI → ignore
			],
		};
		const r = analyzeImpact(g, 'aspect-a11y');
		assert.equal(r.forward.find((e) => e.id === 'BHV-1').grade, 'FYI');
		assert.ok(!r.forward.find((e) => e.id === 'AC-1'), 'AC-1 은 ignore');
	});
});

// ============================================================================
// 4. 방향 + merge
// ============================================================================

describe('방향: forward + backward 양방향 merge', () => {
	it('BHV-1 변경 → forward(AC/TC/IMPL) + backward(UC)', () => {
		const r = analyzeImpact(chainGraph, 'BHV-1');
		const forwardIds = r.forward.map((e) => e.id).sort();
		const backwardIds = r.backward.map((e) => e.id).sort();
		assert.deepEqual(forwardIds, ['AC-1', 'IMPL-1', 'TC-1']);
		assert.deepEqual(backwardIds, ['UC-1']);
		assert.ok(r.merged.find((e) => e.id === 'UC-1').direction === 'backward');
		assert.ok(r.merged.find((e) => e.id === 'AC-1').direction === 'forward');
	});

	it('forward / backward 동일 등급 도달 시 direction=both', () => {
		// 양방향 cycle 없이 양방향 도달 가능한 케이스 구성 (소프트 + 하드 조합)
		// origin 에서 직접 양쪽으로 인접한 노드가 있다면 단일 hop forward + backward 가 같은 등급
		const g = {
			nodes: [
				node('N1', 'active', 'chain', 'BHV'),
				node('ORIGIN', 'active', 'chain', 'BHV'),
			],
			edges: [
				edge('ORIGIN', 'N1', 'derived_from'),
				edge('N1', 'ORIGIN', 'derived_from'),
			],
		};
		const r = analyzeImpact(g, 'ORIGIN');
		// N1 은 forward + backward 둘 다 MUST
		const n1 = r.merged.find((e) => e.id === 'N1');
		assert.equal(n1.grade, 'MUST');
		assert.equal(n1.direction, 'both');
	});

	it('includeForward=false → forward 결과 없음', () => {
		const r = analyzeImpact(chainGraph, 'BHV-1', { includeForward: false });
		assert.equal(r.forward.length, 0);
		assert.equal(r.backward.length, 1);
	});
});

// ============================================================================
// 5. State machine 상호작용 (결정 8) — propose 노드 BFS 제외
// ============================================================================

describe('State machine 상호작용: propose 노드 BFS 제외', () => {
	it('propose 노드는 traverse 안 함 (기본)', () => {
		const g = {
			nodes: [
				node('UC-1', 'active', 'chain', 'UC'),
				node('BHV-1', 'propose', 'chain', 'BHV'),
				node('AC-1', 'active', 'chain', 'AC'),
			],
			edges: [
				edge('UC-1', 'BHV-1', 'derived_from'),
				edge('BHV-1', 'AC-1', 'derived_from'),
			],
		};
		const r = analyzeImpact(g, 'UC-1');
		assert.ok(
			!r.forward.find((e) => e.id === 'BHV-1'),
			'BHV-1 propose → traverse 제외',
		);
		assert.ok(
			!r.forward.find((e) => e.id === 'AC-1'),
			'AC-1 도 BHV-1 차단으로 도달 불가',
		);
	});

	it('drift 노드는 active 와 동일하게 traverse', () => {
		const g = {
			nodes: [
				node('UC-1', 'active', 'chain', 'UC'),
				node('BHV-1', 'drift', 'chain', 'BHV'),
			],
			edges: [edge('UC-1', 'BHV-1', 'derived_from')],
		};
		const r = analyzeImpact(g, 'UC-1');
		assert.equal(r.forward[0].id, 'BHV-1');
		assert.equal(r.forward[0].grade, 'MUST');
	});

	it('nonTraversableStates override 가능 — deprecated 도 제외', () => {
		const g = {
			nodes: [
				node('UC-1', 'active', 'chain', 'UC'),
				node('BHV-1', 'deprecated', 'chain', 'BHV'),
			],
			edges: [edge('UC-1', 'BHV-1', 'derived_from')],
		};
		const r = analyzeImpact(g, 'UC-1', {
			nonTraversableStates: ['propose', 'deprecated'],
		});
		assert.equal(r.forward.length, 0);
	});
});

// ============================================================================
// 6. code-pointer-only patch backward 보조 (결정 5)
// ============================================================================

describe('code-pointer-only patch backward 보조 규칙 (결정 5)', () => {
	it('IMPL 의 code-pointer 만 patch → backward implements/derived_from 한 단계 보수적', () => {
		// IMPL → TC → BHV → AC 역방향 (backward)
		const g = {
			nodes: [
				node('IMPL-1', 'active', 'chain', 'IMPL'),
				node('TC-1', 'active', 'chain', 'TC'),
				node('BHV-1', 'active', 'chain', 'BHV'),
				node('AC-1', 'active', 'chain', 'AC'),
			],
			edges: [
				edge('TC-1', 'IMPL-1', 'tests'),
				edge('BHV-1', 'AC-1', 'derived_from'),
				edge('AC-1', 'TC-1', 'derived_from'),
			],
		};
		// origin = IMPL-1, codePointerOnly=true
		const r = analyzeImpact(g, 'IMPL-1', {
			codePointerOnly: true,
			includeForward: false,
		});
		// backward: IMPL → TC = SHOULD (code-pointer-only base = SHOULD, hard 1-hop)
		// backward: TC → AC = FYI (SHOULD 의 1 hop 더)
		// backward: AC → BHV = ignore (SHOULD 의 2 hop 더)
		assert.equal(r.backward.find((e) => e.id === 'TC-1').grade, 'SHOULD');
		assert.equal(r.backward.find((e) => e.id === 'AC-1').grade, 'FYI');
		assert.ok(
			!r.backward.find((e) => e.id === 'BHV-1'),
			'BHV-1 은 2 hop 더 → ignore',
		);
	});
});

// ============================================================================
// 7. propagation-policy override (baseGradeOverrides)
// ============================================================================

describe('baseGradeOverrides — propagation-policy.yaml 시뮬레이션', () => {
	it('cross_reference 를 MUST 로 override (강제 매팅)', () => {
		const g = {
			nodes: [
				node('A1', 'active', 'analysis', 'business-rules'),
				node('BHV-1', 'active', 'chain', 'BHV'),
				node('AC-1', 'active', 'chain', 'AC'),
			],
			edges: [
				edge('A1', 'BHV-1', 'cross_reference'),
				edge('BHV-1', 'AC-1', 'derived_from'),
			],
		};
		const r = analyzeImpact(g, 'A1', {
			baseGradeOverrides: { cross_reference: 'MUST' },
		});
		// 이제 SHOULD 가 아니라 MUST → AC-1 까지 MUST
		assert.equal(r.forward.find((e) => e.id === 'BHV-1').grade, 'MUST');
		assert.equal(r.forward.find((e) => e.id === 'AC-1').grade, 'MUST');
	});
});

// ============================================================================
// 8. by_grade + GRADE_TO_ACTION + 출력 결정성
// ============================================================================

describe('출력 구조 (by_grade / 액션 매핑 / 결정성)', () => {
	it('by_grade 가 등급별로 분류', () => {
		const r = analyzeImpact(chainGraph, 'UC-1');
		assert.deepEqual(r.by_grade.MUST.sort(), [
			'AC-1',
			'BHV-1',
			'IMPL-1',
			'TC-1',
		]);
		assert.equal(r.by_grade.SHOULD.length, 0);
		assert.equal(r.by_grade.FYI.length, 0);
	});

	it('GRADE_TO_ACTION 매핑 (결정 4 액션 표)', () => {
		assert.equal(GRADE_TO_ACTION.MUST, 'sync 강제');
		assert.equal(GRADE_TO_ACTION.SHOULD, '검토 권고');
		assert.equal(GRADE_TO_ACTION.FYI, '알림만');
		assert.equal(GRADE_TO_ACTION.ignore, '노출 X');
	});

	it('EDGE_TYPE_CATALOG — hard 5 / soft 3 (v11.0.0 +conforms_to +groups)', () => {
		assert.equal(EDGE_TYPE_CATALOG.hard.length, 5);
		assert.equal(EDGE_TYPE_CATALOG.soft.length, 3);
		assert.ok(
			EDGE_TYPE_CATALOG.hard.includes('conforms_to'),
			'conforms_to = hard',
		);
		assert.ok(EDGE_TYPE_CATALOG.soft.includes('groups'), 'groups = soft');
	});

	it('동일 입력 → 동일 출력 (결정성, conventions.md §9)', () => {
		const r1 = analyzeImpact(chainGraph, 'BHV-1');
		const r2 = analyzeImpact(chainGraph, 'BHV-1');
		assert.deepEqual(r1.by_grade, r2.by_grade);
	});

	it('stats 통계 정합', () => {
		const r = analyzeImpact(chainGraph, 'BHV-1');
		assert.equal(r.stats.forward_count, 3);
		assert.equal(r.stats.backward_count, 1);
		assert.equal(r.stats.merged_count, 4);
		assert.equal(r.stats.by_grade_count.MUST, 4);
	});
});

// ============================================================================
// 9. 방어 — unknown origin / dangling edge / empty graph
// ============================================================================

describe('방어 케이스', () => {
	it('unknown origin → throw', () => {
		assert.throws(() => analyzeImpact(chainGraph, 'NOT-EXIST'), /not in graph/);
	});

	it('dangling edge (target 없음) → 무시하고 crash 안 함', () => {
		const g = {
			nodes: [node('UC-1', 'active', 'chain', 'UC')],
			edges: [edge('UC-1', 'GHOST', 'derived_from')],
		};
		const r = analyzeImpact(g, 'UC-1');
		assert.equal(r.forward.length, 0);
	});

	it('빈 그래프 from origin 만 (인접 엣지 0) → 결과 비어있음', () => {
		const g = {
			nodes: [node('LONELY', 'active', 'chain', 'UC')],
			edges: [],
		};
		const r = analyzeImpact(g, 'LONELY');
		assert.equal(r.forward.length, 0);
		assert.equal(r.backward.length, 0);
		assert.equal(r.merged.length, 0);
	});
});

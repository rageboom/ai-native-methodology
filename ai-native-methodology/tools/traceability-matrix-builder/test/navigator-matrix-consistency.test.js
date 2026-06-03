// navigator-matrix-consistency.test.js
// operation.md Verification "추가 골든 테스트" — dep-graph-navigator 응답 ↔ traceability-matrix.md 일관 (snapshot).
//
// 동일 chain 입력으로 matrix(buildMatrix) 와 graph(synthesizeGraph)를 만들고,
// navigate 영향 트리(impact-analyzer BFS)가 matrix 의 chain 링크와 일관됨을 검증.
// = 두 렌더링(matrix cell ↔ graph edge)이 같은 SSOT(chain artifact)에서 도출되므로 일치해야 함.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildMatrix } from '../src/builder.js';
import { synthesizeGraph } from '../src/graph-synthesizer.js';
import { analyzeImpact } from '../../chain-driver/src/impact-analyzer.js';

const chain = {
	planning: { use_cases: [{ id: 'UC-USER-001' }, { id: 'UC-USER-002' }] },
	behavior: {
		behaviors: [
			{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] },
			{ id: 'BHV-USER-002', use_case_refs: ['UC-USER-002'] },
		],
	},
	acceptance: {
		criteria: [
			{
				id: 'AC-USER-001',
				behavior_ref: 'BHV-USER-001',
				verifiable: true,
				severity: 'must',
			},
			{
				id: 'AC-USER-002',
				behavior_ref: 'BHV-USER-002',
				verifiable: true,
				severity: 'should',
			},
		],
	},
	testSpec: {
		test_cases: [
			{ id: 'TC-USER-001', ac_ref: 'AC-USER-001' },
			{ id: 'TC-USER-002', ac_ref: 'AC-USER-002' },
		],
	},
	implSpec: {
		modules: [
			{
				id: 'IMPL-USER-001',
				tc_refs: ['TC-USER-001'],
				bhv_refs: ['BHV-USER-001'],
				source_files: ['a.kt'],
				commit_hash: 'abc1234',
			},
			{
				id: 'IMPL-USER-002',
				tc_refs: ['TC-USER-002'],
				bhv_refs: ['BHV-USER-002'],
				source_files: ['b.kt'],
				commit_hash: 'def1234',
			},
		],
	},
};

const sourcePaths = {
	planning: 'planning-spec.json',
	behavior: 'behavior-spec.json',
	acceptance: 'acceptance-criteria.json',
	testSpec: 'test-spec.json',
	implSpec: 'impl-spec.json',
};

const matrix = buildMatrix(chain);
const graph = synthesizeGraph({ ...chain, sourcePaths });

// matrix cell 에서 UC 별 chain 멤버 추출 (consistency 기준)
function matrixChainMembersForUC(ucId) {
	const members = new Set();
	for (const cell of matrix.matrix) {
		if (cell.use_case_id !== ucId) continue;
		for (const k of ['behavior_id', 'acceptance_id', 'test_id', 'impl_id']) {
			if (cell[k]) members.add(cell[k]);
		}
	}
	return members;
}

describe('navigator ↔ matrix 일관 (operation.md Verification snapshot)', () => {
	it('UC-USER-001 navigate forward 영향 = matrix 의 동일 UC chain 멤버', () => {
		const impact = analyzeImpact(graph, 'UC-USER-001');
		const forwardIds = new Set(impact.forward.map((e) => e.id));
		const matrixMembers = matrixChainMembersForUC('UC-USER-001');
		// matrix 의 모든 chain 멤버가 navigate forward 영향에 포함돼야 함
		for (const m of matrixMembers) {
			assert.ok(
				forwardIds.has(m),
				`matrix member ${m} 가 navigate forward 영향에 없음 (일관성 위반)`,
			);
		}
	});

	it('UC-USER-002 도 동일 일관', () => {
		const impact = analyzeImpact(graph, 'UC-USER-002');
		const forwardIds = new Set(impact.forward.map((e) => e.id));
		for (const m of matrixChainMembersForUC('UC-USER-002')) {
			assert.ok(forwardIds.has(m), `${m} missing`);
		}
	});

	it('forward 영향이 다른 UC 의 chain 멤버를 누설하지 않음 (scope 격리)', () => {
		const impact = analyzeImpact(graph, 'UC-USER-001');
		const forwardIds = new Set(impact.forward.map((e) => e.id));
		// UC-002 chain 은 UC-001 forward 에 없어야 함 (분리된 chain)
		assert.ok(!forwardIds.has('BHV-USER-002'));
		assert.ok(!forwardIds.has('IMPL-USER-002'));
	});

	it('matrix green cell 수 = graph 의 완전 chain 수 (UC→IMPL 5단계 도달)', () => {
		const greenCells = matrix.matrix.filter((c) => c.status === 'green').length;
		// 각 green cell = 완전한 UC→BHV→AC→TC→IMPL chain.
		// graph 에서 각 UC 의 forward 가 IMPL 까지 MUST 도달하는 수와 일치.
		let fullChains = 0;
		for (const uc of ['UC-USER-001', 'UC-USER-002']) {
			const impact = analyzeImpact(graph, uc);
			if (impact.by_grade.MUST.some((id) => id.startsWith('IMPL-')))
				fullChains++;
		}
		assert.equal(greenCells, fullChains);
	});

	it('graph edge 방향 = matrix chain 순서 (UC→BHV→AC→TC→IMPL)', () => {
		// graph 의 derived_from/tests 엣지가 matrix 의 forward 순서와 일치
		const edgeSet = new Set(graph.edges.map((e) => `${e.source}->${e.target}`));
		assert.ok(edgeSet.has('UC-USER-001->BHV-USER-001'));
		assert.ok(edgeSet.has('BHV-USER-001->AC-USER-001'));
		assert.ok(edgeSet.has('AC-USER-001->TC-USER-001'));
		assert.ok(edgeSet.has('TC-USER-001->IMPL-USER-001'));
	});

	it('IMPL 노드 commit_hash = matrix cell impl_commit_hash 일관', () => {
		const implNode = graph.nodes.find((n) => n.id === 'IMPL-USER-001');
		const implCell = matrix.matrix.find((c) => c.impl_id === 'IMPL-USER-001');
		// 둘 다 같은 chain.implSpec.modules[].commit_hash 에서 도출
		assert.ok(implNode.code_pointers[0].commit_hash.startsWith('abc1234'));
		assert.ok(implCell.impl_commit_hash.startsWith('abc1234'));
	});
});

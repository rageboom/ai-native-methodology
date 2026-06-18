// revisit-impact.test.js — revisit 의미적 근거 enrich (ADR-CHAIN-003 §3 / 갭1).
//   enrichRevisitImpact: 변경 파일 → 영향 UC/BHV/AC/TASK/TC/IMPL ID + traceability cell 수 (결정론 / graph BFS 재사용).
//   renderRevisitPrompt: ADR §3 형식 평이 텍스트 (graph 부재 시 정직 degrade).
//   재사용: resolveOriginNodeIds(sync-loop) + analyzeImpact(impact-analyzer). detectRevisit 무변.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	enrichRevisitImpact,
	renderRevisitPrompt,
} from '../src/revisit-impact.js';
import { revisitCandidateNote } from '../src/hooks-bridge.js';

function edge(source, target, edge_type = 'derived_from') {
	return { source, target, edge_type, confidence: 'hard' };
}
function node(id, sk, source_path) {
	const kind = ['UC', 'BHV', 'AC', 'TASK', 'TC', 'IMPL'].includes(sk)
		? 'chain'
		: 'analysis';
	return {
		id,
		artifact_kind: kind,
		artifact_subkind: sk,
		source_path,
		state: 'active',
		scope_id: 'test',
	};
}

// full chain fixture: UC-A → BHV-A → AC-A → TC-A → IMPL-A (derived_from forward edges).
const GRAPH = {
	nodes: [
		node('UC-A', 'UC', '.ai-context/base/discovery-spec.json'),
		node('BHV-A', 'BHV', '.ai-context/base/behavior-spec.json'),
		node('AC-A', 'AC', '.ai-context/base/acceptance-criteria.json'),
		node('TC-A', 'TC', '.ai-context/base/test-spec.json'),
		node('IMPL-A', 'IMPL', '.ai-context/base/impl-spec.json'),
	],
	edges: [
		edge('UC-A', 'BHV-A'),
		edge('BHV-A', 'AC-A'),
		edge('AC-A', 'TC-A'),
		edge('TC-A', 'IMPL-A'),
	],
};

// detectRevisit 출력 형태 (spec 산출물 변경 / implement 진행 중 → upstream spec).
function specRevisitResult() {
	return {
		revisit_target: 'spec',
		confidence_loc: 60,
		reason: 'spec files changed (60 LOC) — upstream of implement',
		changed_paths: ['.ai-context/base/behavior-spec.json'],
		ignored_paths: [],
	};
}

describe('enrichRevisitImpact — 의미적 근거 (결정론)', () => {
	it('변경 파일 → origin 노드 → forward 영향 ID 버킷 + cell 수', () => {
		const e = enrichRevisitImpact(specRevisitResult(), GRAPH, 'implement');
		assert.equal(e.impact.degraded, false);
		// BHV-A(origin) + forward(AC-A, TC-A, IMPL-A)
		assert.deepEqual(e.impact.affected_ids.BHV, ['BHV-A']);
		assert.deepEqual(e.impact.affected_ids.AC, ['AC-A']);
		assert.deepEqual(e.impact.affected_ids.TC, ['TC-A']);
		assert.deepEqual(e.impact.affected_ids.IMPL, ['IMPL-A']);
		// leaf(BHV+AC+TASK+TC+IMPL) 수 = traceability 영향 cell 근사
		assert.equal(e.impact.affected_cells, 4);
	});

	it('stage_range = { from: currentChain, to: revisit_target }', () => {
		const e = enrichRevisitImpact(specRevisitResult(), GRAPH, 'implement');
		assert.deepEqual(e.impact.stage_range, { from: 'implement', to: 'spec' });
	});

	it('원본 revisitResult 필드 보존 (additive)', () => {
		const e = enrichRevisitImpact(specRevisitResult(), GRAPH, 'implement');
		assert.equal(e.revisit_target, 'spec');
		assert.equal(e.confidence_loc, 60);
		assert.deepEqual(e.changed_paths, ['.ai-context/base/behavior-spec.json']);
	});

	it('graph 부재 → degraded:true + cell 0 (정직 표기) / stage_range 는 유지', () => {
		const e = enrichRevisitImpact(specRevisitResult(), null, 'implement');
		assert.equal(e.impact.degraded, true);
		assert.equal(e.impact.affected_cells, 0);
		assert.ok(e.impact.reason && e.impact.reason.length > 0);
		assert.deepEqual(e.impact.stage_range, { from: 'implement', to: 'spec' });
	});

	it('changed_paths 가 graph 노드에 미매핑 → degraded:true', () => {
		const r = specRevisitResult();
		r.changed_paths = ['.ai-context/base/unknown-orphan.json'];
		const e = enrichRevisitImpact(r, GRAPH, 'implement');
		assert.equal(e.impact.degraded, true);
		assert.equal(e.impact.affected_cells, 0);
	});

	it('revisit_target null → degraded:true + stage_range null', () => {
		const noTarget = {
			revisit_target: null,
			confidence_loc: 0,
			reason: 'no upstream chain matched',
			changed_paths: [],
			ignored_paths: [],
		};
		const e = enrichRevisitImpact(noTarget, GRAPH, 'implement');
		assert.equal(e.impact.degraded, true);
		assert.equal(e.impact.stage_range, null);
	});
});

describe('renderRevisitPrompt — ADR §3 형식 (평이)', () => {
	it('한 줄 권고 + 영향 stages + 영향 trace(ID) + cell 수 + 3선택', () => {
		const e = enrichRevisitImpact(specRevisitResult(), GRAPH, 'implement');
		const txt = renderRevisitPrompt(e);
		assert.match(txt, /revisit 권고/);
		assert.match(txt, /implement → spec/);
		assert.match(txt, /영향 stages/);
		assert.match(txt, /AC-A/); // 영향 trace ID
		assert.match(txt, /IMPL-A/);
		assert.match(txt, /traceability 영향 cell: 4/);
		assert.match(txt, /revisit:spec/); // 결단 선택지
		assert.match(txt, /무시/);
		assert.match(txt, /abort/);
	});

	it('graph degraded → trace/cell 대신 정직 표기 + 변경파일 노출', () => {
		const e = enrichRevisitImpact(specRevisitResult(), null, 'implement');
		const txt = renderRevisitPrompt(e);
		assert.match(txt, /revisit 권고/);
		assert.match(txt, /그래프 부재|영향 ID 미산출/);
		assert.match(txt, /behavior-spec\.json/); // 변경파일은 보여줌
		assert.doesNotMatch(txt, /traceability 영향 cell: \d/); // cell 수치 줄 없음
	});
});

describe('revisitCandidateNote — PostToolUse 가벼운 후보 신호 (하이브리드)', () => {
	it('upstream 산출물 변경(BHV→spec / 현재 implement) → 1줄 advisory', () => {
		const note = revisitCandidateNote({
			detected: {
				artifact_kind: 'chain',
				artifact_subkind: 'BHV',
				filename: 'behavior-spec.json',
			},
			currentChain: 'implement',
		});
		assert.ok(note);
		assert.match(note, /revisit 후보/);
		assert.match(note, /spec/);
	});

	it('동일/downstream stage(IMPL / 현재 implement) → null', () => {
		assert.equal(
			revisitCandidateNote({
				detected: {
					artifact_kind: 'chain',
					artifact_subkind: 'IMPL',
					filename: 'impl-spec.json',
				},
				currentChain: 'implement',
			}),
			null,
		);
	});

	it('analysis 산출물 변경(현재 spec) → upstream 1줄', () => {
		const note = revisitCandidateNote({
			detected: {
				artifact_kind: 'analysis',
				artifact_subkind: 'rules',
				filename: 'business-rules.json',
			},
			currentChain: 'spec',
		});
		assert.ok(note);
	});

	it('currentChain 없음/detected 없음 → null (graceful)', () => {
		assert.equal(
			revisitCandidateNote({
				detected: {
					artifact_kind: 'chain',
					artifact_subkind: 'BHV',
					filename: 'x',
				},
				currentChain: null,
			}),
			null,
		);
		assert.equal(
			revisitCandidateNote({ detected: null, currentChain: 'implement' }),
			null,
		);
	});
});

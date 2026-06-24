// dep-consult.js — discovery UC 의존성 reference-lens (S4 / MIS-373 / 하이브리드 C).
//
// 신호 2종:
//   shared_ref  — 그래프 무관 / discovery 시점 항상 동작. 두 UC 가 br_refs/api_refs/
//                 source(analysis artifact) 를 공유하면 결합으로 본다.
//   graph_impact — artifact-graph 존재 + UC 노드 합성 시 보강. analyzeImpact 로 UC↔UC 영향.
//
// 신뢰 경계 (불변): non-gating / verdict ❌ (STRONG-STOP / feedback_chain_driver_deterministic_axis).
//   UC 분해·순서 검토 보조일 뿐 chain-coverage 강제 ❌. 그래프·UC 부재 = graph_impact degraded
//   (정직 신호 / no-simulation — LLM 추론 대체 ❌). 결정론 산식만.

import { analyzeImpact } from './impact-analyzer.js';

// UC 의 참조 집합 (br_refs ∪ api_refs ∪ analysis-artifact source id). shared_ref 결합 판정용.
function refSet(uc) {
	const s = new Set();
	for (const r of uc.br_refs || []) s.add('br:' + r);
	for (const r of uc.api_refs || []) s.add('api:' + r);
	for (const e of uc.source_grounded_evidence || []) {
		// "business-rules.json#BR-X" / "domain.json#User" 같은 analysis artifact ref 만 결합 신호로.
		if (typeof e === 'string' && e.includes('#')) s.add('src:' + e);
	}
	return s;
}

// shared_ref grade — br/api 공유=SHOULD(의미 결합), source-only=FYI. (정량 분류 / verdict 아님)
function sharedGrade(shared) {
	return shared.some((x) => x.startsWith('br:') || x.startsWith('api:')) ? 'SHOULD' : 'FYI';
}

/**
 * discovery-spec.use_cases[] 의 UC 간 의존성 reference-lens 산출 (하이브리드).
 * @param {Object} discoverySpec  { use_cases: [{ id, br_refs?, api_refs?, source_grounded_evidence? }] }
 * @param {Object|null} graph     artifact-graph.json { nodes, edges } (부재=null → graph_impact degraded)
 * @returns {{ uc_dependencies: Array, graph_impact_degraded: boolean, reason: string|null, counts: Object }}
 */
export function computeUcDependencies(discoverySpec, graph = null) {
	const ucs = (discoverySpec?.use_cases || []).filter((u) => u && u.id);
	const deps = [];

	// --- shared_ref (그래프 무관 / discovery 시점 항상) ---
	const refs = ucs.map((u) => ({ id: u.id, set: refSet(u) }));
	for (let i = 0; i < refs.length; i++) {
		for (let j = i + 1; j < refs.length; j++) {
			const shared = [...refs[i].set].filter((x) => refs[j].set.has(x));
			if (!shared.length) continue;
			deps.push({
				from_uc: refs[i].id,
				to_uc: refs[j].id,
				signal: 'shared_ref',
				grade: sharedGrade(shared),
				direction: 'both',
				shared: shared.sort(),
			});
		}
	}

	// --- graph_impact (artifact-graph + UC 노드 있을 때 보강) ---
	let graphDegraded = true;
	let reason = 'artifact-graph 부재 — graph_impact 미산출 (shared_ref 만)';
	if (graph && Array.isArray(graph.nodes) && graph.nodes.length) {
		const nodeIds = new Set(graph.nodes.map((n) => n && n.id));
		const ucInGraph = ucs.filter((u) => nodeIds.has(u.id));
		if (ucInGraph.length) {
			graphDegraded = false;
			reason = null;
			const ucIdSet = new Set(ucs.map((u) => u.id));
			for (const u of ucInGraph) {
				let impact;
				try {
					impact = analyzeImpact(graph, u.id);
				} catch {
					continue; // origin not in graph (방어)
				}
				for (const m of impact.merged) {
					if (m.id === u.id || !ucIdSet.has(m.id)) continue; // 다른 UC 만
					deps.push({
						from_uc: u.id,
						to_uc: m.id,
						signal: 'graph_impact',
						grade: m.grade,
						edge_type: m.first_hop_edge_type,
						direction: m.direction || 'both',
					});
				}
			}
		} else {
			reason = 'UC 노드 미합성 — graph_impact 미산출 (그래프 재합성 후 / shared_ref 만)';
		}
	}

	// 결정성 — (from, to, signal) 정렬
	deps.sort((a, b) =>
		(a.from_uc + '|' + a.to_uc + '|' + a.signal).localeCompare(b.from_uc + '|' + b.to_uc + '|' + b.signal),
	);

	return {
		uc_dependencies: deps,
		graph_impact_degraded: graphDegraded,
		reason,
		counts: {
			total: deps.length,
			shared_ref: deps.filter((d) => d.signal === 'shared_ref').length,
			graph_impact: deps.filter((d) => d.signal === 'graph_impact').length,
		},
	};
}

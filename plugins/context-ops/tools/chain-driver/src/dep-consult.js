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

// UC 의 참조 집합 (br_refs ∪ api_refs ∪ source_grounded_evidence 토큰). shared_ref 결합 판정용.
// 실 산출물(discovery-from-* skill) 은 br_refs/api_refs 필드를 쓰지 않고 source_grounded_evidence 에
// 베어 "BR-X" / 콜론 "sqlmap:foo" / "domain.json#User" 등을 담는다. 토큰 전체를 정확일치 공유 신호로
// 보되, 식별자성(BR-*/api*) 은 br:/api: 로 정규화해 sharedGrade SHOULD 로 승격한다.
function refSet(uc) {
	const s = new Set();
	for (const r of uc.br_refs || []) s.add('br:' + r); // 하위호환 (필드 사용 시)
	for (const r of uc.api_refs || []) s.add('api:' + r); // 하위호환 (필드 사용 시)
	for (const e of uc.source_grounded_evidence || []) {
		if (typeof e !== 'string') continue;
		const t = e.trim();
		if (!t) continue;
		if (/^BR-/.test(t)) s.add('br:' + t); // 베어 BR 토큰 → 의미 결합 SHOULD
		else if (/^(api|openapi):/.test(t)) s.add('api:' + t); // API 식별자 → SHOULD
		else s.add('src:' + t); // 그 외(콜론 식별자/파일/메서드/# ref) → FYI / 정확 일치만
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

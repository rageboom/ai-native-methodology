// difficulty.js — discovery UC 난이도 reference-lens (S1 / MIS-373).
//
// 결정론 정량만: artifact-graph 의존성 영향 노드 수(analyzeImpact merged_count)
//   → S/M/L 버킷. research 패턴 F (CIA — 영향 노드 수 = 노력 proxy) +
//   패턴 E (graph centrality = 위험 proxy / Zimmermann&Nagappan ICSE2008).
//
// 신뢰 경계 (불변):
//   - verdict ❌ — gate blocking[] inject 금지 (STRONG-STOP / feedback_chain_driver_deterministic_axis).
//     난이도는 "객관적 정량"이지 "통과/실패 판정"이 아니다. 표시(HTML 뱃지) + 검토권장(review[]) 전용.
//   - greenfield/그래프 부재 = degraded:true 정직 신호 (LLM 추론 대체 ❌ / no-simulation).
//   - UC 노드 미합성(그래프에 origin 없음) = per-UC degrade (analyzeImpact throw catch).

import { analyzeImpact } from '../../chain-driver/src/impact-analyzer.js';

// 버킷 임계 (영향 노드 수 = 노력 proxy). reference-lens 라 임계는 advisory.
//   S: 0..3 / M: 4..9 / L: 10+
export const DIFFICULTY_THRESHOLDS = Object.freeze({ S_MAX: 3, M_MAX: 9 });

// MUST(hard sync 강제) 밀집 가중 — 정량 규칙(verdict 아님): MUST 영향 ≥5 면 score +5.
export const MUST_DENSE_THRESHOLD = 5;
export const MUST_DENSE_BONUS = 5;

/**
 * 영향 정량 → S/M/L 버킷 (결정론 / verdict 아님).
 * @param {number} impactCount  merged_count (forward+backward 영향 노드 수)
 * @param {number} mustCount    by_grade_count.MUST (hard sync 강제 영향 수)
 * @returns {'S'|'M'|'L'}
 */
export function bucketFor(impactCount, mustCount = 0) {
	let score = impactCount;
	if (mustCount >= MUST_DENSE_THRESHOLD) score += MUST_DENSE_BONUS;
	if (score <= DIFFICULTY_THRESHOLDS.S_MAX) return 'S';
	if (score <= DIFFICULTY_THRESHOLDS.M_MAX) return 'M';
	return 'L';
}

/**
 * discovery-spec.use_cases[] 각 UC 의 난이도 reference-lens 산출.
 * @param {Object} discoverySpec  { use_cases: [{ id, ... }] }
 * @param {Object|null} graph     artifact-graph.json { nodes, edges } (부재=null → degraded)
 * @returns {{ degraded: boolean, reason?: string, use_cases: Object }}
 *   use_cases[ucId] = { degraded, bucket, impact_count, must_count, should_count, fyi_count } | { degraded:true, reason, bucket:null }
 */
export function scoreUseCases(discoverySpec, graph) {
	const ucs = Array.isArray(discoverySpec?.use_cases) ? discoverySpec.use_cases : [];
	if (!graph || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
		// greenfield / 미합성 — 전역 degrade (정직 신호 / §8.1 greenfield 보호)
		return {
			degraded: true,
			reason: 'artifact-graph 부재 — 난이도 미산출 (greenfield 또는 그래프 미합성)',
			use_cases: {},
		};
	}
	const out = {};
	for (const uc of ucs) {
		const id = uc?.id;
		if (!id) continue;
		try {
			const impact = analyzeImpact(graph, id);
			const impactCount = impact.stats.merged_count;
			const g = impact.stats.by_grade_count;
			out[id] = {
				degraded: false,
				bucket: bucketFor(impactCount, g.MUST),
				impact_count: impactCount,
				must_count: g.MUST,
				should_count: g.SHOULD,
				fyi_count: g.FYI,
			};
		} catch {
			// analyzeImpact: origin not in graph — UC 미합성 → per-UC degrade (정직)
			out[id] = {
				degraded: true,
				reason: 'UC 노드 미합성 — 그래프 재합성 후 산출',
				bucket: null,
			};
		}
	}
	return { degraded: false, use_cases: out };
}

// review[] 검토권장 advisory 생성 — 난이도 高(L) UC 만. blocking[] ❌ (D3 / 비차단).
//   gate summary 의 review[] 에 병합 (chain-driver verdict 무오염 / 표시 axis).
export function difficultyReviewItems(scored) {
	if (!scored || scored.degraded) return [];
	const items = [];
	for (const [id, d] of Object.entries(scored.use_cases)) {
		if (d.degraded || d.bucket !== 'L') continue;
		items.push({
			id,
			kind: 'difficulty',
			text: `${id} 난이도 L — 의존 영향 ${d.impact_count}노드(MUST ${d.must_count}). 분해/순서 검토 권장.`,
		});
	}
	// 결정성 — id 정렬
	items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
	return items;
}

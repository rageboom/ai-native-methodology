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

// 버킷 임계 (영향 노드 수 = 노력 proxy). reference-lens 라 임계는 advisory / 표시용 라벨.
//   S: 0..3 / M: 4..9 / L: 10+
export const DIFFICULTY_THRESHOLDS = Object.freeze({ S_MAX: 3, M_MAX: 9 });

// scope-상대 outlier 비율 — difficultyReviewItems advisory 대상 (상위 20%). verdict 아님.
export const OUTLIER_TOP_RATIO = 0.2;

/**
 * 영향 정량 → S/M/L 버킷 (결정론 / verdict 아님 / 표시용 라벨).
 * NOTE: MUST_DENSE_BONUS(+5) 제거 — ep-be-gea 35 BC corroboration: full-chain 그래프는
 *   하방 체인이 전부 MUST 라 보너스가 355/356(100%) 발동 = 상수가 되어 전부 L 포화(변별 상실).
 *   보너스 제거 시 M255/L101 로 변별 회복. 행동 유발(검토권장)은 difficultyReviewItems 의
 *   scope-상대 outlier 로 분리. 버킷 절대 임계의 위상 민감성은 B안(분위수 reframe / ≥2 위상 후 격상) 영역.
 * @param {number} impactCount  merged_count (forward+backward 영향 노드 수)
 * @returns {'S'|'M'|'L'}
 */
export function bucketFor(impactCount) {
	if (impactCount <= DIFFICULTY_THRESHOLDS.S_MAX) return 'S';
	if (impactCount <= DIFFICULTY_THRESHOLDS.M_MAX) return 'M';
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
				bucket: bucketFor(impactCount),
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

// review[] 검토권장 advisory 생성 — scope-상대 outlier(상위 OUTLIER_TOP_RATIO) ∩ 절대 L 급만.
//   blocking[] ❌ (D3 / 비차단) / gate summary review[] 병합 (chain-driver verdict 무오염 / 표시 axis).
// NOTE: 구 로직(L 전부)은 full-chain 그래프에서 355개 도배(noise) — ep-be-gea 35 BC corroboration.
//   "이 scope 에서 유독 영향 큰 UC" 만 짚도록 scope-상대 상위 분위수로 축소. verdict ❌ (정량 advisory).
export function difficultyReviewItems(scored) {
	if (!scored || scored.degraded) return [];
	const entries = Object.entries(scored.use_cases).filter(
		([, d]) => !d.degraded && typeof d.impact_count === 'number',
	);
	if (!entries.length) return [];
	// scope-상대 outlier 임계 — impact_count 내림차순 상위 ceil(n * ratio) 번째 값 (최소 1 / 동률 포함).
	const sorted = [...entries].sort((a, b) => b[1].impact_count - a[1].impact_count);
	const topN = Math.max(1, Math.ceil(sorted.length * OUTLIER_TOP_RATIO));
	const outlierThreshold = sorted[topN - 1][1].impact_count;
	const items = [];
	for (const [id, d] of entries) {
		// scope 상대 상위(outlier) AND 절대 L 급 — 둘 다 충족 시만 검토권장 (noise 최소화).
		if (d.impact_count < outlierThreshold || d.bucket !== 'L') continue;
		items.push({
			id,
			kind: 'difficulty',
			text: `${id} 영향 규모 상위 (${d.impact_count}노드 / MUST ${d.must_count}) — 분해/순서 검토 권장.`,
		});
	}
	// 결정성 — id 정렬
	items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
	return items;
}

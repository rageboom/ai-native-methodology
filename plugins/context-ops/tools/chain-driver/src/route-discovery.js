// route-discovery.js — living-sync Phase 1b 의미 라우터 결정론 코어 (DEC §5 Phase 1b).
//
// 역할: discovery-spec 의 **명시 매핑**(use_cases[].id / business_rules_intent[].br_id)을
//   그래프 진입 origins 로 변환. 의미 판정(NL→discovery-spec)은 LLM skill(discovery-from-nl-md / 밖).
//   본 코어 = 그 명시 매핑의 **결정론 라우팅**만 (§3.4 경계: LLM 제안 / 도구·validator 결정론 / 사람 gate#1).
//
// 순수: fs / state / LLM / 시간 의존 0 (trust 가드). gate 평가 토큰 0 — gate 판정은 cli glue·별도 gate 단계 소관.
//
// 정정(Senior REVISE@0.86):
//   #1 br_id 매칭 = normalizeAnalysisBusinessRules (validator 동형 / 4-shape) — loadBusinessRules(strict canonical-only) ❌.
//   #3 BR origin = br_id→BC 자식 analysis-business-rules-<BC>(정밀 / S1) / 자식 부재 시 부모 coarse fallback = soft edge → closure SHOULD/notify-only (full 하향=fixpoint 재진입 / deferred).
//   #4 discovery UC 가 노드보다 fine → net_new (counts 로 loud 보고 / cli 가 0-origin=propose-only exit 0).

import { normalizeAnalysisBusinessRules } from '../../_shared/load-business-rules.js';

/**
 * discovery-spec 명시 매핑 → 진입 origins + net-new (결정론).
 * @param {object} discoverySpec discovery-spec.json
 * @param {object} graph artifact-graph.json
 * @param {object|null} analysis analysis business-rules 산출물 (br_id content 매칭용)
 * @returns {{ origins:string[], net_new:Array, diagnostics:Array, counts:object }}
 */
export function resolveDiscoveryOrigins(discoverySpec, graph, analysis) {
	const nodes = graph?.nodes ?? [];
	const nodeIds = new Set(nodes.map((n) => n.id));
	// business-rules = 부모 file-level coarse 노드. 정확 id 로 핀 (F-M1 / Senior REVISE@0.88).
	//   Phase 4 additive 가 자식 analysis-business-rules-<BC> 를 추가하므로 .find(subkind=business-rules) 는
	//   push 순서에 따라 자식을 바인딩할 fragility 가 있음 → 부모 id 직접.
	//   brNode = S1 dispatch 의 fallback(자식 부재/BC 없음 시 / 아래 매칭 분기 3-tier).
	const brNode = nodes.find((n) => n.id === 'analysis-business-rules');

	const useCases = discoverySpec?.use_cases ?? [];
	const brIntent = discoverySpec?.business_rules_intent ?? [];

	const origins = new Set();
	const net_new = []; // {ref, kind, reason}
	const diagnostics = [];

	// UC: discovery use_case id ↔ 그래프 노드 id 직접 매칭. miss = net-new(신규 또는 노드보다 fine / #4).
	for (const uc of useCases) {
		if (!uc?.id) continue;
		if (nodeIds.has(uc.id)) origins.add(uc.id);
		else
			net_new.push({
				ref: uc.id,
				kind: 'use_case',
				reason:
					'그래프에 매칭 UC 노드 없음 (net-new 또는 노드보다 fine-grained — 사람 gate#1 확인)',
			});
	}

	// BR: br_id ↔ analysis business-rules content 매칭 (normalizeAnalysisBusinessRules / validator 동형 / #1).
	const { rules: analysisBrList, unrecognizedShape } =
		normalizeAnalysisBusinessRules(analysis);
	const analysisBrIds = new Set(analysisBrList.map((br) => br.id));
	// S1: br_id → bounded_context 인덱스(analysisBrList 재사용 / 재-normalize ❌ / 빈 BC skip).
	//   per-BC 자식 노드(analysis-business-rules-<BC>) 직접 라우팅용 (Phase 4 v0.12.0 additive 노드).
	const brIdToBC = new Map();
	for (const br of analysisBrList) {
		if (br?.id && typeof br.bounded_context === 'string' && br.bounded_context.length > 0) {
			brIdToBC.set(br.id, br.bounded_context);
		}
	}
	if (unrecognizedShape && brIntent.length > 0) {
		diagnostics.push({
			kind: 'br_source.shape_unrecognized',
			severity: 'high',
			message:
				'analysis business-rules 가 알려진 shape 로 0건 추출(container present) — shape/경로 확인 (전건 net-new 오탐 억제 / validator 동형)',
		});
	}
	for (const intent of brIntent) {
		if (!intent?.br_id) continue;
		if (!unrecognizedShape && analysisBrIds.has(intent.br_id)) {
			// S1 3-tier: (1) br_id→BC 자식 노드 = 정밀 origin / (2) 자식 부재(BC 없음·미재합성 graph) → 부모 coarse fallback(무회귀 / closure soft/SHOULD #3) / (3) 둘 다 부재 → net-new.
			const bc = brIdToBC.get(intent.br_id);
			const childId = bc ? `analysis-business-rules-${bc}` : null;
			if (childId && nodeIds.has(childId)) origins.add(childId);
			else if (brNode) origins.add(brNode.id);
			else
				net_new.push({
					ref: intent.br_id,
					kind: 'business_rule',
					reason:
						'br 가 analysis content 엔 있으나 analysis-business-rules 그래프 노드 부재',
				});
		} else {
			net_new.push({
				ref: intent.br_id,
				kind: 'business_rule',
				reason: unrecognizedShape
					? 'analysis shape 미인식'
					: 'unknown_br (analysis business-rules content 에 없음)',
			});
		}
	}

	return {
		origins: [...origins].sort(),
		net_new,
		diagnostics,
		counts: {
			uc_total: useCases.length,
			br_total: brIntent.length,
			origins: origins.size,
			net_new: net_new.length,
		},
	};
}

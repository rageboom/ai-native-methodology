// triage.js — discovery fast-path 복잡도 triage 결정론 신호 (DEC-2026-06-24-complexity-tier-fastpath).
//
// 역할: 변경이 닿는 그래프 노드 집합(touched refs)에 대해 **raw 결정론 신호만** 산출.
//   tier 판정(trivial/standard/deep)은 본 도구가 하지 않는다 — skill 제안 + 사람 gate#1 소관
//   (feedback_chain_driver_deterministic_axis STRONG-STOP / §3.4 경계: 도구=결정론 신호 / skill=의미 / 사람=확인).
//   predicate_satisfied 는 "보수적 trivial 적격 술어"의 결정론 평가 결과(사실)일 뿐 tier 배정이 아니다 —
//   true 라도 standard/deep 일 수 있고(skill 판단), false 면 trivial 절대 불가(하드 가드).
//
// 순수: fs / state / LLM / 시간 의존 0 (trust 가드). change_kind(LLM 선언값)는 입력으로 받지 않는다
//   (LLM 의미가 결정론 축에 스며드는 것 차단 / Senior Q3 — 일방향 skill→record, tool 은 그래프만).

// deny-list: 닿는 노드가 BR/UC 면 절대 trivial 불가 (선언 change_kind 무관 / Senior Q1).
//   subkind 'UC' = discovery use-case / 'BR'·'business_rule' = 비즈니스 규칙.
const DENY_SUBKINDS = new Set(['UC', 'BR', 'business_rule']);

/**
 * 변경이 닿는 노드들에 대한 결정론 triage 신호 산출 (순수).
 * @param {Object} graph        artifact-graph.json (nodes[] 보유)
 * @param {string[]} touchedRefs 변경이 닿는 노드 id (route-discovery origins / LLM 제안)
 * @returns {{touched_node_count:number, net_new:boolean, layer_span:number,
 *           touched_subkinds:string[], predicate_satisfied:boolean}} change-record.schema triage_signals 정합
 */
export function computeTriageSignals(graph, touchedRefs) {
	const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
	const byId = new Map(nodes.map((n) => [n.id, n]));
	// dedupe — 같은 노드 중복 참조가 count 를 부풀리지 않게.
	const refs = Array.isArray(touchedRefs) ? [...new Set(touchedRefs)] : [];

	const touched_node_count = refs.length;
	const matched = refs.map((r) => byId.get(r)).filter(Boolean);
	// net_new = 그래프에 없는 ref 가 하나라도 있음 (신규 노드 생성 = trivial 부적격 신호).
	const net_new = refs.some((r) => !byId.has(r));

	// layer_span = 닿는 (매칭된) 노드가 가로지르는 distinct layer 수. layer 미표기 노드는
	//   subkind 로 대체 키 (단일 레이어 판정이 과하게 통과되지 않게). 매칭 0건 = 0.
	const layers = new Set(
		matched.map((n) =>
			typeof n.layer === 'string' && n.layer.length > 0
				? `layer:${n.layer}`
				: `subkind:${n.artifact_subkind ?? '?'}`,
		),
	);
	const layer_span = matched.length ? layers.size : 0;

	const touched_subkinds = [
		...new Set(matched.map((n) => n.artifact_subkind).filter(Boolean)),
	].sort();

	// deny-list: subkind ∈ {UC,BR,business_rule} 또는 business_rule_id 보유 노드 = 절대 trivial 불가.
	const denyListHit = matched.some(
		(n) =>
			DENY_SUBKINDS.has(n.artifact_subkind) ||
			(typeof n.business_rule_id === 'string' &&
				n.business_rule_id.length > 0),
	);

	// 보수적 conjunctive 술어 (Senior Q1) — 모두 참일 때만 trivial 적격(necessary, not sufficient).
	const predicate_satisfied =
		touched_node_count === 1 &&
		net_new === false &&
		layer_span === 1 &&
		!denyListHit;

	return {
		touched_node_count,
		net_new,
		layer_span,
		touched_subkinds,
		predicate_satisfied,
	};
}

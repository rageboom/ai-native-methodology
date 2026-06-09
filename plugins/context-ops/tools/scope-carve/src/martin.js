// martin.js — Martin 컴포넌트 메트릭 (Ca/Ce/I). 완전 결정론 (순수 산술).
//
// 신호 #2 (research-reverse-engineering-carve.md §2 / DEC-2026-06-09-scope-carve-3signal §2.1·§2.4):
//   Ca(afferent) = 들어오는 의존 / Ce(efferent) = 나가는 의존 / I = Ce/(Ca+Ce).
//   role: sink(Ca=0·Ce>0 = 깨끗 추출) / hub(Ca≥임계 = shared kernel, 쪼개면 파편화) / unstable(I≥임계).
//
// A(abstractness)·D(distance) abstain (no-simulation):
//   A = module 별 abstract/concrete 타입 카운트 필요 → architecture.json 입력 부재. layer enum 으로 추정 =
//   measured fact 제시 = no-simulation 위반 → null + not_computable. D=|A+I−1| 도 A 부재로 환원 불가.
//
// double-count 회피: distinct module→module edge 만 카운트(weight 합산 ❌ — weight=참조 빈도 ≠ import 수 /
//   asset-map gotcha). self-dep 무시.

const EDGE_SEP = String.fromCharCode(31); // unit separator — module id 에 안 나타나는 문자 (edge dedup key)

function round4(x) {
	return Math.round(x * 10000) / 10000;
}

export function martinMetrics({ nodes, edges, thresholds }) {
	const nodeList = [...new Set(nodes)].sort();
	const known = new Set(nodeList);
	const ca = new Map(nodeList.map((n) => [n, 0]));
	const ce = new Map(nodeList.map((n) => [n, 0]));
	const seen = new Set();

	for (const e of edges) {
		if (!e || !known.has(e.from) || !known.has(e.to)) continue;
		if (e.from === e.to) continue;
		const key = e.from + EDGE_SEP + e.to;
		if (seen.has(key)) continue;
		seen.add(key);
		ce.set(e.from, ce.get(e.from) + 1);
		ca.set(e.to, ca.get(e.to) + 1);
	}

	return nodeList.map((n) => {
		const a = ca.get(n);
		const c = ce.get(n);
		const total = a + c;
		const i = total === 0 ? null : round4(c / total);
		let role;
		if (total === 0) role = 'isolated';
		else if (a >= thresholds.hub_afferent) role = 'hub';
		else if (a === 0 && c > 0) role = 'sink';
		else if (i !== null && i >= thresholds.unstable_instability) role = 'unstable';
		else role = 'balanced';
		return {
			module_id: n,
			afferent: a,
			efferent: c,
			instability: i,
			abstractness: null,
			distance: null,
			abstractness_status: 'not_computable',
			role,
		};
	});
}

// layout.js — 단계별 계층(layered) DAG 배치 메타 (순수 / 픽셀 계산은 프론트엔드).
//   x = stage column (UC→BHV→AC→TASK→TC→IMPL→code/contract 좌→우 고정).
//   y = lane(밴드) × row(같은 lane+column 내 결정론 정렬 순번).
//   체인 column 순서는 trace-view.js 의 CHAIN_LEAF_COLUMNS(BHV,AC,TASK,TC,IMPL) 정합 + UC 머리.

// chain subkind → column index
const STAGE_COLUMN = Object.freeze({
	UC: 0,
	BHV: 1,
	AC: 2,
	TASK: 3,
	TC: 4,
	IMPL: 5,
});
const CODE_COLUMN = 6; // code 파일 leaf
const CONTRACT_COLUMN = 7; // openapi 계약(API 엔드포인트) — 코드와 분리 표기
const SYMBOL_COLUMN = 8; // 함수·메서드 심볼 (코드 더 오른쪽 / codegraph)

// plan subkind → 자신이 묶는 대상 근처 column (조직 노드)
const PLAN_COLUMN = Object.freeze({
	EPIC: 0, // 화면(FE) — 좌측
	STORY: 2, // BHV/AC cross-cut 근처
	OP: 3, // TASK(운영) 근처
});

// 사람-눈 column 헤더 (프론트 렌더용)
export const COLUMN_LABELS = Object.freeze([
	'UC',
	'BHV',
	'AC',
	'TASK',
	'TC',
	'IMPL',
	'code',
	'contract',
	'symbol',
]);

// lane(세로 밴드) 순서 — 위→아래. main = chain+code, plan 위, analysis/aspect 아래.
export const LANE_ORDER = Object.freeze(['plan', 'main', 'analysis', 'aspect']);

export function columnOf(node) {
	const sk = node?.artifact_subkind;
	if (sk && sk in STAGE_COLUMN) return STAGE_COLUMN[sk];
	const kind = node?.artifact_kind;
	if (kind === 'symbol') return SYMBOL_COLUMN;
	if (kind === 'contract') return CONTRACT_COLUMN;
	if (kind === 'code') return CODE_COLUMN;
	if (kind === 'plan') return PLAN_COLUMN[sk] ?? 0;
	return 0; // analysis / aspect / 미지 → 좌측 정렬
}

export function laneOf(node) {
	const kind = node?.artifact_kind;
	if (kind === 'plan') return 'plan';
	if (kind === 'analysis') return 'analysis';
	if (kind === 'aspect') return 'aspect';
	return 'main'; // chain + code + contract
}

/**
 * 노드별 배치 메타 산정 (결정론).
 *   row 정렬 = barycenter heuristic — 자식을 부모(이전 컬럼)들의 평균 row 근처로 모아 교차선을 줄이고
 *   "한 부모의 자식들이 흩어지지 않고 인접" 하게 한다 (layered DAG 가독성). 부모가 없으면 id 정렬로 tie-break.
 *   edges 미제공 시 = 순수 id 정렬 (이전 동작 / 하위호환).
 * @param {Array} nodes
 * @param {Array} [edges]  {source,target} (문자열 id 또는 {id})
 * @returns {Map<string,{column:number,lane:string,row:number}>}
 */
export function computeLayout(nodes, edges = []) {
	const meta = new Map();
	const valid = [...(nodes ?? [])].filter((n) => n && typeof n.id === 'string');
	if (!valid.length) return meta;

	const col = new Map();
	const lane = new Map();
	for (const n of valid) {
		col.set(n.id, columnOf(n));
		lane.set(n.id, laneOf(n));
	}

	// forward 부모 관계 — 엣지 두 끝 중 더 이른(작은) 컬럼이 부모, 늦은 컬럼이 자식. 같은 컬럼은 무시.
	const idOf = (x) => (x != null && typeof x === 'object' ? x.id : x);
	const parents = new Map(); // childId → [parentId...]
	for (const e of edges ?? []) {
		const s = idOf(e?.source);
		const t = idOf(e?.target);
		if (!col.has(s) || !col.has(t)) continue;
		const cs = col.get(s);
		const ct = col.get(t);
		if (cs === ct) continue;
		const parent = cs < ct ? s : t;
		const child = cs < ct ? t : s;
		(parents.get(child) ?? parents.set(child, []).get(child)).push(parent);
	}

	// lane × column 버킷
	const bucket = new Map(); // `${lane}|${column}` → [id...]
	for (const n of valid) {
		const k = `${lane.get(n.id)}|${col.get(n.id)}`;
		(bucket.get(k) ?? bucket.set(k, []).get(k)).push(n.id);
	}

	// lane 은 LANE_ORDER 순서(plan→main→analysis→aspect)로, 각 lane 의 컬럼은 좌→우로 처리.
	//   → 이전 컬럼 row 가 먼저 확정되어 barycenter 입력이 됨.
	const row = new Map();
	const laneSeq = LANE_ORDER.filter((ln) => valid.some((n) => lane.get(n.id) === ln));
	for (const ln of laneSeq) {
		const cols = [
			...new Set(
				valid.filter((n) => lane.get(n.id) === ln).map((n) => col.get(n.id)),
			),
		].sort((a, b) => a - b);
		for (const c of cols) {
			const ids = bucket.get(`${ln}|${c}`) ?? [];
			const bary = (id) => {
				const ps = (parents.get(id) ?? []).filter((p) => row.has(p));
				if (!ps.length) return Number.POSITIVE_INFINITY; // 부모 없음 → id 순으로 뒤에
				return ps.reduce((sum, p) => sum + row.get(p), 0) / ps.length;
			};
			ids.sort((a, b) => {
				const ba = bary(a);
				const bb = bary(b);
				if (ba !== bb) return ba - bb;
				return a.localeCompare(b);
			});
			ids.forEach((id, i) => row.set(id, i));
		}
	}

	for (const n of valid) {
		meta.set(n.id, {
			column: col.get(n.id),
			lane: lane.get(n.id),
			row: row.get(n.id) ?? 0,
		});
	}
	return meta;
}

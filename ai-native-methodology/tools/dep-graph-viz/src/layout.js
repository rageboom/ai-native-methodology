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
const LEAF_COLUMN = 6; // code / contract leaf (체인 끝 오른쪽)

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
	'code/contract',
]);

// lane(세로 밴드) 순서 — 위→아래. main = chain+code, plan 위, analysis/aspect 아래.
export const LANE_ORDER = Object.freeze(['plan', 'main', 'analysis', 'aspect']);

export function columnOf(node) {
	const sk = node?.artifact_subkind;
	if (sk && sk in STAGE_COLUMN) return STAGE_COLUMN[sk];
	const kind = node?.artifact_kind;
	if (kind === 'code' || kind === 'contract') return LEAF_COLUMN;
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
 * 노드별 배치 메타 산정 (결정론 — id 정렬 tie-break).
 * @param {Array} nodes
 * @returns {Map<string,{column:number,lane:string,row:number}>}
 */
export function computeLayout(nodes) {
	const meta = new Map();
	const rowCursor = new Map(); // `${lane}|${column}` → 다음 row
	const sorted = [...(nodes ?? [])]
		.filter((n) => n && typeof n.id === 'string')
		.sort((a, b) => a.id.localeCompare(b.id));
	for (const n of sorted) {
		const column = columnOf(n);
		const lane = laneOf(n);
		const key = `${lane}|${column}`;
		const row = rowCursor.get(key) ?? 0;
		rowCursor.set(key, row + 1);
		meta.set(n.id, { column, lane, row });
	}
	return meta;
}

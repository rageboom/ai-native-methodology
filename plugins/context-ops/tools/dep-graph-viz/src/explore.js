// explore.js — dep-graph-viz 드릴다운/색상 순수 로직 (DOM·d3 무의존 / 단위 테스트 대상).
//   app.js(인라인)와 test 가 공유한다. emit.js 가 algo 로 인라인하므로 export 는 무해
//   (layout.js 와 동일 패턴 — module <script> 안 인라인).
//   ※ 이 4개 함수는 전부 순수(입력→출력)라 결정론 단위 테스트로 회귀 방지.

// 노드 색 — 단계(subkind) 우선, 없으면 kind, 둘 다 없으면 fallback.
//   (chain 노드가 전부 한 색이던 문제 해소. 자기참조 무한루프 회귀 방지 — colorOf 테스트가 잡음.)
export function colorOf(node, stageColor, kindColor, fallback = '#6b7280') {
	return (
		stageColor?.[node?.artifact_subkind] ||
		kindColor?.[node?.artifact_kind] ||
		fallback
	);
}

// forward 부모/자식 관계 — 엣지 두 끝 중 더 이른(작은) 컬럼이 부모, 늦은 컬럼이 자식.
//   columnOf(id)->number|null, idOf(端)->id, skipEdge(edge)->true 면 제외(예: contains/calls 심볼 엣지).
//   같은 컬럼 / 컬럼 미상 엣지는 무시 → childrenOf 는 컬럼 단조증가 = 비순환(트리화 안전).
export function chainRelations(edges, columnOf, idOf, skipEdge = () => false) {
	const childrenOf = new Map();
	const parentsOf = new Map();
	for (const e of edges ?? []) {
		if (skipEdge(e)) continue;
		const s = idOf(e.source);
		const t = idOf(e.target);
		const cs = columnOf(s);
		const ct = columnOf(t);
		if (cs == null || ct == null || cs === ct) continue;
		const p = cs < ct ? s : t;
		const c = cs < ct ? t : s;
		(childrenOf.get(p) ?? childrenOf.set(p, []).get(p)).push(c);
		(parentsOf.get(c) ?? parentsOf.set(c, []).get(c)).push(p);
	}
	return { childrenOf, parentsOf };
}

// 드릴다운 가시 집합 — roots 부터 expanded 노드의 자식만 BFS 로 펼침.
export function exploreVisibleSet(roots, expanded, childrenOf) {
	const vis = new Set();
	const q = [...roots];
	q.forEach((id) => vis.add(id));
	for (let i = 0; i < q.length; i++) {
		const id = q[i];
		if (!expanded.has(id)) continue;
		for (const c of childrenOf.get(id) || []) {
			if (!vis.has(c)) {
				vis.add(c);
				q.push(c);
			}
		}
	}
	return vis;
}

// tidy-tree row 배정 — 각 서브트리가 겹치지 않는 자기 세로 영역을 보장받고, 부모는 자식들 정중앙.
//   DAG → 첫 가시 부모에 귀속(claimed)해 트리화. 후위순회 leaf 순번 → 서브트리당 연속 slot 블록 = 영역 보장.
//   roots 사이 gap 행 만큼 여백(영역 구분 시인성). 반환: id → row(실수).
export function tidyTreeRows(roots, expanded, childrenOf, visibleSet, gap = 0.7) {
	const cmp = (a, b) => String(a).localeCompare(String(b));
	const sortedRoots = [...roots].filter((id) => visibleSet.has(id)).sort(cmp);
	const childMap = new Map();
	const claimed = new Set(sortedRoots);
	const queue = [...sortedRoots];
	for (let i = 0; i < queue.length; i++) {
		const id = queue[i];
		if (!expanded.has(id)) continue;
		const kids = (childrenOf.get(id) || [])
			.filter((c) => visibleSet.has(c) && !claimed.has(c))
			.sort(cmp);
		for (const c of kids) {
			claimed.add(c);
			(childMap.get(id) ?? childMap.set(id, []).get(id)).push(c);
			queue.push(c);
		}
	}
	const row = new Map();
	let cursor = 0;
	const assign = (id) => {
		const kids = childMap.get(id) || [];
		if (!kids.length) {
			row.set(id, cursor++);
			return;
		}
		kids.forEach(assign);
		row.set(id, (row.get(kids[0]) + row.get(kids[kids.length - 1])) / 2);
	};
	for (const r of sortedRoots) {
		assign(r);
		cursor += gap;
	}
	return row;
}

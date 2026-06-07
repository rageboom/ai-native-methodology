// sync-loop.js — living-sync 전파 루프 순수 코어 (Phase 1 MVP / DEC-2026-06-07-living-sync-operating-model)
//
// 역할: 변경된 origin 에서 **forward 단방향** 영향 closure 를 계산해 순서화된 재생성 worklist 를 산출.
//   - 순수 함수 (fs / state / LLM / 시간 의존 0). generated_at 등 부작용은 cli glue 가 부여.
//   - 결정론 경계(no-simulation): "어느 노드가 영향받나" = 그래프 reachability (LLM ❌). 재생성(내용)은 본 코어 밖.
//   - reference-lens: 어떤 gate 도 본 모듈 출력을 읽지 않는다 (trust 가드 test).
//
// 정책(§2.0): 정상 전파 = forward 단방향. analyzeImpact 기본이 양방향이므로 반드시 includeBackward:false.

import { analyzeImpact } from './impact-analyzer.js';
import { topologicalOrder, cascadeOrder } from './propagation-orderer.js';

// 노드 subkind → chain stage (worklist 의 재생성 진입 stage). analysis 류는 'analysis'.
export const SUBKIND_TO_STAGE = Object.freeze({
	UC: 'discovery',
	BHV: 'spec',
	AC: 'spec',
	TASK: 'plan',
	TC: 'test',
	IMPL: 'implement',
});

const GRADE_RANK = Object.freeze({ MUST: 3, SHOULD: 2, FYI: 1 });

function maxGrade(a, b) {
	if (!a) return b;
	if (!b) return a;
	return (GRADE_RANK[a] ?? 0) >= (GRADE_RANK[b] ?? 0) ? a : b;
}

// 경로 정규화 — win32 backslash → posix, 선행 ./ 제거.
function normPath(p) {
	return String(p || '')
		.replace(/\\/g, '/')
		.replace(/^\.\//, '');
}

// 한쪽이 다른 쪽의 '/' 경계 suffix 인가 (abs vs repo-rel 허용).
function pathMatch(a, b) {
	const na = normPath(a);
	const nb = normPath(b);
	if (!na || !nb) return false;
	if (na === nb) return true;
	if (na.endsWith('/' + nb) || nb.endsWith('/' + na)) return true;
	return false;
}

function stageOf(node) {
	if (!node) return null;
	if (node.artifact_kind === 'analysis') return 'analysis';
	return SUBKIND_TO_STAGE[node.artifact_subkind] ?? null;
}

/**
 * 변경 파일 경로 → origin 노드 id 집합 (결정론).
 *   - 산출물 파일: node.source_path 매치.
 *   - 코드 파일: node.code_pointers[].path 매치 (= 코드의 직접 주인 노드 / origin 탐색만 / 전파는 forward).
 * @returns {{ ids: string[], unresolved: string[] }}
 */
export function resolveOriginNodeIds(graph, changedPaths = []) {
	const nodes = graph?.nodes ?? [];
	const ids = new Set();
	const unresolved = [];
	for (const raw of changedPaths) {
		let hit = false;
		for (const n of nodes) {
			if (n?.source_path && pathMatch(n.source_path, raw)) {
				ids.add(n.id);
				hit = true;
			}
		}
		if (!hit) {
			for (const n of nodes) {
				for (const cp of n?.code_pointers ?? []) {
					if (cp?.path && pathMatch(cp.path, raw)) {
						ids.add(n.id);
						hit = true;
					}
				}
			}
		}
		if (!hit) unresolved.push(raw);
	}
	return { ids: [...ids].sort(), unresolved };
}

/**
 * forward 영향 closure + 순서화된 재생성 worklist 계산 (순수).
 * @param {object} graph artifact-graph
 * @param {object} opts { origins?: string[], changedPaths?: string[] }
 * @returns {{ origins, unresolved, closure:{MUST,SHOULD,FYI}, has_cycle, items }}
 */
export function computeSyncLoop(graph, opts = {}) {
	const nodes = graph?.nodes ?? [];
	const nodeById = new Map(nodes.map((n) => [n.id, n]));
	const explicit = (opts.origins ?? []).slice();
	const { ids: fromPaths, unresolved: unresolvedPaths } = resolveOriginNodeIds(
		graph,
		opts.changedPaths ?? [],
	);

	// origin 후보 = 명시 + 경로해소. 그래프 부재 id 는 unresolved.
	const originSet = new Set();
	const unresolved = [...unresolvedPaths];
	for (const id of [...explicit, ...fromPaths]) {
		if (nodeById.has(id)) originSet.add(id);
		else unresolved.push(id);
	}
	const origins = [...originSet].sort();

	// 각 origin 에서 forward-only BFS → id→maxGrade 병합 (origin 자신 제외).
	const closureGrade = new Map();
	for (const origin of origins) {
		const impact = analyzeImpact(graph, origin, {
			includeForward: true,
			includeBackward: false, // ★ 정책 §2.0 forward 단방향 (analyzeImpact 기본 양방향 override)
			nonTraversableStates: ['propose'],
		});
		for (const e of impact.merged) {
			if (originSet.has(e.id)) continue;
			closureGrade.set(e.id, maxGrade(closureGrade.get(e.id), e.grade));
		}
	}

	const closure = { MUST: [], SHOULD: [], FYI: [] };
	for (const [id, grade] of closureGrade) {
		if (closure[grade]) closure[grade].push(id);
	}
	for (const g of Object.keys(closure)) closure[g].sort();

	// 순서: topological → cascade. has_cycle 신호 전달.
	const topo = topologicalOrder(graph, { nonTraversableStates: ['propose'] });
	const allIds = [...new Set([...origins, ...closureGrade.keys()])];
	const ordered = cascadeOrder(allIds, topo.order);

	const items = ordered.map((id) => {
		const node = nodeById.get(id);
		const isOrigin = originSet.has(id);
		return {
			id,
			grade: isOrigin ? 'MUST' : (closureGrade.get(id) ?? 'FYI'),
			stage: stageOf(node),
			subkind: node?.artifact_subkind ?? null,
			origin: isOrigin,
			done: false,
		};
	});

	return { origins, unresolved, closure, has_cycle: topo.has_cycle, items };
}

/**
 * (--mark only) in-memory 로 origin+closure 노드를 active→drift 표시 (display-only / 영속 ❌ 기본).
 *   graph 를 in-place mutate. drift 는 파생값이므로 durable write 는 호출자 책임(기본 안 함).
 */
export function markTransientDrift(graph, ids) {
	const want = new Set(ids);
	let applied = 0;
	for (const n of graph?.nodes ?? []) {
		if (want.has(n.id) && n.state === 'active') {
			n.state = 'drift';
			n.drift_reason = 'living-sync forward propagation (transient / not persisted)';
			applied++;
		}
	}
	return { applied };
}

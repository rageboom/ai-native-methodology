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

// C-lite (DEC-2026-06-08-living-sync-adopter-git-hygiene) — chain-driver 자기 파생/상태 산출물인가.
//   --git 재검출은 변경 tracked 파일 전체를 스캔 → 도구가 .ai-context/ 에 쓰는 파생물(artifact-graph 등 = do_not_edit_manually)이
//   커밋돼 있으면 노드 미매핑 → false-unresolved noise. 노드 미매핑 + 본 패턴이면 skip (진짜 새 구조 파일은 unresolved 유지).
//   ★ .ai-context/ prefix 한정 (bare basename ❌ — 레포 밖 동명 산출물 오skip 방지 / Senior MINOR-Q1).
const AICONTEXT_DERIVED_BASENAMES = new Set([
	'state.json',
	'state.json.tmp',
	'artifact-graph.json',
	'matrix.json',
	'context-cache.json',
	'intervention-log.jsonl',
]);
function isAiContextDerivedOutput(rawPath) {
	const np = normPath(rawPath);
	const underAimd = np === '.ai-context' || np.startsWith('.ai-context/') || np.includes('/.ai-context/');
	if (!underAimd) return false;
	const base = np.split('/').pop() || '';
	if (AICONTEXT_DERIVED_BASENAMES.has(base)) return true;
	return /^findings-[^/]*\.json$/.test(base); // findings-discovery.json / findings-spec.json …
}

/**
 * 변경 파일 경로 → origin 노드 id 집합 (결정론).
 *   - 산출물 파일: node.source_path 매치.
 *   - 코드 파일: node.code_pointers[].path 매치 (= 코드의 직접 주인 노드 / origin 탐색만 / 전파는 forward).
 *   - opts.skipDerivedNoise (opt-in / --git caller 전용): 노드 미매핑 + 도구 파생물(.ai-context/)이면 unresolved 에서 제외.
 *     lift(lift-anchor.js)·--changed(computeSyncLoop) 는 옵션 미전달 = 기존 동작 보존.
 * @returns {{ ids: string[], unresolved: string[], skipped_derived?: string[] }}
 */
export function resolveOriginNodeIds(graph, changedPaths = [], opts = {}) {
	const nodes = graph?.nodes ?? [];
	const ids = new Set();
	const unresolved = [];
	const skipped_derived = [];
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
		if (!hit) {
			if (opts.skipDerivedNoise && isAiContextDerivedOutput(raw)) skipped_derived.push(raw);
			else unresolved.push(raw);
		}
	}
	return { ids: [...ids].sort(), unresolved, skipped_derived: skipped_derived.sort() };
}

// living-sync carry 1 — 변경 rule id → per-BR origin (없으면 부모 coarse fallback / BLOCKER-1 fail-open / Senior@0.84).
//   변경 rule 절대 silent drop ❌: per-BR 노드 있으면 그것(정밀) / 없으면(BC-less rule) 부모 analysis-business-rules(coarse·sound) / BR 그래프 자체 부재만 unresolved.
export function resolveChangedRuleOrigins(graph, changedRuleIds = []) {
	const nodeIds = new Set((graph?.nodes ?? []).map((n) => n.id));
	const hasParent = nodeIds.has('analysis-business-rules');
	const origins = new Set();
	const coarse_fallback = [];
	const unresolved = [];
	for (const id of changedRuleIds) {
		const perBr = `analysis-business-rules-${id}`;
		if (nodeIds.has(perBr)) origins.add(perBr);
		else if (hasParent) { origins.add('analysis-business-rules'); coarse_fallback.push(id); }
		else unresolved.push(id);
	}
	return {
		origins: [...origins].sort(),
		coarse_fallback: coarse_fallback.sort(),
		unresolved: unresolved.sort(),
	};
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

// ── Phase 1c — regen_queue 소비 (루프 닫기 / DEC §5 Phase 1c) ──────────────
// 정정(Senior BLOCKER #1·MAJOR #2): gate 는 노드가 아니라 **stage 단위**다. 따라서 소비도 노드가 아니라
//   distinct stage 단위로 한다 — 워크리스트는 어느 stage 가 교란됐나·어느 노드가 바뀌었나·순서를 스케줄링하고,
//   검증은 기존 stage gate 를 그대로 재실행(cli glue). 본 코어 = gate 토큰·I/O·시간 0 (trust 가드 / §3.4 경계).

/**
 * 워크리스트에서 다음 소비할 stage 선택 (cascade 보존 = 첫 미완 item 의 stage / 위상 최선두 미완).
 *   같은 stage 의 미완 item 을 한 묶음으로 모은다 (gate 가 stage 단위이므로 함께 검증·done).
 * @returns {{ stage, item_ids:string[], grades:object, origins:string[] } | null} 미완 없으면 null
 */
export function selectNextStage(regenQueue) {
	const items = regenQueue?.items ?? [];
	const firstPending = items.find((it) => !it.done);
	if (!firstPending) return null;
	const stage = firstPending.stage;
	const group = items.filter((it) => !it.done && it.stage === stage);
	const grades = {};
	for (const it of group) grades[it.id] = it.grade;
	return {
		stage,
		item_ids: group.map((it) => it.id).sort(),
		grades,
		origins: group
			.filter((it) => it.origin)
			.map((it) => it.id)
			.sort(),
	};
}

/**
 * 한 stage 의 모든 미완 item 을 done 표시 (in-place 순수 transform — durable write 는 호출자 CAS).
 * @returns {{ marked: number }}
 */
export function markStageDone(regenQueue, stage) {
	let marked = 0;
	for (const it of regenQueue?.items ?? []) {
		if (!it.done && it.stage === stage) {
			it.done = true;
			marked++;
		}
	}
	return { marked };
}

/**
 * 워크리스트 진행 요약 (순수).
 * @returns {{ total, done, pending, complete:boolean }}
 */
export function queueStatus(regenQueue) {
	const items = regenQueue?.items ?? [];
	const done = items.filter((it) => it.done).length;
	return {
		total: items.length,
		done,
		pending: items.length - done,
		complete: items.length > 0 && done === items.length,
	};
}

// ── carry 2 — fixpoint 자동 재진입 / 수렴 원장 (DEC §23 carry2 / §33 fixpoint / §63 R1) ──────
// 정책: 도구는 **수렴-제어 half 만 결정론**으로 소유한다 — 재생성(LLM)·그래프 재합성(외부 flow)은 반복 사이.
//   가치 = cumulative_done dedup(§33 단조 → ping-pong 불가 → 종료) + iteration cap + non-converging finding.
//   ★ BLOCKER-1(Senior@0.80): 재합성 부재 상태의 fixpoint 선언 = 거짓 건강(P0 역행).
//     fixpoint 는 (newWork=∅) AND (graph fresh) AND (unresolved=∅) 3조건 동시일 때만. 미충족 = 강등(needs_resynth / unverified_fixpoint).

/**
 * 세션 done 노드 누적 (순수 transform — durable write 는 호출자 CAS).
 *   cumulative_done = 한 수렴 세션(고정 baseline)에서 이미 처리한 노드. 재시드 dedup 의 기준.
 * @returns {object} 갱신된 session (cumulative_done 정렬·dedup)
 */
export function recordCompleted(session, completedNodeIds = []) {
	const set = new Set(session?.cumulative_done ?? []);
	for (const id of completedNodeIds) if (id) set.add(id);
	return { ...(session || {}), cumulative_done: [...set].sort() };
}

/**
 * 수렴 결정 (순수 / BLOCKER-1 가드 인코딩).
 *   우선순위: newWork>0 → (cap 초과 non_converging / 아니면 continue) / newWork=∅ → fixpoint 가드.
 * @param {object} p
 * @param {string[]} p.detectedIds 재검출 영향 노드 (origins∪closure)
 * @param {string[]} p.unresolvedPaths --git 재검출 미해소 경로 (새 구조 파일 = 노드 미매핑)
 * @param {string[]} p.cumulativeDone 세션 누적 done
 * @param {number} p.iteration 현 iteration (1-base)
 * @param {number} p.cap iteration 상한
 * @param {boolean} p.graphStale checkGraphFreshness().stale
 * @param {boolean} p.freshnessVerifiable graph.derived_from 비어있지 않음 (freshness 가 no-op 아님)
 * @returns {{ status, newWork:string[], iteration, cap, reason?, unresolved? }}
 *   status ∈ fixpoint | continue | non_converging | needs_resynth | unverified_fixpoint
 */
export function convergenceDecision({
	detectedIds = [],
	unresolvedPaths = [],
	cumulativeDone = [],
	iteration = 1,
	cap = 10,
	graphStale = false,
	freshnessVerifiable = true,
} = {}) {
	const doneSet = new Set(cumulativeDone);
	const newWork = [...new Set(detectedIds)].filter((id) => !doneSet.has(id)).sort();

	if (newWork.length > 0) {
		if (iteration >= cap)
			return { status: 'non_converging', newWork, iteration, cap };
		return { status: 'continue', newWork, iteration, cap };
	}

	// newWork=∅ → fixpoint 후보. ★ BLOCKER-1 하드 전제 가드.
	const unresolved = [...new Set(unresolvedPaths)].sort();
	if (graphStale || unresolved.length > 0)
		return {
			status: 'needs_resynth',
			newWork: [],
			iteration,
			cap,
			reason: graphStale ? 'graph_stale' : 'unresolved_paths',
			unresolved,
		};
	if (!freshnessVerifiable)
		return { status: 'unverified_fixpoint', newWork: [], iteration, cap };
	return { status: 'fixpoint', newWork: [], iteration, cap };
}

/**
 * non-converging finding (promote-ready / 자동 promote ❌ = 사람 / graph.stale finding 형식 동형).
 */
export function nonConvergingFinding(decision) {
	return {
		kind: 'sync.non_converging',
		severity: 'high',
		message:
			`living-sync 수렴 실패 — iteration ${decision.iteration} 가 cap(${decision.cap}) 도달했으나 ` +
			`잔여 newWork ${decision.newWork.length}건: ${decision.newWork.slice(0, 5).join(', ')}` +
			`${decision.newWork.length > 5 ? ' …' : ''} (단조 위반 의심 / 그래프 cycle / 재생성 비수렴)`,
		iteration: decision.iteration,
		cap: decision.cap,
		residual_new_work: decision.newWork,
	};
}

// revisit-impact.js — revisit 의미적 근거 enrich + 평이 prompt 렌더 (결정론 / ADR-CHAIN-003 §3 / 갭1).
//   detectRevisit(revisit-detect.js)는 revisit_target/LOC/changed_paths 만 산출 → ADR §3 가 약속한
//   "영향 stages[from→to] + 영향 trace(UC/BHV/AC/TC/IMPL ID) + traceability 영향 cell 수"를 채운다.
//
//   신뢰/정책 (feedback_chain_driver_deterministic_axis 정합):
//   - 순수 결정론 — graph BFS(analyzeImpact) + 변경파일→노드 역해소(resolveOriginNodeIds). LLM 판단 0.
//   - detectRevisit 시그니처/반환 무변 (별도 enrich / 기존 revisit-detect.test.js 보존).
//   - graph 부재·변경파일 미매핑 시 degraded:true 정직 표기(날조 0).
//   - render 는 결정론 template (gate-summary.renderGateSummaryText 패턴 / 평이 톤 계승).
import { resolveOriginNodeIds } from './sync-loop.js';
import { analyzeImpact } from './impact-analyzer.js';

const LEAF_SUBKINDS = ['BHV', 'AC', 'TASK', 'TC', 'IMPL'];
const ALL_SUBKINDS = ['UC', ...LEAF_SUBKINDS];
const TRACE_ORDER = ['UC', 'BHV', 'AC', 'TASK', 'TC', 'IMPL'];

function emptyBuckets() {
	const b = {};
	for (const k of ALL_SUBKINDS) b[k] = [];
	return b;
}

// revisitResult(detectRevisit 출력) + graph + currentChain → 영향 ID 버킷 + cell 수 + stage_range 부착.
//   affected_cells = leaf(BHV/AC/TASK/TC/IMPL) 영향 노드 수 = traceability-matrix 영향 cell 근사(UC=row / leaf=교차 셀).
export function enrichRevisitImpact(revisitResult, graph, currentChain) {
	const target = revisitResult?.revisit_target ?? null;
	const stage_range = target
		? { from: currentChain ?? null, to: target }
		: null;

	// degrade — target 없음 / graph 부재.
	if (!target || !graph || !Array.isArray(graph.nodes)) {
		return {
			...revisitResult,
			impact: {
				degraded: true,
				reason: !target
					? 'revisit_target 없음 — 영향 분석 생략'
					: 'artifact-graph 부재 — 영향 ID/cell 미산출 (정직 표기)',
				affected_ids: emptyBuckets(),
				affected_cells: 0,
				stage_range,
			},
		};
	}

	const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
	const { ids: origins } = resolveOriginNodeIds(
		graph,
		revisitResult.changed_paths ?? [],
	);

	const affected = new Set();
	for (const oid of origins) {
		affected.add(oid);
		let imp;
		try {
			imp = analyzeImpact(graph, oid, { includeBackward: false });
		} catch {
			continue; // origin 미존재 등 — graceful
		}
		for (const f of imp.forward) affected.add(f.id);
	}

	const buckets = emptyBuckets();
	for (const id of affected) {
		const sk = nodeById.get(id)?.artifact_subkind;
		if (sk && sk in buckets) buckets[sk].push(id);
	}
	for (const k of Object.keys(buckets)) buckets[k].sort();

	const affected_cells = LEAF_SUBKINDS.reduce(
		(s, k) => s + buckets[k].length,
		0,
	);

	// 변경파일이 어떤 노드에도 미매핑 → 영향 0 은 정보가 아님(정직 degrade).
	const degraded = origins.length === 0;

	return {
		...revisitResult,
		impact: {
			degraded,
			reason: degraded
				? '변경 파일이 artifact-graph 노드에 미매핑 — 영향 ID 미산출 (정직 표기)'
				: null,
			affected_ids: buckets,
			affected_cells,
			stage_range,
		},
	};
}

// enriched → ADR-CHAIN-003 §3 형식 사람-눈 텍스트 (결정론 / 평이).
export function renderRevisitPrompt(enriched) {
	const im = enriched?.impact ?? {};
	const from = im.stage_range?.from ?? '?';
	const to = im.stage_range?.to ?? '?';
	const L = [];
	L.push(`👉 revisit 권고: ${from} → ${to} 되돌아가기?`);
	L.push(`■ 트리거: ${enriched?.reason ?? '(사유 미상)'}`);
	L.push(`■ 영향 stages: ${from} → ${to}`);
	if (im.degraded) {
		const files = (enriched?.changed_paths ?? []).join(', ') || '(없음)';
		L.push(`■ 영향 trace: (그래프 부재 — 영향 ID 미산출 / 변경파일: ${files})`);
	} else {
		const ids = TRACE_ORDER.flatMap((k) => im.affected_ids?.[k] ?? []);
		const traceStr = ids.length ? ids.join(' · ') : '(영향 없음)';
		L.push(`■ 영향 trace (요구사항→구현): ${traceStr} (${im.affected_cells}건)`);
		L.push(`■ traceability 영향 cell: ${im.affected_cells}`);
	}
	L.push(`결단: 1) revisit:${to}  2) 무시(기록)  3) abort`);
	return L.join('\n');
}

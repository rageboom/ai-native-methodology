// carve.js — 3신호 orchestrator + carve_candidates 합성 + reference-lens 산출물 조립.
//
// DEC-2026-06-09-scope-carve-3signal-reference-lens §2. 출력 = scope-carve.json
// (schemas/scope-carve.schema.json / reference-lens / NOT gate-injected).
//
// no-simulation: 모든 신호 = 진짜 결정론 계산 → evidence_trust=real_tool. result_hash = timestamp 제외
//   결정론 payload 의 sha256 (재현성 witness / 동일 입력·파라미터 → 동일 hash).

import { createHash } from 'node:crypto';
import { tarjanScc } from './scc.js';
import { martinMetrics } from './martin.js';
import { mineCoChange, DEFAULT_PATH_EXCLUDES } from './co-change.js';
import { computeHotspot } from './hotspot.js';

export const TOOL_VERSION = '0.1.0';

export const DEFAULT_PARAMS = {
	co_change: {
		min_support: 2,
		min_confidence: 0.5,
		window: null,
		max_transaction_size: 30,
		since: null,
		path_excludes: DEFAULT_PATH_EXCLUDES,
	},
	martin_thresholds: {
		unstable_instability: 0.7,
		hub_afferent: 3,
	},
	hotspot: {
		top_n: 15,
		min_churn: 3,
		tab_width: 4,
	},
};

const BEHAVIORAL_CLUSTER_CAP = 15;
const HOTSPOT_CANDIDATE_CAP = 5;

function sha256(s) {
	return createHash('sha256').update(s).digest('hex');
}

// 안정 직렬화 (키 정렬) — result_hash 결정성.
function stableStringify(value) {
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
	const keys = Object.keys(value).sort();
	return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

function synthesizeCandidates({ scc, martin, co, hotspot }) {
	const candidates = [];
	let idx = 0;

	// 1) atomic_unit — multi-node SCC (분할 불가 hard 제약)
	for (const comp of scc.components) {
		if (!comp.is_atomic) continue;
		candidates.push({
			index: idx++,
			kind: 'atomic_unit',
			members: comp.members,
			signals: ['scc'],
			rationale: `multi-node circular dependency (${comp.size} 모듈) — acyclic cut 으로 cycle 미분리 = 분할 불가. 함께 carve 하거나 cycle 먼저 해소.`,
			confidence_note:
				'구조 hard 제약(증명 가능). 의미·도메인 경계 확정은 soft gate #0 의 human.',
		});
	}

	// 2) clean_seam — Martin sink (Ca=0, Ce>0 = 깨끗 추출)
	for (const m of martin) {
		if (m.role !== 'sink') continue;
		candidates.push({
			index: idx++,
			kind: 'clean_seam',
			members: [m.module_id],
			signals: ['martin'],
			rationale: `sink (Ca=${m.afferent}, Ce=${m.efferent}, I=${m.instability}) — 아무도 의존하지 않음 → 깨끗 추출 가능.`,
			confidence_note:
				'구조 신호 한정(cohesion·도메인 의미 미포함). soft gate #0 human 확정.',
		});
	}

	// 3) hub_warning — Martin hub (Ca≥임계 = shared kernel, 쪼개면 파편화)
	for (const m of martin) {
		if (m.role !== 'hub') continue;
		candidates.push({
			index: idx++,
			kind: 'hub_warning',
			members: [m.module_id],
			signals: ['martin'],
			rationale: `hub (Ca=${m.afferent}, Ce=${m.efferent}) — 다수 모듈이 의존하는 shared kernel 근처. 쪼개면 다수 slice 파편화 → 경계 신중.`,
			confidence_note:
				'경고 신호(추출 회피 후보). soft gate #0 human 확정.',
		});
	}

	// 4) behavioral_cluster — co-change 강결합 파일쌍 (top N highlight / 전체는 co_change.pairs)
	const topPairs = co.pairs.slice(0, BEHAVIORAL_CLUSTER_CAP);
	for (const p of topPairs) {
		candidates.push({
			index: idx++,
			kind: 'behavioral_cluster',
			members: [p.a, p.b],
			signals: ['co_change'],
			rationale: `함께 변경 ${p.support}회 (conf ${p.confidence_a_given_b}/${p.confidence_b_given_a}) — 정적 그래프 비가시 결합 가능(config↔code / mapper↔DAO). 가르는 cut 은 leaky 후보.`,
			confidence_note:
				'행위-유래 신호(파일 단위). 파라미터 pin 후 재현 / soft gate #0 human 확정.',
		});
	}

	// 5) hotspot_priority — churn × complexity 상위 (우선순위 axis / 3 구조신호에 직교)
	const topHot = hotspot.items.slice(0, HOTSPOT_CANDIDATE_CAP);
	for (const h of topHot) {
		candidates.push({
			index: idx++,
			kind: 'hotspot_priority',
			members: [h.file],
			signals: ['hotspot'],
			rationale: `churn ${h.churn} × complexity ${h.complexity_total}(mean ${h.complexity_mean}) = score ${h.score} — 자주 변경 + 복잡 → 먼저 carve/격리/hardening 후보.`,
			confidence_note:
				'우선순위 신호(WHERE 아닌 WHICH-first). indentation-complexity proxy / soft gate #0 human 확정.',
		});
	}

	return {
		candidates,
		behavioral_truncated:
			co.pairs.length > BEHAVIORAL_CLUSTER_CAP
				? co.pairs.length - BEHAVIORAL_CLUSTER_CAP
				: 0,
	};
}

// architectureRaw = architecture.json 원본 문자열(inputs_hash 용) / architecture = 파싱 객체.
// nowIso / durationMs = CLI 가 주입(테스트 결정성).
export function buildCarve({
	architectureRaw,
	architecture,
	architecturePath,
	repoPath = null,
	gitRunner = null,
	readFileFn = null,
	params = DEFAULT_PARAMS,
	nowIso,
	durationMs = 0,
	reproductionCommand = '',
}) {
	const modules = (architecture.modules || []).map((m) => m.id);
	const edges = (architecture.dependencies || []).map((d) => ({
		from: d.from,
		to: d.to,
	}));

	const scc = tarjanScc({ nodes: modules, edges });
	scc.note =
		'multi-node SCC = 분할 불가 atomic (is_atomic=true). condensation_order = 의존 그래프 위상순서(A→B 면 A 먼저). 안전 증분 추출은 통상 leaf(가장 많이 의존되는 = 큰 topo_rank)부터 — 의미 경계는 soft gate #0 human.';

	const martin = martinMetrics({
		nodes: modules,
		edges,
		thresholds: params.martin_thresholds,
	});

	const co =
		repoPath && gitRunner
			? mineCoChange({ gitRunner, params: params.co_change })
			: {
					status: 'not_run',
					transactions_analyzed: 0,
					pairs: [],
					file_churn: {},
					note: 'repo_path 미지정 — co-change 미실행(SCC+Martin 만).',
				};

	// churn = co-change file_churn 재사용(단일 git 패스). co_change 블록 직렬화 전 분리(schema 정합).
	const fileChurn = co.file_churn || {};
	delete co.file_churn;

	// hotspot = churn × indentation-complexity (delta #4 / 우선순위 axis / 3 구조신호에 직교)
	const hotspot = computeHotspot({
		fileChurn,
		repoPath,
		readFileFn,
		params: params.hotspot,
		coChangeStatus: co.status,
	});

	const { candidates, behavioral_truncated } = synthesizeCandidates({
		scc,
		martin,
		co,
		hotspot,
	});
	if (behavioral_truncated > 0) {
		co.note += ` (carve_candidates behavioral_cluster 는 top ${BEHAVIORAL_CLUSTER_CAP} highlight — 전체 ${co.pairs.length} pair 는 co_change.pairs 참조 / ${behavioral_truncated} 추가 미표시.)`;
	}

	// 결정론 payload (timestamp 제외) → result_hash
	const payload = {
		scc,
		martin,
		co_change: co,
		hotspot,
		carve_candidates: candidates,
	};
	const resultHash = sha256(stableStringify(payload));
	const inputsHash = sha256(architectureRaw);

	return {
		meta: {
			schema: 'scope-carve.schema.json',
			generated_by: 'scope-carve',
			do_not_edit_manually: true,
			reference_lens: true,
			derived_from: [
				{
					tool: 'scope-carve',
					version: TOOL_VERSION,
					method:
						'Tarjan SCC + Martin Ca/Ce/I over architecture.json dependencies + hotspot churn×indentation-complexity',
				},
				{
					tool: 'git',
					version: null,
					method:
						'git log --no-merges --name-only (logical-coupling co-change mining + Tornhill churn)',
				},
			],
			trust_note:
				'reference-lens / NOT gate-injected (DEC-2026-05-28 §4.2). 어떤 결정적 gate 에도 inject ❌ — 사용자가 soft gate #0 에서 scope 확정. carve reference finding 은 _base-log-finding 으로 low|medium 만(gate blocker ❌).',
			generated_at: nowIso,
		},
		target: {
			architecture_path: architecturePath,
			repo_path: repoPath,
			module_count: modules.length,
			dependency_edge_count: edges.length,
		},
		params,
		scc,
		martin,
		co_change: co,
		hotspot,
		carve_candidates: candidates,
		evidence: {
			tool_version: TOOL_VERSION,
			invocation_timestamp: nowIso,
			duration_ms: durationMs,
			inputs_hash: inputsHash,
			result_hash: resultHash,
			reproduction_command: reproductionCommand,
			git_available: co.status === 'mined',
			evidence_trust: 'real_tool',
		},
	};
}

export { stableStringify };

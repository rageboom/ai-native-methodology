// lift-anchor.js — living-sync Phase 2 "lift" 순수 코어 (DEC §5 Phase 2 / forward-only 의 유일 reverse 예외).
//
// 역할: 손수정된 **코드 파일** → 주인(owner) 노드 anchor (결정론 / code_pointers path 매칭) →
//   backward 천장 후보 surface (사람 선택용 메뉴). forward 재전파(computeSyncLoop)·regen_queue write 는
//   cli glue 소관 — 그리고 **천장 = 사람 명시 only**(auto-climb ❌ / 없는 상위 의도 날조 회피 / DEC §2 예외 정책).
//
// 순수: fs / state / LLM / 시간 / git 의존 0 (trust 가드). 의미 천장 판정 = 사람.
// 정책 경계(§3.4): anchor·후보 enumeration = 결정론(그래프) / 천장 판정 = 사람 / 재생성 내용 = 본 코어 밖.
//
// Senior 적대검토(REVISE@0.83) 반영:
//   #1 기본 천장=IMPL 은 forward 빈 closure(IMPL=forward-leaf 실측) → cli 가 명시 --ceiling 없으면 surface-only.
//   #4 --ceiling 은 anchor 의 backward 조상 allowlist ∈ 검증(validateCeiling) — 오-seed 차단.
//   (#3 hand-edited 노드 제외 = cli glue 가 computeSyncLoop 결과를 anchor 로 사후 필터 / 코어 무관.)

import { resolveOriginNodeIds } from './sync-loop.js';
import { analyzeImpact } from './impact-analyzer.js';

/**
 * 손수정 코드 경로 → 주인 노드 anchor + backward 천장 후보 (결정론 / 순수).
 *   - anchor: resolveOriginNodeIds (code_pointers[].path 매칭 / Phase 1 재사용). 미해소 = unresolved(추적 밖 / coverage 상한).
 *   - 천장 후보: 각 anchor 의 backward 조상(analyzeImpact / hard chain 상향 IMPL→TC→…→UC). 합집합 hop 오름차순.
 *   - ceilingByAnchor: anchor별 유효 천장 id 집합 (validateCeiling ancestry guard 원천).
 * @param {object} graph artifact-graph
 * @param {string[]} changedPaths 손수정된 코드 파일 경로
 * @returns {{ anchors:string[], unresolved:string[], ceilingCandidates:Array<{id,grade,additional_hard_hops,first_hop_edge_type}>, ceilingByAnchor:Record<string,string[]> }}
 */
export function liftCandidates(graph, changedPaths = []) {
	const { ids: anchors, unresolved } = resolveOriginNodeIds(graph, changedPaths);
	const ceilingByAnchor = {};
	const merged = new Map(); // id → {id, grade, additional_hard_hops, first_hop_edge_type}
	for (const anchor of anchors) {
		const impact = analyzeImpact(graph, anchor, {
			includeForward: false,
			includeBackward: true, // ★ reverse 예외 — 천장 후보(상류 조상) 열거. 전파는 cli 가 forward.
			nonTraversableStates: ['propose'],
		});
		ceilingByAnchor[anchor] = impact.backward.map((b) => b.id).sort();
		for (const b of impact.backward) {
			const prev = merged.get(b.id);
			// 같은 후보가 여러 anchor 의 조상이면 최단 hop 유지 (가장 가까운 천장 우선 표기).
			if (!prev || b.additional_hard_hops < prev.additional_hard_hops) {
				merged.set(b.id, {
					id: b.id,
					grade: b.grade,
					additional_hard_hops: b.additional_hard_hops,
					first_hop_edge_type: b.first_hop_edge_type,
				});
			}
		}
	}
	const ceilingCandidates = [...merged.values()].sort(
		(a, b) =>
			a.additional_hard_hops - b.additional_hard_hops ||
			(a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
	);
	return { anchors, unresolved, ceilingCandidates, ceilingByAnchor };
}

/**
 * --ceiling 검증 (ancestry guard / R-D3 / Senior #4): 천장 id 가 어느 anchor 의 backward 조상인가.
 *   - anchor 자신을 천장으로 지정도 허용 (refactor = forward 빈 closure = reconcile-only / cli 가 안내).
 *   - 어느 anchor 조상도 아니면 invalid → cli 가 exit 3 + 유효 후보 나열 (auto-climb ❌ = 사람이 잘못 골랐을 때 차단).
 * @param {string} ceilingId
 * @param {string[]} anchors
 * @param {Record<string,string[]>} ceilingByAnchor
 * @returns {{ valid:boolean, validForAnchors:string[] }}
 */
export function validateCeiling(ceilingId, anchors, ceilingByAnchor) {
	const validForAnchors = anchors.filter(
		(a) => a === ceilingId || (ceilingByAnchor[a] ?? []).includes(ceilingId),
	);
	return { valid: validForAnchors.length > 0, validForAnchors };
}

// ── Phase 2b — reconcile (손수정 코드 ↔ anchor 관측사실 신선도 / DEC §11 / Senior REVISE@0.82) ──────────
// 관측사실(코드서 결정론 재추출) vs 사람의도(자동 덮어쓰기 ❌)를 분류. git 탐지(detectContentDrift/findRelocation)는
//   cli glue 가 수행해 gitFacts 로 주입 — 본 함수는 순수(gate·I/O·git 0 / trust 가드). 정책:
//   - relocation(경로 이동·내용 동일) = 유일 관측사실 후보(observed_candidate / auto-update 제안 가능).
//   - content_drift(바이트 변경) = flag-only (재앵커=commit_hash 재기록="새 코드가 정답"=lift --ceiling 의미 판정 / 후보 ❌ /
//       applyContentDrift 도 state flip 만·commit 재기록 ❌ = 프리미티브보다 공격적이면 안 됨 / Senior #2).
//   - 사람의도(symbol/title/description/br_refs/intent_certainty) = flag-only (자동 갱신 절대 ❌).

const INTENT_FIELDS = Object.freeze([
	'symbol',
	'title',
	'description',
	'br_refs',
	'intent_certainty',
]);

/**
 * anchor 노드의 code_pointers + git 탐지결과 → 관측사실 후보 / flag 분류 (순수 / propose-only).
 * @param {Array} codePointers anchor 노드의 code_pointers[] (노드 전체 ❌ / Senior #4)
 * @param {Array} gitFacts cli glue 가 주입: [{ path, content_drift:bool|null, relocation:string|null }]
 * @returns {{ observed_candidates:Array, flags:Array }}
 *   observed_candidates: [{ path, kind:'path_relocated', current, suggested }] — relocation 만 (auto-update 후보)
 *   flags: [{ path, kind:'content_drift'|'intent_review', ... }] — 사람 결단 필요 (자동 ❌)
 */
export function reconcileObserved(codePointers = [], gitFacts = []) {
	const factByPath = new Map(gitFacts.map((f) => [f.path, f]));
	const observed_candidates = [];
	const flags = [];
	for (const cp of codePointers) {
		const fact = factByPath.get(cp?.path);
		if (!fact) continue;
		// relocation = 순수 관측사실 (경로만 바뀌고 내용 동일) → auto-update 후보.
		if (fact.relocation) {
			observed_candidates.push({
				path: cp.path,
				kind: 'path_relocated',
				current: cp.path,
				suggested: fact.relocation,
			});
		}
		// content_drift = flag-only (재앵커는 의미 판정 = --ceiling 게이트 소관 / 후보 ❌).
		if (fact.content_drift === true) {
			flags.push({
				path: cp.path,
				kind: 'content_drift',
				base_commit: cp.commit_hash ?? null,
				message:
					'anchor 코드가 base 이후 변경 — 사람 결단: 재앵커(코드=정답) vs lift --ceiling(의도 재전파). 자동 재앵커 ❌.',
			});
		}
		// 사람의도 필드 존재 = flag (관측사실 재추출이 건드리면 안 되는 영역 명시).
		const intentPresent = INTENT_FIELDS.filter(
			(f) => cp[f] !== undefined && cp[f] !== null,
		);
		if (intentPresent.length > 0) {
			flags.push({
				path: cp.path,
				kind: 'intent_review',
				fields: intentPresent,
				message:
					'사람의도 필드 — 관측사실 재추출 대상 아님 (자동 덮어쓰기 ❌ / 변경 필요 시 사람 결단).',
			});
		}
	}
	return { observed_candidates, flags };
}

// ── Phase 2c — reconcile 후속 결단 보조 (carry 마감 / DEC §12 / Senior REVISE@0.83) ──────────
// 전부 순수 reporting 강화 (mutation 0 / propose-only 불변). graph 는 파생물(impl-spec source_files 에서 derive)
//   이므로 relocation 의 durable 수정 타깃 = source 산출물(graph 직접 ❌ = 다음 resync clobber). 본 helper 는
//   그 정확 위치만 제시(B' / write ❌). 자동 source-write 는 multi-source·commit_hash·path-base 정합이 별도 MINOR.

// anchor subkind → relocation 의 source 산출물 + 필드 locator (graph-synthesizer derive 역매핑).
//   IMPL ← impl-spec.json modules[].source_files / TC ← test-spec.json test_cases[].source_file.
const RELOCATION_SOURCE_BY_SUBKIND = Object.freeze({
	IMPL: { source_artifact: 'impl-spec.json', field: 'source_files', collection: 'modules' },
	TC: { source_artifact: 'test-spec.json', field: 'source_file', collection: 'test_cases' },
});

/**
 * relocation 관측사실 후보 → durable 수정할 source 위치 hint (순수 / write ❌ / B').
 * @returns {{ source_artifact, locator, old, new } | null} 매핑 미지원 subkind = null(generic carry)
 */
export function relocationSourceHint(anchorSubkind, anchorId, candidate) {
	const map = RELOCATION_SOURCE_BY_SUBKIND[anchorSubkind];
	if (!map) {
		return {
			source_artifact: '(source 산출물)',
			locator: `${anchorId}.code_pointers[].path`,
			old: candidate.current,
			new: candidate.suggested,
		};
	}
	return {
		source_artifact: map.source_artifact,
		locator: `${map.collection}[id=${anchorId}].${map.field}`,
		old: candidate.current,
		new: candidate.suggested,
	};
}

/**
 * content_drift flag 결단 보조: 그 anchor 의 유효 천장 후보 중 **anchor 자신 제외** (Senior #1 — IMPL=forward-leaf=no-op).
 *   재전파(--ceiling)는 하류 TASK/TC 재생성(손수정 코드는 closure 제외) — 코드 자체 재생성 아님.
 * @returns {string[]} 그 anchor 로부터 forward 재전파 가능한 상위 천장 id (정렬)
 */
export function ceilingOptionsForAnchor(anchorId, ceilingByAnchor) {
	return (ceilingByAnchor?.[anchorId] ?? [])
		.filter((id) => id !== anchorId)
		.slice()
		.sort();
}

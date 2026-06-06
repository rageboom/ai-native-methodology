// work-unit.js — G3 R5/R7 — manifest 객체 생성 + traceability/analysis refs helper.
//
// state-store.js 가 이 module 의 createScopeManifest / createStageManifest 를
// ensureScopeDir 안에서 호출. import 방향 = state-store → work-unit (단방향).

// v9.0 — manifest stage dirs (planning→discovery 개칭 + plan 신설 / 'impl' = implement 단축).
export const STAGES = Object.freeze([
	'discovery',
	'spec',
	'plan',
	'test',
	'impl',
]);

// v11.9.0 — use-scenario taxonomy (S1 재생성 / S2 AX전환 / S3 특성화 / greenfield 신규).
//   DEC-2026-05-30-use-scenario-taxonomy. scenario = optional (미지정 시 필드 부재 → gate-eval default 'S1').
export const SCENARIOS = Object.freeze(['S1', 'S2', 'S3', 'greenfield']);

export function createScopeManifest(scope, scenario) {
	if (scenario != null && !SCENARIOS.includes(scenario)) {
		throw new Error(
			`createScopeManifest: invalid scenario "${scenario}" (expected one of ${SCENARIOS.join('/')})`,
		);
	}
	const m = {
		scope,
		status: 'pending',
		current_stage: 'discovery',
		analysis_refs: {
			rules: [],
			endpoints: [],
			schemas: [],
			domain: [],
			antipatterns: [],
		},
		sync_state: {
			last_synced_at: null,
			sync_sources: [],
			dependents: [],
			drift_detected: false,
		},
	};
	if (scenario != null) m.scenario = scenario;
	return m;
}

export function createStageManifest(scope, stage) {
	if (!STAGES.includes(stage)) {
		throw new Error(`createStageManifest: invalid stage "${stage}"`);
	}
	return {
		scope,
		stage,
		status: 'pending',
		linked_artifacts: [],
		traceability_refs: { uc: [], bhv: [], ac: [], tc: [], impl: [] },
		evidence_paths: [],
	};
}

// 산출물 JSON 에서 traceability_refs 추출 — 산출물 종류별 분기.
// 1차 = discovery-spec.use_cases[].id / behavior-spec.behaviors[].id / 등.
// v3.x 에서 산출물 schema 자동 파싱 강화.
export function extractTraceabilityRefs(artifactJson, kind) {
	switch (kind) {
		case 'discovery-spec': // v11.0.0 planning-spec → discovery-spec rename
			return {
				uc: (artifactJson.use_cases || []).map((u) => u.id).filter(Boolean),
			};
		case 'behavior-spec':
			return {
				bhv: (artifactJson.behaviors || []).map((b) => b.id).filter(Boolean),
			};
		case 'acceptance-criteria':
			return {
				ac: (artifactJson.criteria || []).map((a) => a.id).filter(Boolean),
			};
		case 'test-spec':
			return {
				tc: (artifactJson.test_cases || []).map((t) => t.id).filter(Boolean),
			};
		case 'impl-spec':
			return {
				impl: (artifactJson.implementations || [])
					.map((i) => i.id)
					.filter(Boolean),
			};
		default:
			return {};
	}
}

// analysis_refs subset filter — canonical global 의 부분 추출.
// 1차 = ID prefix 매칭 (예: scope user-registration → BR-USER-* / BR-AUTH-*).
// v2.1+ 에서 의미 기반 매칭 강화.
export function subsetAnalysisRefs(canonical, prefixes) {
	if (!Array.isArray(prefixes) || prefixes.length === 0) return {};
	const matches = (id) => prefixes.some((p) => id.startsWith(p));
	return {
		rules: (canonical.rules || []).filter((r) => matches(r.id || r)),
		endpoints: (canonical.endpoints || []).filter((e) => matches(e.path || e)),
		schemas: (canonical.schemas || []).filter((s) => matches(s.name || s)),
		domain: (canonical.domain || []).filter((d) => matches(d.name || d)),
		antipatterns: (canonical.antipatterns || []).filter((a) =>
			matches(a.id || a),
		),
	};
}

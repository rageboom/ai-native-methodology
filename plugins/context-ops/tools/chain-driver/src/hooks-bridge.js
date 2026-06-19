// hooks-bridge.js — Claude Code hooks 통합 (D21' 정합 / suppressOutput=true 의무).
//
// 입력: stdin JSON (hook event payload).
// 출력: stdout JSON ({suppressOutput, hookSpecificOutput, ...}).
// stderr: 사용자에게만 노출되는 메시지 (LLM 컨텍스트 격리).
//
// v4.0 multi-agent paradigm (DEC-2026-05-17-v4-multi-agent-paradigm-채택):
// - TRIGGER_PATTERNS 의 각 entry 에 agentId 추가 (stage 별 sub-agent dispatch 권고)
// - suggestAgentForPrompt 신설 / suggestSkillForPrompt 보존 (옛 호환)
// - buildSuggestOutput / formatHookBlockContext 에 agentId optional — 자동 매핑

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { runtimeFileForRead } from '../../_shared/ai-context-layout.js';
import { isSourcePath } from '../../_shared/source-ext.js';
import {
	formatHookBlockContext,
	formatSkillSuggestion,
} from './invoke-skill.js';
import { SUBKIND_TO_STAGE } from './sync-loop.js';
import { isUpstream } from './stage-graph.js';

// M2 (DEC-2026-06-10-cascade-conformance) — PreToolUse pre-fire 차단.
// jira_create 의 summary 가 cascade-plan.calls 에 없으면 = 스킬이 계획 밖 ticket 발사 (정책 11) → deny.
// exempt: enter-task([Chain ) / verification([Plugin Verify]) = cascade-plan 무관.
// 정직 한계: summary verbatim 복사 가정(정책 11 요구) / cascade-plan 부재 시 미적용(=비-cascade 흐름).
const CONFORMANCE_EXEMPT_PREFIXES = ['[Chain ', '[Plugin Verify]'];

export function checkCascadeConformance({ toolName, toolInput, root, cascadePlanPath }) {
	if (typeof toolName !== 'string' || !toolName.endsWith('jira_create')) return null;
	const planPath =
		cascadePlanPath || runtimeFileForRead(root || '.', 'cascade-plan.json');
	if (!existsSync(planPath)) return null; // cascade-plan 없음 = 비-cascade 흐름 (미적용)
	let plan;
	try {
		plan = JSON.parse(readFileSync(planPath, 'utf-8'));
	} catch {
		return null; // 읽기 실패 = 강제 안 함 (graceful)
	}
	const summary = toolInput?.summary;
	if (!summary) return null; // payload 에 summary 없음 = 판단 불가
	if (CONFORMANCE_EXEMPT_PREFIXES.some((p) => summary.startsWith(p))) return null;
	const planned = new Set((plan?.calls || []).map((c) => c.summary).filter(Boolean));
	if (planned.has(summary)) return null; // 계획에 있음 = 정합
	return `cascade nonconformance (F-TICKETSYNC-009): jira_create summary "${summary}" 가 cascade-plan.calls 에 없음 — 스킬이 계획 밖 ticket 발사 (정책 11 / cascade-plan 그대로 발사 의무).`;
}

// Claude Code hooks output contract (정식 spec 정합).
export function buildSuggestOutput({ skillId, meta, sessionId, agentId, hookEventName = 'UserPromptSubmit' }) {
	// suppressOutput=true → stdout 의 plain text 가 LLM context 로 흘러가지 않음.
	// additionalContext 에 차단 문구를 명시 동봉 (LLM 이 보더라도 invoke 금지 명령).
	// v4.0: agentId 가 있으면 agent dispatch 권고 동봉.
	// fix: Claude Code v2.1.172+ hookSpecificOutput 에 hookEventName 필수 (누락 시 validation 오류).
	return {
		suppressOutput: true,
		hookSpecificOutput: {
			hookEventName,
			additionalContext: formatHookBlockContext(skillId, meta, agentId),
		},
		// continue=true → hook 후 통상 동작.
		continue: true,
	};
}

export function buildBlockOutput({
	reason,
	sessionId,
	hookEventName = 'PreToolUse',
}) {
	// PreToolUse / PostToolUse 차단용 output. exit 2 로 차단 통지.
	return {
		decision: 'block',
		reason,
		hookSpecificOutput: {
			hookEventName,
			permissionDecision: 'deny',
			additionalContext: `chain-driver mechanical gate blocked: ${reason}. User must resolve via /aimd-next or /aimd-stage <name>.`,
		},
		continue: false,
	};
}

export function parseHookInput(jsonString) {
	if (!jsonString || jsonString.trim() === '') {
		throw new Error('hook input stdin empty');
	}
	let parsed;
	try {
		parsed = JSON.parse(jsonString);
	} catch (e) {
		throw new Error(`hook input parse failed: ${e.message}`);
	}
	if (typeof parsed !== 'object' || parsed === null) {
		throw new Error('hook input must be JSON object');
	}
	return parsed;
}

// Inspect a UserPromptSubmit prompt for chain stage trigger keywords.
// v4.0: TRIGGER_PATTERNS 의 entry 마다 agentId 추가 (stage 별 sub-agent dispatch / DEC-2026-05-17).
// analysis stage entry 추가 (B1 보강 통합 / hooks-bridge TRIGGER_PATTERNS 가 chain 1~4 만 커버 → 5 stage 모두).
const TRIGGER_PATTERNS = [
	{
		regex:
			/(분석|검토|legacy|레거시|analysis)\s*(시작|진입|해줘|만들어|드라이브)/i,
		skillId: 'analysis-input-collection',
		agentId: 'analysis-agent',
	},
	// DEC-2026-06-18 — 6 stage 패턴 동사 셋 통일 (시작|진입|해줘|만들어|드라이브).
	// 이전: spec/plan/test/implement 가 (시작|진입|만들어) 3종만 가져 "구현해줘" 등이
	// layer-1(hooks.json) 통과·layer-2 미매칭 dead-zone(③). 통일로 비대칭 제거.
	{
		regex: /(discovery|발견|탐색|planning|기획)\s*(시작|진입|해줘|만들어|드라이브)/i,
		skillId: 'discovery-from-analysis-output',
		agentId: 'discovery-agent',
	},
	{
		regex: /(spec|명세|behavior)\s*(시작|진입|해줘|만들어|드라이브)/i,
		skillId: 'spec-compose-behavior-spec',
		agentId: 'spec-agent',
	},
	{
		regex: /(plan|계획)\s*(시작|진입|해줘|만들어|드라이브)/i,
		skillId: 'plan-decompose-and-sequence',
		agentId: 'plan-agent',
	},
	{
		regex: /(test|테스트)\s*(시작|진입|해줘|만들어|드라이브)/i,
		skillId: 'test-generate-test-spec',
		agentId: 'test-agent',
	},
	{
		regex: /(implement|구현)\s*(시작|진입|해줘|만들어|드라이브)/i,
		skillId: 'implement-generate-impl-spec',
		agentId: 'implement-agent',
	},
	// session-handoff (DEC-2026-06-11-session-handoff-convention) — 세션 종료/인계 발화 →
	//   .ai-context/HANDOFF.md 갱신 스킬 라우팅. cross-cutting = stage agent 무관 (agentId null).
	{
		regex:
			/((세션|session)\s*(정리|마무리|인계|종료|wrap[- ]?up))|handoff|인계\s*(문서|갱신|작성)/i,
		skillId: 'session-handoff',
		agentId: null,
	},
];

export function suggestSkillForPrompt(prompt) {
	if (!prompt || typeof prompt !== 'string') return null;
	for (const { regex, skillId } of TRIGGER_PATTERNS) {
		if (regex.test(prompt)) return skillId;
	}
	return null;
}

// v4.0 신설 — agent dispatch 권고 (multi-agent paradigm / DEC-2026-05-17).
// main agent 가 Task tool 로 해당 stage agent 를 dispatch 권고 받음.
export function suggestAgentForPrompt(prompt) {
	if (!prompt || typeof prompt !== 'string') return null;
	for (const { regex, agentId } of TRIGGER_PATTERNS) {
		if (regex.test(prompt)) return agentId;
	}
	return null;
}

// ── 진입 라우터 (DEC-2026-06-18-discovery-universal-entry-router) ──────────────
// living-sync-operating-model §4: "자연어 변경 요청은 전부 discovery 로 들어온다.
// discovery 는 입구·라우터다." 이 불변식을 진입점에 결선 — 두 갈래:
//   (advisory) routeEntry — stage 명시 트리거가 아니면서 변경-의도가 있으면 discovery 로
//              폴백 (① silent pass-through 제거). 비-작업 prompt(질문/설명)는 null 유지.
//   (deterministic) coldStartSkipAheadReason — discovery 미진입 상태에서 later-stage chain
//              산출물 write = orphan → PreToolUse hard-block (②).

// 변경-의도(work intent) 양성 키워드 — layer-1 matcher(hooks.json) 와 동기화 의무
// (hooks-bridge.test.js 가 matcher ⊇ WORK_INTENT_KEYWORDS 강제 / dead-zone ③ 회귀 차단).
// 보수적 시작 — 오발(질문/설명) 회피. 표현 누락은 finding 으로 보강(cookbook Tip 3).
export const WORK_INTENT_KEYWORDS = Object.freeze([
	'추가',
	'수정',
	'고쳐',
	'고치',
	'변경',
	'삭제',
	'제거',
	'리팩터',
	'리팩토링',
	'붙여',
	'만들',
	'개발',
	'신규',
	'기능',
]);
const WORK_INTENT_REGEX = new RegExp(WORK_INTENT_KEYWORDS.join('|'), 'i');

// later-stage chain skill — discovery 미진입 시 advisory redirect / hard-block 대상 판정.
const LATER_STAGE_SKILLS = new Set([
	'spec-compose-behavior-spec',
	'plan-decompose-and-sequence',
	'test-generate-test-spec',
	'implement-generate-impl-spec',
]);

export function isLaterStageSkill(skillId) {
	return LATER_STAGE_SKILLS.has(skillId);
}

// 진입 라우터 — prompt → { skillId, agentId, source } | null. 순수(prompt 만 / I/O·state·LLM 0).
//   source: 'stage' (명시 stage 트리거 / suggestSkillForPrompt 위임)
//         | 'discovery-default' (변경-의도 있으나 stage 미지정 → discovery 입구·라우터 폴백)
// null = 비-작업 prompt(질문/설명/감사) → 기존 침묵 보존(오발 회피).
export function routeEntry(prompt) {
	if (!prompt || typeof prompt !== 'string') return null;
	const stageSkill = suggestSkillForPrompt(prompt);
	if (stageSkill) {
		return {
			skillId: stageSkill,
			agentId: suggestAgentForPrompt(prompt),
			source: 'stage',
		};
	}
	if (WORK_INTENT_REGEX.test(prompt)) {
		// 자연어 변경 요청 = discovery(입구·라우터)부터. NL 어댑터 진입.
		return {
			skillId: 'discovery-from-nl-md',
			agentId: 'discovery-agent',
			source: 'discovery-default',
		};
	}
	return null;
}

// dep-graph P3 (operation.md 결정 5) — PostToolUse 시 chain/analysis artifact write 감지.
// 파일명 → artifact_subkind 매핑. 한 파일이 여러 노드(예: behavior-spec.json = 다수 BHV)에 대응하므로
// hook 은 "어떤 종류의 artifact 가 바뀌었나"만 판정하고, per-node 영향 분석은 `chain-driver impact` 로 분리.
const ARTIFACT_FILENAME_TO_SUBKIND = Object.freeze({
	'discovery-spec.json': 'UC', // v11.0.0 planning-spec → discovery-spec rename (DEC-2026-05-26-discovery-spec-rename)
	'behavior-spec.json': 'BHV',
	'acceptance-criteria.json': 'AC',
	'task-plan.json': 'TASK', // DEC-2026-06-18 — plan-stage 산출물 (이전 누락 / graph-artifact 미감지 잠재버그 + cold-start hard-block 대상)
	'test-spec.json': 'TC',
	'impl-spec.json': 'IMPL',
});

const ANALYSIS_FILENAME_TO_SUBKIND = Object.freeze({
	'architecture.json': 'architecture',
	'domain.json': 'domain',
	'openapi-extension.json': 'api',
	// v11.24.0 Slice 3 — db-schema 두 파일명 모두 매핑 (schema.json=canonical skill output / db-schema.json=poc-16 compat).
	'schema.json': 'db-schema',
	'db-schema.json': 'db-schema',
	'formal-spec.json': 'formal-spec',
	'business-rules.json': 'business-rules',
	'antipatterns.json': 'antipatterns',
	'ui-spec.json': 'ui-ux',
	'state-map.json': 'state-map',
	'visual-manifest.json': 'visual-manifest',
	'form-validation-spec.json': 'form-validation-spec',
	'type-spec.json': 'type-spec',
	'error-mapping-spec.json': 'error-mapping-spec',
	'characterization-spec.json': 'characterization-spec',
	'sql-inventory.json': 'sql-inventory',
});

const ASPECT_FILENAME_TO_SUBKIND = Object.freeze({
	'a11y-spec.json': 'a11y',
	'i18n-spec.json': 'i18n',
	'static-security-spec.json': 'static-security',
	'legacy-spectrum.json': 'legacy-spectrum',
});

// PostToolUse payload → 변경된 graph artifact 판정. null = graph artifact 아님.
export function detectGraphArtifactWrite({ toolName, toolInput }) {
	if (!['Write', 'Edit', 'NotebookEdit'].includes(toolName)) return null;
	const path = toolInput?.file_path || toolInput?.path || '';
	if (!path) return null;
	// .ai-context 경로 하위만 (산출물 영역)
	if (!path.includes('/.ai-context/') && !path.includes('\\.ai-context\\')) return null;
	const filename = path.split(/[/\\]/).pop();
	if (ARTIFACT_FILENAME_TO_SUBKIND[filename]) {
		return {
			path,
			filename,
			artifact_kind: 'chain',
			artifact_subkind: ARTIFACT_FILENAME_TO_SUBKIND[filename],
		};
	}
	if (ANALYSIS_FILENAME_TO_SUBKIND[filename]) {
		return {
			path,
			filename,
			artifact_kind: 'analysis',
			artifact_subkind: ANALYSIS_FILENAME_TO_SUBKIND[filename],
		};
	}
	if (ASPECT_FILENAME_TO_SUBKIND[filename]) {
		return {
			path,
			filename,
			artifact_kind: 'aspect',
			artifact_subkind: ASPECT_FILENAME_TO_SUBKIND[filename],
		};
	}
	return null;
}

// Gap B (plan-living-graph-autowire §4 / living-sync §7 lift 자동트리거) — 손수정 코드 파일 write 감지.
// detectGraphArtifactWrite 와 disjoint: 그쪽 = .ai-context 산출물(graph artifact) / 이쪽 = .ai-context 밖 source 파일.
// 반환 { path } = lift 후보 1건. 주인 노드 anchor·의미천장 surface 는 demand 시 cli glue 가 liftCandidates 로 drain.
// hook 은 detect+mark 만 (impact·lift 실행 ❌ / per-write eager resync = Senior REJECT 회피).
export function detectSourceFileWrite({ toolName, toolInput }) {
	if (!['Write', 'Edit', 'NotebookEdit'].includes(toolName)) return null;
	const path = toolInput?.file_path || toolInput?.path || '';
	if (!path) return null;
	// .ai-context 산출물(graph artifact) = detectGraphArtifactWrite 소관 → 제외 (loose 매칭 = 과배제 무해 / disjoint).
	if (path.includes('.ai-context')) return null;
	if (!isSourcePath(path)) return null;
	return { path };
}

// lift 후보 path 를 manifest sync_state 에 누적 (순수 / dedupe + cap / plan §7 unbounded 성장 방지).
// forward-only 불변: 여기선 mark 만 — backward 천장 surface·forward 재전파는 demand 시 cli glue (사람 --ceiling).
export function markLiftCandidatePending(syncState, changedPath, { cap = 50 } = {}) {
	const s = syncState && typeof syncState === 'object' ? syncState : { drift_detected: false };
	const seen = new Set(Array.isArray(s.lift_candidate_pending) ? s.lift_candidate_pending : []);
	seen.delete(changedPath); // 재-add 시 최신 위치로 이동
	seen.add(changedPath);
	const arr = [...seen];
	return {
		...s,
		lift_candidate_pending: arr.length > cap ? arr.slice(arr.length - cap) : arr,
	};
}

// cold-start skip-ahead hard-block (DEC-2026-06-18 / ② / 결정론 = state + 파일명만 / LLM inject ❌).
// discovery 미진입 상태에서 later-stage chain 산출물(behavior-spec/acceptance-criteria/
// task-plan/test-spec/impl-spec) write = orphan 산출물 → deny reason 반환. discovery-spec(UC)
// 자신은 허용(입구). 정상 순차 흐름(analysis→discovery→spec…)은 `chain-driver next` 가
// discovery 를 'in_progress'/'complete' 로 전이하므로 트립되지 않는다 — cold-start(discovery
// 'pending')에서 later-stage 산출물 직접 write 만 차단.
//
// @param {Object} activeChain  getActiveScopeChain(state) 결과 (scope-aware / stage_progress 포함).
//                              부재/판정불가(stage_progress 없음) = null 반환(allow / graceful).
// @returns {string|null}       deny reason 또는 null(allow).
export function coldStartSkipAheadReason({ toolName, toolInput, activeChain }) {
	const art = detectGraphArtifactWrite({ toolName, toolInput });
	if (!art || art.artifact_kind !== 'chain') return null; // chain 산출물 write 아님 = 무관
	if (art.artifact_subkind === 'UC') return null; // discovery-spec 자신 = 허용(입구·라우터)
	if (!activeChain?.stage_progress) return null; // state 판정 불가 = allow (graceful / 정직 한계)
	const discoveryStatus = activeChain.stage_progress?.discovery?.status;
	// discovery 가 진입(in_progress) 또는 완료(complete) = 허용. 'pending' 만 cold-start skip-ahead.
	if (discoveryStatus !== 'pending') return null;
	return (
		`cold-start skip-ahead 차단 (discovery 미진입): ${art.artifact_subkind} 산출물 ` +
		`'${art.filename}' write 시도 — 분석 외 모든 작업은 discovery(입구·라우터)부터. ` +
		`discovery-from-nl-md 로 진입하거나 chain-driver next 로 정식 전진하세요.`
	);
}

// PostToolUse 가벼운 revisit 후보 신호 (하이브리드 자동 감지 / ADR-CHAIN-003 §2).
//   변경 산출물의 stage 가 현재 진행 chain 의 upstream 이면 1줄 advisory (정식 enrich 판정은 chain-driver next).
//   순수 결정론 (stage 매핑 + isUpstream / git diff·graph 없음 / LLM 0). coldStartSkipAheadReason 패턴.
export function revisitCandidateNote({ detected, currentChain }) {
	if (!detected || !currentChain) return null;
	const fileStage =
		detected.artifact_kind === 'analysis'
			? 'analysis'
			: SUBKIND_TO_STAGE[detected.artifact_subkind];
	if (!fileStage) return null;
	if (!isUpstream(fileStage, currentChain)) return null;
	return (
		`revisit 후보: ${fileStage} 산출물 변경(${detected.filename}) — 현재 ${currentChain} 진행 중. ` +
		`다음 gate(chain-driver next)에서 영향 정식 판정.`
	);
}

// operation.md "evaluate_policy()" deliverable — 영향 노드 집합에 대해 정책 평가 + propose record 생성.
// impact-analyzer 결과 merged 리스트의 각 노드에 대해, 해당 엣지 단계의 변경 종류 정책을 적용.
// 순수 함수 — I/O 없음. 호출자(cli.js)가 JSONL append 책임.
//
// @param {Object[]} affected   impact-analyzer merged 리스트 [{ id, grade, ... }]
// @param {Object} originNode   변경 origin 노드 { id, artifact_subkind }
// @param {Map} nodeById        id → node 맵 (target subkind 조회용)
// @param {Object} policy       loadPolicy 결과
// @param {Function} evaluatePolicy  policy-evaluator.evaluatePolicy
// @param {string} changeKind   'typo'|'item_add'|'item_remove'|'semantic_change'
// @returns {Object[]}          [{ origin_id, affected_id, grade, decision, source, reasoning, change_kind }]
export function evaluatePolicyForEdges({
	affected,
	originNode,
	nodeById,
	policy,
	evaluatePolicy,
	changeKind = 'semantic_change',
}) {
	const records = [];
	for (const entry of affected ?? []) {
		const targetNode = nodeById.get(entry.id);
		const change = {
			kind: changeKind,
			origin_subkind: originNode?.artifact_subkind,
			target_subkind: targetNode?.artifact_subkind,
		};
		const evald = evaluatePolicy(policy, change);
		records.push({
			origin_id: originNode?.id,
			affected_id: entry.id,
			grade: entry.grade,
			direction: entry.direction,
			change_kind: changeKind,
			decision: evald.decision,
			source: evald.source,
			reasoning: evald.reasoning,
		});
	}
	return records;
}

// Determine if a tool call should be blocked based on state.json blocked flag.
// Used for PreToolUse hook on Write/Edit targeting .ai-context/output/** + R20 MCP ticket-sync.
//
// v8.6.1+ R20 (DEC-2026-05-18-r20-mcp-ticket-sync-channel):
// - mcp__wiki-jira-assistant__* (jira-confluence MCP) 호출도 state.blocked 시 deny.
// - 결정론 axis 보호 + 사용자 confirmation gate bypass 차단 (chain harness gate 중 ticket-sync auto-fire 차단).
// - Write/Edit 와 달리 file_path 체크 X — state.blocked=true 만 충분.
export function shouldBlockToolUse({ toolName, toolInput, state }) {
	if (!state?.blocked) return null;

	// R20 path — MCP ticket-sync 차단 (state.blocked 시 file_path 무관 deny)
	// 신·구 prefix 양쪽 (DEC-2026-06-10 prefix 양립 / hooks.json matcher 정합).
	if (
		typeof toolName === 'string' &&
		(toolName.startsWith('mcp__wiki-jira-assistant__') ||
			toolName.startsWith('mcp__mcp-server-wiki-jira__'))
	) {
		return `R20 MCP ticket-sync blocked: ${state.block_reason || 'state.blocked=true'}`;
	}

	// 기존 Write/Edit/NotebookEdit path (ADR-CHAIN-005 §3 mechanical trio iii)
	if (!['Write', 'Edit', 'NotebookEdit'].includes(toolName)) return null;
	const path = toolInput?.file_path || toolInput?.path || '';
	if (!path) return null;
	// DEC-2026-06-16: state.blocked 시 .ai-context/ 전체 산출물 쓰기 차단 (base/scopes/runtime — 구 output/ 한정 우회 방지).
	if (!path.includes('/.ai-context/') && !path.includes('\\.ai-context\\'))
		return null;
	return state.block_reason || 'state.blocked=true';
}

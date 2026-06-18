import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
	parseHookInput,
	buildSuggestOutput,
	buildBlockOutput,
	suggestSkillForPrompt,
	suggestAgentForPrompt,
	routeEntry,
	isLaterStageSkill,
	coldStartSkipAheadReason,
	WORK_INTENT_KEYWORDS,
	shouldBlockToolUse,
	checkCascadeConformance,
} from '../src/hooks-bridge.js';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('hooks-bridge', () => {
	it('parseHookInput parses well-formed JSON object', () => {
		const r = parseHookInput(
			'{"hook_event_name":"UserPromptSubmit","prompt":"hi"}',
		);
		assert.equal(r.hook_event_name, 'UserPromptSubmit');
	});

	it('parseHookInput throws on empty stdin', () => {
		assert.throws(() => parseHookInput(''));
	});

	it('parseHookInput throws on bad JSON', () => {
		assert.throws(() => parseHookInput('{not json'));
	});

	it('buildSuggestOutput sets suppressOutput=true and additionalContext', () => {
		const out = buildSuggestOutput({
			skillId: 'planning/x',
			meta: { name: 'x' },
		});
		assert.equal(out.suppressOutput, true);
		assert.match(
			out.hookSpecificOutput.additionalContext,
			/SHALL NOT auto-invoke/,
		);
		assert.equal(out.continue, true);
	});

	it('buildBlockOutput sets decision=block + permissionDecision=deny', () => {
		const out = buildBlockOutput({ reason: 'validator_critical' });
		assert.equal(out.decision, 'block');
		assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
		assert.match(out.reason, /validator_critical/);
	});

	it('suggestSkillForPrompt matches discovery trigger (planning alias 유지)', () => {
		assert.equal(
			suggestSkillForPrompt('discovery 시작해줘'),
			'discovery-from-analysis-output',
		);
		assert.equal(
			suggestSkillForPrompt('planning 시작해줘'),
			'discovery-from-analysis-output',
		); // v9.0 planning = legacy alias
	});

	it('suggestSkillForPrompt matches spec trigger', () => {
		assert.equal(
			suggestSkillForPrompt('spec 진입'),
			'spec-compose-behavior-spec',
		);
	});

	it('suggestSkillForPrompt returns null for unrelated prompt', () => {
		assert.equal(suggestSkillForPrompt('hello world'), null);
	});

	it('C10/C20 — analysis trigger maps to analysis skill + agent (5 stage 모두 커버)', () => {
		assert.equal(
			suggestSkillForPrompt('분석 시작해줘'),
			'analysis-input-collection',
		);
		assert.equal(suggestAgentForPrompt('분석 시작해줘'), 'analysis-agent');
		assert.equal(
			suggestSkillForPrompt('legacy 분석 드라이브'),
			'analysis-input-collection',
		);
	});

	it('C20 — hooks.json UserPromptSubmit matcher ⊇ TRIGGER_PATTERNS 키워드 (dead-entry 회귀 차단)', () => {
		const hooks = JSON.parse(
			readFileSync(
				new URL('../../../hooks/hooks.json', import.meta.url),
				'utf8',
			),
		);
		const matcher = hooks.hooks.UserPromptSubmit[0].matcher;
		// analysis trigger 키워드가 matcher 에 없으면 hook 자체가 발화 안 함 (C10 dead-entry).
		for (const kw of [
			'분석',
			'검토',
			'legacy',
			'레거시',
			'analysis',
			'discovery',
			'spec',
			'plan',
			'test',
			'implement',
		]) {
			assert.ok(
				matcher.includes(kw),
				`hooks.json matcher 에 '${kw}' 누락 — UserPromptSubmit hook 발화 실패 위험 (C10)`,
			);
		}
	});

	it('shouldBlockToolUse blocks Write under .ai-context/output/ when state.blocked', () => {
		const reason = shouldBlockToolUse({
			toolName: 'Write',
			toolInput: { file_path: '/tmp/proj/.ai-context/output/spec.json' },
			state: { blocked: true, block_reason: 'validator_critical' },
		});
		assert.equal(reason, 'validator_critical');
	});

	it('shouldBlockToolUse blocks 신 prefix jira MCP when state.blocked (DEC-2026-06-10 fix)', () => {
		const reason = shouldBlockToolUse({
			toolName: 'mcp__mcp-server-wiki-jira__jira_create',
			toolInput: { summary: 'x' },
			state: { blocked: true, block_reason: 'gate_block' },
		});
		assert.match(reason || '', /R20 MCP ticket-sync blocked/);
	});

	describe('checkCascadeConformance (M2 PreToolUse)', () => {
		function setup(planCalls) {
			const dir = mkdtempSync(join(tmpdir(), 'cc-'));
			mkdirSync(join(dir, '.ai-context', 'output'), { recursive: true });
			if (planCalls) {
				writeFileSync(join(dir, '.ai-context', 'output', 'cascade-plan.json'), JSON.stringify({ calls: planCalls }));
			}
			return dir;
		}
		const PLAN = [{ summary: '차량 등록', issue_type: '이야기' }, { summary: '[TASK-CAR-001] be API', issue_type: '하위 작업' }];

		it('계획에 있는 summary → 통과(null)', () => {
			const dir = setup(PLAN);
			const r = checkCascadeConformance({ toolName: 'mcp__mcp-server-wiki-jira__jira_create', toolInput: { summary: '차량 등록' }, root: dir });
			rmSync(dir, { recursive: true, force: true });
			assert.equal(r, null);
		});
		it('계획 밖 summary → deny (F-TICKETSYNC-009)', () => {
			const dir = setup(PLAN);
			const r = checkCascadeConformance({ toolName: 'mcp__mcp-server-wiki-jira__jira_create', toolInput: { summary: '내가 지어낸 티켓' }, root: dir });
			rmSync(dir, { recursive: true, force: true });
			assert.match(r || '', /cascade nonconformance/);
		});
		it('exempt prefix([Chain ) → 통과', () => {
			const dir = setup(PLAN);
			const r = checkCascadeConformance({ toolName: 'mcp__mcp-server-wiki-jira__jira_create', toolInput: { summary: '[Chain 3] car plan 작성 시작' }, root: dir });
			rmSync(dir, { recursive: true, force: true });
			assert.equal(r, null);
		});
		it('cascade-plan 부재 → 미적용(null / 비-cascade 흐름)', () => {
			const dir = setup(null);
			const r = checkCascadeConformance({ toolName: 'mcp__mcp-server-wiki-jira__jira_create', toolInput: { summary: 'x' }, root: dir });
			rmSync(dir, { recursive: true, force: true });
			assert.equal(r, null);
		});
		it('jira_create 아닌 tool → 미적용(null)', () => {
			const dir = setup(PLAN);
			const r = checkCascadeConformance({ toolName: 'Write', toolInput: { summary: 'x' }, root: dir });
			rmSync(dir, { recursive: true, force: true });
			assert.equal(r, null);
		});
	});

	it('shouldBlockToolUse allows Write outside .ai-context/output/', () => {
		const reason = shouldBlockToolUse({
			toolName: 'Write',
			toolInput: { file_path: '/tmp/proj/src/foo.ts' },
			state: { blocked: true, block_reason: 'validator_critical' },
		});
		assert.equal(reason, null);
	});

	it('shouldBlockToolUse allows when state.blocked=false', () => {
		const reason = shouldBlockToolUse({
			toolName: 'Write',
			toolInput: { file_path: '/tmp/proj/.ai-context/output/spec.json' },
			state: { blocked: false },
		});
		assert.equal(reason, null);
	});

	// v8.6.1+ R20 (DEC-2026-05-18-r20-mcp-ticket-sync-channel) — MCP ticket-sync blocked when state.blocked
	it('shouldBlockToolUse blocks mcp__wiki-jira-assistant__ when state.blocked', () => {
		const reason = shouldBlockToolUse({
			toolName: 'mcp__wiki-jira-assistant__jira_create',
			toolInput: { body: { summary: '[UC-CAR-007] test' } },
			state: { blocked: true, block_reason: 'validator_critical' },
		});
		assert.match(reason, /^R20 MCP ticket-sync blocked: validator_critical$/);
	});

	it('shouldBlockToolUse allows mcp__wiki-jira-assistant__ when state.blocked=false', () => {
		const reason = shouldBlockToolUse({
			toolName: 'mcp__wiki-jira-assistant__jira_transition',
			toolInput: { issueKey: 'MIG-1234', transitionId: '21' },
			state: { blocked: false },
		});
		assert.equal(reason, null);
	});

	it('shouldBlockToolUse blocks mcp__wiki-jira-assistant__ without file_path (state.blocked)', () => {
		const reason = shouldBlockToolUse({
			toolName: 'mcp__wiki-jira-assistant__jira_search',
			toolInput: { jql: 'project = MIG' },
			state: { blocked: true },
		});
		assert.match(reason, /^R20 MCP ticket-sync blocked:/);
	});

	it('shouldBlockToolUse allows other MCP servers (non-wiki-jira-assistant) even when state.blocked', () => {
		const reason = shouldBlockToolUse({
			toolName: 'mcp__figma__authenticate',
			toolInput: {},
			state: { blocked: true, block_reason: 'validator_critical' },
		});
		assert.equal(reason, null);
	});
});

// session-handoff TRIGGER_PATTERNS (DEC-2026-06-11-session-handoff-convention)
describe('suggestSkillForPrompt — session-handoff', () => {
	it('세션 정리/마무리/인계/handoff 발화 → session-handoff', () => {
		assert.equal(suggestSkillForPrompt('세션 정리해줘'), 'session-handoff');
		assert.equal(suggestSkillForPrompt('이제 세션 마무리하자'), 'session-handoff');
		assert.equal(suggestSkillForPrompt('session wrap-up please'), 'session-handoff');
		assert.equal(suggestSkillForPrompt('인계 문서 갱신해줘'), 'session-handoff');
		assert.equal(suggestSkillForPrompt('HANDOFF 갱신'), 'session-handoff');
	});
	it('무관 발화 미발화 (과잉 트리거 가드)', () => {
		assert.equal(suggestSkillForPrompt('세션스토리지 버그 고쳐줘'), null);
		assert.equal(suggestSkillForPrompt('업무 인계 받았어'), null);
	});
	it('stage 트리거와 충돌 없음 — 기존 라우팅 무회귀', () => {
		assert.equal(suggestSkillForPrompt('구현 시작'), 'implement-generate-impl-spec');
	});
});

// DEC-2026-06-18 — 진입 라우터 (discovery 보편-라우터 / living-sync §4).
describe('동사 셋 통일 (dead-zone ③ 회귀 차단)', () => {
	// 이전: spec/plan/test/implement 가 (시작|진입|만들어) 3종만 → "구현해줘"·"spec 해줘" 미매칭 dead-zone.
	it('later-stage 패턴이 해줘/드라이브 동사를 인식 (이전 dead-zone)', () => {
		assert.equal(suggestSkillForPrompt('구현해줘'), 'implement-generate-impl-spec');
		assert.equal(suggestSkillForPrompt('spec 해줘'), 'spec-compose-behavior-spec');
		assert.equal(suggestSkillForPrompt('plan 드라이브'), 'plan-decompose-and-sequence');
		assert.equal(suggestSkillForPrompt('test 해줘'), 'test-generate-test-spec');
	});
});

describe('routeEntry — 진입 라우터 (①)', () => {
	it('stage 명시 트리거 → source=stage + 해당 skill/agent', () => {
		assert.deepEqual(routeEntry('구현 시작'), {
			skillId: 'implement-generate-impl-spec',
			agentId: 'implement-agent',
			source: 'stage',
		});
		assert.deepEqual(routeEntry('discovery 시작'), {
			skillId: 'discovery-from-analysis-output',
			agentId: 'discovery-agent',
			source: 'stage',
		});
	});
	it('stage 미지정 변경요청 → discovery-default 폴백 (silent pass-through 제거)', () => {
		const r = routeEntry('예약 취소 기능 추가해줘');
		assert.deepEqual(r, {
			skillId: 'discovery-from-nl-md',
			agentId: 'discovery-agent',
			source: 'discovery-default',
		});
		assert.equal(routeEntry('이 버그 고쳐줘').source, 'discovery-default');
		assert.equal(routeEntry('정렬 기능 붙여줘').source, 'discovery-default');
	});
	it('비-작업 prompt (질문/설명/감사) → null (오발 회피 / 침묵 보존)', () => {
		assert.equal(routeEntry('hello world'), null);
		assert.equal(routeEntry('이 코드 설명해줘'), null);
		assert.equal(routeEntry('고마워'), null);
		assert.equal(routeEntry(''), null);
		assert.equal(routeEntry(null), null);
	});
	it('session-handoff 발화는 work-verb 에 덮이지 않음 (stage 우선)', () => {
		assert.equal(routeEntry('세션 정리해줘').skillId, 'session-handoff');
	});
});

describe('isLaterStageSkill', () => {
	it('spec/plan/test/implement skill = true', () => {
		for (const s of [
			'spec-compose-behavior-spec',
			'plan-decompose-and-sequence',
			'test-generate-test-spec',
			'implement-generate-impl-spec',
		])
			assert.equal(isLaterStageSkill(s), true, s);
	});
	it('discovery/analysis/handoff/null = false', () => {
		for (const s of [
			'discovery-from-analysis-output',
			'discovery-from-nl-md',
			'analysis-input-collection',
			'session-handoff',
			null,
		])
			assert.equal(isLaterStageSkill(s), false, String(s));
	});
});

describe('coldStartSkipAheadReason — cold-start skip-ahead hard-block (②)', () => {
	const cold = { stage_progress: { discovery: { status: 'pending' } } };
	const inProgress = { stage_progress: { discovery: { status: 'in_progress' } } };
	const warm = { stage_progress: { discovery: { status: 'complete' } } };
	const chainWrite = (fname) => ({
		toolName: 'Write',
		toolInput: { file_path: `/p/.ai-context/output/${fname}` },
	});

	it('discovery 미진입(pending) + later-stage 산출물 write → block reason', () => {
		const r = coldStartSkipAheadReason({ ...chainWrite('behavior-spec.json'), activeChain: cold });
		assert.match(r, /cold-start skip-ahead 차단/);
		assert.match(r, /discovery/);
	});
	it('task-plan.json(신규 TASK 매핑) 도 block (이전 graph-artifact 미감지 갭 해소)', () => {
		const r = coldStartSkipAheadReason({ ...chainWrite('task-plan.json'), activeChain: cold });
		assert.match(r, /TASK/);
	});
	it('discovery-spec(UC) 자신 = 허용 (입구·라우터)', () => {
		assert.equal(
			coldStartSkipAheadReason({ ...chainWrite('discovery-spec.json'), activeChain: cold }),
			null,
		);
	});
	it('discovery in_progress/complete = 허용 (정상 순차 흐름 무회귀)', () => {
		assert.equal(coldStartSkipAheadReason({ ...chainWrite('behavior-spec.json'), activeChain: inProgress }), null);
		assert.equal(coldStartSkipAheadReason({ ...chainWrite('test-spec.json'), activeChain: warm }), null);
	});
	it('analysis 산출물 write = 무관 (chain 아님 → allow)', () => {
		assert.equal(
			coldStartSkipAheadReason({ ...chainWrite('domain.json'), activeChain: cold }),
			null,
		);
	});
	it('.ai-context 밖 경로 = 무관', () => {
		assert.equal(
			coldStartSkipAheadReason({
				toolName: 'Write',
				toolInput: { file_path: '/p/src/behavior-spec.json' },
				activeChain: cold,
			}),
			null,
		);
	});
	it('activeChain 부재/판정불가 = allow (graceful / 정직 한계)', () => {
		assert.equal(coldStartSkipAheadReason({ ...chainWrite('behavior-spec.json'), activeChain: null }), null);
		assert.equal(coldStartSkipAheadReason({ ...chainWrite('behavior-spec.json'), activeChain: {} }), null);
	});
});

describe('WORK_INTENT_KEYWORDS ⊆ hooks.json matcher (③ 비대칭 회귀 차단)', () => {
	it('모든 work-intent 키워드가 layer-1 matcher 에 존재 (미존재 시 hooks-bridge 미발화)', () => {
		const hooks = JSON.parse(
			readFileSync(new URL('../../../hooks/hooks.json', import.meta.url), 'utf8'),
		);
		const matcher = hooks.hooks.UserPromptSubmit[0].matcher;
		for (const kw of WORK_INTENT_KEYWORDS) {
			assert.ok(
				matcher.includes(kw),
				`hooks.json matcher 에 work-intent '${kw}' 누락 — discovery-default 폴백 발화 실패 위험`,
			);
		}
	});
});

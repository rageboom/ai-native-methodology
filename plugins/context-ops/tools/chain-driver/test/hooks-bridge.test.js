import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
	parseHookInput,
	buildSuggestOutput,
	buildBlockOutput,
	suggestSkillForPrompt,
	suggestAgentForPrompt,
	shouldBlockToolUse,
} from '../src/hooks-bridge.js';

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

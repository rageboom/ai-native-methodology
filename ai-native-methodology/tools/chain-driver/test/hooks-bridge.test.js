import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseHookInput, buildSuggestOutput, buildBlockOutput,
  suggestSkillForPrompt, shouldBlockToolUse,
} from '../src/hooks-bridge.js';

describe('hooks-bridge', () => {
  it('parseHookInput parses well-formed JSON object', () => {
    const r = parseHookInput('{"hook_event_name":"UserPromptSubmit","prompt":"hi"}');
    assert.equal(r.hook_event_name, 'UserPromptSubmit');
  });

  it('parseHookInput throws on empty stdin', () => {
    assert.throws(() => parseHookInput(''));
  });

  it('parseHookInput throws on bad JSON', () => {
    assert.throws(() => parseHookInput('{not json'));
  });

  it('buildSuggestOutput sets suppressOutput=true and additionalContext', () => {
    const out = buildSuggestOutput({ skillId: 'planning/x', meta: { name: 'x' } });
    assert.equal(out.suppressOutput, true);
    assert.match(out.hookSpecificOutput.additionalContext, /SHALL NOT auto-invoke/);
    assert.equal(out.continue, true);
  });

  it('buildBlockOutput sets decision=block + permissionDecision=deny', () => {
    const out = buildBlockOutput({ reason: 'validator_critical' });
    assert.equal(out.decision, 'block');
    assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
    assert.match(out.reason, /validator_critical/);
  });

  it('suggestSkillForPrompt matches planning trigger', () => {
    assert.equal(suggestSkillForPrompt('planning 시작해줘'), 'planning/extract-from-legacy');
  });

  it('suggestSkillForPrompt matches spec trigger', () => {
    assert.equal(suggestSkillForPrompt('spec 진입'), 'spec/compose-behavior-spec');
  });

  it('suggestSkillForPrompt returns null for unrelated prompt', () => {
    assert.equal(suggestSkillForPrompt('hello world'), null);
  });

  it('shouldBlockToolUse blocks Write under .aimd/output/ when state.blocked', () => {
    const reason = shouldBlockToolUse({
      toolName: 'Write',
      toolInput: { file_path: '/tmp/proj/.aimd/output/spec.json' },
      state: { blocked: true, block_reason: 'validator_critical' },
    });
    assert.equal(reason, 'validator_critical');
  });

  it('shouldBlockToolUse allows Write outside .aimd/output/', () => {
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
      toolInput: { file_path: '/tmp/proj/.aimd/output/spec.json' },
      state: { blocked: false },
    });
    assert.equal(reason, null);
  });
});

// hooks-bridge.js — Claude Code hooks 통합 (D21' 정합 / suppressOutput=true 의무).
//
// 입력: stdin JSON (hook event payload).
// 출력: stdout JSON ({suppressOutput, hookSpecificOutput, ...}).
// stderr: 사용자에게만 노출되는 메시지 (LLM 컨텍스트 격리).

import { formatHookBlockContext, formatSkillSuggestion } from './invoke-skill.js';

// Claude Code hooks output contract (정식 spec 정합).
export function buildSuggestOutput({ skillId, meta, sessionId }) {
  // suppressOutput=true → stdout 의 plain text 가 LLM context 로 흘러가지 않음.
  // additionalContext 에 차단 문구를 명시 동봉 (LLM 이 보더라도 invoke 금지 명령).
  return {
    suppressOutput: true,
    hookSpecificOutput: {
      additionalContext: formatHookBlockContext(skillId, meta),
    },
    // continue=true → hook 후 통상 동작.
    continue: true,
  };
}

export function buildBlockOutput({ reason, sessionId }) {
  // PreToolUse / PostToolUse 차단용 output. exit 2 로 차단 통지.
  return {
    decision: 'block',
    reason,
    hookSpecificOutput: {
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
  try { parsed = JSON.parse(jsonString); }
  catch (e) { throw new Error(`hook input parse failed: ${e.message}`); }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('hook input must be JSON object');
  }
  return parsed;
}

// Inspect a UserPromptSubmit prompt for chain stage trigger keywords.
const TRIGGER_PATTERNS = [
  { regex: /(planning|기획)\s*(시작|진입|만들어|드라이브)/i, skillId: 'planning/extract-from-legacy' },
  { regex: /(spec|명세|behavior)\s*(시작|진입|만들어)/i,       skillId: 'spec/compose-behavior-spec' },
  { regex: /(test|테스트)\s*(시작|진입|만들어)/i,               skillId: 'test/generate-test-spec' },
  { regex: /(implement|구현)\s*(시작|진입|만들어)/i,             skillId: 'implement/generate-impl-spec' },
];

export function suggestSkillForPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  for (const { regex, skillId } of TRIGGER_PATTERNS) {
    if (regex.test(prompt)) return skillId;
  }
  return null;
}

// Determine if a tool call should be blocked based on state.json blocked flag.
// Used for PreToolUse hook on Write/Edit targeting .aimd/output/**.
export function shouldBlockToolUse({ toolName, toolInput, state }) {
  if (!state?.blocked) return null;
  if (!['Write', 'Edit', 'NotebookEdit'].includes(toolName)) return null;
  const path = toolInput?.file_path || toolInput?.path || '';
  if (!path) return null;
  if (!path.includes('/.aimd/output/') && !path.includes('\\.aimd\\output\\')) return null;
  return state.block_reason || 'state.blocked=true';
}

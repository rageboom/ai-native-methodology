// hooks-bridge.js — Claude Code hooks 통합 (D21' 정합 / suppressOutput=true 의무).
//
// 입력: stdin JSON (hook event payload).
// 출력: stdout JSON ({suppressOutput, hookSpecificOutput, ...}).
// stderr: 사용자에게만 노출되는 메시지 (LLM 컨텍스트 격리).
//
// ★ v4.0 multi-agent paradigm (DEC-2026-05-17-v4-multi-agent-paradigm-채택):
// - TRIGGER_PATTERNS 의 각 entry 에 agentId 추가 (stage 별 sub-agent dispatch 권고)
// - suggestAgentForPrompt 신설 / suggestSkillForPrompt 보존 (옛 호환)
// - buildSuggestOutput / formatHookBlockContext 에 agentId optional — 자동 매핑

import { formatHookBlockContext, formatSkillSuggestion } from './invoke-skill.js';

// Claude Code hooks output contract (정식 spec 정합).
export function buildSuggestOutput({ skillId, meta, sessionId, agentId }) {
  // suppressOutput=true → stdout 의 plain text 가 LLM context 로 흘러가지 않음.
  // additionalContext 에 차단 문구를 명시 동봉 (LLM 이 보더라도 invoke 금지 명령).
  // ★ v4.0: agentId 가 있으면 agent dispatch 권고 동봉.
  return {
    suppressOutput: true,
    hookSpecificOutput: {
      additionalContext: formatHookBlockContext(skillId, meta, agentId),
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
// ★ v4.0: TRIGGER_PATTERNS 의 entry 마다 agentId 추가 (stage 별 sub-agent dispatch / DEC-2026-05-17).
// analysis stage entry 추가 (B1 보강 통합 / hooks-bridge TRIGGER_PATTERNS 가 chain 1~4 만 커버 → 5 stage 모두).
const TRIGGER_PATTERNS = [
  { regex: /(분석|검토|legacy|레거시|analysis)\s*(시작|진입|해줘|만들어|드라이브)/i,
    skillId: 'analysis-input-collection', agentId: 'analysis-agent' },
  { regex: /(planning|기획)\s*(시작|진입|만들어|드라이브)/i,
    skillId: 'planning-extract-from-legacy', agentId: 'planning-agent' },
  { regex: /(spec|명세|behavior)\s*(시작|진입|만들어)/i,
    skillId: 'spec-compose-behavior-spec', agentId: 'spec-agent' },
  { regex: /(test|테스트)\s*(시작|진입|만들어)/i,
    skillId: 'test-generate-test-spec', agentId: 'test-agent' },
  { regex: /(implement|구현)\s*(시작|진입|만들어)/i,
    skillId: 'implement-generate-impl-spec', agentId: 'implement-agent' },
];

export function suggestSkillForPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  for (const { regex, skillId } of TRIGGER_PATTERNS) {
    if (regex.test(prompt)) return skillId;
  }
  return null;
}

// ★ v4.0 신설 — agent dispatch 권고 (multi-agent paradigm / DEC-2026-05-17).
// main agent 가 Task tool 로 해당 stage agent 를 dispatch 권고 받음.
export function suggestAgentForPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  for (const { regex, agentId } of TRIGGER_PATTERNS) {
    if (regex.test(prompt)) return agentId;
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

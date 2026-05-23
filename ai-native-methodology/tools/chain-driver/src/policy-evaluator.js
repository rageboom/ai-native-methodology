// policy-evaluator.js
// ★ operation.md 결정 5 — 변경 종류 × chain 인접 단계 매트릭스 + code_pointer anchor 규칙 → {auto | propose | manual}.
// PostToolUse hook 이 호출 (evaluate_policy 함수 spec / hooks-bridge.js 가 wrap).
//
// 입력:
//   - change: { kind: 'typo'|'item_add'|'item_remove'|'semantic_change', origin_subkind: 'UC'|'BHV'|'AC'|'TC', target_subkind: 'BHV'|'AC'|'TC'|'IMPL' }
//   - codePointerChange (optional): { anchor_type, scope: 'path_only_patch'|'symbol_change' }
// 출력: { decision: 'auto'|'propose'|'manual', source: 'matrix'|'anchor'|'fallback', reasoning: string }

import { readFileSync, existsSync } from 'node:fs';

// chain 인접 단계 키 매핑 — origin_subkind + target_subkind → "UC_to_BHV" 등.
const ADJACENT_TIER_KEYS = Object.freeze({
  'UC->BHV':  'UC_to_BHV',
  'BHV->AC':  'BHV_to_AC',
  'AC->TC':   'AC_to_TC',
  'TC->IMPL': 'TC_to_IMPL',
});

export function loadPolicy(policyPath) {
  if (!existsSync(policyPath)) {
    throw new Error(`policy file not found: ${policyPath}`);
  }
  try {
    return JSON.parse(readFileSync(policyPath, 'utf-8'));
  } catch (e) {
    throw new Error(`policy JSON parse error at ${policyPath}: ${e.message}`);
  }
}

/**
 * 변경에 대한 자동 propagation 결정.
 * @param {Object} policy  loadPolicy 결과
 * @param {Object} change  { kind, origin_subkind, target_subkind }
 * @param {Object} [codePointerChange]  { anchor_type, scope } — 본문 무변경 시
 * @returns {{ decision, source, reasoning }}
 */
export function evaluatePolicy(policy, change, codePointerChange = null) {
  // --- code-pointer-only patch 우선 (anchor 룰이 매트릭스보다 specific) ---
  if (codePointerChange) {
    const { anchor_type, scope } = codePointerChange;
    const rule = policy?.code_pointer_anchor_rules?.[anchor_type];
    if (!rule) {
      return {
        decision: 'manual',
        source: 'fallback',
        reasoning: `unknown anchor_type '${anchor_type}' — manual conservative default`,
      };
    }
    const decision = rule[scope];
    if (!decision) {
      return {
        decision: 'manual',
        source: 'fallback',
        reasoning: `unknown anchor scope '${scope}' for ${anchor_type} — manual conservative default`,
      };
    }
    return {
      decision,
      source: 'anchor',
      reasoning: `code-pointer anchor rule: ${anchor_type}.${scope} = ${decision}`,
    };
  }

  // --- 변경 종류 × chain 인접 단계 매트릭스 ---
  const { kind, origin_subkind, target_subkind } = change ?? {};
  if (!kind || !origin_subkind || !target_subkind) {
    return {
      decision: 'manual',
      source: 'fallback',
      reasoning: 'incomplete change descriptor — manual conservative default',
    };
  }
  const tierKey = ADJACENT_TIER_KEYS[`${origin_subkind}->${target_subkind}`];
  if (!tierKey) {
    return {
      decision: 'manual',
      source: 'fallback',
      reasoning: `${origin_subkind}->${target_subkind} 은 chain 인접 단계가 아님 (매트릭스 미정의) — manual`,
    };
  }
  const row = policy?.change_tier_matrix?.[kind];
  if (!row) {
    return {
      decision: 'manual',
      source: 'fallback',
      reasoning: `unknown change kind '${kind}' — manual conservative default`,
    };
  }
  const decision = row[tierKey];
  if (!decision) {
    return {
      decision: 'manual',
      source: 'fallback',
      reasoning: `매트릭스에 ${kind}.${tierKey} 없음 — manual conservative default`,
    };
  }
  return {
    decision,
    source: 'matrix',
    reasoning: `change_tier_matrix.${kind}.${tierKey} = ${decision}`,
  };
}

// === auto-propose JSONL append helper (PostToolUse hook 용) ===
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * propose 또는 auto 결정을 JSONL 파일에 append (operation.md 결정 5 "auto-propose JSONL 기록").
 * @param {string} jsonlPath  대상 JSONL 경로
 * @param {Object} record     { decision, origin_id, affected_id, change, timestamp?, source, reasoning }
 */
export function appendProposeRecord(jsonlPath, record) {
  const line = JSON.stringify({
    timestamp: record.timestamp ?? new Date().toISOString(),
    ...record,
  });
  mkdirSync(dirname(jsonlPath), { recursive: true });
  appendFileSync(jsonlPath, line + '\n');
}

// === 카탈로그 export ===
export const DECISION_VALUES = Object.freeze(['auto', 'propose', 'manual']);
export const CHANGE_KINDS = Object.freeze(['typo', 'item_add', 'item_remove', 'semantic_change']);
export const ANCHOR_SCOPES = Object.freeze(['path_only_patch', 'symbol_change']);

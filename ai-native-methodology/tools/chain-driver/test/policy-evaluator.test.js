// policy-evaluator.test.js
// ★ operation.md 결정 5 — change_tier_matrix (3-tier × 4-edge) + anchor 규칙 → auto/propose/manual

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadPolicy, evaluatePolicy, appendProposeRecord, DECISION_VALUES, CHANGE_KINDS, ANCHOR_SCOPES } from '../src/policy-evaluator.js';
import { readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POLICY_PATH = join(__dirname, '..', '..', '..', 'policies', 'propagation-policy.json');
const policy = loadPolicy(POLICY_PATH);

// ============================================================================
// 1. loadPolicy
// ============================================================================

describe('loadPolicy', () => {
  it('실 policy 파일 로드 성공', () => {
    assert.ok(policy.change_tier_matrix);
    assert.ok(policy.code_pointer_anchor_rules);
    assert.ok(policy.edge_grade_overrides);
  });

  it('미존재 파일 → throw', () => {
    assert.throws(() => loadPolicy('/nonexistent.json'), /not found/);
  });
});

// ============================================================================
// 2. change_tier_matrix (operation.md 결정 5 표 정확히)
// ============================================================================

describe('change_tier_matrix — 4 변경 종류 × 4 chain 인접 단계', () => {
  it('typo: UC→BHV/BHV→AC/AC→TC 는 auto / TC→IMPL 은 manual', () => {
    for (const [origin, target, expected] of [
      ['UC', 'BHV', 'auto'], ['BHV', 'AC', 'auto'], ['AC', 'TC', 'auto'], ['TC', 'IMPL', 'manual'],
    ]) {
      const r = evaluatePolicy(policy, { kind: 'typo', origin_subkind: origin, target_subkind: target });
      assert.equal(r.decision, expected, `typo ${origin}→${target}`);
      assert.equal(r.source, 'matrix');
    }
  });

  it('item_add: UC→BHV/BHV→AC/AC→TC 는 propose / TC→IMPL 은 manual', () => {
    for (const [origin, target, expected] of [
      ['UC', 'BHV', 'propose'], ['BHV', 'AC', 'propose'], ['AC', 'TC', 'propose'], ['TC', 'IMPL', 'manual'],
    ]) {
      const r = evaluatePolicy(policy, { kind: 'item_add', origin_subkind: origin, target_subkind: target });
      assert.equal(r.decision, expected, `item_add ${origin}→${target}`);
    }
  });

  it('item_remove: 모든 단계 manual', () => {
    for (const [origin, target] of [['UC', 'BHV'], ['BHV', 'AC'], ['AC', 'TC'], ['TC', 'IMPL']]) {
      const r = evaluatePolicy(policy, { kind: 'item_remove', origin_subkind: origin, target_subkind: target });
      assert.equal(r.decision, 'manual');
    }
  });

  it('semantic_change: 모든 단계 manual', () => {
    for (const [origin, target] of [['UC', 'BHV'], ['BHV', 'AC'], ['AC', 'TC'], ['TC', 'IMPL']]) {
      const r = evaluatePolicy(policy, { kind: 'semantic_change', origin_subkind: origin, target_subkind: target });
      assert.equal(r.decision, 'manual');
    }
  });

  it('chain 인접이 아닌 단계 (예: UC→AC) → fallback manual', () => {
    const r = evaluatePolicy(policy, { kind: 'typo', origin_subkind: 'UC', target_subkind: 'AC' });
    assert.equal(r.decision, 'manual');
    assert.equal(r.source, 'fallback');
    assert.match(r.reasoning, /chain 인접 단계가 아님/);
  });

  it('unknown change kind → fallback manual', () => {
    const r = evaluatePolicy(policy, { kind: 'magic', origin_subkind: 'UC', target_subkind: 'BHV' });
    assert.equal(r.decision, 'manual');
    assert.equal(r.source, 'fallback');
  });

  it('incomplete descriptor → fallback manual', () => {
    const r = evaluatePolicy(policy, {});
    assert.equal(r.decision, 'manual');
    assert.equal(r.source, 'fallback');
  });
});

// ============================================================================
// 3. code_pointer_anchor_rules (operation.md 결정 5 anchor 매트릭스)
// ============================================================================

describe('code_pointer_anchor_rules — anchor_type × scope', () => {
  it('strict_path: path_only_patch=auto / symbol_change=manual', () => {
    const a = evaluatePolicy(policy, {}, { anchor_type: 'strict_path', scope: 'path_only_patch' });
    const b = evaluatePolicy(policy, {}, { anchor_type: 'strict_path', scope: 'symbol_change' });
    assert.equal(a.decision, 'auto'); assert.equal(a.source, 'anchor');
    assert.equal(b.decision, 'manual'); assert.equal(b.source, 'anchor');
  });

  it('glob: path_only_patch=auto / symbol_change=manual', () => {
    assert.equal(evaluatePolicy(policy, {}, { anchor_type: 'glob', scope: 'path_only_patch' }).decision, 'auto');
    assert.equal(evaluatePolicy(policy, {}, { anchor_type: 'glob', scope: 'symbol_change' }).decision, 'manual');
  });

  it('ast_symbol: 모두 manual (operation.md 결정 5 — 심볼 식별이 의미 변경 가능성)', () => {
    assert.equal(evaluatePolicy(policy, {}, { anchor_type: 'ast_symbol', scope: 'path_only_patch' }).decision, 'manual');
    assert.equal(evaluatePolicy(policy, {}, { anchor_type: 'ast_symbol', scope: 'symbol_change' }).decision, 'manual');
  });

  it('doc_link: path_only_patch=auto / symbol_change=manual', () => {
    assert.equal(evaluatePolicy(policy, {}, { anchor_type: 'doc_link', scope: 'path_only_patch' }).decision, 'auto');
    assert.equal(evaluatePolicy(policy, {}, { anchor_type: 'doc_link', scope: 'symbol_change' }).decision, 'manual');
  });

  it('anchor 룰이 매트릭스보다 우선 (codePointerChange 인자가 주어지면 항상 anchor 평가)', () => {
    const r = evaluatePolicy(
      policy,
      { kind: 'typo', origin_subkind: 'UC', target_subkind: 'BHV' },
      { anchor_type: 'ast_symbol', scope: 'path_only_patch' },
    );
    assert.equal(r.source, 'anchor');
    assert.equal(r.decision, 'manual'); // ast_symbol path patch = manual
  });

  it('unknown anchor_type → fallback manual', () => {
    const r = evaluatePolicy(policy, {}, { anchor_type: 'mystery', scope: 'path_only_patch' });
    assert.equal(r.decision, 'manual');
    assert.equal(r.source, 'fallback');
  });
});

// ============================================================================
// 4. appendProposeRecord (JSONL 기록 — operation.md 결정 5)
// ============================================================================

describe('appendProposeRecord — auto-propose JSONL 기록', () => {
  it('JSONL 파일에 record 라인 append + mkdir 자동', () => {
    const dir = mkdtempSync(join(tmpdir(), 'policy-eval-'));
    const path = join(dir, 'subdir', 'propose.jsonl');
    appendProposeRecord(path, { decision: 'propose', origin_id: 'BHV-1', affected_id: 'AC-1', change: 'item_add', source: 'matrix', reasoning: 'test' });
    appendProposeRecord(path, { decision: 'auto', origin_id: 'UC-1', affected_id: 'BHV-1', change: 'typo', source: 'matrix', reasoning: 'test2' });
    const content = readFileSync(path, 'utf-8');
    const lines = content.trim().split('\n');
    assert.equal(lines.length, 2);
    const r1 = JSON.parse(lines[0]);
    assert.equal(r1.decision, 'propose');
    assert.ok(r1.timestamp);
    rmSync(dir, { recursive: true });
  });
});

// ============================================================================
// 5. 카탈로그
// ============================================================================

describe('카탈로그', () => {
  it('DECISION_VALUES = auto/propose/manual', () => {
    assert.deepEqual([...DECISION_VALUES], ['auto', 'propose', 'manual']);
  });
  it('CHANGE_KINDS = 4 종 (operation.md 결정 5)', () => {
    assert.equal(CHANGE_KINDS.length, 4);
  });
  it('ANCHOR_SCOPES = 2 (path_only_patch / symbol_change)', () => {
    assert.deepEqual([...ANCHOR_SCOPES], ['path_only_patch', 'symbol_change']);
  });
});

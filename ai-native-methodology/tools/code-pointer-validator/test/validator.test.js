// code-pointer-validator.test.js
// ★ operation.md 결정 3 + P2 — code_pointer coverage + 경로 존재 검증.
//
// 검증 범위:
//   1. coverage — code_pointers ≥ 1 OR code_pointers_na=true 의무
//   2. anchor_type 별 path/glob/symbol 검증
//   3. propose/deprecated 노드 coverage 제외
//   4. stale 플래그 → medium finding
//   5. invalid anchor_type → high finding
//   6. NA + pointers 동시 → low conflict finding

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCodePointers } from '../src/validator.js';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function node(id, opts = {}) {
  return {
    id,
    artifact_kind: opts.kind ?? 'chain',
    artifact_subkind: opts.subkind ?? 'BHV',
    source_path: opts.source_path ?? `${id}.md`,
    state: opts.state ?? 'active',
    ...(opts.code_pointers ? { code_pointers: opts.code_pointers } : {}),
    ...(opts.code_pointers_na !== undefined ? { code_pointers_na: opts.code_pointers_na } : {}),
  };
}

// fake repo root for path existence tests
function makeRepoRoot() {
  const dir = mkdtempSync(join(tmpdir(), 'cp-validator-'));
  writeFileSync(join(dir, 'real.kt'), 'fun signup() {}');
  writeFileSync(join(dir, 'auth-helper.kt'), 'class Helper');
  return dir;
}

// ============================================================================
// 1. coverage — 24 artifact 100% 룰
// ============================================================================

describe('coverage — code_pointers OR code_pointers_na 의무', () => {
  it('code_pointers 있음 → coverage 정상, finding 없음', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', { code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }] })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    assert.equal(r.coverage.covered, 1);
    assert.equal(r.coverage.missing, 0);
    assert.equal(r.coverage.ratio, 1.0);
    assert.equal(r.summary.total_findings, 0);
    rmSync(repo, { recursive: true });
  });

  it('code_pointers_na=true → coverage 정상 (명시적 N/A)', () => {
    const graph = {
      nodes: [node('analysis-domain', { kind: 'analysis', subkind: 'domain', code_pointers_na: true })],
    };
    const r = validateCodePointers(graph);
    assert.equal(r.coverage.explicit_na, 1);
    assert.equal(r.coverage.missing, 0);
    assert.equal(r.coverage.ratio, 1.0);
    assert.equal(r.summary.total_findings, 0);
  });

  it('code_pointers 도 NA 도 없음 → coverage_missing finding (medium)', () => {
    const graph = { nodes: [node('BHV-001')] };
    const r = validateCodePointers(graph);
    assert.equal(r.coverage.missing, 1);
    assert.equal(r.coverage.ratio, 0);
    const missing = r.findings.find(f => f.kind === 'code_pointer.coverage_missing');
    assert.ok(missing);
    assert.equal(missing.severity, 'medium');
    assert.equal(missing.artifact_id, 'BHV-001');
  });

  it('--strict 모드 → coverage_missing 이 high', () => {
    const graph = { nodes: [node('BHV-001')] };
    const r = validateCodePointers(graph, { opts: { strict: true } });
    const missing = r.findings.find(f => f.kind === 'code_pointer.coverage_missing');
    assert.equal(missing.severity, 'high');
  });

  it('NA + pointers 동시 → na_conflict low finding', () => {
    const graph = {
      nodes: [node('BHV-001', {
        code_pointers_na: true,
        code_pointers: [{ path: 'foo.kt', anchor_type: 'strict_path' }],
      })],
    };
    const r = validateCodePointers(graph);
    const conflict = r.findings.find(f => f.kind === 'code_pointer.na_conflict');
    assert.ok(conflict);
    assert.equal(conflict.severity, 'low');
  });
});

// ============================================================================
// 2. anchor_type 별 검증
// ============================================================================

describe('anchor_type 별 검증', () => {
  it('strict_path: 존재하는 경로 → 통과', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', { code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }] })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    assert.equal(r.findings.length, 0);
    rmSync(repo, { recursive: true });
  });

  it('strict_path: 존재하지 않는 경로 → path_missing (medium)', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', { code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }] })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    const f = r.findings.find(x => x.kind === 'code_pointer.path_missing');
    assert.ok(f);
    assert.equal(f.severity, 'medium');
    rmSync(repo, { recursive: true });
  });

  it('strict_path: 존재하지 않음 + --strict → high', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', { code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }] })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo, opts: { strict: true } });
    const f = r.findings.find(x => x.kind === 'code_pointer.path_missing');
    assert.equal(f.severity, 'high');
    rmSync(repo, { recursive: true });
  });

  it('glob: 와일드카드 매칭 → 통과', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', { code_pointers: [{ path: 'auth-*.kt', anchor_type: 'glob' }] })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    assert.equal(r.findings.length, 0);
    rmSync(repo, { recursive: true });
  });

  it('glob: 매칭 없음 → glob_no_match (medium)', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', { code_pointers: [{ path: 'no-*.kt', anchor_type: 'glob' }] })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    const f = r.findings.find(x => x.kind === 'code_pointer.glob_no_match');
    assert.ok(f);
    rmSync(repo, { recursive: true });
  });

  it('ast_symbol: symbol 비어있음 → high finding', () => {
    const graph = {
      nodes: [node('BHV-001', { code_pointers: [{ path: 'real.kt', anchor_type: 'ast_symbol' }] })],
    };
    const r = validateCodePointers(graph);
    const f = r.findings.find(x => x.kind === 'code_pointer.ast_symbol_missing_symbol');
    assert.ok(f);
    assert.equal(f.severity, 'high');
  });

  it('ast_symbol: symbol 있고 path 존재 → 통과 (best-effort)', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', {
        code_pointers: [{ path: 'real.kt', anchor_type: 'ast_symbol', symbol: 'signup' }],
      })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    assert.equal(r.findings.length, 0);
    rmSync(repo, { recursive: true });
  });

  it('doc_link: URL 형식 → 통과 (네트워크 검증 외부)', () => {
    const graph = {
      nodes: [node('BHV-001', {
        code_pointers: [{ path: 'https://wiki.example.com/foo', anchor_type: 'doc_link' }],
      })],
    };
    const r = validateCodePointers(graph);
    assert.equal(r.findings.length, 0);
  });

  it('doc_link: URL 도 아니고 로컬 경로도 없음 → low warn', () => {
    const graph = {
      nodes: [node('BHV-001', {
        code_pointers: [{ path: 'docs/ghost.md', anchor_type: 'doc_link' }],
      })],
    };
    const r = validateCodePointers(graph);
    const f = r.findings.find(x => x.kind === 'code_pointer.doc_link_unreachable');
    assert.ok(f);
    assert.equal(f.severity, 'low');
  });

  it('invalid anchor_type → high', () => {
    const graph = {
      nodes: [node('BHV-001', {
        code_pointers: [{ path: 'x', anchor_type: 'mystery' }],
      })],
    };
    const r = validateCodePointers(graph);
    const f = r.findings.find(x => x.kind === 'code_pointer.invalid_anchor_type');
    assert.equal(f.severity, 'high');
  });
});

// ============================================================================
// 3. state 별 coverage 처리
// ============================================================================

describe('state 별 coverage 처리', () => {
  it('propose 노드는 coverage 대상 제외', () => {
    const graph = { nodes: [node('BHV-PROP', { state: 'propose' })] };
    const r = validateCodePointers(graph);
    assert.equal(r.coverage.tier1_traversable, 0);
    assert.equal(r.coverage.ratio, 1.0);
    assert.equal(r.summary.total_findings, 0);
  });

  it('deprecated 노드는 coverage 대상 제외', () => {
    const graph = { nodes: [node('BHV-OLD', { state: 'deprecated' })] };
    const r = validateCodePointers(graph);
    assert.equal(r.coverage.tier1_traversable, 0);
    assert.equal(r.summary.total_findings, 0);
  });

  it('drift 노드는 active 와 동일하게 coverage 검사', () => {
    const graph = { nodes: [node('BHV-1', { state: 'drift' })] };
    const r = validateCodePointers(graph);
    assert.equal(r.coverage.missing, 1);
  });
});

// ============================================================================
// 4. stale 플래그
// ============================================================================

describe('stale 플래그 처리 (결정 5 매트릭스 입력)', () => {
  it('pointer.stale=true → stale_flag medium finding (informational)', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [node('BHV-001', {
        code_pointers: [{
          path: 'real.kt', anchor_type: 'strict_path', stale: true,
          suggested_path: 'real-new.kt',
        }],
      })],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    const f = r.findings.find(x => x.kind === 'code_pointer.stale_flag');
    assert.ok(f);
    assert.equal(f.severity, 'medium');
    assert.match(f.message, /suggested: real-new.kt/);
    rmSync(repo, { recursive: true });
  });
});

// ============================================================================
// 5. mixed coverage — 통합 시나리오
// ============================================================================

describe('mixed coverage — 통합 시나리오', () => {
  it('5 노드 중 3 covered / 1 NA / 1 missing → ratio 80%', () => {
    const repo = makeRepoRoot();
    const graph = {
      nodes: [
        node('UC-1', { subkind: 'UC', code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }] }),
        node('BHV-1', { subkind: 'BHV', code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }] }),
        node('AC-1', { subkind: 'AC', code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }] }),
        node('analysis-domain', { kind: 'analysis', subkind: 'domain', code_pointers_na: true }),
        node('aspect-i18n', { kind: 'aspect', subkind: 'i18n' }), // missing
      ],
    };
    const r = validateCodePointers(graph, { repoRoot: repo });
    assert.equal(r.coverage.covered, 3);
    assert.equal(r.coverage.explicit_na, 1);
    assert.equal(r.coverage.missing, 1);
    assert.equal(r.coverage.tier1_traversable, 5);
    assert.equal(r.coverage.ratio, 0.8);
    rmSync(repo, { recursive: true });
  });

  it('빈 그래프 → ratio 1.0 (vacuous pass)', () => {
    const r = validateCodePointers({ nodes: [] });
    assert.equal(r.coverage.ratio, 1.0);
    assert.equal(r.summary.total_findings, 0);
  });

  it('null/undefined 입력 방어', () => {
    assert.doesNotThrow(() => validateCodePointers({}));
    assert.doesNotThrow(() => validateCodePointers({ nodes: null }));
    assert.doesNotThrow(() => validateCodePointers(null));
  });
});

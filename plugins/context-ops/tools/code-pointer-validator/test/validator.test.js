// code-pointer-validator.test.js
// operation.md 결정 3 + P2 — code_pointer coverage + 경로 존재 검증.
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
import {
	validateCodePointers,
	applyContentDrift,
	checkGraphFreshness,
	computeGateFail,
	detectContentDrift,
} from '../src/validator.js';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
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
		...(opts.code_pointers_na !== undefined
			? { code_pointers_na: opts.code_pointers_na }
			: {}),
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
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }],
				}),
			],
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
			nodes: [
				node('analysis-domain', {
					kind: 'analysis',
					subkind: 'domain',
					code_pointers_na: true,
				}),
			],
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
		const missing = r.findings.find(
			(f) => f.kind === 'code_pointer.coverage_missing',
		);
		assert.ok(missing);
		assert.equal(missing.severity, 'medium');
		assert.equal(missing.artifact_id, 'BHV-001');
	});

	it('--strict 모드 → coverage_missing 이 high', () => {
		const graph = { nodes: [node('BHV-001')] };
		const r = validateCodePointers(graph, { opts: { strict: true } });
		const missing = r.findings.find(
			(f) => f.kind === 'code_pointer.coverage_missing',
		);
		assert.equal(missing.severity, 'high');
	});

	it('NA + pointers 동시 → na_conflict low finding', () => {
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers_na: true,
					code_pointers: [{ path: 'foo.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph);
		const conflict = r.findings.find(
			(f) => f.kind === 'code_pointer.na_conflict',
		);
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
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		assert.equal(r.findings.length, 0);
		rmSync(repo, { recursive: true });
	});

	it('strict_path: 존재하지 않는 경로 → path_missing (medium)', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		const f = r.findings.find((x) => x.kind === 'code_pointer.path_missing');
		assert.ok(f);
		assert.equal(f.severity, 'medium');
		rmSync(repo, { recursive: true });
	});

	it('strict_path: 존재하지 않음 + --strict → high', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { strict: true },
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.path_missing');
		assert.equal(f.severity, 'high');
		rmSync(repo, { recursive: true });
	});

	it('glob: 와일드카드 매칭 → 통과', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'auth-*.kt', anchor_type: 'glob' }],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		assert.equal(r.findings.length, 0);
		rmSync(repo, { recursive: true });
	});

	it('glob: 매칭 없음 → glob_no_match (medium)', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'no-*.kt', anchor_type: 'glob' }],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		const f = r.findings.find((x) => x.kind === 'code_pointer.glob_no_match');
		assert.ok(f);
		rmSync(repo, { recursive: true });
	});

	// v11.23.0 Slice 2 (REVISE-C) — architecture dir glob anchor (glob 필드 부재 / '*' 없음).
	//   synthesizer 가 modules[].path 디렉토리를 {path:dir, anchor_type:'glob'} 로 emit → validator
	//   simpleGlobMatch 가 '*' 부재 시 existsSync(dir) 로 매칭 → glob_no_match 0 + covered 집계.
	//   commit_hash 미부여(synthesizer strict_path 한정)라 A2 분기(gitRunner && commit_hash) 미진입 = A2 제외.
	it('glob: 디렉토리 앵커(glob 필드 부재) → existsSync(dir) 매칭 → glob_no_match 0 + covered', () => {
		const repo = makeRepoRoot();
		mkdirSync(join(repo, 'src', 'api'), { recursive: true });
		const graph = {
			nodes: [
				node('analysis-architecture', {
					kind: 'analysis',
					subkind: 'architecture',
					code_pointers: [{ path: 'src/api', anchor_type: 'glob' }], // glob 필드 부재 = dir 단위 앵커
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		assert.equal(
			r.findings.filter((f) => f.kind === 'code_pointer.glob_no_match').length,
			0,
			'dir 존재 → glob_no_match 0',
		);
		assert.equal(r.coverage.covered, 1, 'glob dir anchor = covered 집계');
		assert.equal(r.coverage.missing, 0);
		rmSync(repo, { recursive: true });
	});

	it('ast_symbol: symbol 비어있음 → high finding', () => {
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'real.kt', anchor_type: 'ast_symbol' }],
				}),
			],
		};
		const r = validateCodePointers(graph);
		const f = r.findings.find(
			(x) => x.kind === 'code_pointer.ast_symbol_missing_symbol',
		);
		assert.ok(f);
		assert.equal(f.severity, 'high');
	});

	it('ast_symbol: symbol 있고 path 존재 → 통과 (best-effort)', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [
						{ path: 'real.kt', anchor_type: 'ast_symbol', symbol: 'signup' },
					],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		assert.equal(r.findings.length, 0);
		rmSync(repo, { recursive: true });
	});

	it('doc_link: URL 형식 → 통과 (네트워크 검증 외부)', () => {
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [
						{ path: 'https://wiki.example.com/foo', anchor_type: 'doc_link' },
					],
				}),
			],
		};
		const r = validateCodePointers(graph);
		assert.equal(r.findings.length, 0);
	});

	it('doc_link: URL 도 아니고 로컬 경로도 없음 → low warn', () => {
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'docs/ghost.md', anchor_type: 'doc_link' }],
				}),
			],
		};
		const r = validateCodePointers(graph);
		const f = r.findings.find(
			(x) => x.kind === 'code_pointer.doc_link_unreachable',
		);
		assert.ok(f);
		assert.equal(f.severity, 'low');
	});

	it('invalid anchor_type → high', () => {
		const graph = {
			nodes: [
				node('BHV-001', {
					code_pointers: [{ path: 'x', anchor_type: 'mystery' }],
				}),
			],
		};
		const r = validateCodePointers(graph);
		const f = r.findings.find(
			(x) => x.kind === 'code_pointer.invalid_anchor_type',
		);
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
			nodes: [
				node('BHV-001', {
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							stale: true,
							suggested_path: 'real-new.kt',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		const f = r.findings.find((x) => x.kind === 'code_pointer.stale_flag');
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
				node('UC-1', {
					subkind: 'UC',
					code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }],
				}),
				node('BHV-1', {
					subkind: 'BHV',
					code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }],
				}),
				node('AC-1', {
					subkind: 'AC',
					code_pointers: [{ path: 'real.kt', anchor_type: 'strict_path' }],
				}),
				node('analysis-domain', {
					kind: 'analysis',
					subkind: 'domain',
					code_pointers_na: true,
				}),
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

// ============================================================================
// 6. Loop A (동기화 루프) — A3 relocation / A2 content-drift / A1 freshness
//    git 신호는 opt-in (opts.gitRunner). 미주입 = 기존 behavior (회귀 가드).
// ============================================================================

// 설정 가능한 fake gitRunner — 실 git 없이 결정적 단위테스트.
//   v0.10.0 — findRelocation 가 pathspec 을 제거(실 git rename 미탐 버그 fix) → log 분기는 last arg(구 pathspec)
//   대신 renameFrom(검색 대상 path / 테스트 pointer='ghost.kt' 기본)으로 R 라인 source 를 키잉. diff 분기는 무변경.
function fakeGit({
	renameTo = null,
	renameFrom = 'ghost.kt',
	changed = false,
	throwCmd = null,
} = {}) {
	return (args) => {
		if (throwCmd && args[0] === throwCmd) throw new Error('git unavailable');
		const last = args[args.length - 1];
		if (args[0] === 'log')
			return renameTo ? `R100\t${renameFrom}\t${renameTo}\n` : '';
		if (args[0] === 'diff') return changed ? `${last}\n` : '';
		return '';
	};
}

describe('Loop A / A3 — relocation → suggested_path', () => {
	it('path_missing + gitRunner 이동추적 성공(새 경로 존재) → finding.suggested_path', () => {
		const repo = makeRepoRoot();
		writeFileSync(join(repo, 'moved.kt'), 'fun signup() {}'); // 이동처 실제 존재
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { gitRunner: fakeGit({ renameTo: 'moved.kt' }) },
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.path_missing');
		assert.ok(f);
		assert.equal(f.suggested_path, 'moved.kt');
		rmSync(repo, { recursive: true });
	});

	it('이동처가 현재 존재하지 않으면 제안 안 함 (날조 ❌)', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { gitRunner: fakeGit({ renameTo: 'nonexistent.kt' }) },
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.path_missing');
		assert.ok(f);
		assert.equal(f.suggested_path, undefined);
		rmSync(repo, { recursive: true });
	});

	it('gitRunner throw (git 부재) → graceful, suggested_path 없음', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { gitRunner: fakeGit({ throwCmd: 'log' }) },
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.path_missing');
		assert.ok(f);
		assert.equal(f.suggested_path, undefined);
		rmSync(repo, { recursive: true });
	});

	it('회귀 가드 — gitRunner 미주입이면 suggested_path 시도 안 함', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [{ path: 'ghost.kt', anchor_type: 'strict_path' }],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		const f = r.findings.find((x) => x.kind === 'code_pointer.path_missing');
		assert.ok(f);
		assert.equal(f.suggested_path, undefined);
		rmSync(repo, { recursive: true });
	});
});

describe('Loop A / A2 — content-drift 탐지', () => {
	it('파일 존재 + commit_hash + git 변경감지 → content_drift finding', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { gitRunner: fakeGit({ changed: true }) },
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.content_drift');
		assert.ok(f);
		assert.equal(f.artifact_id, 'IMPL-1');
		assert.equal(f.base_commit, 'abc1234');
		rmSync(repo, { recursive: true });
	});

	it('변경 없음 → content_drift 없음', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { gitRunner: fakeGit({ changed: false }) },
		});
		assert.equal(
			r.findings.find((x) => x.kind === 'code_pointer.content_drift'),
			undefined,
		);
		rmSync(repo, { recursive: true });
	});

	it('회귀 가드 — gitRunner 미주입이면 commit_hash 있어도 content_drift 없음', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, { repoRoot: repo });
		assert.equal(r.findings.length, 0);
		rmSync(repo, { recursive: true });
	});

	it('§8.1 — content_drift 는 --strict(opts.strict) 여도 medium 고정 (단일 도메인 latent hard-gate 회피)', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { gitRunner: fakeGit({ changed: true }), strict: true },
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.content_drift');
		assert.ok(f);
		assert.equal(f.severity, 'medium'); // --strict 에도 high 로 격상 ❌ — content_drift 는 gate-eligible 아님 (§8.1)
		rmSync(repo, { recursive: true });
	});
});

// ============================================================================
// Loop A / A2 — working-tree 모드 (커밋 안 한 변경 탐지 / F-DF-A2-003)
//   committed 모드(base→HEAD) 는 미커밋 변경을 못 봄. worktree 모드(base→작업트리 / HEAD 인자 제거) 는 봄 (superset).
// ============================================================================

// worktree vs committed 구분 fake — args 에 'HEAD' 유무로 분기.
//   committed: ['diff','--name-only',<base>,'HEAD','--',<path>]  → 'HEAD' 포함
//   worktree : ['diff','--name-only',<base>,'--',<path>]          → 'HEAD' 없음
function fakeGitWorktree({
	committedChanged = false,
	worktreeChanged = false,
} = {}) {
	return (args) => {
		if (args[0] !== 'diff') return '';
		const last = args[args.length - 1];
		const isCommitted = args.includes('HEAD');
		return (isCommitted ? committedChanged : worktreeChanged)
			? `${last}\n`
			: '';
	};
}

describe('Loop A / A2 — working-tree 모드 (커밋 안 한 변경 탐지 / F-DF-A2-003)', () => {
	it('worktree 모드 — 미커밋-only 변경 탐지 (committed 무변경 + worktree 변경) → content_drift + worktree:true', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: {
				gitRunner: fakeGitWorktree({
					committedChanged: false,
					worktreeChanged: true,
				}),
				worktree: true,
			},
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.content_drift');
		assert.ok(f, 'worktree 모드는 미커밋 변경을 탐지해야 함');
		assert.equal(f.worktree, true);
		assert.equal(f.severity, 'medium');
		rmSync(repo, { recursive: true });
	});

	it('회귀 가드 — committed(기본) 모드는 미커밋-only 변경 미탐지 (worktree opt 무 → HEAD 비교 = 기존 behavior 보존)', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: {
				gitRunner: fakeGitWorktree({
					committedChanged: false,
					worktreeChanged: true,
				}),
			},
		});
		assert.equal(
			r.findings.find((x) => x.kind === 'code_pointer.content_drift'),
			undefined,
		);
		rmSync(repo, { recursive: true });
	});

	it('args shape — worktree 모드는 HEAD 인자 제거 / committed 모드는 HEAD 포함 (detectContentDrift spy)', () => {
		const calls = [];
		const spy = (args) => {
			calls.push(args);
			return '';
		};
		detectContentDrift('real.kt', 'abc1234', {
			gitRunner: spy,
			includeWorktree: true,
		});
		detectContentDrift('real.kt', 'abc1234', {
			gitRunner: spy,
			includeWorktree: false,
		});
		assert.deepEqual(calls[0], [
			'diff',
			'--name-only',
			'abc1234',
			'--',
			'real.kt',
		]); // worktree: HEAD 없음
		assert.deepEqual(calls[1], [
			'diff',
			'--name-only',
			'abc1234',
			'HEAD',
			'--',
			'real.kt',
		]); // committed: HEAD 있음
	});

	it('detectContentDrift includeWorktree — worktree 변경만 있을 때 true / committed diff 는 false', () => {
		const g = fakeGitWorktree({
			committedChanged: false,
			worktreeChanged: true,
		});
		assert.equal(
			detectContentDrift('real.kt', 'abc1234', {
				gitRunner: g,
				includeWorktree: true,
			}),
			true,
		);
		assert.equal(
			detectContentDrift('real.kt', 'abc1234', {
				gitRunner: g,
				includeWorktree: false,
			}),
			false,
		);
	});

	it('§8.1 — worktree content_drift 도 medium 고정 + computeGateFail 제외 (strict 여도 gate ❌)', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: {
				gitRunner: fakeGitWorktree({ worktreeChanged: true }),
				worktree: true,
				strict: true,
			},
		});
		const f = r.findings.find((x) => x.kind === 'code_pointer.content_drift');
		assert.ok(f);
		assert.equal(f.severity, 'medium');
		assert.equal(computeGateFail(r.findings, { strict: true }), false); // worktree content_drift 도 gate 제외 (kind 재사용 상속)
		rmSync(repo, { recursive: true });
	});
});

describe('computeGateFail — §8.1 content_drift 는 gate(fail) 제외', () => {
	it('content_drift(medium) 단독은 --strict 여도 fail 아님 (decouple)', () => {
		const findings = [
			{
				kind: 'code_pointer.content_drift',
				severity: 'medium',
				artifact_id: 'X',
			},
		];
		assert.equal(computeGateFail(findings, { strict: false }), false);
		assert.equal(computeGateFail(findings, { strict: true }), false); // --strict 와 decouple — 핵심 anti-regression
	});

	it('high finding 은 strict 무관 fail / 일반 medium 은 --strict 일 때만 fail', () => {
		assert.equal(
			computeGateFail(
				[{ kind: 'code_pointer.path_missing', severity: 'high' }],
				{},
			),
			true,
		);
		const med = [{ kind: 'code_pointer.coverage_missing', severity: 'medium' }];
		assert.equal(computeGateFail(med, { strict: false }), false);
		assert.equal(computeGateFail(med, { strict: true }), true);
	});

	it('content_drift + 실제 gating finding 공존 시 gating finding 으로 fail (content_drift 는 무영향)', () => {
		const findings = [
			{ kind: 'code_pointer.content_drift', severity: 'medium' },
			{ kind: 'code_pointer.path_missing', severity: 'high' },
		];
		assert.equal(computeGateFail(findings, { strict: false }), true);
	});
});

describe('Loop A / A2 producer — applyContentDrift (state machine)', () => {
	it('active → drift + drift_reason / propose·drift 보존', () => {
		const graph = {
			nodes: [
				node('X', { state: 'active' }),
				node('Y', { state: 'propose' }),
				node('Z', { state: 'drift' }),
			],
		};
		const findings = [
			{ kind: 'code_pointer.content_drift', artifact_id: 'X' },
			{ kind: 'code_pointer.content_drift', artifact_id: 'Y' },
			{ kind: 'code_pointer.content_drift', artifact_id: 'Z' },
		];
		const res = applyContentDrift(graph, findings);
		assert.equal(res.applied, 1);
		assert.equal(graph.nodes[0].state, 'drift');
		assert.ok(graph.nodes[0].drift_reason);
		assert.equal(graph.nodes[1].state, 'propose'); // content_changed 무효 전이 → 보존
		assert.equal(graph.nodes[2].state, 'drift');
	});

	it('content_drift finding 없으면 무변경', () => {
		const graph = { nodes: [node('X', { state: 'active' })] };
		const res = applyContentDrift(graph, [
			{ kind: 'code_pointer.path_missing', artifact_id: 'X' },
		]);
		assert.equal(res.applied, 0);
		assert.equal(graph.nodes[0].state, 'active');
	});

	it('통합(A2-wire) — 탐지(validateCodePointers+git) → applyContentDrift → 노드 drift', () => {
		const repo = makeRepoRoot();
		const graph = {
			nodes: [
				node('IMPL-1', {
					subkind: 'IMPL',
					state: 'active',
					code_pointers: [
						{
							path: 'real.kt',
							anchor_type: 'strict_path',
							commit_hash: 'abc1234',
						},
					],
				}),
			],
		};
		const r = validateCodePointers(graph, {
			repoRoot: repo,
			opts: { gitRunner: fakeGit({ changed: true }) },
		});
		const res = applyContentDrift(graph, r.findings);
		assert.equal(res.applied, 1);
		assert.equal(graph.nodes[0].state, 'drift');
		assert.ok(graph.nodes[0].drift_reason);
		rmSync(repo, { recursive: true });
	});
});

describe('Loop A / A1 — checkGraphFreshness', () => {
	it('source 가 synthesized_at 이후 변경 → stale + finding', () => {
		const repo = makeRepoRoot();
		writeFileSync(join(repo, 'spec.json'), '{}'); // mtime = now
		const graph = {
			synthesized_at: '2000-01-01T00:00:00.000Z',
			derived_from: ['spec.json'],
		};
		const fr = checkGraphFreshness(graph, { repoRoot: repo });
		assert.equal(fr.stale, true);
		assert.ok(fr.finding);
		assert.deepEqual(fr.stale_sources, ['spec.json']);
		rmSync(repo, { recursive: true });
	});

	it('source 가 synthesized_at 이전 → not stale', () => {
		const repo = makeRepoRoot();
		writeFileSync(join(repo, 'spec.json'), '{}');
		const graph = {
			synthesized_at: '2999-01-01T00:00:00.000Z',
			derived_from: ['spec.json'],
		};
		const fr = checkGraphFreshness(graph, { repoRoot: repo });
		assert.equal(fr.stale, false);
		assert.equal(fr.finding, null);
		rmSync(repo, { recursive: true });
	});

	it('source 부재 → skip (stale 아님)', () => {
		const graph = {
			synthesized_at: '2000-01-01T00:00:00.000Z',
			derived_from: ['nonexistent-xyz.json'],
		};
		const fr = checkGraphFreshness(graph, { repoRoot: tmpdir() });
		assert.equal(fr.stale, false);
	});
});

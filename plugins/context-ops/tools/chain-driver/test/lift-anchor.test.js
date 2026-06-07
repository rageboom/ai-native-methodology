// lift-anchor.test.js — living-sync Phase 2 "lift" (손수정 코드 anchor → 천장 후보 surface → forward 재전파 / DEC §5 Phase 2)
//   ① 순수 코어 단위 (liftCandidates anchor·천장후보 hop정렬·unresolved / validateCeiling ancestry guard / 결정론)
//   ② no-simulation 실 fixture e2e (poc-05) — surface-only 기본 / 명시 천장 forward + hand-edited 제외 / 오-천장 거부 / durable / clobber
//   ③ 2nd 도메인 (poc-18 합성 graph / §8.1 ≥2 — Senior #8 = poc-16 IMPL 0건 대체)
//   ④ reference-lens trust 가드 (코어 gate 토큰·I/O 0)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
	mkdtempSync,
	mkdirSync,
	copyFileSync,
	writeFileSync,
	readFileSync,
	existsSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
	liftCandidates,
	validateCeiling,
	reconcileObserved,
	relocationSourceHint,
	ceilingOptionsForAnchor,
} from '../src/lift-anchor.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');
const SRC = join(__dirname, '..', 'src');
const EXAMPLES = join(__dirname, '..', '..', '..', 'examples');
const POC05 = join(EXAMPLES, 'poc-05-sample-user-register', '.aimd', 'output');
const POC05_GRAPH = join(POC05, 'artifact-graph.json');
const POC18_GRAPH = join(
	EXAMPLES,
	'poc-18-express-prisma-modern-ts',
	'target',
	'.aimd',
	'output',
	'artifact-graph.json',
);

function run(args) {
	return spawnSync('node', [CLI, ...args], { encoding: 'utf-8' });
}
function runJson(args) {
	const r = run(args);
	return { ...r, out: r.stdout ? JSON.parse(r.stdout) : null };
}

// 최소 chain fixture: IMPL ← TC ← AC ← BHV ← UC (hard tests/derived_from) + 무관 서브트리 + 무관 노드.
function graphFixture() {
	const node = (id, subkind, extra = {}) => ({
		id,
		artifact_kind: 'chain',
		artifact_subkind: subkind,
		state: 'active',
		...extra,
	});
	return {
		nodes: [
			node('UC-1', 'UC'),
			node('BHV-1', 'BHV'),
			node('AC-1', 'AC'),
			node('TC-1', 'TC'),
			node('IMPL-1', 'IMPL', {
				code_pointers: [{ path: 'src/foo.ts' }, { path: 'src/bar.ts' }],
			}),
			// 무관 서브트리 (다른 코드파일)
			node('UC-2', 'UC'),
			node('IMPL-2', 'IMPL', { code_pointers: [{ path: 'src/other.ts' }] }),
			// 비-조상 노드
			node('SCREEN-X', 'SCREEN'),
		],
		// edge 방향: source --type--> target. backward(IMPL) = source 들.
		edges: [
			{ source: 'UC-1', target: 'BHV-1', edge_type: 'derived_from', confidence: 'hard' },
			{ source: 'BHV-1', target: 'AC-1', edge_type: 'derived_from', confidence: 'hard' },
			{ source: 'AC-1', target: 'TC-1', edge_type: 'derived_from', confidence: 'hard' },
			{ source: 'TC-1', target: 'IMPL-1', edge_type: 'tests', confidence: 'hard' },
			{ source: 'UC-2', target: 'IMPL-2', edge_type: 'derived_from', confidence: 'hard' },
		],
	};
}

describe('lift-anchor core — liftCandidates', () => {
	it('코드파일 → anchor(주인 IMPL) + backward 천장 후보 hop 오름차순', () => {
		const r = liftCandidates(graphFixture(), ['src/foo.ts']);
		assert.deepEqual(r.anchors, ['IMPL-1']);
		// 천장 후보 = backward 조상 (TC→AC→BHV→UC), hop 오름차순
		const ids = r.ceilingCandidates.map((c) => c.id);
		assert.deepEqual(ids, ['TC-1', 'AC-1', 'BHV-1', 'UC-1']);
		assert.equal(r.ceilingCandidates[0].additional_hard_hops, 0); // TC = 최근접
		assert.ok(
			r.ceilingCandidates.every((c) => c.grade === 'MUST'),
			'hard chain = 전부 MUST',
		);
	});

	it('미해소 코드파일 = unresolved (coverage 상한 / 추적 밖)', () => {
		const r = liftCandidates(graphFixture(), ['src/ghost.ts']);
		assert.deepEqual(r.anchors, []);
		assert.deepEqual(r.unresolved, ['src/ghost.ts']);
		assert.deepEqual(r.ceilingCandidates, []);
	});

	it('여러 anchor → ceilingByAnchor 분리 + 합집합 최단 hop 유지', () => {
		const r = liftCandidates(graphFixture(), ['src/foo.ts', 'src/other.ts']);
		assert.deepEqual(r.anchors, ['IMPL-1', 'IMPL-2']);
		assert.deepEqual(r.ceilingByAnchor['IMPL-1'].sort(), [
			'AC-1',
			'BHV-1',
			'TC-1',
			'UC-1',
		]);
		assert.deepEqual(r.ceilingByAnchor['IMPL-2'], ['UC-2']);
	});

	it('결정론: 동일 입력 deep-equal', () => {
		const a = liftCandidates(graphFixture(), ['src/foo.ts']);
		const b = liftCandidates(graphFixture(), ['src/foo.ts']);
		assert.deepEqual(a, b);
	});
});

describe('lift-anchor core — validateCeiling (ancestry guard / R-D3 / Senior #4)', () => {
	const r = liftCandidates(graphFixture(), ['src/foo.ts']);
	it('backward 조상 천장 = valid', () => {
		const v = validateCeiling('BHV-1', r.anchors, r.ceilingByAnchor);
		assert.equal(v.valid, true);
		assert.deepEqual(v.validForAnchors, ['IMPL-1']);
	});
	it('anchor 자신 = valid (refactor / reconcile-only 허용)', () => {
		const v = validateCeiling('IMPL-1', r.anchors, r.ceilingByAnchor);
		assert.equal(v.valid, true);
	});
	it('비-조상(무관 노드) = invalid', () => {
		assert.equal(validateCeiling('SCREEN-X', r.anchors, r.ceilingByAnchor).valid, false);
	});
	it('다른 서브트리 조상 = invalid (오-seed 차단)', () => {
		assert.equal(validateCeiling('UC-2', r.anchors, r.ceilingByAnchor).valid, false);
	});
	it('비존재 id = invalid', () => {
		assert.equal(validateCeiling('NOPE-999', r.anchors, r.ceilingByAnchor).valid, false);
	});
});

describe('lift e2e (no-simulation / poc-05 실 fixture)', () => {
	it('기본(--ceiling 없음) = 천장 후보 surface-only / forward seed ❌ / propose-only (Senior #1)', () => {
		const { status, out } = runJson([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.ok(out.anchors.includes('IMPL-USER-001'));
		assert.ok(out.ceiling_candidates.length > 0);
		assert.equal(out.regen_queue, null);
		assert.equal(out.propose_only, true);
	});

	it('명시 --ceiling BHV-USER-001 → forward 재전파 + 손수정 IMPL 제외 (Senior #3)', () => {
		const { status, out } = runJson([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--ceiling',
			'BHV-USER-001',
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.equal(out.ceiling, 'BHV-USER-001');
		const ids = out.regen_queue.items.map((it) => it.id);
		assert.ok(ids.includes('BHV-USER-001'));
		assert.ok(ids.includes('AC-USER-001'));
		// ★ 손수정 anchor 는 큐에서 제외 (자기 코드 재생성 지시 회피)
		assert.ok(!ids.includes('IMPL-USER-001'), 'hand-edited 제외');
		assert.ok(out.hand_edited_excluded.includes('IMPL-USER-001'));
		assert.equal(out.regen_queue.source, 'lift');
	});

	it('오-천장(무관 노드) → exit 3 + 유효 후보 안내 (auto-climb ❌)', () => {
		const r = run([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--ceiling',
			'SCREEN-AUTH',
			'--dry-run',
		]);
		assert.equal(r.status, 3);
		assert.match(r.stderr, /backward 조상도 아님|auto-climb/);
	});

	it('비존재 천장 → exit 3', () => {
		const r = run([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--ceiling',
			'NOPE-999',
			'--dry-run',
		]);
		assert.equal(r.status, 3);
	});

	it('천장=anchor(refactor) → forward 빈 큐 / reconcile-only propose (Senior #1)', () => {
		const { status, out } = runJson([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--ceiling',
			'IMPL-USER-001',
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.equal(out.regen_queue.items.length, 0);
		assert.equal(out.propose_only, true);
	});

	it('미해소 코드파일 → anchor 0 + unresolved 보고 (조용히 누락 ❌)', () => {
		const { status, out } = runJson([
			'lift',
			'--changed',
			'target/src/nonexistent.ts',
			'--graph',
			POC05_GRAPH,
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.deepEqual(out.anchors, []);
		assert.deepEqual(out.unresolved, ['target/src/nonexistent.ts']);
	});

	it('--changed 없음 / --graph 없음 → exit 3 (usage)', () => {
		assert.equal(run(['lift', '--graph', POC05_GRAPH, '--dry-run']).status, 3);
		assert.equal(run(['lift', '--changed', 'x.ts', '--dry-run']).status, 3);
	});

	it('durable write: lift <project> --ceiling → state.json regen_queue', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'lift-w-'));
		try {
			mkdirSync(join(tmp, '.aimd', 'output'), { recursive: true });
			const g = join(tmp, '.aimd', 'output', 'artifact-graph.json');
			copyFileSync(POC05_GRAPH, g);
			assert.equal(run(['init', tmp]).status, 0);
			const { status, out } = runJson([
				'lift',
				tmp,
				'--changed',
				'target/src/user.service.ts',
				'--graph',
				g,
				'--ceiling',
				'BHV-USER-001',
				'--json',
			]);
			assert.equal(status, 0);
			assert.equal(out.written, true);
			const state = JSON.parse(
				readFileSync(join(tmp, '.aimd', 'state.json'), 'utf-8'),
			);
			assert.equal(state.regen_queue.source, 'lift');
			assert.equal(state.regen_queue.ceiling, 'BHV-USER-001');
			assert.deepEqual(state.regen_queue.items, out.regen_queue.items);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('clobber 가드: in-progress 큐에 lift → exit 2 / --force 교체', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'lift-c-'));
		try {
			mkdirSync(join(tmp, '.aimd', 'output'), { recursive: true });
			const g = join(tmp, '.aimd', 'output', 'artifact-graph.json');
			copyFileSync(POC05_GRAPH, g);
			run(['init', tmp]);
			run([
				'lift',
				tmp,
				'--changed',
				'target/src/user.service.ts',
				'--graph',
				g,
				'--ceiling',
				'BHV-USER-001',
			]);
			const clean = join(tmp, 'clean.json');
			writeFileSync(
				clean,
				JSON.stringify({ critical: 0, high: 0, medium: 0, low: 0, info: 0 }),
				'utf-8',
			);
			run(['sync-next', tmp, '--findings', clean]); // 1 stage done → in-progress

			const refuse = run([
				'lift',
				tmp,
				'--changed',
				'target/src/user.service.ts',
				'--graph',
				g,
				'--ceiling',
				'BHV-USER-001',
			]);
			assert.equal(refuse.status, 2, 'in-flight done 보호');

			const forced = runJson([
				'lift',
				tmp,
				'--changed',
				'target/src/user.service.ts',
				'--graph',
				g,
				'--ceiling',
				'BHV-USER-001',
				'--force',
				'--json',
			]);
			assert.equal(forced.status, 0);
			assert.equal(forced.out.written, true);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('결정론: 동일 lift 두 번 → items byte-identical', () => {
		const a = runJson([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--ceiling',
			'BHV-USER-001',
			'--dry-run',
			'--json',
		]);
		const b = runJson([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--ceiling',
			'BHV-USER-001',
			'--dry-run',
			'--json',
		]);
		assert.deepEqual(a.out.regen_queue.items, b.out.regen_queue.items);
		assert.deepEqual(a.out.ceiling_candidates, b.out.ceiling_candidates);
	});
});

describe('lift 2nd 도메인 (§8.1 ≥2 / poc-18 합성 graph — Senior #8)', () => {
	const hasPoc18 = existsSync(POC18_GRAPH);
	it('poc-18 (Modern Express/TS) lift anchor + 천장 후보 surface', { skip: !hasPoc18 ? 'poc-18 graph 미합성' : false }, () => {
		// poc-18 impl-spec IMPL-POST-001 source_files = src/modules/post/post.service.ts
		const { status, out } = runJson([
			'lift',
			'--changed',
			'src/modules/post/post.service.ts',
			'--graph',
			POC18_GRAPH,
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.ok(out.anchors.length > 0, 'IMPL anchor 해소');
		assert.ok(out.anchors.some((a) => a.startsWith('IMPL-')));
		// 천장 후보(BHV/AC/TC 상류) 존재 = 2nd 도메인서도 backward 메뉴 실현
		assert.ok(out.ceiling_candidates.length > 0);
		assert.equal(out.propose_only, true);
	});
});

describe('reconcileObserved core (Phase 2b 순수 분류 / Senior REVISE@0.82)', () => {
	it('relocation → 관측사실 후보 (유일 auto-update 후보)', () => {
		const cps = [{ anchor_type: 'strict_path', path: 'src/a.ts' }];
		const facts = [{ path: 'src/a.ts', content_drift: false, relocation: 'src/moved/a.ts' }];
		const r = reconcileObserved(cps, facts);
		assert.equal(r.observed_candidates.length, 1);
		assert.equal(r.observed_candidates[0].kind, 'path_relocated');
		assert.equal(r.observed_candidates[0].suggested, 'src/moved/a.ts');
		assert.equal(r.flags.length, 0);
	});

	it('content_drift=true → flag (후보 ❌ / Senior #2 = 재앵커는 의미 판정)', () => {
		const cps = [{ anchor_type: 'strict_path', path: 'src/a.ts', commit_hash: 'abc1234' }];
		const facts = [{ path: 'src/a.ts', content_drift: true, relocation: null }];
		const r = reconcileObserved(cps, facts);
		assert.equal(r.observed_candidates.length, 0, 'content_drift 는 후보 아님');
		assert.equal(r.flags.length, 1);
		assert.equal(r.flags[0].kind, 'content_drift');
	});

	it('사람의도 필드(symbol) 존재 → intent_review flag (자동 갱신 ❌)', () => {
		const cps = [{ anchor_type: 'strict_path', path: 'src/a.ts', symbol: 'UserService.create' }];
		const facts = [{ path: 'src/a.ts', content_drift: false, relocation: null }];
		const r = reconcileObserved(cps, facts);
		const intent = r.flags.find((f) => f.kind === 'intent_review');
		assert.ok(intent);
		assert.ok(intent.fields.includes('symbol'));
	});

	it('clean(무변경·무이동·무의도) → 후보·flag 0 (false-positive 분류 없음)', () => {
		const cps = [{ anchor_type: 'strict_path', path: 'src/a.ts', commit_hash: 'abc1234' }];
		const facts = [{ path: 'src/a.ts', content_drift: false, relocation: null }];
		const r = reconcileObserved(cps, facts);
		assert.equal(r.observed_candidates.length, 0);
		assert.equal(r.flags.length, 0);
	});

	it('content_drift=null(git 부재·판정불가) → flag 0 (날조 ❌ / carry)', () => {
		const cps = [{ anchor_type: 'strict_path', path: 'src/a.ts', commit_hash: 'abc1234' }];
		const facts = [{ path: 'src/a.ts', content_drift: null, relocation: null }];
		const r = reconcileObserved(cps, facts);
		assert.equal(r.flags.length, 0);
	});

	it('결정론: 동일 입력 deep-equal', () => {
		const cps = [{ anchor_type: 'strict_path', path: 'src/a.ts', symbol: 's' }];
		const facts = [{ path: 'src/a.ts', content_drift: true, relocation: 'src/b.ts' }];
		assert.deepEqual(reconcileObserved(cps, facts), reconcileObserved(cps, facts));
	});
});

function gitAvailable() {
	try {
		execFileSync('git', ['--version'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}
const GIT = gitAvailable();

describe('lift --reconcile e2e (real git / committed poc 2-도메인 = drift→flag 메커니즘)', () => {
	const REPO_ROOT = join(__dirname, '..', '..', '..', '..', '..'); // chain-driver/test → repo root
	const POC05_DIR = join(EXAMPLES, 'poc-05-sample-user-register');
	const POC18_DIR = join(EXAMPLES, 'poc-18-express-prisma-modern-ts', 'target');

	it('poc-05 --reconcile → content_drift=flag(후보 ❌) + propose_only + 그래프 mutation ❌', { skip: !GIT ? 'git 부재' : false }, () => {
		const before = readFileSync(POC05_GRAPH, 'utf-8');
		const { status, out } = runJson([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--reconcile',
			'--repo-root',
			POC05_DIR,
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.ok(out.reconcile);
		assert.equal(out.reconcile.propose_only, true);
		const flags = out.reconcile.anchors.flatMap((a) => a.flags);
		const cands = out.reconcile.anchors.flatMap((a) => a.observed_candidates);
		assert.ok(flags.some((f) => f.kind === 'content_drift'), 'stale stamp → content_drift flag');
		assert.equal(cands.length, 0, 'content_drift 는 후보 아님 (Senior #2)');
		// 그래프 byte-identical (durable mutation ❌)
		assert.equal(readFileSync(POC05_GRAPH, 'utf-8'), before);
	});

	it('poc-18 (2nd 도메인) --reconcile → content_drift=flag 메커니즘 corroboration', { skip: !GIT ? 'git 부재' : false }, () => {
		const { status, out } = runJson([
			'lift',
			'--changed',
			'src/modules/post/post.service.ts',
			'--graph',
			POC18_GRAPH,
			'--reconcile',
			'--repo-root',
			POC18_DIR,
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		const flags = out.reconcile.anchors.flatMap((a) => a.flags);
		assert.ok(flags.some((f) => f.kind === 'content_drift'));
	});
});

describe('lift --reconcile clean (tmp-git / false-positive 0 / no-simulation)', () => {
	it('commit_hash==현재 상태 → content_drift 0 (clean / false-positive 없음)', { skip: !GIT ? 'git 부재' : false }, () => {
		const tmp = mkdtempSync(join(tmpdir(), 'lift-recon-'));
		try {
			const git = (args) =>
				execFileSync('git', args, { cwd: tmp, stdio: ['ignore', 'pipe', 'ignore'] });
			git(['init', '-q']);
			git(['config', 'user.email', 't@t.t']);
			git(['config', 'user.name', 't']);
			mkdirSync(join(tmp, 'src'), { recursive: true });
			writeFileSync(join(tmp, 'src', 'svc.ts'), 'export const x = 1;\n', 'utf-8');
			git(['add', '.']);
			git(['commit', '-q', '-m', 'init']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
				cwd: tmp,
				encoding: 'utf-8',
			}).trim();
			// 그래프: IMPL 노드 + 현재 commit 으로 앵커된 pointer (무변경 = clean)
			const graph = {
				nodes: [
					{
						id: 'IMPL-X',
						artifact_kind: 'chain',
						artifact_subkind: 'IMPL',
						state: 'active',
						code_pointers: [
							{ anchor_type: 'strict_path', path: 'src/svc.ts', commit_hash: sha },
						],
					},
				],
				edges: [],
			};
			const g = join(tmp, 'graph.json');
			writeFileSync(g, JSON.stringify(graph), 'utf-8');
			const { status, out } = runJson([
				'lift',
				'--changed',
				'src/svc.ts',
				'--graph',
				g,
				'--reconcile',
				'--repo-root',
				tmp,
				'--dry-run',
				'--json',
			]);
			assert.equal(status, 0);
			const flags = out.reconcile.anchors.flatMap((a) => a.flags);
			const drift = flags.filter((f) => f.kind === 'content_drift');
			assert.equal(drift.length, 0, 'commit_hash==현재 → content_drift 없음 (false-positive 0)');
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('git 부재 디렉토리(repo-root=비-git) → null carry / flag 0 / no-crash', { skip: !GIT ? 'git 부재' : false }, () => {
		const tmp = mkdtempSync(join(tmpdir(), 'lift-nogit-'));
		try {
			mkdirSync(join(tmp, 'src'), { recursive: true });
			writeFileSync(join(tmp, 'src', 'svc.ts'), 'x', 'utf-8');
			const graph = {
				nodes: [
					{
						id: 'IMPL-X',
						artifact_kind: 'chain',
						artifact_subkind: 'IMPL',
						state: 'active',
						code_pointers: [
							{ anchor_type: 'strict_path', path: 'src/svc.ts', commit_hash: 'deadbeef' },
						],
					},
				],
				edges: [],
			};
			const g = join(tmp, 'graph.json');
			writeFileSync(g, JSON.stringify(graph), 'utf-8');
			const { status, out } = runJson([
				'lift',
				'--changed',
				'src/svc.ts',
				'--graph',
				g,
				'--reconcile',
				'--repo-root',
				tmp,
				'--dry-run',
				'--json',
			]);
			assert.equal(status, 0, 'git 부재여도 crash ❌');
			const flags = out.reconcile.anchors.flatMap((a) => a.flags);
			assert.equal(flags.length, 0, 'null carry → flag 0 (날조 ❌)');
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe('Phase 2c carry helpers (순수 / reporting 강화)', () => {
	it('relocationSourceHint IMPL → impl-spec modules locator', () => {
		const h = relocationSourceHint('IMPL', 'IMPL-X', {
			current: 'src/a.ts',
			suggested: 'src/b.ts',
		});
		assert.equal(h.source_artifact, 'impl-spec.json');
		assert.equal(h.locator, 'modules[id=IMPL-X].source_files');
		assert.equal(h.old, 'src/a.ts');
		assert.equal(h.new, 'src/b.ts');
	});
	it('relocationSourceHint TC → test-spec test_cases locator (multi-source / Senior #2)', () => {
		const h = relocationSourceHint('TC', 'TC-X', { current: 'a', suggested: 'b' });
		assert.equal(h.source_artifact, 'test-spec.json');
		assert.equal(h.locator, 'test_cases[id=TC-X].source_file');
	});
	it('relocationSourceHint 미지원 subkind → generic (graph 직접 ❌ 안내)', () => {
		const h = relocationSourceHint('EPIC', 'EPIC-X', { current: 'a', suggested: 'b' });
		assert.equal(h.source_artifact, '(source 산출물)');
		assert.match(h.locator, /code_pointers/);
	});
	it('ceilingOptionsForAnchor — anchor 자신 제외 + 정렬 (Senior #1 / IMPL=forward-leaf=no-op)', () => {
		const byAnchor = { 'IMPL-1': ['TC-1', 'IMPL-1', 'BHV-1', 'AC-1'] };
		const opts = ceilingOptionsForAnchor('IMPL-1', byAnchor);
		assert.ok(!opts.includes('IMPL-1'), 'anchor 자신 제외');
		assert.deepEqual(opts, ['AC-1', 'BHV-1', 'TC-1']);
	});
	it('ceilingOptionsForAnchor — 미존재 anchor → []', () => {
		assert.deepEqual(ceilingOptionsForAnchor('NOPE', {}), []);
	});
});

describe('Phase 2c carry e2e (carry-A 결단보조 / carry-B\' source-locator / propose-only)', () => {
	const POC05_DIR = join(EXAMPLES, 'poc-05-sample-user-register');
	it('carry-A: content_drift flag anchor 에 ceiling_options(자신 제외) 동봉', { skip: !GIT ? 'git 부재' : false }, () => {
		const { status, out } = runJson([
			'lift',
			'--changed',
			'target/src/user.service.ts',
			'--graph',
			POC05_GRAPH,
			'--reconcile',
			'--repo-root',
			POC05_DIR,
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		const withDrift = out.reconcile.anchors.filter((a) =>
			a.flags.some((f) => f.kind === 'content_drift'),
		);
		assert.ok(withDrift.length > 0);
		for (const a of withDrift) {
			assert.ok(Array.isArray(a.ceiling_options));
			assert.ok(!a.ceiling_options.includes(a.anchor), 'anchor 자신 제외');
		}
	});

	it("carry-B': relocation(git mv) → observed_candidate.source_edit (impl-spec locator / write ❌ / 그래프 byte-identical)", { skip: !GIT ? 'git 부재' : false }, () => {
		const tmp = mkdtempSync(join(tmpdir(), 'lift-reloc-'));
		try {
			const git = (a) =>
				execFileSync('git', a, { cwd: tmp, stdio: ['ignore', 'pipe', 'ignore'] });
			git(['init', '-q']);
			git(['config', 'user.email', 't@t.t']);
			git(['config', 'user.name', 't']);
			mkdirSync(join(tmp, 'src'), { recursive: true });
			writeFileSync(join(tmp, 'src', 'old.ts'), 'export const x = 1;\n', 'utf-8');
			git(['add', '.']);
			git(['commit', '-q', '-m', 'init']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
				cwd: tmp,
				encoding: 'utf-8',
			}).trim();
			// git mv → rename (content 동일) = relocation
			git(['mv', 'src/old.ts', 'src/new.ts']);
			git(['commit', '-q', '-m', 'move']);
			const graph = {
				nodes: [
					{
						id: 'IMPL-X',
						artifact_kind: 'chain',
						artifact_subkind: 'IMPL',
						state: 'active',
						code_pointers: [
							{ anchor_type: 'strict_path', path: 'src/old.ts', commit_hash: sha },
						],
					},
				],
				edges: [],
			};
			const g = join(tmp, 'graph.json');
			const graphBefore = JSON.stringify(graph);
			writeFileSync(g, graphBefore, 'utf-8');
			const { status, out } = runJson([
				'lift',
				'--changed',
				'src/old.ts',
				'--graph',
				g,
				'--reconcile',
				'--repo-root',
				tmp,
				'--dry-run',
				'--json',
			]);
			assert.equal(status, 0);
			const cands = out.reconcile.anchors.flatMap((a) => a.observed_candidates);
			const reloc = cands.find((c) => c.kind === 'path_relocated');
			assert.ok(reloc, 'git mv → relocation 후보');
			assert.equal(reloc.suggested, 'src/new.ts');
			assert.ok(reloc.source_edit, 'durable source 위치 동봉 (carry-B\')');
			assert.equal(reloc.source_edit.source_artifact, 'impl-spec.json');
			assert.equal(reloc.source_edit.locator, 'modules[id=IMPL-X].source_files');
			// propose-only — 그래프 byte-identical (write ❌)
			assert.equal(readFileSync(g, 'utf-8'), graphBefore);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe('lift reference-lens trust 가드', () => {
	const coreSrc = readFileSync(join(SRC, 'lift-anchor.js'), 'utf-8');
	it('코어에 gate 토큰 0', () => {
		assert.ok(
			!/gate-eval|evaluateGate|loadFindings|applyUserDecision/.test(coreSrc),
		);
	});
	it('코어에 I/O·비결정·git 토큰 0 (순수)', () => {
		assert.ok(
			!/readFileSync|writeFileSync|execFile|spawn|\bfetch\b|gitRunner/.test(
				coreSrc,
			),
		);
		assert.ok(!/new Date|Date\.now|Math\.random/.test(coreSrc));
	});
});

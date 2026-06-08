// sync-converge.test.js
// living-sync carry 2 — fixpoint 자동 재진입 / 수렴 원장 (DEC §23 carry2 / §33 fixpoint / §63 R1)
//   ① 순수 코어 (recordCompleted / convergenceDecision 전 분기 / nonConvergingFinding)
//   ② no-simulation tmp-git e2e — ★ BLOCKER-1 두 경로(재합성 부재→needs_resynth / 재합성 후→fixpoint) + continue→fixpoint 2-iter + cap non_converging
//   ③ §8.1 ≥2 도메인 mechanism corroboration (재생성·재합성=synthetic / 데이터 ceiling 아님)
//   ④ trust 가드 = 수렴 코어 gate 토큰·I/O 0 (순수)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
	mkdtempSync,
	mkdirSync,
	writeFileSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	recordCompleted,
	convergenceDecision,
	nonConvergingFinding,
} from '../src/sync-loop.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');

function run(args) {
	return spawnSync('node', [CLI, ...args], { encoding: 'utf-8' });
}
const FUTURE = '2099-01-01T00:00:00.000Z'; // graph 가 모든 source 보다 최신 = fresh
const PAST = '2000-01-01T00:00:00.000Z'; // source 가 graph 보다 최신 = stale

// ── ① 순수 코어 ───────────────────────────────────────────────
describe('convergence core — recordCompleted', () => {
	it('누적 merge + dedup + sort', () => {
		const s = recordCompleted({ cumulative_done: ['B', 'A'] }, ['C', 'A']);
		assert.deepEqual(s.cumulative_done, ['A', 'B', 'C']);
	});
	it('세션 부재 / 빈 입력 안전', () => {
		assert.deepEqual(recordCompleted(undefined, []).cumulative_done, []);
		assert.deepEqual(recordCompleted(null, ['X']).cumulative_done, ['X']);
	});
	it('falsy id 무시', () => {
		assert.deepEqual(recordCompleted({}, ['X', '', null, 'Y']).cumulative_done, ['X', 'Y']);
	});
});

describe('convergence core — convergenceDecision (전 분기)', () => {
	it('newWork>0 & iter<cap → continue (cumulative_done dedup / §33 단조)', () => {
		const d = convergenceDecision({
			detectedIds: ['A', 'B', 'C'],
			cumulativeDone: ['A', 'B'],
			iteration: 1,
			cap: 10,
		});
		assert.equal(d.status, 'continue');
		assert.deepEqual(d.newWork, ['C']);
	});
	it('newWork>0 & iter>=cap → non_converging (§63 R1)', () => {
		const d = convergenceDecision({
			detectedIds: ['A', 'B'],
			cumulativeDone: [],
			iteration: 5,
			cap: 5,
		});
		assert.equal(d.status, 'non_converging');
		assert.deepEqual(d.newWork, ['A', 'B']);
	});
	it('newWork=∅ & fresh & unresolved=∅ & verifiable → fixpoint', () => {
		const d = convergenceDecision({
			detectedIds: ['A', 'B'],
			cumulativeDone: ['A', 'B'],
			graphStale: false,
			freshnessVerifiable: true,
		});
		assert.equal(d.status, 'fixpoint');
		assert.deepEqual(d.newWork, []);
	});
	it('★ BLOCKER-1: newWork=∅ 이나 graphStale → needs_resynth(graph_stale) (거짓 fixpoint 차단)', () => {
		const d = convergenceDecision({
			detectedIds: ['A'],
			cumulativeDone: ['A'],
			graphStale: true,
			freshnessVerifiable: true,
		});
		assert.equal(d.status, 'needs_resynth');
		assert.equal(d.reason, 'graph_stale');
	});
	it('★ BLOCKER-1: newWork=∅ & fresh 이나 unresolved>0 → needs_resynth(unresolved_paths)', () => {
		const d = convergenceDecision({
			detectedIds: ['A'],
			cumulativeDone: ['A'],
			unresolvedPaths: ['new-structure.json'],
			graphStale: false,
			freshnessVerifiable: true,
		});
		assert.equal(d.status, 'needs_resynth');
		assert.equal(d.reason, 'unresolved_paths');
		assert.deepEqual(d.unresolved, ['new-structure.json']);
	});
	it('★ BLOCKER-1: newWork=∅ & fresh & unresolved=∅ 이나 !verifiable(derived_from 부재) → unverified_fixpoint', () => {
		const d = convergenceDecision({
			detectedIds: ['A'],
			cumulativeDone: ['A'],
			graphStale: false,
			freshnessVerifiable: false,
		});
		assert.equal(d.status, 'unverified_fixpoint');
	});
	it('우선순위: newWork>0 면 stale 무관하게 continue (작업 우선)', () => {
		const d = convergenceDecision({
			detectedIds: ['A', 'B'],
			cumulativeDone: ['A'],
			graphStale: true,
			iteration: 1,
			cap: 10,
		});
		assert.equal(d.status, 'continue');
		assert.deepEqual(d.newWork, ['B']);
	});
});

describe('convergence core — nonConvergingFinding', () => {
	it('promote-ready 형식 (kind/severity/residual)', () => {
		const f = nonConvergingFinding({ iteration: 5, cap: 5, newWork: ['A', 'B'] });
		assert.equal(f.kind, 'sync.non_converging');
		assert.equal(f.severity, 'high');
		assert.deepEqual(f.residual_new_work, ['A', 'B']);
	});
});

// ── ② no-simulation tmp-git e2e ──────────────────────────────
// 재생성 시뮬레이션 = baseline C0 커밋 후 worktree 산출물 변경(synthetic / LLM 미실행).
// 재합성 시뮬레이션 = graph.synthesized_at 조정(FUTURE=재합성됨/fresh, PAST=재합성안됨/stale).
function setupRepo({ synthesizedAt, derivedFrom, withOrphan = false }) {
	const root = mkdtempSync(join(tmpdir(), 'converge-'));
	const g = (a) => spawnSync('git', a, { cwd: root, encoding: 'utf-8' });
	g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't']);
	const outDir = join(root, '.ai-context', 'output'); mkdirSync(outDir, { recursive: true });
	const br = (d) => JSON.stringify({ business_rules: [{ id: 'BR-POST-1', bounded_context: 'BC-POST', desc: d }] });
	writeFileSync(join(outDir, 'business-rules.json'), br('orig'));
	writeFileSync(join(outDir, 'behavior-spec.json'), JSON.stringify({ v: 1 }));
	if (withOrphan) writeFileSync(join(root, 'orphan.json'), 'v1'); // 노드 미매핑 = 새 구조
	const graph = {
		synthesized_at: synthesizedAt,
		...(derivedFrom ? { derived_from: derivedFrom } : {}),
		nodes: [
			{ id: 'analysis-business-rules', artifact_kind: 'analysis', artifact_subkind: 'business-rules', source_path: '.ai-context/output/business-rules.json', state: 'active' },
			{ id: 'analysis-business-rules-BR-POST-1', artifact_kind: 'analysis', artifact_subkind: 'business-rules', business_rule_id: 'BR-POST-1', source_path: '.ai-context/output/business-rules.json', state: 'active' },
			{ id: 'BHV-POST-001', artifact_kind: 'chain', artifact_subkind: 'BHV', source_path: '.ai-context/output/behavior-spec.json', state: 'active' },
		],
		edges: [
			{ source: 'analysis-business-rules-BR-POST-1', target: 'BHV-POST-001', edge_type: 'cross_reference', confidence: 'soft' },
		],
	};
	const graphPath = join(root, 'graph.json'); writeFileSync(graphPath, JSON.stringify(graph));
	g(['add', '-A']); g(['commit', '-q', '-m', 'init']); // baseline C0 = HEAD
	// 재생성(synthetic): worktree 산출물 변경.
	writeFileSync(join(outDir, 'business-rules.json'), br('MODIFIED'));
	writeFileSync(join(outDir, 'behavior-spec.json'), JSON.stringify({ v: 2 }));
	if (withOrphan) writeFileSync(join(root, 'orphan.json'), 'v2');
	run(['init', root]);
	return { root, graphPath };
}
function setState(root, { cumulativeDone, iteration = 1, cap, baselineRef, queueComplete = true }) {
	const sp = join(root, '.ai-context', 'state.json');
	const s = JSON.parse(readFileSync(sp, 'utf-8'));
	s.regen_queue = {
		generated_at: '2026-01-01T00:00:00.000Z',
		origins: ['analysis-business-rules-BR-POST-1'],
		items: [
			{ id: 'analysis-business-rules-BR-POST-1', stage: 'analysis', grade: 'MUST', origin: true, done: true },
			{ id: 'BHV-POST-001', stage: 'spec', grade: 'SHOULD', origin: false, done: queueComplete },
		],
		status: queueComplete ? 'complete' : 'in_progress',
	};
	s.sync_session = { cumulative_done: cumulativeDone, iteration };
	if (cap != null) s.sync_session.cap = cap;
	if (baselineRef) s.sync_session.baseline_ref = baselineRef;
	writeFileSync(sp, JSON.stringify(s));
}
const readState = (root) => JSON.parse(readFileSync(join(root, '.ai-context', 'state.json'), 'utf-8'));

describe('carry 2 — sync-converge e2e (BLOCKER-1 두 경로 / no-sim tmp-git)', () => {
	const DERIVED = ['.ai-context/output/business-rules.json', '.ai-context/output/behavior-spec.json'];

	it('★ 도메인1 fixpoint: 재합성됨(fresh) + newWork=∅ + unresolved=∅ → fixpoint (큐 clear)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1', 'BHV-POST-001'] });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--json']);
		assert.equal(r.status, 0, r.stderr);
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
		assert.equal(out.status, 'fixpoint');
		const st = readState(root);
		assert.equal(st.regen_queue, undefined, 'fixpoint → 큐 clear');
		assert.equal(st.sync_session.status, 'fixpoint');
		rmSync(root, { recursive: true, force: true });
	});

	it('★ BLOCKER-1: 재합성 안 됨(stale) + newWork=∅ → needs_resynth(거짓 fixpoint 차단 / exit 2)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: PAST, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1', 'BHV-POST-001'] });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--json']);
		assert.equal(r.status, 2, '거짓 수렴 차단 = exit 2');
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
		assert.equal(out.status, 'needs_resynth');
		assert.equal(out.reason, 'graph_stale');
		rmSync(root, { recursive: true, force: true });
	});

	it('★ BLOCKER-1: 새 구조 파일(노드 미매핑) → needs_resynth(unresolved_paths / exit 2)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED, withOrphan: true });
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1', 'BHV-POST-001'] });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--json']);
		assert.equal(r.status, 2, r.stderr);
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
		assert.equal(out.status, 'needs_resynth');
		assert.equal(out.reason, 'unresolved_paths');
		assert.ok(out.unresolved_paths.includes('orphan.json'), '새 구조 파일 unresolved');
		rmSync(root, { recursive: true, force: true });
	});

	it('unverified_fixpoint: derived_from 부재 → freshness 검증 불가 (거짓 확정 금지 / exit 2)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: null });
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1', 'BHV-POST-001'] });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--json']);
		assert.equal(r.status, 2);
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
		assert.equal(out.status, 'unverified_fixpoint');
		rmSync(root, { recursive: true, force: true });
	});
});

describe('carry 2 — sync-converge continue→fixpoint 2-iter + cap (도메인2 mechanism)', () => {
	const DERIVED = ['.ai-context/output/business-rules.json', '.ai-context/output/behavior-spec.json'];

	it('★ continue→fixpoint 2-iter: 잔여 노드 재시드(iter2) → (synthetic 소비) → 진짜 fixpoint', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		// iter1: cumulative_done 가 BHV-POST-001 누락 → newWork=[BHV-POST-001] → continue.
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1'], iteration: 1 });
		const r1 = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--json']);
		assert.equal(r1.status, 0, r1.stderr);
		const o1 = JSON.parse(r1.stdout.slice(r1.stdout.indexOf('{')));
		assert.equal(o1.status, 'continue');
		assert.deepEqual(o1.new_work, ['BHV-POST-001']);
		assert.equal(o1.iteration, 2);
		const st1 = readState(root);
		assert.equal(st1.sync_session.iteration, 2, 'iteration++');
		assert.ok(st1.regen_queue.items.some((it) => it.id === 'BHV-POST-001' && !it.done), '잔여만 재시드');
		// synthetic 소비(외부 = 재생성+재합성): cumulative_done 에 BHV-POST-001 누적 + 큐 done.
		const sp = join(root, '.ai-context', 'state.json');
		const s = JSON.parse(readFileSync(sp, 'utf-8'));
		s.sync_session.cumulative_done = ['analysis-business-rules-BR-POST-1', 'BHV-POST-001'];
		s.regen_queue.items.forEach((it) => (it.done = true));
		s.regen_queue.status = 'complete';
		writeFileSync(sp, JSON.stringify(s));
		// iter2 재판정 → newWork=∅ + fresh → fixpoint.
		const r2 = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--json']);
		assert.equal(r2.status, 0, r2.stderr);
		const o2 = JSON.parse(r2.stdout.slice(r2.stdout.indexOf('{')));
		assert.equal(o2.status, 'fixpoint');
		assert.equal(o2.iteration, 2, '2-iter 수렴');
		rmSync(root, { recursive: true, force: true });
	});

	it('★ cap 초과 → non_converging + finding (exit 1 / §63 R1)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1'], iteration: 3, cap: 3 });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--json']);
		assert.equal(r.status, 1, '수렴 실패 = exit 1');
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
		assert.equal(out.status, 'non_converging');
		assert.equal(out.finding.kind, 'sync.non_converging');
		assert.equal(readState(root).sync_session.status, 'non_converging');
		rmSync(root, { recursive: true, force: true });
	});
});

describe('carry 2 — sync-converge 가드 (전제·세션 생명주기 M1)', () => {
	const DERIVED = ['.ai-context/output/business-rules.json', '.ai-context/output/behavior-spec.json'];

	it('큐 미완 → exit 3 (sync-next 먼저)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: [], queueComplete: false });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD']);
		assert.equal(r.status, 3);
		rmSync(root, { recursive: true, force: true });
	});

	it('M1: 세션 baseline ≠ --git → exit 3 (--reset 안내)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1', 'BHV-POST-001'], baselineRef: 'OTHERSHA' });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD']);
		assert.equal(r.status, 3, '다른 baseline 거부');
		assert.match(r.stderr, /baseline/);
		rmSync(root, { recursive: true, force: true });
	});

	it('--reset → 세션 clear (exit 0)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: ['X'], baselineRef: 'OTHERSHA' });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'HEAD', '--reset']);
		assert.equal(r.status, 0, r.stderr);
		assert.equal(readState(root).sync_session, undefined, 'reset → 세션 clear');
		rmSync(root, { recursive: true, force: true });
	});

	it('invalid git ref → exit 3 (날조 ❌)', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: ['analysis-business-rules-BR-POST-1', 'BHV-POST-001'] });
		const r = run(['sync-converge', root, '--graph', graphPath, '--git', 'NOPE']);
		assert.equal(r.status, 3);
		rmSync(root, { recursive: true, force: true });
	});

	it('M1: sync-loop fresh 큐 write → 직전 sync_session 무효화', () => {
		const { root, graphPath } = setupRepo({ synthesizedAt: FUTURE, derivedFrom: DERIVED });
		setState(root, { cumulativeDone: ['stale-prev-batch'], baselineRef: 'OLDSHA' });
		const r = run(['sync-loop', root, '--graph', graphPath, '--origin', 'analysis-business-rules-BR-POST-1']);
		assert.equal(r.status, 0, r.stderr);
		assert.equal(readState(root).sync_session, undefined, 'fresh 배치 = 세션 clear');
		rmSync(root, { recursive: true, force: true });
	});
});

// ── ④ trust 가드 (수렴 코어 순수) ─────────────────────────────
describe('carry 2 — reference-lens trust 가드', () => {
	it('수렴 코어에 gate 토큰·I/O·비결정 0 (순수)', () => {
		const src = readFileSync(join(__dirname, '..', 'src', 'sync-loop.js'), 'utf-8');
		// carry 2 코어 영역만 (recordCompleted 이후).
		const seg = src.slice(src.indexOf('recordCompleted'));
		for (const tok of ['evaluateGate', 'readFileSync', 'writeFileSync', 'Date.now', 'spawnSync', 'process.exit']) {
			assert.ok(!seg.includes(tok), `수렴 코어에 ${tok} 없음 (순수)`);
		}
	});
});

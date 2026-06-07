// sync-loop.test.js
// living-sync Phase 1 MVP (DEC-2026-06-07-living-sync-operating-model §5 Phase 1)
//   ① 순수 코어 단위 (forward-only / 결정론 / multi-origin / cycle)
//   ② no-simulation 실 fixture e2e (poc-05) — closure / regen_queue / durable / --mark 비영속 / coarse
//   ③ reference-lens trust 가드 (gate 토큰·I/O 0 / cmdNext·gate-eval 미참조)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
	mkdtempSync,
	mkdirSync,
	writeFileSync,
	copyFileSync,
	readFileSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeSyncLoop, resolveChangedRuleOrigins } from '../src/sync-loop.js';
import { gitDiffNumstat } from '../src/revisit-detect.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');
const SRC = join(__dirname, '..', 'src');
const POC05_GRAPH = join(
	__dirname,
	'..',
	'..',
	'..',
	'examples',
	'poc-05-sample-user-register',
	'.aimd',
	'output',
	'artifact-graph.json',
);

function run(args) {
	const r = spawnSync('node', [CLI, ...args], { encoding: 'utf-8' });
	return r;
}
function runJson(args) {
	const r = run(args);
	return { ...r, out: r.stdout ? JSON.parse(r.stdout) : null };
}

// 합성 hard 체인 UC→BHV→AC→TASK→TC→IMPL (+ 별도 BHV-2 분리 체인).
function chainGraph() {
	const node = (id, subkind, sp) => ({
		id,
		artifact_kind: 'chain',
		artifact_subkind: subkind,
		source_path: sp,
		state: 'active',
	});
	const edge = (s, t) => ({ source: s, target: t, edge_type: 'derived_from', confidence: 'hard' });
	return {
		nodes: [
			node('UC-1', 'UC', 'd.json'),
			node('BHV-1', 'BHV', 'b.json'),
			node('AC-1', 'AC', 'a.json'),
			node('TASK-1', 'TASK', 'p.json'),
			node('TC-1', 'TC', 't.json'),
			node('IMPL-1', 'IMPL', 'i.json'),
			node('BHV-2', 'BHV', 'b.json'), // 같은 파일(b.json) 분리 체인
			node('AC-2', 'AC', 'a2.json'),
		],
		edges: [
			edge('UC-1', 'BHV-1'),
			edge('BHV-1', 'AC-1'),
			edge('AC-1', 'TASK-1'),
			edge('TASK-1', 'TC-1'),
			edge('TC-1', 'IMPL-1'),
			edge('BHV-2', 'AC-2'),
		],
	};
}

describe('sync-loop core (computeSyncLoop)', () => {
	it('forward-only: BHV origin → 하류만, UC(상류) 부재', () => {
		const r = computeSyncLoop(chainGraph(), { origins: ['BHV-1'] });
		assert.deepEqual(r.closure.MUST, ['AC-1', 'IMPL-1', 'TASK-1', 'TC-1']);
		assert.ok(!r.closure.MUST.includes('UC-1'), 'UC 상류 포함 ❌ (forward-only)');
		// 분리 체인 BHV-2/AC-2 미포함
		assert.ok(!r.closure.MUST.includes('AC-2'));
		assert.equal(r.has_cycle, false);
	});

	it('items = cascade 순서 (origin 먼저) + stage 매핑', () => {
		const r = computeSyncLoop(chainGraph(), { origins: ['BHV-1'] });
		assert.deepEqual(
			r.items.map((i) => i.id),
			['BHV-1', 'AC-1', 'TASK-1', 'TC-1', 'IMPL-1'],
		);
		const byId = Object.fromEntries(r.items.map((i) => [i.id, i]));
		assert.equal(byId['BHV-1'].stage, 'spec');
		assert.equal(byId['BHV-1'].origin, true);
		assert.equal(byId['AC-1'].stage, 'spec');
		assert.equal(byId['TASK-1'].stage, 'plan');
		assert.equal(byId['TC-1'].stage, 'test');
		assert.equal(byId['IMPL-1'].stage, 'implement');
		assert.equal(byId['IMPL-1'].origin, false);
	});

	it('결정론: 동일 입력 두 번 → deep-equal', () => {
		const a = computeSyncLoop(chainGraph(), { origins: ['BHV-1'] });
		const b = computeSyncLoop(chainGraph(), { origins: ['BHV-1'] });
		assert.deepEqual(a, b);
	});

	it('changedPaths(source_path) 해소 → 같은 파일 sibling 둘 다 origin (coarse-but-sound)', () => {
		const r = computeSyncLoop(chainGraph(), { changedPaths: ['b.json'] });
		assert.deepEqual(r.origins, ['BHV-1', 'BHV-2']);
		// 두 체인 union closure
		assert.ok(r.closure.MUST.includes('AC-1'));
		assert.ok(r.closure.MUST.includes('AC-2'));
	});

	it('미해소 origin → unresolved 누적 (throw ❌)', () => {
		const r = computeSyncLoop(chainGraph(), { origins: ['NOPE-9'], changedPaths: ['zzz.json'] });
		assert.deepEqual(r.origins, []);
		assert.ok(r.unresolved.includes('NOPE-9'));
		assert.ok(r.unresolved.includes('zzz.json'));
	});

	it('cycle → has_cycle=true (durable write 거부 신호)', () => {
		const g = chainGraph();
		g.edges.push({ source: 'IMPL-1', target: 'BHV-1', edge_type: 'depends_on', confidence: 'hard' });
		const r = computeSyncLoop(g, { origins: ['BHV-1'] });
		assert.equal(r.has_cycle, true);
	});
});

describe('sync-loop e2e (no-simulation / poc-05 실 fixture)', () => {
	it('forward closure = USER-001 하류만 / UC·USER-002 부재', () => {
		const { status, out } = runJson([
			'sync-loop',
			'--graph',
			POC05_GRAPH,
			'--origin',
			'BHV-USER-001',
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.deepEqual(out.closure.MUST.sort(), [
			'AC-USER-001',
			'IMPL-USER-001',
			'TASK-USER-001',
			'TC-USER-001',
		]);
		const ids = out.regen_queue.items.map((i) => i.id);
		assert.ok(!ids.includes('UC-USER-001'), 'UC 부재 (forward-only)');
		assert.ok(!ids.some((id) => /USER-002/.test(id)), '분리 체인 USER-002 부재');
		assert.deepEqual(ids, [
			'BHV-USER-001',
			'AC-USER-001',
			'TASK-USER-001',
			'TC-USER-001',
			'IMPL-USER-001',
		]);
	});

	it('결정론: 재실행 items/closure 동일', () => {
		const a = runJson(['sync-loop', '--graph', POC05_GRAPH, '--origin', 'BHV-USER-001', '--dry-run', '--json']);
		const b = runJson(['sync-loop', '--graph', POC05_GRAPH, '--origin', 'BHV-USER-001', '--dry-run', '--json']);
		assert.deepEqual(a.out.regen_queue.items, b.out.regen_queue.items);
		assert.deepEqual(a.out.closure, b.out.closure);
	});

	it('coarse: --changed behavior-spec.json → BHV-USER-001+002 union', () => {
		const { out } = runJson([
			'sync-loop',
			'--graph',
			POC05_GRAPH,
			'--changed',
			'behavior-spec.json',
			'--dry-run',
			'--json',
		]);
		assert.deepEqual(out.origins, ['BHV-USER-001', 'BHV-USER-002']);
		assert.ok(out.closure.MUST.includes('AC-USER-001'));
		assert.ok(out.closure.MUST.includes('AC-USER-002'));
	});

	it('durable write: regen_queue → state.json (== stdout) + 그래프 파일 비영속', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'syncloop-'));
		try {
			mkdirSync(join(tmp, '.aimd', 'output'), { recursive: true });
			const tmpGraph = join(tmp, '.aimd', 'output', 'artifact-graph.json');
			copyFileSync(POC05_GRAPH, tmpGraph);
			const graphBefore = readFileSync(tmpGraph, 'utf-8');

			const init = run(['init', tmp]);
			assert.equal(init.status, 0, 'init 성공');

			const { status, out } = runJson([
				'sync-loop',
				tmp,
				'--graph',
				tmpGraph,
				'--origin',
				'BHV-USER-001',
				'--json',
			]);
			assert.equal(status, 0);
			assert.equal(out.written, true);

			const state = JSON.parse(readFileSync(join(tmp, '.aimd', 'state.json'), 'utf-8'));
			assert.deepEqual(state.regen_queue.items, out.regen_queue.items);
			assert.deepEqual(state.regen_queue.origins, ['BHV-USER-001']);

			// --mark 없음 → 그래프 파일 byte-identical (drift 비영속)
			assert.equal(readFileSync(tmpGraph, 'utf-8'), graphBefore);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('has_cycle 아닐 때만 written / --dry-run = 미기록', () => {
		const { out } = runJson(['sync-loop', '--graph', POC05_GRAPH, '--origin', 'BHV-USER-001', '--dry-run', '--json']);
		assert.equal(out.written, false); // dry-run + project 미지정
	});
});

describe('sync-loop reference-lens trust 가드 (check36/37 동형)', () => {
	const coreSrc = readFileSync(join(SRC, 'sync-loop.js'), 'utf-8');

	it('코어에 gate 토큰 0 (gate inject ❌)', () => {
		assert.ok(!/gate-eval|evaluateGate|loadFindings|applyUserDecision/.test(coreSrc));
	});

	it('코어에 I/O·비결정 토큰 0 (순수)', () => {
		assert.ok(!/readFileSync|writeFileSync|execFile|spawn|\bfetch\b/.test(coreSrc), 'I/O 0');
		assert.ok(!/new Date|Date\.now|Math\.random/.test(coreSrc), '비결정 0 (generated_at 는 cli glue)');
	});

	it('gate-eval.js 가 sync-loop / regen_queue 미참조 (worklist 가 gate verdict 무영향)', () => {
		const ge = readFileSync(join(SRC, 'gate-eval.js'), 'utf-8');
		assert.ok(!/sync-loop|regen_queue/.test(ge));
	});

	it('코어가 gate-eval import 0', () => {
		assert.ok(!/from '\.\/gate-eval/.test(coreSrc));
	});
});

describe('carry 1 — resolveChangedRuleOrigins (per-BR origin / coarse fallback / BLOCKER-1)', () => {
	const graph = { nodes: [
		{ id: 'analysis-business-rules' },
		{ id: 'analysis-business-rules-BR-1', business_rule_id: 'BR-1' },
		{ id: 'analysis-business-rules-BR-3', business_rule_id: 'BR-3' },
	] };
	it('per-BR 노드 있으면 정밀 origin', () => {
		const r = resolveChangedRuleOrigins(graph, ['BR-3', 'BR-1']);
		assert.deepEqual(r.origins, ['analysis-business-rules-BR-1', 'analysis-business-rules-BR-3']);
		assert.deepEqual(r.coarse_fallback, []);
	});
	it('per-BR 부재(BC-less) → 부모 coarse fallback (silent drop ❌)', () => {
		const r = resolveChangedRuleOrigins(graph, ['BR-NOBC']);
		assert.deepEqual(r.origins, ['analysis-business-rules']);
		assert.deepEqual(r.coarse_fallback, ['BR-NOBC']);
	});
	it('BR 그래프 자체 부재 → unresolved (origin 0)', () => {
		const r = resolveChangedRuleOrigins({ nodes: [] }, ['BR-1']);
		assert.deepEqual(r.origins, []);
		assert.deepEqual(r.unresolved, ['BR-1']);
	});
});

describe('carry 1 — sync-loop --br-diff e2e (tmp git / per-BR auto-origin / no-sim)', () => {
	it('BR.json 1 rule 수정 → 그 per-BR origin seed (정밀 / 무관 rule·item 제외)', () => {
		const root = mkdtempSync(join(tmpdir(), 'br-diff-'));
		const git = (a) => spawnSync('git', a, { cwd: root, encoding: 'utf-8' });
		git(['init', '-q']); git(['config', 'user.email', 't@t']); git(['config', 'user.name', 't']);
		const outDir = join(root, '.aimd', 'output'); mkdirSync(outDir, { recursive: true });
		const br = (desc) => JSON.stringify({ business_rules: [
			{ id: 'BR-POST-1', bounded_context: 'BC-POST', desc },
			{ id: 'BR-POST-2', bounded_context: 'BC-POST', desc: 'stable' },
		] });
		writeFileSync(join(outDir, 'business-rules.json'), br('orig'));
		const node = (id, x = {}) => ({ id, artifact_kind: id.startsWith("BHV") ? "chain" : "analysis", artifact_subkind: id.startsWith("BHV") ? "BHV" : "business-rules", state: "active", ...x });
		const graph = { nodes: [
			node('analysis-business-rules', { source_path: '.aimd/output/business-rules.json' }),
			node('analysis-business-rules-BR-POST-1', { business_rule_id: 'BR-POST-1', source_path: '.aimd/output/business-rules.json' }),
			node('analysis-business-rules-BR-POST-2', { business_rule_id: 'BR-POST-2', source_path: '.aimd/output/business-rules.json' }),
			node('BHV-POST-001'), node('BHV-POST-002'),
		], edges: [
			{ source: 'analysis-business-rules-BR-POST-1', target: 'BHV-POST-001', edge_type: 'cross_reference', confidence: 'soft' },
			{ source: 'analysis-business-rules-BR-POST-2', target: 'BHV-POST-002', edge_type: 'cross_reference', confidence: 'soft' },
		] };
		const graphPath = join(root, 'graph.json'); writeFileSync(graphPath, JSON.stringify(graph));
		git(['add', '-A']); git(['commit', '-q', '-m', 'init']);
		writeFileSync(join(outDir, 'business-rules.json'), br('MODIFIED'));
		const r = run(['sync-loop', root, '--graph', graphPath, '--br-diff', 'HEAD', '--dry-run', '--json']);
		assert.equal(r.status, 0, r.stderr);
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
		assert.deepEqual(out.regen_queue.br_diff.changed_rule_ids, ['BR-POST-1'], '수정 rule 만 감지');
		assert.ok(out.origins.includes('analysis-business-rules-BR-POST-1'), '수정 rule per-BR origin seed');
		assert.ok(!out.origins.includes('analysis-business-rules-BR-POST-2'), '무관 rule 제외');
		assert.ok(out.closure.SHOULD.includes('BHV-POST-001'), '그 rule 소비 item');
		assert.ok(!out.closure.SHOULD.includes('BHV-POST-002'), '무관 item 제외 (정밀)');
		rmSync(root, { recursive: true, force: true });
	});
	it('invalid git ref → exit 3 (날조 drift ❌ / MAJOR-2)', () => {
		const root = mkdtempSync(join(tmpdir(), 'br-diff-bad-'));
		const outDir = join(root, '.aimd', 'output'); mkdirSync(outDir, { recursive: true });
		writeFileSync(join(outDir, 'business-rules.json'), JSON.stringify({ business_rules: [{ id: 'BR-1', bounded_context: 'BC-POST' }] }));
		const graphPath = join(root, 'g.json'); writeFileSync(graphPath, JSON.stringify({ nodes: [{ id: 'analysis-business-rules', artifact_kind: 'analysis', artifact_subkind: 'business-rules', source_path: '.aimd/output/business-rules.json', state: 'active' }], edges: [] }));
		const r = run(['sync-loop', root, '--graph', graphPath, '--br-diff', 'NOPE', '--dry-run']);
		assert.equal(r.status, 3, "bad ref/no repo = exit 3");
		rmSync(root, { recursive: true, force: true });
	});
});

describe('carry 1b — gitDiffNumstat 워크트리 모드 (head=null → ref↔worktree)', () => {
	it('head=null → 미커밋 working-tree 변경 감지 / head=HEAD → 커밋범위 무회귀', () => {
		const root = mkdtempSync(join(tmpdir(), 'gdn-'));
		const g = (a) => spawnSync('git', a, { cwd: root, encoding: 'utf-8' });
		g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't']);
		writeFileSync(join(root, 'f.txt'), 'v1\n');
		g(['add', '-A']); g(['commit', '-q', '-m', 'c1']);
		writeFileSync(join(root, 'f.txt'), 'v1\nv2\n'); // 미커밋 변경
		const wt = gitDiffNumstat(root, 'HEAD', null);
		assert.ok(wt.ok && wt.files.some((x) => x.path === 'f.txt'), 'worktree 모드 미커밋 변경 감지');
		const committed = gitDiffNumstat(root, 'HEAD', 'HEAD');
		assert.equal(committed.files.length, 0, 'HEAD..HEAD = 변경 0 (무회귀)');
		rmSync(root, { recursive: true, force: true });
	});
});

describe('carry 1b — sync-loop --git e2e (전 산출물 / BR=per-rule·기타=coarse / no-sim)', () => {
	const node = (id, kind, sub, x = {}) => ({ id, artifact_kind: kind, artifact_subkind: sub, state: "active", ...x });
	it('BR.json 1 rule + domain.json 수정 → BR per-rule origin + domain coarse origin', () => {
		const root = mkdtempSync(join(tmpdir(), 'git-ao-'));
		const g = (a) => spawnSync('git', a, { cwd: root, encoding: 'utf-8' });
		g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't']);
		const outDir = join(root, '.aimd', 'output'); mkdirSync(outDir, { recursive: true });
		const br = (d) => JSON.stringify({ business_rules: [
			{ id: 'BR-POST-1', bounded_context: 'BC-POST', desc: d },
			{ id: 'BR-POST-2', bounded_context: 'BC-POST', desc: 'stable' },
		] });
		writeFileSync(join(outDir, 'business-rules.json'), br('orig'));
		writeFileSync(join(outDir, 'domain.json'), JSON.stringify({ v: 1 }));
		const graph = { nodes: [
			node('analysis-business-rules', 'analysis', 'business-rules', { source_path: '.aimd/output/business-rules.json' }),
			node('analysis-business-rules-BR-POST-1', 'analysis', 'business-rules', { business_rule_id: 'BR-POST-1', source_path: '.aimd/output/business-rules.json' }),
			node('analysis-business-rules-BR-POST-2', 'analysis', 'business-rules', { business_rule_id: 'BR-POST-2', source_path: '.aimd/output/business-rules.json' }),
			node('analysis-domain', 'analysis', 'domain', { source_path: '.aimd/output/domain.json' }),
			node('BHV-POST-001', 'chain', 'BHV'), node('BHV-POST-002', 'chain', 'BHV'),
		], edges: [
			{ source: 'analysis-business-rules-BR-POST-1', target: 'BHV-POST-001', edge_type: 'cross_reference', confidence: 'soft' },
			{ source: 'analysis-business-rules-BR-POST-2', target: 'BHV-POST-002', edge_type: 'cross_reference', confidence: 'soft' },
		] };
		const graphPath = join(root, 'graph.json'); writeFileSync(graphPath, JSON.stringify(graph));
		g(['add', '-A']); g(['commit', '-q', '-m', 'init']);
		writeFileSync(join(outDir, 'business-rules.json'), br('MODIFIED')); // BR-POST-1 만 변경
		writeFileSync(join(outDir, 'domain.json'), JSON.stringify({ v: 2 })); // 비-BR 변경
		const r = run(['sync-loop', root, '--graph', graphPath, '--git', 'HEAD', '--dry-run', '--json']);
		assert.equal(r.status, 0, r.stderr);
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
		assert.ok(out.origins.includes('analysis-business-rules-BR-POST-1'), 'BR per-rule 정밀 origin');
		assert.ok(!out.origins.includes('analysis-business-rules-BR-POST-2'), '무관 BR 제외');
		assert.ok(!out.origins.includes('analysis-business-rules'), 'BR parent coarse 제외(BLOCKER-1 partition)');
		assert.ok(out.origins.includes('analysis-domain'), '비-BR=coarse origin');
		assert.ok(out.closure.SHOULD.includes('BHV-POST-001') && !out.closure.SHOULD.includes('BHV-POST-002'), 'BR 정밀 closure');
		rmSync(root, { recursive: true, force: true });
	});
	it('--git + --br-diff 동시 → exit 3 (MAJOR-1)', () => {
		const root = mkdtempSync(join(tmpdir(), 'git-both-'));
		const outDir = join(root, '.aimd', 'output'); mkdirSync(outDir, { recursive: true });
		writeFileSync(join(outDir, 'business-rules.json'), JSON.stringify({ business_rules: [{ id: 'BR-1', bounded_context: 'BC-POST' }] }));
		const graphPath = join(root, 'g.json'); writeFileSync(graphPath, JSON.stringify({ nodes: [node('analysis-business-rules', 'analysis', 'business-rules', { source_path: '.aimd/output/business-rules.json' })], edges: [] }));
		const r = run(['sync-loop', root, '--graph', graphPath, '--git', 'HEAD', '--br-diff', 'HEAD', '--dry-run']);
		assert.equal(r.status, 3, '동시 사용 거부');
		rmSync(root, { recursive: true, force: true });
	});
});

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
	copyFileSync,
	readFileSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeSyncLoop } from '../src/sync-loop.js';

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

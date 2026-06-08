// sync-next.test.js
// living-sync Phase 1c — 루프 닫기 (regen_queue stage-단위 소비 / DEC §5 Phase 1c)
//   ① 순수 코어 단위 (selectNextStage / markStageDone / queueStatus / 결정론)
//   ② no-simulation 실 fixture e2e (poc-05) — surface / drain / block 격리 / clobber 가드
//   ③ reference-lens trust 가드 (코어 gate 토큰·I/O 0 / cmdNext 가 regen_queue 미소비)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
	mkdtempSync,
	mkdirSync,
	copyFileSync,
	writeFileSync,
	readFileSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	computeSyncLoop,
	selectNextStage,
	markStageDone,
	queueStatus,
} from '../src/sync-loop.js';

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
	'.ai-context',
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
function readState(tmp) {
	return JSON.parse(readFileSync(join(tmp, '.ai-context', 'state.json'), 'utf-8'));
}

// 합성 hard 체인 BHV-1 origin → spec(BHV-1,AC-1) → plan(TASK-1) → test(TC-1) → implement(IMPL-1).
function chainGraph() {
	const node = (id, subkind, sp) => ({
		id,
		artifact_kind: 'chain',
		artifact_subkind: subkind,
		source_path: sp,
		state: 'active',
	});
	const edge = (s, t) => ({
		source: s,
		target: t,
		edge_type: 'derived_from',
		confidence: 'hard',
	});
	return {
		nodes: [
			node('BHV-1', 'BHV', 'b.json'),
			node('AC-1', 'AC', 'a.json'),
			node('TASK-1', 'TASK', 'p.json'),
			node('TC-1', 'TC', 't.json'),
			node('IMPL-1', 'IMPL', 'i.json'),
		],
		edges: [
			edge('BHV-1', 'AC-1'),
			edge('AC-1', 'TASK-1'),
			edge('TASK-1', 'TC-1'),
			edge('TC-1', 'IMPL-1'),
		],
	};
}
function chainQueue() {
	const r = computeSyncLoop(chainGraph(), { origins: ['BHV-1'] });
	return { items: r.items, has_cycle: r.has_cycle };
}

describe('sync-next core (selectNextStage / markStageDone / queueStatus)', () => {
	it('selectNextStage: 첫 미완 stage = spec + 같은 stage 노드 묶음 (cascade 보존)', () => {
		const q = chainQueue();
		const sel = selectNextStage(q);
		assert.equal(sel.stage, 'spec');
		assert.deepEqual(sel.item_ids, ['AC-1', 'BHV-1']); // sorted
		assert.deepEqual(sel.origins, ['BHV-1']); // origin 만
	});

	it('markStageDone(spec) → BHV/AC done, 다음 선택 = plan(TASK)', () => {
		const q = chainQueue();
		const m = markStageDone(q, 'spec');
		assert.equal(m.marked, 2);
		const sel = selectNextStage(q);
		assert.equal(sel.stage, 'plan');
		assert.deepEqual(sel.item_ids, ['TASK-1']);
	});

	it('전부 소진 → selectNextStage=null / queueStatus.complete', () => {
		const q = chainQueue();
		for (const stg of ['spec', 'plan', 'test', 'implement']) markStageDone(q, stg);
		assert.equal(selectNextStage(q), null);
		const st = queueStatus(q);
		assert.equal(st.complete, true);
		assert.equal(st.done, 5);
		assert.equal(st.pending, 0);
	});

	it('markStageDone 는 다른 stage 미완 불변 (stage 격리)', () => {
		const q = chainQueue();
		markStageDone(q, 'plan'); // spec 미완인데 plan 먼저 — 격리 확인
		const byId = Object.fromEntries(q.items.map((i) => [i.id, i]));
		assert.equal(byId['TASK-1'].done, true);
		assert.equal(byId['BHV-1'].done, false);
		assert.equal(byId['AC-1'].done, false);
	});

	it('queueStatus: 빈/부분/완료', () => {
		assert.deepEqual(queueStatus({ items: [] }), {
			total: 0,
			done: 0,
			pending: 0,
			complete: false,
		});
		const q = chainQueue();
		markStageDone(q, 'spec');
		assert.deepEqual(queueStatus(q), {
			total: 5,
			done: 2,
			pending: 3,
			complete: false,
		});
	});

	it('결정론: selectNextStage 두 번 deep-equal', () => {
		assert.deepEqual(selectNextStage(chainQueue()), selectNextStage(chainQueue()));
	});
});

// e2e 하네스 — tmp 복사 + init + sync-loop 로 큐 seed.
function seedQueue() {
	const tmp = mkdtempSync(join(tmpdir(), 'syncnext-'));
	mkdirSync(join(tmp, '.ai-context', 'output'), { recursive: true });
	const tmpGraph = join(tmp, '.ai-context', 'output', 'artifact-graph.json');
	copyFileSync(POC05_GRAPH, tmpGraph);
	const init = run(['init', tmp]);
	assert.equal(init.status, 0, 'init 성공');
	const sl = runJson(['sync-loop', tmp, '--graph', tmpGraph, '--origin', 'BHV-USER-001', '--json']);
	assert.equal(sl.status, 0);
	assert.equal(sl.out.written, true);
	return { tmp, tmpGraph };
}
function writeFindings(tmp, name, obj) {
	const p = join(tmp, name);
	writeFileSync(p, JSON.stringify(obj), 'utf-8');
	return p;
}
const CLEAN = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

describe('sync-next e2e (no-simulation / poc-05 실 fixture)', () => {
	it('findings 미제출 = 재생성 지시 surface (gate ❌ / write ❌ / exit 0)', () => {
		const { tmp } = seedQueue();
		try {
			const graphBefore = readFileSync(
				join(tmp, '.ai-context', 'output', 'artifact-graph.json'),
				'utf-8',
			);
			const { status, out } = runJson(['sync-next', tmp, '--json']);
			assert.equal(status, 0);
			assert.equal(out.action, 'regenerate');
			assert.equal(out.stage, 'spec');
			assert.deepEqual(out.nodes, ['AC-USER-001', 'BHV-USER-001']);
			assert.ok(Array.isArray(out.required_validators));
			assert.deepEqual(out.progress, { done: 0, total: 5 });
			// 그래프 비영속
			assert.equal(
				readFileSync(join(tmp, '.ai-context', 'output', 'artifact-graph.json'), 'utf-8'),
				graphBefore,
			);
			// 큐 done 미변경
			assert.equal(queueStatus(readState(tmp).regen_queue).done, 0);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('drain: spec→plan→test→implement 순차 소비 → status complete + fixpoint 미보증', () => {
		const { tmp } = seedQueue();
		try {
			const clean = writeFindings(tmp, 'clean.json', CLEAN);
			const impl = writeFindings(tmp, 'impl.json', {
				...CLEAN,
				tests_total: 1,
				tests_failed: 0,
			});

			// spec (BHV+AC)
			let r = runJson(['sync-next', tmp, '--findings', clean, '--json']);
			assert.equal(r.status, 0);
			assert.equal(r.out.stage, 'spec');
			assert.deepEqual(r.out.marked_done, ['AC-USER-001', 'BHV-USER-001']);
			assert.equal(r.out.progress.done, 2);

			// plan
			r = runJson(['sync-next', tmp, '--findings', clean, '--json']);
			assert.equal(r.out.stage, 'plan');
			assert.equal(r.out.progress.done, 3);

			// test (clean = tests_total 부재 → RED 체크 skip → pass)
			r = runJson(['sync-next', tmp, '--findings', clean, '--json']);
			assert.equal(r.out.stage, 'test');
			assert.equal(r.out.progress.done, 4);

			// implement (tests_total 필수 / all_pass)
			r = runJson(['sync-next', tmp, '--findings', impl, '--json']);
			assert.equal(r.out.stage, 'implement');
			assert.equal(r.out.progress.done, 5);
			assert.equal(r.out.progress.complete, true);
			assert.equal(r.out.fixpoint_guaranteed, false);

			const st = readState(tmp);
			assert.equal(st.regen_queue.status, 'complete');
			assert.ok(st.regen_queue.completed_at);
			// 완료 후 재호출 = complete 보고
			const done = runJson(['sync-next', tmp, '--json']);
			assert.equal(done.out.status, 'complete');
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('gate block = regen_queue.blocked 전용 / state.blocked 미접촉 / done 미표시 → 복구', () => {
		const { tmp } = seedQueue();
		try {
			const bad = writeFindings(tmp, 'bad.json', { ...CLEAN, high: 2 });
			const clean = writeFindings(tmp, 'clean.json', CLEAN);

			const blk = run(['sync-next', tmp, '--findings', bad]);
			assert.equal(blk.status, 1, 'block exit 1');
			const st1 = readState(tmp);
			assert.equal(st1.regen_queue.blocked.stage, 'spec');
			assert.equal(st1.blocked, false, 'state.blocked 미접촉 (cmdNext 회귀 차단)');
			assert.equal(queueStatus(st1.regen_queue).done, 0, 'done 미표시');

			// cmdNext 무회귀: blocked 한 적 없으니 정상 (state.blocked=false)
			// 복구: clean 재호출 → spec done + blocked 해제
			const ok = runJson(['sync-next', tmp, '--findings', clean, '--json']);
			assert.equal(ok.status, 0);
			assert.equal(ok.out.progress.done, 2);
			assert.equal(readState(tmp).regen_queue.blocked, undefined, 'blocked 해제');
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('빈 큐 → exit 3', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'syncnext-empty-'));
		try {
			mkdirSync(join(tmp, '.ai-context'), { recursive: true });
			run(['init', tmp]);
			const r = run(['sync-next', tmp]);
			assert.equal(r.status, 3);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('clobber 가드: in-progress 큐에 sync-loop 재실행 → exit 2 거부 / --force 교체', () => {
		const { tmp, tmpGraph } = seedQueue();
		try {
			const clean = writeFindings(tmp, 'clean.json', CLEAN);
			runJson(['sync-next', tmp, '--findings', clean, '--json']); // spec done → in-progress

			const refuse = run([
				'sync-loop',
				tmp,
				'--graph',
				tmpGraph,
				'--origin',
				'BHV-USER-001',
			]);
			assert.equal(refuse.status, 2, 'in-flight done 보호 → 거부');

			const forced = runJson([
				'sync-loop',
				tmp,
				'--graph',
				tmpGraph,
				'--origin',
				'BHV-USER-001',
				'--force',
				'--json',
			]);
			assert.equal(forced.status, 0);
			assert.equal(forced.out.written, true);
			// 교체됨 → done 리셋
			assert.equal(queueStatus(readState(tmp).regen_queue).done, 0);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('cmdState done-aware 표시 (complete/pending)', () => {
		const { tmp } = seedQueue();
		try {
			const clean = writeFindings(tmp, 'clean.json', CLEAN);
			const before = run(['state', tmp]);
			assert.match(before.stdout, /regen_queue.*5\/5 pending/);
			runJson(['sync-next', tmp, '--findings', clean, '--json']);
			const after = run(['state', tmp]);
			assert.match(after.stdout, /regen_queue.*3\/5 pending/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe('sync-next reference-lens trust 가드', () => {
	const coreSrc = readFileSync(join(SRC, 'sync-loop.js'), 'utf-8');
	const cliSrc = readFileSync(join(SRC, 'cli.js'), 'utf-8');

	function funcBody(src, name) {
		const start = src.indexOf(`function ${name}(`);
		assert.ok(start >= 0, `${name} 존재`);
		const after = src.indexOf('\nfunction ', start + 1);
		return src.slice(start, after === -1 ? undefined : after);
	}

	it('코어(소비 함수 포함)에 gate 토큰 0', () => {
		assert.ok(!/gate-eval|evaluateGate|loadFindings|applyUserDecision/.test(coreSrc));
	});

	it('코어에 I/O·비결정 토큰 0 (순수)', () => {
		assert.ok(!/readFileSync|writeFileSync|execFile|spawn|\bfetch\b/.test(coreSrc));
		assert.ok(!/new Date|Date\.now|Math\.random/.test(coreSrc));
	});

	it('cmdNext(bootstrap)는 regen_queue 미소비 (소비는 sync-next 전용)', () => {
		assert.ok(!/regen_queue/.test(funcBody(cliSrc, 'cmdNext')));
	});

	it('cmdSyncNext 는 state.blocked 미설정 (cmdNext 회귀 차단)', () => {
		const body = funcBody(cliSrc, 'cmdSyncNext');
		assert.ok(!/s\.blocked\s*=/.test(body), 'state.blocked 미접촉');
		assert.ok(!/s\.current_chain\s*=/.test(body), 'current_chain 미접촉');
	});
});

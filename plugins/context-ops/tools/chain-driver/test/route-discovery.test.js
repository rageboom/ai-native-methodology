// route-discovery.test.js
// living-sync Phase 1b — 의미 라우터 (discovery-spec 명시 매핑 → 진입 origins → regen_queue / DEC §5 Phase 1b)
//   ① 순수 코어 단위 (resolveDiscoveryOrigins / UC·BR 매칭 / net-new / 결정론)
//   ② no-simulation 실 fixture e2e (poc-05) — origins seed / fail-closed / net-new propose-only / durable / clobber
//   ③ reference-lens trust 가드 (코어 gate 토큰·I/O 0)

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
import { resolveDiscoveryOrigins } from '../src/route-discovery.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');
const SRC = join(__dirname, '..', 'src');
const POC05 = join(
	__dirname,
	'..',
	'..',
	'..',
	'examples',
	'poc-05-sample-user-register',
	'.aimd',
	'output',
);

function run(args) {
	return spawnSync('node', [CLI, ...args], { encoding: 'utf-8' });
}
function runJson(args) {
	const r = run(args);
	return { ...r, out: r.stdout ? JSON.parse(r.stdout) : null };
}

function graphFixture() {
	const node = (id, kind, subkind) => ({
		id,
		artifact_kind: kind,
		artifact_subkind: subkind,
		state: 'active',
	});
	return {
		nodes: [
			node('UC-1', 'chain', 'UC'),
			node('UC-2', 'chain', 'UC'),
			node('analysis-business-rules', 'analysis', 'business-rules'),
		],
		edges: [],
	};
}

describe('route-discovery core (resolveDiscoveryOrigins)', () => {
	it('UC 직접 매칭 → origin / UC miss → net-new', () => {
		const spec = { use_cases: [{ id: 'UC-1' }, { id: 'UC-99' }] };
		const r = resolveDiscoveryOrigins(spec, graphFixture(), null);
		assert.ok(r.origins.includes('UC-1'));
		assert.ok(!r.origins.includes('UC-99'));
		assert.equal(r.net_new.length, 1);
		assert.equal(r.net_new[0].ref, 'UC-99');
		assert.equal(r.net_new[0].kind, 'use_case');
	});

	it('br_id hit (analysis content) → coarse origin = analysis-business-rules / 2 br → 1 노드 dedup', () => {
		const spec = {
			business_rules_intent: [{ br_id: 'BR-1' }, { br_id: 'BR-2' }],
		};
		const analysis = { business_rules: [{ id: 'BR-1' }, { id: 'BR-2' }] };
		const r = resolveDiscoveryOrigins(spec, graphFixture(), analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules']); // dedup
		assert.equal(r.net_new.length, 0);
	});

	it('br_id miss → unknown_br net-new', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-NOPE' }] };
		const analysis = { business_rules: [{ id: 'BR-1' }] };
		const r = resolveDiscoveryOrigins(spec, graphFixture(), analysis);
		assert.equal(r.origins.length, 0);
		assert.equal(r.net_new[0].ref, 'BR-NOPE');
		assert.match(r.net_new[0].reason, /unknown_br/);
	});

	it('F-M1 — Phase 4 per-BC 자식이 부모보다 먼저 와도 coarse origin = 부모 (정확 id 핀)', () => {
		// 자식을 일부러 부모 앞에 배치 → .find(subkind) 였다면 자식 바인딩될 fragility 재현.
		const node = (id, kind, subkind, extra = {}) => ({
			id,
			artifact_kind: kind,
			artifact_subkind: subkind,
			state: 'active',
			...extra,
		});
		const graph = {
			nodes: [
				node('analysis-business-rules-BC-POST', 'analysis', 'business-rules', { bounded_context: 'BC-POST' }),
				node('analysis-business-rules-BC-USER', 'analysis', 'business-rules', { bounded_context: 'BC-USER' }),
				node('analysis-business-rules', 'analysis', 'business-rules'),
			],
			edges: [],
		};
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }] };
		const analysis = { business_rules: [{ id: 'BR-1' }] };
		const r = resolveDiscoveryOrigins(spec, graph, analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules'], '자식 아닌 부모 coarse 노드');
	});

	// --- S1 per-BC dispatch (Phase 4 선택적 #1) ---
	const dnode = (id, extra = {}) => ({
		id,
		artifact_kind: 'analysis',
		artifact_subkind: 'business-rules',
		state: 'active',
		...extra,
	});
	const s1Graph = {
		nodes: [
			dnode('analysis-business-rules'),
			dnode('analysis-business-rules-BC-POST', { bounded_context: 'BC-POST' }),
			dnode('analysis-business-rules-BC-USER', { bounded_context: 'BC-USER' }),
		],
		edges: [],
	};

	it('S1 — br_id → BC 자식 노드 직접 dispatch (정밀 origin, 부모 아님)', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }] };
		const analysis = { business_rules: [{ id: 'BR-1', bounded_context: 'BC-USER' }] };
		const r = resolveDiscoveryOrigins(spec, s1Graph, analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules-BC-USER']);
	});

	it('S1 — 같은 BC 의 BR 2개 → 자식 1개 dedup', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }, { br_id: 'BR-2' }] };
		const analysis = {
			business_rules: [
				{ id: 'BR-1', bounded_context: 'BC-POST' },
				{ id: 'BR-2', bounded_context: 'BC-POST' },
			],
		};
		const r = resolveDiscoveryOrigins(spec, s1Graph, analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules-BC-POST']);
	});

	it('S1 — 서로 다른 BC → 자식 2개 (정렬)', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }, { br_id: 'BR-2' }] };
		const analysis = {
			business_rules: [
				{ id: 'BR-1', bounded_context: 'BC-USER' },
				{ id: 'BR-2', bounded_context: 'BC-POST' },
			],
		};
		const r = resolveDiscoveryOrigins(spec, s1Graph, analysis);
		assert.deepEqual(r.origins, [
			'analysis-business-rules-BC-POST',
			'analysis-business-rules-BC-USER',
		]);
	});

	it('S1 — 혼합: BC 있는 BR(자식) + BC-less BR(부모 fallback)', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }, { br_id: 'BR-2' }] };
		const analysis = {
			business_rules: [
				{ id: 'BR-1', bounded_context: 'BC-USER' },
				{ id: 'BR-2' }, // BC-less → 부모 fallback
			],
		};
		const r = resolveDiscoveryOrigins(spec, s1Graph, analysis);
		assert.deepEqual(r.origins, [
			'analysis-business-rules',
			'analysis-business-rules-BC-USER',
		]);
	});

	it('S1 — BR 에 BC 는 있으나 자식 노드 부재(미재합성 graph) → 부모 coarse fallback (무회귀)', () => {
		// poc-05 동형: graph 에 자식 없음 + BR bounded_context 존재.
		const graphNoChild = { nodes: [dnode('analysis-business-rules')], edges: [] };
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }] };
		const analysis = { business_rules: [{ id: 'BR-1', bounded_context: 'BC-USER' }] };
		const r = resolveDiscoveryOrigins(spec, graphNoChild, analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules']);
	});


	// --- S6 per-BR dispatch (per-BR granularity / 4-tier 최우선) ---
	const s6Graph = {
		nodes: [
			dnode('analysis-business-rules'),
			dnode('analysis-business-rules-BC-POST', { bounded_context: 'BC-POST' }),
			dnode('analysis-business-rules-BC-USER', { bounded_context: 'BC-USER' }),
			dnode('analysis-business-rules-BR-1', { bounded_context: 'BC-POST', business_rule_id: 'BR-1' }),
			dnode('analysis-business-rules-BR-2', { bounded_context: 'BC-USER', business_rule_id: 'BR-2' }),
		],
		edges: [],
	};

	it('S6 — br_id → per-BR 노드 직접 dispatch (per-BC 아닌 최정밀 origin)', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }] };
		const analysis = { business_rules: [{ id: 'BR-1', bounded_context: 'BC-POST' }] };
		const r = resolveDiscoveryOrigins(spec, s6Graph, analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules-BR-1']);
	});

	it('S6 — per-BR 노드 부재 BR 은 per-BC fallback (혼합 / 4-tier)', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }, { br_id: 'BR-3' }] };
		const analysis = { business_rules: [
			{ id: 'BR-1', bounded_context: 'BC-POST' },
			{ id: 'BR-3', bounded_context: 'BC-USER' },
		] };
		const r = resolveDiscoveryOrigins(spec, s6Graph, analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules-BC-USER', 'analysis-business-rules-BR-1']);
	});

	it('S6 — 서로 다른 BR 2개 → per-BR 2개 (정렬)', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }, { br_id: 'BR-2' }] };
		const analysis = { business_rules: [
			{ id: 'BR-1', bounded_context: 'BC-POST' },
			{ id: 'BR-2', bounded_context: 'BC-USER' },
		] };
		const r = resolveDiscoveryOrigins(spec, s6Graph, analysis);
		assert.deepEqual(r.origins, ['analysis-business-rules-BR-1', 'analysis-business-rules-BR-2']);
	});

	it('analysis 미인식 shape(container present + 0 rules) → shape_unrecognized 진단 + 억제', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }] };
		const analysis = { rules: [{ noId: true }] }; // container present, 0 id-rules
		const r = resolveDiscoveryOrigins(spec, graphFixture(), analysis);
		assert.equal(r.diagnostics.length, 1);
		assert.equal(r.diagnostics[0].kind, 'br_source.shape_unrecognized');
		// 전건 net-new (origin 0) 하되 reason = shape 미인식
		assert.equal(r.origins.length, 0);
		assert.match(r.net_new[0].reason, /shape 미인식/);
	});

	it('analysis null → br 전건 net-new (cli 가 fail-close / 코어는 net-new)', () => {
		const spec = { business_rules_intent: [{ br_id: 'BR-1' }] };
		const r = resolveDiscoveryOrigins(spec, graphFixture(), null);
		assert.equal(r.origins.length, 0);
		assert.equal(r.net_new.length, 1);
	});

	it('결정론: 동일 입력 deep-equal + counts', () => {
		const spec = {
			use_cases: [{ id: 'UC-1' }],
			business_rules_intent: [{ br_id: 'BR-1' }],
		};
		const analysis = { business_rules: [{ id: 'BR-1' }] };
		const a = resolveDiscoveryOrigins(spec, graphFixture(), analysis);
		const b = resolveDiscoveryOrigins(spec, graphFixture(), analysis);
		assert.deepEqual(a, b);
		assert.deepEqual(a.counts, {
			uc_total: 1,
			br_total: 1,
			origins: 2,
			net_new: 0,
		});
	});
});

describe('route-discovery e2e (no-simulation / poc-05 실 fixture)', () => {
	it('route --analysis → existing origins(UC+BR 노드) → regen_queue seed', () => {
		const { status, out } = runJson([
			'route',
			'--discovery-spec',
			join(POC05, 'discovery-spec.json'),
			'--graph',
			join(POC05, 'artifact-graph.json'),
			'--analysis',
			join(POC05, 'business-rules.json'),
			'--dry-run',
			'--json',
		]);
		assert.equal(status, 0);
		assert.ok(out.origins.includes('UC-USER-001'));
		assert.ok(out.origins.includes('analysis-business-rules'));
		assert.equal(out.counts.net_new, 0);
		assert.ok(out.regen_queue.items.length > 0);
		assert.equal(out.propose_only, false);
	});

	it('fail-closed: business_rules_intent 있는데 --analysis 없음 → exit 3', () => {
		const r = run([
			'route',
			'--discovery-spec',
			join(POC05, 'discovery-spec.json'),
			'--graph',
			join(POC05, 'artifact-graph.json'),
			'--dry-run',
		]);
		assert.equal(r.status, 3);
		assert.match(r.stderr, /fail-closed/);
	});

	it('net-new + propose-only: unknown UC/BR / existing origin 0 → exit 0 seed ❌', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'route-'));
		try {
			const spec = join(tmp, 'discovery-spec.json');
			writeFileSync(
				spec,
				JSON.stringify({
					use_cases: [{ id: 'UC-GHOST-999' }],
					business_rules_intent: [{ br_id: 'BR-GHOST-999' }],
				}),
				'utf-8',
			);
			const analysis = join(tmp, 'br.json');
			writeFileSync(
				analysis,
				JSON.stringify({ business_rules: [{ id: 'BR-USER-DATA-001' }] }),
				'utf-8',
			);
			const { status, out } = runJson([
				'route',
				'--discovery-spec',
				spec,
				'--graph',
				join(POC05, 'artifact-graph.json'),
				'--analysis',
				analysis,
				'--json',
			]);
			assert.equal(status, 0, 'propose-only = exit 0 (S2 graph 부재 대응)');
			assert.equal(out.propose_only, true);
			assert.equal(out.origins.length, 0);
			assert.equal(out.counts.net_new, 2);
			assert.equal(out.regen_queue, null);
			assert.equal(out.written, false);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('durable write: route <project> → state.json regen_queue', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'route-w-'));
		try {
			mkdirSync(join(tmp, '.aimd', 'output'), { recursive: true });
			const g = join(tmp, '.aimd', 'output', 'artifact-graph.json');
			copyFileSync(join(POC05, 'artifact-graph.json'), g);
			assert.equal(run(['init', tmp]).status, 0);
			const { status, out } = runJson([
				'route',
				tmp,
				'--discovery-spec',
				join(POC05, 'discovery-spec.json'),
				'--graph',
				g,
				'--analysis',
				join(POC05, 'business-rules.json'),
				'--json',
			]);
			assert.equal(status, 0);
			assert.equal(out.written, true);
			const state = JSON.parse(
				readFileSync(join(tmp, '.aimd', 'state.json'), 'utf-8'),
			);
			assert.deepEqual(state.regen_queue.items, out.regen_queue.items);
			assert.equal(state.regen_queue.source, 'discovery-route');
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it('clobber 가드: in-progress 큐에 route → exit 2 / --force 교체', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'route-c-'));
		try {
			mkdirSync(join(tmp, '.aimd', 'output'), { recursive: true });
			const g = join(tmp, '.aimd', 'output', 'artifact-graph.json');
			copyFileSync(join(POC05, 'artifact-graph.json'), g);
			run(['init', tmp]);
			// seed + 부분 소비 → in-progress
			run([
				'route',
				tmp,
				'--discovery-spec',
				join(POC05, 'discovery-spec.json'),
				'--graph',
				g,
				'--analysis',
				join(POC05, 'business-rules.json'),
			]);
			const clean = join(tmp, 'clean.json');
			writeFileSync(
				clean,
				JSON.stringify({ critical: 0, high: 0, medium: 0, low: 0, info: 0 }),
				'utf-8',
			);
			run(['sync-next', tmp, '--findings', clean]); // 1 stage done → in-progress

			const refuse = run([
				'route',
				tmp,
				'--discovery-spec',
				join(POC05, 'discovery-spec.json'),
				'--graph',
				g,
				'--analysis',
				join(POC05, 'business-rules.json'),
			]);
			assert.equal(refuse.status, 2, 'in-flight done 보호');

			const forced = runJson([
				'route',
				tmp,
				'--discovery-spec',
				join(POC05, 'discovery-spec.json'),
				'--graph',
				g,
				'--analysis',
				join(POC05, 'business-rules.json'),
				'--force',
				'--json',
			]);
			assert.equal(forced.status, 0);
			assert.equal(forced.out.written, true);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe('route-discovery reference-lens trust 가드', () => {
	const coreSrc = readFileSync(join(SRC, 'route-discovery.js'), 'utf-8');
	it('코어에 gate 토큰 0', () => {
		assert.ok(
			!/gate-eval|evaluateGate|loadFindings|applyUserDecision/.test(coreSrc),
		);
	});
	it('코어에 I/O·비결정 토큰 0 (순수)', () => {
		assert.ok(
			!/readFileSync|writeFileSync|execFile|spawn|\bfetch\b/.test(coreSrc),
		);
		assert.ok(!/new Date|Date\.now|Math\.random/.test(coreSrc));
	});
});

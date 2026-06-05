// graph-synthesizer.test.js
// operation.md 결정 8 — P1 알고리즘 3종 중 state machine 풀세트 골든 테스트
// (BFS / DFS cycle 은 각 도구 test 에 별도)
//
// 검증 범위:
//   1. State machine — 4 state × 6 event 전이표 모두 (allowed/forbidden 양방향)
//   2. Edge confidence 일관성 (hard 4 / soft 2 / unknown error)
//   3. Tier-1 카탈로그 (24 = 5 chain + 15 analysis + 4 aspect)
//   4. Node 구성 (chain instance + analysis/aspect kind)
//   5. Edge 구성 — derived_from / tests / implements / cross_reference / informs
//   6. State carry-over (propose/deprecated 보존, source 제거 → deprecated)
//   7. Header (S5 정합) + stats

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	synthesizeGraph,
	transition,
	confidenceFor,
	NODE_STATES,
	TIER1_CATALOG,
	deriveAnalysisCodePointers,
	hasCodeExtension,
	ANALYSIS_SUBKINDS,
	ANALYSIS_BASENAME_TO_KIND,
} from '../src/graph-synthesizer.js';

// ============================================================================
// 1. State machine 전이표 골든 테스트 (operation.md 결정 1 노드 상태)
// ============================================================================

describe('state machine — 4-state transition table (operation.md 결정 1)', () => {
	it('exports 4 states in canonical order', () => {
		assert.deepEqual(
			[...NODE_STATES],
			['active', 'drift', 'propose', 'deprecated'],
		);
	});

	describe('active', () => {
		it('content_changed → drift', () => {
			assert.equal(transition('active', 'content_changed'), 'drift');
		});
		it('deprecate_confirmed → deprecated', () => {
			assert.equal(transition('active', 'deprecate_confirmed'), 'deprecated');
		});
		it('rejects invalid event (user_accept)', () => {
			assert.throws(
				() => transition('active', 'user_accept'),
				/invalid from state 'active'/,
			);
		});
	});

	describe('drift', () => {
		it('revalidated → active', () => {
			assert.equal(transition('drift', 'revalidated'), 'active');
		});
		it('deprecate_confirmed → deprecated', () => {
			assert.equal(transition('drift', 'deprecate_confirmed'), 'deprecated');
		});
		it('rejects invalid event (content_changed already)', () => {
			assert.throws(
				() => transition('drift', 'content_changed'),
				/invalid from state 'drift'/,
			);
		});
	});

	describe('propose', () => {
		it('user_accept → active', () => {
			assert.equal(transition('propose', 'user_accept'), 'active');
		});
		it('user_reject → null (노드 삭제)', () => {
			assert.equal(transition('propose', 'user_reject'), null);
		});
		it('rejects invalid event (content_changed)', () => {
			assert.throws(
				() => transition('propose', 'content_changed'),
				/invalid from state 'propose'/,
			);
		});
	});

	describe('deprecated', () => {
		it('purge → null (노드 삭제)', () => {
			assert.equal(transition('deprecated', 'purge'), null);
		});
		it('rejects invalid event (revalidated)', () => {
			assert.throws(
				() => transition('deprecated', 'revalidated'),
				/invalid from state 'deprecated'/,
			);
		});
	});

	it('rejects unknown state', () => {
		assert.throws(
			() => transition('zombie', 'purge'),
			/unknown state 'zombie'/,
		);
	});
});

// ============================================================================
// 2. Edge confidence (operation.md 결정 1 — hard 4 / soft 2)
// ============================================================================

describe('confidenceFor — edge_type ↔ confidence 일관성', () => {
	it('hard: derived_from / implements / tests / depends_on', () => {
		assert.equal(confidenceFor('derived_from'), 'hard');
		assert.equal(confidenceFor('implements'), 'hard');
		assert.equal(confidenceFor('tests'), 'hard');
		assert.equal(confidenceFor('depends_on'), 'hard');
	});
	it('soft: cross_reference / informs', () => {
		assert.equal(confidenceFor('cross_reference'), 'soft');
		assert.equal(confidenceFor('informs'), 'soft');
	});
	it('rejects unknown edge_type', () => {
		assert.throws(() => confidenceFor('mentions'), /unknown edge_type/);
	});
});

// ============================================================================
// 3. Tier-1 카탈로그 (24 = 5 + 15 + 4) — conventions.md §1 정수 표기 정합
// ============================================================================

describe('TIER1_CATALOG — 25 artifact (chain 6 + analysis 15 + aspect 4) + plan 조직 3 (v11.0.0)', () => {
	it('total = 25 (deliverable / chain 6 + analysis 15 + aspect 4)', () => {
		assert.equal(TIER1_CATALOG.total, 25);
	});
	it('chain subkinds = 6 (v11.0.0 +TASK / UC→BHV→AC→TASK→TC→IMPL)', () => {
		assert.deepEqual(
			[...TIER1_CATALOG.chain],
			['UC', 'BHV', 'AC', 'TASK', 'TC', 'IMPL'],
		);
	});
	it('plan 조직 subkinds = 3 (EPIC / STORY / OP / deliverable total 외)', () => {
		assert.deepEqual([...TIER1_CATALOG.plan], ['EPIC', 'STORY', 'OP']);
	});
	it('analysis subkinds = 15', () => {
		assert.equal(TIER1_CATALOG.analysis.length, 15);
	});
	it('aspect subkinds = 4 (a11y / i18n / static-security / legacy-spectrum)', () => {
		assert.deepEqual([...TIER1_CATALOG.aspect].sort(), [
			'a11y',
			'i18n',
			'legacy-spectrum',
			'static-security',
		]);
	});
});

// ============================================================================
// 4. Node 구성 + 5. Edge 구성 — 미니멀 chain 시나리오
// ============================================================================

const miniInput = {
	planning: { use_cases: [{ id: 'UC-USER-001', name: '회원가입' }] },
	behavior: {
		behaviors: [
			{
				id: 'BHV-USER-001',
				use_case_refs: ['UC-USER-001'],
				br_refs: ['BR-USER-DATA-001'],
			},
		],
	},
	acceptance: {
		criteria: [
			{
				id: 'AC-USER-001',
				behavior_ref: 'BHV-USER-001',
				related_brs: ['BR-USER-DATA-001'],
				related_aps: ['AP-USER-003'],
			},
		],
	},
	testSpec: { test_cases: [{ id: 'TC-USER-001', ac_ref: 'AC-USER-001' }] },
	implSpec: {
		modules: [
			{
				id: 'IMPL-USER-001',
				tc_refs: ['TC-USER-001'],
				bhv_refs: ['BHV-USER-001'],
				source_files: ['src/auth/signup.ts'],
				commit_hash: 'abc1234567890123456789012345678901234567',
			},
		],
	},
	analysis: {
		'business-rules': { meta: { title: 'BR' } },
		antipatterns: { meta: { title: 'AP' } },
	},
	aspect: {
		a11y: { meta: { title: 'A11y', related_chain_ids: ['BHV-USER-001'] } },
	},
	sourcePaths: {
		planning: 'planning-spec.json',
		behavior: 'behavior-spec.json',
		acceptance: 'acceptance-criteria.json',
		testSpec: 'test-spec.json',
		implSpec: 'impl-spec.json',
		analysis: {
			'business-rules': 'business-rules.json',
			antipatterns: 'antipatterns.json',
		},
		aspect: { a11y: 'a11y-spec.json' },
	},
	scopeId: 'user-signup',
	commitHash: 'abc1234',
};

describe('synthesizeGraph — node/edge 구성', () => {
	it('empty input → empty graph (0 nodes / 0 edges, stats 정상)', () => {
		const g = synthesizeGraph({});
		assert.equal(g.nodes.length, 0);
		assert.equal(g.edges.length, 0);
		assert.equal(g.stats.node_count, 0);
		assert.equal(g.stats.by_state.active, 0);
	});

	it('mini chain: 5 chain instance 노드 (UC/BHV/AC/TC/IMPL)', () => {
		const g = synthesizeGraph(miniInput);
		const chainIds = g.nodes
			.filter((n) => n.artifact_kind === 'chain')
			.map((n) => n.id)
			.sort();
		assert.deepEqual(chainIds, [
			'AC-USER-001',
			'BHV-USER-001',
			'IMPL-USER-001',
			'TC-USER-001',
			'UC-USER-001',
		]);
	});

	it('analysis 노드는 로드된 kind 만 (2 = business-rules + antipatterns)', () => {
		const g = synthesizeGraph(miniInput);
		const analysisIds = g.nodes
			.filter((n) => n.artifact_kind === 'analysis')
			.map((n) => n.id)
			.sort();
		assert.deepEqual(analysisIds, [
			'analysis-antipatterns',
			'analysis-business-rules',
		]);
	});

	it('aspect 노드는 로드된 kind 만 (1 = a11y)', () => {
		const g = synthesizeGraph(miniInput);
		const aspectIds = g.nodes
			.filter((n) => n.artifact_kind === 'aspect')
			.map((n) => n.id);
		assert.deepEqual(aspectIds, ['aspect-a11y']);
	});

	it('모든 신규 노드는 state=active', () => {
		const g = synthesizeGraph(miniInput);
		assert.ok(g.nodes.every((n) => n.state === 'active'));
	});

	it('chain forward 엣지: UC→BHV / BHV→AC / AC→TC (derived_from, hard)', () => {
		const g = synthesizeGraph(miniInput);
		const der = g.edges.filter((e) => e.edge_type === 'derived_from');
		const pairs = der.map((e) => `${e.source}->${e.target}`).sort();
		assert.deepEqual(pairs, [
			'AC-USER-001->TC-USER-001',
			'BHV-USER-001->AC-USER-001',
			'UC-USER-001->BHV-USER-001',
		]);
		assert.ok(der.every((e) => e.confidence === 'hard'));
	});

	it('TC→IMPL 엣지: tests (hard)', () => {
		const g = synthesizeGraph(miniInput);
		const tests = g.edges.filter((e) => e.edge_type === 'tests');
		assert.equal(tests.length, 1);
		assert.equal(tests[0].source, 'TC-USER-001');
		assert.equal(tests[0].target, 'IMPL-USER-001');
		assert.equal(tests[0].confidence, 'hard');
	});

	it('IMPL→코드 엣지: implements (hard) + commit_hash 스탬프', () => {
		const g = synthesizeGraph(miniInput);
		const impls = g.edges.filter((e) => e.edge_type === 'implements');
		assert.equal(impls.length, 1);
		assert.equal(impls[0].source, 'IMPL-USER-001');
		assert.equal(impls[0].target, 'src/auth/signup.ts');
		assert.equal(impls[0].confidence, 'hard');
		assert.ok(impls[0].commit_hash, 'commit_hash 스탬프 의무');
	});

	it('chain item 의 code_pointers_na=true → 노드에 평탄화 (P2 결정 3)', () => {
		const input = {
			planning: { use_cases: [{ id: 'UC-X', code_pointers_na: true }] },
		};
		const g = synthesizeGraph(input);
		const uc = g.nodes.find((n) => n.id === 'UC-X');
		assert.equal(uc.code_pointers_na, true);
	});

	it('analysis/aspect 의 code_pointers_na=true → kind 노드에 평탄화 (P2 결정 3)', () => {
		const input = {
			analysis: { domain: { code_pointers_na: true } },
			aspect: { i18n: { code_pointers_na: true } },
		};
		const g = synthesizeGraph(input);
		assert.equal(
			g.nodes.find((n) => n.id === 'analysis-domain').code_pointers_na,
			true,
		);
		assert.equal(
			g.nodes.find((n) => n.id === 'aspect-i18n').code_pointers_na,
			true,
		);
	});

	it('chain item 의 code_pointers (frontmatter) → 노드 평탄화 (P2 결정 3 IMPL → 전 chain 확장)', () => {
		const input = {
			behavior: {
				behaviors: [
					{
						id: 'BHV-X',
						use_case_refs: [],
						code_pointers: [{ path: 'docs/bhv.md', anchor_type: 'doc_link' }],
					},
				],
			},
		};
		const g = synthesizeGraph(input);
		const bhv = g.nodes.find((n) => n.id === 'BHV-X');
		assert.equal(bhv.code_pointers.length, 1);
		assert.equal(bhv.code_pointers[0].anchor_type, 'doc_link');
	});

	it('IMPL.source_files → code_pointers (strict_path) 평탄화', () => {
		const g = synthesizeGraph(miniInput);
		const impl = g.nodes.find((n) => n.id === 'IMPL-USER-001');
		assert.ok(impl.code_pointers);
		assert.equal(impl.code_pointers[0].path, 'src/auth/signup.ts');
		assert.equal(impl.code_pointers[0].anchor_type, 'strict_path');
	});

	// A2 content-drift baseline — strict_path pointer commit_hash auto-stamp (DEC-2026-06-01 dogfood F-DF-A2-001)
	it('A2 baseline — commitHash 지정 시 strict_path pointer 에 commit_hash 스탬프', () => {
		const input = {
			behavior: {
				behaviors: [
					{
						id: 'BHV-S',
						use_case_refs: [],
						code_pointers: [{ path: 'src/x.ts', anchor_type: 'strict_path' }],
					},
				],
			},
			commitHash: 'feed1234',
		};
		const g = synthesizeGraph(input);
		const bhv = g.nodes.find((n) => n.id === 'BHV-S');
		assert.equal(bhv.code_pointers[0].commit_hash, 'feed1234');
	});

	it('A2 baseline — commitHash 미지정 → strict_path pointer commit_hash 미스탬프 (기존 behavior / backward-compat)', () => {
		const input = {
			behavior: {
				behaviors: [
					{
						id: 'BHV-S',
						use_case_refs: [],
						code_pointers: [{ path: 'src/x.ts', anchor_type: 'strict_path' }],
					},
				],
			},
		};
		const g = synthesizeGraph(input);
		const bhv = g.nodes.find((n) => n.id === 'BHV-S');
		assert.equal(bhv.code_pointers[0].commit_hash, undefined);
	});

	it('A2 baseline — strict_path 외(glob/ast_symbol/doc_link)는 미스탬프 (false-drift 회피)', () => {
		const input = {
			behavior: {
				behaviors: [
					{
						id: 'BHV-G',
						use_case_refs: [],
						code_pointers: [
							{ path: 'src/*.ts', anchor_type: 'glob' },
							{ path: 'Svc.foo', anchor_type: 'ast_symbol', symbol: 'Svc.foo' },
							{ path: 'docs/x.md', anchor_type: 'doc_link' },
						],
					},
				],
			},
			commitHash: 'feed1234',
		};
		const g = synthesizeGraph(input);
		const bhv = g.nodes.find((n) => n.id === 'BHV-G');
		assert.ok(
			bhv.code_pointers.every((p) => p.commit_hash === undefined),
			'strict_path 외엔 미스탬프',
		);
	});

	it('A2 baseline — 상류 impl.commit_hash(:214) 보존 / commitHash 로 덮어쓰기 ❌', () => {
		// miniInput: impl.commit_hash=abc...(40char) → :214 가 pointer 에 스탬프 / commitHash=abc1234 와 다름
		const g = synthesizeGraph(miniInput);
		const impl = g.nodes.find((n) => n.id === 'IMPL-USER-001');
		assert.equal(
			impl.code_pointers[0].commit_hash,
			'abc1234567890123456789012345678901234567',
		);
	});

	it('cross_reference 엣지 (analysis ↔ chain, soft) — BR→BHV/AC + AP→AC', () => {
		const g = synthesizeGraph(miniInput);
		const xrefs = g.edges.filter((e) => e.edge_type === 'cross_reference');
		const pairs = xrefs.map((e) => `${e.source}->${e.target}`).sort();
		assert.deepEqual(pairs, [
			'analysis-antipatterns->AC-USER-001',
			'analysis-business-rules->AC-USER-001',
			'analysis-business-rules->BHV-USER-001',
		]);
		assert.ok(xrefs.every((e) => e.confidence === 'soft'));
	});

	it('informs 엣지 (aspect → chain, soft) — a11y → BHV (meta.related_chain_ids)', () => {
		const g = synthesizeGraph(miniInput);
		const informs = g.edges.filter((e) => e.edge_type === 'informs');
		assert.equal(informs.length, 1);
		assert.equal(informs[0].source, 'aspect-a11y');
		assert.equal(informs[0].target, 'BHV-USER-001');
		assert.equal(informs[0].confidence, 'soft');
	});

	it('analysis kind 미로드 시 cross_reference dangling 안 emit', () => {
		const inputNoAnalysis = {
			...miniInput,
			analysis: {},
			sourcePaths: { ...miniInput.sourcePaths, analysis: {} },
		};
		const g = synthesizeGraph(inputNoAnalysis);
		assert.equal(
			g.edges.filter((e) => e.edge_type === 'cross_reference').length,
			0,
		);
	});

	it('aspect → chain target 부재 시 dangling 안 emit', () => {
		const input = {
			...miniInput,
			aspect: { a11y: { meta: { related_chain_ids: ['BHV-MISSING-999'] } } },
		};
		const g = synthesizeGraph(input);
		assert.equal(g.edges.filter((e) => e.edge_type === 'informs').length, 0);
	});

	// --- v11.x (F-ECOM-004) Layer 4 — cross_links.to_analysis_artifacts → cross_reference ---
	const layer4Input = {
		discovery: {
			use_cases: [{ id: 'UC-B' }, { id: 'UC-A' }], // anchor = UC-A (정렬 첫)
			cross_links: {
				to_analysis_artifacts: [
					'.aimd/output/domain.json',
					'schema.json',
					'state-map.json',
				],
			},
		},
		behavior: {
			behaviors: [{ id: 'BHV-1', use_case_refs: ['UC-A'], br_refs: ['BR-1'] }],
			cross_links: { to_analysis_artifacts: ['business-rules.json'] },
		},
		analysis: {
			domain: { meta: { title: 'D' } },
			'db-schema': { meta: { title: 'S' } },
			'business-rules': { meta: { title: 'BR' } },
			// state-map 미로드
		},
	};

	it('F-ECOM-004 Layer 4: to_analysis_artifacts → cross_reference edge + orphan 해소 (anchor)', () => {
		const g = synthesizeGraph(layer4Input);
		const xrefs = g.edges
			.filter((e) => e.edge_type === 'cross_reference')
			.map((e) => `${e.source}->${e.target}`);
		assert.ok(
			xrefs.includes('analysis-domain->UC-A'),
			'domain → discovery anchor UC-A',
		);
		assert.ok(
			xrefs.includes('analysis-db-schema->UC-A'),
			'schema.json → db-schema → UC-A (basename alias)',
		);
		// orphan 해소: domain/db-schema 노드가 ≥1 edge
		const deg = (id) =>
			g.edges.filter((e) => e.source === id || e.target === id).length;
		assert.ok(deg('analysis-domain') > 0 && deg('analysis-db-schema') > 0);
		assert.ok(
			g.edges
				.filter((e) => e.edge_type === 'cross_reference')
				.every((e) => e.confidence === 'soft'),
		);
	});

	it('F-ECOM-004 Layer 4: 미로드 kind dangling 안 emit (state-map)', () => {
		const g = synthesizeGraph(layer4Input);
		assert.equal(
			g.edges.filter((e) => e.source === 'analysis-state-map').length,
			0,
		);
		assert.ok(!g.nodes.some((n) => n.id === 'analysis-state-map'));
	});

	it('F-ECOM-004 Layer 4: dedup — Layer 1 (br_refs) 과 동일 (src,anchor) 중복 안 만듦', () => {
		const g = synthesizeGraph(layer4Input);
		// behavior anchor=BHV-1, br_refs 로 Layer1 이 이미 analysis-business-rules→BHV-1 생성 → Layer4 dedup
		const dup = g.edges.filter(
			(e) =>
				e.edge_type === 'cross_reference' &&
				e.source === 'analysis-business-rules' &&
				e.target === 'BHV-1',
		);
		assert.equal(dup.length, 1, '중복 edge 없어야 함');
	});

	it('F-ECOM-004 Layer 4: anchor 부재(빈 layer) → no edge / no crash', () => {
		const g = synthesizeGraph({
			discovery: {
				use_cases: [],
				cross_links: { to_analysis_artifacts: ['domain.json'] },
			},
			analysis: { domain: { meta: {} } },
		});
		assert.equal(
			g.edges.filter((e) => e.source === 'analysis-domain').length,
			0,
		);
	});

	it('F-ECOM-004: ANALYSIS_BASENAME_TO_KIND drift guard — 모든 ANALYSIS_SUBKINDS 매핑됨', () => {
		const mappedKinds = new Set(Object.values(ANALYSIS_BASENAME_TO_KIND));
		const missing = ANALYSIS_SUBKINDS.filter((k) => !mappedKinds.has(k));
		assert.deepEqual(missing, [], `미매핑 kind: ${missing.join(',')}`);
	});

	it('scope_id / commit_hash 스탬프 — code-pointer commit 우선 보존', () => {
		const g = synthesizeGraph(miniInput);
		assert.ok(g.nodes.every((n) => n.scope_id === 'user-signup'));
		assert.ok(g.nodes.every((n) => n.commit_hash === 'abc1234'));
		// 모든 엣지는 commit_hash 가 있어야 함 (IMPL→code 는 ptr.commit_hash 우선이므로 다른 값 가능)
		assert.ok(
			g.edges.every(
				(e) => typeof e.commit_hash === 'string' && e.commit_hash.length >= 7,
			),
		);
		// chain forward / tests / cross_reference / informs 는 input commitHash 로 스탬프
		const nonImpl = g.edges.filter((e) => e.edge_type !== 'implements');
		assert.ok(nonImpl.every((e) => e.commit_hash === 'abc1234'));
		// implements 엣지는 IMPL.commit_hash (긴 SHA) 보존
		const implEdge = g.edges.find((e) => e.edge_type === 'implements');
		assert.equal(
			implEdge.commit_hash,
			'abc1234567890123456789012345678901234567',
		);
		assert.equal(g.scope_id, 'user-signup');
		assert.equal(g.commit_hash, 'abc1234');
	});
});

// ============================================================================
// 6. State carry-over (previousGraph) — propose/deprecated 보존
// ============================================================================

describe('state carry-over from previousGraph', () => {
	it('이전 propose 노드 → 신규 합성에서도 propose 보존', () => {
		const previousGraph = {
			nodes: [
				{
					id: 'BHV-USER-001',
					artifact_kind: 'chain',
					artifact_subkind: 'BHV',
					source_path: 'behavior-spec.json',
					state: 'propose',
				},
			],
		};
		const g = synthesizeGraph({ ...miniInput, previousGraph });
		const bhv = g.nodes.find((n) => n.id === 'BHV-USER-001');
		assert.equal(bhv.state, 'propose');
	});

	it('이전 deprecated 노드 → 신규에서도 deprecated', () => {
		const previousGraph = {
			nodes: [
				{
					id: 'BHV-USER-001',
					artifact_kind: 'chain',
					artifact_subkind: 'BHV',
					source_path: 'behavior-spec.json',
					state: 'deprecated',
				},
			],
		};
		const g = synthesizeGraph({ ...miniInput, previousGraph });
		const bhv = g.nodes.find((n) => n.id === 'BHV-USER-001');
		assert.equal(bhv.state, 'deprecated');
	});

	it('이전 drift 노드 → 신규에서 active 로 reset (drift 는 외부 hook 재계산)', () => {
		const previousGraph = {
			nodes: [
				{
					id: 'BHV-USER-001',
					artifact_kind: 'chain',
					artifact_subkind: 'BHV',
					source_path: 'behavior-spec.json',
					state: 'drift',
				},
			],
		};
		const g = synthesizeGraph({ ...miniInput, previousGraph });
		const bhv = g.nodes.find((n) => n.id === 'BHV-USER-001');
		assert.equal(
			bhv.state,
			'active',
			'drift 는 외부 hook 이 재부여하므로 reset',
		);
	});

	it('이전엔 있었으나 이번 입력에 없는 노드 → deprecated 로 보존 + drift_reason', () => {
		const previousGraph = {
			nodes: [
				{
					id: 'BHV-USER-999',
					artifact_kind: 'chain',
					artifact_subkind: 'BHV',
					source_path: 'behavior-spec.json',
					state: 'active',
				},
			],
		};
		const g = synthesizeGraph({ ...miniInput, previousGraph });
		const removed = g.nodes.find((n) => n.id === 'BHV-USER-999');
		assert.ok(removed, '제거된 노드는 그래프에 deprecated 로 남아야 함');
		assert.equal(removed.state, 'deprecated');
		assert.equal(removed.drift_reason, 'source removed');
	});

	it('이전에 이미 deprecated 였던 노드는 drift_reason 새로 덮어쓰지 않음', () => {
		const previousGraph = {
			nodes: [
				{
					id: 'BHV-USER-999',
					artifact_kind: 'chain',
					artifact_subkind: 'BHV',
					source_path: 'behavior-spec.json',
					state: 'deprecated',
					drift_reason: 'manual deprecate confirmed',
				},
			],
		};
		const g = synthesizeGraph({ ...miniInput, previousGraph });
		const old = g.nodes.find((n) => n.id === 'BHV-USER-999');
		assert.equal(old.state, 'deprecated');
		assert.equal(old.drift_reason, 'manual deprecate confirmed');
	});
});

// ============================================================================
// 7. Header (S5 정합) + stats
// ============================================================================

describe('header + stats (S5 derived_from / do_not_edit_manually)', () => {
	it('header: do_not_edit_manually=true + schema refs', () => {
		const g = synthesizeGraph(miniInput);
		assert.equal(g.do_not_edit_manually, true);
		assert.equal(g.schema.node, 'artifact-graph-node.schema.json');
		assert.equal(g.schema.edge, 'artifact-graph-edge.schema.json');
	});

	it('derived_from 에 모든 입력 source 포함', () => {
		const g = synthesizeGraph(miniInput);
		for (const expected of [
			'planning-spec.json',
			'behavior-spec.json',
			'acceptance-criteria.json',
			'test-spec.json',
			'impl-spec.json',
			'business-rules.json',
			'antipatterns.json',
			'a11y-spec.json',
		]) {
			assert.ok(
				g.derived_from.includes(expected),
				`derived_from must include ${expected}`,
			);
		}
	});

	it('synthesized_at = ISO 8601', () => {
		const g = synthesizeGraph(miniInput);
		assert.match(g.synthesized_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});

	it('stats: by_kind / by_state / by_edge_type 정합', () => {
		const g = synthesizeGraph(miniInput);
		assert.equal(g.stats.node_count, g.nodes.length);
		assert.equal(g.stats.edge_count, g.edges.length);
		assert.equal(g.stats.by_kind.chain, 5);
		assert.equal(g.stats.by_kind.analysis, 2);
		assert.equal(g.stats.by_kind.aspect, 1);
		assert.equal(g.stats.by_state.active, 8);
		assert.equal(g.stats.by_edge_type.derived_from, 3);
		assert.equal(g.stats.by_edge_type.tests, 1);
		assert.equal(g.stats.by_edge_type.implements, 1);
		assert.equal(g.stats.by_edge_type.cross_reference, 3);
		assert.equal(g.stats.by_edge_type.informs, 1);
		assert.equal(g.stats.by_edge_type.depends_on, 0);
	});
});

// ============================================================================
// 8. v11.0.0 paradigm — 6-layer chain (TASK) + plan 조직 노드 + contract leaf
//    (plan-dep-graph-v11-paradigm-cascade.md §8 DESIGN)
// ============================================================================

const v11Input = {
	// discovery (planning alias 대체) — UC source
	discovery: { use_cases: [{ id: 'UC-USER-001', name: '회원가입' }] },
	behavior: {
		behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }],
	},
	acceptance: {
		criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001' }],
	},
	// plan stage — TASK + 조직 ref (epic/story/op)
	taskPlan: {
		epic_refs: [{ screen_id: 'SCREEN-REGISTER', title: '회원가입 화면' }],
		story_refs: [
			{
				behavior_ref: 'BHV-USER-001',
				epic_ref: 'SCREEN-REGISTER',
				title: '가입 스토리',
			},
		],
		op_task_refs: [
			{ op_task_id: 'OP-USER-001', category: 'infra', title: 'DB 마이그' },
		],
		tasks: [
			{
				id: 'TASK-USER-001',
				layer: 'be',
				ac_refs: ['AC-USER-001'],
				tc_refs: ['TC-USER-001'],
				story_ref: 'STORY-USER-001',
				op_task_ref: 'OP-USER-001',
				openapi_endpoint_ref: {
					path: '/users',
					operationId: 'registerUser',
					method: 'post',
				},
			},
		],
	},
	testSpec: {
		test_cases: [
			{
				id: 'TC-USER-001',
				ac_ref: 'AC-USER-001',
				openapi_contract_ref: {
					path: '/users',
					operationId: 'registerUser',
					method: 'post',
					contract_file: 'openapi.yaml',
				},
			},
		],
	},
	implSpec: {
		modules: [
			{
				id: 'IMPL-USER-001',
				tc_refs: ['TC-USER-001'],
				source_files: ['src/user.ts'],
			},
		],
	},
	sourcePaths: {
		discovery: 'discovery-spec.json',
		behavior: 'behavior-spec.json',
		acceptance: 'acceptance-criteria.json',
		taskPlan: 'task-plan.json',
		testSpec: 'test-spec.json',
		implSpec: 'impl-spec.json',
	},
};

describe('synthesizeGraph — v11.0.0 6-layer chain + plan 조직 + contract', () => {
	it('TASK 노드 생성 (artifact_kind=chain / subkind=TASK / layer=be 속성)', () => {
		const g = synthesizeGraph(v11Input);
		const task = g.nodes.find((n) => n.id === 'TASK-USER-001');
		assert.ok(task, 'TASK 노드 존재');
		assert.equal(task.artifact_kind, 'chain');
		assert.equal(task.artifact_subkind, 'TASK');
		assert.equal(task.layer, 'be', 'BE/FE axis = layer 속성');
	});

	it('6-layer chain forward: AC→TASK→TC (derived_from) + AC→TC shortcut 억제', () => {
		const g = synthesizeGraph(v11Input);
		const der = g.edges
			.filter((e) => e.edge_type === 'derived_from')
			.map((e) => `${e.source}->${e.target}`);
		assert.ok(der.includes('AC-USER-001->TASK-USER-001'), 'AC→TASK');
		assert.ok(der.includes('TASK-USER-001->TC-USER-001'), 'TASK→TC');
		assert.ok(
			!der.includes('AC-USER-001->TC-USER-001'),
			'TASK 점유 시 AC→TC shortcut 억제',
		);
	});

	it('task-plan 부재 시 AC→TC fallback 보존 (backward compat)', () => {
		const noTask = { ...v11Input, taskPlan: null };
		const g = synthesizeGraph(noTask);
		const der = g.edges
			.filter((e) => e.edge_type === 'derived_from')
			.map((e) => `${e.source}->${e.target}`);
		assert.ok(
			der.includes('AC-USER-001->TC-USER-001'),
			'task 부재 → AC→TC 직접',
		);
		assert.ok(
			!g.nodes.some((n) => n.artifact_subkind === 'TASK'),
			'TASK 노드 없음',
		);
	});

	it('plan 조직 노드: EPIC / STORY / OP (artifact_kind=plan)', () => {
		const g = synthesizeGraph(v11Input);
		const plan = g.nodes.filter((n) => n.artifact_kind === 'plan');
		const ids = plan.map((n) => `${n.artifact_subkind}:${n.id}`).sort();
		assert.deepEqual(ids, [
			'EPIC:SCREEN-REGISTER',
			'OP:OP-USER-001',
			'STORY:STORY-USER-001',
		]);
	});

	it('groups 엣지 (soft): Epic→Story / Story→TASK / OP→TASK', () => {
		const g = synthesizeGraph(v11Input);
		const grp = g.edges.filter((e) => e.edge_type === 'groups');
		const pairs = grp.map((e) => `${e.source}->${e.target}`).sort();
		assert.deepEqual(pairs, [
			'OP-USER-001->TASK-USER-001',
			'SCREEN-REGISTER->STORY-USER-001',
			'STORY-USER-001->TASK-USER-001',
		]);
		assert.ok(grp.every((e) => e.confidence === 'soft'));
	});

	it('dangling groups prune — 존재하지 않는 노드 참조 시 제거', () => {
		const orphanRef = {
			...v11Input,
			taskPlan: {
				...v11Input.taskPlan,
				tasks: [
					{
						...v11Input.taskPlan.tasks[0],
						story_ref: 'STORY-MISSING-999',
						op_task_ref: 'OP-MISSING-999',
					},
				],
			},
		};
		const g = synthesizeGraph(orphanRef);
		const grp = g.edges
			.filter((e) => e.edge_type === 'groups')
			.map((e) => `${e.source}->${e.target}`);
		assert.ok(
			!grp.some((p) => p.includes('MISSING')),
			'dangling groups 제거됨',
		);
	});

	it('conforms_to 엣지 (hard leaf): TASK→openapi contract + TC→openapi contract', () => {
		const g = synthesizeGraph(v11Input);
		const cf = g.edges.filter((e) => e.edge_type === 'conforms_to');
		const pairs = cf.map((e) => `${e.source}->${e.target}`).sort();
		assert.deepEqual(pairs, [
			'TASK-USER-001->contract:openapi:POST /users',
			'TC-USER-001->contract:openapi:POST /users',
		]);
		assert.ok(cf.every((e) => e.confidence === 'hard'));
	});

	it('stats: by_kind.plan + by_edge_type.groups/conforms_to', () => {
		const g = synthesizeGraph(v11Input);
		assert.equal(g.stats.by_kind.plan, 3);
		assert.equal(g.stats.by_kind.chain, 6); // UC/BHV/AC/TASK/TC/IMPL
		assert.equal(g.stats.by_edge_type.groups, 3);
		assert.equal(g.stats.by_edge_type.conforms_to, 2);
	});

	it('planning alias = discovery (backward compat)', () => {
		const aliased = {
			...v11Input,
			discovery: undefined,
			planning: v11Input.discovery,
		};
		const g = synthesizeGraph({
			...aliased,
			planning: { use_cases: [{ id: 'UC-USER-001', name: 'x' }] },
		});
		assert.ok(
			g.nodes.some((n) => n.id === 'UC-USER-001'),
			'planning alias 로도 UC 합성',
		);
	});

	it('confidenceFor: conforms_to=hard / groups=soft', () => {
		assert.equal(confidenceFor('conforms_to'), 'hard');
		assert.equal(confidenceFor('groups'), 'soft');
	});
});

// ============================================================================
// v11.2.0 — analysis schema chain-link 일관성 (ADR-CHAIN-013)
//   3 layer 매핑 검증:
//     Layer 1 — chain-side ref (BHV.br_refs / AC.related_brs+aps) — 기존 검증
//     Layer 2 — analysis-side self-ref (6 kinds: formal-spec / characterization / api / ui-ux / sql-inventory / domain)
//     Layer 3 — meta.related_chain_ids fallback (5 kinds: architecture / db-schema / state-map / type-spec / error-mapping-spec)
//   PoC #16 발견 (12 analysis 적재 시 83% orphan) 회귀 차단.
// ============================================================================

describe('synthesizeGraph — v11.2.0 analysis chain-link 일관성 (ADR-CHAIN-013)', () => {
	// miniInput 확장 — 6 analysis self-ref + 5 meta fallback + minimal chain/plan layer
	const v112Input = {
		discovery: { use_cases: [{ id: 'UC-USER-001' }, { id: 'UC-USER-002' }] },
		behavior: {
			behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }],
		},
		acceptance: {
			criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001' }],
		},
		analysis: {
			// Layer 2 — analysis-side self-ref
			'formal-spec': { sequences: [{ uc_id: 'UC-USER-001' }] },
			'characterization-spec': {
				snapshots: [{ snapshot_id: 'SNAP-1', use_case: 'UC-USER-001' }],
			},
			api: {
				operations: [
					{ operation_id: 'foo', related_use_case_id: 'UC-USER-001' },
				],
			},
			'ui-ux': {
				pages: [{ id: 'PAGE-1', related_use_cases: ['UC-USER-001'] }],
				components: [{ id: 'CMP-1', related_use_cases: ['UC-USER-002'] }],
			},
			'sql-inventory': {
				inventory: [{ sql_id: 'q1', uc_link: 'UC-USER-001' }],
			},
			domain: {
				bounded_contexts: [
					{
						id: 'BC-USER',
						aggregates: [
							{ id: 'AGG-USER', related_use_cases: ['UC-USER-001'] },
						],
					},
				],
			},
			// Layer 3 — meta.related_chain_ids fallback (5 schemas 의무)
			architecture: { meta: { related_chain_ids: ['BHV-USER-001'] } },
			'db-schema': { meta: { related_chain_ids: ['BHV-USER-001'] } },
			'state-map': { meta: { related_chain_ids: ['AC-USER-001'] } },
			'type-spec': { meta: { related_chain_ids: ['AC-USER-001'] } },
			'error-mapping-spec': { meta: { related_chain_ids: ['AC-USER-001'] } },
		},
	};

	it('Layer 2 — formal-spec.sequences[].uc_id → analysis-formal-spec→UC cross_reference', () => {
		const g = synthesizeGraph(v112Input);
		const found = g.edges.find(
			(e) =>
				e.source === 'analysis-formal-spec' &&
				e.target === 'UC-USER-001' &&
				e.edge_type === 'cross_reference',
		);
		assert.ok(found, 'formal-spec.sequences[].uc_id → UC 매핑 의무');
	});

	it('Layer 2 — characterization-spec.snapshots[].use_case → UC', () => {
		const g = synthesizeGraph(v112Input);
		const found = g.edges.find(
			(e) =>
				e.source === 'analysis-characterization-spec' &&
				e.target === 'UC-USER-001' &&
				e.edge_type === 'cross_reference',
		);
		assert.ok(found);
	});

	it('Layer 2 — api.operations[].related_use_case_id → UC', () => {
		const g = synthesizeGraph(v112Input);
		const found = g.edges.find(
			(e) =>
				e.source === 'analysis-api' &&
				e.target === 'UC-USER-001' &&
				e.edge_type === 'cross_reference',
		);
		assert.ok(found);
	});

	it('Layer 2 — ui-ux.pages[].related_use_cases + components[].related_use_cases → UC (양쪽)', () => {
		const g = synthesizeGraph(v112Input);
		const toUc1 = g.edges.find(
			(e) =>
				e.source === 'analysis-ui-ux' &&
				e.target === 'UC-USER-001' &&
				e.edge_type === 'cross_reference',
		);
		const toUc2 = g.edges.find(
			(e) =>
				e.source === 'analysis-ui-ux' &&
				e.target === 'UC-USER-002' &&
				e.edge_type === 'cross_reference',
		);
		assert.ok(toUc1 && toUc2, 'ui-ux 의 pages + components 모두 매핑 의무');
	});

	it('Layer 2 — sql-inventory.inventory[].uc_link → UC (12 컬럼 정합)', () => {
		const g = synthesizeGraph(v112Input);
		const found = g.edges.find(
			(e) =>
				e.source === 'analysis-sql-inventory' &&
				e.target === 'UC-USER-001' &&
				e.edge_type === 'cross_reference',
		);
		assert.ok(found);
	});

	it('Layer 2 — domain.bounded_contexts[].aggregates[].related_use_cases → UC (nested 2-deep)', () => {
		const g = synthesizeGraph(v112Input);
		const found = g.edges.find(
			(e) =>
				e.source === 'analysis-domain' &&
				e.target === 'UC-USER-001' &&
				e.edge_type === 'cross_reference',
		);
		assert.ok(
			found,
			'domain bounded_context.aggregate 안 nested ref 도 cross_reference',
		);
	});

	it('Layer 3 — meta.related_chain_ids (5 schemas fallback)', () => {
		const g = synthesizeGraph(v112Input);
		const expected = [
			{ source: 'analysis-architecture', target: 'BHV-USER-001' },
			{ source: 'analysis-db-schema', target: 'BHV-USER-001' },
			{ source: 'analysis-state-map', target: 'AC-USER-001' },
			{ source: 'analysis-type-spec', target: 'AC-USER-001' },
			{ source: 'analysis-error-mapping-spec', target: 'AC-USER-001' },
		];
		for (const exp of expected) {
			const found = g.edges.find(
				(e) =>
					e.source === exp.source &&
					e.target === exp.target &&
					e.edge_type === 'cross_reference',
			);
			assert.ok(
				found,
				`${exp.source} → ${exp.target} 매핑 의무 (meta.related_chain_ids)`,
			);
		}
	});

	it('orphan 회귀 차단 — 11 analysis 모두 ≥ 1 cross_reference edge (PoC #16 발견 정합)', () => {
		const g = synthesizeGraph(v112Input);
		const analysisIds = g.nodes
			.filter((n) => n.artifact_kind === 'analysis')
			.map((n) => n.id);
		const inOrOut = new Set();
		for (const e of g.edges) {
			inOrOut.add(e.source);
			inOrOut.add(e.target);
		}
		const orphan = analysisIds.filter((id) => !inOrOut.has(id));
		assert.deepEqual(
			orphan,
			[],
			`analysis orphan = 0 의무 (실제: ${orphan.join(', ') || 'none'})`,
		);
	});

	it('dangling 가드 — 존재하지 않는 chain id 는 edge emit ❌', () => {
		const dangling = {
			...v112Input,
			analysis: {
				...v112Input.analysis,
				'formal-spec': { sequences: [{ uc_id: 'UC-NONEXISTENT-999' }] },
				architecture: { meta: { related_chain_ids: ['UC-NONEXISTENT-999'] } },
			},
		};
		const g = synthesizeGraph(dangling);
		const danglingEdges = g.edges.filter(
			(e) => e.target === 'UC-NONEXISTENT-999',
		);
		assert.equal(danglingEdges.length, 0, 'nodeIds.has(target) 가드 통과 의무');
	});
});

// ============================================================================
// F-DOGFOOD-009 — 의도/집계 노드 code_pointers_na 기본값 backstop
//   RealWorld dogfood 실측 (coverage 21.7% / missing 90) 기반. UC/BHV/AC/TASK + analysis/aspect
//   = 의도/집계 노드 → 코드 anchor 없음이 정상 = na=true 자동. IMPL/TC 제외 (source fallback / 무source 시
//   missing 노출 유지). plan(EPIC/STORY/OP) 무관 (Tier-1 외). active 노드만 (carry-over deprecated 무변조).
//   Senior REVISE (state==='active' 게이트) 정합.
// ============================================================================

describe('synthesizeGraph — F-DOGFOOD-009 의도 노드 code_pointers_na backstop', () => {
	const intentInput = {
		discovery: { use_cases: [{ id: 'UC-USER-001' }] },
		behavior: {
			behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }],
		},
		acceptance: {
			criteria: [{ id: 'AC-USER-001', behavior_ref: 'BHV-USER-001' }],
		},
		taskPlan: {
			tasks: [
				{
					id: 'TASK-USER-001',
					ac_refs: ['AC-USER-001'],
					tc_refs: ['TC-USER-001'],
					layer: 'be',
				},
			],
		},
		testSpec: {
			test_cases: [
				{
					id: 'TC-USER-001',
					ac_ref: 'AC-USER-001',
					source_file: 'test/user.test.ts',
				},
			],
		},
		implSpec: {
			modules: [
				{
					id: 'IMPL-USER-001',
					tc_refs: ['TC-USER-001'],
					source_files: ['src/user.ts'],
				},
			],
		},
		analysis: { domain: { meta: { title: 'D' } } },
		aspect: { i18n: { meta: { title: 'I' } } },
	};

	it('1) UC/BHV/AC/TASK (의도 노드, 포인터 없음) → code_pointers_na=true 자동', () => {
		const g = synthesizeGraph(intentInput);
		for (const id of [
			'UC-USER-001',
			'BHV-USER-001',
			'AC-USER-001',
			'TASK-USER-001',
		]) {
			assert.equal(
				g.nodes.find((n) => n.id === id).code_pointers_na,
				true,
				`${id} backstop 의무`,
			);
		}
	});

	it('2) 이미 code_pointers 보유 노드 → backstop no-op (na 미설정 / validator na_conflict 회피)', () => {
		const g = synthesizeGraph({
			behavior: {
				behaviors: [
					{
						id: 'BHV-X',
						use_case_refs: [],
						code_pointers: [{ path: 'docs/bhv.md', anchor_type: 'doc_link' }],
					},
				],
			},
		});
		const bhv = g.nodes.find((n) => n.id === 'BHV-X');
		assert.equal(bhv.code_pointers.length, 1);
		assert.equal(
			bhv.code_pointers_na,
			undefined,
			'pointer 있으면 na 미설정 (na_conflict 회피)',
		);
	});

	it('3) IMPL/TC 가 source 없으면 missing 유지 (na 미설정 / anti-regression — code-bearing 결함 노출)', () => {
		const g = synthesizeGraph({
			testSpec: { test_cases: [{ id: 'TC-NO-SRC', ac_ref: 'AC-Y' }] },
			implSpec: { modules: [{ id: 'IMPL-NO-SRC', tc_refs: [] }] },
		});
		const tc = g.nodes.find((n) => n.id === 'TC-NO-SRC');
		const impl = g.nodes.find((n) => n.id === 'IMPL-NO-SRC');
		assert.equal(
			tc.code_pointers_na,
			undefined,
			'TC 무source → na 미설정 (missing 노출 유지)',
		);
		assert.ok(!tc.code_pointers, 'TC code_pointers 부재');
		assert.equal(impl.code_pointers_na, undefined, 'IMPL 무source → na 미설정');
		assert.ok(!impl.code_pointers, 'IMPL code_pointers 부재');
	});

	it('4) analysis/aspect (포인터 없음) → na=true / plan(EPIC) 노드는 무변경', () => {
		const g = synthesizeGraph({
			...intentInput,
			taskPlan: {
				...intentInput.taskPlan,
				epic_refs: [{ screen_id: 'SCREEN-X', title: 'X' }],
			},
		});
		assert.equal(
			g.nodes.find((n) => n.id === 'analysis-domain').code_pointers_na,
			true,
		);
		assert.equal(
			g.nodes.find((n) => n.id === 'aspect-i18n').code_pointers_na,
			true,
		);
		const epic = g.nodes.find((n) => n.id === 'SCREEN-X');
		assert.equal(epic.artifact_kind, 'plan');
		assert.equal(
			epic.code_pointers_na,
			undefined,
			'plan 노드는 backstop 대상 외',
		);
	});

	it('5) carried-over deprecated 의도 노드 → na 미stamp (Senior (a) 회귀 anchor / 무음 변조 차단)', () => {
		const previousGraph = {
			nodes: [
				{
					id: 'UC-GONE-999',
					artifact_kind: 'chain',
					artifact_subkind: 'UC',
					source_path: 'discovery-spec.json',
					state: 'active',
				},
			],
		};
		const g = synthesizeGraph({ ...intentInput, previousGraph });
		const gone = g.nodes.find((n) => n.id === 'UC-GONE-999');
		assert.equal(
			gone.state,
			'deprecated',
			'이번 입력에 없는 노드는 deprecated 로 보존',
		);
		assert.equal(
			gone.code_pointers_na,
			undefined,
			'deprecated 노드엔 na stamp ❌ (state!==active 게이트)',
		);
	});
});

// ============================================================================
// F-DF-ANCHOR-002 — analysis evidence → node code_pointers derive
//   RealWorld dogfood 실측 (실 src/main 무앵커 → A2 inert) 기반. analysis 산출물의 evidence 필드
//   (business-rules source_evidence / domain invariants·VO evidence / error-mapping source_file·evidence_file)
//   에서 실 코드 경로를 derive → A2 content-drift 가 production 코드 변경 탐지. existence-gate + 확장자
//   화이트리스트 + dedup + cap. derive→backstop 순서 (Senior REVISE / 정직 불변식). §2 research wf_07929e3d.
// ============================================================================

describe('synthesizeGraph — F-DF-ANCHOR-002 analysis evidence → code_pointers derive', () => {
	const yes = () => true; // 모든 경로 존재 가정 (결정성)

	it('1) business-rules source_evidence[].file → analysis-business-rules 노드 strict_path 앵커 (na 미설정)', () => {
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [
						{
							id: 'BR-1',
							source_evidence: [
								{
									file: 'src/main/java/io/spring/core/user/User.java',
									line: 10,
								},
							],
						},
						{
							id: 'BR-2',
							source_evidence: [
								{
									file: 'src/main/java/io/spring/application/user/UserService.java',
								},
							],
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.ok(Array.isArray(n.code_pointers), 'derive 된 code_pointers 보유');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			[
				'src/main/java/io/spring/core/user/User.java',
				'src/main/java/io/spring/application/user/UserService.java',
			],
		);
		assert.ok(
			n.code_pointers.every((p) => p.anchor_type === 'strict_path'),
			'strict_path',
		);
		assert.equal(
			n.code_pointers_na,
			undefined,
			'derive 성공 → backstop na 미설정 (covered)',
		);
	});

	it('2) domain invariants/value_objects evidence[].file → derive', () => {
		const g = synthesizeGraph({
			analysis: {
				domain: {
					bounded_contexts: [
						{
							id: 'BC-USER',
							name: 'User',
							aggregates: [
								{
									root_entity_id: 'E-USER',
									invariants: [
										{
											description: 'unique',
											evidence: [
												{
													file: 'src/main/java/io/spring/application/article/DuplicatedArticleValidator.java',
													line: 5,
												},
											],
										},
									],
								},
							],
							value_objects: [
								{
									id: 'VO-EMAIL',
									name: 'Email',
									evidence: [
										{ file: 'src/main/java/io/spring/core/user/Email.java' },
									],
								},
							],
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-domain');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			[
				'src/main/java/io/spring/application/article/DuplicatedArticleValidator.java',
				'src/main/java/io/spring/core/user/Email.java',
			],
		);
	});

	it('3) error-mapping exception_handlers.source_file + http_status_mapping.evidence_file → derive', () => {
		const g = synthesizeGraph({
			analysis: {
				'error-mapping-spec': {
					exception_handlers: [
						{
							handler_class: 'H',
							handler_type: 'advice',
							source_file:
								'src/main/java/io/spring/api/exception/CustomizeExceptionHandler.java',
						},
					],
					http_status_mapping: [
						{
							evidence_file:
								'src/main/java/io/spring/api/exception/ResourceNotFoundException.java',
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-error-mapping-spec');
		assert.equal(n.code_pointers.length, 2);
		assert.ok(
			n.code_pointers.some((p) =>
				p.path.endsWith('CustomizeExceptionHandler.java'),
			),
		);
		assert.ok(
			n.code_pointers.some((p) =>
				p.path.endsWith('ResourceNotFoundException.java'),
			),
		);
	});

	it('4) 확장자 화이트리스트 — 테이블명/디렉토리/dotted-class 는 미수집 → na (Senior false-anchor 차단)', () => {
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [
						{ id: 'BR-T', source_evidence: [{ file: 'users' }] }, // 테이블명 (persisted_to 류)
						{
							id: 'BR-D',
							source_evidence: [{ file: 'src/main/java/io/spring/api' }],
						}, // 디렉토리
						{
							id: 'BR-C',
							source_evidence: [{ file: 'io.spring.core.user.User' }],
						}, // dotted class
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.ok(!n.code_pointers, '확장자 외 후보 0개 → code_pointers 미설정');
		assert.equal(n.code_pointers_na, true, '추출0 → backstop na (정직)');
	});

	it('5) existence-gate — 미존재 경로는 emit ❌ → na (정직 불변식)', () => {
		const onlyUser = (p) => p.endsWith('User.java');
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [
						{
							id: 'BR-1',
							source_evidence: [
								{ file: 'src/main/java/io/spring/core/user/User.java' },
							],
						},
						{ id: 'BR-2', source_evidence: [{ file: 'mapper/Gone.xml' }] }, // 미존재 (mapper prefix 류)
					],
				},
			},
			existsFn: onlyUser,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			['src/main/java/io/spring/core/user/User.java'],
		);
		assert.ok(
			!n.code_pointers.some((p) => p.path === 'mapper/Gone.xml'),
			'미존재 경로 emit ❌',
		);
	});

	it('6) dedup — 같은 파일 중복 evidence → 단일 pointer', () => {
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [
						{ id: 'BR-1', source_evidence: [{ file: 'src/main/java/A.java' }] },
						{
							id: 'BR-2',
							source_evidence: [
								{ file: 'src/main/java/A.java' },
								{ file: 'src/main/java/A.java' },
							],
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.equal(n.code_pointers.length, 1);
	});

	it('7) cap — >10 distinct 파일 → 10개로 제한', () => {
		const evid = Array.from({ length: 15 }, (_, i) => ({
			file: `src/main/java/F${i}.java`,
		}));
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [{ id: 'BR-1', source_evidence: evid }],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.equal(n.code_pointers.length, 10, 'ANALYSIS_DERIVE_CAP');
	});

	it('8) commit_hash 전파 — derive strict_path + graph commitHash → pointer 스탬프', () => {
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [
						{ id: 'BR-1', source_evidence: [{ file: 'src/main/java/A.java' }] },
					],
				},
			},
			existsFn: yes,
			commitHash: 'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.equal(
			n.code_pointers[0].commit_hash,
			'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
		);
	});

	it('9) backward-compat 무회귀 — existsFn 미주입 + 합성 cwd 미존재 경로 → derive 0 → na (구 거동 동일)', () => {
		// existsFn 미주입 → default = existsSync(cwd 기준). 합성 fixture 의 synthetic 경로는 cwd 에 부재 → derive 0.
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [
						{
							id: 'BR-1',
							source_evidence: [
								{ file: 'src/main/java/io/spring/NOPE-synthetic-xyz.java' },
							],
						},
					],
				},
			},
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.ok(!n.code_pointers, '미존재 → derive 0');
		assert.equal(n.code_pointers_na, true, 'backstop na = 구 거동 동일');
	});

	it('10) 이미 code_pointers 보유 analysis 노드 → derive no-op', () => {
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					code_pointers: [{ path: 'docs/br.md', anchor_type: 'doc_link' }],
					business_rules: [
						{ id: 'BR-1', source_evidence: [{ file: 'src/main/java/A.java' }] },
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.equal(
			n.code_pointers.length,
			1,
			'기존 code_pointers 보존 (derive 미덮어씀)',
		);
		assert.equal(n.code_pointers[0].anchor_type, 'doc_link');
	});

	it('11) hasCodeExtension — 확장자 판별', () => {
		assert.equal(hasCodeExtension('src/main/java/User.java'), true);
		assert.equal(hasCodeExtension('mapper/X.xml'), true);
		assert.equal(hasCodeExtension('src/main/java/io/spring/api'), false); // dir
		assert.equal(hasCodeExtension('users'), false); // table name
		assert.equal(hasCodeExtension('io.spring.core.User'), false); // dotted class (확장자 .User 비화이트)
		assert.equal(hasCodeExtension(null), false);
		assert.equal(hasCodeExtension('.gitignore'), false); // dotfile (dot<=0)
	});

	it('12) deriveAnalysisCodePointers 직접 호출 — active 외 노드는 skip', () => {
		const nodes = [
			{
				id: 'analysis-business-rules',
				artifact_kind: 'analysis',
				artifact_subkind: 'business-rules',
				state: 'deprecated',
			},
		];
		deriveAnalysisCodePointers(
			nodes,
			{
				'business-rules': {
					business_rules: [
						{ id: 'BR-1', source_evidence: [{ file: 'src/main/java/A.java' }] },
					],
				},
			},
			{ existsFn: yes },
		);
		assert.ok(
			!nodes[0].code_pointers,
			'deprecated 노드 derive skip (active 게이트)',
		);
	});
});

// ============================================================================
// v11.23.0 Slice 2 (C-codepointer-analysis-aspect-enrich) — sql-inventory + architecture
//   sql-inventory: mapper_xml 논리경로 → resource-prefix 역산 strict_path (A2 참여).
//   architecture : modules[].path 디렉토리 → glob anchor (glob 필드 부재 / A2 제외).
//   research wf_8a8aa7ef (Spring PathMatchingResourcePatternResolver / Maven layout / LSP 3.17 / IntelliJ isomorphic).
// ============================================================================
describe('synthesizeGraph — v11.23.0 Slice 2 sql-inventory + architecture code-pointer enrich', () => {
	const yes = () => true;

	it('S2-1) sql-inventory mapper_xml bare → src/main/resources/ prefix 역산 strict_path', () => {
		// bare 'mapper/UserMapper.xml' 는 미존재 / 'src/main/resources/mapper/UserMapper.xml' 만 존재.
		const onlyResource = (p) =>
			p === 'src/main/resources/mapper/UserMapper.xml';
		const g = synthesizeGraph({
			analysis: {
				'sql-inventory': {
					inventory: [
						{
							sql_id: 'UserMapper.findById',
							mapper_xml: 'mapper/UserMapper.xml',
						},
					],
				},
			},
			existsFn: onlyResource,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-sql-inventory');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			['src/main/resources/mapper/UserMapper.xml'],
		);
		assert.ok(
			n.code_pointers.every((p) => p.anchor_type === 'strict_path'),
			'strict_path',
		);
		assert.equal(n.code_pointers_na, undefined, 'derive 성공 → covered');
	});

	it('S2-2) sql-inventory prefix 첫 존재 채택 — bare 존재 시 bare 우선 (결정적 순서)', () => {
		// '' 가 prefixes[0] → bare 가 존재하면 bare 채택 (deterministic tie-break).
		const bareExists = (p) => p === 'mapper/X.xml';
		const g = synthesizeGraph({
			analysis: {
				'sql-inventory': {
					inventory: [{ sql_id: 'q', mapper_xml: 'mapper/X.xml' }],
				},
			},
			existsFn: bareExists,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-sql-inventory');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			['mapper/X.xml'],
		);
	});

	it('S2-3) sql-inventory sentinel(inline/jpa/typeorm) → 미수집 (확장자 없음)', () => {
		const g = synthesizeGraph({
			analysis: {
				'sql-inventory': {
					inventory: [
						{ sql_id: 'a', mapper_xml: 'inline' },
						{ sql_id: 'b', mapper_xml: 'jpa' },
						{ sql_id: 'c', mapper_xml: 'typeorm' },
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-sql-inventory');
		assert.ok(!n.code_pointers, 'sentinel 확장자 없음 → 0 수집');
		assert.equal(n.code_pointers_na, true, 'backstop na');
	});

	it('S2-4) sql-inventory dedup — 같은 mapper_xml 다수 record → 단일 pointer (해소경로 기준)', () => {
		const onlyResource = (p) =>
			p === 'src/main/resources/mapper/UserMapper.xml';
		const g = synthesizeGraph({
			analysis: {
				'sql-inventory': {
					inventory: [
						{ sql_id: 'UserMapper.a', mapper_xml: 'mapper/UserMapper.xml' },
						{ sql_id: 'UserMapper.b', mapper_xml: 'mapper/UserMapper.xml' },
						{ sql_id: 'UserMapper.c', mapper_xml: 'mapper/UserMapper.xml' },
					],
				},
			},
			existsFn: onlyResource,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-sql-inventory');
		assert.equal(n.code_pointers.length, 1, 'dedup 후 1 pointer');
	});

	it('S2-5) sql-inventory strict_path 는 commit_hash 스탬프 (A2 content-drift 참여)', () => {
		const onlyResource = (p) =>
			p === 'src/main/resources/mapper/UserMapper.xml';
		const g = synthesizeGraph({
			analysis: {
				'sql-inventory': {
					inventory: [{ sql_id: 'q', mapper_xml: 'mapper/UserMapper.xml' }],
				},
			},
			existsFn: onlyResource,
			commitHash: 'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
		});
		const n = g.nodes.find((x) => x.id === 'analysis-sql-inventory');
		assert.equal(
			n.code_pointers[0].commit_hash,
			'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
			'A2 baseline 스탬프',
		);
	});

	it('S2-6) architecture modules[].path dir → glob anchor (glob 필드 부재 / 확장자 게이트 우회)', () => {
		const g = synthesizeGraph({
			analysis: {
				architecture: {
					modules: [
						{
							id: 'MOD-API',
							name: 'api',
							path: 'src/main/java/io/spring/api',
							layer: 'presentation',
						},
						{
							id: 'MOD-CORE',
							name: 'core',
							path: 'src/main/java/io/spring/core/user',
							layer: 'domain',
						},
					],
				},
			},
			existsFn: yes, // 디렉토리 존재 가정
		});
		const n = g.nodes.find((x) => x.id === 'analysis-architecture');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			['src/main/java/io/spring/api', 'src/main/java/io/spring/core/user'],
		);
		assert.ok(
			n.code_pointers.every((p) => p.anchor_type === 'glob'),
			'glob anchor',
		);
		assert.ok(
			n.code_pointers.every((p) => p.glob === undefined),
			'glob 필드 부재 (validator existsSync(dir) 매칭)',
		);
		assert.equal(n.code_pointers_na, undefined, 'covered');
	});

	it('S2-7) architecture 미존재 dir → 미수집 → backstop na (existence-gate)', () => {
		const g = synthesizeGraph({
			analysis: {
				architecture: {
					modules: [
						{
							id: 'MOD-X',
							name: 'x',
							path: 'src/main/java/gone',
							layer: 'domain',
						},
					],
				},
			},
			existsFn: () => false,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-architecture');
		assert.ok(!n.code_pointers, '미존재 dir emit ❌');
		assert.equal(n.code_pointers_na, true, 'backstop na (정직)');
	});

	it('S2-8) architecture glob anchor 는 commitHash 지정에도 commit_hash 미스탬프 (A2 제외)', () => {
		const g = synthesizeGraph({
			analysis: {
				architecture: {
					modules: [
						{
							id: 'MOD-API',
							name: 'api',
							path: 'src/main/java/io/spring/api',
							layer: 'presentation',
						},
					],
				},
			},
			existsFn: yes,
			commitHash: 'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
		});
		const n = g.nodes.find((x) => x.id === 'analysis-architecture');
		assert.equal(
			n.code_pointers[0].commit_hash,
			undefined,
			'glob 미스탬프 → A2 dir-diff false-drift 회피',
		);
	});

	it('S2-9) REVISE-B 회귀 — business-rules 는 resource-prefix 미적용 (kind-specific prefix leak 차단)', () => {
		// 'src/main/resources/mapper/X.xml' 만 존재 / bare 'mapper/X.xml' 부재.
		// business-rules prefixes=[''] → bare 만 시도 → 미해소 → na. (sql-inventory 였다면 S2-1 처럼 해소됐을 것.)
		const onlyResource = (p) => p === 'src/main/resources/mapper/X.xml';
		const g = synthesizeGraph({
			analysis: {
				'business-rules': {
					business_rules: [
						{ id: 'BR-1', source_evidence: [{ file: 'mapper/X.xml' }] },
					],
				},
			},
			existsFn: onlyResource,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-business-rules');
		assert.ok(
			!n.code_pointers,
			'business-rules 는 resource-prefix 미적용 → 미해소',
		);
		assert.equal(
			n.code_pointers_na,
			true,
			'na (전역 prefix 기본값 의존 ❌ 입증)',
		);
	});
});

// ============================================================================
// v11.24.0 Slice 3 — antipatterns evidence[].file → code_pointers derive
//   business-rules 동형 (mode:'file' / prefixes:['']). .sql DDL·소스 파일 = A2 content-drift 참여.
// ============================================================================
describe('synthesizeGraph — v11.24.0 Slice 3 antipatterns code-pointer enrich', () => {
	const yes = () => true;

	it('S3-1) antipatterns evidence[].file → analysis-antipatterns strict_path 앵커 (na 미설정)', () => {
		const g = synthesizeGraph({
			analysis: {
				antipatterns: {
					antipatterns: [
						{
							id: 'AP-DB-001',
							evidence: [
								{
									file: 'src/main/resources/db/migration/V1__create_tables.sql',
									line: 27,
								},
							],
						},
						{
							id: 'AP-USER-003',
							evidence: [
								{ file: 'src/main/java/io/spring/core/user/User.java' },
							],
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-antipatterns');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			[
				'src/main/resources/db/migration/V1__create_tables.sql',
				'src/main/java/io/spring/core/user/User.java',
			],
		);
		assert.ok(
			n.code_pointers.every((p) => p.anchor_type === 'strict_path'),
			'strict_path',
		);
		assert.equal(n.code_pointers_na, undefined, 'derive 성공 → covered');
	});

	it('S3-2) antipatterns evidence 없음/file 없음 → na (backstop)', () => {
		const g = synthesizeGraph({
			analysis: {
				antipatterns: {
					antipatterns: [
						{ id: 'AP-X', name: 'no-evidence' }, // evidence 부재
						{ id: 'AP-Y', evidence: [{ line: 5, snippet: 'x' }] }, // file 부재
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-antipatterns');
		assert.ok(!n.code_pointers, '추출 0 → code_pointers 미설정');
		assert.equal(n.code_pointers_na, true, 'backstop na');
	});

	it('S3-3) antipatterns strict_path 는 commit_hash 스탬프 (A2 content-drift 참여 / DDL 변경 탐지)', () => {
		const g = synthesizeGraph({
			analysis: {
				antipatterns: {
					antipatterns: [
						{
							id: 'AP-DB-001',
							evidence: [
								{
									file: 'src/main/resources/db/migration/V1__create_tables.sql',
								},
							],
						},
					],
				},
			},
			existsFn: yes,
			commitHash: 'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
		});
		const n = g.nodes.find((x) => x.id === 'analysis-antipatterns');
		assert.equal(
			n.code_pointers[0].commit_hash,
			'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
			'A2 baseline 스탬프',
		);
	});

	it('S3-4) existence-gate — 미존재 evidence file → emit ❌ → na', () => {
		const g = synthesizeGraph({
			analysis: {
				antipatterns: {
					antipatterns: [
						{
							id: 'AP-GONE',
							evidence: [
								{ file: 'src/main/resources/db/migration/V99__gone.sql' },
							],
						},
					],
				},
			},
			existsFn: () => false,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-antipatterns');
		assert.ok(!n.code_pointers, '미존재 → derive 0');
		assert.equal(n.code_pointers_na, true, 'na (정직)');
	});
});

// ============================================================================
// v11.26.0 Slice 4 (접근 C / carry ③) — db-schema source_files[] → code_pointers derive
//   db-schema = DDL 의 semantic owner. source_files(스키마가 추출된 DDL/migration .sql) → strict_path (A2 참여).
//   business-rules/antipatterns 동형 (mode:'file' / prefixes:['']). erd .mmd = 확장자 게이트 skip.
//   §8.1 정직: RealWorld 단일 도메인에선 antipatterns(Slice 3)와 같은 DDL 앵커 = A2 탐지 겹침 / 독립 가치 = ≥2 도메인 carry.
// ============================================================================
describe('synthesizeGraph — v11.26.0 Slice 4 db-schema source_files code-pointer enrich', () => {
	const yes = () => true;

	it('S4-1) db-schema source_files[] → analysis-db-schema strict_path 앵커 (na 미설정 / 기존 N/A 해소)', () => {
		const g = synthesizeGraph({
			analysis: {
				'db-schema': {
					meta: { title: 'schema' },
					tables: [{ name: 'users', sources: ['migration'] }],
					source_files: [
						'src/main/resources/db/migration/V1__create_tables.sql',
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-db-schema');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			['src/main/resources/db/migration/V1__create_tables.sql'],
		);
		assert.ok(
			n.code_pointers.every((p) => p.anchor_type === 'strict_path'),
			'strict_path',
		);
		assert.equal(n.code_pointers_na, undefined, 'derive 성공 → covered');
	});

	it('S4-2) db-schema source_files 부재 → na (backstop / greenfield·운영DB-only)', () => {
		const g = synthesizeGraph({
			analysis: {
				'db-schema': {
					meta: { title: 'schema' },
					tables: [{ name: 'users', sources: ['operational_db'] }],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-db-schema');
		assert.ok(!n.code_pointers, 'source_files 부재 → 0 수집');
		assert.equal(n.code_pointers_na, true, 'backstop na');
	});

	it('S4-3) db-schema strict_path 는 commit_hash 스탬프 (A2 content-drift 참여 / DDL 변경 탐지)', () => {
		const g = synthesizeGraph({
			analysis: {
				'db-schema': {
					meta: { title: 's' },
					tables: [{ name: 't', sources: ['migration'] }],
					source_files: [
						'src/main/resources/db/migration/V1__create_tables.sql',
					],
				},
			},
			existsFn: yes,
			commitHash: 'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
		});
		const n = g.nodes.find((x) => x.id === 'analysis-db-schema');
		assert.equal(
			n.code_pointers[0].commit_hash,
			'ee17e31aafe733d98c4853c8b9a74d7f2f6c924a',
			'A2 baseline 스탬프',
		);
	});

	it('S4-4) existence-gate — 미존재 DDL → emit ❌ → na (정직 불변식)', () => {
		const g = synthesizeGraph({
			analysis: {
				'db-schema': {
					meta: { title: 's' },
					tables: [{ name: 't', sources: ['migration'] }],
					source_files: ['src/main/resources/db/migration/V99__gone.sql'],
				},
			},
			existsFn: () => false,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-db-schema');
		assert.ok(!n.code_pointers, '미존재 → derive 0');
		assert.equal(n.code_pointers_na, true, 'na (정직)');
	});

	it('S4-5) erd .mmd/.mermaid 는 확장자 게이트 skip (코드 아님 → diagram_files.erd 영역) → na', () => {
		const g = synthesizeGraph({
			analysis: {
				'db-schema': {
					meta: { title: 's' },
					tables: [{ name: 't', sources: ['erd'] }],
					source_files: ['erd.mermaid', 'docs/schema.mmd'],
				},
			}, // 비코드 확장자만
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-db-schema');
		assert.ok(
			!n.code_pointers,
			'.mermaid/.mmd 는 CODE_FILE_EXTENSIONS 외 → 미수집',
		);
		assert.equal(
			n.code_pointers_na,
			true,
			'na (erd 다이어그램은 앵커 대상 아님)',
		);
	});
});

// ============================================================================
// v11.x F-FE-ANCHOR-001 — FE kinds (type-spec/ui-ux/form-validation) source_file → code_pointers derive
//   실 FE 프로젝트(React/TS) dogfood (yurisldk/realworld-react-fsd) 표면화: FE 산출물 source_file 미배선 → na.
//   BE slice 2~4 의 FE 대응. type-spec types[] / ui-ux pages[]+components[] / form-validation validations[].
// ============================================================================
describe('synthesizeGraph — F-FE-ANCHOR-001 FE kinds code-pointer enrich', () => {
	const yes = () => true;

	it('FE-1) type-spec types[].source_file → analysis-type-spec strict_path (na 해소)', () => {
		const g = synthesizeGraph({
			analysis: {
				'type-spec': {
					meta: { title: 't' },
					types: [
						{
							id: 'T-X-001',
							name: 'A',
							kind: 'interface',
							source_file: 'src/shared/api/action-result.ts',
						},
						{
							id: 'T-X-002',
							name: 'B',
							kind: 'type_alias',
							source_file: 'src/pages/login/login.ui.tsx',
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-type-spec');
		assert.deepEqual(n.code_pointers.map((p) => p.path).sort(), [
			'src/pages/login/login.ui.tsx',
			'src/shared/api/action-result.ts',
		]);
		assert.ok(n.code_pointers.every((p) => p.anchor_type === 'strict_path'));
		assert.equal(n.code_pointers_na, undefined);
	});

	it('FE-2) form-validation validations[].source_file → analysis-form-validation-spec strict_path', () => {
		const g = synthesizeGraph({
			analysis: {
				'form-validation-spec': {
					meta: { title: 'f' },
					validations: [
						{
							id: 'F-VAL-X-001',
							field_name: 'email',
							validation_type: 'email',
							source_format: 'zod',
							source_file: 'src/pages/register/actions/user-register.action.ts',
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-form-validation-spec');
		assert.deepEqual(
			n.code_pointers.map((p) => p.path),
			['src/pages/register/actions/user-register.action.ts'],
		);
		assert.equal(n.code_pointers_na, undefined);
	});

	it('FE-3) ui-ux pages[]+components[].source_file 양쪽 → analysis-ui-ux strict_path', () => {
		const g = synthesizeGraph({
			analysis: {
				'ui-ux': {
					meta: { title: 'u' },
					pages: [
						{
							id: 'PAGE-X-001',
							name: 'Login',
							route: '/login',
							source_file: 'src/pages/login/login.ui.tsx',
						},
					],
					components: [
						{
							id: 'CMP-SPIN',
							name: 'Spinner',
							level: 'shared',
							source_file: 'src/shared/ui/spinner/spinner.ui.tsx',
						},
					],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-ui-ux');
		assert.deepEqual(n.code_pointers.map((p) => p.path).sort(), [
			'src/pages/login/login.ui.tsx',
			'src/shared/ui/spinner/spinner.ui.tsx',
		]);
	});

	it('FE-4) source_file 부재 → na (backstop)', () => {
		const g = synthesizeGraph({
			analysis: {
				'type-spec': {
					meta: { title: 't' },
					types: [{ id: 'T-X-001', name: 'A', kind: 'interface' }],
				},
			},
			existsFn: yes,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-type-spec');
		assert.ok(!n.code_pointers);
		assert.equal(n.code_pointers_na, true);
	});

	it('FE-5) existence-gate — 미존재 .tsx → emit X → na', () => {
		const g = synthesizeGraph({
			analysis: {
				'ui-ux': {
					meta: { title: 'u' },
					components: [
						{
							id: 'CMP-GONE',
							name: 'Gone',
							level: 'shared',
							source_file: 'src/shared/ui/gone/gone.ui.tsx',
						},
					],
				},
			},
			existsFn: () => false,
		});
		const n = g.nodes.find((x) => x.id === 'analysis-ui-ux');
		assert.ok(!n.code_pointers);
		assert.equal(n.code_pointers_na, true);
	});

	it('FE-6) FE strict_path 는 commit_hash 스탬프 (A2 content-drift 참여)', () => {
		const g = synthesizeGraph({
			analysis: {
				'type-spec': {
					meta: { title: 't' },
					types: [
						{
							id: 'T-X-001',
							name: 'A',
							kind: 'interface',
							source_file: 'src/shared/api/action-result.ts',
						},
					],
				},
			},
			existsFn: yes,
			commitHash: '969709a379b13935b4e1caae0ad8cad548e5879a',
		});
		const n = g.nodes.find((x) => x.id === 'analysis-type-spec');
		assert.equal(
			n.code_pointers[0].commit_hash,
			'969709a379b13935b4e1caae0ad8cad548e5879a',
		);
	});
});

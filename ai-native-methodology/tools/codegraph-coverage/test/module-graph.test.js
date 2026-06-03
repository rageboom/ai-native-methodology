import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	fileInModule,
	mapFileToModule,
	rollupModuleEdges,
	diffModuleDeps,
	MODULE_EDGE_KINDS,
} from '../src/module-graph.js';
import { buildCoverage } from '../src/coverage.js';
import { toFindings } from '../src/render.js';
import { classifyStack } from '../src/detect.js';

const JAVA_INV = {
	stack: {
		backend: {
			language: 'Java',
			framework: 'Spring Boot',
			orm: [{ name: 'MyBatis' }],
		},
	},
};

// edge 객체 (rollup 은 source.file / target.file 만 사용).
function edge(kind, sf, tf) {
	return { kind, source: { file: sf }, target: { file: tf } };
}
function byKind(edges) {
	const out = {};
	for (const k of MODULE_EDGE_KINDS) out[k] = [];
	for (const e of edges) (out[e.kind] = out[e.kind] || []).push(e);
	return out;
}

describe('fileInModule — src-prefix 정규화 (2-도메인 동일 코드경로)', () => {
	it('RealWorld: 둘 다 repo-relative → startsWith prefix', () => {
		assert.equal(
			fileInModule(
				'src/main/java/io/spring/core/article/Article.java',
				'src/main/java/io/spring/core/article',
			),
			true,
		);
	});
	it('ecommerce: codegraph=src-relative / arch=src-prefix → leading src/ strip', () => {
		assert.equal(fileInModule('auth/auth.service.ts', 'src/auth'), true);
		assert.equal(
			fileInModule('models/user/user.controller.ts', 'src/models/user'),
			true,
		);
	});
	it('prefix-substring false-positive 방지 (src/auth ≠ src/authorization)', () => {
		assert.equal(fileInModule('src/authorization/x.ts', 'src/auth'), false);
		assert.equal(fileInModule('authorization/x.ts', 'src/auth'), false);
	});
	it('미매칭 = false / 빈 입력 graceful', () => {
		assert.equal(fileInModule('other/x.ts', 'src/auth'), false);
		assert.equal(fileInModule('', 'src/auth'), false);
		assert.equal(fileInModule('a/b.ts', ''), false);
	});
});

describe('mapFileToModule — longest path 우선 (most-specific)', () => {
	it('더 깊은 모듈 경로가 우선 매칭', () => {
		const sorted = [
			{ id: 'MOD-DEEP', path: 'src/models/user/admin' },
			{ id: 'MOD-USER', path: 'src/models/user' },
		].sort((a, b) => b.path.length - a.path.length);
		assert.equal(mapFileToModule('models/user/admin/x.ts', sorted), 'MOD-DEEP');
		assert.equal(mapFileToModule('models/user/x.ts', sorted), 'MOD-USER');
		assert.equal(mapFileToModule('models/other/x.ts', sorted), null);
	});
});

describe('rollupModuleEdges — cross-file 집계', () => {
	const modules = [
		{ id: 'MOD-A', path: 'src/a' },
		{ id: 'MOD-B', path: 'src/b' },
	];
	it('cross-file edge 만 module pair 로 집계 + weight 누적 + edge_kinds 수집', () => {
		const edges = byKind([
			edge('calls', 'a/x.ts', 'b/y.ts'),
			edge('references', 'a/x.ts', 'b/z.ts'),
			edge('calls', 'a/p.ts', 'a/q.ts'), // intra-module → skip
		]);
		const { pairs, stats } = rollupModuleEdges(edges, modules);
		assert.equal(pairs.size, 1);
		const rec = pairs.get('MOD-A|MOD-B');
		assert.equal(rec.weight, 2);
		assert.deepEqual([...rec.edge_kinds].sort(), ['calls', 'references']);
		assert.equal(stats.intra_module, 1);
	});
	it('test 파일 기원 edge 제외 (FP 회피 / industry FP#1)', () => {
		const edges = byKind([
			edge('calls', 'a/x.test.ts', 'b/y.ts'),
			edge('calls', 'a/x.ts', 'b/y.spec.ts'),
			edge('calls', 'src/test/java/AFoo.java', 'b/y.ts'),
		]);
		const { pairs, stats } = rollupModuleEdges(edges, modules);
		assert.equal(pairs.size, 0);
		assert.equal(stats.test_skipped, 3);
	});
	it('unmapped (모듈 밖) edge 카운트 / pair 생성 안 함', () => {
		const edges = byKind([edge('calls', 'lib/x.ts', 'b/y.ts')]);
		const { pairs, stats } = rollupModuleEdges(edges, modules);
		assert.equal(pairs.size, 0);
		assert.equal(stats.unmapped, 1);
	});
	it('같은 파일 내 edge (source==target file) 제외', () => {
		const edges = byKind([edge('calls', 'a/x.ts', 'a/x.ts')]);
		const { pairs } = rollupModuleEdges(edges, modules);
		assert.equal(pairs.size, 0);
	});
});

describe('diffModuleDeps — set-diff (holes 안전방향 / informational 격리)', () => {
	const modules = [
		{ id: 'MOD-A', path: 'src/a' },
		{ id: 'MOD-B', path: 'src/b' },
		{ id: 'MOD-C', path: 'src/c' },
	];
	it('codegraph有/arch無 = hole / arch有/codegraph無 = informational / 교집합 = covered', () => {
		const edges = byKind([
			edge('calls', 'a/x.ts', 'b/y.ts'), // MOD-A→MOD-B (arch 에 있음 → covered)
			edge('calls', 'a/x.ts', 'c/z.ts'), // MOD-A→MOD-C (arch 에 없음 → hole)
		]);
		const { pairs } = rollupModuleEdges(edges, modules);
		const dependencies = [
			{ from: 'MOD-A', to: 'MOD-B', type: 'import' }, // corroborated
			{ from: 'MOD-B', to: 'MOD-C', type: 'import' }, // codegraph 미검출 → informational
		];
		const diff = diffModuleDeps(pairs, dependencies);
		assert.equal(diff.total, 2);
		assert.equal(diff.covered, 1);
		assert.equal(diff.holes.length, 1);
		assert.equal(diff.holes[0].from, 'MOD-A');
		assert.equal(diff.holes[0].to, 'MOD-C');
		assert.equal(diff.informational_notes.length, 1);
		assert.equal(diff.informational_notes[0].from, 'MOD-B');
		assert.equal(diff.informational_notes[0].to, 'MOD-C');
	});
	it('informational_notes 레코드에 severity 필드 부재 (구조적 절단)', () => {
		const { pairs } = rollupModuleEdges(byKind([]), modules);
		const diff = diffModuleDeps(pairs, [{ from: 'MOD-A', to: 'MOD-B' }]);
		assert.equal(diff.informational_notes.length, 1);
		assert.equal(
			'severity' in diff.informational_notes[0],
			false,
			'informational_notes 는 severity 를 절대 갖지 않음',
		);
	});
});

describe('buildCoverage — module axis', () => {
	const detect = classifyStack(JAVA_INV);
	const modules = [
		{ id: 'MOD-A', path: 'src/a' },
		{ id: 'MOD-B', path: 'src/b' },
		{ id: 'MOD-C', path: 'src/c' },
	];
	const moduleEdgesByKind = byKind([
		edge('calls', 'a/x.ts', 'b/y.ts'),
		edge('calls', 'a/x.ts', 'c/z.ts'),
	]);
	it('arch.json modules[] 존재 → module axis detectable + holes + informational', () => {
		const arch = {
			modules,
			dependencies: [
				{ from: 'MOD-A', to: 'MOD-B' },
				{ from: 'MOD-C', to: 'MOD-A' },
			],
		};
		const cov = buildCoverage({
			refs: {
				paths: new Set(),
				files: [],
				symbols: new Set(),
				operationIds: new Set(),
				sources: [],
			},
			detect,
			axes: ['module'],
			moduleEdgesByKind,
			arch,
		});
		assert.equal(cov.axes.module.detectable, true);
		assert.equal(cov.axes.module.total, 2);
		assert.equal(cov.axes.module.covered, 1); // MOD-A→MOD-B
		assert.equal(cov.axes.module.holes.length, 1); // MOD-A→MOD-C
		assert.equal(cov.axes.module.informational_notes.length, 1); // MOD-C→MOD-A (codegraph 미검출)
		assert.equal(cov.stats.module_holes, 1);
		assert.equal(cov.stats.module_informational, 1);
	});
	it('arch.json modules[] 부재 → unverified note (hole 폭증 회피 / method-axis 동형)', () => {
		const cov = buildCoverage({
			refs: {
				paths: new Set(),
				files: [],
				symbols: new Set(),
				operationIds: new Set(),
				sources: [],
			},
			detect,
			axes: ['module'],
			moduleEdgesByKind,
			arch: null,
		});
		assert.equal(cov.axes.module, undefined);
		const u = cov.undetectable.find((x) => x.axis === 'module');
		assert.equal(u.state, 'unverified');
	});
	it('codegraph edges 미열거 → undetectable note', () => {
		const arch = { modules, dependencies: [] };
		const cov = buildCoverage({
			refs: {
				paths: new Set(),
				files: [],
				symbols: new Set(),
				operationIds: new Set(),
				sources: [],
			},
			detect,
			axes: ['module'],
			moduleEdgesByKind: null,
			arch,
		});
		assert.equal(cov.axes.module, undefined);
		const u = cov.undetectable.find((x) => x.axis === 'module');
		assert.equal(u.state, 'undetectable');
	});
});

describe('toFindings — module holes → finding (informational 구조적 절단 / Senior must-fix#3)', () => {
	const detect = classifyStack(JAVA_INV);
	const modules = [
		{ id: 'MOD-A', path: 'src/a' },
		{ id: 'MOD-B', path: 'src/b' },
		{ id: 'MOD-C', path: 'src/c' },
	];
	const moduleEdgesByKind = byKind([edge('calls', 'a/x.ts', 'c/z.ts')]); // MOD-A→MOD-C hole
	const arch = { modules, dependencies: [{ from: 'MOD-B', to: 'MOD-C' }] }; // MOD-B→MOD-C = informational (codegraph 미검출)
	const cov = buildCoverage({
		refs: {
			paths: new Set(),
			files: [],
			symbols: new Set(),
			operationIds: new Set(),
			sources: [],
		},
		detect,
		axes: ['module'],
		moduleEdgesByKind,
		arch,
	});

	it('module hole → finding (axis=module / severity=low / code_graph_ref kind=module_dependency)', () => {
		const findings = toFindings(cov);
		const mod = findings.filter((f) => f.axis === 'module');
		assert.equal(mod.length, 1);
		assert.equal(mod[0].severity, 'low');
		assert.ok(['low', 'medium'].includes(mod[0].severity), 'ceiling 준수');
		assert.equal(mod[0].code_graph_ref.kind, 'module_dependency');
		assert.equal(mod[0].code_graph_ref.symbol, 'MOD-A → MOD-C');
	});
	it('informational_notes(MOD-B→MOD-C) 는 finding 으로 절대 변환 안 됨 (holes-only 순회)', () => {
		const findings = toFindings(cov);
		const leaked = findings.filter(
			(f) => f.message && f.message.includes('MOD-B → MOD-C'),
		);
		assert.equal(
			leaked.length,
			0,
			'onlyArch(codegraph 사각)는 finding 채널 진입 절대 ❌',
		);
		// informational pair 가 어떤 finding code_graph_ref symbol 에도 등장 안 함
		const refLeak = findings.filter(
			(f) => f.code_graph_ref && f.code_graph_ref.symbol === 'MOD-B → MOD-C',
		);
		assert.equal(refLeak.length, 0);
	});
});

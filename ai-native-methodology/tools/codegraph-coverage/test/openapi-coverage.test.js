import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	extractOpenapiOps,
	stripBasePath,
	buildVerbDiff,
	buildControllerAnchor,
	buildAuthGrounding,
	buildOpenapiCoverage,
	toOpenapiFindings,
	renderOpenapiCoverageMarkdown,
} from '../src/openapi-coverage.js';
import { SEVERITY_CEILING } from '../src/render.js';

// ── 픽스처 (실 codegraph 노드 형태 부분집합 / poc-01·02 실측 패턴 반영).
const ROUTE_NODES = [
	{ name: 'POST /api/users', kind: 'route', filePath: 'api/UserController.java' },
	{
		name: 'POST /api/users/login',
		kind: 'route',
		filePath: 'api/UserController.java',
	},
	{ name: 'GET /api/user', kind: 'route', filePath: 'api/UserController.java' },
	// degenerate (codegraph path 미합성) — informational 격리 대상.
	{ name: 'POST /', kind: 'route', filePath: 'api/OrphanController.java' },
	// 코드有 계약無 — 진짜 hole.
	{
		name: 'GET /api/internal/metrics',
		kind: 'route',
		filePath: 'api/InternalController.java',
	},
];
const OPENAPI_YAML = `openapi: 3.1.0
info:
  title: T
servers:
  - url: http://localhost:8080/api
paths:
  /users:
    post:
      operationId: CreateUser
  /users/login:
    post:
      operationId: Login
  /user:
    get:
      operationId: GetCurrentUser
  # 계약有 코드無 (codegraph route 부재):
  /legacy/export:
    get:
      operationId: LegacyExport
`;

const SYMBOL_NODES = {
	class: [
		{
			name: 'UserController',
			kind: 'class',
			qualified_name: 'io.app.api::UserController',
			filePath: 'api/UserController.java',
		},
	],
	method: [
		{
			name: 'signup',
			kind: 'method',
			qualified_name: 'io.app.api::UserController::signup',
			filePath: 'api/UserController.java',
		},
		{
			name: 'login',
			kind: 'method',
			qualified_name: 'io.app.api::UserController::login',
			filePath: 'api/UserController.java',
		},
	],
};
const INDEXED_FILES = ['api/UserController.java'];

describe('extractOpenapiOps — paths/verb/operationId + servers basePath (무의존성 라인 추출)', () => {
	const { basePath, ops, parsed } = extractOpenapiOps(OPENAPI_YAML);
	it('parsed', () => assert.equal(parsed, true));
	it('servers basePath = /api', () => assert.equal(basePath, '/api'));
	it('4 operation (verb+path+operationId)', () => {
		assert.equal(ops.length, 4);
		assert.deepEqual(
			ops.map((o) => `${o.verb} ${o.path}`).sort(),
			['GET /legacy/export', 'GET /user', 'POST /users', 'POST /users/login'],
		);
	});
	it('operationId 추출', () => {
		const login = ops.find((o) => o.path === '/users/login');
		assert.equal(login.operation_id, 'Login');
	});
	it('빈 입력 = parsed:false / ops 0', () => {
		assert.deepEqual(extractOpenapiOps(''), {
			basePath: '',
			ops: [],
			parsed: false,
		});
	});
});

describe('stripBasePath — basePath prefix 흡수', () => {
	it('/api/users → /users', () =>
		assert.equal(stripBasePath('/api/users', '/api'), '/users'));
	it('정확히 basePath = / (degenerate)', () =>
		assert.equal(stripBasePath('/api', '/api'), '/'));
	it('prefix 불일치 = 무변경', () =>
		assert.equal(stripBasePath('/users', '/api'), '/users'));
	it('basePath 빈값 = 무변경', () =>
		assert.equal(stripBasePath('/users', ''), '/users'));
});

describe('buildVerbDiff — code↔contract 양방향 set-diff', () => {
	const { ops } = extractOpenapiOps(OPENAPI_YAML);
	const vd = buildVerbDiff({
		routeNodes: ROUTE_NODES,
		openapiOps: ops,
		basePath: '/api',
	});
	it('state verified', () => assert.equal(vd.state, 'verified'));
	it('matched = 3 (users/login·user, basePath strip)', () =>
		assert.equal(vd.matched, 3));
	it('code有계약無 = GET /api/internal/metrics', () => {
		assert.equal(vd.code_not_in_spec.length, 1);
		assert.equal(vd.code_not_in_spec[0].normalized_path, '/internal/metrics');
	});
	it('계약有코드無 = GET /legacy/export', () => {
		assert.equal(vd.spec_not_in_code.length, 1);
		assert.equal(vd.spec_not_in_code[0].operation_id, 'LegacyExport');
	});
	it('degenerate POST / → informational (코드有계약無 아님 / false-positive 회피)', () => {
		assert.ok(vd.informational_notes.some((n) => n.path === '/'));
		assert.ok(!vd.code_not_in_spec.some((h) => h.normalized_path === '/'));
	});
	it('route 0 = unverified (Stripes/non-MVC / false-health 회피)', () => {
		const u = buildVerbDiff({ routeNodes: [], openapiOps: ops, basePath: '/api' });
		assert.equal(u.state, 'unverified');
		assert.match(u.reason, /route 노드 0/);
	});
});

describe('buildControllerAnchor — extracted_from.controller_method ∖ codegraph 심볼 (역방향 / 3-state)', () => {
	// live arm — bare method (byName) + class.method (byQn2).
	const liveOps = [
		{
			operation_id: 'CreateUser',
			extracted_from: {
				controller_class: 'UserController',
				controller_method: 'signup',
				controller_file: 'api/UserController.java',
			},
		},
		{
			operation_id: 'Login',
			extracted_from: { controller_method: 'login' },
		},
	];
	it('live — 실존 심볼 (real-symbol probe true-positive)', () => {
		const ca = buildControllerAnchor({
			extOperations: liveOps,
			symbolNodesByKind: SYMBOL_NODES,
			indexedFiles: INDEXED_FILES,
		});
		assert.equal(ca.state, 'verified');
		assert.equal(ca.live, 2);
		assert.equal(ca.stale, 0);
	});
	it('stale — 비실존 심볼 + 인덱싱된 file (real-symbol probe true-negative)', () => {
		const ca = buildControllerAnchor({
			extOperations: [
				{
					operation_id: 'Ghost',
					extracted_from: {
						controller_class: 'UserController',
						controller_method: 'deletedHandler',
						controller_file: 'api/UserController.java',
					},
				},
			],
			symbolNodesByKind: SYMBOL_NODES,
			indexedFiles: INDEXED_FILES,
		});
		assert.equal(ca.stale, 1);
		assert.equal(ca.informational, 0);
	});
	it('informational — file 미인덱스 = codegraph 사각 (부재≠stale / interface-vs-impl)', () => {
		const ca = buildControllerAnchor({
			extOperations: [
				{
					operation_id: 'IfaceOp',
					extracted_from: {
						controller_class: 'UserApi',
						controller_method: 'someApiMethod',
						controller_file: 'api/UserApi.java', // 미인덱스
					},
				},
			],
			symbolNodesByKind: SYMBOL_NODES,
			indexedFiles: INDEXED_FILES,
		});
		assert.equal(ca.informational, 1);
		assert.equal(ca.stale, 0);
	});
	it('controller_method 0 = unverified', () => {
		const ca = buildControllerAnchor({
			extOperations: [{ operation_id: 'NoCtrl' }],
			symbolNodesByKind: SYMBOL_NODES,
			indexedFiles: INDEXED_FILES,
		});
		assert.equal(ca.state, 'unverified');
	});
});

describe('buildAuthGrounding — reading-aid (finding 미산출 / @PreAuthorize 내용 검증 ❌)', () => {
	const extOps = [
		{
			operation_id: 'CreateUser',
			auth_required: true,
			extracted_from: { controller_method: 'signup' },
		},
		{
			operation_id: 'PublicOp',
			auth_required: false,
			extracted_from: { controller_method: 'pub' },
		},
		{
			operation_id: 'AdminOp',
			permission_expression: "hasRole('ADMIN')",
			extracted_from: { controller_method: 'admin' },
		},
	];
	const ca = {
		state: 'verified',
		live_anchors: [{ symbol: 'signup', artifact: 'openapi:CreateUser' }],
		stale_anchors: [{ symbol: 'admin', artifact: 'openapi:AdminOp' }],
		informational_notes: [],
	};
	const ag = buildAuthGrounding({ extOperations: extOps, controllerAnchor: ca });
	it('auth 보유 op 만 (2) / public 제외', () => {
		assert.equal(ag.auth_bearing_ops.length, 2);
		assert.ok(!ag.auth_bearing_ops.some((o) => o.operation_id === 'PublicOp'));
	});
	it('anchor_state join (live/stale)', () => {
		const cu = ag.auth_bearing_ops.find((o) => o.operation_id === 'CreateUser');
		const ad = ag.auth_bearing_ops.find((o) => o.operation_id === 'AdminOp');
		assert.equal(cu.anchor_state, 'live');
		assert.equal(ad.anchor_state, 'stale');
	});
	it('note = reading-aid / finding 미산출 명시', () =>
		assert.match(ag.note, /reading-aid/));
});

describe('toOpenapiFindings — severity ceiling + informational 절대 미순회', () => {
	const { ops } = extractOpenapiOps(OPENAPI_YAML);
	const cov = buildOpenapiCoverage({
		routeNodes: ROUTE_NODES,
		openapiOps: ops,
		basePath: '/api',
		extOperations: [
			{
				operation_id: 'Ghost',
				extracted_from: {
					controller_class: 'UserController',
					controller_method: 'deletedHandler',
					controller_file: 'api/UserController.java',
				},
			},
		],
		symbolNodesByKind: SYMBOL_NODES,
		indexedFiles: INDEXED_FILES,
	});
	const findings = toOpenapiFindings(cov, '/p/.codegraph/codegraph.db');
	it('code有계약無 = medium', () => {
		const f = findings.find((x) => x.message.includes('계약無'));
		assert.equal(f.severity, 'medium');
	});
	it('계약有코드無 = low', () => {
		const f = findings.find((x) => x.message.includes('계약有'));
		assert.equal(f.severity, 'low');
	});
	it('controller stale = medium + axis controller_anchor', () => {
		const f = findings.find((x) => x.axis === 'controller_anchor');
		assert.equal(f.severity, 'medium');
		assert.equal(f.code_graph_ref.kind, 'controller_method');
	});
	it('모든 finding severity ⊆ {low,medium} (gate leak 차단)', () => {
		for (const f of findings) assert.ok(SEVERITY_CEILING.includes(f.severity));
		assert.equal(findings.some((f) => /high|critical/.test(f.severity)), false);
	});
	it('finding id = F-CGAPI-NNN', () => {
		for (const f of findings) assert.match(f.id, /^F-CGAPI-\d{3}$/);
	});
	it('informational(degenerate POST /) 은 finding 에 절대 진입 ❌', () => {
		assert.ok(!findings.some((f) => f.code_graph_ref?.symbol === 'POST /'));
	});
});

describe('renderOpenapiCoverageMarkdown — reference-lens 라벨 + not-a-defect 마커', () => {
	const { ops } = extractOpenapiOps(OPENAPI_YAML);
	const cov = buildOpenapiCoverage({
		routeNodes: ROUTE_NODES,
		openapiOps: ops,
		basePath: '/api',
		extOperations: [],
		symbolNodesByKind: SYMBOL_NODES,
		indexedFiles: INDEXED_FILES,
	});
	const md = renderOpenapiCoverageMarkdown({
		target: '/p',
		stack: { language: 'java' },
		codegraph: { freshness: { available: false } },
		openapi_coverage: { openapi_file: 'openapi.yaml', ...cov },
	});
	it('reference-lens 라벨', () => assert.match(md, /reference-lens/));
	it('not a defect / 부재 마커 (codegraph 사각 정직)', () =>
		assert.match(md, /not a defect|부재/));
	it('상위 차단등급 리터럴 0 (gate leak 차단 / 본문)', () =>
		assert.equal(/\b(high|critical)\b/.test(md), false));
});

// finding-export.test.js — codegraph wiring STEP 2 (DEC §5 STEP 2 / finding 채널).
//   coverage-hole → finding-system promote-ready 레코드 + handler-set reading-aid + 스키마 conditional ceiling(실 Ajv).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
	toPromoteReadyFindings,
	buildHandlerSet,
	renderPromoteFindingsMarkdown,
} from '../src/finding-export.js';
import { SEVERITY_CEILING } from '../src/render.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const SCHEMA = join(REPO, 'schemas', 'finding-system.schema.json');
const VALIDATOR = join(REPO, 'tools', 'schema-validator', 'src', 'cli.js');

function makeReport(findings) {
	return {
		meta: { generated_at: '2026-06-04T00:00:00.000Z' },
		target: '/proj',
		codegraph: { db_path: '/proj/.codegraph/codegraph.db' },
		findings,
	};
}

describe('toPromoteReadyFindings — coverage-hole → finding-system promote-ready', () => {
	const report = makeReport([
		{
			id: 'F-CGCOV-001',
			axis: 'route',
			severity: 'medium',
			message: 'route GET /x coverage-hole',
			evidence: ['src/x.java'],
			code_graph_ref: { kind: 'route', symbol: 'GET /x', file: 'src/x.java' },
		},
		{
			id: 'F-CGCOV-002',
			axis: 'method',
			severity: 'low',
			message: 'method A.b coverage-hole',
			evidence: ['src/a.ts'],
			code_graph_ref: { kind: 'method', symbol: 'A.b', file: 'src/a.ts' },
		},
	]);
	const recs = toPromoteReadyFindings(report);

	it('discoverer = codegraph (자유텍스트 관례값 / enum 격상 ❌)', () => {
		assert.ok(recs.every((r) => r.discoverer === 'codegraph'));
	});

	it('finding_id 미부여 (decision c — 사람이 promote 시 F-XXX 배정) + seed_id 추적', () => {
		assert.ok(
			recs.every((r) => !('finding_id' in r)),
			'finding_id 절대 자동 부여 ❌',
		);
		assert.deepEqual(
			recs.map((r) => r.seed_id),
			['F-CGCOV-001', 'F-CGCOV-002'],
		);
		assert.ok(recs.every((r) => r.status === 'candidate'));
	});

	it('phase 파생 — route→api / method→quality (finding-system enum 정합)', () => {
		assert.equal(recs[0].phase, 'api');
		assert.equal(recs[1].phase, 'quality');
	});

	it('code_graph_ref 보존 + db_path 주입 (report.codegraph.db_path)', () => {
		assert.equal(recs[0].code_graph_ref.kind, 'route');
		assert.equal(
			recs[0].code_graph_ref.db_path,
			'/proj/.codegraph/codegraph.db',
		);
		assert.equal(recs[1].code_graph_ref.symbol, 'A.b');
	});

	it('evidence_files 매핑 + discovered_at(date) 파생', () => {
		assert.deepEqual(recs[0].evidence_files, [{ path: 'src/x.java' }]);
		assert.equal(recs[0].discovered_at, '2026-06-04');
	});

	it('severity ceiling 강제 — high finding 은 throw (pinSeverity / gate leak 차단)', () => {
		const bad = makeReport([
			{
				id: 'F-CGCOV-009',
				axis: 'route',
				severity: 'high',
				message: 'm',
				code_graph_ref: { kind: 'route' },
			},
		]);
		assert.throws(() => toPromoteReadyFindings(bad), /ceiling/);
	});

	it('severity 는 ceiling 내 (low|medium) 만', () => {
		assert.ok(recs.every((r) => SEVERITY_CEILING.includes(r.severity)));
	});

	it('findings 0 → 빈 배열 (graceful)', () => {
		assert.deepEqual(toPromoteReadyFindings(makeReport([])), []);
		assert.deepEqual(toPromoteReadyFindings({}), []);
	});
});

describe('buildHandlerSet — implements/extends reading-aid', () => {
	const edgesByKind = {
		implements: [
			{
				kind: 'implements',
				source: {
					name: 'JwtExceptionHandler',
					qualified_name: 'JwtExceptionHandler',
					file: 'common/handlers/jwt.handler.ts',
				},
				target: { name: 'ExceptionHandler' },
			},
			{
				kind: 'implements',
				source: {
					name: 'MyBatisUserRepository',
					qualified_name: 'repo::MyBatisUserRepository',
					file: 'src/repo/x.java',
				},
				target: { name: 'UserRepository' },
			},
		],
		extends: [
			{
				kind: 'extends',
				source: {
					name: 'InvalidPasswordException',
					qualified_name: 'InvalidPasswordException',
					file: 'auth/x.exception.ts',
				},
				target: { name: 'AuthServiceInputException' },
			},
			// test-base noise — 필터되어야 함
			{
				kind: 'extends',
				source: {
					name: 'ArticleApiTest',
					file: 'src/test/ArticleApiTest.java',
				},
				target: { name: 'TestWithCurrentUser' },
			},
		],
	};
	const hs = buildHandlerSet(edgesByKind);

	it('test-base noise 필터 (ArticleApiTest extends TestWithCurrentUser 제외)', () => {
		assert.equal(hs.extends.length, 1);
		assert.equal(hs.extends[0].source, 'InvalidPasswordException');
	});

	it('handler-relevant 태깅 (Exception/Handler 만)', () => {
		const jwt = hs.implements.find((e) => e.target === 'ExceptionHandler');
		const repo = hs.implements.find((e) => e.target === 'UserRepository');
		assert.equal(jwt.handler_relevant, true);
		assert.equal(
			repo.handler_relevant,
			false,
			'Repository implements 는 handler 아님',
		);
		assert.equal(
			hs.handler_relevant_count,
			2,
			'JwtExceptionHandler + InvalidPasswordException',
		);
	});

	it('channel = reading-aid + 1-도메인 정직표기 note', () => {
		assert.equal(hs.channel, 'reading-aid');
		assert.match(hs.note, /ecommerce/);
		assert.match(hs.note, /reading-aid/);
	});

	it('빈 edges → graceful 빈 리스트', () => {
		const e = buildHandlerSet({});
		assert.deepEqual(e.implements, []);
		assert.deepEqual(e.extends, []);
	});
});

describe('renderPromoteFindingsMarkdown — display-only', () => {
	it('seed_id + discoverer + trust 라벨 포함 / finding_id 노출 ❌', () => {
		const report = makeReport([
			{
				id: 'F-CGCOV-001',
				axis: 'route',
				severity: 'medium',
				message: 'm',
				evidence: [],
				code_graph_ref: { kind: 'route', symbol: 'GET /x' },
			},
		]);
		const md = renderPromoteFindingsMarkdown(
			toPromoteReadyFindings(report),
			buildHandlerSet({}),
			report,
		);
		assert.match(md, /F-CGCOV-001/);
		assert.match(md, /discoverer: `codegraph`/);
		assert.match(md, /reference-lens/);
		assert.match(md, /finding_id 미부여/); // finding_id 는 사람 promote 시 배정 — markdown 은 그 사실만 명시 (값 노출 ❌)
		assert.doesNotMatch(md, /finding_id:\s*F-/); // 실제 finding_id 값 부여 ❌
	});
});

// no-simulation — 실 schema-validator(Ajv) 로 conditional severity ceiling 검증 (code_graph_ref ⟹ severity ⊆ {low,medium}).
describe('finding-system.schema.json conditional ceiling (실 Ajv / 회귀 0)', () => {
	function validate(obj) {
		const dir = mkdtempSync(join(tmpdir(), 'cgstep2-'));
		const fp = join(dir, 'f.json');
		writeFileSync(fp, JSON.stringify(obj));
		const r = spawnSync('node', [VALIDATOR, fp, '--schema', SCHEMA, '--json'], {
			encoding: 'utf-8',
		});
		rmSync(dir, { recursive: true, force: true });
		const out = JSON.parse(r.stdout);
		return out.results[0].valid;
	}
	const base = {
		finding_id: 'F-200',
		phase: 'quality',
		discovered_at: '2026-06-04',
		discoverer: 'codegraph',
		description: 'd',
		spec_gap: 'g',
		decision_made: 'm',
	};

	it('code_graph_ref + severity:medium → valid', () => {
		assert.equal(
			validate({
				...base,
				severity: 'medium',
				code_graph_ref: { kind: 'method', symbol: 'X.y' },
			}),
			true,
		);
	});
	it('code_graph_ref + severity:high → INVALID (conditional ceiling 발동)', () => {
		assert.equal(
			validate({
				...base,
				severity: 'high',
				code_graph_ref: { kind: 'method', symbol: 'X.y' },
			}),
			false,
		);
	});
	it('code_graph_ref 부재 + severity:high → valid (기존 finding 회귀 0)', () => {
		assert.equal(
			validate({ ...base, discoverer: 'sub-agent', severity: 'high' }),
			true,
		);
	});
});

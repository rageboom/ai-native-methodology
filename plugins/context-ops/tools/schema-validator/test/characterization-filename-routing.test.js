// characterization-filename-routing.test.js — F-C4-characterization-02 회귀 가드.
//   schema-validator 는 $schema_ref/$schema 키 부재 시 파일명으로 schema 를 추론한다 (inferSchemaName / cli.js).
//   bare 'characterization.json' → base 'characterization' → FILENAME_ALIASES 미등록 → 'characterization.schema.json'
//   (존재하지 않음) 으로 라우팅 → schema_status:'not-found' / valid:null = silent SKIP (false-green, deliverable 미검증).
//   canonical 'characterization-spec.json' → 'characterization-spec.schema.json' (존재) → 실제 검증 → valid:true.
//   본 테스트는 (a) bare 이름이 자동 라우팅되지 않음을 명시 (consumer 는 rename 의무 / SKILL 파일명 가드)
//   (b) canonical 이름이 정상 검증됨을 GREEN 으로 증명한다. cli.js 에 alias 추가 ❌ (옵션 B = rename, not alias).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

function runCli(target) {
	const r = spawnSync('node', [CLI, target, '--json'], { encoding: 'utf-8' });
	return JSON.parse(r.stdout);
}

// 최소 embedded characterization-spec 내용 ($schema 키 없음 → 파일명 추론 경로로 진입).
const validCharacterizationSpec = {
	meta_confidence: {
		generated_at: '2026-06-17T00:00:00Z',
		confidence: 0.9,
		inputs_used: ['source_code', 'test_code'],
	},
	snapshots: [
		{
			snapshot_id: 'SNAP-UC-USER-LOGIN-001',
			use_case: 'UC-USER-LOGIN-001',
			endpoint: 'POST /api/login',
			scenarios: [
				{
					id: 'SCN-LOGIN-001',
					name: 'valid credentials → JWT',
					given: { request_body: { email: 'a@b.com', password: 'pw' } },
					when: 'POST /api/login → AuthService.login',
					then: { expected_response: { status: 200 } },
					intent_classification: [{ rule: 'BR-AUTH-LOGIN-001', type: 'intent' }],
				},
			],
		},
	],
	intent_vs_bug: {
		br_total: 1,
		br_intent: 1,
		br_ambiguous: 0,
		ap_total: 0,
		ap_ambiguous: 0,
		named_classified_ratio: 1.0,
	},
	coverage: {
		matrix: [{ uc: 'UC-USER-LOGIN-001', snapshot: '✅' }],
		coverage_target: 0.8,
		coverage_strategy: 'absolute',
	},
};

test('F-C4-02 RED — bare characterization.json 은 자동 라우팅 ❌ (silent skip / not-found / valid:null)', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sv-charname-'));
	try {
		// 의도적으로 bare 이름 사용 (consumer 가 실수로 emit 했던 이름).
		const f = join(dir, 'characterization.json');
		writeFileSync(f, JSON.stringify(validCharacterizationSpec, null, 2));
		const out = runCli(f);
		const res = out.results[0];
		// 회귀 가드: bare 이름은 존재하지 않는 characterization.schema.json 으로 라우팅 → SKIP.
		assert.equal(
			res.schema,
			'characterization.schema.json',
			'bare 이름은 characterization.schema.json 으로 라우팅 (alias 없음)',
		);
		assert.equal(res.schema_status, 'not-found', 'schema 미발견 (silent skip)');
		assert.equal(res.valid, null, 'valid:null — 검증 안 됨 (false-green 위험 / consumer rename 의무)');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('F-C4-02 GREEN — canonical characterization-spec.json 은 characterization-spec.schema.json 으로 라우팅 → valid:true', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sv-charname-'));
	try {
		const f = join(dir, 'characterization-spec.json');
		writeFileSync(f, JSON.stringify(validCharacterizationSpec, null, 2));
		const out = runCli(f);
		const res = out.results[0];
		assert.equal(
			res.schema,
			'characterization-spec.schema.json',
			'canonical 이름은 characterization-spec.schema.json 으로 라우팅',
		);
		assert.notEqual(res.schema_status, 'not-found', 'schema 발견됨 (실제 검증 수행)');
		assert.equal(res.valid, true, `valid:true (errors=${JSON.stringify(res.errors)})`);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

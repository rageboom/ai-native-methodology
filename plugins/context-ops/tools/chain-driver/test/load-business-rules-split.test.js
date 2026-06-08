// load-business-rules-split.test.js — BR-split STEP 3 (산출물 분할 / v0.24.0).
//   loadBusinessRules 의 index(`{bc_files}`) 감지 + per-BC sibling 재조립 + backward-compat 검증.
//   _shared 는 자체 test 패키지가 없어 소비자(chain-driver)에 둠.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	loadBusinessRules,
	isBusinessRulesIndex,
	normalizeBusinessRules,
} from '../../_shared/load-business-rules.js';

let root;
before(() => {
	root = mkdtempSync(join(tmpdir(), 'br-split-'));
	mkdirSync(join(root, 'business-rules'), { recursive: true });
	// index — bc_files 2개 (BC-AUTH 1 rule + BC-USER 2 rules), 의도적 비알파벳 순서로 재조립 순서 검증
	writeFileSync(
		join(root, 'business-rules.json'),
		JSON.stringify({
			$schema_ref: 'schemas/business-rules-index.schema.json',
			bc_files: [
				{ bounded_context: 'BC-USER', file: 'business-rules/BC-USER.json', rule_count: 2, rule_ids: ['BR-USER-A-001', 'BR-USER-B-002'] },
				{ bounded_context: 'BC-AUTH', file: 'business-rules/BC-AUTH.json', rule_count: 1, rule_ids: ['BR-AUTH-LOGIN-001'] },
			],
			total_rules: 3,
		}),
	);
	writeFileSync(
		join(root, 'business-rules', 'BC-USER.json'),
		JSON.stringify({
			bounded_context: 'BC-USER',
			business_rules: [
				{ id: 'BR-USER-A-001', bounded_context: 'BC-USER', title: 't', natural_language: 'n' },
				{ id: 'BR-USER-B-002', bounded_context: 'BC-USER', title: 't', natural_language: 'n' },
			],
		}),
	);
	writeFileSync(
		join(root, 'business-rules', 'BC-AUTH.json'),
		JSON.stringify({
			bounded_context: 'BC-AUTH',
			business_rules: [
				{ id: 'BR-AUTH-LOGIN-001', bounded_context: 'BC-AUTH', title: 't', natural_language: 'n' },
			],
		}),
	);
	// 옛 단일파일 (backward-compat)
	writeFileSync(
		join(root, 'legacy.json'),
		JSON.stringify({ business_rules: [{ id: 'BR-OLD-X-001', bounded_context: 'BC-OLD' }] }),
	);
});
after(() => rmSync(root, { recursive: true, force: true }));

describe('BR-split STEP 3 — loadBusinessRules index 재조립', () => {
	test('isBusinessRulesIndex — bc_files 보유 = index / business_rules = 아님', () => {
		assert.equal(isBusinessRulesIndex({ bc_files: [] }), true);
		assert.equal(isBusinessRulesIndex({ business_rules: [] }), false);
		assert.equal(isBusinessRulesIndex(null), false);
	});

	test('index → per-BC sibling 전수 재조립 (bc_files 선언 순서대로)', () => {
		const all = loadBusinessRules(join(root, 'business-rules.json'));
		assert.deepEqual(
			all.map((r) => r.id),
			['BR-USER-A-001', 'BR-USER-B-002', 'BR-AUTH-LOGIN-001'],
		);
	});

	test('디렉토리 target → canonical 파일명 resolve 후 재조립', () => {
		assert.equal(loadBusinessRules(root).length, 3);
	});

	test('bcFilter — scope 슬라이스 (재조립 후 필터)', () => {
		const userOnly = loadBusinessRules(join(root, 'business-rules.json'), {
			bcFilter: (r) => r.bounded_context === 'BC-USER',
		});
		assert.deepEqual(userOnly.map((r) => r.id), ['BR-USER-A-001', 'BR-USER-B-002']);
		assert.equal(
			loadBusinessRules(join(root, 'business-rules.json'), {
				bcFilter: (r) => r.bounded_context === 'BC-NONE',
			}).length,
			0,
		);
	});

	test('옛 단일파일 backward-compat (분할 전 시점기록 보존)', () => {
		assert.deepEqual(
			loadBusinessRules(join(root, 'legacy.json')).map((r) => r.id),
			['BR-OLD-X-001'],
		);
	});

	test('per-BC blob 부재 = 그 BC skip (부분 로드 / 날조 ❌)', () => {
		const partRoot = mkdtempSync(join(tmpdir(), 'br-part-'));
		mkdirSync(join(partRoot, 'business-rules'), { recursive: true });
		writeFileSync(
			join(partRoot, 'business-rules.json'),
			JSON.stringify({
				bc_files: [
					{ bounded_context: 'BC-A', file: 'business-rules/BC-A.json', rule_count: 1, rule_ids: ['BR-A-X-001'] },
					{ bounded_context: 'BC-MISSING', file: 'business-rules/BC-MISSING.json', rule_count: 1, rule_ids: ['BR-M-X-001'] },
				],
				total_rules: 2,
			}),
		);
		writeFileSync(
			join(partRoot, 'business-rules', 'BC-A.json'),
			JSON.stringify({ bounded_context: 'BC-A', business_rules: [{ id: 'BR-A-X-001', bounded_context: 'BC-A' }] }),
		);
		// BC-MISSING.json 미작성 → skip
		const rules = loadBusinessRules(join(partRoot, 'business-rules.json'));
		assert.deepEqual(rules.map((r) => r.id), ['BR-A-X-001']);
		rmSync(partRoot, { recursive: true, force: true });
	});

	test('normalizeBusinessRules(index) = [] (strict canonical 불변 / sync.js diff wrapper 가 재조립 주입)', () => {
		// index 객체엔 business_rules 키 부재 → strict normalize 는 [] (회귀 가드: graph-synthesizer:280 등 이미-파싱 소비점은 wrapper 경유)
		assert.deepEqual(normalizeBusinessRules({ bc_files: [{ file: 'x' }] }), []);
	});
});

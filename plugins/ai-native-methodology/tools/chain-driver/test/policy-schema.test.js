// policy-schema.test.js
// operation.md Verification "추가 골든 테스트" — propagation-policy.json schema validation.
// 실 policy 파일이 propagation-policy.schema.json 을 만족하는지 ajv 로 검증 (project schema-validator 와 동일 엔진).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..', '..', '..');
const policy = JSON.parse(
	readFileSync(join(REPO, 'policies', 'propagation-policy.json'), 'utf-8'),
);
const schema = JSON.parse(
	readFileSync(
		join(REPO, 'policies', 'propagation-policy.schema.json'),
		'utf-8',
	),
);

function makeValidator() {
	// schema-validator 와 동일 — Ajv2020 (draft 2020-12 meta-schema) + ajv-formats
	const ajv = new Ajv2020({
		allErrors: true,
		strict: false,
		allowUnionTypes: true,
	});
	addFormats(ajv);
	return ajv.compile(schema);
}

describe('propagation-policy schema validation (operation.md Verification)', () => {
	it('실 propagation-policy.json 이 schema 를 만족', () => {
		const validate = makeValidator();
		const ok = validate(policy);
		assert.ok(
			ok,
			`policy schema violation: ${JSON.stringify(validate.errors, null, 2)}`,
		);
	});

	it('change_tier_matrix 4 변경 종류 모두 존재', () => {
		for (const kind of ['typo', 'item_add', 'item_remove', 'semantic_change']) {
			assert.ok(policy.change_tier_matrix[kind], `missing tier row: ${kind}`);
		}
	});

	it('각 tier_row 가 4 chain 인접 단계 모두 정의', () => {
		for (const [kind, row] of Object.entries(policy.change_tier_matrix)) {
			if (kind.startsWith('_')) continue;
			for (const step of ['UC_to_BHV', 'BHV_to_AC', 'AC_to_TC', 'TC_to_IMPL']) {
				assert.ok(
					['auto', 'propose', 'manual'].includes(row[step]),
					`${kind}.${step} invalid`,
				);
			}
		}
	});

	it('code_pointer_anchor_rules 4 anchor_type 모두 정의', () => {
		for (const at of ['strict_path', 'glob', 'ast_symbol', 'doc_link']) {
			const rule = policy.code_pointer_anchor_rules[at];
			assert.ok(rule, `missing anchor rule: ${at}`);
			assert.ok(['auto', 'propose', 'manual'].includes(rule.path_only_patch));
			assert.ok(['auto', 'propose', 'manual'].includes(rule.symbol_change));
		}
	});

	it('ast_symbol 은 양쪽 모두 manual (operation.md 결정 5 — 심볼 식별 의미 변경 가능성)', () => {
		assert.equal(
			policy.code_pointer_anchor_rules.ast_symbol.path_only_patch,
			'manual',
		);
		assert.equal(
			policy.code_pointer_anchor_rules.ast_symbol.symbol_change,
			'manual',
		);
	});

	it('auto_cascade 는 dry_run 기본 (operation.md 결정 5 — Phase 3 topological 도입 후에만 활성)', () => {
		assert.equal(policy.auto_cascade.enabled, false);
		assert.equal(policy.auto_cascade.dry_run, true);
	});

	it('잘못된 decision 값 주입 시 schema 가 reject', () => {
		const validate = makeValidator();
		const bad = JSON.parse(JSON.stringify(policy));
		bad.change_tier_matrix.typo.UC_to_BHV = 'YOLO';
		assert.equal(validate(bad), false, 'invalid decision 은 reject 돼야 함');
	});

	it('schema 가 additionalProperties 미정의 키 reject', () => {
		const validate = makeValidator();
		const bad = JSON.parse(JSON.stringify(policy));
		bad.unexpected_top_level = 1;
		assert.equal(validate(bad), false);
	});
});

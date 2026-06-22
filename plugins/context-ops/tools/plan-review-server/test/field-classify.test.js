import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	classifyLeaf,
	collectEnums,
	buildFieldModel,
	parsePath,
	getByPath,
	setByPath,
	ID_VALUE_RE,
} from '../src/field-classify.js';

// 실 task-plan.schema.json 의 핵심 형태를 축약 모사한 fixture schema.
const SCHEMA = {
	type: 'object',
	properties: {
		tasks: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'string' },
					title: { type: 'string' },
					description: { type: 'string' },
					ac_refs: { type: 'array', items: { type: 'string' } },
					behavior_ref: { type: 'string' },
					execution_order: { type: 'integer' },
					layer: { enum: ['domain', 'application', 'be', 'fe', 'db'] },
				},
			},
		},
		adrs: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					status: { enum: ['proposed', 'accepted', 'deprecated', 'superseded'] },
					decision: { type: 'string' },
				},
			},
		},
		risks: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					severity: { enum: ['low', 'medium', 'high', 'critical'] },
					mitigation: { type: 'string' },
					task_refs: { type: 'array', items: { type: 'string' } },
				},
			},
		},
	},
};

// 실 poc-14 task-plan 의 한 task + adr + risk 발췌.
const PLAN = {
	meta: { generated_at: '2026-05-26T10:15:00Z', confidence: 0.85 },
	derivation_source: { behavior_spec_path: '.ai-context/output/behavior-spec.json' },
	tasks: [
		{
			id: 'TASK-USER-FSIM-001',
			title: 'Signup — email unique + password 검증',
			description: 'POST /users 진입 …',
			ac_refs: ['AC-USER-FSIM-001'],
			behavior_ref: 'BHV-USER-FSIM-001',
			execution_order: 1,
			layer: 'application',
		},
	],
	adrs: [{ status: 'accepted', decision: 'argon2id 채택' }],
	risks: [
		{
			severity: 'high',
			mitigation: 'argon2id + DB encryption',
			task_refs: ['TASK-USER-FSIM-001'],
		},
	],
};

test('collectEnums — schema enum property 수집 (layer/status/severity)', () => {
	const enums = collectEnums(SCHEMA);
	assert.deepEqual(enums.get('layer'), ['domain', 'application', 'be', 'fe', 'db']);
	assert.deepEqual(enums.get('status'), [
		'proposed',
		'accepted',
		'deprecated',
		'superseded',
	]);
	assert.deepEqual(enums.get('severity'), ['low', 'medium', 'high', 'critical']);
	assert.equal(enums.has('title'), false);
});

test('ID_VALUE_RE — 산출물 ID 값만 매칭', () => {
	assert.ok(ID_VALUE_RE.test('TASK-USER-FSIM-001'));
	assert.ok(ID_VALUE_RE.test('AC-USER-FSIM-001'));
	assert.ok(ID_VALUE_RE.test('BHV-USER-FSIM-001'));
	assert.equal(ID_VALUE_RE.test('argon2id 채택'), false);
	assert.equal(ID_VALUE_RE.test('application'), false);
});

test('classifyLeaf — ① 자유텍스트', () => {
	const enums = collectEnums(SCHEMA);
	assert.deepEqual(classifyLeaf({ key: 'title', value: 'x', topSection: 'tasks', enums }), {
		kind: 'text',
		expensive: false,
		locked: false,
	});
	assert.deepEqual(
		classifyLeaf({ key: 'mitigation', value: 'argon2', topSection: 'risks', enums }),
		{ kind: 'text', expensive: false, locked: false },
	);
});

test('classifyLeaf — ② enum (layer 만 expensive)', () => {
	const enums = collectEnums(SCHEMA);
	const layer = classifyLeaf({ key: 'layer', value: 'application', topSection: 'tasks', enums });
	assert.equal(layer.kind, 'enum');
	assert.equal(layer.expensive, true); // if/then 유발
	const status = classifyLeaf({ key: 'status', value: 'accepted', topSection: 'adrs', enums });
	assert.equal(status.kind, 'enum');
	assert.equal(status.expensive, false);
});

test('classifyLeaf — ③ link (id / *_ref(s) / execution_order / ID-값)', () => {
	const enums = collectEnums(SCHEMA);
	for (const [key, value] of [
		['id', 'TASK-USER-FSIM-001'],
		['ac_refs', 'AC-USER-FSIM-001'],
		['behavior_ref', 'BHV-USER-FSIM-001'],
		['execution_order', 1],
		['task_refs', 'TASK-USER-FSIM-001'],
		['dependencies', 'TASK-X'],
	]) {
		const c = classifyLeaf({ key, value, topSection: 'tasks', enums });
		assert.equal(c.kind, 'link', `${key} → link`);
		assert.equal(c.expensive, true, `${key} → expensive`);
	}
});

test('classifyLeaf — locked: 기계 소유(구조·추적링크·외부ID·계약·provenance)는 잠금 / 내용은 열림', () => {
	const enums = collectEnums(SCHEMA);
	const cl = (key, value, top = 'tasks') => classifyLeaf({ key, value, topSection: top, enums });
	// B 구조·순서·의존 = locked
	assert.equal(cl('id', 'TASK-X-001').locked, true);
	assert.equal(cl('dependencies', 'TASK-X').locked, true);
	assert.equal(cl('execution_order', 1).locked, true);
	// C 추적 ref = locked (industry_case_refs URL 예외는 열림)
	assert.equal(cl('ac_refs', 'AC-X-001').locked, true);
	assert.equal(cl('behavior_ref', 'BHV-X-001').locked, true);
	assert.equal(cl('task_refs', 'TASK-X-001').locked, true);
	assert.equal(cl('adr_ref', 'ADR-X-001').locked, true);
	assert.equal(cl('industry_case_refs', 'https://x').locked, false, 'URL 사례출처 = 열림');
	// C cross_links.to_* = locked
	assert.equal(cl('to_behavior_spec', 'BHV-X', 'cross_links').locked, true);
	// D 외부 ID = locked
	assert.equal(cl('jira_id', 'PROJ-10').locked, true);
	assert.equal(cl('op_task_id', 'OP-1').locked, true);
	assert.equal(cl('sp_id', 'SP_X').locked, true);
	// 계약 바인딩 = locked
	assert.equal(cl('path', '/api/x').locked, true);
	assert.equal(cl('operationId', 'doX').locked, true);
	assert.equal(cl('method', 'post').locked, true);
	// A provenance = locked
	assert.equal(cl('confidence', 0.85, 'meta').locked, true);
	// 내용(text + 설계 enum) = 열림
	assert.equal(cl('title', 'x').locked, false);
	assert.equal(cl('description', 'x').locked, false);
	assert.equal(cl('mitigation', 'x', 'risks').locked, false);
	assert.equal(cl('severity', 'high', 'risks').locked, false);
	assert.equal(cl('layer', 'be').locked, false);
});

test('classifyLeaf — readonly (meta/derivation_source)', () => {
	const enums = collectEnums(SCHEMA);
	assert.equal(
		classifyLeaf({ key: 'confidence', value: 0.85, topSection: 'meta', enums }).kind,
		'readonly',
	);
	assert.equal(
		classifyLeaf({
			key: 'behavior_spec_path',
			value: '.ai-context/output/behavior-spec.json',
			topSection: 'derivation_source',
			enums,
		}).kind,
		'readonly',
	);
});

test('buildFieldModel — 실 plan 발췌를 leaf descriptor 로 분해', () => {
	const { leaves } = buildFieldModel(PLAN, SCHEMA);
	const byPath = Object.fromEntries(leaves.map((l) => [l.path, l]));

	// ① text
	assert.equal(byPath['tasks[0].title'].kind, 'text');
	assert.equal(byPath['adrs[0].decision'].kind, 'text');
	assert.equal(byPath['risks[0].mitigation'].kind, 'text');

	// ② enum
	assert.equal(byPath['tasks[0].layer'].kind, 'enum');
	assert.equal(byPath['tasks[0].layer'].expensive, true);
	assert.equal(byPath['adrs[0].status'].kind, 'enum');
	assert.equal(byPath['risks[0].severity'].kind, 'enum');

	// ③ link
	assert.equal(byPath['tasks[0].id'].kind, 'link');
	assert.equal(byPath['tasks[0].ac_refs[0]'].kind, 'link');
	assert.equal(byPath['tasks[0].behavior_ref'].kind, 'link');
	assert.equal(byPath['tasks[0].execution_order'].kind, 'link');
	assert.equal(byPath['risks[0].task_refs[0]'].kind, 'link');

	// readonly
	assert.equal(byPath['meta.confidence'].kind, 'readonly');
	assert.equal(byPath['derivation_source.behavior_spec_path'].kind, 'readonly');
});

test('path 유틸 — parse/get/set 왕복', () => {
	assert.deepEqual(parsePath('tasks[0].ac_refs[1]'), ['tasks', 0, 'ac_refs', 1]);
	const obj = structuredClone(PLAN);
	assert.equal(getByPath(obj, 'tasks[0].title'), 'Signup — email unique + password 검증');
	setByPath(obj, 'tasks[0].title', '변경됨');
	assert.equal(obj.tasks[0].title, '변경됨');
	setByPath(obj, 'tasks[0].ac_refs[0]', 'AC-USER-FSIM-999');
	assert.equal(obj.tasks[0].ac_refs[0], 'AC-USER-FSIM-999');
});

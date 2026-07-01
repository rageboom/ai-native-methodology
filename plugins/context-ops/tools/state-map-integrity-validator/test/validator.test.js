import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateStateMap } from '../src/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
	JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8'));
const findRule = (r, rule) => r.findings.filter((f) => f.rule === rule);

test('clean — passed=true, high 0, medium 0', () => {
	const r = validateStateMap(fixture('clean.json'));
	assert.equal(r.passed, true);
	assert.equal(r.summary.high, 0);
	assert.equal(r.summary.medium, 0);
	assert.equal(r.machine_count, 1);
});

test('broken-target (THE 갭) — 미정의 transition target 이 high 로 검출', () => {
	const r = validateStateMap(fixture('broken-target.json'));
	assert.equal(r.passed, false);
	assert.equal(r.summary.high, 1);
	assert.equal(r.summary.medium, 0, '정의된 state 는 모두 도달 가능');
	const f = findRule(r, 'transition_target_undefined');
	assert.equal(f.length, 1);
	assert.equal(f[0].ref, 'validatingX');
	assert.equal(f[0].from_state, 'idle');
	assert.equal(f[0].event, 'SUBMIT');
});

test('missing-initial — initial ∉ states 가 high, 도달성 검사 skip', () => {
	const r = validateStateMap(fixture('missing-initial.json'));
	assert.equal(r.passed, false);
	assert.equal(r.summary.high, 1);
	assert.equal(r.summary.medium, 0, 'initial 무효 시 reachability skip');
	assert.equal(findRule(r, 'initial_undefined')[0].ref, 'bootX');
});

test('unreachable — high 0 (게이트 통과) + medium advisory 로 dead state 표면화', () => {
	const r = validateStateMap(fixture('unreachable.json'));
	assert.equal(r.passed, true, 'reachability 는 non-gating');
	assert.equal(r.summary.high, 0);
	assert.ok(r.summary.medium >= 1);
	const f = findRule(r, 'state_unreachable');
	assert.ok(f.some((x) => x.ref === 'orphanState'));
});

test('refs-bad — final/child/parallel/history 미정의 참조 4종 모두 high', () => {
	const r = validateStateMap(fixture('refs-bad.json'));
	assert.equal(r.passed, false);
	assert.equal(r.summary.high, 4);
	assert.equal(findRule(r, 'final_state_undefined').length, 1);
	assert.equal(findRule(r, 'child_state_undefined').length, 1);
	assert.equal(findRule(r, 'parallel_region_undefined').length, 1);
	assert.equal(findRule(r, 'history_default_target_undefined').length, 1);
	assert.equal(r.summary.medium, 0, '정의된 root/regionA 는 도달 가능');
});

test('N/A — machines [] → passed=true, 0 findings', () => {
	const r = validateStateMap({ machines: [] });
	assert.equal(r.passed, true);
	assert.equal(r.machine_count, 0);
	assert.equal(r.findings.length, 0);
});

test('N/A — machines 부재(old state_machines[] / BE) → passed=true', () => {
	assert.equal(validateStateMap({ state_machines: [{}] }).passed, true);
	assert.equal(validateStateMap({}).passed, true);
});

test('입력 방어 — null / 잘못된 states 타입에도 crash 안 함', () => {
	assert.equal(validateStateMap(null).passed, true);
	assert.equal(
		validateStateMap({ machines: [{ id: 'M', initial: 'a', states: null }] })
			.passed,
		true,
	);
	assert.equal(
		validateStateMap({ machines: [null, 42, 'x'] }).passed,
		true,
		'비객체 머신 원소 skip',
	);
});

test('target 없는 internal transition(actions-only) 은 미검출', () => {
	const r = validateStateMap({
		machines: [
			{
				id: 'M',
				initial: 'a',
				states: {
					a: { on: { NOTE: { actions: ['log()'] }, GO: 'b' } },
					b: {},
				},
			},
		],
	});
	assert.equal(r.summary.high, 0);
	assert.equal(r.passed, true);
});

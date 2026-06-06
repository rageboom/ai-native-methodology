// s2-outcome-check.test.js — S2 per-TC outcome reconciliation (v11.11.0 / C-use-scenario-s2-gate).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileOutcomes, correlateByTcId } from '../src/s2-outcome-check.js';

describe('reconcileOutcomes (S2 characterization GREEN + augmentation RED)', () => {
	const cases = [
		{
			id: 'TC-CAR-001',
			test_intent: 'characterization',
			expected_outcome: 'pass',
		},
		{
			id: 'TC-CAR-002',
			test_intent: 'characterization',
			expected_outcome: 'pass',
		},
		{ id: 'TC-CAR-010', test_intent: 'augmentation', expected_outcome: 'fail' },
	];

	it('정상 S2: characterization pass + augmentation fail → outcome_mismatches=0', () => {
		const actual = {
			'TC-CAR-001': 'pass',
			'TC-CAR-002': 'pass',
			'TC-CAR-010': 'fail',
		};
		const r = reconcileOutcomes(cases, actual);
		assert.equal(r.outcome_mismatches, 0);
		assert.equal(r.evaluated, 3);
		assert.equal(r.missing_actual, 0);
	});

	it('characterization 이 fail (기존 동작 깨짐) → mismatch', () => {
		const actual = {
			'TC-CAR-001': 'fail',
			'TC-CAR-002': 'pass',
			'TC-CAR-010': 'fail',
		};
		const r = reconcileOutcomes(cases, actual);
		assert.equal(r.outcome_mismatches, 1);
		assert.ok(
			r.details.find((d) => d.tc_id === 'TC-CAR-001' && d.match === false),
		);
	});

	it('augmentation 이 pass (impl 부재 RED 기대인데 GREEN) → mismatch', () => {
		const actual = {
			'TC-CAR-001': 'pass',
			'TC-CAR-002': 'pass',
			'TC-CAR-010': 'pass',
		};
		const r = reconcileOutcomes(cases, actual);
		assert.equal(r.outcome_mismatches, 1);
		assert.ok(
			r.details.find((d) => d.tc_id === 'TC-CAR-010' && d.match === false),
		);
	});

	it('실 결과 없는 TC → missing_actual (mismatch 아님 / 정직 표기)', () => {
		const actual = { 'TC-CAR-001': 'pass' }; // 002, 010 누락
		const r = reconcileOutcomes(cases, actual);
		assert.equal(r.missing_actual, 2);
		assert.equal(r.outcome_mismatches, 0);
		assert.equal(r.evaluated, 1);
	});

	it('expected_outcome 미선언 TC → 판정 대상 제외 (skip)', () => {
		const mixed = [
			{ id: 'TC-X-001', expected_outcome: 'pass' },
			{ id: 'TC-X-002' }, // expected_outcome 없음
			{ id: 'TC-X-003', expected_outcome: 'invalid' }, // enum 외
		];
		const r = reconcileOutcomes(mixed, {
			'TC-X-001': 'pass',
			'TC-X-002': 'fail',
			'TC-X-003': 'fail',
		});
		assert.equal(r.details.length, 1);
		assert.equal(r.details[0].tc_id, 'TC-X-001');
	});

	it('빈/undefined 입력 → 안전 (0)', () => {
		assert.equal(reconcileOutcomes().outcome_mismatches, 0);
		assert.equal(reconcileOutcomes([], {}).evaluated, 0);
	});
});

describe('correlateByTcId (test-name → TC-id 상관 규약)', () => {
	const cases = [{ id: 'TC-CAR-001' }, { id: 'TC-CAR-010' }];

	it('test-name 안에 TC-id substring 포함 → 매핑', () => {
		const results = [
			{ name: 'CarListTest > TC-CAR-001 returns active cars', status: 'pass' },
			{ name: 'CarListTest > TC-CAR-010 supports new filter', status: 'fail' },
		];
		const m = correlateByTcId(results, cases);
		assert.equal(m['TC-CAR-001'], 'pass');
		assert.equal(m['TC-CAR-010'], 'fail');
	});

	it('같은 TC-id 가 여러 test → 하나라도 fail 이면 fail (보수적)', () => {
		const results = [
			{ name: 'TC-CAR-001 case a', status: 'pass' },
			{ name: 'TC-CAR-001 case b', status: 'fail' },
		];
		assert.equal(correlateByTcId(results, cases)['TC-CAR-001'], 'fail');
	});

	it('매칭 test 없음 → 키 부재 (reconcile 에서 missing_actual 로 흐름)', () => {
		const m = correlateByTcId(
			[{ name: 'unrelated test', status: 'pass' }],
			cases,
		);
		assert.equal('TC-CAR-001' in m, false);
	});

	it('전부 skip → 키 부재', () => {
		const m = correlateByTcId(
			[{ name: 'TC-CAR-001 x', status: 'skip' }],
			cases,
		);
		assert.equal('TC-CAR-001' in m, false);
	});

	// S2 RealWorld 2차 dogfood 보강 — JUnit XML name 이 메서드명(언더스코어 / 하이픈 불가)인 경우도 상관.
	it('언더스코어 메서드명(tc_CAR_001_...) → 정규화로 TC-CAR-001 상관 (Java 메서드명 하이픈 불가 현실)', () => {
		const results = [
			{ name: 'tc_CAR_001_returnsActiveCars()', status: 'pass' },
			{ name: 'tc_CAR_010_supportsNewFilter()', status: 'fail' },
		];
		const m = correlateByTcId(results, cases);
		assert.equal(m['TC-CAR-001'], 'pass');
		assert.equal(m['TC-CAR-010'], 'fail');
	});

	it('하이픈 @DisplayName("TC-CAR-001 — ...") → 정규화 후에도 상관 유지 (회귀 차단)', () => {
		const results = [
			{ name: 'TC-CAR-001 — 활성 차량 목록 반환', status: 'pass' },
		];
		assert.equal(correlateByTcId(results, cases)['TC-CAR-001'], 'pass');
	});
});

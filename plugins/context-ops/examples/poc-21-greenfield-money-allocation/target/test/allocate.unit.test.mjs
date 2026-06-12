// allocate.unit.test.mjs — UNIT-ALLOCATE-001 (designed_from_spec / test-first).
//   ★ 본 파일은 src/allocate.mjs 구현보다 먼저 작성됨. RED 단계에서 src 는 throw stub = 전부 FAIL.
//   GREEN 단계에서 동일 test 셋 불변, impl 만 채워 PASS (i-strict test-파일-불변 / result_hash 전이가 designed_from_spec 결정론 증거).
//   formal-spec invariant INV-1~4 (BR-ALLOC-CONSERVATION-001~004) 를 검증.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { allocate } from '../src/allocate.mjs';

// INV-1 보존 (BR-ALLOC-CONSERVATION-001) — 합 = amount
test('INV-1 conservation: sum(allocate) === amount', () => {
	for (const [amount, ratios] of [[100, [1, 1, 1]], [5, [3, 7]], [0, [1, 1]], [1, [1, 1, 1, 1]], [9999, [2, 3, 5]]]) {
		const r = allocate(amount, ratios);
		assert.equal(r.reduce((a, b) => a + b, 0), amount, `sum must equal ${amount}`);
	}
});

// INV-2 잔돈 앞쪽 우선 (BR-ALLOC-REMAINDER-002)
test('INV-2 remainder to front buckets first', () => {
	assert.deepEqual(allocate(100, [1, 1, 1]), [34, 33, 33]);
	assert.deepEqual(allocate(5, [3, 7]), [2, 3]);
});

// INV-4 비례 floor + 잔돈 0 (BR-ALLOC-PROPORTION-004)
test('INV-4 proportional floor, no remainder', () => {
	assert.deepEqual(allocate(100, [1, 1, 1, 1]), [25, 25, 25, 25]);
	assert.deepEqual(allocate(0, [1, 1]), [0, 0]);
});

// INV-3 입력 검증 (BR-ALLOC-VALIDATION-003)
test('INV-3 rejects negative amount', () => {
	assert.throws(() => allocate(-1, [1]), RangeError);
});
test('INV-3 rejects non-integer amount', () => {
	assert.throws(() => allocate(1.5, [1]), RangeError);
});
test('INV-3 rejects empty ratios', () => {
	assert.throws(() => allocate(10, []), RangeError);
});
test('INV-3 rejects non-positive ratio', () => {
	assert.throws(() => allocate(10, [1, -2]), RangeError);
	assert.throws(() => allocate(10, [1, 0]), RangeError);
});

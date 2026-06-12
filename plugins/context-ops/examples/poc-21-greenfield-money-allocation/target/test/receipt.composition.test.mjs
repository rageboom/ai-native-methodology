// receipt.composition.test.mjs — allocateReceipt 조합 테스트 (test_layer=composition).
//   ★ 3 협력자(UNIT-ALLOC-001·UNIT-FORMAT-001·UNIT-RECEIPT-DTO-001)를 DI 로 mock/stub.
//   mock-soundness 계약: mock 된 협력자 중 required(ALLOC·FORMAT)는 자기 unit TC 로 핀돼야 sound / waived(DTO)는 면제.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { allocateReceipt } from '../src/receipt.mjs';

test('allocateReceipt: 협력자(allocate·formatMoney·makeReceiptLine) mock 조합', () => {
	const allocate = () => [60, 40]; // mock UNIT-ALLOC-001 (행위 검증)
	const formatMoney = (c) => `$${c}`; // mock UNIT-FORMAT-001
	const makeReceiptLine = (label, money) => ({ label, money }); // stub UNIT-RECEIPT-DTO-001 (waived)
	const r = allocateReceipt(100, [3, 2], ['A', 'B'], { allocate, formatMoney, makeReceiptLine });
	assert.deepEqual(r, [
		{ label: 'A', money: '$60' },
		{ label: 'B', money: '$40' },
	]);
});

test('allocateReceipt: 실 협력자(no mock) 통합 — 합 보존 + 포맷', () => {
	const r = allocateReceipt(100, [1, 1, 1], ['x', 'y', 'z']);
	assert.deepEqual(r.map((l) => l.money), ['$0.34', '$0.33', '$0.33']);
});

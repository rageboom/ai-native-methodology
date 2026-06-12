// formatMoney.unit.test.mjs — UNIT-FORMAT-001 격리 유닛테스트 (test_layer=unit).
//   ★ 본 파일 추가 = mock-soundness RED→GREEN 의 GREEN(UNIT-FORMAT-001 핀). 부재 시 composition 의 formatMoney mock = unsound.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { formatMoney } from '../src/formatMoney.mjs';

test('formatMoney: dollars.cents 포맷', () => {
	assert.equal(formatMoney(123), '$1.23');
	assert.equal(formatMoney(5), '$0.05');
	assert.equal(formatMoney(0), '$0.00');
	assert.equal(formatMoney(10000), '$100.00');
});
test('formatMoney: 음수 부호', () => {
	assert.equal(formatMoney(-150), '-$1.50');
});
test('formatMoney: 정수 아니면 RangeError', () => {
	assert.throws(() => formatMoney(1.5), RangeError);
});

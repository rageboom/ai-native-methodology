// receipt.mjs — composition layer (allocateReceipt). UNIT 아님 — 빌딩블록(allocate·formatMoney·makeReceiptLine)을 조합.
//   협력자는 DI(deps)로 주입 가능 → composition 테스트가 mock/stub 주입(test double).
import { allocate as realAllocate } from './allocate.mjs';
import { formatMoney as realFormatMoney } from './formatMoney.mjs';
import { makeReceiptLine as realMakeReceiptLine } from './receiptLine.mjs';

export function allocateReceipt(amount, ratios, labels = [], deps = {}) {
	const allocate = deps.allocate ?? realAllocate;
	const formatMoney = deps.formatMoney ?? realFormatMoney;
	const makeReceiptLine = deps.makeReceiptLine ?? realMakeReceiptLine;
	const amounts = allocate(amount, ratios);
	return amounts.map((cents, i) =>
		makeReceiptLine(labels[i] ?? `bucket ${i}`, formatMoney(cents)),
	);
}

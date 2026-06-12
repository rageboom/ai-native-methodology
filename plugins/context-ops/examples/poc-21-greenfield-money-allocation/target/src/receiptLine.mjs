// receiptLine.mjs — UNIT-RECEIPT-DTO-001 (designed_from_spec / waived).
//   순수 데이터 홀더 — 분기 로직 0 (label+money 묶음). unit_test_obligation=waived (waiver: pure data holder / no branch logic).
//   mock-soundness 에서 waived = mock 건전성 면제(동작 주장 ❌).
export function makeReceiptLine(label, money) {
	return { label, money };
}

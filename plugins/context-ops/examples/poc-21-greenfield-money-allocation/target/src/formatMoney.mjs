// formatMoney.mjs — UNIT-FORMAT-001 (designed_from_spec / collaborator).
//   정수 cents → 표시 문자열 "$D.CC". 분기 로직(부호/패딩) 보유 → unit_test_obligation=required.
export function formatMoney(cents) {
	if (!Number.isInteger(cents)) {
		throw new RangeError('cents must be an integer');
	}
	const sign = cents < 0 ? '-' : '';
	const abs = Math.abs(cents);
	return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

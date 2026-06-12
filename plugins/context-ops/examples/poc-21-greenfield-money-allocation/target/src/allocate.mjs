// allocate.mjs — UNIT-ALLOCATE-001 (money allocation / Fowler Money).
//   provenance=designed_from_spec — formal-spec.invariants(INV-1~4 / BR-ALLOC-CONSERVATION-001~004)로부터 설계·구현.
//   GREEN: 동일 test 셋(불변) 통과. RED→GREEN 전이 = impl 만 채움(i-strict test-파일-불변).

/**
 * 정수 amount(cents)를 ratios 비율로 분배한 정수 배열 반환.
 * INV-1 보존: sum(result) === amount. INV-2 잔돈 앞쪽 우선.
 * INV-3 입력검증(RangeError). INV-4 비례 floor.
 */
export function allocate(amount, ratios) {
	// INV-3 입력 검증 (BR-ALLOC-VALIDATION-003)
	if (!Number.isInteger(amount) || amount < 0) {
		throw new RangeError('amount must be a non-negative integer (cents)');
	}
	if (!Array.isArray(ratios) || ratios.length === 0) {
		throw new RangeError('ratios must be a non-empty array');
	}
	if (ratios.some((r) => !Number.isInteger(r) || r <= 0)) {
		throw new RangeError('ratios must all be positive integers');
	}

	const total = ratios.reduce((a, b) => a + b, 0);
	// INV-4 비례 floor (BR-ALLOC-PROPORTION-004)
	const result = ratios.map((r) => Math.floor((amount * r) / total));
	// INV-2 잔돈을 앞쪽 버킷부터 1씩 (BR-ALLOC-REMAINDER-002) — remainder < ratios.length 보장
	let remainder = amount - result.reduce((a, b) => a + b, 0);
	for (let i = 0; remainder > 0; i = (i + 1) % result.length, remainder--) {
		result[i] += 1;
	}
	// INV-1 보존 (BR-ALLOC-CONSERVATION-001) — 위 분배로 sum(result) === amount
	return result;
}

# PRD — Money Allocation (통화 분할)

> greenfield 입력(코드 없음 / 기획문서). use-scenario = **greenfield**. 코드-고고학 N/A.
> 본 PRD 가 chain 의 spec source — 여기서 formal-spec.invariants 를 설계하고, 코드는 implement 단계 전까지 **존재하지 않는다**(designed_from_spec).

## 배경

결제·정산에서 금액을 비율로 나눌 때 부동소수점 오차 없이(정수 cents) **합을 정확히 보존**해야 한다. Fowler "Money" 패턴의 allocate 동형. 신규 모듈 — 기존 코드/라이브러리 재사용 없음.

## 기능 요구사항

`allocate(amount, ratios)` — 정수 `amount`(cents)를 `ratios`(양의 정수 비율 배열) 비율로 분배한 정수 배열을 반환한다.

### 비즈니스 규칙 (→ formal-spec invariant)

- **BR-ALLOC-CONSERVATION-001 (보존)**: 반환 배열의 합 = `amount`. 1 cent 도 새거나 늘지 않는다.
- **BR-ALLOC-REMAINDER-002 (잔돈 앞쪽 우선)**: 정수 분배 후 남는 cent 는 **앞쪽 버킷부터** 1씩 더한다. 예) `allocate(100, [1,1,1]) = [34,33,33]`.
- **BR-ALLOC-VALIDATION-003 (입력 검증)**: `amount` 가 음수이거나 정수가 아니면, 또는 `ratios` 가 빈 배열이거나 양의 정수가 아닌 원소를 포함하면 `RangeError`.
- **BR-ALLOC-PROPORTION-004 (비례 floor)**: 각 버킷의 기본 몫 = `floor(amount * ratio_i / Σratios)`, 그 위에 BR-ALLOC-REMAINDER-002 잔돈을 얹는다.

### 예시 (acceptance)

| amount | ratios | 기대 결과 | 근거 |
| ------ | ------ | --------- | ---- |
| 100 | [1,1,1] | [34,33,33] | 잔돈 1 → 앞 버킷 |
| 5 | [3,7] | [2,3] | base [1,3] sum4, 잔돈1 → 앞 |
| 100 | [1,1,1,1] | [25,25,25,25] | 잔돈 0 |
| 0 | [1,1] | [0,0] | 0 보존 |
| -1 | [1] | RangeError | 음수 |
| 10 | [] | RangeError | 빈 ratios |
| 10 | [1,-2] | RangeError | 비양수 비율 |

## 비범위

- 다중 통화/환율 ❌. DB·네트워크·I/O ❌ (순수함수).

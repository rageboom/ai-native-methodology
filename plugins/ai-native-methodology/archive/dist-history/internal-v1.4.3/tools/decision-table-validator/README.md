# decision-table-validator

Phase 4.5 decision-tables 산출물에 **dmn-check 5종** (red6/dmn-check, Apache 2.0 알고리즘 차용) + JSON sanity 적용.

## 5종 dmn-check

| ID                    | 의미                                                                 | severity     |
| --------------------- | -------------------------------------------------------------------- | ------------ |
| **rule.duplicate**    | 입력 동일 + 출력 동일 두 row — 중복                                  | non-breaking |
| **rule.conflict**     | 입력 동일 + 출력 다름 — UNIQUE hit policy 위반                       | **breaking** |
| **rule.gap**          | bool 입력의 모든 (2^N) 조합 중 누락                                  | non-breaking |
| **rule.overlap**      | wildcard `*` 가 다른 구체 row 와 출력이 다른데도 cover               | **breaking** |
| **type.mixed-column** | 같은 입력 컬럼 내 cell kind 혼합 (bool / literal) — 자연어 ambiguity | non-breaking |

## JSON sanity (formal-spec.schema decision_tables[] 정합)

- 필수 필드: `br_id`, `trigger`, `condition`, `action`, `expected_result`, `rejection_method`, `verification_location`, `http_status`, `error_message`, `current_state`
- enum: `current_state` ∈ {`complete`, `partial`, `absent`}
- HTTP code 100-599
- `rendered_md_path` (markdown 짝 링크)

## 사용

```bash
npx decision-table-validator <decision-tables-dir>
npx decision-table-validator path/to/BR-X.md
npx decision-table-validator <dir> --json   # 기계 판독
```

exit code: `0` (no breaking) / `1` (breaking ≥ 1).

## 한계 / Sprint 5 carry-over

- 휴리스틱 분류: 입력 컬럼 = "입력: ..." prefix 또는 마지막 컬럼 외 모두. 사용자가 `inputCols` 명시적 지정 가능 (라이브러리 API).
- gap 계산은 입력 컬럼이 모두 bool 일 때만 (literal 입력 도메인 무한 가능 — 미지원).
- `red6/dmn-check` 의 FEEL expression evaluator 는 미차용 (본 방법론 자연어 위주).

## 시뮬레이션 금지 정책 정합

본 도구는 **AI 추론 0%** — 정규식 + 명시적 알고리즘만. no simulation 원칙 정합.

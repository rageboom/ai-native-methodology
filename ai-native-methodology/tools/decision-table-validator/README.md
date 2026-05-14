# decision-table-validator/ — DMN 5종 정합 검증

## Purpose

Phase 4.5 decision-tables 산출물의 **dmn-check 5종** (red6/dmn-check Apache 2.0 알고리즘 차용) + JSON sanity 검증. 의미 모순 자동 검출 (LLM 추론 ❌ / 명시적 알고리즘만).

## When to call

- **trigger**: Phase 4.5 (formal-spec / decision-tables) 산출 후
- **호출자**: skill `analysis-phase-4-5-cross-validation` 자동 호출 / drift-validator 와 짝
- **수동**: `npx decision-table-validator <dir>`

## Inputs

```bash
npx decision-table-validator <decision-tables-dir>
npx decision-table-validator path/to/BR-X.md
npx decision-table-validator <dir> --json   # 기계 판독
```

## Outputs

### 5종 dmn-check

| ID | 의미 | severity |
|---|---|---|
| **rule.duplicate** | 입력 동일 + 출력 동일 두 row — 중복 | non-breaking |
| **rule.conflict** | 입력 동일 + 출력 다름 — UNIQUE hit policy 위반 | **breaking** |
| **rule.gap** | bool 입력의 모든 (2^N) 조합 중 누락 | non-breaking |
| **rule.overlap** | wildcard `*` 가 다른 구체 row 와 출력이 다른데도 cover | **breaking** |
| **type.mixed-column** | 같은 입력 컬럼 내 cell kind 혼합 (bool / literal) — 자연어 ambiguity | non-breaking |

### JSON sanity (formal-spec.schema.decision_tables[] 정합)

- 필수 필드: `br_id`, `trigger`, `condition`, `action`, `expected_result`, `rejection_method`, `verification_location`, `http_status`, `error_message`, `current_state`
- enum: `current_state` ∈ {`complete`, `partial`, `absent`}
- HTTP code 100~599
- `rendered_md_path` (markdown 짝 링크)

## Exit codes

| code | 의미 |
|---|---|
| 0 | no breaking finding |
| 1 | breaking ≥ 1 |
| 2 | usage error |

## Sibling tools

- [`../drift-validator/`](../drift-validator/) — Phase 4.5 짝 / state-machine + sequence 비교
- [`../formal-spec-link-validator/`](../formal-spec-link-validator/) — Phase 4.5 cross-link
- [`../static-runner/`](../static-runner/) — Phase 4.5+ 정적 분석

## 참조

- [`../../schemas/formal-spec.schema.json`](../../schemas/formal-spec.schema.json) — decision_tables[] 정합
- [`../../methodology-spec/deliverables/4-5-formal-spec.md`](../../methodology-spec/deliverables/4-5-formal-spec.md)
- ADR-008 (이중 렌더링 / dmn-check 차용)
- 출처: red6/dmn-check (Apache 2.0)

## 한계 (carry)

- 휴리스틱 분류: 입력 컬럼 = "입력: ..." prefix 또는 마지막 컬럼 외 모두. 사용자가 `inputCols` 명시 지정 가능 (라이브러리 API).
- gap 계산 = 입력 컬럼 모두 bool 일 때만 (literal 입력 도메인 무한 — 미지원).
- `red6/dmn-check` 의 FEEL expression evaluator = 미차용 (자연어 위주).

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — 정규식 + 명시 알고리즘만. lint-no-simulation 정합.

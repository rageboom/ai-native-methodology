# formal-spec-link-validator/ — Phase 4.5 cross-link 검증 (BE + FE 모드)

## Purpose

Phase 4.5 산출물의 `formal_spec_links` / `cross_links[]` 검증. ★ v1.2.3 묶음 C enforcement / v1.4 Stage 3-2 FE 모드 확장.

### BE 모드 (default)

`api-extension.json` (operations[]) + `antipatterns.json` (antipatterns[]) 의 `formal_spec_links` 가 실제 `formal-spec/` 산출물을 가리키는지 검증.

### FE 모드 (`--mode=fe`)

FE 산출물 (state-map / visual-manifest / a11y-spec / i18n-spec / static-security-spec / legacy-spectrum / ui-spec) 의 `cross_links[]` 배열 형식 검증.

## When to call

- **trigger**: Phase 4.5 산출 후 / API + antipatterns + FE 산출물 add/edit
- **호출자**: skill `analysis-phase-4-5-cross-validation` 자동 호출
- **수동**: `node src/cli.js <path>`

## Inputs

```bash
# BE 모드 (default)
node src/cli.js examples/poc-03/output/api/api-extension.json

# 디렉토리 재귀 (BE)
node src/cli.js examples/poc-03/output/

# ★ FE 모드
node src/cli.js examples/poc-04/output/state-map/state-map.json --mode=fe

# ★ BE + FE 양쪽
node src/cli.js examples/poc-04/output/ --mode=both

# JSON 출력
node src/cli.js examples/poc-04/output/ --mode=fe --json

# Chain mode (★ sub-plan-3a 신설)
node src/cli.js .aimd/output/ --chain-mode
```

## Outputs

### BE 모드

| kind | severity |
|---|---|
| `link.dead-reference` | breaking |
| `link.br-id-pattern-mismatch` | non-breaking |
| `cross_link_coverage` | 정량 (info) |

### FE 모드

| kind | severity |
|---|---|
| `link.fe-unknown-artifact` | breaking |
| `link.fe-unknown-link-type` | non-breaking |
| `link.fe-id-pattern-mismatch` | non-breaking |

★ FE 모드 cross-artifact ID resolution (실제 ID 존재 여부) = Stage 5+ carry.

## Exit codes

| code | 의미 |
|---|---|
| 0 | no breaking |
| 1 | breaking ≥ 1 |
| 2 | usage error |

## Sibling tools

- [`../drift-validator/`](../drift-validator/) — Phase 4.5 짝 / state-machine + sequence 비교
- [`../decision-table-validator/`](../decision-table-validator/) — DMN 5종

## 참조

- [`../../schemas/formal-spec.schema.json`](../../schemas/formal-spec.schema.json) + 7 FE schema
- [`../../methodology-spec/deliverables/4-5-formal-spec.md`](../../methodology-spec/deliverables/4-5-formal-spec.md)
- ADR-008 (이중 렌더링) + 묶음 C (cross-link schema 의무화)
- DEC-2026-05-02-v1.4-Stage-3-2-종결 — FE 모드 신설
- DEC-2026-05-06-sub-plan-3a-종결 — `--chain-mode` 추가

## ROI

- ★ schema 의무화 (묶음 C — openapi-extension + antipatterns) enforcement 자동화
- ★ link 깨짐 자동 검출 (사용자 수동 검토 의존 ❌)
- ★ cross_link_coverage 정량 추적 (PoC #03 = 9/21 op = 43%)

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — fs.statSync + path.resolve 만. lint-no-simulation 정합.

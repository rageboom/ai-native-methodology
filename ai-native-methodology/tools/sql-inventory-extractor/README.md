# sql-inventory-extractor/ — phase 4.8 (sql-inventory) gate validator

## Purpose

★ ★ v2.2.0-rc1 phase 4.8 (sql-inventory) 의 산출물 (`sql-inventory.json` 12 컬럼 + extraction_automation / ★ v2.3.0 migration_priority P0~P3 ADR-CHAIN-009) 정합 검증. ★ statement_type enum (PREPARED/CALLABLE/STATEMENT) + carry_flags enum 8종 + confidence ∈ [0.0, 1.0] + external_call_out_of_scope 또는 DBA-read carry 시 confidence ≤ 0.80 if/then + intent_vs_bug_classification 4 분류 키워드 ≥ 1 의무 + extraction_automation.auto_ratio_external_6 ≥ threshold (default 0.50).

## When to call

- **trigger**: phase 4.8 sql-inventory 작성 후 / chain 1 (planning-spec) 진입 직전
- **호출자**: skill `analysis-sql-inventory` 절차 11 + 사용자 직접
- **수동**: `node src/cli.js --target <dir>`

## Inputs

```bash
node src/cli.js \
  --target .aimd/output/sql-inventory/ \
  [--threshold-auto-ratio 0.50] \
  [--dry-run] [--json]
```

검증 대상:
- `<target>/sql-inventory.json` (★ entry / 12 컬럼 record + extraction_automation / ★ v2.3.0 migration_priority P0~P3 = 12번째 컬럼 / ADR-CHAIN-009)

## Outputs

| kind | severity | 의미 |
|---|---|---|
| `inventory.entry_missing` | critical | sql-inventory.json 부재 |
| `inventory.parse_error` | critical | JSON parse 실패 |
| `inventory.array_missing` | critical | inventory[] 배열 부재 또는 빈 |
| `record.missing_required_field` | critical | sql_id / mapper_xml / business_meaning / dependent_tables / intent_vs_bug_classification / confidence 누락 |
| `record.statement_type_invalid` | critical | statement_type enum (PREPARED/CALLABLE/STATEMENT) 위반 |
| `record.carry_flag_invalid` | critical | carry_flags 가 enum 8종 외 |
| `record.confidence_out_of_range` | critical | confidence ∉ [0.0, 1.0] |
| `record.high_confidence_with_external_call` | high | external_call_out_of_scope 또는 DBA-read carry 인데 confidence > 0.80 (★ if/then 위반) |
| `record.intent_vs_bug_no_keyword` | high | intent_vs_bug_classification 본문에 (intent/bug/ambiguous/self_recognized) 4 분류 키워드 ≥ 1 부재 |
| `extraction_automation.missing` | critical | extraction_automation 객체 부재 |
| `extraction_automation.auto_ratio_missing` | critical | auto_ratio_external_6 부재 |
| `extraction_automation.auto_ratio_format_invalid` | high | auto_ratio_external_6 형식 (`N/6 = X.X%`) 위반 |
| `extraction_automation.below_threshold` | medium | auto_ratio_external_6 < threshold (default 0.50) |

## Exit codes

| code | 의미 |
|---|---|
| 0 | pass / no breaking finding |
| 1 | critical/high finding ≥ 1 (default strict) |
| 2 | usage error |
| 3 | dry-run only (★ S3 정합) |

## Sibling tools

- [`../characterization-coverage-validator/`](../characterization-coverage-validator/) — phase 4.7 gate (★ sql-inventory 의 intent_vs_bug_classification 이 phase 4.7 cross-link 의무)
- [`../planning-extraction-validator/`](../planning-extraction-validator/) — chain 1 gate
- [`../schema-validator/`](../schema-validator/) — sql-inventory.schema.json sub-validate (Ajv 8)
- [`../drift-validator/`](../drift-validator/) — `--check-layout` 시 phase 4.8 entry 인식 (★ skills 20 → 21)

## 참조

- [`../../schemas/sql-inventory.schema.json`](../../schemas/sql-inventory.schema.json) (★ 31번째 schema)
- [`../../methodology-spec/deliverables/24-sql-inventory.md`](../../methodology-spec/deliverables/24-sql-inventory.md)
- [`../../skills/analysis-sql-inventory/SKILL.md`](../../skills/analysis-sql-inventory/SKILL.md)
- ADR-CHAIN-007 phase 4.8 정식 도입
- DEC-2026-05-08-poc-06-sql-inventory-retrofit (corroboration #1)
- DEC-2026-05-08-poc-07-종결 (corroboration #2)

## Carry

- baseline ratchet 자동 검증 (characterization-coverage-validator mirror) = C-v2.2.0-2 carry
- Modern ORM (JPA / TypeORM / Prisma) raw SQL 측정 = C-v2.2.0-6 carry (paradigm-cross PoC #08)

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — JSON 파싱 + enum 검증 + 정규식 비교 알고리즘. lint-no-simulation 정합.

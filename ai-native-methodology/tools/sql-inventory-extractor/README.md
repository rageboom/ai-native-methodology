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
  [--legacy-xml-dir <dir>] \
  [--legacy-mismatch-high-threshold 0.30] \
  [--legacy-mismatch-critical-threshold 0.70] \
  [--coverage-baseline <path>] [--write-coverage-baseline] \
  [--dry-run] [--json]
```

검증 대상:
- `<target>/sql-inventory.json` (★ entry / 12 컬럼 record + extraction_automation / ★ v2.3.0 migration_priority P0~P3 = 12번째 컬럼 / ADR-CHAIN-009)
- `--legacy-xml-dir <dir>` (★ v8.7+ optional) — 실 legacy XML (iBATIS/MyBatis SQL mapper) 디렉토리. xmllint XPath count 와 `inventory_count` 정량 cross-check 으로 R15 silent simulation 차단.

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
| `legacy_cross_check.xmllint_unavailable` | medium | xmllint binary 부재 → cross-check skip (★ v8.7+ / R15 차단 의무 시 xmllint 설치 권고) |
| `legacy_cross_check.dir_missing` | high | `--legacy-xml-dir` 경로 부재 또는 디렉토리 아님 |
| `legacy_cross_check.no_xml_files` | medium | `--legacy-xml-dir` 안 .xml 부재 |
| `legacy_cross_check.zero_xmllint_count` | medium | xmllint 가용 / .xml 발견 / 그러나 SQL tag (select/insert/update/delete) 0 — iBATIS/MyBatis mapper 아닐 가능성 |
| `legacy_cross_check.mismatch_high` | high | inventory_count vs xmllint_total mismatch ≥ 30% (default high threshold) — 일부 SQL 누락 가능성 |
| `legacy_cross_check.mismatch_critical` | critical | mismatch ≥ 70% (default critical threshold) — **R15 silent simulation 의심** / AI hypothesis 가능성 |

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

## no-simulation 정합 — scope 명시 (★ v8.7+ 정정)

본 도구 **자체의** 검증 로직은 AI 추론 0% — JSON 파싱 + enum 검증 + 정규식 비교 + xmllint child process 호출 (외부 결정적 도구). lint-no-simulation 정합.

### scope 한계 (R15 silent simulation 차단 의무)

본 도구의 "no-simulation 정합" 보장 scope = **본 도구 자체의 검증 로직 만**. 검증 **대상** `sql-inventory.json` 의 AI hypothesis 여부 cross-check 는 별 입력 의무:

- **schema 정합 (12 컬럼 + enum + if/then) 통과 ≠ 도메인 정합** — AI 가 hypothesis 로 작성한 sql-inventory.json 도 schema 정합 시 critical/high finding 0 통과 가능.
- **`extraction_automation.auto_ratio_external_6`** = sql-inventory.json 안 metric 이 caller (AI 또는 사용자) 자기 보고. 본 도구는 형식 + threshold + ratchet trend 만 검증, **실 외부 도구 invocation 여부 cross-check 불가**.
- **R15 (no-simulation) 차단** = `--legacy-xml-dir <dir>` option 사용 의무 (★ v8.7+). xmllint XPath count 와 inventory_count 의 정량 cross-check 로 AI hypothesis silent pass 차단.
- **권장 path**:
  1. legacy 분석 단계 — xmllint / rg / ast-grep 등 실 외부 도구로 sql-inventory.json 생성 (인간 또는 AI + 실 도구 호출)
  2. validator 호출 시 `--legacy-xml-dir <legacy XML root>` 의무 — mismatch ≥ 30% (high) / ≥ 70% (critical) finding 으로 silent enabler 차단
  3. xmllint 부재 환경에서는 medium finding 으로 skip (graceful) — R15 보호 약화 명시.

### 원본 cycle-3 evidence (F-CYCLE3-005)

- inventory_count = 7 (AI hypothesis) vs xmllint_total = 656 (실 IFRS XML 31 files) → mismatch 98.9% → v8.7+ 도구는 critical finding emit (이전 v8.6.3 은 schema valid 통과 silent pass).

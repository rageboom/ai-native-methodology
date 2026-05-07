# plan v2.2.0-rc1 — SQL Inventory 본체 격상 (★ research 후 정정)

> 2026-05-08 / Work Principles 1원칙 plan + 2원칙 research 후 정정 (D1=b / D7=α / D8=a / D4=b 흡수)
> DEC-2026-05-08-poc-07-종결 §4 + §11 carry 3 (`C-v2.2.0-sql-{inventory,schema,tool}`) + §8.1 strict ≥ 2 PoC isomorphic 자격 사실 확보 (★ ★ paradigm-cross 미충족 / scale-cross only — research §2 Senior STOP signal 흡수)
> v2.1.1 PATCH (2026-05-07 / ratchet trend) 직후 / v2.0.0 MAJOR FINAL → v2.1.0 MINOR (phase 4.7) → v2.1.1 PATCH → ★ ★ ★ **v2.2.0-rc1 prerelease (★ Senior 권고 7d minimum / Modern ORM PoC #08 carry 후 v2.2.0 final 별도 결단)**

---

## 1. 목적 + 비목적

### 1.1 목적

신규 deliverable #24 (SQL Inventory) + 동반 6 자산 (schema / tool / skill / flow / workflow / ADR) 을 **본체 자산으로 정식 격상**.

≥ 2 PoC isomorphic 자격 충족 사실 확보 (DEC-2026-05-08-poc-07-종결 §4):
- corroboration #1 (PoC #06 retrofit / Spring 4.1 + iBATIS 2 / 단일책임 / 6 SQL) — 외부 6 컬럼 자동화 4/6 = 66.7%
- corroboration #2 (PoC #07 / Spring 4.1 + iBATIS 2 / 다중책임 / 71 SQL) — 4/6 = 66.7% (★ scale 무관 isomorphic)

→ ★ Spring 4.1 + iBATIS 2 spectrum sub-rule 자격 동시 자격 충족 (별도 trigger / 본 plan scope ❌).

### 1.2 비목적

- 새 시스템 자동 생성 ❌ (chain harness gate 안에서만)
- patterns_extension_v2 (4-Layer + 4 iBatis 패턴) 의무화 ❌ — schema optional / Legacy 한정 (PoC #07 D12 `(b)` nested patterns object carry 그대로)
- chain harness 5 요소 변경 ❌ — analysis stage 내부 phase 추가만 (v2.1.0 phase 4.7 격상 mirror)
- 다중책임 spectrum sub-rule 본체 격상 ❌ — 단일 PoC / `C-v2.2.0-phase-4-7-multiresponsibility-subrule` carry 잔존
- ★ ratchet trend (v2.1.1) 변경 ❌ — characterization-coverage-validator 의 baseline 패턴은 sql-inventory 에 ★ 별도 적용 검토만 (★ 후속 carry)

---

## 2. ★ 본체 격상 7 자산 (DEC carry 3 + 본 plan 추가 4)

| ID | 자산 | 위치 | 상태 | DEC 명시? |
|---|---|---|---|---|
| A1 | deliverable | `methodology-spec/deliverables/24-sql-inventory.md` (★ #23 사용 중 / #24 신규) | ⏳ 신설 | ✅ C-v2.2.0-sql-inventory |
| A2 | schema | `schemas/sql-inventory.schema.json` (★ 31번째 schema) | ⏳ 신설 | ✅ C-v2.2.0-sql-schema |
| A3 | meta-confidence enum | `schemas/meta-confidence.schema.json` `inputs_used` enum 13 → 14 (`sql_inventory` 추가) | ⏳ 갱신 | ★ 본 plan 추가 (A2 와 묶음) |
| A4 | skill | `skills/analysis/phase-4-8-sql-inventory/SKILL.md` (★ skills 20 → 21) | ⏳ 신설 | ✅ C-v2.2.0-sql-tool 의 동반 skill (분리) |
| A5 | tool | `tools/sql-inventory-extractor/` (★ workspace 14번째) | ⏳ 신설 | ✅ C-v2.2.0-sql-tool |
| A6 | flow | `flows/analysis.phase-flow.{json,mermaid}` v2.1.0 → v2.2.0 / phase 4.8 entry 추가 | ⏳ 갱신 | ★ 본 plan 추가 (manifest 정합) |
| A7 | ADR | `docs/adr/ADR-CHAIN-007-phase-4-8-sql-inventory.md` | ⏳ 신설 | ★ 본 plan 추가 (사상 정식화) |
| (+) | workflow | `methodology-spec/workflow/phase-4-8-sql-inventory.md` (drift-validator 3-way 회귀 통과 의무) | ⏳ 신설 | ★ skills-axis 정책 정합 |

★ A3 = enum 1줄 추가 / 별도 task 분할 ❌ — A2 와 묶음 (v2.1.0 패턴 정합 / `characterization` 추가 mirror).
★ workflow 는 A1~A7 별도 ID 없이 A6 와 함께 묶음 commit (C4).

---

## 3. ★ phase 4.8 의 위치 (analysis stage 내부)

```
analysis stage (chain 1 입력)
├── phase 0 (input)
├── phase 1 (init/inventory)
├── phase 2 (db)
├── phase 3 (arch)
├── phase 4 (business logic)
├── phase 4.5 (formal-spec)
├── phase 4.7 (characterization — v2.1.0)
├── ★ phase 4.8 (★ ★ sql-inventory 신설 / ★ phase 4.7 cross-link 의무)
├── phase 5-1 (api)
├── phase 5-2 (ui)
└── phase 6 (quality)
```

**phase ID 결단 의뢰 (D2)**:
- (a) phase 4.8 (★ 권고 / phase 4.7 cross-link 정식 / RDB 한정 sub-phase)
- (b) phase 1.5 (sql_id grep 자체는 inventory phase 후 가능 / 그러나 4.7 cross-link retrofit 의무)
- (c) phase 4.6 (phase 4.5 formal-spec 후 / phase 4.7 전 / decision-table 정합)

★ 권고 = (a). 근거:
- phase 4.7 의 `intent_classification` cross-link 가 본 추가 4 컬럼 (`uc_link` / `intent_vs_bug_classification` / `confidence` / `carry_flags`) 의무 입력
- PoC #06/#07 retrofit 패턴 = phase 4.7 종결 후 SQL Inventory 작성 (역사 사실)
- RDB 한정 sub-phase 명시 (Modern 환경 NoSQL/Prisma 시 skip 가능 — schema if/then)

---

## 4. ★ 7 자산 상세 설계

### 4.1 A1. deliverable 24-sql-inventory.md

**구조 (23-characterization-spec.md 패턴 정합)**:

1. 목적 — Opus 4.7 외부 조언 (SQL 인벤토리 6 컬럼) + 본 방법론 정합 4 컬럼 = 10 컬럼 / iBATIS 2 / MyBatis / Spring JDBC / JPA QueryDSL 모두 정합
2. 형식 — `output/sql-inventory/` 디렉토리 (sql-inventory.json + sql-inventory.md + raw-grep.txt)
3. 추출 범위 (출처 / 도구 / 신뢰도) — XML mapper grep + DAO/Repository grep + JSP/Controller 추적
4. ★ 10 컬럼 명세 — 외부 6 (`sql_id` / `mapper_xml` / `called_from_screen` / `business_meaning` / `dynamic_branch` / `dependent_tables`) + 본 추가 4 (`uc_link` / `intent_vs_bug_classification` / `confidence` / `carry_flags`)
5. 자동/수동 비율 metric — `extraction_automation` 객체 (auto_extracted_columns + manual_columns + auto_ratio_external_6 / auto_ratio_total_10)
6. ★ patterns_extension_v2 (★ optional / Legacy 한정) — 4 패턴 (dynamic_branch / calculation_formula / result_mapping / shared_sql_fragments) + nested patterns object per record
7. cross-link — to_artifact: characterization (intent_classification 양방향) / planning-spec (UC) / antipatterns (AP-X-011/012 신호) / domain (table)
8. 신뢰도 (ADR-009 §2.4 정합) — 단계별 60-95%
9. 검증 체크리스트 — schema + 10 컬럼 / extraction_automation / coverage_ratio / phase_4_7_corroboration_role
10. 산출물 간 참조 — sql-inventory → phase 4.7 (intent oracle) / phase 5-1 (API endpoint ↔ sql_id)
11. 흔한 함정 — RDB 부재 / called_from_screen 자동화 0% / business_meaning LLM ~70% / external_call_out_of_scope / DBA-read carry / 시간 cap (PoC #07 71 SQL → 핵심 15 만 cover, 56 carry 정합)
12. ★ ★ ≥ 2 PoC corroboration 사실 (PoC #06 + PoC #07 isomorphic 표)
13. carry (v2.2.x patch / v2.x)

### 4.2 A2. schemas/sql-inventory.schema.json (★ 31번째)

**Sub-schema 4개**:

```json
{
  "$id": ".../sql-inventory.schema.json",
  "title": "SQL Inventory — phase 4.8 SQL 인벤토리 10 컬럼 + extraction_automation + patterns_extension_v2 (optional Legacy)",
  "type": "object",
  "required": ["meta_confidence", "summary", "extraction_automation", "inventory"],
  "properties": {
    "meta_confidence": { "$ref": "meta-confidence.schema.json" },
    "$comment": { "type": "string" },
    "project_id": { "type": "string" },
    "spectrum": { "type": "string", "description": "예: 'Spring 4.1 + iBATIS 2 / Legacy 적대성 4중'" },
    "summary": { "$ref": "#/$defs/summary" },
    "extraction_automation": { "$ref": "#/$defs/extractionAutomation" },
    "inventory": { "type": "array", "items": { "$ref": "#/$defs/sqlRecord" } },
    "patterns_extension_v2": { "$ref": "#/$defs/patternsExtensionV2" },
    "phase_4_7_corroboration_role": { "type": "object" }
  },
  "$defs": {
    "sqlRecord": {
      "type": "object",
      "required": ["sql_id", "mapper_xml", "business_meaning", "dependent_tables", "intent_vs_bug_classification", "confidence"],
      "properties": {
        "sql_id": { "type": "string", "description": "★ 외부 6 / DAO.method 또는 mapper namespace.id" },
        "mapper_xml": { "type": "string", "description": "★ 외부 6 / 또는 'inline' (Spring JDBC) / 'jpa' (Repository)" },
        "mapper_xml_line": { "type": "integer", "minimum": 1 },
        "called_from_screen": { "type": "string", "description": "★ 외부 6 / JSP recursive trace / Modern 시 'N/A — REST API only'" },
        "business_meaning": { "type": "string", "description": "★ 외부 6 / LLM ~70% + 도메인 expert 검증 carry" },
        "dynamic_branch": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["tag", "branch_count"],
            "properties": {
              "tag": { "type": "string", "description": "예: '<isNotEmpty property=\"currCd\">' / 'SQL CASE WHEN'" },
              "line": { "type": "integer" },
              "branch_count": { "type": "integer", "minimum": 1 },
              "note": { "type": "string" }
            }
          }
        },
        "dependent_tables": { "type": "array", "items": { "type": "string" }, "description": "★ 외부 6 / FROM/JOIN regex" },
        "uc_link": { "type": "string", "description": "★ 본 추가 4 / planning-spec UC ID 또는 'N/A — supplementary'" },
        "intent_vs_bug_classification": { "type": "string", "description": "★ 본 추가 4 / characterization 4 분류 자연어 (예: 'intent (BR-EXCHANGE-002 정합) + bug 동반 (AP-EXCHANGE-006)')" },
        "confidence": { "type": "number", "minimum": 0.0, "maximum": 1.0, "description": "★ 본 추가 4 / meta-confidence 단계별 가중" },
        "carry_flags": {
          "type": "array",
          "items": { "type": "string", "enum": ["DBA-read", "proc-body", "external_call_out_of_scope", "domain-expert-review", "scope-decision-carry"] },
          "description": "★ 본 추가 4 / scope_decision 명시"
        },
        "patterns": { "$ref": "#/$defs/patternObject", "description": "★ optional / Legacy iBATIS / patterns_extension_v2 nested" }
      }
    },
    "summary": {
      "type": "object",
      "required": ["total_sql_operations", "by_type"],
      "properties": {
        "total_sql_operations": { "type": "integer", "minimum": 0 },
        "by_type": { "type": "object", "additionalProperties": { "type": "integer", "minimum": 0 } },
        "dependent_tables_unique": { "oneOf": [{ "type": "integer" }, { "type": "array", "items": { "type": "string" } }] },
        "external_calls_count": { "type": "integer", "minimum": 0 },
        "external_calls": { "type": "array", "items": { "type": "string" } },
        "dynamic_branch_count": { "type": "integer", "minimum": 0 },
        "self_recognized_count": { "type": "integer", "minimum": 0 },
        "covered_in_this_poc": { "type": "integer" },
        "carry": { "type": "integer" },
        "coverage_ratio": { "type": "string", "description": "예: '15/71 = 21.1%' (자연어 / scope_decision 정합)" }
      }
    },
    "extractionAutomation": {
      "type": "object",
      "required": ["auto_extracted_columns", "manual_columns", "auto_ratio_external_6"],
      "properties": {
        "auto_extracted_columns": { "type": "array", "items": { "type": "string" } },
        "manual_columns": { "type": "array", "items": { "type": "string" } },
        "auto_ratio_external_6": { "type": "string", "description": "예: '4/6 = 66.7% (≥ 50% pass)'" },
        "auto_ratio_total_10": { "type": "string" },
        "comparison_to_prior_poc": { "type": "object", "additionalProperties": true }
      }
    },
    "patternsExtensionV2": {
      "type": "object",
      "description": "★ optional / Legacy iBATIS 한정 / 4 패턴 + nested per record",
      "properties": {
        "schema_version": { "type": "string" },
        "aggregate_metrics": {
          "type": "object",
          "properties": {
            "pattern_1_dynamic_branch": { "type": "object" },
            "pattern_2_calculation_formula": { "type": "object" },
            "pattern_3_result_mapping": { "type": "object" },
            "pattern_4_shared_sql_fragments": { "type": "object" }
          }
        }
      }
    },
    "patternObject": { "type": "object" }
  }
}
```

★ if/then 의무:
- `meta_confidence.inputs_used` 가 `sql_inventory` 포함 시 → `extraction_automation.auto_ratio_external_6` 의무
- `inventory[].carry_flags` 에 `external_call_out_of_scope` 또는 `DBA-read` 시 → `confidence ≤ 0.80` 검증

### 4.3 A3. meta-confidence.schema.json `inputs_used` enum 갱신

```json
"enum": [
  "source_code", "erd", "orm", "operational_db", "planning_docs",
  "design_specs", "config_files", "test_code", "documentation",
  "domain_context_md", "postman_or_api_test", "diagrams_other",
  "characterization",
  "sql_inventory"  // ★ v2.2.0 신규 (13 → 14 / phase 4.8 출력이 chain 1 입력 보강)
]
```

### 4.4 A4. skills/analysis/phase-4-8-sql-inventory/SKILL.md (★ skills 20 → 21)

**phase-4-7-characterization/SKILL.md 패턴 정합**:

```md
---
name: phase-4-8-sql-inventory
description: Use when project has analysis output (rules.json + antipatterns.json + characterization-spec.json) AND user invokes "sql inventory" or "mapper xml" or "ibatis sql" or "DAO sql" task. Generates sql-inventory.json (산출물 24). ★ Opus 4.7 외부 조언 6 컬럼 + 본 방법론 정합 4 컬럼 = 10 컬럼 / RDB 한정 / iBATIS 2 / MyBatis / Spring JDBC / JPA Repository 모두 정합. ≥ 2 PoC isomorphic 입증 (PoC #06 단일책임 + PoC #07 다중책임 / Spring 4.1 + iBATIS 2 spectrum). Stage = analysis, manifest phase = 4.8.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# phase-4-8-sql-inventory — SQL 인벤토리 10 컬럼 + extraction_automation

## ★★★ no-simulation 절대 금지 (CLAUDE.md)
## 사전 조건 (rules.json + antipatterns.json + characterization-spec.json)
## 절차
  1. mapper xml grep (sql_id + mapper_xml + dependent_tables / 자동 ✅)
  2. DAO / Controller 추적 (called_from_screen / JSP recursive)
  3. business_meaning 자연어 (LLM ~70% / 도메인 expert 검증 carry)
  4. dynamic_branch 추출 (iBATIS dynamic tags + SQL CASE WHEN)
  5. ★ phase 4.7 cross-link (uc_link / intent_vs_bug_classification / confidence / carry_flags)
  6. extraction_automation 측정 (외부 6 컬럼 자동 비율 ≥ 50% pass)
  7. (★ optional / Legacy 한정) patterns_extension_v2 — 4 패턴 nested
  8. sql-inventory-extractor 실행 (★ tool A5)
## 산출물 (`<user-project>/.aimd/output/sql-inventory/{sql-inventory.json,sql-inventory.md,raw-grep.txt}`)
## 본체 명세 + ADR-CHAIN-007 + 외부 권위 + 흔한 함정 + ≥ 2 PoC 표
```

### 4.5 A5. tools/sql-inventory-extractor/ (★ workspace 14번째)

**characterization-coverage-validator 패턴 정합**:

```
tools/sql-inventory-extractor/
├── package.json (ES module / node:test / zero-dep / engines node>=18)
├── README.md (Purpose / When / In / Out / Exit / Siblings / 참조 표준 schema)
├── src/
│   ├── cli.js
│   ├── extractor.js
│   ├── grep-mapper.js   # ★ XML mapper grep (sql_id / mapper_xml / dependent_tables / dynamic_branch tag) — 자동 ✅
│   └── validator.js     # ★ 10 컬럼 검증 + extraction_automation + phase_4_7_corroboration_role
└── test/
    ├── fixtures/
    │   ├── valid/    (PoC #06 + PoC #07 자산 복사 — 양 spectrum corroboration)
    │   └── invalid/  (4~5 fail case)
    └── extractor.test.js  (8~10 unit test)
```

**핵심 기능 2가지**:
1. **extract** (★ 자동 추출) — `--target <src>` → mapper XML grep + DAO grep → raw-grep.txt + sql-inventory.json placeholder (4 컬럼 자동 / 6 컬럼 placeholder)
2. **validate** — `--target <inventory_dir>` → 10 컬럼 의무 + intent_vs_bug_classification 본문 grep + carry_flags enum + confidence range

**핵심 검증 의무**:
1. inventory[].sql_id + mapper_xml + business_meaning + dependent_tables 의무
2. inventory[].intent_vs_bug_classification 본문에 (intent / bug / ambiguous / self_recognized) 4 분류 키워드 ≥ 1
3. inventory[].confidence ∈ [0.0, 1.0]
4. inventory[].carry_flags ⊂ enum
5. extraction_automation.auto_ratio_external_6 형식 검증 (`^\d+/6 = \d+\.\d+%` 정규)
6. external_call_out_of_scope 또는 DBA-read 시 confidence ≤ 0.80

**unit test 회귀** — 현재 232 → ★ ≥ 240 (+8) 목표.

### 4.6 A6. flows/analysis.phase-flow.json v2.1.0 → v2.2.0

```json
{
  "version": "2.2.0",
  "phases": [
    ...,
    {
      "id": "4.7",
      "name": "characterization (★ v2.1.0)",
      ...
    },
    {
      "id": "4.8",
      "name": "sql-inventory (★ v2.2.0 신설 — 10 컬럼 인벤토리)",
      "spec_file": "phase-4-8-sql-inventory.md",
      "depends_on": ["1", "4", "4.7"],
      "inputs": ["inventory.json", "rules.json", "antipatterns.json", "characterization-spec.json"],
      "outputs": ["sql-inventory.json", "sql-inventory.md", "raw-grep.txt"],
      "automated_validation": ["sql-inventory-extractor", "schema-validator"],
      "introduced": "v2.2.0",
      "rdb_only": true,
      "skills": ["phase-4-8-sql-inventory"]
    },
    {
      "id": "5-1",
      "depends_on": ["4", "4.5", "4.7", "4.8"],
      ...
    }
  ],
  "version_milestones": {
    ...,
    "v2.2.0": ["★ ★ phase 4.8 (sql-inventory) 정식 단계 신설", "deliverable 24 + schema 31번째 + skill 21번째 + tool workspace 14번째 + ADR-CHAIN-007", "≥ 2 PoC isomorphic (PoC #06 단일책임 + PoC #07 다중책임 / Spring 4.1 + iBATIS 2 spectrum)"]
  }
}
```

`flows/analysis.phase-flow.mermaid` 도 동기 갱신.

### 4.7 A7. ADR-CHAIN-007

**ADR-CHAIN-006 패턴 정합**:

```md
# ADR-CHAIN-007: phase 4.8 (sql-inventory) 정식 도입 — SQL 인벤토리 10 컬럼 + RDB 한정 sub-phase

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-08
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-CHAIN-006 (phase 4.7 / cross-link), ADR-008 (이중 렌더링), ADR-009 (신뢰도), DEC-2026-05-08-poc-06-sql-inventory-retrofit, DEC-2026-05-08-poc-07-종결, plan §6.5 (Opus 4.7 외부 조언)

## 컨텍스트
phase 4.7 (characterization) 의 intent_classification 만으로는 SQL 단위 추적 ❌. iBATIS 2 / MyBatis / Spring JDBC / JPA Repository 모두 정합인 SQL 인벤토리 자산 부재.

## 외부 조언 (Opus 4.7 / 사용자 turn 시 별도 CLI 의견)
- SQL 인벤토리 6 컬럼 표 (sql_id / mapper_xml / called_from_screen / business_meaning / dynamic_branch / dependent_tables)
- iBatis XML = 1차 산출물 / DAO + DB 통합 테스트 (chain 3 영역 / scope ❌ / carry)
- 4-Layer + 4 iBatis 패턴 (patterns_extension_v2)

## 결정
phase 4.8 (sql-inventory) 정식 단계 신설. 5 정책:
1. 위치 — analysis stage / phase 4.7 후 / phase 5-1 + 5-2 전 / RDB 한정 sub-phase
2. 10 컬럼 = 외부 6 + 본 추가 4 (uc_link / intent_vs_bug_classification / confidence / carry_flags) ★ phase 4.7 cross-link 의무
3. extraction_automation metric 의무 (외부 6 컬럼 자동 비율 ≥ 50% pass)
4. patterns_extension_v2 = optional / Legacy iBATIS 한정 (PoC #07 D12 (b) nested patterns object carry)
5. ratchet 정책 ❌ — coverage_ratio = 자연어 (예: "15/71 = 21.1%") / scope_decision: carry 명시 (시간 cap 정합)

## ≥ 2 PoC isomorphic
| PoC | spectrum | scale | 외부 6 컬럼 자동화 |
|---|---|---|---|
| PoC #06 retrofit | 단일책임 (exchange) | 6 SQL | 4/6 = 66.7% |
| PoC #07 | 다중책임 (capital) | 71 SQL | 4/6 = 66.7% (★ scale 무관) |

## 결과
- 본체 자산 7 (deliverable / schema / meta-confidence enum / skill / tool / flow / workflow)
- chain harness 5 요소 변경 ❌
- v2.2.0 minor release

## 미해결
- v2.x carry: Modern 환경 NoSQL/Prisma 정합 검증 (≥ 1 Modern PoC 후) / sql-inventory baseline ratchet (사용 시 / characterization-coverage-validator mirror)
```

---

## 5. 검증 + drift 회귀

### 5.1 drift-validator `--check-layout` 갱신

manifest phase 10 → ★ 11 / skills 20 → ★ 21.

```bash
node tools/drift-validator/src/cli.js --check-layout
# Expect: ★ 11 phases / 21 skills / 0 orphans / 0 missing
```

### 5.2 unit test 232 → ≥ 240

| 도구 | 직전 | 신규 | 합계 |
|---|---|---|---|
| sql-inventory-extractor | 0 | +8~10 | 8~10 |
| drift-validator (phase-skill 갱신) | 47 | (변경 없음 / corpus 갱신만) | 47 |
| characterization-coverage-validator | 14 | 0 | 14 |
| 그 외 11 도구 | 94 | 0 | 94 |
| chain-driver | 68 | 0 | 68 |
| release-readiness self-test | 9 | 0 | 9 |
| **합계** | 232 | +8~10 | **240+** |

### 5.3 version-check + build

```bash
node scripts/version-check.js --check  # 3 source 모두 v2.2.0
node scripts/build-plugin.js           # dist/ai-native-methodology-v2.2.0/
shasum -c dist/ai-native-methodology-v2.2.0/CHECKSUMS  # all OK
```

### 5.4 release-readiness

```bash
node scripts/release-readiness.js --target v2.2.0
# Expect: §8.1 strict 7/7 ✅ (≥ 2 PoC isomorphic 자동 인식)
```

### 5.5 schema-validator 회귀

`schema-validator` 가 `sql-inventory.schema.json` 자동 인식 → PoC #06/#07 sql-inventory.json valid 검증 통과.

---

## 6. release commit cadence (분할)

| commit | 내용 |
|---|---|
| C1 | A1 + A2 + A3 (deliverable 24 + schema 31번째 + meta-confidence enum) |
| C2 | A4 (skill phase-4-8-sql-inventory) |
| C3 | A5 (tool sql-inventory-extractor + 8~10 unit test + workspace 14번째) |
| C4 | A6 + A7 + workflow (flow + ADR-CHAIN-007 + workflow phase-4-8-sql-inventory.md) |
| C5 | drift-validator 회귀 (corpus 갱신) + version bump v2.1.1 → v2.2.0 + build dist + CHANGELOG |
| C6 | DEC-2026-05-08-v2.2.0-release + STATUS / INDEX |
| C7 | git tag v2.2.0 |

★ 각 commit 자체 통과 (drift-validator + unit test 회귀) — 부분 commit 으로 인한 broken state ❌.

### 6.1 §8.1 strict 정합

| 자격 | 충족 |
|---|---|
| ≥ 2 PoC isomorphic | ✅ PoC #06 + PoC #07 (66.7% 동일 / scale 무관) |
| 명시 carry | ✅ Modern NoSQL/Prisma 검증 + sql-inventory baseline ratchet (v2.x) |
| 본체 격상 7 자산 | ✅ A1~A7 + workflow |
| unit test 회귀 통과 | ✅ ≥ 240 |
| build dist | ✅ ai-native-methodology-v2.2.0/ |
| release-readiness 7/7 | ✅ |
| Senior cooling-off | ⏳ ★ ★ ★ **사용자 결단 D3** — v2.0.0 final 의 24h+ pattern 적용 여부 (v2.1.0 minor = 즉시 final 패턴 정합) |

---

## 7. 리스크 + Lessons Learned 후보

### 7.1 리스크

| 리스크 | 완화 |
|---|---|
| RDB 부재 환경 (NoSQL/Prisma) 시 phase 4.8 skip 처리 ❌ | flow `rdb_only: true` flag + skill prompt 의 사전 조건 명시 |
| schema 가 PoC #06/#07 자산 정합 ❌ | 두 PoC fixture 모두 valid corpus 등재 + Ajv strict 검증 통과 의무 |
| drift-validator phase 10 → 11 회귀 fail | check-layout test corpus 동시 갱신 |
| patterns_extension_v2 schema 가 v2.x carry 강제 ↑ | optional 명시 + PoC #06/#07 fixture 보존 (flexibility 입증) |
| ★ ★ ★ **다중책임 spectrum sub-rule 본체 격상 의심** (PoC #07 단일) | 명시 carry `C-v2.2.0-phase-4-7-multiresponsibility-subrule` (≥ 2 다중책임 PoC 후 trigger) |
| 14차 retract 패턴 burst | ★ 분할 commit (C1~C7) + 각 단위 통과 |
| ★ Spring 4.1 + iBATIS 2 spectrum AP sub-rule 동시 본체 격상 의심 (≥ 2 PoC corroboration 자격) | scope 분리 — 본 plan = SQL Inventory 만 / sub-rule = 별도 v2.2.x patch 또는 v2.3.0 trigger |

### 7.2 Lessons Learned 후보

(현재 시점 = 진입 전 / 발견 시 추가)

---

## 8. 진행 결단 의뢰 (D1~D6)

| 결단 | 옵션 |
|---|---|
| **D1 진입 여부** | (a) 즉시 plan 승인 → 2원칙 (research) 진입 (b) plan 수정 후 (c) 다른 우선순위 |
| **D2 phase ID** | (a) phase 4.8 (★ 권고 / phase 4.7 cross-link 정식) (b) phase 1.5 (early extraction) (c) phase 4.6 (formal-spec 후) |
| **D3 sub-agent research 깊이** | (a) 가벼운 (Phase 4~6 패턴 / Case 생략 / ~10배 단축) (b) 정통 (3 agent 병렬 / 시간 cap ❌) |
| **D4 Senior cooling-off** | (a) v2.2.0 minor → 즉시 final (≥ 2 corroboration + ≤ 7 자산 / scope 작음 / v2.1.0 패턴 정합) (b) v2.2.0-rc1 prerelease → 24h+ 후 final |
| **D5 commit 단위** | (a) §6 7-commit 분할 (b) 묶어서 1~2 commit |
| **D6 Spring 4.1 + iBATIS 2 spectrum AP sub-rule 동시 격상 여부** | (a) ★ 권고 분리 — 본 plan scope = SQL Inventory 만 / sub-rule = 별도 plan (b) 동시 격상 (★ scope ↑) |

★ 권고 = D1=(a) / D2=(a) / D3=(a) / D4=(a) / D5=(a) / D6=(a).

근거: scope 작음 (≤ 7 자산 / unit test +8~10) + ≥ 2 corroboration 사실 확보 + chain harness 5 요소 변경 ❌ + paradigm shift ❌ + v2.1.0 minor release 패턴 정합 → ★ 14차 retract 위험 ↓ → minor release rc 생략 정합.

---

## 9. 자산 위치 정합 (★ ★ skills-axis 정책 / methodology-spec/skills-axis.md)

skills 디렉토리 = 산출물 번호 prefix axis (본 plan 시 phase-4-8-sql-inventory). manifest phase ID = "4.8" (점 표기). drift-validator `--check-layout` 가 3-way (manifest ↔ workflow ↔ skills) 검증 통과 의무.

---

## 10. 예상 시간 (lightweight sub-agent / Phase 4~6 패턴)

| Task | 시간 |
|---|---|
| 2원칙 research (3 agent 병렬 / 가벼운) | 30~60분 |
| 3원칙 사용자 승인 | 5~15분 |
| C1 (deliverable + schema + enum) | 30~45분 |
| C2 (skill) | 20~30분 |
| C3 (tool + 8~10 test) | 60~90분 |
| C4 (flow + ADR + workflow) | 30~45분 |
| C5 (drift + version + build + CHANGELOG) | 20~30분 |
| C6 (DEC + STATUS + INDEX) | 30~45분 |
| C7 (tag) | 5분 |
| **합계** | ★ 4~6시간 |

★ Auto Mode 가속 가정.

---

## 부록 A. v2.2.0 후속 carry (DEC §6 명시)

| ID | 항목 | trigger |
|---|---|---|
| C-v2.2.0-1 | Modern 환경 NoSQL/Prisma 정합 검증 | ≥ 1 Modern PoC 후 (NestJS + TypeORM 등) |
| C-v2.2.0-2 | sql-inventory baseline ratchet (characterization-coverage-validator mirror) | v2.2.x patch / 사용 시 |
| C-v2.2.0-3 | patterns_extension_v3 schema 보강 (cache / discriminator / typeHandler 3 패턴 추가 / 현재 optional / Agent 1 빈틈 #2) | ≥ 2 Legacy PoC patterns 변형 후 |
| C-v2.2.0-4 | sub-rule Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 (AP-{X}-001/002/004/011/012) 본체 sub-rule 격상 | 본 plan 종결 후 별도 plan |
| C-v2.2.0-5 | sub-rule 다중책임 spectrum (AP-CAPITAL-005~011) | ≥ 2 다중책임 PoC 후 |
| ★ C-v2.2.0-6 | **★ ★ ★ Modern ORM PoC #08 (★ paradigm-cross corroboration 의무)** — MyBatis 3 annotation 또는 JPA QueryDSL 또는 TypeORM raw SQL spectrum / 14d cap / 가벼운 sub-agent | ★ Senior STOP signal 흡수 / **v2.2.0 final 격상 trigger (rc1 → final)** |
| C-v2.2.0-7 | iBATIS 2 전용 dynamic 태그 sub-classification enum (`<dynamic>` / `<iterate>` / `<isPropertyAvailable>` 등 / Agent 1 빈틈 #3) | v2.2.x patch / 사용자 finding |
| C-v2.2.0-8 | Gartner TIME 2축 매핑 (`time_classification` 12번째 컬럼 / Agent 2 권고) | v2.3+ / 사내 적용 시 |
| C-v2.2.0-9 | "Why not AWS SCT" 차별화 절 deliverable §1 motivation 보강 | v2.2.0 final 시 |

---

## 부록 B. ★ ★ ★ research 후 정정 (D1=b / D7=α / D8=a / D4=b 흡수)

### B.1 D7 흡수 — paradigm-cross corroboration 처분

★ Senior STOP signal: PoC #06 + PoC #07 모두 Spring 4.1 + iBATIS 2 = ★ 동일 paradigm 변종 (scale-cross only). §8.1 strict 정신 = paradigm-cross corroboration 의무.

**(α) plan 수정 흡수 (★ 채택)**:
- ✅ Modern ORM PoC #08 carry 명시 (C-v2.2.0-6 신규)
- ✅ ADR-CHAIN-007 본문에 **paradigm gap 우려** + **PoC #08 corroboration 의무** + **rc1 → final trigger** 명시 의무
- ✅ deliverable naming 유지 (`sql-inventory` / 격하 ❌)
- ✅ v2.2.0-rc1 **prerelease ★ 7d minimum** (Senior 권고 24h ❌)

### B.2 D8 흡수 — 빈틈 4건 (외부 권위 정합 70% → 90%)

**(a) 모두 흡수 (★ 채택)**:

1. ★ **statement_type 11번째 컬럼 추가** (Agent 1 강 권고 / MyBatis 14 표준 속성)
   - schema enum: PREPARED / CALLABLE / STATEMENT
   - PoC #06 1 SP / PoC #07 14 procedure 자동 식별
   - tool sql-inventory-extractor 가 XML `statementType` 속성 grep + Java code `CallableStatement` grep 자동 추출
2. **patterns_extension_v3 carry note** — cache / discriminator / typeHandler 3 패턴 (C-v2.2.0-3 갱신)
3. **iBATIS 2 전용 dynamic 태그 enum carry** — `<dynamic>` / `<iterate>` / `<isPropertyAvailable>` 등 (C-v2.2.0-7 신규)
4. ADR-CHAIN-007 본문에 ★ Michael Feathers + ★ Gartner TIME alignment 인용 명문화

### B.3 §2 자산 표 갱신 (11 컬럼 + carry note)

A1 deliverable 24-sql-inventory.md ★ ★ 11 컬럼 / Feathers + Gartner TIME 인용 / "Why not AWS SCT" 차별화 절
A2 schema sql-inventory.schema.json ★ ★ statement_type enum / iBATIS 2 전용 dynamic tag carry note / patterns_extension_v3 carry
A5 tool sql-inventory-extractor ★ statement_type 자동 추출 (XML `statementType` + Java `CallableStatement` grep)
A7 ADR-CHAIN-007 ★ ★ ★ paradigm gap 우려 + Modern ORM PoC #08 carry / Feathers + Gartner TIME footnote

### B.4 §6 commit cadence ★ 7d minimum prerelease

- C1~C7 분할 유지 (Senior 권고 ✅)
- 각 commit 별 schema-validator + drift-validator 통과 게이트 의무
- ★ ★ ★ **v2.2.0-rc1 prerelease 7d minimum 후 ★ final 결단** (Modern ORM PoC #08 carry 종결 의존)
- 본 session scope = ★ rc1 까지 (final = 별도 session + 사용자 결단)

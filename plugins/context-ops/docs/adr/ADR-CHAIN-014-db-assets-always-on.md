# ADR-CHAIN-014 — DB 자산 always-on 정책

- 상태: 승인됨 (Accepted) — poc-17 dogfooding 진입 결단
- **결정 시각**: 2026-05-28
- **연관 결정**: DEC-2026-05-28-db-assets-always-on
- **연관 PoC**: poc-17-ifrs-car-migration (첫 live 적용 — 외부 격리 작업)
- **연관 명세**: methodology-spec/db-assets-always-on.md (SSOT)
- **연관 schema carry**: schemas/work-unit-manifest.schema.json (related*artifacts.db*\* 4 필드)
- **버전**: v11.x MINOR (또는 v12.0 결단 carry)

## Context

poc-17 (사내 legacy ifrs/car 도메인 신규 stack 전환 dogfooding) 작업 plan 결단 시 사용자 명시:

> "내가 준 데이터 베이스 자료도 다 고려 되어 있는건가?"
> "데이터 베이스 정보 항상 챙길수 있도록 해줘"

첫 plan 작성 시 본 방법론이 DB 자산 (Tables DDL / Functions / Stored Procedures / ERD / 도메인 노트) 을 analysis 입력에서 누락. 사용자가 본격 지적 → 본 정책 신설.

사내 legacy paradigm 의 비즈니스 로직은 **3 layer 분포**:

- (a) Java app — 부분 추출
- (b) iBATIS sqlMap XML — 자동 추출 ❌ (codegraph 미지원 / DEC-2026-05-28-codegraph-probe-결과)
- (c) **DB 자산** — 정적 분석 ✅ (SQL 파일 AST parse 가능)

본 방법론의 기존 명세는 (a) + (b) 중심 — (c) layer 누락 = analysis 부실 = §3-A axis 의 분모 자체 줄어드는 효과 (전체 비즈니스 로직 측정에서 일부 누락).

## 결정 (Decision)

**DB 자산 always-on 정책** 영구 신설. 본 방법론의 모든 stage 입력에 DB 자산 명시 첨부 의무.

### 1. 의무 적용 stage

| Stage                           | DB 자산 입력 의무                                                    |
| ------------------------------- | -------------------------------------------------------------------- |
| analysis Phase 1 (1회 baseline) | 전체 (Tables + Views + Functions + SP + ERD + 도메인 노트)           |
| scope chain 1 discovery         | scope 관련 DB 자산 자동 첨부 (related_artifacts 역인덱스)            |
| scope chain 2 spec              | DB schema 변경 사항 명시 (신규 stack schema 매핑 draft)              |
| scope chain 3 plan              | SP/Function 전환 결단 의무 (ADR-CHAIN-015 sp-conversion-policy 적용) |
| scope chain 4 test              | test fixture DB schema 의무                                          |
| scope chain 5 implement         | 신규 stack DB schema migration script + 기존↔신규 1:1 매핑           |

### 2. DB 자산 7종 정의

- Tables DDL (`CREATE TABLE`)
- Views (`CREATE VIEW`)
- Functions (`CREATE FUNCTION`)
- Stored Procedures (`CREATE PROCEDURE`)
- ERD 자산 (`*.erd` / `*.erm` / Visual Paradigm / DBeaver)
- Migration scripts (Liquibase / Flyway / 자체)
- 도메인 노트 (사용자 작성 `*.txt`/`*.md` — known intent / known bug)

### 3. canonical global 산출물 디렉토리 (신설)

`.ai-context/output/` 에 다음 디렉토리 신설:

- `.ai-context/output/stored-procedures/` — SP 정적 분석 결과
- `.ai-context/output/functions/` — Function 정리
- (`.ai-context/output/erd/`, `.ai-context/output/schema/`, `.ai-context/output/business-rules/` 는 기존 활용)

### 4. work-unit-manifest 스키마 갱신 (carry)

`schemas/work-unit-manifest.schema.json` 의 `related_artifacts` 에 4 필드 추가:

```json
"db_tables": { "type": "array", "items": { "type": "string" } },
"db_procedures": {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "sp_conversion_class": { "enum": ["alpha", "beta", "gamma", "delta"] }
    },
    "required": ["id"]
  }
},
"db_functions": { "type": "array", "items": { "type": "string" } },
"db_views": { "type": "array", "items": { "type": "string" } }
```

### 5. lifecycle-contract 매트릭스 갱신 (carry)

`methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 에 **DB axis** 추가 (행 또는 column).

## 결과 (Consequences)

### 본격 효과

- analysis 입력 완전성 ↑ (legacy 비즈니스 로직 3 layer 모두 포착)
- 사용자 결단 부담 사전 식별 (DB 자산 누락 = 명시 의무)
- ADR-CHAIN-015 (sp-conversion-policy) cascade 가능
- §3-A axis 의 분모 정합 의무 — 자동화율 측정 신뢰도 ↑

### Trade-off

- analysis Phase 1 입력 자산 list 가 본격 (시간 부담 ↑)
- chain 3 plan stage 에서 SP 분류 결단 추가 (사용자 결단)
- baseline-delta 운영 모델 의 canonical global 디렉토리 신설 (`stored-procedures/` / `functions/`)
- work-unit-manifest schema breaking change 가능성 (additive 인지 확인 필요)

### 영향 자산

- `schemas/work-unit-manifest.schema.json` (additive 4 필드)
- `methodology-spec/lifecycle-contract.md` (DB axis 갱신)
- `methodology-spec/baseline-delta-operating-model.md` (canonical global 디렉토리 신설)
- 모든 6 stage agent (analysis / discovery / spec / plan / test / implement) 가 DB 자산 인식 의무
- `tools/chain-driver/` `sync` 명령 (DB 변경 drift 감지)

## 인용

- 사용자 명시 — 2026-05-28 / poc-17 plan 결단
- `methodology-spec/db-assets-always-on.md` (SSOT)
- `methodology-spec/sp-conversion-policy.md` (cascade)
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X (R1' sub-axis)
- DEC-2026-05-28-codegraph-probe-결과 (iBATIS 자동 추출 ❌ / SP·Function 정적 분석 ✅)
- DEC-2026-05-28-db-assets-always-on

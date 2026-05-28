# DB 자산 always-on 정책 (Tables / Views / Functions / Stored Procedures / ERD / 도메인 노트)

> **사상**: legacy 시스템의 비즈니스 로직은 코드 layer 뿐 아니라 DB layer 에도 분포한다. analysis baseline 부터 implement 까지 **모든 stage 입력에 DB 자산을 항상 명시 첨부 의무**.
> **trigger**: poc-17 ifrs/car dogfooding 작업 (2026-05-28) — 사용자 명시 "데이터 베이스 정보 항상 챙길 수 있도록 해줘".
> **관련**: `baseline-delta-operating-model.md` · `lifecycle-contract.md` §자산 매핑 매트릭스 · `sp-conversion-policy.md` · ADR-CHAIN-014 · DEC-2026-05-28-db-assets-always-on.

## 1. 왜 필요한가

사내 legacy paradigm (특히 Spring 4.x + iBATIS / mainframe 기원 RDBMS-heavy 시스템) 의 비즈니스 로직은 **3 layer 분포**:

| Layer | 위치 | 정적 분석 가능성 |
|---|---|---|
| (a) Java app | Controller / Service / DAO | △ 부분 (codegraph Java ⭐⭐⭐ / 의미 추론 한계) |
| (b) ORM / DAO mapper | iBATIS sqlMap XML / MyBatis XML / Annotation | ❌ string literal 의미 추론 불가 (DEC-2026-05-28-codegraph-probe-결과) |
| (c) **DB 자산** | Tables DDL / Views / Functions / Stored Procedures | **✅ 정적 분석 가능** (SQL 파일이라 AST parse) |

analysis 입력에서 (c) layer 누락 시 **비즈니스 로직 일부 누락 = analysis 부실** (특히 SP 안에 핵심 정산/배치 로직이 있는 paradigm). poc-17 첫 작업 plan 에서 사용자 결단:

> "내가 준 데이터 베이스 자료도 다 고려 되어 있는건가?"

→ 본 정책 신설 trigger. DB 자산을 **모든 stage 입력 자산 명시** 의무화 (누락 = 사용자 결단 의무).

## 2. DB 자산 종류 (의무 명세)

| 자산 | 형식 | 역할 | 정적 분석 |
|---|---|---|---|
| **Tables DDL** | `*.sql` (CREATE TABLE) | 데이터 모델 / 컬럼 / 제약 / 인덱스 | ✅ schema parse |
| **Views** | `*.sql` (CREATE VIEW) | 뷰 정의 (집계 / 조인 / 비즈니스 의미) | ✅ SELECT body parse |
| **Functions** | `*.sql` (CREATE FUNCTION) | 재사용 함수 (날짜 / 환산 / 조회 보조) | ✅ body parse |
| **Stored Procedures** | `*.sql` (CREATE PROCEDURE) | ★ 비즈니스 로직 일부 (정산 / 배치 / 마이그레이션) | ✅ body parse + ★ **sp-conversion-policy.md 분류 의무** |
| **ERD** | `*.erd` / `*.erm` / Visual Paradigm / DBeaver 등 | 엔티티 관계 다이어그램 | ✅ 의미 부 (사람 / 도구) |
| **Migration scripts** | Liquibase / Flyway / 자체 sql | DB schema 진화 이력 | ✅ history parse |
| **도메인 노트** | `*.txt` / `*.md` (사용자 작성) | known intent / known bug / domain expert 컨텍스트 | ★ **characterization phase 4.7 oracle 자격** |

## 3. Stage 별 입력 의무 매트릭스

| Stage | DB 자산 입력 | 책임 |
|---|---|---|
| **analysis Phase 1 (1회 baseline)** | 전체 (Tables + Views + Functions + SP + ERD + 도메인 노트) | `analysis-input-collection` + `analysis-from-plan-doc` (도메인 노트) — analysis-agent 의무 |
| **scope chain 1 discovery** | scope 관련 DB 자산만 (`related_artifacts` 역인덱스) | discovery-agent / `discovery-from-analysis-output` |
| **scope chain 2 spec** | DB schema 변경 사항 명시 (신규 stack schema 매핑 draft) | spec-agent |
| **scope chain 3 plan** | ★ SP/Function 전환 결단 의무 (sp-conversion-policy.md L.2 α/β/γ/δ) | plan-agent + ADR 등록 |
| **scope chain 4 test** | test fixture DB schema 의무 (test DB / mock / in-memory) | test-agent |
| **scope chain 5 implement** | 신규 stack DB schema migration script 산출 + 기존↔신규 1:1 매핑 | implement-agent |

## 4. baseline-delta 운영 통합

- **canonical global `.aimd/output/`** 에 DB 자산 분석 산출물 등록:
  - `.aimd/output/schema/` — Tables 정리
  - `.aimd/output/stored-procedures/` — SP 정적 분석 (★ 신설)
  - `.aimd/output/functions/` — Functions 정리 (★ 신설)
  - `.aimd/output/erd/` — ERD parse 결과 + 양 axis (전체 + scope focus)
  - `.aimd/output/business-rules/` — Java + sqlMap + SP/Function 통합 BR
- **scope `related_artifacts` 역인덱스** 에 DB 자산 link 의무:
  - `db_tables[]` — 관련 테이블 list
  - `db_procedures[]` — 관련 SP list (+ 분류 α/β/γ/δ)
  - `db_functions[]` — 관련 Function list
  - `db_views[]` — 관련 View list
- **drift 감지**: legacy DB 변경 (Table column / SP body / Function) → canonical global 부분 갱신 + 영향 scope drift 표지 (`chain-driver sync`)

## 5. schema 영향 (carry — work-unit-manifest.schema.json)

`schemas/work-unit-manifest.schema.json` 의 `related_artifacts` 에 DB 자산 4 필드 추가 의무:

```json
{
  "related_artifacts": {
    "type": "object",
    "properties": {
      "business_rules": { "type": "array", "items": { "type": "string" } },
      "endpoints": { "type": "array", "items": { "type": "string" } },
      "domain_entities": { "type": "array", "items": { "type": "string" } },
      "antipatterns": { "type": "array", "items": { "type": "string" } },
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
    }
  }
}
```

(★ `sp_conversion_class` 는 plan stage 진입 시 채워짐 / discovery stage 까지는 nullable)

## 6. lifecycle-contract.md §자산 매핑 매트릭스 갱신

기존 9 row × 5 column matrix 에 **DB axis** 추가 (별도 행 또는 cross-cut row):

| Stage | Agent | Skill | Hook | Tool / Validator | **★ DB 자산 입력** |
|---|---|---|---|---|---|
| analysis | analysis-agent | analysis-from-* + analysis-input-collection | SessionStart | drift / schema / spec-link / spectral | **★ 전체 DB 자산 의무** |
| discovery | discovery-agent | discovery-from-* | PreToolUse / Stop(gate-1) | discovery-extraction / br-cross | **★ scope 관련 DB 자산** |
| spec | spec-agent | 3 spec skill | PostToolUse | chain-coverage / spec-link | DB schema 변경 사항 |
| plan | plan-agent | 3 plan skill | PreToolUse / Stop(gate-3) | plan-coverage | ★ **SP 전환 결단 의무** |
| test | test-agent | 4 test skill | PreToolUse / Stop(RED) | test-impl-pass / spec-test | test fixture DB schema |
| implement | implement-agent | 4 implement skill | PreToolUse / Stop(GREEN) | test-impl-pass / static-runner | 신규 stack schema migration |

## 7. 70~80% / §3-A axis 정합

본 정책은 **process cadence + 입력 완전성** 의무. 자동화율 axis 변동 없음:
- analysis §3-A axis 는 paradigm 종속 (Spring 4.1+iBATIS 2 ~53~55%) — DB 자산이 입력에 추가되면 sub-axis (SP/Function 정적 분석) 가능성 ↑
- chain harness 70~80% axis 는 5 gate 통과율 — DB 자산 입력 완전성 ↑ → gate ratchet 정합도 ↑ (간접 기여)

**core fact**: DB 자산 누락은 §3-A axis 의 분모 자체 줄어드는 효과 (전체 비즈니스 로직 측정에서 일부 누락). 본 정책 = 분모 정합 의무.

## 8. 사례 (poc-17 ifrs/car / 첫 적용)

| DB 자산 | 갯수 | 처리 |
|---|---|---|
| Tables DDL (TB_CAR_*) | 5 | analysis Phase 3 db-schema 입력 ✅ |
| Functions (fn_Get_CarUserListView*) | 2 | analysis Phase 4 business-logic 보조 ✅ |
| Stored Procedures (자체) | 0 | car 비종속 — 적용 없음 |
| Stored Procedures (외부 호출) | 1 (`SGERP.dbo.SG_SACSlipRowCarManagementIFQuery`) | **γ 분류 (외부 시스템 SP — 보존 + thin wrapper)** / 화면 4 차량비용산출 |
| ERD | 2 (car.erd 59KB + ifrs.erd 188KB cross-ref) | analysis Phase 3+5 입력 ✅ |
| 도메인 노트 (`Develop_Issue.txt`) | 1 (408B / 소수점 2자리 paradigm) | phase 4.7 characterization known intent oracle ✅ |

→ car 도메인 = DB 자산 always-on 정책 첫 live 적용 사례. SP 전환 부담 사실상 0 (γ 1건 자명).

## 9. 인용

- 사용자 명시 — 2026-05-28 / poc-17 ifrs/car plan 결단
- `methodology-spec/baseline-delta-operating-model.md` (canonical global / scope delta)
- `methodology-spec/sp-conversion-policy.md` (SP 4 분류 α/β/γ/δ)
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X (R1' sub-axis)
- `schemas/work-unit-manifest.schema.json` (related_artifacts 갱신 carry)
- `tools/chain-driver/` (`sync` 명령 / drift cascade)
- DEC-2026-05-28-db-assets-always-on
- ADR-CHAIN-014-db-assets-always-on

# DEC-2026-05-28-db-assets-always-on

> ★ poc-17 dogfooding 결단 — DB 자산 (Tables / Views / Functions / Stored Procedures / ERD / 도메인 노트) 은 analysis baseline 부터 implement 까지 모든 stage 입력에 항상 명시 첨부 의무.

**일자**: 2026-05-28 (poc-17 ifrs/car migration Phase 0)
**카테고리**: paradigm / 입력 자산 / R1' sub-axis 본격 명문화
**상태**: 승인 — 사용자 명시
**연관 ADR**: ADR-CHAIN-014-db-assets-always-on
**연관 명세**: methodology-spec/db-assets-always-on.md (SSOT)
**연관 PoC**: poc-17-ifrs-car-migration (★ 첫 live 적용 / 외부 격리 작업)

## 1. trigger — 사용자 명시

poc-17 plan 작성 진행 중:

> "내가 준 데이터 베이스 자료도 다 고려 되어 있는건가?"
> (사용자 — 2026-05-28 / 본 방법론이 ifrs 의 IFRS_split / ERD / Develop_Issue.txt 등 DB 자료를 plan 에 반영했는지 확인)

조사 결과 plan 의 Phase 1 입력 자산 명세에서 DB 자산 (IFRS_split/ 의 Tables 180 + Functions 11 + SP 46 + ifrs.erd 188KB + car.erd 59KB + Develop_Issue.txt) 모두 누락. plan 갱신 + 사용자 추가 명시:

> "데이터 베이스 정보 항상 챙길수 있도록 해줘"

→ 본 결단 신설 trigger.

## 2. 핵심 사실 (legacy paradigm 의 비즈니스 로직 3 layer)

| Layer | 위치 | 정적 분석 |
|---|---|---|
| (a) Java app | Controller / Service / DAO | △ 부분 |
| (b) ORM / DAO mapper | iBATIS sqlMap XML | ❌ (DEC-2026-05-28-codegraph-probe-결과) |
| (c) **DB 자산** | Tables / Views / Functions / SP | **✅ 정적 분석** |

→ (c) 누락 = 비즈니스 로직 일부 누락 = §3-A axis 분모 자체 줄어드는 효과. 본 방법론의 analysis 입력 명세에 (c) 명문화 부재 = 결함.

## 3. 결단 본격 — DB 자산 always-on

### 3.1 의무 적용 stage (6개)
| Stage | DB 자산 입력 |
|---|---|
| analysis Phase 1 (1회) | 전체 (Tables + Views + Functions + SP + ERD + 도메인 노트) |
| discovery (chain 1) | scope 관련 DB 자산 (related_artifacts 역인덱스) |
| spec (chain 2) | DB schema 변경 사항 |
| plan (chain 3) | SP/Function 전환 결단 (DEC-2026-05-28-sp-conversion-policy cascade) |
| test (chain 4) | test fixture DB schema |
| implement (chain 5) | 신규 stack DB migration script + 1:1 매핑 |

### 3.2 DB 자산 7종 정의
- Tables DDL / Views / Functions / Stored Procedures / ERD / Migration scripts / 도메인 노트

### 3.3 canonical global 산출물 디렉토리 (신설)
- `.aimd/output/stored-procedures/` (신설)
- `.aimd/output/functions/` (신설)
- 기존: `.aimd/output/{schema,erd,business-rules,domain}/` 활용

### 3.4 work-unit-manifest 스키마 갱신 (carry)
`schemas/work-unit-manifest.schema.json` `related_artifacts` 에 4 필드:
- `db_tables[]`
- `db_procedures[]` (with `sp_conversion_class` enum / plan stage 채움)
- `db_functions[]`
- `db_views[]`

## 4. carry (자산화 작업 list)

| # | 자산 | 작업 |
|---|---|---|
| 1 | methodology-spec/db-assets-always-on.md | ✅ 신설 (본 결단 SSOT) |
| 2 | methodology-spec/lifecycle-contract.md | §자산 매핑 매트릭스 DB axis 추가 (carry) |
| 3 | methodology-spec/baseline-delta-operating-model.md | canonical global 디렉토리 신설 명시 (carry) |
| 4 | schemas/work-unit-manifest.schema.json | related_artifacts.db_* 4 필드 추가 (carry) |
| 5 | ADR-CHAIN-014-db-assets-always-on | ✅ 신설 |
| 6 | CHANGELOG.md | v11.x MINOR 또는 v12.0 결단 (carry) |
| 7 | poc-17 PROGRESS-poc-17-dogfooding.md | ✅ M.2 axis 1 측정 |

## 5. 영향 (Consequences)

### 본격 효과
- analysis 입력 완전성 ↑
- 사용자 결단 부담 사전 식별 (DB 자산 누락 → 의무)
- ADR-CHAIN-015 (SP 전환 정책) cascade 가능

### Trade-off
- analysis Phase 1 입력 자산 list 본격 (시간 부담 ↑)
- chain 3 plan stage SP 분류 추가 결단
- canonical global 디렉토리 신설 (`stored-procedures/` `functions/`)

## 6. 인용

- 사용자 명시 — 2026-05-28 / poc-17 plan 결단 cascade
- ADR-CHAIN-014-db-assets-always-on
- methodology-spec/db-assets-always-on.md (SSOT)
- methodology-spec/sp-conversion-policy.md (cascade)
- methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md §X (R1' sub-axis 정합)
- DEC-2026-05-28-codegraph-probe-결과 (iBATIS layer ❌ / SP·Function ✅)
- memory [[feedback_db_always_on_policy]]

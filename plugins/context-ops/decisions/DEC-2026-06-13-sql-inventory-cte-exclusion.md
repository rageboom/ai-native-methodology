# DEC-2026-06-13 — sql-inventory-extractor CTE 오탐 제외 (F1 / dogfood-found / PATCH v0.46.1)

- **일자**: 2026-06-13 (본체 PATCH v0.46.1 / 결정론 tool 정확성 버그 수정 — backward-compat / schema·exit-code 무변경)
- **카테고리**: 본체 버그 수정 (analysis sql-inventory / dogfood-found) — CTE(공통 테이블 식) 별칭이 dependent_tables 오포착
- **상태**: 승인·시행 (carry ④ ep-be-gea BC-ISSUE-ACM analysis dogfood 발견 F1 → 사용자 "f1" 결단)
- **관련**: `DEC-2026-06-12-sql-inventory-extractor`(§0 MANDATORY 배선 모) · STATUS carry ④ · memory `feedback_chain_driver_deterministic_axis`(결정론 tool / LLM 판단 0) · `feedback_self_recorded_fact_validation`(agent 자기보고 → 실측 검증) · `feedback_diagnose_before_design_check_existing` · `feedback_quality_priority` · `feedback_no_static_tool_simulation`(real tool)

---

## 1. 배경 (dogfood 노출)

ep-be-gea 출입통제(BC-ISSUE-ACM) analysis dogfood 에서 `sql-inventory-extractor` 의 `dependent_tables` 후보에 **CTE 별칭이 혼입**(`WITH <name> AS (` 로 정의된 query-local 식별자를 실테이블로 오포착). 실측: 8 bare candidate 중 6(Aggre/base_range/GROUPS/USERS/USER_LIST/di_agg)이 mapper XML 내 `WITH … AS (` 정의 확인 = 실테이블 아님.

## 2. diagnose-before-design (self-recorded-fact-validation)

agent 자기보고를 액면 수용 ❌ → 실측:
- **구조 확인**: 일부 CTE 는 statement 본문 inline, 일부는 `<sql>` fragment 정의 + `<include>` 참조, **일부는 `<include>` 안 한 statement 가 런타임 조합으로 참조**(searchBoEntranceAuthorityRequestChipsCount = `FROM base_range` 인데 그 정의 fragment 미include) → per-statement/include 해소로 불충분 입증.
- **결론**: MyBatis 는 CTE 를 파일 내 여러 statement/fragment 로 조합 → **파일 단위 CTE 이름 수집**이 정답.

## 3. 결정 (구현 / 결정론 / LLM 판단 0)

`extract.js`:
- `collectCteNames(text)` — `WITH [RECURSIVE] name [(cols)] AS (` 및 체인 `, name [(cols)] AS (` 수집(col-list·RECURSIVE·다중바이트 무관 / `<식별자> AS (` = **CTE 전용 구문** = 실테이블엔 부재).
- `extractFromXml` 가 **파일 전체에서 1회 `fileCteNames` 수집** → 모든 statement 의 `extractTables(body, fileCteNames)` 가 FROM/JOIN candidate 중 CTE 이름(bare, 소문자 비교) 제외.
- **안전성 증명**: 실테이블은 schema-qualified(점 포함 `SCHEMA.dbo.X`) → bare CTE 이름과 절대 충돌 불가 → 실테이블 누락 0 (제외는 provable CTE 한정).

## 4. §8.1 corroboration (과적합 회피)

- **issue-acm**: CTE 6종 제거 / 실테이블 21 유지.
- **WLFR(독립 도메인)**: fixed extractor 실테이블 **83 = committed 83 (누락 0)** = 실테이블 손실 0 empirical 입증.
- CTE 제외 = paradigm-grounded(CTE 는 표준 SQL / `X AS (`=전용 구문) → 1-domain 과적합 아님.

## 5. 검증 (실측)

- `sql-inventory-extractor` **11 test**(신규 CTE 4: inline 단일·체인·col-list / RECURSIVE+자기참조 / fragment-defined+include / 비-CTE false-positive 가드[CAST AS·컬럼 alias 오제외 0]).
- 실 dogfood: 수정 tool 재추출 → issue-acm 후보 29→23(CTE 6 제거 / 113 stmt 불변) + enriched reconcile(CTE 참조 10 제거 / LLM 컬럼 보존 / schema-validator valid). ep-be-gea `ad92994189`(GHE pending).
- release-readiness **42/42**(신 check 무 / criteria_total 무변 — 11 extractor test 는 workspace-test #11 포함).

## 6. carry / 비범위

- **emp_distinct·EP_BE_COMMON** (issue-acm 잔존 2 bare) = **비-CTE candidate noise**(file-wide col-list-aware 수집이 CTE 아님 확인) → 별도 / `dependent_tables_are_candidates:true` 플래그 유지.
- ~~TVF·키워드 noise~~ → **v0.46.2 해소 (§7)**.
- **table alias·DB-name·ambiguous noise** = 잔존 carry (§7 분류 참조).
- fragment 내 실테이블 미해석(`<include>` carry) = 기존 한계 유지(본 수정은 CTE 이름 제외만 / fragment 테이블 추출 별개).

## 7. v0.46.2 — TVF + SQL 키워드 noise 제외 (PATCH / 2026-06-13)

§6 carry "TVF·키워드 noise" 시행. 전 core mapper(2629 stmt) bare candidate **전수 분류**(diagnose / 자기보고 액면 수용 ❌):

| class | items | occ | 처분 |
|---|---|---|---|
| **TVF** (`FROM\|JOIN name(`) | OPENJSON(74)·STRING_SPLIT(7) | 81 | **제외** — 식별자 **바로 뒤(공백 없이) `(`** = 함수 호출(table-valued function) = 테이블 아님. **FROM/JOIN 한정**(⚠ `INSERT INTO t(col,col)` 컬럼리스트는 실테이블 → INTO/UPDATE 미적용). list 무관 범용 규칙. |
| **SQL 키워드** | SET(9 / `UPDATE SET`=MERGE)·FROM(1 / `JOIN FROM`) | 10 | **제외** — TABLE_STOPWORDS 추가. |
| table alias | T1·A·CAL·SCTB·RES·R·A1·B1·SAL | ~13 | **carry** — SQL Server `UPDATE <alias> SET … FROM <table> <alias>` 의 alias. 실테이블은 FROM 으로 독립 캡처됨(noise 영향 작음) / 안전 제외엔 per-stmt alias 검출 필요 → 별도. |
| DB-name under-capture | EP_BE_COMMON·EP_BE_GEA_USER | 7 | **carry** — cross-DB 참조(`DB\n.dbo.TABLE`)가 줄바꿈으로 분할돼 DB명만 캡처 = under-capture(noise 아닌 불완전 / 별도 fix). |
| ambiguous | emp_distinct·BASE_KEY·dbo | 7 | **carry** — 실테이블/CTE/derived 판별 불가 → no-false-positive 보수 유지(후보 플래그). |

- **실테이블 누락 0 (증명+실측)**: TVF 규칙=즉시 `(` 만(실테이블 hint `FROM t (NOLOCK)`=공백 있어 미해당) + FROM/JOIN 한정(INSERT 컬럼리스트 보호). 전 core 재추출 **실테이블 417=417 (0 loss)** + OPENJSON/STRING_SPLIT/SET/FROM 전부 제거.
- **§8.1 corroboration**: TVF = **7 도메인**(wlfr/cal/resve/issue/reqmng/event/biztrip) 분포 = 단일 과적합 아님 / paradigm-grounded(SQL: `FROM func()`=TVF·SET/FROM=키워드).
- 검증: sql-inventory-extractor **15 test**(TVF 4 신규: OPENJSON·STRING_SPLIT 제외 / INSERT INTO t(col) 가드 / FROM t (NOLOCK) 공백 hint 가드 / UPDATE SET 키워드) / RR 42/42 / backward-compat. issue-acm 무영향(잔존 emp_distinct·EP_BE_COMMON=TVF 아님)=ep-be-gea regen 불요.

> **보안**: 본 DEC = 본체 tool 기술만 / 사내 식별자 0(BC-ISSUE-ACM·base_range·OPENJSON 등 = 마스킹 codename·SQL 일반어). 노출 컨텍스트 산출물 = ep-be-gea GHE only.

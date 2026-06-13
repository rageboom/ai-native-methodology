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

## 8. v0.46.3 — 잔여 bare candidate 4 fix (UPDATE-alias·bracket·SQL주석 CTE·mid-token / PATCH / 2026-06-13)

§7 carry "table alias·DB-name·ambiguous" 시행. **병렬 검증 패널 `wf_ef3688c0-926`**(7 finding diagnose-before-design / self-recorded-fact-validation)이 §7 의 carry 3종을 **전부 safe-fix 가능**으로 판정(+ 내 가설 1건 교정). 4 fix:

1. **UPDATE-alias** (real / T1·A·CAL·SCTB·RES·R·A1·B1·SAL): SQL Server `UPDATE <alias> SET … FROM <table> <alias>` 의 alias 가 fake table 캡처. `collectTrailingAliases`(FROM/JOIN 뒤 trailing alias / SQL_RESERVED keyword-guard) → `kw==='UPDATE' && dotless && aliasSet.has` 만 제외. **실테이블은 FROM 으로 독립 캡처 / 점 포함·non-alias bare 무관 → 누락 0**.
2. **bracket-quoted under-capture** (내 가설 교정): EP_BE_COMMON 등은 ~~줄바꿈 분할~~ 이 아니라 **`[EP_BE_COMMON].[dbo].[TB]`**(charclass 가 `]` 제외라 DB명만 캡처). 캡처 charclass 에 `[ ]` 추가 → bracket strip 후 full 복원 = **monotonic recovery**(실테이블 늘기만).
3. **SQL 주석 끊긴 CTE** (emp_distinct·BASE_KEY): `,/* 주석 */ name AS (` 의 SQL `/* */` 주석이 CTE 체인 끊음 → `blankComments` 가 XML 주석만 blank 했던 것 → SQL `/* */` 도 blank → collectCteNames 가 포착.
4. **mid-token 동적** (`EP_BE_COMMON.dbo.${t}` → `EP_BE_COMMON.dbo.$` 누출): 캡처 끝 직후 `{` → skip.

- **실테이블 누락 0 (rigorous before/after 실측 / self-recorded-fact-validation)**: 전 core 431→416. **LOST 16 = 전부 noise**(alias 9 + CTE 2 + DB-name 3 + `.dbo.$` 동적 1 + trailing-dot artifact 1) / **진짜 실테이블 손실 0** / **GAINED 1 = 실테이블 복원**(`dbo.ADM_INLOAN_REPAY_REQ_LIST`). bare candidate **18→0**.
- 검증: sql-inventory-extractor **20 test**(4 신규: bracket 복원 / SQL주석 CTE / mid-token skip / UPDATE-alias + 평범 UPDATE bare-realtable 유지 가드) / RR 42/42 / backward-compat. issue-acm regen(후보 23→22·bare0·EP_BE_COMMON.dbo.TB_BASE_USER 복원 / ep-be-gea `f03be96d03`).
- **§8.1**: bracket-quoted `[x].[y]`·SQL `/* */`·T-SQL UPDATE…FROM = paradigm-grounded(표준 T-SQL/ANSI 구문) / 단, 실 drift sample 은 ep-be-gea 단일 repo = deterministic 정확성 fix(HARD-gate flip 아님 / CTE 선례 동형).

> **보안**: 본 DEC = 본체 tool 기술만 / 사내 식별자 0(BC-ISSUE-ACM·base_range·OPENJSON 등 = 마스킹 codename·SQL 일반어). 노출 컨텍스트 산출물 = ep-be-gea GHE only.

## 9. v0.46.4 — FROM-less T-SQL DELETE dependent_tables 추출 (PATCH / 2026-06-13)

carry ④ req 패밀리 **visitprkng(방문주차) 부분추가 analysis dogfood** 노출: `extractTables` 정규식 키워드(`FROM|JOIN|INTO|UPDATE`)에 **DELETE 부재** → T-SQL FROM-less `DELETE <table> WHERE …`(MSSQL 은 FROM 선택적)의 dependent_tables 미추출(빈 후보). `DELETE FROM t` 는 FROM 규칙이 잡지만 FROM 없는 형은 누락.

- **diagnose-before-design**: analysis-agent 가 enum 밖 carry_flags(`extractor-table-undetected`)로 표현하려 한 것이 신호. 적대 검증 패널(`wf_cd973abc-9f9` / 3 verifier)이 schema 위반으로 적발 + 갭 실재 확인(BR grounding pass·무날조 0 / sql·openapi accuracy pass). CTE/TVF/UPDATE-alias §1·7·8 선례 동형 = 결정론 parsing 정확성 갭.
- **결정 (구현 / 결정론 / LLM 판단 0)**: DELETE 를 공용 alternation 에 넣으면 `DELETE FROM t` 를 한 매치로 소비해 t 를 놓치는 regex 상호작용 → **별도 패스 + negative lookahead** `\bDELETE\s+(?!FROM\b|TOP\b)(<table>)`. 가드: ① `DELETE FROM t`(FROM 규칙이 t)·`DELETE TOP (n)`(행수제한) = lookahead 제외 ② aliased delete `DELETE <alias> FROM <table>`(dotless 토큰 직후 FROM) = alias skip(FROM 규칙이 실테이블) ③ `TOP` stopword 추가(`UPDATE TOP`/`DELETE TOP` 잠재 오탐 제거). 공통 후보 정제(bracket strip·동적·stopword·CTE)는 `consider` 헬퍼로 양 패스 공유.
- **실테이블 누락 0 (rigorous before/after / self-recorded-fact-validation / 전 core 2629 stmt)**: union **416→416**(GAINED 0 / LOST 0 = 오탐 0·실테이블 손실 0). 가치는 per-record — 398 DELETE record 중 빈 dependent_tables **141→3**(138 해소 + `<update>`-wrap FROM-less DELETE 1건 실테이블 획득 / 잔여 3 = TRUNCATE·reset 비-DELETE 형 정직 carry). non-DELETE record 1건만 변화(=실테이블 GAINED·LOST 0).
- **검증**: sql-inventory-extractor **24 test**(4 신규: FROM-less dotted / bare + `DELETE FROM` regression / aliased delete / `DELETE TOP`) / RR 42/42 / backward-compat. visitprkng leaf regen(6 DELETE dependent_tables 결정론 해소 → carry_flags `extractor-table-undetected` 소멸).
- **§8.1**: FROM-less DELETE·`DELETE TOP`·aliased delete = 표준 T-SQL 구문 = paradigm-grounded / 실 drift sample ep-be-gea 단일 repo이나 138 record(다수 BC) 내부 corroboration = deterministic 정확성 fix(HARD-gate flip 아님 / CTE·TVF·4-fix 선례 동형).

> **보안**: 본 §9 = 본체 tool 기술만 / 사내 식별자 0(visitprkng·deleteX = 마스킹 codename / 실 테이블명·file:line 미전사 / 테스트 fixture 합성명). 노출 컨텍스트 산출물 = ep-be-gea GHE only.

# DEC-2026-06-12-sql-inventory-extractor

> **상태: 시행됨 — option ① 채택 / 도구+테스트+dogfood 완료 (2026-06-12 / 사용자 "권고대로 구현"). 본체 격상(MANDATORY chain 배선·skill §1–4 reword·plugin.json bump·workspace 등록)은 §8.1 ≥2 도메인 corroboration 후로 deferred.** `DEC-2026-06-12-parallel-bc-accumulator-rollup` §부수 의 독립 follow-on bullet 을 자체 ADR 로 승격. ep-be-gea BC-REQMNG dogfood 에서 노출된 **결정론-추출기 부재** 갭 해소.

**결단(제안)**: `analysis-sql-inventory` 스킬은 5/11 컬럼을 "자동 추출(✅)"로 명시하고 §1–4 에 **정확한 grep -E 레시피**까지 박제하지만, 그 레시피를 **실행하는 결정론 도구가 tools/ 에 없다**(`sql-inventory-validator` = 검증만 / 추출기 없음). 따라서 매 adopter 런이 grep 5종을 **LLM 에이전트가 손으로 재발행** = 비결정·고비용. 스킬에 이미 SSOT 로 존재하는 그 레시피를 그대로 실행하는 `tools/sql-inventory-extractor` 를 신설해 **5 auto 컬럼 + `raw-grep.txt` 를 결정론으로 산출**하고, LLM 은 판단 6 컬럼만 채우게 한다.

**작성일**: 2026-06-12 (BC-REQMNG 163 executable statement / 10 mapper XML 을 LLM 에이전트 6개로 읽어 추출 — 고비용·비결정의 직접 증거).

## 맥락 — diagnose-before-design (기존 자산 실측)

- **스킬 주장**: `skills/analysis-sql-inventory/SKILL.md:129` = `auto_ratio_total_11: '5/11 = 45.5%'`. auto 컬럼 5종 명시(L118-125): `sql_id`·`mapper_xml`·`statement_type`·`dynamic_branch`·`dependent_tables`. §1(mapper XML grep)·§2(statement_type grep)·§3(dynamic_branch grep)·§4(dependent_tables FROM/JOIN grep) = **완성된 grep -E 레시피가 이미 문서에 존재**.
- **실측 갭**: `tools/` 33개 中 `sql-inventory-validator`(11 컬럼·enum·auto_ratio 형식 **검증**)만 존재. **추출(produce) 도구 0**. 즉 "auto-extracted" 는 *형식상 자동화 가능*을 뜻할 뿐, 실행 주체 = 매 런의 LLM. (`raw-grep.txt` = SKILL.md:162 "1차 산출" = 추출기가 내놓아야 할 바로 그 산출물인데 생성자 부재.)
- **비용·신뢰 증거(REQMNG)**: 163 stmt(select 86/insert 21/update 39/delete 17 · 10 XML)를 결정론 grep 1패스가 아니라 **LLM 에이전트 6개**로 분담 추출. 5 auto 컬럼조차 LLM 재유도 = (1) 비결정(동일 소스 재실행 시 drift 가능) (2) 토큰 고비용 (3) `sql-inventory-validator` 의 auto_ratio≥0.50 게이트가 **LLM 자기보고 형식**만 보고 통과 = 결정론 보장 0.

## 결정 후보 (사용자 3택)

1. **standalone tool `tools/sql-inventory-extractor/` 신설 (권고)** — `scope-carve`·`codegraph-runner` standalone-tool 선례. 입력 = `<src>` 경로 + mapper glob. 엔진 = **SKILL.md §1–4 grep -E 레시피를 그대로 코드화**(신규 패턴 발명 ❌ = no-simulation / 스킬이 패턴 SSOT). 산출 = `raw-grep.txt`(결정론) + partial `sql-inventory.json`(5 auto 컬럼 채움 / 판단 6 컬럼=null placeholder). 스킬 §1–4 = "도구 호출"로 reword(레시피는 도구 spec 으로 이관 / breaking 0). LLM 은 §6·§7 판단 컬럼만.
2. **`sql-inventory-validator` 에 `--emit` 모드 흡수 (경량)** — 신규 도구 ❌ / 기존 검증기가 auto 컬럼을 추출도 하도록 확장. 비용 최소이나 validator(검증)와 extractor(생산) 책임 혼재 = single-responsibility 위배.
3. **현행 유지 + 한계 명문화** — 추출기 미신설, 스킬 §8 에 "auto 컬럼 = LLM-재유도(결정론 아님) / auto_ratio 게이트는 형식 검증일 뿐 추출 보장 ❌" 를 정직 명기만. 최소 비용 / 갭 미해소.

권고: **①** → **채택·시행**. 단 **결정론 경계 엄수** — 5 auto 컬럼만 도구 책임, 판단 6 컬럼(`business_meaning`·`called_from_screen`·`uc_link`·`intent_vs_bug_classification`·`confidence`·`carry_flags`)은 LLM/human 유지(가짜 자동화 금지).

## 시행 (2026-06-12 / `tools/sql-inventory-extractor`)

- **산출물**: `src/extract.js`(pure / SKILL §1–4 grep 레시피 코드화 — 신규 패턴 발명 ❌) + `src/cli.js`(scope-carve 동형: exit 0/2/3 / `--src` 부재=exit 3 no-simulation / `process.exit(0)` 회피) + `package.json` + `test/extract.test.js`(**7/7 GREEN**) + README. carve.js 동형 `result_hash`(timestamp 제외 sha256 / 재현성 witness) + `evidence_trust: real_tool`.
- **산출 형식**: `sql-inventory.auto.json`(`meta_status: auto_extracted_pending_enrichment` / 판단 6 컬럼 null = sql-inventory.schema PARTIAL 의도 / LLM 보강 후 sql-inventory.json 승격) + `raw-grep.txt`(1차 산출).
- **dogfood (BC-REQMNG 10 mapper XML)**: **163 executable statement = LLM 6-agent hand-extraction(163) 과 동수**. select 86·insert 21 **정확 일치**. **발견 #1**: delete/update 4-stmt 델타(tool delete 21·update 35 / hand 17·39) = 선언 `<delete>` 태그로 결정론 분류 → hand 가 의미로 update 처리한 **soft-delete 4건**(`<delete>` body=`UPDATE...SET`: FoResortReq·BoResortReq·BoResort.delete·deletePrice) 표면화 = `MC-REQMNG-DELETEPRICE-NOOP-001` corroborate. **발견 #2**: fragment 9 vs hand 6(tool 결정론 정확 / hand 오산 정정) · table 34 후보 vs hand 25(superset = LLM pruning). → **도구가 hand 보다 더 결정론적·AS-IS 충실** 실증.
- **무회귀**: 기존 파일 무수정(2 신규 디렉토리 additive). 의존 0(append-catalog 등 import 없음 — 자기완결).

## 결정론 경계 / 정직 한계 (§8.1 의 일부 — 과대주장 가드)

- **dependent_tables(FROM/JOIN regex)는 근사** — subquery·CTE·동적 테이블명(`${tableName}`)·`, ` 다중 FROM·schema-qualified 는 regex 한계. 추출 결과 = **후보(candidate)** 로 마킹, "exhaustive" 주장 ❌. LLM 검수 carry 의무.
- **statement_type** = `statementType="..."` 속성 직추출만 결정론. 속성 부재 시 PREPARED 기본값은 MyBatis 규약 **추론(heuristic)** → confidence 하향 마킹.
- **dynamic_branch** = 태그 enum grep(`<if|choose|foreach|where|set|trim|bind>` 등) 카운트는 결정론이나 **분기 의미**는 LLM.
- **no-simulation**: 도구는 실제 grep 만 실행 / 0건 시 빈 산출+정직, 날조 ❌. grep 불가 환경(파일 부재)=NOT_CERTIFIED 마킹(`DEC-2026-06-12-parallel-bc-accumulator-rollup` §부수 validator-absent fallback 동형).
- **1 datapoint(REQMNG)** — propose-only. MANDATORY chain 배선·plugin.json bump = **≥2 도메인 corroboration 후**(stack 다양성: MyBatis XML 외 jdbcTemplate/@Query/Prisma `$queryRaw` 도 §1 grep 대상이나 REQMNG 는 MyBatis 단일 = iBATIS/MyBatis 만 실증).

## relates to

- **DEC-2026-06-12-parallel-bc-accumulator-rollup** (모 / 본 ADR = 그 §부수 "sql-inventory-extractor 부재" bullet 의 승격) · DEC-2026-06-12-artifact-zone(`domains/<BC>/sql-inventory/` 산출 경로)
- DEC-2026-06-12-golf-chain-validator-wiring · DEC-2026-06-12-resve-multidomain-corroboration (동일 ep-be-gea campaign / validator 배선·sub-agent 추출 신뢰 방증)
- DEC-2026-05-28-codegraph-probe-결과 §4.2 (결정론 axis = 도구 / 판단 axis = LLM 경계 원칙) · feedback `diagnose_before_design_check_existing`(스킬에 레시피 선존 → 발명 아닌 코드화) · feedback `no_static_tool_simulation`(실 grep only)
- `skills/analysis-sql-inventory/SKILL.md` §1–4(레시피 SSOT / 도구 spec 이관 대상) · §8 extraction_automation(auto_ratio 게이트 = 형식→결정론 보강 대상) · `tools/sql-inventory-validator`(자매 / 검증 책임) · 신규 `tools/sql-inventory-extractor`(생산 책임)

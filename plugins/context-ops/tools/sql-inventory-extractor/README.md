# sql-inventory-extractor

`analysis-sql-inventory` SKILL §1–4 의 grep -E 레시피를 **그대로 코드화한 결정론 추출기** (DEC-2026-06-12-sql-inventory-extractor). MyBatis 3 / iBATIS 2 mapper XML 에서 SQL 인벤토리의 **auto 5 컬럼**을 결정론으로 산출한다. `sql-inventory-validator`(검증)의 **자매 도구**(생산).

## 왜

스킬은 5/11 컬럼을 "auto-extracted ✅"로 명시하고 grep 레시피까지 박제하지만, 그걸 **실행하는 도구가 없어** 매 런 LLM 이 grep 을 손으로 재발행했다(비결정·고비용). 본 도구가 그 레시피를 1패스로 돌린다.

## 결정론 경계 (중요)

- **도구가 채우는 auto 5 컬럼**: `sql_id` · `mapper_xml`(+ `mapper_xml_line`) · `statement_type` · `dynamic_branch` · `dependent_tables`.
- **도구가 절대 안 채우는 판단 6 컬럼**(null placeholder): `called_from_screen` · `business_meaning` · `uc_link` · `intent_vs_bug_classification` · `confidence` · `carry_flags`. → **LLM/human 보강 의무**(가짜 자동화 금지).
- **`dependent_tables` = 후보(candidate)**, exhaustive ❌. FROM/JOIN/INTO/UPDATE regex 한계 — subquery·CTE·동적 테이블명(`${...}`)·`<include>` fragment 내 테이블은 누락 가능. `dependent_tables_are_candidates: true` + `<include>` 사용 시 `tables_note` 로 정직 표기.
- **`statement_type` 기본 PREPARED** = MyBatis 규약 **추론**(statementType 속성 부재 시). `<procedure>` / `{call}` / `EXEC` / `CALL` → CALLABLE.
- **`<sql>` fragment 는 비실행** → inventory 제외(`excluded_fragment_count` 만 카운트).

## 사용

```bash
node src/cli.js --src <dir> [--glob <substr>] [--rel-root <dir>] [--output <dir>] [--stdout]
```

- `--src` (필수): mapper XML 스캔 루트. 부재 시 **exit 3**(환경 부재 / no-simulation — LLM 추론 대체 ❌).
- `--glob`: 경로 부분문자열 필터(예: `/reqmng/`). mapper XML 자동판별(DOCTYPE/namespace) 후 추가 필터.
- `--rel-root`: `mapper_xml` 상대경로 기준(기본 `--src`). 프로젝트 루트 권장.
- `--output`: 산출 디렉토리(기본 `<src>/.ai-context/base`).

### exit code

- `0` 정상(0건이면 빈 산출 + 정직 메시지) / `2` usage / `3` `--src` 부재.

## 산출물

- **`sql-inventory.auto.json`** — `meta_status: auto_extracted_pending_enrichment`. sql-inventory.schema.json 에 **PARTIAL 정합**(판단 6 컬럼 null 의도). 분석가가 판단 컬럼 보강 → `sql-inventory.json` 으로 승격 → `sql-inventory-validator` 검증.
- **`raw-grep.txt`** — 1차 산출(SKILL.md:162). `<mapper_xml>:<line>:<statement open tag> [statement_type]`.

`evidence.result_hash` = timestamp 제외 결정론 payload 의 sha256(재현성 witness / 동일 입력 → 동일 hash). `evidence_trust: real_tool`.

## dogfood (ep-be-gea BC-REQMNG / 2026-06-12)

reqmng 10 mapper XML 대상 실행 결과 = **163 executable statement** — LLM 에이전트 6개 hand-extraction(163)과 **동수**. select 86 · insert 21 **정확 일치**. 단:

- **delete/update 4-stmt 델타**(tool delete 21·update 35 / hand delete 17·update 39): tool 은 선언된 `<delete>` **태그**로 결정론 분류 → hand 가 *의미*로 update 처리한 **soft-delete 4건**(`<delete>` 인데 body=`UPDATE...SET`: FoResortReq.delete·BoResortReq.delete·BoResort.delete·BoResort.deletePrice)을 표면화. AS-IS 충실 = `MC-REQMNG-DELETEPRICE-NOOP-001` corroborate.
- **fragment 9 vs hand 6**: tool 결정론(`<sql id>` 9개 실측)이 정확 — hand 오산 정정.
- **table 34 후보 vs hand 25**: 후보 superset(안전 방향) — LLM pruning 대상.

→ 도구가 hand 보다 **더 결정론적·충실**함이 실증. (단 1 datapoint / MyBatis 단일 → §8.1 propose-only.)

# DEC-2026-05-08-poc-06-sql-inventory-retrofit

> **카테고리**: methodology / 신규 deliverable #24 (SQL Inventory) corroboration #1 사실 확보 / PoC #06 retrofit / v2.2.0 본체 격상 자격 진입
> **상태**: 승인 ( corroboration #1 / Spring 4.1 + iBATIS 2 spectrum 첫 적용)
> **일자**: 2026-05-08
> **선행**: DEC-2026-05-07-poc-06-종결 (PoC #06 정식 등재) + DEC-2026-05-08-poc-07-prelim-신설 (PoC #07 진입 / source 차단)

---

## 1. 결단

신규 deliverable #24 (SQL Inventory) v2.2.0 본체 격상 자격 = **≥ 2 PoC isomorphic 충족** 위해 **PoC #06 exchange.xml 6 SQL 작업에 SQL Inventory 10 컬럼 retrofit 적용**.

**근거**: PoC #07 capital source 가용성 사용자 의뢰 대기 중 (filesystem scan 권한 제한 정합). 차단 우회 + 본 방법론 retrofit 패턴 (DEC-2026-05-07-poc-07-poc03-phase7-retrofit / PoC #03 phase 4.7 retrofit) mirror 로 corroboration #1 즉시 사실 확보 → PoC #07 capital 도착 시 corroboration #2 자연 충족 → §8.1 strict ≥ 2 PoC isomorphic 자격 자격.

**대안 고려 + 거절**: PoC #07 source 도착까지 대기 — Auto Mode 정합 ❌ + 사용자 "진행해줘" 명시 GO + 차단 우회 + 본 방법론 retrofit 패턴 정합.

## 2. ≥ 2 PoC corroboration 자격 사전 확보

| 자격                                                               | PoC #06 retrofit (corroboration #1)                 | PoC #07 capital (corroboration #2 / source 도착 시) | 종합           |
| ------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------- | -------------- |
| SQL Inventory 10 컬럼 적용                                         | ✅ 6 SQL 작업                                       | 대기 (다중책임 → ~30~50 SQL 예상)                   | 1 / 2          |
| 외부 6 컬럼 자동 추출 비율                                         | ✅ 4/6 = 66.7%                                      | ≥ 50% 자격 (예상)                                   | 자격           |
| 형식 정합 (10 컬럼 / extraction_automation / phase 4.7 cross-link) | ✅ 100%                                             | 형식 reuse 정합                                     |                |
| spectrum                                                           | Spring 4.1 + iBATIS 2 / 단일책임 (exchange 345 LOC) | Spring 4.1 + iBATIS 2 / 다중책임 (capital 3752 LOC) | isomorphic     |
| §8.1 strict 충족                                                   | (단독)                                              | (다른 모듈)                                         | ** 충족 자격** |

→ **신규 deliverable #24 v2.2.0 본체 격상 자격 사전 확보** (PoC #07 capital 종결 후 즉시 진입 가능).

## 3. PoC #06 SQL Inventory 산출

| 자산                  | 위치                                                                        | 상태                                                                                 |
| --------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| raw-grep 1차 산출     | `examples/poc-06-efiweb-exchange-spring41/sql-inventory/raw-grep.txt`       | ✅ Mapper id 6 + dynamic 1 + tables 3 + self_recognized 1 자동 추출                  |
| SQL Inventory 10 컬럼 | `examples/poc-06-efiweb-exchange-spring41/sql-inventory/sql-inventory.json` | ✅ 6 record + meta_confidence + extraction_automation + phase_4_7_corroboration_role |
| 사람 눈 markdown 표   | `examples/poc-06-efiweb-exchange-spring41/sql-inventory/sql-inventory.md`   | ✅ 10 컬럼 표 + 동적 분기 + SATD + 외부 호출 + corroboration #2 예상 비교            |

## 4. 측정 결과 (외부 6 컬럼 자동 추출 비율)

| 컬럼                  | 자동?              | 결과                                                                                                                                          |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. sql_id             | ✅ grep            | 6 entry (selectExchangeList / updateExchange / selectCheckExcRate / selectExchangeRate / insertExchangeRateMigration / selectDayExchangeList) |
| 2. mapper_xml         | ✅                 | exchange.xml                                                                                                                                  |
| 3. called_from_screen | ❌ 수동            | Controller → JSP 추적                                                                                                                         |
| 4. business_meaning   | ❌ 수동 (LLM ~70%) | 자연어 요약                                                                                                                                   |
| 5. dynamic_branch     | ✅ grep            | 1 iBATIS `<isNotEmpty>` + 14 SQL CASE WHEN                                                                                                    |
| 6. dependent_tables   | ✅ regex           | TB_CURRENCY / TB_EXCHANGE / TB_DAY_EXCHANGE                                                                                                   |

**자동 추출 비율 = 4/6 = 66.7%** ≥ 50% pass (사용자 D10 종결 자격 정합).

## 5. phase 4.7 cross-link 정합 (본 방법론 정합 강화 metric)

| 컬럼                            | phase 4.7 reference                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| 7. uc_link                      | UC-EXCHANGE-001~007 (planning-spec UC ↔ link)                                            |
| 8. intent_vs_bug_classification | intent-vs-bug.md §1~§3 (4분류 — 4 intent / 1 self_recognized / 1 ambiguous / 0 bug 단독) |
| 9. confidence                   | meta-confidence 단계 5 = 0.65~0.95                                                       |
| 10. carry_flags                 | DBA-read / proc-body / external_call_out_of_scope                                        |

본 추가 4 컬럼 (사용자 D9 결단) → phase 4.7 분류표 + planning-spec UC + meta-confidence + carry 와 cross-link 강화. 외부 6 컬럼 만으로는 ❌.

## 6. §8.1 strict 본체 격상 자격 (사용자 D11 결단 정합)

본 PoC #06 retrofit 단독 본체 격상 ❌:

| 자산                                                       | 본체 격상 자격                                      | trigger      |
| ---------------------------------------------------------- | --------------------------------------------------- | ------------ |
| `methodology-spec/deliverables/24-sql-inventory.md`        | PoC #06 + PoC #07 isomorphic 후                     | PoC #07 종결 |
| `schemas/sql-inventory.schema.json` ( 31번째)              | 동반                                                | PoC #07 종결 |
| `tools/sql-inventory-extractor/` ( workspace 14번째)       | 동반 ( raw-grep 패턴 자동화)                        | PoC #07 종결 |
| `flows/analysis.phase-flow.{json,mermaid}` v2.1.0 → v2.2.0 | phase 4 또는 phase 1 inventory 후속 단계 entry 추가 | PoC #07 종결 |
| ADR-CHAIN-007 (또는 ADR-009 § 추가)                        | 외부 조언 (Opus 4.7) 정식화 + ratchet               | PoC #07 종결 |

14차 retract 패턴 회피 — 본 retrofit 단독 격상 ❌ + cooperative ≥ 2 PoC 후 본체 격상.

## 7. 외부 조언 (Opus 4.7) 흡수 매핑

| #   | 외부 조언               | retrofit 처분                                  | 정합                     |
| --- | ----------------------- | ---------------------------------------------- | ------------------------ |
| 1   | SQL 인벤토리 6 컬럼 표  | 본 retrofit 정식 측정 (10 컬럼 확장)           | ✅ 사용자 D9 결단 정합   |
| 2   | iBatis XML = 1차 산출물 | ✅ mapper_xml + business_meaning 자연 흡수     | ✅                       |
| 3   | DAO + DB 통합 테스트    | scope ❌ — chain 3 영역 / `C-PoC07-1` carry    | ✅ R3 boundary 흐림 회피 |
| 4   | MockMvc Replay 테스트   | scope ❌ — chain 3 영역 / `C-PoC07-2` carry    | ✅                       |
| 5   | DBUnit / @Sql 픽스처    | scope ❌ — chain 3/4 영역 / `C-PoC07-3` carry  | ✅                       |
| 6   | 도구 버전 가이드        | ✅ inventory.json stack_signals (PoC #06 기존) | ✅                       |

## 8. PoC #07 capital 도착 시 다음 단계

1. capital source 사본 → `examples/poc-07-efiweb-capital-spring41/source/`
2. raw-grep + sql-inventory.{json,md} 본 PoC #06 패턴 mirror 적용
3. corroboration #2 사실 확보 → §8.1 strict ≥ 2 PoC isomorphic 충족
4. PoC #07 종결 (DEC-2026-05-08-poc-07-종결)
5. v2.2.0 본체 격상 진입 자격 (carry 3 + ADR + flow + deliverable)

## 9. 자산 갱신 (본 결단으로)

- ✅ `examples/poc-06-efiweb-exchange-spring41/sql-inventory/` 디렉토리 + 3 파일 신설
- ✅ 본 DEC 신설
- ⏳ STATUS.md PoC #06 SQL Inventory retrofit corroboration #1 추가
- ⏳ INDEX.md 본 DEC 추가
- ⏳ PoC #07 README + DEC-prelim 갱신 (corroboration #2 역할 명시)

## 10. 참조

- 선행: DEC-2026-05-07-poc-06-종결 (PoC #06 정식)
- DEC-2026-05-07-poc-06-domain-결단 (intent vs bug §3.1 + §3.2 정합)
- DEC-2026-05-08-poc-07-prelim-신설 (PoC #07 진입 / source 차단)
- retrofit 패턴 mirror: DEC-2026-05-07-poc-07-poc03-phase7-retrofit (PoC #03 phase 4.7 retrofit / 패턴 정식화 origin)
- 외부 조언 origin: 사용자 turn 시 Opus 4.7 별도 CLI 의견 (Spring 4.1 + iBATIS 환경 SQL 인벤토리 6 컬럼 신규 자산)
- 사용자 결단 D9 + D11 (10 컬럼 + ≥ 2 PoC 후 v2.2.0)
- v2.2.0 carry: `C-v2.2.0-sql-{inventory,schema,tool}`
- §8.1 strict 의무 / 14차 retract 회피 정합

# SQL Inventory — exchange 모듈 (★ retrofit / corroboration #1)

> 2026-05-08 / DEC-2026-05-08-poc-06-sql-inventory-retrofit
> ★ ★ ★ 신규 deliverable #24 placeholder (★ 외부 조언 6 + 본 추가 4 = 10 컬럼 / 사용자 D9 결단)
> 본체 격상 ❌ — ≥ 2 PoC isomorphic 후 v2.2.0 carry (`C-v2.2.0-sql-inventory`)

---

## 1. retrofit scope

기존 PoC #06 산출 (analysis 4종 + characterization + chain 1 planning-spec) 위에 ★ ★ SQL Inventory 10 컬럼 retrofit 적용. 외부 조언 (Opus 4.7) 6 컬럼 + 본 방법론 정합 4 컬럼 (uc_link / intent_vs_bug_classification / confidence / carry_flags) = 10 컬럼.

### corroboration 의도

phase 4.7 (PoC #03 NestJS retrofit 패턴) mirror — PoC #07 capital source 도착 전 PoC #06 exchange.xml 6 SQL 작업으로 SQL Inventory 형식 정합 사실 확보 → corroboration #1.

---

## 2. 자동 추출 결과 (★ 외부 조언 6 컬럼 기준)

| 컬럼 | 자동? | 추출 결과 | 신뢰도 |
|---|---|---|---|
| 1. sql_id | ✅ grep | `<select|update|procedure id="..."` → 6 entry | 95% |
| 2. mapper_xml | ✅ | source/sqlmap/exchange.xml | 100% |
| 3. called_from_screen | ❌ 수동 | Controller → JSP 추적 의무 | 70% (LLM) |
| 4. business_meaning | ❌ 수동 | 자연어 요약 | 70% (LLM + grounding) |
| 5. dynamic_branch | ✅ grep | iBATIS `<isNotEmpty>` + SQL CASE WHEN | 90% |
| 6. dependent_tables | ✅ regex | TB_CURRENCY / TB_EXCHANGE / TB_DAY_EXCHANGE | 95% |

### 자동 추출 비율

- **외부 6 컬럼**: 4/6 = ★ **66.7%** ≥ 50% pass
- 전체 10 컬럼: 4/10 = 40% (참고 / 본 추가 4 컬럼은 metadata)

→ ★ ★ 본 PoC = SQL Inventory 자동화율 자격 충족 (≥ 50% auto / 사용자 D10 종결 자격 정합).

---

## 3. 10 컬럼 인벤토리 표

| # | sql_id | mapper_xml | called_from_screen | business_meaning | dynamic_branch | dependent_tables | uc_link | intent_vs_bug_classification | confidence | carry_flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `ExchangeDAO.selectExchangeList` | exchange.xml:8 | exchangeView → exchangeViewAjax | E + A 두 GUBUN 12개월 환율 통화별 UNION ALL 조회 (B/S + P/L) | 1 (`<isNotEmpty currCd>`) | TB_CURRENCY, TB_EXCHANGE | UC-EXCHANGE-002 | intent (BR-002) + bug 동반 (AP-006 / D2 결단) | 0.90 | — |
| 2 | `ExchangeDAO.updateExchange` | exchange.xml:36 | exchangeView → updateExchange | 12개월 환율 일괄 MERGE (matched UPDATE / not matched INSERT) | 0 | TB_EXCHANGE | UC-EXCHANGE-006 | intent (BR-005 입력 UX) + bug 동반 (AP-006 / D2 결단) | 0.85 | — |
| 3 | `ExchangeDAO.selectCheckExcRate` | exchange.xml:76 | exchangeView → checkExcRateReg | 통화×년도×월 환율 등록 여부 확인 (12 CASE WHEN) | 12 (SQL CASE WHEN) | TB_EXCHANGE | UC-EXCHANGE-007 | ★ **self_recognized** (line 75 자조 코멘트 / SATD / AP-007) | 0.95 | — |
| 4 | `ExchangeDAO.selectExchangeRate` | exchange.xml:102 | (★ N/A / capital/connect cross-module) | ★ 외화→원화 환산 환율 — `FN_Get_ExcRate(year, month, currCd, excGubun)` wrapper | 0 | (없음 / DB 함수) | (supplementary) | intent (BR-007 회계 산식) | 0.80 | external_call_out_of_scope, DBA-read |
| 5 | `ExchangeDAO.insertExchangeRateMigration` | exchange.xml:112 | exchangeView → exchangeMigration | ★ ★ 외부 시스템 환율 일괄 가져오기 — Stored Procedure `S_ExRateMigration` (본문 부재) | 0 | (없음 / DB 프로시저) | UC-EXCHANGE-003 | ★ **ambiguous** (AP-008 / DBA 결단 carry) | 0.65 | DBA-read, proc-body, external_call_out_of_scope |
| 6 | `ExchangeDAO.selectDayExchangeList` | exchange.xml:118 | exchangeView → getDayExchangeList | 통화별 월별 일일 환율 (VND 4자리 / 그 외 2자리) | 2 (SQL CASE WHEN VND) | TB_DAY_EXCHANGE | UC-EXCHANGE-004, 005 | intent (BR-003 VND 정밀도) | 0.90 | — |

---

## 4. ★ 동적 분기 통계

| 종류 | 건수 | 위치 |
|---|---|---|
| iBATIS 2 dynamic (`<isNotEmpty>`) | 1 | exchange.xml:28 (selectExchangeList) |
| SQL CASE WHEN 12 분기 | 1 | exchange.xml:79 (selectCheckExcRate / ★ AP-007 자조) |
| SQL CASE WHEN 2 분기 | 1 | exchange.xml:122 (selectDayExchangeList / VND 정밀도) |

★ ★ exchange 단일책임 모듈 → dynamic branch 적음 (1 iBATIS + 14 SQL CASE WHEN). PoC #07 capital 다중책임 예상 → dynamic branch ↑ 예상 / corroboration #2 비교 의미.

---

## 5. ★ self_recognized (SATD / Maldonado & Shihab 2015) grep

| 위치 | 코멘트 | 분류 |
|---|---|---|
| exchange.xml:75 | "환율관리 페이지만 생각하고 설계한 폐해라 할 수 있다 ㅋ" | ★ self_recognized → bug 자동 처분 (AP-EXCHANGE-007 정합) |

★ 1건만 = exchange 단일책임 모듈 의 SATD 신호 ↓. PoC #07 capital 다중책임 예상 → SATD ↑ 예상.

---

## 6. ★ intent vs bug 분류 통계 (phase 4.7 정합)

| 분류 | 건수 | 비율 |
|---|---|---|
| intent | 4 (① ② ④ ⑥ — 일부는 동반 bug 보유) | 67% |
| bug (동반) | 2 (① ② / AP-006 1NF 위반 동반 / D2 결단 후) | (intent + bug 분리) |
| ambiguous | 1 (⑤ / AP-008 DBA carry) | 17% |
| self_recognized | 1 (③ / AP-007 자조) | 17% |

★ phase 4.7 (PoC #06 종결 / DEC-2026-05-07-poc-06-domain-결단) 의 intent-vs-bug 분류표 와 SQL Inventory 매핑 정합 — ★ ★ 신규 deliverable #24 의 본 방법론 cross-link 강화 가치 입증.

---

## 7. ★ ★ ★ 외부 호출 (cross-module / out-of-scope)

| sql_id | 외부 자산 | 도메인 | carry |
|---|---|---|---|
| `ExchangeDAO.selectExchangeRate` | DB 함수 `FN_Get_ExcRate` | 외화→원화 환산 / capital, connect 등 cross-module 호출 | DBA-read + external_call_out_of_scope |
| `ExchangeDAO.insertExchangeRateMigration` | Stored Procedure `S_ExRateMigration` | 외부 시스템 (한국은행 / 외환은행 추정) 일괄 가져오기 | DBA-read + proc-body + external_call_out_of_scope |

★ ★ 외부 조언 (Opus 4.7) 의 "iBatis XML 1차 산출물" 사상 정합 — 외부 호출도 명시적 등재 (capital 모듈이 호출하는 cross-module 의존 visibility ↑).

---

## 8. ★ corroboration #2 (PoC #07 capital) 예상 차이

| metric | PoC #06 exchange (corroboration #1 / 단일책임) | PoC #07 capital (corroboration #2 / 다중책임 예상) |
|---|---|---|
| SQL 작업 수 | 6 | ~30~50 (3752 LOC = ×10배) |
| dynamic_branch (iBATIS) | 1 | ★ ↑ 예상 (다중책임 → 분기 ↑) |
| SQL CASE WHEN | 14 (12 월 + 2 VND) | ↑ 예상 |
| self_recognized (SATD) | 1 (자조 1건) | ★ ↑ 예상 (Legacy + 다중책임) |
| ambiguous | 1 (DBA carry) | ★ ↑ 예상 (도메인 expert 결단 round 추가) |
| 자동 추출 비율 (외부 6) | 4/6 = 66.7% | ★ ≥ 50% 자격 (예상 / 동일 spectrum) |
| dependent_tables | 3 (TB_CURRENCY/EXCHANGE/DAY_EXCHANGE) | ↑ 예상 (자본 환산 도메인 ↑) |
| external_calls | 2 (FN_Get_ExcRate / S_ExRateMigration) | ★ ↑ 예상 + cross-module 호출 (capital → exchange) |

★ ★ 두 PoC isomorphic = 같은 EFI-WEB / Spring 4.1 + iBATIS 2 spectrum / 다른 도메인 (환율 vs 자본 환산) → ★ ★ ★ §8.1 strict ≥ 2 PoC 자격 자연 충족 자격.

---

## 9. ★ ★ ★ §8.1 strict 본체 격상 자격

| 자산 | 본체 격상 자격 | carry ID |
|---|---|---|
| 신규 deliverable #24 (SQL Inventory) | PoC #06 retrofit (#1) + PoC #07 capital (#2) → **≥ 2 PoC isomorphic 충족 시점** | `C-v2.2.0-sql-inventory` (★ PoC #07 capital 종결 후 trigger) |
| schemas/sql-inventory.schema.json (★ 31번째) | 동반 | `C-v2.2.0-sql-schema` |
| tools/sql-inventory-extractor (★ workspace 14번째) | 동반 (★ raw-grep.txt 패턴 자동화) | `C-v2.2.0-sql-tool` |

★ ★ ★ 14차 retract 패턴 회피 — 본 PoC #06 retrofit 단독 격상 ❌ / PoC #07 capital 종결 후 cooperative 격상.

---

## 10. 산출 파일

```
sql-inventory/
├── raw-grep.txt           # Day 0 자동 추출 1차 (★ 자동 컬럼 4종)
├── sql-inventory.json     # AI 눈 / 10 컬럼 record × 6
└── sql-inventory.md       # 사람 눈 / 본 파일
```

## 11. 참조

- 본 retrofit 등재: DEC-2026-05-08-poc-06-sql-inventory-retrofit
- 본 PoC 종결: DEC-2026-05-07-poc-06-종결
- 도메인 결단: DEC-2026-05-07-poc-06-domain-결단 (intent vs bug §3.1 + §3.2 정합)
- phase 4.7 분류표: `characterization/intent-vs-bug.md`
- 외부 조언 origin: 사용자 turn 시 Opus 4.7 별도 CLI (Spring 4.1 + iBATIS 환경 phase 4.7 적용 전략)
- 본 방법론 정합 retrofit 패턴: DEC-2026-05-07-poc-07-poc03-phase7-retrofit (PoC #03 phase 4.7 retrofit / corroboration #2 / mirror)
- v2.2.0 carry: `C-v2.2.0-sql-{inventory,schema,tool}`

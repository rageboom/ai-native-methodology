# Planning Spec — EFI-WEB exchange 모듈 (PoC #06 prelim)

> 사람 눈 (ADR-008 v2 §10 이중 렌더링).
> 단일 진실 = `planning-spec.json`.
> 2026-05-07 / chain 1 (planning) / methodology v2.0.0.

---

## 1. 비즈니스 의도

**도메인**: IFRS 회계 표준의 외화환산 차이 (foreign exchange difference) 처리.

연간 통화별 환율 (기말환율 E + 평균환율 A) 마스터 관리 + 외화 → 원화 환산 시 다른 모듈에 환율 제공. 일일 환율 조회/엑셀 다운로드 보조 기능.

### Stakeholders

| 역할 | 책임 |
|---|---|
| ifrs-user (회계 담당자) | 환율 조회 / 입력 / 엑셀 다운로드 |
| ifrs-admin (관리자 추정) | 환율 마이그레이션 (S_ExRateMigration / 외부 시스템 연동) |
| downstream-modules (capital, connect 등) | selectExchangeRate 호출 의존 |

### Success Criteria

1. 기말(E) + 평균(A) 두 GUBUN 모두 등록되어야 회계 인식 완성 (BR-EXCHANGE-002)
2. KRW 환율 = 1 고정 (기준 통화 / BR-EXCHANGE-001)
3. 외화 → 원화 환산 시 currCd 별 정확한 환율 적용 (BR-EXCHANGE-007)
4. 12개월 환율 일괄 입력 + 천단위 콤마 자동 제거 UX (BR-EXCHANGE-004 + BR-EXCHANGE-005)

---

## 2. Use Cases (7건)

| ID | 이름 | trigger |
|---|---|---|
| UC-EXCHANGE-001 | 연간 환율 관리 화면 진입 | GET /ifrs/exchange/exchangeView |
| UC-EXCHANGE-002 | 연간 통화별 12개월 환율 조회 (Ajax) | POST /ifrs/exchange/exchangeViewAjax |
| UC-EXCHANGE-003 | 연간 환율 외부 마이그레이션 | POST /ifrs/exchange/exchangeMigration |
| UC-EXCHANGE-004 | 통화·월별 일일 환율 조회 | GET /ifrs/exchange/getDayExchangeList |
| UC-EXCHANGE-005 | 통화·월별 일일 환율 엑셀 다운로드 | GET /ifrs/exchange/downloadDayExchangeExcel |
| UC-EXCHANGE-006 | 연간 환율 일괄 입력/수정 | POST /ifrs/exchange/updateExchange |
| UC-EXCHANGE-007 | 환율 등록 여부 확인 | GET /ifrs/exchange/checkExcRateReg |

★ characterization snapshot 으로 cover 된 UC: 002 / 006 / 007 (3 / 7 = 43%). 나머지 4 UC carry.

---

## 3. Business Rules Intent (7건)

| BR | intent_vs_bug | 핵심 |
|---|---|---|
| BR-EXCHANGE-001 (KRW = 1) | **intent** | IFRS 기준 통화 / 환산 회피 |
| BR-EXCHANGE-002 (E+A 모두 등록) | **intent** | B/S + P/L 동시 평가 의무 |
| BR-EXCHANGE-003 (VND 4자리) | **intent** | 단위가 작음 → 정밀도 |
| BR-EXCHANGE-004 (콤마 제거) | **intent** | UX 친화 |
| BR-EXCHANGE-005 (12개월 일괄) | **★ ambiguous → 잠정 bug** | 자조 코멘트 자체 인지 신호 |
| BR-EXCHANGE-006 (E/A 분리) | **intent** | B/S vs P/L 회계 기준 |
| BR-EXCHANGE-007 (FN_Get_ExcRate) | **intent** | 환산 산식 / FN 본문 carry |

---

## 4. Out of Scope (★ 본 PoC #06 prelim 한정)

- chain 2~4 (현 PoC 는 chain 1 만 측정)
- 다른 모듈 (capital, billing, bod 등) — exchange 단일책임만
- FN_Get_ExcRate DB 함수 본문 (carry)
- S_ExRateMigration 비즈니스 의도 + 외부 시스템 spec (carry)
- TB_EXCHANGE 의 트랜잭션 isolation 수준 (carry)
- JSP UI/UX (PoC #04 React FSD 와 별개 트랙)
- AUIGrid / 다음에디터 한국 상용 라이브러리 (corpus 빈약 본질 한계)
- 전체 51K LOC 마이그레이션 (chain harness scope 외 / OpenRewrite 시퀀스)

---

## 5. Risks & Constraints

★ **Spring 4.1 + iBATIS 2 + 표준프레임워크 corpus 빈약** — AP 자동 추출 자동화율 22% (plan §3-A 35% 추정 -13%p)
★ **IFRS 회계 도메인 지식 무게 ↑** — rules.json 자연어 description 비중 ↑ / 자동화율 29% (plan §3-A 55% 추정 -26%p)
★ **ambiguous 3종** (BR-005 + AP-006/008/009) — 도메인 expert 결단 의무 / chain 2 진입 ❌ (이 결단 전까지)
★ **실 DB 환경 (MSSQL) 부재** — characterization snapshot 정확도 한계 / 도메인 expert 검증 carry
- 70~80% 자동화 한계 잔존 (chain harness 정신) — gate #1~#4 사용자 검토 의무
- 테스트 0 환경 — chain 3 RED→GREEN baseline 부재

---

## 6. ★ 신뢰도 (confidence) = 0.75

**plan §3-B 추정 75% 정합** — chain 1 planning-spec 자동화율.

**+ 요인**:
- 7 UC + 7 BR 추출 가능 (단일책임 모듈 + 명확한 3계층)
- characterization (phase 4.7) 산출 cross-link 로 ambiguous 영역 명시 → 신뢰도 ↑

**- 요인**:
- 도메인 expert (IFRS 회계 담당자) 검증 carry 3건 (UC-003 / BR-005 / AP-008)
- 실 환경 부재 (DB 함수 본문 + 외부 시스템 spec)

---

## 7. Cross-Links

- `input/rules.json` (7 BR)
- `input/domain.json` (7 UC + 3 aggregate + 1 external system)
- `input/antipatterns.json` (10 AP)
- `input/inventory.json` (5 모듈 + 3 DB 테이블 + 1 함수 + 1 프로시저)
- `characterization/snapshots/*.json` (3 UC × 10 scenario)
- `characterization/coverage.json` (UC coverage 0.43)
- `characterization/intent-vs-bug.md` (★ 14 명확 + 3 ambiguous = 82% acceptance oracle)

---

## 8. Day 3 측정 종합 — plan §3-B 추정 75% 정합 여부

| 측정 항목 | 결과 |
|---|---|
| confidence (사람 추정) | **0.75** (plan §3-B 추정 정확) |
| 7 UC 추출 | 100% (자동 grep + 자연어 description 사람 보강) |
| 7 BR 추출 | 100% (코드 if/SQL 분기 → BR description 사람 보강) |
| ambiguous 3건 cross-link | 100% (characterization 와 완전 매핑) |
| FN_Get_ExcRate / S_ExRateMigration carry 명시 | 100% |
| **plan §3-B 75% 추정** | **★ 정합** |

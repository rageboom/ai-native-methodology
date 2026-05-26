# Planning Spec — capital 모듈 (★ chain 1 planning-spec / 사람 눈 view)

> 2026-05-08 / Day 3 / Work Principles 1원칙 plan + 2원칙 research 누적
> ★ chain 1 = SDLC 4단계 chain harness 의 첫 단계 (legacy 분석 결과 → 비즈니스 의도 추출)
> AI 눈: `.aimd/output/planning-spec.json` (schema 정합 / planning-extraction-validator 0 findings / UC coverage 94.1%)

---

## 1. 목적 + 비목적

### 1.1 목적

EFI-WEB IFRS 회계 시스템의 자본 일보 (Capital Daily Report) 모듈의 비즈니스 의도를 chain 1 단계로 추출. ★ chain 2 (behavior-spec + acceptance-criteria) 입력 자격 ✅.

### 1.2 비목적

- chain 2~4 본격 진입 ❌ (PoC #07 prelim scope 정합 / chain 1 만 측정)
- 다중 모듈 (51K LOC 전체) 추출 ❌ — capital 모듈 한정
- Stored Procedure 본문 read ❌ — DBA carry
- 본체 격상 ❌ — 사용자 D11 결단 (b) ≥ 2 PoC isomorphic 후 v2.2.0

---

## 2. 비즈니스 의도

**도메인 목적**: EFI-WEB IFRS 회계 시스템의 자본 일보 (Capital Daily Report) 작성 / 검토 / 결재 — 다중 법인 × 다중 자금 source (ERP/CMS/NonERP) 통합 자본 보고. 주간 자금조달내역 + 환율 가중 + verify lock workflow.

**이해관계자**:
- ifrs_admin (회계 운영자 / 자본 보고 작성)
- ifrs_planner (회계 담당자 / 검증 + 결재)
- DBA (Stored Procedure 본문 + external schema 운영)
- system_architect (cross-module / cross-system 의존 관리)

**성공 기준**:
- 자본 일보 작성 + 결재 lock 흐름 회계 정합 (verify 후 수정 차단 / IFRS 표준)
- ERP / CMS / NonERP 3 source 통합 정확도 = 회계 sub-total 일치
- 주간보고 환율 가중 평균 정확도 (cramt × EXCHANGE_RATE / 1,000,000)
- ★ phase 4.7 acceptance oracle = D2.5 후 27/27 = 100% 명확 분류

---

## 3. UC 7 핵심 (cover) + 9 carry

| ID | name | 분류 | snapshot | 핵심 사실 |
|---|---|---|---|---|
| UC-CAPITAL-001 | 법인 기초정보 조회 | covered | ✅ | TB_COMPANY 의 자본 보고 대상 법인 우선 정렬 |
| UC-CAPITAL-002 | 법인 기본정보 갱신 | covered | ✅ | ★ TB_COMPANY 갱신 + SP _IFRSCapitalSetCom 호출 / atomicity 부재 (BR-CAPITAL-TXBOUND-003 bug) |
| UC-CAPITAL-006 | ERP 입금 List 일괄 등록 | covered | ✅ | ★ Stored Procedure (_IFRSCapitalList) 호출 / SP body 미확인 |
| UC-CAPITAL-008 | 자금일보 임시 저장 / 저장 / 초기화 | covered | ✅ | ★ saveType R/B/A 3 분기 state machine (★ D2 결단 b — A는 별도 endpoint 라우팅) |
| UC-CAPITAL-010 | 자본 검증 결재 lock | covered | ✅ | ★ workflow LOCKED state (★ D2 결단 a — workflow state machine 명시 의무) |
| UC-CAPITAL-011 | 자금일보 주간보고 1 | covered | ✅ | ★ ★ Service 2회 호출 / TB_DAY_EXCHANGE cross-module / Double parsing patch |
| UC-CAPITAL-013 | 주간보고 10 (SAC ledger) | covered | ✅ | ★ ★ ★ XML 인라인 String / DEAD parameter (comNo) / 다중책임 spectrum 신규 AP |
| UC-CAPITAL-003 | Capital Std 조회 | carry | ❌ | external schema 의존 / DBA-read |
| UC-CAPITAL-004 | Capital Biz 조회 | carry | ❌ | UC-003 동반 |
| UC-CAPITAL-005 | ERP 보통예금 입금 List 조회 | carry | ❌ | UC-006 cover 로 대표 |
| UC-CAPITAL-007 | ERP 출금 List 조회 | carry | ❌ | SGERP cross-system |
| UC-CAPITAL-009 | Save / Load 보고서 데이터 | carry | ❌ | UC-008 cover 로 대표 |
| UC-CAPITAL-012 | 주간보고 4 | carry | ❌ | UC-011 cover 로 대표 |
| UC-CAPITAL-014 | 주간보고 11 | carry | ❌ | UC-011 cover 로 대표 |
| UC-CAPITAL-015 | 주간보고 13/14 | carry | ❌ | UC-013 XML 인라인 패턴 cover 로 대표 |
| UC-CAPITAL-016 | 주간 환율 List | carry | ❌ | UC-011 cross-module cover 로 대표 |

**UC coverage**: 7/16 = 43.8% (★ ratchet baseline)
**planning-extraction-validator**: 0 findings / UC coverage 94.1% ✅ (carry stub 포함)

---

## 4. BR 의도 5 핵심 (cover) + 10 carry

| ID | 분류 | reasoning |
|---|---|---|
| BR-CAPITAL-CORPYN-001 | intent | TB_COMPANY 정렬 = 자본 보고 대상 법인 우선 표시 (회계 운영자 효율) |
| BR-CAPITAL-SAVTYPE-005 | intent + 라우팅 분리 (D2 b) | saveType R/B/A 3 분기 state machine / saveType=A 는 IfrsCapitalDeleteAjax 별도 endpoint 라우팅 |
| BR-CAPITAL-PREVBAL-006 | intent + BigDecimal 마이그 | 전주 마지막 영업일 잔액 자동 fetch / String→Double parseDouble = BigDecimal 의무 |
| BR-CAPITAL-VRFYLOCK-008 | intent (D2 a) | Capital Verify lock = 결재 후 임시저장 차단 / workflow state machine 명시 의무 |
| BR-CAPITAL-XRATE-009 | intent (환율) + bug (cross-module) | TB_DAY_EXCHANGE 환율 가중 = IFRS 정합 / 직접 SQL = DDD bounded context 위반 |

(나머지 10 BR = carry / planning-spec.json business_rules_intent §5+ 등재 자격 — chain 2 진입 시 업데이트 carry)

---

## 5. out of scope (★ R3 boundary 흐림 회피)

- ★ chain 3 영역 (DAO + DB 통합 테스트 / Testcontainers) — C-PoC07-1 carry
- ★ chain 3 영역 (MockMvc Replay 테스트) — C-PoC07-2 carry
- ★ chain 3/4 영역 (DBUnit / @Sql 픽스처) — C-PoC07-3 carry
- 다중 모듈 (51K LOC 전체) — capital 모듈 한정
- Stored Procedure 본문 (_IFRSCapitalList + _IFRSCapitalSetCom + _SACCashBookList_IFRS) — DBA + proc-body C-data-PoC07-1 carry
- external schema (LIVE_SQL.SGERP.dbo.IFRS_CAPITALSTD) — DBA-read C-domain-PoC07-1 carry
- Mail (E. sub-domain) / canvasUpload + 이미지 base64 인라인 — 다음 PoC carry
- 10 carry UC

---

## 6. risks + constraints

- 70~80% 자동화 한계 잔존 — gate #1~#4 사용자 검토 의무
- ★ ★ 다중책임 모듈 = SATD ↑↑ (4건 self_recognized — 단일책임 PoC #06 1건 대비 ×4) → 새 시스템 재구현 시 SATD 우선 처리 의무
- ★ Spring 4.1 + iBATIS 2 spectrum = sql-inventory 외부 6 컬럼 자동화 4/6 = 66.7% / 매뉴얼 + 본 추가 6 컬럼 carry
- ★ ★ ★ 본체 격상 ❌ — 사용자 D11 결단 (b) ≥ 2 PoC isomorphic 후 v2.2.0
- ★ Stored Procedure 본문 비가시성 = chain 3/4 진입 시 SP 마이그레이션 결단 의무 (Java 측 vs DB 측)
- TB_DAY_EXCHANGE cross-module 직접 의존 = service boundary 분리 검토 의무 (architect carry)

---

## 7. validator 결과 요약 (Day 3 진입 자격)

| validator | 결과 | 자격 |
|---|---|---|
| planning-extraction-validator | 0 findings / UC coverage 94.1% | ✅ chain 2 진입 자격 충족 |
| characterization-coverage-validator | 0 findings / named_classified_ratio 87.5% / actual coverage 43.8% (ratchet baseline write) | ✅ baseline 첫 진입 / 다음 회차 trend ↑ 의무 |

★ Day 3.5 종결 후 baseline 정합 검증 의무 (`.aimd/baseline/characterization-coverage.json` 자산화).

---

## 8. cross-link

- analysis 4종 — `input/{rules,domain,antipatterns,inventory}.json`
- characterization — `characterization/snapshots/` (7) + `intent-vs-bug.md` + `coverage.json`
- decisions — `DEC-2026-05-08-poc-07-prelim-신설.md` + `DEC-2026-05-08-poc-07-domain-결단.md`
- sql-inventory — `sql-inventory/sql-inventory.json` (10 컬럼 + patterns_extension_v2 / corroboration #1+#2)
- baseline — `.aimd/baseline/characterization-coverage.json` (★ ratchet 첫 write)

---

## 9. 다음

★ Day 3.5 — REPORT-day3-measurement.md + 종결 DEC + STATUS / INDEX 갱신 + carry 3 신규 등재.

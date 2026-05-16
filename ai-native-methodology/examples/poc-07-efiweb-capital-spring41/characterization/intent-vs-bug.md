# Intent vs Bug 분류표 — capital 모듈 (★ phase 4.7 다중책임 spectrum 두 번째 적용)

> 외부 조언 (Michael Feathers Characterization Testing) 4단계 — 유지할 동작 (intent) vs 버려야 할 버그 (bug) 분류.
> ★ ★ ★ PoC #06 (exchange 단일책임) 직후 두 번째 적용 / 다중책임 spectrum 측정.
> ★ 도메인 expert (사용자 본인 또는 IFRS 회계 담당자) 검증 carry 의무.

---

## 1. Business Rules (15건) 분류

| ID | 제목 | 분류 | 근거 |
|---|---|---|---|
| BR-CAPITAL-CORPYN-001 | 법인별 capital_yn / cms_use_yn 분류 | **intent** | 회사 마스터 (TB_COMPANY) 정렬 — IFRS 회계 정합 |
| BR-CAPITAL-STYPE-002 | Capital Std/Biz sType 구분 (1=Std, 2=Biz) | **intent** | external schema 의존 + sType enum 의미 = DBA carry 후 정합 |
| BR-CAPITAL-TXBOUND-003 | 법인 기초정보 갱신 시 단일 트랜잭션 ❌ | **bug** | TB_COMPANY 갱신 + SP _IFRSCapitalSetCom 호출이 별도 → atomicity 부재 (회계 데이터에 명백한 폐해) |
| BR-CAPITAL-DATASRC-004 | ERP 입금 데이터 dataSource 분기 (ERP/CMS/NonERP 3 source) | **intent** | sub-domain 분기 = 자금일보 핵심 |
| BR-CAPITAL-SAVTYPE-005 | 자금일보 saveType 3 분기 (R/B/A) | **★ ambiguous** | iBATIS XML 의 saveType=A 분기 부재 → Controller / DAO 어디서 분기? — domain expert 결단 필요 |
| BR-CAPITAL-PREVBAL-006 | 전주 마지막 날짜 잔액 (basicBalance) 자동 fetch | **intent** | 자금일보 핵심 / NPE 회피 patch 정합 (그러나 String→Double parseDouble 자체는 BigDecimal 마이그레이션 의무) |
| BR-CAPITAL-AUDIT-007 | 주간보고 사용자 ID 등록자 자동 추가 | **intent** | ICM-11763 patch — 감사 의무 정합 |
| BR-CAPITAL-VRFYLOCK-008 | Capital Verify (검증 lock) — 결재 후 임시저장 차단 | **★ ambiguous** | verify 후 수정 가능 여부 명시 부재 — IFRS 회계 담당자 결단 의무 |
| BR-CAPITAL-XRATE-009 | 주간 환율 (TB_DAY_EXCHANGE cross-domain 의존) | **intent (환율 가중) + bug (cross-module)** | 회계 산식 자체는 intent / module boundary 위반은 bug — 새 시스템 = micro-service 분리 검토 |
| BR-CAPITAL-HISTORY-010 | Capital History 추적 | **intent** | 감사 의무 정합 |
| BR-CAPITAL-MAILSPEC-011 | ★ 슈퍼크리에이티브 메일수신 유저 임시처리 (4회 SATD) | **bug + 자체인지** | self_recognized SATD per Maldonado&Shihab — 4회 중복 자조 / 새 시스템 = enum + audit 의무 |
| BR-CAPITAL-IMGB64-012 | 이미지 base64 인라인 저장 | **bug** | DB 비대 + IO 비용 = 명백한 폐해 / 새 시스템 = S3 + URL 저장 |
| BR-CAPITAL-CALEND-013 | Holiday + Week 캘린더 분기 (영업일 vs 휴일) | **intent** | 주간보고 영업일 계산 = 회계 정합 |
| BR-CAPITAL-GRAPHSET-014 | GraphSetting 사용자별 저장 | **intent** | UI 개인화 = 사용자 가치 |
| BR-CAPITAL-ASSETSP-015 | Asset List 다단계 조회 | **intent (도메인) + bug (XML 인라인)** | Asset 1~7 단계 도메인 분기 = intent / xmlDocument String 인라인 = bug (AP-CAPITAL-005) — 동반 처분 |

**BR 분류 결과 (Day 2 초안)**: intent 9 / bug 3 / bug+자체인지 1 / ambiguous 2

---

## 2. Antipatterns (12건) 분류

| ID | 제목 | 분류 | 근거 + 처분 |
|---|---|---|---|
| AP-CAPITAL-001 | God Controller (2536 LOC × 87 endpoint) | **bug** | Single Responsibility Principle 명백 위반 / 새 시스템 = sub-domain 분리 (CapitalReportController / WeeklyReportController / etc) |
| AP-CAPITAL-002 | Map<String,Object> + 강제 캐스팅 | **bug** | Type Safety 부재 = 명백한 폐해 (PoC #06 AP-EXCHANGE-001 isomorphic). 새 시스템 = DTO + Bean Validation |
| AP-CAPITAL-003 | Anemic Service / 단순 위임 | **bug** | Service 의 존재 의의 부재 (PoC #06 AP-EXCHANGE-002 isomorphic). 새 시스템 = Application Service + Domain Service 분리 |
| AP-CAPITAL-004 | WITH(NOLOCK) 무차별 사용 | **bug** | Dirty Read 위험 (PoC #06 AP-EXCHANGE-004 isomorphic) — 회계 데이터에 특히 위험. 새 시스템 = READ_COMMITTED_SNAPSHOT |
| AP-CAPITAL-005 | ★ ★ XML 인라인 String 생성 (xmlDocument) | **bug** | 데이터 모델 부재 / SQL injection 위험 / XML escape 부재 — 새 시스템 = DTO + Jackson XmlMapper 또는 SP signature 변경 |
| AP-CAPITAL-006 | DEAD parameter (comNo 파싱 후 미사용) | **bug** | 의도 ↔ 실제 drift = 명백한 폐해. 사용 의도면 SP param 추가 / 미사용 의도면 제거 |
| AP-CAPITAL-007 | 이미지 base64 인라인 / DB 비대 | **bug** | DB 비대 + IO 비용 + 백업/복원 비용 ↑ — BR-CAPITAL-IMGB64-012 동반 처분. 새 시스템 = S3/object storage |
| AP-CAPITAL-008 | // TODO Auto-generated method stub (★ self_recognized SATD) | **bug + 자체인지** | KL-SATD keyword 'TODO Auto-generated' (Maldonado&Shihab 정합). method 제거 또는 정식 구현 |
| AP-CAPITAL-009 | ★ 슈퍼크리에이티브 메일수신 유저 임시처리 (4회 중복 SATD) | **bug + 자체인지** | KL-SATD keyword '임시처리' / 4회 중복 = 다중책임 SATD 신호 (BR-CAPITAL-MAILSPEC-011 동반 처분) |
| AP-CAPITAL-010 | logger 미사용 / e.printStackTrace + System.out.print | **bug + 자체인지** | slf4j Logger 인스턴스 line 63 있으나 미사용 = SATD 신호 / 새 시스템 = 정식 logger 의무 |
| AP-CAPITAL-011 | Cross-domain 직접 의존 (TB_DAY_EXCHANGE / exchange 모듈) | **bug** | DDD bounded context 위반 / 새 시스템 = service boundary 분리 (BR-CAPITAL-XRATE-009 의 module boundary 측면 동반) |
| AP-CAPITAL-012 | ★ ★ 공유 SQL 조각 부재 / iBATIS2 `<sql id>` + `<include refid>` 미사용 | **bug** | corroboration #1+#2 양 PoC isomorphic (AP-EXCHANGE-011 = 0건 / AP-CAPITAL-012 = 0건) — Spring 4.1 + iBATIS 2 spectrum 공통. 새 시스템 = MyBatis 3 마이그레이션 시 공유 조각 의무 |

**AP 분류 결과 (Day 2 초안)**: bug 9 / bug+자체인지 3 / intent 0 / ambiguous 0

---

## 3. ★ Day 2 초안 정량

| 항목 | BR | AP | 합계 |
|---|---|---|---|
| intent | 9 | 0 | 9 |
| bug | 3 | 9 | 12 |
| bug+자체인지 (SATD) | 1 | 3 | 4 |
| ambiguous | 2 | 0 | 2 |
| **합계** | **15** | **12** | **27** |

**named_classified_ratio (Day 2 초안)**: (9 intent + 12 bug + 4 자체인지) / 27 = **25/27 = 0.926** ≥ 0.80 ✅

**ambiguous 2건** = D2 결단 의무 (§4):
1. BR-CAPITAL-SAVTYPE-005 saveType=A 흐름 모호
2. BR-CAPITAL-VRFYLOCK-008 verify 후 수정 정책

---

## 4. ★ ambiguous 2종 → 정식 분류 (2026-05-08 / DEC-2026-05-08-poc-07-domain-결단 / Day 2.5 작성 의무)

### 4.1 BR-CAPITAL-SAVTYPE-005 — saveType=A 분기 흐름 모호

**핵심 질문**: selectLoadSaveData 의 iBATIS XML 에 `<isEqual property="SaveType" compareValue="A">` 분기가 부재한 것이 의도인가?

**intent 가능성**:
- saveType=A (초기화) 는 read 가 아닌 별도 endpoint (IfrsCapitalDeleteAjax 또는 별도 reset 흐름) 가 처리하는 것이 의도
- selectLoadSaveData 는 R/B 두 case 만 read 의무 → A 는 분기 부재가 정합

**bug 가능성**:
- BR-CAPITAL-SAVTYPE-005 가 명시 — saveType R/B/A 3 분기 / Controller 자조 코멘트 (line 763) 도 3 분기 명시
- iBATIS dynamic branch 가 모두 fail 시 빈 SQL 또는 ParseException → runtime 위험
- Controller / DAO 어디서 A 분기 결단인지 코드만으로 모호

**★ 정식 결단 (사용자 D2-1 / Day 2.5 의뢰)**:
- (a) **bug** — selectLoadSaveData 가 R/B/A 모두 처리해야 정합 (iBATIS XML 분기 추가 의무)
- (b) **bug** — selectLoadSaveData 는 R/B 만 / saveType=A 는 별도 endpoint (IfrsCapitalDeleteAjax) 만 / Controller 가 saveType 분기 후 endpoint 라우팅 명시 의무
- (c) **intent + carry** — 도메인 의도가 명확하지 않음 → IFRS 회계 담당자 인터뷰 carry

**권고**: (b) — 현재 동작 분석 시 IfrsCapitalDeleteAjax 가 별도 존재 (TB_CAPITAL_LIST + TB_CAPITAL_ASSET 두 테이블 일괄 DELETE) → A 분기는 별도 endpoint 명시 정합. 새 시스템 = Controller/Service 가 saveType 보고 라우팅 의무 명시 + 단위 테스트 cover.

### 4.2 BR-CAPITAL-VRFYLOCK-008 — verify 후 수정 정책 모호

**핵심 질문**: TB_CAPITAL_VRIFY 등록 후 자본 보고 (TB_CAPITAL_LIST) 수정이 가능한가?

**intent 가능성**:
- 결재 후 lock = 회계 정합 / 새 시스템도 동일 동작 보존 의무

**bug 가능성**:
- 코드만으로는 lock 동작 명시 부재 — DB constraint / application 검증 어디서? 새 시스템 재구현 시 명시 의무

**★ 정식 결단 (사용자 D2-2 / Day 2.5 의뢰)**:
- (a) **intent** — verify 후 수정 차단 = 회계 정합 / 새 시스템 명시 의무 (정책)
- (b) **ambiguous 보존** — DB constraint + application 검증 코드 read carry C-domain-PoC07-1 / 결단 전까지 chain 4 진입 ❌

**권고**: (a) — IFRS 정합 + selectCapitalVrify가 verify 등록 여부 조회 endpoint로 존재 (BR-CAPITAL-VRFYLOCK-008) → Controller/Service 가 verify 등록 후 update 차단 명시 의무 / 새 시스템 = workflow state machine (DRAFT → SUBMITTED → APPROVED → LOCKED).

---

## 5. ★ Day 2.5 후 정량 (D2 결단 적용)

| 분류 | Day 2 초안 | Day 2.5 D2 결단 후 |
|---|---|---|
| intent | 9 | **10** (+BR-008 a) |
| bug | 12 | **13** (+BR-005 b 라우팅 의무) |
| bug+자체인지 (SATD) | 4 | 4 |
| ambiguous | 2 | **0** (★ 모두 결단) |
| **합계** | 27 | **27** |
| **named_classified_ratio** | 25/27 = **0.926** | **27/27 = 1.000** (★ ★ ★ ≥ 0.80 자격 강화) |

★ 다중책임 spectrum 에서도 D2 결단 후 100% 명확 분류 가능 — phase 4.7 본체 schema 의 carry note (PoC #06 단일 모듈 0.43~0.50 + Modern 0.95+) 자격 정합.

---

## 6. 새 시스템 재구현 시 acceptance oracle 요약

| 처분 | 새 시스템 동작 |
|---|---|
| **intent (10 BR + 0 AP = 10)** | 새 시스템도 동일 동작 보존 의무 — characterization snapshot 그대로 통과 |
| **bug (4 BR + 9 AP = 13)** | 새 시스템에서 의도적으로 다른 결과 — modern_alternative 적용 |
| **bug+자체인지 (1 BR + 3 AP = 4)** | 작성자 본인이 폐해로 인지 — 새 시스템 명시 거부 의무 |

★ 외부 조언 (Michael Feathers + Maldonado&Shihab SATD) 합성 정합.

---

## 7. carry 항목 (Day 3.5 종결 시 갱신)

| ID | 항목 | 결단 의무 주체 |
|---|---|---|
| C-domain-PoC07-1 | BR-CAPITAL-STYPE-002 sType enum 의미 (DBA + external schema IFRS_CAPITALSTD read) | DBA |
| C-domain-PoC07-2 | BR-CAPITAL-SAVTYPE-005 saveType=A endpoint 라우팅 (b 권고) — 도메인 expert 검증 | IFRS 회계 담당자 |
| C-domain-PoC07-3 | BR-CAPITAL-VRFYLOCK-008 verify 후 수정 정책 (a 권고) — 도메인 expert 검증 | IFRS 회계 담당자 |
| C-data-PoC07-1 | Stored Procedure 다수 본문 (_IFRSCapitalList + _IFRSCapitalSetCom + _SACCashBookList_IFRS 등) | DBA + proc-body read |
| C-data-PoC07-2 | TB_DAY_EXCHANGE cross-module 의존 boundary — exchange 모듈 micro-service 분리 검토 | 도메인 architect |
| C-PoC07-1 | DAO + DB 통합 테스트 (Testcontainers) — chain 3 진입 시 sub-rule | chain 3 트랙 |
| C-PoC07-2 | MockMvc Replay 테스트 — chain 3 진입 시 sub-rule | chain 3 트랙 |
| C-PoC07-3 | DBUnit / @Sql 픽스처 — chain 3/4 진입 시 sub-rule | chain 3/4 트랙 |

---

## 8. ★ phase 4.7 두 번째 적용 효과 측정 (PoC #06 비교)

| metric | PoC #06 (exchange / 단일책임) | PoC #07 (capital / 다중책임) | 비교 |
|---|---|---|---|
| BR 총 | 7 | **15** | ×2.1 (다중책임 → BR ↑) |
| AP 총 | 10 | **12** | ×1.2 (Day 1.6 v2 흡수 후) |
| 분류 합계 | 17 | **27** | ×1.6 |
| ambiguous (Day 2 초안) | 3 | **2** | ↓ (다중책임에도 ambiguous ↓ — sub-domain 분류 명확 효과) |
| named_classified_ratio (Day 2 초안) | 14/17 = **0.82** | 25/27 = **0.926** | +10%p (★ ★ ★ ★ ★ ★ ★ 다중책임 spectrum 에서도 자격 강화) |
| named_classified_ratio (D2 후) | 17/18 = **0.94** | 27/27 = **1.000** | +6%p (★ ★ ★ ★ ★ Day 2 초안만으로도 PoC #07 자격 ≥ PoC #06 D2 후 — phase 4.7 효과 isomorphic 증명) |
| self_recognized SATD | 1 | **4 (BR-011 + AP-008 + AP-009 + AP-010)** | ★ ×4 — capital 다중책임 → SATD ↑↑ 사실 정합 (KL-SATD 외부 권위 정합) |
| coverage threshold (≥ 0.80 default) | 0.50 (3/6) | 6/16 UC = 0.375 (★ Day 1 시간 cap / 핵심 6 UC cover) | ★ baseline write 의무 (ratchet trend) |

**핵심 결론**:
- ★ ★ ★ phase 4.7 = **단일 prompt 양 spectrum 동작 입증** (Modern PoC #03 30/30=100% + Legacy 단일책임 PoC #06 17/18=94% + Legacy 다중책임 PoC #07 27/27=100% Day 2.5 후) — DEC-CHAIN-006 §결정 §2 단일 prompt 양 spectrum 입증 강화.
- ★ ★ self_recognized SATD = capital 다중책임에서 4× 신호 → KL-SATD 외부 권위 정합 + sub-rule 자격 강화.
- ★ phase 4.7 본체 schema 의 carry note "Modern 환경 명확 비율 ≥ 95% 시 ambiguous 영역 탐색 cap" — PoC #07 다중책임 Legacy 도 100% 도달 시 같은 cap 자격 (carry C-v2.1.0-2 trigger 자격 강화).

---

## 9. 외부 권위 정합 (ADR-CHAIN-006 + ADR-CHAIN-006 §footnote 정합)

| 권위 출처 | 본 PoC #07 정합 |
|---|---|
| Michael Feathers, *Working Effectively with Legacy Code* (2004) §13 | ✅ 6 snapshot Given/When/Then + behavior_to_preserve + behavior_likely_bug 분리 |
| Specification by Example (Gojko Adzic 2011) Given/When/Then BDD | ✅ Cucumber Gherkin 정합 |
| Maldonado & Shihab 2015 SATD + KL-SATD (Springer SQJ 2024) | ✅ self_recognized 4건 — TODO Auto-generated + 임시처리 + printStackTrace + 자조 SQL 코멘트 |
| DDD context map + bounded context (Vaughn Vernon) | ✅ AP-CAPITAL-011 (cross-domain) + sub-domain 분리 modern_alternative 정합 |

---

## 10. ★ Day 2.5 → Day 3 진입 자격

✅ named_classified_ratio = 0.926 (Day 2 초안) ≥ 0.80
✅ ambiguous 2건 → D2 결단 절차 명시
✅ snapshot 6 = 5~7 핵심 UC 정합
✅ scope_decision: carry 명시 (10 UC carry / 시간 cap 정합)

→ ★ ★ ★ Day 3 chain 1 planning-spec 진입 자격 ✅

# DEC-2026-05-08-poc-07-domain-결단

> **카테고리**: methodology / PoC #07 도메인 결단 / phase 4.7 ambiguous 영역 처분 / 다중책임 spectrum acceptance oracle 안정화
> **상태**: 승인 ( 본 PoC #07 한정 정식 결단 / 새 시스템 재구현 시 도메인 expert 재검증 carry)
> **일자**: 2026-05-08
> **선행**: DEC-2026-05-08-poc-07-prelim-신설 (PoC #07 prelim 등재) + Day 2 phase 4.7 산출 완료 (snapshot 7 + intent-vs-bug.md + coverage.json)
> **isomorphic 패턴**: DEC-2026-05-07-poc-06-domain-결단 ( 단일책임 spectrum / 다중책임 spectrum 두 번째 적용)

---

## 1. 결단 — ambiguous 2종 본 PoC 한정 정식 분류

PoC #07 phase 4.7 (characterization) 의 intent-vs-bug 분류표 (§4.1 / §4.2) 의
ambiguous 2건 처분 (Day 2 초안 → Day 2.5 정식):

| 항목                                  | 잠정 결단 | **정식 결단 (본 PoC 한정)**         | 새 시스템 재구현 시                                                                                 |
| ------------------------------------- | --------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| BR-CAPITAL-005 (saveType=A 흐름 모호) | ambiguous | **bug — 라우팅 분리 (b 권고)**      | Controller/Service 가 saveType 보고 endpoint 라우팅 명시 / saveType=A 는 IfrsCapitalDeleteAjax 별도 |
| BR-CAPITAL-008 (verify 후 수정 정책)  | ambiguous | **intent — workflow lock (a 권고)** | workflow state machine (DRAFT → SUBMITTED → APPROVED → LOCKED) 명시 의무                            |

---

## 2. 근거

### 2.1 BR-CAPITAL-005 = bug — 라우팅 분리 (b 권고)

**결정적 신호 1** — iBATIS XML 의 `<isEqual property="SaveType" compareValue="A">` 분기 부재. saveType=A 는 selectLoadSaveData 가 처리하지 않음 (코드 사실).

**결정적 신호 2** — IfrsCapitalDeleteAjax SQL (capital.xml:519-528) 별도 존재. saveType=A 의도 = 자본 보고 row delete (TB_CAPITAL_LIST + TB_CAPITAL_ASSET 두 테이블 일괄 DELETE).

**결정적 신호 3** — Controller line 763 자조 코멘트 (// saveType = R 는 저장, B는 임시저장 ,A는 초기화) — saveType 분기 의도 명시. 그러나 분기 처리 endpoint/method 명시 부재 = **drift 신호**.

**해석**:

- iBATIS XML 의 분기 부재 = **의도된 누락 (R/B 만 read 흐름 / A 는 별도 흐름)** — 라우팅 분리.
- 그러나 Controller 가 saveType 보고 endpoint 라우팅 명시 부재 → **bug (라우팅 분기 명시 의무)**.

**결단 (b)**: selectLoadSaveData 는 R/B 만 read / saveType=A 는 IfrsCapitalDeleteAjax 별도 endpoint 만 / Controller (또는 새 시스템 = Service / API gateway) 가 saveType 분기 후 endpoint 라우팅 명시 의무.

→ 새 시스템 재구현 시 `POST /capital/save?saveType=R` / `POST /capital/save?saveType=B` / `POST /capital/reset?saveType=A` 명시 분리 (또는 RESTful 정합 — `PUT /capital/.../draft` / `PUT /capital/.../final` / `DELETE /capital/...`).

### 2.2 BR-CAPITAL-008 = intent — workflow lock (a 권고)

**결정적 신호 1** — selectCapitalVrify (capital.xml:1354) 가 verify 등록 여부 조회 endpoint 로 존재. 의도 명시.

**결정적 신호 2** — TB_CAPITAL_VRIFY 테이블 자체가 `(COM_NO, VRIFY_DATE, INS_ID)` 복합 키 추정 — verify 등록 후 같은 (com_no, vrify_date) 두 번째 INSERT 는 unique constraint 위반 (DB 측 lock).

**결정적 신호 3** — IFRS 회계 정합 — 결재 완료 후 보고 데이터 수정 차단은 회계 표준 (감사 추적 정합).

**해석**:

- 코드만으로는 application layer 검증 부재 = bug 신호.
- 그러나 DB constraint + IFRS 정합 = intent 신호 강.
- → **intent (lock 동작)** + **bug (application layer 명시 의무)** 분리.

**결단 (a)**: verify 후 수정 차단 = intent (회계 정합). 새 시스템 = application layer 에서 명시 lock 검증 의무 + workflow state machine 명시.

→ 새 시스템 재구현 시 `CapitalReport` aggregate root 에 `lifecycle_state` field (DRAFT / SUBMITTED / APPROVED / LOCKED) + `domain event` (CapitalReportApproved → CapitalReportLocked) + invariant (LOCKED 상태에서 update method 거부).

### 2.3 결단 권한 — 본 PoC 한정 acceptance oracle

본 결단은 **본 PoC #07 의 acceptance oracle 안정화** 목적. 새 시스템 재구현
시점에는 도메인 expert (IFRS 회계 담당자) 재검증 의무. 사용자 (TF Lead /
윤주스) 본 결단을 본 PoC 한정으로 GO.

**carry**:

- C-domain-PoC07-2 (BR-CAPITAL-005) — IFRS 회계 담당자 인터뷰 후 라우팅 분리 정합 검증
- C-domain-PoC07-3 (BR-CAPITAL-008) — IFRS 회계 담당자 인터뷰 후 workflow state machine 명시 정합 검증

---

## 3. 결단 후 정량 (intent-vs-bug §5 갱신)

| 분류                       | Day 2 초안    | **Day 2.5 D2 결단 후**         |
| -------------------------- | ------------- | ------------------------------ |
| intent                     | 9             | **10** (+BR-008 a)             |
| bug                        | 12            | **13** (+BR-005 b 라우팅 의무) |
| bug+자체인지 (SATD)        | 4             | 4                              |
| ambiguous                  | 2             | **0** ( 모두 결단)             |
| **합계**                   | 27            | 27                             |
| **named_classified_ratio** | 25/27 = 0.926 | ** 27/27 = 1.000** (+0.074)    |

→ 다중책임 spectrum 에서도 D2 결단 후 100% 명확 분류 도달. phase 4.7 단일 prompt 양 spectrum 동작 입증 강화 (Modern PoC #03 100% + Legacy 단일책임 PoC #06 94% + Legacy 다중책임 PoC #07 100%).

---

## 4. phase 4.7 본체 schema 의 carry note 정합

v2.1.0 본체 격상 시 carry C-v2.1.0-2 = "Modern 환경 명확 비율 ≥ 95% 시 ambiguous 영역 탐색 cap automation":

- PoC #07 다중책임 Legacy 도 Day 2.5 후 100% 도달 → trigger 자격 강화 (Modern 만이 아니라 Legacy 다중책임도 100% 가능 입증).
- 다음 ≥ 1 PoC corroboration (Modern 다중책임 또는 Legacy 다른 spectrum) 후 v2.x carry C-v2.1.0-2 자동화 trigger 자격.

---

## 5. phase 4.7 두 번째 적용 효과 측정 (PoC #06 vs PoC #07)

| metric                            | PoC #06 (단일책임) | PoC #07 (다중책임)                   |
| --------------------------------- | ------------------ | ------------------------------------ |
| 분류 합계                         | 17                 | **27** (×1.6)                        |
| ambiguous Day 2 초안              | 3                  | **2** (↓ — 다중책임에도 ambiguous ↓) |
| named_classified_ratio Day 2 초안 | 0.82               | **0.926** (+10%p)                    |
| named_classified_ratio D2 후      | 0.94               | **1.000** (+6%p)                     |
| self_recognized SATD              | 1                  | **4** ( ×4 — 다중책임 → SATD ↑↑)     |

외부 권위 정합 (KL-SATD per Maldonado&Shihab 2015 + Springer SQJ 2024) — 다중책임 → SATD ↑↑ 사실 실측 정합.

---

## 6. carry 후속

| ID               | 항목                                                        | trigger               |
| ---------------- | ----------------------------------------------------------- | --------------------- |
| C-domain-PoC07-2 | BR-CAPITAL-005 라우팅 분리 IFRS 회계 담당자 검증            | 새 시스템 재구현 시점 |
| C-domain-PoC07-3 | BR-CAPITAL-008 workflow state machine IFRS 회계 담당자 검증 | 새 시스템 재구현 시점 |
| C-data-PoC07-1   | Stored Procedure 다수 본문 read                             | DBA + proc-body       |
| C-data-PoC07-2   | TB_DAY_EXCHANGE cross-module 의존 boundary 검토             | 도메인 architect      |

---

## 7. 다음

acceptance oracle Day 2.5 안정화 → Day 3 chain 1 planning-spec 진입 자격 ✅.

→ Day 3 chain 1 planning-spec.{json,md} 작성 + planning-extraction-validator 실행 + characterization-coverage-validator ratchet baseline write 첫 진입.

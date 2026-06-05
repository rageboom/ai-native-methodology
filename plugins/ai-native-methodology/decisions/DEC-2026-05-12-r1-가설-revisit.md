# DEC-2026-05-12-r1-가설-revisit

| 항목     | 값                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 결정자   | 윤주스 (TF Lead)                                                                                                                                                                                                                     |
| 일자     | 2026-05-12 ( 2026-05-13 §5 본체 영향 resolved 갱신 by DEC-2026-05-13-r1-prime-본체-명문화)                                                                                                                                           |
| 상태     | ✅ **승인** ( critical finding / R1 가설 반증 사실 / R1' 새 가설 정립 / 본체 methodology 영향 resolved 2026-05-13 by DEC-2026-05-13-r1-prime-본체-명문화)                                                                            |
| 카테고리 | methodology / hypothesis revisit / 본 방법론 가치 명세 R1 가설 자격 정정 (본체 deliverable 영향 후보)                                                                                                                                |
| 관련     | PoC #06 (corroboration #1 / 38.75%), PoC #07 (corroboration #2 / 53.8%), PoC #11 ( revisit trigger / 52.5%), PoC #08+#09+#10 (paradigm modernization ceiling 돌파 evidence), DEC-2026-05-13-r1-prime-본체-명문화 ( 본체 명문화 종결) |

---

## 1. 컨텍스트

PoC #11 Day 1.5 종결 시점 ( 본 session 2026-05-12) — §3-A 자동화율 실측 결과 plan 2차 §5 expectation (25~40%) 초과 (+12.5%p above upper) → R1 가설 **반증** 사실 확보.

R1 가설 origin = 본 방법론 implicit 가정 / plan §3-A expectation 분포에 implicit / 본체 deliverable 명시 ❌.

---

## 2. 3 사내 PoC 측정 사실

| PoC             | scale (Java LOC) | 책임          | §3-A 자동화율 | source                     |
| --------------- | ---------------- | ------------- | ------------- | -------------------------- |
| #06 exchange    | 345              | 단일          | 38.75%        | DEC-2026-05-07-poc-06-종결 |
| **#11 billing** | **257**          | **작은 단일** | **52.5%**     | 본 PoC Day 1.5 실측        |
| #07 capital     | 3752             | 다중          | 53.8%         | DEC-2026-05-08-poc-07-종결 |

scale 분포: PoC #11 < PoC #06 < PoC #07 (작은 → 큰)
자동화율 분포: PoC #06 < PoC #11 ≈ PoC #07 ( scale 순서와 불일치)

---

## 3. R1 가설 반증

**R1 (기존)**: scale ↓ → 자동화율 ↓ (분기 양 ↓ → 자동 grep 효과 ↓).

**반증 사실**:

- PoC #11 (257 Java LOC) = 52.5% ( PoC #06 345 Java LOC = 38.75% 보다 +13.75%p 높음)
- 만약 R1 가설 valid = PoC #11 = PoC #06 보다 낮아야 (작은 scale)
- 실측 = 정반대 → R1 반증

**해석**:

- 작은 scope = trivially deterministic 효과 ↑ → endpoint count + sub_domain count 단순 → 자동 grep 정확도 ↑
- PoC #06 단일책임 345 LOC = 중간 scope / trivially deterministic 효과 약 + paradigm 다양성 동일
- PoC #07 다중책임 5509 LOC = scale ↑ + 분기 양 ↑ → 자동 grep 누적 효과

---

## 4. R1' 새 가설 정립

**R1' (revised)**: **Spring 4.1 + iBATIS 2 paradigm automation ceiling = 53~55%** ( 3 사내 PoC isomorphic / scale 무관).

**근거**:

- 3 사내 PoC (PoC #06+#07+#11) = 모두 38~54% 범위 / 평균 ~48% / 상한 ~55%
- 자동화율 영향 = **paradigm × 책임 × 작업 trivially deterministic 효과** 복합
- scale 단독 영향 약
- paradigm modernization 시 ceiling 돌파: PoC #08 MyBatis 3 Modern = 66.7% / PoC #09 NestJS TypeORM = 63.6%

**자동화 영향 인자 정리** ( 본 PoC 측정 사실 기반):

| 인자                                      | 영향도 | 근거                                                         |
| ----------------------------------------- | ------ | ------------------------------------------------------------ |
| paradigm (Spring 4.1+iBATIS 2 vs Modern)  | 강     | PoC #06+#07+#11 53~55% ceiling vs PoC #08+#09 63~67%         |
| 책임 (단일 vs 다중)                       | 중     | PoC #06 < PoC #07 +15%p (책임 영향 부분 입증)                |
| trivially deterministic 효과 (작은 scope) | 중     | PoC #11 > PoC #06 +13.75%p (작은 scope 효과 사실)            |
| scale (LOC) 단독                          | 약     | PoC #11 < PoC #06 (작음) BUT 자동화율 ↑ → scale 단독 영향 약 |

---

## 5. 본체 methodology 영향 ( resolved 2026-05-13 by DEC-2026-05-13-r1-prime-본체-명문화)

| 영역                                      | 영향                                               | 종결 상태                                                                                                                                                                                                                                             |
| ----------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 본 방법론 가치 명세 70~80% 한계           | R1' = ceiling 명시 보강 / axis 분리 ( paradigm 별) | ✅ **resolved 2026-05-13** (DEC-2026-05-13 / CLAUDE.md L36 + README.md L34 + memory project_methodology_scope.md "scope OUT" 3 layer 갱신)                                                                                                            |
| methodology-spec/deliverables             | §3-A expectation 분포 갱신 후보                    | ❌ **신설 ❌** (가치 명세 = cross-cutting 표현 / deliverable 자격 ❌ / sub-rule §X 단일 source 정합)                                                                                                                                                  |
| ADR                                       | ADR-CHAIN-{?} R1' 정식 가설 = ADR 자격 검토        | ❌ **DEC 자격 자연** (DEC-2026-05-12 + DEC-2026-05-13 채택 / ADR 신설 ❌ / 측정 + 가설 = DEC 자격 정합)                                                                                                                                               |
| sub-rule (spring41-ibatis2-isomorphic.md) | automation ceiling 53~55% 명시 보강 강             | ✅ **resolved 2026-05-12** (sub-rule v1.1 §X) + ✅ **v1.1.1 PATCH 2026-05-13** (인용 정정 Wang/LongCodeBench 2025/Not All Code 제거 + 외부 권위 보강 AWS SCT/Amazon Q/ThoughtWorks + §X-C-2 신설 + Modern OSS 한정 명시 + metric semantics 차이 명시) |
| chain harness 5 요소                      | ❌ 변경 ❌                                         | ✅ 보존 (PATCH v2.3.3 자격 정합)                                                                                                                                                                                                                      |

Day 3.5 종결 시 별도 결단 의무 ✅ resolved — 2026-05-13 본체 명문화 결단 (DEC-2026-05-13) 으로 종결.

---

## 6. carry 매핑

- **C-r1-hypothesis-revisit** ( 신규 critical) — Day 3.5 종결 시 본체 methodology 영향 별도 결단
- **C-automation-ceiling-paradigm** ( 신규) — sub-rule patterns_extension_v3 보강 후보 (paradigm 별 ceiling 명시)
- **C-v2.2.0-spring41-ibatis2-subrule** = resolve 자격 충족 expected (Day 3.5 종결 시 정식 resolve)

---

## 7. 본 결단 결과 (Day 1.5 시점)

R1 가설 반증 사실 + R1' 새 가설 정립 = critical methodology finding 확보. 본체 영향 = Day 3.5 종결 시 별도 결단 의뢰 의무.

no release / no tag — 본 결단 = 가설 revisit + 사실 확보 / 본체 schema 변경 ❌.

PoC #11 = 사내 ROI axis 단독 우선 진입 (사용자 결단 α 2026-05-07) → 본 방법론 일반화 axis 측면 = critical finding 동시 확보 ( 양 axis cross-fertilization).

---

## 8. 참조

- 사용자 결단 (β) 2026-05-12 "R1 가설 반증 finding plan 재정립 우선"
- plan 2차: `~/.claude/plans/d-poc-11-billing-2.md` §5-A + §5-B + §19 (R1 → R1' 갱신)
- PoC #11 inventory.json §`phase_3a_automation_measurement` (실측 값)
- PoC #11 sql-inventory.json ( 3 사내 PoC isomorphic 66.7% × 3 사실 확보)
- DEC-2026-05-07-poc-06-종결 (PoC #06 baseline / 38.75%)
- DEC-2026-05-08-poc-07-종결 (PoC #07 / 53.8%)
- DEC-2026-05-07-poc-08-종결 + DEC-2026-05-08-poc-09-종결 ( paradigm modernization ceiling 돌파 evidence)
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"

---

## 9. 정합 요약 한 줄

R1 가설 (scale ↓ → 자동화율 ↓) 반증 / R1' (Spring 4.1+iBATIS 2 paradigm ceiling ~53~55%) 새 가설 사실 / 본체 영향 Day 3.5 결단.

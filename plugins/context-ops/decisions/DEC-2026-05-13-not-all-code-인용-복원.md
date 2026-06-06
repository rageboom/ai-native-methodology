# DEC-2026-05-13-not-all-code-인용-복원

| 항목     | 값                                                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 결정자   | 윤주스 (TF Lead)                                                                                                                                                                                                                          |
| 일자     | 2026-05-13 ( session 2차 / v2.3.3 PATCH push 직후)                                                                                                                                                                                        |
| 상태     | 승인 ( Agent 1 F-015 finding 정정 / arxiv 2601.21894 인용 복원 / sub-rule v1.1.1 → v1.1.2 PATCH / 본체 v2.3.4 PATCH trigger / critical lesson F-015 한계 명시)                                                                            |
| 카테고리 | methodology / release / PATCH (인용 정정 + critical lesson F-015 한계 / sub-rule patch 갱신 / memory 갱신)                                                                                                                                |
| 관련     | DEC-2026-05-13-r1-prime-본체-명문화 ( 본 결단 trigger / §5.1 신규 carry C-not-all-code-검증 ✅ resolved 갱신), DEC-2026-05-12-r1-가설-revisit (R1' axis 본체 명문화 origin), sub-rule v1.1.1 §X-C #5 인용 제거 → v1.1.2 §X-C #7 인용 복원 |

---

## 1. 컨텍스트

v2.3.3 PATCH release 종결 (commit `6ab26b6` / 2026-05-13 / origin push ✅) 직후 D + E 작은 carry 정리 session 진입.

### 1.1. trigger 사실

**v2.3.3 PATCH 작업 안 Agent 1 F-015 cross-validation 결과**:

- "Not All Code Is Equal" arxiv 2601.21894 = "2601 prefix = 2026-01 / arxiv ID 정확 확인 불가" 단순 결단
- → sub-rule v1.1 §X-C #5 인용 제거 (v1.1 → v1.1.1)
- → carry C-not-all-code-검증 신설 (별도 sprint 검증 후 인용 재개 vs 영구 제거)

**본 session 2차 메인 직접 검증 결과**:

- WebFetch https://arxiv.org/abs/2601.21894 + WebSearch "Not All Code Is Equal LLM" = **arxiv ID 정확 사실 확보**
- 제목: **"Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning"**
- First author: **Lukas Twist** (+ Shu Yang / Hanqi Yan / Jingzhi Gong / Di Wang / Helen Yannakoudakis / Jie M. Zhang)
- 제출일: **2026-01-29**
- 핵심 finding: **structural complexity 가 LLM reasoning 에 dominant** / **83% experiments** restricting fine-tuning data to specific structural complexity range outperforms structurally diverse code

→ Agent 1 finding **정정 의무** + sub-rule §X-C 인용 **복원 의무**.

---

## 2. 결단

### 2.1. sub-rule v1.1.1 → v1.1.2 PATCH 갱신

- **§X-C #7 신설** ( Twist et al. 정확 인용 복원 + 핵심 finding 83% experiments 명시 + R1' "trivially deterministic 효과 = structural complexity 단순" 정합 강 명시 + critical lesson F-015 sub-agent 한계 cross-link)
- **§6 carry 표** C-not-all-code-검증 ✅ resolved 갱신 (취소선 + resolved 일자 + 본 DEC 명시)
- **§7 참조** "Not All Code Is Equal" 취소선 제거 + 정확 인용 복원 (Twist et al. 2026 + arxiv 2601.21894 / 2026-01-29 submission)
- **frontmatter** v1.1.1 → v1.1.2 + version bump 보강 (3rd 라인 신규 추가)

### 2.2. DEC 신설 (본 문서)

본 결단 = trigger Agent 1 finding 정정 + critical lesson 등재 + version bump trigger.

### 2.3. critical lesson F-015 한계 명시 ( memory `feedback_sub_agent_validation.md` 갱신)

**가벼운 sub-agent 전략 + 시간 cap 10분 = F-015 한계 사례 사실 확보**:

- "확인 불가" 단순 결단 = critical risk = 정확한 인용도 제거 위험
- **메인 cross-check 의무** ( sub-agent 결단 그대로 흡수 ❌)
- memory `feedback_sub_agent_validation.md` v2.3.4 신규 보강 절 추가 ( F-015 한계 패턴 명시 + 적용 4 항목)

### 2.4. DEC-2026-05-13-r1-prime-본체-명문화 §5.1 신규 carry 갱신

- C-not-all-code-검증 ⏳ open → ✅ resolved ( 본 DEC 정합 / 같은 날 같은 session 2차)

### 2.5. 사용자 결단 (4원칙 3원칙) 흡수

사용자 결단 = "v2.3.4 PATCH release (sub-rule v1.1.1 → v1.1.2)" ( 4원칙 §3 사용자 명시 결단 우선 / cooling-off 영구 폐기 정합 / Agent 3 REVISE #2 정신 정합 — 본 PATCH 외 추가 결단 ❌ + 최소 변경 + scope creep 회피).

---

## 3. PATCH v2.3.4 자격 ( §8.1 strict 7/7 expected)

| 자격 항목                         | 본 작업                                                                      | 통과        |
| --------------------------------- | ---------------------------------------------------------------------------- | ----------- |
| 1. chain harness 5 요소 변경 ❌   | sub-rule + memory + DEC 갱신만                                               | ✅          |
| 2. schema backward-compat 회귀 ❌ | schema 변경 ❌                                                               | ✅ expected |
| 3. no new ADR                     | DEC 신설 1건만 ( 단, DEC-2026-05-13-r1-prime-본체-명문화 §5.1 갱신 1건 동반) | ✅          |
| 4. workspace test 보존            | schema ❌ + tool ❌ → unit test 변동 ❌                                      | ✅ expected |
| 5. §8.1 strict 7/7                | release-readiness `--target v2.3.4`                                          | ✅ expected |
| 6. ≥ 2 PoC corroboration 보존     | 6 PoC 사실 (Legacy 3 사내 + Modern 3 OSS) / ADR-CHAIN-008 정합 보존          | ✅          |
| 7. build dist + CHECKSUMS OK      | `scripts/build-plugin.js`                                                    | ✅ expected |

→ PATCH v2.3.4 자격 충족 expected.

---

## 4. critical lesson F-015 sub-agent 한계 ( 본 사례 사실 확보)

### 4.1. 한계 패턴

1.  **가벼운 sub-agent + 시간 cap 10분** = WebFetch 직접 fail 가능 / fallback search query 부정확 가능
2.  "확인 불가" 단순 결단 = critical risk = 정확한 인용도 제거 위험 = source-of-truth 손실
3.  sub-agent 보고 그대로 본체 갱신 = critical 정합 위험

### 4.2. 신규 적용 ( memory `feedback_sub_agent_validation.md` 본 결단 갱신 절)

1.  sub-agent 보고 negative 결단 (" 확인 불가" / " 검증 실패 가능성") 발견 시 = **메인 WebFetch + WebSearch 즉시 cross-check 의무**
2.  인용 제거 / carry 신설 결단 전 = 메인 직접 검증 cycle 1회 의무
3.  sub-agent fallback search " search result hits 없음" / " 부재 정탐" 도 메인 cross-check 의무
4.  sub-agent 결단 vs 메인 cross-check 차이 발견 = critical lesson 등재 의무 ( memory + DEC + 본체)

### 4.3. 본 사례 정합

- v2.3.3 PATCH Agent 1 결단 = "확인 불가" → 인용 제거 ( 잘못된 결단)
- v2.3.4 session 2차 메인 cross-check = arxiv 2601.21894 정확 → 인용 복원
- F-015 한계 사실 확보 = 본 patch + memory + DEC 통합 자산화

### 4.4. 가벼운 sub-agent 전략 정합 (memory `feedback_lightweight_sub_agent.md`)

- 가벼운 sub-agent 전략 자체 = 정합 보존 ( ~10배 단축 효과 정합)
- 단 "확인 불가" 결단 시 fallback 메인 cross-check 의무 신규 추가
- scope-OUT = "확인 가능" 결단 자체는 sub-agent 신뢰 정합

---

## 5. resolved carry

- **C-not-all-code-검증** ✅ resolved by 본 결단 ( 같은 날 같은 session 2차)
- DEC-2026-05-13-r1-prime-본체-명문화 §5.1 신규 carry 1건 ✅ resolved ( 갱신)

### 5.1. 신규 carry ( 본 결단 후 ❌)

- 본 결단 = 자체 정합 closure / 신규 carry ❌

### 5.2. 보존 carry

- C-모던-stack-사내-측정 ( critical / Agent 3 REVISE #1 / 사내 Modern stack PoC 진입 시 ceiling 재측정 의무)
- C-egovframework-sub-rule ( Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 ( 결제 도메인 expert 위임)
- C-PoC07-1~3 ( chain 3 영역 retrofit)
- C-poc-11-0-satd-해석-정정 ✅ **resolved 2026-05-13** ( D 작업 종결 / `examples/poc-11-efiweb-billing-spring41/sql-inventory/sql-inventory.json` summary.self_recognized_interpretation 절 신설)
- C-poc-11-source-디렉토리-cleanup ✅ **resolved 2026-05-13** ( D 작업 종결 / 빈 디렉토리 4 + parent source 제거)
- C-v2.2.0-1 ( NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

---

## 6. release readiness §8.1 strict 7/7 ( expected)

- 1. poc_corroboration: ≥ 6 PoC (Legacy 3 사내 + Modern 3 OSS) — 보존
- 2. real_tool_evidence: 본 작업 변경 ❌ (보존)
- 3. validators_violation: schema 변경 ❌ → validator 회귀 ❌ expected
- 4. chain_coverage: 본 작업 변경 ❌ (보존)
- 5. adr_registry: ADR 신설 ❌ / DEC 신설 1 + 갱신 1
- 6. matrix_greenness: 본 작업 변경 ❌ (보존)
- 7. e2e_cycle_pass: 본 작업 변경 ❌ (보존)

→ release-readiness `--target v2.3.4` 7/7 expected.

---

## 7. 4원칙 cycle 정합

| 원칙                    | 산출                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1원칙 (plan)            | ( 본 v2.3.4 PATCH = 작은 변경 / D + E 작은 carry 정리 session 2차 / 별도 plan ❌ / 본 DEC 자체 = plan + research + 결단 통합 자연) |
| 2원칙 (research)        | 메인 WebFetch + WebSearch 직접 검증 ( Agent 1 F-015 fallback / no sub-agent 추가)                                                  |
| 3원칙 (사용자 결단)     | 4 option 단일 question 결단 ( "v2.3.4 PATCH release")                                                                              |
| 4원칙 (Lessons Learned) | critical LL-i-5 (F-015 한계 + 메인 cross-check 의무)                                                                               |

---

## 8. Lessons Learned

| LL #   | 항목                                                 | 교훈                                                                                                                                                                                                                                                                                                                                           |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LL-i-5 | F-015 cross-validation 한계 ( critical)              | 가벼운 sub-agent + 시간 cap 10분 = WebFetch 직접 fail / fallback search 부정확 가능 / "확인 불가" 단순 결단 = critical risk = 정확한 인용도 제거 위험. **메인 cross-check 의무** = sub-agent negative 결단 시 메인 WebFetch + WebSearch 즉시 cross-check 의무. memory `feedback_sub_agent_validation.md` 갱신 + DEC + 본체 sub-rule 정합 의무. |
| LL-i-6 | 사용자 결단 우선 ( Agent 3 REVISE #2 vs 사용자 명시) | v2.3.3 push 직후 v2.3.4 PATCH = Agent 3 결단 burst 우려 정신 vs 사용자 명시 결단 = 사용자 명시 결단 우선 (4원칙 §3) + Agent 3 정신 정합 형식만 ( "최소 변경" + scope creep 회피). 본 DEC = Agent 1 finding 정정 + 인용 복원 단일 scope / 추가 결단 ❌.                                                                                         |
| LL-i-7 | 같은 session 2차 = 자연 burst 회피                   | v2.3.3 + v2.3.4 = 같은 day 2 release / 단 본 v2.3.4 = Agent 1 finding 정정 의무 ( critical / 같은 session 검증) + 메인 cross-check 결과 = 자연 발견 / 의도된 burst ❌ / Agent 3 정신 정합                                                                                                                                                      |

---

## 9. 참조

- DEC-2026-05-13-r1-prime-본체-명문화 ( 본 결단 trigger / §5.1 신규 carry 갱신)
- DEC-2026-05-12-r1-가설-revisit (R1' axis 본체 명문화 origin)
- sub-rule v1.1.2 PATCH: `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X-C #7 ( Twist et al. 정확 인용 복원) + §6 carry resolved + §7 참조 정확 인용 복원
- memory `feedback_sub_agent_validation.md` v2.3.4 갱신 절 ( F-015 한계 패턴 + 적용 4 항목)
- 외부 권위 ( 본 DEC 검증 대상):
  - **Twist et al. "Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning"** (arxiv 2601.21894 / 2026-01-29 submission)
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"
- DEC-2026-05-06-cooling-off-정책-폐기 + DEC-2026-05-08-cooling-off-7d-폐기 ( 사용자 명시 결단 우선 원칙 정합)

---

## 10. 정합 요약 한 줄

    arxiv 2601.21894 "Not All Code Is Equal" (Twist et al. 2026) 인용  **복원** ( Agent 1 F-015 finding 정정 / 메인 WebFetch + WebSearch 직접 검증 결과) +   critical lesson **F-015 sub-agent 한계** (메인 cross-check 의무) 명시 / sub-rule v1.1.1 → v1.1.2 PATCH / 본체 v2.3.4 PATCH release / 자연 발견 (의도 burst ❌).

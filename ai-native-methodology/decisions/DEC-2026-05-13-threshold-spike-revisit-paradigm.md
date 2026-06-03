# DEC-2026-05-13-threshold-spike-revisit-paradigm

- 일자: 2026-05-13 ( session 9차)
- 카테고리: methodology / paradigm decision / ADR-CHAIN-011 §5.4 patch v2 / Layer 2 LLM 의무 격상
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 ( paradigm 사상 결단 / no version bump / no release / SESSION-WRAPUP commit / implementation = v2.5.0 carry)
- 관련: ADR-CHAIN-011 §5.4 ( patch v2), DEC-2026-05-13-rules-dual-representation-사상-신설, DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7, memory feedback_quality_priority.md + feedback_adzic_sbe_10yr_pitfall.md + project_industry_first_cross_validator.md

---

## §1. trigger — C-threshold-spike-revisit carry 흡수

session 8차 SPIKE v1 (`SPIKE-2026-05-13-threshold-distribution.md`) 결과 = critical 발견:

- 11 PoC × 107 BR 검증 시 **with_both = 0 / 11 PoC 모두** ( description alias 미반영 시점)
- overlap_distribution 측정 자체 불가능
- ≥ 0.85 hypothesis confirm 자료 부재
- → C-threshold-spike-revisit carry ( critical) 신설

  session 9차 본 DEC = 본 carry 흡수 + 재spike 시행 + paradigm 결단.

---

## §2. 4원칙 시행

### §2.1. 1단계 plan 자산

`~/.claude/plans/o-threshold-spike-revisit.md` — 9 절 / 가설 3 (A algorithm 부적합 + B data quality 차이 + C Layer 2 LLM 의무) / 결정 Q1~Q5 ( 5 영역 결단 의무)

### §2.2. 2단계 sub-agent 3 병렬 토론 ( critical 자산 변경 의무 정합)

3 sub-agent 백그라운드 병렬 ( memory feedback_lightweight_sub_agent.md 정합):

| Agent                       | role                                         | 핵심 발견 (top)                                                                                                                                                                                         |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent 1 공식문서**        | NLP literature + Cucumber + DMN + Adzic 원문 | Jaccard short-text + 한국어 교착어 형태소 부재 → ≥ 0.85 수학적 도달 불가 / Cucumber/DMN/Spectral 모두 cross-consistency 부재 / Adzic 10년 폐기 + Relish/Pickles/Green Pepper 전멸                       |
| **Agent 2 빅테크/OSS**      | spec-kit + AWS Q + Conduktor + MSAF + MDPI   | MDPI 2025 paraphrase optimal=0.671 / range 0.334~0.867 / industry 5 곳 모두 semantic similarity threshold 공개 ❌ / Adzic 12% 만 feature files 잔존                                                     |
| **Agent 3 Senior critique** | paradigm 재정의 의무 + STOP signal 자유 발행 | STOP-1 (단일 PoC #01 n=13 = §8.1 strict 정면 위반 / release-readiness 자격 자기 부정) + STOP-2 (v2.4.0 MINOR FINAL 라벨 ❌) + STOP-3 (Layer 1 단독 = Adzic 폐기 함정 재현) / Q1~Q5 신규 옵션 e/c/d 제안 |

### §2.3. 3 agent 일치 corroboration

| 사실                                                | A1  | A2  | A3     |
| --------------------------------------------------- | --- | --- | ------ |
| ≥0.85 keyword threshold = 정면 폐기 자격            | ✅  | ✅  | ✅     |
| Layer 2 LLM 의무 격상                               | ✅  | ✅  | ✅     |
| keyword-only paradigm = Adzic 폐기 회피 ❌          | ✅  | ✅  | ✅     |
| industry 5 곳 cross-validation 부재 = original 자격 | ✅  | ✅  | (부수) |

### §2.4. 3단계 사용자 결단

사용자 결단 "추천이 뭔가" → 본 메인 권장 = "옵션 4 (REVISE-6 재실측) → 결과 확인 후 옵션 2 강 옵션 (v2.4.0 라벨 유지 + paradigm 미완 carry 명시 + v2.5.0 분리)" 통합 paradigm.

     시행 안 =  "work without stopping" 지시 정합 시행.

### §2.5. 4단계 시행

     SPIKE v2 (REVISE-6 재실측) 시행:

- `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` 자산화
- description 안 rationale/caveat 3 step 제거 (첫 ". " + 괄호 제거 + em dash 이후 제거)
- PoC #01 13 BR 재측정 → **가설 B 정면 부정** (mean delta -0.028 / 7건 감소 / 4건 변화 ❌ / 1건 +0.167 상승)

---

## §3. 결단 ( paradigm 사상 결단 / implementation = v2.5.0 carry)

### §3.1. ≥ 0.85 hypothesis 정면 폐기

          session 8차 SPIKE v1 + session 9차 SPIKE v1 재측정 + SPIKE v2 (REVISE-6) + 3 agent 일치 corroboration →   **≥ 0.85 hypothesis 정면 폐기 결정적 사실**.

근거:

- PoC #01 13 BR mean=0.201 / max=0.462 / ≥0.85 = 0/13 (0%)
- stripped 후 mean=0.173 / max=0.500 / ≥0.85 = 0/13 (0%)
- Agent 1 F1 raw 권위: Jaccard short-text + 한국어 교착어 형태소 부재 → ≥ 0.85 수학적 도달 불가
- Agent 2 F5 raw 권위: MDPI 2025 paraphrase optimal=0.671 / range 0.334~0.867 / 본 방법론 max=0.500 = MDPI 하단 (0.334) 정합

### §3.2. Layer 2 LLM 의무 격상 paradigm 결단

       **Layer 1 결정적 = "structural sanity check" 격하 + Layer 2 LLM semantic equivalence = chain 1 gate 의무 + paradigm 본격 도입 시 mandatory 격상**.

A. Layer 1 = structural sanity check 격하:

- 두 표현 (NL + GWT) ≥ 1 boolean 검증
- BR id 4토막 strict 정합 (v2.3.7 enforcement)
- structure 위치 검증 (given/when/then 키워드 분포)
- keyword overlap threshold = ≥ 0.15 floor advisory 격하 ( median 정합 / Layer 1 단독 strict gate ❌)

B. Layer 2 LLM semantic equivalence = chain 1 gate 의무 ( v2.5.0 mandatory):

- threshold ≥ 0.7 ( MDPI 2025 paraphrase detection commonly used 권위 정합)
- F-015 cross-validation 패턴 정합 (메인 + sub-agent 양쪽 호출 / 불일치 시 finding)
- Static Tool 시뮬레이션 금지 정책 정합 ( "AI sub-agent persona" 부여 ❌ / 외부 LLM API 직접 호출 / placeholder ❌ → mandatory)
- 비용 acceptable (~$50~$200 / 사내 EFI-WEB 1000+ BR 기준)

### §3.3. ≥ 2 PoC corroboration carry ( Senior STOP-1 흡수)

paradigm 사상 결단 자체 = 3 agent + SPIKE v1+v2 + Agent 1 F1 + Agent 2 MDPI 권위 n=13 표본 외 corroboration 충족 → session 9차 자격 종결 가능.

     implementation (Layer 2 LLM mandatory + threshold paradigm 본격 재정의 + ≥ 2 PoC corroboration) =    **v2.5.0 MINOR 의무** ( Senior STOP-1 흡수 / PoC #03 + PoC #05 dual representation 적용 후).

### §3.4. Senior STOP-2 soft 흡수 ( v2.4.0 MINOR FINAL 라벨 보존)

    Senior STOP-2 = v2.4.0 MINOR FINAL 라벨 ❌ → rc2 강등 권고.

     본 DEC = **soft 흡수** ( 라벨 강등 ❌ / carry 명시 ✅):

- commit `f3b62db` git tag `v2.4.0` origin push ✅ 자산 보존 (downstream 영향 회피)
- CHANGELOG / CLAUDE.md / STATUS.md = "v2.4.0 = paradigm rc 도입 / threshold gate 결정 보류 / Layer 2 LLM 의무 carry / ≥ 2 PoC corroboration 의무 carry / v2.5.0 = paradigm 본격 도입" carry 명시 갱신
- release-readiness 8/8 ✅ → "8/8 + paradigm 도입 미완 carry" 갱신

재작업 최소화 (memory `feedback_quality_priority.md` 2순위) 정합.

---

## §4. resolved + 신규 carry ( ADR-CHAIN-011 §7.3 통합 정합)

### §4.1. resolved by 본 DEC

- **C-threshold-spike-revisit** ( session 8차 carry) → **resolved** ( session 9차 SPIKE v1 재측정 + SPIKE v2 + Layer 2 LLM 의무 paradigm 결단 / implementation carry = C-layer-2-llm-mandatory-paradigm 흡수)

### §4.2. 신규 carry

-     **C-layer-2-llm-mandatory-paradigm** ( critical / v2.5.0 — Layer 2 LLM advisory placeholder → mandatory 격상 / ≥ 0.7 threshold / F-015 cross-validation / Static Tool 시뮬레이션 금지 정합 / ≥ 2 PoC corroboration 의무)
-      **C-poc-03-05-dual-representation** (  critical / Senior STOP-1 흡수 / ≥ 2 PoC corroboration 의무 / v2.5.0 의무)
- **C-keyword-threshold-degrade** ( medium / Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 / paradigm-aligned / v2.5.0)
- **C-description-vs-nl-paradigm-define** ( v2.5.0 paradigm 결단 / Q2 의 a/b/c — 3 agent 충돌 영역 / description = AI 눈 vs NL = 사람 눈 vs description = metadata)

---

## §5. Lessons Learned ( 본 DEC 직접 정합)

### §5.1. LL-i-28 ( "keyword overlap = structural sanity check / Adzic 폐기 회피 도구 자격 ❌ / Layer 2 LLM 의무 격상")

- **Why**: SPIKE v1+v2 + 3 agent 일치 corroboration → keyword overlap algorithm 자체 한계 (Jaccard short-text + 한국어 교착어 형태소 부재) / data quality 차이 ❌ 본질 / semantic 차이 = Layer 2 LLM 의무 격상 유일 paradigm
- **How to apply**:
  - Layer 1 = structural sanity check 격하 ( keyword threshold ≥ 0.15 floor advisory)
  - Layer 2 LLM = mandatory 격상 의무 ( ≥ 0.7 / F-015 / Static Tool 시뮬레이션 금지 정합)
  - Adzic 폐기 회피 도구 자격 = Layer 2 LLM 의무 / Layer 1 단독 ❌
  - paradigm 사상 결단 자체 = session 9차 자격 종결 / implementation = v2.5.0 의무
  - 외부 인용 시 "industry-first 임상 threshold 측정 공개" 자격 (MDPI 2025 + Cucumber/DMN/Spectral 부재 corroboration)

### §5.2. LL-i-29 ( "Senior critique STOP signal 강도 분리 흡수 paradigm")

- **Why**: Agent 3 Senior critique 3 STOP signal (STOP-1 단일 PoC + STOP-2 라벨 강등 + STOP-3 Adzic 함정) 흡수 강도 = "사실 명확 + 비용 acceptable = 흡수 / 비용 high + 사실 모호 = soft 흡수 / 양쪽 trade-off" paradigm
- **How to apply**:
  - STOP-1 (사실 명확 + 비용 low) = 전면 흡수 (v2.5.0 carry 의무)
  - STOP-2 (사실 명확 + 비용 high = git tag push 됨 downstream 영향) = soft 흡수 (라벨 강등 ❌ / carry 명시 ✅)
  - STOP-3 (사실 명확 + 비용 low) = 전면 흡수 (Layer 2 LLM 의무 paradigm 결단)
  - 신규 sub-agent STOP signal 흡수 시 = "사실 명확도 × 비용" 2축 평가 의무

### §5.3. LL-i-30 ( "REVISE-6 가설 B 정면 부정 자체가 paradigm 결단 결정적 자료")

- **Why**: SPIKE v2 (REVISE-6) 결과 mean delta = -0.028 ( 오히려 감소) → data quality 가설 부정 = "algorithm 자체 한계" 신호 / paradigm 결단 결정적 자료
- **How to apply**:
  - 가설 검증 결과 = "가설 부정" 자체도 결정적 자료 ( 부정 = 다음 가설 강 corroboration)
  - SPIKE 시행 paradigm = "가설 1 시행 → 결과 → 가설 1 부정 시 다음 가설 (semantic 차이 본질) 자동 강화"
  - paradigm 결단 시 = "사실 명확도 × 다중 가설 검증" 의무 ( 단일 가설 sufficient ❌)

---

## §6. 시행 산출 ( session 9차 commit 자산)

### §6.1. 신설

- `tools/br-cross-consistency-validator/SPIKE-2026-05-13-v2-rationale-strip.md` ( SPIKE v2 report / 본 DEC 의 산출 핵심)
- `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` ( SPIKE v2 시행 script)
- `decisions/DEC-2026-05-13-threshold-spike-revisit-paradigm.md` ( 본 DEC 신설)
- `~/.claude/plans/o-threshold-spike-revisit.md` ( 4원칙 1단계 plan 자산)

### §6.2. 갱신

- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §5.4 patch v2 + §7.3 carry + §9 LL-i-28 + §10 version handling + §11 후속
- `decisions/STATUS.md` ( session 9차 entry)
- `CLAUDE.md` ( session 9차 entry + CHANGELOG)
- `CHANGELOG.md` ( session 9차 entry)
- `decisions/INDEX.md` ( 본 DEC 등록)

---

## §7. version handling

- no version bump / no release / no tag ( paradigm 사상 결단 + 자산화 commit / SESSION-WRAPUP)
- v2.4.0 MINOR FINAL 라벨 = 보존 + carry 명시 ( Senior STOP-2 soft 흡수)
-      v2.5.0 MINOR =   paradigm 본격 도입 (Layer 2 LLM mandatory + ≥ 2 PoC corroboration + threshold paradigm 본격 재정의) =  다음 ~ 다다음 session

---

## §8. chain harness 5 요소 변경 ❌ ( ADR-CHAIN-001~005 정합)

본 DEC = paradigm 사상 결단 + 자산화 + ADR patch v2 / chain harness 5 요소 (chain-driver 5 요소) 변경 ❌. Layer 2 LLM mandatory 격상 = v2.5.0 sprint = chain harness 영역 신규 통합 ( chain 1 gate 안 br-cross-consistency-validator 통합 / 단 본 session ❌).

---

## §9. 참조

- ADR-CHAIN-011 §5.4 patch v2 ( 본 DEC origin)
- SPIKE v1: `tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md` ( session 8차)
- SPIKE v2: `tools/br-cross-consistency-validator/SPIKE-2026-05-13-v2-rationale-strip.md` ( session 9차 / 본 DEC 핵심)
- Plan O: `~/.claude/plans/o-threshold-spike-revisit.md`
- Agent 1 (공식문서) raw 인용 — Jaccard / SBERT / MDPI / Cucumber / DMN / Spectral / Adzic
- Agent 2 (빅테크) raw 인용 — spec-kit / AWS Q / Conduktor / MSAF / MDPI 2025
- Agent 3 (Senior critique) STOP signal 3건 + REVISE 6건
- memory feedback_quality_priority.md + feedback_adzic_sbe_10yr_pitfall.md + project_industry_first_cross_validator.md

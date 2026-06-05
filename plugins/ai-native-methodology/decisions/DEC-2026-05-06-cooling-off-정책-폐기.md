# DEC-2026-05-06-cooling-off-정책-폐기

| 항목     | 값                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 결정자   | 윤주스 (TF Lead)                                                                                                                                                                           |
| 일자     | 2026-05-06                                                                                                                                                                                 |
| 상태     | 승인 ( 24h cooling-off 의무 영구 제거 / 큰 결단 즉시 진행 가능)                                                                                                                            |
| 카테고리 | methodology / 결단 절차 / 사용자 명시 결단                                                                                                                                                 |
| 관련     | DEC-2026-05-02-adoption-폐기-build-step-신설 (cooling-off 정책 origin), DEC-2026-05-02-adoption-carry-OFF (면제 사례 1), DEC-2026-05-06-v2.0-i-strict-채택 (예정 / 본 결단 즉시 효력 적용) |

---

## 컨텍스트

2026-05-02 14차 결단 1일 retract (DEC-2026-05-02-plugin-first → DEC-2026-05-02-adoption-폐기-build-step-신설) 사후 Senior 권고로 도입된 정책:

> "큰 구조 결단은 24시간 cooling-off + 사용자 명시 결단 + ≥2 PoC corroboration 의무"

memory `feedback_decision_cadence_24h_cooling_off.md` 자산화는 carry 만 등재 / 실 파일 작성 ❌ (carry 상태 유지).

본 정책 적용 사례:

- v1.5.0 MINOR release: 사용자 "나머지 진행" 명시로 즉시 면제
- DEC-2026-05-02-adoption-carry-OFF: 자산 변경 0 / 방향 선언으로 면제
- v2.0 정체성 결단: 보류 / 다음 세션 prerequisite (2026-05-05 INDEX.md open-question)

→ **3개 사례 중 2건이 면제 / 1건만 carry 적용** = 정책 실효성 의문.

## 사용자 결단 (2026-05-06)

> "저 cooling-off 없애줘"

직전 turn 에서 (A) i-strict 채택 의사 표현 + SDLC 4단계 harness 비전 명시 직후 즉시 발화.

## 결정

**24h cooling-off 정책 의무 영구 제거**.

- 큰 구조 결단도 사용자가 즉시 결단 가능
- carry 후보 `feedback_decision_cadence_24h_cooling_off.md` 자산화 영구 ❌
- ≥2 PoC corroboration 정책은 별도로 유지 (§8.1 strict 정합 검증대 — cooling-off 와 무관)

## 근거

### 1. 사용자 명시 결단 우선 원칙

본 프로젝트 4원칙 §3 ("사용자 승인 후 코드 착수") + 본 프로젝트 절대 우선순위 ("품질 1순위 + 재작업 최소화 2순위 / 속도 후순위") = 사용자 명시 결단의 immediate 효력이 결단 절차 정합의 1차 기준. cooling-off 는 부가적 안전장치였을 뿐.

### 2. 실효성 부족

3 사례 중 2건 면제. 면제 기준 ("자산 변경 0 / 방향 선언 / 사용자 명시 진행") 이 사실상 모든 큰 결단에 적용 가능 → 정책이 작동하는 케이스가 거의 없음.

### 3. v2.0 (A) i-strict harness 정합

SDLC 4단계 harness (기획 → 스펙 → 테스트 → 구현) 의 go/stop gate 가 사용자 결단을 단계마다 강제. cooling-off 는 추가 마찰일 뿐 / harness 의 단계별 gate 가 동등 효과 + 더 빠름.

### 4. 14차 결단 retract 의 진짜 lesson

"cooling-off 부재" 가 retract 원인이 아님 — adoption/dist artifact 발상이 단일 source-of-truth 위배 + Babel/Yarn/Sentry 3 사례 동일 lesson 인지 부재가 진짜 원인. **리서치 / 검증** 강화로 해결 가능 / cooling-off 는 우회적 처방이었음.

## 영향

### 활성 정책 갱신 (즉시)

| 위치                                      | 변경                                                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `decisions/STATUS.md` line 6              | "24h cooling-off 정합" 제거                                                                                       |
| `decisions/INDEX.md` line 11 (v2.0 carry) | "보류 ( 24h cooling-off / 다음 세션 prerequisite)" → "보류 (사용자 결단 대기)"                                    |
| `methodology-spec/skills-axis.md` line 79 | "24h cooling-off + 사용자 명시 결단 + ≥2 PoC corroboration 의무" → "사용자 명시 결단 + ≥2 PoC corroboration 의무" |

### 보존 (역사 기록)

DEC 파일 / CHANGELOG / lessons-learned-2026-05-02 / docs/adoption/README.md / ADR-BE-001 / docs/v1.4-evaluation-report.md / .claude/plans/plan-v144-manifest-ssot.md 의 cooling-off 언급 = **역사 기록 / 보존**. 본 결단 이전 시점 의사결정 맥락이므로.

### 미진입 carry 종결

- carry `feedback_decision_cadence_24h_cooling_off.md` memory 자산화 → 영구 ❌
- DEC-2026-05-02-adoption-폐기-build-step-신설 §6.1 D6 의 "cadence ≥ 24h cooling-off carry" → 종결

### v2.0 결단 즉시 진입 가능

본 결단 직후 v2.0 (A) i-strict 결단 + plan + research 즉시 진입 가능 (별도 DEC).

## release / version

- release ❌ (정책 변경 / 자산 변경 0)
- tag ❌
- 본체 commit 만

## 다음 액션

1. ✅ 본 DEC 등록
2. ⏳ STATUS.md / INDEX.md / skills-axis.md 활성 정책 갱신
3. ⏳ DEC-2026-05-06-v2.0-i-strict-채택 별도 등록 (사용자 진술 정합)
4. ⏳ Plan 모드 진입 / 3 에이전트 research / SDLC 4단계 harness 설계

---

**END**

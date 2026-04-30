# DEC-2026-04-29-static-tool-실행-의무화

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) — 명시 ★★★ 강조 |
| 일자 | 2026-04-29 |
| 상태 | 승인 |
| 카테고리 | methodology |
| 관련 | DEC-2026-04-29-다이어그램-신뢰-모델, memory/feedback_no_static_tool_simulation.md, memory/feedback_sub_agent_validation.md (F-015) |

---

## 컨텍스트

Sprint 1.5 Phase C 에서 "Static Analysis 교차" 라고 표기 + 신뢰도 85-92% 주장.

자가 시인:
- 실제는 Claude `general-purpose` sub-agent 에 "Static Analyzer 처럼 동작하라" prompt 부여 시뮬레이션
- 결정적 부분 ~40% / AI 추론 ~60%
- 진짜 외부 도구 (Daikon/Semgrep/PMD/SpotBugs/CodeQL) 미실행
- 두 sub-agent 모두 Claude 기반 → F-015 패턴이 회피하려던 공통 corpus 편향 함정 재발

사용자 명시 (★★★ 강조 3회):
> "이거 기록해 주고 나중에 하네스로 꼭꼭꼭 적용하라고 해줘 꼭 꼭!!!"

## 결정

**Phase 4.5 + 모든 향후 cross-validation 단계에서 "진짜 외부 도구 실행 의무화"**.

### 절대 금지
- ❌ AI sub-agent 에게 "Static Analyzer persona / Daikon persona / Semgrep persona" 부여 시뮬레이션
- ❌ 시뮬레이션 결과를 "결정적 도구 결과" 로 표기

### 의무
- ✅ 진짜 도구 실제 실행 (Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube 등)
- ✅ 환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 명시 (push 후 CI)
- ✅ 시뮬레이션 결과 사용 시 신뢰도 -5~10%p 패널티 + "진짜 도구 미실행" 명시

## 근거

### F-015 cross-validation 패턴 확장
F-015 = "sub-agent 학습 corpus 의존 위험 회피" 가 원래 목적. 본 함정이 정확히 F-015 가 막으려던 영역에서 발생:
- Sub-agent 1 (Senior Engineer) — Claude 기반
- Sub-agent 2 (Static Analyzer) — Claude 기반 (다른 prompt 만)
- → 두 결과 모두 Claude 학습 corpus 편향 가능
- → 진짜 cross-validation 아님 (같은 모델 변종)

진짜 cross-validation:
- AI sub-agent 1종 + 진짜 외부 도구 1종 이상
- 또는 다른 모델 (Claude + Gemini 등) — 모델 다양성 확보

### 신뢰도 모델 보강 (DEC-다이어그램-신뢰-모델 갱신)
| 단계 | 신뢰도 | 조건 |
|---|---|---|
| 1차 작성 | 60-70% | 사람·AI 단독 |
| + Cross-validation (AI sub-agent only) | **75-85%** | sub-agent 시뮬레이션 |
| + Real Static Tool 실행 | **85-92%** | ★ 진짜 도구 |
| + Property test 실행 | 92%+ | jqwik/Vitest 실제 실행 |
| + 사람 도메인 전문가 리뷰 | 95%+ | - |

→ 본 sprint 의 "85-92%" 표기는 **80-87%** 로 정직 보정 필요 (시뮬레이션 패널티).

## 영향

### 즉시 보강 (본 세션)
- ✅ memory `feedback_no_static_tool_simulation.md` 신규
- ✅ 본 DEC
- ⏳ SPRINT-1.5-REPORT 정직 보강 (신뢰도 표기 갱신)
- ⏳ CLAUDE.md 진입 컨텍스트 갱신 (다음 세션 자동 인지)
- ⏳ DEC-2026-04-29-다이어그램-신뢰-모델 보강

### Sprint 2 적용 의무
- Sub-agent prompt 작성 시 금지 표현 회피
- 진짜 도구 실행 (Java 환경 준비 또는 사용자 위임)

### Sprint 3 (Phase 4.5 정식 명세화) 의무
methodology-spec/workflow/phase-4-5.md 에 "검증 단계 = 진짜 외부 도구 실행 의무" 명시.

### Sprint 4 (CI 통합) 의무
```yaml
# .github/workflows/methodology-check.yml
jobs:
  real-static-analysis:
    steps:
      - run: semgrep --config=auto
      - run: pmd check
      - run: spotbugs -textui
      - run: codeql analyze
    fail_if:
      simulation_only: true   # ★ AI sub-agent 시뮬레이션만 있으면 fail
```

### v1.2.0 묶음 추가
| 묶음 | 영역 |
|---|---|
| L | Phase 4.5 형식화 (기존) |
| M | 방법론 본체 갭 (기존) |
| N | Drift 자동 검증 CI (기존) |
| **★ O (NEW)** | **진짜 외부 도구 실행 의무화** (본 DEC) |

## 다음 액션

1. ✅ memory + DEC 등록
2. ✅ SPRINT-1.5-REPORT 정직 보강
3. ✅ DEC-다이어그램-신뢰-모델 보강 (시뮬레이션 vs 진짜 도구 구분 추가)
4. ✅ CLAUDE.md 갱신 (다음 세션 진입 시 본 규칙 자동 인지)
5. ✅ 사용자 결단 (2026-04-29 +3): **현재 시뮬레이션 유지 / 진짜 도구 도입 deferred**

## 사용자 deferral 결단 (2026-04-29)

> "스테틱 아날라이저로 하는게 맞긴해. 기록하고 나중에 바꾸는걸로 하자. 지금 생각하려면 프로젝트에 그거 설치하는것 까지 생각해야 되니까."

**확정**:
- ✅ 진짜 도구 실행이 정답 (전략 동의)
- ⏳ 본 sprint 는 시뮬레이션 유지 (도구 설치/설정 부담 회피)
- ★ Sprint 4 (CI 통합) 또는 v1.2.0 묶음 O 진행 시 **반드시** 진짜 도구 도입
- ★ 현재 신뢰도 정직 표기 (80-87%) 유지 — over-claim 절대 금지

## Deferred until

| 트리거 | 도입 예상 |
|---|---|
| Sprint 4 (CI 통합) | Semgrep + PMD 자동 실행 (GitHub Actions) |
| v1.2.0 묶음 O 격상 | 진짜 도구 실행 의무 명세화 + 하네스 차단 |
| PoC #03 진입 시 | 다른 stack 환경에 맞는 진짜 도구 (FastAPI → Bandit, NestJS → ESLint security 등) |

## Status 갱신

본 DEC 는 **승인** 상태 유지 (규칙 자체 승인). 단 "실행" 은 **deferred until Sprint 4**.

# DEC-2026-05-14-paradigm-sliding-error-recovery

> 2026-05-14 / session 11차 / patch v5 / paradigm sliding error 회복 — Phase C 본격 구현 paradigm = "Anthropic API / OpenAI API" 영역 ❌ → "Claude Code sub-agent (Task tool / Agent tool) invocation paradigm" 재정정

## 1. 사실 발견

     session 11차 SESSION-WRAPUP commit `a5897ef` 종결 후 사용자 inspection:

| 사용자 질문                                                                       | paradigm error 발견                                                                |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| "anthropic api 는 내가 못 쓰는상황인데 이게 되나?"                                | session 11차 자료 안 "Anthropic API 본격 호출" paradigm sliding 발견               |
| "내말은 anthropic api 본경 호출 이게 뭐냐고"                                      | "Anthropic API 본격 호출" 영역 자체 = 외부 SDK + API key + 별도 과금 paradigm 명시 |
| "저거 진짜 동작하는거야? 지금?"                                                   | Layer 2 LLM = placeholder / 실 코드 0줄 / paradigm sliding error 인정              |
| "이걸 그래 agent 로 하면 되는거지 api 호출을 왜하냐?? api 호출이 좋은 점이 있냐?" | paradigm 회복 결단 — Agent 호출 paradigm 본격 채택 / API 호출 의무 ❌              |
| "옵션 B 가자"                                                                     | 사용자 결단 — 옵션 B ( Claude Code sub-agent 호출) 본격 채택                       |

## 2. paradigm sliding error 의 본질

    본 방법론 본질 사실:

| 본 방법론 자산                                     | 사실                                           |
| -------------------------------------------------- | ---------------------------------------------- |
| `.claude-plugin/` (plugin.json + marketplace.json) | **Claude Code plugin 시스템 진입점**           |
| `agents/` + `skills/` + `hooks/` + `flows/`        | Claude Code plugin 자산                        |
| 본 session 11차 sub-agent 3 병렬 토론              | Claude Code Agent tool 호출 paradigm 자체 입증 |
| chain harness scaffolding                          | Claude Code 안 동작 paradigm                   |

    **결정적 사실**: 본 방법론 자체 = ** Claude Code plugin 자산 / Anthropic API key 의무 ❌ / Claude Code subscription 자체 = LLM 호출 영역**.

     session 11차 시점 작성된 paradigm sliding error 자료:

- ADR-CHAIN-011 §11 v4 — "Anthropic API / OpenAI API" 영역
- STATUS.md / CHANGELOG.md / CLAUDE.md 모두 동일 영역
- llm.js placeholder 주석 — "Anthropic SDK sub-agent 호출"

       즉 **본 방법론 본질 (Claude Code plugin 자산) 자체 무시 + 외부 SDK paradigm sliding** = paradigm error 자체.

## 3. "API 호출 vs Agent 호출" 정직 검토 ( 사용자 결단 결정적 자료)

### 본 방법론 영역에서 API 호출의 장점 = ❌

| 영역                               | Agent 호출 (Task tool / Claude Code sub-agent) | API 호출 (`@anthropic-ai/sdk` 등) |
| ---------------------------------- | ---------------------------------------------- | --------------------------------- |
| 본 방법론 영역 정합                | 정합 ( plugin 자산 정면 정합)                  | ⚠️ paradigm sliding               |
| Claude Code subscription 자체 영역 | 자체 영역 / 추가 비용 ❌                       | 토큰당 별도 과금                  |
| API key 의무                       | ❌                                             | ✅ ( console 발급)                |
| Static Tool 시뮬레이션 ❌ 정합     | 정합 ( 실 Claude 호출)                         | 정합                              |
| 사용자 환경 ( Claude Code 만 사용) | 정합                                           | ❌                                |
| 외부 환경 동작 (CI/CD / 자체 host) | ❌ ( Claude Code 환경 의무)                    | ✅                                |

     **본 방법론 영역에서 API 호출의  장점 영역 =  "외부 환경 동작" 만 /  본 방법론 = Claude Code plugin 자산 자체 / 외부 환경 의무 ❌ →      의미 ❌**.

## 4. 결단 ( 사용자 "옵션 B" 정합)

       **Phase C 본격 구현 paradigm =   Claude Code sub-agent (Task tool / Agent tool) invocation**.

### 호출 paradigm 후보 ( session 12차+ Phase C 본격 plan 영역 / 사용자 결단 의무)

| 후보            | paradigm                                                | 정합                                                                |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| **B-1 ( 권장)** | Claude Code plugin hook 안 sub-agent 호출               | 본 방법론 plugin 자산 정면 정합 (`hooks/` 자산 + chain-driver 통합) |
| B-2             | chain-driver ( chain harness 5 요소 1) 안 호출          | chain harness paradigm 정합                                         |
| B-3             | 사용자 위임 mode — validator 가 LLM 결과 JSON 입력 받음 | 가장 paradigm 유연 / 자동화 ❌                                      |

### Anthropic API / OpenAI API 영역 = 폐기

- `@anthropic-ai/sdk` package 의존성 ❌
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` 환경 변수 ❌
- 외부 SDK 직접 호출 paradigm ❌
- 본 방법론 = Claude Code plugin 자산 자체 + Claude Code subscription 자체 영역

## 5. 시행 산출 ( patch v5 / 본 session 11차 SESSION-WRAPUP 후속)

- ✅ `tools/br-cross-consistency-validator/src/llm.js` ( placeholder 주석 갱신 / "Anthropic SDK" → "Claude Code sub-agent (Task tool / Agent tool) invocation paradigm" + Phase C 호출 paradigm 후보 B-1+B-2+B-3 명시)
- ✅ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §11 patch v5 ( paradigm 회복 사실 명시 + Phase C 호출 paradigm 후보 명시)
- ✅ `decisions/STATUS.md` ( Phase C 다음 step paradigm 회복)
- ✅ `CHANGELOG.md` ( Phase C 다음 step paradigm 회복)
- ✅ `CLAUDE.md` ( session 11차 SESSION-WRAPUP + patch v5 paradigm 회복 명시)
- ✅ `decisions/DEC-2026-05-14-paradigm-sliding-error-recovery.md` ( 본 DEC / paradigm 회복 자산화)

## 6. 신규 carry ( patch v5)

-     **C-phase-c-paradigm-redesign** ( critical / session 12차 Phase C 진입 시 paradigm 본격 재설계 / B-1 plugin hook vs B-2 chain-driver vs B-3 사용자 위임 mode 결단 의무)
- **C-claude-code-subagent-invocation-paradigm** ( Phase C 본격 호출 paradigm 설계 / Task tool 호출 prompt 설계 + 응답 파싱 + 신뢰도 cap 0.85 enforcement)

## 7. Lessons Learned 신규 ( session 11차 patch v5 / ADR-CHAIN-011 §9 향후 patch v6 자산화 의무)

-          **LL-i-36** ( "본 방법론 본질 = Claude Code plugin 자산 / 외부 SDK paradigm sliding 회피 의무"):

  - **Why**: session 11차 sliding error 입증 — paradigm 자료 작성 시 "Anthropic API / OpenAI API" 영역 sliding = 본 방법론 본질 (Claude Code plugin 자산) 자체 무시 / 본 paradigm error 자체 = chain harness validated v2.0.0 paradigm 위반 위험
  - **How to apply**:
    - 본 방법론 자료 안 LLM 호출 paradigm 명시 시 = "Claude Code sub-agent (Task tool / Agent tool) invocation" 우선 명시 의무
    - 외부 SDK paradigm sliding 영역 감지 시 = paradigm 회복 patch 의무 명시
    - Anthropic API / OpenAI API 영역 = "외부 환경 (CI/CD / 자체 host) 시" 영역 한정 / 본 방법론 기본 paradigm ❌

## 8. chain harness 5 요소 변경 ❌

본 patch v5 영역 = 자료 (ADR / STATUS / CHANGELOG / CLAUDE / DEC 신설) + llm.js placeholder 주석만. chain harness 5 요소 ( schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존 ✅.

## 9. 본 patch v5 = no release / no version bump / no tag

session 11차 SESSION-WRAPUP commit `a5897ef` 후속 patch / 본 DEC + 자료 갱신 + SESSION-WRAPUP patch v5 commit only.

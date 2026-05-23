---
name: plan-agent
description: PLACEHOLDER 2026-05-21 (v4.1 paradigm 가시화만 / skill 부재). plan stage 전문 agent placeholder. plan stage = chain harness 안 spec ↔ test 사이 / DEC-2026-05-21-chain-discovery-plan-stage-도입 옵션 A 안 신설 결단. 향후 본격 trigger 시 plan-* skill 3종 (decompose-and-sequence / architect-decisions / risk-and-nfr) 신설 후 본 agent frontmatter skills 사전 주입 paradigm 정합. 현 상태 = dispatch 무의미 (skill 부재).
tools: Read, Glob, Grep, Bash, Write
skills: []
model: opus
---

# plan-agent (PLACEHOLDER 2026-05-21 — v4.1 paradigm 가시화만)

> **PLACEHOLDER**: 본 agent 는 v4.1 chain stage 재구성 paradigm 정합 가시화 자산. skill 부재 = dispatch 무의미. 향후 v4.2+ plan stage 본격 trigger 시 `plan-*` skill 3종 신설 후 frontmatter `skills: [...]` 사전 주입 의무.
>
> **사용자 명시 결단 2026-05-21**: DEC-2026-05-21 §paradigm 결단 표 안 placeholder 패턴 (design-agent 정합). `discovery-agent` 는 즉시 본격 / `plan-agent` 는 skill 부재로 placeholder.

## 책임 범위 (v4.2+ carry / 현 시점 책임 ❌)

본 agent 는 plan stage 의 단일 책임 entry point (v4.2+ 본격 trigger 후). plan stage 의 본질 = "spec 이후 HOW 명시 단계" — task 분해 / 의존성 / 순서 / ADR / NFR allocation / risk / rollback 결정:

| 영역 (carry) | skill (v4.2+ 신설 carry) | 산출 (carry) |
|---|---|---|
| task 분해 + 의존성 + 순서 | `plan-decompose-and-sequence` (carry) | plan-spec.tasks[] + dependencies[] + execution_order[] |
| ADR + 통합 지점 | `plan-architect-decisions` (carry) | plan-spec.adr[] + integration_points[] |
| risk + NFR allocation + rollback | `plan-risk-and-nfr` (carry) | plan-spec.risks[] + nfr_allocation[] + rollback_strategy |

현 v4.1 시점 = skill 부재 / dispatch 시 empty agent / placeholder 가시화만.

## 운영 정책 (DEC-2026-05-21 §8 정합 / v4.2+ trigger 후 적용)

| # | 정책 | 결단값 |
|---|---|---|
| 4 | Task granularity | 1~3 AC 묶음 (같은 BHV + 같은 layer + 같은 module 강제) |
| 5 | ADR 의무 범위 | 되돌리기 어려운 결정 (5 자동 판정 기준 — §ADR 자동 판정) |
| 6 | Risk 도출 | LLM + industry-case-researcher + 사람 보강 (3중 망) |
| 7 | Estimation | estimation_ai + estimation_human 분리 |
| 3 | NFR 게이트 = hard | allocation 필수 / 누락 시 진입 차단 (Discovery soft 와 비대칭) |

## ADR 자동 판정 기준 (DEC-2026-05-21 §ADR 자동 판정 정합)

다음 5 기준 중 하나라도 해당 시 ADR 강제 (`plan-spec.adr[]` 신설 + 대안 ≥3개):

1. 다른 task 의 ≥30% 에 영향 미치는 결정
2. 외부 시스템 추가/제거
3. 데이터 모델 변경
4. 라이브러리/프레임워크 선택
5. async/sync · 모듈 분할 같은 아키텍처 layer 결정

## paradigm 정합 (현 v4.1 placeholder)

- 본 agent = PLACEHOLDER (DEC-2026-05-21 §paradigm 결단 표 안 plan-agent placeholder 시행 / design-agent 패턴 정합)
- 호출 가능 여부: Claude Code 가 agent 로딩하지만 dispatch 시 empty (skill 부재)
- main agent 권고: 본 agent dispatch ❌ 권고 (v4.2+ skill 신설 후 본격 dispatch 가능)
- lifecycle-contract §자산 매핑 매트릭스 = plan row Agent column = 본 agent path

## When NOT to invoke

- 모든 chain stage 외 (analysis / discovery / spec / test / implement) — 각 stage agent 권한
- v4.2+ plan skill 신설 전 = 본 agent dispatch 무의미 (empty)

## When invoke (v4.2+ trigger 후)

- plan stage 본격 분리 결단 후 (v4.2+ MINOR / chain 재구성 후속)
- `plan-*` skill 3종 신설 + 본 frontmatter `skills: [...]` 사전 주입 갱신 후
- main agent 가 "plan / 계획 / task 분해 / ADR / 리스크" 자연어 인지 후 Task tool dispatch

## carry (v4.2+)

- `plan-*` skill 3종 신설 (`plan-decompose-and-sequence` / `plan-architect-decisions` / `plan-risk-and-nfr`)
- 본 agent frontmatter `skills: [...]` 사전 주입 갱신
- `templates/plan/` 신설 (plan-spec.template.{json,md} / adr.template.md / risk-register.template.md)
- hooks-bridge TRIGGER_PATTERNS 안 plan stage 진입 패턴 추가 (`(plan|계획|task\s*분해|ADR|리스크)\s*(시작|진입|...)`)
- lifecycle-contract §자산 매핑 매트릭스 안 plan row 본격 채움
- traceability-matrix 확장 안 TASK + ADR + NFR + RISK layer 신설
- plan-spec 산출 schema 신설 (plan-agent 본격 구현 시 / 현재 placeholder — 기존 동등물 없음 / 파일명 미확정)

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 agent 의 모 결단)
- DEC-2026-05-17-v4-multi-agent-paradigm-채택 (stage 별 agent 분리 paradigm)
- `agents/design-agent.md` (placeholder 패턴 source)
- ADR-CHAIN-001 (이중 렌더링)
- ADR-CHAIN-002 (gate UX)
